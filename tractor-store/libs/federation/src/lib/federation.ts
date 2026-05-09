import type {
  FederationManifest,
  NativeFederationResult,
} from '@softarc/native-federation-orchestrator';

export type { LoadRemoteModule } from '@softarc/native-federation-orchestrator';

export interface EnvironmentConfig {
  production: boolean;
  apiUrl: string;
  scope: string;
  cdnUrl: string;
}

// Closure handed in by the shell at bootstrap time. Loads a remote chunk and
// invokes its bootstrap with the matching env, so a remote can mount slices
// from other remotes without knowing each remote's EnvironmentConfig.
export type LoadRemoteSlice = (
  remoteName: string,
  exposedModule: string,
) => Promise<void>;

export interface ComponentBootstrap {
  bootstrap: (
    env: EnvironmentConfig,
    loadRemoteSlice: LoadRemoteSlice,
  ) => Promise<void>;
}

export function toCdnUrl(path: string, cdnUrl: string): string {
  const base = cdnUrl.replace(/\/+$/, '');
  const rel = path.startsWith('/') ? path : `/${path}`;
  return `${base}${rel}`;
}

export const createSliceLoader = (
  nf: NativeFederationResult,
  env: EnvironmentConfig,
  manifest: FederationManifest,
): LoadRemoteSlice => {
  const envForRemote = (remoteName: string): EnvironmentConfig => {
    const entry = manifest[remoteName];
    const remoteEntryUrl = typeof entry === 'string' ? entry : entry.url;
    return { ...env, scope: remoteEntryUrl.replace('/remoteEntry.json', '') };
  };

  const loadRemoteSlice: LoadRemoteSlice = async (
    remoteName,
    exposedModule,
  ) => {
    if (customElements.get(exposedModule)) return;
    const mod = await nf.loadRemoteModule<ComponentBootstrap>(
      remoteName,
      exposedModule,
    );
    await mod.bootstrap(envForRemote(remoteName), loadRemoteSlice);
  };
  return loadRemoteSlice;
};
