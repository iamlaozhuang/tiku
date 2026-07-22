"use client";

import Link from "next/link";
import {
  type FormEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  AlertTriangle,
  Archive,
  ArrowLeft,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  ClipboardCheck,
  Copy,
  FileCheck2,
  Layers3,
  Library,
  Pencil,
  Settings2,
  Trash2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import type { AuthContextDto } from "@/server/contracts/auth-contract";
import type {
  PaperCopyResultDto,
  PaperDraftDto,
  PaperPublishResultDto,
  PaperQuestionDto,
  PaperSectionDto,
  QuestionGroupDto,
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
  const [isStructureManagerOpen, setIsStructureManagerOpen] = useState(false);
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

  async function handleStructureCommand(
    resource: "paper-sections" | "question-groups",
    method: "POST" | "PATCH" | "DELETE",
    body: Record<string, unknown>,
    successMessage: string,
  ) {
    setIsMutating(true);
    setActionError(null);
    try {
      const response = await mutatePaperApi(
        `/api/v1/papers/${paperPublicId}/${resource}`,
        method,
        { ...body, expectedRevision: paper?.revision ?? 0 },
      );
      if (response.code !== 0) {
        setActionError(mutationErrorMessage("保存试卷结构"));
        return false;
      }
      await loadPaper();
      setActionMessage(successMessage);
      return true;
    } finally {
      setIsMutating(false);
    }
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
                  aria-expanded={isStructureManagerOpen}
                  type="button"
                  variant="outline"
                  onClick={() =>
                    setIsStructureManagerOpen((current) => !current)
                  }
                >
                  <Settings2 aria-hidden="true" data-icon="inline-start" />
                  管理试卷结构
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

      {!isDraft || !isStructureManagerOpen ? null : (
        <PaperStructureManager
          isMutating={isMutating}
          paper={paper}
          onCommand={handleStructureCommand}
        />
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
                key={
                  paperSection.publicId ??
                  `${paperSection.sortOrder}-${paperSection.title}`
                }
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
              key={
                paperSection.publicId ??
                `${paperSection.sortOrder}-${paperSection.title}`
              }
              paperSection={paperSection}
              questionGroups={paper.questionGroups.filter(
                (questionGroup) =>
                  questionGroup.paperSectionPublicId === paperSection.publicId,
              )}
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

type StructureCommand = (
  resource: "paper-sections" | "question-groups",
  method: "POST" | "PATCH" | "DELETE",
  body: Record<string, unknown>,
  successMessage: string,
) => Promise<boolean>;

function readFormValue(form: HTMLFormElement, name: string) {
  const field = form.elements.namedItem(name);
  return field instanceof HTMLInputElement ||
    field instanceof HTMLTextAreaElement ||
    field instanceof HTMLSelectElement
    ? field.value.trim()
    : "";
}

function PaperStructureManager({
  isMutating,
  paper,
  onCommand,
}: {
  isMutating: boolean;
  paper: PaperDraftDto;
  onCommand: StructureCommand;
}) {
  const [newSectionTitle, setNewSectionTitle] = useState("");
  const [newSectionDescription, setNewSectionDescription] = useState("");
  const [newGroupTitle, setNewGroupTitle] = useState("");
  const [newGroupMaterialPublicId, setNewGroupMaterialPublicId] = useState("");
  const [newGroupSectionPublicId, setNewGroupSectionPublicId] = useState("");

  const sectionGroups = useMemo(() => {
    const groups = new Map<string, QuestionGroupDto[]>();
    for (const questionGroup of paper.questionGroups) {
      if (questionGroup.paperSectionPublicId === undefined) continue;
      const current = groups.get(questionGroup.paperSectionPublicId) ?? [];
      current.push(questionGroup);
      groups.set(questionGroup.paperSectionPublicId, current);
    }
    for (const current of groups.values()) {
      current.sort((left, right) => left.sortOrder - right.sortOrder);
    }
    return groups;
  }, [paper.questionGroups]);

  const paperMaterials = useMemo(() => {
    const materials = new Map<
      string,
      PaperQuestionDto["materialSnapshot"] & object
    >();
    for (const paperSection of paper.paperSections) {
      for (const paperQuestion of paperSection.paperQuestions) {
        if (paperQuestion.materialSnapshot !== null) {
          materials.set(
            paperQuestion.materialSnapshot.materialPublicId,
            paperQuestion.materialSnapshot,
          );
        }
      }
    }
    return [...materials.values()];
  }, [paper.paperSections]);

  async function handleCreateSection(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const title = newSectionTitle.trim();
    if (title === "") return;
    const saved = await onCommand(
      "paper-sections",
      "POST",
      {
        action: "create",
        title,
        description:
          newSectionDescription.trim() === ""
            ? null
            : newSectionDescription.trim(),
        sortOrder: paper.paperSections.length + 1,
      },
      "大题已新增。",
    );
    if (saved) {
      setNewSectionTitle("");
      setNewSectionDescription("");
    }
  }

  async function handleCreateGroup(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const paperSectionPublicId =
      newGroupSectionPublicId || paper.paperSections[0]?.publicId || "";
    const materialPublicId =
      newGroupMaterialPublicId || paperMaterials[0]?.materialPublicId || "";
    const title = newGroupTitle.trim();
    if (
      paperSectionPublicId === "" ||
      materialPublicId === "" ||
      title === ""
    ) {
      return;
    }
    const saved = await onCommand(
      "question-groups",
      "POST",
      {
        action: "create",
        paperSectionPublicId,
        materialPublicId,
        title,
        sortOrder: (sectionGroups.get(paperSectionPublicId)?.length ?? 0) + 1,
      },
      "材料题组已新增，可将同材料题目移入题组。",
    );
    if (saved) setNewGroupTitle("");
  }

  function reorderSections(index: number, direction: -1 | 1) {
    const targetIndex = index + direction;
    const publicIds = paper.paperSections.map(
      (paperSection) => paperSection.publicId,
    );
    if (
      targetIndex < 0 ||
      targetIndex >= publicIds.length ||
      publicIds.some((publicId) => publicId === undefined)
    ) {
      return;
    }
    [publicIds[index], publicIds[targetIndex]] = [
      publicIds[targetIndex],
      publicIds[index],
    ];
    void onCommand(
      "paper-sections",
      "PATCH",
      { action: "reorder", paperSectionPublicIds: publicIds },
      "大题顺序已保存。",
    );
  }

  function reorderGroups(
    paperSectionPublicId: string,
    index: number,
    direction: -1 | 1,
  ) {
    const groups = sectionGroups.get(paperSectionPublicId) ?? [];
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= groups.length) return;
    const publicIds = groups.map((questionGroup) => questionGroup.publicId);
    [publicIds[index], publicIds[targetIndex]] = [
      publicIds[targetIndex],
      publicIds[index],
    ];
    void onCommand(
      "question-groups",
      "PATCH",
      {
        action: "reorder",
        paperSectionPublicId,
        questionGroupPublicIds: publicIds,
      },
      "材料题组顺序已保存。",
    );
  }

  return (
    <section
      aria-label="试卷结构管理"
      className="border-border bg-surface space-y-5 rounded-md border p-4 shadow-sm"
    >
      <div>
        <h2 className="text-text-primary text-base font-semibold">
          试卷结构管理
        </h2>
        <p className="text-text-secondary mt-1 text-sm">
          大题和材料题组只按稳定身份维护；所有变更都会校验当前草稿版本。
        </p>
      </div>

      <form
        className="border-border grid gap-3 rounded-md border p-3 md:grid-cols-2"
        onSubmit={(event) => void handleCreateSection(event)}
      >
        <label className="text-text-secondary space-y-1 text-sm">
          <span>新大题名称</span>
          <input
            aria-label="新大题名称"
            className="border-input bg-background text-text-primary w-full rounded-md border px-3 py-2"
            value={newSectionTitle}
            onChange={(event) => setNewSectionTitle(event.target.value)}
          />
        </label>
        <label className="text-text-secondary space-y-1 text-sm">
          <span>新大题说明</span>
          <input
            aria-label="新大题说明"
            className="border-input bg-background text-text-primary w-full rounded-md border px-3 py-2"
            value={newSectionDescription}
            onChange={(event) => setNewSectionDescription(event.target.value)}
          />
        </label>
        <Button
          disabled={isMutating || newSectionTitle.trim() === ""}
          type="submit"
        >
          新增大题
        </Button>
      </form>

      <div className="space-y-4">
        {paper.paperSections.map((paperSection, sectionIndex) => {
          const paperSectionPublicId = paperSection.publicId;
          const groups =
            paperSectionPublicId === undefined
              ? []
              : (sectionGroups.get(paperSectionPublicId) ?? []);
          const hasStableIdentity = paperSectionPublicId !== undefined;
          return (
            <article
              className="border-border space-y-4 rounded-md border p-3"
              key={
                paperSectionPublicId ??
                `${paperSection.sortOrder}-${paperSection.title}`
              }
            >
              <form
                className="grid gap-2 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto]"
                onSubmit={(event) => {
                  event.preventDefault();
                  if (!hasStableIdentity) return;
                  const title = readFormValue(event.currentTarget, "title");
                  if (title === "") return;
                  void onCommand(
                    "paper-sections",
                    "PATCH",
                    {
                      action: "update",
                      paperSectionPublicId,
                      title,
                      description:
                        readFormValue(event.currentTarget, "description") ||
                        null,
                    },
                    "大题名称和说明已保存。",
                  );
                }}
              >
                <label className="text-text-secondary space-y-1 text-sm">
                  <span>大题名称</span>
                  <input
                    aria-label={`大题名称：${paperSection.title}`}
                    className="border-input bg-background text-text-primary w-full rounded-md border px-3 py-2"
                    defaultValue={paperSection.title}
                    name="title"
                  />
                </label>
                <label className="text-text-secondary space-y-1 text-sm">
                  <span>大题说明</span>
                  <input
                    aria-label={`大题说明：${paperSection.title}`}
                    className="border-input bg-background text-text-primary w-full rounded-md border px-3 py-2"
                    defaultValue={paperSection.description ?? ""}
                    name="description"
                  />
                </label>
                <Button
                  disabled={isMutating || !hasStableIdentity}
                  type="submit"
                  variant="outline"
                >
                  保存大题
                </Button>
              </form>

              <div className="flex flex-wrap items-center gap-2">
                <span className="text-text-secondary mr-auto text-sm">
                  第 {sectionIndex + 1} 大题 ·{" "}
                  {paperSection.paperQuestions.length} 题 ·{" "}
                  {paperSection.totalScore} 分
                </span>
                <Button
                  aria-label={`上移大题 ${paperSection.title}`}
                  disabled={
                    isMutating || !hasStableIdentity || sectionIndex === 0
                  }
                  size="sm"
                  type="button"
                  variant="outline"
                  onClick={() => reorderSections(sectionIndex, -1)}
                >
                  <ChevronUp aria-hidden="true" />
                </Button>
                <Button
                  aria-label={`下移大题 ${paperSection.title}`}
                  disabled={
                    isMutating ||
                    !hasStableIdentity ||
                    sectionIndex === paper.paperSections.length - 1
                  }
                  size="sm"
                  type="button"
                  variant="outline"
                  onClick={() => reorderSections(sectionIndex, 1)}
                >
                  <ChevronDown aria-hidden="true" />
                </Button>
                <Button
                  aria-label={`删除空大题 ${paperSection.title}`}
                  disabled={
                    isMutating ||
                    !hasStableIdentity ||
                    paperSection.paperQuestions.length > 0 ||
                    groups.length > 0
                  }
                  size="sm"
                  type="button"
                  variant="destructive"
                  onClick={() =>
                    void onCommand(
                      "paper-sections",
                      "DELETE",
                      {
                        action: "delete",
                        paperSectionPublicId,
                      },
                      "空大题已删除。",
                    )
                  }
                >
                  <Trash2 aria-hidden="true" />
                </Button>
              </div>

              <div className="bg-muted/20 space-y-3 rounded-md p-3">
                <h3 className="text-text-primary text-sm font-semibold">
                  材料题组
                </h3>
                {groups.length === 0 ? (
                  <p className="text-text-muted text-xs">
                    当前大题没有材料题组。
                  </p>
                ) : null}
                {groups.map((questionGroup, groupIndex) => {
                  const actualQuestionCount =
                    paperSection.paperQuestions.filter(
                      (paperQuestion) =>
                        paperQuestion.questionGroupPublicId ===
                        questionGroup.publicId,
                    ).length;
                  const questionCount = Math.max(
                    questionGroup.questionCount ?? 0,
                    actualQuestionCount,
                  );
                  return (
                    <div
                      className="border-border bg-background space-y-2 rounded-md border p-3"
                      key={questionGroup.publicId}
                    >
                      <form
                        className="flex flex-wrap items-end gap-2"
                        onSubmit={(event) => {
                          event.preventDefault();
                          const title = readFormValue(
                            event.currentTarget,
                            "title",
                          );
                          if (title === "") return;
                          void onCommand(
                            "question-groups",
                            "PATCH",
                            {
                              action: "update",
                              questionGroupPublicId: questionGroup.publicId,
                              title,
                            },
                            "材料题组名称已保存。",
                          );
                        }}
                      >
                        <label className="text-text-secondary min-w-0 flex-1 space-y-1 text-sm">
                          <span>
                            {questionGroup.title} · {questionCount} 题 ·{" "}
                            {questionGroup.totalScore ?? "0.0"} 分
                          </span>
                          <input
                            aria-label={`题组名称：${questionGroup.title}`}
                            className="border-input bg-background text-text-primary w-full rounded-md border px-3 py-2"
                            defaultValue={questionGroup.title}
                            name="title"
                          />
                        </label>
                        <Button
                          disabled={isMutating}
                          size="sm"
                          type="submit"
                          variant="outline"
                        >
                          保存题组
                        </Button>
                        <Button
                          aria-label={`上移题组 ${questionGroup.title}`}
                          disabled={isMutating || groupIndex === 0}
                          size="sm"
                          type="button"
                          variant="outline"
                          onClick={() =>
                            reorderGroups(
                              paperSectionPublicId ?? "",
                              groupIndex,
                              -1,
                            )
                          }
                        >
                          <ChevronUp aria-hidden="true" />
                        </Button>
                        <Button
                          aria-label={`下移题组 ${questionGroup.title}`}
                          disabled={
                            isMutating || groupIndex === groups.length - 1
                          }
                          size="sm"
                          type="button"
                          variant="outline"
                          onClick={() =>
                            reorderGroups(
                              paperSectionPublicId ?? "",
                              groupIndex,
                              1,
                            )
                          }
                        >
                          <ChevronDown aria-hidden="true" />
                        </Button>
                        <Button
                          aria-label={`删除空题组 ${questionGroup.title}`}
                          disabled={isMutating || questionCount > 0}
                          size="sm"
                          type="button"
                          variant="destructive"
                          onClick={() =>
                            void onCommand(
                              "question-groups",
                              "DELETE",
                              {
                                action: "delete",
                                questionGroupPublicId: questionGroup.publicId,
                              },
                              "空材料题组已删除。",
                            )
                          }
                        >
                          <Trash2 aria-hidden="true" />
                        </Button>
                      </form>
                    </div>
                  );
                })}
              </div>

              <div className="space-y-2">
                <h3 className="text-text-primary text-sm font-semibold">
                  题目归属
                </h3>
                {paperSection.paperQuestions.map((paperQuestion) => {
                  const compatibleGroups = groups.filter(
                    (questionGroup) =>
                      paperQuestion.materialSnapshot !== null &&
                      questionGroup.materialPublicId ===
                        paperQuestion.materialSnapshot.materialPublicId,
                  );
                  const questionLabel =
                    stripRichText(
                      paperQuestion.questionSnapshot.stemRichText,
                    ) || "未填写题干";
                  return (
                    <label
                      className="text-text-secondary grid gap-1 text-sm md:grid-cols-[minmax(0,1fr)_minmax(12rem,20rem)] md:items-center"
                      key={paperQuestion.publicId}
                    >
                      <span className="truncate">{questionLabel}</span>
                      <select
                        aria-label={`题组归属：${questionLabel}`}
                        className="border-input bg-background text-text-primary rounded-md border px-3 py-2"
                        disabled={isMutating || !hasStableIdentity}
                        value={
                          paperQuestion.questionGroupPublicId ??
                          `standalone:${paperSectionPublicId ?? ""}`
                        }
                        onChange={(event) => {
                          const value = event.target.value;
                          const standalone = value.startsWith("standalone:");
                          void onCommand(
                            "question-groups",
                            "PATCH",
                            {
                              action: "set_question_membership",
                              paperQuestionPublicId: paperQuestion.publicId,
                              questionGroupPublicId: standalone ? null : value,
                              paperSectionPublicId: standalone
                                ? paperSectionPublicId
                                : null,
                            },
                            "题目归属已保存。",
                          );
                        }}
                      >
                        <option
                          value={`standalone:${paperSectionPublicId ?? ""}`}
                        >
                          独立题目（当前大题）
                        </option>
                        {compatibleGroups.map((questionGroup) => (
                          <option
                            key={questionGroup.publicId}
                            value={questionGroup.publicId}
                          >
                            {questionGroup.title}
                          </option>
                        ))}
                      </select>
                    </label>
                  );
                })}
              </div>
            </article>
          );
        })}
      </div>

      <form
        className="border-border grid gap-3 rounded-md border p-3 md:grid-cols-3"
        onSubmit={(event) => void handleCreateGroup(event)}
      >
        <label className="text-text-secondary space-y-1 text-sm">
          <span>新题组名称</span>
          <input
            className="border-input bg-background text-text-primary w-full rounded-md border px-3 py-2"
            value={newGroupTitle}
            onChange={(event) => setNewGroupTitle(event.target.value)}
          />
        </label>
        <label className="text-text-secondary space-y-1 text-sm">
          <span>所属大题</span>
          <select
            className="border-input bg-background text-text-primary w-full rounded-md border px-3 py-2"
            value={newGroupSectionPublicId}
            onChange={(event) => setNewGroupSectionPublicId(event.target.value)}
          >
            {paper.paperSections.map((paperSection) =>
              paperSection.publicId === undefined ? null : (
                <option
                  key={paperSection.publicId}
                  value={paperSection.publicId}
                >
                  {paperSection.title}
                </option>
              ),
            )}
          </select>
        </label>
        <label className="text-text-secondary space-y-1 text-sm">
          <span>纸内材料</span>
          <select
            className="border-input bg-background text-text-primary w-full rounded-md border px-3 py-2"
            value={newGroupMaterialPublicId}
            onChange={(event) =>
              setNewGroupMaterialPublicId(event.target.value)
            }
          >
            {paperMaterials.map((material) => (
              <option
                key={material.materialPublicId}
                value={material.materialPublicId}
              >
                {material.title}
              </option>
            ))}
          </select>
        </label>
        <Button
          disabled={
            isMutating ||
            newGroupTitle.trim() === "" ||
            paperMaterials.length === 0 ||
            paper.paperSections.every(
              (paperSection) => paperSection.publicId === undefined,
            )
          }
          type="submit"
        >
          新增材料题组
        </Button>
        {paperMaterials.length === 0 ? (
          <p className="text-text-muted text-xs md:col-span-2">
            先通过“按材料选题”加入材料题，再建立独立题组。
          </p>
        ) : null}
      </form>
    </section>
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
  questionGroups,
  onEdit,
}: {
  isDraft: boolean;
  paperSection: PaperSectionDto;
  questionGroups: QuestionGroupDto[];
  onEdit: (paperQuestion: PaperQuestionDto) => void;
}) {
  const standaloneQuestions = paperSection.paperQuestions.filter(
    (paperQuestion) => paperQuestion.questionGroupPublicId === null,
  );
  const sortedGroups = [...questionGroups].sort(
    (left, right) => left.sortOrder - right.sortOrder,
  );
  const knownGroupPublicIds = new Set(
    sortedGroups.map((questionGroup) => questionGroup.publicId),
  );
  const unresolvedQuestions = paperSection.paperQuestions.filter(
    (paperQuestion) =>
      paperQuestion.questionGroupPublicId !== null &&
      !knownGroupPublicIds.has(paperQuestion.questionGroupPublicId),
  );

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
        {standaloneQuestions.map((paperQuestion, questionIndex) => (
          <PaperQuestionCanvasRow
            isDraft={isDraft}
            key={paperQuestion.publicId}
            paperQuestion={paperQuestion}
            questionIndex={questionIndex}
            showMaterial={paperQuestion.materialSnapshot !== null}
            onEdit={onEdit}
          />
        ))}
        {sortedGroups.map((questionGroup) => {
          const groupQuestions = paperSection.paperQuestions.filter(
            (paperQuestion) =>
              paperQuestion.questionGroupPublicId === questionGroup.publicId,
          );
          return (
            <section className="py-4" key={questionGroup.publicId}>
              <header className="bg-muted/30 border-border rounded-md border p-3">
                <p className="text-brand-primary text-xs font-medium">
                  材料题组 · {questionGroup.materialSnapshot.title}
                </p>
                <div className="mt-1 flex flex-wrap items-center justify-between gap-2">
                  <h3 className="text-text-primary text-sm font-semibold">
                    {questionGroup.title}
                  </h3>
                  <span className="text-text-secondary text-xs">
                    {questionGroup.questionCount ?? groupQuestions.length} 题 ·{" "}
                    {questionGroup.totalScore ?? "0.0"} 分
                  </span>
                </div>
              </header>
              <div className="divide-border divide-y pl-3">
                {groupQuestions.map((paperQuestion, questionIndex) => (
                  <PaperQuestionCanvasRow
                    isDraft={isDraft}
                    key={paperQuestion.publicId}
                    paperQuestion={paperQuestion}
                    questionIndex={questionIndex}
                    showMaterial={false}
                    onEdit={onEdit}
                  />
                ))}
              </div>
            </section>
          );
        })}
        {unresolvedQuestions.length === 0 ? null : (
          <section className="py-4">
            <header className="bg-destructive/5 border-destructive/20 rounded-md border p-3">
              <h3 className="text-destructive text-sm font-semibold">
                待修复的题组归属
              </h3>
              <p className="text-text-secondary mt-1 text-xs">
                以下题目引用的材料题组不属于当前大题；发布前请在结构管理中改为独立题目。
              </p>
            </header>
            <div className="divide-border divide-y pl-3">
              {unresolvedQuestions.map((paperQuestion, questionIndex) => (
                <PaperQuestionCanvasRow
                  isDraft={isDraft}
                  key={paperQuestion.publicId}
                  paperQuestion={paperQuestion}
                  questionIndex={questionIndex}
                  showMaterial={paperQuestion.materialSnapshot !== null}
                  onEdit={onEdit}
                />
              ))}
            </div>
          </section>
        )}
      </div>
    </section>
  );
}

function PaperQuestionCanvasRow({
  isDraft,
  paperQuestion,
  questionIndex,
  showMaterial,
  onEdit,
}: {
  isDraft: boolean;
  paperQuestion: PaperQuestionDto;
  questionIndex: number;
  showMaterial: boolean;
  onEdit: (paperQuestion: PaperQuestionDto) => void;
}) {
  return (
    <article className="grid gap-3 py-4 md:grid-cols-[2rem_minmax(0,1fr)_auto]">
      <span className="bg-muted text-text-secondary flex size-7 items-center justify-center rounded-md text-xs font-semibold">
        {questionIndex + 1}
      </span>
      <div className="min-w-0">
        {!showMaterial || paperQuestion.materialSnapshot === null ? null : (
          <p className="text-brand-primary mb-1 text-xs font-medium">
            独立材料题 · {paperQuestion.materialSnapshot.title}
          </p>
        )}
        <p className="text-text-primary line-clamp-3 text-sm leading-6">
          {stripRichText(paperQuestion.questionSnapshot.stemRichText) ||
            "未填写题干"}
        </p>
        <p className="text-text-secondary mt-2 text-xs">
          第 {paperQuestion.sortOrder} 题 · {paperQuestion.score ?? "未设置"} 分
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
