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

-- Puppies table
CREATE TABLE puppies (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  breed TEXT,
  birth_date DATE,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Puppy entries table (activities, meals, etc.)
CREATE TABLE puppy_entries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  puppy_id UUID REFERENCES puppies(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('potty', 'meal', 'sleep', 'medicine', 'training', 'note', 'walk', 'play')),
  details JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Puppy access table (family/sharing relationships)
CREATE TABLE puppy_access (
  puppy_id UUID REFERENCES puppies(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'caregiver' CHECK (role IN ('owner', 'caregiver', 'sitter', 'guest')),
  granted_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  granted_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  PRIMARY KEY (puppy_id, user_id)
);

-- Enable RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE puppies ENABLE ROW LEVEL SECURITY;
ALTER TABLE puppy_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE puppy_access ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- User profiles: Users can only see and edit their own profile
CREATE POLICY "Users can view own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON user_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Puppies: Users can only see puppies they own or have access to
CREATE POLICY "Users can view own puppies" ON puppies
  FOR SELECT USING (
    auth.uid() = owner_id OR 
    auth.uid() IN (
      SELECT user_id FROM puppy_access WHERE puppy_id = id
    )
  );

CREATE POLICY "Users can update own puppies" ON puppies
  FOR UPDATE USING (auth.uid() = owner_id);

CREATE POLICY "Users can insert own puppies" ON puppies
  FOR INSERT WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can delete own puppies" ON puppies
  FOR DELETE USING (auth.uid() = owner_id);

-- Puppy entries: Users can see entries for puppies they have access to
CREATE POLICY "Users can view puppy entries" ON puppy_entries
  FOR SELECT USING (
    puppy_id IN (
      SELECT id FROM puppies WHERE 
        owner_id = auth.uid() OR 
        id IN (SELECT puppy_id FROM puppy_access WHERE user_id = auth.uid())
    )
  );

CREATE POLICY "Users can insert puppy entries" ON puppy_entries
  FOR INSERT WITH CHECK (
    auth.uid() = user_id AND
    puppy_id IN (
      SELECT id FROM puppies WHERE 
        owner_id = auth.uid() OR 
        id IN (SELECT puppy_id FROM puppy_access WHERE user_id = auth.uid())
    )
  );

CREATE POLICY "Users can update own entries" ON puppy_entries
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own entries" ON puppy_entries
  FOR DELETE USING (auth.uid() = user_id);

-- Puppy access: Users can view access for their puppies
CREATE POLICY "Users can view puppy access" ON puppy_access
  FOR SELECT USING (
    puppy_id IN (SELECT id FROM puppies WHERE owner_id = auth.uid()) OR
    user_id = auth.uid()
  );

CREATE POLICY "Owners can manage puppy access" ON puppy_access
  FOR ALL USING (
    puppy_id IN (SELECT id FROM puppies WHERE owner_id = auth.uid())
  );

-- Indexes for performance
CREATE INDEX idx_puppy_entries_puppy_id ON puppy_entries(puppy_id);
CREATE INDEX idx_puppy_entries_user_id ON puppy_entries(user_id);
CREATE INDEX idx_puppy_entries_created_at ON puppy_entries(created_at DESC);
CREATE INDEX idx_puppy_access_puppy_id ON puppy_access(puppy_id);
CREATE INDEX idx_puppy_access_user_id ON puppy_access(user_id);

-- Function to automatically create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, phone, email, display_name)
  VALUES (
    new.id,
    new.phone,
    new.email,
    COALESCE(
      new.raw_user_meta_data->>'display_name',
      CASE 
        WHEN new.phone IS NOT NULL THEN 'User ' || right(new.phone, 4)
        WHEN new.email IS NOT NULL THEN 'User ' || split_part(new.email, '@', 1)
        ELSE 'User'
      END
    )
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to automatically create user profile
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