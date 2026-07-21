import { createLocalSessionRuntime } from "../auth/local-session-runtime";
import { getRequestAuthorization } from "../auth/session-cookie";
import {
  createErrorResponse,
  createPaginatedResponse,
  createSuccessResponse,
  type ApiResponse,
} from "../contracts/api-response";
import {
  ADMIN_CONTENT_KNOWLEDGE_ERROR_CODES,
  createAdminContentKnowledgeListQuery,
  type AdminContentKnowledgeListQuery,
  type AdminContentKnowledgePageSize,
  type AdminContentKnowledgeSortField,
  ADMIN_CONTENT_KNOWLEDGE_SORT_FIELDS,
} from "../contracts/admin-content-knowledge-ops-contract";
import type { QuestionKnowledgeRecommendationResultDto } from "../contracts/question-contract";
import {
  createPostgresContentKnowledgeNodeRuntimeRepository,
  type ContentKnowledgeNodeRuntimeRepository,
} from "../repositories/content-knowledge-node-runtime-repository";
import {
  createPostgresMaterialRepository,
  type MaterialRepository,
} from "../repositories/material-repository";
import {
  createPostgresKnowledgeRecommendationRuntimeRepository,
  type KnowledgeRecommendationRuntimeRepository,
  type KnowledgeRecommendationTaskView,
} from "../repositories/knowledge-recommendation-runtime-repository";
import {
  createPostgresQuestionRepository,
  type QuestionRepository,
} from "../repositories/question-repository";
import {
  createPostgresContentImageRepository,
  type ContentImageRepository,
} from "../repositories/content-image-repository";
import {
  createPostgresTagRepository,
  type TagRepository,
} from "../repositories/tag-repository";
import {
  createPostgresAdminFlowRuntimeRepositories,
  type AppendAuditLogInput,
} from "../repositories/admin-flow-runtime-repository";
import {
  createPostgresAdminAiAuditLogRuntimeRepositories,
  type AppendAiCallLogInput,
} from "../repositories/admin-ai-audit-log-runtime-repository";
import { createMaterialService } from "./material-service";
import { createQuestionService } from "./question-service";
import type { SessionService } from "./session-service";
import { createRouteHandlersWithErrorEnvelope } from "./route-error-response";

type RouteContext = {
  params: Promise<{
    publicId: string;
  }>;
};

type ContentAdminRole = "super_admin" | "ops_admin" | "content_admin";

type ContentAdminActor = {
  userPublicId: string;
  publicId: string;
  roles: [ContentAdminRole, ...ContentAdminRole[]];
};

export type ContentAuditLogRepository = {
  appendAuditLog(input: AppendAuditLogInput): Promise<void>;
};

export type ContentAiCallLogRepository = {
  appendAiCallLog(input: AppendAiCallLogInput): Promise<unknown>;
};

export type ContentQuestionMaterialRuntimeRepositories = {
  questionRepository: QuestionRepository;
  materialRepository: MaterialRepository;
  knowledgeNodeRepository: ContentKnowledgeNodeRuntimeRepository;
  tagRepository?: TagRepository;
  auditLogRepository: ContentAuditLogRepository;
  aiCallLogRepository?: ContentAiCallLogRepository;
  knowledgeRecommendationRepository?: KnowledgeRecommendationRuntimeRepository;
  contentImageRepository?: Pick<
    ContentImageRepository,
    "findExistingContentImagePublicIds"
  >;
};

export type ContentQuestionMaterialRuntimeOptions = {
  repositories?: ContentQuestionMaterialRuntimeRepositories;
  sessionService?: Pick<SessionService, "getCurrentSession">;
};

const adminSessionRequiredResponse = createErrorResponse(
  401001,
  "Admin session is required.",
);
const adminPermissionDeniedResponse = createErrorResponse(
  ADMIN_CONTENT_KNOWLEDGE_ERROR_CODES.adminPermissionDenied,
  "Admin permission denied.",
);
const questionNotFoundResponse = createErrorResponse(
  404202,
  "Question does not exist.",
);
const validationFailedResponse = createErrorResponse(
  ADMIN_CONTENT_KNOWLEDGE_ERROR_CODES.validationFailed,
  "Request validation failed.",
);

