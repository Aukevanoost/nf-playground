import type { ListTeasersResponse } from '../contracts/endpoints/teaser-list.contract';
import type { TeaserModel } from '../contracts/models/teaser.model';

export function toTeaserListModel(raw: ListTeasersResponse): TeaserModel[] {
  return raw.map((t) => ({
    title: t.title,
    image: t.image,
    link: t.link,
  }));
}
