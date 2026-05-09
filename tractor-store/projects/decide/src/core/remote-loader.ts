import { InjectionToken } from '@angular/core';
import type { LoadRemoteSlice } from '@internal/federation';

export type { LoadRemoteSlice } from '@internal/federation';

export const LOADER = new InjectionToken<LoadRemoteSlice>('loader');
