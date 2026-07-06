import { describe, expect, it } from "vitest";

import type { OrganizationTrainingPublishedVersionDto } from "../contracts/organization-training-contract";
import type {
  OrganizationTrainingAdminLifecycleListInput,
  OrganizationTrainingEmployeeVisibleVersionListInput,
  OrganizationTrainingRepository,
} from "../repositories/organization-training-repository";
import type {
  QuestionAccessRow,
  QuestionRepository,
} from "../repositories/question-repository";
import type { NormalizedQuestionListInput } from "../validators/question";
import { resolveAiPaperRouteQuestionSources } from "./ai-paper-route-source-resolution-service";

const generationParameters = {
  profession: "marketing",
  level: 3,
  subject: "theory",
  knowledgeNode: "knowledge_node_public_child",
  questionType: "single_choice",
  questionCount: 30,
  difficulty: "medium",
  learningObjective: "redacted objective",
} as const;

function createQuestionRow(
  override: Partial<QuestionAccessRow> = {},
): QuestionAccessRow {
  return {
    id: 101,
    public_id: "platform_question_public_a",
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
    scoring_points: [
      {
        id: 301,
        question_id: 101,
        description: "SENSITIVE_PLATFORM_SCORING_MARKER",
        score: "1",
        sort_order: 1,
        created_at: new Date("2026-07-06T00:00:00.000Z"),
        updated_at: new Date("2026-07-06T00:00:00.000Z"),
      },
    ],
    knowledge_node_public_ids: ["knowledge_node_public_child"],
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
    title: "SENSITIVE_ENTERPRISE_TRAINING_TITLE",
    description: "SENSITIVE_ENTERPRISE_TRAINING_DESCRIPTION",
    questionCount: 1,
    totalScore: 1,
    status: "published",
    publishedAt: "2026-07-06T00:00:00.000Z",
    takenDownAt: null,
    takedownReason: null,
    questions: [
      {
        publicId: "enterprise_question_public_a",
        sequenceNumber: 1,
        questionType: "single_choice",
        materialTitle: "SENSITIVE_ENTERPRISE_MATERIAL_TITLE",
        materialContent: "SENSITIVE_ENTERPRISE_MATERIAL_CONTENT",
        stem: "SENSITIVE_ENTERPRISE_STEM_MARKER",
        options: [
          {
            publicId: "enterprise_option_public_a",
            label: "A",
            content: "SENSITIVE_ENTERPRISE_OPTION_MARKER",
          },
        ],
        score: 1,
      },
    ],
    ...override,
  };
}

