import { randomBytes } from "node:crypto";

import { createLocalSessionRuntime } from "../auth/local-session-runtime";
import { getRequestAuthorization } from "../auth/session-cookie";
import {
  createErrorResponse,
  createPaginatedResponse,
  createSuccessResponse,
  type ApiResponse,
} from "../contracts/api-response";
import {
  ADMIN_AI_AUDIT_LOG_ERROR_CODES,
  createAdminAiAuditLogListQuery,
  type AdminAiAuditLogListQuery,
  type AdminAiAuditLogPageSize,
} from "../contracts/admin-ai-audit-log-ops-contract";
import {
  createAdminContentKnowledgeListQuery,
  type AdminContentKnowledgeListQuery,
  type AdminContentKnowledgePageSize,
} from "../contracts/admin-content-knowledge-ops-contract";
import {
  ADMIN_ACCOUNT_LIST_SORT_FIELDS,
  ADMIN_AUTH_OPERATION_SORT_FIELDS,
  type AdminAccountCreationRole,
  type AdminAccountCreationConflictDto,
  type AdminAccountCreationResultDto,
  type AdminAccountDetailDto,
  type AdminAccountListItemDto,
  type AdminAccountListQuery,
  type AdminAccountListSortField,
  type AdminAccountMutationConflictDto,
  type AdminAccountMutationResultDto,
  type AdminAccountPasswordResetResultDto,
  type AdminUserDetailDto,
  type AdminUserPasswordResetResultDto,
  type AdminUserSummaryDto,
  type OrganizationAdminAccountCreationRole,
  ADMIN_AUTH_OPERATION_ERROR_CODES,
  createAdminAccountListQuery,
  createAdminAuthOperationListQuery,
  type AdminAuthOperationListQuery,
  type AdminAuthOperationPageSize,
  type AdminAuthOperationSortField,
  type UserPhoneRevealDto,
} from "../contracts/admin-user-org-auth-ops-contract";
import { maskPhoneForDisplay } from "../mappers/phone-display-mapper";
import { adminRoleValues, type AdminRole } from "../models/auth";
import { knStatusValues, resourceStatusValues } from "../models/ai-rag";
import {
  paperStatusValues,
  paperTypeValues,
  professionValues,
  questionStatusValues,
  subjectValues,
} from "../models/paper";
import {
  createPostgresAdminFlowRuntimeRepositories,
  type AdminFlowRuntimeRepositories,
  type AdminAccountMutationRepositoryResult,
  type AdminFlowRuntimeRepositoryOptions,
  type UserLifecycleMutationRepositoryResult,
} from "../repositories/admin-flow-runtime-repository";
import { normalizeAdminAccountCreationInput } from "../validators/admin-account-creation";
import { normalizeAdminAccountUpdateInput } from "../validators/admin-account-lifecycle";
import type { SessionService } from "./session-service";
import { createRouteHandlersWithErrorEnvelope } from "./route-error-response";

export type { AdminFlowRuntimeRepositories };

export type AdminFlowRuntimeOptions = AdminFlowRuntimeRepositoryOptions & {
  createOneTimePassword?: () => string;
  repositories?: AdminFlowRuntimeRepositories;
  sessionService?: Pick<SessionService, "getCurrentSession">;
};

type AdminFlowRole = AdminRole;

type AdminFlowActor = {
  publicId: string;
  roles: [AdminFlowRole, ...AdminFlowRole[]];
};

const adminSessionRequiredResponse = createErrorResponse(
  401001,
  "Admin session is required.",
);
const adminPermissionDeniedResponse = createErrorResponse(
  ADMIN_AI_AUDIT_LOG_ERROR_CODES.adminPermissionDenied,
  "Admin permission denied.",
);
const adminUserPermissionDeniedResponse = createErrorResponse(
  ADMIN_AUTH_OPERATION_ERROR_CODES.adminPermissionDenied,
  "Admin permission denied.",
);
const userNotFoundResponse = createErrorResponse(
  ADMIN_AUTH_OPERATION_ERROR_CODES.resourceNotFound,
  "User does not exist.",
);
const userPasswordResetUnavailableResponse = createErrorResponse(
  503601,
  "Admin user password reset runtime is not configured.",
);
const userLifecycleMutationUnavailableResponse = createErrorResponse(
  503602,
  "Admin user lifecycle runtime is not configured.",
);
const userLifecycleQuotaInsufficientResponse = createErrorResponse(
  409006,
  "Organization authorization quota is insufficient.",
);
const userDetailUnavailableResponse = createErrorResponse(
  503603,
  "Admin user detail runtime is not configured.",
);
const adminAccountCreationUnavailableResponse = createErrorResponse(
  503604,
  "Admin account creation runtime is not configured.",
);
const adminAccountListUnavailableResponse = createErrorResponse(
  503605,
  "Admin account list runtime is not configured.",
);
const adminAccountDetailUnavailableResponse = createErrorResponse(
  503607,
  "Admin account detail runtime is not configured.",
);
const adminAccountMutationUnavailableResponse = createErrorResponse(
  503608,
  "Admin account lifecycle runtime is not configured.",
);
const adminAccountNotFoundResponse = createErrorResponse(
  ADMIN_AUTH_OPERATION_ERROR_CODES.resourceNotFound,
  "Admin account does not exist.",
);
const adminAccountUpdateValidationFailedResponse = createErrorResponse(
  ADMIN_AUTH_OPERATION_ERROR_CODES.validationFailed,
  "Invalid admin account update input.",
);
const adminAccountCreationValidationFailedResponse = createErrorResponse(
  ADMIN_AUTH_OPERATION_ERROR_CODES.validationFailed,
  "Invalid admin account creation input.",
);
const organizationNotFoundResponse = createErrorResponse(
  ADMIN_AUTH_OPERATION_ERROR_CODES.resourceNotFound,
  "Organization does not exist.",
);
const userPhoneDisclosureUnavailableResponse = createErrorResponse(
  503606,
  "User phone disclosure runtime is not configured.",
);
const userPhoneDisclosureValidationFailedResponse = createErrorResponse(
  ADMIN_AUTH_OPERATION_ERROR_CODES.validationFailed,
  "User identifier is invalid.",
);
const USER_PUBLIC_ID_PATTERN = /^[A-Za-z0-9][A-Za-z0-9_-]{0,127}$/u;
const NO_STORE_HEADERS = {
  "cache-control": "no-store",
} as const;

