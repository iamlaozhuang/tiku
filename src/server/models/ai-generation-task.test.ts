import { describe, expect, it } from "vitest";

import {
  aiGenerationTaskFailureCategoryValues,
  aiGenerationTaskStatusValues,
  aiGenerationTaskTypeValues,
  isRetryableAiGenerationTaskFailureCategory,
  resolveAiGenerationTaskTransition,
} from "./ai-generation-task";

describe("AI generation task lifecycle model", () => {
  it("defines first-release provider-agnostic task types and public statuses", () => {
    expect(aiGenerationTaskTypeValues).toEqual([
      "ai_question_generation",
      "ai_paper_generation",
      "organization_training_generation",
    ]);
    expect(aiGenerationTaskStatusValues).toEqual([
      "pending",
      "running",
      "succeeded",
      "failed",
      "cancelled",
    ]);
  });

  it("allows the normal pending to terminal lifecycle transitions", () => {
    expect(resolveAiGenerationTaskTransition("pending", "claim")).toEqual({
      allowed: true,
      nextStatus: "running",
      effect: "start_execution",
      executionRewindAllowed: false,
    });
    expect(resolveAiGenerationTaskTransition("running", "succeed")).toEqual({
      allowed: true,
      nextStatus: "succeeded",
      effect: "finish_success",
      executionRewindAllowed: false,
    });
    expect(resolveAiGenerationTaskTransition("running", "fail")).toEqual({
      allowed: true,
      nextStatus: "failed",
      effect: "finish_failure",
      executionRewindAllowed: false,
    });
    expect(resolveAiGenerationTaskTransition("pending", "cancel")).toEqual({
      allowed: true,
      nextStatus: "cancelled",
      effect: "release_reserved_quota",
      executionRewindAllowed: true,
    });
  });

  it("blocks terminal rewrites and treats running cancellation as request-only", () => {
    expect(resolveAiGenerationTaskTransition("succeeded", "cancel")).toEqual({
      allowed: false,
      nextStatus: "succeeded",
      effect: "terminal_status_immutable",
      executionRewindAllowed: false,
    });
    expect(resolveAiGenerationTaskTransition("cancelled", "succeed")).toEqual({
      allowed: false,
      nextStatus: "cancelled",
      effect: "terminal_status_immutable",
      executionRewindAllowed: false,
    });
    expect(resolveAiGenerationTaskTransition("running", "cancel")).toEqual({
      allowed: true,
      nextStatus: "running",
      effect: "record_cancellation_request",
      executionRewindAllowed: false,
    });
  });

  it("classifies retryable and non-retryable failure categories", () => {
    expect(aiGenerationTaskFailureCategoryValues).toContain("running_timeout");
    expect(isRetryableAiGenerationTaskFailureCategory("network_error")).toBe(
      true,
    );
    expect(
      isRetryableAiGenerationTaskFailureCategory("quota_insufficient"),
    ).toBe(false);
    expect(
      isRetryableAiGenerationTaskFailureCategory(
        "production_enablement_blocked",
      ),
    ).toBe(false);
  });
});
