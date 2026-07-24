import { createHash } from "node:crypto";

import type {
  PersonalAiGenerationPaperQuestionSourceDto,
  PersonalAiGenerationPaperQuestionSnapshotDto,
  PersonalAiGenerationPrivatePaperQuestionSnapshotDto,
  PersonalAiGenerationPrivateQuestionDraftSnapshotDto,
  PersonalAiGenerationQuestionDraftSnapshotDto,
} from "../contracts/personal-ai-generation-result-persistence-contract";
import type {
  AiPaperPlanAndSelectContainerDto,
  AiPaperQuestionGroupSnapshotDto,
} from "../contracts/ai-paper-plan-and-select-contract";
import type { AiGenerationRouteIntegratedQuestionDraftSummary } from "../contracts/route-integrated-provider-execution-contract";
import {
  aiGenerationTaskTypeValues,
  type AiGenerationTaskType,
} from "../models/ai-generation-task";
import { evidenceStatusValues, type EvidenceStatus } from "../models/ai-rag";
import {
  professionValues,
  questionTypeValues,
  subjectValues,
  type Profession,
  type QuestionType,
  type Subject,
} from "../models/paper";
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

function isDenseArray(value: unknown, maxLength: number): value is unknown[] {
  if (!Array.isArray(value) || value.length > maxLength) {
    return false;
  }

  return Array.from({ length: value.length }, (_, index) => index).every(
    (index) => Object.hasOwn(value, index),
  );
}

function isDenseArrayWithoutLocalCap(value: unknown): value is unknown[] {
  return (
    Array.isArray(value) &&
    Array.from({ length: value.length }, (_, index) => index).every((index) =>
      Object.hasOwn(value, index),
    )
  );
}

function isSafeOptionalText(value: unknown, maxLength: number): boolean {
  return value === null || isSafeText(value, maxLength);
}

function isSafePositiveInteger(value: unknown, maxValue = 1_000_000): boolean {
  return (
    typeof value === "number" &&
    Number.isSafeInteger(value) &&
    value > 0 &&
    value <= maxValue
  );
}

function isSafeNonNegativeInteger(
  value: unknown,
  maxValue = 1_000_000,
): boolean {
  return (
    typeof value === "number" &&
    Number.isSafeInteger(value) &&
    value >= 0 &&
    value <= maxValue
  );
}

function isStrictIsoDateTime(value: unknown): value is string {
  if (typeof value !== "string") {
    return false;
  }

  const parsed = new Date(value);

  return !Number.isNaN(parsed.getTime()) && parsed.toISOString() === value;
}

function isUniqueSafeTextArray(
  value: unknown,
  maximumItems: number,
  maximumItemLength = 128,
): value is string[] {
  return (
    isDenseArray(value, maximumItems) &&
    value.every((item) => isSafeText(item, maximumItemLength)) &&
    new Set(value).size === value.length &&
    isOrdinalUniqueTextArray(value)
  );
}

function isOrdinalUniqueTextArray(value: readonly string[]): boolean {
  const folded = new Set<string>();

  for (const item of value) {
    const foldedItem = item.toLowerCase();

    if (folded.has(foldedItem)) {
      return false;
    }

    folded.add(foldedItem);
  }

  return true;
}

function isPaperQuestionGroupSnapshot(
  value: unknown,
): value is AiPaperQuestionGroupSnapshotDto | null {
  if (value === null) {
    return true;
  }

  if (
    !isRecord(value) ||
    !hasExactKeys(value, [
      "publicId",
      "title",
      "materialSnapshot",
      "memberQuestionPublicIds",
      "questionSortOrder",
    ]) ||
    !isSafeText(value.publicId, 128) ||
    !isSafeText(value.title, 500) ||
    !isSafePositiveInteger(value.questionSortOrder, 100) ||
    !isUniqueSafeTextArray(value.memberQuestionPublicIds, 80) ||
    !isOrdinalUniqueTextArray(value.memberQuestionPublicIds) ||
    !isRecord(value.materialSnapshot) ||
    !hasExactKeys(value.materialSnapshot, [
      "materialPublicId",
      "title",
      "contentRichText",
    ]) ||
    !isSafeOptionalText(value.materialSnapshot.materialPublicId, 128) ||
    !isSafeText(value.materialSnapshot.title, 2_000) ||
    !isSafeText(value.materialSnapshot.contentRichText, 100_000)
  ) {
    return false;
  }

  return true;
}

