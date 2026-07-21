import { createLocalSessionRuntime } from "@/server/auth/local-session-runtime";
import { getRequestAuthorization } from "@/server/auth/session-cookie";
import {
  createErrorResponse,
  createPaginatedResponse,
  type ApiPagination,
  type ApiResponse,
} from "@/server/contracts/api-response";
import {
  AI_CALL_LOG_RETENTION_DAY,
  type AiCallLogGovernanceHandoff,
  type AiCallLogListDto,
  type AiCallLogSummaryListDto,
} from "@/server/contracts/ai-call-log/log-governance-contract";
import type { AiCallLogCostSummaryDto } from "@/server/contracts/admin-ai-audit-log-ops-contract";
import {
  mapAiCallLogRecordToDto,
  summarizeAiCallLogRecords,
} from "@/server/mappers/ai-call-log/ai-call-log-mapper";
import {
  createPostgresAiCallLogRepository,
  type AiCallLogFactQuery,
  type PostgresAiCallLogRepository,
} from "@/server/repositories/ai-call-log/postgres-ai-call-log-repository";
import type { AiCallLogRepository } from "@/server/repositories/ai-call-log/ai-call-log-repository";
import { createRouteHandlersWithErrorEnvelope } from "@/server/services/route-error-response";
import type { SessionService } from "@/server/services/session-service";
import { parseAiCallLogListQuery } from "@/server/validators/ai-call-log/list-query";

export type AiCallLogRouteHandlerOptions = {
  repository?: AiCallLogRepository &
    Partial<Pick<PostgresAiCallLogRepository, "summarizeAiCallLogs">>;
  sessionService?: Pick<SessionService, "getCurrentSession">;
};

type AiCallLogSummaryResponseDto = Omit<
  AiCallLogSummaryListDto,
  "dailySummaries"
> & {
  dailySummaries: AiCallLogCostSummaryDto[];
};

type AdminLogActor = {
  publicId: string;
  roles: ("super_admin" | "ops_admin" | "content_admin")[];
};

const adminSessionRequiredResponse = createErrorResponse(
  401001,
  "Admin session is required.",
);
const adminPermissionDeniedResponse = createErrorResponse(
  403641,
  "Admin permission denied.",
);

export function createBlockedAiCallLogGovernanceHandoff(): AiCallLogGovernanceHandoff {
  return {
    aiCallLogRetentionDay: AI_CALL_LOG_RETENTION_DAY,
    blockedCapabilities: [
      "raw_prompt_provider_response_viewer",
      "provider_model_request",
      "quota_use",
      "cost_calibration",
      "export_file_generation_download",
      "schema_migration",
    ],
    exportStatus: "blocked",
    providerExecutionStatus: "blocked",
    rawViewerStatus: "blocked",
    readOnly: true,
    status: "blocked",
  };
}

export function createAiCallLogRouteHandlers(
  options: AiCallLogRouteHandlerOptions = {},
) {
  const repository = options.repository ?? createPostgresAiCallLogRepository();
  const sessionService = options.sessionService ?? createLocalSessionRuntime();

  return createRouteHandlersWithErrorEnvelope({
    aiCallLogs: {
      async GET(request: Request): Promise<Response> {
        const actorOrError = await resolveReadableAdminActor(
          request,
          sessionService,
        );

        if ("code" in actorOrError) {
          return createJsonResponse(actorOrError);
        }

        void actorOrError.publicId;

        const query = parseAiCallLogFactQuery(request);
        const listResult = await repository.listAiCallLogs(query);

        return createJsonResponse(
          createPaginatedResponse<AiCallLogListDto>(
            {
              aiCallLogs: listResult.aiCallLogs.map(mapAiCallLogRecordToDto),
              governance: createBlockedAiCallLogGovernanceHandoff(),
            },
            listResult.pagination,
          ),
        );
      },
    },
    aiCallLogSummary: {
      async GET(request: Request): Promise<Response> {
        const actorOrError = await resolveReadableAdminActor(
          request,
          sessionService,
        );

        if ("code" in actorOrError) {
          return createJsonResponse(actorOrError);
        }

        void actorOrError.publicId;

        const query = parseAiCallLogFactQuery(request);
        const summaryResult = repository.summarizeAiCallLogs
          ? await repository.summarizeAiCallLogs(query)
          : await summarizePaginatedFallback(repository, query);

        return createJsonResponse(
          createPaginatedResponse<AiCallLogSummaryResponseDto>(
            {
              dailySummaries: summaryResult.dailySummaries,
              governance: createBlockedAiCallLogGovernanceHandoff(),
            },
            summaryResult.pagination,
          ),
        );
      },
    },
  });
}

function parseAiCallLogFactQuery(request: Request): AiCallLogFactQuery {
  const query = parseAiCallLogListQuery(request);
  const searchParams = new URL(request.url).searchParams;

  return {
    ...query,
    bucketType: searchParams.get("bucketType") === "month" ? "month" : "day",
    fromStartedAt: readIsoTimestamp(searchParams.get("fromStartedAt")),
    toStartedAt: readIsoTimestamp(searchParams.get("toStartedAt")),
  };
}

function readIsoTimestamp(value: string | null): string | null {
  if (value === null || !Number.isFinite(Date.parse(value))) {
    return null;
  }

  return new Date(value).toISOString();
}

async function summarizePaginatedFallback(
  repository: AiCallLogRepository,
  query: AiCallLogFactQuery,
): Promise<{
  dailySummaries: AiCallLogCostSummaryDto[];
  pagination: ApiPagination;
}> {
  const listResult = await repository.listAiCallLogs(query);
  const dailySummaries = summarizeAiCallLogRecords(listResult.aiCallLogs);

  return {
    dailySummaries,
    pagination: createSummaryPagination(
      listResult.pagination,
      dailySummaries.length,
    ),
  };
}

function createJsonResponse<TResponse>(
  response: ApiResponse<TResponse>,
): Response {
  return Response.json(response);
}

function createSummaryPagination(
  pagination: ApiPagination,
  total: number,
): ApiPagination {
  return {
    ...pagination,
    total,
  };
}

async function resolveReadableAdminActor(
  request: Request,
  sessionService: Pick<SessionService, "getCurrentSession">,
): Promise<AdminLogActor | ApiResponse<null>> {
  const sessionResponse = await sessionService.getCurrentSession({
    authorization: getRequestAuthorization(request),
  });

  if (sessionResponse.code !== 0 || sessionResponse.data === null) {
    return adminSessionRequiredResponse;
  }

  const adminPublicId = sessionResponse.data.user.adminPublicId;
  const adminRoles = (sessionResponse.data.user.adminRoles ?? []).filter(
    isAdminRole,
  );

  if (
    adminPublicId === null ||
    adminPublicId === undefined ||
    adminRoles.length === 0
  ) {
    return adminSessionRequiredResponse;
  }

  if (
    !adminRoles.includes("super_admin") &&
    !adminRoles.includes("ops_admin")
  ) {
    return adminPermissionDeniedResponse;
  }

  return {
    publicId: adminPublicId,
    roles: adminRoles,
  };
}

function isAdminRole(
  value: string,
): value is "super_admin" | "ops_admin" | "content_admin" {
  return (
    value === "super_admin" ||
    value === "ops_admin" ||
    value === "content_admin"
  );
}
