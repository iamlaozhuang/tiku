import { describe, expect, it } from "vitest";

import type {
  AdminAiGenerationTaskPersistenceRow,
  CreateAdminAiGenerationTaskPersistenceInput,
} from "../contracts/admin-ai-generation-task-persistence-contract";
import {
  createAdminAiGenerationTaskInsertValue,
  createAdminAiGenerationTaskMetadataInsertValue,
  createAdminAiGenerationTaskMetadataPublicId,
  mapAdminAiGenerationTaskPersistenceDbRowToRow,
} from "./admin-ai-generation-task-persistence-db-adapter";

function createPersistenceInput(
  overrides: Partial<CreateAdminAiGenerationTaskPersistenceInput> = {},
): CreateAdminAiGenerationTaskPersistenceInput {
  return {
    requestPublicId: "admin_ai_generation_request_public_org_901",
    taskPublicId:
      "admin_ai_generation_task_organization_paper_admin_public_901",
    taskType: "ai_paper_generation",
    workspace: "organization",
    generationKind: "paper",
    taskStatus: "pending",
    requestedAt: new Date("2026-06-26T20:45:00.000Z"),
    authorizationSource: "org_auth",
    authorizationPublicId: "org_auth_public_901",
    actorPublicId: "admin_public_901",
    ownerType: "organization",
    ownerPublicId: "organization_public_901",
    organizationPublicId: "organization_public_901",
    quotaOwnerType: "organization",
    quotaOwnerPublicId: "organization_public_901",
    effectiveEdition: "advanced",
    idempotencyKeyHash: "sha256:organization_paper_admin_public_901",
    resultKind: "ai_generated_paper_draft",
    resultPublicId: null,
    contentVisibility: "summary_only",
    evidenceStatus: "none",
    citationCount: 0,
    aiCallLogPublicId: null,
    runtimeStatus: "local_contract_only",
    runtimeBridgeStatus: "provider_call_blocked",
    providerCallExecuted: false,
    envSecretAccessed: false,
    providerConfigurationRead: false,
    costCalibrationExecuted: false,
    questionWriteStatus: "blocked_without_follow_up_task",
    paperWriteStatus: "blocked_without_follow_up_task",
    sourceQuestionPublicId: null,
    sourcePaperPublicId: null,
    redactionStatus: "redacted",
    ...overrides,
  };
}

function protectedAiTerms(): string[] {
  return [
    ["raw", "prompt"].join("_"),
    ["raw", "output"].join("_"),
    ["provider", "payload"].join("_"),
    ["generated", "content"].join("_"),
  ];
}

