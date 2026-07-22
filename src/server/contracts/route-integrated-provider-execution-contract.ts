import type { EvidenceStatus } from "../models/ai-rag";
import type { ModelConfigSnapshot } from "../models/ai-rag";

export type AiGenerationRouteIntegratedProviderMetadata = {
  modelProvider: "openai_compatible";
  providerName: "alibaba-qwen";
  modelName: "qwen3.7-max";
  baseUrlHost: "dashscope.aliyuncs.com";
  envKeyAlias: "ALIBABA_API_KEY";
};

export type AiGenerationRouteIntegratedProviderLimits = {
  maxRequests: 1;
  maxRetries: 0;
  maxOutputTokens: number;
  timeoutMs: number;
};

export type AiGenerationRouteIntegratedProviderUsageSummary = Record<
  string,
  number
> | null;

export type AiGenerationRouteIntegratedProviderErrorSummary = {
  httpStatus: number | null;
  providerErrorCode: string | null;
} | null;

export type AiGenerationRouteIntegratedProviderFailureCategory =
  | "provider_call_blocked"
  | "insufficient_grounding_evidence"
  | "governance_context_unavailable"
  | "missing_provider_credential"
  | "provider_error"
  | "timeout"
  | "redaction_violation"
  | "ai_call_log_unavailable"
  | null;

export type AiGenerationRouteIntegratedGovernanceContext = {
  modelConfigSnapshot: ModelConfigSnapshot;
  promptTemplate: {
    promptTemplateKey: string;
    aiFuncType: "ai_question_generation" | "ai_paper_generation";
    version: number;
    templateContent: string;
    templateHash: string;
    requiredVariables: readonly string[];
    isActive: boolean;
  };
};

export type AiGenerationRouteIntegratedProviderExecutionResultStatus =
  | "pass"
  | "fail"
  | "blocked";

export type AiGenerationRouteIntegratedProviderExecutionResult = {
  requestCount: 0 | 1;
  resultStatus: AiGenerationRouteIntegratedProviderExecutionResultStatus;
  failureCategory: AiGenerationRouteIntegratedProviderFailureCategory;
  durationMs: number;
  usageSummary: AiGenerationRouteIntegratedProviderUsageSummary;
  providerErrorSummary: AiGenerationRouteIntegratedProviderErrorSummary;
  visibleGeneratedContent?: AiGenerationRouteIntegratedVisibleGeneratedContent | null;
};

export type AiGenerationRouteIntegratedProviderExecutionSummary = Omit<
  AiGenerationRouteIntegratedProviderExecutionResult,
  "visibleGeneratedContent"
> & {
  redactionStatus: "redacted";
};

export type AiGenerationRouteIntegratedProviderExecutionInput<
  TRequestContext extends object = Record<string, unknown>,
> = {
  providerMetadata: AiGenerationRouteIntegratedProviderMetadata;
  limits: AiGenerationRouteIntegratedProviderLimits;
  requestContext: TRequestContext;
  groundingContext?: AiGenerationRouteIntegratedGroundingContext | null;
  governanceContext: AiGenerationRouteIntegratedGovernanceContext;
  providerCredential: string;
};

export type AiGenerationRouteIntegratedProviderExecutor<
  TRequestContext extends object = Record<string, unknown>,
> = (
  input: AiGenerationRouteIntegratedProviderExecutionInput<TRequestContext>,
) => Promise<AiGenerationRouteIntegratedProviderExecutionResult>;

export type AiGenerationRouteIntegratedProviderExecutionControl<
  TRequestContext extends object = Record<string, unknown>,
> = {
  executionMode: "route_integrated_provider";
  realProviderExecutionApproved: true;
  maxRequests: 1;
  maxRetries: 0;
  maxOutputTokens: number;
  timeoutMs: number;
  attempt?: {
    taskPublicId: string;
    retryCount: number;
    startedAt: Date;
  };
  resolveGroundingContext?: (input: {
    requestContext: TRequestContext;
  }) =>
    | Promise<AiGenerationRouteIntegratedGroundingContext>
    | AiGenerationRouteIntegratedGroundingContext;
  resolveGovernanceContext?: (input: {
    requestContext: TRequestContext;
  }) =>
    | Promise<AiGenerationRouteIntegratedGovernanceContext | null>
    | AiGenerationRouteIntegratedGovernanceContext
    | null;
  reserveAiCallLog?: (input: {
    requestContext: TRequestContext;
    governanceContext: AiGenerationRouteIntegratedGovernanceContext;
    groundingSummary: AiGenerationRouteIntegratedGroundingSummary;
    attempt: {
      taskPublicId: string;
      retryCount: number;
      startedAt: Date;
    };
    startedAt: Date;
  }) => Promise<{ publicId: string }>;
  appendAiCallLog?: (input: {
    aiCallLogPublicId: string;
    requestContext: TRequestContext;
    governanceContext: AiGenerationRouteIntegratedGovernanceContext;
    groundingSummary: AiGenerationRouteIntegratedGroundingSummary;
    attempt: {
      taskPublicId: string;
      retryCount: number;
      startedAt: Date;
    };
    executionSummary: AiGenerationRouteIntegratedProviderExecutionSummary;
    startedAt: Date;
    completedAt: Date;
  }) => Promise<{ publicId: string }>;
  readProviderCredential: () => Promise<string | null> | string | null;
  executeProviderRequest?: AiGenerationRouteIntegratedProviderExecutor<TRequestContext>;
};

