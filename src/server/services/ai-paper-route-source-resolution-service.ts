import type {
  AiPaperAssemblyRole,
  AiPaperSelectableQuestionDto,
} from "../contracts/ai-paper-plan-and-select-contract";
import type { OrganizationTrainingPublishedVersionDto } from "../contracts/organization-training-contract";
import type { OrganizationTrainingQuestionSnapshotValue } from "@/db/schema";
import type { PersonalAiGenerationPaperQuestionSourceDto } from "../contracts/personal-ai-generation-result-persistence-contract";
import type { AiGenerationRouteIntegratedGenerationParameters } from "../contracts/route-integrated-provider-execution-contract";
import type { OrganizationTrainingRepository } from "../repositories/organization-training-repository";
import type {
  AiPaperQuestionSourceRepository,
  QuestionAccessRow,
} from "../repositories/question-repository";
import {
  mapOrganizationTrainingVersionsToAiPaperEnterpriseQuestions,
  mapPlatformQuestionRowsToAiPaperQuestions,
} from "./ai-paper-source-adapter-service";

export type AiPaperRouteSourceResolutionFailureCategory =
  | "missing_organization_context"
  | "missing_employee_context"
  | "missing_enterprise_source_repository"
  | "private_source_integrity_unavailable";

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
  questionRepository: AiPaperQuestionSourceRepository;
  organizationTrainingRepository?: Pick<
    OrganizationTrainingRepository,
    "listAdminLifecycleVersions" | "listEmployeeVisibleVersions"
  > &
    Partial<
      Pick<OrganizationTrainingRepository, "findCanonicalQuestionsByVersion">
    >;
};

