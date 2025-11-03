import { SupabaseClient } from '@supabase/supabase-js';
import { normalizeSupabaseError, normalizeZodError } from './errors';
import * as schemas from './schemas';
import type { Trip, CreateTripRequest, UpdateTripRequest, TripStatus } from './types';

/**
 * Trips API module
 * Handles trip CRUD operations with Zod validation
 */

export const tripsApi = {
  /**
   * List trips for a user
   */
  async listTrips(
    supabase: SupabaseClient,
    userId: string,
    options?: {
      status?: TripStatus;
      limit?: number;
      offset?: number;
    }
  ): Promise<Trip[]> {
    let query = supabase
      .from('trips')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (options?.status) {
      query = query.eq('status', options.status);
    }

    if (options?.limit) {
      query = query.limit(options.limit);
    }

    if (options?.offset) {
      query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
    }

    const { data, error } = await query;

    if (error) {
      throw normalizeSupabaseError(error);
    }

    // Validate response data
    try {
      return data.map((trip) => schemas.tripSchema.parse(trip));
    } catch (error: any) {
      if (error.name === 'ZodError') {
        throw normalizeZodError(error);
      }
      throw error;
    }
  },

  /**
   * Get trip by ID
   */
  async getTripById(
    supabase: SupabaseClient,
    tripId: string
  ): Promise<Trip> {
    const { data, error } = await supabase
      .from('trips')
      .select('*')
      .eq('id', tripId)
      .single();

    if (error) {
      throw normalizeSupabaseError(error);
    }

    if (!data) {
      throw new Error('Trip not found');
    }

    // Validate response
    try {
      return schemas.tripSchema.parse(data);
    } catch (error: any) {
      if (error.name === 'ZodError') {
        throw normalizeZodError(error);
      }
      throw error;
    }
  },

  /**
   * Get active trip for user (if any)
   */
  async getActiveTrip(
    supabase: SupabaseClient,
    userId: string
  ): Promise<Trip | null> {
    const { data, error } = await supabase
      .from('trips')
      .select('*')
      .eq('user_id', userId)
      .in('status', ['searching', 'accepted', 'in_progress'])
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error) {
      // Not found is ok for active trip
      if (error.code === 'PGRST116') {
        return null;
      }
      throw normalizeSupabaseError(error);
    }

    if (!data) {
      return null;
    }

    // Validate response
    try {
      return schemas.tripSchema.parse(data);
    } catch (error: any) {
      if (error.name === 'ZodError') {
        throw normalizeZodError(error);
      }
      throw error;
    }
  },

  /**
   * Create new trip
   */
  async createTrip(
    supabase: SupabaseClient,
    userId: string,
    request: CreateTripRequest
  ): Promise<Trip> {
    try {
      // Validate input
      const validated = schemas.createTripSchema.parse(request);

      // Make request
      const { data, error } = await supabase
        .from('trips')
        .insert({
          user_id: userId,
          origin: validated.origin,
          destination: validated.destination,
          status: 'pending',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) {
        throw normalizeSupabaseError(error);
      }

      if (!data) {
        throw new Error('Trip creation failed');
      }

      // Validate response
      return schemas.tripSchema.parse(data);
    } catch (error: any) {
      if (error.name === 'ZodError') {
        throw normalizeZodError(error);
      }
      throw error;
    }
  },

  /**
   * Update trip
   */
  async updateTrip(
    supabase: SupabaseClient,
    tripId: string,
    updates: UpdateTripRequest
  ): Promise<Trip> {
    try {
      // Validate input
      const validated = schemas.updateTripSchema.parse(updates);

      // Make request
      const { data, error } = await supabase
        .from('trips')
        .update({
          ...validated,
          updated_at: new Date().toISOString(),
        })
        .eq('id', tripId)
        .select()
        .single();

      if (error) {
        throw normalizeSupabaseError(error);
      }

      if (!data) {
        throw new Error('Trip update failed');
      }

      // Validate response
      return schemas.tripSchema.parse(data);
    } catch (error: any) {
      if (error.name === 'ZodError') {
        throw normalizeZodError(error);
      }
      throw error;
    }
  },

  /**
   * Cancel trip
   */
  async cancelTrip(
    supabase: SupabaseClient,
    tripId: string
  ): Promise<Trip> {
    return tripsApi.updateTrip(supabase, tripId, { status: 'cancelled' });
  },

  /**
   * Complete trip
   */
  async completeTrip(
    supabase: SupabaseClient,
    tripId: string
  ): Promise<Trip> {
    const { data, error } = await supabase
      .from('trips')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', tripId)
      .select()
      .single();

    if (error) {
      throw normalizeSupabaseError(error);
    }

    if (!data) {
      throw new Error('Trip completion failed');
    }

    // Validate response
    try {
      return schemas.tripSchema.parse(data);
    } catch (error: any) {
      if (error.name === 'ZodError') {
        throw normalizeZodError(error);
      }
      throw error;
    }
  },

  /**
   * Delete trip
   */
  async deleteTrip(
    supabase: SupabaseClient,
    tripId: string
  ): Promise<void> {
    const { error } = await supabase
      .from('trips')
      .delete()
      .eq('id', tripId);

    if (error) {
      throw normalizeSupabaseError(error);
    }
  },
};
