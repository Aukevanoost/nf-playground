import { tryBus } from './nav-bus';

/**
 * Stable event name for the explore → checkout store-pick handoff.
 * `mfe-store-picker` (explore) emits, `mfe-checkout` (checkout) subscribes.
 * Routed through `window.__NF_REGISTRY__` so the two MFEs do not need a
 * direct DOM-event coupling.
 */
export const STORE_EVENTS = {
  selected: 'store:selected',
} as const;

export type StoreSelectedPayload = {
  readonly id: string;
};

const NOOP_UNSUBSCRIBE = (): void => {};

/** Broadcast a store selection. No-op when the bus is not initialised. */
export const emitStoreSelected = (data: StoreSelectedPayload): void => {
  tryBus()?.emit(STORE_EVENTS.selected, data);
};

/**
 * Subscribe to store-pick events. Returns a no-op unsubscribe when the bus
 * is unavailable (e.g. SSR or tests without a registry).
 */
export const onStoreSelected = (
  handler: (data: StoreSelectedPayload) => void,
): (() => void) => {
  const reg = tryBus();
  if (!reg) return NOOP_UNSUBSCRIBE;
  return reg.on<StoreSelectedPayload>(STORE_EVENTS.selected, ({ data }) =>
    handler(data),
  );
};
