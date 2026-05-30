import type { NavTarget } from '@ng-internal/navigation';

export interface RecommendationModel {
  sku: string;
  name: string;
  image: string;
  link: NavTarget;
  rgb: readonly [number, number, number];
}
