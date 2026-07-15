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
  type EmployeeImportResultDto,
  type EmployeeTransferResultDto,
  type EmployeeMutationResultDto,
  type EmployeeUnbindResultDto,
  type OrganizationTreeQuery,
  type OrgAuthListQuery,
} from "../contracts/admin-user-org-auth-ops-contract";
import type {
  OrgAuthDetailResultDto,
  DisableOrganizationResultDto,
  OrgAuthResultDto,
  OrganizationDto,
  OrganizationResultDto,
} from "../contracts/organization-auth-contract";
import {
  createPostgresAdminOrganizationOrgAuthRuntimeRepositories,
  createPostgresEmployeeAccountRepository,
  type AdminOrganizationOrgAuthRuntimeRepositories,
  type AdminOrganizationOrgAuthRuntimeRepositoryOptions,
} from "../repositories/admin-organization-org-auth-runtime-repository";
import type { EmployeeAccountResultDto } from "../contracts/employee-account-contract";
import { maskPhoneForDisplay } from "../mappers/phone-display-mapper";
import {
  createEmployeeAccountService,
  type EmployeeAccountService,
} from "./employee-account-service";
import {
  normalizeCreateEmployeeAccountInput,
  type NormalizedCreateEmployeeAccountInput,
} from "../validators/employee-account";
import { normalizeCreateOrgAuthPackageInput } from "../validators/org-auth";
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
    employeeAccountService?: EmployeeAccountService;
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

const EMPLOYEE_IMPORT_ROW_LIMIT = 500;

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
    ): Promise<DisableOrganizationResultDto | null>;
    enableOrganization?(
      input: NormalizedDisableOrganizationInput & { publicId: string },
    ): Promise<OrganizationDto | null>;
  };

type NormalizedEmployeeImportInput = {
  employeeAccounts: (NormalizedCreateEmployeeAccountInput & {
    rowNumber: number;
  })[];
  rejectedRows: EmployeeImportResultDto["rejectedRows"];
  targetOrganizationPublicId: string;
};

function createJsonResponse<TData>(response: ApiResponse<TData>): Response {
  return Response.json(response);
}

function formatOrganizationDisableMetadata(
  result: DisableOrganizationResultDto | null,
): string {
  if (result === null) {
    return "redacted organization disable metadata";
  }

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

function normalizeEmployeeImportInput(
  input: unknown,
): NormalizedEmployeeImportInput | null {
  if (typeof input !== "object" || input === null) {
    return null;
  }

  const value = input as {
    content?: unknown;
    sourceFormat?: unknown;
    targetOrganizationPublicId?: unknown;
  };

  if (
    typeof value.content === "string" &&
    (value.sourceFormat === "csv" || value.sourceFormat === "tsv") &&
    typeof value.targetOrganizationPublicId === "string" &&
    value.targetOrganizationPublicId.trim().length > 0
  ) {
    return parseEmployeeAccountImportContent({
      content: value.content,
      sourceFormat: value.sourceFormat,
      targetOrganizationPublicId: value.targetOrganizationPublicId.trim(),
    });
  }

  return null;
}

function parseDelimitedLine(line: string, delimiter: "," | "\t"): string[] {
  const cells: string[] = [];
  let cell = "";
  let isQuoted = false;

  for (let index = 0; index < line.length; index += 1) {
    const character = line[index];
    const nextCharacter = line[index + 1];

    if (character === '"' && isQuoted && nextCharacter === '"') {
      cell += '"';
      index += 1;
      continue;
    }

    if (character === '"') {
      isQuoted = !isQuoted;
      continue;
    }

    if (character === delimiter && !isQuoted) {
      cells.push(cell.trim());
      cell = "";
      continue;
    }

    cell += character;
  }

  cells.push(cell.trim());

  return cells;
}

function normalizeHeaderName(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[\s_-]+/gu, "");
}

const employeeAccountImportHeaderNames = new Set([
  "phone",
  "name",
  "initialpassword",
]);

