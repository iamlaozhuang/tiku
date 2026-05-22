"use client";

import { useEffect, useMemo, useState } from "react";
import { GitBranch, Move, Pencil, Plus, Search, ShieldOff } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { AdminKnowledgeNodeOpsSummaryDto } from "@/server/contracts/admin-content-knowledge-ops-contract";
import type { AuthContextDto } from "@/server/contracts/auth-contract";
import type { KnStatus } from "@/server/models/ai-rag";
import type { Profession } from "@/server/models/paper";

import {
  AdminErrorState,
  AdminLoadingState,
  AdminUnauthorizedState,
  DEFAULT_CONTENT_LIST_QUERY,
  FilterSelect,
  PublicId,
  fetchAdminApi,
  getStoredSessionToken,
  includesKeyword,
  isAdminContext,
  isUnauthorizedResponse,
  matchesFilter,
  professionLabels,
} from "../content-admin-runtime";

type KnowledgeNodeLoadState =
  | "loading"
  | "ready"
  | "empty"
  | "unauthorized"
  | "error";
type KnowledgeNodeStatusFilter = "all" | KnStatus;
type ProfessionFilter = "all" | Profession;

type KnowledgeNodeListDto = {
  knowledgeNodes: AdminKnowledgeNodeOpsSummaryDto[];
};

const knStatusLabels: Record<KnStatus, string> = {
  active: "可用",
  disabled: "已停用",
};

function useKnowledgeNodeData() {
  const [loadState, setLoadState] = useState<KnowledgeNodeLoadState>("loading");
  const [knowledgeNodes, setKnowledgeNodes] = useState<
    AdminKnowledgeNodeOpsSummaryDto[]
  >([]);

  useEffect(() => {
    let isActive = true;

    async function loadKnowledgeNodes() {
      const sessionToken = getStoredSessionToken();

      if (sessionToken === null) {
        setLoadState("unauthorized");
        return;
      }

      try {
        const sessionResponse = await fetchAdminApi<AuthContextDto>(
          "/api/v1/sessions",
          sessionToken,
        );

        if (!isActive) {
          return;
        }

        if (
          isUnauthorizedResponse(sessionResponse) ||
          sessionResponse.code !== 0 ||
          sessionResponse.data === null ||
          !isAdminContext(sessionResponse.data)
        ) {
          setLoadState("unauthorized");
          return;
        }

        const knowledgeNodeResponse = await fetchAdminApi<KnowledgeNodeListDto>(
          `/api/v1/knowledge-nodes?${DEFAULT_CONTENT_LIST_QUERY}`,
          sessionToken,
        );

        if (!isActive) {
          return;
        }

        if (
          knowledgeNodeResponse.code !== 0 ||
          knowledgeNodeResponse.data === null
        ) {
          setLoadState("error");
          return;
        }

        setKnowledgeNodes(knowledgeNodeResponse.data.knowledgeNodes);
        setLoadState(
          knowledgeNodeResponse.data.knowledgeNodes.length === 0
            ? "empty"
            : "ready",
        );
      } catch {
        if (isActive) {
          setLoadState("error");
        }
      }
    }

    void loadKnowledgeNodes();

    return () => {
      isActive = false;
    };
  }, []);

  return { knowledgeNodes, loadState };
}

