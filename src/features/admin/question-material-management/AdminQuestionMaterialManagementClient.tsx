"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowDownUp,
  Ban,
  Check,
  Copy,
  Eye,
  FileQuestion,
  FileText,
  Pencil,
  Plus,
  Search,
  ShieldOff,
  Sparkles,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  AdminFilterChips,
  type AdminFilterChip,
} from "@/components/admin/AdminFilterChips";
import { AdminToast, type AdminFeedback } from "@/components/admin/AdminToast";
import {
  AdminFieldError as FieldError,
  AdminFormDisabledReason,
  AdminFormErrorSummary as FormErrorSummary,
} from "@/components/admin/AdminFormFeedback";
import {
  AdminListToolbar,
  AdminPagination,
  AdminTableFrame,
} from "@/components/admin/AdminList";
import { AdminAsyncState } from "@/components/admin/AdminAsyncState";
import { useAdminListDebouncedValue } from "@/hooks/useAdminListDebouncedValue";
import { useAdminEditorListReturnRecovery } from "@/hooks/useAdminEditorNavigationGuard";
import { useAdminListInteraction } from "@/hooks/useAdminListInteraction";
import {
  createAdminEditorHref,
  validateAdminEditorListUrl,
  writeAdminEditorReturnSnapshot,
  type AdminEditorInitiatingControl,
  type AdminEditorResource,
} from "@/lib/admin-editor-navigation";
import {
  createAdminListLatestIntent,
  createAdminListSearchParams,
  parseAdminListUrlQuery,
} from "@/lib/admin-list-query";
import { upsertAdminObjectByPublicId } from "@/lib/admin-object-state";
import {
  focusFirstAdminFormIssue,
  getAdminFormDirtyState,
  readAdminFieldError as readFieldError,
} from "@/lib/admin-form-contract";
import type { ApiPagination } from "@/server/contracts/api-response";
import type { AdminKnowledgeNodeOpsSummaryDto } from "@/server/contracts/admin-content-knowledge-ops-contract";
import type { AuthContextDto } from "@/server/contracts/auth-contract";
import type { MaterialDto } from "@/server/contracts/material-contract";
import type {
  QuestionDto,
  QuestionKnowledgeRecommendationResultDto,
} from "@/server/contracts/question-contract";
import type { TagOptionDto } from "@/server/contracts/tag-contract";
import type {
  MaterialStatus,
  MultiChoiceRule,
  Profession,
  QuestionStatus,
  QuestionType,
  ScoringMethod,
  Subject,
} from "@/server/models/paper";
import {
  getMeaningfulPlainText,
  getMaterialIntegrityIssues,
  getQuestionIntegrityIssues,
  MAX_MATERIAL_RICH_TEXT_LENGTH,
  MAX_QUESTION_RICH_TEXT_LENGTH,
  type ContentIntegrityIssue,
} from "@/lib/content-integrity";
import { getDefaultScoringConfiguration } from "@/lib/question-scoring-contract";

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
import {
  AdminContentDetailDrawer,
  type AdminContentDetailTarget,
} from "./AdminContentDetailDrawer";

type ViewMode = "questions" | "materials";
type StatusFilter = "all" | QuestionStatus | MaterialStatus;
type ProfessionFilter = "all" | Profession;
type SubjectFilter = "all" | Subject;
type QuestionTypeFilter = "all" | QuestionType;
export type QuestionFormMode = "create" | "edit";
export type MaterialFormMode = "create" | "edit";
type RecommendationReviewStatus = "accepted" | "discarded";
type AdminCommonSortOrder = "asc" | "desc";
export type BindingOptionsLoadState = "idle" | "loading" | "ready" | "error";
type QuestionKnowledgeRecommendationDto =
  QuestionKnowledgeRecommendationResultDto["recommendation"];

export type QuestionBindingOptions = {
  knowledgeNodes: Pick<
    AdminKnowledgeNodeOpsSummaryDto,
    "name" | "pathName" | "publicId"
  >[];
  materials: Pick<MaterialDto, "publicId" | "title">[];
  tags: TagOptionDto[];
};

const managedMediaReferences = {
  material: {
    altText: "材料图片",
    paperAssetPublicId: "paper-asset-local-material-image",
  },
  question: {
    altText: "题目图片",
    paperAssetPublicId: "paper-asset-local-question-image",
  },
} as const;

function readContentListUrlQuery(): {
  materialDetailPublicId: string;
  keyword: string;
  knowledgeNodePublicId: string;
  level: string;
  profession: ProfessionFilter;
  questionType: QuestionTypeFilter;
  status: StatusFilter;
  subject: SubjectFilter;
  tagPublicId: string;
  questionDetailPublicId: string;
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
  const profession = searchParams.get("profession");
  const subject = searchParams.get("subject");
  const status = searchParams.get("status");
  const questionType = searchParams.get("questionType");

  return {
    materialDetailPublicId: searchParams.get("materialDetail") ?? "",
    keyword: searchParams.get("keyword") ?? "",
    knowledgeNodePublicId: searchParams.get("knowledgeNodePublicId") ?? "",
    level: searchParams.get("level") ?? "",
    profession: (["marketing", "logistics", "monopoly"] as const).includes(
      profession as Profession,
    )
      ? (profession as Profession)
      : "all",
    questionType: Object.hasOwn(questionTypeLabels, questionType ?? "")
      ? (questionType as QuestionType)
      : "all",
    status: (["available", "disabled"] as const).includes(
      status as QuestionStatus,
    )
      ? (status as QuestionStatus)
      : "all",
    subject: (["theory", "skill"] as const).includes(subject as Subject)
      ? (subject as Subject)
      : "all",
    tagPublicId: searchParams.get("tagPublicId") ?? "",
    questionDetailPublicId: searchParams.get("questionDetail") ?? "",
    list: parseAdminListUrlQuery(searchParams, {
      allowedSortBy: ["updatedAt"],
      defaultSortBy: "updatedAt",
    }),
  };
}

function createEditorEntryHref({
  initiatingControl,
  publicId,
  resource,
}: {
  initiatingControl: AdminEditorInitiatingControl;
  publicId?: string;
  resource: AdminEditorResource;
}) {
  const listRoot = `/content/${resource}`;
  const returnTo =
    validateAdminEditorListUrl(
      resource,
      `${window.location.pathname}${window.location.search}`,
    ) ?? listRoot;
  const scrollY = Number.isFinite(window.scrollY)
    ? Math.max(0, Math.trunc(window.scrollY))
    : 0;
  writeAdminEditorReturnSnapshot(window.sessionStorage, resource, {
    createdAt: Date.now(),
    initiatingControl,
    returnTo,
    scrollY,
  });
  return createAdminEditorHref({ publicId, resource, returnTo });
}

function createManagedPaperAssetImageMarkup({
  altText,
  paperAssetPublicId,
}: {
  altText: string;
  paperAssetPublicId: string;
}) {
  return `<img src="/api/v1/paper-assets/${paperAssetPublicId}" data-paper-asset-boundary="metadata-only" data-paper-asset-public-id="${paperAssetPublicId}" alt="${altText}" />`;
}

type ContentLoadState = "loading" | "ready" | "unauthorized" | "error";

type ContentEditReturnContext = {
  filterLabel: "题目筛选" | "材料筛选";
  scrollY: number;
  trigger: HTMLElement;
};

export type AdminQuestionMaterialManagementProps = {
  defaultView?: ViewMode;
  initialKnowledgeNodeFilter?: string;
  initialQuestionPublicId?: string;
  materialEditorRoutesEnabled?: boolean;
  questionEditorRoutesEnabled?: boolean;
};

export type QuestionFormValues = {
  stemRichText: string;
  analysisRichText: string;
  standardAnswerRichText: string;
  questionType: QuestionType | "";
  profession: Profession | "";
  level: string;
  subject: Subject | "";
  materialPublicId: string;
  multiChoiceRule: MultiChoiceRule;
  scoringMethod: ScoringMethod;
  questionOptions: QuestionOptionFormValue[];
  scoringPoints: ScoringPointFormValue[];
  fillBlankAnswers: FillBlankAnswerFormValue[];
  knowledgeNodePublicIdsText: string;
  tagPublicIdsText: string;
};

type QuestionOptionFormValue = {
  label: string;
  contentRichText: string;
  isCorrect: boolean;
};

type ScoringPointFormValue = {
  description: string;
  score: string;
};

type FillBlankAnswerFormValue = {
  standardAnswersText: string;
  score: string;
};

type QuestionBindingInput = {
  fillBlankAnswers?: QuestionDto["fillBlankAnswers"];
  knowledgeNodePublicIds: string[];
  tagPublicIds: string[];
};

export type MaterialFormValues = {
  title: string;
  contentRichText: string;
  profession: Profession | "";
  level: string;
  subject: Subject | "";
};

type ActiveContentForm =
  | {
      kind: "question";
      mode: QuestionFormMode;
      publicId: string | null;
      values: QuestionFormValues;
    }
  | {
      kind: "material";
      mode: MaterialFormMode;
      publicId: string | null;
      values: MaterialFormValues;
    };

type PendingContentAction =
  | {
      kind: "questionDisable";
      readableName: string;
      publicId: string;
    }
  | {
      kind: "materialDisable";
      readableName: string;
      publicId: string;
    };

type KnowledgeRecommendationReviewState = {
  recommendation: QuestionKnowledgeRecommendationDto;
};

const statusLabels: Record<QuestionStatus | MaterialStatus, string> = {
  available: "可用",
  disabled: "已停用",
};

const recommendationReviewStatusLabels: Record<
  RecommendationReviewStatus | "pending",
  string
> = {
  accepted: "已采纳",
  discarded: "已丢弃",
  pending: "待确认",
};

const recommendationConfirmationStatusLabels: Record<string, string> = {
  confirmed: "已采纳",
  ignored: "已丢弃",
  pending_confirmation: "待确认",
};

