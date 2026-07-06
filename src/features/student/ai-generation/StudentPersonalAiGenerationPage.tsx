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
import { useEffect, useState } from "react";

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
import type { AiGenerationRouteIntegratedGenerationParameters } from "@/server/contracts/route-integrated-provider-execution-contract";
import type { PersonalAiGenerationFuncType } from "@/server/models/personal-ai-generation-request";
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
  aiFuncType: PersonalAiGenerationFuncType;
  questionPublicId: string;
  answerRecordPublicId: string | null;
  paperPublicId: string | null;
  mockExamPublicId: string | null;
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
  placeholder?: string;
  options?: string[];
};

const PERSONAL_AI_GENERATION_RESULT_DETAIL_NOT_FOUND_CODE = 404045;
const PERSONAL_AI_GENERATION_HISTORY_PAGE = 1;
const PERSONAL_AI_GENERATION_HISTORY_PAGE_SIZE = 10;
const DEFAULT_STUDENT_AI_GENERATION_HISTORY_TASK_TYPE =
  "ai_question_generation" satisfies StudentPersonalAiGenerationTaskType;

const copy = {
  title: "AI训练",
  subtitle:
    "面向高级授权学员的 AI出题 和 AI组卷入口；资料充足时可生成本次训练草稿。",
  emptyTitle: "\u5c1a\u672a\u63d0\u4ea4\u751f\u6210\u8bf7\u6c42",
  emptyDescription:
    "\u70b9\u51fb\u6309\u94ae\u540e\uff0c\u9875\u9762\u4f1a\u6309\u5f53\u524d\u6388\u6743\u8303\u56f4\u5c1d\u8bd5\u751f\u6210\u8bad\u7ec3\u8349\u7a3f\u3002",
  requestButton: "AI出题：生成练习题",
  paperButton: "AI组卷：生成自测试卷",
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
  historyTitle: "\u8fd1\u671f AI \u8bf7\u6c42\u5386\u53f2",
  historyEmptyTitle: "\u6682\u65e0\u5386\u53f2\u8bf7\u6c42",
  historyLoadingTitle: "\u5386\u53f2\u8bf7\u6c42\u540c\u6b65\u4e2d",
  historyErrorTitle: "\u5386\u53f2\u8bf7\u6c42\u6682\u4e0d\u53ef\u7528",
  historyUnauthorizedTitle:
    "\u767b\u5f55\u540e\u67e5\u770b\u8bf7\u6c42\u5386\u53f2",
  resultHistoryTitle: "\u8fd1\u671f AI \u7ed3\u679c\u5386\u53f2",
  resultHistoryEmptyTitle: "\u6682\u65e0\u5386\u53f2\u7ed3\u679c",
  resultHistoryLoadingTitle: "\u7ed3\u679c\u5386\u53f2\u540c\u6b65\u4e2d",
  resultHistoryErrorTitle: "\u7ed3\u679c\u5386\u53f2\u6682\u4e0d\u53ef\u7528",
  resultHistoryUnauthorizedTitle:
    "\u767b\u5f55\u540e\u67e5\u770b\u7ed3\u679c\u5386\u53f2",
  resultDetailTitle: "\u7ed3\u679c\u8be6\u60c5",
  resultDetailButton: "\u67e5\u770b\u7ed3\u679c\u8be6\u60c5",
  resultDetailLoadingTitle: "\u7ed3\u679c\u8be6\u60c5\u540c\u6b65\u4e2d",
  resultDetailEmptyTitle:
    "\u7ed3\u679c\u8be6\u60c5\u6682\u65e0\u53ef\u7528\u8349\u7a3f",
  resultDetailErrorTitle: "\u7ed3\u679c\u8be6\u60c5\u6682\u4e0d\u53ef\u7528",
  resultDetailUnauthorizedTitle:
    "\u767b\u5f55\u540e\u67e5\u770b\u7ed3\u679c\u8be6\u60c5",
  practiceFeedbackTitle:
    "\u751f\u6210\u7ec3\u4e60\u4e0e\u5b66\u4e60\u53cd\u9988",
  practiceFeedbackDescription:
    "\u751f\u6210\u4efb\u52a1\u53d7\u7406\u540e\uff0c\u53ef\u4ee5\u8fdb\u5165\u7ec3\u4e60\u3001\u63d0\u4ea4\u4f5c\u7b54\u5e76\u67e5\u770b\u5b66\u4e60\u53cd\u9988\uff1b\u4e0d\u5199\u5165\u6b63\u5f0f\u9898\u76ee\u6216\u8bd5\u5377\u3002",
};

