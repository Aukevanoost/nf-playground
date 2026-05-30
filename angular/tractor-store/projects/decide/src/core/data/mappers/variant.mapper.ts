import type { VariantDto } from '../contracts/endpoints/product-list.contract';
import type { VariantModel } from '../contracts/models/variant.model';

export function toVariantModel(raw: VariantDto): VariantModel {
  return {
    sku: raw.sku,
    name: raw.name,
    image: raw.image,
    color: raw.color,
    price: raw.price,
  };
}
