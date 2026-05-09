import { InjectionToken } from '@angular/core';
import type {
  FederationManifest,
  NativeFederationResult,
} from '@softarc/native-federation-orchestrator';
import { EnvironmentConfig } from '@internal/federation';

export type LoadRemoteSlice = (
  remoteName: string,
  exposedModule: string,
) => Promise<void>;

export const LOAD_REMOTE_SLICE = new InjectionToken<LoadRemoteSlice>(
  'load-remote-slice',
);

interface ComponentBootstrap {
  bootstrap: (
    env: EnvironmentConfig,
    loadRemoteSlice: LoadRemoteSlice,
  ) => Promise<void>;
}

export const createSliceLoader = (
  nf: NativeFederationResult,
  env: EnvironmentConfig,
  manifest: FederationManifest,
): LoadRemoteSlice => {
  const envForRemote = (remoteName: string): EnvironmentConfig => {
    const entry = manifest[remoteName];
    const remoteEntryUrl = typeof entry === 'string' ? entry : entry.url;
    return {
      ...env,
      scope: remoteEntryUrl.replace('/remoteEntry.json', ''),
    };
  };

  const seen = new Map<string, string>();

  const loadRemoteSlice: LoadRemoteSlice = async (
    remoteName,
    exposedModule,
  ) => {
    const owner = seen.get(exposedModule);
    if (owner) {
      if (owner !== remoteName) {
        console.warn(
          `[slice-loader] custom element "${exposedModule}" was already registered by "${owner}"; ignoring request from "${remoteName}"`,
        );
      }
      return;
    }
    if (customElements.get(exposedModule)) {
      // Tag was defined outside of this loader (e.g. legacy bundle). Bail
      // before re-bootstrapping, but record ownership so future calls are
      // attributed correctly.
      seen.set(exposedModule, remoteName);
      return;
    }
    // Mark ownership before bootstrap so a slice that (directly or
    // indirectly) re-requests itself short-circuits instead of recursing.
    seen.set(exposedModule, remoteName);
    try {
      const mod = await nf.loadRemoteModule<ComponentBootstrap>(
        remoteName,
        exposedModule,
      );
      await mod.bootstrap(envForRemote(remoteName), loadRemoteSlice);
    } catch (err) {
      seen.delete(exposedModule);
      throw err;
    }
  };
  return loadRemoteSlice;
};
