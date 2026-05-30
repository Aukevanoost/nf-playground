import { describe, expect, it } from 'vitest';
import type { ProductDto } from '../contracts/endpoints/category-list.contract';
import { toProductModel } from './product.mapper';

describe('product.mapper', () => {
  it('toProductModel maps every contract field onto the model', () => {
    const dto: ProductDto = {
      id: 'CL-01',
      name: 'Heritage Workhorse',
      image: '/img/CL-01.webp',
      startPrice: 5700,
      link: { intent: 'decide.product', params: { id: 'CL-01' } },
    };

    expect(toProductModel(dto)).toEqual({
      id: 'CL-01',
      name: 'Heritage Workhorse',
      image: '/img/CL-01.webp',
      startPrice: 5700,
      link: { intent: 'decide.product', params: { id: 'CL-01' } },
    });
  });

  it('toProductModel does not leak unknown fields from the contract', () => {
    const dto = {
      id: 'CL-02',
      name: 'Falcon',
      image: '/img/CL-02.webp',
      startPrice: 2600,
      link: { intent: 'decide.product', params: { id: 'CL-02' } },
      // simulate forwards-compatible extra field on the wire
      extra: 'should be dropped',
    } as unknown as ProductDto;

    const model = toProductModel(dto);
    expect(Object.keys(model).sort()).toEqual([
      'id',
      'image',
      'link',
      'name',
      'startPrice',
    ]);
  });
});
