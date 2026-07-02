import type {
  AiGenerationRouteIntegratedGenerationParameters,
  AiGenerationRouteIntegratedStructuredPreviewOptions,
} from "./route-integrated-provider-execution-contract";

export type AiGenerationSharedTaskType =
  | "ai_question_generation"
  | "ai_paper_generation";

export type AiGenerationSharedTaskLabel = "AI出题" | "AI组卷";

export type AiGenerationSharedStructuredPreviewKind =
  | "question_set"
  | "paper_draft";

export type AiGenerationSharedTaskCountSemantic =
  | "exact_requested_question_count"
  | "requested_total_question_count";

export type AiGenerationSharedTaskRedactionCategory =
  | "question_draft_summary_only"
  | "paper_draft_summary_only";

export type AiGenerationSharedTaskSpec = {
  taskType: AiGenerationSharedTaskType;
  label: AiGenerationSharedTaskLabel;
  structuredPreviewKind: AiGenerationSharedStructuredPreviewKind;
  countSemantic: AiGenerationSharedTaskCountSemantic;
  defaultQuestionCount: number;
  allowedOutputFields: readonly string[];
  redactionCategory: AiGenerationSharedTaskRedactionCategory;
};

export type AiGenerationSharedTaskPreviewOptionsInput = {
  generationParameters?: Pick<
    AiGenerationRouteIntegratedGenerationParameters,
    "questionCount"
  > | null;
};

export const aiGenerationSharedTaskSpecs = {
  ai_question_generation: {
    taskType: "ai_question_generation",
    label: "AI出题",
    structuredPreviewKind: "question_set",
    countSemantic: "exact_requested_question_count",
    defaultQuestionCount: 10,
    allowedOutputFields: ["questions", "questionDrafts", "question_drafts"],
    redactionCategory: "question_draft_summary_only",
  },
  ai_paper_generation: {
    taskType: "ai_paper_generation",
    label: "AI组卷",
    structuredPreviewKind: "paper_draft",
    countSemantic: "requested_total_question_count",
    defaultQuestionCount: 10,
    allowedOutputFields: [
      "paperSections",
      "paper_sections",
      "questionCount",
      "totalQuestionCount",
      "questionTypeDistribution",
      "knowledgeCoverage",
    ],
    redactionCategory: "paper_draft_summary_only",
  },
} as const satisfies Record<
  AiGenerationSharedTaskType,
  AiGenerationSharedTaskSpec
>;

export function getAiGenerationSharedTaskSpec(
  taskType: AiGenerationSharedTaskType,
): AiGenerationSharedTaskSpec {
  return aiGenerationSharedTaskSpecs[taskType];
}

export function createAiGenerationSharedTaskStructuredPreviewOptions(
  taskType: AiGenerationSharedTaskType,
  input: AiGenerationSharedTaskPreviewOptionsInput = {},
): AiGenerationRouteIntegratedStructuredPreviewOptions {
  const taskSpec = getAiGenerationSharedTaskSpec(taskType);
  const requestedQuestionCount = resolveRequestedQuestionCount(
    input.generationParameters?.questionCount,
    taskSpec.defaultQuestionCount,
  );

  return taskSpec.structuredPreviewKind === "question_set"
    ? {
        kind: "question_set",
        requestedQuestionCount,
      }
    : {
        kind: "paper_draft",
        requestedQuestionCount,
      };
}

function resolveRequestedQuestionCount(
  questionCount: number | undefined,
  defaultQuestionCount: number,
): number {
  return typeof questionCount === "number" &&
    Number.isInteger(questionCount) &&
    questionCount > 0
    ? questionCount
    : defaultQuestionCount;
}
