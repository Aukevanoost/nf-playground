import { NavigateLink, type NavTarget } from '@react-internal/navigation';
import { useScopedStyles } from '@react-internal/mfe-runtime';
import { filterStyles } from './filter-styles';

export interface FilterItem {
  readonly link: NavTarget;
  readonly name: string;
  readonly active: boolean;
}

export function Filter({ filters }: { filters: readonly FilterItem[] }) {
  useScopedStyles('explore-filter', filterStyles);
  return (
    <div className="e_Filter">
      Filter:
      <ul>
        {filters.map((f) =>
          f.active ? (
            <li key={f.name} className="e_Filter__filter--active">
              {f.name}
            </li>
          ) : (
            <li key={f.name}>
              <NavigateLink intent={f.link.intent} params={f.link.params ?? {}}>
                {f.name}
              </NavigateLink>
            </li>
          ),
        )}
      </ul>
    </div>
  );
}
