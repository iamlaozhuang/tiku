import { createLocalSessionRuntime } from "../auth/local-session-runtime";
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
  type EmployeeMutationResultDto,
} from "../contracts/admin-user-org-auth-ops-contract";
import type {
  DisableOrganizationResultDto,
  OrgAuthResultDto,
  OrganizationDto,
  OrganizationResultDto,
} from "../contracts/organization-auth-contract";
import {
  createPostgresAdminOrganizationOrgAuthRuntimeRepositories,
  type AdminOrganizationOrgAuthRuntimeRepositories,
  type AdminOrganizationOrgAuthRuntimeRepositoryOptions,
} from "../repositories/admin-organization-org-auth-runtime-repository";
import { normalizeCreateOrgAuthInput } from "../validators/org-auth";
import {
  normalizeCreateOrganizationInput,
  normalizeDisableOrganizationInput,
  normalizeUpdateOrganizationInput,
  type NormalizedCreateOrganizationInput,
  type NormalizedUpdateOrganizationInput,
} from "../validators/organization";
import type { SessionService } from "./session-service";

export type { AdminOrganizationOrgAuthRuntimeRepositories };

export type AdminOrganizationOrgAuthRuntimeOptions =
  AdminOrganizationOrgAuthRuntimeRepositoryOptions & {
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
const organizationInputInvalidResponse = createErrorResponse(
  ADMIN_AUTH_OPERATION_ERROR_CODES.validationFailed,
  "Organization input is invalid.",
);
const organizationNotFoundResponse = createErrorResponse(
  ADMIN_AUTH_OPERATION_ERROR_CODES.resourceNotFound,
  "Organization does not exist.",
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

type RouteContext = {
  params: Promise<{
    publicId: string;
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
    disableOrganization?(input: {
      publicId: string;
      isCascade: boolean;
    }): Promise<DisableOrganizationResultDto | null>;
  };

function createJsonResponse<TData>(response: ApiResponse<TData>): Response {
  return Response.json(response);
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
    authorization: request.headers.get("authorization"),
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
  return actor.roles.includes("super_admin");
}

function canManageOrgAuth(actor: AdminOrganizationOrgAuthActor): boolean {
  return (
    actor.roles.includes("super_admin") || actor.roles.includes("ops_admin")
  );
}

function canManageOrganization(actor: AdminOrganizationOrgAuthActor): boolean {
  return (
    actor.roles.includes("super_admin") || actor.roles.includes("ops_admin")
  );
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

function normalizeEmployeeCreateInput(
  input: unknown,
): { userPublicId: string; organizationPublicId: string } | null {
  if (typeof input !== "object" || input === null) {
    return null;
  }

  const value = input as {
    userPublicId?: unknown;
    organizationPublicId?: unknown;
  };

  return typeof value.userPublicId === "string" &&
    value.userPublicId.trim().length > 0 &&
    typeof value.organizationPublicId === "string" &&
    value.organizationPublicId.trim().length > 0
    ? {
        userPublicId: value.userPublicId.trim(),
        organizationPublicId: value.organizationPublicId.trim(),
      }
    : null;
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
    page: Number.isFinite(page) && page > 0 ? page : 1,
    pageSize: pageSize as AdminAuthOperationPageSize,
    sortBy,
    sortOrder,
    keyword: searchParams.get("keyword"),
    status: readStatus(searchParams),
    userType: readUserType(searchParams),
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
    actionType: "employee.create" | "employee.disable";
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
    actionType: "org_auth.create" | "org_auth.cancel";
    targetPublicId: string | null;
    resultStatus: "success" | "failed";
    metadataSummary: string;
  }): Promise<void> {
    await repositories.auditLogRepository?.appendAuditLog({
      actorPublicId: input.actor.publicId,
      actorRole: input.actor.roles[0],
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
      | "organization.disable";
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
      | "organization.disable",
    targetPublicId: string | null,
  ): Promise<AdminOrganizationOrgAuthActor | ApiResponse<null>> {
    const actor = await resolveAdminActor(request, sessionService);

    if (actor === null) {
      return adminSessionRequiredResponse;
    }

    if (!canManageOrganization(actor)) {
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
    actionType: "org_auth.create" | "org_auth.cancel",
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
    actionType: "employee.create" | "employee.disable",
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

  return {
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
              ? organizationNotFoundResponse
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
              ? organizationNotFoundResponse
              : createSuccessResponse<OrganizationResultDto>({
                  organization,
                }),
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

          const result =
            await organizationMutationRepositories.disableOrganization({
              publicId,
              isCascade: disableInput.value.isCascade,
            });

          await appendOrganizationAuditLog({
            request,
            actor: actorOrError,
            actionType: "organization.disable",
            targetPublicId: publicId,
            resultStatus: result === null ? "failed" : "success",
            metadataSummary:
              result === null
                ? "redacted organization disable metadata"
                : `redacted organization disable metadata; affected organization=${result.affectedOrganizationPublicIds.length}`,
          });

          return createJsonResponse(
            result === null
              ? organizationNotFoundResponse
              : createSuccessResponse<DisableOrganizationResultDto>(result),
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
            readAdminAuthOperationListQuery(request),
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

          const orgAuthInput = normalizeCreateOrgAuthInput(
            await readRequestJson(request),
          );

          if (!orgAuthInput.success) {
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

          if (await repositories.hasOverlappingOrgAuth(orgAuthInput.value)) {
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

          const orgAuth = await repositories.createOrgAuth(orgAuthInput.value);

          await appendOrgAuthAuditLog({
            request,
            actor: actorOrError,
            actionType: "org_auth.create",
            targetPublicId: orgAuth?.publicId ?? null,
            resultStatus: orgAuth === null ? "failed" : "success",
            metadataSummary:
              orgAuth === null
                ? "redacted org_auth quota or organization metadata"
                : "redacted org_auth create metadata",
          });

          return createJsonResponse(
            orgAuth === null
              ? orgAuthQuotaExceededResponse
              : createSuccessResponse<OrgAuthResultDto>({ orgAuth }),
          );
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

          const orgAuth = await repositories.cancelOrgAuth(publicId);

          if (orgAuth === null) {
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

          const terminatedFlows =
            repositories.terminateOrgAuthActiveFlows === undefined
              ? { practiceCount: 0, mockExamCount: 0 }
              : await repositories.terminateOrgAuthActiveFlows(publicId);

          await appendOrgAuthAuditLog({
            request,
            actor: actorOrError,
            actionType: "org_auth.cancel",
            targetPublicId: publicId,
            resultStatus: "success",
            metadataSummary: `redacted org_auth cancel metadata; terminated practice=${terminatedFlows.practiceCount} mock_exam=${terminatedFlows.mockExamCount}`,
          });

          return createJsonResponse(
            createSuccessResponse<OrgAuthResultDto>({ orgAuth }),
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
            readAdminAuthOperationListQuery(request),
          );

          return createJsonResponse(
            createPaginatedResponse(
              { employees: result.employees },
              result.pagination,
            ),
          );
        },
        async POST(request: Request): Promise<Response> {
          const actorOrError = await requireEmployeeManager(
            request,
            "employee.create",
            null,
          );

          if ("code" in actorOrError) {
            return createJsonResponse(actorOrError);
          }

          if (repositories.createEmployee === undefined) {
            await appendEmployeeAuditLog({
              request,
              actor: actorOrError,
              actionType: "employee.create",
              targetPublicId: null,
              resultStatus: "failed",
              metadataSummary: "redacted employee create unavailable metadata",
            });

            return createJsonResponse(employeeMutationUnavailableResponse);
          }

          const normalizedInput = normalizeEmployeeCreateInput(
            await readRequestJson(request),
          );

          if (normalizedInput === null) {
            return createJsonResponse(employeeInputInvalidResponse);
          }

          const employee = await repositories.createEmployee(normalizedInput);

          await appendEmployeeAuditLog({
            request,
            actor: actorOrError,
            actionType: "employee.create",
            targetPublicId: employee?.publicId ?? null,
            resultStatus: employee === null ? "failed" : "success",
            metadataSummary: "redacted employee create metadata",
          });

          return createJsonResponse(
            employee === null
              ? employeeNotFoundResponse
              : createSuccessResponse<EmployeeMutationResultDto>({ employee }),
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
    },
  };
}
