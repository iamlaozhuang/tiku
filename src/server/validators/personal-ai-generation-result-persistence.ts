import { createHash } from "node:crypto";

import type {
  PersonalAiGenerationPrivateQuestionDraftSnapshotDto,
  PersonalAiGenerationQuestionDraftSnapshotDto,
} from "../contracts/personal-ai-generation-result-persistence-contract";
import type { AiGenerationRouteIntegratedQuestionDraftSummary } from "../contracts/route-integrated-provider-execution-contract";
import {
  aiGenerationTaskTypeValues,
  type AiGenerationTaskType,
} from "../models/ai-generation-task";
import { evidenceStatusValues, type EvidenceStatus } from "../models/ai-rag";
import {
  isPersonalAiGenerationResultTaskType,
  type PersonalAiGenerationResultPersistenceInput,
  type PersonalAiGenerationResultOwnerType,
  type PersonalAiGenerationResultTaskType,
} from "../models/personal-ai-generation-result";

export type PersonalAiGenerationResultPersistenceValidationResult =
  | {
      success: true;
      value: PersonalAiGenerationResultPersistenceInput;
    }
  | {
      success: false;
      message: string;
    };

const INVALID_PERSONAL_AI_GENERATION_RESULT_PERSISTENCE_INPUT_MESSAGE =
  "Invalid personal AI generation result persistence input.";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function normalizeRequiredText(value: unknown): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const text = value.trim();

  return text.length === 0 ? null : text;
}

function normalizeOptionalText(value: unknown): string | null {
  if (value === null || value === undefined) {
    return null;
  }

  return normalizeRequiredText(value);
}

function normalizeTaskType(
  value: unknown,
): PersonalAiGenerationResultTaskType | null {
  const text = normalizeRequiredText(value);

  if (
    text === null ||
    !aiGenerationTaskTypeValues.includes(text as AiGenerationTaskType)
  ) {
    return null;
  }

  const taskType = text as AiGenerationTaskType;

  return isPersonalAiGenerationResultTaskType(taskType) ? taskType : null;
}

function normalizeOwnerType(
  value: unknown,
): PersonalAiGenerationResultOwnerType | null {
  if (value === null || value === undefined) {
    return "personal";
  }

  const text = normalizeRequiredText(value);

  return text === "personal" || text === "organization" ? text : null;
}

function normalizeEvidenceStatus(value: unknown): EvidenceStatus | null {
  const text = normalizeRequiredText(value);

  return text !== null && evidenceStatusValues.includes(text as EvidenceStatus)
    ? (text as EvidenceStatus)
    : null;
}

function normalizeCitationCount(value: unknown): number | null {
  return typeof value === "number" && Number.isInteger(value) && value >= 0
    ? value
    : null;
}

function normalizeRedactedSnapshot(
  value: unknown,
): Record<string, unknown> | null {
  return isRecord(value) ? value : null;
}

function normalizeOptionalRedactedSnapshot(
  value: unknown,
): Record<string, unknown> | null {
  if (value === null || value === undefined) {
    return null;
  }

  return normalizeRedactedSnapshot(value);
}

function normalizeCreatedAt(value: unknown): Date | null {
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value;
  }

  if (typeof value !== "string") {
    return null;
  }

  const createdAt = new Date(value);

  return Number.isNaN(createdAt.getTime()) ? null : createdAt;
}

const questionDraftTypes = new Set([
  "single_choice",
  "multi_choice",
  "true_false",
  "fill_blank",
  "short_answer",
  "case_analysis",
  "calculation",
]);

function hasExactKeys(
  value: Record<string, unknown>,
  keys: readonly string[],
): boolean {
  const actualKeys = Object.keys(value).sort();
  const expectedKeys = [...keys].sort();

  return (
    actualKeys.length === expectedKeys.length &&
    actualKeys.every((key, index) => key === expectedKeys[index])
  );
}

function isSafeText(value: unknown, maxLength: number): value is string {
  return (
    typeof value === "string" &&
    value.trim().length > 0 &&
    value.length <= maxLength &&
    !/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/u.test(value)
  );
}

function isQuestionOption(value: unknown): boolean {
  return (
    isRecord(value) &&
    hasExactKeys(value, ["optionLabel", "optionText"]) &&
    isSafeText(value.optionLabel, 32) &&
    isSafeText(value.optionText, 2_000)
  );
}

