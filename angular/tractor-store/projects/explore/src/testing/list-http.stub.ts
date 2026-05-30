import { computed, signal, type Signal } from '@angular/core';

interface FakeResource<T> {
  value: Signal<T | undefined>;
  isLoading: Signal<boolean>;
  error: Signal<unknown>;
  status: Signal<'idle' | 'loading' | 'resolved' | 'error'>;
  reload: () => void;
}

function fakeResource<T>(value: Signal<T | undefined>): FakeResource<T> {
  return {
    value,
    isLoading: signal(false),
    error: signal(undefined),
    status: signal('resolved'),
    reload: () => {},
  };
}

/** Stand-in for an `http.list()` returning a `ResourceRef`-shaped object. */
export function fakeListHttp<T>(value: T | undefined) {
  return {
    list: () => fakeResource<T>(signal(value)),
  };
}

/** Stand-in for `CategoryHttp` exposing both list() and the reactive byKey(). */
export function fakeCategoryHttp<
  C extends { key: string },
>(catalog: C[] | undefined) {
  const list = signal<C[] | undefined>(catalog);
  return {
    list: () => fakeResource<C[]>(list),
    byKey: (keySig: Signal<string | undefined | null>) => {
      const value = computed(() => {
        const k = keySig();
        if (!k) return undefined;
        return list()?.find((c) => c.key === k);
      });
      return fakeResource<C | undefined>(value);
    },
  };
}
