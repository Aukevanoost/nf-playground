import { getRecommendationsBySeedSkus } from '../../api/recommendations';
import { useAsync } from '@react-internal/mfe-runtime';
import { useScopedStyles } from '@react-internal/mfe-runtime';
import { RecommendationTile } from './RecommendationTile';
import { recommendationsStyles } from './recommendations-styles';

const parseSkus = (v: string | string[] | undefined | null): string[] => {
  if (!v) return [];
  if (Array.isArray(v)) return v;
  return v
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
};

interface Props {
  /** Comma-separated SKUs (when received as a custom-element attribute). */
  readonly skus?: string | string[];
}

export function Recommendations({ skus }: Props) {
  useScopedStyles('explore-recommendations', recommendationsStyles);

  const parsed = parseSkus(skus);
  const seedKey = parsed.join(',');

  const { value, error } = useAsync(
    () => getRecommendationsBySeedSkus(parsed),
    [seedKey],
  );
  const items = value ?? [];

  if (error) {
    return (
      <div className="e_Recommendations" data-boundary="explore">
        <h2>Recommendations</h2>
        <p role="alert">Recommendations are temporarily unavailable.</p>
      </div>
    );
  }

  if (items.length === 0) return null;

  return (
    <div className="e_Recommendations" data-boundary="explore">
      <h2>Recommendations</h2>
      <ul className="e_Recommendations_list">
        {items.map((item) => (
          <RecommendationTile key={item.sku} item={item} />
        ))}
      </ul>
    </div>
  );
}
