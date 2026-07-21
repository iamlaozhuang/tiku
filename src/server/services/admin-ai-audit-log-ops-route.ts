import type {
  AdminAiAuditLogListQuery,
  AdminAiAuditLogPageSize,
} from "../contracts/admin-ai-audit-log-ops-contract";
import { createAdminAiAuditLogListQuery } from "../contracts/admin-ai-audit-log-ops-contract";
import type {
  AdminAiAuditLogApiResponse,
  AdminAiAuditLogOpsService,
} from "./admin-ai-audit-log-ops-service";
import { createRouteHandlersWithErrorEnvelope } from "./route-error-response";

type RouteContext = {
  params: Promise<{
    publicId: string;
  }>;
};

function createJsonResponse<TData>(
  response: AdminAiAuditLogApiResponse<TData>,
): Response {
  return Response.json(response);
}

function readListQuery(request: Request): Partial<AdminAiAuditLogListQuery> {
  const searchParams = new URL(request.url).searchParams;
  const page = Number(searchParams.get("page"));
  const pageSize = Number(searchParams.get("pageSize"));
  const keyword = searchParams.get("keyword");
  const level = Number(searchParams.get("level"));
  const sortBy = searchParams.get("sortBy");
  const safePageSize: AdminAiAuditLogPageSize =
    pageSize === 50 || pageSize === 100 ? pageSize : 20;

  return createAdminAiAuditLogListQuery({
    page: Number.isFinite(page) && page > 0 ? page : 1,
    pageSize: safePageSize,
    keyword,
    aiFuncType: searchParams.get("aiFuncType") ?? undefined,
    callStatus: searchParams.get("callStatus") ?? undefined,
    profession: searchParams.get("profession") ?? undefined,
    level: Number.isInteger(level) && level > 0 ? level : null,
    organizationPublicId: readOptionalText(
      searchParams.get("organizationPublicId"),
    ),
    userPublicId: readOptionalText(searchParams.get("userPublicId")),
    fromStartedAt: readIsoTimestamp(searchParams.get("fromStartedAt")),
    toStartedAt: readIsoTimestamp(searchParams.get("toStartedAt")),
    bucketType: searchParams.get("bucketType") === "month" ? "month" : "day",
    sortBy:
      sortBy === "completedAt" || sortBy === "startedAt" ? sortBy : "startedAt",
    sortOrder: searchParams.get("sortOrder") === "asc" ? "asc" : "desc",
  });
}

function readOptionalText(value: string | null): string | null {
  const normalized = value?.trim() ?? "";

  return normalized.length > 0 && normalized.length <= 128 ? normalized : null;
}

function readIsoTimestamp(value: string | null): string | null {
  if (value === null || !Number.isFinite(Date.parse(value))) {
    return null;
  }

  return new Date(value).toISOString();
}

export function createAdminAiAuditLogOpsRouteHandlers(
  service: AdminAiAuditLogOpsService,
) {
  return createRouteHandlersWithErrorEnvelope({
    modelConfigs: {
      async GET(request: Request): Promise<Response> {
        return createJsonResponse(
          await service.listModelConfigs(readListQuery(request)),
        );
      },
    },
    enableModelConfig: {
      async POST(_request: Request, context: RouteContext): Promise<Response> {
        const { publicId } = await context.params;

        return createJsonResponse(await service.enableModelConfig(publicId));
      },
    },
    disableModelConfig: {
      async POST(_request: Request, context: RouteContext): Promise<Response> {
        const { publicId } = await context.params;

        return createJsonResponse(await service.disableModelConfig(publicId));
      },
    },
    testModelConfigConnection: {
      async POST(_request: Request, context: RouteContext): Promise<Response> {
        const { publicId } = await context.params;

        return createJsonResponse(
          await service.testModelConfigConnection(publicId),
        );
      },
    },
    auditLogs: {
      async GET(request: Request): Promise<Response> {
        return createJsonResponse(
          await service.listAuditLogs(readListQuery(request)),
        );
      },
    },
    aiCallLogs: {
      async GET(request: Request): Promise<Response> {
        return createJsonResponse(
          await service.listAiCallLogs(readListQuery(request)),
        );
      },
    },
    aiCallLogSummary: {
      async GET(request: Request): Promise<Response> {
        return createJsonResponse(
          await service.summarizeAiCallLogs(readListQuery(request)),
        );
      },
    },
  });
}
