import { describe, expect, it } from "vitest";

import type {
  EmployeeOrganizationTrainingAnswerDto,
  OrganizationTrainingAdminSummaryDto,
  OrganizationTrainingDraftDto,
  OrganizationTrainingPublishedVersionDto,
} from "../contracts/organization-training-contract";
import {
  organizationTrainingAnswerStatusValues,
  organizationTrainingDeferredQuestionTypeValues,
  organizationTrainingQuestionTypeValues,
  organizationTrainingSensitiveAdminSummaryFieldValues,
} from "../models/organization-training";
import {
  normalizeOrganizationTrainingEmployeeAnswerDraftInput,
  normalizeOrganizationTrainingEmployeeAnswerSubmitInput,
  normalizeOrganizationTrainingCopyToNewDraftInput,
  normalizeOrganizationTrainingCopyToNewDraftRouteInput,
  normalizeOrganizationTrainingManualDraftInput,
  normalizeOrganizationTrainingPublishInput,
  normalizeOrganizationTrainingSourceContextInput,
  normalizeOrganizationTrainingTakedownInput,
} from "./organization-training";

describe("organization training contract and validator scaffold", () => {
  it("keeps employee answer statuses aligned with the organization training plan", () => {
    expect(organizationTrainingAnswerStatusValues).toEqual([
      "in_progress",
      "submitted",
      "read_only",
    ]);
  });

  it("normalizes publish input with first-release question types and null optional fields", () => {
    expect(organizationTrainingQuestionTypeValues).toEqual([
      "single_choice",
      "multi_choice",
      "true_false",
      "short_answer",
    ]);

    expect(
      normalizeOrganizationTrainingPublishInput({
        draftPublicId: " training_draft_public_123 ",
        organizationPublicId: " organization_public_123 ",
        authorizationPublicId: " org_auth_public_123 ",
        profession: "monopoly",
        level: 3,
        subject: "theory",
        title: " Safety training ",
        description: "",
        questions: [
          {
            publicId: " question_one_public_123 ",
            questionType: "single_choice",
            score: 2,
            standardAnswer: " A ",
            analysisSummary: " option rationale ",
            evidenceStatus: "sufficient",
            citationCount: 2,
          },
          {
            publicId: " question_two_public_123 ",
            questionType: "multi_choice",
            score: 3,
            standardAnswer: " A,B ",
            analysisSummary: " combination rationale ",
            evidenceStatus: "weak",
            citationCount: 1,
          },
          {
            publicId: " question_three_public_123 ",
            questionType: "true_false",
            score: 1,
            standardAnswer: " true ",
            analysisSummary: " true_false rationale ",
            evidenceStatus: "none",
            citationCount: 0,
          },
          {
            publicId: " question_four_public_123 ",
            questionType: "short_answer",
            score: 4,
            standardAnswer: " expected answer summary ",
            analysisSummary: " scoring rationale ",
            evidenceStatus: "sufficient",
            citationCount: 3,
          },
        ],
        publishScopeOrganizationPublicIds: [
          " organization_city_public_123 ",
          "organization_city_public_123",
          "organization_district_public_456",
        ],
        capabilityContext: {
          effectiveEdition: "advanced",
          authorizationSource: "org_auth",
          canCreateOrganizationTraining: true,
        },
      }),
    ).toEqual({
      success: true,
      value: {
        draftPublicId: "training_draft_public_123",
        organizationPublicId: "organization_public_123",
        authorizationPublicId: "org_auth_public_123",
        profession: "monopoly",
        level: 3,
        subject: "theory",
        title: "Safety training",
        description: null,
        questions: [
          {
            publicId: "question_one_public_123",
            questionType: "single_choice",
            score: 2,
            standardAnswer: "A",
            analysisSummary: "option rationale",
            evidenceStatus: "sufficient",
            citationCount: 2,
          },
          {
            publicId: "question_two_public_123",
            questionType: "multi_choice",
            score: 3,
            standardAnswer: "A,B",
            analysisSummary: "combination rationale",
            evidenceStatus: "weak",
            citationCount: 1,
          },
          {
            publicId: "question_three_public_123",
            questionType: "true_false",
            score: 1,
            standardAnswer: "true",
            analysisSummary: "true_false rationale",
            evidenceStatus: "none",
            citationCount: 0,
          },
          {
            publicId: "question_four_public_123",
            questionType: "short_answer",
            score: 4,
            standardAnswer: "expected answer summary",
            analysisSummary: "scoring rationale",
            evidenceStatus: "sufficient",
            citationCount: 3,
          },
        ],
        publishScopeOrganizationPublicIds: [
          "organization_city_public_123",
          "organization_district_public_456",
        ],
        questionCount: 4,
        totalScore: 10,
        questionTypeSummary: {
          singleChoice: 1,
          multiChoice: 1,
          trueFalse: 1,
          shortAnswer: 1,
        },
        capabilityContext: {
          effectiveEdition: "advanced",
          authorizationSource: "org_auth",
          canCreateOrganizationTraining: true,
        },
      },
    });

    expect(
      normalizeOrganizationTrainingManualDraftInput({
        organizationPublicId: " organization_public_123 ",
        authorizationPublicId: " org_auth_public_123 ",
        sourceTaskPublicId: " admin_ai_generation_task_public_123 ",
        profession: "monopoly",
        level: 3,
        subject: "theory",
        title: " AI copied training ",
        description: " AI source ",
        capabilityContext: {
          effectiveEdition: "advanced",
          authorizationSource: "org_auth",
          canCreateOrganizationTraining: true,
        },
      }),
    ).toEqual({
      success: true,
      value: {
        organizationPublicId: "organization_public_123",
        authorizationPublicId: "org_auth_public_123",
        sourceTaskPublicId: "admin_ai_generation_task_public_123",
        profession: "monopoly",
        level: 3,
        subject: "theory",
        title: "AI copied training",
        description: "AI source",
        capabilityContext: {
          effectiveEdition: "advanced",
          authorizationSource: "org_auth",
          canCreateOrganizationTraining: true,
        },
      },
    });
  });

  it("rejects deferred question types and incomplete publish confirmation", () => {
    expect(organizationTrainingDeferredQuestionTypeValues).toEqual([
      "fill_blank",
      "case_analysis",
      "calculation",
    ]);

    expect(
      normalizeOrganizationTrainingPublishInput({
        draftPublicId: "training_draft_public_123",
        organizationPublicId: "organization_public_123",
        authorizationPublicId: "org_auth_public_123",
        sourceTaskPublicId: null,
        profession: "monopoly",
        level: 3,
        subject: "theory",
        title: "Safety training",
        questions: [
          {
            publicId: "question_one_public_123",
            questionType: "fill_blank",
            score: 2,
            standardAnswer: "answer",
            analysisSummary: "analysis",
            evidenceStatus: "sufficient",
            citationCount: 0,
          },
        ],
        publishScopeOrganizationPublicIds: ["organization_city_public_123"],
        capabilityContext: {
          effectiveEdition: "advanced",
          authorizationSource: "org_auth",
          canCreateOrganizationTraining: true,
        },
      }),
    ).toEqual({
      success: false,
      message: "Invalid organization training publish input.",
    });

    expect(
      normalizeOrganizationTrainingPublishInput({
        draftPublicId: "training_draft_public_123",
        organizationPublicId: "organization_public_123",
        authorizationPublicId: "org_auth_public_123",
        profession: "monopoly",
        level: 3,
        subject: "theory",
        title: "",
        questions: [],
        publishScopeOrganizationPublicIds: [],
        capabilityContext: {
          effectiveEdition: "standard",
          authorizationSource: "personal_auth",
          canCreateOrganizationTraining: false,
        },
      }).success,
    ).toBe(false);
  });

  it("normalizes takedown and copy-to-new-draft input while rejecting empty commands", () => {
    expect(
      normalizeOrganizationTrainingTakedownInput({
        versionPublicId: " training_version_public_123 ",
        takedownReason: " outdated content ",
      }),
    ).toEqual({
      success: true,
      value: {
        versionPublicId: "training_version_public_123",
        takedownReason: "outdated content",
      },
    });

    expect(
      normalizeOrganizationTrainingCopyToNewDraftInput({
        sourceVersionPublicId: " training_version_public_123 ",
        newDraftTitle: " Refreshed training ",
      }),
    ).toEqual({
      success: true,
      value: {
        sourceVersionPublicId: "training_version_public_123",
        newDraftTitle: "Refreshed training",
      },
    });

    expect(
      normalizeOrganizationTrainingTakedownInput({
        versionPublicId: "training_version_public_123",
        takedownReason: "",
      }).success,
    ).toBe(false);

    expect(
      normalizeOrganizationTrainingCopyToNewDraftInput({
        sourceVersionPublicId: "",
        newDraftTitle: "Refreshed training",
      }).success,
    ).toBe(false);
  });

  it("normalizes manual draft route input with org_auth capability context", () => {
    expect(
      normalizeOrganizationTrainingManualDraftInput({
        organizationPublicId: " organization_public_123 ",
        authorizationPublicId: " org_auth_public_123 ",
        profession: "monopoly",
        level: 3,
        subject: "theory",
        title: " Safety training ",
        description: "",
        capabilityContext: {
          effectiveEdition: "advanced",
          authorizationSource: "org_auth",
          canCreateOrganizationTraining: true,
        },
      }),
    ).toEqual({
      success: true,
      value: {
        organizationPublicId: "organization_public_123",
        authorizationPublicId: "org_auth_public_123",
        sourceTaskPublicId: null,
        profession: "monopoly",
        level: 3,
        subject: "theory",
        title: "Safety training",
        description: null,
        capabilityContext: {
          effectiveEdition: "advanced",
          authorizationSource: "org_auth",
          canCreateOrganizationTraining: true,
        },
      },
    });

    expect(
      normalizeOrganizationTrainingManualDraftInput({
        organizationPublicId: "organization_public_123",
        authorizationPublicId: "org_auth_public_123",
        profession: "monopoly",
        level: 3,
        subject: "theory",
        title: "Safety training",
        questions: [
          {
            standardAnswer: "LEAK_STANDARD_ANSWER",
          },
        ],
        capabilityContext: {
          effectiveEdition: "advanced",
          authorizationSource: "org_auth",
          canCreateOrganizationTraining: true,
        },
      }).success,
    ).toBe(false);
  });

  it("normalizes copy-to-new-draft route input with authorization public id", () => {
    expect(
      normalizeOrganizationTrainingCopyToNewDraftRouteInput({
        sourceVersionPublicId: " training_version_public_123 ",
        authorizationPublicId: " org_auth_public_123 ",
        newDraftTitle: " Refreshed training ",
      }),
    ).toEqual({
      success: true,
      value: {
        sourceVersionPublicId: "training_version_public_123",
        authorizationPublicId: "org_auth_public_123",
        newDraftTitle: "Refreshed training",
      },
    });

    expect(
      normalizeOrganizationTrainingCopyToNewDraftRouteInput({
        sourceVersionPublicId: "training_version_public_123",
        newDraftTitle: "Refreshed training",
      }).success,
    ).toBe(false);
  });

  it("normalizes first-release source-context route input as metadata-only paper references", () => {
    expect(
      normalizeOrganizationTrainingSourceContextInput({
        draftPublicId: " training_draft_public_123 ",
        organizationPublicId: " organization_public_123 ",
        authorizationPublicId: " org_auth_public_123 ",
        profession: "monopoly",
        level: 3,
        capabilityContext: {
          effectiveEdition: "advanced",
          authorizationSource: "org_auth",
          canCreateOrganizationTraining: true,
        },
        sourceContexts: [
          {
            sourceType: "paper",
            sourcePublicId: " paper_public_123 ",
            title: " Formal paper reference ",
            profession: "monopoly",
            level: 3,
            subject: "theory",
            questionCount: 20,
            totalScore: 100,
            sourceStatus: "published",
          },
        ],
      }),
    ).toEqual({
      success: true,
      value: {
        draftPublicId: "training_draft_public_123",
        organizationPublicId: "organization_public_123",
        authorizationPublicId: "org_auth_public_123",
        profession: "monopoly",
        level: 3,
        capabilityContext: {
          effectiveEdition: "advanced",
          authorizationSource: "org_auth",
          canCreateOrganizationTraining: true,
        },
        sourceContexts: [
          {
            sourceType: "paper",
            sourcePublicId: "paper_public_123",
            title: "Formal paper reference",
            profession: "monopoly",
            level: 3,
            subject: "theory",
            questionCount: 20,
            totalScore: 100,
            sourceStatus: "published",
          },
        ],
      },
    });

    expect(
      normalizeOrganizationTrainingSourceContextInput({
        draftPublicId: "training_draft_public_123",
        organizationPublicId: "organization_public_123",
        authorizationPublicId: "org_auth_public_123",
        profession: "monopoly",
        level: 3,
        capabilityContext: {
          effectiveEdition: "advanced",
          authorizationSource: "org_auth",
          canCreateOrganizationTraining: true,
        },
        sourceContexts: [
          {
            sourceType: "mock_exam",
            sourcePublicId: "mock_exam_public_456",
            title: "Mock exam reference",
            profession: "monopoly",
            level: 3,
            subject: "theory",
            questionCount: 10,
            totalScore: 50,
            sourceStatus: "published",
          },
        ],
      }),
    ).toEqual({
      success: false,
      message: "Invalid organization training source context input.",
    });

    const invalidSourceContextResult =
      normalizeOrganizationTrainingSourceContextInput({
        draftPublicId: "training_draft_public_123",
        organizationPublicId: "organization_public_123",
        authorizationPublicId: "org_auth_public_123",
        profession: "monopoly",
        level: 3,
        capabilityContext: {
          effectiveEdition: "advanced",
          authorizationSource: "org_auth",
          canCreateOrganizationTraining: true,
        },
        sourceContexts: [
          {
            sourceType: "paper",
            sourcePublicId: "paper_public_123",
            title: "Formal paper reference",
            profession: "monopoly",
            level: 3,
            subject: "theory",
            questionCount: 20,
            totalScore: 100,
            sourceStatus: "published",
            standardAnswer: "LEAK_STANDARD_ANSWER",
          },
        ],
      });

    expect(invalidSourceContextResult.success).toBe(false);
    expect(JSON.stringify(invalidSourceContextResult)).not.toContain(
      "LEAK_STANDARD_ANSWER",
    );

    const invalidOrganizationAiSourceContextResult =
      normalizeOrganizationTrainingSourceContextInput({
        draftPublicId: "training_draft_public_123",
        organizationPublicId: "organization_public_123",
        authorizationPublicId: "org_auth_public_123",
        profession: "monopoly",
        level: 3,
        capabilityContext: {
          effectiveEdition: "advanced",
          authorizationSource: "org_auth",
          canCreateOrganizationTraining: true,
        },
        sourceContexts: [
          {
            sourceType: "organization_ai_result",
            sourcePublicId: "admin_ai_generation_result_public_123",
            title: "Organization AI result reference",
            profession: "monopoly",
            level: 3,
            subject: "theory",
            questionCount: 10,
            totalScore: 10,
            sourceStatus: "ai_generated_draft_sufficient_evidence",
            analysis: "LEAK_ANALYSIS",
          },
        ],
      });

    expect(invalidOrganizationAiSourceContextResult.success).toBe(false);
    expect(
      JSON.stringify(invalidOrganizationAiSourceContextResult),
    ).not.toContain("LEAK_ANALYSIS");
  });

  it("normalizes employee answer draft and submit metadata while rejecting raw answer payloads", () => {
    expect(
      normalizeOrganizationTrainingEmployeeAnswerDraftInput({
        trainingVersionPublicId: " training_version_public_123 ",
        answeredQuestionCount: 2,
      }),
    ).toEqual({
      success: true,
      value: {
        trainingVersionPublicId: "training_version_public_123",
        answeredQuestionCount: 2,
      },
    });

    expect(
      normalizeOrganizationTrainingEmployeeAnswerSubmitInput({
        trainingVersionPublicId: " training_version_public_123 ",
        answeredQuestionCount: 2,
        scoreSummary: {
          score: 4,
          totalScore: 5,
        },
      }),
    ).toEqual({
      success: true,
      value: {
        trainingVersionPublicId: "training_version_public_123",
        answeredQuestionCount: 2,
        scoreSummary: {
          score: 4,
          totalScore: 5,
        },
      },
    });

    const rawAnswer = "redacted";
    const invalidDraftResult =
      normalizeOrganizationTrainingEmployeeAnswerDraftInput({
        trainingVersionPublicId: "training_version_public_123",
        answeredQuestionCount: 2,
        rawAnswer,
      });
    const invalidSubmitResult =
      normalizeOrganizationTrainingEmployeeAnswerSubmitInput({
        trainingVersionPublicId: "training_version_public_123",
        answeredQuestionCount: 2,
        scoreSummary: {
          score: 4,
          totalScore: 5,
        },
        providerPayload: rawAnswer,
      });

    expect(invalidDraftResult).toEqual({
      success: false,
      message: "Invalid organization training employee answer draft input.",
    });
    expect(invalidSubmitResult).toEqual({
      success: false,
      message: "Invalid organization training employee answer submit input.",
    });
    expect(JSON.stringify(invalidDraftResult)).not.toContain(rawAnswer);
    expect(JSON.stringify(invalidSubmitResult)).not.toContain(rawAnswer);
  });

  it("keeps DTO shapes public-id based and summary-only for admin visibility", () => {
    const draftDto: OrganizationTrainingDraftDto = {
      publicId: "training_draft_public_123",
      sourceTaskPublicId: null,
      organizationPublicId: "organization_public_123",
      authorizationSource: "org_auth",
      authorizationPublicId: "org_auth_public_123",
      profession: "monopoly",
      level: 3,
      subject: "theory",
      title: "Safety training",
      description: null,
      questionCount: 4,
      totalScore: 10,
      questionTypeSummary: {
        singleChoice: 1,
        multiChoice: 1,
        trueFalse: 1,
        shortAnswer: 1,
      },
      evidenceStatus: "sufficient",
      validationStatus: "valid",
      retentionStatus: "active",
      createdAt: "2026-06-15T18:12:40.000Z",
      expiresAt: null,
    };

    const versionDto: OrganizationTrainingPublishedVersionDto = {
      publicId: "training_version_public_123",
      draftPublicId: draftDto.publicId,
      versionNumber: 1,
      organizationPublicId: draftDto.organizationPublicId,
      publishScopeSnapshot: {
        organizationPublicIds: ["organization_public_123"],
        capturedAt: "2026-06-15T18:12:40.000Z",
      },
      profession: "monopoly",
      level: 3,
      subject: "theory",
      title: "Safety training",
      description: null,
      questionCount: 4,
      totalScore: 10,
      status: "published",
      publishedAt: "2026-06-15T18:12:40.000Z",
      takenDownAt: null,
      takedownReason: null,
    };

    const answerDto: EmployeeOrganizationTrainingAnswerDto = {
      publicId: "training_answer_public_123",
      trainingVersionPublicId: versionDto.publicId,
      employeePublicId: "employee_public_123",
      organizationPublicId: "organization_public_123",
      answerOrganizationSnapshot: {
        organizationPublicIds: ["organization_public_123"],
        capturedAt: "2026-06-15T18:12:40.000Z",
      },
      answerStatus: "read_only",
      scoreSummary: null,
      submittedAt: null,
      resultSummaryVisible: true,
    };

    const adminSummaryDto: OrganizationTrainingAdminSummaryDto = {
      trainingVersionPublicId: versionDto.publicId,
      organizationPublicId: versionDto.organizationPublicId,
      completionCount: 8,
      submittedCount: 6,
      averageScore: 82,
      employeeSummaries: [
        {
          employeePublicId: answerDto.employeePublicId,
          organizationPublicId: answerDto.organizationPublicId,
          answerStatus: answerDto.answerStatus,
          scoreSummary: answerDto.scoreSummary,
          submittedAt: answerDto.submittedAt,
        },
      ],
      redactionStatus: "redacted",
    };

    const serializedAdminSummary = JSON.stringify(adminSummaryDto);

    expect(serializedAdminSummary).not.toContain("standardAnswer");
    expect(serializedAdminSummary).not.toContain("analysis");
    expect(serializedAdminSummary).not.toContain("prompt");
    expect(serializedAdminSummary).not.toContain("providerPayload");
    expect(serializedAdminSummary).not.toContain("subjectiveAnswer");
    expect(organizationTrainingSensitiveAdminSummaryFieldValues).toEqual([
      "questionAnswerBody",
      "itemCorrectness",
      "subjectiveOriginalAnswer",
      "fullQuestionBody",
      "standardAnswer",
      "analysis",
      "prompt",
      "providerPayload",
      "singleAiTaskDetail",
    ]);
  });
});
