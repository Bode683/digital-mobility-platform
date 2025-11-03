import React, { Component, ErrorInfo, ReactNode } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Button } from 'react-native-paper';
import { isApiError, getUserFriendlyMessage } from '@/api/errors';

interface Props {
  children: ReactNode;
  fallback?: (error: Error, resetError: () => void) => ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * Error Boundary Component
 * Catches JavaScript errors anywhere in the child component tree
 * Displays fallback UI and allows recovery
 * 
 * Usage:
 * <ErrorBoundary>
 *   <YourApp />
 * </ErrorBoundary>
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error to console in development
    if (__DEV__) {
      console.error('ErrorBoundary caught an error:', error, errorInfo);
    }

    // Call custom error handler if provided
    this.props.onError?.(error, errorInfo);

    // TODO: Log to error tracking service (Sentry, Bugsnag, etc.)
    // logErrorToService(error, errorInfo);
  }

  resetError = () => {
    this.setState({
      hasError: false,
      error: null,
    });
  };

  render() {
    if (this.state.hasError && this.state.error) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback(this.state.error, this.resetError);
      }

      // Default fallback UI
      return (
        <DefaultErrorFallback
          error={this.state.error}
          resetError={this.resetError}
        />
      );
    }

    return this.props.children;
  }
}

/**
 * Default error fallback UI
 */
function DefaultErrorFallback({
  error,
  resetError,
}: {
  error: Error;
  resetError: () => void;
}) {
  const message = isApiError(error)
    ? getUserFriendlyMessage(error)
    : 'An unexpected error occurred';

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.emoji}>😕</Text>
        <Text style={styles.title}>Oops! Something went wrong</Text>
        <Text style={styles.message}>{message}</Text>

        {__DEV__ && (
          <View style={styles.debugContainer}>
            <Text style={styles.debugTitle}>Debug Info:</Text>
            <Text style={styles.debugText}>{error.name}</Text>
            <Text style={styles.debugText}>{error.message}</Text>
            {error.stack && (
              <Text style={styles.debugStack} numberOfLines={10}>
                {error.stack}
              </Text>
            )}
          </View>
        )}

        <View style={styles.actions}>
          <Button
            mode="contained"
            onPress={resetError}
            style={styles.button}
          >
            Try Again
          </Button>
          <Button
            mode="outlined"
            onPress={() => {
              // TODO: Navigate to home or reload app
              resetError();
            }}
            style={styles.button}
          >
            Go to Home
          </Button>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
    color: '#000',
  },
  message: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  debugContainer: {
    width: '100%',
    backgroundColor: '#f5f5f5',
    padding: 16,
    borderRadius: 8,
    marginBottom: 24,
  },
  debugTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#000',
  },
  debugText: {
    fontSize: 12,
    color: '#d32f2f',
    marginBottom: 4,
    fontFamily: 'monospace',
  },
  debugStack: {
    fontSize: 10,
    color: '#666',
    marginTop: 8,
    fontFamily: 'monospace',
  },
  actions: {
    width: '100%',
    gap: 12,
  },
  button: {
    width: '100%',
  },
});

/**
 * Hook-based error boundary wrapper
 * For functional components that need error boundary protection
 */
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  fallback?: (error: Error, resetError: () => void) => ReactNode
) {
  return function WithErrorBoundary(props: P) {
    return (
      <ErrorBoundary fallback={fallback}>
        <Component {...props} />
      </ErrorBoundary>
    );
  };
}
