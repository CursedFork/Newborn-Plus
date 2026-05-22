import { createBrowserClient } from '@supabase/ssr'

// TODO: after `npx supabase link && npx supabase gen types typescript --linked > src/lib/database.types.ts`
// re-add the <Database> generic here so all queries are fully typed.
export function createClient() {
  // Fall back to placeholder strings during build-time static rendering.
  // The app won't connect to Supabase until real env vars are provided at runtime.
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key'
  return createBrowserClient(url, key)
}