function createJsonResponse<TData>(response: ApiResponse<TData>): Response {
  return Response.json(response);
}

function isContentAdminRole(role: string): role is ContentAdminRole {
  return (
    role === "super_admin" || role === "ops_admin" || role === "content_admin"
  );
}

function canManageContent(actor: ContentAdminActor): boolean {
  return (
    actor.roles.includes("super_admin") || actor.roles.includes("content_admin")
  );
}

function getContentAdminAuthorization(request: Request): string | null {
  return getRequestAuthorization(request);
}

async function resolveAdminActor(
  request: Request,
  sessionService: Pick<SessionService, "getCurrentSession">,
): Promise<ContentAdminActor | null> {
  const sessionResponse = await sessionService.getCurrentSession({
    authorization: getContentAdminAuthorization(request),
  });

  if (sessionResponse.code !== 0 || sessionResponse.data === null) {
    return null;
  }

  const adminPublicId = sessionResponse.data.user.adminPublicId ?? null;
  const adminRoles = (sessionResponse.data.user.adminRoles ?? []).filter(
    isContentAdminRole,
  );

  if (adminPublicId === null || adminRoles.length === 0) {
    return null;
  }

  return {
    userPublicId: sessionResponse.data.user.publicId,
    publicId: adminPublicId,
    roles: adminRoles as [ContentAdminRole, ...ContentAdminRole[]],
  };
}

async function readRequestJson(request: Request): Promise<unknown> {
  try {
    return await request.json();
  } catch {
    return null;
  }
}

function readQuestionQuery(request: Request): Record<string, unknown> {
  const searchParams = new URL(request.url).searchParams;

  return {
    page: searchParams.get("page") ?? undefined,
    pageSize: searchParams.get("pageSize") ?? undefined,
    sortBy: searchParams.get("sortBy") ?? undefined,
    sortOrder: searchParams.get("sortOrder") ?? undefined,
    profession: searchParams.get("profession") ?? undefined,
    level: searchParams.get("level") ?? undefined,
    subject: searchParams.get("subject") ?? undefined,
    questionType: searchParams.get("questionType") ?? undefined,
    status: searchParams.get("status") ?? undefined,
    keyword: searchParams.get("keyword") ?? undefined,
    knowledgeNodePublicId:
      searchParams.get("knowledgeNodePublicId") ?? undefined,
    materialPublicId: searchParams.get("materialPublicId") ?? undefined,
    tagPublicId: searchParams.get("tagPublicId") ?? undefined,
  };
}

function readMaterialQuery(request: Request): Record<string, unknown> {
  const searchParams = new URL(request.url).searchParams;

  return {
    page: searchParams.get("page") ?? undefined,
    pageSize: searchParams.get("pageSize") ?? undefined,
    sortBy: searchParams.get("sortBy") ?? undefined,
    sortOrder: searchParams.get("sortOrder") ?? undefined,
    profession: searchParams.get("profession") ?? undefined,
    level: searchParams.get("level") ?? undefined,
    subject: searchParams.get("subject") ?? undefined,
    status: searchParams.get("status") ?? undefined,
    keyword: searchParams.get("keyword") ?? undefined,
    publicIds: searchParams.getAll("publicId"),
  };
}

function readKnowledgeNodeQuery(
  request: Request,
): AdminContentKnowledgeListQuery {
  const searchParams = new URL(request.url).searchParams;
  const page = Number(searchParams.get("page"));
  const pageSize = Number(searchParams.get("pageSize"));
  const level = Number(searchParams.get("level"));
  const sortBy = searchParams.get("sortBy");
  const status = searchParams.get("status");

  return createAdminContentKnowledgeListQuery({
    page: Number.isFinite(page) && page > 0 ? page : 1,
    pageSize: (pageSize === 50 || pageSize === 100
      ? pageSize
      : 20) as AdminContentKnowledgePageSize,
    keyword: searchParams.get("keyword"),
    publicIds: searchParams.getAll("publicId"),
    status: status === "active" || status === "disabled" ? status : "all",
    level: Number.isFinite(level) && level > 0 ? level : null,
    sortBy: ADMIN_CONTENT_KNOWLEDGE_SORT_FIELDS.includes(
      sortBy as AdminContentKnowledgeSortField,
    )
      ? (sortBy as AdminContentKnowledgeSortField)
      : "updatedAt",
    sortOrder: searchParams.get("sortOrder") === "asc" ? "asc" : "desc",
  });
}