function isSelectedConstraintMatchBasis(value: unknown): boolean {
  return (
    isRecord(value) &&
    hasExactKeys(value, [
      "difficulty",
      "knowledgeNodePublicIds",
      "parentKnowledgeNodePublicIds",
      "ancestorKnowledgeNodePublicIds",
      "matchTier",
    ]) &&
    isSafeOptionalText(value.difficulty, 64) &&
    isUniqueSafeTextArray(value.knowledgeNodePublicIds, 100) &&
    isUniqueSafeTextArray(value.parentKnowledgeNodePublicIds, 100) &&
    isUniqueSafeTextArray(value.ancestorKnowledgeNodePublicIds, 100) &&
    ["exact", "descendant", "nearby_knowledge", "same_scope"].includes(
      String(value.matchTier),
    )
  );
}

function isAiPaperPlanAndSelectContainer(
  value: unknown,
): value is AiPaperPlanAndSelectContainerDto {
  if (
    !isRecord(value) ||
    !hasExactKeys(value, [
      "title",
      "profession",
      "level",
      "subject",
      "requestedQuestionCount",
      "selectedQuestionCount",
      "sourceComposition",
      "matchQuality",
      "constraintLineage",
      "sections",
    ]) ||
    !isSafeText(value.title, 2_000) ||
    !professionValues.includes(value.profession as Profession) ||
    !isSafePositiveInteger(value.level, 100) ||
    !subjectValues.includes(value.subject as Subject) ||
    !isSafePositiveInteger(value.requestedQuestionCount, 80) ||
    !isSafeNonNegativeInteger(value.selectedQuestionCount, 80) ||
    Number(value.selectedQuestionCount) >
      Number(value.requestedQuestionCount) ||
    ![
      "fully_matched",
      "supplemented_from_nearby_knowledge",
      "supplemented_from_same_scope",
      "insufficient",
    ].includes(String(value.matchQuality)) ||
    !isRecord(value.sourceComposition) ||
    !hasExactKeys(value.sourceComposition, [
      "platformFormalQuestionCount",
      "enterpriseTrainingSnapshotCount",
    ]) ||
    !isSafeNonNegativeInteger(
      value.sourceComposition.platformFormalQuestionCount,
      80,
    ) ||
    !isSafeNonNegativeInteger(
      value.sourceComposition.enterpriseTrainingSnapshotCount,
      80,
    ) ||
    Number(value.sourceComposition.platformFormalQuestionCount) +
      Number(value.sourceComposition.enterpriseTrainingSnapshotCount) !==
      Number(value.selectedQuestionCount) ||
    !isRecord(value.constraintLineage) ||
    !hasExactKeys(value.constraintLineage, ["request", "plan"]) ||
    !isRecord(value.constraintLineage.request) ||
    !hasExactKeys(value.constraintLineage.request, [
      "difficulty",
      "knowledgeNodePublicIds",
    ]) ||
    !isSafeOptionalText(value.constraintLineage.request.difficulty, 64) ||
    !isUniqueSafeTextArray(
      value.constraintLineage.request.knowledgeNodePublicIds,
      100,
    ) ||
    !isRecord(value.constraintLineage.plan) ||
    !hasExactKeys(value.constraintLineage.plan, [
      "difficulty",
      "knowledgeNodePublicIds",
      "parentKnowledgeNodePublicIds",
    ]) ||
    !isSafeOptionalText(value.constraintLineage.plan.difficulty, 64) ||
    !isUniqueSafeTextArray(
      value.constraintLineage.plan.knowledgeNodePublicIds,
      100,
    ) ||
    !isUniqueSafeTextArray(
      value.constraintLineage.plan.parentKnowledgeNodePublicIds,
      100,
    ) ||
    !isDenseArray(value.sections, 20) ||
    value.sections.length === 0
  ) {
    return false;
  }

  let selectedQuestionCount = 0;
  const selectedKeys = new Set<string>();
  const foldedSelectedKeys = new Set<string>();
  const exactGroupKeyByFoldedKey = new Map<string, string>();
  const groupFactsByKey = new Map<
    string,
    {
      sourceKind: string;
      memberQuestionPublicIds: string[];
      canonicalFacts: string;
    }
  >();

  for (const section of value.sections) {
    if (
      !isRecord(section) ||
      !hasExactKeys(section, [
        "sectionKey",
        "title",
        "questionType",
        "targetQuestionCount",
        "selectedQuestionCount",
        "selectedQuestions",
        "degradationSummary",
      ]) ||
      !isSafeText(section.sectionKey, 128) ||
      !isSafeText(section.title, 500) ||
      !questionTypeValues.includes(section.questionType as QuestionType) ||
      !isSafePositiveInteger(section.targetQuestionCount, 80) ||
      !isSafeNonNegativeInteger(section.selectedQuestionCount, 80) ||
      !isDenseArray(section.selectedQuestions, 80) ||
      section.selectedQuestions.length !== section.selectedQuestionCount ||
      !isRecord(section.degradationSummary) ||
      (!hasExactKeys(section.degradationSummary, [
        "exactCount",
        "nearbyKnowledgeCount",
        "sameScopeCount",
      ]) &&
        !hasExactKeys(section.degradationSummary, [
          "exactCount",
          "descendantCount",
          "nearbyKnowledgeCount",
          "sameScopeCount",
        ])) ||
      !isSafeNonNegativeInteger(section.degradationSummary.exactCount, 80) ||
      (section.degradationSummary.descendantCount !== undefined &&
        !isSafeNonNegativeInteger(
          section.degradationSummary.descendantCount,
          80,
        )) ||
      !isSafeNonNegativeInteger(
        section.degradationSummary.nearbyKnowledgeCount,
        80,
      ) ||
      !isSafeNonNegativeInteger(section.degradationSummary.sameScopeCount, 80)
    ) {
      return false;
    }

    const degradationCount =
      Number(section.degradationSummary.exactCount) +
      Number(section.degradationSummary.descendantCount ?? 0) +
      Number(section.degradationSummary.nearbyKnowledgeCount) +
      Number(section.degradationSummary.sameScopeCount);

    if (degradationCount !== section.selectedQuestions.length) {
      return false;
    }

    for (const selectedQuestion of section.selectedQuestions) {
      if (
        !isRecord(selectedQuestion) ||
        !hasExactKeys(selectedQuestion, [
          "questionPublicId",
          "sourceKind",
          "matchTier",
          "score",
          "constraintMatchBasis",
          "questionGroup",
        ]) ||
        !isSafeText(selectedQuestion.questionPublicId, 128) ||
        !["platform_formal_question", "enterprise_training_snapshot"].includes(
          String(selectedQuestion.sourceKind),
        ) ||
        !["exact", "descendant", "nearby_knowledge", "same_scope"].includes(
          String(selectedQuestion.matchTier),
        ) ||
        typeof selectedQuestion.score !== "number" ||
        !Number.isFinite(selectedQuestion.score) ||
        selectedQuestion.score <= 0 ||
        selectedQuestion.score > 10_000 ||
        !isSelectedConstraintMatchBasis(
          selectedQuestion.constraintMatchBasis,
        ) ||
        !isPaperQuestionGroupSnapshot(selectedQuestion.questionGroup)
      ) {
        return false;
      }

      const selectedKey = `${selectedQuestion.sourceKind}\u0000${selectedQuestion.questionPublicId}`;
      const foldedSelectedKey = selectedKey.toLowerCase();

      if (
        selectedKeys.has(selectedKey) ||
        foldedSelectedKeys.has(foldedSelectedKey)
      ) {
        return false;
      }

      selectedKeys.add(selectedKey);
      foldedSelectedKeys.add(foldedSelectedKey);
      selectedQuestionCount += 1;

      if (selectedQuestion.questionGroup !== null) {
        const questionGroup = selectedQuestion.questionGroup;

        if (
          questionGroup.questionSortOrder >
            questionGroup.memberQuestionPublicIds.length ||
          questionGroup.memberQuestionPublicIds[
            questionGroup.questionSortOrder - 1
          ] !== selectedQuestion.questionPublicId
        ) {
          return false;
        }

        const groupKey = `${selectedQuestion.sourceKind}\u0000${questionGroup.publicId}`;
        const foldedGroupKey = groupKey.toLowerCase();
        const existingExactGroupKey =
          exactGroupKeyByFoldedKey.get(foldedGroupKey);
        const canonicalFacts = JSON.stringify(
          canonicalize({
            publicId: questionGroup.publicId,
            title: questionGroup.title,
            materialSnapshot: questionGroup.materialSnapshot,
            memberQuestionPublicIds: questionGroup.memberQuestionPublicIds,
          }),
        );
        const existingGroup = groupFactsByKey.get(groupKey);

        if (
          (existingExactGroupKey !== undefined &&
            existingExactGroupKey !== groupKey) ||
          (existingGroup !== undefined &&
            existingGroup.canonicalFacts !== canonicalFacts)
        ) {
          return false;
        }

        exactGroupKeyByFoldedKey.set(foldedGroupKey, groupKey);
        groupFactsByKey.set(groupKey, {
          sourceKind: String(selectedQuestion.sourceKind),
          memberQuestionPublicIds: [...questionGroup.memberQuestionPublicIds],
          canonicalFacts,
        });
      }
    }
  }

  return (
    selectedQuestionCount === value.selectedQuestionCount &&
    [...groupFactsByKey.values()].every((group) =>
      group.memberQuestionPublicIds.every((questionPublicId) =>
        selectedKeys.has(`${group.sourceKind}\u0000${questionPublicId}`),
      ),
    )
  );
}

