CREATE TYPE "public"."auth_upgrade_source_type" AS ENUM('redeem_code', 'ops_manual');--> statement-breakpoint
CREATE TYPE "public"."auth_upgrade_status" AS ENUM('active', 'expired', 'revoked');--> statement-breakpoint
CREATE TYPE "public"."authorization_edition" AS ENUM('standard', 'advanced');--> statement-breakpoint
CREATE TYPE "public"."redeem_code_type" AS ENUM('personal_standard_activation', 'personal_advanced_activation', 'edition_upgrade');--> statement-breakpoint
CREATE TABLE "auth_upgrade" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "auth_upgrade_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"public_id" text NOT NULL,
	"personal_auth_id" bigint,
	"org_auth_id" bigint,
	"target_edition" "authorization_edition" DEFAULT 'advanced' NOT NULL,
	"source_type" "auth_upgrade_source_type" NOT NULL,
	"redeem_code_id" bigint,
	"ops_reference" text,
	"ops_note" text,
	"operator_admin_id" bigint,
	"starts_at" timestamp with time zone NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"revoked_at" timestamp with time zone,
	"revoked_by_admin_id" bigint,
	"status" "auth_upgrade_status" DEFAULT 'active' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "chk_auth_upgrade_exactly_one_source_auth" CHECK ((("personal_auth_id" is not null and "org_auth_id" is null) or ("personal_auth_id" is null and "org_auth_id" is not null)))
);
--> statement-breakpoint
ALTER TABLE "org_auth" ADD COLUMN "edition" "authorization_edition" DEFAULT 'standard' NOT NULL;--> statement-breakpoint
ALTER TABLE "personal_auth" ADD COLUMN "edition" "authorization_edition" DEFAULT 'standard' NOT NULL;--> statement-breakpoint
ALTER TABLE "redeem_code" ADD COLUMN "redeem_code_type" "redeem_code_type" DEFAULT 'personal_standard_activation' NOT NULL;--> statement-breakpoint
ALTER TABLE "auth_upgrade" ADD CONSTRAINT "auth_upgrade_personal_auth_id_personal_auth_id_fk" FOREIGN KEY ("personal_auth_id") REFERENCES "public"."personal_auth"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "auth_upgrade" ADD CONSTRAINT "auth_upgrade_org_auth_id_org_auth_id_fk" FOREIGN KEY ("org_auth_id") REFERENCES "public"."org_auth"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "auth_upgrade" ADD CONSTRAINT "auth_upgrade_redeem_code_id_redeem_code_id_fk" FOREIGN KEY ("redeem_code_id") REFERENCES "public"."redeem_code"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "auth_upgrade" ADD CONSTRAINT "auth_upgrade_operator_admin_id_admin_id_fk" FOREIGN KEY ("operator_admin_id") REFERENCES "public"."admin"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "auth_upgrade" ADD CONSTRAINT "auth_upgrade_revoked_by_admin_id_admin_id_fk" FOREIGN KEY ("revoked_by_admin_id") REFERENCES "public"."admin"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "udx_auth_upgrade_public_id" ON "auth_upgrade" USING btree ("public_id");--> statement-breakpoint
CREATE UNIQUE INDEX "udx_auth_upgrade_redeem_code_id" ON "auth_upgrade" USING btree ("redeem_code_id");--> statement-breakpoint
CREATE INDEX "idx_auth_upgrade_personal_auth_id" ON "auth_upgrade" USING btree ("personal_auth_id");--> statement-breakpoint
CREATE INDEX "idx_auth_upgrade_org_auth_id" ON "auth_upgrade" USING btree ("org_auth_id");--> statement-breakpoint
CREATE INDEX "idx_auth_upgrade_source_type" ON "auth_upgrade" USING btree ("source_type");--> statement-breakpoint
CREATE INDEX "idx_auth_upgrade_status" ON "auth_upgrade" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_auth_upgrade_expires_at" ON "auth_upgrade" USING btree ("expires_at");