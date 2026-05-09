export interface StoreDto {
  id: string;
  name: string;
  street: string;
  city: string;
  image: string;
}

export type ListStoresResponse = StoreDto[];
