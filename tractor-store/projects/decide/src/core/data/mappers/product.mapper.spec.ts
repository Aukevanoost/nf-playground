import { describe, expect, it } from 'vitest';
import type {
  GetProductResponse,
  ListProductsResponse,
} from '../contracts/endpoints/product-list.contract';
import { toProductListModel, toProductModel } from './product.mapper';

const dto: GetProductResponse = {
  id: 'CL-01',
  name: 'Heritage Workhorse',
  category: 'classic',
  highlights: ['Reliable', 'Durable'],
  variants: [
    {
      sku: 'CL-01-GR',
      name: 'Verdant Field',
      image: '/img/CL-01-GR.webp',
      color: '#6B8E23',
      price: 5700,
    },
    {
      sku: 'CL-01-GY',
      name: 'Stormy Sky',
      image: '/img/CL-01-GY.webp',
      color: '#708090',
      price: 6200,
    },
  ],
};

describe('product.mapper', () => {
  describe('toProductModel', () => {
    it('maps every field onto the model', () => {
      expect(toProductModel(dto)).toEqual({
        id: 'CL-01',
        name: 'Heritage Workhorse',
        category: 'classic',
        highlights: ['Reliable', 'Durable'],
        variants: [
          {
            sku: 'CL-01-GR',
            name: 'Verdant Field',
            image: '/img/CL-01-GR.webp',
            color: '#6B8E23',
            price: 5700,
          },
          {
            sku: 'CL-01-GY',
            name: 'Stormy Sky',
            image: '/img/CL-01-GY.webp',
            color: '#708090',
            price: 6200,
          },
        ],
      });
    });

    it('defaults highlights to an empty array when omitted', () => {
      const without = { ...dto, highlights: undefined };
      expect(toProductModel(without).highlights).toEqual([]);
    });

    it('keeps highlights as an empty array when explicitly empty', () => {
      expect(toProductModel({ ...dto, highlights: [] }).highlights).toEqual([]);
    });

    it('routes each variant through the variant mapper', () => {
      const dirty = {
        ...dto,
        variants: [
          {
            sku: 'CL-01-GR',
            name: 'Verdant Field',
            image: '/img/CL-01-GR.webp',
            color: '#6B8E23',
            price: 5700,
            extra: 'should be dropped',
          },
        ],
      } as unknown as GetProductResponse;

      const [variant] = toProductModel(dirty).variants;
      expect(Object.keys(variant).sort()).toEqual([
        'color',
        'image',
        'name',
        'price',
        'sku',
      ]);
    });

    it('does not leak unknown fields from the contract', () => {
      const dirty = {
        ...dto,
        leaked: 'should be dropped',
      } as unknown as GetProductResponse;

      expect(Object.keys(toProductModel(dirty)).sort()).toEqual([
        'category',
        'highlights',
        'id',
        'name',
        'variants',
      ]);
    });
  });

  describe('toProductListModel', () => {
    it('maps each entry in the list', () => {
      const list: ListProductsResponse = [dto, { ...dto, id: 'CL-02' }];
      const models = toProductListModel(list);
      expect(models.map((p) => p.id)).toEqual(['CL-01', 'CL-02']);
    });

    it('returns an empty array for an empty list', () => {
      expect(toProductListModel([])).toEqual([]);
    });

    it('preserves order of the input list', () => {
      const list: ListProductsResponse = [
        { ...dto, id: 'AU-01' },
        { ...dto, id: 'CL-01' },
        { ...dto, id: 'AU-02' },
      ];
      expect(toProductListModel(list).map((p) => p.id)).toEqual([
        'AU-01',
        'CL-01',
        'AU-02',
      ]);
    });
  });
});