const forbiddenEmployeeImportScopeHeaderNames = new Set([
  "profession",
  "level",
  "edition",
  "orgauthscopepublicid",
  "organizationpublicid",
  "userpublicid",
]);

function hasForbiddenEmployeeImportScopeHeader(
  firstHeaderNames: Set<string>,
): boolean {
  const forbiddenHeaderCount = Array.from(
    forbiddenEmployeeImportScopeHeaderNames,
  ).filter((name) => firstHeaderNames.has(name)).length;
  const looksLikeHeader =
    Array.from(firstHeaderNames).some((name) =>
      employeeAccountImportHeaderNames.has(name),
    ) || forbiddenHeaderCount > 1;

  return looksLikeHeader && forbiddenHeaderCount > 0;
}

function readEmployeeAccountCell(input: {
  cells: string[];
  fallbackIndex: number;
  headerIndexByName: Map<string, number>;
  name: string;
}): string {
  const headerIndex = input.headerIndexByName.get(input.name);
  const index = headerIndex ?? input.fallbackIndex;

  return input.cells[index]?.trim() ?? "";
}

function parseEmployeeAccountImportContent(input: {
  content: string;
  sourceFormat: "csv" | "tsv";
  targetOrganizationPublicId: string;
}): NormalizedEmployeeImportInput | null {
  const delimiter = input.sourceFormat === "tsv" ? "\t" : ",";
  const parsedRows = input.content
    .split(/\r?\n/u)
    .map((line, index) => ({
      cells: parseDelimitedLine(line, delimiter),
      rowNumber: index + 1,
    }))
    .filter((row) => row.cells.some((cell) => cell.length > 0));

  if (parsedRows.length === 0) {
    return null;
  }

  const firstRow = parsedRows[0];
  const firstHeaderNames = new Set(firstRow?.cells.map(normalizeHeaderName));

  if (hasForbiddenEmployeeImportScopeHeader(firstHeaderNames)) {
    return {
      employeeAccounts: [],
      rejectedRows: [
        {
          rowNumber: firstRow.rowNumber,
          userPublicId: null,
          organizationPublicId: null,
          reason: "invalid_row",
        },
      ],
      targetOrganizationPublicId: input.targetOrganizationPublicId,
    };
  }

  const hasHeader =
    firstHeaderNames.has("phone") && firstHeaderNames.has("name");
  const headerIndexByName = new Map<string, number>(
    hasHeader
      ? (firstRow?.cells.map((cell, index) => [
          normalizeHeaderName(cell),
          index,
        ]) ?? [])
      : [],
  );
  const dataRows = hasHeader ? parsedRows.slice(1) : parsedRows;

  if (dataRows.length === 0 || dataRows.length > EMPLOYEE_IMPORT_ROW_LIMIT) {
    return null;
  }

  const rawAccounts = dataRows.map((row) => ({
    rowNumber: row.rowNumber,
    phone: readEmployeeAccountCell({
      cells: row.cells,
      fallbackIndex: 0,
      headerIndexByName,
      name: "phone",
    }),
    name: readEmployeeAccountCell({
      cells: row.cells,
      fallbackIndex: 1,
      headerIndexByName,
      name: "name",
    }),
    initialPassword:
      hasHeader && !headerIndexByName.has("initialpassword")
        ? ""
        : readEmployeeAccountCell({
            cells: row.cells,
            fallbackIndex: 2,
            headerIndexByName,
            name: "initialpassword",
          }),
    organizationPublicId: input.targetOrganizationPublicId,
  }));
  const phoneCounts = new Map<string, number>();

  for (const account of rawAccounts) {
    if (account.phone.length > 0) {
      phoneCounts.set(account.phone, (phoneCounts.get(account.phone) ?? 0) + 1);
    }
  }

  const rejectedRows: EmployeeImportResultDto["rejectedRows"] = [];
  const employeeAccounts: (NormalizedCreateEmployeeAccountInput & {
    rowNumber: number;
  })[] = [];

  for (const account of rawAccounts) {
    const validation = normalizeCreateEmployeeAccountInput(account);
    const isDuplicatePhone = (phoneCounts.get(account.phone) ?? 0) > 1;

    if (isDuplicatePhone) {
      rejectedRows.push({
        rowNumber: account.rowNumber,
        userPublicId: null,
        organizationPublicId: account.organizationPublicId || null,
        reason: "duplicate_phone",
      });
      continue;
    }

    if (!validation.success) {
      rejectedRows.push({
        rowNumber: account.rowNumber,
        userPublicId: null,
        organizationPublicId: account.organizationPublicId || null,
        reason: "invalid_row",
      });
      continue;
    }

    employeeAccounts.push({
      ...validation.value,
      rowNumber: account.rowNumber,
    });
  }

  if (employeeAccounts.length === 0 && rejectedRows.length === 0) {
    return null;
  }

  return {
    employeeAccounts,
    rejectedRows,
    targetOrganizationPublicId: input.targetOrganizationPublicId,
  };
}

