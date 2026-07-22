"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  FileText,
  LoaderCircle,
  ShieldCheck,
  WandSparkles,
} from "lucide-react";

import { AdminPagination } from "@/components/admin/AdminList";
import {
  AdminToast,
  type AdminFeedback,
} from "@/components/admin/AdminToast/AdminToast";
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
import type { AiGenerationAvailabilityDto } from "@/server/contracts/ai-generation-availability-contract";
import type {
  AdminKnowledgeNodeOpsListDto,
  AdminKnowledgeNodeOpsSummaryDto,
} from "@/server/contracts/admin-content-knowledge-ops-contract";
import type { AuthContextDto } from "@/server/contracts/auth-contract";
import type {
  OrganizationTrainingDraftDto,
  OrganizationTrainingSourceContextAttachmentDto,
} from "@/server/contracts/organization-training-contract";
import type {
  AiGenerationRouteIntegratedGenerationParameters,
  AiGenerationRouteIntegratedKnowledgeNodeMode,
  AiGenerationRouteIntegratedPaperStructure,
  AiGenerationRouteIntegratedProfession,
  AiGenerationRouteIntegratedQuestionTypeDistribution,
  AiGenerationRouteIntegratedSourcePreference,
  AiGenerationRouteIntegratedSubject,
} from "@/server/contracts/route-integrated-provider-execution-contract";
import { createDefaultAiGenerationRouteIntegratedKnowledgeScope } from "@/server/contracts/route-integrated-provider-execution-contract";

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
import { resolveOrganizationWorkspacePageAccess } from "../organization-workspace/admin-organization-workspace-access";
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
type AdminAiGenerationAvailabilityState =
  | "loading"
  | "available"
  | "closed"
  | "error";
type AdminAiGenerationParameterState = {
  generationKind?: AdminAiGenerationKind;
  parameters?: Partial<AiGenerationRouteIntegratedGenerationParameters> | null;
};
type AdminAiKnowledgeNodeLoadState =
  | "idle"
  | "loading"
  | "ready"
  | "empty"
  | "error";
type AdminAiKnowledgeNodeOption = {
  publicId: string;
  label: string;
  description: string;
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
  expectedContentDigest: string;
  generationKind: AdminAiGenerationKind;
  resultPublicId: string;
  reviewDecision: ContentAdminReviewDecision;
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
  checked?: boolean;
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
      title: isQuestionGeneration ? "AI出题工作台" : "AI组卷工作台",
      description: isQuestionGeneration
        ? "设置生成条件，查看待审题目草稿，并在人工评审后进入正式内容流程。"
        : "先生成组卷方案，再从平台正式题库本地选题，确认缺口后进入待审试卷流程。",
      actionLabel: isQuestionGeneration
        ? "生成题目草稿"
        : "生成组卷方案并本地选题",
      boundaryHeading: "草稿评审",
      boundaryLabel: isQuestionGeneration
        ? "待审题目草稿不直接发布正式题目"
        : "待审试卷草稿不直接发布正式试卷",
      evidenceHeading: "资料依据",
      evidenceLabel: "资料依据",
      evidenceDescription: "生成前需要匹配本地资料；资料不足时不生成草稿。",
    };
  }

  return {
    eyebrow: "企业 AI 训练内容",
    title: isQuestionGeneration ? "训练题草稿" : "训练试卷草稿",
    description:
      "为本企业准备训练题目和训练试卷草稿；发布前仍需编辑、预览员工视角并确认范围。",
    actionLabel: isQuestionGeneration ? "生成训练题草稿" : "生成训练试卷草稿",
    boundaryHeading: "训练发布检查",
    boundaryLabel: "这些内容只进入企业训练草稿，不写入平台正式题库或正式试卷。",
    evidenceHeading: "依据资料状态",
    evidenceLabel: "依据资料状态",
    evidenceDescription:
      "生成前会匹配本地资料；资料不足时不生成草稿，资料较少时发布前需要确认。",
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
    approved_for_formal_adoption: "已审核待创建草稿",
    draft_created: "已创建待审草稿",
    rejected: "已驳回",
  } satisfies Record<
    AdminAiGenerationTaskHistoryGeneratedResultDto["formalAdoptionStatus"],
    string
  >;

  return labels[status];
}

function getContentFormalDraftDetailEntry({
  generationKind,
  generatedResult,
}: {
  generationKind: AdminAiGenerationKind;
  generatedResult: AdminAiGenerationTaskHistoryGeneratedResultDto;
}): {
  href: string | null;
  label: string;
  note: string;
} {
  const draftTargetLabel =
    generationKind === "paper" ? "待审试卷草稿" : "待审题目草稿";

  if (generatedResult.formalAdoptionStatus === "draft_created") {
    const targetPublicId =
      generationKind === "paper"
        ? generatedResult.formalPaperPublicId
        : generatedResult.formalQuestionPublicId;

    if (targetPublicId !== null) {
      const queryKey =
        generationKind === "paper" ? "paperPublicId" : "questionPublicId";
      const routePath =
        generationKind === "paper" ? "/content/papers" : "/content/questions";

      return {
        href: `${routePath}?${queryKey}=${encodeURIComponent(targetPublicId)}`,
        label: `查看${draftTargetLabel}`,
        note: "已创建，可进入正式内容草稿详情",
      };
    }

    return {
      href: null,
      label: `查看${draftTargetLabel}`,
      note: "草稿记录暂未返回，请刷新正式内容列表",
    };
  }

  if (generatedResult.formalAdoptionStatus === "approved_for_formal_adoption") {
    return {
      href: null,
      label: `查看${draftTargetLabel}`,
      note: "草稿创建后显示详情入口",
    };
  }

  if (generatedResult.formalAdoptionStatus === "rejected") {
    return {
      href: null,
      label: `查看${draftTargetLabel}`,
      note: "已驳回，未创建待审草稿",
    };
  }

  return {
    href: null,
    label: `查看${draftTargetLabel}`,
    note: "通过评审并创建草稿后显示详情入口",
  };
}

