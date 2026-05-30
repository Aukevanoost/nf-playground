import { createContext, useContext, type ReactNode } from 'react';
import type {
  FederationManifest,
  NativeFederationResult,
} from '@softarc/native-federation-orchestrator';
import type { EnvironmentConfig, LoadRemoteSlice } from '@react-internal/federation';

export interface AppContextValue {
  readonly env: EnvironmentConfig;
  readonly manifest: FederationManifest;
  readonly nf: NativeFederationResult;
  readonly loadRemoteSlice: LoadRemoteSlice;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({
  value,
  children,
}: {
  value: AppContextValue;
  children: ReactNode;
}) {
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

const useAppContext = (): AppContextValue => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('AppContext used outside <AppProvider>');
  return ctx;
};

export const useEnv = () => useAppContext().env;
export const useManifest = () => useAppContext().manifest;
export const useNf = () => useAppContext().nf;
export const useLoader = () => useAppContext().loadRemoteSlice;
