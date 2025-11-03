import { z } from 'zod';
import { AxiosError } from 'axios';
import { PostgrestError, AuthError } from '@supabase/supabase-js';

/**
 * Standardized API error class
 * All API errors are normalized to this shape for consistent handling
 */
export class ApiError extends Error {
  code?: string;
  status?: number;
  details?: unknown;
  cause?: unknown;
  isNetworkError: boolean;
  isValidationError: boolean;

  constructor(
    message: string,
    options?: {
      code?: string;
      status?: number;
      details?: unknown;
      cause?: unknown;
      isNetworkError?: boolean;
      isValidationError?: boolean;
    }
  ) {
    super(message);
    this.name = 'ApiError';
    this.code = options?.code;
    this.status = options?.status;
    this.details = options?.details;
    this.cause = options?.cause;
    this.isNetworkError = options?.isNetworkError ?? false;
    this.isValidationError = options?.isValidationError ?? false;

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ApiError);
    }
  }
}

/**
 * Normalize Supabase Postgrest errors
 */
export function normalizeSupabaseError(error: PostgrestError | AuthError | any): ApiError {
  return new ApiError(error.message || 'Supabase operation failed', {
    code: error.code || error.error_code,
    status: error.status,
    details: error.details || error.hint,
    cause: error,
    isNetworkError: false,
  });
}

/**
 * Normalize axios HTTP errors with proper network detection
 */
export function normalizeAxiosError(error: AxiosError | any): ApiError {
  // Network error (no response received)
  if (error.code === 'ECONNABORTED' || error.code === 'ERR_NETWORK' || !error.response) {
    return new ApiError(error.message || 'Network error occurred', {
      code: error.code,
      cause: error,
      isNetworkError: true,
    });
  }

  // HTTP error (response received with error status)
  if (error.response) {
    const data = error.response.data;
    return new ApiError(
      data?.message || data?.error || error.message || 'Request failed',
      {
        status: error.response.status,
        code: data?.code || error.code,
        details: data,
        cause: error,
        isNetworkError: false,
      }
    );
  }

  // Fallback for unknown errors
  return new ApiError(error.message || 'Unknown error occurred', {
    cause: error,
    isNetworkError: false,
  });
}

/**
 * Normalize Zod validation errors
 */
export function normalizeZodError(error: z.ZodError): ApiError {
  const firstIssue = error.issues[0];
  const message = firstIssue
    ? `Validation error: ${firstIssue.path.join('.')} - ${firstIssue.message}`
    : 'Validation failed';

  return new ApiError(message, {
    code: 'VALIDATION_ERROR',
    status: 400,
    details: error.issues,
    cause: error,
    isValidationError: true,
  });
}

/**
 * Type guard to check if error is ApiError
 */
export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}

/**
 * Helper functions to check error types
 */
export function isUnauthorized(error: unknown): boolean {
  return isApiError(error) && error.status === 401;
}

export function isForbidden(error: unknown): boolean {
  return isApiError(error) && error.status === 403;
}

export function isNotFound(error: unknown): boolean {
  return isApiError(error) && error.status === 404;
}

export function isServerError(error: unknown): boolean {
  return isApiError(error) && error.status !== undefined && error.status >= 500;
}

export function isNetworkError(error: unknown): boolean {
  return isApiError(error) && error.isNetworkError;
}

export function isValidationError(error: unknown): boolean {
  return isApiError(error) && error.isValidationError;
}

/**
 * Get user-friendly error message
 */
export function getUserFriendlyMessage(error: unknown): string {
  if (!isApiError(error)) {
    return 'An unexpected error occurred';
  }

  if (error.isNetworkError) {
    return 'Network connection failed. Please check your internet connection.';
  }

  if (isUnauthorized(error)) {
    return 'Your session has expired. Please sign in again.';
  }

  if (isForbidden(error)) {
    return 'You do not have permission to perform this action.';
  }

  if (isNotFound(error)) {
    return 'The requested resource was not found.';
  }

  if (isServerError(error)) {
    return 'Server error occurred. Please try again later.';
  }

  return error.message || 'An error occurred';
}
