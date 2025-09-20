-- Check what columns exist in your projects table
SELECT 'projects' as table_name, column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'projects'
ORDER BY ordinal_position

UNION ALL

-- Check what columns exist in your tasks table
SELECT 'tasks' as table_name, column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'tasks'
ORDER BY ordinal_position

UNION ALL

-- Check what columns exist in your contacts table (if it exists)
SELECT 'contacts' as table_name, column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'contacts'
ORDER BY ordinal_position;
