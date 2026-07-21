import { sql, type SQL, type SQLWrapper } from "drizzle-orm";
import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";

import * as databaseSchema from "@/db/schema";

export type OrganizationScopeDatabase = PostgresJsDatabase<
  typeof databaseSchema
>;

type SqlValue = SQLWrapper | number | string;

type DrizzleSqlExecutor = {
  execute<TRow extends Record<string, unknown>>(query: SQL): Promise<TRow[]>;
};

export const MAX_ORGANIZATION_TREE_DEPTH = 4;

export function createOrganizationIsSelfOrDescendantCondition(input: {
  ancestorOrganizationId: SqlValue;
  organizationId: SqlValue;
}): SQL<boolean> {
  return sql<boolean>`exists (
    with recursive organization_ancestor as (
      select
        scoped_organization.id,
        scoped_organization.parent_organization_id,
        array[scoped_organization.id]::bigint[] as visited_organization_ids,
        0 as ancestor_depth
      from organization as scoped_organization
      where scoped_organization.id = ${input.organizationId}
      union all
      select
        parent_organization.id,
        parent_organization.parent_organization_id,
        organization_ancestor.visited_organization_ids || parent_organization.id,
        organization_ancestor.ancestor_depth + 1
      from organization_ancestor
      inner join organization as parent_organization
        on parent_organization.id = organization_ancestor.parent_organization_id
      where organization_ancestor.ancestor_depth < ${MAX_ORGANIZATION_TREE_DEPTH - 1}
        and not parent_organization.id = any(organization_ancestor.visited_organization_ids)
    )
    select 1
    from organization_ancestor as scoped_path
    where scoped_path.id = ${input.ancestorOrganizationId}
      and exists (
        select 1
        from organization_ancestor as tree_integrity
        where tree_integrity.parent_organization_id is null
      )
  )`;
}

export function createOrgAuthCoversOrganizationCondition(input: {
  authScopeType: SqlValue;
  orgAuthId: SqlValue;
  organizationId: SqlValue;
  purchaserOrganizationId: SqlValue;
}): SQL<boolean> {
  return sql<boolean>`(
    (
      ${input.authScopeType} = 'specified_nodes'
      and exists (
        select 1
        from org_auth_organization as explicit_org_auth_organization
        where explicit_org_auth_organization.org_auth_id = ${input.orgAuthId}
          and explicit_org_auth_organization.organization_id = ${input.organizationId}
      )
    )
    or
    (
      ${input.authScopeType} = 'current_and_descendants'
      and exists (
        with recursive organization_ancestor as (
          select
            scoped_organization.id,
            scoped_organization.parent_organization_id,
            array[scoped_organization.id]::bigint[] as visited_organization_ids,
            0 as ancestor_depth
          from organization as scoped_organization
          where scoped_organization.id = ${input.organizationId}
          union all
          select
            parent_organization.id,
            parent_organization.parent_organization_id,
            organization_ancestor.visited_organization_ids || parent_organization.id,
            organization_ancestor.ancestor_depth + 1
          from organization_ancestor
          inner join organization as parent_organization
            on parent_organization.id = organization_ancestor.parent_organization_id
          where organization_ancestor.ancestor_depth < ${MAX_ORGANIZATION_TREE_DEPTH - 1}
            and not parent_organization.id = any(organization_ancestor.visited_organization_ids)
        )
        select 1
        from organization_ancestor as purchaser_path
        where purchaser_path.id = ${input.purchaserOrganizationId}
          and exists (
            select 1
            from organization_ancestor as tree_integrity
            where tree_integrity.parent_organization_id is null
          )
      )
    )
  )`;
}

export async function lockOrganizationScopeMutation(
  database: OrganizationScopeDatabase,
): Promise<void> {
  await database.execute(
    sql`select pg_advisory_xact_lock(200110, 1) as organization_scope_lock`,
  );
}

export async function hasCurrentOrgAuthOverlap(
  database: OrganizationScopeDatabase,
  organizationIds?: number[],
): Promise<boolean> {
  const organizationFilter =
    organizationIds !== undefined && organizationIds.length > 0
      ? sql`and left_coverage.organization_id in (${sql.join(
          organizationIds.map((organizationId) => sql`${organizationId}`),
          sql`, `,
        )})`
      : sql``;
  const rows = await (database as unknown as DrizzleSqlExecutor).execute<{
    value: boolean;
  }>(sql`
    with recursive organization_ancestor as (
      select
        scoped_organization.id as descendant_organization_id,
        scoped_organization.id as ancestor_organization_id,
        scoped_organization.parent_organization_id,
        array[scoped_organization.id]::bigint[] as visited_organization_ids,
        0 as ancestor_depth
      from organization as scoped_organization
      union all
      select
        organization_ancestor.descendant_organization_id,
        parent_organization.id,
        parent_organization.parent_organization_id,
        organization_ancestor.visited_organization_ids || parent_organization.id,
        organization_ancestor.ancestor_depth + 1
      from organization_ancestor
      inner join organization as parent_organization
        on parent_organization.id = organization_ancestor.parent_organization_id
      where organization_ancestor.ancestor_depth < ${MAX_ORGANIZATION_TREE_DEPTH - 1}
        and not parent_organization.id = any(organization_ancestor.visited_organization_ids)
    ), org_auth_coverage as (
      select
        org_auth.id as org_auth_id,
        org_auth_organization.organization_id
      from org_auth
      inner join org_auth_organization
        on org_auth_organization.org_auth_id = org_auth.id
      where org_auth.auth_scope_type = 'specified_nodes'
      union
      select
        org_auth.id as org_auth_id,
        organization_ancestor.descendant_organization_id as organization_id
      from org_auth
      inner join organization_ancestor
        on organization_ancestor.ancestor_organization_id = org_auth.purchaser_organization_id
      where org_auth.auth_scope_type = 'current_and_descendants'
        and exists (
          select 1
          from organization_ancestor as tree_integrity
          where tree_integrity.descendant_organization_id = organization_ancestor.descendant_organization_id
            and tree_integrity.parent_organization_id is null
        )
    )
    select exists (
      select 1
      from org_auth as left_org_auth
      inner join org_auth as right_org_auth
        on left_org_auth.id < right_org_auth.id
        and left_org_auth.profession = right_org_auth.profession
        and left_org_auth.level = right_org_auth.level
        and left_org_auth.starts_at < right_org_auth.expires_at
        and left_org_auth.expires_at > right_org_auth.starts_at
      inner join org_auth_coverage as left_coverage
        on left_coverage.org_auth_id = left_org_auth.id
      inner join org_auth_coverage as right_coverage
        on right_coverage.org_auth_id = right_org_auth.id
        and right_coverage.organization_id = left_coverage.organization_id
      where left_org_auth.status = 'active'
        and right_org_auth.status = 'active'
        ${organizationFilter}
    ) as value
  `);

  return rows[0]?.value === true;
}
