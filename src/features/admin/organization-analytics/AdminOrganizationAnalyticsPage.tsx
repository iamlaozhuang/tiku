"use client";

import { useEffect, useState } from "react";
import {
  BarChart3,
  Download,
  RefreshCw,
  ShieldCheck,
  TrendingUp,
  Users,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { AuthContextDto } from "@/server/contracts/auth-contract";
import type { AdminWorkspaceCapabilitySummary } from "@/server/contracts/admin-workspace-role-guard-contract";
import type {
  OrganizationAnalyticsDashboardRouteDto,
  OrganizationAnalyticsEmployeeStatisticsRouteDto,
  OrganizationAnalyticsRedactedStatisticsBoundaryDto,
} from "@/server/contracts/organization-analytics-contract";

import {
  AdminErrorState,
  AdminLoadingState,
  AdminUnauthorizedState,
  AdminUpgradeRequiredState,
  fetchAdminApi,
  getStoredSessionToken,
  isAdminContext,
  isUnauthorizedResponse,
} from "../content-admin-runtime";
import { resolveOrganizationWorkspacePageAccess } from "../organization-workspace/admin-organization-workspace-access";

type AdminOrganizationAnalyticsLoadState =
  | "loading"
  | "ready"
  | "standard-unavailable"
  | "unauthorized"
  | "error";

type DashboardSummaryFormValues = {
  organizationPublicId: string;
  startAt: string;
  endAt: string;
};

const defaultDashboardSummaryFormValues: DashboardSummaryFormValues = {
  organizationPublicId: "",
  startAt: "2026-06-01T00:00:00.000Z",
  endAt: "2026-06-16T00:00:00.000Z",
};

function createDashboardSummaryPath(values: DashboardSummaryFormValues) {
  const searchParams = new URLSearchParams({
    organizationPublicId: values.organizationPublicId.trim(),
    startAt: values.startAt.trim(),
    endAt: values.endAt.trim(),
  });

  return `/api/v1/organization-analytics/dashboard-summary?${searchParams.toString()}`;
}

function createEmployeeStatisticsPath(values: DashboardSummaryFormValues) {
  const searchParams = new URLSearchParams({
    organizationPublicId: values.organizationPublicId.trim(),
    startAt: values.startAt.trim(),
    endAt: values.endAt.trim(),
  });

  return `/api/v1/organization-analytics/employee-statistics?${searchParams.toString()}`;
}

function formatPercent(value: number) {
  return `${Math.round(value * 100)}%`;
}

function formatNullableNumber(value: number | null) {
  return value === null ? "暂无" : String(value);
}

function formatRedactionStatus(value: string) {
  if (value === "aggregate_only") {
    return "聚合脱敏";
  }

  if (value === "summary_only") {
    return "摘要脱敏";
  }

  return "已脱敏";
}

function resolveOrganizationAnalyticsLoadState(authContext: AuthContextDto): {
  capabilitySummary: AdminWorkspaceCapabilitySummary;
  loadState: AdminOrganizationAnalyticsLoadState;
} {
  const pageAccess = resolveOrganizationWorkspacePageAccess(
    authContext,
    "/organization/organization-analytics",
  );

  return {
    capabilitySummary: pageAccess.capabilitySummary,
    loadState: pageAccess.loadState,
  };
}

export function AdminOrganizationAnalyticsPage() {
  const [loadState, setLoadState] =
    useState<AdminOrganizationAnalyticsLoadState>("loading");
  const [formValues, setFormValues] = useState(
    defaultDashboardSummaryFormValues,
  );
  const [summary, setSummary] =
    useState<OrganizationAnalyticsDashboardRouteDto | null>(null);
  const [employeeStatistics, setEmployeeStatistics] =
    useState<OrganizationAnalyticsEmployeeStatisticsRouteDto | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

        const accessState = resolveOrganizationAnalyticsLoadState(
          sessionResponse.data,
        );

        if (accessState.loadState === "ready") {
          setFormValues((currentValues) => ({
            ...currentValues,
            organizationPublicId:
              accessState.capabilitySummary.organizationPublicId ??
              currentValues.organizationPublicId,
          }));
        }

        setLoadState(accessState.loadState);
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
  }, []);

  if (loadState === "loading") {
    return <AdminLoadingState label="正在加载组织统计" />;
  }

  if (loadState === "unauthorized") {
    return <AdminUnauthorizedState />;
  }

  if (loadState === "standard-unavailable") {
    return (
      <AdminUpgradeRequiredState
        description="标准版组织后台暂不开放统计摘要，请在组织概览查看员工管理和授权状态。升级需由运营管理员维护高级版 org_auth。"
        returnHref="/organization/portal"
        returnLabel="返回组织概览"
        title="标准版暂不可用"
      />
    );
  }

  if (loadState === "error") {
    return (
      <AdminErrorState
        title="组织统计加载失败"
        description="请刷新页面，或重新登录后再进入组织统计。"
      />
    );
  }

  async function handleLoadDashboardSummary(
    values: DashboardSummaryFormValues,
  ) {
    const sessionToken = getStoredSessionToken();

    setIsSubmitting(true);
    setErrorMessage(null);
    setMessage(null);
    setEmployeeStatistics(null);

    try {
      const [summaryResponse, employeeStatisticsResponse] = await Promise.all([
        fetchAdminApi<OrganizationAnalyticsDashboardRouteDto>(
          createDashboardSummaryPath(values),
          sessionToken,
        ),
        fetchAdminApi<OrganizationAnalyticsEmployeeStatisticsRouteDto>(
          createEmployeeStatisticsPath(values),
          sessionToken,
        ),
      ]);

      if (
        isUnauthorizedResponse(summaryResponse) ||
        isUnauthorizedResponse(employeeStatisticsResponse)
      ) {
        setLoadState("unauthorized");
        return;
      }

      if (summaryResponse.code !== 0 || summaryResponse.data === null) {
        setSummary(null);
        setErrorMessage("统计摘要加载失败。");
        return;
      }

      if (
        employeeStatisticsResponse.code !== 0 ||
        employeeStatisticsResponse.data === null
      ) {
        setSummary(summaryResponse.data);
        setEmployeeStatistics(null);
        setErrorMessage("员工统计加载失败。");
        return;
      }

      setSummary(summaryResponse.data);
      setEmployeeStatistics(employeeStatisticsResponse.data);
      setMessage("统计摘要已加载。");
    } catch {
      setSummary(null);
      setEmployeeStatistics(null);
      setErrorMessage("统计摘要加载失败。");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="space-y-6">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-2">
          <p className="text-brand-primary text-sm font-medium">组织后台</p>
          <h1 className="font-heading text-text-primary text-2xl font-semibold">
            统计摘要
          </h1>
          <p className="text-text-secondary max-w-2xl text-sm leading-6">
            查看组织训练聚合统计，仅展示脱敏汇总，不展示员工原始作答。
          </p>
          <p className="text-text-secondary text-sm">
            仅展示汇总趋势和脱敏员工统计
          </p>
        </div>
        <div className="bg-secondary text-secondary-foreground flex size-11 items-center justify-center rounded-md">
          <ShieldCheck aria-hidden="true" className="size-5" />
        </div>
      </header>

      {message === null ? null : (
        <div className="bg-success/10 text-success rounded-md px-4 py-3 text-sm">
          {message}
        </div>
      )}
      {errorMessage === null ? null : (
        <div className="bg-destructive/10 text-destructive rounded-md px-4 py-3 text-sm">
          {errorMessage}
        </div>
      )}

      <DashboardSummaryForm
        isSubmitting={isSubmitting}
        values={formValues}
        onChange={setFormValues}
        onSubmit={handleLoadDashboardSummary}
      />

      <Button
        className="w-fit"
        data-testid="organization-analytics-export-readiness"
        disabled
        type="button"
      >
        <Download aria-hidden="true" className="size-4" />
        导出需单独审批
      </Button>

      {summary === null ? null : <DashboardSummaryCard summary={summary} />}
      <EmployeeStatisticsCard
        employeeStatistics={employeeStatistics}
        isLoading={isSubmitting}
      />
    </section>
  );
}

