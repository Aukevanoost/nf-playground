import { useEffect } from 'react';
import { getStores } from '../../api/stores';
import { useAsync } from '@react-internal/mfe-runtime';
import { useRemoteLoader } from '@react-internal/mfe-runtime';
import { useScopedStyles } from '@react-internal/mfe-runtime';
import { StoreTile } from './StoreTile';
import { storesStyles } from './stores-styles';

export function Stores() {
  useScopedStyles('explore-stores', storesStyles);

  const { prefetchElement } = useRemoteLoader();
  useEffect(() => {
    void prefetchElement('mfe-header');
    void prefetchElement('mfe-footer');
  }, [prefetchElement]);

  const { value: stores, error } = useAsync(() => getStores(), []);

  return (
    <div data-boundary-page="explore">
      <mfe-header></mfe-header>
      <main className="e_StoresPage">
        <h2>Our Stores</h2>
        <p>
          Want to see our products in person? Visit one of our stores to see
          our products up close and talk to our experts. We have stores in the
          following locations:
        </p>
        {error ? (
          <p role="alert">Failed to load store list. Please refresh.</p>
        ) : (
          <ul className="e_StoresPage_list">
            {(stores ?? []).map((s) => (
              <StoreTile key={s.id} store={s} />
            ))}
          </ul>
        )}
      </main>
      <mfe-footer></mfe-footer>
    </div>
  );
}
