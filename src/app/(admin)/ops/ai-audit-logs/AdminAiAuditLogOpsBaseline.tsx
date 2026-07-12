"use client";

import type { ReactNode } from "react";
import {
  AlertCircle,
  CheckCircle2,
  Eye,
  LoaderCircle,
  RotateCcw,
  X,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

import {
  AdminModelConfigManagement,
  type ModelConfigFormInput,
  type ModelProviderFormInput,
} from "@/features/admin/model-config-management/AdminModelConfigManagement";
import { adminDataTableClassName } from "@/components/admin/admin-layout-primitives";
import {
  AdminListToolbar,
  AdminPagination,
  AdminTableFrame,
  adminListControlClassName,
  adminListFilterLabelClassName,
} from "@/components/admin/AdminList";
import { Button } from "@/components/ui/button";
import type {
  ApiPagination,
  ApiResponse,
} from "@/server/contracts/api-response";
import type {
  AiCallLogCostSummaryDto,
  AiCallLogListDto,
  AuditLogSummaryDto,
  AuditLogListDto,
  AdminAiAuditLogPageSize,
  ModelConfigConnectionTestResultDto,
  ModelConfigListDto,
  ModelConfigSummaryDto,
  ModelProviderListDto,
  ModelProviderSummaryDto,
  PromptTemplateListDto,
} from "@/server/contracts/admin-ai-audit-log-ops-contract";
import { ADMIN_AI_AUDIT_LOG_PAGE_SIZE_OPTIONS } from "@/server/contracts/admin-ai-audit-log-ops-contract";
import type { PersonalAiGenerationFormalAdoptionReviewDto } from "@/server/contracts/personal-ai-generation-formal-adoption-contract";

type AdminAiAuditLogOpsState = "ready" | "loading" | "empty" | "error";
type AdminFormalAdoptionReviewState = "idle" | "loading" | "success" | "error";
type AdminAiAuditLogOpsRoleMode = "super_admin" | "ops_admin";
type AdminAiAuditLogOpsQueryState = {
  keyword: string;
  pageSize: 20 | 50 | 100;
};
type AdminAuditLogQueryState = {
  actionType: string;
  fromDate: string;
  keyword: string;
  page: number;
  pageSize: AdminAiAuditLogPageSize;
  resultStatus: "all" | "success" | "failed";
  targetResourceType: string;
  toDate: string;
};
type AdminAiCallLogQueryState = {
  callStatus: "all" | "success" | "failed";
  keyword: string;
  page: number;
  pageSize: AdminAiAuditLogPageSize;
};

type AdminAiAuditRuntimeData = {
  aiCallLogs: AiCallLogListDto["aiCallLogs"];
  auditLogs: AuditLogListDto["auditLogs"];
  costSummaries: AiCallLogCostSummaryDto[];
  modelConfigs: ModelConfigListDto["modelConfigs"];
  modelProviders: ModelProviderListDto["modelProviders"];
  promptTemplates: PromptTemplateListDto["promptTemplates"];
};

const sessionTokenStorageKey = "tiku.localSessionToken";
const cookieBackedSessionToken = "__cookie_backed_session__";
const formalAdoptionTargetResourceType = "personal_ai_generation_result";
const formalAdoptionReviewTargetType = "question";
const formalAdoptionReviewReasonCategory = "content_quality_passed";

const adminOpsDefinitionLabelMap: Record<string, string> = {
  formalTargetWriteStatus: "正式写入状态",
  redactionStatus: "脱敏状态",
  reviewStatus: "复核状态",
};

const adminOpsDisplayValueMap: Record<string, string> = {
  ai_scoring: "AI 评分",
  approved_for_manual_adoption: "已通过人工入库复核",
  awaiting_metadata_review: "等待元数据复核",
  blocked_without_follow_up_task: "待后续任务审批",
  failed: "失败",
  metadata_only: "仅元数据",
  "metadata-only": "仅元数据",
  model_config: "模型配置",
  model_provider: "模型供应商",
  "model_config.enable": "启用模型配置",
  "model_config.disable": "停用模型配置",
  "model_config.create": "创建模型配置",
  "model_config.update": "更新模型配置",
  "model_provider.create": "创建模型供应商",
  "model_provider.update": "更新模型供应商",
  "model_provider.enable": "启用模型供应商",
  "model_provider.disable": "停用模型供应商",
  paper_question: "试卷题目",
  "paper_question.add": "向试卷添加题目",
  organization: "企业组织",
  org_auth: "企业授权",
  "org_auth.create": "创建企业授权",
  "org_auth.cancel": "取消企业授权",
  employee: "员工账号",
  "employee.import": "导入员工账号",
  "employee.transfer": "转移员工账号",
  "employee.unbind": "解绑员工账号",
  personal_ai_generation_result: "个人 AI 训练结果",
  "personal_ai_generation_result.formal_adoption_review.ready":
    "正式入库复核就绪",
  redacted: "已脱敏",
  redeem_code: "卡密",
  "redeem_code.batch_create": "批量生成卡密",
  "redeem_code.create": "生成卡密",
  success: "成功",
  super_admin: "超级管理员",
  ops_admin: "运营管理员",
  content_admin: "内容管理员",
  org_standard_admin: "标准版组织管理员",
  org_advanced_admin: "高级版组织管理员",
  summary_only: "仅摘要",
  user: "用户",
  "user.disable": "停用用户",
  "user.enable": "启用用户",
  "user.reset_password": "重置密码",
  prompt_template: "Prompt 模板",
};

const defaultAdminAuditLogQuery: AdminAuditLogQueryState = {
  actionType: "all",
  fromDate: "",
  keyword: "",
  page: 1,
  pageSize: 20,
  resultStatus: "all",
  targetResourceType: "all",
  toDate: "",
};

const defaultAdminAiCallLogQuery: AdminAiCallLogQueryState = {
  callStatus: "all",
  keyword: "",
  page: 1,
  pageSize: 20,
};

const auditActionFilterOptions = [
  ["all", "全部动作"],
  ["user.reset_password", "重置密码"],
  ["user.enable", "启用用户"],
  ["user.disable", "停用用户"],
  ["employee.import", "导入员工账号"],
  ["employee.transfer", "转移员工账号"],
  ["employee.unbind", "解绑员工账号"],
  ["org_auth.create", "创建企业授权"],
  ["org_auth.cancel", "取消企业授权"],
  ["redeem_code.create", "生成卡密"],
  ["redeem_code.batch_create", "批量生成卡密"],
  ["model_config.enable", "启用模型配置"],
  ["model_config.disable", "停用模型配置"],
] as const;

const auditTargetFilterOptions = [
  ["all", "全部目标"],
  ["user", "用户"],
  ["employee", "员工账号"],
  ["organization", "企业组织"],
  ["org_auth", "企业授权"],
  ["redeem_code", "卡密"],
  ["model_provider", "模型供应商"],
  ["model_config", "模型配置"],
  ["prompt_template", "Prompt 模板"],
  ["personal_ai_generation_result", "个人 AI 训练结果"],
] as const;

function formatAdminOpsDisplayValue(value: string) {
  return adminOpsDisplayValueMap[value] ?? value;
}

function formatAuditActionType(value: string) {
  return adminOpsDisplayValueMap[value] ?? "其他操作";
}

function formatAuditTargetType(value: string) {
  return adminOpsDisplayValueMap[value] ?? "其他对象";
}

const staticRuntimeData: AdminAiAuditRuntimeData = {
  modelProviders: [
    {
      publicId: "model-provider-public-001",
      providerKey: "qwen",
      displayName: "通义千问",
      baseUrl: null,
      isEnabled: true,
      secretStatus: "configured",
      maskedSecret: "****1234",
      providerMetadata: { runtime: "local_preview" },
      updatedAt: "2026-05-21T08:00:00.000Z",
    },
  ],
  modelConfigs: [
    {
      publicId: "model-config-public-001",
      providerPublicId: "model-provider-public-001",
      providerDisplayName: "通义千问",
      providerKey: "qwen",
      modelName: "qwen-plus",
      modelAlias: "qwen-plus",
      displayName: "通义千问评分模型",
      aiFuncType: "ai_scoring",
      apiKeyDisplay: "****1234",
      secretStatus: "configured",
      maskedSecret: "****1234",
      fallbackModelConfigPublicId: "model-config-public-002",
      isEnabled: true,
      status: "enabled",
      fallbackPriority: 10,
      snapshotPolicy: "redacted_metadata",
      configVersion: 1,
      timeoutSecond: 15,
      maxRetryCount: 1,
      updatedAt: "2026-05-21T08:00:00.000Z",
    },
  ],
  promptTemplates: [
    {
      publicId: "prompt-template-public-001",
      promptTemplateKey: "ai_scoring_v1",
      aiFuncType: "ai_scoring",
      version: 1,
      title: "AI scoring v1",
      description: "Metadata only",
      bodyDigest: "sha256:redacted",
      bodyPreviewMasked: "Scoring template preview [redacted]",
      bodyFullText:
        "Read-only scoring prompt text for privileged local preview.",
      canViewFullText: true,
      requiredVariables: [
        "question",
        "studentAnswer",
        "scoringPoints",
        "ragContext",
      ],
      registrationSource: "runtime_registry",
      catalogGapStatus: "registered",
      status: "active",
      isActive: true,
      updatedAt: "2026-05-21T08:00:00.000Z",
    },
  ],
  auditLogs: [
    {
      publicId: "audit-log-formal-review-candidate-public-001",
      actorPublicId: "admin-content-public-001",
      actorRole: "content_admin",
      actionType: "personal_ai_generation_result.formal_adoption_review.ready",
      targetResourceType: formalAdoptionTargetResourceType,
      targetPublicId: "personal_ai_result_public_admin_901",
      resultStatus: "success",
      metadataSummary: "redacted formal adoption candidate metadata",
      requestIp: null,
      createdAt: "2026-05-21T08:00:00.000Z",
    },
    {
      publicId: "audit-log-public-001",
      actorPublicId: "admin-super-001",
      actorRole: "super_admin",
      actionType: "model_config.enable",
      targetResourceType: "model_config",
      targetPublicId: "model-config-public-001",
      resultStatus: "success",
      metadataSummary: "redacted model_config mutation metadata",
      requestIp: null,
      createdAt: "2026-05-21T08:00:00.000Z",
    },
  ],
  aiCallLogs: [
    {
      publicId: "ai-call-log-public-001",
      userPublicId: null,
      organizationPublicId: null,
      profession: "monopoly",
      level: 3,
      aiFuncType: "ai_scoring",
      callStatus: "success",
      providerDisplayName: "通义千问",
      modelAlias: "qwen-plus",
      promptSummary: "redacted prompt and answer snapshot",
      outputSummary: "redacted scoring snapshot",
      promptTokenCount: 900,
      completionTokenCount: 800,
      totalTokenCount: 1700,
      estimatedCostCny: "3.60",
      latencyMs: 1200,
      startedAt: "2026-05-21T08:00:00.000Z",
      completedAt: "2026-05-21T08:00:01.200Z",
    },
  ],
  costSummaries: [
    {
      bucket: "2026-05-21",
      bucketType: "day",
      aiFuncType: "ai_scoring",
      providerDisplayName: "通义千问",
      modelAlias: "qwen-plus",
      callCount: 12,
      successCount: 12,
      failedCount: 0,
      totalTokenCount: 1700,
      estimatedCostCny: "3.60",
    },
  ],
};

const staticAuditLogRuntimeData = {
  auditLogs: staticRuntimeData.auditLogs,
  pagination: null as ApiPagination | null,
};

const staticAiCallLogRuntimeData = {
  aiCallLogs: staticRuntimeData.aiCallLogs,
  costSummaries: staticRuntimeData.costSummaries,
  pagination: null as ApiPagination | null,
};

export function AdminAuditLogOpsPage({
  currentRole = "ops_admin",
  runtimeEnabled = false,
  state = "ready",
}: {
  currentRole?: AdminAiAuditLogOpsRoleMode;
  runtimeEnabled?: boolean;
  state?: AdminAiAuditLogOpsState;
}) {
  const [runtimeState, setRuntimeState] =
    useState<AdminAiAuditLogOpsState>(state);
  const [runtimeData, setRuntimeData] = useState(staticAuditLogRuntimeData);
  const [query, setQuery] = useState<AdminAuditLogQueryState>(
    defaultAdminAuditLogQuery,
  );
  const [selectedAuditLogPublicId, setSelectedAuditLogPublicId] = useState<
    string | null
  >(null);
  const detailTriggerRef = useRef<HTMLButtonElement | null>(null);
  const shouldLoadRuntimeData = runtimeEnabled && state === "ready";
  const effectiveRuntimeState = shouldLoadRuntimeData ? runtimeState : state;
  const runtimeQuery = useMemo(
    () => createAuditLogRuntimeQuery(query),
    [query],
  );
  const displayedAuditLogs = shouldLoadRuntimeData
    ? runtimeData.auditLogs
    : paginateAuditLogs(
        filterAuditLogsForSplitPage(runtimeData.auditLogs, query),
        query,
      );
  const selectedAuditLog =
    runtimeData.auditLogs.find(
      (auditLog) => auditLog.publicId === selectedAuditLogPublicId,
    ) ?? null;
  const totalCount =
    runtimeData.pagination?.total ??
    filterAuditLogsForSplitPage(runtimeData.auditLogs, query).length;

  useEffect(() => {
    if (!shouldLoadRuntimeData) {
      return;
    }

    let isCurrentLoad = true;
    const storedSessionToken = readStoredSessionToken();

    if (storedSessionToken === null) {
      queueMicrotask(() => {
        if (isCurrentLoad) {
          setRuntimeState("error");
        }
      });
      return;
    }

    queueMicrotask(() => {
      if (isCurrentLoad) {
        setRuntimeState("loading");
      }
    });

    loadAuditLogRuntimeData(storedSessionToken, runtimeQuery)
      .then((loadedData) => {
        if (!isCurrentLoad) {
          return;
        }

        setRuntimeData(loadedData);
        setRuntimeState("ready");
      })
      .catch(() => {
        if (isCurrentLoad) {
          setRuntimeState("error");
        }
      });

    return () => {
      isCurrentLoad = false;
    };
  }, [runtimeQuery, shouldLoadRuntimeData]);

  if (effectiveRuntimeState === "loading") {
    return (
      <AdminOpsStatePanel
        icon={
          <LoaderCircle aria-hidden="true" className="size-8 animate-spin" />
        }
        title="正在加载审计日志"
      />
    );
  }

  if (effectiveRuntimeState === "empty") {
    return (
      <AdminOpsStatePanel
        icon={<CheckCircle2 aria-hidden="true" className="size-8" />}
        title="暂无审计日志"
      />
    );
  }

  if (effectiveRuntimeState === "error") {
    return (
      <AdminOpsStatePanel
        icon={<AlertCircle aria-hidden="true" className="size-8" />}
        title="审计日志加载失败"
      />
    );
  }

  return (
    <main className="space-y-6" data-testid="ops-audit-log-runtime-ready">
      <AdminSplitLogHeader
        eyebrow="运营后台"
        title="审计日志"
        description="查看系统操作审计记录；页面只呈现脱敏摘要，不展示原始请求体、密钥、会话、卡密明文或内部标识。"
      />

      <AdminAuditLogToolbar
        currentRole={currentRole}
        query={query}
        total={totalCount}
        onChange={(nextQuery) => {
          setSelectedAuditLogPublicId(null);
          setQuery(nextQuery);
        }}
      />

      <AdminAuditLogTable
        auditLogs={displayedAuditLogs}
        hasActiveFilters={hasActiveAuditLogFilters(query)}
        onSelectAuditLog={(publicId, trigger) => {
          detailTriggerRef.current = trigger;
          setSelectedAuditLogPublicId(publicId);
        }}
      />

      <AdminPagination
        itemLabel="条审计日志"
        page={query.page}
        pageSize={query.pageSize}
        total={totalCount}
        onPageChange={(page) =>
          setQuery((currentQuery) => ({ ...currentQuery, page }))
        }
      />

      {selectedAuditLog === null ? null : (
        <AdminAuditLogDetailDrawer
          auditLog={selectedAuditLog}
          onClose={() => {
            setSelectedAuditLogPublicId(null);
            queueMicrotask(() => detailTriggerRef.current?.focus());
          }}
        />
      )}
    </main>
  );
}

export function AdminAiCallLogOpsPage({
  currentRole = "ops_admin",
  runtimeEnabled = false,
  state = "ready",
}: {
  currentRole?: AdminAiAuditLogOpsRoleMode;
  runtimeEnabled?: boolean;
  state?: AdminAiAuditLogOpsState;
}) {
  const [runtimeState, setRuntimeState] =
    useState<AdminAiAuditLogOpsState>(state);
  const [runtimeData, setRuntimeData] = useState(staticAiCallLogRuntimeData);
  const [query, setQuery] = useState<AdminAiCallLogQueryState>(
    defaultAdminAiCallLogQuery,
  );
  const [selectedAiCallLogPublicId, setSelectedAiCallLogPublicId] = useState<
    string | null
  >(null);
  const shouldLoadRuntimeData = runtimeEnabled && state === "ready";
  const effectiveRuntimeState = shouldLoadRuntimeData ? runtimeState : state;
  const runtimeQuery = useMemo(
    () => createAiCallLogRuntimeQuery(query),
    [query],
  );
  const displayedAiCallLogs = shouldLoadRuntimeData
    ? runtimeData.aiCallLogs
    : paginateAiCallLogs(
        filterAiCallLogsForSplitPage(runtimeData.aiCallLogs, query),
        query,
      );
  const selectedAiCallLog =
    runtimeData.aiCallLogs.find(
      (aiCallLog) => aiCallLog.publicId === selectedAiCallLogPublicId,
    ) ?? null;
  const totalCount =
    runtimeData.pagination?.total ??
    filterAiCallLogsForSplitPage(runtimeData.aiCallLogs, query).length;
  const failedAiCallCount = runtimeData.aiCallLogs.filter(
    (aiCallLog) => aiCallLog.callStatus === "failed",
  ).length;

  useEffect(() => {
    if (!shouldLoadRuntimeData) {
      return;
    }

    let isCurrentLoad = true;
    const storedSessionToken = readStoredSessionToken();

    if (storedSessionToken === null) {
      queueMicrotask(() => {
        if (isCurrentLoad) {
          setRuntimeState("error");
        }
      });
      return;
    }

    queueMicrotask(() => {
      if (isCurrentLoad) {
        setRuntimeState("loading");
      }
    });

    loadAiCallLogRuntimeData(storedSessionToken, runtimeQuery)
      .then((loadedData) => {
        if (!isCurrentLoad) {
          return;
        }

        setRuntimeData(loadedData);
        setRuntimeState("ready");
      })
      .catch(() => {
        if (isCurrentLoad) {
          setRuntimeState("error");
        }
      });

    return () => {
      isCurrentLoad = false;
    };
  }, [runtimeQuery, shouldLoadRuntimeData]);

  if (effectiveRuntimeState === "loading") {
    return (
      <AdminOpsStatePanel
        icon={
          <LoaderCircle aria-hidden="true" className="size-8 animate-spin" />
        }
        title="正在加载 AI 调用日志"
      />
    );
  }

  if (effectiveRuntimeState === "empty") {
    return (
      <AdminOpsStatePanel
        icon={<CheckCircle2 aria-hidden="true" className="size-8" />}
        title="暂无 AI 调用日志"
      />
    );
  }

  if (effectiveRuntimeState === "error") {
    return (
      <AdminOpsStatePanel
        icon={<AlertCircle aria-hidden="true" className="size-8" />}
        title="AI 调用日志加载失败"
      />
    );
  }

  return (
    <main className="space-y-6" data-testid="ops-ai-call-log-runtime-ready">
      <AdminSplitLogHeader
        eyebrow="运营后台"
        title="AI 调用日志"
        description="查看 AI 能力调用状态、失败和用量摘要；Provider 不在页面执行，详情只展示脱敏输入输出摘要。"
      />

      <AdminSplitLogSummaryBand
        description="AI 调用日志只读；Provider 不在页面执行，原始 Prompt、Provider 请求/响应、原始 AI 输出和完整内容不展示。"
        metricItems={[
          { label: "AI 调用", value: runtimeData.aiCallLogs.length },
          { label: "失败调用", value: failedAiCallCount },
          { label: "用量摘要", value: runtimeData.costSummaries.length },
        ]}
        roleLabel={formatOpsLogRoleLabel(currentRole)}
        testId="ops-ai-call-log-summary-band"
        title="AI 调用日志只读"
      />

      <AdminAiCallLogToolbar
        currentRole={currentRole}
        query={query}
        total={totalCount}
        onChange={(nextQuery) => {
          setSelectedAiCallLogPublicId(null);
          setQuery(nextQuery);
        }}
      />

      <AdminAiCallLogTable
        aiCallLogs={displayedAiCallLogs}
        onSelectAiCallLog={setSelectedAiCallLogPublicId}
      />

      <AdminPagination
        itemLabel="条 AI 调用日志"
        page={query.page}
        pageSize={query.pageSize}
        total={totalCount}
        onPageChange={(page) =>
          setQuery((currentQuery) => ({ ...currentQuery, page }))
        }
      />

      <section className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(20rem,0.7fr)]">
        <AdminAiCallLogDetailPanel aiCallLog={selectedAiCallLog} />
        <AdminAiCallCostSummaryPanel
          costSummaries={runtimeData.costSummaries}
        />
      </section>
    </main>
  );
}

