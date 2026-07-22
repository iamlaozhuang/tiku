"use client";

import { useMemo, useState } from "react";
import {
  AlertCircle,
  Archive,
  ClipboardList,
  Copy,
  Download,
  FileCheck,
  FilePlus2,
  Layers3,
  LoaderCircle,
  Search,
  Upload,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { PaperAssetDto } from "@/server/contracts/paper-asset-contract";
import type {
  PaperDraftDto,
  PaperPublishValidationIssueDto,
} from "@/server/contracts/paper-draft-contract";
import type {
  PaperStatus,
  PaperType,
  Profession,
  Subject,
} from "@/server/models/paper";

type PaperStatusFilter = "all" | PaperStatus;
type PaperTypeFilter = "all" | PaperType;
type ProfessionFilter = "all" | Profession;
type SubjectFilter = "all" | Subject;

export type AdminPaperState = "ready" | "loading" | "error";

export type AdminPaperRow = {
  paper: PaperDraftDto;
  paperAssets: PaperAssetDto[];
  mockExamRecordCount: number;
  validationIssues: PaperPublishValidationIssueDto[];
  canCompose: boolean;
  canPublish: boolean;
  canArchive: boolean;
  canCopy: boolean;
};

export type AdminPaperManagementFixture = {
  papers: AdminPaperRow[];
};

const professionLabels: Record<Profession, string> = {
  logistics: "物流",
  marketing: "营销",
  monopoly: "专卖",
};

const subjectLabels: Record<Subject, string> = {
  skill: "技能",
  theory: "理论",
};

const paperStatusLabels: Record<PaperStatus, string> = {
  archived: "已下架",
  draft: "草稿",
  published: "已发布",
};

const paperTypeLabels: Record<PaperType, string> = {
  mock_paper: "模拟卷",
  past_paper: "历年真题",
};

const paperAttachmentUsageLabels: Record<
  PaperAssetDto["paperAttachmentUsage"],
  string
> = {
  answer_analysis: "解析文件",
  answer_paper: "答案卷",
  answer_sheet: "答题卷",
  material_paper: "材料卷",
  other: "其他（历史）",
  paper_source: "试卷文件",
  source_material: "来源教材或课件",
};

export const adminPaperManagementFixture: AdminPaperManagementFixture = {
  papers: [
    {
      paper: {
        publicId: "paper-marketing-2026-spring",
        name: "2026 春季营销理论模拟卷",
        profession: "marketing",
        level: 3,
        subject: "theory",
        paperStatus: "published",
        paperType: "mock_paper",
        year: 2026,
        month: null,
        sourceDescription: "省级训练题库",
        sourceRegion: null,
        sourceOrganization: null,
        questionBasis: null,
        generationMethod: "manual",
        durationMinute: 120,
        totalScore: "100.0",
        publishedAt: "2026-05-19T08:00:00.000Z",
        archivedAt: null,
        questionCount: 42,
        revision: 1,
        paperSections: [
          {
            title: "单选题",
            description: "市场调研与营销基础",
            sortOrder: 1,
            totalScore: "40.0",
            paperQuestions: [],
          },
          {
            title: "案例分析",
            description: "材料题组与综合判断",
            sortOrder: 2,
            totalScore: "60.0",
            paperQuestions: [],
          },
        ],
        questionGroups: [
          {
            publicId: "question-group-marketing-001",
            title: "区域市场材料",
            materialPublicId: "material-marketing-001",
            materialSnapshot: {
              materialPublicId: "material-marketing-001",
              title: "营销案例材料 A",
              contentRichText:
                "某品牌计划进入区域市场，需要完成消费者抽样调研。",
              profession: "marketing",
              level: 3,
              subject: "theory",
            },
            sortOrder: 1,
          },
        ],
        createdAt: "2026-05-18T06:00:00.000Z",
        updatedAt: "2026-05-19T08:20:00.000Z",
      },
      paperAssets: [
        {
          publicId: "paper-asset-spring-marketing-source",
          paperPublicId: "paper-marketing-2026-spring",
          paperAttachmentUsage: "paper_source",
          fileName: "spring-marketing.pdf",
          contentType: "application/pdf",
          fileSizeByte: 2048000,
          fileHash: "hash-spring-marketing",
          createdAt: "2026-05-19T07:40:00.000Z",
        },
      ],
      mockExamRecordCount: 18,
      validationIssues: [],
      canCompose: false,
      canPublish: false,
      canArchive: true,
      canCopy: true,
    },
    {
      paper: {
        publicId: "paper-logistics-2026-practice",
        name: "物流技能练习卷",
        profession: "logistics",
        level: 2,
        subject: "skill",
        paperStatus: "draft",
        paperType: "mock_paper",
        year: 2026,
        month: null,
        sourceDescription: "内容老师草稿",
        sourceRegion: null,
        sourceOrganization: null,
        questionBasis: null,
        generationMethod: "manual",
        durationMinute: null,
        totalScore: null,
        publishedAt: null,
        archivedAt: null,
        questionCount: 8,
        revision: 1,
        paperSections: [
          {
            title: "技能实务",
            description: "物流成本与配送场景",
            sortOrder: 1,
            totalScore: "0.0",
            paperQuestions: [],
          },
        ],
        questionGroups: [],
        createdAt: "2026-05-19T05:10:00.000Z",
        updatedAt: "2026-05-19T07:30:00.000Z",
      },
      paperAssets: [],
      mockExamRecordCount: 0,
      validationIssues: [
        {
          code: "paper_question_score_missing",
          message: "缺少题目分值",
        },
      ],
      canCompose: true,
      canPublish: true,
      canArchive: false,
      canCopy: true,
    },
    {
      paper: {
        publicId: "paper-monopoly-2025-past",
        name: "2025 专卖执法历年真题",
        profession: "monopoly",
        level: 2,
        subject: "theory",
        paperStatus: "archived",
        paperType: "past_paper",
        year: 2025,
        month: null,
        sourceDescription: "历年考试回收",
        sourceRegion: null,
        sourceOrganization: null,
        questionBasis: null,
        generationMethod: "manual",
        durationMinute: 90,
        totalScore: "100.0",
        publishedAt: "2026-05-18T03:00:00.000Z",
        archivedAt: "2026-05-19T06:10:00.000Z",
        questionCount: 36,
        revision: 1,
        paperSections: [
          {
            title: "法规判断",
            description: "专卖执法基础知识",
            sortOrder: 1,
            totalScore: "45.0",
            paperQuestions: [],
          },
          {
            title: "综合题",
            description: "执法情境分析",
            sortOrder: 2,
            totalScore: "55.0",
            paperQuestions: [],
          },
        ],
        questionGroups: [],
        createdAt: "2026-05-17T09:20:00.000Z",
        updatedAt: "2026-05-19T06:10:00.000Z",
      },
      paperAssets: [
        {
          publicId: "paper-asset-monopoly-answer-analysis",
          paperPublicId: "paper-monopoly-2025-past",
          paperAttachmentUsage: "answer_analysis",
          fileName: "monopoly-2025-analysis.docx",
          contentType:
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
          fileSizeByte: 826000,
          fileHash: "hash-monopoly-analysis",
          createdAt: "2026-05-18T03:30:00.000Z",
        },
      ],
      mockExamRecordCount: 7,
      validationIssues: [],
      canCompose: false,
      canPublish: false,
      canArchive: false,
      canCopy: true,
    },
  ],
};

export type AdminPaperManagementProps = {
  state?: AdminPaperState;
};

export function AdminPaperManagement({
  state = "ready",
}: AdminPaperManagementProps) {
  const [keyword, setKeyword] = useState("");
  const [profession, setProfession] = useState<ProfessionFilter>("all");
  const [subject, setSubject] = useState<SubjectFilter>("all");
  const [paperStatus, setPaperStatus] = useState<PaperStatusFilter>("all");
  const [paperType, setPaperType] = useState<PaperTypeFilter>("all");

  const filteredPapers = useMemo(
    () =>
      adminPaperManagementFixture.papers.filter((row) => {
        const searchableText = [
          row.paper.publicId,
          row.paper.name,
          row.paper.sourceDescription,
          row.paper.paperSections
            .map((paperSection) => paperSection.title)
            .join(" "),
          row.paperAssets.map((paperAsset) => paperAsset.fileName).join(" "),
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        return (
          includesKeyword(searchableText, keyword) &&
          matchesFilter(row.paper.profession, profession) &&
          matchesFilter(row.paper.subject, subject) &&
          matchesFilter(row.paper.paperStatus, paperStatus) &&
          matchesNullableFilter(row.paper.paperType, paperType)
        );
      }),
    [keyword, paperStatus, paperType, profession, subject],
  );

  if (state === "loading") {
    return <LoadingState />;
  }

  if (state === "error") {
    return <ErrorState />;
  }

  return (
    <section className="space-y-6">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-2">
          <p className="text-brand-primary text-sm font-medium">内容后台</p>
          <h1 className="font-heading text-text-primary text-2xl font-semibold">
            试卷管理
          </h1>
          <p className="text-text-secondary max-w-3xl text-sm">
            管理草稿组卷、发布校验、下架复制、原始文件与模拟考试记录概览；本基线只展示
            业务标识与契约字段。
          </p>
        </div>
        <ActionBar hasRows={filteredPapers.length > 0} />
      </header>

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
        <EmptyState />
      )}
    </section>
  );
}

