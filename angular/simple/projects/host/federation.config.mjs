import {withNativeFederation, shareAll} from '@angular-architects/native-federation/config';

export default withNativeFederation({
  name: "host",
  shared: {
    ...shareAll(
      { singleton: true, strictVersion: true, requiredVersion: 'auto', build: 'package' },
      {
        overrides: {
          '@angular/core': { singleton: true, strictVersion: true, requiredVersion: 'auto', build: 'package',  includeSecondaries: {keepAll: true}},
        }
      }
    ),
  },
  skip: [
    'rxjs/ajax', 
    'rxjs/fetch',
    'rxjs/testing',
    'rxjs/webSocket',
    // Add further packages you don't need at runtime
  ],

  features: { 
    ignoreUnusedDeps: true, // by default now
    mappingVersion: true,  // by default now
    // denseChunking: true,
    // integrityHashes: true
  }
});
