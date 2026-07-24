import { describe, expect, it, vi } from "vitest";

import type { AdminAiGenerationLocalContractDto } from "@/server/contracts/admin-ai-generation-local-contract";
import type { AiGenerationRouteIntegratedGenerationParameters } from "@/server/contracts/route-integrated-provider-execution-contract";
import { normalizeCreateQuestionInput } from "@/server/validators/question";
import { createContentAdminFormalReviewedDraftPayload } from "./admin-ai-generation-formal-draft-payload";

const generationParameters: AiGenerationRouteIntegratedGenerationParameters = {
  profession: "marketing",
  level: 3,
  subject: "theory",
  questionType: "single_choice",
  questionCount: 1,
  difficulty: "medium",
  learningObjective: "redacted objective",
  knowledgeNode: "synthetic selected node",
  knowledgeNodeMode: "selected",
  knowledgeNodePublicIds: ["knowledge_node_public_selected"],
  includeDescendants: true,
  knowledgeNodeSupplement: "synthetic selected node",
  sourcePreference: null,
};

function createContentQuestionContract(): AdminAiGenerationLocalContractDto {
  return {
    workspace: "content",
    generationKind: "question",
    runtimeBridge: {
      visibleGeneratedContent: {
        structuredPreview: {
          kind: "question_set",
          parseStatus: "parsed",
          requestedQuestionCount: 1,
          actualQuestionCount: 1,
          draftCount: 1,
          draftSummaries: [
            {
              draftNumber: 1,
              questionType: "single_choice",
              difficulty: "medium",
              knowledgeNodeCount: 1,
              questionStem: "synthetic reviewed question stem",
              questionOptions: [
                {
                  optionLabel: "A",
                  optionText: "synthetic option A",
                  isCorrect: true,
                },
                {
                  optionLabel: "B",
                  optionText: "synthetic option B",
                  isCorrect: false,
                },
              ],
              standardAnswer: "A",
              analysis: "synthetic reviewed analysis",
              scoringPoints: [],
              fillBlankAnswers: [],
              reviewStatus: "draft_review_required",
            },
          ],
        },
      },
    },
  } as unknown as AdminAiGenerationLocalContractDto;
}

function createContentPaperContract(
  sourceKind:
    | "platform_formal_question"
    | "organization_training_snapshot" = "platform_formal_question",
): AdminAiGenerationLocalContractDto {
  return {
    workspace: "content",
    generationKind: "paper",
    runtimeBridge: {
      visibleGeneratedContent: {
        structuredPreview: {
          kind: "paper_draft",
          parseStatus: "parsed",
        },
      },
    },
    paperAssembly: {
      status: "assembled",
      sourceDiagnostics: {
        role: "content_admin",
        platformQuestionCount:
          sourceKind === "platform_formal_question" ? 1 : 0,
        enterpriseQuestionCount:
          sourceKind === "organization_training_snapshot" ? 1 : 0,
        enterpriseSourceStatus: "not_applicable",
      },
      container: {
        title: "待审试卷草稿",
        profession: "marketing",
        level: 3,
        subject: "theory",
        requestedQuestionCount: 1,
        selectedQuestionCount: 1,
        sourceComposition: {
          platformFormalQuestionCount:
            sourceKind === "platform_formal_question" ? 1 : 0,
          enterpriseTrainingSnapshotCount:
            sourceKind === "organization_training_snapshot" ? 1 : 0,
        },
        matchQuality: "fully_matched",
        sections: [
          {
            sectionKey: "single_choice",
            title: "单选题",
            questionType: "single_choice",
            targetQuestionCount: 1,
            selectedQuestionCount: 1,
            selectedQuestions: [
              {
                questionPublicId: "platform_formal_question_public_a",
                sourceKind,
                matchTier: "exact",
                score: 1,
              },
            ],
            degradationSummary: {
              exactCount: 1,
              nearbyKnowledgeCount: 0,
              sameScopeCount: 0,
              missingCount: 0,
            },
          },
        ],
      },
      insufficiency: null,
    },
  } as unknown as AdminAiGenerationLocalContractDto;
}

