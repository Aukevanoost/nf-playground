import type { VariantModel } from './variant.model';

export interface ProductModel {
  id: string;
  name: string;
  category: string;
  highlights: string[];
  variants: VariantModel[];
}
