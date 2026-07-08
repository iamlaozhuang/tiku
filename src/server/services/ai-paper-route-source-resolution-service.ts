import type {
  AiPaperAssemblyRole,
  AiPaperSelectableQuestionDto,
} from "../contracts/ai-paper-plan-and-select-contract";
import type { OrganizationTrainingPublishedVersionDto } from "../contracts/organization-training-contract";
import type { AiGenerationRouteIntegratedGenerationParameters } from "../contracts/route-integrated-provider-execution-contract";
import type { OrganizationTrainingRepository } from "../repositories/organization-training-repository";
import type {
  QuestionAccessRow,
  QuestionRepository,
} from "../repositories/question-repository";
import type { NormalizedQuestionListInput } from "../validators/question";
import {
  mapOrganizationTrainingVersionsToAiPaperEnterpriseQuestions,
  mapPlatformQuestionRowsToAiPaperQuestions,
} from "./ai-paper-source-adapter-service";

export const AI_PAPER_SOURCE_RESOLUTION_PLATFORM_PAGE_SIZE = 100;

export type AiPaperRouteSourceResolutionFailureCategory =
  | "missing_organization_context"
  | "missing_employee_context"
  | "missing_enterprise_source_repository";

export type AiPaperRouteSourceResolutionEnterpriseSourceStatus =
  | "not_applicable"
  | "resolved"
  | "not_resolved";

export type AiPaperRouteSourceResolutionDiagnostics = {
  role: AiPaperAssemblyRole;
  platformQuestionCount: number;
  enterpriseQuestionCount: number;
  enterpriseSourceStatus: AiPaperRouteSourceResolutionEnterpriseSourceStatus;
};

export type AiPaperRouteSourceResolutionInput = {
  role: AiPaperAssemblyRole;
  organizationPublicId: string | null;
  employeePublicId?: string | null;
  generationParameters: AiGenerationRouteIntegratedGenerationParameters;
  questionRepository: Pick<QuestionRepository, "listQuestions">;
  organizationTrainingRepository?: Pick<
    OrganizationTrainingRepository,
    "listAdminLifecycleVersions" | "listEmployeeVisibleVersions"
  >;
  knowledgeNodeParentPublicIdsByPublicId?: Readonly<
    Record<string, string | null>
  >;
  difficultyByQuestionPublicId?: Readonly<Record<string, string | null>>;
  platformPageSize?: number;
};

export type AiPaperRouteSourceResolutionResult =
  | {
      status: "resolved";
      platformQuestions: AiPaperSelectableQuestionDto[];
      enterpriseQuestions: AiPaperSelectableQuestionDto[];
      rejection: null;
      diagnostics: AiPaperRouteSourceResolutionDiagnostics;
    }
  | {
      status: "rejected";
      platformQuestions: [];
      enterpriseQuestions: [];
      rejection: {
        failureCategory: AiPaperRouteSourceResolutionFailureCategory;
      };
      diagnostics: AiPaperRouteSourceResolutionDiagnostics;
    };

export async function resolveAiPaperRouteQuestionSources(
  input: AiPaperRouteSourceResolutionInput,
): Promise<AiPaperRouteSourceResolutionResult> {
  const roleContextRejection = validateRoleSourceContext(input);

  if (roleContextRejection !== null) {
    return createRejectedSourceResolutionResult(
      input.role,
      roleContextRejection,
    );
  }

  const platformQuestionListResult = await listPlatformQuestionRows(input);
  const platformQuestions = mapPlatformQuestionRowsToAiPaperQuestions({
    questionRows: filterQuestionRowsBySelectedKnowledgeScope(
      platformQuestionListResult,
      input,
    ),
    knowledgeNodeParentPublicIdsByPublicId:
      input.knowledgeNodeParentPublicIdsByPublicId,
    difficultyByQuestionPublicId: input.difficultyByQuestionPublicId,
  });

  if (!requiresEnterpriseSource(input.role)) {
    return createResolvedSourceResolutionResult({
      role: input.role,
      platformQuestions,
      enterpriseQuestions: [],
      enterpriseSourceStatus: "not_applicable",
    });
  }

  const organizationPublicId = input.organizationPublicId as string;
  const enterpriseTrainingVersions = await listEnterpriseTrainingVersions(
    input,
    organizationPublicId,
  );
  const enterpriseQuestions =
    mapOrganizationTrainingVersionsToAiPaperEnterpriseQuestions({
      organizationPublicId,
      trainingVersions: enterpriseTrainingVersions,
    });

  return createResolvedSourceResolutionResult({
    role: input.role,
    platformQuestions,
    enterpriseQuestions,
    enterpriseSourceStatus: "resolved",
  });
}

