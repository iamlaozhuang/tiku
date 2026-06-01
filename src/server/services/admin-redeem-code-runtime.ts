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
} from "../contracts/admin-user-org-auth-ops-contract";
import type { Profession } from "../models/auth";
import {
  createPostgresAdminRedeemCodeRuntimeRepositories,
  REDEEM_CODE_BATCH_CREATE_LIMIT,
  type AdminRedeemCodeRuntimeRepositories,
  type AdminRedeemCodeRuntimeRepositoryOptions,
  RedeemCodeGenerationConflictError,
} from "../repositories/admin-redeem-code-runtime-repository";
import type { SessionService } from "./session-service";

export type { AdminRedeemCodeRuntimeRepositories };

export type AdminRedeemCodeRuntimeOptions =
  AdminRedeemCodeRuntimeRepositoryOptions & {
    repositories?: AdminRedeemCodeRuntimeRepositories;
    sessionService?: Pick<SessionService, "getCurrentSession">;
    now?: () => Date;
  };

type AdminRedeemCodeRole = "super_admin" | "ops_admin" | "content_admin";

type AdminRedeemCodeActor = {
  publicId: string;
  roles: [AdminRedeemCodeRole, ...AdminRedeemCodeRole[]];
};

type AdminRedeemCodeClock = {
  now(): Date;
};

type RedeemCodeBatchRequest = {
  count: number;
  profession: Profession;
  level: number;
  durationDay: number;
  redeemDeadlineAt: Date;
};

type RedeemCodeBatchRequestResult =
  | {
      success: true;
      value: RedeemCodeBatchRequest;
    }
  | {
      success: false;
      response: ApiResponse<null>;
    };

const adminSessionRequiredResponse = createErrorResponse(
  401001,
  "Admin session is required.",
);
const adminPermissionDeniedResponse = createErrorResponse(
  ADMIN_AUTH_OPERATION_ERROR_CODES.adminPermissionDenied,
  "Admin permission denied.",
);
const systemClock: AdminRedeemCodeClock = {
  now() {
    return new Date();
  },
};
const DEFAULT_REDEEM_CODE_DURATION_DAY = 365;
const DEFAULT_REDEEM_CODE_PROFESSION: Profession = "monopoly";
const DEFAULT_REDEEM_CODE_LEVEL = 3;
const UTC_PLUS_8_OFFSET_MS = 8 * 60 * 60 * 1000;

function createJsonResponse<TData>(response: ApiResponse<TData>): Response {
  return Response.json(response);
}

function isAdminRedeemCodeRole(role: string): role is AdminRedeemCodeRole {
  return (
    role === "super_admin" || role === "ops_admin" || role === "content_admin"
  );
}

async function resolveAdminActor(
  request: Request,
  sessionService: Pick<SessionService, "getCurrentSession">,
): Promise<AdminRedeemCodeActor | null> {
  const sessionResponse = await sessionService.getCurrentSession({
    authorization: request.headers.get("authorization"),
  });

  if (sessionResponse.code !== 0 || sessionResponse.data === null) {
    return null;
  }

  const adminPublicId = sessionResponse.data.user.adminPublicId ?? null;
  const adminRoles = (sessionResponse.data.user.adminRoles ?? []).filter(
    isAdminRedeemCodeRole,
  );

  if (adminPublicId === null || adminRoles.length === 0) {
    return null;
  }

  return {
    publicId: adminPublicId,
    roles: adminRoles as [AdminRedeemCodeRole, ...AdminRedeemCodeRole[]],
  };
}

function canReadRedeemCode(actor: AdminRedeemCodeActor): boolean {
  return (
    actor.roles.includes("super_admin") || actor.roles.includes("ops_admin")
  );
}

function canCreateRedeemCode(actor: AdminRedeemCodeActor): boolean {
  return canReadRedeemCode(actor);
}

async function readRequestJson(request: Request): Promise<unknown> {
  try {
    return await request.json();
  } catch {
    return null;
  }
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
    userType: "all",
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

  if (status === "unused" || status === "used" || status === "expired") {
    return status;
  }

  return "all";
}

