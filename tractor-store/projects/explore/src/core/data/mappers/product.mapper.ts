import type { ProductDto } from '../contracts/endpoints/category-list.contract';
import type { ProductModel } from '../contracts/models/product.model';

export function toProductModel(raw: ProductDto): ProductModel {
  return {
    id: raw.id,
    name: raw.name,
    image: raw.image,
    startPrice: raw.startPrice,
    link: raw.link,
  };
}
