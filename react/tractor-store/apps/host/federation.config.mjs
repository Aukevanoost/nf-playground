import { withNativeFederation, shareAll, DEFAULT_SKIP_LIST } from '@softarc/native-federation/config';

const workspaceLibs = [
  '@react-internal/event-bus',
  '@react-internal/navigation',
  '@react-internal/ui',
  '@react-internal/url',
];

export default withNativeFederation({
  name: 'host',
  sharedMappings: workspaceLibs,

  shared: {
    ...shareAll(
      {
        singleton: true,
        strictVersion: true,
        requiredVersion: 'auto',
      },
      {
        // Route workspace libs through sharedMappings (TS-aware bundling)
        // instead of the npm-package shared path, which only resolves
        // .mjs/.js/.cjs and chokes on the libs' TS source.
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
    // Host-only internal — inline rather than federate.
    '@react-internal/federation',
  ],
});
