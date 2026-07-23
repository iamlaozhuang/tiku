CREATE TABLE "admin_ai_generation_review_draft" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "admin_ai_generation_review_draft_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"public_id" text NOT NULL,
	"admin_ai_generation_result_id" bigint NOT NULL,
	"source_result_public_id" text NOT NULL,
	"source_task_public_id" text NOT NULL,
	"target_type" text NOT NULL,
	"revision_number" integer NOT NULL,
	"revision_origin" text NOT NULL,
	"predecessor_public_id" text,
	"predecessor_digest" text,
	"source_content_digest" text NOT NULL,
	"draft_snapshot" jsonb NOT NULL,
	"draft_digest" text NOT NULL,
	"editor_public_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "chk_admin_ai_generation_review_draft_identity" CHECK ((
        "admin_ai_generation_review_draft"."revision_number" >= 0
        and "admin_ai_generation_review_draft"."target_type" in ('question', 'paper')
        and "admin_ai_generation_review_draft"."revision_origin" in ('generated_result', 'review_edit')
        and jsonb_typeof("admin_ai_generation_review_draft"."draft_snapshot") = 'object'
        and "admin_ai_generation_review_draft"."source_content_digest" ~ '^sha256:[0-9a-f]{64}$'
        and "admin_ai_generation_review_draft"."draft_digest" ~ '^sha256:[0-9a-f]{64}$'
      )),
	CONSTRAINT "chk_admin_ai_generation_review_draft_predecessor" CHECK ((
        ("admin_ai_generation_review_draft"."revision_number" = 0 and "admin_ai_generation_review_draft"."predecessor_public_id" is null and "admin_ai_generation_review_draft"."predecessor_digest" is null)
        or
        ("admin_ai_generation_review_draft"."revision_number" > 0 and "admin_ai_generation_review_draft"."predecessor_public_id" is not null and "admin_ai_generation_review_draft"."predecessor_digest" ~ '^sha256:[0-9a-f]{64}$')
      )),
	CONSTRAINT "chk_admin_ai_generation_review_draft_origin" CHECK ((
        ("admin_ai_generation_review_draft"."revision_origin" = 'generated_result' and "admin_ai_generation_review_draft"."revision_number" = 0 and "admin_ai_generation_review_draft"."editor_public_id" is null)
        or
        ("admin_ai_generation_review_draft"."revision_origin" = 'review_edit' and "admin_ai_generation_review_draft"."editor_public_id" is not null)
      ))
);
--> statement-breakpoint
ALTER TABLE "admin_ai_generation_formal_adoption" ADD COLUMN "review_draft_public_id" text;--> statement-breakpoint
ALTER TABLE "admin_ai_generation_formal_adoption" ADD COLUMN "review_draft_revision" integer;--> statement-breakpoint
ALTER TABLE "admin_ai_generation_formal_adoption" ADD COLUMN "review_draft_digest" text;--> statement-breakpoint
ALTER TABLE "admin_ai_generation_result" ADD COLUMN "current_review_draft_public_id" text;--> statement-breakpoint
ALTER TABLE "admin_ai_generation_result" ADD COLUMN "current_review_draft_revision" integer;--> statement-breakpoint
ALTER TABLE "admin_ai_generation_result" ADD COLUMN "current_review_draft_digest" text;--> statement-breakpoint
ALTER TABLE "admin_ai_generation_review_draft" ADD CONSTRAINT "fk_admin_ai_generation_review_draft_result" FOREIGN KEY ("admin_ai_generation_result_id") REFERENCES "public"."admin_ai_generation_result"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "udx_admin_ai_generation_review_draft_public_id" ON "admin_ai_generation_review_draft" USING btree ("public_id");--> statement-breakpoint
CREATE UNIQUE INDEX "udx_admin_ai_generation_review_draft_result_revision" ON "admin_ai_generation_review_draft" USING btree ("admin_ai_generation_result_id","revision_number");--> statement-breakpoint
CREATE INDEX "idx_admin_ai_generation_review_draft_source_result" ON "admin_ai_generation_review_draft" USING btree ("source_result_public_id","revision_number");--> statement-breakpoint
ALTER TABLE "admin_ai_generation_formal_adoption" ADD CONSTRAINT "chk_admin_ai_formal_adoption_review_draft_coherence" CHECK ((
        ("admin_ai_generation_formal_adoption"."review_draft_public_id" is null and "admin_ai_generation_formal_adoption"."review_draft_revision" is null and "admin_ai_generation_formal_adoption"."review_draft_digest" is null)
        or
        ("admin_ai_generation_formal_adoption"."review_draft_public_id" is not null and "admin_ai_generation_formal_adoption"."review_draft_revision" >= 0 and "admin_ai_generation_formal_adoption"."review_draft_digest" ~ '^sha256:[0-9a-f]{64}$')
      ));--> statement-breakpoint
ALTER TABLE "admin_ai_generation_result" ADD CONSTRAINT "chk_admin_ai_generation_result_review_draft_coherence" CHECK ((
        ("admin_ai_generation_result"."current_review_draft_public_id" is null and "admin_ai_generation_result"."current_review_draft_revision" is null and "admin_ai_generation_result"."current_review_draft_digest" is null)
        or
        ("admin_ai_generation_result"."current_review_draft_public_id" is not null and "admin_ai_generation_result"."current_review_draft_revision" >= 0 and "admin_ai_generation_result"."current_review_draft_digest" ~ '^sha256:[0-9a-f]{64}$')
      ));