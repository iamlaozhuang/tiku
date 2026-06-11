import { describe, expect, it } from "vitest";

import { buildPersonalAiGenerationResultReferenceReadModel } from "./personal-ai-generation-result-reference-service";

function createBaseInput() {
  const omittedPromptFixture = ["OMITTED", "PROMPT", "FIXTURE"].join("-");
  const omittedGeneratedFixture = ["OMITTED", "GENERATED", "FIXTURE"].join("-");
  const omittedProviderPayloadFixture = ["OMITTED", "PROVIDER", "PAYLOAD"].join(
    "-",
  );
  const omittedTokenFixture = ["OMITTED", "TOKEN", "FIXTURE"].join("-");
  const omittedRedeemCodeFixture = ["OMITTED", "REDEEM", "CODE"].join("-");

  return {
    id: 812,
    taskPublicId: "ai_generation_task_public_112",
    taskType: "ai_question_generation",
    status: "succeeded",
    failureCategory: null,
    resultPublicId: "ai_generated_question_set_public_112",
    evidenceStatus: "sufficient",
    citationCount: 3,
    aiCallLogPublicId: "ai_call_log_public_112",
    omittedPromptFixture,
    omittedGeneratedFixture,
    omittedProviderPayloadFixture,
    omittedTokenFixture,
    omittedRedeemCodeFixture,
  };
}

describe("personal AI generation result reference service", () => {
  it("builds a redacted summary result reference without raw generated AI content", () => {
    const input = createBaseInput();
    const result = buildPersonalAiGenerationResultReferenceReadModel(input);
    const serializedResult = JSON.stringify(result);

    expect(result).toEqual({
      code: 0,
      message: "ok",
      data: {
        runtimeStatus: "local_contract_only",
        taskPublicId: "ai_generation_task_public_112",
        taskType: "ai_question_generation",
        status: "succeeded",
        failureCategory: null,
        resultReference: {
          resultPublicId: "ai_generated_question_set_public_112",
          contentVisibility: "summary_only",
          redactionStatus: "redacted",
          evidenceStatus: "sufficient",
          citationCount: 3,
        },
        aiCallLogReference: {
          aiCallLogPublicId: "ai_call_log_public_112",
          contentVisibility: "summary_only",
          redactionStatus: "redacted",
        },
      },
    });
    expect(serializedResult).not.toMatch(/"id":/);
    expect(serializedResult).not.toContain(input.omittedPromptFixture);
    expect(serializedResult).not.toContain(input.omittedGeneratedFixture);
    expect(serializedResult).not.toContain(input.omittedProviderPayloadFixture);
    expect(serializedResult).not.toContain(input.omittedTokenFixture);
    expect(serializedResult).not.toContain(input.omittedRedeemCodeFixture);
  });

  it("keeps pending result ids nullable while preserving the redacted ai_call_log reference", () => {
    expect(
      buildPersonalAiGenerationResultReferenceReadModel({
        ...createBaseInput(),
        status: "pending",
        resultPublicId: null,
        evidenceStatus: "none",
        citationCount: 0,
        aiCallLogPublicId: null,
      }),
    ).toEqual({
      code: 0,
      message: "ok",
      data: {
        runtimeStatus: "local_contract_only",
        taskPublicId: "ai_generation_task_public_112",
        taskType: "ai_question_generation",
        status: "pending",
        failureCategory: null,
        resultReference: {
          resultPublicId: null,
          contentVisibility: "summary_only",
          redactionStatus: "redacted",
          evidenceStatus: "none",
          citationCount: 0,
        },
        aiCallLogReference: {
          aiCallLogPublicId: null,
          contentVisibility: "summary_only",
          redactionStatus: "redacted",
        },
      },
    });
  });

  it("requires failed personal AI generation results to include a failure category", () => {
    expect(
      buildPersonalAiGenerationResultReferenceReadModel({
        ...createBaseInput(),
        status: "failed",
        failureCategory: "production_enablement_blocked",
        resultPublicId: null,
        evidenceStatus: "none",
      }),
    ).toMatchObject({
      code: 0,
      data: {
        status: "failed",
        failureCategory: "production_enablement_blocked",
        resultReference: {
          resultPublicId: null,
          contentVisibility: "summary_only",
        },
      },
    });

    expect(
      buildPersonalAiGenerationResultReferenceReadModel({
        ...createBaseInput(),
        status: "failed",
        failureCategory: null,
      }),
    ).toEqual({
      code: 400014,
      message: "Invalid personal AI generation result reference input.",
      data: null,
    });
  });

  it("rejects organization training task types for the personal result reference contract", () => {
    expect(
      buildPersonalAiGenerationResultReferenceReadModel({
        ...createBaseInput(),
        taskType: "organization_training_generation",
      }),
    ).toEqual({
      code: 400014,
      message: "Invalid personal AI generation result reference input.",
      data: null,
    });
  });
});
