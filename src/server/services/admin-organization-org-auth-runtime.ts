import { createLocalSessionRuntime } from "../auth/local-session-runtime";
import { getRequestAuthorization } from "../auth/session-cookie";
import {
  createErrorResponse,
  createPaginatedResponse,
  createSuccessResponse,
  type ApiResponse,
} from "../contracts/api-response";
import {
  ADMIN_AUTH_OPERATION_ERROR_CODES,
  ADMIN_AUTH_OPERATION_SORT_FIELDS,
  createAdminAuthOperationListQuery,
  type AdminAuthOperationListQuery,
  type AdminAuthOperationPageSize,
  type AdminAuthOperationSortField,
  type EmployeeListQuery,
  type EmployeeSummaryDto,
  type EmployeeTransferResultDto,
  type EmployeeUnbindResultDto,
  type OrganizationTreeQuery,
  type OrgAuthListQuery,
} from "../contracts/admin-user-org-auth-ops-contract";
import type {
  OrgAuthClosureActionResultDto,
  OrgAuthDetailResultDto,
  DisableOrganizationResultDto,
  OrgAuthResultDto,
  OrganizationDto,
  OrganizationResultDto,
} from "../contracts/organization-auth-contract";
import {
  createPostgresAdminOrganizationOrgAuthRuntimeRepositories,
  type AdminOrganizationOrgAuthRuntimeRepositories,
  type AdminOrganizationOrgAuthRuntimeRepositoryOptions,
  type LifecycleCommandResult,
  type OrgAuthClosureMutationResult,
  type OrgAuthClosureCommandOperator,
} from "../repositories/admin-organization-org-auth-runtime-repository";
import type { EmployeeImportCommandActor } from "../contracts/employee-import-command-contract";
import { maskPhoneForDisplay } from "../mappers/phone-display-mapper";
import {
  createEmployeeImportCommandService,
  type EmployeeImportCommandService,
} from "./employee-import-command-service";
import { createPostgresEmployeeImportCommandRepository } from "../repositories/postgres-employee-import-command-repository";
import { createNoStoreJsonResponse } from "./employee-import-command-route";
import {
  normalizeCreateOrgAuthPackageInput,
  normalizeOrgAuthClosureMetadataInput,
  normalizeOrgAuthQuotaExpansionInput,
  normalizeOrgAuthRenewalInput,
  normalizeOrgAuthReplacementInput,
} from "../validators/org-auth";
import {
  normalizeCreateOrganizationInput,
  normalizeDisableOrganizationInput,
  normalizeMoveOrganizationInput,
  normalizeUpdateOrganizationInput,
  type NormalizedCreateOrganizationInput,
  type NormalizedDisableOrganizationInput,
  type NormalizedMoveOrganizationInput,
  type NormalizedUpdateOrganizationInput,
} from "../validators/organization";
import type { SessionService } from "./session-service";
import {
  authorizationEditionValues,
  orgTierValues,
  professionValues,
} from "../models/auth";
import { createRouteHandlersWithErrorEnvelope } from "./route-error-response";

export type { AdminOrganizationOrgAuthRuntimeRepositories };

export type AdminOrganizationOrgAuthRuntimeOptions =
  AdminOrganizationOrgAuthRuntimeRepositoryOptions & {
    employeeImportCommandService?: EmployeeImportCommandService;
    repositories?: AdminOrganizationOrgAuthRuntimeRepositories;
    sessionService?: Pick<SessionService, "getCurrentSession">;
  };

type AdminOrganizationOrgAuthRole =
  | "super_admin"
  | "ops_admin"
  | "content_admin";

type AdminOrganizationOrgAuthActor = {
  publicId: string;
  roles: [AdminOrganizationOrgAuthRole, ...AdminOrganizationOrgAuthRole[]];
};

const adminSessionRequiredResponse = createErrorResponse(
  401001,
  "Admin session is required.",
);
const adminPermissionDeniedResponse = createErrorResponse(
  ADMIN_AUTH_OPERATION_ERROR_CODES.adminPermissionDenied,
  "Admin permission denied.",
);
const organizationMutationUnavailableResponse = createErrorResponse(
  503005,
  "Organization mutation runtime is not configured.",
);
const organizationTreeUnavailableResponse = createErrorResponse(
  503009,
  "Organization tree runtime is not configured.",
);
const organizationInputInvalidResponse = createErrorResponse(
  ADMIN_AUTH_OPERATION_ERROR_CODES.validationFailed,
  "Organization input is invalid.",
);
const organizationNotFoundResponse = createErrorResponse(
  ADMIN_AUTH_OPERATION_ERROR_CODES.resourceNotFound,
  "Organization does not exist.",
);
const organizationTreeConflictResponse = createErrorResponse(
  409004,
  "Organization tree revision or invariant conflict.",
);
const orgAuthMutationUnavailableResponse = createErrorResponse(
  503006,
  "Org auth mutation runtime is not configured.",
);
const orgAuthInputInvalidResponse = createErrorResponse(
  ADMIN_AUTH_OPERATION_ERROR_CODES.validationFailed,
  "Org auth input is invalid.",
);
const orgAuthNotFoundResponse = createErrorResponse(
  ADMIN_AUTH_OPERATION_ERROR_CODES.resourceNotFound,
  "Org auth does not exist.",
);
const orgAuthScopeOverlapResponse = createErrorResponse(
  409005,
  "Org auth scope overlaps an existing active authorization.",
);
const orgAuthQuotaExceededResponse = createErrorResponse(
  409006,
  "Org auth quota is exceeded or organization does not exist.",
);
const orgAuthClosureConflictResponse = createErrorResponse(
  409007,
  "Org auth closure action conflicts with current authorization state.",
);
const employeeMutationUnavailableResponse = createErrorResponse(
  503007,
  "Employee account mutation runtime is not configured.",
);
const employeeNotFoundResponse = createErrorResponse(
  ADMIN_AUTH_OPERATION_ERROR_CODES.resourceNotFound,
  "Employee does not exist.",
);
const employeeInputInvalidResponse = createErrorResponse(
  ADMIN_AUTH_OPERATION_ERROR_CODES.validationFailed,
  "Employee input is invalid.",
);
const employeeImportCommandUnavailableResponse = createErrorResponse(
  503601,
  "Employee import command is temporarily unavailable.",
);

type RouteContext = {
  params: Promise<{
    publicId: string;
  }>;
};

type OrganizationEmployeeRouteContext = {
  params: Promise<{
    publicId: string;
    employeePublicId: string;
  }>;
};

type OrganizationMutationRepositories =
  AdminOrganizationOrgAuthRuntimeRepositories & {
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
      operator: OrgAuthClosureCommandOperator,
    ): Promise<
      | DisableOrganizationResultDto
      | LifecycleCommandResult<DisableOrganizationResultDto>
      | null
    >;
    enableOrganization?(
      input: NormalizedDisableOrganizationInput & { publicId: string },
    ): Promise<OrganizationDto | null>;
  };

