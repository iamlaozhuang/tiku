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
  COOKIE_BACKED_SESSION_MARKER,
  fetchCurrentStudentSession,
  fetchStudentApi,
  getStoredStudentSessionToken,
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
import type { PersonalAiGenerationFuncType } from "@/server/models/personal-ai-generation-request";

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
  | "practice_ready"
  | "answer_submitted"
  | "feedback_ready";

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
const ORGANIZATION_AI_LOCAL_AUTHORIZATION_PUBLIC_ID =
  "org-auth-public-local-contract";

const copy = {
  title: "AI训练",
  subtitle:
    "面向高级授权学员的 AI出题 和 AI组卷入口；本地 owner preview 可展示本次生成内容和脱敏状态。",
  emptyTitle: "\u5c1a\u672a\u63d0\u4ea4\u672c\u5730\u8bf7\u6c42",
  emptyDescription:
    "\u70b9\u51fb\u6309\u94ae\u540e\uff0c\u9875\u9762\u4f1a\u8bf7\u6c42\u672c\u5730\u63a5\u53e3\u5951\u7ea6\u5e76\u5448\u73b0\u8fd4\u56de\u6458\u8981\u3002",
  requestButton: "AI出题：生成练习题",
  paperButton: "AI组卷：生成自测试卷",
  loadingTitle: "\u6b63\u5728\u53d1\u8d77\u672c\u5730\u8bf7\u6c42",
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
  contractTitle: "\u672c\u5730\u5408\u7ea6\u6458\u8981",
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
  resultDetailTitle: "\u8131\u654f\u7ed3\u679c\u8be6\u60c5",
  resultDetailButton: "\u67e5\u770b\u8131\u654f\u8be6\u60c5",
  resultDetailLoadingTitle: "\u7ed3\u679c\u8be6\u60c5\u540c\u6b65\u4e2d",
  resultDetailEmptyTitle:
    "\u7ed3\u679c\u8be6\u60c5\u6682\u65e0\u53ef\u7528\u8131\u654f\u5feb\u7167",
  resultDetailErrorTitle: "\u7ed3\u679c\u8be6\u60c5\u6682\u4e0d\u53ef\u7528",
  resultDetailUnauthorizedTitle:
    "\u767b\u5f55\u540e\u67e5\u770b\u7ed3\u679c\u8be6\u60c5",
  practiceFeedbackTitle:
    "\u751f\u6210\u7ec3\u4e60\u4e0e\u5b66\u4e60\u53cd\u9988",
  practiceFeedbackDescription:
    "\u672c\u5730\u5408\u7ea6\u53d7\u7406\u540e\uff0c\u53ef\u4ee5\u8fdb\u5165\u751f\u6210\u7ec3\u4e60\u3001\u63d0\u4ea4\u4f5c\u7b54\u5e76\u67e5\u770b\u8131\u654f\u5b66\u4e60\u53cd\u9988\uff1b\u4e0d\u5199\u5165\u6b63\u5f0f\u9898\u76ee\u6216\u8bd5\u5377\u3002",
};

const contractFieldLabelMap: Record<string, string> = {
  citationCount: "引用数量",
  contentDigest: "内容摘要哈希",
  contentPreviewMasked: "脱敏预览",
  contentReferenceRedactionStatus: "内容引用脱敏状态",
  contentReferenceVisibility: "内容引用可见性",
  contentVisibility: "内容可见性",
  detailDisplayMode: "详情展示模式",
  evidenceStatus: "证据状态",
  experienceSurface: "体验入口",
  flowStatus: "流程状态",
  formalAdoptionStatus: "正式入库状态",
  formalAdoptionWriteStatus: "正式入库写入状态",
  isFormalAdoptionBlocked: "是否阻断正式入库",
  authorizationSource: "授权来源",
  ownerType: "使用上下文",
  quotaOwnerType: "额度上下文",
  persistedAt: "持久化时间",
  redactionStatus: "脱敏状态",
  referenceRedactionStatus: "引用脱敏状态",
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
  blocked: "已阻断",
  blocked_without_follow_up_task: "待后续任务审批",
  draft: "草稿",
  false: "否",
  local_contract_only: "仅本地合约",
  metadata_only: "仅元数据",
  none: "无证据",
  org_auth: "组织授权",
  organization: "组织上下文",
  pending: "处理中",
  personal: "个人上下文",
  personal_auth: "个人授权",
  quota_insufficient: "额度不足",
  ready: "就绪",
  redacted: "已脱敏",
  redacted_snapshot: "脱敏快照",
  student_local_browser: "学员本地页面",
  succeeded: "已完成",
  sufficient: "证据充分",
  summary_only: "仅摘要",
  true: "是",
  unknown: "未知原因",
  weak: "证据较弱",
};

