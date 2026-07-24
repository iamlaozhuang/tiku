import { adminAiGenerationResult } from "@/db/schema";
import { and, eq, inArray, type SQL } from "drizzle-orm";

import type {
  AdminAiGenerationResultDto,
  AdminAiGenerationResultHistoryQuery,
  AdminAiGenerationResultPersistenceGateway,
  AdminAiGenerationResultPersistenceRepository,
  AdminAiGenerationResultPersistenceResult,
  AdminAiGenerationResultPersistenceRow,
  AdminAiGenerationResultTaskRow,
  AdminAiGenerationOrganizationTrainingPaperAssemblySectionPayload,
  AdminAiGenerationOrganizationTrainingPaperDraftPayload,
  AdminAiGenerationOrganizationTrainingQuestionDraftPayload,
  CreateAdminAiGenerationResultInput,
  FindAdminAiGenerationResultByTaskQuery,
  InsertAdminAiGenerationDraftResultInput,
  ListAdminAiGenerationResultsByTaskPublicIdsQuery,
} from "../contracts/admin-ai-generation-result-persistence-contract";
import type { AdminAiGenerationFormalReviewedDraftPayload } from "../contracts/admin-ai-generation-formal-draft-adapter-contract";
import type {
  AiPaperConstraintLineageDto,
  AiPaperSelectedConstraintMatchBasisDto,
} from "../contracts/ai-paper-plan-and-select-contract";
import type { AdminAiGenerationResultFormalAdoptionStatus } from "../models/admin-ai-generation-result";
import type {
  OrganizationTrainingAdminPaperSectionDetailDto,
  OrganizationTrainingAdminQuestionDetailDto,
} from "../contracts/organization-training-contract";
import {
  normalizeAiGenerationRouteIntegratedKnowledgeScope,
  type AiGenerationRouteIntegratedGenerationParameters,
} from "../contracts/route-integrated-provider-execution-contract";
import { parseLegacyAiGenerationQuestionType } from "../services/ai-generation-question-type-contract";

const DEFAULT_RESULT_HISTORY_LIMIT = 20;
const MAX_RESULT_HISTORY_LIMIT = 50;

export function createAdminAiGenerationResultHistoryCondition(
  query: Pick<
    AdminAiGenerationResultHistoryQuery,
    "workspace" | "ownerType" | "ownerPublicId" | "generationKind"
  >,
): SQL {
  return and(
    eq(adminAiGenerationResult.workspace, query.workspace),
    eq(adminAiGenerationResult.owner_type, query.ownerType),
    eq(adminAiGenerationResult.owner_public_id, query.ownerPublicId),
    eq(adminAiGenerationResult.generation_kind, query.generationKind),
    eq(adminAiGenerationResult.result_status, "draft"),
  ) as SQL;
}

export function createAdminAiGenerationResultByTaskCondition(
  query: FindAdminAiGenerationResultByTaskQuery,
): SQL {
  return and(
    eq(adminAiGenerationResult.workspace, query.workspace),
    eq(adminAiGenerationResult.owner_type, query.ownerType),
    eq(adminAiGenerationResult.owner_public_id, query.ownerPublicId),
    eq(adminAiGenerationResult.task_public_id, query.taskPublicId),
  ) as SQL;
}

export function createAdminAiGenerationResultsByTaskPublicIdsCondition(
  query: ListAdminAiGenerationResultsByTaskPublicIdsQuery,
): SQL {
  return and(
    eq(adminAiGenerationResult.workspace, query.workspace),
    eq(adminAiGenerationResult.owner_type, query.ownerType),
    eq(adminAiGenerationResult.owner_public_id, query.ownerPublicId),
    eq(adminAiGenerationResult.generation_kind, query.generationKind),
    eq(adminAiGenerationResult.result_status, "draft"),
    inArray(adminAiGenerationResult.task_public_id, query.taskPublicIds),
  ) as SQL;
}

