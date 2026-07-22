import { describe, expect, it } from "vitest";

import type { AdminAiGenerationLocalContractDto } from "@/server/contracts/admin-ai-generation-local-contract";
import type { AiGenerationRouteIntegratedGenerationParameters } from "@/server/contracts/route-integrated-provider-execution-contract";
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

  it("rejects generated labels that have not been resolved to selected knowledge node public ids", () => {
    const payload = createContentAdminFormalReviewedDraftPayload({
      localContractSummary: createContentQuestionContract(),
      generationParameters: {
        ...generationParameters,
        knowledgeNode: null,
        knowledgeNodeMode: "balanced",
        knowledgeNodePublicIds: [],
        includeDescendants: false,
        knowledgeNodeSupplement: null,
      },
      requestedAt: "2026-07-08T10:00:00.000Z",
    });

    expect(payload).toBeNull();
  });

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
