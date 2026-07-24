import { createHash } from "node:crypto";

import { aiQuestionDraftSchemaVersion } from "@/ai/prompts/templates";

import type {
  AiGenerationRouteIntegratedProviderErrorSummary,
  AiGenerationRouteIntegratedProviderExecutionOutcome,
  AiGenerationRouteIntegratedProviderExecutionSummary,
  AiGenerationRouteIntegratedProviderFailureCategory,
  AiGenerationRouteIntegratedProviderLimits,
  AiGenerationRouteIntegratedProviderMetadata,
  AiGenerationRouteIntegratedPaperSectionDraftSummary,
  AiGenerationRouteIntegratedQuestionDraftSummary,
  AiGenerationRouteIntegratedQuestionOptionDraft,
  AiGenerationRouteIntegratedStructuredPreview,
  AiGenerationRouteIntegratedStructuredPreviewOptions,
  AiGenerationRouteIntegratedProviderUsageSummary,
  AiGenerationRouteIntegratedGroundingContext,
  AiGenerationRouteIntegratedGroundingSummary,
  AiGenerationRouteIntegratedVisibleGeneratedContent,
} from "../contracts/route-integrated-provider-execution-contract";
import { normalizeProviderTokenUsageAtAdapterEdge } from "./ai-call-observation";
import {
  createAiGenerationSharedTaskStructuredPreviewOptions,
  getAiGenerationSharedTaskSpec,
  type AiGenerationSharedTaskPreviewOptionsInput,
  type AiGenerationSharedTaskType,
} from "../contracts/ai-generation-task-spec-contract";

export const qwenRouteIntegratedProviderMetadata = {
  modelProvider: "openai_compatible",
  providerName: "alibaba-qwen",
  modelName: "qwen3.7-max",
  baseUrlHost: "dashscope.aliyuncs.com",
  envKeyAlias: "ALIBABA_API_KEY",
} as const satisfies AiGenerationRouteIntegratedProviderMetadata;

export const qwenRouteIntegratedProviderLimits = {
  maxRequests: 1,
  maxRetries: 0,
  maxOutputTokens: 1800,
  timeoutMs: 60000,
} as const satisfies AiGenerationRouteIntegratedProviderLimits;

const forbiddenProviderExecutionEvidenceKeys = [
  "apiKey",
  "authorizationHeader",
  "secret",
  "token",
  "databaseUrl",
  "rawPrompt",
  "providerPayload",
  "providerResponse",
  "rawGeneratedOutput",
] as const;

const visibleGeneratedContentMaxLength = 2000;
const forbiddenPaperPlanGeneratedQuestionKeys = new Set([
  "questions",
  "questionDrafts",
  "question_drafts",
  "questionItems",
  "question_items",
  "questionStem",
  "question_stem",
  "stem",
  "questionOptions",
  "question_options",
  "options",
  "standardAnswer",
  "standard_answer",
  "answer",
  "answers",
  "analysis",
  "scoringPoints",
  "scoring_points",
]);
type ParsedRouteIntegratedProviderContent =
  | Record<string, unknown>
  | unknown[]
  | null;

export function createBlockedRouteIntegratedProviderExecutionSummary(
  failureCategory: Exclude<
    AiGenerationRouteIntegratedProviderFailureCategory,
    null
  >,
): AiGenerationRouteIntegratedProviderExecutionSummary {
  return {
    requestCount: 0,
    resultStatus: "blocked",
    failureCategory,
    durationMs: 0,
    usageSummary: null,
    providerErrorSummary: null,
    redactionStatus: "redacted",
  };
}

export function createDefaultBlockedRouteIntegratedProviderExecutionOutcome(): AiGenerationRouteIntegratedProviderExecutionOutcome {
  return {
    realProviderExecutionApproved: false,
    providerCallExecuted: false,
    envSecretAccessed: false,
    providerConfigurationRead: false,
    executionSummary: createBlockedRouteIntegratedProviderExecutionSummary(
      "provider_call_blocked",
    ),
    aiCallLogPublicId: null,
    visibleGeneratedContent: null,
  };
}

export function ensureRouteIntegratedProviderExecutionSummaryRedacted(
  executionSummary: AiGenerationRouteIntegratedProviderExecutionSummary,
  additionalForbiddenEvidenceValues: string[] = [],
): AiGenerationRouteIntegratedProviderExecutionSummary {
  const serializedSummary = JSON.stringify(executionSummary);
  const forbiddenValueFound = [
    ...forbiddenProviderExecutionEvidenceKeys,
    ...additionalForbiddenEvidenceValues,
  ].some((forbiddenValue) => serializedSummary.includes(forbiddenValue));

  return forbiddenValueFound
    ? createBlockedRouteIntegratedProviderExecutionSummary(
        "redaction_violation",
      )
    : executionSummary;
}

export function summarizeRouteIntegratedProviderUsage(
  usage: unknown,
): AiGenerationRouteIntegratedProviderUsageSummary {
  if (usage === null || usage === undefined) {
    return null;
  }
  return normalizeProviderTokenUsageAtAdapterEdge(usage);
}

export function createRouteIntegratedVisibleGeneratedContent(
  content: unknown,
  options?: {
    groundingSummary?: AiGenerationRouteIntegratedGroundingSummary;
    structuredPreview?: AiGenerationRouteIntegratedStructuredPreviewOptions;
  },
): AiGenerationRouteIntegratedVisibleGeneratedContent | null {
  if (typeof content !== "string") {
    return null;
  }

  const normalizedContent = content.trim();

  if (normalizedContent.length === 0) {
    return null;
  }

  const visibleGeneratedContent: AiGenerationRouteIntegratedVisibleGeneratedContent =
    {
      content:
        normalizedContent.length > visibleGeneratedContentMaxLength
          ? normalizedContent.slice(0, visibleGeneratedContentMaxLength)
          : normalizedContent,
      contentVisibility: "transient_response_only",
      persistenceStatus: "not_persisted",
      safetyStatus: "checked",
    };

  if (options?.groundingSummary !== undefined) {
    visibleGeneratedContent.groundingSummary = options.groundingSummary;
  }

  if (options?.structuredPreview === undefined) {
    return visibleGeneratedContent;
  }

  return {
    ...visibleGeneratedContent,
    structuredPreview: createRouteIntegratedStructuredPreview(
      normalizedContent,
      options.structuredPreview,
    ),
  };
}

export function addRouteIntegratedStructuredPreview(
  visibleGeneratedContent: AiGenerationRouteIntegratedVisibleGeneratedContent | null,
  structuredPreviewOptions?: AiGenerationRouteIntegratedStructuredPreviewOptions,
): AiGenerationRouteIntegratedVisibleGeneratedContent | null {
  if (
    visibleGeneratedContent === null ||
    structuredPreviewOptions === undefined
  ) {
    return visibleGeneratedContent;
  }

  if (visibleGeneratedContent.structuredPreview !== undefined) {
    return visibleGeneratedContent;
  }

  return {
    ...visibleGeneratedContent,
    structuredPreview: createRouteIntegratedStructuredPreview(
      visibleGeneratedContent.content,
      structuredPreviewOptions,
    ),
  };
}

export function createRouteIntegratedStructuredPreviewOptionsForTask(
  taskType: AiGenerationSharedTaskType,
  input?: AiGenerationSharedTaskPreviewOptionsInput,
): AiGenerationRouteIntegratedStructuredPreviewOptions {
  return createAiGenerationSharedTaskStructuredPreviewOptions(taskType, input);
}

