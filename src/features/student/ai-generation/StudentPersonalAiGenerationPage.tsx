"use client";

import {
  AlertCircle,
  BookOpen,
  CheckCircle2,
  ClipboardList,
  Eye,
  History,
  Loader2,
  MessageCircle,
  RefreshCcw,
  Send,
  Sparkles,
  ShieldAlert,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

import {
  fetchCurrentStudentSession,
  fetchStudentApi,
  getStoredStudentSessionToken,
  hasStoredStudentSessionSignal,
  isStudentUnauthorizedResponse,
} from "@/features/student/studentRuntimeApi";
import type { AuthContextDto } from "@/server/contracts/auth-contract";
import type {
  EffectiveAuthorizationContextDto,
  EffectiveAuthorizationListDto,
} from "@/server/contracts/effective-authorization-contract";
import type { PersonalAiGenerationLocalBrowserExperienceDto } from "@/server/contracts/personal-ai-generation-local-browser-experience-contract";
import type { PersonalAiGenerationRequestHistoryDto } from "@/server/contracts/personal-ai-generation-request-history-contract";
import type {
  PersonalAiGenerationResultDetailDto,
  PersonalAiGenerationResultHistoryDto,
} from "@/server/contracts/personal-ai-generation-result-history-contract";
import type {
  PersonalAiGenerationLearningSessionAnswerFeedbackDto,
  PersonalAiGenerationLearningSessionCreationResultDto,
  PersonalAiGenerationLearningSessionProgressResultDto,
  PersonalAiGenerationLearningSessionQuestionDto,
} from "@/server/contracts/personal-ai-generation-learning-session-contract";
import type { ApiPagination } from "@/server/contracts/api-response";
import type { AiGenerationAvailabilityDto } from "@/server/contracts/ai-generation-availability-contract";
import type {
  AdminKnowledgeNodeOpsListDto,
  AdminKnowledgeNodeOpsSummaryDto,
} from "@/server/contracts/admin-content-knowledge-ops-contract";
import type {
  AiGenerationRouteIntegratedGenerationParameters,
  AiGenerationRouteIntegratedKnowledgeNodeMode,
  AiGenerationRouteIntegratedSourcePreference,
} from "@/server/contracts/route-integrated-provider-execution-contract";
import { createDefaultAiGenerationRouteIntegratedKnowledgeScope } from "@/server/contracts/route-integrated-provider-execution-contract";
import { createPersonalAiLearningSessionQuestion } from "@/server/validators/personal-ai-generation-learning-session";

type StudentPersonalAiGenerationPageState =
  | "checking"
  | "empty"
  | "loading"
  | "ready"
  | "error"
  | "unauthorized"
  | "unavailable";

type StudentPersonalAiGenerationHistoryState =
  | "empty"
  | "loading"
  | "ready"
  | "error"
  | "unauthorized";

type StudentAiGenerationAvailabilityState =
  | "loading"
  | "available"
  | "closed"
  | "error";

type StudentPersonalAiGenerationResultDetailState =
  | "idle"
  | StudentPersonalAiGenerationHistoryState;

type StudentPersonalAiGenerationPracticeFeedbackState =
  | "waiting"
  | "insufficient"
  | "practice_ready"
  | "answer_submitted"
  | "feedback_ready";

type StudentAiLearningAnswerFeedback = {
  isCorrect: boolean | null;
  score: string | null;
  maxScore: string;
  standardAnswerLabels: string[];
  standardAnswerText: string | null;
  analysis: string | null;
};

type StudentAiLearningAnswerFeedbackByQuestion = Record<
  string,
  StudentAiLearningAnswerFeedback
>;

type StudentAiLearningSelectedLabelsByQuestion = Record<string, string[]>;

type StudentSessionRequestToken = string | null;
type StudentAuthorizationListPayload = EffectiveAuthorizationListDto;
type StudentPersonalAiGenerationTaskType =
  | "ai_question_generation"
  | "ai_paper_generation";

type StudentPersonalAiGenerationRequestDraft = {
  userPublicId: string;
  requestPublicId: string;
  authorizationPublicId: string;
  redeemCodePublicId: string | null;
  auditLogPublicId: string | null;
  aiCallLogPublicId: string | null;
  taskPublicId: string;
  taskType: StudentPersonalAiGenerationTaskType;
  actorPublicId: string;
  authorizationSource: "personal_auth" | "org_auth";
  ownerType: "personal" | "organization";
  ownerPublicId: string;
  organizationPublicId: string | null;
  quotaOwnerType: "personal" | "organization";
  quotaOwnerPublicId: string;
  effectiveEdition: "advanced";
  isAuthorizationActive: boolean;
  isScopeAllowed: boolean;
  isQuotaAvailable: boolean;
  isRuntimeConfigReady: boolean;
  idempotencyKeyHash: string;
  existingTaskPublicId: string | null;
  existingTaskStatus: string | null;
  resultPublicId: string | null;
  evidenceStatus: "sufficient" | "weak" | "none";
  citationCount: number;
};

type StudentPersonalAiGenerationDetailControl = {
  label: string;
  kind: "number" | "select" | "text" | "textarea";
  helperText?: string;
  max?: number;
  min?: number;
  placeholder?: string;
  options?: string[];
  value?: number | string;
  onValueChange?: (value: string) => void;
};

type StudentAiKnowledgeScopeFormState = {
  knowledgeNodeMode: AiGenerationRouteIntegratedKnowledgeNodeMode;
  knowledgeNodePublicIds: string[];
  includeDescendants: boolean;
  knowledgeNodeSupplement: string;
};

type StudentAiKnowledgeNodeOption = {
  publicId: string;
  label: string;
  description: string;
};

type StudentAiKnowledgeNodeLoadState =
  | "idle"
  | "loading"
  | "ready"
  | "empty"
  | "error";
type StudentAiPaperQuestionTypeDistribution = NonNullable<
  AiGenerationRouteIntegratedGenerationParameters["questionTypeDistribution"]
>;
type StudentAiPaperStructure = NonNullable<
  AiGenerationRouteIntegratedGenerationParameters["paperStructure"]
>;
type StudentAiPaperAssemblyContainer = NonNullable<
  PersonalAiGenerationLocalBrowserExperienceDto["runtimeBridge"]["paperAssembly"]
>["container"];
type StudentAiPaperAssembly = NonNullable<
  PersonalAiGenerationLocalBrowserExperienceDto["runtimeBridge"]["paperAssembly"]
>;

const PERSONAL_AI_GENERATION_RESULT_DETAIL_NOT_FOUND_CODE = 404045;
const PERSONAL_AI_GENERATION_HISTORY_PAGE = 1;
const PERSONAL_AI_GENERATION_HISTORY_PAGE_SIZE = 10;
const AI_QUESTION_DEFAULT_QUESTION_COUNT = 3;
const AI_QUESTION_MAX_QUESTION_COUNT = 10;
const AI_PAPER_DEFAULT_QUESTION_COUNT = 30;
const AI_PAPER_MAX_QUESTION_COUNT = 80;
const DEFAULT_STUDENT_AI_GENERATION_HISTORY_TASK_TYPE =
  "ai_question_generation" satisfies StudentPersonalAiGenerationTaskType;
const studentAiPaperQuestionTypeDistributionOptions = [
  "均衡分布",
  "单选50% / 多选25% / 判断25%",
  "薄弱点优先",
] as const;
const studentAiPaperStructureOptions = [
  "按题型分大题",
  "按知识点分大题",
] as const;

const knowledgeNodeModeOptions: {
  value: AiGenerationRouteIntegratedKnowledgeNodeMode;
  label: string;
}[] = [
  { value: "balanced", label: "均衡覆盖" },
  { value: "selected", label: "指定知识点" },
  { value: "weak_point_priority", label: "薄弱知识点优先" },
  { value: "comprehensive", label: "综合测验" },
];

const copy = {
  title: "AI训练",
  subtitle:
    "面向高级授权学习者的 AI出题 和 AI组卷入口；依据资料充足时可生成本次训练内容。",
  emptyTitle: "\u5c1a\u672a\u63d0\u4ea4\u751f\u6210\u8bf7\u6c42",
  emptyDescription:
    "\u70b9\u51fb\u6309\u94ae\u540e\uff0c\u9875\u9762\u4f1a\u6309\u5f53\u524d\u6388\u6743\u8303\u56f4\u5c1d\u8bd5\u751f\u6210\u8bad\u7ec3\u8349\u7a3f\u3002",
  requestButton: "AI出题：生成练习题",
  paperButton: "AI组卷：生成自测试卷",
  questionSubmitButton: "生成练习题草稿",
  paperSubmitButton: "生成自测试卷",
  employeePaperSubmitButton: "生成企业自测试卷",
  loadingTitle: "\u6b63\u5728\u53d1\u8d77\u751f\u6210\u8bf7\u6c42",
  errorTitle: "\u672c\u5730 AI \u8bf7\u6c42\u5931\u8d25",
  errorDescription:
    "\u8bf7\u7a0d\u540e\u5237\u65b0\u9875\u9762\u6216\u91cd\u65b0\u767b\u5f55\u540e\u518d\u5c1d\u8bd5\u3002",
  unauthorizedTitle: "\u8bf7\u5148\u767b\u5f55",
  unauthorizedDescription:
    "\u4e2a\u4eba AI \u5b66\u4e60\u9700\u8981\u6709\u6548\u7684\u5b66\u5458\u4f1a\u8bdd\u3002",
  checkingTitle: "\u6b63\u5728\u6821\u9a8c\u5b66\u5458\u4f1a\u8bdd",
  unavailableTitle:
    "\u5f53\u524d\u6388\u6743\u6682\u672a\u5f00\u653e AI \u8bad\u7ec3",
  unavailableDescription:
    "\u8bf7\u786e\u8ba4\u5df2\u9009\u62e9\u6709\u6548\u7684\u9ad8\u7ea7\u6388\u6743\u8303\u56f4\u3002",
  blockedTitle: "\u8bf7\u6c42\u5df2\u963b\u65ad",
  contractTitle: "\u751f\u6210\u4efb\u52a1\u5df2\u53d7\u7406",
  historyTitle: "\u751f\u6210\u8bf7\u6c42\u5386\u53f2\u8bb0\u5f55",
  historyEmptyTitle: "\u6682\u65e0\u5386\u53f2\u8bf7\u6c42",
  historyLoadingTitle: "\u5386\u53f2\u8bf7\u6c42\u540c\u6b65\u4e2d",
  historyErrorTitle: "\u5386\u53f2\u8bf7\u6c42\u6682\u4e0d\u53ef\u7528",
  historyUnauthorizedTitle:
    "\u767b\u5f55\u540e\u67e5\u770b\u8bf7\u6c42\u5386\u53f2",
  resultHistoryTitle: "\u8bad\u7ec3\u7ed3\u679c\u5386\u53f2\u8bb0\u5f55",
  resultHistoryEmptyTitle: "\u6682\u65e0\u5386\u53f2\u7ed3\u679c",
  resultHistoryLoadingTitle: "\u7ed3\u679c\u5386\u53f2\u540c\u6b65\u4e2d",
  resultHistoryErrorTitle: "\u7ed3\u679c\u5386\u53f2\u6682\u4e0d\u53ef\u7528",
  resultHistoryUnauthorizedTitle:
    "\u767b\u5f55\u540e\u67e5\u770b\u7ed3\u679c\u5386\u53f2",
  resultDetailTitle: "\u7ed3\u679c\u8be6\u60c5",
  resultDetailButton: "\u67e5\u770b\u7ed3\u679c\u8be6\u60c5",
  resultDetailLoadingTitle: "\u7ed3\u679c\u8be6\u60c5\u540c\u6b65\u4e2d",
  resultDetailEmptyTitle:
    "\u7ed3\u679c\u8be6\u60c5\u6682\u65e0\u53ef\u7528\u8bad\u7ec3\u5185\u5bb9",
  resultDetailErrorTitle: "\u7ed3\u679c\u8be6\u60c5\u6682\u4e0d\u53ef\u7528",
  resultDetailUnauthorizedTitle:
    "\u767b\u5f55\u540e\u67e5\u770b\u7ed3\u679c\u8be6\u60c5",
  practiceFeedbackTitle: "\u4f5c\u7b54\u4e0e\u89e3\u6790",
  practiceFeedbackDescription:
    "\u751f\u6210\u5185\u5bb9\u5c31\u7eea\u540e\uff0c\u53ef\u4ee5\u5f00\u59cb\u4f5c\u7b54\u3001\u63d0\u4ea4\u7b54\u6848\u5e76\u67e5\u770b\u89e3\u6790\uff1b\u4e0d\u5199\u5165\u6b63\u5f0f\u9898\u76ee\u6216\u8bd5\u5377\u3002",
};

const contractFieldLabelMap: Record<string, string> = {
  citationCount: "依据数量",
  contentPreviewMasked: "生成内容摘要",
  evidenceStatus: "依据资料状态",
  experienceSurface: "体验入口",
  flowStatus: "流程状态",
  formalAdoptionStatus: "学习内容边界",
  formalAdoptionWriteStatus: "学习内容边界",
  isFormalAdoptionBlocked: "学习闭环限制",
  authorizationSource: "授权来源",
  ownerType: "使用上下文",
  quotaOwnerType: "额度上下文",
  persistedAt: "持久化时间",
  requestedAt: "请求时间",
  resultStatus: "结果状态",
  runtimeStatus: "运行状态",
  status: "状态",
  taskType: "任务类型",
};

const contractValueLabelMap: Record<string, string> = {
  accepted: "已受理",
  ai_paper_generation: "AI组卷",
  ai_question_generation: "AI出题",
  blocked: "暂不可用",
  blocked_without_follow_up_task: "需后续审批",
  draft: "生成内容",
  false: "可继续学习",
  local_contract_only: "任务已受理",
  metadata_only: "基础信息",
  none: "依据不足",
  org_auth: "组织授权",
  organization: "组织上下文",
  pending: "处理中",
  personal: "个人上下文",
  personal_auth: "个人授权",
  quota_insufficient: "额度不足",
  ready: "就绪",
  student_local_browser: "AI训练页",
  succeeded: "已完成",
  sufficient: "依据充足",
  true: "保持学习域",
  unknown: "未知原因",
  weak: "依据较少",
};

const aiPaperQuestionTypeLabelMap: Record<string, string> = {
  single_choice: "单选题",
  multi_choice: "多选题",
  true_false: "判断题",
  short_answer: "主观题",
};

const aiPaperMatchQualityLabelMap: Record<string, string> = {
  fully_matched: "完全匹配",
  supplemented_from_nearby_knowledge: "相近知识点补足",
  supplemented_from_same_scope: "同范围补足",
  insufficient: "题源不足",
};

const aiPaperSourceKindLabelMap: Record<string, string> = {
  platform_formal_question: "平台正式题",
  enterprise_training_snapshot: "企业训练题",
};

const aiPaperEnterpriseSourceStatusLabelMap: Record<string, string> = {
  not_applicable: "不适用",
  resolved: "已纳入",
  not_resolved: "未纳入",
};

const practiceFeedbackStatusLabelMap: Record<
  StudentPersonalAiGenerationPracticeFeedbackState,
  string
> = {
  waiting: "生成后可进入作答、提交答案并查看解析",
  insufficient: "依据或正式题源不足时请调整参数后重试生成",
  practice_ready: "练习内容已就绪",
  answer_submitted: "作答已提交",
  feedback_ready: "解析可查看",
};

const aiQuestionDetailControls: StudentPersonalAiGenerationDetailControl[] = [
  {
    label: "AI出题专业",
    kind: "select",
    options: ["按当前授权专业"],
  },
  {
    label: "AI出题等级",
    kind: "select",
    options: ["按当前授权等级"],
  },
  {
    label: "AI出题科目",
    kind: "select",
    options: ["理论", "技能"],
  },
  {
    label: "AI出题题型",
    kind: "select",
    options: ["单选题", "多选题", "判断题", "主观题"],
  },
  {
    label: "AI出题题目数量",
    kind: "number",
    placeholder: "输入题目数量",
    helperText: "默认 3 题，最多 10 题。",
  },
  {
    label: "AI出题难度",
    kind: "select",
    options: ["基础", "中等", "提高"],
  },
  {
    label: "AI出题学习目标",
    kind: "textarea",
    placeholder: "描述本次练习目标",
  },
];

const aiPaperDetailControls: StudentPersonalAiGenerationDetailControl[] = [
  {
    label: "AI组卷专业",
    kind: "select",
    options: ["按当前授权专业"],
  },
  {
    label: "AI组卷等级",
    kind: "select",
    options: ["按当前授权等级"],
  },
  {
    label: "AI组卷科目",
    kind: "select",
    options: ["理论", "技能"],
  },
  {
    label: "AI组卷题目数量",
    kind: "number",
    placeholder: "输入自测题量",
    helperText: "默认 30 题，最多 80 题。",
  },
  {
    label: "AI组卷题型分布",
    kind: "select",
    options: [...studentAiPaperQuestionTypeDistributionOptions],
  },
  {
    label: "AI组卷大题结构",
    kind: "select",
    options: [...studentAiPaperStructureOptions],
  },
  {
    label: "AI组卷难度",
    kind: "select",
    options: ["基础", "中等", "提高"],
  },
  {
    label: "AI组卷时长目标",
    kind: "number",
    placeholder: "输入建议分钟数",
  },
  {
    label: "AI组卷学习目标",
    kind: "textarea",
    placeholder: "描述本次自测目标",
  },
];

function normalizeStudentAiQuestionCount(
  value: number,
  defaultValue: number,
  maxValue: number,
): number {
  if (!Number.isFinite(value)) {
    return defaultValue;
  }

  return Math.min(maxValue, Math.max(1, Math.trunc(value)));
}

function createStudentAiQuestionDetailControls(input: {
  questionCount: number;
  onQuestionCountChange: (value: string) => void;
}): StudentPersonalAiGenerationDetailControl[] {
  return aiQuestionDetailControls.map((control) =>
    control.label === "AI出题题目数量"
      ? {
          ...control,
          max: AI_QUESTION_MAX_QUESTION_COUNT,
          min: 1,
          onValueChange: input.onQuestionCountChange,
          value: input.questionCount,
        }
      : control,
  );
}

function createStudentAiPaperDetailControls(input: {
  questionCount: number;
  onQuestionCountChange: (value: string) => void;
  questionTypeDistribution: string;
  onQuestionTypeDistributionChange: (value: string) => void;
  paperStructure: string;
  onPaperStructureChange: (value: string) => void;
  difficulty: string;
  onDifficultyChange: (value: string) => void;
  learningObjective: string;
  onLearningObjectiveChange: (value: string) => void;
}): StudentPersonalAiGenerationDetailControl[] {
  return aiPaperDetailControls.map((control) => {
    if (control.label === "AI组卷题目数量") {
      return {
        ...control,
        max: AI_PAPER_MAX_QUESTION_COUNT,
        min: 1,
        onValueChange: input.onQuestionCountChange,
        value: input.questionCount,
      };
    }

    if (control.label === "AI组卷题型分布") {
      return {
        ...control,
        onValueChange: input.onQuestionTypeDistributionChange,
        value: input.questionTypeDistribution,
      };
    }

    if (control.label === "AI组卷大题结构") {
      return {
        ...control,
        onValueChange: input.onPaperStructureChange,
        value: input.paperStructure,
      };
    }

    if (control.label === "AI组卷难度") {
      return {
        ...control,
        onValueChange: input.onDifficultyChange,
        value: input.difficulty,
      };
    }

    if (control.label === "AI组卷学习目标") {
      return {
        ...control,
        onValueChange: input.onLearningObjectiveChange,
        value: input.learningObjective,
      };
    }

    return control;
  });
}

function createDefaultStudentAiKnowledgeScopeState(): StudentAiKnowledgeScopeFormState {
  return {
    knowledgeNodeMode: "balanced",
    knowledgeNodePublicIds: [],
    includeDescendants: true,
    knowledgeNodeSupplement: "",
  };
}

function normalizeKnowledgeNodeSupplement(value: string): string | null {
  const normalizedValue = value.trim();

  return normalizedValue.length > 0 ? normalizedValue : null;
}

function getStudentAiKnowledgeScopeBlockedReason(
  knowledgeScopeState: StudentAiKnowledgeScopeFormState,
  knowledgeNodeOptions: StudentAiKnowledgeNodeOption[],
  knowledgeNodeLoadState: StudentAiKnowledgeNodeLoadState,
): string | null {
  if (knowledgeScopeState.knowledgeNodeMode !== "selected") {
    return null;
  }

  if (
    knowledgeNodeLoadState === "idle" ||
    knowledgeNodeLoadState === "loading"
  ) {
    return "知识点列表加载中，请稍后选择。";
  }

  if (knowledgeNodeLoadState === "error") {
    return "知识点列表暂不可用，请改用均衡覆盖或稍后重试。";
  }

  if (knowledgeNodeOptions.length === 0) {
    return "当前授权范围暂无可选知识点，请改用均衡覆盖或联系内容管理员维护知识点。";
  }

  const knowledgeNodeOptionPublicIds = new Set(
    knowledgeNodeOptions.map((knowledgeNodeOption) => {
      return knowledgeNodeOption.publicId;
    }),
  );

  if (
    knowledgeScopeState.knowledgeNodePublicIds.some(
      (publicId) => !knowledgeNodeOptionPublicIds.has(publicId),
    )
  ) {
    return "已选知识点不在当前授权范围内，请重新选择。";
  }

  if (knowledgeScopeState.knowledgeNodePublicIds.length === 0) {
    return "请选择至少一个知识点后再提交。";
  }

  return null;
}

function createStudentAiKnowledgeNodeOptionsPath(
  authorizationContext: EffectiveAuthorizationContextDto,
) {
  const searchParams = new URLSearchParams({
    page: "1",
    pageSize: "100",
    sortBy: "sortOrder",
    sortOrder: "asc",
    status: "active",
    profession: authorizationContext.profession,
    level: String(authorizationContext.level),
  });

  return `/api/v1/ai-generation/knowledge-nodes?${searchParams.toString()}`;
}

function isStudentAiKnowledgeNodeVisibleForAuthorizationContext(
  knowledgeNode: AdminKnowledgeNodeOpsSummaryDto,
  authorizationContext: EffectiveAuthorizationContextDto,
): boolean {
  return (
    knowledgeNode.knStatus === "active" &&
    knowledgeNode.isRecommendable &&
    knowledgeNode.profession === authorizationContext.profession &&
    (knowledgeNode.levelList.length === 0 ||
      knowledgeNode.levelList.includes(authorizationContext.level))
  );
}

function mapStudentAiKnowledgeNodeOption(
  knowledgeNode: AdminKnowledgeNodeOpsSummaryDto,
): StudentAiKnowledgeNodeOption {
  return {
    publicId: knowledgeNode.publicId,
    label: knowledgeNode.pathName,
    description: `${getProfessionLabel(knowledgeNode.profession)} / ${knowledgeNode.levelList.join(", ") || "全等级"}`,
  };
}

function createStudentGenerationKnowledgeScope(
  knowledgeScopeState: StudentAiKnowledgeScopeFormState,
  sourcePreference: AiGenerationRouteIntegratedSourcePreference | null,
) {
  const knowledgeNodeSupplement = normalizeKnowledgeNodeSupplement(
    knowledgeScopeState.knowledgeNodeSupplement,
  );

  return createDefaultAiGenerationRouteIntegratedKnowledgeScope({
    knowledgeNode: knowledgeNodeSupplement,
    knowledgeNodeMode: knowledgeScopeState.knowledgeNodeMode,
    knowledgeNodePublicIds: knowledgeScopeState.knowledgeNodePublicIds,
    includeDescendants:
      knowledgeScopeState.knowledgeNodePublicIds.length > 0 &&
      knowledgeScopeState.includeDescendants,
    knowledgeNodeSupplement,
    sourcePreference,
  });
}

function mapStudentAiPaperSourcePreference(
  value: string,
  authorizationContext: EffectiveAuthorizationContextDto,
): AiGenerationRouteIntegratedSourcePreference | null {
  if (authorizationContext.ownerType !== "organization") {
    return null;
  }

  if (value === "优先使用企业题") {
    return "prefer_enterprise";
  }

  if (value === "优先使用平台题") {
    return "prefer_platform";
  }

  return "balanced";
}

function mapStudentAiPaperQuestionTypeDistribution(
  value: string,
): StudentAiPaperQuestionTypeDistribution {
  if (value === "单选50% / 多选25% / 判断25%") {
    return "single_50_multi_25_true_false_25";
  }

  if (value === "薄弱点优先") {
    return "weak_point_priority";
  }

  return "balanced_40_30_30";
}

function mapStudentAiPaperStructure(value: string): StudentAiPaperStructure {
  return value === "按知识点分大题" ? "by_knowledge_node" : "by_question_type";
}

function mapStudentAiDifficulty(value: string): string {
  if (value === "基础") {
    return "easy";
  }

  if (value === "提高") {
    return "hard";
  }

  return "medium";
}

const personalAiGenerationRequestDraft: StudentPersonalAiGenerationRequestDraft =
  {
    userPublicId: "student-public-001",
    requestPublicId: "personal-ai-request-public-001",
    authorizationPublicId: "personal-auth-public-001",
    redeemCodePublicId: null,
    auditLogPublicId: null,
    aiCallLogPublicId: null,
    taskPublicId: "ai-generation-task-public-001",
    taskType: "ai_question_generation",
    actorPublicId: "student-public-001",
    authorizationSource: "personal_auth",
    ownerType: "personal",
    ownerPublicId: "student-public-001",
    organizationPublicId: null,
    quotaOwnerType: "personal",
    quotaOwnerPublicId: "student-public-001",
    effectiveEdition: "advanced",
    isAuthorizationActive: true,
    isScopeAllowed: true,
    isQuotaAvailable: true,
    isRuntimeConfigReady: true,
    idempotencyKeyHash: "sha256:student-local-request",
    existingTaskPublicId: null,
    existingTaskStatus: null,
    resultPublicId: null,
    evidenceStatus: "none",
    citationCount: 0,
  };

let personalAiGenerationRequestSequence = 0;

function createPersonalAiGenerationDraftForTask(
  taskType: StudentPersonalAiGenerationTaskType,
): StudentPersonalAiGenerationRequestDraft {
  return {
    ...personalAiGenerationRequestDraft,
    taskType,
  };
}

function createPersonalAiGenerationRequestUniqueSuffix(): string {
  personalAiGenerationRequestSequence += 1;

  const sequenceSegment = personalAiGenerationRequestSequence.toString(36);
  const timeSegment = Date.now().toString(36);
  const randomSegment =
    typeof globalThis.crypto?.randomUUID === "function"
      ? globalThis.crypto.randomUUID()
      : `${timeSegment}-${sequenceSegment}`;

  return `${timeSegment}-${sequenceSegment}-${randomSegment}`;
}

function createPersonalAiGenerationRequestIdentifiers() {
  const uniqueSuffix = createPersonalAiGenerationRequestUniqueSuffix();

  return {
    requestPublicId: `personal-ai-request-public-${uniqueSuffix}`,
    taskPublicId: `ai-generation-task-public-${uniqueSuffix}`,
    idempotencyKeyHash: `sha256:student-local-request-${uniqueSuffix}`,
  };
}

function readHasStudentSessionToken(): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  return hasStoredStudentSessionSignal();
}

