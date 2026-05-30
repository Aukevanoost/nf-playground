import type { NavTarget } from '@ng-internal/navigation';

export interface TeaserDto {
  title: string;
  image: string;
  link: NavTarget;
}

export type ListTeasersResponse = TeaserDto[];
