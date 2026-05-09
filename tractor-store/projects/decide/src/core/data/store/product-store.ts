import { computed, inject, Injectable } from '@angular/core';
import type { ProductModel } from '../contracts/models/product.model';
import { ProductHttp } from '../http/product-http';

@Injectable({ providedIn: 'root' })
export class ProductStore {
  private readonly http = inject(ProductHttp);

  private readonly listResource = this.http.list();
  readonly products = this.listResource.value;
  readonly isLoading = this.listResource.isLoading;
  readonly error = this.listResource.error;
  readonly isLoaded = computed(
    () => this.listResource.status() === 'resolved',
  );

  findById(id: string | undefined | null): ProductModel | undefined {
    if (!id) return undefined;
    return this.products()?.find((p) => p.id === id);
  }

  reload(): void {
    this.listResource.reload();
  }
}
