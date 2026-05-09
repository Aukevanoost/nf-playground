export interface VariantDto {
  sku: string;
  name: string;
  image: string;
  color: string;
  price: number;
}

export interface ProductDto {
  id: string;
  name: string;
  category: string;
  highlights?: string[];
  variants: VariantDto[];
}

export type ListProductsResponse = ProductDto[];
export type GetProductResponse = ProductDto;
