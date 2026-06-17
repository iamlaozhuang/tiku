import { describe, expect, it } from "vitest";

import { buildOpsGovernanceRedeemCodeRedactedReferenceReadModel } from "./ops-governance-redeem-code-redacted-reference-service";

const plaintextRedeemCode = "RC-PRIVATE-2026-0002";
const codeHash = "redeem-code-hash-private";
const privateMarkerA = "private-marker-a";
const privateMarkerB = "private-marker-b";
const privateMarkerC = "private-marker-c";

function createBaseInput() {
  return {
    generatedAt: "2026-06-17T17:50:00.000Z",
    userPublicId: "user-public-private",
    authorizationPublicId: "authorization-public-private",
    redeemCodePublicId: "redeem-code-public-private",
    paperPublicId: "paper-public-private",
    mockExamPublicId: "mock-exam-public-private",
    auditLogPublicId: "audit-log-public-private",
    aiCallLogPublicId: "ai-call-log-public-private",
    plaintextRedeemCode,
    codeHash,
    privateMarkerA,
    privateMarkerB,
    privateMarkerC,
    privateRowData: {
      purchaserName: "private purchaser",
    },
  };
}

describe("ops governance redeem_code redacted reference service", () => {
  it("builds a redacted redeem_code reference without publicId inventories or private payloads", () => {
    const result =
      buildOpsGovernanceRedeemCodeRedactedReferenceReadModel(createBaseInput());
    const serializedResult = JSON.stringify(result);

    expect(result).toEqual({
      code: 0,
      message: "ok",
      data: {
        generatedAt: "2026-06-17T17:50:00.000Z",
        runtimeStatus: "local_read_model_only",
        redeemCodeReference: {
          referenceStatus: "redacted_reference",
          redactionStatus: "redacted",
          publicIdDisplayStatus: "hidden",
          plaintextCodeStatus: "not_included",
          codeHashStatus: "not_included",
        },
        authorizationReference: {
          referenceStatus: "redacted_reference",
          publicIdDisplayStatus: "hidden",
        },
        contextReference: {
          paperReferenceStatus: "redacted_reference",
          mockExamReferenceStatus: "redacted_reference",
          publicIdDisplayStatus: "hidden",
        },
        evidencePolicy: {
          auditLogReferenceStatus: "redacted_reference",
          aiCallLogReferenceStatus: "redacted_reference",
          publicIdInventoryStatus: "not_included",
          providerPayloadStatus: "not_included",
          rawPromptStatus: "not_included",
          rawAnswerStatus: "not_included",
          rowDataStatus: "not_included",
        },
        operationsReview: {
          redeemCodeReviewStatus: "redacted_reference_ready",
          authorizationReviewStatus: "redacted_reference_ready",
          evidenceReviewStatus: "redacted_evidence_only",
        },
      },
    });
    expect(serializedResult).not.toContain(plaintextRedeemCode);
    expect(serializedResult).not.toContain(codeHash);
    expect(serializedResult).not.toContain(privateMarkerA);
    expect(serializedResult).not.toContain(privateMarkerB);
    expect(serializedResult).not.toContain(privateMarkerC);
    expect(serializedResult).not.toMatch(/public-private/);
    expect(serializedResult).not.toMatch(/"privateRowData"/);
  });

  it("marks optional context and evidence references as none when absent", () => {
    expect(
      buildOpsGovernanceRedeemCodeRedactedReferenceReadModel({
        generatedAt: "2026-06-17T17:50:00.000Z",
        userPublicId: "user-public-minimal",
        authorizationPublicId: "authorization-public-minimal",
        redeemCodePublicId: "redeem-code-public-minimal",
        paperPublicId: null,
        mockExamPublicId: null,
        auditLogPublicId: null,
        aiCallLogPublicId: null,
      }),
    ).toEqual({
      code: 0,
      message: "ok",
      data: {
        generatedAt: "2026-06-17T17:50:00.000Z",
        runtimeStatus: "local_read_model_only",
        redeemCodeReference: {
          referenceStatus: "redacted_reference",
          redactionStatus: "redacted",
          publicIdDisplayStatus: "hidden",
          plaintextCodeStatus: "not_included",
          codeHashStatus: "not_included",
        },
        authorizationReference: {
          referenceStatus: "redacted_reference",
          publicIdDisplayStatus: "hidden",
        },
        contextReference: {
          paperReferenceStatus: "none",
          mockExamReferenceStatus: "none",
          publicIdDisplayStatus: "hidden",
        },
        evidencePolicy: {
          auditLogReferenceStatus: "none",
          aiCallLogReferenceStatus: "none",
          publicIdInventoryStatus: "not_included",
          providerPayloadStatus: "not_included",
          rawPromptStatus: "not_included",
          rawAnswerStatus: "not_included",
          rowDataStatus: "not_included",
        },
        operationsReview: {
          redeemCodeReviewStatus: "redacted_reference_ready",
          authorizationReviewStatus: "redacted_reference_ready",
          evidenceReviewStatus: "redacted_evidence_only",
        },
      },
    });
  });

  it("rejects missing redeem_code reference input", () => {
    expect(
      buildOpsGovernanceRedeemCodeRedactedReferenceReadModel({
        generatedAt: "2026-06-17T17:50:00.000Z",
        userPublicId: "user-public-invalid",
        authorizationPublicId: "authorization-public-invalid",
        redeemCodePublicId: "",
        paperPublicId: null,
        mockExamPublicId: null,
        auditLogPublicId: null,
        aiCallLogPublicId: null,
      }),
    ).toEqual({
      code: 400062,
      message: "Invalid ops governance redeem_code redacted reference input.",
      data: null,
    });
  });
});
