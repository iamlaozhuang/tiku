CREATE TABLE "admin_role_assignment" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "admin_role_assignment_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"admin_id" bigint NOT NULL,
	"admin_role" "admin_role" NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "admin" ADD COLUMN "login_failed_count" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "admin" ADD COLUMN "locked_until_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "admin" ADD COLUMN "disabled_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "admin_role_assignment" ADD CONSTRAINT "admin_role_assignment_admin_id_admin_id_fk" FOREIGN KEY ("admin_id") REFERENCES "public"."admin"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "udx_admin_role_assignment_admin_id_admin_role" ON "admin_role_assignment" USING btree ("admin_id","admin_role");--> statement-breakpoint
INSERT INTO "admin_role_assignment" ("admin_id", "admin_role", "created_at")
SELECT "id", "admin_role", "created_at"
FROM "admin"
ON CONFLICT ("admin_id", "admin_role") DO NOTHING;--> statement-breakpoint
CREATE INDEX "idx_admin_role_assignment_admin_id" ON "admin_role_assignment" USING btree ("admin_id");--> statement-breakpoint
CREATE INDEX "idx_admin_role_assignment_admin_role" ON "admin_role_assignment" USING btree ("admin_role");--> statement-breakpoint
DO $$
BEGIN
	IF EXISTS (
		SELECT 1
		FROM "admin_organization" ao
		WHERE NOT EXISTS (
			SELECT 1
			FROM "admin_role_assignment" ara
			WHERE ara."admin_id" = ao."admin_id"
				AND ara."admin_role" IN ('org_standard_admin', 'org_advanced_admin')
		)
	) THEN
		RAISE EXCEPTION 'RC-01 migration blocked: admin_organization contains an admin without an organization admin role';
	END IF;
END $$;--> statement-breakpoint
CREATE UNIQUE INDEX "udx_admin_organization_admin_id" ON "admin_organization" USING btree ("admin_id");