export type AiGenerationRouteIntegratedProfession =
  | "monopoly"
  | "marketing"
  | "logistics";

export type AiGenerationRouteIntegratedSubject = "theory" | "skill";

export type AiGenerationRouteIntegratedKnowledgeNodeMode =
  | "balanced"
  | "selected"
  | "weak_point_priority"
  | "comprehensive";

export type AiGenerationRouteIntegratedSourcePreference =
  | "balanced"
  | "prefer_platform"
  | "prefer_enterprise";

export type AiGenerationRouteIntegratedQuestionTypeDistribution =
  | "balanced_40_30_30"
  | "single_50_multi_25_true_false_25"
  | "weak_point_priority";

export type AiGenerationRouteIntegratedPaperStructure =
  | "by_question_type"
  | "by_knowledge_node";

export type AiGenerationRouteIntegratedKnowledgeScope = {
  knowledgeNode: string | null;
  knowledgeNodeMode: AiGenerationRouteIntegratedKnowledgeNodeMode;
  knowledgeNodePublicIds: readonly string[];
  includeDescendants: boolean;
  knowledgeNodeSupplement: string | null;
  sourcePreference: AiGenerationRouteIntegratedSourcePreference | null;
};

export type AiGenerationRouteIntegratedGenerationParameters = {
  profession: AiGenerationRouteIntegratedProfession;
  level: 1 | 2 | 3 | 4 | 5;
  subject: AiGenerationRouteIntegratedSubject;
  questionType: string | null;
  questionCount: number;
  difficulty: string | null;
  learningObjective: string | null;
  questionTypeDistribution?: AiGenerationRouteIntegratedQuestionTypeDistribution | null;
  paperStructure?: AiGenerationRouteIntegratedPaperStructure | null;
} & AiGenerationRouteIntegratedKnowledgeScope;

const knowledgeNodeModeValues = [
  "balanced",
  "selected",
  "weak_point_priority",
  "comprehensive",
] as const satisfies readonly AiGenerationRouteIntegratedKnowledgeNodeMode[];
const sourcePreferenceValues = [
  "balanced",
  "prefer_platform",
  "prefer_enterprise",
] as const satisfies readonly AiGenerationRouteIntegratedSourcePreference[];
const questionTypeDistributionValues = [
  "balanced_40_30_30",
  "single_50_multi_25_true_false_25",
  "weak_point_priority",
] as const satisfies readonly AiGenerationRouteIntegratedQuestionTypeDistribution[];
const paperStructureValues = [
  "by_question_type",
  "by_knowledge_node",
] as const satisfies readonly AiGenerationRouteIntegratedPaperStructure[];

export function createDefaultAiGenerationRouteIntegratedKnowledgeScope(
  input: Partial<AiGenerationRouteIntegratedKnowledgeScope> = {},
): AiGenerationRouteIntegratedKnowledgeScope {
  return {
    knowledgeNode: input.knowledgeNode ?? null,
    knowledgeNodeMode: input.knowledgeNodeMode ?? "balanced",
    knowledgeNodePublicIds: input.knowledgeNodePublicIds ?? [],
    includeDescendants: input.includeDescendants ?? false,
    knowledgeNodeSupplement: input.knowledgeNodeSupplement ?? null,
    sourcePreference: input.sourcePreference ?? null,
  };
}

