import { describe, expect, it } from "vitest";

import {
  QuestionBindingEligibilityError,
  createPostgresQuestionRepository,
  createQuestionKnowledgeNodePublicIdCondition,
  createQuestionKnowledgeNodePublicIdsCondition,
  createQuestionMaterialPublicIdCondition,
  createQuestionTagPublicIdCondition,
  requireEligibleQuestionKnowledgeNodeIds,
  requireEligibleQuestionMaterialId,
} from "./question-repository";

type CapturedSelect = {
  calls: string[];
  selection: Record<string, unknown> | undefined;
};

function createSelectQueue(
  resultQueue: unknown[][],
  capturedSelects: CapturedSelect[],
) {
  return (selection?: Record<string, unknown>) => {
    const rows = resultQueue.shift() ?? [];
    const captured: CapturedSelect = { calls: [], selection };
    capturedSelects.push(captured);
    const query = {
      from() {
        captured.calls.push("from");
        return query;
      },
      leftJoin() {
        captured.calls.push("leftJoin");
        return query;
      },
      innerJoin() {
        captured.calls.push("innerJoin");
        return query;
      },
      where() {
        captured.calls.push("where");
        return query;
      },
      groupBy() {
        captured.calls.push("groupBy");
        return query;
      },
      orderBy() {
        captured.calls.push("orderBy");
        return query;
      },
      limit() {
        captured.calls.push("limit");
        return query;
      },
      offset() {
        captured.calls.push("offset");
        return query;
      },
      then<TResult1 = unknown[], TResult2 = never>(
        onfulfilled?:
          | ((value: unknown[]) => TResult1 | PromiseLike<TResult1>)
          | null,
        onrejected?:
          | ((reason: unknown) => TResult2 | PromiseLike<TResult2>)
          | null,
      ) {
        return Promise.resolve(rows).then(onfulfilled, onrejected);
      },
    };

    return query;
  };
}

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

describe("question detail repository read model", () => {
  it("deduplicates, counts, stably sorts, and paginates paper references in database queries", async () => {
    const timestamp = new Date("2026-07-22T08:00:00.000Z");
    const capturedSelects: CapturedSelect[] = [];
    const select = createSelectQueue(
      [
        [
          {
            id: 1,
            public_id: "question-public-001",
            question_type: "single_choice",
            profession: "marketing",
            level: 3,
            subject: "theory",
            stem_rich_text: "<p>题干</p>",
            analysis_rich_text: "<p>解析</p>",
            standard_answer_rich_text: "<p>A</p>",
            status: "available",
            is_locked: true,
            locked_at: timestamp,
            multi_choice_rule: "all_correct_only",
            scoring_method: "auto_match",
            fill_blank_answers: [],
            material_id: 2,
            material_public_id: "material-public-001",
            created_at: timestamp,
            updated_at: timestamp,
          },
        ],
        [],
        [],
        [{ question_id: 1, public_id: "knowledge-node-public-001" }],
        [{ question_id: 1, public_id: "tag-public-001" }],
        [
          {
            public_id: "material-public-001",
            title: "消费者调研材料",
            status: "available",
          },
        ],
        [
          {
            public_id: "knowledge-node-public-001",
            name: "抽样方法",
            path_name: "营销 / 调研 / 抽样方法",
            kn_status: "active",
          },
        ],
        [{ public_id: "tag-public-001", name: "高频" }],
        [{ total: 21, locking_count: 2 }],
        [
          {
            paper_public_id: "paper-public-002",
            name: "2026 营销理论卷",
            paper_status: "published",
            updated_at: timestamp,
          },
        ],
      ],
      capturedSelects,
    );
    const repository = createPostgresQuestionRepository({
      createDatabase: () => ({ select }) as never,
    });

    const detail = await repository.findQuestionDetailByPublicId(
      "question-public-001",
      { page: 2, pageSize: 20, sortBy: "updatedAt", sortOrder: "desc" },
    );

    expect(detail).toMatchObject({
      paper_reference_total: 21,
      locking_paper_count: 2,
      paper_references: [
        {
          paper_public_id: "paper-public-002",
          paper_status: "published",
        },
      ],
    });
    const totalQuery = capturedSelects.find((captured) =>
      Object.hasOwn(captured.selection ?? {}, "locking_count"),
    );
    const referenceQuery = capturedSelects.find((captured) =>
      Object.hasOwn(captured.selection ?? {}, "paper_public_id"),
    );
    expect(totalQuery).toBeDefined();
    expect(containsText(totalQuery?.selection, "distinct")).toBe(true);
    expect(containsText(totalQuery?.selection, "published")).toBe(true);
    expect(containsText(totalQuery?.selection, "archived")).toBe(true);
    expect(referenceQuery?.calls).toEqual(
      expect.arrayContaining(["groupBy", "orderBy", "limit", "offset"]),
    );
    expect(capturedSelects).toHaveLength(10);
  });
});
