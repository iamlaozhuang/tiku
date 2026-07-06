"use client";

import { useCallback, useEffect, useState } from "react";
import {
  AlertCircle,
  FileText,
  LoaderCircle,
  ShieldCheck,
  WandSparkles,
} from "lucide-react";

import type { AdminAiGenerationFormalAdoptionResult } from "@/server/contracts/admin-ai-generation-formal-adoption-contract";
import type { AdminWorkspaceCapabilitySummary } from "@/server/contracts/admin-workspace-role-guard-contract";
import type {
  AdminAiGenerationTaskHistoryGeneratedResultDto,
  AdminAiGenerationLocalContractDto,
  AdminAiGenerationRejectedErrorDto,
  AdminAiGenerationTaskHistoryDto,
  AdminAiGenerationTaskHistoryItemDto,
} from "@/server/contracts/admin-ai-generation-local-contract";
import type {
  ApiPagination,
  ApiResponse,
} from "@/server/contracts/api-response";
import type { AuthContextDto } from "@/server/contracts/auth-contract";
import type {
  OrganizationTrainingDraftDto,
  OrganizationTrainingSourceContextAttachmentDto,
} from "@/server/contracts/organization-training-contract";
import type {
  AiGenerationRouteIntegratedGenerationParameters,
  AiGenerationRouteIntegratedProfession,
  AiGenerationRouteIntegratedSubject,
} from "@/server/contracts/route-integrated-provider-execution-contract";

import {
  AdminLoadingState,
  AdminSurfaceStatus,
  AdminUnauthorizedState,
  AdminUpgradeRequiredState,
  fetchAdminApi,
  formatAdminApiBusinessError,
  getStoredSessionToken,
  isAdminContext,
  isUnauthorizedResponse,
} from "../content-admin-runtime";
import {
  createOrganizationTrainingCapabilityContext,
  resolveOrganizationWorkspacePageAccess,
} from "../organization-workspace/admin-organization-workspace-access";
import {
  createContentAdminFormalReviewedDraftPayload,
  type AdminAiGenerationFormalReviewedDraftPayload,
} from "./admin-ai-generation-formal-draft-payload";

type AdminAiGenerationEntryLoadState =
  | "loading"
  | "ready"
  | "standard-unavailable"
  | "permission-denied"
  | "unauthorized"
  | "error";
type AdminAiGenerationWorkspace = "content" | "organization";
type AdminAiGenerationKind = "question" | "paper";
type AdminAiGenerationRequestState =
  | "idle"
  | "submitting"
  | "accepted"
  | "error";
type AdminAiGenerationHistoryState = "loading" | "ready" | "empty" | "error";
type AdminAiGenerationParameterState = {
  generationKind?: AdminAiGenerationKind;
  parameters?: Partial<AiGenerationRouteIntegratedGenerationParameters> | null;
};
const ADMIN_AI_GENERATION_HISTORY_PAGE = 1;
const ADMIN_AI_GENERATION_HISTORY_PAGE_SIZE = 10;
const ADMIN_AI_GENERATION_BUSINESS_RESULT_PREVIEW =
  "生成草稿已创建，待评审查看";
const ADMIN_AI_GENERATION_DIAGNOSTIC_CONTENT_PATTERNS = [
  /redacted admin ai generation local contract summary/iu,
  /redacted generated result summary/iu,
  /\blocal contract\b/iu,
  /\bredaction\b/iu,
  /本地合约/u,
  /已脱敏/u,
];
const ADMIN_AI_GENERATION_REJECTION_MESSAGE_BY_REASON: Record<
  AdminAiGenerationRejectedErrorDto["rejectionReason"],
  string
> = {
  generated_output_unacceptable: "生成结果未形成可评审草稿，未创建草稿。",
  grounding_evidence_insufficient:
    "资料依据不足，未执行模型服务，也未创建草稿。",
  provider_credential_unavailable:
    "AI服务未配置或不可用，未执行生成，也未创建草稿。",
  provider_execution_failed: "AI服务执行未成功，未创建草稿。",
  provider_execution_unavailable:
    "AI服务未启用或不可用，未执行生成，也未创建草稿。",
};
type ContentAdminReviewDecision = "approved" | "rejected";
type ContentAdminReviewActionState =
  | "idle"
  | "adopting"
  | "rejecting"
  | "adopted"
  | "rejected"
  | "error";
type ContentAdminReviewActionInput = {
  generationKind: AdminAiGenerationKind;
  resultPublicId: string;
  reviewDecision: ContentAdminReviewDecision;
  reviewedDraft?: AdminAiGenerationFormalReviewedDraftPayload | null;
  weakEvidenceConfirmed?: boolean;
};
type OrganizationAiTrainingDraftCopyState =
  | "idle"
  | "copying"
  | "copied"
  | "error";
type OrganizationAiTrainingDraftCopyInput = {
  taskItem: AdminAiGenerationTaskHistoryItemDto;
  confirmation: "not_required" | "weak_confirmed";
};
type AdminAiGenerationDetailControl = {
  inputMode: "select" | "number" | "text";
  label: string;
  max?: number;
  options?: readonly string[];
  value: string;
};

type AdminAiGenerationDetailControlChange = {
  label: string;
  value: string;
};

function hasAnyRole(adminRoles: readonly string[], expectedRoles: string[]) {
  return expectedRoles.some((expectedRole) =>
    adminRoles.includes(expectedRole),
  );
}

function resolveAdminAiGenerationBusinessPreview(
  previewText: string | null | undefined,
) {
  const normalizedPreviewText = previewText?.trim();

  if (!normalizedPreviewText) {
    return ADMIN_AI_GENERATION_BUSINESS_RESULT_PREVIEW;
  }

  return ADMIN_AI_GENERATION_DIAGNOSTIC_CONTENT_PATTERNS.some((pattern) =>
    pattern.test(normalizedPreviewText),
  )
    ? ADMIN_AI_GENERATION_BUSINESS_RESULT_PREVIEW
    : normalizedPreviewText;
}

function isAdminAiGenerationRejectedErrorData(
  value: unknown,
): value is AdminAiGenerationRejectedErrorDto {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const maybeRejectedError =
    value as Partial<AdminAiGenerationRejectedErrorDto>;

  return (
    maybeRejectedError.redactionStatus === "redacted" &&
    typeof maybeRejectedError.rejectionReason === "string" &&
    maybeRejectedError.rejectionReason in
      ADMIN_AI_GENERATION_REJECTION_MESSAGE_BY_REASON
  );
}

function formatAdminAiGenerationRequestError(
  payload: Pick<ApiResponse<unknown>, "code" | "data" | "message">,
): string {
  const baseMessage = formatAdminApiBusinessError(payload, "生成请求暂不可用");

  if (!isAdminAiGenerationRejectedErrorData(payload.data)) {
    return baseMessage;
  }

  return `${baseMessage}。${
    ADMIN_AI_GENERATION_REJECTION_MESSAGE_BY_REASON[
      payload.data.rejectionReason
    ]
  }`;
}

function getOrganizationAiGenerationPath(
  generationKind: AdminAiGenerationKind,
) {
  return generationKind === "question"
    ? "/organization/ai-question-generation"
    : "/organization/ai-paper-generation";
}

function resolveLoadState(
  authContext: AuthContextDto,
  workspace: AdminAiGenerationWorkspace,
  generationKind: AdminAiGenerationKind,
): AdminAiGenerationEntryLoadState {
  const adminRoles = (authContext.user.adminRoles ?? []) as readonly string[];

  if (workspace === "content") {
    return hasAnyRole(adminRoles, ["super_admin", "content_admin"])
      ? "ready"
      : "unauthorized";
  }

  const organizationAccess = resolveOrganizationWorkspacePageAccess(
    authContext,
    getOrganizationAiGenerationPath(generationKind),
  ).loadState;

  return organizationAccess === "unauthorized"
    ? "permission-denied"
    : organizationAccess;
}

function getPageCopy(
  workspace: AdminAiGenerationWorkspace,
  generationKind: AdminAiGenerationKind,
) {
  const isQuestionGeneration = generationKind === "question";

  if (workspace === "content") {
    return {
      eyebrow: "内容 AI 辅助",
      title: isQuestionGeneration ? "待审题目草稿" : "待审试卷草稿",
      description:
        "待审题目和待审试卷进入内容评审流程；发布前仍需编辑、审核和发布校验。",
      actionLabel: isQuestionGeneration
        ? "生成待审题目草稿"
        : "生成待审试卷草稿",
      boundaryLabel: isQuestionGeneration
        ? "待审题目草稿不直接发布正式题目"
        : "待审试卷草稿不直接发布正式试卷",
    };
  }

  return {
    eyebrow: "企业 AI 训练内容",
    title: isQuestionGeneration ? "训练题草稿" : "训练试卷草稿",
    description:
      "为本企业准备训练题目和训练试卷草稿；发布前仍需编辑、预览员工视角并确认范围。",
    actionLabel: isQuestionGeneration ? "生成训练题草稿" : "生成训练试卷草稿",
    boundaryLabel: "这些内容只进入企业训练草稿，不写入平台正式题库或正式试卷。",
  };
}

function getAdminAiGenerationRequestPath(
  workspace: AdminAiGenerationWorkspace,
): string {
  return workspace === "content"
    ? "/api/v1/content-ai-generation-requests"
    : "/api/v1/organization-ai-generation-requests";
}

function getAdminAiGenerationHistoryPath(
  workspace: AdminAiGenerationWorkspace,
  generationKind: AdminAiGenerationKind,
  page: number,
): string {
  const searchParams = new URLSearchParams({
    generationKind,
    page: String(page),
    pageSize: String(ADMIN_AI_GENERATION_HISTORY_PAGE_SIZE),
  });

  return `${getAdminAiGenerationRequestPath(workspace)}?${searchParams.toString()}`;
}

function getContentAiGenerationFormalAdoptionPath(
  resultPublicId: string,
): string {
  return `/api/v1/content-ai-generation-results/${encodeURIComponent(
    resultPublicId,
  )}/formal-adoptions`;
}

function getGenerationKindLabel(generationKind: AdminAiGenerationKind): string {
  return generationKind === "question" ? "AI出题" : "AI组卷";
}

function getTaskStatusLabel(
  status: AdminAiGenerationTaskHistoryItemDto["status"],
): string {
  const labels = {
    pending: "等待生成",
    running: "生成中",
    succeeded: "已完成",
    failed: "失败",
    cancelled: "已取消",
  } satisfies Record<AdminAiGenerationTaskHistoryItemDto["status"], string>;

  return labels[status];
}

function getVisibilityLabel(
  visibility: "summary_only" | "redacted_snapshot",
): string {
  return visibility === "summary_only" ? "结果摘要" : "草稿快照";
}

