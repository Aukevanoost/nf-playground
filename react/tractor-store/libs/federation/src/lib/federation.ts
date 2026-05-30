import type {
  FederationManifest,
  NativeFederationResult,
} from '@softarc/native-federation-orchestrator';
import { findRemoteForElement } from './slice-index';

export interface EnvironmentConfig {
  production: boolean;
  apiUrl: string;
  scope: string;
  cdnUrl: string;
}

// Closure handed to every remote so it can mount slices from other remotes
// without knowing each remote's EnvironmentConfig. The shell binds the env
// map and the raw federation loader; remotes just call
// `loadRemoteSlice(name, element)`.
//
// `prefetchElement(tag)` is the preferred call from feature code that just
// wants to pre-warm a slice by its custom-element tag — the index lookup
// (set by the host from loaded nav-contributions) supplies the remoteName,
// so consumers don't have to hardcode peer-remote package names. In
// standalone-fragment mode the index is unset and prefetchElement is a no-op.
export interface LoadRemoteSlice {
  (remoteName: string, exposedModule: string): Promise<void>;
  prefetchElement(tag: string): Promise<void>;
}

export type ComponentBootstrap = {
  bootstrap: (
    env: EnvironmentConfig,
    loadRemoteSlice: LoadRemoteSlice,
  ) => Promise<void>;
};

export function toCdnUrl(path: string, cdnUrl: string): string {
  const base = cdnUrl.replace(/\/+$/, '');
  const rel = path.startsWith('/') ? path : `/${path}`;
  return `${base}${rel}`;
}

export const createSliceLoader = (
  env: EnvironmentConfig,
  nf: NativeFederationResult,
  manifest: FederationManifest,
): LoadRemoteSlice => {
  const envForRemote = (remoteName: string): EnvironmentConfig => {
    const entry = manifest[remoteName];
    const remoteEntryUrl = typeof entry === 'string' ? entry : entry.url;
    return { ...env, scope: remoteEntryUrl.replace('/remoteEntry.json', '') };
  };

  const loadRemoteSlice: LoadRemoteSlice = Object.assign(
    async function load(
      remoteName: string,
      exposedModule: string,
    ): Promise<void> {
      if (customElements.get(exposedModule)) return;
      const mod = await nf.loadRemoteModule<ComponentBootstrap>(
        remoteName,
        exposedModule,
      );
      await mod.bootstrap(envForRemote(remoteName), loadRemoteSlice);
    },
    {
      async prefetchElement(tag: string): Promise<void> {
        if (customElements.get(tag)) return;
        const remoteName = findRemoteForElement(tag);
        if (!remoteName) return;
        await loadRemoteSlice(remoteName, tag);
      },
    },
  );
  return loadRemoteSlice;
};
