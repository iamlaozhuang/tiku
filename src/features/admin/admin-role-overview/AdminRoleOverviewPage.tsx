"use client";

import Link from "next/link";
import {
  ArrowRight,
  BookOpenText,
  Building2,
  CheckCircle2,
  CircleAlert,
  FileText,
  FolderOpen,
  KeyRound,
  ScrollText,
  ShieldCheck,
  Sparkles,
  UserRoundCog,
  WandSparkles,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useEffect, useState } from "react";

import {
  AdminErrorState,
  AdminLoadingState,
  AdminUnauthorizedState,
  fetchAdminApi,
  getStoredSessionToken,
} from "@/features/admin/content-admin-runtime";
import type {
  AdminContentOverviewSummaryDto,
  AdminOperationsOverviewSummaryDto,
  AdminOverviewScope,
  AdminRoleOverviewDto,
} from "@/server/contracts/admin-role-overview-contract";

type OverviewLoadState =
  | { status: "loading" }
  | { status: "ready"; data: AdminRoleOverviewDto }
  | { status: "unauthorized" }
  | { status: "error" };

type OverviewMetric = {
  description: string;
  label: string;
  value: number;
};

type OverviewEntry = {
  description: string;
  href: string;
  Icon: LucideIcon;
  label: string;
};

const overviewCopy = {
  platform: {
    eyebrow: "平台监督",
    title: "平台监督总览",
    description:
      "查看跨工作区风险与入口；具体处理仍回到运营、内容或已选择的组织上下文。",
  },
  operations: {
    eyebrow: "运营后台",
    title: "运营工作台",
    description:
      "优先核对账号、企业授权、卡密和日志状态，再进入专属页面执行操作。",
  },
  content: {
    eyebrow: "内容后台",
    title: "内容工作台",
    description:
      "按正式内容生命周期和 AI 草稿评审状态安排题库、试卷与资源维护。",
  },
} satisfies Record<
  AdminOverviewScope,
  { eyebrow: string; title: string; description: string }
>;

const platformEntries: OverviewEntry[] = [
  {
    label: "进入运营后台",
    description: "处理用户、企业授权、卡密与日志治理。",
    href: "/ops/overview",
    Icon: ShieldCheck,
  },
  {
    label: "进入内容后台",
    description: "查看正式内容生命周期与 AI 草稿评审。",
    href: "/content/overview",
    Icon: BookOpenText,
  },
  {
    label: "选择企业与组织上下文",
    description: "先在企业管理中确定范围，再进入组织后台。",
    href: "/ops/organizations",
    Icon: Building2,
  },
];

const operationsEntries: OverviewEntry[] = [
  {
    label: "用户管理",
    description: "查找学员、员工与后台账号，处理账号安全操作。",
    href: "/ops/users",
    Icon: UserRoundCog,
  },
  {
    label: "企业管理",
    description: "维护企业结构、员工范围和企业授权。",
    href: "/ops/organizations",
    Icon: Building2,
  },
  {
    label: "卡密与企业授权",
    description: "生成和核对卡密状态，处理授权运营。",
    href: "/ops/redeem-codes",
    Icon: KeyRound,
  },
  {
    label: "审计日志",
    description: "查看系统操作审计摘要和失败状态。",
    href: "/ops/audit-logs",
    Icon: ScrollText,
  },
  {
    label: "AI 调用日志",
    description: "查看 AI 调用状态、失败和用量摘要。",
    href: "/ops/ai-call-logs",
    Icon: WandSparkles,
  },
  {
    label: "购买联系方式",
    description: "维护学员端购买与支持联系信息。",
    href: "/ops/contact-config",
    Icon: ShieldCheck,
  },
];

const contentEntries: OverviewEntry[] = [
  {
    label: "试卷与发布",
    description: "维护草稿、发布、下架与复制新草稿。",
    href: "/content/papers",
    Icon: FileText,
  },
  {
    label: "题库题目",
    description: "维护正式题目及其可用和锁定状态。",
    href: "/content/questions",
    Icon: BookOpenText,
  },
  {
    label: "材料库",
    description: "管理可复用材料及引用边界。",
    href: "/content/materials",
    Icon: FolderOpen,
  },
  {
    label: "资源与知识库",
    description: "查看资源处理、索引和检索就绪状态。",
    href: "/content/resources",
    Icon: FolderOpen,
  },
  {
    label: "AI出题",
    description: "生成待评审的完整题目草稿候选。",
    href: "/content/ai-question-generation",
    Icon: WandSparkles,
  },
  {
    label: "AI组卷",
    description: "生成组卷方案并从允许的正式题源选题。",
    href: "/content/ai-paper-generation",
    Icon: Sparkles,
  },
  {
    label: "知识点",
    description: "维护知识点结构和资源关联状态。",
    href: "/content/knowledge-nodes",
    Icon: BookOpenText,
  },
];

