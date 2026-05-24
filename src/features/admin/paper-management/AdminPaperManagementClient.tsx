"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Archive,
  ClipboardList,
  Copy,
  FileCheck,
  FilePlus2,
  Layers3,
  Search,
  Upload,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { AdminPaperOpsSummaryDto } from "@/server/contracts/admin-content-knowledge-ops-contract";
import type { AuthContextDto } from "@/server/contracts/auth-contract";
import type {
  PaperStatus,
  PaperType,
  Profession,
  Subject,
} from "@/server/models/paper";

import {
  AdminErrorState,
  AdminLoadingState,
  AdminUnauthorizedState,
  ContentOpsStagingRoleArrangement,
  DEFAULT_CONTENT_LIST_QUERY,
  FilterSelect,
  PublicId,
  fetchAdminApi,
  formatScope,
  getStoredSessionToken,
  includesKeyword,
  isAdminContext,
  isUnauthorizedResponse,
  matchesFilter,
  matchesNullableFilter,
} from "../content-admin-runtime";

type PaperStatusFilter = "all" | PaperStatus;
type PaperTypeFilter = "all" | PaperType;
type ProfessionFilter = "all" | Profession;
type SubjectFilter = "all" | Subject;
type PaperLoadState = "loading" | "ready" | "empty" | "unauthorized" | "error";

type PaperListDto = {
  papers: AdminPaperOpsSummaryDto[];
};

export type AdminPaperManagementProps = Record<string, never>;

const paperStatusLabels: Record<PaperStatus, string> = {
  archived: "已下架",
  draft: "草稿",
  published: "已发布",
};

const paperTypeLabels: Record<PaperType, string> = {
  mock_paper: "模拟卷",
  past_paper: "历年真题",
};

function usePaperData() {
  const [loadState, setLoadState] = useState<PaperLoadState>("loading");
  const [papers, setPapers] = useState<AdminPaperOpsSummaryDto[]>([]);

  useEffect(() => {
    let isActive = true;

    async function loadPaperData() {
      const sessionToken = getStoredSessionToken();

      if (sessionToken === null) {
        setLoadState("unauthorized");
        return;
      }

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

        const paperResponse = await fetchAdminApi<PaperListDto>(
          `/api/v1/papers?${DEFAULT_CONTENT_LIST_QUERY}`,
          sessionToken,
        );

        if (!isActive) {
          return;
        }

        if (paperResponse.code !== 0 || paperResponse.data === null) {
          setLoadState("error");
          return;
        }

        setPapers(paperResponse.data.papers);
        setLoadState(
          paperResponse.data.papers.length === 0 ? "empty" : "ready",
        );
      } catch {
        if (isActive) {
          setLoadState("error");
        }
      }
    }

    void loadPaperData();

    return () => {
      isActive = false;
    };
  }, []);

  return { loadState, papers };
}

