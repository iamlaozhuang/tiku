import { describe, expect, it, vi } from "vitest";

import type { AdminAiGenerationFormalAdoptionDto } from "../contracts/admin-ai-generation-formal-adoption-contract";
import type {
  AdminAiGenerationFormalDraftPaperWriter,
  AdminAiGenerationFormalDraftQuestionWriter,
} from "../contracts/admin-ai-generation-formal-draft-adapter-contract";
import type { PaperDraftResultDto } from "../contracts/paper-draft-contract";
import type { QuestionResultDto } from "../contracts/question-contract";
import { createAdminAiGenerationFormalDraftAdapterService } from "./admin-ai-generation-formal-draft-adapter";

function createAdoption(
  overrides: Partial<AdminAiGenerationFormalAdoptionDto> = {},
): AdminAiGenerationFormalAdoptionDto {
  return {
    adoptionPublicId: "admin_ai_formal_adoption_public_377",
    sourceReference: {
      resultPublicId: "admin_ai_generation_result_public_377",
      taskPublicId: "admin_ai_generation_task_public_377",
      requestPublicId: "admin_ai_generation_request_public_377",
      workspace: "content",
      generationKind: "question",
      ownerType: "platform",
      ownerPublicId: "platform_content_review_pool",
      organizationPublicId: null,
    },
    targetReference: {
      targetType: "question",
      targetDomain: "platform_formal_content",
      formalTargetWriteStatus: "blocked_without_follow_up_task",
      formalQuestionPublicId: null,
      formalPaperPublicId: null,
    },
    review: {
      reviewStatus: "approved_for_formal_adoption",
      reviewDecision: "approved",
      reviewerPublicId: "admin_content_public_377",
      reviewedAt: "2026-06-26T16:40:00.000Z",
    },
    sourceSummary: {
      contentDigest: "sha256:admin_ai_generation_result_377",
      contentPreviewMasked: "masked formal adoption source preview",
      evidenceStatus: "weak",
      citationCount: 1,
      aiCallLogPublicId: null,
      redactionStatus: "redacted",
    },
    audit: {
      actionType: "admin_ai_generation_result.formal_adoption.approve",
      targetResourceType: "admin_ai_generation_result",
      targetPublicId: "admin_ai_generation_result_public_377",
      redactionStatus: "redacted",
    },
    redactionStatus: "redacted",
    ...overrides,
  };
}

function createQuestionDraftPayload() {
  return {
    questionType: "single_choice",
    profession: "monopoly",
    level: 3,
    subject: "theory",
    stemRichText: "Reviewed formal question stem",
    analysisRichText: "Reviewed formal analysis",
    standardAnswerRichText: "A",
    multiChoiceRule: "all_correct_only",
    scoringMethod: "auto_match",
    materialPublicId: null,
    questionOptions: [
      {
        label: "A",
        contentRichText: "Reviewed option A",
        isCorrect: true,
        sortOrder: 1,
      },
      {
        label: "B",
        contentRichText: "Reviewed option B",
        isCorrect: false,
        sortOrder: 2,
      },
    ],
    scoringPoints: [],
    fillBlankAnswers: [],
    knowledgeNodePublicIds: [],
    tagPublicIds: [],
    rawGeneratedContent: "RAW GENERATED CONTENT MUST NOT REACH WRITER",
  };
}

function createPaperDraftPayload() {
  return {
    name: "Reviewed formal paper draft",
    profession: "monopoly",
    level: 3,
    subject: "theory",
    paperType: "mock_paper",
    year: 2026,
    source: "AI reviewed adoption",
    durationMinute: 120,
    totalScore: "100.0",
    rawGeneratedContent: "RAW PAPER CONTENT MUST NOT REACH WRITER",
  };
}

function createQuestionWriter(): AdminAiGenerationFormalDraftQuestionWriter {
  return {
    createQuestion: vi.fn(async () => ({
      code: 0,
      message: "ok",
      data: {
        question: {
          publicId: "question_formal_draft_377",
          stemRichText: "FULL FORMAL QUESTION CONTENT MUST NOT RETURN",
        },
      } as QuestionResultDto,
    })),
  };
}

function createPaperWriter(): AdminAiGenerationFormalDraftPaperWriter {
  return {
    createPaper: vi.fn(async () => ({
      code: 0,
      message: "ok",
      data: {
        paper: {
          publicId: "paper_formal_draft_377",
          name: "FULL FORMAL PAPER CONTENT MUST NOT RETURN",
        },
      } as PaperDraftResultDto,
    })),
  };
}

