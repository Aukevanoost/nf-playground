import { useEffect } from 'react';
import { NavigateLink } from '@react-internal/navigation';
import { Navigation } from './Navigation';
import { useScopedStyles } from '@react-internal/mfe-runtime';
import { useCdnBase, useRemoteLoader } from '@react-internal/mfe-runtime';
import { cdnUrl } from '@react-internal/mfe-runtime';
import { headerStyles } from './header-styles';

export function Header() {
  useScopedStyles('explore-header', headerStyles);

  const base = useCdnBase();
  const { prefetchElement } = useRemoteLoader();

  useEffect(() => {
    // Pre-warm the mini-cart fragment so it's ready for the <mfe-mini-cart>
    // slot. Fire-and-forget; the slice loader dedupes.
    void prefetchElement('mfe-mini-cart');
  }, [prefetchElement]);

  return (
    <header className="e_Header" data-boundary="explore">
      <div className="e_Header__cutter">
        <div className="e_Header__inner">
          <NavigateLink intent="explore.home" className="e_Header__link">
            <img
              className="e_Header__logo"
              src={cdnUrl('/cdn/img/logo.svg', base)}
              alt="Micro Frontends - Tractor Store"
            />
          </NavigateLink>
          <div className="e_Header__navigation">
            <Navigation />
          </div>
          <div className="e_Header__cart">
            <mfe-mini-cart></mfe-mini-cart>
          </div>
        </div>
      </div>
    </header>
  );
}
