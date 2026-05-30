import type { ProductModel } from './product.model';

export interface CategoryModel {
  key: string;
  name: string;
  products: ProductModel[];
}
