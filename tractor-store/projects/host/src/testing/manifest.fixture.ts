import type { FederationManifest } from '@softarc/native-federation-orchestrator';

export const exploreRemoteEntry = 'http://localhost:4201/remoteEntry.json';
export const decideRemoteEntry = 'http://localhost:4202/remoteEntry.json';

export const testManifest: FederationManifest = {
  '@tractor-store/explore': exploreRemoteEntry,
  '@tractor-store/decide': decideRemoteEntry,
};
