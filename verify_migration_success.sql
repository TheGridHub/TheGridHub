-- Quick Verification of Migration Success
-- Run this to confirm everything is working

-- =====================================================
-- 1. CHECK ALL TABLES EXIST
-- =====================================================

SELECT 
    CASE 
        WHEN COUNT(*) >= 12 THEN '✅ All tables created successfully'
        ELSE '❌ Missing tables: ' || (12 - COUNT(*))::TEXT
    END as table_status,
    array_agg(table_name ORDER BY table_name) as existing_tables
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('profiles', 'projects', 'tasks', 'contacts', 'companies', 'notes', 'emails', 'integrations', 'notifications', 'calendar_events', 'teams', 'ai_requests');

-- =====================================================
-- 2. CHECK FUNCTIONS EXIST
-- =====================================================

SELECT 
    CASE 
        WHEN COUNT(*) >= 2 THEN '✅ All functions created successfully'
        ELSE '❌ Missing functions'
    END as function_status,
    array_agg(routine_name) as existing_functions
FROM information_schema.routines 
WHERE routine_schema = 'public' 
  AND routine_name IN ('get_usage_stats', 'get_user_analytics');

-- =====================================================
-- 3. CHECK DASHBOARD VIEW EXISTS
-- =====================================================

SELECT 
    CASE 
        WHEN COUNT(*) > 0 THEN '✅ Dashboard view created successfully'
        ELSE '❌ Dashboard view missing'
    END as view_status
FROM information_schema.views 
WHERE table_schema = 'public' 
  AND table_name = 'user_dashboard';

-- =====================================================
-- 4. TEST DASHBOARD VIEW WITH REAL DATA
-- =====================================================

SELECT 
    user_id,
    first_name,
    last_name,
    email,
    plan_type,
    projects_count,
    tasks_count,
    contacts_count,
    companies_count,
    notes_count,
    emails_count
FROM user_dashboard 
LIMIT 1;

-- =====================================================
-- 5. GET YOUR USER ID FOR TESTING
-- =====================================================

SELECT 
    'Your user ID for testing:' as info,
    user_id
FROM profiles 
LIMIT 1;

-- =====================================================
-- 6. TEST USAGE STATS FUNCTION
-- =====================================================
-- Uncomment and replace with your actual user ID:
-- SELECT * FROM get_usage_stats('YOUR_USER_ID_HERE'::UUID);

-- =====================================================
-- 7. CHECK FOR ANY ISSUES
-- =====================================================

-- Check if there are any missing columns in created tables
SELECT 
    t.table_name,
    COUNT(c.column_name) as column_count,
    array_agg(c.column_name ORDER BY c.ordinal_position) as columns
FROM information_schema.tables t
LEFT JOIN information_schema.columns c ON t.table_name = c.table_name AND c.table_schema = 'public'
WHERE t.table_schema = 'public' 
  AND t.table_name IN ('companies', 'notes', 'emails', 'integrations', 'notifications', 'calendar_events', 'teams', 'ai_requests')
GROUP BY t.table_name
ORDER BY t.table_name;
