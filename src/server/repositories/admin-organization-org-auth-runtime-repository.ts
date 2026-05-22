import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

import {
  and,
  asc,
  count,
  desc,
  eq,
  ilike,
  inArray,
  or,
  sql,
  type SQL,
} from "drizzle-orm";
import { drizzle, type PostgresJsDatabase } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import * as databaseSchema from "@/db/schema";
import type { ApiPagination } from "../contracts/api-response";
import type {
  AdminAuthOperationListQuery,
  EmployeeListDto,
  OrganizationListDto,
} from "../contracts/admin-user-org-auth-ops-contract";
import type { OrgAuthListDto } from "../contracts/organization-auth-contract";

type AdminOrganizationOrgAuthRuntimeDatabase = PostgresJsDatabase<
  typeof databaseSchema
>;

export type AdminOrganizationOrgAuthRuntimeRepositoryOptions = {
  createDatabase?: () => AdminOrganizationOrgAuthRuntimeDatabase;
};

export type AdminOrganizationOrgAuthPage<TData> = TData & {
  pagination: ApiPagination;
};

export type AdminOrganizationOrgAuthRuntimeRepositories = {
  listOrganizations(
    query: AdminAuthOperationListQuery,
  ): Promise<AdminOrganizationOrgAuthPage<OrganizationListDto>>;
  listOrgAuths(
    query: AdminAuthOperationListQuery,
  ): Promise<AdminOrganizationOrgAuthPage<OrgAuthListDto>>;
  listEmployees(
    query: AdminAuthOperationListQuery,
  ): Promise<AdminOrganizationOrgAuthPage<EmployeeListDto>>;
};

const { employee, orgAuth, orgAuthOrganization, organization, user } =
  databaseSchema;

function createLazyDatabaseGetter(
  createDatabase: () => AdminOrganizationOrgAuthRuntimeDatabase,
): () => AdminOrganizationOrgAuthRuntimeDatabase {
  let cachedDatabase: AdminOrganizationOrgAuthRuntimeDatabase | undefined;

  return () => {
    cachedDatabase ??= createDatabase();

    return cachedDatabase;
  };
}

function createPagination(
  query: Pick<
    AdminAuthOperationListQuery,
    "page" | "pageSize" | "sortBy" | "sortOrder"
  >,
  total: number,
): ApiPagination {
  return {
    page: query.page,
    pageSize: query.pageSize,
    sortBy: query.sortBy,
    sortOrder: query.sortOrder,
    total,
  };
}

