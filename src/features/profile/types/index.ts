/**
 * User profile types
 */
export interface UserProfile {
  id: string;
  username?: string;
  full_name?: string;
  avatar_url?: string;
  phone?: string;
  email?: string;
  created_at: string;
  updated_at: string;
}

/**
 * Address types
 */
export interface SavedAddress {
  id: string;
  user_id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  type: AddressType;
  is_default?: boolean;
  created_at: string;
  updated_at: string;
}

export enum AddressType {
  HOME = 'home',
  WORK = 'work',
  FAVORITE = 'favorite',
  OTHER = 'other',
}

/**
 * User preferences
 */
export interface UserPreferences {
  id: string;
  user_id: string;
  default_payment_method_id?: string;
  default_ride_type_id?: string;
  language: string;
  theme: 'light' | 'dark' | 'system';
  notifications_enabled: boolean;
  created_at: string;
  updated_at: string;
}