function DashboardSummaryForm({
  isSubmitting,
  values,
  onChange,
  onSubmit,
}: {
  isSubmitting: boolean;
  values: DashboardSummaryFormValues;
  onChange: (values: DashboardSummaryFormValues) => void;
  onSubmit: (values: DashboardSummaryFormValues) => void;
}) {
  const hasScopedOrganization = values.organizationPublicId.trim().length > 0;

  return (
    <form
      aria-label="组织统计摘要表单"
      className="bg-surface border-border grid gap-4 rounded-md border p-4 shadow-sm lg:grid-cols-[1fr_1fr_1fr_auto]"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit(values);
      }}
    >
      {hasScopedOrganization ? (
        <div
          className="bg-muted grid gap-2 rounded-md px-3 py-2 text-sm"
          data-testid="organization-analytics-scope-context"
        >
          <span className="text-text-secondary font-medium">组织范围</span>
          <span className="text-text-primary font-semibold">
            {values.organizationPublicId}
          </span>
        </div>
      ) : (
        <TextField
          label="组织业务标识"
          value={values.organizationPublicId}
          onChange={(value) =>
            onChange({ ...values, organizationPublicId: value })
          }
        />
      )}
      <TextField
        label="开始时间"
        value={values.startAt}
        onChange={(value) => onChange({ ...values, startAt: value })}
      />
      <TextField
        label="结束时间"
        value={values.endAt}
        onChange={(value) => onChange({ ...values, endAt: value })}
      />
      <div className="flex items-end">
        <Button className="w-full" disabled={isSubmitting} type="submit">
          <RefreshCw aria-hidden="true" className="size-4" />
          加载统计摘要
        </Button>
      </div>
    </form>
  );
}

