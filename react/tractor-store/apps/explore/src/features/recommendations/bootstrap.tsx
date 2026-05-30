import { defineMfe } from '@react-internal/mfe-runtime';
import { Recommendations } from './Recommendations';

export const bootstrap = defineMfe('mfe-recommendations', Recommendations, {
  observedAttributes: ['skus'],
});
