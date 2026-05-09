import { Injector, provideZonelessChangeDetection } from '@angular/core';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { createApplication } from '@angular/platform-browser';
import { ENV, EnvironmentConfig } from '../env.config';
import { LOADER, LoadRemoteSlice } from './remote-loader';

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
