import {
  and,
  asc,
  count,
  desc,
  eq,
  gt,
  isNull,
  lte,
  or,
  sql,
} from "drizzle-orm";
import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";

import * as databaseSchema from "@/db/schema";
import type { OrganizationPortalOverviewDto } from "../contracts/organization-portal-overview-contract";
import { maskPhoneForDisplay } from "../mappers/phone-display-mapper";
import { createRuntimeDatabaseForSchema } from "./runtime-database";
import type {
  OrganizationPortalOverviewRepository,
  OrganizationPortalOverviewRepositoryInput,
} from "../services/organization-portal-overview-service";

type OrganizationPortalOverviewRuntimeDatabase = PostgresJsDatabase<
  typeof databaseSchema
>;

export type OrganizationPortalOverviewRepositoryOptions = {
  createDatabase?: () => OrganizationPortalOverviewRuntimeDatabase;
};

const {
  authUpgrade,
  employee,
  orgAuth,
  orgAuthOrganization,
  organization,
  user,
} = databaseSchema;

function createLazyDatabaseGetter(
  createDatabase: () => OrganizationPortalOverviewRuntimeDatabase,
): () => OrganizationPortalOverviewRuntimeDatabase {
  let cachedDatabase: OrganizationPortalOverviewRuntimeDatabase | undefined;

  return () => {
    cachedDatabase ??= createDatabase();

    return cachedDatabase;
  };
}

export function createPostgresOrganizationPortalOverviewRepository(
  options: OrganizationPortalOverviewRepositoryOptions = {},
): OrganizationPortalOverviewRepository {
  const getDatabase = createLazyDatabaseGetter(
    options.createDatabase ?? createLocalRuntimeDatabase,
  );

  return {
    async readOverview(input) {
      return readOrganizationPortalOverview(getDatabase(), input);
    },
  };
}

async function readOrganizationPortalOverview(
  database: OrganizationPortalOverviewRuntimeDatabase,
  input: OrganizationPortalOverviewRepositoryInput,
): Promise<OrganizationPortalOverviewDto | null> {
  const [organizationRow] = await database
    .select({
      id: organization.id,
      display_name: organization.name,
      org_tier: organization.org_tier,
      status: organization.status,
    })
    .from(organization)
    .where(eq(organization.public_id, input.organizationPublicId))
    .limit(1);

  if (organizationRow === undefined) {
    return null;
  }

  const employeeSummary = await readEmployeeSummary(database, {
    now: input.now,
    organizationId: organizationRow.id,
  });
  const employees = await readEmployeePreview(database, organizationRow.id);
  const authorization = await readAuthorizationOverview(database, {
    authorizationPublicId: input.authorizationPublicId,
    now: input.now,
    organizationId: organizationRow.id,
  });

  return {
    organization: {
      displayName: organizationRow.display_name,
      orgTier: organizationRow.org_tier,
      status: organizationRow.status,
    },
    employeeSummary,
    employees,
    authorization,
    boundary: {
      isReadonly: true,
      mutationOwnerLabel: "平台运营",
      redactionStatus: "summary_only",
    },
    updatedAt: input.updatedAt,
  };
}

async function readEmployeeSummary(
  database: OrganizationPortalOverviewRuntimeDatabase,
  input: {
    now: Date;
    organizationId: number;
  },
): Promise<OrganizationPortalOverviewDto["employeeSummary"]> {
  const lockedComparisonTimestamp = input.now.toISOString();
  const [row] = await database
    .select({
      total: count(),
      active: sql<number>`
        count(*) filter (where ${user.status} = 'active')::int
      `,
      disabled: sql<number>`
        count(*) filter (where ${user.status} = 'disabled')::int
      `,
      locked: sql<number>`
        count(*) filter (
          where ${user.locked_until_at} is not null
            and ${user.locked_until_at} > ${lockedComparisonTimestamp}::timestamptz
        )::int
      `,
    })
    .from(employee)
    .innerJoin(user, eq(user.id, employee.user_id))
    .where(eq(employee.organization_id, input.organizationId));

  return {
    total: row?.total ?? 0,
    active: row?.active ?? 0,
    disabled: row?.disabled ?? 0,
    locked: row?.locked ?? 0,
  };
}

