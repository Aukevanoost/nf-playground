import {
  initFederation,
  NativeFederationResult,
} from '@softarc/native-federation-orchestrator';
import {
  useShimImportMap,
  consoleLogger,
  globalThisStorageEntry,
} from '@softarc/native-federation-orchestrator/options';

let showErrors = false;

fetch('./env.config.json')
  .then((resp) => resp.json())
  .then(async (cfg) => {
    showErrors = !cfg.production;
    const nf: NativeFederationResult = await initFederation(cfg.manifest ?? {}, {
      ...useShimImportMap({ shimMode: true }),
      logger: consoleLogger,
      storage: globalThisStorageEntry,
      hostRemoteEntry: './remoteEntry.json',
      logLevel: 'debug',
    });
    return import('./app/bootstrap').then((m: any) =>
      m.bootstrap(cfg, nf.loadRemoteModule),
    );
  })

  .catch((err) => {
    console.error('Failed to load app!');
    if (showErrors) console.error(err);
  });
