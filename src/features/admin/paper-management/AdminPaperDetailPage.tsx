"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowLeft, FileText } from "lucide-react";

import { StudentRichText } from "@/components/StudentRichText";
import type { PaperAssetDto } from "@/server/contracts/paper-asset-contract";
import type {
  PaperDraftDto,
  PaperDraftResultDto,
  PaperQuestionDto,
} from "@/server/contracts/paper-draft-contract";

import {
  AdminErrorState,
  AdminLoadingState,
  AdminSurfaceStatus,
  AdminUnauthorizedState,
  fetchAdminApi,
  formatScope,
  getStoredSessionToken,
} from "../content-admin-runtime";

type PaperDetailState =
  | { status: "loading" }
  | {
      status: "ready";
      paper: PaperDraftDto;
      assets: PaperAssetDto[];
      assetStatus: "ready" | "error";
    }
  | { status: "not_found" | "forbidden" | "unauthorized" | "error" };

const paperStatusLabels = {
  archived: "已下架",
  draft: "草稿",
  published: "已发布",
} as const;

const paperTypeLabels = {
  mock_paper: "模拟卷",
  past_paper: "真题",
} as const;

const paperGenerationMethodLabels = {
  ai: "AI 生成",
  manual: "人工组卷",
  mixed: "人机混合",
} as const;

const questionTypeLabels: Record<
  PaperQuestionDto["questionSnapshot"]["questionType"],
  string
> = {
  calculation: "计算题",
  case_analysis: "案例分析题",
  fill_blank: "填空题",
  multi_choice: "多选题",
  short_answer: "简答题",
  single_choice: "单选题",
  true_false: "判断题",
};

const attachmentUsageLabels: Record<
  PaperAssetDto["paperAttachmentUsage"],
  string
> = {
  answer_analysis: "答案与解析",
  answer_sheet: "答题卷",
  other: "其他附件",
  paper_source: "试卷原始文件",
};

function isNotFoundCode(code: number): boolean {
  return Math.trunc(code / 1000) === 404;
}

