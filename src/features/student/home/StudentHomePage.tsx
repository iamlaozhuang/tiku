"use client";

import Link from "next/link";
import {
  AlertCircle,
  BookOpen,
  ClipboardList,
  Clock3,
  ListChecks,
  PlayCircle,
  Ticket,
  UserRound,
} from "lucide-react";
import { useMemo, useState } from "react";

import type {
  StudentPaperScopeDto,
  StudentPaperSummaryDto,
} from "@/server/contracts/student-paper-contract";
import type { Profession, Subject } from "@/server/models/paper";

type StudentHomeScopeSelection = {
  profession: Profession;
  level: number;
};

type StudentHomePageState = "ready" | "loading" | "error";

type StudentHomePageProps = {
  state?: StudentHomePageState;
  scopes?: StudentPaperScopeDto[];
  papers?: StudentPaperSummaryDto[];
  rememberedScope?: StudentHomeScopeSelection;
};

type SubjectGroup = {
  subject: Subject;
  papers: StudentPaperSummaryDto[];
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

const subjectOrder: Subject[] = ["theory", "skill"];

const selectedScopeSeparator = ":";

export const studentHomeFixture = {
  scopes: [
    {
      profession: "monopoly",
      level: 3,
      authorizationTypes: ["personal_auth"],
      expiresAt: "2026-08-31T15:59:59Z",
      status: "active",
    },
    {
      profession: "marketing",
      level: 3,
      authorizationTypes: ["org_auth"],
      expiresAt: "2026-09-30T15:59:59Z",
      status: "active",
    },
  ] satisfies StudentPaperScopeDto[],
  papers: [
    {
      publicId: "paper-marketing-theory-001",
      name: "营销理论冲刺卷 A",
      profession: "marketing",
      level: 3,
      subject: "theory",
      paperType: "mock_paper",
      durationMinute: 90,
      totalScore: "100",
      publishedAt: "2026-05-10T08:00:00Z",
      questionCount: 40,
      canPractice: true,
      canMockExam: true,
    },
    {
      publicId: "paper-marketing-theory-002",
      name: "营销理论冲刺卷 B",
      profession: "marketing",
      level: 3,
      subject: "theory",
      paperType: "past_paper",
      durationMinute: 120,
      totalScore: "100",
      publishedAt: "2026-05-18T08:00:00Z",
      questionCount: 42,
      canPractice: true,
      canMockExam: true,
    },
    {
      publicId: "paper-marketing-skill-001",
      name: "营销技能案例卷",
      profession: "marketing",
      level: 3,
      subject: "skill",
      paperType: "mock_paper",
      durationMinute: null,
      totalScore: "100",
      publishedAt: "2026-05-12T08:00:00Z",
      questionCount: 8,
      canPractice: true,
      canMockExam: true,
    },
    {
      publicId: "paper-monopoly-theory-001",
      name: "专卖理论真题卷",
      profession: "monopoly",
      level: 3,
      subject: "theory",
      paperType: "past_paper",
      durationMinute: 120,
      totalScore: "100",
      publishedAt: "2026-05-16T08:00:00Z",
      questionCount: 50,
      canPractice: true,
      canMockExam: true,
    },
  ] satisfies StudentPaperSummaryDto[],
};

function createScopeKey(scope: StudentHomeScopeSelection): string {
  return `${scope.profession}${selectedScopeSeparator}${scope.level}`;
}

function findInitialScope(
  scopes: StudentPaperScopeDto[],
  rememberedScope: StudentHomeScopeSelection | undefined,
): StudentPaperScopeDto | null {
  if (scopes.length === 0) {
    return null;
  }

  if (rememberedScope === undefined) {
    return scopes[0];
  }

  return (
    scopes.find(
      (scope) =>
        scope.profession === rememberedScope.profession &&
        scope.level === rememberedScope.level,
    ) ?? scopes[0]
  );
}

function formatScopeLabel(scope: StudentHomeScopeSelection): string {
  return `${professionLabels[scope.profession]} ${scope.level}级`;
}

function formatPublishedAt(publishedAt: string | null): string {
  if (publishedAt === null) {
    return "发布时间待定";
  }

  return `${publishedAt.slice(0, 10)} 发布`;
}

function formatDuration(durationMinute: number | null): string {
  return durationMinute === null ? "不限时" : `${durationMinute} 分钟`;
}

function selectSubjectGroups(
  papers: StudentPaperSummaryDto[],
  selectedScope: StudentPaperScopeDto | null,
): SubjectGroup[] {
  if (selectedScope === null) {
    return [];
  }

  return subjectOrder.map((subject) => ({
    subject,
    papers: papers
      .filter(
        (paper) =>
          paper.profession === selectedScope.profession &&
          paper.level === selectedScope.level &&
          paper.subject === subject,
      )
      .toSorted((leftPaper, rightPaper) =>
        (rightPaper.publishedAt ?? "").localeCompare(
          leftPaper.publishedAt ?? "",
        ),
      ),
  }));
}

function StudentHomeStatusMessage({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <section className="mx-auto flex min-h-[calc(100vh-7rem)] max-w-md flex-col items-center justify-center gap-3 px-6 text-center">
      <div className="bg-secondary text-secondary-foreground flex size-11 items-center justify-center rounded-full">
        <AlertCircle className="size-5" aria-hidden="true" />
      </div>
      <h2 className="font-heading text-text-primary text-lg font-semibold">
        {title}
      </h2>
      <p className="text-text-secondary text-sm leading-6">{description}</p>
    </section>
  );
}

function StudentHomeLoading() {
  return (
    <section className="space-y-4 p-4" aria-busy="true">
      <div>
        <p className="text-text-secondary text-sm">正在加载授权范围</p>
        <div className="bg-border mt-3 h-9 w-44 animate-pulse rounded-lg" />
      </div>
      <div className="space-y-3">
        {[0, 1, 2].map((itemIndex) => (
          <div
            key={itemIndex}
            className="bg-surface ring-border flex flex-col gap-3 rounded-xl p-4 shadow-sm ring-1"
          >
            <div className="bg-border h-4 w-3/4 animate-pulse rounded" />
            <div className="bg-border h-3 w-1/2 animate-pulse rounded" />
            <div className="flex gap-2">
              <div className="bg-border h-8 flex-1 animate-pulse rounded-lg" />
              <div className="bg-border h-8 flex-1 animate-pulse rounded-lg" />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function StudentPaperCard({ paper }: { paper: StudentPaperSummaryDto }) {
  return (
    <article
      data-testid={`paper-card-${paper.publicId}`}
      data-public-id={paper.publicId}
      className="bg-surface ring-border flex flex-col gap-4 rounded-xl p-4 shadow-sm ring-1"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 space-y-1">
          <h3 className="font-heading text-text-primary text-base leading-6 font-semibold">
            {paper.name}
          </h3>
          <p className="text-text-secondary text-sm">
            {formatPublishedAt(paper.publishedAt)}
          </p>
        </div>
        <span className="bg-secondary text-secondary-foreground shrink-0 rounded-lg px-2 py-1 text-xs font-medium">
          {paper.paperType === "past_paper" ? "真题" : "模拟"}
        </span>
      </div>

      <div className="text-text-secondary grid grid-cols-3 gap-2 text-xs">
        <span className="bg-background flex items-center gap-1 rounded-lg px-2 py-2">
          <ClipboardList className="size-3.5" aria-hidden="true" />
          {paper.questionCount} 题
        </span>
        <span className="bg-background flex items-center gap-1 rounded-lg px-2 py-2">
          <Clock3 className="size-3.5" aria-hidden="true" />
          {formatDuration(paper.durationMinute)}
        </span>
        <span className="bg-background flex items-center gap-1 rounded-lg px-2 py-2">
          <BookOpen className="size-3.5" aria-hidden="true" />
          {paper.totalScore ?? "总分待定"}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <Link
          href={`/practice?paperPublicId=${paper.publicId}`}
          aria-disabled={!paper.canPractice}
          className="bg-primary text-primary-foreground flex h-9 items-center justify-center gap-1.5 rounded-lg text-sm font-medium transition-transform active:scale-[0.98] aria-disabled:pointer-events-none aria-disabled:opacity-50"
        >
          <PlayCircle className="size-4" aria-hidden="true" />
          练习
        </Link>
        <Link
          href={`/mock-exam?paperPublicId=${paper.publicId}`}
          aria-disabled={!paper.canMockExam}
          className="border-border text-text-primary hover:bg-muted flex h-9 items-center justify-center gap-1.5 rounded-lg border bg-transparent text-sm font-medium transition-transform active:scale-[0.98] aria-disabled:pointer-events-none aria-disabled:opacity-50"
        >
          模拟考试
        </Link>
      </div>
    </article>
  );
}

export function StudentHomePage({
  state = "ready",
  scopes = studentHomeFixture.scopes,
  papers = studentHomeFixture.papers,
  rememberedScope,
}: StudentHomePageProps) {
  const initialScope = findInitialScope(scopes, rememberedScope);
  const [selectedScopeKey, setSelectedScopeKey] = useState(
    initialScope === null ? "" : createScopeKey(initialScope),
  );
  const selectedScope =
    scopes.find((scope) => createScopeKey(scope) === selectedScopeKey) ??
    initialScope;
  const subjectGroups = useMemo(
    () => selectSubjectGroups(papers, selectedScope),
    [papers, selectedScope],
  );
  const visiblePaperCount = subjectGroups.reduce(
    (paperCount, group) => paperCount + group.papers.length,
    0,
  );

  if (state === "loading") {
    return <StudentHomeLoading />;
  }

  if (state === "error") {
    return (
      <StudentHomeStatusMessage
        title="学员首页加载失败"
        description="请稍后刷新页面，或重新登录后再查看授权范围。"
      />
    );
  }

  if (scopes.length === 0) {
    return (
      <section className="mx-auto flex min-h-[calc(100vh-7rem)] max-w-md flex-col items-center justify-center gap-4 px-6 text-center">
        <div className="bg-secondary text-secondary-foreground flex size-11 items-center justify-center rounded-full">
          <AlertCircle className="size-5" aria-hidden="true" />
        </div>
        <div className="space-y-2">
          <h2 className="font-heading text-text-primary text-lg font-semibold">
            暂无有效授权
          </h2>
          <p className="text-text-secondary text-sm leading-6">
            兑换卡密或联系企业管理员开通授权后，即可查看对应专业和等级的试卷。
          </p>
        </div>
        <Link
          href="/redeem-code"
          className="bg-primary text-primary-foreground flex h-9 items-center justify-center rounded-lg px-4 text-sm font-medium transition-transform active:scale-[0.98]"
        >
          前往兑换卡密
        </Link>
      </section>
    );
  }

  return (
    <section className="mx-auto flex w-full max-w-3xl flex-col gap-5 px-4 py-5 pb-20">
      <div className="flex flex-col gap-3">
        <div className="space-y-2">
          <p className="text-brand-primary text-sm font-medium">继续学习</p>
          <h1 className="font-heading text-text-primary text-2xl font-semibold">
            学员首页
          </h1>
          <p className="text-text-secondary text-sm leading-6">
            选择当前授权范围，按科目进入练习或模拟考试。
          </p>
        </div>
        <nav className="grid grid-cols-3 gap-2" aria-label="学员导航">
          <Link
            href="/profile"
            className="border-border bg-surface text-text-primary hover:bg-muted flex h-10 items-center justify-center gap-1.5 rounded-lg border text-sm font-medium transition-transform active:scale-[0.98]"
          >
            <UserRound className="size-4" aria-hidden="true" />
            个人中心
          </Link>
          <Link
            href="/redeem-code"
            className="border-border bg-surface text-text-primary hover:bg-muted flex h-10 items-center justify-center gap-1.5 rounded-lg border text-sm font-medium transition-transform active:scale-[0.98]"
          >
            <Ticket className="size-4" aria-hidden="true" />
            兑换卡密
          </Link>
          <Link
            href="/mistake-book"
            className="border-border bg-surface text-text-primary hover:bg-muted flex h-10 items-center justify-center gap-1.5 rounded-lg border text-sm font-medium transition-transform active:scale-[0.98]"
          >
            <ListChecks className="size-4" aria-hidden="true" />
            错题本
          </Link>
        </nav>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1" aria-label="授权范围">
        {scopes.map((scope) => {
          const scopeKey = createScopeKey(scope);
          const isSelected = scopeKey === selectedScopeKey;

          return (
            <button
              key={scopeKey}
              type="button"
              aria-pressed={isSelected}
              onClick={() => setSelectedScopeKey(scopeKey)}
              className={`h-9 shrink-0 rounded-lg px-3 text-sm font-medium transition-transform active:scale-[0.98] ${
                isSelected
                  ? "bg-primary text-primary-foreground"
                  : "border-border bg-surface text-text-secondary border"
              }`}
            >
              {formatScopeLabel(scope)}
            </button>
          );
        })}
      </div>

      {visiblePaperCount === 0 ? (
        <StudentHomeStatusMessage
          title="当前范围暂无试卷"
          description="该授权范围下暂未发布可学习试卷，请稍后查看。"
        />
      ) : (
        <div className="space-y-5">
          {subjectGroups.map((group) => (
            <section
              key={group.subject}
              data-testid={`subject-group-${group.subject}`}
              className="space-y-3"
            >
              <div className="flex items-center justify-between">
                <h2 className="font-heading text-text-primary text-lg font-semibold">
                  {subjectLabels[group.subject]}
                </h2>
                <span className="text-text-secondary text-sm">
                  {group.papers.length} 套
                </span>
              </div>
              {group.papers.length === 0 ? (
                <div className="border-border text-text-secondary rounded-xl border border-dashed p-4 text-sm">
                  暂无{subjectLabels[group.subject]}试卷
                </div>
              ) : (
                <div className="space-y-3">
                  {group.papers.map((paper) => (
                    <StudentPaperCard key={paper.publicId} paper={paper} />
                  ))}
                </div>
              )}
            </section>
          ))}
        </div>
      )}
    </section>
  );
}
