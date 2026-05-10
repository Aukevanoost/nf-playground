import type { NavTarget } from '@internal/events';

export interface TeaserDto {
  title: string;
  image: string;
  link: NavTarget;
}

export type ListTeasersResponse = TeaserDto[];