const practiceFeedbackStatusLabelMap: Record<
  StudentPersonalAiGenerationPracticeFeedbackState,
  string
> = {
  waiting: "生成后可进入练习、提交作答并查看学习反馈",
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

  return getStoredStudentSessionToken() !== null;
}

function readStudentSessionRequestToken(): StudentSessionRequestToken {
  const storedSessionValue = getStoredStudentSessionToken();

  return storedSessionValue === COOKIE_BACKED_SESSION_MARKER
    ? null
    : storedSessionValue;
}

function isStudentAccessDeniedResponse(payload: { code: number }): boolean {
  return payload.code >= 403000 && payload.code < 404000;
}

function readAuthorizationContexts(
  payload: StudentAuthorizationListPayload,
): EffectiveAuthorizationContextDto[] {
  return payload.authorizationContexts ?? [];
}

function canUsePersonalAiGeneration(
  authorizationContexts: EffectiveAuthorizationContextDto[],
): boolean {
  return authorizationContexts.some(
    (authorizationContext) =>
      authorizationContext.effectiveEdition === "advanced" &&
      (authorizationContext.capabilities.canGenerateAiQuestion ||
        authorizationContext.capabilities.canGenerateAiPaper),
  );
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
) {
  const userPublicId = sessionUser.publicId;
  const authorizationContext =
    sessionUser.userType === "employee" &&
    sessionUser.organizationPublicId !== null
      ? {
          authorizationPublicId: ORGANIZATION_AI_LOCAL_AUTHORIZATION_PUBLIC_ID,
          authorizationSource: "org_auth" as const,
          ownerType: "organization" as const,
          ownerPublicId: sessionUser.organizationPublicId,
          organizationPublicId: sessionUser.organizationPublicId,
          quotaOwnerType: "organization" as const,
          quotaOwnerPublicId: sessionUser.organizationPublicId,
        }
      : {
          authorizationPublicId: draft.authorizationPublicId,
          authorizationSource: "personal_auth" as const,
          ownerType: "personal" as const,
          ownerPublicId: userPublicId,
          organizationPublicId: null,
          quotaOwnerType: "personal" as const,
          quotaOwnerPublicId: userPublicId,
        };

  return {
    responseMode: "local_browser_experience",
    ...draft,
    ...createPersonalAiGenerationRequestIdentifiers(),
    ...authorizationContext,
    userPublicId,
    actorPublicId: userPublicId,
  };
}

