import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import axiosRetry, { exponentialDelay, isNetworkError } from 'axios-retry';
import { getAccessToken } from './supabase';
import { normalizeAxiosError } from '@/api/errors';

/**
 * Axios HTTP client with interceptors for auth and error handling
 * 
 * CRITICAL FIX: Async interceptor pattern
 * - Axios request interceptors can be async
 * - We properly await the token fetch before modifying config
 * - This prevents race conditions with auth token injection
 */

const httpClient: AxiosInstance = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_BASE_URL || '',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Request interceptor: Inject auth token from Supabase session
 * FIXED: Properly handle async token retrieval
 */
httpClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    try {
      // Await token fetch - this is the critical fix
      const token = await getAccessToken();
      
      if (token) {
        // Ensure headers object exists
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${token}`;
      }
      
      return config;
    } catch (error) {
      // If token fetch fails, proceed without auth header
      // This allows public endpoints to work
      console.warn('Failed to fetch access token for request:', error);
      return config;
    }
  },
  (error) => {
    return Promise.reject(normalizeAxiosError(error));
  }
);

/**
 * Response interceptor: Normalize all errors to ApiError
 */
httpClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const normalizedError = normalizeAxiosError(error);
    
    // Log errors in development
    if (__DEV__) {
      console.error('HTTP Error:', {
        message: normalizedError.message,
        status: normalizedError.status,
        code: normalizedError.code,
        url: error.config?.url,
      });
    }
    
    return Promise.reject(normalizedError);
  }
);

/**
 * Configure retry logic for transient errors
 * - Retries network errors and 5xx server errors
 * - Uses exponential backoff
 * - Max 3 retries
 */
axiosRetry(httpClient, {
  retries: 3,
  retryDelay: exponentialDelay,
  retryCondition: (error) => {
    // Retry on network errors
    if (isNetworkError(error)) {
      return true;
    }
    
    // Retry on 5xx server errors
    if (error.response?.status && error.response.status >= 500) {
      return true;
    }
    
    // Don't retry on 4xx client errors
    return false;
  },
  onRetry: (retryCount, error, requestConfig) => {
    if (__DEV__) {
      console.log(
        `Retrying request (${retryCount}/3):`,
        requestConfig.url
      );
    }
  },
});

export default httpClient;
