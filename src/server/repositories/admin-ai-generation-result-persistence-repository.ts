import { adminAiGenerationResult } from "@/db/schema";
import { and, eq, type SQL } from "drizzle-orm";

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
} from "../contracts/admin-ai-generation-result-persistence-contract";
import type { AdminAiGenerationFormalReviewedDraftPayload } from "../contracts/admin-ai-generation-formal-draft-adapter-contract";
import type {
  OrganizationTrainingAdminPaperSectionDetailDto,
  OrganizationTrainingAdminQuestionDetailDto,
} from "../contracts/organization-training-contract";

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

      const taskRow = await gateway.findTaskByPublicId(lookupQuery);

      if (taskRow === null) {
        throw new Error("admin AI generation task was not found.");
      }

      assertTaskMatchesInput(input, taskRow);

      const insertedRow = await gateway.insertDraftResult(
        createServerOwnedDraftResultInput(input, taskRow),
      );
      const resolvedRow =
        insertedRow ?? (await gateway.findResultByTaskPublicId(lookupQuery));

      if (resolvedRow === null) {
        throw new Error("admin AI generation result persistence failed.");
      }

      if (insertedRow !== null) {
        await gateway.attachResultToTask({
          ...lookupQuery,
          resultPublicId: input.resultPublicId,
          evidenceStatus: input.evidenceStatus,
          citationCount: input.citationCount,
          aiCallLogPublicId: input.aiCallLogPublicId,
        });
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
): InsertAdminAiGenerationDraftResultInput {
  return {
    ...input,
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
      status: "blocked",
    },
  };
}

const organizationTrainingQuestionTypes = [
  "single_choice",
  "multi_choice",
  "true_false",
  "short_answer",
] as const;

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

function isNullableString(value: unknown): value is string | null {
  return value === null || typeof value === "string";
}

