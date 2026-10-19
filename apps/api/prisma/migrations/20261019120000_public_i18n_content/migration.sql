-- Bilingual (ID/EN) public content columns + structured clinic settings.
-- All additions are nullable so existing pilot data is preserved.

-- ClinicSettings
ALTER TABLE "clinic_settings" ADD COLUMN IF NOT EXISTS "tagline" TEXT;
ALTER TABLE "clinic_settings" ADD COLUMN IF NOT EXISTS "tagline_en" TEXT;
ALTER TABLE "clinic_settings" ADD COLUMN IF NOT EXISTS "city" TEXT;
ALTER TABLE "clinic_settings" ADD COLUMN IF NOT EXISTS "instagram_handle" TEXT;
ALTER TABLE "clinic_settings" ADD COLUMN IF NOT EXISTS "google_maps_url" TEXT;
ALTER TABLE "clinic_settings" ADD COLUMN IF NOT EXISTS "open_hours" JSONB;
ALTER TABLE "clinic_settings" ADD COLUMN IF NOT EXISTS "stats" JSONB;

-- Doctor
ALTER TABLE "doctors" ADD COLUMN IF NOT EXISTS "title_en" TEXT;
ALTER TABLE "doctors" ADD COLUMN IF NOT EXISTS "specialty_en" TEXT;
ALTER TABLE "doctors" ADD COLUMN IF NOT EXISTS "bio_en" TEXT;
ALTER TABLE "doctors" ADD COLUMN IF NOT EXISTS "sip_number" TEXT;
ALTER TABLE "doctors" ADD COLUMN IF NOT EXISTS "experience_years" INTEGER;
ALTER TABLE "doctors" ADD COLUMN IF NOT EXISTS "education" JSONB;

-- Service
ALTER TABLE "services" ADD COLUMN IF NOT EXISTS "short_desc_en" TEXT;
ALTER TABLE "services" ADD COLUMN IF NOT EXISTS "description_en" TEXT;
ALTER TABLE "services" ADD COLUMN IF NOT EXISTS "price_note_en" TEXT;

-- Testimonial
ALTER TABLE "testimonials" ADD COLUMN IF NOT EXISTS "text_en" TEXT;
ALTER TABLE "testimonials" ADD COLUMN IF NOT EXISTS "service_name" TEXT;
ALTER TABLE "testimonials" ADD COLUMN IF NOT EXISTS "service_name_en" TEXT;
ALTER TABLE "testimonials" ADD COLUMN IF NOT EXISTS "reviewed_at" TEXT;

-- GalleryItem
ALTER TABLE "gallery_items" ADD COLUMN IF NOT EXISTS "before_label" TEXT;
ALTER TABLE "gallery_items" ADD COLUMN IF NOT EXISTS "after_label" TEXT;
ALTER TABLE "gallery_items" ADD COLUMN IF NOT EXISTS "caption_en" TEXT;
ALTER TABLE "gallery_items" ADD COLUMN IF NOT EXISTS "treatment_duration" TEXT;

-- Faq
ALTER TABLE "faqs" ADD COLUMN IF NOT EXISTS "question_en" TEXT;
ALTER TABLE "faqs" ADD COLUMN IF NOT EXISTS "answer_en" TEXT;
ALTER TABLE "faqs" ADD COLUMN IF NOT EXISTS "category" TEXT;

-- ArticleCategory
ALTER TABLE "article_categories" ADD COLUMN IF NOT EXISTS "name_en" TEXT;

-- Article
ALTER TABLE "articles" ADD COLUMN IF NOT EXISTS "title_en" TEXT;
ALTER TABLE "articles" ADD COLUMN IF NOT EXISTS "excerpt_en" TEXT;
ALTER TABLE "articles" ADD COLUMN IF NOT EXISTS "body_en" TEXT;
ALTER TABLE "articles" ADD COLUMN IF NOT EXISTS "read_time" TEXT;
ALTER TABLE "articles" ADD COLUMN IF NOT EXISTS "author_name" TEXT;
ALTER TABLE "articles" ADD COLUMN IF NOT EXISTS "author_title" TEXT;
