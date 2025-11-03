/**
 * Query key factory for TanStack Query
 * Provides hierarchical, type-safe query keys for cache management
 * 
 * Pattern:
 * - Use arrays for keys: ['resource', 'action', ...params]
 * - Hierarchical structure allows partial invalidation
 * - Example: invalidating ['trips'] invalidates all trip queries
 */

export const queryKeys = {
  // ============================================================================
  // Auth Keys
  // ============================================================================
  auth: {
    all: ['auth'] as const,
    session: () => [...queryKeys.auth.all, 'session'] as const,
    user: () => [...queryKeys.auth.all, 'user'] as const,
  },

  // ============================================================================
  // Profile Keys
  // ============================================================================
  profiles: {
    all: ['profiles'] as const,
    detail: (userId: string) => [...queryKeys.profiles.all, userId] as const,
    current: () => [...queryKeys.profiles.all, 'current'] as const,
  },

  // ============================================================================
  // Trip Keys
  // ============================================================================
  trips: {
    all: ['trips'] as const,
    lists: () => [...queryKeys.trips.all, 'list'] as const,
    list: (filters?: {
      status?: string;
      userId?: string;
      page?: number;
    }) => [...queryKeys.trips.lists(), filters] as const,
    detail: (tripId: string) => [...queryKeys.trips.all, tripId] as const,
    active: (userId: string) => 
      [...queryKeys.trips.all, 'active', userId] as const,
  },

  // ============================================================================
  // Payment Keys
  // ============================================================================
  payments: {
    all: ['payments'] as const,
    lists: () => [...queryKeys.payments.all, 'list'] as const,
    list: (userId: string) => [...queryKeys.payments.lists(), userId] as const,
    detail: (paymentId: string) => 
      [...queryKeys.payments.all, paymentId] as const,
    methods: (userId: string) => 
      [...queryKeys.payments.all, 'methods', userId] as const,
  },

  // ============================================================================
  // Address Keys
  // ============================================================================
  addresses: {
    all: ['addresses'] as const,
    lists: () => [...queryKeys.addresses.all, 'list'] as const,
    list: (userId: string) => [...queryKeys.addresses.lists(), userId] as const,
    detail: (addressId: string) => 
      [...queryKeys.addresses.all, addressId] as const,
    favorites: (userId: string) => 
      [...queryKeys.addresses.all, 'favorites', userId] as const,
  },

  // ============================================================================
  // Notification Keys
  // ============================================================================
  notifications: {
    all: ['notifications'] as const,
    lists: () => [...queryKeys.notifications.all, 'list'] as const,
    list: (userId: string, filters?: { unreadOnly?: boolean }) => 
      [...queryKeys.notifications.lists(), userId, filters] as const,
    unreadCount: (userId: string) => 
      [...queryKeys.notifications.all, 'unread-count', userId] as const,
  },
} as const;

/**
 * Helper to invalidate all queries for a specific user
 * Useful on logout or user switch
 */
export function getUserQueryKeys(userId: string) {
  return [
    queryKeys.profiles.detail(userId),
    queryKeys.trips.list({ userId }),
    queryKeys.payments.list(userId),
    queryKeys.addresses.list(userId),
    queryKeys.notifications.list(userId),
  ];
}
