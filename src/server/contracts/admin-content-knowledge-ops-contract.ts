import type { KnStatus, ResourceStatus, ResourceType } from "../models/ai-rag";
import type {
  PaperStatus,
  PaperType,
  Profession,
  QuestionStatus,
  QuestionType,
  Subject,
} from "../models/paper";

export const ADMIN_CONTENT_KNOWLEDGE_PAGE_SIZE_OPTIONS = [20, 50, 100] as const;

export const ADMIN_CONTENT_KNOWLEDGE_SORT_FIELDS = [
  "updatedAt",
  "createdAt",
  "publishedAt",
  "sortOrder",
] as const;

export const ADMIN_CONTENT_KNOWLEDGE_ERROR_CODES = {
  adminPermissionDenied: 403621,
  resourceNotFound: 404621,
  concurrentConflict: 409621,
  validationFailed: 422621,
} as const;

export type AdminContentKnowledgePageSize =
  (typeof ADMIN_CONTENT_KNOWLEDGE_PAGE_SIZE_OPTIONS)[number];

export type AdminContentKnowledgeSortField =
  (typeof ADMIN_CONTENT_KNOWLEDGE_SORT_FIELDS)[number];

export type AdminContentKnowledgeSortOrder = "asc" | "desc";

export type AdminContentKnowledgeStatus =
  | QuestionStatus
  | PaperStatus
  | ResourceStatus
  | KnStatus
  | "all";

export type AdminContentKnowledgeListQuery = {
  page: number;
  pageSize: AdminContentKnowledgePageSize;
  sortBy: AdminContentKnowledgeSortField;
  sortOrder: AdminContentKnowledgeSortOrder;
  keyword: string | null;
  status: AdminContentKnowledgeStatus;
  profession: Profession | "all";
  level: number | null;
};

export type AdminQuestionOpsSummaryDto = {
  publicId: string;
  stemSummary: string;
  questionType: QuestionType;
  profession: Profession;
  level: number;
  subject: Subject;
  status: QuestionStatus;
  knowledgeNodeNames: string[];
  tagNames: string[];
  referencedPaperCount: number;
  updatedAt: string;
};

export type AdminQuestionOpsListDto = {
  questions: AdminQuestionOpsSummaryDto[];
};

export type AdminPaperQuestionTypeDistributionDto = {
  questionType: QuestionType;
  count: number;
};

export type AdminPaperOpsSummaryDto = {
  publicId: string;
  name: string;
  profession: Profession;
  level: number;
  subject: Subject;
  paperStatus: PaperStatus;
  paperType: PaperType;
  year: number | null;
  totalScore: string;
  questionCount: number;
  questionTypeDistribution: AdminPaperQuestionTypeDistributionDto[];
  mockExamCount: number;
  sourceFileName: string | null;
  publishValidationSummary: string | null;
  updatedAt: string;
};

export type AdminPaperOpsListDto = {
  papers: AdminPaperOpsSummaryDto[];
};

export type AdminResourceOpsSummaryDto = {
  publicId: string;
  title: string;
  resourceType: ResourceType;
  resourceStatus: ResourceStatus;
  profession: Profession;
  level: number | null;
  originalFileName: string | null;
  downloadAvailable: boolean;
  markdownPreviewAvailable: boolean;
  isVectorStale: boolean;
  publishedAt: string | null;
  indexingErrorSummary: string | null;
  uploadedAt: string;
  updatedAt: string;
};

export type AdminResourceOpsListDto = {
  resources: AdminResourceOpsSummaryDto[];
};

export type AdminKnowledgeNodeOpsSummaryDto = {
  publicId: string;
  parentKnowledgeNodePublicId: string | null;
  profession: Profession;
  levelList: number[];
  name: string;
  pathName: string;
  sortOrder: number;
  knStatus: KnStatus;
  questionCount: number;
  isRecommendable: boolean;
  updatedAt: string;
};

export type AdminKnowledgeNodeOpsListDto = {
  knowledgeNodes: AdminKnowledgeNodeOpsSummaryDto[];
};

export function createAdminContentKnowledgeListQuery(
  overrides: Partial<AdminContentKnowledgeListQuery> = {},
): AdminContentKnowledgeListQuery {
  const { keyword, ...queryOverrides } = overrides;

  return {
    page: 1,
    pageSize: 20,
    sortBy: "updatedAt",
    sortOrder: "desc",
    status: "all",
    profession: "all",
    level: null,
    ...queryOverrides,
    keyword: typeof keyword === "string" ? normalizeKeyword(keyword) : null,
  };
}

function normalizeKeyword(value: string): string | null {
  const keyword = value.trim();

  return keyword.length === 0 ? null : keyword;
}