function isScoringPoint(value: unknown): boolean {
  const score = isRecord(value) ? Number(value.score) : Number.NaN;

  return (
    isRecord(value) &&
    hasExactKeys(value, ["description", "score", "sortOrder"]) &&
    isSafeText(value.description, 1_000) &&
    isSafeText(value.score, 32) &&
    Number.isFinite(score) &&
    score > 0 &&
    score * 2 === Math.round(score * 2) &&
    Number.isInteger(value.sortOrder) &&
    Number(value.sortOrder) > 0
  );
}

function isFillBlankAnswer(value: unknown): boolean {
  const score = isRecord(value) ? Number(value.score) : Number.NaN;

  return (
    isRecord(value) &&
    hasExactKeys(value, [
      "blankKey",
      "standardAnswers",
      "score",
      "sortOrder",
    ]) &&
    isSafeText(value.blankKey, 100) &&
    Array.isArray(value.standardAnswers) &&
    value.standardAnswers.length > 0 &&
    value.standardAnswers.every((answer) => isSafeText(answer, 1_000)) &&
    isSafeText(value.score, 32) &&
    Number.isFinite(score) &&
    score > 0 &&
    score * 2 === Math.round(score * 2) &&
    Number.isInteger(value.sortOrder) &&
    Number(value.sortOrder) > 0
  );
}

function isQuestionDraftTypeConsistent(
  value: Record<string, unknown>,
): boolean {
  const questionType = value.questionType;
  const questionOptions = (
    Array.isArray(value.questionOptions) ? value.questionOptions : []
  ) as { optionLabel: string; optionText: string }[];
  const scoringPoints = (
    Array.isArray(value.scoringPoints) ? value.scoringPoints : []
  ) as { sortOrder: number }[];
  const fillBlankAnswers = (
    Array.isArray(value.fillBlankAnswers) ? value.fillBlankAnswers : []
  ) as { blankKey: string; sortOrder: number }[];
  const optionLabels = questionOptions.map((questionOption) =>
    questionOption.optionLabel.trim().toUpperCase(),
  );
  const answers = String(value.standardAnswer)
    .trim()
    .toUpperCase()
    .split(/[,，;；、\s]+/u)
    .filter(Boolean);

  if (new Set(optionLabels).size !== optionLabels.length) {
    return false;
  }

  if (questionType === "single_choice" || questionType === "multi_choice") {
    return (
      questionOptions.length >= 2 &&
      scoringPoints.length === 0 &&
      fillBlankAnswers.length === 0 &&
      new Set(answers).size === answers.length &&
      answers.every((answer) => optionLabels.includes(answer)) &&
      (questionType === "single_choice"
        ? answers.length === 1
        : answers.length >= 2)
    );
  }

  if (questionType === "true_false") {
    return (
      questionOptions.length === 0 &&
      scoringPoints.length === 0 &&
      fillBlankAnswers.length === 0 &&
      /^(true|false)$/u.test(String(value.standardAnswer).trim().toLowerCase())
    );
  }

  if (questionType === "fill_blank") {
    return (
      questionOptions.length === 0 &&
      scoringPoints.length === 0 &&
      fillBlankAnswers.length > 0 &&
      new Set(fillBlankAnswers.map((answer) => answer.blankKey)).size ===
        fillBlankAnswers.length &&
      new Set(fillBlankAnswers.map((answer) => answer.sortOrder)).size ===
        fillBlankAnswers.length
    );
  }

  return (
    questionOptions.length === 0 &&
    fillBlankAnswers.length === 0 &&
    scoringPoints.length > 0 &&
    new Set(scoringPoints.map((scoringPoint) => scoringPoint.sortOrder))
      .size === scoringPoints.length
  );
}

