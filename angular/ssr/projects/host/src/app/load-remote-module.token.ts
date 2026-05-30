import { InjectionToken } from '@angular/core';

import type { LoadRemoteModule } from './server-loader.symbols';

export type { LoadRemoteModule } from './server-loader.symbols';
export { SERVER_LOADER_GLOBAL_KEY } from './server-loader.symbols';

export const LOAD_REMOTE_MODULE = new InjectionToken<LoadRemoteModule>('LOAD_REMOTE_MODULE');
