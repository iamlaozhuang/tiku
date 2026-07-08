import { describe, expect, it } from "vitest";

import type { OrganizationTrainingPublishedVersionDto } from "../contracts/organization-training-contract";
import type { AiGenerationRouteIntegratedGenerationParameters } from "../contracts/route-integrated-provider-execution-contract";
import type {
  OrganizationTrainingAdminLifecycleListInput,
  OrganizationTrainingRepository,
} from "../repositories/organization-training-repository";
import type {
  QuestionAccessRow,
  QuestionRepository,
} from "../repositories/question-repository";
import type { NormalizedQuestionListInput } from "../validators/question";
import { createRouteIntegratedVisibleGeneratedContent } from "./route-integrated-provider-execution-service";
import { resolveAndAssembleAiPaperFromRoute } from "./ai-paper-route-plan-select-wiring-service";

const generationParameters: AiGenerationRouteIntegratedGenerationParameters = {
  profession: "marketing",
  level: 3,
  subject: "theory",
  knowledgeNode: null,
  knowledgeNodeMode: "balanced",
  knowledgeNodePublicIds: [],
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
  targetQuestionCount: 3,
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
      questionType: "true_false",
      targetQuestionCount: 1,
      targetScore: 1,
      knowledgeNodePublicIds: ["knowledge_node_public_b"],
      parentKnowledgeNodePublicIds: ["knowledge_node_parent_public_b"],
      difficulty: "medium",
    },
  ],
});

