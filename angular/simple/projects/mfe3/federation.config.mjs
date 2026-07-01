import {withNativeFederation, shareAll} from '@angular-architects/native-federation/config';


// export interface NativeFederationExternalConfig {
//   singleton?: boolean;
//   strictVersion?: boolean;
//   requiredVersion?: string;
//   version?: string;
//   includeSecondaries?: 
//     | { skip?: string | string[]; resolveGlob?: boolean; keepAll?: boolean }
//     | boolean;
//   platform?: 'browser' | 'node';
//   build?: 'separate' | 'package' | 'default';
//   chunks?: boolean;
//   shareScope?: string;
//   packageInfo?: {
//     entryPoint: string;
//     version?: string;
//     esm?: boolean;
//   };
// }


export default withNativeFederation({

  name: 'mfe3',

  exposes: {
    './Component': './projects/mfe3/src/app/app.component.ts',
    './Bootstrap': './projects/mfe3/src/bootstrap.ts',
  },

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
    // denseChunking: true,
    // integrityHashes: true
  }
});
