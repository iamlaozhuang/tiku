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
  taskType: "ai_question_generation" | "ai_paper_generation",
): AiGenerationRouteIntegratedStructuredPreviewOptions {
  return taskType === "ai_question_generation"
    ? {
        kind: "question_set",
        requestedQuestionCount: 10,
      }
    : {
        kind: "paper_draft",
      };
}

export function createRouteIntegratedTaskTypeFromGenerationKind(
  generationKind: "question" | "paper",
): "ai_question_generation" | "ai_paper_generation" {
  return generationKind === "question"
    ? "ai_question_generation"
    : "ai_paper_generation";
}

export function createRouteIntegratedStructuredPreviewOptionsForGenerationKind(
  generationKind: "question" | "paper",
): AiGenerationRouteIntegratedStructuredPreviewOptions {
  return createRouteIntegratedStructuredPreviewOptionsForTask(
    createRouteIntegratedTaskTypeFromGenerationKind(generationKind),
  );
}

export function createRouteIntegratedTaskLabel(
  taskType: "ai_question_generation" | "ai_paper_generation",
): "AI出题" | "AI组卷" {
  return taskType === "ai_question_generation" ? "AI出题" : "AI组卷";
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
  const parsedContent = parseJsonObjectFromProviderText(content);

  if (options.kind === "question_set") {
    return createQuestionSetStructuredPreview(parsedContent, options);
  }

  return createPaperDraftStructuredPreview(parsedContent);
}

function createQuestionSetStructuredPreview(
  parsedContent: Record<string, unknown> | null,
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

  const questions = readArrayProperty(parsedContent, [
    "questions",
    "questionDrafts",
    "question_drafts",
  ]);

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
  parsedContent: Record<string, unknown> | null,
): AiGenerationRouteIntegratedStructuredPreview {
  if (parsedContent === null) {
    return {
      kind: "paper_draft",
      parseStatus: "failed",
      failureCategory: "invalid_json",
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
      paperSectionCount: 0,
      questionCount: null,
      questionTypeDistributionCount: null,
      knowledgeCoverageCount: null,
      reviewStatus: "structured_parse_failed",
    };
  }

  return {
    kind: "paper_draft",
    parseStatus: "parsed",
    paperSectionCount: paperSections.length,
    questionCount: sumQuestionCounts(paperSections),
    questionTypeDistributionCount: readCollectionCount(parsedContent, [
      "questionTypeDistribution",
      "question_type_distribution",
    ]),
    knowledgeCoverageCount: readCollectionCount(parsedContent, [
      "knowledgeCoverage",
      "knowledge_coverage",
      "knowledgeNodes",
      "knowledge_node",
    ]),
    reviewStatus: "draft_review_required",
  };
}

function parseJsonObjectFromProviderText(
  content: string,
): Record<string, unknown> | null {
  const normalizedContent = content.trim();
  const fencedJsonMatch = normalizedContent.match(
    /```(?:json)?\s*([\s\S]*?)```/i,
  );
  const candidateContent = fencedJsonMatch?.[1]?.trim() ?? normalizedContent;
  const firstBraceIndex = candidateContent.indexOf("{");
  const lastBraceIndex = candidateContent.lastIndexOf("}");

  if (firstBraceIndex < 0 || lastBraceIndex <= firstBraceIndex) {
    return null;
  }

  try {
    const parsedContent = JSON.parse(
      candidateContent.slice(firstBraceIndex, lastBraceIndex + 1),
    );

    return isRecord(parsedContent) ? parsedContent : null;
  } catch {
    return null;
  }
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
