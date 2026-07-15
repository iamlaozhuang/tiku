"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  Archive,
  ArrowLeft,
  CheckCircle2,
  ClipboardCheck,
  Copy,
  FileCheck2,
  Layers3,
  Library,
  Pencil,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import type { AuthContextDto } from "@/server/contracts/auth-contract";
import type {
  PaperCopyResultDto,
  PaperDraftDto,
  PaperPublishResultDto,
  PaperQuestionDto,
  PaperSectionDto,
} from "@/server/contracts/paper-draft-contract";

import {
  AdminErrorState,
  AdminLoadingState,
  AdminUnauthorizedState,
  fetchAdminApi,
  formatScope,
  getStoredSessionToken,
  isAdminContext,
  isUnauthorizedResponse,
} from "../content-admin-runtime";
import {
  PaperComposerQuestionEditorDrawer,
  type PaperQuestionEditorSubmitInput,
} from "./PaperComposerQuestionEditorDrawer";
import {
  PaperComposerQuestionPickerDrawer,
  type PaperQuestionAddInput,
} from "./PaperComposerQuestionPickerDrawer";
import { createPaperComposerValidation } from "./paper-composer-model";

type LoadState = "loading" | "ready" | "unauthorized" | "not_found" | "error";
type PickerMode = "question" | "material";
type QuestionEditorTarget = {
  paperQuestion: PaperQuestionDto;
  paperSection: PaperSectionDto;
};
type PendingAction =
  | { kind: "publish"; commandPublicId: string }
  | { kind: "archive" }
  | { kind: "copy"; commandPublicId: string }
  | { kind: "remove"; paperQuestionPublicId: string };

