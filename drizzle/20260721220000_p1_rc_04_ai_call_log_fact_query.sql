ALTER TABLE "ai_call_log" ADD COLUMN "organization_public_id" text;--> statement-breakpoint
ALTER TABLE "ai_call_log" ADD COLUMN "profession" "profession";--> statement-breakpoint
ALTER TABLE "ai_call_log" ADD COLUMN "level" integer;--> statement-breakpoint
ALTER TABLE "ai_call_log" ADD COLUMN "estimated_cost_cny" numeric(18, 6);--> statement-breakpoint
CREATE INDEX "idx_ai_call_log_organization_public_id" ON "ai_call_log" USING btree ("organization_public_id");--> statement-breakpoint
CREATE INDEX "idx_ai_call_log_profession_level" ON "ai_call_log" USING btree ("profession","level");