export function normalizeAiGenerationRouteIntegratedKnowledgeScope(input: {
  includeDescendants?: unknown;
  knowledgeNode?: unknown;
  knowledgeNodeMode?: unknown;
  knowledgeNodePublicIds?: unknown;
  knowledgeNodeSupplement?: unknown;
  sourcePreference?: unknown;
}): AiGenerationRouteIntegratedKnowledgeScope | null {
  const knowledgeNode = normalizeRouteIntegratedOptionalText(
    input.knowledgeNode,
  );
  const knowledgeNodePublicIds = normalizeRouteIntegratedPublicIdList(
    input.knowledgeNodePublicIds,
  );

  if (knowledgeNodePublicIds === null) {
    return null;
  }

  const knowledgeNodeMode = normalizeRouteIntegratedKnowledgeNodeMode(
    input.knowledgeNodeMode,
    knowledgeNodePublicIds,
  );
  const includeDescendants = normalizeRouteIntegratedIncludeDescendants(
    input.includeDescendants,
    knowledgeNodePublicIds,
  );
  const sourcePreference = normalizeRouteIntegratedSourcePreference(
    input.sourcePreference,
  );

  if (
    knowledgeNodeMode === null ||
    includeDescendants === null ||
    sourcePreference === "invalid"
  ) {
    return null;
  }

  return {
    knowledgeNode,
    knowledgeNodeMode,
    knowledgeNodePublicIds,
    includeDescendants,
    knowledgeNodeSupplement:
      normalizeRouteIntegratedOptionalText(input.knowledgeNodeSupplement) ??
      knowledgeNode,
    sourcePreference,
  };
}

function normalizeRouteIntegratedKnowledgeNodeMode(
  value: unknown,
  knowledgeNodePublicIds: string[],
): AiGenerationRouteIntegratedKnowledgeNodeMode | null {
  if (value === null || value === undefined || value === "") {
    return knowledgeNodePublicIds.length > 0 ? "selected" : "balanced";
  }

  return typeof value === "string" &&
    knowledgeNodeModeValues.includes(
      value as AiGenerationRouteIntegratedKnowledgeNodeMode,
    )
    ? (value as AiGenerationRouteIntegratedKnowledgeNodeMode)
    : null;
}

function normalizeRouteIntegratedIncludeDescendants(
  value: unknown,
  knowledgeNodePublicIds: string[],
) {
  if (value === null || value === undefined) {
    return knowledgeNodePublicIds.length > 0;
  }

  return typeof value === "boolean" ? value : null;
}

function normalizeRouteIntegratedSourcePreference(
  value: unknown,
): AiGenerationRouteIntegratedSourcePreference | null | "invalid" {
  const text = normalizeRouteIntegratedOptionalText(value);

  if (text === null) {
    return null;
  }

  return sourcePreferenceValues.includes(
    text as AiGenerationRouteIntegratedSourcePreference,
  )
    ? (text as AiGenerationRouteIntegratedSourcePreference)
    : "invalid";
}

export function normalizeAiGenerationRouteIntegratedQuestionTypeDistribution(
  value: unknown,
): AiGenerationRouteIntegratedQuestionTypeDistribution | null | "invalid" {
  const text = normalizeRouteIntegratedOptionalText(value);

  if (text === null) {
    return null;
  }

  return questionTypeDistributionValues.includes(
    text as AiGenerationRouteIntegratedQuestionTypeDistribution,
  )
    ? (text as AiGenerationRouteIntegratedQuestionTypeDistribution)
    : "invalid";
}

export function normalizeAiGenerationRouteIntegratedPaperStructure(
  value: unknown,
): AiGenerationRouteIntegratedPaperStructure | null | "invalid" {
  const text = normalizeRouteIntegratedOptionalText(value);

  if (text === null) {
    return null;
  }

  return paperStructureValues.includes(
    text as AiGenerationRouteIntegratedPaperStructure,
  )
    ? (text as AiGenerationRouteIntegratedPaperStructure)
    : "invalid";
}

function normalizeRouteIntegratedPublicIdList(value: unknown): string[] | null {
  if (value === null || value === undefined) {
    return [];
  }

  if (!Array.isArray(value)) {
    return null;
  }

  const publicIds = value.map((item) =>
    typeof item === "string" ? item.trim() : null,
  );

  if (
    publicIds.some(
      (publicId) =>
        publicId === null ||
        publicId === "" ||
        !/^[a-zA-Z0-9][a-zA-Z0-9_-]*$/u.test(publicId),
    )
  ) {
    return null;
  }

  return Array.from(new Set(publicIds as string[]));
}

function normalizeRouteIntegratedOptionalText(value: unknown): string | null {
  if (value === null || value === undefined) {
    return null;
  }

  return typeof value === "string" && value.trim() !== "" ? value.trim() : null;
}

