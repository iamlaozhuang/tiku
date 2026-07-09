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
const questionDraftArrayKeys = [
  "questions",
  "questionDrafts",
  "question_drafts",
  "questionItems",
  "question_items",
  "questionList",
  "question_list",
  "drafts",
  "items",
] as const;
const questionDraftContainerKeys = [
  "questionSet",
  "question_set",
  "result",
  "data",
  "output",
  "payload",
] as const;
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
const plainTextQuestionDraftMarkerPattern =
  /^(?:\s*>?\s*)?(?:[-*]\s*)?(?:#{1,6}\s*)?(?:(\d{1,3})[.)、）]\s*|题目\s*(\d{1,3})\s*[:：]|第\s*(\d{1,3})\s*题\s*[:：]?)/gim;

type ParsedRouteIntegratedProviderContent =
  | Record<string, unknown>
  | unknown[]
  | null;
type PlainTextQuestionDraftMarkerSummary = {
  actualQuestionCount: number;
  isExactRequestedCount: boolean;
};

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
  if (!usage || typeof usage !== "object") {
    return null;
  }

  const numericUsageEntries = Object.entries(usage).filter(
    ([usageKey, usageValue]) =>
      /token|tokens|call|calls/i.test(usageKey) &&
      typeof usageValue === "number" &&
      Number.isFinite(usageValue),
  );

  return numericUsageEntries.length > 0
    ? Object.fromEntries(numericUsageEntries)
    : null;
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

  const questions = readQuestionDraftArray(parsedContent);

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

  return {
    draftNumber: index + 1,
    questionType: readSafeLabel(questionDraftObject, [
      "questionType",
      "question_type",
      "type",
    ]),
    difficulty: readSafeLabel(questionDraftObject, ["difficulty"]),
    knowledgeNodeCount: readCollectionCount(questionDraftObject, [
      "knowledgeNodeLabels",
      "knowledgeNodes",
      "knowledge_node",
      "knowledge_node_ids",
    ]),
    ...readProductVisibleQuestionDraftFields(questionDraftObject),
    reviewStatus: "draft_review_required",
  };
}

function readProductVisibleQuestionDraftFields(
  questionDraftObject: Record<string, unknown>,
): Partial<AiGenerationRouteIntegratedQuestionDraftSummary> {
  const knowledgeNodeLabels = readStringArray(questionDraftObject, [
    "knowledgeNodeLabels",
    "knowledgeNodes",
    "knowledge_node_labels",
    "knowledge_node",
  ]);
  const questionStem = readVisibleDraftText(questionDraftObject, [
    "questionStem",
    "question_stem",
    "stem",
    "title",
  ]);
  const questionOptions = readQuestionOptionDrafts(questionDraftObject, [
    "questionOptions",
    "question_options",
    "options",
    "choices",
  ]);
  const standardAnswer = readVisibleDraftText(questionDraftObject, [
    "standardAnswer",
    "standard_answer",
    "answer",
    "correctAnswer",
    "correct_answer",
  ]);
  const analysis = readVisibleDraftText(questionDraftObject, [
    "analysis",
    "explanation",
    "解析",
  ]);

  return {
    ...(knowledgeNodeLabels.length > 0 ? { knowledgeNodeLabels } : {}),
    ...(questionStem !== null ? { questionStem } : {}),
    ...(questionOptions.length > 0 ? { questionOptions } : {}),
    ...(standardAnswer !== null ? { standardAnswer } : {}),
    ...(analysis !== null ? { analysis } : {}),
  };
}

function createPlainTextQuestionSetStructuredPreview(
  content: string,
  options: Extract<
    AiGenerationRouteIntegratedStructuredPreviewOptions,
    { kind: "question_set" }
  >,
): AiGenerationRouteIntegratedStructuredPreview | null {
  const markerSummary = readPlainTextQuestionDraftMarkerSummary(
    content,
    options.requestedQuestionCount,
  );

  if (markerSummary === null) {
    return null;
  }

  if (!markerSummary.isExactRequestedCount) {
    return {
      kind: "question_set",
      parseStatus: "failed",
      requestedQuestionCount: options.requestedQuestionCount,
      actualQuestionCount: markerSummary.actualQuestionCount,
      failureCategory: "question_count_mismatch",
      draftCount: 0,
      draftSummaries: [],
    };
  }

  return {
    kind: "question_set",
    parseStatus: "parsed",
    requestedQuestionCount: options.requestedQuestionCount,
    actualQuestionCount: markerSummary.actualQuestionCount,
    draftCount: markerSummary.actualQuestionCount,
    draftSummaries: Array.from(
      { length: markerSummary.actualQuestionCount },
      (_, index) => ({
        draftNumber: index + 1,
        questionType: null,
        difficulty: null,
        knowledgeNodeCount: null,
        reviewStatus: "draft_review_required",
      }),
    ),
  };
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
):
  | "source_preference_mismatch"
  | "question_type_distribution_mismatch"
  | "paper_structure_mismatch"
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

  return null;
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

