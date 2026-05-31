import { InjectionToken } from '@angular/core';

export type LoadRemoteModule = (
  remoteName: string,
  exposedModule: string,
) => Promise<unknown>;

// The native-federation build injects an entry that runs `initNodeFederation()`
// before any `@angular/*` module is evaluated, then publishes the server-side
// `loadRemoteModule` on this global slot. The SSR app config reads it to resolve
// federated remotes during rendering.
export const SERVER_LOADER_GLOBAL_KEY = '__NF_HOST_SERVER_LOADER__';

export const LOAD_REMOTE_MODULE = new InjectionToken<LoadRemoteModule>('LOAD_REMOTE_MODULE');
