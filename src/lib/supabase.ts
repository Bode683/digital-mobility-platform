import { createClient, type SupabaseClient, type Session, type User } from '@supabase/supabase-js'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { normalizeSupabaseError } from '@/api/errors'

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL as string
const supabasePublishableKey = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY as string

if (!supabaseUrl || !supabasePublishableKey) {
  throw new Error('Missing EXPO_PUBLIC_SUPABASE_URL or EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY')
}

let client: SupabaseClient | null = null

/**
 * Get or create singleton Supabase client
 */
export function getSupabase(): SupabaseClient {
  if (client) return client

  const isBrowser = typeof window !== 'undefined'

  client = createClient(supabaseUrl, supabasePublishableKey, {
    auth: {
      storage: (isBrowser ? (AsyncStorage as any) : undefined) as any,
      autoRefreshToken: true,
      persistSession: isBrowser,
      detectSessionInUrl: false,
    },
  })

  return client
}

/**
 * Get current session
 * @throws {ApiError} if session fetch fails
 */
export async function getCurrentSession(): Promise<Session | null> {
  const supabase = getSupabase()
  const { data: { session }, error } = await supabase.auth.getSession()
  
  if (error) {
    throw normalizeSupabaseError(error)
  }
  
  return session
}

/**
 * Get current user
 * @throws {ApiError} if user fetch fails
 */
export async function getCurrentUser(): Promise<User | null> {
  const supabase = getSupabase()
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error) {
    throw normalizeSupabaseError(error)
  }
  
  return user
}

/**
 * Get current access token
 */
export async function getAccessToken(): Promise<string | null> {
  try {
    const session = await getCurrentSession()
    return session?.access_token ?? null
  } catch {
    return null
  }
}

/**
 * Check if user is authenticated
 */
export async function isAuthenticated(): Promise<boolean> {
  try {
    const session = await getCurrentSession()
    return !!session
  } catch {
    return false
  }
}

/**
 * Refresh session
 * @throws {ApiError} if refresh fails
 */
export async function refreshSession(): Promise<Session | null> {
  const supabase = getSupabase()
  const { data: { session }, error } = await supabase.auth.refreshSession()
  
  if (error) {
    throw normalizeSupabaseError(error)
  }
  
  return session
}
