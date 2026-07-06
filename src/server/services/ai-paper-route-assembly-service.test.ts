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
  difficultyGoal: "hard",
  sourcePreference: "prefer_enterprise",
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
      questionType: "judge",
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
});