export type AiPaperRouteSourceResolutionResult =
  | {
      status: "resolved";
      platformQuestions: AiPaperSelectableQuestionDto[];
      enterpriseQuestions: AiPaperSelectableQuestionDto[];
      privateSourceQuestions?:
        | PersonalAiGenerationPaperQuestionSourceDto[]
        | null;
      rejection: null;
      diagnostics: AiPaperRouteSourceResolutionDiagnostics;
    }
  | {
      status: "rejected";
      platformQuestions: [];
      enterpriseQuestions: [];
      privateSourceQuestions?: [];
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
  const scopedPlatformQuestionRows = filterQuestionRowsBySelectedKnowledgeScope(
    platformQuestionListResult,
    input,
  );
  const platformQuestionRows = requireUniquePlatformQuestionRows(
    scopedPlatformQuestionRows,
  );

  if (platformQuestionRows === null) {
    return createRejectedSourceResolutionResult(
      input.role,
      "private_source_integrity_unavailable",
    );
  }
  const platformQuestions = mapPlatformQuestionRowsToAiPaperQuestions({
    questionRows: platformQuestionRows,
  });
  const privatePlatformQuestions = mapPlatformRowsToPrivateSourceQuestions({
    questionRows: platformQuestionRows,
    selectableQuestions: platformQuestions,
  });

  if (privatePlatformQuestions === null) {
    return createRejectedSourceResolutionResult(
      input.role,
      "private_source_integrity_unavailable",
    );
  }

  if (!requiresEnterpriseSource(input.role)) {
    return createResolvedSourceResolutionResult({
      role: input.role,
      platformQuestions,
      enterpriseQuestions: [],
      privateSourceQuestions: privatePlatformQuestions,
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
  const privateEnterpriseQuestions =
    input.organizationTrainingRepository?.findCanonicalQuestionsByVersion ===
    undefined
      ? null
      : await mapEnterpriseVersionsToPrivateSourceQuestions({
          trainingVersions: enterpriseTrainingVersions,
          selectableQuestions: enterpriseQuestions,
          findCanonicalQuestionsByVersion:
            input.organizationTrainingRepository
              .findCanonicalQuestionsByVersion,
        });

  if (
    input.organizationTrainingRepository?.findCanonicalQuestionsByVersion !==
      undefined &&
    privateEnterpriseQuestions === null
  ) {
    return createRejectedSourceResolutionResult(
      input.role,
      "private_source_integrity_unavailable",
    );
  }

  return createResolvedSourceResolutionResult({
    role: input.role,
    platformQuestions,
    enterpriseQuestions,
    privateSourceQuestions:
      privateEnterpriseQuestions === null
        ? null
        : [...privatePlatformQuestions, ...privateEnterpriseQuestions],
    enterpriseSourceStatus: "resolved",
  });
}

async function listPlatformQuestionRows(
  input: AiPaperRouteSourceResolutionInput,
): Promise<QuestionAccessRow[]> {
  const selectedKnowledgeNodePublicIds =
    getSelectedKnowledgeNodePublicIds(input);
  const rows =
    await input.questionRepository.listAvailableAiPaperSourceQuestions({
      profession: input.generationParameters.profession,
      level: input.generationParameters.level,
      subject: input.generationParameters.subject,
      knowledgeNodePublicIds:
        selectedKnowledgeNodePublicIds.length > 0 &&
        !input.generationParameters.includeDescendants
          ? selectedKnowledgeNodePublicIds
          : null,
      questionPublicIds: null,
    });

  return rows;
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
        knowledgeNodePublicId,
        ancestorKnowledgeNodePublicIds:
          questionRow.ancestor_knowledge_node_public_ids ?? [],
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
  knowledgeNodePublicId: string;
  ancestorKnowledgeNodePublicIds: readonly string[];
  selectedKnowledgeNodePublicIdSet: ReadonlySet<string>;
}): boolean {
  if (input.selectedKnowledgeNodePublicIdSet.has(input.knowledgeNodePublicId)) {
    return true;
  }

  if (!input.includeDescendants) {
    return false;
  }

  return input.ancestorKnowledgeNodePublicIds.some((ancestorPublicId) =>
    input.selectedKnowledgeNodePublicIdSet.has(ancestorPublicId),
  );
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

function mapPlatformRowsToPrivateSourceQuestions(input: {
  questionRows: readonly QuestionAccessRow[];
  selectableQuestions: readonly AiPaperSelectableQuestionDto[];
}): PersonalAiGenerationPaperQuestionSourceDto[] | null {
  const selectableByPublicId = new Map(
    input.selectableQuestions.map((question) => [question.publicId, question]),
  );
  const result: PersonalAiGenerationPaperQuestionSourceDto[] = [];

  for (const row of input.questionRows) {
    const selectable = selectableByPublicId.get(row.public_id);

    if (row.status !== "available") {
      continue;
    }

    if (
      selectable === undefined ||
      selectable.sourceKind !== "platform_formal_question" ||
      !Number.isFinite(row.updated_at.getTime())
    ) {
      return null;
    }

    result.push({
      questionPublicId: row.public_id,
      sourceKind: "platform_formal_question",
      sourceVersion: {
        kind: "platform_question_updated_at",
        updatedAt: row.updated_at.toISOString(),
      },
      profession: row.profession,
      level: row.level,
      subject: row.subject,
      questionType: row.question_type,
      difficulty: row.difficulty ?? null,
      knowledgeNodePublicIds: [...row.knowledge_node_public_ids],
      parentKnowledgeNodePublicIds: [
        ...(row.parent_knowledge_node_public_ids ?? []),
      ],
      ancestorKnowledgeNodePublicIds: [
        ...(row.ancestor_knowledge_node_public_ids ?? []),
      ],
      questionStem: row.stem_rich_text,
      questionOptions: row.question_options.map((questionOption) => ({
        optionLabel: questionOption.label,
        optionText: questionOption.content_rich_text,
        isCorrect: questionOption.is_correct,
      })),
      standardAnswerLabels: row.question_options
        .filter((questionOption) => questionOption.is_correct)
        .map((questionOption) => questionOption.label),
      standardAnswerText: normalizeNullableText(row.standard_answer_rich_text),
      analysis: normalizeNullableText(row.analysis_rich_text),
      scoringPoints: row.scoring_points.map((scoringPoint) => ({
        description: scoringPoint.description,
        score: scoringPoint.score,
        sortOrder: scoringPoint.sort_order,
      })),
      fillBlankAnswers: (row.fill_blank_answers ?? []).map((answer) => ({
        blankKey: answer.blankKey,
        standardAnswers: [...answer.standardAnswers],
        score: answer.score,
        sortOrder: answer.sortOrder,
      })),
      questionGroup: copyQuestionGroup(selectable.questionGroup ?? null),
    });
  }

  return result;
}

function requireUniquePlatformQuestionRows(
  rows: readonly QuestionAccessRow[],
): QuestionAccessRow[] | null {
  const byPublicId = new Map<string, QuestionAccessRow>();

  for (const row of rows) {
    const existing = byPublicId.get(row.public_id);

    if (existing !== undefined) {
      return null;
    }

    byPublicId.set(row.public_id, row);
  }

  return [...byPublicId.values()];
}

async function mapEnterpriseVersionsToPrivateSourceQuestions(input: {
  trainingVersions: readonly OrganizationTrainingPublishedVersionDto[];
  selectableQuestions: readonly AiPaperSelectableQuestionDto[];
  findCanonicalQuestionsByVersion: OrganizationTrainingRepository["findCanonicalQuestionsByVersion"];
}): Promise<PersonalAiGenerationPaperQuestionSourceDto[] | null> {
  const result: PersonalAiGenerationPaperQuestionSourceDto[] = [];

  for (const trainingVersion of input.trainingVersions) {
    const canonicalQuestions = await input.findCanonicalQuestionsByVersion({
      trainingVersionPublicId: trainingVersion.publicId,
    });
    const publicQuestionsByPublicId = new Map(
      (trainingVersion.questions ?? []).map((question) => [
        question.publicId,
        question,
      ]),
    );
    const versionSelectableQuestions =
      mapOrganizationTrainingVersionsToAiPaperEnterpriseQuestions({
        organizationPublicId: trainingVersion.organizationPublicId,
        trainingVersions: [trainingVersion],
      });
    const selectableByPublicId = new Map(
      versionSelectableQuestions.map((question) => [
        question.publicId,
        question,
      ]),
    );

    if (
      canonicalQuestions.length !== publicQuestionsByPublicId.size ||
      versionSelectableQuestions.length !== publicQuestionsByPublicId.size
    ) {
      return null;
    }

    for (const canonicalQuestion of canonicalQuestions) {
      const publicQuestion = publicQuestionsByPublicId.get(
        canonicalQuestion.publicId,
      );
      const selectable = selectableByPublicId.get(canonicalQuestion.publicId);

      if (publicQuestion === undefined || selectable === undefined) {
        return null;
      }

      const mapped = mapEnterpriseQuestionToPrivateSource({
        canonicalQuestion,
        publicQuestion,
        selectable,
        trainingVersion,
      });

      if (mapped === null) {
        return null;
      }

      result.push(mapped);
    }
  }

  return result.length === input.selectableQuestions.length ? result : null;
}

function mapEnterpriseQuestionToPrivateSource(input: {
  canonicalQuestion: OrganizationTrainingQuestionSnapshotValue;
  publicQuestion: NonNullable<
    OrganizationTrainingPublishedVersionDto["questions"]
  >[number];
  selectable: AiPaperSelectableQuestionDto;
  trainingVersion: OrganizationTrainingPublishedVersionDto;
}): PersonalAiGenerationPaperQuestionSourceDto | null {
  if (
    !enterpriseCanonicalQuestionMatchesPublishedQuestion(
      input.canonicalQuestion,
      input.publicQuestion,
    )
  ) {
    return null;
  }

  const standardAnswerLabels = extractAnswerLabels(
    input.canonicalQuestion.standardAnswer,
    input.canonicalQuestion.questionType,
    input.canonicalQuestion.options.map(
      (questionOption) => questionOption.label,
    ),
  );

  if (standardAnswerLabels === null) {
    return null;
  }

  return {
    questionPublicId: input.canonicalQuestion.publicId,
    sourceKind: "enterprise_training_snapshot",
    sourceVersion: {
      kind: "organization_training_version",
      trainingVersionPublicId: input.trainingVersion.publicId,
      trainingVersionNumber: input.trainingVersion.versionNumber,
      publishedAt: input.trainingVersion.publishedAt,
    },
    profession: input.trainingVersion.profession,
    level: input.trainingVersion.level,
    subject: input.trainingVersion.subject,
    questionType: input.canonicalQuestion.questionType,
    difficulty: input.publicQuestion.difficulty ?? null,
    knowledgeNodePublicIds: [
      ...(input.publicQuestion.knowledgeNodePublicIds ?? []),
    ],
    parentKnowledgeNodePublicIds: [
      ...(input.publicQuestion.parentKnowledgeNodePublicIds ?? []),
    ],
    ancestorKnowledgeNodePublicIds: [
      ...(input.publicQuestion.ancestorKnowledgeNodePublicIds ?? []),
    ],
    questionStem: input.canonicalQuestion.stem,
    questionOptions: input.canonicalQuestion.options.map((questionOption) => ({
      optionLabel: questionOption.label,
      optionText: questionOption.content,
      isCorrect: standardAnswerLabels.includes(questionOption.label),
    })),
    standardAnswerLabels,
    standardAnswerText: normalizeNullableText(
      input.canonicalQuestion.standardAnswer,
    ),
    analysis: normalizeNullableText(input.canonicalQuestion.analysisSummary),
    scoringPoints: (input.canonicalQuestion.scoringPoints ?? []).map(
      (scoringPoint) => ({
        description: scoringPoint.description,
        score: String(scoringPoint.score),
        sortOrder: scoringPoint.sortOrder,
      }),
    ),
    fillBlankAnswers: (input.canonicalQuestion.fillBlankAnswers ?? []).map(
      (answer) => ({
        blankKey: answer.blankKey,
        standardAnswers: [...answer.standardAnswers],
        score: String(answer.score),
        sortOrder: answer.sortOrder,
      }),
    ),
    questionGroup: copyQuestionGroup(input.selectable.questionGroup ?? null),
  };
}

function enterpriseCanonicalQuestionMatchesPublishedQuestion(
  canonicalQuestion: OrganizationTrainingQuestionSnapshotValue,
  publicQuestion: NonNullable<
    OrganizationTrainingPublishedVersionDto["questions"]
  >[number],
): boolean {
  return (
    canonicalQuestion.publicId === publicQuestion.publicId &&
    canonicalQuestion.sequenceNumber === publicQuestion.sequenceNumber &&
    canonicalQuestion.questionType === publicQuestion.questionType &&
    canonicalQuestion.materialTitle === publicQuestion.materialTitle &&
    canonicalQuestion.materialContent === publicQuestion.materialContent &&
    canonicalQuestion.stem === publicQuestion.stem &&
    canonicalQuestion.score === publicQuestion.score &&
    JSON.stringify(
      canonicalQuestion.options.map((questionOption) => ({
        publicId: questionOption.publicId,
        label: questionOption.label,
        content: questionOption.content,
      })),
    ) === JSON.stringify(publicQuestion.options)
  );
}

function copyQuestionGroup(
  questionGroup: AiPaperSelectableQuestionDto["questionGroup"],
): PersonalAiGenerationPaperQuestionSourceDto["questionGroup"] {
  return questionGroup == null
    ? null
    : {
        publicId: questionGroup.publicId,
        title: questionGroup.title,
        materialSnapshot: { ...questionGroup.materialSnapshot },
        memberQuestionPublicIds: [...questionGroup.memberQuestionPublicIds],
        questionSortOrder: questionGroup.questionSortOrder,
      };
}

function extractAnswerLabels(
  answerText: string,
  questionType: OrganizationTrainingQuestionSnapshotValue["questionType"],
  optionLabels: readonly string[],
): string[] | null {
  if (questionType !== "single_choice" && questionType !== "multi_choice") {
    return [];
  }

  const normalizedLabels = answerText
    .split(/[\s,，、;；]+/u)
    .filter(Boolean)
    .map((label) => label.toUpperCase());

  return normalizedLabels.length > 0 &&
    new Set(normalizedLabels).size === normalizedLabels.length &&
    normalizedLabels.every((label) => optionLabels.includes(label))
    ? normalizedLabels
    : null;
}

function normalizeNullableText(value: string): string | null {
  const normalized = value.trim();

  return normalized.length === 0 ? null : normalized;
}

function createResolvedSourceResolutionResult(input: {
  role: AiPaperAssemblyRole;
  platformQuestions: AiPaperSelectableQuestionDto[];
  enterpriseQuestions: AiPaperSelectableQuestionDto[];
  privateSourceQuestions: PersonalAiGenerationPaperQuestionSourceDto[] | null;
  enterpriseSourceStatus: Exclude<
    AiPaperRouteSourceResolutionEnterpriseSourceStatus,
    "not_resolved"
  >;
}): AiPaperRouteSourceResolutionResult {
  const result: AiPaperRouteSourceResolutionResult = {
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

  Object.defineProperty(result, "privateSourceQuestions", {
    value: input.privateSourceQuestions,
    enumerable: false,
    configurable: false,
    writable: false,
  });

  return result;
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
