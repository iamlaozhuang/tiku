import { describe, expect, it } from "vitest";

import type { AiPaperPlanAndSelectContainerDto } from "../contracts/ai-paper-plan-and-select-contract";
import type { PersonalAiGenerationLearningPaperSourceQuestionDto } from "../contracts/personal-ai-generation-learning-session-contract";
import type { OrganizationTrainingQuestionSnapshotValue } from "@/db/schema";
import type { OrganizationTrainingRepository } from "../repositories/organization-training-repository";
import type {
  AiPaperQuestionSourceRepository,
  AiPaperSourceQuestionListInput,
  QuestionAccessRow,
} from "../repositories/question-repository";
import { createPersonalAiGenerationLearningSessionPaperSourceResolver } from "./personal-ai-generation-learning-session-paper-source-resolver";

const personalUserContext = {
  userPublicId: "resolver_personal_user_public_001",
  userType: "personal",
  employeePublicId: null,
  organizationPublicId: null,
} as const;

const employeeUserContext = {
  userPublicId: "resolver_employee_user_public_001",
  userType: "employee",
  employeePublicId: "resolver_employee_record_public_001",
  organizationPublicId: "resolver_organization_public_001",
} as const;

function createPaperAssemblyContainer(): AiPaperPlanAndSelectContainerDto {
  return {
    title: "synthetic resolver paper",
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
    sections: [
      {
        sectionKey: "single-choice",
        title: "single choice section",
        questionType: "single_choice",
        targetQuestionCount: 2,
        selectedQuestionCount: 2,
        selectedQuestions: [
          {
            questionPublicId: "resolver_platform_question_public_001",
            sourceKind: "platform_formal_question",
            matchTier: "exact",
            score: 2,
          },
          {
            questionPublicId: "resolver_enterprise_question_public_001",
            sourceKind: "enterprise_training_snapshot",
            matchTier: "exact",
            score: 2,
          },
        ],
        degradationSummary: {
          exactCount: 2,
          nearbyKnowledgeCount: 0,
          sameScopeCount: 0,
        },
      },
    ],
  };
}

function createQuestionRow(
  overrides: Partial<QuestionAccessRow> = {},
): QuestionAccessRow {
  return {
    id: 101,
    public_id: "resolver_platform_question_public_001",
    question_type: "single_choice",
    profession: "marketing",
    level: 3,
    subject: "theory",
    stem_rich_text: "synthetic resolver platform stem",
    analysis_rich_text: "synthetic resolver platform analysis",
    standard_answer_rich_text: "A",
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
        content_rich_text: "synthetic resolver platform option a",
        is_correct: true,
        sort_order: 1,
        created_at: new Date("2026-07-06T00:00:00.000Z"),
        updated_at: new Date("2026-07-06T00:00:00.000Z"),
      },
      {
        id: 202,
        question_id: 101,
        label: "B",
        content_rich_text: "synthetic resolver platform option b",
        is_correct: false,
        sort_order: 2,
        created_at: new Date("2026-07-06T00:00:00.000Z"),
        updated_at: new Date("2026-07-06T00:00:00.000Z"),
      },
    ],
    scoring_points: [],
    knowledge_node_public_ids: ["resolver_knowledge_node_public_001"],
    tag_public_ids: [],
    created_at: new Date("2026-07-06T00:00:00.000Z"),
    updated_at: new Date("2026-07-06T00:00:00.000Z"),
    ...overrides,
  };
}

function createEnterpriseSnapshot(
  overrides: Partial<OrganizationTrainingQuestionSnapshotValue> = {},
): OrganizationTrainingQuestionSnapshotValue {
  return {
    publicId: "resolver_enterprise_question_public_001",
    sequenceNumber: 1,
    questionType: "single_choice",
    materialTitle: null,
    materialContent: null,
    stem: "synthetic resolver enterprise stem",
    options: [
      {
        publicId: "resolver_enterprise_option_public_a",
        label: "A",
        content: "synthetic resolver enterprise option a",
      },
      {
        publicId: "resolver_enterprise_option_public_b",
        label: "B",
        content: "synthetic resolver enterprise option b",
      },
    ],
    score: 2,
    standardAnswer: "B",
    analysisSummary: "synthetic resolver enterprise analysis",
    evidenceStatus: "sufficient",
    citationCount: 1,
    ...overrides,
  };
}

