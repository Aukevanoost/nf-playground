import { NFEventRegistry } from '@softarc/native-federation-orchestrator/registry';
import { INavRegistry, NavPayload } from './nav-types';

declare global {
  interface Window {
    __NF_REGISTRY__: NFEventRegistry;
  }
}

/**
 * Stable event names used on `window.__NF_REGISTRY__`. Remotes only ever
 * emit; the host subscribes via host-side helpers (see `host-bus.ts` in the
 * host project).
 */
export const NAV_EVENTS = {
  navigate: 'navigation:navigate',
  route: 'navigation:route',
  registry: 'navigation:registry',
} as const;

export type NavigatePayload = {
  readonly id: string;
  readonly payload?: NavPayload;
};

export type RoutePayload = {
  readonly url: string;
};

const NOOP_UNSUBSCRIBE = (): void => {};

/** Throws if the bus has not been initialised in `main.ts`. */
export const requireBus = (): NFEventRegistry => {
  const reg = window.__NF_REGISTRY__;
  if (!reg) {
    throw new Error(
      '[nav] window.__NF_REGISTRY__ is not initialised — make sure main.ts sets it up before bootstrap',
    );
  }
  return reg;
};

/**
 * Returns the bus if available, or null. Use when subscribing — directives
 * can render before the registry exists; missing the bus should not throw.
 */
export const tryBus = (): NFEventRegistry | null =>
  window.__NF_REGISTRY__ ?? null;

/** Tell the host to navigate to a registered intent. */
export const emitNavigate = (data: NavigatePayload): void =>
  requireBus().emit(NAV_EVENTS.navigate, data);

/** Tell the host to navigate to an explicit URL. */
export const emitRoute = (data: RoutePayload): void =>
  requireBus().emit(NAV_EVENTS.route, data);

/**
 * Resolves once the host has published the navigation registry. Fires
 * immediately if the registry is already available. Returns a no-op
 * unsubscribe when the bus itself is not present.
 */
export const onRegistryReady = (handler: (registry: INavRegistry) => void) => {
  const reg = tryBus();
  if (!reg) return NOOP_UNSUBSCRIBE;
  return reg.onReady<INavRegistry>(NAV_EVENTS.registry, handler);
};
