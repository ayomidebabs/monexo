import React, { Component, type ErrorInfo, type ReactNode } from 'react';
import styles from '../../styles/components/ErrorBoundary.module.scss';

interface Props {
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.props.onError?.(error, errorInfo);
    console.error('[ErrorBoundary]', error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      // Prefer section-specific fallback, otherwise use global one
      if (this.props.fallback) return this.props.fallback;

      return (
        <div className={styles.error}>
          <h2>Oops! Something went wrong.</h2>
          <p>We’re having trouble loading this section.</p>
          <button onClick={this.handleRetry} className={styles.retry}>
            Try Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
