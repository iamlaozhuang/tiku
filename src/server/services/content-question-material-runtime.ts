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
  createKnowledgeNodeSnapshot,
  createModelConfigSnapshot,
  type KnowledgeNodeSnapshot,
} from "../models/ai-rag";
import {
  createPostgresContentKnowledgeNodeRuntimeRepository,
  type ContentKnowledgeNodeRuntimeRepository,
} from "../repositories/content-knowledge-node-runtime-repository";
import {
  createPostgresMaterialRepository,
  type MaterialRepository,
} from "../repositories/material-repository";
import {
  createPostgresQuestionRepository,
  type QuestionRepository,
} from "../repositories/question-repository";
import {
  createPostgresAdminFlowRuntimeRepositories,
  type AppendAuditLogInput,
} from "../repositories/admin-flow-runtime-repository";
import {
  createPostgresAdminAiAuditLogRuntimeRepositories,
  type AppendAiCallLogInput,
} from "../repositories/admin-ai-audit-log-runtime-repository";
import {
  createKnowledgeRecommendationService,
  type KnowledgeRecommendationRunner,
} from "./knowledge-recommendation-service";
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
  auditLogRepository: ContentAuditLogRepository;
  aiCallLogRepository?: ContentAiCallLogRepository;
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

  return createAdminContentKnowledgeListQuery({
    page: Number.isFinite(page) && page > 0 ? page : 1,
    pageSize: (pageSize === 50 || pageSize === 100
      ? pageSize
      : 20) as AdminContentKnowledgePageSize,
    keyword: searchParams.get("keyword"),
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
    auditLogRepository: adminFlowRepositories.auditLogRepository,
    aiCallLogRepository: adminAiAuditLogRepositories,
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

function stripHtml(value: string): string {
  return value
    .replace(/<[^>]*>/gu, " ")
    .replace(/\s+/gu, " ")
    .trim();
}

function splitKnowledgeNodePath(pathName: string): string[] {
  return pathName
    .split(/[/>]/u)
    .map((part) => part.trim())
    .filter((part) => part.length > 0);
}

function mapKnowledgeNodeDtoToSnapshot(
  knowledgeNodeDto: Awaited<
    ReturnType<ContentKnowledgeNodeRuntimeRepository["listKnowledgeNodes"]>
  >["knowledgeNodes"][number],
): KnowledgeNodeSnapshot {
  const pathParts = splitKnowledgeNodePath(knowledgeNodeDto.pathName);

  return createKnowledgeNodeSnapshot({
    public_id: knowledgeNodeDto.publicId,
    parent_knowledge_node_public_id:
      knowledgeNodeDto.parentKnowledgeNodePublicId,
    profession: knowledgeNodeDto.profession,
    level_list: knowledgeNodeDto.levelList,
    name: knowledgeNodeDto.name,
    path_name: knowledgeNodeDto.pathName,
    depth: Math.max(1, Math.min(pathParts.length, 5)),
    sort_order: knowledgeNodeDto.sortOrder,
    kn_status: knowledgeNodeDto.knStatus,
    is_recommendable: knowledgeNodeDto.isRecommendable,
  });
}

const knowledgeRecommendationModelConfig = createModelConfigSnapshot({
  providerPublicId: "model-provider-dev-local",
  providerKey: "local_deterministic",
  providerDisplayName: "Local deterministic provider",
  modelConfigPublicId: "model-config-dev-kn-recommendation",
  aiFuncType: "kn_recommendation",
  modelName: "local-kn-recommendation-v1",
  displayName: "Local knowledge recommendation model",
  configVersion: 1,
  timeoutSecond: 10,
  maxRetryCount: 0,
  fallbackModelConfigPublicId: null,
  promptTemplateKey: "kn_recommendation_v1",
  promptTemplateVersion: 1,
});

const knowledgeRecommendationPromptTemplate = {
  promptTemplateKey: "kn_recommendation_v1",
  version: 1,
  templateHash: "kn_recommendation_v1_baseline",
};

const localKnowledgeRecommendationRunner: KnowledgeRecommendationRunner =
  async (input) => {
    const questionPlainText = [
      input.questionText,
      input.analysis ?? "",
      input.standardAnswer ?? "",
    ]
      .join(" ")
      .toLowerCase();
    const recommendations = input.knowledgeNodeSnapshots
      .map((knowledgeNodeSnapshot) => {
        const pathParts = splitKnowledgeNodePath(
          knowledgeNodeSnapshot.pathName,
        );
        const directMatch = [knowledgeNodeSnapshot.name, ...pathParts].some(
          (term) =>
            term.length > 0 && questionPlainText.includes(term.toLowerCase()),
        );

        return {
          knowledgeNodePublicId: knowledgeNodeSnapshot.publicId,
          confidence: directMatch ? "high" : "low",
          reason: directMatch
            ? "Local deterministic matcher found related question terms."
            : "Local deterministic fallback candidate.",
        };
      })
      .filter(
        (recommendation, index) =>
          recommendation.confidence === "high" || index === 0,
      )
      .slice(0, 5);

    return {
      recommendations,
      providerRequestPayload: {
        model: input.modelConfigSnapshot.modelName,
        promptTemplateKey: input.promptTemplate.promptTemplateKey,
        questionText: input.questionText,
        knowledgeNodeCount: input.knowledgeNodeSnapshots.length,
      },
      providerResponsePayload: {
        recommendations,
      },
    };
  };

function mapKnowledgeRecommendationToApi(input: {
  questionPublicId: string;
  questionUpdatedAt: string;
  result: Awaited<
    ReturnType<
      ReturnType<
        typeof createKnowledgeRecommendationService
      >["recommendKnowledgeNodes"]
    >
  >;
}): QuestionKnowledgeRecommendationResultDto {
  return {
    recommendation: {
      questionPublicId: input.questionPublicId,
      recommendationStatus: input.result.recommendationStatus,
      reviewState: {
        questionUpdatedAt: input.questionUpdatedAt,
        staleCheck: "question_updated_at_mismatch",
        bindingMode: "durable_question_binding",
      },
      recommendations: input.result.recommendations.map((recommendation) => ({
        knowledgeNodePublicId: recommendation.knowledgeNodeSnapshot.publicId,
        name: recommendation.knowledgeNodeSnapshot.name,
        pathName: recommendation.knowledgeNodeSnapshot.pathName,
        confidence: recommendation.confidence,
        reason: recommendation.reason,
        source: recommendation.source,
        confirmationStatus: recommendation.confirmationStatus,
      })),
      modelConfig: {
        modelConfigPublicId:
          input.result.modelConfigSnapshot.modelConfigPublicId,
        providerPublicId: input.result.modelConfigSnapshot.providerPublicId,
        providerDisplayName:
          input.result.modelConfigSnapshot.providerDisplayName,
        providerKey: input.result.modelConfigSnapshot.providerKey,
        modelName: input.result.modelConfigSnapshot.modelName,
        displayName: input.result.modelConfigSnapshot.displayName,
        aiFuncType: "kn_recommendation",
        configVersion: input.result.modelConfigSnapshot.configVersion,
        promptTemplateKey: input.result.promptTemplateKey,
        promptTemplateVersion: input.result.promptTemplateVersion,
      },
      failureReason: input.result.failureReason ?? null,
    },
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

  function createQuestionServiceForActor(actor: ContentAdminActor) {
    return createQuestionService(repositories.questionRepository, {
      mutationContext: { actorPublicId: actor.publicId },
    });
  }

  function createMaterialServiceForActor(actor: ContentAdminActor) {
    return createMaterialService(repositories.materialRepository, {
      mutationContext: { actorPublicId: actor.publicId },
    });
  }

  async function auditQuestionMutation(
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

  async function auditMaterialMutation(
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

          const service = createQuestionServiceForActor(actorOrError);
          const response = await service.createQuestion(
            await readRequestJson(request),
          );

          await auditQuestionMutation(
            request,
            actorOrError,
            "question.create",
            null,
            response,
          );

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

          const service = createQuestionServiceForActor(actorOrError);
          const response = await service.updateQuestion(
            publicId,
            await readRequestJson(request),
          );

          await auditQuestionMutation(
            request,
            actorOrError,
            "question.update",
            publicId,
            response,
          );

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

          const service = createQuestionServiceForActor(actorOrError);
          const response = await service.disableQuestion(publicId);

          await auditQuestionMutation(
            request,
            actorOrError,
            "question.disable",
            publicId,
            response,
          );

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

          const service = createQuestionServiceForActor(actorOrError);
          const response = await service.copyQuestion(publicId);

          await auditQuestionMutation(
            request,
            actorOrError,
            "question.copy",
            publicId,
            response,
          );

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

          const knowledgeNodePage =
            await repositories.knowledgeNodeRepository.listKnowledgeNodes(
              createAdminContentKnowledgeListQuery({
                page: 1,
                pageSize: 100,
                profession: question.profession,
                level: question.level,
                status: "active",
                sortBy: "sortOrder",
                sortOrder: "asc",
              }),
            );
          const recommendationService = createKnowledgeRecommendationService({
            runner: localKnowledgeRecommendationRunner,
          });
          const result = await recommendationService.recommendKnowledgeNodes({
            userPublicId: actorOrError.userPublicId,
            questionPublicId: question.public_id,
            questionRevisionPublicId: `${question.public_id}:${question.updated_at.toISOString()}`,
            questionText: stripHtml(question.stem_rich_text),
            analysis: stripHtml(question.analysis_rich_text) || null,
            standardAnswer:
              stripHtml(question.standard_answer_rich_text) || null,
            profession: question.profession,
            level: question.level,
            knowledgeNodeSnapshots: knowledgeNodePage.knowledgeNodes.map(
              mapKnowledgeNodeDtoToSnapshot,
            ),
            modelConfigSnapshot: knowledgeRecommendationModelConfig,
            promptTemplate: knowledgeRecommendationPromptTemplate,
          });
          const startedAt = new Date();
          const completedAt = new Date();

          if (
            result.aiCallLogDraft !== null &&
            repositories.aiCallLogRepository !== undefined
          ) {
            await repositories.aiCallLogRepository.appendAiCallLog({
              userPublicId: actorOrError.userPublicId,
              answerRecordPublicId: null,
              mockExamPublicId: null,
              questionPublicId: question.public_id,
              aiFuncType: "kn_recommendation",
              callStatus: result.aiCallLogDraft.callStatus,
              modelConfigSnapshot: result.aiCallLogDraft.modelConfigSnapshot,
              promptTemplateKey: result.aiCallLogDraft.promptTemplateKey,
              promptTemplateVersion:
                result.aiCallLogDraft.promptTemplateVersion,
              requestRedactedSnapshot:
                result.aiCallLogDraft.requestRedactedSnapshot,
              responseRedactedSnapshot:
                result.aiCallLogDraft.responseRedactedSnapshot,
              errorRedactedSnapshot:
                result.aiCallLogDraft.errorRedactedSnapshot,
              citationRedactedSnapshot:
                result.aiCallLogDraft.citationRedactedSnapshot,
              promptTokenCount: null,
              completionTokenCount: null,
              totalTokenCount: null,
              latencyMs: completedAt.getTime() - startedAt.getTime(),
              startedAt,
              completedAt,
            });
          }

          await appendAuditLog(
            repositories.auditLogRepository,
            request,
            actorOrError,
            {
              actionType: "question.recommend_knowledge_nodes",
              targetResourceType: "question",
              targetPublicId: question.public_id,
              resultStatus:
                result.recommendationStatus === "recommended"
                  ? "success"
                  : "failed",
              metadataSummary:
                "redacted knowledge recommendation operation metadata",
            },
          );

          return createJsonResponse(
            createSuccessResponse(
              mapKnowledgeRecommendationToApi({
                questionPublicId: question.public_id,
                questionUpdatedAt: question.updated_at.toISOString(),
                result,
              }),
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

          const service = createMaterialServiceForActor(actorOrError);
          const response = await service.createMaterial(
            await readRequestJson(request),
          );

          await auditMaterialMutation(
            request,
            actorOrError,
            "material.create",
            null,
            response,
          );

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

          const service = createMaterialServiceForActor(actorOrError);
          const response = await service.updateMaterial(
            publicId,
            await readRequestJson(request),
          );

          await auditMaterialMutation(
            request,
            actorOrError,
            "material.update",
            publicId,
            response,
          );

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

          const service = createMaterialServiceForActor(actorOrError);
          const response = await service.disableMaterial(publicId);

          await auditMaterialMutation(
            request,
            actorOrError,
            "material.disable",
            publicId,
            response,
          );

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

          const service = createMaterialServiceForActor(actorOrError);
          const response = await service.copyMaterial(publicId);

          await auditMaterialMutation(
            request,
            actorOrError,
            "material.copy",
            publicId,
            response,
          );

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
