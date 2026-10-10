/**
 * CampusCare Supabase Client Initialization
 * Connects to Supabase using standard CDN JS library
 */
const SUPABASE_URL = 'https://sncjnlzukwpnhfjtnkdu.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_Jsv9_AsRoo3aavgds7E16Q_eNwr1uOr';

// Access Supabase from global window (loaded via CDN <script src="...">)
const createClient = (typeof window !== 'undefined' && window.supabase && window.supabase.createClient) 
  ? window.supabase.createClient 
  : (url, key) => null;

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
});