function getFormalAdoptionStatusLabel(
  status: AdminAiGenerationTaskHistoryGeneratedResultDto["formalAdoptionStatus"],
): string {
  const labels = {
    blocked: "需审核后采用",
  } satisfies Record<
    AdminAiGenerationTaskHistoryGeneratedResultDto["formalAdoptionStatus"],
    string
  >;

  return labels[status];
}

function getOrganizationDraftUsageStatusLabel(
  status: AdminAiGenerationTaskHistoryGeneratedResultDto["formalAdoptionStatus"],
): string {
  const labels = {
    blocked: "未关联训练草稿",
  } satisfies Record<
    AdminAiGenerationTaskHistoryGeneratedResultDto["formalAdoptionStatus"],
    string
  >;

  return labels[status];
}

function isAdminGeneratedResultGrounded(
  generatedResult: AdminAiGenerationTaskHistoryGeneratedResultDto,
): boolean {
  return (
    generatedResult.evidenceStatus === "sufficient" &&
    generatedResult.citationCount > 0
  );
}

function getEvidenceStatusLabel(
  generatedResult: AdminAiGenerationTaskHistoryGeneratedResultDto,
): string {
  if (
    generatedResult.evidenceStatus === "sufficient" &&
    generatedResult.citationCount > 0
  ) {
    return "资料充足";
  }

  if (generatedResult.evidenceStatus === "weak") {
    return "资料较少";
  }

  return "资料不足";
}

function getOrganizationAiTrainingCopyReadiness(
  generatedResult: AdminAiGenerationTaskHistoryGeneratedResultDto,
): "ready" | "weak_confirmation_required" | "blocked" {
  if (isAdminGeneratedResultGrounded(generatedResult)) {
    return "ready";
  }

  if (generatedResult.evidenceStatus === "weak") {
    return "weak_confirmation_required";
  }

  return "blocked";
}

function getContentAdminReviewReadiness(
  generatedResult: AdminAiGenerationTaskHistoryGeneratedResultDto,
): "ready" | "weak_confirmation_required" | "blocked" {
  if (generatedResult.evidenceStatus === "weak") {
    return "weak_confirmation_required";
  }

  if (generatedResult.evidenceStatus === "none") {
    return "blocked";
  }

  return "ready";
}

function createOrganizationAiTrainingDraftTitle(input: {
  generationKind: AdminAiGenerationKind;
  requestedAt: string;
}): string {
  return `${getGenerationKindLabel(input.generationKind)}训练草稿 ${formatRequestedAt(input.requestedAt)}`;
}

function createOrganizationAiResultSourceStatus(
  generatedResult: AdminAiGenerationTaskHistoryGeneratedResultDto,
): string {
  return `ai_generated_${generatedResult.evidenceStatus}_evidence`;
}

function normalizeOptionalPublicId(value: unknown): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const normalizedValue = value.trim();

  return normalizedValue === "" ? null : normalizedValue;
}

function resolveOrganizationTrainingAuthorizationPublicId(
  capabilitySummary: AdminWorkspaceCapabilitySummary,
): string | null {
  return normalizeOptionalPublicId(
    capabilitySummary.organizationAuthorizationPublicId,
  );
}

function formatRequestedAt(requestedAt: string): string {
  return requestedAt.slice(0, 16).replace("T", " ");
}

const contentAdminReviewLocalValidationItems = [
  {
    boundaryStatus: "批量采用未执行",
    contractStatus: "批量选择预览",
    validationMode: "仅预览",
  },
  {
    boundaryStatus: "重试操作未执行",
    contractStatus: "失败重试状态",
    validationMode: "仅提交请求",
  },
  {
    boundaryStatus: "不展示原始载荷",
    contractStatus: "结果差异查看",
    validationMode: "只读查看",
  },
  {
    boundaryStatus: "历史记录不改写",
    contractStatus: "采用历史查看",
    validationMode: "只读查看",
  },
] as const;

const adminProfessionLabelByValue = {
  logistics: "物流管理",
  marketing: "市场营销",
  monopoly: "专卖管理",
} satisfies Record<AiGenerationRouteIntegratedProfession, string>;

const adminProfessionValueByLabel = Object.fromEntries(
  Object.entries(adminProfessionLabelByValue).map(([value, label]) => [
    label,
    value,
  ]),
) as Record<string, AiGenerationRouteIntegratedProfession>;

const adminSubjectLabelByValue = {
  skill: "技能实操",
  theory: "理论知识",
} satisfies Record<AiGenerationRouteIntegratedSubject, string>;

const adminSubjectValueByLabel = Object.fromEntries(
  Object.entries(adminSubjectLabelByValue).map(([value, label]) => [
    label,
    value,
  ]),
) as Record<string, AiGenerationRouteIntegratedSubject>;

const adminQuestionTypeLabelByValue = {
  case_analysis: "案例分析题",
  judge: "判断题",
  multiple_choice: "多选题",
  single_choice: "单选题",
} as const;

const adminQuestionTypeValueByLabel = Object.fromEntries(
  Object.entries(adminQuestionTypeLabelByValue).map(([value, label]) => [
    label,
    value,
  ]),
) as Record<string, string>;

const adminDifficultyLabelByValue = {
  easy: "基础",
  hard: "进阶",
  medium: "中等",
} as const;

const adminDifficultyValueByLabel = Object.fromEntries(
  Object.entries(adminDifficultyLabelByValue).map(([value, label]) => [
    label,
    value,
  ]),
) as Record<string, string>;

function createDefaultAdminGenerationParameters(
  generationKind: AdminAiGenerationKind,
  workspace: AdminAiGenerationWorkspace,
): AiGenerationRouteIntegratedGenerationParameters {
  const isOrganizationWorkspace = workspace === "organization";

  return {
    profession: "marketing",
    level: 3,
    subject: "theory",
    knowledgeNode:
      generationKind === "question"
        ? "卷烟营销基础"
        : isOrganizationWorkspace
          ? "均衡覆盖"
          : "覆盖薄弱知识点",
    questionType: generationKind === "question" ? "single_choice" : null,
    questionCount: generationKind === "question" ? 3 : 30,
    difficulty: "medium",
    learningObjective:
      workspace === "organization"
        ? generationKind === "question"
          ? "企业训练巩固"
          : "企业阶段测验"
        : generationKind === "question"
          ? "内容题目评审"
          : "内容试卷评审",
  };
}

function parseLevelLabel(
  value: string,
): AiGenerationRouteIntegratedGenerationParameters["level"] {
  const parsedLevel = Number(value.replace("级", ""));

  return parsedLevel === 1 ||
    parsedLevel === 2 ||
    parsedLevel === 3 ||
    parsedLevel === 4 ||
    parsedLevel === 5
    ? parsedLevel
    : 3;
}

