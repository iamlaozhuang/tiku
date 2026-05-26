"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ArrowDownUp,
  Ban,
  Check,
  Copy,
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
import type { AuthContextDto } from "@/server/contracts/auth-contract";
import type { MaterialDto } from "@/server/contracts/material-contract";
import type {
  QuestionDto,
  QuestionKnowledgeRecommendationResultDto,
} from "@/server/contracts/question-contract";
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
} from "../content-admin-runtime";

type ViewMode = "questions" | "materials";
type StatusFilter = "all" | QuestionStatus | MaterialStatus;
type ProfessionFilter = "all" | Profession;
type SubjectFilter = "all" | Subject;
type QuestionTypeFilter = "all" | QuestionType;
type QuestionFormMode = "create" | "edit";
type MaterialFormMode = "create" | "edit";
type RecommendationReviewStatus = "accepted" | "discarded";
type AdminCommonSortOrder = "asc" | "desc";
type QuestionKnowledgeRecommendationDto =
  QuestionKnowledgeRecommendationResultDto["recommendation"];

type ContentLoadState =
  | "loading"
  | "ready"
  | "empty"
  | "unauthorized"
  | "error";

export type AdminQuestionMaterialManagementProps = {
  defaultView?: ViewMode;
};

type QuestionFormValues = {
  stemRichText: string;
  analysisRichText: string;
  standardAnswerRichText: string;
  questionType: QuestionType;
  profession: Profession;
  level: string;
  subject: Subject;
  materialPublicId: string;
  multiChoiceRule: MultiChoiceRule;
  scoringMethod: ScoringMethod;
  questionOptions: QuestionOptionFormValue[];
  scoringPoints: ScoringPointFormValue[];
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

type MaterialFormValues = {
  title: string;
  contentRichText: string;
  profession: Profession;
  level: string;
  subject: Subject;
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
      publicId: string;
    }
  | {
      kind: "materialDisable";
      publicId: string;
    };

type KnowledgeRecommendationReviewState = {
  recommendation: QuestionKnowledgeRecommendationDto;
  reviewStatusByKnowledgeNodePublicId: Record<
    string,
    RecommendationReviewStatus
  >;
};

const statusLabels: Record<QuestionStatus | MaterialStatus, string> = {
  available: "可用",
  disabled: "已停用",
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
const MAX_QUESTION_RICH_TEXT_LENGTH = 10000;
const MAX_MATERIAL_RICH_TEXT_LENGTH = 30000;

function readQuestionSummary(question: QuestionDto): string {
  return stripRichText(question.stemRichText);
}

function stripRichText(value: string): string {
  return value.replace(/<[^>]*>/g, "").trim();
}

function createDefaultQuestionOptions(
  questionType: QuestionType,
): QuestionOptionFormValue[] {
  if (questionType === "true_false") {
    return [
      { contentRichText: "正确", isCorrect: true, label: "A" },
      { contentRichText: "错误", isCorrect: false, label: "B" },
    ];
  }

  return ["A", "B", "C", "D"].map((label, optionIndex) => ({
    contentRichText: label,
    isCorrect: questionType === "single_choice" && optionIndex === 0,
    label,
  }));
}

function createDefaultScoringPoints(): ScoringPointFormValue[] {
  return [{ description: "评分点", score: "1.0" }];
}

function createDefaultQuestionFormValues(): QuestionFormValues {
  return {
    analysisRichText: "老师解析",
    level: "3",
    materialPublicId: "",
    multiChoiceRule: "all_correct_only",
    profession: "monopoly",
    questionOptions: createDefaultQuestionOptions("single_choice"),
    questionType: "single_choice",
    scoringMethod: "auto_match",
    scoringPoints: createDefaultScoringPoints(),
    standardAnswerRichText: "A",
    stemRichText: "新建题目题干",
    subject: "theory",
  };
}

function createDefaultMaterialFormValues(): MaterialFormValues {
  return {
    contentRichText: "新建材料正文",
    level: "3",
    profession: "monopoly",
    subject: "skill",
    title: "新建案例材料",
  };
}

function createQuestionFormValuesFromQuestion(
  question: QuestionDto,
): QuestionFormValues {
  return {
    analysisRichText: stripRichText(question.analysisRichText),
    level: String(question.level),
    materialPublicId: question.materialPublicId ?? "",
    multiChoiceRule: question.multiChoiceRule,
    profession: question.profession,
    questionOptions:
      question.questionOptions.length === 0
        ? createDefaultQuestionOptions(question.questionType)
        : question.questionOptions.map((questionOption) => ({
            contentRichText: stripRichText(questionOption.contentRichText),
            isCorrect: questionOption.isCorrect,
            label: questionOption.label,
          })),
    questionType: question.questionType,
    scoringMethod: question.scoringMethod,
    scoringPoints:
      question.scoringPoints.length === 0
        ? createDefaultScoringPoints()
        : question.scoringPoints.map((scoringPoint) => ({
            description: scoringPoint.description,
            score: scoringPoint.score,
          })),
    standardAnswerRichText: stripRichText(question.standardAnswerRichText),
    stemRichText: stripRichText(question.stemRichText),
    subject: question.subject,
  };
}

function createMaterialFormValuesFromMaterial(
  material: MaterialDto,
): MaterialFormValues {
  return {
    contentRichText: stripRichText(material.contentRichText),
    level: String(material.level),
    profession: material.profession,
    subject: material.subject,
    title: material.title,
  };
}

function useQuestionMaterialData(activeView: ViewMode) {
  const [loadState, setLoadState] = useState<ContentLoadState>("loading");
  const [questions, setQuestions] = useState<QuestionDto[]>([]);
  const [materials, setMaterials] = useState<MaterialDto[]>([]);

  useEffect(() => {
    let isActive = true;

    async function loadContentData() {
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

        const path =
          activeView === "questions"
            ? `/api/v1/questions?${DEFAULT_CONTENT_LIST_QUERY}`
            : `/api/v1/materials?${DEFAULT_CONTENT_LIST_QUERY}`;

        if (activeView === "materials") {
          const [materialResponse, questionResponse] = await Promise.all([
            fetchAdminApi<MaterialDto[]>(path, sessionToken),
            fetchAdminApi<QuestionDto[]>(
              `/api/v1/questions?${DEFAULT_CONTENT_LIST_QUERY}`,
              sessionToken,
            ),
          ]);

          if (!isActive) {
            return;
          }

          if (
            materialResponse.code !== 0 ||
            materialResponse.data === null ||
            questionResponse.code !== 0 ||
            questionResponse.data === null
          ) {
            setLoadState("error");
            return;
          }

          setMaterials(materialResponse.data);
          setQuestions(questionResponse.data);
          setLoadState(materialResponse.data.length === 0 ? "empty" : "ready");
          return;
        }

        const contentResponse = await fetchAdminApi<QuestionDto[]>(
          path,
          sessionToken,
        );

        if (!isActive) {
          return;
        }

        if (contentResponse.code !== 0 || contentResponse.data === null) {
          setLoadState("error");
          return;
        }

        setQuestions(contentResponse.data);
        setLoadState(contentResponse.data.length === 0 ? "empty" : "ready");
      } catch {
        if (isActive) {
          setLoadState("error");
        }
      }
    }

    void loadContentData();

    return () => {
      isActive = false;
    };
  }, [activeView]);

  return { loadState, materials, questions, setMaterials, setQuestions };
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

function createQuestionInput(values: QuestionFormValues) {
  const isOptionQuestion = optionQuestionTypes.has(values.questionType);

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
    scoringPoints: isOptionQuestion
      ? []
      : values.scoringPoints.map((scoringPoint, pointIndex) => ({
          description: scoringPoint.description,
          score: scoringPoint.score,
          sortOrder: pointIndex + 1,
        })),
  };
}

function normalizeStandardAnswerForQuestionType(
  questionType: QuestionType,
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

function createMaterialInput(values: MaterialFormValues) {
  return {
    title: values.title,
    contentRichText: values.contentRichText,
    profession: values.profession,
    level: Number(values.level),
    subject: values.subject,
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

export function AdminQuestionMaterialManagement({
  defaultView = "questions",
}: AdminQuestionMaterialManagementProps) {
  const [activeView, setActiveView] = useState<ViewMode>(defaultView);
  const [keyword, setKeyword] = useState("");
  const [knowledgeNodeFilter, setKnowledgeNodeFilter] = useState("");
  const [levelFilter, setLevelFilter] = useState("");
  const [profession, setProfession] = useState<ProfessionFilter>("all");
  const [questionType, setQuestionType] = useState<QuestionTypeFilter>("all");
  const [subject, setSubject] = useState<SubjectFilter>("all");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [tagFilter, setTagFilter] = useState("");
  const [activeForm, setActiveForm] = useState<ActiveContentForm | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [pageSize, setPageSize] = useState("20");
  const [sortOrder, setSortOrder] = useState<AdminCommonSortOrder>("desc");
  const [pendingContentAction, setPendingContentAction] =
    useState<PendingContentAction | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [
    recommendationsByQuestionPublicId,
    setRecommendationsByQuestionPublicId,
  ] = useState<Record<string, KnowledgeRecommendationReviewState>>({});
  const { loadState, materials, questions, setMaterials, setQuestions } =
    useQuestionMaterialData(activeView);

  const filteredQuestions = useMemo(
    () =>
      questions.filter((question) => {
        const searchableText = [
          question.publicId,
          question.stemRichText,
          question.analysisRichText,
          question.standardAnswerRichText,
          question.knowledgeNodePublicIds.join(" "),
          question.tagPublicIds.join(" "),
        ]
          .join(" ")
          .toLowerCase();

        return (
          includesKeyword(searchableText, keyword) &&
          includesKeyword(String(question.level), levelFilter) &&
          includesKeyword(
            question.knowledgeNodePublicIds.join(" ").toLowerCase(),
            knowledgeNodeFilter,
          ) &&
          includesKeyword(
            question.tagPublicIds.join(" ").toLowerCase(),
            tagFilter,
          ) &&
          matchesFilter(question.profession, profession) &&
          matchesFilter(question.questionType, questionType) &&
          matchesFilter(question.subject, subject) &&
          matchesFilter(question.status, status)
        );
      }),
    [
      keyword,
      knowledgeNodeFilter,
      levelFilter,
      profession,
      questionType,
      questions,
      status,
      subject,
      tagFilter,
    ],
  );
  const filteredMaterials = useMemo(
    () =>
      materials.filter((material) => {
        const searchableText = [
          material.publicId,
          material.title,
          material.contentRichText,
        ]
          .join(" ")
          .toLowerCase();

        return (
          includesKeyword(searchableText, keyword) &&
          includesKeyword(String(material.level), levelFilter) &&
          matchesFilter(material.profession, profession) &&
          matchesFilter(material.subject, subject) &&
          matchesFilter(material.status, status)
        );
      }),
    [keyword, levelFilter, materials, profession, status, subject],
  );
  const referencedQuestionPublicIdsByMaterialPublicId = useMemo(() => {
    return questions.reduce<Record<string, string[]>>(
      (referencedQuestions, question) => {
        if (question.materialPublicId === null) {
          return referencedQuestions;
        }

        return {
          ...referencedQuestions,
          [question.materialPublicId]: [
            ...(referencedQuestions[question.materialPublicId] ?? []),
            question.publicId,
          ],
        };
      },
      {},
    );
  }, [questions]);
  const selectedQuestionPublicId =
    activeForm?.kind === "question" ? activeForm.publicId : null;
  const selectedMaterialPublicId =
    activeForm?.kind === "material" ? activeForm.publicId : null;
  const displayedQuestions = useMemo(
    () =>
      sortItemsByUpdatedAt(filteredQuestions, sortOrder).slice(
        0,
        Number(pageSize),
      ),
    [filteredQuestions, pageSize, sortOrder],
  );
  const displayedMaterials = useMemo(
    () =>
      sortItemsByUpdatedAt(filteredMaterials, sortOrder).slice(
        0,
        Number(pageSize),
      ),
    [filteredMaterials, pageSize, sortOrder],
  );

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

    if (sessionToken === null || activeForm?.kind !== "question") {
      setActionError("管理员会话已失效，请重新登录后再操作。");
      return;
    }

    setIsSubmitting(true);
    setActionError(null);

    try {
      const response = await mutateAdminApi<{ question: QuestionDto }>(
        activeForm.mode === "create"
          ? "/api/v1/questions"
          : `/api/v1/questions/${activeForm.publicId}`,
        sessionToken,
        activeForm.mode === "create" ? "POST" : "PATCH",
        activeForm.mode === "create"
          ? createQuestionInput(values)
          : {
              ...createQuestionInput(values),
              status: "available",
            },
      );

      if (response.code !== 0 || response.data === null) {
        setActionError("题目保存失败，请刷新后重试。");
        return;
      }

      const savedQuestion = response.data.question;
      setQuestions((currentQuestions) =>
        upsertByPublicId(currentQuestions, savedQuestion),
      );
      setActionMessage(`题目 ${savedQuestion.publicId} 已保存`);
      setActiveForm(null);
    } catch {
      setActionError("题目保存失败，请刷新后重试。");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleSaveMaterial(values: MaterialFormValues) {
    const sessionToken = getStoredSessionToken();

    if (sessionToken === null || activeForm?.kind !== "material") {
      setActionError("管理员会话已失效，请重新登录后再操作。");
      return;
    }

    setIsSubmitting(true);
    setActionError(null);

    try {
      const response = await mutateAdminApi<{ material: MaterialDto }>(
        activeForm.mode === "create"
          ? "/api/v1/materials"
          : `/api/v1/materials/${activeForm.publicId}`,
        sessionToken,
        activeForm.mode === "create" ? "POST" : "PATCH",
        activeForm.mode === "create"
          ? createMaterialInput(values)
          : {
              ...createMaterialInput(values),
              status: "available",
            },
      );

      if (response.code !== 0 || response.data === null) {
        setActionError("材料保存失败，请刷新后重试。");
        return;
      }

      const savedMaterial = response.data.material;
      setMaterials((currentMaterials) =>
        upsertByPublicId(currentMaterials, savedMaterial),
      );
      setActionMessage(`材料 ${savedMaterial.publicId} 已保存`);
      setActiveForm(null);
    } catch {
      setActionError("材料保存失败，请刷新后重试。");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleQuestionAction(
    publicId: string,
    action: "copy" | "disable",
  ) {
    const sessionToken = getStoredSessionToken();

    if (sessionToken === null) {
      setActionError("管理员会话已失效，请重新登录后再操作。");
      return;
    }

    setActionError(null);
    const response = await mutateAdminApi<{ question: QuestionDto }>(
      `/api/v1/questions/${publicId}/${action}`,
      sessionToken,
      "POST",
    );

    if (response.code !== 0 || response.data === null) {
      setActionError("题目操作失败，请刷新后重试。");
      return;
    }

    const updatedQuestion = response.data.question;
    setQuestions((currentQuestions) =>
      upsertByPublicId(currentQuestions, updatedQuestion),
    );
    setActionMessage(`题目 ${updatedQuestion.publicId} 已更新`);
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
        reviewStatusByKnowledgeNodePublicId: {},
      },
    }));
    setActionMessage(`题目 ${question.publicId} 知识点推荐已生成`);
  }

  function handleReviewKnowledgeRecommendation(
    questionPublicId: string,
    knowledgeNodePublicId: string,
    reviewStatus: RecommendationReviewStatus,
  ) {
    setRecommendationsByQuestionPublicId((currentRecommendations) => {
      const currentRecommendation =
        currentRecommendations[questionPublicId] ?? null;

      if (currentRecommendation === null) {
        return currentRecommendations;
      }

      return {
        ...currentRecommendations,
        [questionPublicId]: {
          ...currentRecommendation,
          reviewStatusByKnowledgeNodePublicId: {
            ...currentRecommendation.reviewStatusByKnowledgeNodePublicId,
            [knowledgeNodePublicId]: reviewStatus,
          },
        },
      };
    });

    if (reviewStatus === "accepted") {
      setQuestions((currentQuestions) =>
        currentQuestions.map((question) => {
          if (
            question.publicId !== questionPublicId ||
            question.knowledgeNodePublicIds.includes(knowledgeNodePublicId)
          ) {
            return question;
          }

          return {
            ...question,
            knowledgeNodePublicIds: [
              ...question.knowledgeNodePublicIds,
              knowledgeNodePublicId,
            ],
          };
        }),
      );
    }

    setActionMessage(
      reviewStatus === "accepted"
        ? `已采纳推荐 ${knowledgeNodePublicId}`
        : `已丢弃推荐 ${knowledgeNodePublicId}`,
    );
  }

  async function handleMaterialAction(
    publicId: string,
    action: "copy" | "disable",
  ) {
    const sessionToken = getStoredSessionToken();

    if (sessionToken === null) {
      setActionError("管理员会话已失效，请重新登录后再操作。");
      return;
    }

    setActionError(null);
    const response = await mutateAdminApi<{ material: MaterialDto }>(
      `/api/v1/materials/${publicId}/${action}`,
      sessionToken,
      "POST",
    );

    if (response.code !== 0 || response.data === null) {
      setActionError("材料操作失败，请刷新后重试。");
      return;
    }

    const updatedMaterial = response.data.material;
    setMaterials((currentMaterials) =>
      upsertByPublicId(currentMaterials, updatedMaterial),
    );
    setActionMessage(`材料 ${updatedMaterial.publicId} 已更新`);
  }

  async function handleConfirmPendingContentAction() {
    if (pendingContentAction === null) {
      return;
    }

    const currentAction = pendingContentAction;
    setPendingContentAction(null);

    if (currentAction.kind === "questionDisable") {
      await handleQuestionAction(currentAction.publicId, "disable");
      return;
    }

    await handleMaterialAction(currentAction.publicId, "disable");
  }

  return (
    <section className="space-y-6">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-2">
          <p className="text-brand-primary text-sm font-medium">
            Content Admin
          </p>
          <h1 className="font-heading text-text-primary text-2xl font-semibold">
            题库与材料管理
          </h1>
          <p className="text-text-secondary max-w-3xl text-sm">
            管理题目、材料、知识点标签与试卷引用关系；页面只展示 runtime DTO
            中的 publicId，不暴露内部自增 id。
          </p>
        </div>
        <ActionBar
          activeView={activeView}
          onCreate={() => {
            setActionError(null);
            setActionMessage(null);
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
      </header>

      <ContentOpsStagingRoleArrangement />

      <FilterPanel
        activeView={activeView}
        keyword={keyword}
        knowledgeNodeFilter={knowledgeNodeFilter}
        levelFilter={levelFilter}
        profession={profession}
        questionType={questionType}
        status={status}
        subject={subject}
        tagFilter={tagFilter}
        onKeywordChange={setKeyword}
        onKnowledgeNodeFilterChange={setKnowledgeNodeFilter}
        onLevelFilterChange={setLevelFilter}
        onProfessionChange={setProfession}
        onQuestionTypeChange={setQuestionType}
        onStatusChange={setStatus}
        onSubjectChange={setSubject}
        onTagFilterChange={setTagFilter}
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
          onClick={() => setActiveView("questions")}
        >
          <FileQuestion aria-hidden="true" className="size-4" />
          题目
        </button>
        <button
          aria-selected={activeView === "materials"}
          className={tabClassName(activeView === "materials")}
          role="tab"
          type="button"
          onClick={() => setActiveView("materials")}
        >
          <FileText aria-hidden="true" className="size-4" />
          材料
        </button>
      </div>

      <div
        className={
          activeForm === null
            ? "grid gap-4"
            : "grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(22rem,28rem)]"
        }
      >
        <div className="min-w-0">
          {activeView === "questions" ? (
            <QuestionList
              recommendationByQuestionPublicId={
                recommendationsByQuestionPublicId
              }
              rows={displayedQuestions}
              selectedPublicId={selectedQuestionPublicId}
              onCopy={(publicId) => void handleQuestionAction(publicId, "copy")}
              onDisable={(publicId) =>
                setPendingContentAction({ kind: "questionDisable", publicId })
              }
              onEdit={(question) => {
                setActionError(null);
                setActionMessage(null);
                setActiveForm({
                  kind: "question",
                  mode: "edit",
                  publicId: question.publicId,
                  values: createQuestionFormValuesFromQuestion(question),
                });
              }}
              onRecommend={(question) =>
                void handleRecommendKnowledgeNodes(question)
              }
              onReviewRecommendation={handleReviewKnowledgeRecommendation}
            />
          ) : (
            <MaterialList
              referencedQuestionPublicIdsByMaterialPublicId={
                referencedQuestionPublicIdsByMaterialPublicId
              }
              rows={displayedMaterials}
              selectedPublicId={selectedMaterialPublicId}
              onCopy={(publicId) => void handleMaterialAction(publicId, "copy")}
              onDisable={(publicId) =>
                setPendingContentAction({ kind: "materialDisable", publicId })
              }
              onEdit={(material) => {
                setActionError(null);
                setActionMessage(null);
                setActiveForm({
                  kind: "material",
                  mode: "edit",
                  publicId: material.publicId,
                  values: createMaterialFormValuesFromMaterial(material),
                });
              }}
            />
          )}
        </div>
        {activeForm === null ? null : (
          <aside
            className="min-w-0 xl:sticky xl:top-4 xl:self-start"
            data-testid="content-edit-context-panel"
          >
            <div className="mb-3 flex flex-col gap-1">
              <p
                className="text-text-primary text-sm font-semibold"
                data-testid="content-edit-context-label"
              >
                {activeForm.mode === "create" ? "新建" : "编辑"}
                {activeForm.kind === "question" ? "题目" : "材料"}
              </p>
              <p className="text-text-muted text-xs">
                {activeForm.publicId ?? "new local draft"}
              </p>
            </div>
            {activeForm.kind === "question" ? (
              <QuestionWriteForm
                isSubmitting={isSubmitting}
                key={`${activeForm.mode}-${activeForm.publicId ?? "new"}`}
                mode={activeForm.mode}
                values={activeForm.values}
                onCancel={() => setActiveForm(null)}
                onSubmit={handleSaveQuestion}
              />
            ) : (
              <MaterialWriteForm
                isSubmitting={isSubmitting}
                key={`${activeForm.mode}-${activeForm.publicId ?? "new"}`}
                mode={activeForm.mode}
                values={activeForm.values}
                onCancel={() => setActiveForm(null)}
                onSubmit={handleSaveMaterial}
              />
            )}
          </aside>
        )}
      </div>

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
          将提交 {action.publicId} 的停用操作；操作只使用 publicId。
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
  onCreate,
}: {
  activeView: ViewMode;
  onCreate: () => void;
}) {
  const noun = activeView === "questions" ? "题目" : "材料";

  return (
    <div className="max-w-xl space-y-2">
      <div className="flex flex-wrap gap-2">
        <Button onClick={onCreate}>
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

function QuestionWriteForm({
  isSubmitting,
  mode,
  values,
  onCancel,
  onSubmit,
}: {
  isSubmitting: boolean;
  mode: QuestionFormMode;
  values: QuestionFormValues;
  onCancel: () => void;
  onSubmit: (values: QuestionFormValues) => void;
}) {
  const [formValues, setFormValues] = useState(values);
  const isOptionQuestion = optionQuestionTypes.has(formValues.questionType);
  const stemLengthExceeded =
    formValues.stemRichText.length > MAX_QUESTION_RICH_TEXT_LENGTH;
  const analysisLengthExceeded =
    formValues.analysisRichText.length > MAX_QUESTION_RICH_TEXT_LENGTH;
  const isFormInvalid = stemLengthExceeded || analysisLengthExceeded;

  return (
    <form
      aria-label="题目表单"
      className="bg-surface border-border grid gap-4 rounded-md border p-4 shadow-sm"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit(formValues);
      }}
    >
      <h2 className="text-text-primary text-base font-semibold">
        {mode === "create" ? "新建题目" : "编辑题目"}
      </h2>
      <div className="grid gap-3 md:grid-cols-4">
        <QuestionFormSelect
          label="题型"
          options={Object.entries(questionTypeLabels)}
          value={formValues.questionType}
          onChange={(value) => {
            const questionType = value as QuestionType;

            setFormValues({
              ...formValues,
              questionOptions: createDefaultQuestionOptions(questionType),
              questionType,
              standardAnswerRichText:
                questionType === "true_false"
                  ? "A"
                  : formValues.standardAnswerRichText,
            });
          }}
        />
        <QuestionFormSelect
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
        </label>
        <QuestionFormSelect
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
          onChange={(value) =>
            setFormValues({
              ...formValues,
              scoringMethod: value as ScoringMethod,
            })
          }
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
        />
        <label className="grid gap-2 text-sm font-medium">
          <span className="text-text-secondary">关联材料 publicId</span>
          <Input
            aria-label="关联材料 publicId"
            value={formValues.materialPublicId}
            onChange={(event) =>
              setFormValues({
                ...formValues,
                materialPublicId: event.target.value,
              })
            }
          />
        </label>
      </div>
      <label className="grid gap-2 text-sm font-medium">
        <span className="text-text-secondary">
          题干
          <span className="text-text-muted ml-2 font-normal">
            {formValues.stemRichText.length}/{MAX_QUESTION_RICH_TEXT_LENGTH}
          </span>
        </span>
        <textarea
          aria-label="题干"
          className="border-input focus-visible:border-ring focus-visible:ring-ring/50 bg-surface min-h-20 rounded-lg border px-3 py-2 text-sm outline-none focus-visible:ring-3"
          value={formValues.stemRichText}
          onChange={(event) =>
            setFormValues({
              ...formValues,
              stemRichText: event.target.value,
            })
          }
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
          value={formValues.standardAnswerRichText}
          onChange={(event) =>
            setFormValues({
              ...formValues,
              standardAnswerRichText: event.target.value,
            })
          }
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
          className="border-input focus-visible:border-ring focus-visible:ring-ring/50 bg-surface min-h-20 rounded-lg border px-3 py-2 text-sm outline-none focus-visible:ring-3"
          value={formValues.analysisRichText}
          onChange={(event) =>
            setFormValues({
              ...formValues,
              analysisRichText: event.target.value,
            })
          }
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
              stemRichText: `${formValues.stemRichText}\n\n<img src=\"local-image-placeholder\" alt=\"题目图片\" />`,
            })
          }
        >
          插入图片占位
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() =>
            setFormValues({
              ...formValues,
              stemRichText: `${formValues.stemRichText}\n\n<table><tr><th>项目</th><th>内容</th></tr><tr><td>示例</td><td>填写内容</td></tr></table>`,
            })
          }
        >
          插入表格模板
        </Button>
      </div>
      {isOptionQuestion ? (
        <fieldset className="border-border grid gap-3 rounded-md border p-3">
          <legend className="text-text-secondary px-1 text-sm font-medium">
            选项
          </legend>
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
        </fieldset>
      ) : (
        <fieldset className="border-border grid gap-3 rounded-md border p-3">
          <legend className="text-text-secondary px-1 text-sm font-medium">
            评分点
          </legend>
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
        </fieldset>
      )}
      <div className="flex flex-wrap gap-2">
        <Button disabled={isSubmitting || isFormInvalid} type="submit">
          保存题目
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          取消
        </Button>
      </div>
    </form>
  );
}

function QuestionFormSelect({
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
    <label className="grid gap-2 text-sm font-medium">
      <span className="text-text-secondary">{label}</span>
      <select
        aria-label={label}
        className="border-input focus-visible:border-ring focus-visible:ring-ring/50 bg-surface h-9 rounded-lg border px-3 py-1 text-sm outline-none focus-visible:ring-3"
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

function MaterialWriteForm({
  isSubmitting,
  mode,
  values,
  onCancel,
  onSubmit,
}: {
  isSubmitting: boolean;
  mode: MaterialFormMode;
  values: MaterialFormValues;
  onCancel: () => void;
  onSubmit: (values: MaterialFormValues) => void;
}) {
  const [formValues, setFormValues] = useState(values);
  const materialLengthExceeded =
    formValues.contentRichText.length > MAX_MATERIAL_RICH_TEXT_LENGTH;

  return (
    <form
      aria-label="材料表单"
      className="bg-surface border-border grid gap-4 rounded-md border p-4 shadow-sm"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit(formValues);
      }}
    >
      <h2 className="text-text-primary text-base font-semibold">
        {mode === "create" ? "新建材料" : "编辑材料"}
      </h2>
      <label className="grid gap-2 text-sm font-medium">
        <span className="text-text-secondary">材料标题</span>
        <Input
          aria-label="材料标题"
          value={formValues.title}
          onChange={(event) =>
            setFormValues({
              ...formValues,
              title: event.target.value,
            })
          }
        />
      </label>
      <div className="grid gap-3 md:grid-cols-3">
        <QuestionFormSelect
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
        </label>
        <QuestionFormSelect
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
          className="border-input focus-visible:border-ring focus-visible:ring-ring/50 bg-surface min-h-24 rounded-lg border px-3 py-2 text-sm outline-none focus-visible:ring-3"
          value={formValues.contentRichText}
          onChange={(event) =>
            setFormValues({
              ...formValues,
              contentRichText: event.target.value,
            })
          }
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
              contentRichText: `${formValues.contentRichText}\n\n<img src="local-image-placeholder" alt="材料图片" />`,
            })
          }
        >
          插入图片占位
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() =>
            setFormValues({
              ...formValues,
              contentRichText: `${formValues.contentRichText}\n\n<table><tr><th>项目</th><th>内容</th></tr><tr><td>示例</td><td>填写内容</td></tr></table>`,
            })
          }
        >
          插入表格模板
        </Button>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button disabled={isSubmitting || materialLengthExceeded} type="submit">
          保存材料
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          取消
        </Button>
      </div>
    </form>
  );
}

