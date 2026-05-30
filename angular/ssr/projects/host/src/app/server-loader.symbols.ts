// Angular-free symbols shared between `server.ts` (Node ESM graph) and
// `load-remote-module.token.ts`. Keeping this file free of `@angular/*` imports
// lets `server.ts` reference these symbols *before* it has initialised
// federation — importing anything Angular at that point would cache the host's
// node_modules copy of @angular/core and bypass the federation import map.

export type LoadRemoteModule = (
  remoteName: string,
  exposedModule: string,
) => Promise<unknown>;

export const SERVER_LOADER_GLOBAL_KEY = '__NF_HOST_SERVER_LOADER__';
