import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import type { VariantModel } from '../contracts/models/variant.model';
import { VariantHttp } from '../http/variant-http';
import { VariantStore } from './variant-store';

const fixture: VariantModel[] = [
  {
    id: 'AU-03',
    sku: 'AU-03-RD',
    name: 'FutureHarvest Navigator Scarlet Dynamo',
    image: '/img/AU-03-RD.webp',
    price: 1900,
    inventory: 8,
  },
  {
    id: 'CL-01',
    sku: 'CL-01-GR',
    name: 'Heritage Workhorse Verdant Field',
    image: '/img/CL-01-GR.webp',
    price: 5700,
    inventory: 8,
  },
];

function fakeHttp() {
  return {
    list() {
      return { value: signal(fixture) };
    },
  };
}

describe('VariantStore', () => {
  let store: VariantStore;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [{ provide: VariantHttp, useFactory: fakeHttp }],
    });
    store = TestBed.inject(VariantStore);
  });

  it('exposes the loaded variants list', () => {
    expect(store.variants()?.length).toBe(2);
  });

  it('findBySku returns the matching variant', () => {
    expect(store.findBySku('AU-03-RD')?.name).toBe(
      'FutureHarvest Navigator Scarlet Dynamo',
    );
  });

  it('findBySku returns undefined when no match', () => {
    expect(store.findBySku('NOPE')).toBeUndefined();
  });

  it('findBySku returns undefined for nullish input', () => {
    expect(store.findBySku(null)).toBeUndefined();
    expect(store.findBySku(undefined)).toBeUndefined();
  });

  it('returns undefined from findBySku when variants are not loaded', () => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        {
          provide: VariantHttp,
          useValue: { list: () => ({ value: signal(undefined) }) },
        },
      ],
    });
    const empty = TestBed.inject(VariantStore);
    expect(empty.findBySku('AU-03-RD')).toBeUndefined();
  });
});
