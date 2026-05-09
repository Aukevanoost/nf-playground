import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Routes } from '@angular/router';
import type {
  FederationManifest,
  NativeFederationResult,
} from '@softarc/native-federation-orchestrator';
import type {
  INavRegistry,
  NavigatePayload,
  RoutePayload,
} from '@internal/navigation';
import { NavRegistry } from './nav-registry';
import {
  setupShellNavigation,
  ShellRouter,
  Subscribe,
} from './setup-shell-nav';

const exploreContribution = {
  source: '@tractor-store/explore',
  basePath: 'explore',
  intents: [
    { id: 'explore.home', path: '/', element: 'mfe-explore-home' },
    { id: 'explore.products', path: '/products', element: 'mfe-explore-list' },
  ],
};

const decideContribution = {
  source: '@tractor-store/decide',
  basePath: 'decide',
  intents: [
    { id: 'decide.product', path: '/product/:id', element: 'mfe-decide-product' },
  ],
};

const manifest: FederationManifest = {
  '@tractor-store/explore': 'http://x/remoteEntry.json',
  '@tractor-store/decide': 'http://x/remoteEntry.json',
};

const fakeNf = (
  byRemote: Record<string, unknown>,
): NativeFederationResult =>
  ({
    loadRemoteModule: vi.fn(async (remoteName: string) => {
      if (!(remoteName in byRemote)) throw new Error(`unknown ${remoteName}`);
      return byRemote[remoteName];
    }),
  }) as unknown as NativeFederationResult;

interface FakeRouter extends ShellRouter {
  routes: Routes;
  navigateByUrl: ReturnType<typeof vi.fn<(url: string) => Promise<boolean>>>;
}

const fakeRouter = (): FakeRouter => {
  const router: FakeRouter = {
    routes: [],
    resetConfig: (r) => {
      router.routes = r;
    },
    navigateByUrl: vi.fn(async () => true),
  };
  return router;
};

interface BusFakes {
  emitNavigate(p: NavigatePayload): void;
  emitRoute(p: RoutePayload): void;
  onNavigate: Subscribe<NavigatePayload>;
  onRoute: Subscribe<RoutePayload>;
}

const fakeBus = (): BusFakes => {
  const navHandlers: ((p: NavigatePayload) => void)[] = [];
  const routeHandlers: ((p: RoutePayload) => void)[] = [];
  return {
    emitNavigate: (p) => navHandlers.forEach((h) => h(p)),
    emitRoute: (p) => routeHandlers.forEach((h) => h(p)),
    onNavigate: (h) => {
      navHandlers.push(h);
      return () => {
        const i = navHandlers.indexOf(h);
        if (i >= 0) navHandlers.splice(i, 1);
      };
    },
    onRoute: (h) => {
      routeHandlers.push(h);
      return () => {
        const i = routeHandlers.indexOf(h);
        if (i >= 0) routeHandlers.splice(i, 1);
      };
    },
  };
};

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
    const nf = fakeNf({
      '@tractor-store/explore': { navContribution: exploreContribution },
      '@tractor-store/decide': { default: decideContribution },
    });

    await setupShellNavigation({
      router, registry, nf, manifest,
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
    const nf = fakeNf({
      '@tractor-store/decide': { navContribution: decideContribution },
      // explore is missing → loadRemoteModule throws
    });

    await setupShellNavigation({
      router, registry, nf, manifest,
      onNavigate: bus.onNavigate,
      onRoute: bus.onRoute,
      publishRegistry,
    });

    expect(registry.isAvailable('explore.home')).toBe(false);
    expect(registry.isAvailable('decide.product')).toBe(true);
  });

  it('forwards navigate-intent bus events to the registry', async () => {
    const nf = fakeNf({
      '@tractor-store/explore': { navContribution: exploreContribution },
      '@tractor-store/decide': { navContribution: decideContribution },
    });
    await setupShellNavigation({
      router, registry, nf, manifest,
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
    const nf = fakeNf({
      '@tractor-store/explore': { navContribution: exploreContribution },
      '@tractor-store/decide': { navContribution: decideContribution },
    });
    await setupShellNavigation({
      router, registry, nf, manifest,
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
    const nf = fakeNf({
      '@tractor-store/explore': { navContribution: exploreContribution },
      '@tractor-store/decide': { navContribution: decideContribution },
    });
    await setupShellNavigation({
      router, registry, nf, manifest,
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
    const nf = {
      loadRemoteModule: vi.fn(async () => slowLoad),
    } as unknown as NativeFederationResult;

    const setup = setupShellNavigation({
      router, registry, nf,
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
    const nf = fakeNf({
      '@tractor-store/explore': { navContribution: exploreContribution },
      '@tractor-store/decide': { navContribution: decideContribution },
    });
    await setupShellNavigation({
      router, registry, nf, manifest,
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
    const nf = fakeNf({
      '@tractor-store/explore': { navContribution: exploreContribution },
      '@tractor-store/decide': { navContribution: decideContribution },
    });
    await setupShellNavigation({
      router, registry, nf, manifest,
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
    const nf = fakeNf({
      '@tractor-store/explore': { navContribution: exploreContribution },
      '@tractor-store/decide': { navContribution: decideContribution },
    });

    await setupShellNavigation({
      router, registry, nf, manifest,
      onNavigate: bus.onNavigate,
      onRoute: bus.onRoute,
      publishRegistry,
    });

    expect(order).toEqual(['resetConfig', 'publishRegistry']);
    expect(publishRegistry).toHaveBeenCalledWith(registry);
  });
});
