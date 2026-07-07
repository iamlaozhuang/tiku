import type { AiGenerationRouteIntegratedGroundingContext } from "../contracts/route-integrated-provider-execution-contract";
import {
  resolveAiGenerationSharedRequestedQuestionCount,
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
  const requestedQuestionCount =
    resolveAiGenerationSharedRequestedQuestionCount(
      input.taskType,
      input.groundingContext?.generationParameters.questionCount,
    );

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
    return `输出 JSON；仅输出一个 JSON 对象，不要输出 Markdown 代码块、解释文字、编号列表或表格；顶层必须只使用 questions 字段；questions 数组必须正好包含 ${requestedQuestionCount} 条结构化题目草稿；每条必须包含 questionType、difficulty、knowledgeNodeLabels、questionStem、questionOptions、standardAnswer 和 analysis；questionOptions 每项必须包含 optionLabel 和 optionText；不得输出供应商请求载荷、原始提示词、内部日志或资料原文。`;
  }

  return `输出 JSON；仅输出一个 JSON 对象，不要输出 Markdown 代码块、解释文字、编号列表或表格；必须包含 title、targetQuestionCount、sections、knowledgeCoverage、difficultyGoal 和 sourcePreference；targetQuestionCount 必须等于 ${requestedQuestionCount}；sections 每项必须包含 sectionKey、title、questionType、targetQuestionCount、targetScore、knowledgeNodeLabels 和 difficulty；只生成组卷方案，不得生成或引用最终题目正文、选项、答案、解析、供应商请求载荷、原始提示词、内部日志或资料原文。`;
}
