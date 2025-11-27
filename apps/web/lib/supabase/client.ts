import { createBrowserClient } from '@supabase/ssr'
import { Database } from '@/types/database'

/**
 * Creates a Supabase client for use in Client Components
 * This client uses cookies for authentication state
 */
export function createClient() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://mock.supabase.co'
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'mock-anon-key'

    if (!supabaseUrl || !supabaseAnonKey) {
        // Fallback for development without env vars
        console.warn('Missing Supabase environment variables, using mock values')
    }

    return createBrowserClient<Database>(supabaseUrl, supabaseAnonKey)
}
