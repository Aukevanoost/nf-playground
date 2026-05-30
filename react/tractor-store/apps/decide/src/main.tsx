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

    // Standalone mode: support `?fragment=<name>&id=<id>&sku=<sku>` to mount
    // a fragment with routeParams set. Defaults to mfe-product with a sample
    // product id so /decide standalone "just works" for visual checks.
    const params = new URLSearchParams(window.location.search);
    const fragment = params.get('fragment') ?? 'product';
    let bootstrap: (e: typeof env, l: typeof loadRemoteSlice) => Promise<void>;
    switch (fragment) {
      case 'product':
        bootstrap = (await import('./features/product/bootstrap')).bootstrap;
        break;
      default:
        throw new Error(`[decide] unknown fragment "${fragment}"`);
    }
    await bootstrap(env, loadRemoteSlice);

    const root = document.getElementById('root');
    if (root) {
      root.innerHTML = '';
      const el = document.createElement(`mfe-${fragment}`) as HTMLElement & {
        routeParams?: Record<string, string>;
      };
      // Pre-seed routeParams so standalone /decide?id=AU-02 renders a product.
      const id = params.get('id') ?? 'AU-02';
      const sku = params.get('sku');
      el.routeParams = sku ? { id, sku } : { id };
      root.appendChild(el);
    }
  })
  .catch((err) => {
    console.error('Failed to load app!');
    if (showErrors) console.error(err);
  });