export type AiGenerationRouteIntegratedGroundingCitation = {
  resourceTitle: string;
  headingPath: string[];
  chunkIndex: number;
  chunkText: string;
  score: number;
};

export type AiGenerationRouteIntegratedGroundingSummary = {
  evidenceStatus: EvidenceStatus;
  citationCount: number;
};

export type AiGenerationRouteIntegratedGroundingContext =
  AiGenerationRouteIntegratedGroundingSummary & {
    generationParameters: AiGenerationRouteIntegratedGenerationParameters;
    citations: AiGenerationRouteIntegratedGroundingCitation[];
  };

export type AiGenerationRouteIntegratedStructuredPreviewOptions =
  | {
      kind: "question_set";
      requestedQuestionCount: number;
      generationParameters?: Partial<
        Pick<
          AiGenerationRouteIntegratedGenerationParameters,
          "questionType" | "difficulty"
        >
      > | null;
    }
  | {
      kind: "paper_draft";
      requestedQuestionCount?: number | null;
      generationParameters?: Partial<
        Pick<
          AiGenerationRouteIntegratedGenerationParameters,
          "sourcePreference" | "questionTypeDistribution" | "paperStructure"
        >
      > | null;
    };

export type AiGenerationRouteIntegratedQuestionDraftSummary = {
  draftNumber: number;
  questionType: string | null;
  difficulty: string | null;
  knowledgeNodeCount: number | null;
  knowledgeNodeLabels?: string[];
  questionStem?: string;
  questionOptions?: AiGenerationRouteIntegratedQuestionOptionDraft[];
  standardAnswer?: string;
  analysis?: string;
  reviewStatus: "draft_review_required";
};

export type AiGenerationRouteIntegratedQuestionOptionDraft = {
  optionLabel: string | null;
  optionText: string;
  isCorrect?: boolean | null;
};

export type AiGenerationRouteIntegratedPaperSectionDraftSummary = {
  sectionNumber: number;
  paperSectionType: string | null;
  title: string | null;
  description?: string;
  questionCount: number | null;
  questionDrafts: AiGenerationRouteIntegratedQuestionDraftSummary[];
};

export type AiGenerationRouteIntegratedStructuredPreview =
  | {
      kind: "question_set";
      parseStatus: "parsed";
      requestedQuestionCount: number;
      actualQuestionCount: number;
      draftCount: number;
      draftSummaries: AiGenerationRouteIntegratedQuestionDraftSummary[];
    }
  | {
      kind: "question_set";
      parseStatus: "failed";
      requestedQuestionCount: number;
      actualQuestionCount: number | null;
      failureCategory:
        | "invalid_json"
        | "missing_questions"
        | "question_count_mismatch"
        | "question_type_mismatch"
        | "difficulty_mismatch";
      draftCount: 0;
      draftSummaries: [];
    }
  | {
      kind: "paper_draft";
      parseStatus: "parsed";
      paperSectionCount: number;
      questionCount: number | null;
      questionTypeDistributionCount: number | null;
      knowledgeCoverageCount: number | null;
      paperSectionSummaries: AiGenerationRouteIntegratedPaperSectionDraftSummary[];
      reviewStatus: "draft_review_required";
    }
  | {
      kind: "paper_draft";
      parseStatus: "failed";
      failureCategory:
        | "invalid_json"
        | "missing_paper_sections"
        | "missing_question_count"
        | "question_count_mismatch"
        | "source_preference_mismatch"
        | "question_type_distribution_mismatch"
        | "paper_structure_mismatch"
        | "provider_question_content_forbidden";
      requestedQuestionCount?: number | null;
      paperSectionCount: number;
      questionCount: number | null;
      questionTypeDistributionCount: number | null;
      knowledgeCoverageCount: number | null;
      reviewStatus: "structured_parse_failed";
    };

export type AiGenerationRouteIntegratedVisibleGeneratedContent = {
  content: string;
  contentVisibility: "transient_response_only";
  persistenceStatus: "not_persisted";
  safetyStatus: "checked";
  groundingSummary?: AiGenerationRouteIntegratedGroundingSummary;
  structuredPreview?: AiGenerationRouteIntegratedStructuredPreview;
};

export type AiGenerationRouteIntegratedProviderExecutionOutcome = {
  realProviderExecutionApproved: boolean;
  providerCallExecuted: boolean;
  envSecretAccessed: boolean;
  providerConfigurationRead: boolean;
  executionSummary: AiGenerationRouteIntegratedProviderExecutionSummary;
  aiCallLogPublicId: string | null;
  visibleGeneratedContent: AiGenerationRouteIntegratedVisibleGeneratedContent | null;
};