export function createAdminAiGenerationResultPersistenceRepository(
  gateway: AdminAiGenerationResultPersistenceGateway,
): AdminAiGenerationResultPersistenceRepository {
  return {
    async listDraftResults(query) {
      const rows = await gateway.listResultRows({
        workspace: query.workspace,
        ownerType: query.ownerType,
        ownerPublicId: query.ownerPublicId,
        generationKind: query.generationKind,
        page: query.page,
        pageSize: query.pageSize,
        limit: resolveResultHistoryLimit(query.limit),
        offset: query.offset,
      });

      return [...rows]
        .sort(compareAdminAiGenerationResultRows)
        .map(mapAdminAiGenerationResultRowToDto);
    },
    async listDraftResultsByTaskPublicIds(query) {
      const taskPublicIds = [...new Set(query.taskPublicIds)];

      if (taskPublicIds.length === 0) {
        return [];
      }

      const rows = await gateway.listResultRowsByTaskPublicIds({
        ...query,
        taskPublicIds,
      });
      const resultsByTaskPublicId = new Map(
        rows.map((row) => [row.task_public_id, row]),
      );

      return taskPublicIds.flatMap((taskPublicId) => {
        const row = resultsByTaskPublicId.get(taskPublicId);

        return row === undefined
          ? []
          : [mapAdminAiGenerationResultRowToDto(row)];
      });
    },
    async findDraftResultByTaskPublicId(query) {
      const row = await gateway.findResultByTaskPublicId(query);

      return row === null ? null : mapAdminAiGenerationResultRowToDto(row);
    },
    async createOrReuseDraftResult(input) {
      const lookupQuery = {
        workspace: input.workspace,
        ownerType: input.ownerType,
        ownerPublicId: input.ownerPublicId,
        taskPublicId: input.taskPublicId,
      };
      const existingRow = await gateway.findResultByTaskPublicId(lookupQuery);

      if (existingRow !== null) {
        return createResultPersistenceResponse("reused", existingRow);
      }

      if (input.attempt === undefined) {
        throw new Error(
          "admin AI generation result requires a claimed task attempt.",
        );
      }

      const taskRow = await gateway.findTaskByPublicId(lookupQuery);

      if (taskRow === null) {
        throw new Error("admin AI generation task was not found.");
      }

      assertTaskMatchesInput(input, taskRow);

      const insertedRow = await gateway.insertDraftResultAndCompleteTask(
        createServerOwnedDraftResultInput(input, taskRow, input.attempt),
      );
      const resolvedRow =
        insertedRow ?? (await gateway.findResultByTaskPublicId(lookupQuery));

      if (resolvedRow === null) {
        throw new Error("admin AI generation result persistence failed.");
      }

      return createResultPersistenceResponse(
        insertedRow === null ? "reused" : "created",
        resolvedRow,
      );
    },
  };
}

function createServerOwnedDraftResultInput(
  input: CreateAdminAiGenerationResultInput,
  taskRow: AdminAiGenerationResultTaskRow,
  attempt: NonNullable<CreateAdminAiGenerationResultInput["attempt"]>,
): InsertAdminAiGenerationDraftResultInput {
  return {
    ...input,
    attempt,
    aiGenerationTaskId: taskRow.id,
    requestPublicId: taskRow.request_public_id,
    resultStatus: "draft",
    isFormalAdoptionBlocked: true,
  };
}

function assertTaskMatchesInput(
  input: CreateAdminAiGenerationResultInput,
  taskRow: AdminAiGenerationResultTaskRow,
): void {
  if (
    taskRow.workspace !== input.workspace ||
    taskRow.owner_type !== input.ownerType ||
    taskRow.owner_public_id !== input.ownerPublicId ||
    taskRow.organization_public_id !== input.organizationPublicId ||
    taskRow.task_type !== input.taskType
  ) {
    throw new Error("unsafe admin AI generation result task scope.");
  }
}

function createResultPersistenceResponse(
  persistenceStatus: AdminAiGenerationResultPersistenceResult["persistenceStatus"],
  row: AdminAiGenerationResultPersistenceRow,
): AdminAiGenerationResultPersistenceResult {
  return {
    persistenceStatus,
    result: mapAdminAiGenerationResultRowToDto(row),
  };
}

function mapAdminAiGenerationResultRowToDto(
  row: AdminAiGenerationResultPersistenceRow,
): AdminAiGenerationResultDto {
  return {
    resultPublicId: row.public_id,
    taskPublicId: row.task_public_id,
    requestPublicId: row.request_public_id,
    workspace: row.workspace,
    generationKind: row.generation_kind,
    ownerType: row.owner_type,
    ownerPublicId: row.owner_public_id,
    organizationPublicId: row.organization_public_id,
    taskType: row.task_type,
    status: row.result_status,
    persistedAt: row.created_at.toISOString(),
    contentReference: {
      contentDigest: row.content_digest,
      contentPreviewMasked: row.content_preview_masked,
      contentVisibility: "redacted_snapshot",
      reviewedDraft: resolveFormalReviewedDraftSnapshot(row),
      organizationTrainingDraft:
        resolveOrganizationTrainingQuestionDraftSnapshot(row),
      organizationTrainingPaperDraft:
        resolveOrganizationTrainingPaperDraftSnapshot(row),
      redactionStatus: "redacted",
    },
    evidenceReference: {
      evidenceStatus: row.evidence_status,
      citationCount: row.citation_count,
      aiCallLogPublicId: row.ai_call_log_public_id,
      redactionStatus: "redacted",
    },
    sourceReference: {
      sourceQuestionPublicId: row.source_question_public_id,
      sourcePaperPublicId: row.source_paper_public_id,
    },
    formalAdoption: {
      isBlocked: true,
      status: resolveFormalAdoptionStatus(row),
      reviewStatus: row.formal_adoption_review_status,
      formalTargetWriteStatus: row.formal_adoption_target_write_status,
      formalQuestionPublicId: row.formal_adoption_question_public_id,
      formalPaperPublicId: row.formal_adoption_paper_public_id,
      reviewedAt: row.formal_adoption_reviewed_at?.toISOString() ?? null,
    },
  };
}

