import { describe, expect, it } from "vitest";

import { buildPersonalAiGenerationAiCallLogReferenceReadModel } from "./personal-ai-generation-ai-call-log-reference-service";

function createBaseInput() {
  const rawPromptFixture = ["RAW", "PROMPT", "BATCH", "122"].join("-");
  const rawGeneratedContentFixture = [
    "RAW",
    "GENERATED",
    "CONTENT",
    "BATCH",
    "122",
  ].join("-");
  const providerPayloadFixture = ["PROVIDER", "PAYLOAD", "BATCH", "122"].join(
    "-",
  );
  const fullPaperFixture = ["FULL", "PAPER", "CONTENT", "BATCH", "122"].join(
    "-",
  );
  const secretTokenFixture = ["SECRET", "TOKEN", "BATCH", "122"].join("-");

  return {
    id: 122,
    taskPublicId: "ai_generation_task_public_122",
    taskType: "ai_question_generation",
    status: "succeeded",
    failureCategory: null,
    resultPublicId: "ai_generated_question_set_public_122",
    evidenceStatus: "sufficient",
    citationCount: 3,
    aiCallLogPublicId: "ai_call_log_public_122",
    rawPromptFixture,
    rawGeneratedContentFixture,
    providerPayloadFixture,
    fullPaperFixture,
    secretTokenFixture,
  };
}

describe("personal AI generation ai_call_log reference service", () => {
  it("builds a redacted ai_call_log reference without raw generated content", () => {
    const input = createBaseInput();
    const result = buildPersonalAiGenerationAiCallLogReferenceReadModel(input);
    const serializedResult = JSON.stringify(result);

    expect(result).toEqual({
      code: 0,
      message: "ok",
      data: {
        runtimeStatus: "local_contract_only",
        taskPublicId: "ai_generation_task_public_122",
        taskType: "ai_question_generation",
        status: "succeeded",
        failureCategory: null,
        referenceStatus: "redacted_reference",
        aiCallLogReference: {
          publicId: "ai_call_log_public_122",
          contentVisibility: "summary_only",
          redactionStatus: "redacted",
          rawPromptStatus: "not_stored",
          rawGeneratedContentStatus: "not_stored",
          providerPayloadStatus: "not_stored",
        },
        resultReference: {
          resultPublicId: "ai_generated_question_set_public_122",
          contentVisibility: "summary_only",
          redactionStatus: "redacted",
          evidenceStatus: "sufficient",
          citationCount: 3,
          rawGeneratedContentStatus: "not_stored",
        },
      },
    });
    expect(serializedResult).not.toMatch(/"id":/);
    expect(serializedResult).not.toContain(input.rawPromptFixture);
    expect(serializedResult).not.toContain(input.rawGeneratedContentFixture);
    expect(serializedResult).not.toContain(input.providerPayloadFixture);
    expect(serializedResult).not.toContain(input.fullPaperFixture);
    expect(serializedResult).not.toContain(input.secretTokenFixture);
  });

  it("keeps pending ai_call_log and result references nullable", () => {
    expect(
      buildPersonalAiGenerationAiCallLogReferenceReadModel({
        ...createBaseInput(),
        status: "pending",
        resultPublicId: null,
        evidenceStatus: "none",
        citationCount: 0,
        aiCallLogPublicId: null,
      }),
    ).toMatchObject({
      code: 0,
      data: {
        status: "pending",
        aiCallLogReference: {
          publicId: null,
          rawPromptStatus: "not_stored",
          rawGeneratedContentStatus: "not_stored",
          providerPayloadStatus: "not_stored",
        },
        resultReference: {
          resultPublicId: null,
          evidenceStatus: "none",
          citationCount: 0,
          rawGeneratedContentStatus: "not_stored",
        },
      },
    });
  });

  it("rejects non-personal ai_generation_task types", () => {
    expect(
      buildPersonalAiGenerationAiCallLogReferenceReadModel({
        ...createBaseInput(),
        taskType: "organization_training_generation",
      }),
    ).toEqual({
      code: 400043,
      message: "Invalid personal AI generation ai_call_log reference input.",
      data: null,
    });
  });
});
