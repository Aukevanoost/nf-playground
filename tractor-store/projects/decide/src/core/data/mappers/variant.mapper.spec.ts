import { describe, expect, it } from 'vitest';
import type { VariantDto } from '../contracts/endpoints/product-list.contract';
import { toVariantModel } from './variant.mapper';

describe('variant.mapper', () => {
  it('maps every contract field onto the model', () => {
    const dto: VariantDto = {
      sku: 'CL-01-GR',
      name: 'Verdant Field',
      image: '/cdn/img/product/[size]/CL-01-GR.webp',
      color: '#6B8E23',
      price: 5700,
    };

    expect(toVariantModel(dto)).toEqual({
      sku: 'CL-01-GR',
      name: 'Verdant Field',
      image: '/cdn/img/product/[size]/CL-01-GR.webp',
      color: '#6B8E23',
      price: 5700,
    });
  });

  it('does not leak unknown fields from the contract', () => {
    const dto = {
      sku: 'CL-01-GY',
      name: 'Stormy Sky',
      image: '/img/CL-01-GY.webp',
      color: '#708090',
      price: 6200,
      // forwards-compatible extra field on the wire
      extra: 'should be dropped',
    } as unknown as VariantDto;

    const model = toVariantModel(dto);
    expect(Object.keys(model).sort()).toEqual([
      'color',
      'image',
      'name',
      'price',
      'sku',
    ]);
  });

  it('preserves the [size] placeholder so callers can substitute later', () => {
    const dto: VariantDto = {
      sku: 'AU-01-SI',
      name: 'Silver',
      image: '/cdn/img/product/[size]/AU-01-SI.webp',
      color: '#C0C0C0',
      price: 1000,
    };

    expect(toVariantModel(dto).image).toContain('[size]');
  });
});
