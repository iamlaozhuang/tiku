"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowLeft, Copy, ShieldAlert } from "lucide-react";

import { AdminAsyncState } from "@/components/admin/AdminAsyncState";
import { AdminToast, type AdminFeedback } from "@/components/admin/AdminToast";
import { Button } from "@/components/ui/button";
import { useAdminEditorNavigationGuard } from "@/hooks/useAdminEditorNavigationGuard";
import {
  createAdminEditorHref,
  resolveAdminEditorReturnTo,
} from "@/lib/admin-editor-navigation";
import type { AuthContextDto } from "@/server/contracts/auth-contract";
import type {
  MaterialDto,
  MaterialResultDto,
} from "@/server/contracts/material-contract";

import {
  fetchAdminApi,
  getStoredSessionToken,
  isAdminContext,
  isUnauthorizedResponse,
} from "../content-admin-runtime";
import {
  AdminMaterialEditorForm,
  createDefaultMaterialFormValues,
  createMaterialFormValuesFromMaterial,
  createMaterialInput,
  type MaterialFormValues,
} from "./AdminMaterialEditorForm";

type EditorLoadState =
  | "loading"
  | "ready"
  | "unauthorized"
  | "forbidden"
  | "not_found"
  | "error";

const MATERIAL_LOCKED_CODE = 409201;