function resolveFormalAdoptionStatus(
  row: AdminAiGenerationResultPersistenceRow,
): AdminAiGenerationResultFormalAdoptionStatus {
  if (row.formal_adoption_review_status === null) {
    return "blocked";
  }

  if (row.formal_adoption_review_status === "rejected") {
    return "rejected";
  }

  if (row.formal_adoption_target_write_status === "draft_created") {
    return "draft_created";
  }

  return "approved_for_formal_adoption";
}

const evidenceStatuses = ["sufficient", "weak", "none"] as const;
const paperMatchQualities = [
  "fully_matched",
  "supplemented_from_nearby_knowledge",
  "supplemented_from_same_scope",
  "insufficient",
] as const;
const paperSourceKinds = [
  "platform_formal_question",
  "enterprise_training_snapshot",
] as const;
const paperMatchTiers = [
  "exact",
  "descendant",
  "nearby_knowledge",
  "same_scope",
] as const;

const generationProfessions = ["monopoly", "marketing", "logistics"] as const;
const generationSubjects = ["theory", "skill"] as const;
const questionTypeDistributions = [
  "balanced_40_30_30",
  "single_50_multi_25_true_false_25",
  "weak_point_priority",
] as const;
const paperStructures = ["by_question_type", "by_knowledge_node"] as const;

function isNullableString(value: unknown): value is string | null {
  return value === null || typeof value === "string";
}

type AdminAiGenerationTrainingSnapshotRow = {
  workspace: string;
  generation_kind: string;
  content_redacted_snapshot: unknown;
};

export function resolveGenerationParametersSnapshot(row: {
  content_redacted_snapshot: unknown;
}): AiGenerationRouteIntegratedGenerationParameters | null {
  const snapshot = row.content_redacted_snapshot;

  if (!isRecord(snapshot) || !isRecord(snapshot.generationParameters)) {
    return null;
  }

  const value = snapshot.generationParameters;
  const scope = normalizeAiGenerationRouteIntegratedKnowledgeScope({
    includeDescendants: value.includeDescendants,
    knowledgeNode: value.knowledgeNode,
    knowledgeNodeMode: value.knowledgeNodeMode,
    knowledgeNodePublicIds: value.knowledgeNodePublicIds,
    knowledgeNodeSupplement: value.knowledgeNodeSupplement,
    sourcePreference: value.sourcePreference,
  });
  const level = value.level;
  const questionCount = value.questionCount;
  const questionTypeDistribution = value.questionTypeDistribution;
  const paperStructure = value.paperStructure;
  const questionType =
    value.questionType === null
      ? null
      : parseLegacyAiGenerationQuestionType(value.questionType);

  if (
    !generationProfessions.includes(
      value.profession as (typeof generationProfessions)[number],
    ) ||
    !generationSubjects.includes(
      value.subject as (typeof generationSubjects)[number],
    ) ||
    (level !== 1 && level !== 2 && level !== 3 && level !== 4 && level !== 5) ||
    typeof questionCount !== "number" ||
    !Number.isInteger(questionCount) ||
    questionCount < 1 ||
    (value.questionType !== null && questionType === null) ||
    !isNullableString(value.difficulty) ||
    !isNullableString(value.learningObjective) ||
    scope === null ||
    !(
      questionTypeDistribution === null ||
      questionTypeDistributions.includes(
        questionTypeDistribution as (typeof questionTypeDistributions)[number],
      )
    ) ||
    !(
      paperStructure === null ||
      paperStructures.includes(
        paperStructure as (typeof paperStructures)[number],
      )
    )
  ) {
    return null;
  }

  return {
    profession:
      value.profession as AiGenerationRouteIntegratedGenerationParameters["profession"],
    level,
    subject:
      value.subject as AiGenerationRouteIntegratedGenerationParameters["subject"],
    questionType,
    questionCount,
    difficulty: value.difficulty,
    learningObjective: value.learningObjective,
    ...scope,
    questionTypeDistribution:
      questionTypeDistribution as AiGenerationRouteIntegratedGenerationParameters["questionTypeDistribution"],
    paperStructure:
      paperStructure as AiGenerationRouteIntegratedGenerationParameters["paperStructure"],
  };
}

function isEvidenceStatus(
  value: unknown,
): value is OrganizationTrainingAdminQuestionDetailDto["evidenceSummary"]["evidenceStatus"] {
  return evidenceStatuses.includes(
    value as OrganizationTrainingAdminQuestionDetailDto["evidenceSummary"]["evidenceStatus"],
  );
}

