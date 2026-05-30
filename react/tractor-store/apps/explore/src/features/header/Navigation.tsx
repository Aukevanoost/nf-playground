import { NavigateLink } from '@react-internal/navigation';
import { useScopedStyles } from '@react-internal/mfe-runtime';
import { navigationStyles } from './navigation-styles';

export function Navigation() {
  useScopedStyles('explore-navigation', navigationStyles);
  return (
    <nav className="e_Navigation">
      <ul className="e_Navigation__list">
        <li className="e_Navigation__item">
          <NavigateLink intent="explore.products">Machines</NavigateLink>
        </li>
        <li className="e_Navigation__item">
          <NavigateLink intent="explore.stores">Stores</NavigateLink>
        </li>
      </ul>
    </nav>
  );
}
