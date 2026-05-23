import { createLocalSessionRuntime } from "../auth/local-session-runtime";
import {
  createErrorResponse,
  createPaginatedResponse,
  createSuccessResponse,
  type ApiResponse,
} from "../contracts/api-response";
import {
  ADMIN_CONTENT_KNOWLEDGE_ERROR_CODES,
  ADMIN_CONTENT_KNOWLEDGE_SORT_FIELDS,
  createAdminContentKnowledgeListQuery,
  type AdminContentKnowledgeStatus,
  type AdminContentKnowledgeListQuery,
  type AdminContentKnowledgePageSize,
  type AdminContentKnowledgeSortField,
  type AdminKnowledgeNodeOpsSummaryDto,
} from "../contracts/admin-content-knowledge-ops-contract";
import type { ResourceVectorRebuildResultDto } from "../contracts/ai-rag-contract";
import type { Profession } from "../models/auth";
import {
  createPostgresAdminFlowRuntimeRepositories,
  type AppendAuditLogInput,
} from "../repositories/admin-flow-runtime-repository";
import {
  createPostgresRagResourceKnowledgeRuntimeRepositories,
  type RagKnowledgeNodeRuntimeRepository,
  type RagResourceKnowledgeRuntimeRepositories,
  type RagResourceRuntimeRepository,
} from "../repositories/rag-resource-knowledge-runtime-repository";
import {
  parseKnowledgeNodeMutationInput,
  parseKnowledgeNodeUpdateInput,
} from "../validators/rag-resource-knowledge";
import { buildResourceChunks } from "./rag-chunking-service";
import type { SessionService } from "./session-service";

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

export type RagResourceKnowledgeAuditLogRepository = {
  appendAuditLog(input: AppendAuditLogInput): Promise<void>;
};

export type RagResourceKnowledgeRuntimeRepositoriesWithAudit =
  RagResourceKnowledgeRuntimeRepositories & {
    auditLogRepository: RagResourceKnowledgeAuditLogRepository;
  };