function isPaperMatchQuality(
  value: unknown,
): value is AdminAiGenerationOrganizationTrainingPaperDraftPayload["matchQuality"] {
  return paperMatchQualities.includes(
    value as AdminAiGenerationOrganizationTrainingPaperDraftPayload["matchQuality"],
  );
}

function isPaperSourceKind(
  value: unknown,
): value is AdminAiGenerationOrganizationTrainingPaperAssemblySectionPayload["selectedQuestions"][number]["sourceKind"] {
  return paperSourceKinds.includes(
    value as AdminAiGenerationOrganizationTrainingPaperAssemblySectionPayload["selectedQuestions"][number]["sourceKind"],
  );
}

function isPaperMatchTier(
  value: unknown,
): value is AiPaperSelectedConstraintMatchBasisDto["matchTier"] {
  return paperMatchTiers.includes(
    value as AiPaperSelectedConstraintMatchBasisDto["matchTier"],
  );
}

function normalizeQuestionOptionSnapshot(
  value: unknown,
): OrganizationTrainingAdminQuestionDetailDto["options"][number] | null {
  if (!isRecord(value)) {
    return null;
  }

  if (
    typeof value.publicId !== "string" ||
    typeof value.label !== "string" ||
    typeof value.content !== "string"
  ) {
    return null;
  }

  return {
    publicId: value.publicId,
    label: value.label,
    content: value.content,
  };
}

function hasDenseArrayEntries(value: readonly unknown[]): boolean {
  for (let index = 0; index < value.length; index += 1) {
    if (!Object.hasOwn(value, index)) {
      return false;
    }
  }
  return true;
}

function normalizeCompleteArray<T>(
  values: readonly unknown[],
  normalize: (value: unknown) => T | null,
): T[] | null {
  if (!hasDenseArrayEntries(values)) return null;
  const normalizedValues: T[] = [];
  for (const value of values) {
    const normalizedValue = normalize(value);
    if (normalizedValue === null) return null;
    normalizedValues.push(normalizedValue);
  }
  return normalizedValues;
}

function normalizeQuestionScoringPoints(
  value: unknown,
): NonNullable<
  OrganizationTrainingAdminQuestionDetailDto["scoringPoints"]
> | null {
  if (!Array.isArray(value)) {
    return null;
  }

  const scoringPoints: NonNullable<
    OrganizationTrainingAdminQuestionDetailDto["scoringPoints"]
  > = [];
  for (let index = 0; index < value.length; index += 1) {
    if (!Object.hasOwn(value, index)) {
      return null;
    }

    const item = value[index];
    if (
      !isRecord(item) ||
      typeof item.description !== "string" ||
      item.description.length === 0 ||
      typeof item.score !== "number" ||
      !Number.isFinite(item.score) ||
      item.score <= 0 ||
      typeof item.sortOrder !== "number" ||
      !Number.isInteger(item.sortOrder) ||
      item.sortOrder !== index + 1
    ) {
      return null;
    }

    scoringPoints.push({
      description: item.description,
      score: item.score,
      sortOrder: item.sortOrder,
    });
  }

  return scoringPoints;
}

function normalizeFillBlankAnswerSnapshots(
  value: unknown,
): NonNullable<
  OrganizationTrainingAdminQuestionDetailDto["fillBlankAnswers"]
> | null {
  if (!Array.isArray(value)) {
    return null;
  }

  const fillBlankAnswers: NonNullable<
    OrganizationTrainingAdminQuestionDetailDto["fillBlankAnswers"]
  > = [];
  for (let index = 0; index < value.length; index += 1) {
    if (!Object.hasOwn(value, index)) {
      return null;
    }

    const item = value[index];
    if (
      !isRecord(item) ||
      typeof item.blankKey !== "string" ||
      item.blankKey.length === 0 ||
      !Array.isArray(item.standardAnswers) ||
      item.standardAnswers.length === 0 ||
      item.standardAnswers.some(
        (answer) => typeof answer !== "string" || answer.length === 0,
      ) ||
      typeof item.score !== "number" ||
      !Number.isFinite(item.score) ||
      item.score <= 0 ||
      typeof item.sortOrder !== "number" ||
      !Number.isInteger(item.sortOrder) ||
      item.sortOrder !== index + 1
    ) {
      return null;
    }

    fillBlankAnswers.push({
      blankKey: item.blankKey,
      standardAnswers: [...item.standardAnswers],
      score: item.score,
      sortOrder: item.sortOrder,
    });
  }

  return fillBlankAnswers;
}