const questionTypeLabels: Record<QuestionDto["questionType"], string> = {
  case_analysis: "案例分析题",
  calculation: "计算题",
  fill_blank: "填空题",
  multi_choice: "多选题",
  short_answer: "简答题",
  single_choice: "单选题",
  true_false: "判断题",
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

const multiChoiceRuleLabels: Record<MultiChoiceRule, string> = {
  all_correct_only: "全对得分",
  partial_credit: "部分得分",
};

const scoringMethodLabels: Record<ScoringMethod, string> = {
  ai_scoring: "AI 评分",
  auto_match: "自动匹配",
};

const optionQuestionTypes = new Set<QuestionType>([
  "single_choice",
  "multi_choice",
  "true_false",
]);
const questionOptionLabels = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

function readQuestionSummary(question: QuestionDto): string {
  return stripRichText(question.stemRichText);
}

function createQuestionReadableName(question: QuestionDto): string {
  const summary = readQuestionSummary(question);
  const boundedSummary =
    summary.length > 48 ? `${summary.slice(0, 48)}...` : summary;

  return `${questionTypeLabels[question.questionType]} ${boundedSummary}`;
}

function createMaterialReadableName(material: MaterialDto): string {
  return `${material.title}（${statusLabels[material.status]}）`;
}

function stripRichText(value: string): string {
  return value.replace(/<[^>]*>/g, "").trim();
}

function createDefaultQuestionOptions(
  questionType: QuestionType,
): QuestionOptionFormValue[] {
  if (!optionQuestionTypes.has(questionType)) {
    return [];
  }

  if (questionType === "true_false") {
    return [
      { contentRichText: "正确", isCorrect: true, label: "A" },
      { contentRichText: "错误", isCorrect: false, label: "B" },
    ];
  }

  return ["A", "B"].map((label) => ({
    contentRichText: "",
    isCorrect: false,
    label,
  }));
}

function createDefaultScoringPoints(): ScoringPointFormValue[] {
  return [{ description: "", score: "" }];
}

function createDefaultFillBlankAnswers(): FillBlankAnswerFormValue[] {
  return [{ score: "", standardAnswersText: "" }];
}

export function createDefaultQuestionFormValues(): QuestionFormValues {
  return {
    analysisRichText: "",
    fillBlankAnswers: [],
    knowledgeNodePublicIdsText: "",
    level: "",
    materialPublicId: "",
    multiChoiceRule: "all_correct_only",
    profession: "",
    questionOptions: [],
    questionType: "",
    scoringMethod: "auto_match",
    scoringPoints: [],
    standardAnswerRichText: "",
    stemRichText: "",
    subject: "",
    tagPublicIdsText: "",
  };
}

export function createDefaultMaterialFormValues(): MaterialFormValues {
  return {
    contentRichText: "",
    level: "",
    profession: "",
    subject: "",
    title: "",
  };
}

export function createQuestionFormValuesFromQuestion(
  question: QuestionDto,
): QuestionFormValues {
  const defaultScoringConfiguration = getDefaultScoringConfiguration(
    question.questionType,
  );
  const scoringMethod =
    question.questionType === "fill_blank"
      ? question.scoringMethod
      : defaultScoringConfiguration.scoringMethod;

  return {
    analysisRichText: question.analysisRichText,
    fillBlankAnswers: (question.fillBlankAnswers ?? []).map(
      (fillBlankAnswer) => ({
        score: fillBlankAnswer.score,
        standardAnswersText: fillBlankAnswer.standardAnswers.join(" | "),
      }),
    ),
    knowledgeNodePublicIdsText: formatPublicIdList(
      question.knowledgeNodePublicIds,
    ),
    level: String(question.level),
    materialPublicId: question.materialPublicId ?? "",
    multiChoiceRule:
      question.questionType === "multi_choice"
        ? question.multiChoiceRule
        : defaultScoringConfiguration.multiChoiceRule,
    profession: question.profession,
    questionOptions:
      question.questionOptions.length === 0
        ? createDefaultQuestionOptions(question.questionType)
        : question.questionOptions.map((questionOption) => ({
            contentRichText: questionOption.contentRichText,
            isCorrect: questionOption.isCorrect,
            label: questionOption.label,
          })),
    questionType: question.questionType,
    scoringMethod,
    scoringPoints:
      scoringMethod !== "ai_scoring"
        ? []
        : question.scoringPoints.length === 0
          ? createDefaultScoringPoints()
          : question.scoringPoints.map((scoringPoint) => ({
              description: scoringPoint.description,
              score: scoringPoint.score,
            })),
    standardAnswerRichText: question.standardAnswerRichText,
    stemRichText: question.stemRichText,
    subject: question.subject,
    tagPublicIdsText: formatPublicIdList(question.tagPublicIds),
  };
}

export function createMaterialFormValuesFromMaterial(
  material: MaterialDto,
): MaterialFormValues {
  return {
    contentRichText: material.contentRichText,
    level: String(material.level),
    profession: material.profession,
    subject: material.subject,
    title: material.title,
  };
}

const defaultContentPagination: ApiPagination = {
  page: 1,
  pageSize: 20,
  total: 0,
  sortBy: "updatedAt",
  sortOrder: "desc",
};

function useQuestionMaterialData(activeView: ViewMode, queryString: string) {
  const [loadState, setLoadState] = useState<ContentLoadState>("loading");
  const [refreshingView, setRefreshingView] = useState<ViewMode | null>(null);
  const [questions, setQuestions] = useState<QuestionDto[]>([]);
  const [materials, setMaterials] = useState<MaterialDto[]>([]);
  const [pagination, setPagination] = useState(defaultContentPagination);
  const loadedViewsRef = useRef(new Set<ViewMode>());
  const [latestIntent] = useState(() => createAdminListLatestIntent());

  useEffect(() => {
    const intent = latestIntent.begin();
    setRefreshingView(
      loadedViewsRef.current.has(activeView) ? activeView : null,
    );

    async function loadContentData() {
      const sessionToken = getStoredSessionToken();

      if (sessionToken === null) {
        setRefreshingView(null);
        setLoadState("unauthorized");
        return;
      }

      try {
        const sessionResponse = await fetchAdminApi<AuthContextDto>(
          "/api/v1/sessions",
          sessionToken,
        );

        if (!intent.isCurrent()) {
          return;
        }

        if (
          isUnauthorizedResponse(sessionResponse) ||
          sessionResponse.code !== 0 ||
          sessionResponse.data === null ||
          !isAdminContext(sessionResponse.data)
        ) {
          setRefreshingView(null);
          setLoadState("unauthorized");
          return;
        }

        const path = `/api/v1/${activeView}?${queryString}`;

        if (activeView === "materials") {
          const materialResponse = await fetchAdminApi<MaterialDto[]>(
            path,
            sessionToken,
          );

          if (!intent.isCurrent()) {
            return;
          }

          if (
            materialResponse.code !== 0 ||
            materialResponse.data === null ||
            materialResponse.pagination === undefined
          ) {
            setRefreshingView(null);
            setLoadState("error");
            return;
          }

          loadedViewsRef.current.add("materials");
          setMaterials(materialResponse.data);
          setPagination(materialResponse.pagination);
          setRefreshingView(null);
          setLoadState("ready");
          return;
        }

        const contentResponse = await fetchAdminApi<QuestionDto[]>(
          path,
          sessionToken,
        );

        if (!intent.isCurrent()) {
          return;
        }

        if (contentResponse.code !== 0 || contentResponse.data === null) {
          setRefreshingView(null);
          setLoadState("error");
          return;
        }

        loadedViewsRef.current.add("questions");
        setQuestions(contentResponse.data);
        setPagination(contentResponse.pagination ?? defaultContentPagination);
        setRefreshingView(null);
        setLoadState("ready");
      } catch {
        if (intent.isCurrent()) {
          setRefreshingView(null);
          setLoadState("error");
        }
      }
    }

    void loadContentData();

    return () => {
      intent.cancel();
    };
  }, [activeView, latestIntent, queryString]);

  return {
    loadState,
    materials,
    pagination,
    questions,
    refreshingView,
    setMaterials,
    setQuestions,
  };
}

const emptyQuestionBindingOptions: QuestionBindingOptions = {
  knowledgeNodes: [],
  materials: [],
  tags: [],
};

export function useQuestionBindingOptions(enabled: boolean) {
  const [loadState, setLoadState] = useState<BindingOptionsLoadState>("idle");
  const [options, setOptions] = useState<QuestionBindingOptions>(
    emptyQuestionBindingOptions,
  );

  useEffect(() => {
    if (!enabled) {
      return;
    }

    let isActive = true;

    async function loadBindingOptions() {
      const sessionToken = getStoredSessionToken();

      if (sessionToken === null) {
        if (isActive) setLoadState("error");
        return;
      }

      setLoadState("loading");

      try {
        const [materialResponse, knowledgeNodeResponse, tagResponse] =
          await Promise.all([
            fetchAdminApi<MaterialDto[]>(
              "/api/v1/materials?page=1&pageSize=100&sortBy=updatedAt&sortOrder=desc&status=available",
              sessionToken,
            ),
            fetchAdminApi<{
              knowledgeNodes: AdminKnowledgeNodeOpsSummaryDto[];
            }>(
              "/api/v1/knowledge-nodes?page=1&pageSize=100&sortBy=sortOrder&sortOrder=asc&status=active",
              sessionToken,
            ),
            fetchAdminApi<{ tags: TagOptionDto[] }>(
              "/api/v1/tags",
              sessionToken,
            ),
          ]);

        if (
          materialResponse.code !== 0 ||
          materialResponse.data === null ||
          knowledgeNodeResponse.code !== 0 ||
          knowledgeNodeResponse.data === null ||
          tagResponse.code !== 0 ||
          tagResponse.data === null
        ) {
          if (isActive) setLoadState("error");
          return;
        }

        if (isActive) {
          setOptions({
            knowledgeNodes: knowledgeNodeResponse.data.knowledgeNodes,
            materials: materialResponse.data,
            tags: tagResponse.data.tags,
          });
          setLoadState("ready");
        }
      } catch {
        if (isActive) setLoadState("error");
      }
    }

    void loadBindingOptions();

    return () => {
      isActive = false;
    };
  }, [enabled]);

  return { loadState, options };
}

async function mutateAdminApi<TData>(
  path: string,
  sessionToken: string,
  method: "POST" | "PATCH",
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

function createContentSaveErrorFeedback(
  kind: "question" | "material",
  responseCode: number,
): AdminFeedback {
  const contentLabel = kind === "question" ? "题目" : "材料";
  const isConflict = Math.floor(responseCode / 1000) === 409;

  return {
    message: isConflict
      ? "内容已锁定或被其他操作更新。当前输入已保留，请刷新确认后重试。"
      : "当前输入已保留，请检查后重试。",
    title: isConflict ? `${contentLabel}保存冲突` : `${contentLabel}保存失败`,
    tone: isConflict ? "conflict" : "error",
  };
}

function createContentActionErrorFeedback(
  kind: "question" | "material",
  responseCode?: number,
): AdminFeedback {
  const contentLabel = kind === "question" ? "题目" : "材料";
  const isConflict =
    responseCode !== undefined && Math.floor(responseCode / 1000) === 409;

  return {
    message: isConflict
      ? "内容状态已被其他操作更新，请刷新确认后重试。"
      : "操作未完成，当前列表保持不变，请稍后重试。",
    title: isConflict ? `${contentLabel}操作冲突` : `${contentLabel}操作失败`,
    tone: isConflict ? "conflict" : "error",
  };
}

export function createQuestionInput(
  values: QuestionFormValues,
  bindings: QuestionBindingInput = {
    knowledgeNodePublicIds: parsePublicIdList(
      values.knowledgeNodePublicIdsText,
    ),
    tagPublicIds: parsePublicIdList(values.tagPublicIdsText),
  },
) {
  const isOptionQuestion = optionQuestionTypes.has(
    values.questionType as QuestionType,
  );

  return {
    questionType: values.questionType,
    profession: values.profession,
    level: Number(values.level),
    subject: values.subject,
    stemRichText: values.stemRichText,
    analysisRichText: values.analysisRichText,
    standardAnswerRichText: normalizeStandardAnswerForQuestionType(
      values.questionType,
      values.standardAnswerRichText,
    ),
    multiChoiceRule: values.multiChoiceRule,
    scoringMethod: values.scoringMethod,
    materialPublicId:
      values.materialPublicId.trim().length === 0
        ? null
        : values.materialPublicId.trim(),
    questionOptions: isOptionQuestion
      ? values.questionOptions.map((questionOption, optionIndex) => ({
          label: questionOption.label,
          contentRichText: questionOption.contentRichText,
          isCorrect: questionOption.isCorrect,
          sortOrder: optionIndex + 1,
        }))
      : [],
    scoringPoints:
      isOptionQuestion || values.scoringMethod !== "ai_scoring"
        ? []
        : getPersistableScoringPoints(values.scoringPoints).map(
            (scoringPoint, pointIndex) => ({
              description: scoringPoint.description,
              score: scoringPoint.score,
              sortOrder: pointIndex + 1,
            }),
          ),
    fillBlankAnswers:
      values.questionType !== "fill_blank" ||
      values.scoringMethod !== "auto_match"
        ? []
        : (bindings.fillBlankAnswers ??
          getPersistableFillBlankAnswers(values.fillBlankAnswers).map(
            (fillBlankAnswer, blankIndex) => ({
              blankKey: `blank_${blankIndex + 1}`,
              standardAnswers: fillBlankAnswer.standardAnswersText
                .split("|")
                .map((answer) => answer.trim())
                .filter((answer) => answer.length > 0),
              score: fillBlankAnswer.score,
              sortOrder: blankIndex + 1,
            }),
          )),
    knowledgeNodePublicIds: bindings.knowledgeNodePublicIds,
    tagPublicIds: bindings.tagPublicIds,
  };
}

function getPersistableScoringPoints(
  scoringPoints: ScoringPointFormValue[],
): ScoringPointFormValue[] {
  return scoringPoints.filter(
    (scoringPoint) =>
      getMeaningfulPlainText(scoringPoint.description).length > 0 ||
      scoringPoint.score.trim().length > 0,
  );
}

function getPersistableFillBlankAnswers(
  fillBlankAnswers: FillBlankAnswerFormValue[],
): FillBlankAnswerFormValue[] {
  return fillBlankAnswers.filter(
    (fillBlankAnswer) =>
      getMeaningfulPlainText(fillBlankAnswer.standardAnswersText).length > 0 ||
      fillBlankAnswer.score.trim().length > 0,
  );
}

function formatPublicIdList(publicIds: string[]): string {
  return publicIds.join("\n");
}

function parsePublicIdList(value: string): string[] {
  const publicIds = value
    .split(/[\s,，]+/u)
    .map((publicId) => publicId.trim())
    .filter((publicId) => publicId.length > 0);

  return Array.from(new Set(publicIds));
}

function normalizeStandardAnswerForQuestionType(
  questionType: QuestionType | "",
  standardAnswerRichText: string,
) {
  if (questionType !== "true_false") {
    return standardAnswerRichText;
  }

  const normalizedAnswer = stripRichText(standardAnswerRichText)
    .trim()
    .toUpperCase();

  if (normalizedAnswer === "A") {
    return "正确";
  }

  if (normalizedAnswer === "B") {
    return "错误";
  }

  return standardAnswerRichText;
}

export function createMaterialInput(values: MaterialFormValues) {
  return {
    title: values.title,
    contentRichText: values.contentRichText,
    profession: values.profession,
    level: Number(values.level),
    subject: values.subject,
  };
}

export function AdminQuestionMaterialManagement({
  defaultView = "questions",
  initialKnowledgeNodeFilter = "",
  initialQuestionPublicId = "",
  materialEditorRoutesEnabled = false,
  questionEditorRoutesEnabled = false,
}: AdminQuestionMaterialManagementProps) {
  const [initialUrlQuery] = useState(() => readContentListUrlQuery());
  const [activeView, setActiveView] = useState<ViewMode>(
    initialQuestionPublicId.length > 0 ? "questions" : defaultView,
  );
  const [keyword, setKeyword] = useState(
    initialQuestionPublicId || initialUrlQuery.keyword,
  );
  const [knowledgeNodeFilter, setKnowledgeNodeFilter] = useState(
    initialKnowledgeNodeFilter || initialUrlQuery.knowledgeNodePublicId,
  );
  const [levelFilter, setLevelFilter] = useState(initialUrlQuery.level);
  const [profession, setProfession] = useState<ProfessionFilter>(
    initialUrlQuery.profession,
  );
  const [questionType, setQuestionType] = useState<QuestionTypeFilter>(
    initialUrlQuery.questionType,
  );
  const [subject, setSubject] = useState<SubjectFilter>(
    initialUrlQuery.subject,
  );
  const [status, setStatus] = useState<StatusFilter>(initialUrlQuery.status);
  const [tagFilter, setTagFilter] = useState(initialUrlQuery.tagPublicId);
  const debouncedKeyword = useAdminListDebouncedValue(keyword);
  const [detailTarget, setDetailTarget] =
    useState<AdminContentDetailTarget | null>(() => {
      if (
        defaultView === "questions" &&
        initialUrlQuery.questionDetailPublicId !== ""
      ) {
        return {
          kind: "question",
          publicId: initialUrlQuery.questionDetailPublicId,
        };
      }

      if (
        defaultView === "materials" &&
        initialUrlQuery.materialDetailPublicId !== ""
      ) {
        return {
          kind: "material",
          publicId: initialUrlQuery.materialDetailPublicId,
        };
      }

      return null;
    });
  const [activeForm, setActiveForm] = useState<ActiveContentForm | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [contentMutationFeedback, setContentMutationFeedback] =
    useState<AdminFeedback | null>(null);
  const {
    handleFilterChange,
    handlePageChange,
    handlePageSizeChange,
    handleReset,
    handleRestoreQuery,
    handleSortChange,
    query,
  } = useAdminListInteraction({
    initialQuery: initialUrlQuery.list,
    resetQuery: {},
  });
  const [pendingContentAction, setPendingContentAction] =
    useState<PendingContentAction | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const submissionInProgressRef = useRef(false);
  const editReturnContextRef = useRef<ContentEditReturnContext | null>(null);
  const [
    isInitialQuestionTargetDismissed,
    setIsInitialQuestionTargetDismissed,
  ] = useState(false);
  const [
    recommendationsByQuestionPublicId,
    setRecommendationsByQuestionPublicId,
  ] = useState<Record<string, KnowledgeRecommendationReviewState>>({});
  const contentQueryString = useMemo(() => {
    const searchParams = createAdminListSearchParams({
      page: query.page,
      pageSize: query.pageSize,
      sortBy: query.sortBy,
      sortOrder: query.sortOrder,
    });

    if (debouncedKeyword.trim() !== "") {
      searchParams.set("keyword", debouncedKeyword.trim());
    }
    if (profession !== "all") searchParams.set("profession", profession);
    if (subject !== "all") searchParams.set("subject", subject);
    if (levelFilter.trim() !== "")
      searchParams.set("level", levelFilter.trim());
    if (status !== "all") searchParams.set("status", status);
    if (activeView === "questions" && questionType !== "all") {
      searchParams.set("questionType", questionType);
    }
    if (activeView === "questions" && knowledgeNodeFilter.trim() !== "") {
      searchParams.set("knowledgeNodePublicId", knowledgeNodeFilter.trim());
    }
    if (activeView === "questions" && tagFilter.trim() !== "") {
      searchParams.set("tagPublicId", tagFilter.trim());
    }

    return searchParams.toString();
  }, [
    activeView,
    debouncedKeyword,
    knowledgeNodeFilter,
    levelFilter,
    profession,
    query.page,
    query.pageSize,
    query.sortBy,
    query.sortOrder,
    questionType,
    status,
    subject,
    tagFilter,
  ]);
  const {
    loadState,
    materials,
    pagination,
    questions,
    refreshingView,
    setMaterials,
    setQuestions,
  } = useQuestionMaterialData(activeView, contentQueryString);
  const { loadState: bindingOptionsLoadState, options: bindingOptions } =
    useQuestionBindingOptions(
      loadState === "ready" && activeView === "questions",
    );
  useAdminEditorListReturnRecovery({
    ready:
      loadState === "ready" &&
      ((activeView === "questions" && questionEditorRoutesEnabled) ||
        (activeView === "materials" && materialEditorRoutesEnabled)),
    resource: activeView,
  });

  useEffect(() => {
    const routeSearchParams = new URLSearchParams(contentQueryString);

    if (detailTarget?.kind === "question") {
      routeSearchParams.set("questionDetail", detailTarget.publicId);
    }

    if (detailTarget?.kind === "material") {
      routeSearchParams.set("materialDetail", detailTarget.publicId);
    }

    window.history.replaceState(
      null,
      "",
      `${window.location.pathname}?${routeSearchParams.toString()}`,
    );
  }, [contentQueryString, detailTarget]);

  useEffect(() => {
    function handlePopState() {
      const restoredQuery = readContentListUrlQuery();

      setKeyword(restoredQuery.keyword);
      setKnowledgeNodeFilter(restoredQuery.knowledgeNodePublicId);
      setLevelFilter(restoredQuery.level);
      setProfession(restoredQuery.profession);
      setQuestionType(restoredQuery.questionType);
      setStatus(restoredQuery.status);
      setSubject(restoredQuery.subject);
      setTagFilter(restoredQuery.tagPublicId);
      handleRestoreQuery(restoredQuery.list);
      setDetailTarget(
        activeView === "questions" &&
          restoredQuery.questionDetailPublicId !== ""
          ? {
              kind: "question",
              publicId: restoredQuery.questionDetailPublicId,
            }
          : activeView === "materials" &&
              restoredQuery.materialDetailPublicId !== ""
            ? {
                kind: "material",
                publicId: restoredQuery.materialDetailPublicId,
              }
            : null,
      );
    }

    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [activeView, handleRestoreQuery]);

  const initialQuestionTarget = useMemo(() => {
    if (
      activeView !== "questions" ||
      initialQuestionPublicId.length === 0 ||
      loadState !== "ready"
    ) {
      return null;
    }

    return (
      questions.find(
        (question) => question.publicId === initialQuestionPublicId,
      ) ?? null
    );
  }, [activeView, initialQuestionPublicId, loadState, questions]);
  const initialQuestionTargetForm = useMemo<ActiveContentForm | null>(() => {
    if (
      initialQuestionTarget === null ||
      isInitialQuestionTargetDismissed ||
      activeForm !== null
    ) {
      return null;
    }

    return {
      kind: "question",
      mode: "edit",
      publicId: initialQuestionTarget.publicId,
      values: createQuestionFormValuesFromQuestion(initialQuestionTarget),
    };
  }, [activeForm, initialQuestionTarget, isInitialQuestionTargetDismissed]);
  const displayedActiveForm = activeForm ?? initialQuestionTargetForm;
  const isInitialQuestionTargetPublish =
    initialQuestionTarget !== null &&
    displayedActiveForm?.kind === "question" &&
    displayedActiveForm.mode === "edit" &&
    displayedActiveForm.publicId === initialQuestionTarget.publicId &&
    initialQuestionTarget.status === "disabled" &&
    !isInitialQuestionTargetDismissed;
  const initialQuestionTargetMessage =
    initialQuestionTarget === null || isInitialQuestionTargetDismissed
      ? null
      : `已定位待审题目草稿 ${createQuestionReadableName(initialQuestionTarget)}`;
  const initialQuestionTargetError =
    activeView === "questions" &&
    initialQuestionPublicId.length > 0 &&
    loadState === "ready" &&
    initialQuestionTarget === null
      ? "未找到指定的待审题目草稿"
      : null;
  const displayedActionMessage = actionMessage ?? initialQuestionTargetMessage;
  const displayedActionError = actionError ?? initialQuestionTargetError;

  const selectedQuestionPublicId =
    displayedActiveForm?.kind === "question"
      ? displayedActiveForm.publicId
      : detailTarget?.kind === "question"
        ? detailTarget.publicId
        : null;
  const selectedMaterialPublicId =
    displayedActiveForm?.kind === "material"
      ? displayedActiveForm.publicId
      : detailTarget?.kind === "material"
        ? detailTarget.publicId
        : null;
  const hasActiveContentFilters =
    keyword.trim() !== "" ||
    levelFilter.trim() !== "" ||
    profession !== "all" ||
    subject !== "all" ||
    status !== "all" ||
    (activeView === "questions" &&
      (questionType !== "all" ||
        knowledgeNodeFilter.trim() !== "" ||
        tagFilter.trim() !== ""));
  const activeFilterChips = useMemo<AdminFilterChip[]>(() => {
    const filters: AdminFilterChip[] = [];

    if (keyword.trim() !== "") {
      filters.push({ id: "keyword", label: "关键词", value: keyword.trim() });
    }
    if (profession !== "all") {
      filters.push({
        id: "profession",
        label: "专业",
        value: professionLabels[profession],
      });
    }
    if (levelFilter.trim() !== "") {
      filters.push({
        id: "level",
        label: "等级",
        value: `${levelFilter.trim()}级`,
      });
    }
    if (subject !== "all") {
      filters.push({
        id: "subject",
        label: "科目",
        value: subjectLabels[subject],
      });
    }
    if (status !== "all") {
      filters.push({
        id: "status",
        label: "状态",
        value: statusLabels[status],
      });
    }
    if (activeView === "questions" && questionType !== "all") {
      filters.push({
        id: "questionType",
        label: "题型",
        value: questionTypeLabels[questionType],
      });
    }
    if (activeView === "questions" && knowledgeNodeFilter.trim() !== "") {
      const knowledgeNode = bindingOptions.knowledgeNodes.find(
        (option) => option.publicId === knowledgeNodeFilter,
      );
      filters.push({
        id: "knowledgeNodePublicId",
        label: "知识点",
        value: knowledgeNode?.pathName || knowledgeNode?.name || "名称不可用",
      });
    }
    if (activeView === "questions" && tagFilter.trim() !== "") {
      filters.push({
        id: "tagPublicId",
        label: "标签",
        value:
          bindingOptions.tags.find((tag) => tag.publicId === tagFilter)?.name ??
          "名称不可用",
      });
    }

    return filters;
  }, [
    activeView,
    bindingOptions.knowledgeNodes,
    bindingOptions.tags,
    keyword,
    knowledgeNodeFilter,
    levelFilter,
    profession,
    questionType,
    status,
    subject,
    tagFilter,
  ]);
  const displayedQuestions = questions;
  const displayedMaterials = materials;

  function captureEditReturnContext(trigger: HTMLElement) {
    editReturnContextRef.current = {
      filterLabel: activeView === "questions" ? "题目筛选" : "材料筛选",
      scrollY: window.scrollY,
      trigger,
    };
  }

  function closeActiveFormAndRestoreListContext() {
    setActiveForm(null);

    const returnContext = editReturnContextRef.current;
    editReturnContextRef.current = null;

    if (returnContext === null) {
      return;
    }

    if (
      window.scrollY !== returnContext.scrollY &&
      typeof window.scrollTo === "function"
    ) {
      window.scrollTo({ behavior: "auto", top: returnContext.scrollY });
    }

    const focusTarget = returnContext.trigger.isConnected
      ? returnContext.trigger
      : document.querySelector<HTMLElement>(
          `[aria-label="${returnContext.filterLabel}"] input, ` +
            `[aria-label="${returnContext.filterLabel}"] select, ` +
            `[aria-label="${returnContext.filterLabel}"] button`,
        );
    focusTarget?.focus({ preventScroll: true });
  }

  if (loadState === "loading") {
    return (
      <AdminLoadingState
        label={
          activeView === "questions" ? "正在加载题库数据" : "正在加载材料数据"
        }
      />
    );
  }

  if (loadState === "unauthorized") {
    return <AdminUnauthorizedState />;
  }

  if (loadState === "error") {
    return (
      <AdminErrorState
        description="请稍后刷新页面，或重新登录后再查看内容后台数据。"
        title={activeView === "questions" ? "题库加载失败" : "材料加载失败"}
      />
    );
  }

  async function handleSaveQuestion(values: QuestionFormValues) {
    const sessionToken = getStoredSessionToken();
    const shouldPublishInitialQuestionTarget = isInitialQuestionTargetPublish;

    if (submissionInProgressRef.current) {
      return;
    }

    if (sessionToken === null || displayedActiveForm?.kind !== "question") {
      setContentMutationFeedback({
        message: "管理员会话已失效，请重新登录后再操作。",
        title: "题目保存失败",
        tone: "error",
      });
      return;
    }

    submissionInProgressRef.current = true;
    setIsSubmitting(true);
    setActionError(null);
    setActionMessage(null);
    setContentMutationFeedback(null);

    try {
      const editedQuestion =
        displayedActiveForm.mode === "edit"
          ? (questions.find(
              (question) => question.publicId === displayedActiveForm.publicId,
            ) ?? null)
          : null;
      const response = await mutateAdminApi<{ question: QuestionDto }>(
        displayedActiveForm.mode === "create"
          ? "/api/v1/questions"
          : `/api/v1/questions/${displayedActiveForm.publicId}`,
        sessionToken,
        displayedActiveForm.mode === "create" ? "POST" : "PATCH",
        (() => {
          if (displayedActiveForm.mode === "create") {
            return createQuestionInput(values);
          }

          return {
            ...createQuestionInput(values, {
              knowledgeNodePublicIds: parsePublicIdList(
                values.knowledgeNodePublicIdsText,
              ),
              tagPublicIds: parsePublicIdList(values.tagPublicIdsText),
            }),
            expectedUpdatedAt: editedQuestion?.updatedAt ?? "",
            status: "available",
          };
        })(),
      );

      if (response.code !== 0 || response.data === null) {
        setContentMutationFeedback(
          createContentSaveErrorFeedback("question", response.code),
        );
        return;
      }

      const savedQuestion = response.data.question;
      setQuestions((currentQuestions) =>
        upsertAdminObjectByPublicId(currentQuestions, savedQuestion),
      );
      setContentMutationFeedback({
        message: shouldPublishInitialQuestionTarget
          ? `题目“${createQuestionReadableName(savedQuestion)}”已发布为正式题目`
          : `题目“${createQuestionReadableName(savedQuestion)}”已保存`,
        title: shouldPublishInitialQuestionTarget ? "题目已发布" : "题目已保存",
        tone: "success",
      });
      closeActiveFormAndRestoreListContext();
      setIsInitialQuestionTargetDismissed(true);
    } catch {
      setContentMutationFeedback({
        message: "当前输入已保留，请检查网络后重试。",
        title: "题目保存失败",
        tone: "error",
      });
    } finally {
      submissionInProgressRef.current = false;
      setIsSubmitting(false);
    }
  }

  async function handleSaveMaterial(values: MaterialFormValues) {
    const sessionToken = getStoredSessionToken();

    if (submissionInProgressRef.current) {
      return;
    }

    if (sessionToken === null || displayedActiveForm?.kind !== "material") {
      setContentMutationFeedback({
        message: "管理员会话已失效，请重新登录后再操作。",
        title: "材料保存失败",
        tone: "error",
      });
      return;
    }

    submissionInProgressRef.current = true;
    setIsSubmitting(true);
    setActionError(null);
    setActionMessage(null);
    setContentMutationFeedback(null);

    try {
      const editedMaterial =
        displayedActiveForm.mode === "edit"
          ? (materials.find(
              (material) => material.publicId === displayedActiveForm.publicId,
            ) ?? null)
          : null;
      const response = await mutateAdminApi<{ material: MaterialDto }>(
        displayedActiveForm.mode === "create"
          ? "/api/v1/materials"
          : `/api/v1/materials/${displayedActiveForm.publicId}`,
        sessionToken,
        displayedActiveForm.mode === "create" ? "POST" : "PATCH",
        displayedActiveForm.mode === "create"
          ? createMaterialInput(values)
          : {
              ...createMaterialInput(values),
              expectedUpdatedAt: editedMaterial?.updatedAt ?? "",
              status: "available",
            },
      );

      if (response.code !== 0 || response.data === null) {
        setContentMutationFeedback(
          createContentSaveErrorFeedback("material", response.code),
        );
        return;
      }

      const savedMaterial = response.data.material;
      setMaterials((currentMaterials) =>
        upsertAdminObjectByPublicId(currentMaterials, savedMaterial),
      );
      setContentMutationFeedback({
        message: `材料“${savedMaterial.title}”已保存`,
        title: "材料已保存",
        tone: "success",
      });
      closeActiveFormAndRestoreListContext();
    } catch {
      setContentMutationFeedback({
        message: "当前输入已保留，请检查网络后重试。",
        title: "材料保存失败",
        tone: "error",
      });
    } finally {
      submissionInProgressRef.current = false;
      setIsSubmitting(false);
    }
  }

  async function handleQuestionAction(
    question: QuestionDto,
    action: "copy" | "disable",
  ): Promise<QuestionDto | null> {
    if (submissionInProgressRef.current) return null;

    const sessionToken = getStoredSessionToken();

    if (sessionToken === null) {
      setContentMutationFeedback({
        message: "管理员会话已失效，请重新登录后再操作。",
        title: "题目操作失败",
        tone: "error",
      });
      return null;
    }

    submissionInProgressRef.current = true;
    setActionError(null);
    setActionMessage(null);
    setContentMutationFeedback(null);

    try {
      const response = await mutateAdminApi<{ question: QuestionDto }>(
        `/api/v1/questions/${question.publicId}/${action}`,
        sessionToken,
        "POST",
      );

      if (response.code !== 0 || response.data === null) {
        setContentMutationFeedback(
          createContentActionErrorFeedback("question", response.code),
        );
        return null;
      }

      const updatedQuestion = response.data.question;
      setQuestions((currentQuestions) =>
        upsertAdminObjectByPublicId(currentQuestions, updatedQuestion),
      );
      setContentMutationFeedback({
        message: `题目“${createQuestionReadableName(updatedQuestion)}”已更新`,
        title: "题目已更新",
        tone: "success",
      });
      return updatedQuestion;
    } catch {
      setContentMutationFeedback(createContentActionErrorFeedback("question"));
      return null;
    } finally {
      submissionInProgressRef.current = false;
    }
  }

  async function handleRecommendKnowledgeNodes(question: QuestionDto) {
    const sessionToken = getStoredSessionToken();

    if (sessionToken === null) {
      setActionError("管理员会话已失效，请重新登录后再操作。");
      return;
    }

    setActionError(null);
    const response =
      await mutateAdminApi<QuestionKnowledgeRecommendationResultDto>(
        `/api/v1/questions/${question.publicId}/recommend-knowledge-nodes`,
        sessionToken,
        "POST",
      );

    if (response.code !== 0 || response.data === null) {
      setActionError("知识点推荐生成失败，请刷新后重试。");
      return;
    }

    const recommendationResult = response.data;

    setRecommendationsByQuestionPublicId((currentRecommendations) => ({
      ...currentRecommendations,
      [question.publicId]: {
        recommendation: recommendationResult.recommendation,
      },
    }));
    setActionMessage(
      recommendationResult.recommendation.recommendationStatus === "pending" ||
        recommendationResult.recommendation.recommendationStatus === "running"
        ? `题目“${createQuestionReadableName(question)}”的知识点推荐任务已创建`
        : `题目“${createQuestionReadableName(question)}”的知识点推荐已加载`,
    );
  }

  async function handleReviewKnowledgeRecommendation(
    questionPublicId: string,
    knowledgeNodePublicId: string,
    reviewStatus: RecommendationReviewStatus,
  ) {
    const sessionToken = getStoredSessionToken();
    const currentQuestion =
      questions.find((question) => question.publicId === questionPublicId) ??
      null;
    const currentRecommendationState =
      recommendationsByQuestionPublicId[questionPublicId] ?? null;
    const recommendationItem =
      currentRecommendationState?.recommendation.recommendations.find(
        (recommendation) =>
          recommendation.knowledgeNodePublicId === knowledgeNodePublicId,
      ) ?? null;
    const recommendationName = recommendationItem?.name.trim() || "该知识点";

    if (
      sessionToken === null ||
      currentQuestion === null ||
      currentRecommendationState === null ||
      recommendationItem === null ||
      currentRecommendationState.recommendation.reviewState.taskStatus !==
        "succeeded"
    ) {
      setActionError("知识点推荐状态已变化，请刷新后重试。");
      return;
    }

    const recommendation = currentRecommendationState.recommendation;
    const action = reviewStatus === "accepted" ? "confirm" : "ignore";
    const candidatePublicIds = [recommendationItem.candidatePublicId];
    const response =
      await mutateAdminApi<QuestionKnowledgeRecommendationResultDto>(
        `/api/v1/questions/${questionPublicId}/recommend-knowledge-nodes`,
        sessionToken,
        "POST",
        {
          action,
          taskPublicId: recommendation.reviewState.taskPublicId,
          expectedQuestionUpdatedAt:
            recommendation.reviewState.questionUpdatedAt,
          candidatePublicIds,
        },
      );

    if (response.code !== 0 || response.data === null) {
      setActionError("知识点推荐审查保存失败，请刷新后重试。");
      return;
    }

    const reviewedRecommendation = response.data.recommendation;
    setRecommendationsByQuestionPublicId((currentRecommendations) => ({
      ...currentRecommendations,
      [questionPublicId]: { recommendation: reviewedRecommendation },
    }));

    if (action === "confirm") {
      const confirmedKnowledgeNodePublicIds =
        reviewedRecommendation.recommendations
          .filter((candidate) => candidate.confirmationStatus === "confirmed")
          .map((candidate) => candidate.knowledgeNodePublicId);
      setQuestions((currentQuestions) =>
        currentQuestions.map((question) =>
          question.publicId === questionPublicId
            ? {
                ...question,
                knowledgeNodePublicIds: confirmedKnowledgeNodePublicIds,
                updatedAt:
                  reviewedRecommendation.reviewState.currentQuestionUpdatedAt,
              }
            : question,
        ),
      );
    }
    setActionError(null);

    setActionMessage(
      reviewStatus === "accepted"
        ? `已采纳推荐“${recommendationName}”`
        : `已丢弃推荐“${recommendationName}”`,
    );
  }

  async function handleMaterialAction(
    material: MaterialDto,
    action: "copy" | "disable",
  ): Promise<MaterialDto | null> {
    if (submissionInProgressRef.current) return null;

    const sessionToken = getStoredSessionToken();

    if (sessionToken === null) {
      setContentMutationFeedback({
        message: "管理员会话已失效，请重新登录后再操作。",
        title: "材料操作失败",
        tone: "error",
      });
      return null;
    }

    submissionInProgressRef.current = true;
    setIsSubmitting(true);
    setActionError(null);
    setActionMessage(null);
    setContentMutationFeedback(null);

    try {
      const response = await mutateAdminApi<{ material: MaterialDto }>(
        `/api/v1/materials/${material.publicId}/${action}`,
        sessionToken,
        "POST",
      );

      if (response.code !== 0 || response.data === null) {
        setContentMutationFeedback(
          createContentActionErrorFeedback("material", response.code),
        );
        return null;
      }

      const updatedMaterial = response.data.material;
      setMaterials((currentMaterials) =>
        upsertAdminObjectByPublicId(currentMaterials, updatedMaterial),
      );
      setContentMutationFeedback({
        message: `材料“${updatedMaterial.title}”已更新`,
        title: "材料已更新",
        tone: "success",
      });
      return updatedMaterial;
    } catch {
      setContentMutationFeedback(createContentActionErrorFeedback("material"));
      return null;
    } finally {
      submissionInProgressRef.current = false;
      setIsSubmitting(false);
    }
  }

  async function handleConfirmPendingContentAction() {
    if (pendingContentAction === null) {
      return;
    }

    const currentAction = pendingContentAction;
    setPendingContentAction(null);

    if (currentAction.kind === "questionDisable") {
      const question = questions.find(
        (item) => item.publicId === currentAction.publicId,
      );
      if (question !== undefined) {
        await handleQuestionAction(question, "disable");
      }
      return;
    }

    const material = materials.find(
      (item) => item.publicId === currentAction.publicId,
    );
    if (material !== undefined) {
      await handleMaterialAction(material, "disable");
    }
  }

  function handleRemoveFilter(filterId: string) {
    switch (filterId) {
      case "keyword":
        setKeyword("");
        break;
      case "profession":
        setProfession("all");
        break;
      case "level":
        setLevelFilter("");
        break;
      case "subject":
        setSubject("all");
        break;
      case "status":
        setStatus("all");
        break;
      case "questionType":
        setQuestionType("all");
        break;
      case "knowledgeNodePublicId":
        setKnowledgeNodeFilter("");
        break;
      case "tagPublicId":
        setTagFilter("");
        break;
      default:
        return;
    }

    handleFilterChange(filterId);
  }

  return (
    <section className="space-y-6">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-2">
          <p className="text-brand-primary text-sm font-medium">内容后台</p>
          <h1 className="font-heading text-text-primary text-2xl font-semibold">
            题库与材料管理
          </h1>
          <p className="text-text-secondary max-w-3xl text-sm">
            按专业、等级和内容状态维护正式题目与材料，查看锁定和引用摘要后再执行写操作。
          </p>
        </div>
        {activeView === "questions" && questionEditorRoutesEnabled ? (
          <QuestionCreateRouteActionBar />
        ) : activeView === "materials" && materialEditorRoutesEnabled ? (
          <MaterialCreateRouteActionBar />
        ) : (
          <ActionBar
            activeView={activeView}
            onCreate={() => {
              editReturnContextRef.current = null;
              setActionError(null);
              setActionMessage(null);
              setContentMutationFeedback(null);
              setActiveForm(
                activeView === "questions"
                  ? {
                      kind: "question",
                      mode: "create",
                      publicId: null,
                      values: createDefaultQuestionFormValues(),
                    }
                  : {
                      kind: "material",
                      mode: "create",
                      publicId: null,
                      values: createDefaultMaterialFormValues(),
                    },
              );
            }}
          />
        )}
      </header>

      <QuestionMaterialLifecycleContextBand
        activeView={activeView}
        materials={materials}
        questions={questions}
      />

      <FilterPanel
        activeView={activeView}
        bindingOptions={bindingOptions}
        keyword={keyword}
        knowledgeNodeFilter={knowledgeNodeFilter}
        levelFilter={levelFilter}
        pageSize={query.pageSize}
        profession={profession}
        questionType={questionType}
        sortOrder={query.sortOrder}
        status={status}
        subject={subject}
        tagFilter={tagFilter}
        total={pagination.total}
        onKeywordChange={(value) => {
          setKeyword(value);
          handleFilterChange("keyword");
        }}
        onKnowledgeNodeFilterChange={(value) => {
          setKnowledgeNodeFilter(value);
          handleFilterChange("knowledgeNodePublicId");
        }}
        onLevelFilterChange={(value) => {
          setLevelFilter(value);
          handleFilterChange("level");
        }}
        onPageSizeChange={handlePageSizeChange}
        onProfessionChange={(value) => {
          setProfession(value);
          handleFilterChange("profession");
        }}
        onQuestionTypeChange={(value) => {
          setQuestionType(value);
          handleFilterChange("questionType");
        }}
        onReset={() => {
          setKeyword("");
          setKnowledgeNodeFilter(initialKnowledgeNodeFilter);
          setLevelFilter("");
          setProfession("all");
          setQuestionType("all");
          setSubject("all");
          setStatus("all");
          setTagFilter("");
          handleReset();
        }}
        onSort={() => handleSortChange("updatedAt")}
        onStatusChange={(value) => {
          setStatus(value);
          handleFilterChange("status");
        }}
        onSubjectChange={(value) => {
          setSubject(value);
          handleFilterChange("subject");
        }}
        onTagFilterChange={(value) => {
          setTagFilter(value);
          handleFilterChange("tagPublicId");
        }}
      />

      <AdminFilterChips
        filters={activeFilterChips}
        onRemove={handleRemoveFilter}
      />

      {refreshingView === activeView ? (
        <AdminAsyncState
          className="border-border bg-surface text-text-secondary rounded-md border px-4 py-3 text-sm"
          variant="refreshing"
        >
          正在刷新{activeView === "questions" ? "题目" : "材料"}
          列表，当前结果仍可操作。
        </AdminAsyncState>
      ) : null}

      {displayedActionMessage === null ? null : (
        <p className="text-brand-primary text-sm" role="status">
          {displayedActionMessage}
        </p>
      )}
      {displayedActionError === null ? null : (
        <p className="text-destructive text-sm" role="alert">
          {displayedActionError}
        </p>
      )}

      {contentMutationFeedback === null ? null : (
        <AdminToast
          feedback={contentMutationFeedback}
          onDismiss={() => setContentMutationFeedback(null)}
        />
      )}

      <div
        aria-label="题库资源类型"
        className="border-border bg-surface inline-flex rounded-md border p-1"
        role="tablist"
      >
        <button
          aria-selected={activeView === "questions"}
          className={tabClassName(activeView === "questions")}
          role="tab"
          type="button"
          onClick={() => {
            setDetailTarget(null);
            setActiveView("questions");
            handleFilterChange("view");
          }}
        >
          <FileQuestion aria-hidden="true" className="size-4" />
          题目
        </button>
        <button
          aria-selected={activeView === "materials"}
          className={tabClassName(activeView === "materials")}
          role="tab"
          type="button"
          onClick={() => {
            setDetailTarget(null);
            setIsInitialQuestionTargetDismissed(true);
            setActiveView("materials");
            handleFilterChange("view");
          }}
        >
          <FileText aria-hidden="true" className="size-4" />
          材料
        </button>
      </div>

      <div
        className={
          displayedActiveForm === null
            ? "grid gap-4"
            : "grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(22rem,28rem)]"
        }
      >
        <div className="min-w-0">
          {activeView === "questions" ? (
            <QuestionList
              editorRoutesEnabled={questionEditorRoutesEnabled}
              emptyTitle={
                hasActiveContentFilters ? "没有匹配的题目" : "暂无题目"
              }
              recommendationByQuestionPublicId={
                recommendationsByQuestionPublicId
              }
              rows={displayedQuestions}
              selectedPublicId={selectedQuestionPublicId}
              onCopy={(question) => handleQuestionAction(question, "copy")}
              onDisable={(question) =>
                setPendingContentAction({
                  kind: "questionDisable",
                  readableName: createQuestionReadableName(question),
                  publicId: question.publicId,
                })
              }
              onEdit={(question, trigger) => {
                captureEditReturnContext(trigger);
                setActionError(null);
                setActionMessage(null);
                setContentMutationFeedback(null);
                setIsInitialQuestionTargetDismissed(true);
                setActiveForm({
                  kind: "question",
                  mode: "edit",
                  publicId: question.publicId,
                  values: createQuestionFormValuesFromQuestion(question),
                });
              }}
              onView={(publicId) =>
                setDetailTarget({ kind: "question", publicId })
              }
              onRecommend={(question) =>
                void handleRecommendKnowledgeNodes(question)
              }
              onReviewRecommendation={handleReviewKnowledgeRecommendation}
            />
          ) : materialEditorRoutesEnabled ? (
            <MaterialListWithEditorRoutes
              emptyTitle={
                hasActiveContentFilters ? "没有匹配的材料" : "暂无材料"
              }
              rows={displayedMaterials}
              selectedPublicId={selectedMaterialPublicId}
              onCopy={(material) => handleMaterialAction(material, "copy")}
              onDisable={(material) =>
                setPendingContentAction({
                  kind: "materialDisable",
                  readableName: createMaterialReadableName(material),
                  publicId: material.publicId,
                })
              }
              onView={(publicId) =>
                setDetailTarget({ kind: "material", publicId })
              }
            />
          ) : (
            <MaterialList
              emptyTitle={
                hasActiveContentFilters ? "没有匹配的材料" : "暂无材料"
              }
              rows={displayedMaterials}
              selectedPublicId={selectedMaterialPublicId}
              onCopy={(material) => void handleMaterialAction(material, "copy")}
              onDisable={(material) =>
                setPendingContentAction({
                  kind: "materialDisable",
                  readableName: createMaterialReadableName(material),
                  publicId: material.publicId,
                })
              }
              onEdit={(material, trigger) => {
                captureEditReturnContext(trigger);
                setActionError(null);
                setActionMessage(null);
                setContentMutationFeedback(null);
                setIsInitialQuestionTargetDismissed(true);
                setActiveForm({
                  kind: "material",
                  mode: "edit",
                  publicId: material.publicId,
                  values: createMaterialFormValuesFromMaterial(material),
                });
              }}
              onView={(publicId) =>
                setDetailTarget({ kind: "material", publicId })
              }
            />
          )}
        </div>
        {displayedActiveForm === null ? null : (
          <aside
            className="min-w-0 xl:sticky xl:top-4 xl:self-start"
            data-testid="content-edit-context-panel"
          >
            <div className="mb-3 flex flex-col gap-1">
              <p
                className="text-text-primary text-sm font-semibold"
                data-testid="content-edit-context-label"
              >
                {displayedActiveForm.mode === "create" ? "新建" : "编辑"}
                {displayedActiveForm.kind === "question" ? "题目" : "材料"}
              </p>
              <p className="text-text-muted text-xs">
                {displayedActiveForm.mode === "create"
                  ? "新建本地草稿"
                  : "正在编辑所选内容"}
              </p>
            </div>
            {displayedActiveForm.kind === "question" ? (
              <AdminQuestionEditorForm
                bindingOptions={bindingOptions}
                bindingOptionsLoadState={bindingOptionsLoadState}
                isSubmitting={isSubmitting}
                key={`${displayedActiveForm.mode}-${
                  displayedActiveForm.publicId ?? "new"
                }`}
                mode={displayedActiveForm.mode}
                submitLabel={
                  isInitialQuestionTargetPublish ? "发布为正式题目" : "保存题目"
                }
                values={displayedActiveForm.values}
                onCancel={() => {
                  closeActiveFormAndRestoreListContext();
                  setIsInitialQuestionTargetDismissed(true);
                }}
                onSubmit={handleSaveQuestion}
              />
            ) : (
              <AdminMaterialEditorForm
                isSubmitting={isSubmitting}
                key={`${displayedActiveForm.mode}-${
                  displayedActiveForm.publicId ?? "new"
                }`}
                mode={displayedActiveForm.mode}
                values={displayedActiveForm.values}
                onCancel={() => {
                  closeActiveFormAndRestoreListContext();
                  setIsInitialQuestionTargetDismissed(true);
                }}
                onSubmit={handleSaveMaterial}
              />
            )}
          </aside>
        )}
      </div>

      <AdminPagination
        itemLabel={activeView === "questions" ? "道题目" : "份材料"}
        page={query.page}
        pageSize={query.pageSize}
        total={pagination.total}
        onPageChange={handlePageChange}
      />

      {detailTarget === null ? null : (
        <AdminContentDetailDrawer
          target={detailTarget}
          onClose={() => setDetailTarget(null)}
        />
      )}

      {pendingContentAction === null ? null : (
        <ContentDangerConfirmationDialog
          action={pendingContentAction}
          onCancel={() => setPendingContentAction(null)}
          onConfirm={() => void handleConfirmPendingContentAction()}
        />
      )}
    </section>
  );
}

function QuestionMaterialLifecycleContextBand({
  activeView,
  materials,
  questions,
}: {
  activeView: ViewMode;
  materials: MaterialDto[];
  questions: QuestionDto[];
}) {
  const rows = activeView === "questions" ? questions : materials;
  const editableCount = rows.filter(
    (row) => row.status === "available" && !row.isLocked,
  ).length;
  const disabledCount = rows.filter((row) => row.status === "disabled").length;
  const lockedCount = rows.filter((row) => row.isLocked).length;
  const title = activeView === "questions" ? "题库题目" : "材料库生命周期";
  const description =
    activeView === "questions"
      ? "待审 AI 题目需先创建内容草稿，不直接写入正式题库；锁定后复制新题再编辑。"
      : "材料复用与锁定先审查；锁定材料只能复制新材料，不能直接覆盖已发布试卷引用。";

  return (
    <section
      className="border-border bg-surface rounded-md border p-4 shadow-sm"
      data-testid="question-material-lifecycle-context-band"
    >
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-1">
          <p className="text-brand-primary text-xs font-medium">内容生命周期</p>
          <h2 className="text-text-primary text-base font-semibold">{title}</h2>
          <p className="text-text-secondary text-sm leading-6">{description}</p>
        </div>
        <dl className="grid gap-2 text-xs sm:grid-cols-3">
          <LifecycleMetric label="本页可编辑" value={editableCount} />
          <LifecycleMetric label="本页已停用" value={disabledCount} />
          <LifecycleMetric label="本页锁定" value={lockedCount} />
        </dl>
      </div>
    </section>
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

function ContentDangerConfirmationDialog({
  action,
  onCancel,
  onConfirm,
}: {
  action: PendingContentAction;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  const noun = action.kind === "questionDisable" ? "题目" : "材料";

  return (
    <div
      aria-modal="true"
      className="border-border bg-surface fixed top-20 left-1/2 z-50 w-full max-w-md -translate-x-1/2 rounded-md border p-4 shadow-lg"
      role="alertdialog"
    >
      <div className="space-y-3">
        <h2 className="text-text-primary text-base font-semibold">
          确认停用{noun}？
        </h2>
        <p className="text-text-secondary text-sm">
          将停用{noun}“{action.readableName}”。
        </p>
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="destructive" onClick={onConfirm}>
            确认停用
          </Button>
          <Button type="button" variant="outline" onClick={onCancel}>
            取消
          </Button>
        </div>
      </div>
    </div>
  );
}

function ActionBar({
  activeView,
  editorEntryIdentity,
  onCreate,
}: {
  activeView: ViewMode;
  editorEntryIdentity?: AdminEditorInitiatingControl;
  onCreate: () => void;
}) {
  const noun = activeView === "questions" ? "题目" : "材料";

  return (
    <div className="max-w-xl space-y-2">
      <div className="flex flex-wrap gap-2">
        <Button
          data-admin-editor-entry={editorEntryIdentity}
          onClick={onCreate}
        >
          <Plus aria-hidden="true" data-icon="inline-start" />
          新建{noun}
        </Button>
      </div>
      <p
        className="text-text-secondary text-xs leading-5"
        data-testid="content-action-runtime-ready"
        role="status"
      >
        新建、编辑、停用和复制已接入本地运行时，写操作会记录脱敏审计摘要。
      </p>
    </div>
  );
}

function QuestionCreateRouteActionBar() {
  const router = useRouter();

  return (
    <ActionBar
      activeView="questions"
      editorEntryIdentity="create"
      onCreate={() =>
        router.push(
          createEditorEntryHref({
            initiatingControl: "create",
            resource: "questions",
          }),
        )
      }
    />
  );
}

function MaterialCreateRouteActionBar() {
  const router = useRouter();

  return (
    <ActionBar
      activeView="materials"
      editorEntryIdentity="create"
      onCreate={() =>
        router.push(
          createEditorEntryHref({
            initiatingControl: "create",
            resource: "materials",
          }),
        )
      }
    />
  );
}

export function AdminQuestionEditorForm({
  bindingOptions,
  bindingOptionsLoadState,
  isSubmitting,
  mode,
  submitBlockedReason = null,
  submitLabel = "保存题目",
  values,
  onCancel,
  onDirtyStateChange,
  onSubmit,
}: {
  bindingOptions: QuestionBindingOptions;
  bindingOptionsLoadState: BindingOptionsLoadState;
  isSubmitting: boolean;
  mode: QuestionFormMode;
  submitBlockedReason?: string | null;
  submitLabel?: string;
  values: QuestionFormValues;
  onCancel: () => void;
  onDirtyStateChange?: (isDirty: boolean) => void;
  onSubmit: (values: QuestionFormValues) => void;
}) {
  const [formValues, setFormValues] = useState(values);
  const [formIssues, setFormIssues] = useState<ContentIntegrityIssue[]>([]);
  const formRef = useRef<HTMLFormElement>(null);
  const [initialValuesFingerprint] = useState(() => JSON.stringify(values));
  const disabledReasonId = useId();
  const disabledReason = isSubmitting
    ? "正在保存，请勿重复提交。"
    : submitBlockedReason;
  const dirtyState = getAdminFormDirtyState(
    initialValuesFingerprint,
    JSON.stringify(formValues),
  );
  const isOptionQuestion = optionQuestionTypes.has(
    formValues.questionType as QuestionType,
  );
  const stemLengthExceeded =
    formValues.stemRichText.length > MAX_QUESTION_RICH_TEXT_LENGTH;
  const analysisLengthExceeded =
    formValues.analysisRichText.length > MAX_QUESTION_RICH_TEXT_LENGTH;
  const isFormInvalid = stemLengthExceeded || analysisLengthExceeded;
  const previewMaterialPublicId =
    formValues.materialPublicId.trim().length === 0
      ? null
      : formValues.materialPublicId.trim();
  const previewKnowledgeNodePublicIds = parsePublicIdList(
    formValues.knowledgeNodePublicIdsText,
  );
  const previewTagPublicIds = parsePublicIdList(formValues.tagPublicIdsText);

  useEffect(() => {
    onDirtyStateChange?.(dirtyState.status === "dirty");
  }, [dirtyState.status, onDirtyStateChange]);

  return (
    <form
      aria-label="题目表单"
      className="bg-surface border-border grid gap-4 rounded-md border p-4 shadow-sm"
      data-admin-form-dirty-state={dirtyState.status}
      ref={formRef}
      onSubmit={(event) => {
        event.preventDefault();
        const integrityIssues = getQuestionIntegrityIssues({
          ...formValues,
          fillBlankAnswers:
            formValues.questionType === "fill_blank" &&
            formValues.scoringMethod === "auto_match"
              ? getPersistableFillBlankAnswers(formValues.fillBlankAnswers).map(
                  (fillBlankAnswer) => ({
                    score: fillBlankAnswer.score,
                    standardAnswers: fillBlankAnswer.standardAnswersText
                      .split("|")
                      .map((answer) => answer.trim())
                      .filter((answer) => answer.length > 0),
                  }),
                )
              : [],
          level: formValues.level,
          scoringPoints:
            formValues.scoringMethod === "ai_scoring"
              ? getPersistableScoringPoints(formValues.scoringPoints)
              : [],
        });
        setFormIssues(integrityIssues);
        if (integrityIssues.length > 0) {
          if (formRef.current !== null) {
            focusFirstAdminFormIssue(formRef.current, integrityIssues);
          }
          return;
        }
        onSubmit(formValues);
      }}
    >
      <h2 className="text-text-primary text-base font-semibold">
        {mode === "create" ? "新建题目" : "编辑题目"}
      </h2>
      <p className="text-text-secondary text-xs leading-5">
        题型、专业、等级、科目、题干、标准答案和老师解析为必填；请按所选题型补全选项、逐空答案或评分点。
      </p>
      <FormErrorSummary issues={formIssues} />
      <div className="grid gap-3 md:grid-cols-4">
        <QuestionFormSelect
          error={readFieldError(formIssues, "questionType")}
          fieldName="questionType"
          label="题型"
          options={Object.entries(questionTypeLabels)}
          value={formValues.questionType}
          onChange={(value) => {
            const questionType = value as QuestionType;
            const scoringConfiguration =
              getDefaultScoringConfiguration(questionType);

            setFormValues({
              ...formValues,
              fillBlankAnswers:
                questionType !== "fill_blank"
                  ? []
                  : formValues.fillBlankAnswers.length === 0
                    ? createDefaultFillBlankAnswers()
                    : formValues.fillBlankAnswers,
              questionOptions: createDefaultQuestionOptions(questionType),
              multiChoiceRule: scoringConfiguration.multiChoiceRule,
              scoringMethod: scoringConfiguration.scoringMethod,
              scoringPoints:
                scoringConfiguration.scoringMethod === "ai_scoring" &&
                formValues.scoringPoints.length === 0
                  ? createDefaultScoringPoints()
                  : optionQuestionTypes.has(questionType)
                    ? []
                    : formValues.scoringPoints,
              questionType,
              standardAnswerRichText:
                questionType === "true_false"
                  ? "A"
                  : formValues.standardAnswerRichText,
            });
          }}
        />
        <QuestionFormSelect
          error={readFieldError(formIssues, "profession")}
          fieldName="profession"
          label="专业"
          options={Object.entries(professionLabels)}
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
            aria-describedby={
              readFieldError(formIssues, "level") === null
                ? undefined
                : "question-level-error"
            }
            aria-invalid={readFieldError(formIssues, "level") !== null}
            data-field="level"
            min={1}
            type="number"
            value={formValues.level}
            onChange={(event) =>
              setFormValues({
                ...formValues,
                level: event.target.value,
              })
            }
          />
          <FieldError
            id="question-level-error"
            message={readFieldError(formIssues, "level")}
          />
        </label>
        <QuestionFormSelect
          error={readFieldError(formIssues, "subject")}
          fieldName="subject"
          label="科目"
          options={Object.entries(subjectLabels)}
          value={formValues.subject}
          onChange={(value) =>
            setFormValues({
              ...formValues,
              subject: value as Subject,
            })
          }
        />
      </div>
      <div className="grid gap-3 md:grid-cols-3">
        <QuestionFormSelect
          label="评分方式"
          options={Object.entries(scoringMethodLabels)}
          value={formValues.scoringMethod}
          onChange={(value) => {
            const scoringMethod = value as ScoringMethod;

            setFormValues({
              ...formValues,
              fillBlankAnswers:
                formValues.questionType === "fill_blank" &&
                scoringMethod === "auto_match"
                  ? formValues.fillBlankAnswers.length === 0
                    ? createDefaultFillBlankAnswers()
                    : formValues.fillBlankAnswers
                  : formValues.fillBlankAnswers,
              scoringMethod,
              scoringPoints:
                scoringMethod === "ai_scoring" &&
                formValues.scoringPoints.length === 0
                  ? createDefaultScoringPoints()
                  : formValues.scoringPoints,
            });
          }}
          disabled={formValues.questionType !== "fill_blank"}
        />
        <QuestionFormSelect
          label="多选评分规则"
          options={Object.entries(multiChoiceRuleLabels)}
          value={formValues.multiChoiceRule}
          onChange={(value) =>
            setFormValues({
              ...formValues,
              multiChoiceRule: value as MultiChoiceRule,
            })
          }
          disabled={formValues.questionType !== "multi_choice"}
        />
        <label className="grid gap-2 text-sm font-medium">
          <span className="text-text-secondary">关联材料</span>
          <select
            aria-label="关联材料"
            className="border-input focus-visible:border-ring focus-visible:ring-ring/50 bg-surface h-9 rounded-lg border px-3 py-1 text-sm outline-none focus-visible:ring-3"
            disabled={bindingOptionsLoadState !== "ready"}
            value={formValues.materialPublicId}
            onChange={(event) =>
              setFormValues({
                ...formValues,
                materialPublicId: event.target.value,
              })
            }
          >
            <option value="">不关联材料</option>
            {formValues.materialPublicId !== "" &&
            !bindingOptions.materials.some(
              (material) => material.publicId === formValues.materialPublicId,
            ) ? (
              <option value={formValues.materialPublicId}>绑定项不可用</option>
            ) : null}
            {bindingOptions.materials.map((material) => (
              <option key={material.publicId} value={material.publicId}>
                {material.title}
              </option>
            ))}
          </select>
        </label>
      </div>
      <fieldset className="border-border grid gap-3 rounded-md border p-3">
        <legend className="text-text-secondary px-1 text-sm font-medium">
          知识点与标签绑定
        </legend>
        {bindingOptionsLoadState === "loading" ? (
          <p className="text-text-secondary text-sm">正在加载绑定选项</p>
        ) : null}
        {bindingOptionsLoadState === "error" ? (
          <p className="text-destructive text-sm" role="alert">
            绑定选项暂不可用，请刷新后重试。
          </p>
        ) : null}
        <div className="grid gap-3 md:grid-cols-2">
          <BusinessBindingSelector
            label="知识点"
            options={bindingOptions.knowledgeNodes.map((knowledgeNode) => ({
              label: knowledgeNode.pathName || knowledgeNode.name,
              publicId: knowledgeNode.publicId,
            }))}
            searchLabel="搜索知识点"
            selectedPublicIds={previewKnowledgeNodePublicIds}
            onChange={(knowledgeNodePublicIds) =>
              setFormValues({
                ...formValues,
                knowledgeNodePublicIdsText: formatPublicIdList(
                  knowledgeNodePublicIds,
                ),
              })
            }
          />
          <BusinessBindingSelector
            label="标签"
            options={bindingOptions.tags.map((tag) => ({
              label: tag.name,
              publicId: tag.publicId,
            }))}
            searchLabel="搜索标签"
            selectedPublicIds={previewTagPublicIds}
            onChange={(tagPublicIds) =>
              setFormValues({
                ...formValues,
                tagPublicIdsText: formatPublicIdList(tagPublicIds),
              })
            }
          />
        </div>
        <QuestionBindingPreview
          bindingOptions={bindingOptions}
          knowledgeNodePublicIds={previewKnowledgeNodePublicIds}
          materialPublicId={previewMaterialPublicId}
          tagPublicIds={previewTagPublicIds}
        />
      </fieldset>
      <label className="grid gap-2 text-sm font-medium">
        <span className="text-text-secondary">
          题干
          <span className="text-text-muted ml-2 font-normal">
            {formValues.stemRichText.length}/{MAX_QUESTION_RICH_TEXT_LENGTH}
          </span>
        </span>
        <textarea
          aria-label="题干"
          aria-describedby={
            readFieldError(formIssues, "stemRichText") === null
              ? undefined
              : "question-stem-error"
          }
          aria-invalid={readFieldError(formIssues, "stemRichText") !== null}
          className="border-input focus-visible:border-ring focus-visible:ring-ring/50 bg-surface min-h-20 rounded-lg border px-3 py-2 text-sm outline-none focus-visible:ring-3"
          data-field="stemRichText"
          placeholder="输入题干；可使用下方工具插入受管图片或表格"
          value={formValues.stemRichText}
          onChange={(event) =>
            setFormValues({
              ...formValues,
              stemRichText: event.target.value,
            })
          }
        />
        <FieldError
          id="question-stem-error"
          message={readFieldError(formIssues, "stemRichText")}
        />
        {stemLengthExceeded ? (
          <span className="text-destructive text-xs">
            题干超过 10000 字符，不能保存。
          </span>
        ) : null}
      </label>
      <label className="grid gap-2 text-sm font-medium">
        <span className="text-text-secondary">标准答案</span>
        <Input
          aria-label="标准答案"
          aria-describedby={
            readFieldError(formIssues, "standardAnswerRichText") === null
              ? undefined
              : "question-answer-error"
          }
          aria-invalid={
            readFieldError(formIssues, "standardAnswerRichText") !== null
          }
          data-field="standardAnswerRichText"
          placeholder="客观题填选项标号；主观题填参考答案"
          value={formValues.standardAnswerRichText}
          onChange={(event) =>
            setFormValues({
              ...formValues,
              questionOptions:
                formValues.questionType === "true_false"
                  ? formValues.questionOptions.map((questionOption) => ({
                      ...questionOption,
                      isCorrect:
                        questionOption.label ===
                        event.target.value.trim().toUpperCase(),
                    }))
                  : formValues.questionOptions,
              standardAnswerRichText: event.target.value,
            })
          }
        />
        <FieldError
          id="question-answer-error"
          message={readFieldError(formIssues, "standardAnswerRichText")}
        />
      </label>
      <label className="grid gap-2 text-sm font-medium">
        <span className="text-text-secondary">
          老师解析
          <span className="text-text-muted ml-2 font-normal">
            {formValues.analysisRichText.length}/{MAX_QUESTION_RICH_TEXT_LENGTH}
          </span>
        </span>
        <textarea
          aria-label="老师解析"
          aria-describedby={
            readFieldError(formIssues, "analysisRichText") === null
              ? undefined
              : "question-analysis-error"
          }
          aria-invalid={readFieldError(formIssues, "analysisRichText") !== null}
          className="border-input focus-visible:border-ring focus-visible:ring-ring/50 bg-surface min-h-20 rounded-lg border px-3 py-2 text-sm outline-none focus-visible:ring-3"
          data-field="analysisRichText"
          placeholder="输入面向老师的解析"
          value={formValues.analysisRichText}
          onChange={(event) =>
            setFormValues({
              ...formValues,
              analysisRichText: event.target.value,
            })
          }
        />
        <FieldError
          id="question-analysis-error"
          message={readFieldError(formIssues, "analysisRichText")}
        />
        {analysisLengthExceeded ? (
          <span className="text-destructive text-xs">
            解析超过 10000 字符，不能保存。
          </span>
        ) : null}
      </label>
      <div className="flex flex-wrap gap-2" aria-label="富文本辅助工具">
        <Button
          type="button"
          variant="outline"
          onClick={() =>
            setFormValues({
              ...formValues,
              stemRichText: `${formValues.stemRichText}\n\n${createManagedPaperAssetImageMarkup(
                managedMediaReferences.question,
              )}`,
            })
          }
        >
          插入受管图片引用
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() =>
            setFormValues({
              ...formValues,
              stemRichText: `${formValues.stemRichText}\n\n<table><tr><th></th><th></th></tr><tr><td></td><td></td></tr></table>`,
            })
          }
        >
          插入表格模板
        </Button>
      </div>
      <p className="text-text-muted text-xs leading-5">
        图片 helper 仅插入本地 paper_asset metadata 引用，不写入 object key、OCR
        文本或完整文件内容。
      </p>
      {isOptionQuestion ? (
        <fieldset
          aria-describedby={
            readFieldError(formIssues, "questionOptions") === null
              ? undefined
              : "question-options-error"
          }
          aria-invalid={readFieldError(formIssues, "questionOptions") !== null}
          className="border-border grid gap-3 rounded-md border p-3"
          data-field="questionOptions"
          tabIndex={-1}
        >
          <legend className="text-text-secondary px-1 text-sm font-medium">
            选项
          </legend>
          <p className="text-text-muted text-xs">
            至少填写两个内容非空、标号唯一的选项，并让正确项与标准答案一致。
          </p>
          <div className="grid gap-3 md:grid-cols-2">
            {formValues.questionOptions.map((questionOption, optionIndex) => (
              <div className="grid gap-2" key={questionOption.label}>
                <label className="grid gap-2 text-sm font-medium">
                  <span className="text-text-secondary">
                    选项 {questionOption.label}
                  </span>
                  <Input
                    aria-label={`选项 ${questionOption.label}`}
                    value={questionOption.contentRichText}
                    onChange={(event) =>
                      setFormValues({
                        ...formValues,
                        questionOptions: formValues.questionOptions.map(
                          (currentOption, currentIndex) =>
                            currentIndex === optionIndex
                              ? {
                                  ...currentOption,
                                  contentRichText: event.target.value,
                                }
                              : currentOption,
                        ),
                      })
                    }
                  />
                </label>
                <label className="text-text-secondary flex items-center gap-2 text-sm">
                  <input
                    aria-label={`选项 ${questionOption.label} 正确`}
                    checked={questionOption.isCorrect}
                    type="checkbox"
                    onChange={(event) =>
                      setFormValues({
                        ...formValues,
                        questionOptions: formValues.questionOptions.map(
                          (currentOption, currentIndex) =>
                            formValues.questionType === "single_choice"
                              ? {
                                  ...currentOption,
                                  isCorrect:
                                    currentIndex === optionIndex
                                      ? event.target.checked
                                      : false,
                                }
                              : currentIndex === optionIndex
                                ? {
                                    ...currentOption,
                                    isCorrect: event.target.checked,
                                  }
                                : currentOption,
                        ),
                      })
                    }
                  />
                  正确答案
                </label>
              </div>
            ))}
          </div>
          {formValues.questionType === "true_false" ? null : (
            <div className="flex flex-wrap gap-2">
              {formValues.questionOptions.length <
              questionOptionLabels.length ? (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    const nextLabel =
                      questionOptionLabels[formValues.questionOptions.length];
                    if (nextLabel === undefined) {
                      return;
                    }
                    setFormValues({
                      ...formValues,
                      questionOptions: [
                        ...formValues.questionOptions,
                        {
                          contentRichText: "",
                          isCorrect: false,
                          label: nextLabel,
                        },
                      ],
                    });
                  }}
                >
                  添加选项
                </Button>
              ) : null}
              {formValues.questionOptions.length > 2 ? (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    const remainingOptions = formValues.questionOptions.slice(
                      0,
                      -1,
                    );
                    setFormValues({
                      ...formValues,
                      questionOptions: remainingOptions,
                      standardAnswerRichText: remainingOptions
                        .filter((questionOption) => questionOption.isCorrect)
                        .map((questionOption) => questionOption.label)
                        .join(","),
                    });
                  }}
                >
                  删除最后选项
                </Button>
              ) : null}
            </div>
          )}
          <FieldError
            id="question-options-error"
            message={readFieldError(formIssues, "questionOptions")}
          />
        </fieldset>
      ) : (
        <fieldset
          aria-describedby={
            readFieldError(formIssues, "scoringPoints") === null
              ? undefined
              : "question-scoring-points-error"
          }
          aria-invalid={readFieldError(formIssues, "scoringPoints") !== null}
          className="border-border grid gap-3 rounded-md border p-3"
          data-field="scoringPoints"
          tabIndex={-1}
        >
          <legend className="text-text-secondary px-1 text-sm font-medium">
            评分点
          </legend>
          <p className="text-text-muted text-xs">
            当前题型需要评分点时，描述必填，分值必须为正数且以 0.5 为粒度。
          </p>
          {formValues.scoringPoints.map((scoringPoint, pointIndex) => (
            <div
              className="grid gap-3 md:grid-cols-[minmax(0,1fr)_8rem]"
              key={`scoring-point-${pointIndex + 1}`}
            >
              <label className="grid gap-2 text-sm font-medium">
                <span className="text-text-secondary">
                  评分点 {pointIndex + 1}
                </span>
                <Input
                  aria-label={`评分点 ${pointIndex + 1}`}
                  value={scoringPoint.description}
                  onChange={(event) =>
                    setFormValues({
                      ...formValues,
                      scoringPoints: formValues.scoringPoints.map(
                        (currentPoint, currentIndex) =>
                          currentIndex === pointIndex
                            ? {
                                ...currentPoint,
                                description: event.target.value,
                              }
                            : currentPoint,
                      ),
                    })
                  }
                />
              </label>
              <label className="grid gap-2 text-sm font-medium">
                <span className="text-text-secondary">分值</span>
                <Input
                  aria-label={`评分点 ${pointIndex + 1} 分值`}
                  value={scoringPoint.score}
                  onChange={(event) =>
                    setFormValues({
                      ...formValues,
                      scoringPoints: formValues.scoringPoints.map(
                        (currentPoint, currentIndex) =>
                          currentIndex === pointIndex
                            ? {
                                ...currentPoint,
                                score: event.target.value,
                              }
                            : currentPoint,
                      ),
                    })
                  }
                />
              </label>
            </div>
          ))}
          <FieldError
            id="question-scoring-points-error"
            message={readFieldError(formIssues, "scoringPoints")}
          />
        </fieldset>
      )}
      {formValues.questionType === "fill_blank" ? (
        <fieldset
          aria-describedby={
            readFieldError(formIssues, "fillBlankAnswers") === null
              ? undefined
              : "question-fill-blank-error"
          }
          aria-invalid={readFieldError(formIssues, "fillBlankAnswers") !== null}
          className="border-border grid gap-3 rounded-md border p-3"
          data-field="fillBlankAnswers"
          tabIndex={-1}
        >
          <legend className="text-text-secondary px-1 text-sm font-medium">
            自动匹配答案
          </legend>
          <p className="text-text-muted text-xs">
            每空一行；同一空的可接受答案使用竖线分隔。切换评分方式不会清除已录入答案。
          </p>
          {formValues.fillBlankAnswers.map((fillBlankAnswer, blankIndex) => (
            <div
              className="grid gap-3 md:grid-cols-[minmax(0,1fr)_8rem]"
              key={`fill-blank-${blankIndex + 1}`}
            >
              <label className="grid gap-2 text-sm font-medium">
                <span className="text-text-secondary">
                  第 {blankIndex + 1} 空答案
                </span>
                <Input
                  aria-label={`第 ${blankIndex + 1} 空答案`}
                  value={fillBlankAnswer.standardAnswersText}
                  onChange={(event) =>
                    setFormValues({
                      ...formValues,
                      fillBlankAnswers: formValues.fillBlankAnswers.map(
                        (currentAnswer, currentIndex) =>
                          currentIndex === blankIndex
                            ? {
                                ...currentAnswer,
                                standardAnswersText: event.target.value,
                              }
                            : currentAnswer,
                      ),
                    })
                  }
                />
              </label>
              <label className="grid gap-2 text-sm font-medium">
                <span className="text-text-secondary">分值</span>
                <Input
                  aria-label={`第 ${blankIndex + 1} 空分值`}
                  value={fillBlankAnswer.score}
                  onChange={(event) =>
                    setFormValues({
                      ...formValues,
                      fillBlankAnswers: formValues.fillBlankAnswers.map(
                        (currentAnswer, currentIndex) =>
                          currentIndex === blankIndex
                            ? { ...currentAnswer, score: event.target.value }
                            : currentAnswer,
                      ),
                    })
                  }
                />
              </label>
            </div>
          ))}
          <FieldError
            id="question-fill-blank-error"
            message={readFieldError(formIssues, "fillBlankAnswers")}
          />
        </fieldset>
      ) : null}
      <div className="flex flex-wrap gap-2">
        <Button
          aria-describedby={
            disabledReason === null ? undefined : disabledReasonId
          }
          disabled={disabledReason !== null}
          type="submit"
        >
          {isSubmitting ? "保存中…" : submitLabel}
        </Button>
        {isFormInvalid ? (
          <p className="text-destructive text-xs">
            富文本长度超出限制，请修正后保存。
          </p>
        ) : null}
        <Button type="button" variant="outline" onClick={onCancel}>
          取消
        </Button>
        <AdminFormDisabledReason
          id={disabledReasonId}
          reason={disabledReason}
        />
      </div>
    </form>
  );
}

function QuestionBindingPreview({
  bindingOptions,
  knowledgeNodePublicIds,
  materialPublicId,
  tagPublicIds,
}: {
  bindingOptions: QuestionBindingOptions;
  knowledgeNodePublicIds: string[];
  materialPublicId: string | null;
  tagPublicIds: string[];
}) {
  return (
    <div
      className="border-border grid gap-1 border-t pt-3 text-xs leading-5"
      data-testid="question-binding-preview"
    >
      <p className="text-text-secondary">
        关联材料：
        {materialPublicId === null
          ? "无"
          : (bindingOptions.materials.find(
              (material) => material.publicId === materialPublicId,
            )?.title ?? "绑定项不可用")}
      </p>
      <p className="text-text-secondary">
        知识点：{knowledgeNodePublicIds.length} 个{" "}
        {formatBindingOptionNames(
          knowledgeNodePublicIds,
          bindingOptions.knowledgeNodes.map((knowledgeNode) => ({
            label: knowledgeNode.pathName || knowledgeNode.name,
            publicId: knowledgeNode.publicId,
          })),
        )}
      </p>
      <p className="text-text-secondary">
        标签：{tagPublicIds.length} 个{" "}
        {formatBindingOptionNames(
          tagPublicIds,
          bindingOptions.tags.map((tag) => ({
            label: tag.name,
            publicId: tag.publicId,
          })),
        )}
      </p>
    </div>
  );
}

type BusinessBindingOption = {
  label: string;
  publicId: string;
};

function BusinessBindingSelector({
  label,
  options,
  searchLabel,
  selectedPublicIds,
  onChange,
}: {
  label: string;
  options: BusinessBindingOption[];
  searchLabel: string;
  selectedPublicIds: string[];
  onChange: (publicIds: string[]) => void;
}) {
  const [keyword, setKeyword] = useState("");
  const normalizedKeyword = keyword.trim().toLocaleLowerCase();
  const displayedOptions = options.filter((bindingOption) =>
    bindingOption.label.toLocaleLowerCase().includes(normalizedKeyword),
  );
  const unavailableCount = selectedPublicIds.filter(
    (publicId) =>
      !options.some((bindingOption) => bindingOption.publicId === publicId),
  ).length;

  return (
    <fieldset className="border-border grid gap-2 rounded-md border p-3">
      <legend className="text-text-secondary px-1 text-sm font-medium">
        {label}
      </legend>
      <Input
        aria-label={searchLabel}
        placeholder={`搜索${label}名称`}
        value={keyword}
        onChange={(event) => setKeyword(event.target.value)}
      />
      {unavailableCount === 0 ? null : (
        <p className="text-destructive text-xs">
          {unavailableCount} 个现有绑定项不可用
        </p>
      )}
      <div className="max-h-36 space-y-2 overflow-y-auto">
        {displayedOptions.length === 0 ? (
          <p className="text-text-muted text-xs">没有匹配的可用选项</p>
        ) : (
          displayedOptions.map((bindingOption) => (
            <label
              className="flex items-start gap-2 text-sm"
              key={bindingOption.publicId}
            >
              <input
                checked={selectedPublicIds.includes(bindingOption.publicId)}
                className="mt-0.5 size-4"
                type="checkbox"
                onChange={(event) =>
                  onChange(
                    event.target.checked
                      ? [...selectedPublicIds, bindingOption.publicId]
                      : selectedPublicIds.filter(
                          (publicId) => publicId !== bindingOption.publicId,
                        ),
                  )
                }
              />
              <span>{bindingOption.label}</span>
            </label>
          ))
        )}
      </div>
    </fieldset>
  );
}

function formatBindingOptionNames(
  publicIds: string[],
  options: BusinessBindingOption[],
): string {
  if (publicIds.length === 0) {
    return "无";
  }

  return publicIds
    .map(
      (publicId) =>
        options.find((bindingOption) => bindingOption.publicId === publicId)
          ?.label ?? "绑定项不可用",
    )
    .join("、");
}

function QuestionFormSelect({
  disabled = false,
  error = null,
  fieldName,
  label,
  options,
  value,
  onChange,
}: {
  disabled?: boolean;
  error?: string | null;
  fieldName?: string;
  label: string;
  options: [string, string][];
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="grid gap-2 text-sm font-medium">
      <span className="text-text-secondary">{label}</span>
      <select
        aria-label={label}
        aria-describedby={
          error === null || fieldName === undefined
            ? undefined
            : `${fieldName}-error`
        }
        aria-invalid={error !== null}
        className="border-input focus-visible:border-ring focus-visible:ring-ring/50 bg-surface h-9 rounded-lg border px-3 py-1 text-sm outline-none focus-visible:ring-3"
        data-field={fieldName}
        disabled={disabled}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        <option value="">请选择{label}</option>
        {options.map(([optionValue, optionLabel]) => (
          <option key={optionValue} value={optionValue}>
            {optionLabel}
          </option>
        ))}
      </select>
      <FieldError id={`${fieldName ?? label}-error`} message={error} />
    </label>
  );
}

export function AdminMaterialEditorForm({
  isSubmitting,
  mode,
  submitBlockedReason = null,
  values,
  onCancel,
  onDirtyStateChange,
  onSubmit,
}: {
  isSubmitting: boolean;
  mode: MaterialFormMode;
  submitBlockedReason?: string | null;
  values: MaterialFormValues;
  onCancel: () => void;
  onDirtyStateChange?: (isDirty: boolean) => void;
  onSubmit: (values: MaterialFormValues) => void;
}) {
  const [formValues, setFormValues] = useState(values);
  const [formIssues, setFormIssues] = useState<ContentIntegrityIssue[]>([]);
  const formRef = useRef<HTMLFormElement>(null);
  const [initialValuesFingerprint] = useState(() => JSON.stringify(values));
  const disabledReasonId = useId();
  const dirtyState = getAdminFormDirtyState(
    initialValuesFingerprint,
    JSON.stringify(formValues),
  );
  const materialLengthExceeded =
    formValues.contentRichText.length > MAX_MATERIAL_RICH_TEXT_LENGTH;
  const disabledReason = isSubmitting
    ? "正在保存，请勿重复提交。"
    : submitBlockedReason;

  useEffect(() => {
    onDirtyStateChange?.(dirtyState.status === "dirty");
  }, [dirtyState.status, onDirtyStateChange]);

  return (
    <form
      aria-label="材料表单"
      className="bg-surface border-border grid gap-4 rounded-md border p-4 shadow-sm"
      data-admin-form-dirty-state={dirtyState.status}
      ref={formRef}
      onSubmit={(event) => {
        event.preventDefault();
        const integrityIssues = getMaterialIntegrityIssues(formValues);
        setFormIssues(integrityIssues);
        if (integrityIssues.length > 0) {
          if (formRef.current !== null) {
            focusFirstAdminFormIssue(formRef.current, integrityIssues);
          }
          return;
        }
        onSubmit(formValues);
      }}
    >
      <h2 className="text-text-primary text-base font-semibold">
        {mode === "create" ? "新建材料" : "编辑材料"}
      </h2>
      <p className="text-text-secondary text-xs leading-5">
        材料标题、专业、等级、科目和正文均为必填；正文需包含有效文本或具备可访问描述的受管图片。
      </p>
      <FormErrorSummary issues={formIssues} />
      <label className="grid gap-2 text-sm font-medium">
        <span className="text-text-secondary">材料标题</span>
        <Input
          aria-label="材料标题"
          aria-describedby={
            readFieldError(formIssues, "title") === null
              ? undefined
              : "material-title-error"
          }
          aria-invalid={readFieldError(formIssues, "title") !== null}
          data-field="title"
          placeholder="输入便于检索和复用的材料标题"
          value={formValues.title}
          onChange={(event) =>
            setFormValues({
              ...formValues,
              title: event.target.value,
            })
          }
        />
        <FieldError
          id="material-title-error"
          message={readFieldError(formIssues, "title")}
        />
      </label>
      <div className="grid gap-3 md:grid-cols-3">
        <QuestionFormSelect
          error={readFieldError(formIssues, "profession")}
          fieldName="profession"
          label="专业"
          options={Object.entries(professionLabels)}
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
            aria-describedby={
              readFieldError(formIssues, "level") === null
                ? undefined
                : "material-level-error"
            }
            aria-invalid={readFieldError(formIssues, "level") !== null}
            data-field="level"
            min={1}
            type="number"
            value={formValues.level}
            onChange={(event) =>
              setFormValues({
                ...formValues,
                level: event.target.value,
              })
            }
          />
          <FieldError
            id="material-level-error"
            message={readFieldError(formIssues, "level")}
          />
        </label>
        <QuestionFormSelect
          error={readFieldError(formIssues, "subject")}
          fieldName="subject"
          label="科目"
          options={Object.entries(subjectLabels)}
          value={formValues.subject}
          onChange={(value) =>
            setFormValues({
              ...formValues,
              subject: value as Subject,
            })
          }
        />
      </div>
      <label className="grid gap-2 text-sm font-medium">
        <span className="text-text-secondary">
          材料正文
          <span className="text-text-muted ml-2 font-normal">
            {formValues.contentRichText.length}/{MAX_MATERIAL_RICH_TEXT_LENGTH}
          </span>
        </span>
        <textarea
          aria-label="材料正文"
          aria-describedby={
            readFieldError(formIssues, "contentRichText") === null
              ? undefined
              : "material-content-error"
          }
          aria-invalid={readFieldError(formIssues, "contentRichText") !== null}
          className="border-input focus-visible:border-ring focus-visible:ring-ring/50 bg-surface min-h-24 rounded-lg border px-3 py-2 text-sm outline-none focus-visible:ring-3"
          data-field="contentRichText"
          placeholder="输入材料正文；可使用下方工具插入受管图片或表格"
          value={formValues.contentRichText}
          onChange={(event) =>
            setFormValues({
              ...formValues,
              contentRichText: event.target.value,
            })
          }
        />
        <FieldError
          id="material-content-error"
          message={readFieldError(formIssues, "contentRichText")}
        />
        {materialLengthExceeded ? (
          <span className="text-destructive text-xs">
            材料正文超过 30000 字符，不能保存。
          </span>
        ) : null}
      </label>
      <div className="flex flex-wrap gap-2" aria-label="材料富文本辅助工具">
        <Button
          type="button"
          variant="outline"
          onClick={() =>
            setFormValues({
              ...formValues,
              contentRichText: `${formValues.contentRichText}\n\n${createManagedPaperAssetImageMarkup(
                managedMediaReferences.material,
              )}`,
            })
          }
        >
          插入受管图片引用
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() =>
            setFormValues({
              ...formValues,
              contentRichText: `${formValues.contentRichText}\n\n<table><tr><th></th><th></th></tr><tr><td></td><td></td></tr></table>`,
            })
          }
        >
          插入表格模板
        </Button>
      </div>
      <p className="text-text-muted text-xs leading-5">
        图片 helper 仅插入本地 paper_asset metadata 引用，不写入 object key、OCR
        文本或完整文件内容。
      </p>
      <div className="flex flex-wrap gap-2">
        <Button
          aria-describedby={
            disabledReason === null ? undefined : disabledReasonId
          }
          disabled={disabledReason !== null}
          type="submit"
        >
          {isSubmitting ? "保存中…" : "保存材料"}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          取消
        </Button>
        <AdminFormDisabledReason
          id={disabledReasonId}
          reason={disabledReason}
        />
      </div>
    </form>
  );
}

