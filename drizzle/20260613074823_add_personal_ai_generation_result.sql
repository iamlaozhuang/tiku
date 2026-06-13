CREATE TYPE "public"."personal_ai_generation_result_status" AS ENUM('draft', 'discarded');--> statement-breakpoint
CREATE TABLE "personal_ai_generation_result" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "personal_ai_generation_result_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"public_id" text NOT NULL,
	"ai_generation_task_id" bigint NOT NULL,
	"task_public_id" text NOT NULL,
	"request_public_id" text NOT NULL,
	"owner_public_id" text NOT NULL,
	"task_type" "ai_generation_task_type" NOT NULL,
	"result_status" "personal_ai_generation_result_status" DEFAULT 'draft' NOT NULL,
	"content_redacted_snapshot" jsonb NOT NULL,
	"content_digest" text NOT NULL,
	"content_preview_masked" text NOT NULL,
	"citation_redacted_snapshot" jsonb,
	"evidence_status" "evidence_status" DEFAULT 'none' NOT NULL,
	"citation_count" integer DEFAULT 0 NOT NULL,
	"ai_call_log_public_id" text,
	"is_formal_adoption_blocked" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "personal_ai_generation_result" ADD CONSTRAINT "personal_ai_generation_result_ai_generation_task_id_ai_generation_task_id_fk" FOREIGN KEY ("ai_generation_task_id") REFERENCES "public"."ai_generation_task"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "udx_personal_ai_generation_result_public_id" ON "personal_ai_generation_result" USING btree ("public_id");--> statement-breakpoint
CREATE UNIQUE INDEX "udx_personal_ai_generation_result_ai_generation_task_id" ON "personal_ai_generation_result" USING btree ("ai_generation_task_id");--> statement-breakpoint
CREATE INDEX "idx_personal_ai_generation_result_owner_public_id_created_at" ON "personal_ai_generation_result" USING btree ("owner_public_id","created_at");--> statement-breakpoint
CREATE INDEX "idx_personal_ai_generation_result_task_public_id" ON "personal_ai_generation_result" USING btree ("task_public_id");--> statement-breakpoint
CREATE INDEX "idx_personal_ai_generation_result_result_status" ON "personal_ai_generation_result" USING btree ("result_status");