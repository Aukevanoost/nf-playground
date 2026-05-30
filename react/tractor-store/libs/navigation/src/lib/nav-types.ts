import type { NavPayload } from '@react-internal/url';

/** A request to navigate to an intent — what a `NavigateLink` author writes. */
export interface NavTarget {
  readonly intent: string;
  readonly params?: NavPayload;
}

export interface NavIntent {
  readonly id: string;
  readonly element?: string;
  readonly path: string;
}

export interface NavBarContribution {
  readonly intentId: string;
  readonly label: string;
  readonly order?: number;
}

export interface NavContribution {
  readonly source: string;
  readonly basePath: string;
  readonly intents: readonly NavIntent[];
  readonly navBar?: readonly NavBarContribution[];
  /**
   * Non-routed custom-element tags this remote exposes (e.g. chrome slots like
   * mfe-header, mfe-mini-cart, mfe-recommendations). Used by the host to build
   * the elementTag → remoteName index so peers can `prefetchElement(tag)`
   * without naming the owning remote.
   */
  readonly chromeElements?: readonly string[];
}
