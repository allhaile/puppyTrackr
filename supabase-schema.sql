-- Enable Row Level Security (RLS) on all tables
-- Run this in the Supabase SQL editor

-- User profiles table
CREATE TABLE user_profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  phone TEXT,
  email TEXT,
  display_name TEXT NOT NULL,
  avatar_url TEXT,
  role TEXT DEFAULT 'parent' CHECK (role IN ('parent', 'caregiver', 'sitter', 'guest')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Households table - one per family/group
CREATE TABLE households (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  invite_code TEXT UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(8), 'hex'),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Household memberships - who belongs to which household
CREATE TABLE household_members (
  household_id UUID REFERENCES households(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'family' CHECK (role IN ('owner', 'family', 'sitter', 'guest')),
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  PRIMARY KEY (household_id, user_id)
);

-- Puppies table (now belongs to households)
CREATE TABLE puppies (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  household_id UUID REFERENCES households(id) ON DELETE CASCADE NOT NULL,
  breed TEXT,
  birth_date DATE,
  avatar_url TEXT,
  weight_lbs DECIMAL(5,2),
  microchip_id TEXT,
  vet_name TEXT,
  vet_phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Puppy entries table (activities, meals, etc.)
CREATE TABLE puppy_entries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  puppy_id UUID REFERENCES puppies(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('potty', 'meal', 'sleep', 'medicine', 'training', 'note', 'walk', 'play', 'grooming')),
  details JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Enable RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE households ENABLE ROW LEVEL SECURITY;
ALTER TABLE household_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE puppies ENABLE ROW LEVEL SECURITY;
ALTER TABLE puppy_entries ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- User profiles: Users can only see and edit their own profile
CREATE POLICY "Users can view own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON user_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Households: Users can view households they belong to
CREATE POLICY "Users can view their households" ON households
  FOR SELECT USING (
    auth.uid() = created_by OR 
    auth.uid() IN (
      SELECT user_id FROM household_members WHERE household_id = id
    )
  );

CREATE POLICY "Users can update households they created" ON households
  FOR UPDATE USING (auth.uid() = created_by);

CREATE POLICY "Users can insert their own households" ON households
  FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can delete households they created" ON households
  FOR DELETE USING (auth.uid() = created_by);

-- Household members: Users can view members of their households
CREATE POLICY "Users can view household members" ON household_members
  FOR SELECT USING (
    household_id IN (
      SELECT id FROM households WHERE 
        created_by = auth.uid() OR 
        id IN (SELECT household_id FROM household_members WHERE user_id = auth.uid())
    )
  );

CREATE POLICY "Household owners can manage members" ON household_members
  FOR ALL USING (
    household_id IN (SELECT id FROM households WHERE created_by = auth.uid())
  );

CREATE POLICY "Users can join households" ON household_members
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Puppies: Users can see puppies in their households
CREATE POLICY "Users can view household puppies" ON puppies
  FOR SELECT USING (
    household_id IN (
      SELECT household_id FROM household_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Household members can manage puppies" ON puppies
  FOR ALL USING (
    household_id IN (
      SELECT household_id FROM household_members WHERE user_id = auth.uid()
    )
  );

-- Puppy entries: Users can see entries for puppies in their households
CREATE POLICY "Users can view household puppy entries" ON puppy_entries
  FOR SELECT USING (
    puppy_id IN (
      SELECT id FROM puppies WHERE household_id IN (
        SELECT household_id FROM household_members WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can insert puppy entries" ON puppy_entries
  FOR INSERT WITH CHECK (
    auth.uid() = user_id AND
    puppy_id IN (
      SELECT id FROM puppies WHERE household_id IN (
        SELECT household_id FROM household_members WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can update own entries" ON puppy_entries
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own entries" ON puppy_entries
  FOR DELETE USING (auth.uid() = user_id);

-- Indexes for performance
CREATE INDEX idx_households_created_by ON households(created_by);
CREATE INDEX idx_households_invite_code ON households(invite_code);
CREATE INDEX idx_household_members_household_id ON household_members(household_id);
CREATE INDEX idx_household_members_user_id ON household_members(user_id);
CREATE INDEX idx_puppies_household_id ON puppies(household_id);
CREATE INDEX idx_puppy_entries_puppy_id ON puppy_entries(puppy_id);
CREATE INDEX idx_puppy_entries_user_id ON puppy_entries(user_id);
CREATE INDEX idx_puppy_entries_created_at ON puppy_entries(created_at DESC);

-- Function to automatically create user profile and household on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  household_name TEXT;
  new_household_id UUID;
BEGIN
  -- Create user profile
  INSERT INTO public.user_profiles (id, phone, email, display_name)
  VALUES (
    new.id,
    new.phone,
    new.email,
    COALESCE(
      new.raw_user_meta_data->>'display_name',
      CASE 
        WHEN new.phone IS NOT NULL THEN 'User ' || right(new.phone, 4)
        WHEN new.email IS NOT NULL THEN split_part(new.email, '@', 1)
        ELSE 'User'
      END
    )
  );
  
  -- Create default household for new users
  household_name := COALESCE(
    new.raw_user_meta_data->>'household_name',
    CASE 
      WHEN new.email IS NOT NULL THEN split_part(new.email, '@', 1) || '''s Household'
      ELSE 'My Household'
    END
  );
  
  INSERT INTO public.households (created_by, name)
  VALUES (new.id, household_name)
  RETURNING id INTO new_household_id;
  
  -- Add user as owner of their household
  INSERT INTO public.household_members (household_id, user_id, role)
  VALUES (new_household_id, new.id, 'owner');
  
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to join household via invite code
CREATE OR REPLACE FUNCTION public.join_household_by_invite(invite_code_param TEXT, user_display_name TEXT DEFAULT NULL)
RETURNS UUID AS $$
DECLARE
  household_record RECORD;
  existing_user_id UUID;
BEGIN
  -- Find household by invite code
  SELECT id, name INTO household_record
  FROM households 
  WHERE invite_code = invite_code_param;
  
  IF household_record.id IS NULL THEN
    RAISE EXCEPTION 'Invalid invite code';
  END IF;
  
  -- Check if user is already a member
  SELECT user_id INTO existing_user_id
  FROM household_members 
  WHERE household_id = household_record.id AND user_id = auth.uid();
  
  IF existing_user_id IS NOT NULL THEN
    RAISE EXCEPTION 'User is already a member of this household';
  END IF;
  
  -- Add user to household
  INSERT INTO household_members (household_id, user_id, role)
  VALUES (household_record.id, auth.uid(), 'family');
  
  -- Update user display name if provided
  IF user_display_name IS NOT NULL THEN
    UPDATE user_profiles 
    SET display_name = user_display_name 
    WHERE id = auth.uid();
  END IF;
  
  RETURN household_record.id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to automatically create user profile and household
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Storage bucket for avatars (run in Supabase dashboard storage section)
-- INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true);

-- Storage policies for avatars
-- CREATE POLICY "Avatar images are publicly accessible" ON storage.objects
--   FOR SELECT USING (bucket_id = 'avatars');

-- CREATE POLICY "Users can upload their own avatar" ON storage.objects
--   FOR INSERT WITH CHECK (
--     bucket_id = 'avatars' AND 
--     auth.uid()::text = (storage.foldername(name))[1]
--   );

-- CREATE POLICY "Users can update their own avatar" ON storage.objects
--   FOR UPDATE USING (
--     bucket_id = 'avatars' AND 
--     auth.uid()::text = (storage.foldername(name))[1]
--   );

-- CREATE POLICY "Users can delete their own avatar" ON storage.objects
--   FOR DELETE USING (
--     bucket_id = 'avatars' AND 
--     auth.uid()::text = (storage.foldername(name))[1]
--   ); 