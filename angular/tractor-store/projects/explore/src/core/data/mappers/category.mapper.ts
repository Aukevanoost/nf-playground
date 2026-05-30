import type {
  GetCategoryResponse,
  ListCategoriesResponse,
} from '../contracts/endpoints/category-list.contract';
import type { CategoryModel } from '../contracts/models/category.model';
import { toProductModel } from './product.mapper';

export function toCategoryModel(raw: GetCategoryResponse): CategoryModel {
  return {
    key: raw.key,
    name: raw.name,
    products: raw.products.map(toProductModel),
  };
}

export function toCategoryListModel(
  raw: ListCategoriesResponse,
): CategoryModel[] {
  return raw.map(toCategoryModel);
}
