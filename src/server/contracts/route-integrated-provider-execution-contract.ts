import type { EvidenceStatus } from "../models/ai-rag";

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
  | "missing_provider_credential"
  | "provider_error"
  | "timeout"
  | "redaction_violation"
  | null;

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
  resolveGroundingContext?: (input: {
    requestContext: TRequestContext;
  }) =>
    | Promise<AiGenerationRouteIntegratedGroundingContext>
    | AiGenerationRouteIntegratedGroundingContext;
  readProviderCredential: () => Promise<string | null> | string | null;
  executeProviderRequest?: AiGenerationRouteIntegratedProviderExecutor<TRequestContext>;
};

export type AiGenerationRouteIntegratedProfession =
  | "monopoly"
  | "marketing"
  | "logistics";

export type AiGenerationRouteIntegratedSubject = "theory" | "skill";

export type AiGenerationRouteIntegratedGenerationParameters = {
  profession: AiGenerationRouteIntegratedProfession;
  level: 1 | 2 | 3 | 4 | 5;
  subject: AiGenerationRouteIntegratedSubject;
  knowledgeNode: string | null;
  questionType: string | null;
  questionCount: number;
  difficulty: string | null;
  learningObjective: string | null;
};

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
    }
  | {
      kind: "paper_draft";
      requestedQuestionCount?: number | null;
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
        | "question_count_mismatch";
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
  visibleGeneratedContent: AiGenerationRouteIntegratedVisibleGeneratedContent | null;
};
