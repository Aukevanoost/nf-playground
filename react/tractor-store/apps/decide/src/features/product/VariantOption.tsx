import type { CSSProperties } from 'react';
import { NavigateLink } from '@react-internal/navigation';
import { useScopedStyles } from '@react-internal/mfe-runtime';
import { variantOptionStyles } from './variant-option-styles';

interface Props {
  readonly id: string;
  readonly sku: string;
  readonly name: string;
  readonly color: string;
  readonly selected?: boolean;
}

export function VariantOption({ id, sku, name, color, selected = false }: Props) {
  useScopedStyles('decide-variant-option', variantOptionStyles);

  // CSS custom property — React types require the cast.
  const style = { '--variant-color': color } as CSSProperties;

  return (
    <li className="d_VariantOption" style={style}>
      <i className="d_VariantOption__color"></i>
      {selected ? (
        <strong>{name}</strong>
      ) : (
        <NavigateLink intent="decide.product" params={{ id, sku }}>
          {name}
        </NavigateLink>
      )}
    </li>
  );
}
