import { InjectionToken } from '@angular/core';
import type { LoadRemoteSlice } from '@ng-internal/federation';

export type { LoadRemoteSlice } from '@ng-internal/federation';

export const LOADER = new InjectionToken<LoadRemoteSlice>('loader');
