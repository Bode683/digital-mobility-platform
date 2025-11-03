import { profilesApi } from '@/api/profiles.api'
import { getSupabase } from '@/lib/supabase'

/**
 * Build avatar URL with optional cache busting
 * Uses the API layer to get the public URL
 */
export function buildAvatarUrl(path?: string | null, cacheKey?: string | number | null) {
  if (!path) return undefined
  
  // Use API layer to get public URL
  const base = profilesApi.getAvatarUrl(getSupabase(), path)
  
  if (!cacheKey) return base
  const sep = base.includes('?') ? '&' : '?'
  return `${base}${sep}t=${encodeURIComponent(String(cacheKey))}`
}
