import {
  createErrorResponse,
  createPaginatedResponse,
  createSuccessResponse,
  type ApiPagination,
  type ApiResponse,
} from "../contracts/api-response";
import {
  ADMIN_CONTENT_KNOWLEDGE_ERROR_CODES,
  type AdminContentKnowledgeListQuery,
  type AdminKnowledgeNodeOpsListDto,
  type AdminPaperOpsListDto,
  type AdminQuestionOpsListDto,
  type AdminResourceOpsListDto,
} from "../contracts/admin-content-knowledge-ops-contract";

export type AdminContentKnowledgeOpsRole =
  | "super_admin"
  | "ops_admin"
  | "content_admin";

export type AdminContentKnowledgeOpsActor = {
  publicId: string;
  roles: AdminContentKnowledgeOpsRole[];
};

export type AdminContentKnowledgeOpsServiceContext = {
  actor: AdminContentKnowledgeOpsActor;
};

export type AdminContentKnowledgeApiResponse<TData> = Omit<
  ApiResponse<TData>,
  "pagination"
> & {
  pagination?: ApiPagination | null;
};

export type AdminContentKnowledgeOpsService = {
  listQuestions(
    query: Partial<AdminContentKnowledgeListQuery>,
  ): Promise<AdminContentKnowledgeApiResponse<AdminQuestionOpsListDto | null>>;
  listPapers(
    query: Partial<AdminContentKnowledgeListQuery>,
  ): Promise<AdminContentKnowledgeApiResponse<AdminPaperOpsListDto | null>>;
  listResources(
    query: Partial<AdminContentKnowledgeListQuery>,
  ): Promise<AdminContentKnowledgeApiResponse<AdminResourceOpsListDto | null>>;
  listKnowledgeNodes(
    query: Partial<AdminContentKnowledgeListQuery>,
  ): Promise<
    AdminContentKnowledgeApiResponse<AdminKnowledgeNodeOpsListDto | null>
  >;
  triggerResourceVectorRebuild(publicId: string): Promise<ApiResponse<null>>;
};

const unavailableResponse = {
  code: 503621,
  message: "Admin content and knowledge runtime is not configured.",
  data: null,
  pagination: null,
} as const;

const sampleQuestions: AdminQuestionOpsListDto["questions"] = [
  {
    publicId: "question-public-001",
    stemSummary: "市场调研抽样方法的核心目标是什么？",
    questionType: "single_choice",
    profession: "marketing",
    level: 3,
    subject: "theory",
    status: "available",
    knowledgeNodeNames: ["市场调研"],
    tagNames: ["高频"],
    referencedPaperCount: 4,
    updatedAt: "2026-05-20T08:00:00.000Z",
  },
  {
    publicId: "question-public-002",
    stemSummary: "物流成本核算适用于哪类场景？",
    questionType: "multi_choice",
    profession: "logistics",
    level: 3,
    subject: "skill",
    status: "disabled",
    knowledgeNodeNames: ["物流成本"],
    tagNames: [],
    referencedPaperCount: 1,
    updatedAt: "2026-05-19T08:00:00.000Z",
  },
];

const samplePapers: AdminPaperOpsListDto["papers"] = [
  {
    publicId: "paper-public-001",
    name: "2026 春季营销理论模拟卷",
    profession: "marketing",
    level: 3,
    subject: "theory",
    paperStatus: "published",
    paperType: "mock_paper",
    year: 2026,
    totalScore: "100",
    questionCount: 50,
    mockExamCount: 18,
    sourceFileName: "spring-marketing.pdf",
    publishValidationSummary: "发布校验已通过",
    updatedAt: "2026-05-20T09:00:00.000Z",
  },
];

const sampleResources: AdminResourceOpsListDto["resources"] = [
  {
    publicId: "resource-public-001",
    title: "营销知识库讲义",
    resourceType: "lecture_note",
    resourceStatus: "rag_ready",
    profession: "marketing",
    level: 3,
    originalFileName: "marketing-note.pdf",
    downloadAvailable: true,
    markdownPreviewAvailable: true,
    isVectorStale: false,
    publishedAt: "2026-05-20T10:30:00.000Z",
    indexingErrorSummary: null,
    uploadedAt: "2026-05-20T10:00:00.000Z",
    updatedAt: "2026-05-20T11:00:00.000Z",
  },
];

const sampleKnowledgeNodes: AdminKnowledgeNodeOpsListDto["knowledgeNodes"] = [
  {
    publicId: "knowledge-node-public-001",
    parentKnowledgeNodePublicId: null,
    profession: "marketing",
    levelList: [3],
    name: "市场调研",
    pathName: "营销/市场调研",
    sortOrder: 10,
    knStatus: "active",
    questionCount: 18,
    isRecommendable: true,
    updatedAt: "2026-05-20T12:00:00.000Z",
  },
];

function createPagination(
  query: Partial<AdminContentKnowledgeListQuery>,
  total: number,
): ApiPagination {
  return {
    page: query.page ?? 1,
    pageSize: query.pageSize ?? 20,
    sortBy: query.sortBy ?? "updatedAt",
    sortOrder: query.sortOrder ?? "desc",
    total,
  };
}

function canManageContent(actor: AdminContentKnowledgeOpsActor): boolean {
  return (
    actor.roles.includes("content_admin") || actor.roles.includes("super_admin")
  );
}

export function createAdminContentKnowledgeOpsService({
  actor,
}: AdminContentKnowledgeOpsServiceContext): AdminContentKnowledgeOpsService {
  return {
    async listQuestions(query) {
      return createPaginatedResponse(
        { questions: sampleQuestions },
        createPagination(query, sampleQuestions.length),
      );
    },
    async listPapers(query) {
      return createPaginatedResponse(
        { papers: samplePapers },
        createPagination(query, samplePapers.length),
      );
    },
    async listResources(query) {
      return createPaginatedResponse(
        { resources: sampleResources },
        createPagination(query, sampleResources.length),
      );
    },
    async listKnowledgeNodes(query) {
      return createPaginatedResponse(
        { knowledgeNodes: sampleKnowledgeNodes },
        createPagination(query, sampleKnowledgeNodes.length),
      );
    },
    async triggerResourceVectorRebuild() {
      if (!canManageContent(actor)) {
        return createErrorResponse(
          ADMIN_CONTENT_KNOWLEDGE_ERROR_CODES.adminPermissionDenied,
          "Admin permission denied.",
        );
      }

      return createSuccessResponse(null);
    },
  };
}

export function createUnavailableAdminContentKnowledgeOpsService(): AdminContentKnowledgeOpsService {
  return {
    async listQuestions() {
      return unavailableResponse;
    },
    async listPapers() {
      return unavailableResponse;
    },
    async listResources() {
      return unavailableResponse;
    },
    async listKnowledgeNodes() {
      return unavailableResponse;
    },
    async triggerResourceVectorRebuild() {
      return createErrorResponse(
        unavailableResponse.code,
        unavailableResponse.message,
      );
    },
  };
}