function readStudentSessionRequestToken(): StudentSessionRequestToken {
  return getStoredStudentSessionToken();
}

function isStudentAccessDeniedResponse(payload: { code: number }): boolean {
  return payload.code >= 403000 && payload.code < 404000;
}

function readAuthorizationContexts(
  payload: StudentAuthorizationListPayload,
): EffectiveAuthorizationContextDto[] {
  return payload.authorizationContexts ?? [];
}

function canUseAuthorizationContextForPersonalAiGeneration(
  authorizationContext: EffectiveAuthorizationContextDto,
): boolean {
  return (
    authorizationContext.effectiveEdition === "advanced" &&
    (authorizationContext.capabilities.canGenerateAiQuestion ||
      authorizationContext.capabilities.canGenerateAiPaper)
  );
}

function canUseAuthorizationContextForPersonalAiGenerationTask(
  authorizationContext: EffectiveAuthorizationContextDto,
  taskType: StudentPersonalAiGenerationTaskType,
): boolean {
  if (authorizationContext.effectiveEdition !== "advanced") {
    return false;
  }

  return taskType === "ai_question_generation"
    ? authorizationContext.capabilities.canGenerateAiQuestion
    : authorizationContext.capabilities.canGenerateAiPaper;
}

function readPersonalAiGenerationAuthorizationContexts(
  authorizationContexts: EffectiveAuthorizationContextDto[],
): EffectiveAuthorizationContextDto[] {
  return authorizationContexts.filter(
    canUseAuthorizationContextForPersonalAiGeneration,
  );
}

function selectPersonalAiGenerationAuthorizationContext(
  authorizationContexts: EffectiveAuthorizationContextDto[],
  taskType: StudentPersonalAiGenerationTaskType,
  selectedAuthorizationPublicId: string | null,
): EffectiveAuthorizationContextDto | null {
  const selectedAuthorizationContext =
    selectedAuthorizationPublicId === null
      ? null
      : (authorizationContexts.find(
          (authorizationContext) =>
            authorizationContext.authorizationPublicId ===
            selectedAuthorizationPublicId,
        ) ?? null);

  if (selectedAuthorizationContext === null) {
    return null;
  }

  return canUseAuthorizationContextForPersonalAiGenerationTask(
    selectedAuthorizationContext,
    taskType,
  )
    ? selectedAuthorizationContext
    : null;
}

function readAuthorizationPublicIdFromLocation(): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  const authorizationPublicId = new URLSearchParams(window.location.search).get(
    "authorizationPublicId",
  );
  const normalizedAuthorizationPublicId = authorizationPublicId?.trim() ?? "";

  return normalizedAuthorizationPublicId.length === 0
    ? null
    : normalizedAuthorizationPublicId;
}

function writeAuthorizationPublicIdToLocation(authorizationPublicId: string) {
  if (typeof window === "undefined") {
    return;
  }

  const currentUrl = new URL(window.location.href);
  currentUrl.searchParams.set("authorizationPublicId", authorizationPublicId);
  window.history.replaceState(
    window.history.state,
    "",
    currentUrl.pathname + currentUrl.search + currentUrl.hash,
  );
}

function createStudentGenerationParameters(
  authorizationContext: EffectiveAuthorizationContextDto,
  taskType: StudentPersonalAiGenerationTaskType,
  questionCount: number,
  knowledgeScopeState: StudentAiKnowledgeScopeFormState,
  sourcePreference: AiGenerationRouteIntegratedSourcePreference | null,
  paperParameters?: {
    questionTypeDistribution: StudentAiPaperQuestionTypeDistribution;
    paperStructure: StudentAiPaperStructure;
    difficulty: string | null;
    learningObjective: string | null;
  },
): AiGenerationRouteIntegratedGenerationParameters {
  const baseParameters: AiGenerationRouteIntegratedGenerationParameters = {
    profession: authorizationContext.profession,
    level:
      authorizationContext.level === 1 ||
      authorizationContext.level === 2 ||
      authorizationContext.level === 3 ||
      authorizationContext.level === 4 ||
      authorizationContext.level === 5
        ? authorizationContext.level
        : 3,
    subject: "theory",
    ...createStudentGenerationKnowledgeScope(
      knowledgeScopeState,
      sourcePreference,
    ),
    questionType:
      taskType === "ai_question_generation" ? "single_choice" : null,
    questionCount,
    difficulty:
      taskType === "ai_paper_generation"
        ? (paperParameters?.difficulty ?? null)
        : "medium",
    learningObjective:
      taskType === "ai_paper_generation"
        ? (paperParameters?.learningObjective ?? null)
        : "弱项巩固",
  };

  return taskType === "ai_paper_generation" && paperParameters !== undefined
    ? {
        ...baseParameters,
        questionTypeDistribution: paperParameters.questionTypeDistribution,
        paperStructure: paperParameters.paperStructure,
      }
    : baseParameters;
}

async function fetchPersonalAiGenerationAuthorizationContexts(
  studentSessionValue: StudentSessionRequestToken,
): Promise<EffectiveAuthorizationContextDto[]> {
  try {
    const authorizationPayload =
      await fetchStudentApi<StudentAuthorizationListPayload>(
        "/api/v1/authorizations",
        studentSessionValue,
        {
          method: "GET",
        },
      );

    if (
      isStudentUnauthorizedResponse(authorizationPayload) ||
      authorizationPayload.code !== 0 ||
      authorizationPayload.data === null
    ) {
      return [];
    }

    return readAuthorizationContexts(authorizationPayload.data);
  } catch {
    return [];
  }
}

function createPersonalAiGenerationRequestBody(
  draft: StudentPersonalAiGenerationRequestDraft,
  sessionUser: AuthContextDto["user"],
  generationParameters: AiGenerationRouteIntegratedGenerationParameters,
  authorizationContext: EffectiveAuthorizationContextDto,
  requestIdentifiers = createPersonalAiGenerationRequestIdentifiers(),
) {
  const userPublicId = sessionUser.publicId;
  const ownerType =
    authorizationContext.ownerType === "organization"
      ? ("organization" as const)
      : ("personal" as const);
  const quotaOwnerType =
    authorizationContext.quotaOwnerType === "organization"
      ? ("organization" as const)
      : ("personal" as const);
  const organizationPublicId =
    authorizationContext.authorizationSource === "org_auth"
      ? (authorizationContext.organizationPublicId ??
        authorizationContext.ownerPublicId)
      : null;

  return {
    responseMode: "local_browser_experience",
    ...draft,
    ...requestIdentifiers,
    authorizationPublicId: authorizationContext.authorizationPublicId,
    authorizationSource: authorizationContext.authorizationSource,
    ownerType,
    ownerPublicId: authorizationContext.ownerPublicId,
    organizationPublicId,
    quotaOwnerType,
    quotaOwnerPublicId: authorizationContext.quotaOwnerPublicId,
    generationParameters,
    userPublicId,
    actorPublicId: userPublicId,
  };
}

async function fetchPersonalAiGenerationResultHistory(
  studentSessionValue: StudentSessionRequestToken,
  taskType: StudentPersonalAiGenerationTaskType,
  page: number,
  authorizationPublicId: string,
): Promise<{
  code: number;
  message: string;
  data: PersonalAiGenerationResultHistoryDto | null;
  pagination?: ApiPagination;
}> {
  return fetchStudentApi<PersonalAiGenerationResultHistoryDto>(
    createPersonalAiGenerationHistoryPath(
      "/api/v1/personal-ai-generation-results",
      taskType,
      page,
      authorizationPublicId,
    ),
    studentSessionValue,
    {
      method: "GET",
    },
  );
}

async function fetchPersonalAiGenerationResultDetail(
  studentSessionValue: StudentSessionRequestToken,
  resultPublicId: string,
  authorizationPublicId: string,
): Promise<{
  code: number;
  message: string;
  data: PersonalAiGenerationResultDetailDto | null;
}> {
  return fetchStudentApi<PersonalAiGenerationResultDetailDto>(
    `/api/v1/personal-ai-generation-results/${encodeURIComponent(
      resultPublicId,
    )}?${new URLSearchParams({ authorizationPublicId }).toString()}`,
    studentSessionValue,
    {
      method: "GET",
    },
  );
}

async function fetchPersonalAiGenerationRequestHistoryForSession(
  studentSessionValue: StudentSessionRequestToken,
  taskType: StudentPersonalAiGenerationTaskType,
  page: number,
  authorizationPublicId: string,
): Promise<{
  code: number;
  message: string;
  data: PersonalAiGenerationRequestHistoryDto | null;
  pagination?: ApiPagination;
}> {
  return fetchStudentApi<PersonalAiGenerationRequestHistoryDto>(
    createPersonalAiGenerationHistoryPath(
      "/api/v1/personal-ai-generation-requests",
      taskType,
      page,
      authorizationPublicId,
    ),
    studentSessionValue,
    {
      method: "GET",
    },
  );
}

type PersonalAiLearningSessionRequestBody =
  | { sourceResultPublicId: string }
  | {
      sessionPublicId: string;
      sourceResultPublicId: string;
      sourceTaskPublicId: string;
      ownerType?: "personal" | "organization";
      ownerPublicId?: string;
      visibleGeneratedContent: NonNullable<
        PersonalAiGenerationLocalBrowserExperienceDto["runtimeBridge"]["visibleGeneratedContent"]
      >;
      paperAssemblyContainer?: StudentAiPaperAssemblyContainer;
    };

async function fetchCreatePersonalAiLearningSession(
  studentSessionValue: StudentSessionRequestToken,
  input: PersonalAiLearningSessionRequestBody & {
    authorizationPublicId: string;
  },
): Promise<{
  code: number;
  message: string;
  data: PersonalAiGenerationLearningSessionCreationResultDto | null;
}> {
  return fetchStudentApi<PersonalAiGenerationLearningSessionCreationResultDto>(
    "/api/v1/personal-ai-generation-learning-sessions",
    studentSessionValue,
    {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify(input),
    },
  );
}

async function fetchSubmitPersonalAiLearningAnswer(
  studentSessionValue: StudentSessionRequestToken,
  sessionPublicId: string,
  authorizationPublicId: string,
  input: {
    sessionQuestionPublicId: string;
    selectedOptionLabels: string[];
    textAnswer: string | null;
  },
): Promise<{
  code: number;
  message: string;
  data: PersonalAiGenerationLearningSessionAnswerFeedbackDto | null;
}> {
  return fetchStudentApi<PersonalAiGenerationLearningSessionAnswerFeedbackDto>(
    `/api/v1/personal-ai-generation-learning-sessions/${encodeURIComponent(
      sessionPublicId,
    )}/answers?${new URLSearchParams({ authorizationPublicId }).toString()}`,
    studentSessionValue,
    {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify(input),
    },
  );
}

async function fetchPersonalAiLearningSessionProgress(
  studentSessionValue: StudentSessionRequestToken,
  sessionPublicId: string,
  authorizationPublicId: string,
): Promise<{
  code: number;
  message: string;
  data: PersonalAiGenerationLearningSessionProgressResultDto | null;
}> {
  return fetchStudentApi<PersonalAiGenerationLearningSessionProgressResultDto>(
    `/api/v1/personal-ai-generation-learning-sessions/${encodeURIComponent(
      sessionPublicId,
    )}/progress?${new URLSearchParams({ authorizationPublicId }).toString()}`,
    studentSessionValue,
    {
      method: "GET",
    },
  );
}

function createPersonalAiGenerationHistoryPath(
  basePath: string,
  taskType: StudentPersonalAiGenerationTaskType,
  page: number,
  authorizationPublicId: string,
): string {
  const searchParams = new URLSearchParams({
    taskType,
    page: String(page),
    pageSize: String(PERSONAL_AI_GENERATION_HISTORY_PAGE_SIZE),
    authorizationPublicId,
  });

  return `${basePath}?${searchParams.toString()}`;
}

function StudentPersonalAiGenerationStateMessage({
  title,
  description,
  tone = "neutral",
}: {
  title: string;
  description: string;
  tone?: "neutral" | "warning";
}) {
  const Icon = tone === "warning" ? ShieldAlert : AlertCircle;

  return (
    <section className="border-border bg-surface flex flex-col gap-3 rounded-xl border p-4">
      <div className="flex items-start gap-3">
        <div className="bg-secondary text-secondary-foreground flex size-10 shrink-0 items-center justify-center rounded-lg">
          <Icon className="size-5" aria-hidden="true" />
        </div>
        <div className="min-w-0 space-y-1">
          <h2 className="font-heading text-text-primary text-base font-semibold">
            {title}
          </h2>
          <p className="text-text-secondary text-sm leading-6">{description}</p>
        </div>
      </div>
    </section>
  );
}

function StudentPersonalAiGenerationDetailField({
  control,
  disabled,
}: {
  control: StudentPersonalAiGenerationDetailControl;
  disabled: boolean;
}) {
  const baseControlClass =
    "border-border bg-background text-text-primary min-h-10 w-full rounded-lg border px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-60";

  return (
    <label className="text-text-secondary flex flex-col gap-1 text-sm">
      <span>{control.label}</span>
      {control.kind === "select" ? (
        <select
          aria-label={control.label}
          disabled={disabled}
          onChange={(event) => control.onValueChange?.(event.target.value)}
          className={baseControlClass}
          value={control.value ?? control.options?.[0] ?? ""}
        >
          {(control.options ?? []).map((optionLabel) => (
            <option key={optionLabel} value={optionLabel}>
              {optionLabel}
            </option>
          ))}
        </select>
      ) : null}
      {control.kind === "number" ? (
        <input
          aria-label={control.label}
          disabled={disabled}
          max={control.max}
          min={control.min ?? 1}
          onChange={(event) => control.onValueChange?.(event.target.value)}
          type="number"
          inputMode="numeric"
          placeholder={control.placeholder}
          {...(control.value === undefined ? {} : { value: control.value })}
          className={baseControlClass}
        />
      ) : null}
      {control.kind === "text" ? (
        <input
          aria-label={control.label}
          disabled={disabled}
          onChange={(event) => control.onValueChange?.(event.target.value)}
          type="text"
          placeholder={control.placeholder}
          {...(control.value === undefined ? {} : { value: control.value })}
          className={baseControlClass}
        />
      ) : null}
      {control.kind === "textarea" ? (
        <textarea
          aria-label={control.label}
          disabled={disabled}
          onChange={(event) => control.onValueChange?.(event.target.value)}
          rows={3}
          placeholder={control.placeholder}
          {...(control.value === undefined ? {} : { value: control.value })}
          className={baseControlClass}
        />
      ) : null}
      {control.helperText ? (
        <span className="text-text-secondary text-xs leading-5">
          {control.helperText}
        </span>
      ) : null}
    </label>
  );
}

function StudentPersonalAiGenerationDetailControlGroup({
  controls,
  description,
  disabled,
  title,
}: {
  controls: StudentPersonalAiGenerationDetailControl[];
  description: string;
  disabled: boolean;
  title: string;
}) {
  return (
    <fieldset className="border-border bg-surface rounded-lg border p-4">
      <legend className="font-heading text-text-primary px-1 text-base font-semibold">
        {title}
      </legend>
      <p className="text-text-secondary mt-1 text-sm leading-6">
        {description}
      </p>
      <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {controls.map((control) => (
          <StudentPersonalAiGenerationDetailField
            key={control.label}
            control={control}
            disabled={disabled}
          />
        ))}
      </div>
    </fieldset>
  );
}

function ContractField({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-border flex items-center justify-between gap-3 border-b py-3 last:border-b-0">
      <dt className="text-text-secondary text-sm">
        {contractFieldLabelMap[label] ?? label}
      </dt>
      <dd className="text-text-primary max-w-[12rem] truncate text-right text-sm font-medium">
        {contractValueLabelMap[value] ?? value}
      </dd>
    </div>
  );
}

function getAuthorizationSourceLabel(
  authorizationSource: EffectiveAuthorizationContextDto["authorizationSource"],
): string {
  return authorizationSource === "personal_auth" ? "个人授权" : "组织授权";
}

