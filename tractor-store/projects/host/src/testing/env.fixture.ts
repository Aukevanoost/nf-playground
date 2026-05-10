import type { EnvironmentConfig } from '@internal/federation';

export const testEnv: EnvironmentConfig = {
  production: false,
  apiUrl: '',
  scope: 'http://localhost:4200',
  cdnUrl: 'http://cdn.test',
};
