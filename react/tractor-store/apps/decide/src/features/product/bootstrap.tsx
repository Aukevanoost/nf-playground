import { defineMfe } from '@react-internal/mfe-runtime';
import { Product } from './Product';

export const bootstrap = defineMfe('mfe-product', Product);
