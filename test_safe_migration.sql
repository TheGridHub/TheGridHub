-- Test Queries for Safe Dashboard Migration
-- Run these after applying the safe migration

-- 1. Test getting a real user ID
SELECT user_id FROM profiles LIMIT 1;

-- 2. Test the safe usage stats function
-- Replace 'YOUR_USER_ID_HERE' with actual UUID from query above
-- SELECT * FROM get_usage_stats('YOUR_USER_ID_HERE'::UUID);

-- 3. Test the safe dashboard view
SELECT * FROM user_dashboard LIMIT 1;

-- 4. Test the safe analytics function (last 7 days)
-- Replace 'YOUR_USER_ID_HERE' with actual UUID from query above
-- SELECT * FROM get_user_analytics('YOUR_USER_ID_HERE'::UUID, 7);

-- 5. Check what data you currently have in confirmed tables
SELECT 
  'projects' as table_name, 
  COUNT(*) as total_records,
  COUNT(DISTINCT "userId") as unique_users
FROM projects
UNION ALL
SELECT 
  'tasks' as table_name, 
  COUNT(*) as total_records,
  COUNT(DISTINCT "userId") as unique_users
FROM tasks
UNION ALL
SELECT 
  'contacts' as table_name, 
  COUNT(*) as total_records,
  COUNT(DISTINCT "userId") as unique_users
FROM contacts;