describe("admin AI generation task persistence DB adapter", () => {
  it("builds non-lossy shared task insert values without placeholder source fields", () => {
    const input = createPersistenceInput();
    const values = createAdminAiGenerationTaskInsertValue(input);

    expect(values).toMatchObject({
      public_id: input.taskPublicId,
      request_public_id: input.requestPublicId,
      task_type: "ai_paper_generation",
      ai_func_type: null,
      owner_type: "organization",
      owner_public_id: "organization_public_901",
      organization_public_id: "organization_public_901",
      quota_owner_type: "organization",
      quota_owner_public_id: "organization_public_901",
      effective_edition: "advanced",
      question_public_id: null,
      answer_record_public_id: null,
      paper_public_id: null,
      mock_exam_public_id: null,
      task_status: "pending",
      retry_count: 0,
      result_public_id: null,
      evidence_status: "none",
      citation_count: 0,
      is_authorization_active: true,
      is_scope_allowed: true,
      is_quota_available: true,
      is_runtime_config_ready: true,
      ai_call_log_public_id: null,
      requested_at: input.requestedAt,
    });
    for (const protectedTerm of protectedAiTerms()) {
      expect(JSON.stringify(values)).not.toContain(protectedTerm);
    }
  });

  it("builds companion metadata values for route and boundary metadata", () => {
    const input = createPersistenceInput({
      runtimeBridgeStatus: "provider_call_succeeded",
      providerCallExecuted: true,
      envSecretAccessed: true,
      providerConfigurationRead: true,
    });
    const values = createAdminAiGenerationTaskMetadataInsertValue(input, 901);

    expect(values).toMatchObject({
      public_id: createAdminAiGenerationTaskMetadataPublicId(
        input.taskPublicId,
      ),
      ai_generation_task_id: 901,
      task_public_id: input.taskPublicId,
      request_public_id: input.requestPublicId,
      workspace: "organization",
      generation_kind: "paper",
      authorization_source: "org_auth",
      result_kind: "ai_generated_paper_draft",
      content_visibility: "summary_only",
      runtime_status: "local_contract_only",
      runtime_bridge_status: "provider_call_succeeded",
      provider_call_executed: true,
      env_secret_accessed: true,
      provider_configuration_read: true,
      cost_calibration_executed: false,
      question_write_status: "blocked_without_follow_up_task",
      paper_write_status: "blocked_without_follow_up_task",
      source_question_public_id: null,
      source_paper_public_id: null,
      redaction_status: "redacted",
      created_at: input.requestedAt,
      updated_at: input.requestedAt,
    });
  });

  it("maps joined DB rows to the repository gateway row without exposing internal ids", () => {
    const input = createPersistenceInput({
      taskType: "ai_question_generation",
      generationKind: "question",
      resultKind: "ai_generated_question_set",
    });
    const row = mapAdminAiGenerationTaskPersistenceDbRowToRow({
      id: 901,
      metadata_id: 902,
      public_id: input.taskPublicId,
      request_public_id: input.requestPublicId,
      task_type: input.taskType,
      workspace: input.workspace,
      generation_kind: input.generationKind,
      task_status: "pending",
      requested_at: input.requestedAt,
      authorization_source: input.authorizationSource,
      authorization_public_id: input.authorizationPublicId,
      actor_public_id: input.actorPublicId,
      owner_type: input.ownerType,
      owner_public_id: input.ownerPublicId,
      organization_public_id: input.organizationPublicId,
      quota_owner_type: input.quotaOwnerType,
      quota_owner_public_id: input.quotaOwnerPublicId,
      idempotency_key_hash: input.idempotencyKeyHash,
      result_public_id: null,
      evidence_status: "none",
      citation_count: 0,
      ai_call_log_public_id: null,
      runtime_status: input.runtimeStatus,
      runtime_bridge_status: input.runtimeBridgeStatus,
      provider_call_executed: false,
      env_secret_accessed: false,
      provider_configuration_read: false,
      cost_calibration_executed: false,
      question_write_status: input.questionWriteStatus,
      paper_write_status: input.paperWriteStatus,
      source_question_public_id: null,
      source_paper_public_id: null,
      content_visibility: "summary_only",
      redaction_status: "redacted",
    });

    expect(row satisfies AdminAiGenerationTaskPersistenceRow).toMatchObject({
      public_id: input.taskPublicId,
      request_public_id: input.requestPublicId,
      task_type: "ai_question_generation",
      workspace: "organization",
      generation_kind: "question",
      runtime_bridge_status: "provider_call_blocked",
      provider_call_executed: false,
      env_secret_accessed: false,
      provider_configuration_read: false,
      cost_calibration_executed: false,
      question_write_status: "blocked_without_follow_up_task",
      paper_write_status: "blocked_without_follow_up_task",
      content_visibility: "summary_only",
      redaction_status: "redacted",
    });
    expect(JSON.stringify(row)).not.toMatch(/"id":/u);
    expect(JSON.stringify(row)).not.toContain("metadata_id");
  });

  it("maps Provider execution status booleans while rejecting Cost Calibration", () => {
    const input = createPersistenceInput();

    const providerExecutedRow = mapAdminAiGenerationTaskPersistenceDbRowToRow({
      id: 901,
      metadata_id: 902,
      public_id: input.taskPublicId,
      request_public_id: input.requestPublicId,
      task_type: input.taskType,
      workspace: input.workspace,
      generation_kind: input.generationKind,
      task_status: "pending",
      requested_at: input.requestedAt,
      authorization_source: input.authorizationSource,
      authorization_public_id: input.authorizationPublicId,
      actor_public_id: input.actorPublicId,
      owner_type: input.ownerType,
      owner_public_id: input.ownerPublicId,
      organization_public_id: input.organizationPublicId,
      quota_owner_type: input.quotaOwnerType,
      quota_owner_public_id: input.quotaOwnerPublicId,
      idempotency_key_hash: input.idempotencyKeyHash,
      result_public_id: null,
      evidence_status: "none",
      citation_count: 0,
      ai_call_log_public_id: null,
      runtime_status: input.runtimeStatus,
      runtime_bridge_status: "provider_call_succeeded",
      provider_call_executed: true,
      env_secret_accessed: true,
      provider_configuration_read: true,
      cost_calibration_executed: false,
      question_write_status: input.questionWriteStatus,
      paper_write_status: input.paperWriteStatus,
      source_question_public_id: null,
      source_paper_public_id: null,
      content_visibility: "summary_only",
      redaction_status: "redacted",
    });

    expect(providerExecutedRow).toMatchObject({
      runtime_bridge_status: "provider_call_succeeded",
      provider_call_executed: true,
      env_secret_accessed: true,
      provider_configuration_read: true,
      cost_calibration_executed: false,
    });
    expect(() =>
      mapAdminAiGenerationTaskPersistenceDbRowToRow({
        id: 901,
        metadata_id: 902,
        public_id: input.taskPublicId,
        request_public_id: input.requestPublicId,
        task_type: input.taskType,
        workspace: input.workspace,
        generation_kind: input.generationKind,
        task_status: "pending",
        requested_at: input.requestedAt,
        authorization_source: input.authorizationSource,
        authorization_public_id: input.authorizationPublicId,
        actor_public_id: input.actorPublicId,
        owner_type: input.ownerType,
        owner_public_id: input.ownerPublicId,
        organization_public_id: input.organizationPublicId,
        quota_owner_type: input.quotaOwnerType,
        quota_owner_public_id: input.quotaOwnerPublicId,
        idempotency_key_hash: input.idempotencyKeyHash,
        result_public_id: null,
        evidence_status: "none",
        citation_count: 0,
        ai_call_log_public_id: null,
        runtime_status: input.runtimeStatus,
        runtime_bridge_status: input.runtimeBridgeStatus,
        provider_call_executed: true,
        env_secret_accessed: false,
        provider_configuration_read: false,
        cost_calibration_executed: true,
        question_write_status: input.questionWriteStatus,
        paper_write_status: input.paperWriteStatus,
        source_question_public_id: null,
        source_paper_public_id: null,
        content_visibility: "summary_only",
        redaction_status: "redacted",
      }),
    ).toThrow("unsafe admin AI generation provider boundary");
  });
});