function parsePositiveCount(value: string, fallbackValue: number): number {
  const parsedCount = Number(value);

  return Number.isInteger(parsedCount) && parsedCount > 0
    ? parsedCount
    : fallbackValue;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isAdminAiGenerationProfession(
  value: unknown,
): value is AiGenerationRouteIntegratedProfession {
  return typeof value === "string" && value in adminProfessionLabelByValue;
}

function isAdminAiGenerationSubject(
  value: unknown,
): value is AiGenerationRouteIntegratedSubject {
  return typeof value === "string" && value in adminSubjectLabelByValue;
}

function isAdminAiGenerationLevel(
  value: unknown,
): value is AiGenerationRouteIntegratedGenerationParameters["level"] {
  return (
    value === 1 || value === 2 || value === 3 || value === 4 || value === 5
  );
}

function resolveNullableText(
  value: unknown,
  fallbackValue: string | null,
): string | null {
  return typeof value === "string" || value === null ? value : fallbackValue;
}

export function resolveAdminAiGenerationParameters(
  generationKind: AdminAiGenerationKind,
  workspaceOrGenerationParameterState?:
    | AdminAiGenerationWorkspace
    | AdminAiGenerationParameterState
    | null,
  generationParameterStateInput?: AdminAiGenerationParameterState | null,
): AiGenerationRouteIntegratedGenerationParameters {
  const workspace =
    typeof workspaceOrGenerationParameterState === "string"
      ? workspaceOrGenerationParameterState
      : "content";
  const generationParameterState =
    typeof workspaceOrGenerationParameterState === "string"
      ? generationParameterStateInput
      : workspaceOrGenerationParameterState;
  const defaultParameters = createDefaultAdminGenerationParameters(
    generationKind,
    workspace,
  );

  if (
    generationParameterState?.generationKind !== generationKind ||
    !isRecord(generationParameterState.parameters)
  ) {
    return defaultParameters;
  }

  const persistedParameters = generationParameterState.parameters;
  const persistedQuestionCount = persistedParameters.questionCount;

  return {
    profession: isAdminAiGenerationProfession(persistedParameters.profession)
      ? persistedParameters.profession
      : defaultParameters.profession,
    level: isAdminAiGenerationLevel(persistedParameters.level)
      ? persistedParameters.level
      : defaultParameters.level,
    subject: isAdminAiGenerationSubject(persistedParameters.subject)
      ? persistedParameters.subject
      : defaultParameters.subject,
    knowledgeNode: resolveNullableText(
      persistedParameters.knowledgeNode,
      defaultParameters.knowledgeNode,
    ),
    questionType: resolveNullableText(
      persistedParameters.questionType,
      defaultParameters.questionType,
    ),
    questionCount:
      typeof persistedQuestionCount === "number"
        ? parsePositiveCount(
            String(persistedQuestionCount),
            defaultParameters.questionCount,
          )
        : defaultParameters.questionCount,
    difficulty: resolveNullableText(
      persistedParameters.difficulty,
      defaultParameters.difficulty,
    ),
    learningObjective: resolveNullableText(
      persistedParameters.learningObjective,
      defaultParameters.learningObjective,
    ),
  };
}

const aiGenerationDetailControlClassName =
  "border-input bg-background text-text-primary mt-1 h-9 w-full rounded-md border px-3 text-sm";

function getAiGenerationDetailControls(
  generationKind: AdminAiGenerationKind,
  generationParameters: AiGenerationRouteIntegratedGenerationParameters,
  workspace: AdminAiGenerationWorkspace,
): readonly AdminAiGenerationDetailControl[] {
  const baseControls = [
    {
      inputMode: "select",
      label: "专业",
      options: ["专卖管理", "市场营销", "物流管理"],
      value: adminProfessionLabelByValue[generationParameters.profession],
    },
    {
      inputMode: "select",
      label: "等级",
      options: ["1级", "2级", "3级", "4级", "5级"],
      value: `${generationParameters.level}级`,
    },
    {
      inputMode: "select",
      label: "科目",
      options: ["理论知识", "技能实操"],
      value: adminSubjectLabelByValue[generationParameters.subject],
    },
  ] satisfies readonly AdminAiGenerationDetailControl[];

  if (generationKind === "question") {
    return [
      ...baseControls,
      {
        inputMode: "text",
        label: "知识点",
        value: generationParameters.knowledgeNode ?? "",
      },
      {
        inputMode: "select",
        label: "题型",
        options: ["单选题", "多选题", "判断题", "案例分析题"],
        value:
          generationParameters.questionType === null
            ? "单选题"
            : (adminQuestionTypeLabelByValue[
                generationParameters.questionType as keyof typeof adminQuestionTypeLabelByValue
              ] ?? "单选题"),
      },
      {
        inputMode: "number",
        label: "出题数量",
        max: 10,
        value: String(generationParameters.questionCount),
      },
      {
        inputMode: "select",
        label: "难度",
        options: ["基础", "中等", "进阶"],
        value:
          generationParameters.difficulty === null
            ? "中等"
            : (adminDifficultyLabelByValue[
                generationParameters.difficulty as keyof typeof adminDifficultyLabelByValue
              ] ?? "中等"),
      },
      {
        inputMode: "text",
        label: workspace === "organization" ? "训练目标" : "评审目标",
        value: generationParameters.learningObjective ?? "",
      },
    ] satisfies readonly AdminAiGenerationDetailControl[];
  }

  const paperControls = [
    ...baseControls,
    {
      inputMode: "number",
      label: "题目数量",
      max: 80,
      value: String(generationParameters.questionCount),
    },
  ] satisfies readonly AdminAiGenerationDetailControl[];
  const organizationPaperControls =
    workspace === "organization"
      ? ([
          ...paperControls,
          {
            inputMode: "select",
            label: "题源偏好",
            options: ["均衡使用", "优先使用企业题", "优先使用平台题"],
            value: "均衡使用",
          },
        ] satisfies readonly AdminAiGenerationDetailControl[])
      : paperControls;

  return [
    ...organizationPaperControls,
    {
      inputMode: "select",
      label: "题型分布",
      options: [
        "单选 40% / 多选 30% / 判断 30%",
        "单选 50% / 多选 25% / 判断 25%",
        "按薄弱项动态分配",
      ],
      value: "单选 40% / 多选 30% / 判断 30%",
    },
    {
      inputMode: "select",
      label: "难度",
      options: ["基础", "中等", "进阶"],
      value:
        generationParameters.difficulty === null
          ? "中等"
          : (adminDifficultyLabelByValue[
              generationParameters.difficulty as keyof typeof adminDifficultyLabelByValue
            ] ?? "中等"),
    },
    {
      inputMode: "select",
      label: "知识点覆盖",
      options: ["均衡覆盖", "指定知识点", "薄弱知识点优先", "综合测验"],
      value: generationParameters.knowledgeNode ?? "均衡覆盖",
    },
    {
      inputMode: "select",
      label: "试卷结构",
      options: ["按大题模块组织", "按知识点模块组织"],
      value: "按大题模块组织",
    },
    {
      inputMode: "text",
      label: workspace === "organization" ? "组卷目标" : "评审目标",
      value: generationParameters.learningObjective ?? "",
    },
  ] satisfies readonly AdminAiGenerationDetailControl[];
}

function AdminAiGenerationDetailControls({
  generationParameters,
  generationKind,
  onChange,
  workspace,
}: {
  generationParameters: AiGenerationRouteIntegratedGenerationParameters;
  generationKind: AdminAiGenerationKind;
  onChange: (change: AdminAiGenerationDetailControlChange) => void;
  workspace: AdminAiGenerationWorkspace;
}) {
  const controls = getAiGenerationDetailControls(
    generationKind,
    generationParameters,
    workspace,
  );
  const draftBoundaryLabel =
    workspace === "organization"
      ? generationKind === "question"
        ? "训练题草稿"
        : "训练试卷草稿"
      : generationKind === "question"
        ? "待审题目草稿"
        : "待审试卷草稿";
  const title = generationKind === "question" ? "出题细节" : "组卷细节";
  const isOrganizationPaper =
    workspace === "organization" && generationKind === "paper";
  const isContentPaper = workspace === "content" && generationKind === "paper";
  const isOrganizationQuestion =
    workspace === "organization" && generationKind === "question";

  return (
    <section
      aria-labelledby="admin-ai-generation-detail-controls-title"
      className="bg-surface border-border rounded-md border p-4 shadow-sm"
      data-testid="admin-ai-generation-detail-controls"
    >
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-brand-primary text-xs font-medium">生成条件</p>
          <h2
            className="text-text-primary mt-1 text-base font-semibold"
            id="admin-ai-generation-detail-controls-title"
          >
            {title}
          </h2>
        </div>
        <span className="bg-muted text-text-secondary rounded-md px-2 py-1 text-xs font-medium">
          {draftBoundaryLabel}
        </span>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {controls.map((control) => (
          <label className="block" key={control.label}>
            <span className="text-text-secondary text-xs font-medium">
              {control.label}
            </span>
            {control.inputMode === "select" ? (
              <select
                aria-label={control.label}
                className={aiGenerationDetailControlClassName}
                value={control.value}
                onChange={(event) =>
                  onChange({
                    label: control.label,
                    value: event.currentTarget.value,
                  })
                }
              >
                {control.options?.map((optionLabel) => (
                  <option key={optionLabel} value={optionLabel}>
                    {optionLabel}
                  </option>
                ))}
              </select>
            ) : (
              <input
                aria-label={control.label}
                className={aiGenerationDetailControlClassName}
                value={control.value}
                inputMode={
                  control.inputMode === "number" ? "numeric" : undefined
                }
                min={control.inputMode === "number" ? 1 : undefined}
                max={control.max}
                type={control.inputMode === "number" ? "number" : "text"}
                onChange={(event) =>
                  onChange({
                    label: control.label,
                    value: event.currentTarget.value,
                  })
                }
              />
            )}
          </label>
        ))}
      </div>

      {isOrganizationPaper || isContentPaper ? (
        <section className="border-border bg-muted/40 mt-4 rounded-md border p-3">
          <p className="text-brand-primary text-xs font-medium">题源说明</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {(isOrganizationPaper
              ? ["平台正式题库", "本企业已发布训练题"]
              : ["平台正式题库"]
            ).map((sourceLabel) => (
              <span
                className="bg-background text-text-secondary rounded-md px-2 py-1 text-xs"
                key={sourceLabel}
              >
                {sourceLabel}
              </span>
            ))}
          </div>
          <p className="text-text-secondary mt-2 text-xs leading-5">
            系统会先按所选范围匹配，数量不足时可自动从相近知识点或同范围题目中补足。
          </p>
        </section>
      ) : null}

      <p className="text-text-secondary mt-3 text-xs leading-5">
        {isOrganizationQuestion
          ? "这些题目还未发布，员工暂时看不到。"
          : workspace === "content" && generationKind === "paper"
            ? "待审试卷草稿仍需编辑、驳回、审核和发布正式试卷；系统只从平台正式题库选题。"
            : workspace === "content" && generationKind === "question"
              ? "待审题目草稿仍需编辑、驳回、审核和发布正式题目。"
              : `当前准备生成条件和${draftBoundaryLabel}入口；只生成待评审草稿，不触发正式题库写入。`}
      </p>
    </section>
  );
}

function AdminAiGenerationVisibleGeneratedContent({
  localContractSummary,
}: {
  localContractSummary: AdminAiGenerationLocalContractDto;
}) {
  const visibleGeneratedContent =
    localContractSummary.runtimeBridge.visibleGeneratedContent;

  if (visibleGeneratedContent == null) {
    return null;
  }

  const visibleGeneratedContentText = resolveAdminAiGenerationBusinessPreview(
    visibleGeneratedContent.content,
  );
  const visibleQuestionDrafts = getAdminVisibleQuestionDrafts(
    visibleGeneratedContent.structuredPreview,
  );
  const visiblePaperSections = getAdminVisiblePaperSections(
    visibleGeneratedContent.structuredPreview,
  );
  const paperAssembly = localContractSummary.paperAssembly ?? null;
  const visibleGeneratedContentTitle =
    paperAssembly !== null
      ? getAdminPaperAssemblyContainerLabel(localContractSummary.workspace)
      : visibleQuestionDrafts.length > 0
        ? "生成题目草稿"
        : visiblePaperSections.length > 0
          ? "生成试卷草稿"
          : "临时展示内容";

  return (
    <section
      className="border-border bg-background mt-4 rounded-md border p-3"
      data-testid="admin-visible-generated-content"
    >
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-brand-primary text-xs font-medium">本次生成草稿</p>
          <h3 className="text-text-primary mt-1 text-sm font-semibold">
            {visibleGeneratedContentTitle}
          </h3>
        </div>
        <span className="bg-muted text-text-secondary rounded-md px-2 py-1 text-xs font-medium">
          待评审草稿
        </span>
      </div>
      {visibleQuestionDrafts.length > 0 ? (
        <AdminQuestionDraftList questionDrafts={visibleQuestionDrafts} />
      ) : paperAssembly !== null ? (
        <AdminPaperAssemblyContainer
          paperAssembly={paperAssembly}
          workspace={localContractSummary.workspace}
        />
      ) : visiblePaperSections.length > 0 ? (
        <AdminPaperDraftList paperSections={visiblePaperSections} />
      ) : (
        <p className="text-text-primary mt-3 text-sm leading-6 whitespace-pre-wrap">
          {visibleGeneratedContentText}
        </p>
      )}
      {visibleGeneratedContent.structuredPreview && paperAssembly === null ? (
        <StructuredPreviewSummary
          structuredPreview={visibleGeneratedContent.structuredPreview}
        />
      ) : null}
    </section>
  );
}

type AdminPaperAssembly = Exclude<
  AdminAiGenerationLocalContractDto["paperAssembly"],
  null
>;

function getAdminPaperAssemblyContainerLabel(
  workspace: AdminAiGenerationWorkspace,
): string {
  return workspace === "organization" ? "企业训练试卷草稿" : "待审试卷草稿";
}

function getAdminPaperAssemblyMatchQualityLabel(
  matchQuality: AdminPaperAssembly["container"]["matchQuality"],
): string {
  const labels = {
    fully_matched: "全部按条件匹配",
    supplemented_from_nearby_knowledge: "已从相近知识点自动补足",
    supplemented_from_same_scope: "已从同范围题目自动补足",
    insufficient: "题源不足，需调整条件",
  } satisfies Record<AdminPaperAssembly["container"]["matchQuality"], string>;

  return labels[matchQuality];
}

function AdminPaperAssemblyContainer({
  paperAssembly,
  workspace,
}: {
  paperAssembly: AdminPaperAssembly;
  workspace: AdminAiGenerationWorkspace;
}) {
  const container = paperAssembly.container;
  const sourceLabels = [
    container.sourceComposition.platformFormalQuestionCount > 0
      ? `平台正式题库 ${container.sourceComposition.platformFormalQuestionCount} 题`
      : null,
    container.sourceComposition.enterpriseTrainingSnapshotCount > 0
      ? `本企业已发布训练题 ${container.sourceComposition.enterpriseTrainingSnapshotCount} 题`
      : null,
  ].filter((sourceLabel) => sourceLabel !== null);
  const nextActionLabels =
    workspace === "organization"
      ? ["编辑试卷", "调整题目", "预览员工视角", "保存草稿", "发布训练"]
      : ["编辑", "驳回", "审核", "发布正式试卷"];

  return (
    <div
      className="mt-3 space-y-3"
      data-testid="admin-ai-paper-assembly-container"
    >
      <dl className="grid gap-2 text-sm sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <dt className="text-text-secondary">试卷容器</dt>
          <dd className="text-text-primary mt-1">
            {getAdminPaperAssemblyContainerLabel(workspace)}
          </dd>
        </div>
        <div>
          <dt className="text-text-secondary">题量</dt>
          <dd className="text-text-primary mt-1">
            已选 {container.selectedQuestionCount} /{" "}
            {container.requestedQuestionCount} 题
          </dd>
        </div>
        <div>
          <dt className="text-text-secondary">题源说明</dt>
          <dd className="text-text-primary mt-1">
            {sourceLabels.join("，") || "题源不足"}
          </dd>
        </div>
        <div>
          <dt className="text-text-secondary">匹配说明</dt>
          <dd className="text-text-primary mt-1">
            {getAdminPaperAssemblyMatchQualityLabel(container.matchQuality)}
          </dd>
        </div>
      </dl>

      {paperAssembly.insufficiency !== null ? (
        <p className="text-destructive text-sm leading-6">
          仍缺 {paperAssembly.insufficiency.missingQuestionCount}{" "}
          题，请调整知识点、题型或题量。
        </p>
      ) : (
        <p className="text-text-secondary text-sm leading-6">
          已按允许的正式题源完成组卷，未使用 AI 生成题目正文。
        </p>
      )}

      <div className="space-y-2">
        {container.sections.map((paperSection) => (
          <section
            className="border-border bg-muted/40 rounded-md border p-3"
            key={paperSection.sectionKey}
          >
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
              <h4 className="text-text-primary text-sm font-semibold">
                {paperSection.title}
              </h4>
              <span className="bg-background text-text-secondary rounded-md px-2 py-1 text-xs">
                已选 {paperSection.selectedQuestionCount} /{" "}
                {paperSection.targetQuestionCount} 题
              </span>
            </div>
            <p className="text-text-secondary mt-2 text-xs leading-5">
              精确匹配 {paperSection.degradationSummary.exactCount}{" "}
              题，相近知识点补足{" "}
              {paperSection.degradationSummary.nearbyKnowledgeCount}{" "}
              题，同范围补足 {paperSection.degradationSummary.sameScopeCount}{" "}
              题。
            </p>
          </section>
        ))}
      </div>

      <div
        className="flex flex-wrap gap-2"
        data-testid="admin-ai-paper-assembly-next-actions"
      >
        {nextActionLabels.map((actionLabel) => (
          <span
            className="bg-muted text-text-secondary rounded-md px-2 py-1 text-xs font-medium"
            key={actionLabel}
          >
            {actionLabel}
          </span>
        ))}
      </div>
    </div>
  );
}

type AdminVisibleGeneratedContentDto = NonNullable<
  AdminAiGenerationLocalContractDto["runtimeBridge"]["visibleGeneratedContent"]
>;

type AdminQuestionDraftSummary = Extract<
  NonNullable<AdminVisibleGeneratedContentDto["structuredPreview"]>,
  { kind: "question_set"; parseStatus: "parsed" }
>["draftSummaries"][number];

type AdminPaperSectionDraftSummary = Extract<
  NonNullable<AdminVisibleGeneratedContentDto["structuredPreview"]>,
  { kind: "paper_draft"; parseStatus: "parsed" }
>["paperSectionSummaries"][number];

type AdminVisibleQuestionDraftSummary =
  | AdminQuestionDraftSummary
  | AdminPaperSectionDraftSummary["questionDrafts"][number];

function getAdminVisibleQuestionDrafts(
  structuredPreview: AdminVisibleGeneratedContentDto["structuredPreview"],
): AdminQuestionDraftSummary[] {
  if (
    structuredPreview?.kind !== "question_set" ||
    structuredPreview.parseStatus !== "parsed"
  ) {
    return [];
  }

  return structuredPreview.draftSummaries.filter(hasVisibleQuestionDraftBody);
}

function getAdminVisiblePaperSections(
  structuredPreview: AdminVisibleGeneratedContentDto["structuredPreview"],
): AdminPaperSectionDraftSummary[] {
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
        hasVisibleQuestionDraftBody,
      ),
    }))
    .filter(hasVisiblePaperSectionBody);
}

