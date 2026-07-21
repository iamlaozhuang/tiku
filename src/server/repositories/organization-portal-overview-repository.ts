import {
  and,
  asc,
  count,
  countDistinct,
  desc,
  eq,
  gt,
  ilike,
  isNull,
  lte,
  or,
  sql,
  type SQL,
} from "drizzle-orm";
import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";

import * as databaseSchema from "@/db/schema";
import type {
  OrganizationPortalEmployeeAuthEditionLabel,
  OrganizationPortalEmployeeRosterItemDto,
  OrganizationPortalEmployeeRosterQuery,
  OrganizationPortalOverviewDto,
} from "../contracts/organization-portal-overview-contract";
import { maskPhoneForDisplay } from "../mappers/phone-display-mapper";
import { createAdminUserEffectiveAuthorizationReadModel } from "./admin-flow-runtime-repository";
import { createRuntimeDatabaseForSchema } from "./runtime-database";
import {
  createOrgAuthCoversOrganizationCondition,
  createOrganizationIsSelfOrDescendantCondition,
} from "./organization-scope-query";
import type {
  OrganizationPortalEmployeeRosterRepository,
  OrganizationPortalOverviewRepository,
  OrganizationPortalOverviewRepositoryInput,
} from "../services/organization-portal-overview-service";
import { resolveOrganizationPortalEmployeeAccountStatus } from "../services/organization-portal-overview-service";

type OrganizationPortalOverviewRuntimeDatabase = PostgresJsDatabase<
  typeof databaseSchema
>;

export type OrganizationPortalOverviewRepositoryOptions = {
  createDatabase?: () => OrganizationPortalOverviewRuntimeDatabase;
};