export function AdminPaperManagement() {
  const [keyword, setKeyword] = useState("");
  const [profession, setProfession] = useState<ProfessionFilter>("all");
  const [subject, setSubject] = useState<SubjectFilter>("all");
  const [paperStatus, setPaperStatus] = useState<PaperStatusFilter>("all");
  const [paperType, setPaperType] = useState<PaperTypeFilter>("all");
  const { loadState, papers } = usePaperData();

  const filteredPapers = useMemo(
    () =>
      papers.filter((paper) => {
        const searchableText = [
          paper.publicId,
          paper.name,
          paper.sourceFileName,
          paper.publishValidationSummary,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        return (
          includesKeyword(searchableText, keyword) &&
          matchesFilter(paper.profession, profession) &&
          matchesFilter(paper.subject, subject) &&
          matchesFilter(paper.paperStatus, paperStatus) &&
          matchesNullableFilter(paper.paperType, paperType)
        );
      }),
    [keyword, paperStatus, paperType, papers, profession, subject],
  );

  if (loadState === "loading") {
    return <AdminLoadingState label="正在加载试卷" />;
  }

  if (loadState === "unauthorized") {
    return <AdminUnauthorizedState />;
  }

  if (loadState === "error") {
    return (
      <AdminErrorState
        description="请稍后刷新页面，或重新登录后再查看试卷数据。"
        title="试卷加载失败"
      />
    );
  }

  return (
    <section className="space-y-6">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-2">
          <p className="text-brand-primary text-sm font-medium">
            Content Admin
          </p>
          <h1 className="font-heading text-text-primary text-2xl font-semibold">
            试卷管理
          </h1>
          <p className="text-text-secondary max-w-3xl text-sm">
            管理草稿组卷、发布校验、下架复制、原始文件与模拟考试记录概览；页面只展示
            publicId 与契约字段。
          </p>
        </div>
        <ActionBar />
      </header>

      <ContentOpsStagingRoleArrangement />

      <FilterPanel
        keyword={keyword}
        paperStatus={paperStatus}
        paperType={paperType}
        profession={profession}
        subject={subject}
        onKeywordChange={setKeyword}
        onPaperStatusChange={setPaperStatus}
        onPaperTypeChange={setPaperType}
        onProfessionChange={setProfession}
        onSubjectChange={setSubject}
      />

      <SummaryRail rows={filteredPapers} />

      {filteredPapers.length > 0 ? (
        <PaperList rows={filteredPapers} />
      ) : (
        <FilteredEmptyState />
      )}
    </section>
  );
}

function ActionBar() {
  return (
    <div className="max-w-xl space-y-2">
      <div className="flex flex-wrap gap-2">
        <Button disabled aria-describedby="paper-action-unavailable">
          <FilePlus2 aria-hidden="true" data-icon="inline-start" />
          新建草稿
        </Button>
        <Button
          disabled
          aria-describedby="paper-action-unavailable"
          variant="outline"
        >
          <Layers3 aria-hidden="true" data-icon="inline-start" />
          组卷
        </Button>
        <Button
          disabled
          aria-describedby="paper-action-unavailable"
          variant="outline"
        >
          <FileCheck aria-hidden="true" data-icon="inline-start" />
          发布
        </Button>
        <Button
          disabled
          aria-describedby="paper-action-unavailable"
          variant="outline"
        >
          <Archive aria-hidden="true" data-icon="inline-start" />
          下架
        </Button>
        <Button
          disabled
          aria-describedby="paper-action-unavailable"
          variant="secondary"
        >
          <Copy aria-hidden="true" data-icon="inline-start" />
          复制
        </Button>
        <Button
          disabled
          aria-describedby="paper-action-unavailable"
          variant="secondary"
        >
          <Upload aria-hidden="true" data-icon="inline-start" />
          绑定原始文件
        </Button>
      </div>
      <p
        className="text-text-secondary text-xs leading-5"
        data-testid="paper-action-unavailable"
        id="paper-action-unavailable"
        role="status"
      >
        草稿、组卷、发布、下架、复制和附件绑定暂未接入本地运行时；当前仅开放列表查看与筛选。
      </p>
    </div>
  );
}

function FilterPanel({
  keyword,
  paperStatus,
  paperType,
  profession,
  subject,
  onKeywordChange,
  onPaperStatusChange,
  onPaperTypeChange,
  onProfessionChange,
  onSubjectChange,
}: {
  keyword: string;
  paperStatus: PaperStatusFilter;
  paperType: PaperTypeFilter;
  profession: ProfessionFilter;
  subject: SubjectFilter;
  onKeywordChange: (value: string) => void;
  onPaperStatusChange: (value: PaperStatusFilter) => void;
  onPaperTypeChange: (value: PaperTypeFilter) => void;
  onProfessionChange: (value: ProfessionFilter) => void;
  onSubjectChange: (value: SubjectFilter) => void;
}) {
  return (
    <div className="bg-surface border-border rounded-md border p-4 shadow-sm">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-end">
        <label className="flex flex-1 flex-col gap-2 text-sm font-medium">
          <span className="text-text-secondary">关键词</span>
          <span className="relative">
            <Search
              aria-hidden="true"
              className="text-text-muted pointer-events-none absolute top-1/2 left-2 size-4 -translate-y-1/2"
            />
            <Input
              aria-label="关键词"
              className="pl-8"
              placeholder="试卷名称、publicId、校验结果或文件名"
              value={keyword}
              onChange={(event) => onKeywordChange(event.target.value)}
            />
          </span>
        </label>
        <FilterSelect
          label="专业"
          options={[
            ["all", "全部专业"],
            ["marketing", "营销"],
            ["logistics", "物流"],
            ["monopoly", "专卖"],
          ]}
          value={profession}
          onChange={(value) => onProfessionChange(value as ProfessionFilter)}
        />
        <FilterSelect
          label="科目"
          options={[
            ["all", "全部科目"],
            ["theory", "理论"],
            ["skill", "技能"],
          ]}
          value={subject}
          onChange={(value) => onSubjectChange(value as SubjectFilter)}
        />
        <FilterSelect
          label="状态"
          options={[
            ["all", "全部状态"],
            ["draft", "草稿"],
            ["published", "已发布"],
            ["archived", "已下架"],
          ]}
          value={paperStatus}
          onChange={(value) => onPaperStatusChange(value as PaperStatusFilter)}
        />
        <FilterSelect
          label="类型"
          options={[
            ["all", "全部类型"],
            ["mock_paper", "模拟卷"],
            ["past_paper", "历年真题"],
          ]}
          value={paperType}
          onChange={(value) => onPaperTypeChange(value as PaperTypeFilter)}
        />
      </div>
    </div>
  );
}

function SummaryRail({ rows }: { rows: AdminPaperOpsSummaryDto[] }) {
  const totalQuestionCount = rows.reduce(
    (questionCount, paper) => questionCount + paper.questionCount,
    0,
  );
  const totalMockExamRecordCount = rows.reduce(
    (mockExamCount, paper) => mockExamCount + paper.mockExamCount,
    0,
  );
  const publishedCount = rows.filter(
    (paper) => paper.paperStatus === "published",
  ).length;

  return (
    <div className="grid gap-3 md:grid-cols-3">
      <SummaryItem label="当前结果" value={`${rows.length} 套`} />
      <SummaryItem label="题目总数" value={`${totalQuestionCount} 题`} />
      <SummaryItem
        label="发布 / 模拟记录"
        value={`${publishedCount} 套 / ${totalMockExamRecordCount} 次`}
      />
    </div>
  );
}

function SummaryItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-border bg-surface rounded-md border px-4 py-3 shadow-sm">
      <p className="text-text-muted text-xs font-medium">{label}</p>
      <p className="text-text-primary mt-1 text-lg font-semibold">{value}</p>
    </div>
  );
}