export function createRouteIntegratedTaskTypeFromGenerationKind(
  generationKind: "question" | "paper",
): AiGenerationSharedTaskType {
  return generationKind === "question"
    ? "ai_question_generation"
    : "ai_paper_generation";
}

export function createRouteIntegratedStructuredPreviewOptionsForGenerationKind(
  generationKind: "question" | "paper",
  input?: AiGenerationSharedTaskPreviewOptionsInput,
): AiGenerationRouteIntegratedStructuredPreviewOptions {
  return createRouteIntegratedStructuredPreviewOptionsForTask(
    createRouteIntegratedTaskTypeFromGenerationKind(generationKind),
    input,
  );
}

export function createRouteIntegratedTaskLabel(
  taskType: AiGenerationSharedTaskType,
): "AI出题" | "AI组卷" {
  return getAiGenerationSharedTaskSpec(taskType).label;
}

export function createRouteIntegratedGenerationKindLabel(
  generationKind: "question" | "paper",
): "AI出题" | "AI组卷" {
  return createRouteIntegratedTaskLabel(
    createRouteIntegratedTaskTypeFromGenerationKind(generationKind),
  );
}

export function isRouteIntegratedGroundingSufficient(
  groundingContext: AiGenerationRouteIntegratedGroundingContext | null,
): groundingContext is AiGenerationRouteIntegratedGroundingContext {
  return (
    groundingContext !== null &&
    groundingContext.evidenceStatus === "sufficient" &&
    groundingContext.citationCount > 0 &&
    groundingContext.citations.length > 0
  );
}

export function isRouteIntegratedVisibleGeneratedContentAcceptableForDraft(
  visibleGeneratedContent:
    | AiGenerationRouteIntegratedVisibleGeneratedContent
    | null
    | undefined,
  expectedKind?: AiGenerationRouteIntegratedStructuredPreview["kind"],
): boolean {
  const groundingSummary = visibleGeneratedContent?.groundingSummary;
  const structuredPreview = visibleGeneratedContent?.structuredPreview;

  return (
    groundingSummary?.evidenceStatus === "sufficient" &&
    groundingSummary.citationCount > 0 &&
    structuredPreview !== undefined &&
    structuredPreview.parseStatus === "parsed" &&
    (expectedKind === undefined || structuredPreview.kind === expectedKind)
  );
}

export function createRouteIntegratedGroundingSummary(
  groundingContext: AiGenerationRouteIntegratedGroundingContext,
): AiGenerationRouteIntegratedGroundingSummary {
  return {
    evidenceStatus: groundingContext.evidenceStatus,
    citationCount: groundingContext.citationCount,
  };
}

function createRouteIntegratedStructuredPreview(
  content: string,
  options: AiGenerationRouteIntegratedStructuredPreviewOptions,
): AiGenerationRouteIntegratedStructuredPreview {
  const parsedContent = parseJsonValueFromProviderText(content);

  if (options.kind === "question_set") {
    return createQuestionSetStructuredPreview(parsedContent, options, content);
  }

  return createPaperDraftStructuredPreview(parsedContent, options);
}

function createQuestionSetStructuredPreview(
  parsedContent: ParsedRouteIntegratedProviderContent,
  options: Extract<
    AiGenerationRouteIntegratedStructuredPreviewOptions,
    { kind: "question_set" }
  >,
  content: string,
): AiGenerationRouteIntegratedStructuredPreview {
  const normalizedContent = content.trim();

  if (
    !normalizedContent.startsWith("{") ||
    !normalizedContent.endsWith("}") ||
    normalizedContent.length > 1_000_000
  ) {
    return {
      kind: "question_set",
      parseStatus: "failed",
      requestedQuestionCount: options.requestedQuestionCount,
      actualQuestionCount: null,
      failureCategory: "invalid_json",
      draftCount: 0,
      draftSummaries: [],
    };
  }

  if (hasDuplicateJsonObjectKeys(normalizedContent)) {
    return {
      kind: "question_set",
      parseStatus: "failed",
      requestedQuestionCount: options.requestedQuestionCount,
      actualQuestionCount: null,
      failureCategory: "question_contract_invalid",
      draftCount: 0,
      draftSummaries: [],
    };
  }

  if (parsedContent === null) {
    const plainTextStructuredPreview =
      createPlainTextQuestionSetStructuredPreview(content, options);

    if (plainTextStructuredPreview !== null) {
      return plainTextStructuredPreview;
    }

    return {
      kind: "question_set",
      parseStatus: "failed",
      requestedQuestionCount: options.requestedQuestionCount,
      actualQuestionCount: null,
      failureCategory: "invalid_json",
      draftCount: 0,
      draftSummaries: [],
    };
  }

  if (
    !isRecord(parsedContent) ||
    !hasExactKeys(parsedContent, ["schemaVersion", "kind", "questions"]) ||
    parsedContent.schemaVersion !== aiQuestionDraftSchemaVersion ||
    parsedContent.kind !== "question_set"
  ) {
    return {
      kind: "question_set",
      parseStatus: "failed",
      requestedQuestionCount: options.requestedQuestionCount,
      actualQuestionCount: null,
      failureCategory: "schema_mismatch",
      draftCount: 0,
      draftSummaries: [],
    };
  }

  const questions = Array.isArray(parsedContent.questions)
    ? parsedContent.questions
    : null;

  if (questions === null) {
    return {
      kind: "question_set",
      parseStatus: "failed",
      requestedQuestionCount: options.requestedQuestionCount,
      actualQuestionCount: null,
      failureCategory: "missing_questions",
      draftCount: 0,
      draftSummaries: [],
    };
  }

  if (questions.length !== options.requestedQuestionCount) {
    return {
      kind: "question_set",
      parseStatus: "failed",
      requestedQuestionCount: options.requestedQuestionCount,
      actualQuestionCount: questions.length,
      failureCategory: "question_count_mismatch",
      draftCount: 0,
      draftSummaries: [],
    };
  }

  const questionContractFailure = findQuestionSetContractFailure(
    questions,
    options.generationParameters ?? null,
  );

  if (questionContractFailure !== null) {
    return {
      kind: "question_set",
      parseStatus: "failed",
      requestedQuestionCount: options.requestedQuestionCount,
      actualQuestionCount: questions.length,
      failureCategory: questionContractFailure,
      draftCount: 0,
      draftSummaries: [],
    };
  }

  if (
    !questions.every(isCompleteQuestionDraft) ||
    hasDuplicateQuestions(questions)
  ) {
    return {
      kind: "question_set",
      parseStatus: "failed",
      requestedQuestionCount: options.requestedQuestionCount,
      actualQuestionCount: questions.length,
      failureCategory: "question_contract_invalid",
      draftCount: 0,
      draftSummaries: [],
    };
  }

  return {
    kind: "question_set",
    parseStatus: "parsed",
    requestedQuestionCount: options.requestedQuestionCount,
    actualQuestionCount: questions.length,
    draftCount: questions.length,
    draftSummaries: questions.map((questionDraft, index) =>
      createQuestionDraftSummary(questionDraft, index),
    ),
  };
}

