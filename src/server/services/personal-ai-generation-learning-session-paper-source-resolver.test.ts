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

  it("reloads a selected platform question by exact public id outside a moving list window", async () => {
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

    expect(sourceQuestions).toEqual([
      expect.objectContaining({
        questionPublicId: "resolver_platform_question_public_001",
        sourceKind: "platform_formal_question",
      }),
    ]);
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

  it("keeps personal paper source resolution platform-only even when enterprise selection is present", async () => {
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
    expect(sourceQuestions).toEqual([
      expect.objectContaining({
        questionPublicId: "resolver_platform_question_public_001",
        sourceKind: "platform_formal_question",
      }),
    ]);
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