export function AdminKnowledgeNodeManagement() {
  const [keyword, setKeyword] = useState("");
  const [profession, setProfession] = useState<ProfessionFilter>("all");
  const [status, setStatus] = useState<KnowledgeNodeStatusFilter>("all");
  const { knowledgeNodes, loadState } = useKnowledgeNodeData();
  const filteredKnowledgeNodes = useMemo(
    () =>
      knowledgeNodes.filter((knowledgeNode) => {
        const searchableText = [
          knowledgeNode.publicId,
          knowledgeNode.name,
          knowledgeNode.pathName,
          knowledgeNode.parentKnowledgeNodePublicId,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        return (
          includesKeyword(searchableText, keyword) &&
          matchesFilter(knowledgeNode.profession, profession) &&
          matchesFilter(knowledgeNode.knStatus, status)
        );
      }),
    [keyword, knowledgeNodes, profession, status],
  );

  if (loadState === "loading") {
    return <AdminLoadingState label="正在加载知识点树" />;
  }

  if (loadState === "unauthorized") {
    return <AdminUnauthorizedState />;
  }

  if (loadState === "error") {
    return (
      <AdminErrorState
        description="请稍后刷新页面，或重新登录后再查看知识点树。"
        title="知识点树加载失败"
      />
    );
  }

  return (
    <section className="space-y-6">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-2">
          <p className="text-brand-primary text-sm font-medium">
            Content Admin
          </p>
          <h1 className="font-heading text-text-primary text-2xl font-semibold">
            知识点树维护
          </h1>
          <p className="text-text-secondary max-w-3xl text-sm">
            按专业维护知识点节点、适用等级、排序、停用状态与绑定题目数量；页面只展示
            publicId，不暴露内部自增 id。
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button>
            <Plus aria-hidden="true" data-icon="inline-start" />
            新增节点
          </Button>
          <Button
            disabled={filteredKnowledgeNodes.length === 0}
            variant="outline"
          >
            <Pencil aria-hidden="true" data-icon="inline-start" />
            编辑节点
          </Button>
          <Button
            disabled={filteredKnowledgeNodes.length === 0}
            variant="outline"
          >
            <Move aria-hidden="true" data-icon="inline-start" />
            移动节点
          </Button>
          <Button
            disabled={filteredKnowledgeNodes.length === 0}
            variant="outline"
          >
            <ShieldOff aria-hidden="true" data-icon="inline-start" />
            停用节点
          </Button>
        </div>
      </header>

      <div className="bg-surface border-border rounded-md border p-4 shadow-sm">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end">
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
                placeholder="节点名称、路径或 publicId"
                value={keyword}
                onChange={(event) => setKeyword(event.target.value)}
              />
            </span>
          </label>
          <FilterSelect
            label="专业"
            options={[
              ["all", "全部专业"],
              ["marketing", "营销"],
              ["logistics", "物流"],
              ["monopoly", "专卖"],
            ]}
            value={profession}
            onChange={(value) => setProfession(value as ProfessionFilter)}
          />
          <FilterSelect
            label="状态"
            options={[
              ["all", "全部状态"],
              ["active", "可用"],
              ["disabled", "已停用"],
            ]}
            value={status}
            onChange={(value) => setStatus(value as KnowledgeNodeStatusFilter)}
          />
        </div>
      </div>

      <section className="grid gap-3 md:grid-cols-3" aria-label="知识点摘要">
        <SummaryItem
          label="当前结果"
          value={`${filteredKnowledgeNodes.length} 个`}
        />
        <SummaryItem
          label="绑定题目"
          value={`${filteredKnowledgeNodes.reduce(
            (questionCount, knowledgeNode) =>
              questionCount + knowledgeNode.questionCount,
            0,
          )} 题`}
        />
        <SummaryItem
          label="可推荐"
          value={`${
            filteredKnowledgeNodes.filter(
              (knowledgeNode) => knowledgeNode.isRecommendable,
            ).length
          } 个`}
        />
      </section>

      {filteredKnowledgeNodes.length > 0 ? (
        <KnowledgeNodeList rows={filteredKnowledgeNodes} />
      ) : (
        <FilteredEmptyState />
      )}
    </section>
  );
}

function SummaryItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-border bg-surface rounded-md border px-4 py-3 shadow-sm">
      <p className="text-text-muted text-xs font-medium">{label}</p>
      <p className="text-text-primary mt-1 text-lg font-semibold">{value}</p>
    </div>
  );
}

function KnowledgeNodeList({
  rows,
}: {
  rows: AdminKnowledgeNodeOpsSummaryDto[];
}) {
  return (
    <div className="grid gap-3">
      {rows.map((knowledgeNode) => (
        <article
          className="bg-surface border-border rounded-md border p-4 shadow-sm"
          data-public-id={knowledgeNode.publicId}
          data-testid={`knowledge-node-row-${knowledgeNode.publicId}`}
          key={knowledgeNode.publicId}
        >
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="bg-secondary text-secondary-foreground rounded-md px-2 py-1 text-xs font-medium">
                  {knStatusLabels[knowledgeNode.knStatus]}
                </span>
                <span className="text-text-muted text-xs">
                  {professionLabels[knowledgeNode.profession]}
                </span>
                <span className="text-text-muted text-xs">
                  等级 {formatLevelList(knowledgeNode.levelList)}
                </span>
              </div>
              <h2 className="text-text-primary flex items-center gap-2 text-base font-semibold">
                <GitBranch aria-hidden="true" className="size-4" />
                {knowledgeNode.pathName}
              </h2>
              <div className="flex flex-wrap gap-2 text-xs">
                <MetricBadge
                  label="绑定题目"
                  value={`${knowledgeNode.questionCount}`}
                />
                <MetricBadge
                  label="排序"
                  value={`${knowledgeNode.sortOrder}`}
                />
                <MetricBadge
                  label="推荐"
                  value={knowledgeNode.isRecommendable ? "可推荐" : "不推荐"}
                />
              </div>
            </div>
            <PublicId value={knowledgeNode.publicId} />
          </div>
          <p className="text-text-muted border-border mt-4 border-t pt-4 text-xs">
            父级 {knowledgeNode.parentKnowledgeNodePublicId ?? "无"} / 更新时间{" "}
            {formatDateTime(knowledgeNode.updatedAt)}
          </p>
        </article>
      ))}
    </div>
  );
}

function MetricBadge({ label, value }: { label: string; value: string }) {
  return (
    <span className="border-border text-text-secondary rounded-md border px-2 py-1">
      {label} {value}
    </span>
  );
}

function FilteredEmptyState() {
  return (
    <div className="bg-surface border-border rounded-md border p-8 text-center shadow-sm">
      <p className="text-text-primary font-medium">没有匹配的知识点</p>
      <p className="text-text-secondary mt-2 text-sm">
        调整关键词或筛选条件后再试。
      </p>
    </div>
  );
}

function formatLevelList(levelList: number[]) {
  return levelList.length === 0
    ? "通用"
    : levelList.map((level) => `${level}级`).join("、");
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("zh-CN", {
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(value));
}
