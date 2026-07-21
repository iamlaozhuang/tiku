import { createLocalSessionRuntime } from "../auth/local-session-runtime";
import { getRequestAuthorization } from "../auth/session-cookie";
import {
  createErrorResponse,
  createPaginatedResponse,
} from "../contracts/api-response";
import { loadCompletePaginatedCollection } from "../../lib/complete-paginated-collection";
import {
  createAdminContentKnowledgeListQuery,
  type AdminContentKnowledgeListQuery,
  type AdminKnowledgeNodeOpsListDto,
  type AdminKnowledgeNodeOpsSummaryDto,
} from "../contracts/admin-content-knowledge-ops-contract";
import {
  createPostgresContentKnowledgeNodeRuntimeRepository,
  type ContentKnowledgeNodeRuntimeRepository,
} from "../repositories/content-knowledge-node-runtime-repository";
import type { SessionService } from "./session-service";

type AiGenerationKnowledgeNodeOptionsRouteOptions = {
  knowledgeNodeRepository?: ContentKnowledgeNodeRuntimeRepository;
  sessionService?: Pick<SessionService, "getCurrentSession">;
};

const aiGenerationKnowledgeNodeSessionRequiredResponse = createErrorResponse(
  401001,
  "Session is required.",
);
const aiGenerationKnowledgeNodePermissionDeniedResponse = createErrorResponse(
  403001,
  "AI generation knowledge-node options permission denied.",
);
const aiGenerationKnowledgeNodeUnavailableResponse = createErrorResponse(
  503621,
  "Knowledge-node options are temporarily unavailable.",
);

function createJsonResponse<TPayload>(payload: TPayload): Response {
  return Response.json(payload);
}

function isAllowedProfession(
  value: string | null,
): value is Exclude<AdminContentKnowledgeListQuery["profession"], "all"> {
  return value === "marketing" || value === "monopoly" || value === "logistics";
}

function readRequestedLevel(request: Request): number | null {
  const value = new URL(request.url).searchParams.get("level");
  const parsedValue = Number(value);

  return Number.isInteger(parsedValue) && parsedValue >= 1 && parsedValue <= 5
    ? parsedValue
    : null;
}

function readRequestedProfession(
  request: Request,
): AdminContentKnowledgeListQuery["profession"] {
  const profession = new URL(request.url).searchParams.get("profession");

  return isAllowedProfession(profession) ? profession : "all";
}

function canReadAiGenerationKnowledgeNodeOptions(
  sessionResponse: Awaited<ReturnType<SessionService["getCurrentSession"]>>,
): boolean {
  if (sessionResponse.code !== 0 || sessionResponse.data === null) {
    return false;
  }

  const user = sessionResponse.data.user;
  const adminRoles = user.adminRoles ?? [];

  if (user.userType === "personal" || user.userType === "employee") {
    return true;
  }

  return adminRoles.some(
    (role) =>
      role === "super_admin" ||
      role === "content_admin" ||
      role === "org_advanced_admin",
  );
}

function isKnowledgeNodeSelectableForAi(
  knowledgeNode: AdminKnowledgeNodeOpsSummaryDto,
  level: number | null,
): boolean {
  if (knowledgeNode.knStatus !== "active" || !knowledgeNode.isRecommendable) {
    return false;
  }

  return (
    level === null ||
    knowledgeNode.levelList.length === 0 ||
    knowledgeNode.levelList.includes(level)
  );
}

export function createAiGenerationKnowledgeNodeOptionsRouteHandlers(
  options: AiGenerationKnowledgeNodeOptionsRouteOptions = {},
) {
  const sessionService = options.sessionService ?? createLocalSessionRuntime();
  const knowledgeNodeRepository =
    options.knowledgeNodeRepository ??
    createPostgresContentKnowledgeNodeRuntimeRepository();

  return {
    collection: {
      async GET(request: Request): Promise<Response> {
        const sessionResponse = await sessionService.getCurrentSession({
          authorization: getRequestAuthorization(request),
        });

        if (sessionResponse.code !== 0 || sessionResponse.data === null) {
          return createJsonResponse(
            aiGenerationKnowledgeNodeSessionRequiredResponse,
          );
        }

        if (!canReadAiGenerationKnowledgeNodeOptions(sessionResponse)) {
          return createJsonResponse(
            aiGenerationKnowledgeNodePermissionDeniedResponse,
          );
        }

        const level = readRequestedLevel(request);
        const profession = readRequestedProfession(request);

        try {
          const allKnowledgeNodes =
            await loadCompletePaginatedCollection<AdminKnowledgeNodeOpsSummaryDto>(
              {
                expectedPageSize: 100,
                getItemKey: (knowledgeNode) => knowledgeNode.publicId,
                loadPage: async (page) => {
                  const result =
                    await knowledgeNodeRepository.listKnowledgeNodes(
                      createAdminContentKnowledgeListQuery({
                        page,
                        pageSize: 100,
                        profession,
                        sortBy: "sortOrder",
                        sortOrder: "asc",
                        status: "active",
                      }),
                    );

                  return {
                    items: result.knowledgeNodes,
                    pagination: result.pagination,
                  };
                },
              },
            );
          const knowledgeNodes = allKnowledgeNodes.filter((knowledgeNode) =>
            isKnowledgeNodeSelectableForAi(knowledgeNode, level),
          );

          return createJsonResponse(
            createPaginatedResponse<AdminKnowledgeNodeOpsListDto>(
              { knowledgeNodes },
              {
                page: 1,
                pageSize: 100,
                sortBy: "sortOrder",
                sortOrder: "asc",
                total: knowledgeNodes.length,
              },
            ),
          );
        } catch {
          return createJsonResponse(
            aiGenerationKnowledgeNodeUnavailableResponse,
          );
        }
      },
    },
  };
}
