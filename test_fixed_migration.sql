-- Test for Fixed Migration
-- Run this to verify the fixed migration works

-- 1. Check if the new migration creates the dashboard view successfully
SELECT 'Testing user_dashboard view...' as status;
SELECT * FROM user_dashboard LIMIT 1;

-- 2. Get a user ID for testing the function
SELECT 'Getting user ID for testing...' as status;
SELECT user_id FROM profiles LIMIT 1;

-- 3. Test the usage stats function (replace with your actual user ID)
-- SELECT 'Testing usage stats function...' as status;
-- SELECT * FROM get_usage_stats('YOUR_USER_ID_HERE'::UUID);

-- 4. Verify all tables exist
SELECT 'Checking tables exist...' as status;
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('profiles', 'projects', 'tasks', 'contacts', 'companies', 'notes', 'emails', 'integrations', 'notifications', 'calendar_events', 'teams', 'ai_requests')
ORDER BY table_name;
