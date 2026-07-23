CREATE TYPE "public"."learning_suggestion_status" AS ENUM('pending', 'running', 'succeeded', 'failed');--> statement-breakpoint
ALTER TABLE "exam_report" ADD COLUMN "learning_suggestion_status" "learning_suggestion_status";--> statement-breakpoint
ALTER TABLE "exam_report" ADD COLUMN "learning_suggestion_attempt_count" integer;--> statement-breakpoint
ALTER TABLE "exam_report" ADD COLUMN "learning_suggestion_input_digest" text;--> statement-breakpoint
ALTER TABLE "exam_report" ADD COLUMN "learning_suggestion_claimed_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "exam_report" ADD COLUMN "learning_suggestion_completed_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "exam_report" ADD COLUMN "learning_suggestion_failure_category" text;--> statement-breakpoint
CREATE INDEX "idx_exam_report_learning_suggestion_status_updated_at" ON "exam_report" USING btree ("learning_suggestion_status","updated_at");--> statement-breakpoint
ALTER TABLE "exam_report" ADD CONSTRAINT "chk_exam_report_learning_suggestion_lifecycle" CHECK ((
        ("exam_report"."learning_suggestion_status" is null
          and "exam_report"."learning_suggestion_attempt_count" is null
          and "exam_report"."learning_suggestion_input_digest" is null
          and "exam_report"."learning_suggestion_claimed_at" is null
          and "exam_report"."learning_suggestion_completed_at" is null
          and "exam_report"."learning_suggestion_failure_category" is null)
        or
        ("exam_report"."exam_status" = 'completed'::exam_status and (
          ("exam_report"."learning_suggestion_status" = 'pending'::learning_suggestion_status
            and "exam_report"."learning_suggestion_attempt_count" = 0
            and "exam_report"."learning_suggestion_input_digest" is null
            and "exam_report"."learning_suggestion_claimed_at" is null
            and "exam_report"."learning_suggestion_completed_at" is null
            and "exam_report"."learning_suggestion_failure_category" is null
            and "exam_report"."learning_suggestion_snapshot" is null)
          or
          ("exam_report"."learning_suggestion_status" = 'running'::learning_suggestion_status
            and "exam_report"."learning_suggestion_attempt_count" between 1 and 3
            and "exam_report"."learning_suggestion_input_digest" ~ '^[0-9a-f]{64}$'
            and "exam_report"."learning_suggestion_claimed_at" is not null
            and "exam_report"."learning_suggestion_completed_at" is null
            and "exam_report"."learning_suggestion_failure_category" is null
            and "exam_report"."learning_suggestion_snapshot" is null)
          or
          ("exam_report"."learning_suggestion_status" = 'succeeded'::learning_suggestion_status
            and "exam_report"."learning_suggestion_attempt_count" between 1 and 3
            and "exam_report"."learning_suggestion_input_digest" ~ '^[0-9a-f]{64}$'
            and "exam_report"."learning_suggestion_claimed_at" is not null
            and "exam_report"."learning_suggestion_completed_at" is not null
            and "exam_report"."learning_suggestion_failure_category" is null
            and "exam_report"."learning_suggestion_snapshot" is not null)
          or
          ("exam_report"."learning_suggestion_status" = 'failed'::learning_suggestion_status
            and "exam_report"."learning_suggestion_attempt_count" between 0 and 3
            and "exam_report"."learning_suggestion_completed_at" is not null
            and "exam_report"."learning_suggestion_failure_category" in (
              'configuration_unavailable',
              'input_unavailable',
              'provider_failed',
              'timeout'
            )
            and "exam_report"."learning_suggestion_snapshot" is null
            and (
              ("exam_report"."learning_suggestion_attempt_count" = 0
                and "exam_report"."learning_suggestion_input_digest" is null
                and "exam_report"."learning_suggestion_claimed_at" is null
                and "exam_report"."learning_suggestion_failure_category" = 'input_unavailable')
              or
              ("exam_report"."learning_suggestion_attempt_count" between 1 and 3
                and "exam_report"."learning_suggestion_input_digest" ~ '^[0-9a-f]{64}$'
                and "exam_report"."learning_suggestion_claimed_at" is not null)
            ))
        ))
      ));