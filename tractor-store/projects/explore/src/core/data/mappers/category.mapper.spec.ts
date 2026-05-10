import { describe, expect, it } from 'vitest';
import type {
  CategoryDto,
  ListCategoriesResponse,
} from '../contracts/endpoints/category-list.contract';
import {
  toCategoryListModel,
  toCategoryModel,
} from './category.mapper';

const dto: CategoryDto = {
  key: 'classic',
  name: 'Classics',
  products: [
    {
      id: 'CL-01',
      name: 'Heritage Workhorse',
      image: '/img/CL-01.webp',
      startPrice: 5700,
      link: { intent: 'decide.product', params: { id: 'CL-01' } },
    },
    {
      id: 'CL-02',
      name: 'Falcon Crest',
      image: '/img/CL-02.webp',
      startPrice: 2600,
      link: { intent: 'decide.product', params: { id: 'CL-02' } },
    },
  ],
};

describe('category.mapper', () => {
  it('toCategoryModel maps key and name', () => {
    const model = toCategoryModel(dto);
    expect(model.key).toBe('classic');
    expect(model.name).toBe('Classics');
  });

  it('toCategoryModel maps every product through the product mapper', () => {
    const model = toCategoryModel(dto);
    expect(model.products.length).toBe(2);
    expect(model.products[0]).toEqual({
      id: 'CL-01',
      name: 'Heritage Workhorse',
      image: '/img/CL-01.webp',
      startPrice: 5700,
      link: { intent: 'decide.product', params: { id: 'CL-01' } },
    });
  });

  it('toCategoryListModel maps every category in the list', () => {
    const list: ListCategoriesResponse = [dto, { ...dto, key: 'autonomous', name: 'Autonomous' }];
    const models = toCategoryListModel(list);
    expect(models.length).toBe(2);
    expect(models.map((c) => c.key)).toEqual(['classic', 'autonomous']);
  });

  it('toCategoryModel handles a category with no products', () => {
    const model = toCategoryModel({ ...dto, products: [] });
    expect(model.products).toEqual([]);
  });
});
