import { useScopedStyles } from '../shadow-root-context';
import { spinnerStyles } from './spinner-styles';

export interface SpinnerProps {
  readonly label?: string;
}

export function Spinner({ label = 'Loading…' }: SpinnerProps) {
  useScopedStyles('ui-spinner', spinnerStyles);
  return (
    <div className="c_Spinner" role="status" aria-label={label}>
      <span className="c_Spinner__circle" aria-hidden="true"></span>
      <span className="c_Spinner__label">{label}</span>
    </div>
  );
}
