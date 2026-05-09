import {
  EnvironmentProviders,
  inject,
  makeEnvironmentProviders,
  provideAppInitializer,
} from '@angular/core';
import { Router } from '@angular/router';
import {
  FederationManifest,
  NativeFederationResult,
} from '@softarc/native-federation-orchestrator';
import { onNavigate, onRoute, publishRegistry } from './host-bus';
import { NavRegistry } from './nav-registry';
import { setupShellNavigation } from './setup-shell-nav';

/**
 * Thin DI adapter: wires the host's navigation `NavRegistry` and runs
 * `setupShellNavigation` at app start. The actual orchestration logic lives
 * in `setup-shell-nav.ts` (and is unit-tested without Angular DI).
 */
export const provideShellNav = (
  nf: NativeFederationResult,
  manifest: FederationManifest,
): EnvironmentProviders =>
  makeEnvironmentProviders([
    {
      provide: NavRegistry,
      useFactory: () => {
        const router = inject(Router);
        return new NavRegistry((url) => router.navigateByUrl(url));
      },
    },
    provideAppInitializer(() =>
      setupShellNavigation({
        router: inject(Router),
        registry: inject(NavRegistry),
        nf,
        manifest,
        onNavigate,
        onRoute,
        publishRegistry,
      }),
    ),
  ]);
