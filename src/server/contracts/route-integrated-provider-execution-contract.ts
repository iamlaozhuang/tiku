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
  maxOutputTokens: 220;
  timeoutMs: 30000;
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
  maxOutputTokens: 220;
  timeoutMs: 30000;
  readProviderCredential: () => Promise<string | null> | string | null;
  executeProviderRequest?: AiGenerationRouteIntegratedProviderExecutor<TRequestContext>;
};

export type AiGenerationRouteIntegratedStructuredPreviewOptions =
  | {
      kind: "question_set";
      requestedQuestionCount: number;
    }
  | {
      kind: "paper_draft";
    };

export type AiGenerationRouteIntegratedQuestionDraftSummary = {
  draftNumber: number;
  questionType: string | null;
  difficulty: string | null;
  knowledgeNodeCount: number | null;
  reviewStatus: "draft_review_required";
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
      reviewStatus: "draft_review_required";
    }
  | {
      kind: "paper_draft";
      parseStatus: "failed";
      failureCategory: "invalid_json" | "missing_paper_sections";
      paperSectionCount: 0;
      questionCount: null;
      questionTypeDistributionCount: null;
      knowledgeCoverageCount: null;
      reviewStatus: "structured_parse_failed";
    };

export type AiGenerationRouteIntegratedVisibleGeneratedContent = {
  content: string;
  contentVisibility: "transient_response_only";
  persistenceStatus: "not_persisted";
  safetyStatus: "checked";
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
