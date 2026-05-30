/**
 * Index of `customElementTag → remoteName`. Populated by the host once it has
 * loaded each remote's nav-contribution; consumed by `LoadRemoteSlice.prefetchElement`
 * so callers can pre-warm a slice by element tag without naming the remote.
 *
 * Lives on a global (mirrors `__NF_REGISTRY__`) so it is reachable from
 * non-React code and survives federation's per-remote
 * module duplication. In standalone-fragment mode the global is unset and
 * `findRemoteForElement` returns undefined — `prefetchElement` is a no-op.
 */
declare global {
  interface Window {
    __NF_SLICE_INDEX__?: Map<string, string>;
  }
}

export const setSliceIndex = (index: Map<string, string>): void => {
  window.__NF_SLICE_INDEX__ = index;
};

export const findRemoteForElement = (tag: string): string | undefined =>
  window.__NF_SLICE_INDEX__?.get(tag);