function readRequestIp(request: Request): string | null {
  const forwardedFor = request.headers.get("x-forwarded-for");

  if (forwardedFor !== null) {
    return forwardedFor.split(",")[0]?.trim() || null;
  }

  return request.headers.get("x-real-ip");
}

function createDefaultRepositories(): ContentQuestionMaterialRuntimeRepositories {
  const adminFlowRepositories = createPostgresAdminFlowRuntimeRepositories();
  const adminAiAuditLogRepositories =
    createPostgresAdminAiAuditLogRuntimeRepositories();

  return {
    questionRepository: createPostgresQuestionRepository(),
    materialRepository: createPostgresMaterialRepository(),
    knowledgeNodeRepository:
      createPostgresContentKnowledgeNodeRuntimeRepository(),
    tagRepository: createPostgresTagRepository(),
    auditLogRepository: adminFlowRepositories.auditLogRepository,
    aiCallLogRepository: adminAiAuditLogRepositories,
    knowledgeRecommendationRepository:
      createPostgresKnowledgeRecommendationRuntimeRepository(),
    contentImageRepository: createPostgresContentImageRepository(),
  };
}

async function appendAuditLog(
  repository: ContentAuditLogRepository,
  request: Request,
  actor: ContentAdminActor,
  input: Omit<AppendAuditLogInput, "actorPublicId" | "actorRole" | "requestIp">,
): Promise<void> {
  await repository.appendAuditLog({
    actorPublicId: actor.publicId,
    actorRole: actor.roles[0],
    requestIp: readRequestIp(request),
    ...input,
  });
}

function extractQuestionPublicId(
  response: ApiResponse<unknown>,
): string | null {
  if (
    response.code === 0 &&
    typeof response.data === "object" &&
    response.data !== null &&
    "question" in response.data
  ) {
    const questionValue = (response.data as { question?: unknown }).question;

    if (
      typeof questionValue === "object" &&
      questionValue !== null &&
      "publicId" in questionValue &&
      typeof (questionValue as { publicId?: unknown }).publicId === "string"
    ) {
      return (questionValue as { publicId: string }).publicId;
    }
  }

  return null;
}

function extractMaterialPublicId(
  response: ApiResponse<unknown>,
): string | null {
  if (
    response.code === 0 &&
    typeof response.data === "object" &&
    response.data !== null &&
    "material" in response.data
  ) {
    const materialValue = (response.data as { material?: unknown }).material;

    if (
      typeof materialValue === "object" &&
      materialValue !== null &&
      "publicId" in materialValue &&
      typeof (materialValue as { publicId?: unknown }).publicId === "string"
    ) {
      return (materialValue as { publicId: string }).publicId;
    }
  }

  return null;
}

function mapKnowledgeRecommendationTaskToApi(
  task: KnowledgeRecommendationTaskView,
): QuestionKnowledgeRecommendationResultDto {
  const recommendationStatus =
    task.taskStatus === "succeeded"
      ? "recommended"
      : task.taskStatus === "failed"
        ? "recommendation_failed"
        : task.taskStatus;

  return {
    recommendation: {
      questionPublicId: task.questionPublicId,
      recommendationStatus,
      reviewState: {
        questionUpdatedAt: task.questionUpdatedAt,
        currentQuestionUpdatedAt: task.currentQuestionUpdatedAt,
        taskPublicId: task.taskPublicId,
        taskStatus: task.taskStatus,
        staleCheck: "question_updated_at_mismatch",
        bindingMode: "durable_question_binding",
      },
      recommendations: task.candidates.map((candidate) => ({
        candidatePublicId: candidate.candidatePublicId,
        knowledgeNodePublicId: candidate.knowledgeNodePublicId,
        name: candidate.name,
        pathName: candidate.pathName,
        confidence:
          candidate.confidenceBasisPoint >= 8_000
            ? "high"
            : candidate.confidenceBasisPoint >= 5_000
              ? "medium"
              : "low",
        reason: candidate.reasonSummary,
        source: "ai_recommended",
        confirmationStatus:
          candidate.reviewStatus === "pending"
            ? "pending_confirmation"
            : candidate.reviewStatus,
        confidenceBasisPoint: candidate.confidenceBasisPoint,
        citationCount: candidate.citationCount,
      })),
      evidenceStatus: task.evidenceStatus,
      modelConfig:
        task.modelConfigPublicId === null ||
        task.promptTemplatePublicId === null
          ? null
          : {
              modelConfigPublicId: task.modelConfigPublicId,
              promptTemplatePublicId: task.promptTemplatePublicId,
            },
      failureReason: task.failureCode,
    },
  };
}

