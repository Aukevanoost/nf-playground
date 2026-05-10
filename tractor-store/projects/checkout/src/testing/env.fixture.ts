import type { EnvironmentConfig } from '../env.config';

export const testEnv: EnvironmentConfig = {
  production: false,
  apiUrl: '',
  scope: 'checkout',
  cdnUrl: 'http://cdn.test',
};
