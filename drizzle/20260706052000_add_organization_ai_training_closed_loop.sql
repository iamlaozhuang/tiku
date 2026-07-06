ALTER TYPE "organization_training_source_context_type"
  ADD VALUE IF NOT EXISTS 'organization_ai_result';

ALTER TABLE "organization_training_version"
  ADD COLUMN IF NOT EXISTS "question_snapshot" jsonb NOT NULL DEFAULT '[]'::jsonb;

ALTER TABLE "organization_training_answer"
  ADD COLUMN IF NOT EXISTS "answer_item_snapshot" jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS "question_result_snapshot" jsonb NOT NULL DEFAULT '[]'::jsonb;