function hasDuplicateJsonObjectKeys(content: string): boolean {
  let index = 0;
  let duplicateFound = false;

  function skipWhitespace(): void {
    while (/\s/u.test(content[index] ?? "")) {
      index += 1;
    }
  }

  function readString(): string | null {
    if (content[index] !== '"') {
      return null;
    }

    const start = index;
    index += 1;
    let escaped = false;

    while (index < content.length) {
      const character = content[index];

      if (!escaped && character === '"') {
        index += 1;
        try {
          return JSON.parse(content.slice(start, index)) as string;
        } catch {
          return null;
        }
      }

      escaped = !escaped && character === "\\";
      if (character !== "\\") {
        escaped = false;
      }
      index += 1;
    }

    return null;
  }

  function scanValue(): boolean {
    skipWhitespace();
    const character = content[index];

    if (character === '"') {
      return readString() !== null;
    }

    if (character === "{") {
      index += 1;
      skipWhitespace();
      const keys = new Set<string>();

      if (content[index] === "}") {
        index += 1;
        return true;
      }

      while (index < content.length) {
        skipWhitespace();
        const key = readString();

        if (key === null) {
          return false;
        }
        if (keys.has(key)) {
          duplicateFound = true;
        }
        keys.add(key);
        skipWhitespace();
        if (content[index] !== ":") {
          return false;
        }
        index += 1;
        if (!scanValue()) {
          return false;
        }
        skipWhitespace();
        if (content[index] === "}") {
          index += 1;
          return true;
        }
        if (content[index] !== ",") {
          return false;
        }
        index += 1;
      }

      return false;
    }

    if (character === "[") {
      index += 1;
      skipWhitespace();
      if (content[index] === "]") {
        index += 1;
        return true;
      }
      while (index < content.length) {
        if (!scanValue()) {
          return false;
        }
        skipWhitespace();
        if (content[index] === "]") {
          index += 1;
          return true;
        }
        if (content[index] !== ",") {
          return false;
        }
        index += 1;
      }
      return false;
    }

    const primitiveStart = index;
    while (index < content.length && !/[\s,\]}]/u.test(content[index] ?? "")) {
      index += 1;
    }

    return index > primitiveStart;
  }

  return scanValue() && duplicateFound;
}

function findQuestionSetContractFailure(
  questions: unknown[],
  generationParameters: Extract<
    AiGenerationRouteIntegratedStructuredPreviewOptions,
    { kind: "question_set" }
  >["generationParameters"],
): "question_type_mismatch" | "difficulty_mismatch" | null {
  const expectedQuestionType = normalizeQuestionTypeContractValue(
    generationParameters?.questionType,
  );
  const expectedDifficulty = normalizeDifficultyContractValue(
    generationParameters?.difficulty,
  );

  for (const questionDraft of questions) {
    const questionDraftObject = isRecord(questionDraft) ? questionDraft : {};
    const actualQuestionType = normalizeQuestionTypeContractValue(
      readSafeLabel(questionDraftObject, ["questionType", "question_type"]),
    );
    const actualDifficulty = normalizeDifficultyContractValue(
      readSafeLabel(questionDraftObject, ["difficulty"]),
    );

    if (
      expectedQuestionType !== null &&
      actualQuestionType !== expectedQuestionType
    ) {
      return "question_type_mismatch";
    }

    if (
      expectedDifficulty !== null &&
      actualDifficulty !== expectedDifficulty
    ) {
      return "difficulty_mismatch";
    }
  }

  return null;
}

function createQuestionDraftSummary(
  questionDraft: unknown,
  index: number,
): AiGenerationRouteIntegratedQuestionDraftSummary {
  const questionDraftObject = isRecord(questionDraft) ? questionDraft : {};
  const knowledgeNodeLabels = Array.isArray(
    questionDraftObject.knowledgeNodeLabels,
  )
    ? questionDraftObject.knowledgeNodeLabels
        .map((label) => String(label).trim())
        .sort((first, second) => first.localeCompare(second))
    : [];
  const questionType = String(questionDraftObject.questionType ?? "").trim();
  const normalizedQuestion = {
    draftNumber: index + 1,
    questionType,
    difficulty: String(questionDraftObject.difficulty ?? "").trim(),
    knowledgeNodeCount: knowledgeNodeLabels.length,
    knowledgeNodeLabels,
    questionStem: String(questionDraftObject.questionStem ?? "").trim(),
    questionOptions:
      readStrictQuestionOptionDrafts(questionDraftObject.questionOptions)?.sort(
        (first, second) =>
          String(first.optionLabel).localeCompare(String(second.optionLabel)),
      ) ?? [],
    standardAnswer: normalizeQuestionDraftStandardAnswer(
      questionType,
      questionDraftObject.standardAnswer,
    ),
    analysis: String(questionDraftObject.analysis ?? "").trim(),
    scoringPoints: readScoringPoints(questionDraftObject.scoringPoints),
    fillBlankAnswers: readFillBlankAnswers(
      questionDraftObject.fillBlankAnswers,
    ),
    reviewStatus: "draft_review_required" as const,
  };

  return {
    draftPublicId: `ai_question_draft_${createHash("sha256")
      .update(JSON.stringify(normalizedQuestion))
      .digest("hex")}`,
    ...normalizedQuestion,
  };
}

function normalizeQuestionDraftStandardAnswer(
  questionType: string,
  value: unknown,
): string {
  const normalizedValue = String(value ?? "").trim();

  if (questionType === "single_choice" || questionType === "multi_choice") {
    return normalizedValue
      .toUpperCase()
      .split(/[,，;；、\s]+/u)
      .filter(Boolean)
      .sort((first, second) => first.localeCompare(second))
      .join(",");
  }

  return questionType === "true_false"
    ? normalizedValue.toLowerCase()
    : normalizedValue;
}

function createPlainTextQuestionSetStructuredPreview(
  content: string,
  options: Extract<
    AiGenerationRouteIntegratedStructuredPreviewOptions,
    { kind: "question_set" }
  >,
): AiGenerationRouteIntegratedStructuredPreview | null {
  void content;
  void options;
  return null;
}

