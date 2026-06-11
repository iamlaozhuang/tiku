import type {
  AiGenerationTaskFailureCategory,
  AiGenerationTaskStatus,
  AiGenerationTaskType,
} from "./ai-generation-task";
import type { EvidenceStatus } from "./ai-rag";

export type PersonalAiGenerationResultReferenceRuntimeStatus =
  "local_contract_only";

export type PersonalAiGenerationResultReferenceTaskType = Extract<
  AiGenerationTaskType,
  "ai_question_generation" | "ai_paper_generation"
>;

export type PersonalAiGenerationResultContentVisibility = "summary_only";

export type PersonalAiGenerationResultReferenceRedactionStatus = "redacted";

export type PersonalAiGenerationResultReferenceInput = {
  taskPublicId: string;
  taskType: PersonalAiGenerationResultReferenceTaskType;
  status: AiGenerationTaskStatus;
  failureCategory: AiGenerationTaskFailureCategory | null;
  resultPublicId: string | null;
  evidenceStatus: EvidenceStatus;
  citationCount: number;
  aiCallLogPublicId: string | null;
};

export function isPersonalAiGenerationResultReferenceTaskType(
  taskType: AiGenerationTaskType,
): taskType is PersonalAiGenerationResultReferenceTaskType {
  return (
    taskType === "ai_question_generation" || taskType === "ai_paper_generation"
  );
}