export function AdminAiAuditLogOpsBaseline({
  currentRole = "super_admin",
  runtimeEnabled = false,
  state = "ready",
}: {
  currentRole?: AdminAiAuditLogOpsRoleMode;
  runtimeEnabled?: boolean;
  state?: AdminAiAuditLogOpsState;
}) {
  const [runtimeState, setRuntimeState] =
    useState<AdminAiAuditLogOpsState>(state);
  const [runtimeData, setRuntimeData] =
    useState<AdminAiAuditRuntimeData>(staticRuntimeData);
  const [formalAdoptionReviewState, setFormalAdoptionReviewState] =
    useState<AdminFormalAdoptionReviewState>("idle");
  const [formalAdoptionReview, setFormalAdoptionReview] = useState<
    PersonalAiGenerationFormalAdoptionReviewDto["adoptionReview"] | null
  >(null);
  const [opsQuery, setOpsQuery] = useState<AdminAiAuditLogOpsQueryState>({
    keyword: "",
    pageSize: 20,
  });
  const [selectedAuditLogPublicId, setSelectedAuditLogPublicId] = useState<
    string | null
  >(null);
  const [selectedAiCallLogPublicId, setSelectedAiCallLogPublicId] = useState<
    string | null
  >(null);
  const shouldLoadRuntimeData = runtimeEnabled && state === "ready";
  const effectiveRuntimeState = shouldLoadRuntimeData ? runtimeState : state;
  const runtimeQuery = useMemo(() => createRuntimeQuery(opsQuery), [opsQuery]);
  const formalAdoptionReviewCandidate = useMemo(
    () => findFormalAdoptionReviewCandidate(runtimeData.auditLogs),
    [runtimeData.auditLogs],
  );
  const displayedAuditLogs = useMemo(
    () =>
      filterAuditLogs(runtimeData.auditLogs, opsQuery).slice(
        0,
        opsQuery.pageSize,
      ),
    [opsQuery, runtimeData.auditLogs],
  );
  const displayedAiCallLogs = useMemo(
    () =>
      filterAiCallLogs(runtimeData.aiCallLogs, opsQuery).slice(
        0,
        opsQuery.pageSize,
      ),
    [opsQuery, runtimeData.aiCallLogs],
  );
  const displayedCostSummaries = useMemo(
    () =>
      filterCostSummaries(runtimeData.costSummaries, opsQuery).slice(
        0,
        opsQuery.pageSize,
      ),
    [opsQuery, runtimeData.costSummaries],
  );
  const selectedAuditLog =
    runtimeData.auditLogs.find(
      (auditLog) => auditLog.publicId === selectedAuditLogPublicId,
    ) ?? null;
  const selectedAiCallLog =
    runtimeData.aiCallLogs.find(
      (aiCallLog) => aiCallLog.publicId === selectedAiCallLogPublicId,
    ) ?? null;
  const managementKey = [
    runtimeData.modelProviders.map((provider) => provider.publicId).join(","),
    runtimeData.modelConfigs
      .map((modelConfig) => modelConfig.publicId)
      .join(","),
    runtimeData.promptTemplates
      .map((promptTemplate) => promptTemplate.publicId)
      .join(","),
  ].join("|");

  useEffect(() => {
    if (!shouldLoadRuntimeData) {
      return;
    }

    let isCurrentLoad = true;
    const storedSessionToken = readStoredSessionToken();

    if (storedSessionToken === null) {
      queueMicrotask(() => {
        if (isCurrentLoad) {
          setRuntimeState("error");
        }
      });
      return;
    }

    queueMicrotask(() => {
      if (isCurrentLoad) {
        setRuntimeState("loading");
      }
    });

    loadRuntimeData(storedSessionToken, runtimeQuery)
      .then((loadedData) => {
        if (!isCurrentLoad) {
          return;
        }

        setRuntimeData(loadedData);
        setRuntimeState(hasAnyRuntimeData(loadedData) ? "ready" : "empty");
      })
      .catch(() => {
        if (!isCurrentLoad) {
          return;
        }

        setRuntimeState("error");
      });

    return () => {
      isCurrentLoad = false;
    };
  }, [runtimeQuery, shouldLoadRuntimeData]);

  const runtimeCallbacks = useMemo(() => {
    if (!runtimeEnabled) {
      return {};
    }

    return createRuntimeCallbacks();
  }, [runtimeEnabled]);

  async function handleSubmitFormalAdoptionReview() {
    if (formalAdoptionReviewCandidate === null) {
      return;
    }

    setFormalAdoptionReview(null);
    setFormalAdoptionReviewState("loading");

    try {
      const response =
        await postAdminApi<PersonalAiGenerationFormalAdoptionReviewDto>(
          `/api/v1/personal-ai-generation-results/${encodeURIComponent(
            formalAdoptionReviewCandidate.targetPublicId,
          )}/formal-adoption-reviews`,
          readRequiredSessionToken(),
          {
            reviewDecision: "approved",
            reviewReasonCategory: formalAdoptionReviewReasonCategory,
            reviewerConfirmed: true,
            targetType: formalAdoptionReviewTargetType,
          },
        );

      setFormalAdoptionReview(readApiData(response).adoptionReview);
      setFormalAdoptionReviewState("success");
    } catch {
      setFormalAdoptionReviewState("error");
    }
  }

  if (effectiveRuntimeState === "loading") {
    return (
      <AdminOpsStatePanel
        icon={
          <LoaderCircle aria-hidden="true" className="size-8 animate-spin" />
        }
        title="正在加载 AI 与日志运营数据"
      />
    );
  }

  if (effectiveRuntimeState === "empty") {
    return (
      <AdminOpsStatePanel
        icon={<CheckCircle2 aria-hidden="true" className="size-8" />}
        title="暂无 AI 与日志运营数据"
      />
    );
  }

  if (effectiveRuntimeState === "error") {
    return (
      <AdminOpsStatePanel
        icon={<AlertCircle aria-hidden="true" className="size-8" />}
        title="AI 与日志运营数据加载失败"
      />
    );
  }

  return (
    <div className="space-y-6" data-testid="admin-ai-audit-runtime-ready">
      <header className="flex flex-col gap-2">
        <p className="text-brand-primary text-sm font-medium">AI 配置与日志</p>
        <h1 className="font-heading text-text-primary text-2xl font-semibold">
          AI 配置与日志运营
        </h1>
        <p className="text-text-secondary max-w-3xl text-sm leading-6">
          模型配置、Prompt 模板、审计日志与 AI
          调用日志均通过本地受保护接口加载；页面默认折叠标识符值，仅展示脱敏摘要和状态语义。
        </p>
      </header>

      <AdminAiAuditSummaryFirstBand
        currentRole={currentRole}
        runtimeData={runtimeData}
      />

      <AdminModelConfigManagement
        key={managementKey}
        initialModelConfigs={runtimeData.modelConfigs}
        initialModelProviders={runtimeData.modelProviders}
        initialPromptTemplates={runtimeData.promptTemplates}
        canManageModelConfig={currentRole === "super_admin"}
        canViewPromptFullText={currentRole === "super_admin"}
        {...runtimeCallbacks}
      />

      <AdminFormalAdoptionReviewPanel
        candidate={formalAdoptionReviewCandidate}
        review={formalAdoptionReview}
        state={formalAdoptionReviewState}
        onSubmit={() => void handleSubmitFormalAdoptionReview()}
      />

      <AdminOpsQueryControls query={opsQuery} onChange={setOpsQuery} />

      <div className="grid gap-4 xl:grid-cols-3">
        <AdminOpsPanel title="审计日志">
          <p className="text-text-muted mb-2 text-xs">审计日志只读</p>
          {displayedAuditLogs.map((auditLog) => (
            <AdminOpsSummaryRow
              key={auditLog.publicId}
              label={formatAuditActionType(auditLog.actionType)}
              meta={[
                "对象信息已脱敏",
                formatAuditTargetType(auditLog.targetResourceType),
                formatAdminOpsDisplayValue(auditLog.resultStatus),
                auditLog.metadataSummary ?? "已脱敏元数据",
              ].join(" / ")}
              badges={["仅元数据", "已脱敏", "仅摘要"]}
              publicId={auditLog.publicId}
              testId={`admin-audit-log-${auditLog.publicId}`}
            >
              <AdminOpsDetailButton
                label="查看脱敏详情"
                accessibleLabel={`查看${formatAuditActionType(
                  auditLog.actionType,
                )}，${formatAuditTargetType(
                  auditLog.targetResourceType,
                )}，${formatAuditLogTimestamp(auditLog.createdAt)}的审计详情`}
                onClick={() => setSelectedAuditLogPublicId(auditLog.publicId)}
              />
            </AdminOpsSummaryRow>
          ))}
        </AdminOpsPanel>

        <AdminOpsPanel title="AI 调用日志">
          <p className="text-text-muted mb-2 text-xs">AI 调用日志只读</p>
          {displayedAiCallLogs.map((aiCallLog) => (
            <AdminOpsSummaryRow
              key={aiCallLog.publicId}
              label={formatAdminOpsDisplayValue(aiCallLog.aiFuncType)}
              meta={[
                aiCallLog.providerDisplayName,
                aiCallLog.modelAlias,
                formatAdminOpsDisplayValue(aiCallLog.callStatus),
                `用量：${aiCallLog.totalTokenCount ?? 0}`,
                aiCallLog.promptSummary ?? "输入摘要不可用",
              ].join(" / ")}
              publicId={aiCallLog.publicId}
              testId={`admin-ai-call-log-${aiCallLog.publicId}`}
            >
              <AdminOpsDetailButton
                label="查看脱敏详情"
                accessibleLabel={`查看${formatAdminOpsDisplayValue(
                  aiCallLog.aiFuncType,
                )}，${aiCallLog.providerDisplayName} / ${
                  aiCallLog.modelAlias
                }，${formatAuditLogTimestamp(aiCallLog.startedAt)}的调用详情`}
                onClick={() => setSelectedAiCallLogPublicId(aiCallLog.publicId)}
              />
            </AdminOpsSummaryRow>
          ))}
        </AdminOpsPanel>

        <AdminOpsPanel title="成本汇总">
          {displayedCostSummaries.map((costSummary) => (
            <AdminOpsSummaryRow
              key={[
                costSummary.bucket,
                costSummary.aiFuncType,
                costSummary.modelAlias,
              ].join("-")}
              label={`${costSummary.bucket} / ${formatAdminOpsDisplayValue(
                costSummary.aiFuncType,
              )}`}
              meta={[
                costSummary.providerDisplayName,
                costSummary.modelAlias,
                `调用次数：${costSummary.callCount}`,
                `预估成本：${costSummary.estimatedCostCny} 元`,
              ].join(" / ")}
              publicId={`${costSummary.bucket}-${costSummary.aiFuncType}`}
            />
          ))}
        </AdminOpsPanel>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <AdminAuditLogDetailPanel auditLog={selectedAuditLog} />
        <AdminAiCallLogDetailPanel aiCallLog={selectedAiCallLog} />
      </div>
    </div>
  );
}

