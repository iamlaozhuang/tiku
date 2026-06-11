import { describe, expect, it } from "vitest";

import { buildAiGenerationTaskProviderSandboxProposalReadModel } from "./ai-generation-task-provider-sandbox-proposal-service";

function createSandboxProposalInput() {
  const omittedFixtureOne = "OMITTED-FIXTURE-ONE";
  const omittedFixtureTwo = "OMITTED-FIXTURE-TWO";
  const omittedFixtureThree = "OMITTED-FIXTURE-THREE";
  const omittedFixtureFour = "OMITTED-FIXTURE-FOUR";

  return {
    internalId: 908,
    taskPublicId: "ai_task_public_108",
    taskType: "ai_question_generation",
    actorPublicId: "student_public_108",
    targetRuntime: "local_dev",
    approvalStatus: "not_requested",
    approvalPublicId: null,
    requiresEnvSecretAccess: false,
    requiresProviderConfigurationChange: false,
    requiresDependencyChange: false,
    requiresSchemaMigration: false,
    requestsCostCalibration: false,
    evidenceRedactionConfirmed: true,
    evidenceStatus: "none",
    auditLogPublicId: "audit_log_public_108",
    aiCallLogPublicId: null,
    omittedFixtureOne,
    omittedFixtureTwo,
    omittedFixtureThree,
    omittedFixtureFour,
  };
}

describe("ai_generation_task provider sandbox proposal service", () => {
  it("builds a local proposal with redacted evidence rules and no provider execution", () => {
    const input = createSandboxProposalInput();
    const result = buildAiGenerationTaskProviderSandboxProposalReadModel(input);
    const serializedResult = JSON.stringify(result);

    expect(result).toEqual({
      code: 0,
      message: "ok",
      data: {
        runtimeStatus: "proposal_only",
        decision: "ready_for_human_approval",
        taskPublicId: "ai_task_public_108",
        taskType: "ai_question_generation",
        actorPublicId: "student_public_108",
        targetRuntime: "local_dev",
        localOnly: true,
        blockedReasons: [],
        providerCallGate: {
          approvalStatus: "not_requested",
          approvalPublicId: null,
          gateStatus: "requires_fresh_approval",
          providerCallExecuted: false,
        },
        evidenceRules: {
          visibility: "summary_only",
          redactionStatus: "redacted",
          evidenceStatus: "none",
          auditLogPublicId: "audit_log_public_108",
          aiCallLogPublicId: null,
          allowedMetadata: [
            "local_validation_result",
            "failure_category",
            "duration_ms",
            "redacted_log_public_ids",
          ],
          forbiddenEvidence: [
            "api_key",
            "authorization_header",
            "database_url",
            "plain_redeem_code",
            "provider_payload",
            "raw_ai_output",
            "raw_prompt",
            "full_paper_content",
          ],
        },
        costCalibrationGateStatus: "blocked",
      },
    });
    expect(serializedResult).not.toMatch(/"internalId":/);
    expect(serializedResult).not.toContain(input.omittedFixtureOne);
    expect(serializedResult).not.toContain(input.omittedFixtureTwo);
    expect(serializedResult).not.toContain(input.omittedFixtureThree);
    expect(serializedResult).not.toContain(input.omittedFixtureFour);
  });

  it("records explicit local sandbox approval without executing a provider call", () => {
    expect(
      buildAiGenerationTaskProviderSandboxProposalReadModel({
        ...createSandboxProposalInput(),
        approvalStatus: "approved",
        approvalPublicId: "local_provider_sandbox_approval_public_108",
        evidenceStatus: "weak",
        aiCallLogPublicId: "ai_call_log_public_108",
      }),
    ).toMatchObject({
      code: 0,
      data: {
        decision: "approved_for_local_sandbox",
        providerCallGate: {
          approvalStatus: "approved",
          approvalPublicId: "local_provider_sandbox_approval_public_108",
          gateStatus: "approved_for_local_sandbox",
          providerCallExecuted: false,
        },
        evidenceRules: {
          redactionStatus: "redacted",
          evidenceStatus: "weak",
          aiCallLogPublicId: "ai_call_log_public_108",
        },
        costCalibrationGateStatus: "blocked",
      },
    });
  });

  it("blocks high-risk proposals before local provider execution", () => {
    expect(
      buildAiGenerationTaskProviderSandboxProposalReadModel({
        ...createSandboxProposalInput(),
        targetRuntime: "staging",
        requiresEnvSecretAccess: true,
        requiresProviderConfigurationChange: true,
        requiresDependencyChange: true,
        requiresSchemaMigration: true,
        requestsCostCalibration: true,
        evidenceRedactionConfirmed: false,
      }),
    ).toMatchObject({
      code: 0,
      data: {
        decision: "proposal_blocked",
        localOnly: false,
        blockedReasons: [
          "non_local_target",
          "env_secret_access_blocked",
          "provider_configuration_change_blocked",
          "dependency_change_blocked",
          "schema_migration_blocked",
          "cost_calibration_gate_blocked",
          "evidence_redaction_required",
        ],
        providerCallGate: {
          gateStatus: "blocked_by_proposal",
          providerCallExecuted: false,
        },
        costCalibrationGateStatus: "blocked",
      },
    });
  });

  it("rejects invalid provider sandbox proposal input", () => {
    expect(
      buildAiGenerationTaskProviderSandboxProposalReadModel({
        ...createSandboxProposalInput(),
        taskPublicId: "",
      }),
    ).toEqual({
      code: 400014,
      message: "Invalid ai_generation_task provider sandbox proposal input.",
      data: null,
    });
  });
});
