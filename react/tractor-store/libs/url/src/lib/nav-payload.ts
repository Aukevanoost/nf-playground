/**
 * String-only key/value bag used to fill path-template params and query strings.
 * Lives in `@react-internal/url` because path-template + query are the canonical
 * consumers; `@react-internal/navigation` re-uses the same type for intent payloads.
 */
export type NavPayload = Readonly<Record<string, string>>;
