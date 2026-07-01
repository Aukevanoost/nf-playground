import {withNativeFederation, shareAll} from '@angular-architects/native-federation/config';

export default withNativeFederation({

  name: 'team/mfe1',
  exposes: {
    './Component': './projects/mfe1/src/bootstrap.ts',
  },
  shared: {
    ...shareAll(
      { singleton: true, strictVersion: true, requiredVersion: 'auto' },
      {
        overrides: {
          // the includeSecondaries is an opt-out of 'ignoreUnusedDeps' So all of @angular/core is shared to prevent mismatches
          '@angular/core': { singleton: true, strictVersion: true, requiredVersion: 'auto', includeSecondaries: {keepAll: true}},
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
    // denseChunking: true,
    // integrityHashes: true
  }
});
