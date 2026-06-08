export type AuditAiCallLogReferenceRedactionStatus = "redacted";

export type AuditAiCallLogReferenceStatus = "redacted_reference";

export type AuditAiCallLogReferenceInput = {
  userPublicId: string;
  authorizationPublicId: string;
  auditLogPublicId: string | null;
  aiCallLogPublicId: string | null;
  paperPublicId: string | null;
  mockExamPublicId: string | null;
};