function getOrganizationDraftUsageStatusLabel(
  status: AdminAiGenerationTaskHistoryGeneratedResultDto["formalAdoptionStatus"],
): string {
  const labels = {
    blocked: "未关联训练草稿",
    approved_for_formal_adoption: "已关联训练草稿",
    draft_created: "已关联训练草稿",
    rejected: "已驳回",
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

function formatRequestedAt(requestedAt: string): string {
  return requestedAt.slice(0, 16).replace("T", " ");
}

const contentAdminReviewLocalValidationItems = [
  {
    boundaryStatus: "不直接发布",
    contractStatus: "来源与重复检查",
    validationMode: "发布前校验",
  },
  {
    boundaryStatus: "不足时不可采用",
    contractStatus: "资料依据复核",
    validationMode: "人工确认",
  },
  {
    boundaryStatus: "不展示原始内容",
    contractStatus: "审阅记录",
    validationMode: "只读留痕",
  },
  {
    boundaryStatus: "正式内容不自动写入",
    contractStatus: "发布前校验",
    validationMode: "进入发布流程",
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

const adminKnowledgeNodeModeLabelByValue = {
  balanced: "均衡覆盖",
  comprehensive: "综合测验",
  selected: "指定知识点",
  weak_point_priority: "薄弱知识点优先",
} as const satisfies Record<
  AiGenerationRouteIntegratedKnowledgeNodeMode,
  string
>;

const adminKnowledgeNodeModeValueByLabel = Object.fromEntries(
  Object.entries(adminKnowledgeNodeModeLabelByValue).map(([value, label]) => [
    label,
    value,
  ]),
) as Record<string, AiGenerationRouteIntegratedKnowledgeNodeMode>;

const adminSourcePreferenceLabelByValue = {
  balanced: "均衡使用",
  prefer_enterprise: "优先使用企业题",
  prefer_platform: "优先使用平台题",
} as const satisfies Record<
  AiGenerationRouteIntegratedSourcePreference,
  string
>;

const adminSourcePreferenceValueByLabel = Object.fromEntries(
  Object.entries(adminSourcePreferenceLabelByValue).map(([value, label]) => [
    label,
    value,
  ]),
) as Record<string, AiGenerationRouteIntegratedSourcePreference>;

const adminQuestionTypeDistributionLabelByValue = {
  balanced_40_30_30: "单选 40% / 多选 30% / 判断 30%",
  single_50_multi_25_true_false_25: "单选 50% / 多选 25% / 判断 25%",
  weak_point_priority: "按薄弱项动态分配",
} as const satisfies Record<
  AiGenerationRouteIntegratedQuestionTypeDistribution,
  string
>;

const adminQuestionTypeDistributionValueByLabel = Object.fromEntries(
  Object.entries(adminQuestionTypeDistributionLabelByValue).map(
    ([value, label]) => [label, value],
  ),
) as Record<string, AiGenerationRouteIntegratedQuestionTypeDistribution>;

const adminPaperStructureLabelByValue = {
  by_knowledge_node: "按知识点模块组织",
  by_question_type: "按大题模块组织",
} as const satisfies Record<AiGenerationRouteIntegratedPaperStructure, string>;

const adminPaperStructureValueByLabel = Object.fromEntries(
  Object.entries(adminPaperStructureLabelByValue).map(([value, label]) => [
    label,
    value,
  ]),
) as Record<string, AiGenerationRouteIntegratedPaperStructure>;

const ADMIN_AI_QUESTION_DEFAULT_QUESTION_COUNT = 3;
const ADMIN_AI_QUESTION_MAX_QUESTION_COUNT = 10;
const ADMIN_AI_PAPER_DEFAULT_QUESTION_COUNT = 30;
const ADMIN_AI_PAPER_MAX_QUESTION_COUNT = 80;

function getAdminAiGenerationQuestionCountLimit(
  generationKind: AdminAiGenerationKind,
): number {
  return generationKind === "question"
    ? ADMIN_AI_QUESTION_MAX_QUESTION_COUNT
    : ADMIN_AI_PAPER_MAX_QUESTION_COUNT;
}

function createDefaultAdminGenerationParameters(
  generationKind: AdminAiGenerationKind,
  workspace: AdminAiGenerationWorkspace,
): AiGenerationRouteIntegratedGenerationParameters {
  const isOrganizationWorkspace = workspace === "organization";

  return {
    profession: "marketing",
    level: 3,
    subject: "theory",
    ...createDefaultAiGenerationRouteIntegratedKnowledgeScope({
      sourcePreference:
        generationKind === "paper"
          ? isOrganizationWorkspace
            ? "balanced"
            : "prefer_platform"
          : null,
    }),
    questionType: generationKind === "question" ? "single_choice" : null,
    questionCount:
      generationKind === "question"
        ? ADMIN_AI_QUESTION_DEFAULT_QUESTION_COUNT
        : ADMIN_AI_PAPER_DEFAULT_QUESTION_COUNT,
    difficulty: "medium",
    learningObjective:
      workspace === "organization"
        ? generationKind === "question"
          ? "企业训练巩固"
          : "企业阶段测验"
        : generationKind === "question"
          ? "内容题目评审"
          : "内容试卷评审",
    questionTypeDistribution:
      generationKind === "paper" ? "balanced_40_30_30" : null,
    paperStructure: generationKind === "paper" ? "by_question_type" : null,
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

function parsePositiveCount(
  value: string,
  fallbackValue: number,
  maxValue: number,
): number {
  const parsedCount = Number(value);

  return Number.isInteger(parsedCount) && parsedCount > 0
    ? Math.min(parsedCount, maxValue)
    : fallbackValue;
}

function createAdminAiKnowledgeNodeOptionsPath(input: {
  level: AiGenerationRouteIntegratedGenerationParameters["level"];
  profession: AiGenerationRouteIntegratedGenerationParameters["profession"];
}) {
  const searchParams = new URLSearchParams({
    page: "1",
    pageSize: "100",
    sortBy: "sortOrder",
    sortOrder: "asc",
    status: "active",
    profession: input.profession,
    level: String(input.level),
  });

  return `/api/v1/ai-generation/knowledge-nodes?${searchParams.toString()}`;
}

function isAdminAiKnowledgeNodeVisibleForGenerationParameters(
  knowledgeNode: AdminKnowledgeNodeOpsSummaryDto,
  input: {
    level: AiGenerationRouteIntegratedGenerationParameters["level"];
    profession: AiGenerationRouteIntegratedGenerationParameters["profession"];
  },
): boolean {
  return (
    knowledgeNode.knStatus === "active" &&
    knowledgeNode.isRecommendable &&
    knowledgeNode.profession === input.profession &&
    (knowledgeNode.levelList.length === 0 ||
      knowledgeNode.levelList.includes(input.level))
  );
}

function mapAdminAiKnowledgeNodeOption(
  knowledgeNode: AdminKnowledgeNodeOpsSummaryDto,
): AdminAiKnowledgeNodeOption {
  return {
    publicId: knowledgeNode.publicId,
    label: knowledgeNode.pathName,
    description: `${knowledgeNode.profession} / ${knowledgeNode.levelList.join(", ") || "全等级"}`,
  };
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

function resolveBooleanValue(value: unknown, fallbackValue: boolean) {
  return typeof value === "boolean" ? value : fallbackValue;
}

function resolvePublicIdList(value: unknown, fallbackValue: readonly string[]) {
  if (!Array.isArray(value)) {
    return fallbackValue;
  }

  const publicIds = value.map((item) =>
    typeof item === "string" ? item.trim() : null,
  );

  return publicIds.some(
    (publicId) =>
      publicId === null ||
      publicId === "" ||
      !/^[a-zA-Z0-9][a-zA-Z0-9_-]*$/u.test(publicId),
  )
    ? fallbackValue
    : Array.from(new Set(publicIds as string[]));
}

function resolveKnowledgeNodeMode(
  value: unknown,
  fallbackValue: AiGenerationRouteIntegratedGenerationParameters["knowledgeNodeMode"],
) {
  return value === "balanced" ||
    value === "selected" ||
    value === "weak_point_priority" ||
    value === "comprehensive"
    ? value
    : fallbackValue;
}

function resolveSourcePreference(
  value: unknown,
  fallbackValue: AiGenerationRouteIntegratedGenerationParameters["sourcePreference"],
) {
  return value === null ||
    value === "balanced" ||
    value === "prefer_platform" ||
    value === "prefer_enterprise"
    ? value
    : fallbackValue;
}

function resolveQuestionTypeDistribution(
  value: unknown,
  fallbackValue: AiGenerationRouteIntegratedGenerationParameters["questionTypeDistribution"],
) {
  return value === null ||
    value === "balanced_40_30_30" ||
    value === "single_50_multi_25_true_false_25" ||
    value === "weak_point_priority"
    ? value
    : fallbackValue;
}

function resolvePaperStructure(
  value: unknown,
  fallbackValue: AiGenerationRouteIntegratedGenerationParameters["paperStructure"],
) {
  return value === null ||
    value === "by_question_type" ||
    value === "by_knowledge_node"
    ? value
    : fallbackValue;
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
  const maxQuestionCount =
    getAdminAiGenerationQuestionCountLimit(generationKind);

  if (
    generationParameterState?.generationKind !== generationKind ||
    !isRecord(generationParameterState.parameters)
  ) {
    return defaultParameters;
  }

  const persistedParameters = generationParameterState.parameters;
  const persistedQuestionCount = persistedParameters.questionCount;
  const resolvedKnowledgeNode = resolveNullableText(
    persistedParameters.knowledgeNode,
    defaultParameters.knowledgeNode,
  );
  const resolvedKnowledgeNodeSupplement = resolveNullableText(
    persistedParameters.knowledgeNodeSupplement,
    resolvedKnowledgeNode,
  );

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
    knowledgeNode: resolvedKnowledgeNodeSupplement ?? resolvedKnowledgeNode,
    knowledgeNodeMode: resolveKnowledgeNodeMode(
      persistedParameters.knowledgeNodeMode,
      defaultParameters.knowledgeNodeMode,
    ),
    knowledgeNodePublicIds: resolvePublicIdList(
      persistedParameters.knowledgeNodePublicIds,
      defaultParameters.knowledgeNodePublicIds,
    ),
    includeDescendants: resolveBooleanValue(
      persistedParameters.includeDescendants,
      defaultParameters.includeDescendants,
    ),
    knowledgeNodeSupplement: resolvedKnowledgeNodeSupplement,
    sourcePreference: resolveSourcePreference(
      persistedParameters.sourcePreference,
      defaultParameters.sourcePreference,
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
            maxQuestionCount,
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
    questionTypeDistribution:
      generationKind === "paper"
        ? resolveQuestionTypeDistribution(
            persistedParameters.questionTypeDistribution,
            defaultParameters.questionTypeDistribution,
          )
        : null,
    paperStructure:
      generationKind === "paper"
        ? resolvePaperStructure(
            persistedParameters.paperStructure,
            defaultParameters.paperStructure,
          )
        : null,
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
        max: ADMIN_AI_QUESTION_MAX_QUESTION_COUNT,
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
      max: ADMIN_AI_PAPER_MAX_QUESTION_COUNT,
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
            value:
              adminSourcePreferenceLabelByValue[
                generationParameters.sourcePreference ?? "balanced"
              ],
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
      value:
        adminQuestionTypeDistributionLabelByValue[
          generationParameters.questionTypeDistribution ?? "balanced_40_30_30"
        ],
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
      label: "试卷结构",
      options: ["按大题模块组织", "按知识点模块组织"],
      value:
        adminPaperStructureLabelByValue[
          generationParameters.paperStructure ?? "by_question_type"
        ],
    },
    {
      inputMode: "text",
      label: workspace === "organization" ? "组卷目标" : "评审目标",
      value: generationParameters.learningObjective ?? "",
    },
  ] satisfies readonly AdminAiGenerationDetailControl[];
}

function getAdminAiKnowledgeScopeBlockedReason(
  generationParameters: AiGenerationRouteIntegratedGenerationParameters,
  knowledgeNodeOptions: AdminAiKnowledgeNodeOption[],
  knowledgeNodeLoadState: AdminAiKnowledgeNodeLoadState,
): string | null {
  if (generationParameters.knowledgeNodeMode !== "selected") {
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
    return "当前范围没有可直接选择的知识点，不能使用指定知识点模式。请改用均衡覆盖、薄弱知识点优先或填写补充说明。";
  }

  const knowledgeNodeOptionPublicIds = new Set(
    knowledgeNodeOptions.map((knowledgeNodeOption) => {
      return knowledgeNodeOption.publicId;
    }),
  );

  if (
    generationParameters.knowledgeNodePublicIds.some(
      (publicId) => !knowledgeNodeOptionPublicIds.has(publicId),
    )
  ) {
    return "已选知识点不在当前范围内，请重新选择。";
  }

  if (generationParameters.knowledgeNodePublicIds.length === 0) {
    return "请选择至少一个知识点后再提交。";
  }

  return null;
}

function AdminAiKnowledgeScopePanel({
  generationParameters,
  knowledgeNodeLoadState,
  knowledgeNodeOptions,
  onChange,
}: {
  generationParameters: AiGenerationRouteIntegratedGenerationParameters;
  knowledgeNodeLoadState: AdminAiKnowledgeNodeLoadState;
  knowledgeNodeOptions: AdminAiKnowledgeNodeOption[];
  onChange: (change: AdminAiGenerationDetailControlChange) => void;
}) {
  const blockedReason = getAdminAiKnowledgeScopeBlockedReason(
    generationParameters,
    knowledgeNodeOptions,
    knowledgeNodeLoadState,
  );
  const selectedKnowledgeNodeCount =
    generationParameters.knowledgeNodePublicIds.length;
  const isSelectedMode = generationParameters.knowledgeNodeMode === "selected";

  return (
    <section
      className="border-border bg-muted/40 mt-4 rounded-md border p-3"
      data-testid="admin-ai-knowledge-scope-panel"
    >
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-1">
          <p className="text-brand-primary text-xs font-medium">知识点范围</p>
          <h3 className="text-text-primary text-sm font-semibold">
            结构化覆盖条件
          </h3>
          <p className="text-text-secondary text-xs leading-5">
            指定知识点使用已选择的知识点范围；补充说明只作为软约束，不替代知识点树绑定。
          </p>
        </div>
        <span className="bg-background text-text-secondary rounded-md px-2 py-1 text-xs font-medium">
          已选 {selectedKnowledgeNodeCount} 个
        </span>
      </div>

      <div className="mt-3 grid gap-3 sm:grid-cols-3">
        <label className="block">
          <span className="text-text-secondary text-xs font-medium">
            知识点覆盖
          </span>
          <select
            aria-label="知识点覆盖"
            className={aiGenerationDetailControlClassName}
            value={
              adminKnowledgeNodeModeLabelByValue[
                generationParameters.knowledgeNodeMode
              ]
            }
            onChange={(event) =>
              onChange({
                label: "知识点覆盖",
                value: event.currentTarget.value,
              })
            }
          >
            {Object.values(adminKnowledgeNodeModeLabelByValue).map(
              (optionLabel) => (
                <option key={optionLabel} value={optionLabel}>
                  {optionLabel}
                </option>
              ),
            )}
          </select>
        </label>

        <label className="block">
          <span className="text-text-secondary text-xs font-medium">
            包含下级知识点
          </span>
          <select
            aria-label="包含下级知识点"
            className={aiGenerationDetailControlClassName}
            disabled={!isSelectedMode || selectedKnowledgeNodeCount === 0}
            value={generationParameters.includeDescendants ? "包含" : "不包含"}
            onChange={(event) =>
              onChange({
                label: "包含下级知识点",
                value: event.currentTarget.value,
              })
            }
          >
            <option value="不包含">不包含</option>
            <option value="包含">包含</option>
          </select>
        </label>

        <label className="block">
          <span className="text-text-secondary text-xs font-medium">
            知识点补充说明
          </span>
          <input
            aria-label="知识点补充说明"
            className={aiGenerationDetailControlClassName}
            placeholder="可填写中文软约束"
            type="text"
            value={generationParameters.knowledgeNodeSupplement ?? ""}
            onChange={(event) =>
              onChange({
                label: "知识点补充说明",
                value: event.currentTarget.value,
              })
            }
          />
        </label>
      </div>

      {isSelectedMode && knowledgeNodeLoadState === "loading" ? (
        <div className="border-border bg-background mt-3 rounded-md border px-3 py-3">
          <p className="text-text-primary text-xs font-medium">
            知识点列表加载中
          </p>
          <p className="text-text-secondary mt-1 text-xs leading-5">
            正在按当前专业和等级读取可选知识点。
          </p>
        </div>
      ) : isSelectedMode && knowledgeNodeLoadState === "error" ? (
        <div className="border-border bg-background mt-3 rounded-md border px-3 py-3">
          <p className="text-text-primary text-xs font-medium">
            知识点列表暂不可用
          </p>
          <p className="text-text-secondary mt-1 text-xs leading-5">
            可以改用均衡覆盖，或稍后重试。
          </p>
        </div>
      ) : isSelectedMode && knowledgeNodeOptions.length > 0 ? (
        <div className="mt-3 grid gap-2">
          {knowledgeNodeOptions.map((knowledgeNodeOption) => {
            const isChecked =
              generationParameters.knowledgeNodePublicIds.includes(
                knowledgeNodeOption.publicId,
              );

            return (
              <label
                className="border-border bg-background flex items-start gap-3 rounded-md border p-3 text-xs"
                key={knowledgeNodeOption.publicId}
              >
                <input
                  aria-label={`选择知识点 ${knowledgeNodeOption.label}`}
                  checked={isChecked}
                  className="mt-1 size-4 accent-current"
                  onChange={(event) =>
                    onChange({
                      checked: event.currentTarget.checked,
                      label: "知识点节点",
                      value: knowledgeNodeOption.publicId,
                    })
                  }
                  type="checkbox"
                />
                <span>
                  <span className="text-text-primary block font-medium">
                    {knowledgeNodeOption.label}
                  </span>
                  <span className="text-text-secondary mt-1 block leading-5">
                    {knowledgeNodeOption.description}
                  </span>
                </span>
              </label>
            );
          })}
        </div>
      ) : blockedReason === null ? (
        <p className="text-text-secondary mt-3 text-xs leading-5">
          均衡覆盖、薄弱优先和综合测验会按专业、等级、科目继续收敛。
        </p>
      ) : (
        <p
          className="text-destructive mt-3 text-xs leading-5"
          data-testid="admin-ai-knowledge-scope-disabled-reason"
          role="status"
        >
          {blockedReason}
        </p>
      )}
    </section>
  );
}

function AdminAiGenerationDetailControls({
  generationParameters,
  generationKind,
  knowledgeNodeLoadState,
  knowledgeNodeOptions,
  onChange,
  workspace,
}: {
  generationParameters: AiGenerationRouteIntegratedGenerationParameters;
  generationKind: AdminAiGenerationKind;
  knowledgeNodeLoadState: AdminAiKnowledgeNodeLoadState;
  knowledgeNodeOptions: AdminAiKnowledgeNodeOption[];
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

      <AdminAiKnowledgeScopePanel
        generationParameters={generationParameters}
        knowledgeNodeLoadState={knowledgeNodeLoadState}
        knowledgeNodeOptions={knowledgeNodeOptions}
        onChange={onChange}
      />

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
            ? "待审试卷草稿仍需编辑、驳回、审核和发布校验；系统只从平台正式题库选题。"
            : workspace === "content" && generationKind === "question"
              ? "待审题目草稿仍需编辑、驳回、审核和发布校验。"
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
  const workspace = localContractSummary.workspace;
  const visibleGeneratedContentTitle =
    paperAssembly !== null
      ? getAdminPaperAssemblyContainerLabel(localContractSummary.workspace)
      : visibleQuestionDrafts.length > 0
        ? workspace === "organization"
          ? "企业训练题草稿列表"
          : "待审题目草稿列表"
        : visiblePaperSections.length > 0
          ? workspace === "content"
            ? "待审试卷草稿结构"
            : "生成试卷草稿"
          : "临时展示内容";
  const visibleGeneratedContentStatusLabel =
    workspace === "organization" ? "发布前不可见" : "待人工评审";
  const visibleGeneratedContentEyebrow =
    workspace === "content" ? "本次待审结果" : "本次生成草稿";

  return (
    <section
      className="border-border bg-background mt-4 rounded-md border p-3"
      data-testid="admin-visible-generated-content"
    >
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-brand-primary text-xs font-medium">
            {visibleGeneratedContentEyebrow}
          </p>
          <h3 className="text-text-primary mt-1 text-sm font-semibold">
            {visibleGeneratedContentTitle}
          </h3>
        </div>
        <span className="bg-muted text-text-secondary rounded-md px-2 py-1 text-xs font-medium">
          {visibleGeneratedContentStatusLabel}
        </span>
      </div>
      {visibleQuestionDrafts.length > 0 ? (
        <AdminQuestionDraftList
          questionDrafts={visibleQuestionDrafts}
          workspace={workspace}
        />
      ) : paperAssembly !== null ? (
        <AdminPaperAssemblyContainer
          paperAssembly={paperAssembly}
          workspace={localContractSummary.workspace}
        />
      ) : visiblePaperSections.length > 0 ? (
        <AdminPaperDraftList
          paperSections={visiblePaperSections}
          workspace={workspace}
        />
      ) : (
        <p className="text-text-primary mt-3 text-sm leading-6 whitespace-pre-wrap">
          {visibleGeneratedContentText}
        </p>
      )}
      {visibleGeneratedContent.structuredPreview && paperAssembly === null ? (
        <StructuredPreviewSummary
          structuredPreview={visibleGeneratedContent.structuredPreview}
          workspace={workspace}
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
      : ["编辑草稿", "驳回草稿", "审核通过", "进入发布校验"];

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
  workspace = "content",
}: {
  questionDrafts: AdminVisibleQuestionDraftSummary[];
  testId?: string;
  workspace?: AdminAiGenerationWorkspace;
}) {
  const isOrganizationDraft = workspace === "organization";
  const isContentReviewDraft = workspace === "content";
  const usesBusinessDraftCard = isOrganizationDraft || isContentReviewDraft;

  return (
    <div className="mt-3 space-y-3" data-testid={testId}>
      {questionDrafts.map((questionDraft) => {
        const questionTypeLabel = resolveAdminQuestionDraftQuestionTypeLabel(
          questionDraft.questionType,
        );
        const difficultyLabel = resolveAdminQuestionDraftDifficultyLabel(
          questionDraft.difficulty,
        );
        const knowledgeNodeCount = questionDraft.knowledgeNodeCount ?? 0;
        const metaLabels = usesBusinessDraftCard
          ? [
              questionTypeLabel,
              difficultyLabel,
              knowledgeNodeCount > 0 ? `知识点 ${knowledgeNodeCount}` : null,
            ].filter((metaLabel) => metaLabel !== null)
          : [questionDraft.questionType, questionDraft.difficulty].filter(
              Boolean,
            );

        return (
          <section
            className="border-border bg-muted/40 rounded-md border p-3"
            data-testid="admin-ai-question-draft-card"
            key={questionDraft.draftNumber}
          >
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
              {usesBusinessDraftCard ? (
                <div>
                  <p className="text-brand-primary text-xs font-medium">
                    {isOrganizationDraft ? "企业训练题草稿" : "待审题目草稿"}
                  </p>
                  <h4 className="text-text-primary mt-1 text-sm font-semibold">
                    第 {questionDraft.draftNumber} 题
                  </h4>
                </div>
              ) : (
                <h4 className="text-text-primary text-sm font-semibold">
                  题目 {questionDraft.draftNumber}
                </h4>
              )}
              <span className="bg-background text-text-secondary rounded-md px-2 py-1 text-xs">
                {metaLabels.join(" / ") ||
                  (usesBusinessDraftCard ? "待检查" : "待评审")}
              </span>
            </div>
            <QuestionDraftField
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
            {isOrganizationDraft ? (
              <>
                <QuestionDraftDisclosureField
                  label="标准答案"
                  summaryLabel="查看标准答案"
                  value={questionDraft.standardAnswer}
                />
                <QuestionDraftDisclosureField
                  label="解析"
                  summaryLabel="查看解析"
                  value={questionDraft.analysis}
                />
              </>
            ) : (
              <>
                <QuestionDraftField
                  label="标准答案"
                  value={questionDraft.standardAnswer}
                />
                <QuestionDraftField
                  label="解析"
                  value={questionDraft.analysis}
                />
              </>
            )}
            {questionDraft.knowledgeNodeLabels &&
            questionDraft.knowledgeNodeLabels.length > 0 ? (
              <div className="mt-3">
                <p className="text-text-secondary text-xs font-medium">
                  知识点
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {questionDraft.knowledgeNodeLabels.map(
                    (knowledgeNodeLabel) => (
                      <span
                        className="bg-background text-text-secondary rounded-md px-2 py-1 text-xs"
                        key={knowledgeNodeLabel}
                      >
                        {knowledgeNodeLabel}
                      </span>
                    ),
                  )}
                </div>
              </div>
            ) : null}
          </section>
        );
      })}
    </div>
  );
}

function AdminPaperDraftList({
  paperSections,
  workspace = "content",
}: {
  paperSections: AdminPaperSectionDraftSummary[];
  workspace?: AdminAiGenerationWorkspace;
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
              workspace={workspace}
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

function QuestionDraftDisclosureField({
  label,
  summaryLabel,
  value,
}: {
  label: string;
  summaryLabel: string;
  value?: string;
}) {
  if (!value) {
    return null;
  }

  return (
    <details className="border-border bg-background mt-3 rounded-md border px-2 py-2">
      <summary className="text-text-primary cursor-pointer text-sm font-medium">
        {summaryLabel}
      </summary>
      <div className="mt-2">
        <p className="text-text-secondary text-xs font-medium">{label}</p>
        <p className="text-text-primary mt-2 text-sm leading-6 whitespace-pre-wrap">
          {value}
        </p>
      </div>
    </details>
  );
}

function resolveAdminQuestionDraftQuestionTypeLabel(
  questionType?: string | null,
): string | null {
  if (!questionType) {
    return null;
  }

  return (
    adminQuestionTypeLabelByValue[
      questionType as keyof typeof adminQuestionTypeLabelByValue
    ] ?? questionType
  );
}

function resolveAdminQuestionDraftDifficultyLabel(
  difficulty?: string | null,
): string | null {
  if (!difficulty) {
    return null;
  }

  return (
    adminDifficultyLabelByValue[
      difficulty as keyof typeof adminDifficultyLabelByValue
    ] ?? difficulty
  );
}

function StructuredPreviewSummary({
  structuredPreview,
  workspace = "content",
}: {
  structuredPreview: NonNullable<
    NonNullable<
      AdminAiGenerationLocalContractDto["runtimeBridge"]["visibleGeneratedContent"]
    >["structuredPreview"]
  >;
  workspace?: AdminAiGenerationWorkspace;
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
      <p className="text-text-primary text-xs font-medium">
        {workspace === "organization" ? "草稿概览" : "结构化预览"}
      </p>
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

type ContentAdminGenerationTraceabilityItem = {
  label: string;
  value: string;
};

type ContentAdminGenerationTraceabilitySummary = {
  items: ContentAdminGenerationTraceabilityItem[];
};

function formatContentAdminGenerationRatio(
  actualCount: number | null | undefined,
  requestedCount: number,
): string {
  return `${actualCount ?? 0}/${requestedCount}`;
}

function createContentAdminGenerationTraceabilitySummary({
  generatedResult,
  generationParameters,
  localContractSummary,
}: {
  generatedResult: AdminAiGenerationTaskHistoryGeneratedResultDto;
  generationParameters: AiGenerationRouteIntegratedGenerationParameters;
  localContractSummary: AdminAiGenerationLocalContractDto;
}): ContentAdminGenerationTraceabilitySummary | null {
  const visibleGeneratedContent =
    localContractSummary.runtimeBridge.visibleGeneratedContent;
  const structuredPreview = visibleGeneratedContent?.structuredPreview ?? null;
  const baseItems: ContentAdminGenerationTraceabilityItem[] = [
    {
      label: "知识点范围",
      value:
        adminKnowledgeNodeModeLabelByValue[
          generationParameters.knowledgeNodeMode
        ],
    },
    {
      label: "已选知识点",
      value: `${generationParameters.knowledgeNodePublicIds.length} 个`,
    },
    {
      label: "子级范围",
      value: generationParameters.includeDescendants ? "包含" : "不包含",
    },
    {
      label: "依据状态",
      value: getEvidenceStatusLabel(generatedResult),
    },
    {
      label: "依据数量",
      value: String(generatedResult.citationCount),
    },
  ];

  if (localContractSummary.generationKind === "question") {
    const questionPreview =
      structuredPreview?.kind === "question_set" &&
      structuredPreview.parseStatus === "parsed"
        ? structuredPreview
        : null;

    return {
      items: [
        {
          label: "题型",
          value:
            generationParameters.questionType === null
              ? "未指定"
              : (adminQuestionTypeLabelByValue[
                  generationParameters.questionType as keyof typeof adminQuestionTypeLabelByValue
                ] ?? "未指定"),
        },
        {
          label: "题量",
          value: formatContentAdminGenerationRatio(
            questionPreview?.actualQuestionCount,
            generationParameters.questionCount,
          ),
        },
        ...baseItems,
      ],
    };
  }

  const paperAssembly = localContractSummary.paperAssembly;
  const paperPreview =
    structuredPreview?.kind === "paper_draft" &&
    structuredPreview.parseStatus === "parsed"
      ? structuredPreview
      : null;
  const selectedQuestionCount =
    paperAssembly?.container.selectedQuestionCount ??
    paperPreview?.questionCount;
  const requestedQuestionCount =
    paperAssembly?.container.requestedQuestionCount ??
    generationParameters.questionCount;
  const actualPaperSectionCount =
    paperAssembly?.container.sections.length ?? paperPreview?.paperSectionCount;
  const expectedPaperSectionCount =
    paperPreview?.paperSectionCount ?? actualPaperSectionCount ?? 0;
  const platformSourceCount =
    paperAssembly?.container.sourceComposition.platformFormalQuestionCount ?? 0;
  const enterpriseSourceCount =
    paperAssembly?.container.sourceComposition
      .enterpriseTrainingSnapshotCount ?? 0;
  const sourceLabels = [
    platformSourceCount > 0 ? `平台正式题库 ${platformSourceCount} 题` : null,
    enterpriseSourceCount > 0
      ? `本企业已发布训练题 ${enterpriseSourceCount} 题`
      : null,
  ].filter((sourceLabel) => sourceLabel !== null);

  return {
    items: [
      {
        label: "题型分布",
        value:
          adminQuestionTypeDistributionLabelByValue[
            generationParameters.questionTypeDistribution ?? "balanced_40_30_30"
          ],
      },
      {
        label: "试卷结构",
        value:
          adminPaperStructureLabelByValue[
            generationParameters.paperStructure ?? "by_question_type"
          ],
      },
      {
        label: "题量",
        value: formatContentAdminGenerationRatio(
          selectedQuestionCount,
          requestedQuestionCount,
        ),
      },
      {
        label: "大题数",
        value: formatContentAdminGenerationRatio(
          actualPaperSectionCount,
          expectedPaperSectionCount,
        ),
      },
      {
        label: "题源",
        value: sourceLabels.join("，") || "题源不足",
      },
      ...baseItems,
    ],
  };
}

function ContentAdminGenerationTraceabilitySummaryPanel({
  summary,
}: {
  summary: ContentAdminGenerationTraceabilitySummary;
}) {
  return (
    <section
      className="border-border bg-muted/40 mt-3 rounded-md border p-3"
      data-testid="content-admin-generation-traceability-summary"
    >
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-brand-primary text-xs font-medium">
            参数与依据追溯
          </p>
          <h5 className="text-text-primary mt-1 text-sm font-semibold">
            本次生成执行摘要
          </h5>
        </div>
        <span className="bg-background text-text-secondary rounded-md px-2 py-1 text-xs font-medium">
          脱敏摘要
        </span>
      </div>
      <dl className="mt-3 grid gap-2 text-xs sm:grid-cols-2 lg:grid-cols-4">
        {summary.items.map((item) => (
          <div
            className="border-border bg-background rounded-md border p-2"
            key={item.label}
          >
            <dt className="text-text-secondary">{item.label}</dt>
            <dd className="text-text-primary mt-1">{item.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

function AdminAiGenerationTaskHistoryPanel({
  adminWorkspaceCapabilitySummary,
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
            最近生成记录
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
            const currentContentAdminTraceabilitySummary =
              workspace === "content" &&
              taskItem.generatedResult !== null &&
              currentLocalContractSummary?.generatedResult.resultPublicId ===
                taskItem.generatedResult.resultPublicId
                ? createContentAdminGenerationTraceabilitySummary({
                    generatedResult: taskItem.generatedResult,
                    generationParameters,
                    localContractSummary: currentLocalContractSummary,
                  })
                : null;

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
                      {workspace === "organization" ? "训练草稿" : "采纳状态"}
                    </dt>
                    <dd className="text-text-primary mt-1">
                      {boundaryCopy.formalStatus}
                    </dd>
                  </div>
                </dl>

                {taskItem.generatedResult !== null ? (
                  <div className="border-border bg-muted/40 mt-3 rounded-md border p-3">
                    <p className="text-brand-primary text-xs font-medium">
                      {workspace === "organization"
                        ? "训练草稿摘要"
                        : "内容评审摘要"}
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
                        <dt className="text-text-secondary">
                          {workspace === "organization"
                            ? "依据资料状态"
                            : "采用依据状态"}
                        </dt>
                        <dd className="text-text-primary mt-1">
                          {getEvidenceStatusLabel(taskItem.generatedResult)}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-text-secondary">
                          {workspace === "organization"
                            ? "依据条数"
                            : "依据数量"}
                        </dt>
                        <dd className="text-text-primary mt-1">
                          {taskItem.generatedResult.citationCount}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-text-secondary">
                          {workspace === "organization"
                            ? "训练草稿"
                            : "内容采纳"}
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
                        traceabilitySummary={
                          currentContentAdminTraceabilitySummary
                        }
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

      {pagination !== null ? (
        <div className="mt-4">
          <AdminPagination
            itemLabel="条任务"
            page={pagination.page}
            pageSize={pagination.pageSize}
            total={pagination.total}
            onPageChange={state === "loading" ? () => undefined : onChangePage}
          />
        </div>
      ) : null}
    </section>
  );
}

function OrganizationAiGenerationDraftNextStepPanel({
  actionState,
  adminWorkspaceCapabilitySummary,
  generationParameters,
  taskItem,
  onCopyToTrainingDraft,
}: {
  actionState: OrganizationAiTrainingDraftCopyState;
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
  const actionMessage =
    resolveOrganizationAiTrainingDraftCopyActionMessage(actionState);
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
            创建企业训练草稿
          </h4>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            className="bg-primary text-primary-foreground inline-flex h-8 items-center justify-center rounded-md px-3 text-xs font-medium transition-transform active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
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
          <a
            className="border-border text-text-secondary hover:bg-muted inline-flex h-8 items-center justify-center rounded-md border px-3 text-xs font-medium transition-transform active:scale-[0.98]"
            href="/organization/organization-training"
          >
            进入企业训练配置
          </a>
        </div>
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
        <span className="text-text-secondary w-full text-xs">
          进入企业训练草稿后可继续：
        </span>
        {draftActionLabels.map((draftActionLabel) => (
          <span
            className="bg-muted text-text-secondary rounded-md px-2 py-1 text-xs font-medium"
            key={draftActionLabel}
          >
            {draftActionLabel}
          </span>
        ))}
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
): string | null {
  if (actionState === "copying") {
    return "正在创建企业训练草稿";
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
  traceabilitySummary,
  onReviewContentDraft,
}: {
  actionState: ContentAdminReviewActionState;
  generationKind: AdminAiGenerationKind;
  generatedResult: AdminAiGenerationTaskHistoryGeneratedResultDto;
  reviewedDraft: AdminAiGenerationFormalReviewedDraftPayload | null;
  resultPublicId: string;
  traceabilitySummary: ContentAdminGenerationTraceabilitySummary | null;
  onReviewContentDraft: (input: ContentAdminReviewActionInput) => void;
}) {
  const isSubmitting =
    actionState === "adopting" || actionState === "rejecting";
  const reviewReadiness = getContentAdminReviewReadiness(generatedResult);
  const hasReviewedDraft = reviewedDraft !== null;
  const isPersistedAdopted =
    generatedResult.formalAdoptionStatus === "draft_created" ||
    generatedResult.formalAdoptionStatus === "approved_for_formal_adoption";
  const isPersistedRejected =
    generatedResult.formalAdoptionStatus === "rejected";
  const isCompleted =
    actionState === "adopted" ||
    actionState === "rejected" ||
    isPersistedAdopted ||
    isPersistedRejected;
  const actionMessage =
    resolveContentAdminReviewActionMessage(actionState) ??
    (isPersistedAdopted
      ? generatedResult.formalAdoptionStatus === "draft_created"
        ? "待审草稿已创建；正式发布仍需审核和发布校验。"
        : "草稿已审核采用；待审草稿创建仍需后续处理。"
      : isPersistedRejected
        ? "草稿驳回已提交；生成结果不会写入正式内容。"
        : null);
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
  const persistedAdoptionRequirementLabel = isPersistedAdopted
    ? generatedResult.formalAdoptionStatus === "draft_created"
      ? "已创建待审草稿"
      : "已审核待创建草稿"
    : isPersistedRejected
      ? "已驳回"
      : null;
  const adoptionRequirementLabel =
    persistedAdoptionRequirementLabel ??
    (!hasReviewedDraft && reviewReadiness !== "blocked"
      ? "需本次结构化草稿"
      : reviewReadiness === "ready"
        ? "可创建待审草稿"
        : reviewReadiness === "weak_confirmation_required"
          ? "需人工确认"
          : "不可采用");
  const draftTargetLabel =
    generationKind === "paper" ? "待审试卷草稿" : "待审题目草稿";
  const persistedAdoptActionLabel =
    isPersistedAdopted &&
    generatedResult.formalAdoptionStatus === "draft_created"
      ? `已创建${draftTargetLabel}`
      : isPersistedAdopted
        ? `已审核${draftTargetLabel}`
        : null;
  const adoptActionLabel =
    persistedAdoptActionLabel ??
    (actionState === "adopted"
      ? `已创建${draftTargetLabel}`
      : !hasReviewedDraft && reviewReadiness !== "blocked"
        ? "需本次结构化草稿"
        : reviewReadiness === "weak_confirmation_required"
          ? `确认资料较少并采用到${draftTargetLabel}`
          : `采用到${draftTargetLabel}`);
  const nextActionLabels =
    generationKind === "paper"
      ? ["编辑草稿", "驳回草稿", "采用到内容草稿", "进入发布校验"]
      : ["编辑草稿", "驳回草稿", "采用到内容草稿", "进入发布校验"];
  const formalDraftDetailEntry = getContentFormalDraftDetailEntry({
    generationKind,
    generatedResult,
  });

  return (
    <section
      className="border-border bg-background mt-3 rounded-md border p-3"
      data-testid="content-admin-review-traceability"
    >
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-brand-primary text-xs font-medium">评审留痕</p>
          <h4 className="text-text-primary mt-1 text-sm font-semibold">
            审阅、采纳与驳回
          </h4>
        </div>
        <span className="bg-muted text-text-secondary rounded-md px-2 py-1 text-xs font-medium">
          正式发布需审核
        </span>
      </div>

      <dl className="mt-3 grid gap-2 text-xs sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <dt className="text-text-secondary">评审状态</dt>
          <dd className="text-text-primary mt-1">
            {isPersistedAdopted
              ? "已采用"
              : isPersistedRejected
                ? "已驳回"
                : "待评审"}
          </dd>
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
          <dt className="text-text-secondary">下一步处理</dt>
          <dd className="text-text-primary mt-1">{adoptionRequirementLabel}</dd>
        </div>
      </dl>

      {traceabilitySummary === null ? null : (
        <ContentAdminGenerationTraceabilitySummaryPanel
          summary={traceabilitySummary}
        />
      )}

      <section
        className="border-border bg-muted/40 mt-3 rounded-md border p-3"
        data-testid="content-admin-review-batch-retry-diff-history-local-validation"
      >
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-brand-primary text-xs font-medium">发布前校验</p>
            <h5 className="text-text-primary mt-1 text-sm font-semibold">
              先完成审阅，再进入发布校验
            </h5>
          </div>
          <span className="bg-muted text-text-secondary rounded-md px-2 py-1 text-xs font-medium">
            不直接发布
          </span>
        </div>

        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {contentAdminReviewLocalValidationItems.map((item) => (
            <dl
              className="border-border bg-background rounded-md border p-2 text-xs"
              key={item.contractStatus}
            >
              <div>
                <dt className="text-text-secondary">检查项</dt>
                <dd className="text-text-primary mt-1">
                  {item.contractStatus}
                </dd>
              </div>
              <div className="mt-2">
                <dt className="text-text-secondary">处理方式</dt>
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

      <div
        className="border-border bg-muted/40 mt-3 rounded-md border p-3"
        data-testid="content-admin-formal-draft-detail-entry"
      >
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-brand-primary text-xs font-medium">草稿详情</p>
            <p className="text-text-secondary mt-1 text-xs">
              {formalDraftDetailEntry.note}
            </p>
          </div>
          {formalDraftDetailEntry.href === null ? (
            <span className="bg-muted text-text-secondary inline-flex h-8 items-center justify-center rounded-md px-3 text-xs font-medium">
              {formalDraftDetailEntry.label}
            </span>
          ) : (
            <a
              className="border-border text-text-primary inline-flex h-8 items-center justify-center rounded-md border px-3 text-xs font-medium transition-transform active:scale-[0.98]"
              href={formalDraftDetailEntry.href}
            >
              {formalDraftDetailEntry.label}
            </a>
          )}
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <button
          className="border-border text-text-secondary inline-flex h-8 items-center justify-center rounded-md border px-3 text-xs font-medium transition-transform active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
          data-testid="content-admin-review-adopt-action"
          disabled={isAdoptActionDisabled}
          type="button"
          onClick={() =>
            onReviewContentDraft({
              expectedContentDigest: generatedResult.contentDigest,
              generationKind,
              resultPublicId,
              reviewDecision: "approved",
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
              expectedContentDigest: generatedResult.contentDigest,
              generationKind,
              resultPublicId,
              reviewDecision: "rejected",
            })
          }
        >
          {actionState === "rejected" || isPersistedRejected
            ? "已提交驳回"
            : "驳回草稿"}
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

function ContentAiAdoptionLifecycleBand({
  generationKind,
}: {
  generationKind: AdminAiGenerationKind;
}) {
  const isPaperGeneration = generationKind === "paper";
  const flowLabel = isPaperGeneration
    ? "计划生成 -> 本地选题 -> 待审试卷草稿 -> 人工审阅"
    : "生成草稿 -> 待审题目草稿 -> 人工审阅 -> 发布校验";
  const publishBoundaryLabel = isPaperGeneration
    ? "不直接发布正式试卷"
    : "不直接发布正式题目";

  return (
    <section
      className="border-border bg-surface rounded-md border p-4 shadow-sm"
      data-testid="content-ai-adoption-lifecycle-band"
    >
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-1">
          <p className="text-brand-primary text-xs font-medium">
            内容 AI 采纳链路
          </p>
          <h2 className="text-text-primary text-base font-semibold">
            {flowLabel}
          </h2>
          <p className="text-text-secondary text-sm leading-6">
            {publishBoundaryLabel}
            ；资料不足时不创建草稿，采用后仍需人工审核和发布校验。
          </p>
        </div>
        <dl className="grid gap-2 text-xs sm:grid-cols-3">
          <ContentAiLifecycleMetric label="来源" value="内容评审池" />
          <ContentAiLifecycleMetric
            label="题源"
            value={isPaperGeneration ? "平台正式题库" : "待审题目草稿"}
          />
          <ContentAiLifecycleMetric label="闭环" value="编辑 / 驳回 / 审核" />
        </dl>
      </div>
    </section>
  );
}

function ContentAiLifecycleMetric({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="bg-muted/40 border-border rounded-md border px-3 py-2">
      <dt className="text-text-secondary">{label}</dt>
      <dd className="text-text-primary mt-1 font-semibold">{value}</dd>
    </div>
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
  const [generationAvailabilityState, setGenerationAvailabilityState] =
    useState<AdminAiGenerationAvailabilityState>("loading");
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
  const [organizationTrainingFeedback, setOrganizationTrainingFeedback] =
    useState<AdminFeedback | null>(null);
  const [adminWorkspaceCapabilitySummary, setAdminWorkspaceCapabilitySummary] =
    useState<AdminWorkspaceCapabilitySummary | null>(null);
  const [adminAiKnowledgeNodeOptions, setAdminAiKnowledgeNodeOptions] =
    useState<AdminAiKnowledgeNodeOption[]>([]);
  const [adminAiKnowledgeNodeLoadState, setAdminAiKnowledgeNodeLoadState] =
    useState<AdminAiKnowledgeNodeLoadState>("idle");
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
  const activeAdminAiKnowledgeNodeOptions = useMemo(() => {
    return generationParameters.knowledgeNodeMode === "selected"
      ? adminAiKnowledgeNodeOptions
      : [];
  }, [adminAiKnowledgeNodeOptions, generationParameters.knowledgeNodeMode]);
  const activeAdminAiKnowledgeNodeLoadState: AdminAiKnowledgeNodeLoadState =
    generationParameters.knowledgeNodeMode === "selected"
      ? adminAiKnowledgeNodeLoadState
      : "idle";
  const knowledgeScopeBlockedReason = getAdminAiKnowledgeScopeBlockedReason(
    generationParameters,
    activeAdminAiKnowledgeNodeOptions,
    activeAdminAiKnowledgeNodeLoadState,
  );
  const isSubmitDisabled =
    generationAvailabilityState !== "available" ||
    requestState === "submitting" ||
    knowledgeScopeBlockedReason !== null;

  function handleGenerationParameterChange({
    checked,
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
              includeDescendants: false,
              knowledgeNodePublicIds: [],
            },
          };
        case "等级":
          return {
            generationKind,
            parameters: {
              ...currentParameters,
              level: parseLevelLabel(value),
              includeDescendants: false,
              knowledgeNodePublicIds: [],
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
        case "知识点覆盖": {
          const knowledgeNodeMode =
            adminKnowledgeNodeModeValueByLabel[value] ??
            currentParameters.knowledgeNodeMode;

          return {
            generationKind,
            parameters: {
              ...currentParameters,
              knowledgeNodeMode,
              knowledgeNodePublicIds:
                knowledgeNodeMode === "selected"
                  ? currentParameters.knowledgeNodePublicIds
                  : [],
              includeDescendants:
                knowledgeNodeMode === "selected"
                  ? currentParameters.includeDescendants
                  : false,
            },
          };
        }
        case "包含下级知识点":
          return {
            generationKind,
            parameters: {
              ...currentParameters,
              includeDescendants: value === "包含",
            },
          };
        case "知识点补充说明":
          return {
            generationKind,
            parameters: {
              ...currentParameters,
              knowledgeNode: value.trim().length === 0 ? null : value.trim(),
              knowledgeNodeSupplement:
                value.trim().length === 0 ? null : value.trim(),
            },
          };
        case "知识点节点": {
          const knowledgeNodePublicIds =
            checked === true
              ? Array.from(
                  new Set([...currentParameters.knowledgeNodePublicIds, value]),
                )
              : currentParameters.knowledgeNodePublicIds.filter(
                  (publicId) => publicId !== value,
                );

          return {
            generationKind,
            parameters: {
              ...currentParameters,
              includeDescendants:
                knowledgeNodePublicIds.length > 0 &&
                currentParameters.includeDescendants,
              knowledgeNodePublicIds,
            },
          };
        }
        case "题源偏好":
          return {
            generationKind,
            parameters: {
              ...currentParameters,
              sourcePreference:
                adminSourcePreferenceValueByLabel[value] ??
                currentParameters.sourcePreference,
            },
          };
        case "题型分布":
          return {
            generationKind,
            parameters: {
              ...currentParameters,
              questionTypeDistribution:
                adminQuestionTypeDistributionValueByLabel[value] ??
                currentParameters.questionTypeDistribution,
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
                getAdminAiGenerationQuestionCountLimit(generationKind),
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
        case "试卷结构":
          return {
            generationKind,
            parameters: {
              ...currentParameters,
              paperStructure:
                adminPaperStructureValueByLabel[value] ??
                currentParameters.paperStructure,
            },
          };
        case "学习目标":
        case "训练目标":
        case "评审目标":
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

  const refreshGenerationAvailability = useCallback(
    async (sessionToken: string | null) => {
      setGenerationAvailabilityState("loading");

      try {
        const response = await fetchAdminApi<AiGenerationAvailabilityDto>(
          "/api/v1/ai-generation/availability",
          sessionToken,
          { method: "GET" },
        );

        if (isUnauthorizedResponse(response)) {
          setLoadState("unauthorized");
          setGenerationAvailabilityState("error");
          return "unauthorized" as const;
        }

        const generationAvailability =
          response.code === 0 && response.data !== null
            ? response.data.generationAvailability
            : null;

        if (
          generationAvailability !== "available" &&
          generationAvailability !== "closed"
        ) {
          setGenerationAvailabilityState("error");
          return "ready" as const;
        }

        setGenerationAvailabilityState(generationAvailability);
        return "ready" as const;
      } catch {
        setGenerationAvailabilityState("error");
        return "ready" as const;
      }
    },
    [],
  );

  useEffect(() => {
    let isActive = true;
    const requestLevel = generationParameters.level;
    const requestProfession = generationParameters.profession;

    if (
      loadState !== "ready" ||
      generationParameters.knowledgeNodeMode !== "selected"
    ) {
      return () => {
        isActive = false;
      };
    }

    async function loadKnowledgeNodeOptions() {
      setAdminAiKnowledgeNodeOptions([]);
      setAdminAiKnowledgeNodeLoadState("loading");

      try {
        const response = await fetchAdminApi<AdminKnowledgeNodeOpsListDto>(
          createAdminAiKnowledgeNodeOptionsPath({
            level: requestLevel,
            profession: requestProfession,
          }),
          getStoredSessionToken(),
          { method: "GET" },
        );

        if (!isActive) {
          return;
        }

        if (
          isUnauthorizedResponse(response) ||
          response.code !== 0 ||
          response.data === null
        ) {
          setAdminAiKnowledgeNodeOptions([]);
          setAdminAiKnowledgeNodeLoadState("error");
          return;
        }

        const options = response.data.knowledgeNodes
          .filter((knowledgeNode) =>
            isAdminAiKnowledgeNodeVisibleForGenerationParameters(
              knowledgeNode,
              {
                level: requestLevel,
                profession: requestProfession,
              },
            ),
          )
          .map(mapAdminAiKnowledgeNodeOption);

        setAdminAiKnowledgeNodeOptions(options);
        setAdminAiKnowledgeNodeLoadState(
          options.length === 0 ? "empty" : "ready",
        );
      } catch {
        if (isActive) {
          setAdminAiKnowledgeNodeOptions([]);
          setAdminAiKnowledgeNodeLoadState("error");
        }
      }
    }

    void loadKnowledgeNodeOptions();

    return () => {
      isActive = false;
    };
  }, [
    generationParameters.knowledgeNodeMode,
    generationParameters.profession,
    generationParameters.level,
    loadState,
  ]);

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

        const availabilityLoadState =
          await refreshGenerationAvailability(sessionToken);

        if (!isActive || availabilityLoadState === "unauthorized") {
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
  }, [
    generationKind,
    refreshGenerationAvailability,
    refreshTaskHistory,
    workspace,
  ]);

  async function handleSubmitLocalContractRequest() {
    if (generationAvailabilityState !== "available") {
      return;
    }

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
              expectedContentDigest: input.expectedContentDigest,
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

      const persistedReviewDecision =
        reviewResponse.data.adoption.review.reviewDecision;
      setReviewActionStateByResultPublicId((currentState) => ({
        ...currentState,
        [input.resultPublicId]:
          persistedReviewDecision === "approved" ? "adopted" : "rejected",
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
      setOrganizationTrainingFeedback({
        message,
        title: "企业训练草稿创建失败",
        tone: "error",
      });
    };
    const copyReadiness =
      getOrganizationAiTrainingCopyReadiness(generatedResult);
    const organizationPublicId =
      input.taskItem.organizationPublicId ??
      input.taskItem.organizationOwnedDraftBoundary.organizationPublicId;
    if (
      workspace !== "organization" ||
      adminWorkspaceCapabilitySummary === null ||
      organizationPublicId === null ||
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
    setOrganizationTrainingFeedback(null);

    try {
      const copyResponse = await fetchAdminApi<{
        persistenceStatus: "created" | "reused";
        draft: OrganizationTrainingDraftDto;
        context: OrganizationTrainingSourceContextAttachmentDto;
      }>("/api/v1/organization-trainings/ai-result-copies", sessionToken, {
        body: JSON.stringify({
          organizationPublicId,
          sourceTaskPublicId: input.taskItem.taskPublicId,
          sourceResultPublicId: resultPublicId,
          weakEvidenceConfirmed: input.confirmation === "weak_confirmed",
        }),
        headers: {
          "content-type": "application/json",
        },
        method: "POST",
      });

      if (isUnauthorizedResponse(copyResponse)) {
        setLoadState("unauthorized");
        return;
      }

      const copy = copyResponse.data ?? null;

      if (
        copyResponse.code !== 0 ||
        copy === null ||
        copy.draft.organizationPublicId !== organizationPublicId ||
        copy.draft.sourceTaskPublicId !== input.taskItem.taskPublicId ||
        copy.context.draftPublicId !== copy.draft.publicId ||
        copy.context.organizationPublicId !== organizationPublicId
      ) {
        setCopyActionError(
          copyResponse.code === 0
            ? "创建企业训练草稿失败：接口返回的来源链路不一致。"
            : formatAdminApiBusinessError(copyResponse, "创建企业训练草稿失败"),
        );
        return;
      }

      setCopyActionStateByResultPublicId((currentState) => ({
        ...currentState,
        [resultPublicId]: "copied",
      }));
      setOrganizationTrainingFeedback({
        message:
          "已创建企业训练草稿并关联本次 AI 任务；发布前仍需编辑、预览和校验。",
        title: "企业训练草稿已创建",
        tone: "success",
      });
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
      {organizationTrainingFeedback === null ? null : (
        <AdminToast
          feedback={organizationTrainingFeedback}
          onDismiss={() => setOrganizationTrainingFeedback(null)}
        />
      )}
      <header
        className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between"
        data-testid="admin-ai-generation-zone-context"
      >
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

      {generationAvailabilityState === "closed" ? (
        <section
          aria-live="polite"
          className="border-border bg-muted text-text-primary rounded-md border px-4 py-3"
          data-testid="admin-ai-generation-availability"
          role="status"
        >
          <h2 className="text-sm font-semibold">AI 生成服务当前未开放</h2>
          <p className="text-text-secondary mt-1 text-sm leading-6">
            当前无法发起新的生成任务，已有任务记录仍可查看。
          </p>
        </section>
      ) : generationAvailabilityState === "error" ? (
        <section
          aria-live="polite"
          className="border-border bg-muted text-text-primary rounded-md border px-4 py-3"
          data-testid="admin-ai-generation-availability"
          role="status"
        >
          <h2 className="text-sm font-semibold">AI 生成服务状态暂不可用</h2>
          <p className="text-text-secondary mt-1 text-sm leading-6">
            暂不能确认生成能力，请稍后刷新；当前不会提交生成任务。
          </p>
        </section>
      ) : null}

      <nav
        aria-label="工作台视图"
        className="border-border flex flex-wrap items-center gap-2 border-b pb-3"
        data-testid="admin-ai-generation-zone-mode"
      >
        <span className="text-text-secondary mr-2 text-sm font-medium">
          {getGenerationKindLabel(generationKind)}
        </span>
        <a
          className="border-border bg-surface text-text-primary hover:bg-muted rounded-md border px-3 py-2 text-sm font-medium"
          href="#generation-conditions"
        >
          生成条件
        </a>
        <a
          className="border-border bg-surface text-text-primary hover:bg-muted rounded-md border px-3 py-2 text-sm font-medium"
          href="#current-result-review"
        >
          本次结果与评审
        </a>
        <a
          className="border-border bg-surface text-text-primary hover:bg-muted rounded-md border px-3 py-2 text-sm font-medium"
          href="#generation-history"
        >
          任务记录
        </a>
      </nav>

      <section
        className="space-y-4"
        data-testid="admin-ai-generation-zone-parameters"
        id="generation-conditions"
      >
        <AdminAiGenerationDetailControls
          generationParameters={generationParameters}
          generationKind={generationKind}
          knowledgeNodeLoadState={activeAdminAiKnowledgeNodeLoadState}
          knowledgeNodeOptions={activeAdminAiKnowledgeNodeOptions}
          onChange={handleGenerationParameterChange}
          workspace={workspace}
        />
        <section className="bg-surface border-border flex flex-col gap-4 rounded-md border p-4 shadow-sm lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0">
            <div className="text-text-primary flex items-center gap-2 text-base font-semibold">
              <WandSparkles aria-hidden="true" className="size-4" />
              <h2>开始生成</h2>
            </div>
            <p className="text-text-secondary mt-2 max-w-3xl text-sm leading-6">
              {knowledgeScopeBlockedReason ??
                (workspace === "content" && generationKind === "paper"
                  ? "AI 先生成组卷方案，系统再从平台正式题库本地选题；缺口会明确提示，不生成正式题目正文。"
                  : "生成入口已就绪，资料充足时可生成预览草稿。")}
            </p>
          </div>
          <button
            className="bg-primary text-primary-foreground inline-flex h-9 shrink-0 items-center justify-center rounded-md px-3 text-sm font-medium transition-transform active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
            data-testid="admin-ai-generation-submit"
            disabled={isSubmitDisabled}
            type="button"
            onClick={handleSubmitLocalContractRequest}
          >
            {requestState === "submitting" ? "提交中" : pageCopy.actionLabel}
          </button>
        </section>
      </section>

      {workspace === "content" ? (
        <ContentAiAdoptionLifecycleBand generationKind={generationKind} />
      ) : null}

      <section
        className="bg-surface border-border rounded-md border p-4 shadow-sm"
        data-testid="admin-ai-generation-zone-boundary"
      >
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="text-text-primary flex items-center gap-2 text-base font-semibold">
            <FileText aria-hidden="true" className="size-4" />
            <h2>{pageCopy.boundaryHeading}</h2>
          </div>
          <div className="text-text-primary flex items-center gap-2 text-base font-semibold lg:col-start-2">
            <ShieldCheck aria-hidden="true" className="size-4" />
            <h2>{pageCopy.evidenceHeading}</h2>
          </div>
          <p className="text-text-secondary text-sm leading-6">
            {pageCopy.boundaryLabel}
          </p>
          <p className="text-text-secondary text-sm leading-6">
            {pageCopy.evidenceDescription}
          </p>
        </div>
      </section>

      <div
        className="space-y-4"
        data-testid="admin-ai-generation-zone-result-history"
      >
        <section className="space-y-4" id="current-result-review">
          <div>
            <p className="text-brand-primary text-xs font-medium">当前任务</p>
            <h2 className="text-text-primary mt-1 text-lg font-semibold">
              本次结果与评审
            </h2>
            <p className="text-text-secondary mt-1 text-sm leading-6">
              查看本次生成结果、资料依据和人工评审状态。
            </p>
          </div>

          {requestState === "error" ? (
            <section
              className="border-destructive/40 bg-destructive/5 rounded-md border p-4"
              data-testid="admin-ai-generation-local-contract-error"
              role="alert"
            >
              <h3 className="text-text-primary text-sm font-semibold">
                生成请求暂不可用
              </h3>
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
                  <h3 className="text-text-primary mt-1 text-base font-semibold">
                    {getTaskStatusLabel(
                      localContractSummary.resultState.status,
                    )}
                  </h3>
                </div>
              </div>

              <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-4">
                <div>
                  <dt className="text-text-secondary">任务状态</dt>
                  <dd className="text-text-primary mt-1">
                    {getTaskStatusLabel(
                      localContractSummary.resultState.status,
                    )}
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
                  <dt className="text-text-secondary">
                    {pageCopy.evidenceLabel}
                  </dt>
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

          {requestState === "idle" && localContractSummary === null ? (
            <div
              className="bg-muted text-text-secondary rounded-md p-4 text-sm leading-6"
              role="status"
            >
              尚未开始本次生成。请先确认生成条件，再执行生成。
            </div>
          ) : null}
        </section>

        <section className="space-y-4" id="generation-history">
          <div>
            <p className="text-brand-primary text-xs font-medium">历史记录</p>
            <h2 className="text-text-primary mt-1 text-lg font-semibold">
              任务记录
            </h2>
            <p className="text-text-secondary mt-1 text-sm leading-6">
              按生成时间查看历史任务、评审结果和后续处理状态。
            </p>
          </div>
          <AdminAiGenerationTaskHistoryPanel
            adminWorkspaceCapabilitySummary={adminWorkspaceCapabilitySummary}
            copyActionStateByResultPublicId={copyActionStateByResultPublicId}
            currentLocalContractSummary={localContractSummary}
            generationParameters={generationParameters}
            generationKind={generationKind}
            onCopyToTrainingDraft={(input) =>
              void handleCopyOrganizationAiResultToTrainingDraft(input)
            }
            onChangePage={(page) => void handleChangeTaskHistoryPage(page)}
            pagination={taskHistoryPagination}
            reviewActionStateByResultPublicId={
              reviewActionStateByResultPublicId
            }
            state={historyState}
            taskHistory={taskHistory}
            workspace={workspace}
            onReviewContentDraft={(input) =>
              void handleReviewContentDraft(input)
            }
          />
        </section>
      </div>
    </section>
  );
}
