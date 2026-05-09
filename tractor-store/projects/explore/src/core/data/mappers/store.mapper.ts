import type { ListStoresResponse } from '../contracts/endpoints/store-list.contract';
import type { StoreModel } from '../contracts/models/store.model';

export function toStoreListModel(raw: ListStoresResponse): StoreModel[] {
  return raw.map((s) => ({
    id: s.id,
    name: s.name,
    street: s.street,
    city: s.city,
    image: s.image,
  }));
}
