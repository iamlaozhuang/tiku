import { describe, expect, it } from "vitest";

import {
  QuestionBindingEligibilityError,
  createQuestionKnowledgeNodePublicIdCondition,
  createQuestionKnowledgeNodePublicIdsCondition,
  createQuestionMaterialPublicIdCondition,
  createQuestionTagPublicIdCondition,
  requireEligibleQuestionKnowledgeNodeIds,
  requireEligibleQuestionMaterialId,
} from "./question-repository";

function containsText(value: unknown, text: string, seen = new Set()): boolean {
  if (typeof value === "string") {
    return value.includes(text);
  }

  if (typeof value !== "object" || value === null || seen.has(value)) {
    return false;
  }

  seen.add(value);

  if (Array.isArray(value)) {
    return value.some((item) => containsText(item, text, seen));
  }

  return Object.values(value).some((item) => containsText(item, text, seen));
}

describe("question repository filters", () => {
  it("builds a database-level knowledge_node binding condition", () => {
    const condition = createQuestionKnowledgeNodePublicIdCondition(
      "knowledge_node_public_storage",
    );

    expect(condition).not.toBeNull();
    expect(containsText(condition, "question_knowledge_node")).toBe(true);
    expect(containsText(condition, "knowledge_node")).toBe(true);
    expect(containsText(condition, "knowledge_node_public_storage")).toBe(true);
  });

  it("builds one database-level knowledge_node condition for the complete AI paper source set", () => {
    const condition = createQuestionKnowledgeNodePublicIdsCondition([
      "knowledge_node_public_storage_a",
      "knowledge_node_public_storage_b",
    ]);

    expect(condition).not.toBeNull();
    expect(containsText(condition, "question_knowledge_node")).toBe(true);
    expect(containsText(condition, "knowledge_node_public_storage_a")).toBe(
      true,
    );
    expect(containsText(condition, "knowledge_node_public_storage_b")).toBe(
      true,
    );
    expect(createQuestionKnowledgeNodePublicIdsCondition([])).toBeNull();
  });

  it("builds a database-level tag binding condition", () => {
    const condition = createQuestionTagPublicIdCondition("tag_public_storage");

    expect(condition).not.toBeNull();
    expect(containsText(condition, "question_tag")).toBe(true);
    expect(containsText(condition, "tag")).toBe(true);
    expect(containsText(condition, "tag_public_storage")).toBe(true);
  });

  it("builds a database-level material binding condition", () => {
    const condition = createQuestionMaterialPublicIdCondition(
      "material_public_case_1",
    );

    expect(condition).not.toBeNull();
    expect(containsText(condition, "material")).toBe(true);
    expect(containsText(condition, "material_public_case_1")).toBe(true);
  });

  it("omits binding conditions when no filter is requested", () => {
    expect(createQuestionKnowledgeNodePublicIdCondition(null)).toBeNull();
    expect(createQuestionMaterialPublicIdCondition(null)).toBeNull();
    expect(createQuestionTagPublicIdCondition(null)).toBeNull();
  });
});

describe("question binding eligibility", () => {
  it("rejects a missing or newly disabled material but preserves the same existing binding", () => {
    expect(() =>
      requireEligibleQuestionMaterialId({
        requestedPublicId: "material-missing",
        row: undefined,
      }),
    ).toThrow(QuestionBindingEligibilityError);
    expect(() =>
      requireEligibleQuestionMaterialId({
        requestedPublicId: "material-disabled",
        row: {
          id: 12,
          public_id: "material-disabled",
          status: "disabled",
        },
      }),
    ).toThrow(QuestionBindingEligibilityError);
    expect(
      requireEligibleQuestionMaterialId({
        preservedPublicId: "material-disabled",
        requestedPublicId: "material-disabled",
        row: {
          id: 12,
          public_id: "material-disabled",
          status: "disabled",
        },
      }),
    ).toBe(12);
    expect(
      requireEligibleQuestionMaterialId({
        requestedPublicId: "material-available",
        row: {
          id: 13,
          public_id: "material-available",
          status: "available",
        },
      }),
    ).toBe(13);
  });

  it("requires every new knowledge_node to be active and recommendable while preserving existing disabled bindings", () => {
    const rows = [
      {
        id: 22,
        public_id: "knowledge-node-disabled",
        kn_status: "disabled" as const,
        is_recommendable: false,
      },
      {
        id: 21,
        public_id: "knowledge-node-active",
        kn_status: "active" as const,
        is_recommendable: true,
      },
    ];

    expect(
      requireEligibleQuestionKnowledgeNodeIds({
        preservedPublicIds: ["knowledge-node-disabled"],
        requestedPublicIds: [
          "knowledge-node-active",
          "knowledge-node-disabled",
        ],
        rows,
      }),
    ).toEqual([21, 22]);
    expect(() =>
      requireEligibleQuestionKnowledgeNodeIds({
        requestedPublicIds: ["knowledge-node-disabled"],
        rows,
      }),
    ).toThrow(QuestionBindingEligibilityError);
    expect(() =>
      requireEligibleQuestionKnowledgeNodeIds({
        requestedPublicIds: ["knowledge-node-not-recommendable"],
        rows: [
          {
            id: 23,
            public_id: "knowledge-node-not-recommendable",
            kn_status: "active",
            is_recommendable: false,
          },
        ],
      }),
    ).toThrow(QuestionBindingEligibilityError);
    expect(() =>
      requireEligibleQuestionKnowledgeNodeIds({
        requestedPublicIds: ["knowledge-node-missing"],
        rows,
      }),
    ).toThrow(QuestionBindingEligibilityError);
  });
});