const contractFieldLabelMap: Record<string, string> = {
  citationCount: "依据数量",
  contentPreviewMasked: "草稿摘要",
  evidenceStatus: "资料依据",
  experienceSurface: "体验入口",
  flowStatus: "流程状态",
  formalAdoptionStatus: "正式采用",
  formalAdoptionWriteStatus: "正式采用",
  isFormalAdoptionBlocked: "正式采用",
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
  draft: "草稿",
  false: "可采用",
  local_contract_only: "任务已受理",
  metadata_only: "基础信息",
  none: "资料不足",
  org_auth: "组织授权",
  organization: "组织上下文",
  pending: "处理中",
  personal: "个人上下文",
  personal_auth: "个人授权",
  quota_insufficient: "额度不足",
  ready: "就绪",
  student_local_browser: "AI训练页",
  succeeded: "已完成",
  sufficient: "资料充足",
  true: "需审核后采用",
  unknown: "未知原因",
  weak: "资料较少",
};

const practiceFeedbackStatusLabelMap: Record<
  StudentPersonalAiGenerationPracticeFeedbackState,
  string
> = {
  waiting: "生成后可进入练习、提交作答并查看学习反馈",
  insufficient: "资料不足时请重试生成",
  practice_ready: "生成练习已就绪",
  answer_submitted: "作答已提交",
  feedback_ready: "学习反馈可查看",
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
    label: "AI出题知识点",
    kind: "text",
    placeholder: "输入或选择当前授权知识点",
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
    label: "AI组卷题型分布",
    kind: "text",
    placeholder: "例：单选、多选、判断按训练目标分配",
  },
  {
    label: "AI组卷知识点覆盖",
    kind: "text",
    placeholder: "输入本次自测覆盖范围",
  },
  {
    label: "AI组卷大题结构",
    kind: "text",
    placeholder: "按大题结构规划题量与顺序",
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

const personalAiGenerationRequestDraft: StudentPersonalAiGenerationRequestDraft =
  {
    userPublicId: "student-public-001",
    requestPublicId: "personal-ai-request-public-001",
    authorizationPublicId: "personal-auth-public-001",
    aiFuncType: "explanation",
    questionPublicId: "question-public-001",
    answerRecordPublicId: "answer-record-public-001",
    paperPublicId: "paper-public-001",
    mockExamPublicId: null,
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

function selectDefaultPersonalAiGenerationAuthorizationContext(
  authorizationContexts: EffectiveAuthorizationContextDto[],
): EffectiveAuthorizationContextDto | null {
  return (
    authorizationContexts.find(
      (authorizationContext) =>
        authorizationContext.authorizationSource === "personal_auth",
    ) ??
    authorizationContexts[0] ??
    null
  );
}

function selectPersonalAiGenerationAuthorizationContext(
  authorizationContexts: EffectiveAuthorizationContextDto[],
  taskType: StudentPersonalAiGenerationTaskType,
  selectedAuthorizationPublicId: string | null,
): EffectiveAuthorizationContextDto | null {
  const selectedAuthorizationContext =
    selectedAuthorizationPublicId === null
      ? selectDefaultPersonalAiGenerationAuthorizationContext(
          authorizationContexts,
        )
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

function createStudentGenerationParameters(
  authorizationContext: EffectiveAuthorizationContextDto,
  taskType: StudentPersonalAiGenerationTaskType,
): AiGenerationRouteIntegratedGenerationParameters {
  return {
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
    knowledgeNode: null,
    questionType:
      taskType === "ai_question_generation" ? "single_choice" : null,
    questionCount: taskType === "ai_question_generation" ? 10 : 50,
    difficulty: "medium",
    learningObjective:
      taskType === "ai_question_generation" ? "弱项巩固" : "阶段自测",
  };
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
    ...createPersonalAiGenerationRequestIdentifiers(),
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
): Promise<{
  code: number;
  message: string;
  data: PersonalAiGenerationResultDetailDto | null;
}> {
  return fetchStudentApi<PersonalAiGenerationResultDetailDto>(
    `/api/v1/personal-ai-generation-results/${encodeURIComponent(
      resultPublicId,
    )}`,
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
    ),
    studentSessionValue,
    {
      method: "GET",
    },
  );
}

async function fetchCreatePersonalAiLearningSession(
  studentSessionValue: StudentSessionRequestToken,
  input: {
    sessionPublicId: string;
    sourceResultPublicId: string;
    sourceTaskPublicId: string;
    ownerType?: "personal" | "organization";
    ownerPublicId?: string;
    visibleGeneratedContent: NonNullable<
      PersonalAiGenerationLocalBrowserExperienceDto["runtimeBridge"]["visibleGeneratedContent"]
    >;
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
    )}/answers`,
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
): Promise<{
  code: number;
  message: string;
  data: PersonalAiGenerationLearningSessionProgressResultDto | null;
}> {
  return fetchStudentApi<PersonalAiGenerationLearningSessionProgressResultDto>(
    `/api/v1/personal-ai-generation-learning-sessions/${encodeURIComponent(
      sessionPublicId,
    )}/progress`,
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
): string {
  const searchParams = new URLSearchParams({
    taskType,
    page: String(page),
    pageSize: String(PERSONAL_AI_GENERATION_HISTORY_PAGE_SIZE),
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
          className={baseControlClass}
          defaultValue={control.options?.[0] ?? ""}
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
          min={1}
          type="number"
          inputMode="numeric"
          placeholder={control.placeholder}
          className={baseControlClass}
        />
      ) : null}
      {control.kind === "text" ? (
        <input
          aria-label={control.label}
          disabled={disabled}
          type="text"
          placeholder={control.placeholder}
          className={baseControlClass}
        />
      ) : null}
      {control.kind === "textarea" ? (
        <textarea
          aria-label={control.label}
          disabled={disabled}
          rows={3}
          placeholder={control.placeholder}
          className={baseControlClass}
        />
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
  )} · ${getEditionLabel(authorizationContext.effectiveEdition)} · ${
    authorizationContext.profession
  } ${authorizationContext.level}级`;
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
    ) ??
    selectDefaultPersonalAiGenerationAuthorizationContext(
      authorizationContexts,
    );

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
          选择本次 AI训练
          使用的授权范围；个人学习默认使用个人授权，组织额度需手动选择。
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
                    到期 {authorizationContext.expiresAt ?? "未设置"}
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

      {selectedAuthorizationContext !== null ? (
        <div className="bg-muted mt-3 rounded-lg px-3 py-3">
          <p className="text-text-primary text-sm font-medium">额度归属确认</p>
          <p className="text-text-secondary mt-1 text-sm leading-6">
            当前将使用
            {getQuotaOwnerLabel(selectedAuthorizationContext.quotaOwnerType)}
            额度，范围为 {selectedAuthorizationContext.profession}{" "}
            {selectedAuthorizationContext.level}级。
          </p>
        </div>
      ) : null}
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
        ? "生成试卷草稿"
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
  testId = "student-ai-question-drafts",
}: {
  questionDrafts: StudentVisibleQuestionDraftSummary[];
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
          <StudentQuestionDraftField
            label="标准答案"
            value={questionDraft.standardAnswer}
          />
          <StudentQuestionDraftField
            label="解析"
            value={questionDraft.analysis}
          />
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
            <StudentQuestionDraftList
              questionDrafts={paperSection.questionDrafts}
              testId="student-ai-paper-question-drafts"
            />
          ) : null}
        </section>
      ))}
    </div>
  );
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
          <dt className="text-text-secondary text-sm">资料依据</dt>
          <dd className="text-text-primary text-sm font-medium">
            {experience.resultState.evidenceStatus === "sufficient"
              ? "资料充足"
              : "资料不足"}
          </dd>
        </div>
        <div className="flex items-center justify-between gap-3">
          <dt className="text-text-secondary text-sm">正式内容</dt>
          <dd className="text-text-primary text-sm font-medium">
            {experience.resultState.isFormalAdoptionBlocked
              ? "需审核后采用"
              : "可采用"}
          </dd>
        </div>
      </dl>
    </section>
  );
}

