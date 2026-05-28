ALTER TABLE "question" ADD COLUMN "fill_blank_answers" jsonb DEFAULT '[]'::jsonb NOT NULL;
