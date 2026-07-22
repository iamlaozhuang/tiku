"use client";

import { useEffect, useState } from "react";
import { AlertCircle, LoaderCircle } from "lucide-react";

import { AdminDetailDrawer } from "@/components/admin/AdminDetailDrawer";
import { StudentRichText } from "@/components/StudentRichText";
import { Button } from "@/components/ui/button";
import type {
  MaterialDto,
  MaterialResultDto,
} from "@/server/contracts/material-contract";
import type {
  QuestionDetailDto,
  QuestionDetailResultDto,
} from "@/server/contracts/question-contract";

import {
  fetchAdminApi,
  formatScope,
  getStoredSessionToken,
} from "../content-admin-runtime";

export type AdminContentDetailTarget = {
  kind: "question" | "material";
  publicId: string;
};

type DetailState =
  | { status: "loading" }
  | { status: "question"; question: QuestionDetailDto }
  | { status: "material"; material: MaterialDto }
  | { status: "not_found" | "forbidden" | "unauthorized" | "error" };

const questionTypeLabels: Record<QuestionDetailDto["questionType"], string> = {
  calculation: "计算题",
  case_analysis: "案例分析题",
  fill_blank: "填空题",
  multi_choice: "多选题",
  short_answer: "简答题",
  single_choice: "单选题",
  true_false: "判断题",
};

const contentStatusLabels = {
  available: "可用",
  disabled: "已停用",
} as const;

const scoringMethodLabels: Record<QuestionDetailDto["scoringMethod"], string> =
  {
    ai_scoring: "AI 评分",
    auto_match: "自动匹配",
  };

