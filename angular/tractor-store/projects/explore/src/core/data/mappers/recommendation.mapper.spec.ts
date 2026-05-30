import { describe, expect, it } from 'vitest';
import type { ListRecommendationsResponse } from '../contracts/endpoints/recommendation-list.contract';
import { toRecommendationListModel } from './recommendation.mapper';

describe('recommendation.mapper', () => {
  it('maps every entry in the keyed map', () => {
    const raw: ListRecommendationsResponse = {
      'AU-01-SI': {
        sku: 'AU-01-SI',
        name: 'TerraFirma Silver',
        image: '/img/AU-01-SI.webp',
        link: {
          intent: 'decide.product',
          params: { id: 'AU-01', sku: 'AU-01-SI' },
        },
        rgb: [192, 192, 192],
      },
      'AU-02-OG': {
        sku: 'AU-02-OG',
        name: 'SmartFarm Sunset Copper',
        image: '/img/AU-02-OG.webp',
        link: {
          intent: 'decide.product',
          params: { id: 'AU-02', sku: 'AU-02-OG' },
        },
        rgb: [221, 82, 25],
      },
    };

    const models = toRecommendationListModel(raw);
    expect(Object.keys(models).sort()).toEqual(['AU-01-SI', 'AU-02-OG']);
    expect(models['AU-01-SI'].name).toBe('TerraFirma Silver');
    expect(models['AU-02-OG'].rgb).toEqual([221, 82, 25]);
  });

  it('returns an empty map for an empty response', () => {
    expect(toRecommendationListModel({})).toEqual({});
  });
});
