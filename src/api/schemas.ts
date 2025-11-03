import { z } from 'zod';

/**
 * Zod schemas for API request/response validation
 * These ensure type safety and runtime validation
 */

// ============================================================================
// Auth Schemas
// ============================================================================

export const signInSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const signUpSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  metadata: z.record(z.any()).optional(),
});

export const signInWithOtpSchema = z.object({
  email: z.string().email('Invalid email address'),
  options: z
    .object({
      emailRedirectTo: z.string().url().optional(),
      shouldCreateUser: z.boolean().optional(),
    })
    .optional(),
});

export const userSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime().optional(),
  email_confirmed_at: z.string().datetime().optional(),
  phone: z.string().optional(),
  app_metadata: z.record(z.any()).optional(),
  user_metadata: z.record(z.any()).optional(),
});

export const sessionSchema = z.object({
  access_token: z.string(),
  refresh_token: z.string(),
  expires_in: z.number(),
  expires_at: z.number().optional(),
  token_type: z.string(),
  user: userSchema,
});

// ============================================================================
// Profile Schemas
// ============================================================================

export const profileSchema = z.object({
  id: z.string().uuid(),
  username: z.string().nullable().optional(),
  full_name: z.string().nullable().optional(),
  avatar_url: z.string().nullable().optional(), // Can be file path or full URL
  phone: z.string().nullable().optional(),
  date_of_birth: z.string().nullable().optional(),
  updated_at: z.preprocess(
    (val) => {
      if (val === '' || val === null || val === undefined) return null;
      if (typeof val === 'string') {
        const d = new Date(val.replace(' ', 'T'));
        if (!isNaN(d.getTime())) return d.toISOString();
      }
      return val;
    },
    z.string().datetime().nullable().optional()
  ),
});

export const updateProfileSchema = z.object({
  username: z.preprocess(
    (val) => val === '' ? undefined : val,
    z.string().min(1).optional()
  ),
  full_name: z.preprocess(
    (val) => val === '' ? undefined : val,
    z.string().min(1).optional()
  ),
  avatar_url: z.string().optional(),
  phone: z.string().optional(),
  date_of_birth: z.string().optional(),
});

// ============================================================================
// Trip Schemas
// ============================================================================

export const tripStatusSchema = z.enum([
  'pending',
  'searching',
  'accepted',
  'in_progress',
  'completed',
  'cancelled',
]);

export const locationSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  address: z.string().optional(),
});

export const tripSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  driver_id: z.string().uuid().nullable().optional(),
  origin: locationSchema,
  destination: locationSchema,
  status: tripStatusSchema,
  fare: z.number().positive().optional(),
  distance: z.number().positive().optional(),
  duration: z.number().positive().optional(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
  started_at: z.string().datetime().nullable().optional(),
  completed_at: z.string().datetime().nullable().optional(),
});

export const createTripSchema = z.object({
  origin: locationSchema,
  destination: locationSchema,
  vehicle_type: z.enum(['economy', 'comfort', 'premium']).optional(),
  payment_method: z.enum(['cash', 'card', 'wallet']).optional(),
});

export const updateTripSchema = z.object({
  status: tripStatusSchema.optional(),
  driver_id: z.string().uuid().optional(),
  fare: z.number().positive().optional(),
});

// ============================================================================
// Payment Schemas
// ============================================================================

export const paymentMethodSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  type: z.enum(['card', 'bank_account', 'wallet']),
  last_four: z.string().length(4).optional(),
  brand: z.string().optional(),
  is_default: z.boolean(),
  created_at: z.string().datetime(),
});

export const paymentSchema = z.object({
  id: z.string().uuid(),
  trip_id: z.string().uuid(),
  user_id: z.string().uuid(),
  amount: z.number().positive(),
  currency: z.string().length(3).default('USD'),
  status: z.enum(['pending', 'processing', 'completed', 'failed', 'refunded']),
  payment_method_id: z.string().uuid(),
  created_at: z.string().datetime(),
  completed_at: z.string().datetime().nullable().optional(),
});

// ============================================================================
// Address Schemas
// ============================================================================

export const addressSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  label: z.string().min(1),
  address: z.string().min(1),
  location: locationSchema,
  is_favorite: z.boolean().default(false),
  created_at: z.string().datetime(),
});

export const createAddressSchema = z.object({
  label: z.string().min(1, 'Label is required'),
  address: z.string().min(1, 'Address is required'),
  location: locationSchema,
  is_favorite: z.boolean().optional(),
});

// ============================================================================
// Notification Schemas
// ============================================================================

export const notificationSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  title: z.string(),
  message: z.string(),
  type: z.enum(['info', 'success', 'warning', 'error', 'trip_update']),
  is_read: z.boolean().default(false),
  data: z.record(z.any()).optional(),
  created_at: z.string().datetime(),
});

// ============================================================================
// Helper function to validate data against schema
// ============================================================================

export function validateSchema<T>(schema: z.ZodSchema<T>, data: unknown): T {
  return schema.parse(data);
}

export function validateSchemaAsync<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): Promise<T> {
  return schema.parseAsync(data);
}
