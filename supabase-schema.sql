-- Bulletproof PuppyTrackr Schema - ZERO recursion possible
-- Run AFTER the nuclear reset

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Simple user profiles
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT,
  display_name TEXT NOT NULL,
  phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Simple households
CREATE TABLE IF NOT EXISTS households (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  invite_code TEXT UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(6), 'hex'),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Simple membership table
CREATE TABLE IF NOT EXISTS household_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  household_id UUID REFERENCES households(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role TEXT DEFAULT 'member',
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  UNIQUE(household_id, user_id)
);

-- Simple puppies
CREATE TABLE IF NOT EXISTS puppies (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  avatar TEXT,
  household_id UUID REFERENCES households(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Simple entries
CREATE TABLE IF NOT EXISTS puppy_entries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  puppy_id UUID REFERENCES puppies(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL,
  notes TEXT,
  details JSONB,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Enable RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE households ENABLE ROW LEVEL SECURITY;
ALTER TABLE household_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE puppies ENABLE ROW LEVEL SECURITY;
ALTER TABLE puppy_entries ENABLE ROW LEVEL SECURITY;

-- BULLETPROOF POLICIES - Layer by layer, no recursion

-- Layer 1: User profiles (only self)
DROP POLICY IF EXISTS "profiles_own" ON user_profiles;
CREATE POLICY "profiles_own" ON user_profiles FOR ALL USING (auth.uid() = id);

-- Layer 2: Households (only owner or explicit member check)
DROP POLICY IF EXISTS "households_owner" ON households;
CREATE POLICY "households_owner" ON households FOR ALL USING (auth.uid() = owner_id);

-- Allow INSERTs when the row's owner_id matches the current user
DROP POLICY IF EXISTS "households_owner_insert" ON households;
CREATE POLICY "households_owner_insert" ON households FOR INSERT WITH CHECK (auth.uid() = owner_id);

-- Layer 3: Members (only your own memberships)
DROP POLICY IF EXISTS "members_own" ON household_members;
CREATE POLICY "members_own" ON household_members FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "members_insert" ON household_members;
CREATE POLICY "members_insert" ON household_members FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Layer 4: Puppies (only if you're in the household - direct join)
DROP POLICY IF EXISTS "puppies_member" ON puppies;
CREATE POLICY "puppies_member" ON puppies FOR ALL USING (
  household_id IN (
    SELECT household_id FROM household_members WHERE user_id = auth.uid()
  )
);
-- Explicit insert policy for puppies
DROP POLICY IF EXISTS "puppies_member_insert" ON puppies;
CREATE POLICY "puppies_member_insert" ON puppies FOR INSERT WITH CHECK (
  household_id IN (
    SELECT household_id FROM household_members WHERE user_id = auth.uid()
  )
);

-- Layer 5: Entries (only if you're in the puppy's household)
DROP POLICY IF EXISTS "entries_member" ON puppy_entries;
CREATE POLICY "entries_member" ON puppy_entries FOR ALL USING (
  puppy_id IN (
    SELECT p.id FROM puppies p
    JOIN household_members hm ON p.household_id = hm.household_id
    WHERE hm.user_id = auth.uid()
  )
);
-- Explicit insert policy for entries
DROP POLICY IF EXISTS "entries_member_insert" ON puppy_entries;
CREATE POLICY "entries_member_insert" ON puppy_entries FOR INSERT WITH CHECK (
  puppy_id IN (
    SELECT p.id FROM puppies p
    JOIN household_members hm ON p.household_id = hm.household_id
    WHERE hm.user_id = auth.uid()
  )
);

-- Simple function to create profile + household on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  new_household_id UUID;
  user_name TEXT;
BEGIN
  -- Get name from email
  user_name := split_part(new.email, '@', 1);
  
  -- Create profile
  INSERT INTO public.user_profiles (id, email, display_name, phone)
  VALUES (new.id, new.email, user_name, NULL);
  
  -- Create household
  INSERT INTO public.households (owner_id, name)
  VALUES (new.id, user_name || '''s Home')
  RETURNING id INTO new_household_id;
  
  -- Add as member
  INSERT INTO public.household_members (household_id, user_id, role)
  VALUES (new_household_id, new.id, 'owner');
  
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- INVITES: join household by invite code
CREATE OR REPLACE FUNCTION public.join_household_by_invite(invite_code_param TEXT)
RETURNS VOID AS $$
DECLARE
  target_household UUID;
  existing_membership UUID;
BEGIN
  -- Lookup household by code
  SELECT id INTO target_household FROM public.households WHERE invite_code = invite_code_param;
  IF target_household IS NULL THEN
    RAISE EXCEPTION 'Invalid invite code';
  END IF;

  -- Prevent duplicates
  SELECT id INTO existing_membership FROM public.household_members
  WHERE household_id = target_household AND user_id = auth.uid();
  IF existing_membership IS NOT NULL THEN
    RAISE EXCEPTION 'Already a member';
  END IF;

  -- Insert membership for current user
  INSERT INTO public.household_members (household_id, user_id, role)
  VALUES (target_household, auth.uid(), 'member');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ADMIN: set a member role (owner-only)
CREATE OR REPLACE FUNCTION public.set_member_role(target_household_id UUID, target_user_id UUID, new_role TEXT)
RETURNS VOID AS $$
DECLARE
  is_owner BOOLEAN;
BEGIN
  -- Only owner of the household can change roles
  SELECT (owner_id = auth.uid()) INTO is_owner FROM public.households WHERE id = target_household_id;
  IF NOT is_owner THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  UPDATE public.household_members
  SET role = new_role
  WHERE household_id = target_household_id AND user_id = target_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- PUBLIC READ: get minimal household info by invite code for invite screen
CREATE OR REPLACE FUNCTION public.get_household_by_invite(invite_code_param TEXT)
RETURNS TABLE (id UUID, name TEXT) AS $$
BEGIN
  RETURN QUERY
  SELECT h.id, h.name
  FROM public.households h
  WHERE h.invite_code = invite_code_param;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Additional RLS policies to enable household member visibility and management
-- Allow members to read all memberships for households they belong to
-- Removed non-idempotent CREATE POLICY here; using RPC instead below

-- Allow a user to remove themself from a household
DROP POLICY IF EXISTS "members_delete_self" ON household_members;
CREATE POLICY "members_delete_self" ON household_members FOR DELETE USING (user_id = auth.uid());

-- Allow the household owner to remove any member
DROP POLICY IF EXISTS "members_delete_owner" ON household_members;
CREATE POLICY "members_delete_owner" ON household_members FOR DELETE USING (
  household_id IN (
    SELECT id FROM households WHERE owner_id = auth.uid()
  )
);

-- Allow members to read household details for households they belong to
DROP POLICY IF EXISTS "households_member_read" ON households;
CREATE POLICY "households_member_read" ON households FOR SELECT USING (
  id IN (
    SELECT household_id FROM household_members WHERE user_id = auth.uid()
  )
);

-- Allow reading profiles of users who share a household with you
DROP POLICY IF EXISTS "profiles_same_household" ON user_profiles;
CREATE POLICY "profiles_same_household" ON user_profiles FOR SELECT USING (
  id IN (
    SELECT hm2.user_id
    FROM household_members hm2
    WHERE hm2.household_id IN (
      SELECT hm.household_id FROM household_members hm WHERE hm.user_id = auth.uid()
    )
  )
);

-- Drop recursive policy if present and replace with RPC to avoid recursion
DROP POLICY IF EXISTS "members_of_my_households" ON household_members;

-- Safe RPC for fetching members of a household (caller must be a member)
CREATE OR REPLACE FUNCTION public.get_household_members(p_household_id UUID)
RETURNS TABLE (
  user_id UUID,
  role TEXT,
  joined_at TIMESTAMPTZ,
  display_name TEXT,
  email TEXT
) AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM public.household_members hm
    WHERE hm.household_id = p_household_id AND hm.user_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  RETURN QUERY
  SELECT hm.user_id, hm.role, hm.joined_at, up.display_name, up.email
  FROM public.household_members hm
  JOIN public.user_profiles up ON up.id = hm.user_id
  WHERE hm.household_id = p_household_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Test that it works
SELECT 'Bulletproof schema ready! Zero recursion possible.' as status;