import { NavContribution } from '@internal/events';

export const navContribution: NavContribution = {
  source: '@tractor-store/decide',
  basePath: 'decide',
  intents: [
    { id: 'decide.product', path: '/product/:id', element: 'mfe-product' },
  ],
};
