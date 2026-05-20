import { describe, expect, it } from "vitest";

import {
  promptTemplateDefinitions,
  promptTemplateKeysByFuncType,
} from "./templates";

describe("Phase 5 prompt template definitions", () => {
  it("registers one versioned baseline template for each AI function", () => {
    expect(promptTemplateKeysByFuncType).toEqual({
      scoring: "ai_scoring_v1",
      explanation: "ai_explanation_v1",
      hint: "ai_hint_v1",
      kn_recommendation: "kn_recommendation_v1",
      learning_suggestion: "learning_suggestion_v1",
    });
    expect(promptTemplateDefinitions).toHaveLength(5);
  });

  it("keeps templates versioned and bound to explicit required variables", () => {
    expect(
      promptTemplateDefinitions.map((templateDefinition) => ({
        key: templateDefinition.promptTemplateKey,
        aiFuncType: templateDefinition.aiFuncType,
        version: templateDefinition.version,
        isActive: templateDefinition.isActive,
      })),
    ).toEqual([
      {
        key: "ai_scoring_v1",
        aiFuncType: "scoring",
        version: 1,
        isActive: true,
      },
      {
        key: "ai_explanation_v1",
        aiFuncType: "explanation",
        version: 1,
        isActive: true,
      },
      {
        key: "ai_hint_v1",
        aiFuncType: "hint",
        version: 1,
        isActive: true,
      },
      {
        key: "kn_recommendation_v1",
        aiFuncType: "kn_recommendation",
        version: 1,
        isActive: true,
      },
      {
        key: "learning_suggestion_v1",
        aiFuncType: "learning_suggestion",
        version: 1,
        isActive: true,
      },
    ]);
    expect(promptTemplateDefinitions[0]?.requiredVariables).toEqual([
      "question",
      "studentAnswer",
      "scoringPoints",
      "ragContext",
    ]);
  });
});
