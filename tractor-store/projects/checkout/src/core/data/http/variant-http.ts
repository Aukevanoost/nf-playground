import {
  Injectable,
  resource,
  type ResourceRef,
  type Signal,
} from '@angular/core';
import type {
  GetVariantResponse,
  ListVariantsResponse,
} from '../contracts/endpoints/variant-list.contract';
import type { VariantModel } from '../contracts/models/variant.model';
import { toVariantListModel, toVariantModel } from '../mappers/variant.mapper';
import database from './variants.json';

const variants = (database as unknown as { variants: ListVariantsResponse })
  .variants;

@Injectable({ providedIn: 'root' })
export class VariantHttp {
  list(): ResourceRef<VariantModel[] | undefined> {
    return resource<VariantModel[], void>({
      loader: () => Promise.resolve(toVariantListModel(variants)),
    });
  }

  bySku(sku: Signal<string | undefined>): ResourceRef<VariantModel | undefined> {
    return resource<VariantModel | undefined, string | undefined>({
      params: () => sku(),
      loader: ({ params }) => {
        if (!params) return Promise.resolve(undefined);
        const match = variants.find((v) => v.sku === params);
        return Promise.resolve(
          match ? toVariantModel(match as GetVariantResponse) : undefined,
        );
      },
    });
  }
}
