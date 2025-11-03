import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { SupabaseClient, Session, AuthChangeEvent } from '@supabase/supabase-js';
import { AxiosInstance } from 'axios';
import { getSupabase } from '@/lib/supabase';
import httpClient from '@/lib/httpClient';
import { queryClient, clearAllQueries } from '@/lib/queryClient';
import { authApi } from '@/api/auth.api';
import { profilesApi } from '@/api/profiles.api';
import { tripsApi } from '@/api/trips.api';
import type { User } from '@/api/types';

/**
 * API Context Value
 * 
 * Architecture Decision: Auth State Management
 * ==========================================
 * 
 * CONTEXT manages:
 * - Current session (from Supabase auth listener)
 * - Current user (derived from session)
 * - Auth loading state
 * - API client instances (supabase, http)
 * - API module references
 * 
 * TANSTACK QUERY manages:
 * - Data fetching (profiles, trips, etc.)
 * - Caching and invalidation
 * - Loading/error states for data operations
 * - Mutations (create, update, delete)
 * 
 * Why this split?
 * - Auth state is global, singleton, and event-driven (Supabase listener)
 * - Data is request-driven, cacheable, and can be stale
 * - Context provides stable references; Query handles data lifecycle
 * - Avoids prop drilling while keeping data fetching declarative
 */

interface ApiContextValue {
  // Client instances
  supabase: SupabaseClient;
  http: AxiosInstance;
  
  // API modules
  api: {
    auth: typeof authApi;
    profiles: typeof profilesApi;
    trips: typeof tripsApi;
  };
  
  // Auth state (managed by context)
  session: Session | null;
  user: User | null;
  isAuthenticated: boolean;
  isAuthLoading: boolean;
  
  // Auth helpers
  refreshAuth: () => Promise<void>;
}

const ApiContext = createContext<ApiContextValue | null>(null);

interface ApiProviderProps {
  children: React.ReactNode;
}

/**
 * API Provider Component
 * 
 * Responsibilities:
 * 1. Initialize Supabase and HTTP clients
 * 2. Listen to auth state changes
 * 3. Provide API surface via context
 * 4. Wrap with QueryClientProvider for TanStack Query
 * 5. Clear query cache on logout
 */
export function ApiProvider({ children }: ApiProviderProps) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  
  const supabase = getSupabase();

  /**
   * Initialize auth state
   */
  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user as User | null);
      setIsAuthLoading(false);
    });

    // Listen to auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      async (event: AuthChangeEvent, session: Session | null) => {
        if (__DEV__) {
          console.log('Auth state changed:', event, session?.user?.email);
        }

        setSession(session);
        setUser(session?.user as User | null);

        // Clear all queries on sign out
        if (event === 'SIGNED_OUT') {
          clearAllQueries();
        }

        // Invalidate queries on sign in
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          // Optionally refetch user-specific data
          // queryClient.invalidateQueries({ queryKey: ['profiles'] });
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase]);

  /**
   * Manually refresh auth state
   */
  const refreshAuth = useCallback(async () => {
    try {
      const { data: { session } } = await supabase.auth.refreshSession();
      setSession(session);
      setUser(session?.user as User | null);
    } catch (error) {
      console.error('Failed to refresh auth:', error);
    }
  }, [supabase]);

  const value: ApiContextValue = {
    supabase,
    http: httpClient,
    api: {
      auth: authApi,
      profiles: profilesApi,
      trips: tripsApi,
    },
    session,
    user,
    isAuthenticated: !!session,
    isAuthLoading,
    refreshAuth,
  };

  return (
    <QueryClientProvider client={queryClient}>
      <ApiContext.Provider value={value}>
        {children}
      </ApiContext.Provider>
    </QueryClientProvider>
  );
}

/**
 * Hook to access API context
 * @throws {Error} if used outside ApiProvider
 */
export function useApi() {
  const context = useContext(ApiContext);
  
  if (!context) {
    throw new Error('useApi must be used within ApiProvider');
  }
  
  return context;
}

/**
 * Hook to access auth state only
 * Convenience hook for components that only need auth info
 */
export function useAuthState() {
  const { session, user, isAuthenticated, isAuthLoading, refreshAuth } = useApi();
  
  return {
    session,
    user,
    isAuthenticated,
    isAuthLoading,
    refreshAuth,
  };
}

/**
 * Hook to access API clients only
 * Convenience hook for components that need to make API calls
 */
export function useApiClients() {
  const { supabase, http, api } = useApi();
  
  return {
    supabase,
    http,
    api,
  };
}
