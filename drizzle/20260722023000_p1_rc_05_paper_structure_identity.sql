ALTER TABLE "paper_section" ADD COLUMN "public_id" text;--> statement-breakpoint
UPDATE "paper_section"
SET "public_id" = 'paper_section_' || replace(gen_random_uuid()::text, '-', '')
WHERE "public_id" IS NULL;--> statement-breakpoint
ALTER TABLE "paper_section" ALTER COLUMN "public_id" SET DEFAULT 'paper_section_' || replace(gen_random_uuid()::text, '-', '');--> statement-breakpoint
ALTER TABLE "paper_section" ALTER COLUMN "public_id" SET NOT NULL;--> statement-breakpoint
WITH "ranked_paper_section" AS (
  SELECT "id", row_number() OVER (PARTITION BY "paper_id" ORDER BY "sort_order", "id") AS "normalized_sort_order"
  FROM "paper_section"
)
UPDATE "paper_section"
SET "sort_order" = "ranked_paper_section"."normalized_sort_order"
FROM "ranked_paper_section"
WHERE "paper_section"."id" = "ranked_paper_section"."id";--> statement-breakpoint
WITH "ranked_question_group" AS (
  SELECT "id", row_number() OVER (PARTITION BY "paper_section_id" ORDER BY "sort_order", "id") AS "normalized_sort_order"
  FROM "question_group"
)
UPDATE "question_group"
SET "sort_order" = "ranked_question_group"."normalized_sort_order"
FROM "ranked_question_group"
WHERE "question_group"."id" = "ranked_question_group"."id";--> statement-breakpoint
CREATE UNIQUE INDEX "udx_paper_section_public_id" ON "paper_section" USING btree ("public_id");--> statement-breakpoint
CREATE UNIQUE INDEX "udx_paper_section_paper_id_sort_order" ON "paper_section" USING btree ("paper_id","sort_order");--> statement-breakpoint
CREATE UNIQUE INDEX "udx_question_group_paper_section_id_sort_order" ON "question_group" USING btree ("paper_section_id","sort_order");
