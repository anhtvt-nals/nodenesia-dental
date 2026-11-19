-- This setting is used as the clinic-wide fallback when a service has no
-- individual turnover buffer.  Keep this migration separate because earlier
-- booking-flow migrations only added the per-service column.
ALTER TABLE "clinic_settings"
  ADD COLUMN IF NOT EXISTS "turnover_buffer_minutes" INTEGER NOT NULL DEFAULT 15;
