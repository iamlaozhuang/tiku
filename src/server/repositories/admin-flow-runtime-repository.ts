import { randomUUID } from "node:crypto";

import {
  and,
  asc,
  count,
  desc,
  eq,
  ilike,
  inArray,
  isNotNull,
  or,
  sql,
  type SQL,
} from "drizzle-orm";
import { hashPassword } from "better-auth/crypto";
import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";

import * as databaseSchema from "@/db/schema";
import type { ApiPagination } from "../contracts/api-response";
import type {
  AdminAiAuditLogListQuery,
  AuditLogListDto,
} from "../contracts/admin-ai-audit-log-ops-contract";
import type {
  AdminContentKnowledgeListQuery,
  AdminPaperOpsListDto,
  AdminQuestionOpsListDto,
} from "../contracts/admin-content-knowledge-ops-contract";
import { questionTypeValues, type QuestionType } from "../models/paper";
import type {
  AdminAccountCreationConflictReason,
  AdminAccountCreationInputDto,
  AdminAccountCreationNotFoundReason,
  AdminAccountCreationResultDto,
  AdminAccountListDto,
  AdminAccountListQuery,
  AdminAuthOperationListQuery,
  AdminUserDetailDto,
  AdminUserListDto,
} from "../contracts/admin-user-org-auth-ops-contract";
import type { AdminRole } from "../models/auth";
import { createRuntimeDatabaseForSchema } from "./runtime-database";

type AdminFlowRuntimeDatabase = PostgresJsDatabase<typeof databaseSchema>;
const questionTypeSet = new Set<string>(questionTypeValues);
const authPasswordColumn = "password";
const credentialProviderId = "credential";

export type AdminFlowRuntimeRepositoryOptions = {
  createDatabase?: () => AdminFlowRuntimeDatabase;
};

export type AdminFlowPage<TData> = TData & {
  pagination: ApiPagination;
};

export type AdminUserOrgAuthRuntimeRepository = {
  listAdminAccounts?(
    query: AdminAccountListQuery,
    visibleAdminRoles: readonly AdminRole[],
  ): Promise<AdminFlowPage<AdminAccountListDto>>;
  listUsers(
    query: AdminAuthOperationListQuery,
  ): Promise<AdminFlowPage<AdminUserListDto>>;
  getUserDetail?(publicId: string): Promise<AdminUserDetailDto | null>;
  createAdminAccount?(
    input: AdminAccountCreationInputDto,
  ): Promise<AdminAccountCreationRepositoryResult>;
  resetUserPassword?(
    publicId: string,
    input: UserPasswordResetRepositoryInput,
  ): Promise<boolean>;
  disableUser?(publicId: string): Promise<boolean>;
  enableUser?(publicId: string): Promise<boolean>;
  revokeUserSessions?(publicId: string): Promise<boolean>;
  terminateUserActiveFlows?(
    publicId: string,
  ): Promise<UserActiveFlowTerminationResult>;
};

export type UserPasswordResetRepositoryInput = {
  newPassword: string;
};

export type AdminAccountCreationRepositoryResult =
  | ({
      status: "created";
    } & AdminAccountCreationResultDto)
  | {
      status: "conflict";
      reason: AdminAccountCreationConflictReason;
    }
  | {
      status: "not_found";
      reason: AdminAccountCreationNotFoundReason;
    };

export type UserActiveFlowTerminationResult = {
  practiceCount: number;
  mockExamCount: number;
};

export type AdminContentKnowledgeRuntimeRepository = {
  listQuestions(
    query: AdminContentKnowledgeListQuery,
  ): Promise<AdminFlowPage<AdminQuestionOpsListDto>>;
  listPapers(
    query: AdminContentKnowledgeListQuery,
  ): Promise<AdminFlowPage<AdminPaperOpsListDto>>;
};

export type AdminAuditLogRuntimeRepository = {
  appendAuditLog(input: AppendAuditLogInput): Promise<void>;
  listAuditLogs(
    query: AdminAiAuditLogListQuery,
  ): Promise<AdminFlowPage<AuditLogListDto>>;
};

export type AppendAuditLogInput = Omit<
  AuditLogListDto["auditLogs"][number],
  "publicId" | "createdAt"
>;

export type AdminFlowRuntimeRepositories = {
  userOrgAuthRepository: AdminUserOrgAuthRuntimeRepository;
  contentKnowledgeRepository: AdminContentKnowledgeRuntimeRepository;
  auditLogRepository: AdminAuditLogRuntimeRepository;
};

const {
  admin,
  adminOrganization,
  authAccount,
  authSession,
  authUser,
  employee,
  mockExam,
  orgAuth,
  orgAuthOrganization,
  organization,
  paper,
  paperQuestion,
  personalAuth,
  practice,
  question,
  user,
} = databaseSchema;

function createLazyDatabaseGetter(
  createDatabase: () => AdminFlowRuntimeDatabase,
): () => AdminFlowRuntimeDatabase {
  let cachedDatabase: AdminFlowRuntimeDatabase | undefined;

  return () => {
    cachedDatabase ??= createDatabase();

    return cachedDatabase;
  };
}