describe("content admin formal reviewed draft payload", () => {
  it("preserves fill-blank and subjective scoring facts without type fallback", () => {
    const caseContract = createContentQuestionContract();
    const casePreview =
      caseContract.runtimeBridge.visibleGeneratedContent?.structuredPreview;
    if (casePreview?.kind === "question_set") {
      casePreview.draftSummaries[0] = {
        ...casePreview.draftSummaries[0],
        questionType: "case_analysis",
        questionOptions: [],
        scoringPoints: [
          { description: "reasoning", score: "2.0", sortOrder: 1 },
        ],
        fillBlankAnswers: [],
      };
    }
    expect(
      createContentAdminFormalReviewedDraftPayload({
        localContractSummary: caseContract,
        generationParameters,
        requestedAt: "2026-07-08T10:00:00.000Z",
      }),
    ).toMatchObject({
      questionType: "case_analysis",
      scoringMethod: "ai_scoring",
      questionOptions: [],
      scoringPoints: [{ description: "reasoning", score: "2.0", sortOrder: 1 }],
      fillBlankAnswers: [],
    });

    const fillBlankContract = createContentQuestionContract();
    const fillBlankPreview =
      fillBlankContract.runtimeBridge.visibleGeneratedContent
        ?.structuredPreview;
    if (fillBlankPreview?.kind === "question_set") {
      fillBlankPreview.draftSummaries[0] = {
        ...fillBlankPreview.draftSummaries[0],
        questionType: "fill_blank",
        questionOptions: [],
        scoringPoints: [],
        fillBlankAnswers: [
          {
            blankKey: "blank_1",
            standardAnswers: ["first"],
            score: "1.0",
            sortOrder: 1,
          },
          {
            blankKey: "blank_2",
            standardAnswers: ["second", "second alias"],
            score: "1.0",
            sortOrder: 2,
          },
        ],
      };
    }
    expect(
      createContentAdminFormalReviewedDraftPayload({
        localContractSummary: fillBlankContract,
        generationParameters,
        requestedAt: "2026-07-08T10:00:00.000Z",
      }),
    ).toMatchObject({
      questionType: "fill_blank",
      scoringMethod: "auto_match",
      questionOptions: [],
      scoringPoints: [],
      fillBlankAnswers: [
        { blankKey: "blank_1", standardAnswers: ["first"], sortOrder: 1 },
        {
          blankKey: "blank_2",
          standardAnswers: ["second", "second alias"],
          sortOrder: 2,
        },
      ],
    });
  });

  it.each([
    "single_choice",
    "multi_choice",
    "true_false",
    "fill_blank",
    "short_answer",
    "case_analysis",
    "calculation",
  ] as const)(
    "projects canonical %s drafts into a payload accepted by the authoritative question validator",
    (questionType) => {
      const contract = createContentQuestionContract();
      const preview =
        contract.runtimeBridge.visibleGeneratedContent?.structuredPreview;
      if (preview?.kind !== "question_set") {
        throw new Error("Expected a question_set fixture.");
      }

      preview.draftSummaries[0] = {
        ...preview.draftSummaries[0],
        questionType,
        questionOptions:
          questionType === "single_choice"
            ? [
                { optionLabel: "A", optionText: "first", isCorrect: true },
                { optionLabel: "B", optionText: "second", isCorrect: false },
              ]
            : questionType === "multi_choice"
              ? [
                  { optionLabel: "A", optionText: "first", isCorrect: true },
                  { optionLabel: "B", optionText: "second", isCorrect: true },
                  { optionLabel: "C", optionText: "third", isCorrect: false },
                ]
              : [],
        standardAnswer:
          questionType === "single_choice"
            ? "A"
            : questionType === "multi_choice"
              ? "A,B"
              : questionType === "true_false"
                ? "true"
                : "canonical answer",
        scoringPoints:
          questionType === "short_answer" ||
          questionType === "case_analysis" ||
          questionType === "calculation"
            ? [{ description: "review point", score: "2.0", sortOrder: 1 }]
            : [],
        fillBlankAnswers:
          questionType === "fill_blank"
            ? [
                {
                  blankKey: "blank_1",
                  standardAnswers: ["canonical answer"],
                  score: "2.0",
                  sortOrder: 1,
                },
              ]
            : [],
      };

      const payload = createContentAdminFormalReviewedDraftPayload({
        localContractSummary: contract,
        generationParameters,
        requestedAt: "2026-07-08T10:00:00.000Z",
      });

      expect(payload).not.toBeNull();
      expect(normalizeCreateQuestionInput(payload).success).toBe(true);
      if (questionType === "true_false") {
        expect(payload).toMatchObject({
          standardAnswerRichText: "A",
          questionOptions: [
            {
              label: "A",
              contentRichText: "正确",
              isCorrect: true,
              sortOrder: 1,
            },
            {
              label: "B",
              contentRichText: "错误",
              isCorrect: false,
              sortOrder: 2,
            },
          ],
        });
      }
    },
  );

  it.each([
    ["true", "A"],
    ["false", "B"],
  ] as const)(
    "projects canonical true_false answer %s into the formal A/B option contract",
    (providerAnswer, expectedLabel) => {
      const contract = createContentQuestionContract();
      const preview =
        contract.runtimeBridge.visibleGeneratedContent?.structuredPreview;
      if (preview?.kind !== "question_set") {
        throw new Error("Expected a question_set fixture.");
      }
      preview.draftSummaries[0] = {
        ...preview.draftSummaries[0],
        questionType: "true_false",
        questionOptions: [],
        standardAnswer: providerAnswer,
        scoringPoints: [],
        fillBlankAnswers: [],
      };

      const payload = createContentAdminFormalReviewedDraftPayload({
        localContractSummary: contract,
        generationParameters,
        requestedAt: "2026-07-08T10:00:00.000Z",
      });

      expect(payload).toMatchObject({
        standardAnswerRichText: expectedLabel,
        questionOptions: [
          { label: "A", isCorrect: providerAnswer === "true" },
          { label: "B", isCorrect: providerAnswer === "false" },
        ],
      });
      expect(normalizeCreateQuestionInput(payload).success).toBe(true);
    },
  );

  it.each([
    "multiple_choice",
    "subjective",
    "judge",
    "判断题",
    "SINGLE_CHOICE",
    " single_choice",
    "unknown",
  ])(
    "fails closed for non-canonical reviewed question type %j",
    (questionType) => {
      const contract = createContentQuestionContract();
      const preview =
        contract.runtimeBridge.visibleGeneratedContent?.structuredPreview;

      if (preview?.kind === "question_set") {
        preview.draftSummaries[0] = {
          ...preview.draftSummaries[0],
          questionType,
        };
      }

      expect(
        createContentAdminFormalReviewedDraftPayload({
          localContractSummary: contract,
          generationParameters,
          requestedAt: "2026-07-08T10:00:00.000Z",
        }),
      ).toBeNull();
    },
  );

  it("fails the whole formal payload instead of filtering a malformed option", () => {
    const contract = createContentQuestionContract();
    const preview =
      contract.runtimeBridge.visibleGeneratedContent?.structuredPreview;
    if (preview?.kind === "question_set") {
      preview.draftSummaries[0] = {
        ...preview.draftSummaries[0],
        questionOptions: [
          ...(preview.draftSummaries[0].questionOptions ?? []),
          { optionLabel: "", optionText: "malformed", isCorrect: false },
        ],
      };
    }

    expect(
      createContentAdminFormalReviewedDraftPayload({
        localContractSummary: contract,
        generationParameters,
        requestedAt: "2026-07-08T10:00:00.000Z",
      }),
    ).toBeNull();
  });

  it("carries strict difficulty and selected knowledge node public ids into formal question drafts", () => {
    const payload = createContentAdminFormalReviewedDraftPayload({
      localContractSummary: createContentQuestionContract(),
      generationParameters,
      requestedAt: "2026-07-08T10:00:00.000Z",
    });
    const serializedPayload = JSON.stringify(payload);

    expect(payload).toMatchObject({
      questionType: "single_choice",
      profession: "marketing",
      level: 3,
      subject: "theory",
      difficulty: "medium",
      knowledgeNodePublicIds: ["knowledge_node_public_selected"],
      tagPublicIds: [],
    });
    expect(serializedPayload).not.toContain("rawPrompt");
    expect(serializedPayload).not.toContain("rawOutput");
    expect(serializedPayload).not.toContain("providerPayload");
  });

  it.each(["balanced", "comprehensive"] as const)(
    "persists a server-owned unresolved generated-label candidate for %s mode",
    (knowledgeNodeMode) => {
      const contract = createContentQuestionContract();
      const preview =
        contract.runtimeBridge.visibleGeneratedContent?.structuredPreview;

      if (preview?.kind === "question_set") {
        preview.draftSummaries[0] = {
          ...preview.draftSummaries[0],
          knowledgeNodeLabels: ["营销基础", "客户需求", "营销基础"],
        };
      }

      const createSourceContentDigest = vi.fn(
        () =>
          "sha256:aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
      );
      const payload = createContentAdminFormalReviewedDraftPayload({
        localContractSummary: contract,
        generationParameters: {
          ...generationParameters,
          knowledgeNode: null,
          knowledgeNodeMode,
          knowledgeNodePublicIds: [],
          includeDescendants: false,
          knowledgeNodeSupplement: null,
        },
        requestedAt: "2026-07-08T10:00:00.000Z",
        sourceIdentity: {
          requestPublicId: "admin_ai_generation_request_public_candidate",
          resultPublicId: "admin_ai_generation_result_public_candidate",
          taskPublicId: "admin_ai_generation_task_public_candidate",
        },
        createSourceContentDigest,
      });

      expect(payload).toMatchObject({
        difficulty: "medium",
        knowledgeNodePublicIds: [],
        knowledgeNodeConfirmation: {
          schemaVersion: 1,
          status: "unresolved",
          generationMode: knowledgeNodeMode,
          requestPublicId: "admin_ai_generation_request_public_candidate",
          resultPublicId: "admin_ai_generation_result_public_candidate",
          taskPublicId: "admin_ai_generation_task_public_candidate",
          sourceContentDigest:
            "sha256:aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
          generatedLabels: ["营销基础", "客户需求"],
        },
      });
      expect(createSourceContentDigest).toHaveBeenCalledTimes(1);
    },
  );

  it("fails closed when generated labels collide after Unicode or case canonicalization", () => {
    const contract = createContentQuestionContract();
    const preview =
      contract.runtimeBridge.visibleGeneratedContent?.structuredPreview;

    if (preview?.kind === "question_set") {
      preview.draftSummaries[0] = {
        ...preview.draftSummaries[0],
        knowledgeNodeLabels: ["ＫＮＯＷＬＥＤＧＥ", "knowledge"],
      };
    }

    expect(
      createContentAdminFormalReviewedDraftPayload({
        localContractSummary: contract,
        generationParameters: {
          ...generationParameters,
          knowledgeNodeMode: "balanced",
          knowledgeNodePublicIds: [],
        },
        requestedAt: "2026-07-08T10:00:00.000Z",
        sourceIdentity: {
          requestPublicId: "admin_ai_generation_request_public_candidate",
          resultPublicId: "admin_ai_generation_result_public_candidate",
          taskPublicId: "admin_ai_generation_task_public_candidate",
        },
        createSourceContentDigest: () =>
          "sha256:aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
      }),
    ).toBeNull();
  });

  it.each([" 营销基础", "营销基础 ", "营销\n基础"])(
    "fails closed instead of rewriting or exposing an invalid generated label %j",
    (generatedLabel) => {
      const contract = createContentQuestionContract();
      const preview =
        contract.runtimeBridge.visibleGeneratedContent?.structuredPreview;

      if (preview?.kind === "question_set") {
        preview.draftSummaries[0] = {
          ...preview.draftSummaries[0],
          knowledgeNodeLabels: [generatedLabel],
        };
      }

      expect(
        createContentAdminFormalReviewedDraftPayload({
          localContractSummary: contract,
          generationParameters: {
            ...generationParameters,
            knowledgeNodeMode: "balanced",
            knowledgeNodePublicIds: [],
          },
          requestedAt: "2026-07-08T10:00:00.000Z",
          sourceIdentity: {
            requestPublicId: "admin_ai_generation_request_public_candidate",
            resultPublicId: "admin_ai_generation_result_public_candidate",
            taskPublicId: "admin_ai_generation_task_public_candidate",
          },
          createSourceContentDigest: () =>
            "sha256:aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
        }),
      ).toBeNull();
    },
  );

  it.each([null, "unknown"])(
    "rejects a formal question draft with non-canonical difficulty %s",
    (difficulty) => {
      const contract = createContentQuestionContract();
      const preview =
        contract.runtimeBridge.visibleGeneratedContent?.structuredPreview;

      if (preview?.kind === "question_set") {
        preview.draftSummaries[0] = {
          ...preview.draftSummaries[0],
          difficulty,
        };
      }

      expect(
        createContentAdminFormalReviewedDraftPayload({
          localContractSummary: contract,
          generationParameters,
          requestedAt: "2026-07-08T10:00:00.000Z",
        }),
      ).toBeNull();
    },
  );

  it("creates a formal paper draft payload from selected platform question references", () => {
    const payload = createContentAdminFormalReviewedDraftPayload({
      localContractSummary: createContentPaperContract(),
      generationParameters,
      requestedAt: "2026-07-09T10:00:00.000Z",
    });

    expect(payload).toMatchObject({
      name: "待审试卷草稿 2026-07-09 10:00",
      profession: "marketing",
      level: 3,
      subject: "theory",
      paperType: "mock_paper",
      sourceDescription: "content_ai_generation",
      paperSections: [
        {
          title: "单选题",
          sortOrder: 1,
          paperQuestions: [
            {
              questionPublicId: "platform_formal_question_public_a",
              companionQuestionDraft: null,
              score: "1.0",
              sortOrder: 1,
              questionGroup: null,
            },
          ],
        },
      ],
    });
  });

  it("does not create a content paper payload from non-platform question sources", () => {
    const payload = createContentAdminFormalReviewedDraftPayload({
      localContractSummary: createContentPaperContract(
        "organization_training_snapshot",
      ),
      generationParameters,
      requestedAt: "2026-07-09T10:00:00.000Z",
    });

    expect(payload).toBeNull();
  });
});
