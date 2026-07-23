CREATE TABLE "organization_training_version_recipient" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "organization_training_version_recipient_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"organization_training_version_id" bigint NOT NULL,
	"employee_public_id" text NOT NULL,
	"organization_public_id" text NOT NULL,
	"authorization_public_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "organization_training_version" ADD COLUMN "recipient_snapshot_schema_version" integer;--> statement-breakpoint
ALTER TABLE "organization_training_version" ADD COLUMN "recipient_snapshot_captured_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "organization_training_version" ADD COLUMN "recipient_snapshot_count" integer;--> statement-breakpoint
ALTER TABLE "organization_training_version" ADD COLUMN "recipient_snapshot_digest" text;--> statement-breakpoint
ALTER TABLE "organization_training_version_recipient" ADD CONSTRAINT "fk_organization_training_version_recipient_version" FOREIGN KEY ("organization_training_version_id") REFERENCES "public"."organization_training_version"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "udx_organization_training_version_recipient_version_employee" ON "organization_training_version_recipient" USING btree ("organization_training_version_id","employee_public_id");--> statement-breakpoint
CREATE INDEX "idx_organization_training_version_recipient_version_id" ON "organization_training_version_recipient" USING btree ("organization_training_version_id");--> statement-breakpoint
CREATE INDEX "idx_organization_training_version_recipient_org_employee" ON "organization_training_version_recipient" USING btree ("organization_public_id","employee_public_id");--> statement-breakpoint
ALTER TABLE "organization_training_version" ADD CONSTRAINT "chk_organization_training_version_recipient_snapshot" CHECK ((
        "organization_training_version"."recipient_snapshot_schema_version" is null
        and "organization_training_version"."recipient_snapshot_captured_at" is null
        and "organization_training_version"."recipient_snapshot_count" is null
        and "organization_training_version"."recipient_snapshot_digest" is null
      ) or (
        "organization_training_version"."recipient_snapshot_schema_version" = 1
        and "organization_training_version"."recipient_snapshot_captured_at" is not null
        and "organization_training_version"."recipient_snapshot_count" is not null
        and "organization_training_version"."recipient_snapshot_count" >= 0
        and "organization_training_version"."recipient_snapshot_digest" ~ '^[0-9a-f]{64}$'
      ));