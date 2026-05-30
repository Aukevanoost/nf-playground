import { useEffect, useState } from 'react';

export interface AsyncState<T> {
  readonly value: T | undefined;
  readonly isLoading: boolean;
  readonly error?: unknown;
}

// Minimal async loader hook. A real app should swap this for TanStack Query
// or SWR — kept inline because the fixtures resolve synchronously.
export function useAsync<T>(
  loader: () => Promise<T>,
  deps: ReadonlyArray<unknown> = [],
): AsyncState<T> {
  const [value, setValue] = useState<T | undefined>(undefined);
  const [isLoading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<unknown>(undefined);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(undefined);
    loader().then(
      (v) => {
        if (cancelled) return;
        setValue(v);
        setLoading(false);
      },
      (err) => {
        if (cancelled) return;
        setError(err);
        setLoading(false);
      },
    );
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return { value, isLoading, error };
}
