import type { AiGenerationTaskType } from "./ai-generation-task";
import type { EvidenceStatus, RedactedJsonObject } from "./ai-rag";

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

export type PersonalAiGenerationResultContentVisibility = "redacted_snapshot";

export type PersonalAiGenerationResultRedactionStatus = "redacted";

export type PersonalAiGenerationResultFormalAdoptionStatus = "blocked";

export type PersonalAiGenerationResultPersistenceInput = {
  resultPublicId: string;
  taskPublicId: string;
  ownerPublicId: string;
  taskType: PersonalAiGenerationResultTaskType;
  contentRedactedSnapshot: RedactedJsonObject;
  contentDigest: string;
  contentPreviewMasked: string;
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
