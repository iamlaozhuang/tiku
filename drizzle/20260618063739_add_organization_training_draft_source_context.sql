CREATE TYPE "public"."organization_training_retention_status" AS ENUM('active', 'expired_hidden');--> statement-breakpoint
CREATE TYPE "public"."organization_training_source_context_redaction_status" AS ENUM('metadata_only');--> statement-breakpoint
CREATE TYPE "public"."organization_training_source_context_type" AS ENUM('paper', 'mock_exam');--> statement-breakpoint
CREATE TYPE "public"."organization_training_validation_status" AS ENUM('valid', 'invalid', 'needs_review');--> statement-breakpoint
CREATE TABLE "organization_training_draft" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "organization_training_draft_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"public_id" text NOT NULL,
	"source_task_public_id" text,
	"source_version_public_id" text,
	"organization_id" bigint NOT NULL,
	"organization_public_id" text NOT NULL,
	"org_auth_id" bigint NOT NULL,
	"authorization_source" text DEFAULT 'org_auth' NOT NULL,
	"authorization_public_id" text NOT NULL,
	"owner_type" text DEFAULT 'organization' NOT NULL,
	"owner_public_id" text NOT NULL,
	"quota_owner_type" text DEFAULT 'organization' NOT NULL,
	"quota_owner_public_id" text NOT NULL,
	"profession" "profession" NOT NULL,
	"level" integer NOT NULL,
	"subject" "subject" NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"question_count" integer NOT NULL,
	"total_score" numeric(8, 1) NOT NULL,
	"question_type_summary" jsonb NOT NULL,
	"evidence_status" "evidence_status" DEFAULT 'none' NOT NULL,
	"validation_status" "organization_training_validation_status" DEFAULT 'needs_review' NOT NULL,
	"retention_status" "organization_training_retention_status" DEFAULT 'active' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"expires_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "organization_training_source_context" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "organization_training_source_context_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"public_id" text NOT NULL,
	"organization_training_draft_id" bigint NOT NULL,
	"organization_training_draft_public_id" text NOT NULL,
	"organization_id" bigint NOT NULL,
	"organization_public_id" text NOT NULL,
	"org_auth_id" bigint NOT NULL,
	"authorization_source" text DEFAULT 'org_auth' NOT NULL,
	"authorization_public_id" text NOT NULL,
	"source_type" "organization_training_source_context_type" NOT NULL,
	"source_public_id" text NOT NULL,
	"title" text NOT NULL,
	"profession" "profession" NOT NULL,
	"level" integer NOT NULL,
	"subject" "subject" NOT NULL,
	"question_count" integer NOT NULL,
	"total_score" numeric(8, 1) NOT NULL,
	"source_status" text NOT NULL,
	"redaction_status" "organization_training_source_context_redaction_status" DEFAULT 'metadata_only' NOT NULL,
	"formal_usage_policy" jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "organization_training_draft" ADD CONSTRAINT "fk_organization_training_draft_organization" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organization_training_draft" ADD CONSTRAINT "fk_organization_training_draft_org_auth" FOREIGN KEY ("org_auth_id") REFERENCES "public"."org_auth"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organization_training_source_context" ADD CONSTRAINT "fk_organization_training_source_context_draft" FOREIGN KEY ("organization_training_draft_id") REFERENCES "public"."organization_training_draft"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organization_training_source_context" ADD CONSTRAINT "fk_organization_training_source_context_organization" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organization_training_source_context" ADD CONSTRAINT "fk_organization_training_source_context_org_auth" FOREIGN KEY ("org_auth_id") REFERENCES "public"."org_auth"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "udx_organization_training_draft_public_id" ON "organization_training_draft" USING btree ("public_id");--> statement-breakpoint
CREATE INDEX "idx_organization_training_draft_organization_id" ON "organization_training_draft" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "idx_organization_training_draft_org_auth_id" ON "organization_training_draft" USING btree ("org_auth_id");--> statement-breakpoint
CREATE INDEX "idx_organization_training_draft_scope" ON "organization_training_draft" USING btree ("profession","level","subject");--> statement-breakpoint
CREATE INDEX "idx_organization_training_draft_retention" ON "organization_training_draft" USING btree ("retention_status","expires_at");--> statement-breakpoint
CREATE INDEX "idx_organization_training_draft_source_task" ON "organization_training_draft" USING btree ("source_task_public_id");--> statement-breakpoint
CREATE INDEX "idx_organization_training_draft_source_version" ON "organization_training_draft" USING btree ("source_version_public_id");--> statement-breakpoint
CREATE UNIQUE INDEX "udx_organization_training_source_context_public_id" ON "organization_training_source_context" USING btree ("public_id");--> statement-breakpoint
CREATE UNIQUE INDEX "udx_organization_training_source_context_draft_source" ON "organization_training_source_context" USING btree ("organization_training_draft_id","source_type","source_public_id");--> statement-breakpoint
CREATE INDEX "idx_organization_training_source_context_draft_id" ON "organization_training_source_context" USING btree ("organization_training_draft_id");--> statement-breakpoint
CREATE INDEX "idx_organization_training_source_context_organization_id" ON "organization_training_source_context" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "idx_organization_training_source_context_org_auth_id" ON "organization_training_source_context" USING btree ("org_auth_id");--> statement-breakpoint
CREATE INDEX "idx_organization_training_source_context_source" ON "organization_training_source_context" USING btree ("source_type","source_public_id");