import type { StoreModel } from '../core/data/contracts/models/store.model';

export const storeFixture: StoreModel[] = [
  {
    id: 'store-a',
    name: 'Aurora Flagship Store',
    street: 'Astronaut Way 1',
    city: 'Arlington',
    image: '/img/[size]/store-1.webp',
  },
  {
    id: 'store-b',
    name: 'Big Micro Machines',
    street: 'Broadway 2',
    city: 'Burlington',
    image: '/img/[size]/store-2.webp',
  },
];