type KnowledgeRecommendationCommand =
  | { action: "request" }
  | {
      action: "confirm" | "ignore";
      taskPublicId: string;
      expectedQuestionUpdatedAt: Date;
      candidatePublicIds: string[];
    };

function parseKnowledgeRecommendationCommand(
  value: unknown,
): KnowledgeRecommendationCommand | null {
  if (value === null) {
    return { action: "request" };
  }

  if (typeof value !== "object" || Array.isArray(value)) {
    return null;
  }

  const command = value as Record<string, unknown>;

  if (command.action === undefined || command.action === "request") {
    return { action: "request" };
  }

  if (
    (command.action !== "confirm" && command.action !== "ignore") ||
    typeof command.taskPublicId !== "string" ||
    command.taskPublicId.length === 0 ||
    typeof command.expectedQuestionUpdatedAt !== "string" ||
    !Array.isArray(command.candidatePublicIds) ||
    !command.candidatePublicIds.every(
      (publicId) => typeof publicId === "string" && publicId.length > 0,
    )
  ) {
    return null;
  }

  const expectedQuestionUpdatedAt = new Date(command.expectedQuestionUpdatedAt);

  return Number.isNaN(expectedQuestionUpdatedAt.getTime())
    ? null
    : {
        action: command.action,
        taskPublicId: command.taskPublicId,
        expectedQuestionUpdatedAt,
        candidatePublicIds: command.candidatePublicIds as string[],
      };
}

