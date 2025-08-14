-- PuppyTrackr MVP Schema - Fixed for RLS
-- Run this in the Supabase SQL editor

-- Clean slate - drop everything
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();
DROP FUNCTION IF EXISTS public.join_household_by_invite(TEXT, TEXT);
DROP FUNCTION IF EXISTS public.get_household_members(UUID);

DROP TABLE IF EXISTS public.puppy_entries CASCADE;
DROP TABLE IF EXISTS public.puppies CASCADE;
DROP TABLE IF EXISTS public.household_members CASCADE;
DROP TABLE IF EXISTS public.households CASCADE;
DROP TABLE IF EXISTS public.user_profiles CASCADE;

-- User profiles table
CREATE TABLE user_profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT,
  phone TEXT,
  display_name TEXT NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Households table - simple
CREATE TABLE households (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  invite_code TEXT UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(6), 'hex'),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Household memberships - who belongs to which household
CREATE TABLE household_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  household_id UUID REFERENCES households(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role TEXT DEFAULT 'member' CHECK (role IN ('owner', 'member')),
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  UNIQUE(household_id, user_id)
);

-- Puppies table
CREATE TABLE puppies (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  household_id UUID REFERENCES households(id) ON DELETE CASCADE NOT NULL,
  breed TEXT,
  birth_date DATE,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Puppy entries table - simplified for MVP
CREATE TABLE puppy_entries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  puppy_id UUID REFERENCES puppies(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('meal', 'potty', 'walk', 'play', 'sleep', 'training', 'vet', 'medication', 'grooming')),
  notes TEXT,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  
  -- Optional fields for specific types
  amount TEXT, -- for meals
  potty_type TEXT, -- pee, poop, both, accident
  duration_minutes INTEGER, -- for walks/play/sleep
  location TEXT, -- for potty, walks
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Enable RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE households ENABLE ROW LEVEL SECURITY;
-- Temporarily disable RLS on household_members to avoid infinite recursion
-- ALTER TABLE household_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE puppies ENABLE ROW LEVEL SECURITY;
ALTER TABLE puppy_entries ENABLE ROW LEVEL SECURITY;

-- User profiles policies - simple
CREATE POLICY "users_select_own" ON user_profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "users_insert_own" ON user_profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "users_update_own" ON user_profiles FOR UPDATE USING (auth.uid() = id);

-- Households policies - owner can do everything
CREATE POLICY "households_select_member" ON households FOR SELECT USING (
  id IN (SELECT household_id FROM household_members WHERE user_id = auth.uid())
);
CREATE POLICY "households_insert_owner" ON households FOR INSERT WITH CHECK (auth.uid() = created_by);
CREATE POLICY "households_update_owner" ON households FOR UPDATE USING (auth.uid() = created_by);

-- Household members policies - DISABLED to avoid recursion
-- CREATE POLICY "members_select_own_household" ON household_members FOR SELECT USING (
--   user_id = auth.uid() OR 
--   household_id IN (SELECT household_id FROM household_members WHERE user_id = auth.uid())
-- );
-- CREATE POLICY "members_insert_self" ON household_members FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Puppies policies
CREATE POLICY "puppies_select_household" ON puppies FOR SELECT USING (
  household_id IN (SELECT household_id FROM household_members WHERE user_id = auth.uid())
);
CREATE POLICY "puppies_insert_household" ON puppies FOR INSERT WITH CHECK (
  household_id IN (SELECT household_id FROM household_members WHERE user_id = auth.uid())
);
CREATE POLICY "puppies_update_household" ON puppies FOR UPDATE USING (
  household_id IN (SELECT household_id FROM household_members WHERE user_id = auth.uid())
);

-- Puppy entries policies
CREATE POLICY "entries_select_household" ON puppy_entries FOR SELECT USING (
  puppy_id IN (
    SELECT p.id FROM puppies p 
    JOIN household_members hm ON p.household_id = hm.household_id 
    WHERE hm.user_id = auth.uid()
  )
);
CREATE POLICY "entries_insert_household" ON puppy_entries FOR INSERT WITH CHECK (
  auth.uid() = user_id AND
  puppy_id IN (
    SELECT p.id FROM puppies p 
    JOIN household_members hm ON p.household_id = hm.household_id 
    WHERE hm.user_id = auth.uid()
  )
);
CREATE POLICY "entries_update_own" ON puppy_entries FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "entries_delete_own" ON puppy_entries FOR DELETE USING (auth.uid() = user_id);

-- Indexes for performance
CREATE INDEX idx_household_members_user_id ON household_members(user_id);
CREATE INDEX idx_household_members_household_id ON household_members(household_id);
CREATE INDEX idx_puppies_household_id ON puppies(household_id);
CREATE INDEX idx_puppy_entries_puppy_id ON puppy_entries(puppy_id);
CREATE INDEX idx_puppy_entries_timestamp ON puppy_entries(timestamp DESC);

-- Function to create user profile and household on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  new_household_id UUID;
  household_name TEXT;
BEGIN
  -- Extract display name from email or metadata
  household_name := COALESCE(
    new.raw_user_meta_data->>'display_name',
    split_part(COALESCE(new.email, 'user'), '@', 1)
  );
  
  -- Create user profile
  INSERT INTO public.user_profiles (id, email, display_name)
  VALUES (
    new.id,
    new.email,
    household_name
  );
  
  -- Create household
  INSERT INTO public.households (created_by, name)
  VALUES (new.id, household_name || '''s Household')
  RETURNING id INTO new_household_id;
  
  -- Add user as owner of household
  INSERT INTO public.household_members (household_id, user_id, role)
  VALUES (new_household_id, new.id, 'owner');
  
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to join household by invite code
CREATE OR REPLACE FUNCTION public.join_household_by_invite(invite_code_param TEXT)
RETURNS UUID AS $$
DECLARE
  target_household_id UUID;
BEGIN
  -- Find household by invite code
  SELECT id INTO target_household_id
  FROM households 
  WHERE invite_code = invite_code_param;
  
  IF target_household_id IS NULL THEN
    RAISE EXCEPTION 'Invalid invite code';
  END IF;
  
  -- Check if already a member
  IF EXISTS (
    SELECT 1 FROM household_members 
    WHERE household_id = target_household_id AND user_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'Already a member of this household';
  END IF;
  
  -- Add user to household
  INSERT INTO household_members (household_id, user_id, role)
  VALUES (target_household_id, auth.uid(), 'member');
  
  RETURN target_household_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Verify schema
DO $$
BEGIN
  RAISE NOTICE 'Schema created successfully! Tables: user_profiles, households, household_members, puppies, puppy_entries';
END $$;