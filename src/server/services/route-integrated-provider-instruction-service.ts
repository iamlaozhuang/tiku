import type { AiGenerationRouteIntegratedGroundingContext } from "../contracts/route-integrated-provider-execution-contract";
import {
  getAiGenerationSharedTaskSpec,
  type AiGenerationSharedTaskType,
} from "../contracts/ai-generation-task-spec-contract";

export type RouteIntegratedProviderInstructionInput = {
  taskType: AiGenerationSharedTaskType;
  sceneLabel: string;
  draftInstruction: string;
  groundingContext?: AiGenerationRouteIntegratedGroundingContext | null;
};

export function createRouteIntegratedProviderInstruction(
  input: RouteIntegratedProviderInstructionInput,
): string {
  const taskSpec = getAiGenerationSharedTaskSpec(input.taskType);
  const requestedQuestionCount =
    input.groundingContext?.generationParameters.questionCount ??
    taskSpec.defaultQuestionCount;

  return [
    "为题库系统生成简短中文草稿内容。",
    `场景：${input.sceneLabel}。`,
    ...createGroundingInstructionLines(input.groundingContext),
    createOutputContractInstruction(input.taskType, requestedQuestionCount),
    input.draftInstruction,
  ].join("\n");
}

function createGroundingInstructionLines(
  groundingContext?: AiGenerationRouteIntegratedGroundingContext | null,
): string[] {
  if (groundingContext === null || groundingContext === undefined) {
    return ["资料依据：未提供，本次请求应由上游门禁阻止真实生成。"];
  }

  return [
    `生成范围：${groundingContext.generationParameters.profession} ${groundingContext.generationParameters.level}级 ${groundingContext.generationParameters.subject}。`,
    `知识点：${groundingContext.generationParameters.knowledgeNode ?? "按资料证据覆盖"}`,
    `资料依据：${groundingContext.citationCount} 条。仅依据下列资料片段生成，不得补充资料外的历史或泛行业内容。`,
    ...groundingContext.citations.map(
      (citation, index) => `资料片段${index + 1}：${citation.chunkText}`,
    ),
  ];
}

function createOutputContractInstruction(
  taskType: AiGenerationSharedTaskType,
  requestedQuestionCount: number,
): string {
  if (taskType === "ai_question_generation") {
    return `输出 JSON；questions 数组必须正好包含 ${requestedQuestionCount} 条结构化草稿摘要；每条只保留 questionType、difficulty、knowledgeNodeLabels 和 redactedDraftSummary。`;
  }

  return `输出 JSON；必须包含 paperSections、questionTypeDistribution、knowledgeCoverage 和 totalQuestionCount；totalQuestionCount 必须等于 ${requestedQuestionCount}。`;
}
