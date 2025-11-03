import { z } from 'zod';
import * as schemas from './schemas';

/**
 * TypeScript types inferred from Zod schemas
 * This ensures single source of truth for validation and types
 */

// ============================================================================
// Auth Types
// ============================================================================

export type SignInRequest = z.infer<typeof schemas.signInSchema>;
export type SignUpRequest = z.infer<typeof schemas.signUpSchema>;
export type SignInWithOtpRequest = z.infer<typeof schemas.signInWithOtpSchema>;
export type User = z.infer<typeof schemas.userSchema>;
export type Session = z.infer<typeof schemas.sessionSchema>;

// ============================================================================
// Profile Types
// ============================================================================

export type Profile = z.infer<typeof schemas.profileSchema>;
export type UpdateProfileRequest = z.infer<typeof schemas.updateProfileSchema>;

// ============================================================================
// Trip Types
// ============================================================================

export type TripStatus = z.infer<typeof schemas.tripStatusSchema>;
export type Location = z.infer<typeof schemas.locationSchema>;
export type Trip = z.infer<typeof schemas.tripSchema>;
export type CreateTripRequest = z.infer<typeof schemas.createTripSchema>;
export type UpdateTripRequest = z.infer<typeof schemas.updateTripSchema>;

// ============================================================================
// Payment Types
// ============================================================================

export type PaymentMethod = z.infer<typeof schemas.paymentMethodSchema>;
export type Payment = z.infer<typeof schemas.paymentSchema>;

// ============================================================================
// Address Types
// ============================================================================

export type Address = z.infer<typeof schemas.addressSchema>;
export type CreateAddressRequest = z.infer<typeof schemas.createAddressSchema>;

// ============================================================================
// Notification Types
// ============================================================================

export type Notification = z.infer<typeof schemas.notificationSchema>;

// ============================================================================
// API Response Wrappers
// ============================================================================

export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

export interface ListOptions {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}
