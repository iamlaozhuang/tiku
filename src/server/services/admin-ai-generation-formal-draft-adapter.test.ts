import { describe, expect, it, vi } from "vitest";

import type { AdminAiGenerationFormalAdoptionDto } from "../contracts/admin-ai-generation-formal-adoption-contract";
import type {
  AdminAiGenerationFormalDraftPaperWriter,
  AdminAiGenerationFormalDraftQuestionWriter,
} from "../contracts/admin-ai-generation-formal-draft-adapter-contract";
import type {
  PaperDraftResultDto,
  PaperQuestionResultDto,
} from "../contracts/paper-draft-contract";
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

function createComposedPaperDraftPayload() {
  return {
    ...createPaperDraftPayload(),
    paperSections: [
      {
        title: "Reviewed paper_section A",
        description: null,
        sortOrder: 1,
        paperQuestions: [
          {
            questionPublicId: "question_formal_existing_377",
            companionQuestionDraft: null,
            score: "5.0",
            sortOrder: 1,
            questionGroup: null,
            rawGeneratedContent: "RAW PAPER QUESTION CONTENT MUST NOT RETURN",
          },
        ],
      },
    ],
  };
}

function createComposedPaperDraftPayloadWithCompanionQuestion() {
  return {
    ...createPaperDraftPayload(),
    paperSections: [
      {
        title: "Reviewed companion paper_section",
        description: "Reviewed section description",
        sortOrder: 1,
        paperQuestions: [
          {
            questionPublicId: null,
            companionQuestionDraft: createQuestionDraftPayload(),
            score: "10.0",
            sortOrder: 1,
            questionGroup: null,
          },
        ],
      },
    ],
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
    addQuestionToDraftPaper: vi.fn(async () => ({
      code: 0,
      message: "ok",
      data: {
        paperQuestion: {
          publicId: "paper_question_formal_draft_377",
          sourceQuestionPublicId: "question_formal_existing_377",
        },
      } as PaperQuestionResultDto,
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

    expect(questionWriter.createQuestion).toHaveBeenCalledWith(
      {
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
      },
      {
        actorPublicId: "admin_content_public_377",
      },
    );
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
    expect(paperWriter.createPaper).toHaveBeenCalledWith(
      {
        name: "Reviewed formal paper draft",
        profession: "monopoly",
        level: 3,
        subject: "theory",
        paperType: "mock_paper",
        year: 2026,
        source: "AI reviewed adoption",
        durationMinute: 120,
        totalScore: "100.0",
      },
      {
        actorPublicId: "admin_content_public_377",
      },
    );
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

  it("composes a formal paper draft with paper_section and paper_question entries from existing formal question references", async () => {
    const questionWriter = createQuestionWriter();
    const paperWriter = createPaperWriter();
    const service = createAdminAiGenerationFormalDraftAdapterService({
      paperWriter,
      questionWriter,
    });
    const reviewedDraft = createComposedPaperDraftPayload();

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
      reviewedDraft,
      targetType: "paper",
    });
    const serializedResponse = JSON.stringify(response);

    expect(paperWriter.createPaper).toHaveBeenCalledWith(
      {
        name: "Reviewed formal paper draft",
        profession: "monopoly",
        level: 3,
        subject: "theory",
        paperType: "mock_paper",
        year: 2026,
        source: "AI reviewed adoption",
        durationMinute: 120,
        totalScore: "100.0",
      },
      {
        actorPublicId: "admin_content_public_377",
      },
    );
    expect(questionWriter.createQuestion).not.toHaveBeenCalled();
    expect(paperWriter.addQuestionToDraftPaper).toHaveBeenCalledWith(
      "paper_formal_draft_377",
      {
        questionPublicId: "question_formal_existing_377",
        score: "5.0",
        sortOrder: 1,
        paperSection: {
          title: "Reviewed paper_section A",
          description: null,
          sortOrder: 1,
        },
        questionGroup: null,
      },
    );
    expect(response.data).toMatchObject({
      targetType: "paper",
      formalTargetWriteStatus: "draft_created",
      formalPaperPublicId: "paper_formal_draft_377",
      paperCompositionStatus: "composed",
      paperSectionCount: 1,
      paperQuestionCount: 1,
      companionQuestionDraftCount: 0,
      redactionStatus: "redacted",
    });
    expect(serializedResponse).not.toContain(
      "RAW PAPER QUESTION CONTENT MUST NOT RETURN",
    );
  });

  it("creates companion formal question drafts before attaching them to the composed formal paper draft", async () => {
    const questionWriter = createQuestionWriter();
    const paperWriter = createPaperWriter();
    vi.mocked(paperWriter.addQuestionToDraftPaper!).mockResolvedValueOnce({
      code: 0,
      message: "ok",
      data: {
        paperQuestion: {
          publicId: "paper_question_companion_377",
          sourceQuestionPublicId: "question_formal_draft_377",
        },
      } as PaperQuestionResultDto,
    });
    const service = createAdminAiGenerationFormalDraftAdapterService({
      paperWriter,
      questionWriter,
    });
    const reviewedDraft =
      createComposedPaperDraftPayloadWithCompanionQuestion();

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
      reviewedDraft,
      targetType: "paper",
    });
    const serializedResponse = JSON.stringify(response);

    expect(questionWriter.createQuestion).toHaveBeenCalledWith(
      {
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
        questionOptions:
          reviewedDraft.paperSections[0]?.paperQuestions[0]
            ?.companionQuestionDraft?.questionOptions,
        scoringPoints: [],
        fillBlankAnswers: [],
        knowledgeNodePublicIds: [],
        tagPublicIds: [],
      },
      {
        actorPublicId: "admin_content_public_377",
      },
    );
    expect(paperWriter.addQuestionToDraftPaper).toHaveBeenCalledWith(
      "paper_formal_draft_377",
      {
        questionPublicId: "question_formal_draft_377",
        score: "10.0",
        sortOrder: 1,
        paperSection: {
          title: "Reviewed companion paper_section",
          description: "Reviewed section description",
          sortOrder: 1,
        },
        questionGroup: null,
      },
    );
    expect(response.data).toMatchObject({
      paperCompositionStatus: "composed",
      paperSectionCount: 1,
      paperQuestionCount: 1,
      companionQuestionDraftCount: 1,
    });
    expect(serializedResponse).not.toContain(
      "RAW GENERATED CONTENT MUST NOT REACH WRITER",
    );
  });

  it("does not claim paper draft creation when paper_question composition fails", async () => {
    const paperWriter = createPaperWriter();
    vi.mocked(paperWriter.addQuestionToDraftPaper!).mockResolvedValueOnce({
      code: 422203,
      message: "Invalid paper input.",
      data: null,
    });
    const service = createAdminAiGenerationFormalDraftAdapterService({
      paperWriter,
      questionWriter: createQuestionWriter(),
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
      reviewedDraft: createComposedPaperDraftPayload(),
      targetType: "paper",
    });

    expect(response).toEqual({
      code: 502016,
      message: "Formal draft writer failed.",
      data: null,
    });
  });

  it("uses the current route writer context when reused adoption metadata has a stale reviewer", async () => {
    const questionWriter = createQuestionWriter();
    const paperWriter = createPaperWriter();
    const service = createAdminAiGenerationFormalDraftAdapterService({
      paperWriter,
      questionWriter,
    });
    const draftPayload = createQuestionDraftPayload();
    const adoption = createAdoption({
      review: {
        ...createAdoption().review,
        reviewerPublicId: "admin_content_public_stale_377",
      },
    });

    const response = await service.createFormalDraft({
      adoption,
      reviewedDraft: draftPayload,
      targetType: "question",
      writerContext: {
        actorPublicId: "admin_content_public_current_route_377",
      },
    });

    expect(response.code).toBe(0);
    expect(questionWriter.createQuestion).toHaveBeenCalledWith(
      expect.objectContaining({
        stemRichText: "Reviewed formal question stem",
      }),
      {
        actorPublicId: "admin_content_public_current_route_377",
      },
    );
    expect(paperWriter.createPaper).not.toHaveBeenCalled();
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
