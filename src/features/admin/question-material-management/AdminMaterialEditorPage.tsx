"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

import { AdminAsyncState } from "@/components/admin/AdminAsyncState";
import { AdminToast, type AdminFeedback } from "@/components/admin/AdminToast";
import { Button } from "@/components/ui/button";
import type { AuthContextDto } from "@/server/contracts/auth-contract";
import type { MaterialResultDto } from "@/server/contracts/material-contract";

import {
  fetchAdminApi,
  getStoredSessionToken,
  isAdminContext,
  isUnauthorizedResponse,
} from "../content-admin-runtime";
import {
  AdminMaterialEditorForm,
  createDefaultMaterialFormValues,
  createMaterialInput,
  type MaterialFormValues,
} from "./AdminMaterialEditorForm";

type EditorLoadState = "loading" | "ready" | "unauthorized" | "error";

export function AdminMaterialEditorPage() {
  const router = useRouter();
  const [loadState, setLoadState] = useState<EditorLoadState>("loading");
  const [feedback, setFeedback] = useState<AdminFeedback | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdMaterialTitle, setCreatedMaterialTitle] = useState<
    string | null
  >(null);
  const submissionInProgressRef = useRef(false);

  useEffect(() => {
    let isActive = true;

    async function loadEditor() {
      submissionInProgressRef.current = false;
      setLoadState("loading");
      setFeedback(null);
      setIsSubmitting(false);
      setCreatedMaterialTitle(null);
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

    void loadEditor();
    return () => {
      isActive = false;
    };
  }, []);

  function handleReturnToList() {
    router.push("/content/materials");
  }

  async function handleSaveMaterial(values: MaterialFormValues) {
    if (submissionInProgressRef.current) return;

    const sessionToken = getStoredSessionToken();
    if (sessionToken === null) {
      setFeedback({
        message: "管理员会话已失效，请重新登录后再操作。",
        title: "材料保存失败",
        tone: "error",
      });
      return;
    }

    submissionInProgressRef.current = true;
    setIsSubmitting(true);
    setFeedback(null);
    try {
      const response = await fetchAdminApi<MaterialResultDto>(
        "/api/v1/materials",
        sessionToken,
        {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(createMaterialInput(values)),
        },
      );

      if (response.code !== 0 || response.data === null) {
        setFeedback({
          message: "当前输入已保留，请处理冲突或检查内容后重试。",
          title: "材料保存失败",
          tone: String(response.code).startsWith("409") ? "conflict" : "error",
        });
        return;
      }

      setCreatedMaterialTitle(response.data.material.title);
      setFeedback({
        message: `材料“${response.data.material.title}”已保存。`,
        title: "材料已保存",
        tone: "success",
      });
    } catch {
      setFeedback({
        message: "当前输入已保留，请检查网络后重试。",
        title: "材料保存失败",
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
        正在加载材料编辑器
      </AdminAsyncState>
    );
  }

  if (loadState !== "ready") {
    const stateContent =
      loadState === "unauthorized"
        ? {
            title: "无权访问材料编辑器",
            description: "请使用具备内容后台权限的管理员会话后重试。",
            variant: "unauthorized" as const,
          }
        : {
            title: "材料编辑器加载失败",
            description: "请稍后刷新页面，或返回材料列表重新进入。",
            variant: "error" as const,
          };

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
          返回材料列表
        </Button>
      </AdminAsyncState>
    );
  }

  return (
    <section className="space-y-6" data-testid="material-editor-page">
      <header className="space-y-3">
        <Button type="button" variant="ghost" onClick={handleReturnToList}>
          <ArrowLeft aria-hidden="true" data-icon="inline-start" />
          返回材料列表
        </Button>
        <div className="space-y-2">
          <p className="text-brand-primary text-sm font-medium">
            内容后台 · 材料库
          </p>
          <h1 className="font-heading text-text-primary text-2xl font-semibold">
            新建材料
          </h1>
          <p className="text-text-secondary max-w-3xl text-sm">
            独立维护可复用材料正文和适用范围；保存前使用与 API
            相同的语义校验合同。
          </p>
        </div>
      </header>

      {feedback === null ? null : (
        <AdminToast feedback={feedback} onDismiss={() => setFeedback(null)} />
      )}

      {createdMaterialTitle === null ? (
        <AdminMaterialEditorForm
          isSubmitting={isSubmitting}
          mode="create"
          values={createDefaultMaterialFormValues()}
          onCancel={handleReturnToList}
          onSubmit={(values) => void handleSaveMaterial(values)}
        />
      ) : (
        <section
          aria-live="polite"
          className="bg-surface border-border rounded-md border p-6 text-center shadow-sm"
          data-testid="material-create-completion"
          role="status"
        >
          <h2 className="text-text-primary text-lg font-semibold">
            材料已创建
          </h2>
          <p className="text-text-secondary mt-2 text-sm">
            “{createdMaterialTitle}”已进入材料库，可返回列表继续管理。
          </p>
          <Button className="mt-4" type="button" onClick={handleReturnToList}>
            返回材料列表
          </Button>
        </section>
      )}
    </section>
  );
}