function mapEmployeeAccountResultToEmployeeSummary(
  input: EmployeeAccountResultDto,
): EmployeeSummaryDto {
  return {
    publicId: input.employeeAccount.employee.publicId,
    userPublicId: input.employeeAccount.user.publicId,
    phone: input.employeeAccount.user.phone,
    name: input.employeeAccount.user.name,
    organizationPublicId: input.employeeAccount.employee.organizationPublicId,
    status: input.employeeAccount.user.status,
  };
}

function maskEmployeeSummaryPhone(
  employeeSummary: EmployeeSummaryDto,
): EmployeeSummaryDto {
  return {
    ...employeeSummary,
    phone: maskPhoneForDisplay(employeeSummary.phone),
  };
}

function mapEmployeeAccountImportFailureReason(
  result: ApiResponse<EmployeeAccountResultDto | null>,
): EmployeeImportResultDto["rejectedRows"][number]["reason"] {
  const normalizedMessage = result.message.toLowerCase();

  if (result.code === 400006) {
    return "invalid_row";
  }

  if (result.code === 404004) {
    return "organization_not_found";
  }

  if (normalizedMessage.includes("quota")) {
    return "quota_insufficient";
  }

  if (normalizedMessage.includes("disabled")) {
    return "disabled_account";
  }

  if (normalizedMessage.includes("account domain")) {
    return "cross_domain_conflict";
  }

  if (normalizedMessage.includes("bound to another organization")) {
    return "cross_organization_conflict";
  }

  return "employee_create_failed";
}

