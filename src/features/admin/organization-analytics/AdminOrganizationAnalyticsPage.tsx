"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  AlertTriangle,
  BarChart3,
  BookOpenCheck,
  CalendarDays,
  Download,
  ListChecks,
  RefreshCw,
  ShieldCheck,
  TrendingUp,
  Users,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { ApiPagination } from "@/server/contracts/api-response";
import type { AuthContextDto } from "@/server/contracts/auth-contract";
import type { AdminWorkspaceCapabilitySummary } from "@/server/contracts/admin-workspace-role-guard-contract";
import type {
  OrganizationAnalyticsDashboardRouteDto,
  OrganizationAnalyticsEmployeeStatisticsRouteDto,
  OrganizationAnalyticsRedactedStatisticsBoundaryDto,
  OrganizationAnalyticsWeakPointItemDto,
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

type AdminOrganizationAnalyticsEmployeeStatisticsLoadState =
  | "idle"
  | "loading"
  | "ready"
  | "error";

type DateRangePreset = "7d" | "30d" | "90d" | "custom";

type DashboardSummaryFormValues = {
  organizationPublicId: string;
  rangePreset: DateRangePreset;
  startAt: string;
  endAt: string;
  page: number;
  pageSize: 20 | 50 | 100;
};

const dateRangePresetOptions = [
  ["7d", "近 7 天"],
  ["30d", "近 30 天"],
  ["90d", "近 90 天"],
] as const satisfies readonly [Exclude<DateRangePreset, "custom">, string][];

const pageSizeOptions = [20, 50, 100] as const;

function createUtcDayIso(date: Date, boundary: "start" | "end") {
  const utcDate = new Date(
    Date.UTC(
      date.getUTCFullYear(),
      date.getUTCMonth(),
      date.getUTCDate(),
      boundary === "start" ? 0 : 23,
      boundary === "start" ? 0 : 59,
      boundary === "start" ? 0 : 59,
      boundary === "start" ? 0 : 999,
    ),
  );

  return utcDate.toISOString();
}

function createDateRangeForPreset(preset: Exclude<DateRangePreset, "custom">) {
  const dayCountByPreset = {
    "7d": 7,
    "30d": 30,
    "90d": 90,
  } satisfies Record<Exclude<DateRangePreset, "custom">, number>;
  const now = new Date();
  const startDate = new Date(now);
  startDate.setUTCDate(now.getUTCDate() - dayCountByPreset[preset] + 1);

  return {
    startAt: createUtcDayIso(startDate, "start"),
    endAt: createUtcDayIso(now, "end"),
  };
}

function createDefaultDashboardSummaryFormValues(): DashboardSummaryFormValues {
  return {
    organizationPublicId: "",
    rangePreset: "30d",
    ...createDateRangeForPreset("30d"),
    page: 1,
    pageSize: 20,
  };
}

function createIsoFromDateInput(value: string, boundary: "start" | "end") {
  const parsedDate = new Date(`${value}T00:00:00.000Z`);

  return Number.isFinite(parsedDate.getTime())
    ? createUtcDayIso(parsedDate, boundary)
    : null;
}

function formatDateInputValue(value: string) {
  return value.slice(0, 10);
}

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
    page: String(values.page),
    pageSize: String(values.pageSize),
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

function formatDateRangeLabel(dateRange: { startAt: string; endAt: string }) {
  return `${formatDateInputValue(dateRange.startAt)} 至 ${formatDateInputValue(
    dateRange.endAt,
  )}`;
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
    createDefaultDashboardSummaryFormValues,
  );
  const [summary, setSummary] =
    useState<OrganizationAnalyticsDashboardRouteDto | null>(null);
  const [employeeStatistics, setEmployeeStatistics] =
    useState<OrganizationAnalyticsEmployeeStatisticsRouteDto | null>(null);
  const [employeePagination, setEmployeePagination] =
    useState<ApiPagination | null>(null);
  const [employeeStatisticsLoadState, setEmployeeStatisticsLoadState] =
    useState<AdminOrganizationAnalyticsEmployeeStatisticsLoadState>("idle");
  const [message, setMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const hasAutoLoadedScopedSummaryRef = useRef(false);

  const handleLoadDashboardSummary = useCallback(
    async (values: DashboardSummaryFormValues) => {
      const sessionToken = getStoredSessionToken();

      setIsSubmitting(true);
      setErrorMessage(null);
      setMessage(null);
      setEmployeeStatistics(null);
      setEmployeePagination(null);
      setEmployeeStatisticsLoadState("loading");

      try {
        const [summaryResponse, employeeStatisticsResponse] = await Promise.all(
          [
            fetchAdminApi<OrganizationAnalyticsDashboardRouteDto>(
              createDashboardSummaryPath(values),
              sessionToken,
            ),
            fetchAdminApi<OrganizationAnalyticsEmployeeStatisticsRouteDto>(
              createEmployeeStatisticsPath(values),
              sessionToken,
            ),
          ],
        );

        if (
          isUnauthorizedResponse(summaryResponse) ||
          isUnauthorizedResponse(employeeStatisticsResponse)
        ) {
          setLoadState("unauthorized");
          return;
        }

        if (summaryResponse.code !== 0 || summaryResponse.data === null) {
          setSummary(null);
          setEmployeeStatisticsLoadState("error");
          setErrorMessage("统计摘要加载失败。");
          return;
        }

        if (
          employeeStatisticsResponse.code !== 0 ||
          employeeStatisticsResponse.data === null
        ) {
          setSummary(summaryResponse.data);
          setEmployeeStatistics(null);
          setEmployeeStatisticsLoadState("error");
          setErrorMessage("员工统计加载失败。");
          return;
        }

        setSummary(summaryResponse.data);
        setEmployeeStatistics(employeeStatisticsResponse.data);
        setEmployeePagination(employeeStatisticsResponse.pagination ?? null);
        setEmployeeStatisticsLoadState("ready");
        setMessage("统计摘要已加载。");
      } catch {
        setSummary(null);
        setEmployeeStatistics(null);
        setEmployeePagination(null);
        setEmployeeStatisticsLoadState("error");
        setErrorMessage("统计摘要加载失败。");
      } finally {
        setIsSubmitting(false);
      }
    },
    [],
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

  useEffect(() => {
    if (
      loadState !== "ready" ||
      hasAutoLoadedScopedSummaryRef.current ||
      formValues.organizationPublicId.trim().length === 0
    ) {
      return;
    }

    hasAutoLoadedScopedSummaryRef.current = true;
    void handleLoadDashboardSummary(formValues);
  }, [formValues, handleLoadDashboardSummary, loadState]);

  function handleSubmit(values: DashboardSummaryFormValues) {
    const nextValues = {
      ...values,
      page: 1,
    };

    setFormValues(nextValues);
    void handleLoadDashboardSummary(nextValues);
  }

  function handleEmployeePageChange(
    page: number,
    pageSize = formValues.pageSize,
  ) {
    const nextValues = {
      ...formValues,
      page,
      pageSize,
    };

    setFormValues(nextValues);
    void handleLoadDashboardSummary(nextValues);
  }

  if (loadState === "loading") {
    return <AdminLoadingState label="正在加载组织统计" />;
  }

  if (loadState === "unauthorized") {
    return <AdminUnauthorizedState />;
  }

  if (loadState === "standard-unavailable") {
    return (
      <AdminUpgradeRequiredState
        description="标准版组织后台暂不开放统计摘要，请在组织概览查看员工管理和授权状态。升级需由运营管理员维护高级版企业授权。"
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

  return (
    <section className="space-y-6">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-2">
          <p className="text-brand-primary text-sm font-medium">组织后台</p>
          <h1 className="font-heading text-text-primary text-2xl font-semibold">
            组织统计
          </h1>
          <p className="text-text-secondary max-w-2xl text-sm leading-6">
            按企业训练、正式学习信号和知识薄弱点分区查看汇总结果；员工原始作答和个人无关学习内容不展示。
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
        onSubmit={handleSubmit}
      />

      <Button
        className="w-fit"
        data-testid="organization-analytics-export-readiness"
        disabled
        type="button"
        variant="outline"
      >
        <Download aria-hidden="true" className="size-4" />
        首期不提供导出
      </Button>

      {summary === null ? (
        <EmptyAnalyticsState />
      ) : (
        <DashboardSummarySections summary={summary} />
      )}
      <EmployeeStatisticsCard
        employeeStatistics={employeeStatistics}
        loadState={employeeStatisticsLoadState}
        pagination={employeePagination}
        onPageChange={handleEmployeePageChange}
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

  function applyPreset(preset: Exclude<DateRangePreset, "custom">) {
    onChange({
      ...values,
      ...createDateRangeForPreset(preset),
      rangePreset: preset,
      page: 1,
    });
  }

  return (
    <form
      aria-label="组织统计摘要表单"
      className="bg-surface border-border grid gap-4 rounded-md border p-4 shadow-sm"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit(values);
      }}
    >
      <div className="grid gap-4 lg:grid-cols-[1.2fr_2fr_auto]">
        {hasScopedOrganization ? (
          <div
            className="bg-muted grid gap-2 rounded-md px-3 py-2 text-sm"
            data-testid="organization-analytics-scope-context"
          >
            <span className="text-text-secondary font-medium">统计范围</span>
            <span className="text-text-primary font-semibold">
              当前组织及下级
            </span>
            <span className="text-text-secondary text-xs">
              范围由会话授权自动带入
            </span>
          </div>
        ) : (
          <div
            className="bg-destructive/10 text-destructive grid gap-2 rounded-md px-3 py-2 text-sm"
            data-testid="organization-analytics-scope-unavailable"
            role="status"
          >
            <span className="font-medium">统计范围不可用</span>
            <span className="text-xs">组织范围不可用，请重新登录后重试</span>
          </div>
        )}

        <div className="grid gap-3">
          <span className="text-text-secondary text-sm font-medium">
            统计周期
          </span>
          <div className="flex flex-wrap gap-2">
            {dateRangePresetOptions.map(([preset, label]) => (
              <Button
                aria-pressed={values.rangePreset === preset}
                key={preset}
                type="button"
                variant={values.rangePreset === preset ? "default" : "outline"}
                onClick={() => applyPreset(preset)}
              >
                {label}
              </Button>
            ))}
            <Button
              aria-pressed={values.rangePreset === "custom"}
              type="button"
              variant={values.rangePreset === "custom" ? "default" : "outline"}
              onClick={() => onChange({ ...values, rangePreset: "custom" })}
            >
              自定义
            </Button>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <DateField
              label="开始日期"
              value={values.startAt}
              onChange={(value) =>
                onChange({
                  ...values,
                  startAt: value,
                  rangePreset: "custom",
                  page: 1,
                })
              }
            />
            <DateField
              label="结束日期"
              value={values.endAt}
              onChange={(value) =>
                onChange({
                  ...values,
                  endAt: value,
                  rangePreset: "custom",
                  page: 1,
                })
              }
            />
          </div>
        </div>

        <div className="flex items-end">
          <Button
            className="w-full"
            disabled={isSubmitting || !hasScopedOrganization}
            type="submit"
          >
            <RefreshCw aria-hidden="true" className="size-4" />
            加载统计
          </Button>
        </div>
      </div>
    </form>
  );
}

function EmptyAnalyticsState() {
  return (
    <section
      className="bg-surface border-border rounded-md border border-dashed p-5"
      role="status"
    >
      <h2 className="text-text-primary text-base font-semibold">
        暂无统计结果
      </h2>
      <p className="text-text-secondary mt-2 text-sm leading-6">
        请选择组织范围和统计周期。若范围内没有员工、没有企业训练或时间过窄，这里会保持为空。
      </p>
    </section>
  );
}

function DashboardSummarySections({
  summary,
}: {
  summary: OrganizationAnalyticsDashboardRouteDto;
}) {
  const isSmallSample = summary.trainingSummary.eligibleEmployeeCount < 5;

  return (
    <article
      className="grid gap-4"
      data-public-id={summary.organizationPublicId}
      data-testid={`organization-analytics-summary-${summary.organizationPublicId}`}
    >
      <ScopeHeader summary={summary} />
      {isSmallSample ? (
        <SmallSampleWarning
          employeeCount={summary.trainingSummary.eligibleEmployeeCount}
        />
      ) : null}
      <EnterpriseTrainingSection summary={summary} />
      <FormalLearningSection summary={summary} />
      <WeakPointSection summary={summary} />
      <RedactedStatisticsBoundaryPanel
        boundary={summary.redactedStatisticsBoundary}
      />
    </article>
  );
}

function ScopeHeader({
  summary,
}: {
  summary: OrganizationAnalyticsDashboardRouteDto;
}) {
  return (
    <section className="bg-surface border-border rounded-md border p-4 shadow-sm">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div className="space-y-1">
          <h2 className="text-text-primary flex items-center gap-2 text-base font-semibold">
            <CalendarDays aria-hidden="true" className="size-4" />
            当前统计范围
          </h2>
          <p className="text-text-secondary text-sm">
            当前组织及下级 · {formatDateRangeLabel(summary.dateRange)}
          </p>
          <p className="text-text-secondary text-xs">
            数据更新时间：{summary.updatedAt}
          </p>
        </div>
        <span className="bg-success/10 text-success rounded-md px-3 py-1 text-xs font-medium">
          {formatRedactionStatus(summary.redactionStatus)}
        </span>
      </div>
    </section>
  );
}

function SmallSampleWarning({ employeeCount }: { employeeCount: number }) {
  return (
    <section
      className="bg-warning/10 text-warning border-warning/30 rounded-md border p-4 text-sm leading-6"
      data-testid="organization-analytics-small-sample-warning"
      role="status"
    >
      <div className="flex items-start gap-2">
        <AlertTriangle aria-hidden="true" className="mt-0.5 size-4" />
        <p>
          当前样本少于 5 人（{employeeCount}{" "}
          人），知识薄弱点只作低置信参考。建议扩大组织范围或统计周期后再判断。
        </p>
      </div>
    </section>
  );
}

function EnterpriseTrainingSection({
  summary,
}: {
  summary: OrganizationAnalyticsDashboardRouteDto;
}) {
  return (
    <section
      className="bg-surface border-border grid gap-4 rounded-md border p-4 shadow-sm"
      data-testid="organization-analytics-enterprise-training-section"
    >
      <div className="space-y-1">
        <h2 className="text-text-primary flex items-center gap-2 text-base font-semibold">
          <BarChart3 aria-hidden="true" className="size-4" />
          企业训练统计
        </h2>
        <p className="text-text-secondary text-sm">
          只统计企业训练的参与、提交、完成率、分数和提交趋势；不混入正式练习或正式模拟。
        </p>
      </div>

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
          <h3 className="text-text-primary flex items-center gap-2 text-sm font-semibold">
            <ListChecks aria-hidden="true" className="size-4" />
            训练明细
          </h3>
          <dl className="text-text-secondary mt-3 grid gap-2 text-sm">
            <Row
              label="统计周期"
              value={formatDateRangeLabel(summary.dateRange)}
            />
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
            <Row label="版本/截止/状态" value="按企业训练口径单独归集" />
          </dl>
        </section>

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
            <div className="mt-3 grid gap-2">
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
      </div>
    </section>
  );
}

function FormalLearningSection({
  summary,
}: {
  summary: OrganizationAnalyticsDashboardRouteDto;
}) {
  const formalLearningSummary = summary.formalLearningSummary;

  return (
    <section
      className="bg-surface border-border rounded-md border p-4 shadow-sm"
      data-testid="organization-analytics-formal-learning-section"
    >
      <div className="space-y-1">
        <h2 className="text-text-primary flex items-center gap-2 text-base font-semibold">
          <BookOpenCheck aria-hidden="true" className="size-4" />
          正式学习聚合信号
        </h2>
        <p className="text-text-secondary text-sm">
          正式练习和正式模拟只作为单独的组织授权范围聚合信号，不计入企业训练完成率、分数、截止或版本统计。
        </p>
      </div>

      {formalLearningSummary === null ? (
        <p className="text-text-secondary mt-4 rounded-md border border-dashed p-4 text-sm">
          当前范围暂无可展示的正式学习聚合信号。
        </p>
      ) : (
        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            label="正式练习"
            value={formalLearningSummary.formalPracticeCount}
          />
          <MetricCard
            label="正式模拟"
            value={formalLearningSummary.formalMockExamCount}
          />
          <MetricCard
            label="正式报告"
            value={formalLearningSummary.formalExamReportCount}
          />
          <MetricCard
            label="错题本信号"
            value={formalLearningSummary.formalMistakeBookCount}
          />
        </div>
      )}
    </section>
  );
}

function WeakPointSection({
  summary,
}: {
  summary: OrganizationAnalyticsDashboardRouteDto;
}) {
  const weakPointSummary = summary.knowledgeWeakPointSummary;
  const hasTrainingWeakPoints = weakPointSummary.trainingWeakPoints.length > 0;
  const hasFormalWeakPoints =
    weakPointSummary.formalLearningWeakPoints.length > 0;

  return (
    <section
      className="bg-surface border-border grid gap-4 rounded-md border p-4 shadow-sm"
      data-testid="organization-analytics-weak-point-section"
    >
      <div className="space-y-1">
        <h2 className="text-text-primary text-base font-semibold">
          知识薄弱点
        </h2>
        <p className="text-text-secondary text-sm">
          仅展示聚合标签和影响人数，不展示员工原始作答、主观题文本或个人无关学习内容。
        </p>
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        <WeakPointList
          emptyLabel="暂无企业训练弱点信号"
          items={weakPointSummary.trainingWeakPoints}
          title="企业训练弱点"
        />
        <WeakPointList
          emptyLabel="暂无正式学习弱点信号"
          items={weakPointSummary.formalLearningWeakPoints}
          title="正式学习弱点"
        />
      </div>

      {!hasTrainingWeakPoints && !hasFormalWeakPoints ? (
        <p className="text-text-secondary rounded-md border border-dashed p-4 text-sm">
          当前范围没有足够的弱点聚合数据，系统不会用原始作答补齐展示。
        </p>
      ) : null}
    </section>
  );
}

function WeakPointList({
  emptyLabel,
  items,
  title,
}: {
  emptyLabel: string;
  items: OrganizationAnalyticsWeakPointItemDto[];
  title: string;
}) {
  return (
    <section className="border-border rounded-md border p-3">
      <h3 className="text-text-primary text-sm font-semibold">{title}</h3>
      {items.length === 0 ? (
        <p className="text-text-secondary mt-3 text-sm">{emptyLabel}</p>
      ) : (
        <div className="mt-3 grid gap-2">
          {items.map((item) => (
            <div
              className="bg-muted grid gap-1 rounded-md px-3 py-2 text-sm"
              key={`${item.sourceDomain}-${item.knowledgeNodeLabel}`}
            >
              <div className="flex items-center justify-between gap-3">
                <span className="text-text-primary font-medium">
                  {item.knowledgeNodeLabel}
                </span>
                <span className="text-text-secondary">
                  {item.affectedEmployeeCount} 人
                </span>
              </div>
              <p className="text-text-secondary text-xs">
                影响约 {formatPercent(item.affectedEmployeePercent)}
                {item.confidenceStatus === "low_sample"
                  ? " · 低置信样本"
                  : " · 聚合可信"}
              </p>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

function RedactedStatisticsBoundaryPanel({
  boundary,
}: {
  boundary: OrganizationAnalyticsRedactedStatisticsBoundaryDto;
}) {
  const boundaryRows = [
    ["训练统计", "只展示人数、完成率、分数和时间汇总"],
    ["员工统计", "只展示状态、分数、时间和弱点标签"],
    ["员工原始作答", "不展示"],
    ["AI 生成内容", "不展示"],
    ["Prompt 与模型请求", "不展示"],
    ["跨组织数据", "不展示"],
    ["导出", "首期不提供"],
  ] as const;

  return (
    <section
      className="border-border bg-muted/40 rounded-md border p-4"
      data-testid="organization-analytics-redacted-statistics-boundary"
    >
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-brand-primary text-xs font-medium">隐私边界</p>
          <h3 className="text-text-primary mt-1 text-sm font-semibold">
            仅限本组织范围的脱敏统计
          </h3>
        </div>
        <span className="bg-success/10 text-success rounded-md px-2 py-1 text-xs font-medium">
          {formatRedactionStatus(boundary.redactionStatus)}
        </span>
      </div>

      <dl className="mt-3 grid gap-2 text-xs sm:grid-cols-2 lg:grid-cols-3">
        {boundaryRows.map(([label, value]) => (
          <Row key={label} label={label} value={value} />
        ))}
      </dl>
    </section>
  );
}

function EmployeeStatisticsCard({
  employeeStatistics,
  loadState,
  pagination,
  onPageChange,
}: {
  employeeStatistics: OrganizationAnalyticsEmployeeStatisticsRouteDto | null;
  loadState: AdminOrganizationAnalyticsEmployeeStatisticsLoadState;
  pagination: ApiPagination | null;
  onPageChange: (page: number, pageSize?: 20 | 50 | 100) => void;
}) {
  if (loadState === "loading") {
    return (
      <section className="bg-surface border-border rounded-md border p-4 shadow-sm">
        <p className="text-text-secondary text-sm">正在加载员工统计</p>
      </section>
    );
  }

  if (loadState === "error") {
    return (
      <section
        className="bg-surface border-border rounded-md border p-4 shadow-sm"
        role="status"
      >
        <p className="text-destructive text-sm leading-6">
          员工统计暂不可用，请稍后重试。
        </p>
      </section>
    );
  }

  if (loadState === "idle" || employeeStatistics === null) {
    return (
      <section
        className="bg-surface border-border rounded-md border p-4 shadow-sm"
        role="status"
      >
        <p className="text-text-secondary text-sm leading-6">
          加载统计摘要后显示脱敏员工统计；首期不提供导出。
        </p>
      </section>
    );
  }

  const totalPages =
    pagination === null
      ? 1
      : Math.max(Math.ceil(pagination.total / pagination.pageSize), 1);

  return (
    <section
      className="bg-surface border-border grid gap-4 rounded-md border p-4 shadow-sm"
      data-testid="organization-analytics-employee-statistics"
    >
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div className="space-y-1">
          <h2 className="text-text-primary flex items-center gap-2 text-base font-semibold">
            <Users aria-hidden="true" className="size-4" />
            员工摘要
          </h2>
          <p className="text-text-secondary text-sm">
            {employeeStatistics.employeeCount} 名员工 · 仅展示汇总结果
          </p>
        </div>
        <span className="bg-success/10 text-success rounded-md px-3 py-1 text-xs font-medium">
          {formatRedactionStatus(employeeStatistics.redactionStatus)}
        </span>
      </div>

      <EmployeePaginationControls
        pagination={pagination}
        totalPages={totalPages}
        onPageChange={onPageChange}
      />

      {employeeStatistics.employees.length === 0 ? (
        <p className="text-text-secondary rounded-md border border-dashed p-4 text-sm">
          暂无员工统计。可能是当前范围没有员工、没有提交企业训练，或统计周期过窄。
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
              <div className="text-text-secondary grid gap-1 text-xs md:col-span-4">
                <span>
                  最近提交：{employee.latestTrainingSubmittedAt ?? "暂无"}
                </span>
                <span>
                  薄弱点：
                  {employee.weakPointSummary.knowledgeNodeLabels.length === 0
                    ? "暂无"
                    : employee.weakPointSummary.knowledgeNodeLabels.join("、")}
                </span>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

function EmployeePaginationControls({
  pagination,
  totalPages,
  onPageChange,
}: {
  pagination: ApiPagination | null;
  totalPages: number;
  onPageChange: (page: number, pageSize?: 20 | 50 | 100) => void;
}) {
  if (pagination === null) {
    return (
      <p className="text-text-secondary rounded-md border border-dashed p-3 text-sm">
        当前接口未返回分页信息。
      </p>
    );
  }

  return (
    <div
      className="border-border flex flex-col gap-3 rounded-md border p-3 sm:flex-row sm:items-center sm:justify-between"
      data-testid="organization-analytics-employee-pagination"
    >
      <div className="text-text-secondary text-sm">
        第 {pagination.page} / {totalPages} 页，共 {pagination.total} 条
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <label className="text-text-secondary flex items-center gap-2 text-sm">
          每页
          <select
            aria-label="员工统计每页条数"
            className="border-input bg-surface h-8 rounded-md border px-2 text-sm"
            value={pagination.pageSize}
            onChange={(event) => {
              const nextPageSize = Number(event.target.value) as 20 | 50 | 100;
              onPageChange(1, nextPageSize);
            }}
          >
            {pageSizeOptions.map((pageSizeOption) => (
              <option key={pageSizeOption} value={pageSizeOption}>
                {pageSizeOption}
              </option>
            ))}
          </select>
        </label>
        <Button
          disabled={pagination.page <= 1}
          type="button"
          variant="outline"
          onClick={() => onPageChange(pagination.page - 1)}
        >
          上一页
        </Button>
        <Button
          disabled={pagination.page >= totalPages}
          type="button"
          variant="outline"
          onClick={() => onPageChange(pagination.page + 1)}
        >
          下一页
        </Button>
      </div>
    </div>
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

function DateField({
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
        type="date"
        value={formatDateInputValue(value)}
        onChange={(event) => {
          const nextValue = createIsoFromDateInput(
            event.target.value,
            label === "开始日期" ? "start" : "end",
          );

          if (nextValue !== null) {
            onChange(nextValue);
          }
        }}
      />
    </label>
  );
}