describe("AI组卷 route plan select wiring", () => {
  it("resolves content-admin platform sources and assembles a redacted paper container", async () => {
    let capturedQuestionQueries: NormalizedQuestionListInput[] = [];
    const questionRepository: Pick<QuestionRepository, "listQuestions"> = {
      async listQuestions(query) {
        capturedQuestionQueries = [...capturedQuestionQueries, query];

        return {
          rows: [
            createQuestionRow({ public_id: "platform_question_public_a" }),
            createQuestionRow({ public_id: "platform_question_public_b" }),
            createQuestionRow({
              public_id: "platform_question_public_c",
              question_type: "true_false",
              knowledge_node_public_ids: ["knowledge_node_public_b"],
            }),
          ],
          total: 3,
        };
      },
    };

    const result = await resolveAndAssembleAiPaperFromRoute({
      role: "content_admin",
      organizationPublicId: null,
      employeePublicId: null,
      generationParameters,
      visibleGeneratedContent: createParsedVisiblePlan(),
      questionRepository,
      organizationTrainingRepository:
        createThrowingOrganizationTrainingRepository(),
      knowledgeNodeParentPublicIdsByPublicId: {
        knowledge_node_public_a: "knowledge_node_parent_public_a",
        knowledge_node_public_b: "knowledge_node_parent_public_b",
      },
      difficultyByQuestionPublicId: {
        platform_question_public_a: "medium",
        platform_question_public_b: "medium",
        platform_question_public_c: "medium",
      },
    });
    const serializedResult = JSON.stringify(result);

    expect(result.status).toBe("assembled");
    expect(result.rejection).toBeNull();
    expect(result.sourceDiagnostics).toEqual({
      role: "content_admin",
      platformQuestionCount: 3,
      enterpriseQuestionCount: 0,
      enterpriseSourceStatus: "not_applicable",
    });
    expect(result.assembly?.container).toMatchObject({
      requestedQuestionCount: 3,
      selectedQuestionCount: 3,
      sourceComposition: {
        platformFormalQuestionCount: 3,
        enterpriseTrainingSnapshotCount: 0,
      },
    });
    expect(capturedQuestionQueries).toHaveLength(1);
    expect(serializedResult).not.toContain("SENSITIVE_PLATFORM_STEM_MARKER");
    expect(serializedResult).not.toContain("SENSITIVE_PLATFORM_OPTION_MARKER");
    expect(serializedResult).not.toContain("SENSITIVE_PLATFORM_ANSWER_MARKER");
  });

  it("resolves organization-admin enterprise snapshots before local assembly", async () => {
    let capturedAdminLifecycleInputs: OrganizationTrainingAdminLifecycleListInput[] =
      [];
    const organizationTrainingRepository = {
      async listAdminLifecycleVersions(input) {
        capturedAdminLifecycleInputs = [...capturedAdminLifecycleInputs, input];

        return [
          createTrainingVersion({
            questions: [
              createTrainingQuestion("enterprise_question_public_a"),
              createTrainingQuestion("enterprise_question_public_b"),
            ],
          }),
        ];
      },
      async listEmployeeVisibleVersions() {
        throw new Error("employee training repository should not be called");
      },
    } satisfies Pick<
      OrganizationTrainingRepository,
      "listAdminLifecycleVersions" | "listEmployeeVisibleVersions"
    >;

    const result = await resolveAndAssembleAiPaperFromRoute({
      role: "org_advanced_admin",
      organizationPublicId: "organization_public_a",
      employeePublicId: null,
      generationParameters,
      visibleGeneratedContent: createParsedVisiblePlan(),
      questionRepository: createQuestionRepository([
        createQuestionRow({
          public_id: "platform_question_public_c",
          question_type: "true_false",
          knowledge_node_public_ids: ["knowledge_node_public_b"],
        }),
      ]),
      organizationTrainingRepository,
      knowledgeNodeParentPublicIdsByPublicId: {
        knowledge_node_public_b: "knowledge_node_parent_public_b",
      },
      difficultyByQuestionPublicId: {
        platform_question_public_c: "medium",
      },
    });

    expect(result.status).toBe("assembled");
    expect(result.sourceDiagnostics).toEqual({
      role: "org_advanced_admin",
      platformQuestionCount: 1,
      enterpriseQuestionCount: 2,
      enterpriseSourceStatus: "resolved",
    });
    expect(result.assembly?.container.sourceComposition).toEqual({
      platformFormalQuestionCount: 1,
      enterpriseTrainingSnapshotCount: 2,
    });
    expect(
      result.assembly?.container.sections[0]?.selectedQuestions.map(
        (question) => question.questionPublicId,
      ),
    ).toEqual(["enterprise_question_public_a", "enterprise_question_public_b"]);
    expect(capturedAdminLifecycleInputs).toEqual([
      { visibleOrganizationPublicIds: ["organization_public_a"] },
    ]);
  });

  it("rejects missing organization context before repository access", async () => {
    const result = await resolveAndAssembleAiPaperFromRoute({
      role: "org_advanced_admin",
      organizationPublicId: null,
      employeePublicId: null,
      generationParameters,
      visibleGeneratedContent: createParsedVisiblePlan(),
      questionRepository: createThrowingQuestionRepository(),
      organizationTrainingRepository:
        createThrowingOrganizationTrainingRepository(),
    });

    expect(result).toEqual({
      status: "rejected",
      sourceDiagnostics: {
        role: "org_advanced_admin",
        platformQuestionCount: 0,
        enterpriseQuestionCount: 0,
        enterpriseSourceStatus: "not_resolved",
      },
      assembly: null,
      rejection: {
        failureCategory: "missing_organization_context",
      },
    });
  });

  it("rejects unsafe Provider-generated question bodies before returning an assembled paper", async () => {
    const result = await resolveAndAssembleAiPaperFromRoute({
      role: "content_admin",
      organizationPublicId: null,
      employeePublicId: null,
      generationParameters,
      visibleGeneratedContent: createRouteIntegratedVisibleGeneratedContent(
        JSON.stringify({
          targetQuestionCount: 1,
          sections: [
            {
              questionType: "single_choice",
              questionCount: 1,
              questions: [{ questionStem: "redacted generated stem marker" }],
            },
          ],
        }),
        {
          structuredPreview: {
            kind: "paper_draft",
            requestedQuestionCount: 1,
          },
        },
      ),
      questionRepository: createQuestionRepository([createQuestionRow()]),
      organizationTrainingRepository:
        createThrowingOrganizationTrainingRepository(),
    });

    expect(result.status).toBe("rejected");
    expect(result.assembly).toBeNull();
    expect(result.rejection).toEqual({
      failureCategory: "provider_question_content_forbidden",
    });
    expect(result.sourceDiagnostics).toMatchObject({
      role: "content_admin",
      platformQuestionCount: 1,
      enterpriseQuestionCount: 0,
    });
  });

  it("does not fill selected knowledge-node paper plans from unrelated same-scope questions", async () => {
    const selectedGenerationParameters: AiGenerationRouteIntegratedGenerationParameters =
      {
        ...generationParameters,
        knowledgeNodeMode: "selected",
        knowledgeNodePublicIds: ["knowledge_node_public_a"],
        includeDescendants: false,
        questionCount: 1,
      };
    const selectedRoutePlanContent = JSON.stringify({
      title: "自测组卷方案",
      targetQuestionCount: 1,
      sections: [
        {
          sectionKey: "single-choice",
          title: "单选题",
          questionType: "single_choice",
          targetQuestionCount: 1,
          targetScore: 2,
          knowledgeNodePublicIds: ["knowledge_node_public_a"],
          difficulty: "medium",
        },
      ],
    });

    const result = await resolveAndAssembleAiPaperFromRoute({
      role: "content_admin",
      organizationPublicId: null,
      employeePublicId: null,
      generationParameters: selectedGenerationParameters,
      visibleGeneratedContent: createRouteIntegratedVisibleGeneratedContent(
        selectedRoutePlanContent,
        {
          structuredPreview: {
            kind: "paper_draft",
            requestedQuestionCount: 1,
          },
        },
      ),
      questionRepository: createQuestionRepository([
        createQuestionRow({
          public_id: "platform_question_unrelated_knowledge",
          knowledge_node_public_ids: ["knowledge_node_public_unrelated"],
        }),
      ]),
      organizationTrainingRepository:
        createThrowingOrganizationTrainingRepository(),
      difficultyByQuestionPublicId: {
        platform_question_unrelated_knowledge: "medium",
      },
    });

    expect(result.status).toBe("insufficient");
    expect(result.sourceDiagnostics).toMatchObject({
      role: "content_admin",
      platformQuestionCount: 0,
      enterpriseQuestionCount: 0,
    });
    expect(result.assembly?.container).toMatchObject({
      requestedQuestionCount: 1,
      selectedQuestionCount: 0,
    });
  });
});

