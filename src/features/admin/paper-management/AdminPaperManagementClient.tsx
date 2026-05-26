"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Archive,
  ArrowDownUp,
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
import type { PaperAssetDto } from "@/server/contracts/paper-asset-contract";
import type {
  PaperCopyResultDto,
  PaperDraftDto,
  PaperPublishResultDto,
  PaperQuestionDto,
} from "@/server/contracts/paper-draft-contract";
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
type AdminCommonSortOrder = "asc" | "desc";
type PaperLoadState = "loading" | "ready" | "empty" | "unauthorized" | "error";
type PaperFormValues = {
  durationMinute: string;
  level: string;
  name: string;
  paperType: PaperType;
  profession: Profession;
  source: string;
  subject: Subject;
  totalScore: string;
  year: string;
};
type PaperQuestionFormValues = {
  materialPublicId: string;
  paperPublicId: string;
  paperSectionDescription: string;
  paperSectionSortOrder: string;
  paperSectionTitle: string;
  questionPublicId: string;
  questionGroupSortOrder: string;
  questionGroupTitle: string;
  score: string;
  sortOrder: string;
};
type PaperAssetFormValues = {
  paperPublicId: string;
  profession: Profession;
  file: File | null;
};
type ActivePaperForm =
  | {
      kind: "paper";
      values: PaperFormValues;
    }
  | {
      kind: "paperQuestion";
      values: PaperQuestionFormValues;
    }
  | {
      kind: "paperAsset";
      values: PaperAssetFormValues;
    };

type PendingPaperAction =
  | {
      kind: "publish";
      publicId: string;
    }
  | {
      kind: "archive";
      publicId: string;
    };

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

  return { loadState, papers, setPapers };
}

