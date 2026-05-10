import { NavPayload } from '@internal/events';

const PARAM_RE = /^:([a-zA-Z_$][\w$]*)$/;

const trimSlashes = (s: string): string => s.replace(/^\/+|\/+$/g, '');

/**
 * Joins a base path and an intent-relative path, collapsing slashes and
 * always returning an absolute path (`/a/b`). Empty segments are dropped so
 * `joinPath('', '/')` is `/`.
 */
export const joinPath = (basePath: string, intentPath: string): string => {
  const parts = [trimSlashes(basePath), trimSlashes(intentPath)].filter(
    (p) => p.length > 0,
  );
  return '/' + parts.join('/');
};

/**
 * Like `joinPath` but without a leading slash — Angular `Route.path` does not
 * accept one. `toRoutePath('', '')` is `''` (the empty/root route).
 */
export const toRoutePath = (basePath: string, intentPath: string): string =>
  joinPath(basePath, intentPath).replace(/^\/+/, '');

/** Returns the names of `:param` segments in an intent template. */
export const splitIntentParams = (intentPath: string): readonly string[] => {
  return intentPath
    .split('/')
    .map((seg) => PARAM_RE.exec(seg)?.[1] ?? null)
    .filter((p): p is string => p !== null);
};

/**
 * Substitutes `:param` segments in an intent template with values from the
 * payload. Throws when a required parameter is missing. Values are URL-encoded.
 */
export const resolveTemplate = (
  template: string,
  payload: NavPayload,
): string => {
  return template
    .split('/')
    .map((seg) => {
      const m = PARAM_RE.exec(seg);
      if (!m) return seg;
      const value = payload[m[1]];
      if (value == null) {
        throw new Error(
          `[nav] missing required param ":${m[1]}" for path "${template}"`,
        );
      }
      return encodeURIComponent(value);
    })
    .join('/');
};
