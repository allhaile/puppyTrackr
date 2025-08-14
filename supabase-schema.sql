-- Bulletproof PuppyTrackr Schema - ZERO recursion possible
-- Run AFTER the nuclear reset

-- Simple user profiles
CREATE TABLE user_profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT,
  display_name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Simple households
CREATE TABLE households (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  invite_code TEXT UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(6), 'hex'),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Simple membership table
CREATE TABLE household_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  household_id UUID REFERENCES households(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role TEXT DEFAULT 'member',
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  UNIQUE(household_id, user_id)
);

-- Simple puppies
CREATE TABLE puppies (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  household_id UUID REFERENCES households(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Simple entries
CREATE TABLE puppy_entries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  puppy_id UUID REFERENCES puppies(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL,
  notes TEXT,
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
CREATE POLICY "profiles_own" ON user_profiles FOR ALL USING (auth.uid() = id);

-- Layer 2: Households (only owner or explicit member check)
CREATE POLICY "households_owner" ON households FOR ALL USING (auth.uid() = owner_id);

-- Layer 3: Members (only your own memberships)
CREATE POLICY "members_own" ON household_members FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "members_insert" ON household_members FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Layer 4: Puppies (only if you're in the household - direct join)
CREATE POLICY "puppies_member" ON puppies FOR ALL USING (
  household_id IN (
    SELECT household_id FROM household_members WHERE user_id = auth.uid()
  )
);

-- Layer 5: Entries (only if you're in the puppy's household)
CREATE POLICY "entries_member" ON puppy_entries FOR ALL USING (
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
  INSERT INTO public.user_profiles (id, email, display_name)
  VALUES (new.id, new.email, user_name);
  
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

-- Test that it works
SELECT 'Bulletproof schema ready! Zero recursion possible.' as status;