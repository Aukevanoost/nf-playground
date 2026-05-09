export interface VariantDto {
  id: string;
  sku: string;
  name: string;
  image: string;
  price: number;
  inventory: number;
}

export type ListVariantsResponse = VariantDto[];
export type GetVariantResponse = VariantDto;
