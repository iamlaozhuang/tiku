CREATE TYPE "public"."organization_training_draft_status" AS ENUM('draft', 'consumed', 'discarded');--> statement-breakpoint
ALTER TYPE "public"."organization_training_answer_status" ADD VALUE 'scoring' BEFORE 'submitted';--> statement-breakpoint
ALTER TYPE "public"."organization_training_answer_status" ADD VALUE 'scoring_failed' BEFORE 'read_only';--> statement-breakpoint
CREATE TABLE "organization_training_scoring_task" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "organization_training_scoring_task_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"public_id" text NOT NULL,
	"organization_training_answer_id" bigint NOT NULL,
	"idempotency_key_hash" text NOT NULL,
	"task_status" "ai_scoring_task_status" DEFAULT 'pending' NOT NULL,
	"attempt_count" integer DEFAULT 0 NOT NULL,
	"max_attempt_count" integer DEFAULT 3 NOT NULL,
	"timeout_second" integer DEFAULT 60 NOT NULL,
	"model_config_snapshot" jsonb NOT NULL,
	"prompt_template_key" text NOT NULL,
	"prompt_template_version" integer NOT NULL,
	"prompt_template_hash" text NOT NULL,
	"input_snapshot" jsonb NOT NULL,
	"authorization_snapshot" jsonb NOT NULL,
	"rag_snapshot" jsonb,
	"result_snapshot" jsonb,
	"ai_call_log_id" bigint,
	"failure_code" text,
	"failure_message_digest" text,
	"scheduled_at" timestamp with time zone DEFAULT now() NOT NULL,
	"claimed_at" timestamp with time zone,
	"lease_expires_at" timestamp with time zone,
	"worker_public_id" text,
	"completed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "chk_organization_training_scoring_task_attempt_count" CHECK ("organization_training_scoring_task"."attempt_count" >= 0 and "organization_training_scoring_task"."attempt_count" <= "organization_training_scoring_task"."max_attempt_count"),
	CONSTRAINT "chk_organization_training_scoring_task_max_attempt_count" CHECK ("organization_training_scoring_task"."max_attempt_count" = 3),
	CONSTRAINT "chk_organization_training_scoring_task_timeout_second" CHECK ("organization_training_scoring_task"."timeout_second" = 60)
);
--> statement-breakpoint
ALTER TABLE "organization_training_answer" ADD COLUMN "revision" integer DEFAULT 1 NOT NULL;--> statement-breakpoint
ALTER TABLE "organization_training_answer" ADD COLUMN "last_operation_id" text;--> statement-breakpoint
ALTER TABLE "organization_training_answer" ADD COLUMN "last_payload_digest" text;--> statement-breakpoint
ALTER TABLE "organization_training_answer" ADD COLUMN "submit_operation_id" text;--> statement-breakpoint
ALTER TABLE "organization_training_answer" ADD COLUMN "submit_payload_digest" text;--> statement-breakpoint
ALTER TABLE "organization_training_draft" ADD COLUMN "draft_status" "organization_training_draft_status" DEFAULT 'draft' NOT NULL;--> statement-breakpoint
ALTER TABLE "organization_training_draft" ADD COLUMN "revision" integer DEFAULT 1 NOT NULL;--> statement-breakpoint
ALTER TABLE "organization_training_draft" ADD COLUMN "question_snapshot" jsonb DEFAULT '[]'::jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "organization_training_draft" ADD COLUMN "last_operation_id" text;--> statement-breakpoint
ALTER TABLE "organization_training_draft" ADD COLUMN "last_payload_digest" text;--> statement-breakpoint
ALTER TABLE "organization_training_draft" ADD COLUMN "consumed_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "organization_training_draft" ADD COLUMN "discarded_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "organization_training_version" ADD COLUMN "organization_training_draft_id" bigint;--> statement-breakpoint
ALTER TABLE "organization_training_version" ADD COLUMN "publish_operation_id" text;--> statement-breakpoint
ALTER TABLE "organization_training_version" ADD COLUMN "publish_payload_digest" text;--> statement-breakpoint
ALTER TABLE "organization_training_scoring_task" ADD CONSTRAINT "fk_organization_training_scoring_task_answer" FOREIGN KEY ("organization_training_answer_id") REFERENCES "public"."organization_training_answer"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organization_training_scoring_task" ADD CONSTRAINT "fk_organization_training_scoring_task_ai_call_log" FOREIGN KEY ("ai_call_log_id") REFERENCES "public"."ai_call_log"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "udx_organization_training_scoring_task_public_id" ON "organization_training_scoring_task" USING btree ("public_id");--> statement-breakpoint
CREATE UNIQUE INDEX "udx_organization_training_scoring_task_answer_id" ON "organization_training_scoring_task" USING btree ("organization_training_answer_id");--> statement-breakpoint
CREATE INDEX "idx_organization_training_scoring_task_status_scheduled_at" ON "organization_training_scoring_task" USING btree ("task_status","scheduled_at");--> statement-breakpoint
CREATE INDEX "idx_organization_training_scoring_task_lease_expires_at" ON "organization_training_scoring_task" USING btree ("lease_expires_at");--> statement-breakpoint
ALTER TABLE "organization_training_version" ADD CONSTRAINT "fk_organization_training_version_draft" FOREIGN KEY ("organization_training_draft_id") REFERENCES "public"."organization_training_draft"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_organization_training_draft_status" ON "organization_training_draft" USING btree ("draft_status");--> statement-breakpoint
CREATE UNIQUE INDEX "udx_organization_training_version_draft_id" ON "organization_training_version" USING btree ("organization_training_draft_id");