import type { TeaserModel } from '../core/data/contracts/models/teaser.model';

export const teaserFixture: TeaserModel[] = [
  {
    title: 'Classic Tractors',
    image: '/img/[size]/classics.webp',
    link: {
      intent: 'explore.products.category',
      params: { category: 'classic' },
    },
  },
  {
    title: 'Autonomous Tractors',
    image: '/img/[size]/autonomous.webp',
    link: {
      intent: 'explore.products.category',
      params: { category: 'autonomous' },
    },
  },
];
