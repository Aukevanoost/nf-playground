import { initFederation } from '@softarc/native-federation-orchestrator';
import {
  useShimImportMap,
  consoleLogger,
  globalThisStorageEntry,
} from '@softarc/native-federation-orchestrator/options';
import { createSliceLoader } from '@react-internal/federation';
import {
  createRegistry,
  NFEventRegistry,
} from '@softarc/native-federation-orchestrator/registry';

declare global {
  interface Window {
    __NF_REGISTRY__: NFEventRegistry;
  }
}

// Standalone mode needs the bus installed before the dynamic
// `import('./features/.../bootstrap')` pulls in `@react-internal/event-bus`
// — channels throw on construction if `__NF_REGISTRY__` is missing.
(function (): void {
  if (window.__NF_REGISTRY__) return;
  const registry = createRegistry({
    maxStreams: 10,
    maxEvents: 10,
    removePercentage: 0.5,
  });
  window.__NF_REGISTRY__ = Object.freeze(registry());
})();

let showErrors = false;
Promise.all([
  fetch('./env.config.json').then((r) => r.json()),
  fetch('./federation.manifest.json').then((r) => r.json()),
])
  .then(async ([env, manifest]) => {
    showErrors = !env.production;
    const nf = await initFederation(manifest, {
      ...useShimImportMap({ shimMode: true }),
      logger: consoleLogger,
      storage: globalThisStorageEntry,
      hostRemoteEntry: './remoteEntry.json',
      logLevel: 'debug',
    });
    const loadRemoteSlice = createSliceLoader(env, nf, manifest);

    // Standalone mode: mount the landing fragment into #root. A
    // `?fragment=<name>` override lets us mount any exposed fragment
    // directly — handy for smoke-testing fragments that aren't host-routed
    // (e.g. mfe-store-picker, which is normally consumed inside checkout).
    // The switch is static so esbuild keeps each bootstrap in its own
    // chunk (a dynamic-template import would hoist React to top-level and
    // break the es-module-shims bootstrap; see PLAN.md open question #5).
    const params = new URLSearchParams(window.location.search);
    const fragment = params.get('fragment') ?? 'home';
    let bootstrap: (e: typeof env, l: typeof loadRemoteSlice) => Promise<void>;
    switch (fragment) {
      case 'home':
        bootstrap = (await import('./features/home/bootstrap')).bootstrap;
        break;
      case 'category':
        bootstrap = (await import('./features/category/bootstrap')).bootstrap;
        break;
      case 'stores':
        bootstrap = (await import('./features/stores/bootstrap')).bootstrap;
        break;
      case 'store-picker':
        bootstrap = (await import('./features/store-picker/bootstrap')).bootstrap;
        break;
      default:
        throw new Error(`[explore] unknown fragment "${fragment}"`);
    }
    await bootstrap(env, loadRemoteSlice);

    const root = document.getElementById('root');
    if (root) {
      root.innerHTML = '';
      root.appendChild(document.createElement(`mfe-${fragment}`));
    }
  })
  .catch((err) => {
    console.error('Failed to load app!');
    if (showErrors) console.error(err);
  });
