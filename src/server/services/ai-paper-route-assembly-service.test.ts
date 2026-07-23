import { describe, expect, it } from "vitest";

import type { AiPaperSelectableQuestionDto } from "../contracts/ai-paper-plan-and-select-contract";
import type { AiGenerationRouteIntegratedGenerationParameters } from "../contracts/route-integrated-provider-execution-contract";
import { createRouteIntegratedVisibleGeneratedContent } from "./route-integrated-provider-execution-service";
import { assembleAiPaperFromRouteVisiblePlan } from "./ai-paper-route-assembly-service";

const generationParameters: AiGenerationRouteIntegratedGenerationParameters = {
  profession: "marketing",
  level: 3,
  subject: "theory",
  knowledgeNode: null,
  knowledgeNodeMode: "balanced",
  knowledgeNodePublicIds: [
    "knowledge_node_public_a",
    "knowledge_node_public_b",
  ],
  includeDescendants: false,
  knowledgeNodeSupplement: null,
  sourcePreference: null,
  questionType: null,
  questionCount: 3,
  difficulty: "medium",
  learningObjective: "redacted objective",
};

const routePlanContent = JSON.stringify({
  title: "自测组卷方案",
  profession: "logistics",
  level: 5,
  subject: "skill",
  targetQuestionCount: 3,
  difficultyGoal: "medium",
  sourcePreference: "prefer_enterprise",
  sections: [
    {
      sectionKey: "single-choice",
      title: "单选题",
      questionType: "single_choice",
      targetQuestionCount: 2,
      targetScore: 2,
      knowledgeNodePublicIds: ["knowledge_node_public_a"],
      parentKnowledgeNodePublicIds: [],
      difficulty: "medium",
    },
    {
      sectionKey: "true-false",
      title: "判断题",
      questionType: "judge",
      targetQuestionCount: 1,
      targetScore: 1,
      knowledgeNodePublicIds: ["knowledge_node_public_b"],
      parentKnowledgeNodePublicIds: [],
      difficulty: "medium",
    },
  ],
  knowledgeCoverage: {
    targetKnowledgeNodePublicIds: [
      "knowledge_node_public_a",
      "knowledge_node_public_b",
    ],
    targetParentKnowledgeNodePublicIds: [],
  },
});

function createQuestion(
  override: Partial<AiPaperSelectableQuestionDto>,
): AiPaperSelectableQuestionDto {
  return {
    publicId: "question_public_default",
    sourceKind: "platform_formal_question",
    organizationPublicId: null,
    status: "available",
    profession: "marketing",
    level: 3,
    subject: "theory",
    questionType: "single_choice",
    difficulty: "medium",
    knowledgeNodePublicIds: ["knowledge_node_public_a"],
    parentKnowledgeNodePublicIds: ["knowledge_node_parent_public_a"],
    ...override,
  };
}

function createParsedVisiblePlan() {
  return createRouteIntegratedVisibleGeneratedContent(routePlanContent, {
    structuredPreview: {
      kind: "paper_draft",
      requestedQuestionCount: 3,
    },
  });
}

