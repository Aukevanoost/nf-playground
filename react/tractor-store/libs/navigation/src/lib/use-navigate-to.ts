import { useCallback } from 'react';
import { navigateTo } from '@react-internal/event-bus';
import type { NavPayload } from '@react-internal/url';

/**
 * Hook form of NavigateLink. Returns a stable callback that emits the
 * `nav:navigate` event. Use this from event handlers and effects when a
 * `<NavigateLink>` element isn't appropriate (e.g. navigation after a
 * successful form submit).
 */
export const useNavigateTo = () =>
  useCallback((intent: string, params?: NavPayload) => {
    navigateTo.emit({ id: intent, payload: params ?? {} });
  }, []);
