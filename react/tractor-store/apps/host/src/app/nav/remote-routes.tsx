import { type RouteObject } from 'react-router-dom';
import type { NavIntent } from '@react-internal/navigation';
import { toRoutePath } from '@react-internal/url';
import type { RemoteRouteContribution } from './load-contributions';
import { RemoteShell } from '../RemoteShell';
import { RouteErrorFallback } from './RouteErrorFallback';

const isRoutedIntent = (
  i: NavIntent,
): i is NavIntent & { element: string } => typeof i.element === 'string';

/**
 * Builds react-router routes from the remotes' navigation contributions.
 * Each routed intent (one with an `element`) becomes a route that mounts
 * the `RemoteShell` component, which in turn instantiates the remote's
 * custom element.
 */
export const buildRemoteRoutes = (
  loaded: readonly RemoteRouteContribution[],
): RouteObject[] => {
  const routes: RouteObject[] = [];
  for (const { contribution } of loaded) {
    const remoteName = contribution.source;
    const routedIntents = contribution.intents.filter(isRoutedIntent);
    if (routedIntents.length === 0) {
      console.warn(
        `[nav] contribution from "${remoteName}" has no intents with an \`element\` — skipping route registration`,
      );
      continue;
    }
    for (const intent of routedIntents) {
      routes.push({
        path: '/' + toRoutePath(contribution.basePath, intent.path),
        element: (
          <RemoteShell
            remoteName={remoteName}
            elementTag={intent.element}
          />
        ),
        errorElement: <RouteErrorFallback remoteName={remoteName} />,
      });
    }
  }
  return routes;
};
