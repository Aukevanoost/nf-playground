import { Routes } from '@angular/router';
import {
  FederationManifest,
  NativeFederationResult,
} from '@softarc/native-federation-orchestrator';
import {
  INavRegistry,
  NavigatePayload,
  RoutePayload,
} from '@internal/navigation';
import { loadContributions } from './load-contributions';
import { buildRemoteRoutes } from './remote-routes';

/**
 * Subset of `Router` the shell setup actually uses. Declared as an interface
 * so tests can pass a tiny fake without instantiating Angular's Router.
 */
export interface ShellRouter {
  resetConfig(routes: Routes): void;
  navigateByUrl(url: string): Promise<boolean>;
}

export type Subscribe<T> = (handler: (data: T) => void) => () => void;

export interface SetupShellNavigationDeps {
  readonly router: ShellRouter;
  readonly registry: INavRegistry;
  readonly nf: NativeFederationResult;
  readonly manifest: FederationManifest;
  readonly onNavigate: Subscribe<NavigatePayload>;
  readonly onRoute: Subscribe<RoutePayload>;
  readonly publishRegistry: (registry: INavRegistry) => Promise<void>;
  /** Catch-all redirect target. Defaults to `'explore'`. */
  readonly fallbackRedirect?: string;
}

/**
 * Wires up the host's navigation shell at startup:
 *
 *   1. Subscribes to bus events from remotes and forwards them to the
 *      registry / router.
 *   2. Loads each remote's nav contribution (in parallel) and registers it.
 *   3. Resets the router config with one lazy route per routed intent plus
 *      a catch-all fallback.
 *   4. Publishes the populated registry on the bus so remotes' `[navLink]`
 *      directives can resolve intents.
 *
 * Pure orchestration — no Angular DI inside. The DI wiring lives in
 * `provide-nav.ts`, which calls this function from `provideAppInitializer`.
 */
export const setupShellNavigation = async ({
  router,
  registry,
  nf,
  manifest,
  onNavigate,
  onRoute,
  publishRegistry,
  fallbackRedirect = 'explore',
}: SetupShellNavigationDeps): Promise<void> => {
  // Use async handlers + try/catch so a synchronously-thrown error (e.g.
  // `registry.navigate` rejecting an unknown intent inside `resolve()`) is
  // logged the same way as an async failure — one bad emit shouldn't kill
  // the bus.
  onNavigate(async ({ id, payload }) => {
    try {
      await registry.navigate(id, payload);
    } catch (err) {
      console.error(`[nav] navigation:navigate failed for "${id}"`, err);
    }
  });
  onRoute(async ({ url }) => {
    try {
      await router.navigateByUrl(url);
    } catch (err) {
      console.error(`[nav] navigation:route failed for "${url}"`, err);
    }
  });

  const loaded = await loadContributions(nf, manifest);
  for (const { contribution } of loaded) {
    registry.register(contribution);
  }

  router.resetConfig([
    ...buildRemoteRoutes(loaded),
    { path: '**', redirectTo: fallbackRedirect },
  ]);

  await publishRegistry(registry);
};
