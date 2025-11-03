import { queryKeys } from '@/api/queryKeys';
import type { UpdateProfileRequest } from '@/api/types';
import { useApi } from '@/context/ApiContext';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

/**
 * Profile hook with TanStack Query
 * 
 * Provides:
 * - Query for fetching profile
 * - Mutations for updating, creating, deleting profile
 * - Avatar upload/delete
 * 
 * Usage:
 * const { profile, isLoading, updateProfile } = useProfile(userId);
 */
export function useProfile(userId?: string) {
  const { supabase, api } = useApi();
  const queryClient = useQueryClient();

  /**
   * Fetch profile query
   */
  const profileQuery = useQuery({
    queryKey: queryKeys.profiles.detail(userId!),
    queryFn: async () => {
      const profile = await api.profiles.getProfile(supabase, userId!);
      return profile;
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  /**
   * Update profile mutation
   */
  const updateMutation = useMutation({
    mutationFn: (updates: UpdateProfileRequest) =>
      api.profiles.updateProfile(supabase, userId!, updates),
    onSuccess: (data) => {
      // Optimistically update cache
      queryClient.setQueryData(queryKeys.profiles.detail(userId!), data);
    },
  });

  /**
   * Create profile mutation
   */
  const createMutation = useMutation({
    mutationFn: (profileData?: Partial<UpdateProfileRequest>) =>
      api.profiles.createProfile(supabase, userId!, profileData),
    onSuccess: (data) => {
      queryClient.setQueryData(queryKeys.profiles.detail(userId!), data);
    },
  });

  /**
   * Delete profile mutation
   */
  const deleteMutation = useMutation({
    mutationFn: () => api.profiles.deleteProfile(supabase, userId!),
    onSuccess: () => {
      queryClient.removeQueries({ queryKey: queryKeys.profiles.detail(userId!) });
    },
  });

  /**
   * Upload avatar mutation
   */
  const uploadAvatarMutation = useMutation({
    mutationFn: ({ 
      file, 
      fileName, 
      contentType 
    }: { 
      file: File | Blob | ArrayBuffer; 
      fileName: string; 
      contentType?: string;
    }) =>
      api.profiles.uploadAvatar(supabase, userId!, file, { fileName, contentType }),
    onSuccess: (filePath) => {
      // Update profile with new avatar file path
      return updateMutation.mutateAsync({ avatar_url: filePath });
    },
  });

  /**
   * Delete avatar mutation
   */
  const deleteAvatarMutation = useMutation({
    mutationFn: (fileName: string) =>
      api.profiles.deleteAvatar(supabase, userId!, fileName),
    onSuccess: () => {
      // Update profile to remove avatar URL
      return updateMutation.mutateAsync({ avatar_url: undefined });
    },
  });

  return {
    // Query data
    profile: profileQuery.data,
    isLoading: profileQuery.isLoading,
    isError: profileQuery.isError,
    error: profileQuery.error,
    refetch: profileQuery.refetch,

    // Mutations
    updateProfile: updateMutation.mutateAsync,
    createProfile: createMutation.mutateAsync,
    deleteProfile: deleteMutation.mutateAsync,
    uploadAvatar: uploadAvatarMutation.mutateAsync,
    deleteAvatar: deleteAvatarMutation.mutateAsync,

    // Mutation states
    isUpdating: updateMutation.isPending,
    isCreating: createMutation.isPending,
    isDeleting: deleteMutation.isPending,
    isUploadingAvatar: uploadAvatarMutation.isPending,
    isDeletingAvatar: deleteAvatarMutation.isPending,

    // Mutation errors
    updateError: updateMutation.error,
    createError: createMutation.error,
    deleteError: deleteMutation.error,
    uploadAvatarError: uploadAvatarMutation.error,
    deleteAvatarError: deleteAvatarMutation.error,
  };
}

/**
 * Hook for current user's profile
 * Convenience wrapper that uses current user ID from auth context
 */
export function useCurrentProfile() {
  const { user } = useApi();
  return useProfile(user?.id);
}
