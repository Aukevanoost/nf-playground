import { describe, expect, it } from 'vitest';
import type { ListStoresResponse } from '../contracts/endpoints/store-list.contract';
import { toStoreListModel } from './store.mapper';

describe('store.mapper', () => {
  it('maps every store in the list', () => {
    const raw: ListStoresResponse = [
      {
        id: 'store-a',
        name: 'Aurora',
        street: 'Astronaut Way 1',
        city: 'Arlington',
        image: '/img/store-1.webp',
      },
    ];

    expect(toStoreListModel(raw)).toEqual(raw);
  });

  it('returns an empty list for an empty response', () => {
    expect(toStoreListModel([])).toEqual([]);
  });
});
