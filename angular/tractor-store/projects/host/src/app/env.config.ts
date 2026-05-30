import { InjectionToken } from '@angular/core';
import { EnvironmentConfig, LoadRemoteSlice } from '@ng-internal/federation';

export const ENV = new InjectionToken<EnvironmentConfig>('ENV');

export const LOAD_REMOTE_SLICE = new InjectionToken<LoadRemoteSlice>(
  'load-remote-slice',
);
