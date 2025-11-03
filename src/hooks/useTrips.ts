import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useApi } from '@/context/ApiContext';
import { queryKeys } from '@/api/queryKeys';
import type { CreateTripRequest, UpdateTripRequest, TripStatus } from '@/api/types';

/**
 * Trips list hook
 * 
 * Usage:
 * const { trips, isLoading, createTrip } = useTrips(userId);
 */
export function useTrips(
  userId?: string,
  options?: {
    status?: TripStatus;
    limit?: number;
    offset?: number;
  }
) {
  const { supabase, api } = useApi();
  const queryClient = useQueryClient();

  /**
   * Fetch trips query
   */
  const tripsQuery = useQuery({
    queryKey: queryKeys.trips.list({ userId, ...options }),
    queryFn: () => api.trips.listTrips(supabase, userId!, options),
    enabled: !!userId,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });

  /**
   * Create trip mutation
   */
  const createMutation = useMutation({
    mutationFn: (request: CreateTripRequest) =>
      api.trips.createTrip(supabase, userId!, request),
    onSuccess: () => {
      // Invalidate trips list to refetch
      queryClient.invalidateQueries({ queryKey: queryKeys.trips.lists() });
    },
  });

  /**
   * Delete trip mutation
   */
  const deleteMutation = useMutation({
    mutationFn: (tripId: string) => api.trips.deleteTrip(supabase, tripId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.trips.lists() });
    },
  });

  return {
    // Query data
    trips: tripsQuery.data ?? [],
    isLoading: tripsQuery.isLoading,
    isError: tripsQuery.isError,
    error: tripsQuery.error,
    refetch: tripsQuery.refetch,

    // Mutations
    createTrip: createMutation.mutateAsync,
    deleteTrip: deleteMutation.mutateAsync,

    // Mutation states
    isCreating: createMutation.isPending,
    isDeleting: deleteMutation.isPending,

    // Mutation errors
    createError: createMutation.error,
    deleteError: deleteMutation.error,
  };
}

/**
 * Single trip hook
 * 
 * Usage:
 * const { trip, isLoading, updateTrip, cancelTrip } = useTrip(tripId);
 */
export function useTrip(tripId?: string) {
  const { supabase, api } = useApi();
  const queryClient = useQueryClient();

  /**
   * Fetch trip query
   */
  const tripQuery = useQuery({
    queryKey: queryKeys.trips.detail(tripId!),
    queryFn: () => api.trips.getTripById(supabase, tripId!),
    enabled: !!tripId,
    staleTime: 1000 * 60 * 1, // 1 minute
  });

  /**
   * Update trip mutation
   */
  const updateMutation = useMutation({
    mutationFn: (updates: UpdateTripRequest) =>
      api.trips.updateTrip(supabase, tripId!, updates),
    onSuccess: (data) => {
      // Optimistically update cache
      queryClient.setQueryData(queryKeys.trips.detail(tripId!), data);
      // Invalidate list to show updated data
      queryClient.invalidateQueries({ queryKey: queryKeys.trips.lists() });
    },
  });

  /**
   * Cancel trip mutation
   */
  const cancelMutation = useMutation({
    mutationFn: () => api.trips.cancelTrip(supabase, tripId!),
    onSuccess: (data) => {
      queryClient.setQueryData(queryKeys.trips.detail(tripId!), data);
      queryClient.invalidateQueries({ queryKey: queryKeys.trips.lists() });
    },
  });

  /**
   * Complete trip mutation
   */
  const completeMutation = useMutation({
    mutationFn: () => api.trips.completeTrip(supabase, tripId!),
    onSuccess: (data) => {
      queryClient.setQueryData(queryKeys.trips.detail(tripId!), data);
      queryClient.invalidateQueries({ queryKey: queryKeys.trips.lists() });
    },
  });

  return {
    // Query data
    trip: tripQuery.data,
    isLoading: tripQuery.isLoading,
    isError: tripQuery.isError,
    error: tripQuery.error,
    refetch: tripQuery.refetch,

    // Mutations
    updateTrip: updateMutation.mutateAsync,
    cancelTrip: cancelMutation.mutateAsync,
    completeTrip: completeMutation.mutateAsync,

    // Mutation states
    isUpdating: updateMutation.isPending,
    isCancelling: cancelMutation.isPending,
    isCompleting: completeMutation.isPending,

    // Mutation errors
    updateError: updateMutation.error,
    cancelError: cancelMutation.error,
    completeError: completeMutation.error,
  };
}

/**
 * Active trip hook
 * Fetches the current active trip for a user
 * 
 * Usage:
 * const { activeTrip, isLoading } = useActiveTrip(userId);
 */
export function useActiveTrip(userId?: string) {
  const { supabase, api } = useApi();

  return useQuery({
    queryKey: queryKeys.trips.active(userId!),
    queryFn: () => api.trips.getActiveTrip(supabase, userId!),
    enabled: !!userId,
    staleTime: 1000 * 30, // 30 seconds (more frequent for active trips)
    refetchInterval: 1000 * 30, // Poll every 30 seconds
  });
}

/**
 * Hook for current user's trips
 * Convenience wrapper that uses current user ID from auth context
 */
export function useCurrentUserTrips(options?: {
  status?: TripStatus;
  limit?: number;
  offset?: number;
}) {
  const { user } = useApi();
  return useTrips(user?.id, options);
}

/**
 * Hook for current user's active trip
 */
export function useCurrentUserActiveTrip() {
  const { user } = useApi();
  return useActiveTrip(user?.id);
}
