import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import type { ProductModel } from '../contracts/models/product.model';
import { ProductHttp } from '../http/product-http';
import { ProductStore } from './product-store';

const fixture: ProductModel[] = [
  {
    id: 'CL-01',
    name: 'Heritage Workhorse',
    category: 'classic',
    highlights: ['Reliable'],
    variants: [
      {
        sku: 'CL-01-GR',
        name: 'Verdant Field',
        image: '/img/CL-01-GR.webp',
        color: '#6B8E23',
        price: 5700,
      },
    ],
  },
  {
    id: 'AU-02',
    name: 'SmartFarm Titan',
    category: 'autonomous',
    highlights: [],
    variants: [
      {
        sku: 'AU-02-OG',
        name: 'Sunset Copper',
        image: '/img/AU-02-OG.webp',
        color: '#dd5219',
        price: 4100,
      },
    ],
  },
];

function fakeHttp() {
  return {
    list() {
      return { value: signal(fixture) };
    },
  };
}

describe('ProductStore', () => {
  let store: ProductStore;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [{ provide: ProductHttp, useFactory: fakeHttp }],
    });
    store = TestBed.inject(ProductStore);
  });

  it('exposes the loaded products list', () => {
    expect(store.products()?.length).toBe(2);
  });

  it('findById returns the matching product', () => {
    expect(store.findById('CL-01')?.name).toBe('Heritage Workhorse');
  });

  it('findById returns undefined when no match', () => {
    expect(store.findById('NOPE')).toBeUndefined();
  });

  it('findById returns undefined for nullish input', () => {
    expect(store.findById(null)).toBeUndefined();
    expect(store.findById(undefined)).toBeUndefined();
  });

  it('returns undefined from findById when products are not loaded', () => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        {
          provide: ProductHttp,
          useValue: { list: () => ({ value: signal(undefined) }) },
        },
      ],
    });
    const empty = TestBed.inject(ProductStore);
    expect(empty.findById('CL-01')).toBeUndefined();
  });
});