function createOperationsAttentionMetrics(
  summary: AdminOperationsOverviewSummaryDto,
): OverviewMetric[] {
  return [
    {
      label: "停用账号",
      value: summary.disabledUserTotal,
      description: "需要确认停用原因和后续账号安排。",
    },
    {
      label: "授权需核对",
      value: summary.authorizationAttentionTotal,
      description: "包含非生效或进入三十天到期窗口的授权。",
    },
    {
      label: "AI调用失败",
      value: summary.failedAiCallTotal,
      description: "仅展示失败数量，明细进入脱敏日志页。",
    },
  ];
}

function createContentAttentionMetrics(
  summary: AdminContentOverviewSummaryDto,
): OverviewMetric[] {
  return [
    {
      label: "内容待处理",
      value: summary.draftPaperTotal + summary.aiDraftReviewTotal,
      description: "正式试卷草稿与隔离的 AI 草稿均需人工处理。",
    },
    {
      label: "AI草稿待审",
      value: summary.aiDraftReviewTotal,
      description: "AI 结果仍是候选内容，不能直接成为正式内容。",
    },
    {
      label: "停用题目",
      value: summary.disabledQuestionTotal,
      description: "确认停用原因、引用影响和安全替代路径。",
    },
  ];
}

function getAttentionMetrics(data: AdminRoleOverviewDto): OverviewMetric[] {
  if (data.scope === "platform") {
    return [
      ...createOperationsAttentionMetrics(data.operations).slice(0, 2),
      createContentAttentionMetrics(data.content)[0],
      createOperationsAttentionMetrics(data.operations)[2],
    ];
  }

  return data.scope === "operations"
    ? createOperationsAttentionMetrics(data.summary)
    : createContentAttentionMetrics(data.summary);
}

function getStatusMetrics(data: AdminRoleOverviewDto): OverviewMetric[] {
  const operations =
    data.scope === "platform"
      ? data.operations
      : data.scope === "operations"
        ? data.summary
        : null;
  const content =
    data.scope === "platform"
      ? data.content
      : data.scope === "content"
        ? data.summary
        : null;

  if (operations !== null) {
    return [
      {
        label: "用户总数",
        value: operations.userTotal,
        description: "学员与员工账号汇总。",
      },
      {
        label: "企业总数",
        value: operations.organizationTotal,
        description: "平台当前企业记录汇总。",
      },
      {
        label: "未使用卡密",
        value: operations.unusedRedeemCodeTotal,
        description: "仅显示状态数量，不展示卡密内容。",
      },
    ];
  }

  return [
    {
      label: "可用题目",
      value: content?.availableQuestionTotal ?? 0,
      description: "正式题库当前可用题目。",
    },
    {
      label: "试卷草稿",
      value: content?.draftPaperTotal ?? 0,
      description: "仍可编辑、尚未发布的正式试卷。",
    },
    {
      label: "已发布试卷",
      value: content?.publishedPaperTotal ?? 0,
      description: "已进入正式内容生命周期的试卷。",
    },
  ];
}

function getEntries(scope: AdminOverviewScope): OverviewEntry[] {
  if (scope === "platform") return platformEntries;
  return scope === "operations" ? operationsEntries : contentEntries;
}

async function loadOverview(scope: AdminOverviewScope) {
  return fetchAdminApi<AdminRoleOverviewDto>(
    `/api/v1/admin-overviews?scope=${scope}`,
    getStoredSessionToken(),
  );
}

export function AdminRoleOverviewPage({
  scope,
}: {
  scope: AdminOverviewScope;
}) {
  const [loadState, setLoadState] = useState<OverviewLoadState>({
    status: "loading",
  });

  useEffect(() => {
    let isActive = true;

    void loadOverview(scope)
      .then((response) => {
        if (!isActive) return;

        if (response.code === 401190 || response.code === 401001) {
          setLoadState({ status: "unauthorized" });
          return;
        }

        if (response.code !== 0 || response.data === null) {
          setLoadState({ status: "error" });
          return;
        }

        setLoadState({ status: "ready", data: response.data });
      })
      .catch(() => {
        if (isActive) setLoadState({ status: "error" });
      });

    return () => {
      isActive = false;
    };
  }, [scope]);

  if (loadState.status === "loading") {
    return <AdminLoadingState label="正在加载角色总览" />;
  }

  if (loadState.status === "unauthorized") {
    return <AdminUnauthorizedState />;
  }

  if (loadState.status === "error") {
    return (
      <AdminErrorState
        title="总览数据加载失败"
        description="当前无法读取脱敏汇总，请稍后刷新或返回已授权的工作区。"
      />
    );
  }

  return <AdminRoleOverviewWorkbench data={loadState.data} />;
}

