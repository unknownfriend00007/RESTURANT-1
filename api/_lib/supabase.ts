import { createClient } from '@supabase/supabase-js';

/**
 * SUPABASE CLIENT FOR BACKEND
 * Uses SERVICE ROLE key for full database access
 */
export const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY! // Never expose this to frontend
);

/**
 * SUPABASE CLIENT FOR FRONTEND
 * Uses ANON key with Row Level Security
 */
export const supabaseAnon = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
);
