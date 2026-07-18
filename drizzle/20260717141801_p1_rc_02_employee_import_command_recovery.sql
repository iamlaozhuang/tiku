CREATE TYPE "public"."credential_distribution_status" AS ENUM('pending', 'not_required', 'open', 'confirmed');--> statement-breakpoint
CREATE TYPE "public"."employee_import_command_kind" AS ENUM('single_create', 'batch_import');--> statement-breakpoint
CREATE TYPE "public"."employee_import_credential_mode" AS ENUM('generated', 'provided', 'existing_account');--> statement-breakpoint
CREATE TYPE "public"."employee_import_outcome_kind" AS ENUM('created', 'bound');--> statement-breakpoint
CREATE TYPE "public"."employee_import_rejection_reason" AS ENUM('invalid_row', 'duplicate_phone', 'organization_not_found', 'cross_domain_conflict', 'cross_organization_conflict', 'disabled_account', 'current_authorization_insufficient', 'quota_insufficient');--> statement-breakpoint
CREATE TYPE "public"."employee_import_row_status" AS ENUM('pending', 'succeeded', 'rejected');--> statement-breakpoint
CREATE TYPE "public"."employee_import_status" AS ENUM('processing', 'completed');--> statement-breakpoint
CREATE TYPE "public"."employee_import_warning_reason" AS ENUM('initial_password_not_applied_to_existing_user');--> statement-breakpoint
CREATE TABLE "employee_import_command" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "employee_import_command_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"public_id" text NOT NULL,
	"actor_admin_id" bigint NOT NULL,
	"organization_id" bigint NOT NULL,
	"command_kind" "employee_import_command_kind" NOT NULL,
	"idempotency_scope_hash" text NOT NULL,
	"request_hash" text NOT NULL,
	"row_count" integer NOT NULL,
	"employee_import_status" "employee_import_status" DEFAULT 'processing' NOT NULL,
	"credential_distribution_status" "credential_distribution_status" DEFAULT 'pending' NOT NULL,
	"credential_revision" integer DEFAULT 0 NOT NULL,
	"current_issue_public_id" text,
	"completed_at" timestamp with time zone,
	"distribution_confirmed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "chk_employee_import_command_row_count" CHECK ("employee_import_command"."row_count" between 1 and 500
        and ("employee_import_command"."command_kind" <> 'single_create' or "employee_import_command"."row_count" = 1)),
	CONSTRAINT "chk_employee_import_command_credential_revision" CHECK ("employee_import_command"."credential_revision" >= 0),
	CONSTRAINT "chk_employee_import_command_state" CHECK ((
        "employee_import_command"."employee_import_status" = 'processing'
        and "employee_import_command"."completed_at" is null
        and "employee_import_command"."credential_distribution_status" = 'pending'
        and "employee_import_command"."credential_revision" = 0
        and "employee_import_command"."current_issue_public_id" is null
        and "employee_import_command"."distribution_confirmed_at" is null
      ) or (
        "employee_import_command"."employee_import_status" = 'completed'
        and "employee_import_command"."completed_at" is not null
        and "employee_import_command"."credential_distribution_status" <> 'pending'
      )),
	CONSTRAINT "chk_employee_import_command_distribution_state" CHECK ((
        "employee_import_command"."credential_distribution_status" = 'pending'
        and "employee_import_command"."employee_import_status" = 'processing'
        and "employee_import_command"."credential_revision" = 0
        and "employee_import_command"."current_issue_public_id" is null
        and "employee_import_command"."distribution_confirmed_at" is null
      ) or (
        "employee_import_command"."credential_distribution_status" = 'not_required'
        and "employee_import_command"."employee_import_status" = 'completed'
        and "employee_import_command"."credential_revision" = 0
        and "employee_import_command"."current_issue_public_id" is null
        and "employee_import_command"."distribution_confirmed_at" is null
      ) or (
        "employee_import_command"."credential_distribution_status" = 'open'
        and "employee_import_command"."employee_import_status" = 'completed'
        and "employee_import_command"."distribution_confirmed_at" is null
        and (
          ("employee_import_command"."credential_revision" = 0 and "employee_import_command"."current_issue_public_id" is null)
          or
          ("employee_import_command"."credential_revision" > 0 and "employee_import_command"."current_issue_public_id" is not null)
        )
      ) or (
        "employee_import_command"."credential_distribution_status" = 'confirmed'
        and "employee_import_command"."employee_import_status" = 'completed'
        and "employee_import_command"."credential_revision" > 0
        and "employee_import_command"."current_issue_public_id" is not null
        and "employee_import_command"."distribution_confirmed_at" is not null
      ))
);
--> statement-breakpoint
CREATE TABLE "employee_import_row" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "employee_import_row_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"public_id" text NOT NULL,
	"employee_import_command_id" bigint NOT NULL,
	"row_number" integer NOT NULL,
	"row_request_hash" text NOT NULL,
	"employee_import_row_status" "employee_import_row_status" DEFAULT 'pending' NOT NULL,
	"outcome_kind" "employee_import_outcome_kind",
	"rejection_reason" "employee_import_rejection_reason",
	"warning_reason" "employee_import_warning_reason",
	"credential_mode" "employee_import_credential_mode",
	"employee_id" bigint,
	"credential_updated_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "chk_employee_import_row_number" CHECK ("employee_import_row"."row_number" > 0),
	CONSTRAINT "chk_employee_import_row_state" CHECK ((
        "employee_import_row"."employee_import_row_status" = 'pending'
        and "employee_import_row"."outcome_kind" is null
        and "employee_import_row"."rejection_reason" is null
        and "employee_import_row"."warning_reason" is null
        and "employee_import_row"."credential_mode" is null
        and "employee_import_row"."employee_id" is null
        and "employee_import_row"."credential_updated_at" is null
      ) or (
        "employee_import_row"."employee_import_row_status" = 'rejected'
        and "employee_import_row"."outcome_kind" is null
        and "employee_import_row"."rejection_reason" is not null
        and "employee_import_row"."warning_reason" is null
        and "employee_import_row"."credential_mode" is null
        and "employee_import_row"."employee_id" is null
        and "employee_import_row"."credential_updated_at" is null
      ) or (
        "employee_import_row"."employee_import_row_status" = 'succeeded'
        and "employee_import_row"."outcome_kind" is not null
        and "employee_import_row"."rejection_reason" is null
        and "employee_import_row"."credential_mode" is not null
        and "employee_import_row"."employee_id" is not null
        and (
          ("employee_import_row"."outcome_kind" = 'created' and "employee_import_row"."credential_mode" in ('generated', 'provided'))
          or
          ("employee_import_row"."outcome_kind" = 'bound' and "employee_import_row"."credential_mode" = 'existing_account')
        )
        and (
          "employee_import_row"."warning_reason" is null
          or (
            "employee_import_row"."outcome_kind" = 'bound'
            and "employee_import_row"."credential_mode" = 'existing_account'
          )
        )
        and (
          ("employee_import_row"."credential_mode" = 'generated' and "employee_import_row"."credential_updated_at" is not null)
          or
          ("employee_import_row"."credential_mode" <> 'generated' and "employee_import_row"."credential_updated_at" is null)
        )
      ))
);
--> statement-breakpoint
ALTER TABLE "employee_import_command" ADD CONSTRAINT "employee_import_command_actor_admin_id_admin_id_fk" FOREIGN KEY ("actor_admin_id") REFERENCES "public"."admin"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "employee_import_command" ADD CONSTRAINT "employee_import_command_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "employee_import_row" ADD CONSTRAINT "employee_import_row_employee_id_employee_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."employee"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "employee_import_row" ADD CONSTRAINT "fk_employee_import_row_command" FOREIGN KEY ("employee_import_command_id") REFERENCES "public"."employee_import_command"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "udx_employee_import_command_public_id" ON "employee_import_command" USING btree ("public_id");--> statement-breakpoint
CREATE UNIQUE INDEX "udx_employee_import_command_idempotency_scope_hash" ON "employee_import_command" USING btree ("idempotency_scope_hash");--> statement-breakpoint
CREATE INDEX "idx_employee_import_command_actor_admin_id" ON "employee_import_command" USING btree ("actor_admin_id");--> statement-breakpoint
CREATE INDEX "idx_employee_import_command_organization_id" ON "employee_import_command" USING btree ("organization_id");--> statement-breakpoint
CREATE UNIQUE INDEX "udx_employee_import_row_public_id" ON "employee_import_row" USING btree ("public_id");--> statement-breakpoint
CREATE UNIQUE INDEX "udx_employee_import_row_employee_import_command_id_row_number" ON "employee_import_row" USING btree ("employee_import_command_id","row_number");--> statement-breakpoint
CREATE INDEX "idx_employee_import_row_employee_import_command_id" ON "employee_import_row" USING btree ("employee_import_command_id");--> statement-breakpoint
CREATE INDEX "idx_employee_import_row_employee_id" ON "employee_import_row" USING btree ("employee_id");