const questionDraftKeys = [
  "questionType",
  "difficulty",
  "knowledgeNodeLabels",
  "questionStem",
  "questionOptions",
  "standardAnswer",
  "analysis",
  "scoringPoints",
  "fillBlankAnswers",
] as const;
const questionTypes = new Set([
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
  const actual = Object.keys(value).sort();
  const expected = [...keys].sort();
  return (
    actual.length === expected.length &&
    actual.every((key, i) => key === expected[i])
  );
}

function isBoundedText(value: unknown, max = 4000): value is string {
  return (
    typeof value === "string" &&
    value.trim().length > 0 &&
    value.length <= max &&
    !/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/u.test(value)
  );
}

function isCompleteQuestionDraft(
  value: unknown,
): value is Record<string, unknown> {
  if (!isRecord(value) || !hasExactKeys(value, questionDraftKeys)) return false;
  if (
    !questionTypes.has(String(value.questionType)) ||
    !isBoundedText(value.difficulty, 32) ||
    !isBoundedText(value.questionStem) ||
    !isBoundedText(value.standardAnswer) ||
    !isBoundedText(value.analysis)
  )
    return false;
  if (
    !Array.isArray(value.knowledgeNodeLabels) ||
    value.knowledgeNodeLabels.length > 20 ||
    !value.knowledgeNodeLabels.every((label) => isBoundedText(label, 200)) ||
    new Set(value.knowledgeNodeLabels.map((label) => label.trim())).size !==
      value.knowledgeNodeLabels.length
  )
    return false;
  if (
    !Array.isArray(value.questionOptions) ||
    value.questionOptions.length > 20 ||
    !Array.isArray(value.scoringPoints) ||
    value.scoringPoints.length > 20 ||
    !Array.isArray(value.fillBlankAnswers) ||
    value.fillBlankAnswers.length > 20
  )
    return false;
  const type = String(value.questionType);
  const normalizedOptions = readStrictQuestionOptionDrafts(
    value.questionOptions,
  );
  if (normalizedOptions === null) return false;
  const options = normalizedOptions;
  const labels = normalizedOptions.map(
    (option) => option.optionLabel?.toUpperCase() ?? "",
  );
  if (new Set(labels).size !== labels.length || labels.some((label) => !label))
    return false;
  const answers = String(value.standardAnswer)
    .toUpperCase()
    .split(/[,，;；、\s]+/u)
    .filter(Boolean);
  if (new Set(answers).size !== answers.length) return false;
  if (type === "single_choice" || type === "multi_choice") {
    if (
      options.length < 2 ||
      answers.some((answer) => !labels.includes(answer))
    )
      return false;
    if (type === "single_choice" ? answers.length !== 1 : answers.length < 2)
      return false;
    return (
      value.scoringPoints.length === 0 && value.fillBlankAnswers.length === 0
    );
  }
  if (type === "true_false")
    return (
      options.length === 0 &&
      /^(true|false)$/iu.test(String(value.standardAnswer)) &&
      value.scoringPoints.length === 0 &&
      value.fillBlankAnswers.length === 0
    );
  if (type === "fill_blank")
    return options.length === 0 && value.scoringPoints.length === 0
      ? hasUniqueFillBlankAnswers(value.fillBlankAnswers)
      : false;
  return options.length === 0 && value.fillBlankAnswers.length === 0
    ? hasUniqueScoringPoints(value.scoringPoints)
    : false;
}

function isPositiveHalfPointScore(value: string): boolean {
  const score = Number(value);

  return (
    Number.isFinite(score) && score > 0 && score * 2 === Math.round(score * 2)
  );
}

function hasUniqueScoringPoints(value: unknown): boolean {
  const scoringPoints = readScoringPoints(value);

  return (
    Array.isArray(value) &&
    value.length > 0 &&
    scoringPoints.length === value.length &&
    new Set(scoringPoints.map((scoringPoint) => scoringPoint.sortOrder))
      .size === scoringPoints.length
  );
}

function hasUniqueFillBlankAnswers(value: unknown): boolean {
  const fillBlankAnswers = readFillBlankAnswers(value);

  return (
    Array.isArray(value) &&
    value.length > 0 &&
    fillBlankAnswers.length === value.length &&
    new Set(fillBlankAnswers.map((answer) => answer.blankKey.trim())).size ===
      fillBlankAnswers.length &&
    new Set(fillBlankAnswers.map((answer) => answer.sortOrder)).size ===
      fillBlankAnswers.length
  );
}

function readStrictQuestionOptionDrafts(
  value: unknown,
): AiGenerationRouteIntegratedQuestionOptionDraft[] | null {
  if (!Array.isArray(value) || value.length > 20) {
    return null;
  }

  const questionOptions = value.map((questionOption) => {
    if (
      !isRecord(questionOption) ||
      !hasExactKeys(questionOption, ["optionLabel", "optionText"]) ||
      !isBoundedText(questionOption.optionLabel, 32) ||
      !isBoundedText(questionOption.optionText, 2_000)
    ) {
      return null;
    }

    return {
      optionLabel: questionOption.optionLabel.trim().toUpperCase(),
      optionText: questionOption.optionText.trim(),
    };
  });

  return questionOptions.some((questionOption) => questionOption === null)
    ? null
    : (questionOptions as AiGenerationRouteIntegratedQuestionOptionDraft[]);
}

function readScoringPoints(
  value: unknown,
): { description: string; score: string; sortOrder: number }[] {
  if (!Array.isArray(value)) return [];
  return value
    .flatMap((item) =>
      isRecord(item) &&
      hasExactKeys(item, ["description", "score", "sortOrder"]) &&
      isBoundedText(item.description, 1000) &&
      isBoundedText(item.score, 32) &&
      isPositiveHalfPointScore(item.score) &&
      Number.isInteger(item.sortOrder) &&
      Number(item.sortOrder) > 0
        ? [
            {
              description: item.description.trim(),
              score: item.score.trim(),
              sortOrder: Number(item.sortOrder),
            },
          ]
        : [],
    )
    .sort((first, second) => first.sortOrder - second.sortOrder);
}

function readFillBlankAnswers(value: unknown): {
  blankKey: string;
  standardAnswers: string[];
  score: string;
  sortOrder: number;
}[] {
  if (!Array.isArray(value)) return [];
  return value
    .flatMap((item) =>
      isRecord(item) &&
      hasExactKeys(item, [
        "blankKey",
        "standardAnswers",
        "score",
        "sortOrder",
      ]) &&
      isBoundedText(item.blankKey, 100) &&
      Array.isArray(item.standardAnswers) &&
      item.standardAnswers.length > 0 &&
      item.standardAnswers.every((answer) => isBoundedText(answer, 1000)) &&
      new Set(item.standardAnswers.map((answer) => answer.trim())).size ===
        item.standardAnswers.length &&
      isBoundedText(item.score, 32) &&
      isPositiveHalfPointScore(item.score) &&
      Number.isInteger(item.sortOrder) &&
      Number(item.sortOrder) > 0
        ? [
            {
              blankKey: item.blankKey.trim(),
              standardAnswers: (item.standardAnswers as string[])
                .map((answer) => answer.trim())
                .sort((first, second) => first.localeCompare(second)),
              score: item.score.trim(),
              sortOrder: Number(item.sortOrder),
            },
          ]
        : [],
    )
    .sort((first, second) => first.sortOrder - second.sortOrder);
}

function hasDuplicateQuestions(questions: unknown[]): boolean {
  const identities = questions.map((question) =>
    JSON.stringify(createQuestionDraftSummary(question, 0), (key, value) =>
      key === "draftPublicId" ? undefined : value,
    ),
  );
  return new Set(identities).size !== identities.length;
}

function createPaperDraftStructuredPreview(
  parsedContent: ParsedRouteIntegratedProviderContent,
  options: Extract<
    AiGenerationRouteIntegratedStructuredPreviewOptions,
    { kind: "paper_draft" }
  >,
): AiGenerationRouteIntegratedStructuredPreview {
  if (parsedContent === null || Array.isArray(parsedContent)) {
    return {
      kind: "paper_draft",
      parseStatus: "failed",
      failureCategory: "invalid_json",
      requestedQuestionCount: options.requestedQuestionCount ?? null,
      paperSectionCount: 0,
      questionCount: null,
      questionTypeDistributionCount: null,
      knowledgeCoverageCount: null,
      reviewStatus: "structured_parse_failed",
    };
  }

  const paperSections = readArrayProperty(parsedContent, [
    "sections",
    "paperSections",
    "paper_sections",
    "paper_section",
  ]);

  if (paperSections === null || paperSections.length === 0) {
    return {
      kind: "paper_draft",
      parseStatus: "failed",
      failureCategory: "missing_paper_sections",
      requestedQuestionCount: options.requestedQuestionCount ?? null,
      paperSectionCount: 0,
      questionCount: null,
      questionTypeDistributionCount: null,
      knowledgeCoverageCount: null,
      reviewStatus: "structured_parse_failed",
    };
  }

  const questionCount = readPaperQuestionCount(parsedContent, paperSections);
  const questionTypeDistributionCount = readCollectionCount(parsedContent, [
    "questionTypeDistribution",
    "question_type_distribution",
  ]);
  const knowledgeCoverageCount = readCollectionCount(parsedContent, [
    "knowledgeCoverage",
    "knowledge_coverage",
    "knowledgeNodes",
    "knowledge_node",
  ]);
  const paperSectionSummaries = paperSections.map((paperSection, index) =>
    createPaperSectionDraftSummary(paperSection, index),
  );
  const requestedQuestionCount = options.requestedQuestionCount ?? null;

  if (containsForbiddenPaperPlanGeneratedQuestionContent(parsedContent)) {
    return {
      kind: "paper_draft",
      parseStatus: "failed",
      failureCategory: "provider_question_content_forbidden",
      requestedQuestionCount,
      paperSectionCount: paperSections.length,
      questionCount,
      questionTypeDistributionCount,
      knowledgeCoverageCount,
      reviewStatus: "structured_parse_failed",
    };
  }

  if (requestedQuestionCount !== null && questionCount === null) {
    return {
      kind: "paper_draft",
      parseStatus: "failed",
      failureCategory: "missing_question_count",
      requestedQuestionCount,
      paperSectionCount: paperSections.length,
      questionCount: null,
      questionTypeDistributionCount,
      knowledgeCoverageCount,
      reviewStatus: "structured_parse_failed",
    };
  }

  if (
    requestedQuestionCount !== null &&
    questionCount !== null &&
    questionCount !== requestedQuestionCount
  ) {
    return {
      kind: "paper_draft",
      parseStatus: "failed",
      failureCategory: "question_count_mismatch",
      requestedQuestionCount,
      paperSectionCount: paperSections.length,
      questionCount,
      questionTypeDistributionCount,
      knowledgeCoverageCount,
      reviewStatus: "structured_parse_failed",
    };
  }

  const paperContractFailure = findPaperDraftContractFailure(
    parsedContent,
    options.generationParameters ?? null,
    paperSections,
    questionCount,
    requestedQuestionCount,
  );

  if (paperContractFailure !== null) {
    return {
      kind: "paper_draft",
      parseStatus: "failed",
      failureCategory: paperContractFailure,
      requestedQuestionCount,
      paperSectionCount: paperSections.length,
      questionCount,
      questionTypeDistributionCount,
      knowledgeCoverageCount,
      reviewStatus: "structured_parse_failed",
    };
  }

  return {
    kind: "paper_draft",
    parseStatus: "parsed",
    paperSectionCount: paperSections.length,
    questionCount,
    questionTypeDistributionCount,
    knowledgeCoverageCount,
    paperSectionSummaries,
    reviewStatus: "draft_review_required",
  };
}

function findPaperDraftContractFailure(
  parsedContent: Record<string, unknown>,
  generationParameters: Extract<
    AiGenerationRouteIntegratedStructuredPreviewOptions,
    { kind: "paper_draft" }
  >["generationParameters"],
  paperSections: readonly unknown[],
  questionCount: number | null,
  requestedQuestionCount: number | null,
):
  | "source_preference_mismatch"
  | "question_type_distribution_mismatch"
  | "paper_structure_mismatch"
  | "difficulty_mismatch"
  | "knowledge_scope_mismatch"
  | null {
  const expectedSourcePreference = generationParameters?.sourcePreference;
  const actualSourcePreference = readSafeLabel(parsedContent, [
    "sourcePreference",
    "source_preference",
  ]);

  if (
    expectedSourcePreference !== null &&
    expectedSourcePreference !== undefined &&
    actualSourcePreference !== expectedSourcePreference
  ) {
    return "source_preference_mismatch";
  }

  const expectedQuestionTypeDistribution =
    generationParameters?.questionTypeDistribution;
  const actualQuestionTypeDistribution = readSafeLabel(parsedContent, [
    "questionTypeDistribution",
    "question_type_distribution",
  ]);

  if (
    expectedQuestionTypeDistribution !== null &&
    expectedQuestionTypeDistribution !== undefined &&
    actualQuestionTypeDistribution !== expectedQuestionTypeDistribution
  ) {
    return "question_type_distribution_mismatch";
  }

  const expectedPaperStructure = generationParameters?.paperStructure;
  const actualPaperStructure = readSafeLabel(parsedContent, [
    "paperStructure",
    "paper_structure",
  ]);

  if (
    expectedPaperStructure !== null &&
    expectedPaperStructure !== undefined &&
    actualPaperStructure !== expectedPaperStructure
  ) {
    return "paper_structure_mismatch";
  }

  const hasExpectedDifficulty = generationParameters?.difficulty !== undefined;
  const expectedDifficulty = generationParameters?.difficulty ?? null;
  const actualDifficulty = readOptionalSafeLabel(parsedContent, [
    "difficultyGoal",
    "difficulty_goal",
    "difficulty",
  ]);

  if (
    hasExpectedDifficulty &&
    actualDifficulty.present &&
    (!actualDifficulty.valid || actualDifficulty.value !== expectedDifficulty)
  ) {
    return "difficulty_mismatch";
  }

  const hasExpectedKnowledgeScope =
    generationParameters?.knowledgeNodePublicIds !== undefined;
  const expectedKnowledgeNodePublicIds =
    generationParameters?.knowledgeNodePublicIds ?? [];
  const knowledgeCoverage = readPaperPlanKnowledgeCoverage(parsedContent);

  if (
    hasExpectedKnowledgeScope &&
    (!knowledgeCoverage.valid ||
      !isKnowledgeScopeSubset(
        knowledgeCoverage.knowledgeNodePublicIds,
        expectedKnowledgeNodePublicIds,
      ) ||
      knowledgeCoverage.parentKnowledgeNodePublicIds.length > 0)
  ) {
    return "knowledge_scope_mismatch";
  }
  const effectivePlanKnowledgeNodePublicIds =
    knowledgeCoverage.knowledgeNodePublicIds.length > 0
      ? knowledgeCoverage.knowledgeNodePublicIds
      : expectedKnowledgeNodePublicIds;

  for (const paperSection of paperSections) {
    if (!isRecord(paperSection)) {
      return "paper_structure_mismatch";
    }

    const sectionDifficulty = readOptionalSafeLabel(paperSection, [
      "difficulty",
    ]);
    if (
      hasExpectedDifficulty &&
      sectionDifficulty.present &&
      (!sectionDifficulty.valid ||
        sectionDifficulty.value !== expectedDifficulty)
    ) {
      return "difficulty_mismatch";
    }

    const sectionKnowledgeScope = readStrictStringArrayProperty(paperSection, [
      "knowledgeNodePublicIds",
      "knowledge_node_public_ids",
    ]);
    const sectionParentKnowledgeScope = readStrictStringArrayProperty(
      paperSection,
      ["parentKnowledgeNodePublicIds", "parent_knowledge_node_public_ids"],
    );
    if (
      hasExpectedKnowledgeScope &&
      (!sectionKnowledgeScope.valid ||
        !sectionParentKnowledgeScope.valid ||
        !isKnowledgeScopeSubset(
          sectionKnowledgeScope.values,
          effectivePlanKnowledgeNodePublicIds,
        ) ||
        sectionParentKnowledgeScope.values.length > 0)
    ) {
      return "knowledge_scope_mismatch";
    }
  }

  if (
    expectedPaperStructure !== null &&
    expectedPaperStructure !== undefined &&
    !arePaperSectionsCompatibleWithStructure(
      paperSections,
      expectedPaperStructure,
    )
  ) {
    return "paper_structure_mismatch";
  }

  if (
    expectedQuestionTypeDistribution !== null &&
    expectedQuestionTypeDistribution !== undefined &&
    !arePaperSectionsCompatibleWithQuestionTypeDistribution(
      paperSections,
      expectedQuestionTypeDistribution,
      questionCount ?? requestedQuestionCount,
    )
  ) {
    return "question_type_distribution_mismatch";
  }

  return null;
}

function readOptionalSafeLabel(
  source: Record<string, unknown>,
  keys: readonly string[],
): { present: boolean; valid: boolean; value: string | null } {
  for (const key of keys) {
    if (!(key in source)) {
      continue;
    }

    const value = source[key];
    if (typeof value !== "string") {
      return { present: true, valid: false, value: null };
    }

    const normalizedValue = value.trim();
    return {
      present: true,
      valid: normalizedValue.length > 0 && normalizedValue.length <= 40,
      value: normalizedValue.length > 0 ? normalizedValue : null,
    };
  }

  return { present: false, valid: true, value: null };
}

function readStrictStringArrayProperty(
  source: Record<string, unknown>,
  keys: readonly string[],
): { present: boolean; valid: boolean; values: string[] } {
  for (const key of keys) {
    if (!(key in source)) {
      continue;
    }

    const value = source[key];
    if (!Array.isArray(value)) {
      return { present: true, valid: false, values: [] };
    }

    const values: string[] = [];
    const canonicalValues = new Set<string>();
    for (const item of value) {
      if (typeof item !== "string") {
        return { present: true, valid: false, values: [] };
      }

      const normalizedValue = item.trim();
      const canonicalValue = normalizedValue.normalize("NFKC").toLowerCase();
      if (normalizedValue.length === 0 || canonicalValues.has(canonicalValue)) {
        return { present: true, valid: false, values: [] };
      }

      canonicalValues.add(canonicalValue);
      values.push(normalizedValue);
    }

    return { present: true, valid: true, values };
  }

  return { present: false, valid: true, values: [] };
}

function readPaperPlanKnowledgeCoverage(
  parsedContent: Record<string, unknown>,
): {
  valid: boolean;
  knowledgeNodePublicIds: string[];
  parentKnowledgeNodePublicIds: string[];
} {
  const coverageValue =
    parsedContent.knowledgeCoverage ?? parsedContent.knowledge_coverage;

  if (coverageValue === undefined) {
    return {
      valid: true,
      knowledgeNodePublicIds: [],
      parentKnowledgeNodePublicIds: [],
    };
  }

  if (Array.isArray(coverageValue)) {
    const wrapper = { values: coverageValue };
    const scope = readStrictStringArrayProperty(wrapper, ["values"]);
    return {
      valid: scope.valid,
      knowledgeNodePublicIds: scope.values,
      parentKnowledgeNodePublicIds: [],
    };
  }

  if (!isRecord(coverageValue)) {
    return {
      valid: false,
      knowledgeNodePublicIds: [],
      parentKnowledgeNodePublicIds: [],
    };
  }

  const scope = readStrictStringArrayProperty(coverageValue, [
    "targetKnowledgeNodePublicIds",
    "knowledgeNodePublicIds",
    "knowledge_node_public_ids",
  ]);
  const parentScope = readStrictStringArrayProperty(coverageValue, [
    "targetParentKnowledgeNodePublicIds",
    "parentKnowledgeNodePublicIds",
    "parent_knowledge_node_public_ids",
  ]);
  return {
    valid: scope.valid && parentScope.valid,
    knowledgeNodePublicIds: scope.values,
    parentKnowledgeNodePublicIds: parentScope.values,
  };
}

function isKnowledgeScopeSubset(
  candidatePublicIds: readonly string[],
  requestedPublicIds: readonly string[],
): boolean {
  const requested = new Set(requestedPublicIds);
  return candidatePublicIds.every((publicId) => requested.has(publicId));
}

function arePaperSectionsCompatibleWithQuestionTypeDistribution(
  paperSections: readonly unknown[],
  questionTypeDistribution: NonNullable<
    Extract<
      AiGenerationRouteIntegratedStructuredPreviewOptions,
      { kind: "paper_draft" }
    >["generationParameters"]
  >["questionTypeDistribution"],
  questionCount: number | null,
): boolean {
  if (
    questionTypeDistribution === null ||
    questionTypeDistribution === undefined ||
    questionTypeDistribution === "weak_point_priority"
  ) {
    return true;
  }

  if (questionCount === null) {
    return true;
  }

  const expectedCounts = createExpectedPaperQuestionTypeCounts(
    questionTypeDistribution,
    questionCount,
  );

  if (expectedCounts === null) {
    return true;
  }

  const actualCounts = readPaperSectionQuestionTypeCounts(paperSections);

  if (actualCounts === null) {
    return true;
  }

  for (const [questionType, expectedCount] of expectedCounts) {
    if ((actualCounts.get(questionType) ?? 0) !== expectedCount) {
      return false;
    }
  }

  for (const [questionType, actualCount] of actualCounts) {
    if (!expectedCounts.has(questionType) && actualCount > 0) {
      return false;
    }
  }

  return true;
}

function createExpectedPaperQuestionTypeCounts(
  questionTypeDistribution: NonNullable<
    Extract<
      AiGenerationRouteIntegratedStructuredPreviewOptions,
      { kind: "paper_draft" }
    >["generationParameters"]
  >["questionTypeDistribution"],
  questionCount: number,
): Map<string, number> | null {
  const ratios: Array<readonly [string, number]> | null =
    questionTypeDistribution === "balanced_40_30_30"
      ? [
          ["single_choice", 40],
          ["multi_choice", 30],
          ["true_false", 30],
        ]
      : questionTypeDistribution === "single_50_multi_25_true_false_25"
        ? [
            ["single_choice", 50],
            ["multi_choice", 25],
            ["true_false", 25],
          ]
        : null;

  if (ratios === null) {
    return null;
  }

  const ratioTotal = ratios.reduce((total, [, ratio]) => total + ratio, 0);
  const counts = ratios.map(([questionType, ratio], index) => {
    const exactCount = (questionCount * ratio) / ratioTotal;

    return {
      questionType,
      count: Math.floor(exactCount),
      remainder: exactCount - Math.floor(exactCount),
      index,
    };
  });
  let remainingCount =
    questionCount - counts.reduce((total, item) => total + item.count, 0);

  for (const item of [...counts].sort(
    (first, second) =>
      second.remainder - first.remainder || first.index - second.index,
  )) {
    if (remainingCount <= 0) {
      break;
    }

    item.count += 1;
    remainingCount -= 1;
  }

  return new Map(counts.map((item) => [item.questionType, item.count]));
}

function readPaperSectionQuestionTypeCounts(
  paperSections: readonly unknown[],
): Map<string, number> | null {
  const counts = new Map<string, number>();

  for (const paperSection of paperSections) {
    if (!isRecord(paperSection)) {
      return null;
    }

    const questionType = readPaperSectionQuestionType(paperSection);
    const questionCount = normalizeQuestionCount(
      paperSection.questionCount ??
        paperSection.question_count ??
        paperSection.targetQuestionCount ??
        paperSection.target_question_count,
    );

    if (questionType === null || questionCount === null) {
      return null;
    }

    counts.set(questionType, (counts.get(questionType) ?? 0) + questionCount);
  }

  return counts;
}

function arePaperSectionsCompatibleWithStructure(
  paperSections: readonly unknown[],
  paperStructure: NonNullable<
    Extract<
      AiGenerationRouteIntegratedStructuredPreviewOptions,
      { kind: "paper_draft" }
    >["generationParameters"]
  >["paperStructure"],
): boolean {
  if (paperStructure === null || paperStructure === undefined) {
    return true;
  }

  if (paperStructure === "by_question_type") {
    return paperSections.every((paperSection) => {
      if (!isRecord(paperSection)) {
        return false;
      }

      const questionType = readPaperSectionQuestionType(paperSection);
      const questionTypes = readPaperSectionQuestionTypes(paperSection);

      return (
        questionType !== null &&
        questionTypes.length <= 1 &&
        (questionTypes.length === 0 || questionTypes[0] === questionType)
      );
    });
  }

  if (paperStructure === "by_knowledge_node") {
    return paperSections.every(
      (paperSection) =>
        isRecord(paperSection) && hasPaperSectionKnowledgeScope(paperSection),
    );
  }

  return true;
}

function readPaperSectionQuestionType(
  paperSection: Record<string, unknown>,
): string | null {
  return normalizePaperSectionQuestionType(
    readSafeLabel(paperSection, [
      "questionType",
      "question_type",
      "paperSectionType",
      "paper_section_type",
      "type",
    ]),
  );
}

function readPaperSectionQuestionTypes(
  paperSection: Record<string, unknown>,
): string[] {
  const questionTypes = readStringArray(paperSection, [
    "questionTypes",
    "question_types",
    "questionTypeList",
    "question_type_list",
  ])
    .map(normalizePaperSectionQuestionType)
    .filter((questionType): questionType is string => questionType !== null);

  return Array.from(new Set(questionTypes));
}

function normalizePaperSectionQuestionType(
  value: string | null,
): string | null {
  if (value === null) {
    return null;
  }

  const normalizedValue = value.trim();
  const questionTypeAliases: Record<string, string> = {
    judge: "true_false",
    true_false: "true_false",
    判断: "true_false",
    判断题: "true_false",
    multi_choice: "multi_choice",
    多选: "multi_choice",
    多选题: "multi_choice",
    single_choice: "single_choice",
    单选: "single_choice",
    单选题: "single_choice",
  };

  return questionTypeAliases[normalizedValue] ?? null;
}

function hasPaperSectionKnowledgeScope(
  paperSection: Record<string, unknown>,
): boolean {
  return (
    readStringArray(paperSection, [
      "knowledgeNodePublicIds",
      "knowledge_node_public_ids",
      "knowledgeNodeLabels",
      "knowledge_node_labels",
      "knowledgeNodes",
      "knowledge_nodes",
    ]).length > 0
  );
}

function createPaperSectionDraftSummary(
  paperSection: unknown,
  index: number,
): AiGenerationRouteIntegratedPaperSectionDraftSummary {
  const paperSectionObject = isRecord(paperSection) ? paperSection : {};
  const description = readVisibleDraftText(paperSectionObject, [
    "description",
    "paperSectionDescription",
    "paper_section_description",
  ]);

  return {
    sectionNumber: index + 1,
    paperSectionType: readSafeLabel(paperSectionObject, [
      "paperSectionType",
      "paper_section_type",
      "questionType",
      "question_type",
      "type",
    ]),
    title: readVisibleDraftText(paperSectionObject, [
      "title",
      "paperSectionTitle",
      "paper_section_title",
      "name",
    ]),
    ...(description !== null ? { description } : {}),
    questionCount:
      normalizeQuestionCount(
        paperSectionObject.questionCount ??
          paperSectionObject.question_count ??
          paperSectionObject.targetQuestionCount ??
          paperSectionObject.target_question_count,
      ) ?? null,
    questionDrafts: [],
  };
}

function parseJsonValueFromProviderText(
  content: string,
): ParsedRouteIntegratedProviderContent {
  const normalizedContent = content.trim();
  const fencedJsonMatch = normalizedContent.match(
    /```(?:json)?\s*([\s\S]*?)```/i,
  );
  const candidateContent = fencedJsonMatch?.[1]?.trim() ?? normalizedContent;
  const directParsedContent = parseJsonCandidate(candidateContent);

  if (directParsedContent !== null) {
    return directParsedContent;
  }

  return (
    parseJsonCandidate(extractJsonSlice(candidateContent, "{", "}")) ??
    parseJsonCandidate(extractJsonSlice(candidateContent, "[", "]"))
  );
}

function parseJsonCandidate(
  candidateContent: string | null,
): ParsedRouteIntegratedProviderContent {
  if (candidateContent === null) {
    return null;
  }

  try {
    const parsedContent = JSON.parse(candidateContent);

    return isRecord(parsedContent) || Array.isArray(parsedContent)
      ? parsedContent
      : null;
  } catch {
    return null;
  }
}

function extractJsonSlice(
  content: string,
  openingDelimiter: "{" | "[",
  closingDelimiter: "}" | "]",
): string | null {
  const firstDelimiterIndex = content.indexOf(openingDelimiter);
  const lastDelimiterIndex = content.lastIndexOf(closingDelimiter);

  return firstDelimiterIndex >= 0 && lastDelimiterIndex > firstDelimiterIndex
    ? content.slice(firstDelimiterIndex, lastDelimiterIndex + 1)
    : null;
}

function readArrayProperty(
  source: Record<string, unknown>,
  keys: readonly string[],
): unknown[] | null {
  for (const key of keys) {
    const value = source[key];

    if (Array.isArray(value)) {
      return value;
    }
  }

  return null;
}

function normalizeQuestionTypeContractValue(value: unknown): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const normalizedValue = value.trim();
  const questionTypeAliases: Record<string, string> = {
    case_analysis: "case_analysis",
    案例分析: "case_analysis",
    案例分析题: "case_analysis",
    judge: "true_false",
    true_false: "true_false",
    判断: "true_false",
    判断题: "true_false",
    multi_choice: "multi_choice",
    多选: "multi_choice",
    多选题: "multi_choice",
    single_choice: "single_choice",
    单选: "single_choice",
    单选题: "single_choice",
  };

  return questionTypeAliases[normalizedValue] ?? normalizedValue;
}

