ALTER TABLE "resource" ADD COLUMN "level_list" integer[];--> statement-breakpoint
UPDATE "resource" SET "level_list" = ARRAY["level"] WHERE "level" IS NOT NULL;--> statement-breakpoint
CREATE INDEX "idx_resource_level_list" ON "resource" USING gin ("level_list");