function isQuestionDraftSummary(
  value: unknown,
  expectedDraftNumber: number,
): value is AiGenerationRouteIntegratedQuestionDraftSummary {
  if (!isRecord(value)) {
    return false;
  }

  const exactKeys = [
    "draftPublicId",
    "draftNumber",
    "questionType",
    "difficulty",
    "knowledgeNodeCount",
    "knowledgeNodeLabels",
    "questionStem",
    "questionOptions",
    "standardAnswer",
    "analysis",
    "scoringPoints",
    "fillBlankAnswers",
    "reviewStatus",
  ] as const;
  const questionType = value.questionType;
  const questionOptions = value.questionOptions ?? [];
  const scoringPoints = value.scoringPoints;
  const fillBlankAnswers = value.fillBlankAnswers;

  return (
    hasExactKeys(value, exactKeys) &&
    isSafeText(value.draftPublicId, 128) &&
    value.draftNumber === expectedDraftNumber &&
    typeof questionType === "string" &&
    questionDraftTypes.has(questionType) &&
    isSafeText(value.difficulty, 32) &&
    Number.isInteger(value.knowledgeNodeCount) &&
    Number(value.knowledgeNodeCount) >= 0 &&
    Array.isArray(value.knowledgeNodeLabels) &&
    value.knowledgeNodeLabels.length <= 20 &&
    value.knowledgeNodeLabels.every((label) => isSafeText(label, 200)) &&
    Number(value.knowledgeNodeCount) === value.knowledgeNodeLabels.length &&
    isSafeText(value.questionStem, 4_000) &&
    Array.isArray(questionOptions) &&
    questionOptions.length <= 20 &&
    questionOptions.every(isQuestionOption) &&
    isSafeText(value.standardAnswer, 4_000) &&
    isSafeText(value.analysis, 4_000) &&
    Array.isArray(scoringPoints) &&
    scoringPoints.length <= 20 &&
    scoringPoints.every(isScoringPoint) &&
    Array.isArray(fillBlankAnswers) &&
    fillBlankAnswers.length <= 20 &&
    fillBlankAnswers.every(isFillBlankAnswer) &&
    value.reviewStatus === "draft_review_required" &&
    isQuestionDraftTypeConsistent(value)
  );
}

function canonicalize(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(canonicalize);
  }

  if (!isRecord(value)) {
    return value;
  }

  return Object.fromEntries(
    Object.keys(value)
      .sort()
      .map((key) => [key, canonicalize(value[key])]),
  );
}

export function serializePersonalAiGenerationQuestionDraftSnapshot(
  snapshot: PersonalAiGenerationQuestionDraftSnapshotDto,
): string {
  return JSON.stringify(canonicalize(snapshot));
}

export function createPersonalAiGenerationPrivateQuestionDraftSnapshot(input: {
  taskPublicId: string;
  ownerPublicId: string;
  requestedQuestionCount: number;
  questions: AiGenerationRouteIntegratedQuestionDraftSummary[];
}): PersonalAiGenerationPrivateQuestionDraftSnapshotDto | null {
  const snapshot: PersonalAiGenerationQuestionDraftSnapshotDto = {
    schemaVersion: "question_draft_v1",
    kind: "question_set",
    taskPublicId: input.taskPublicId,
    ownerPublicId: input.ownerPublicId,
    taskType: "ai_question_generation",
    requestedQuestionCount: input.requestedQuestionCount,
    questions: input.questions,
  };
  const canonicalSnapshot =
    serializePersonalAiGenerationQuestionDraftSnapshot(snapshot);

  if (
    canonicalSnapshot.length > 1_000_000 ||
    !isPersonalAiGenerationQuestionDraftSnapshot(snapshot)
  ) {
    return null;
  }

  return {
    schemaVersion: "question_draft_v1",
    snapshot: JSON.parse(
      canonicalSnapshot,
    ) as PersonalAiGenerationQuestionDraftSnapshotDto,
    digest: createHash("sha256").update(canonicalSnapshot).digest("hex"),
  };
}

function isPersonalAiGenerationQuestionDraftSnapshot(
  value: unknown,
): value is PersonalAiGenerationQuestionDraftSnapshotDto {
  if (
    !isRecord(value) ||
    !hasExactKeys(value, [
      "schemaVersion",
      "kind",
      "taskPublicId",
      "ownerPublicId",
      "taskType",
      "requestedQuestionCount",
      "questions",
    ]) ||
    value.schemaVersion !== "question_draft_v1" ||
    value.kind !== "question_set" ||
    value.taskType !== "ai_question_generation" ||
    !isSafeText(value.taskPublicId, 128) ||
    !isSafeText(value.ownerPublicId, 128) ||
    !Number.isInteger(value.requestedQuestionCount) ||
    Number(value.requestedQuestionCount) < 1 ||
    Number(value.requestedQuestionCount) > 100 ||
    !Array.isArray(value.questions) ||
    value.questions.length !== value.requestedQuestionCount
  ) {
    return false;
  }

  const draftPublicIds = new Set<string>();

  return value.questions.every((question, index) => {
    if (!isQuestionDraftSummary(question, index + 1)) {
      return false;
    }

    if (
      typeof question.draftPublicId !== "string" ||
      draftPublicIds.has(question.draftPublicId)
    ) {
      return false;
    }

    draftPublicIds.add(question.draftPublicId);
    return true;
  });
}

