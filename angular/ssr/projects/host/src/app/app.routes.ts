import { Component, Type, inject } from '@angular/core';
import { Routes } from '@angular/router';

import { LOAD_REMOTE_MODULE, LoadRemoteModule } from './load-remote-module.token';
import { Home } from './home/home';

/**
 * Resolves a federated module through the platform-specific loader.
 *
 * The loader is captured synchronously (so we stay inside the injection
 * context) and the actual call is deferred onto a microtask. The server loader
 * throws *synchronously* when the federation runtime is not yet initialised;
 * deferring turns that throw into a catchable rejection, so the `.catch(...)`
 * fallbacks below can swap in a placeholder instead of taking down the render.
 */
function loadRemote(remoteName: string, exposedModule: string): Promise<unknown> {
  const load: LoadRemoteModule = inject(LOAD_REMOTE_MODULE);
  return Promise.resolve().then(() => load(remoteName, exposedModule));
}

@Component({ template: '' })
class RemoteUnavailable {}

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    component: Home,
  },
  {
    // Federated feature mounted by the host. mfe1 owns the *components*
    // (`./List`, `./Detail`); the host owns the *route shape*.
    //
    // Using `loadComponent` children (not a federated `loadChildren`) is
    // deliberate: a `loadComponent` path is registered statically in the SSR
    // route manifest without resolving the remote at build time, so a direct
    // deep-link such as `/todos/:id` is server-rendered. A federated
    // `loadChildren` cannot be crawled at build time, so its child routes never
    // enter the manifest and 404 on direct SSR requests. The nested shape
    // (empty-path list + `:id` detail) mirrors mfe1's own routing so the
    // components' relative `routerLink`s resolve unchanged. See the README,
    // "Federated routes under SSR".
    path: 'todos',
    children: [
      {
        path: '',
        loadComponent: () =>
          loadRemote('mfe1', './List')
            .then((m) => m as Type<unknown>)
            .catch(() => RemoteUnavailable),
      },
      {
        // `:id` is bound to `TodoDetailComponent.id` via `withComponentInputBinding()`.
        path: ':id',
        loadComponent: () =>
          loadRemote('mfe1', './Detail')
            .then((m) => m as Type<unknown>)
            .catch(() => RemoteUnavailable),
      },
    ],
  },
  {
    // Federated component: mfe2 exposes `./Component` (the insights dashboard).
    path: 'insights',
    loadComponent: () =>
      loadRemote('mfe2', './Component')
        .then((m) => m as Type<unknown>)
        .catch(() => RemoteUnavailable),
  },
];
