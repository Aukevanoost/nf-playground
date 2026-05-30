import type { NavTarget } from '@ng-internal/navigation';

export interface ProductModel {
  id: string;
  name: string;
  image: string;
  startPrice: number;
  link: NavTarget;
}
