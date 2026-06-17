import type { OpsGovernanceRedactedReferenceStatus } from "../models/ops-governance-redeem-code-redacted-reference";

export type OpsGovernancePublicIdDisplayStatus = "hidden";

export type OpsGovernanceNotIncludedStatus = "not_included";

export type OpsGovernanceRedactionStatus = "redacted";

export type OpsGovernanceRedactedReferenceReviewStatus =
  | "redacted_reference_ready"
  | "redacted_evidence_only";

export type OpsGovernanceRedeemCodeRedactedReferenceDto = {
  generatedAt: string;
  runtimeStatus: "local_read_model_only";
  redeemCodeReference: {
    referenceStatus: Extract<
      OpsGovernanceRedactedReferenceStatus,
      "redacted_reference"
    >;
    redactionStatus: OpsGovernanceRedactionStatus;
    publicIdDisplayStatus: OpsGovernancePublicIdDisplayStatus;
    plaintextCodeStatus: OpsGovernanceNotIncludedStatus;
    codeHashStatus: OpsGovernanceNotIncludedStatus;
  };
  authorizationReference: {
    referenceStatus: Extract<
      OpsGovernanceRedactedReferenceStatus,
      "redacted_reference"
    >;
    publicIdDisplayStatus: OpsGovernancePublicIdDisplayStatus;
  };
  contextReference: {
    paperReferenceStatus: OpsGovernanceRedactedReferenceStatus;
    mockExamReferenceStatus: OpsGovernanceRedactedReferenceStatus;
    publicIdDisplayStatus: OpsGovernancePublicIdDisplayStatus;
  };
  evidencePolicy: {
    auditLogReferenceStatus: OpsGovernanceRedactedReferenceStatus;
    aiCallLogReferenceStatus: OpsGovernanceRedactedReferenceStatus;
    publicIdInventoryStatus: OpsGovernanceNotIncludedStatus;
    providerPayloadStatus: OpsGovernanceNotIncludedStatus;
    rawPromptStatus: OpsGovernanceNotIncludedStatus;
    rawAnswerStatus: OpsGovernanceNotIncludedStatus;
    rowDataStatus: OpsGovernanceNotIncludedStatus;
  };
  operationsReview: {
    redeemCodeReviewStatus: Extract<
      OpsGovernanceRedactedReferenceReviewStatus,
      "redacted_reference_ready"
    >;
    authorizationReviewStatus: Extract<
      OpsGovernanceRedactedReferenceReviewStatus,
      "redacted_reference_ready"
    >;
    evidenceReviewStatus: Extract<
      OpsGovernanceRedactedReferenceReviewStatus,
      "redacted_evidence_only"
    >;
  };
};