function createJsonResponse<TData>(response: ApiResponse<TData>): Response {
  return Response.json(response);
}

function unwrapLifecycleCommandResult<TData extends object>(
  result: LifecycleCommandResult<TData> | TData,
): { data: TData; successAuditPersisted: boolean } {
  if (
    "successAuditPersisted" in result &&
    result.successAuditPersisted === true &&
    "data" in result
  ) {
    return { data: result.data as TData, successAuditPersisted: true };
  }

  return { data: result as TData, successAuditPersisted: false };
}

function formatOrganizationDisableMetadata(
  result: DisableOrganizationResultDto,
): string {
  const activeFlowTermination = result.activeFlowTermination;

  if (activeFlowTermination === undefined) {
    return `redacted organization disable metadata; affected organization=${result.affectedOrganizationPublicIds.length}`;
  }

  return `redacted organization disable metadata; affected organization=${result.affectedOrganizationPublicIds.length} terminated practice=${activeFlowTermination.practiceCount} mock_exam=${activeFlowTermination.mockExamCount}`;
}

function isAdminOrganizationOrgAuthRole(
  role: string,
): role is AdminOrganizationOrgAuthRole {
  return (
    role === "super_admin" || role === "ops_admin" || role === "content_admin"
  );
}

async function resolveAdminActor(
  request: Request,
  sessionService: Pick<SessionService, "getCurrentSession">,
): Promise<AdminOrganizationOrgAuthActor | null> {
  const sessionResponse = await sessionService.getCurrentSession({
    authorization: getRequestAuthorization(request),
  });

  if (sessionResponse.code !== 0 || sessionResponse.data === null) {
    return null;
  }

  const adminPublicId = sessionResponse.data.user.adminPublicId ?? null;
  const adminRoles = (sessionResponse.data.user.adminRoles ?? []).filter(
    isAdminOrganizationOrgAuthRole,
  );

  if (adminPublicId === null || adminRoles.length === 0) {
    return null;
  }

  return {
    publicId: adminPublicId,
    roles: adminRoles as [
      AdminOrganizationOrgAuthRole,
      ...AdminOrganizationOrgAuthRole[],
    ],
  };
}

function canReadEnterpriseAuth(actor: AdminOrganizationOrgAuthActor): boolean {
  return (
    actor.roles.includes("super_admin") || actor.roles.includes("ops_admin")
  );
}

function canManageEmployee(actor: AdminOrganizationOrgAuthActor): boolean {
  return (
    actor.roles.includes("super_admin") || actor.roles.includes("ops_admin")
  );
}

function canManageOrgAuth(actor: AdminOrganizationOrgAuthActor): boolean {
  return (
    actor.roles.includes("super_admin") || actor.roles.includes("ops_admin")
  );
}

function readOrgAuthManagerRole(
  actor: AdminOrganizationOrgAuthActor,
): "ops_admin" | "super_admin" {
  return actor.roles.includes("super_admin") ? "super_admin" : "ops_admin";
}

function canManageOrganization(actor: AdminOrganizationOrgAuthActor): boolean {
  return (
    actor.roles.includes("super_admin") || actor.roles.includes("ops_admin")
  );
}

function canMoveOrganization(actor: AdminOrganizationOrgAuthActor): boolean {
  return actor.roles.includes("super_admin");
}

function readRequestIp(request: Request): string | null {
  const forwardedFor = request.headers.get("x-forwarded-for");

  if (forwardedFor !== null) {
    return forwardedFor.split(",")[0]?.trim() || null;
  }

  return request.headers.get("x-real-ip");
}

async function readRequestJson(request: Request): Promise<unknown> {
  try {
    return await request.json();
  } catch {
    return null;
  }
}

function normalizeEmployeeTransferInput(
  input: unknown,
): { targetOrganizationPublicId: string } | null {
  if (typeof input !== "object" || input === null) {
    return null;
  }

  const value = input as {
    targetOrganizationPublicId?: unknown;
  };

  return typeof value.targetOrganizationPublicId === "string" &&
    value.targetOrganizationPublicId.trim().length > 0
    ? {
        targetOrganizationPublicId: value.targetOrganizationPublicId.trim(),
      }
    : null;
}

function maskEmployeeSummaryPhone(
  employeeSummary: EmployeeSummaryDto,
): EmployeeSummaryDto {
  return {
    ...employeeSummary,
    phone: maskPhoneForDisplay(employeeSummary.phone),
  };
}

function readAdminAuthOperationListQuery(
  request: Request,
): AdminAuthOperationListQuery {
  const searchParams = new URL(request.url).searchParams;
  const page = Number(searchParams.get("page"));
  const pageSize = readPageSize(searchParams, [20, 50, 100], 20);
  const sortBy = readSortBy(searchParams);
  const sortOrder = searchParams.get("sortOrder") === "asc" ? "asc" : "desc";

  return createAdminAuthOperationListQuery({
    page: Number.isInteger(page) && page > 0 ? page : 1,
    pageSize: pageSize as AdminAuthOperationPageSize,
    sortBy,
    sortOrder,
    keyword: searchParams.get("keyword"),
    status: readStatus(searchParams),
    userType: readUserType(searchParams),
  });
}

function readOrganizationTreeQuery(request: Request): OrganizationTreeQuery {
  const searchParams = new URL(request.url).searchParams;
  const page = Number(searchParams.get("page"));
  const pageSize = readPageSize(searchParams, [20, 50, 100], 50);
  const keyword = searchParams.get("keyword")?.trim() ?? "";
  const parentOrganizationPublicId =
    searchParams.get("parentOrganizationPublicId")?.trim() ?? "";
  const status = searchParams.get("status");
  const orgTier = searchParams.get("orgTier");

  return {
    page: Number.isFinite(page) && page > 0 ? page : 1,
    pageSize: pageSize as AdminAuthOperationPageSize,
    parentOrganizationPublicId:
      parentOrganizationPublicId.length === 0
        ? null
        : parentOrganizationPublicId,
    keyword: keyword.length === 0 ? null : keyword,
    status: status === "active" || status === "disabled" ? status : "all",
    orgTier: orgTierValues.includes(orgTier as (typeof orgTierValues)[number])
      ? (orgTier as (typeof orgTierValues)[number])
      : "all",
    sortOrder: searchParams.get("sortOrder") === "desc" ? "desc" : "asc",
  };
}