function AdminAiAuditSummaryFirstBand({
  currentRole,
  runtimeData,
}: {
  currentRole: AdminAiAuditLogOpsRoleMode;
  runtimeData: AdminAiAuditRuntimeData;
}) {
  const failedAiCallCount = runtimeData.aiCallLogs.filter(
    (aiCallLog) => aiCallLog.callStatus === "failed",
  ).length;
  const roleBoundary =
    currentRole === "super_admin"
      ? "超级管理员可维护模型配置并查看受控 Prompt 元数据。"
      : "运营管理员只读日志、成本汇总和脱敏元数据。";
  const roleLabel = currentRole === "super_admin" ? "超级管理员" : "运营管理员";

  return (
    <section
      aria-label="AI 与日志摘要优先"
      className="bg-surface border-border rounded-md border p-4 shadow-sm"
      data-testid="ops-ai-audit-summary-first-band"
    >
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-1">
          <p className="text-brand-primary text-xs font-medium">
            AI 与日志概览
          </p>
          <h2 className="text-text-primary text-base font-semibold">
            AI 与日志总览
          </h2>
          <p className="text-text-secondary text-sm leading-6">
            {roleBoundary} Provider 不在页面执行；原始 Prompt、Provider
            payload、原始输出、会话和凭证不展示。
          </p>
        </div>
        <span className="bg-secondary text-secondary-foreground w-fit rounded-lg px-2 py-1 text-xs font-medium">
          {roleLabel}
        </span>
      </div>
      <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <AdminAiAuditSummaryTile
          label="模型配置"
          value={`${runtimeData.modelConfigs.length}`}
        />
        <AdminAiAuditSummaryTile
          label="审计日志"
          value={`${runtimeData.auditLogs.length}`}
        />
        <AdminAiAuditSummaryTile
          label="AI 调用"
          value={`${runtimeData.aiCallLogs.length}`}
        />
        <AdminAiAuditSummaryTile
          label="失败调用"
          value={`${failedAiCallCount}`}
        />
      </div>
      <p className="text-text-muted mt-3 text-xs leading-5">
        空态、错误态和禁用态保持可见；成本汇总仅用于本地运营观察，不声明 Cost
        Calibration。
      </p>
    </section>
  );
}