function normalizeOrganizationTrainingQuestionDetail(
  value: unknown,
): OrganizationTrainingAdminQuestionDetailDto | null {
  if (!isRecord(value)) {
    return null;
  }

  const evidenceSummary = value.evidenceSummary;
  const answerAndAnalysis = value.answerAndAnalysis;
  const questionType = parseLegacyAiGenerationQuestionType(value.questionType);
  const hasScoringPoints = Object.hasOwn(value, "scoringPoints");
  const hasFillBlankAnswers = Object.hasOwn(value, "fillBlankAnswers");

  if (
    typeof value.publicId !== "string" ||
    typeof value.sequenceNumber !== "number" ||
    !Number.isInteger(value.sequenceNumber) ||
    value.sequenceNumber < 1 ||
    questionType === null ||
    !isNullableString(value.materialTitle) ||
    !isNullableString(value.materialContent) ||
    typeof value.stem !== "string" ||
    !Array.isArray(value.options) ||
    typeof value.score !== "number" ||
    !isRecord(evidenceSummary) ||
    !isEvidenceStatus(evidenceSummary.evidenceStatus) ||
    typeof evidenceSummary.citationCount !== "number" ||
    !Number.isInteger(evidenceSummary.citationCount) ||
    evidenceSummary.citationCount < 0 ||
    !isRecord(answerAndAnalysis) ||
    answerAndAnalysis.visibility !== "collapsed_by_default" ||
    !isNullableString(answerAndAnalysis.standardAnswer) ||
    !isNullableString(answerAndAnalysis.analysis)
  ) {
    return null;
  }

  const options = normalizeCompleteArray(
    value.options,
    normalizeQuestionOptionSnapshot,
  );
  if (options === null) {
    return null;
  }

  if (hasScoringPoints !== hasFillBlankAnswers) {
    return null;
  }

  let currentTypeFacts:
    | {
        scoringPoints: NonNullable<
          OrganizationTrainingAdminQuestionDetailDto["scoringPoints"]
        >;
        fillBlankAnswers: NonNullable<
          OrganizationTrainingAdminQuestionDetailDto["fillBlankAnswers"]
        >;
      }
    | undefined;
  if (hasScoringPoints) {
    const scoringPoints = normalizeQuestionScoringPoints(value.scoringPoints);
    const fillBlankAnswers = normalizeFillBlankAnswerSnapshots(
      value.fillBlankAnswers,
    );
    if (scoringPoints === null || fillBlankAnswers === null) {
      return null;
    }

    const hasInvalidCurrentTypeFacts =
      questionType === "fill_blank"
        ? fillBlankAnswers.length === 0 || scoringPoints.length !== 0
        : questionType === "short_answer" ||
            questionType === "case_analysis" ||
            questionType === "calculation"
          ? scoringPoints.length === 0 || fillBlankAnswers.length !== 0
          : scoringPoints.length !== 0 || fillBlankAnswers.length !== 0;
    if (hasInvalidCurrentTypeFacts) {
      return null;
    }

    currentTypeFacts = { scoringPoints, fillBlankAnswers };
  }

  return {
    publicId: value.publicId,
    sequenceNumber: value.sequenceNumber,
    questionType,
    materialTitle: value.materialTitle,
    materialContent: value.materialContent,
    stem: value.stem,
    options,
    ...(currentTypeFacts ?? {}),
    score: value.score,
    evidenceSummary: {
      evidenceStatus: evidenceSummary.evidenceStatus,
      citationCount: evidenceSummary.citationCount,
    },
    answerAndAnalysis: {
      visibility: "collapsed_by_default",
      standardAnswer: answerAndAnalysis.standardAnswer,
      analysis: answerAndAnalysis.analysis,
    },
  };
}

export function resolveOrganizationTrainingQuestionDraftSnapshot(
  row: AdminAiGenerationTrainingSnapshotRow,
): AdminAiGenerationOrganizationTrainingQuestionDraftPayload | null {
  if (row.workspace !== "organization" || row.generation_kind !== "question") {
    return null;
  }

  const snapshot = row.content_redacted_snapshot;

  if (!isRecord(snapshot)) {
    return null;
  }

  const trainingDraftSnapshot = snapshot.organizationTrainingQuestionDraft;

  if (!isRecord(trainingDraftSnapshot)) {
    return null;
  }

  const questions = trainingDraftSnapshot.questions;

  if (
    !Array.isArray(questions) ||
    questions.length === 0 ||
    !hasDenseArrayEntries(questions)
  ) {
    return null;
  }

  const normalizedQuestions = normalizeCompleteArray(
    questions,
    normalizeOrganizationTrainingQuestionDetail,
  );
  if (normalizedQuestions === null) {
    return null;
  }

  return {
    questions: normalizedQuestions,
  };
}

