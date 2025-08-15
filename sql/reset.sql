-- WARNING: This reset script will delete all app data.
-- Run this in the Supabase SQL editor to fully reset the public schema objects
-- created by PuppyTrackr, then re-run supabase-schema.sql.

begin;

-- Drop trigger first (it references functions in public)
drop trigger if exists on_auth_user_created on auth.users;

-- Drop functions (CASCADE to clean dependents like triggers)
drop function if exists public.get_household_members(uuid) cascade;
drop function if exists public.get_household_by_invite(text) cascade;
drop function if exists public.set_member_role(uuid, uuid, text) cascade;
drop function if exists public.join_household_by_invite(text) cascade;
drop function if exists public.handle_new_user() cascade;

-- Drop app tables (CASCADE removes policies, FKs, etc.)
drop table if exists public.puppy_entries cascade;
drop table if exists public.puppies cascade;
drop table if exists public.household_members cascade;
drop table if exists public.households cascade;
drop table if exists public.user_profiles cascade;

commit;

-- Ensure pgcrypto available for gen_random_uuid() and gen_random_bytes()
create extension if not exists "pgcrypto"; 