describe("personal AI generation learning session paper source resolver", () => {
  it.each([
    "single_choice",
    "multi_choice",
    "true_false",
    "fill_blank",
    "short_answer",
    "case_analysis",
    "calculation",
  ] as const)(
    "preserves canonical %s source identity without filtering",
    async (questionType) => {
      const container = createPaperAssemblyContainer();
      container.requestedQuestionCount = 1;
      container.selectedQuestionCount = 1;
      container.sourceComposition = {
        platformFormalQuestionCount: 1,
        enterpriseTrainingSnapshotCount: 0,
      };
      container.sections = [
        {
          ...container.sections[0]!,
          questionType,
          targetQuestionCount: 1,
          selectedQuestionCount: 1,
          selectedQuestions: [container.sections[0]!.selectedQuestions[0]!],
        },
      ];
      const resolver =
        createPersonalAiGenerationLearningSessionPaperSourceResolver({
          questionRepository: createQuestionRepository([
            createQuestionRow({ question_type: questionType }),
          ]),
        });

      const result = await resolver({
        userContext: personalUserContext,
        ownerScope: {
          ownerType: "personal",
          ownerPublicId: personalUserContext.userPublicId,
          actorPublicId: personalUserContext.userPublicId,
        },
        sourceResultPublicId: "resolver_result_type_001",
        sourceTaskPublicId: "resolver_task_type_001",
        paperAssemblyContainer: container,
      });

      expect(result).toEqual([expect.objectContaining({ questionType })]);
    },
  );

  it("preserves the selected immutable material group snapshot while revalidating exact current source membership", async () => {
    const container = createPaperAssemblyContainer();
    const group = {
      publicId: "qgroup_resolver_material_001",
      title: "resolver material group",
      materialSnapshot: {
        materialPublicId: "resolver_material_public_001",
        title: "resolver immutable material",
        contentRichText: "resolver immutable material body",
      },
      memberQuestionPublicIds: [
        "resolver_platform_question_public_001",
        "resolver_platform_question_public_002",
      ],
      questionSortOrder: 1,
    };
    container.sourceComposition = {
      platformFormalQuestionCount: 2,
      enterpriseTrainingSnapshotCount: 0,
    };
    container.sections[0]!.selectedQuestions = [
      Object.assign(container.sections[0]!.selectedQuestions[0]!, {
        questionGroup: group,
      }),
      {
        questionPublicId: "resolver_platform_question_public_002",
        sourceKind: "platform_formal_question",
        matchTier: "exact",
        score: 2,
        questionGroup: { ...group, questionSortOrder: 2 },
      },
    ];
    const currentRows = ["001", "002"].map((suffix, index) =>
      Object.assign(
        createQuestionRow({
          id: 101 + index,
          public_id: `resolver_platform_question_public_${suffix}`,
          material_id: 901,
          material_public_id: "resolver_material_public_001",
        }),
        {
          material_status: "available" as const,
          material_title: "mutated current title must not replace snapshot",
          material_content_rich_text:
            "mutated current body must not replace snapshot",
        },
      ),
    );
    const resolver =
      createPersonalAiGenerationLearningSessionPaperSourceResolver({
        questionRepository: createQuestionRepository(currentRows),
      });

    const result = await resolver({
      userContext: personalUserContext,
      ownerScope: {
        ownerType: "personal",
        ownerPublicId: personalUserContext.userPublicId,
        actorPublicId: personalUserContext.userPublicId,
      },
      sourceResultPublicId: "resolver_result_group_001",
      sourceTaskPublicId: "resolver_task_group_001",
      paperAssemblyContainer: container,
    });

    expect(result).toHaveLength(2);
    expect(result.map((question) => question.questionGroup)).toEqual([
      group,
      { ...group, questionSortOrder: 2 },
    ]);
    expect(JSON.stringify(result)).not.toContain("mutated current title");
    expect(JSON.stringify(result)).not.toContain("mutated current body");

    currentRows[1]!.material_public_id = "resolver_material_public_other";
    expect(
      await resolver({
        userContext: personalUserContext,
        ownerScope: {
          ownerType: "personal",
          ownerPublicId: personalUserContext.userPublicId,
          actorPublicId: personalUserContext.userPublicId,
        },
        sourceResultPublicId: "resolver_result_group_001",
        sourceTaskPublicId: "resolver_task_group_001",
        paperAssemblyContainer: container,
      }),
    ).toEqual([]);
  });

  it("resolves selected platform formal questions and employee-visible enterprise snapshots", async () => {
    const questionQueries: AiPaperSourceQuestionListInput[] = [];
    const employeeSnapshotQueries: Array<{
      employeePublicId: string;
      organizationPublicId: string;
    }> = [];
    const questionRepository: AiPaperQuestionSourceRepository = {
      async listAvailableAiPaperSourceQuestions(query) {
        questionQueries.push(query);

        return [
          createQuestionRow(),
          createQuestionRow({
            public_id: "resolver_platform_question_public_unselected",
          }),
        ];
      },
    };
    const organizationTrainingRepository = {
      async listEmployeeVisibleQuestionSnapshotsForAiPaperSource(input) {
        employeeSnapshotQueries.push(input);

        return [
          createEnterpriseSnapshot(),
          createEnterpriseSnapshot({
            publicId: "resolver_enterprise_question_public_unselected",
          }),
        ];
      },
    } satisfies Pick<
      OrganizationTrainingRepository,
      "listEmployeeVisibleQuestionSnapshotsForAiPaperSource"
    >;
    const resolver =
      createPersonalAiGenerationLearningSessionPaperSourceResolver({
        questionRepository,
        organizationTrainingRepository,
      });

    const sourceQuestions = await resolver({
      userContext: employeeUserContext,
      ownerScope: {
        ownerType: "organization",
        ownerPublicId: employeeUserContext.organizationPublicId,
        actorPublicId: employeeUserContext.userPublicId,
      },
      sourceResultPublicId: "resolver_result_public_001",
      sourceTaskPublicId: "resolver_task_public_001",
      paperAssemblyContainer: createPaperAssemblyContainer(),
    });

    expect(questionQueries).toEqual([
      {
        profession: "marketing",
        level: 3,
        subject: "theory",
        knowledgeNodePublicIds: null,
        questionPublicIds: ["resolver_platform_question_public_001"],
      },
    ]);
    expect(employeeSnapshotQueries).toEqual([
      {
        employeePublicId: employeeUserContext.employeePublicId,
        organizationPublicId: employeeUserContext.organizationPublicId,
      },
    ]);
    expect(sourceQuestions).toEqual([
      expect.objectContaining({
        questionPublicId: "resolver_platform_question_public_001",
        sourceKind: "platform_formal_question",
        questionType: "single_choice",
        questionStem: "synthetic resolver platform stem",
        standardAnswerLabels: ["A"],
        standardAnswerText: "A",
      }),
      expect.objectContaining({
        questionPublicId: "resolver_enterprise_question_public_001",
        sourceKind: "enterprise_training_snapshot",
        questionType: "single_choice",
        questionStem: "synthetic resolver enterprise stem",
        standardAnswerLabels: ["B"],
        standardAnswerText: "B",
      }),
    ] satisfies PersonalAiGenerationLearningPaperSourceQuestionDto[]);
  });

  it("fails the whole exact source resolution when one selected source is unavailable", async () => {
    const aiPaperSourceQueries: unknown[] = [];
    let legacyListCalls = 0;
    const questionRepository = {
      async listQuestions() {
        legacyListCalls += 1;
        return { rows: [], total: 1000 };
      },
      async listAvailableAiPaperSourceQuestions(query: unknown) {
        aiPaperSourceQueries.push(query);
        return [createQuestionRow()];
      },
    };
    const resolver =
      createPersonalAiGenerationLearningSessionPaperSourceResolver({
        questionRepository,
      });

    const sourceQuestions = await resolver({
      userContext: personalUserContext,
      ownerScope: {
        ownerType: "personal",
        ownerPublicId: personalUserContext.userPublicId,
        actorPublicId: personalUserContext.userPublicId,
      },
      sourceResultPublicId: "resolver_result_public_exact",
      sourceTaskPublicId: "resolver_task_public_exact",
      paperAssemblyContainer: createPaperAssemblyContainer(),
    });

    expect(sourceQuestions).toEqual([]);
    expect(legacyListCalls).toBe(0);
    expect(aiPaperSourceQueries).toEqual([
      {
        profession: "marketing",
        level: 3,
        subject: "theory",
        knowledgeNodePublicIds: null,
        questionPublicIds: ["resolver_platform_question_public_001"],
      },
    ]);
  });

  it("does not return a partial platform source set when a personal container also selects enterprise content", async () => {
    let enterpriseRepositoryCalled = false;
    const resolver =
      createPersonalAiGenerationLearningSessionPaperSourceResolver({
        questionRepository: createQuestionRepository([createQuestionRow()]),
        organizationTrainingRepository: {
          async listEmployeeVisibleQuestionSnapshotsForAiPaperSource() {
            enterpriseRepositoryCalled = true;

            return [];
          },
        },
      });

    const sourceQuestions = await resolver({
      userContext: personalUserContext,
      ownerScope: {
        ownerType: "personal",
        ownerPublicId: personalUserContext.userPublicId,
        actorPublicId: personalUserContext.userPublicId,
      },
      sourceResultPublicId: "resolver_result_public_002",
      sourceTaskPublicId: "resolver_task_public_002",
      paperAssemblyContainer: createPaperAssemblyContainer(),
    });

    expect(enterpriseRepositoryCalled).toBe(false);
    expect(sourceQuestions).toEqual([]);
  });
});

function createQuestionRepository(
  rows: QuestionAccessRow[],
): AiPaperQuestionSourceRepository {
  return {
    async listAvailableAiPaperSourceQuestions() {
      return rows;
    },
  };
}
