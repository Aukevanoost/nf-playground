import { Injectable, resource, type ResourceRef } from '@angular/core';
import type { ListTeasersResponse } from '../contracts/endpoints/teaser-list.contract';
import type { TeaserModel } from '../contracts/models/teaser.model';
import { toTeaserListModel } from '../mappers/teaser.mapper';

const NETWORK_LATENCY_MS = 150;

function fakeNetwork<T>(payload: T): Promise<T> {
  return new Promise((resolve) =>
    setTimeout(() => resolve(payload), NETWORK_LATENCY_MS),
  );
}

const teasers: ListTeasersResponse = [
  {
    title: 'Classic Tractors',
    image: '/cdn/img/scene/[size]/classics.webp',
    link: { intent: 'explore.products.category', params: { category: 'classic' } },
  },
  {
    title: 'Autonomous Tractors',
    image: '/cdn/img/scene/[size]/autonomous.webp',
    link: { intent: 'explore.products.category', params: { category: 'autonomous' } },
  },
];

@Injectable({ providedIn: 'root' })
export class TeaserHttp {
  list(): ResourceRef<TeaserModel[] | undefined> {
    return resource<TeaserModel[], void>({
      loader: () => fakeNetwork(toTeaserListModel(teasers)),
    });
  }
}