function isPaperQuestionOption(value: unknown): boolean {
  return (
    isRecord(value) &&
    hasExactKeys(value, ["optionLabel", "optionText", "isCorrect"]) &&
    isSafeText(value.optionLabel, 32) &&
    isSafeText(value.optionText, 4_000) &&
    typeof value.isCorrect === "boolean"
  );
}

function isPaperQuestionScoringPoint(value: unknown): boolean {
  return (
    isRecord(value) &&
    hasExactKeys(value, ["description", "score", "sortOrder"]) &&
    isSafeText(value.description, 2_000) &&
    isSafeText(value.score, 32) &&
    Number.isFinite(Number(value.score)) &&
    Number(value.score) > 0 &&
    isSafePositiveInteger(value.sortOrder, 100)
  );
}

function isPaperQuestionFillBlankAnswer(value: unknown): boolean {
  return (
    isRecord(value) &&
    hasExactKeys(value, [
      "blankKey",
      "standardAnswers",
      "score",
      "sortOrder",
    ]) &&
    isSafeText(value.blankKey, 128) &&
    isUniqueSafeTextArray(value.standardAnswers, 20, 2_000) &&
    value.standardAnswers.length > 0 &&
    isSafeText(value.score, 32) &&
    Number.isFinite(Number(value.score)) &&
    Number(value.score) > 0 &&
    isSafePositiveInteger(value.sortOrder, 100)
  );
}