async function readEmployeePreview(
  database: OrganizationPortalOverviewRuntimeDatabase,
  organizationId: number,
): Promise<OrganizationPortalOverviewDto["employees"]> {
  const rows = await database
    .select({
      name: user.name,
      phone: user.phone,
      status: user.status,
    })
    .from(employee)
    .innerJoin(user, eq(user.id, employee.user_id))
    .where(
      and(
        eq(employee.organization_id, organizationId),
        eq(user.user_type, "employee"),
      ),
    )
    .orderBy(asc(user.name), asc(user.phone))
    .limit(5);

  return rows.map((row) => ({
    employeeDisplayName: row.name,
    phoneMasked: maskPhoneForDisplay(row.phone),
    status: row.status,
  }));
}

async function readAuthorizationOverview(
  database: OrganizationPortalOverviewRuntimeDatabase,
  input: {
    authorizationPublicId: string | null;
    now: Date;
    organizationId: number;
  },
): Promise<OrganizationPortalOverviewDto["authorization"]> {
  const authIdentityCondition =
    input.authorizationPublicId === null
      ? undefined
      : eq(orgAuth.public_id, input.authorizationPublicId);
  const activeFallbackCondition =
    input.authorizationPublicId === null
      ? and(
          eq(orgAuth.status, "active"),
          lte(orgAuth.starts_at, input.now),
          gt(orgAuth.expires_at, input.now),
        )
      : undefined;
  const [row] = await database
    .select({
      id: orgAuth.id,
      name: orgAuth.name,
      auth_scope_type: orgAuth.auth_scope_type,
      source_edition: orgAuth.edition,
      effective_edition: sql<"standard" | "advanced">`
        case
          when ${orgAuth.edition} = 'advanced' or ${authUpgrade.id} is not null
          then 'advanced'
          else 'standard'
        end
      `,
      profession: orgAuth.profession,
      level: orgAuth.level,
      account_quota: orgAuth.account_quota,
      used_quota: orgAuth.used_quota,
      starts_at: orgAuth.starts_at,
      expires_at: orgAuth.expires_at,
      status: orgAuth.status,
      upgrade_status: authUpgrade.status,
    })
    .from(orgAuth)
    .leftJoin(
      orgAuthOrganization,
      eq(orgAuthOrganization.org_auth_id, orgAuth.id),
    )
    .leftJoin(
      authUpgrade,
      and(
        eq(authUpgrade.org_auth_id, orgAuth.id),
        eq(authUpgrade.status, "active"),
        eq(authUpgrade.target_edition, "advanced"),
        isNull(authUpgrade.revoked_at),
        lte(authUpgrade.starts_at, input.now),
        gt(authUpgrade.expires_at, input.now),
      ),
    )
    .where(
      and(
        or(
          eq(orgAuth.purchaser_organization_id, input.organizationId),
          eq(orgAuthOrganization.organization_id, input.organizationId),
        )!,
        authIdentityCondition,
        activeFallbackCondition,
      ),
    )
    .orderBy(
      sql`
        case
          when ${orgAuth.edition} = 'advanced' or ${authUpgrade.id} is not null
          then 0
          else 1
        end
      `,
      desc(orgAuth.expires_at),
    )
    .limit(1);

  if (row === undefined) {
    return null;
  }

  const [coveredOrganizationCountRow] = await database
    .select({ value: count() })
    .from(orgAuthOrganization)
    .where(eq(orgAuthOrganization.org_auth_id, row.id));
  const organizationCount = Math.max(
    coveredOrganizationCountRow?.value ?? 0,
    1,
  );

  return {
    packageName: row.name,
    sourceEdition: row.source_edition,
    effectiveEdition: row.effective_edition,
    status: row.status,
    startsAt: row.starts_at.toISOString(),
    expiresAt: row.expires_at.toISOString(),
    accountQuota: row.account_quota,
    usedQuota: row.used_quota,
    availableQuota: Math.max(row.account_quota - row.used_quota, 0),
    authScopeType: row.auth_scope_type,
    scopes: [
      {
        profession: row.profession,
        level: row.level,
        subject: null,
        organizationCount,
      },
    ],
    upgradeStatus: row.upgrade_status ?? "none",
  };
}

function createLocalRuntimeDatabase(): OrganizationPortalOverviewRuntimeDatabase {
  return createRuntimeDatabaseForSchema(
    databaseSchema,
    "DATABASE_URL is required for organization portal overview runtime.",
  );
}
