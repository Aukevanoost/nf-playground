import {
  Injectable,
  resource,
  type ResourceRef,
  type Signal,
} from '@angular/core';
import type {
  GetProductResponse,
  ListProductsResponse,
} from '../contracts/endpoints/product-list.contract';
import type { ProductModel } from '../contracts/models/product.model';
import { toProductListModel, toProductModel } from '../mappers/product.mapper';
import database from './products.json';

const products = (database as unknown as { products: ListProductsResponse })
  .products;

@Injectable({ providedIn: 'root' })
export class ProductHttp {
  list(): ResourceRef<ProductModel[] | undefined> {
    return resource<ProductModel[], void>({
      loader: () => Promise.resolve(toProductListModel(products)),
    });
  }

  byId(id: Signal<string | undefined>): ResourceRef<ProductModel | undefined> {
    return resource<ProductModel | undefined, string | undefined>({
      params: () => id(),
      loader: ({ params }) => {
        if (!params) return Promise.resolve(undefined);
        const match = products.find((p) => p.id === params);
        return Promise.resolve(
          match ? toProductModel(match as GetProductResponse) : undefined,
        );
      },
    });
  }
}