function isPaperQuestionSourceVersion(
  value: unknown,
  sourceKind: PersonalAiGenerationPaperQuestionSourceDto["sourceKind"],
): boolean {
  if (!isRecord(value)) {
    return false;
  }

  if (sourceKind === "platform_formal_question") {
    return (
      hasExactKeys(value, ["kind", "updatedAt"]) &&
      value.kind === "platform_question_updated_at" &&
      isStrictIsoDateTime(value.updatedAt)
    );
  }

  return (
    hasExactKeys(value, [
      "kind",
      "trainingVersionPublicId",
      "trainingVersionNumber",
      "publishedAt",
    ]) &&
    value.kind === "organization_training_version" &&
    isSafeText(value.trainingVersionPublicId, 128) &&
    isSafePositiveInteger(value.trainingVersionNumber) &&
    isStrictIsoDateTime(value.publishedAt)
  );
}

function isPaperQuestionSource(
  value: unknown,
): value is PersonalAiGenerationPaperQuestionSourceDto {
  if (
    !isRecord(value) ||
    !hasExactKeys(value, [
      "questionPublicId",
      "sourceKind",
      "sourceVersion",
      "profession",
      "level",
      "subject",
      "questionType",
      "difficulty",
      "knowledgeNodePublicIds",
      "parentKnowledgeNodePublicIds",
      "ancestorKnowledgeNodePublicIds",
      "questionStem",
      "questionOptions",
      "standardAnswerLabels",
      "standardAnswerText",
      "analysis",
      "scoringPoints",
      "fillBlankAnswers",
      "questionGroup",
    ]) ||
    !isSafeText(value.questionPublicId, 128) ||
    !["platform_formal_question", "enterprise_training_snapshot"].includes(
      String(value.sourceKind),
    ) ||
    !isPaperQuestionSourceVersion(
      value.sourceVersion,
      value.sourceKind as PersonalAiGenerationPaperQuestionSourceDto["sourceKind"],
    ) ||
    !professionValues.includes(value.profession as Profession) ||
    !isSafePositiveInteger(value.level, 100) ||
    !subjectValues.includes(value.subject as Subject) ||
    !questionTypeValues.includes(value.questionType as QuestionType) ||
    !isSafeOptionalText(value.difficulty, 64) ||
    !isUniqueSafeTextArray(value.knowledgeNodePublicIds, 100) ||
    !isUniqueSafeTextArray(value.parentKnowledgeNodePublicIds, 100) ||
    !isUniqueSafeTextArray(value.ancestorKnowledgeNodePublicIds, 100) ||
    !isSafeText(value.questionStem, 20_000) ||
    !isDenseArray(value.questionOptions, 20) ||
    !value.questionOptions.every(isPaperQuestionOption) ||
    !isUniqueSafeTextArray(value.standardAnswerLabels, 20, 32) ||
    !isSafeOptionalText(value.standardAnswerText, 20_000) ||
    !isSafeOptionalText(value.analysis, 20_000) ||
    !isDenseArray(value.scoringPoints, 20) ||
    !value.scoringPoints.every(isPaperQuestionScoringPoint) ||
    !isDenseArray(value.fillBlankAnswers, 20) ||
    !value.fillBlankAnswers.every(isPaperQuestionFillBlankAnswer) ||
    !isPaperQuestionGroupSnapshot(value.questionGroup)
  ) {
    return false;
  }

  const optionLabels = value.questionOptions.map((questionOption) =>
    String((questionOption as Record<string, unknown>).optionLabel),
  );
  const scoringPointOrders = value.scoringPoints.map((scoringPoint) =>
    Number((scoringPoint as Record<string, unknown>).sortOrder),
  );
  const blankKeys = value.fillBlankAnswers.map((fillBlankAnswer) =>
    String((fillBlankAnswer as Record<string, unknown>).blankKey),
  );

  return (
    isOrdinalUniqueTextArray(optionLabels) &&
    new Set(scoringPointOrders).size === scoringPointOrders.length &&
    isOrdinalUniqueTextArray(blankKeys)
  );
}

