import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { emitNavigate, emitRoute } from '@internal/navigation';
import { onNavigate, onRoute, publishRegistry } from './host-bus';

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

describe('host-bus', () => {
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

  it('onNavigate receives intents emitted by remotes', () => {
    const handler = vi.fn();
    onNavigate(handler);
    emitNavigate({ id: 'checkout.thanks', payload: { id: '1' } });
    expect(handler).toHaveBeenCalledWith({
      id: 'checkout.thanks',
      payload: { id: '1' },
    });
  });

  it('onRoute receives URL events emitted by remotes', () => {
    const handler = vi.fn();
    onRoute(handler);
    emitRoute({ url: '/explore/products' });
    expect(handler).toHaveBeenCalledWith({ url: '/explore/products' });
  });

  it('publishRegistry resolves listeners that subscribed before publish', async () => {
    const handler = vi.fn();
    // simulate a remote listening before the host publishes
    const bus = (window as unknown as { __NF_REGISTRY__: ReturnType<typeof fakeRegistry> })
      .__NF_REGISTRY__;
    bus.onReady('navigation:registry', handler);
    const fake = { tag: 'registry' } as never;
    await publishRegistry(fake);
    expect(handler).toHaveBeenCalledWith(fake);
  });

  it('onNavigate / onRoute return no-op when the bus is missing', () => {
    (window as unknown as { __NF_REGISTRY__?: unknown }).__NF_REGISTRY__ =
      undefined;
    const a = onNavigate(() => {});
    const b = onRoute(() => {});
    expect(typeof a).toBe('function');
    expect(typeof b).toBe('function');
    a();
    b();
  });

  it('publishRegistry throws when the bus is missing', () => {
    (window as unknown as { __NF_REGISTRY__?: unknown }).__NF_REGISTRY__ =
      undefined;
    expect(() => publishRegistry({} as never)).toThrow(/not initialised/);
  });
});
