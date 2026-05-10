import { computed, signal, type Signal } from '@angular/core';
import type { ProductModel } from '../core/data/contracts/models/product.model';
import { productFixture } from './product.fixture';

interface FakeResource<T> {
  value: Signal<T>;
  isLoading: Signal<boolean>;
  error: Signal<unknown>;
  status: Signal<'idle' | 'loading' | 'resolved' | 'error'>;
  reload: () => void;
}

function fakeResource<T>(value: Signal<T>): FakeResource<T> {
  return {
    value,
    isLoading: signal(false),
    error: signal(undefined),
    status: signal('resolved'),
    reload: () => {},
  };
}

export function fakeProductHttp(catalog: ProductModel[] = productFixture) {
  return {
    getById(id: Signal<string | undefined | null>) {
      const value = computed(() => catalog.find((p) => p.id === id()));
      return fakeResource<ProductModel | undefined>(value);
    },
  };
}
