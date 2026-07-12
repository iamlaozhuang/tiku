"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, ChevronLeft, ChevronRight, Search } from "lucide-react";

import { AdminDetailDrawer } from "@/components/admin/AdminDetailDrawer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { ApiPagination } from "@/server/contracts/api-response";
import type { MaterialDto } from "@/server/contracts/material-contract";
import type { PaperDraftDto } from "@/server/contracts/paper-draft-contract";
import type { QuestionDto } from "@/server/contracts/question-contract";
import type { QuestionType } from "@/server/models/paper";

import {
  fetchAdminApi,
  FilterSelect,
  getStoredSessionToken,
} from "../content-admin-runtime";

export type PaperQuestionAddInput = {
  questionPublicId: string;
  score: string;
  sortOrder: number;
  paperSection: {
    title: string;
    description: string | null;
    sortOrder: number;
  };
  questionGroup: {
    title: string;
    materialPublicId: string;
    sortOrder: number;
  } | null;
};

type PickerMode = "question" | "material";
type PickerLoadState = "loading" | "ready" | "error";

const questionTypeLabels: Record<QuestionType, string> = {
  case_analysis: "案例分析题",
  calculation: "计算题",
  fill_blank: "填空题",
  multi_choice: "多选题",
  short_answer: "简答题",
  single_choice: "单选题",
  true_false: "判断题",
};

