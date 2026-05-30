import type { Filter } from '../types';

type Props = {
  value: Filter;
  onChange: (next: Filter) => void;
};

const OPTIONS: Filter[] = ['all', 'active', 'completed'];

export function Filters({ value, onChange }: Props) {
  return (
    <div className="filters" role="tablist" aria-label="Filter todos">
      {OPTIONS.map((f) => (
        <button
          key={f}
          role="tab"
          aria-selected={value === f}
          className={`chip ${value === f ? 'chip-active' : ''}`}
          onClick={() => onChange(f)}
        >
          {f[0].toUpperCase() + f.slice(1)}
        </button>
      ))}
    </div>
  );
}