function normalizeSelectedPaperQuestion(
  value: unknown,
):
  | AdminAiGenerationOrganizationTrainingPaperAssemblySectionPayload["selectedQuestions"][number]
  | null {
  if (!isRecord(value)) {
    return null;
  }

  if (
    typeof value.questionPublicId !== "string" ||
    !isPaperSourceKind(value.sourceKind) ||
    !isPaperMatchTier(value.matchTier) ||
    typeof value.score !== "number"
  ) {
    return null;
  }

  const constraintMatchBasis = normalizePaperConstraintMatchBasis(
    value.constraintMatchBasis,
  );
  if (
    value.constraintMatchBasis !== undefined &&
    constraintMatchBasis === null
  ) {
    return null;
  }

  return {
    questionPublicId: value.questionPublicId,
    sourceKind: value.sourceKind,
    matchTier: value.matchTier,
    score: value.score,
    ...(constraintMatchBasis === null ? {} : { constraintMatchBasis }),
  };
}

function normalizePaperConstraintMatchBasis(
  value: unknown,
): AiPaperSelectedConstraintMatchBasisDto | null {
  if (!isRecord(value)) {
    return null;
  }

  const difficulty = normalizeNullableNonEmptyString(value.difficulty);
  const knowledgeNodePublicIds = normalizeUniqueStringArray(
    value.knowledgeNodePublicIds,
  );
  const parentKnowledgeNodePublicIds = normalizeUniqueStringArray(
    value.parentKnowledgeNodePublicIds,
  );
  const ancestorKnowledgeNodePublicIds = normalizeUniqueStringArray(
    value.ancestorKnowledgeNodePublicIds,
  );

  if (
    difficulty === undefined ||
    knowledgeNodePublicIds === null ||
    parentKnowledgeNodePublicIds === null ||
    ancestorKnowledgeNodePublicIds === null ||
    !isPaperMatchTier(value.matchTier)
  ) {
    return null;
  }

  return {
    difficulty,
    knowledgeNodePublicIds,
    parentKnowledgeNodePublicIds,
    ancestorKnowledgeNodePublicIds,
    matchTier: value.matchTier,
  };
}

function normalizeOrganizationTrainingPaperAssemblySection(
  value: unknown,
): AdminAiGenerationOrganizationTrainingPaperAssemblySectionPayload | null {
  if (!isRecord(value)) {
    return null;
  }

  const questionType = parseLegacyAiGenerationQuestionType(value.questionType);

  if (
    typeof value.sectionKey !== "string" ||
    typeof value.title !== "string" ||
    questionType === null ||
    typeof value.targetQuestionCount !== "number" ||
    !Number.isInteger(value.targetQuestionCount) ||
    value.targetQuestionCount < 1 ||
    typeof value.selectedQuestionCount !== "number" ||
    !Number.isInteger(value.selectedQuestionCount) ||
    value.selectedQuestionCount < 1 ||
    !Array.isArray(value.selectedQuestions) ||
    !hasDenseArrayEntries(value.selectedQuestions)
  ) {
    return null;
  }

  const selectedQuestions = normalizeCompleteArray(
    value.selectedQuestions,
    normalizeSelectedPaperQuestion,
  );
  if (selectedQuestions === null) {
    return null;
  }

  return {
    sectionKey: value.sectionKey,
    title: value.title,
    questionType,
    targetQuestionCount: value.targetQuestionCount,
    selectedQuestionCount: value.selectedQuestionCount,
    selectedQuestions,
  };
}

function normalizeOrganizationTrainingPaperSectionDetail(
  value: unknown,
): OrganizationTrainingAdminPaperSectionDetailDto | null {
  if (!isRecord(value)) {
    return null;
  }

  const questionType = parseLegacyAiGenerationQuestionType(value.questionType);

  if (
    typeof value.sectionKey !== "string" ||
    typeof value.title !== "string" ||
    questionType === null ||
    typeof value.targetQuestionCount !== "number" ||
    !Number.isInteger(value.targetQuestionCount) ||
    value.targetQuestionCount < 1 ||
    typeof value.selectedQuestionCount !== "number" ||
    !Number.isInteger(value.selectedQuestionCount) ||
    value.selectedQuestionCount < 1 ||
    typeof value.totalScore !== "number" ||
    !Array.isArray(value.questions) ||
    !hasDenseArrayEntries(value.questions)
  ) {
    return null;
  }

  const questions = normalizeCompleteArray(
    value.questions,
    normalizeOrganizationTrainingQuestionDetail,
  );
  if (
    questions === null ||
    questions.some((question) => question.questionType !== questionType)
  ) {
    return null;
  }

  return {
    sectionKey: value.sectionKey,
    title: value.title,
    questionType,
    targetQuestionCount: value.targetQuestionCount,
    selectedQuestionCount: value.selectedQuestionCount,
    totalScore: value.totalScore,
    questions,
  };
}

