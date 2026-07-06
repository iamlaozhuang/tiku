CREATE TABLE "personal_ai_learning_answer_feedback" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "personal_ai_learning_answer_feedback_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"public_id" text NOT NULL,
	"personal_ai_learning_session_id" bigint NOT NULL,
	"learning_session_public_id" text NOT NULL,
	"session_question_public_id" text NOT NULL,
	"actor_public_id" text NOT NULL,
	"feedback_status" text NOT NULL,
	"selected_option_labels" jsonb NOT NULL,
	"text_answer" text,
	"is_correct" boolean,
	"score" text,
	"max_score" text,
	"answer_feedback_snapshot" jsonb NOT NULL,
	"formal_write_boundary" jsonb NOT NULL,
	"submitted_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "personal_ai_learning_session" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "personal_ai_learning_session_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"public_id" text NOT NULL,
	"personal_ai_generation_result_id" bigint NOT NULL,
	"source_result_public_id" text NOT NULL,
	"source_task_public_id" text NOT NULL,
	"content_domain" text NOT NULL,
	"owner_type" text NOT NULL,
	"owner_public_id" text NOT NULL,
	"actor_public_id" text NOT NULL,
	"evidence_status" "evidence_status" DEFAULT 'none' NOT NULL,
	"citation_count" integer DEFAULT 0 NOT NULL,
	"question_count" integer DEFAULT 0 NOT NULL,
	"question_snapshot" jsonb NOT NULL,
	"formal_write_boundary" jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "personal_ai_learning_answer_feedback" ADD CONSTRAINT "fk_personal_ai_learning_feedback_session" FOREIGN KEY ("personal_ai_learning_session_id") REFERENCES "public"."personal_ai_learning_session"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "personal_ai_learning_session" ADD CONSTRAINT "fk_personal_ai_learning_session_result" FOREIGN KEY ("personal_ai_generation_result_id") REFERENCES "public"."personal_ai_generation_result"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "udx_personal_ai_learning_answer_feedback_public_id" ON "personal_ai_learning_answer_feedback" USING btree ("public_id");--> statement-breakpoint
CREATE UNIQUE INDEX "udx_personal_ai_learning_answer_feedback_session_question" ON "personal_ai_learning_answer_feedback" USING btree ("learning_session_public_id","session_question_public_id");--> statement-breakpoint
CREATE INDEX "idx_personal_ai_learning_answer_feedback_session" ON "personal_ai_learning_answer_feedback" USING btree ("learning_session_public_id");--> statement-breakpoint
CREATE INDEX "idx_personal_ai_learning_answer_feedback_actor_submitted_at" ON "personal_ai_learning_answer_feedback" USING btree ("actor_public_id","submitted_at");--> statement-breakpoint
CREATE UNIQUE INDEX "udx_personal_ai_learning_session_public_id" ON "personal_ai_learning_session" USING btree ("public_id");--> statement-breakpoint
CREATE INDEX "idx_personal_ai_learning_session_actor_created_at" ON "personal_ai_learning_session" USING btree ("actor_public_id","created_at");--> statement-breakpoint
CREATE INDEX "idx_personal_ai_learning_session_owner_created_at" ON "personal_ai_learning_session" USING btree ("owner_public_id","created_at");--> statement-breakpoint
CREATE INDEX "idx_personal_ai_learning_session_source_result" ON "personal_ai_learning_session" USING btree ("source_result_public_id");