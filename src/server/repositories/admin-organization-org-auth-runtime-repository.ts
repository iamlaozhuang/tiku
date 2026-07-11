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
  EmployeeImportResultDto,
  EmployeeImportRowInputDto,
  EmployeeImportRejectedRowDto,
  EmployeeTransferResultDto,
  EmployeeMutationResultDto,
  EmployeeUnbindResultDto,
  EmployeeListDto,
  OrganizationListDto,
  OrganizationTreeNodeListDto,
  OrganizationTreePathItemDto,
  OrganizationTreeQuery,
} from "../contracts/admin-user-org-auth-ops-contract";
import type { UserRegistrationCredentialAdapter } from "../auth/user-registration-boundary";
import type {
  BindExistingUserToOrganizationInput,
  CreateEmployeeAccountInput,
  EmployeeAccountRepository,
} from "./employee-account-repository";
import type {
  DisableOrganizationResultDto,
  OrgAuthDetailDto,
  OrgAuthDto,
  OrgAuthListDto,
  OrganizationDto,
} from "../contracts/organization-auth-contract";
import type { AuthUpgradeStatus, AuthorizationEdition } from "../models/auth";
import type { NormalizedCreateOrgAuthInput } from "../validators/org-auth";
import type {
  NormalizedCreateOrganizationInput,
  NormalizedUpdateOrganizationInput,
} from "../validators/organization";
import { validateOrganizationTierParent } from "../validators/organization";
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
    query: AdminAuthOperationListQuery,
  ): Promise<AdminOrganizationOrgAuthPage<OrgAuthListDto>>;
  getOrgAuthDetail?(publicId: string): Promise<OrgAuthDetailDto | null>;
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
  enableOrganization?(publicId: string): Promise<OrganizationDto | null>;
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
  importEmployees?(
    input: EmployeeImportInput,
  ): Promise<EmployeeImportResultDto | null>;
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

export type CreateEmployeeInput = {
  userPublicId: string;
  organizationPublicId: string;
};