function ActionBar({ hasRows }: { hasRows: boolean }) {
  return (
    <div className="flex flex-wrap gap-2">
      <Button>
        <FilePlus2 aria-hidden="true" data-icon="inline-start" />
        新建草稿
      </Button>
      <Button disabled={!hasRows} variant="outline">
        <Layers3 aria-hidden="true" data-icon="inline-start" />
        组卷
      </Button>
      <Button disabled={!hasRows} variant="outline">
        <FileCheck aria-hidden="true" data-icon="inline-start" />
        发布
      </Button>
      <Button disabled={!hasRows} variant="outline">
        <Archive aria-hidden="true" data-icon="inline-start" />
        下架
      </Button>
      <Button disabled={!hasRows} variant="secondary">
        <Copy aria-hidden="true" data-icon="inline-start" />
        复制
      </Button>
      <Button disabled={!hasRows} variant="secondary">
        <Upload aria-hidden="true" data-icon="inline-start" />
        绑定原始文件
      </Button>
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
              placeholder="试卷名称、来源、业务标识、大题或文件名"
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

function FilterSelect({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: [string, string][];
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="flex min-w-36 flex-col gap-2 text-sm font-medium">
      <span className="text-text-secondary">{label}</span>
      <select
        aria-label={label}
        className="border-input focus-visible:border-ring focus-visible:ring-ring/50 bg-surface h-8 rounded-lg border px-2.5 text-sm outline-none focus-visible:ring-3"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        {options.map(([optionValue, optionLabel]) => (
          <option key={optionValue} value={optionValue}>
            {optionLabel}
          </option>
        ))}
      </select>
    </label>
  );
}

function SummaryRail({ rows }: { rows: AdminPaperRow[] }) {
  const totalQuestionCount = rows.reduce(
    (questionCount, row) => questionCount + row.paper.questionCount,
    0,
  );
  const totalMockExamRecordCount = rows.reduce(
    (mockExamRecordCount, row) => mockExamRecordCount + row.mockExamRecordCount,
    0,
  );
  const publishedCount = rows.filter(
    (row) => row.paper.paperStatus === "published",
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

function PaperList({ rows }: { rows: AdminPaperRow[] }) {
  return (
    <div className="grid gap-3">
      {rows.map((row) => (
        <article
          className="bg-surface border-border rounded-md border p-4 shadow-sm"
          data-public-id={row.paper.publicId}
          data-testid={`paper-row-${row.paper.publicId}`}
          key={row.paper.publicId}
        >
          <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <StatusBadge status={row.paper.paperStatus} />
                <span className="text-text-muted text-xs">
                  {formatPaperType(row.paper.paperType)}
                </span>
                <span className="text-text-muted text-xs">
                  {formatScope(
                    row.paper.profession,
                    row.paper.level,
                    row.paper.subject,
                  )}
                </span>
                {row.paper.year === null ? null : (
                  <span className="text-text-muted text-xs">
                    {row.paper.year}
                  </span>
                )}
              </div>
              <h2 className="text-text-primary text-base font-semibold">
                {row.paper.name}
              </h2>
              <div className="flex flex-wrap gap-2 text-xs">
                <MetricBadge
                  label="总分"
                  value={row.paper.totalScore ?? "未设置"}
                />
                <MetricBadge
                  label="题目"
                  value={`${row.paper.questionCount}`}
                />
                <MetricBadge
                  label="时长"
                  value={
                    row.paper.durationMinute === null
                      ? "不限"
                      : `${row.paper.durationMinute} 分钟`
                  }
                />
                <MetricBadge
                  label="模拟记录"
                  value={`${row.mockExamRecordCount}`}
                />
              </div>
            </div>
            <PublicId value={row.paper.publicId} />
          </div>

          <div className="border-border mt-4 grid gap-4 border-t pt-4 xl:grid-cols-[minmax(0,1.4fr)_minmax(16rem,0.8fr)]">
            <PaperSectionBlock paper={row.paper} />
            <div className="space-y-4">
              <ReadinessBlock validationIssues={row.validationIssues} />
              <AssetBlock paperAssets={row.paperAssets} />
              <LifecycleBlock row={row} />
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}

function PaperSectionBlock({ paper }: { paper: PaperDraftDto }) {
  return (
    <div>
      <p className="text-text-muted mb-2 text-xs font-medium">大题结构</p>
      <ul className="grid gap-2">
        {paper.paperSections.map((paperSection) => (
          <li
            className="bg-muted/60 rounded-md px-3 py-2 text-sm"
            key={`${paper.publicId}-${paperSection.sortOrder}`}
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-text-primary font-medium">
                {paperSection.title}
              </span>
              <span className="text-text-muted text-xs">
                {paperSection.totalScore} 分
              </span>
            </div>
            {paperSection.description === null ? null : (
              <p className="text-text-secondary mt-1 text-xs">
                {paperSection.description}
              </p>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

function ReadinessBlock({
  validationIssues,
}: {
  validationIssues: PaperPublishValidationIssueDto[];
}) {
  return (
    <div>
      <p className="text-text-muted mb-2 text-xs font-medium">发布校验</p>
      {validationIssues.length === 0 ? (
        <p className="text-text-secondary bg-secondary rounded-md px-3 py-2 text-sm">
          发布校验已通过
        </p>
      ) : (
        <ul className="grid gap-2">
          {validationIssues.map((validationIssue) => (
            <li
              className="text-destructive bg-destructive/10 flex items-center gap-2 rounded-md px-3 py-2 text-sm"
              key={validationIssue.code}
            >
              <AlertCircle aria-hidden="true" className="size-4" />
              {validationIssue.message}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function AssetBlock({ paperAssets }: { paperAssets: PaperAssetDto[] }) {
  return (
    <div>
      <p className="text-text-muted mb-2 text-xs font-medium">原始文件</p>
      {paperAssets.length === 0 ? (
        <p className="text-text-muted text-sm">暂未绑定原始文件</p>
      ) : (
        <ul className="grid gap-2">
          {paperAssets.map((paperAsset) => (
            <li
              className="border-border rounded-md border px-3 py-2 text-sm"
              key={paperAsset.publicId}
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-text-primary">{paperAsset.fileName}</span>
                <span className="text-text-muted text-xs">
                  {paperAttachmentUsageLabels[paperAsset.paperAttachmentUsage]}
                </span>
              </div>
              <Button className="mt-2" size="sm" variant="outline">
                <Download aria-hidden="true" data-icon="inline-start" />
                下载原始文件
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function LifecycleBlock({ row }: { row: AdminPaperRow }) {
  return (
    <div>
      <p className="text-text-muted mb-2 text-xs font-medium">生命周期</p>
      <div className="flex flex-wrap gap-2">
        <LifecycleBadge enabled={row.canCompose} label="可组卷" />
        <LifecycleBadge enabled={row.canPublish} label="可发布" />
        <LifecycleBadge enabled={row.canArchive} label="可下架" />
        <LifecycleBadge enabled={row.canCopy} label="可复制" />
      </div>
      <p className="text-text-muted mt-2 text-xs">
        默认按更新时间倒序展示：{formatDateTime(row.paper.updatedAt)}
      </p>
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

function LifecycleBadge({
  enabled,
  label,
}: {
  enabled: boolean;
  label: string;
}) {
  return (
    <span
      className={
        enabled
          ? "bg-secondary text-secondary-foreground rounded-md px-2 py-1 text-xs"
          : "bg-muted text-text-muted rounded-md px-2 py-1 text-xs"
      }
    >
      {label}
    </span>
  );
}

function PublicId({ value }: { value: string }) {
  return (
    <code className="bg-muted text-text-secondary rounded-md px-2 py-1 font-mono text-xs">
      {value}
    </code>
  );
}

function LoadingState() {
  return (
    <section className="bg-surface border-border rounded-md border p-8 text-center shadow-sm">
      <LoaderCircle
        aria-hidden="true"
        className="text-brand-primary mx-auto size-8 animate-spin"
      />
      <h1 className="text-text-primary mt-4 text-base font-semibold">
        正在加载试卷
      </h1>
      <p className="text-text-secondary mt-2 text-sm">
        正在读取试卷列表和原始文件信息。
      </p>
    </section>
  );
}

function ErrorState() {
  return (
    <section className="bg-surface border-border rounded-md border p-8 text-center shadow-sm">
      <AlertCircle
        aria-hidden="true"
        className="text-destructive mx-auto size-8"
      />
      <h1 className="text-text-primary mt-4 text-base font-semibold">
        试卷加载失败
      </h1>
      <p className="text-text-secondary mt-2 text-sm">请刷新页面或稍后重试。</p>
    </section>
  );
}

function EmptyState() {
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

function includesKeyword(text: string, keyword: string) {
  return keyword.trim() === "" || text.includes(keyword.trim().toLowerCase());
}

function matchesFilter<TValue extends string>(
  actual: TValue,
  expected: "all" | TValue,
) {
  return expected === "all" || actual === expected;
}

function matchesNullableFilter<TValue extends string>(
  actual: TValue | null,
  expected: "all" | TValue,
) {
  return expected === "all" || actual === expected;
}

function formatScope(profession: Profession, level: number, subject: Subject) {
  return `${professionLabels[profession]} / ${level}级 / ${subjectLabels[subject]}`;
}

function formatPaperType(paperType: PaperType | null) {
  return paperType === null ? "未设置类型" : paperTypeLabels[paperType];
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
