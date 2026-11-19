-- These booking fields are no longer collected or retained by the application.
ALTER TABLE "bookings"
  DROP COLUMN "medical_flags",
  DROP COLUMN "medical_other",
  DROP COLUMN "medical_record_no",
  DROP COLUMN "insurance_name",
  DROP COLUMN "insurance_number";
