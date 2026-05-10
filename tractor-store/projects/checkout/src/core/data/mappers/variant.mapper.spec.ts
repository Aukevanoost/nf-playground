import { describe, expect, it } from 'vitest';
import type {
  GetVariantResponse,
  ListVariantsResponse,
} from '../contracts/endpoints/variant-list.contract';
import { toVariantListModel, toVariantModel } from './variant.mapper';

const dto: GetVariantResponse = {
  id: 'AU-03',
  sku: 'AU-03-RD',
  name: 'FutureHarvest Navigator Scarlet Dynamo',
  image: '/cdn/img/product/[size]/AU-03-RD.webp',
  price: 1900,
  inventory: 8,
};

describe('variant.mapper', () => {
  describe('toVariantModel', () => {
    it('maps every contract field onto the model', () => {
      expect(toVariantModel(dto)).toEqual({
        id: 'AU-03',
        sku: 'AU-03-RD',
        name: 'FutureHarvest Navigator Scarlet Dynamo',
        image: '/cdn/img/product/[size]/AU-03-RD.webp',
        price: 1900,
        inventory: 8,
      });
    });

    it('does not leak unknown fields from the contract', () => {
      const dirty = {
        ...dto,
        leaked: 'should be dropped',
      } as unknown as GetVariantResponse;

      expect(Object.keys(toVariantModel(dirty)).sort()).toEqual([
        'id',
        'image',
        'inventory',
        'name',
        'price',
        'sku',
      ]);
    });

    it('preserves the [size] placeholder so callers can substitute later', () => {
      expect(toVariantModel(dto).image).toContain('[size]');
    });

    it('preserves a zero inventory verbatim', () => {
      const sold = { ...dto, inventory: 0 };
      expect(toVariantModel(sold).inventory).toBe(0);
    });
  });

  describe('toVariantListModel', () => {
    it('maps each entry in the list', () => {
      const list: ListVariantsResponse = [dto, { ...dto, sku: 'AU-03-PL' }];
      const models = toVariantListModel(list);
      expect(models.map((v) => v.sku)).toEqual(['AU-03-RD', 'AU-03-PL']);
    });

    it('returns an empty array for an empty list', () => {
      expect(toVariantListModel([])).toEqual([]);
    });

    it('preserves order of the input list', () => {
      const list: ListVariantsResponse = [
        { ...dto, sku: 'CL-01-GR' },
        { ...dto, sku: 'AU-03-RD' },
        { ...dto, sku: 'CL-04-TQ' },
      ];
      expect(toVariantListModel(list).map((v) => v.sku)).toEqual([
        'CL-01-GR',
        'AU-03-RD',
        'CL-04-TQ',
      ]);
    });
  });
});
