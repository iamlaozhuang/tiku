import type {
  AiGenerationRouteIntegratedProviderErrorSummary,
  AiGenerationRouteIntegratedProviderExecutionOutcome,
  AiGenerationRouteIntegratedProviderExecutionSummary,
  AiGenerationRouteIntegratedProviderFailureCategory,
  AiGenerationRouteIntegratedProviderLimits,
  AiGenerationRouteIntegratedProviderMetadata,
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
    return createQuestionSetStructuredPreview(parsedContent, options);
  }

  return createPaperDraftStructuredPreview(parsedContent, options);
}

function createQuestionSetStructuredPreview(
  parsedContent: ParsedRouteIntegratedProviderContent,
  options: Extract<
    AiGenerationRouteIntegratedStructuredPreviewOptions,
    { kind: "question_set" }
  >,
): AiGenerationRouteIntegratedStructuredPreview {
  if (parsedContent === null) {
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

  return {
    kind: "question_set",
    parseStatus: "parsed",
    requestedQuestionCount: options.requestedQuestionCount,
    actualQuestionCount: questions.length,
    draftCount: questions.length,
    draftSummaries: questions.map((questionDraft, index) => {
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
        reviewStatus: "draft_review_required",
      };
    }),
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
  const requestedQuestionCount = options.requestedQuestionCount ?? null;

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

  return {
    kind: "paper_draft",
    parseStatus: "parsed",
    paperSectionCount: paperSections.length,
    questionCount,
    questionTypeDistributionCount,
    knowledgeCoverageCount,
    reviewStatus: "draft_review_required",
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
        parsedContent.total_question_count,
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

    const questionCount =
      normalizeQuestionCount(
        paperSection.questionCount ?? paperSection.question_count,
      ) ?? readNestedSectionQuestionCount(paperSection);

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

function readNestedSectionQuestionCount(
  paperSection: Record<string, unknown>,
): number | null {
  const nestedQuestions = readArrayProperty(paperSection, [
    "questions",
    "questionDrafts",
    "question_drafts",
    "items",
  ]);

  return nestedQuestions === null ? null : nestedQuestions.length;
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
