"use client";

import type { ReactNode } from "react";
import { AlertCircle, CheckCircle2, LoaderCircle } from "lucide-react";
import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  ADMIN_CONFLICT_MESSAGE,
  ADMIN_PAGE_SIZE_OPTIONS,
} from "@/server/contracts/admin-interaction-contract";

type AdminContentKnowledgeOpsState = "ready" | "loading" | "empty" | "error";

type ConfirmationKind = "publishResource" | "rebuildVector";

type ToastMessage = {
  tone: "success" | "error";
  message: string;
};

export function AdminContentKnowledgeOpsBaseline({
  state = "ready",
}: {
  state?: AdminContentKnowledgeOpsState;
}) {
  const [confirmationKind, setConfirmationKind] =
    useState<ConfirmationKind | null>(null);
  const [toastMessage, setToastMessage] = useState<ToastMessage | null>(null);

  const preview = useMemo(
    () => ({
      questions: [
        {
          publicId: "question-public-001",
          stemSummary: "市场调研抽样方法的核心目标是什么？",
          meta: "single_choice / marketing / level 3 / 市场调研",
        },
        {
          publicId: "question-public-002",
          stemSummary: "物流成本核算适用于哪类场景？",
          meta: "multi_choice / logistics / level 3 / 物流成本",
        },
      ],
      papers: [
        {
          publicId: "paper-public-001",
          name: "2026 春季营销理论模拟卷",
          meta: "published / mock_paper / 50 题 / 模拟记录 18",
        },
      ],
      resources: [
        {
          publicId: "resource-public-001",
          title: "营销知识库讲义",
          meta: "rag_ready / lecture_note / marketing / level 3",
        },
      ],
      knowledgeNodes: [
        {
          publicId: "knowledge-node-public-001",
          name: "市场调研",
          meta: "营销/市场调研 / 18 题 / 可推荐",
        },
      ],
    }),
    [],
  );

  if (state === "loading") {
    return (
      <AdminOpsStatePanel
        icon={
          <LoaderCircle aria-hidden="true" className="size-8 animate-spin" />
        }
        title="正在加载内容与知识库运营数据"
      />
    );
  }

  if (state === "empty") {
    return (
      <AdminOpsStatePanel
        icon={<CheckCircle2 aria-hidden="true" className="size-8" />}
        title="暂无内容与知识库运营数据"
      />
    );
  }

  if (state === "error") {
    return (
      <AdminOpsStatePanel
        icon={<AlertCircle aria-hidden="true" className="size-8" />}
        title="内容与知识库运营数据加载失败"
      />
    );
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-2">
          <p className="text-brand-primary text-sm font-medium">Content Ops</p>
          <h1 className="font-heading text-text-primary text-2xl font-semibold">
            内容与知识库运营
          </h1>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button onClick={() => setConfirmationKind("publishResource")}>
            发布资源
          </Button>
          <Button
            variant="destructive"
            onClick={() => setConfirmationKind("rebuildVector")}
          >
            手动重建向量
          </Button>
        </div>
      </header>

      <div className="bg-surface border-border grid gap-4 rounded-md border p-4 shadow-sm lg:grid-cols-[12rem_12rem_1fr]">
        <label className="flex flex-col gap-2 text-sm font-medium">
          <span className="text-text-secondary">每页条数</span>
          <select
            aria-label="每页条数"
            className="border-input focus-visible:border-ring focus-visible:ring-ring/50 bg-surface h-8 rounded-lg border px-2.5 text-sm outline-none focus-visible:ring-3"
            defaultValue="20"
          >
            {ADMIN_PAGE_SIZE_OPTIONS.map((pageSize) => (
              <option key={pageSize} value={pageSize}>
                {pageSize}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-2 text-sm font-medium">
          <span className="text-text-secondary">内容范围</span>
          <select
            aria-label="内容范围"
            className="border-input focus-visible:border-ring focus-visible:ring-ring/50 bg-surface h-8 rounded-lg border px-2.5 text-sm outline-none focus-visible:ring-3"
            defaultValue="question"
          >
            <option value="question">题目</option>
            <option value="paper">试卷</option>
            <option value="resource">资源</option>
            <option value="knowledgeNode">知识点</option>
          </select>
        </label>
        <div className="text-text-muted flex items-end text-sm">
          内容老师首期不按专业或等级隔离
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <AdminOpsPanel title="题库管理">
          {preview.questions.map((question) => (
            <AdminOpsSummaryRow
              key={question.publicId}
              label={question.stemSummary}
              meta={question.meta}
              publicId={question.publicId}
              testId={`admin-question-${question.publicId}`}
            />
          ))}
        </AdminOpsPanel>

        <AdminOpsPanel title="试卷管理">
          {preview.papers.map((paper) => (
            <AdminOpsSummaryRow
              key={paper.publicId}
              label={paper.name}
              meta={paper.meta}
              publicId={paper.publicId}
            />
          ))}
        </AdminOpsPanel>

        <AdminOpsPanel title="资源与知识库">
          {preview.resources.map((resource) => (
            <AdminOpsSummaryRow
              key={resource.publicId}
              label={resource.title}
              meta={resource.meta}
              publicId={resource.publicId}
            />
          ))}
        </AdminOpsPanel>

        <AdminOpsPanel title="知识点树">
          {preview.knowledgeNodes.map((knowledgeNode) => (
            <AdminOpsSummaryRow
              key={knowledgeNode.publicId}
              label={knowledgeNode.name}
              meta={knowledgeNode.meta}
              publicId={knowledgeNode.publicId}
            />
          ))}
        </AdminOpsPanel>
      </div>

      {confirmationKind === null ? null : (
        <AdminOpsConfirmationDialog
          confirmationKind={confirmationKind}
          onCancel={() => setConfirmationKind(null)}
          onConfirm={() => {
            setConfirmationKind(null);

            if (confirmationKind === "publishResource") {
              setToastMessage({
                tone: "success",
                message: "资源发布已提交",
              });
              return;
            }

            setToastMessage({
              tone: "error",
              message: ADMIN_CONFLICT_MESSAGE,
            });
          }}
        />
      )}

      {toastMessage === null ? null : <AdminOpsToast message={toastMessage} />}
    </div>
  );
}

function AdminOpsStatePanel({
  icon,
  title,
}: {
  icon: ReactNode;
  title: string;
}) {
  return (
    <div className="bg-surface border-border rounded-md border p-8 text-center shadow-sm">
      <div className="text-brand-primary mx-auto flex justify-center">
        {icon}
      </div>
      <h1 className="text-text-primary mt-4 text-base font-semibold">
        {title}
      </h1>
    </div>
  );
}

function AdminOpsPanel({
  children,
  title,
}: {
  children: ReactNode;
  title: string;
}) {
  return (
    <section className="bg-surface border-border rounded-md border p-4 shadow-sm">
      <h2 className="text-text-primary text-base font-semibold">{title}</h2>
      <div className="mt-3">{children}</div>
    </section>
  );
}

function AdminOpsSummaryRow({
  label,
  meta,
  publicId,
  testId,
}: {
  label: string;
  meta: string;
  publicId: string;
  testId?: string;
}) {
  return (
    <div
      className="border-border flex items-center justify-between gap-4 border-t py-3 first:border-t-0 first:pt-0 last:pb-0"
      data-public-id={publicId}
      data-testid={testId}
    >
      <div>
        <p className="text-text-primary text-sm font-medium">{label}</p>
        <p className="text-text-muted text-xs">{meta}</p>
      </div>
      <Button variant="outline">查看</Button>
    </div>
  );
}

function AdminOpsConfirmationDialog({
  confirmationKind,
  onCancel,
  onConfirm,
}: {
  confirmationKind: ConfirmationKind;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  const isRebuildVector = confirmationKind === "rebuildVector";
  const title = isRebuildVector ? "向量重建需要二次确认" : "确认发布资源？";
  const confirmLabel = isRebuildVector ? "确认重建" : "确认发布";

  return (
    <div
      aria-modal="true"
      className="border-border bg-surface fixed top-20 left-1/2 z-50 w-full max-w-md -translate-x-1/2 rounded-md border p-4 shadow-lg"
      role="alertdialog"
    >
      <div className="space-y-3">
        <h2 className="text-text-primary text-base font-semibold">{title}</h2>
        <div className="flex gap-2">
          <Button
            variant={isRebuildVector ? "destructive" : "default"}
            onClick={onConfirm}
          >
            {confirmLabel}
          </Button>
          <Button variant="outline" onClick={onCancel}>
            取消
          </Button>
        </div>
      </div>
    </div>
  );
}

function AdminOpsToast({ message }: { message: ToastMessage }) {
  return (
    <div
      className={
        message.tone === "success"
          ? "bg-secondary text-secondary-foreground fixed right-6 bottom-6 rounded-md px-4 py-3 text-sm shadow-lg"
          : "bg-destructive/10 text-destructive fixed right-6 bottom-6 rounded-md px-4 py-3 text-sm shadow-lg"
      }
      role={message.tone === "success" ? "status" : "alert"}
    >
      {message.message}
    </div>
  );
}
