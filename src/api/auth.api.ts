import { SupabaseClient } from '@supabase/supabase-js';
import { normalizeSupabaseError, normalizeZodError } from './errors';
import * as schemas from './schemas';
import type { SignInRequest, SignUpRequest, SignInWithOtpRequest, User, Session } from './types';

/**
 * Authentication API module
 * All functions are pure and accept dependencies explicitly
 * Validates inputs with Zod schemas before making requests
 */

export const authApi = {
  /**
   * Sign in with email and password
   */
  async signIn(
    supabase: SupabaseClient,
    request: SignInRequest
  ): Promise<{ user: User; session: Session }> {
    try {
      // Validate input
      const validated = schemas.signInSchema.parse(request);

      // Make request
      const { data, error } = await supabase.auth.signInWithPassword({
        email: validated.email,
        password: validated.password,
      });

      if (error) {
        throw normalizeSupabaseError(error);
      }

      if (!data.user || !data.session) {
        throw new Error('Sign in failed: no user or session returned');
      }

      return {
        user: data.user as User,
        session: data.session as Session,
      };
    } catch (error: any) {
      if (error.name === 'ZodError') {
        throw normalizeZodError(error);
      }
      throw error;
    }
  },

  /**
   * Sign up with email and password
   */
  async signUp(
    supabase: SupabaseClient,
    request: SignUpRequest
  ): Promise<{ user: User; session: Session | null }> {
    try {
      // Validate input
      const validated = schemas.signUpSchema.parse(request);

      // Make request
      const { data, error } = await supabase.auth.signUp({
        email: validated.email,
        password: validated.password,
        options: {
          data: validated.metadata,
        },
      });

      if (error) {
        throw normalizeSupabaseError(error);
      }

      if (!data.user) {
        throw new Error('Sign up failed: no user returned');
      }

      return {
        user: data.user as User,
        session: data.session as Session | null,
      };
    } catch (error: any) {
      if (error.name === 'ZodError') {
        throw normalizeZodError(error);
      }
      throw error;
    }
  },

  /**
   * Sign in with OTP (magic link)
   */
  async signInWithOtp(
    supabase: SupabaseClient,
    request: SignInWithOtpRequest
  ): Promise<void> {
    try {
      // Validate input
      const validated = schemas.signInWithOtpSchema.parse(request);

      // Make request
      const { error } = await supabase.auth.signInWithOtp({
        email: validated.email,
        options: validated.options,
      });

      if (error) {
        throw normalizeSupabaseError(error);
      }
    } catch (error: any) {
      if (error.name === 'ZodError') {
        throw normalizeZodError(error);
      }
      throw error;
    }
  },

  /**
   * Sign out current user
   */
  async signOut(supabase: SupabaseClient): Promise<void> {
    const { error } = await supabase.auth.signOut();

    if (error) {
      throw normalizeSupabaseError(error);
    }
  },

  /**
   * Get current session
   */
  async getSession(supabase: SupabaseClient): Promise<Session | null> {
    const { data: { session }, error } = await supabase.auth.getSession();

    if (error) {
      throw normalizeSupabaseError(error);
    }

    return session as Session | null;
  },

  /**
   * Get current user
   */
  async getCurrentUser(supabase: SupabaseClient): Promise<User | null> {
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error) {
      throw normalizeSupabaseError(error);
    }

    return user as User | null;
  },

  /**
   * Refresh session
   */
  async refreshSession(supabase: SupabaseClient): Promise<Session | null> {
    const { data: { session }, error } = await supabase.auth.refreshSession();

    if (error) {
      throw normalizeSupabaseError(error);
    }

    return session as Session | null;
  },

  /**
   * Reset password (send reset email)
   */
  async resetPassword(
    supabase: SupabaseClient,
    email: string
  ): Promise<void> {
    try {
      // Validate email
      const validated = schemas.signInWithOtpSchema.pick({ email: true }).parse({ email });

      const { error } = await supabase.auth.resetPasswordForEmail(validated.email);

      if (error) {
        throw normalizeSupabaseError(error);
      }
    } catch (error: any) {
      if (error.name === 'ZodError') {
        throw normalizeZodError(error);
      }
      throw error;
    }
  },

  /**
   * Update password
   */
  async updatePassword(
    supabase: SupabaseClient,
    newPassword: string
  ): Promise<void> {
    try {
      // Validate password
      const validated = schemas.signUpSchema.pick({ password: true }).parse({ password: newPassword });

      const { error } = await supabase.auth.updateUser({
        password: validated.password,
      });

      if (error) {
        throw normalizeSupabaseError(error);
      }
    } catch (error: any) {
      if (error.name === 'ZodError') {
        throw normalizeZodError(error);
      }
      throw error;
    }
  },
};
