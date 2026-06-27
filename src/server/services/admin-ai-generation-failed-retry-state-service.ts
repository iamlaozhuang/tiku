import type {
  AdminAiGenerationFailedRetryBlockedReason,
  AdminAiGenerationFailedRetryRequestStatus,
  AdminAiGenerationFailedRetrySource,
  AdminAiGenerationFailedRetryStateDto,
} from "../contracts/admin-ai-generation-local-contract";
import { isRetryableAiGenerationTaskFailureCategory } from "../models/ai-generation-task";

function resolveRetryBlockedReason(
  source: AdminAiGenerationFailedRetrySource,
): AdminAiGenerationFailedRetryBlockedReason | null {
  if (source.status !== "failed") {
    return "blocked_non_failed_task";
  }

  if (
    source.failureCategory === null ||
    !isRetryableAiGenerationTaskFailureCategory(source.failureCategory)
  ) {
    return "blocked_non_retryable_failure";
  }

  if (source.retryCount >= source.maxRetryCount) {
    return "blocked_retry_limit_reached";
  }

  return null;
}

function resolveRetryRequestStatus(
  blockedReason: AdminAiGenerationFailedRetryBlockedReason | null,
): AdminAiGenerationFailedRetryRequestStatus {
  return blockedReason ?? "retry_request_available";
}

export function createAdminAiGenerationFailedRetryState(
  source: AdminAiGenerationFailedRetrySource,
): AdminAiGenerationFailedRetryStateDto {
  const blockedReason = resolveRetryBlockedReason(source);
  const canRequestRetry = blockedReason === null;

  return {
    retryRequestStatus: resolveRetryRequestStatus(blockedReason),
    sourceTask: {
      taskPublicId: source.taskPublicId,
      requestPublicId: source.requestPublicId,
      workspace: source.workspace,
      generationKind: source.generationKind,
      taskType: source.taskType,
      status: source.status,
      failureCategory: source.failureCategory,
      failedAt: source.failedAt,
      resultPublicId: source.resultPublicId,
      contentVisibility: source.contentVisibility,
      evidenceStatus: source.evidenceStatus,
      citationCount: source.citationCount,
      aiCallLogPublicId: source.aiCallLogPublicId,
      redactionStatus: "redacted",
    },
    retryState: {
      canRequestRetry,
      blockedReason,
      retryCount: source.retryCount,
      maxRetryCount: source.maxRetryCount,
      nextRetryAttempt: canRequestRetry ? source.retryCount + 1 : null,
    },
    executionBoundary: {
      requestOnly: true,
      providerCallExecuted: false,
      providerCredentialRead: false,
      providerPayloadRequired: false,
      retryMutationStatus: "not_executed",
      retryExecutionStatus: "not_executed",
      redactionStatus: "redacted",
    },
    redactionStatus: "redacted",
  };
}