function FilterPanel({
  activeView,
  keyword,
  knowledgeNodeFilter,
  levelFilter,
  profession,
  questionType,
  status,
  subject,
  tagFilter,
  onKeywordChange,
  onKnowledgeNodeFilterChange,
  onLevelFilterChange,
  onProfessionChange,
  onQuestionTypeChange,
  onStatusChange,
  onSubjectChange,
  onTagFilterChange,
}: {
  activeView: ViewMode;
  keyword: string;
  knowledgeNodeFilter: string;
  levelFilter: string;
  profession: ProfessionFilter;
  questionType: QuestionTypeFilter;
  status: StatusFilter;
  subject: SubjectFilter;
  tagFilter: string;
  onKeywordChange: (value: string) => void;
  onKnowledgeNodeFilterChange: (value: string) => void;
  onLevelFilterChange: (value: string) => void;
  onProfessionChange: (value: ProfessionFilter) => void;
  onQuestionTypeChange: (value: QuestionTypeFilter) => void;
  onStatusChange: (value: StatusFilter) => void;
  onSubjectChange: (value: SubjectFilter) => void;
  onTagFilterChange: (value: string) => void;
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
              placeholder="题干、材料、publicId、知识点或标签"
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
            options={[
              ["all", "全部题型"],
              ...Object.entries(questionTypeLabels),
            ]}
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
      </div>
      {activeView === "questions" ? (
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <label className="flex flex-col gap-2 text-sm font-medium">
            <span className="text-text-secondary">知识点筛选</span>
            <Input
              aria-label="知识点筛选"
              placeholder="知识点 publicId"
              value={knowledgeNodeFilter}
              onChange={(event) =>
                onKnowledgeNodeFilterChange(event.target.value)
              }
            />
          </label>
          <label className="flex flex-col gap-2 text-sm font-medium">
            <span className="text-text-secondary">标签筛选</span>
            <Input
              aria-label="标签筛选"
              placeholder="标签 publicId"
              value={tagFilter}
              onChange={(event) => onTagFilterChange(event.target.value)}
            />
          </label>
        </div>
      ) : null}
    </div>
  );
}

