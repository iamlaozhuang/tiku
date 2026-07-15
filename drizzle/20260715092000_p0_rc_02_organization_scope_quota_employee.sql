CREATE TABLE "employee_org_auth" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "employee_org_auth_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"employee_id" bigint NOT NULL,
	"org_auth_id" bigint NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "organization" ADD COLUMN "revision" integer DEFAULT 1 NOT NULL;--> statement-breakpoint
ALTER TABLE "employee_org_auth" ADD CONSTRAINT "employee_org_auth_employee_id_employee_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."employee"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "employee_org_auth" ADD CONSTRAINT "employee_org_auth_org_auth_id_org_auth_id_fk" FOREIGN KEY ("org_auth_id") REFERENCES "public"."org_auth"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "udx_employee_org_auth_employee_id_org_auth_id" ON "employee_org_auth" USING btree ("employee_id","org_auth_id");--> statement-breakpoint
CREATE INDEX "idx_employee_org_auth_employee_id" ON "employee_org_auth" USING btree ("employee_id");--> statement-breakpoint
CREATE INDEX "idx_employee_org_auth_org_auth_id" ON "employee_org_auth" USING btree ("org_auth_id");--> statement-breakpoint
-- Backfill only deterministically provable quota occupants. Existing active
-- employees beyond account_quota remain unreserved and therefore fail closed.
WITH RECURSIVE organization_ancestor AS (
	SELECT
		organization.id AS descendant_organization_id,
		organization.id AS ancestor_organization_id,
		organization.parent_organization_id,
		ARRAY[organization.id]::bigint[] AS visited_organization_ids,
		0 AS ancestor_depth
	FROM "organization"
	UNION ALL
	SELECT
		organization_ancestor.descendant_organization_id,
		parent_organization.id AS ancestor_organization_id,
		parent_organization.parent_organization_id,
		organization_ancestor.visited_organization_ids || parent_organization.id,
		organization_ancestor.ancestor_depth + 1
	FROM organization_ancestor
	INNER JOIN "organization" AS parent_organization
		ON parent_organization.id = organization_ancestor.parent_organization_id
	WHERE organization_ancestor.ancestor_depth < 3
		AND NOT parent_organization.id = ANY(organization_ancestor.visited_organization_ids)
), eligible_employee_scope AS (
	SELECT
		employee.id AS employee_id,
		employee.created_at AS employee_created_at,
		org_auth.id AS org_auth_id,
		org_auth.account_quota
	FROM "employee"
	INNER JOIN "user" ON "user".id = employee.user_id
	INNER JOIN "org_auth" ON (
		(
			org_auth.auth_scope_type = 'specified_nodes'
			AND EXISTS (
				SELECT 1
				FROM "org_auth_organization"
				WHERE org_auth_organization.org_auth_id = org_auth.id
					AND org_auth_organization.organization_id = employee.organization_id
			)
		)
		OR
		(
			org_auth.auth_scope_type = 'current_and_descendants'
			AND EXISTS (
				SELECT 1
				FROM organization_ancestor
				WHERE organization_ancestor.descendant_organization_id = employee.organization_id
					AND organization_ancestor.ancestor_organization_id = org_auth.purchaser_organization_id
					AND EXISTS (
						SELECT 1
						FROM organization_ancestor AS tree_integrity
						WHERE tree_integrity.descendant_organization_id = employee.organization_id
							AND tree_integrity.parent_organization_id IS NULL
					)
			)
		)
	)
	WHERE "user".user_type = 'employee'
		AND "user".status = 'active'
		AND org_auth.status = 'active'
		AND org_auth.expires_at > now()
), ranked_employee_scope AS (
	SELECT
		eligible_employee_scope.employee_id,
		eligible_employee_scope.org_auth_id,
		eligible_employee_scope.account_quota,
		row_number() over (
			PARTITION BY eligible_employee_scope.org_auth_id
			ORDER BY eligible_employee_scope.employee_created_at, eligible_employee_scope.employee_id
		) AS quota_rank
	FROM eligible_employee_scope
)
INSERT INTO "employee_org_auth" ("employee_id", "org_auth_id")
SELECT employee_id, org_auth_id
FROM ranked_employee_scope
WHERE quota_rank <= account_quota;--> statement-breakpoint
UPDATE "org_auth"
SET
	"used_quota" = reservation_summary.used_quota,
	"updated_at" = now()
FROM (
	SELECT
		org_auth.id AS org_auth_id,
		count(employee_org_auth.id)::integer AS used_quota
	FROM "org_auth"
	LEFT JOIN "employee_org_auth"
		ON employee_org_auth.org_auth_id = org_auth.id
	WHERE org_auth.status = 'active'
		AND org_auth.expires_at > now()
	GROUP BY org_auth.id
) AS reservation_summary
WHERE org_auth.id = reservation_summary.org_auth_id;--> statement-breakpoint
ALTER TABLE "organization" ADD CONSTRAINT "chk_organization_revision_positive" CHECK ("organization"."revision" > 0);