describe("AI组卷 route source resolution", () => {
  it.each(["personal_advanced_student", "content_admin"] as const)(
    "resolves %s from platform formal questions only",
    async (role) => {
      let capturedQuestionQueries: NormalizedQuestionListInput[] = [];
      const questionRepository: Pick<QuestionRepository, "listQuestions"> = {
        async listQuestions(query) {
          capturedQuestionQueries = [...capturedQuestionQueries, query];

          return {
            rows: [
              createQuestionRow(),
              createQuestionRow({
                public_id: "platform_question_disabled",
                status: "disabled",
              }),
            ],
            total: 2,
          };
        },
      };
      const organizationTrainingRepository =
        createThrowingOrganizationTrainingRepository();

      const result = await resolveAiPaperRouteQuestionSources({
        role,
        organizationPublicId: null,
        employeePublicId: null,
        generationParameters,
        questionRepository,
        organizationTrainingRepository,
        knowledgeNodeParentPublicIdsByPublicId: {
          knowledge_node_public_child: "knowledge_node_public_parent",
        },
        difficultyByQuestionPublicId: {
          platform_question_public_a: "medium",
        },
      });

      expect(result.status).toBe("resolved");
      expect(result.rejection).toBeNull();
      expect(result.platformQuestions).toHaveLength(1);
      expect(result.enterpriseQuestions).toEqual([]);
      expect(result.platformQuestions[0]).toMatchObject({
        publicId: "platform_question_public_a",
        sourceKind: "platform_formal_question",
        difficulty: "medium",
        parentKnowledgeNodePublicIds: ["knowledge_node_public_parent"],
      });
      expect(capturedQuestionQueries).toEqual([
        {
          page: 1,
          pageSize: 100,
          sortBy: "updatedAt",
          sortOrder: "desc",
          profession: "marketing",
          level: 3,
          subject: "theory",
          questionType: null,
          status: "available",
          keyword: null,
          knowledgeNodePublicId: null,
          tagPublicId: null,
        },
      ]);
    },
  );

  it("resolves organization admin sources from platform questions and admin-visible training snapshots", async () => {
    let capturedAdminLifecycleInputs: OrganizationTrainingAdminLifecycleListInput[] =
      [];
    const organizationTrainingRepository = {
      async listAdminLifecycleVersions(input) {
        capturedAdminLifecycleInputs = [...capturedAdminLifecycleInputs, input];

        return [
          createTrainingVersion(),
          createTrainingVersion({
            publicId: "training_version_public_other",
            organizationPublicId: "organization_public_other",
          }),
        ];
      },
      async listEmployeeVisibleVersions() {
        throw new Error("employee repository should not be called");
      },
    } satisfies Pick<
      OrganizationTrainingRepository,
      "listAdminLifecycleVersions" | "listEmployeeVisibleVersions"
    >;

    const result = await resolveAiPaperRouteQuestionSources({
      role: "org_advanced_admin",
      organizationPublicId: "organization_public_a",
      employeePublicId: null,
      generationParameters,
      questionRepository: createQuestionRepository([createQuestionRow()]),
      organizationTrainingRepository,
    });
    const serializedResult = JSON.stringify(result);

    expect(result.status).toBe("resolved");
    expect(result.platformQuestions).toHaveLength(1);
    expect(result.enterpriseQuestions).toHaveLength(1);
    expect(result.enterpriseQuestions[0]).toMatchObject({
      publicId: "enterprise_question_public_a",
      sourceKind: "enterprise_training_snapshot",
      organizationPublicId: "organization_public_a",
    });
    expect(capturedAdminLifecycleInputs).toEqual([
      { visibleOrganizationPublicIds: ["organization_public_a"] },
    ]);
    expect(serializedResult).not.toContain("SENSITIVE_PLATFORM_STEM_MARKER");
    expect(serializedResult).not.toContain("SENSITIVE_ENTERPRISE_STEM_MARKER");
    expect(serializedResult).not.toContain(
      "SENSITIVE_ENTERPRISE_OPTION_MARKER",
    );
  });

  it("resolves organization employee sources from employee-visible training snapshots", async () => {
    let capturedEmployeeVisibleInputs: OrganizationTrainingEmployeeVisibleVersionListInput[] =
      [];
    const organizationTrainingRepository = {
      async listAdminLifecycleVersions() {
        throw new Error("admin repository should not be called");
      },
      async listEmployeeVisibleVersions(input) {
        capturedEmployeeVisibleInputs = [
          ...capturedEmployeeVisibleInputs,
          input,
        ];

        return [createTrainingVersion()];
      },
    } satisfies Pick<
      OrganizationTrainingRepository,
      "listAdminLifecycleVersions" | "listEmployeeVisibleVersions"
    >;

    const result = await resolveAiPaperRouteQuestionSources({
      role: "org_advanced_employee",
      organizationPublicId: "organization_public_a",
      employeePublicId: "employee_public_a",
      generationParameters,
      questionRepository: createQuestionRepository([createQuestionRow()]),
      organizationTrainingRepository,
    });

    expect(result.status).toBe("resolved");
    expect(result.platformQuestions).toHaveLength(1);
    expect(result.enterpriseQuestions).toHaveLength(1);
    expect(capturedEmployeeVisibleInputs).toEqual([
      {
        employeePublicId: "employee_public_a",
        organizationPublicId: "organization_public_a",
      },
    ]);
  });

  it("rejects missing organization or employee context before repository access", async () => {
    const missingOrganizationResult = await resolveAiPaperRouteQuestionSources({
      role: "org_advanced_admin",
      organizationPublicId: null,
      employeePublicId: null,
      generationParameters,
      questionRepository: createThrowingQuestionRepository(),
      organizationTrainingRepository:
        createThrowingOrganizationTrainingRepository(),
    });
    const missingEmployeeResult = await resolveAiPaperRouteQuestionSources({
      role: "org_advanced_employee",
      organizationPublicId: "organization_public_a",
      employeePublicId: null,
      generationParameters,
      questionRepository: createThrowingQuestionRepository(),
      organizationTrainingRepository:
        createThrowingOrganizationTrainingRepository(),
    });

    expect(missingOrganizationResult).toEqual({
      status: "rejected",
      platformQuestions: [],
      enterpriseQuestions: [],
      rejection: {
        failureCategory: "missing_organization_context",
      },
      diagnostics: {
        role: "org_advanced_admin",
        platformQuestionCount: 0,
        enterpriseQuestionCount: 0,
        enterpriseSourceStatus: "not_resolved",
      },
    });
    expect(missingEmployeeResult.rejection).toEqual({
      failureCategory: "missing_employee_context",
    });
  });
});

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