export type EmployeeImportInput = {
  employees: EmployeeImportRowInputDto[];
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
};

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
      const organizationPublicIdsByOrgAuthId =
        await listOrgAuthOrganizationPublicIds(
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
            organizationPublicIdsByOrgAuthId.get(row.id) ?? [],
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
        .from(orgAuthOrganization)
        .innerJoin(
          organization,
          eq(organization.id, orgAuthOrganization.organization_id),
        )
        .where(eq(orgAuthOrganization.org_auth_id, row.id))
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
      const parentOrganization = await findParentOrganization(
        database,
        input.parentOrganizationPublicId,
      );

      if (parentOrganization === undefined) {
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
      const [organizationRow] = await database
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
      const parentOrganization = await findParentOrganization(
        database,
        input.parentOrganizationPublicId,
      );

      if (
        parentOrganization === undefined ||
        input.parentOrganizationPublicId === publicId
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

      const [organizationRow] = await database
        .update(organization)
        .set({
          name: input.name,
          org_tier: input.orgTier,
          parent_organization_id: parentOrganization?.id ?? null,
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

      const activeFlowTermination = await terminateOrganizationActiveFlows(
        database,
        organizationIds,
      );

      return {
        organization: await mapOrganizationMutationRowToDto(
          database,
          disabledOrganization,
        ),
        activeFlowTermination,
        affectedOrganizationPublicIds: await listOrganizationPublicIdsByIds(
          database,
          organizationIds,
        ),
      };
    },
    async enableOrganization(publicId) {
      const database = getDatabase();
      const [organizationRow] = await database
        .update(organization)
        .set({
          status: "active",
          updated_at: new Date(),
        })
        .where(eq(organization.public_id, publicId))
        .returning(selectOrganizationMutationColumns());

      return organizationRow === undefined
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

        await transactionalDatabase.insert(orgAuthOrganization).values(
          organizationIds.map((organizationId) => ({
            org_auth_id: orgAuthRow.id,
            organization_id: organizationId,
          })),
        );

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
    async importEmployees(input) {
      const database = getDatabase();

      return database.transaction(async (transaction) =>
        importEmployeesWithDatabase(
          transaction as AdminOrganizationOrgAuthRuntimeDatabase,
          input,
        ),
      );
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
    async transferEmployee(input) {
      const database = getDatabase();

      return database.transaction(async (transaction) => {
        const [employeeRow] = await transaction
          .select({
            employee_id: employee.id,
            employee_public_id: employee.public_id,
            organization_id: employee.organization_id,
            organization_public_id: organization.public_id,
            user_id: user.id,
            user_public_id: user.public_id,
            auth_user_id: user.auth_user_id,
          })
          .from(employee)
          .innerJoin(user, eq(user.id, employee.user_id))
          .innerJoin(
            organization,
            eq(organization.id, employee.organization_id),
          )
          .where(eq(employee.public_id, input.employeePublicId))
          .limit(1);

        if (employeeRow === undefined) {
          return null;
        }

        const [targetOrganizationRow] = await transaction
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
            status: "target_organization_not_found",
          };
        }

        if (targetOrganizationRow.id === employeeRow.organization_id) {
          return {
            employeePublicId: input.employeePublicId,
            targetOrganizationPublicId: input.targetOrganizationPublicId,
            status: "same_organization",
          };
        }

        const now = new Date();
        const targetOrgAuthRows = await transaction
          .select({
            id: orgAuth.id,
            profession: orgAuth.profession,
            level: orgAuth.level,
            account_quota: orgAuth.account_quota,
          })
          .from(orgAuth)
          .innerJoin(
            orgAuthOrganization,
            eq(orgAuthOrganization.org_auth_id, orgAuth.id),
          )
          .where(
            and(
              eq(orgAuthOrganization.organization_id, targetOrganizationRow.id),
              eq(orgAuth.status, "active"),
              lt(orgAuth.starts_at, now),
              gt(orgAuth.expires_at, now),
            ),
          );

        if (targetOrgAuthRows.length === 0) {
          return {
            employeePublicId: input.employeePublicId,
            targetOrganizationPublicId: input.targetOrganizationPublicId,
            status: "quota_insufficient",
          };
        }

        let hasTargetQuota = false;

        for (const targetOrgAuthRow of targetOrgAuthRows) {
          const scopeRows = await transaction
            .select({ organization_id: orgAuthOrganization.organization_id })
            .from(orgAuthOrganization)
            .where(eq(orgAuthOrganization.org_auth_id, targetOrgAuthRow.id));
          const organizationIds = scopeRows.map((scopeRow) => {
            return scopeRow.organization_id;
          });

          await lockOrgAuthQuotaScope(transaction, {
            level: targetOrgAuthRow.level,
            organizationIds,
            profession: targetOrgAuthRow.profession,
          });

          const usedQuota = await countActiveEmployeesByOrganizationIds(
            transaction,
            organizationIds,
          );
          const transferAddsQuota = organizationIds.includes(
            employeeRow.organization_id,
          )
            ? 0
            : 1;

          if (usedQuota + transferAddsQuota <= targetOrgAuthRow.account_quota) {
            hasTargetQuota = true;
          }
        }

        if (!hasTargetQuota) {
          return {
            employeePublicId: input.employeePublicId,
            targetOrganizationPublicId: input.targetOrganizationPublicId,
            status: "quota_insufficient",
          };
        }

        await transaction
          .update(employee)
          .set({
            organization_id: targetOrganizationRow.id,
            updated_at: now,
          })
          .where(eq(employee.id, employeeRow.employee_id));
        await transaction
          .update(user)
          .set({
            user_type: "employee",
            updated_at: now,
          })
          .where(eq(user.id, employeeRow.user_id));
        await transaction
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
          await transaction
            .delete(authSession)
            .where(eq(authSession.user_id, employeeRow.auth_user_id));
        }

        await refreshOrgAuthUsedQuotaByOrganizationIds(transaction, [
          employeeRow.organization_id,
          targetOrganizationRow.id,
        ]);

        return {
          employeePublicId: employeeRow.employee_public_id,
          userPublicId: employeeRow.user_public_id,
          previousOrganizationPublicId: employeeRow.organization_public_id,
          targetOrganizationPublicId: targetOrganizationRow.public_id,
          quotaRefreshStatus: "refreshed",
          sessionRevocationStatus:
            employeeRow.auth_user_id === null ? "not_needed" : "revoked",
          historicalSnapshotStatus: "preserved",
          oldOrganizationInProgressTrainingStatus: "blocked",
          status: "transferred",
        };
      });
    },
    async unbindEmployee(input) {
      const database = getDatabase();
      const employeePublicId =
        typeof input === "string" ? input : input.employeePublicId;
      const organizationPublicId =
        typeof input === "string" ? null : (input.organizationPublicId ?? null);

      return database.transaction(async (transaction) => {
        const conditions = [eq(employee.public_id, employeePublicId)];

        if (organizationPublicId !== null) {
          conditions.push(eq(organization.public_id, organizationPublicId));
        }

        const [employeeRow] = await transaction
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

        await transaction
          .update(user)
          .set({
            user_type: "personal",
            updated_at: new Date(),
          })
          .where(eq(user.id, employeeRow.user_id));
        await transaction
          .update(employee)
          .set({
            updated_at: new Date(),
          })
          .where(eq(employee.id, employeeRow.employee_id));

        if (employeeRow.auth_user_id !== null) {
          await transaction
            .delete(authSession)
            .where(eq(authSession.user_id, employeeRow.auth_user_id));
        }

        await refreshOrgAuthUsedQuotaByOrganizationIds(transaction, [
          employeeRow.organization_id,
        ]);

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

export function createPostgresEmployeeAccountCredentialAdapter(
  options: AdminOrganizationOrgAuthRuntimeRepositoryOptions = {},
): UserRegistrationCredentialAdapter {
  const getDatabase = createLazyDatabaseGetter(
    options.createDatabase ?? createLocalRuntimeDatabase,
  );

  return {
    async createPasswordCredential(input) {
      const database = getDatabase();
      const authUserId = `auth-user-${randomUUID()}`;
      const passwordHash = await hashPassword(input.password);
      const now = new Date();

      await database.transaction(async (transaction) => {
        await transaction.insert(authUser).values({
          created_at: now,
          email: `phone-${input.phone}@tiku.local`,
          email_verified: now,
          id: authUserId,
          image: null,
          name: input.phone,
          updated_at: now,
        });
        await transaction.insert(authAccount).values({
          access_token: null,
          access_token_expires_at: null,
          account_id: authUserId,
          created_at: now,
          id: `auth-account-${randomUUID()}`,
          id_token: null,
          [authAccountCredentialField]: passwordHash,
          provider_id: CREDENTIAL_PROVIDER_ID,
          refresh_token: null,
          refresh_token_expires_at: null,
          scope: null,
          updated_at: now,
          user_id: authUserId,
        });
      });

      return { authUserId };
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

      return database.transaction(async (transaction) =>
        createEmployeeAccountWithDatabase(
          transaction as AdminOrganizationOrgAuthRuntimeDatabase,
          input,
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
  input: CreateEmployeeAccountInput,
) {
  const [organizationRow] = await database
    .select({
      id: organization.id,
      name: organization.name,
      public_id: organization.public_id,
    })
    .from(organization)
    .where(eq(organization.public_id, input.organizationPublicId))
    .limit(1);

  if (organizationRow === undefined) {
    throw new Error("Organization does not exist.");
  }

  const now = new Date();
  const [userRow] = await database
    .insert(user)
    .values({
      auth_user_id: input.authUserId,
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
  const [userRow] = await database
    .select({
      auth_user_id: user.auth_user_id,
      id: user.id,
      locked_until_at: user.locked_until_at,
      name: user.name,
      phone: user.phone,
      public_id: user.public_id,
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
    .where(eq(organization.public_id, input.organizationPublicId))
    .limit(1);

  if (
    userRow === undefined ||
    userRow.auth_user_id === null ||
    organizationRow === undefined
  ) {
    throw new Error("Employee account binding failed.");
  }

  const now = new Date();
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
  Pick<OrganizationMutationRow, "id" | "org_tier"> | null | undefined
> {
  if (parentOrganizationPublicId === null) {
    return null;
  }

  const [parentOrganization] = await database
    .select({ id: organization.id, org_tier: organization.org_tier })
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
      orgAuthOrganization,
      eq(orgAuthOrganization.org_auth_id, orgAuth.id),
    )
    .where(
      and(
        eq(orgAuth.status, "active"),
        eq(orgAuth.auth_scope_type, input.authScopeType),
        eq(orgAuth.profession, input.profession),
        eq(orgAuth.level, input.level),
        lt(orgAuth.starts_at, input.expiresAt),
        gt(orgAuth.expires_at, input.startsAt),
        inArray(orgAuthOrganization.organization_id, organizationIds),
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
        eq(user.user_type, "employee"),
        eq(user.status, "active"),
      ),
    );

  return row?.value ?? 0;
}

async function refreshOrgAuthUsedQuotaByOrganizationIds(
  database: AdminOrganizationOrgAuthRuntimeDatabase,
  organizationIds: number[],
): Promise<void> {
  if (organizationIds.length === 0) {
    return;
  }

  const orgAuthRows = await database
    .select({ org_auth_id: orgAuthOrganization.org_auth_id })
    .from(orgAuthOrganization)
    .innerJoin(orgAuth, eq(orgAuth.id, orgAuthOrganization.org_auth_id))
    .where(
      and(
        inArray(orgAuthOrganization.organization_id, organizationIds),
        eq(orgAuth.status, "active"),
      ),
    );
  const orgAuthIds = [...new Set(orgAuthRows.map((row) => row.org_auth_id))];

  for (const orgAuthId of orgAuthIds) {
    const scopeRows = await database
      .select({ organization_id: orgAuthOrganization.organization_id })
      .from(orgAuthOrganization)
      .where(eq(orgAuthOrganization.org_auth_id, orgAuthId));
    const usedQuota = await countActiveEmployeesByOrganizationIds(
      database,
      scopeRows.map((row) => row.organization_id),
    );

    await database
      .update(orgAuth)
      .set({
        used_quota: usedQuota,
        updated_at: new Date(),
      })
      .where(eq(orgAuth.id, orgAuthId));
  }
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

async function importEmployeesWithDatabase(
  database: AdminOrganizationOrgAuthRuntimeDatabase,
  input: EmployeeImportInput,
): Promise<EmployeeImportResultDto> {
  const importRows = input.employees.map((employeeInput, index) => ({
    ...employeeInput,
    rowNumber: index + 1,
  }));
  const userPublicIds = [
    ...new Set(importRows.map((employeeInput) => employeeInput.userPublicId)),
  ];
  const organizationPublicIds = [
    ...new Set(
      importRows.map((employeeInput) => employeeInput.organizationPublicId),
    ),
  ];
  const duplicateUserPublicIds = new Set(
    userPublicIds.filter(
      (userPublicId) =>
        importRows.filter(
          (employeeInput) => employeeInput.userPublicId === userPublicId,
        ).length > 1,
    ),
  );
  const userRows = await database
    .select({
      id: user.id,
      public_id: user.public_id,
      phone: user.phone,
      name: user.name,
    })
    .from(user)
    .where(inArray(user.public_id, userPublicIds));
  const organizationRows = await database
    .select({
      id: organization.id,
      public_id: organization.public_id,
    })
    .from(organization)
    .where(inArray(organization.public_id, organizationPublicIds));
  const userByPublicId = new Map(
    userRows.map((userRow) => [userRow.public_id, userRow]),
  );
  const organizationByPublicId = new Map(
    organizationRows.map((organizationRow) => [
      organizationRow.public_id,
      organizationRow,
    ]),
  );
  const rejectedRows = importRows.flatMap((employeeInput) =>
    createEmployeeImportRejectedRows({
      duplicateUserPublicIds,
      employeeInput,
      organizationByPublicId,
      userByPublicId,
    }),
  );

  if (rejectedRows.length > 0) {
    return {
      importedEmployees: [],
      rejectedRows,
    };
  }

  const userIds = userRows.map((userRow) => userRow.id);
  const existingEmployeeRows =
    userIds.length === 0
      ? []
      : await database
          .select({
            id: employee.id,
            public_id: employee.public_id,
            user_id: employee.user_id,
          })
          .from(employee)
          .where(inArray(employee.user_id, userIds));
  const existingEmployeeByUserId = new Map(
    existingEmployeeRows.map((employeeRow) => [
      employeeRow.user_id,
      employeeRow,
    ]),
  );
  const now = new Date();
  let importedEmployees: EmployeeImportResultDto["importedEmployees"] = [];

  for (const employeeInput of importRows) {
    const userRow = userByPublicId.get(employeeInput.userPublicId);
    const organizationRow = organizationByPublicId.get(
      employeeInput.organizationPublicId,
    );

    if (userRow === undefined || organizationRow === undefined) {
      continue;
    }

    const existingEmployee = existingEmployeeByUserId.get(userRow.id);
    const employeePublicId =
      existingEmployee?.public_id ?? `employee-${randomUUID()}`;

    if (existingEmployee === undefined) {
      await database.insert(employee).values({
        public_id: employeePublicId,
        user_id: userRow.id,
        organization_id: organizationRow.id,
        created_at: now,
        updated_at: now,
      });
    } else {
      await database
        .update(employee)
        .set({
          organization_id: organizationRow.id,
          updated_at: now,
        })
        .where(eq(employee.id, existingEmployee.id));
    }

    await database
      .update(user)
      .set({
        user_type: "employee",
        status: "active",
        disabled_at: null,
        updated_at: now,
      })
      .where(eq(user.id, userRow.id));

    importedEmployees = [
      ...importedEmployees,
      {
        publicId: employeePublicId,
        userPublicId: userRow.public_id,
        phone: userRow.phone,
        name: userRow.name,
        organizationPublicId: organizationRow.public_id,
        status: "active",
      },
    ];
  }

  return {
    importedEmployees,
    rejectedRows: [],
  };
}

function createEmployeeImportRejectedRows(input: {
  duplicateUserPublicIds: Set<string>;
  employeeInput: EmployeeImportRowInputDto & { rowNumber: number };
  organizationByPublicId: Map<
    string,
    {
      id: number;
      public_id: string;
    }
  >;
  userByPublicId: Map<
    string,
    {
      id: number;
      public_id: string;
      phone: string;
      name: string;
    }
  >;
}): EmployeeImportRejectedRowDto[] {
  const { employeeInput } = input;
  const duplicateUserRejectedRow = input.duplicateUserPublicIds.has(
    employeeInput.userPublicId,
  )
    ? [
        {
          rowNumber: employeeInput.rowNumber,
          userPublicId: employeeInput.userPublicId,
          organizationPublicId: employeeInput.organizationPublicId,
          reason: "duplicate_user" as const,
        },
      ]
    : [];
  const userRejectedRow = input.userByPublicId.has(employeeInput.userPublicId)
    ? []
    : [
        {
          rowNumber: employeeInput.rowNumber,
          userPublicId: employeeInput.userPublicId,
          organizationPublicId: employeeInput.organizationPublicId,
          reason: "user_not_found" as const,
        },
      ];
  const organizationRejectedRow = input.organizationByPublicId.has(
    employeeInput.organizationPublicId,
  )
    ? []
    : [
        {
          rowNumber: employeeInput.rowNumber,
          userPublicId: employeeInput.userPublicId,
          organizationPublicId: employeeInput.organizationPublicId,
          reason: "organization_not_found" as const,
        },
      ];

  return [
    ...duplicateUserRejectedRow,
    ...userRejectedRow,
    ...organizationRejectedRow,
  ];
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
