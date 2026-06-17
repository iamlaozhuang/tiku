CREATE TYPE "public"."organization_training_answer_status" AS ENUM('in_progress', 'submitted', 'read_only');--> statement-breakpoint
CREATE TABLE "organization_training_answer" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "organization_training_answer_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"public_id" text NOT NULL,
	"organization_training_version_id" bigint NOT NULL,
	"organization_training_version_public_id" text NOT NULL,
	"employee_id" bigint NOT NULL,
	"employee_public_id" text NOT NULL,
	"organization_id" bigint NOT NULL,
	"organization_public_id" text NOT NULL,
	"organization_training_answer_status" "organization_training_answer_status" DEFAULT 'in_progress' NOT NULL,
	"score" numeric(8, 1),
	"total_score" numeric(8, 1) NOT NULL,
	"submitted_at" timestamp with time zone,
	"answer_organization_snapshot" jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "organization_training_answer" ADD CONSTRAINT "fk_organization_training_answer_version" FOREIGN KEY ("organization_training_version_id") REFERENCES "public"."organization_training_version"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organization_training_answer" ADD CONSTRAINT "fk_organization_training_answer_employee" FOREIGN KEY ("employee_id") REFERENCES "public"."employee"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organization_training_answer" ADD CONSTRAINT "fk_organization_training_answer_organization" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "udx_organization_training_answer_public_id" ON "organization_training_answer" USING btree ("public_id");--> statement-breakpoint
CREATE UNIQUE INDEX "udx_organization_training_answer_version_employee" ON "organization_training_answer" USING btree ("organization_training_version_id","employee_id");--> statement-breakpoint
CREATE INDEX "idx_organization_training_answer_version_id" ON "organization_training_answer" USING btree ("organization_training_version_id");--> statement-breakpoint
CREATE INDEX "idx_organization_training_answer_employee_id" ON "organization_training_answer" USING btree ("employee_id");--> statement-breakpoint
CREATE INDEX "idx_organization_training_answer_org_submitted_at" ON "organization_training_answer" USING btree ("organization_id","submitted_at");--> statement-breakpoint
CREATE INDEX "idx_organization_training_answer_status_submitted_at" ON "organization_training_answer" USING btree ("organization_training_answer_status","submitted_at");