async function listPlatformQuestionRows(
  input: AiPaperRouteSourceResolutionInput,
): Promise<QuestionAccessRow[]> {
  const queries = createPlatformFormalQuestionQueries(input);
  const rows = await Promise.all(
    queries.map(async (query) => {
      const result = await input.questionRepository.listQuestions(query);

      return result.rows;
    }),
  );

  return dedupeQuestionRowsByPublicId(rows.flat());
}

function createPlatformFormalQuestionQueries(
  input: AiPaperRouteSourceResolutionInput,
): NormalizedQuestionListInput[] {
  const selectedKnowledgeNodePublicIds =
    getSelectedKnowledgeNodePublicIds(input);
  const baseQuery: NormalizedQuestionListInput = {
    page: 1,
    pageSize: normalizePlatformPageSize(input.platformPageSize),
    sortBy: "updatedAt",
    sortOrder: "desc",
    profession: input.generationParameters.profession,
    level: input.generationParameters.level,
    subject: input.generationParameters.subject,
    questionType: null,
    status: "available",
    keyword: null,
    knowledgeNodePublicId: null,
    tagPublicId: null,
  };

  if (selectedKnowledgeNodePublicIds.length === 0) {
    return [baseQuery];
  }

  if (input.generationParameters.includeDescendants) {
    return [baseQuery];
  }

  return selectedKnowledgeNodePublicIds.map((knowledgeNodePublicId) => ({
    ...baseQuery,
    knowledgeNodePublicId,
  }));
}

function filterQuestionRowsBySelectedKnowledgeScope(
  questionRows: readonly QuestionAccessRow[],
  input: AiPaperRouteSourceResolutionInput,
): QuestionAccessRow[] {
  const selectedKnowledgeNodePublicIds =
    getSelectedKnowledgeNodePublicIds(input);

  if (selectedKnowledgeNodePublicIds.length === 0) {
    return [...questionRows];
  }

  const selectedKnowledgeNodePublicIdSet = new Set(
    selectedKnowledgeNodePublicIds,
  );

  return questionRows.filter((questionRow) =>
    questionRow.knowledge_node_public_ids.some((knowledgeNodePublicId) =>
      isWithinSelectedKnowledgeScope({
        includeDescendants: input.generationParameters.includeDescendants,
        knowledgeNodeParentPublicIdsByPublicId:
          input.knowledgeNodeParentPublicIdsByPublicId ?? {},
        knowledgeNodePublicId,
        selectedKnowledgeNodePublicIdSet,
      }),
    ),
  );
}

function getSelectedKnowledgeNodePublicIds(
  input: AiPaperRouteSourceResolutionInput,
): string[] {
  return input.generationParameters.knowledgeNodeMode === "selected"
    ? [...input.generationParameters.knowledgeNodePublicIds]
    : [];
}

function isWithinSelectedKnowledgeScope(input: {
  includeDescendants: boolean;
  knowledgeNodeParentPublicIdsByPublicId: Readonly<
    Record<string, string | null>
  >;
  knowledgeNodePublicId: string;
  selectedKnowledgeNodePublicIdSet: ReadonlySet<string>;
}): boolean {
  if (input.selectedKnowledgeNodePublicIdSet.has(input.knowledgeNodePublicId)) {
    return true;
  }

  if (!input.includeDescendants) {
    return false;
  }

  const visitedPublicIds = new Set<string>();
  let currentPublicId: string | null =
    input.knowledgeNodeParentPublicIdsByPublicId[input.knowledgeNodePublicId] ??
    null;

  while (currentPublicId !== null && !visitedPublicIds.has(currentPublicId)) {
    if (input.selectedKnowledgeNodePublicIdSet.has(currentPublicId)) {
      return true;
    }

    visitedPublicIds.add(currentPublicId);
    currentPublicId =
      input.knowledgeNodeParentPublicIdsByPublicId[currentPublicId] ?? null;
  }

  return false;
}

