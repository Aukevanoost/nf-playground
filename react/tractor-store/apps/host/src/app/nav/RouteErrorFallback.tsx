import { isRouteErrorResponse, useRouteError } from 'react-router-dom';

interface Props {
  readonly remoteName: string;
}

export function RouteErrorFallback({ remoteName }: Props) {
  const error = useRouteError();

  if (isRouteErrorResponse(error)) {
    return (
      <div role="alert" className="remote-shell__error">
        <p>
          <strong>{error.status}</strong> {error.statusText}
        </p>
        <p>
          The <strong>{remoteName}</strong> route could not be reached.
        </p>
      </div>
    );
  }

  const message = error instanceof Error ? error.message : 'Unknown error';
  console.error(`[route-error] ${remoteName}:`, error);

  return (
    <div role="alert" className="remote-shell__error">
      <p>
        The <strong>{remoteName}</strong> view failed to render.
      </p>
      <p>{message}</p>
    </div>
  );
}