export function AdminMaterialEditorPage({
  materialPublicId,
}: {
  materialPublicId?: string;
}) {
  const isEditMode = materialPublicId !== undefined;
  const [returnTo] = useState(() =>
    typeof window === "undefined"
      ? "/content/materials"
      : resolveAdminEditorReturnTo("materials", window.location.search),
  );
  const navigationGuard = useAdminEditorNavigationGuard({
    resource: "materials",
    returnTo,
  });
  const [loadState, setLoadState] = useState<EditorLoadState>("loading");
  const [material, setMaterial] = useState<MaterialDto | null>(null);
  const [feedback, setFeedback] = useState<AdminFeedback | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCopying, setIsCopying] = useState(false);
  const [lockConflict, setLockConflict] = useState(false);
  const [formRevision, setFormRevision] = useState(0);
  const submissionInProgressRef = useRef(false);

  useEffect(() => {
    let isActive = true;

    async function loadEditor() {
      submissionInProgressRef.current = false;
      setLoadState("loading");
      setMaterial(null);
      setFeedback(null);
      setIsSubmitting(false);
      setIsCopying(false);
      setLockConflict(false);
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

        const detailResponse = await fetchAdminApi<MaterialResultDto>(
          `/api/v1/materials/${encodeURIComponent(materialPublicId)}`,
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
        if (detailResponse.code === 404201) {
          setLoadState("not_found");
          return;
        }
        if (detailResponse.code !== 0 || detailResponse.data === null) {
          setLoadState("error");
          return;
        }

        setMaterial(detailResponse.data.material);
        setLoadState("ready");
      } catch {
        if (isActive) setLoadState("error");
      }
    }

    void loadEditor();
    return () => {
      isActive = false;
    };
  }, [isEditMode, materialPublicId]);

  function handleReturnToList() {
    navigationGuard.navigateToList();
  }

  async function handleCopyMaterial() {
    if (materialPublicId === undefined || submissionInProgressRef.current) {
      return;
    }
    if (!navigationGuard.canDiscard()) return;

    const sessionToken = getStoredSessionToken();
    if (sessionToken === null) {
      setFeedback({
        message: "管理员会话已失效，请重新登录后再操作。",
        title: "材料复制失败",
        tone: "error",
      });
      return;
    }

    submissionInProgressRef.current = true;
    setIsCopying(true);
    setFeedback(null);
    let navigationStarted = false;

    try {
      const response = await fetchAdminApi<MaterialResultDto>(
        `/api/v1/materials/${encodeURIComponent(materialPublicId)}/copy`,
        sessionToken,
        { method: "POST" },
      );

      if (response.code !== 0 || response.data === null) {
        setFeedback({
          message: "当前页面保持不变，请检查冲突或稍后重试。",
          title: "材料复制失败",
          tone: String(response.code).startsWith("409") ? "conflict" : "error",
        });
        return;
      }

      navigationStarted = true;
      navigationGuard.navigate(
        createAdminEditorHref({
          publicId: response.data.material.publicId,
          resource: "materials",
          returnTo,
        }),
        { skipConfirmation: true },
      );
    } catch {
      setFeedback({
        message: "当前页面保持不变，请检查网络后重试。",
        title: "材料复制失败",
        tone: "error",
      });
    } finally {
      if (!navigationStarted) {
        submissionInProgressRef.current = false;
        setIsCopying(false);
      }
    }
  }

  async function handleSaveMaterial(values: MaterialFormValues) {
    if (submissionInProgressRef.current || lockConflict) return;

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
    let navigationStarted = false;

    try {
      const response = await fetchAdminApi<MaterialResultDto>(
        isEditMode
          ? `/api/v1/materials/${encodeURIComponent(materialPublicId)}`
          : "/api/v1/materials",
        sessionToken,
        {
          method: isEditMode ? "PATCH" : "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(
            isEditMode
              ? { ...createMaterialInput(values), status: "available" }
              : createMaterialInput(values),
          ),
        },
      );

      if (response.code === MATERIAL_LOCKED_CODE && isEditMode) {
        setLockConflict(true);
        setFeedback({
          message:
            "服务端已锁定该材料，当前输入仍保留；不能继续覆盖，请复制新材料或返回列表。",
          title: "材料保存冲突",
          tone: "conflict",
        });
        return;
      }

      if (response.code !== 0 || response.data === null) {
        setFeedback({
          message: "当前输入已保留，请处理冲突或检查内容后重试。",
          title: "材料保存失败",
          tone: String(response.code).startsWith("409") ? "conflict" : "error",
        });
        return;
      }

      if (!isEditMode) {
        navigationStarted = true;
        navigationGuard.navigate(
          createAdminEditorHref({
            publicId: response.data.material.publicId,
            resource: "materials",
            returnTo,
          }),
          { skipConfirmation: true },
        );
        return;
      }

      setMaterial(response.data.material);
      setFormRevision((currentRevision) => currentRevision + 1);
      setFeedback({
        message: "材料内容与适用范围已更新。",
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
      if (!navigationStarted) {
        submissionInProgressRef.current = false;
        setIsSubmitting(false);
      }
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
    const stateContent = {
      unauthorized: {
        title: "无权访问材料编辑器",
        description: "请使用具备内容后台权限的管理员会话后重试。",
        variant: "unauthorized" as const,
      },
      forbidden: {
        title: "无权编辑该材料",
        description: "服务端拒绝了当前操作，请返回材料列表选择可访问内容。",
        variant: "forbidden" as const,
      },
      not_found: {
        title: "未找到材料",
        description: "材料可能已不存在，请返回材料列表重新选择。",
        variant: "error" as const,
      },
      error: {
        title: "材料编辑器加载失败",
        description: "请稍后刷新页面，或返回材料列表重新进入。",
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
          返回材料列表
        </Button>
      </AdminAsyncState>
    );
  }

  const lockedMaterial = material?.isLocked === true;
  const editorValues =
    material === null
      ? createDefaultMaterialFormValues()
      : createMaterialFormValuesFromMaterial(material);

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
            {isEditMode ? "编辑材料" : "新建材料"}
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

      {lockedMaterial ? (
        <MaterialLockBlocker
          isCopying={isCopying}
          onCopy={() => void handleCopyMaterial()}
          onReturn={handleReturnToList}
        />
      ) : (
        <>
          {lockConflict ? (
            <section
              className="border-warning/30 bg-warning/10 rounded-md border p-4"
              data-testid="material-lock-conflict-actions"
            >
              <p className="text-text-secondary text-sm">
                当前输入仍在表单中。该材料已不能覆盖，请复制服务端材料为新材料，或返回列表。
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Button
                  disabled={isCopying}
                  type="button"
                  onClick={() => void handleCopyMaterial()}
                >
                  <Copy aria-hidden="true" data-icon="inline-start" />
                  {isCopying ? "复制中…" : "复制为新材料并编辑"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleReturnToList}
                >
                  返回材料列表
                </Button>
              </div>
            </section>
          ) : null}
          <AdminMaterialEditorForm
            isSubmitting={isSubmitting}
            key={
              material === null
                ? "create"
                : `${material.publicId}:${formRevision}`
            }
            mode={isEditMode ? "edit" : "create"}
            submitBlockedReason={
              lockConflict
                ? "材料已在服务端锁定，请复制新材料或返回列表。"
                : null
            }
            values={editorValues}
            onCancel={handleReturnToList}
            onDirtyStateChange={navigationGuard.onDirtyStateChange}
            onSubmit={(values) => void handleSaveMaterial(values)}
          />
        </>
      )}
    </section>
  );
}

function MaterialLockBlocker({
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
        材料已锁定
      </h2>
      <p className="text-text-secondary mx-auto mt-2 max-w-2xl text-sm">
        该材料已被已发布试卷引用，服务端禁止覆盖。可显式复制为独立新材料后继续编辑。
      </p>
      <div className="mt-4 flex flex-wrap justify-center gap-2">
        <Button disabled={isCopying} type="button" onClick={onCopy}>
          <Copy aria-hidden="true" data-icon="inline-start" />
          {isCopying ? "复制中…" : "复制为新材料并编辑"}
        </Button>
        <Button type="button" variant="outline" onClick={onReturn}>
          返回材料列表
        </Button>
      </div>
    </AdminAsyncState>
  );
}