function getEditionLabel(
  edition: EffectiveAuthorizationContextDto["effectiveEdition"] | undefined,
): string {
  return edition === "advanced" ? "高级版" : "标准版";
}

const professionLabelMap: Record<
  EffectiveAuthorizationContextDto["profession"],
  string
> = {
  logistics: "物流",
  marketing: "营销",
  monopoly: "专卖",
};

function getProfessionLabel(
  profession: EffectiveAuthorizationContextDto["profession"],
): string {
  return professionLabelMap[profession];
}

function getDatePart(
  parts: Intl.DateTimeFormatPart[],
  type: Intl.DateTimeFormatPartTypes,
): string {
  return parts.find((part) => part.type === type)?.value ?? "";
}

function formatLearnerDate(value: string | null | undefined): string {
  if (value == null) {
    return "未设置";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "时间暂不可用";
  }

  const parts = new Intl.DateTimeFormat("zh-CN", {
    day: "numeric",
    month: "numeric",
    timeZone: "Asia/Shanghai",
    year: "numeric",
  }).formatToParts(date);

  return `${getDatePart(parts, "year")}年${getDatePart(parts, "month")}月${getDatePart(parts, "day")}日`;
}

function formatLearnerDateTime(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "时间暂不可用";
  }

  const parts = new Intl.DateTimeFormat("zh-CN", {
    day: "numeric",
    hour: "2-digit",
    hour12: false,
    minute: "2-digit",
    month: "numeric",
    timeZone: "Asia/Shanghai",
    year: "numeric",
  }).formatToParts(date);

  return `${getDatePart(parts, "year")}年${getDatePart(parts, "month")}月${getDatePart(parts, "day")}日 ${getDatePart(parts, "hour")}:${getDatePart(parts, "minute")}`;
}

function getQuotaOwnerLabel(
  quotaOwnerType: EffectiveAuthorizationContextDto["quotaOwnerType"],
): string {
  if (quotaOwnerType === "organization") {
    return "组织";
  }

  if (quotaOwnerType === "platform") {
    return "平台";
  }

  return "个人";
}

function getAuthorizationContextAccessibleLabel(
  authorizationContext: EffectiveAuthorizationContextDto,
): string {
  return `${getAuthorizationSourceLabel(
    authorizationContext.authorizationSource,
  )} · ${getEditionLabel(authorizationContext.effectiveEdition)} · ${getProfessionLabel(
    authorizationContext.profession,
  )} ${authorizationContext.level}级`;
}

function StudentPersonalAiGenerationAuthorizationContextSelector({
  authorizationContexts,
  disabled,
  onSelectAuthorizationContext,
  selectedAuthorizationPublicId,
}: {
  authorizationContexts: EffectiveAuthorizationContextDto[];
  disabled: boolean;
  onSelectAuthorizationContext: (authorizationPublicId: string) => void;
  selectedAuthorizationPublicId: string | null;
}) {
  const selectedAuthorizationContext =
    authorizationContexts.find(
      (authorizationContext) =>
        authorizationContext.authorizationPublicId ===
        selectedAuthorizationPublicId,
    ) ?? null;

  if (authorizationContexts.length === 0) {
    return null;
  }

  return (
    <section className="border-border bg-surface rounded-xl border p-4">
      <div className="mb-3 space-y-1">
        <h2 className="font-heading text-text-primary text-base font-semibold">
          授权上下文
        </h2>
        <p className="text-text-secondary text-sm leading-6">
          选择本次
          AI训练使用的具体授权；仅有一个候选时可默认，多授权时不会自动切换版本或额度。
        </p>
      </div>

      <fieldset
        aria-label="AI训练授权上下文"
        className="grid grid-cols-1 gap-2"
      >
        {authorizationContexts.map((authorizationContext, index) => {
          const authorizationContextLabel =
            getAuthorizationContextAccessibleLabel(authorizationContext);
          const isSelected =
            selectedAuthorizationContext?.authorizationPublicId ===
            authorizationContext.authorizationPublicId;

          return (
            <label
              className="border-border bg-background flex cursor-pointer items-start gap-3 rounded-lg border p-3 text-sm has-[:disabled]:cursor-not-allowed has-[:disabled]:opacity-60"
              key={`${authorizationContext.authorizationSource}-${index}`}
            >
              <input
                aria-label={authorizationContextLabel}
                checked={isSelected}
                className="mt-1 size-4 accent-current"
                disabled={disabled}
                name="student-ai-authorization-context"
                onChange={() =>
                  onSelectAuthorizationContext(
                    authorizationContext.authorizationPublicId,
                  )
                }
                type="radio"
                value={String(index)}
              />
              <span className="min-w-0 flex-1">
                <span className="text-text-primary block font-medium">
                  {authorizationContextLabel}
                </span>
                <span className="text-text-secondary mt-2 flex flex-wrap gap-2 text-xs">
                  <span className="bg-muted rounded-md px-2 py-1">
                    原始{getEditionLabel(authorizationContext.edition)}
                  </span>
                  <span className="bg-muted rounded-md px-2 py-1">
                    有效{getEditionLabel(authorizationContext.effectiveEdition)}
                  </span>
                  <span className="bg-muted rounded-md px-2 py-1">
                    到期 {formatLearnerDate(authorizationContext.expiresAt)}
                  </span>
                  <span className="bg-muted rounded-md px-2 py-1">
                    额度{" "}
                    {getQuotaOwnerLabel(authorizationContext.quotaOwnerType)}
                  </span>
                </span>
              </span>
            </label>
          );
        })}
      </fieldset>

      {selectedAuthorizationContext === null ? (
        <p
          className="border-border text-text-secondary mt-3 rounded-lg border border-dashed px-3 py-3 text-sm"
          role="status"
        >
          请先确认一个具体授权，再查看历史或使用生成设置。
        </p>
      ) : (
        <div className="bg-muted mt-3 rounded-lg px-3 py-3">
          <p className="text-text-primary text-sm font-medium">额度归属确认</p>
          <p className="text-text-secondary mt-1 text-sm leading-6">
            当前将使用
            {getQuotaOwnerLabel(selectedAuthorizationContext.quotaOwnerType)}
            额度，范围为
            {getProfessionLabel(selectedAuthorizationContext.profession)}{" "}
            {selectedAuthorizationContext.level}级。
          </p>
        </div>
      )}
    </section>
  );
}

function StudentAiTrainingModeTabs({
  activeTaskType,
  disabled,
  onSelectTaskType,
}: {
  activeTaskType: StudentPersonalAiGenerationTaskType;
  disabled: boolean;
  onSelectTaskType: (taskType: StudentPersonalAiGenerationTaskType) => void;
}) {
  const tabClassName =
    "flex h-10 items-center justify-center gap-2 rounded-lg px-4 text-sm font-medium transition-transform active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60";

  return (
    <div
      aria-label="AI训练类型"
      className="bg-muted grid grid-cols-2 gap-1 rounded-xl p-1"
      role="tablist"
    >
      <button
        aria-selected={activeTaskType === "ai_question_generation"}
        className={`${tabClassName} ${
          activeTaskType === "ai_question_generation"
            ? "bg-surface text-text-primary shadow-sm"
            : "text-text-secondary"
        }`}
        disabled={disabled}
        onClick={() => onSelectTaskType("ai_question_generation")}
        role="tab"
        type="button"
      >
        <Sparkles className="size-4" aria-hidden="true" />
        AI出题
      </button>
      <button
        aria-selected={activeTaskType === "ai_paper_generation"}
        className={`${tabClassName} ${
          activeTaskType === "ai_paper_generation"
            ? "bg-surface text-text-primary shadow-sm"
            : "text-text-secondary"
        }`}
        disabled={disabled}
        onClick={() => onSelectTaskType("ai_paper_generation")}
        role="tab"
        type="button"
      >
        <ClipboardList className="size-4" aria-hidden="true" />
        AI组卷
      </button>
    </div>
  );
}

function getStudentAiPaperSourceLabel(
  authorizationContext: EffectiveAuthorizationContextDto | null,
): string {
  return authorizationContext?.ownerType === "organization"
    ? "平台正式题库 + 本企业可用题库"
    : "平台正式题库";
}

function StudentAiPaperSourceSummary({
  authorizationContext,
  disabled,
  sourcePreference,
  onSourcePreferenceChange,
}: {
  authorizationContext: EffectiveAuthorizationContextDto | null;
  disabled: boolean;
  sourcePreference: string;
  onSourcePreferenceChange: (value: string) => void;
}) {
  const isOrganizationContext =
    authorizationContext?.ownerType === "organization";

  return (
    <section className="border-border bg-surface rounded-lg border p-4">
      <div className="space-y-1">
        <h2 className="font-heading text-text-primary text-base font-semibold">
          题源说明
        </h2>
        <p className="text-text-secondary text-sm leading-6">
          AI组卷只从已发布正式题库中选题，不把 AI 临时生成内容作为正式试卷题目。
        </p>
      </div>
      <div className="bg-muted mt-3 rounded-lg px-3 py-3">
        <p className="text-text-primary text-sm font-medium">
          {getStudentAiPaperSourceLabel(authorizationContext)}
        </p>
        <p className="text-text-secondary mt-1 text-sm leading-6">
          题源不足时会自动补足邻近知识点或同专业等级科目题目，并在预览中说明匹配情况。
        </p>
      </div>
      {isOrganizationContext ? (
        <label className="text-text-secondary mt-3 flex flex-col gap-1 text-sm">
          <span>题源偏好</span>
          <select
            aria-label="题源偏好"
            className="border-border bg-background text-text-primary min-h-10 w-full rounded-lg border px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-60"
            disabled={disabled}
            onChange={(event) => onSourcePreferenceChange(event.target.value)}
            value={sourcePreference}
          >
            <option value="均衡使用">均衡使用</option>
            <option value="优先使用企业题">优先使用企业题</option>
            <option value="优先使用平台题">优先使用平台题</option>
          </select>
        </label>
      ) : null}
    </section>
  );
}