export function createContentQuestionMaterialRuntimeRouteHandlers(
  options: ContentQuestionMaterialRuntimeOptions = {},
) {
  const repositories = options.repositories ?? createDefaultRepositories();
  const sessionService = options.sessionService ?? createLocalSessionRuntime();

  async function requireContentAdminActor(
    request: Request,
    auditInput?: Pick<
      AppendAuditLogInput,
      "actionType" | "targetResourceType" | "targetPublicId"
    >,
  ): Promise<ContentAdminActor | ApiResponse<null>> {
    const actor = await resolveAdminActor(request, sessionService);

    if (actor === null) {
      return adminSessionRequiredResponse;
    }

    if (!canManageContent(actor)) {
      if (auditInput !== undefined) {
        await appendAuditLog(repositories.auditLogRepository, request, actor, {
          ...auditInput,
          resultStatus: "failed",
          metadataSummary: "redacted content permission denial metadata",
        });
      }

      return adminPermissionDeniedResponse;
    }

    return actor;
  }

  function createQuestionServiceForActor(
    actor: ContentAdminActor,
    request?: Request,
    actionType?: string,
  ) {
    return createQuestionService(repositories.questionRepository, {
      contentImageRepository: repositories.contentImageRepository,
      mutationContext: {
        actorPublicId: actor.publicId,
        ...(request !== undefined && actionType !== undefined
          ? {
              auditLog: {
                actorRole: actor.roles[0],
                actionType,
                targetResourceType: "question" as const,
                metadataSummary: "redacted question mutation metadata",
                requestIp: readRequestIp(request),
              },
            }
          : {}),
      },
    });
  }

  function createMaterialServiceForActor(
    actor: ContentAdminActor,
    request?: Request,
    actionType?: string,
  ) {
    return createMaterialService(repositories.materialRepository, {
      contentImageRepository: repositories.contentImageRepository,
      mutationContext: {
        actorPublicId: actor.publicId,
        ...(request !== undefined && actionType !== undefined
          ? {
              auditLog: {
                actorRole: actor.roles[0],
                actionType,
                targetResourceType: "material" as const,
                metadataSummary: "redacted material mutation metadata",
                requestIp: readRequestIp(request),
              },
            }
          : {}),
      },
    });
  }

  async function auditFailedQuestionMutation(
    request: Request,
    actor: ContentAdminActor,
    actionType: string,
    targetPublicId: string | null,
    response: ApiResponse<unknown>,
  ): Promise<void> {
    await appendAuditLog(repositories.auditLogRepository, request, actor, {
      actionType,
      targetResourceType: "question",
      targetPublicId: targetPublicId ?? extractQuestionPublicId(response),
      resultStatus: response.code === 0 ? "success" : "failed",
      metadataSummary: "redacted question mutation metadata",
    });
  }

  async function auditFailedMaterialMutation(
    request: Request,
    actor: ContentAdminActor,
    actionType: string,
    targetPublicId: string | null,
    response: ApiResponse<unknown>,
  ): Promise<void> {
    await appendAuditLog(repositories.auditLogRepository, request, actor, {
      actionType,
      targetResourceType: "material",
      targetPublicId: targetPublicId ?? extractMaterialPublicId(response),
      resultStatus: response.code === 0 ? "success" : "failed",
      metadataSummary: "redacted material mutation metadata",
    });
  }

  return createRouteHandlersWithErrorEnvelope({
    tags: {
      collection: {
        async GET(request: Request): Promise<Response> {
          const actorOrError = await requireContentAdminActor(request);

          if ("code" in actorOrError) {
            return createJsonResponse(actorOrError);
          }

          return createJsonResponse(
            createSuccessResponse(
              repositories.tagRepository === undefined
                ? { tags: [] }
                : await repositories.tagRepository.listTags(),
            ),
          );
        },
      },
    },
    questions: {
      collection: {
        async GET(request: Request): Promise<Response> {
          const actorOrError = await requireContentAdminActor(request);

          if ("code" in actorOrError) {
            return createJsonResponse(actorOrError);
          }

          const service = createQuestionServiceForActor(actorOrError);

          return createJsonResponse(
            await service.listQuestions(readQuestionQuery(request)),
          );
        },
        async POST(request: Request): Promise<Response> {
          const actorOrError = await requireContentAdminActor(request, {
            actionType: "question.create",
            targetResourceType: "question",
            targetPublicId: null,
          });

          if ("code" in actorOrError) {
            return createJsonResponse(actorOrError);
          }

          const service = createQuestionServiceForActor(
            actorOrError,
            request,
            "question.create",
          );
          const response = await service.createQuestion(
            await readRequestJson(request),
          );

          if (response.code !== 0) {
            await auditFailedQuestionMutation(
              request,
              actorOrError,
              "question.create",
              null,
              response,
            );
          }

          return createJsonResponse(response);
        },
      },
      detail: {
        async GET(_request: Request, context: RouteContext): Promise<Response> {
          const actorOrError = await requireContentAdminActor(_request);

          if ("code" in actorOrError) {
            return createJsonResponse(actorOrError);
          }

          const { publicId } = await context.params;
          const service = createQuestionServiceForActor(actorOrError);

          return createJsonResponse(await service.getQuestion(publicId));
        },
        async PATCH(
          request: Request,
          context: RouteContext,
        ): Promise<Response> {
          const { publicId } = await context.params;
          const actorOrError = await requireContentAdminActor(request, {
            actionType: "question.update",
            targetResourceType: "question",
            targetPublicId: publicId,
          });

          if ("code" in actorOrError) {
            return createJsonResponse(actorOrError);
          }

          const service = createQuestionServiceForActor(
            actorOrError,
            request,
            "question.update",
          );
          const response = await service.updateQuestion(
            publicId,
            await readRequestJson(request),
          );

          if (response.code !== 0) {
            await auditFailedQuestionMutation(
              request,
              actorOrError,
              "question.update",
              publicId,
              response,
            );
          }

          return createJsonResponse(response);
        },
      },
      disable: {
        async POST(request: Request, context: RouteContext): Promise<Response> {
          const { publicId } = await context.params;
          const actorOrError = await requireContentAdminActor(request, {
            actionType: "question.disable",
            targetResourceType: "question",
            targetPublicId: publicId,
          });

          if ("code" in actorOrError) {
            return createJsonResponse(actorOrError);
          }

          const service = createQuestionServiceForActor(
            actorOrError,
            request,
            "question.disable",
          );
          const response = await service.disableQuestion(publicId);

          if (response.code !== 0) {
            await auditFailedQuestionMutation(
              request,
              actorOrError,
              "question.disable",
              publicId,
              response,
            );
          }

          return createJsonResponse(response);
        },
      },
      copy: {
        async POST(request: Request, context: RouteContext): Promise<Response> {
          const { publicId } = await context.params;
          const actorOrError = await requireContentAdminActor(request, {
            actionType: "question.copy",
            targetResourceType: "question",
            targetPublicId: publicId,
          });

          if ("code" in actorOrError) {
            return createJsonResponse(actorOrError);
          }

          const service = createQuestionServiceForActor(
            actorOrError,
            request,
            "question.copy",
          );
          const response = await service.copyQuestion(publicId);

          if (response.code !== 0) {
            await auditFailedQuestionMutation(
              request,
              actorOrError,
              "question.copy",
              publicId,
              response,
            );
          }

          return createJsonResponse(response);
        },
      },
      recommendKnowledgeNodes: {
        async POST(request: Request, context: RouteContext): Promise<Response> {
          const { publicId } = await context.params;
          const actorOrError = await requireContentAdminActor(request, {
            actionType: "question.recommend_knowledge_nodes",
            targetResourceType: "question",
            targetPublicId: publicId,
          });

          if ("code" in actorOrError) {
            return createJsonResponse(actorOrError);
          }

          const question =
            await repositories.questionRepository.findQuestionByPublicId(
              publicId,
            );

          if (question === null) {
            await appendAuditLog(
              repositories.auditLogRepository,
              request,
              actorOrError,
              {
                actionType: "question.recommend_knowledge_nodes",
                targetResourceType: "question",
                targetPublicId: publicId,
                resultStatus: "failed",
                metadataSummary:
                  "redacted knowledge recommendation missing question metadata",
              },
            );

            return createJsonResponse(questionNotFoundResponse);
          }

          const command = parseKnowledgeRecommendationCommand(
            await readRequestJson(request),
          );

          if (command === null) {
            return createJsonResponse(validationFailedResponse);
          }

          const recommendationRepository =
            repositories.knowledgeRecommendationRepository;

          if (recommendationRepository === undefined) {
            return createJsonResponse(
              createErrorResponse(
                ADMIN_CONTENT_KNOWLEDGE_ERROR_CODES.concurrentConflict,
                "Durable knowledge recommendation is unavailable.",
              ),
            );
          }

          const task =
            command.action === "request"
              ? await recommendationRepository.requestKnowledgeRecommendation(
                  question.public_id,
                  actorOrError.userPublicId,
                )
              : await recommendationRepository.reviewKnowledgeRecommendationTask(
                  {
                    taskPublicId: command.taskPublicId,
                    questionPublicId: publicId,
                    expectedQuestionUpdatedAt:
                      command.expectedQuestionUpdatedAt,
                    action: command.action,
                    candidatePublicIds: command.candidatePublicIds,
                    reviewedByUserPublicId: actorOrError.userPublicId,
                  },
                );

          await appendAuditLog(
            repositories.auditLogRepository,
            request,
            actorOrError,
            {
              actionType: "question.recommend_knowledge_nodes",
              targetResourceType: "question",
              targetPublicId: question.public_id,
              resultStatus: task === null ? "failed" : "success",
              metadataSummary:
                "redacted knowledge recommendation operation metadata",
            },
          );

          return createJsonResponse(
            task === null
              ? createErrorResponse(
                  ADMIN_CONTENT_KNOWLEDGE_ERROR_CODES.concurrentConflict,
                  "Knowledge recommendation state changed.",
                )
              : createSuccessResponse(
                  mapKnowledgeRecommendationTaskToApi(task),
                ),
          );
        },
      },
    },
    materials: {
      collection: {
        async GET(request: Request): Promise<Response> {
          const actorOrError = await requireContentAdminActor(request);

          if ("code" in actorOrError) {
            return createJsonResponse(actorOrError);
          }

          const service = createMaterialServiceForActor(actorOrError);

          return createJsonResponse(
            await service.listMaterials(readMaterialQuery(request)),
          );
        },
        async POST(request: Request): Promise<Response> {
          const actorOrError = await requireContentAdminActor(request, {
            actionType: "material.create",
            targetResourceType: "material",
            targetPublicId: null,
          });

          if ("code" in actorOrError) {
            return createJsonResponse(actorOrError);
          }

          const service = createMaterialServiceForActor(
            actorOrError,
            request,
            "material.create",
          );
          const response = await service.createMaterial(
            await readRequestJson(request),
          );

          if (response.code !== 0) {
            await auditFailedMaterialMutation(
              request,
              actorOrError,
              "material.create",
              null,
              response,
            );
          }

          return createJsonResponse(response);
        },
      },
      detail: {
        async GET(request: Request, context: RouteContext): Promise<Response> {
          const actorOrError = await requireContentAdminActor(request);

          if ("code" in actorOrError) {
            return createJsonResponse(actorOrError);
          }

          const { publicId } = await context.params;
          const service = createMaterialServiceForActor(actorOrError);

          return createJsonResponse(await service.getMaterial(publicId));
        },
        async PATCH(
          request: Request,
          context: RouteContext,
        ): Promise<Response> {
          const { publicId } = await context.params;
          const actorOrError = await requireContentAdminActor(request, {
            actionType: "material.update",
            targetResourceType: "material",
            targetPublicId: publicId,
          });

          if ("code" in actorOrError) {
            return createJsonResponse(actorOrError);
          }

          const service = createMaterialServiceForActor(
            actorOrError,
            request,
            "material.update",
          );
          const response = await service.updateMaterial(
            publicId,
            await readRequestJson(request),
          );

          if (response.code !== 0) {
            await auditFailedMaterialMutation(
              request,
              actorOrError,
              "material.update",
              publicId,
              response,
            );
          }

          return createJsonResponse(response);
        },
      },
      disable: {
        async POST(request: Request, context: RouteContext): Promise<Response> {
          const { publicId } = await context.params;
          const actorOrError = await requireContentAdminActor(request, {
            actionType: "material.disable",
            targetResourceType: "material",
            targetPublicId: publicId,
          });

          if ("code" in actorOrError) {
            return createJsonResponse(actorOrError);
          }

          const service = createMaterialServiceForActor(
            actorOrError,
            request,
            "material.disable",
          );
          const response = await service.disableMaterial(publicId);

          if (response.code !== 0) {
            await auditFailedMaterialMutation(
              request,
              actorOrError,
              "material.disable",
              publicId,
              response,
            );
          }

          return createJsonResponse(response);
        },
      },
      copy: {
        async POST(request: Request, context: RouteContext): Promise<Response> {
          const { publicId } = await context.params;
          const actorOrError = await requireContentAdminActor(request, {
            actionType: "material.copy",
            targetResourceType: "material",
            targetPublicId: publicId,
          });

          if ("code" in actorOrError) {
            return createJsonResponse(actorOrError);
          }

          const service = createMaterialServiceForActor(
            actorOrError,
            request,
            "material.copy",
          );
          const response = await service.copyMaterial(publicId);

          if (response.code !== 0) {
            await auditFailedMaterialMutation(
              request,
              actorOrError,
              "material.copy",
              publicId,
              response,
            );
          }

          return createJsonResponse(response);
        },
      },
    },
    knowledgeNodes: {
      async GET(request: Request): Promise<Response> {
        const actorOrError = await requireContentAdminActor(request);

        if ("code" in actorOrError) {
          return createJsonResponse(actorOrError);
        }

        void actorOrError;

        const result =
          await repositories.knowledgeNodeRepository.listKnowledgeNodes(
            readKnowledgeNodeQuery(request),
          );

        return createJsonResponse(
          createPaginatedResponse(
            { knowledgeNodes: result.knowledgeNodes },
            result.pagination,
          ),
        );
      },
    },
  });
}
