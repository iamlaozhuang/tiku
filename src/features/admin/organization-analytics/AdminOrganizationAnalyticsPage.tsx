"use client";

import { useEffect, useState } from "react";
import { BarChart3, RefreshCw, ShieldCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { AuthContextDto } from "@/server/contracts/auth-contract";
import type { OrganizationAnalyticsDashboardRouteDto } from "@/server/contracts/organization-analytics-contract";

import {
  AdminErrorState,
  AdminLoadingState,
  AdminUnauthorizedState,
  fetchAdminApi,
  getStoredSessionToken,
  isAdminContext,
  isUnauthorizedResponse,
} from "../content-admin-runtime";

type AdminOrganizationAnalyticsLoadState =
  | "loading"
  | "ready"
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

function formatPercent(value: number) {
  return `${Math.round(value * 100)}%`;
}

function formatNullableNumber(value: number | null) {
  return value === null ? "N/A" : String(value);
}

export function AdminOrganizationAnalyticsPage() {
  const [loadState, setLoadState] =
    useState<AdminOrganizationAnalyticsLoadState>("loading");
  const [formValues, setFormValues] = useState(
    defaultDashboardSummaryFormValues,
  );
  const [summary, setSummary] =
    useState<OrganizationAnalyticsDashboardRouteDto | null>(null);
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

        setFormValues((currentValues) => ({
          ...currentValues,
          organizationPublicId:
            sessionResponse.data?.user.organizationPublicId ??
            currentValues.organizationPublicId,
        }));
        setLoadState("ready");
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
    return <AdminLoadingState label="Loading organization analytics" />;
  }

  if (loadState === "unauthorized") {
    return <AdminUnauthorizedState />;
  }

  if (loadState === "error") {
    return (
      <AdminErrorState
        title="Organization analytics unavailable"
        description="Refresh the page or sign in again before loading organization analytics."
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

    try {
      const response =
        await fetchAdminApi<OrganizationAnalyticsDashboardRouteDto>(
          createDashboardSummaryPath(values),
          sessionToken,
        );

      if (isUnauthorizedResponse(response)) {
        setLoadState("unauthorized");
        return;
      }

      if (response.code !== 0 || response.data === null) {
        setSummary(null);
        setErrorMessage("Dashboard summary could not be loaded.");
        return;
      }

      setSummary(response.data);
      setMessage("Dashboard summary loaded.");
    } catch {
      setSummary(null);
      setErrorMessage("Dashboard summary could not be loaded.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="space-y-6">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-2">
          <p className="text-brand-primary text-sm font-medium">
            Organization Admin
          </p>
          <h1 className="font-heading text-text-primary text-2xl font-semibold">
            Organization Analytics
          </h1>
          <p className="text-text-secondary max-w-2xl text-sm leading-6">
            Aggregate-only organization dashboard summary for local admin
            validation.
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

      {summary === null ? null : <DashboardSummaryCard summary={summary} />}
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
  return (
    <form
      aria-label="Organization analytics summary form"
      className="bg-surface border-border grid gap-4 rounded-md border p-4 shadow-sm lg:grid-cols-[1fr_1fr_1fr_auto]"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit(values);
      }}
    >
      <TextField
        label="Organization publicId"
        value={values.organizationPublicId}
        onChange={(value) =>
          onChange({ ...values, organizationPublicId: value })
        }
      />
      <TextField
        label="Start at"
        value={values.startAt}
        onChange={(value) => onChange({ ...values, startAt: value })}
      />
      <TextField
        label="End at"
        value={values.endAt}
        onChange={(value) => onChange({ ...values, endAt: value })}
      />
      <div className="flex items-end">
        <Button className="w-full" disabled={isSubmitting} type="submit">
          <RefreshCw aria-hidden="true" className="size-4" />
          Load dashboard summary
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
            Dashboard summary
          </h2>
          <p className="text-text-secondary text-sm">
            {summary.organizationPublicId}
          </p>
        </div>
        <span className="bg-success/10 text-success rounded-md px-3 py-1 text-xs font-medium">
          {summary.redactionStatus}
        </span>
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="eligible employees"
          value={summary.trainingSummary.eligibleEmployeeCount}
        />
        <MetricCard
          label="submitted employees"
          value={summary.trainingSummary.submittedEmployeeCount}
        />
        <MetricCard
          label="completion"
          value={formatPercent(summary.trainingSummary.completionRate)}
        />
        <MetricCard
          label="average score"
          value={formatNullableNumber(summary.trainingSummary.averageScore)}
        />
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <section className="border-border rounded-md border p-3">
          <h3 className="text-text-primary text-sm font-semibold">
            Training range
          </h3>
          <dl className="text-text-secondary mt-3 grid gap-2 text-sm">
            <Row label="Start" value={summary.dateRange.startAt} />
            <Row label="End" value={summary.dateRange.endAt} />
            <Row
              label="Unfinished"
              value={`${summary.trainingSummary.unfinishedEmployeeCount} employees`}
            />
            <Row
              label="Score range"
              value={`${formatNullableNumber(
                summary.trainingSummary.minScore,
              )} - ${formatNullableNumber(summary.trainingSummary.maxScore)}`}
            />
          </dl>
        </section>

        <section className="border-border rounded-md border p-3">
          <h3 className="text-text-primary text-sm font-semibold">
            Summary-only signals
          </h3>
          <dl className="text-text-secondary mt-3 grid gap-2 text-sm">
            <Row
              label="Formal practice"
              value={`${summary.formalLearningSummary?.formalPracticeCount ?? 0} formal practices`}
            />
            <Row
              label="Formal mock"
              value={`${summary.formalLearningSummary?.formalMockExamCount ?? 0} mock exams`}
            />
            <Row
              label="AI tasks"
              value={`${summary.quotaSummary?.employeeAiTaskCount ?? 0} employee tasks`}
            />
            <Row
              label="Quota"
              value={`${formatNullableNumber(
                summary.quotaSummary?.quotaRemainingPoint ?? null,
              )} quota remaining`}
            />
          </dl>
        </section>
      </div>
    </article>
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
