import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { CART_EVENTS, emitCartUpdated, onCartUpdated } from './cart-bus';

type Handler = (event: { data: unknown; timestamp: number }) => void;

const fakeBus = () => {
  const listeners = new Map<string, Handler[]>();
  return {
    on: (type: string, cb: Handler) => {
      const arr = listeners.get(type) ?? [];
      arr.push(cb);
      listeners.set(type, arr);
      return () => {
        const next = (listeners.get(type) ?? []).filter((h) => h !== cb);
        listeners.set(type, next);
      };
    },
    onReady: () => () => {},
    emit: (type: string, data: unknown) => {
      for (const cb of listeners.get(type) ?? [])
        cb({ data, timestamp: Date.now() });
    },
    register: async () => {},
    clear: () => listeners.clear(),
  };
};

describe('cart-bus', () => {
  let original: unknown;

  beforeEach(() => {
    original = (window as unknown as { __NF_REGISTRY__?: unknown })
      .__NF_REGISTRY__;
    (window as unknown as { __NF_REGISTRY__: unknown }).__NF_REGISTRY__ =
      fakeBus();
  });

  afterEach(() => {
    (window as unknown as { __NF_REGISTRY__: unknown }).__NF_REGISTRY__ =
      original;
  });

  it('exposes a stable event name', () => {
    expect(CART_EVENTS.updated).toBe('cart:updated');
  });

  it('emitCartUpdated forwards the payload through the bus', () => {
    const seen = vi.fn();
    onCartUpdated(seen);
    emitCartUpdated({ items: [{ sku: 'AU-03-RD', quantity: 1 }] });
    expect(seen).toHaveBeenCalledWith({
      items: [{ sku: 'AU-03-RD', quantity: 1 }],
    });
  });

  it('onCartUpdated returns an unsubscribe', () => {
    const seen = vi.fn();
    const off = onCartUpdated(seen);
    off();
    emitCartUpdated({ items: [] });
    expect(seen).not.toHaveBeenCalled();
  });

  it('emit / on no-op when the bus is missing', () => {
    (window as unknown as { __NF_REGISTRY__?: unknown }).__NF_REGISTRY__ =
      undefined;
    const seen = vi.fn();
    const off = onCartUpdated(seen);
    expect(typeof off).toBe('function');
    expect(() => emitCartUpdated({ items: [] })).not.toThrow();
    expect(seen).not.toHaveBeenCalled();
    off();
  });
});