function QuestionList({
  recommendationByQuestionPublicId,
  rows,
  selectedPublicId,
  onCopy,
  onDisable,
  onEdit,
  onRecommend,
  onReviewRecommendation,
}: {
  recommendationByQuestionPublicId: Record<
    string,
    KnowledgeRecommendationReviewState
  >;
  rows: QuestionDto[];
  selectedPublicId: string | null;
  onCopy: (publicId: string) => void;
  onDisable: (publicId: string) => void;
  onEdit: (question: QuestionDto) => void;
  onRecommend: (question: QuestionDto) => void;
  onReviewRecommendation: (
    questionPublicId: string,
    knowledgeNodePublicId: string,
    reviewStatus: RecommendationReviewStatus,
  ) => void;
}) {
  if (rows.length === 0) {
    return <FilteredEmptyState title="没有匹配的题目" />;
  }

  return (
    <div className="grid gap-3">
      {rows.map((question) => {
        const isSelected = question.publicId === selectedPublicId;

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
                <div className="flex flex-wrap gap-2">
                  {question.knowledgeNodePublicIds.map((publicId) => (
                    <span
                      className="bg-muted text-muted-foreground rounded-md px-2 py-1 text-xs"
                      key={publicId}
                    >
                      {publicId}
                    </span>
                  ))}
                  {question.tagPublicIds.map((publicId) => (
                    <span
                      className="border-border text-text-secondary rounded-md border px-2 py-1 text-xs"
                      key={publicId}
                    >
                      {publicId}
                    </span>
                  ))}
                </div>
              </div>
              <PublicId value={question.publicId} />
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <Button
                aria-label={`编辑题目 ${question.publicId}`}
                data-testid={`question-edit-${question.publicId}`}
                disabled={question.isLocked}
                size="sm"
                type="button"
                variant="outline"
                onClick={() => onEdit(question)}
              >
                <Pencil aria-hidden="true" data-icon="inline-start" />
                编辑
              </Button>
              {question.isLocked ? (
                <span className="text-text-muted self-center text-xs">
                  已锁定题目只能复制新题后编辑
                </span>
              ) : null}
              <Button
                aria-label={`停用题目 ${question.publicId}`}
                size="sm"
                type="button"
                variant="destructive"
                onClick={() => onDisable(question.publicId)}
              >
                <ShieldOff aria-hidden="true" data-icon="inline-start" />
                停用
              </Button>
              <Button
                aria-label={`复制题目 ${question.publicId}`}
                size="sm"
                type="button"
                variant="secondary"
                onClick={() => onCopy(question.publicId)}
              >
                <Copy aria-hidden="true" data-icon="inline-start" />
                复制
              </Button>
              <Button
                aria-label={`Recommend knowledge nodes for ${question.publicId}`}
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
              reviewState={recommendationByQuestionPublicId[question.publicId]}
              onReviewRecommendation={onReviewRecommendation}
            />
            <ReferenceBlock
              label="关联材料"
              value={question.materialPublicId ?? "未关联材料"}
            />
          </article>
        );
      })}
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
              ? "stale: question updated after recommendation"
              : "current: pending_confirmation recommendations"}
          </p>
        </div>
        <span className="bg-secondary text-secondary-foreground rounded-md px-2 py-1 text-xs">
          {reviewState.recommendation.reviewState.bindingMode}
        </span>
      </div>

      {reviewState.recommendation.recommendations.length === 0 ? (
        <p className="text-text-secondary mt-3 text-sm">
          本次没有可审查的推荐结果。
        </p>
      ) : (
        <div className="mt-3 grid gap-2">
          {reviewState.recommendation.recommendations.map((recommendation) => {
            const reviewStatus =
              reviewState.reviewStatusByKnowledgeNodePublicId[
                recommendation.knowledgeNodePublicId
              ] ?? recommendation.confirmationStatus;

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
                        {reviewStatus}
                      </span>
                    </div>
                    <p className="text-text-primary text-sm font-medium">
                      {recommendation.name}
                    </p>
                    <p className="text-text-secondary text-xs leading-5">
                      {recommendation.pathName}
                    </p>
                    <p className="text-text-secondary text-xs leading-5">
                      {recommendation.reason}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      aria-label={`Accept recommendation ${recommendation.knowledgeNodePublicId}`}
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
                      采纳
                    </Button>
                    <Button
                      aria-label={`Discard recommendation ${recommendation.knowledgeNodePublicId}`}
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

function MaterialList({
  referencedQuestionPublicIdsByMaterialPublicId,
  rows,
  selectedPublicId,
  onCopy,
  onDisable,
  onEdit,
}: {
  referencedQuestionPublicIdsByMaterialPublicId: Record<string, string[]>;
  rows: MaterialDto[];
  selectedPublicId: string | null;
  onCopy: (publicId: string) => void;
  onDisable: (publicId: string) => void;
  onEdit: (material: MaterialDto) => void;
}) {
  if (rows.length === 0) {
    return <FilteredEmptyState title="没有匹配的材料" />;
  }

  return (
    <div className="grid gap-3">
      {rows.map((material) => {
        const isSelected = material.publicId === selectedPublicId;
        const referencedQuestionPublicIds =
          referencedQuestionPublicIdsByMaterialPublicId[material.publicId] ??
          [];

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
                <p className="text-text-secondary line-clamp-2 text-sm">
                  {stripRichText(material.contentRichText)}
                </p>
              </div>
              <PublicId value={material.publicId} />
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <Button
                aria-label={`编辑材料 ${material.publicId}`}
                data-testid={`material-edit-${material.publicId}`}
                disabled={material.isLocked}
                size="sm"
                type="button"
                variant="outline"
                onClick={() => onEdit(material)}
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
                aria-label={`停用材料 ${material.publicId}`}
                size="sm"
                type="button"
                variant="destructive"
                onClick={() => onDisable(material.publicId)}
              >
                <ShieldOff aria-hidden="true" data-icon="inline-start" />
                停用
              </Button>
              <Button
                aria-label={`复制材料 ${material.publicId}`}
                size="sm"
                type="button"
                variant="secondary"
                onClick={() => onCopy(material.publicId)}
              >
                <Copy aria-hidden="true" data-icon="inline-start" />
                复制
              </Button>
            </div>
            <ReferenceBlock
              label="材料锁定"
              value={material.isLocked ? "已被发布试卷锁定" : "未锁定"}
            />
            <ReferenceBlock
              label="关联题目"
              value={
                referencedQuestionPublicIds.length === 0
                  ? "当前没有题目引用"
                  : referencedQuestionPublicIds.join(", ")
              }
            />
            <ReferenceBlock
              label="关联试卷"
              value="当前 runtime DTO 未提供试卷引用列表"
            />
          </article>
        );
      })}
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