function readQuestionDraftArray(source: unknown, depth = 0): unknown[] | null {
  if (Array.isArray(source)) {
    return source;
  }

  if (!isRecord(source) || depth > 2) {
    return null;
  }

  const directQuestions = readArrayProperty(source, questionDraftArrayKeys);

  if (directQuestions !== null) {
    return directQuestions;
  }

  for (const key of questionDraftContainerKeys) {
    const nestedQuestions = readQuestionDraftArray(source[key], depth + 1);

    if (nestedQuestions !== null) {
      return nestedQuestions;
    }
  }

  return null;
}

function readPlainTextQuestionDraftMarkerSummary(
  content: string,
  requestedQuestionCount: number,
): PlainTextQuestionDraftMarkerSummary | null {
  const markerNumbers: number[] = [];

  for (const match of content.matchAll(plainTextQuestionDraftMarkerPattern)) {
    const markerNumber = Number.parseInt(
      match[1] ?? match[2] ?? match[3] ?? "",
      10,
    );

    if (!Number.isInteger(markerNumber) || markerNumber <= 0) {
      continue;
    }

    markerNumbers.push(markerNumber);
  }

  if (markerNumbers.length === 0) {
    return null;
  }

  const seenMarkerNumbers = new Set<number>();
  let hasDuplicateMarker = false;

  for (const markerNumber of markerNumbers) {
    if (seenMarkerNumbers.has(markerNumber)) {
      hasDuplicateMarker = true;
    }

    seenMarkerNumbers.add(markerNumber);
  }

  const isExactRequestedCount =
    !hasDuplicateMarker &&
    markerNumbers.length === requestedQuestionCount &&
    Array.from({ length: requestedQuestionCount }, (_, index) =>
      seenMarkerNumbers.has(index + 1),
    ).every(Boolean);

  return {
    actualQuestionCount: markerNumbers.length,
    isExactRequestedCount,
  };
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
    judge: "judge",
    true_false: "judge",
    判断: "judge",
    判断题: "judge",
    multiple_choice: "multiple_choice",
    多选: "multiple_choice",
    多选题: "multiple_choice",
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

function readQuestionOptionDrafts(
  source: Record<string, unknown>,
  keys: readonly string[],
): AiGenerationRouteIntegratedQuestionOptionDraft[] {
  for (const key of keys) {
    const value = source[key];

    if (!Array.isArray(value)) {
      continue;
    }

    const questionOptions = value
      .map((option, index) => normalizeQuestionOptionDraft(option, index))
      .filter(
        (option): option is AiGenerationRouteIntegratedQuestionOptionDraft =>
          option !== null,
      );

    if (questionOptions.length > 0) {
      return questionOptions.slice(0, 8);
    }
  }

  return [];
}

function normalizeQuestionOptionDraft(
  option: unknown,
  index: number,
): AiGenerationRouteIntegratedQuestionOptionDraft | null {
  if (typeof option === "string") {
    const optionText = option.trim();

    return optionText.length > 0 && optionText.length <= 600
      ? {
          optionLabel: String.fromCharCode(65 + index),
          optionText,
        }
      : null;
  }

  if (!isRecord(option)) {
    return null;
  }

  const optionText = readVisibleDraftText(option, [
    "optionText",
    "option_text",
    "text",
    "content",
    "value",
  ]);

  if (optionText === null) {
    return null;
  }

  return {
    optionLabel: readSafeLabel(option, [
      "optionLabel",
      "option_label",
      "label",
      "key",
    ]),
    optionText,
    ...(typeof option.isCorrect === "boolean"
      ? { isCorrect: option.isCorrect }
      : typeof option.is_correct === "boolean"
        ? { isCorrect: option.is_correct }
        : {}),
  };
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