export function resolveOrganizationTrainingPaperDraftSnapshot(
  row: AdminAiGenerationTrainingSnapshotRow,
): AdminAiGenerationOrganizationTrainingPaperDraftPayload | null {
  if (row.workspace !== "organization" || row.generation_kind !== "paper") {
    return null;
  }

  const snapshot = row.content_redacted_snapshot;

  if (!isRecord(snapshot)) {
    return null;
  }

  const paperDraftSnapshot = snapshot.organizationTrainingPaperDraft;

  if (!isRecord(paperDraftSnapshot)) {
    return null;
  }

  const sourceComposition = paperDraftSnapshot.sourceComposition;
  const constraintLineage = normalizePaperConstraintLineage(
    paperDraftSnapshot.constraintLineage,
  );

  if (
    typeof paperDraftSnapshot.paperTitle !== "string" ||
    typeof paperDraftSnapshot.requestedQuestionCount !== "number" ||
    !Number.isInteger(paperDraftSnapshot.requestedQuestionCount) ||
    paperDraftSnapshot.requestedQuestionCount < 1 ||
    typeof paperDraftSnapshot.selectedQuestionCount !== "number" ||
    !Number.isInteger(paperDraftSnapshot.selectedQuestionCount) ||
    paperDraftSnapshot.selectedQuestionCount < 1 ||
    !isRecord(sourceComposition) ||
    typeof sourceComposition.platformFormalQuestionCount !== "number" ||
    typeof sourceComposition.enterpriseTrainingSnapshotCount !== "number" ||
    !isPaperMatchQuality(paperDraftSnapshot.matchQuality) ||
    paperDraftSnapshot.redactionStatus !== "admin_safe_detail" ||
    (paperDraftSnapshot.constraintLineage !== undefined &&
      constraintLineage === null)
  ) {
    return null;
  }

  for (const collection of [
    paperDraftSnapshot.assemblySections,
    paperDraftSnapshot.paperSections,
    paperDraftSnapshot.questions,
  ]) {
    if (
      collection !== undefined &&
      (!Array.isArray(collection) || !hasDenseArrayEntries(collection))
    ) {
      return null;
    }
  }

  const assemblySections = Array.isArray(paperDraftSnapshot.assemblySections)
    ? normalizeCompleteArray(
        paperDraftSnapshot.assemblySections,
        normalizeOrganizationTrainingPaperAssemblySection,
      )
    : [];
  if (assemblySections === null) {
    return null;
  }

  const paperSections = Array.isArray(paperDraftSnapshot.paperSections)
    ? normalizeCompleteArray(
        paperDraftSnapshot.paperSections,
        normalizeOrganizationTrainingPaperSectionDetail,
      )
    : [];
  if (paperSections === null) {
    return null;
  }

  const questions = Array.isArray(paperDraftSnapshot.questions)
    ? normalizeCompleteArray(
        paperDraftSnapshot.questions,
        normalizeOrganizationTrainingQuestionDetail,
      )
    : [];
  if (questions === null) {
    return null;
  }

  if (assemblySections.length === 0 && paperSections.length === 0) {
    return null;
  }

  return {
    paperTitle: paperDraftSnapshot.paperTitle,
    requestedQuestionCount: paperDraftSnapshot.requestedQuestionCount,
    selectedQuestionCount: paperDraftSnapshot.selectedQuestionCount,
    sourceComposition: {
      platformFormalQuestionCount:
        sourceComposition.platformFormalQuestionCount,
      enterpriseTrainingSnapshotCount:
        sourceComposition.enterpriseTrainingSnapshotCount,
    },
    matchQuality: paperDraftSnapshot.matchQuality,
    ...(constraintLineage === null ? {} : { constraintLineage }),
    ...(assemblySections.length === 0
      ? {}
      : {
          assemblySections,
        }),
    ...(paperSections.length === 0
      ? {}
      : {
          paperSections,
        }),
    ...(questions.length === 0
      ? {}
      : {
          questions,
        }),
    redactionStatus: "admin_safe_detail",
  };
}

function normalizePaperConstraintLineage(
  value: unknown,
): AiPaperConstraintLineageDto | null {
  if (!isRecord(value) || !isRecord(value.request) || !isRecord(value.plan)) {
    return null;
  }

  const requestKnowledgeNodePublicIds = normalizeUniqueStringArray(
    value.request.knowledgeNodePublicIds,
  );
  const planKnowledgeNodePublicIds = normalizeUniqueStringArray(
    value.plan.knowledgeNodePublicIds,
  );
  const planParentKnowledgeNodePublicIds = normalizeUniqueStringArray(
    value.plan.parentKnowledgeNodePublicIds,
  );
  const requestDifficulty = normalizeNullableNonEmptyString(
    value.request.difficulty,
  );
  const planDifficulty = normalizeNullableNonEmptyString(value.plan.difficulty);

  if (
    requestKnowledgeNodePublicIds === null ||
    planKnowledgeNodePublicIds === null ||
    planParentKnowledgeNodePublicIds === null ||
    requestDifficulty === undefined ||
    planDifficulty === undefined
  ) {
    return null;
  }

  return {
    request: {
      difficulty: requestDifficulty,
      knowledgeNodePublicIds: requestKnowledgeNodePublicIds,
    },
    plan: {
      difficulty: planDifficulty,
      knowledgeNodePublicIds: planKnowledgeNodePublicIds,
      parentKnowledgeNodePublicIds: planParentKnowledgeNodePublicIds,
    },
  };
}

