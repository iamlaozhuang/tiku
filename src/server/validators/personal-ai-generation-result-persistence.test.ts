import { describe, expect, it } from "vitest";

import type { AiPaperPlanAndSelectContainerDto } from "../contracts/ai-paper-plan-and-select-contract";
import {
  createPersonalAiGenerationPrivatePaperQuestionSnapshot,
  normalizePersonalAiGenerationPrivatePaperQuestionSnapshot,
} from "./personal-ai-generation-result-persistence";

function createPaperAssemblyContainer(): AiPaperPlanAndSelectContainerDto {
  return {
    title: "不可变自测试卷",
    profession: "marketing" as const,
    level: 3,
    subject: "theory" as const,
    requestedQuestionCount: 1,
    selectedQuestionCount: 1,
    sourceComposition: {
      platformFormalQuestionCount: 1,
      enterpriseTrainingSnapshotCount: 0,
    },
    matchQuality: "fully_matched" as const,
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
        questionType: "single_choice" as const,
        targetQuestionCount: 1,
        selectedQuestionCount: 1,
        selectedQuestions: [
          {
            questionPublicId: "question_public_selected",
            sourceKind: "platform_formal_question" as const,
            matchTier: "exact" as const,
            score: 2,
            constraintMatchBasis: {
              difficulty: "medium",
              knowledgeNodePublicIds: [],
              parentKnowledgeNodePublicIds: [],
              ancestorKnowledgeNodePublicIds: [],
              matchTier: "exact" as const,
            },
            questionGroup: null,
          },
        ],
        degradationSummary: {
          exactCount: 1,
          descendantCount: 0,
          nearbyKnowledgeCount: 0,
          sameScopeCount: 0,
        },
      },
    ],
  };
}

function createPlatformSourceQuestion(questionPublicId: string) {
  return {
    questionPublicId,
    sourceKind: "platform_formal_question" as const,
    sourceVersion: {
      kind: "platform_question_updated_at" as const,
      updatedAt: "2026-07-23T12:00:00.000Z",
    },
    profession: "marketing" as const,
    level: 3,
    subject: "theory" as const,
    questionType: "single_choice" as const,
    difficulty: "medium",
    knowledgeNodePublicIds: [],
    parentKnowledgeNodePublicIds: [],
    ancestorKnowledgeNodePublicIds: [],
    questionStem: `题干-${questionPublicId}`,
    questionOptions: [
      { optionLabel: "A", optionText: "正确选项", isCorrect: true },
      { optionLabel: "B", optionText: "错误选项", isCorrect: false },
    ],
    standardAnswerLabels: ["A"],
    standardAnswerText: "A",
    analysis: "历史解析",
    scoringPoints: [],
    fillBlankAnswers: [],
    questionGroup: null,
  };
}