export function createPostgresAdminOrganizationOrgAuthRuntimeRepositories(
  options: AdminOrganizationOrgAuthRuntimeRepositoryOptions = {},
): AdminOrganizationOrgAuthRuntimeRepositories {
  const getDatabase = createLazyDatabaseGetter(
    options.createDatabase ?? createLocalRuntimeDatabase,
  );

  return {
    async listOrganizations(query) {
      const database = getDatabase();
      const conditions = createOrganizationConditions(query);
      const rows = await database
        .select({
          id: organization.id,
          public_id: organization.public_id,
          name: organization.name,
          org_tier: organization.org_tier,
          parent_organization_id: organization.parent_organization_id,
          status: organization.status,
          created_at: organization.created_at,
          updated_at: organization.updated_at,
        })
        .from(organization)
        .where(and(...conditions))
        .orderBy(createOrganizationOrderBy(query))
        .limit(query.pageSize)
        .offset((query.page - 1) * query.pageSize);
      const [totalRow] = await database
        .select({ value: count() })
        .from(organization)
        .where(and(...conditions));
      const organizationIds = rows.map((row) => row.id);
      const parentPublicIds = await listParentOrganizationPublicIds(
        database,
        rows
          .map((row) => row.parent_organization_id)
          .filter((id): id is number => id !== null),
      );
      const employeeCounts = await listEmployeeCounts(
        database,
        organizationIds,
      );
      const authSummaries = await listOrganizationAuthSummaries(
        database,
        organizationIds,
      );

      return {
        organizations: rows.map((row) => ({
          publicId: row.public_id,
          name: row.name,
          orgTier: row.org_tier,
          parentOrganizationPublicId:
            row.parent_organization_id === null
              ? null
              : (parentPublicIds.get(row.parent_organization_id) ?? null),
          status: row.status,
          employeeCount: employeeCounts.get(row.id) ?? 0,
          authSummary: authSummaries.get(row.id) ?? null,
        })),
        pagination: createPagination(query, totalRow?.value ?? 0),
      };
    },
    async listOrgAuths(query) {
      const database = getDatabase();
      const conditions = createOrgAuthConditions(query);
      const rows = await database
        .select({
          id: orgAuth.id,
          public_id: orgAuth.public_id,
          name: orgAuth.name,
          purchaser_organization_public_id: organization.public_id,
          auth_scope_type: orgAuth.auth_scope_type,
          profession: orgAuth.profession,
          level: orgAuth.level,
          account_quota: orgAuth.account_quota,
          used_quota: orgAuth.used_quota,
          starts_at: orgAuth.starts_at,
          expires_at: orgAuth.expires_at,
          status: orgAuth.status,
          cancelled_at: orgAuth.cancelled_at,
          created_at: orgAuth.created_at,
          updated_at: orgAuth.updated_at,
        })
        .from(orgAuth)
        .innerJoin(
          organization,
          eq(organization.id, orgAuth.purchaser_organization_id),
        )
        .where(and(...conditions))
        .orderBy(createOrgAuthOrderBy(query))
        .limit(query.pageSize)
        .offset((query.page - 1) * query.pageSize);
      const [totalRow] = await database
        .select({ value: count() })
        .from(orgAuth)
        .innerJoin(
          organization,
          eq(organization.id, orgAuth.purchaser_organization_id),
        )
        .where(and(...conditions));
      const organizationPublicIdsByOrgAuthId =
        await listOrgAuthOrganizationPublicIds(
          database,
          rows.map((row) => row.id),
        );

      return {
        orgAuths: rows.map((row) => ({
          publicId: row.public_id,
          name: row.name,
          purchaserOrganizationPublicId: row.purchaser_organization_public_id,
          authScopeType: row.auth_scope_type,
          profession: row.profession,
          level: row.level,
          accountQuota: row.account_quota,
          usedQuota: row.used_quota,
          startsAt: row.starts_at.toISOString(),
          expiresAt: row.expires_at.toISOString(),
          status: row.status,
          cancelledAt:
            row.cancelled_at === null ? null : row.cancelled_at.toISOString(),
          organizationPublicIds:
            organizationPublicIdsByOrgAuthId.get(row.id) ?? [],
          createdAt: row.created_at.toISOString(),
          updatedAt: row.updated_at.toISOString(),
        })),
        pagination: createPagination(query, totalRow?.value ?? 0),
      };
    },
    async listEmployees(query) {
      const database = getDatabase();
      const conditions = createEmployeeConditions(query);
      const rows = await database
        .select({
          public_id: employee.public_id,
          user_public_id: user.public_id,
          phone: user.phone,
          name: user.name,
          organization_public_id: organization.public_id,
          status: user.status,
        })
        .from(employee)
        .innerJoin(user, eq(user.id, employee.user_id))
        .innerJoin(organization, eq(organization.id, employee.organization_id))
        .where(and(...conditions))
        .orderBy(createEmployeeOrderBy(query))
        .limit(query.pageSize)
        .offset((query.page - 1) * query.pageSize);
      const [totalRow] = await database
        .select({ value: count() })
        .from(employee)
        .innerJoin(user, eq(user.id, employee.user_id))
        .innerJoin(organization, eq(organization.id, employee.organization_id))
        .where(and(...conditions));

      return {
        employees: rows.map((row) => ({
          publicId: row.public_id,
          userPublicId: row.user_public_id,
          phone: row.phone,
          name: row.name,
          organizationPublicId: row.organization_public_id,
          status: row.status,
        })),
        pagination: createPagination(query, totalRow?.value ?? 0),
      };
    },
  };
}

function createOrganizationConditions(
  query: AdminAuthOperationListQuery,
): SQL[] {
  const conditions: SQL[] = [];

  if (query.keyword !== null) {
    conditions.push(ilike(organization.name, `%${query.keyword}%`));
  }

  if (query.status === "active" || query.status === "disabled") {
    conditions.push(eq(organization.status, query.status));
  }

  return conditions;
}

function createOrgAuthConditions(query: AdminAuthOperationListQuery): SQL[] {
  const conditions: SQL[] = [];

  if (query.keyword !== null) {
    conditions.push(
      or(
        ilike(orgAuth.name, `%${query.keyword}%`),
        ilike(organization.name, `%${query.keyword}%`),
      )!,
    );
  }

  if (
    query.status === "active" ||
    query.status === "expired" ||
    query.status === "cancelled"
  ) {
    conditions.push(eq(orgAuth.status, query.status));
  }

  return conditions;
}

function createEmployeeConditions(query: AdminAuthOperationListQuery): SQL[] {
  const conditions: SQL[] = [eq(user.user_type, "employee")];

  if (query.userType === "personal") {
    conditions.push(sql`false`);
  }

  if (query.keyword !== null) {
    conditions.push(
      or(
        ilike(user.name, `%${query.keyword}%`),
        ilike(user.phone, `%${query.keyword}%`),
        ilike(organization.name, `%${query.keyword}%`),
      )!,
    );
  }

  if (query.status === "active" || query.status === "disabled") {
    conditions.push(eq(user.status, query.status));
  }

  return conditions;
}

function createOrganizationOrderBy(query: AdminAuthOperationListQuery): SQL {
  if (query.sortBy === "createdAt") {
    return query.sortOrder === "asc"
      ? asc(organization.created_at)
      : desc(organization.created_at);
  }

  return query.sortOrder === "asc"
    ? asc(organization.updated_at)
    : desc(organization.updated_at);
}