function stripRichText(value: string) {
  return value
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function defaultPagination(): ApiPagination {
  return {
    page: 1,
    pageSize: 20,
    total: 0,
    sortBy: "updatedAt",
    sortOrder: "desc",
  };
}

export function PaperComposerQuestionPickerDrawer({
  mode,
  paper,
  onAdd,
  onClose,
}: {
  mode: PickerMode;
  paper: PaperDraftDto;
  onAdd: (input: PaperQuestionAddInput) => Promise<boolean>;
  onClose: () => void;
}) {
  const [keyword, setKeyword] = useState("");
  const [questionType, setQuestionType] = useState<"all" | QuestionType>("all");
  const [page, setPage] = useState(1);
  const [loadState, setLoadState] = useState<PickerLoadState>("loading");
  const [questions, setQuestions] = useState<QuestionDto[]>([]);
  const [materials, setMaterials] = useState<MaterialDto[]>([]);
  const [pagination, setPagination] =
    useState<ApiPagination>(defaultPagination());
  const [selectedMaterial, setSelectedMaterial] = useState<MaterialDto | null>(
    null,
  );
  const [selectedQuestion, setSelectedQuestion] = useState<QuestionDto | null>(
    null,
  );
  const [targetSection, setTargetSection] = useState(
    paper.paperSections[0]?.sortOrder.toString() ?? "new",
  );
  const [newSectionTitle, setNewSectionTitle] = useState("新的大题");
  const [newSectionDescription, setNewSectionDescription] = useState("");
  const [score, setScore] = useState("5.0");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResolvingMaterial, setIsResolvingMaterial] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const queryString = useMemo(() => {
    const searchParams = new URLSearchParams({
      page: String(page),
      pageSize: "20",
      sortBy: "updatedAt",
      sortOrder: "desc",
      profession: paper.profession,
      level: String(paper.level),
      subject: paper.subject,
      status: "available",
    });

    if (keyword.trim() !== "") searchParams.set("keyword", keyword.trim());
    if (questionType !== "all") {
      searchParams.set("questionType", questionType);
    }
    if (selectedMaterial !== null) {
      searchParams.set("materialPublicId", selectedMaterial.publicId);
    }

    return searchParams.toString();
  }, [keyword, page, paper, questionType, selectedMaterial]);

  useEffect(() => {
    const abortController = new AbortController();

    if (mode === "material" && selectedMaterial === null) {
      const sessionToken = getStoredSessionToken();
      const searchParams = new URLSearchParams({
        page: "1",
        pageSize: "20",
        sortBy: "updatedAt",
        sortOrder: "desc",
        profession: paper.profession,
        level: String(paper.level),
        subject: paper.subject,
        status: "available",
      });

      void fetchAdminApi<{ materials: MaterialDto[] }>(
        `/api/v1/materials?${searchParams.toString()}`,
        sessionToken,
        { signal: abortController.signal },
      )
        .then((response) => {
          if (response.code !== 0 || response.data === null) {
            setLoadState("error");
            return;
          }
          setMaterials(response.data.materials);
          setPagination(response.pagination ?? defaultPagination());
          setLoadState("ready");
        })
        .catch(() => {
          if (!abortController.signal.aborted) setLoadState("error");
        });
      return () => abortController.abort();
    }

    const sessionToken = getStoredSessionToken();
    void fetchAdminApi<{ questions: QuestionDto[] }>(
      `/api/v1/questions?${queryString}`,
      sessionToken,
      { signal: abortController.signal },
    )
      .then((response) => {
        if (response.code !== 0 || response.data === null) {
          setLoadState("error");
          return;
        }
        setQuestions(response.data.questions);
        setPagination(response.pagination ?? defaultPagination());
        setLoadState("ready");
      })
      .catch(() => {
        if (!abortController.signal.aborted) setLoadState("error");
      });
    return () => abortController.abort();
  }, [mode, paper, queryString, selectedMaterial]);

  async function handleSelectQuestion(question: QuestionDto) {
    setSelectedQuestion(question);
    setErrorMessage(null);

    if (mode === "question") {
      setSelectedMaterial(null);
    }

    if (
      question.materialPublicId === null ||
      (mode === "material" && selectedMaterial !== null)
    ) {
      return;
    }

    setIsResolvingMaterial(true);
    try {
      const response = await fetchAdminApi<{ material: MaterialDto }>(
        `/api/v1/materials/${question.materialPublicId}`,
        getStoredSessionToken(),
      );
      if (response.code === 0 && response.data !== null) {
        setSelectedMaterial(response.data.material);
        return;
      }
      setErrorMessage("关联材料加载失败。当前题目尚未加入试卷，请稍后重试。");
    } catch {
      setErrorMessage("关联材料加载失败。当前题目尚未加入试卷，请稍后重试。");
    } finally {
      setIsResolvingMaterial(false);
    }
  }

  async function handleAddQuestion() {
    if (selectedQuestion === null) return;

    if (
      selectedQuestion.materialPublicId !== null &&
      selectedMaterial === null
    ) {
      setErrorMessage(
        "关联材料尚未加载完成，无法安全保存材料快照。请稍后重试。",
      );
      return;
    }

    const existingSection = paper.paperSections.find(
      (paperSection) => paperSection.sortOrder.toString() === targetSection,
    );
    const paperSection =
      existingSection === undefined
        ? {
            title: newSectionTitle.trim(),
            description:
              newSectionDescription.trim() === ""
                ? null
                : newSectionDescription.trim(),
            sortOrder:
              Math.max(
                0,
                ...paper.paperSections.map((item) => item.sortOrder),
              ) + 1,
          }
        : {
            title: existingSection.title,
            description: existingSection.description,
            sortOrder: existingSection.sortOrder,
          };

    const scoreNumber = Number(score);

    if (
      paperSection.title === "" ||
      !Number.isFinite(scoreNumber) ||
      scoreNumber < 0 ||
      scoreNumber * 2 !== Math.round(scoreNumber * 2)
    ) {
      setErrorMessage(
        "请填写大题名称和有效分值，分值按 0.5 递增。当前内容尚未加入试卷。",
      );
      return;
    }

    const sectionQuestionCount = existingSection?.paperQuestions.length ?? 0;
    const material = selectedMaterial;
    setIsSubmitting(true);
    const added = await onAdd({
      questionPublicId: selectedQuestion.publicId,
      score,
      sortOrder: sectionQuestionCount + 1,
      paperSection,
      questionGroup:
        material === null
          ? null
          : {
              title: material.title,
              materialPublicId: material.publicId,
              sortOrder:
                Math.max(
                  0,
                  ...paper.questionGroups.map((item) => item.sortOrder),
                ) + 1,
            },
    });
    setIsSubmitting(false);
    if (added) onClose();
  }

  const ariaLabel = mode === "question" ? "选择题目" : "按材料选题";
  return (
    <AdminDetailDrawer
      ariaLabel={ariaLabel}
      description="筛选正式题库内容，预览后加入当前草稿。题干、答案和解析会按现有规则保存快照。"
      eyebrow="组卷选题"
      title={ariaLabel}
      onClose={onClose}
    >
      <div className="space-y-5">
        {mode === "material" && selectedMaterial !== null ? (
          <button
            className="text-brand-primary inline-flex items-center gap-1 text-sm font-medium"
            type="button"
            onClick={() => {
              setSelectedMaterial(null);
              setSelectedQuestion(null);
              setLoadState("loading");
            }}
          >
            <ChevronLeft aria-hidden="true" className="size-4" />
            返回材料列表
          </button>
        ) : null}

        {mode === "question" || selectedMaterial !== null ? (
          <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_12rem]">
            <label className="grid gap-2 text-sm font-medium">
              <span className="text-text-secondary">题干关键词</span>
              <span className="relative">
                <Search
                  aria-hidden="true"
                  className="text-text-muted absolute top-2.5 left-2.5 size-4"
                />
                <Input
                  aria-label="题干关键词"
                  className="pl-8"
                  value={keyword}
                  onChange={(event) => {
                    setKeyword(event.target.value);
                    setPage(1);
                    setLoadState("loading");
                  }}
                />
              </span>
            </label>
            <FilterSelect
              label="题型"
              options={[
                ["all", "全部题型"],
                ...Object.entries(questionTypeLabels),
              ]}
              value={questionType}
              onChange={(value) => {
                setQuestionType(value as "all" | QuestionType);
                setPage(1);
                setLoadState("loading");
              }}
            />
          </div>
        ) : null}

        {loadState === "loading" ? (
          <p className="text-text-secondary text-sm" role="status">
            正在加载可选内容
          </p>
        ) : null}
        {loadState === "error" ? (
          <p className="text-destructive text-sm" role="alert">
            可选内容加载失败，请关闭后重试。
          </p>
        ) : null}

        {loadState === "ready" &&
        mode === "material" &&
        selectedMaterial === null ? (
          <div className="space-y-2">
            {materials.length === 0 ? (
              <p className="text-text-secondary text-sm">
                没有匹配的可用材料。
              </p>
            ) : null}
            {materials.map((material) => (
              <button
                className="bg-surface border-border hover:border-brand-primary flex w-full items-center justify-between gap-4 rounded-md border p-3 text-left"
                key={material.publicId}
                type="button"
                onClick={() => {
                  setSelectedMaterial(material);
                  setPage(1);
                  setLoadState("loading");
                }}
              >
                <span>
                  <span className="text-text-primary block text-sm font-medium">
                    {material.title}
                  </span>
                  <span className="text-text-secondary mt-1 block text-xs">
                    选择后仅显示与该材料关联的可用题目
                  </span>
                </span>
                <ChevronRight aria-hidden="true" className="size-4" />
              </button>
            ))}
          </div>
        ) : null}

        {loadState === "ready" &&
        (mode === "question" || selectedMaterial !== null) ? (
          <div className="space-y-2">
            {questions.length === 0 ? (
              <p className="text-text-secondary text-sm">
                没有匹配的可用题目，请调整筛选条件。
              </p>
            ) : null}
            {questions.map((question) => {
              const isSelected =
                selectedQuestion?.publicId === question.publicId;
              return (
                <button
                  aria-pressed={isSelected}
                  className={
                    isSelected
                      ? "bg-brand-primary/5 border-brand-primary flex w-full items-start gap-3 rounded-md border p-3 text-left"
                      : "bg-surface border-border hover:border-brand-primary flex w-full items-start gap-3 rounded-md border p-3 text-left"
                  }
                  key={question.publicId}
                  type="button"
                  onClick={() => void handleSelectQuestion(question)}
                >
                  <span className="bg-muted flex size-7 shrink-0 items-center justify-center rounded-md">
                    {isSelected ? (
                      <Check aria-hidden="true" className="size-4" />
                    ) : null}
                  </span>
                  <span className="min-w-0">
                    <span className="text-text-primary line-clamp-2 block text-sm font-medium">
                      {stripRichText(question.stemRichText) || "未填写题干"}
                    </span>
                    <span className="text-text-secondary mt-1 block text-xs">
                      {questionTypeLabels[question.questionType]}
                      {question.materialPublicId === null ? "" : " · 关联材料"}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        ) : null}

        {pagination.total > pagination.pageSize ? (
          <div className="flex items-center justify-between gap-3 text-sm">
            <span className="text-text-secondary">
              共 {pagination.total} 道
            </span>
            <div className="flex gap-2">
              <Button
                disabled={page <= 1}
                size="sm"
                type="button"
                variant="outline"
                onClick={() => {
                  setPage((current) => current - 1);
                  setLoadState("loading");
                }}
              >
                上一页
              </Button>
              <Button
                disabled={page * pagination.pageSize >= pagination.total}
                size="sm"
                type="button"
                variant="outline"
                onClick={() => {
                  setPage((current) => current + 1);
                  setLoadState("loading");
                }}
              >
                下一页
              </Button>
            </div>
          </div>
        ) : null}

        {selectedQuestion === null ? null : (
          <section className="bg-muted/30 border-border space-y-4 rounded-md border p-4">
            <h3 className="text-text-primary text-sm font-semibold">
              加入设置
            </h3>
            <div className="grid gap-3 md:grid-cols-2">
              <FilterSelect
                label="加入大题"
                options={[
                  ...paper.paperSections.map(
                    (paperSection) =>
                      [String(paperSection.sortOrder), paperSection.title] as [
                        string,
                        string,
                      ],
                  ),
                  ["new", "新建大题"],
                ]}
                value={targetSection}
                onChange={setTargetSection}
              />
              <label className="grid gap-2 text-sm font-medium">
                <span className="text-text-secondary">题目分值</span>
                <Input
                  aria-label="题目分值"
                  min="0"
                  step="0.5"
                  type="number"
                  value={score}
                  onChange={(event) => setScore(event.target.value)}
                />
              </label>
            </div>
            {targetSection === "new" ? (
              <div className="grid gap-3 md:grid-cols-2">
                <label className="grid gap-2 text-sm font-medium">
                  <span className="text-text-secondary">大题名称</span>
                  <Input
                    aria-label="大题名称"
                    value={newSectionTitle}
                    onChange={(event) => setNewSectionTitle(event.target.value)}
                  />
                </label>
                <label className="grid gap-2 text-sm font-medium">
                  <span className="text-text-secondary">大题说明</span>
                  <Input
                    aria-label="大题说明"
                    value={newSectionDescription}
                    onChange={(event) =>
                      setNewSectionDescription(event.target.value)
                    }
                  />
                </label>
              </div>
            ) : null}
            {errorMessage === null ? null : (
              <p className="text-destructive text-sm" role="alert">
                {errorMessage}
              </p>
            )}
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={onClose}>
                取消
              </Button>
              <Button
                disabled={isSubmitting || isResolvingMaterial}
                type="button"
                onClick={() => void handleAddQuestion()}
              >
                加入试卷
              </Button>
            </div>
          </section>
        )}
      </div>
    </AdminDetailDrawer>
  );
}
