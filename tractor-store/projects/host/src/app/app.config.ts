import {
  ApplicationConfig,
  InjectionToken,
  provideZonelessChangeDetection,
} from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import {
  FederationManifest,
  NativeFederationResult,
} from '@softarc/native-federation-orchestrator';
import { EnvironmentConfig } from '@internal/federation';
import { createSliceLoader, LOAD_REMOTE_SLICE } from './loader/slice-loader';
import { ENV } from './env.config';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { provideShellNav } from './nav/provide-nav';

export const appConfig = (
  nf: NativeFederationResult,
  env: EnvironmentConfig,
  manifest: FederationManifest,
): ApplicationConfig => ({
  providers: [
    { provide: ENV, useValue: env },
    {
      provide: LOAD_REMOTE_SLICE,
      useValue: createSliceLoader(nf, env, manifest),
    },
    provideHttpClient(withFetch()),
    provideZonelessChangeDetection(),
    provideRouter([], withComponentInputBinding()),
    provideShellNav(nf, manifest),
  ],
});
