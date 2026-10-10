-- ========================================================
-- CAMPUSCARE SUPABASE DATABASE SCHEMA & RLS MIGRATION
-- Paste and run this script in your Supabase SQL Editor
-- ========================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. TABLE DEFINITIONS

-- PROFILES (Extends auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'staff', 'admin')),
  roll_no TEXT,
  department TEXT,
  hostel TEXT,
  room_no TEXT,
  phone TEXT,
  avatar TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- COMPLAINT CATEGORIES
CREATE TABLE IF NOT EXISTS public.complaint_categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  icon TEXT,
  department TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- COMPLAINTS
CREATE TABLE IF NOT EXISTS public.complaints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_number TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category_id TEXT REFERENCES public.complaint_categories(id) ON DELETE SET NULL,
  category TEXT NOT NULL,
  location TEXT NOT NULL,
  specific_spot TEXT,
  status TEXT NOT NULL DEFAULT 'Submitted' CHECK (status IN ('Submitted', 'Acknowledged', 'Assigned', 'In Progress', 'Resolved', 'Rejected')),
  priority TEXT NOT NULL DEFAULT 'Medium' CHECK (priority IN ('Low', 'Medium', 'High', 'Critical')),
  submitted_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  assigned_to UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  estimated_resolution_time TEXT,
  photo_url TEXT,
  audio_url TEXT,
  resolution_proof TEXT,
  visibility TEXT NOT NULL DEFAULT 'public' CHECK (visibility IN ('public', 'private')),
  upvotes INTEGER NOT NULL DEFAULT 1,
  upvoted_by UUID[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  resolved_at TIMESTAMPTZ
);

ALTER TABLE public.complaints
  ADD COLUMN IF NOT EXISTS visibility TEXT NOT NULL DEFAULT 'public';

ALTER TABLE public.complaints
  DROP CONSTRAINT IF EXISTS complaints_visibility_check;

ALTER TABLE public.complaints
  ADD CONSTRAINT complaints_visibility_check CHECK (visibility IN ('public', 'private'));

-- COMPLAINT COMMENTS
CREATE TABLE IF NOT EXISTS public.complaint_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  complaint_id UUID NOT NULL REFERENCES public.complaints(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  author_name TEXT NOT NULL,
  role TEXT NOT NULL,
  text TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- COMPLAINT TIMELINE
CREATE TABLE IF NOT EXISTS public.complaint_timeline (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  complaint_id UUID NOT NULL REFERENCES public.complaints(id) ON DELETE CASCADE,
  step TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  actor TEXT NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. SEED DEFAULT CATEGORIES
INSERT INTO public.complaint_categories (id, name, icon, department) VALUES
  ('electrical', 'Electrical & Power', '⚡', 'Electrical & HVAC Maintenance'),
  ('hvac', 'AC & Ventilation', '❄️', 'Electrical & HVAC Maintenance'),
  ('wifi', 'Wi-Fi & Network', '📶', 'IT & Network Infrastructure'),
  ('plumbing', 'Plumbing & Water', '🚰', 'Plumbing & Sanitation'),
  ('furniture', 'Furniture & Carpentry', '🪑', 'Estate & Civil Works'),
  ('sanitation', 'Sanitation & Cleanliness', '🧹', 'Plumbing & Sanitation'),
  ('classroom_av', 'Classroom AV & Projector', '📽️', 'IT & Network Infrastructure'),
  ('security', 'Safety & Streetlights', '🛡️', 'Campus Security & Electrical')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  department = EXCLUDED.department;

-- 4. AUTOMATED PROFILE TRIGGER ON SIGNUP
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email, role, roll_no, department, hostel, room_no, avatar)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    new.email,
    COALESCE(new.raw_user_meta_data->>'role', 'student'),
    new.raw_user_meta_data->>'roll_no',
    new.raw_user_meta_data->>'department',
    new.raw_user_meta_data->>'hostel',
    new.raw_user_meta_data->>'room_no',
    COALESCE(new.raw_user_meta_data->>'avatar', UPPER(LEFT(COALESCE(new.raw_user_meta_data->>'name', 'US'), 2)))
  )
  ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    email = EXCLUDED.email,
    role = EXCLUDED.role;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 5. HELPER FUNCTION FOR RLS ROLE CHECK
