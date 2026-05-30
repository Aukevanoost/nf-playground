import { initFederation } from '@softarc/native-federation-orchestrator';
import {
  useShimImportMap,
  consoleLogger,
  globalThisStorageEntry,
} from '@softarc/native-federation-orchestrator/options';
import {
  createRegistry,
  NFEventRegistry,
} from '@softarc/native-federation-orchestrator/registry';

declare global {
  interface Window {
    __NF_REGISTRY__: NFEventRegistry;
  }
}

// Install the cross-MFE event bus before any module that calls
// `defineChannel(...)` is imported — every channel handle is created (and
// frozen) at module load time and throws if the bus is missing. The dynamic
// `import('./app/bootstrap')` below is what first pulls in `@react-internal/event-bus`,
// by which point this IIFE has already populated `window.__NF_REGISTRY__`.
(function (): void {
  const registry = createRegistry({
    maxStreams: 20,
    maxEvents: 1,
    removePercentage: 0.25,
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
    const { bootstrap } = await import('./app/bootstrap');
    await bootstrap(env, nf, manifest);
  })
  .catch((err) => {
    console.error('Failed to load app!');
    if (showErrors) console.error(err);
  });
