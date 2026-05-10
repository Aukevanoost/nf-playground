import { describe, expect, it } from 'vitest';
import type { ListTeasersResponse } from '../contracts/endpoints/teaser-list.contract';
import { toTeaserListModel } from './teaser.mapper';

describe('teaser.mapper', () => {
  it('maps every teaser in the list', () => {
    const raw: ListTeasersResponse = [
      {
        title: 'Classic Tractors',
        image: '/img/classics.webp',
        link: {
          intent: 'explore.products.category',
          params: { category: 'classic' },
        },
      },
      {
        title: 'Autonomous Tractors',
        image: '/img/autonomous.webp',
        link: {
          intent: 'explore.products.category',
          params: { category: 'autonomous' },
        },
      },
    ];

    const models = toTeaserListModel(raw);
    expect(models.length).toBe(2);
    expect(models[0]).toEqual(raw[0]);
    expect(models[1]).toEqual(raw[1]);
  });

  it('returns an empty list for an empty response', () => {
    expect(toTeaserListModel([])).toEqual([]);
  });
});
