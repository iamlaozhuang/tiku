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
        publicId: "training_question_public_a",
        sourceKind: "enterprise_training_snapshot",
        organizationPublicId: "organization_public_a",
        status: "published",
        profession: "marketing",
        level: 3,
        subject: "theory",
        questionType: "single_choice",
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
