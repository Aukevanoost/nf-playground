import { computed, inject, Injectable } from '@angular/core';
import { TeaserHttp } from '../http/teaser-http';

@Injectable({ providedIn: 'root' })
export class TeaserStore {
  private readonly http = inject(TeaserHttp);

  private readonly listResource = this.http.list();
  readonly teasers = this.listResource.value;
  readonly isLoading = this.listResource.isLoading;
  readonly error = this.listResource.error;
  readonly isLoaded = computed(
    () => this.listResource.status() === 'resolved',
  );

  reload(): void {
    this.listResource.reload();
  }
}
