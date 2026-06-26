CREATE TABLE "admin_ai_generation_formal_adoption" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "admin_ai_generation_formal_adoption_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"public_id" text NOT NULL,
	"source_result_public_id" text NOT NULL,
	"source_task_public_id" text NOT NULL,
	"source_request_public_id" text NOT NULL,
	"workspace" text NOT NULL,
	"generation_kind" text NOT NULL,
	"owner_type" text NOT NULL,
	"owner_public_id" text NOT NULL,
	"organization_public_id" text,
	"target_type" text NOT NULL,
	"target_domain" text NOT NULL,
	"review_status" text NOT NULL,
	"formal_target_write_status" text NOT NULL,
	"formal_question_public_id" text,
	"formal_paper_public_id" text,
	"reviewer_public_id" text NOT NULL,
	"reviewed_at" timestamp with time zone NOT NULL,
	"content_digest" text NOT NULL,
	"content_preview_masked" text NOT NULL,
	"evidence_status" "public"."evidence_status" DEFAULT 'none' NOT NULL,
	"citation_count" integer DEFAULT 0 NOT NULL,
	"ai_call_log_public_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX "udx_admin_ai_generation_formal_adoption_public_id" ON "admin_ai_generation_formal_adoption" USING btree ("public_id");--> statement-breakpoint
CREATE UNIQUE INDEX "udx_admin_ai_generation_formal_adoption_source_target" ON "admin_ai_generation_formal_adoption" USING btree ("source_result_public_id","target_type","target_domain");--> statement-breakpoint
CREATE INDEX "idx_admin_ai_generation_formal_adoption_source_result" ON "admin_ai_generation_formal_adoption" USING btree ("source_result_public_id");--> statement-breakpoint
CREATE INDEX "idx_admin_ai_generation_formal_adoption_reviewer" ON "admin_ai_generation_formal_adoption" USING btree ("reviewer_public_id");--> statement-breakpoint
CREATE INDEX "idx_admin_ai_generation_formal_adoption_write_status" ON "admin_ai_generation_formal_adoption" USING btree ("formal_target_write_status");--> statement-breakpoint
CREATE INDEX "idx_admin_ai_generation_formal_adoption_created_at" ON "admin_ai_generation_formal_adoption" USING btree ("created_at");
