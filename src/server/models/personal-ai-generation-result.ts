import type { AiGenerationTaskType } from "./ai-generation-task";
import type { AiGenerationTaskRequestOwnerType } from "./ai-generation-task-request";
import type { EvidenceStatus, RedactedJsonObject } from "./ai-rag";
import type { PersonalAiGenerationResultPaperAssemblySnapshotDto } from "../contracts/personal-ai-generation-result-persistence-contract";

export const personalAiGenerationResultStatusValues = [
  "draft",
  "discarded",
] as const;

export type PersonalAiGenerationResultStatus =
  (typeof personalAiGenerationResultStatusValues)[number];

export type PersonalAiGenerationResultTaskType = Extract<
  AiGenerationTaskType,
  "ai_question_generation" | "ai_paper_generation"
>;

export type PersonalAiGenerationResultOwnerType = Extract<
  AiGenerationTaskRequestOwnerType,
  "personal" | "organization"
>;

export type PersonalAiGenerationResultContentVisibility = "redacted_snapshot";

export type PersonalAiGenerationResultRedactionStatus = "redacted";

export type PersonalAiGenerationResultFormalAdoptionStatus = "blocked";

export type PersonalAiGenerationResultPersistenceInput = {
  resultPublicId: string;
  taskPublicId: string;
  ownerType: PersonalAiGenerationResultOwnerType;
  ownerPublicId: string;
  actorPublicId: string;
  taskType: PersonalAiGenerationResultTaskType;
  contentRedactedSnapshot: RedactedJsonObject;
  contentDigest: string;
  contentPreviewMasked: string;
  paperAssemblyRedactedSnapshot?: PersonalAiGenerationResultPaperAssemblySnapshotDto | null;
  citationRedactedSnapshot: RedactedJsonObject | null;
  evidenceStatus: EvidenceStatus;
  citationCount: number;
  aiCallLogPublicId: string | null;
  createdAt: Date;
};

export function isPersonalAiGenerationResultTaskType(
  taskType: AiGenerationTaskType,
): taskType is PersonalAiGenerationResultTaskType {
  return (
    taskType === "ai_question_generation" || taskType === "ai_paper_generation"
  );
}
