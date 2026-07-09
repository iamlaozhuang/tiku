import type {
  AiGenerationRouteIntegratedGenerationParameters,
  AiGenerationRouteIntegratedGroundingContext,
} from "../contracts/route-integrated-provider-execution-contract";
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
    ...createParameterInstructionLines(
      input.taskType,
      input.groundingContext?.generationParameters ?? null,
    ),
    createOutputContractInstruction(
      input.taskType,
      requestedQuestionCount,
      input.groundingContext?.generationParameters ?? null,
    ),
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

function createParameterInstructionLines(
  taskType: AiGenerationSharedTaskType,
  generationParameters: AiGenerationRouteIntegratedGenerationParameters | null,
): string[] {
  if (generationParameters === null) {
    return [];
  }

  if (taskType === "ai_question_generation") {
    return [
      `题型要求：${generationParameters.questionType ?? "按任务默认题型"}。`,
      `难度要求：${generationParameters.difficulty ?? "按资料证据确定"}。`,
      `训练目标：${generationParameters.learningObjective ?? "按当前范围生成可训练草稿"}。`,
    ];
  }

  return [
    `题源偏好：${generationParameters.sourcePreference ?? "balanced"}。`,
    `题型分布：${generationParameters.questionTypeDistribution ?? "balanced_40_30_30"}。`,
    `试卷结构：${generationParameters.paperStructure ?? "by_question_type"}。`,
    `难度目标：${generationParameters.difficulty ?? "按资料证据确定"}。`,
    `组卷目标：${generationParameters.learningObjective ?? "按当前范围生成组卷计划"}。`,
  ];
}

function createOutputContractInstruction(
  taskType: AiGenerationSharedTaskType,
  requestedQuestionCount: number,
  generationParameters: AiGenerationRouteIntegratedGenerationParameters | null,
): string {
  if (taskType === "ai_question_generation") {
    const questionTypeClause =
      generationParameters?.questionType === null ||
      generationParameters?.questionType === undefined
        ? ""
        : `；每条 questionType 必须为 ${generationParameters.questionType}`;
    const difficultyClause =
      generationParameters?.difficulty === null ||
      generationParameters?.difficulty === undefined
        ? ""
        : `；每条 difficulty 必须为 ${generationParameters.difficulty}`;

    return `输出 JSON；仅输出一个 JSON 对象，不要输出 Markdown 代码块、解释文字、编号列表或表格；顶层必须只使用 questions 字段；questions 数组必须正好包含 ${requestedQuestionCount} 条结构化题目草稿；每条必须包含 questionType、difficulty、knowledgeNodeLabels、questionStem、questionOptions、standardAnswer 和 analysis${questionTypeClause}${difficultyClause}；questionOptions 每项必须包含 optionLabel 和 optionText；不得输出供应商请求载荷、原始提示词、内部日志或资料原文。`;
  }

  return `输出 JSON；仅输出一个 JSON 对象，不要输出 Markdown 代码块、解释文字、编号列表或表格；必须包含 title、targetQuestionCount、sections、knowledgeCoverage、difficultyGoal、sourcePreference、questionTypeDistribution 和 paperStructure；targetQuestionCount 必须等于 ${requestedQuestionCount}；sourcePreference 必须为 ${generationParameters?.sourcePreference ?? "balanced"}；questionTypeDistribution 必须为 ${generationParameters?.questionTypeDistribution ?? "balanced_40_30_30"}；paperStructure 必须为 ${generationParameters?.paperStructure ?? "by_question_type"}；sections 每项必须包含 sectionKey、title、questionType、targetQuestionCount、targetScore、knowledgeNodeLabels 和 difficulty；只生成组卷方案，不得生成或引用最终题目正文、选项、答案、解析、供应商请求载荷、原始提示词、内部日志或资料原文。`;
}
