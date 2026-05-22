"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Copy,
  FileQuestion,
  FileText,
  Pencil,
  Plus,
  Search,
  ShieldOff,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { AuthContextDto } from "@/server/contracts/auth-contract";
import type { MaterialDto } from "@/server/contracts/material-contract";
import type { QuestionDto } from "@/server/contracts/question-contract";
import type {
  MaterialStatus,
  Profession,
  QuestionStatus,
  Subject,
} from "@/server/models/paper";

import {
  AdminErrorState,
  AdminLoadingState,
  AdminUnauthorizedState,
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

type ContentLoadState =
  | "loading"
  | "ready"
  | "empty"
  | "unauthorized"
  | "error";

export type AdminQuestionMaterialManagementProps = {
  defaultView?: ViewMode;
};

const statusLabels: Record<QuestionStatus | MaterialStatus, string> = {
  available: "可用",
  disabled: "已停用",
};

const questionTypeLabels: Record<QuestionDto["questionType"], string> = {
  fill_blank: "填空题",
  multi_choice: "多选题",
  short_answer: "简答题",
  single_choice: "单选题",
  true_false: "判断题",
};

function readQuestionSummary(question: QuestionDto): string {
  return stripRichText(question.stemRichText);
}

function stripRichText(value: string): string {
  return value.replace(/<[^>]*>/g, "").trim();
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
        const contentResponse =
          activeView === "questions"
            ? await fetchAdminApi<QuestionDto[]>(path, sessionToken)
            : await fetchAdminApi<MaterialDto[]>(path, sessionToken);

        if (!isActive) {
          return;
        }

        if (contentResponse.code !== 0 || contentResponse.data === null) {
          setLoadState("error");
          return;
        }

        if (activeView === "questions") {
          setQuestions(contentResponse.data as QuestionDto[]);
          setLoadState(contentResponse.data.length === 0 ? "empty" : "ready");
          return;
        }

        setMaterials(contentResponse.data as MaterialDto[]);
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

  return { loadState, materials, questions };
}

export function AdminQuestionMaterialManagement({
  defaultView = "questions",
}: AdminQuestionMaterialManagementProps) {
  const [activeView, setActiveView] = useState<ViewMode>(defaultView);
  const [keyword, setKeyword] = useState("");
  const [profession, setProfession] = useState<ProfessionFilter>("all");
  const [subject, setSubject] = useState<SubjectFilter>("all");
  const [status, setStatus] = useState<StatusFilter>("all");
  const { loadState, materials, questions } =
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
          matchesFilter(question.profession, profession) &&
          matchesFilter(question.subject, subject) &&
          matchesFilter(question.status, status)
        );
      }),
    [keyword, profession, questions, status, subject],
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
          matchesFilter(material.profession, profession) &&
          matchesFilter(material.subject, subject) &&
          matchesFilter(material.status, status)
        );
      }),
    [keyword, materials, profession, status, subject],
  );
  const visibleCount =
    activeView === "questions"
      ? filteredQuestions.length
      : filteredMaterials.length;

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
        <ActionBar activeView={activeView} hasRows={visibleCount > 0} />
      </header>

      <FilterPanel
        keyword={keyword}
        profession={profession}
        status={status}
        subject={subject}
        onKeywordChange={setKeyword}
        onProfessionChange={setProfession}
        onStatusChange={setStatus}
        onSubjectChange={setSubject}
      />

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

      {activeView === "questions" ? (
        <QuestionList rows={filteredQuestions} />
      ) : (
        <MaterialList rows={filteredMaterials} />
      )}
    </section>
  );
}

function ActionBar({
  activeView,
  hasRows,
}: {
  activeView: ViewMode;
  hasRows: boolean;
}) {
  const noun = activeView === "questions" ? "题目" : "材料";

  return (
    <div className="flex flex-wrap gap-2">
      <Button>
        <Plus aria-hidden="true" data-icon="inline-start" />
        新建{noun}
      </Button>
      <Button disabled={!hasRows} variant="outline">
        <Pencil aria-hidden="true" data-icon="inline-start" />
        编辑{noun}
      </Button>
      <Button disabled={!hasRows} variant="outline">
        <ShieldOff aria-hidden="true" data-icon="inline-start" />
        停用{noun}
      </Button>
      <Button disabled={!hasRows} variant="secondary">
        <Copy aria-hidden="true" data-icon="inline-start" />
        复制{noun}
      </Button>
    </div>
  );
}

function FilterPanel({
  keyword,
  profession,
  status,
  subject,
  onKeywordChange,
  onProfessionChange,
  onStatusChange,
  onSubjectChange,
}: {
  keyword: string;
  profession: ProfessionFilter;
  status: StatusFilter;
  subject: SubjectFilter;
  onKeywordChange: (value: string) => void;
  onProfessionChange: (value: ProfessionFilter) => void;
  onStatusChange: (value: StatusFilter) => void;
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
            ["available", "可用"],
            ["disabled", "已停用"],
          ]}
          value={status}
          onChange={(value) => onStatusChange(value as StatusFilter)}
        />
      </div>
    </div>
  );
}

function QuestionList({ rows }: { rows: QuestionDto[] }) {
  if (rows.length === 0) {
    return <FilteredEmptyState title="没有匹配的题目" />;
  }

  return (
    <div className="grid gap-3">
      {rows.map((question) => (
        <article
          className="bg-surface border-border rounded-md border p-4 shadow-sm"
          data-public-id={question.publicId}
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
          <ReferenceBlock
            label="关联材料"
            value={question.materialPublicId ?? "未关联材料"}
          />
        </article>
      ))}
    </div>
  );
}

function MaterialList({ rows }: { rows: MaterialDto[] }) {
  if (rows.length === 0) {
    return <FilteredEmptyState title="没有匹配的材料" />;
  }

  return (
    <div className="grid gap-3">
      {rows.map((material) => (
        <article
          className="bg-surface border-border rounded-md border p-4 shadow-sm"
          data-public-id={material.publicId}
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
          <ReferenceBlock
            label="材料锁定"
            value={material.isLocked ? "已被发布试卷锁定" : "未锁定"}
          />
        </article>
      ))}
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