function isOrganizationTrainingQuestionType(
  value: unknown,
): value is OrganizationTrainingAdminQuestionDetailDto["questionType"] {
  return organizationTrainingQuestionTypes.includes(
    value as OrganizationTrainingAdminQuestionDetailDto["questionType"],
  );
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

function normalizeOrganizationTrainingQuestionDetail(
  value: unknown,
): OrganizationTrainingAdminQuestionDetailDto | null {
  if (!isRecord(value)) {
    return null;
  }

  const evidenceSummary = value.evidenceSummary;
  const answerAndAnalysis = value.answerAndAnalysis;

  if (
    typeof value.publicId !== "string" ||
    typeof value.sequenceNumber !== "number" ||
    !Number.isInteger(value.sequenceNumber) ||
    value.sequenceNumber < 1 ||
    !isOrganizationTrainingQuestionType(value.questionType) ||
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

  const options = value.options.map(normalizeQuestionOptionSnapshot);

  if (options.some((option) => option === null)) {
    return null;
  }

  return {
    publicId: value.publicId,
    sequenceNumber: value.sequenceNumber,
    questionType: value.questionType,
    materialTitle: value.materialTitle,
    materialContent: value.materialContent,
    stem: value.stem,
    options: options as OrganizationTrainingAdminQuestionDetailDto["options"],
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

function resolveOrganizationTrainingQuestionDraftSnapshot(
  row: AdminAiGenerationResultPersistenceRow,
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

  if (!Array.isArray(questions) || questions.length === 0) {
    return null;
  }

  const normalizedQuestions = questions.map(
    normalizeOrganizationTrainingQuestionDetail,
  );

  if (normalizedQuestions.some((question) => question === null)) {
    return null;
  }

  return {
    questions:
      normalizedQuestions as OrganizationTrainingAdminQuestionDetailDto[],
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
    typeof value.matchTier !== "string" ||
    typeof value.score !== "number"
  ) {
    return null;
  }

  return {
    questionPublicId: value.questionPublicId,
    sourceKind: value.sourceKind,
    matchTier:
      value.matchTier === "nearby_knowledge" || value.matchTier === "same_scope"
        ? value.matchTier
        : "exact",
    score: value.score,
  };
}

function normalizeOrganizationTrainingPaperAssemblySection(
  value: unknown,
): AdminAiGenerationOrganizationTrainingPaperAssemblySectionPayload | null {
  if (!isRecord(value)) {
    return null;
  }

  if (
    typeof value.sectionKey !== "string" ||
    typeof value.title !== "string" ||
    !isOrganizationTrainingQuestionType(value.questionType) ||
    typeof value.targetQuestionCount !== "number" ||
    !Number.isInteger(value.targetQuestionCount) ||
    value.targetQuestionCount < 1 ||
    typeof value.selectedQuestionCount !== "number" ||
    !Number.isInteger(value.selectedQuestionCount) ||
    value.selectedQuestionCount < 1 ||
    !Array.isArray(value.selectedQuestions)
  ) {
    return null;
  }

  const selectedQuestions = value.selectedQuestions.map(
    normalizeSelectedPaperQuestion,
  );

  if (selectedQuestions.some((question) => question === null)) {
    return null;
  }

  return {
    sectionKey: value.sectionKey,
    title: value.title,
    questionType: value.questionType,
    targetQuestionCount: value.targetQuestionCount,
    selectedQuestionCount: value.selectedQuestionCount,
    selectedQuestions:
      selectedQuestions as AdminAiGenerationOrganizationTrainingPaperAssemblySectionPayload["selectedQuestions"],
  };
}

function normalizeOrganizationTrainingPaperSectionDetail(
  value: unknown,
): OrganizationTrainingAdminPaperSectionDetailDto | null {
  if (!isRecord(value)) {
    return null;
  }

  if (
    typeof value.sectionKey !== "string" ||
    typeof value.title !== "string" ||
    !isOrganizationTrainingQuestionType(value.questionType) ||
    typeof value.targetQuestionCount !== "number" ||
    !Number.isInteger(value.targetQuestionCount) ||
    value.targetQuestionCount < 1 ||
    typeof value.selectedQuestionCount !== "number" ||
    !Number.isInteger(value.selectedQuestionCount) ||
    value.selectedQuestionCount < 1 ||
    typeof value.totalScore !== "number" ||
    !Array.isArray(value.questions)
  ) {
    return null;
  }

  const questions = value.questions.map(
    normalizeOrganizationTrainingQuestionDetail,
  );

  if (questions.some((question) => question === null)) {
    return null;
  }

  return {
    sectionKey: value.sectionKey,
    title: value.title,
    questionType: value.questionType,
    targetQuestionCount: value.targetQuestionCount,
    selectedQuestionCount: value.selectedQuestionCount,
    totalScore: value.totalScore,
    questions: questions as OrganizationTrainingAdminQuestionDetailDto[],
  };
}

function resolveOrganizationTrainingPaperDraftSnapshot(
  row: AdminAiGenerationResultPersistenceRow,
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
    paperDraftSnapshot.redactionStatus !== "admin_safe_detail"
  ) {
    return null;
  }

  const assemblySections = Array.isArray(paperDraftSnapshot.assemblySections)
    ? paperDraftSnapshot.assemblySections.map(
        normalizeOrganizationTrainingPaperAssemblySection,
      )
    : [];

  if (assemblySections.some((section) => section === null)) {
    return null;
  }

  const paperSections = Array.isArray(paperDraftSnapshot.paperSections)
    ? paperDraftSnapshot.paperSections.map(
        normalizeOrganizationTrainingPaperSectionDetail,
      )
    : [];

  if (paperSections.some((section) => section === null)) {
    return null;
  }

  const questions = Array.isArray(paperDraftSnapshot.questions)
    ? paperDraftSnapshot.questions.map(
        normalizeOrganizationTrainingQuestionDetail,
      )
    : [];

  if (questions.some((question) => question === null)) {
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
    ...(assemblySections.length === 0
      ? {}
      : {
          assemblySections:
            assemblySections as AdminAiGenerationOrganizationTrainingPaperAssemblySectionPayload[],
        }),
    ...(paperSections.length === 0
      ? {}
      : {
          paperSections:
            paperSections as OrganizationTrainingAdminPaperSectionDetailDto[],
        }),
    ...(questions.length === 0
      ? {}
      : {
          questions: questions as OrganizationTrainingAdminQuestionDetailDto[],
        }),
    redactionStatus: "admin_safe_detail",
  };
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
