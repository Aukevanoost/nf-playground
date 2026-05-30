import { createContext, useContext, type ReactNode } from 'react';
import type { EnvironmentConfig, LoadRemoteSlice } from '@react-internal/federation';

export interface RemoteContextValue {
  readonly env: EnvironmentConfig;
  readonly loader: LoadRemoteSlice;
}

// Module-level singleton: the first fragment mount creates the value, the
// rest reuse it. Federation chunks shared modules across exposed entries, so
// this lives once per remote load — the lib is bundled into each remote, so
// the cache is still per-remote, not workspace-global.
let cached: RemoteContextValue | undefined;

export function ensureRemoteContext(
  env: EnvironmentConfig,
  loader: LoadRemoteSlice,
): RemoteContextValue {
  if (!cached) cached = { env, loader };
  return cached;
}

const RemoteContext = createContext<RemoteContextValue | null>(null);

export function RemoteContextProvider({
  value,
  children,
}: {
  value: RemoteContextValue;
  children: ReactNode;
}) {
  return <RemoteContext.Provider value={value}>{children}</RemoteContext.Provider>;
}

const useRemoteContext = (): RemoteContextValue => {
  const ctx = useContext(RemoteContext);
  if (!ctx) throw new Error('RemoteContext used outside <RemoteContextProvider>');
  return ctx;
};

export const useRemoteEnv = () => useRemoteContext().env;
export const useRemoteLoader = () => useRemoteContext().loader;
export const useCdnBase = () => useRemoteContext().env.cdnUrl;