function FilterPanel({
  activeView,
  bindingOptions,
  keyword,
  knowledgeNodeFilter,
  levelFilter,
  pageSize,
  profession,
  questionType,
  sortOrder,
  status,
  subject,
  tagFilter,
  total,
  onKeywordChange,
  onKnowledgeNodeFilterChange,
  onLevelFilterChange,
  onPageSizeChange,
  onProfessionChange,
  onQuestionTypeChange,
  onReset,
  onSort,
  onStatusChange,
  onSubjectChange,
  onTagFilterChange,
}: {
  activeView: ViewMode;
  bindingOptions: QuestionBindingOptions;
  keyword: string;
  knowledgeNodeFilter: string;
  levelFilter: string;
  pageSize: number;
  profession: ProfessionFilter;
  questionType: QuestionTypeFilter;
  sortOrder: AdminCommonSortOrder;
  status: StatusFilter;
  subject: SubjectFilter;
  tagFilter: string;
  total: number;
  onKeywordChange: (value: string) => void;
  onKnowledgeNodeFilterChange: (value: string) => void;
  onLevelFilterChange: (value: string) => void;
  onPageSizeChange: (value: string) => void;
  onProfessionChange: (value: ProfessionFilter) => void;
  onQuestionTypeChange: (value: QuestionTypeFilter) => void;
  onReset: () => void;
  onSort: () => void;
  onStatusChange: (value: StatusFilter) => void;
  onSubjectChange: (value: SubjectFilter) => void;
  onTagFilterChange: (value: string) => void;
}) {
  const itemLabel = activeView === "questions" ? "道题目" : "份材料";

  return (
    <AdminListToolbar
      description="按内容范围和状态缩小结果；筛选变化后从第一页重新查询。"
      resultLabel={`共 ${total} ${itemLabel}`}
      title={activeView === "questions" ? "题目筛选" : "材料筛选"}
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
            placeholder="题干、材料、知识点或标签名称"
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
      {activeView === "questions" ? (
        <FilterSelect
          label="题型"
          options={[["all", "全部题型"], ...Object.entries(questionTypeLabels)]}
          value={questionType}
          onChange={(value) =>
            onQuestionTypeChange(value as QuestionTypeFilter)
          }
        />
      ) : null}
      <FilterSelect
        label="状态"
        options={[
          ["all", "全部状态"],
          ["available", "可用"],
          ["disabled", "已停用"],
        ]}
        value={status}
        onChange={(value) => onStatusChange(value as StatusFilter)}
      />
      {activeView === "questions" ? (
        <>
          <FilterSelect
            label="知识点筛选"
            options={[
              ["", "全部知识点"],
              ...(knowledgeNodeFilter !== "" &&
              !bindingOptions.knowledgeNodes.some(
                (knowledgeNode) =>
                  knowledgeNode.publicId === knowledgeNodeFilter,
              )
                ? [
                    [knowledgeNodeFilter, "指定知识点（名称不可用）"] as [
                      string,
                      string,
                    ],
                  ]
                : []),
              ...bindingOptions.knowledgeNodes.map(
                (knowledgeNode): [string, string] => [
                  knowledgeNode.publicId,
                  knowledgeNode.pathName || knowledgeNode.name,
                ],
              ),
            ]}
            value={knowledgeNodeFilter}
            onChange={onKnowledgeNodeFilterChange}
          />
          <FilterSelect
            label="标签筛选"
            options={[
              ["", "全部标签"],
              ...(tagFilter !== "" &&
              !bindingOptions.tags.some((tag) => tag.publicId === tagFilter)
                ? [[tagFilter, "指定标签（名称不可用）"] as [string, string]]
                : []),
              ...bindingOptions.tags.map((tag): [string, string] => [
                tag.publicId,
                tag.name,
              ]),
            ]}
            value={tagFilter}
            onChange={onTagFilterChange}
          />
        </>
      ) : null}
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

function QuestionList({
  editorRoutesEnabled,
  emptyTitle,
  recommendationByQuestionPublicId,
  rows,
  selectedPublicId,
  onCopy,
  onDisable,
  onEdit,
  onRecommend,
  onReviewRecommendation,
  onView,
}: {
  editorRoutesEnabled: boolean;
  emptyTitle: string;
  recommendationByQuestionPublicId: Record<
    string,
    KnowledgeRecommendationReviewState
  >;
  rows: QuestionDto[];
  selectedPublicId: string | null;
  onCopy: (question: QuestionDto) => Promise<QuestionDto | null>;
  onDisable: (question: QuestionDto) => void;
  onEdit: (question: QuestionDto, trigger: HTMLButtonElement) => void;
  onRecommend: (question: QuestionDto) => void;
  onReviewRecommendation: (
    questionPublicId: string,
    knowledgeNodePublicId: string,
    reviewStatus: RecommendationReviewStatus,
  ) => void;
  onView: (publicId: string) => void;
}) {
  return (
    <AdminTableFrame ariaLabel="题目列表" minWidthClassName="min-w-[72rem]">
      <div
        aria-label="题目列表"
        className="divide-border divide-y"
        role="table"
      >
        {rows.length === 0 ? <FilteredEmptyState title={emptyTitle} /> : null}
        {rows.map((question) => {
          const isSelected = question.publicId === selectedPublicId;
          const readableName = createQuestionReadableName(question);

          return (
            <article
              aria-current={isSelected ? "true" : undefined}
              className={`bg-surface border-border rounded-md border p-4 shadow-sm ${
                isSelected ? "ring-primary/60 bg-primary/5 ring-2" : ""
              }`}
              data-public-id={question.publicId}
              data-selected={String(isSelected)}
              data-testid={`question-row-${question.publicId}`}
              key={question.publicId}
              role="row"
            >
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <StatusBadge status={question.status} />
                    <span className="text-text-muted text-xs">
                      {questionTypeLabels[question.questionType]}
                    </span>
                    <span className="text-text-muted text-xs">
                      {formatScope(question)}
                    </span>
                  </div>
                  <h2 className="text-text-primary text-base font-semibold">
                    {readQuestionSummary(question)}
                  </h2>
                  <QuestionBindingSummary question={question} />
                  <QuestionLockSummary question={question} />
                </div>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <Button
                  aria-label={`查看题目 ${readableName}`}
                  size="sm"
                  type="button"
                  variant="secondary"
                  onClick={() => onView(question.publicId)}
                >
                  <Eye aria-hidden="true" data-icon="inline-start" />
                  查看题目
                </Button>
                {editorRoutesEnabled ? (
                  <QuestionRouteEditButton question={question} />
                ) : (
                  <Button
                    aria-label={`编辑题目 ${readableName}`}
                    data-testid={`question-edit-${question.publicId}`}
                    disabled={question.isLocked}
                    size="sm"
                    type="button"
                    variant="outline"
                    onClick={(event) => onEdit(question, event.currentTarget)}
                  >
                    <Pencil aria-hidden="true" data-icon="inline-start" />
                    编辑
                  </Button>
                )}
                {question.isLocked ? (
                  <span className="text-text-muted self-center text-xs">
                    已锁定题目只能复制新题后编辑
                  </span>
                ) : null}
                <Button
                  aria-label={`停用题目 ${readableName}`}
                  size="sm"
                  type="button"
                  variant="destructive"
                  onClick={() => onDisable(question)}
                >
                  <ShieldOff aria-hidden="true" data-icon="inline-start" />
                  停用
                </Button>
                {editorRoutesEnabled ? (
                  <QuestionCopyToEditorButton
                    question={question}
                    onCopy={onCopy}
                  />
                ) : (
                  <Button
                    aria-label={`复制题目 ${readableName}`}
                    size="sm"
                    type="button"
                    variant="secondary"
                    onClick={() => void onCopy(question)}
                  >
                    <Copy aria-hidden="true" data-icon="inline-start" />
                    复制
                  </Button>
                )}
                <Button
                  aria-label={`为题目 ${readableName} 推荐知识点`}
                  size="sm"
                  type="button"
                  variant="outline"
                  onClick={() => onRecommend(question)}
                >
                  <Sparkles aria-hidden="true" data-icon="inline-start" />
                  推荐知识点
                </Button>
              </div>
              <KnowledgeRecommendationReviewPanel
                question={question}
                reviewState={
                  recommendationByQuestionPublicId[question.publicId]
                }
                onReviewRecommendation={onReviewRecommendation}
              />
              <ReferenceBlock
                label="关联材料"
                value={question.materialPublicId === null ? "未关联" : "已关联"}
              />
            </article>
          );
        })}
      </div>
    </AdminTableFrame>
  );
}

function QuestionRouteEditButton({ question }: { question: QuestionDto }) {
  const router = useRouter();

  return (
    <Button
      aria-label={`编辑题目 ${createQuestionReadableName(question)}`}
      data-admin-editor-entry={`edit:${question.publicId}`}
      data-testid={`question-edit-${question.publicId}`}
      disabled={question.isLocked}
      size="sm"
      type="button"
      variant="outline"
      onClick={() =>
        router.push(
          createEditorEntryHref({
            initiatingControl: `edit:${question.publicId}`,
            publicId: question.publicId,
            resource: "questions",
          }),
        )
      }
    >
      <Pencil aria-hidden="true" data-icon="inline-start" />
      编辑
    </Button>
  );
}

function QuestionCopyToEditorButton({
  question,
  onCopy,
}: {
  question: QuestionDto;
  onCopy: (question: QuestionDto) => Promise<QuestionDto | null>;
}) {
  const router = useRouter();
  const [isCopying, setIsCopying] = useState(false);

  async function handleCopy() {
    if (isCopying) return;

    setIsCopying(true);
    try {
      const copiedQuestion = await onCopy(question);
      if (copiedQuestion !== null) {
        router.push(
          createEditorEntryHref({
            initiatingControl: `edit:${question.publicId}`,
            publicId: copiedQuestion.publicId,
            resource: "questions",
          }),
        );
      }
    } finally {
      setIsCopying(false);
    }
  }

  return (
    <Button
      aria-label={`复制题目 ${createQuestionReadableName(question)}`}
      disabled={isCopying}
      size="sm"
      type="button"
      variant="secondary"
      onClick={() => void handleCopy()}
    >
      <Copy aria-hidden="true" data-icon="inline-start" />
      {isCopying ? "复制中…" : "复制"}
    </Button>
  );
}

function QuestionBindingSummary({ question }: { question: QuestionDto }) {
  return (
    <div
      className="grid gap-1 text-xs leading-5"
      data-testid={`question-binding-${question.publicId}`}
    >
      <p className="text-text-secondary">
        关联材料：{question.materialPublicId === null ? "无" : "1 份"}
      </p>
      <p className="text-text-secondary">
        知识点：{question.knowledgeNodePublicIds.length} 个
      </p>
      <p className="text-text-secondary">
        标签：{question.tagPublicIds.length} 个
      </p>
    </div>
  );
}

function QuestionLockSummary({ question }: { question: QuestionDto }) {
  return (
    <div
      className="grid gap-1 text-xs leading-5"
      data-testid={`question-lock-${question.publicId}`}
    >
      <p className="text-text-secondary">
        状态：{question.isLocked ? "已被已发布试卷引用锁定" : "可编辑"}
      </p>
      <p className="text-text-secondary">
        锁定时间：{question.lockedAt ?? "无"}
      </p>
    </div>
  );
}

function KnowledgeRecommendationReviewPanel({
  question,
  reviewState,
  onReviewRecommendation,
}: {
  question: QuestionDto;
  reviewState: KnowledgeRecommendationReviewState | undefined;
  onReviewRecommendation: (
    questionPublicId: string,
    knowledgeNodePublicId: string,
    reviewStatus: RecommendationReviewStatus,
  ) => void;
}) {
  if (reviewState === undefined) {
    return null;
  }

  const isStale =
    reviewState.recommendation.reviewState.questionUpdatedAt !==
    question.updatedAt;
  const reviewStatuses = reviewState.recommendation.recommendations.map(
    (recommendation) => recommendation.confirmationStatus,
  );
  const acceptedCount = reviewStatuses.filter(
    (reviewStatus) => reviewStatus === "confirmed",
  ).length;
  const discardedCount = reviewStatuses.filter(
    (reviewStatus) => reviewStatus === "ignored",
  ).length;
  const pendingCount =
    reviewState.recommendation.recommendations.length -
    acceptedCount -
    discardedCount;
  const reviewedRecommendations =
    reviewState.recommendation.recommendations.filter(
      (recommendation) =>
        recommendation.confirmationStatus === "confirmed" ||
        recommendation.confirmationStatus === "ignored",
    );

  return (
    <section
      className="border-border bg-muted/30 mt-4 rounded-md border p-3"
      data-stale={String(isStale)}
      data-testid={`knowledge-recommendation-panel-${question.publicId}`}
    >
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-text-primary text-sm font-semibold">
            知识点推荐审查
          </h3>
          <p className="text-text-secondary text-xs leading-5">
            {isStale
              ? "已过期：题目在推荐后发生更新"
              : reviewState.recommendation.reviewState.taskStatus ===
                    "pending" ||
                  reviewState.recommendation.reviewState.taskStatus ===
                    "running"
                ? "推荐任务处理中"
                : "当前推荐待确认"}
          </p>
        </div>
        <span className="bg-secondary text-secondary-foreground rounded-md px-2 py-1 text-xs">
          持久化题目绑定
        </span>
      </div>
      <div
        className="text-text-secondary mt-3 grid gap-1 text-xs leading-5"
        data-testid={`knowledge-recommendation-review-summary-${question.publicId}`}
      >
        <p>目标题目：{createQuestionReadableName(question)}</p>
        <p>
          已采纳：{acceptedCount} | 已丢弃：{discardedCount} | 待确认：{" "}
          {pendingCount}
        </p>
        <p>
          推荐快照：
          {reviewState.recommendation.reviewState.questionUpdatedAt}
        </p>
      </div>
      <ul
        className="text-text-secondary mt-3 grid gap-1 text-xs leading-5"
        data-testid={`knowledge-recommendation-review-trace-${question.publicId}`}
      >
        {reviewedRecommendations.length === 0 ? (
          <li>暂无持久化审查操作</li>
        ) : (
          reviewedRecommendations.map((reviewedRecommendation) => (
            <li key={reviewedRecommendation.knowledgeNodePublicId}>
              {reviewedRecommendation.confirmationStatus === "confirmed"
                ? recommendationReviewStatusLabels.accepted
                : recommendationReviewStatusLabels.discarded}{" "}
              {reviewedRecommendation.name.trim() || "不可用推荐项"} ·
              已持久化审查
            </li>
          ))
        )}
      </ul>

      {reviewState.recommendation.recommendations.length === 0 ? (
        <p className="text-text-secondary mt-3 text-sm">
          本次没有可审查的推荐结果。
        </p>
      ) : (
        <div className="mt-3 grid gap-2">
          {reviewState.recommendation.recommendations.map((recommendation) => {
            const reviewStatus = recommendation.confirmationStatus;
            const isReviewPending = reviewStatus === "pending_confirmation";
            const isReadableRecommendation =
              recommendation.name.trim().length > 0 &&
              recommendation.pathName.trim().length > 0;
            const recommendationName = isReadableRecommendation
              ? recommendation.name
              : "推荐项不可用";

            return (
              <article
                className="bg-surface border-border rounded-md border p-3"
                data-review-status={reviewStatus}
                data-testid={`knowledge-recommendation-row-${recommendation.knowledgeNodePublicId}`}
                key={recommendation.knowledgeNodePublicId}
              >
                <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="bg-secondary text-secondary-foreground rounded-md px-2 py-1 text-xs font-medium">
                        {recommendation.confidence}
                      </span>
                      <span className="text-text-muted text-xs">
                        {recommendationConfirmationStatusLabels[reviewStatus] ??
                          reviewStatus}
                      </span>
                    </div>
                    <p className="text-text-primary text-sm font-medium">
                      {recommendationName}
                    </p>
                    <p className="text-text-secondary text-xs leading-5">
                      {isReadableRecommendation
                        ? recommendation.pathName
                        : "缺少知识点名称或完整路径，不能审查。"}
                    </p>
                    <p className="text-text-secondary text-xs leading-5">
                      {recommendation.reason}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      aria-label={`采纳推荐 ${recommendationName}`}
                      disabled={!isReadableRecommendation || !isReviewPending}
                      size="sm"
                      type="button"
                      variant="secondary"
                      onClick={() =>
                        onReviewRecommendation(
                          question.publicId,
                          recommendation.knowledgeNodePublicId,
                          "accepted",
                        )
                      }
                    >
                      <Check aria-hidden="true" data-icon="inline-start" />
                      采纳此项并结束
                    </Button>
                    <Button
                      aria-label={`丢弃推荐 ${recommendationName}`}
                      disabled={!isReadableRecommendation || !isReviewPending}
                      size="sm"
                      type="button"
                      variant="outline"
                      onClick={() =>
                        onReviewRecommendation(
                          question.publicId,
                          recommendation.knowledgeNodePublicId,
                          "discarded",
                        )
                      }
                    >
                      <Ban aria-hidden="true" data-icon="inline-start" />
                      丢弃
                    </Button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}

function MaterialListWithEditorRoutes({
  emptyTitle,
  onCopy,
  onDisable,
  onView,
  rows,
  selectedPublicId,
}: {
  emptyTitle: string;
  onCopy: (material: MaterialDto) => Promise<MaterialDto | null>;
  onDisable: (material: MaterialDto) => void;
  onView: (publicId: string) => void;
  rows: MaterialDto[];
  selectedPublicId: string | null;
}) {
  const router = useRouter();

  return (
    <MaterialList
      emptyTitle={emptyTitle}
      rows={rows}
      selectedPublicId={selectedPublicId}
      onCopy={(material) => {
        void (async () => {
          const copiedMaterial = await onCopy(material);
          if (copiedMaterial !== null) {
            router.replace(
              createEditorEntryHref({
                initiatingControl: `edit:${material.publicId}`,
                publicId: copiedMaterial.publicId,
                resource: "materials",
              }),
            );
          }
        })();
      }}
      onDisable={onDisable}
      onEdit={(material) =>
        router.push(
          createEditorEntryHref({
            initiatingControl: `edit:${material.publicId}`,
            publicId: material.publicId,
            resource: "materials",
          }),
        )
      }
      onView={onView}
    />
  );
}

function MaterialList({
  emptyTitle,
  rows,
  selectedPublicId,
  onCopy,
  onDisable,
  onEdit,
  onView,
}: {
  emptyTitle: string;
  rows: MaterialDto[];
  selectedPublicId: string | null;
  onCopy: (material: MaterialDto) => void;
  onDisable: (material: MaterialDto) => void;
  onEdit: (material: MaterialDto, trigger: HTMLButtonElement) => void;
  onView: (publicId: string) => void;
}) {
  return (
    <AdminTableFrame ariaLabel="材料列表" minWidthClassName="min-w-[72rem]">
      <div
        aria-label="材料列表"
        className="divide-border divide-y"
        role="table"
      >
        {rows.length === 0 ? <FilteredEmptyState title={emptyTitle} /> : null}
        {rows.map((material) => {
          const isSelected = material.publicId === selectedPublicId;
          const readableName = createMaterialReadableName(material);
          return (
            <article
              aria-current={isSelected ? "true" : undefined}
              className={`bg-surface border-border rounded-md border p-4 shadow-sm ${
                isSelected ? "ring-primary/60 bg-primary/5 ring-2" : ""
              }`}
              data-public-id={material.publicId}
              data-selected={String(isSelected)}
              data-testid={`material-row-${material.publicId}`}
              key={material.publicId}
              role="row"
            >
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <StatusBadge status={material.status} />
                    <span className="text-text-muted text-xs">
                      {formatScope(material)}
                    </span>
                  </div>
                  <h2 className="text-text-primary text-base font-semibold">
                    {material.title}
                  </h2>
                  <p className="text-text-secondary text-sm">
                    关联题目 {material.references.questions.length} 道，关联试卷{" "}
                    {material.references.papers.length} 套
                  </p>
                </div>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <Button
                  aria-label={`查看材料 ${readableName}`}
                  size="sm"
                  type="button"
                  variant="secondary"
                  onClick={() => onView(material.publicId)}
                >
                  <Eye aria-hidden="true" data-icon="inline-start" />
                  查看材料
                </Button>
                <Button
                  aria-label={`编辑材料 ${readableName}`}
                  data-admin-editor-entry={`edit:${material.publicId}`}
                  data-testid={`material-edit-${material.publicId}`}
                  disabled={material.isLocked}
                  size="sm"
                  type="button"
                  variant="outline"
                  onClick={(event) => onEdit(material, event.currentTarget)}
                >
                  <Pencil aria-hidden="true" data-icon="inline-start" />
                  编辑
                </Button>
                {material.isLocked ? (
                  <span className="text-text-muted self-center text-xs">
                    已锁定材料只能复制新材料后编辑
                  </span>
                ) : null}
                <Button
                  aria-label={`停用材料 ${readableName}`}
                  size="sm"
                  type="button"
                  variant="destructive"
                  onClick={() => onDisable(material)}
                >
                  <ShieldOff aria-hidden="true" data-icon="inline-start" />
                  停用
                </Button>
                <Button
                  aria-label={`复制材料 ${readableName}`}
                  size="sm"
                  type="button"
                  variant="secondary"
                  onClick={() => onCopy(material)}
                >
                  <Copy aria-hidden="true" data-icon="inline-start" />
                  复制
                </Button>
              </div>
              <MaterialLockSummary material={material} />
              <MaterialReferenceSummary material={material} />
              <ReferenceBlock
                label="材料锁定"
                value={material.isLocked ? "已被发布试卷锁定" : "未锁定"}
              />
            </article>
          );
        })}
      </div>
    </AdminTableFrame>
  );
}

function MaterialLockSummary({ material }: { material: MaterialDto }) {
  return (
    <div
      className="border-border mt-4 grid gap-1 border-t pt-4 text-xs leading-5"
      data-testid={`material-lock-${material.publicId}`}
    >
      <p className="text-text-secondary">
        状态：{material.isLocked ? "已被已发布试卷引用锁定" : "可编辑"}
      </p>
      <p className="text-text-secondary">
        锁定时间：{material.lockedAt ?? "无"}
      </p>
    </div>
  );
}

function MaterialReferenceSummary({ material }: { material: MaterialDto }) {
  return (
    <div
      className="border-border mt-4 grid gap-1 border-t pt-4 text-xs leading-5"
      data-testid={`material-reference-summary-${material.publicId}`}
    >
      <p className="text-text-secondary">
        题目引用数：{material.references.questions.length}
      </p>
      <p className="text-text-secondary">
        试卷引用数：{material.references.papers.length}
      </p>
      <p className="text-text-secondary">具体引用关系请在材料详情中查看。</p>
    </div>
  );
}

function StatusBadge({ status }: { status: QuestionStatus | MaterialStatus }) {
  return (
    <span className="bg-secondary text-secondary-foreground rounded-md px-2 py-1 text-xs font-medium">
      {statusLabels[status]}
    </span>
  );
}

function ReferenceBlock({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-border mt-4 border-t pt-4">
      <p className="text-text-muted mb-2 text-xs font-medium">{label}</p>
      <p className="text-text-secondary text-sm">{value}</p>
    </div>
  );
}

function FilteredEmptyState({ title }: { title: string }) {
  return (
    <div className="bg-surface border-border rounded-md border p-8 text-center shadow-sm">
      <p className="text-text-primary font-medium">{title}</p>
      <p className="text-text-secondary mt-2 text-sm">
        调整关键词或筛选条件后再试。
      </p>
    </div>
  );
}

function tabClassName(isActive: boolean) {
  const base =
    "inline-flex h-8 items-center gap-1.5 rounded-md px-3 text-sm font-medium transition-colors active:scale-[0.98]";

  if (isActive) {
    return `${base} bg-primary text-primary-foreground`;
  }

  return `${base} text-text-secondary hover:bg-muted hover:text-text-primary`;
}
