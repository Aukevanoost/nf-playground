import { ApplicationConfig, mergeApplicationConfig } from '@angular/core';
import { provideServerRendering, withRoutes } from '@angular/ssr';

import { commonConfig } from './app.config.common';
import { serverRoutes } from './app.routes.server';
import {
  LOAD_REMOTE_MODULE,
  LoadRemoteModule,
  SERVER_LOADER_GLOBAL_KEY,
} from './load-remote-module.token';

interface GlobalSlot {
  [SERVER_LOADER_GLOBAL_KEY]?: LoadRemoteModule;
}
const globalSlot = globalThis as unknown as GlobalSlot;

const serverLoader: LoadRemoteModule = (remoteName, exposedModule) => {
  const loader = globalSlot[SERVER_LOADER_GLOBAL_KEY];
  if (!loader) {
    throw new Error(
      `[host] server federation loader not initialized — cannot resolve '${remoteName}/${exposedModule}'`,
    );
  }
  return loader(remoteName, exposedModule);
};

const serverConfig: ApplicationConfig = {
  providers: [
    provideServerRendering(withRoutes(serverRoutes)),
    { provide: LOAD_REMOTE_MODULE, useValue: serverLoader },
  ],
};

export const config = mergeApplicationConfig(commonConfig, serverConfig);
