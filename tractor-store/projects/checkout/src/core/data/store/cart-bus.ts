import type { NFEventRegistry } from '@softarc/native-federation-orchestrator/registry';
import type { CartLineItemModel } from '../contracts/models/cart-line-item.model';

declare global {
  interface Window {
    __NF_REGISTRY__: NFEventRegistry;
  }
}

/**
 * Stable event name used on `window.__NF_REGISTRY__` to broadcast cart
 * mutations across MFE bundles loaded into the same tab. The host owns the
 * registry; checkout slices loaded by other MFEs share state via this bus.
 */
export const CART_EVENTS = {
  updated: 'cart:updated',
} as const;

export type CartUpdatedPayload = {
  readonly items: readonly CartLineItemModel[];
};

const NOOP_UNSUBSCRIBE = (): void => {};

const tryBus = (): NFEventRegistry | null => {
  if (typeof window === 'undefined') return null;
  return window.__NF_REGISTRY__ ?? null;
};

/** Broadcast a cart mutation to peer CartStore instances. No-op without a bus. */
export const emitCartUpdated = (data: CartUpdatedPayload): void => {
  tryBus()?.emit(CART_EVENTS.updated, data);
};

/**
 * Subscribe to cart mutations from peer MFEs. Returns a no-op unsubscribe
 * when the bus is not available (e.g. SSR or tests without a registry).
 */
export const onCartUpdated = (
  handler: (data: CartUpdatedPayload) => void,
): (() => void) => {
  const reg = tryBus();
  if (!reg) return NOOP_UNSUBSCRIBE;
  return reg.on<CartUpdatedPayload>(CART_EVENTS.updated, ({ data }) =>
    handler(data),
  );
};
