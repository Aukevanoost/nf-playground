import {
  ChangeDetectionStrategy,
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  computed,
  inject,
} from '@angular/core';
import { StoreStore } from '../../core/data/store/store-store';
import { StoreTileComponent } from '../../shared/components/store-tile/store-tile';
import { LOADER } from '../../core/remote-loader';

@Component({
  selector: 'app-stores',
  imports: [StoreTileComponent],
  templateUrl: './stores.page.html',
  styleUrl: './stores.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  host: { 'data-boundary-page': 'explore' },
})
export class StoresPage {
  private readonly storeStore = inject(StoreStore);
  readonly stores = computed(() => this.storeStore.stores() ?? []);
  private loader = inject(LOADER);

  constructor() {
    void this.loader('@tractor-store/explore', 'mfe-header');
    void this.loader('@tractor-store/explore', 'mfe-footer');
  }
}
