-- AlterTable clinic_settings
ALTER TABLE "clinic_settings"
ADD COLUMN IF NOT EXISTS "blocked_times" JSONB,
ADD COLUMN IF NOT EXISTS "auto_release_hours" INTEGER NOT NULL DEFAULT 2,
ADD COLUMN IF NOT EXISTS "payment_methods" JSONB;

-- AlterTable doctors
ALTER TABLE "doctors"
ADD COLUMN IF NOT EXISTS "gender" TEXT;

-- AlterTable services
ALTER TABLE "services"
ADD COLUMN IF NOT EXISTS "requires_consultation" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS "turnover_buffer_minutes" INTEGER;

-- AlterTable bookings
ALTER TABLE "bookings"
ADD COLUMN IF NOT EXISTS "chair_index" INTEGER,
ADD COLUMN IF NOT EXISTS "parent_booking_id" UUID,
ADD COLUMN IF NOT EXISTS "medical_flags" JSONB,
ADD COLUMN IF NOT EXISTS "medical_other" TEXT,
ADD COLUMN IF NOT EXISTS "booking_for" TEXT DEFAULT 'self',
ADD COLUMN IF NOT EXISTS "booker_name" TEXT,
ADD COLUMN IF NOT EXISTS "booker_phone" TEXT,
ADD COLUMN IF NOT EXISTS "patient_age" INTEGER,
ADD COLUMN IF NOT EXISTS "patient_type" TEXT DEFAULT 'new',
ADD COLUMN IF NOT EXISTS "medical_record_no" TEXT,
ADD COLUMN IF NOT EXISTS "birth_date" DATE,
ADD COLUMN IF NOT EXISTS "payer" TEXT DEFAULT 'umum',
ADD COLUMN IF NOT EXISTS "insurance_name" TEXT,
ADD COLUMN IF NOT EXISTS "insurance_number" TEXT,
ADD COLUMN IF NOT EXISTS "turnover_ends_at" TIMESTAMPTZ(6);

-- Foreign key for parent_booking_id if not present
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'bookings_parent_booking_id_fkey'
  ) THEN
    ALTER TABLE "bookings"
    ADD CONSTRAINT "bookings_parent_booking_id_fkey"
    FOREIGN KEY ("parent_booking_id") REFERENCES "bookings"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;