function AdminAiAuditSummaryTile({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="border-border bg-background rounded-md border p-3">
      <p className="text-text-muted text-xs">{label}</p>
      <p className="text-text-primary mt-2 text-2xl font-semibold">{value}</p>
    </div>
  );
}

function findFormalAdoptionReviewCandidate(
  auditLogs: AuditLogSummaryDto[],
): { targetPublicId: string } | null {
  const candidate = auditLogs.find(
    (auditLog) =>
      auditLog.targetResourceType === formalAdoptionTargetResourceType &&
      auditLog.targetPublicId !== null,
  );

  return candidate?.targetPublicId === undefined ||
    candidate.targetPublicId === null
    ? null
    : { targetPublicId: candidate.targetPublicId };
}

function createRuntimeQuery(query: AdminAiAuditLogOpsQueryState): string {
  const searchParams = new URLSearchParams({
    page: "1",
    pageSize: String(query.pageSize),
    sortBy: "updatedAt",
    sortOrder: "desc",
  });
  const keyword = query.keyword.trim();

  if (keyword.length > 0) {
    searchParams.set("keyword", keyword);
  }

  return searchParams.toString();
}

function filterAuditLogs(
  auditLogs: AuditLogListDto["auditLogs"],
  query: AdminAiAuditLogOpsQueryState,
): AuditLogListDto["auditLogs"] {
  const keyword = query.keyword.trim().toLowerCase();

  if (keyword.length === 0) {
    return auditLogs;
  }

  return auditLogs.filter((auditLog) =>
    [
      auditLog.actionType,
      auditLog.targetResourceType,
      auditLog.resultStatus,
      auditLog.metadataSummary ?? "",
    ]
      .join(" ")
      .toLowerCase()
      .includes(keyword),
  );
}

function filterAiCallLogs(
  aiCallLogs: AiCallLogListDto["aiCallLogs"],
  query: AdminAiAuditLogOpsQueryState,
): AiCallLogListDto["aiCallLogs"] {
  const keyword = query.keyword.trim().toLowerCase();

  if (keyword.length === 0) {
    return aiCallLogs;
  }

  return aiCallLogs.filter((aiCallLog) =>
    [
      aiCallLog.aiFuncType,
      aiCallLog.callStatus,
      aiCallLog.providerDisplayName,
      aiCallLog.modelAlias,
      aiCallLog.promptSummary ?? "",
      aiCallLog.outputSummary ?? "",
    ]
      .join(" ")
      .toLowerCase()
      .includes(keyword),
  );
}

function filterCostSummaries(
  costSummaries: AiCallLogCostSummaryDto[],
  query: AdminAiAuditLogOpsQueryState,
): AiCallLogCostSummaryDto[] {
  const keyword = query.keyword.trim().toLowerCase();

  if (keyword.length === 0) {
    return costSummaries;
  }

  return costSummaries.filter((costSummary) =>
    [
      costSummary.bucket,
      costSummary.aiFuncType,
      costSummary.providerDisplayName,
      costSummary.modelAlias,
    ]
      .join(" ")
      .toLowerCase()
      .includes(keyword),
  );
}

async function loadRuntimeData(
  sessionToken: string,
  runtimeQuery: string,
): Promise<AdminAiAuditRuntimeData> {
  const [
    modelProviders,
    modelConfigs,
    promptTemplates,
    auditLogs,
    aiCallLogs,
    costSummaries,
  ] = await Promise.all([
    loadOptionalRuntimeData(
      async () =>
        readApiData(
          await fetchAdminApi<ModelProviderListDto>(
            `/api/v1/model-providers?${runtimeQuery}`,
            sessionToken,
          ),
        ).modelProviders,
      [],
    ),
    loadOptionalRuntimeData(
      async () =>
        readApiData(
          await fetchAdminApi<ModelConfigListDto>(
            `/api/v1/model-configs?${runtimeQuery}`,
            sessionToken,
          ),
        ).modelConfigs,
      [],
    ),
    loadOptionalRuntimeData(
      async () =>
        readApiData(
          await fetchAdminApi<PromptTemplateListDto>(
            `/api/v1/prompt-templates?${runtimeQuery}`,
            sessionToken,
          ),
        ).promptTemplates,
      [],
    ),
    loadOptionalRuntimeData(
      async () =>
        readApiData(
          await fetchAdminApi<AuditLogListDto>(
            `/api/v1/audit-logs?${runtimeQuery}`,
            sessionToken,
          ),
        ).auditLogs,
      [],
    ),
    loadOptionalRuntimeData(
      async () =>
        readApiData(
          await fetchAdminApi<AiCallLogListDto>(
            `/api/v1/ai-call-logs?${runtimeQuery}`,
            sessionToken,
          ),
        ).aiCallLogs,
      [],
    ),
    loadOptionalRuntimeData(
      async () =>
        readApiData(
          await fetchAdminApi<{ dailySummaries: AiCallLogCostSummaryDto[] }>(
            `/api/v1/ai-call-logs/summary?${runtimeQuery}`,
            sessionToken,
          ),
        ).dailySummaries,
      [],
    ),
  ]);

  return {
    modelProviders,
    modelConfigs,
    promptTemplates,
    auditLogs,
    aiCallLogs,
    costSummaries,
  };
}

async function loadOptionalRuntimeData<TData>(
  loader: () => Promise<TData>,
  fallbackData: TData,
): Promise<TData> {
  try {
    return await loader();
  } catch {
    return fallbackData;
  }
}

