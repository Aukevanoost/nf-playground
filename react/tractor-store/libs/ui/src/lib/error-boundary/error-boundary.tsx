import { Component, type ErrorInfo, type ReactNode } from 'react';
import { useScopedStyles } from '../shadow-root-context';
import { errorBoundaryStyles } from './error-boundary-styles';

// Class components can't call hooks, so the styled fallback lives in a tiny
// function component that adopts the stylesheet via the shadow-aware hook.
function DefaultErrorFallback({ label, message }: { label?: string; message: string }) {
  useScopedStyles('ui-error-boundary', errorBoundaryStyles);
  return (
    <div className="c_ErrorBoundary" role="alert">
      <span className="c_ErrorBoundary__title">
        Something went wrong{label ? ` in ${label}` : ''}
      </span>
      <span className="c_ErrorBoundary__detail">{message}</span>
    </div>
  );
}

export interface ErrorBoundaryProps {
  readonly fallback?: (error: Error) => ReactNode;
  readonly onError?: (error: Error, info: ErrorInfo) => void;
  readonly label?: string;
  readonly children?: ReactNode;
}

interface State {
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    this.props.onError?.(error, info);
    const prefix = this.props.label ? `[error-boundary] ${this.props.label}:` : '[error-boundary]';
    console.error(prefix, error, info);
  }

  render() {
    const { error } = this.state;
    if (!error) return this.props.children;
    if (this.props.fallback) return this.props.fallback(error);
    return <DefaultErrorFallback label={this.props.label} message={error.message} />;
  }
}
