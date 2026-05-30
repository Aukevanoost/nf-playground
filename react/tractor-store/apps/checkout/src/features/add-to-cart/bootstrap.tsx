import { defineMfe } from '@react-internal/mfe-runtime';
import { AddToCart } from './AddToCart';

export const bootstrap = defineMfe('mfe-add-to-cart', AddToCart, {
  observedAttributes: ['sku'],
});
