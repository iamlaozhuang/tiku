import { describe, expect, it } from "vitest";

import type {
  AiPaperAssemblyPlanDto,
  AiPaperPlanAndSelectInput,
  AiPaperSelectableQuestionDto,
} from "../contracts/ai-paper-plan-and-select-contract";
import {
  AI_PAPER_DEFAULT_TARGET_QUESTION_COUNT,
  AI_PAPER_MAX_TARGET_QUESTION_COUNT,
  assembleAiPaperFromPlan,
  validateAiPaperAssemblyPlan,
} from "./ai-paper-plan-and-select-service";

const basePlan: AiPaperAssemblyPlanDto = {
  title: "本地组卷计划",
  profession: "marketing",
  level: 3,
  subject: "theory",
  targetQuestionCount: 3,
  difficultyGoal: "medium",
  sourcePreference: "balanced",
  sections: [
    {
      sectionKey: "single-choice",
      title: "单选题",
      questionType: "single_choice",
      targetQuestionCount: 2,
      targetScore: 2,
      knowledgeNodePublicIds: ["knowledge_node_public_a"],
      parentKnowledgeNodePublicIds: ["knowledge_node_parent_public_a"],
      difficulty: "medium",
    },
    {
      sectionKey: "true-false",
      title: "判断题",
      questionType: "true_false",
      targetQuestionCount: 1,
      targetScore: 1,
      knowledgeNodePublicIds: ["knowledge_node_public_b"],
      parentKnowledgeNodePublicIds: ["knowledge_node_parent_public_b"],
      difficulty: "medium",
    },
  ],
  knowledgeCoverage: {
    targetKnowledgeNodePublicIds: [
      "knowledge_node_public_a",
      "knowledge_node_public_b",
    ],
    targetParentKnowledgeNodePublicIds: [
      "knowledge_node_parent_public_a",
      "knowledge_node_parent_public_b",
    ],
  },
};

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
    ancestorKnowledgeNodePublicIds: ["knowledge_node_parent_public_a"],
    ...override,
  };
}

function createInput(
  override: Partial<AiPaperPlanAndSelectInput>,
): AiPaperPlanAndSelectInput {
  return {
    role: "personal_advanced_student",
    organizationPublicId: null,
    plan: basePlan,
    platformQuestions: [],
    enterpriseQuestions: [],
    ...override,
  };
}

