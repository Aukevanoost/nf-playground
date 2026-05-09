import {
  INavRegistry,
  NAV_EVENTS,
  NavigatePayload,
  requireBus,
  RoutePayload,
  tryBus,
} from '@internal/navigation';

const NOOP_UNSUBSCRIBE = (): void => {};

/** Subscribe to intent-based navigation requests from any remote. */
export const onNavigate = (handler: (data: NavigatePayload) => void) => {
  const reg = tryBus();
  if (!reg) return NOOP_UNSUBSCRIBE;
  return reg.on<NavigatePayload>(NAV_EVENTS.navigate, ({ data }) =>
    handler(data),
  );
};

/** Subscribe to URL-based navigation requests from any remote. */
export const onRoute = (handler: (data: RoutePayload) => void) => {
  const reg = tryBus();
  if (!reg) return NOOP_UNSUBSCRIBE;
  return reg.on<RoutePayload>(NAV_EVENTS.route, ({ data }) => handler(data));
};

/**
 * Publish the host's registry as a shared resource so remotes' directives
 * (waiting via `onRegistryReady`) can become active.
 */
export const publishRegistry = (registry: INavRegistry): Promise<void> =>
  requireBus().register(NAV_EVENTS.registry, registry);