function StudentAiKnowledgeScopePanel({
  disabled,
  knowledgeNodeLoadState,
  knowledgeNodeOptions,
  knowledgeScopeState,
  onKnowledgeScopeChange,
  titlePrefix,
}: {
  disabled: boolean;
  knowledgeNodeLoadState: StudentAiKnowledgeNodeLoadState;
  knowledgeNodeOptions: StudentAiKnowledgeNodeOption[];
  knowledgeScopeState: StudentAiKnowledgeScopeFormState;
  onKnowledgeScopeChange: (
    updater: (
      currentState: StudentAiKnowledgeScopeFormState,
    ) => StudentAiKnowledgeScopeFormState,
  ) => void;
  titlePrefix: "AI出题" | "AI组卷";
}) {
  const blockedReason = getStudentAiKnowledgeScopeBlockedReason(
    knowledgeScopeState,
    knowledgeNodeOptions,
    knowledgeNodeLoadState,
  );
  const hasSelectedKnowledgeNode =
    knowledgeScopeState.knowledgeNodePublicIds.length > 0;

  return (
    <fieldset className="border-border bg-surface rounded-lg border p-4">
      <legend className="font-heading text-text-primary px-1 text-base font-semibold">
        知识点范围
      </legend>
      <div className="mt-1 space-y-1">
        <p className="text-text-secondary text-sm leading-6">
          先选择覆盖方式；补充说明只作为软约束，不替代知识点选择。
        </p>
        {blockedReason !== null ? (
          <p className="text-destructive text-sm leading-6">{blockedReason}</p>
        ) : null}
      </div>

      <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <label className="text-text-secondary flex flex-col gap-1 text-sm">
          <span>{titlePrefix}知识点覆盖</span>
          <select
            aria-label={`${titlePrefix}知识点覆盖`}
            className="border-border bg-background text-text-primary min-h-10 w-full rounded-lg border px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-60"
            disabled={disabled}
            onChange={(event) => {
              const nextKnowledgeNodeMode = event.target
                .value as AiGenerationRouteIntegratedKnowledgeNodeMode;

              onKnowledgeScopeChange((currentState) => ({
                ...currentState,
                knowledgeNodeMode: nextKnowledgeNodeMode,
                knowledgeNodePublicIds:
                  nextKnowledgeNodeMode === "selected"
                    ? currentState.knowledgeNodePublicIds
                    : [],
              }));
            }}
            value={knowledgeScopeState.knowledgeNodeMode}
          >
            {knowledgeNodeModeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label className="text-text-secondary flex flex-col gap-1 text-sm">
          <span>包含下级知识点</span>
          <select
            aria-label={`${titlePrefix}包含下级知识点`}
            className="border-border bg-background text-text-primary min-h-10 w-full rounded-lg border px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-60"
            disabled={disabled || !hasSelectedKnowledgeNode}
            onChange={(event) => {
              onKnowledgeScopeChange((currentState) => ({
                ...currentState,
                includeDescendants: event.target.value === "true",
              }));
            }}
            value={String(
              hasSelectedKnowledgeNode
                ? knowledgeScopeState.includeDescendants
                : false,
            )}
          >
            <option value="true">包含</option>
            <option value="false">不包含</option>
          </select>
        </label>
      </div>

      <div className="mt-3">
        {knowledgeNodeLoadState === "loading" ? (
          <div className="border-border bg-muted rounded-lg border px-3 py-3">
            <p className="text-text-primary text-sm font-medium">
              知识点列表加载中
            </p>
            <p className="text-text-secondary mt-1 text-sm leading-6">
              正在按当前授权范围读取可选知识点。
            </p>
          </div>
        ) : knowledgeNodeLoadState === "error" ? (
          <div className="border-border bg-muted rounded-lg border px-3 py-3">
            <p className="text-text-primary text-sm font-medium">
              知识点列表暂不可用
            </p>
            <p className="text-text-secondary mt-1 text-sm leading-6">
              可以改用均衡覆盖，或稍后重试。
            </p>
          </div>
        ) : knowledgeNodeOptions.length === 0 ? (
          <div className="border-border bg-muted rounded-lg border px-3 py-3">
            <p className="text-text-primary text-sm font-medium">
              当前授权范围暂无可选知识点
            </p>
            <p className="text-text-secondary mt-1 text-sm leading-6">
              可以继续使用均衡覆盖，或填写补充说明作为本次生成的软约束。
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-2">
            {knowledgeNodeOptions.map((knowledgeNodeOption) => {
              const isChecked =
                knowledgeScopeState.knowledgeNodePublicIds.includes(
                  knowledgeNodeOption.publicId,
                );

              return (
                <label
                  className="border-border bg-background flex items-start gap-3 rounded-lg border p-3 text-sm has-[:disabled]:cursor-not-allowed has-[:disabled]:opacity-60"
                  key={knowledgeNodeOption.publicId}
                >
                  <input
                    aria-label={knowledgeNodeOption.label}
                    checked={isChecked}
                    className="mt-1 size-4 accent-current"
                    disabled={
                      disabled ||
                      knowledgeScopeState.knowledgeNodeMode !== "selected"
                    }
                    onChange={() => {
                      onKnowledgeScopeChange((currentState) => ({
                        ...currentState,
                        knowledgeNodePublicIds: isChecked
                          ? currentState.knowledgeNodePublicIds.filter(
                              (publicId) =>
                                publicId !== knowledgeNodeOption.publicId,
                            )
                          : [
                              ...currentState.knowledgeNodePublicIds,
                              knowledgeNodeOption.publicId,
                            ],
                      }));
                    }}
                    type="checkbox"
                  />
                  <span>
                    <span className="text-text-primary block font-medium">
                      {knowledgeNodeOption.label}
                    </span>
                    <span className="text-text-secondary mt-1 block leading-6">
                      {knowledgeNodeOption.description}
                    </span>
                  </span>
                </label>
              );
            })}
          </div>
        )}
      </div>

      <label className="text-text-secondary mt-3 flex flex-col gap-1 text-sm">
        <span>{titlePrefix}知识点补充说明</span>
        <textarea
          aria-label={`${titlePrefix}知识点补充说明`}
          className="border-border bg-background text-text-primary min-h-24 w-full rounded-lg border px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-60"
          disabled={disabled}
          onChange={(event) => {
            onKnowledgeScopeChange((currentState) => ({
              ...currentState,
              knowledgeNodeSupplement: event.target.value,
            }));
          }}
          placeholder="可填写希望覆盖的知识点方向"
          rows={3}
          value={knowledgeScopeState.knowledgeNodeSupplement}
        />
        <span className="text-text-secondary text-xs leading-5">
          补充说明不会替代知识点树选择，也不会扩大当前授权范围。
        </span>
      </label>
    </fieldset>
  );
}

function StudentAiGenerationBoundarySummary({
  authorizationContext,
}: {
  authorizationContext: EffectiveAuthorizationContextDto | null;
}) {
  const sourceLabel = getStudentAiPaperSourceLabel(authorizationContext);
  const contextLabel =
    authorizationContext?.ownerType === "organization"
      ? "组织授权上下文用于企业自测，组织额度只在已选中组织授权后使用。"
      : "个人授权上下文用于个人自练，不自动切换到组织额度。";

  return (
    <section
      data-testid="student-ai-zone-boundary"
      className="border-border bg-surface rounded-xl border p-4"
    >
      <div className="flex items-start gap-3">
        <div className="bg-secondary text-secondary-foreground flex size-9 shrink-0 items-center justify-center rounded-lg">
          <ShieldAlert className="size-4" aria-hidden="true" />
        </div>
        <div className="min-w-0 space-y-2">
          <h2 className="font-heading text-text-primary text-base font-semibold">
            生成边界
          </h2>
          <ul className="text-text-secondary space-y-1 text-sm leading-6">
            <li>AI出题生成练习题草稿，不写入正式题目。</li>
            <li>AI组卷从{sourceLabel}选题生成自测试卷，不写入正式试卷。</li>
            <li>{contextLabel}</li>
          </ul>
        </div>
      </div>
    </section>
  );
}

function StudentPersonalAiGenerationVisibleGeneratedContent({
  visibleGeneratedContent,
}: {
  visibleGeneratedContent: PersonalAiGenerationLocalBrowserExperienceDto["runtimeBridge"]["visibleGeneratedContent"];
}) {
  if (visibleGeneratedContent == null) {
    return null;
  }

  const visibleQuestionDrafts = getStudentVisibleQuestionDrafts(
    visibleGeneratedContent.structuredPreview,
  );
  const visiblePaperSections = getStudentVisiblePaperSections(
    visibleGeneratedContent.structuredPreview,
  );
  const visibleGeneratedContentTitle =
    visibleQuestionDrafts.length > 0
      ? "生成题目草稿"
      : visiblePaperSections.length > 0
        ? "自测试卷预览"
        : "本次生成内容";

  return (
    <section
      className="border-border bg-background mb-3 rounded-lg border p-3"
      data-testid="student-visible-generated-content"
    >
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-text-primary text-sm font-semibold">
          {visibleGeneratedContentTitle}
        </h3>
        <span className="bg-muted text-text-secondary rounded-md px-2 py-1 text-xs font-medium">
          临时展示
        </span>
      </div>
      {visibleQuestionDrafts.length > 0 ? (
        <StudentQuestionDraftList questionDrafts={visibleQuestionDrafts} />
      ) : visiblePaperSections.length > 0 ? (
        <StudentPaperDraftList paperSections={visiblePaperSections} />
      ) : (
        <p className="text-text-primary mt-3 text-sm leading-6 whitespace-pre-wrap">
          {visibleGeneratedContent.content}
        </p>
      )}
      {visibleGeneratedContent.structuredPreview ? (
        <StudentStructuredPreviewSummary
          structuredPreview={visibleGeneratedContent.structuredPreview}
        />
      ) : null}
    </section>
  );
}

type StudentVisibleGeneratedContentDto = NonNullable<
  PersonalAiGenerationLocalBrowserExperienceDto["runtimeBridge"]["visibleGeneratedContent"]
>;

type StudentQuestionDraftSummary = Extract<
  NonNullable<StudentVisibleGeneratedContentDto["structuredPreview"]>,
  { kind: "question_set"; parseStatus: "parsed" }
>["draftSummaries"][number];

type StudentPaperSectionDraftSummary = Extract<
  NonNullable<StudentVisibleGeneratedContentDto["structuredPreview"]>,
  { kind: "paper_draft"; parseStatus: "parsed" }
>["paperSectionSummaries"][number];

type StudentVisibleQuestionDraftSummary =
  | StudentQuestionDraftSummary
  | StudentPaperSectionDraftSummary["questionDrafts"][number];

function getStudentVisibleQuestionDrafts(
  structuredPreview: StudentVisibleGeneratedContentDto["structuredPreview"],
): StudentQuestionDraftSummary[] {
  if (
    structuredPreview?.kind !== "question_set" ||
    structuredPreview.parseStatus !== "parsed"
  ) {
    return [];
  }

  return structuredPreview.draftSummaries.filter(
    hasStudentVisibleQuestionDraftBody,
  );
}

function getStudentVisiblePaperSections(
  structuredPreview: StudentVisibleGeneratedContentDto["structuredPreview"],
): StudentPaperSectionDraftSummary[] {
  if (
    structuredPreview?.kind !== "paper_draft" ||
    structuredPreview.parseStatus !== "parsed"
  ) {
    return [];
  }

  return structuredPreview.paperSectionSummaries
    .map((paperSection) => ({
      ...paperSection,
      questionDrafts: paperSection.questionDrafts.filter(
        hasStudentVisibleQuestionDraftBody,
      ),
    }))
    .filter(hasStudentVisiblePaperSectionBody);
}

function hasStudentVisibleQuestionDraftBody(
  questionDraft: StudentVisibleQuestionDraftSummary,
): boolean {
  return Boolean(
    questionDraft.questionStem ||
    questionDraft.questionOptions?.length ||
    questionDraft.standardAnswer ||
    questionDraft.analysis,
  );
}

function hasStudentVisiblePaperSectionBody(
  paperSection: StudentPaperSectionDraftSummary,
): boolean {
  return Boolean(
    paperSection.title ||
    paperSection.description ||
    paperSection.questionDrafts.length,
  );
}

function StudentQuestionDraftList({
  questionDrafts,
  showAnswerDetails = false,
  testId = "student-ai-question-drafts",
}: {
  questionDrafts: StudentVisibleQuestionDraftSummary[];
  showAnswerDetails?: boolean;
  testId?: string;
}) {
  return (
    <div className="mt-3 space-y-3" data-testid={testId}>
      {questionDrafts.map((questionDraft) => (
        <section
          className="border-border bg-muted/40 rounded-md border p-3"
          data-testid="student-ai-question-draft-card"
          key={questionDraft.draftNumber}
        >
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <h4 className="text-text-primary text-sm font-semibold">
              题目 {questionDraft.draftNumber}
            </h4>
            <span className="bg-background text-text-secondary rounded-md px-2 py-1 text-xs">
              {[questionDraft.questionType, questionDraft.difficulty]
                .filter(Boolean)
                .join(" / ") || "练习草稿"}
            </span>
          </div>
          <StudentQuestionDraftField
            label="题干"
            value={questionDraft.questionStem}
          />
          {questionDraft.questionOptions &&
          questionDraft.questionOptions.length > 0 ? (
            <div className="mt-3">
              <p className="text-text-secondary text-xs font-medium">选项</p>
              <ol className="mt-2 space-y-2">
                {questionDraft.questionOptions.map((option, index) => (
                  <li
                    className="text-text-primary bg-background rounded-md px-2 py-2 text-sm leading-6"
                    key={`${option.optionLabel ?? index}-${option.optionText}`}
                  >
                    <span className="text-brand-primary mr-2 font-medium">
                      {option.optionLabel ?? String.fromCharCode(65 + index)}
                    </span>
                    {option.optionText}
                  </li>
                ))}
              </ol>
            </div>
          ) : null}
          {showAnswerDetails ? (
            <>
              <StudentQuestionDraftField
                label="标准答案"
                value={questionDraft.standardAnswer}
              />
              <StudentQuestionDraftField
                label="解析"
                value={questionDraft.analysis}
              />
            </>
          ) : null}
          {questionDraft.knowledgeNodeLabels &&
          questionDraft.knowledgeNodeLabels.length > 0 ? (
            <div className="mt-3">
              <p className="text-text-secondary text-xs font-medium">知识点</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {questionDraft.knowledgeNodeLabels.map((knowledgeNodeLabel) => (
                  <span
                    className="bg-background text-text-secondary rounded-md px-2 py-1 text-xs"
                    key={knowledgeNodeLabel}
                  >
                    {knowledgeNodeLabel}
                  </span>
                ))}
              </div>
            </div>
          ) : null}
        </section>
      ))}
    </div>
  );
}

function StudentPaperDraftList({
  paperSections,
}: {
  paperSections: StudentPaperSectionDraftSummary[];
}) {
  return (
    <div className="mt-3 space-y-4" data-testid="student-ai-paper-drafts">
      {paperSections.map((paperSection) => (
        <section
          className="border-border bg-muted/40 rounded-md border p-3"
          data-testid="student-ai-paper-section-draft-card"
          key={paperSection.sectionNumber}
        >
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-brand-primary text-xs font-medium">
                大题 {paperSection.sectionNumber}
              </p>
              <h4 className="text-text-primary mt-1 text-sm font-semibold">
                {paperSection.title ?? "未命名大题"}
              </h4>
            </div>
            <span className="bg-background text-text-secondary rounded-md px-2 py-1 text-xs">
              {[paperSection.paperSectionType, paperSection.questionCount]
                .filter(Boolean)
                .join(" / ") || "练习草稿"}
            </span>
          </div>
          <StudentQuestionDraftField
            label="说明"
            value={paperSection.description}
          />
          {paperSection.questionDrafts.length > 0 ? (
            <p className="text-text-secondary bg-background mt-3 rounded-md px-2 py-2 text-sm leading-6">
              已匹配 {paperSection.questionDrafts.length}{" "}
              道可作答题目，开始作答后展示题干与选项。
            </p>
          ) : null}
        </section>
      ))}
    </div>
  );
}

function StudentAiPaperAssemblySummary({
  compact = false,
  paperAssembly,
}: {
  compact?: boolean;
  paperAssembly?: StudentAiPaperAssembly | null;
}) {
  if (paperAssembly == null) {
    return (
      <section
        className="border-border bg-background mb-3 rounded-lg border p-3"
        data-testid="student-ai-paper-assembly-summary"
      >
        <div className="flex items-start gap-3">
          <div className="bg-muted text-text-secondary flex size-8 shrink-0 items-center justify-center rounded-lg">
            <ClipboardList className="size-4" aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <h3 className="text-text-primary text-sm font-semibold">
              正式题源组卷摘要
            </h3>
            <p className="text-warning mt-2 text-sm leading-6">
              暂未生成可作答试卷容器，不能开始作答。
            </p>
          </div>
        </div>
      </section>
    );
  }

  const container = paperAssembly.container;
  const selectedQuestionCount = container.selectedQuestionCount;
  const requestedQuestionCount = container.requestedQuestionCount;
  const isPracticeReady =
    paperAssembly.status === "assembled" && selectedQuestionCount > 0;
  const heading =
    paperAssembly.sourceDiagnostics.role === "org_advanced_employee"
      ? "企业自测试卷预览"
      : "自测试卷预览";
  const sourceCompositionLabel = [
    `平台正式题 ${container.sourceComposition.platformFormalQuestionCount} 题`,
    `企业训练题 ${container.sourceComposition.enterpriseTrainingSnapshotCount} 题`,
  ].join(" · ");
  const enterpriseSourceLabel =
    aiPaperEnterpriseSourceStatusLabelMap[
      paperAssembly.sourceDiagnostics.enterpriseSourceStatus
    ] ?? paperAssembly.sourceDiagnostics.enterpriseSourceStatus;
  const blockReason = getStudentAiPaperAssemblyBlockedReason(paperAssembly);

  return (
    <section
      className="border-border bg-background mb-3 rounded-lg border p-3"
      data-testid="student-ai-paper-assembly-summary"
    >
      <div className="flex items-start gap-3">
        <div className="bg-secondary text-secondary-foreground flex size-8 shrink-0 items-center justify-center rounded-lg">
          <ClipboardList className="size-4" aria-hidden="true" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h3 className="text-text-primary text-sm font-semibold">
                {heading}
              </h3>
              <p className="text-text-secondary mt-1 text-sm leading-6">
                {container.title || "AI 自测试卷"}
              </p>
            </div>
            <span
              className={`rounded-md px-2 py-1 text-xs font-medium ${
                isPracticeReady
                  ? "bg-success/10 text-success"
                  : "bg-warning/10 text-warning"
              }`}
            >
              {isPracticeReady ? "可开始作答" : "暂不能作答"}
            </span>
          </div>

          <dl className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
            <StudentAiPaperAssemblyMetric
              label="题量"
              value={`${selectedQuestionCount}/${requestedQuestionCount} 题`}
            />
            <StudentAiPaperAssemblyMetric
              label="大题结构"
              value={`${container.sections.length} 个大题`}
            />
            <StudentAiPaperAssemblyMetric
              label="题源构成"
              value={sourceCompositionLabel}
            />
            <StudentAiPaperAssemblyMetric
              label="匹配质量"
              value={
                aiPaperMatchQualityLabelMap[container.matchQuality] ??
                container.matchQuality
              }
            />
            {paperAssembly.sourceDiagnostics.role ===
            "org_advanced_employee" ? (
              <StudentAiPaperAssemblyMetric
                label="企业题源"
                value={`${enterpriseSourceLabel} · 可见企业题 ${paperAssembly.sourceDiagnostics.enterpriseQuestionCount} 题`}
              />
            ) : null}
          </dl>

          {blockReason !== null ? (
            <p
              className="text-warning bg-warning/10 mt-3 rounded-md px-3 py-2 text-sm leading-6"
              data-testid="student-ai-paper-assembly-blocked-reason"
            >
              {blockReason}
            </p>
          ) : null}

          {!compact && container.sections.length > 0 ? (
            <div
              className="mt-3 space-y-2"
              data-testid="student-ai-paper-assembly-sections"
            >
              {container.sections.map((paperSection) => (
                <section
                  className="border-border bg-muted/40 rounded-md border px-3 py-2"
                  key={paperSection.sectionKey}
                >
                  <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                    <h4 className="text-text-primary text-sm font-medium">
                      {paperSection.title}
                    </h4>
                    <span className="text-text-secondary text-xs">
                      {aiPaperQuestionTypeLabelMap[paperSection.questionType] ??
                        paperSection.questionType}
                    </span>
                  </div>
                  <p className="text-text-secondary mt-2 text-sm leading-6">
                    已选 {paperSection.selectedQuestionCount}/
                    {paperSection.targetQuestionCount} 题 · 精确{" "}
                    {paperSection.degradationSummary.exactCount} · 相近{" "}
                    {paperSection.degradationSummary.nearbyKnowledgeCount} ·
                    同范围 {paperSection.degradationSummary.sameScopeCount}
                  </p>
                  <p className="text-text-secondary mt-1 text-xs leading-5">
                    题源：
                    {formatStudentAiPaperSectionSourceCounts(
                      paperSection.selectedQuestions,
                    )}
                  </p>
                </section>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}

function StudentAiPaperAssemblyMetric({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="bg-muted rounded-md px-3 py-2">
      <dt className="text-text-secondary text-xs font-medium">{label}</dt>
      <dd className="text-text-primary mt-1 text-sm font-semibold">{value}</dd>
    </div>
  );
}

function getStudentAiPaperAssemblyBlockedReason(
  paperAssembly: StudentAiPaperAssembly,
): string | null {
  if (
    paperAssembly.status === "assembled" &&
    paperAssembly.container.selectedQuestionCount > 0
  ) {
    return null;
  }

  if (paperAssembly.insufficiency !== null) {
    return `正式题源不足：目标 ${paperAssembly.insufficiency.requestedQuestionCount} 题，已匹配 ${paperAssembly.insufficiency.selectedQuestionCount} 题，缺少 ${paperAssembly.insufficiency.missingQuestionCount} 题。`;
  }

  return "正式题源不足：当前没有可作答题目，请调整知识点、题量或题源后重试生成。";
}

function formatStudentAiPaperSectionSourceCounts(
  selectedQuestions: StudentAiPaperAssemblyContainer["sections"][number]["selectedQuestions"],
): string {
  if (selectedQuestions.length === 0) {
    return "暂无可用题源";
  }

  const countsBySourceKind = selectedQuestions.reduce<Record<string, number>>(
    (currentCounts, selectedQuestion) => ({
      ...currentCounts,
      [selectedQuestion.sourceKind]:
        (currentCounts[selectedQuestion.sourceKind] ?? 0) + 1,
    }),
    {},
  );

  return Object.entries(countsBySourceKind)
    .map(
      ([sourceKind, count]) =>
        `${aiPaperSourceKindLabelMap[sourceKind] ?? sourceKind} ${count} 题`,
    )
    .join(" · ");
}

function StudentQuestionDraftField({
  label,
  value,
}: {
  label: string;
  value?: string;
}) {
  if (!value) {
    return null;
  }

  return (
    <div className="mt-3">
      <p className="text-text-secondary text-xs font-medium">{label}</p>
      <p className="text-text-primary bg-background mt-2 rounded-md px-2 py-2 text-sm leading-6 whitespace-pre-wrap">
        {value}
      </p>
    </div>
  );
}

function StudentStructuredPreviewSummary({
  structuredPreview,
}: {
  structuredPreview: NonNullable<
    NonNullable<
      PersonalAiGenerationLocalBrowserExperienceDto["runtimeBridge"]["visibleGeneratedContent"]
    >["structuredPreview"]
  >;
}) {
  const displayItems =
    structuredPreview.kind === "question_set"
      ? structuredPreview.parseStatus === "parsed"
        ? [
            `草稿 ${structuredPreview.actualQuestionCount}/${structuredPreview.requestedQuestionCount}`,
            `待评审 ${structuredPreview.draftCount}`,
          ]
        : [
            "结构化解析失败",
            `草稿 ${structuredPreview.actualQuestionCount ?? 0}/${structuredPreview.requestedQuestionCount}`,
          ]
      : structuredPreview.parseStatus === "parsed"
        ? [
            `大题模块 ${structuredPreview.paperSectionCount}`,
            `题量 ${structuredPreview.questionCount ?? "未识别"}`,
          ]
        : ["结构化解析失败", "大题模块 0"];

  return (
    <div className="border-border bg-muted mt-3 rounded-md border p-2">
      <p className="text-text-primary text-xs font-medium">结构化预览</p>
      <div className="mt-2 flex flex-wrap gap-2">
        {displayItems.map((displayItem) => (
          <span
            className="bg-background text-text-secondary rounded-md px-2 py-1 text-xs"
            key={displayItem}
          >
            {displayItem}
          </span>
        ))}
      </div>
    </div>
  );
}

function StudentPersonalAiGenerationContractSummary({
  experience,
}: {
  experience: PersonalAiGenerationLocalBrowserExperienceDto;
}) {
  const disabledReason = experience.requestState.action.disabledReason;

  return (
    <section className="border-border bg-surface rounded-xl border p-4">
      <div className="mb-2 flex items-center justify-between gap-3">
        <h2 className="font-heading text-text-primary text-base font-semibold">
          {copy.contractTitle}
        </h2>
        <span className="bg-secondary text-secondary-foreground rounded-lg px-2 py-1 text-xs font-medium">
          {contractValueLabelMap[experience.flowStatus] ??
            experience.flowStatus}
        </span>
      </div>

      {experience.requestState.status === "blocked" ? (
        <div className="bg-warning/10 text-warning mb-3 rounded-lg px-3 py-2 text-sm">
          <strong className="font-semibold">{copy.blockedTitle}</strong>
          <span className="ml-2">
            {contractValueLabelMap[disabledReason ?? "unknown"] ??
              disabledReason ??
              "未知原因"}
          </span>
        </div>
      ) : null}

      <dl className="space-y-2">
        <div className="flex items-center justify-between gap-3">
          <dt className="text-text-secondary text-sm">任务状态</dt>
          <dd className="text-text-primary text-sm font-medium">
            {contractValueLabelMap[experience.resultState.status] ??
              experience.resultState.status}
          </dd>
        </div>
        <div className="flex items-center justify-between gap-3">
          <dt className="text-text-secondary text-sm">结果内容</dt>
          <dd className="text-text-primary text-sm font-medium">
            {experience.resultState.resultPublicId === null
              ? "暂无生成结果"
              : "结果已生成"}
          </dd>
        </div>
        <div className="flex items-center justify-between gap-3">
          <dt className="text-text-secondary text-sm">依据资料状态</dt>
          <dd className="text-text-primary text-sm font-medium">
            {experience.resultState.evidenceStatus === "sufficient"
              ? "依据充足"
              : "依据不足"}
          </dd>
        </div>
        <div className="flex items-center justify-between gap-3">
          <dt className="text-text-secondary text-sm">学习内容边界</dt>
          <dd className="text-text-primary text-sm font-medium">
            {experience.resultState.isFormalAdoptionBlocked
              ? "保持在学习训练中"
              : "可继续学习"}
          </dd>
        </div>
      </dl>
    </section>
  );
}

function StudentPersonalAiGenerationPracticeFeedbackActions({
  canUseGeneratedPractice,
  hasActiveLearningSession,
  isRetryDisabled,
  practiceFeedbackState,
  onRetryGeneration,
  onStartPractice,
  onSubmitAnswer,
  onViewFeedback,
}: {
  canUseGeneratedPractice: boolean;
  hasActiveLearningSession: boolean;
  isRetryDisabled: boolean;
  practiceFeedbackState: StudentPersonalAiGenerationPracticeFeedbackState;
  onRetryGeneration: () => void;
  onStartPractice: () => void;
  onSubmitAnswer: () => void;
  onViewFeedback: () => void;
}) {
  const generatedPracticeActionClassName =
    "border-border bg-surface text-text-secondary flex h-10 items-center justify-center gap-2 rounded-lg border px-3 text-sm font-medium transition-transform active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60";

  return (
    <section className="border-border bg-surface rounded-xl border p-4">
      <div className="mb-3 flex items-start gap-3">
        <div className="bg-secondary text-secondary-foreground flex size-9 shrink-0 items-center justify-center rounded-lg">
          <CheckCircle2 className="size-4" aria-hidden="true" />
        </div>
        <div className="min-w-0">
          <h2 className="font-heading text-text-primary text-base font-semibold">
            {copy.practiceFeedbackTitle}
          </h2>
          <p className="text-text-secondary mt-1 text-sm leading-6">
            {copy.practiceFeedbackDescription}
          </p>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-4">
        <button
          type="button"
          disabled={!canUseGeneratedPractice}
          onClick={onStartPractice}
          className={generatedPracticeActionClassName}
        >
          <BookOpen className="size-4" aria-hidden="true" />
          开始作答
        </button>
        <button
          type="button"
          disabled={!hasActiveLearningSession}
          onClick={onSubmitAnswer}
          className={generatedPracticeActionClassName}
        >
          <Send className="size-4" aria-hidden="true" />
          提交作答
        </button>
        <button
          type="button"
          disabled={!hasActiveLearningSession}
          onClick={onViewFeedback}
          className={generatedPracticeActionClassName}
        >
          <MessageCircle className="size-4" aria-hidden="true" />
          查看解析
        </button>
        <button
          type="button"
          disabled={isRetryDisabled}
          onClick={onRetryGeneration}
          className={generatedPracticeActionClassName}
        >
          <RefreshCcw className="size-4" aria-hidden="true" />
          重试生成
        </button>
      </div>
      <p
        className="text-text-secondary bg-background mt-3 rounded-lg px-3 py-2 text-sm"
        aria-live="polite"
      >
        {practiceFeedbackStatusLabelMap[practiceFeedbackState]}
      </p>
    </section>
  );
}

function StudentAiLearningSessionPanel({
  answerFeedbackByQuestion,
  onSelectOptionLabel,
  questions,
  selectedOptionLabelsByQuestion,
}: {
  answerFeedbackByQuestion: StudentAiLearningAnswerFeedbackByQuestion;
  onSelectOptionLabel: (
    question: PersonalAiGenerationLearningSessionQuestionDto,
    optionLabel: string,
  ) => void;
  questions: PersonalAiGenerationLearningSessionQuestionDto[];
  selectedOptionLabelsByQuestion: StudentAiLearningSelectedLabelsByQuestion;
}) {
  const summary = createStudentAiLearningSessionSummary({
    answerFeedbackByQuestion,
    questions,
  });

  return (
    <section
      className="border-border bg-surface rounded-xl border p-4"
      data-testid="student-ai-learning-session"
    >
      <div className="mb-3 flex items-start gap-3">
        <div className="bg-secondary text-secondary-foreground flex size-9 shrink-0 items-center justify-center rounded-lg">
          <BookOpen className="size-4" aria-hidden="true" />
        </div>
        <div className="min-w-0">
          <h2 className="font-heading text-text-primary text-base font-semibold">
            隔离 AI 学习
          </h2>
          <p className="text-text-secondary mt-1 text-sm leading-6">
            仅用于本次 AI 草稿自练，正式练习未写入，错题本未写入。
          </p>
          <p className="text-text-secondary mt-2 text-sm leading-6">
            自测 {summary.questionCount} 题 · 已提交 {summary.submittedCount} 题
            · 正确 {summary.correctCount} 题 · 得分 {summary.score}/
            {summary.maxScore}
          </p>
        </div>
      </div>

      {summary.submittedCount > 0 ? (
        <div
          className="border-border bg-background mt-3 rounded-lg border p-3"
          aria-live="polite"
        >
          <p className="text-text-primary text-sm font-semibold">自测结果</p>
          <div className="text-text-secondary mt-2 flex flex-wrap gap-2 text-xs">
            <span className="bg-muted rounded-md px-2 py-1">
              已提交 {summary.submittedCount} 题
            </span>
            <span className="bg-muted rounded-md px-2 py-1">
              正确 {summary.correctCount} 题
            </span>
            <span className="bg-muted rounded-md px-2 py-1">
              得分 {summary.score}/{summary.maxScore}
            </span>
          </div>
        </div>
      ) : null}

      <div className="mt-3 space-y-3">
        {questions.map((question) => {
          const selectedOptionLabels =
            selectedOptionLabelsByQuestion[question.sessionQuestionPublicId] ??
            [];
          const answerFeedback =
            answerFeedbackByQuestion[question.sessionQuestionPublicId] ?? null;
          const inputType =
            question.questionType === "multi_choice" ? "checkbox" : "radio";

          return (
            <div
              className="border-border bg-muted/40 rounded-lg border p-3"
              key={question.sessionQuestionPublicId}
            >
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <h3 className="text-text-primary text-sm font-semibold">
                  题目 {question.sourceDraftNumber}
                </h3>
                <span className="bg-background text-text-secondary rounded-md px-2 py-1 text-xs">
                  {question.questionType}
                </span>
              </div>
              <p className="text-text-primary bg-background mt-3 rounded-md px-2 py-2 text-sm leading-6 whitespace-pre-wrap">
                {question.questionStem}
              </p>
              {question.questionOptions.length > 0 ? (
                <fieldset className="mt-3 space-y-2">
                  <legend className="text-text-secondary text-xs font-medium">
                    选择答案
                  </legend>
                  {question.questionOptions.map((option) => (
                    <label
                      className="border-border bg-background flex cursor-pointer items-start gap-2 rounded-md border px-2 py-2 text-sm"
                      key={`${question.sessionQuestionPublicId}-${option.optionLabel}`}
                    >
                      <input
                        aria-label={`${option.optionLabel} ${option.optionText}`}
                        checked={selectedOptionLabels.includes(
                          option.optionLabel,
                        )}
                        className="mt-1 size-4 accent-current"
                        name={`student-ai-learning-answer-${question.sessionQuestionPublicId}`}
                        onChange={() =>
                          onSelectOptionLabel(question, option.optionLabel)
                        }
                        type={inputType}
                        value={option.optionLabel}
                      />
                      <span className="text-text-primary leading-6">
                        <span className="text-brand-primary mr-2 font-medium">
                          {option.optionLabel}
                        </span>
                        {option.optionText}
                      </span>
                    </label>
                  ))}
                </fieldset>
              ) : (
                <p className="text-text-secondary bg-background mt-3 rounded-md px-2 py-2 text-sm">
                  当前题型需人工评阅，本次不写入 AI 评分。
                </p>
              )}

              {answerFeedback !== null ? (
                <div
                  className="border-border bg-background mt-3 rounded-lg border p-3"
                  aria-live="polite"
                >
                  <p className="text-text-primary text-sm font-semibold">
                    {answerFeedback.isCorrect === true
                      ? "回答正确"
                      : answerFeedback.isCorrect === false
                        ? "回答错误"
                        : "已提交，待人工评阅"}
                  </p>
                  <div className="text-text-secondary mt-2 flex flex-wrap gap-2 text-xs">
                    <span className="bg-muted rounded-md px-2 py-1">
                      得分 {answerFeedback.score ?? "待评阅"}/
                      {answerFeedback.maxScore}
                    </span>
                    <span className="bg-muted rounded-md px-2 py-1">
                      正确答案{" "}
                      {answerFeedback.standardAnswerLabels.length > 0
                        ? answerFeedback.standardAnswerLabels.join("、")
                        : (answerFeedback.standardAnswerText ?? "待评阅")}
                    </span>
                  </div>
                  {answerFeedback.analysis !== null ? (
                    <p className="text-text-primary bg-muted mt-3 rounded-md px-2 py-2 text-sm leading-6 whitespace-pre-wrap">
                      {answerFeedback.analysis}
                    </p>
                  ) : null}
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </section>
  );
}

function createStudentAiLearningSessionSummary(input: {
  answerFeedbackByQuestion: StudentAiLearningAnswerFeedbackByQuestion;
  questions: PersonalAiGenerationLearningSessionQuestionDto[];
}) {
  const submittedFeedback = input.questions
    .map(
      (question) =>
        input.answerFeedbackByQuestion[question.sessionQuestionPublicId],
    )
    .filter(
      (answerFeedback): answerFeedback is StudentAiLearningAnswerFeedback =>
        answerFeedback !== undefined,
    );
  const score = submittedFeedback.reduce(
    (totalScore, answerFeedback) =>
      totalScore + parseStudentAiLearningScore(answerFeedback.score),
    0,
  );
  const maxScore = input.questions.reduce(
    (totalScore, question) =>
      totalScore + parseStudentAiLearningScore(question.maxScore),
    0,
  );

  return {
    questionCount: input.questions.length,
    submittedCount: submittedFeedback.length,
    correctCount: submittedFeedback.filter(
      (answerFeedback) => answerFeedback.isCorrect === true,
    ).length,
    score: formatStudentAiLearningScore(score),
    maxScore: formatStudentAiLearningScore(maxScore),
  };
}

function parseStudentAiLearningScore(score: string | null): number {
  if (score === null) {
    return 0;
  }

  const parsedScore = Number.parseFloat(score);

  return Number.isFinite(parsedScore) ? parsedScore : 0;
}

function formatStudentAiLearningScore(score: number): string {
  return score.toFixed(1);
}

function createStudentAiLearningSessionPublicId(
  resultPublicId: string,
): string {
  return `ai_learning_session_${resultPublicId}`;
}

function resolveStudentAiLearningSessionOwnerScope(input: {
  authorizationContexts: EffectiveAuthorizationContextDto[];
  experience: PersonalAiGenerationLocalBrowserExperienceDto;
  selectedAuthorizationPublicId: string | null;
  taskType: StudentPersonalAiGenerationTaskType;
}): { ownerType: "personal" | "organization"; ownerPublicId: string } | null {
  const authorizationBoundary =
    input.experience.requestFlow.contextSelection.authorizationBoundary;
  const boundaryOwnerType = authorizationBoundary.ownerType;
  const boundaryOwnerPublicId = authorizationBoundary.ownerPublicId;

  if (
    (boundaryOwnerType === "personal" ||
      boundaryOwnerType === "organization") &&
    typeof boundaryOwnerPublicId === "string" &&
    boundaryOwnerPublicId.trim().length > 0
  ) {
    return {
      ownerType: boundaryOwnerType,
      ownerPublicId: boundaryOwnerPublicId.trim(),
    };
  }

  const fallbackAuthorizationContext =
    selectPersonalAiGenerationAuthorizationContext(
      input.authorizationContexts,
      input.taskType,
      input.selectedAuthorizationPublicId,
    );

  if (fallbackAuthorizationContext === null) {
    return null;
  }

  const fallbackOwnerType =
    fallbackAuthorizationContext.ownerType === "organization"
      ? "organization"
      : "personal";

  return {
    ownerType: fallbackOwnerType,
    ownerPublicId: fallbackAuthorizationContext.ownerPublicId,
  };
}

function getStudentAiLearningSessionQuestions(
  experience: PersonalAiGenerationLocalBrowserExperienceDto,
  sessionPublicId: string,
): PersonalAiGenerationLearningSessionQuestionDto[] {
  const visibleGeneratedContent =
    experience.runtimeBridge.visibleGeneratedContent;
  const structuredPreview = visibleGeneratedContent?.structuredPreview;

  if (structuredPreview == null || structuredPreview.parseStatus !== "parsed") {
    return [];
  }

  const questionDrafts =
    structuredPreview.kind === "question_set"
      ? structuredPreview.draftSummaries
      : structuredPreview.paperSectionSummaries.flatMap(
          (paperSectionSummary) => paperSectionSummary.questionDrafts,
        );

  return questionDrafts.reduce<
    PersonalAiGenerationLearningSessionQuestionDto[]
  >((questions, questionDraft) => {
    const question = createPersonalAiLearningSessionQuestion({
      sessionPublicId,
      usableQuestionIndex: questions.length + 1,
      draft: questionDraft,
    });

    if (question !== null) {
      questions.push(question);
    }

    return questions;
  }, []);
}

function isStudentAiPaperGenerationExperience(
  experience: PersonalAiGenerationLocalBrowserExperienceDto,
): boolean {
  return (
    experience.requestFlow.resultReference.taskType === "ai_paper_generation"
  );
}

function getStudentAiPaperAssemblyContainer(
  experience: PersonalAiGenerationLocalBrowserExperienceDto,
): StudentAiPaperAssemblyContainer | null {
  const paperAssembly = experience.runtimeBridge.paperAssembly;

  if (paperAssembly == null || paperAssembly.status !== "assembled") {
    return null;
  }

  return paperAssembly.container.selectedQuestionCount > 0
    ? paperAssembly.container
    : null;
}

function mapLearningAnswerFeedbackToStudentFeedback(
  answerFeedback: PersonalAiGenerationLearningSessionAnswerFeedbackDto,
): StudentAiLearningAnswerFeedback {
  return {
    isCorrect: answerFeedback.isCorrect,
    score: answerFeedback.score,
    maxScore: answerFeedback.maxScore ?? "0.0",
    standardAnswerLabels: answerFeedback.standardAnswerLabels,
    standardAnswerText: answerFeedback.standardAnswerText,
    analysis: answerFeedback.analysis,
  };
}

function canUseCurrentGeneratedPractice(
  experience: PersonalAiGenerationLocalBrowserExperienceDto,
): boolean {
  const resultPublicId = experience.resultState.resultPublicId;

  if (resultPublicId === null) {
    return false;
  }

  return (
    experience.flowStatus === "accepted" &&
    experience.resultState.status === "succeeded" &&
    experience.resultState.evidenceStatus === "sufficient" &&
    experience.resultState.citationCount > 0 &&
    (isStudentAiPaperGenerationExperience(experience)
      ? getStudentAiPaperAssemblyContainer(experience) !== null
      : getStudentAiLearningSessionQuestions(
          experience,
          createStudentAiLearningSessionPublicId(resultPublicId),
        ).length > 0)
  );
}

function canRetryCurrentGeneratedPractice(
  experience: PersonalAiGenerationLocalBrowserExperienceDto,
): boolean {
  if (experience.flowStatus !== "accepted") {
    return false;
  }

  if (
    experience.resultState.status === "failed" ||
    experience.resultState.status === "cancelled"
  ) {
    return true;
  }

  return (
    experience.resultState.status === "succeeded" &&
    !canUseCurrentGeneratedPractice(experience)
  );
}

function StudentPersonalAiGenerationHistorySummary({
  historyState,
  historyRows,
  onChangePage,
  onCancelTask,
  pagination,
  taskType,
}: {
  historyState: StudentPersonalAiGenerationHistoryState;
  historyRows: PersonalAiGenerationRequestHistoryDto;
  onChangePage: (page: number) => void;
  onCancelTask: (taskPublicId: string) => void;
  pagination: ApiPagination | null;
  taskType: StudentPersonalAiGenerationTaskType;
}) {
  const totalPages =
    pagination === null
      ? 1
      : Math.max(1, Math.ceil(pagination.total / pagination.pageSize));
  const canGoPrevious = pagination !== null && pagination.page > 1;
  const canGoNext = pagination !== null && pagination.page < totalPages;

  function renderHistoryBody() {
    if (historyState === "loading") {
      return (
        <div className="flex items-center gap-3 py-3">
          <Loader2
            className="text-brand-primary size-5 animate-spin"
            aria-hidden="true"
          />
          <p className="text-text-primary text-sm font-medium">
            {copy.historyLoadingTitle}
          </p>
        </div>
      );
    }

    if (historyState === "unauthorized") {
      return (
        <p className="text-text-secondary border-border rounded-lg border border-dashed px-3 py-3 text-sm">
          {copy.historyUnauthorizedTitle}
        </p>
      );
    }

    if (historyState === "error") {
      return (
        <p className="text-warning bg-warning/10 rounded-lg px-3 py-3 text-sm font-medium">
          {copy.historyErrorTitle}
        </p>
      );
    }

    if (historyRows.length === 0) {
      return (
        <p className="text-text-secondary border-border rounded-lg border border-dashed px-3 py-3 text-sm">
          {copy.historyEmptyTitle}
        </p>
      );
    }

    return (
      <div className="space-y-3">
        {historyRows.map((historyRow) => (
          <article
            key={historyRow.requestPublicId}
            className="border-border rounded-lg border px-3"
          >
            <dl>
              <ContractField label="状态" value={historyRow.status} />
              <ContractField
                label="重试次数"
                value={String(historyRow.retryCount ?? 0)}
              />
              <ContractField
                label="失败类别"
                value={historyRow.failureCategory ?? "无"}
              />
              <ContractField
                label="请求时间"
                value={formatLearnerDateTime(historyRow.requestedAt)}
              />
              <ContractField
                label="依据资料状态"
                value={historyRow.evidenceStatus}
              />
              <ContractField
                label="依据数量"
                value={String(historyRow.citationCount)}
              />
            </dl>
            {historyRow.canCancel === true ? (
              <div className="border-border mt-2 flex flex-wrap items-center justify-between gap-2 border-t py-3">
                <p className="text-text-secondary text-xs">
                  取消只阻止结果落库或继续采用，不保证停止远端 Provider
                  计费或传输。
                </p>
                <button
                  className="border-border text-text-primary hover:bg-muted rounded-md border px-3 py-1.5 text-sm font-medium"
                  type="button"
                  onClick={() => onCancelTask(historyRow.taskPublicId)}
                >
                  取消任务
                </button>
              </div>
            ) : null}
          </article>
        ))}
      </div>
    );
  }

  return (
    <section className="border-border bg-surface rounded-xl border p-4">
      <div className="mb-3 flex items-center gap-3">
        <div className="bg-secondary text-secondary-foreground flex size-9 shrink-0 items-center justify-center rounded-lg">
          <History className="size-4" aria-hidden="true" />
        </div>
        <h2 className="font-heading text-text-primary text-base font-semibold">
          {copy.historyTitle}
        </h2>
      </div>
      <div className="mb-3 flex flex-wrap items-center gap-2 text-xs">
        <span className="bg-muted text-text-secondary rounded-md px-2 py-1 font-medium">
          当前筛选：{contractValueLabelMap[taskType]}
        </span>
        <span className="bg-muted text-text-secondary rounded-md px-2 py-1 font-medium">
          默认按请求时间倒序
        </span>
        {pagination !== null ? (
          <span className="bg-muted text-text-secondary rounded-md px-2 py-1 font-medium">
            第 {pagination.page} / {totalPages} 页，共 {pagination.total} 条
          </span>
        ) : null}
      </div>
      {pagination !== null ? (
        <nav
          aria-label="AI请求历史分页"
          className="mb-3 flex items-center justify-between gap-3"
        >
          <p className="text-text-secondary text-sm">
            第 {pagination.page} / {totalPages} 页
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              className="border-border text-text-primary hover:bg-muted h-9 rounded-lg border bg-transparent px-3 text-sm font-medium transition-transform active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
              disabled={historyState === "loading" || !canGoPrevious}
              onClick={() => onChangePage(pagination.page - 1)}
            >
              上一页
            </button>
            <button
              type="button"
              className="border-border text-text-primary hover:bg-muted h-9 rounded-lg border bg-transparent px-3 text-sm font-medium transition-transform active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
              disabled={historyState === "loading" || !canGoNext}
              onClick={() => onChangePage(pagination.page + 1)}
            >
              下一页
            </button>
          </div>
        </nav>
      ) : null}
      {renderHistoryBody()}
    </section>
  );
}

function StudentPersonalAiGenerationResultHistorySummary({
  historyTaskType,
  learningSessionResultPublicId,
  onChangePage,
  pagination,
  resultHistoryState,
  resultHistory,
  isResultDetailLoading,
  onStartOrResumeLearningSession,
  onOpenResultDetail,
  selectedResultPublicId,
}: {
  historyTaskType: StudentPersonalAiGenerationTaskType;
  learningSessionResultPublicId: string | null;
  onChangePage: (page: number) => void;
  pagination: ApiPagination | null;
  resultHistoryState: StudentPersonalAiGenerationHistoryState;
  resultHistory: PersonalAiGenerationResultHistoryDto | null;
  isResultDetailLoading: boolean;
  onStartOrResumeLearningSession: (resultPublicId: string) => void;
  onOpenResultDetail: (resultPublicId: string) => void;
  selectedResultPublicId: string | null;
}) {
  const totalPages =
    pagination === null
      ? 1
      : Math.max(1, Math.ceil(pagination.total / pagination.pageSize));
  const canGoPrevious = pagination !== null && pagination.page > 1;
  const canGoNext = pagination !== null && pagination.page < totalPages;

  function renderResultHistoryBody() {
    if (resultHistoryState === "loading") {
      return (
        <div className="flex items-center gap-3 py-3">
          <Loader2
            className="text-brand-primary size-5 animate-spin"
            aria-hidden="true"
          />
          <p className="text-text-primary text-sm font-medium">
            {copy.resultHistoryLoadingTitle}
          </p>
        </div>
      );
    }

    if (resultHistoryState === "unauthorized") {
      return (
        <p className="text-text-secondary border-border rounded-lg border border-dashed px-3 py-3 text-sm">
          {copy.resultHistoryUnauthorizedTitle}
        </p>
      );
    }

    if (resultHistoryState === "error") {
      return (
        <p className="text-warning bg-warning/10 rounded-lg px-3 py-3 text-sm font-medium">
          {copy.resultHistoryErrorTitle}
        </p>
      );
    }

    if (resultHistory === null || resultHistory.results.length === 0) {
      return (
        <p className="text-text-secondary border-border rounded-lg border border-dashed px-3 py-3 text-sm">
          {copy.resultHistoryEmptyTitle}
        </p>
      );
    }

    return (
      <div className="space-y-3">
        {resultHistory.results.map((resultRow) => (
          <article
            key={resultRow.resultPublicId}
            className="border-border rounded-lg border px-3"
          >
            <dl>
              <ContractField label="任务类型" value={resultRow.taskType} />
              <ContractField label="状态" value={resultRow.status} />
              <ContractField
                label="生成时间"
                value={formatLearnerDateTime(resultRow.persistedAt)}
              />
              <ContractField
                label="生成内容摘要"
                value={resultRow.contentReference.contentPreviewMasked}
              />
              <ContractField
                label="依据资料状态"
                value={resultRow.evidenceReference.evidenceStatus}
              />
              <ContractField
                label="依据数量"
                value={String(resultRow.evidenceReference.citationCount)}
              />
              <ContractField
                label="学习内容边界"
                value={resultRow.formalAdoption.status}
              />
            </dl>
            {resultRow.paperAssembly != null ? (
              <StudentAiPaperAssemblySummary
                compact
                paperAssembly={resultRow.paperAssembly}
              />
            ) : null}
            <div className="border-border flex flex-wrap justify-end gap-2 border-t py-3">
              {canResumeAiPaperResult(resultRow) ? (
                <button
                  type="button"
                  disabled={
                    learningSessionResultPublicId === resultRow.resultPublicId
                  }
                  onClick={() =>
                    onStartOrResumeLearningSession(resultRow.resultPublicId)
                  }
                  className="bg-primary text-primary-foreground flex h-9 items-center justify-center gap-2 rounded-lg px-3 text-sm font-medium transition-transform active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {learningSessionResultPublicId ===
                  resultRow.resultPublicId ? (
                    <Loader2
                      className="size-4 animate-spin"
                      aria-hidden="true"
                    />
                  ) : (
                    <BookOpen className="size-4" aria-hidden="true" />
                  )}
                  开始或继续自测
                </button>
              ) : null}
              <button
                type="button"
                disabled={
                  isResultDetailLoading &&
                  selectedResultPublicId === resultRow.resultPublicId
                }
                onClick={() => onOpenResultDetail(resultRow.resultPublicId)}
                className="bg-secondary text-secondary-foreground flex h-9 items-center justify-center gap-2 rounded-lg px-3 text-sm font-medium transition-transform active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isResultDetailLoading &&
                selectedResultPublicId === resultRow.resultPublicId ? (
                  <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                ) : (
                  <Eye className="size-4" aria-hidden="true" />
                )}
                {copy.resultDetailButton}
              </button>
            </div>
          </article>
        ))}
      </div>
    );
  }

  return (
    <section className="border-border bg-surface rounded-xl border p-4">
      <div className="mb-3 flex items-center gap-3">
        <div className="bg-secondary text-secondary-foreground flex size-9 shrink-0 items-center justify-center rounded-lg">
          <History className="size-4" aria-hidden="true" />
        </div>
        <h2 className="font-heading text-text-primary text-base font-semibold">
          {copy.resultHistoryTitle}
        </h2>
      </div>
      <div className="mb-3 flex flex-wrap items-center gap-2 text-xs">
        <span className="bg-muted text-text-secondary rounded-md px-2 py-1 font-medium">
          当前筛选：{contractValueLabelMap[historyTaskType]}
        </span>
        <span className="bg-muted text-text-secondary rounded-md px-2 py-1 font-medium">
          默认按持久化时间倒序
        </span>
        {pagination !== null ? (
          <span className="bg-muted text-text-secondary rounded-md px-2 py-1 font-medium">
            第 {pagination.page} / {totalPages} 页，共 {pagination.total} 条
          </span>
        ) : null}
      </div>
      {pagination !== null ? (
        <nav
          aria-label="AI生成结果历史分页"
          className="mb-3 flex items-center justify-between gap-3"
        >
          <p className="text-text-secondary text-sm">
            第 {pagination.page} / {totalPages} 页
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              className="border-border text-text-primary hover:bg-muted h-9 rounded-lg border bg-transparent px-3 text-sm font-medium transition-transform active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
              disabled={resultHistoryState === "loading" || !canGoPrevious}
              onClick={() => onChangePage(pagination.page - 1)}
            >
              上一页
            </button>
            <button
              type="button"
              className="border-border text-text-primary hover:bg-muted h-9 rounded-lg border bg-transparent px-3 text-sm font-medium transition-transform active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
              disabled={resultHistoryState === "loading" || !canGoNext}
              onClick={() => onChangePage(pagination.page + 1)}
            >
              下一页
            </button>
          </div>
        </nav>
      ) : null}
      {renderResultHistoryBody()}
    </section>
  );
}

function canResumeAiPaperResult(
  result: PersonalAiGenerationResultHistoryDto["results"][number],
): boolean {
  return (
    result.taskType === "ai_paper_generation" &&
    result.status === "draft" &&
    result.evidenceReference.evidenceStatus === "sufficient" &&
    result.evidenceReference.citationCount > 0 &&
    result.paperAssembly?.status === "assembled" &&
    result.paperAssembly.insufficiency === null &&
    result.paperAssembly.container.selectedQuestionCount > 0
  );
}

function StudentPersonalAiGenerationResultDetailSummary({
  resultDetailState,
  resultDetail,
}: {
  resultDetailState: StudentPersonalAiGenerationResultDetailState;
  resultDetail: PersonalAiGenerationResultDetailDto | null;
}) {
  if (resultDetailState === "idle") {
    return null;
  }

  function renderResultDetailBody() {
    if (resultDetailState === "loading") {
      return (
        <div className="flex items-center gap-3 py-3">
          <Loader2
            className="text-brand-primary size-5 animate-spin"
            aria-hidden="true"
          />
          <p className="text-text-primary text-sm font-medium">
            {copy.resultDetailLoadingTitle}
          </p>
        </div>
      );
    }

    if (resultDetailState === "unauthorized") {
      return (
        <p className="text-text-secondary border-border rounded-lg border border-dashed px-3 py-3 text-sm">
          {copy.resultDetailUnauthorizedTitle}
        </p>
      );
    }

    if (resultDetailState === "error") {
      return (
        <p className="text-warning bg-warning/10 rounded-lg px-3 py-3 text-sm font-medium">
          {copy.resultDetailErrorTitle}
        </p>
      );
    }

    if (resultDetailState === "empty" || resultDetail === null) {
      return (
        <p className="text-text-secondary border-border rounded-lg border border-dashed px-3 py-3 text-sm">
          {copy.resultDetailEmptyTitle}
        </p>
      );
    }

    return (
      <div className="space-y-3">
        <dl className="border-border rounded-lg border px-3">
          <ContractField
            label="任务类型"
            value={resultDetail.result.taskType}
          />
          <ContractField label="状态" value={resultDetail.result.status} />
          <ContractField
            label="生成时间"
            value={formatLearnerDateTime(resultDetail.result.persistedAt)}
          />
          <ContractField
            label="生成内容摘要"
            value={resultDetail.result.contentReference.contentPreviewMasked}
          />
          <ContractField
            label="依据资料状态"
            value={resultDetail.result.evidenceReference.evidenceStatus}
          />
          <ContractField
            label="依据数量"
            value={String(resultDetail.result.evidenceReference.citationCount)}
          />
          <ContractField
            label="学习内容边界"
            value={resultDetail.result.formalAdoption.status}
          />
          <ContractField
            label="学习闭环限制"
            value={String(resultDetail.result.formalAdoption.isBlocked)}
          />
        </dl>
        {resultDetail.result.paperAssembly != null ? (
          <StudentAiPaperAssemblySummary
            paperAssembly={resultDetail.result.paperAssembly}
          />
        ) : null}
      </div>
    );
  }

  return (
    <section className="border-border bg-surface rounded-xl border p-4">
      <div className="mb-3 flex items-center gap-3">
        <div className="bg-secondary text-secondary-foreground flex size-9 shrink-0 items-center justify-center rounded-lg">
          <Eye className="size-4" aria-hidden="true" />
        </div>
        <h2 className="font-heading text-text-primary text-base font-semibold">
          {copy.resultDetailTitle}
        </h2>
      </div>
      {renderResultDetailBody()}
    </section>
  );
}

export function StudentPersonalAiGenerationPage() {
  const [hasSessionToken, setHasSessionToken] = useState(
    readHasStudentSessionToken,
  );
  const [pageState, setPageState] =
    useState<StudentPersonalAiGenerationPageState>(
      hasSessionToken ? "empty" : "checking",
    );
  const [generationAvailabilityState, setGenerationAvailabilityState] =
    useState<StudentAiGenerationAvailabilityState>("loading");
  const [experience, setExperience] =
    useState<PersonalAiGenerationLocalBrowserExperienceDto | null>(null);
  const [historyState, setHistoryState] =
    useState<StudentPersonalAiGenerationHistoryState>(
      hasSessionToken ? "loading" : "loading",
    );
  const [requestHistory, setRequestHistory] =
    useState<PersonalAiGenerationRequestHistoryDto>([]);
  const [requestHistoryPagination, setRequestHistoryPagination] =
    useState<ApiPagination | null>(null);
  const [resultHistoryState, setResultHistoryState] =
    useState<StudentPersonalAiGenerationHistoryState>(
      hasSessionToken ? "loading" : "loading",
    );
  const [resultHistory, setResultHistory] =
    useState<PersonalAiGenerationResultHistoryDto | null>(null);
  const [resultHistoryPagination, setResultHistoryPagination] =
    useState<ApiPagination | null>(null);
  const [resultDetailState, setResultDetailState] =
    useState<StudentPersonalAiGenerationResultDetailState>("idle");
  const [resultDetail, setResultDetail] =
    useState<PersonalAiGenerationResultDetailDto | null>(null);
  const [selectedResultPublicId, setSelectedResultPublicId] = useState<
    string | null
  >(null);
  const [lastSubmittedTaskType, setLastSubmittedTaskType] =
    useState<StudentPersonalAiGenerationTaskType>("ai_question_generation");
  const [activeTaskType, setActiveTaskType] =
    useState<StudentPersonalAiGenerationTaskType>("ai_question_generation");
  const requestHistoryLoadSequenceRef = useRef(0);
  const resultHistoryLoadSequenceRef = useRef(0);
  const resultDetailLoadSequenceRef = useRef(0);
  const idempotencyIntentRef = useRef<{
    fingerprint: string;
    identifiers: ReturnType<
      typeof createPersonalAiGenerationRequestIdentifiers
    >;
  } | null>(null);
  const [aiQuestionCount, setAiQuestionCount] = useState(
    AI_QUESTION_DEFAULT_QUESTION_COUNT,
  );
  const [aiPaperQuestionCount, setAiPaperQuestionCount] = useState(
    AI_PAPER_DEFAULT_QUESTION_COUNT,
  );
  const [aiQuestionKnowledgeScope, setAiQuestionKnowledgeScope] = useState(
    createDefaultStudentAiKnowledgeScopeState,
  );
  const [aiPaperKnowledgeScope, setAiPaperKnowledgeScope] = useState(
    createDefaultStudentAiKnowledgeScopeState,
  );
  const [aiPaperSourcePreference, setAiPaperSourcePreference] =
    useState("均衡使用");
  const [aiPaperQuestionTypeDistribution, setAiPaperQuestionTypeDistribution] =
    useState<(typeof studentAiPaperQuestionTypeDistributionOptions)[number]>(
      "均衡分布",
    );
  const [aiPaperStructure, setAiPaperStructure] =
    useState<(typeof studentAiPaperStructureOptions)[number]>("按题型分大题");
  const [aiPaperDifficulty, setAiPaperDifficulty] = useState("中等");
  const [aiPaperLearningObjective, setAiPaperLearningObjective] =
    useState("阶段自测");
  const [practiceFeedbackState, setPracticeFeedbackState] =
    useState<StudentPersonalAiGenerationPracticeFeedbackState>("waiting");
  const [isAiLearningSessionStarted, setIsAiLearningSessionStarted] =
    useState(false);
  const [activeAiLearningSessionPublicId, setActiveAiLearningSessionPublicId] =
    useState<string | null>(null);
  const [learningSessionResultPublicId, setLearningSessionResultPublicId] =
    useState<string | null>(null);
  const [
    serverAiLearningSessionQuestions,
    setServerAiLearningSessionQuestions,
  ] = useState<PersonalAiGenerationLearningSessionQuestionDto[]>([]);
  const [
    selectedAiLearningAnswerLabelsByQuestion,
    setSelectedAiLearningAnswerLabelsByQuestion,
  ] = useState<StudentAiLearningSelectedLabelsByQuestion>({});
  const [
    aiLearningAnswerFeedbackByQuestion,
    setAiLearningAnswerFeedbackByQuestion,
  ] = useState<StudentAiLearningAnswerFeedbackByQuestion>({});
  const [authorizationContexts, setAuthorizationContexts] = useState<
    EffectiveAuthorizationContextDto[]
  >([]);
  const [requestedAuthorizationPublicIdAtMount] = useState(
    readAuthorizationPublicIdFromLocation,
  );
  const [selectedAuthorizationPublicId, setSelectedAuthorizationPublicId] =
    useState<string | null>(requestedAuthorizationPublicIdAtMount);
  const [studentAiKnowledgeNodeOptions, setStudentAiKnowledgeNodeOptions] =
    useState<StudentAiKnowledgeNodeOption[]>([]);
  const [studentAiKnowledgeNodeLoadState, setStudentAiKnowledgeNodeLoadState] =
    useState<StudentAiKnowledgeNodeLoadState>("idle");

  useEffect(() => {
    const sessionRequestToken = readStudentSessionRequestToken();
    let isCancelled = false;
    let hasSelectableAuthorizationContext = false;

    function markUnauthorized() {
      setHasSessionToken(false);
      setPageState("unauthorized");
      setHistoryState("unauthorized");
      setRequestHistory([]);
      setRequestHistoryPagination(null);
      setResultHistoryState("unauthorized");
      setResultHistory(null);
      setResultHistoryPagination(null);
      setResultDetailState("unauthorized");
      setResultDetail(null);
      setSelectedResultPublicId(null);
      setAuthorizationContexts([]);
      setSelectedAuthorizationPublicId(null);
    }

    function markUnavailable() {
      setHasSessionToken(false);
      setPageState("unavailable");
      setHistoryState("unauthorized");
      setRequestHistory([]);
      setRequestHistoryPagination(null);
      setResultHistoryState("unauthorized");
      setResultHistory(null);
      setResultHistoryPagination(null);
      setResultDetailState("idle");
      setResultDetail(null);
      setSelectedResultPublicId(null);
      setAuthorizationContexts([]);
      setSelectedAuthorizationPublicId(null);
    }

    async function markUnauthorizedOrUnavailable() {
      try {
        const sessionResponse =
          await fetchCurrentStudentSession(sessionRequestToken);

        if (
          sessionResponse.code === 0 &&
          sessionResponse.data !== null &&
          sessionResponse.data.user.userType !== null
        ) {
          markUnavailable();
          return;
        }
      } catch {
        // Keep the direct route conservative when the session check is unavailable.
      }

      markUnauthorized();
    }

    async function confirmCookieBackedSessionWhenNeeded(): Promise<boolean> {
      if (getStoredStudentSessionToken() !== null) {
        return true;
      }

      try {
        const sessionResponse =
          await fetchCurrentStudentSession(sessionRequestToken);

        if (isCancelled) {
          return false;
        }

        if (isStudentUnauthorizedResponse(sessionResponse)) {
          markUnauthorized();
          return false;
        }

        if (
          sessionResponse.code !== 0 ||
          sessionResponse.data === null ||
          sessionResponse.data.user.userType === null
        ) {
          setPageState("error");
          setHistoryState("error");
          setResultHistoryState("error");
          setRequestHistoryPagination(null);
          setResultHistoryPagination(null);
          return false;
        }

        setHasSessionToken(true);
        setPageState("empty");
        return true;
      } catch {
        if (!isCancelled) {
          setPageState("error");
          setHistoryState("error");
          setResultHistoryState("error");
          setRequestHistoryPagination(null);
          setResultHistoryPagination(null);
        }

        return false;
      }
    }

    async function confirmPersonalAiGenerationAuthorization(): Promise<
      string | null
    > {
      const fetchedAuthorizationContexts =
        await fetchPersonalAiGenerationAuthorizationContexts(
          sessionRequestToken,
        );

      if (isCancelled) {
        return null;
      }

      const selectableAuthorizationContexts =
        readPersonalAiGenerationAuthorizationContexts(
          fetchedAuthorizationContexts,
        );

      if (selectableAuthorizationContexts.length === 0) {
        markUnavailable();
        return null;
      }

      hasSelectableAuthorizationContext = true;

      const exactRequestedAuthorizationContext =
        requestedAuthorizationPublicIdAtMount === null
          ? null
          : (selectableAuthorizationContexts.find(
              (authorizationContext) =>
                authorizationContext.authorizationPublicId ===
                requestedAuthorizationPublicIdAtMount,
            ) ?? null);
      const soleAuthorizationContext =
        requestedAuthorizationPublicIdAtMount === null &&
        fetchedAuthorizationContexts.length === 1 &&
        selectableAuthorizationContexts.length === 1
          ? selectableAuthorizationContexts[0]
          : null;
      const initialAuthorizationPublicId =
        exactRequestedAuthorizationContext?.authorizationPublicId ??
        soleAuthorizationContext?.authorizationPublicId ??
        null;
      setAuthorizationContexts(selectableAuthorizationContexts);
      setSelectedAuthorizationPublicId(initialAuthorizationPublicId);

      if (initialAuthorizationPublicId === null) {
        setHistoryState("empty");
        setRequestHistory([]);
        setRequestHistoryPagination(null);
        setResultHistoryState("empty");
        setResultHistory(null);
        setResultHistoryPagination(null);
      } else {
        writeAuthorizationPublicIdToLocation(initialAuthorizationPublicId);
      }

      return initialAuthorizationPublicId;
    }

    async function fetchInitialRequestHistory(authorizationPublicId: string) {
      const requestHistoryLoadSequence = requestHistoryLoadSequenceRef.current;

      try {
        const historyResponse =
          await fetchPersonalAiGenerationRequestHistoryForSession(
            sessionRequestToken,
            DEFAULT_STUDENT_AI_GENERATION_HISTORY_TASK_TYPE,
            PERSONAL_AI_GENERATION_HISTORY_PAGE,
            authorizationPublicId,
          );

        if (
          isCancelled ||
          requestHistoryLoadSequence !== requestHistoryLoadSequenceRef.current
        ) {
          return;
        }

        if (isStudentUnauthorizedResponse(historyResponse)) {
          await markUnauthorizedOrUnavailable();
          return;
        }

        if (isStudentAccessDeniedResponse(historyResponse)) {
          markUnavailable();
          return;
        }

        if (historyResponse.code !== 0 || historyResponse.data === null) {
          setHistoryState("error");
          setRequestHistory([]);
          setRequestHistoryPagination(null);
          return;
        }

        setRequestHistory(historyResponse.data);
        setRequestHistoryPagination(historyResponse.pagination ?? null);
        setHistoryState(historyResponse.data.length === 0 ? "empty" : "ready");
      } catch {
        if (
          !isCancelled &&
          requestHistoryLoadSequence === requestHistoryLoadSequenceRef.current
        ) {
          setHistoryState("error");
          setRequestHistory([]);
          setRequestHistoryPagination(null);
        }
      }
    }

    async function fetchInitialResultHistory(authorizationPublicId: string) {
      const resultHistoryLoadSequence = resultHistoryLoadSequenceRef.current;

      try {
        const historyResponse = await fetchPersonalAiGenerationResultHistory(
          sessionRequestToken,
          DEFAULT_STUDENT_AI_GENERATION_HISTORY_TASK_TYPE,
          PERSONAL_AI_GENERATION_HISTORY_PAGE,
          authorizationPublicId,
        );

        if (
          isCancelled ||
          resultHistoryLoadSequence !== resultHistoryLoadSequenceRef.current
        ) {
          return;
        }

        if (isStudentUnauthorizedResponse(historyResponse)) {
          await markUnauthorizedOrUnavailable();
          return;
        }

        if (isStudentAccessDeniedResponse(historyResponse)) {
          markUnavailable();
          return;
        }

        if (historyResponse.code !== 0 || historyResponse.data === null) {
          setResultHistoryState("error");
          setResultHistory(null);
          setResultHistoryPagination(null);
          return;
        }

        setResultHistory(historyResponse.data);
        setResultHistoryPagination(historyResponse.pagination ?? null);
        setResultHistoryState(
          historyResponse.data.results.length === 0 ? "empty" : "ready",
        );
      } catch {
        if (
          !isCancelled &&
          resultHistoryLoadSequence === resultHistoryLoadSequenceRef.current
        ) {
          setResultHistoryState("error");
          setResultHistory(null);
          setResultHistoryPagination(null);
        }
      }
    }

    async function loadInitialData() {
      const hasConfirmedSession = await confirmCookieBackedSessionWhenNeeded();

      if (!hasConfirmedSession || isCancelled) {
        return;
      }

      const initialAuthorizationPublicId =
        await confirmPersonalAiGenerationAuthorization();

      if (!hasSelectableAuthorizationContext || isCancelled) {
        return;
      }

      try {
        const availabilityResponse =
          await fetchStudentApi<AiGenerationAvailabilityDto>(
            "/api/v1/ai-generation/availability",
            sessionRequestToken,
            { method: "GET" },
          );

        if (isCancelled) {
          return;
        }

        if (isStudentUnauthorizedResponse(availabilityResponse)) {
          markUnauthorized();
          return;
        }

        const generationAvailability =
          availabilityResponse.code === 0 && availabilityResponse.data !== null
            ? availabilityResponse.data.generationAvailability
            : null;

        if (
          generationAvailability !== "available" &&
          generationAvailability !== "closed"
        ) {
          setGenerationAvailabilityState("error");
        } else {
          setGenerationAvailabilityState(generationAvailability);
        }
      } catch {
        if (!isCancelled) {
          setGenerationAvailabilityState("error");
        }
      }

      if (initialAuthorizationPublicId === null || isCancelled) {
        return;
      }

      void fetchInitialRequestHistory(initialAuthorizationPublicId);
      void fetchInitialResultHistory(initialAuthorizationPublicId);
    }

    void loadInitialData();

    return () => {
      isCancelled = true;
    };
  }, [requestedAuthorizationPublicIdAtMount]);

  async function handleSubmitPersonalAiGenerationRequest(
    taskType: StudentPersonalAiGenerationTaskType,
  ) {
    if (generationAvailabilityState !== "available") {
      return;
    }

    const sessionRequestToken = readStudentSessionRequestToken();

    function markUnauthorized() {
      setHasSessionToken(false);
      setPageState("unauthorized");
      setHistoryState("unauthorized");
      setRequestHistory([]);
      setRequestHistoryPagination(null);
      setResultHistoryState("unauthorized");
      setResultHistory(null);
      setResultHistoryPagination(null);
      setResultDetailState("unauthorized");
      setResultDetail(null);
      setSelectedResultPublicId(null);
      setAuthorizationContexts([]);
      setSelectedAuthorizationPublicId(null);
    }

    function markUnavailable() {
      setHasSessionToken(false);
      setPageState("unavailable");
      setHistoryState("unauthorized");
      setRequestHistory([]);
      setRequestHistoryPagination(null);
      setResultHistoryState("unauthorized");
      setResultHistory(null);
      setResultHistoryPagination(null);
      setResultDetailState("idle");
      setResultDetail(null);
      setSelectedResultPublicId(null);
      setAuthorizationContexts([]);
      setSelectedAuthorizationPublicId(null);
    }

    setLastSubmittedTaskType(taskType);
    setPracticeFeedbackState("waiting");
    setIsAiLearningSessionStarted(false);
    setActiveAiLearningSessionPublicId(null);
    setLearningSessionResultPublicId(null);
    setServerAiLearningSessionQuestions([]);
    setSelectedAiLearningAnswerLabelsByQuestion({});
    setAiLearningAnswerFeedbackByQuestion({});
    setHasSessionToken(true);
    setPageState("loading");

    try {
      const sessionResponse =
        await fetchCurrentStudentSession(sessionRequestToken);

      if (isStudentUnauthorizedResponse(sessionResponse)) {
        markUnauthorized();
        return;
      }

      if (sessionResponse.code !== 0 || sessionResponse.data === null) {
        setPageState("error");
        setHistoryState("error");
        setRequestHistory([]);
        setRequestHistoryPagination(null);
        setResultHistoryState("error");
        setResultHistory(null);
        setResultHistoryPagination(null);
        setResultDetailState("error");
        setResultDetail(null);
        setSelectedResultPublicId(null);
        return;
      }

      if (sessionResponse.data.user.userType === null) {
        markUnauthorized();
        return;
      }

      if (
        sessionResponse.data.user.userType === "employee" &&
        sessionResponse.data.user.organizationPublicId === null
      ) {
        markUnavailable();
        return;
      }

      const fetchedAuthorizationContexts =
        await fetchPersonalAiGenerationAuthorizationContexts(
          sessionRequestToken,
        );
      const selectableAuthorizationContexts =
        readPersonalAiGenerationAuthorizationContexts(
          fetchedAuthorizationContexts,
        );

      if (selectableAuthorizationContexts.length === 0) {
        markUnavailable();
        return;
      }

      setAuthorizationContexts(selectableAuthorizationContexts);

      const generationAuthorizationContext =
        selectPersonalAiGenerationAuthorizationContext(
          selectableAuthorizationContexts,
          taskType,
          selectedAuthorizationPublicId,
        );

      if (generationAuthorizationContext === null) {
        markUnavailable();
        return;
      }

      setSelectedAuthorizationPublicId(
        generationAuthorizationContext.authorizationPublicId,
      );

      const generationQuestionCount =
        taskType === "ai_question_generation"
          ? normalizeStudentAiQuestionCount(
              aiQuestionCount,
              AI_QUESTION_DEFAULT_QUESTION_COUNT,
              AI_QUESTION_MAX_QUESTION_COUNT,
            )
          : normalizeStudentAiQuestionCount(
              aiPaperQuestionCount,
              AI_PAPER_DEFAULT_QUESTION_COUNT,
              AI_PAPER_MAX_QUESTION_COUNT,
            );
      const generationKnowledgeScopeState =
        taskType === "ai_question_generation"
          ? aiQuestionKnowledgeScope
          : aiPaperKnowledgeScope;
      const generationSourcePreference =
        taskType === "ai_paper_generation"
          ? mapStudentAiPaperSourcePreference(
              aiPaperSourcePreference,
              generationAuthorizationContext,
            )
          : null;
      const generationParameters = createStudentGenerationParameters(
        generationAuthorizationContext,
        taskType,
        generationQuestionCount,
        generationKnowledgeScopeState,
        generationSourcePreference,
        taskType === "ai_paper_generation"
          ? {
              questionTypeDistribution:
                mapStudentAiPaperQuestionTypeDistribution(
                  aiPaperQuestionTypeDistribution,
                ),
              paperStructure: mapStudentAiPaperStructure(aiPaperStructure),
              difficulty: mapStudentAiDifficulty(aiPaperDifficulty),
              learningObjective: normalizeKnowledgeNodeSupplement(
                aiPaperLearningObjective,
              ),
            }
          : undefined,
      );
      const idempotencyFingerprint = JSON.stringify({
        authorizationPublicId:
          generationAuthorizationContext.authorizationPublicId,
        generationParameters,
        taskType,
      });
      const idempotencyIntent =
        idempotencyIntentRef.current?.fingerprint === idempotencyFingerprint
          ? idempotencyIntentRef.current
          : {
              fingerprint: idempotencyFingerprint,
              identifiers: createPersonalAiGenerationRequestIdentifiers(),
            };
      idempotencyIntentRef.current = idempotencyIntent;

      const response =
        await fetchStudentApi<PersonalAiGenerationLocalBrowserExperienceDto>(
          "/api/v1/personal-ai-generation-requests",
          sessionRequestToken,
          {
            method: "POST",
            headers: {
              "content-type": "application/json",
            },
            body: JSON.stringify(
              createPersonalAiGenerationRequestBody(
                createPersonalAiGenerationDraftForTask(taskType),
                sessionResponse.data.user,
                generationParameters,
                generationAuthorizationContext,
                idempotencyIntent.identifiers,
              ),
            ),
          },
        );

      if (isStudentUnauthorizedResponse(response)) {
        markUnavailable();
        return;
      }

      if (isStudentAccessDeniedResponse(response)) {
        markUnavailable();
        return;
      }

      if (response.code !== 0 || response.data === null) {
        setPageState("error");
        setHistoryState("error");
        setRequestHistory([]);
        setResultHistoryState("error");
        setResultHistory(null);
        setResultDetailState("error");
        setResultDetail(null);
        setSelectedResultPublicId(null);
        return;
      }

      setExperience(response.data);
      setPageState("ready");
      idempotencyIntentRef.current = null;
      await loadAiGenerationHistories(
        taskType,
        PERSONAL_AI_GENERATION_HISTORY_PAGE,
        PERSONAL_AI_GENERATION_HISTORY_PAGE,
        generationAuthorizationContext.authorizationPublicId,
      );
    } catch {
      setPageState("error");
      setHistoryState("error");
      setRequestHistory([]);
      setRequestHistoryPagination(null);
      setResultHistoryState("error");
      setResultHistory(null);
      setResultHistoryPagination(null);
      setResultDetailState("error");
      setResultDetail(null);
      setSelectedResultPublicId(null);
    }
  }

  async function handleOpenPersonalAiGenerationResultDetail(
    resultPublicId: string,
  ) {
    if (selectedAuthorizationPublicId === null) {
      return;
    }

    const sessionRequestToken = readStudentSessionRequestToken();
    const resultDetailLoadSequence = resultDetailLoadSequenceRef.current + 1;
    resultDetailLoadSequenceRef.current = resultDetailLoadSequence;

    function markUnauthorized() {
      setHasSessionToken(false);
      setPageState("unauthorized");
      setHistoryState("unauthorized");
      setRequestHistory([]);
      setResultHistoryState("unauthorized");
      setResultHistory(null);
      setResultDetailState("unauthorized");
      setResultDetail(null);
      setSelectedResultPublicId(null);
    }

    function markUnavailable() {
      setHasSessionToken(false);
      setPageState("unavailable");
      setHistoryState("unauthorized");
      setRequestHistory([]);
      setResultHistoryState("unauthorized");
      setResultHistory(null);
      setResultDetailState("idle");
      setResultDetail(null);
      setSelectedResultPublicId(null);
    }

    setHasSessionToken(true);
    setSelectedResultPublicId(resultPublicId);
    setResultDetailState("loading");
    setResultDetail(null);

    try {
      const detailResponse = await fetchPersonalAiGenerationResultDetail(
        sessionRequestToken,
        resultPublicId,
        selectedAuthorizationPublicId,
      );

      if (resultDetailLoadSequence !== resultDetailLoadSequenceRef.current) {
        return;
      }

      if (isStudentUnauthorizedResponse(detailResponse)) {
        markUnauthorized();
        return;
      }

      if (isStudentAccessDeniedResponse(detailResponse)) {
        markUnavailable();
        return;
      }

      if (
        detailResponse.code ===
        PERSONAL_AI_GENERATION_RESULT_DETAIL_NOT_FOUND_CODE
      ) {
        setResultDetailState("empty");
        setResultDetail(null);
        return;
      }

      if (detailResponse.code !== 0 || detailResponse.data === null) {
        setResultDetailState("error");
        setResultDetail(null);
        return;
      }

      setResultDetail(detailResponse.data);
      setResultDetailState("ready");
    } catch {
      if (resultDetailLoadSequence !== resultDetailLoadSequenceRef.current) {
        return;
      }

      setResultDetailState("error");
      setResultDetail(null);
    }
  }

  function handleRetryPersonalAiGenerationRequest() {
    void handleSubmitPersonalAiGenerationRequest(lastSubmittedTaskType);
  }

  async function loadAiGenerationHistories(
    taskType: StudentPersonalAiGenerationTaskType,
    requestPage: number,
    resultPage: number,
    authorizationPublicId: string | null,
  ) {
    if (authorizationPublicId === null) {
      return;
    }

    const requestHistoryLoadSequence =
      requestHistoryLoadSequenceRef.current + 1;
    requestHistoryLoadSequenceRef.current = requestHistoryLoadSequence;
    const resultHistoryLoadSequence = resultHistoryLoadSequenceRef.current + 1;
    resultHistoryLoadSequenceRef.current = resultHistoryLoadSequence;
    resultDetailLoadSequenceRef.current += 1;
    const sessionRequestToken = readStudentSessionRequestToken();

    setHistoryState("loading");
    setRequestHistory([]);
    setRequestHistoryPagination(null);
    setResultHistoryState("loading");
    setResultHistory(null);
    setResultHistoryPagination(null);
    setResultDetailState("idle");
    setResultDetail(null);
    setSelectedResultPublicId(null);

    const [requestHistoryResult, resultHistoryResult] =
      await Promise.allSettled([
        fetchPersonalAiGenerationRequestHistoryForSession(
          sessionRequestToken,
          taskType,
          requestPage,
          authorizationPublicId,
        ),
        fetchPersonalAiGenerationResultHistory(
          sessionRequestToken,
          taskType,
          resultPage,
          authorizationPublicId,
        ),
      ]);

    const isRequestHistoryCurrent =
      requestHistoryLoadSequence === requestHistoryLoadSequenceRef.current;
    const isResultHistoryCurrent =
      resultHistoryLoadSequence === resultHistoryLoadSequenceRef.current;

    if (!isRequestHistoryCurrent && !isResultHistoryCurrent) {
      return;
    }

    const historyResponses: Array<{
      code: number;
      message: string;
      data: unknown;
    }> = [];

    if (
      isRequestHistoryCurrent &&
      requestHistoryResult.status === "fulfilled"
    ) {
      historyResponses.push(requestHistoryResult.value);
    }

    if (isResultHistoryCurrent && resultHistoryResult.status === "fulfilled") {
      historyResponses.push(resultHistoryResult.value);
    }

    if (historyResponses.some(isStudentUnauthorizedResponse)) {
      setHasSessionToken(false);
      setPageState("unauthorized");
      setHistoryState("unauthorized");
      setRequestHistory([]);
      setRequestHistoryPagination(null);
      setResultHistoryState("unauthorized");
      setResultHistory(null);
      setResultHistoryPagination(null);
      return;
    }

    if (historyResponses.some(isStudentAccessDeniedResponse)) {
      setHasSessionToken(false);
      setPageState("unavailable");
      setHistoryState("unauthorized");
      setRequestHistory([]);
      setRequestHistoryPagination(null);
      setResultHistoryState("unauthorized");
      setResultHistory(null);
      setResultHistoryPagination(null);
      return;
    }

    if (isRequestHistoryCurrent) {
      if (
        requestHistoryResult.status === "rejected" ||
        requestHistoryResult.value.code !== 0 ||
        requestHistoryResult.value.data === null
      ) {
        setHistoryState("error");
        setRequestHistory([]);
        setRequestHistoryPagination(null);
      } else {
        setRequestHistory(requestHistoryResult.value.data);
        setRequestHistoryPagination(
          requestHistoryResult.value.pagination ?? null,
        );
        setHistoryState(
          requestHistoryResult.value.data.length === 0 ? "empty" : "ready",
        );
      }
    }

    if (isResultHistoryCurrent) {
      if (
        resultHistoryResult.status === "rejected" ||
        resultHistoryResult.value.code !== 0 ||
        resultHistoryResult.value.data === null
      ) {
        setResultHistoryState("error");
        setResultHistory(null);
        setResultHistoryPagination(null);
      } else {
        setResultHistory(resultHistoryResult.value.data);
        setResultHistoryPagination(
          resultHistoryResult.value.pagination ?? null,
        );
        setResultHistoryState(
          resultHistoryResult.value.data.results.length === 0
            ? "empty"
            : "ready",
        );
      }
    }
  }

  function handleSelectAiTrainingTaskType(
    taskType: StudentPersonalAiGenerationTaskType,
  ) {
    if (taskType === activeTaskType) {
      return;
    }

    setActiveTaskType(taskType);
    setPracticeFeedbackState("waiting");
    setIsAiLearningSessionStarted(false);
    setActiveAiLearningSessionPublicId(null);
    setLearningSessionResultPublicId(null);
    setServerAiLearningSessionQuestions([]);
    setSelectedAiLearningAnswerLabelsByQuestion({});
    setAiLearningAnswerFeedbackByQuestion({});
    void loadAiGenerationHistories(
      taskType,
      PERSONAL_AI_GENERATION_HISTORY_PAGE,
      PERSONAL_AI_GENERATION_HISTORY_PAGE,
      selectedAuthorizationPublicId,
    );
  }

  function handleSelectAuthorizationContext(authorizationPublicId: string) {
    if (authorizationPublicId === selectedAuthorizationPublicId) {
      return;
    }

    setSelectedAuthorizationPublicId(authorizationPublicId);
    writeAuthorizationPublicIdToLocation(authorizationPublicId);
    setAiQuestionKnowledgeScope((currentState) => ({
      ...currentState,
      includeDescendants: false,
      knowledgeNodePublicIds: [],
    }));
    setAiPaperKnowledgeScope((currentState) => ({
      ...currentState,
      includeDescendants: false,
      knowledgeNodePublicIds: [],
    }));
    void loadAiGenerationHistories(
      activeTaskType,
      PERSONAL_AI_GENERATION_HISTORY_PAGE,
      PERSONAL_AI_GENERATION_HISTORY_PAGE,
      authorizationPublicId,
    );
  }

  function handleChangeAiQuestionCount(value: string) {
    setAiQuestionCount(
      normalizeStudentAiQuestionCount(
        Number(value),
        AI_QUESTION_DEFAULT_QUESTION_COUNT,
        AI_QUESTION_MAX_QUESTION_COUNT,
      ),
    );
  }

  function handleChangeAiPaperQuestionCount(value: string) {
    setAiPaperQuestionCount(
      normalizeStudentAiQuestionCount(
        Number(value),
        AI_PAPER_DEFAULT_QUESTION_COUNT,
        AI_PAPER_MAX_QUESTION_COUNT,
      ),
    );
  }

  function handleChangeAiPaperQuestionTypeDistribution(value: string) {
    setAiPaperQuestionTypeDistribution(
      studentAiPaperQuestionTypeDistributionOptions.includes(
        value as (typeof studentAiPaperQuestionTypeDistributionOptions)[number],
      )
        ? (value as (typeof studentAiPaperQuestionTypeDistributionOptions)[number])
        : "均衡分布",
    );
  }

  function handleChangeAiPaperStructure(value: string) {
    setAiPaperStructure(
      studentAiPaperStructureOptions.includes(
        value as (typeof studentAiPaperStructureOptions)[number],
      )
        ? (value as (typeof studentAiPaperStructureOptions)[number])
        : "按题型分大题",
    );
  }

  async function handleChangeRequestHistoryPage(page: number) {
    if (selectedAuthorizationPublicId === null) {
      return;
    }

    const sessionRequestToken = readStudentSessionRequestToken();
    const requestHistoryLoadSequence =
      requestHistoryLoadSequenceRef.current + 1;
    requestHistoryLoadSequenceRef.current = requestHistoryLoadSequence;
    resultDetailLoadSequenceRef.current += 1;

    setHistoryState("loading");
    setResultDetailState("idle");
    setResultDetail(null);
    setSelectedResultPublicId(null);

    try {
      const historyResponse =
        await fetchPersonalAiGenerationRequestHistoryForSession(
          sessionRequestToken,
          activeTaskType,
          page,
          selectedAuthorizationPublicId,
        );

      if (
        requestHistoryLoadSequence !== requestHistoryLoadSequenceRef.current
      ) {
        return;
      }

      if (historyResponse.code !== 0 || historyResponse.data === null) {
        setHistoryState("error");
        setRequestHistory([]);
        setRequestHistoryPagination(null);
        return;
      }

      setRequestHistory(historyResponse.data);
      setRequestHistoryPagination(historyResponse.pagination ?? null);
      setHistoryState(historyResponse.data.length === 0 ? "empty" : "ready");
    } catch {
      if (
        requestHistoryLoadSequence !== requestHistoryLoadSequenceRef.current
      ) {
        return;
      }

      setHistoryState("error");
      setRequestHistory([]);
      setRequestHistoryPagination(null);
    }
  }

  async function handleCancelRequestTask(taskPublicId: string) {
    if (
      selectedAuthorizationContext === null ||
      selectedAuthorizationPublicId === null
    ) {
      return;
    }

    const sessionRequestToken = readStudentSessionRequestToken();
    const response = await fetchStudentApi(
      `/api/v1/personal-ai-generation-requests/${encodeURIComponent(taskPublicId)}/cancel`,
      sessionRequestToken,
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          authorizationPublicId: selectedAuthorizationPublicId,
          taskType: activeTaskType,
          profession: selectedAuthorizationContext.profession,
          level: selectedAuthorizationContext.level,
        }),
      },
    );

    if (response.code === 0) {
      await handleChangeRequestHistoryPage(
        requestHistoryPagination?.page ?? PERSONAL_AI_GENERATION_HISTORY_PAGE,
      );
    }
  }

  async function handleChangeResultHistoryPage(page: number) {
    if (selectedAuthorizationPublicId === null) {
      return;
    }

    const sessionRequestToken = readStudentSessionRequestToken();
    const resultHistoryLoadSequence = resultHistoryLoadSequenceRef.current + 1;
    resultHistoryLoadSequenceRef.current = resultHistoryLoadSequence;
    resultDetailLoadSequenceRef.current += 1;

    setResultHistoryState("loading");
    setResultDetailState("idle");
    setResultDetail(null);
    setSelectedResultPublicId(null);

    try {
      const resultHistoryResponse =
        await fetchPersonalAiGenerationResultHistory(
          sessionRequestToken,
          activeTaskType,
          page,
          selectedAuthorizationPublicId,
        );

      if (resultHistoryLoadSequence !== resultHistoryLoadSequenceRef.current) {
        return;
      }

      if (
        resultHistoryResponse.code !== 0 ||
        resultHistoryResponse.data === null
      ) {
        setResultHistoryState("error");
        setResultHistory(null);
        setResultHistoryPagination(null);
        return;
      }

      setResultHistory(resultHistoryResponse.data);
      setResultHistoryPagination(resultHistoryResponse.pagination ?? null);
      setResultHistoryState(
        resultHistoryResponse.data.results.length === 0 ? "empty" : "ready",
      );
    } catch {
      if (resultHistoryLoadSequence !== resultHistoryLoadSequenceRef.current) {
        return;
      }

      setResultHistoryState("error");
      setResultHistory(null);
      setResultHistoryPagination(null);
    }
  }

  const isAiGenerationBaseActionDisabled =
    !hasSessionToken ||
    selectedAuthorizationPublicId === null ||
    generationAvailabilityState !== "available" ||
    pageState === "checking" ||
    pageState === "loading" ||
    pageState === "unavailable";
  const isAiGenerationNavigationDisabled =
    !hasSessionToken ||
    pageState === "checking" ||
    pageState === "loading" ||
    pageState === "unavailable";
  const shouldShowAiGenerationDetailControls =
    hasSessionToken &&
    pageState !== "checking" &&
    pageState !== "unauthorized" &&
    pageState !== "unavailable";
  const shouldShowAuthorizationContextSelector =
    shouldShowAiGenerationDetailControls && authorizationContexts.length > 0;
  const selectedAuthorizationContext =
    selectedAuthorizationPublicId === null
      ? null
      : (authorizationContexts.find(
          (authorizationContext) =>
            authorizationContext.authorizationPublicId ===
            selectedAuthorizationPublicId,
        ) ?? null);
  const isOrganizationEmployeeAiTraining =
    selectedAuthorizationContext?.ownerType === "organization";
  const hasLocalAiGenerationExperience =
    pageState === "ready" &&
    experience !== null &&
    experience.requestFlow.resultReference.taskType === activeTaskType;
  const currentAiLearningSessionPublicId =
    hasLocalAiGenerationExperience &&
    experience.resultState.resultPublicId !== null
      ? createStudentAiLearningSessionPublicId(
          experience.resultState.resultPublicId,
        )
      : null;
  const aiLearningSessionQuestions = hasLocalAiGenerationExperience
    ? getStudentAiLearningSessionQuestions(
        experience,
        currentAiLearningSessionPublicId ?? "student-ai-learning-session",
      )
    : [];
  const activeAiLearningSessionQuestions = serverAiLearningSessionQuestions;
  const aiLearningSessionOwnerScope = hasLocalAiGenerationExperience
    ? resolveStudentAiLearningSessionOwnerScope({
        authorizationContexts,
        experience,
        selectedAuthorizationPublicId,
        taskType: experience.requestFlow.resultReference.taskType,
      })
    : null;
  const canUseGeneratedPractice =
    hasLocalAiGenerationExperience &&
    canUseCurrentGeneratedPractice(experience);
  const practiceFeedbackStateForCurrentResult =
    hasLocalAiGenerationExperience &&
    experience.flowStatus === "accepted" &&
    experience.resultState.status === "succeeded" &&
    !canUseGeneratedPractice
      ? "insufficient"
      : practiceFeedbackState;
  const activeAuthorizationContext =
    selectPersonalAiGenerationAuthorizationContext(
      authorizationContexts,
      activeTaskType,
      selectedAuthorizationPublicId,
    );
  const activeKnowledgeScopeState =
    activeTaskType === "ai_question_generation"
      ? aiQuestionKnowledgeScope
      : aiPaperKnowledgeScope;
  const activeKnowledgeNodeOptions = useMemo(() => {
    return activeKnowledgeScopeState.knowledgeNodeMode === "selected"
      ? studentAiKnowledgeNodeOptions
      : [];
  }, [
    activeKnowledgeScopeState.knowledgeNodeMode,
    studentAiKnowledgeNodeOptions,
  ]);
  const activeKnowledgeNodeLoadState: StudentAiKnowledgeNodeLoadState =
    activeKnowledgeScopeState.knowledgeNodeMode === "selected"
      ? studentAiKnowledgeNodeLoadState
      : "idle";

  useEffect(() => {
    let isCancelled = false;

    if (
      !shouldShowAiGenerationDetailControls ||
      activeAuthorizationContext === null ||
      activeKnowledgeScopeState.knowledgeNodeMode !== "selected"
    ) {
      return () => {
        isCancelled = true;
      };
    }

    const knowledgeNodeAuthorizationContext = activeAuthorizationContext;

    async function loadKnowledgeNodeOptions() {
      setStudentAiKnowledgeNodeOptions([]);
      setStudentAiKnowledgeNodeLoadState("loading");

      try {
        const response = await fetchStudentApi<AdminKnowledgeNodeOpsListDto>(
          createStudentAiKnowledgeNodeOptionsPath(
            knowledgeNodeAuthorizationContext,
          ),
          readStudentSessionRequestToken(),
          { method: "GET" },
        );

        if (isCancelled) {
          return;
        }

        if (
          isStudentUnauthorizedResponse(response) ||
          response.code !== 0 ||
          response.data === null
        ) {
          setStudentAiKnowledgeNodeOptions([]);
          setStudentAiKnowledgeNodeLoadState("error");
          return;
        }

        const options = response.data.knowledgeNodes
          .filter((knowledgeNode) =>
            isStudentAiKnowledgeNodeVisibleForAuthorizationContext(
              knowledgeNode,
              knowledgeNodeAuthorizationContext,
            ),
          )
          .map(mapStudentAiKnowledgeNodeOption);

        setStudentAiKnowledgeNodeOptions(options);
        setStudentAiKnowledgeNodeLoadState(
          options.length === 0 ? "empty" : "ready",
        );
      } catch {
        if (!isCancelled) {
          setStudentAiKnowledgeNodeOptions([]);
          setStudentAiKnowledgeNodeLoadState("error");
        }
      }
    }

    void loadKnowledgeNodeOptions();

    return () => {
      isCancelled = true;
    };
  }, [
    activeAuthorizationContext,
    activeKnowledgeScopeState.knowledgeNodeMode,
    shouldShowAiGenerationDetailControls,
  ]);

  const activeKnowledgeScopeBlockedReason =
    getStudentAiKnowledgeScopeBlockedReason(
      activeKnowledgeScopeState,
      activeKnowledgeNodeOptions,
      activeKnowledgeNodeLoadState,
    );
  const activeAiQuestionDetailControls = createStudentAiQuestionDetailControls({
    onQuestionCountChange: handleChangeAiQuestionCount,
    questionCount: aiQuestionCount,
  });
  const activeAiPaperDetailControls = createStudentAiPaperDetailControls({
    difficulty: aiPaperDifficulty,
    learningObjective: aiPaperLearningObjective,
    onDifficultyChange: setAiPaperDifficulty,
    onLearningObjectiveChange: setAiPaperLearningObjective,
    onPaperStructureChange: handleChangeAiPaperStructure,
    onQuestionCountChange: handleChangeAiPaperQuestionCount,
    onQuestionTypeDistributionChange:
      handleChangeAiPaperQuestionTypeDistribution,
    paperStructure: aiPaperStructure,
    questionCount: aiPaperQuestionCount,
    questionTypeDistribution: aiPaperQuestionTypeDistribution,
  });
  const activeSubmitButtonLabel =
    activeTaskType === "ai_question_generation"
      ? copy.questionSubmitButton
      : activeAuthorizationContext?.ownerType === "organization"
        ? copy.employeePaperSubmitButton
        : copy.paperSubmitButton;
  const isActiveKnowledgeScopeBlocked =
    activeKnowledgeScopeBlockedReason !== null;
  const isAiGenerationActionDisabled =
    isAiGenerationBaseActionDisabled || isActiveKnowledgeScopeBlocked;
  const isRetryGenerationDisabled =
    isAiGenerationActionDisabled ||
    !hasLocalAiGenerationExperience ||
    !canRetryCurrentGeneratedPractice(experience);

  async function ensureAiLearningSessionStarted(): Promise<
    PersonalAiGenerationLearningSessionQuestionDto[] | null
  > {
    const visibleGeneratedContent =
      experience?.runtimeBridge.visibleGeneratedContent ?? null;
    const paperAssemblyContainer =
      experience === null
        ? null
        : getStudentAiPaperAssemblyContainer(experience);

    if (
      !canUseGeneratedPractice ||
      (aiLearningSessionQuestions.length === 0 &&
        paperAssemblyContainer === null) ||
      currentAiLearningSessionPublicId === null ||
      selectedAuthorizationPublicId === null ||
      experience === null ||
      experience.resultState.resultPublicId === null ||
      visibleGeneratedContent === null
    ) {
      return null;
    }

    if (
      isAiLearningSessionStarted &&
      activeAiLearningSessionPublicId === currentAiLearningSessionPublicId
    ) {
      return activeAiLearningSessionQuestions.length > 0
        ? activeAiLearningSessionQuestions
        : null;
    }

    const taskType = experience.requestFlow.resultReference.taskType;

    return startOrResumeAiLearningSession(
      taskType === "ai_paper_generation"
        ? { sourceResultPublicId: experience.resultState.resultPublicId }
        : {
            sessionPublicId: currentAiLearningSessionPublicId,
            sourceResultPublicId: experience.resultState.resultPublicId,
            sourceTaskPublicId: experience.resultState.taskPublicId,
            ...(aiLearningSessionOwnerScope ?? {}),
            visibleGeneratedContent,
          },
      experience.resultState.resultPublicId,
    );
  }

  async function startOrResumeAiLearningSession(
    requestBody: PersonalAiLearningSessionRequestBody,
    resultPublicId: string,
  ): Promise<PersonalAiGenerationLearningSessionQuestionDto[] | null> {
    if (selectedAuthorizationPublicId === null) {
      return null;
    }

    setLearningSessionResultPublicId(resultPublicId);

    try {
      const sessionResponse = await fetchCreatePersonalAiLearningSession(
        readStudentSessionRequestToken(),
        {
          ...requestBody,
          authorizationPublicId: selectedAuthorizationPublicId,
        },
      );

      if (
        sessionResponse.code !== 0 ||
        sessionResponse.data === null ||
        sessionResponse.data.status !== "created" ||
        sessionResponse.data.session.questions.length === 0
      ) {
        setServerAiLearningSessionQuestions([]);
        setActiveAiLearningSessionPublicId(null);
        setIsAiLearningSessionStarted(false);
        setPracticeFeedbackState("insufficient");
        return null;
      }

      const session = sessionResponse.data.session;
      const sessionQuestions = session.questions;
      setServerAiLearningSessionQuestions(sessionQuestions);
      setActiveAiLearningSessionPublicId(session.sessionPublicId);
      setIsAiLearningSessionStarted(true);
      setSelectedAiLearningAnswerLabelsByQuestion({});
      setAiLearningAnswerFeedbackByQuestion({});
      setPracticeFeedbackState("practice_ready");

      try {
        const progressResponse = await fetchPersonalAiLearningSessionProgress(
          readStudentSessionRequestToken(),
          session.sessionPublicId,
          selectedAuthorizationPublicId,
        );

        if (
          progressResponse.code === 0 &&
          progressResponse.data?.status === "ready"
        ) {
          const answerFeedbacks =
            progressResponse.data.progress.answerFeedbacks;
          setSelectedAiLearningAnswerLabelsByQuestion(
            Object.fromEntries(
              answerFeedbacks.map((answerFeedback) => [
                answerFeedback.sessionQuestionPublicId,
                answerFeedback.selectedOptionLabels,
              ]),
            ),
          );
          setAiLearningAnswerFeedbackByQuestion(
            Object.fromEntries(
              answerFeedbacks.map((answerFeedback) => [
                answerFeedback.sessionQuestionPublicId,
                mapLearningAnswerFeedbackToStudentFeedback(answerFeedback),
              ]),
            ),
          );
          setPracticeFeedbackState(
            answerFeedbacks.length === 0 ? "practice_ready" : "feedback_ready",
          );
        }
      } catch {
        setPracticeFeedbackState("practice_ready");
      }

      return sessionQuestions;
    } catch {
      setServerAiLearningSessionQuestions([]);
      setActiveAiLearningSessionPublicId(null);
      setIsAiLearningSessionStarted(false);
      setPracticeFeedbackState("insufficient");
      return null;
    } finally {
      setLearningSessionResultPublicId(null);
    }
  }

  async function handleStartOrResumeHistoricalAiPaper(resultPublicId: string) {
    await startOrResumeAiLearningSession(
      { sourceResultPublicId: resultPublicId },
      resultPublicId,
    );
  }

  async function handleStartAiLearningSession() {
    await ensureAiLearningSessionStarted();
  }

  async function handleSubmitAiLearningAnswer() {
    const sessionQuestions =
      activeAiLearningSessionQuestions.length > 0
        ? activeAiLearningSessionQuestions
        : await ensureAiLearningSessionStarted();

    if (
      sessionQuestions === null ||
      activeAiLearningSessionPublicId === null ||
      selectedAuthorizationPublicId === null
    ) {
      return;
    }

    try {
      const answerResponses = await Promise.all(
        sessionQuestions.map((question) =>
          fetchSubmitPersonalAiLearningAnswer(
            readStudentSessionRequestToken(),
            activeAiLearningSessionPublicId,
            selectedAuthorizationPublicId,
            {
              sessionQuestionPublicId: question.sessionQuestionPublicId,
              selectedOptionLabels:
                selectedAiLearningAnswerLabelsByQuestion[
                  question.sessionQuestionPublicId
                ] ?? [],
              textAnswer: null,
            },
          ),
        ),
      );
      const answerFeedbackByQuestion =
        answerResponses.reduce<StudentAiLearningAnswerFeedbackByQuestion>(
          (feedbackByQuestion, answerResponse) => {
            if (
              answerResponse.code !== 0 ||
              answerResponse.data === null ||
              answerResponse.data.status === "blocked"
            ) {
              return feedbackByQuestion;
            }

            return {
              ...feedbackByQuestion,
              [answerResponse.data.sessionQuestionPublicId]:
                mapLearningAnswerFeedbackToStudentFeedback(answerResponse.data),
            };
          },
          {},
        );

      if (
        Object.keys(answerFeedbackByQuestion).length !== sessionQuestions.length
      ) {
        setPracticeFeedbackState("insufficient");
        return;
      }

      setAiLearningAnswerFeedbackByQuestion(answerFeedbackByQuestion);
      setPracticeFeedbackState("answer_submitted");
    } catch {
      setPracticeFeedbackState("insufficient");
    }
  }

  async function handleViewAiLearningFeedback() {
    if (
      activeAiLearningSessionQuestions.length === 0 &&
      (await ensureAiLearningSessionStarted()) === null
    ) {
      return;
    }

    if (
      activeAiLearningSessionPublicId === null ||
      selectedAuthorizationPublicId === null
    ) {
      return;
    }

    try {
      const progressResponse = await fetchPersonalAiLearningSessionProgress(
        readStudentSessionRequestToken(),
        activeAiLearningSessionPublicId,
        selectedAuthorizationPublicId,
      );

      if (
        progressResponse.code !== 0 ||
        progressResponse.data === null ||
        progressResponse.data.status !== "ready"
      ) {
        setPracticeFeedbackState("insufficient");
        return;
      }

      setAiLearningAnswerFeedbackByQuestion(
        Object.fromEntries(
          progressResponse.data.progress.answerFeedbacks.map(
            (answerFeedback) => [
              answerFeedback.sessionQuestionPublicId,
              mapLearningAnswerFeedbackToStudentFeedback(answerFeedback),
            ],
          ),
        ),
      );
      setPracticeFeedbackState(
        progressResponse.data.progress.answerFeedbacks.length === 0
          ? "practice_ready"
          : "feedback_ready",
      );
    } catch {
      setPracticeFeedbackState("insufficient");
    }
  }

  function renderResultHistoryZone() {
    return (
      <section
        data-testid="student-ai-zone-result-history"
        className="flex flex-col gap-5"
      >
        {hasLocalAiGenerationExperience && experience !== null ? (
          <StudentPersonalAiGenerationVisibleGeneratedContent
            visibleGeneratedContent={
              experience.runtimeBridge.visibleGeneratedContent
            }
          />
        ) : null}
        {hasLocalAiGenerationExperience &&
        experience !== null &&
        isStudentAiPaperGenerationExperience(experience) ? (
          <StudentAiPaperAssemblySummary
            paperAssembly={experience.runtimeBridge.paperAssembly}
          />
        ) : null}

        <StudentPersonalAiGenerationPracticeFeedbackActions
          canUseGeneratedPractice={canUseGeneratedPractice}
          hasActiveLearningSession={
            isAiLearningSessionStarted &&
            activeAiLearningSessionQuestions.length > 0
          }
          isRetryDisabled={isRetryGenerationDisabled}
          practiceFeedbackState={practiceFeedbackStateForCurrentResult}
          onStartPractice={() => void handleStartAiLearningSession()}
          onSubmitAnswer={() => void handleSubmitAiLearningAnswer()}
          onViewFeedback={() => void handleViewAiLearningFeedback()}
          onRetryGeneration={handleRetryPersonalAiGenerationRequest}
        />

        {isAiLearningSessionStarted &&
        activeAiLearningSessionQuestions.length > 0 ? (
          <StudentAiLearningSessionPanel
            answerFeedbackByQuestion={aiLearningAnswerFeedbackByQuestion}
            onSelectOptionLabel={(question, optionLabel) => {
              setSelectedAiLearningAnswerLabelsByQuestion(
                (currentSelectedLabels) => {
                  const currentQuestionLabels =
                    currentSelectedLabels[question.sessionQuestionPublicId] ??
                    [];
                  const nextQuestionLabels =
                    question.questionType === "multi_choice"
                      ? currentQuestionLabels.includes(optionLabel)
                        ? currentQuestionLabels.filter(
                            (currentLabel) => currentLabel !== optionLabel,
                          )
                        : [...currentQuestionLabels, optionLabel]
                      : [optionLabel];

                  return {
                    ...currentSelectedLabels,
                    [question.sessionQuestionPublicId]: nextQuestionLabels,
                  };
                },
              );
              setAiLearningAnswerFeedbackByQuestion({});
            }}
            questions={activeAiLearningSessionQuestions}
            selectedOptionLabelsByQuestion={
              selectedAiLearningAnswerLabelsByQuestion
            }
          />
        ) : null}

        {pageState === "loading" ? (
          <section
            className="border-border bg-surface rounded-xl border p-4"
            aria-busy="true"
          >
            <div className="flex items-center gap-3">
              <Loader2
                className="text-brand-primary size-5 animate-spin"
                aria-hidden="true"
              />
              <p className="text-text-primary text-sm font-medium">
                {copy.loadingTitle}
              </p>
            </div>
          </section>
        ) : null}

        {pageState === "empty" ? (
          <StudentPersonalAiGenerationStateMessage
            title={copy.emptyTitle}
            description={copy.emptyDescription}
          />
        ) : null}

        {pageState === "error" ? (
          <StudentPersonalAiGenerationStateMessage
            title={copy.errorTitle}
            description={copy.errorDescription}
            tone="warning"
          />
        ) : null}

        {hasLocalAiGenerationExperience && experience !== null ? (
          <StudentPersonalAiGenerationContractSummary experience={experience} />
        ) : null}

        <StudentPersonalAiGenerationHistorySummary
          historyState={historyState}
          historyRows={requestHistory}
          onChangePage={(page) => void handleChangeRequestHistoryPage(page)}
          onCancelTask={(taskPublicId) =>
            void handleCancelRequestTask(taskPublicId)
          }
          pagination={requestHistoryPagination}
          taskType={activeTaskType}
        />

        <StudentPersonalAiGenerationResultHistorySummary
          historyTaskType={activeTaskType}
          learningSessionResultPublicId={learningSessionResultPublicId}
          onChangePage={(page) => void handleChangeResultHistoryPage(page)}
          pagination={resultHistoryPagination}
          resultHistoryState={resultHistoryState}
          resultHistory={resultHistory}
          isResultDetailLoading={resultDetailState === "loading"}
          onStartOrResumeLearningSession={(resultPublicId) =>
            void handleStartOrResumeHistoricalAiPaper(resultPublicId)
          }
          onOpenResultDetail={(resultPublicId) =>
            void handleOpenPersonalAiGenerationResultDetail(resultPublicId)
          }
          selectedResultPublicId={selectedResultPublicId}
        />

        <StudentPersonalAiGenerationResultDetailSummary
          resultDetailState={resultDetailState}
          resultDetail={resultDetail}
        />
      </section>
    );
  }

  return (
    <section className="mx-auto flex w-full max-w-3xl flex-col gap-5 px-4 py-5 pb-20 lg:max-w-5xl">
      <section data-testid="student-ai-zone-context" className="space-y-5">
        <div className="space-y-2">
          <p className="text-brand-primary text-sm font-medium">
            {isOrganizationEmployeeAiTraining
              ? "企业员工 AI 训练"
              : "个人 AI 训练"}
          </p>
          <h1 className="font-heading text-text-primary text-2xl font-semibold">
            {copy.title}
          </h1>
          <p className="text-text-secondary text-sm leading-6">
            {copy.subtitle}
          </p>
        </div>

        {shouldShowAiGenerationDetailControls &&
        generationAvailabilityState === "closed" ? (
          <section
            aria-live="polite"
            className="border-border bg-muted text-text-primary rounded-lg border px-4 py-3"
            data-testid="student-ai-generation-availability"
            role="status"
          >
            <h2 className="text-sm font-semibold">AI 生成服务当前未开放</h2>
            <p className="text-text-secondary mt-1 text-sm leading-6">
              当前无法发起新的生成任务，已有训练记录仍可查看。
            </p>
          </section>
        ) : shouldShowAiGenerationDetailControls &&
          generationAvailabilityState === "error" ? (
          <section
            aria-live="polite"
            className="border-border bg-muted text-text-primary rounded-lg border px-4 py-3"
            data-testid="student-ai-generation-availability"
            role="status"
          >
            <h2 className="text-sm font-semibold">AI 生成服务状态暂不可用</h2>
            <p className="text-text-secondary mt-1 text-sm leading-6">
              暂不能确认生成能力，请稍后刷新；当前不会提交生成任务。
            </p>
          </section>
        ) : null}

        {shouldShowAuthorizationContextSelector ? (
          <StudentPersonalAiGenerationAuthorizationContextSelector
            authorizationContexts={authorizationContexts}
            disabled={isAiGenerationNavigationDisabled}
            onSelectAuthorizationContext={handleSelectAuthorizationContext}
            selectedAuthorizationPublicId={selectedAuthorizationPublicId}
          />
        ) : null}
      </section>

      {shouldShowAiGenerationDetailControls ? (
        <>
          <section data-testid="student-ai-zone-mode">
            <StudentAiTrainingModeTabs
              activeTaskType={activeTaskType}
              disabled={isAiGenerationNavigationDisabled}
              onSelectTaskType={handleSelectAiTrainingTaskType}
            />
          </section>

          <details
            className="border-border bg-surface rounded-xl border"
            data-testid="student-ai-generation-settings"
            open={generationAvailabilityState === "available"}
          >
            <summary className="text-text-primary hover:bg-muted flex cursor-pointer items-center justify-between gap-3 rounded-xl px-4 py-3 text-sm font-semibold">
              <span>生成设置</span>
              <span className="text-text-secondary text-xs font-normal">
                {generationAvailabilityState === "available"
                  ? "可调整本次生成条件"
                  : "当前仅可查看"}
              </span>
            </summary>
            <div className="border-border grid grid-cols-1 gap-3 border-t p-4">
              <section
                data-testid="student-ai-zone-parameters"
                className="grid grid-cols-1 gap-3"
              >
                {activeTaskType === "ai_question_generation" ? (
                  <>
                    <StudentAiKnowledgeScopePanel
                      disabled={isAiGenerationBaseActionDisabled}
                      knowledgeNodeLoadState={activeKnowledgeNodeLoadState}
                      knowledgeNodeOptions={activeKnowledgeNodeOptions}
                      knowledgeScopeState={aiQuestionKnowledgeScope}
                      onKnowledgeScopeChange={setAiQuestionKnowledgeScope}
                      titlePrefix="AI出题"
                    />
                    <StudentPersonalAiGenerationDetailControlGroup
                      title="AI出题参数"
                      description="用于个人或企业授权上下文下的自练出题，不写入正式题目。"
                      controls={activeAiQuestionDetailControls}
                      disabled={isAiGenerationActionDisabled}
                    />
                  </>
                ) : (
                  <>
                    <StudentAiPaperSourceSummary
                      authorizationContext={activeAuthorizationContext}
                      disabled={isAiGenerationBaseActionDisabled}
                      onSourcePreferenceChange={setAiPaperSourcePreference}
                      sourcePreference={aiPaperSourcePreference}
                    />
                    <StudentAiKnowledgeScopePanel
                      disabled={isAiGenerationBaseActionDisabled}
                      knowledgeNodeLoadState={activeKnowledgeNodeLoadState}
                      knowledgeNodeOptions={activeKnowledgeNodeOptions}
                      knowledgeScopeState={aiPaperKnowledgeScope}
                      onKnowledgeScopeChange={setAiPaperKnowledgeScope}
                      titlePrefix="AI组卷"
                    />
                    <StudentPersonalAiGenerationDetailControlGroup
                      title="AI组卷参数"
                      description="用于个人或企业授权上下文下的自测组卷，从正式题库选题，不写入正式试卷。"
                      controls={activeAiPaperDetailControls}
                      disabled={isAiGenerationActionDisabled}
                    />
                  </>
                )}
                <button
                  aria-describedby={
                    generationAvailabilityState === "available"
                      ? undefined
                      : "student-ai-generation-disabled-reason"
                  }
                  type="button"
                  disabled={isAiGenerationActionDisabled}
                  onClick={() =>
                    void handleSubmitPersonalAiGenerationRequest(activeTaskType)
                  }
                  className="bg-primary text-primary-foreground flex h-11 items-center justify-center gap-2 rounded-lg px-4 text-sm font-medium transition-transform active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {pageState === "loading" ? (
                    <Loader2
                      className="size-4 animate-spin"
                      aria-hidden="true"
                    />
                  ) : activeTaskType === "ai_question_generation" ? (
                    <Sparkles className="size-4" aria-hidden="true" />
                  ) : (
                    <ClipboardList className="size-4" aria-hidden="true" />
                  )}
                  {activeSubmitButtonLabel}
                </button>
                {generationAvailabilityState !== "available" ? (
                  <p
                    className="text-text-secondary text-sm leading-6"
                    id="student-ai-generation-disabled-reason"
                  >
                    {generationAvailabilityState === "closed"
                      ? "当前无法生成：AI 生成服务暂未开放。"
                      : "当前无法生成：暂不能确认 AI 生成服务状态，请稍后刷新。"}
                  </p>
                ) : null}
              </section>

              <StudentAiGenerationBoundarySummary
                authorizationContext={activeAuthorizationContext}
              />
            </div>
          </details>

          {renderResultHistoryZone()}
        </>
      ) : null}

      {pageState === "checking" ? (
        <StudentPersonalAiGenerationStateMessage
          title={copy.checkingTitle}
          description={copy.unauthorizedDescription}
        />
      ) : null}

      {pageState === "unauthorized" ? (
        <StudentPersonalAiGenerationStateMessage
          title={copy.unauthorizedTitle}
          description={copy.unauthorizedDescription}
          tone="warning"
        />
      ) : null}

      {pageState === "unavailable" ? (
        <StudentPersonalAiGenerationStateMessage
          title={copy.unavailableTitle}
          description={copy.unavailableDescription}
          tone="warning"
        />
      ) : null}

      {!shouldShowAiGenerationDetailControls && pageState === "error" ? (
        <StudentPersonalAiGenerationStateMessage
          title={copy.errorTitle}
          description={copy.errorDescription}
          tone="warning"
        />
      ) : null}
    </section>
  );
}
