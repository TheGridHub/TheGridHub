-- Fix for status column indexes
-- Only creates indexes for columns that actually exist

-- Drop any potentially problematic indexes first
DROP INDEX IF EXISTS emails_status_idx;
DROP INDEX IF EXISTS notifications_status_idx;
DROP INDEX IF EXISTS calendar_events_status_idx;

-- Recreate indexes only if the columns exist
DO $$
BEGIN
    -- Create emails status index if status column exists
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'emails' AND column_name = 'status') THEN
        CREATE INDEX IF NOT EXISTS emails_status_idx ON emails(status);
    END IF;
    
    -- Create notifications status index if status column exists
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'notifications' AND column_name = 'status') THEN
        CREATE INDEX IF NOT EXISTS notifications_status_idx ON notifications(status);
    END IF;
    
    -- Create calendar_events status index if status column exists
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'calendar_events' AND column_name = 'status') THEN
        CREATE INDEX IF NOT EXISTS calendar_events_status_idx ON calendar_events(status);
    END IF;
END $$;