describe("personal AI paper result private question snapshot", () => {
  it("captures only the exact selected facts from a larger candidate set and detaches them", () => {
    const paperAssemblyContainer = createPaperAssemblyContainer();
    const selectedSourceQuestion = createPlatformSourceQuestion(
      "question_public_selected",
    );
    const unselectedSourceQuestion = createPlatformSourceQuestion(
      "question_public_unselected",
    );

    const snapshot = createPersonalAiGenerationPrivatePaperQuestionSnapshot({
      resultPublicId: "personal_ai_result_public_162",
      taskPublicId: "ai_generation_task_public_162",
      ownerType: "personal",
      ownerPublicId: "student_public_162",
      paperAssemblyContainer,
      sourceQuestions: [selectedSourceQuestion, unselectedSourceQuestion],
    });

    expect(snapshot).not.toBeNull();
    expect(snapshot?.schemaVersion).toBe("paper_question_snapshot_v1");
    expect(snapshot?.snapshot.questions).toHaveLength(1);
    expect(snapshot?.snapshot.questions[0]).toMatchObject({
      questionPublicId: "question_public_selected",
      questionStem: "题干-question_public_selected",
      standardAnswerLabels: ["A"],
      analysis: "历史解析",
    });
    expect(snapshot?.digest).toMatch(/^[a-f0-9]{64}$/u);

    selectedSourceQuestion.questionStem = "稍后被修改的当前题干";
    selectedSourceQuestion.questionOptions[0]!.optionText = "稍后被修改";
    paperAssemblyContainer.sections[0]!.selectedQuestions[0]!.score = 99;

    expect(snapshot?.snapshot.questions[0]?.questionStem).toBe(
      "题干-question_public_selected",
    );
    expect(
      snapshot?.snapshot.questions[0]?.questionOptions[0]?.optionText,
    ).toBe("正确选项");
    expect(
      snapshot?.snapshot.paperAssemblyContainer.sections[0]
        ?.selectedQuestions[0]?.score,
    ).toBe(2);
    expect(
      normalizePersonalAiGenerationPrivatePaperQuestionSnapshot(snapshot),
    ).toEqual(snapshot);
  });

  it("accepts the authoritative 1000-candidate collection while snapshotting only the selected subset", () => {
    const paperAssemblyContainer = createPaperAssemblyContainer();
    const sourceQuestions = [
      createPlatformSourceQuestion("question_public_selected"),
      ...Array.from({ length: 999 }, (_, index) =>
        createPlatformSourceQuestion(
          `question_public_unselected_${String(index + 1).padStart(3, "0")}`,
        ),
      ),
    ];

    const snapshot = createPersonalAiGenerationPrivatePaperQuestionSnapshot({
      resultPublicId: "personal_ai_result_public_1000_candidates",
      taskPublicId: "ai_generation_task_public_1000_candidates",
      ownerType: "personal",
      ownerPublicId: "student_public_1000_candidates",
      paperAssemblyContainer,
      sourceQuestions,
    });

    expect(snapshot).not.toBeNull();
    expect(snapshot?.snapshot.questions).toEqual([
      expect.objectContaining({
        questionPublicId: "question_public_selected",
      }),
    ]);
  });

  it("rejects duplicate candidate keys, selected-source mismatches and unknown snapshot fields", () => {
    const paperAssemblyContainer = createPaperAssemblyContainer();
    const selectedSourceQuestion = createPlatformSourceQuestion(
      "question_public_selected",
    );

    expect(
      createPersonalAiGenerationPrivatePaperQuestionSnapshot({
        resultPublicId: "personal_ai_result_public_162",
        taskPublicId: "ai_generation_task_public_162",
        ownerType: "personal",
        ownerPublicId: "student_public_162",
        paperAssemblyContainer,
        sourceQuestions: [selectedSourceQuestion, selectedSourceQuestion],
      }),
    ).toBeNull();

    expect(
      createPersonalAiGenerationPrivatePaperQuestionSnapshot({
        resultPublicId: "personal_ai_result_public_162",
        taskPublicId: "ai_generation_task_public_162",
        ownerType: "personal",
        ownerPublicId: "student_public_162",
        paperAssemblyContainer,
        sourceQuestions: [
          {
            ...selectedSourceQuestion,
            sourceKind: "enterprise_training_snapshot" as const,
          },
        ],
      }),
    ).toBeNull();

    const snapshot = createPersonalAiGenerationPrivatePaperQuestionSnapshot({
      resultPublicId: "personal_ai_result_public_162",
      taskPublicId: "ai_generation_task_public_162",
      ownerType: "personal",
      ownerPublicId: "student_public_162",
      paperAssemblyContainer,
      sourceQuestions: [selectedSourceQuestion],
    });

    expect(snapshot).not.toBeNull();
    expect(
      normalizePersonalAiGenerationPrivatePaperQuestionSnapshot({
        ...snapshot,
        unexpected: true,
      }),
    ).toBeNull();
    expect(
      normalizePersonalAiGenerationPrivatePaperQuestionSnapshot({
        ...snapshot,
        digest: "0".repeat(64),
      }),
    ).toBeNull();

    expect(
      createPersonalAiGenerationPrivatePaperQuestionSnapshot({
        resultPublicId: "personal_ai_result_public_162",
        taskPublicId: "ai_generation_task_public_162",
        ownerType: "personal",
        ownerPublicId: "student_public_162",
        paperAssemblyContainer,
        sourceQuestions: [
          Object.assign(
            createPlatformSourceQuestion("question_public_selected"),
            { unexpectedPrivateMetadata: true },
          ),
        ],
      }),
    ).toBeNull();

    const sparseSources = [selectedSourceQuestion];
    delete sparseSources[0];
    expect(
      createPersonalAiGenerationPrivatePaperQuestionSnapshot({
        resultPublicId: "personal_ai_result_public_162",
        taskPublicId: "ai_generation_task_public_162",
        ownerType: "personal",
        ownerPublicId: "student_public_162",
        paperAssemblyContainer,
        sourceQuestions: sparseSources,
      }),
    ).toBeNull();

    expect(
      createPersonalAiGenerationPrivatePaperQuestionSnapshot({
        resultPublicId: "personal_ai_result_public_162",
        taskPublicId: "ai_generation_task_public_162",
        ownerType: "personal",
        ownerPublicId: "student_public_162",
        paperAssemblyContainer,
        sourceQuestions: [
          selectedSourceQuestion,
          createPlatformSourceQuestion("QUESTION_PUBLIC_SELECTED"),
        ],
      }),
    ).toBeNull();

    expect(
      createPersonalAiGenerationPrivatePaperQuestionSnapshot({
        resultPublicId: "personal_ai_result_public_162",
        taskPublicId: "ai_generation_task_public_162",
        ownerType: "personal",
        ownerPublicId: "student_public_162",
        paperAssemblyContainer,
        sourceQuestions: [
          {
            ...selectedSourceQuestion,
            knowledgeNodePublicIds: ["knowledge_node_A", "knowledge_node_a"],
          },
        ],
      }),
    ).toBeNull();

    const incompleteGroupContainer = createPaperAssemblyContainer();
    incompleteGroupContainer.sections[0]!.selectedQuestions[0]!.questionGroup =
      {
        publicId: "question_group_incomplete",
        title: "不完整题组",
        materialSnapshot: {
          materialPublicId: "material_incomplete",
          title: "材料",
          contentRichText: "材料正文",
        },
        memberQuestionPublicIds: [
          "question_public_selected",
          "question_public_missing",
        ],
        questionSortOrder: 1,
      };
    expect(
      createPersonalAiGenerationPrivatePaperQuestionSnapshot({
        resultPublicId: "personal_ai_result_public_162",
        taskPublicId: "ai_generation_task_public_162",
        ownerType: "personal",
        ownerPublicId: "student_public_162",
        paperAssemblyContainer: incompleteGroupContainer,
        sourceQuestions: [
          {
            ...selectedSourceQuestion,
            questionGroup:
              incompleteGroupContainer.sections[0]!.selectedQuestions[0]!
                .questionGroup ?? null,
          },
        ],
      }),
    ).toBeNull();
  });
});
