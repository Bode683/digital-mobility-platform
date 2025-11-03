import { queryKeys } from '@/api/queryKeys';
import type { SignInRequest, SignInWithOtpRequest, SignUpRequest } from '@/api/types';
import { useApi } from '@/context/ApiContext';
import { useMutation, useQueryClient } from '@tanstack/react-query';

/**
 * Auth hook with TanStack Query mutations
 * 
 * Note: Session/user state is managed by ApiContext (via Supabase listener)
 * This hook provides mutations for auth actions (sign in, sign up, sign out)
 * 
 * Usage:
 * const { signIn, signUp, signOut, isSigningIn } = useAuth();
 * await signIn({ email, password });
 */
export function useAuth() {
  const { supabase, api, session, user, isAuthenticated, isAuthLoading } = useApi();
  const queryClient = useQueryClient();

  /**
   * Sign in mutation
   */
  const signInMutation = useMutation({
    mutationFn: (request: SignInRequest) => api.auth.signIn(supabase, request),
    onSuccess: () => {
      // Auth state is updated by Supabase listener in ApiContext
      // Invalidate user-specific queries
      queryClient.invalidateQueries({ queryKey: queryKeys.profiles.all });
    },
  });

  /**
   * Sign up mutation
   */
  const signUpMutation = useMutation({
    mutationFn: (request: SignUpRequest) => api.auth.signUp(supabase, request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.profiles.all });
    },
  });

  /**
   * Sign in with OTP mutation
   */
  const signInWithOtpMutation = useMutation({
    mutationFn: (request: SignInWithOtpRequest) =>
      api.auth.signInWithOtp(supabase, request),
  });

  /**
   * Sign out mutation
   */
  const signOutMutation = useMutation({
    mutationFn: () => api.auth.signOut(supabase),
    onSuccess: () => {
      // Clear all cached data on logout
      queryClient.clear();
    },
  });

  /**
   * Reset password mutation
   */
  const resetPasswordMutation = useMutation({
    mutationFn: ({ email }: { email: string }) => api.auth.resetPassword(supabase, email),
  });

  /**
   * Update password mutation
   */
  const updatePasswordMutation = useMutation({
    mutationFn: (newPassword: string) =>
      api.auth.updatePassword(supabase, newPassword),
  });

  return {
    // Auth state (from context)
    session,
    user,
    isAuthenticated,
    isAuthLoading,

    // Mutations
    signIn: signInMutation.mutateAsync,
    signUp: signUpMutation.mutateAsync,
    signInWithOtp: signInWithOtpMutation.mutateAsync,
    signOut: signOutMutation.mutateAsync,
    resetPassword: resetPasswordMutation.mutateAsync,
    updatePassword: updatePasswordMutation.mutateAsync,

    // Loading states
    isSigningIn: signInMutation.isPending,
    isSigningUp: signUpMutation.isPending,
    isSigningOut: signOutMutation.isPending,
    isResettingPassword: resetPasswordMutation.isPending,
    isUpdatingPassword: updatePasswordMutation.isPending,

    // Errors
    signInError: signInMutation.error,
    signUpError: signUpMutation.error,
    signOutError: signOutMutation.error,
    resetPasswordError: resetPasswordMutation.error,
    updatePasswordError: updatePasswordMutation.error,
  };
}
