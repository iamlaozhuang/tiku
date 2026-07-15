CREATE TYPE "public"."mock_exam_deadline_task_status" AS ENUM('pending', 'running', 'completed', 'failed', 'cancelled');--> statement-breakpoint
CREATE TABLE "mock_exam_deadline_task" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "mock_exam_deadline_task_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"public_id" text NOT NULL,
	"mock_exam_id" bigint NOT NULL,
	"task_status" "mock_exam_deadline_task_status" DEFAULT 'pending' NOT NULL,
	"scheduled_at" timestamp with time zone NOT NULL,
	"attempt_count" integer DEFAULT 0 NOT NULL,
	"max_attempt_count" integer DEFAULT 5 NOT NULL,
	"claimed_at" timestamp with time zone,
	"lease_expires_at" timestamp with time zone,
	"worker_public_id" text,
	"failure_message_digest" text,
	"completed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "chk_mock_exam_deadline_task_attempt_count" CHECK ("mock_exam_deadline_task"."attempt_count" >= 0 and "mock_exam_deadline_task"."attempt_count" <= "mock_exam_deadline_task"."max_attempt_count"),
	CONSTRAINT "chk_mock_exam_deadline_task_max_attempt_count" CHECK ("mock_exam_deadline_task"."max_attempt_count" > 0)
);
--> statement-breakpoint
ALTER TABLE "answer_record" ADD COLUMN "answer_revision" integer DEFAULT 1 NOT NULL;--> statement-breakpoint
ALTER TABLE "answer_record" ADD COLUMN "client_operation_id" text;--> statement-breakpoint
ALTER TABLE "answer_record" ADD COLUMN "client_saved_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "exam_report" ADD COLUMN "report_revision" integer DEFAULT 1 NOT NULL;--> statement-breakpoint
ALTER TABLE "mock_exam_deadline_task" ADD CONSTRAINT "mock_exam_deadline_task_mock_exam_id_mock_exam_id_fk" FOREIGN KEY ("mock_exam_id") REFERENCES "public"."mock_exam"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "udx_mock_exam_deadline_task_public_id" ON "mock_exam_deadline_task" USING btree ("public_id");--> statement-breakpoint
CREATE UNIQUE INDEX "udx_mock_exam_deadline_task_mock_exam_id" ON "mock_exam_deadline_task" USING btree ("mock_exam_id");--> statement-breakpoint
CREATE INDEX "idx_mock_exam_deadline_task_task_status_scheduled_at" ON "mock_exam_deadline_task" USING btree ("task_status","scheduled_at");--> statement-breakpoint
CREATE INDEX "idx_mock_exam_deadline_task_lease_expires_at" ON "mock_exam_deadline_task" USING btree ("lease_expires_at");--> statement-breakpoint
CREATE UNIQUE INDEX "udx_answer_record_mock_exam_id_client_operation_id" ON "answer_record" USING btree ("mock_exam_id","client_operation_id") WHERE "answer_record"."client_operation_id" is not null;--> statement-breakpoint
ALTER TABLE "answer_record" ADD CONSTRAINT "chk_answer_record_answer_revision" CHECK ("answer_record"."answer_revision" > 0);--> statement-breakpoint
ALTER TABLE "exam_report" ADD CONSTRAINT "chk_exam_report_report_revision" CHECK ("exam_report"."report_revision" > 0);