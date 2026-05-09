import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  emitNavigate,
  emitRoute,
  NAV_EVENTS,
  onRegistryReady,
  requireBus,
  tryBus,
} from './nav-bus';

type Handler = (data: unknown) => void;

const fakeRegistry = () => {
  const listeners = new Map<string, Handler[]>();
  const resources = new Map<string, unknown>();
  const readyHandlers = new Map<string, Handler[]>();
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
    onReady: (type: string, cb: Handler) => {
      if (resources.has(type)) {
        cb(resources.get(type));
      } else {
        const arr = readyHandlers.get(type) ?? [];
        arr.push(cb);
        readyHandlers.set(type, arr);
      }
      return () => {};
    },
    emit: (type: string, data: unknown) => {
      for (const cb of listeners.get(type) ?? []) {
        cb({ data, timestamp: Date.now() });
      }
    },
    register: async (type: string, resource: unknown) => {
      resources.set(type, resource);
      for (const cb of readyHandlers.get(type) ?? []) cb(resource);
      readyHandlers.delete(type);
    },
  };
};

describe('nav-bus (shared)', () => {
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

  it('exposes stable event names', () => {
    expect(NAV_EVENTS.navigate).toBe('navigation:navigate');
    expect(NAV_EVENTS.route).toBe('navigation:route');
    expect(NAV_EVENTS.registry).toBe('navigation:registry');
  });

  it('emitNavigate forwards through the bus', () => {
    const bus = tryBus();
    expect(bus).not.toBeNull();
    const seen = vi.fn();
    bus!.on('navigation:navigate', (event) => {
      seen((event as { data: unknown }).data);
    });
    emitNavigate({ id: 'x.y', payload: { id: '1' } });
    expect(seen).toHaveBeenCalledWith({ id: 'x.y', payload: { id: '1' } });
  });

  it('emitRoute forwards through the bus', () => {
    const bus = tryBus();
    const seen = vi.fn();
    bus!.on('navigation:route', (event) => {
      seen((event as { data: unknown }).data);
    });
    emitRoute({ url: '/explore/products' });
    expect(seen).toHaveBeenCalledWith({ url: '/explore/products' });
  });

  it('onRegistryReady fires when the registry is later published', async () => {
    const handler = vi.fn();
    onRegistryReady(handler);
    const fake = { tag: 'registry' } as never;
    await tryBus()!.register('navigation:registry', fake);
    expect(handler).toHaveBeenCalledWith(fake);
  });

  it('onRegistryReady fires immediately when the registry already exists', async () => {
    const fake = { tag: 'registry' } as never;
    await tryBus()!.register('navigation:registry', fake);
    const handler = vi.fn();
    onRegistryReady(handler);
    expect(handler).toHaveBeenCalledWith(fake);
  });

  it('onRegistryReady returns a no-op when the bus is missing', () => {
    (window as unknown as { __NF_REGISTRY__?: unknown }).__NF_REGISTRY__ =
      undefined;
    const handler = vi.fn();
    const unsub = onRegistryReady(handler);
    expect(typeof unsub).toBe('function');
    expect(handler).not.toHaveBeenCalled();
    unsub();
  });

  it('requireBus throws when the bus is missing', () => {
    (window as unknown as { __NF_REGISTRY__?: unknown }).__NF_REGISTRY__ =
      undefined;
    expect(() => requireBus()).toThrow(/__NF_REGISTRY__ is not initialised/);
  });

  it('emitNavigate / emitRoute throw when the bus is missing', () => {
    (window as unknown as { __NF_REGISTRY__?: unknown }).__NF_REGISTRY__ =
      undefined;
    expect(() => emitNavigate({ id: 'x' })).toThrow(/not initialised/);
    expect(() => emitRoute({ url: '/' })).toThrow(/not initialised/);
  });
});
