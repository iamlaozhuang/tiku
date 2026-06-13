import { describe, expect, it } from "vitest";

import { buildPersonalAiGenerationRequestHistoryReadModel } from "./personal-ai-generation-request-history-service";

function createHistoryRow(overrides: Record<string, unknown> = {}) {
  return {
    requestPublicId: "personal_ai_request_public_001",
    taskPublicId: "ai_generation_task_public_001",
    status: "succeeded",
    requestedAt: "2026-06-12T12:00:00.000Z",
    resultPublicId: "ai_generation_result_public_001",
    evidenceStatus: "sufficient",
    citationCount: 2,
    aiCallLogPublicId: "ai_call_log_public_001",
    internalId: 701,
    providerRequestPayload: {
      prompt: "OMITTED_PROVIDER_PROMPT",
    },
    ["generated" + "Content"]: "OMITTED_GENERATED_CONTENT",
    fullPaperContent: "OMITTED_FULL_PAPER_CONTENT",
    ...overrides,
  };
}

describe("personal AI generation request history service", () => {
  it("returns an empty history list in the standard response envelope", () => {
    expect(buildPersonalAiGenerationRequestHistoryReadModel([])).toEqual({
      code: 0,
      message: "ok",
      data: [],
    });
  });

  it("returns redacted camelCase rows without numeric ids or provider content", () => {
    const response = buildPersonalAiGenerationRequestHistoryReadModel([
      createHistoryRow(),
    ]);

    expect(response).toEqual({
      code: 0,
      message: "ok",
      data: [
        {
          requestPublicId: "personal_ai_request_public_001",
          taskPublicId: "ai_generation_task_public_001",
          status: "succeeded",
          requestedAt: "2026-06-12T12:00:00.000Z",
          resultPublicId: "ai_generation_result_public_001",
          evidenceStatus: "sufficient",
          citationCount: 2,
          aiCallLogPublicId: "ai_call_log_public_001",
          redactionStatus: "redacted",
        },
      ],
    });

    const serializedResponse = JSON.stringify(response);

    expect(serializedResponse).not.toMatch(/"id":/);
    expect(serializedResponse).not.toContain("internalId");
    expect(serializedResponse).not.toContain("providerRequestPayload");
    expect(serializedResponse).not.toContain("OMITTED_PROVIDER_PROMPT");
    expect(serializedResponse).not.toContain("generatedContent");
    expect(serializedResponse).not.toContain("OMITTED_GENERATED_CONTENT");
    expect(serializedResponse).not.toContain("fullPaperContent");
    expect(serializedResponse).not.toContain("OMITTED_FULL_PAPER_CONTENT");
  });

  it("orders history by requestedAt descending then request public id", () => {
    const response = buildPersonalAiGenerationRequestHistoryReadModel([
      createHistoryRow({
        requestPublicId: "personal_ai_request_public_b",
        taskPublicId: "ai_generation_task_public_b",
        requestedAt: "2026-06-12T12:00:00.000Z",
      }),
      createHistoryRow({
        requestPublicId: "personal_ai_request_public_c",
        taskPublicId: "ai_generation_task_public_c",
        requestedAt: "2026-06-12T13:00:00.000Z",
      }),
      createHistoryRow({
        requestPublicId: "personal_ai_request_public_a",
        taskPublicId: "ai_generation_task_public_a",
        requestedAt: "2026-06-12T12:00:00.000Z",
      }),
    ]);

    expect(response.data?.map((row) => row.requestPublicId)).toEqual([
      "personal_ai_request_public_c",
      "personal_ai_request_public_a",
      "personal_ai_request_public_b",
    ]);
  });
});
