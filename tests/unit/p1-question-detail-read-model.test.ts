import { describe, expect, it } from "vitest";

import { mapQuestionDetailResultToApi } from "@/server/mappers/question-mapper";
import type { QuestionDetailAccessRow } from "@/server/repositories/question-repository";
import { normalizeQuestionDetailInput } from "@/server/validators/question";

const createdAt = new Date("2026-07-22T08:00:00.000Z");

function createQuestionDetailRow(): QuestionDetailAccessRow {
  return {
    id: 101,
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
    locked_at: createdAt,
    multi_choice_rule: "all_correct_only",
    scoring_method: "auto_match",
    fill_blank_answers: [],
    material_id: 201,
    material_public_id: "material-public-001",
    question_options: [],
    scoring_points: [],
    knowledge_node_public_ids: ["knowledge-node-public-001"],
    tag_public_ids: ["tag-public-001"],
    created_at: createdAt,
    updated_at: createdAt,
    material_detail: {
      public_id: "material-public-001",
      title: "消费者调研材料",
      status: "available",
    },
    knowledge_nodes: [
      {
        public_id: "knowledge-node-public-001",
        name: "抽样方法",
        path_name: "营销 / 调研 / 抽样方法",
        kn_status: "active",
      },
    ],
    tags: [{ public_id: "tag-public-001", name: "高频" }],
    paper_references: [
      {
        paper_public_id: "paper-public-002",
        name: "2026 营销理论卷",
        paper_status: "published",
        updated_at: createdAt,
      },
    ],
    paper_reference_total: 21,
    locking_paper_count: 2,
  };
}

describe("F-0073 question detail read model", () => {
  it("normalizes the paper-reference page independently from list filters", () => {
    expect(normalizeQuestionDetailInput({ page: "2", pageSize: "50" })).toEqual(
      {
        page: 2,
        pageSize: 50,
        sortBy: "updatedAt",
        sortOrder: "desc",
      },
    );
    expect(normalizeQuestionDetailInput({ pageSize: "37" }).pageSize).toBe(20);
    expect(
      normalizeQuestionDetailInput({ page: String(Number.MAX_VALUE) }).page,
    ).toBe(1);
  });

  it("maps readable bindings, stable public paper references, and the lock reason without internal ids", () => {
    const response = mapQuestionDetailResultToApi(createQuestionDetailRow(), {
      page: 2,
      pageSize: 20,
      sortBy: "updatedAt",
      sortOrder: "desc",
    });

    expect(response.question).toMatchObject({
      publicId: "question-public-001",
      material: {
        publicId: "material-public-001",
        title: "消费者调研材料",
        status: "available",
      },
      knowledgeNodes: [
        {
          publicId: "knowledge-node-public-001",
          name: "抽样方法",
          pathName: "营销 / 调研 / 抽样方法",
          knStatus: "active",
        },
      ],
      tags: [{ publicId: "tag-public-001", name: "高频" }],
      lockReason: { code: "paper_published", paperCount: 2 },
      paperReferences: {
        items: [
          {
            paperPublicId: "paper-public-002",
            name: "2026 营销理论卷",
            paperStatus: "published",
          },
        ],
        pagination: {
          page: 2,
          pageSize: 20,
          total: 21,
          sortBy: "updatedAt",
          sortOrder: "desc",
        },
      },
    });

    const serialized = JSON.stringify(response);
    expect(serialized).not.toContain('"id"');
    expect(serialized).not.toContain("material_id");
    expect(serialized).not.toContain("question_id");
  });
});
