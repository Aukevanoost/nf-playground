/** A request to navigate to an intent — what an `[navLink]` author writes. */
export type NavTarget = {
  readonly intent: string;
  readonly params?: NavPayload;
};

/**
 * Caller-supplied parameters for a navigation intent. Always plain strings —
 * keys consumed by the path template are substituted in; the rest become
 * query parameters. Compare with `RouteParams` (route-params.ts), which is
 * what a routed remote element receives *after* parsing.
 */
export type NavPayload = Readonly<Record<string, string>>;

export type NavNavigator = (url: string) => Promise<boolean>;

/** A single intent declared by a remote. */
export type NavIntent = {
  readonly id: string;
  readonly element?: string;
  readonly path: string;
};

/** What a remote contributes at startup: its base path plus the intents it owns. */
export type NavContribution = {
  readonly source: string;
  readonly basePath: string;
  readonly element?: string;
  readonly intents: readonly NavIntent[];
};

/**
 * Contract the host's nav registry exposes to the rest of the app. The
 * concrete implementation lives in the host (only the host instantiates it);
 * remotes only see this interface via the directives.
 */
export type INavRegistry = {
  register(contribution: NavContribution): void;
  isAvailable(id: string): boolean;
  resolve(id: string, payload?: NavPayload): string;
  navigate(id: string, payload?: NavPayload): Promise<boolean>;
};