async function fetchPersonalAiGenerationResultHistory(
  studentSessionValue: StudentSessionRequestToken,
): Promise<{
  code: number;
  message: string;
  data: PersonalAiGenerationResultHistoryDto | null;
}> {
  return fetchStudentApi<PersonalAiGenerationResultHistoryDto>(
    "/api/v1/personal-ai-generation-results",
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
): Promise<{
  code: number;
  message: string;
  data: PersonalAiGenerationRequestHistoryDto | null;
}> {
  return fetchStudentApi<PersonalAiGenerationRequestHistoryDto>(
    "/api/v1/personal-ai-generation-requests",
    studentSessionValue,
    {
      method: "GET",
    },
  );
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

function StudentPersonalAiGenerationVisibleGeneratedContent({
  visibleGeneratedContent,
}: {
  visibleGeneratedContent: PersonalAiGenerationLocalBrowserExperienceDto["runtimeBridge"]["visibleGeneratedContent"];
}) {
  if (visibleGeneratedContent == null) {
    return null;
  }

  return (
    <section
      className="border-border bg-background mb-3 rounded-lg border p-3"
      data-testid="student-visible-generated-content"
    >
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-text-primary text-sm font-semibold">
          本次生成内容
        </h3>
        <span className="bg-muted text-text-secondary rounded-md px-2 py-1 text-xs font-medium">
          临时展示
        </span>
      </div>
      <p className="text-text-primary mt-3 text-sm leading-6 whitespace-pre-wrap">
        {visibleGeneratedContent.content}
      </p>
    </section>
  );
}

function StudentPersonalAiGenerationContractSummary({
  experience,
}: {
  experience: PersonalAiGenerationLocalBrowserExperienceDto;
}) {
  const disabledReason = experience.requestState.action.disabledReason;
  const resultReference = experience.requestFlow.resultReference;

  return (
    <section className="border-border bg-surface rounded-xl border p-4">
      <div className="mb-2 flex items-center justify-between gap-3">
        <h2 className="font-heading text-text-primary text-base font-semibold">
          {copy.contractTitle}
        </h2>
        <span className="bg-secondary text-secondary-foreground rounded-lg px-2 py-1 text-xs font-medium">
          {contractValueLabelMap[experience.redactionStatus] ??
            experience.redactionStatus}
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

      <StudentPersonalAiGenerationVisibleGeneratedContent
        visibleGeneratedContent={
          experience.runtimeBridge.visibleGeneratedContent
        }
      />

      <dl>
        <ContractField label="runtimeStatus" value={experience.runtimeStatus} />
        <ContractField
          label="experienceSurface"
          value={experience.experienceSurface}
        />
        <ContractField label="flowStatus" value={experience.flowStatus} />
        <ContractField
          label="authorizationSource"
          value={
            experience.requestFlow.contextSelection.authorizationBoundary
              .authorizationSource
          }
        />
        <ContractField
          label="ownerType"
          value={
            experience.requestFlow.contextSelection.authorizationBoundary
              .ownerType
          }
        />
        <ContractField
          label="quotaOwnerType"
          value={
            experience.requestFlow.contextSelection.authorizationBoundary
              .quotaOwnerType
          }
        />
        <ContractField
          label="resultStatus"
          value={experience.resultState.status}
        />
        <ContractField
          label="contentVisibility"
          value={experience.resultState.contentVisibility}
        />
        <ContractField
          label="isFormalAdoptionBlocked"
          value={String(experience.resultState.isFormalAdoptionBlocked)}
        />
        <ContractField
          label="evidenceStatus"
          value={resultReference.resultReference.evidenceStatus}
        />
        <ContractField
          label="citationCount"
          value={String(resultReference.resultReference.citationCount)}
        />
        <ContractField
          label="referenceRedactionStatus"
          value={resultReference.resultReference.redactionStatus}
        />
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

function StudentPersonalAiGenerationHistorySummary({
  historyState,
  historyRows,
}: {
  historyState: StudentPersonalAiGenerationHistoryState;
  historyRows: PersonalAiGenerationRequestHistoryDto;
}) {
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
              <ContractField label="status" value={historyRow.status} />
              <ContractField
                label="requestedAt"
                value={historyRow.requestedAt}
              />
              <ContractField
                label="evidenceStatus"
                value={historyRow.evidenceStatus}
              />
              <ContractField
                label="citationCount"
                value={String(historyRow.citationCount)}
              />
              <ContractField
                label="redactionStatus"
                value={historyRow.redactionStatus}
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
      {renderHistoryBody()}
    </section>
  );
}

function StudentPersonalAiGenerationResultHistorySummary({
  resultHistoryState,
  resultHistory,
  isResultDetailLoading,
  onOpenResultDetail,
  selectedResultPublicId,
}: {
  resultHistoryState: StudentPersonalAiGenerationHistoryState;
  resultHistory: PersonalAiGenerationResultHistoryDto | null;
  isResultDetailLoading: boolean;
  onOpenResultDetail: (resultPublicId: string) => void;
  selectedResultPublicId: string | null;
}) {
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
        <dl className="border-border rounded-lg border px-3">
          <ContractField
            label="runtimeStatus"
            value={resultHistory.runtimeStatus}
          />
          <ContractField
            label="contentVisibility"
            value={resultHistory.contentVisibility}
          />
          <ContractField
            label="redactionStatus"
            value={resultHistory.redactionStatus}
          />
          <ContractField
            label="formalAdoptionWriteStatus"
            value={resultHistory.formalAdoptionWriteStatus}
          />
        </dl>

        {resultHistory.results.map((resultRow) => (
          <article
            key={resultRow.resultPublicId}
            className="border-border rounded-lg border px-3"
          >
            <dl>
              <ContractField label="taskType" value={resultRow.taskType} />
              <ContractField label="status" value={resultRow.status} />
              <ContractField
                label="persistedAt"
                value={resultRow.persistedAt}
              />
              <ContractField
                label="contentDigest"
                value={resultRow.contentReference.contentDigest}
              />
              <ContractField
                label="contentPreviewMasked"
                value={resultRow.contentReference.contentPreviewMasked}
              />
              <ContractField
                label="evidenceStatus"
                value={resultRow.evidenceReference.evidenceStatus}
              />
              <ContractField
                label="citationCount"
                value={String(resultRow.evidenceReference.citationCount)}
              />
              <ContractField
                label="formalAdoptionStatus"
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
        <ContractField
          label="runtimeStatus"
          value={resultDetail.runtimeStatus}
        />
        <ContractField label="detailDisplayMode" value="metadata_only" />
        <ContractField
          label="contentVisibility"
          value={resultDetail.contentVisibility}
        />
        <ContractField
          label="redactionStatus"
          value={resultDetail.redactionStatus}
        />
        <ContractField
          label="formalAdoptionWriteStatus"
          value={resultDetail.formalAdoptionWriteStatus}
        />
        <ContractField label="taskType" value={resultDetail.result.taskType} />
        <ContractField label="status" value={resultDetail.result.status} />
        <ContractField
          label="persistedAt"
          value={resultDetail.result.persistedAt}
        />
        <ContractField
          label="contentDigest"
          value={resultDetail.result.contentReference.contentDigest}
        />
        <ContractField
          label="contentPreviewMasked"
          value={resultDetail.result.contentReference.contentPreviewMasked}
        />
        <ContractField
          label="contentReferenceVisibility"
          value={resultDetail.result.contentReference.contentVisibility}
        />
        <ContractField
          label="contentReferenceRedactionStatus"
          value={resultDetail.result.contentReference.redactionStatus}
        />
        <ContractField
          label="evidenceStatus"
          value={resultDetail.result.evidenceReference.evidenceStatus}
        />
        <ContractField
          label="citationCount"
          value={String(resultDetail.result.evidenceReference.citationCount)}
        />
        <ContractField
          label="formalAdoptionStatus"
          value={resultDetail.result.formalAdoption.status}
        />
        <ContractField
          label="isFormalAdoptionBlocked"
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
  const [resultHistoryState, setResultHistoryState] =
    useState<StudentPersonalAiGenerationHistoryState>(
      hasSessionToken ? "loading" : "loading",
    );
  const [resultHistory, setResultHistory] =
    useState<PersonalAiGenerationResultHistoryDto | null>(null);
  const [resultDetailState, setResultDetailState] =
    useState<StudentPersonalAiGenerationResultDetailState>("idle");
  const [resultDetail, setResultDetail] =
    useState<PersonalAiGenerationResultDetailDto | null>(null);
  const [selectedResultPublicId, setSelectedResultPublicId] = useState<
    string | null
  >(null);
  const [lastSubmittedTaskType, setLastSubmittedTaskType] =
    useState<StudentPersonalAiGenerationTaskType>("ai_question_generation");
  const [practiceFeedbackState, setPracticeFeedbackState] =
    useState<StudentPersonalAiGenerationPracticeFeedbackState>("waiting");

  useEffect(() => {
    const sessionRequestToken = readStudentSessionRequestToken();
    let isCancelled = false;

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
        }

        return false;
      }
    }

    async function confirmPersonalAiGenerationAuthorization(): Promise<boolean> {
      const authorizationContexts =
        await fetchPersonalAiGenerationAuthorizationContexts(
          sessionRequestToken,
        );

      if (isCancelled) {
        return false;
      }

      if (!canUsePersonalAiGeneration(authorizationContexts)) {
        markUnavailable();
        return false;
      }

      return true;
    }

    async function fetchInitialRequestHistory() {
      try {
        const historyResponse =
          await fetchPersonalAiGenerationRequestHistoryForSession(
            sessionRequestToken,
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
          return;
        }

        setRequestHistory(historyResponse.data);
        setHistoryState(historyResponse.data.length === 0 ? "empty" : "ready");
      } catch {
        if (!isCancelled) {
          setHistoryState("error");
          setRequestHistory([]);
        }
      }
    }

    async function fetchInitialResultHistory() {
      try {
        const historyResponse =
          await fetchPersonalAiGenerationResultHistory(sessionRequestToken);

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
          return;
        }

        setResultHistory(historyResponse.data);
        setResultHistoryState(
          historyResponse.data.results.length === 0 ? "empty" : "ready",
        );
      } catch {
        if (!isCancelled) {
          setResultHistoryState("error");
          setResultHistory(null);
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

    setLastSubmittedTaskType(taskType);
    setPracticeFeedbackState("waiting");
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
        setResultHistoryState("error");
        setResultHistory(null);
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

      const authorizationContexts =
        await fetchPersonalAiGenerationAuthorizationContexts(
          sessionRequestToken,
        );

      if (!canUsePersonalAiGeneration(authorizationContexts)) {
        markUnavailable();
        return;
      }

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
          return;
        }

        setRequestHistory(historyResponse.data);
        setHistoryState(historyResponse.data.length === 0 ? "empty" : "ready");
      } catch {
        setHistoryState("error");
        setRequestHistory([]);
      }

      try {
        const resultHistoryResponse =
          await fetchPersonalAiGenerationResultHistory(sessionRequestToken);

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
          return;
        }

        setResultHistory(resultHistoryResponse.data);
        setResultHistoryState(
          resultHistoryResponse.data.results.length === 0 ? "empty" : "ready",
        );
      } catch {
        setResultHistoryState("error");
        setResultHistory(null);
      }
    } catch {
      setPageState("error");
      setHistoryState("error");
      setRequestHistory([]);
      setResultHistoryState("error");
      setResultHistory(null);
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
  const hasLocalAiGenerationExperience =
    pageState === "ready" && experience !== null;
  const canUseGeneratedPractice =
    hasLocalAiGenerationExperience && experience.flowStatus === "accepted";
  const isRetryGenerationDisabled =
    isAiGenerationActionDisabled || !hasLocalAiGenerationExperience;

  return (
    <section className="mx-auto flex w-full max-w-3xl flex-col gap-5 px-4 py-5 pb-20">
      <div className="space-y-2">
        <p className="text-brand-primary text-sm font-medium">个人 AI 训练</p>
        <h1 className="font-heading text-text-primary text-2xl font-semibold">
          {copy.title}
        </h1>
        <p className="text-text-secondary text-sm leading-6">{copy.subtitle}</p>
      </div>

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
          practiceFeedbackState={practiceFeedbackState}
          onStartPractice={() => setPracticeFeedbackState("practice_ready")}
          onSubmitAnswer={() => setPracticeFeedbackState("answer_submitted")}
          onViewFeedback={() => setPracticeFeedbackState("feedback_ready")}
          onRetryGeneration={handleRetryPersonalAiGenerationRequest}
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
      />

      <StudentPersonalAiGenerationResultHistorySummary
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