describe("admin AI generation formal draft adapter service", () => {
  it("creates a formal question draft through the existing question writer and returns only redacted draft identifiers", async () => {
    const questionWriter = createQuestionWriter();
    const paperWriter = createPaperWriter();
    const service = createAdminAiGenerationFormalDraftAdapterService({
      paperWriter,
      questionWriter,
    });
    const draftPayload = createQuestionDraftPayload();

    const response = await service.createFormalDraft({
      adoption: createAdoption(),
      reviewedDraft: draftPayload,
      targetType: "question",
    });
    const serializedResponse = JSON.stringify(response);

    expect(questionWriter.createQuestion).toHaveBeenCalledWith({
      questionType: "single_choice",
      profession: "monopoly",
      level: 3,
      subject: "theory",
      stemRichText: "Reviewed formal question stem",
      analysisRichText: "Reviewed formal analysis",
      standardAnswerRichText: "A",
      multiChoiceRule: "all_correct_only",
      scoringMethod: "auto_match",
      materialPublicId: null,
      questionOptions: draftPayload.questionOptions,
      scoringPoints: [],
      fillBlankAnswers: [],
      knowledgeNodePublicIds: [],
      tagPublicIds: [],
    });
    expect(paperWriter.createPaper).not.toHaveBeenCalled();
    expect(response).toEqual({
      code: 0,
      message: "ok",
      data: {
        adoptionPublicId: "admin_ai_formal_adoption_public_377",
        sourceResultPublicId: "admin_ai_generation_result_public_377",
        targetType: "question",
        formalTargetWriteStatus: "draft_created",
        formalQuestionPublicId: "question_formal_draft_377",
        formalPaperPublicId: null,
        redactionStatus: "redacted",
      },
    });
    expect(serializedResponse).not.toContain(draftPayload.rawGeneratedContent);
    expect(serializedResponse).not.toContain(
      "FULL FORMAL QUESTION CONTENT MUST NOT RETURN",
    );
  });

  it("creates a formal paper draft through the existing paper writer and returns only redacted draft identifiers", async () => {
    const questionWriter = createQuestionWriter();
    const paperWriter = createPaperWriter();
    const service = createAdminAiGenerationFormalDraftAdapterService({
      paperWriter,
      questionWriter,
    });

    const response = await service.createFormalDraft({
      adoption: createAdoption({
        sourceReference: {
          ...createAdoption().sourceReference,
          generationKind: "paper",
        },
        targetReference: {
          ...createAdoption().targetReference,
          targetType: "paper",
        },
      }),
      reviewedDraft: createPaperDraftPayload(),
      targetType: "paper",
    });
    const serializedResponse = JSON.stringify(response);

    expect(questionWriter.createQuestion).not.toHaveBeenCalled();
    expect(paperWriter.createPaper).toHaveBeenCalledWith({
      name: "Reviewed formal paper draft",
      profession: "monopoly",
      level: 3,
      subject: "theory",
      paperType: "mock_paper",
      year: 2026,
      source: "AI reviewed adoption",
      durationMinute: 120,
      totalScore: "100.0",
    });
    expect(response.data).toMatchObject({
      targetType: "paper",
      formalTargetWriteStatus: "draft_created",
      formalQuestionPublicId: null,
      formalPaperPublicId: "paper_formal_draft_377",
      redactionStatus: "redacted",
    });
    expect(serializedResponse).not.toContain(
      "RAW PAPER CONTENT MUST NOT REACH WRITER",
    );
    expect(serializedResponse).not.toContain(
      "FULL FORMAL PAPER CONTENT MUST NOT RETURN",
    );
  });

  it("rejects unsafe or target-mismatched adoption metadata before calling formal draft writers", async () => {
    const questionWriter = createQuestionWriter();
    const paperWriter = createPaperWriter();
    const service = createAdminAiGenerationFormalDraftAdapterService({
      paperWriter,
      questionWriter,
    });

    const response = await service.createFormalDraft({
      adoption: createAdoption({
        sourceReference: {
          ...createAdoption().sourceReference,
          ownerType: "organization",
          organizationPublicId: "organization_public_377",
          workspace: "organization",
        },
      }),
      reviewedDraft: createQuestionDraftPayload(),
      targetType: "question",
    });

    expect(response).toEqual({
      code: 409016,
      message:
        "Admin AI generation formal adoption is not eligible for draft creation.",
      data: null,
    });
    expect(questionWriter.createQuestion).not.toHaveBeenCalled();
    expect(paperWriter.createPaper).not.toHaveBeenCalled();
  });

  it("does not claim draft creation when the formal writer rejects the reviewed payload", async () => {
    const questionWriter = createQuestionWriter();
    vi.mocked(questionWriter.createQuestion).mockResolvedValueOnce({
      code: 422202,
      message: "Invalid question input.",
      data: null,
    });
    const service = createAdminAiGenerationFormalDraftAdapterService({
      paperWriter: createPaperWriter(),
      questionWriter,
    });

    const response = await service.createFormalDraft({
      adoption: createAdoption(),
      reviewedDraft: createQuestionDraftPayload(),
      targetType: "question",
    });

    expect(response).toEqual({
      code: 502016,
      message: "Formal draft writer failed.",
      data: null,
    });
  });
});