function createJsonResponse<TData>(
  response: ApiResponse<TData>,
  init?: ResponseInit,
): Response {
  return Response.json(response, init);
}

async function readJsonBody(request: Request): Promise<unknown> {
  try {
    return await request.json();
  } catch {
    return null;
  }
}

function isAdminFlowRole(role: string): role is AdminFlowRole {
  return (
    role === "super_admin" ||
    role === "ops_admin" ||
    role === "content_admin" ||
    role === "org_standard_admin" ||
    role === "org_advanced_admin"
  );
}

function getAdminFlowAuthorization(request: Request): string | null {
  return getRequestAuthorization(request);
}

async function resolveAdminActor(
  request: Request,
  sessionService: Pick<SessionService, "getCurrentSession">,
): Promise<AdminFlowActor | null> {
  const sessionResponse = await sessionService.getCurrentSession({
    authorization: getAdminFlowAuthorization(request),
  });

  if (sessionResponse.code !== 0 || sessionResponse.data === null) {
    return null;
  }

  const adminPublicId = sessionResponse.data.user.adminPublicId ?? null;
  const adminRoles = (sessionResponse.data.user.adminRoles ?? []).filter(
    isAdminFlowRole,
  );

  if (adminPublicId === null || adminRoles.length === 0) {
    return null;
  }

  return {
    publicId: adminPublicId,
    roles: adminRoles as [AdminFlowRole, ...AdminFlowRole[]],
  };
}

function canReadAuditLogs(actor: AdminFlowActor): boolean {
  return (
    actor.roles.includes("super_admin") || actor.roles.includes("ops_admin")
  );
}

function canResetUserPassword(actor: AdminFlowActor): boolean {
  return (
    actor.roles.includes("super_admin") || actor.roles.includes("ops_admin")
  );
}

function canManageUserLifecycle(actor: AdminFlowActor): boolean {
  return (
    actor.roles.includes("super_admin") || actor.roles.includes("ops_admin")
  );
}

function canReadUserManagement(actor: AdminFlowActor): boolean {
  return (
    actor.roles.includes("super_admin") || actor.roles.includes("ops_admin")
  );
}

function canDiscloseUserPhone(actor: AdminFlowActor): boolean {
  return canReadUserManagement(actor);
}

async function readUserPublicId(context: {
  params: Promise<{ publicId: string }>;
}): Promise<string | null> {
  const { publicId } = await context.params;
  const normalizedPublicId = publicId.trim();

  return USER_PUBLIC_ID_PATTERN.test(normalizedPublicId)
    ? normalizedPublicId
    : null;
}

function maskAdminUserSummaryPhone(
  user: AdminUserSummaryDto,
): AdminUserSummaryDto {
  return {
    ...user,
    phone: maskPhoneForDisplay(user.phone),
  };
}

function maskAdminUserDetailPhone(
  detail: AdminUserDetailDto,
): AdminUserDetailDto {
  return {
    ...detail,
    user: maskAdminUserSummaryPhone(detail.user),
  };
}

function maskAdminAccountPhone(
  account: AdminAccountListItemDto,
): AdminAccountListItemDto {
  return {
    ...account,
    phone: maskPhoneForDisplay(account.phone),
  };
}

function maskAdminAccountDetailPhone(
  detail: AdminAccountDetailDto,
): AdminAccountDetailDto {
  return {
    adminAccount: maskAdminAccountPhone(detail.adminAccount),
  };
}

function canReadContentKnowledge(actor: AdminFlowActor): boolean {
  return (
    actor.roles.includes("super_admin") || actor.roles.includes("content_admin")
  );
}

function isOrganizationAdminAccountCreationRole(
  role: AdminAccountCreationRole,
): role is OrganizationAdminAccountCreationRole {
  return role === "org_standard_admin" || role === "org_advanced_admin";
}

function canCreateAdminAccount(
  actor: AdminFlowActor,
  targetRole: AdminAccountCreationRole,
): boolean {
  if (actor.roles.includes("super_admin")) {
    return true;
  }

  return (
    actor.roles.includes("ops_admin") &&
    isOrganizationAdminAccountCreationRole(targetRole)
  );
}

function canManageAdminAccount(actor: AdminFlowActor): boolean {
  return (
    actor.roles.includes("super_admin") || actor.roles.includes("ops_admin")
  );
}

const operationsVisibleAdminRoles = [
  "org_standard_admin",
  "org_advanced_admin",
] as const satisfies readonly AdminRole[];

function getVisibleAdminAccountRoles(
  actor: AdminFlowActor,
): readonly AdminRole[] {
  return actor.roles.includes("super_admin")
    ? adminRoleValues
    : operationsVisibleAdminRoles;
}

function readRequestIp(request: Request): string | null {
  const forwardedFor = request.headers.get("x-forwarded-for");

  if (forwardedFor !== null) {
    return forwardedFor.split(",")[0]?.trim() || null;
  }

  return request.headers.get("x-real-ip");
}

function readAdminAuthOperationListQuery(
  request: Request,
): AdminAuthOperationListQuery {
  const searchParams = new URL(request.url).searchParams;
  const pageSize = readPageSize(searchParams, [20, 50, 100], 20);
  const page = Number(searchParams.get("page"));
  const sortOrder = searchParams.get("sortOrder") === "asc" ? "asc" : "desc";

  return createAdminAuthOperationListQuery({
    page: Number.isFinite(page) && page > 0 ? page : 1,
    pageSize: pageSize as AdminAuthOperationPageSize,
    sortBy: readAdminAuthOperationSortBy(searchParams),
    sortOrder,
    keyword: searchParams.get("keyword"),
    status: readAdminAuthOperationStatus(searchParams),
    userType: readAdminAuthOperationUserType(searchParams),
  });
}

