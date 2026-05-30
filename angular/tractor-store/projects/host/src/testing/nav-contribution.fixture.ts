import type { NavContribution } from '@ng-internal/navigation';

export const exploreContribution: NavContribution = {
  source: '@tractor-store/explore',
  basePath: 'explore',
  intents: [
    { id: 'home', path: '/', element: 'mfe-explore-home' },
    {
      id: 'products',
      path: '/products',
      element: 'mfe-explore-list',
    },
  ],
};

export const decideContribution: NavContribution = {
  source: '@tractor-store/decide',
  basePath: 'decide',
  intents: [
    {
      id: 'product',
      path: '/product/{id}',
      element: 'mfe-decide-product',
    },
  ],
};
