import { vi } from 'vitest';
import type { Routes } from '@angular/router';
import type { ShellRouter } from '../app/nav/setup-shell-nav';

export interface FakeRouter extends ShellRouter {
  routes: Routes;
  navigateByUrl: ReturnType<typeof vi.fn<(url: string) => Promise<boolean>>>;
}

/** A minimal `ShellRouter` whose `resetConfig` records the routes and whose
 *  `navigateByUrl` is a vi.fn so callers can assert on it. */
export const fakeRouter = (): FakeRouter => {
  const router: FakeRouter = {
    routes: [],
    resetConfig: (r) => {
      router.routes = r;
    },
    navigateByUrl: vi.fn(async () => true),
  };
  return router;
};
