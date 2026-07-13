"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";

import { AdminAsyncState } from "@/components/admin/AdminAsyncState";
import { AdminToast, type AdminFeedback } from "@/components/admin/AdminToast";
import { Button } from "@/components/ui/button";
import type { AuthContextDto } from "@/server/contracts/auth-contract";

import {
  AdminErrorState,
  AdminUnauthorizedState,
  fetchAdminApi,
  getStoredSessionToken,
  isAdminContext,
  isUnauthorizedResponse,
} from "../content-admin-runtime";
import {
  AdminQuestionEditorForm,
  createDefaultQuestionFormValues,
  createQuestionInput,
  useQuestionBindingOptions,
  type QuestionFormValues,
} from "./AdminQuestionEditorForm";

type EditorLoadState = "loading" | "ready" | "unauthorized" | "error";

export function AdminQuestionEditorPage() {
  const router = useRouter();
  const [loadState, setLoadState] = useState<EditorLoadState>("loading");
  const [feedback, setFeedback] = useState<AdminFeedback | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdQuestionPublicId, setCreatedQuestionPublicId] = useState<
    string | null
  >(null);
  const submissionInProgressRef = useRef(false);
  const { loadState: bindingOptionsLoadState, options: bindingOptions } =
    useQuestionBindingOptions(loadState === "ready");

  useEffect(() => {
    let isActive = true;

    async function loadSession() {
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

        setLoadState("ready");
      } catch {
        if (isActive) setLoadState("error");
      }
    }

    void loadSession();
    return () => {
      isActive = false;
    };
  }, []);

  function handleReturnToList() {
    router.push("/content/questions");
  }

  async function handleCreateQuestion(values: QuestionFormValues) {
    if (submissionInProgressRef.current) return;

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

    try {
      const payload = await fetchAdminApi<{
        question: { publicId: string };
      }>("/api/v1/questions", sessionToken, {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify(createQuestionInput(values)),
      });

      if (payload.code !== 0 || payload.data === null) {
        setFeedback({
          message: "当前输入已保留，请处理冲突或检查内容后重试。",
          title: "题目保存失败",
          tone: String(payload.code).startsWith("409") ? "conflict" : "error",
        });
        return;
      }

      setCreatedQuestionPublicId(payload.data.question.publicId);
      setFeedback({
        message: "题目已保存，可返回题目列表继续工作。",
        title: "题目已创建",
        tone: "success",
      });
    } catch {
      setFeedback({
        message: "当前输入已保留，请检查网络后重试。",
        title: "题目保存失败",
        tone: "error",
      });
    } finally {
      submissionInProgressRef.current = false;
      setIsSubmitting(false);
    }
  }

  if (loadState === "loading") {
    return (
      <AdminAsyncState variant="initial-loading">
        正在加载题目编辑器
      </AdminAsyncState>
    );
  }
  if (loadState === "unauthorized") return <AdminUnauthorizedState />;
  if (loadState === "error") {
    return (
      <AdminErrorState
        description="请稍后刷新页面，或重新登录后再创建题目。"
        title="题目编辑器加载失败"
      />
    );
  }

  return (
    <section className="space-y-6" data-testid="question-create-editor-page">
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
            新建题目
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

      {createdQuestionPublicId === null ? (
        <AdminQuestionEditorForm
          bindingOptions={bindingOptions}
          bindingOptionsLoadState={bindingOptionsLoadState}
          isSubmitting={isSubmitting}
          mode="create"
          values={createDefaultQuestionFormValues()}
          onCancel={handleReturnToList}
          onSubmit={(values) => void handleCreateQuestion(values)}
        />
      ) : (
        <section
          aria-labelledby="question-create-complete-title"
          className="border-border bg-surface rounded-md border p-6 shadow-sm"
        >
          <CheckCircle2
            aria-hidden="true"
            className="text-brand-primary size-6"
          />
          <h2
            className="text-text-primary mt-3 text-lg font-semibold"
            id="question-create-complete-title"
          >
            题目已创建
          </h2>
          <p className="text-text-secondary mt-2 text-sm">
            本次创建已完成，不会在当前页面重复提交。可返回题目列表继续工作。
          </p>
          <Button className="mt-4" type="button" onClick={handleReturnToList}>
            返回题目列表
          </Button>
        </section>
      )}
    </section>
  );
}
