-- Migration: Add UNIQUE constraints to prevent duplicate contacts and logs
-- This prevents duplicate messages being sent to the same WhatsApp number

-- Step 1: Remove duplicate contacts (keep the most recent one per user_id + whatsapp)
-- This does NOT affect active jobs since contacts are already copied to logs when job starts
DELETE FROM dashboard_contacts a
USING dashboard_contacts b
WHERE a.user_id = b.user_id 
  AND a.whatsapp = b.whatsapp 
  AND a.created_at < b.created_at;

-- Step 2: Add UNIQUE constraint on dashboard_contacts (user_id, whatsapp)
ALTER TABLE dashboard_contacts 
ADD CONSTRAINT dashboard_contacts_user_whatsapp_unique 
UNIQUE (user_id, whatsapp);

-- Step 3: Remove duplicate logs ONLY for finished jobs (completed, failed, stopped)
-- Active jobs (queued, processing) are NOT touched to avoid breaking ongoing dispatches
DELETE FROM dashboard_send_job_logs a
USING dashboard_send_job_logs b
WHERE a.job_id = b.job_id 
  AND a.whatsapp = b.whatsapp 
  AND a.sequence > b.sequence
  AND a.job_id IN (
    SELECT id FROM dashboard_send_jobs 
    WHERE status IN ('completed', 'failed', 'stopped')
  );

-- Step 4: Add UNIQUE index on dashboard_send_job_logs (job_id, whatsapp)
-- Note: This may fail if active jobs have duplicates. In that case, wait for jobs to finish.
CREATE UNIQUE INDEX IF NOT EXISTS dashboard_send_job_logs_job_whatsapp_unique 
ON dashboard_send_job_logs (job_id, whatsapp);