function stripRichText(value: string) {
  return value
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function statusLabel(paper: PaperDraftDto) {
  if (paper.paperStatus === "published") return "已发布，只读查看";
  if (paper.paperStatus === "archived") return "已下架，只读查看";
  return "草稿，可继续组卷";
}

function mutationErrorMessage(action: string) {
  return `${action}失败。当前页面已保留，请刷新数据后重试。`;
}

function createPaperCommandPublicId(commandKind: string): string {
  const uniqueSuffix =
    typeof globalThis.crypto?.randomUUID === "function"
      ? globalThis.crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(16).slice(2)}`;

  return `paper-command-${commandKind}-${uniqueSuffix}`;
}

async function mutatePaperApi<TData>(
  path: string,
  method: "POST" | "PATCH" | "DELETE",
  body?: unknown,
) {
  return fetchAdminApi<TData>(path, getStoredSessionToken(), {
    method,
    headers:
      body === undefined ? undefined : { "content-type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
}

export function AdminPaperComposerPage({
  paperPublicId,
}: {
  paperPublicId: string;
}) {
  const [loadState, setLoadState] = useState<LoadState>("loading");
  const [paper, setPaper] = useState<PaperDraftDto | null>(null);
  const [pickerMode, setPickerMode] = useState<PickerMode | null>(null);
  const [editorTarget, setEditorTarget] = useState<QuestionEditorTarget | null>(
    null,
  );
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(
    null,
  );
  const [isMutating, setIsMutating] = useState(false);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [copiedPaperPublicId, setCopiedPaperPublicId] = useState<string | null>(
    null,
  );
  const paperCommandPublicIdsRef = useRef(new Map<string, string>());

  function getOrCreatePaperCommandPublicId(
    commandKey: string,
    commandKind: string,
  ): string {
    const existing = paperCommandPublicIdsRef.current.get(commandKey);

    if (existing !== undefined) {
      return existing;
    }

    const commandPublicId = createPaperCommandPublicId(commandKind);
    paperCommandPublicIdsRef.current.set(commandKey, commandPublicId);
    return commandPublicId;
  }

  function createLifecycleCommandKey(commandKind: "publish" | "copy") {
    return `${commandKind}:${paperPublicId}:${paper?.revision ?? 0}`;
  }

  function releasePaperCommandPublicId(commandKey: string) {
    paperCommandPublicIdsRef.current.delete(commandKey);
  }

  const loadPaper = useCallback(async () => {
    const response = await fetchAdminApi<{ paper: PaperDraftDto }>(
      `/api/v1/papers/${paperPublicId}`,
      getStoredSessionToken(),
    );

    if (isUnauthorizedResponse(response)) {
      setLoadState("unauthorized");
      return false;
    }
    if (response.code === 403001 || response.code === 404203) {
      setLoadState("not_found");
      return false;
    }
    if (response.code !== 0 || response.data === null) {
      setLoadState("error");
      return false;
    }

    setPaper(response.data.paper);
    setLoadState("ready");
    return true;
  }, [paperPublicId]);

  useEffect(() => {
    const sessionToken = getStoredSessionToken();
    void fetchAdminApi<AuthContextDto>("/api/v1/sessions", sessionToken)
      .then(async (sessionResponse) => {
        if (
          isUnauthorizedResponse(sessionResponse) ||
          sessionResponse.data === null ||
          !isAdminContext(sessionResponse.data)
        ) {
          setLoadState("unauthorized");
          return;
        }
        await loadPaper();
      })
      .catch(() => setLoadState("error"));
  }, [loadPaper]);

  const validation = useMemo(
    () => (paper === null ? null : createPaperComposerValidation(paper)),
    [paper],
  );

  async function handleAddQuestion(input: PaperQuestionAddInput) {
    setActionError(null);
    const expectedRevision = paper?.revision ?? 0;
    const commandKey = `add_question:${paperPublicId}:${expectedRevision}:${JSON.stringify(
      input,
    )}`;
    const response = await mutatePaperApi(
      `/api/v1/papers/${paperPublicId}/questions`,
      "POST",
      {
        ...input,
        commandPublicId: getOrCreatePaperCommandPublicId(
          commandKey,
          "add-question",
        ),
        expectedRevision,
      },
    );
    if (response.code !== 0) {
      setActionError(mutationErrorMessage("加入题目"));
      return false;
    }
    releasePaperCommandPublicId(commandKey);
    await loadPaper();
    setActionMessage("题目已加入试卷，并保存当前题目与材料快照。");
    return true;
  }

  async function handleUpdateQuestion(input: PaperQuestionEditorSubmitInput) {
    if (editorTarget === null) return false;
    setActionError(null);
    const response = await mutatePaperApi(
      `/api/v1/papers/${paperPublicId}/questions/${editorTarget.paperQuestion.publicId}`,
      "PATCH",
      { ...input, expectedRevision: paper?.revision ?? 0 },
    );
    if (response.code !== 0) {
      setActionError(mutationErrorMessage("保存题目设置"));
      return false;
    }
    await loadPaper();
    setActionMessage("题目分值、顺序、大题归属和本卷评分点已保存。");
    return true;
  }

  async function handleRemoveQuestion(paperQuestionPublicId: string) {
    const response = await mutatePaperApi(
      `/api/v1/papers/${paperPublicId}/questions/${paperQuestionPublicId}`,
      "DELETE",
      { expectedRevision: paper?.revision ?? 0 },
    );
    if (response.code !== 0) {
      setActionError(mutationErrorMessage("移出题目"));
      return;
    }
    await loadPaper();
    setActionMessage("题目已从当前草稿移出，题库母题未受影响。");
  }

  async function handleLifecycleAction(action: PendingAction) {
    setIsMutating(true);
    setActionError(null);
    try {
      if (action.kind === "remove") {
        await handleRemoveQuestion(action.paperQuestionPublicId);
        return;
      }

      if (action.kind === "publish") {
        const response = await mutatePaperApi<PaperPublishResultDto>(
          `/api/v1/papers/${paperPublicId}/publish`,
          "POST",
          {
            commandPublicId: action.commandPublicId,
            expectedRevision: paper?.revision ?? 0,
          },
        );
        if (response.code !== 0 || response.data === null) {
          setActionError("发布校验未通过。请按右侧阻断项逐项处理后重新发布。");
          return;
        }
        releasePaperCommandPublicId(createLifecycleCommandKey("publish"));
        setPaper(response.data.paper);
        setActionMessage("试卷已发布，内容和评分规则现已锁定。");
        return;
      }

      if (action.kind === "archive") {
        const response = await mutatePaperApi<{ paper: PaperDraftDto }>(
          `/api/v1/papers/${paperPublicId}/archive`,
          "POST",
          { expectedRevision: paper?.revision ?? 0 },
        );
        if (response.code !== 0 || response.data === null) {
          setActionError(mutationErrorMessage("下架试卷"));
          return;
        }
        setPaper(response.data.paper);
        setActionMessage("试卷已下架，历史报告仍按既有规则保留。");
        return;
      }

      const response = await mutatePaperApi<PaperCopyResultDto>(
        `/api/v1/papers/${paperPublicId}/copy`,
        "POST",
        {
          commandPublicId: action.commandPublicId,
          expectedRevision: paper?.revision ?? 0,
        },
      );
      if (response.code !== 0 || response.data === null) {
        setActionError(mutationErrorMessage("复制试卷"));
        return;
      }
      releasePaperCommandPublicId(createLifecycleCommandKey("copy"));
      setCopiedPaperPublicId(response.data.paper.publicId);
      setActionMessage("已复制为新草稿，可进入新草稿继续组卷。");
    } finally {
      setPendingAction(null);
      setIsMutating(false);
    }
  }

  if (loadState === "loading") {
    return <AdminLoadingState label="正在加载组卷工作台" />;
  }
  if (loadState === "unauthorized") return <AdminUnauthorizedState />;
  if (loadState === "not_found") {
    return (
      <AdminErrorState
        description="该试卷不存在，或当前角色没有查看权限。请返回试卷管理重新选择。"
        title="无法打开试卷"
      />
    );
  }
  if (loadState === "error" || paper === null || validation === null) {
    return (
      <AdminErrorState
        description="请稍后刷新页面，或返回试卷管理重新进入。"
        title="组卷工作台加载失败"
      />
    );
  }

  const isDraft = paper.paperStatus === "draft";
  return (
    <main className="space-y-5">
      <header className="border-border bg-surface space-y-4 rounded-md border p-4 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0 space-y-2">
            <Link
              className="text-brand-primary inline-flex items-center gap-1 text-sm font-medium"
              href="/content/papers"
            >
              <ArrowLeft aria-hidden="true" className="size-4" />
              返回试卷管理
            </Link>
            <p className="text-brand-primary text-xs font-medium">组卷工作台</p>
            <h1 className="font-heading text-text-primary text-2xl font-semibold">
              {paper.name}
            </h1>
            <p className="text-text-secondary text-sm">
              {formatScope(paper)} · {statusLabel(paper)}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {isDraft ? (
              <>
                <Button type="button" onClick={() => setPickerMode("question")}>
                  <Library aria-hidden="true" data-icon="inline-start" />
                  从题库选题
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setPickerMode("material")}
                >
                  <Layers3 aria-hidden="true" data-icon="inline-start" />
                  按材料选题
                </Button>
                <Button
                  disabled={validation.blockers.length > 0}
                  type="button"
                  variant="outline"
                  onClick={() =>
                    setPendingAction({
                      kind: "publish",
                      commandPublicId: getOrCreatePaperCommandPublicId(
                        createLifecycleCommandKey("publish"),
                        "publish",
                      ),
                    })
                  }
                >
                  <FileCheck2 aria-hidden="true" data-icon="inline-start" />
                  发布试卷
                </Button>
              </>
            ) : null}
            {paper.paperStatus === "published" ? (
              <Button
                type="button"
                variant="destructive"
                onClick={() => setPendingAction({ kind: "archive" })}
              >
                <Archive aria-hidden="true" data-icon="inline-start" />
                下架试卷
              </Button>
            ) : null}
            {paper.paperStatus !== "draft" ? (
              <Button
                type="button"
                variant="outline"
                onClick={() =>
                  setPendingAction({
                    kind: "copy",
                    commandPublicId: getOrCreatePaperCommandPublicId(
                      createLifecycleCommandKey("copy"),
                      "copy",
                    ),
                  })
                }
              >
                <Copy aria-hidden="true" data-icon="inline-start" />
                复制为新草稿
              </Button>
            ) : null}
          </div>
        </div>
        <dl className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          <StatusMetric label="题量" value={`${paper.questionCount} / 100`} />
          <StatusMetric
            label="试卷总分"
            value={`${paper.totalScore ?? "未设置"} 分`}
          />
          <StatusMetric
            label="大题"
            value={`${paper.paperSections.length} 个`}
          />
          <StatusMetric
            label="发布校验"
            value={
              validation.blockers.length === 0
                ? "可以发布"
                : `${validation.blockers.length} 项待处理`
            }
          />
        </dl>
      </header>

      {actionMessage === null ? null : (
        <div
          className="bg-success/10 text-text-primary border-success/30 flex items-center gap-2 rounded-md border p-3 text-sm"
          role="status"
        >
          <CheckCircle2 aria-hidden="true" className="text-success size-4" />
          <span>{actionMessage}</span>
          {copiedPaperPublicId === null ? null : (
            <Link
              className="text-brand-primary ml-auto font-medium"
              href={`/content/papers/${copiedPaperPublicId}/compose`}
            >
              进入新草稿
            </Link>
          )}
        </div>
      )}
      {actionError === null ? null : (
        <p
          className="bg-destructive/10 text-destructive rounded-md p-3 text-sm"
          role="alert"
        >
          {actionError}
        </p>
      )}

      <div className="grid items-start gap-4 xl:grid-cols-[14rem_minmax(0,1fr)_19rem]">
        <aside className="border-border bg-surface rounded-md border p-3 xl:sticky xl:top-4">
          <h2 className="text-text-primary text-sm font-semibold">试卷结构</h2>
          <nav aria-label="试卷大题" className="mt-3 space-y-1">
            {paper.paperSections.length === 0 ? (
              <p className="text-text-secondary text-xs leading-5">
                尚无大题。加入第一道题时可创建大题。
              </p>
            ) : null}
            {paper.paperSections.map((paperSection) => (
              <a
                className="hover:bg-muted flex items-center justify-between gap-2 rounded-md px-2 py-2 text-sm"
                href={`#paper-section-${paperSection.sortOrder}`}
                key={`${paperSection.sortOrder}-${paperSection.title}`}
              >
                <span className="text-text-primary truncate">
                  {paperSection.title}
                </span>
                <span className="text-text-muted shrink-0 text-xs">
                  {paperSection.paperQuestions.length} 题
                </span>
              </a>
            ))}
          </nav>
        </aside>

        <section aria-label="试卷内容" className="space-y-4">
          {paper.paperSections.length === 0 ? (
            <div className="border-border bg-surface rounded-md border p-8 text-center">
              <ClipboardCheck
                aria-hidden="true"
                className="text-text-muted mx-auto size-8"
              />
              <h2 className="text-text-primary mt-3 text-base font-semibold">
                从第一道题开始组卷
              </h2>
              <p className="text-text-secondary mt-2 text-sm">
                从题库或材料进入，选择题目并设置所属大题与分值。
              </p>
            </div>
          ) : null}
          {paper.paperSections.map((paperSection) => (
            <PaperSectionCanvas
              isDraft={isDraft}
              key={`${paperSection.sortOrder}-${paperSection.title}`}
              paperSection={paperSection}
              onEdit={(paperQuestion) =>
                setEditorTarget({ paperQuestion, paperSection })
              }
            />
          ))}
        </section>

        <aside className="border-border bg-surface rounded-md border p-4 xl:sticky xl:top-4">
          <div className="flex items-start gap-3">
            {validation.blockers.length === 0 ? (
              <CheckCircle2
                aria-hidden="true"
                className="text-success mt-0.5 size-5"
              />
            ) : (
              <AlertTriangle
                aria-hidden="true"
                className="text-warning mt-0.5 size-5"
              />
            )}
            <div>
              <h2 className="text-text-primary text-sm font-semibold">
                发布校验
              </h2>
              <p className="text-text-secondary mt-1 text-xs leading-5">
                {validation.blockers.length === 0
                  ? "当前结构满足本地预检，发布时仍由服务端最终校验。"
                  : "处理全部阻断项后才能提交发布。"}
              </p>
            </div>
          </div>
          <div className="mt-4 space-y-2">
            {validation.blockers.map((issue, index) =>
              issue.targetPaperSectionSortOrder === null ? (
                <p
                  className="bg-destructive/5 border-destructive/20 text-text-secondary rounded-md border p-2 text-xs leading-5"
                  key={`${issue.code}-${index}`}
                >
                  {issue.message}
                </p>
              ) : (
                <a
                  className="bg-destructive/5 border-destructive/20 text-text-secondary block rounded-md border p-2 text-xs leading-5"
                  href={`#paper-section-${issue.targetPaperSectionSortOrder}`}
                  key={`${issue.code}-${index}`}
                >
                  {issue.message} 定位查看
                </a>
              ),
            )}
            {validation.warnings.map((issue, index) => (
              <a
                className="bg-warning/10 border-warning/30 text-text-secondary block rounded-md border p-2 text-xs leading-5"
                href={
                  issue.targetPaperSectionSortOrder === null
                    ? "#"
                    : `#paper-section-${issue.targetPaperSectionSortOrder}`
                }
                key={`warning-${issue.code}-${index}`}
              >
                提醒：{issue.message}
              </a>
            ))}
          </div>
        </aside>
      </div>

      {pickerMode === null ? null : (
        <PaperComposerQuestionPickerDrawer
          mode={pickerMode}
          paper={paper}
          onAdd={handleAddQuestion}
          onClose={() => setPickerMode(null)}
        />
      )}
      {editorTarget === null ? null : (
        <PaperComposerQuestionEditorDrawer
          paperQuestion={editorTarget.paperQuestion}
          paperSection={editorTarget.paperSection}
          paperSections={paper.paperSections}
          onClose={() => setEditorTarget(null)}
          onRemove={async () => {
            setPendingAction({
              kind: "remove",
              paperQuestionPublicId: editorTarget.paperQuestion.publicId,
            });
            return true;
          }}
          onSubmit={handleUpdateQuestion}
        />
      )}
      {pendingAction === null ? null : (
        <PaperComposerConfirmationDialog
          action={pendingAction}
          isSubmitting={isMutating}
          onCancel={() => setPendingAction(null)}
          onConfirm={() => void handleLifecycleAction(pendingAction)}
        />
      )}
    </main>
  );
}

function StatusMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-muted/30 border-border rounded-md border px-3 py-2">
      <dt className="text-text-muted text-xs">{label}</dt>
      <dd className="text-text-primary mt-1 text-sm font-semibold">{value}</dd>
    </div>
  );
}

function PaperSectionCanvas({
  isDraft,
  paperSection,
  onEdit,
}: {
  isDraft: boolean;
  paperSection: PaperSectionDto;
  onEdit: (paperQuestion: PaperQuestionDto) => void;
}) {
  return (
    <section
      className="border-border bg-surface rounded-md border p-4 shadow-sm"
      id={`paper-section-${paperSection.sortOrder}`}
    >
      <header className="border-border flex flex-wrap items-start justify-between gap-3 border-b pb-3">
        <div>
          <p className="text-text-muted text-xs">
            第 {paperSection.sortOrder} 大题
          </p>
          <h2 className="text-text-primary mt-1 text-base font-semibold">
            {paperSection.title}
          </h2>
          {paperSection.description === null ? null : (
            <p className="text-text-secondary mt-1 text-xs">
              {paperSection.description}
            </p>
          )}
        </div>
        <span className="text-text-secondary text-sm">
          {paperSection.paperQuestions.length} 题 · {paperSection.totalScore} 分
        </span>
      </header>
      <div className="divide-border divide-y">
        {paperSection.paperQuestions.map((paperQuestion, questionIndex) => (
          <article
            className="grid gap-3 py-4 md:grid-cols-[2rem_minmax(0,1fr)_auto]"
            key={paperQuestion.publicId}
          >
            <span className="bg-muted text-text-secondary flex size-7 items-center justify-center rounded-md text-xs font-semibold">
              {questionIndex + 1}
            </span>
            <div className="min-w-0">
              {paperQuestion.materialSnapshot === null ? null : (
                <p className="text-brand-primary mb-1 text-xs font-medium">
                  材料题组 · {paperQuestion.materialSnapshot.title}
                </p>
              )}
              <p className="text-text-primary line-clamp-3 text-sm leading-6">
                {stripRichText(paperQuestion.questionSnapshot.stemRichText) ||
                  "未填写题干"}
              </p>
              <p className="text-text-secondary mt-2 text-xs">
                第 {paperQuestion.sortOrder} 题 ·{" "}
                {paperQuestion.score ?? "未设置"} 分
                {paperQuestion.scoringPoints.length === 0
                  ? ""
                  : ` · ${paperQuestion.scoringPoints.length} 个评分点`}
              </p>
            </div>
            {isDraft ? (
              <Button
                aria-label="编辑题目设置"
                size="sm"
                type="button"
                variant="outline"
                onClick={() => onEdit(paperQuestion)}
              >
                <Pencil aria-hidden="true" data-icon="inline-start" />
                设置
              </Button>
            ) : null}
          </article>
        ))}
      </div>
    </section>
  );
}

