CREATE TYPE "public"."ai_generation_task_failure_category" AS ENUM('system_error', 'provider_temporary_error', 'network_error', 'rate_limited', 'rag_temporary_error', 'running_timeout', 'invalid_input', 'authorization_missing', 'authorization_invalid', 'edition_not_allowed', 'quota_insufficient', 'scope_forbidden', 'configuration_missing', 'production_enablement_blocked');--> statement-breakpoint
CREATE TYPE "public"."ai_generation_task_status" AS ENUM('pending', 'running', 'succeeded', 'failed', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."ai_generation_task_type" AS ENUM('ai_question_generation', 'ai_paper_generation', 'organization_training_generation');--> statement-breakpoint
CREATE TYPE "public"."evidence_status" AS ENUM('sufficient', 'weak', 'none');--> statement-breakpoint
CREATE TABLE "ai_generation_task" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "ai_generation_task_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"public_id" text NOT NULL,
	"request_public_id" text NOT NULL,
	"task_type" "ai_generation_task_type" NOT NULL,
	"ai_func_type" "ai_func_type" NOT NULL,
	"authorization_public_id" text NOT NULL,
	"actor_public_id" text NOT NULL,
	"owner_type" text NOT NULL,
	"owner_public_id" text NOT NULL,
	"organization_public_id" text,
	"quota_owner_type" text NOT NULL,
	"quota_owner_public_id" text NOT NULL,
	"effective_edition" text NOT NULL,
	"question_public_id" text NOT NULL,
	"answer_record_public_id" text,
	"paper_public_id" text,
	"mock_exam_public_id" text,
	"idempotency_key_hash" text NOT NULL,
	"task_status" "ai_generation_task_status" DEFAULT 'pending' NOT NULL,
	"retry_count" integer DEFAULT 0 NOT NULL,
	"failure_category" "ai_generation_task_failure_category",
	"result_public_id" text,
	"evidence_status" "evidence_status" DEFAULT 'none' NOT NULL,
	"citation_count" integer DEFAULT 0 NOT NULL,
	"is_authorization_active" boolean DEFAULT false NOT NULL,
	"is_scope_allowed" boolean DEFAULT false NOT NULL,
	"is_quota_available" boolean DEFAULT false NOT NULL,
	"is_runtime_config_ready" boolean DEFAULT false NOT NULL,
	"ai_call_log_id" bigint,
	"ai_call_log_public_id" text,
	"requested_at" timestamp with time zone DEFAULT now() NOT NULL,
	"started_at" timestamp with time zone,
	"finished_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "ai_generation_task" ADD CONSTRAINT "ai_generation_task_ai_call_log_id_ai_call_log_id_fk" FOREIGN KEY ("ai_call_log_id") REFERENCES "public"."ai_call_log"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "udx_ai_generation_task_public_id" ON "ai_generation_task" USING btree ("public_id");--> statement-breakpoint
CREATE UNIQUE INDEX "udx_ai_generation_task_request_public_id" ON "ai_generation_task" USING btree ("request_public_id");--> statement-breakpoint
CREATE UNIQUE INDEX "udx_ai_generation_task_owner_public_id_idempotency_key_hash" ON "ai_generation_task" USING btree ("owner_public_id","idempotency_key_hash");--> statement-breakpoint
CREATE INDEX "idx_ai_generation_task_owner_public_id_requested_at" ON "ai_generation_task" USING btree ("owner_public_id","requested_at");--> statement-breakpoint
CREATE INDEX "idx_ai_generation_task_owner_public_id_task_status" ON "ai_generation_task" USING btree ("owner_public_id","task_status");--> statement-breakpoint
CREATE INDEX "idx_ai_generation_task_ai_call_log_id" ON "ai_generation_task" USING btree ("ai_call_log_id");