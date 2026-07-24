import { describe, expect, it } from "vitest";

import type { AiPaperPlanAndSelectContainerDto } from "../contracts/ai-paper-plan-and-select-contract";
import type { PersonalAiGenerationPaperQuestionSourceDto } from "../contracts/personal-ai-generation-result-persistence-contract";
import {
  createPersonalAiGenerationPrivatePaperQuestionSnapshot,
  normalizePersonalAiGenerationPrivatePaperQuestionSnapshot,
} from "../validators/personal-ai-generation-result-persistence";
import { mapPrivatePaperQuestionSnapshotToLearningSourceQuestions } from "./personal-ai-generation-learning-session-paper-source-resolver";

function createPaperAssemblyContainer(): AiPaperPlanAndSelectContainerDto {
  const questionGroup = {
    publicId: "question_group_snapshot_162",
    title: "不可变材料题组",
    materialSnapshot: {
      materialPublicId: "material_snapshot_162",
      title: "不可变材料",
      contentRichText: "不可变材料正文",
    },
    memberQuestionPublicIds: ["enterprise_question_snapshot_162"],
  };

  return {
    title: "不可变学习试卷",
    profession: "marketing",
    level: 3,
    subject: "theory",
    requestedQuestionCount: 2,
    selectedQuestionCount: 2,
    sourceComposition: {
      platformFormalQuestionCount: 1,
      enterpriseTrainingSnapshotCount: 1,
    },
    matchQuality: "fully_matched",
    constraintLineage: {
      request: { difficulty: "medium", knowledgeNodePublicIds: [] },
      plan: {
        difficulty: "medium",
        knowledgeNodePublicIds: [],
        parentKnowledgeNodePublicIds: [],
      },
    },
    sections: [
      {
        sectionKey: "single_choice",
        title: "单选题",
        questionType: "single_choice",
        targetQuestionCount: 2,
        selectedQuestionCount: 2,
        selectedQuestions: [
          {
            questionPublicId: "platform_question_snapshot_162",
            sourceKind: "platform_formal_question",
            matchTier: "exact",
            score: 2,
            constraintMatchBasis: {
              difficulty: "medium",
              knowledgeNodePublicIds: [],
              parentKnowledgeNodePublicIds: [],
              ancestorKnowledgeNodePublicIds: [],
              matchTier: "exact",
            },
            questionGroup: null,
          },
          {
            questionPublicId: "enterprise_question_snapshot_162",
            sourceKind: "enterprise_training_snapshot",
            matchTier: "exact",
            score: 2,
            constraintMatchBasis: {
              difficulty: "medium",
              knowledgeNodePublicIds: [],
              parentKnowledgeNodePublicIds: [],
              ancestorKnowledgeNodePublicIds: [],
              matchTier: "exact",
            },
            questionGroup: { ...questionGroup, questionSortOrder: 1 },
          },
        ],
        degradationSummary: {
          exactCount: 2,
          descendantCount: 0,
          nearbyKnowledgeCount: 0,
          sameScopeCount: 0,
        },
      },
    ],
  };
}