function PaperComposerConfirmationDialog({
  action,
  isSubmitting,
  onCancel,
  onConfirm,
}: {
  action: PendingAction;
  isSubmitting: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  const cancelButtonRef = useRef<HTMLButtonElement>(null);
  const confirmButtonRef = useRef<HTMLButtonElement>(null);
  const content = {
    archive: [
      "确认下架试卷？",
      "下架后不能再开始新的练习或模拟考试。",
      "确认下架",
    ],
    copy: [
      "确认复制为新草稿？",
      "新草稿独立维护，不影响当前试卷。",
      "确认复制",
    ],
    publish: ["确认发布试卷？", "发布后内容与评分规则将锁定。", "确认发布"],
    remove: ["确认移出题目？", "只影响当前草稿，不删除题库母题。", "确认移出"],
  }[action.kind];

  useEffect(() => {
    const previouslyFocusedElement =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;

    cancelButtonRef.current?.focus();

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onCancel();
        return;
      }
      if (event.key !== "Tab") return;

      if (
        event.shiftKey &&
        document.activeElement === cancelButtonRef.current
      ) {
        event.preventDefault();
        confirmButtonRef.current?.focus();
      } else if (
        !event.shiftKey &&
        document.activeElement === confirmButtonRef.current
      ) {
        event.preventDefault();
        cancelButtonRef.current?.focus();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      previouslyFocusedElement?.focus();
    };
  }, [onCancel]);

  return (
    <div className="bg-foreground/20 fixed inset-0 z-[60] flex items-center justify-center p-4">
      <section
        aria-labelledby="paper-composer-confirm-title"
        aria-modal="true"
        className="bg-background border-border w-full max-w-md rounded-md border p-5 shadow-lg"
        role="alertdialog"
      >
        <h2
          className="text-text-primary text-base font-semibold"
          id="paper-composer-confirm-title"
        >
          {content[0]}
        </h2>
        <p className="text-text-secondary mt-2 text-sm">{content[1]}</p>
        <div className="mt-5 flex justify-end gap-2">
          <Button
            disabled={isSubmitting}
            ref={cancelButtonRef}
            type="button"
            variant="outline"
            onClick={onCancel}
          >
            取消
          </Button>
          <Button
            disabled={isSubmitting}
            ref={confirmButtonRef}
            type="button"
            onClick={onConfirm}
          >
            {content[2]}
          </Button>
        </div>
      </section>
    </div>
  );
}
