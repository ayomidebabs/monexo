import React, { Component, type ErrorInfo, type ReactNode } from 'react';
import PageError from './PageError';
import SectionError from './SectionError';

interface Props {
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  children: ReactNode;
  message?: string;
}

interface State {
  hasError: boolean;
  error?: Error;
  key: number;
}

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, key: 0 };

  static getDerivedStateFromError(error: Error): Partial<State> | null {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.props.onError?.(error, errorInfo);
    console.error('[ErrorBoundary]', error, errorInfo);
  }

  resetError = () => {
    this.setState({
      hasError: false,
      error: undefined,
      key: this.state.key + 1,
    });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return (
          <SectionError
            message={this.props.message}
            onRetry={this.resetError}
          />
        );
      }
      return <PageError onRetry={this.resetError} />;
    }

    return (
      <React.Fragment key={this.state.key}>
        {this.props.children}
      </React.Fragment>
    );
  }
}