function normalizeDifficultyContractValue(value: unknown): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const normalizedValue = value.trim();
  const difficultyAliases: Record<string, string> = {
    basic: "easy",
    easy: "easy",
    基础: "easy",
    hard: "hard",
    进阶: "hard",
    medium: "medium",
    中等: "medium",
  };

  return difficultyAliases[normalizedValue] ?? normalizedValue;
}

function readSafeLabel(
  source: Record<string, unknown>,
  keys: readonly string[],
): string | null {
  for (const key of keys) {
    const value = source[key];

    if (typeof value !== "string") {
      continue;
    }

    const normalizedValue = value.trim();

    if (normalizedValue.length > 0 && normalizedValue.length <= 40) {
      return normalizedValue;
    }
  }

  return null;
}

function readVisibleDraftText(
  source: Record<string, unknown>,
  keys: readonly string[],
): string | null {
  for (const key of keys) {
    const value = source[key];

    if (typeof value !== "string") {
      continue;
    }

    const normalizedValue = value.trim();

    if (normalizedValue.length > 0 && normalizedValue.length <= 1200) {
      return normalizedValue;
    }
  }

  return null;
}

function readStringArray(
  source: Record<string, unknown>,
  keys: readonly string[],
): string[] {
  for (const key of keys) {
    const value = source[key];

    if (!Array.isArray(value)) {
      continue;
    }

    const normalizedValues = value
      .map((item) =>
        typeof item === "string"
          ? item.trim()
          : isRecord(item)
            ? readVisibleDraftText(item, ["label", "name", "title", "text"])
            : null,
      )
      .filter(
        (item): item is string =>
          item !== null && item.length > 0 && item.length <= 120,
      );

    if (normalizedValues.length > 0) {
      return normalizedValues.slice(0, 12);
    }
  }

  return [];
}