function readAdminAccountListQuery(request: Request): AdminAccountListQuery {
  const searchParams = new URL(request.url).searchParams;
  const pageSize = readPageSize(searchParams, [20, 50, 100], 20);
  const page = Number(searchParams.get("page"));
  const sortBy = searchParams.get("sortBy");
  const adminRole = searchParams.get("adminRole");
  const status = searchParams.get("status");

  return createAdminAccountListQuery({
    page: Number.isFinite(page) && page > 0 ? page : 1,
    pageSize: pageSize as AdminAuthOperationPageSize,
    sortBy: ADMIN_ACCOUNT_LIST_SORT_FIELDS.includes(
      sortBy as AdminAccountListSortField,
    )
      ? (sortBy as AdminAccountListSortField)
      : "registeredAt",
    sortOrder: searchParams.get("sortOrder") === "asc" ? "asc" : "desc",
    keyword: searchParams.get("keyword"),
    adminRole: adminRoleValues.includes(adminRole as AdminRole)
      ? (adminRole as AdminRole)
      : "all",
    status: status === "active" || status === "disabled" ? status : "all",
    organizationPublicId: searchParams.get("organizationPublicId"),
  });
}

function readAdminAuthOperationSortBy(
  searchParams: URLSearchParams,
): AdminAuthOperationSortField {
  const sortBy = searchParams.get("sortBy");

  return ADMIN_AUTH_OPERATION_SORT_FIELDS.includes(
    sortBy as AdminAuthOperationSortField,
  )
    ? (sortBy as AdminAuthOperationSortField)
    : "updatedAt";
}