function createPagination(
  query: Pick<
    | AdminAuthOperationListQuery
    | AdminAccountListQuery
    | AdminContentKnowledgeListQuery
    | AdminAiAuditLogListQuery,
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

type AdminUserListItem = AdminUserListDto["users"][number];
type AdminUserAuthStatus = AdminUserListItem["authStatus"];
type AdminUserListRow = {
  auth_status: AdminUserAuthStatus;
  created_at: Date;
  name: string;
  organization_name: string | null;
  organization_public_id: string | null;
  phone: string;
  public_id: string;
  status: AdminUserListItem["status"];
  user_type: AdminUserListItem["userType"];
};

const adminUserAuthStatusPriority = {
  active: 3,
  expired: 2,
  cancelled: 1,
} satisfies Record<NonNullable<AdminUserAuthStatus>, number>;

function selectAdminUserAuthStatus(
  leftStatus: AdminUserAuthStatus,
  rightStatus: AdminUserAuthStatus,
): AdminUserAuthStatus {
  if (leftStatus === null) {
    return rightStatus;
  }

  if (rightStatus === null) {
    return leftStatus;
  }

  return adminUserAuthStatusPriority[rightStatus] >
    adminUserAuthStatusPriority[leftStatus]
    ? rightStatus
    : leftStatus;
}

function mergeAdminUserListRows(rows: AdminUserListRow[]): AdminUserListRow[] {
  const rowsByPublicId = new Map<string, AdminUserListRow>();

  for (const row of rows) {
    const existingRow = rowsByPublicId.get(row.public_id);

    if (existingRow === undefined) {
      rowsByPublicId.set(row.public_id, row);
      continue;
    }

    rowsByPublicId.set(row.public_id, {
      ...existingRow,
      auth_status: selectAdminUserAuthStatus(
        existingRow.auth_status,
        row.auth_status,
      ),
      organization_name: existingRow.organization_name ?? row.organization_name,
      organization_public_id:
        existingRow.organization_public_id ?? row.organization_public_id,
    });
  }

  return Array.from(rowsByPublicId.values());
}

export function createPostgresAdminFlowRuntimeRepositories(
  options: AdminFlowRuntimeRepositoryOptions = {},
): AdminFlowRuntimeRepositories {
  const getDatabase = createLazyDatabaseGetter(
    options.createDatabase ?? createLocalRuntimeDatabase,
  );

  return {
    userOrgAuthRepository:
      createPostgresAdminUserOrgAuthRuntimeRepository(getDatabase),
    contentKnowledgeRepository:
      createPostgresAdminContentKnowledgeRuntimeRepository(getDatabase),
    auditLogRepository:
      createPostgresAdminAuditLogRuntimeRepository(getDatabase),
  };
}

function createPostgresAdminUserOrgAuthRuntimeRepository(
  getDatabase: () => AdminFlowRuntimeDatabase,
): AdminUserOrgAuthRuntimeRepository {
  return {
    async listAdminAccounts(query, visibleAdminRoles) {
      const database = getDatabase();
      const conditions: SQL[] = [
        inArray(admin.admin_role, [...visibleAdminRoles]),
      ];

      if (query.keyword !== null) {
        conditions.push(
          or(
            ilike(admin.name, `%${query.keyword}%`),
            ilike(admin.phone, `%${query.keyword}%`),
          )!,
        );
      }

      if (query.adminRole !== "all") {
        conditions.push(eq(admin.admin_role, query.adminRole));
      }

      if (query.status !== "all") {
        conditions.push(eq(admin.status, query.status));
      }

      if (query.organizationPublicId !== null) {
        const organizationAdminIds = database
          .select({ admin_id: adminOrganization.admin_id })
          .from(adminOrganization)
          .innerJoin(
            organization,
            eq(organization.id, adminOrganization.organization_id),
          )
          .where(eq(organization.public_id, query.organizationPublicId));

        conditions.push(inArray(admin.id, organizationAdminIds));
      }

      const sortColumn =
        query.sortBy === "registeredAt" ? admin.created_at : admin.updated_at;
      const sortDirection = query.sortOrder === "asc" ? asc : desc;
      const adminAccounts = await database.query.admin.findMany({
        columns: {
          admin_role: true,
          created_at: true,
          name: true,
          phone: true,
          public_id: true,
          status: true,
        },
        limit: query.pageSize,
        offset: (query.page - 1) * query.pageSize,
        orderBy: [sortDirection(sortColumn), sortDirection(admin.id)],
        where: and(...conditions),
        with: {
          adminOrganizations: {
            with: {
              organization: {
                columns: {
                  name: true,
                  public_id: true,
                },
              },
            },
          },
        },
      });
      const [totalRow] = await database
        .select({ value: count() })
        .from(admin)
        .where(and(...conditions));

      return {
        adminAccounts: adminAccounts.map((adminAccount) => ({
          accountDomain: "admin",
          adminRole: adminAccount.admin_role,
          name: adminAccount.name,
          organizations: adminAccount.adminOrganizations.map(
            ({ organization: linkedOrganization }) => ({
              name: linkedOrganization.name,
              publicId: linkedOrganization.public_id,
            }),
          ),
          phone: adminAccount.phone,
          publicId: adminAccount.public_id,
          registeredAt: adminAccount.created_at.toISOString(),
          status: adminAccount.status,
        })),
        pagination: createPagination(query, totalRow?.value ?? 0),
      };
    },
    async listUsers(query) {
      const database = getDatabase();
      const conditions = createUserConditions(query);
      const sortColumn =
        query.sortBy === "registeredAt" || query.sortBy === "createdAt"
          ? user.created_at
          : user.updated_at;
      const personalAuthStatusByUser = database
        .select({
          auth_status: sql<AdminUserAuthStatus>`case
            when bool_or(${personalAuth.status} = 'active') then 'active'
            when bool_or(${personalAuth.status} = 'expired') then 'expired'
            when bool_or(${personalAuth.status} = 'cancelled') then 'cancelled'
            else null
          end`.as("auth_status"),
          user_id: personalAuth.user_id,
        })
        .from(personalAuth)
        .groupBy(personalAuth.user_id)
        .as("personal_auth_status_by_user");
      const rows = await database
        .select({
          auth_status: personalAuthStatusByUser.auth_status,
          created_at: user.created_at,
          name: user.name,
          organization_name: organization.name,
          organization_public_id: organization.public_id,
          phone: user.phone,
          public_id: user.public_id,
          status: user.status,
          user_type: user.user_type,
        })
        .from(user)
        .leftJoin(employee, eq(employee.user_id, user.id))
        .leftJoin(organization, eq(organization.id, employee.organization_id))
        .leftJoin(
          personalAuthStatusByUser,
          eq(personalAuthStatusByUser.user_id, user.id),
        )
        .where(and(...conditions))
        .orderBy(
          query.sortOrder === "asc" ? asc(sortColumn) : desc(sortColumn),
          query.sortOrder === "asc" ? asc(user.id) : desc(user.id),
        )
        .limit(query.pageSize)
        .offset((query.page - 1) * query.pageSize);
      const [totalRow] = await database
        .select({ value: count() })
        .from(user)
        .where(and(...conditions));

      return {
        users: mergeAdminUserListRows(rows).map((row) => ({
          publicId: row.public_id,
          phone: row.phone,
          name: row.name,
          registeredAt: row.created_at.toISOString(),
          status: row.status,
          userType: row.user_type,
          organizationPublicId: row.organization_public_id,
          organizationName: row.organization_name,
          authStatus: row.auth_status,
        })),
        pagination: createPagination(query, totalRow?.value ?? 0),
      };
    },
    async getUserDetail(publicId) {
      const database = getDatabase();
      const [userDetailRow] = await database
        .select({
          created_at: user.created_at,
          employee_public_id: employee.public_id,
          internal_organization_id: organization.id,
          internal_user_id: user.id,
          name: user.name,
          organization_name: organization.name,
          organization_public_id: organization.public_id,
          organization_tier: organization.org_tier,
          phone: user.phone,
          public_id: user.public_id,
          status: user.status,
          user_type: user.user_type,
        })
        .from(user)
        .leftJoin(employee, eq(employee.user_id, user.id))
        .leftJoin(organization, eq(organization.id, employee.organization_id))
        .where(eq(user.public_id, publicId))
        .limit(1);

      if (userDetailRow === undefined) {
        return null;
      }

      const personalAuthRows = await database
        .select({
          expires_at: personalAuth.expires_at,
          level: personalAuth.level,
          profession: personalAuth.profession,
          public_id: personalAuth.public_id,
          starts_at: personalAuth.starts_at,
          status: personalAuth.status,
        })
        .from(personalAuth)
        .where(eq(personalAuth.user_id, userDetailRow.internal_user_id))
        .orderBy(desc(personalAuth.updated_at));
      const organizationAuthRows =
        userDetailRow.internal_organization_id === null
          ? []
          : await database
              .select({
                account_quota: orgAuth.account_quota,
                auth_scope_type: orgAuth.auth_scope_type,
                expires_at: orgAuth.expires_at,
                internal_org_auth_id: orgAuth.id,
                internal_purchaser_organization_id:
                  orgAuth.purchaser_organization_id,
                level: orgAuth.level,
                profession: orgAuth.profession,
                public_id: orgAuth.public_id,
                starts_at: orgAuth.starts_at,
                status: orgAuth.status,
                used_quota: orgAuth.used_quota,
              })
              .from(orgAuth)
              .innerJoin(
                orgAuthOrganization,
                eq(orgAuthOrganization.org_auth_id, orgAuth.id),
              )
              .where(
                eq(
                  orgAuthOrganization.organization_id,
                  userDetailRow.internal_organization_id,
                ),
              )
              .orderBy(desc(orgAuth.updated_at));
      const orgAuthIds = organizationAuthRows.map(
        (authorizationRow) => authorizationRow.internal_org_auth_id,
      );
      const scopeOrganizationRows =
        orgAuthIds.length === 0
          ? []
          : await database
              .select({
                internal_org_auth_id: orgAuthOrganization.org_auth_id,
                organization_public_id: organization.public_id,
              })
              .from(orgAuthOrganization)
              .innerJoin(
                organization,
                eq(organization.id, orgAuthOrganization.organization_id),
              )
              .where(inArray(orgAuthOrganization.org_auth_id, orgAuthIds));
      const purchaserOrganizationIds = [
        ...new Set(
          organizationAuthRows.map(
            (authorizationRow) =>
              authorizationRow.internal_purchaser_organization_id,
          ),
        ),
      ];
      const purchaserOrganizationRows =
        purchaserOrganizationIds.length === 0
          ? []
          : await database
              .select({
                internal_organization_id: organization.id,
                name: organization.name,
              })
              .from(organization)
              .where(inArray(organization.id, purchaserOrganizationIds));
      const scopeOrganizationPublicIdsByAuth = new Map<number, string[]>();

      scopeOrganizationRows.forEach((scopeRow) => {
        const currentPublicIds =
          scopeOrganizationPublicIdsByAuth.get(scopeRow.internal_org_auth_id) ??
          [];

        scopeOrganizationPublicIdsByAuth.set(scopeRow.internal_org_auth_id, [
          ...currentPublicIds,
          scopeRow.organization_public_id,
        ]);
      });

      const purchaserNameById = new Map(
        purchaserOrganizationRows.map((organizationRow) => [
          organizationRow.internal_organization_id,
          organizationRow.name,
        ]),
      );
      const authorizations: AdminUserDetailDto["authorizations"] = [
        ...personalAuthRows.map((authorizationRow) => ({
          publicId: authorizationRow.public_id,
          authorizationType: "personal_auth" as const,
          purchaserName: null,
          authScopeType: null,
          profession: authorizationRow.profession,
          level: authorizationRow.level,
          accountQuota: null,
          usedQuota: null,
          startsAt: formatNullableDate(authorizationRow.starts_at),
          expiresAt: formatNullableDate(authorizationRow.expires_at),
          status: authorizationRow.status,
          organizationPublicIds: [],
        })),
        ...organizationAuthRows.map((authorizationRow) => ({
          publicId: authorizationRow.public_id,
          authorizationType: "org_auth" as const,
          purchaserName:
            purchaserNameById.get(
              authorizationRow.internal_purchaser_organization_id,
            ) ?? null,
          authScopeType: authorizationRow.auth_scope_type,
          profession: authorizationRow.profession,
          level: authorizationRow.level,
          accountQuota: authorizationRow.account_quota,
          usedQuota: authorizationRow.used_quota,
          startsAt: formatNullableDate(authorizationRow.starts_at),
          expiresAt: formatNullableDate(authorizationRow.expires_at),
          status: authorizationRow.status,
          organizationPublicIds:
            scopeOrganizationPublicIdsByAuth.get(
              authorizationRow.internal_org_auth_id,
            ) ?? [],
        })),
      ];

      return {
        user: {
          publicId: userDetailRow.public_id,
          phone: userDetailRow.phone,
          name: userDetailRow.name,
          registeredAt: userDetailRow.created_at.toISOString(),
          status: userDetailRow.status,
          userType: userDetailRow.user_type,
          organizationPublicId: userDetailRow.organization_public_id,
          organizationName: userDetailRow.organization_name,
          authStatus: authorizations[0]?.status ?? null,
        },
        enterpriseBinding:
          userDetailRow.employee_public_id === null ||
          userDetailRow.organization_public_id === null ||
          userDetailRow.organization_name === null ||
          userDetailRow.organization_tier === null
            ? null
            : {
                employeePublicId: userDetailRow.employee_public_id,
                organizationPublicId: userDetailRow.organization_public_id,
                organizationName: userDetailRow.organization_name,
                orgTier: userDetailRow.organization_tier,
                status: userDetailRow.status,
              },
        authorizations,
      };
    },
    async createAdminAccount(input) {
      const database = getDatabase();
      const [existingAdminRow] = await database
        .select({ public_id: admin.public_id })
        .from(admin)
        .where(eq(admin.phone, input.phone))
        .limit(1);

      if (existingAdminRow !== undefined) {
        return {
          reason: "admin_phone_exists",
          status: "conflict",
        };
      }

      const [existingUserRow] = await database
        .select({ public_id: user.public_id })
        .from(user)
        .where(eq(user.phone, input.phone))
        .limit(1);

      if (existingUserRow !== undefined) {
        return {
          reason: "learner_employee_phone_exists",
          status: "conflict",
        };
      }

      const targetOrganizationRow =
        input.organizationPublicId === null
          ? null
          : (
              await database
                .select({ id: organization.id })
                .from(organization)
                .where(
                  and(
                    eq(organization.public_id, input.organizationPublicId),
                    eq(organization.status, "active"),
                  ),
                )
                .limit(1)
            )[0];

      if (
        input.organizationPublicId !== null &&
        targetOrganizationRow === undefined
      ) {
        return {
          reason: "organization_not_found",
          status: "not_found",
        };
      }

      const now = new Date();
      const authUserId = `auth-user-${randomUUID()}`;
      const adminPublicId = `admin-public-${randomUUID()}`;
      const passwordHash = await hashPassword(input.password);
      const managedBy = input.adminRole.startsWith("org_")
        ? "ops_admin_scoped_org_admin"
        : "super_admin";

      await database.transaction(async (transaction) => {
        await transaction.insert(authUser).values({
          created_at: now,
          email: `admin-${randomUUID()}@tiku.local`,
          email_verified: now,
          id: authUserId,
          image: null,
          name: input.name,
          updated_at: now,
        });
        await transaction.insert(authAccount).values({
          access_token: null,
          access_token_expires_at: null,
          account_id: authUserId,
          created_at: now,
          id: `auth-account-${randomUUID()}`,
          id_token: null,
          [authPasswordColumn]: passwordHash,
          provider_id: credentialProviderId,
          refresh_token: null,
          refresh_token_expires_at: null,
          scope: null,
          updated_at: now,
          user_id: authUserId,
        });
        const [createdAdminRow] = await transaction
          .insert(admin)
          .values({
            admin_role: input.adminRole,
            auth_user_id: authUserId,
            created_at: now,
            name: input.name,
            phone: input.phone,
            public_id: adminPublicId,
            status: "active",
            updated_at: now,
          })
          .returning({ id: admin.id });

        if (
          targetOrganizationRow !== null &&
          targetOrganizationRow !== undefined &&
          createdAdminRow !== undefined
        ) {
          await transaction.insert(adminOrganization).values({
            admin_id: createdAdminRow.id,
            created_at: now,
            organization_id: targetOrganizationRow.id,
          });
        }
      });

      return {
        adminAccount: {
          accountDomain: "admin",
          adminRole: input.adminRole,
          managedBy,
          name: input.name,
          organizationPublicId: input.organizationPublicId,
          publicId: adminPublicId,
          registeredAt: now.toISOString(),
          status: "active",
        },
        status: "created",
      };
    },
    async resetUserPassword(publicId, input) {
      const database = getDatabase();
      const [userRow] = await database
        .select({
          auth_user_id: user.auth_user_id,
        })
        .from(user)
        .where(and(eq(user.public_id, publicId), isNotNull(user.auth_user_id)))
        .limit(1);

      if (
        userRow?.auth_user_id === undefined ||
        userRow.auth_user_id === null
      ) {
        return false;
      }

      const passwordHash = await hashPassword(input.newPassword);
      const rows = await database
        .update(authAccount)
        .set({
          [authPasswordColumn]: passwordHash,
          updated_at: new Date(),
        })
        .where(eq(authAccount.user_id, userRow.auth_user_id))
        .returning({
          id: authAccount.id,
        });

      return rows.length > 0;
    },
    async disableUser(publicId) {
      return updateUserStatus(getDatabase(), publicId, "disabled");
    },
    async enableUser(publicId) {
      return updateUserStatus(getDatabase(), publicId, "active");
    },
    async revokeUserSessions(publicId) {
      return revokeUserSessions(getDatabase(), publicId);
    },
    async terminateUserActiveFlows(publicId) {
      return terminateUserActiveFlows(getDatabase(), publicId);
    },
  };
}

function formatNullableDate(value: Date | null): string | null {
  return value === null ? null : value.toISOString();
}

async function updateUserStatus(
  database: AdminFlowRuntimeDatabase,
  publicId: string,
  status: "active" | "disabled",
): Promise<boolean> {
  const rows = await database
    .update(user)
    .set({
      status,
      disabled_at: status === "disabled" ? new Date() : null,
      locked_until_at: status === "active" ? null : undefined,
      updated_at: new Date(),
    })
    .where(eq(user.public_id, publicId))
    .returning({
      id: user.id,
    });

  return rows.length > 0;
}

async function revokeUserSessions(
  database: AdminFlowRuntimeDatabase,
  publicId: string,
): Promise<boolean> {
  const [userRow] = await database
    .select({
      auth_user_id: user.auth_user_id,
    })
    .from(user)
    .where(eq(user.public_id, publicId))
    .limit(1);

  if (userRow === undefined) {
    return false;
  }

  if (userRow.auth_user_id === null) {
    return true;
  }

  await database
    .delete(authSession)
    .where(eq(authSession.user_id, userRow.auth_user_id));

  return true;
}

async function terminateUserActiveFlows(
  database: AdminFlowRuntimeDatabase,
  publicId: string,
): Promise<UserActiveFlowTerminationResult> {
  const [userRow] = await database
    .select({ id: user.id })
    .from(user)
    .where(eq(user.public_id, publicId))
    .limit(1);

  if (userRow === undefined) {
    return { practiceCount: 0, mockExamCount: 0 };
  }

  const now = new Date();
  const terminatedPractices = await database
    .update(practice)
    .set({
      practice_status: "terminated",
      terminated_at: now,
      termination_reason: "account_disabled",
      updated_at: now,
    })
    .where(
      and(
        eq(practice.user_id, userRow.id),
        eq(practice.practice_status, "in_progress"),
      ),
    )
    .returning({ id: practice.id });
  const terminatedMockExams = await database
    .update(mockExam)
    .set({
      exam_status: "terminated",
      terminated_at: now,
      termination_reason: "account_disabled",
      updated_at: now,
    })
    .where(
      and(
        eq(mockExam.user_id, userRow.id),
        inArray(mockExam.exam_status, [
          "in_progress",
          "scoring",
          "scoring_partial_failed",
        ]),
      ),
    )
    .returning({ id: mockExam.id });

  return {
    practiceCount: terminatedPractices.length,
    mockExamCount: terminatedMockExams.length,
  };
}

function createPostgresAdminContentKnowledgeRuntimeRepository(
  getDatabase: () => AdminFlowRuntimeDatabase,
): AdminContentKnowledgeRuntimeRepository {
  return {
    async listQuestions(queryInput) {
      const database = getDatabase();
      const conditions = createQuestionConditions(queryInput);
      const rows = await database
        .select({
          id: question.id,
          public_id: question.public_id,
          question_type: question.question_type,
          profession: question.profession,
          level: question.level,
          subject: question.subject,
          stem_rich_text: question.stem_rich_text,
          status: question.status,
          updated_at: question.updated_at,
        })
        .from(question)
        .where(and(...conditions))
        .orderBy(
          queryInput.sortOrder === "asc"
            ? asc(question.updated_at)
            : desc(question.updated_at),
        )
        .limit(queryInput.pageSize)
        .offset((queryInput.page - 1) * queryInput.pageSize);
      const [totalRow] = await database
        .select({ value: count() })
        .from(question)
        .where(and(...conditions));
      const referencedPaperCounts = await listReferencedPaperCounts(
        database,
        rows.map((row) => row.id),
      );

      return {
        questions: rows.map((row) => ({
          publicId: row.public_id,
          stemSummary: summarizeText(row.stem_rich_text),
          questionType: row.question_type,
          profession: row.profession,
          level: row.level,
          subject: row.subject,
          status: row.status,
          knowledgeNodeNames: [],
          tagNames: [],
          referencedPaperCount: referencedPaperCounts.get(row.id) ?? 0,
          updatedAt: row.updated_at.toISOString(),
        })),
        pagination: createPagination(queryInput, totalRow?.value ?? 0),
      };
    },
    async listPapers(queryInput) {
      const database = getDatabase();
      const conditions = createPaperConditions(queryInput);
      const rows = await database
        .select({
          id: paper.id,
          public_id: paper.public_id,
          name: paper.name,
          profession: paper.profession,
          level: paper.level,
          subject: paper.subject,
          paper_status: paper.paper_status,
          paper_type: paper.paper_type,
          year: paper.year,
          total_score: paper.total_score,
          source: paper.source,
          updated_at: paper.updated_at,
        })
        .from(paper)
        .where(and(...conditions))
        .orderBy(
          queryInput.sortOrder === "asc"
            ? asc(paper.updated_at)
            : desc(paper.updated_at),
        )
        .limit(queryInput.pageSize)
        .offset((queryInput.page - 1) * queryInput.pageSize);
      const [totalRow] = await database
        .select({ value: count() })
        .from(paper)
        .where(and(...conditions));
      const paperIds = rows.map((row) => row.id);
      const questionCounts = await listPaperQuestionCounts(database, paperIds);
      const questionTypeDistributions =
        await listPaperQuestionTypeDistributions(database, paperIds);
      const mockExamCounts = await listMockExamCounts(database, paperIds);

      return {
        papers: rows.map((row) => ({
          publicId: row.public_id,
          name: row.name,
          profession: row.profession,
          level: row.level,
          subject: row.subject,
          paperStatus: row.paper_status,
          paperType: row.paper_type ?? "mock_paper",
          year: row.year,
          totalScore: row.total_score ?? "0.0",
          questionCount: questionCounts.get(row.id) ?? 0,
          questionTypeDistribution: questionTypeDistributions.get(row.id) ?? [],
          mockExamCount: mockExamCounts.get(row.id) ?? 0,
          sourceFileName: row.source,
          publishValidationSummary:
            row.paper_status === "published" ? "published seed paper" : null,
          updatedAt: row.updated_at.toISOString(),
        })),
        pagination: createPagination(queryInput, totalRow?.value ?? 0),
      };
    },
  };
}

type AuditLogDatabaseRow = {
  public_id: string;
  actor_public_id: string;
  actor_role: string;
  action_type: string;
  target_resource_type: string;
  target_public_id: string | null;
  result_status: "success" | "failed";
  metadata_summary: string | null;
  request_ip: string | null;
  created_at: Date | string;
};

type CountDatabaseRow = {
  value: number;
};

type DrizzleSqlExecutor = {
  execute<TRow extends Record<string, unknown>>(query: SQL): Promise<TRow[]>;
};

function createPostgresAdminAuditLogRuntimeRepository(
  getDatabase: () => AdminFlowRuntimeDatabase,
): AdminAuditLogRuntimeRepository {
  return {
    async appendAuditLog(input) {
      const database = getDatabase();
      const publicId = `audit-log-${randomUUID()}`;

      try {
        await executeSql(
          database,
          sql`
          insert into audit_log (
            public_id,
            actor_public_id,
            actor_role,
            action_type,
            target_resource_type,
            target_public_id,
            result_status,
            metadata_summary,
            request_ip,
            created_at
          )
          values (
            ${publicId},
            ${input.actorPublicId},
            ${input.actorRole},
            ${input.actionType},
            ${input.targetResourceType},
            ${input.targetPublicId},
            ${input.resultStatus},
            ${input.metadataSummary},
            ${input.requestIp},
            now()
          )
        `,
        );
      } catch (error) {
        if (!isUndefinedTableError(error)) {
          throw error;
        }
      }
    },
    async listAuditLogs(query) {
      const database = getDatabase();
      const keywordCondition =
        query.keyword === null
          ? sql`true`
          : sql`(
              actor_public_id ilike ${`%${query.keyword}%`}
              or actor_role ilike ${`%${query.keyword}%`}
              or action_type ilike ${`%${query.keyword}%`}
              or target_resource_type ilike ${`%${query.keyword}%`}
              or target_public_id ilike ${`%${query.keyword}%`}
              or metadata_summary ilike ${`%${query.keyword}%`}
            )`;
      const orderBy =
        query.sortOrder === "asc" ? sql`created_at asc` : sql`created_at desc`;

      try {
        const rows = await executeSql<AuditLogDatabaseRow>(
          database,
          sql`
          select
            public_id,
            actor_public_id,
            actor_role,
            action_type,
            target_resource_type,
            target_public_id,
            result_status,
            metadata_summary,
            request_ip,
            created_at
          from audit_log
          where ${keywordCondition}
          order by ${orderBy}
          limit ${query.pageSize}
          offset ${(query.page - 1) * query.pageSize}
        `,
        );
        const [totalRow] = await executeSql<CountDatabaseRow>(
          database,
          sql`
          select count(*)::int as value
          from audit_log
          where ${keywordCondition}
        `,
        );

        return {
          auditLogs: rows.map(mapAuditLogRow),
          pagination: createPagination(query, totalRow?.value ?? 0),
        };
      } catch (error) {
        if (!isUndefinedTableError(error)) {
          throw error;
        }

        return {
          auditLogs: [],
          pagination: createPagination(query, 0),
        };
      }
    },
  };
}

async function executeSql<TRow extends Record<string, unknown>>(
  database: AdminFlowRuntimeDatabase,
  query: SQL,
): Promise<TRow[]> {
  return (database as unknown as DrizzleSqlExecutor).execute<TRow>(query);
}

function mapAuditLogRow(
  row: AuditLogDatabaseRow,
): AuditLogListDto["auditLogs"][number] {
  return {
    publicId: row.public_id,
    actorPublicId: row.actor_public_id,
    actorRole: row.actor_role,
    actionType: row.action_type,
    targetResourceType: row.target_resource_type,
    targetPublicId: row.target_public_id,
    resultStatus: row.result_status,
    metadataSummary: row.metadata_summary,
    requestIp: row.request_ip,
    createdAt:
      row.created_at instanceof Date
        ? row.created_at.toISOString()
        : new Date(row.created_at).toISOString(),
  };
}

function isUndefinedTableError(error: unknown): boolean {
  if (typeof error !== "object" || error === null) {
    return false;
  }

  const errorCode = (error as { code?: unknown }).code;

  if (errorCode === "42P01") {
    return true;
  }

  return isUndefinedTableError((error as { cause?: unknown }).cause);
}

function createUserConditions(query: AdminAuthOperationListQuery): SQL[] {
  const conditions: SQL[] = [];

  if (query.keyword !== null) {
    conditions.push(
      or(
        ilike(user.name, `%${query.keyword}%`),
        ilike(user.phone, `%${query.keyword}%`),
      )!,
    );
  }

  if (query.userType !== "all") {
    conditions.push(eq(user.user_type, query.userType));
  }

  if (query.status === "active" || query.status === "disabled") {
    conditions.push(eq(user.status, query.status));
  }

  return conditions;
}

function createQuestionConditions(
  queryInput: AdminContentKnowledgeListQuery,
): SQL[] {
  const conditions: SQL[] = [];

  if (queryInput.keyword !== null) {
    conditions.push(ilike(question.stem_rich_text, `%${queryInput.keyword}%`));
  }

  if (queryInput.status === "available" || queryInput.status === "disabled") {
    conditions.push(eq(question.status, queryInput.status));
  }

  if (queryInput.profession !== "all") {
    conditions.push(eq(question.profession, queryInput.profession));
  }

  if (queryInput.level !== null) {
    conditions.push(eq(question.level, queryInput.level));
  }

  return conditions;
}

function createPaperConditions(
  queryInput: AdminContentKnowledgeListQuery,
): SQL[] {
  const conditions: SQL[] = [];

  if (queryInput.keyword !== null) {
    conditions.push(ilike(paper.name, `%${queryInput.keyword}%`));
  }

  if (
    queryInput.status === "draft" ||
    queryInput.status === "published" ||
    queryInput.status === "archived"
  ) {
    conditions.push(eq(paper.paper_status, queryInput.status));
  }

  if (queryInput.profession !== "all") {
    conditions.push(eq(paper.profession, queryInput.profession));
  }

  if (queryInput.level !== null) {
    conditions.push(eq(paper.level, queryInput.level));
  }

  return conditions;
}

async function listReferencedPaperCounts(
  database: AdminFlowRuntimeDatabase,
  questionIds: number[],
): Promise<Map<number, number>> {
  if (questionIds.length === 0) {
    return new Map();
  }

  const rows = await database
    .select({
      question_id: paperQuestion.question_id,
      value: count(),
    })
    .from(paperQuestion)
    .where(inArray(paperQuestion.question_id, questionIds))
    .groupBy(paperQuestion.question_id);

  return new Map(rows.map((row) => [row.question_id, row.value]));
}

async function listPaperQuestionCounts(
  database: AdminFlowRuntimeDatabase,
  paperIds: number[],
): Promise<Map<number, number>> {
  if (paperIds.length === 0) {
    return new Map();
  }

  const rows = await database
    .select({
      paper_id: paperQuestion.paper_id,
      value: count(),
    })
    .from(paperQuestion)
    .where(inArray(paperQuestion.paper_id, paperIds))
    .groupBy(paperQuestion.paper_id);

  return new Map(rows.map((row) => [row.paper_id, row.value]));
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function getCanonicalQuestionType(value: unknown): QuestionType | null {
  if (!isRecord(value)) {
    return null;
  }

  const questionType = value.questionType;

  return typeof questionType === "string" && questionTypeSet.has(questionType)
    ? (questionType as QuestionType)
    : null;
}

async function listPaperQuestionTypeDistributions(
  database: AdminFlowRuntimeDatabase,
  paperIds: number[],
): Promise<
  Map<
    number,
    AdminPaperOpsListDto["papers"][number]["questionTypeDistribution"]
  >
> {
  if (paperIds.length === 0) {
    return new Map();
  }

  const rows = await database
    .select({
      paper_id: paperQuestion.paper_id,
      question_snapshot: paperQuestion.question_snapshot,
    })
    .from(paperQuestion)
    .where(inArray(paperQuestion.paper_id, paperIds));
  const distributionByPaperId = new Map<number, Map<QuestionType, number>>();

  for (const row of rows) {
    const questionType = getCanonicalQuestionType(row.question_snapshot);

    if (questionType === null) {
      continue;
    }

    const distribution =
      distributionByPaperId.get(row.paper_id) ??
      new Map<QuestionType, number>();
    distribution.set(questionType, (distribution.get(questionType) ?? 0) + 1);
    distributionByPaperId.set(row.paper_id, distribution);
  }

  return new Map(
    [...distributionByPaperId.entries()].map(([paperId, distribution]) => [
      paperId,
      questionTypeValues.flatMap((questionType) => {
        const value = distribution.get(questionType);

        return value === undefined
          ? []
          : [
              {
                questionType,
                count: value,
              },
            ];
      }),
    ]),
  );
}

async function listMockExamCounts(
  database: AdminFlowRuntimeDatabase,
  paperIds: number[],
): Promise<Map<number, number>> {
  if (paperIds.length === 0) {
    return new Map();
  }

  const rows = await database
    .select({
      paper_id: mockExam.paper_id,
      value: count(),
    })
    .from(mockExam)
    .where(inArray(mockExam.paper_id, paperIds))
    .groupBy(mockExam.paper_id);

  return new Map(rows.map((row) => [row.paper_id, row.value]));
}

function summarizeText(value: string): string {
  const plainText = value
    .replace(/<[^>]*>/gu, " ")
    .replace(/\s+/gu, " ")
    .trim();

  return plainText.length > 80 ? `${plainText.slice(0, 77)}...` : plainText;
}

function createLocalRuntimeDatabase(): AdminFlowRuntimeDatabase {
  return createRuntimeDatabaseForSchema(
    databaseSchema,
    "DATABASE_URL is required for admin flow runtime.",
  );
}