export function normalizePersonalAiGenerationPrivateQuestionDraftSnapshot(
  value: unknown,
): PersonalAiGenerationPrivateQuestionDraftSnapshotDto | null {
  if (
    !isRecord(value) ||
    !hasExactKeys(value, ["schemaVersion", "snapshot", "digest"]) ||
    value.schemaVersion !== "question_draft_v1" ||
    !isPersonalAiGenerationQuestionDraftSnapshot(value.snapshot) ||
    typeof value.digest !== "string" ||
    !/^[a-f0-9]{64}$/u.test(value.digest)
  ) {
    return null;
  }

  const canonicalSnapshot = serializePersonalAiGenerationQuestionDraftSnapshot(
    value.snapshot,
  );
  const expectedDigest = createHash("sha256")
    .update(canonicalSnapshot)
    .digest("hex");

  return canonicalSnapshot.length <= 1_000_000 &&
    value.digest === expectedDigest
    ? {
        schemaVersion: "question_draft_v1",
        snapshot: JSON.parse(
          canonicalSnapshot,
        ) as PersonalAiGenerationQuestionDraftSnapshotDto,
        digest: value.digest,
      }
    : null;
}

export function normalizePersonalAiGenerationResultPersistenceInput(
  input: unknown,
): PersonalAiGenerationResultPersistenceValidationResult {
  if (!isRecord(input)) {
    return {
      success: false,
      message: INVALID_PERSONAL_AI_GENERATION_RESULT_PERSISTENCE_INPUT_MESSAGE,
    };
  }

  const resultPublicId = normalizeRequiredText(input.resultPublicId);
  const taskPublicId = normalizeRequiredText(input.taskPublicId);
  const ownerType = normalizeOwnerType(input.ownerType);
  const ownerPublicId = normalizeRequiredText(input.ownerPublicId);
  const actorPublicId = normalizeRequiredText(input.actorPublicId);
  const taskType = normalizeTaskType(input.taskType);
  const contentRedactedSnapshot = normalizeRedactedSnapshot(
    input.contentRedactedSnapshot,
  );
  const contentDigest = normalizeRequiredText(input.contentDigest);
  const contentPreviewMasked = normalizeRequiredText(
    input.contentPreviewMasked,
  );
  const citationRedactedSnapshot = normalizeOptionalRedactedSnapshot(
    input.citationRedactedSnapshot,
  );
  const privateQuestionDraftSnapshot =
    input.privateQuestionDraftSnapshot == null
      ? null
      : normalizePersonalAiGenerationPrivateQuestionDraftSnapshot(
          input.privateQuestionDraftSnapshot,
        );
  const evidenceStatus = normalizeEvidenceStatus(input.evidenceStatus);
  const citationCount = normalizeCitationCount(input.citationCount);
  const createdAt = normalizeCreatedAt(input.createdAt);

  if (
    resultPublicId === null ||
    taskPublicId === null ||
    ownerType === null ||
    ownerPublicId === null ||
    actorPublicId === null ||
    taskType === null ||
    contentRedactedSnapshot === null ||
    contentDigest === null ||
    contentPreviewMasked === null ||
    evidenceStatus === null ||
    citationCount === null ||
    createdAt === null ||
    (taskType === "ai_question_generation" &&
      privateQuestionDraftSnapshot === null) ||
    (taskType === "ai_paper_generation" &&
      input.privateQuestionDraftSnapshot != null)
  ) {
    return {
      success: false,
      message: INVALID_PERSONAL_AI_GENERATION_RESULT_PERSISTENCE_INPUT_MESSAGE,
    };
  }

  return {
    success: true,
    value: {
      resultPublicId,
      taskPublicId,
      ownerType,
      ownerPublicId,
      actorPublicId,
      taskType,
      contentRedactedSnapshot,
      contentDigest,
      contentPreviewMasked,
      privateQuestionDraftSnapshot,
      citationRedactedSnapshot,
      evidenceStatus,
      citationCount,
      aiCallLogPublicId: normalizeOptionalText(input.aiCallLogPublicId),
      createdAt,
    },
  };
}
