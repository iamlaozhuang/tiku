import { describe, expect, it } from "vitest";

import { buildPersonalAiGenerationLocalBrowserExperienceReadModel } from "./personal-ai-generation-local-browser-experience-service";

function createBaseInput() {
  const omittedPromptFixture = ["OMITTED", "PROMPT", "BROWSER"].join("-");
  const omittedGeneratedFixture = ["OMITTED", "GENERATED", "BROWSER"].join("-");
  const omittedProviderFixture = ["OMITTED", "PROVIDER", "BROWSER"].join("-");
  const omittedTokenFixture = ["OMITTED", "TOKEN", "BROWSER"].join("-");
  const omittedPaperFixture = ["OMITTED", "PAPER", "BROWSER"].join("-");

  return {
    id: 121,
    userPublicId: "student_public_121",
    authorizationPublicId: "personal_auth_public_121",
    aiFuncType: "explanation",
    questionPublicId: "question_public_121",
    answerRecordPublicId: "answer_record_public_121",
    paperPublicId: "paper_public_121",
    mockExamPublicId: null,
    redeemCodePublicId: "redeem_code_public_121",
    auditLogPublicId: "audit_log_public_121",
    aiCallLogPublicId: "ai_call_log_public_121",
    taskPublicId: "ai_generation_task_public_121",
    taskType: "ai_question_generation",
    actorPublicId: "student_public_121",
    authorizationSource: "personal_auth",
    ownerType: "personal",
    ownerPublicId: "student_public_121",
    organizationPublicId: null,
    quotaOwnerType: "personal",
    quotaOwnerPublicId: "student_public_121",
    effectiveEdition: "advanced",
    isAuthorizationActive: true,
    isScopeAllowed: true,
    isQuotaAvailable: true,
    isRuntimeConfigReady: true,
    idempotencyKeyHash: "sha256:personal_generation_browser_121",
    existingTaskPublicId: null,
    existingTaskStatus: null,
    resultPublicId: null,
    evidenceStatus: "none",
    citationCount: 0,
    omittedPromptFixture,
    omittedGeneratedFixture,
    omittedProviderFixture,
    omittedTokenFixture,
    omittedPaperFixture,
  };
}

describe("personal AI generation local browser experience service", () => {
  it("builds a redacted local browser experience for an accepted personal request flow", () => {
    const input = createBaseInput();
    const result =
      buildPersonalAiGenerationLocalBrowserExperienceReadModel(input);
    const serializedResult = JSON.stringify(result);

    expect(result).toMatchObject({
      code: 0,
      message: "ok",
      data: {
        runtimeStatus: "local_contract_only",
        experienceSurface: "student_local_browser",
        flowStatus: "accepted",
        redactionStatus: "redacted",
        requestState: {
          status: "ready",
          selectedContext: {
            contextType: "paper",
            contextPublicId: "paper_public_121",
          },
          action: {
            actionType: "submit_personal_ai_generation_request",
            isEnabled: true,
            disabledReason: null,
          },
        },
        resultState: {
          status: "pending",
          taskPublicId: "ai_generation_task_public_121",
          resultPublicId: null,
          contentVisibility: "summary_only",
          evidenceStatus: "none",
          citationCount: 0,
          redactionStatus: "redacted",
        },
        stateCoverage: {
          loadingState: "supported",
          emptyState: "supported",
          errorState: "supported",
          permissionBlockedState: "supported",
        },
        requestFlow: {
          flowStatus: "accepted",
          contextSelection: {
            selectedContext: {
              contextType: "paper",
              contextPublicId: "paper_public_121",
            },
          },
          resultReference: {
            resultReference: {
              contentVisibility: "summary_only",
              redactionStatus: "redacted",
            },
          },
        },
      },
    });
    expect(serializedResult).not.toMatch(/"id":/);
    expect(serializedResult).not.toContain(input.omittedPromptFixture);
    expect(serializedResult).not.toContain(input.omittedGeneratedFixture);
    expect(serializedResult).not.toContain(input.omittedProviderFixture);
    expect(serializedResult).not.toContain(input.omittedTokenFixture);
    expect(serializedResult).not.toContain(input.omittedPaperFixture);
  });

  it("maps rejected request policy to blocked local browser states", () => {
    expect(
      buildPersonalAiGenerationLocalBrowserExperienceReadModel({
        ...createBaseInput(),
        isQuotaAvailable: false,
      }),
    ).toMatchObject({
      code: 0,
      data: {
        flowStatus: "blocked",
        requestState: {
          status: "blocked",
          action: {
            isEnabled: false,
            disabledReason: "quota_insufficient",
          },
        },
        resultState: {
          status: "blocked",
          taskPublicId: "ai_generation_task_public_121",
          resultPublicId: null,
          contentVisibility: "summary_only",
        },
      },
    });
  });

  it("preserves the flow-level validation envelope for invalid browser experience input", () => {
    expect(
      buildPersonalAiGenerationLocalBrowserExperienceReadModel({
        ...createBaseInput(),
        taskType: "organization_training_generation",
        authorizationSource: "org_auth",
      }),
    ).toEqual({
      code: 400015,
      message: "Invalid personal AI generation request flow input.",
      data: null,
    });
  });
});
