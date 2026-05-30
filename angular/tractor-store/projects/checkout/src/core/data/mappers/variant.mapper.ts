import type {
  GetVariantResponse,
  ListVariantsResponse,
} from '../contracts/endpoints/variant-list.contract';
import type { VariantModel } from '../contracts/models/variant.model';

export function toVariantModel(raw: GetVariantResponse): VariantModel {
  return {
    id: raw.id,
    sku: raw.sku,
    name: raw.name,
    image: raw.image,
    price: raw.price,
    inventory: raw.inventory,
  };
}

export function toVariantListModel(raw: ListVariantsResponse): VariantModel[] {
  return raw.map(toVariantModel);
}
