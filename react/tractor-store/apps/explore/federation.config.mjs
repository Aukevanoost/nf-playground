import { withNativeFederation, shareAll, DEFAULT_SKIP_LIST } from '@softarc/native-federation/config';

const workspaceLibs = [
  '@react-internal/event-bus',
  '@react-internal/mfe-runtime',
  '@react-internal/navigation',
  '@react-internal/ui',
  '@react-internal/url',
];

export default withNativeFederation({
  name: '@tractor-store/explore',

  exposes: {
    'mfe-home': './src/features/home/bootstrap.tsx',
    'mfe-header': './src/features/header/bootstrap.tsx',
    'mfe-footer': './src/features/footer/bootstrap.tsx',
    'mfe-recommendations': './src/features/recommendations/bootstrap.tsx',
    'mfe-category': './src/features/category/bootstrap.tsx',
    'mfe-stores': './src/features/stores/bootstrap.tsx',
    'mfe-store-picker': './src/features/store-picker/bootstrap.tsx',
    'nav-contribution': './src/core/nav-contribution.ts',
  },

  sharedMappings: workspaceLibs,

  shared: {
    ...shareAll(
      {
        singleton: true,
        strictVersion: true,
        requiredVersion: 'auto',
      },
      {
        skipList: [...DEFAULT_SKIP_LIST, ...workspaceLibs],
        overrides: {
          react: {
            singleton: true,
            strictVersion: true,
            requiredVersion: 'auto',
            includeSecondaries: { keepAll: true },
          },
          'react-dom': {
            singleton: true,
            strictVersion: true,
            requiredVersion: 'auto',
            includeSecondaries: { keepAll: true },
          },
        },
      },
    ),
  },

  features: {
    ignoreUnusedDeps: true,
  },

  skip: [
    'react-dom/server',
    'react-dom/server.node',
    'react-dom/server.browser',
    'react-dom/test-utils',
    '@react-internal/federation',
  ],
});
