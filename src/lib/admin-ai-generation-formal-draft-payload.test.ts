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

describe("content admin formal reviewed draft payload", () => {
  it("carries selected knowledge node public ids into formal question drafts", () => {
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
      knowledgeNodePublicIds: ["knowledge_node_public_selected"],
      tagPublicIds: [],
    });
    expect(serializedPayload).not.toContain("rawPrompt");
    expect(serializedPayload).not.toContain("rawOutput");
    expect(serializedPayload).not.toContain("providerPayload");
  });

  it("keeps balanced submissions without selected ids empty", () => {
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

    expect(payload).toMatchObject({
      knowledgeNodePublicIds: [],
    });
  });
});
