import { createContext, useContext, type ReactNode } from 'react';
import { adoptStyles } from './adopt-styles';
import { ensureStyles } from './ensure-styles';

// The active ShadowRoot for the React tree below. `defineMfe` attaches a
// shadow root per custom element and provides it through this context;
// components reach for it via `useScopedStyles` to adopt their CSS into
// the right scope.
export const ShadowRootContext = createContext<ShadowRoot | null>(null);

export interface ShadowRootProviderProps {
  readonly value: ShadowRoot;
  readonly children: ReactNode;
}

export function ShadowRootProvider({ value, children }: ShadowRootProviderProps) {
  return <ShadowRootContext.Provider value={value}>{children}</ShadowRootContext.Provider>;
}

// Idempotent + synchronous, safe to call during render. Inside an MFE
// shadow root, adopts the CSS as a constructable stylesheet on that root.
// Outside a shadow (host shell, jsdom tests) it falls back to a `<style>`
// tag injected into document.head via `ensureStyles`, so shared UI
// components style themselves whether they're rendered in a shadow or not.
export function useScopedStyles(id: string, css: string): void {
  const root = useContext(ShadowRootContext);
  if (root) adoptStyles(root, id, css);
  else ensureStyles(id, css);
}