function PaperList({ rows }: { rows: AdminPaperOpsSummaryDto[] }) {
  return (
    <div className="grid gap-3">
      {rows.map((paper) => (
        <article
          className="bg-surface border-border rounded-md border p-4 shadow-sm"
          data-public-id={paper.publicId}
          data-testid={`paper-row-${paper.publicId}`}
          key={paper.publicId}
        >
          <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <StatusBadge status={paper.paperStatus} />
                <span className="text-text-muted text-xs">
                  {paperTypeLabels[paper.paperType]}
                </span>
                <span className="text-text-muted text-xs">
                  {formatScope(paper)}
                </span>
                {paper.year === null ? null : (
                  <span className="text-text-muted text-xs">{paper.year}</span>
                )}
              </div>
              <h2 className="text-text-primary text-base font-semibold">
                {paper.name}
              </h2>
              <div className="flex flex-wrap gap-2 text-xs">
                <MetricBadge label="总分" value={paper.totalScore} />
                <MetricBadge label="题目" value={`${paper.questionCount}`} />
                <MetricBadge
                  label="模拟记录"
                  value={`${paper.mockExamCount}`}
                />
              </div>
            </div>
            <PublicId value={paper.publicId} />
          </div>

          <div className="border-border mt-4 grid gap-4 border-t pt-4 xl:grid-cols-3">
            <InfoBlock
              label="原始文件"
              value={paper.sourceFileName ?? "暂未绑定"}
            />
            <InfoBlock
              label="发布校验"
              value={paper.publishValidationSummary ?? "暂无校验结果"}
            />
            <InfoBlock
              label="更新时间"
              value={formatDateTime(paper.updatedAt)}
            />
          </div>
        </article>
      ))}
    </div>
  );
}

function StatusBadge({ status }: { status: PaperStatus }) {
  return (
    <span className="bg-secondary text-secondary-foreground rounded-md px-2 py-1 text-xs font-medium">
      {paperStatusLabels[status]}
    </span>
  );
}

function MetricBadge({ label, value }: { label: string; value: string }) {
  return (
    <span className="border-border text-text-secondary rounded-md border px-2 py-1">
      {label} {value}
    </span>
  );
}

function InfoBlock({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-muted/60 rounded-md px-3 py-2 text-sm">
      <p className="text-text-muted text-xs font-medium">{label}</p>
      <p className="text-text-primary mt-1">{value}</p>
    </div>
  );
}

function FilteredEmptyState() {
  return (
    <div className="bg-surface border-border rounded-md border p-8 text-center shadow-sm">
      <ClipboardList
        aria-hidden="true"
        className="text-text-muted mx-auto size-8"
      />
      <p className="text-text-primary mt-4 font-medium">没有匹配的试卷</p>
      <p className="text-text-secondary mt-2 text-sm">
        调整关键词或筛选条件后再试。
      </p>
    </div>
  );
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("zh-CN", {
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(value));
}
