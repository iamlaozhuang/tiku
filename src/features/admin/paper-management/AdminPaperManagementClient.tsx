"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  Archive,
  ArrowDownUp,
  ClipboardList,
  Copy,
  Eye,
  FileCheck,
  FilePlus2,
  Layers3,
  Search,
  Upload,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  AdminListToolbar,
  AdminPagination,
  AdminTableFrame,
} from "@/components/admin/AdminList";
import {
  AdminToast,
  type AdminFeedback,
} from "@/components/admin/AdminToast/AdminToast";
import { useAdminListInteraction } from "@/hooks/useAdminListInteraction";
import type { ApiPagination } from "@/server/contracts/api-response";
import type {
  AdminPaperOpsSummaryDto,
  AdminPaperQuestionTypeDistributionDto,
} from "@/server/contracts/admin-content-knowledge-ops-contract";
import type { AuthContextDto } from "@/server/contracts/auth-contract";
import type { PaperAssetDto } from "@/server/contracts/paper-asset-contract";
import type {
  PaperCopyResultDto,
  PaperDraftDto,
  PaperPublishResultDto,
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
  FilterSelect,
  fetchAdminApi,
  formatScope,
  getStoredSessionToken,
  isAdminContext,
  isUnauthorizedResponse,
} from "../content-admin-runtime";

type PaperStatusFilter = "all" | PaperStatus;
type PaperTypeFilter = "all" | PaperType;
type ProfessionFilter = "all" | Profession;
type SubjectFilter = "all" | Subject;
type AdminCommonSortOrder = "asc" | "desc";
type PaperLoadState = "loading" | "ready" | "unauthorized" | "error";
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
      kind: "paperAsset";
      values: PaperAssetFormValues;
    };

type PendingPaperAction =
  | {
      kind: "publish";
      paperName: string;
      publicId: string;
    }
  | {
      kind: "archive";
      paperName: string;
      publicId: string;
    };

type PaperListDto = {
  papers: AdminPaperOpsSummaryDto[];
};

export type AdminPaperManagementProps = {
  initialPaperPublicId?: string;
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

const questionTypeLabels: Record<
  AdminPaperQuestionTypeDistributionDto["questionType"],
  string
> = {
  case_analysis: "案例分析题",
  calculation: "计算题",
  fill_blank: "填空题",
  multi_choice: "多选题",
  short_answer: "简答题",
  single_choice: "单选题",
  true_false: "判断题",
};

const PUBLISHED_PAPER_MIN_QUESTION_COUNT = 1;
const PAPER_QUESTION_COUNT_LIMIT = 100;

function readPaperListUrlQuery(): {
  keyword: string;
  level: string;
  year: string;
  profession: ProfessionFilter;
  subject: SubjectFilter;
  status: PaperStatusFilter;
  paperType: PaperTypeFilter;
  list: {
    page: number;
    pageSize: 20 | 50 | 100;
    sortBy: "updatedAt";
    sortOrder: AdminCommonSortOrder;
  };
} {
  const searchParams = new URLSearchParams(
    typeof window === "undefined" ? "" : window.location.search,
  );
  const page = Number(searchParams.get("page"));
  const pageSize = Number(searchParams.get("pageSize"));
  const profession = searchParams.get("profession");
  const subject = searchParams.get("subject");
  const status = searchParams.get("status");
  const paperType = searchParams.get("paperType");

  return {
    keyword: searchParams.get("keyword") ?? "",
    level: searchParams.get("level") ?? "",
    year: searchParams.get("year") ?? "",
    profession: (["marketing", "logistics", "monopoly"] as const).includes(
      profession as Profession,
    )
      ? (profession as Profession)
      : "all",
    subject: (["theory", "skill"] as const).includes(subject as Subject)
      ? (subject as Subject)
      : "all",
    status: (["draft", "published", "archived"] as const).includes(
      status as PaperStatus,
    )
      ? (status as PaperStatus)
      : "all",
    paperType: (["mock_paper", "past_paper"] as const).includes(
      paperType as PaperType,
    )
      ? (paperType as PaperType)
      : "all",
    list: {
      page: Number.isInteger(page) && page > 0 ? page : 1,
      pageSize: pageSize === 50 || pageSize === 100 ? pageSize : 20,
      sortBy: "updatedAt",
      sortOrder: searchParams.get("sortOrder") === "asc" ? "asc" : "desc",
    } as const,
  };
}

const defaultPaperPagination: ApiPagination = {
  page: 1,
  pageSize: 20,
  total: 0,
  sortBy: "updatedAt",
  sortOrder: "desc",
};

function usePaperData(queryString: string) {
  const [loadState, setLoadState] = useState<PaperLoadState>("loading");
  const [papers, setPapers] = useState<AdminPaperOpsSummaryDto[]>([]);
  const [pagination, setPagination] = useState(defaultPaperPagination);

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
          `/api/v1/papers?${queryString}`,
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
        setPagination(paperResponse.pagination ?? defaultPaperPagination);
        setLoadState("ready");
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
  }, [queryString]);

  return { loadState, pagination, papers, setPapers };
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

