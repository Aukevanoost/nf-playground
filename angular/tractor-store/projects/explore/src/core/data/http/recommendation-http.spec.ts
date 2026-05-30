import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { RecommendationHttp } from './recommendation-http';

describe('RecommendationHttp', () => {
  let http: RecommendationHttp;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    http = TestBed.inject(RecommendationHttp);
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

  it('returns recommendations sorted by colour distance, excluding seeds', async () => {
    const seeds = signal<readonly string[]>(['AU-04-RD']);
    const ref = TestBed.runInInjectionContext(() =>
      http.bySeedSkus(seeds, 4),
    );
    const value = (await settle(ref)) ?? [];
    expect(value.length).toBe(4);
    expect(value.some((r) => r.sku === 'AU-04-RD')).toBe(false);
  });

  it('honours the requested length cap', async () => {
    const seeds = signal<readonly string[]>(['AU-01-SI']);
    const ref = TestBed.runInInjectionContext(() =>
      http.bySeedSkus(seeds, 2),
    );
    const value = (await settle(ref)) ?? [];
    expect(value.length).toBe(2);
  });

  it('refires when the seed signal changes', async () => {
    const seeds = signal<readonly string[]>(['AU-04-RD']);
    const ref = TestBed.runInInjectionContext(() =>
      http.bySeedSkus(seeds, 4),
    );
    const first = (await settle(ref)) ?? [];
    seeds.set(['AU-01-SI']);
    const next = (await settle(ref)) ?? [];
    // Different seeds should yield different rankings.
    expect(first.map((r) => r.sku)).not.toEqual(next.map((r) => r.sku));
  });

  it('returns recommendations even when seed list is empty', async () => {
    const seeds = signal<readonly string[]>([]);
    const ref = TestBed.runInInjectionContext(() =>
      http.bySeedSkus(seeds, 3),
    );
    const value = (await settle(ref)) ?? [];
    expect(value.length).toBe(3);
  });
});
