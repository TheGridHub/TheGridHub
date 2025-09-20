-- Comprehensive Test Queries for Production Migration
-- Run these after applying the complete production migration

-- =====================================================
-- 1. VERIFY TABLES WERE CREATED
-- =====================================================

-- Check all tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('profiles', 'projects', 'tasks', 'contacts', 'companies', 'notes', 'emails', 'integrations', 'notifications', 'calendar_events', 'teams', 'ai_requests')
ORDER BY table_name;

-- =====================================================
-- 2. GET USER ID FOR TESTING
-- =====================================================

SELECT user_id FROM profiles LIMIT 1;

-- =====================================================
-- 3. TEST FUNCTIONS (Replace UUID with actual user ID)
-- =====================================================

-- Test comprehensive usage stats function
-- SELECT * FROM get_usage_stats('YOUR_USER_ID_HERE'::UUID);

-- Test analytics function
-- SELECT * FROM get_user_analytics('YOUR_USER_ID_HERE'::UUID, 7);

-- =====================================================
-- 4. TEST DASHBOARD VIEW
-- =====================================================

SELECT * FROM user_dashboard LIMIT 1;

-- =====================================================
-- 5. VERIFY TABLE STRUCTURES
-- =====================================================

-- Check companies table structure
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'companies' 
ORDER BY ordinal_position;

-- Check notes table structure  
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'notes' 
ORDER BY ordinal_position;

-- Check emails table structure
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'emails' 
ORDER BY ordinal_position;

-- =====================================================
-- 6. TEST INSERT OPERATIONS
-- =====================================================

-- Test inserting sample data (Replace with your actual user_id)
-- INSERT INTO companies (name, description, "userId") 
-- VALUES ('Test Company', 'A test company', 'YOUR_USER_ID_HERE'::UUID);

-- INSERT INTO notes (title, content, "userId") 
-- VALUES ('Test Note', 'This is a test note', 'YOUR_USER_ID_HERE'::UUID);

-- INSERT INTO calendar_events (title, description, "startDate", "endDate", "userId") 
-- VALUES ('Test Event', 'Test calendar event', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP + INTERVAL '1 hour', 'YOUR_USER_ID_HERE'::UUID);

-- =====================================================
-- 7. VERIFY INDEXES WERE CREATED
-- =====================================================

SELECT schemaname, tablename, indexname, indexdef 
FROM pg_indexes 
WHERE tablename IN ('companies', 'notes', 'emails', 'integrations', 'notifications', 'calendar_events', 'teams', 'ai_requests')
ORDER BY tablename, indexname;

-- =====================================================
-- 8. CHECK PERMISSIONS
-- =====================================================

SELECT table_name, privilege_type, grantee 
FROM information_schema.table_privileges 
WHERE table_name IN ('companies', 'notes', 'emails', 'integrations', 'notifications', 'calendar_events', 'teams', 'ai_requests')
  AND grantee IN ('anon', 'authenticated')
ORDER BY table_name, grantee, privilege_type;

-- =====================================================
-- 9. TEST COMPREHENSIVE COUNTING
-- =====================================================

-- After inserting test data, verify comprehensive counts
-- SELECT * FROM get_usage_stats('YOUR_USER_ID_HERE'::UUID);

-- =====================================================
-- 10. PERFORMANCE TEST (Optional)
-- =====================================================

-- Test query performance with EXPLAIN
-- EXPLAIN ANALYZE SELECT * FROM user_dashboard WHERE user_id = 'YOUR_USER_ID_HERE'::UUID;