describe("AI组卷 route-visible plan local assembly", () => {
  it("rejects explicit Provider difficulty and knowledge drift before selecting local questions", () => {
    const driftedPlan = createRouteIntegratedVisibleGeneratedContent(
      JSON.stringify({
        title: "越界组卷方案",
        targetQuestionCount: 1,
        difficultyGoal: "hard",
        sections: [
          {
            sectionKey: "single-choice",
            title: "单选题",
            questionType: "single_choice",
            targetQuestionCount: 1,
            targetScore: 2,
            difficulty: "hard",
            knowledgeNodePublicIds: ["knowledge_node_public_other"],
          },
        ],
        knowledgeCoverage: {
          targetKnowledgeNodePublicIds: ["knowledge_node_public_other"],
        },
      }),
      {
        structuredPreview: {
          kind: "paper_draft",
          requestedQuestionCount: 1,
        },
      },
    );
    const result = assembleAiPaperFromRouteVisiblePlan({
      role: "personal_advanced_student",
      organizationPublicId: null,
      generationParameters: {
        ...generationParameters,
        questionCount: 1,
        knowledgeNodeMode: "selected",
        knowledgeNodePublicIds: ["knowledge_node_public_allowed"],
      },
      visibleGeneratedContent: driftedPlan,
      platformQuestions: [
        createQuestion({
          publicId: "question_public_other",
          difficulty: "hard",
          knowledgeNodePublicIds: ["knowledge_node_public_other"],
        }),
      ],
      enterpriseQuestions: [],
    });

    expect(result).toEqual({
      status: "rejected",
      assembly: null,
      rejection: { failureCategory: "invalid_plan_shape" },
    });
  });

  it("inherits omitted Provider constraints from the server request without widening knowledge scope", () => {
    const visibleGeneratedContent =
      createRouteIntegratedVisibleGeneratedContent(
        JSON.stringify({
          title: "省略约束的组卷方案",
          targetQuestionCount: 1,
          sections: [
            {
              sectionKey: "single-choice",
              title: "单选题",
              questionType: "single_choice",
              targetQuestionCount: 1,
              targetScore: 2,
            },
          ],
        }),
        {
          structuredPreview: {
            kind: "paper_draft",
            requestedQuestionCount: 1,
          },
        },
      );

    const result = assembleAiPaperFromRouteVisiblePlan({
      role: "personal_advanced_student",
      organizationPublicId: null,
      generationParameters: {
        ...generationParameters,
        questionCount: 1,
        knowledgeNodeMode: "selected",
        knowledgeNodePublicIds: ["knowledge_node_public_allowed"],
      },
      visibleGeneratedContent,
      platformQuestions: [
        createQuestion({
          publicId: "question_public_allowed",
          knowledgeNodePublicIds: ["knowledge_node_public_allowed"],
        }),
      ],
      enterpriseQuestions: [],
    });

    expect(result.status).toBe("assembled");
    expect(result.assembly?.container.constraintLineage).toEqual({
      request: {
        difficulty: "medium",
        knowledgeNodePublicIds: ["knowledge_node_public_allowed"],
      },
      plan: {
        difficulty: "medium",
        knowledgeNodePublicIds: ["knowledge_node_public_allowed"],
        parentKnowledgeNodePublicIds: [],
      },
    });
  });

  it("keeps an explicit Provider knowledge subset as the section fallback and actual selection boundary", () => {
    const visibleGeneratedContent =
      createRouteIntegratedVisibleGeneratedContent(
        JSON.stringify({
          title: "知识点子集组卷方案",
          targetQuestionCount: 1,
          knowledgeCoverage: {
            targetKnowledgeNodePublicIds: ["knowledge_node_public_allowed"],
          },
          sections: [
            {
              sectionKey: "single-choice",
              title: "单选题",
              questionType: "single_choice",
              targetQuestionCount: 1,
              targetScore: 2,
            },
          ],
        }),
        {
          structuredPreview: {
            kind: "paper_draft",
            requestedQuestionCount: 1,
            generationParameters: {
              difficulty: "medium",
              knowledgeNodePublicIds: [
                "knowledge_node_public_allowed",
                "knowledge_node_public_second",
              ],
            },
          },
        },
      );

    const result = assembleAiPaperFromRouteVisiblePlan({
      role: "personal_advanced_student",
      organizationPublicId: null,
      generationParameters: {
        ...generationParameters,
        questionCount: 1,
        knowledgeNodeMode: "selected",
        knowledgeNodePublicIds: [
          "knowledge_node_public_allowed",
          "knowledge_node_public_second",
        ],
      },
      visibleGeneratedContent,
      platformQuestions: [
        createQuestion({
          publicId: "question_public_second",
          knowledgeNodePublicIds: ["knowledge_node_public_second"],
        }),
        createQuestion({
          publicId: "question_public_allowed",
          knowledgeNodePublicIds: ["knowledge_node_public_allowed"],
        }),
      ],
      enterpriseQuestions: [],
    });

    expect(result.status).toBe("assembled");
    expect(
      result.assembly?.container.sections[0]?.selectedQuestions[0]
        ?.questionPublicId,
    ).toBe("question_public_allowed");
    expect(result.assembly?.container.constraintLineage).toMatchObject({
      request: {
        knowledgeNodePublicIds: [
          "knowledge_node_public_allowed",
          "knowledge_node_public_second",
        ],
      },
      plan: {
        knowledgeNodePublicIds: ["knowledge_node_public_allowed"],
      },
    });
  });

  it("rejects a section that escapes an explicit Provider plan subset even when it remains inside the request", () => {
    const visibleGeneratedContent =
      createRouteIntegratedVisibleGeneratedContent(
        JSON.stringify({
          title: "分区越出计划子集",
          targetQuestionCount: 1,
          knowledgeCoverage: {
            targetKnowledgeNodePublicIds: ["knowledge_node_public_allowed"],
          },
          sections: [
            {
              sectionKey: "single-choice",
              title: "单选题",
              questionType: "single_choice",
              targetQuestionCount: 1,
              targetScore: 2,
              knowledgeNodePublicIds: ["knowledge_node_public_second"],
            },
          ],
        }),
        {
          structuredPreview: {
            kind: "paper_draft",
            requestedQuestionCount: 1,
          },
        },
      );

    const result = assembleAiPaperFromRouteVisiblePlan({
      role: "personal_advanced_student",
      organizationPublicId: null,
      generationParameters: {
        ...generationParameters,
        questionCount: 1,
        knowledgeNodeMode: "selected",
        knowledgeNodePublicIds: [
          "knowledge_node_public_allowed",
          "knowledge_node_public_second",
        ],
      },
      visibleGeneratedContent,
      platformQuestions: [],
      enterpriseQuestions: [],
    });

    expect(result).toEqual({
      status: "rejected",
      assembly: null,
      rejection: { failureCategory: "invalid_plan_shape" },
    });
  });

  it("uses route generation parameters as scope truth and assembles personal paper from platform formal sources", () => {
    const result = assembleAiPaperFromRouteVisiblePlan({
      role: "personal_advanced_student",
      organizationPublicId: null,
      generationParameters,
      visibleGeneratedContent: createParsedVisiblePlan(),
      platformQuestions: [
        createQuestion({ publicId: "platform_question_public_a" }),
        createQuestion({ publicId: "platform_question_public_b" }),
        createQuestion({
          publicId: "platform_question_public_c",
          questionType: "true_false",
          knowledgeNodePublicIds: ["knowledge_node_public_b"],
          parentKnowledgeNodePublicIds: ["knowledge_node_parent_public_b"],
        }),
      ],
      enterpriseQuestions: [
        createQuestion({
          publicId: "enterprise_question_public_a",
          sourceKind: "enterprise_training_snapshot",
          organizationPublicId: "organization_public_a",
          status: "published",
        }),
      ],
    });

    expect(result.status).toBe("assembled");
    expect(result.rejection).toBeNull();
    expect(result.assembly?.container).toMatchObject({
      title: "自测组卷方案",
      profession: "marketing",
      level: 3,
      subject: "theory",
      requestedQuestionCount: 3,
      selectedQuestionCount: 3,
      sourceComposition: {
        platformFormalQuestionCount: 3,
        enterpriseTrainingSnapshotCount: 0,
      },
    });
  });

  it("assembles organization paper with same-organization enterprise snapshots when the plan prefers enterprise sources", () => {
    const result = assembleAiPaperFromRouteVisiblePlan({
      role: "org_advanced_admin",
      organizationPublicId: "organization_public_a",
      generationParameters,
      visibleGeneratedContent: createParsedVisiblePlan(),
      platformQuestions: [
        createQuestion({ publicId: "platform_question_public_a" }),
        createQuestion({
          publicId: "platform_question_public_b",
          questionType: "true_false",
          knowledgeNodePublicIds: ["knowledge_node_public_b"],
          parentKnowledgeNodePublicIds: ["knowledge_node_parent_public_b"],
        }),
      ],
      enterpriseQuestions: [
        createQuestion({
          publicId: "enterprise_question_public_a",
          sourceKind: "enterprise_training_snapshot",
          organizationPublicId: "organization_public_a",
          status: "published",
        }),
        createQuestion({
          publicId: "enterprise_question_public_b",
          sourceKind: "enterprise_training_snapshot",
          organizationPublicId: "organization_public_a",
          status: "published",
        }),
        createQuestion({
          publicId: "enterprise_question_public_other",
          sourceKind: "enterprise_training_snapshot",
          organizationPublicId: "organization_public_other",
          status: "published",
        }),
      ],
    });

    expect(result.status).toBe("assembled");
    expect(
      result.assembly?.container.sections[0]?.selectedQuestions.map(
        (question) => question.questionPublicId,
      ),
    ).toEqual(["enterprise_question_public_a", "enterprise_question_public_b"]);
    expect(result.assembly?.container.sourceComposition).toEqual({
      platformFormalQuestionCount: 1,
      enterpriseTrainingSnapshotCount: 2,
    });
  });

  it("falls back to submitted source preference when the route plan omits it", () => {
    const visiblePlanWithoutSourcePreference =
      createRouteIntegratedVisibleGeneratedContent(
        JSON.stringify({
          title: "自测组卷方案",
          targetQuestionCount: 2,
          sections: [
            {
              sectionKey: "single-choice",
              title: "单选题",
              questionType: "single_choice",
              targetQuestionCount: 2,
              targetScore: 2,
              knowledgeNodePublicIds: ["knowledge_node_public_a"],
            },
          ],
          knowledgeCoverage: {
            targetKnowledgeNodePublicIds: ["knowledge_node_public_a"],
          },
        }),
        {
          structuredPreview: {
            kind: "paper_draft",
            requestedQuestionCount: 2,
          },
        },
      );

    const result = assembleAiPaperFromRouteVisiblePlan({
      role: "org_advanced_admin",
      organizationPublicId: "organization_public_a",
      generationParameters: {
        ...generationParameters,
        questionCount: 2,
        sourcePreference: "prefer_enterprise",
      },
      visibleGeneratedContent: visiblePlanWithoutSourcePreference,
      platformQuestions: [
        createQuestion({ publicId: "platform_question_public_a" }),
        createQuestion({ publicId: "platform_question_public_b" }),
      ],
      enterpriseQuestions: [
        createQuestion({
          publicId: "enterprise_question_public_a",
          sourceKind: "enterprise_training_snapshot",
          organizationPublicId: "organization_public_a",
          status: "published",
        }),
        createQuestion({
          publicId: "enterprise_question_public_b",
          sourceKind: "enterprise_training_snapshot",
          organizationPublicId: "organization_public_a",
          status: "published",
        }),
      ],
    });

    expect(result.status).toBe("assembled");
    expect(
      result.assembly?.container.sections[0]?.selectedQuestions.map(
        (question) => question.questionPublicId,
      ),
    ).toEqual(["enterprise_question_public_a", "enterprise_question_public_b"]);
  });

  it("rejects failed structured preview or nested Provider question content before local selection", () => {
    const forbiddenVisibleContent =
      createRouteIntegratedVisibleGeneratedContent(
        JSON.stringify({
          targetQuestionCount: 1,
          sections: [
            {
              questionType: "single_choice",
              questionCount: 1,
              questions: [
                { questionStem: "redacted synthetic forbidden stem" },
              ],
            },
          ],
        }),
        {
          structuredPreview: {
            kind: "paper_draft",
            requestedQuestionCount: 1,
          },
        },
      );

    expect(
      assembleAiPaperFromRouteVisiblePlan({
        role: "content_admin",
        organizationPublicId: null,
        generationParameters,
        visibleGeneratedContent: forbiddenVisibleContent,
        platformQuestions: [createQuestion({ publicId: "unused_question" })],
        enterpriseQuestions: [],
      }),
    ).toEqual({
      status: "rejected",
      assembly: null,
      rejection: {
        failureCategory: "provider_question_content_forbidden",
      },
    });
  });

  it("rejects route plans whose sections do not match the requested question type distribution", () => {
    const invalidVisiblePlan = createRouteIntegratedVisibleGeneratedContent(
      JSON.stringify({
        title: "自测组卷方案",
        targetQuestionCount: 30,
        sourcePreference: "prefer_platform",
        questionTypeDistribution: "balanced_40_30_30",
        paperStructure: "by_question_type",
        sections: [
          {
            sectionKey: "single-choice",
            title: "单选题",
            questionType: "single_choice",
            targetQuestionCount: 30,
            targetScore: 2,
            knowledgeNodePublicIds: ["knowledge_node_public_a"],
          },
        ],
        knowledgeCoverage: {
          targetKnowledgeNodePublicIds: ["knowledge_node_public_a"],
        },
      }),
      {
        structuredPreview: {
          kind: "paper_draft",
          requestedQuestionCount: 30,
        },
      },
    );

    expect(
      assembleAiPaperFromRouteVisiblePlan({
        role: "org_advanced_admin",
        organizationPublicId: "organization_public_a",
        generationParameters: {
          ...generationParameters,
          questionCount: 30,
          sourcePreference: "prefer_platform",
          questionTypeDistribution: "balanced_40_30_30",
          paperStructure: "by_question_type",
        },
        visibleGeneratedContent: invalidVisiblePlan,
        platformQuestions: [
          createQuestion({ publicId: "platform_question_public_a" }),
        ],
        enterpriseQuestions: [],
      }),
    ).toEqual({
      status: "rejected",
      assembly: null,
      rejection: {
        failureCategory: "invalid_plan_shape",
      },
    });
  });

  it("rejects route plans whose sections do not match the requested paper structure", () => {
    const invalidVisiblePlan = createRouteIntegratedVisibleGeneratedContent(
      JSON.stringify({
        title: "知识点组卷方案",
        targetQuestionCount: 2,
        sourcePreference: "prefer_platform",
        questionTypeDistribution: "weak_point_priority",
        paperStructure: "by_knowledge_node",
        sections: [
          {
            sectionKey: "single-choice",
            title: "单选题",
            questionType: "single_choice",
            targetQuestionCount: 2,
            targetScore: 2,
          },
        ],
      }),
      {
        structuredPreview: {
          kind: "paper_draft",
          requestedQuestionCount: 2,
        },
      },
    );

    expect(
      assembleAiPaperFromRouteVisiblePlan({
        role: "personal_advanced_student",
        organizationPublicId: null,
        generationParameters: {
          ...generationParameters,
          questionCount: 2,
          sourcePreference: "prefer_platform",
          questionTypeDistribution: "weak_point_priority",
          paperStructure: "by_knowledge_node",
        },
        visibleGeneratedContent: invalidVisiblePlan,
        platformQuestions: [
          createQuestion({ publicId: "platform_question_public_a" }),
          createQuestion({ publicId: "platform_question_public_b" }),
        ],
        enterpriseQuestions: [],
      }),
    ).toEqual({
      status: "rejected",
      assembly: null,
      rejection: {
        failureCategory: "invalid_plan_shape",
      },
    });
  });

  it("returns insufficiency when eligible formal sources cannot satisfy the parsed plan", () => {
    const result = assembleAiPaperFromRouteVisiblePlan({
      role: "content_admin",
      organizationPublicId: null,
      generationParameters,
      visibleGeneratedContent: createParsedVisiblePlan(),
      platformQuestions: [createQuestion({ publicId: "platform_question_a" })],
      enterpriseQuestions: [],
    });

    expect(result.status).toBe("insufficient");
    expect(result.rejection).toBeNull();
    expect(result.assembly?.insufficiency).toEqual({
      requestedQuestionCount: 3,
      selectedQuestionCount: 1,
      missingQuestionCount: 2,
      failureCategory: "insufficient_formal_question_source",
    });
  });

  it("uses submitted knowledge scope when the route plan omits section public ids", () => {
    const scopedGenerationParameters = {
      ...generationParameters,
      knowledgeNode: "synthetic selected node",
      knowledgeNodeMode: "selected" as const,
      knowledgeNodePublicIds: ["knowledge_node_public_selected"],
      includeDescendants: true,
      knowledgeNodeSupplement: "synthetic selected node",
    };
    const visiblePlanWithoutPublicIds =
      createRouteIntegratedVisibleGeneratedContent(
        JSON.stringify({
          title: "知识点组卷方案",
          targetQuestionCount: 1,
          difficultyGoal: "medium",
          sections: [
            {
              sectionKey: "single-choice",
              title: "单选题",
              questionType: "single_choice",
              targetQuestionCount: 1,
              targetScore: 2,
              difficulty: "medium",
            },
          ],
        }),
        {
          structuredPreview: {
            kind: "paper_draft",
            requestedQuestionCount: 1,
          },
        },
      );
    const result = assembleAiPaperFromRouteVisiblePlan({
      role: "personal_advanced_student",
      organizationPublicId: null,
      generationParameters: scopedGenerationParameters,
      visibleGeneratedContent: visiblePlanWithoutPublicIds,
      platformQuestions: [
        createQuestion({
          publicId: "platform_question_other_scope",
          knowledgeNodePublicIds: ["knowledge_node_public_other"],
        }),
        createQuestion({
          publicId: "platform_question_selected_scope",
          knowledgeNodePublicIds: ["knowledge_node_public_selected"],
        }),
      ],
      enterpriseQuestions: [],
    });

    expect(result.status).toBe("assembled");
    expect(result.assembly?.container.matchQuality).toBe("fully_matched");
    expect(
      result.assembly?.container.sections[0]?.selectedQuestions,
    ).toMatchObject([
      {
        questionPublicId: "platform_question_selected_scope",
        sourceKind: "platform_formal_question",
        matchTier: "exact",
        score: 2,
      },
    ]);
    expect(result.assembly?.container.constraintLineage).toEqual({
      request: {
        difficulty: "medium",
        knowledgeNodePublicIds: ["knowledge_node_public_selected"],
      },
      plan: {
        difficulty: "medium",
        knowledgeNodePublicIds: ["knowledge_node_public_selected"],
        parentKnowledgeNodePublicIds: [],
      },
    });
    expect(
      result.assembly?.container.sections[0]?.selectedQuestions[0]
        ?.constraintMatchBasis,
    ).toEqual({
      difficulty: "medium",
      knowledgeNodePublicIds: ["knowledge_node_public_selected"],
      parentKnowledgeNodePublicIds: ["knowledge_node_parent_public_a"],
      ancestorKnowledgeNodePublicIds: [],
      matchTier: "exact",
    });
  });
});
