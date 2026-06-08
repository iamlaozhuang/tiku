import type {
  AuditAiCallLogReferenceRedactionStatus,
  AuditAiCallLogReferenceStatus,
} from "../models/audit-ai-call-log-reference";

export type AuditAiCallLogReferenceDto = {
  userPublicId: string;
  authorizationPublicId: string;
  referenceScope: {
    paperPublicId: string | null;
    mockExamPublicId: string | null;
  };
  auditLogReference: {
    publicId: string | null;
    redactionStatus: AuditAiCallLogReferenceRedactionStatus;
  };
  aiCallLogReference: {
    publicId: string | null;
    redactionStatus: AuditAiCallLogReferenceRedactionStatus;
  };
  referenceStatus: AuditAiCallLogReferenceStatus;
};