async function importEmployeeAccounts(input: {
  employeeAccountService: EmployeeAccountService;
  normalizedInput: NormalizedEmployeeImportInput;
}): Promise<EmployeeImportResultDto> {
  if (input.normalizedInput.rejectedRows.length > 0) {
    return {
      generatedInitialPasswords: [],
      importedEmployees: [],
      rejectedRows: input.normalizedInput.rejectedRows,
    };
  }

  const importedEmployees: EmployeeSummaryDto[] = [];
  const generatedInitialPasswords: NonNullable<
    EmployeeImportResultDto["generatedInitialPasswords"]
  > = [];
  const rejectedRows: EmployeeImportResultDto["rejectedRows"] = [];

  for (const accountInput of input.normalizedInput.employeeAccounts) {
    const { rowNumber, ...employeeAccountInput } = accountInput;
    const result =
      await input.employeeAccountService.createEmployeeAccount(
        employeeAccountInput,
      );

    if (result.code === 0 && result.data !== null) {
      importedEmployees.push(
        mapEmployeeAccountResultToEmployeeSummary(result.data),
      );
      if (typeof result.data.generatedInitialPassword === "string") {
        generatedInitialPasswords.push({
          rowNumber,
          phone: maskPhoneForDisplay(employeeAccountInput.phone),
          name: employeeAccountInput.name,
          organizationPublicId: employeeAccountInput.organizationPublicId,
          initialPassword: result.data.generatedInitialPassword,
        });
      }
      continue;
    }

    rejectedRows.push({
      rowNumber,
      userPublicId: null,
      organizationPublicId: employeeAccountInput.organizationPublicId,
      reason: mapEmployeeAccountImportFailureReason(result),
    });
  }

  return {
    generatedInitialPasswords,
    importedEmployees,
    rejectedRows,
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
  const employeeAccountService =
    options.employeeAccountService ??
    createEmployeeAccountService(
      createPostgresEmployeeAccountRepository(options),
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
    actionType:
      | "employee.create"
      | "employee.disable"
      | "employee.import"
      | "employee.transfer"
      | "employee.unbind";
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
    actionType:
      | "employee.create"
      | "employee.disable"
      | "employee.import"
      | "employee.transfer"
      | "employee.unbind",
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

          const result =
            await organizationMutationRepositories.disableOrganization({
              expectedRevision: disableInput.value.expectedRevision,
              publicId,
              isCascade: disableInput.value.isCascade,
            });

          await appendOrganizationAuditLog({
            request,
            actor: actorOrError,
            actionType: "organization.disable",
            targetPublicId: publicId,
            resultStatus: result === null ? "failed" : "success",
            metadataSummary: formatOrganizationDisableMetadata(result),
          });

          return createJsonResponse(
            result === null
              ? organizationTreeConflictResponse
              : createSuccessResponse<DisableOrganizationResultDto>(result),
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
          const requestBody = await readRequestJson(request);
          const actorOrError = await requireEmployeeManager(
            request,
            "employee.create",
            null,
          );

          if ("code" in actorOrError) {
            return createJsonResponse(actorOrError);
          }

          const employeeAccountInput =
            normalizeCreateEmployeeAccountInput(requestBody);

          if (employeeAccountInput.success) {
            const result =
              await employeeAccountService.createEmployeeAccount(requestBody);
            const targetPublicId =
              result.code === 0 && result.data !== null
                ? result.data.employeeAccount.employee.publicId
                : null;

            await appendEmployeeAuditLog({
              request,
              actor: actorOrError,
              actionType: "employee.create",
              targetPublicId,
              resultStatus: result.code === 0 ? "success" : "failed",
              metadataSummary: "redacted employee account create metadata",
            });

            return createJsonResponse<
              EmployeeAccountResultDto | EmployeeMutationResultDto | null
            >(result);
          }

          await appendEmployeeAuditLog({
            request,
            actor: actorOrError,
            actionType: "employee.create",
            targetPublicId: null,
            resultStatus: "failed",
            metadataSummary: "redacted employee invalid input metadata",
          });

          return createJsonResponse(employeeInputInvalidResponse);
        },
      },
      importBatch: {
        async POST(request: Request): Promise<Response> {
          const actorOrError = await requireEmployeeManager(
            request,
            "employee.import",
            null,
          );

          if ("code" in actorOrError) {
            return createJsonResponse(actorOrError);
          }

          const normalizedInput = normalizeEmployeeImportInput(
            await readRequestJson(request),
          );

          if (normalizedInput === null) {
            await appendEmployeeAuditLog({
              request,
              actor: actorOrError,
              actionType: "employee.import",
              targetPublicId: null,
              resultStatus: "failed",
              metadataSummary: "redacted employee invalid input metadata",
            });

            return createJsonResponse(employeeInputInvalidResponse);
          }

          const result = await importEmployeeAccounts({
            employeeAccountService,
            normalizedInput,
          });

          await appendEmployeeAuditLog({
            request,
            actor: actorOrError,
            actionType: "employee.import",
            targetPublicId: null,
            resultStatus: result.rejectedRows.length > 0 ? "failed" : "success",
            metadataSummary: `redacted employee import metadata; imported=${result.importedEmployees.length} rejected=${result.rejectedRows.length}`,
          });

          return createJsonResponse(
            createSuccessResponse<EmployeeImportResultDto>(result),
          );
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