function dedupeQuestionRowsByPublicId(
  questionRows: readonly QuestionAccessRow[],
): QuestionAccessRow[] {
  const seenPublicIds = new Set<string>();

  return questionRows.filter((questionRow) => {
    if (seenPublicIds.has(questionRow.public_id)) {
      return false;
    }

    seenPublicIds.add(questionRow.public_id);
    return true;
  });
}

async function listEnterpriseTrainingVersions(
  input: AiPaperRouteSourceResolutionInput,
  organizationPublicId: string,
): Promise<OrganizationTrainingPublishedVersionDto[]> {
  const organizationTrainingRepository = input.organizationTrainingRepository;

  if (organizationTrainingRepository === undefined) {
    return [];
  }

  if (input.role === "org_advanced_admin") {
    return organizationTrainingRepository.listAdminLifecycleVersions({
      visibleOrganizationPublicIds: [organizationPublicId],
    });
  }

  if (input.role === "org_advanced_employee") {
    return organizationTrainingRepository.listEmployeeVisibleVersions({
      employeePublicId: input.employeePublicId as string,
      organizationPublicId,
    });
  }

  return [];
}

function validateRoleSourceContext(
  input: AiPaperRouteSourceResolutionInput,
): AiPaperRouteSourceResolutionFailureCategory | null {
  if (!requiresEnterpriseSource(input.role)) {
    return null;
  }

  if (!isPresentPublicId(input.organizationPublicId)) {
    return "missing_organization_context";
  }

  if (input.organizationTrainingRepository === undefined) {
    return "missing_enterprise_source_repository";
  }

  if (
    input.role === "org_advanced_employee" &&
    !isPresentPublicId(input.employeePublicId ?? null)
  ) {
    return "missing_employee_context";
  }

  return null;
}

function requiresEnterpriseSource(role: AiPaperAssemblyRole): boolean {
  return role === "org_advanced_admin" || role === "org_advanced_employee";
}

function isPresentPublicId(publicId: string | null): boolean {
  return publicId !== null && publicId.trim().length > 0;
}

function normalizePlatformPageSize(pageSize: number | undefined): number {
  return pageSize !== undefined &&
    Number.isInteger(pageSize) &&
    pageSize > 0 &&
    pageSize <= AI_PAPER_SOURCE_RESOLUTION_PLATFORM_PAGE_SIZE
    ? pageSize
    : AI_PAPER_SOURCE_RESOLUTION_PLATFORM_PAGE_SIZE;
}

function createResolvedSourceResolutionResult(input: {
  role: AiPaperAssemblyRole;
  platformQuestions: AiPaperSelectableQuestionDto[];
  enterpriseQuestions: AiPaperSelectableQuestionDto[];
  enterpriseSourceStatus: Exclude<
    AiPaperRouteSourceResolutionEnterpriseSourceStatus,
    "not_resolved"
  >;
}): AiPaperRouteSourceResolutionResult {
  return {
    status: "resolved",
    platformQuestions: input.platformQuestions,
    enterpriseQuestions: input.enterpriseQuestions,
    rejection: null,
    diagnostics: {
      role: input.role,
      platformQuestionCount: input.platformQuestions.length,
      enterpriseQuestionCount: input.enterpriseQuestions.length,
      enterpriseSourceStatus: input.enterpriseSourceStatus,
    },
  };
}

function createRejectedSourceResolutionResult(
  role: AiPaperAssemblyRole,
  failureCategory: AiPaperRouteSourceResolutionFailureCategory,
): AiPaperRouteSourceResolutionResult {
  return {
    status: "rejected",
    platformQuestions: [],
    enterpriseQuestions: [],
    rejection: {
      failureCategory,
    },
    diagnostics: {
      role,
      platformQuestionCount: 0,
      enterpriseQuestionCount: 0,
      enterpriseSourceStatus: "not_resolved",
    },
  };
}
