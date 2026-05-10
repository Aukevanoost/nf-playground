import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  emitStoreSelected,
  onStoreSelected,
  STORE_EVENTS,
} from './store-bus';

type Handler = (event: { data: unknown; timestamp: number }) => void;

const fakeRegistry = () => {
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

describe('store-bus', () => {
  let original: unknown;

  beforeEach(() => {
    original = (window as unknown as { __NF_REGISTRY__?: unknown })
      .__NF_REGISTRY__;
    (window as unknown as { __NF_REGISTRY__: unknown }).__NF_REGISTRY__ =
      fakeRegistry();
  });

  afterEach(() => {
    (window as unknown as { __NF_REGISTRY__: unknown }).__NF_REGISTRY__ =
      original;
  });

  it('exposes a stable event name', () => {
    expect(STORE_EVENTS.selected).toBe('store:selected');
  });

  it('emitStoreSelected forwards the payload through the bus', () => {
    const seen = vi.fn();
    onStoreSelected(seen);
    emitStoreSelected({ id: 'berlin' });
    expect(seen).toHaveBeenCalledWith({ id: 'berlin' });
  });

  it('onStoreSelected returns an unsubscribe', () => {
    const seen = vi.fn();
    const off = onStoreSelected(seen);
    off();
    emitStoreSelected({ id: 'berlin' });
    expect(seen).not.toHaveBeenCalled();
  });

  it('emit / on no-op when the bus is missing', () => {
    (window as unknown as { __NF_REGISTRY__?: unknown }).__NF_REGISTRY__ =
      undefined;
    const seen = vi.fn();
    const off = onStoreSelected(seen);
    expect(typeof off).toBe('function');
    expect(() => emitStoreSelected({ id: 'x' })).not.toThrow();
    expect(seen).not.toHaveBeenCalled();
    off();
  });
});
