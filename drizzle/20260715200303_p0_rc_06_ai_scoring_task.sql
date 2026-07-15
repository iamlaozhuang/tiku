CREATE TYPE "public"."ai_scoring_task_status" AS ENUM('pending', 'running', 'succeeded', 'failed', 'cancelled');--> statement-breakpoint
CREATE TABLE "ai_scoring_task" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "ai_scoring_task_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"public_id" text NOT NULL,
	"answer_record_id" bigint NOT NULL,
	"mock_exam_public_id" text NOT NULL,
	"actor_public_id" text NOT NULL,
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
	CONSTRAINT "chk_ai_scoring_task_attempt_count" CHECK ("ai_scoring_task"."attempt_count" >= 0 and "ai_scoring_task"."attempt_count" <= "ai_scoring_task"."max_attempt_count"),
	CONSTRAINT "chk_ai_scoring_task_max_attempt_count" CHECK ("ai_scoring_task"."max_attempt_count" = 3),
	CONSTRAINT "chk_ai_scoring_task_timeout_second" CHECK ("ai_scoring_task"."timeout_second" = 60)
);
--> statement-breakpoint
ALTER TABLE "ai_scoring_task" ADD CONSTRAINT "fk_ai_scoring_task_answer_record" FOREIGN KEY ("answer_record_id") REFERENCES "public"."answer_record"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_scoring_task" ADD CONSTRAINT "fk_ai_scoring_task_ai_call_log" FOREIGN KEY ("ai_call_log_id") REFERENCES "public"."ai_call_log"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "udx_ai_scoring_task_public_id" ON "ai_scoring_task" USING btree ("public_id");--> statement-breakpoint
CREATE UNIQUE INDEX "udx_ai_scoring_task_answer_record_id_idempotency_key_hash" ON "ai_scoring_task" USING btree ("answer_record_id","idempotency_key_hash");--> statement-breakpoint
CREATE INDEX "idx_ai_scoring_task_answer_record_id" ON "ai_scoring_task" USING btree ("answer_record_id");--> statement-breakpoint
CREATE INDEX "idx_ai_scoring_task_task_status_scheduled_at" ON "ai_scoring_task" USING btree ("task_status","scheduled_at");--> statement-breakpoint
CREATE INDEX "idx_ai_scoring_task_lease_expires_at" ON "ai_scoring_task" USING btree ("lease_expires_at");--> statement-breakpoint
CREATE INDEX "idx_ai_scoring_task_mock_exam_public_id_task_status" ON "ai_scoring_task" USING btree ("mock_exam_public_id","task_status");
