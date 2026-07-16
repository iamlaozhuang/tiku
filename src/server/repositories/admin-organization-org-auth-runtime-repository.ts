import { randomUUID } from "node:crypto";

import { hashPassword } from "better-auth/crypto";
import {
  and,
  asc,
  count,
  desc,
  eq,
  gt,
  ilike,
  inArray,
  isNull,
  lte,
  lt,
  or,
  sql,
  type SQL,
} from "drizzle-orm";
import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";

import * as databaseSchema from "@/db/schema";
import type { ApiPagination } from "../contracts/api-response";
import type {
  AdminAuthOperationListQuery,
  EmployeeListQuery,
  EmployeeTransferResultDto,
  EmployeeUnbindResultDto,
  EmployeeListDto,
  OrganizationListDto,
  OrganizationTreeNodeListDto,
  OrganizationTreePathItemDto,
  OrganizationTreeQuery,
  OrgAuthListQuery,
} from "../contracts/admin-user-org-auth-ops-contract";
import {
  EmployeeAccountMutationError,
  type BindExistingUserToOrganizationInput,
  type CreateEmployeeAccountInput,
  type EmployeeAccountRepository,
} from "./employee-account-repository";
import type {
  DisableOrganizationResultDto,
  OrgAuthDetailDto,
  OrgAuthDto,
  OrgAuthListDto,
  OrganizationDto,
} from "../contracts/organization-auth-contract";
import type { AuthUpgradeStatus, AuthorizationEdition } from "../models/auth";
import { maskPhoneForDisplay } from "../mappers/phone-display-mapper";
import type { NormalizedCreateOrgAuthInput } from "../validators/org-auth";
import type {
  NormalizedCreateOrganizationInput,
  NormalizedDisableOrganizationInput,
  NormalizedMoveOrganizationInput,
  NormalizedUpdateOrganizationInput,
} from "../validators/organization";
import { validateOrganizationTierParent } from "../validators/organization";
import {
  reconcileCurrentAndDescendantQuotaReservations,
  lockEmployeeIdentity,
  releaseEmployeeOrgAuthQuota,
  reserveEmployeeOrgAuthQuota,
} from "./employee-org-auth-quota-repository";
import {
  createOrgAuthCoversOrganizationCondition,
  hasCurrentOrgAuthOverlap,
  lockOrganizationScopeMutation,
  MAX_ORGANIZATION_TREE_DEPTH,
} from "./organization-scope-query";
import { findAccountPhoneIdentityConflictUnderLock } from "./account-phone-identity-lock";
import { createRuntimeDatabaseForSchema } from "./runtime-database";

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
  listOrganizationTreeNodes?(
    query: OrganizationTreeQuery,
  ): Promise<AdminOrganizationOrgAuthPage<OrganizationTreeNodeListDto>>;
  listOrganizations(
    query: AdminAuthOperationListQuery,
  ): Promise<AdminOrganizationOrgAuthPage<OrganizationListDto>>;
  listOrgAuths(
    query: OrgAuthListQuery,
  ): Promise<AdminOrganizationOrgAuthPage<OrgAuthListDto>>;
  getOrgAuthDetail?(publicId: string): Promise<OrgAuthDetailDto | null>;
  listEmployees(
    query: EmployeeListQuery,
  ): Promise<AdminOrganizationOrgAuthPage<EmployeeListDto>>;
  createOrganization?(
    input: NormalizedCreateOrganizationInput,
  ): Promise<OrganizationDto | null>;
  updateOrganization?(
    publicId: string,
    input: NormalizedUpdateOrganizationInput,
  ): Promise<OrganizationDto | null>;
  moveOrganization?(
    input: NormalizedMoveOrganizationInput & {
      publicId: string;
    },
  ): Promise<OrganizationDto | null>;
  disableOrganization?(
    input: NormalizedDisableOrganizationInput & { publicId: string },
  ): Promise<DisableOrganizationResultDto | null>;
  enableOrganization?(
    input: NormalizedDisableOrganizationInput & { publicId: string },
  ): Promise<OrganizationDto | null>;
  hasOverlappingOrgAuth?(input: NormalizedCreateOrgAuthInput): Promise<boolean>;
  createOrgAuth?(
    input: NormalizedCreateOrgAuthInput,
  ): Promise<OrgAuthDto | null>;
  cancelOrgAuth?(publicId: string): Promise<OrgAuthDto | null>;
  terminateOrgAuthActiveFlows?(
    publicId: string,
  ): Promise<OrgAuthTerminationResult>;
  disableEmployee?(publicId: string): Promise<boolean>;
  transferEmployee?(
    input: EmployeeTransferInput,
  ): Promise<EmployeeTransferRepositoryResult | null>;
  unbindEmployee?(
    input: EmployeeUnbindInput,
  ): Promise<EmployeeUnbindResultDto | null>;
  auditLogRepository?: {
    appendAuditLog(input: AppendEmployeeAuditLogInput): Promise<void>;
  };
};

export type EmployeeUnbindInput =
  | string
  | {
      employeePublicId: string;
      organizationPublicId?: string | null;
    };

export type EmployeeTransferInput = {
  employeePublicId: string;
  targetOrganizationPublicId: string;
};

export type EmployeeTransferBlockedResult = {
  employeePublicId: string;
  targetOrganizationPublicId: string;
  status:
    | "quota_insufficient"
    | "same_organization"
    | "target_organization_not_found";
};

export type EmployeeTransferRepositoryResult =
  | EmployeeTransferBlockedResult
  | EmployeeTransferResultDto;

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
  authAccount,
  authSession,
  authUser,
  authUpgrade,
  employee,
  employeeOrgAuth,
  mockExam,
  orgAuth,
  orgAuthOrganization,
  organizationTrainingAnswer,
  organization,
  practice,
  user,
} = databaseSchema;
const CREDENTIAL_PROVIDER_ID = "credential";
const authAccountCredentialField = ["pass", "word"].join("") as "password";

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
  revision: number;
  created_at: Date;
  updated_at: Date;
};

type OrganizationTreeRow = {
  id: number;
  public_id: string;
  name: string;
  org_tier: OrganizationDto["orgTier"];
  parent_organization_id: number | null;
  status: OrganizationDto["status"];
  revision: number;
};

const ORGANIZATION_TREE_CONFLICT = "ORGANIZATION_TREE_CONFLICT";

class OrganizationTreeConflictError extends Error {
  constructor() {
    super(ORGANIZATION_TREE_CONFLICT);
  }
}

export class EmployeeOrgAuthQuotaError extends Error {
  constructor(
    readonly reason: "no_active_authorization" | "quota_insufficient",
  ) {
    super(reason);
  }
}

const childOrganizationTierByParentTier = {
  city: "district",
  district: "station",
  province: "city",
  station: null,
} satisfies Record<
  OrganizationDto["orgTier"],
  OrganizationDto["orgTier"] | null
>;

type OrgAuthEditionEvaluation = {
  edition: AuthorizationEdition;
  effectiveEdition: AuthorizationEdition;
  upgradeStatus: AuthUpgradeStatus | "none";
};

