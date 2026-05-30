import {withNativeFederation, shareAll} from '@angular-architects/native-federation-v4/config';

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
  sharedMappings: ["@ng-internal/event-bus", "@ng-internal/navigation", "@ng-internal/url", "@ng-internal/ui", "@ng-internal/logging"],
  skip: [
    'rxjs/ajax', 
    'rxjs/fetch',
    'rxjs/testing',
    'rxjs/webSocket',
    // Add further packages you don't need at runtime
  ],

  features: { 
    mappingVersion: true,   // by default now
    ignoreUnusedDeps: true, // by default now
    denseChunking: true,
    integrityHashes: true
  }
});
