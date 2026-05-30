import { withNativeFederation, shareAll, DEFAULT_SKIP_LIST } from '@softarc/native-federation/config';

const workspaceLibs = [
  '@react-internal/event-bus',
  '@react-internal/mfe-runtime',
  '@react-internal/navigation',
  '@react-internal/ui',
  '@react-internal/url',
];

export default withNativeFederation({
  name: '@tractor-store/checkout',

  exposes: {
    'mfe-cart': './src/features/cart/bootstrap.tsx',
    'mfe-checkout': './src/features/checkout/bootstrap.tsx',
    'mfe-thanks': './src/features/thanks/bootstrap.tsx',
    'mfe-mini-cart': './src/features/mini-cart/bootstrap.tsx',
    'mfe-add-to-cart': './src/features/add-to-cart/bootstrap.tsx',
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
