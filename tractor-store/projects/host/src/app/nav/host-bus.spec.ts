import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { emitNavigate, emitRoute } from '@internal/events';
import {
  type FakeRegistryBus,
  fakeRegistryBus,
} from '../../testing/registry-bus.stub';
import { onNavigate, onRoute, publishRegistry } from './host-bus';

describe('host-bus', () => {
  let original: unknown;

  beforeEach(() => {
    original = (window as unknown as { __NF_REGISTRY__?: unknown })
      .__NF_REGISTRY__;
    (window as unknown as { __NF_REGISTRY__: unknown }).__NF_REGISTRY__ =
      fakeRegistryBus();
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
    const bus = (window as unknown as { __NF_REGISTRY__: FakeRegistryBus })
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