CREATE OR REPLACE FUNCTION public.get_user_role(user_id UUID)
RETURNS TEXT AS $$
  SELECT role FROM public.profiles WHERE id = user_id;
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- 6. ENABLE ROW LEVEL SECURITY (RLS) ON ALL TABLES
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.complaint_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.complaints ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.complaint_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.complaint_timeline ENABLE ROW LEVEL SECURITY;

-- 7. RLS POLICIES

-- PROFILES POLICIES
DROP POLICY IF EXISTS "Public profiles select" ON public.profiles;
CREATE POLICY "Public profiles select" ON public.profiles
  FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- COMPLAINT CATEGORIES POLICIES
DROP POLICY IF EXISTS "Anyone can view categories" ON public.complaint_categories;
CREATE POLICY "Anyone can view categories" ON public.complaint_categories
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can manage categories" ON public.complaint_categories;
CREATE POLICY "Admins can manage categories" ON public.complaint_categories
  FOR ALL USING (public.get_user_role(auth.uid()) = 'admin');

-- COMPLAINTS POLICIES
DROP POLICY IF EXISTS "Complaints read policy" ON public.complaints;
CREATE POLICY "Complaints read policy" ON public.complaints
  FOR SELECT USING (
    auth.role() = 'authenticated' AND (
      visibility = 'public' OR
      submitted_by = auth.uid() OR
      public.get_user_role(auth.uid()) = 'admin'
    )
  );

DROP POLICY IF EXISTS "Complaints insert policy" ON public.complaints;
CREATE POLICY "Complaints insert policy" ON public.complaints
  FOR INSERT WITH CHECK (
    auth.role() = 'authenticated' AND submitted_by = auth.uid()
  );

DROP POLICY IF EXISTS "Complaints update policy" ON public.complaints;
CREATE POLICY "Complaints update policy" ON public.complaints
  FOR UPDATE USING (
    auth.role() = 'authenticated' AND (
      submitted_by = auth.uid() OR
      public.get_user_role(auth.uid()) = 'admin' OR
      (visibility = 'public' AND public.get_user_role(auth.uid()) = 'staff')
    )
  )
  WITH CHECK (
    auth.role() = 'authenticated' AND (
      submitted_by = auth.uid() OR
      public.get_user_role(auth.uid()) = 'admin' OR
      (visibility = 'public' AND public.get_user_role(auth.uid()) = 'staff')
    )
  );

-- COMPLAINT COMMENTS POLICIES
DROP POLICY IF EXISTS "Comments select policy" ON public.complaint_comments;
CREATE POLICY "Comments select policy" ON public.complaint_comments
  FOR SELECT USING (
    auth.role() = 'authenticated' AND EXISTS (
      SELECT 1 FROM public.complaints c
      WHERE c.id = complaint_id
    )
  );

DROP POLICY IF EXISTS "Comments insert policy" ON public.complaint_comments;
CREATE POLICY "Comments insert policy" ON public.complaint_comments
  FOR INSERT WITH CHECK (
    auth.role() = 'authenticated' AND author_id = auth.uid() AND EXISTS (
      SELECT 1 FROM public.complaints c
      WHERE c.id = complaint_id
    )
  );

-- COMPLAINT TIMELINE POLICIES
DROP POLICY IF EXISTS "Timeline select policy" ON public.complaint_timeline;
CREATE POLICY "Timeline select policy" ON public.complaint_timeline
  FOR SELECT USING (
    auth.role() = 'authenticated' AND EXISTS (
      SELECT 1 FROM public.complaints c
      WHERE c.id = complaint_id
    )
  );

DROP POLICY IF EXISTS "Timeline insert policy" ON public.complaint_timeline;
CREATE POLICY "Timeline insert policy" ON public.complaint_timeline
  FOR INSERT WITH CHECK (
    auth.role() = 'authenticated' AND EXISTS (
      SELECT 1 FROM public.complaints c
      WHERE c.id = complaint_id
    )
  );
