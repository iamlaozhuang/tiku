CREATE TYPE "public"."ai_scoring_attempt_status" AS ENUM('pending', 'running', 'succeeded', 'failed', 'timeout', 'cancelled');--> statement-breakpoint
CREATE TABLE "ai_scoring_attempt" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "ai_scoring_attempt_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"answer_record_id" bigint NOT NULL,
	"attempt_number" integer NOT NULL,
	"ai_call_log_id" bigint,
	"status" "ai_scoring_attempt_status" NOT NULL,
	"failure_code" text,
	"failure_message_digest" text,
	"scheduled_at" timestamp with time zone NOT NULL,
	"started_at" timestamp with time zone,
	"finished_at" timestamp with time zone,
	"retry_after_at" timestamp with time zone,
	"attempt_snapshot" jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);--> statement-breakpoint
ALTER TABLE "ai_scoring_attempt" ADD CONSTRAINT "ai_scoring_attempt_answer_record_id_answer_record_id_fk" FOREIGN KEY ("answer_record_id") REFERENCES "public"."answer_record"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_scoring_attempt" ADD CONSTRAINT "ai_scoring_attempt_ai_call_log_id_ai_call_log_id_fk" FOREIGN KEY ("ai_call_log_id") REFERENCES "public"."ai_call_log"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_ai_scoring_attempt_answer_record_id" ON "ai_scoring_attempt" USING btree ("answer_record_id");--> statement-breakpoint
CREATE INDEX "idx_ai_scoring_attempt_status" ON "ai_scoring_attempt" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_ai_scoring_attempt_retry_after_at" ON "ai_scoring_attempt" USING btree ("retry_after_at");--> statement-breakpoint
CREATE UNIQUE INDEX "udx_ai_scoring_attempt_answer_record_id_attempt_number" ON "ai_scoring_attempt" USING btree ("answer_record_id","attempt_number");
