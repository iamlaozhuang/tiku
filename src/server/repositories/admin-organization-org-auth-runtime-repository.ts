import { randomUUID } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

import {
  and,
  asc,
  count,
  desc,
  eq,
  gt,
  ilike,
  inArray,
  lt,
  or,
  sql,
  type SQL,
} from "drizzle-orm";
import { drizzle, type PostgresJsDatabase } from "drizzle-orm/postgres-js";

import * as databaseSchema from "@/db/schema";
import type { ApiPagination } from "../contracts/api-response";
import type {
  AdminAuthOperationListQuery,
  EmployeeMutationResultDto,
  EmployeeListDto,
  OrganizationListDto,
} from "../contracts/admin-user-org-auth-ops-contract";
import type {
  DisableOrganizationResultDto,
  OrgAuthDto,
  OrgAuthListDto,
  OrganizationDto,
} from "../contracts/organization-auth-contract";
import type { NormalizedCreateOrgAuthInput } from "../validators/org-auth";
import type {
  NormalizedCreateOrganizationInput,
  NormalizedUpdateOrganizationInput,
} from "../validators/organization";
import { getSharedRuntimePostgresClient } from "./runtime-database";

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
  createOrganization?(
    input: NormalizedCreateOrganizationInput,
  ): Promise<OrganizationDto | null>;
  updateOrganization?(
    publicId: string,
    input: NormalizedUpdateOrganizationInput,
  ): Promise<OrganizationDto | null>;
  disableOrganization?(input: {
    publicId: string;
    isCascade: boolean;
  }): Promise<DisableOrganizationResultDto | null>;
  hasOverlappingOrgAuth?(input: NormalizedCreateOrgAuthInput): Promise<boolean>;
  createOrgAuth?(
    input: NormalizedCreateOrgAuthInput,
  ): Promise<OrgAuthDto | null>;
  cancelOrgAuth?(publicId: string): Promise<OrgAuthDto | null>;
  terminateOrgAuthActiveFlows?(
    publicId: string,
  ): Promise<OrgAuthTerminationResult>;
  createEmployee?(
    input: CreateEmployeeInput,
  ): Promise<EmployeeMutationResultDto["employee"] | null>;
  disableEmployee?(publicId: string): Promise<boolean>;
  auditLogRepository?: {
    appendAuditLog(input: AppendEmployeeAuditLogInput): Promise<void>;
  };
};

export type CreateEmployeeInput = {
  userPublicId: string;
  organizationPublicId: string;
};

export type AppendEmployeeAuditLogInput = {
  actorPublicId: string;
  actorRole: string;
  actionType: string;
  targetResourceType: string;
  targetPublicId: string | null;
  resultStatus: "success" | "failed";
  metadataSummary: string | null;
  requestIp: string | null;
};

export type OrgAuthTerminationResult = {
  practiceCount: number;
  mockExamCount: number;
};

const {
  auditLog,
  authSession,
  employee,
  mockExam,
  orgAuth,
  orgAuthOrganization,
  organization,
  practice,
  user,
} = databaseSchema;

type OrganizationMutationRow = {
  id: number;
  public_id: string;
  name: string;
  org_tier: OrganizationDto["orgTier"];
  parent_organization_id: number | null;
  status: OrganizationDto["status"];
  contact_name: string | null;
  contact_phone: string | null;
  remark: string | null;
  created_at: Date;
  updated_at: Date;
};

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