function readCollectionCount(
  source: Record<string, unknown>,
  keys: readonly string[],
): number | null {
  for (const key of keys) {
    const value = source[key];

    if (Array.isArray(value)) {
      return value.length;
    }

    if (isRecord(value)) {
      return Object.keys(value).length;
    }
  }

  return null;
}

function readRecordProperty(
  source: Record<string, unknown>,
  keys: readonly string[],
): Record<string, unknown> | null {
  for (const key of keys) {
    const value = source[key];

    if (isRecord(value)) {
      return value;
    }
  }

  return null;
}

function readPaperQuestionCount(
  parsedContent: Record<string, unknown>,
  paperSections: unknown[],
): number | null {
  return (
    normalizeQuestionCount(
      parsedContent.questionCount ??
        parsedContent.question_count ??
        parsedContent.totalQuestionCount ??
        parsedContent.total_question_count ??
        parsedContent.targetQuestionCount ??
        parsedContent.target_question_count,
    ) ??
    sumQuestionCounts(paperSections) ??
    sumQuestionTypeDistributionCounts(parsedContent)
  );
}

function sumQuestionCounts(paperSections: unknown[]): number | null {
  let totalQuestionCount = 0;
  let sectionWithQuestionCount = false;

  for (const paperSection of paperSections) {
    if (!isRecord(paperSection)) {
      continue;
    }

    const questionCount = normalizeQuestionCount(
      paperSection.questionCount ??
        paperSection.question_count ??
        paperSection.targetQuestionCount ??
        paperSection.target_question_count,
    );

    if (questionCount !== null) {
      sectionWithQuestionCount = true;
      totalQuestionCount += questionCount;
    }
  }

  return sectionWithQuestionCount ? totalQuestionCount : null;
}

