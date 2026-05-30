import { NavigateLink } from '@react-internal/navigation';
import type { Recommendation } from '../../api/recommendations';
import { useScopedStyles } from '@react-internal/mfe-runtime';
import { useCdnBase } from '@react-internal/mfe-runtime';
import { imgSrc, imgSrcset } from '@react-internal/mfe-runtime';
import { recommendationTileStyles } from './recommendation-tile-styles';

export function RecommendationTile({ item }: { item: Recommendation }) {
  useScopedStyles('explore-recommendation', recommendationTileStyles);
  const base = useCdnBase();

  return (
    <li className="e_Recommendation">
      <NavigateLink
        intent={item.link.intent}
        params={item.link.params ?? {}}
        className="e_Recommendation_link"
      >
        <img
          className="e_Recommendation_image"
          src={imgSrc(item.image, 200, base)}
          srcSet={imgSrcset(item.image, [200, 400], base)}
          alt=""
          sizes="200px"
          width={200}
          height={200}
        />
        <span className="e_Recommendation_name">{item.name}</span>
      </NavigateLink>
    </li>
  );
}