function readAdminAuthOperationStatus(
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

function readAdminAuthOperationUserType(
  searchParams: URLSearchParams,
): AdminAuthOperationListQuery["userType"] {
  const userType = searchParams.get("userType");

  return userType === "personal" || userType === "employee" ? userType : "all";
}

function readAdminContentKnowledgeListQuery(
  request: Request,
): AdminContentKnowledgeListQuery {
  const searchParams = new URL(request.url).searchParams;
  const pageSize = readPageSize(searchParams, [20, 50, 100], 20);
  const page = Number(searchParams.get("page"));
  const level = Number(searchParams.get("level"));
  const year = Number(searchParams.get("year"));
  const sortBy = searchParams.get("sortBy");
  const status = searchParams.get("status");
  const profession = searchParams.get("profession");
  const subject = searchParams.get("subject");
  const paperType = searchParams.get("paperType");
  const contentStatuses = [
    ...questionStatusValues,
    ...paperStatusValues,
    ...resourceStatusValues,
    ...knStatusValues,
  ] as const;

  return createAdminContentKnowledgeListQuery({
    page: Number.isFinite(page) && page > 0 ? page : 1,
    pageSize: pageSize as AdminContentKnowledgePageSize,
    keyword: searchParams.get("keyword"),
    level: Number.isFinite(level) && level > 0 ? level : null,
    sortBy:
      sortBy === "createdAt" ||
      sortBy === "publishedAt" ||
      sortBy === "sortOrder"
        ? sortBy
        : "updatedAt",
    sortOrder: searchParams.get("sortOrder") === "asc" ? "asc" : "desc",
    status: contentStatuses.includes(status as (typeof contentStatuses)[number])
      ? (status as (typeof contentStatuses)[number])
      : "all",
    profession: professionValues.includes(
      profession as (typeof professionValues)[number],
    )
      ? (profession as (typeof professionValues)[number])
      : "all",
    subject: subjectValues.includes(subject as (typeof subjectValues)[number])
      ? (subject as (typeof subjectValues)[number])
      : "all",
    paperType: paperTypeValues.includes(
      paperType as (typeof paperTypeValues)[number],
    )
      ? (paperType as (typeof paperTypeValues)[number])
      : "all",
    year: Number.isFinite(year) && year > 0 ? year : null,
  });
}

function readAdminAiAuditLogListQuery(
  request: Request,
): AdminAiAuditLogListQuery {
  const searchParams = new URL(request.url).searchParams;
  const pageSize = readPageSize(searchParams, [20, 50, 100], 20);
  const page = Number(searchParams.get("page"));
  const level = Number(searchParams.get("level"));
  const resultStatus = searchParams.get("resultStatus");

  return createAdminAiAuditLogListQuery({
    page: Number.isFinite(page) && page > 0 ? page : 1,
    pageSize: pageSize as AdminAiAuditLogPageSize,
    keyword: searchParams.get("keyword"),
    level: Number.isFinite(level) && level > 0 ? level : null,
    actionType: searchParams.get("actionType") ?? "all",
    targetResourceType: searchParams.get("targetResourceType") ?? "all",
    resultStatus:
      resultStatus === "success" || resultStatus === "failed"
        ? resultStatus
        : "all",
  });
}

function readPageSize(
  searchParams: URLSearchParams,
  options: readonly number[],
  fallback: number,
): number {
  const pageSize = Number(searchParams.get("pageSize"));

  return options.includes(pageSize) ? pageSize : fallback;
}

async function appendUserLifecycleAuditLog(input: {
  repositories: AdminFlowRuntimeRepositories;
  request: Request;
  actor: AdminFlowActor;
  actionType: "user.disable" | "user.enable";
  targetPublicId: string;
  resultStatus: "success" | "failed";
  metadataSummary: string;
}): Promise<void> {
  await input.repositories.auditLogRepository.appendAuditLog({
    actorPublicId: input.actor.publicId,
    actorRole: input.actor.roles[0],
    actionType: input.actionType,
    targetResourceType: "user",
    targetPublicId: input.targetPublicId,
    resultStatus: input.resultStatus,
    metadataSummary: input.metadataSummary,
    requestIp: readRequestIp(input.request),
  });
}

async function appendUserPhoneDisclosureAuditLog(input: {
  repositories: AdminFlowRuntimeRepositories;
  request: Request;
  actor: AdminFlowActor;
  actionType: "user.phone_reveal" | "user.phone_copy";
  targetPublicId: string | null;
  resultStatus: "success" | "failed";
  metadataSummary: string;
}): Promise<void> {
  await input.repositories.auditLogRepository.appendAuditLog({
    actorPublicId: input.actor.publicId,
    actorRole: input.actor.roles[0],
    actionType: input.actionType,
    targetResourceType: "user",
    targetPublicId: input.targetPublicId,
    resultStatus: input.resultStatus,
    metadataSummary: input.metadataSummary,
    requestIp: readRequestIp(input.request),
  });
}

async function appendAdminAccountCreationAuditLog(input: {
  repositories: AdminFlowRuntimeRepositories;
  request: Request;
  actor: AdminFlowActor;
  resultStatus: "success" | "failed";
  targetPublicId: string | null;
  metadataSummary: string;
}): Promise<void> {
  await input.repositories.auditLogRepository.appendAuditLog({
    actorPublicId: input.actor.publicId,
    actorRole: input.actor.roles[0],
    actionType: "admin_account.create",
    targetResourceType: "admin",
    targetPublicId: input.targetPublicId,
    resultStatus: input.resultStatus,
    metadataSummary: input.metadataSummary,
    requestIp: readRequestIp(input.request),
  });
}

async function appendAdminAccountLifecycleFailureAuditLog(input: {
  repositories: AdminFlowRuntimeRepositories;
  request: Request;
  actor: AdminFlowActor;
  actionType:
    | "admin_account.update"
    | "admin_account.disable"
    | "admin_account.enable"
    | "admin_account.reset_password";
  targetPublicId: string | null;
  metadataSummary: string;
}): Promise<void> {
  await input.repositories.auditLogRepository.appendAuditLog({
    actorPublicId: input.actor.publicId,
    actorRole: input.actor.roles[0],
    actionType: input.actionType,
    targetResourceType: "admin",
    targetPublicId: input.targetPublicId,
    resultStatus: "failed",
    metadataSummary: input.metadataSummary,
    requestIp: readRequestIp(input.request),
  });
}

function createAdminAccountMutationConflictResponse(
  reason: AdminAccountMutationConflictDto["reason"],
): ApiResponse<AdminAccountMutationConflictDto> {
  return {
    code: ADMIN_AUTH_OPERATION_ERROR_CODES.concurrentConflict,
    data: { reason },
    message:
      reason === "last_active_super_admin"
        ? "The last active super administrator must be preserved."
        : "Admin account was changed by another request.",
  };
}

function createDefaultOneTimePassword(): string {
  return `${randomBytes(12).toString("base64url")}A1`;
}

function createAdminAccountCreationConflictResponse(
  data: AdminAccountCreationConflictDto,
): ApiResponse<AdminAccountCreationConflictDto> {
  return {
    code: ADMIN_AUTH_OPERATION_ERROR_CODES.concurrentConflict,
    data,
    message: "Admin account phone already exists.",
  };
}

export function createAdminFlowRuntimeRouteHandlers(
  options: AdminFlowRuntimeOptions = {},
) {
  const repositories =
    options.repositories ?? createPostgresAdminFlowRuntimeRepositories(options);
  const sessionService = options.sessionService ?? createLocalSessionRuntime();
  const createOneTimePassword =
    options.createOneTimePassword ?? createDefaultOneTimePassword;

  async function requireAdminActor(request: Request) {
    return resolveAdminActor(request, sessionService);
  }

  async function createAdminAccount(request: Request): Promise<Response> {
    const actor = await requireAdminActor(request);

    if (actor === null) {
      return createJsonResponse(adminSessionRequiredResponse);
    }

    const createInput = normalizeAdminAccountCreationInput(
      await readJsonBody(request),
    );

    if (!createInput.success) {
      await appendAdminAccountCreationAuditLog({
        repositories,
        request,
        actor,
        resultStatus: "failed",
        targetPublicId: null,
        metadataSummary: "redacted admin account creation validation metadata",
      });

      return createJsonResponse(adminAccountCreationValidationFailedResponse);
    }

    if (!canCreateAdminAccount(actor, createInput.value.adminRole)) {
      await appendAdminAccountCreationAuditLog({
        repositories,
        request,
        actor,
        resultStatus: "failed",
        targetPublicId: null,
        metadataSummary:
          "redacted admin account creation permission denial metadata",
      });

      return createJsonResponse(adminUserPermissionDeniedResponse);
    }

    if (repositories.userOrgAuthRepository.createAdminAccount === undefined) {
      await appendAdminAccountCreationAuditLog({
        repositories,
        request,
        actor,
        resultStatus: "failed",
        targetPublicId: null,
        metadataSummary: "redacted admin account creation unavailable metadata",
      });

      return createJsonResponse(adminAccountCreationUnavailableResponse);
    }

    const result = await repositories.userOrgAuthRepository.createAdminAccount(
      createInput.value,
      {
        publicId: actor.publicId,
        roles: actor.roles,
        requestIp: readRequestIp(request),
      },
    );

    if (result.status === "conflict") {
      await appendAdminAccountCreationAuditLog({
        repositories,
        request,
        actor,
        resultStatus: "failed",
        targetPublicId: null,
        metadataSummary: "redacted admin account creation conflict metadata",
      });

      return createJsonResponse(
        createAdminAccountCreationConflictResponse({
          reason: result.reason,
        }),
      );
    }

    if (result.status === "not_found") {
      await appendAdminAccountCreationAuditLog({
        repositories,
        request,
        actor,
        resultStatus: "failed",
        targetPublicId: null,
        metadataSummary: "redacted admin account creation not found metadata",
      });

      return createJsonResponse(organizationNotFoundResponse);
    }

    return createJsonResponse(
      createSuccessResponse<AdminAccountCreationResultDto>({
        adminAccount: result.adminAccount,
      }),
    );
  }

  async function listAdminAccounts(request: Request): Promise<Response> {
    const actor = await requireAdminActor(request);

    if (actor === null) {
      return createJsonResponse(adminSessionRequiredResponse);
    }

    if (!canReadUserManagement(actor)) {
      return createJsonResponse(adminUserPermissionDeniedResponse);
    }

    if (repositories.userOrgAuthRepository.listAdminAccounts === undefined) {
      return createJsonResponse(adminAccountListUnavailableResponse);
    }

    const result = await repositories.userOrgAuthRepository.listAdminAccounts(
      readAdminAccountListQuery(request),
      getVisibleAdminAccountRoles(actor),
    );

    return createJsonResponse(
      createPaginatedResponse(
        { adminAccounts: result.adminAccounts.map(maskAdminAccountPhone) },
        result.pagination,
      ),
    );
  }

  async function getAdminAccountDetail(
    request: Request,
    context: { params: Promise<{ publicId: string }> },
  ): Promise<Response> {
    const actor = await requireAdminActor(request);
    const { publicId: rawPublicId } = await context.params;
    const publicId = rawPublicId.trim();

    if (actor === null) {
      return createJsonResponse(adminSessionRequiredResponse);
    }

    if (!canManageAdminAccount(actor)) {
      return createJsonResponse(adminUserPermissionDeniedResponse);
    }

    if (!USER_PUBLIC_ID_PATTERN.test(publicId)) {
      return createJsonResponse(adminAccountUpdateValidationFailedResponse);
    }

    if (
      repositories.userOrgAuthRepository.getAdminAccountDetail === undefined
    ) {
      return createJsonResponse(adminAccountDetailUnavailableResponse);
    }

    const detail =
      await repositories.userOrgAuthRepository.getAdminAccountDetail(
        publicId,
        getVisibleAdminAccountRoles(actor),
      );

    return createJsonResponse(
      detail === null
        ? adminAccountNotFoundResponse
        : createSuccessResponse(maskAdminAccountDetailPhone(detail)),
    );
  }

  async function createAdminAccountMutationResponse(input: {
    request: Request;
    actor: AdminFlowActor;
    actionType:
      | "admin_account.update"
      | "admin_account.disable"
      | "admin_account.enable"
      | "admin_account.reset_password";
    targetPublicId: string;
    result: AdminAccountMutationRepositoryResult;
    responseInit?: ResponseInit;
  }): Promise<Response> {
    if (input.result.status === "updated") {
      return createJsonResponse<AdminAccountMutationResultDto>(
        createSuccessResponse(
          maskAdminAccountDetailPhone({
            adminAccount: input.result.adminAccount,
          }),
        ),
        input.responseInit,
      );
    }

    await appendAdminAccountLifecycleFailureAuditLog({
      repositories,
      request: input.request,
      actor: input.actor,
      actionType: input.actionType,
      targetPublicId: input.targetPublicId,
      metadataSummary: `redacted ${input.actionType} ${input.result.status} metadata`,
    });

    if (input.result.status === "not_found") {
      return createJsonResponse(
        adminAccountNotFoundResponse,
        input.responseInit,
      );
    }

    if (input.result.status === "forbidden") {
      return createJsonResponse(
        adminUserPermissionDeniedResponse,
        input.responseInit,
      );
    }

    return createJsonResponse(
      createAdminAccountMutationConflictResponse(input.result.reason),
      input.responseInit,
    );
  }

  async function updateAdminAccount(
    request: Request,
    context: { params: Promise<{ publicId: string }> },
  ): Promise<Response> {
    const actor = await requireAdminActor(request);
    const { publicId: rawPublicId } = await context.params;
    const publicId = rawPublicId.trim();

    if (actor === null) {
      return createJsonResponse(adminSessionRequiredResponse);
    }

    if (!canManageAdminAccount(actor)) {
      await appendAdminAccountLifecycleFailureAuditLog({
        repositories,
        request,
        actor,
        actionType: "admin_account.update",
        targetPublicId: publicId || null,
        metadataSummary:
          "redacted admin account update permission denial metadata",
      });
      return createJsonResponse(adminUserPermissionDeniedResponse);
    }

    const updateInput = normalizeAdminAccountUpdateInput(
      await readJsonBody(request),
    );

    if (!USER_PUBLIC_ID_PATTERN.test(publicId) || !updateInput.success) {
      await appendAdminAccountLifecycleFailureAuditLog({
        repositories,
        request,
        actor,
        actionType: "admin_account.update",
        targetPublicId: publicId || null,
        metadataSummary: "redacted admin account update validation metadata",
      });
      return createJsonResponse(adminAccountUpdateValidationFailedResponse);
    }

    if (repositories.userOrgAuthRepository.updateAdminAccount === undefined) {
      await appendAdminAccountLifecycleFailureAuditLog({
        repositories,
        request,
        actor,
        actionType: "admin_account.update",
        targetPublicId: publicId,
        metadataSummary: "redacted admin account update unavailable metadata",
      });
      return createJsonResponse(adminAccountMutationUnavailableResponse);
    }

    return createAdminAccountMutationResponse({
      request,
      actor,
      actionType: "admin_account.update",
      targetPublicId: publicId,
      result: await repositories.userOrgAuthRepository.updateAdminAccount({
        actor: {
          publicId: actor.publicId,
          roles: actor.roles,
          requestIp: readRequestIp(request),
        },
        publicId,
        ...updateInput.value,
      }),
    });
  }

  async function setAdminAccountStatus(input: {
    request: Request;
    context: { params: Promise<{ publicId: string }> };
    status: "active" | "disabled";
  }): Promise<Response> {
    const actor = await requireAdminActor(input.request);
    const { publicId: rawPublicId } = await input.context.params;
    const publicId = rawPublicId.trim();
    const actionType =
      input.status === "disabled"
        ? "admin_account.disable"
        : "admin_account.enable";

    if (actor === null) {
      return createJsonResponse(adminSessionRequiredResponse);
    }

    if (!canManageAdminAccount(actor)) {
      await appendAdminAccountLifecycleFailureAuditLog({
        repositories,
        request: input.request,
        actor,
        actionType,
        targetPublicId: publicId || null,
        metadataSummary:
          "redacted admin account status permission denial metadata",
      });
      return createJsonResponse(adminUserPermissionDeniedResponse);
    }

    if (!USER_PUBLIC_ID_PATTERN.test(publicId)) {
      await appendAdminAccountLifecycleFailureAuditLog({
        repositories,
        request: input.request,
        actor,
        actionType,
        targetPublicId: publicId || null,
        metadataSummary: "redacted admin account status validation metadata",
      });
      return createJsonResponse(adminAccountUpdateValidationFailedResponse);
    }

    if (
      repositories.userOrgAuthRepository.setAdminAccountStatus === undefined
    ) {
      await appendAdminAccountLifecycleFailureAuditLog({
        repositories,
        request: input.request,
        actor,
        actionType,
        targetPublicId: publicId,
        metadataSummary: "redacted admin account status unavailable metadata",
      });
      return createJsonResponse(adminAccountMutationUnavailableResponse);
    }

    return createAdminAccountMutationResponse({
      request: input.request,
      actor,
      actionType,
      targetPublicId: publicId,
      result: await repositories.userOrgAuthRepository.setAdminAccountStatus({
        actor: {
          publicId: actor.publicId,
          roles: actor.roles,
          requestIp: readRequestIp(input.request),
        },
        publicId,
        status: input.status,
      }),
    });
  }

  async function resetAdminAccountPassword(
    request: Request,
    context: { params: Promise<{ publicId: string }> },
  ): Promise<Response> {
    const actor = await requireAdminActor(request);
    const { publicId: rawPublicId } = await context.params;
    const publicId = rawPublicId.trim();

    if (actor === null) {
      return createJsonResponse(adminSessionRequiredResponse, {
        headers: NO_STORE_HEADERS,
      });
    }

    if (!canManageAdminAccount(actor)) {
      await appendAdminAccountLifecycleFailureAuditLog({
        repositories,
        request,
        actor,
        actionType: "admin_account.reset_password",
        targetPublicId: publicId || null,
        metadataSummary:
          "redacted admin account credential reset permission denial metadata",
      });
      return createJsonResponse(adminUserPermissionDeniedResponse, {
        headers: NO_STORE_HEADERS,
      });
    }

    if (!USER_PUBLIC_ID_PATTERN.test(publicId)) {
      await appendAdminAccountLifecycleFailureAuditLog({
        repositories,
        request,
        actor,
        actionType: "admin_account.reset_password",
        targetPublicId: publicId || null,
        metadataSummary:
          "redacted admin account credential reset validation metadata",
      });
      return createJsonResponse(adminAccountUpdateValidationFailedResponse, {
        headers: NO_STORE_HEADERS,
      });
    }

    if (
      repositories.userOrgAuthRepository.resetAdminAccountPassword === undefined
    ) {
      await appendAdminAccountLifecycleFailureAuditLog({
        repositories,
        request,
        actor,
        actionType: "admin_account.reset_password",
        targetPublicId: publicId,
        metadataSummary:
          "redacted admin account credential reset unavailable metadata",
      });
      return createJsonResponse(adminAccountMutationUnavailableResponse, {
        headers: NO_STORE_HEADERS,
      });
    }

    const oneTimePasswordPlainText = createOneTimePassword();
    const result =
      await repositories.userOrgAuthRepository.resetAdminAccountPassword({
        actor: {
          publicId: actor.publicId,
          roles: actor.roles,
          requestIp: readRequestIp(request),
        },
        publicId,
        newPassword: oneTimePasswordPlainText,
      });

    if (result.status !== "updated") {
      return createAdminAccountMutationResponse({
        request,
        actor,
        actionType: "admin_account.reset_password",
        targetPublicId: publicId,
        result,
        responseInit: { headers: NO_STORE_HEADERS },
      });
    }

    return createJsonResponse<AdminAccountPasswordResetResultDto>(
      createSuccessResponse({
        adminAccountPublicId: publicId,
        oneTimePasswordPlainText,
        distributionWindow: {
          visibleOnce: true,
          sessionRevocation: "revoked_active_sessions",
          redactionNotice:
            "The one-time password is returned once and must not be logged.",
        },
      }),
      { headers: NO_STORE_HEADERS },
    );
  }

  async function updateUserLifecycle(input: {
    request: Request;
    context: { params: Promise<{ publicId: string }> };
    actionType: "user.disable" | "user.enable";
    mutate:
      | ((mutationInput: {
          operator: {
            publicId: string;
            requestIp: string | null;
            role: AdminRole;
          };
          publicId: string;
        }) => Promise<UserLifecycleMutationRepositoryResult>)
      | undefined;
    successMetadataSummary: string;
  }): Promise<Response> {
    const actor = await requireAdminActor(input.request);
    const { publicId } = await input.context.params;

    if (actor === null) {
      return createJsonResponse(adminSessionRequiredResponse);
    }

    if (!canManageUserLifecycle(actor)) {
      await appendUserLifecycleAuditLog({
        repositories,
        request: input.request,
        actor,
        actionType: input.actionType,
        targetPublicId: publicId,
        resultStatus: "failed",
        metadataSummary: "redacted user lifecycle permission denial metadata",
      });

      return createJsonResponse(adminUserPermissionDeniedResponse);
    }

    if (input.mutate === undefined) {
      await appendUserLifecycleAuditLog({
        repositories,
        request: input.request,
        actor,
        actionType: input.actionType,
        targetPublicId: publicId,
        resultStatus: "failed",
        metadataSummary: "redacted user lifecycle unavailable metadata",
      });

      return createJsonResponse(userLifecycleMutationUnavailableResponse);
    }

    const mutationResult = await input.mutate({
      operator: {
        publicId: actor.publicId,
        requestIp: readRequestIp(input.request),
        role: actor.roles[0],
      },
      publicId,
    });
    const didMutate =
      mutationResult === "updated" || mutationResult === "updated_with_audit";

    if (mutationResult !== "updated_with_audit") {
      await appendUserLifecycleAuditLog({
        repositories,
        request: input.request,
        actor,
        actionType: input.actionType,
        targetPublicId: publicId,
        resultStatus: didMutate ? "success" : "failed",
        metadataSummary:
          mutationResult === "quota_insufficient"
            ? "redacted user enable quota conflict metadata"
            : input.successMetadataSummary,
      });
    }

    if (mutationResult === "quota_insufficient") {
      return createJsonResponse(userLifecycleQuotaInsufficientResponse);
    }

    return createJsonResponse(
      didMutate ? createSuccessResponse(null) : userNotFoundResponse,
    );
  }

  async function handleUserPhoneDisclosure(input: {
    request: Request;
    context: { params: Promise<{ publicId: string }> };
    actionType: "user.phone_reveal" | "user.phone_copy";
  }): Promise<Response> {
    const actor = await requireAdminActor(input.request);

    if (actor === null) {
      return createJsonResponse(adminSessionRequiredResponse, {
        headers: NO_STORE_HEADERS,
      });
    }

    const publicId = await readUserPublicId(input.context);

    if (!canDiscloseUserPhone(actor)) {
      await appendUserPhoneDisclosureAuditLog({
        repositories,
        request: input.request,
        actor,
        actionType: input.actionType,
        targetPublicId: publicId,
        resultStatus: "failed",
        metadataSummary: "redacted phone disclosure permission denial metadata",
      });

      return createJsonResponse(adminUserPermissionDeniedResponse, {
        headers: NO_STORE_HEADERS,
      });
    }

    if (publicId === null) {
      await appendUserPhoneDisclosureAuditLog({
        repositories,
        request: input.request,
        actor,
        actionType: input.actionType,
        targetPublicId: null,
        resultStatus: "failed",
        metadataSummary: "redacted phone disclosure validation metadata",
      });

      return createJsonResponse(userPhoneDisclosureValidationFailedResponse, {
        headers: NO_STORE_HEADERS,
      });
    }

    if (
      repositories.userOrgAuthRepository.getUserPhoneForDisclosure === undefined
    ) {
      await appendUserPhoneDisclosureAuditLog({
        repositories,
        request: input.request,
        actor,
        actionType: input.actionType,
        targetPublicId: publicId,
        resultStatus: "failed",
        metadataSummary: "redacted phone disclosure unavailable metadata",
      });

      return createJsonResponse(userPhoneDisclosureUnavailableResponse, {
        headers: NO_STORE_HEADERS,
      });
    }

    const phone =
      await repositories.userOrgAuthRepository.getUserPhoneForDisclosure(
        publicId,
      );

    if (phone === null) {
      await appendUserPhoneDisclosureAuditLog({
        repositories,
        request: input.request,
        actor,
        actionType: input.actionType,
        targetPublicId: publicId,
        resultStatus: "failed",
        metadataSummary: "redacted phone disclosure not found metadata",
      });

      return createJsonResponse(userNotFoundResponse, {
        headers: NO_STORE_HEADERS,
      });
    }

    await appendUserPhoneDisclosureAuditLog({
      repositories,
      request: input.request,
      actor,
      actionType: input.actionType,
      targetPublicId: publicId,
      resultStatus: "success",
      metadataSummary:
        input.actionType === "user.phone_reveal"
          ? "redacted phone reveal metadata"
          : "redacted phone copy request metadata",
    });

    return createJsonResponse(
      input.actionType === "user.phone_reveal"
        ? createSuccessResponse<UserPhoneRevealDto>({ phone })
        : createSuccessResponse(null),
      { headers: NO_STORE_HEADERS },
    );
  }

  return createRouteHandlersWithErrorEnvelope({
    adminAccounts: {
      collection: {
        GET: listAdminAccounts,
        POST: createAdminAccount,
      },
      detail: {
        GET: getAdminAccountDetail,
        PATCH: updateAdminAccount,
      },
      disable: {
        async POST(
          request: Request,
          context: { params: Promise<{ publicId: string }> },
        ): Promise<Response> {
          return setAdminAccountStatus({
            request,
            context,
            status: "disabled",
          });
        },
      },
      enable: {
        async POST(
          request: Request,
          context: { params: Promise<{ publicId: string }> },
        ): Promise<Response> {
          return setAdminAccountStatus({
            request,
            context,
            status: "active",
          });
        },
      },
      resetPassword: {
        POST: resetAdminAccountPassword,
      },
    },
    users: {
      collection: {
        async GET(request: Request): Promise<Response> {
          const actor = await requireAdminActor(request);

          if (actor === null) {
            return createJsonResponse(adminSessionRequiredResponse);
          }

          if (!canReadUserManagement(actor)) {
            return createJsonResponse(adminUserPermissionDeniedResponse);
          }

          const result = await repositories.userOrgAuthRepository.listUsers(
            readAdminAuthOperationListQuery(request),
          );

          return createJsonResponse(
            createPaginatedResponse(
              { users: result.users.map(maskAdminUserSummaryPhone) },
              result.pagination,
            ),
          );
        },
      },
      detail: {
        async GET(
          request: Request,
          context: { params: Promise<{ publicId: string }> },
        ): Promise<Response> {
          const actor = await requireAdminActor(request);
          const { publicId } = await context.params;

          if (actor === null) {
            return createJsonResponse(adminSessionRequiredResponse);
          }

          if (!canReadUserManagement(actor)) {
            return createJsonResponse(adminUserPermissionDeniedResponse);
          }

          if (repositories.userOrgAuthRepository.getUserDetail === undefined) {
            return createJsonResponse(userDetailUnavailableResponse);
          }

          const userDetail =
            await repositories.userOrgAuthRepository.getUserDetail(publicId);

          return createJsonResponse(
            userDetail === null
              ? userNotFoundResponse
              : createSuccessResponse(maskAdminUserDetailPhone(userDetail)),
          );
        },
      },
      revealPhone: {
        async POST(
          request: Request,
          context: { params: Promise<{ publicId: string }> },
        ): Promise<Response> {
          return handleUserPhoneDisclosure({
            request,
            context,
            actionType: "user.phone_reveal",
          });
        },
      },
      copyPhone: {
        async POST(
          request: Request,
          context: { params: Promise<{ publicId: string }> },
        ): Promise<Response> {
          return handleUserPhoneDisclosure({
            request,
            context,
            actionType: "user.phone_copy",
          });
        },
      },
      resetPassword: {
        async POST(
          request: Request,
          context: { params: Promise<{ publicId: string }> },
        ): Promise<Response> {
          const actor = await requireAdminActor(request);
          const { publicId } = await context.params;

          if (actor === null) {
            return createJsonResponse(adminSessionRequiredResponse, {
              headers: NO_STORE_HEADERS,
            });
          }

          if (!canResetUserPassword(actor)) {
            await repositories.auditLogRepository.appendAuditLog({
              actorPublicId: actor.publicId,
              actorRole: actor.roles[0],
              actionType: "user.reset_password",
              targetResourceType: "user",
              targetPublicId: publicId,
              resultStatus: "failed",
              metadataSummary:
                "redacted user credential reset permission denial metadata",
              requestIp: readRequestIp(request),
            });

            return createJsonResponse(adminUserPermissionDeniedResponse, {
              headers: NO_STORE_HEADERS,
            });
          }

          const resetUserPasswordAtomically =
            repositories.userOrgAuthRepository.resetUserPasswordAtomically;

          if (resetUserPasswordAtomically === undefined) {
            await repositories.auditLogRepository.appendAuditLog({
              actorPublicId: actor.publicId,
              actorRole: actor.roles[0],
              actionType: "user.reset_password",
              targetResourceType: "user",
              targetPublicId: publicId,
              resultStatus: "failed",
              metadataSummary:
                "redacted user credential reset unavailable metadata",
              requestIp: readRequestIp(request),
            });

            return createJsonResponse(userPasswordResetUnavailableResponse, {
              headers: NO_STORE_HEADERS,
            });
          }

          const oneTimePasswordPlainText = createOneTimePassword();
          const didReset = await resetUserPasswordAtomically({
            actor: {
              publicId: actor.publicId,
              requestIp: readRequestIp(request),
              role: actor.roles[0],
            },
            newPassword: oneTimePasswordPlainText,
            publicId,
          });

          if (!didReset) {
            await repositories.auditLogRepository.appendAuditLog({
              actorPublicId: actor.publicId,
              actorRole: actor.roles[0],
              actionType: "user.reset_password",
              targetResourceType: "user",
              targetPublicId: publicId,
              resultStatus: "failed",
              metadataSummary: "redacted user credential reset metadata",
              requestIp: readRequestIp(request),
            });
            return createJsonResponse(userNotFoundResponse, {
              headers: NO_STORE_HEADERS,
            });
          }

          return createJsonResponse<AdminUserPasswordResetResultDto>(
            createSuccessResponse({
              userPublicId: publicId,
              oneTimePasswordPlainText,
              distributionWindow: {
                visibleOnce: true,
                expiresAt: null,
                redactionNotice:
                  "The one-time password is returned once and must not be logged.",
                sessionRevocation: "revoked_active_sessions",
              },
            }),
            { headers: NO_STORE_HEADERS },
          );
        },
      },
      disable: {
        async POST(
          request: Request,
          context: { params: Promise<{ publicId: string }> },
        ): Promise<Response> {
          return updateUserLifecycle({
            request,
            context,
            actionType: "user.disable",
            mutate:
              repositories.userOrgAuthRepository.disableUser === undefined
                ? undefined
                : ({ operator, publicId }) =>
                    repositories.userOrgAuthRepository.disableUser!(
                      publicId,
                      operator,
                    ),
            successMetadataSummary: "redacted user disable metadata",
          });
        },
      },
      enable: {
        async POST(
          request: Request,
          context: { params: Promise<{ publicId: string }> },
        ): Promise<Response> {
          return updateUserLifecycle({
            request,
            context,
            actionType: "user.enable",
            mutate:
              repositories.userOrgAuthRepository.enableUser === undefined
                ? undefined
                : ({ publicId }) =>
                    repositories.userOrgAuthRepository.enableUser!(publicId),
            successMetadataSummary: "redacted user enable metadata",
          });
        },
      },
    },
    questions: {
      collection: {
        async GET(request: Request): Promise<Response> {
          const actor = await requireAdminActor(request);

          if (actor === null) {
            return createJsonResponse(adminSessionRequiredResponse);
          }

          if (!canReadContentKnowledge(actor)) {
            return createJsonResponse(adminPermissionDeniedResponse);
          }

          const result =
            await repositories.contentKnowledgeRepository.listQuestions(
              readAdminContentKnowledgeListQuery(request),
            );

          return createJsonResponse(
            createPaginatedResponse(
              { questions: result.questions },
              result.pagination,
            ),
          );
        },
      },
    },
    papers: {
      collection: {
        async GET(request: Request): Promise<Response> {
          const actor = await requireAdminActor(request);

          if (actor === null) {
            return createJsonResponse(adminSessionRequiredResponse);
          }

          if (!canReadContentKnowledge(actor)) {
            return createJsonResponse(adminPermissionDeniedResponse);
          }

          const result =
            await repositories.contentKnowledgeRepository.listPapers(
              readAdminContentKnowledgeListQuery(request),
            );

          return createJsonResponse(
            createPaginatedResponse(
              { papers: result.papers },
              result.pagination,
            ),
          );
        },
      },
    },
    auditLogs: {
      collection: {
        async GET(request: Request): Promise<Response> {
          const actor = await requireAdminActor(request);

          if (actor === null) {
            return createJsonResponse(adminSessionRequiredResponse);
          }

          if (!canReadAuditLogs(actor)) {
            await repositories.auditLogRepository.appendAuditLog({
              actorPublicId: actor.publicId,
              actorRole: actor.roles[0],
              actionType: "audit_log.list",
              targetResourceType: "audit_log",
              targetPublicId: null,
              resultStatus: "failed",
              metadataSummary: "redacted audit_log permission denial metadata",
              requestIp: readRequestIp(request),
            });

            return createJsonResponse(adminPermissionDeniedResponse);
          }

          await repositories.auditLogRepository.appendAuditLog({
            actorPublicId: actor.publicId,
            actorRole: actor.roles[0],
            actionType: "audit_log.list",
            targetResourceType: "audit_log",
            targetPublicId: null,
            resultStatus: "success",
            metadataSummary: "redacted audit_log list operation metadata",
            requestIp: readRequestIp(request),
          });

          const query = readAdminAiAuditLogListQuery(request);
          const result =
            await repositories.auditLogRepository.listAuditLogs(query);

          return createJsonResponse(
            createPaginatedResponse(
              { auditLogs: result.auditLogs },
              result.pagination,
            ),
          );
        },
      },
    },
  });
}
