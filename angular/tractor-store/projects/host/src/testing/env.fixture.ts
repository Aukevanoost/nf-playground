import type { EnvironmentConfig } from '@ng-internal/federation';

export const testEnv: EnvironmentConfig = {
  production: false,
  apiUrl: '',
  scope: 'http://localhost:4200',
  cdnUrl: 'http://cdn.test',
};
