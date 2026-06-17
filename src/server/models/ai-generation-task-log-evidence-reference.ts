import type {
  AiGenerationTaskFailureCategory,
  AiGenerationTaskStatus,
  AiGenerationTaskType,
} from "./ai-generation-task";
import type { EvidenceStatus } from "./ai-rag";

export type AiGenerationTaskLogEvidenceRuntimeStatus = "local_contract_only";

export type AiGenerationTaskLogEvidenceReferenceKind =
  | "audit_log"
  | "ai_call_log";

export type AiGenerationTaskLogEvidenceVisibility = "summary_only";

export type AiGenerationTaskLogEvidenceRedactionStatus = "redacted";

export type AiGenerationTaskLogEvidenceReferenceStatus =
  | "available"
  | "missing";

export type AiGenerationTaskLogEvidenceReferenceInput = {
  taskPublicId: string;
  taskType: AiGenerationTaskType;
  status: AiGenerationTaskStatus;
  failureCategory: AiGenerationTaskFailureCategory | null;
  resultPublicId: string | null;
  evidenceStatus: EvidenceStatus;
  auditLogPublicId: string | null;
  aiCallLogPublicId: string | null;
  auditLogRetentionDay: number;
  aiCallLogRetentionDay: number;
};

export type AiGenerationTaskLogEvidenceReferenceItem = {
  kind: AiGenerationTaskLogEvidenceReferenceKind;
  publicId: string | null;
  referenceStatus: AiGenerationTaskLogEvidenceReferenceStatus;
  visibility: AiGenerationTaskLogEvidenceVisibility;
  redactionStatus: AiGenerationTaskLogEvidenceRedactionStatus;
  retentionDay: number;
};

export function hasAiGenerationTaskLogEvidenceReference(
  input: Pick<
    AiGenerationTaskLogEvidenceReferenceInput,
    "auditLogPublicId" | "aiCallLogPublicId"
  >,
): boolean {
  return input.auditLogPublicId !== null || input.aiCallLogPublicId !== null;
}

export function createAiGenerationTaskLogEvidenceReferenceItem(
  kind: AiGenerationTaskLogEvidenceReferenceKind,
  publicId: string | null,
  retentionDay: number,
): AiGenerationTaskLogEvidenceReferenceItem {
  return {
    kind,
    publicId,
    referenceStatus: publicId === null ? "missing" : "available",
    visibility: "summary_only",
    redactionStatus: "redacted",
    retentionDay,
  };
}
