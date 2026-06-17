import { describe, expect, it } from "vitest";

import { buildOpsGovernanceLocalRecoveryExpiredHiddenBoundaryContractsReadModel } from "./ops-governance-local-recovery-expired-hidden-boundary-contracts-service";

const privateMarkerA = "private-marker-a";
const privateMarkerB = "private-marker-b";
const privateMarkerC = "private-marker-c";

function createBaseInput() {
  return {
    generatedAt: "2026-06-17T18:15:00.000Z",
    recoveryMode: "local_read_model",
    expiredAuthorizationCount: 2,
    hiddenExpiredAuthorizationCount: 2,
    staleLogReferenceCount: 1,
    recoverableLocalArtifactCount: 1,
    auditLogPublicId: "audit-log-public-private",
    aiCallLogPublicId: "ai-call-log-public-private",
    privateMarkerA,
    privateMarkerB,
    privateMarkerC,
    privateRowData: {
      actorName: "private actor",
    },
  };
}

describe("ops governance local recovery expired-hidden boundary contracts service", () => {
  it("builds local recovery and expired-hidden policy without raw or publicId output", () => {
    const result =
      buildOpsGovernanceLocalRecoveryExpiredHiddenBoundaryContractsReadModel(
        createBaseInput(),
      );
    const serializedResult = JSON.stringify(result);

    expect(result).toEqual({
      code: 0,
      message: "ok",
      data: {
        generatedAt: "2026-06-17T18:15:00.000Z",
        runtimeStatus: "local_read_model_only",
        recoveryPolicy: {
          recoveryMode: "local_read_model",
          localRecoveryStatus: "ready",
          recoverableLocalArtifactCount: 1,
          destructiveRecoveryStatus: "blocked",
        },
        expiredHiddenBoundary: {
          expiredAuthorizationCount: 2,
          hiddenExpiredAuthorizationCount: 2,
          hiddenCoverageStatus: "complete",
          expiredVisibilityStatus: "hidden",
          publicIdDisplayStatus: "hidden",
          publicIdInventoryStatus: "not_included",
        },
        evidencePolicy: {
          auditLogReferenceStatus: "redacted_reference",
          aiCallLogReferenceStatus: "redacted_reference",
          rowDataStatus: "not_included",
          privateDataStatus: "not_included",
          providerPayloadStatus: "not_included",
        },
        blockedCapabilities: [
          "destructive_recovery_executor",
          "expired_public_id_inventory",
          "raw_log_viewer",
          "provider_model_request",
          "schema_migration",
          "cost_calibration",
        ],
        operationsReview: {
          recoveryReviewStatus: "local_recovery_ready",
          expiredHiddenReviewStatus: "expired_hidden_boundary_ready",
          evidenceReviewStatus: "redacted_evidence_only",
        },
      },
    });
    expect(serializedResult).not.toMatch(/public-private/);
    expect(serializedResult).not.toContain(privateMarkerA);
    expect(serializedResult).not.toContain(privateMarkerB);
    expect(serializedResult).not.toContain(privateMarkerC);
    expect(serializedResult).not.toMatch(/"privateRowData"/);
  });

  it("marks partial hidden coverage and missing optional log references without inventory output", () => {
    expect(
      buildOpsGovernanceLocalRecoveryExpiredHiddenBoundaryContractsReadModel({
        generatedAt: "2026-06-17T18:15:00.000Z",
        recoveryMode: "local_read_model",
        expiredAuthorizationCount: 3,
        hiddenExpiredAuthorizationCount: 2,
        staleLogReferenceCount: 0,
        recoverableLocalArtifactCount: 0,
        auditLogPublicId: null,
        aiCallLogPublicId: null,
      }),
    ).toMatchObject({
      code: 0,
      message: "ok",
      data: {
        recoveryPolicy: {
          localRecoveryStatus: "ready",
          recoverableLocalArtifactCount: 0,
        },
        expiredHiddenBoundary: {
          hiddenCoverageStatus: "partial",
          publicIdInventoryStatus: "not_included",
        },
        evidencePolicy: {
          auditLogReferenceStatus: "none",
          aiCallLogReferenceStatus: "none",
        },
        operationsReview: {
          expiredHiddenReviewStatus: "review_expired_hidden_gap",
        },
      },
    });
  });

  it("rejects invalid expired-hidden boundary input", () => {
    expect(
      buildOpsGovernanceLocalRecoveryExpiredHiddenBoundaryContractsReadModel({
        generatedAt: "2026-06-17T18:15:00.000Z",
        recoveryMode: "local_read_model",
        expiredAuthorizationCount: 1,
        hiddenExpiredAuthorizationCount: 2,
        staleLogReferenceCount: 0,
        recoverableLocalArtifactCount: 0,
        auditLogPublicId: null,
        aiCallLogPublicId: null,
      }),
    ).toEqual({
      code: 400064,
      message:
        "Invalid ops governance local recovery expired-hidden boundary contracts input.",
      data: null,
    });
  });
});
