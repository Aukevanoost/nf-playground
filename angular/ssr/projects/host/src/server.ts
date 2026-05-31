import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const cors = require('cors');

import {
  AngularNodeAppEngine,
  createNodeRequestHandler,
  isMainModule,
  writeResponseToNodeResponse,
} from '@angular/ssr/node';
import express from 'express';
import { join } from 'node:path';

const browserDistFolder = join(process.cwd(), 'dist/host/browser');

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

// NOTE: the CLI injects the `@angular/ssr` app-engine registration into the top
// of the emitted server bundle, so its static graph always pulls in `@angular/*`.
// Federation must be initialised *before* that happens. The native-federation
// build handles this automatically: it renames this bundle to `bootstrap-server.mjs`
// and emits an Angular-free `server.mjs` that runs `initNodeFederation()` and then
// dynamically imports `bootstrap-server.mjs`. That generated entry populates the
// `__NF_HOST_SERVER_LOADER__` global slot read by the SSR loader bridge.
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
