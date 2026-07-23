import { describe, expect, it } from "vitest";

import type { OrganizationTrainingPublishedVersionDto } from "../contracts/organization-training-contract";
import type { QuestionAccessRow } from "../repositories/question-repository";
import {
  mapOrganizationTrainingVersionsToAiPaperEnterpriseQuestions,
  mapPlatformQuestionRowsToAiPaperQuestions,
} from "./ai-paper-source-adapter-service";

function createQuestionRow(
  override: Partial<QuestionAccessRow> = {},
): QuestionAccessRow {
  return {
    id: 101,
    public_id: "question_public_available",
    question_type: "single_choice",
    profession: "marketing",
    level: 3,
    subject: "theory",
    stem_rich_text: "SENSITIVE_STEM_MARKER",
    analysis_rich_text: "SENSITIVE_ANALYSIS_MARKER",
    standard_answer_rich_text: "SENSITIVE_ANSWER_MARKER",
    status: "available",
    is_locked: false,
    locked_at: null,
    multi_choice_rule: "all_correct_only",
    scoring_method: "auto_match",
    fill_blank_answers: [],
    material_id: null,
    material_public_id: null,
    question_options: [
      {
        id: 201,
        question_id: 101,
        label: "A",
        content_rich_text: "SENSITIVE_OPTION_MARKER",
        is_correct: true,
        sort_order: 1,
        created_at: new Date("2026-07-06T00:00:00.000Z"),
        updated_at: new Date("2026-07-06T00:00:00.000Z"),
      },
    ],
    scoring_points: [
      {
        id: 301,
        question_id: 101,
        description: "SENSITIVE_SCORING_POINT_MARKER",
        score: "1",
        sort_order: 1,
        created_at: new Date("2026-07-06T00:00:00.000Z"),
        updated_at: new Date("2026-07-06T00:00:00.000Z"),
      },
    ],
    difficulty: "medium",
    knowledge_node_public_ids: ["knowledge_node_public_child"],
    parent_knowledge_node_public_ids: ["knowledge_node_public_parent"],
    ancestor_knowledge_node_public_ids: [
      "knowledge_node_public_parent",
      "knowledge_node_public_root",
    ],
    tag_public_ids: ["tag_public_a"],
    created_at: new Date("2026-07-06T00:00:00.000Z"),
    updated_at: new Date("2026-07-06T00:00:00.000Z"),
    ...override,
  };
}

function createTrainingVersion(
  override: Partial<OrganizationTrainingPublishedVersionDto> = {},
): OrganizationTrainingPublishedVersionDto {
  return {
    publicId: "training_version_public_a",
    draftPublicId: "training_draft_public_a",
    versionNumber: 1,
    organizationPublicId: "organization_public_a",
    publishScopeSnapshot: {
      organizationPublicIds: ["organization_public_a"],
      capturedAt: "2026-07-06T00:00:00.000Z",
    },
    profession: "marketing",
    level: 3,
    subject: "theory",
    title: "SENSITIVE_TRAINING_TITLE_MARKER",
    description: "SENSITIVE_TRAINING_DESCRIPTION_MARKER",
    questionCount: 2,
    totalScore: 2,
    status: "published",
    publishedAt: "2026-07-06T00:00:00.000Z",
    takenDownAt: null,
    takedownReason: null,
    questions: [
      {
        publicId: "training_question_public_a",
        sequenceNumber: 1,
        questionType: "single_choice",
        materialTitle: "SENSITIVE_MATERIAL_TITLE_MARKER",
        materialContent: "SENSITIVE_MATERIAL_CONTENT_MARKER",
        stem: "SENSITIVE_TRAINING_STEM_MARKER",
        options: [
          {
            publicId: "training_option_public_a",
            label: "A",
            content: "SENSITIVE_TRAINING_OPTION_MARKER",
          },
        ],
        score: 1,
        difficulty: "hard",
        knowledgeNodePublicIds: ["knowledge_node_training_child"],
        parentKnowledgeNodePublicIds: ["knowledge_node_training_parent"],
        ancestorKnowledgeNodePublicIds: [
          "knowledge_node_training_parent",
          "knowledge_node_training_root",
        ],
      },
      {
        publicId: "training_question_public_b",
        sequenceNumber: 2,
        questionType: "true_false",
        materialTitle: null,
        materialContent: null,
        stem: "SENSITIVE_TRAINING_STEM_MARKER_B",
        options: [],
        score: 1,
      },
    ],
    ...override,
  };
}