function collectSelectedPaperQuestions(
  paperAssemblyContainer: AiPaperPlanAndSelectContainerDto,
): Array<{
  questionPublicId: string;
  sourceKind: PersonalAiGenerationPaperQuestionSourceDto["sourceKind"];
  questionType: QuestionType;
  difficulty: string | null;
  knowledgeNodePublicIds: string[];
  parentKnowledgeNodePublicIds: string[];
  ancestorKnowledgeNodePublicIds: string[];
  questionGroup: unknown;
}> {
  return paperAssemblyContainer.sections.flatMap((section) =>
    section.selectedQuestions.map((selectedQuestion) => ({
      questionPublicId: selectedQuestion.questionPublicId,
      sourceKind: selectedQuestion.sourceKind,
      questionType: section.questionType,
      difficulty: selectedQuestion.constraintMatchBasis?.difficulty ?? null,
      knowledgeNodePublicIds:
        selectedQuestion.constraintMatchBasis?.knowledgeNodePublicIds ?? [],
      parentKnowledgeNodePublicIds:
        selectedQuestion.constraintMatchBasis?.parentKnowledgeNodePublicIds ??
        [],
      ancestorKnowledgeNodePublicIds:
        selectedQuestion.constraintMatchBasis?.ancestorKnowledgeNodePublicIds ??
        [],
      questionGroup: selectedQuestion.questionGroup ?? null,
    })),
  );
}

