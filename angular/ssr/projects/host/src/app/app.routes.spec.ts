import { Route, Routes } from '@angular/router';

import { routes } from './app.routes';

function byPath(rs: Routes, path: string): Route | undefined {
  return rs.find((r) => r.path === path);
}

describe('host routes', () => {
  it('mounts the federated todos feature as statically-registered loadComponent children', () => {
    const todos = byPath(routes, 'todos');
    expect(todos).toBeDefined();

    // A federated `loadChildren` would be invisible to the SSR build's route
    // extraction, so its children would never enter the route manifest and
    // would 404 on direct deep-links. The fix mounts `loadComponent` children,
    // whose paths are registered statically. See README "Federated routes
    // under SSR".
    expect(todos?.loadChildren).toBeUndefined();

    const children = todos?.children ?? [];
    expect(children.map((c) => c.path)).toEqual(['', ':id']);
    for (const child of children) {
      expect(typeof child.loadComponent).toBe('function');
    }
  });

  it('mounts the federated insights component as a loadComponent leaf', () => {
    const insights = byPath(routes, 'insights');
    expect(typeof insights?.loadComponent).toBe('function');
  });
});