function readOrgAuthListQuery(request: Request): OrgAuthListQuery {
  const searchParams = new URL(request.url).searchParams;
  const page = Number(searchParams.get("page"));
  const pageSize = readPageSize(searchParams, [20, 50, 100], 20);
  const keyword = searchParams.get("keyword")?.trim() ?? "";
  const status = searchParams.get("status");
  const edition = searchParams.get("edition");
  const profession = searchParams.get("profession");
  const level = Number(searchParams.get("level"));
  const expiryStatus = searchParams.get("expiryStatus");

  return {
    page: Number.isInteger(page) && page > 0 ? page : 1,
    pageSize: pageSize as AdminAuthOperationPageSize,
    sortBy: readSortBy(searchParams),
    sortOrder: searchParams.get("sortOrder") === "asc" ? "asc" : "desc",
    keyword: keyword.length === 0 ? null : keyword,
    status:
      status === "active" || status === "expired" || status === "cancelled"
        ? status
        : "all",
    edition: authorizationEditionValues.includes(
      edition as (typeof authorizationEditionValues)[number],
    )
      ? (edition as (typeof authorizationEditionValues)[number])
      : "all",
    profession: professionValues.includes(
      profession as (typeof professionValues)[number],
    )
      ? (profession as (typeof professionValues)[number])
      : "all",
    level: Number.isInteger(level) && level >= 1 && level <= 5 ? level : null,
    expiryStatus:
      expiryStatus === "expiring_soon" || expiryStatus === "not_expiring_soon"
        ? expiryStatus
        : "all",
  };
}

function readEmployeeListQuery(request: Request): EmployeeListQuery {
  const searchParams = new URL(request.url).searchParams;
  const page = Number(searchParams.get("page"));
  const pageSize = readPageSize(searchParams, [20, 50, 100], 20);
  const keyword = searchParams.get("keyword")?.trim() ?? "";
  const organizationKeyword =
    searchParams.get("organizationKeyword")?.trim() ?? "";
  const status = searchParams.get("status");

  return {
    page: Number.isInteger(page) && page > 0 ? page : 1,
    pageSize: pageSize as AdminAuthOperationPageSize,
    sortBy:
      searchParams.get("sortBy") === "updatedAt" ? "updatedAt" : "registeredAt",
    sortOrder: searchParams.get("sortOrder") === "asc" ? "asc" : "desc",
    keyword: keyword.length === 0 ? null : keyword,
    organizationKeyword:
      organizationKeyword.length === 0 ? null : organizationKeyword,
    status: status === "active" || status === "disabled" ? status : "all",
  };
}

function readPageSize(
  searchParams: URLSearchParams,
  options: readonly number[],
  fallback: number,
): number {
  const pageSize = Number(searchParams.get("pageSize"));

  return options.includes(pageSize) ? pageSize : fallback;
}

function readSortBy(
  searchParams: URLSearchParams,
): AdminAuthOperationSortField {
  const sortBy = searchParams.get("sortBy");

  return ADMIN_AUTH_OPERATION_SORT_FIELDS.includes(
    sortBy as AdminAuthOperationSortField,
  )
    ? (sortBy as AdminAuthOperationSortField)
    : "updatedAt";
}

function readStatus(
  searchParams: URLSearchParams,
): AdminAuthOperationListQuery["status"] {
  const status = searchParams.get("status");

  if (
    status === "active" ||
    status === "disabled" ||
    status === "expired" ||
    status === "cancelled" ||
    status === "unused" ||
    status === "used"
  ) {
    return status;
  }

  return "all";
}

function readUserType(
  searchParams: URLSearchParams,
): AdminAuthOperationListQuery["userType"] {
  const userType = searchParams.get("userType");

  return userType === "personal" || userType === "employee" ? userType : "all";
}

