import { createLocalSessionRuntime } from "../auth/local-session-runtime";
import {
  createErrorResponse,
  createPaginatedResponse,
  createSuccessResponse,
  type ApiResponse,
  type ApiPagination,
} from "../contracts/api-response";
import {
  ADMIN_AI_AUDIT_LOG_ERROR_CODES,
  createAdminAiAuditLogListQuery,
  type AdminAiAuditLogListQuery,
  type AdminAiAuditLogPageSize,
  type AiCallLogListDto,
  type AiCallLogSummaryListDto,
  type ModelConfigSummaryDto,
  type ModelProviderSummaryDto,
  type PromptTemplateSummaryDto,
} from "../contracts/admin-ai-audit-log-ops-contract";
import {
  createPostgresAdminAiAuditLogRuntimeRepositories,
  type AdminAiAuditLogRuntimeRepositories,
  type AdminAiAuditLogRuntimeRepositoryOptions,
  type AppendModelConfigAuditLogInput,
} from "../repositories/admin-ai-audit-log-runtime-repository";
import {
  normalizeModelConfigFallbackOrderInput,
  normalizeModelConfigInput,
  normalizeModelProviderInput,
} from "../validators/ai-rag";
import { attachModelConfigRuntimeAlignment } from "./model-config-runtime";
import type { SessionService } from "./session-service";
import { createRouteHandlersWithErrorEnvelope } from "./route-error-response";

export type { AdminAiAuditLogRuntimeRepositories };

export type AdminAiAuditLogRuntimeOptions =
  AdminAiAuditLogRuntimeRepositoryOptions & {
    repositories?: AdminAiAuditLogRuntimeRepositories;
    sessionService?: Pick<SessionService, "getCurrentSession">;
  };

type AdminAiAuditLogRole = "super_admin" | "ops_admin" | "content_admin";

type AdminAiAuditLogActor = {
  publicId: string;
  roles: [AdminAiAuditLogRole, ...AdminAiAuditLogRole[]];
};

type RouteContext = {
  params: Promise<{
    publicId: string;
  }>;
};

type AdminRuntimePage<TData extends Record<string, unknown>> = TData & {
  pagination: ApiPagination;
};

const adminSessionRequiredResponse = createErrorResponse(
  401001,
  "Admin session is required.",
);
const adminPermissionDeniedResponse = createErrorResponse(
  ADMIN_AI_AUDIT_LOG_ERROR_CODES.adminPermissionDenied,
  "Admin permission denied.",
);
const modelConfigNotFoundResponse = createErrorResponse(
  ADMIN_AI_AUDIT_LOG_ERROR_CODES.resourceNotFound,
  "Model config does not exist.",
);
const validationFailedResponse = createErrorResponse(
  ADMIN_AI_AUDIT_LOG_ERROR_CODES.validationFailed,
  "Request validation failed.",
);
const mutationNotAvailableResponse = createErrorResponse(
  ADMIN_AI_AUDIT_LOG_ERROR_CODES.resourceNotFound,
  "Requested admin AI resource does not exist.",
);

function createJsonResponse<TData>(response: ApiResponse<TData>): Response {
  return Response.json(response);
}

async function readJsonBody(request: Request): Promise<unknown> {
  try {
    return await request.json();
  } catch {
    return null;
  }
}

function isAdminAiAuditLogRole(role: string): role is AdminAiAuditLogRole {
  return (
    role === "super_admin" || role === "ops_admin" || role === "content_admin"
  );
}

async function resolveAdminActor(
  request: Request,
  sessionService: Pick<SessionService, "getCurrentSession">,
): Promise<AdminAiAuditLogActor | null> {
  const sessionResponse = await sessionService.getCurrentSession({
    authorization: request.headers.get("authorization"),
  });

  if (sessionResponse.code !== 0 || sessionResponse.data === null) {
    return null;
  }

  const adminPublicId = sessionResponse.data.user.adminPublicId ?? null;
  const adminRoles = (sessionResponse.data.user.adminRoles ?? []).filter(
    isAdminAiAuditLogRole,
  );

  if (adminPublicId === null || adminRoles.length === 0) {
    return null;
  }

  return {
    publicId: adminPublicId,
    roles: adminRoles as [AdminAiAuditLogRole, ...AdminAiAuditLogRole[]],
  };
}

function canReadAiAuditLog(actor: AdminAiAuditLogActor): boolean {
  return (
    actor.roles.includes("super_admin") || actor.roles.includes("ops_admin")
  );
}

