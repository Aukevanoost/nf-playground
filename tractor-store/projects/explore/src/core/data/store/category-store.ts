import { computed, inject, Injectable } from '@angular/core';
import { CategoryHttp } from '../http/category-http';
import type { CategoryModel } from '../contracts/models/category.model';

@Injectable({ providedIn: 'root' })
export class CategoryStore {
  private readonly http = inject(CategoryHttp);

  private readonly listResource = this.http.list();
  readonly categories = this.listResource.value;
  readonly isLoading = this.listResource.isLoading;
  readonly error = this.listResource.error;
  readonly isLoaded = computed(
    () => this.listResource.status() === 'resolved',
  );

  findByKey(key: string | undefined | null): CategoryModel | undefined {
    if (!key) return undefined;
    return this.categories()?.find((c) => c.key === key);
  }

  reload(): void {
    this.listResource.reload();
  }
}