function createOrgAuthOrderBy(query: AdminAuthOperationListQuery): SQL {
  if (query.sortBy === "createdAt") {
    return query.sortOrder === "asc"
      ? asc(orgAuth.created_at)
      : desc(orgAuth.created_at);
  }

  if (query.sortBy === "expiresAt") {
    return query.sortOrder === "asc"
      ? asc(orgAuth.expires_at)
      : desc(orgAuth.expires_at);
  }

  return query.sortOrder === "asc"
    ? asc(orgAuth.updated_at)
    : desc(orgAuth.updated_at);
}

function createEmployeeOrderBy(query: AdminAuthOperationListQuery): SQL {
  if (query.sortBy === "createdAt" || query.sortBy === "registeredAt") {
    return query.sortOrder === "asc"
      ? asc(user.created_at)
      : desc(user.created_at);
  }

  return query.sortOrder === "asc"
    ? asc(user.updated_at)
    : desc(user.updated_at);
}

async function listParentOrganizationPublicIds(
  database: AdminOrganizationOrgAuthRuntimeDatabase,
  parentOrganizationIds: number[],
): Promise<Map<number, string>> {
  if (parentOrganizationIds.length === 0) {
    return new Map();
  }

  const rows = await database
    .select({
      id: organization.id,
      public_id: organization.public_id,
    })
    .from(organization)
    .where(inArray(organization.id, parentOrganizationIds));

  return new Map(rows.map((row) => [row.id, row.public_id]));
}

async function listEmployeeCounts(
  database: AdminOrganizationOrgAuthRuntimeDatabase,
  organizationIds: number[],
): Promise<Map<number, number>> {
  if (organizationIds.length === 0) {
    return new Map();
  }

  const rows = await database
    .select({
      organization_id: employee.organization_id,
      value: count(),
    })
    .from(employee)
    .where(inArray(employee.organization_id, organizationIds))
    .groupBy(employee.organization_id);

  return new Map(rows.map((row) => [row.organization_id, row.value]));
}

async function listOrganizationAuthSummaries(
  database: AdminOrganizationOrgAuthRuntimeDatabase,
  organizationIds: number[],
): Promise<Map<number, string>> {
  if (organizationIds.length === 0) {
    return new Map();
  }

  const rows = await database
    .select({
      organization_id: orgAuthOrganization.organization_id,
      profession: orgAuth.profession,
      level: orgAuth.level,
    })
    .from(orgAuthOrganization)
    .innerJoin(orgAuth, eq(orgAuth.id, orgAuthOrganization.org_auth_id))
    .where(inArray(orgAuthOrganization.organization_id, organizationIds))
    .orderBy(desc(orgAuth.expires_at));
  const summaries = new Map<number, string>();

  for (const row of rows) {
    if (!summaries.has(row.organization_id)) {
      summaries.set(
        row.organization_id,
        `${row.profession} / level ${row.level}`,
      );
    }
  }

  return summaries;
}

async function listOrgAuthOrganizationPublicIds(
  database: AdminOrganizationOrgAuthRuntimeDatabase,
  orgAuthIds: number[],
): Promise<Map<number, string[]>> {
  if (orgAuthIds.length === 0) {
    return new Map();
  }

  const rows = await database
    .select({
      org_auth_id: orgAuthOrganization.org_auth_id,
      organization_public_id: organization.public_id,
    })
    .from(orgAuthOrganization)
    .innerJoin(
      organization,
      eq(organization.id, orgAuthOrganization.organization_id),
    )
    .where(inArray(orgAuthOrganization.org_auth_id, orgAuthIds))
    .orderBy(asc(organization.public_id));
  const publicIds = new Map<number, string[]>();

  for (const row of rows) {
    publicIds.set(row.org_auth_id, [
      ...(publicIds.get(row.org_auth_id) ?? []),
      row.organization_public_id,
    ]);
  }

  return publicIds;
}

function createLocalRuntimeDatabase(): AdminOrganizationOrgAuthRuntimeDatabase {
  loadLocalEnv();

  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error(
      "DATABASE_URL is required for admin organization org auth runtime.",
    );
  }

  return drizzle(postgres(databaseUrl, { max: 5 }), {
    schema: databaseSchema,
  });
}

function loadLocalEnv(): void {
  const localEnvPath = resolve(process.cwd(), ".env.local");

  if (!existsSync(localEnvPath)) {
    return;
  }

  const localEnvContent = readFileSync(localEnvPath, "utf8");

  for (const line of localEnvContent.split(/\r?\n/u)) {
    const trimmedLine = line.trim();

    if (trimmedLine.length === 0 || trimmedLine.startsWith("#")) {
      continue;
    }

    const separatorIndex = trimmedLine.indexOf("=");

    if (separatorIndex <= 0) {
      continue;
    }

    const key = trimmedLine.slice(0, separatorIndex).trim();
    const value = trimmedLine
      .slice(separatorIndex + 1)
      .trim()
      .replace(/^["']|["']$/gu, "");

    if (process.env[key] === undefined) {
      process.env[key] = value;
    }
  }
}
