import { useEffect } from 'react';
import { NavigateLink } from '@react-internal/navigation';
import { getTeasers } from '../../api/teasers';
import { HOME_SEED_SKUS } from '../../api/recommendations';
import { useAsync } from '@react-internal/mfe-runtime';
import { useCdnBase, useRemoteLoader } from '@react-internal/mfe-runtime';
import { imgSrc, imgSrcset } from '@react-internal/mfe-runtime';
import { useScopedStyles } from '@react-internal/mfe-runtime';
import { homeStyles } from './home-styles';

export function Home() {
  useScopedStyles('explore-home', homeStyles);

  const base = useCdnBase();
  const { prefetchElement } = useRemoteLoader();

  useEffect(() => {
    // Pre-warm sibling chrome fragments so the page paints with them ready.
    void prefetchElement('mfe-header');
    void prefetchElement('mfe-footer');
    void prefetchElement('mfe-recommendations');
  }, [prefetchElement]);

  const { value: teasers, error } = useAsync(() => getTeasers(), []);

  return (
    <div data-boundary-page="explore">
      <mfe-header></mfe-header>
      <main className="e_HomePage">
        {error ? (
          <p role="alert">Failed to load teasers. Please refresh.</p>
        ) : (
          (teasers ?? []).map((t) => (
            <NavigateLink
              key={t.title}
              intent={t.link.intent}
              params={t.link.params ?? {}}
              className="e_HomePage__categoryLink"
            >
              <img
                src={imgSrc(t.image, 500, base)}
                srcSet={imgSrcset(t.image, [500, 1000], base)}
                sizes="100vw, (min-width: 500px) 50vw"
                alt=""
              />
              {t.title}
            </NavigateLink>
          ))
        )}
        <div className="e_HomePage__recommendations">
          <mfe-recommendations skus={HOME_SEED_SKUS.join(',')}></mfe-recommendations>
        </div>
      </main>
      <mfe-footer></mfe-footer>
    </div>
  );
}
