import { computed, inject, Injectable } from '@angular/core';
import type { VariantModel } from '../contracts/models/variant.model';
import { VariantHttp } from '../http/variant-http';

@Injectable({ providedIn: 'root' })
export class VariantStore {
  private readonly http = inject(VariantHttp);

  private readonly listResource = this.http.list();
  readonly variants = this.listResource.value;
  readonly isLoading = this.listResource.isLoading;
  readonly error = this.listResource.error;
  readonly isLoaded = computed(
    () => this.listResource.status() === 'resolved',
  );

  findBySku(sku: string | undefined | null): VariantModel | undefined {
    if (!sku) return undefined;
    return this.variants()?.find((v) => v.sku === sku);
  }

  reload(): void {
    this.listResource.reload();
  }
}
