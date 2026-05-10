import type { NavigatePayload, RoutePayload } from '@internal/events';
import type { Subscribe } from '../app/nav/setup-shell-nav';

export interface BusFakes {
  emitNavigate(p: NavigatePayload): void;
  emitRoute(p: RoutePayload): void;
  onNavigate: Subscribe<NavigatePayload>;
  onRoute: Subscribe<RoutePayload>;
}

/** In-memory stand-in for the host bus. `emitNavigate` / `emitRoute` invoke
 *  every subscriber registered through `onNavigate` / `onRoute`. */
export const fakeBus = (): BusFakes => {
  const navHandlers: ((p: NavigatePayload) => void)[] = [];
  const routeHandlers: ((p: RoutePayload) => void)[] = [];
  return {
    emitNavigate: (p) => navHandlers.forEach((h) => h(p)),
    emitRoute: (p) => routeHandlers.forEach((h) => h(p)),
    onNavigate: (h) => {
      navHandlers.push(h);
      return () => {
        const i = navHandlers.indexOf(h);
        if (i >= 0) navHandlers.splice(i, 1);
      };
    },
    onRoute: (h) => {
      routeHandlers.push(h);
      return () => {
        const i = routeHandlers.indexOf(h);
        if (i >= 0) routeHandlers.splice(i, 1);
      };
    },
  };
};