function createRuntimeCallbacks() {
  return {
    onSaveProvider: async (
      form: ModelProviderFormInput,
    ): Promise<ModelProviderSummaryDto> => {
      const response = await postAdminApi<{
        modelProvider: ModelProviderSummaryDto;
      }>("/api/v1/model-providers", readRequiredSessionToken(), {
        baseUrl: form.baseUrl,
        displayName: form.displayName,
        isEnabled: true,
        providerKey: form.providerKey,
        secretValue: form.secretValue,
      });

      return readApiData(response).modelProvider;
    },
    onSaveConfig: async (
      form: ModelConfigFormInput,
    ): Promise<ModelConfigSummaryDto> => {
      const response = await postAdminApi<{
        modelConfig: ModelConfigSummaryDto;
      }>("/api/v1/model-configs", readRequiredSessionToken(), {
        aiFuncType: form.aiFuncType,
        configVersion: 1,
        displayName: form.displayName,
        fallbackModelConfigPublicId: form.fallbackModelConfigPublicId,
        fallbackPriority: Number.parseInt(form.fallbackPriority, 10) || 0,
        isEnabled: true,
        maxRetryCount: 1,
        modelAlias: form.modelAlias,
        modelName: form.modelName,
        modelProviderPublicId: form.modelProviderPublicId,
        status: "enabled",
        timeoutSecond: 15,
      });

      return readApiData(response).modelConfig;
    },
    onTestConnection: async (
      publicId: string,
    ): Promise<ModelConfigConnectionTestResultDto["connectionTest"]> => {
      const response = await postAdminApi<ModelConfigConnectionTestResultDto>(
        `/api/v1/model-configs/${encodeURIComponent(publicId)}/test-connection`,
        readRequiredSessionToken(),
        {},
      );

      return readApiData(response).connectionTest;
    },
    onToggleConfig: (publicId: string, isEnabled: boolean) =>
      postAdminAction(
        `/api/v1/model-configs/${publicId}/${isEnabled ? "enable" : "disable"}`,
        readRequiredSessionToken(),
      ),
    onToggleProvider: (publicId: string, isEnabled: boolean) =>
      postAdminAction(
        `/api/v1/model-providers/${publicId}/${isEnabled ? "enable" : "disable"}`,
        readRequiredSessionToken(),
      ),
  };
}

function readStoredSessionToken(): string | null {
  const sessionToken = localStorage.getItem(sessionTokenStorageKey)?.trim();

  return sessionToken === "" || sessionToken === undefined
    ? cookieBackedSessionToken
    : sessionToken;
}

function readRequiredSessionToken(): string {
  const sessionToken = readStoredSessionToken();

  if (sessionToken === null) {
    throw new Error("Admin session is required.");
  }

  return sessionToken;
}

async function fetchAdminApi<TData>(
  path: string,
  sessionToken: string,
): Promise<ApiResponse<TData | null>> {
  const response = await fetch(path, {
    credentials: "same-origin",
    headers: {
      authorization: `Bearer ${sessionToken}`,
    },
  });

  return (await response.json()) as ApiResponse<TData | null>;
}

async function postAdminApi<TData>(
  path: string,
  sessionToken: string,
  body: Record<string, unknown>,
): Promise<ApiResponse<TData | null>> {
  const response = await fetch(path, {
    body: JSON.stringify(body),
    credentials: "same-origin",
    headers: {
      authorization: `Bearer ${sessionToken}`,
      "content-type": "application/json",
    },
    method: "POST",
  });

  return (await response.json()) as ApiResponse<TData | null>;
}

async function postAdminAction(
  path: string,
  sessionToken: string,
): Promise<void> {
  const response = await postAdminApi<null>(path, sessionToken, {});

  ensureApiSuccess(response);
}

function ensureApiSuccess(response: ApiResponse<unknown>): void {
  if (response.code !== 0) {
    throw new Error(response.message);
  }
}

function readApiData<TData>(response: ApiResponse<TData | null>): TData {
  if (response.code !== 0 || response.data === null) {
    throw new Error(response.message);
  }

  return response.data;
}

function hasAnyRuntimeData(data: AdminAiAuditRuntimeData): boolean {
  return (
    data.modelProviders.length > 0 ||
    data.modelConfigs.length > 0 ||
    data.promptTemplates.length > 0 ||
    data.auditLogs.length > 0 ||
    data.aiCallLogs.length > 0 ||
    data.costSummaries.length > 0
  );
}

function formatOpsLogRoleLabel(role: AdminAiAuditLogOpsRoleMode): string {
  return role === "super_admin" ? "超级管理员" : "运营管理员";
}

function createAuditLogRuntimeQuery(query: AdminAuditLogQueryState): string {
  const searchParams = new URLSearchParams({
    page: String(query.page),
    pageSize: String(query.pageSize),
    sortBy: "createdAt",
    sortOrder: "desc",
  });
  const keyword = query.keyword.trim();

  if (keyword.length > 0) {
    searchParams.set("keyword", keyword);
  }

  if (query.resultStatus !== "all") {
    searchParams.set("resultStatus", query.resultStatus);
  }

  if (query.actionType !== "all") {
    searchParams.set("actionType", query.actionType);
  }

  if (query.targetResourceType !== "all") {
    searchParams.set("targetResourceType", query.targetResourceType);
  }

  if (query.fromDate.length > 0) {
    searchParams.set("fromCreatedAt", `${query.fromDate}T00:00:00.000Z`);
  }

  if (query.toDate.length > 0) {
    searchParams.set("toCreatedAt", `${query.toDate}T23:59:59.999Z`);
  }

  return searchParams.toString();
}

function createAiCallLogRuntimeQuery(query: AdminAiCallLogQueryState): string {
  const searchParams = new URLSearchParams({
    page: String(query.page),
    pageSize: String(query.pageSize),
    sortBy: "startedAt",
    sortOrder: "desc",
  });
  const keyword = query.keyword.trim();

  if (keyword.length > 0) {
    searchParams.set("keyword", keyword);
  }

  if (query.callStatus !== "all") {
    searchParams.set("callStatus", query.callStatus);
  }

  return searchParams.toString();
}

function filterAuditLogsForSplitPage(
  auditLogs: AuditLogListDto["auditLogs"],
  query: AdminAuditLogQueryState,
): AuditLogListDto["auditLogs"] {
  const keyword = query.keyword.trim().toLowerCase();

  return auditLogs.filter((auditLog) => {
    const matchesStatus =
      query.resultStatus === "all" ||
      auditLog.resultStatus === query.resultStatus;
    const matchesAction =
      query.actionType === "all" || auditLog.actionType === query.actionType;
    const matchesTarget =
      query.targetResourceType === "all" ||
      auditLog.targetResourceType === query.targetResourceType;
    const createdTimestamp = Date.parse(auditLog.createdAt);
    const fromTimestamp =
      query.fromDate.length === 0
        ? null
        : Date.parse(`${query.fromDate}T00:00:00.000Z`);
    const toTimestamp =
      query.toDate.length === 0
        ? null
        : Date.parse(`${query.toDate}T23:59:59.999Z`);
    const matchesDateRange =
      (fromTimestamp === null || createdTimestamp >= fromTimestamp) &&
      (toTimestamp === null || createdTimestamp <= toTimestamp);
    const matchesKeyword =
      keyword.length === 0 ||
      [
        auditLog.actionType,
        auditLog.actorRole,
        auditLog.targetResourceType,
        auditLog.resultStatus,
        auditLog.metadataSummary ?? "",
      ]
        .join(" ")
        .toLowerCase()
        .includes(keyword);

    return (
      matchesStatus &&
      matchesAction &&
      matchesTarget &&
      matchesDateRange &&
      matchesKeyword
    );
  });
}

function hasActiveAuditLogFilters(query: AdminAuditLogQueryState): boolean {
  return (
    query.keyword.trim().length > 0 ||
    query.actionType !== "all" ||
    query.targetResourceType !== "all" ||
    query.resultStatus !== "all" ||
    query.fromDate.length > 0 ||
    query.toDate.length > 0
  );
}

function filterAiCallLogsForSplitPage(
  aiCallLogs: AiCallLogListDto["aiCallLogs"],
  query: AdminAiCallLogQueryState,
): AiCallLogListDto["aiCallLogs"] {
  const keyword = query.keyword.trim().toLowerCase();

  return aiCallLogs.filter((aiCallLog) => {
    const matchesStatus =
      query.callStatus === "all" || aiCallLog.callStatus === query.callStatus;
    const matchesKeyword =
      keyword.length === 0 ||
      [
        aiCallLog.aiFuncType,
        aiCallLog.callStatus,
        aiCallLog.providerDisplayName,
        aiCallLog.modelAlias,
        aiCallLog.promptSummary ?? "",
        aiCallLog.outputSummary ?? "",
      ]
        .join(" ")
        .toLowerCase()
        .includes(keyword);

    return matchesStatus && matchesKeyword;
  });
}

function paginateAuditLogs(
  auditLogs: AuditLogListDto["auditLogs"],
  query: AdminAuditLogQueryState,
): AuditLogListDto["auditLogs"] {
  const start = (query.page - 1) * query.pageSize;

  return auditLogs.slice(start, start + query.pageSize);
}

function paginateAiCallLogs(
  aiCallLogs: AiCallLogListDto["aiCallLogs"],
  query: AdminAiCallLogQueryState,
): AiCallLogListDto["aiCallLogs"] {
  const start = (query.page - 1) * query.pageSize;

  return aiCallLogs.slice(start, start + query.pageSize);
}

async function loadAuditLogRuntimeData(
  sessionToken: string,
  runtimeQuery: string,
): Promise<typeof staticAuditLogRuntimeData> {
  const response = await fetchAdminApi<AuditLogListDto>(
    `/api/v1/audit-logs?${runtimeQuery}`,
    sessionToken,
  );

  return {
    auditLogs: readApiData(response).auditLogs,
    pagination: response.pagination ?? null,
  };
}

async function loadAiCallLogRuntimeData(
  sessionToken: string,
  runtimeQuery: string,
): Promise<typeof staticAiCallLogRuntimeData> {
  const [aiCallLogsResponse, summaryResponse] = await Promise.all([
    fetchAdminApi<AiCallLogListDto>(
      `/api/v1/ai-call-logs?${runtimeQuery}`,
      sessionToken,
    ),
    fetchAdminApi<{ dailySummaries: AiCallLogCostSummaryDto[] }>(
      `/api/v1/ai-call-logs/summary?${runtimeQuery}`,
      sessionToken,
    ),
  ]);

  return {
    aiCallLogs: readApiData(aiCallLogsResponse).aiCallLogs,
    costSummaries: readApiData(summaryResponse).dailySummaries,
    pagination: aiCallLogsResponse.pagination ?? null,
  };
}