describe("AI组卷 plan-and-select 后端合同", () => {
  it("只接受组卷结构计划，不接受 Provider 直接输出完整题目草稿", () => {
    expect(AI_PAPER_DEFAULT_TARGET_QUESTION_COUNT).toBe(30);
    expect(AI_PAPER_MAX_TARGET_QUESTION_COUNT).toBe(80);

    expect(
      validateAiPaperAssemblyPlan({
        ...basePlan,
        targetQuestionCount: AI_PAPER_MAX_TARGET_QUESTION_COUNT + 1,
      }),
    ).toEqual({
      accepted: false,
      failureCategory: "target_count_out_of_range",
    });

    expect(
      validateAiPaperAssemblyPlan({
        ...basePlan,
        paperSections: [
          {
            title: "单选题",
            questions: [
              {
                questionStem: "redacted synthetic stem",
                standardAnswer: "redacted synthetic answer",
              },
            ],
          },
        ],
      }),
    ).toEqual({
      accepted: false,
      failureCategory: "provider_question_content_forbidden",
    });

    expect(
      validateAiPaperAssemblyPlan({
        ...basePlan,
        targetQuestionCount: 4,
      }),
    ).toEqual({
      accepted: false,
      failureCategory: "section_count_mismatch",
    });

    expect(validateAiPaperAssemblyPlan(basePlan)).toEqual({
      accepted: true,
      failureCategory: null,
    });
  });

  it("个人高级版只允许从授权平台正式题库选题，排除企业快照与 AI 草稿", () => {
    const result = assembleAiPaperFromPlan(
      createInput({
        platformQuestions: [
          createQuestion({ publicId: "platform_question_public_a" }),
          createQuestion({
            publicId: "ai_draft_question_public_a",
            sourceKind: "ai_generated_draft",
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
      }),
    );

    expect(result.container.selectedQuestionCount).toBe(1);
    expect(result.container.sourceComposition).toEqual({
      platformFormalQuestionCount: 1,
      enterpriseTrainingSnapshotCount: 0,
    });
    expect(result.container.sections[0]?.selectedQuestions).toEqual([
      {
        questionPublicId: "platform_question_public_a",
        sourceKind: "platform_formal_question",
        matchTier: "exact",
        score: 2,
      },
    ]);
    expect(JSON.stringify(result)).not.toContain("redacted synthetic stem");
    expect(JSON.stringify(result)).not.toContain("redacted synthetic answer");
  });

  it("内容后台只允许从平台正式题库选题", () => {
    const result = assembleAiPaperFromPlan(
      createInput({
        role: "content_admin",
        platformQuestions: [
          createQuestion({ publicId: "platform_question_public_a" }),
        ],
        enterpriseQuestions: [
          createQuestion({
            publicId: "enterprise_question_public_a",
            sourceKind: "enterprise_training_snapshot",
            organizationPublicId: "organization_public_a",
            status: "published",
          }),
        ],
      }),
    );

    expect(result.container.selectedQuestionCount).toBe(1);
    expect(result.container.sourceComposition).toEqual({
      platformFormalQuestionCount: 1,
      enterpriseTrainingSnapshotCount: 0,
    });
    expect(result.container.sections[0]?.selectedQuestions).toEqual([
      {
        questionPublicId: "platform_question_public_a",
        sourceKind: "platform_formal_question",
        matchTier: "exact",
        score: 2,
      },
    ]);
  });

  it("企业高级版员工和管理员可使用平台题库与本企业已发布训练快照", () => {
    const sharedQuestions = {
      platformQuestions: [
        createQuestion({ publicId: "platform_question_public_a" }),
      ],
      enterpriseQuestions: [
        createQuestion({
          publicId: "enterprise_question_public_a",
          sourceKind: "enterprise_training_snapshot",
          organizationPublicId: "organization_public_a",
          status: "published",
        }),
        createQuestion({
          publicId: "enterprise_question_public_other_org",
          sourceKind: "enterprise_training_snapshot",
          organizationPublicId: "organization_public_other",
          status: "published",
        }),
        createQuestion({
          publicId: "enterprise_question_public_taken_down",
          sourceKind: "enterprise_training_snapshot",
          organizationPublicId: "organization_public_a",
          status: "taken_down",
        }),
      ],
    };

    const employeeResult = assembleAiPaperFromPlan(
      createInput({
        role: "org_advanced_employee",
        organizationPublicId: "organization_public_a",
        ...sharedQuestions,
      }),
    );
    const adminResult = assembleAiPaperFromPlan(
      createInput({
        role: "org_advanced_admin",
        organizationPublicId: "organization_public_a",
        ...sharedQuestions,
      }),
    );

    for (const result of [employeeResult, adminResult]) {
      expect(result.container.selectedQuestionCount).toBe(2);
      expect(result.container.sourceComposition).toEqual({
        platformFormalQuestionCount: 1,
        enterpriseTrainingSnapshotCount: 1,
      });
      expect(
        result.container.sections[0]?.selectedQuestions.map(
          (question) => question.questionPublicId,
        ),
      ).toEqual(["platform_question_public_a", "enterprise_question_public_a"]);
    }
  });

  it("均衡使用在多大题间按全卷累计来源数量确定性平衡", () => {
    const knowledgeNodePublicIds = ["a", "b", "c", "d"].map(
      (suffix) => `knowledge_node_public_${suffix}`,
    );
    const sections = knowledgeNodePublicIds.map(
      (knowledgeNodePublicId, index) => ({
        ...basePlan.sections[0],
        sectionKey: `single-choice-${index + 1}`,
        title: `单选题 ${index + 1}`,
        targetQuestionCount: 1,
        knowledgeNodePublicIds: [knowledgeNodePublicId],
        parentKnowledgeNodePublicIds: [
          `knowledge_node_parent_public_${index + 1}`,
        ],
      }),
    );
    const createSourceQuestions = (
      sourceKind: "platform_formal_question" | "enterprise_training_snapshot",
    ) =>
      knowledgeNodePublicIds.map((knowledgeNodePublicId, index) =>
        createQuestion({
          publicId: `${sourceKind}_${index + 1}`,
          sourceKind,
          organizationPublicId:
            sourceKind === "enterprise_training_snapshot"
              ? "organization_public_a"
              : null,
          status:
            sourceKind === "enterprise_training_snapshot"
              ? "published"
              : "available",
          knowledgeNodePublicIds: [knowledgeNodePublicId],
          parentKnowledgeNodePublicIds: [
            `knowledge_node_parent_public_${index + 1}`,
          ],
        }),
      );

    const result = assembleAiPaperFromPlan(
      createInput({
        role: "org_advanced_employee",
        organizationPublicId: "organization_public_a",
        plan: {
          ...basePlan,
          targetQuestionCount: 4,
          sourcePreference: "balanced",
          sections,
        },
        platformQuestions: createSourceQuestions("platform_formal_question"),
        enterpriseQuestions: createSourceQuestions(
          "enterprise_training_snapshot",
        ),
      }),
    );

    expect(result.status).toBe("assembled");
    expect(result.container.sourceComposition).toEqual({
      platformFormalQuestionCount: 2,
      enterpriseTrainingSnapshotCount: 2,
    });
    expect(
      result.container.sections.map(
        (section) => section.selectedQuestions[0]?.sourceKind,
      ),
    ).toEqual([
      "platform_formal_question",
      "enterprise_training_snapshot",
      "platform_formal_question",
      "enterprise_training_snapshot",
    ]);
  });

  it.each([
    ["prefer_platform", "platform_formal_question"],
    ["prefer_enterprise", "enterprise_training_snapshot"],
  ] as const)("%s 优先取满首选题源", (sourcePreference, expectedSourceKind) => {
    const result = assembleAiPaperFromPlan(
      createInput({
        role: "org_advanced_admin",
        organizationPublicId: "organization_public_a",
        plan: {
          ...basePlan,
          targetQuestionCount: 2,
          sourcePreference,
          sections: [
            {
              ...basePlan.sections[0],
              targetQuestionCount: 2,
            },
          ],
        },
        platformQuestions: [
          createQuestion({ publicId: "platform_question_1" }),
          createQuestion({ publicId: "platform_question_2" }),
        ],
        enterpriseQuestions: [
          createQuestion({
            publicId: "enterprise_question_1",
            sourceKind: "enterprise_training_snapshot",
            organizationPublicId: "organization_public_a",
            status: "published",
          }),
          createQuestion({
            publicId: "enterprise_question_2",
            sourceKind: "enterprise_training_snapshot",
            organizationPublicId: "organization_public_a",
            status: "published",
          }),
        ],
      }),
    );

    expect(
      result.container.sections[0]?.selectedQuestions.map(
        (question) => question.sourceKind,
      ),
    ).toEqual([expectedSourceKind, expectedSourceKind]);
  });

  it("均衡使用对奇数确定性分配并在单侧不足时由另一侧补足", () => {
    const plan = {
      ...basePlan,
      targetQuestionCount: 3,
      sourcePreference: "balanced" as const,
      sections: [
        {
          ...basePlan.sections[0],
          targetQuestionCount: 3,
        },
      ],
    };
    const platformQuestions = [1, 2, 3].map((index) =>
      createQuestion({ publicId: `platform_question_${index}` }),
    );
    const enterpriseQuestions = [1, 2, 3].map((index) =>
      createQuestion({
        publicId: `enterprise_question_${index}`,
        sourceKind: "enterprise_training_snapshot",
        organizationPublicId: "organization_public_a",
        status: "published",
      }),
    );
    const balancedResult = assembleAiPaperFromPlan(
      createInput({
        role: "org_advanced_employee",
        organizationPublicId: "organization_public_a",
        plan,
        platformQuestions,
        enterpriseQuestions,
      }),
    );
    const fallbackResult = assembleAiPaperFromPlan(
      createInput({
        role: "org_advanced_employee",
        organizationPublicId: "organization_public_a",
        plan,
        platformQuestions: platformQuestions.slice(0, 1),
        enterpriseQuestions,
      }),
    );

    expect(balancedResult.container.sourceComposition).toEqual({
      platformFormalQuestionCount: 2,
      enterpriseTrainingSnapshotCount: 1,
    });
    expect(fallbackResult.status).toBe("assembled");
    expect(fallbackResult.container.sourceComposition).toEqual({
      platformFormalQuestionCount: 1,
      enterpriseTrainingSnapshotCount: 2,
    });
  });

  it("均衡使用仍先选更高匹配层级的题目", () => {
    const result = assembleAiPaperFromPlan(
      createInput({
        role: "org_advanced_employee",
        organizationPublicId: "organization_public_a",
        plan: {
          ...basePlan,
          targetQuestionCount: 2,
          sourcePreference: "balanced",
          sections: [
            {
              ...basePlan.sections[0],
              sectionKey: "platform-only-exact",
              targetQuestionCount: 1,
            },
            {
              ...basePlan.sections[0],
              sectionKey: "quality-before-balance",
              targetQuestionCount: 1,
              knowledgeNodePublicIds: ["knowledge_node_public_b"],
              parentKnowledgeNodePublicIds: ["knowledge_node_parent_public_b"],
            },
          ],
        },
        platformQuestions: [
          createQuestion({ publicId: "platform_question_a" }),
          createQuestion({
            publicId: "platform_question_b_exact",
            knowledgeNodePublicIds: ["knowledge_node_public_b"],
            parentKnowledgeNodePublicIds: ["knowledge_node_parent_public_b"],
          }),
        ],
        enterpriseQuestions: [
          createQuestion({
            publicId: "enterprise_question_b_nearby",
            sourceKind: "enterprise_training_snapshot",
            organizationPublicId: "organization_public_a",
            status: "published",
            difficulty: "hard",
            knowledgeNodePublicIds: ["knowledge_node_public_other"],
            parentKnowledgeNodePublicIds: ["knowledge_node_parent_public_b"],
          }),
        ],
      }),
    );

    expect(result.container.sections[1]?.selectedQuestions).toEqual([
      {
        questionPublicId: "platform_question_b_exact",
        sourceKind: "platform_formal_question",
        matchTier: "exact",
        score: 2,
      },
    ]);
  });

  it("按 exact -> descendant -> nearby knowledge -> same scope 降级选题，题源不足时不虚构题目", () => {
    const result = assembleAiPaperFromPlan(
      createInput({
        plan: {
          ...basePlan,
          targetQuestionCount: 5,
          sections: [
            {
              ...basePlan.sections[0],
              targetQuestionCount: 5,
            },
          ],
        },
        platformQuestions: [
          createQuestion({ publicId: "question_exact" }),
          createQuestion({
            publicId: "question_descendant",
            knowledgeNodePublicIds: ["knowledge_node_public_descendant"],
            parentKnowledgeNodePublicIds: ["knowledge_node_public_child"],
            ancestorKnowledgeNodePublicIds: [
              "knowledge_node_public_child",
              "knowledge_node_public_a",
            ],
          }),
          createQuestion({
            publicId: "question_nearby_knowledge",
            difficulty: "hard",
            knowledgeNodePublicIds: ["knowledge_node_public_other"],
            parentKnowledgeNodePublicIds: ["knowledge_node_parent_public_a"],
          }),
          createQuestion({
            publicId: "question_same_scope",
            difficulty: "hard",
            knowledgeNodePublicIds: ["knowledge_node_public_other"],
            parentKnowledgeNodePublicIds: [
              "knowledge_node_parent_public_other",
            ],
          }),
        ],
      }),
    );

    expect(result.status).toBe("insufficient");
    expect(result.container.matchQuality).toBe("insufficient");
    expect(
      result.container.sections[0]?.selectedQuestions.map(
        (question) => question.matchTier,
      ),
    ).toEqual(["exact", "descendant", "nearby_knowledge", "same_scope"]);
    expect(result.container.selectedQuestionCount).toBe(4);
    expect(result.container.sections[0]?.degradationSummary).toMatchObject({
      exactCount: 1,
      descendantCount: 1,
      nearbyKnowledgeCount: 1,
      sameScopeCount: 1,
    });
    expect(result.insufficiency).toEqual({
      requestedQuestionCount: 5,
      selectedQuestionCount: 4,
      missingQuestionCount: 1,
      failureCategory: "insufficient_formal_question_source",
    });
  });

  it("知识点范围为空时不把同题型同范围题目记为 exact 命中", () => {
    const result = assembleAiPaperFromPlan(
      createInput({
        plan: {
          ...basePlan,
          targetQuestionCount: 1,
          sections: [
            {
              ...basePlan.sections[0],
              targetQuestionCount: 1,
              knowledgeNodePublicIds: [],
              parentKnowledgeNodePublicIds: [],
            },
          ],
          knowledgeCoverage: {
            targetKnowledgeNodePublicIds: [],
            targetParentKnowledgeNodePublicIds: [],
          },
        },
        platformQuestions: [
          createQuestion({ publicId: "question_same_scope_only" }),
        ],
      }),
    );

    expect(result.status).toBe("assembled");
    expect(result.container.matchQuality).toBe("supplemented_from_same_scope");
    expect(result.container.sections[0]?.degradationSummary).toEqual({
      exactCount: 0,
      nearbyKnowledgeCount: 0,
      sameScopeCount: 1,
    });
    expect(result.container.sections[0]?.selectedQuestions).toEqual([
      {
        questionPublicId: "question_same_scope_only",
        sourceKind: "platform_formal_question",
        matchTier: "same_scope",
        score: 2,
      },
    ]);
  });

  it("legacy difficulty 缺失时即使知识元数据匹配也只能显式降级为 same scope", () => {
    const result = assembleAiPaperFromPlan(
      createInput({
        plan: {
          ...basePlan,
          targetQuestionCount: 1,
          sections: [
            {
              ...basePlan.sections[0],
              targetQuestionCount: 1,
            },
          ],
        },
        platformQuestions: [
          createQuestion({
            publicId: "question_legacy_difficulty_unavailable",
            difficulty: null,
          }),
        ],
      }),
    );

    expect(result.status).toBe("assembled");
    expect(result.container.matchQuality).toBe("supplemented_from_same_scope");
    expect(result.container.sections[0]?.selectedQuestions).toEqual([
      {
        questionPublicId: "question_legacy_difficulty_unavailable",
        sourceKind: "platform_formal_question",
        matchTier: "same_scope",
        score: 2,
      },
    ]);
  });
});
