import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { NativeFederationResult } from '@softarc/native-federation-orchestrator';
import type { INavRegistry } from '@internal/events';
import {
  type BusFakes,
  fakeBus,
} from '../../testing/bus.stub';
import {
  decideContribution,
  exploreContribution,
} from '../../testing/nav-contribution.fixture';
import {
  fakeNf,
  fakeNfByRemote,
} from '../../testing/native-federation.stub';
import { testManifest } from '../../testing/manifest.fixture';
import {
  type FakeRouter,
  fakeRouter,
} from '../../testing/router.stub';
import { NavRegistry } from './nav-registry';
import { setupShellNavigation } from './setup-shell-nav';

describe('setupShellNavigation', () => {
  let router: FakeRouter;
  let registry: NavRegistry;
  let bus: BusFakes;
  let publishRegistry: ReturnType<
    typeof vi.fn<(r: INavRegistry) => Promise<void>>
  >;

  beforeEach(() => {
    router = fakeRouter();
    registry = new NavRegistry((url) => router.navigateByUrl(url));
    bus = fakeBus();
    publishRegistry = vi.fn(async () => {});
  });

  afterEach(() => vi.restoreAllMocks());

  it('registers every loaded contribution into the registry', async () => {
    const nf = fakeNfByRemote({
      '@tractor-store/explore': { navContribution: exploreContribution },
      '@tractor-store/decide': { default: decideContribution },
    });

    await setupShellNavigation({
      router,
      registry,
      nf,
      manifest: testManifest,
      onNavigate: bus.onNavigate,
      onRoute: bus.onRoute,
      publishRegistry,
    });

    expect(registry.isAvailable('explore.home')).toBe(true);
    expect(registry.isAvailable('explore.products')).toBe(true);
    expect(registry.isAvailable('decide.product')).toBe(true);
  });

  it('does not register contributions that failed to load', async () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    const nf = fakeNfByRemote({
      '@tractor-store/decide': { navContribution: decideContribution },
      // explore is missing → loadRemoteModule throws
    });

    await setupShellNavigation({
      router,
      registry,
      nf,
      manifest: testManifest,
      onNavigate: bus.onNavigate,
      onRoute: bus.onRoute,
      publishRegistry,
    });

    expect(registry.isAvailable('explore.home')).toBe(false);
    expect(registry.isAvailable('decide.product')).toBe(true);
  });

  it('forwards navigate-intent bus events to the registry', async () => {
    const nf = fakeNfByRemote({
      '@tractor-store/explore': { navContribution: exploreContribution },
      '@tractor-store/decide': { navContribution: decideContribution },
    });
    await setupShellNavigation({
      router,
      registry,
      nf,
      manifest: testManifest,
      onNavigate: bus.onNavigate,
      onRoute: bus.onRoute,
      publishRegistry,
    });

    bus.emitNavigate({ id: 'decide.product', payload: { id: 'CL-01' } });
    // navigate is async — let it settle
    await Promise.resolve();
    expect(router.navigateByUrl).toHaveBeenCalledWith('/decide/product/CL-01');
  });

  it('logs (rather than crashing) when an emitted navigate intent is unknown', async () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => {});
    const nf = fakeNfByRemote({
      '@tractor-store/explore': { navContribution: exploreContribution },
      '@tractor-store/decide': { navContribution: decideContribution },
    });
    await setupShellNavigation({
      router,
      registry,
      nf,
      manifest: testManifest,
      onNavigate: bus.onNavigate,
      onRoute: bus.onRoute,
      publishRegistry,
    });

    bus.emitNavigate({ id: 'unknown.intent' });
    await Promise.resolve();
    await Promise.resolve();
    expect(error).toHaveBeenCalledWith(
      expect.stringMatching(/navigation:navigate failed for "unknown.intent"/),
      expect.any(Error),
    );
  });

  it('forwards route bus events to router.navigateByUrl', async () => {
    const nf = fakeNfByRemote({
      '@tractor-store/explore': { navContribution: exploreContribution },
      '@tractor-store/decide': { navContribution: decideContribution },
    });
    await setupShellNavigation({
      router,
      registry,
      nf,
      manifest: testManifest,
      onNavigate: bus.onNavigate,
      onRoute: bus.onRoute,
      publishRegistry,
    });

    bus.emitRoute({ url: '/explore/products' });
    expect(router.navigateByUrl).toHaveBeenCalledWith('/explore/products');
  });

  it('subscribes to bus events before contributions finish loading', async () => {
    let resolveLoad: (v: unknown) => void = () => {};
    const slowLoad = new Promise((r) => (resolveLoad = r));
    const nf: NativeFederationResult = fakeNf(
      vi.fn(async () => slowLoad) as NativeFederationResult['loadRemoteModule'],
    );

    const setup = setupShellNavigation({
      router,
      registry,
      nf,
      manifest: { '@tractor-store/explore': 'x' },
      onNavigate: bus.onNavigate,
      onRoute: bus.onRoute,
      publishRegistry,
    });

    // The route subscription is wired synchronously before loading completes.
    bus.emitRoute({ url: '/early' });
    expect(router.navigateByUrl).toHaveBeenCalledWith('/early');

    resolveLoad({ navContribution: exploreContribution });
    await setup;
  });

  it('resets the router config with the remote routes plus a catch-all redirect', async () => {
    const nf = fakeNfByRemote({
      '@tractor-store/explore': { navContribution: exploreContribution },
      '@tractor-store/decide': { navContribution: decideContribution },
    });
    await setupShellNavigation({
      router,
      registry,
      nf,
      manifest: testManifest,
      onNavigate: bus.onNavigate,
      onRoute: bus.onRoute,
      publishRegistry,
    });

    const paths = router.routes.map((r) => r.path);
    expect(paths).toEqual([
      'explore',
      'explore/products',
      'decide/product/:id',
      '**',
    ]);
    expect(router.routes.at(-1)).toEqual({ path: '**', redirectTo: 'explore' });
  });

  it('honours a custom fallbackRedirect', async () => {
    const nf = fakeNfByRemote({
      '@tractor-store/explore': { navContribution: exploreContribution },
      '@tractor-store/decide': { navContribution: decideContribution },
    });
    await setupShellNavigation({
      router,
      registry,
      nf,
      manifest: testManifest,
      onNavigate: bus.onNavigate,
      onRoute: bus.onRoute,
      publishRegistry,
      fallbackRedirect: 'home',
    });

    expect(router.routes.at(-1)).toEqual({ path: '**', redirectTo: 'home' });
  });

  it('publishes the registry after routes are configured', async () => {
    const order: string[] = [];
    router.resetConfig = () => order.push('resetConfig');
    publishRegistry = vi.fn(async () => {
      order.push('publishRegistry');
    });
    const nf = fakeNfByRemote({
      '@tractor-store/explore': { navContribution: exploreContribution },
      '@tractor-store/decide': { navContribution: decideContribution },
    });

    await setupShellNavigation({
      router,
      registry,
      nf,
      manifest: testManifest,
      onNavigate: bus.onNavigate,
      onRoute: bus.onRoute,
      publishRegistry,
    });

    expect(order).toEqual(['resetConfig', 'publishRegistry']);
    expect(publishRegistry).toHaveBeenCalledWith(registry);
  });
});
