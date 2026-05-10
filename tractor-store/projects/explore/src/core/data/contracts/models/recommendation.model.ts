import type { NavTarget } from '@internal/events';

export interface RecommendationModel {
  sku: string;
  name: string;
  image: string;
  link: NavTarget;
  rgb: readonly [number, number, number];
}