function paperQuestionSourceMatchesSelection(
  sourceQuestion: PersonalAiGenerationPaperQuestionSourceDto,
  selectedQuestion: ReturnType<typeof collectSelectedPaperQuestions>[number],
  paperAssemblyContainer: AiPaperPlanAndSelectContainerDto,
): boolean {
  return (
    sourceQuestion.questionPublicId === selectedQuestion.questionPublicId &&
    sourceQuestion.sourceKind === selectedQuestion.sourceKind &&
    sourceQuestion.profession === paperAssemblyContainer.profession &&
    sourceQuestion.level === paperAssemblyContainer.level &&
    sourceQuestion.subject === paperAssemblyContainer.subject &&
    sourceQuestion.questionType === selectedQuestion.questionType &&
    sourceQuestion.difficulty === selectedQuestion.difficulty &&
    JSON.stringify(sourceQuestion.knowledgeNodePublicIds) ===
      JSON.stringify(selectedQuestion.knowledgeNodePublicIds) &&
    JSON.stringify(sourceQuestion.parentKnowledgeNodePublicIds) ===
      JSON.stringify(selectedQuestion.parentKnowledgeNodePublicIds) &&
    JSON.stringify(sourceQuestion.ancestorKnowledgeNodePublicIds) ===
      JSON.stringify(selectedQuestion.ancestorKnowledgeNodePublicIds) &&
    JSON.stringify(canonicalize(sourceQuestion.questionGroup)) ===
      JSON.stringify(canonicalize(selectedQuestion.questionGroup))
  );
}

export function serializePersonalAiGenerationPaperQuestionSnapshot(
  snapshot: PersonalAiGenerationPaperQuestionSnapshotDto,
): string {
  return JSON.stringify(canonicalize(snapshot));
}

export function serializePersonalAiGenerationPaperAssemblyContainer(
  container: AiPaperPlanAndSelectContainerDto,
): string {
  return JSON.stringify(canonicalize(container));
}

function isPersonalAiGenerationPaperQuestionSnapshot(
  value: unknown,
): value is PersonalAiGenerationPaperQuestionSnapshotDto {
  if (
    !isRecord(value) ||
    !hasExactKeys(value, [
      "schemaVersion",
      "kind",
      "resultPublicId",
      "taskPublicId",
      "ownerType",
      "ownerPublicId",
      "taskType",
      "paperAssemblyDigest",
      "paperAssemblyContainer",
      "questions",
    ]) ||
    value.schemaVersion !== "paper_question_snapshot_v1" ||
    value.kind !== "paper_question_set" ||
    value.taskType !== "ai_paper_generation" ||
    !isSafeText(value.resultPublicId, 128) ||
    !isSafeText(value.taskPublicId, 128) ||
    !["personal", "organization"].includes(String(value.ownerType)) ||
    !isSafeText(value.ownerPublicId, 128) ||
    typeof value.paperAssemblyDigest !== "string" ||
    !/^[a-f0-9]{64}$/u.test(value.paperAssemblyDigest) ||
    !isAiPaperPlanAndSelectContainer(value.paperAssemblyContainer) ||
    !isDenseArray(value.questions, 80) ||
    !value.questions.every(isPaperQuestionSource)
  ) {
    return false;
  }

  const canonicalContainer = JSON.stringify(
    canonicalize(value.paperAssemblyContainer),
  );
  const expectedContainerDigest = createHash("sha256")
    .update(canonicalContainer)
    .digest("hex");
  const paperAssemblyContainer = value.paperAssemblyContainer;
  const selectedQuestions = collectSelectedPaperQuestions(
    paperAssemblyContainer,
  );

  return (
    value.paperAssemblyDigest === expectedContainerDigest &&
    selectedQuestions.length === value.questions.length &&
    value.questions.every((question, index) =>
      paperQuestionSourceMatchesSelection(
        question,
        selectedQuestions[index]!,
        paperAssemblyContainer,
      ),
    )
  );
}

