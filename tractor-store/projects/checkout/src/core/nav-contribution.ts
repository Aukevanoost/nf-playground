import { NavContribution } from '@internal/navigation';

export const navContribution: NavContribution = {
  source: '@tractor-store/checkout',
  basePath: 'checkout',
  intents: [
    { id: 'checkout.cart', path: '/cart', element: 'mfe-cart' },
    { id: 'checkout.checkout', path: '/checkout', element: 'mfe-checkout' },
    { id: 'checkout.thanks', path: '/thanks', element: 'mfe-thanks' },
  ],
};