async function mutateAdminApi<TData>(
  path: string,
  sessionToken: string,
  method: "POST" | "PATCH" | "DELETE",
  body?: unknown,
) {
  const response = await fetch(path, {
    method,
    headers: {
      authorization: `Bearer ${sessionToken}`,
      "content-type": "application/json",
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  return (await response.json()) as {
    code: number;
    message: string;
    data: TData | null;
  };
}

async function mutateAdminMultipartApi<TData>(
  path: string,
  sessionToken: string,
  body: FormData,
) {
  const response = await fetch(path, {
    method: "POST",
    headers: {
      authorization: `Bearer ${sessionToken}`,
    },
    body,
  });

  return (await response.json()) as {
    code: number;
    message: string;
    data: TData | null;
  };
}

function upsertByPublicId<TItem extends { publicId: string }>(
  items: TItem[],
  nextItem: TItem,
) {
  if (items.some((item) => item.publicId === nextItem.publicId)) {
    return items.map((item) =>
      item.publicId === nextItem.publicId ? nextItem : item,
    );
  }

  return [nextItem, ...items];
}

function mapPaperDraftToSummary(
  paper: PaperDraftDto | AdminPaperOpsSummaryDto,
  existingPaper?: AdminPaperOpsSummaryDto,
): AdminPaperOpsSummaryDto {
  return {
    publicId: paper.publicId,
    name: paper.name,
    profession: paper.profession,
    level: paper.level,
    subject: paper.subject,
    paperStatus: paper.paperStatus,
    paperType: paper.paperType ?? existingPaper?.paperType ?? "mock_paper",
    year: paper.year,
    totalScore: paper.totalScore ?? existingPaper?.totalScore ?? "0.0",
    questionCount: paper.questionCount,
    mockExamCount:
      "mockExamCount" in paper
        ? paper.mockExamCount
        : (existingPaper?.mockExamCount ?? 0),
    sourceFileName:
      "sourceFileName" in paper
        ? paper.sourceFileName
        : (existingPaper?.sourceFileName ?? null),
    publishValidationSummary:
      "publishValidationSummary" in paper
        ? paper.publishValidationSummary
        : (existingPaper?.publishValidationSummary ?? null),
    updatedAt: paper.updatedAt,
  };
}

function createPaperInput(values: PaperFormValues) {
  return {
    name: values.name,
    profession: values.profession,
    level: Number(values.level),
    subject: values.subject,
    paperType: values.paperType,
    year: values.year.trim().length === 0 ? null : Number(values.year),
    source: values.source.trim().length === 0 ? null : values.source,
    durationMinute:
      values.durationMinute.trim().length === 0
        ? null
        : Number(values.durationMinute),
    totalScore: values.totalScore,
  };
}

function createPaperQuestionInput(values: PaperQuestionFormValues) {
  return {
    questionPublicId: values.questionPublicId,
    score: values.score,
    sortOrder: Number(values.sortOrder),
    paperSection: {
      title: values.paperSectionTitle,
      description:
        values.paperSectionDescription.trim().length === 0
          ? null
          : values.paperSectionDescription,
      sortOrder: Number(values.paperSectionSortOrder),
    },
    questionGroup:
      values.materialPublicId.trim().length === 0
        ? null
        : {
            title:
              values.questionGroupTitle.trim().length === 0
                ? values.paperSectionTitle
                : values.questionGroupTitle,
            materialPublicId: values.materialPublicId,
            sortOrder: Number(values.questionGroupSortOrder),
          },
  };
}

function createPaperAssetFormData(values: PaperAssetFormValues) {
  const formData = new FormData();

  formData.set("paperPublicId", values.paperPublicId);
  formData.set("paperAttachmentUsage", "paper_source");
  formData.set("profession", values.profession);

  if (values.file !== null) {
    formData.set("fileName", values.file.name);
    formData.set("file", values.file);
  }

  return formData;
}

export function AdminPaperManagement() {
  const [keyword, setKeyword] = useState("");
  const [levelFilter, setLevelFilter] = useState("");
  const [yearFilter, setYearFilter] = useState("");
  const [profession, setProfession] = useState<ProfessionFilter>("all");
  const [subject, setSubject] = useState<SubjectFilter>("all");
  const [paperStatus, setPaperStatus] = useState<PaperStatusFilter>("all");
  const [paperType, setPaperType] = useState<PaperTypeFilter>("all");
  const [activeForm, setActiveForm] = useState<ActivePaperForm | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [pageSize, setPageSize] = useState("20");
  const [sortOrder, setSortOrder] = useState<AdminCommonSortOrder>("desc");
  const [pendingPaperAction, setPendingPaperAction] =
    useState<PendingPaperAction | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { loadState, papers, setPapers } = usePaperData();

  const filteredPapers = useMemo(
    () =>
      papers.filter((paper) => {
        const searchableText = [
          paper.publicId,
          paper.name,
          paper.sourceFileName,
          paper.publishValidationSummary,
          paper.year,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        return (
          includesKeyword(searchableText, keyword) &&
          includesKeyword(String(paper.level), levelFilter) &&
          includesKeyword(String(paper.year ?? ""), yearFilter) &&
          matchesFilter(paper.profession, profession) &&
          matchesFilter(paper.subject, subject) &&
          matchesFilter(paper.paperStatus, paperStatus) &&
          matchesNullableFilter(paper.paperType, paperType)
        );
      }),
    [
      keyword,
      levelFilter,
      paperStatus,
      paperType,
      papers,
      profession,
      subject,
      yearFilter,
    ],
  );
  const displayedPapers = useMemo(
    () =>
      sortItemsByUpdatedAt(filteredPapers, sortOrder).slice(
        0,
        Number(pageSize),
      ),
    [filteredPapers, pageSize, sortOrder],
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

  async function handleSavePaper(values: PaperFormValues) {
    const sessionToken = getStoredSessionToken();

    if (sessionToken === null) {
      setActionError("管理员会话已失效，请重新登录后再操作。");
      return;
    }

    setIsSubmitting(true);
    setActionError(null);

    try {
      const response = await mutateAdminApi<{ paper: PaperDraftDto }>(
        "/api/v1/papers",
        sessionToken,
        "POST",
        createPaperInput(values),
      );

      if (response.code !== 0 || response.data === null) {
        setActionError("试卷保存失败，请刷新后重试。");
        return;
      }

      const savedPaper = mapPaperDraftToSummary(response.data.paper);
      setPapers((currentPapers) => upsertByPublicId(currentPapers, savedPaper));
      setActionMessage(`试卷 ${savedPaper.publicId} 已保存`);
      setActiveForm(null);
    } catch {
      setActionError("试卷保存失败，请刷新后重试。");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleAddPaperQuestion(values: PaperQuestionFormValues) {
    const sessionToken = getStoredSessionToken();

    if (sessionToken === null) {
      setActionError("管理员会话已失效，请重新登录后再操作。");
      return;
    }

    setIsSubmitting(true);
    setActionError(null);

    try {
      const response = await mutateAdminApi<{
        paperQuestion: PaperQuestionDto;
      }>(
        `/api/v1/papers/${values.paperPublicId}/questions`,
        sessionToken,
        "POST",
        createPaperQuestionInput(values),
      );

      if (response.code !== 0 || response.data === null) {
        setActionError("题目加入试卷失败，请刷新后重试。");
        return;
      }

      setPapers((currentPapers) =>
        currentPapers.map((paper) =>
          paper.publicId === values.paperPublicId
            ? { ...paper, questionCount: paper.questionCount + 1 }
            : paper,
        ),
      );
      setActionMessage(
        `题目 ${response.data.paperQuestion.publicId} 已加入试卷`,
      );
      setActiveForm(null);
    } catch {
      setActionError("题目加入试卷失败，请刷新后重试。");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleSavePaperAsset(values: PaperAssetFormValues) {
    const sessionToken = getStoredSessionToken();

    if (sessionToken === null) {
      setActionError("管理员会话已失效，请重新登录后再操作。");
      return;
    }

    if (values.file === null) {
      setActionError("请选择本地文件后再保存。");
      return;
    }

    setIsSubmitting(true);
    setActionError(null);

    try {
      const response = await mutateAdminMultipartApi<{
        paperAsset: PaperAssetDto;
      }>(
        "/api/v1/paper-assets",
        sessionToken,
        createPaperAssetFormData(values),
      );

      if (response.code !== 0 || response.data === null) {
        setActionError("附件绑定失败，请刷新后重试。");
        return;
      }

      const paperAsset = response.data.paperAsset;
      setPapers((currentPapers) =>
        currentPapers.map((paper) =>
          paper.publicId === values.paperPublicId
            ? { ...paper, sourceFileName: paperAsset.fileName }
            : paper,
        ),
      );
      setActionMessage(`附件 ${paperAsset.publicId} metadata 已登记`);
      setActiveForm(null);
    } catch {
      setActionError("附件绑定失败，请刷新后重试。");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handlePublishPaper(publicId: string) {
    const sessionToken = getStoredSessionToken();

    if (sessionToken === null) {
      setActionError("管理员会话已失效，请重新登录后再操作。");
      return;
    }

    setActionError(null);
    const response = await mutateAdminApi<PaperPublishResultDto>(
      `/api/v1/papers/${publicId}/publish`,
      sessionToken,
      "POST",
    );

    if (response.code !== 0 || response.data === null) {
      setActionError("试卷发布失败，请检查发布校验后重试。");
      return;
    }

    const publishedPaper = response.data.paper;
    setPapers((currentPapers) =>
      upsertByPublicId(
        currentPapers,
        mapPaperDraftToSummary(
          publishedPaper,
          currentPapers.find((paper) => paper.publicId === publicId),
        ),
      ),
    );
    setActionMessage(`试卷 ${publicId} 已发布`);
  }

  async function handleArchivePaper(publicId: string) {
    const sessionToken = getStoredSessionToken();

    if (sessionToken === null) {
      setActionError("管理员会话已失效，请重新登录后再操作。");
      return;
    }

    setActionError(null);
    const response = await mutateAdminApi<{ paper: PaperDraftDto }>(
      `/api/v1/papers/${publicId}/archive`,
      sessionToken,
      "POST",
    );

    if (response.code !== 0 || response.data === null) {
      setActionError("试卷下架失败，请刷新后重试。");
      return;
    }

    const archivedPaper = response.data.paper;
    setPapers((currentPapers) =>
      upsertByPublicId(
        currentPapers,
        mapPaperDraftToSummary(
          archivedPaper,
          currentPapers.find((paper) => paper.publicId === publicId),
        ),
      ),
    );
    setActionMessage(`试卷 ${publicId} 已下架`);
  }

  async function handleCopyPaper(publicId: string) {
    const sessionToken = getStoredSessionToken();

    if (sessionToken === null) {
      setActionError("管理员会话已失效，请重新登录后再操作。");
      return;
    }

    setActionError(null);
    const response = await mutateAdminApi<PaperCopyResultDto>(
      `/api/v1/papers/${publicId}/copy`,
      sessionToken,
      "POST",
    );

    if (response.code !== 0 || response.data === null) {
      setActionError("试卷复制失败，请刷新后重试。");
      return;
    }

    const copiedPaper = mapPaperDraftToSummary(response.data.paper);
    setPapers((currentPapers) => upsertByPublicId(currentPapers, copiedPaper));
    setActionMessage(`试卷 ${copiedPaper.publicId} 已复制`);
  }

  async function handleConfirmPendingPaperAction() {
    if (pendingPaperAction === null) {
      return;
    }

    const currentAction = pendingPaperAction;
    setPendingPaperAction(null);

    if (currentAction.kind === "publish") {
      await handlePublishPaper(currentAction.publicId);
      return;
    }

    await handleArchivePaper(currentAction.publicId);
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
        <ActionBar
          onCreate={() => {
            setActionError(null);
            setActionMessage(null);
            setActiveForm({
              kind: "paper",
              values: {
                name: "新建本地组卷",
                profession: "marketing",
                level: "3",
                subject: "theory",
                paperType: "mock_paper",
                year: "2026",
                source: "",
                durationMinute: "90",
                totalScore: "5.0",
              },
            });
          }}
        />
      </header>

      <ContentOpsStagingRoleArrangement />

      <FilterPanel
        keyword={keyword}
        levelFilter={levelFilter}
        paperStatus={paperStatus}
        paperType={paperType}
        profession={profession}
        subject={subject}
        yearFilter={yearFilter}
        onKeywordChange={setKeyword}
        onLevelFilterChange={setLevelFilter}
        onPaperStatusChange={setPaperStatus}
        onPaperTypeChange={setPaperType}
        onProfessionChange={setProfession}
        onSubjectChange={setSubject}
        onYearFilterChange={setYearFilter}
      />

      <AdminCommonListControls
        pageSize={pageSize}
        sortOrder={sortOrder}
        onPageSizeChange={setPageSize}
        onToggleSortOrder={() =>
          setSortOrder((currentSortOrder) =>
            currentSortOrder === "desc" ? "asc" : "desc",
          )
        }
      />

      <SummaryRail rows={displayedPapers} />

      {actionMessage === null ? null : (
        <p className="text-brand-primary text-sm" role="status">
          {actionMessage}
        </p>
      )}
      {actionError === null ? null : (
        <p className="text-destructive text-sm" role="alert">
          {actionError}
        </p>
      )}

      {activeForm?.kind === "paper" ? (
        <PaperWriteForm
          isSubmitting={isSubmitting}
          values={activeForm.values}
          onCancel={() => setActiveForm(null)}
          onSubmit={handleSavePaper}
        />
      ) : null}

      {activeForm?.kind === "paperQuestion" ? (
        <PaperQuestionWriteForm
          isSubmitting={isSubmitting}
          values={activeForm.values}
          onCancel={() => setActiveForm(null)}
          onSubmit={handleAddPaperQuestion}
        />
      ) : null}

      {activeForm?.kind === "paperAsset" ? (
        <PaperAssetWriteForm
          isSubmitting={isSubmitting}
          key={activeForm.values.paperPublicId}
          values={activeForm.values}
          onCancel={() => setActiveForm(null)}
          onSubmit={handleSavePaperAsset}
        />
      ) : null}

      {filteredPapers.length > 0 ? (
        <PaperList
          rows={displayedPapers}
          onArchive={(publicId) =>
            setPendingPaperAction({ kind: "archive", publicId })
          }
          onBindAsset={(publicId) => {
            setActionError(null);
            setActionMessage(null);
            const selectedPaper = papers.find(
              (paper) => paper.publicId === publicId,
            );
            setActiveForm({
              kind: "paperAsset",
              values: {
                paperPublicId: publicId,
                profession: selectedPaper?.profession ?? "marketing",
                file: null,
              },
            });
          }}
          onCompose={(publicId) => {
            setActionError(null);
            setActionMessage(null);
            setActiveForm({
              kind: "paperQuestion",
              values: {
                materialPublicId: "",
                paperPublicId: publicId,
                paperSectionDescription: "",
                paperSectionSortOrder: "1",
                paperSectionTitle: "默认大题",
                questionPublicId: "question-marketing-001",
                questionGroupSortOrder: "1",
                questionGroupTitle: "",
                score: "5.0",
                sortOrder: "1",
              },
            });
          }}
          onCopy={(publicId) => void handleCopyPaper(publicId)}
          onPublish={(publicId) =>
            setPendingPaperAction({ kind: "publish", publicId })
          }
        />
      ) : (
        <FilteredEmptyState />
      )}

      {pendingPaperAction === null ? null : (
        <PaperConfirmationDialog
          action={pendingPaperAction}
          onCancel={() => setPendingPaperAction(null)}
          onConfirm={() => void handleConfirmPendingPaperAction()}
        />
      )}
    </section>
  );
}

function sortItemsByUpdatedAt<TItem extends { updatedAt: string }>(
  items: TItem[],
  sortOrder: AdminCommonSortOrder,
) {
  return [...items].sort((leftItem, rightItem) => {
    const leftTime = new Date(leftItem.updatedAt).getTime();
    const rightTime = new Date(rightItem.updatedAt).getTime();

    return sortOrder === "desc" ? rightTime - leftTime : leftTime - rightTime;
  });
}

function AdminCommonListControls({
  pageSize,
  sortOrder,
  onPageSizeChange,
  onToggleSortOrder,
}: {
  pageSize: string;
  sortOrder: AdminCommonSortOrder;
  onPageSizeChange: (value: string) => void;
  onToggleSortOrder: () => void;
}) {
  return (
    <section
      aria-label="列表通用控制"
      className="bg-surface border-border flex flex-wrap items-end gap-3 rounded-md border p-4 shadow-sm"
    >
      <FilterSelect
        label="每页条数"
        options={[
          ["20", "20"],
          ["50", "50"],
          ["100", "100"],
        ]}
        value={pageSize}
        onChange={onPageSizeChange}
      />
      <Button type="button" variant="outline" onClick={onToggleSortOrder}>
        <ArrowDownUp aria-hidden="true" data-icon="inline-start" />
        更新时间排序
      </Button>
      <p className="text-text-secondary text-xs">
        当前{sortOrder === "desc" ? "降序" : "升序"}
        ，筛选变更会自动刷新当前结果。
      </p>
    </section>
  );
}

function PaperConfirmationDialog({
  action,
  onCancel,
  onConfirm,
}: {
  action: PendingPaperAction;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  const isArchive = action.kind === "archive";

  return (
    <div
      aria-modal="true"
      className="border-border bg-surface fixed top-20 left-1/2 z-50 w-full max-w-md -translate-x-1/2 rounded-md border p-4 shadow-lg"
      role="alertdialog"
    >
      <div className="space-y-3">
        <h2 className="text-text-primary text-base font-semibold">
          {isArchive ? "确认下架试卷？" : "确认发布试卷？"}
        </h2>
        <p className="text-text-secondary text-sm">
          将提交 {action.publicId} 的{isArchive ? "下架" : "发布"}
          操作；操作只使用 publicId。
        </p>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant={isArchive ? "destructive" : "default"}
            onClick={onConfirm}
          >
            {isArchive ? "确认下架" : "确认发布"}
          </Button>
          <Button type="button" variant="outline" onClick={onCancel}>
            取消
          </Button>
        </div>
      </div>
    </div>
  );
}

function ActionBar({ onCreate }: { onCreate: () => void }) {
  return (
    <div className="max-w-xl space-y-2">
      <div className="flex flex-wrap gap-2">
        <Button onClick={onCreate}>
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
        草稿新建和行内组卷、发布、下架、复制、附件 metadata
        登记已接入本地运行时；未选择试卷时请使用行内操作。
      </p>
    </div>
  );
}

function PaperWriteForm({
  isSubmitting,
  values,
  onCancel,
  onSubmit,
}: {
  isSubmitting: boolean;
  values: PaperFormValues;
  onCancel: () => void;
  onSubmit: (values: PaperFormValues) => void;
}) {
  const [formValues, setFormValues] = useState(values);

  return (
    <form
      aria-label="试卷表单"
      className="bg-surface border-border grid gap-4 rounded-md border p-4 shadow-sm"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit(formValues);
      }}
    >
      <h2 className="text-text-primary text-base font-semibold">新建草稿</h2>
      <label className="grid gap-2 text-sm font-medium">
        <span className="text-text-secondary">试卷名称</span>
        <Input
          aria-label="试卷名称"
          value={formValues.name}
          onChange={(event) =>
            setFormValues({ ...formValues, name: event.target.value })
          }
        />
      </label>
      <div className="grid gap-3 md:grid-cols-4">
        <FilterSelect
          label="专业"
          options={[
            ["marketing", "营销"],
            ["logistics", "物流"],
            ["monopoly", "专卖"],
          ]}
          value={formValues.profession}
          onChange={(value) =>
            setFormValues({
              ...formValues,
              profession: value as Profession,
            })
          }
        />
        <label className="grid gap-2 text-sm font-medium">
          <span className="text-text-secondary">等级</span>
          <Input
            aria-label="等级"
            min={1}
            type="number"
            value={formValues.level}
            onChange={(event) =>
              setFormValues({ ...formValues, level: event.target.value })
            }
          />
        </label>
        <FilterSelect
          label="科目"
          options={[
            ["theory", "理论"],
            ["skill", "技能"],
          ]}
          value={formValues.subject}
          onChange={(value) =>
            setFormValues({
              ...formValues,
              subject: value as Subject,
            })
          }
        />
        <FilterSelect
          label="类型"
          options={[
            ["mock_paper", "模拟卷"],
            ["past_paper", "历年真题"],
          ]}
          value={formValues.paperType}
          onChange={(value) =>
            setFormValues({
              ...formValues,
              paperType: value as PaperType,
            })
          }
        />
      </div>
      <div className="grid gap-3 md:grid-cols-4">
        <label className="grid gap-2 text-sm font-medium">
          <span className="text-text-secondary">年份</span>
          <Input
            aria-label="年份"
            type="number"
            value={formValues.year}
            onChange={(event) =>
              setFormValues({ ...formValues, year: event.target.value })
            }
          />
        </label>
        <label className="grid gap-2 text-sm font-medium">
          <span className="text-text-secondary">考试时长</span>
          <Input
            aria-label="考试时长"
            max={300}
            min={10}
            type="number"
            value={formValues.durationMinute}
            onChange={(event) =>
              setFormValues({
                ...formValues,
                durationMinute: event.target.value,
              })
            }
          />
        </label>
        <label className="grid gap-2 text-sm font-medium">
          <span className="text-text-secondary">总分</span>
          <Input
            aria-label="总分"
            value={formValues.totalScore}
            onChange={(event) =>
              setFormValues({ ...formValues, totalScore: event.target.value })
            }
          />
        </label>
        <label className="grid gap-2 text-sm font-medium">
          <span className="text-text-secondary">来源说明</span>
          <Input
            aria-label="来源说明"
            value={formValues.source}
            onChange={(event) =>
              setFormValues({ ...formValues, source: event.target.value })
            }
          />
        </label>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button disabled={isSubmitting} type="submit">
          保存草稿
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          取消
        </Button>
      </div>
    </form>
  );
}

function PaperQuestionWriteForm({
  isSubmitting,
  values,
  onCancel,
  onSubmit,
}: {
  isSubmitting: boolean;
  values: PaperQuestionFormValues;
  onCancel: () => void;
  onSubmit: (values: PaperQuestionFormValues) => void;
}) {
  const [formValues, setFormValues] = useState(values);

  return (
    <form
      aria-label="组卷表单"
      className="bg-surface border-border grid gap-4 rounded-md border p-4 shadow-sm"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit(formValues);
      }}
    >
      <h2 className="text-text-primary text-base font-semibold">组卷</h2>
      <label className="grid gap-2 text-sm font-medium">
        <span className="text-text-secondary">题目 publicId</span>
        <Input
          aria-label="题目 publicId"
          value={formValues.questionPublicId}
          onChange={(event) =>
            setFormValues({
              ...formValues,
              questionPublicId: event.target.value,
            })
          }
        />
      </label>
      <div className="grid gap-3 md:grid-cols-3">
        <label className="grid gap-2 text-sm font-medium">
          <span className="text-text-secondary">题目分值</span>
          <Input
            aria-label="题目分值"
            value={formValues.score}
            onChange={(event) =>
              setFormValues({ ...formValues, score: event.target.value })
            }
          />
        </label>
        <label className="grid gap-2 text-sm font-medium">
          <span className="text-text-secondary">题目顺序</span>
          <Input
            aria-label="题目顺序"
            min={1}
            type="number"
            value={formValues.sortOrder}
            onChange={(event) =>
              setFormValues({ ...formValues, sortOrder: event.target.value })
            }
          />
        </label>
        <label className="grid gap-2 text-sm font-medium">
          <span className="text-text-secondary">大题顺序</span>
          <Input
            aria-label="大题顺序"
            min={1}
            type="number"
            value={formValues.paperSectionSortOrder}
            onChange={(event) =>
              setFormValues({
                ...formValues,
                paperSectionSortOrder: event.target.value,
              })
            }
          />
        </label>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        <label className="grid gap-2 text-sm font-medium">
          <span className="text-text-secondary">大题名称</span>
          <Input
            aria-label="大题名称"
            value={formValues.paperSectionTitle}
            onChange={(event) =>
              setFormValues({
                ...formValues,
                paperSectionTitle: event.target.value,
              })
            }
          />
        </label>
        <label className="grid gap-2 text-sm font-medium">
          <span className="text-text-secondary">大题说明</span>
          <Input
            aria-label="大题说明"
            value={formValues.paperSectionDescription}
            onChange={(event) =>
              setFormValues({
                ...formValues,
                paperSectionDescription: event.target.value,
              })
            }
          />
        </label>
      </div>
      <div className="grid gap-3 md:grid-cols-3">
        <label className="grid gap-2 text-sm font-medium">
          <span className="text-text-secondary">材料 publicId</span>
          <Input
            aria-label="材料 publicId"
            value={formValues.materialPublicId}
            onChange={(event) =>
              setFormValues({
                ...formValues,
                materialPublicId: event.target.value,
              })
            }
          />
        </label>
        <label className="grid gap-2 text-sm font-medium">
          <span className="text-text-secondary">题组名称</span>
          <Input
            aria-label="题组名称"
            value={formValues.questionGroupTitle}
            onChange={(event) =>
              setFormValues({
                ...formValues,
                questionGroupTitle: event.target.value,
              })
            }
          />
        </label>
        <label className="grid gap-2 text-sm font-medium">
          <span className="text-text-secondary">题组顺序</span>
          <Input
            aria-label="题组顺序"
            min={1}
            type="number"
            value={formValues.questionGroupSortOrder}
            onChange={(event) =>
              setFormValues({
                ...formValues,
                questionGroupSortOrder: event.target.value,
              })
            }
          />
        </label>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button disabled={isSubmitting} type="submit">
          加入试卷
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          取消
        </Button>
      </div>
    </form>
  );
}

function PaperAssetWriteForm({
  isSubmitting,
  values,
  onCancel,
  onSubmit,
}: {
  isSubmitting: boolean;
  values: PaperAssetFormValues;
  onCancel: () => void;
  onSubmit: (values: PaperAssetFormValues) => void;
}) {
  const [formValues, setFormValues] = useState(values);

  return (
    <form
      aria-label="附件表单"
      className="bg-surface border-border grid gap-4 rounded-md border p-4 shadow-sm"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit(formValues);
      }}
    >
      <h2 className="text-text-primary text-base font-semibold">
        登记原始文件 metadata
      </h2>
      <p className="text-text-secondary text-sm">
        本地会把文件写入 ignored runtime 目录；不会创建 COS、OCR 或公开 URL。
      </p>
      <label className="grid gap-2 text-sm font-medium">
        <span className="text-text-secondary">本地文件</span>
        <Input
          aria-label="本地文件"
          accept=".txt,.md,.pdf,application/pdf,text/plain,text/markdown"
          type="file"
          onChange={(event) =>
            setFormValues({
              ...formValues,
              file: event.target.files?.[0] ?? null,
            })
          }
        />
      </label>
      <div className="flex flex-wrap gap-2">
        <Button disabled={isSubmitting} type="submit">
          保存附件
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          取消
        </Button>
      </div>
    </form>
  );
}

function FilterPanel({
  keyword,
  levelFilter,
  paperStatus,
  paperType,
  profession,
  subject,
  yearFilter,
  onKeywordChange,
  onLevelFilterChange,
  onPaperStatusChange,
  onPaperTypeChange,
  onProfessionChange,
  onSubjectChange,
  onYearFilterChange,
}: {
  keyword: string;
  levelFilter: string;
  paperStatus: PaperStatusFilter;
  paperType: PaperTypeFilter;
  profession: ProfessionFilter;
  subject: SubjectFilter;
  yearFilter: string;
  onKeywordChange: (value: string) => void;
  onLevelFilterChange: (value: string) => void;
  onPaperStatusChange: (value: PaperStatusFilter) => void;
  onPaperTypeChange: (value: PaperTypeFilter) => void;
  onProfessionChange: (value: ProfessionFilter) => void;
  onSubjectChange: (value: SubjectFilter) => void;
  onYearFilterChange: (value: string) => void;
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
        <label className="flex w-full flex-col gap-2 text-sm font-medium xl:w-28">
          <span className="text-text-secondary">等级</span>
          <Input
            aria-label="等级筛选"
            placeholder="全部等级"
            value={levelFilter}
            onChange={(event) => onLevelFilterChange(event.target.value)}
          />
        </label>
        <label className="flex w-full flex-col gap-2 text-sm font-medium xl:w-28">
          <span className="text-text-secondary">年份</span>
          <Input
            aria-label="年份筛选"
            placeholder="全部年份"
            value={yearFilter}
            onChange={(event) => onYearFilterChange(event.target.value)}
          />
        </label>
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

function PaperList({
  rows,
  onArchive,
  onBindAsset,
  onCompose,
  onCopy,
  onPublish,
}: {
  rows: AdminPaperOpsSummaryDto[];
  onArchive: (publicId: string) => void;
  onBindAsset: (publicId: string) => void;
  onCompose: (publicId: string) => void;
  onCopy: (publicId: string) => void;
  onPublish: (publicId: string) => void;
}) {
  return (
    <div className="grid gap-3">
      {rows.map((paper) => {
        const isDraft = paper.paperStatus === "draft";
        const isPublished = paper.paperStatus === "published";
        const canCopy = paper.paperStatus !== "draft";

        return (
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
                    <span className="text-text-muted text-xs">
                      {paper.year}
                    </span>
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
            <div className="mt-4 flex flex-wrap gap-2">
              <Button
                aria-label={`组卷 ${paper.publicId}`}
                disabled={!isDraft}
                size="sm"
                type="button"
                variant="outline"
                onClick={() => onCompose(paper.publicId)}
              >
                <Layers3 aria-hidden="true" data-icon="inline-start" />
                组卷
              </Button>
              <Button
                aria-label={`发布 ${paper.publicId}`}
                disabled={!isDraft}
                size="sm"
                type="button"
                variant="outline"
                onClick={() => onPublish(paper.publicId)}
              >
                <FileCheck aria-hidden="true" data-icon="inline-start" />
                发布
              </Button>
              <Button
                aria-label={`下架 ${paper.publicId}`}
                disabled={!isPublished}
                size="sm"
                type="button"
                variant="destructive"
                onClick={() => onArchive(paper.publicId)}
              >
                <Archive aria-hidden="true" data-icon="inline-start" />
                下架
              </Button>
              <Button
                aria-label={`复制 ${paper.publicId}`}
                disabled={!canCopy}
                size="sm"
                type="button"
                variant="secondary"
                onClick={() => onCopy(paper.publicId)}
              >
                <Copy aria-hidden="true" data-icon="inline-start" />
                复制
              </Button>
              <Button
                aria-label={`绑定原始文件 ${paper.publicId}`}
                size="sm"
                type="button"
                variant="secondary"
                onClick={() => onBindAsset(paper.publicId)}
              >
                <Upload aria-hidden="true" data-icon="inline-start" />
                绑定原始文件
              </Button>
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
        );
      })}
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
