import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import type { RecommendationModel } from '../contracts/models/recommendation.model';
import { RecommendationHttp } from '../http/recommendation-http';
import { RecommendationStore } from './recommendation-store';

const fixture: Record<string, RecommendationModel> = {
  'CL-01-GY': {
    sku: 'CL-01-GY',
    name: 'Heritage Workhorse Grey',
    image: '/img/CL-01-GY.webp',
    link: { intent: 'decide.product', params: { id: 'CL-01', variant: 'GY' } },
    rgb: [120, 120, 120],
  },
  'CL-02-RD': {
    sku: 'CL-02-RD',
    name: 'Classic Red',
    image: '/img/CL-02-RD.webp',
    link: { intent: 'decide.product', params: { id: 'CL-02', variant: 'RD' } },
    rgb: [200, 30, 30],
  },
  'CL-03-BL': {
    sku: 'CL-03-BL',
    name: 'Classic Blue',
    image: '/img/CL-03-BL.webp',
    link: { intent: 'decide.product', params: { id: 'CL-03', variant: 'BL' } },
    rgb: [30, 60, 200],
  },
  'CL-04-GR': {
    sku: 'CL-04-GR',
    name: 'Classic Green',
    image: '/img/CL-04-GR.webp',
    link: { intent: 'decide.product', params: { id: 'CL-04', variant: 'GR' } },
    rgb: [40, 160, 60],
  },
  'CL-05-DK': {
    sku: 'CL-05-DK',
    name: 'Dark Slate',
    image: '/img/CL-05-DK.webp',
    link: { intent: 'decide.product', params: { id: 'CL-05', variant: 'DK' } },
    rgb: [110, 110, 110],
  },
};

function fakeHttp() {
  return {
    list() {
      return { value: signal(fixture) };
    },
  };
}

describe('RecommendationStore', () => {
  let store: RecommendationStore;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [{ provide: RecommendationHttp, useFactory: fakeHttp }],
    });
    store = TestBed.inject(RecommendationStore);
  });

  it('exposes the loaded recommendations map', () => {
    expect(store.recommendations()?.['CL-01-GY']?.name).toBe(
      'Heritage Workhorse Grey',
    );
  });

  it('recosForSkus returns up to N items, never the seed sku', () => {
    const recos = store.recosForSkus(['CL-01-GY']);
    expect(recos.length).toBeGreaterThan(0);
    expect(recos.length).toBeLessThanOrEqual(4);
    expect(recos.every((r) => r.sku !== 'CL-01-GY')).toBe(true);
  });

  it('recosForSkus orders by color similarity to the seed', () => {
    // Seed is mid-grey [120,120,120]; CL-05-DK [110,110,110] is the closest.
    const [first] = store.recosForSkus(['CL-01-GY'], 1);
    expect(first.sku).toBe('CL-05-DK');
  });

  it('recosForSkus returns [] when recommendations are not loaded', () => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        {
          provide: RecommendationHttp,
          useValue: { list: () => ({ value: signal(undefined) }) },
        },
      ],
    });
    const empty = TestBed.inject(RecommendationStore);
    expect(empty.recosForSkus(['CL-01-GY'])).toEqual([]);
  });
});
