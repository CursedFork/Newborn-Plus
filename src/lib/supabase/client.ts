import { createBrowserClient } from '@supabase/ssr'

// TODO: after `npx supabase link && npx supabase gen types typescript --linked > src/lib/database.types.ts`
// re-add the <Database> generic here so all queries are fully typed.
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
