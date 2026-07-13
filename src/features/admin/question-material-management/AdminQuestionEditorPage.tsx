"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowLeft, Copy, ShieldAlert } from "lucide-react";
import { useRouter } from "next/navigation";

import { AdminAsyncState } from "@/components/admin/AdminAsyncState";
import { AdminToast, type AdminFeedback } from "@/components/admin/AdminToast";
import { Button } from "@/components/ui/button";
import type { AuthContextDto } from "@/server/contracts/auth-contract";
import type {
  QuestionDto,
  QuestionResultDto,
} from "@/server/contracts/question-contract";

import {
  fetchAdminApi,
  getStoredSessionToken,
  isAdminContext,
  isUnauthorizedResponse,
} from "../content-admin-runtime";
import {
  AdminQuestionEditorForm,
  createDefaultQuestionFormValues,
  createQuestionFormValuesFromQuestion,
  createQuestionInput,
  useQuestionBindingOptions,
  type QuestionFormValues,
} from "./AdminQuestionEditorForm";

type EditorLoadState =
  | "loading"
  | "ready"
  | "unauthorized"
  | "forbidden"
  | "not_found"
  | "error";

const QUESTION_LOCKED_CODE = 409202;

export function AdminQuestionEditorPage({
  publishDraft = false,
  questionPublicId,
}: {
  publishDraft?: boolean;
  questionPublicId?: string;
}) {
  const router = useRouter();
  const isEditMode = questionPublicId !== undefined;
  const [loadState, setLoadState] = useState<EditorLoadState>("loading");
  const [question, setQuestion] = useState<QuestionDto | null>(null);
  const [feedback, setFeedback] = useState<AdminFeedback | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCopying, setIsCopying] = useState(false);
  const [lockConflict, setLockConflict] = useState(false);
  const [formRevision, setFormRevision] = useState(0);
  const submissionInProgressRef = useRef(false);
  const { loadState: bindingOptionsLoadState, options: bindingOptions } =
    useQuestionBindingOptions(
      loadState === "ready" && (question === null || !question.isLocked),
    );

  useEffect(() => {
    let isActive = true;

    async function loadEditor() {
      submissionInProgressRef.current = false;
      setLoadState("loading");
      setQuestion(null);
      setLockConflict(false);
      setFeedback(null);
      setIsSubmitting(false);
      setIsCopying(false);
      const sessionToken = getStoredSessionToken();
      if (sessionToken === null) {
        if (isActive) setLoadState("unauthorized");
        return;
      }

      try {
        const sessionResponse = await fetchAdminApi<AuthContextDto>(
          "/api/v1/sessions",
          sessionToken,
        );
        if (!isActive) return;

        if (
          isUnauthorizedResponse(sessionResponse) ||
          sessionResponse.code !== 0 ||
          sessionResponse.data === null ||
          !isAdminContext(sessionResponse.data)
        ) {
          setLoadState("unauthorized");
          return;
        }

        if (!isEditMode) {
          setLoadState("ready");
          return;
        }

        const detailResponse = await fetchAdminApi<QuestionResultDto>(
          `/api/v1/questions/${encodeURIComponent(questionPublicId)}`,
          sessionToken,
        );
        if (!isActive) return;

        if (isUnauthorizedResponse(detailResponse)) {
          setLoadState("unauthorized");
          return;
        }
        if (String(detailResponse.code).startsWith("403")) {
          setLoadState("forbidden");
          return;
        }
        if (detailResponse.code === 404202) {
          setLoadState("not_found");
          return;
        }
        if (detailResponse.code !== 0 || detailResponse.data === null) {
          setLoadState("error");
          return;
        }

        setQuestion(detailResponse.data.question);
        setLoadState("ready");
      } catch {
        if (isActive) setLoadState("error");
      }
    }

    void loadEditor();
    return () => {
      isActive = false;
    };
  }, [isEditMode, questionPublicId]);

  function handleReturnToList() {
    router.push("/content/questions");
  }

  async function handleCopyQuestion() {
    if (questionPublicId === undefined || submissionInProgressRef.current) {
      return;
    }

    const sessionToken = getStoredSessionToken();
    if (sessionToken === null) {
      setFeedback({
        message: "管理员会话已失效，请重新登录后再操作。",
        title: "题目复制失败",
        tone: "error",
      });
      return;
    }

    submissionInProgressRef.current = true;
    setIsCopying(true);
    setFeedback(null);
    let navigationStarted = false;

    try {
      const response = await fetchAdminApi<QuestionResultDto>(
        `/api/v1/questions/${encodeURIComponent(questionPublicId)}/copy`,
        sessionToken,
        { method: "POST" },
      );

      if (response.code !== 0 || response.data === null) {
        setFeedback({
          message: "当前页面保持不变，请检查冲突或稍后重试。",
          title: "题目复制失败",
          tone: String(response.code).startsWith("409") ? "conflict" : "error",
        });
        return;
      }

      navigationStarted = true;
      router.replace(
        `/content/questions/${encodeURIComponent(response.data.question.publicId)}/edit`,
      );
    } catch {
      setFeedback({
        message: "当前页面保持不变，请检查网络后重试。",
        title: "题目复制失败",
        tone: "error",
      });
    } finally {
      if (!navigationStarted) {
        submissionInProgressRef.current = false;
        setIsCopying(false);
      }
    }
  }

  async function handleSaveQuestion(values: QuestionFormValues) {
    if (submissionInProgressRef.current || lockConflict) return;

    const sessionToken = getStoredSessionToken();
    if (sessionToken === null) {
      setFeedback({
        message: "管理员会话已失效，请重新登录后再操作。",
        title: "题目保存失败",
        tone: "error",
      });
      return;
    }

    submissionInProgressRef.current = true;
    setIsSubmitting(true);
    setFeedback(null);
    let navigationStarted = false;

    try {
      const response = await fetchAdminApi<QuestionResultDto>(
        isEditMode
          ? `/api/v1/questions/${encodeURIComponent(questionPublicId)}`
          : "/api/v1/questions",
        sessionToken,
        {
          method: isEditMode ? "PATCH" : "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(
            isEditMode
              ? { ...createQuestionInput(values), status: "available" }
              : createQuestionInput(values),
          ),
        },
      );

      if (response.code === QUESTION_LOCKED_CODE && isEditMode) {
        setLockConflict(true);
        setFeedback({
          message:
            "服务端已锁定该题目，当前输入仍保留；不能继续覆盖，请复制新题或返回列表。",
          title: "题目保存冲突",
          tone: "conflict",
        });
        return;
      }

      if (response.code !== 0 || response.data === null) {
        setFeedback({
          message: "当前输入已保留，请处理冲突或检查内容后重试。",
          title: "题目保存失败",
          tone: String(response.code).startsWith("409") ? "conflict" : "error",
        });
        return;
      }

      if (!isEditMode) {
        navigationStarted = true;
        router.replace(
          `/content/questions/${encodeURIComponent(response.data.question.publicId)}/edit`,
        );
        return;
      }

      setQuestion(response.data.question);
      setFormRevision((currentRevision) => currentRevision + 1);
      setFeedback({
        message:
          publishDraft && question?.status === "disabled"
            ? "待审题目草稿已转为正式可用题目。"
            : "题目内容与绑定已更新。",
        title:
          publishDraft && question?.status === "disabled"
            ? "题目已发布"
            : "题目已保存",
        tone: "success",
      });
    } catch {
      setFeedback({
        message: "当前输入已保留，请检查网络后重试。",
        title: "题目保存失败",
        tone: "error",
      });
    } finally {
      if (!navigationStarted) {
        submissionInProgressRef.current = false;
        setIsSubmitting(false);
      }
    }
  }

  if (loadState === "loading") {
    return (
      <AdminAsyncState variant="initial-loading">
        正在加载题目编辑器
      </AdminAsyncState>
    );
  }
  if (loadState !== "ready") {
    const stateContent = {
      unauthorized: {
        title: "无权访问题目编辑器",
        description: "请使用具备内容后台权限的管理员会话后重试。",
        variant: "unauthorized" as const,
      },
      forbidden: {
        title: "无权编辑该题目",
        description: "服务端拒绝了当前操作，请返回题目列表选择可访问内容。",
        variant: "forbidden" as const,
      },
      not_found: {
        title: "未找到题目",
        description: "题目可能已不存在，请返回题目列表重新选择。",
        variant: "error" as const,
      },
      error: {
        title: "题目编辑器加载失败",
        description: "请稍后刷新页面，或返回题目列表重新选择。",
        variant: "error" as const,
      },
    }[loadState];

    return (
      <AdminAsyncState
        className="bg-surface border-border rounded-md border p-6 text-center shadow-sm"
        variant={stateContent.variant}
      >
        <h1 className="font-heading text-text-primary text-xl font-semibold">
          {stateContent.title}
        </h1>
        <p className="text-text-secondary mt-2 text-sm">
          {stateContent.description}
        </p>
        <Button
          className="mt-4"
          type="button"
          variant="outline"
          onClick={handleReturnToList}
        >
          返回题目列表
        </Button>
      </AdminAsyncState>
    );
  }

  const lockedQuestion = question?.isLocked === true;
  const isPublishingDraft =
    publishDraft && question !== null && question.status === "disabled";
  const editorValues =
    question === null
      ? createDefaultQuestionFormValues()
      : createQuestionFormValuesFromQuestion(question);

  return (
    <section className="space-y-6" data-testid="question-editor-page">
      <header className="space-y-3">
        <Button type="button" variant="ghost" onClick={handleReturnToList}>
          <ArrowLeft aria-hidden="true" data-icon="inline-start" />
          返回题目列表
        </Button>
        <div className="space-y-2">
          <p className="text-brand-primary text-sm font-medium">
            内容后台 · 题库题目
          </p>
          <h1 className="font-heading text-text-primary text-2xl font-semibold">
            {isEditMode ? "编辑题目" : "新建题目"}
          </h1>
          <p className="text-text-secondary max-w-3xl text-sm">
            独立编辑题目结构、答案、解析和业务绑定；保存前使用与 API
            相同的语义校验合同。
          </p>
        </div>
      </header>

      {feedback === null ? null : (
        <AdminToast feedback={feedback} onDismiss={() => setFeedback(null)} />
      )}

      {lockedQuestion ? (
        <QuestionLockBlocker
          isCopying={isCopying}
          onCopy={() => void handleCopyQuestion()}
          onReturn={handleReturnToList}
        />
      ) : (
        <>
          {lockConflict ? (
            <section
              className="border-warning/30 bg-warning/10 rounded-md border p-4"
              data-testid="question-lock-conflict-actions"
            >
              <p className="text-text-secondary text-sm">
                当前输入仍在表单中。该题目已不能覆盖，请复制服务端题目为新题，或返回列表。
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Button
                  disabled={isCopying}
                  type="button"
                  onClick={() => void handleCopyQuestion()}
                >
                  <Copy aria-hidden="true" data-icon="inline-start" />
                  {isCopying ? "复制中…" : "复制为新题并编辑"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleReturnToList}
                >
                  返回题目列表
                </Button>
              </div>
            </section>
          ) : null}
          <AdminQuestionEditorForm
            bindingOptions={bindingOptions}
            bindingOptionsLoadState={bindingOptionsLoadState}
            isSubmitting={isSubmitting}
            key={
              question === null
                ? "create"
                : `${question.publicId}:${formRevision}`
            }
            mode={isEditMode ? "edit" : "create"}
            submitLabel={isPublishingDraft ? "发布为正式题目" : "保存题目"}
            submitBlockedReason={
              lockConflict ? "题目已在服务端锁定，请复制新题或返回列表。" : null
            }
            values={editorValues}
            onCancel={handleReturnToList}
            onSubmit={(values) => void handleSaveQuestion(values)}
          />
        </>
      )}
    </section>
  );
}

function QuestionLockBlocker({
  isCopying,
  onCopy,
  onReturn,
}: {
  isCopying: boolean;
  onCopy: () => void;
  onReturn: () => void;
}) {
  return (
    <AdminAsyncState
      className="bg-surface border-border rounded-md border p-6 text-center shadow-sm"
      variant="conflict"
    >
      <ShieldAlert aria-hidden="true" className="text-warning mx-auto size-7" />
      <h2 className="text-text-primary mt-3 text-lg font-semibold">
        题目已锁定
      </h2>
      <p className="text-text-secondary mx-auto mt-2 max-w-2xl text-sm">
        该题目已被已发布试卷引用，服务端禁止覆盖。可显式复制为独立新题后继续编辑。
      </p>
      <div className="mt-4 flex flex-wrap justify-center gap-2">
        <Button disabled={isCopying} type="button" onClick={onCopy}>
          <Copy aria-hidden="true" data-icon="inline-start" />
          {isCopying ? "复制中…" : "复制为新题并编辑"}
        </Button>
        <Button type="button" variant="outline" onClick={onReturn}>
          返回题目列表
        </Button>
      </div>
    </AdminAsyncState>
  );
}