function hasVisibleQuestionDraftBody(
  questionDraft: AdminVisibleQuestionDraftSummary,
): boolean {
  return Boolean(
    questionDraft.questionStem ||
    questionDraft.questionOptions?.length ||
    questionDraft.standardAnswer ||
    questionDraft.analysis,
  );
}

function hasVisiblePaperSectionBody(
  paperSection: AdminPaperSectionDraftSummary,
): boolean {
  return Boolean(
    paperSection.title ||
    paperSection.description ||
    paperSection.questionDrafts.length,
  );
}

function AdminQuestionDraftList({
  questionDrafts,
  testId = "admin-ai-question-drafts",
}: {
  questionDrafts: AdminVisibleQuestionDraftSummary[];
  testId?: string;
}) {
  return (
    <div className="mt-3 space-y-3" data-testid={testId}>
      {questionDrafts.map((questionDraft) => (
        <section
          className="border-border bg-muted/40 rounded-md border p-3"
          data-testid="admin-ai-question-draft-card"
          key={questionDraft.draftNumber}
        >
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <h4 className="text-text-primary text-sm font-semibold">
              题目 {questionDraft.draftNumber}
            </h4>
            <span className="bg-background text-text-secondary rounded-md px-2 py-1 text-xs">
              {[questionDraft.questionType, questionDraft.difficulty]
                .filter(Boolean)
                .join(" / ") || "待评审"}
            </span>
          </div>
          <QuestionDraftField label="题干" value={questionDraft.questionStem} />
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
          <QuestionDraftField
            label="标准答案"
            value={questionDraft.standardAnswer}
          />
          <QuestionDraftField label="解析" value={questionDraft.analysis} />
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

function AdminPaperDraftList({
  paperSections,
}: {
  paperSections: AdminPaperSectionDraftSummary[];
}) {
  return (
    <div className="mt-3 space-y-4" data-testid="admin-ai-paper-drafts">
      {paperSections.map((paperSection) => (
        <section
          className="border-border bg-muted/40 rounded-md border p-3"
          data-testid="admin-ai-paper-section-draft-card"
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
                .join(" / ") || "待评审"}
            </span>
          </div>
          <QuestionDraftField label="说明" value={paperSection.description} />
          {paperSection.questionDrafts.length > 0 ? (
            <AdminQuestionDraftList
              questionDrafts={paperSection.questionDrafts}
              testId="admin-ai-paper-question-drafts"
            />
          ) : null}
        </section>
      ))}
    </div>
  );
}

function QuestionDraftField({
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

function StructuredPreviewSummary({
  structuredPreview,
}: {
  structuredPreview: NonNullable<
    NonNullable<
      AdminAiGenerationLocalContractDto["runtimeBridge"]["visibleGeneratedContent"]
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

function AdminAiGenerationTaskHistoryPanel({
  adminWorkspaceCapabilitySummary,
  copyActionErrorMessageByResultPublicId,
  copyActionStateByResultPublicId,
  currentLocalContractSummary,
  generationParameters,
  generationKind,
  onCopyToTrainingDraft,
  onChangePage,
  onReviewContentDraft,
  pagination,
  reviewActionStateByResultPublicId,
  state,
  taskHistory,
  workspace,
}: {
  adminWorkspaceCapabilitySummary: AdminWorkspaceCapabilitySummary | null;
  copyActionErrorMessageByResultPublicId: Record<string, string>;
  copyActionStateByResultPublicId: Record<
    string,
    OrganizationAiTrainingDraftCopyState
  >;
  currentLocalContractSummary: AdminAiGenerationLocalContractDto | null;
  generationParameters: AiGenerationRouteIntegratedGenerationParameters;
  generationKind: AdminAiGenerationKind;
  onCopyToTrainingDraft: (input: OrganizationAiTrainingDraftCopyInput) => void;
  onChangePage: (page: number) => void;
  onReviewContentDraft: (input: ContentAdminReviewActionInput) => void;
  pagination: ApiPagination | null;
  reviewActionStateByResultPublicId: Record<
    string,
    ContentAdminReviewActionState
  >;
  state: AdminAiGenerationHistoryState;
  taskHistory: AdminAiGenerationTaskHistoryDto | null;
  workspace: AdminAiGenerationWorkspace;
}) {
  const items = taskHistory?.items ?? [];
  const totalPages =
    pagination === null
      ? 1
      : Math.max(1, Math.ceil(pagination.total / pagination.pageSize));
  const canGoPrevious = pagination !== null && pagination.page > 1;
  const canGoNext = pagination !== null && pagination.page < totalPages;
  const historyCopy =
    workspace === "organization"
      ? {
          eyebrow: "组织草稿池",
          empty:
            "组织草稿池暂无任务记录。模型服务仍待审批，不会生成正式题目或试卷。",
        }
      : {
          eyebrow: "生成任务状态",
          empty: "暂无任务记录。提交后将显示等待生成、资料依据和正式采用状态。",
        };
  const boundaryCopy =
    workspace === "organization"
      ? {
          serviceLabel: "模型服务",
          serviceStatus: "待审批",
          costLabel: "创建规则",
          costStatus: "创建草稿不触发模型服务",
          formalStatus: "需创建训练草稿",
          historyError:
            "当前仅显示入口状态。历史接口失败不会启用模型服务，也不会写入正式题目或试卷。",
        }
      : {
          serviceLabel: "模型服务",
          serviceStatus: "待生成",
          costLabel: "用量规则",
          costStatus: "待审批",
          formalStatus: "需后续评审",
          historyError:
            "当前仅显示入口状态。历史接口失败不会启用模型服务，也不会写入正式题目或试卷。",
        };

  return (
    <section
      className="bg-surface border-border rounded-md border p-4 shadow-sm"
      data-testid="admin-ai-generation-task-history"
    >
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-brand-primary text-xs font-medium">
            {historyCopy.eyebrow}
          </p>
          <h2 className="text-text-primary mt-1 text-base font-semibold">
            最近任务
          </h2>
        </div>
        <span className="bg-muted text-text-secondary rounded-md px-2 py-1 text-xs font-medium">
          生成记录
        </span>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
        <span className="bg-muted text-text-secondary rounded-md px-2 py-1 font-medium">
          当前筛选：{getGenerationKindLabel(generationKind)}
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
          aria-label="AI生成历史分页"
          className="mt-3 flex items-center justify-between gap-3"
        >
          <p className="text-text-secondary text-sm">
            第 {pagination.page} / {totalPages} 页
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              className="border-border text-text-primary hover:bg-muted h-9 rounded-lg border bg-transparent px-3 text-sm font-medium transition-transform active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
              disabled={state === "loading" || !canGoPrevious}
              onClick={() => onChangePage(pagination.page - 1)}
            >
              上一页
            </button>
            <button
              type="button"
              className="border-border text-text-primary hover:bg-muted h-9 rounded-lg border bg-transparent px-3 text-sm font-medium transition-transform active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
              disabled={state === "loading" || !canGoNext}
              onClick={() => onChangePage(pagination.page + 1)}
            >
              下一页
            </button>
          </div>
        </nav>
      ) : null}

      {state === "loading" ? (
        <div
          className="text-text-secondary mt-4 flex items-center gap-2 text-sm"
          role="status"
        >
          <LoaderCircle aria-hidden="true" className="size-4 animate-spin" />
          正在加载任务历史
        </div>
      ) : null}

      {state === "error" ? (
        <div
          className="border-destructive/40 bg-destructive/5 mt-4 rounded-md border p-3"
          data-testid="admin-ai-generation-task-history-error"
          role="alert"
        >
          <h3 className="text-text-primary text-sm font-semibold">
            任务历史暂不可用
          </h3>
          <p className="text-text-secondary mt-1 text-sm leading-6">
            {boundaryCopy.historyError}
          </p>
        </div>
      ) : null}

      {state === "empty" ? (
        <div
          className="bg-muted text-text-secondary mt-4 rounded-md p-3 text-sm leading-6"
          role="status"
        >
          {historyCopy.empty}
        </div>
      ) : null}

      {state === "ready" ? (
        <div className="mt-4 space-y-3">
          {items.map((taskItem) => {
            const currentContentAdminReviewedDraft =
              workspace === "content" &&
              taskItem.generatedResult !== null &&
              currentLocalContractSummary?.generatedResult.resultPublicId ===
                taskItem.generatedResult.resultPublicId
                ? createContentAdminFormalReviewedDraftPayload({
                    localContractSummary: currentLocalContractSummary,
                    generationParameters,
                    requestedAt: taskItem.requestedAt,
                  })
                : null;
            const contentAdminReviewedDraft =
              currentContentAdminReviewedDraft ??
              (workspace === "content"
                ? (taskItem.generatedResult?.reviewedDraft ?? null)
                : null);

            return (
              <article
                className="border-border bg-background rounded-md border p-3"
                key={taskItem.taskPublicId}
              >
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h3 className="text-text-primary text-sm font-semibold">
                      {getGenerationKindLabel(taskItem.generationKind)}
                    </h3>
                    <p className="text-text-secondary mt-1 text-xs">
                      {formatRequestedAt(taskItem.requestedAt)}
                    </p>
                  </div>
                  <span className="bg-muted text-text-secondary rounded-md px-2 py-1 text-xs font-medium">
                    {getTaskStatusLabel(taskItem.status)}
                  </span>
                </div>

                <dl className="mt-3 grid gap-2 text-sm sm:grid-cols-2 lg:grid-cols-4">
                  <div>
                    <dt className="text-text-secondary">结果状态</dt>
                    <dd className="text-text-primary mt-1">
                      {getVisibilityLabel(taskItem.contentVisibility)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-text-secondary">
                      {boundaryCopy.serviceLabel}
                    </dt>
                    <dd className="text-text-primary mt-1">
                      {boundaryCopy.serviceStatus}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-text-secondary">
                      {boundaryCopy.costLabel}
                    </dt>
                    <dd className="text-text-primary mt-1">
                      {boundaryCopy.costStatus}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-text-secondary">
                      {workspace === "organization" ? "训练草稿" : "正式内容"}
                    </dt>
                    <dd className="text-text-primary mt-1">
                      {boundaryCopy.formalStatus}
                    </dd>
                  </div>
                </dl>

                {taskItem.generatedResult !== null ? (
                  <div className="border-border bg-muted/40 mt-3 rounded-md border p-3">
                    <p className="text-brand-primary text-xs font-medium">
                      历史草稿摘要
                    </p>
                    <p className="text-text-primary mt-2 text-sm leading-6">
                      {resolveAdminAiGenerationBusinessPreview(
                        taskItem.generatedResult.contentPreviewMasked,
                      )}
                    </p>
                    <dl className="mt-3 grid gap-2 text-sm sm:grid-cols-2 lg:grid-cols-4">
                      <div>
                        <dt className="text-text-secondary">草稿状态</dt>
                        <dd className="text-text-primary mt-1">
                          {getVisibilityLabel(
                            taskItem.generatedResult.contentVisibility,
                          )}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-text-secondary">资料依据</dt>
                        <dd className="text-text-primary mt-1">
                          {getEvidenceStatusLabel(taskItem.generatedResult)}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-text-secondary">依据数量</dt>
                        <dd className="text-text-primary mt-1">
                          {taskItem.generatedResult.citationCount}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-text-secondary">
                          {workspace === "organization"
                            ? "训练草稿"
                            : "正式采用"}
                        </dt>
                        <dd className="text-text-primary mt-1">
                          {workspace === "organization"
                            ? getOrganizationDraftUsageStatusLabel(
                                taskItem.generatedResult.formalAdoptionStatus,
                              )
                            : getFormalAdoptionStatusLabel(
                                taskItem.generatedResult.formalAdoptionStatus,
                              )}
                        </dd>
                      </div>
                    </dl>
                    {workspace === "content" ? (
                      <ContentAdminReviewTraceabilityPanel
                        actionState={
                          reviewActionStateByResultPublicId[
                            taskItem.generatedResult.resultPublicId
                          ] ?? "idle"
                        }
                        generationKind={taskItem.generationKind}
                        generatedResult={taskItem.generatedResult}
                        reviewedDraft={contentAdminReviewedDraft}
                        resultPublicId={taskItem.generatedResult.resultPublicId}
                        onReviewContentDraft={onReviewContentDraft}
                      />
                    ) : null}
                    {workspace === "organization" ? (
                      <OrganizationAiGenerationDraftNextStepPanel
                        actionState={
                          copyActionStateByResultPublicId[
                            taskItem.generatedResult.resultPublicId
                          ] ?? "idle"
                        }
                        actionErrorMessage={
                          copyActionErrorMessageByResultPublicId[
                            taskItem.generatedResult.resultPublicId
                          ] ?? null
                        }
                        adminWorkspaceCapabilitySummary={
                          adminWorkspaceCapabilitySummary
                        }
                        generationParameters={generationParameters}
                        taskItem={taskItem}
                        onCopyToTrainingDraft={onCopyToTrainingDraft}
                      />
                    ) : null}
                  </div>
                ) : null}
              </article>
            );
          })}
        </div>
      ) : null}
    </section>
  );
}

function OrganizationAiGenerationDraftNextStepPanel({
  actionState,
  actionErrorMessage,
  adminWorkspaceCapabilitySummary,
  generationParameters,
  taskItem,
  onCopyToTrainingDraft,
}: {
  actionState: OrganizationAiTrainingDraftCopyState;
  actionErrorMessage: string | null;
  adminWorkspaceCapabilitySummary: AdminWorkspaceCapabilitySummary | null;
  generationParameters: AiGenerationRouteIntegratedGenerationParameters;
  taskItem: AdminAiGenerationTaskHistoryItemDto;
  onCopyToTrainingDraft: (input: OrganizationAiTrainingDraftCopyInput) => void;
}) {
  if (taskItem.generatedResult === null) {
    return null;
  }

  const boundary = taskItem.organizationOwnedDraftBoundary;
  const generatedResult = taskItem.generatedResult;
  const copyReadiness = getOrganizationAiTrainingCopyReadiness(generatedResult);
  const isOrganizationPrivateDraft =
    boundary.generatedResultScope === "organization_private" &&
    boundary.organizationDraftAdoptionStatus ===
      "allowed_as_organization_private_draft";
  const hasSameOrganizationTarget =
    taskItem.organizationPublicId !== null &&
    boundary.organizationPublicId !== null &&
    taskItem.organizationPublicId === boundary.organizationPublicId &&
    taskItem.ownerPublicId === boundary.ownerPublicId;
  const isTrainingSourceAllowed =
    isOrganizationPrivateDraft &&
    boundary.organizationTrainingSourceStatus ===
      "allowed_as_organization_private_training_source" &&
    copyReadiness !== "blocked" &&
    hasSameOrganizationTarget;
  const trainingSourceStatus =
    copyReadiness === "ready" && isTrainingSourceAllowed
      ? "可作为组织训练素材"
      : copyReadiness === "weak_confirmation_required" &&
          isTrainingSourceAllowed
        ? "资料较少，确认后可作为组织训练素材"
        : "资料不足，暂不可作为组织训练素材";
  const isCopyActionDisabled =
    actionState === "copying" ||
    actionState === "copied" ||
    !isTrainingSourceAllowed ||
    adminWorkspaceCapabilitySummary === null;
  const actionLabel =
    actionState === "copied"
      ? "已创建训练草稿"
      : copyReadiness === "weak_confirmation_required"
        ? "确认资料较少并创建训练草稿"
        : "创建企业训练草稿";
  const actionMessage = resolveOrganizationAiTrainingDraftCopyActionMessage(
    actionState,
    actionErrorMessage,
  );
  const draftActionLabels =
    taskItem.generationKind === "paper"
      ? ["编辑试卷", "调整题目", "预览员工视角", "保存草稿", "发布训练"]
      : ["编辑题目", "移除题目", "加入训练草稿", "保存草稿", "发布训练"];

  return (
    <section
      className="border-border bg-background mt-3 rounded-md border p-3"
      data-testid="organization-ai-generation-draft-next-step"
    >
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-brand-primary text-xs font-medium">
            {taskItem.generationKind === "paper"
              ? "企业训练试卷草稿"
              : "企业训练题草稿"}
          </p>
          <h4 className="text-text-primary mt-1 text-sm font-semibold">
            下一步处理
          </h4>
        </div>
        <a
          className="border-border text-text-secondary hover:bg-muted inline-flex h-8 items-center justify-center rounded-md border px-3 text-xs font-medium transition-transform active:scale-[0.98]"
          href="/organization/organization-training"
        >
          进入企业训练配置
        </a>
      </div>

      <dl className="mt-3 grid gap-2 text-xs sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <dt className="text-text-secondary">草稿用途</dt>
          <dd className="text-text-primary mt-1">{trainingSourceStatus}</dd>
        </div>
        <div>
          <dt className="text-text-secondary">训练发布</dt>
          <dd className="text-text-primary mt-1">发布前需后续编辑校验</dd>
        </div>
        <div>
          <dt className="text-text-secondary">员工可见</dt>
          <dd className="text-text-primary mt-1">发布前不可见</dd>
        </div>
        <div>
          <dt className="text-text-secondary">目标范围（当前参数）</dt>
          <dd className="text-text-primary mt-1">
            {adminProfessionLabelByValue[generationParameters.profession]}{" "}
            {generationParameters.level}级 /{" "}
            {adminSubjectLabelByValue[generationParameters.subject]}
          </dd>
        </div>
      </dl>

      <div className="mt-3 flex flex-wrap gap-2">
        {draftActionLabels.map((actionLabel) => (
          <span
            className="bg-muted text-text-secondary rounded-md px-2 py-1 text-xs font-medium"
            key={actionLabel}
          >
            {actionLabel}
          </span>
        ))}
        <button
          className="border-border text-text-secondary inline-flex h-8 items-center justify-center rounded-md border px-3 text-xs font-medium transition-transform active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
          data-testid="organization-ai-training-copy-action"
          disabled={isCopyActionDisabled}
          type="button"
          onClick={() =>
            onCopyToTrainingDraft({
              taskItem,
              confirmation:
                copyReadiness === "weak_confirmation_required"
                  ? "weak_confirmed"
                  : "not_required",
            })
          }
        >
          {actionState === "copying" ? "创建中" : actionLabel}
        </button>
      </div>
      {actionMessage === null ? null : (
        <p
          className={
            actionState === "error"
              ? "text-destructive mt-2 text-xs"
              : "text-brand-primary mt-2 text-xs"
          }
          data-testid="organization-ai-training-copy-status"
          role={actionState === "error" ? "alert" : "status"}
        >
          {actionMessage}
        </p>
      )}
    </section>
  );
}

function resolveOrganizationAiTrainingDraftCopyActionMessage(
  actionState: OrganizationAiTrainingDraftCopyState,
  actionErrorMessage: string | null,
): string | null {
  if (actionState === "copying") {
    return "正在创建企业训练草稿";
  }

  if (actionState === "copied") {
    return "已创建企业训练草稿并关联本次 AI 任务；发布前仍需编辑、预览和校验。";
  }

  if (actionState === "error") {
    return (
      actionErrorMessage ??
      "创建企业训练草稿失败，请确认企业授权和组织范围后重试。"
    );
  }

  return null;
}

function resolveContentAdminReviewActionMessage(
  actionState: ContentAdminReviewActionState,
): string | null {
  if (actionState === "adopting") {
    return "正在提交采用评审";
  }

  if (actionState === "rejecting") {
    return "正在提交驳回评审";
  }

  if (actionState === "adopted") {
    return "待审草稿已创建；正式发布仍需审核和发布校验。";
  }

  if (actionState === "rejected") {
    return "草稿驳回已提交；生成结果不会写入正式内容。";
  }

  if (actionState === "error") {
    return "草稿评审提交失败，请刷新后重试。";
  }

  return null;
}

function ContentAdminReviewTraceabilityPanel({
  actionState,
  generationKind,
  generatedResult,
  reviewedDraft,
  resultPublicId,
  onReviewContentDraft,
}: {
  actionState: ContentAdminReviewActionState;
  generationKind: AdminAiGenerationKind;
  generatedResult: AdminAiGenerationTaskHistoryGeneratedResultDto;
  reviewedDraft: AdminAiGenerationFormalReviewedDraftPayload | null;
  resultPublicId: string;
  onReviewContentDraft: (input: ContentAdminReviewActionInput) => void;
}) {
  const isSubmitting =
    actionState === "adopting" || actionState === "rejecting";
  const isCompleted = actionState === "adopted" || actionState === "rejected";
  const actionMessage = resolveContentAdminReviewActionMessage(actionState);
  const reviewReadiness = getContentAdminReviewReadiness(generatedResult);
  const hasReviewedDraft = reviewedDraft !== null;
  const isAdoptActionDisabled =
    isSubmitting ||
    isCompleted ||
    reviewReadiness === "blocked" ||
    !hasReviewedDraft;
  const isRejectActionDisabled = isSubmitting || isCompleted;
  const evidenceLabel =
    reviewReadiness === "ready"
      ? "资料充足"
      : reviewReadiness === "weak_confirmation_required"
        ? "资料较少"
        : "资料不足";
  const adoptionRequirementLabel =
    !hasReviewedDraft && reviewReadiness !== "blocked"
      ? "需本次结构化草稿"
      : reviewReadiness === "ready"
        ? "可创建待审草稿"
        : reviewReadiness === "weak_confirmation_required"
          ? "需人工确认"
          : "不可采用";
  const draftTargetLabel =
    generationKind === "paper" ? "待审试卷草稿" : "待审题目草稿";
  const adoptActionLabel =
    actionState === "adopted"
      ? `已创建${draftTargetLabel}`
      : !hasReviewedDraft && reviewReadiness !== "blocked"
        ? "需本次结构化草稿"
        : reviewReadiness === "weak_confirmation_required"
          ? `确认资料较少并创建${draftTargetLabel}`
          : `创建${draftTargetLabel}`;
  const nextActionLabels =
    generationKind === "paper"
      ? ["编辑", "驳回", "审核", "发布正式试卷"]
      : ["编辑", "驳回", "审核", "发布正式题目"];

  return (
    <section
      className="border-border bg-background mt-3 rounded-md border p-3"
      data-testid="content-admin-review-traceability"
    >
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-brand-primary text-xs font-medium">评审留痕</p>
          <h4 className="text-text-primary mt-1 text-sm font-semibold">
            单次结果可追溯
          </h4>
        </div>
        <span className="bg-muted text-text-secondary rounded-md px-2 py-1 text-xs font-medium">
          正式发布需审核
        </span>
      </div>

      <dl className="mt-3 grid gap-2 text-xs sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <dt className="text-text-secondary">评审状态</dt>
          <dd className="text-text-primary mt-1">待评审</dd>
        </div>
        <div>
          <dt className="text-text-secondary">结果范围</dt>
          <dd className="text-text-primary mt-1">草稿摘要</dd>
        </div>
        <div>
          <dt className="text-text-secondary">资料依据</dt>
          <dd className="text-text-primary mt-1">{evidenceLabel}</dd>
        </div>
        <div>
          <dt className="text-text-secondary">采用要求</dt>
          <dd className="text-text-primary mt-1">{adoptionRequirementLabel}</dd>
        </div>
      </dl>

      <section
        className="border-border bg-muted/40 mt-3 rounded-md border p-3"
        data-testid="content-admin-review-batch-retry-diff-history-local-validation"
      >
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-brand-primary text-xs font-medium">
              批量、重试和历史校验
            </p>
            <h5 className="text-text-primary mt-1 text-sm font-semibold">
              流程已就绪
            </h5>
          </div>
          <span className="bg-muted text-text-secondary rounded-md px-2 py-1 text-xs font-medium">
            待人工复核
          </span>
        </div>

        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {contentAdminReviewLocalValidationItems.map((item) => (
            <dl
              className="border-border bg-background rounded-md border p-2 text-xs"
              key={item.contractStatus}
            >
              <div>
                <dt className="text-text-secondary">校验项</dt>
                <dd className="text-text-primary mt-1">
                  {item.contractStatus}
                </dd>
              </div>
              <div className="mt-2">
                <dt className="text-text-secondary">校验方式</dt>
                <dd className="text-text-primary mt-1">
                  {item.validationMode}
                </dd>
              </div>
              <div className="mt-2">
                <dt className="text-text-secondary">边界</dt>
                <dd className="text-text-primary mt-1">
                  {item.boundaryStatus}
                </dd>
              </div>
            </dl>
          ))}
        </div>
      </section>

      <div
        className="mt-3 flex flex-wrap gap-2"
        data-testid="content-admin-review-next-actions"
      >
        {nextActionLabels.map((actionLabel) => (
          <span
            className="bg-muted text-text-secondary rounded-md px-2 py-1 text-xs font-medium"
            key={actionLabel}
          >
            {actionLabel}
          </span>
        ))}
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <button
          className="border-border text-text-secondary inline-flex h-8 items-center justify-center rounded-md border px-3 text-xs font-medium transition-transform active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
          data-testid="content-admin-review-adopt-action"
          disabled={isAdoptActionDisabled}
          type="button"
          onClick={() =>
            onReviewContentDraft({
              generationKind,
              resultPublicId,
              reviewDecision: "approved",
              reviewedDraft,
              weakEvidenceConfirmed:
                reviewReadiness === "weak_confirmation_required"
                  ? true
                  : undefined,
            })
          }
        >
          {adoptActionLabel}
        </button>
        <button
          className="border-border text-text-secondary inline-flex h-8 items-center justify-center rounded-md border px-3 text-xs font-medium transition-transform active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
          data-testid="content-admin-review-reject-action"
          disabled={isRejectActionDisabled}
          type="button"
          onClick={() =>
            onReviewContentDraft({
              generationKind,
              resultPublicId,
              reviewDecision: "rejected",
            })
          }
        >
          {actionState === "rejected" ? "已提交驳回" : "驳回草稿"}
        </button>
      </div>
      {actionMessage === null ? null : (
        <p
          className={
            actionState === "error"
              ? "text-destructive mt-2 text-xs"
              : "text-brand-primary mt-2 text-xs"
          }
          data-testid="content-admin-review-action-status"
          role={actionState === "error" ? "alert" : "status"}
        >
          {actionMessage}
        </p>
      )}
    </section>
  );
}

export function AdminAiGenerationEntryPage({
  generationKind,
  workspace,
}: {
  generationKind: AdminAiGenerationKind;
  workspace: AdminAiGenerationWorkspace;
}) {
  const [loadState, setLoadState] =
    useState<AdminAiGenerationEntryLoadState>("loading");
  const [requestState, setRequestState] =
    useState<AdminAiGenerationRequestState>("idle");
  const [requestErrorMessage, setRequestErrorMessage] = useState<string | null>(
    null,
  );
  const [historyState, setHistoryState] =
    useState<AdminAiGenerationHistoryState>("loading");
  const [localContractSummary, setLocalContractSummary] =
    useState<AdminAiGenerationLocalContractDto | null>(null);
  const [generationParameterState, setGenerationParameterState] =
    useState<AdminAiGenerationParameterState>(() => ({
      generationKind,
      parameters: createDefaultAdminGenerationParameters(
        generationKind,
        workspace,
      ),
    }));
  const [taskHistory, setTaskHistory] =
    useState<AdminAiGenerationTaskHistoryDto | null>(null);
  const [taskHistoryPagination, setTaskHistoryPagination] =
    useState<ApiPagination | null>(null);
  const [
    reviewActionStateByResultPublicId,
    setReviewActionStateByResultPublicId,
  ] = useState<Record<string, ContentAdminReviewActionState>>({});
  const [copyActionStateByResultPublicId, setCopyActionStateByResultPublicId] =
    useState<Record<string, OrganizationAiTrainingDraftCopyState>>({});
  const [
    copyActionErrorMessageByResultPublicId,
    setCopyActionErrorMessageByResultPublicId,
  ] = useState<Record<string, string>>({});
  const [adminWorkspaceCapabilitySummary, setAdminWorkspaceCapabilitySummary] =
    useState<AdminWorkspaceCapabilitySummary | null>(null);
  const pageCopy = getPageCopy(workspace, generationKind);
  const providerExecutionCopy =
    workspace === "organization"
      ? {
          label: "模型服务",
          blocked: "待审批",
          error:
            "请求未执行模型服务，也未写入正式题目或试卷。请稍后重试或查看处理记录。",
        }
      : {
          label: "模型服务",
          blocked: "待生成",
          error: "请求未完成模型生成，也未写入正式题目或试卷。请稍后重试。",
        };

  const generationParameters = resolveAdminAiGenerationParameters(
    generationKind,
    workspace,
    generationParameterState,
  );

  function handleGenerationParameterChange({
    label,
    value,
  }: AdminAiGenerationDetailControlChange) {
    setGenerationParameterState((currentState) => {
      const currentParameters = resolveAdminAiGenerationParameters(
        generationKind,
        workspace,
        currentState,
      );

      switch (label) {
        case "专业":
          return {
            generationKind,
            parameters: {
              ...currentParameters,
              profession:
                adminProfessionValueByLabel[value] ??
                currentParameters.profession,
            },
          };
        case "等级":
          return {
            generationKind,
            parameters: {
              ...currentParameters,
              level: parseLevelLabel(value),
            },
          };
        case "科目":
          return {
            generationKind,
            parameters: {
              ...currentParameters,
              subject:
                adminSubjectValueByLabel[value] ?? currentParameters.subject,
            },
          };
        case "知识点":
        case "知识点覆盖":
          return {
            generationKind,
            parameters: {
              ...currentParameters,
              knowledgeNode: value.trim().length === 0 ? null : value.trim(),
            },
          };
        case "题型":
          return {
            generationKind,
            parameters: {
              ...currentParameters,
              questionType:
                adminQuestionTypeValueByLabel[value] ??
                currentParameters.questionType,
            },
          };
        case "出题数量":
        case "题目数量":
          return {
            generationKind,
            parameters: {
              ...currentParameters,
              questionCount: parsePositiveCount(
                value,
                currentParameters.questionCount,
              ),
            },
          };
        case "难度":
          return {
            generationKind,
            parameters: {
              ...currentParameters,
              difficulty:
                adminDifficultyValueByLabel[value] ??
                currentParameters.difficulty,
            },
          };
        case "学习目标":
        case "组卷目标":
          return {
            generationKind,
            parameters: {
              ...currentParameters,
              learningObjective:
                value.trim().length === 0 ? null : value.trim(),
            },
          };
        default:
          return currentState;
      }
    });
  }

  const refreshTaskHistory = useCallback(
    async (sessionToken: string | null, page: number) => {
      setHistoryState("loading");

      const historyResponse =
        await fetchAdminApi<AdminAiGenerationTaskHistoryDto>(
          getAdminAiGenerationHistoryPath(workspace, generationKind, page),
          sessionToken,
        );

      if (isUnauthorizedResponse(historyResponse)) {
        setLoadState("unauthorized");
        setTaskHistoryPagination(null);
        return "unauthorized";
      }

      if (historyResponse.code !== 0 || historyResponse.data === null) {
        setTaskHistory(null);
        setTaskHistoryPagination(null);
        setHistoryState("error");
        return "ready";
      }

      setTaskHistory(historyResponse.data);
      setTaskHistoryPagination(historyResponse.pagination ?? null);
      setHistoryState(
        historyResponse.data.items.length === 0 ? "empty" : "ready",
      );
      return "ready";
    },
    [generationKind, workspace],
  );

  useEffect(() => {
    let isActive = true;

    async function loadAdminSession() {
      const sessionToken = getStoredSessionToken();

      try {
        const sessionResponse = await fetchAdminApi<AuthContextDto>(
          "/api/v1/sessions",
          sessionToken,
        );

        if (!isActive) {
          return;
        }

        if (
          isUnauthorizedResponse(sessionResponse) ||
          sessionResponse.code !== 0 ||
          sessionResponse.data === null ||
          !isAdminContext(sessionResponse.data)
        ) {
          setLoadState("unauthorized");
          return;
        }

        const organizationPageAccess =
          workspace === "organization"
            ? resolveOrganizationWorkspacePageAccess(
                sessionResponse.data,
                getOrganizationAiGenerationPath(generationKind),
              )
            : null;
        const nextLoadState =
          organizationPageAccess === null
            ? resolveLoadState(sessionResponse.data, workspace, generationKind)
            : organizationPageAccess.loadState === "unauthorized"
              ? "permission-denied"
              : organizationPageAccess.loadState;

        setAdminWorkspaceCapabilitySummary(
          organizationPageAccess?.capabilitySummary ?? null,
        );

        if (nextLoadState !== "ready") {
          setLoadState(nextLoadState);
          return;
        }

        const historyLoadState = await refreshTaskHistory(
          sessionToken,
          ADMIN_AI_GENERATION_HISTORY_PAGE,
        );

        if (isActive && historyLoadState === "ready") {
          setLoadState("ready");
        }
      } catch {
        if (isActive) {
          setLoadState("error");
        }
      }
    }

    void loadAdminSession();

    return () => {
      isActive = false;
    };
  }, [generationKind, refreshTaskHistory, workspace]);

  async function handleSubmitLocalContractRequest() {
    const sessionToken = getStoredSessionToken();

    setRequestState("submitting");
    setRequestErrorMessage(null);
    setLocalContractSummary(null);

    try {
      const requestResponse =
        await fetchAdminApi<AdminAiGenerationLocalContractDto>(
          getAdminAiGenerationRequestPath(workspace),
          sessionToken,
          {
            body: JSON.stringify({ generationKind, generationParameters }),
            headers: {
              "content-type": "application/json",
            },
            method: "POST",
          },
        );

      if (isUnauthorizedResponse(requestResponse)) {
        setLoadState("unauthorized");
        return;
      }

      if (requestResponse.code !== 0 || requestResponse.data === null) {
        setRequestErrorMessage(
          formatAdminAiGenerationRequestError(requestResponse),
        );
        setRequestState("error");
        return;
      }

      setLocalContractSummary(requestResponse.data);
      setRequestState("accepted");
      await refreshTaskHistory(sessionToken, ADMIN_AI_GENERATION_HISTORY_PAGE);
    } catch {
      setRequestErrorMessage(providerExecutionCopy.error);
      setRequestState("error");
    }
  }

  async function handleChangeTaskHistoryPage(page: number) {
    const sessionToken = getStoredSessionToken();

    await refreshTaskHistory(sessionToken, page);
  }

  async function handleReviewContentDraft(
    input: ContentAdminReviewActionInput,
  ) {
    const sessionToken = getStoredSessionToken();
    const pendingState =
      input.reviewDecision === "approved" ? "adopting" : "rejecting";

    if (input.reviewDecision === "approved" && input.reviewedDraft == null) {
      setReviewActionStateByResultPublicId((currentState) => ({
        ...currentState,
        [input.resultPublicId]: "error",
      }));
      return;
    }

    setReviewActionStateByResultPublicId((currentState) => ({
      ...currentState,
      [input.resultPublicId]: pendingState,
    }));

    try {
      const reviewResponse =
        await fetchAdminApi<AdminAiGenerationFormalAdoptionResult>(
          getContentAiGenerationFormalAdoptionPath(input.resultPublicId),
          sessionToken,
          {
            body: JSON.stringify({
              reviewDecision: input.reviewDecision,
              reviewerConfirmed: true,
              targetType: input.generationKind,
              ...(input.reviewDecision === "approved"
                ? { reviewedDraft: input.reviewedDraft }
                : {}),
              weakEvidenceConfirmed: input.weakEvidenceConfirmed,
            }),
            headers: {
              "content-type": "application/json",
            },
            method: "POST",
          },
        );

      if (isUnauthorizedResponse(reviewResponse)) {
        setLoadState("unauthorized");
        return;
      }

      if (reviewResponse.code !== 0 || reviewResponse.data === null) {
        setReviewActionStateByResultPublicId((currentState) => ({
          ...currentState,
          [input.resultPublicId]: "error",
        }));
        return;
      }

      setReviewActionStateByResultPublicId((currentState) => ({
        ...currentState,
        [input.resultPublicId]:
          input.reviewDecision === "approved" ? "adopted" : "rejected",
      }));
      await refreshTaskHistory(sessionToken, ADMIN_AI_GENERATION_HISTORY_PAGE);
    } catch {
      setReviewActionStateByResultPublicId((currentState) => ({
        ...currentState,
        [input.resultPublicId]: "error",
      }));
    }
  }

  async function handleCopyOrganizationAiResultToTrainingDraft(
    input: OrganizationAiTrainingDraftCopyInput,
  ) {
    const generatedResult = input.taskItem.generatedResult;

    if (generatedResult === null) {
      return;
    }

    const resultPublicId = generatedResult.resultPublicId;
    const setCopyActionError = (message: string) => {
      setCopyActionStateByResultPublicId((currentState) => ({
        ...currentState,
        [resultPublicId]: "error",
      }));
      setCopyActionErrorMessageByResultPublicId((currentState) => ({
        ...currentState,
        [resultPublicId]: message,
      }));
    };
    const copyReadiness =
      getOrganizationAiTrainingCopyReadiness(generatedResult);
    const organizationPublicId =
      input.taskItem.organizationPublicId ??
      input.taskItem.organizationOwnedDraftBoundary.organizationPublicId;
    const organizationAuthorizationPublicId =
      adminWorkspaceCapabilitySummary === null
        ? null
        : resolveOrganizationTrainingAuthorizationPublicId(
            adminWorkspaceCapabilitySummary,
          );

    if (
      workspace !== "organization" ||
      adminWorkspaceCapabilitySummary === null ||
      organizationPublicId === null ||
      organizationAuthorizationPublicId === null ||
      copyReadiness === "blocked" ||
      (copyReadiness === "weak_confirmation_required" &&
        input.confirmation !== "weak_confirmed")
    ) {
      setCopyActionError(
        "创建企业训练草稿失败：当前会话缺少可校验的企业授权，请刷新后重试。",
      );
      return;
    }

    const sessionToken = getStoredSessionToken();

    setCopyActionStateByResultPublicId((currentState) => ({
      ...currentState,
      [resultPublicId]: "copying",
    }));
    setCopyActionErrorMessageByResultPublicId((currentState) => {
      const nextState = { ...currentState };
      delete nextState[resultPublicId];
      return nextState;
    });

    try {
      const draftTitle = createOrganizationAiTrainingDraftTitle({
        generationKind: input.taskItem.generationKind,
        requestedAt: input.taskItem.requestedAt,
      });
      const capabilityContext = createOrganizationTrainingCapabilityContext(
        adminWorkspaceCapabilitySummary,
      );
      const draftResponse = await fetchAdminApi<{
        draft: OrganizationTrainingDraftDto;
      }>("/api/v1/organization-trainings", sessionToken, {
        body: JSON.stringify({
          organizationPublicId,
          authorizationPublicId: organizationAuthorizationPublicId,
          sourceTaskPublicId: input.taskItem.taskPublicId,
          profession: generationParameters.profession,
          level: generationParameters.level,
          subject: generationParameters.subject,
          title: draftTitle,
          description:
            "由组织 AI 结果关联创建；发布前需编辑题目、标准答案、解析和资料依据。",
          capabilityContext,
        }),
        headers: {
          "content-type": "application/json",
        },
        method: "POST",
      });

      if (isUnauthorizedResponse(draftResponse)) {
        setLoadState("unauthorized");
        return;
      }

      const draft = draftResponse.data?.draft ?? null;

      if (
        draftResponse.code !== 0 ||
        draft === null ||
        draft.organizationPublicId !== organizationPublicId
      ) {
        setCopyActionError(
          draftResponse.code === 0
            ? "创建企业训练草稿失败：接口返回的草稿不属于当前组织。"
            : formatAdminApiBusinessError(
                draftResponse,
                "创建企业训练草稿失败",
              ),
        );
        return;
      }

      if (draft.sourceTaskPublicId !== input.taskItem.taskPublicId) {
        setCopyActionError(
          "创建企业训练草稿失败：接口返回的草稿未关联当前 AI 任务。",
        );
        return;
      }

      const sourceContextResponse = await fetchAdminApi<{
        context: OrganizationTrainingSourceContextAttachmentDto;
      }>(
        `/api/v1/organization-trainings/${draft.publicId}/source-contexts`,
        sessionToken,
        {
          body: JSON.stringify({
            draftPublicId: draft.publicId,
            organizationPublicId,
            authorizationPublicId: organizationAuthorizationPublicId,
            profession: generationParameters.profession,
            level: generationParameters.level,
            capabilityContext,
            sourceContexts: [
              {
                sourceType: "organization_ai_result",
                sourcePublicId: resultPublicId,
                title: draftTitle,
                profession: generationParameters.profession,
                level: generationParameters.level,
                subject: generationParameters.subject,
                questionCount: generationParameters.questionCount,
                totalScore: generationParameters.questionCount,
                sourceStatus:
                  createOrganizationAiResultSourceStatus(generatedResult),
              },
            ],
          }),
          headers: {
            "content-type": "application/json",
          },
          method: "POST",
        },
      );

      if (isUnauthorizedResponse(sourceContextResponse)) {
        setLoadState("unauthorized");
        return;
      }

      const sourceContext = sourceContextResponse.data?.context ?? null;

      if (
        sourceContextResponse.code !== 0 ||
        sourceContext === null ||
        sourceContext.draftPublicId !== draft.publicId ||
        sourceContext.organizationPublicId !== organizationPublicId
      ) {
        setCopyActionError(
          formatAdminApiBusinessError(
            sourceContextResponse,
            "关联企业训练 AI 来源失败",
          ),
        );
        return;
      }

      setCopyActionStateByResultPublicId((currentState) => ({
        ...currentState,
        [resultPublicId]: "copied",
      }));
    } catch {
      setCopyActionError("创建企业训练草稿失败：请求未完成，请稍后重试。");
    }
  }

  if (loadState === "loading") {
    return <AdminLoadingState label="正在加载 AI 入口" />;
  }

  if (loadState === "unauthorized") {
    return <AdminUnauthorizedState />;
  }

  if (loadState === "permission-denied") {
    return (
      <AdminSurfaceStatus
        description="当前账号没有该后台入口权限，请切换到对应管理员账号。"
        icon={<AlertCircle aria-hidden="true" className="size-5" />}
        state="permission-denied"
        title="无权访问该后台"
      />
    );
  }

  if (loadState === "standard-unavailable") {
    return (
      <AdminUpgradeRequiredState
        description="标准版组织后台不开放 AI出题 或 AI组卷。升级需由运营管理员维护高级版企业授权。"
        returnHref="/organization/portal"
        returnLabel="返回组织概览"
        title="标准版暂不可用"
      />
    );
  }

  if (loadState === "error") {
    return (
      <AdminSurfaceStatus
        description="请刷新页面，或重新登录后再进入 AI 草稿入口。"
        icon={<AlertCircle aria-hidden="true" className="size-5" />}
        state="error"
        title="AI 入口加载失败"
      />
    );
  }

  return (
    <section className="space-y-6" data-testid="admin-ai-generation-entry">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-2">
          <p className="text-brand-primary text-sm font-medium">
            {pageCopy.eyebrow}
          </p>
          <h1 className="font-heading text-text-primary text-2xl font-semibold">
            {pageCopy.title}
          </h1>
          <p className="text-text-secondary max-w-2xl text-sm leading-6">
            {pageCopy.description}
          </p>
        </div>
        <div className="bg-secondary text-secondary-foreground flex size-11 items-center justify-center rounded-md">
          <ShieldCheck aria-hidden="true" className="size-5" />
        </div>
      </header>

      <AdminAiGenerationDetailControls
        generationParameters={generationParameters}
        generationKind={generationKind}
        onChange={handleGenerationParameterChange}
        workspace={workspace}
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <section className="bg-surface border-border rounded-md border p-4 shadow-sm">
          <div className="text-text-primary flex items-center gap-2 text-base font-semibold">
            <WandSparkles aria-hidden="true" className="size-4" />
            <h2>{pageCopy.actionLabel}</h2>
          </div>
          <p className="text-text-secondary mt-3 text-sm leading-6">
            生成入口已就绪，资料充足时可生成预览草稿。
          </p>
          <button
            className="bg-primary text-primary-foreground mt-4 inline-flex h-9 items-center justify-center rounded-md px-3 text-sm font-medium transition-transform active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
            data-testid="admin-ai-generation-submit"
            disabled={requestState === "submitting"}
            type="button"
            onClick={handleSubmitLocalContractRequest}
          >
            {requestState === "submitting" ? "提交中" : pageCopy.actionLabel}
          </button>
        </section>

        <section className="bg-surface border-border rounded-md border p-4 shadow-sm">
          <div className="text-text-primary flex items-center gap-2 text-base font-semibold">
            <FileText aria-hidden="true" className="size-4" />
            <h2>草稿评审</h2>
          </div>
          <p className="text-text-secondary mt-3 text-sm leading-6">
            {pageCopy.boundaryLabel}
          </p>
        </section>

        <section className="bg-surface border-border rounded-md border p-4 shadow-sm">
          <div className="text-text-primary flex items-center gap-2 text-base font-semibold">
            <ShieldCheck aria-hidden="true" className="size-4" />
            <h2>资料依据</h2>
          </div>
          <p className="text-text-secondary mt-3 text-sm leading-6">
            生成前需要匹配本地资料；资料不足时不生成草稿。
          </p>
        </section>
      </div>

      {requestState === "error" ? (
        <section
          className="border-destructive/40 bg-destructive/5 rounded-md border p-4"
          data-testid="admin-ai-generation-local-contract-error"
          role="alert"
        >
          <h2 className="text-text-primary text-sm font-semibold">
            生成请求暂不可用
          </h2>
          <p className="text-text-secondary mt-2 text-sm leading-6">
            {requestErrorMessage ?? providerExecutionCopy.error}
          </p>
        </section>
      ) : null}

      {localContractSummary !== null ? (
        <section
          className="bg-surface border-border rounded-md border p-4 shadow-sm"
          data-testid="admin-ai-generation-local-contract-summary"
        >
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-brand-primary text-xs font-medium">
                草稿已提交
              </p>
              <h2 className="text-text-primary mt-1 text-base font-semibold">
                {getTaskStatusLabel(localContractSummary.resultState.status)}
              </h2>
            </div>
          </div>

          <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <dt className="text-text-secondary">任务状态</dt>
              <dd className="text-text-primary mt-1">
                {getTaskStatusLabel(localContractSummary.resultState.status)}
              </dd>
            </div>
            <div>
              <dt className="text-text-secondary">结果内容</dt>
              <dd className="text-text-primary mt-1">
                {localContractSummary.resultState.resultPublicId === null
                  ? "暂无生成结果"
                  : "已产生结果引用"}
              </dd>
            </div>
            <div>
              <dt className="text-text-secondary">资料依据</dt>
              <dd className="text-text-primary mt-1">
                {localContractSummary.resultState.evidenceStatus ===
                "sufficient"
                  ? "资料充足"
                  : "资料不足"}
              </dd>
            </div>
            <div>
              <dt className="text-text-secondary">
                {providerExecutionCopy.label}
              </dt>
              <dd className="text-text-primary mt-1">
                {localContractSummary.runtimeBridge.providerCallExecuted
                  ? "已执行"
                  : providerExecutionCopy.blocked}
              </dd>
            </div>
          </dl>

          <AdminAiGenerationVisibleGeneratedContent
            localContractSummary={localContractSummary}
          />
        </section>
      ) : null}

      <AdminAiGenerationTaskHistoryPanel
        adminWorkspaceCapabilitySummary={adminWorkspaceCapabilitySummary}
        copyActionErrorMessageByResultPublicId={
          copyActionErrorMessageByResultPublicId
        }
        copyActionStateByResultPublicId={copyActionStateByResultPublicId}
        currentLocalContractSummary={localContractSummary}
        generationParameters={generationParameters}
        generationKind={generationKind}
        onCopyToTrainingDraft={(input) =>
          void handleCopyOrganizationAiResultToTrainingDraft(input)
        }
        onChangePage={(page) => void handleChangeTaskHistoryPage(page)}
        pagination={taskHistoryPagination}
        reviewActionStateByResultPublicId={reviewActionStateByResultPublicId}
        state={historyState}
        taskHistory={taskHistory}
        workspace={workspace}
        onReviewContentDraft={(input) => void handleReviewContentDraft(input)}
      />
    </section>
  );
}