function createPrivateSnapshot() {
  const paperAssemblyContainer = createPaperAssemblyContainer();
  const sourceQuestions: PersonalAiGenerationPaperQuestionSourceDto[] =
    paperAssemblyContainer.sections[0]!.selectedQuestions.map(
      (selectedQuestion, index) => {
        const questionGroup = selectedQuestion.questionGroup;

        return {
          questionPublicId: selectedQuestion.questionPublicId,
          sourceKind: selectedQuestion.sourceKind,
          sourceVersion:
            selectedQuestion.sourceKind === "platform_formal_question"
              ? {
                  kind: "platform_question_updated_at" as const,
                  updatedAt: "2026-07-23T12:00:00.000Z",
                }
              : {
                  kind: "organization_training_version" as const,
                  trainingVersionPublicId: "training_version_snapshot_162",
                  trainingVersionNumber: 3,
                  publishedAt: "2026-07-23T11:00:00.000Z",
                },
          profession: "marketing" as const,
          level: 3,
          subject: "theory" as const,
          questionType: "single_choice" as const,
          difficulty: "medium",
          knowledgeNodePublicIds: [],
          parentKnowledgeNodePublicIds: [],
          ancestorKnowledgeNodePublicIds: [],
          questionStem: `不可变题干-${index + 1}`,
          questionOptions: [
            { optionLabel: "A", optionText: "正确", isCorrect: true },
            { optionLabel: "B", optionText: "错误", isCorrect: false },
          ],
          standardAnswerLabels: ["A"],
          standardAnswerText: "A",
          analysis: `不可变解析-${index + 1}`,
          scoringPoints: [],
          fillBlankAnswers: [],
          questionGroup:
            questionGroup === null || questionGroup === undefined
              ? null
              : {
                  publicId: questionGroup.publicId,
                  title: questionGroup.title,
                  materialSnapshot: { ...questionGroup.materialSnapshot },
                  memberQuestionPublicIds: [
                    ...questionGroup.memberQuestionPublicIds,
                  ],
                  questionSortOrder: questionGroup.questionSortOrder,
                },
        };
      },
    );
  const snapshot = createPersonalAiGenerationPrivatePaperQuestionSnapshot({
    resultPublicId: "personal_ai_result_snapshot_162",
    taskPublicId: "ai_generation_task_snapshot_162",
    ownerType: "organization",
    ownerPublicId: "organization_snapshot_162",
    paperAssemblyContainer,
    sourceQuestions,
  });

  if (snapshot === null) {
    throw new Error("test private paper snapshot must be valid");
  }

  return { paperAssemblyContainer, snapshot };
}

describe("personal AI learning-session private paper snapshot mapper", () => {
  it("maps the exact persisted order and detached group/material facts without current repository reads", () => {
    const { paperAssemblyContainer, snapshot } = createPrivateSnapshot();

    const questions = mapPrivatePaperQuestionSnapshotToLearningSourceQuestions({
      privateSnapshot: snapshot,
      resultPublicId: "personal_ai_result_snapshot_162",
      taskPublicId: "ai_generation_task_snapshot_162",
      ownerType: "organization",
      ownerPublicId: "organization_snapshot_162",
      paperAssemblyContainer,
    });

    expect(questions).toEqual([
      expect.objectContaining({
        questionPublicId: "platform_question_snapshot_162",
        sourceKind: "platform_formal_question",
        questionStem: "不可变题干-1",
        standardAnswerLabels: ["A"],
        analysis: "不可变解析-1",
        questionGroup: null,
      }),
      expect.objectContaining({
        questionPublicId: "enterprise_question_snapshot_162",
        sourceKind: "enterprise_training_snapshot",
        questionStem: "不可变题干-2",
        questionGroup: expect.objectContaining({
          questionSortOrder: 1,
          materialSnapshot: {
            materialPublicId: "material_snapshot_162",
            title: "不可变材料",
            contentRichText: "不可变材料正文",
          },
        }),
      }),
    ]);

    questions![0]!.questionOptions[0]!.optionText = "调用者修改";
    questions![1]!.questionGroup!.memberQuestionPublicIds[0] = "调用者修改";
    expect(snapshot.snapshot.questions[0]!.questionOptions[0]!.optionText).toBe(
      "正确",
    );
    expect(
      snapshot.snapshot.questions[1]!.questionGroup!.memberQuestionPublicIds[0],
    ).toBe("enterprise_question_snapshot_162");
  });

  it("rejects result, task, owner and paper-container identity mismatches", () => {
    const { paperAssemblyContainer, snapshot } = createPrivateSnapshot();
    const baseInput = {
      privateSnapshot: snapshot,
      resultPublicId: "personal_ai_result_snapshot_162",
      taskPublicId: "ai_generation_task_snapshot_162",
      ownerType: "organization" as const,
      ownerPublicId: "organization_snapshot_162",
      paperAssemblyContainer,
    };

    for (const mismatchedInput of [
      { ...baseInput, resultPublicId: "different_result" },
      { ...baseInput, taskPublicId: "different_task" },
      { ...baseInput, ownerType: "personal" as const },
      { ...baseInput, ownerPublicId: "different_owner" },
      {
        ...baseInput,
        paperAssemblyContainer: {
          ...paperAssemblyContainer,
          title: "漂移后的试卷",
        },
      },
    ]) {
      expect(
        mapPrivatePaperQuestionSnapshotToLearningSourceQuestions(
          mismatchedInput,
        ),
      ).toBeNull();
    }

    expect(
      normalizePersonalAiGenerationPrivatePaperQuestionSnapshot(snapshot),
    ).toEqual(snapshot);
  });
});