function normalizeNullableNonEmptyString(
  value: unknown,
): string | null | undefined {
  if (value === null) {
    return null;
  }

  if (typeof value !== "string" || value.trim().length === 0) {
    return undefined;
  }

  return value.trim();
}

function normalizeUniqueStringArray(value: unknown): string[] | null {
  if (!Array.isArray(value)) {
    return null;
  }

  const normalizedValues: string[] = [];
  const canonicalValues = new Set<string>();
  for (const item of value) {
    if (typeof item !== "string" || item.trim().length === 0) {
      return null;
    }

    const normalizedValue = item.trim();
    const canonicalValue = normalizedValue.normalize("NFKC").toLowerCase();
    if (canonicalValues.has(canonicalValue)) {
      return null;
    }
    canonicalValues.add(canonicalValue);
    normalizedValues.push(normalizedValue);
  }

  return normalizedValues;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function hasStringArray(value: unknown): value is string[] {
  return (
    Array.isArray(value) && value.every((item) => typeof item === "string")
  );
}

function hasFormalQuestionDraftShape(
  value: unknown,
): value is AdminAiGenerationFormalReviewedDraftPayload {
  return (
    isRecord(value) &&
    typeof value.questionType === "string" &&
    typeof value.profession === "string" &&
    typeof value.level === "number" &&
    typeof value.subject === "string" &&
    typeof value.stemRichText === "string" &&
    typeof value.analysisRichText === "string" &&
    typeof value.standardAnswerRichText === "string" &&
    typeof value.multiChoiceRule === "string" &&
    typeof value.scoringMethod === "string" &&
    (typeof value.materialPublicId === "string" ||
      value.materialPublicId === null) &&
    Array.isArray(value.questionOptions) &&
    Array.isArray(value.scoringPoints) &&
    Array.isArray(value.fillBlankAnswers) &&
    hasStringArray(value.knowledgeNodePublicIds) &&
    hasStringArray(value.tagPublicIds)
  );
}

function hasFormalPaperDraftShape(
  value: unknown,
): value is AdminAiGenerationFormalReviewedDraftPayload {
  return (
    isRecord(value) &&
    typeof value.name === "string" &&
    typeof value.profession === "string" &&
    typeof value.level === "number" &&
    typeof value.subject === "string" &&
    (typeof value.paperType === "string" || value.paperType === null) &&
    (typeof value.year === "number" || value.year === null) &&
    (typeof value.source === "string" || value.source === null) &&
    (typeof value.durationMinute === "number" ||
      value.durationMinute === null) &&
    (typeof value.totalScore === "string" || value.totalScore === null) &&
    (value.paperSections === undefined || Array.isArray(value.paperSections))
  );
}

function resolveFormalReviewedDraftSnapshot(
  row: AdminAiGenerationResultPersistenceRow,
): AdminAiGenerationFormalReviewedDraftPayload | null {
  if (row.workspace !== "content") {
    return null;
  }

  const snapshot = row.content_redacted_snapshot;

  if (!isRecord(snapshot)) {
    return null;
  }

  const reviewedDraft = snapshot.formalReviewedDraft;

  if (
    row.generation_kind === "question" &&
    hasFormalQuestionDraftShape(reviewedDraft)
  ) {
    return reviewedDraft;
  }

  if (
    row.generation_kind === "paper" &&
    hasFormalPaperDraftShape(reviewedDraft)
  ) {
    return reviewedDraft;
  }

  return null;
}

function resolveResultHistoryLimit(limit: number | undefined): number {
  if (limit === undefined) {
    return DEFAULT_RESULT_HISTORY_LIMIT;
  }

  if (!Number.isInteger(limit) || limit <= 0) {
    return DEFAULT_RESULT_HISTORY_LIMIT;
  }

  return Math.min(limit, MAX_RESULT_HISTORY_LIMIT);
}

function compareAdminAiGenerationResultRows(
  leftRow: AdminAiGenerationResultPersistenceRow,
  rightRow: AdminAiGenerationResultPersistenceRow,
): number {
  const createdAtComparison =
    rightRow.created_at.getTime() - leftRow.created_at.getTime();

  return createdAtComparison === 0
    ? leftRow.public_id.localeCompare(rightRow.public_id)
    : createdAtComparison;
}
