import { InjectionToken } from '@angular/core';
import { EnvironmentConfig } from '@internal/federation';

export const ENV = new InjectionToken<EnvironmentConfig>('ENV');
