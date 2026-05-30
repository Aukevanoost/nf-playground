import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import {
  type FederationManifest,
  type NativeFederationResult,
} from '@softarc/native-federation-orchestrator';
import {
  type EnvironmentConfig,
  createSliceLoader,
  toCdnUrl,
} from '@react-internal/federation';
import { AppProvider } from './context';
import { setupShellNavigation } from './nav/setup-shell-nav';

const loadRalewayFont = (cdnUrl: string): void => {
  if (!('FontFace' in window)) return;
  const url = toCdnUrl('/cdn/font/raleway-regular.woff2', cdnUrl);
  const face = new FontFace('Raleway', `url(${url}) format('woff2')`, {
    weight: 'normal',
    style: 'normal',
    display: 'swap',
  });
  face
    .load()
    .then((loaded) => document.fonts.add(loaded))
    .catch((err) => console.warn('[host] failed to load Raleway font', err));
};

const loadHelperScript = (cdnUrl: string): void => {
  const script = document.createElement('script');
  script.type = 'module';
  script.src = toCdnUrl('/cdn/js/helper.js', cdnUrl);
  document.head.appendChild(script);
};

const loadGlobalStylesheet = (cdnUrl: string): void => {
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = toCdnUrl('/cdn/css/global.css', cdnUrl);
  document.head.appendChild(link);
};

export const bootstrap = async (
  env: EnvironmentConfig,
  nf: NativeFederationResult,
  manifest: FederationManifest,
): Promise<void> => {
  loadGlobalStylesheet(env.cdnUrl);
  loadRalewayFont(env.cdnUrl);
  loadHelperScript(env.cdnUrl);

  const loadRemoteSlice = createSliceLoader(env, nf, manifest);
  const { router } = await setupShellNavigation({ nf, manifest });

  const container = document.getElementById('root');
  if (!container) throw new Error('No #root element');

  createRoot(container).render(
    <StrictMode>
      <AppProvider value={{ env, manifest, nf, loadRemoteSlice }}>
        <RouterProvider router={router} />
      </AppProvider>
    </StrictMode>,
  );
};
