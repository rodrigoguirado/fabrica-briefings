import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Helper to get authenticated client (for server components)
export function createServerClient(cookieStore: any) {
  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      flowType: 'pkce',
    },
  });
}
