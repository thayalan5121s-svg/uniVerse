/**
 * CampusCare Supabase Client Initialization
 * Connects to Supabase using standard CDN JS library
 */
const SUPABASE_URL = 'https://stoqalelfqnbxxvsnrsu.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN0b3FhbGVsZnFuYnh4dnNucnN1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk0NTMzMDEsImV4cCI6MjEwNTAyOTMwMX0.pEbuAB9bXdxLZNqLe0iPMsCnsf8yCqDsXMoXrys8KC0';

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
