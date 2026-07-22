import { createHash } from "node:crypto";

import { describe, expect, it } from "vitest";

import {
  promptTemplateDefinitions,
  promptTemplateKeysByFuncType,
} from "./templates";

describe("Phase 5 prompt template definitions", () => {
  it("registers one versioned baseline template for each AI function", () => {
    expect(promptTemplateKeysByFuncType).toEqual({
      ai_scoring: "ai_scoring_v1",
      ai_explanation: "ai_explanation_v1",
      ai_hint: "ai_hint_v1",
      kn_recommendation: "kn_recommendation_v1",
      learning_suggestion: "learning_suggestion_v1",
      ai_question_generation: "ai_question_generation_v1",
      ai_paper_generation: "ai_paper_generation_v1",
    });
    expect(promptTemplateDefinitions).toHaveLength(7);
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
        aiFuncType: "ai_scoring",
        version: 1,
        isActive: true,
      },
      {
        key: "ai_explanation_v1",
        aiFuncType: "ai_explanation",
        version: 1,
        isActive: true,
      },
      {
        key: "ai_hint_v1",
        aiFuncType: "ai_hint",
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
      {
        key: "ai_question_generation_v1",
        aiFuncType: "ai_question_generation",
        version: 1,
        isActive: true,
      },
      {
        key: "ai_paper_generation_v1",
        aiFuncType: "ai_paper_generation",
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
    expect(promptTemplateDefinitions.slice(-2)).toEqual([
      expect.objectContaining({
        promptTemplateKey: "ai_question_generation_v1",
        requiredVariables: ["sceneLabel", "outputContract", "draftInstruction"],
      }),
      expect.objectContaining({
        promptTemplateKey: "ai_paper_generation_v1",
        requiredVariables: ["sceneLabel", "outputContract", "draftInstruction"],
      }),
    ]);
  });

  it("binds executable generation templates to SHA-256 content digests", () => {
    const generationDefinitions = promptTemplateDefinitions.filter(
      (definition) =>
        definition.aiFuncType === "ai_question_generation" ||
        definition.aiFuncType === "ai_paper_generation",
    );

    expect(generationDefinitions).toHaveLength(2);

    for (const definition of generationDefinitions) {
      expect(definition.templateHash).toMatch(/^[a-f0-9]{64}$/u);
      expect(definition.templateHash).toBe(
        createHash("sha256").update(definition.templateContent).digest("hex"),
      );
    }
  });
});
