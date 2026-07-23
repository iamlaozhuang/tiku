import { describe, expect, it } from "vitest";

import {
  promptTemplateDefinitions,
  promptTemplateKeysByFuncType,
} from "@/ai/prompts/templates";
import {
  createMockAiProvider,
  type MockLearningSuggestionInput,
} from "@/ai/mock-provider";

describe("AI provider redaction and function contract", () => {
  it("keeps mock provider results behind a redacted payload boundary", async () => {
    const mockProvider = createMockAiProvider();
    const promptMarker = "synthetic-alpha-marker";
    const answerMarker = "synthetic-beta-marker";
    const providerResult = await mockProvider.generateLearningSuggestion({
      rawPrompt: promptMarker,
      rawAnswer: answerMarker,
      modelConfigSnapshot: {
        modelName: "local-mock-model",
      } as MockLearningSuggestionInput["modelConfigSnapshot"],
      promptTemplate: {
        promptTemplateKey: "learning_suggestion_v1",
        templateHash: "learning_suggestion_v1_baseline",
        version: 1,
      },
    });
    const serializedProviderResult = JSON.stringify(providerResult);
    const serializedProviderRequestReference = JSON.stringify(
      providerResult.providerRequestPayload,
    );
    const serializedProviderResponseReference = JSON.stringify(
      providerResult.providerResponsePayload,
    );

    expect(providerResult.providerRequestPayload).toEqual({
      referenceKind: "request_redaction_boundary",
      redactionStatus: "redacted",
      summary: "redacted provider request",
    });
    expect(providerResult.providerResponsePayload).toEqual({
      referenceKind: "response_redaction_boundary",
      redactionStatus: "redacted",
      summary: "redacted provider response",
    });
    expect(providerResult.providerExecutionGate).toEqual({
      gate: "provider_execution",
      reason: "provider_request_requires_fresh_approval",
      status: "blocked",
    });
    expect(serializedProviderResult).not.toContain(promptMarker);
    expect(serializedProviderResult).not.toContain(answerMarker);
    expect(serializedProviderResult).not.toContain("apiKey");
    expect(serializedProviderResult).not.toContain("secret");
    expect(serializedProviderResult).not.toContain("requestId");
    expect(serializedProviderRequestReference).not.toContain("payloadKind");
    expect(serializedProviderRequestReference).not.toContain(
      "provider_request",
    );
    expect(serializedProviderRequestReference).not.toContain(
      "provider request payload",
    );
    expect(serializedProviderResponseReference).not.toContain("payloadKind");
    expect(serializedProviderResponseReference).not.toContain(
      "provider_response",
    );
    expect(serializedProviderResponseReference).not.toContain(
      "provider response payload",
    );
  });

  it("uses glossary-compatible AI function values across prompt registry keys", () => {
    expect(promptTemplateKeysByFuncType).toEqual({
      ai_explanation: "ai_explanation_v1",
      ai_hint: "ai_hint_v1",
      ai_paper_generation: "ai_paper_generation_v1",
      ai_question_generation: "ai_question_generation_v2",
      ai_scoring: "ai_scoring_v1",
      kn_recommendation: "kn_recommendation_v1",
      learning_suggestion: "learning_suggestion_v1",
    });
    expect(
      promptTemplateDefinitions.map((templateDefinition) => ({
        aiFuncType: templateDefinition.aiFuncType,
        key: templateDefinition.promptTemplateKey,
      })),
    ).toEqual([
      {
        aiFuncType: "ai_scoring",
        key: "ai_scoring_v1",
      },
      {
        aiFuncType: "ai_explanation",
        key: "ai_explanation_v1",
      },
      {
        aiFuncType: "ai_hint",
        key: "ai_hint_v1",
      },
      {
        aiFuncType: "kn_recommendation",
        key: "kn_recommendation_v1",
      },
      {
        aiFuncType: "learning_suggestion",
        key: "learning_suggestion_v1",
      },
      {
        aiFuncType: "ai_question_generation",
        key: "ai_question_generation_v2",
      },
      {
        aiFuncType: "ai_paper_generation",
        key: "ai_paper_generation_v1",
      },
    ]);
  });
});