function AdminSplitLogHeader({
  description,
  eyebrow,
  title,
}: {
  description: string;
  eyebrow: string;
  title: string;
}) {
  return (
    <header className="flex flex-col gap-2">
      <p className="text-brand-primary text-sm font-medium">{eyebrow}</p>
      <h1 className="font-heading text-text-primary text-2xl font-semibold">
        {title}
      </h1>
      <p className="text-text-secondary max-w-3xl text-sm leading-6">
        {description}
      </p>
    </header>
  );
}

function AdminSplitLogSummaryBand({
  description,
  metricItems,
  roleLabel,
  testId,
  title,
}: {
  description: string;
  metricItems: Array<{ label: string; value: number }>;
  roleLabel: string;
  testId: string;
  title: string;
}) {
  return (
    <section
      aria-label={title}
      className="bg-surface border-border rounded-md border p-4 shadow-sm"
      data-testid={testId}
    >
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-1">
          <p className="text-brand-primary text-xs font-medium">运营日志概览</p>
          <h2 className="text-text-primary text-base font-semibold">{title}</h2>
          <p className="text-text-secondary text-sm leading-6">{description}</p>
        </div>
        <span className="bg-secondary text-secondary-foreground w-fit rounded-lg px-2 py-1 text-xs font-medium">
          {roleLabel}
        </span>
      </div>
      <div className="mt-4 grid gap-3 md:grid-cols-3">
        {metricItems.map((metricItem) => (
          <AdminAiAuditSummaryTile
            key={metricItem.label}
            label={metricItem.label}
            value={String(metricItem.value)}
          />
        ))}
      </div>
    </section>
  );
}

