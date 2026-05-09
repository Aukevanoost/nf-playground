import type { ListRecommendationsResponse } from '../contracts/endpoints/recommendation-list.contract';
import type { RecommendationModel } from '../contracts/models/recommendation.model';

export function toRecommendationListModel(
  raw: ListRecommendationsResponse,
): Record<string, RecommendationModel> {
  const out: Record<string, RecommendationModel> = {};
  for (const sku of Object.keys(raw)) {
    const item = raw[sku];
    out[sku] = {
      sku: item.sku,
      name: item.name,
      image: item.image,
      link: item.link,
      rgb: item.rgb,
    };
  }
  return out;
}