function StudentPersonalAiGenerationPracticeFeedbackActions({
  canUseGeneratedPractice,
  isRetryDisabled,
  practiceFeedbackState,
  onRetryGeneration,
  onStartPractice,
  onSubmitAnswer,
  onViewFeedback,
}: {
  canUseGeneratedPractice: boolean;
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
          开始练习
        </button>
        <button
          type="button"
          disabled={!canUseGeneratedPractice}
          onClick={onSubmitAnswer}
          className={generatedPracticeActionClassName}
        >
          <Send className="size-4" aria-hidden="true" />
          提交作答
        </button>
        <button
          type="button"
          disabled={!canUseGeneratedPractice}
          onClick={onViewFeedback}
          className={generatedPracticeActionClassName}
        >
          <MessageCircle className="size-4" aria-hidden="true" />
          查看学习反馈
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
    getStudentAiLearningSessionQuestions(
      experience,
      createStudentAiLearningSessionPublicId(resultPublicId),
    ).length > 0
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
  pagination,
  taskType,
}: {
  historyState: StudentPersonalAiGenerationHistoryState;
  historyRows: PersonalAiGenerationRequestHistoryDto;
  onChangePage: (page: number) => void;
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
              <ContractField label="请求时间" value={historyRow.requestedAt} />
              <ContractField
                label="资料依据"
                value={historyRow.evidenceStatus}
              />
              <ContractField
                label="依据数量"
                value={String(historyRow.citationCount)}
              />
            </dl>
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
  onChangePage,
  pagination,
  resultHistoryState,
  resultHistory,
  isResultDetailLoading,
  onOpenResultDetail,
  selectedResultPublicId,
}: {
  historyTaskType: StudentPersonalAiGenerationTaskType;
  onChangePage: (page: number) => void;
  pagination: ApiPagination | null;
  resultHistoryState: StudentPersonalAiGenerationHistoryState;
  resultHistory: PersonalAiGenerationResultHistoryDto | null;
  isResultDetailLoading: boolean;
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
              <ContractField label="生成时间" value={resultRow.persistedAt} />
              <ContractField
                label="草稿摘要"
                value={resultRow.contentReference.contentPreviewMasked}
              />
              <ContractField
                label="资料依据"
                value={resultRow.evidenceReference.evidenceStatus}
              />
              <ContractField
                label="依据数量"
                value={String(resultRow.evidenceReference.citationCount)}
              />
              <ContractField
                label="正式采用"
                value={resultRow.formalAdoption.status}
              />
            </dl>
            <div className="border-border flex justify-end border-t py-3">
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
      <dl className="border-border rounded-lg border px-3">
        <ContractField label="任务类型" value={resultDetail.result.taskType} />
        <ContractField label="状态" value={resultDetail.result.status} />
        <ContractField
          label="生成时间"
          value={resultDetail.result.persistedAt}
        />
        <ContractField
          label="草稿摘要"
          value={resultDetail.result.contentReference.contentPreviewMasked}
        />
        <ContractField
          label="资料依据"
          value={resultDetail.result.evidenceReference.evidenceStatus}
        />
        <ContractField
          label="依据数量"
          value={String(resultDetail.result.evidenceReference.citationCount)}
        />
        <ContractField
          label="正式采用"
          value={resultDetail.result.formalAdoption.status}
        />
        <ContractField
          label="采用限制"
          value={String(resultDetail.result.formalAdoption.isBlocked)}
        />
      </dl>
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
  const [historyTaskType, setHistoryTaskType] =
    useState<StudentPersonalAiGenerationTaskType>("ai_question_generation");
  const [practiceFeedbackState, setPracticeFeedbackState] =
    useState<StudentPersonalAiGenerationPracticeFeedbackState>("waiting");
  const [isAiLearningSessionStarted, setIsAiLearningSessionStarted] =
    useState(false);
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
  const [selectedAuthorizationPublicId, setSelectedAuthorizationPublicId] =
    useState<string | null>(null);

  useEffect(() => {
    const sessionRequestToken = readStudentSessionRequestToken();
    let isCancelled = false;

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

    async function confirmPersonalAiGenerationAuthorization(): Promise<boolean> {
      const fetchedAuthorizationContexts =
        await fetchPersonalAiGenerationAuthorizationContexts(
          sessionRequestToken,
        );

      if (isCancelled) {
        return false;
      }

      const selectableAuthorizationContexts =
        readPersonalAiGenerationAuthorizationContexts(
          fetchedAuthorizationContexts,
        );

      if (selectableAuthorizationContexts.length === 0) {
        markUnavailable();
        return false;
      }

      setAuthorizationContexts(selectableAuthorizationContexts);
      setSelectedAuthorizationPublicId((currentAuthorizationPublicId) => {
        if (
          currentAuthorizationPublicId !== null &&
          selectableAuthorizationContexts.some(
            (authorizationContext) =>
              authorizationContext.authorizationPublicId ===
              currentAuthorizationPublicId,
          )
        ) {
          return currentAuthorizationPublicId;
        }

        return (
          selectDefaultPersonalAiGenerationAuthorizationContext(
            selectableAuthorizationContexts,
          )?.authorizationPublicId ?? null
        );
      });

      return true;
    }

    async function fetchInitialRequestHistory() {
      try {
        const historyResponse =
          await fetchPersonalAiGenerationRequestHistoryForSession(
            sessionRequestToken,
            DEFAULT_STUDENT_AI_GENERATION_HISTORY_TASK_TYPE,
            PERSONAL_AI_GENERATION_HISTORY_PAGE,
          );

        if (isCancelled) {
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
        if (!isCancelled) {
          setHistoryState("error");
          setRequestHistory([]);
          setRequestHistoryPagination(null);
        }
      }
    }

    async function fetchInitialResultHistory() {
      try {
        const historyResponse = await fetchPersonalAiGenerationResultHistory(
          sessionRequestToken,
          DEFAULT_STUDENT_AI_GENERATION_HISTORY_TASK_TYPE,
          PERSONAL_AI_GENERATION_HISTORY_PAGE,
        );

        if (isCancelled) {
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
        if (!isCancelled) {
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

      const hasAiAuthorization =
        await confirmPersonalAiGenerationAuthorization();

      if (!hasAiAuthorization || isCancelled) {
        return;
      }

      void fetchInitialRequestHistory();
      void fetchInitialResultHistory();
    }

    void loadInitialData();

    return () => {
      isCancelled = true;
    };
  }, []);

  async function handleSubmitPersonalAiGenerationRequest(
    taskType: StudentPersonalAiGenerationTaskType,
  ) {
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
    setHistoryTaskType(taskType);
    setPracticeFeedbackState("waiting");
    setIsAiLearningSessionStarted(false);
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
                createStudentGenerationParameters(
                  generationAuthorizationContext,
                  taskType,
                ),
                generationAuthorizationContext,
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
      setHistoryState("loading");
      setResultHistoryState("loading");
      setResultDetailState("idle");
      setResultDetail(null);
      setSelectedResultPublicId(null);

      try {
        const historyResponse =
          await fetchPersonalAiGenerationRequestHistoryForSession(
            sessionRequestToken,
            taskType,
            PERSONAL_AI_GENERATION_HISTORY_PAGE,
          );

        if (isStudentUnauthorizedResponse(historyResponse)) {
          markUnavailable();
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
        setHistoryState("error");
        setRequestHistory([]);
        setRequestHistoryPagination(null);
      }

      try {
        const resultHistoryResponse =
          await fetchPersonalAiGenerationResultHistory(
            sessionRequestToken,
            taskType,
            PERSONAL_AI_GENERATION_HISTORY_PAGE,
          );

        if (isStudentUnauthorizedResponse(resultHistoryResponse)) {
          markUnavailable();
          return;
        }

        if (isStudentAccessDeniedResponse(resultHistoryResponse)) {
          markUnavailable();
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
        setResultHistoryState("error");
        setResultHistory(null);
        setResultHistoryPagination(null);
      }
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
    const sessionRequestToken = readStudentSessionRequestToken();

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
      );

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
      setResultDetailState("error");
      setResultDetail(null);
    }
  }

  function handleRetryPersonalAiGenerationRequest() {
    void handleSubmitPersonalAiGenerationRequest(lastSubmittedTaskType);
  }

  async function handleChangeRequestHistoryPage(page: number) {
    const sessionRequestToken = readStudentSessionRequestToken();

    setHistoryState("loading");

    try {
      const historyResponse =
        await fetchPersonalAiGenerationRequestHistoryForSession(
          sessionRequestToken,
          historyTaskType,
          page,
        );

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
      setHistoryState("error");
      setRequestHistory([]);
      setRequestHistoryPagination(null);
    }
  }

  async function handleChangeResultHistoryPage(page: number) {
    const sessionRequestToken = readStudentSessionRequestToken();

    setResultHistoryState("loading");
    setResultDetailState("idle");
    setResultDetail(null);
    setSelectedResultPublicId(null);

    try {
      const resultHistoryResponse =
        await fetchPersonalAiGenerationResultHistory(
          sessionRequestToken,
          historyTaskType,
          page,
        );

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
      setResultHistoryState("error");
      setResultHistory(null);
      setResultHistoryPagination(null);
    }
  }

  const isAiGenerationActionDisabled =
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
  const hasLocalAiGenerationExperience =
    pageState === "ready" && experience !== null;
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
  const aiLearningSessionOwnerScope = hasLocalAiGenerationExperience
    ? resolveStudentAiLearningSessionOwnerScope({
        authorizationContexts,
        experience,
        selectedAuthorizationPublicId,
        taskType: historyTaskType,
      })
    : null;
  const canUseGeneratedPractice =
    hasLocalAiGenerationExperience &&
    canUseCurrentGeneratedPractice(experience);
  const isRetryGenerationDisabled =
    isAiGenerationActionDisabled ||
    !hasLocalAiGenerationExperience ||
    !canRetryCurrentGeneratedPractice(experience);
  const practiceFeedbackStateForCurrentResult =
    hasLocalAiGenerationExperience &&
    experience.flowStatus === "accepted" &&
    experience.resultState.status === "succeeded" &&
    !canUseGeneratedPractice
      ? "insufficient"
      : practiceFeedbackState;

  async function ensureAiLearningSessionStarted(): Promise<boolean> {
    const visibleGeneratedContent =
      experience?.runtimeBridge.visibleGeneratedContent ?? null;

    if (
      !canUseGeneratedPractice ||
      aiLearningSessionQuestions.length === 0 ||
      currentAiLearningSessionPublicId === null ||
      experience === null ||
      experience.resultState.resultPublicId === null ||
      visibleGeneratedContent === null
    ) {
      return false;
    }

    if (isAiLearningSessionStarted) {
      return true;
    }

    try {
      const sessionResponse = await fetchCreatePersonalAiLearningSession(
        readStudentSessionRequestToken(),
        {
          sessionPublicId: currentAiLearningSessionPublicId,
          sourceResultPublicId: experience.resultState.resultPublicId,
          sourceTaskPublicId: experience.resultState.taskPublicId,
          ...(aiLearningSessionOwnerScope ?? {}),
          visibleGeneratedContent,
        },
      );

      if (
        sessionResponse.code !== 0 ||
        sessionResponse.data === null ||
        sessionResponse.data.status !== "created"
      ) {
        setPracticeFeedbackState("insufficient");
        return false;
      }

      setIsAiLearningSessionStarted(true);
      setSelectedAiLearningAnswerLabelsByQuestion({});
      setAiLearningAnswerFeedbackByQuestion({});
      setPracticeFeedbackState("practice_ready");

      return true;
    } catch {
      setPracticeFeedbackState("insufficient");
      return false;
    }
  }

  async function handleStartAiLearningSession() {
    await ensureAiLearningSessionStarted();
  }

  async function handleSubmitAiLearningAnswer() {
    if (!(await ensureAiLearningSessionStarted())) {
      return;
    }

    if (currentAiLearningSessionPublicId === null) {
      return;
    }

    try {
      const answerResponses = await Promise.all(
        aiLearningSessionQuestions.map((question) =>
          fetchSubmitPersonalAiLearningAnswer(
            readStudentSessionRequestToken(),
            currentAiLearningSessionPublicId,
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
        Object.keys(answerFeedbackByQuestion).length !==
        aiLearningSessionQuestions.length
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
    if (!(await ensureAiLearningSessionStarted())) {
      return;
    }

    if (currentAiLearningSessionPublicId === null) {
      return;
    }

    try {
      const progressResponse = await fetchPersonalAiLearningSessionProgress(
        readStudentSessionRequestToken(),
        currentAiLearningSessionPublicId,
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

  return (
    <section className="mx-auto flex w-full max-w-3xl flex-col gap-5 px-4 py-5 pb-20">
      <div className="space-y-2">
        <p className="text-brand-primary text-sm font-medium">个人 AI 训练</p>
        <h1 className="font-heading text-text-primary text-2xl font-semibold">
          {copy.title}
        </h1>
        <p className="text-text-secondary text-sm leading-6">{copy.subtitle}</p>
      </div>

      {shouldShowAuthorizationContextSelector ? (
        <StudentPersonalAiGenerationAuthorizationContextSelector
          authorizationContexts={authorizationContexts}
          disabled={isAiGenerationActionDisabled}
          onSelectAuthorizationContext={setSelectedAuthorizationPublicId}
          selectedAuthorizationPublicId={selectedAuthorizationPublicId}
        />
      ) : null}

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        <button
          type="button"
          disabled={isAiGenerationActionDisabled}
          onClick={() =>
            void handleSubmitPersonalAiGenerationRequest(
              "ai_question_generation",
            )
          }
          className="bg-primary text-primary-foreground flex h-10 items-center justify-center gap-2 rounded-lg px-4 text-sm font-medium transition-transform active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {pageState === "checking" || pageState === "loading" ? (
            <Loader2 className="size-4 animate-spin" aria-hidden="true" />
          ) : (
            <Sparkles className="size-4" aria-hidden="true" />
          )}
          {copy.requestButton}
        </button>
        <button
          type="button"
          disabled={isAiGenerationActionDisabled}
          onClick={() =>
            void handleSubmitPersonalAiGenerationRequest("ai_paper_generation")
          }
          className="border-border bg-surface text-text-secondary flex h-10 items-center justify-center gap-2 rounded-lg border px-4 text-sm font-medium transition-transform active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
        >
          <ClipboardList className="size-4" aria-hidden="true" />
          {copy.paperButton}
        </button>
      </div>

      {pageState === "ready" && experience !== null ? (
        <StudentPersonalAiGenerationVisibleGeneratedContent
          visibleGeneratedContent={
            experience.runtimeBridge.visibleGeneratedContent
          }
        />
      ) : null}

      {shouldShowAiGenerationDetailControls ? (
        <div className="grid grid-cols-1 gap-3">
          <StudentPersonalAiGenerationDetailControlGroup
            title="AI出题参数"
            description="用于个人或企业授权上下文下的自练出题，不写入正式题目。"
            controls={aiQuestionDetailControls}
            disabled={isAiGenerationActionDisabled}
          />
          <StudentPersonalAiGenerationDetailControlGroup
            title="AI组卷参数"
            description="用于个人或企业授权上下文下的自测组卷，不写入正式试卷。"
            controls={aiPaperDetailControls}
            disabled={isAiGenerationActionDisabled}
          />
        </div>
      ) : null}

      {shouldShowAiGenerationDetailControls ? (
        <StudentPersonalAiGenerationPracticeFeedbackActions
          canUseGeneratedPractice={canUseGeneratedPractice}
          isRetryDisabled={isRetryGenerationDisabled}
          practiceFeedbackState={practiceFeedbackStateForCurrentResult}
          onStartPractice={() => void handleStartAiLearningSession()}
          onSubmitAnswer={() => void handleSubmitAiLearningAnswer()}
          onViewFeedback={() => void handleViewAiLearningFeedback()}
          onRetryGeneration={handleRetryPersonalAiGenerationRequest}
        />
      ) : null}

      {isAiLearningSessionStarted && aiLearningSessionQuestions.length > 0 ? (
        <StudentAiLearningSessionPanel
          answerFeedbackByQuestion={aiLearningAnswerFeedbackByQuestion}
          onSelectOptionLabel={(question, optionLabel) => {
            setSelectedAiLearningAnswerLabelsByQuestion(
              (currentSelectedLabels) => {
                const currentQuestionLabels =
                  currentSelectedLabels[question.sessionQuestionPublicId] ?? [];
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
          questions={aiLearningSessionQuestions}
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

      {pageState === "checking" ? (
        <StudentPersonalAiGenerationStateMessage
          title={copy.checkingTitle}
          description={copy.unauthorizedDescription}
        />
      ) : null}

      {pageState === "empty" ? (
        <StudentPersonalAiGenerationStateMessage
          title={copy.emptyTitle}
          description={copy.emptyDescription}
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

      {pageState === "error" ? (
        <StudentPersonalAiGenerationStateMessage
          title={copy.errorTitle}
          description={copy.errorDescription}
          tone="warning"
        />
      ) : null}

      {pageState === "ready" && experience !== null ? (
        <StudentPersonalAiGenerationContractSummary experience={experience} />
      ) : null}

      <StudentPersonalAiGenerationHistorySummary
        historyState={historyState}
        historyRows={requestHistory}
        onChangePage={(page) => void handleChangeRequestHistoryPage(page)}
        pagination={requestHistoryPagination}
        taskType={historyTaskType}
      />

      <StudentPersonalAiGenerationResultHistorySummary
        historyTaskType={historyTaskType}
        onChangePage={(page) => void handleChangeResultHistoryPage(page)}
        pagination={resultHistoryPagination}
        resultHistoryState={resultHistoryState}
        resultHistory={resultHistory}
        isResultDetailLoading={resultDetailState === "loading"}
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