function createParsedVisiblePlan() {
  return createRouteIntegratedVisibleGeneratedContent(routePlanContent, {
    structuredPreview: {
      kind: "paper_draft",
      requestedQuestionCount: 3,
    },
  });
}

function createQuestionRow(
  override: Partial<QuestionAccessRow> = {},
): QuestionAccessRow {
  return {
    id: 101,
    public_id: "platform_question_public_default",
    question_type: "single_choice",
    profession: "marketing",
    level: 3,
    subject: "theory",
    stem_rich_text: "SENSITIVE_PLATFORM_STEM_MARKER",
    analysis_rich_text: "SENSITIVE_PLATFORM_ANALYSIS_MARKER",
    standard_answer_rich_text: "SENSITIVE_PLATFORM_ANSWER_MARKER",
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
        content_rich_text: "SENSITIVE_PLATFORM_OPTION_MARKER",
        is_correct: true,
        sort_order: 1,
        created_at: new Date("2026-07-06T00:00:00.000Z"),
        updated_at: new Date("2026-07-06T00:00:00.000Z"),
      },
    ],
    scoring_points: [],
    knowledge_node_public_ids: ["knowledge_node_public_a"],
    tag_public_ids: [],
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
    title: "SENSITIVE_ENTERPRISE_TRAINING_TITLE",
    description: "SENSITIVE_ENTERPRISE_TRAINING_DESCRIPTION",
    questionCount: 2,
    totalScore: 2,
    status: "published",
    publishedAt: "2026-07-06T00:00:00.000Z",
    takenDownAt: null,
    takedownReason: null,
    questions: [
      createTrainingQuestion("enterprise_question_public_default"),
      createTrainingQuestion("enterprise_question_public_default_b"),
    ],
    ...override,
  };
}

function createTrainingQuestion(publicId: string) {
  return {
    publicId,
    sequenceNumber: 1,
    questionType: "single_choice",
    materialTitle: "SENSITIVE_ENTERPRISE_MATERIAL_TITLE",
    materialContent: "SENSITIVE_ENTERPRISE_MATERIAL_CONTENT",
    stem: "SENSITIVE_ENTERPRISE_STEM_MARKER",
    options: [
      {
        publicId: `${publicId}_option_a`,
        label: "A",
        content: "SENSITIVE_ENTERPRISE_OPTION_MARKER",
      },
    ],
    score: 1,
  } satisfies NonNullable<
    OrganizationTrainingPublishedVersionDto["questions"]
  >[number];
}

function createQuestionRepository(
  questionRows: readonly QuestionAccessRow[],
): Pick<QuestionRepository, "listQuestions"> {
  return {
    async listQuestions() {
      return {
        rows: [...questionRows],
        total: questionRows.length,
      };
    },
  };
}

function createThrowingQuestionRepository(): Pick<
  QuestionRepository,
  "listQuestions"
> {
  return {
    async listQuestions() {
      throw new Error("question repository should not be called");
    },
  };
}

function createThrowingOrganizationTrainingRepository(): Pick<
  OrganizationTrainingRepository,
  "listAdminLifecycleVersions" | "listEmployeeVisibleVersions"
> {
  return {
    async listAdminLifecycleVersions() {
      throw new Error("admin training repository should not be called");
    },
    async listEmployeeVisibleVersions() {
      throw new Error("employee training repository should not be called");
    },
  };
}