function selectOrganizationMutationColumns() {
  return {
    id: organization.id,
    public_id: organization.public_id,
    name: organization.name,
    org_tier: organization.org_tier,
    parent_organization_id: organization.parent_organization_id,
    status: organization.status,
    contact_name: organization.contact_name,
    contact_phone: organization.contact_phone,
    remark: organization.remark,
    created_at: organization.created_at,
    updated_at: organization.updated_at,
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
    async createOrganization(input) {
      const database = getDatabase();
      const parentOrganizationId = await findParentOrganizationId(
        database,
        input.parentOrganizationPublicId,
      );

      if (parentOrganizationId === undefined) {
        return null;
      }

      const now = new Date();
      const [organizationRow] = await database
        .insert(organization)
        .values({
          public_id: `organization-${randomUUID()}`,
          name: input.name,
          org_tier: input.orgTier,
          parent_organization_id: parentOrganizationId,
          status: "active",
          contact_name: input.contactName,
          contact_phone: input.contactPhone,
          remark: input.remark,
          created_at: now,
          updated_at: now,
        })
        .returning(selectOrganizationMutationColumns());

      return organizationRow === undefined
        ? null
        : mapOrganizationMutationRowToDto(database, organizationRow);
    },
    async updateOrganization(publicId, input) {
      const database = getDatabase();
      const parentOrganizationId = await findParentOrganizationId(
        database,
        input.parentOrganizationPublicId,
      );

      if (parentOrganizationId === undefined) {
        return null;
      }

      const [organizationRow] = await database
        .update(organization)
        .set({
          name: input.name,
          org_tier: input.orgTier,
          parent_organization_id: parentOrganizationId,
          status: input.status,
          contact_name: input.contactName,
          contact_phone: input.contactPhone,
          remark: input.remark,
          updated_at: new Date(),
        })
        .where(eq(organization.public_id, publicId))
        .returning(selectOrganizationMutationColumns());

      return organizationRow === undefined
        ? null
        : mapOrganizationMutationRowToDto(database, organizationRow);
    },
    async disableOrganization(input) {
      const database = getDatabase();
      const [rootOrganization] = await database
        .select({ id: organization.id })
        .from(organization)
        .where(eq(organization.public_id, input.publicId))
        .limit(1);

      if (rootOrganization === undefined) {
        return null;
      }

      const organizationIds = input.isCascade
        ? await listOrganizationAndDescendantIds(database, rootOrganization.id)
        : [rootOrganization.id];
      const rows = await database
        .update(organization)
        .set({
          status: "disabled",
          updated_at: new Date(),
        })
        .where(inArray(organization.id, organizationIds))
        .returning(selectOrganizationMutationColumns());
      const disabledOrganization = rows.find(
        (row) => row.id === rootOrganization.id,
      );

      if (disabledOrganization === undefined) {
        return null;
      }

      return {
        organization: await mapOrganizationMutationRowToDto(
          database,
          disabledOrganization,
        ),
        affectedOrganizationPublicIds: await listOrganizationPublicIdsByIds(
          database,
          organizationIds,
        ),
      };
    },
    async hasOverlappingOrgAuth(input) {
      const database = getDatabase();
      const organizationIds = await listInputOrganizationIds(database, input);

      if (organizationIds.length === 0) {
        return false;
      }

      const [row] = await database
        .select({ value: count() })
        .from(orgAuth)
        .innerJoin(
          orgAuthOrganization,
          eq(orgAuthOrganization.org_auth_id, orgAuth.id),
        )
        .where(
          and(
            eq(orgAuth.status, "active"),
            eq(orgAuth.profession, input.profession),
            eq(orgAuth.level, input.level),
            lt(orgAuth.starts_at, input.expiresAt),
            gt(orgAuth.expires_at, input.startsAt),
            inArray(orgAuthOrganization.organization_id, organizationIds),
          ),
        );

      return (row?.value ?? 0) > 0;
    },
    async createOrgAuth(input) {
      const database = getDatabase();
      const [purchaserOrganization] = await database
        .select({ id: organization.id, public_id: organization.public_id })
        .from(organization)
        .where(eq(organization.public_id, input.purchaserOrganizationPublicId))
        .limit(1);

      if (purchaserOrganization === undefined) {
        return null;
      }

      const organizationIds = await listInputOrganizationIds(database, input);

      if (organizationIds.length === 0) {
        return null;
      }

      const usedQuota = await countActiveEmployeesByOrganizationIds(
        database,
        organizationIds,
      );

      if (usedQuota > input.accountQuota) {
        return null;
      }

      const now = new Date();
      const [orgAuthRow] = await database
        .insert(orgAuth)
        .values({
          public_id: `org-auth-${randomUUID()}`,
          name: input.name,
          purchaser_organization_id: purchaserOrganization.id,
          auth_scope_type: input.authScopeType,
          profession: input.profession,
          level: input.level,
          account_quota: input.accountQuota,
          used_quota: usedQuota,
          starts_at: input.startsAt,
          expires_at: input.expiresAt,
          status: "active",
          cancelled_at: null,
          created_at: now,
          updated_at: now,
        })
        .returning({
          id: orgAuth.id,
          public_id: orgAuth.public_id,
          name: orgAuth.name,
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
        });

      if (orgAuthRow === undefined) {
        return null;
      }

      await database.insert(orgAuthOrganization).values(
        organizationIds.map((organizationId) => ({
          org_auth_id: orgAuthRow.id,
          organization_id: organizationId,
        })),
      );

      const organizationPublicIds = await listOrganizationPublicIdsByIds(
        database,
        organizationIds,
      );

      return mapOrgAuthMutationRowToDto({
        ...orgAuthRow,
        purchaser_organization_public_id: purchaserOrganization.public_id,
        organization_public_ids: organizationPublicIds,
      });
    },
    async cancelOrgAuth(publicId) {
      const database = getDatabase();
      const now = new Date();
      const [orgAuthRow] = await database
        .update(orgAuth)
        .set({
          status: "cancelled",
          cancelled_at: now,
          updated_at: now,
        })
        .where(eq(orgAuth.public_id, publicId))
        .returning({
          id: orgAuth.id,
          public_id: orgAuth.public_id,
          name: orgAuth.name,
          purchaser_organization_id: orgAuth.purchaser_organization_id,
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
        });

      if (orgAuthRow === undefined) {
        return null;
      }

      const [purchaserOrganization] = await database
        .select({ public_id: organization.public_id })
        .from(organization)
        .where(eq(organization.id, orgAuthRow.purchaser_organization_id))
        .limit(1);
      const organizationPublicIdsByOrgAuthId =
        await listOrgAuthOrganizationPublicIds(database, [orgAuthRow.id]);

      return mapOrgAuthMutationRowToDto({
        ...orgAuthRow,
        purchaser_organization_public_id:
          purchaserOrganization?.public_id ?? "",
        organization_public_ids:
          organizationPublicIdsByOrgAuthId.get(orgAuthRow.id) ?? [],
      });
    },
    async terminateOrgAuthActiveFlows(publicId) {
      const database = getDatabase();
      const activeFlowScope = await findOrgAuthActiveFlowScope(
        database,
        publicId,
      );

      if (activeFlowScope === null) {
        return { practiceCount: 0, mockExamCount: 0 };
      }

      const userIds = await listActiveUserIdsByOrganizationIds(
        database,
        activeFlowScope.organizationIds,
      );

      if (userIds.length === 0) {
        return { practiceCount: 0, mockExamCount: 0 };
      }

      const now = new Date();
      const terminatedPractices = await database
        .update(practice)
        .set({
          practice_status: "terminated",
          terminated_at: now,
          termination_reason: "authorization_invalid",
          updated_at: now,
        })
        .where(
          and(
            inArray(practice.user_id, userIds),
            eq(practice.profession, activeFlowScope.profession),
            eq(practice.level, activeFlowScope.level),
            eq(practice.practice_status, "in_progress"),
          ),
        )
        .returning({ id: practice.id });
      const terminatedMockExams = await database
        .update(mockExam)
        .set({
          exam_status: "terminated",
          terminated_at: now,
          termination_reason: "authorization_invalid",
          updated_at: now,
        })
        .where(
          and(
            inArray(mockExam.user_id, userIds),
            eq(mockExam.profession, activeFlowScope.profession),
            eq(mockExam.level, activeFlowScope.level),
            eq(mockExam.exam_status, "in_progress"),
          ),
        )
        .returning({ id: mockExam.id });

      return {
        practiceCount: terminatedPractices.length,
        mockExamCount: terminatedMockExams.length,
      };
    },
    async createEmployee(input) {
      const database = getDatabase();
      const [userRow] = await database
        .select({
          id: user.id,
          public_id: user.public_id,
          phone: user.phone,
          name: user.name,
        })
        .from(user)
        .where(eq(user.public_id, input.userPublicId))
        .limit(1);
      const [organizationRow] = await database
        .select({
          id: organization.id,
          public_id: organization.public_id,
        })
        .from(organization)
        .where(eq(organization.public_id, input.organizationPublicId))
        .limit(1);

      if (userRow === undefined || organizationRow === undefined) {
        return null;
      }

      const [employeeRow] = await database
        .insert(employee)
        .values({
          public_id: `employee-${randomUUID()}`,
          user_id: userRow.id,
          organization_id: organizationRow.id,
        })
        .returning({
          public_id: employee.public_id,
        });

      await database
        .update(user)
        .set({
          user_type: "employee",
          status: "active",
          disabled_at: null,
          updated_at: new Date(),
        })
        .where(eq(user.id, userRow.id));

      if (employeeRow === undefined) {
        return null;
      }

      return {
        publicId: employeeRow.public_id,
        userPublicId: userRow.public_id,
        phone: userRow.phone,
        name: userRow.name,
        organizationPublicId: organizationRow.public_id,
        status: "active",
      };
    },
    async disableEmployee(publicId) {
      const database = getDatabase();
      const [employeeRow] = await database
        .select({
          employee_id: employee.id,
          user_id: user.id,
          auth_user_id: user.auth_user_id,
        })
        .from(employee)
        .innerJoin(user, eq(user.id, employee.user_id))
        .where(eq(employee.public_id, publicId))
        .limit(1);

      if (employeeRow === undefined) {
        return false;
      }

      await database
        .update(user)
        .set({
          status: "disabled",
          disabled_at: new Date(),
          updated_at: new Date(),
        })
        .where(eq(user.id, employeeRow.user_id));
      await database
        .update(employee)
        .set({
          updated_at: new Date(),
        })
        .where(eq(employee.id, employeeRow.employee_id));

      if (employeeRow.auth_user_id !== null) {
        await database
          .delete(authSession)
          .where(eq(authSession.user_id, employeeRow.auth_user_id));
      }

      return true;
    },
    auditLogRepository: {
      async appendAuditLog(input) {
        await getDatabase()
          .insert(auditLog)
          .values({
            public_id: `audit-log-${randomUUID()}`,
            actor_public_id: input.actorPublicId,
            actor_role: input.actorRole,
            action_type: input.actionType,
            target_resource_type: input.targetResourceType,
            target_public_id: input.targetPublicId,
            result_status: input.resultStatus,
            metadata_summary: input.metadataSummary,
            request_ip: input.requestIp,
          });
      },
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

async function findParentOrganizationId(
  database: AdminOrganizationOrgAuthRuntimeDatabase,
  parentOrganizationPublicId: string | null,
): Promise<number | null | undefined> {
  if (parentOrganizationPublicId === null) {
    return null;
  }

  const [parentOrganization] = await database
    .select({ id: organization.id })
    .from(organization)
    .where(eq(organization.public_id, parentOrganizationPublicId))
    .limit(1);

  return parentOrganization?.id;
}

async function mapOrganizationMutationRowToDto(
  database: AdminOrganizationOrgAuthRuntimeDatabase,
  input: OrganizationMutationRow,
): Promise<OrganizationDto> {
  const parentPublicIds =
    input.parent_organization_id === null
      ? new Map<number, string>()
      : await listParentOrganizationPublicIds(database, [
          input.parent_organization_id,
        ]);

  return {
    publicId: input.public_id,
    name: input.name,
    orgTier: input.org_tier,
    parentOrganizationPublicId:
      input.parent_organization_id === null
        ? null
        : (parentPublicIds.get(input.parent_organization_id) ?? null),
    status: input.status,
    contactName: input.contact_name,
    contactPhone: input.contact_phone,
    remark: input.remark,
    createdAt: input.created_at.toISOString(),
    updatedAt: input.updated_at.toISOString(),
  };
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

async function listOrganizationPublicIdsByIds(
  database: AdminOrganizationOrgAuthRuntimeDatabase,
  organizationIds: number[],
): Promise<string[]> {
  if (organizationIds.length === 0) {
    return [];
  }

  const rows = await database
    .select({ public_id: organization.public_id })
    .from(organization)
    .where(inArray(organization.id, organizationIds))
    .orderBy(asc(organization.public_id));

  return rows.map((row) => row.public_id);
}

async function listInputOrganizationIds(
  database: AdminOrganizationOrgAuthRuntimeDatabase,
  input: NormalizedCreateOrgAuthInput,
): Promise<number[]> {
  if (input.authScopeType === "specified_nodes") {
    const rows = await database
      .select({ id: organization.id })
      .from(organization)
      .where(inArray(organization.public_id, input.organizationPublicIds));

    return rows.map((row) => row.id);
  }

  const [rootOrganization] = await database
    .select({ id: organization.id })
    .from(organization)
    .where(eq(organization.public_id, input.purchaserOrganizationPublicId))
    .limit(1);

  if (rootOrganization === undefined) {
    return [];
  }

  return listOrganizationAndDescendantIds(database, rootOrganization.id);
}

async function listOrganizationAndDescendantIds(
  database: AdminOrganizationOrgAuthRuntimeDatabase,
  rootOrganizationId: number,
): Promise<number[]> {
  let organizationIds = [rootOrganizationId];
  let frontierIds = [rootOrganizationId];

  for (let depth = 0; depth < 4 && frontierIds.length > 0; depth += 1) {
    const childRows = await database
      .select({ id: organization.id })
      .from(organization)
      .where(inArray(organization.parent_organization_id, frontierIds));
    const childIds = childRows.map((row) => row.id);

    organizationIds = [...organizationIds, ...childIds];
    frontierIds = childIds;
  }

  return organizationIds;
}

async function countActiveEmployeesByOrganizationIds(
  database: AdminOrganizationOrgAuthRuntimeDatabase,
  organizationIds: number[],
): Promise<number> {
  if (organizationIds.length === 0) {
    return 0;
  }

  const [row] = await database
    .select({ value: count() })
    .from(employee)
    .innerJoin(user, eq(user.id, employee.user_id))
    .where(
      and(
        inArray(employee.organization_id, organizationIds),
        eq(user.status, "active"),
      ),
    );

  return row?.value ?? 0;
}

async function findOrgAuthActiveFlowScope(
  database: AdminOrganizationOrgAuthRuntimeDatabase,
  publicId: string,
): Promise<{
  organizationIds: number[];
  profession: (typeof orgAuth.$inferSelect)["profession"];
  level: number;
} | null> {
  const [orgAuthRow] = await database
    .select({
      id: orgAuth.id,
      profession: orgAuth.profession,
      level: orgAuth.level,
    })
    .from(orgAuth)
    .where(eq(orgAuth.public_id, publicId))
    .limit(1);

  if (orgAuthRow === undefined) {
    return null;
  }

  const organizationRows = await database
    .select({ organization_id: orgAuthOrganization.organization_id })
    .from(orgAuthOrganization)
    .where(eq(orgAuthOrganization.org_auth_id, orgAuthRow.id));

  return {
    organizationIds: organizationRows.map((row) => row.organization_id),
    profession: orgAuthRow.profession,
    level: orgAuthRow.level,
  };
}

async function listActiveUserIdsByOrganizationIds(
  database: AdminOrganizationOrgAuthRuntimeDatabase,
  organizationIds: number[],
): Promise<number[]> {
  if (organizationIds.length === 0) {
    return [];
  }

  const rows = await database
    .select({ id: user.id })
    .from(employee)
    .innerJoin(user, eq(user.id, employee.user_id))
    .where(
      and(
        inArray(employee.organization_id, organizationIds),
        eq(user.status, "active"),
      ),
    );

  return rows.map((row) => row.id);
}

function mapOrgAuthMutationRowToDto(input: {
  public_id: string;
  name: string;
  purchaser_organization_public_id: string;
  auth_scope_type: OrgAuthDto["authScopeType"];
  profession: OrgAuthDto["profession"];
  level: number;
  account_quota: number;
  used_quota: number;
  starts_at: Date;
  expires_at: Date;
  status: OrgAuthDto["status"];
  cancelled_at: Date | null;
  organization_public_ids: string[];
  created_at: Date;
  updated_at: Date;
}): OrgAuthDto {
  return {
    publicId: input.public_id,
    name: input.name,
    purchaserOrganizationPublicId: input.purchaser_organization_public_id,
    authScopeType: input.auth_scope_type,
    profession: input.profession,
    level: input.level,
    accountQuota: input.account_quota,
    usedQuota: input.used_quota,
    startsAt: input.starts_at.toISOString(),
    expiresAt: input.expires_at.toISOString(),
    status: input.status,
    cancelledAt:
      input.cancelled_at === null ? null : input.cancelled_at.toISOString(),
    organizationPublicIds: input.organization_public_ids,
    createdAt: input.created_at.toISOString(),
    updatedAt: input.updated_at.toISOString(),
  };
}

function createLocalRuntimeDatabase(): AdminOrganizationOrgAuthRuntimeDatabase {
  loadLocalEnv();

  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error(
      "DATABASE_URL is required for admin organization org auth runtime.",
    );
  }

  return drizzle(getSharedRuntimePostgresClient(databaseUrl), {
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
