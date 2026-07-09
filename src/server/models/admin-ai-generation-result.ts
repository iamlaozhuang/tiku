import type {
  AdminAiGenerationKind,
  AdminAiGenerationWorkspace,
} from "../contracts/admin-ai-generation-local-contract";
import type { AiGenerationTaskType } from "./ai-generation-task";
import type { AiGenerationTaskRequestOwnerType } from "./ai-generation-task-request";
import type { EvidenceStatus, RedactedJsonObject } from "./ai-rag";

export const adminAiGenerationResultStatusValues = [
  "draft",
  "discarded",
] as const;

export type AdminAiGenerationResultStatus =
  (typeof adminAiGenerationResultStatusValues)[number];

export type AdminAiGenerationResultOwnerType = Extract<
  AiGenerationTaskRequestOwnerType,
  "platform" | "organization"
>;

export type AdminAiGenerationResultTaskType = Extract<
  AiGenerationTaskType,
  "ai_question_generation" | "ai_paper_generation"
>;

export type AdminAiGenerationResultContentVisibility = "redacted_snapshot";

export type AdminAiGenerationResultRedactionStatus = "redacted";

export type AdminAiGenerationResultFormalAdoptionStatus =
  | "blocked"
  | "approved_for_formal_adoption"
  | "draft_created"
  | "rejected";

export type AdminAiGenerationResultPersistenceInput = {
  resultPublicId: string;
  taskPublicId: string;
  workspace: AdminAiGenerationWorkspace;
  generationKind: AdminAiGenerationKind;
  ownerType: AdminAiGenerationResultOwnerType;
  ownerPublicId: string;
  organizationPublicId: string | null;
  taskType: AdminAiGenerationResultTaskType;
  contentRedactedSnapshot: RedactedJsonObject;
  contentDigest: string;
  contentPreviewMasked: string;
  citationRedactedSnapshot: RedactedJsonObject | null;
  evidenceStatus: EvidenceStatus;
  citationCount: number;
  aiCallLogPublicId: string | null;
  sourceQuestionPublicId: string | null;
  sourcePaperPublicId: string | null;
  createdAt: Date;
};

export function isAdminAiGenerationResultTaskType(
  taskType: AiGenerationTaskType,
): taskType is AdminAiGenerationResultTaskType {
  return (
    taskType === "ai_question_generation" || taskType === "ai_paper_generation"
  );
}
