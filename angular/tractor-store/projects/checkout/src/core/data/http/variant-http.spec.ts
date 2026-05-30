import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import type { VariantModel } from '../contracts/models/variant.model';
import { VariantHttp } from './variant-http';

describe('VariantHttp', () => {
  let http: VariantHttp;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    http = TestBed.inject(VariantHttp);
  });

  async function settle<T>(ref: {
    status: () => string;
    value: () => T;
  }): Promise<T> {
    while (ref.status() === 'loading' || ref.status() === 'idle') {
      await new Promise((r) => setTimeout(r, 20));
    }
    return ref.value();
  }

  describe('getBySku', () => {
    it('resolves the matching variant', async () => {
      const sku = signal<string | undefined>('AU-03-RD');
      const ref = TestBed.runInInjectionContext(() => http.getBySku(sku));
      const value = await settle(ref);
      expect(value?.sku).toBe('AU-03-RD');
      expect(value?.name).toBe('FutureHarvest Navigator Scarlet Dynamo');
    });

    it('resolves to undefined for an unknown sku', async () => {
      const sku = signal<string | undefined>('NOPE');
      const ref = TestBed.runInInjectionContext(() => http.getBySku(sku));
      const value = await settle(ref);
      expect(value).toBeUndefined();
    });

    it('does not fire a request when sku is nullish', async () => {
      const sku = signal<string | undefined | null>(undefined);
      const ref = TestBed.runInInjectionContext(() => http.getBySku(sku));
      // resource stays idle and value remains undefined; never reaches 'resolved'
      expect(ref.status()).toBe('idle');
      expect(ref.value()).toBeUndefined();
    });

    it('refires when the sku signal changes', async () => {
      const sku = signal<string | undefined>('AU-03-RD');
      const ref = TestBed.runInInjectionContext(() => http.getBySku(sku));
      await settle(ref);
      sku.set('CL-01-GR');
      const next = await settle(ref);
      expect(next?.sku).toBe('CL-01-GR');
    });

    it('returns a model shape (not raw DTO)', async () => {
      const sku = signal<string | undefined>('AU-03-RD');
      const ref = TestBed.runInInjectionContext(() => http.getBySku(sku));
      const value = (await settle(ref)) as VariantModel;
      expect(Object.keys(value).sort()).toEqual([
        'id',
        'image',
        'inventory',
        'name',
        'price',
        'sku',
      ]);
    });
  });

  describe('getBySkus', () => {
    it('resolves only the requested skus', async () => {
      const skus = signal<readonly string[]>(['AU-03-RD', 'CL-01-GR']);
      const ref = TestBed.runInInjectionContext(() => http.getBySkus(skus));
      const value = (await settle(ref)) ?? [];
      expect(value.map((v) => v.sku).sort()).toEqual(['AU-03-RD', 'CL-01-GR']);
    });

    it('drops unknown skus silently', async () => {
      const skus = signal<readonly string[]>(['AU-03-RD', 'NOPE']);
      const ref = TestBed.runInInjectionContext(() => http.getBySkus(skus));
      const value = (await settle(ref)) ?? [];
      expect(value.map((v) => v.sku)).toEqual(['AU-03-RD']);
    });

    it('short-circuits to an empty array for an empty input', async () => {
      const skus = signal<readonly string[]>([]);
      const ref = TestBed.runInInjectionContext(() => http.getBySkus(skus));
      const value = await settle(ref);
      expect(value).toEqual([]);
    });

    it('refires when the sku set changes', async () => {
      const skus = signal<readonly string[]>(['AU-03-RD']);
      const ref = TestBed.runInInjectionContext(() => http.getBySkus(skus));
      const first = (await settle(ref)) ?? [];
      expect(first.map((v) => v.sku)).toEqual(['AU-03-RD']);
      skus.set(['CL-01-GR', 'CL-04-TQ']);
      const next = (await settle(ref)) ?? [];
      expect(next.map((v) => v.sku).sort()).toEqual(['CL-01-GR', 'CL-04-TQ']);
    });
  });
});