export function createPersonalAiGenerationPrivatePaperQuestionSnapshot(input: {
  resultPublicId: string;
  taskPublicId: string;
  ownerType: PersonalAiGenerationResultOwnerType;
  ownerPublicId: string;
  paperAssemblyContainer: AiPaperPlanAndSelectContainerDto;
  sourceQuestions: PersonalAiGenerationPaperQuestionSourceDto[];
}): PersonalAiGenerationPrivatePaperQuestionSnapshotDto | null {
  if (
    !isAiPaperPlanAndSelectContainer(input.paperAssemblyContainer) ||
    !isDenseArrayWithoutLocalCap(input.sourceQuestions) ||
    !input.sourceQuestions.every(isPaperQuestionSource)
  ) {
    return null;
  }

  const candidatesByKey = new Map<
    string,
    PersonalAiGenerationPaperQuestionSourceDto
  >();
  const foldedCandidateKeys = new Set<string>();

  for (const sourceQuestion of input.sourceQuestions) {
    const key = `${sourceQuestion.sourceKind}\u0000${sourceQuestion.questionPublicId}`;
    const foldedKey = key.toLowerCase();

    if (candidatesByKey.has(key) || foldedCandidateKeys.has(foldedKey)) {
      return null;
    }

    candidatesByKey.set(key, sourceQuestion);
    foldedCandidateKeys.add(foldedKey);
  }

  const selectedQuestions = collectSelectedPaperQuestions(
    input.paperAssemblyContainer,
  );
  const selectedSourceQuestions: PersonalAiGenerationPaperQuestionSourceDto[] =
    [];

  for (const selectedQuestion of selectedQuestions) {
    const sourceQuestion = candidatesByKey.get(
      `${selectedQuestion.sourceKind}\u0000${selectedQuestion.questionPublicId}`,
    );

    if (
      sourceQuestion === undefined ||
      !paperQuestionSourceMatchesSelection(
        sourceQuestion,
        selectedQuestion,
        input.paperAssemblyContainer,
      )
    ) {
      return null;
    }

    selectedSourceQuestions.push(sourceQuestion);
  }

  const canonicalContainer = JSON.stringify(
    canonicalize(input.paperAssemblyContainer),
  );
  const snapshot: PersonalAiGenerationPaperQuestionSnapshotDto = {
    schemaVersion: "paper_question_snapshot_v1",
    kind: "paper_question_set",
    resultPublicId: input.resultPublicId,
    taskPublicId: input.taskPublicId,
    ownerType: input.ownerType,
    ownerPublicId: input.ownerPublicId,
    taskType: "ai_paper_generation",
    paperAssemblyDigest: createHash("sha256")
      .update(canonicalContainer)
      .digest("hex"),
    paperAssemblyContainer: input.paperAssemblyContainer,
    questions: selectedSourceQuestions,
  };
  const canonicalSnapshot =
    serializePersonalAiGenerationPaperQuestionSnapshot(snapshot);

  if (
    canonicalSnapshot.length > 5_000_000 ||
    !isPersonalAiGenerationPaperQuestionSnapshot(snapshot)
  ) {
    return null;
  }

  return {
    schemaVersion: "paper_question_snapshot_v1",
    snapshot: JSON.parse(
      canonicalSnapshot,
    ) as PersonalAiGenerationPaperQuestionSnapshotDto,
    digest: createHash("sha256").update(canonicalSnapshot).digest("hex"),
  };
}

export function normalizePersonalAiGenerationPrivatePaperQuestionSnapshot(
  value: unknown,
): PersonalAiGenerationPrivatePaperQuestionSnapshotDto | null {
  if (
    !isRecord(value) ||
    !hasExactKeys(value, ["schemaVersion", "snapshot", "digest"]) ||
    value.schemaVersion !== "paper_question_snapshot_v1" ||
    !isPersonalAiGenerationPaperQuestionSnapshot(value.snapshot) ||
    typeof value.digest !== "string" ||
    !/^[a-f0-9]{64}$/u.test(value.digest)
  ) {
    return null;
  }

  const canonicalSnapshot = serializePersonalAiGenerationPaperQuestionSnapshot(
    value.snapshot,
  );
  const expectedDigest = createHash("sha256")
    .update(canonicalSnapshot)
    .digest("hex");

  return canonicalSnapshot.length <= 5_000_000 &&
    value.digest === expectedDigest
    ? {
        schemaVersion: "paper_question_snapshot_v1",
        snapshot: JSON.parse(
          canonicalSnapshot,
        ) as PersonalAiGenerationPaperQuestionSnapshotDto,
        digest: value.digest,
      }
    : null;
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
  const privatePaperQuestionSnapshot =
    input.privatePaperQuestionSnapshot == null
      ? null
      : normalizePersonalAiGenerationPrivatePaperQuestionSnapshot(
          input.privatePaperQuestionSnapshot,
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
      (privateQuestionDraftSnapshot === null ||
        input.privatePaperQuestionSnapshot != null)) ||
    (taskType === "ai_paper_generation" &&
      (input.privateQuestionDraftSnapshot != null ||
        privatePaperQuestionSnapshot === null))
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
      privatePaperQuestionSnapshot,
      citationRedactedSnapshot,
      evidenceStatus,
      citationCount,
      aiCallLogPublicId: normalizeOptionalText(input.aiCallLogPublicId),
      createdAt,
    },
  };
}
