import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const cors = require('cors');

import { initNodeFederation } from '@softarc/native-federation-orchestrator/node';
import express from 'express';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

import {
  SERVER_LOADER_GLOBAL_KEY,
  type LoadRemoteModule,
} from './app/server-loader.symbols';

const relBrowserDist = 'dist/host/browser';
const browserDistFolder = join(process.cwd(), relBrowserDist);

// `dist/host/browser/federation.manifest.json` only exists after `ng build`;
// during `ng serve`, the dev server keeps assets in memory, so fall back to the source.
const manifestCandidates = [
  join(browserDistFolder, 'federation.manifest.json'),
  join(process.cwd(), 'projects/host/public/federation.manifest.json'),
];

// The federation build emits the host's own remoteEntry.json to dist in both
// `ng build` and `ng serve`, so a plain path is always available — the
// orchestrator converts it to a file:// URL internally.
const hostRemoteEntryPath = join(browserDistFolder, 'remoteEntry.json');

async function loadManifest(): Promise<Record<string, string>> {
  for (const path of manifestCandidates) {
    try {
      return JSON.parse(await readFile(path, 'utf-8'));
    } catch {
      // try next candidate
    }
  }
  throw new Error(
    `federation.manifest.json not found in any of: ${manifestCandidates.join(', ')}`,
  );
}

interface GlobalSlot {
  [SERVER_LOADER_GLOBAL_KEY]?: LoadRemoteModule;
}
const globalSlot = globalThis as unknown as GlobalSlot;

// Initialise federation BEFORE the first `@angular/*` import resolves. Once
// `initNodeFederation` returns, the orchestrator's node loader has an active
// import map mapping `@angular/core` (and every other shared singleton) to a
// single federated chunk URL. Loading Angular *after* this point means the
// host and the remotes resolve to the same URL, so Node caches one module
// instance for both. Loading Angular before init would let the host cache a
// node_modules copy, leaving the remote on its federated URL — two
// `@angular/core` instances, two `EnvironmentInjector` tokens, NG0203 at
// render time.
try {
  const manifest = await loadManifest();
  const { loadRemoteModule } = await initNodeFederation(manifest, {
    hostRemoteEntry: hostRemoteEntryPath,
  });
  globalSlot[SERVER_LOADER_GLOBAL_KEY] = loadRemoteModule;
} catch (err) {
  console.warn(
    '[host] initNodeFederation failed; SSR will render without federated remotes:',
    (err as Error)?.message ?? err,
  );
}

const {
  AngularNodeAppEngine,
  createNodeRequestHandler,
  isMainModule,
  writeResponseToNodeResponse,
} = await import('@angular/ssr/node');

const app = express();
app.use(cors());
const angularApp = new AngularNodeAppEngine();

app.use(
  express.static(browserDistFolder, {
    maxAge: '1y',
    index: false,
    redirect: false,
  }),
);

app.use((req, res, next) => {
  angularApp
    .handle(req)
    .then((response) => (response ? writeResponseToNodeResponse(response, res) : next()))
    .catch(next);
});

if (isMainModule(import.meta.url) || process.env['pm_id']) {
  const port = process.env['PORT'] || 4200;
  app.listen(port, (error) => {
    if (error) {
      throw error;
    }
    console.log(`Node Express server listening on http://localhost:${port}`);
  });
}

export const reqHandler = createNodeRequestHandler(app);
