import { SupabaseClient } from '@supabase/supabase-js';
import { normalizeSupabaseError, normalizeZodError } from './errors';
import * as schemas from './schemas';
import type { Profile, UpdateProfileRequest } from './types';

/**
 * Profiles API module
 * Handles user profile CRUD operations with Zod validation
 */

export const profilesApi = {
  /**
   * Get profile by user ID
   * Transforms avatar_url from file path to full public URL
   */
  async getProfile(
    supabase: SupabaseClient,
    userId: string
  ): Promise<Profile> {
    console.log('[profilesApi.getProfile] Fetching profile for userId:', userId);
    
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('[profilesApi.getProfile] Error fetching profile:', error);
      throw normalizeSupabaseError(error);
    }

    if (!data) {
      console.error('[profilesApi.getProfile] No profile data found for userId:', userId);
      throw new Error('Profile not found');
    }

    console.log('[profilesApi.getProfile] Raw profile data from DB:', data);
    console.log('[profilesApi.getProfile] Avatar URL from DB (raw): ', data.avatar_url);

    if (data.avatar_url) {
      console.log('[profilesApi.getProfile] Avatar URL before transformation: ', data.avatar_url);
      const raw = String(data.avatar_url);
      const isFull = /^https?:\/\//i.test(raw);
      let path: string | null = null;
      if (isFull) {
        const m = raw.match(/\/avatars\/([^?#]+)/);
        path = m?.[1] || null;
      } else {
        path = raw;
      }

      if (path) {
        const { data: { publicUrl } } = supabase.storage
          .from('avatars')
          .getPublicUrl(path);
        data.avatar_url = publicUrl || null;
        console.log('[profilesApi.getProfile] Avatar normalized to public URL:', data.avatar_url);
      }
    }
    console.log('[profilesApi.getProfile] Avatar URL before schema validation: ', data.avatar_url);

    // Validate response data
    try {
      const validatedProfile = schemas.profileSchema.parse(data);
      console.log('[profilesApi.getProfile] Validated profile:', validatedProfile);
      return validatedProfile;
    } catch (error: any) {
      console.error('[profilesApi.getProfile] Validation error:', error);
      if (error.name === 'ZodError') {
        throw normalizeZodError(error);
      }
      throw error;
    }
  },

  /**
   * Update profile
   * Transforms avatar_url from file path to full public URL in response
   */
  async updateProfile(
    supabase: SupabaseClient,
    userId: string,
    updates: UpdateProfileRequest
  ): Promise<Profile> {
    try {
      console.log('[profilesApi.updateProfile] Updating profile for userId:', userId, 'with updates:', updates);
      console.log('[profilesApi.updateProfile] Avatar URL in updates (raw): ', updates.avatar_url);
      
      // Validate input
      const validated = schemas.updateProfileSchema.parse(updates);
      console.log('[profilesApi.updateProfile] Avatar URL after updateProfileSchema validation: ', validated.avatar_url);

      // Normalize avatar_url to storage path if a full URL was provided
      let avatarPath = validated.avatar_url;
      console.log('[profilesApi.updateProfile] Avatar URL before path normalization: ', avatarPath);
      if (avatarPath && /^https?:\/\//i.test(avatarPath)) {
        const m = avatarPath.match(/\/avatars\/([^?#]+)/);
        avatarPath = m?.[1] || avatarPath;
        console.log('[profilesApi.updateProfile] Avatar URL after path normalization (storage path): ', avatarPath);
      }

      const updatePayload = {
        ...validated,
        ...(avatarPath ? { avatar_url: avatarPath } : {}),
        updated_at: new Date().toISOString(),
      } as typeof validated & { updated_at: string };
      console.log('[profilesApi.updateProfile] Avatar URL in Supabase update payload: ', updatePayload.avatar_url);

      // Make request
      const { data, error } = await supabase
        .from('profiles')
        .update(updatePayload)
        .eq('id', userId)
        .select()
        .single();

      if (error) {
        console.error('[profilesApi.updateProfile] Error updating profile:', error);
        throw normalizeSupabaseError(error);
      }

      if (!data) {
        console.error('[profilesApi.updateProfile] No data returned after update');
        throw new Error('Profile update failed');
      }

      console.log('[profilesApi.updateProfile] Raw updated profile data:', data);
      console.log('[profilesApi.updateProfile] Avatar URL from Supabase response (raw): ', data.avatar_url);

      if (data.avatar_url) {
        console.log('[profilesApi.updateProfile] Avatar URL before public URL transformation: ', data.avatar_url);
        const raw = String(data.avatar_url);
        const isFull = /^https?:\/\//i.test(raw);
        let path: string | null = null;
        if (isFull) {
          const m = raw.match(/\/avatars\/([^?#]+)/);
          path = m?.[1] || null;
        } else {
          path = raw;
        }
        if (path) {
          const { data: { publicUrl } } = supabase.storage
            .from('avatars')
            .getPublicUrl(path);
          data.avatar_url = publicUrl || null;
          console.log('[profilesApi.updateProfile] Avatar normalized to public URL:', data.avatar_url);
        }
      }
      console.log('[profilesApi.updateProfile] Avatar URL before final profileSchema validation: ', data.avatar_url);

      // Validate response
      const validatedProfile = schemas.profileSchema.parse(data);
      console.log('[profilesApi.updateProfile] Validated updated profile:', validatedProfile);
      return validatedProfile;
    } catch (error: any) {
      console.error('[profilesApi.updateProfile] Error:', error);
      if (error.name === 'ZodError') {
        throw normalizeZodError(error);
      }
      throw error;
    }
  },

  /**
   * Create profile (usually called after sign up)
   * Transforms avatar_url from file path to full public URL in response
   */
  async createProfile(
    supabase: SupabaseClient,
    userId: string,
    profileData?: Partial<UpdateProfileRequest>
  ): Promise<Profile> {
    try {
      console.log('[profilesApi.createProfile] Creating profile for userId:', userId, 'with data:', profileData);
      console.log('[profilesApi.createProfile] Avatar URL in profileData (raw): ', (profileData as any)?.avatar_url);
      
      // Normalize incoming profileData avatar_url (if provided) to storage path
      let initialAvatarPath: string | undefined = (profileData as any)?.avatar_url;
      console.log('[profilesApi.createProfile] Avatar URL before initial path normalization: ', initialAvatarPath);
      if (initialAvatarPath && /^https?:\/\//i.test(initialAvatarPath)) {
        const m = initialAvatarPath.match(/\/avatars\/([^?#]+)/);
        initialAvatarPath = m?.[1] || initialAvatarPath;
        console.log('[profilesApi.createProfile] Avatar URL after initial path normalization (storage path): ', initialAvatarPath);
      }

      const { data, error } = await supabase
        .from('profiles')
        .insert({
          id: userId,
          ...profileData,
          ...(initialAvatarPath ? { avatar_url: initialAvatarPath } : {}),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) {
        console.error('[profilesApi.createProfile] Error creating profile:', error);
        throw normalizeSupabaseError(error);
      }

      if (!data) {
        console.error('[profilesApi.createProfile] No data returned after creation');
        throw new Error('Profile creation failed');
      }

      console.log('[profilesApi.createProfile] Raw created profile data:', data);
      console.log('[profilesApi.createProfile] Avatar URL from Supabase response (raw): ', data.avatar_url);

      // Normalize avatar_url to a Supabase public URL
      if (data.avatar_url) {
        console.log('[profilesApi.createProfile] Avatar URL before public URL transformation: ', data.avatar_url);
        const raw = String(data.avatar_url);
        const isFull = /^https?:\/\//i.test(raw);
        let path: string | null = null;
        if (isFull) {
          const m = raw.match(/\/avatars\/([^?#]+)/);
          path = m?.[1] || null;
        } else {
          path = raw;
        }
        if (path) {
          const { data: { publicUrl } } = supabase.storage
            .from('avatars')
            .getPublicUrl(path);
          data.avatar_url = publicUrl || null;
          console.log('[profilesApi.createProfile] Avatar normalized to public URL:', data.avatar_url);
        }
      }
      console.log('[profilesApi.createProfile] Avatar URL before final profileSchema validation: ', data.avatar_url);

      // Validate response
      const validatedProfile = schemas.profileSchema.parse(data);
      console.log('[profilesApi.createProfile] Validated created profile:', validatedProfile);
      return validatedProfile;
    } catch (error: any) {
      console.error('[profilesApi.createProfile] Error:', error);
      if (error.name === 'ZodError') {
        throw normalizeZodError(error);
      }
      throw error;
    }
  },

  /**
   * Delete profile
   */
  async deleteProfile(
    supabase: SupabaseClient,
    userId: string
  ): Promise<void> {
    const { error } = await supabase
      .from('profiles')
      .delete()
      .eq('id', userId);

    if (error) {
      throw normalizeSupabaseError(error);
    }
  },

  /**
   * Upload avatar image
   * Supports File, Blob, and ArrayBuffer (for React Native)
   */
  async uploadAvatar(
    supabase: SupabaseClient,
    userId: string,
    file: File | Blob | ArrayBuffer,
    options: {
      fileName: string;
      contentType?: string;
    }
  ): Promise<string> {
    const filePath = `${userId}/${options.fileName}`;
    console.log('[profilesApi.uploadAvatar] Constructed file path for avatar: ', filePath);

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, file, {
        contentType: options.contentType,
        upsert: false,
      });

    if (uploadError) {
      throw normalizeSupabaseError(uploadError);
    }
    console.log('[profilesApi.uploadAvatar] Avatar uploaded successfully to path: ', filePath);
    // Return the file path (not the full URL) for storage in the database
    return filePath;
  },

  /**
   * Get avatar public URL
   */
  getAvatarUrl(
    supabase: SupabaseClient,
    filePath: string
  ): string {
    console.log('[profilesApi.getAvatarUrl] Received file path: ', filePath);
    const { data: { publicUrl } } = supabase.storage
      .from('avatars')
      .getPublicUrl(filePath);
    console.log('[profilesApi.getAvatarUrl] Returned public URL: ', publicUrl);
    return publicUrl;
  },

  /**
   * Delete avatar image
   */
  async deleteAvatar(
    supabase: SupabaseClient,
    userId: string,
    fileName: string
  ): Promise<void> {
    const filePath = `${userId}/${fileName}`;
    console.log('[profilesApi.deleteAvatar] Constructed file path for avatar deletion: ', filePath);

    const { error } = await supabase.storage
      .from('avatars')
      .remove([filePath]);

    if (error) {
      throw normalizeSupabaseError(error);
    }
    console.log('[profilesApi.deleteAvatar] Avatar deleted successfully from path: ', filePath);  },
};
