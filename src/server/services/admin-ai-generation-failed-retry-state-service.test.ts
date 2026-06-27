import { describe, expect, it } from "vitest";

import type { AdminAiGenerationFailedRetrySource } from "../contracts/admin-ai-generation-local-contract";
import { createAdminAiGenerationFailedRetryState } from "./admin-ai-generation-failed-retry-state-service";

function createFailedRetrySource(
  overrides: Partial<AdminAiGenerationFailedRetrySource> = {},
): AdminAiGenerationFailedRetrySource {
  return {
    taskPublicId: "admin_ai_generation_task_failed_101",
    requestPublicId: "admin_ai_generation_request_failed_101",
    workspace: "content",
    generationKind: "question",
    taskType: "ai_question_generation",
    status: "failed",
    failureCategory: "provider_temporary_error",
    failedAt: "2026-06-27T08:00:00.000Z",
    retryCount: 1,
    maxRetryCount: 3,
    resultPublicId: null,
    contentVisibility: "summary_only",
    evidenceStatus: "weak",
    citationCount: 1,
    aiCallLogPublicId: "ai_call_log_public_redacted_101",
    redactionStatus: "redacted",
    ...overrides,
  };
}

describe("admin AI generation failed retry state service", () => {
  it("creates a retry request available state without executing provider or retry mutation", () => {
    const protectedInputArtifact = "PROTECTED_RETRY_INPUT_MUST_NOT_LEAK";
    const protectedOutputArtifact = "PROTECTED_RETRY_OUTPUT_MUST_NOT_LEAK";
    const protectedProviderArtifact = "PROTECTED_RETRY_PROVIDER_MUST_NOT_LEAK";
    const retrySource = {
      ...createFailedRetrySource(),
      protectedInputArtifact,
      protectedOutputArtifact,
      protectedProviderArtifact,
    } as AdminAiGenerationFailedRetrySource & {
      protectedInputArtifact: string;
      protectedOutputArtifact: string;
      protectedProviderArtifact: string;
    };

    const retryState = createAdminAiGenerationFailedRetryState(retrySource);
    const serializedRetryState = JSON.stringify(retryState);

    expect(retryState).toEqual({
      retryRequestStatus: "retry_request_available",
      sourceTask: {
        taskPublicId: "admin_ai_generation_task_failed_101",
        requestPublicId: "admin_ai_generation_request_failed_101",
        workspace: "content",
        generationKind: "question",
        taskType: "ai_question_generation",
        status: "failed",
        failureCategory: "provider_temporary_error",
        failedAt: "2026-06-27T08:00:00.000Z",
        resultPublicId: null,
        contentVisibility: "summary_only",
        evidenceStatus: "weak",
        citationCount: 1,
        aiCallLogPublicId: "ai_call_log_public_redacted_101",
        redactionStatus: "redacted",
      },
      retryState: {
        canRequestRetry: true,
        blockedReason: null,
        retryCount: 1,
        maxRetryCount: 3,
        nextRetryAttempt: 2,
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
    });
    expect(serializedRetryState).not.toContain(protectedInputArtifact);
    expect(serializedRetryState).not.toContain(protectedOutputArtifact);
    expect(serializedRetryState).not.toContain(protectedProviderArtifact);
    expect(serializedRetryState).not.toMatch(/"id":/u);
  });

  it("blocks non-failed, non-retryable, and retry-limit-reached sources safely", () => {
    const sources = [
      createFailedRetrySource({
        status: "running",
        failureCategory: null,
      }),
      createFailedRetrySource({
        failureCategory: "invalid_input",
      }),
      createFailedRetrySource({
        retryCount: 3,
        maxRetryCount: 3,
      }),
    ];

    const retryStates = sources.map(createAdminAiGenerationFailedRetryState);

    expect(
      retryStates.map((retryState) => retryState.retryRequestStatus),
    ).toEqual([
      "blocked_non_failed_task",
      "blocked_non_retryable_failure",
      "blocked_retry_limit_reached",
    ]);
    expect(
      retryStates.map((retryState) => retryState.retryState.canRequestRetry),
    ).toEqual([false, false, false]);
    expect(
      retryStates.map(
        (retryState) => retryState.executionBoundary.retryMutationStatus,
      ),
    ).toEqual(["not_executed", "not_executed", "not_executed"]);
  });
});
