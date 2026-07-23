import { describe, expect, it } from "vitest";

import { normalizeAdminAiGenerationFormalAdoptionInput } from "./admin-ai-generation-formal-adoption";

function createInput() {
  return {
    adoptionPublicId: "admin_ai_formal_adoption_public_candidate",
    actor: {
      publicId: "admin_content_public_candidate",
      roles: ["content_admin"],
    },
    resultPublicId: "admin_ai_generation_result_public_candidate",
    expectedContentDigest:
      "sha256:bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
    targetType: "question",
    reviewDecision: "approved",
    reviewerConfirmed: true,
    weakEvidenceConfirmed: true,
    reviewedAt: "2026-07-22T20:00:00.000Z",
    knowledgeNodeResolutions: [
      {
        label: "营销基础",
        knowledgeNodePublicId: "knowledge_node_public_marketing",
      },
      {
        label: "客户需求",
        knowledgeNodePublicId: "knowledge_node_public_customer",
      },
    ],
  };
}

describe("admin AI generation formal adoption validator", () => {
  it("preserves only exact label-to-public-id resolution commands", () => {
    expect(
      normalizeAdminAiGenerationFormalAdoptionInput(createInput()),
    ).toEqual({
      success: true,
      value: expect.objectContaining({
        knowledgeNodeResolutions: [
          {
            label: "营销基础",
            knowledgeNodePublicId: "knowledge_node_public_marketing",
          },
          {
            label: "客户需求",
            knowledgeNodePublicId: "knowledge_node_public_customer",
          },
        ],
      }),
    });
  });

  it.each([
    {
      knowledgeNodeResolutions: [
        { label: "营销基础", knowledgeNodePublicId: "" },
      ],
    },
    {
      knowledgeNodeResolutions: [
        {
          label: "营销\n基础",
          knowledgeNodePublicId: "knowledge_node_public_marketing",
        },
      ],
    },
    {
      knowledgeNodeResolutions: [
        {
          label: "营销基础",
          knowledgeNodePublicId: "knowledge_node_public_marketing",
        },
        {
          label: "营销基础",
          knowledgeNodePublicId: "knowledge_node_public_customer",
        },
      ],
    },
    {
      knowledgeNodeResolutions: [
        {
          label: "营销基础",
          knowledgeNodePublicId: "knowledge_node_public_marketing",
        },
        {
          label: "客户需求",
          knowledgeNodePublicId: "knowledge_node_public_marketing",
        },
      ],
    },
  ])(
    "rejects malformed or ambiguous mapping $knowledgeNodeResolutions",
    ({ knowledgeNodeResolutions }) => {
      expect(
        normalizeAdminAiGenerationFormalAdoptionInput({
          ...createInput(),
          knowledgeNodeResolutions,
        }),
      ).toMatchObject({ success: false });
    },
  );

  it("rejects client-supplied candidate content facts", () => {
    expect(
      normalizeAdminAiGenerationFormalAdoptionInput({
        ...createInput(),
        difficulty: "easy",
        questionStem: "client injected question",
      }),
    ).toMatchObject({ success: false });
  });

  it("drops a legacy client-supplied reviewed draft from the normalized command", () => {
    const result = normalizeAdminAiGenerationFormalAdoptionInput({
      ...createInput(),
      reviewedDraft: {
        questionType: "short_answer",
        stemRichText: "client injected reviewed draft",
      },
    });

    expect(result).toMatchObject({ success: true });
    expect(result.success && result.value).not.toHaveProperty("reviewedDraft");
  });

  it("accepts rejection without forcing a fabricated mapping", () => {
    const input = createInput();
    const { knowledgeNodeResolutions: _omitted, ...rejection } = input;

    expect(
      normalizeAdminAiGenerationFormalAdoptionInput({
        ...rejection,
        reviewDecision: "rejected",
      }),
    ).toMatchObject({
      success: true,
      value: {
        reviewDecision: "rejected",
      },
    });
  });
});
