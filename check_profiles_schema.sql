-- Query to check what columns exist in your profiles table
-- Run this first in Supabase SQL editor to see your current schema

SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'profiles'
ORDER BY ordinal_position;
