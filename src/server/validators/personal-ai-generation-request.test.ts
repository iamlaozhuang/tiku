import { describe, expect, it } from "vitest";

import { normalizePersonalAiGenerationRequestInput } from "./personal-ai-generation-request";

describe("personal AI generation request validator", () => {
  it("accepts real learner generation parameters without demo lineage", () => {
    expect(
      normalizePersonalAiGenerationRequestInput({
        userPublicId: "student_public_160",
        authorizationPublicId: "personal_auth_public_160",
        generationParameters: {
          profession: "marketing",
          level: 3,
          subject: "theory",
          knowledgeNode: null,
          knowledgeNodeMode: "selected",
          knowledgeNodePublicIds: [
            "knowledge_node_public_b",
            "knowledge_node_public_a",
          ],
          includeDescendants: true,
          knowledgeNodeSupplement: null,
          sourcePreference: "prefer_platform",
          questionType: "single_choice",
          questionCount: 3,
          difficulty: "medium",
          learningObjective: "weak point practice",
        },
      }),
    ).toMatchObject({
      success: true,
      value: {
        aiFuncType: null,
        questionPublicId: null,
        answerRecordPublicId: null,
        paperPublicId: null,
        mockExamPublicId: null,
      },
    });
  });

  it("rejects client attempts to submit server-owned snapshot fields", () => {
    expect(
      normalizePersonalAiGenerationRequestInput({
        userPublicId: "student_public_160",
        authorizationPublicId: "personal_auth_public_160",
        generationSnapshotVersion: 1,
        generationInputSnapshot: {},
        generationConstraintSnapshot: {},
        generationSnapshotDigest: `sha256:${"a".repeat(64)}`,
        generationParameters: {
          profession: "marketing",
          level: 3,
          subject: "theory",
          knowledgeNode: null,
          knowledgeNodePublicIds: [],
          questionType: "single_choice",
          questionCount: 3,
          difficulty: "medium",
          learningObjective: null,
        },
      }),
    ).toEqual({
      success: false,
      message: "Invalid personal AI generation request input.",
    });
  });

  it("normalizes ai_hint input while ignoring request-only fixtures", () => {
    expect(
      normalizePersonalAiGenerationRequestInput({
        userPublicId: " user_public_123 ",
        authorizationPublicId: " personal_auth_public_123 ",
        aiFuncType: "hint",
        questionPublicId: " question_public_123 ",
        answerRecordPublicId: " answer_record_public_123 ",
        paperPublicId: " paper_public_123 ",
        mockExamPublicId: null,
        redeemCodePublicId: " redeem_code_public_123 ",
        auditLogPublicId: " audit_log_public_123 ",
        aiCallLogPublicId: " ai_call_log_public_123 ",
        omittedFixtureOne: "omitted fixture must be ignored",
        omittedFixtureTwo: "another omitted fixture must be ignored",
        omittedFixtureThree: "third omitted fixture must be ignored",
      }),
    ).toEqual({
      success: true,
      value: {
        userPublicId: "user_public_123",
        authorizationSource: "personal_auth",
        authorizationPublicId: "personal_auth_public_123",
        ownerType: "personal",
        ownerPublicId: "user_public_123",
        organizationPublicId: null,
        quotaOwnerType: "personal",
        quotaOwnerPublicId: "user_public_123",
        aiFuncType: "hint",
        questionPublicId: "question_public_123",
        answerRecordPublicId: "answer_record_public_123",
        paperPublicId: "paper_public_123",
        mockExamPublicId: null,
        redeemCodePublicId: "redeem_code_public_123",
        auditLogPublicId: "audit_log_public_123",
        aiCallLogPublicId: "ai_call_log_public_123",
        generationParameters: null,
      },
    });
  });

  it("rejects mixed paper and mock_exam context selection", () => {
    expect(
      normalizePersonalAiGenerationRequestInput({
        userPublicId: "user_public_123",
        authorizationPublicId: "personal_auth_public_123",
        aiFuncType: "hint",
        questionPublicId: "question_public_123",
        paperPublicId: "paper_public_123",
        mockExamPublicId: "mock_exam_public_123",
      }),
    ).toEqual({
      success: false,
      message: "Invalid personal AI generation request input.",
    });
  });

  it("rejects unsupported personal AI generation types", () => {
    expect(
      normalizePersonalAiGenerationRequestInput({
        userPublicId: "user_public_123",
        authorizationPublicId: "personal_auth_public_123",
        aiFuncType: "scoring",
        questionPublicId: "question_public_123",
      }),
    ).toEqual({
      success: false,
      message: "Invalid personal AI generation request input.",
    });
  });

  it("normalizes structured route generation knowledge scope", () => {
    expect(
      normalizePersonalAiGenerationRequestInput({
        userPublicId: "user_public_123",
        authorizationPublicId: "personal_auth_public_123",
        aiFuncType: "hint",
        questionPublicId: "question_public_123",
        generationParameters: {
          profession: "marketing",
          level: 3,
          subject: "theory",
          knowledgeNode: "legacy marketing label",
          knowledgeNodeMode: "selected",
          knowledgeNodePublicIds: [
            "knowledge_node_public_a",
            "knowledge_node_public_a",
          ],
          includeDescendants: true,
          knowledgeNodeSupplement: "manual supplement",
          sourcePreference: "prefer_platform",
          questionType: "single_choice",
          questionCount: 3,
          difficulty: "medium",
          learningObjective: "redacted objective",
          questionTypeDistribution: "balanced_40_30_30",
          paperStructure: "by_question_type",
        },
      }),
    ).toMatchObject({
      success: true,
      value: {
        generationParameters: {
          knowledgeNode: "legacy marketing label",
          knowledgeNodeMode: "selected",
          knowledgeNodePublicIds: ["knowledge_node_public_a"],
          includeDescendants: true,
          knowledgeNodeSupplement: "manual supplement",
          sourcePreference: "prefer_platform",
          questionTypeDistribution: "balanced_40_30_30",
          paperStructure: "by_question_type",
        },
      },
    });
  });

  it("rejects malformed AI paper generation parameter enums", () => {
    expect(
      normalizePersonalAiGenerationRequestInput({
        userPublicId: "user_public_123",
        authorizationPublicId: "personal_auth_public_123",
        aiFuncType: "hint",
        questionPublicId: "question_public_123",
        generationParameters: {
          profession: "marketing",
          level: 3,
          subject: "theory",
          knowledgeNode: null,
          knowledgeNodePublicIds: [],
          questionType: null,
          questionCount: 30,
          difficulty: "medium",
          learningObjective: "redacted objective",
          questionTypeDistribution: "unsupported_distribution",
          paperStructure: "by_question_type",
        },
      }),
    ).toEqual({
      success: false,
      message: "Invalid personal AI generation request input.",
    });

    expect(
      normalizePersonalAiGenerationRequestInput({
        userPublicId: "user_public_123",
        authorizationPublicId: "personal_auth_public_123",
        aiFuncType: "hint",
        questionPublicId: "question_public_123",
        generationParameters: {
          profession: "marketing",
          level: 3,
          subject: "theory",
          knowledgeNode: null,
          knowledgeNodePublicIds: [],
          questionType: null,
          questionCount: 30,
          difficulty: "medium",
          learningObjective: "redacted objective",
          questionTypeDistribution: "balanced_40_30_30",
          paperStructure: "unsupported_structure",
        },
      }),
    ).toEqual({
      success: false,
      message: "Invalid personal AI generation request input.",
    });
  });

  it("rejects malformed generation knowledge node public ids", () => {
    expect(
      normalizePersonalAiGenerationRequestInput({
        userPublicId: "user_public_123",
        authorizationPublicId: "personal_auth_public_123",
        aiFuncType: "hint",
        questionPublicId: "question_public_123",
        generationParameters: {
          profession: "marketing",
          level: 3,
          subject: "theory",
          knowledgeNode: null,
          knowledgeNodePublicIds: ["not a public id"],
          questionType: "single_choice",
          questionCount: 3,
          difficulty: "medium",
          learningObjective: "redacted objective",
        },
      }),
    ).toEqual({
      success: false,
      message: "Invalid personal AI generation request input.",
    });
  });
});
