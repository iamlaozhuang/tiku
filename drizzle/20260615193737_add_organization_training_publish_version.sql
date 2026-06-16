CREATE TYPE "public"."organization_training_version_status" AS ENUM('published', 'taken_down');--> statement-breakpoint
CREATE TABLE "organization_training_version" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "organization_training_version_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"public_id" text NOT NULL,
	"draft_public_id" text NOT NULL,
	"version_number" integer NOT NULL,
	"organization_id" bigint NOT NULL,
	"organization_public_id" text NOT NULL,
	"org_auth_id" bigint NOT NULL,
	"authorization_source" text DEFAULT 'org_auth' NOT NULL,
	"authorization_public_id" text NOT NULL,
	"owner_type" text DEFAULT 'organization' NOT NULL,
	"owner_public_id" text NOT NULL,
	"quota_owner_type" text DEFAULT 'organization' NOT NULL,
	"quota_owner_public_id" text NOT NULL,
	"publish_scope_snapshot" jsonb NOT NULL,
	"profession" "profession" NOT NULL,
	"level" integer NOT NULL,
	"subject" "subject" NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"question_count" integer NOT NULL,
	"total_score" numeric(8, 1) NOT NULL,
	"question_type_summary" jsonb NOT NULL,
	"version_status" "organization_training_version_status" DEFAULT 'published' NOT NULL,
	"published_at" timestamp with time zone NOT NULL,
	"taken_down_at" timestamp with time zone,
	"takedown_reason" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "organization_training_version" ADD CONSTRAINT "fk_organization_training_version_organization" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organization_training_version" ADD CONSTRAINT "fk_organization_training_version_org_auth" FOREIGN KEY ("org_auth_id") REFERENCES "public"."org_auth"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "udx_organization_training_version_public_id" ON "organization_training_version" USING btree ("public_id");--> statement-breakpoint
CREATE UNIQUE INDEX "udx_organization_training_version_draft_version" ON "organization_training_version" USING btree ("draft_public_id","version_number");--> statement-breakpoint
CREATE INDEX "idx_organization_training_version_organization_id" ON "organization_training_version" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "idx_organization_training_version_org_auth_id" ON "organization_training_version" USING btree ("org_auth_id");--> statement-breakpoint
CREATE INDEX "idx_organization_training_version_org_published_at" ON "organization_training_version" USING btree ("organization_public_id","published_at");--> statement-breakpoint
CREATE INDEX "idx_organization_training_version_version_status" ON "organization_training_version" USING btree ("version_status");--> statement-breakpoint
CREATE INDEX "idx_organization_training_version_profession_level_subject" ON "organization_training_version" USING btree ("profession","level","subject");