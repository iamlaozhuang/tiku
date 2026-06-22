import type {
  RedeemCodeRedactedReferenceScopeStatus,
  RedeemCodeReferenceRedactionStatus,
  RedeemCodeReferenceStatus,
} from "../models/redeem-code-reference";

export type RedeemCodeAuditRedactionStatus = "redacted";

export type RedeemCodeAuditNotIncludedStatus = "not_included";

export type RedeemCodeAuditRedactionBoundary =
  "audit_log_ai_call_log_redacted_metadata_only";

export type RedeemCodeReferenceDto = {
  userPublicId: string;
  authorizationPublicId: string;
  redeemCodeReference: {
    publicId: string;
    redactionStatus: RedeemCodeReferenceRedactionStatus;
  };
  contextScope: {
    paperPublicId: string | null;
    mockExamPublicId: string | null;
  };
  evidenceReferences: {
    auditLogPublicId: string | null;
    aiCallLogPublicId: string | null;
    redactionStatus: RedeemCodeReferenceRedactionStatus;
  };
  auditRedaction: {
    auditLogMetadataStatus: RedeemCodeAuditRedactionStatus;
    aiCallLogRequestStatus: RedeemCodeAuditNotIncludedStatus;
    aiCallLogResponseStatus: RedeemCodeAuditNotIncludedStatus;
    plaintextCodeStatus: RedeemCodeAuditNotIncludedStatus;
    codeHashStatus: RedeemCodeAuditNotIncludedStatus;
    providerPayloadStatus: RedeemCodeAuditNotIncludedStatus;
    rawPromptStatus: RedeemCodeAuditNotIncludedStatus;
    rawAnswerStatus: RedeemCodeAuditNotIncludedStatus;
    internalIdStatus: RedeemCodeAuditNotIncludedStatus;
    publicIdInventoryStatus: RedeemCodeAuditNotIncludedStatus;
    redactionBoundary: RedeemCodeAuditRedactionBoundary;
  };
  redactedReferenceScopeStatus: RedeemCodeRedactedReferenceScopeStatus;
  referenceStatus: RedeemCodeReferenceStatus;
};