export type RagResourceKnowledgeRuntimeOptions = {
  repositories?: RagResourceKnowledgeRuntimeRepositoriesWithAudit;
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
const resourceNotFoundResponse = createErrorResponse(
  ADMIN_CONTENT_KNOWLEDGE_ERROR_CODES.resourceNotFound,
  "Resource does not exist.",
);
const knowledgeNodeNotFoundResponse = createErrorResponse(
  ADMIN_CONTENT_KNOWLEDGE_ERROR_CODES.resourceNotFound,
  "Knowledge node does not exist.",
);
const validationFailedResponse = createErrorResponse(
  ADMIN_CONTENT_KNOWLEDGE_ERROR_CODES.validationFailed,
  "Request validation failed.",
);

function createJsonResponse<TData>(response: ApiResponse<TData>): Response {
  return Response.json(response);
}

async function readRequestJson(request: Request): Promise<unknown> {
  try {
    return await request.json();
  } catch {
    return null;
  }
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

async function resolveAdminActor(
  request: Request,
  sessionService: Pick<SessionService, "getCurrentSession">,
): Promise<ContentAdminActor | null> {
  const sessionResponse = await sessionService.getCurrentSession({
    authorization: request.headers.get("authorization"),
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

function readListQuery(request: Request): AdminContentKnowledgeListQuery {
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
    status: parseContentKnowledgeStatus(searchParams.get("status")),
    profession: parseProfessionFilter(searchParams.get("profession")),
    level: Number.isFinite(level) && level > 0 ? level : null,
    sortBy: ADMIN_CONTENT_KNOWLEDGE_SORT_FIELDS.includes(
      sortBy as AdminContentKnowledgeSortField,
    )
      ? (sortBy as AdminContentKnowledgeSortField)
      : "updatedAt",
    sortOrder: searchParams.get("sortOrder") === "asc" ? "asc" : "desc",
  });
}

function parseContentKnowledgeStatus(
  value: string | null,
): AdminContentKnowledgeStatus {
  return value === "available" ||
    value === "disabled" ||
    value === "draft" ||
    value === "published" ||
    value === "archived" ||
    value === "uploaded" ||
    value === "converting" ||
    value === "conversion_failed" ||
    value === "indexing" ||
    value === "index_failed" ||
    value === "rag_ready" ||
    value === "active"
    ? value
    : "all";
}

function parseProfessionFilter(value: string | null): Profession | "all" {
  return value === "monopoly" || value === "marketing" || value === "logistics"
    ? value
    : "all";
}

function readRequestIp(request: Request): string | null {
  const forwardedFor = request.headers.get("x-forwarded-for");

  if (forwardedFor !== null) {
    return forwardedFor.split(",")[0]?.trim() || null;
  }

  return request.headers.get("x-real-ip");
}

function createDefaultRepositories(): RagResourceKnowledgeRuntimeRepositoriesWithAudit {
  const adminFlowRepositories = createPostgresAdminFlowRuntimeRepositories();

  return {
    ...createPostgresRagResourceKnowledgeRuntimeRepositories(),
    auditLogRepository: adminFlowRepositories.auditLogRepository,
  };
}

async function appendAuditLog(
  repository: RagResourceKnowledgeAuditLogRepository,
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

function createResourceVectorResult(
  resourcePublicId: string,
  resourceStatus: ResourceVectorRebuildResultDto["resourceVector"]["resourceStatus"],
  chunkingResult: ReturnType<typeof buildResourceChunks>,
): ResourceVectorRebuildResultDto {
  return {
    resourceVector: {
      resourcePublicId,
      resourceStatus,
      chunkCount: chunkingResult.chunks.length,
      evidenceSummary: chunkingResult.evidenceSummary,
    },
  };
}

async function rebuildResourceVector(input: {
  resourceRepository: RagResourceRuntimeRepository;
  publicId: string;
}): Promise<ApiResponse<ResourceVectorRebuildResultDto | null>> {
  const resourceForIndexing =
    await input.resourceRepository.findResourceForIndexing(input.publicId);

  if (resourceForIndexing === null) {
    return resourceNotFoundResponse;
  }

  const chunkingResult = buildResourceChunks({
    resourcePublicId: resourceForIndexing.publicId,
    resourceTitle: resourceForIndexing.title,
    resourceStatus: resourceForIndexing.resourceStatus,
    profession: resourceForIndexing.profession,
    level: resourceForIndexing.level,
    markdownContent: resourceForIndexing.markdownContent,
    markdownContentHash: resourceForIndexing.markdownContentHash,
  });

  if (chunkingResult.status === "skipped") {
    await input.resourceRepository.saveResourceIndexingResult({
      resourcePublicId: input.publicId,
      status: "failed",
      chunkCount: 0,
      textHashes: [],
      indexingErrorMessage: chunkingResult.skippedReason,
    });

    return createErrorResponse(
      ADMIN_CONTENT_KNOWLEDGE_ERROR_CODES.validationFailed,
      "Resource is not ready for vector rebuild.",
    );
  }

  const savedResource =
    await input.resourceRepository.saveResourceIndexingResult({
      resourcePublicId: input.publicId,
      status: "success",
      chunkCount: chunkingResult.chunks.length,
      textHashes: chunkingResult.chunks.map((chunk) => chunk.textHash),
      indexingErrorMessage: null,
    });

  return createSuccessResponse(
    createResourceVectorResult(
      resourceForIndexing.publicId,
      savedResource?.resourceStatus ?? "rag_ready",
      chunkingResult,
    ),
  );
}

function mapKnowledgeNodeResult(
  knowledgeNode: Awaited<
    ReturnType<RagKnowledgeNodeRuntimeRepository["createKnowledgeNode"]>
  >,
): { knowledgeNode: AdminKnowledgeNodeOpsSummaryDto } | null {
  return knowledgeNode === null ? null : { knowledgeNode };
}

export function createRagResourceKnowledgeRuntimeRouteHandlers(
  options: RagResourceKnowledgeRuntimeOptions = {},
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
          metadataSummary: "redacted RAG permission denial metadata",
        });
      }

      return adminPermissionDeniedResponse;
    }

    return actor;
  }

  return {
    resources: {
      collection: {
        async GET(request: Request): Promise<Response> {
          const actorOrError = await requireContentAdminActor(request);

          if ("code" in actorOrError) {
            return createJsonResponse(actorOrError);
          }

          void actorOrError;
          const result = await repositories.resourceRepository.listResources(
            readListQuery(request),
          );

          return createJsonResponse(
            createPaginatedResponse(
              { resources: result.resources },
              result.pagination,
            ),
          );
        },
      },
      rebuildVector: {
        async POST(request: Request, context: RouteContext): Promise<Response> {
          const { publicId } = await context.params;
          const actorOrError = await requireContentAdminActor(request, {
            actionType: "resource.rebuild_vector",
            targetResourceType: "resource",
            targetPublicId: publicId,
          });

          if ("code" in actorOrError) {
            return createJsonResponse(actorOrError);
          }

          const response = await rebuildResourceVector({
            resourceRepository: repositories.resourceRepository,
            publicId,
          });

          await appendAuditLog(
            repositories.auditLogRepository,
            request,
            actorOrError,
            {
              actionType: "resource.rebuild_vector",
              targetResourceType: "resource",
              targetPublicId: publicId,
              resultStatus: response.code === 0 ? "success" : "failed",
              metadataSummary: "redacted resource vector rebuild metadata",
            },
          );

          return createJsonResponse(response);
        },
      },
    },
    knowledgeNodes: {
      collection: {
        async GET(request: Request): Promise<Response> {
          const actorOrError = await requireContentAdminActor(request);

          if ("code" in actorOrError) {
            return createJsonResponse(actorOrError);
          }

          void actorOrError;
          const result =
            await repositories.knowledgeNodeRepository.listKnowledgeNodes(
              readListQuery(request),
            );

          return createJsonResponse(
            createPaginatedResponse(
              { knowledgeNodes: result.knowledgeNodes },
              result.pagination,
            ),
          );
        },
        async POST(request: Request): Promise<Response> {
          const actorOrError = await requireContentAdminActor(request, {
            actionType: "knowledge_node.create",
            targetResourceType: "knowledge_node",
            targetPublicId: null,
          });

          if ("code" in actorOrError) {
            return createJsonResponse(actorOrError);
          }

          const mutationInput = parseKnowledgeNodeMutationInput(
            await readRequestJson(request),
          );

          if (mutationInput === null) {
            return createJsonResponse(validationFailedResponse);
          }

          const knowledgeNode =
            await repositories.knowledgeNodeRepository.createKnowledgeNode(
              mutationInput,
            );
          const response =
            knowledgeNode === null
              ? knowledgeNodeNotFoundResponse
              : createSuccessResponse(mapKnowledgeNodeResult(knowledgeNode));

          await appendAuditLog(
            repositories.auditLogRepository,
            request,
            actorOrError,
            {
              actionType: "knowledge_node.create",
              targetResourceType: "knowledge_node",
              targetPublicId: knowledgeNode?.publicId ?? null,
              resultStatus: response.code === 0 ? "success" : "failed",
              metadataSummary: "redacted knowledge_node create metadata",
            },
          );

          return createJsonResponse(response);
        },
      },
      detail: {
        async PATCH(
          request: Request,
          context: RouteContext,
        ): Promise<Response> {
          const { publicId } = await context.params;
          const actorOrError = await requireContentAdminActor(request, {
            actionType: "knowledge_node.update",
            targetResourceType: "knowledge_node",
            targetPublicId: publicId,
          });

          if ("code" in actorOrError) {
            return createJsonResponse(actorOrError);
          }

          const mutationInput = parseKnowledgeNodeUpdateInput(
            await readRequestJson(request),
          );

          if (mutationInput === null) {
            return createJsonResponse(validationFailedResponse);
          }

          const knowledgeNode =
            await repositories.knowledgeNodeRepository.updateKnowledgeNode(
              publicId,
              mutationInput,
            );
          const response =
            knowledgeNode === null
              ? knowledgeNodeNotFoundResponse
              : createSuccessResponse(mapKnowledgeNodeResult(knowledgeNode));

          await appendAuditLog(
            repositories.auditLogRepository,
            request,
            actorOrError,
            {
              actionType: "knowledge_node.update",
              targetResourceType: "knowledge_node",
              targetPublicId: publicId,
              resultStatus: response.code === 0 ? "success" : "failed",
              metadataSummary: "redacted knowledge_node update metadata",
            },
          );

          return createJsonResponse(response);
        },
      },
      disable: {
        async POST(request: Request, context: RouteContext): Promise<Response> {
          const { publicId } = await context.params;
          const actorOrError = await requireContentAdminActor(request, {
            actionType: "knowledge_node.disable",
            targetResourceType: "knowledge_node",
            targetPublicId: publicId,
          });

          if ("code" in actorOrError) {
            return createJsonResponse(actorOrError);
          }

          const knowledgeNode =
            await repositories.knowledgeNodeRepository.disableKnowledgeNode(
              publicId,
            );
          const response =
            knowledgeNode === null
              ? knowledgeNodeNotFoundResponse
              : createSuccessResponse(mapKnowledgeNodeResult(knowledgeNode));

          await appendAuditLog(
            repositories.auditLogRepository,
            request,
            actorOrError,
            {
              actionType: "knowledge_node.disable",
              targetResourceType: "knowledge_node",
              targetPublicId: publicId,
              resultStatus: response.code === 0 ? "success" : "failed",
              metadataSummary: "redacted knowledge_node disable metadata",
            },
          );

          return createJsonResponse(response);
        },
      },
    },
  };
}