export function createAdminOrganizationOrgAuthRuntimeRouteHandlers(
  options: AdminOrganizationOrgAuthRuntimeOptions = {},
) {
  const repositories =
    options.repositories ??
    createPostgresAdminOrganizationOrgAuthRuntimeRepositories(options);
  const organizationMutationRepositories =
    repositories as OrganizationMutationRepositories;
  const employeeImportCommandService =
    options.employeeImportCommandService ??
    createEmployeeImportCommandService(
      createPostgresEmployeeImportCommandRepository(options),
    );
  const sessionService = options.sessionService ?? createLocalSessionRuntime();

  async function requireReadableAdminActor(
    request: Request,
  ): Promise<ApiResponse<null> | null> {
    const actor = await resolveAdminActor(request, sessionService);

    if (actor === null) {
      return adminSessionRequiredResponse;
    }

    void actor.publicId;

    return canReadEnterpriseAuth(actor) ? null : adminPermissionDeniedResponse;
  }

  async function appendEmployeeAuditLog(input: {
    request: Request;
    actor: AdminOrganizationOrgAuthActor;
    actionType: "employee.disable" | "employee.transfer" | "employee.unbind";
    targetPublicId: string | null;
    resultStatus: "success" | "failed";
    metadataSummary: string;
  }): Promise<void> {
    await repositories.auditLogRepository?.appendAuditLog({
      actorPublicId: input.actor.publicId,
      actorRole: input.actor.roles[0],
      actionType: input.actionType,
      targetResourceType: "employee",
      targetPublicId: input.targetPublicId,
      resultStatus: input.resultStatus,
      metadataSummary: input.metadataSummary,
      requestIp: readRequestIp(input.request),
    });
  }

  async function appendOrgAuthAuditLog(input: {
    request: Request;
    actor: AdminOrganizationOrgAuthActor;
    actionType:
      | "org_auth.cancel"
      | "org_auth.create"
      | "org_auth.expand_quota"
      | "org_auth.manual_upgrade"
      | "org_auth.renew"
      | "org_auth.replace";
    targetPublicId: string | null;
    resultStatus: "success" | "failed";
    metadataSummary: string;
  }): Promise<void> {
    await repositories.auditLogRepository?.appendAuditLog({
      actorPublicId: input.actor.publicId,
      actorRole: canManageOrgAuth(input.actor)
        ? readOrgAuthManagerRole(input.actor)
        : input.actor.roles[0],
      actionType: input.actionType,
      targetResourceType: "org_auth",
      targetPublicId: input.targetPublicId,
      resultStatus: input.resultStatus,
      metadataSummary: input.metadataSummary,
      requestIp: readRequestIp(input.request),
    });
  }

  async function appendOrganizationAuditLog(input: {
    request: Request;
    actor: AdminOrganizationOrgAuthActor;
    actionType:
      | "organization.create"
      | "organization.update"
      | "organization.move"
      | "organization.disable"
      | "organization.enable";
    targetPublicId: string | null;
    resultStatus: "success" | "failed";
    metadataSummary: string;
  }): Promise<void> {
    await repositories.auditLogRepository?.appendAuditLog({
      actorPublicId: input.actor.publicId,
      actorRole: input.actor.roles[0],
      actionType: input.actionType,
      targetResourceType: "organization",
      targetPublicId: input.targetPublicId,
      resultStatus: input.resultStatus,
      metadataSummary: input.metadataSummary,
      requestIp: readRequestIp(input.request),
    });
  }

  async function requireOrganizationManager(
    request: Request,
    actionType:
      | "organization.create"
      | "organization.update"
      | "organization.move"
      | "organization.disable"
      | "organization.enable",
    targetPublicId: string | null,
  ): Promise<AdminOrganizationOrgAuthActor | ApiResponse<null>> {
    const actor = await resolveAdminActor(request, sessionService);

    if (actor === null) {
      return adminSessionRequiredResponse;
    }

    if (
      !canManageOrganization(actor) ||
      (actionType === "organization.move" && !canMoveOrganization(actor))
    ) {
      await appendOrganizationAuditLog({
        request,
        actor,
        actionType,
        targetPublicId,
        resultStatus: "failed",
        metadataSummary: "redacted organization permission denial metadata",
      });

      return adminPermissionDeniedResponse;
    }

    return actor;
  }

  async function requireOrgAuthManager(
    request: Request,
    actionType:
      | "org_auth.cancel"
      | "org_auth.create"
      | "org_auth.expand_quota"
      | "org_auth.manual_upgrade"
      | "org_auth.renew"
      | "org_auth.replace",
    targetPublicId: string | null,
  ): Promise<AdminOrganizationOrgAuthActor | ApiResponse<null>> {
    const actor = await resolveAdminActor(request, sessionService);

    if (actor === null) {
      return adminSessionRequiredResponse;
    }

    if (!canManageOrgAuth(actor)) {
      await appendOrgAuthAuditLog({
        request,
        actor,
        actionType,
        targetPublicId,
        resultStatus: "failed",
        metadataSummary: "redacted org_auth permission denial metadata",
      });

      return adminPermissionDeniedResponse;
    }

    return actor;
  }

  async function requireEmployeeManager(
    request: Request,
    actionType: "employee.disable" | "employee.transfer" | "employee.unbind",
    targetPublicId: string | null,
  ): Promise<AdminOrganizationOrgAuthActor | ApiResponse<null>> {
    const actor = await resolveAdminActor(request, sessionService);

    if (actor === null) {
      return adminSessionRequiredResponse;
    }

    if (!canManageEmployee(actor)) {
      await appendEmployeeAuditLog({
        request,
        actor,
        actionType,
        targetPublicId,
        resultStatus: "failed",
        metadataSummary: "redacted employee permission denial metadata",
      });

      return adminPermissionDeniedResponse;
    }

    return actor;
  }

  async function createOrgAuthClosureResponse(input: {
    actionType:
      | "org_auth.expand_quota"
      | "org_auth.manual_upgrade"
      | "org_auth.renew"
      | "org_auth.replace";
    actor: AdminOrganizationOrgAuthActor;
    publicId: string;
    request: Request;
    result: OrgAuthClosureMutationResult;
  }): Promise<Response> {
    if (input.result.status === "success") {
      return createJsonResponse(
        createSuccessResponse<OrgAuthClosureActionResultDto>(input.result.data),
      );
    }

    await appendOrgAuthAuditLog({
      request: input.request,
      actor: input.actor,
      actionType: input.actionType,
      targetPublicId: input.publicId,
      resultStatus: "failed",
      metadataSummary: "redacted org_auth closure conflict metadata",
    });

    return createJsonResponse(
      input.result.status === "not_found"
        ? orgAuthNotFoundResponse
        : orgAuthClosureConflictResponse,
    );
  }

  async function appendOrgAuthClosureInvalidInputAudit(input: {
    actionType:
      | "org_auth.expand_quota"
      | "org_auth.manual_upgrade"
      | "org_auth.renew"
      | "org_auth.replace";
    actor: AdminOrganizationOrgAuthActor;
    publicId: string;
    request: Request;
  }): Promise<void> {
    await appendOrgAuthAuditLog({
      ...input,
      targetPublicId: input.publicId,
      resultStatus: "failed",
      metadataSummary: "redacted org_auth invalid input metadata",
    });
  }

  async function appendOrgAuthClosureUnavailableAudit(input: {
    actionType:
      | "org_auth.expand_quota"
      | "org_auth.manual_upgrade"
      | "org_auth.renew"
      | "org_auth.replace";
    actor: AdminOrganizationOrgAuthActor;
    publicId: string;
    request: Request;
  }): Promise<void> {
    await appendOrgAuthAuditLog({
      ...input,
      targetPublicId: input.publicId,
      resultStatus: "failed",
      metadataSummary: "redacted org_auth closure unavailable metadata",
    });
  }

  async function requireEmployeeImportCommandActor(
    request: Request,
  ): Promise<EmployeeImportCommandActor | ApiResponse<null>> {
    const actor = await resolveAdminActor(request, sessionService);
    if (actor === null) {
      return adminSessionRequiredResponse;
    }

    const role = actor.roles.find(
      (actorRole): actorRole is EmployeeImportCommandActor["role"] =>
        actorRole === "ops_admin" || actorRole === "super_admin",
    );
    if (role === undefined) {
      return adminPermissionDeniedResponse;
    }

    return {
      publicId: actor.publicId,
      requestIp: readRequestIp(request),
      role,
    };
  }

  async function submitEmployeeImportCommand(
    request: Request,
    readBody: () => Promise<
      { success: true; body: unknown } | { success: false }
    >,
  ): Promise<Response> {
    try {
      const actorOrError = await requireEmployeeImportCommandActor(request);
      if ("code" in actorOrError) {
        return createNoStoreJsonResponse({
          httpStatus: actorOrError.code === 401001 ? 401 : 403,
          response: actorOrError,
        });
      }

      const bodyResult = await readBody();
      if (!bodyResult.success) {
        return createNoStoreJsonResponse({
          httpStatus: 422,
          response: employeeInputInvalidResponse,
        });
      }

      return createNoStoreJsonResponse(
        await employeeImportCommandService.submit({
          actor: actorOrError,
          body: bodyResult.body,
          idempotencyKey: request.headers.get("idempotency-key"),
        }),
      );
    } catch {
      return createNoStoreJsonResponse({
        httpStatus: 503,
        response: employeeImportCommandUnavailableResponse,
      });
    }
  }

  return createRouteHandlersWithErrorEnvelope({
    organizationTreeNodes: {
      collection: {
        async GET(request: Request): Promise<Response> {
          const authError = await requireReadableAdminActor(request);

          if (authError !== null) {
            return createJsonResponse(authError);
          }

          if (repositories.listOrganizationTreeNodes === undefined) {
            return createJsonResponse(organizationTreeUnavailableResponse);
          }

          const result = await repositories.listOrganizationTreeNodes(
            readOrganizationTreeQuery(request),
          );

          return createJsonResponse(
            createPaginatedResponse({ nodes: result.nodes }, result.pagination),
          );
        },
      },
    },
    organizations: {
      collection: {
        async GET(request: Request): Promise<Response> {
          const authError = await requireReadableAdminActor(request);

          if (authError !== null) {
            return createJsonResponse(authError);
          }

          const result = await repositories.listOrganizations(
            readAdminAuthOperationListQuery(request),
          );

          return createJsonResponse(
            createPaginatedResponse(
              { organizations: result.organizations },
              result.pagination,
            ),
          );
        },
        async POST(request: Request): Promise<Response> {
          const actorOrError = await requireOrganizationManager(
            request,
            "organization.create",
            null,
          );

          if ("code" in actorOrError) {
            return createJsonResponse(actorOrError);
          }

          if (
            organizationMutationRepositories.createOrganization === undefined
          ) {
            await appendOrganizationAuditLog({
              request,
              actor: actorOrError,
              actionType: "organization.create",
              targetPublicId: null,
              resultStatus: "failed",
              metadataSummary:
                "redacted organization create unavailable metadata",
            });

            return createJsonResponse(organizationMutationUnavailableResponse);
          }

          const organizationInput = normalizeCreateOrganizationInput(
            await readRequestJson(request),
          );

          if (!organizationInput.success) {
            await appendOrganizationAuditLog({
              request,
              actor: actorOrError,
              actionType: "organization.create",
              targetPublicId: null,
              resultStatus: "failed",
              metadataSummary: "redacted organization invalid input metadata",
            });

            return createJsonResponse(organizationInputInvalidResponse);
          }

          const organization =
            await organizationMutationRepositories.createOrganization(
              organizationInput.value,
            );

          await appendOrganizationAuditLog({
            request,
            actor: actorOrError,
            actionType: "organization.create",
            targetPublicId: organization?.publicId ?? null,
            resultStatus: organization === null ? "failed" : "success",
            metadataSummary: "redacted organization create metadata",
          });

          return createJsonResponse(
            organization === null
              ? organizationTreeConflictResponse
              : createSuccessResponse<OrganizationResultDto>({
                  organization,
                }),
          );
        },
      },
      item: {
        async PATCH(
          request: Request,
          context: RouteContext,
        ): Promise<Response> {
          const { publicId } = await context.params;
          const actorOrError = await requireOrganizationManager(
            request,
            "organization.update",
            publicId,
          );

          if ("code" in actorOrError) {
            return createJsonResponse(actorOrError);
          }

          if (
            organizationMutationRepositories.updateOrganization === undefined
          ) {
            await appendOrganizationAuditLog({
              request,
              actor: actorOrError,
              actionType: "organization.update",
              targetPublicId: publicId,
              resultStatus: "failed",
              metadataSummary:
                "redacted organization update unavailable metadata",
            });

            return createJsonResponse(organizationMutationUnavailableResponse);
          }

          const organizationInput = normalizeUpdateOrganizationInput(
            await readRequestJson(request),
          );

          if (!organizationInput.success) {
            await appendOrganizationAuditLog({
              request,
              actor: actorOrError,
              actionType: "organization.update",
              targetPublicId: publicId,
              resultStatus: "failed",
              metadataSummary: "redacted organization invalid input metadata",
            });

            return createJsonResponse(organizationInputInvalidResponse);
          }

          const organization =
            await organizationMutationRepositories.updateOrganization(
              publicId,
              organizationInput.value,
            );

          await appendOrganizationAuditLog({
            request,
            actor: actorOrError,
            actionType: "organization.update",
            targetPublicId: publicId,
            resultStatus: organization === null ? "failed" : "success",
            metadataSummary: "redacted organization update metadata",
          });

          return createJsonResponse(
            organization === null
              ? organizationTreeConflictResponse
              : createSuccessResponse<OrganizationResultDto>({
                  organization,
                }),
          );
        },
      },
      move: {
        async POST(request: Request, context: RouteContext): Promise<Response> {
          const { publicId } = await context.params;
          const actorOrError = await requireOrganizationManager(
            request,
            "organization.move",
            publicId,
          );

          if ("code" in actorOrError) {
            return createJsonResponse(actorOrError);
          }

          if (organizationMutationRepositories.moveOrganization === undefined) {
            await appendOrganizationAuditLog({
              request,
              actor: actorOrError,
              actionType: "organization.move",
              targetPublicId: publicId,
              resultStatus: "failed",
              metadataSummary:
                "redacted organization move unavailable metadata",
            });

            return createJsonResponse(organizationMutationUnavailableResponse);
          }

          const moveInput = normalizeMoveOrganizationInput(
            await readRequestJson(request),
          );

          if (!moveInput.success) {
            return createJsonResponse(organizationInputInvalidResponse);
          }

          const organization =
            await organizationMutationRepositories.moveOrganization({
              ...moveInput.value,
              publicId,
            });

          await appendOrganizationAuditLog({
            request,
            actor: actorOrError,
            actionType: "organization.move",
            targetPublicId: publicId,
            resultStatus: organization === null ? "failed" : "success",
            metadataSummary: "redacted organization move metadata",
          });

          return createJsonResponse(
            organization === null
              ? organizationTreeConflictResponse
              : createSuccessResponse<OrganizationResultDto>({ organization }),
          );
        },
      },
      disable: {
        async POST(request: Request, context: RouteContext): Promise<Response> {
          const { publicId } = await context.params;
          const actorOrError = await requireOrganizationManager(
            request,
            "organization.disable",
            publicId,
          );

          if ("code" in actorOrError) {
            return createJsonResponse(actorOrError);
          }

          if (
            organizationMutationRepositories.disableOrganization === undefined
          ) {
            await appendOrganizationAuditLog({
              request,
              actor: actorOrError,
              actionType: "organization.disable",
              targetPublicId: publicId,
              resultStatus: "failed",
              metadataSummary:
                "redacted organization disable unavailable metadata",
            });

            return createJsonResponse(organizationMutationUnavailableResponse);
          }

          const disableInput = normalizeDisableOrganizationInput(
            await readRequestJson(request),
          );

          if (!disableInput.success) {
            await appendOrganizationAuditLog({
              request,
              actor: actorOrError,
              actionType: "organization.disable",
              targetPublicId: publicId,
              resultStatus: "failed",
              metadataSummary: "redacted organization invalid input metadata",
            });

            return createJsonResponse(organizationInputInvalidResponse);
          }

          const repositoryResult =
            await organizationMutationRepositories.disableOrganization(
              {
                expectedRevision: disableInput.value.expectedRevision,
                publicId,
                isCascade: disableInput.value.isCascade,
              },
              {
                publicId: actorOrError.publicId,
                requestIp: readRequestIp(request),
                role: actorOrError.roles[0],
              },
            );

          if (repositoryResult === null) {
            await appendOrganizationAuditLog({
              request,
              actor: actorOrError,
              actionType: "organization.disable",
              targetPublicId: publicId,
              resultStatus: "failed",
              metadataSummary: "redacted organization disable metadata",
            });
          }

          const commandResult =
            repositoryResult === null
              ? null
              : unwrapLifecycleCommandResult(repositoryResult);

          if (commandResult !== null && !commandResult.successAuditPersisted) {
            await appendOrganizationAuditLog({
              request,
              actor: actorOrError,
              actionType: "organization.disable",
              targetPublicId: publicId,
              resultStatus: "success",
              metadataSummary: formatOrganizationDisableMetadata(
                commandResult.data,
              ),
            });
          }

          return createJsonResponse(
            commandResult === null
              ? organizationTreeConflictResponse
              : createSuccessResponse<DisableOrganizationResultDto>(
                  commandResult.data,
                ),
          );
        },
      },
      enable: {
        async POST(request: Request, context: RouteContext): Promise<Response> {
          const { publicId } = await context.params;
          const actorOrError = await requireOrganizationManager(
            request,
            "organization.enable",
            publicId,
          );

          if ("code" in actorOrError) {
            return createJsonResponse(actorOrError);
          }

          if (
            organizationMutationRepositories.enableOrganization === undefined
          ) {
            await appendOrganizationAuditLog({
              request,
              actor: actorOrError,
              actionType: "organization.enable",
              targetPublicId: publicId,
              resultStatus: "failed",
              metadataSummary:
                "redacted organization enable unavailable metadata",
            });

            return createJsonResponse(organizationMutationUnavailableResponse);
          }

          const enableInput = normalizeDisableOrganizationInput(
            await readRequestJson(request),
          );

          if (!enableInput.success) {
            return createJsonResponse(organizationInputInvalidResponse);
          }

          const organization =
            await organizationMutationRepositories.enableOrganization({
              ...enableInput.value,
              publicId,
            });

          await appendOrganizationAuditLog({
            request,
            actor: actorOrError,
            actionType: "organization.enable",
            targetPublicId: publicId,
            resultStatus: organization === null ? "failed" : "success",
            metadataSummary: "redacted organization enable metadata",
          });

          return createJsonResponse(
            organization === null
              ? organizationTreeConflictResponse
              : createSuccessResponse<OrganizationResultDto>({
                  organization,
                }),
          );
        },
      },
    },
    orgAuths: {
      collection: {
        async GET(request: Request): Promise<Response> {
          const authError = await requireReadableAdminActor(request);

          if (authError !== null) {
            return createJsonResponse(authError);
          }

          const result = await repositories.listOrgAuths(
            readOrgAuthListQuery(request),
          );

          return createJsonResponse(
            createPaginatedResponse(
              { orgAuths: result.orgAuths },
              result.pagination,
            ),
          );
        },
        async POST(request: Request): Promise<Response> {
          const actorOrError = await requireOrgAuthManager(
            request,
            "org_auth.create",
            null,
          );

          if ("code" in actorOrError) {
            return createJsonResponse(actorOrError);
          }

          if (
            repositories.hasOverlappingOrgAuth === undefined ||
            repositories.createOrgAuth === undefined
          ) {
            await appendOrgAuthAuditLog({
              request,
              actor: actorOrError,
              actionType: "org_auth.create",
              targetPublicId: null,
              resultStatus: "failed",
              metadataSummary: "redacted org_auth create unavailable metadata",
            });

            return createJsonResponse(orgAuthMutationUnavailableResponse);
          }

          const orgAuthPackageInput = normalizeCreateOrgAuthPackageInput(
            await readRequestJson(request),
          );

          if (!orgAuthPackageInput.success) {
            await appendOrgAuthAuditLog({
              request,
              actor: actorOrError,
              actionType: "org_auth.create",
              targetPublicId: null,
              resultStatus: "failed",
              metadataSummary: "redacted org_auth invalid input metadata",
            });

            return createJsonResponse(orgAuthInputInvalidResponse);
          }

          for (const orgAuthInput of orgAuthPackageInput.value.orgAuthInputs) {
            if (await repositories.hasOverlappingOrgAuth(orgAuthInput)) {
              await appendOrgAuthAuditLog({
                request,
                actor: actorOrError,
                actionType: "org_auth.create",
                targetPublicId: null,
                resultStatus: "failed",
                metadataSummary: "redacted org_auth overlap metadata",
              });

              return createJsonResponse(orgAuthScopeOverlapResponse);
            }
          }

          const orgAuths = [];

          for (const orgAuthInput of orgAuthPackageInput.value.orgAuthInputs) {
            const orgAuth = await repositories.createOrgAuth(orgAuthInput);

            if (orgAuth === null) {
              if (await repositories.hasOverlappingOrgAuth(orgAuthInput)) {
                await appendOrgAuthAuditLog({
                  request,
                  actor: actorOrError,
                  actionType: "org_auth.create",
                  targetPublicId: null,
                  resultStatus: "failed",
                  metadataSummary: "redacted org_auth overlap metadata",
                });

                return createJsonResponse(orgAuthScopeOverlapResponse);
              }

              await appendOrgAuthAuditLog({
                request,
                actor: actorOrError,
                actionType: "org_auth.create",
                targetPublicId: null,
                resultStatus: "failed",
                metadataSummary:
                  "redacted org_auth quota or organization metadata",
              });

              return createJsonResponse(orgAuthQuotaExceededResponse);
            }

            orgAuths.push(orgAuth);
          }

          await appendOrgAuthAuditLog({
            request,
            actor: actorOrError,
            actionType: "org_auth.create",
            targetPublicId: orgAuths[0]?.publicId ?? null,
            resultStatus: "success",
            metadataSummary: "redacted org_auth create metadata",
          });

          return createJsonResponse(
            createSuccessResponse<OrgAuthResultDto>({
              orgAuth: orgAuths[0],
              orgAuths,
            }),
          );
        },
      },
      item: {
        async GET(request: Request, context: RouteContext): Promise<Response> {
          const authError = await requireReadableAdminActor(request);

          if (authError !== null) {
            return createJsonResponse(authError);
          }

          if (repositories.getOrgAuthDetail === undefined) {
            return createJsonResponse(orgAuthMutationUnavailableResponse);
          }

          const { publicId } = await context.params;
          const orgAuth = await repositories.getOrgAuthDetail(publicId);

          return createJsonResponse(
            orgAuth === null
              ? orgAuthNotFoundResponse
              : createSuccessResponse<OrgAuthDetailResultDto>({ orgAuth }),
          );
        },
      },
      upgrade: {
        async POST(request: Request, context: RouteContext): Promise<Response> {
          const { publicId } = await context.params;
          const actorOrError = await requireOrgAuthManager(
            request,
            "org_auth.manual_upgrade",
            publicId,
          );

          if ("code" in actorOrError) {
            return createJsonResponse(actorOrError);
          }

          if (repositories.upgradeOrgAuth === undefined) {
            await appendOrgAuthClosureUnavailableAudit({
              actionType: "org_auth.manual_upgrade",
              actor: actorOrError,
              publicId,
              request,
            });
            return createJsonResponse(orgAuthMutationUnavailableResponse);
          }

          const normalizedInput = normalizeOrgAuthClosureMetadataInput(
            await readRequestJson(request),
          );

          if (!normalizedInput.success) {
            await appendOrgAuthClosureInvalidInputAudit({
              actionType: "org_auth.manual_upgrade",
              actor: actorOrError,
              publicId,
              request,
            });
            return createJsonResponse(orgAuthInputInvalidResponse);
          }

          const result = await repositories.upgradeOrgAuth({
            ...normalizedInput.value,
            operator: {
              publicId: actorOrError.publicId,
              requestIp: readRequestIp(request),
              role: readOrgAuthManagerRole(actorOrError),
            },
            publicId,
          });

          return createOrgAuthClosureResponse({
            actionType: "org_auth.manual_upgrade",
            actor: actorOrError,
            publicId,
            request,
            result,
          });
        },
      },
      renew: {
        async POST(request: Request, context: RouteContext): Promise<Response> {
          const { publicId } = await context.params;
          const actorOrError = await requireOrgAuthManager(
            request,
            "org_auth.renew",
            publicId,
          );

          if ("code" in actorOrError) {
            return createJsonResponse(actorOrError);
          }

          if (repositories.renewOrgAuth === undefined) {
            await appendOrgAuthClosureUnavailableAudit({
              actionType: "org_auth.renew",
              actor: actorOrError,
              publicId,
              request,
            });
            return createJsonResponse(orgAuthMutationUnavailableResponse);
          }

          const normalizedInput = normalizeOrgAuthRenewalInput(
            await readRequestJson(request),
          );

          if (!normalizedInput.success) {
            await appendOrgAuthClosureInvalidInputAudit({
              actionType: "org_auth.renew",
              actor: actorOrError,
              publicId,
              request,
            });
            return createJsonResponse(orgAuthInputInvalidResponse);
          }

          const result = await repositories.renewOrgAuth({
            ...normalizedInput.value,
            operator: {
              publicId: actorOrError.publicId,
              requestIp: readRequestIp(request),
              role: readOrgAuthManagerRole(actorOrError),
            },
            publicId,
          });

          return createOrgAuthClosureResponse({
            actionType: "org_auth.renew",
            actor: actorOrError,
            publicId,
            request,
            result,
          });
        },
      },
      replace: {
        async POST(request: Request, context: RouteContext): Promise<Response> {
          const { publicId } = await context.params;
          const actorOrError = await requireOrgAuthManager(
            request,
            "org_auth.replace",
            publicId,
          );

          if ("code" in actorOrError) {
            return createJsonResponse(actorOrError);
          }

          if (repositories.replaceOrgAuth === undefined) {
            await appendOrgAuthClosureUnavailableAudit({
              actionType: "org_auth.replace",
              actor: actorOrError,
              publicId,
              request,
            });
            return createJsonResponse(orgAuthMutationUnavailableResponse);
          }

          const normalizedInput = normalizeOrgAuthReplacementInput(
            await readRequestJson(request),
          );

          if (!normalizedInput.success) {
            await appendOrgAuthClosureInvalidInputAudit({
              actionType: "org_auth.replace",
              actor: actorOrError,
              publicId,
              request,
            });
            return createJsonResponse(orgAuthInputInvalidResponse);
          }

          const result = await repositories.replaceOrgAuth({
            ...normalizedInput.value,
            operator: {
              publicId: actorOrError.publicId,
              requestIp: readRequestIp(request),
              role: readOrgAuthManagerRole(actorOrError),
            },
            publicId,
          });

          return createOrgAuthClosureResponse({
            actionType: "org_auth.replace",
            actor: actorOrError,
            publicId,
            request,
            result,
          });
        },
      },
      expandQuota: {
        async POST(request: Request, context: RouteContext): Promise<Response> {
          const { publicId } = await context.params;
          const actorOrError = await requireOrgAuthManager(
            request,
            "org_auth.expand_quota",
            publicId,
          );

          if ("code" in actorOrError) {
            return createJsonResponse(actorOrError);
          }

          if (repositories.expandOrgAuthQuota === undefined) {
            await appendOrgAuthClosureUnavailableAudit({
              actionType: "org_auth.expand_quota",
              actor: actorOrError,
              publicId,
              request,
            });
            return createJsonResponse(orgAuthMutationUnavailableResponse);
          }

          const normalizedInput = normalizeOrgAuthQuotaExpansionInput(
            await readRequestJson(request),
          );

          if (!normalizedInput.success) {
            await appendOrgAuthClosureInvalidInputAudit({
              actionType: "org_auth.expand_quota",
              actor: actorOrError,
              publicId,
              request,
            });
            return createJsonResponse(orgAuthInputInvalidResponse);
          }

          const result = await repositories.expandOrgAuthQuota({
            ...normalizedInput.value,
            operator: {
              publicId: actorOrError.publicId,
              requestIp: readRequestIp(request),
              role: readOrgAuthManagerRole(actorOrError),
            },
            publicId,
          });

          return createOrgAuthClosureResponse({
            actionType: "org_auth.expand_quota",
            actor: actorOrError,
            publicId,
            request,
            result,
          });
        },
      },
      cancel: {
        async POST(request: Request, context: RouteContext): Promise<Response> {
          const { publicId } = await context.params;
          const actorOrError = await requireOrgAuthManager(
            request,
            "org_auth.cancel",
            publicId,
          );

          if ("code" in actorOrError) {
            return createJsonResponse(actorOrError);
          }

          if (repositories.cancelOrgAuth === undefined) {
            await appendOrgAuthAuditLog({
              request,
              actor: actorOrError,
              actionType: "org_auth.cancel",
              targetPublicId: publicId,
              resultStatus: "failed",
              metadataSummary: "redacted org_auth cancel unavailable metadata",
            });

            return createJsonResponse(orgAuthMutationUnavailableResponse);
          }

          const repositoryResult = await repositories.cancelOrgAuth(publicId, {
            publicId: actorOrError.publicId,
            requestIp: readRequestIp(request),
            role: actorOrError.roles[0],
          });

          if (repositoryResult === null) {
            await appendOrgAuthAuditLog({
              request,
              actor: actorOrError,
              actionType: "org_auth.cancel",
              targetPublicId: publicId,
              resultStatus: "failed",
              metadataSummary: "redacted org_auth missing metadata",
            });

            return createJsonResponse(orgAuthNotFoundResponse);
          }

          const commandResult = unwrapLifecycleCommandResult(repositoryResult);

          if (!commandResult.successAuditPersisted) {
            await appendOrgAuthAuditLog({
              request,
              actor: actorOrError,
              actionType: "org_auth.cancel",
              targetPublicId: publicId,
              resultStatus: "success",
              metadataSummary: "redacted org_auth cancel metadata",
            });
          }

          const orgAuth = commandResult.data;

          return createJsonResponse(
            createSuccessResponse<OrgAuthResultDto>({
              orgAuth,
              orgAuths: [orgAuth],
            }),
          );
        },
      },
    },
    employees: {
      collection: {
        async GET(request: Request): Promise<Response> {
          const authError = await requireReadableAdminActor(request);

          if (authError !== null) {
            return createJsonResponse(authError);
          }

          const result = await repositories.listEmployees(
            readEmployeeListQuery(request),
          );

          return createJsonResponse(
            createPaginatedResponse(
              {
                employees: result.employees.map(maskEmployeeSummaryPhone),
              },
              result.pagination,
            ),
          );
        },
        async POST(request: Request): Promise<Response> {
          return submitEmployeeImportCommand(request, async () => {
            const requestBody = await readRequestJson(request);
            const employeeInput =
              typeof requestBody === "object" && requestBody !== null
                ? (requestBody as Record<string, unknown>)
                : {};

            return {
              success: true,
              body: {
                commandKind: "single_create",
                expectedPreviewRevision: employeeInput.expectedPreviewRevision,
                initialPassword: employeeInput.initialPassword,
                name: employeeInput.name,
                organizationPublicId: employeeInput.organizationPublicId,
                phone: employeeInput.phone,
              },
            };
          });
        },
      },
      importBatch: {
        async POST(request: Request): Promise<Response> {
          return submitEmployeeImportCommand(request, async () => {
            const requestBody = await readRequestJson(request);
            const employeeImportInput =
              typeof requestBody === "object" && requestBody !== null
                ? (requestBody as Record<string, unknown>)
                : {};

            return {
              success: true,
              body: {
                commandKind: "batch_import",
                content: employeeImportInput.content,
                expectedPreviewRevision:
                  employeeImportInput.expectedPreviewRevision,
                organizationPublicId:
                  employeeImportInput.targetOrganizationPublicId,
                sourceFormat: employeeImportInput.sourceFormat,
              },
            };
          });
        },
      },
      organizationUnbind: {
        async POST(
          request: Request,
          context: OrganizationEmployeeRouteContext,
        ): Promise<Response> {
          const { employeePublicId, publicId: organizationPublicId } =
            await context.params;
          const actorOrError = await requireEmployeeManager(
            request,
            "employee.unbind",
            employeePublicId,
          );

          if ("code" in actorOrError) {
            return createJsonResponse(actorOrError);
          }

          if (repositories.unbindEmployee === undefined) {
            await appendEmployeeAuditLog({
              request,
              actor: actorOrError,
              actionType: "employee.unbind",
              targetPublicId: employeePublicId,
              resultStatus: "failed",
              metadataSummary: "redacted employee unbind unavailable metadata",
            });

            return createJsonResponse(employeeMutationUnavailableResponse);
          }

          const result = await repositories.unbindEmployee({
            employeePublicId,
            organizationPublicId,
          });

          await appendEmployeeAuditLog({
            request,
            actor: actorOrError,
            actionType: "employee.unbind",
            targetPublicId: employeePublicId,
            resultStatus: result === null ? "failed" : "success",
            metadataSummary: "redacted employee unbind metadata",
          });

          return createJsonResponse(
            result === null
              ? employeeNotFoundResponse
              : createSuccessResponse<EmployeeUnbindResultDto>(result),
          );
        },
      },
      disable: {
        async POST(request: Request, context: RouteContext): Promise<Response> {
          const { publicId } = await context.params;
          const actorOrError = await requireEmployeeManager(
            request,
            "employee.disable",
            publicId,
          );

          if ("code" in actorOrError) {
            return createJsonResponse(actorOrError);
          }

          if (repositories.disableEmployee === undefined) {
            await appendEmployeeAuditLog({
              request,
              actor: actorOrError,
              actionType: "employee.disable",
              targetPublicId: publicId,
              resultStatus: "failed",
              metadataSummary: "redacted employee disable unavailable metadata",
            });

            return createJsonResponse(employeeMutationUnavailableResponse);
          }

          const didDisable = await repositories.disableEmployee(publicId);

          await appendEmployeeAuditLog({
            request,
            actor: actorOrError,
            actionType: "employee.disable",
            targetPublicId: publicId,
            resultStatus: didDisable ? "success" : "failed",
            metadataSummary: "redacted employee disable metadata",
          });

          return createJsonResponse(
            didDisable ? createSuccessResponse(null) : employeeNotFoundResponse,
          );
        },
      },
      transfer: {
        async POST(request: Request, context: RouteContext): Promise<Response> {
          const { publicId } = await context.params;
          const actorOrError = await requireEmployeeManager(
            request,
            "employee.transfer",
            publicId,
          );

          if ("code" in actorOrError) {
            return createJsonResponse(actorOrError);
          }

          if (repositories.transferEmployee === undefined) {
            await appendEmployeeAuditLog({
              request,
              actor: actorOrError,
              actionType: "employee.transfer",
              targetPublicId: publicId,
              resultStatus: "failed",
              metadataSummary:
                "redacted employee transfer unavailable metadata",
            });

            return createJsonResponse(employeeMutationUnavailableResponse);
          }

          const normalizedInput = normalizeEmployeeTransferInput(
            await readRequestJson(request),
          );

          if (normalizedInput === null) {
            await appendEmployeeAuditLog({
              request,
              actor: actorOrError,
              actionType: "employee.transfer",
              targetPublicId: publicId,
              resultStatus: "failed",
              metadataSummary:
                "redacted employee transfer invalid input metadata",
            });

            return createJsonResponse(employeeInputInvalidResponse);
          }

          const result = await repositories.transferEmployee({
            employeePublicId: publicId,
            targetOrganizationPublicId:
              normalizedInput.targetOrganizationPublicId,
          });

          await appendEmployeeAuditLog({
            request,
            actor: actorOrError,
            actionType: "employee.transfer",
            targetPublicId: publicId,
            resultStatus:
              result !== null && result.status === "transferred"
                ? "success"
                : "failed",
            metadataSummary: "redacted employee transfer metadata",
          });

          if (result === null) {
            return createJsonResponse(employeeNotFoundResponse);
          }

          if (result.status === "transferred") {
            return createJsonResponse(
              createSuccessResponse<EmployeeTransferResultDto>(result),
            );
          }

          if (result.status === "target_organization_not_found") {
            return createJsonResponse(organizationNotFoundResponse);
          }

          if (result.status === "same_organization") {
            return createJsonResponse(employeeInputInvalidResponse);
          }

          if (result.status === "quota_insufficient") {
            return createJsonResponse(orgAuthQuotaExceededResponse);
          }

          return createJsonResponse(employeeInputInvalidResponse);
        },
      },
      unbind: {
        async POST(request: Request, context: RouteContext): Promise<Response> {
          const { publicId } = await context.params;
          const actorOrError = await requireEmployeeManager(
            request,
            "employee.unbind",
            publicId,
          );

          if ("code" in actorOrError) {
            return createJsonResponse(actorOrError);
          }

          if (repositories.unbindEmployee === undefined) {
            await appendEmployeeAuditLog({
              request,
              actor: actorOrError,
              actionType: "employee.unbind",
              targetPublicId: publicId,
              resultStatus: "failed",
              metadataSummary: "redacted employee unbind unavailable metadata",
            });

            return createJsonResponse(employeeMutationUnavailableResponse);
          }

          const result = await repositories.unbindEmployee(publicId);

          await appendEmployeeAuditLog({
            request,
            actor: actorOrError,
            actionType: "employee.unbind",
            targetPublicId: publicId,
            resultStatus: result === null ? "failed" : "success",
            metadataSummary: "redacted employee unbind metadata",
          });

          return createJsonResponse(
            result === null
              ? employeeNotFoundResponse
              : createSuccessResponse<EmployeeUnbindResultDto>(result),
          );
        },
      },
    },
  });
}
