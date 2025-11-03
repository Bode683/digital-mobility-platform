import { QueryClient, QueryCache, MutationCache } from '@tanstack/react-query';
import { isApiError, getUserFriendlyMessage } from '@/api/errors';
import { showToast } from '@/components/ToastProvider';

/**
 * Global error handler for queries
 * Logs errors and can trigger global error notifications
 */
function handleQueryError(error: unknown) {
  if (__DEV__) {
    console.error('Query Error:', error);
  }
  
  const message = getUserFriendlyMessage(error);
  showToast('error', 'Query Error', message);
}

/**
 * Global error handler for mutations
 */
function handleMutationError(error: unknown) {
  if (__DEV__) {
    console.error('Mutation Error:', error);
  }
  
  const message = getUserFriendlyMessage(error);
  showToast('error', 'Mutation Error', message);
}

/**
 * TanStack Query client configuration
 * 
 * Default options:
 * - Queries: 5min stale time, 10min cache time, refetch on focus/reconnect
 * - Mutations: No retries (user should explicitly retry)
 * - Global error handlers for logging and notifications
 */
export const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: handleQueryError,
  }),
  mutationCache: new MutationCache({
    onError: handleMutationError,
  }),
  defaultOptions: {
    queries: {
      // Stale time: how long data is considered fresh
      staleTime: 1000 * 60 * 5, // 5 minutes
      
      // GC time: how long unused data stays in cache (formerly cacheTime)
      gcTime: 1000 * 60 * 10, // 10 minutes
      
      // Retry failed queries once
      retry: (failureCount, error) => {
        // Don't retry on client errors (4xx)
        if (isApiError(error) && error.status && error.status >= 400 && error.status < 500) {
          return false;
        }
        // Retry network errors and server errors up to 1 time
        return failureCount < 1;
      },
      
      // Retry delay with exponential backoff
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      
      // Refetch on window focus (good for web, mobile background/foreground)
      refetchOnWindowFocus: true,
      
      // Refetch on network reconnect
      refetchOnReconnect: true,
      
      // Don't refetch on mount if data is fresh
      refetchOnMount: true,
    },
    mutations: {
      // Don't retry mutations by default (user should explicitly retry)
      retry: 0,
      
      // Retry delay for mutations (if enabled)
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
  },
});

/**
 * Helper to clear all queries (useful on logout)
 */
export function clearAllQueries() {
  queryClient.clear();
}

/**
 * Helper to invalidate all queries (useful on app resume)
 */
export function invalidateAllQueries() {
  queryClient.invalidateQueries();
}