function formatDateTime(value: string | null): string {
  if (value === null) return "无";

  const parsedValue = new Date(value);

  if (Number.isNaN(parsedValue.getTime())) return "时间暂不可用";

  return new Intl.DateTimeFormat("zh-CN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(parsedValue);
}

function formatFileSize(fileSizeByte: number): string {
  if (!Number.isFinite(fileSizeByte) || fileSizeByte < 0) return "大小暂不可用";
  if (fileSizeByte < 1024) return `${fileSizeByte} B`;
  if (fileSizeByte < 1024 * 1024)
    return `${(fileSizeByte / 1024).toFixed(1)} KB`;
  return `${(fileSizeByte / (1024 * 1024)).toFixed(1)} MB`;
}

function getPublishStateExplanation(paper: PaperDraftDto): string {
  if (paper.paperStatus === "published") return "发布时校验已完成";
  if (paper.paperStatus === "archived") return "历史发布版本已锁定";
  return "发布校验待执行";
}

function PaperMetadata({ paper }: { paper: PaperDraftDto }) {
  const items = [
    { label: "内容范围", value: formatScope(paper) },
    {
      label: "试卷类型",
      value:
        paper.paperType === null ? "未设置" : paperTypeLabels[paper.paperType],
    },
    {
      label: "年份",
      value: paper.year === null ? "未设置" : String(paper.year),
    },
    {
      label: "月份",
      value: paper.month === null ? "未设置" : `${paper.month} 月`,
    },
    {
      label: "来源地区",
      value: paper.sourceRegion ?? "未设置",
    },
    {
      label: "来源机构",
      value: paper.sourceOrganization ?? "未设置",
    },
    {
      label: "生成方式",
      value:
        paper.generationMethod === null
          ? "未设置"
          : paperGenerationMethodLabels[paper.generationMethod],
    },
    {
      label: "考试时长",
      value:
        paper.durationMinute === null
          ? "不限时"
          : `${paper.durationMinute} 分钟`,
    },
    {
      label: "总分",
      value: paper.totalScore === null ? "未设置" : `${paper.totalScore} 分`,
    },
    { label: "题量", value: `${paper.questionCount} 道` },
    { label: "发布状态", value: getPublishStateExplanation(paper) },
    { label: "更新时间", value: formatDateTime(paper.updatedAt) },
  ];

  return (
    <dl className="border-border grid gap-x-6 gap-y-4 border-y py-5 sm:grid-cols-2 xl:grid-cols-4">
      {items.map((item) => (
        <div key={item.label}>
          <dt className="text-text-muted text-xs">{item.label}</dt>
          <dd className="text-text-primary mt-1 text-sm font-medium">
            {item.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}

function PaperQuestionDetail({
  index,
  paperQuestion,
}: {
  index: number;
  paperQuestion: PaperQuestionDto;
}) {
  return (
    <article className="border-border border-t py-5 first:border-t-0">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h3 className="text-text-primary text-sm font-semibold">
          第 {index + 1} 题 ·{" "}
          {questionTypeLabels[paperQuestion.questionSnapshot.questionType]}
        </h3>
        <span className="text-text-secondary text-sm">
          {paperQuestion.score === null
            ? "未设置分值"
            : `${paperQuestion.score} 分`}
        </span>
      </div>
      <StudentRichText
        className="text-text-primary mt-4 space-y-2 text-sm leading-6"
        fallback="题干快照为空"
        value={paperQuestion.questionSnapshot.stemRichText}
      />

      {paperQuestion.questionSnapshot.questionOptions.length === 0 ? null : (
        <ol className="mt-4 space-y-2">
          {paperQuestion.questionSnapshot.questionOptions.map(
            (questionOption) => (
              <li
                className="border-border grid grid-cols-[2rem_minmax(0,1fr)_auto] items-start gap-2 border-b pb-2 text-sm"
                key={`${questionOption.sortOrder}-${questionOption.label}`}
              >
                <span className="text-text-primary font-medium">
                  {questionOption.label}
                </span>
                <StudentRichText
                  className="text-text-secondary"
                  fallback="选项快照为空"
                  mode="inline"
                  value={questionOption.contentRichText}
                />
                <span className="text-text-muted text-xs">
                  {questionOption.isCorrect ? "正确答案" : ""}
                </span>
              </li>
            ),
          )}
        </ol>
      )}

      {paperQuestion.materialSnapshot === null ? null : (
        <section className="border-brand-primary bg-muted/30 mt-4 border-l-2 px-4 py-3">
          <h4 className="text-text-primary text-sm font-medium">
            {paperQuestion.materialSnapshot.title}
          </h4>
          <StudentRichText
            className="text-text-secondary mt-2 space-y-2 text-sm leading-6"
            fallback="材料快照为空"
            value={paperQuestion.materialSnapshot.contentRichText}
          />
        </section>
      )}

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <section>
          <h4 className="text-text-muted text-xs font-medium">参考答案</h4>
          <StudentRichText
            className="text-text-secondary mt-2 space-y-2 text-sm leading-6"
            fallback="未填写参考答案"
            value={paperQuestion.questionSnapshot.standardAnswerRichText}
          />
        </section>
        <section>
          <h4 className="text-text-muted text-xs font-medium">老师解析</h4>
          <StudentRichText
            className="text-text-secondary mt-2 space-y-2 text-sm leading-6"
            fallback="未填写老师解析"
            value={paperQuestion.questionSnapshot.analysisRichText}
          />
        </section>
      </div>

      {paperQuestion.scoringPoints.length === 0 ? null : (
        <section className="mt-4">
          <h4 className="text-text-muted text-xs font-medium">评分点</h4>
          <ul className="mt-2 divide-y text-sm">
            {paperQuestion.scoringPoints.map((scoringPoint) => (
              <li
                className="flex items-start justify-between gap-4 py-2"
                key={`${scoringPoint.sortOrder}-${scoringPoint.description}`}
              >
                <span className="text-text-secondary">
                  {scoringPoint.description}
                </span>
                <span className="text-text-primary shrink-0 font-medium">
                  {scoringPoint.score} 分
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </article>
  );
}

function PaperStructure({ paper }: { paper: PaperDraftDto }) {
  if (paper.paperSections.length === 0) {
    return (
      <section className="border-border border-t pt-5">
        <h2 className="text-text-primary text-base font-semibold">试卷内容</h2>
        <p className="text-text-secondary mt-2 text-sm">
          当前草稿还没有大题或题目。
        </p>
      </section>
    );
  }

  return (
    <section className="space-y-6">
      <div>
        <h2 className="text-text-primary text-base font-semibold">试卷内容</h2>
        <p className="text-text-secondary mt-1 text-sm">
          按发布快照只读展示大题、材料题组、题目分值和评分点。
        </p>
      </div>
      {paper.paperSections.map((paperSection) => (
        <section
          className="border-border border-t pt-5"
          key={`${paperSection.sortOrder}-${paperSection.title}`}
        >
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="text-text-primary text-base font-semibold">
                {paperSection.title}
              </h2>
              {paperSection.description === null ? null : (
                <p className="text-text-secondary mt-1 text-sm">
                  {paperSection.description}
                </p>
              )}
            </div>
            <span className="text-text-secondary text-sm">
              小计 {paperSection.totalScore} 分
            </span>
          </div>
          <div className="mt-4">
            {paperSection.paperQuestions.length === 0 ? (
              <p className="text-text-secondary text-sm">本大题暂无题目。</p>
            ) : (
              paperSection.paperQuestions.map(
                (paperQuestion, questionIndex) => (
                  <PaperQuestionDetail
                    index={questionIndex}
                    key={paperQuestion.publicId}
                    paperQuestion={paperQuestion}
                  />
                ),
              )
            )}
          </div>
        </section>
      ))}
    </section>
  );
}

function PaperAttachments({
  assets,
  status,
}: {
  assets: PaperAssetDto[];
  status: "ready" | "error";
}) {
  return (
    <section className="border-border border-t pt-5">
      <h2 className="text-text-primary text-base font-semibold">原始文件</h2>
      <p className="text-text-secondary mt-1 text-sm">
        只读展示留档用途、文件名、大小和绑定时间。
      </p>
      {status === "error" ? (
        <p className="text-destructive mt-4 text-sm" role="alert">
          附件摘要暂不可用，试卷正文仍可正常查看。
        </p>
      ) : assets.length === 0 ? (
        <p className="text-text-secondary mt-4 text-sm">暂未绑定原始文件。</p>
      ) : (
        <ul className="mt-4 divide-y">
          {assets.map((asset) => (
            <li
              className="flex flex-col gap-1 py-3 sm:flex-row sm:items-center sm:justify-between"
              key={asset.publicId}
            >
              <div className="flex min-w-0 items-start gap-3">
                <FileText
                  aria-hidden="true"
                  className="text-text-muted mt-0.5 size-4 shrink-0"
                />
                <div className="min-w-0">
                  <p className="text-text-primary truncate text-sm font-medium">
                    {asset.fileName}
                  </p>
                  <p className="text-text-muted mt-1 text-xs">
                    {attachmentUsageLabels[asset.paperAttachmentUsage]}
                  </p>
                </div>
              </div>
              <p className="text-text-muted text-xs sm:text-right">
                {formatFileSize(asset.fileSizeByte)} ·{" "}
                {formatDateTime(asset.createdAt)}
              </p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export function AdminPaperDetailPage({ publicId }: { publicId: string }) {
  const [state, setState] = useState<PaperDetailState>({ status: "loading" });

  useEffect(() => {
    let isActive = true;

    async function loadPaper() {
      try {
        const sessionToken = getStoredSessionToken();
        const paperResponse = await fetchAdminApi<PaperDraftResultDto>(
          `/api/v1/papers/${publicId}`,
          sessionToken,
        );

        if (!isActive) return;

        if (paperResponse.code === 401001) {
          setState({ status: "unauthorized" });
          return;
        }

        if (paperResponse.code === 403621) {
          setState({ status: "forbidden" });
          return;
        }

        if (isNotFoundCode(paperResponse.code)) {
          setState({ status: "not_found" });
          return;
        }

        if (paperResponse.code !== 0 || paperResponse.data === null) {
          setState({ status: "error" });
          return;
        }

        const assetQuery = new URLSearchParams({
          page: "1",
          pageSize: "100",
          sortBy: "createdAt",
          sortOrder: "desc",
          paperPublicId: publicId,
        });
        let assets: PaperAssetDto[] = [];
        let assetStatus: "ready" | "error" = "error";

        try {
          const assetResponse = await fetchAdminApi<PaperAssetDto[]>(
            `/api/v1/paper-assets?${assetQuery.toString()}`,
            sessionToken,
          );

          if (assetResponse.code === 0 && assetResponse.data !== null) {
            assets = assetResponse.data;
            assetStatus = "ready";
          }
        } catch {
          assetStatus = "error";
        }

        if (!isActive) return;

        setState({
          status: "ready",
          paper: paperResponse.data.paper,
          assets,
          assetStatus,
        });
      } catch {
        if (isActive) setState({ status: "error" });
      }
    }

    void loadPaper();

    return () => {
      isActive = false;
    };
  }, [publicId]);

  if (state.status === "loading") {
    return <AdminLoadingState label="正在加载试卷详情" />;
  }

  if (state.status === "unauthorized") return <AdminUnauthorizedState />;

  if (state.status === "forbidden") {
    return (
      <AdminSurfaceStatus
        description="当前角色没有查看试卷详情的权限。"
        icon={<FileText aria-hidden="true" className="size-5" />}
        state="permission-denied"
        title="无权查看试卷"
      />
    );
  }

  if (state.status === "not_found") {
    return (
      <AdminSurfaceStatus
        action={
          <Link
            className="bg-primary text-primary-foreground inline-flex h-9 items-center rounded-md px-3 text-sm font-medium"
            href="/content/papers"
          >
            返回试卷管理
          </Link>
        }
        description="该试卷可能已不存在，请返回列表重新选择。"
        icon={<FileText aria-hidden="true" className="size-5" />}
        state="empty"
        title="试卷不存在"
      />
    );
  }

  if (state.status === "error") {
    return (
      <AdminErrorState
        description="请稍后刷新页面，或返回试卷管理重新进入。"
        title="试卷详情加载失败"
      />
    );
  }

  if (state.status !== "ready") return null;

  const { assetStatus, assets, paper } = state;

  return (
    <main className="space-y-6">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <Link
            className="text-text-secondary hover:text-text-primary focus-visible:ring-ring/50 inline-flex items-center gap-1 rounded-md text-sm outline-none focus-visible:ring-3"
            href="/content/papers"
          >
            <ArrowLeft aria-hidden="true" className="size-4" />
            返回试卷管理
          </Link>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className="bg-secondary text-secondary-foreground rounded-md px-2 py-1 text-xs font-medium">
              {paperStatusLabels[paper.paperStatus]}
            </span>
            <span className="border-border text-text-secondary rounded-md border px-2 py-1 text-xs">
              只读详情
            </span>
          </div>
          <h1 className="font-heading text-text-primary mt-3 text-2xl font-semibold">
            {paper.name}
          </h1>
          <p className="text-text-secondary mt-2 max-w-3xl text-sm leading-6">
            查看当前试卷快照、结构、分值、评分点和附件摘要；本页不会修改试卷状态。
          </p>
        </div>
      </header>

      <PaperMetadata paper={paper} />

      <section className="border-border border-t pt-5">
        <h2 className="text-text-primary text-base font-semibold">
          来源与材料题组
        </h2>
        <p className="text-text-secondary mt-2 text-sm">
          来源说明：{paper.sourceDescription ?? "未填写"}
        </p>
        <p className="text-text-secondary mt-2 text-sm">
          出题依据：{paper.questionBasis ?? "未填写"}
        </p>
        {paper.questionGroups.length === 0 ? (
          <p className="text-text-secondary mt-2 text-sm">暂无材料题组。</p>
        ) : (
          <ul className="mt-3 divide-y text-sm">
            {paper.questionGroups.map((questionGroup) => (
              <li
                className="flex flex-col gap-1 py-2 sm:flex-row sm:items-center sm:justify-between"
                key={`${questionGroup.sortOrder}-${questionGroup.title}`}
              >
                <span className="text-text-primary font-medium">
                  {questionGroup.title}
                </span>
                <span className="text-text-secondary">
                  {questionGroup.materialSnapshot.title}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <PaperStructure paper={paper} />
      <PaperAttachments assets={assets} status={assetStatus} />
    </main>
  );
}