function DashboardSummaryCard({
  summary,
}: {
  summary: OrganizationAnalyticsDashboardRouteDto;
}) {
  return (
    <article
      className="bg-surface border-border grid gap-4 rounded-md border p-4 shadow-sm"
      data-public-id={summary.organizationPublicId}
      data-testid={`organization-analytics-summary-${summary.organizationPublicId}`}
    >
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div className="space-y-1">
          <h2 className="text-text-primary flex items-center gap-2 text-base font-semibold">
            <BarChart3 aria-hidden="true" className="size-4" />
            统计摘要
          </h2>
          <p className="text-text-secondary text-sm">
            {summary.organizationPublicId}
          </p>
        </div>
        <span className="bg-success/10 text-success rounded-md px-3 py-1 text-xs font-medium">
          {formatRedactionStatus(summary.redactionStatus)}
        </span>
      </div>

      <RedactedStatisticsBoundaryPanel
        boundary={summary.redactedStatisticsBoundary}
      />

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="可参与员工"
          value={summary.trainingSummary.eligibleEmployeeCount}
        />
        <MetricCard
          label="已提交员工"
          value={summary.trainingSummary.submittedEmployeeCount}
        />
        <MetricCard
          label="完成率"
          value={formatPercent(summary.trainingSummary.completionRate)}
        />
        <MetricCard
          label="平均分"
          value={formatNullableNumber(summary.trainingSummary.averageScore)}
        />
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <section className="border-border rounded-md border p-3">
          <h3 className="text-text-primary text-sm font-semibold">训练范围</h3>
          <dl className="text-text-secondary mt-3 grid gap-2 text-sm">
            <Row label="开始" value={summary.dateRange.startAt} />
            <Row label="结束" value={summary.dateRange.endAt} />
            <Row
              label="未完成"
              value={`${summary.trainingSummary.unfinishedEmployeeCount} 人`}
            />
            <Row
              label="分数区间"
              value={`${formatNullableNumber(
                summary.trainingSummary.minScore,
              )} - ${formatNullableNumber(summary.trainingSummary.maxScore)}`}
            />
          </dl>
        </section>

        <section className="border-border rounded-md border p-3">
          <h3 className="text-text-primary text-sm font-semibold">汇总信号</h3>
          <dl className="text-text-secondary mt-3 grid gap-2 text-sm">
            <Row
              label="正式练习"
              value={`${summary.formalLearningSummary?.formalPracticeCount ?? 0} 次正式练习`}
            />
            <Row
              label="正式模拟"
              value={`${summary.formalLearningSummary?.formalMockExamCount ?? 0} 次模拟考试`}
            />
            <Row
              label="AI任务"
              value={`${summary.quotaSummary?.employeeAiTaskCount ?? 0} 次员工任务`}
            />
            <Row
              label="额度"
              value={`${formatNullableNumber(
                summary.quotaSummary?.quotaRemainingPoint ?? null,
              )} 剩余额度`}
            />
          </dl>
        </section>
      </div>

      <section
        className="border-border rounded-md border p-3"
        data-testid="organization-analytics-submitted-trend"
      >
        <h3 className="text-text-primary flex items-center gap-2 text-sm font-semibold">
          <TrendingUp aria-hidden="true" className="size-4" />
          提交趋势
        </h3>
        {summary.trainingSummary.submittedTrend.length === 0 ? (
          <p className="text-text-secondary mt-3 text-sm">暂无提交趋势</p>
        ) : (
          <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {summary.trainingSummary.submittedTrend.map((trendPoint) => (
              <div
                className="bg-muted flex items-center justify-between rounded-md px-3 py-2 text-sm"
                key={trendPoint.date}
              >
                <span className="text-text-secondary">{trendPoint.date}</span>
                <span className="text-text-primary font-semibold">
                  {trendPoint.submittedCount}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>
    </article>
  );
}

function RedactedStatisticsBoundaryPanel({
  boundary,
}: {
  boundary: OrganizationAnalyticsRedactedStatisticsBoundaryDto;
}) {
  return (
    <section
      className="border-border bg-muted/40 rounded-md border p-3"
      data-testid="organization-analytics-redacted-statistics-boundary"
    >
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-brand-primary text-xs font-medium">
            organization_analytics_boundary
          </p>
          <h3 className="text-text-primary mt-1 text-sm font-semibold">
            {boundary.visibilityScope}
          </h3>
        </div>
        <span className="bg-success/10 text-success rounded-md px-2 py-1 text-xs font-medium">
          {boundary.redactionStatus}
        </span>
      </div>

      <dl className="mt-3 grid gap-2 text-xs sm:grid-cols-2 lg:grid-cols-3">
        <Row
          label="training_statistics"
          value={boundary.trainingStatisticsPolicy}
        />
        <Row
          label="employee_statistics"
          value={boundary.employeeStatisticsPolicy}
        />
        <Row
          label="raw_employee_answer"
          value={boundary.rawEmployeeAnswerPolicy}
        />
        <Row
          label="raw_ai_generated_content"
          value={boundary.rawAiGeneratedContentPolicy}
        />
        <Row
          label="prompt_provider_payload"
          value={boundary.promptProviderPayloadPolicy}
        />
        <Row label="export" value={boundary.exportPolicy} />
        <Row
          label="cross_organization"
          value={boundary.crossOrganizationAnalyticsPolicy}
        />
      </dl>
    </section>
  );
}

function EmployeeStatisticsCard({
  employeeStatistics,
  isLoading,
}: {
  employeeStatistics: OrganizationAnalyticsEmployeeStatisticsRouteDto | null;
  isLoading: boolean;
}) {
  if (isLoading) {
    return (
      <section className="bg-surface border-border rounded-md border p-4 shadow-sm">
        <p className="text-text-secondary text-sm">正在加载员工统计</p>
      </section>
    );
  }

  if (employeeStatistics === null) {
    return (
      <section
        className="bg-surface border-border rounded-md border p-4 shadow-sm"
        role="status"
      >
        <p className="text-text-secondary text-sm leading-6">
          加载统计摘要后显示脱敏员工统计；导出仍需单独审批。
        </p>
      </section>
    );
  }

  return (
    <section
      className="bg-surface border-border grid gap-4 rounded-md border p-4 shadow-sm"
      data-testid="organization-analytics-employee-statistics"
    >
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div className="space-y-1">
          <h2 className="text-text-primary flex items-center gap-2 text-base font-semibold">
            <Users aria-hidden="true" className="size-4" />
            员工统计
          </h2>
          <p className="text-text-secondary text-sm">
            {employeeStatistics.employeeCount} 名员工
          </p>
        </div>
        <span className="bg-success/10 text-success rounded-md px-3 py-1 text-xs font-medium">
          {formatRedactionStatus(employeeStatistics.redactionStatus)}
        </span>
      </div>

      {employeeStatistics.employees.length === 0 ? (
        <p className="text-text-secondary rounded-md border border-dashed p-4 text-sm">
          暂无员工统计
        </p>
      ) : (
        <div className="grid gap-3">
          {employeeStatistics.employees.map((employee) => (
            <article
              className="border-border grid gap-3 rounded-md border p-3 md:grid-cols-[1.2fr_1fr_1fr_1fr]"
              key={employee.employeePublicId}
            >
              <div>
                <h3 className="text-text-primary text-sm font-semibold">
                  {employee.employeeDisplayName}
                </h3>
                <p className="text-text-secondary text-xs">
                  {employee.organizationName}
                </p>
              </div>
              <MetricInline
                label="提交"
                value={`${employee.submittedTrainingCount} / ${employee.visibleTrainingCount}`}
              />
              <MetricInline
                label="完成率"
                value={formatPercent(employee.trainingCompletionRate)}
              />
              <MetricInline
                label="平均分"
                value={formatNullableNumber(employee.trainingAverageScore)}
              />
              <div className="text-text-secondary text-xs md:col-span-4">
                最近提交：
                {employee.latestTrainingSubmittedAt ?? "暂无"}
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

function MetricInline({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-muted rounded-md px-3 py-2 text-sm">
      <span className="text-text-secondary">{label}</span>
      <span className="text-text-primary ml-2 font-semibold">{value}</span>
    </div>
  );
}

function MetricCard({
  label,
  value,
}: {
  label: string;
  value: number | string;
}) {
  return (
    <div className="bg-muted rounded-md p-3">
      <p className="text-text-primary text-xl font-semibold">
        {value}{" "}
        <span className="text-text-secondary text-sm font-medium">{label}</span>
      </p>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <dt>{label}</dt>
      <dd className="text-text-primary text-right font-medium">{value}</dd>
    </div>
  );
}

function TextField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="grid gap-2 text-sm font-medium">
      <span className="text-text-secondary">{label}</span>
      <Input
        aria-label={label}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}