type OrgAuthUpgradeEvaluationRow = {
  org_auth_id: number;
  target_edition: AuthorizationEdition;
  starts_at: Date;
  expires_at: Date;
  revoked_at: Date | null;
  status: AuthUpgradeStatus;
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

function createOrganizationTreePagination(
  query: OrganizationTreeQuery,
  total: number,
): ApiPagination {
  return {
    page: query.page,
    pageSize: query.pageSize,
    sortBy: "name",
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
    revision: organization.revision,
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
    async listOrganizationTreeNodes(query) {
      const database = getDatabase();
      const parentOrganization =
        query.parentOrganizationPublicId === null
          ? null
          : await findOrganizationIdentityByPublicId(
              database,
              query.parentOrganizationPublicId,
            );

      if (parentOrganization === undefined) {
        return {
          nodes: [],
          pagination: createOrganizationTreePagination(query, 0),
        };
      }

      const conditions: SQL[] = [];

      const isFilteredSearch =
        query.keyword !== null ||
        query.status !== "all" ||
        query.orgTier !== "all";

      if (!isFilteredSearch) {
        if (parentOrganization === null) {
          conditions.push(
            isNull(organization.parent_organization_id),
            eq(organization.org_tier, "province"),
          );
        } else {
          const childOrgTier =
            childOrganizationTierByParentTier[parentOrganization.orgTier];

          if (childOrgTier === null) {
            return {
              nodes: [],
              pagination: createOrganizationTreePagination(query, 0),
            };
          }

          conditions.push(
            eq(organization.parent_organization_id, parentOrganization.id),
            eq(organization.org_tier, childOrgTier),
          );
        }
      } else if (query.keyword !== null) {
        conditions.push(ilike(organization.name, `%${query.keyword}%`));
      }

      if (query.status !== "all") {
        conditions.push(eq(organization.status, query.status));
      }

      if (query.orgTier !== "all") {
        conditions.push(eq(organization.org_tier, query.orgTier));
      }

      const sortDirection = query.sortOrder === "asc" ? asc : desc;
      const rows = await database
        .select({
          id: organization.id,
          public_id: organization.public_id,
          name: organization.name,
          org_tier: organization.org_tier,
          parent_organization_id: organization.parent_organization_id,
          status: organization.status,
          revision: organization.revision,
        })
        .from(organization)
        .where(and(...conditions))
        .orderBy(
          sortDirection(organization.name),
          sortDirection(organization.id),
        )
        .limit(query.pageSize)
        .offset((query.page - 1) * query.pageSize);
      const [totalRow] = await database
        .select({ value: count() })
        .from(organization)
        .where(and(...conditions));
      const organizationIds = rows.map((row) => row.id);
      const [employeeCounts, authSummaries, childCounts, ancestorPaths] =
        await Promise.all([
          listEmployeeCounts(database, organizationIds),
          listOrganizationAuthSummaries(database, organizationIds),
          listChildOrganizationCounts(database, organizationIds),
          listOrganizationAncestorPaths(database, rows),
        ]);

      return {
        nodes: rows.map((row) => ({
          publicId: row.public_id,
          name: row.name,
          orgTier: row.org_tier,
          parentOrganizationPublicId:
            ancestorPaths.get(row.id)?.at(-1)?.publicId ?? null,
          status: row.status,
          revision: row.revision,
          employeeCount: employeeCounts.get(row.id) ?? 0,
          childCount: childCounts.get(row.id) ?? 0,
          authSummary: authSummaries.get(row.id) ?? null,
          ancestorPath: ancestorPaths.get(row.id) ?? [],
        })),
        pagination: createOrganizationTreePagination(
          query,
          totalRow?.value ?? 0,
        ),
      };
    },
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
          revision: organization.revision,
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
          revision: row.revision,
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
          purchaser_organization_name: organization.name,
          auth_scope_type: orgAuth.auth_scope_type,
          profession: orgAuth.profession,
          level: orgAuth.level,
          edition: orgAuth.edition,
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
      const organizationSummariesByOrgAuthId =
        await listOrgAuthOrganizationSummaries(
          database,
          rows.map((row) => row.id),
        );
      const editionEvaluationsByOrgAuthId = await listOrgAuthEditionEvaluations(
        database,
        rows.map((row) => ({ id: row.id, edition: row.edition })),
      );

      return {
        orgAuths: rows.map((row) => ({
          publicId: row.public_id,
          name: row.name,
          purchaserOrganizationPublicId: row.purchaser_organization_public_id,
          purchaserOrganizationName: row.purchaser_organization_name,
          authScopeType: row.auth_scope_type,
          profession: row.profession,
          level: row.level,
          ...getOrgAuthEditionEvaluation(row, editionEvaluationsByOrgAuthId),
          accountQuota: row.account_quota,
          usedQuota: row.used_quota,
          startsAt: row.starts_at.toISOString(),
          expiresAt: row.expires_at.toISOString(),
          status: row.status,
          cancelledAt:
            row.cancelled_at === null ? null : row.cancelled_at.toISOString(),
          organizationPublicIds:
            organizationSummariesByOrgAuthId.get(row.id)?.publicIds ?? [],
          coveredOrganizationCount:
            organizationSummariesByOrgAuthId.get(row.id)?.names.length ?? 0,
          coveredOrganizationNames:
            organizationSummariesByOrgAuthId.get(row.id)?.names ?? [],
          createdAt: row.created_at.toISOString(),
          updatedAt: row.updated_at.toISOString(),
        })),
        pagination: createPagination(query, totalRow?.value ?? 0),
      };
    },
    async getOrgAuthDetail(publicId) {
      const database = getDatabase();
      const [row] = await database
        .select({
          id: orgAuth.id,
          public_id: orgAuth.public_id,
          name: orgAuth.name,
          purchaser_organization_public_id: organization.public_id,
          purchaser_organization_name: organization.name,
          purchaser_organization_tier: organization.org_tier,
          purchaser_organization_status: organization.status,
          auth_scope_type: orgAuth.auth_scope_type,
          profession: orgAuth.profession,
          level: orgAuth.level,
          edition: orgAuth.edition,
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
        .where(eq(orgAuth.public_id, publicId))
        .limit(1);

      if (row === undefined) {
        return null;
      }

      const coveredOrganizationRows = await database
        .select({
          id: organization.id,
          public_id: organization.public_id,
          name: organization.name,
          org_tier: organization.org_tier,
          parent_organization_id: organization.parent_organization_id,
        })
        .from(orgAuth)
        .innerJoin(
          organization,
          createOrgAuthCoversOrganizationCondition({
            authScopeType: orgAuth.auth_scope_type,
            orgAuthId: orgAuth.id,
            organizationId: organization.id,
            purchaserOrganizationId: orgAuth.purchaser_organization_id,
          }),
        )
        .where(eq(orgAuth.id, row.id))
        .orderBy(asc(organization.public_id));
      const coveredOrganizationIds = coveredOrganizationRows.map(
        (organizationRow) => organizationRow.id,
      );
      const parentPublicIds = await listParentOrganizationPublicIds(
        database,
        coveredOrganizationRows
          .map((organizationRow) => organizationRow.parent_organization_id)
          .filter((id): id is number => id !== null),
      );
      const employeeCounts = await listEmployeeCounts(
        database,
        coveredOrganizationIds,
      );
      const editionEvaluationsByOrgAuthId = await listOrgAuthEditionEvaluations(
        database,
        [{ id: row.id, edition: row.edition }],
      );

      return {
        ...mapOrgAuthMutationRowToDto({
          ...row,
          ...getOrgAuthEditionEvaluation(row, editionEvaluationsByOrgAuthId),
          organization_public_ids: coveredOrganizationRows.map(
            (organizationRow) => organizationRow.public_id,
          ),
        }),
        purchaserOrganization: {
          publicId: row.purchaser_organization_public_id,
          name: row.purchaser_organization_name,
          orgTier: row.purchaser_organization_tier,
          status: row.purchaser_organization_status,
        },
        coveredOrganizations: coveredOrganizationRows.map(
          (organizationRow) => ({
            publicId: organizationRow.public_id,
            name: organizationRow.name,
            orgTier: organizationRow.org_tier,
            parentOrganizationPublicId:
              organizationRow.parent_organization_id === null
                ? null
                : (parentPublicIds.get(
                    organizationRow.parent_organization_id,
                  ) ?? null),
            employeeCount: employeeCounts.get(organizationRow.id) ?? 0,
          }),
        ),
        occupancy: {
          accountQuota: row.account_quota,
          usedQuota: row.used_quota,
          availableQuota: Math.max(row.account_quota - row.used_quota, 0),
        },
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
          organization_id: organization.id,
          organization_public_id: organization.public_id,
          organization_name: organization.name,
          status: user.status,
          registered_at: user.created_at,
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
      const activeOrgAuthCounts = await listActiveOrgAuthCountsByOrganization(
        database,
        rows.map((row) => row.organization_id),
      );

      return {
        employees: rows.map((row) => ({
          publicId: row.public_id,
          userPublicId: row.user_public_id,
          phone: maskPhoneForDisplay(row.phone),
          name: row.name,
          organizationPublicId: row.organization_public_id,
          organizationName: row.organization_name,
          activeOrgAuthCount: activeOrgAuthCounts.get(row.organization_id) ?? 0,
          registeredAt: row.registered_at.toISOString(),
          status: row.status,
        })),
        pagination: createPagination(query, totalRow?.value ?? 0),
      };
    },
    async createOrganization(input) {
      const database = getDatabase();
      const organizationRow = await database.transaction(
        async (transaction) => {
          const transactionalDatabase =
            transaction as AdminOrganizationOrgAuthRuntimeDatabase;

          await lockOrganizationScopeMutation(transactionalDatabase);

          const parentOrganization = await findParentOrganization(
            transactionalDatabase,
            input.parentOrganizationPublicId,
          );

          if (
            parentOrganization === undefined ||
            parentOrganization?.status === "disabled"
          ) {
            return null;
          }

          const tierParentValidation = validateOrganizationTierParent({
            orgTier: input.orgTier,
            parentOrganization:
              parentOrganization === null
                ? null
                : { orgTier: parentOrganization.org_tier },
          });

          if (!tierParentValidation.success) {
            return null;
          }

          const now = new Date();
          const [createdOrganization] = await transactionalDatabase
            .insert(organization)
            .values({
              public_id: `organization-${randomUUID()}`,
              name: input.name,
              org_tier: input.orgTier,
              parent_organization_id: parentOrganization?.id ?? null,
              status: "active",
              contact_name: input.contactName,
              contact_phone: input.contactPhone,
              remark: input.remark,
              revision: 1,
              created_at: now,
              updated_at: now,
            })
            .returning(selectOrganizationMutationColumns());

          return createdOrganization ?? null;
        },
      );

      return organizationRow === null
        ? null
        : mapOrganizationMutationRowToDto(database, organizationRow);
    },
    async updateOrganization(publicId, input) {
      const database = getDatabase();
      const organizationRow = await database.transaction(
        async (transaction) => {
          const transactionalDatabase =
            transaction as AdminOrganizationOrgAuthRuntimeDatabase;

          await lockOrganizationScopeMutation(transactionalDatabase);

          const [updatedOrganization] = await transactionalDatabase
            .update(organization)
            .set({
              name: input.name,
              contact_name: input.contactName,
              contact_phone: input.contactPhone,
              remark: input.remark,
              revision: sql`${organization.revision} + 1`,
              updated_at: new Date(),
            })
            .where(
              and(
                eq(organization.public_id, publicId),
                eq(organization.revision, input.expectedRevision),
              ),
            )
            .returning(selectOrganizationMutationColumns());

          return updatedOrganization;
        },
      );

      return organizationRow === undefined
        ? null
        : mapOrganizationMutationRowToDto(database, organizationRow);
    },
    async moveOrganization(input) {
      const database = getDatabase();

      try {
        const organizationRow = await database.transaction(
          async (transaction) => {
            const transactionalDatabase =
              transaction as AdminOrganizationOrgAuthRuntimeDatabase;

            await lockOrganizationScopeMutation(transactionalDatabase);

            const [targetOrganization] = await transactionalDatabase
              .select(selectOrganizationMutationColumns())
              .from(organization)
              .where(eq(organization.public_id, input.publicId))
              .limit(1);
            const parentOrganization = await findParentOrganization(
              transactionalDatabase,
              input.parentOrganizationPublicId,
            );

            if (
              targetOrganization === undefined ||
              targetOrganization.revision !== input.expectedRevision ||
              parentOrganization === undefined ||
              parentOrganization?.status === "disabled" ||
              parentOrganization?.id === targetOrganization.id
            ) {
              throw new OrganizationTreeConflictError();
            }

            const descendantIds = await listOrganizationAndDescendantIds(
              transactionalDatabase,
              targetOrganization.id,
            );

            if (
              parentOrganization !== null &&
              descendantIds.includes(parentOrganization.id)
            ) {
              throw new OrganizationTreeConflictError();
            }

            const tierParentValidation = validateOrganizationTierParent({
              orgTier: targetOrganization.org_tier,
              parentOrganization:
                parentOrganization === null
                  ? null
                  : { orgTier: parentOrganization.org_tier },
            });

            if (!tierParentValidation.success) {
              throw new OrganizationTreeConflictError();
            }

            const [movedOrganization] = await transactionalDatabase
              .update(organization)
              .set({
                parent_organization_id: parentOrganization?.id ?? null,
                revision: sql`${organization.revision} + 1`,
                updated_at: new Date(),
              })
              .where(
                and(
                  eq(organization.id, targetOrganization.id),
                  eq(organization.revision, input.expectedRevision),
                ),
              )
              .returning(selectOrganizationMutationColumns());

            if (
              movedOrganization === undefined ||
              (await hasCurrentOrgAuthOverlap(
                transactionalDatabase,
                descendantIds,
              )) ||
              !(await reconcileCurrentAndDescendantQuotaReservations(
                transactionalDatabase,
              ))
            ) {
              throw new OrganizationTreeConflictError();
            }

            return movedOrganization;
          },
        );

        return mapOrganizationMutationRowToDto(database, organizationRow);
      } catch (error) {
        if (error instanceof OrganizationTreeConflictError) {
          return null;
        }

        throw error;
      }
    },
    async disableOrganization(input) {
      const database = getDatabase();
      const result = await database.transaction(async (transaction) => {
        const transactionalDatabase =
          transaction as AdminOrganizationOrgAuthRuntimeDatabase;

        await lockOrganizationScopeMutation(transactionalDatabase);

        const [rootOrganization] = await transactionalDatabase
          .select({ id: organization.id })
          .from(organization)
          .where(
            and(
              eq(organization.public_id, input.publicId),
              eq(organization.revision, input.expectedRevision),
            ),
          )
          .limit(1);

        if (rootOrganization === undefined) {
          return null;
        }

        const organizationIds = input.isCascade
          ? await listOrganizationAndDescendantIds(
              transactionalDatabase,
              rootOrganization.id,
            )
          : [rootOrganization.id];
        const rows = await transactionalDatabase
          .update(organization)
          .set({
            status: "disabled",
            revision: sql`${organization.revision} + 1`,
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
          activeFlowTermination: await terminateOrganizationActiveFlows(
            transactionalDatabase,
            organizationIds,
          ),
          affectedOrganizationPublicIds: await listOrganizationPublicIdsByIds(
            transactionalDatabase,
            organizationIds,
          ),
          organizationRow: disabledOrganization,
        };
      });

      return result === null
        ? null
        : {
            organization: await mapOrganizationMutationRowToDto(
              database,
              result.organizationRow,
            ),
            activeFlowTermination: result.activeFlowTermination,
            affectedOrganizationPublicIds: result.affectedOrganizationPublicIds,
          };
    },
    async enableOrganization(input) {
      const database = getDatabase();
      const organizationRow = await database.transaction(
        async (transaction) => {
          const transactionalDatabase =
            transaction as AdminOrganizationOrgAuthRuntimeDatabase;

          await lockOrganizationScopeMutation(transactionalDatabase);

          const [rootOrganization] = await transactionalDatabase
            .select({
              id: organization.id,
              parent_organization_id: organization.parent_organization_id,
            })
            .from(organization)
            .where(
              and(
                eq(organization.public_id, input.publicId),
                eq(organization.revision, input.expectedRevision),
              ),
            )
            .limit(1);

          if (rootOrganization === undefined) {
            return null;
          }

          if (rootOrganization.parent_organization_id !== null) {
            const [parentOrganization] = await transactionalDatabase
              .select({ status: organization.status })
              .from(organization)
              .where(
                eq(organization.id, rootOrganization.parent_organization_id),
              )
              .limit(1);

            if (parentOrganization?.status !== "active") {
              return null;
            }
          }

          const organizationIds = input.isCascade
            ? await listOrganizationAndDescendantIds(
                transactionalDatabase,
                rootOrganization.id,
              )
            : [rootOrganization.id];
          const rows = await transactionalDatabase
            .update(organization)
            .set({
              status: "active",
              revision: sql`${organization.revision} + 1`,
              updated_at: new Date(),
            })
            .where(inArray(organization.id, organizationIds))
            .returning(selectOrganizationMutationColumns());

          return rows.find((row) => row.id === rootOrganization.id) ?? null;
        },
      );

      return organizationRow === null
        ? null
        : mapOrganizationMutationRowToDto(database, organizationRow);
    },
    async hasOverlappingOrgAuth(input) {
      const database = getDatabase();
      const organizationIds = await listInputOrganizationIds(database, input);

      return hasOverlappingOrgAuthWithOrganizationIds(
        database,
        input,
        organizationIds,
      );
    },
    async createOrgAuth(input) {
      const database = getDatabase();

      return database.transaction(async (transaction) => {
        const transactionalDatabase =
          transaction as AdminOrganizationOrgAuthRuntimeDatabase;

        await lockOrganizationScopeMutation(transactionalDatabase);

        const [purchaserOrganization] = await transactionalDatabase
          .select({ id: organization.id, public_id: organization.public_id })
          .from(organization)
          .where(
            eq(organization.public_id, input.purchaserOrganizationPublicId),
          )
          .limit(1);

        if (purchaserOrganization === undefined) {
          return null;
        }

        const organizationIds = await listInputOrganizationIds(
          transactionalDatabase,
          input,
        );

        if (organizationIds.length === 0) {
          return null;
        }

        await lockOrgAuthQuotaScope(transactionalDatabase, {
          level: input.level,
          organizationIds,
          profession: input.profession,
        });

        if (
          await hasOverlappingOrgAuthWithOrganizationIds(
            transactionalDatabase,
            input,
            organizationIds,
          )
        ) {
          return null;
        }

        const usedQuota = await countActiveEmployeesByOrganizationIds(
          transactionalDatabase,
          organizationIds,
        );

        if (usedQuota > input.accountQuota) {
          return null;
        }

        const now = new Date();
        const [orgAuthRow] = await transactionalDatabase
          .insert(orgAuth)
          .values({
            public_id: `org-auth-${randomUUID()}`,
            name: input.name,
            purchaser_organization_id: purchaserOrganization.id,
            auth_scope_type: input.authScopeType,
            edition: input.edition,
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
            edition: orgAuth.edition,
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

        if (input.authScopeType === "specified_nodes") {
          await transactionalDatabase.insert(orgAuthOrganization).values(
            organizationIds.map((organizationId) => ({
              org_auth_id: orgAuthRow.id,
              organization_id: organizationId,
            })),
          );
        }

        const employeeIds = await listActiveEmployeeIdsByOrganizationIds(
          transactionalDatabase,
          organizationIds,
        );

        if (employeeIds.length > 0) {
          await transactionalDatabase.insert(employeeOrgAuth).values(
            employeeIds.map((employeeId) => ({
              employee_id: employeeId,
              org_auth_id: orgAuthRow.id,
            })),
          );
        }

        const organizationPublicIds = await listOrganizationPublicIdsByIds(
          transactionalDatabase,
          organizationIds,
        );

        return mapOrgAuthMutationRowToDto({
          ...orgAuthRow,
          purchaser_organization_public_id: purchaserOrganization.public_id,
          organization_public_ids: organizationPublicIds,
        });
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
          edition: orgAuth.edition,
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
      const editionEvaluationsByOrgAuthId = await listOrgAuthEditionEvaluations(
        database,
        [{ id: orgAuthRow.id, edition: orgAuthRow.edition }],
      );

      return mapOrgAuthMutationRowToDto({
        ...orgAuthRow,
        ...getOrgAuthEditionEvaluation(
          orgAuthRow,
          editionEvaluationsByOrgAuthId,
        ),
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

      const userIds = await listReservedActiveUserIdsByOrgAuth(
        database,
        activeFlowScope.orgAuthId,
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
    async disableEmployee(publicId) {
      const database = getDatabase();

      return database.transaction(async (transaction) => {
        const transactionalDatabase =
          transaction as AdminOrganizationOrgAuthRuntimeDatabase;

        await lockOrganizationScopeMutation(transactionalDatabase);
        await lockEmployeeIdentity(transactionalDatabase, publicId);

        const [employeeRow] = await transactionalDatabase
          .select({
            employee_id: employee.id,
            user_id: user.id,
            auth_user_id: user.auth_user_id,
          })
          .from(employee)
          .innerJoin(user, eq(user.id, employee.user_id))
          .where(
            and(
              eq(employee.public_id, publicId),
              eq(user.user_type, "employee"),
            ),
          )
          .limit(1);

        if (employeeRow === undefined) {
          return false;
        }

        await releaseEmployeeOrgAuthQuota(
          transactionalDatabase,
          employeeRow.employee_id,
        );
        const lifecycleChangedAt = new Date();

        await transactionalDatabase
          .update(user)
          .set({
            status: "disabled",
            disabled_at: lifecycleChangedAt,
            updated_at: lifecycleChangedAt,
          })
          .where(eq(user.id, employeeRow.user_id));
        await transactionalDatabase
          .update(employee)
          .set({ updated_at: lifecycleChangedAt })
          .where(eq(employee.id, employeeRow.employee_id));

        if (employeeRow.auth_user_id !== null) {
          await transactionalDatabase
            .delete(authSession)
            .where(eq(authSession.user_id, employeeRow.auth_user_id));
        }

        await transactionalDatabase
          .update(practice)
          .set({
            practice_status: "terminated",
            terminated_at: lifecycleChangedAt,
            termination_reason: "account_disabled",
            updated_at: lifecycleChangedAt,
          })
          .where(
            and(
              eq(practice.user_id, employeeRow.user_id),
              eq(practice.practice_status, "in_progress"),
            ),
          );
        await transactionalDatabase
          .update(mockExam)
          .set({
            exam_status: "terminated",
            terminated_at: lifecycleChangedAt,
            termination_reason: "account_disabled",
            updated_at: lifecycleChangedAt,
          })
          .where(
            and(
              eq(mockExam.user_id, employeeRow.user_id),
              inArray(mockExam.exam_status, [
                "in_progress",
                "scoring",
                "scoring_partial_failed",
              ]),
            ),
          );

        return true;
      });
    },
    async transferEmployee(input) {
      const database = getDatabase();

      try {
        return await database.transaction(async (transaction) => {
          const transactionalDatabase =
            transaction as AdminOrganizationOrgAuthRuntimeDatabase;

          await lockOrganizationScopeMutation(transactionalDatabase);
          await lockEmployeeIdentity(
            transactionalDatabase,
            input.employeePublicId,
          );

          const [employeeRow] = await transactionalDatabase
            .select({
              employee_id: employee.id,
              employee_public_id: employee.public_id,
              organization_id: employee.organization_id,
              organization_public_id: organization.public_id,
              user_id: user.id,
              user_public_id: user.public_id,
              auth_user_id: user.auth_user_id,
              user_status: user.status,
            })
            .from(employee)
            .innerJoin(user, eq(user.id, employee.user_id))
            .innerJoin(
              organization,
              eq(organization.id, employee.organization_id),
            )
            .where(
              and(
                eq(employee.public_id, input.employeePublicId),
                eq(user.user_type, "employee"),
              ),
            )
            .limit(1);

          if (employeeRow === undefined) {
            return null;
          }

          const [targetOrganizationRow] = await transactionalDatabase
            .select({
              id: organization.id,
              public_id: organization.public_id,
              status: organization.status,
            })
            .from(organization)
            .where(eq(organization.public_id, input.targetOrganizationPublicId))
            .limit(1);

          if (
            targetOrganizationRow === undefined ||
            targetOrganizationRow.status !== "active"
          ) {
            return {
              employeePublicId: input.employeePublicId,
              targetOrganizationPublicId: input.targetOrganizationPublicId,
              status: "target_organization_not_found" as const,
            };
          }

          if (targetOrganizationRow.id === employeeRow.organization_id) {
            return {
              employeePublicId: input.employeePublicId,
              targetOrganizationPublicId: input.targetOrganizationPublicId,
              status: "same_organization" as const,
            };
          }

          const now = new Date();

          await releaseEmployeeOrgAuthQuota(
            transactionalDatabase,
            employeeRow.employee_id,
          );
          await transactionalDatabase
            .update(employee)
            .set({
              organization_id: targetOrganizationRow.id,
              updated_at: now,
            })
            .where(eq(employee.id, employeeRow.employee_id));

          if (employeeRow.user_status === "active") {
            const reservationResult = await reserveEmployeeOrgAuthQuota(
              transactionalDatabase,
              {
                employeeId: employeeRow.employee_id,
                organizationId: targetOrganizationRow.id,
                requireCurrentAuthorization: true,
              },
            );

            if (reservationResult !== "reserved") {
              throw new EmployeeOrgAuthQuotaError(reservationResult);
            }
          }

          await transactionalDatabase
            .update(user)
            .set({ user_type: "employee", updated_at: now })
            .where(eq(user.id, employeeRow.user_id));
          await transactionalDatabase
            .update(organizationTrainingAnswer)
            .set({
              organization_training_answer_status: "read_only",
              updated_at: now,
            })
            .where(
              and(
                eq(
                  organizationTrainingAnswer.employee_id,
                  employeeRow.employee_id,
                ),
                eq(
                  organizationTrainingAnswer.organization_id,
                  employeeRow.organization_id,
                ),
                eq(
                  organizationTrainingAnswer.organization_training_answer_status,
                  "in_progress",
                ),
              ),
            );

          if (employeeRow.auth_user_id !== null) {
            await transactionalDatabase
              .delete(authSession)
              .where(eq(authSession.user_id, employeeRow.auth_user_id));
          }

          return {
            employeePublicId: employeeRow.employee_public_id,
            userPublicId: employeeRow.user_public_id,
            previousOrganizationPublicId: employeeRow.organization_public_id,
            targetOrganizationPublicId: targetOrganizationRow.public_id,
            quotaRefreshStatus: "refreshed" as const,
            sessionRevocationStatus:
              employeeRow.auth_user_id === null
                ? ("not_needed" as const)
                : ("revoked" as const),
            historicalSnapshotStatus: "preserved" as const,
            oldOrganizationInProgressTrainingStatus: "blocked" as const,
            status: "transferred" as const,
          };
        });
      } catch (error) {
        if (error instanceof EmployeeOrgAuthQuotaError) {
          return {
            employeePublicId: input.employeePublicId,
            targetOrganizationPublicId: input.targetOrganizationPublicId,
            status: "quota_insufficient",
          };
        }

        throw error;
      }
    },
    async unbindEmployee(input) {
      const database = getDatabase();
      const employeePublicId =
        typeof input === "string" ? input : input.employeePublicId;
      const organizationPublicId =
        typeof input === "string" ? null : (input.organizationPublicId ?? null);

      return database.transaction(async (transaction) => {
        const transactionalDatabase =
          transaction as AdminOrganizationOrgAuthRuntimeDatabase;

        await lockOrganizationScopeMutation(transactionalDatabase);
        await lockEmployeeIdentity(transactionalDatabase, employeePublicId);

        const conditions = [
          eq(employee.public_id, employeePublicId),
          eq(user.user_type, "employee"),
        ];

        if (organizationPublicId !== null) {
          conditions.push(eq(organization.public_id, organizationPublicId));
        }

        const [employeeRow] = await transactionalDatabase
          .select({
            employee_id: employee.id,
            employee_public_id: employee.public_id,
            organization_id: employee.organization_id,
            user_id: user.id,
            user_public_id: user.public_id,
            auth_user_id: user.auth_user_id,
            organization_public_id: organization.public_id,
          })
          .from(employee)
          .innerJoin(user, eq(user.id, employee.user_id))
          .innerJoin(
            organization,
            eq(organization.id, employee.organization_id),
          )
          .where(and(...conditions))
          .limit(1);

        if (employeeRow === undefined) {
          return null;
        }

        await releaseEmployeeOrgAuthQuota(
          transactionalDatabase,
          employeeRow.employee_id,
        );
        await transactionalDatabase
          .update(user)
          .set({
            user_type: "personal",
            updated_at: new Date(),
          })
          .where(eq(user.id, employeeRow.user_id));
        await transactionalDatabase
          .update(employee)
          .set({
            updated_at: new Date(),
          })
          .where(eq(employee.id, employeeRow.employee_id));

        if (employeeRow.auth_user_id !== null) {
          await transactionalDatabase
            .delete(authSession)
            .where(eq(authSession.user_id, employeeRow.auth_user_id));
        }

        await transactionalDatabase
          .update(organizationTrainingAnswer)
          .set({
            organization_training_answer_status: "read_only",
            updated_at: new Date(),
          })
          .where(
            and(
              eq(
                organizationTrainingAnswer.employee_id,
                employeeRow.employee_id,
              ),
              eq(
                organizationTrainingAnswer.organization_id,
                employeeRow.organization_id,
              ),
              eq(
                organizationTrainingAnswer.organization_training_answer_status,
                "in_progress",
              ),
            ),
          );

        return {
          employeePublicId: employeeRow.employee_public_id,
          userPublicId: employeeRow.user_public_id,
          previousOrganizationPublicId: employeeRow.organization_public_id,
          status: "unbound",
        };
      });
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

export function createPostgresEmployeeAccountRepository(
  options: AdminOrganizationOrgAuthRuntimeRepositoryOptions = {},
): EmployeeAccountRepository {
  const getDatabase = createLazyDatabaseGetter(
    options.createDatabase ?? createLocalRuntimeDatabase,
  );

  return {
    async findUserByPhone(phone) {
      const database = getDatabase();
      const [row] = await database
        .select({
          auth_user_id: user.auth_user_id,
          employee_public_id: employee.public_id,
          id: user.id,
          locked_until_at: user.locked_until_at,
          name: user.name,
          organization_public_id: organization.public_id,
          phone: user.phone,
          public_id: user.public_id,
          status: user.status,
          user_type: user.user_type,
        })
        .from(user)
        .leftJoin(employee, eq(employee.user_id, user.id))
        .leftJoin(organization, eq(organization.id, employee.organization_id))
        .where(eq(user.phone, phone))
        .limit(1);

      if (row === undefined || row.auth_user_id === null) {
        return null;
      }

      return {
        ...row,
        auth_user_id: row.auth_user_id,
        employee_public_id:
          row.user_type === "employee" ? row.employee_public_id : null,
        organization_public_id:
          row.user_type === "employee" ? row.organization_public_id : null,
      };
    },
    async findOrganizationByPublicId(publicId) {
      const database = getDatabase();
      const [row] = await database
        .select({
          name: organization.name,
          public_id: organization.public_id,
        })
        .from(organization)
        .where(eq(organization.public_id, publicId))
        .limit(1);

      return row ?? null;
    },
    async createEmployeeAccount(input) {
      const database = getDatabase();
      const passwordHash = await hashPassword(input.initialPassword);

      return database.transaction(async (transaction) =>
        createEmployeeAccountWithDatabase(
          transaction as AdminOrganizationOrgAuthRuntimeDatabase,
          { ...input, passwordHash },
        ),
      );
    },
    async bindExistingUserToOrganization(input) {
      const database = getDatabase();

      return database.transaction(async (transaction) =>
        bindEmployeeAccountWithDatabase(
          transaction as AdminOrganizationOrgAuthRuntimeDatabase,
          input,
        ),
      );
    },
  };
}

async function createEmployeeAccountWithDatabase(
  database: AdminOrganizationOrgAuthRuntimeDatabase,
  input: CreateEmployeeAccountInput & { passwordHash: string },
) {
  await lockOrganizationScopeMutation(database);
  const accountPhoneConflict = await findAccountPhoneIdentityConflictUnderLock(
    database,
    input.phone,
  );

  if (accountPhoneConflict !== null) {
    throw new EmployeeAccountMutationError("account_conflict");
  }

  const [organizationRow] = await database
    .select({
      id: organization.id,
      name: organization.name,
      public_id: organization.public_id,
    })
    .from(organization)
    .where(
      and(
        eq(organization.public_id, input.organizationPublicId),
        eq(organization.status, "active"),
      ),
    )
    .limit(1);

  if (organizationRow === undefined) {
    throw new EmployeeAccountMutationError("organization_not_found");
  }

  const now = new Date();
  const authUserId = `auth-user-${randomUUID()}`;

  await database.insert(authUser).values({
    created_at: now,
    email: `phone-${input.phone}@tiku.local`,
    email_verified: now,
    id: authUserId,
    image: null,
    name: input.phone,
    updated_at: now,
  });
  await database.insert(authAccount).values({
    access_token: null,
    access_token_expires_at: null,
    account_id: authUserId,
    created_at: now,
    id: `auth-account-${randomUUID()}`,
    id_token: null,
    [authAccountCredentialField]: input.passwordHash,
    provider_id: CREDENTIAL_PROVIDER_ID,
    refresh_token: null,
    refresh_token_expires_at: null,
    scope: null,
    updated_at: now,
    user_id: authUserId,
  });

  const [userRow] = await database
    .insert(user)
    .values({
      auth_user_id: authUserId,
      created_at: now,
      disabled_at: null,
      locked_until_at: null,
      login_failed_count: 0,
      name: input.name,
      phone: input.phone,
      public_id: `user-${randomUUID()}`,
      status: "active",
      updated_at: now,
      user_type: "employee",
    })
    .returning({
      auth_user_id: user.auth_user_id,
      id: user.id,
      locked_until_at: user.locked_until_at,
      name: user.name,
      phone: user.phone,
      public_id: user.public_id,
      status: user.status,
      user_type: user.user_type,
    });

  if (userRow === undefined || userRow.auth_user_id === null) {
    throw new Error("Employee user creation failed.");
  }

  const [employeeRow] = await database
    .insert(employee)
    .values({
      created_at: now,
      organization_id: organizationRow.id,
      public_id: `employee-${randomUUID()}`,
      updated_at: now,
      user_id: userRow.id,
    })
    .returning({
      created_at: employee.created_at,
      id: employee.id,
      public_id: employee.public_id,
      updated_at: employee.updated_at,
    });

  if (employeeRow === undefined) {
    throw new Error("Employee account creation failed.");
  }

  const reservationResult = await reserveEmployeeOrgAuthQuota(database, {
    employeeId: employeeRow.id,
    organizationId: organizationRow.id,
  });

  if (reservationResult !== "reserved") {
    throw new EmployeeAccountMutationError(reservationResult);
  }

  return {
    employee: {
      id: employeeRow.id,
      public_id: employeeRow.public_id,
      user_public_id: userRow.public_id,
      organization_public_id: organizationRow.public_id,
      created_at: employeeRow.created_at,
      updated_at: employeeRow.updated_at,
    },
    organization: {
      public_id: organizationRow.public_id,
      name: organizationRow.name,
    },
    user: {
      id: userRow.id,
      auth_user_id: userRow.auth_user_id,
      public_id: userRow.public_id,
      phone: userRow.phone,
      name: userRow.name,
      user_type: userRow.user_type,
      status: userRow.status,
      locked_until_at: userRow.locked_until_at,
      employee_public_id: employeeRow.public_id,
      organization_public_id: organizationRow.public_id,
    },
  };
}

async function bindEmployeeAccountWithDatabase(
  database: AdminOrganizationOrgAuthRuntimeDatabase,
  input: BindExistingUserToOrganizationInput,
) {
  await lockOrganizationScopeMutation(database);
  await database.execute(
    sql`select pg_advisory_xact_lock(200112, hashtext(${input.userPublicId})) as employee_identity_lock`,
  );

  const [userRow] = await database
    .select({
      auth_user_id: user.auth_user_id,
      id: user.id,
      locked_until_at: user.locked_until_at,
      name: user.name,
      phone: user.phone,
      public_id: user.public_id,
      status: user.status,
      user_type: user.user_type,
    })
    .from(user)
    .where(eq(user.public_id, input.userPublicId))
    .limit(1);
  const [organizationRow] = await database
    .select({
      id: organization.id,
      name: organization.name,
      public_id: organization.public_id,
    })
    .from(organization)
    .where(
      and(
        eq(organization.public_id, input.organizationPublicId),
        eq(organization.status, "active"),
      ),
    )
    .limit(1);

  if (
    userRow === undefined ||
    userRow.auth_user_id === null ||
    organizationRow === undefined
  ) {
    throw new EmployeeAccountMutationError("organization_not_found");
  }

  const [existingEmployee] = await database
    .select({ id: employee.id })
    .from(employee)
    .where(eq(employee.user_id, userRow.id))
    .limit(1);

  if (userRow.user_type === "employee" || userRow.status === "disabled") {
    throw new EmployeeAccountMutationError("account_conflict");
  }

  const now = new Date();
  const [employeeRow] =
    existingEmployee === undefined
      ? await database
          .insert(employee)
          .values({
            created_at: now,
            organization_id: organizationRow.id,
            public_id: `employee-${randomUUID()}`,
            updated_at: now,
            user_id: userRow.id,
          })
          .returning({
            created_at: employee.created_at,
            id: employee.id,
            public_id: employee.public_id,
            updated_at: employee.updated_at,
          })
      : await database
          .update(employee)
          .set({
            organization_id: organizationRow.id,
            updated_at: now,
          })
          .where(eq(employee.id, existingEmployee.id))
          .returning({
            created_at: employee.created_at,
            id: employee.id,
            public_id: employee.public_id,
            updated_at: employee.updated_at,
          });

  if (existingEmployee !== undefined) {
    await releaseEmployeeOrgAuthQuota(database, existingEmployee.id);
  }

  await database
    .update(user)
    .set({
      disabled_at: null,
      status: "active",
      updated_at: now,
      user_type: "employee",
    })
    .where(eq(user.id, userRow.id));

  if (employeeRow === undefined) {
    throw new Error("Employee account binding failed.");
  }

  const reservationResult = await reserveEmployeeOrgAuthQuota(database, {
    employeeId: employeeRow.id,
    organizationId: organizationRow.id,
  });

  if (reservationResult !== "reserved") {
    throw new EmployeeAccountMutationError(reservationResult);
  }

  return {
    employee: {
      id: employeeRow.id,
      public_id: employeeRow.public_id,
      user_public_id: userRow.public_id,
      organization_public_id: organizationRow.public_id,
      created_at: employeeRow.created_at,
      updated_at: employeeRow.updated_at,
    },
    organization: {
      public_id: organizationRow.public_id,
      name: organizationRow.name,
    },
    user: {
      id: userRow.id,
      auth_user_id: userRow.auth_user_id,
      public_id: userRow.public_id,
      phone: userRow.phone,
      name: userRow.name,
      user_type: "employee" as const,
      status: "active" as const,
      locked_until_at: userRow.locked_until_at,
      employee_public_id: employeeRow.public_id,
      organization_public_id: organizationRow.public_id,
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

function createOrgAuthConditions(query: OrgAuthListQuery): SQL[] {
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

  if (query.edition !== "all") {
    conditions.push(eq(orgAuth.edition, query.edition));
  }

  if (query.profession !== "all") {
    conditions.push(eq(orgAuth.profession, query.profession));
  }

  if (query.level !== null) {
    conditions.push(eq(orgAuth.level, query.level));
  }

  if (query.expiryStatus !== "all") {
    const now = new Date();
    const expiryThreshold = new Date(now.getTime() + 45 * 24 * 60 * 60 * 1000);

    conditions.push(eq(orgAuth.status, "active"));
    conditions.push(gt(orgAuth.expires_at, now));

    if (query.expiryStatus === "expiring_soon") {
      conditions.push(lte(orgAuth.expires_at, expiryThreshold));
    } else {
      conditions.push(gt(orgAuth.expires_at, expiryThreshold));
    }
  }

  return conditions;
}

function createEmployeeConditions(query: EmployeeListQuery): SQL[] {
  const conditions: SQL[] = [eq(user.user_type, "employee")];

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

  if (query.organizationKeyword !== null) {
    conditions.push(ilike(organization.name, `%${query.organizationKeyword}%`));
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

function createOrgAuthOrderBy(query: OrgAuthListQuery): SQL {
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

function createEmployeeOrderBy(query: EmployeeListQuery): SQL {
  if (query.sortBy === "registeredAt") {
    return query.sortOrder === "asc"
      ? asc(user.created_at)
      : desc(user.created_at);
  }

  return query.sortOrder === "asc"
    ? asc(user.updated_at)
    : desc(user.updated_at);
}

async function listActiveOrgAuthCountsByOrganization(
  database: AdminOrganizationOrgAuthRuntimeDatabase,
  organizationIds: number[],
): Promise<Map<number, number>> {
  if (organizationIds.length === 0) {
    return new Map();
  }

  const now = new Date();
  const rows = await database
    .select({
      organization_id: organization.id,
      value: count(),
    })
    .from(organization)
    .innerJoin(
      orgAuth,
      createOrgAuthCoversOrganizationCondition({
        authScopeType: orgAuth.auth_scope_type,
        orgAuthId: orgAuth.id,
        organizationId: organization.id,
        purchaserOrganizationId: orgAuth.purchaser_organization_id,
      }),
    )
    .where(
      and(
        inArray(organization.id, organizationIds),
        eq(orgAuth.status, "active"),
        lte(orgAuth.starts_at, now),
        gt(orgAuth.expires_at, now),
      ),
    )
    .groupBy(organization.id);

  return new Map(rows.map((row) => [row.organization_id, row.value]));
}

async function findOrganizationIdentityByPublicId(
  database: AdminOrganizationOrgAuthRuntimeDatabase,
  publicId: string,
): Promise<{ id: number; orgTier: OrganizationDto["orgTier"] } | undefined> {
  const [row] = await database
    .select({ id: organization.id, orgTier: organization.org_tier })
    .from(organization)
    .where(eq(organization.public_id, publicId))
    .limit(1);

  return row;
}

async function listChildOrganizationCounts(
  database: AdminOrganizationOrgAuthRuntimeDatabase,
  organizationIds: number[],
): Promise<Map<number, number>> {
  if (organizationIds.length === 0) {
    return new Map();
  }

  const rows = await database
    .select({
      parent_organization_id: organization.parent_organization_id,
      value: count(),
    })
    .from(organization)
    .where(inArray(organization.parent_organization_id, organizationIds))
    .groupBy(organization.parent_organization_id);

  return new Map(
    rows.flatMap((row) =>
      row.parent_organization_id === null
        ? []
        : [[row.parent_organization_id, row.value] as const],
    ),
  );
}

async function listOrganizationAncestorPaths(
  database: AdminOrganizationOrgAuthRuntimeDatabase,
  rows: OrganizationTreeRow[],
): Promise<Map<number, OrganizationTreePathItemDto[]>> {
  const ancestorRowsById = new Map<number, OrganizationTreeRow>();
  let pendingAncestorIds = [
    ...new Set(
      rows.flatMap((row) =>
        row.parent_organization_id === null ? [] : [row.parent_organization_id],
      ),
    ),
  ];

  for (let depth = 0; depth < 3 && pendingAncestorIds.length > 0; depth += 1) {
    const ancestorRows = await database
      .select({
        id: organization.id,
        public_id: organization.public_id,
        name: organization.name,
        org_tier: organization.org_tier,
        parent_organization_id: organization.parent_organization_id,
        revision: organization.revision,
        status: organization.status,
      })
      .from(organization)
      .where(inArray(organization.id, pendingAncestorIds));

    for (const ancestorRow of ancestorRows) {
      ancestorRowsById.set(ancestorRow.id, ancestorRow);
    }

    pendingAncestorIds = [
      ...new Set(
        ancestorRows.flatMap((ancestorRow) => {
          const parentId = ancestorRow.parent_organization_id;

          return parentId === null || ancestorRowsById.has(parentId)
            ? []
            : [parentId];
        }),
      ),
    ];
  }

  return buildOrganizationAncestorPaths(rows, [...ancestorRowsById.values()]);
}

export function buildOrganizationAncestorPaths(
  rows: OrganizationTreeRow[],
  ancestorRows: OrganizationTreeRow[],
): Map<number, OrganizationTreePathItemDto[]> {
  const ancestorRowsById = new Map(
    ancestorRows.map((ancestorRow) => [ancestorRow.id, ancestorRow]),
  );

  return new Map(
    rows.map((row) => {
      const reversePath: OrganizationTreePathItemDto[] = [];
      const visitedIds = new Set<number>();
      let parentId = row.parent_organization_id;

      while (
        parentId !== null &&
        reversePath.length < 3 &&
        !visitedIds.has(parentId)
      ) {
        visitedIds.add(parentId);
        const ancestorRow = ancestorRowsById.get(parentId);

        if (ancestorRow === undefined) {
          break;
        }

        reversePath.push({
          publicId: ancestorRow.public_id,
          name: ancestorRow.name,
          orgTier: ancestorRow.org_tier,
        });
        parentId = ancestorRow.parent_organization_id;
      }

      return [row.id, reversePath.reverse()];
    }),
  );
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

async function findParentOrganization(
  database: AdminOrganizationOrgAuthRuntimeDatabase,
  parentOrganizationPublicId: string | null,
): Promise<
  Pick<OrganizationMutationRow, "id" | "org_tier" | "status"> | null | undefined
> {
  if (parentOrganizationPublicId === null) {
    return null;
  }

  const [parentOrganization] = await database
    .select({
      id: organization.id,
      org_tier: organization.org_tier,
      status: organization.status,
    })
    .from(organization)
    .where(eq(organization.public_id, parentOrganizationPublicId))
    .limit(1);

  return parentOrganization;
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
    revision: input.revision,
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
    .innerJoin(user, eq(user.id, employee.user_id))
    .where(
      and(
        inArray(employee.organization_id, organizationIds),
        eq(user.user_type, "employee"),
        eq(user.status, "active"),
      ),
    )
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
      organization_id: organization.id,
      profession: orgAuth.profession,
      level: orgAuth.level,
    })
    .from(organization)
    .innerJoin(
      orgAuth,
      createOrgAuthCoversOrganizationCondition({
        authScopeType: orgAuth.auth_scope_type,
        orgAuthId: orgAuth.id,
        organizationId: organization.id,
        purchaserOrganizationId: orgAuth.purchaser_organization_id,
      }),
    )
    .where(inArray(organization.id, organizationIds))
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
      org_auth_id: orgAuth.id,
      organization_public_id: organization.public_id,
    })
    .from(orgAuth)
    .innerJoin(
      organization,
      createOrgAuthCoversOrganizationCondition({
        authScopeType: orgAuth.auth_scope_type,
        orgAuthId: orgAuth.id,
        organizationId: organization.id,
        purchaserOrganizationId: orgAuth.purchaser_organization_id,
      }),
    )
    .where(inArray(orgAuth.id, orgAuthIds))
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

async function listOrgAuthOrganizationSummaries(
  database: AdminOrganizationOrgAuthRuntimeDatabase,
  orgAuthIds: number[],
): Promise<Map<number, { names: string[]; publicIds: string[] }>> {
  if (orgAuthIds.length === 0) {
    return new Map();
  }

  const rows = await database
    .select({
      org_auth_id: orgAuth.id,
      organization_name: organization.name,
      organization_public_id: organization.public_id,
    })
    .from(orgAuth)
    .innerJoin(
      organization,
      createOrgAuthCoversOrganizationCondition({
        authScopeType: orgAuth.auth_scope_type,
        orgAuthId: orgAuth.id,
        organizationId: organization.id,
        purchaserOrganizationId: orgAuth.purchaser_organization_id,
      }),
    )
    .where(inArray(orgAuth.id, orgAuthIds))
    .orderBy(asc(organization.name), asc(organization.public_id));
  const summaries = new Map<number, { names: string[]; publicIds: string[] }>();

  for (const row of rows) {
    const currentSummary = summaries.get(row.org_auth_id) ?? {
      names: [],
      publicIds: [],
    };

    currentSummary.names.push(row.organization_name);
    currentSummary.publicIds.push(row.organization_public_id);
    summaries.set(row.org_auth_id, currentSummary);
  }

  return summaries;
}

async function listOrgAuthUpgradeRows(
  database: AdminOrganizationOrgAuthRuntimeDatabase,
  orgAuthIds: number[],
): Promise<OrgAuthUpgradeEvaluationRow[]> {
  if (orgAuthIds.length === 0) {
    return [];
  }

  const rows = await database
    .select({
      org_auth_id: authUpgrade.org_auth_id,
      target_edition: authUpgrade.target_edition,
      starts_at: authUpgrade.starts_at,
      expires_at: authUpgrade.expires_at,
      revoked_at: authUpgrade.revoked_at,
      status: authUpgrade.status,
    })
    .from(authUpgrade)
    .where(inArray(authUpgrade.org_auth_id, orgAuthIds));

  return rows.filter(
    (row): row is OrgAuthUpgradeEvaluationRow => row.org_auth_id !== null,
  );
}

function groupOrgAuthUpgradeRows(
  authUpgradeRows: OrgAuthUpgradeEvaluationRow[],
): Map<number, OrgAuthUpgradeEvaluationRow[]> {
  const rowsByOrgAuthId = new Map<number, OrgAuthUpgradeEvaluationRow[]>();

  for (const authUpgradeRow of authUpgradeRows) {
    rowsByOrgAuthId.set(authUpgradeRow.org_auth_id, [
      ...(rowsByOrgAuthId.get(authUpgradeRow.org_auth_id) ?? []),
      authUpgradeRow,
    ]);
  }

  return rowsByOrgAuthId;
}

function isActiveOrgAuthUpgrade(
  authUpgradeRow: OrgAuthUpgradeEvaluationRow,
  now: Date,
): boolean {
  return (
    authUpgradeRow.status === "active" &&
    authUpgradeRow.revoked_at === null &&
    authUpgradeRow.starts_at <= now &&
    authUpgradeRow.expires_at >= now
  );
}

function selectActiveOrgAuthUpgrade(
  authUpgradeRows: OrgAuthUpgradeEvaluationRow[],
  now: Date,
): OrgAuthUpgradeEvaluationRow | null {
  return (
    [...authUpgradeRows]
      .filter((authUpgradeRow) => isActiveOrgAuthUpgrade(authUpgradeRow, now))
      .sort(
        (left, right) => right.expires_at.getTime() - left.expires_at.getTime(),
      )[0] ?? null
  );
}

function getInactiveOrgAuthUpgradeStatus(
  authUpgradeRows: OrgAuthUpgradeEvaluationRow[],
  now: Date,
): AuthUpgradeStatus | "none" {
  if (
    authUpgradeRows.some(
      (authUpgradeRow) =>
        authUpgradeRow.status === "revoked" ||
        authUpgradeRow.revoked_at !== null,
    )
  ) {
    return "revoked";
  }

  if (
    authUpgradeRows.some(
      (authUpgradeRow) =>
        authUpgradeRow.status === "expired" || authUpgradeRow.expires_at < now,
    )
  ) {
    return "expired";
  }

  return "none";
}

function evaluateOrgAuthEdition(
  edition: AuthorizationEdition,
  authUpgradeRows: OrgAuthUpgradeEvaluationRow[],
  now: Date,
): OrgAuthEditionEvaluation {
  if (edition === "advanced") {
    return {
      edition,
      effectiveEdition: "advanced",
      upgradeStatus: "none",
    };
  }

  const activeAuthUpgrade = selectActiveOrgAuthUpgrade(authUpgradeRows, now);

  if (activeAuthUpgrade !== null) {
    return {
      edition,
      effectiveEdition: activeAuthUpgrade.target_edition,
      upgradeStatus: activeAuthUpgrade.status,
    };
  }

  return {
    edition,
    effectiveEdition: edition,
    upgradeStatus: getInactiveOrgAuthUpgradeStatus(authUpgradeRows, now),
  };
}

async function listOrgAuthEditionEvaluations(
  database: AdminOrganizationOrgAuthRuntimeDatabase,
  orgAuthRows: { id: number; edition: AuthorizationEdition }[],
): Promise<Map<number, OrgAuthEditionEvaluation>> {
  const rowsByOrgAuthId = groupOrgAuthUpgradeRows(
    await listOrgAuthUpgradeRows(
      database,
      orgAuthRows.map((row) => row.id),
    ),
  );
  const now = new Date();

  return new Map(
    orgAuthRows.map((row) => [
      row.id,
      evaluateOrgAuthEdition(
        row.edition,
        rowsByOrgAuthId.get(row.id) ?? [],
        now,
      ),
    ]),
  );
}

function getOrgAuthEditionEvaluation(
  row: { id: number; edition: AuthorizationEdition },
  editionEvaluationsByOrgAuthId: Map<number, OrgAuthEditionEvaluation>,
): OrgAuthEditionEvaluation {
  return (
    editionEvaluationsByOrgAuthId.get(row.id) ??
    evaluateOrgAuthEdition(row.edition, [], new Date())
  );
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

async function lockOrgAuthQuotaScope(
  database: AdminOrganizationOrgAuthRuntimeDatabase,
  input: {
    level: number;
    organizationIds: number[];
    profession: NormalizedCreateOrgAuthInput["profession"];
  },
): Promise<void> {
  const lockKeys = [...input.organizationIds]
    .sort((left, right) => left - right)
    .map(
      (organizationId) =>
        `org_auth:${input.profession}:level:${input.level}:organization:${organizationId}`,
    );

  await database.execute(sql`
    select pg_advisory_xact_lock(200111, hashtext(scope_lock.lock_key))
    from unnest(array[${sql.join(
      lockKeys.map((lockKey) => sql`${lockKey}`),
      sql`, `,
    )}]) as scope_lock(lock_key)
  `);
}

async function hasOverlappingOrgAuthWithOrganizationIds(
  database: AdminOrganizationOrgAuthRuntimeDatabase,
  input: NormalizedCreateOrgAuthInput,
  organizationIds: number[],
): Promise<boolean> {
  if (organizationIds.length === 0) {
    return false;
  }

  const [row] = await database
    .select({ value: count() })
    .from(orgAuth)
    .innerJoin(
      organization,
      and(
        inArray(organization.id, organizationIds),
        createOrgAuthCoversOrganizationCondition({
          authScopeType: orgAuth.auth_scope_type,
          orgAuthId: orgAuth.id,
          organizationId: organization.id,
          purchaserOrganizationId: orgAuth.purchaser_organization_id,
        }),
      ),
    )
    .where(
      and(
        eq(orgAuth.status, "active"),
        eq(orgAuth.profession, input.profession),
        eq(orgAuth.level, input.level),
        lt(orgAuth.starts_at, input.expiresAt),
        gt(orgAuth.expires_at, input.startsAt),
      ),
    );

  return (row?.value ?? 0) > 0;
}

async function listOrganizationAndDescendantIds(
  database: AdminOrganizationOrgAuthRuntimeDatabase,
  rootOrganizationId: number,
): Promise<number[]> {
  let organizationIds = [rootOrganizationId];
  let frontierIds = [rootOrganizationId];
  const visitedOrganizationIds = new Set(organizationIds);

  for (
    let depth = 0;
    depth < MAX_ORGANIZATION_TREE_DEPTH - 1 && frontierIds.length > 0;
    depth += 1
  ) {
    const childRows = await database
      .select({ id: organization.id })
      .from(organization)
      .where(inArray(organization.parent_organization_id, frontierIds));
    const childIds = childRows.map((row) => row.id);

    if (childIds.some((childId) => visitedOrganizationIds.has(childId))) {
      throw new OrganizationTreeConflictError();
    }

    childIds.forEach((childId) => visitedOrganizationIds.add(childId));

    organizationIds = [...organizationIds, ...childIds];
    frontierIds = childIds;
  }

  if (frontierIds.length > 0) {
    const [overflowOrganization] = await database
      .select({ id: organization.id })
      .from(organization)
      .where(inArray(organization.parent_organization_id, frontierIds))
      .limit(1);

    if (overflowOrganization !== undefined) {
      throw new OrganizationTreeConflictError();
    }
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
        eq(user.user_type, "employee"),
        eq(user.status, "active"),
      ),
    );

  return row?.value ?? 0;
}

async function listActiveEmployeeIdsByOrganizationIds(
  database: AdminOrganizationOrgAuthRuntimeDatabase,
  organizationIds: number[],
): Promise<number[]> {
  if (organizationIds.length === 0) {
    return [];
  }

  const rows = await database
    .select({ id: employee.id })
    .from(employee)
    .innerJoin(user, eq(user.id, employee.user_id))
    .where(
      and(
        inArray(employee.organization_id, organizationIds),
        eq(user.user_type, "employee"),
        eq(user.status, "active"),
      ),
    )
    .orderBy(asc(employee.id));

  return rows.map((row) => row.id);
}

async function terminateOrganizationActiveFlows(
  database: AdminOrganizationOrgAuthRuntimeDatabase,
  organizationIds: number[],
): Promise<OrgAuthTerminationResult> {
  const userIds = await listActiveUserIdsByOrganizationIds(
    database,
    organizationIds,
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

async function findOrgAuthActiveFlowScope(
  database: AdminOrganizationOrgAuthRuntimeDatabase,
  publicId: string,
): Promise<{
  orgAuthId: number;
  organizationIds: number[];
  profession: (typeof orgAuth.$inferSelect)["profession"];
  level: number;
} | null> {
  const [orgAuthRow] = await database
    .select({
      id: orgAuth.id,
      auth_scope_type: orgAuth.auth_scope_type,
      purchaser_organization_id: orgAuth.purchaser_organization_id,
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
    .select({ organization_id: organization.id })
    .from(organization)
    .where(
      createOrgAuthCoversOrganizationCondition({
        authScopeType: orgAuthRow.auth_scope_type,
        orgAuthId: orgAuthRow.id,
        organizationId: organization.id,
        purchaserOrganizationId: orgAuthRow.purchaser_organization_id,
      }),
    );

  return {
    orgAuthId: orgAuthRow.id,
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
        eq(user.user_type, "employee"),
      ),
    );

  return rows.map((row) => row.id);
}

async function listReservedActiveUserIdsByOrgAuth(
  database: AdminOrganizationOrgAuthRuntimeDatabase,
  orgAuthId: number,
  organizationIds: number[],
): Promise<number[]> {
  if (organizationIds.length === 0) {
    return [];
  }

  const rows = await database
    .select({ id: user.id })
    .from(employeeOrgAuth)
    .innerJoin(employee, eq(employee.id, employeeOrgAuth.employee_id))
    .innerJoin(user, eq(user.id, employee.user_id))
    .where(
      and(
        eq(employeeOrgAuth.org_auth_id, orgAuthId),
        inArray(employee.organization_id, organizationIds),
        eq(user.status, "active"),
        eq(user.user_type, "employee"),
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
  edition: AuthorizationEdition;
  effectiveEdition?: AuthorizationEdition;
  upgradeStatus?: AuthUpgradeStatus | "none";
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
    edition: input.edition,
    effectiveEdition: input.effectiveEdition ?? input.edition,
    upgradeStatus: input.upgradeStatus ?? "none",
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
  return createRuntimeDatabaseForSchema(
    databaseSchema,
    "DATABASE_URL is required for admin organization org auth runtime.",
  );
}
