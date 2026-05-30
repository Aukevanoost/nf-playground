import { Injector, provideZonelessChangeDetection } from '@angular/core';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { createApplication } from '@angular/platform-browser';
import { ENV, EnvironmentConfig } from '../env.config';
import { LOADER, LoadRemoteSlice } from './remote-loader';

// Module-level singleton: the first feature bootstrap creates the app, the
// rest reuse the same injector. Native federation's chunking shares
// internal modules across exposed entries, so this lives once per MFE load.
let cached: Promise<Injector> | undefined;

export function ensureSharedInjector(
  env: EnvironmentConfig,
  loadRemoteSlice: LoadRemoteSlice,
): Promise<Injector> {
  if (!cached) {
    cached = createApplication({
      providers: [
        { provide: ENV, useValue: env },
        { provide: LOADER, useValue: loadRemoteSlice },
        provideZonelessChangeDetection(),
        provideHttpClient(withFetch()),
      ],
    }).then((app) => app.injector);
  }
  return cached;
}