function createQuestionTypeDistributionFromPaperDraft(
  paper: PaperDraftDto,
): AdminPaperQuestionTypeDistributionDto[] {
  const distribution = new Map<
    AdminPaperQuestionTypeDistributionDto["questionType"],
    number
  >();

  for (const paperSection of paper.paperSections) {
    for (const paperQuestion of paperSection.paperQuestions) {
      const questionType = paperQuestion.questionSnapshot.questionType;
      distribution.set(questionType, (distribution.get(questionType) ?? 0) + 1);
    }
  }

  return Object.keys(questionTypeLabels).flatMap((questionType) => {
    const count = distribution.get(
      questionType as AdminPaperQuestionTypeDistributionDto["questionType"],
    );

    return count === undefined
      ? []
      : [
          {
            questionType:
              questionType as AdminPaperQuestionTypeDistributionDto["questionType"],
            count,
          },
        ];
  });
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
    questionTypeDistribution:
      "questionTypeDistribution" in paper && paper.questionTypeDistribution
        ? paper.questionTypeDistribution
        : "paperSections" in paper && Array.isArray(paper.paperSections)
          ? createQuestionTypeDistributionFromPaperDraft(paper)
          : (existingPaper?.questionTypeDistribution ?? []),
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

function countDisabledSourceQuestions(paper: PaperDraftDto): number {
  return paper.paperSections.reduce(
    (disabledQuestionCount, paperSection) =>
      disabledQuestionCount +
      paperSection.paperQuestions.filter(
        (paperQuestion) =>
          paperQuestion.questionSnapshot.questionStatus === "disabled",
      ).length,
    0,
  );
}

function createPaperLifecycleSummary(paper: AdminPaperOpsSummaryDto): string {
  if (paper.paperStatus === "published") {
    return "已发布；可下架终止未完成作答；可复制为新草稿";
  }

  if (paper.paperStatus === "archived") {
    return "已下架；历史记录保留；可复制为新草稿";
  }

  const validationSummary = paper.publishValidationSummary;

  if (validationSummary !== null && validationSummary.trim().length > 0) {
    return `草稿可继续组卷；发布前需处理：${validationSummary}`;
  }

  return "草稿可继续组卷；发布前需完成发布校验";
}

function createPaperQuestionCountFeedback(paper: AdminPaperOpsSummaryDto): {
  feedback: string;
  value: string;
} {
  const remainingQuestionCount = Math.max(
    0,
    PAPER_QUESTION_COUNT_LIMIT - paper.questionCount,
  );
  const value = `${paper.questionCount}/${PAPER_QUESTION_COUNT_LIMIT}`;

  if (paper.questionCount < PUBLISHED_PAPER_MIN_QUESTION_COUNT) {
    return {
      value,
      feedback: `发布风险：发布前至少需要 ${PUBLISHED_PAPER_MIN_QUESTION_COUNT} 题；还可加入 ${remainingQuestionCount} 题`,
    };
  }

  if (paper.questionCount > PAPER_QUESTION_COUNT_LIMIT) {
    return {
      value,
      feedback: `发布风险：已超过 ${PAPER_QUESTION_COUNT_LIMIT} 题上限 ${
        paper.questionCount - PAPER_QUESTION_COUNT_LIMIT
      } 题`,
    };
  }

  if (paper.questionCount === PAPER_QUESTION_COUNT_LIMIT) {
    return {
      value,
      feedback: `已达到 ${PAPER_QUESTION_COUNT_LIMIT} 题上限；发布前请复核性能风险`,
    };
  }

  return {
    value,
    feedback: `题量有效；还可加入 ${remainingQuestionCount} 题`,
  };
}

function createPaperQuestionTypeDistributionFeedback(
  paper: AdminPaperOpsSummaryDto,
): string {
  const distribution = (paper.questionTypeDistribution ?? []).filter(
    (item) => item.count > 0,
  );

  if (distribution.length === 0) {
    return "暂无题型分布数据；题型建议：发布前请在组卷详情复核题型覆盖，此建议不阻断发布。";
  }

  const summary = distribution
    .map((item) => `${questionTypeLabels[item.questionType]} ${item.count} 题`)
    .join(" / ");

  if (distribution.length === 1) {
    return `${summary}；题型建议：当前只有 1 类题型；可补充多选、判断、填空或简答，发布不受此建议阻断。`;
  }

  return `${summary}；题型建议：已覆盖 ${distribution.length} 类题型；发布仍以题量和分值校验为准。`;
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

export function AdminPaperManagement({
  initialPaperPublicId = "",
}: AdminPaperManagementProps) {
  const router = useRouter();
  const [initialUrlQuery] = useState(() => readPaperListUrlQuery());
  const [keyword, setKeyword] = useState(
    initialPaperPublicId || initialUrlQuery.keyword,
  );
  const [levelFilter, setLevelFilter] = useState(initialUrlQuery.level);
  const [yearFilter, setYearFilter] = useState(initialUrlQuery.year);
  const [profession, setProfession] = useState<ProfessionFilter>(
    initialUrlQuery.profession,
  );
  const [subject, setSubject] = useState<SubjectFilter>(
    initialUrlQuery.subject,
  );
  const [paperStatus, setPaperStatus] = useState<PaperStatusFilter>(
    initialUrlQuery.status,
  );
  const [paperType, setPaperType] = useState<PaperTypeFilter>(
    initialUrlQuery.paperType,
  );
  const [activeForm, setActiveForm] = useState<ActivePaperForm | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const {
    handleFilterChange,
    handlePageChange,
    handlePageSizeChange,
    handleReset,
    handleSortChange,
    query,
  } = useAdminListInteraction({
    initialQuery: initialUrlQuery.list,
    resetQuery: {},
  });
  const [pendingPaperAction, setPendingPaperAction] =
    useState<PendingPaperAction | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const paperQueryString = useMemo(() => {
    const searchParams = new URLSearchParams({
      page: String(query.page),
      pageSize: String(query.pageSize),
      sortBy: query.sortBy,
      sortOrder: query.sortOrder,
    });

    if (keyword.trim() !== "") searchParams.set("keyword", keyword.trim());
    if (profession !== "all") searchParams.set("profession", profession);
    if (subject !== "all") searchParams.set("subject", subject);
    if (levelFilter.trim() !== "")
      searchParams.set("level", levelFilter.trim());
    if (yearFilter.trim() !== "") searchParams.set("year", yearFilter.trim());
    if (paperStatus !== "all") searchParams.set("status", paperStatus);
    if (paperType !== "all") searchParams.set("paperType", paperType);

    return searchParams.toString();
  }, [
    keyword,
    levelFilter,
    paperStatus,
    paperType,
    profession,
    query.page,
    query.pageSize,
    query.sortBy,
    query.sortOrder,
    subject,
    yearFilter,
  ]);
  const { loadState, pagination, papers, setPapers } =
    usePaperData(paperQueryString);

  useEffect(() => {
    window.history.replaceState(
      null,
      "",
      `${window.location.pathname}?${paperQueryString}`,
    );
  }, [paperQueryString]);

  const initialPaperTarget = useMemo(() => {
    if (initialPaperPublicId.length === 0 || loadState !== "ready") {
      return null;
    }

    return (
      papers.find((paper) => paper.publicId === initialPaperPublicId) ?? null
    );
  }, [initialPaperPublicId, loadState, papers]);
  const initialPaperTargetMessage =
    initialPaperTarget === null
      ? null
      : `已定位待审试卷草稿 ${initialPaperTarget.name}`;
  const initialPaperTargetError =
    initialPaperPublicId.length > 0 &&
    loadState === "ready" &&
    initialPaperTarget === null
      ? "未找到指定的待审试卷草稿"
      : null;
  const actionFeedback: AdminFeedback | null =
    actionError !== null
      ? {
          message: actionError,
          title: "试卷操作失败",
          tone: "error",
        }
      : actionMessage !== null
        ? {
            message: actionMessage,
            title: "试卷操作成功",
            tone: "success",
          }
        : null;
  const displayedInitialTargetMessage =
    actionFeedback === null ? initialPaperTargetMessage : null;
  const displayedInitialTargetError =
    actionFeedback === null ? initialPaperTargetError : null;
  const selectedPaperPublicId = initialPaperTarget?.publicId ?? null;
  const hasActivePaperFilters =
    keyword.trim() !== "" ||
    levelFilter.trim() !== "" ||
    yearFilter.trim() !== "" ||
    profession !== "all" ||
    subject !== "all" ||
    paperStatus !== "all" ||
    paperType !== "all";

  const displayedPapers = papers;

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
      setActionMessage("草稿已保存，正在进入组卷工作台。");
      setActiveForm(null);
      router.push(`/content/papers/${savedPaper.publicId}/compose`);
    } catch {
      setActionError("试卷保存失败，请刷新后重试。");
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
      setActionMessage(`附件“${paperAsset.fileName}”元数据已登记`);
      setActiveForm(null);
    } catch {
      setActionError("附件绑定失败，请刷新后重试。");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handlePublishPaper(publicId: string, paperName: string) {
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
    setActionMessage(`试卷“${paperName}”已发布`);
  }

  async function handleArchivePaper(publicId: string, paperName: string) {
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
    setActionMessage(`试卷“${paperName}”已下架`);
  }

  async function handleCopyPaper(publicId: string, paperName: string) {
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

    const disabledSourceQuestionCount = countDisabledSourceQuestions(
      response.data.paper,
    );
    const copiedPaper = mapPaperDraftToSummary(response.data.paper);
    setPapers((currentPapers) => upsertByPublicId(currentPapers, copiedPaper));
    if (disabledSourceQuestionCount > 0) {
      setActionMessage(
        `试卷“${paperName}”已复制；包含已停用源题 ${disabledSourceQuestionCount} 道，请复核后再发布`,
      );
      return;
    }

    setActionMessage(`试卷“${paperName}”已复制`);
  }

  async function handleConfirmPendingPaperAction() {
    if (pendingPaperAction === null) {
      return;
    }

    const currentAction = pendingPaperAction;
    setPendingPaperAction(null);

    if (currentAction.kind === "publish") {
      await handlePublishPaper(currentAction.publicId, currentAction.paperName);
      return;
    }

    await handleArchivePaper(currentAction.publicId, currentAction.paperName);
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
            按专业、等级和生命周期维护试卷草稿，完成发布校验、下架与复制。
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

      <PaperLifecycleContextBand papers={papers} />

      <FilterPanel
        keyword={keyword}
        levelFilter={levelFilter}
        pageSize={query.pageSize}
        paperStatus={paperStatus}
        paperType={paperType}
        profession={profession}
        sortOrder={query.sortOrder}
        subject={subject}
        total={pagination.total}
        yearFilter={yearFilter}
        onKeywordChange={(value) => {
          setKeyword(value);
          handleFilterChange("keyword");
        }}
        onLevelFilterChange={(value) => {
          setLevelFilter(value);
          handleFilterChange("level");
        }}
        onPageSizeChange={handlePageSizeChange}
        onPaperStatusChange={(value) => {
          setPaperStatus(value);
          handleFilterChange("status");
        }}
        onPaperTypeChange={(value) => {
          setPaperType(value);
          handleFilterChange("paperType");
        }}
        onProfessionChange={(value) => {
          setProfession(value);
          handleFilterChange("profession");
        }}
        onReset={() => {
          setKeyword(initialPaperPublicId);
          setLevelFilter("");
          setYearFilter("");
          setProfession("all");
          setSubject("all");
          setPaperStatus("all");
          setPaperType("all");
          handleReset();
        }}
        onSort={() => handleSortChange("updatedAt")}
        onSubjectChange={(value) => {
          setSubject(value);
          handleFilterChange("subject");
        }}
        onYearFilterChange={(value) => {
          setYearFilter(value);
          handleFilterChange("year");
        }}
      />

      <SummaryRail rows={displayedPapers} />

      {displayedInitialTargetMessage === null ? null : (
        <p className="text-brand-primary text-sm" role="status">
          {displayedInitialTargetMessage}
        </p>
      )}
      {displayedInitialTargetError === null ? null : (
        <p className="text-destructive text-sm" role="alert">
          {displayedInitialTargetError}
        </p>
      )}

      {actionFeedback === null ? null : (
        <AdminToast
          feedback={actionFeedback}
          onDismiss={() => {
            setActionError(null);
            setActionMessage(null);
          }}
        />
      )}

      {activeForm?.kind === "paper" ? (
        <PaperWriteForm
          isSubmitting={isSubmitting}
          values={activeForm.values}
          onCancel={() => setActiveForm(null)}
          onSubmit={handleSavePaper}
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

      <PaperList
        emptyTitle={hasActivePaperFilters ? "没有匹配的试卷" : "暂无试卷"}
        rows={displayedPapers}
        selectedPublicId={selectedPaperPublicId}
        onArchive={(paper) =>
          setPendingPaperAction({
            kind: "archive",
            paperName: paper.name,
            publicId: paper.publicId,
          })
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
        onCopy={(paper) => void handleCopyPaper(paper.publicId, paper.name)}
        onPublish={(paper) =>
          setPendingPaperAction({
            kind: "publish",
            paperName: paper.name,
            publicId: paper.publicId,
          })
        }
      />

      <AdminPagination
        itemLabel="套试卷"
        page={query.page}
        pageSize={query.pageSize}
        total={pagination.total}
        onPageChange={handlePageChange}
      />

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

function PaperLifecycleContextBand({
  papers,
}: {
  papers: AdminPaperOpsSummaryDto[];
}) {
  const draftCount = papers.filter(
    (paper) => paper.paperStatus === "draft",
  ).length;
  const publishedCount = papers.filter(
    (paper) => paper.paperStatus === "published",
  ).length;
  const archivedCount = papers.filter(
    (paper) => paper.paperStatus === "archived",
  ).length;
  const publishValidationPendingCount = papers.filter(
    (paper) =>
      paper.paperStatus === "draft" &&
      (paper.publishValidationSummary === null ||
        paper.publishValidationSummary !== "发布校验已通过"),
  ).length;

  return (
    <section
      className="border-border bg-surface rounded-md border p-4 shadow-sm"
      data-testid="paper-lifecycle-context-band"
    >
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-1">
          <p className="text-brand-primary text-xs font-medium">内容生命周期</p>
          <h2 className="text-text-primary text-base font-semibold">
            正式试卷草稿与发布校验
          </h2>
          <p className="text-text-secondary text-sm leading-6">
            AI
            草稿采用需先进入待审试卷草稿；本页只处理正式试卷草稿、发布校验、下架和复制闭环。
          </p>
        </div>
        <dl className="grid gap-2 text-xs sm:grid-cols-2 lg:grid-cols-4">
          <LifecycleMetric label="本页草稿" value={draftCount} />
          <LifecycleMetric label="本页已发布" value={publishedCount} />
          <LifecycleMetric label="本页已下架" value={archivedCount} />
          <LifecycleMetric
            label="本页发布校验待处理"
            value={publishValidationPendingCount}
          />
        </dl>
      </div>
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
          将{isArchive ? "下架" : "发布"}试卷“{action.paperName}”。
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
      </div>
      <p
        className="text-text-secondary text-xs leading-5"
        data-testid="paper-action-unavailable"
        id="paper-action-unavailable"
        role="status"
      >
        保存草稿后会进入组卷工作台；发布、下架、复制和原始文件按试卷状态提供。
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
        登记原始文件元数据
      </h2>
      <p className="text-text-secondary text-sm">
        本地会把文件写入忽略目录；不会创建对象存储、公网识别或公开链接。
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
  pageSize,
  paperStatus,
  paperType,
  profession,
  sortOrder,
  subject,
  total,
  yearFilter,
  onKeywordChange,
  onLevelFilterChange,
  onPageSizeChange,
  onPaperStatusChange,
  onPaperTypeChange,
  onProfessionChange,
  onReset,
  onSort,
  onSubjectChange,
  onYearFilterChange,
}: {
  keyword: string;
  levelFilter: string;
  pageSize: number;
  paperStatus: PaperStatusFilter;
  paperType: PaperTypeFilter;
  profession: ProfessionFilter;
  sortOrder: AdminCommonSortOrder;
  subject: SubjectFilter;
  total: number;
  yearFilter: string;
  onKeywordChange: (value: string) => void;
  onLevelFilterChange: (value: string) => void;
  onPageSizeChange: (value: string) => void;
  onPaperStatusChange: (value: PaperStatusFilter) => void;
  onPaperTypeChange: (value: PaperTypeFilter) => void;
  onProfessionChange: (value: ProfessionFilter) => void;
  onReset: () => void;
  onSort: () => void;
  onSubjectChange: (value: SubjectFilter) => void;
  onYearFilterChange: (value: string) => void;
}) {
  return (
    <AdminListToolbar
      description="按试卷范围和生命周期缩小结果；筛选变化后从第一页重新查询。"
      resultLabel={`共 ${total} 套试卷`}
      title="试卷筛选"
    >
      <label className="flex flex-1 flex-col gap-2 text-sm font-medium">
        <span className="text-text-secondary">关键词</span>
        <span className="relative">
          <Search
            aria-hidden="true"
            className="text-text-muted pointer-events-none absolute top-1/2 left-2 size-4 -translate-y-1/2"
          />
          <Input
            aria-label="关键词"
            className="h-9 pl-8"
            placeholder="试卷名称、校验结果或文件名"
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
          className="h-9"
          placeholder="全部等级"
          value={levelFilter}
          onChange={(event) => onLevelFilterChange(event.target.value)}
        />
      </label>
      <label className="flex w-full flex-col gap-2 text-sm font-medium xl:w-28">
        <span className="text-text-secondary">年份</span>
        <Input
          aria-label="年份筛选"
          className="h-9"
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
      <Button
        aria-label="更新时间排序"
        type="button"
        variant="outline"
        onClick={onSort}
      >
        <ArrowDownUp aria-hidden="true" data-icon="inline-start" />
        更新时间排序
        <span className="sr-only">
          当前{sortOrder === "desc" ? "降序" : "升序"}
        </span>
      </Button>
      <FilterSelect
        label="每页条数"
        options={[
          ["20", "20"],
          ["50", "50"],
          ["100", "100"],
        ]}
        value={String(pageSize)}
        onChange={onPageSizeChange}
      />
      <Button type="button" variant="outline" onClick={onReset}>
        重置筛选
      </Button>
    </AdminListToolbar>
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
      <SummaryItem label="本页结果" value={`${rows.length} 套`} />
      <SummaryItem label="本页题目合计" value={`${totalQuestionCount} 题`} />
      <SummaryItem
        label="本页发布 / 模拟记录"
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

function LifecycleMetric({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-muted/40 border-border rounded-md border px-3 py-2">
      <dt className="text-text-secondary">{label}</dt>
      <dd className="text-text-primary mt-1 font-semibold">
        {label} {value}
      </dd>
    </div>
  );
}

function PaperList({
  emptyTitle,
  rows,
  selectedPublicId,
  onArchive,
  onBindAsset,
  onCopy,
  onPublish,
}: {
  emptyTitle: string;
  rows: AdminPaperOpsSummaryDto[];
  selectedPublicId: string | null;
  onArchive: (paper: AdminPaperOpsSummaryDto) => void;
  onBindAsset: (publicId: string) => void;
  onCopy: (paper: AdminPaperOpsSummaryDto) => void;
  onPublish: (paper: AdminPaperOpsSummaryDto) => void;
}) {
  return (
    <AdminTableFrame ariaLabel="试卷列表" minWidthClassName="min-w-[72rem]">
      <div
        aria-label="试卷列表"
        className="divide-border divide-y"
        role="table"
      >
        {rows.length === 0 ? <FilteredEmptyState title={emptyTitle} /> : null}
        {rows.map((paper) => {
          const isDraft = paper.paperStatus === "draft";
          const isPublished = paper.paperStatus === "published";
          const canCopy = paper.paperStatus !== "draft";
          const isSelected = paper.publicId === selectedPublicId;
          const questionCountFeedback = createPaperQuestionCountFeedback(paper);
          const questionTypeDistributionFeedback =
            createPaperQuestionTypeDistributionFeedback(paper);

          return (
            <article
              className={
                isSelected
                  ? "bg-surface border-brand-primary rounded-md border p-4 shadow-sm"
                  : "bg-surface border-border rounded-md border p-4 shadow-sm"
              }
              data-public-id={paper.publicId}
              data-selected={isSelected ? "true" : undefined}
              data-testid={`paper-row-${paper.publicId}`}
              key={paper.publicId}
              role="row"
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
                    <MetricBadge
                      label="题量"
                      value={questionCountFeedback.value}
                    />
                    <MetricBadge
                      label="模拟记录"
                      value={`${paper.mockExamCount}`}
                    />
                  </div>
                </div>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <Link
                  aria-label={`查看试卷 ${paper.name}`}
                  className="border-border bg-background hover:bg-muted focus-visible:ring-ring/50 inline-flex h-7 items-center gap-1 rounded-md border px-2.5 text-xs font-medium outline-none focus-visible:ring-3"
                  href={`/content/papers/${paper.publicId}`}
                >
                  <Eye aria-hidden="true" className="size-3.5" />
                  查看试卷
                </Link>
                <Link
                  aria-label={`组卷 ${paper.name}`}
                  aria-disabled={!isDraft}
                  className={
                    isDraft
                      ? "border-border bg-background hover:bg-muted focus-visible:ring-ring/50 inline-flex h-7 items-center gap-1 rounded-md border px-2.5 text-xs font-medium outline-none focus-visible:ring-3"
                      : "border-border bg-muted text-text-muted pointer-events-none inline-flex h-7 items-center gap-1 rounded-md border px-2.5 text-xs font-medium opacity-50"
                  }
                  href={
                    isDraft
                      ? `/content/papers/${paper.publicId}/compose`
                      : `/content/papers/${paper.publicId}`
                  }
                  tabIndex={isDraft ? undefined : -1}
                >
                  <Layers3 aria-hidden="true" data-icon="inline-start" />
                  组卷
                </Link>
                <Button
                  aria-label={`发布 ${paper.name}`}
                  disabled={!isDraft}
                  size="sm"
                  type="button"
                  variant="outline"
                  onClick={() => onPublish(paper)}
                >
                  <FileCheck aria-hidden="true" data-icon="inline-start" />
                  发布
                </Button>
                <Button
                  aria-label={`下架 ${paper.name}`}
                  disabled={!isPublished}
                  size="sm"
                  type="button"
                  variant="destructive"
                  onClick={() => onArchive(paper)}
                >
                  <Archive aria-hidden="true" data-icon="inline-start" />
                  下架
                </Button>
                <Button
                  aria-label={`复制 ${paper.name}`}
                  disabled={!canCopy}
                  size="sm"
                  type="button"
                  variant="secondary"
                  onClick={() => onCopy(paper)}
                >
                  <Copy aria-hidden="true" data-icon="inline-start" />
                  复制
                </Button>
                <Button
                  aria-label={`绑定原始文件 ${paper.name}`}
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
                  label="题量发布风险"
                  value={questionCountFeedback.feedback}
                />
                <InfoBlock
                  label="题型分布"
                  value={questionTypeDistributionFeedback}
                />
                <InfoBlock
                  label="发布校验"
                  value={paper.publishValidationSummary ?? "暂无校验结果"}
                />
                <InfoBlock
                  label="生命周期闭环"
                  value={createPaperLifecycleSummary(paper)}
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
    </AdminTableFrame>
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

function FilteredEmptyState({ title = "没有匹配的试卷" }: { title?: string }) {
  return (
    <div className="bg-surface border-border rounded-md border p-8 text-center shadow-sm">
      <ClipboardList
        aria-hidden="true"
        className="text-text-muted mx-auto size-8"
      />
      <p className="text-text-primary mt-4 font-medium">{title}</p>
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
