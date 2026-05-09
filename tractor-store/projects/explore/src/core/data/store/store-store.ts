import { computed, inject, Injectable } from '@angular/core';
import { StoreHttp } from '../http/store-http';

@Injectable({ providedIn: 'root' })
export class StoreStore {
  private readonly http = inject(StoreHttp);

  private readonly listResource = this.http.list();
  readonly stores = this.listResource.value;
  readonly isLoading = this.listResource.isLoading;
  readonly error = this.listResource.error;
  readonly isLoaded = computed(
    () => this.listResource.status() === 'resolved',
  );

  reload(): void {
    this.listResource.reload();
  }
}
