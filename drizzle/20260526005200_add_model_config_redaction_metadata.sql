ALTER TABLE "model_provider" ADD COLUMN "secret_status" text DEFAULT 'not_configured' NOT NULL;--> statement-breakpoint
ALTER TABLE "model_provider" ADD COLUMN "last_rotated_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "model_provider" ADD COLUMN "provider_metadata" jsonb;--> statement-breakpoint
ALTER TABLE "model_config" ADD COLUMN "model_alias" text;--> statement-breakpoint
ALTER TABLE "model_config" ADD COLUMN "status" text DEFAULT 'disabled' NOT NULL;--> statement-breakpoint
ALTER TABLE "model_config" ADD COLUMN "fallback_priority" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "model_config" ADD COLUMN "snapshot_policy" text DEFAULT 'redacted_metadata' NOT NULL;--> statement-breakpoint
ALTER TABLE "prompt_template" ADD COLUMN "status" text DEFAULT 'draft' NOT NULL;--> statement-breakpoint
ALTER TABLE "prompt_template" ADD COLUMN "title" text;--> statement-breakpoint
ALTER TABLE "prompt_template" ADD COLUMN "description" text;--> statement-breakpoint
ALTER TABLE "prompt_template" ADD COLUMN "body_digest" text;--> statement-breakpoint
ALTER TABLE "prompt_template" ADD COLUMN "body_preview_masked" text;--> statement-breakpoint
ALTER TABLE "prompt_template" ADD COLUMN "disabled_at" timestamp with time zone;--> statement-breakpoint
CREATE INDEX "idx_model_provider_secret_status" ON "model_provider" USING btree ("secret_status");--> statement-breakpoint
CREATE INDEX "idx_model_config_ai_func_type_fallback_priority" ON "model_config" USING btree ("ai_func_type","fallback_priority");--> statement-breakpoint
CREATE INDEX "idx_prompt_template_status" ON "prompt_template" USING btree ("status");
