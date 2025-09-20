-- Add Avatar Support Migration
-- Adds avatar_url column to profiles table for proper avatar handling

-- Add avatar_url column to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- Add index for avatar queries (optional, for performance)
CREATE INDEX IF NOT EXISTS idx_profiles_avatar ON profiles(avatar_url) WHERE avatar_url IS NOT NULL;

-- Add comment
COMMENT ON COLUMN profiles.avatar_url IS 'URL to user avatar image stored in Supabase Storage or external service';