function formatDateTime(value: string | null): string {
  if (value === null) return "无";

  const parsedValue = new Date(value);

  if (Number.isNaN(parsedValue.getTime())) return "时间暂不可用";

  return new Intl.DateTimeFormat("zh-CN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(parsedValue);
}

function isNotFoundCode(code: number): boolean {
  return Math.trunc(code / 1000) === 404;
}

function DetailStateMessage({
  description,
  status = "alert",
  title,
}: {
  description: string;
  status?: "alert" | "status";
  title: string;
}) {
  return (
    <div
      aria-live={status === "alert" ? "assertive" : "polite"}
      className="border-border bg-muted/30 flex min-h-40 flex-col items-center justify-center rounded-md border p-6 text-center"
      role={status}
    >
      {status === "status" ? (
        <LoaderCircle
          aria-hidden="true"
          className="text-text-muted size-5 animate-spin"
        />
      ) : (
        <AlertCircle aria-hidden="true" className="text-text-muted size-5" />
      )}
      <p className="text-text-primary mt-3 text-sm font-semibold">{title}</p>
      <p className="text-text-secondary mt-1 text-xs leading-5">
        {description}
      </p>
    </div>
  );
}

function DetailDefinitionList({
  items,
}: {
  items: Array<{ label: string; value: string }>;
}) {
  return (
    <dl className="border-border grid gap-x-6 gap-y-3 border-y py-4 sm:grid-cols-2">
      {items.map((item) => (
        <div key={item.label}>
          <dt className="text-text-muted text-xs">{item.label}</dt>
          <dd className="text-text-primary mt-1 text-sm">{item.value}</dd>
        </div>
      ))}
    </dl>
  );
}

function RichTextSection({
  fallback,
  title,
  value,
}: {
  fallback: string;
  title: string;
  value: string | null | undefined;
}) {
  return (
    <section className="border-border border-t pt-4">
      <h3 className="text-text-primary text-sm font-semibold">{title}</h3>
      <StudentRichText
        className="text-text-secondary mt-3 space-y-2 text-sm leading-6"
        fallback={fallback}
        value={value}
      />
    </section>
  );
}

function QuestionDetail({
  onPaperReferencePageChange,
  question,
}: {
  onPaperReferencePageChange: (page: number) => void;
  question: QuestionDetailDto;
}) {
  const { pagination } = question.paperReferences;
  const pageCount = Math.max(
    1,
    Math.ceil(pagination.total / pagination.pageSize),
  );

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-2 text-xs">
        <span className="bg-secondary text-secondary-foreground rounded-md px-2 py-1 font-medium">
          {contentStatusLabels[question.status]}
        </span>
        <span className="border-border text-text-secondary rounded-md border px-2 py-1">
          {questionTypeLabels[question.questionType]}
        </span>
        <span className="border-border text-text-secondary rounded-md border px-2 py-1">
          {formatScope(question)}
        </span>
      </div>

      <DetailDefinitionList
        items={[
          {
            label: "编辑状态",
            value:
              question.lockReason === null
                ? question.isLocked
                  ? "已锁定，只能查看或复制"
                  : "未锁定，可返回列表编辑"
                : `由 ${question.lockReason.paperCount} 套已发布或已下架试卷锁定`,
          },
          {
            label: "评分方式",
            value: scoringMethodLabels[question.scoringMethod],
          },
          {
            label: "关联材料",
            value: question.material?.title ?? "无",
          },
          {
            label: "知识点与标签",
            value: `${question.knowledgeNodes.length} 个知识点 / ${question.tags.length} 个标签`,
          },
          { label: "锁定时间", value: formatDateTime(question.lockedAt) },
          { label: "更新时间", value: formatDateTime(question.updatedAt) },
        ]}
      />

      <section className="border-border border-t pt-4">
        <h3 className="text-text-primary text-sm font-semibold">知识点</h3>
        {question.knowledgeNodes.length === 0 ? (
          <p className="text-text-secondary mt-3 text-sm">暂无关联知识点。</p>
        ) : (
          <ul className="mt-3 space-y-2">
            {question.knowledgeNodes.map((knowledgeNode) => (
              <li
                className="border-border rounded-md border px-3 py-2"
                key={knowledgeNode.publicId}
              >
                <p className="text-text-primary text-sm font-medium">
                  {knowledgeNode.name}
                </p>
                <p className="text-text-muted mt-1 text-xs">
                  {knowledgeNode.pathName} ·{" "}
                  {knowledgeNode.knStatus === "active" ? "启用" : "已停用"}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="border-border border-t pt-4">
        <h3 className="text-text-primary text-sm font-semibold">标签</h3>
        {question.tags.length === 0 ? (
          <p className="text-text-secondary mt-3 text-sm">暂无标签。</p>
        ) : (
          <ul className="mt-3 flex flex-wrap gap-2">
            {question.tags.map((tag) => (
              <li
                className="bg-muted text-text-secondary rounded-md px-2 py-1 text-xs"
                key={tag.publicId}
              >
                {tag.name}
              </li>
            ))}
          </ul>
        )}
      </section>

      <RichTextSection
        fallback="题干内容为空"
        title="题干"
        value={question.stemRichText}
      />

      <section className="border-border border-t pt-4">
        <h3 className="text-text-primary text-sm font-semibold">选项</h3>
        {question.questionOptions.length === 0 ? (
          <p className="text-text-secondary mt-3 text-sm">本题无选项。</p>
        ) : (
          <ol className="mt-3 space-y-2">
            {question.questionOptions.map((questionOption) => (
              <li
                className="border-border grid grid-cols-[2rem_minmax(0,1fr)_auto] items-start gap-2 border-b pb-2 text-sm"
                key={`${questionOption.sortOrder}-${questionOption.label}`}
              >
                <span className="text-text-primary font-medium">
                  {questionOption.label}
                </span>
                <StudentRichText
                  className="text-text-secondary"
                  fallback="选项内容为空"
                  mode="inline"
                  value={questionOption.contentRichText}
                />
                <span className="text-text-muted text-xs">
                  {questionOption.isCorrect ? "正确答案" : ""}
                </span>
              </li>
            ))}
          </ol>
        )}
      </section>

      <RichTextSection
        fallback="未填写参考答案"
        title="标准答案 / 参考答案"
        value={question.standardAnswerRichText}
      />
      <RichTextSection
        fallback="未填写老师解析"
        title="老师解析"
        value={question.analysisRichText}
      />

      <section className="border-border border-t pt-4">
        <h3 className="text-text-primary text-sm font-semibold">评分点</h3>
        {question.scoringPoints.length === 0 ? (
          <p className="text-text-secondary mt-3 text-sm">本题未配置评分点。</p>
        ) : (
          <ol className="mt-3 space-y-2 text-sm">
            {question.scoringPoints.map((scoringPoint) => (
              <li
                className="border-border flex items-start justify-between gap-4 border-b pb-2"
                key={`${scoringPoint.sortOrder}-${scoringPoint.description}`}
              >
                <span className="text-text-secondary">
                  {scoringPoint.description}
                </span>
                <span className="text-text-primary shrink-0 font-medium">
                  {scoringPoint.score} 分
                </span>
              </li>
            ))}
          </ol>
        )}
      </section>

      <section className="border-border border-t pt-4">
        <div className="flex items-center justify-between gap-4">
          <h3 className="text-text-primary text-sm font-semibold">引用试卷</h3>
          <span className="text-text-muted text-xs">
            共 {pagination.total} 套
          </span>
        </div>
        {question.paperReferences.items.length === 0 ? (
          <p className="text-text-secondary mt-3 text-sm">暂无引用试卷。</p>
        ) : (
          <ul className="mt-3 divide-y">
            {question.paperReferences.items.map((reference) => (
              <li className="py-2" key={reference.paperPublicId}>
                <p className="text-text-primary text-sm font-medium">
                  {reference.name}
                </p>
                <p className="text-text-muted mt-1 text-xs">
                  {reference.paperStatus === "published"
                    ? "已发布"
                    : reference.paperStatus === "archived"
                      ? "已下架"
                      : "草稿"}
                  {" · "}
                  {formatDateTime(reference.updatedAt)}
                </p>
              </li>
            ))}
          </ul>
        )}
        <div className="mt-3 flex items-center justify-between gap-3">
          <Button
            aria-label="上一页引用试卷"
            disabled={pagination.page <= 1}
            size="sm"
            type="button"
            variant="outline"
            onClick={() => onPaperReferencePageChange(pagination.page - 1)}
          >
            上一页
          </Button>
          <span className="text-text-muted text-xs">
            第 {pagination.page} / {pageCount} 页
          </span>
          <Button
            aria-label="下一页引用试卷"
            disabled={pagination.page >= pageCount}
            size="sm"
            type="button"
            variant="outline"
            onClick={() => onPaperReferencePageChange(pagination.page + 1)}
          >
            下一页
          </Button>
        </div>
      </section>
    </div>
  );
}

function MaterialDetail({ material }: { material: MaterialDto }) {
  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-2 text-xs">
        <span className="bg-secondary text-secondary-foreground rounded-md px-2 py-1 font-medium">
          {contentStatusLabels[material.status]}
        </span>
        <span className="border-border text-text-secondary rounded-md border px-2 py-1">
          {formatScope(material)}
        </span>
      </div>

      <DetailDefinitionList
        items={[
          {
            label: "编辑状态",
            value: material.isLocked
              ? "已锁定，只能查看或复制"
              : "未锁定，可返回列表编辑",
          },
          {
            label: "引用摘要",
            value: `${material.references.questions.length} 道题目 / ${material.references.papers.length} 套试卷`,
          },
          { label: "锁定时间", value: formatDateTime(material.lockedAt) },
          { label: "更新时间", value: formatDateTime(material.updatedAt) },
        ]}
      />

      <RichTextSection
        fallback="材料正文为空"
        title="材料正文"
        value={material.contentRichText}
      />

      <section className="border-border border-t pt-4">
        <h3 className="text-text-primary text-sm font-semibold">关联题目</h3>
        {material.references.questions.length === 0 ? (
          <p className="text-text-secondary mt-3 text-sm">暂无关联题目。</p>
        ) : (
          <ul className="mt-3 divide-y">
            {material.references.questions.map((reference) => (
              <li
                className="text-text-secondary py-2 text-sm"
                key={reference.questionPublicId}
              >
                {questionTypeLabels[reference.questionType]} /{" "}
                {contentStatusLabels[reference.status]}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="border-border border-t pt-4">
        <h3 className="text-text-primary text-sm font-semibold">关联试卷</h3>
        {material.references.papers.length === 0 ? (
          <p className="text-text-secondary mt-3 text-sm">暂无关联试卷。</p>
        ) : (
          <ul className="mt-3 divide-y">
            {material.references.papers.map((reference) => (
              <li className="py-2" key={reference.paperPublicId}>
                <p className="text-text-primary text-sm font-medium">
                  {reference.name}
                </p>
                <p className="text-text-muted mt-1 text-xs">
                  {reference.paperStatus === "published"
                    ? "已发布"
                    : reference.paperStatus === "archived"
                      ? "已下架"
                      : "草稿"}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

export function AdminContentDetailDrawer({
  onClose,
  target,
}: {
  onClose: () => void;
  target: AdminContentDetailTarget;
}) {
  const [state, setState] = useState<DetailState>({ status: "loading" });
  const targetKey = `${target.kind}:${target.publicId}`;
  const [questionPaperReferenceState, setQuestionPaperReferenceState] =
    useState({ page: 1, targetKey });
  const questionPaperReferencePage =
    questionPaperReferenceState.targetKey === targetKey
      ? questionPaperReferenceState.page
      : 1;
  const ariaLabel = target.kind === "question" ? "题目详情" : "材料详情";

  useEffect(() => {
    let isActive = true;

    async function loadDetail() {
      setState({ status: "loading" });

      try {
        const sessionToken = getStoredSessionToken();
        const path =
          target.kind === "question"
            ? `/api/v1/questions/${target.publicId}?page=${questionPaperReferencePage}&pageSize=20`
            : `/api/v1/materials/${target.publicId}`;
        const response = await fetchAdminApi<
          QuestionDetailResultDto | MaterialResultDto
        >(path, sessionToken);

        if (!isActive) return;

        if (response.code === 401001) {
          setState({ status: "unauthorized" });
          return;
        }

        if (response.code === 403621) {
          setState({ status: "forbidden" });
          return;
        }

        if (isNotFoundCode(response.code)) {
          setState({ status: "not_found" });
          return;
        }

        if (response.code !== 0 || response.data === null) {
          setState({ status: "error" });
          return;
        }

        if (target.kind === "question" && "question" in response.data) {
          setState({ status: "question", question: response.data.question });
          return;
        }

        if (target.kind === "material" && "material" in response.data) {
          setState({ status: "material", material: response.data.material });
          return;
        }

        setState({ status: "error" });
      } catch {
        if (isActive) setState({ status: "error" });
      }
    }

    void loadDetail();

    return () => {
      isActive = false;
    };
  }, [questionPaperReferencePage, target]);

  return (
    <AdminDetailDrawer
      ariaLabel={ariaLabel}
      description="只读查看不会修改内容或状态；编辑、复制和停用仍从列表执行。"
      onClose={onClose}
      title={
        state.status === "material"
          ? state.material.title
          : target.kind === "question"
            ? "题目详情"
            : "材料详情"
      }
    >
      {state.status === "loading" ? (
        <DetailStateMessage
          description="正在读取最新内容和状态。"
          status="status"
          title="正在加载详情"
        />
      ) : null}
      {state.status === "unauthorized" ? (
        <DetailStateMessage
          description="管理员会话已失效，请重新登录后再查看。"
          title="请先登录后台"
        />
      ) : null}
      {state.status === "forbidden" ? (
        <DetailStateMessage
          description="当前角色没有查看该内容详情的权限。"
          title="无权查看详情"
        />
      ) : null}
      {state.status === "not_found" ? (
        <DetailStateMessage
          description="内容可能已不存在，关闭详情后可刷新列表。"
          title="未找到内容"
        />
      ) : null}
      {state.status === "error" ? (
        <DetailStateMessage
          description="请关闭后重试，或刷新列表确认当前状态。"
          title="详情加载失败"
        />
      ) : null}
      {state.status === "question" ? (
        <QuestionDetail
          onPaperReferencePageChange={(page) =>
            setQuestionPaperReferenceState({ page, targetKey })
          }
          question={state.question}
        />
      ) : null}
      {state.status === "material" ? (
        <MaterialDetail material={state.material} />
      ) : null}
    </AdminDetailDrawer>
  );
}
