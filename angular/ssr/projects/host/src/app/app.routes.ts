import { inject, Type } from '@angular/core';
import { Routes } from '@angular/router';

import { LOAD_REMOTE_MODULE } from './load-remote-module.token';
import { App } from './app';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    loadComponent: () => App,
  },
  {
    path: 'mfe1',
    loadComponent: () =>
      inject(LOAD_REMOTE_MODULE)('mfe1', './Component') as Promise<Type<unknown>>,
  },
];
