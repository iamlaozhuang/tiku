import { describe, expect, it } from "vitest";

import { buildOpsGovernanceLogRetentionRedactionContractsReadModel } from "./ops-governance-log-retention-redaction-contracts-service";

const privateMarkerA = "private-marker-a";
const privateMarkerB = "private-marker-b";
const privateMarkerC = "private-marker-c";

function createBaseInput() {
  return {
    generatedAt: "2026-06-17T18:05:00.000Z",
    auditLogPublicId: "audit-log-public-private",
    aiCallLogPublicId: "ai-call-log-public-private",
    auditLogRetentionDay: 1095,
    aiCallLogRetentionDay: 180,
    privateMarkerA,
    privateMarkerB,
    privateMarkerC,
    privateRowData: {
      actorName: "private actor",
    },
  };
}

describe("ops governance log retention redaction contracts service", () => {
  it("builds audit_log and ai_call_log retention and redaction policy without raw or publicId output", () => {
    const result =
      buildOpsGovernanceLogRetentionRedactionContractsReadModel(
        createBaseInput(),
      );
    const serializedResult = JSON.stringify(result);

    expect(result).toEqual({
      code: 0,
      message: "ok",
      data: {
        generatedAt: "2026-06-17T18:05:00.000Z",
        runtimeStatus: "local_read_model_only",
        retentionPolicy: {
          auditLogRetentionDay: 1095,
          aiCallLogRetentionDay: 180,
          retentionSource: "advanced_ops_config_contract",
          hardDeleteStatus: "blocked",
        },
        referencePolicy: {
          auditLogReferenceStatus: "redacted_reference",
          aiCallLogReferenceStatus: "redacted_reference",
          publicIdDisplayStatus: "hidden",
          publicIdInventoryStatus: "not_included",
        },
        redactionPolicy: {
          auditLogRedactionStatus: "redacted",
          aiCallLogRedactionStatus: "redacted",
          rawSensitiveViewerStatus: "blocked",
          rawPromptStatus: "not_included",
          rawAnswerStatus: "not_included",
          providerPayloadStatus: "not_included",
          rowDataStatus: "not_included",
        },
        blockedCapabilities: [
          "raw_sensitive_viewer",
          "raw_prompt_provider_response_viewer",
          "provider_model_request",
          "hard_delete_executor",
          "export_file_generation_download",
          "schema_migration",
          "cost_calibration",
        ],
        operationsReview: {
          retentionReviewStatus: "configured",
          redactionReviewStatus: "redacted_evidence_only",
          evidenceReviewStatus: "policy_only",
        },
      },
    });
    expect(serializedResult).not.toMatch(/public-private/);
    expect(serializedResult).not.toContain(privateMarkerA);
    expect(serializedResult).not.toContain(privateMarkerB);
    expect(serializedResult).not.toContain(privateMarkerC);
    expect(serializedResult).not.toMatch(/"privateRowData"/);
  });

  it("marks missing optional log references as none while keeping retention policy explicit", () => {
    expect(
      buildOpsGovernanceLogRetentionRedactionContractsReadModel({
        generatedAt: "2026-06-17T18:05:00.000Z",
        auditLogPublicId: null,
        aiCallLogPublicId: null,
        auditLogRetentionDay: 1095,
        aiCallLogRetentionDay: 180,
      }),
    ).toMatchObject({
      code: 0,
      message: "ok",
      data: {
        retentionPolicy: {
          auditLogRetentionDay: 1095,
          aiCallLogRetentionDay: 180,
        },
        referencePolicy: {
          auditLogReferenceStatus: "none",
          aiCallLogReferenceStatus: "none",
          publicIdDisplayStatus: "hidden",
          publicIdInventoryStatus: "not_included",
        },
      },
    });
  });

  it("rejects invalid retention policy input", () => {
    expect(
      buildOpsGovernanceLogRetentionRedactionContractsReadModel({
        generatedAt: "2026-06-17T18:05:00.000Z",
        auditLogPublicId: null,
        aiCallLogPublicId: null,
        auditLogRetentionDay: 0,
        aiCallLogRetentionDay: 180,
      }),
    ).toEqual({
      code: 400063,
      message:
        "Invalid ops governance log retention redaction contracts input.",
      data: null,
    });
  });
});
