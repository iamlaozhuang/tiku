"use client";

import { useMemo, useState } from "react";
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
import type { MaterialDto } from "@/server/contracts/material-contract";
import type { QuestionDto } from "@/server/contracts/question-contract";
import type {
  MaterialStatus,
  Profession,
  QuestionStatus,
  Subject,
} from "@/server/models/paper";

type ViewMode = "questions" | "materials";
type StatusFilter = "all" | QuestionStatus | MaterialStatus;
type ProfessionFilter = "all" | Profession;
type SubjectFilter = "all" | Subject;

type PaperReference = {
  paperPublicId: string;
  paperName: string;
  paperStatus: "draft" | "published" | "archived";
};

type QuestionReference = {
  questionPublicId: string;
  stem: string;
};

export type AdminQuestionRow = {
  question: QuestionDto;
  stemSummary: string;
  knowledgeNodeNames: string[];
  tagNames: string[];
  materialTitle: string | null;
  references: {
    papers: PaperReference[];
  };
};

export type AdminMaterialRow = {
  material: MaterialDto;
  references: {
    questions: QuestionReference[];
  };
};

export type AdminQuestionMaterialFixture = {
  questions: AdminQuestionRow[];
  materials: AdminMaterialRow[];
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

const paperStatusLabels: Record<PaperReference["paperStatus"], string> = {
  archived: "已归档",
  draft: "草稿",
  published: "已发布",
};

export const adminQuestionMaterialFixture: AdminQuestionMaterialFixture = {
  questions: [
    {
      question: {
        publicId: "question-marketing-001",
        questionType: "single_choice",
        profession: "marketing",
        level: 3,
        subject: "theory",
        stemRichText: "市场调研抽样方法的核心目标是什么？",
        analysisRichText: "抽样方法需要确保样本代表目标总体。",
        standardAnswerRichText: "提高样本代表性。",
        status: "available",
        isLocked: false,
        lockedAt: null,
        multiChoiceRule: "all_correct_only",
        scoringMethod: "auto_match",
        materialPublicId: "material-marketing-001",
        questionOptions: [
          {
            label: "A",
            contentRichText: "降低样本代表性",
            isCorrect: false,
            sortOrder: 1,
          },
          {
            label: "B",
            contentRichText: "提高样本代表性",
            isCorrect: true,
            sortOrder: 2,
          },
        ],
        scoringPoints: [],
        knowledgeNodePublicIds: ["knowledge-node-sampling"],
        tagPublicIds: ["tag-research"],
        createdAt: "2026-05-19T06:20:00.000Z",
        updatedAt: "2026-05-19T06:20:00.000Z",
      },
      stemSummary: "市场调研抽样方法的核心目标是什么？",
      knowledgeNodeNames: ["市场调研", "抽样方法"],
      tagNames: ["易错", "基础"],
      materialTitle: "营销案例材料 A",
      references: {
        papers: [
          {
            paperPublicId: "paper-marketing-2026-spring",
            paperName: "2026 春季营销理论模拟卷",
            paperStatus: "published",
          },
        ],
      },
    },
    {
      question: {
        publicId: "question-logistics-002",
        questionType: "short_answer",
        profession: "logistics",
        level: 2,
        subject: "skill",
        stemRichText: "物流成本核算适用于哪类场景？",
        analysisRichText: "物流成本核算用于评估运输、仓储和配送成本。",
        standardAnswerRichText: "适用于运输、仓储、配送等成本分析场景。",
        status: "disabled",
        isLocked: true,
        lockedAt: "2026-05-18T08:00:00.000Z",
        multiChoiceRule: "all_correct_only",
        scoringMethod: "ai_scoring",
        materialPublicId: null,
        questionOptions: [],
        scoringPoints: [
          {
            description: "说明至少两个成本构成",
            score: "4.0",
            sortOrder: 1,
          },
        ],
        knowledgeNodePublicIds: ["knowledge-node-costing"],
        tagPublicIds: ["tag-skill"],
        createdAt: "2026-05-18T05:10:00.000Z",
        updatedAt: "2026-05-19T03:10:00.000Z",
      },
      stemSummary: "物流成本核算适用于哪类场景？",
      knowledgeNodeNames: ["物流成本"],
      tagNames: ["实务", "停用复核"],
      materialTitle: null,
      references: {
        papers: [
          {
            paperPublicId: "paper-logistics-2026-practice",
            paperName: "物流技能练习卷",
            paperStatus: "draft",
          },
        ],
      },
    },
  ],
  materials: [
    {
      material: {
        publicId: "material-marketing-001",
        title: "营销案例材料 A",
        contentRichText: "某品牌计划进入区域市场，需要完成消费者抽样调研。",
        profession: "marketing",
        level: 3,
        subject: "theory",
        status: "available",
        isLocked: false,
        lockedAt: null,
        createdAt: "2026-05-19T06:00:00.000Z",
        updatedAt: "2026-05-19T06:00:00.000Z",
      },
      references: {
        questions: [
          {
            questionPublicId: "question-marketing-001",
            stem: "市场调研抽样方法的核心目标是什么？",
          },
        ],
      },
    },
    {
      material: {
        publicId: "material-monopoly-001",
        title: "专卖执法情境材料",
        contentRichText: "门店检查中发现卷烟陈列与进销存记录不一致。",
        profession: "monopoly",
        level: 2,
        subject: "skill",
        status: "disabled",
        isLocked: false,
        lockedAt: null,
        createdAt: "2026-05-17T02:00:00.000Z",
        updatedAt: "2026-05-18T02:00:00.000Z",
      },
      references: {
        questions: [],
      },
    },
  ],
};

export type AdminQuestionMaterialManagementProps = {
  defaultView?: ViewMode;
};

export function AdminQuestionMaterialManagement({
  defaultView = "questions",
}: AdminQuestionMaterialManagementProps) {
  const [activeView, setActiveView] = useState<ViewMode>(defaultView);
  const [keyword, setKeyword] = useState("");
  const [profession, setProfession] = useState<ProfessionFilter>("all");
  const [subject, setSubject] = useState<SubjectFilter>("all");
  const [status, setStatus] = useState<StatusFilter>("all");

  const filteredQuestions = useMemo(
    () =>
      adminQuestionMaterialFixture.questions.filter((row) => {
        const searchableText = [
          row.stemSummary,
          row.materialTitle,
          row.question.publicId,
          row.knowledgeNodeNames.join(" "),
          row.tagNames.join(" "),
          row.references.papers.map((paper) => paper.paperName).join(" "),
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        return (
          includesKeyword(searchableText, keyword) &&
          matchesFilter(row.question.profession, profession) &&
          matchesFilter(row.question.subject, subject) &&
          matchesFilter(row.question.status, status)
        );
      }),
    [keyword, profession, status, subject],
  );

  const filteredMaterials = useMemo(
    () =>
      adminQuestionMaterialFixture.materials.filter((row) => {
        const searchableText = [
          row.material.title,
          row.material.contentRichText,
          row.material.publicId,
          row.references.questions.map((question) => question.stem).join(" "),
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        return (
          includesKeyword(searchableText, keyword) &&
          matchesFilter(row.material.profession, profession) &&
          matchesFilter(row.material.subject, subject) &&
          matchesFilter(row.material.status, status)
        );
      }),
    [keyword, profession, status, subject],
  );

  const visibleCount =
    activeView === "questions"
      ? filteredQuestions.length
      : filteredMaterials.length;

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
            管理题目、材料、知识点标签与试卷引用关系；本基线只开放后台可见的
            publicId，不暴露内部自增 id。
          </p>
        </div>
        <ActionBar activeView={activeView} hasRows={visibleCount > 0} />
      </header>

      <div className="bg-surface border-border rounded-md border p-4 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end">
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
                onChange={(event) => setKeyword(event.target.value)}
              />
            </span>
          </label>
          <FilterSelect
            label="专业"
            value={profession}
            onChange={(value) => setProfession(value as ProfessionFilter)}
            options={[
              ["all", "全部专业"],
              ["marketing", "营销"],
              ["logistics", "物流"],
              ["monopoly", "专卖"],
            ]}
          />
          <FilterSelect
            label="科目"
            value={subject}
            onChange={(value) => setSubject(value as SubjectFilter)}
            options={[
              ["all", "全部科目"],
              ["theory", "理论"],
              ["skill", "技能"],
            ]}
          />
          <FilterSelect
            label="状态"
            value={status}
            onChange={(value) => setStatus(value as StatusFilter)}
            options={[
              ["all", "全部状态"],
              ["available", "可用"],
              ["disabled", "已停用"],
            ]}
          />
        </div>
      </div>

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
    <label className="flex min-w-40 flex-col gap-2 text-sm font-medium">
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

function QuestionList({ rows }: { rows: AdminQuestionRow[] }) {
  if (rows.length === 0) {
    return <EmptyState title="没有匹配的题目" />;
  }

  return (
    <div className="grid gap-3">
      {rows.map((row) => (
        <article
          className="bg-surface border-border rounded-md border p-4 shadow-sm"
          data-public-id={row.question.publicId}
          data-testid={`question-row-${row.question.publicId}`}
          key={row.question.publicId}
        >
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <StatusBadge status={row.question.status} />
                <span className="text-text-muted text-xs">
                  {questionTypeLabels[row.question.questionType]}
                </span>
                <span className="text-text-muted text-xs">
                  {formatScope(
                    row.question.profession,
                    row.question.level,
                    row.question.subject,
                  )}
                </span>
              </div>
              <h2 className="text-text-primary text-base font-semibold">
                {row.stemSummary}
              </h2>
              <div className="flex flex-wrap gap-2">
                {row.knowledgeNodeNames.map((name) => (
                  <span
                    className="bg-muted text-muted-foreground rounded-md px-2 py-1 text-xs"
                    key={name}
                  >
                    {name}
                  </span>
                ))}
                {row.tagNames.map((name) => (
                  <span
                    className="border-border text-text-secondary rounded-md border px-2 py-1 text-xs"
                    key={name}
                  >
                    {name}
                  </span>
                ))}
              </div>
            </div>
            <PublicId value={row.question.publicId} />
          </div>
          <ReferenceBlock
            emptyText="暂未被试卷引用"
            label="引用试卷"
            references={row.references.papers.map((paper) => ({
              key: paper.paperPublicId,
              title: paper.paperName,
              meta: paperStatusLabels[paper.paperStatus],
            }))}
          />
        </article>
      ))}
    </div>
  );
}

function MaterialList({ rows }: { rows: AdminMaterialRow[] }) {
  if (rows.length === 0) {
    return <EmptyState title="没有匹配的材料" />;
  }

  return (
    <div className="grid gap-3">
      {rows.map((row) => (
        <article
          className="bg-surface border-border rounded-md border p-4 shadow-sm"
          data-public-id={row.material.publicId}
          data-testid={`material-row-${row.material.publicId}`}
          key={row.material.publicId}
        >
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <StatusBadge status={row.material.status} />
                <span className="text-text-muted text-xs">
                  {formatScope(
                    row.material.profession,
                    row.material.level,
                    row.material.subject,
                  )}
                </span>
              </div>
              <h2 className="text-text-primary text-base font-semibold">
                {row.material.title}
              </h2>
              <p className="text-text-secondary line-clamp-2 text-sm">
                {row.material.contentRichText}
              </p>
            </div>
            <PublicId value={row.material.publicId} />
          </div>
          <ReferenceBlock
            emptyText="暂未关联题目"
            label="关联题目"
            references={row.references.questions.map((question) => ({
              key: question.questionPublicId,
              title: question.stem,
              meta: question.questionPublicId,
            }))}
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

function PublicId({ value }: { value: string }) {
  return (
    <code className="bg-muted text-text-secondary rounded-md px-2 py-1 font-mono text-xs">
      {value}
    </code>
  );
}

function ReferenceBlock({
  emptyText,
  label,
  references,
}: {
  emptyText: string;
  label: string;
  references: { key: string; title: string; meta: string }[];
}) {
  return (
    <div className="border-border mt-4 border-t pt-4">
      <p className="text-text-muted mb-2 text-xs font-medium">{label}</p>
      {references.length > 0 ? (
        <ul className="grid gap-2">
          {references.map((reference) => (
            <li className="text-sm" key={reference.key}>
              <span className="text-text-primary">{reference.title}</span>
              <span className="text-text-muted ml-2">{reference.meta}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-text-muted text-sm">{emptyText}</p>
      )}
    </div>
  );
}

function EmptyState({ title }: { title: string }) {
  return (
    <div className="bg-surface border-border rounded-md border p-8 text-center shadow-sm">
      <p className="text-text-primary font-medium">{title}</p>
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

function formatScope(profession: Profession, level: number, subject: Subject) {
  return `${professionLabels[profession]} / ${level}级 / ${subjectLabels[subject]}`;
}

function tabClassName(isActive: boolean) {
  const base =
    "inline-flex h-8 items-center gap-1.5 rounded-md px-3 text-sm font-medium transition-colors";

  if (isActive) {
    return `${base} bg-primary text-primary-foreground`;
  }

  return `${base} text-text-secondary hover:bg-muted hover:text-text-primary`;
}
