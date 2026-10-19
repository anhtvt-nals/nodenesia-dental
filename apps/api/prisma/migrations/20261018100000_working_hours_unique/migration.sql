CREATE UNIQUE INDEX "working_hours_doctor_id_weekday_start_time_end_time_key"
  ON "working_hours"("doctor_id", "weekday", "start_time", "end_time");