function normalizeRedeemCodeBatchRequest(
  input: unknown,
  now: Date,
): RedeemCodeBatchRequestResult {
  const source = isRecord(input) ? input : {};
  const count = readInteger(source.count, 1);
  const durationDay = readInteger(
    source.durationDay,
    DEFAULT_REDEEM_CODE_DURATION_DAY,
  );
  const profession = readProfession(
    source.profession,
    DEFAULT_REDEEM_CODE_PROFESSION,
  );
  const level = readInteger(source.level, DEFAULT_REDEEM_CODE_LEVEL);

  if (count < 1 || count > REDEEM_CODE_BATCH_CREATE_LIMIT) {
    return {
      success: false,
      response: createErrorResponse(
        ADMIN_AUTH_OPERATION_ERROR_CODES.validationFailed,
        `Redeem code batch count must be between 1 and ${REDEEM_CODE_BATCH_CREATE_LIMIT}.`,
      ),
    };
  }

  if (durationDay < 1 || durationDay > 1095) {
    return {
      success: false,
      response: createErrorResponse(
        ADMIN_AUTH_OPERATION_ERROR_CODES.validationFailed,
        "Redeem code durationDay must be between 1 and 1095.",
      ),
    };
  }

  if (level < 1 || level > 5) {
    return {
      success: false,
      response: createErrorResponse(
        ADMIN_AUTH_OPERATION_ERROR_CODES.validationFailed,
        "Redeem code level must be between 1 and 5.",
      ),
    };
  }

  const redeemDeadlineAt =
    typeof source.redeemDeadlineDate === "string"
      ? createUtcPlus8EndOfDay(source.redeemDeadlineDate)
      : createDefaultRedeemDeadlineAt(now, durationDay);

  if (redeemDeadlineAt === null || redeemDeadlineAt <= now) {
    return {
      success: false,
      response: createErrorResponse(
        ADMIN_AUTH_OPERATION_ERROR_CODES.validationFailed,
        "Redeem code redeemDeadlineDate must be a future UTC+8 date.",
      ),
    };
  }

  return {
    success: true,
    value: {
      count,
      profession,
      level,
      durationDay,
      redeemDeadlineAt,
    },
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function readInteger(value: unknown, fallback: number): number {
  if (typeof value === "number" && Number.isInteger(value)) {
    return value;
  }

  if (typeof value === "string" && /^\d+$/u.test(value)) {
    return Number(value);
  }

  return fallback;
}

function readProfession(value: unknown, fallback: Profession): Profession {
  return value === "monopoly" || value === "marketing" || value === "logistics"
    ? value
    : fallback;
}

function createDefaultRedeemDeadlineAt(now: Date, durationDay: number): Date {
  const target = new Date(now.getTime() + durationDay * 24 * 60 * 60 * 1000);
  const utcPlus8Date = new Date(target.getTime() + UTC_PLUS_8_OFFSET_MS)
    .toISOString()
    .slice(0, 10);

  return createUtcPlus8EndOfDay(utcPlus8Date)!;
}

function createUtcPlus8EndOfDay(dateValue: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/u.exec(dateValue);

  if (match === null) {
    return null;
  }

  const [, yearValue, monthValue, dayValue] = match;
  const year = Number(yearValue);
  const month = Number(monthValue);
  const day = Number(dayValue);
  const result = new Date(Date.UTC(year, month - 1, day, 15, 59, 59, 999));
  const roundTripDate = new Date(result.getTime() + UTC_PLUS_8_OFFSET_MS)
    .toISOString()
    .slice(0, 10);

  return roundTripDate === dateValue ? result : null;
}

export function createAdminRedeemCodeRuntimeRouteHandlers(
  options: AdminRedeemCodeRuntimeOptions = {},
) {
  const repositories =
    options.repositories ??
    createPostgresAdminRedeemCodeRuntimeRepositories(options);
  const sessionService = options.sessionService ?? createLocalSessionRuntime();

  async function requireReadableAdminActor(
    request: Request,
  ): Promise<ApiResponse<null> | null> {
    const actor = await resolveAdminActor(request, sessionService);

    if (actor === null) {
      return adminSessionRequiredResponse;
    }

    void actor.publicId;

    return canReadRedeemCode(actor) ? null : adminPermissionDeniedResponse;
  }

  return {
    redeemCodes: {
      async GET(request: Request): Promise<Response> {
        const authError = await requireReadableAdminActor(request);

        if (authError !== null) {
          return createJsonResponse(authError);
        }

        const result = await repositories.listRedeemCodes(
          readAdminAuthOperationListQuery(request),
        );

        return createJsonResponse(
          createPaginatedResponse(
            { redeemCodes: result.redeemCodes },
            result.pagination,
          ),
        );
      },
      async POST(request: Request): Promise<Response> {
        const actor = await resolveAdminActor(request, sessionService);

        if (actor === null) {
          return createJsonResponse(adminSessionRequiredResponse);
        }

        if (!canCreateRedeemCode(actor)) {
          return createJsonResponse(adminPermissionDeniedResponse);
        }

        const clockNow = options.now ?? systemClock.now;
        const batchRequest = normalizeRedeemCodeBatchRequest(
          await readRequestJson(request),
          clockNow(),
        );

        if (!batchRequest.success) {
          return createJsonResponse(batchRequest.response);
        }

        let createdRedeemCodeBatch: Awaited<
          ReturnType<
            AdminRedeemCodeRuntimeRepositories["createRedeemCodeBatch"]
          >
        >;

        try {
          createdRedeemCodeBatch = await repositories.createRedeemCodeBatch({
            ...batchRequest.value,
            actorPublicId: actor.publicId,
          });
        } catch (error) {
          if (error instanceof RedeemCodeGenerationConflictError) {
            return createJsonResponse(
              createErrorResponse(
                ADMIN_AUTH_OPERATION_ERROR_CODES.concurrentConflict,
                "Redeem code generation conflicted with another operation. Refresh and try again.",
              ),
            );
          }

          throw error;
        }

        await repositories.auditLogRepository?.appendAuditLog({
          actorPublicId: actor.publicId,
          actorRole: actor.roles[0],
          actionType: "redeem_code.batch_create",
          targetResourceType: "redeem_code",
          targetPublicId: createdRedeemCodeBatch.generation.generationGroupId,
          resultStatus: "success",
          metadataSummary: `redacted redeem_code batch metadata; count=${createdRedeemCodeBatch.generation.count} profession=${createdRedeemCodeBatch.generation.profession} level=${createdRedeemCodeBatch.generation.level} deadline=${createdRedeemCodeBatch.generation.redeemDeadlineAt}`,
          requestIp: null,
        });

        return createJsonResponse(
          createSuccessResponse(createdRedeemCodeBatch),
        );
      },
    },
  };
}
