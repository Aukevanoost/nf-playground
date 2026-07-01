import { Component, CUSTOM_ELEMENTS_SCHEMA, inject } from '@angular/core';
import { MODULE_LOADER } from '../app.config';

@Component({
  selector: 'app-loading-shell-eager',
  template: `<app-mfe5></app-mfe5>`,
  styleUrls: [],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class LoadingShellEagerComponent {
  loader = inject(MODULE_LOADER);

  constructor() {
    this.loader.loadRemoteModule('mfe5', './Bootstrap');
  }
}
