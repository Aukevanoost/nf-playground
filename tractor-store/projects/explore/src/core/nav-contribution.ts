import { NavContribution } from '@internal/events';

export const navContribution: NavContribution = {
  source: '@tractor-store/explore',
  basePath: 'explore',
  intents: [
    { id: 'explore.home', path: '/', element: 'mfe-home' },
    { id: 'explore.products', path: '/products', element: 'mfe-category' },
    {
      id: 'explore.products.category',
      path: '/products/:category',
      element: 'mfe-category',
    },
    { id: 'explore.stores', path: '/stores', element: 'mfe-stores' },
  ],
};