describe("AI组卷题源 adapter", () => {
  it("把共享可用材料的平台正式题确定性映射为完整材料题组并冻结材料快照", () => {
    const rows = ["a", "b"].map((suffix) =>
      Object.assign(
        createQuestionRow({
          public_id: `question_public_${suffix}`,
          material_id: 901,
          material_public_id: "material_public_a",
          material_question_count: 2,
        }),
        {
          material_status: "available" as const,
          material_title: "客户异议材料",
          material_content_rich_text: "材料不可变正文",
        },
      ),
    );

    const result = mapPlatformQuestionRowsToAiPaperQuestions({
      questionRows: rows,
    });
    const groupPublicIds = result.map(
      (question) =>
        (question as typeof question & { questionGroup: { publicId: string } })
          .questionGroup.publicId,
    );

    expect(new Set(groupPublicIds).size).toBe(1);
    expect(groupPublicIds[0]).toMatch(/^qgroup_[0-9a-f]{32}$/u);
    expect(result).toEqual([
      expect.objectContaining({
        publicId: "question_public_a",
        questionGroup: expect.objectContaining({
          title: "客户异议材料",
          materialSnapshot: {
            materialPublicId: "material_public_a",
            title: "客户异议材料",
            contentRichText: "材料不可变正文",
          },
          memberQuestionPublicIds: ["question_public_a", "question_public_b"],
          questionSortOrder: 1,
        }),
      }),
      expect.objectContaining({
        publicId: "question_public_b",
        questionGroup: expect.objectContaining({
          memberQuestionPublicIds: ["question_public_a", "question_public_b"],
          questionSortOrder: 2,
        }),
      }),
    ]);
  });

  it("题源查询仅返回材料部分子题时拒绝伪造完整题组", () => {
    const partialRow = Object.assign(
      createQuestionRow({
        public_id: "question_partial_material_a",
        material_id: 903,
        material_public_id: "material_partial",
        material_question_count: 2,
      }),
      {
        material_status: "available" as const,
        material_title: "部分材料",
        material_content_rich_text: "部分材料正文",
      },
    );

    expect(
      mapPlatformQuestionRowsToAiPaperQuestions({
        questionRows: [partialRow],
      }),
    ).toEqual([]);
  });

  it("材料缺字段或已停用时不把其子题降级为独立题", () => {
    const disabled = Object.assign(
      createQuestionRow({
        public_id: "question_disabled_material",
        material_id: 901,
        material_public_id: "material_disabled",
      }),
      {
        material_status: "disabled" as const,
        material_title: "停用材料",
        material_content_rich_text: "停用正文",
      },
    );
    const incomplete = createQuestionRow({
      public_id: "question_incomplete_material",
      material_id: 902,
      material_public_id: "material_incomplete",
    });

    expect(
      mapPlatformQuestionRowsToAiPaperQuestions({
        questionRows: [disabled, incomplete],
      }),
    ).toEqual([]);
  });

  it("只接受题组身份、材料快照和连续成员顺序完整的企业训练快照", () => {
    const result = mapOrganizationTrainingVersionsToAiPaperEnterpriseQuestions({
      organizationPublicId: "organization_public_a",
      trainingVersions: [
        createTrainingVersion({
          questions: [
            {
              ...createTrainingVersion().questions![0]!,
              publicId: "training_group_question_a",
              sequenceNumber: 1,
              questionGroupPublicId: "qgroup_training_a",
              questionGroupTitle: "企业材料题组",
              questionGroupQuestionSortOrder: 1,
              questionGroupQuestionCount: 2,
            },
            {
              ...createTrainingVersion().questions![0]!,
              publicId: "training_group_question_b",
              sequenceNumber: 2,
              questionGroupPublicId: "qgroup_training_a",
              questionGroupTitle: "企业材料题组",
              questionGroupQuestionSortOrder: 2,
              questionGroupQuestionCount: 2,
            },
          ],
        }),
      ],
    });

    expect(result).toHaveLength(2);
    expect(result[0]).toMatchObject({
      publicId: "training_group_question_a",
      questionGroup: {
        publicId: "qgroup_training_a",
        title: "企业材料题组",
        materialSnapshot: {
          materialPublicId: null,
          title: "SENSITIVE_MATERIAL_TITLE_MARKER",
          contentRichText: "SENSITIVE_MATERIAL_CONTENT_MARKER",
        },
        memberQuestionPublicIds: [
          "training_group_question_a",
          "training_group_question_b",
        ],
        questionSortOrder: 1,
      },
    });

    const malformed = createTrainingVersion({
      questions: [
        {
          ...createTrainingVersion().questions![0]!,
          questionGroupPublicId: "qgroup_incomplete",
          questionGroupTitle: "不完整题组",
          questionGroupQuestionSortOrder: 1,
          questionGroupQuestionCount: 2,
        },
      ],
    });
    expect(
      mapOrganizationTrainingVersionsToAiPaperEnterpriseQuestions({
        organizationPublicId: "organization_public_a",
        trainingVersions: [malformed],
      }),
    ).toEqual([]);

    const partialIdentityWithoutMaterial = createTrainingVersion({
      questions: [
        {
          ...createTrainingVersion().questions![1]!,
          questionGroupPublicId: "qgroup_partial_identity",
        },
      ],
    });
    expect(
      mapOrganizationTrainingVersionsToAiPaperEnterpriseQuestions({
        organizationPublicId: "organization_public_a",
        trainingVersions: [partialIdentityWithoutMaterial],
      }),
    ).toEqual([]);
  });

  it("maps only available platform question rows into redacted selectable candidates", () => {
    const result = mapPlatformQuestionRowsToAiPaperQuestions({
      questionRows: [
        createQuestionRow(),
        createQuestionRow({
          public_id: "question_public_disabled",
          status: "disabled",
        }),
      ],
    });
    const serializedResult = JSON.stringify(result);

    expect(result).toEqual([
      {
        publicId: "question_public_available",
        sourceKind: "platform_formal_question",
        organizationPublicId: null,
        status: "available",
        profession: "marketing",
        level: 3,
        subject: "theory",
        questionType: "single_choice",
        difficulty: "medium",
        knowledgeNodePublicIds: ["knowledge_node_public_child"],
        parentKnowledgeNodePublicIds: ["knowledge_node_public_parent"],
        ancestorKnowledgeNodePublicIds: [
          "knowledge_node_public_parent",
          "knowledge_node_public_root",
        ],
      },
    ]);
    expect(serializedResult).not.toContain('"id"');
    expect(serializedResult).not.toContain("SENSITIVE_STEM_MARKER");
    expect(serializedResult).not.toContain("SENSITIVE_ANALYSIS_MARKER");
    expect(serializedResult).not.toContain("SENSITIVE_ANSWER_MARKER");
    expect(serializedResult).not.toContain("SENSITIVE_OPTION_MARKER");
    expect(serializedResult).not.toContain("SENSITIVE_SCORING_POINT_MARKER");
  });

  it("maps same-organization published training snapshots into redacted enterprise candidates", () => {
    const result = mapOrganizationTrainingVersionsToAiPaperEnterpriseQuestions({
      organizationPublicId: "organization_public_a",
      trainingVersions: [
        createTrainingVersion(),
        createTrainingVersion({
          publicId: "training_version_public_other_org",
          organizationPublicId: "organization_public_other",
        }),
        createTrainingVersion({
          publicId: "training_version_public_taken_down",
          status: "taken_down",
          takenDownAt: "2026-07-06T01:00:00.000Z",
        }),
      ],
    });
    const serializedResult = JSON.stringify(result);

    expect(result).toEqual([
      {
        publicId: "training_question_public_b",
        sourceKind: "enterprise_training_snapshot",
        organizationPublicId: "organization_public_a",
        status: "published",
        profession: "marketing",
        level: 3,
        subject: "theory",
        questionType: "true_false",
        difficulty: null,
        knowledgeNodePublicIds: [],
        parentKnowledgeNodePublicIds: [],
        ancestorKnowledgeNodePublicIds: [],
      },
    ]);
    expect(
      result.some(
        (question) => question.publicId === "training_question_public_a",
      ),
    ).toBe(false);
    expect(serializedResult).not.toContain("SENSITIVE_TRAINING_TITLE_MARKER");
    expect(serializedResult).not.toContain(
      "SENSITIVE_TRAINING_DESCRIPTION_MARKER",
    );
    expect(serializedResult).not.toContain("SENSITIVE_MATERIAL_TITLE_MARKER");
    expect(serializedResult).not.toContain("SENSITIVE_MATERIAL_CONTENT_MARKER");
    expect(serializedResult).not.toContain("SENSITIVE_TRAINING_STEM_MARKER");
    expect(serializedResult).not.toContain("SENSITIVE_TRAINING_OPTION_MARKER");
  });

  it("skips enterprise snapshot question types outside the v1 training bank subset", () => {
    const version = createTrainingVersion({
      questions: [
        {
          publicId: "training_question_public_case",
          sequenceNumber: 1,
          questionType: "case_analysis" as never,
          materialTitle: null,
          materialContent: null,
          stem: "SENSITIVE_UNSUPPORTED_STEM_MARKER",
          options: [],
          score: 1,
        },
      ],
    });

    expect(
      mapOrganizationTrainingVersionsToAiPaperEnterpriseQuestions({
        organizationPublicId: "organization_public_a",
        trainingVersions: [version],
      }),
    ).toEqual([]);
  });
});