function canManageModelConfig(actor: AdminAiAuditLogActor): boolean {
  return actor.roles.includes("super_admin");
}

function readRequestIp(request: Request): string | null {
  const forwardedFor = request.headers.get("x-forwarded-for");

  if (forwardedFor !== null) {
    return forwardedFor.split(",")[0]?.trim() || null;
  }

  return request.headers.get("x-real-ip");
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
    aiFuncType: searchParams.get("aiFuncType") ?? "all",
    callStatus: searchParams.get("callStatus") ?? "all",
    profession: searchParams.get("profession") ?? "all",
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

function matchesAiCallLogFilter<TValue>(
  value: TValue,
  expected: TValue | "all",
): boolean {
  return expected === "all" || value === expected;
}

function matchesAiCallLogKeyword(input: {
  aiCallLog: AiCallLogListDto["aiCallLogs"][number];
  keyword: string | null;
}): boolean {
  if (input.keyword === null) {
    return true;
  }

  const keyword = input.keyword.toLowerCase();
  const searchableText = [
    input.aiCallLog.publicId,
    input.aiCallLog.userPublicId ?? "",
    input.aiCallLog.organizationPublicId ?? "",
    input.aiCallLog.aiFuncType,
    input.aiCallLog.callStatus,
    input.aiCallLog.providerDisplayName,
    input.aiCallLog.modelAlias,
    input.aiCallLog.promptSummary ?? "",
    input.aiCallLog.outputSummary ?? "",
  ]
    .join(" ")
    .toLowerCase();

  return searchableText.includes(keyword);
}

function filterAiCallLogsForQuery(
  result: Awaited<
    ReturnType<AdminAiAuditLogRuntimeRepositories["listAiCallLogs"]>
  >,
  query: AdminAiAuditLogListQuery,
) {
  const aiCallLogs = result.aiCallLogs.filter(
    (aiCallLog) =>
      matchesAiCallLogFilter(aiCallLog.aiFuncType, query.aiFuncType) &&
      matchesAiCallLogFilter(aiCallLog.callStatus, query.callStatus) &&
      matchesAiCallLogFilter(aiCallLog.profession, query.profession) &&
      (query.level === null || aiCallLog.level === query.level) &&
      matchesAiCallLogKeyword({ aiCallLog, keyword: query.keyword }),
  );

  return {
    aiCallLogs,
    pagination: {
      ...result.pagination,
      total: aiCallLogs.length,
    },
  };
}

function matchesAiCallLogSummaryKeyword(input: {
  dailySummary: AiCallLogSummaryListDto["dailySummaries"][number];
  keyword: string | null;
}): boolean {
  if (input.keyword === null) {
    return true;
  }

  const keyword = input.keyword.toLowerCase();
  const searchableText = [
    input.dailySummary.bucket,
    input.dailySummary.aiFuncType,
    input.dailySummary.providerDisplayName,
    input.dailySummary.modelAlias,
  ]
    .join(" ")
    .toLowerCase();

  return searchableText.includes(keyword);
}

function filterAiCallLogSummariesForQuery(
  result: Awaited<
    ReturnType<AdminAiAuditLogRuntimeRepositories["summarizeAiCallLogs"]>
  >,
  query: AdminAiAuditLogListQuery,
) {
  const dailySummaries = result.dailySummaries.filter(
    (dailySummary) =>
      matchesAiCallLogFilter(dailySummary.aiFuncType, query.aiFuncType) &&
      (query.callStatus === "all" ||
        (query.callStatus === "success" && dailySummary.successCount > 0) ||
        (query.callStatus === "failed" && dailySummary.failedCount > 0)) &&
      matchesAiCallLogSummaryKeyword({
        dailySummary,
        keyword: query.keyword,
      }),
  );

  return {
    dailySummaries,
    pagination: {
      ...result.pagination,
      total: dailySummaries.length,
    },
  };
}

export function createAdminAiAuditLogRuntimeRouteHandlers(
  options: AdminAiAuditLogRuntimeOptions = {},
) {
  const repositories =
    options.repositories ??
    createPostgresAdminAiAuditLogRuntimeRepositories(options);
  const sessionService = options.sessionService ?? createLocalSessionRuntime();

  async function requireReadableAdminActor(
    request: Request,
  ): Promise<ApiResponse<null> | null> {
    const actor = await resolveAdminActor(request, sessionService);

    if (actor === null) {
      return adminSessionRequiredResponse;
    }

    void actor.publicId;

    return canReadAiAuditLog(actor) ? null : adminPermissionDeniedResponse;
  }

  async function appendModelConfigAuditLog(
    request: Request,
    actor: AdminAiAuditLogActor,
    input: Omit<
      AppendModelConfigAuditLogInput,
      "actorPublicId" | "actorRole" | "requestIp"
    >,
  ): Promise<void> {
    if (repositories.appendAuditLog === undefined) {
      return;
    }

    await repositories.appendAuditLog({
      actorPublicId: actor.publicId,
      actorRole: actor.roles[0],
      requestIp: readRequestIp(request),
      ...input,
    });
  }

  async function resolveModelConfigAdminActor(
    request: Request,
    actionType: string,
    targetPublicId: string,
  ): Promise<AdminAiAuditLogActor | ApiResponse<null>> {
    const actor = await resolveAdminActor(request, sessionService);

    if (actor === null) {
      return adminSessionRequiredResponse;
    }

    if (!canManageModelConfig(actor)) {
      await appendModelConfigAuditLog(request, actor, {
        actionType,
        targetResourceType: "model_config",
        targetPublicId,
        resultStatus: "failed",
        metadataSummary: "redacted model_config permission denial metadata",
      });

      return adminPermissionDeniedResponse;
    }

    return actor;
  }

  async function resolveMutationAdminActor(input: {
    request: Request;
    actionType: string;
    targetResourceType: string;
    targetPublicId: string | null;
  }): Promise<AdminAiAuditLogActor | ApiResponse<null>> {
    const actor = await resolveAdminActor(input.request, sessionService);

    if (actor === null) {
      return adminSessionRequiredResponse;
    }

    if (!canManageModelConfig(actor)) {
      await appendModelConfigAuditLog(input.request, actor, {
        actionType: input.actionType,
        targetResourceType: input.targetResourceType,
        targetPublicId: input.targetPublicId,
        resultStatus: "failed",
        metadataSummary: `redacted ${input.targetResourceType} permission denial metadata`,
      });

      return adminPermissionDeniedResponse;
    }

    return actor;
  }

  async function appendMutationAuditLog(input: {
    request: Request;
    actor: AdminAiAuditLogActor;
    actionType: string;
    targetResourceType: string;
    targetPublicId: string | null;
    resultStatus: "success" | "failed";
  }): Promise<void> {
    await appendModelConfigAuditLog(input.request, input.actor, {
      actionType: input.actionType,
      targetResourceType: input.targetResourceType,
      targetPublicId: input.targetPublicId,
      resultStatus: input.resultStatus,
      metadataSummary: `redacted ${input.targetResourceType} mutation metadata`,
    });
  }

  function emptyPage<TData extends Record<string, unknown>>(
    data: TData,
    query: AdminAiAuditLogListQuery,
  ) {
    return createRouteHandlersWithErrorEnvelope({
      ...data,
      pagination: {
        page: query.page,
        pageSize: query.pageSize,
        sortBy: query.sortBy,
        sortOrder: query.sortOrder,
        total: 0,
      },
    });
  }

  async function readRuntimePage<TData extends Record<string, unknown>>(input: {
    fallbackData: TData;
    loadPage: () => Promise<AdminRuntimePage<TData>>;
    query: AdminAiAuditLogListQuery;
  }) {
    try {
      return await input.loadPage();
    } catch {
      return emptyPage(input.fallbackData, input.query);
    }
  }

  async function listRuntimePromptTemplates(
    query: AdminAiAuditLogListQuery,
  ): Promise<PromptTemplateSummaryDto[]> {
    const listPromptTemplates = repositories.listPromptTemplates;

    if (listPromptTemplates === undefined) {
      return [];
    }

    const result = await readRuntimePage({
      fallbackData: {
        promptTemplates: [] as PromptTemplateSummaryDto[],
      },
      loadPage: () => listPromptTemplates(query),
      query,
    });

    return result.promptTemplates;
  }

  async function updateModelConfigEnabled(input: {
    request: Request;
    context: RouteContext;
    actionType: "model_config.enable" | "model_config.disable";
    update: (publicId: string) => Promise<boolean>;
  }): Promise<Response> {
    const { publicId } = await input.context.params;
    const actorOrError = await resolveModelConfigAdminActor(
      input.request,
      input.actionType,
      publicId,
    );

    if ("code" in actorOrError) {
      return createJsonResponse(actorOrError);
    }

    const didUpdate = await input.update(publicId);
    const response = didUpdate
      ? createSuccessResponse(null)
      : modelConfigNotFoundResponse;

    await appendModelConfigAuditLog(input.request, actorOrError, {
      actionType: input.actionType,
      targetResourceType: "model_config",
      targetPublicId: publicId,
      resultStatus: didUpdate ? "success" : "failed",
      metadataSummary: "redacted model_config mutation metadata",
    });

    return createJsonResponse(response);
  }

  async function updateResourceEnabled(input: {
    request: Request;
    context: RouteContext;
    actionType:
      | "model_provider.enable"
      | "model_provider.disable"
      | "prompt_template.enable"
      | "prompt_template.disable";
    targetResourceType: "model_provider" | "prompt_template";
    update: (publicId: string) => Promise<boolean>;
  }): Promise<Response> {
    const { publicId } = await input.context.params;
    const actorOrError = await resolveMutationAdminActor({
      request: input.request,
      actionType: input.actionType,
      targetResourceType: input.targetResourceType,
      targetPublicId: publicId,
    });

    if ("code" in actorOrError) {
      return createJsonResponse(actorOrError);
    }

    const didUpdate = await input.update(publicId);

    await appendMutationAuditLog({
      request: input.request,
      actor: actorOrError,
      actionType: input.actionType,
      targetResourceType: input.targetResourceType,
      targetPublicId: publicId,
      resultStatus: didUpdate ? "success" : "failed",
    });

    return createJsonResponse(
      didUpdate ? createSuccessResponse(null) : mutationNotAvailableResponse,
    );
  }

  return createRouteHandlersWithErrorEnvelope({
    modelProviders: {
      async GET(request: Request): Promise<Response> {
        const authError = await requireReadableAdminActor(request);

        if (authError !== null) {
          return createJsonResponse(authError);
        }

        const query = readAdminAiAuditLogListQuery(request);
        const result = await readRuntimePage({
          fallbackData: { modelProviders: [] as ModelProviderSummaryDto[] },
          loadPage: () =>
            repositories.listModelProviders === undefined
              ? Promise.resolve(emptyPage({ modelProviders: [] }, query))
              : repositories.listModelProviders(query),
          query,
        });

        return createJsonResponse(
          createPaginatedResponse(
            { modelProviders: result.modelProviders },
            result.pagination,
          ),
        );
      },
      async POST(request: Request): Promise<Response> {
        const actorOrError = await resolveMutationAdminActor({
          request,
          actionType: "model_provider.create",
          targetResourceType: "model_provider",
          targetPublicId: null,
        });

        if ("code" in actorOrError) {
          return createJsonResponse(actorOrError);
        }

        const input = normalizeModelProviderInput(await readJsonBody(request));

        if (input === null || repositories.createModelProvider === undefined) {
          return createJsonResponse(validationFailedResponse);
        }

        const modelProvider = await repositories.createModelProvider(input);

        await appendMutationAuditLog({
          request,
          actor: actorOrError,
          actionType: "model_provider.create",
          targetResourceType: "model_provider",
          targetPublicId: modelProvider.publicId,
          resultStatus: "success",
        });

        return createJsonResponse(
          createSuccessResponse<{ modelProvider: ModelProviderSummaryDto }>({
            modelProvider,
          }),
        );
      },
      async PATCH(request: Request, context: RouteContext): Promise<Response> {
        const { publicId } = await context.params;
        const actorOrError = await resolveMutationAdminActor({
          request,
          actionType: "model_provider.update",
          targetResourceType: "model_provider",
          targetPublicId: publicId,
        });

        if ("code" in actorOrError) {
          return createJsonResponse(actorOrError);
        }

        const input = normalizeModelProviderInput(await readJsonBody(request));

        if (input === null || repositories.updateModelProvider === undefined) {
          return createJsonResponse(validationFailedResponse);
        }

        const modelProvider = await repositories.updateModelProvider(
          publicId,
          input,
        );

        await appendMutationAuditLog({
          request,
          actor: actorOrError,
          actionType: "model_provider.update",
          targetResourceType: "model_provider",
          targetPublicId: publicId,
          resultStatus: modelProvider === null ? "failed" : "success",
        });

        return createJsonResponse(
          modelProvider === null
            ? mutationNotAvailableResponse
            : createSuccessResponse<{ modelProvider: ModelProviderSummaryDto }>(
                { modelProvider },
              ),
        );
      },
      enable: {
        async POST(request: Request, context: RouteContext): Promise<Response> {
          return updateResourceEnabled({
            request,
            context,
            actionType: "model_provider.enable",
            targetResourceType: "model_provider",
            update: (publicId) =>
              repositories.setModelProviderEnabled?.(publicId, true) ??
              Promise.resolve(false),
          });
        },
      },
      disable: {
        async POST(request: Request, context: RouteContext): Promise<Response> {
          return updateResourceEnabled({
            request,
            context,
            actionType: "model_provider.disable",
            targetResourceType: "model_provider",
            update: (publicId) =>
              repositories.setModelProviderEnabled?.(publicId, false) ??
              Promise.resolve(false),
          });
        },
      },
    },
    modelConfigs: {
      async GET(request: Request): Promise<Response> {
        const authError = await requireReadableAdminActor(request);

        if (authError !== null) {
          return createJsonResponse(authError);
        }

        const query = readAdminAiAuditLogListQuery(request);
        const result = await readRuntimePage({
          fallbackData: { modelConfigs: [] as ModelConfigSummaryDto[] },
          loadPage: () => repositories.listModelConfigs(query),
          query,
        });
        const promptTemplates = await listRuntimePromptTemplates(query);
        const modelConfigs = attachModelConfigRuntimeAlignment({
          modelConfigs: result.modelConfigs,
          promptTemplates,
        });

        return createJsonResponse(
          createPaginatedResponse({ modelConfigs }, result.pagination),
        );
      },
      async POST(request: Request): Promise<Response> {
        const actorOrError = await resolveMutationAdminActor({
          request,
          actionType: "model_config.create",
          targetResourceType: "model_config",
          targetPublicId: null,
        });

        if ("code" in actorOrError) {
          return createJsonResponse(actorOrError);
        }

        const input = normalizeModelConfigInput(await readJsonBody(request));

        if (input === null || repositories.createModelConfig === undefined) {
          return createJsonResponse(validationFailedResponse);
        }

        const modelConfig = await repositories.createModelConfig(input);

        await appendMutationAuditLog({
          request,
          actor: actorOrError,
          actionType: "model_config.create",
          targetResourceType: "model_config",
          targetPublicId: modelConfig.publicId,
          resultStatus: "success",
        });

        return createJsonResponse(
          createSuccessResponse<{ modelConfig: ModelConfigSummaryDto }>({
            modelConfig,
          }),
        );
      },
      async PATCH(request: Request, context: RouteContext): Promise<Response> {
        const { publicId } = await context.params;
        const actorOrError = await resolveMutationAdminActor({
          request,
          actionType: "model_config.update",
          targetResourceType: "model_config",
          targetPublicId: publicId,
        });

        if ("code" in actorOrError) {
          return createJsonResponse(actorOrError);
        }

        const input = normalizeModelConfigInput(await readJsonBody(request));

        if (input === null || repositories.updateModelConfig === undefined) {
          return createJsonResponse(validationFailedResponse);
        }

        const modelConfig = await repositories.updateModelConfig(
          publicId,
          input,
        );

        await appendMutationAuditLog({
          request,
          actor: actorOrError,
          actionType: "model_config.update",
          targetResourceType: "model_config",
          targetPublicId: publicId,
          resultStatus: modelConfig === null ? "failed" : "success",
        });

        return createJsonResponse(
          modelConfig === null
            ? modelConfigNotFoundResponse
            : createSuccessResponse<{ modelConfig: ModelConfigSummaryDto }>({
                modelConfig,
              }),
        );
      },
      reorderFallback: {
        async POST(request: Request): Promise<Response> {
          const actorOrError = await resolveMutationAdminActor({
            request,
            actionType: "model_config.reorder_fallback",
            targetResourceType: "model_config",
            targetPublicId: null,
          });

          if ("code" in actorOrError) {
            return createJsonResponse(actorOrError);
          }

          const input = normalizeModelConfigFallbackOrderInput(
            await readJsonBody(request),
          );

          if (
            input === null ||
            repositories.reorderModelConfigFallback === undefined
          ) {
            return createJsonResponse(validationFailedResponse);
          }

          const didUpdate =
            await repositories.reorderModelConfigFallback(input);

          await appendMutationAuditLog({
            request,
            actor: actorOrError,
            actionType: "model_config.reorder_fallback",
            targetResourceType: "model_config",
            targetPublicId: null,
            resultStatus: didUpdate ? "success" : "failed",
          });

          return createJsonResponse(
            didUpdate
              ? createSuccessResponse(null)
              : modelConfigNotFoundResponse,
          );
        },
      },
      enable: {
        async POST(request: Request, context: RouteContext): Promise<Response> {
          return updateModelConfigEnabled({
            request,
            context,
            actionType: "model_config.enable",
            update: repositories.enableModelConfig ?? (async () => false),
          });
        },
      },
      disable: {
        async POST(request: Request, context: RouteContext): Promise<Response> {
          return updateModelConfigEnabled({
            request,
            context,
            actionType: "model_config.disable",
            update: repositories.disableModelConfig ?? (async () => false),
          });
        },
      },
    },
    promptTemplates: {
      async GET(request: Request): Promise<Response> {
        const authError = await requireReadableAdminActor(request);

        if (authError !== null) {
          return createJsonResponse(authError);
        }

        const query = readAdminAiAuditLogListQuery(request);
        const result = await readRuntimePage({
          fallbackData: {
            promptTemplates: [] as PromptTemplateSummaryDto[],
          },
          loadPage: () =>
            repositories.listPromptTemplates === undefined
              ? Promise.resolve(emptyPage({ promptTemplates: [] }, query))
              : repositories.listPromptTemplates(query),
          query,
        });

        return createJsonResponse(
          createPaginatedResponse(
            { promptTemplates: result.promptTemplates },
            result.pagination,
          ),
        );
      },
      async POST(request: Request): Promise<Response> {
        const actorOrError = await resolveMutationAdminActor({
          request,
          actionType: "prompt_template.create",
          targetResourceType: "prompt_template",
          targetPublicId: null,
        });

        if ("code" in actorOrError) {
          return createJsonResponse(actorOrError);
        }

        await appendMutationAuditLog({
          request,
          actor: actorOrError,
          actionType: "prompt_template.create",
          targetResourceType: "prompt_template",
          targetPublicId: null,
          resultStatus: "failed",
        });

        return createJsonResponse(mutationNotAvailableResponse);
      },
      async PATCH(request: Request, context: RouteContext): Promise<Response> {
        const { publicId } = await context.params;
        const actorOrError = await resolveMutationAdminActor({
          request,
          actionType: "prompt_template.update",
          targetResourceType: "prompt_template",
          targetPublicId: publicId,
        });

        if ("code" in actorOrError) {
          return createJsonResponse(actorOrError);
        }

        await appendMutationAuditLog({
          request,
          actor: actorOrError,
          actionType: "prompt_template.update",
          targetResourceType: "prompt_template",
          targetPublicId: publicId,
          resultStatus: "failed",
        });

        return createJsonResponse(mutationNotAvailableResponse);
      },
      enable: {
        async POST(request: Request, context: RouteContext): Promise<Response> {
          return updateResourceEnabled({
            request,
            context,
            actionType: "prompt_template.enable",
            targetResourceType: "prompt_template",
            update: async () => false,
          });
        },
      },
      disable: {
        async POST(request: Request, context: RouteContext): Promise<Response> {
          return updateResourceEnabled({
            request,
            context,
            actionType: "prompt_template.disable",
            targetResourceType: "prompt_template",
            update: async () => false,
          });
        },
      },
    },
    aiCallLogs: {
      async GET(request: Request): Promise<Response> {
        const authError = await requireReadableAdminActor(request);

        if (authError !== null) {
          return createJsonResponse(authError);
        }

        const query = readAdminAiAuditLogListQuery(request);
        const result = await readRuntimePage({
          fallbackData: { aiCallLogs: [] as AiCallLogListDto["aiCallLogs"] },
          loadPage: async () =>
            filterAiCallLogsForQuery(
              await repositories.listAiCallLogs(query),
              query,
            ),
          query,
        });

        return createJsonResponse(
          createPaginatedResponse(
            { aiCallLogs: result.aiCallLogs },
            result.pagination,
          ),
        );
      },
    },
    aiCallLogSummary: {
      async GET(request: Request): Promise<Response> {
        const authError = await requireReadableAdminActor(request);

        if (authError !== null) {
          return createJsonResponse(authError);
        }

        const query = readAdminAiAuditLogListQuery(request);
        const result = await readRuntimePage({
          fallbackData: {
            dailySummaries: [] as AiCallLogSummaryListDto["dailySummaries"],
          },
          loadPage: async () =>
            filterAiCallLogSummariesForQuery(
              await repositories.summarizeAiCallLogs(query),
              query,
            ),
          query,
        });

        return createJsonResponse(
          createPaginatedResponse(
            { dailySummaries: result.dailySummaries },
            result.pagination,
          ),
        );
      },
    },
  });
}
