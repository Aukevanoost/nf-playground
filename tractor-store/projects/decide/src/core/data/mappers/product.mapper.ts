import type {
  GetProductResponse,
  ListProductsResponse,
} from '../contracts/endpoints/product-list.contract';
import type { ProductModel } from '../contracts/models/product.model';
import { toVariantModel } from './variant.mapper';

export function toProductModel(raw: GetProductResponse): ProductModel {
  return {
    id: raw.id,
    name: raw.name,
    category: raw.category,
    highlights: raw.highlights ?? [],
    variants: raw.variants.map(toVariantModel),
  };
}

export function toProductListModel(raw: ListProductsResponse): ProductModel[] {
  return raw.map(toProductModel);
}
