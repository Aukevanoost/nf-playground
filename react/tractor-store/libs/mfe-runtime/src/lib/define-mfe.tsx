import { StrictMode, type ComponentType } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import type { EnvironmentConfig, LoadRemoteSlice } from '@react-internal/federation';
import type { RouteParams } from '@react-internal/url';
import { ErrorBoundary, ShadowRootProvider, adoptStyles } from '@react-internal/ui';
import {
  ensureRemoteContext,
  RemoteContextProvider,
  type RemoteContextValue,
} from './remote-context';

// Custom elements default to `display: inline`, which collapses block-level
// layout inside the MFE. Adopted into every MFE's shadow root.
const HOST_DISPLAY = ':host { display: block; }';

export interface DefineMfeOptions {
  // Attributes to mirror onto the component as string props.
  readonly observedAttributes?: readonly string[];
}

/**
 * Wraps a React component as a custom element. Returns a bootstrap function for
 * federation's slice loader: `(env, loader) => Promise<void>`.
 *
 * - `ensureRemoteContext` shares one env+loader per remote.
 * - The element listens for `routeParams` property writes from the host and
 *   re-renders. Observed attributes are mirrored onto the component as
 *   string props.
 *
 * `P` is inferred from the component, so call sites keep their own prop
 * shapes. The runtime contract (string-only observed attrs + a `routeParams`
 * value) is not expressible in the constraint without forcing every component
 * to spell out an unused `routeParams?`, so the cast is contained to the
 * single render-site below.
 */
export function defineMfe<P>(
  tag: string,
  Component: ComponentType<P>,
  options: DefineMfeOptions = {},
) {
  const observed = options.observedAttributes ?? [];

  return async function bootstrap(
    env: EnvironmentConfig,
    loader: LoadRemoteSlice,
  ): Promise<void> {
    const ctx = ensureRemoteContext(env, loader);
    // `customElements.define` is irreversible per the platform; a re-mount
    // after HMR with the same tag is short-circuited here and the new
    // component is silently ignored. Acceptable for prod (the tag never
    // changes); a known DX paper-cut during dev iteration.
    if (customElements.get(tag)) return;
    customElements.define(tag, makeElementClass(tag, Component, ctx, observed));
  };
}

function makeElementClass<P>(
  tag: string,
  Component: ComponentType<P>,
  ctx: RemoteContextValue,
  observed: readonly string[],
) {
  return class MfeElement extends HTMLElement {
    static get observedAttributes() {
      return [...observed];
    }

    private root: Root | undefined;
    private shadow: ShadowRoot | undefined;
    private _routeParams: RouteParams = {};

    set routeParams(v: RouteParams) {
      this._routeParams = v ?? {};
      this.render();
    }
    get routeParams(): RouteParams {
      return this._routeParams;
    }

    connectedCallback() {
      if (this.root) return;
      // `attachShadow` is one-shot per element. If the element was previously
      // mounted in this DOM position (Strict-Mode double-effect, hot reload),
      // `this.shadowRoot` is already populated — reuse it.
      const shadow = this.shadowRoot ?? this.attachShadow({ mode: 'open' });
      adoptStyles(shadow, 'mfe-host-display', HOST_DISPLAY);
      const mount = document.createElement('div');
      shadow.appendChild(mount);
      this.shadow = shadow;
      this.root = createRoot(mount);
      this.render();
    }

    disconnectedCallback() {
      // Browser fires this synchronously when the host's RemoteShell does
      // removeChild during effect cleanup, which is mid-commit. Calling
      // root.unmount() on a different root from inside React's commit logs
      // "Attempted to synchronously unmount a root while React was already
      // rendering." Defer to a microtask so React can finish committing.
      const root = this.root;
      const shadow = this.shadow;
      this.root = undefined;
      this.shadow = undefined;
      queueMicrotask(() => {
        root?.unmount();
        // Drain the mount div so a re-attach starts clean (shadowRoot itself
        // sticks to the element per the platform — adopted sheets too).
        if (shadow) while (shadow.firstChild) shadow.removeChild(shadow.firstChild);
      });
    }

    attributeChangedCallback() {
      this.render();
    }

    private collectAttrProps(): Record<string, string> {
      const out: Record<string, string> = {};
      for (const name of observed) {
        const v = this.getAttribute(name);
        if (v !== null) out[name] = v;
      }
      return out;
    }

    private render() {
      if (!this.root || !this.shadow) return;
      // Runtime contract: the host shell promises routeParams + string-only
      // attribute mirrors. TypeScript cannot verify that the component's own
      // prop type matches, so the cast is contained to this one site.
      const props = {
        routeParams: this._routeParams,
        ...this.collectAttrProps(),
      } as unknown as P & JSX.IntrinsicAttributes;
      this.root.render(
        <StrictMode>
          <ErrorBoundary label={tag}>
            <ShadowRootProvider value={this.shadow}>
              <RemoteContextProvider value={ctx}>
                <Component {...props} />
              </RemoteContextProvider>
            </ShadowRootProvider>
          </ErrorBoundary>
        </StrictMode>,
      );
    }
  };
}