const { authUpgrade, employee, orgAuth, organization, user } = databaseSchema;

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
): OrganizationPortalOverviewRepository &
  OrganizationPortalEmployeeRosterRepository {
  const getDatabase = createLazyDatabaseGetter(
    options.createDatabase ?? createLocalRuntimeDatabase,
  );

  return {
    async readOverview(input) {
      return readOrganizationPortalOverview(getDatabase(), input);
    },
    async readEmployeeRoster(input) {
      return readOrganizationPortalEmployeeRoster(getDatabase(), input);
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
  const authorizations = await readAuthorizationOverviews(database, {
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
    authorizations,
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
    .where(
      and(
        eq(employee.organization_id, input.organizationId),
        eq(user.user_type, "employee"),
      ),
    );

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

function escapeLikePattern(value: string): string {
  return value.replace(/[\\%_]/g, (character) => `\\${character}`);
}

function normalizeEmployeeAuthEditionLabel(
  value: string,
): OrganizationPortalEmployeeAuthEditionLabel {
  return value === "advanced" || value === "expired" || value === "standard"
    ? value
    : "none";
}

function createEmployeeRosterConditions(input: {
  boundOrganizationId: number;
  effectiveAuthorization: ReturnType<
    typeof createAdminUserEffectiveAuthorizationReadModel
  >;
  now: Date;
  query: OrganizationPortalEmployeeRosterQuery;
}): SQL[] {
  const conditions: SQL[] = [
    eq(user.user_type, "employee"),
    createOrganizationIsSelfOrDescendantCondition({
      ancestorOrganizationId: input.boundOrganizationId,
      organizationId: employee.organization_id,
    }),
  ];

  if (input.query.keyword !== null) {
    conditions.push(
      ilike(user.name, `%${escapeLikePattern(input.query.keyword)}%`),
    );
  }

  if (input.query.employeePublicId !== null) {
    conditions.push(eq(employee.public_id, input.query.employeePublicId));
  }

  if (input.query.accountStatus === "disabled") {
    conditions.push(eq(user.status, "disabled"));
  } else if (input.query.accountStatus === "locked") {
    conditions.push(
      and(eq(user.status, "active"), gt(user.locked_until_at, input.now))!,
    );
  } else if (input.query.accountStatus === "active") {
    conditions.push(
      and(
        eq(user.status, "active"),
        or(isNull(user.locked_until_at), lte(user.locked_until_at, input.now)),
      )!,
    );
  }

  if (input.query.authFilter !== "all") {
    conditions.push(
      eq(
        input.effectiveAuthorization.auth_edition_label,
        input.query.authFilter,
      ),
    );
  }

  return conditions;
}

async function readOrganizationPortalEmployeeRoster(
  database: OrganizationPortalOverviewRuntimeDatabase,
  input: {
    now: Date;
    organizationPublicId: string;
    query: OrganizationPortalEmployeeRosterQuery;
  },
): Promise<{
  employees: OrganizationPortalEmployeeRosterItemDto[];
  total: number;
} | null> {
  const [boundOrganization] = await database
    .select({ id: organization.id })
    .from(organization)
    .where(eq(organization.public_id, input.organizationPublicId))
    .limit(1);

  if (boundOrganization === undefined) {
    return null;
  }

  const effectiveAuthorization = createAdminUserEffectiveAuthorizationReadModel(
    database,
    input.now,
  );
  const conditions = createEmployeeRosterConditions({
    boundOrganizationId: boundOrganization.id,
    effectiveAuthorization,
    now: input.now,
    query: input.query,
  });
  const whereCondition = and(...conditions);
  const offset = (input.query.page - 1) * input.query.pageSize;
  const rows = await database
    .select({
      auth_edition_label: effectiveAuthorization.auth_edition_label,
      auth_status: effectiveAuthorization.auth_status,
      employee_public_id: employee.public_id,
      locked_until_at: user.locked_until_at,
      name: user.name,
      organization_name: organization.name,
      phone: user.phone,
      status: user.status,
    })
    .from(employee)
    .innerJoin(user, eq(user.id, employee.user_id))
    .innerJoin(organization, eq(organization.id, employee.organization_id))
    .innerJoin(
      effectiveAuthorization,
      eq(effectiveAuthorization.user_id, user.id),
    )
    .where(whereCondition)
    .orderBy(asc(user.name), asc(employee.public_id))
    .limit(input.query.pageSize)
    .offset(offset);
  const [totalRow] = await database
    .select({ value: count() })
    .from(employee)
    .innerJoin(user, eq(user.id, employee.user_id))
    .innerJoin(organization, eq(organization.id, employee.organization_id))
    .innerJoin(
      effectiveAuthorization,
      eq(effectiveAuthorization.user_id, user.id),
    )
    .where(whereCondition);

  return {
    employees: rows.map((row) => ({
      accountStatus: resolveOrganizationPortalEmployeeAccountStatus({
        lockedUntilAt: row.locked_until_at,
        now: input.now,
        status: row.status,
      }),
      authEditionLabel: normalizeEmployeeAuthEditionLabel(
        row.auth_edition_label,
      ),
      authStatus: row.auth_status,
      employeeDisplayName: row.name,
      employeePublicId: row.employee_public_id,
      organizationDisplayName: row.organization_name,
      phoneMasked: maskPhoneForDisplay(row.phone),
    })),
    total: totalRow?.value ?? 0,
  };
}

async function readAuthorizationOverviews(
  database: OrganizationPortalOverviewRuntimeDatabase,
  input: {
    now: Date;
    organizationId: number;
  },
): Promise<OrganizationPortalOverviewDto["authorizations"]> {
  const comparisonTimestamp = input.now.toISOString();
  const rows = await database
    .select({
      id: orgAuth.id,
      purchaser_organization_id: orgAuth.purchaser_organization_id,
      name: orgAuth.name,
      auth_scope_type: orgAuth.auth_scope_type,
      source_edition: orgAuth.edition,
      effective_edition: sql<"standard" | "advanced">`
        case
          when ${orgAuth.edition} = 'advanced'
            or coalesce(bool_or(${authUpgrade.id} is not null), false)
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
      status: sql<"active" | "cancelled" | "expired" | "not_started">`
        case
          when ${orgAuth.status} = 'cancelled' then 'cancelled'
          when ${orgAuth.status} = 'expired'
            or ${orgAuth.expires_at} <= ${comparisonTimestamp}::timestamptz
          then 'expired'
          when ${orgAuth.starts_at} > ${comparisonTimestamp}::timestamptz
          then 'not_started'
          else 'active'
        end
      `,
      upgrade_status: sql<"active" | null>`
        case
          when coalesce(bool_or(${authUpgrade.id} is not null), false)
          then 'active'
          else null
        end
      `,
      organization_count: countDistinct(organization.id),
    })
    .from(orgAuth)
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
    .innerJoin(
      organization,
      createOrgAuthCoversOrganizationCondition({
        authScopeType: orgAuth.auth_scope_type,
        orgAuthId: orgAuth.id,
        organizationId: organization.id,
        purchaserOrganizationId: orgAuth.purchaser_organization_id,
      }),
    )
    .where(
      createOrgAuthCoversOrganizationCondition({
        authScopeType: orgAuth.auth_scope_type,
        orgAuthId: orgAuth.id,
        organizationId: input.organizationId,
        purchaserOrganizationId: orgAuth.purchaser_organization_id,
      }),
    )
    .groupBy(
      orgAuth.id,
      orgAuth.purchaser_organization_id,
      orgAuth.name,
      orgAuth.auth_scope_type,
      orgAuth.edition,
      orgAuth.profession,
      orgAuth.level,
      orgAuth.account_quota,
      orgAuth.used_quota,
      orgAuth.starts_at,
      orgAuth.expires_at,
      orgAuth.status,
    )
    .orderBy(
      sql`
        case
          when ${orgAuth.status} = 'active'
            and ${orgAuth.starts_at} <= ${comparisonTimestamp}::timestamptz
            and ${orgAuth.expires_at} > ${comparisonTimestamp}::timestamptz
          then 0
          when ${orgAuth.status} = 'active'
            and ${orgAuth.starts_at} > ${comparisonTimestamp}::timestamptz
          then 1
          when ${orgAuth.status} = 'expired'
            or ${orgAuth.expires_at} <= ${comparisonTimestamp}::timestamptz
          then 2
          else 3
        end
      `,
      desc(orgAuth.expires_at),
      desc(orgAuth.starts_at),
      desc(orgAuth.id),
    );
  return rows.map((row) => ({
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
        organizationCount: Math.max(row.organization_count, 1),
      },
    ],
    upgradeStatus: row.upgrade_status ?? "none",
  }));
}

function createLocalRuntimeDatabase(): OrganizationPortalOverviewRuntimeDatabase {
  return createRuntimeDatabaseForSchema(
    databaseSchema,
    "DATABASE_URL is required for organization portal overview runtime.",
  );
}