function AdminAuditLogToolbar({
  currentRole,
  onChange,
  query,
  total,
}: {
  currentRole: AdminAiAuditLogOpsRoleMode;
  onChange: (query: AdminAuditLogQueryState) => void;
  query: AdminAuditLogQueryState;
  total: number;
}) {
  return (
    <AdminListToolbar
      description={`当前为${formatOpsLogRoleLabel(currentRole)}只读视角；筛选变化自动回到第一页，详情仅展示脱敏元数据。`}
      primaryAction={
        <Button
          disabled={!hasActiveAuditLogFilters(query) && query.pageSize === 20}
          size="lg"
          variant="outline"
          onClick={() => onChange(defaultAdminAuditLogQuery)}
        >
          <RotateCcw aria-hidden="true" />
          重置筛选
        </Button>
      }
      resultLabel={`共 ${total} 条审计日志`}
      title="审计日志筛选"
    >
      <label className={`${adminListFilterLabelClassName} min-w-56 flex-1`}>
        <span>关键词</span>
        <input
          aria-label="审计日志关键词"
          className={`${adminListControlClassName} border-input bg-background text-text-primary rounded-md border px-3 text-sm`}
          placeholder="搜索动作、角色、目标或摘要"
          value={query.keyword}
          onChange={(event) =>
            onChange({ ...query, keyword: event.target.value, page: 1 })
          }
        />
      </label>
      <label className={`${adminListFilterLabelClassName} min-w-44`}>
        <span>动作类型</span>
        <select
          aria-label="审计动作类型"
          className={`${adminListControlClassName} border-input bg-background text-text-primary rounded-md border px-3 text-sm`}
          value={query.actionType}
          onChange={(event) =>
            onChange({ ...query, actionType: event.target.value, page: 1 })
          }
        >
          {auditActionFilterOptions.map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </label>
      <label className={`${adminListFilterLabelClassName} min-w-40`}>
        <span>目标类别</span>
        <select
          aria-label="审计目标类别"
          className={`${adminListControlClassName} border-input bg-background text-text-primary rounded-md border px-3 text-sm`}
          value={query.targetResourceType}
          onChange={(event) =>
            onChange({
              ...query,
              page: 1,
              targetResourceType: event.target.value,
            })
          }
        >
          {auditTargetFilterOptions.map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </label>
      <label className={`${adminListFilterLabelClassName} min-w-32`}>
        <span>结果状态</span>
        <select
          aria-label="审计结果状态"
          className={`${adminListControlClassName} border-input bg-background text-text-primary rounded-md border px-3 text-sm`}
          value={query.resultStatus}
          onChange={(event) =>
            onChange({
              ...query,
              page: 1,
              resultStatus: event.target
                .value as AdminAuditLogQueryState["resultStatus"],
            })
          }
        >
          <option value="all">全部结果</option>
          <option value="success">成功</option>
          <option value="failed">失败</option>
        </select>
      </label>
      <label className={`${adminListFilterLabelClassName} min-w-40`}>
        <span>开始日期</span>
        <input
          aria-label="开始日期"
          className={`${adminListControlClassName} border-input bg-background text-text-primary rounded-md border px-3 text-sm`}
          max={query.toDate || undefined}
          type="date"
          value={query.fromDate}
          onChange={(event) =>
            onChange({ ...query, fromDate: event.target.value, page: 1 })
          }
        />
      </label>
      <label className={`${adminListFilterLabelClassName} min-w-40`}>
        <span>结束日期</span>
        <input
          aria-label="结束日期"
          className={`${adminListControlClassName} border-input bg-background text-text-primary rounded-md border px-3 text-sm`}
          min={query.fromDate || undefined}
          type="date"
          value={query.toDate}
          onChange={(event) =>
            onChange({ ...query, page: 1, toDate: event.target.value })
          }
        />
      </label>
      <label className={`${adminListFilterLabelClassName} min-w-28`}>
        <span>每页条数</span>
        <select
          aria-label="审计日志每页条数"
          className={`${adminListControlClassName} border-input bg-background text-text-primary rounded-md border px-3 text-sm`}
          value={query.pageSize}
          onChange={(event) =>
            onChange({
              ...query,
              page: 1,
              pageSize: Number(event.target.value) as AdminAiAuditLogPageSize,
            })
          }
        >
          {ADMIN_AI_AUDIT_LOG_PAGE_SIZE_OPTIONS.map((pageSizeOption) => (
            <option key={pageSizeOption} value={pageSizeOption}>
              {pageSizeOption}
            </option>
          ))}
        </select>
      </label>
    </AdminListToolbar>
  );
}

function AdminAiCallLogToolbar({
  currentRole,
  onChange,
  query,
  total,
}: {
  currentRole: AdminAiAuditLogOpsRoleMode;
  onChange: (query: AdminAiCallLogQueryState) => void;
  query: AdminAiCallLogQueryState;
  total: number;
}) {
  return (
    <AdminListToolbar
      description={`当前为${formatOpsLogRoleLabel(currentRole)}只读视角；成本仅作本地运营摘要，不用于供应商计费校准。`}
      primaryAction={
        <Button
          disabled={
            query.keyword.trim().length === 0 &&
            query.callStatus === "all" &&
            query.pageSize === 20
          }
          size="lg"
          variant="outline"
          onClick={() => onChange(defaultAdminAiCallLogQuery)}
        >
          <RotateCcw aria-hidden="true" />
          重置筛选
        </Button>
      }
      resultLabel={`共 ${total} 条 AI 调用日志`}
      title="AI 调用日志筛选"
    >
      <label className={`${adminListFilterLabelClassName} min-w-56 flex-1`}>
        <span>关键词</span>
        <input
          aria-label="AI 调用关键词"
          className={`${adminListControlClassName} border-input bg-background text-text-primary rounded-md border px-3 text-sm`}
          placeholder="搜索能力、模型或脱敏摘要"
          value={query.keyword}
          onChange={(event) =>
            onChange({ ...query, keyword: event.target.value, page: 1 })
          }
        />
      </label>
      <label className={`${adminListFilterLabelClassName} min-w-36`}>
        <span>调用状态</span>
        <select
          aria-label="AI 调用状态"
          className={`${adminListControlClassName} border-input bg-background text-text-primary rounded-md border px-3 text-sm`}
          value={query.callStatus}
          onChange={(event) =>
            onChange({
              ...query,
              callStatus: event.target
                .value as AdminAiCallLogQueryState["callStatus"],
              page: 1,
            })
          }
        >
          <option value="all">全部状态</option>
          <option value="success">成功</option>
          <option value="failed">失败</option>
        </select>
      </label>
      <label className={`${adminListFilterLabelClassName} min-w-28`}>
        <span>每页条数</span>
        <select
          aria-label="AI 调用日志每页条数"
          className={`${adminListControlClassName} border-input bg-background text-text-primary rounded-md border px-3 text-sm`}
          value={query.pageSize}
          onChange={(event) =>
            onChange({
              ...query,
              page: 1,
              pageSize: Number(event.target.value) as AdminAiAuditLogPageSize,
            })
          }
        >
          {ADMIN_AI_AUDIT_LOG_PAGE_SIZE_OPTIONS.map((pageSizeOption) => (
            <option key={pageSizeOption} value={pageSizeOption}>
              {pageSizeOption}
            </option>
          ))}
        </select>
      </label>
    </AdminListToolbar>
  );
}

const auditLogDateTimeFormatter = new Intl.DateTimeFormat("zh-CN", {
  day: "2-digit",
  hour: "2-digit",
  hour12: false,
  minute: "2-digit",
  month: "2-digit",
  timeZone: "Asia/Shanghai",
  year: "numeric",
});

function formatAuditLogTimestamp(value: string): string {
  const timestamp = Date.parse(value);

  return Number.isNaN(timestamp)
    ? "时间不可用"
    : auditLogDateTimeFormatter.format(timestamp);
}

function formatAuditMetadataSummary(value: string | null): string {
  return value ?? "已记录脱敏元数据";
}

function AdminAuditResultStatus({
  status,
}: {
  status: AuditLogSummaryDto["resultStatus"];
}) {
  const isSuccess = status === "success";

  return (
    <span
      className={`inline-flex items-center gap-1.5 text-sm font-medium ${isSuccess ? "text-success" : "text-destructive"}`}
    >
      {isSuccess ? (
        <CheckCircle2 aria-hidden="true" className="size-4" />
      ) : (
        <AlertCircle aria-hidden="true" className="size-4" />
      )}
      {formatAdminOpsDisplayValue(status)}
    </span>
  );
}

function AdminAuditLogTable({
  auditLogs,
  hasActiveFilters,
  onSelectAuditLog,
}: {
  auditLogs: AuditLogListDto["auditLogs"];
  hasActiveFilters: boolean;
  onSelectAuditLog: (publicId: string, trigger: HTMLButtonElement) => void;
}) {
  return (
    <AdminTableFrame ariaLabel="审计日志列表" minWidthClassName="min-w-[72rem]">
      <table aria-label="审计日志列表" className={adminDataTableClassName}>
        <thead className="bg-muted/60 text-text-muted">
          <tr>
            <th className="w-40 px-4 py-3 font-medium whitespace-nowrap">
              时间
            </th>
            <th className="w-36 px-4 py-3 font-medium whitespace-nowrap">
              操作者角色
            </th>
            <th className="w-52 px-4 py-3 font-medium">动作</th>
            <th className="w-44 px-4 py-3 font-medium">目标类别</th>
            <th className="w-28 px-4 py-3 font-medium whitespace-nowrap">
              结果
            </th>
            <th className="px-4 py-3 font-medium">摘要</th>
            <th className="w-28 px-4 py-3 text-right font-medium">操作</th>
          </tr>
        </thead>
        <tbody className="divide-border divide-y">
          {auditLogs.length === 0 ? (
            <tr>
              <td className="px-4 py-10 text-center" colSpan={7}>
                <p className="text-text-primary text-sm font-medium">
                  {hasActiveFilters ? "没有符合条件的审计日志" : "暂无审计日志"}
                </p>
                <p className="text-text-muted mt-2 text-xs">
                  {hasActiveFilters
                    ? "调整或重置筛选条件后重试。"
                    : "当前没有可展示的脱敏审计摘要。"}
                </p>
              </td>
            </tr>
          ) : null}
          {auditLogs.map((auditLog) => (
            <tr
              key={auditLog.publicId}
              data-public-id={auditLog.publicId}
              data-testid={`admin-audit-log-${auditLog.publicId}`}
            >
              <td className="text-text-secondary px-4 py-3 whitespace-nowrap">
                {formatAuditLogTimestamp(auditLog.createdAt)}
              </td>
              <td className="text-text-primary px-4 py-3 whitespace-nowrap">
                {formatAdminOpsDisplayValue(auditLog.actorRole)}
              </td>
              <td className="text-text-primary px-4 py-3 leading-5">
                {formatAuditActionType(auditLog.actionType)}
              </td>
              <td className="text-text-secondary px-4 py-3 leading-5">
                {formatAuditTargetType(auditLog.targetResourceType)}
              </td>
              <td className="px-4 py-3 whitespace-nowrap">
                <AdminAuditResultStatus status={auditLog.resultStatus} />
              </td>
              <td className="text-text-muted px-4 py-3 leading-5">
                {formatAuditMetadataSummary(auditLog.metadataSummary)}
              </td>
              <td className="px-4 py-3">
                <div className="flex justify-end">
                  <Button
                    aria-label={`查看${formatAuditActionType(
                      auditLog.actionType,
                    )}，${formatAuditTargetType(
                      auditLog.targetResourceType,
                    )}，${formatAuditLogTimestamp(
                      auditLog.createdAt,
                    )}的审计详情`}
                    size="lg"
                    variant="outline"
                    onClick={(event) =>
                      onSelectAuditLog(auditLog.publicId, event.currentTarget)
                    }
                  >
                    <Eye aria-hidden="true" />
                    查看详情
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </AdminTableFrame>
  );
}

function AdminAiCallLogTable({
  aiCallLogs,
  onSelectAiCallLog,
}: {
  aiCallLogs: AiCallLogListDto["aiCallLogs"];
  onSelectAiCallLog: (publicId: string) => void;
}) {
  return (
    <AdminTableFrame
      ariaLabel="AI 调用日志列表"
      minWidthClassName="min-w-[68rem]"
    >
      <table aria-label="AI 调用日志列表" className={adminDataTableClassName}>
        <thead className="bg-muted/60 text-text-muted">
          <tr>
            <th className="w-40 px-4 py-3 font-medium whitespace-nowrap">
              时间
            </th>
            <th className="w-36 px-4 py-3 font-medium">能力</th>
            <th className="w-52 px-4 py-3 font-medium">模型</th>
            <th className="w-24 px-4 py-3 font-medium whitespace-nowrap">
              状态
            </th>
            <th className="px-4 py-3 font-medium">摘要</th>
            <th className="w-24 px-4 py-3 font-medium whitespace-nowrap">
              用量
            </th>
            <th className="w-32 px-4 py-3 text-right font-medium">操作</th>
          </tr>
        </thead>
        <tbody className="divide-border divide-y">
          {aiCallLogs.length === 0 ? (
            <tr>
              <td className="px-4 py-10 text-center" colSpan={7}>
                <p className="text-text-primary text-sm font-medium">
                  暂无 AI 调用日志
                </p>
                <p className="text-text-muted mt-2 text-xs">
                  当前筛选条件下没有可展示的脱敏 AI 调用摘要。
                </p>
              </td>
            </tr>
          ) : null}
          {aiCallLogs.map((aiCallLog) => (
            <tr
              key={aiCallLog.publicId}
              data-public-id={aiCallLog.publicId}
              data-testid={`admin-ai-call-log-${aiCallLog.publicId}`}
            >
              <td className="text-text-secondary px-4 py-3 whitespace-nowrap">
                {formatAuditLogTimestamp(aiCallLog.startedAt)}
              </td>
              <td className="text-text-primary px-4 py-3">
                {formatAdminOpsDisplayValue(aiCallLog.aiFuncType)}
              </td>
              <td className="text-text-secondary px-4 py-3">
                {aiCallLog.providerDisplayName} / {aiCallLog.modelAlias}
              </td>
              <td className="px-4 py-3 whitespace-nowrap">
                <AdminAuditResultStatus status={aiCallLog.callStatus} />
              </td>
              <td className="text-text-muted px-4 py-3">
                {aiCallLog.promptSummary ?? "输入摘要不可用"}
              </td>
              <td className="text-text-secondary px-4 py-3">
                {aiCallLog.totalTokenCount ?? 0}
              </td>
              <td className="px-4 py-3">
                <div className="flex justify-end">
                  <AdminOpsDetailButton
                    label="查看脱敏详情"
                    accessibleLabel={`查看${formatAdminOpsDisplayValue(
                      aiCallLog.aiFuncType,
                    )}，${aiCallLog.providerDisplayName} / ${
                      aiCallLog.modelAlias
                    }，${formatAuditLogTimestamp(
                      aiCallLog.startedAt,
                    )}的调用详情`}
                    onClick={() => onSelectAiCallLog(aiCallLog.publicId)}
                  />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </AdminTableFrame>
  );
}

function AdminAiCallCostSummaryPanel({
  costSummaries,
}: {
  costSummaries: AiCallLogCostSummaryDto[];
}) {
  return (
    <AdminOpsPanel title="用量摘要">
      {costSummaries.length === 0 ? (
        <p className="text-text-muted text-sm">当前没有可展示的用量摘要。</p>
      ) : (
        <div>
          {costSummaries.map((costSummary) => (
            <AdminOpsSummaryRow
              key={[
                costSummary.bucket,
                costSummary.aiFuncType,
                costSummary.modelAlias,
              ].join("-")}
              label={`${costSummary.bucket} / ${formatAdminOpsDisplayValue(
                costSummary.aiFuncType,
              )}`}
              meta={[
                costSummary.providerDisplayName,
                costSummary.modelAlias,
                `调用次数：${costSummary.callCount}`,
                `失败：${costSummary.failedCount}`,
                `预估成本：${costSummary.estimatedCostCny} 元`,
              ].join(" / ")}
              publicId={`${costSummary.bucket}-${costSummary.aiFuncType}`}
            />
          ))}
        </div>
      )}
      <p className="text-text-muted mt-3 text-xs">
        用量摘要不展示供应商请求或响应内容，也不用于供应商计费校准。
      </p>
    </AdminOpsPanel>
  );
}

function AdminFormalAdoptionReviewPanel({
  candidate,
  onSubmit,
  review,
  state,
}: {
  candidate: { targetPublicId: string } | null;
  onSubmit: () => void;
  review: PersonalAiGenerationFormalAdoptionReviewDto["adoptionReview"] | null;
  state: AdminFormalAdoptionReviewState;
}) {
  const isSubmitting = state === "loading";
  const reviewStatus = review?.reviewStatus ?? "awaiting_metadata_review";
  const formalTargetWriteStatus =
    review?.formalTargetWriteStatus ?? "blocked_without_follow_up_task";
  const redactionStatus = review?.sourceReference.redactionStatus ?? "redacted";

  return (
    <section className="bg-surface border-border rounded-md border p-4 shadow-sm">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 space-y-2">
          <h2 className="text-text-primary text-base font-semibold">
            正式入库复核
          </h2>
          <p className="text-text-secondary max-w-3xl text-sm leading-6">
            仅提交元数据人工复核，结果保持脱敏；正式题库写入仍被后续任务阻断。
          </p>
          <div className="flex flex-wrap gap-2">
            <AdminOpsStatusBadge label="metadata-only" />
            <AdminOpsStatusBadge label={redactionStatus} />
            <AdminOpsStatusBadge label={formalTargetWriteStatus} />
          </div>
        </div>
        <button
          type="button"
          disabled={candidate === null || isSubmitting}
          onClick={onSubmit}
          className="bg-secondary text-secondary-foreground flex h-9 shrink-0 items-center justify-center rounded-lg px-3 text-sm font-medium transition-transform active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
        >
          提交元数据复核
        </button>
      </div>

      <dl className="border-border mt-4 grid gap-0 rounded-md border px-3 md:grid-cols-3">
        <AdminOpsDefinition label="reviewStatus" value={reviewStatus} />
        <AdminOpsDefinition
          label="formalTargetWriteStatus"
          value={formalTargetWriteStatus}
        />
        <AdminOpsDefinition label="redactionStatus" value={redactionStatus} />
      </dl>

      {candidate === null ? (
        <p className="text-text-muted mt-3 text-sm">暂无可复核的脱敏结果</p>
      ) : null}
      {state === "loading" ? (
        <p className="text-brand-primary mt-3 text-sm font-medium">
          正式入库复核提交中
        </p>
      ) : null}
      {state === "error" ? (
        <p className="text-warning bg-warning/10 mt-3 rounded-lg px-3 py-2 text-sm font-medium">
          正式入库复核暂不可用
        </p>
      ) : null}
    </section>
  );
}

function AdminOpsStatePanel({
  icon,
  title,
}: {
  icon: ReactNode;
  title: string;
}) {
  return (
    <div className="bg-surface border-border rounded-md border p-8 text-center shadow-sm">
      <div className="text-brand-primary mx-auto flex justify-center">
        {icon}
      </div>
      <h1 className="text-text-primary mt-4 text-base font-semibold">
        {title}
      </h1>
    </div>
  );
}

function AdminOpsStatusBadge({ label }: { label: string }) {
  return (
    <span className="bg-secondary text-secondary-foreground rounded-lg px-2 py-1 text-xs font-medium">
      {formatAdminOpsDisplayValue(label)}
    </span>
  );
}

function AdminOpsDefinition({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="border-border border-b py-3 last:border-b-0 md:border-r md:border-b-0 md:px-3 md:first:pl-0 md:last:border-r-0">
      <dt className="text-text-muted text-xs">
        {adminOpsDefinitionLabelMap[label] ?? label}
      </dt>
      <dd className="text-text-primary mt-1 text-sm font-medium">
        {formatAdminOpsDisplayValue(value)}
      </dd>
    </div>
  );
}

function AdminOpsPanel({
  children,
  title,
}: {
  children: ReactNode;
  title: string;
}) {
  return (
    <section className="bg-surface border-border rounded-md border p-4 shadow-sm">
      <h2 className="text-text-primary text-base font-semibold">{title}</h2>
      <div className="mt-3">{children}</div>
    </section>
  );
}

function AdminOpsQueryControls({
  onChange,
  query,
}: {
  onChange: (query: AdminAiAuditLogOpsQueryState) => void;
  query: AdminAiAuditLogOpsQueryState;
}) {
  return (
    <section className="bg-surface border-border rounded-md border p-4 shadow-sm">
      <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_12rem]">
        <label className="text-text-secondary flex flex-col gap-1 text-sm font-medium">
          <span>日志关键词</span>
          <input
            aria-label="日志关键词"
            className="border-input bg-background text-text-primary h-9 rounded-md border px-3 text-sm"
            value={query.keyword}
            onChange={(event) =>
              onChange({ ...query, keyword: event.target.value })
            }
          />
        </label>
        <label className="text-text-secondary flex flex-col gap-1 text-sm font-medium">
          <span>每页条数</span>
          <select
            aria-label="每页条数"
            className="border-input bg-background text-text-primary h-9 rounded-md border px-3 text-sm"
            value={query.pageSize}
            onChange={(event) =>
              onChange({
                ...query,
                pageSize: Number(event.target.value) as 20 | 50 | 100,
              })
            }
          >
            <option value={20}>20</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
        </label>
      </div>
    </section>
  );
}

function AdminOpsDetailButton({
  accessibleLabel,
  label,
  onClick,
}: {
  accessibleLabel?: string;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      aria-label={accessibleLabel ?? label}
      type="button"
      className="border-border text-text-secondary hover:bg-muted flex h-9 shrink-0 items-center rounded-md border px-3 text-sm font-medium active:scale-[0.98]"
      onClick={onClick}
    >
      <Eye aria-hidden="true" className="mr-2 size-4" />
      {label}
    </button>
  );
}

function AdminAuditLogDetailDrawer({
  auditLog,
  onClose,
}: {
  auditLog: AuditLogSummaryDto;
  onClose: () => void;
}) {
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", handleKeyDown);
    closeButtonRef.current?.focus();

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  return (
    <div
      className="bg-foreground/30 fixed inset-0 z-50 flex justify-end"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <aside
        aria-label="审计日志详情"
        aria-modal="true"
        className="bg-surface border-border flex h-full w-full max-w-lg flex-col border-l shadow-xl"
        role="dialog"
      >
        <header className="border-border flex items-start justify-between gap-4 border-b p-5">
          <div className="space-y-1">
            <h2 className="text-text-primary text-lg font-semibold">
              审计日志详情
            </h2>
            <p className="text-text-muted text-sm">仅展示脱敏元数据</p>
          </div>
          <Button
            ref={closeButtonRef}
            aria-label="关闭审计日志详情"
            size="icon-lg"
            variant="ghost"
            onClick={onClose}
          >
            <X aria-hidden="true" />
          </Button>
        </header>
        <div className="flex-1 space-y-5 overflow-y-auto p-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <AdminOpsReadonlyDetail
              label="发生时间"
              value={formatAuditLogTimestamp(auditLog.createdAt)}
            />
            <AdminOpsReadonlyDetail
              label="操作者角色"
              value={formatAdminOpsDisplayValue(auditLog.actorRole)}
            />
            <AdminOpsReadonlyDetail
              label="动作"
              value={formatAuditActionType(auditLog.actionType)}
            />
            <AdminOpsReadonlyDetail
              label="目标类别"
              value={formatAuditTargetType(auditLog.targetResourceType)}
            />
          </div>
          <div className="space-y-2">
            <p className="text-text-muted text-xs">执行结果</p>
            <AdminAuditResultStatus status={auditLog.resultStatus} />
          </div>
          <AdminOpsReadonlyDetail
            label="脱敏摘要"
            value={formatAuditMetadataSummary(auditLog.metadataSummary)}
          />
          <div className="border-border bg-muted/40 rounded-md border p-4">
            <p className="text-text-secondary text-sm font-medium">
              仅展示已脱敏摘要
            </p>
            <p className="text-text-muted mt-3 text-xs leading-5">
              原始请求体、凭证、会话、卡密明文、内部标识和完整业务内容不在此处展示。
            </p>
          </div>
        </div>
      </aside>
    </div>
  );
}

function AdminAuditLogDetailPanel({
  auditLog,
}: {
  auditLog: AuditLogSummaryDto | null;
}) {
  return (
    <AdminOpsPanel title="审计日志详情">
      {auditLog === null ? (
        <p className="text-text-muted text-sm">
          选择一条审计日志查看脱敏详情。
        </p>
      ) : (
        <div className="space-y-3">
          <AdminOpsReadonlyDetail
            label="动作"
            value={formatAuditActionType(auditLog.actionType)}
          />
          <AdminOpsReadonlyDetail
            label="对象"
            value={formatAuditTargetType(auditLog.targetResourceType)}
          />
          <AdminOpsReadonlyDetail
            label="结果"
            value={formatAdminOpsDisplayValue(auditLog.resultStatus)}
          />
          <AdminOpsReadonlyDetail
            label="摘要"
            value={auditLog.metadataSummary ?? "已脱敏元数据"}
          />
          <div className="flex flex-wrap gap-1">
            <AdminOpsStatusBadge label="仅元数据" />
            <AdminOpsStatusBadge label="已脱敏" />
            <AdminOpsStatusBadge label="仅摘要" />
          </div>
          <p className="text-text-muted text-xs">
            原始请求体、密钥、卡密、会话和内部自增 ID 不展示。
          </p>
        </div>
      )}
    </AdminOpsPanel>
  );
}

function AdminAiCallLogDetailPanel({
  aiCallLog,
}: {
  aiCallLog: AiCallLogListDto["aiCallLogs"][number] | null;
}) {
  return (
    <AdminOpsPanel title="AI 调用日志详情">
      {aiCallLog === null ? (
        <p className="text-text-muted text-sm">
          选择一条 AI 调用日志查看脱敏详情。
        </p>
      ) : (
        <div className="space-y-3">
          <AdminOpsReadonlyDetail
            label="能力"
            value={formatAdminOpsDisplayValue(aiCallLog.aiFuncType)}
          />
          <AdminOpsReadonlyDetail
            label="模型"
            value={`${aiCallLog.providerDisplayName} / ${aiCallLog.modelAlias}`}
          />
          <AdminOpsReadonlyDetail
            label="状态"
            value={formatAdminOpsDisplayValue(aiCallLog.callStatus)}
          />
          <AdminOpsReadonlyDetail
            label="输入摘要"
            value={aiCallLog.promptSummary ?? "输入摘要不可用"}
          />
          <AdminOpsReadonlyDetail
            label="输出摘要"
            value={aiCallLog.outputSummary ?? "输出摘要已脱敏"}
          />
          <AdminOpsReadonlyDetail
            label="用量"
            value={String(aiCallLog.totalTokenCount ?? 0)}
          />
          <div className="flex flex-wrap gap-1">
            <AdminOpsStatusBadge label="已脱敏" />
            <AdminOpsStatusBadge label="仅摘要" />
          </div>
          <p className="text-text-muted text-xs">
            原始 Prompt、Provider 请求/响应、原始 AI
            输入输出和完整材料内容不展示。
          </p>
        </div>
      )}
    </AdminOpsPanel>
  );
}

function AdminOpsReadonlyDetail({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="border-border border-b pb-2 last:border-b-0 last:pb-0">
      <dt className="text-text-muted text-xs">{label}</dt>
      <dd className="text-text-primary mt-1 text-sm font-medium">{value}</dd>
    </div>
  );
}

function AdminOpsSummaryRow({
  badges = [],
  children,
  label,
  meta,
  publicId,
  testId,
}: {
  badges?: string[];
  children?: ReactNode;
  label: string;
  meta: string;
  publicId: string;
  testId?: string;
}) {
  return (
    <div
      className="border-border flex items-center justify-between gap-4 border-t py-3 first:border-t-0 first:pt-0 last:pb-0"
      data-public-id={publicId}
      data-testid={testId}
    >
      <div>
        <p className="text-text-primary text-sm font-medium">{label}</p>
        <p className="text-text-muted text-xs">{meta}</p>
        {badges.length === 0 ? null : (
          <div className="mt-2 flex flex-wrap gap-1">
            {badges.map((badge) => (
              <AdminOpsStatusBadge key={badge} label={badge} />
            ))}
          </div>
        )}
      </div>
      {children}
    </div>
  );
}
