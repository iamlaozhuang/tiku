ALTER TABLE "personal_ai_learning_answer_feedback" ADD COLUMN "answer_revision" integer;--> statement-breakpoint
ALTER TABLE "personal_ai_learning_answer_feedback" ADD COLUMN "answer_command_digest" text;--> statement-breakpoint
ALTER TABLE "personal_ai_learning_answer_feedback" ADD CONSTRAINT "personal_ai_learning_answer_feedback_revision_check" CHECK ((
        ("personal_ai_learning_answer_feedback"."answer_revision" is null and "personal_ai_learning_answer_feedback"."answer_command_digest" is null)
        or
        (
          "personal_ai_learning_answer_feedback"."answer_revision" is not null
          and "personal_ai_learning_answer_feedback"."answer_command_digest" is not null
          and "personal_ai_learning_answer_feedback"."answer_revision" between 1 and 2147483647
          and "personal_ai_learning_answer_feedback"."answer_command_digest" ~ '^[0-9a-f]{64}$'
        )
      ));