function sumQuestionTypeDistributionCounts(
  parsedContent: Record<string, unknown>,
): number | null {
  const distribution = readRecordProperty(parsedContent, [
    "questionTypeDistribution",
    "question_type_distribution",
  ]);

  if (distribution === null) {
    return null;
  }

  let totalQuestionCount = 0;
  let distributionWithQuestionCount = false;

  for (const value of Object.values(distribution)) {
    const questionCount = normalizeQuestionCount(value);

    if (questionCount === null) {
      continue;
    }

    distributionWithQuestionCount = true;
    totalQuestionCount += questionCount;
  }

  return distributionWithQuestionCount ? totalQuestionCount : null;
}

function normalizeQuestionCount(value: unknown): number | null {
  const numericValue =
    typeof value === "number"
      ? value
      : typeof value === "string"
        ? Number.parseInt(value, 10)
        : null;

  return numericValue !== null &&
    Number.isInteger(numericValue) &&
    numericValue >= 0
    ? numericValue
    : null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function containsForbiddenPaperPlanGeneratedQuestionContent(
  input: unknown,
): boolean {
  if (Array.isArray(input)) {
    return input.some(containsForbiddenPaperPlanGeneratedQuestionContent);
  }

  if (!isRecord(input)) {
    return false;
  }

  return Object.entries(input).some(
    ([key, value]) =>
      forbiddenPaperPlanGeneratedQuestionKeys.has(key) ||
      containsForbiddenPaperPlanGeneratedQuestionContent(value),
  );
}

export function ensureRouteIntegratedVisibleGeneratedContentSafe(
  visibleGeneratedContent:
    | AiGenerationRouteIntegratedVisibleGeneratedContent
    | null
    | undefined,
  additionalForbiddenEvidenceValues: string[] = [],
): {
  redactionViolationFound: boolean;
  visibleGeneratedContent: AiGenerationRouteIntegratedVisibleGeneratedContent | null;
} {
  if (
    visibleGeneratedContent === null ||
    visibleGeneratedContent === undefined
  ) {
    return {
      redactionViolationFound: false,
      visibleGeneratedContent: null,
    };
  }

  const serializedVisibleContent = JSON.stringify(visibleGeneratedContent);
  const forbiddenValueFound = [
    ...forbiddenProviderExecutionEvidenceKeys,
    ...additionalForbiddenEvidenceValues,
  ].some((forbiddenValue) => serializedVisibleContent.includes(forbiddenValue));

  return forbiddenValueFound
    ? {
        redactionViolationFound: true,
        visibleGeneratedContent: null,
      }
    : {
        redactionViolationFound: false,
        visibleGeneratedContent,
      };
}

export function resolveRouteIntegratedProviderFailureCategory(
  providerError: unknown,
): Exclude<
  AiGenerationRouteIntegratedProviderFailureCategory,
  | null
  | "provider_call_blocked"
  | "insufficient_grounding_evidence"
  | "missing_provider_credential"
  | "redaction_violation"
> {
  if (
    providerError &&
    typeof providerError === "object" &&
    "name" in providerError &&
    providerError.name === "AbortError"
  ) {
    return "timeout";
  }

  return "provider_error";
}

export function summarizeRouteIntegratedProviderError(
  providerError: unknown,
): NonNullable<AiGenerationRouteIntegratedProviderErrorSummary> {
  return {
    httpStatus: resolveProviderHttpStatus(providerError),
    providerErrorCode: resolveProviderErrorCode(providerError),
  };
}

function resolveProviderHttpStatus(providerError: unknown): number | null {
  const statusCandidates = [
    getObjectPath(providerError, ["status"]),
    getObjectPath(providerError, ["statusCode"]),
    getObjectPath(providerError, ["response", "status"]),
    getObjectPath(providerError, ["response", "statusCode"]),
    getObjectPath(providerError, ["cause", "status"]),
    getObjectPath(providerError, ["cause", "statusCode"]),
  ];

  for (const statusCandidate of statusCandidates) {
    const normalizedStatus = normalizeHttpStatus(statusCandidate);

    if (normalizedStatus !== null) {
      return normalizedStatus;
    }
  }

  return null;
}

function resolveProviderErrorCode(providerError: unknown): string | null {
  const codeCandidates = [
    getObjectPath(providerError, ["code"]),
    getObjectPath(providerError, ["data", "code"]),
    getObjectPath(providerError, ["error", "code"]),
    getObjectPath(providerError, ["response", "data", "code"]),
    getObjectPath(providerError, ["response", "body", "code"]),
    getObjectPath(providerError, ["cause", "code"]),
  ];

  for (const codeCandidate of codeCandidates) {
    const normalizedCode = normalizeProviderErrorCode(codeCandidate);

    if (normalizedCode !== null) {
      return normalizedCode;
    }
  }

  return null;
}

function normalizeHttpStatus(value: unknown): number | null {
  const numericValue =
    typeof value === "number"
      ? value
      : typeof value === "string"
        ? Number.parseInt(value, 10)
        : null;

  if (
    numericValue !== null &&
    Number.isInteger(numericValue) &&
    numericValue >= 100 &&
    numericValue <= 599
  ) {
    return numericValue;
  }

  return null;
}

function normalizeProviderErrorCode(value: unknown): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const normalizedCode = value.trim();

  return normalizedCode.length > 0 &&
    normalizedCode.length <= 80 &&
    /^[A-Za-z0-9._:-]+$/.test(normalizedCode)
    ? normalizedCode
    : null;
}

function getObjectPath(value: unknown, pathSegments: string[]): unknown {
  return pathSegments.reduce<unknown>((currentValue, pathSegment) => {
    if (
      currentValue &&
      typeof currentValue === "object" &&
      pathSegment in currentValue
    ) {
      return currentValue[pathSegment as keyof typeof currentValue];
    }

    return undefined;
  }, value);
}