function AdminRoleOverviewWorkbench({ data }: { data: AdminRoleOverviewDto }) {
  const copy = overviewCopy[data.scope];
  const attentionMetrics = getAttentionMetrics(data);
  const statusMetrics = getStatusMetrics(data);
  const hasAttention = attentionMetrics.some((metric) => metric.value > 0);

  return (
    <main className="space-y-6">
      <header className="space-y-2">
        <p className="text-brand-primary text-xs font-medium">{copy.eyebrow}</p>
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-2">
            <h1 className="font-heading text-text-primary text-2xl font-semibold">
              {copy.title}
            </h1>
            <p className="text-text-secondary max-w-3xl text-sm leading-6">
              {copy.description}
            </p>
          </div>
          <span className="bg-secondary text-secondary-foreground w-fit rounded-md px-2 py-1 text-xs font-medium">
            {data.roleLabel}
          </span>
        </div>
      </header>

      <section
        aria-labelledby="overview-attention-heading"
        className="space-y-3"
      >
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2
              id="overview-attention-heading"
              className="text-text-primary text-base font-semibold"
            >
              待处理
            </h2>
            <p className="text-text-muted mt-1 text-sm">
              只显示需要优先核对的聚合状态。
            </p>
          </div>
          <CircleAlert aria-hidden="true" className="text-text-muted size-5" />
        </div>
        {hasAttention ? (
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            {attentionMetrics.map((metric) => (
              <MetricCard key={metric.label} metric={metric} />
            ))}
          </div>
        ) : (
          <div className="border-border bg-surface flex items-center gap-3 rounded-md border px-4 py-3">
            <CheckCircle2
              aria-hidden="true"
              className="text-brand-primary size-5"
            />
            <p className="text-text-secondary text-sm">
              当前没有需要优先处理的异常
            </p>
          </div>
        )}
      </section>

      <section
        aria-labelledby="overview-status-heading"
        className="border-border space-y-3 border-t pt-5"
      >
        <div>
          <h2
            id="overview-status-heading"
            className="text-text-primary text-base font-semibold"
          >
            {data.scope === "content" ? "正式内容" : "运行概况"}
          </h2>
          <p className="text-text-muted mt-1 text-sm">
            可信汇总用于定位工作，不替代专属页面明细。
          </p>
        </div>
        <div className="grid gap-3 md:grid-cols-3">
          {statusMetrics.map((metric) => (
            <MetricCard key={metric.label} metric={metric} />
          ))}
        </div>
      </section>

      <section
        aria-labelledby="overview-entry-heading"
        className="border-border space-y-3 border-t pt-5"
      >
        <div>
          <h2
            id="overview-entry-heading"
            className="text-text-primary text-base font-semibold"
          >
            工作入口
          </h2>
          <p className="text-text-muted mt-1 text-sm">
            进入对应数据域后再查看明细或执行操作。
          </p>
        </div>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {getEntries(data.scope).map((entry) => (
            <OverviewEntryLink entry={entry} key={entry.href} />
          ))}
        </div>
      </section>

      <section
        aria-label="总览数据边界"
        className="border-border bg-muted/50 flex gap-3 rounded-md border px-4 py-3"
      >
        <ShieldCheck
          aria-hidden="true"
          className="text-brand-primary mt-0.5 size-5 shrink-0"
        />
        <div className="space-y-1">
          <p className="text-text-primary text-sm font-medium">聚合只读边界</p>
          <p className="text-text-secondary text-sm leading-6">
            本页只展示聚合状态并提供安全入口；高风险写操作、敏感明细和跨域内容均留在各自专属页面。
          </p>
          {data.scope === "content" ? (
            <p className="text-text-secondary text-sm leading-6">
              AI组卷先生成方案，再从允许的正式题源选题；AI
              草稿必须经过评审后才能进入正式内容生命周期。
            </p>
          ) : null}
        </div>
      </section>
    </main>
  );
}

function MetricCard({ metric }: { metric: OverviewMetric }) {
  return (
    <article className="border-border bg-surface min-w-0 rounded-md border p-4 shadow-sm">
      <p className="text-text-secondary text-sm">{metric.label}</p>
      <p className="text-text-primary mt-2 text-2xl font-semibold tabular-nums">
        {metric.value.toLocaleString("zh-CN")}
      </p>
      <p className="text-text-muted mt-2 text-xs leading-5">
        {metric.description}
      </p>
    </article>
  );
}

function OverviewEntryLink({ entry }: { entry: OverviewEntry }) {
  const Icon = entry.Icon;

  return (
    <Link
      aria-label={entry.label}
      className="border-border bg-surface hover:bg-muted group flex min-h-28 items-start gap-3 rounded-md border p-4 shadow-sm transition-colors"
      href={entry.href}
    >
      <span className="bg-secondary text-secondary-foreground flex size-9 shrink-0 items-center justify-center rounded-md">
        <Icon aria-hidden="true" className="size-4" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="text-text-primary flex items-center justify-between gap-2 text-sm font-semibold">
          {entry.label}
          <ArrowRight
            aria-hidden="true"
            className="text-text-muted size-4 shrink-0 transition-transform group-hover:translate-x-0.5"
          />
        </span>
        <span className="text-text-muted mt-2 block text-xs leading-5">
          {entry.description}
        </span>
      </span>
    </Link>
  );
}
