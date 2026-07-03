"use client";

import { useEffect, useState } from "react";
import {
  CheckCircle2,
  ClipboardList,
  Copy,
  FilePlus2,
  FileText,
  Link2,
  ShieldCheck,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { ApiResponse } from "@/server/contracts/api-response";
import type { AuthContextDto } from "@/server/contracts/auth-contract";
import type { AdminWorkspaceCapabilitySummary } from "@/server/contracts/admin-workspace-role-guard-contract";
import type {
  OrganizationTrainingDraftDto,
  OrganizationTrainingSourceContextAttachmentDto,
} from "@/server/contracts/organization-training-contract";
import type { Profession, Subject } from "@/server/models/paper";

import {
  AdminErrorState,
  AdminLoadingState,
  AdminUnauthorizedState,
  AdminUpgradeRequiredState,
  createAdminAuthHeaders,
  fetchAdminApi,
  getStoredSessionToken,
  isAdminContext,
  isUnauthorizedResponse,
  professionLabels,
  subjectLabels,
} from "../content-admin-runtime";
import {
  createOrganizationTrainingCapabilityContext,
  resolveOrganizationWorkspacePageAccess,
} from "../organization-workspace/admin-organization-workspace-access";

type AdminOrganizationTrainingLoadState =
  | "loading"
  | "ready"
  | "standard-unavailable"
  | "unauthorized"
  | "error";

type DraftFormValues = {
  authorizationPublicId: string;
  description: string;
  level: string;
  organizationPublicId: string;
  profession: Profession;
  subject: Subject;
  title: string;
};

type SourceContextFormValues = {
  level: string;
  questionCount: string;
  sourcePublicId: string;
  sourceStatus: string;
  sourceType: "paper";
  subject: Subject;
  title: string;
  totalScore: string;
};

type CopyFormValues = {
  newDraftTitle: string;
  sourceVersionPublicId: string;
};

const defaultDraftFormValues: DraftFormValues = {
  authorizationPublicId: "",
  description: "",
  level: "3",
  organizationPublicId: "",
  profession: "marketing",
  subject: "theory",
  title: "",
};

const defaultSourceContextFormValues: SourceContextFormValues = {
  level: "3",
  questionCount: "1",
  sourcePublicId: "",
  sourceStatus: "published",
  sourceType: "paper",
  subject: "theory",
  title: "",
  totalScore: "1",
};

const defaultCopyFormValues: CopyFormValues = {
  newDraftTitle: "",
  sourceVersionPublicId: "",
};

const sourceChoices = [
  {
    title: "平台试卷快照",
    description: "选择已发布试卷，发布前预览题目、答案和解析。",
  },
  {
    title: "企业 AI 结果",
    description: "把同授权范围内的 AI 出题或组卷结果复制为可编辑草稿。",
  },
  {
    title: "手动题组",
    description: "由企业管理员维护企业私有题组后再发布给当前或下级组织。",
  },
] as const;

type SourceChoiceTitle = (typeof sourceChoices)[number]["title"];

const wizardSteps = ["选择来源", "配置训练", "设置范围", "预览发布"] as const;

function resolveOrganizationTrainingLoadState(authContext: AuthContextDto): {
  capabilitySummary: AdminWorkspaceCapabilitySummary;
  loadState: AdminOrganizationTrainingLoadState;
} {
  const pageAccess = resolveOrganizationWorkspacePageAccess(
    authContext,
    "/organization/organization-training",
  );

  return {
    capabilitySummary: pageAccess.capabilitySummary,
    loadState: pageAccess.loadState,
  };
}

async function mutateAdminOrganizationTrainingApi<TData>(
  path: string,
  sessionToken: string | null,
  body: unknown,
): Promise<ApiResponse<TData | null>> {
  const response = await fetch(path, {
    method: "POST",
    credentials: "same-origin",
    headers: {
      ...createAdminAuthHeaders(sessionToken),
      "content-type": "application/json",
    },
    body: JSON.stringify(body),
  });

  return (await response.json()) as ApiResponse<TData | null>;
}

function createManualDraftInput(
  values: DraftFormValues,
  capabilitySummary: AdminWorkspaceCapabilitySummary,
) {
  return {
    organizationPublicId: values.organizationPublicId,
    authorizationPublicId: values.authorizationPublicId,
    profession: values.profession,
    level: Number(values.level),
    subject: values.subject,
    title: values.title,
    description:
      values.description.trim().length === 0 ? null : values.description,
    capabilityContext:
      createOrganizationTrainingCapabilityContext(capabilitySummary),
  };
}

function createSourceContextInput({
  capabilitySummary,
  draft,
  draftValues,
  sourceValues,
}: {
  draft: OrganizationTrainingDraftDto;
  draftValues: DraftFormValues;
  capabilitySummary: AdminWorkspaceCapabilitySummary;
  sourceValues: SourceContextFormValues;
}) {
  return {
    draftPublicId: draft.publicId,
    organizationPublicId: draft.organizationPublicId,
    authorizationPublicId: draft.authorizationPublicId,
    profession: draft.profession,
    level: draft.level,
    capabilityContext:
      createOrganizationTrainingCapabilityContext(capabilitySummary),
    sourceContexts: [
      {
        sourceType: sourceValues.sourceType,
        sourcePublicId: sourceValues.sourcePublicId,
        title: sourceValues.title,
        profession: draftValues.profession,
        level: Number(sourceValues.level),
        subject: sourceValues.subject,
        questionCount: Number(sourceValues.questionCount),
        totalScore: Number(sourceValues.totalScore),
        sourceStatus: sourceValues.sourceStatus,
      },
    ],
  };
}

function createCopyToDraftInput(
  values: CopyFormValues,
  authorizationPublicId: string,
) {
  return {
    sourceVersionPublicId: values.sourceVersionPublicId,
    authorizationPublicId,
    newDraftTitle: values.newDraftTitle,
  };
}

export function AdminOrganizationTrainingPage() {
  const [loadState, setLoadState] =
    useState<AdminOrganizationTrainingLoadState>("loading");
  const [draftFormValues, setDraftFormValues] = useState(
    defaultDraftFormValues,
  );
  const [sourceContextFormValues, setSourceContextFormValues] = useState(
    defaultSourceContextFormValues,
  );
  const [copyFormValues, setCopyFormValues] = useState(defaultCopyFormValues);
  const [selectedSourceChoice, setSelectedSourceChoice] =
    useState<SourceChoiceTitle>("平台试卷快照");
  const [capabilitySummary, setCapabilitySummary] =
    useState<AdminWorkspaceCapabilitySummary | null>(null);
  const [lastDraft, setLastDraft] =
    useState<OrganizationTrainingDraftDto | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let isActive = true;

    async function loadAdminSession() {
      const sessionToken = getStoredSessionToken();

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

        const accessState = resolveOrganizationTrainingLoadState(
          sessionResponse.data,
        );

        setCapabilitySummary(accessState.capabilitySummary);
        setLoadState(accessState.loadState);
      } catch {
        if (isActive) {
          setLoadState("error");
        }
      }
    }

    void loadAdminSession();

    return () => {
      isActive = false;
    };
  }, []);

  if (loadState === "loading") {
    return <AdminLoadingState label="正在加载企业训练" />;
  }

  if (loadState === "unauthorized") {
    return <AdminUnauthorizedState />;
  }

  if (loadState === "standard-unavailable") {
    return (
      <AdminUpgradeRequiredState
        description="标准版组织后台暂不开放企业训练，请在组织概览查看员工管理和授权状态。升级需由运营管理员维护高级版企业授权。"
        returnHref="/organization/portal"
        returnLabel="返回组织概览"
        title="标准版暂不可用"
      />
    );
  }

  if (loadState === "error") {
    return (
      <AdminErrorState
        title="企业训练加载失败"
        description="请刷新页面，或重新登录后再进入企业训练。"
      />
    );
  }

  async function handleCreateDraft(values: DraftFormValues) {
    const sessionToken = getStoredSessionToken();

    setIsSubmitting(true);
    setErrorMessage(null);
    setMessage(null);

    try {
      if (capabilitySummary === null) {
        setErrorMessage("企业训练权限上下文缺失");
        return;
      }

      const response = await mutateAdminOrganizationTrainingApi<{
        draft: OrganizationTrainingDraftDto;
      }>(
        "/api/v1/organization-trainings",
        sessionToken,
        createManualDraftInput(values, capabilitySummary),
      );

      if (response.code !== 0 || response.data === null) {
        setErrorMessage("企业训练草稿创建失败");
        return;
      }

      setLastDraft(response.data.draft);
      setMessage("企业训练草稿已创建");
    } catch {
      setErrorMessage("企业训练草稿创建失败");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleAttachSourceContext(values: SourceContextFormValues) {
    const sessionToken = getStoredSessionToken();

    if (lastDraft === null) {
      setErrorMessage("请先创建企业训练草稿");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);
    setMessage(null);

    try {
      if (capabilitySummary === null) {
        setErrorMessage("企业训练权限上下文缺失");
        return;
      }

      const response = await mutateAdminOrganizationTrainingApi<{
        context: OrganizationTrainingSourceContextAttachmentDto;
      }>(
        `/api/v1/organization-trainings/${lastDraft.publicId}/source-contexts`,
        sessionToken,
        createSourceContextInput({
          draft: lastDraft,
          draftValues: draftFormValues,
          capabilitySummary,
          sourceValues: values,
        }),
      );

      if (response.code !== 0 || response.data === null) {
        setErrorMessage("企业训练来源绑定失败");
        return;
      }

      setMessage("来源已绑定到企业训练草稿");
    } catch {
      setErrorMessage("企业训练来源绑定失败");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleCopyToNewDraft(values: CopyFormValues) {
    const sessionToken = getStoredSessionToken();
    const authorizationPublicId =
      lastDraft?.authorizationPublicId ?? draftFormValues.authorizationPublicId;

    setIsSubmitting(true);
    setErrorMessage(null);
    setMessage(null);

    try {
      const response = await mutateAdminOrganizationTrainingApi<{
        draft: OrganizationTrainingDraftDto;
      }>(
        `/api/v1/organization-trainings/${values.sourceVersionPublicId}/copy-to-new-draft`,
        sessionToken,
        createCopyToDraftInput(values, authorizationPublicId),
      );

      if (response.code !== 0 || response.data === null) {
        setErrorMessage("企业训练复制失败");
        return;
      }

      setLastDraft(response.data.draft);
      setMessage("已复制为新的企业训练草稿");
    } catch {
      setErrorMessage("企业训练复制失败");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="space-y-6">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-2">
          <p className="text-brand-primary text-sm font-medium">企业后台</p>
          <h1 className="font-heading text-text-primary text-2xl font-semibold">
            企业训练
          </h1>
          <p className="text-text-secondary max-w-2xl text-sm leading-6">
            从试卷快照、企业 AI
            结果或手动题组创建训练，发布给当前组织或下级组织。
          </p>
        </div>
        <div className="bg-secondary text-secondary-foreground flex size-11 items-center justify-center rounded-md">
          <ShieldCheck aria-hidden="true" className="size-5" />
        </div>
      </header>

      {message === null ? null : (
        <div
          className="bg-success/10 text-success rounded-md px-4 py-3 text-sm"
          role="status"
        >
          {message}
        </div>
      )}
      {errorMessage === null ? null : (
        <div
          className="bg-destructive/10 text-destructive rounded-md px-4 py-3 text-sm"
          role="alert"
        >
          {errorMessage}
        </div>
      )}

      <TrainingListPanel lastDraft={lastDraft} />

      <section
        aria-label="新建企业训练四步向导"
        className="space-y-4"
        id="organization-training-create"
      >
        <WizardHeader />
        <div className="grid gap-4 xl:grid-cols-4">
          <WizardStepCard step={1} title="选择来源">
            <SourceChoiceList
              selectedSourceChoice={selectedSourceChoice}
              onSelect={setSelectedSourceChoice}
            />
          </WizardStepCard>
          <WizardStepCard step={2} title="配置训练">
            <DraftForm
              isSubmitting={isSubmitting}
              values={draftFormValues}
              onChange={setDraftFormValues}
              onSubmit={handleCreateDraft}
            />
          </WizardStepCard>
          <WizardStepCard step={3} title="设置范围">
            <PublishScopePreview />
            {selectedSourceChoice === "平台试卷快照" ? (
              <SourceContextForm
                disabled={lastDraft === null}
                isSubmitting={isSubmitting}
                values={sourceContextFormValues}
                onChange={setSourceContextFormValues}
                onSubmit={handleAttachSourceContext}
              />
            ) : (
              <DeferredSourceNotice sourceChoice={selectedSourceChoice} />
            )}
          </WizardStepCard>
          <WizardStepCard step={4} title="预览发布">
            <PublishReadinessPanel hasDraft={lastDraft !== null} />
            <CopyToDraftForm
              isSubmitting={isSubmitting}
              values={copyFormValues}
              onChange={setCopyFormValues}
              onSubmit={handleCopyToNewDraft}
            />
          </WizardStepCard>
        </div>
      </section>
    </section>
  );
}

function TrainingListPanel({
  lastDraft,
}: {
  lastDraft: OrganizationTrainingDraftDto | null;
}) {
  return (
    <section
      aria-label="企业训练列表"
      className="bg-surface border-border rounded-md border p-4 shadow-sm"
    >
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div className="space-y-1">
          <h2 className="text-text-primary text-base font-semibold">
            企业训练列表
          </h2>
          <p className="text-text-secondary text-sm">
            草稿、已发布、已下架和已作废训练在这里统一管理。
          </p>
        </div>
        <a
          className="bg-primary text-primary-foreground inline-flex h-9 items-center justify-center rounded-md px-3 text-sm font-medium"
          href="#organization-training-create"
        >
          新建企业训练
        </a>
      </div>
      <div className="border-border mt-4 rounded-md border">
        {lastDraft === null ? (
          <div className="grid min-h-28 place-items-center px-4 py-6 text-center">
            <p className="text-text-secondary text-sm">暂无可展示的企业训练</p>
          </div>
        ) : (
          <article
            className="grid gap-3 p-4 md:grid-cols-[1fr_auto]"
            data-public-id={lastDraft.publicId}
            data-testid={`organization-training-draft-${lastDraft.publicId}`}
          >
            <div className="space-y-1">
              <h3 className="text-text-primary text-sm font-semibold">
                {lastDraft.title}
              </h3>
              <p className="text-text-secondary text-sm">
                {professionLabels[lastDraft.profession]} / {lastDraft.level} 级
                / {subjectLabels[lastDraft.subject]}
              </p>
            </div>
            <span className="bg-warning/10 text-warning inline-flex h-7 items-center rounded-md px-2 text-xs font-medium">
              草稿
            </span>
          </article>
        )}
      </div>
    </section>
  );
}

function WizardHeader() {
  return (
    <div className="space-y-3">
      <h2 className="text-text-primary text-lg font-semibold">新建企业训练</h2>
      <ol className="grid gap-2 md:grid-cols-4">
        {wizardSteps.map((step, index) => (
          <li
            className="bg-muted text-text-secondary flex h-9 items-center gap-2 rounded-md px-3 text-sm"
            key={step}
          >
            <span className="bg-surface text-text-primary flex size-5 items-center justify-center rounded-full text-xs font-semibold">
              {index + 1}
            </span>
            {step}
          </li>
        ))}
      </ol>
    </div>
  );
}

function WizardStepCard({
  children,
  step,
  title,
}: {
  children: React.ReactNode;
  step: number;
  title: string;
}) {
  return (
    <section className="space-y-3">
      <div className="text-text-primary flex items-center gap-2 text-sm font-semibold">
        <span className="bg-secondary text-secondary-foreground flex size-6 items-center justify-center rounded-full text-xs">
          {step}
        </span>
        {title}
      </div>
      {children}
    </section>
  );
}

function SourceChoiceList({
  selectedSourceChoice,
  onSelect,
}: {
  selectedSourceChoice: SourceChoiceTitle;
  onSelect: (value: SourceChoiceTitle) => void;
}) {
  return (
    <div className="space-y-2" role="radiogroup" aria-label="企业训练来源">
      {sourceChoices.map((choice) => {
        const isSelected = choice.title === selectedSourceChoice;

        return (
          <button
            aria-checked={isSelected}
            className="border-border bg-surface hover:bg-muted grid w-full gap-1 rounded-md border p-3 text-left text-sm"
            key={choice.title}
            role="radio"
            type="button"
            onClick={() => onSelect(choice.title)}
          >
            <span className="text-text-primary flex items-center gap-2 font-medium">
              {isSelected ? (
                <CheckCircle2 aria-hidden="true" className="size-4" />
              ) : (
                <FileText aria-hidden="true" className="size-4" />
              )}
              {choice.title}
            </span>
            <span className="text-text-secondary leading-5">
              {choice.description}
            </span>
          </button>
        );
      })}
      <p className="text-text-secondary text-xs leading-5">
        模拟考试不作为企业训练来源入口。
      </p>
    </div>
  );
}

function PublishScopePreview() {
  return (
    <div className="bg-muted text-text-secondary space-y-2 rounded-md p-3 text-sm">
      <div className="text-text-primary flex items-center gap-2 font-medium">
        <ClipboardList aria-hidden="true" className="size-4" />
        发布范围
      </div>
      <p>默认发布给当前组织，可选择当前组织和下级组织。</p>
      <p>作答截止时间可留空；下架后保留员工已提交摘要。</p>
    </div>
  );
}

function PublishReadinessPanel({ hasDraft }: { hasDraft: boolean }) {
  return (
    <div className="bg-muted text-text-secondary space-y-2 rounded-md p-3 text-sm">
      <div className="text-text-primary flex items-center gap-2 font-medium">
        <ShieldCheck aria-hidden="true" className="size-4" />
        发布检查
      </div>
      <p>
        {hasDraft
          ? "草稿已创建，发布前需完成题目快照、答案解析和佐证状态检查。"
          : "创建草稿后再预览题目、答案解析、范围和佐证状态。"}
      </p>
    </div>
  );
}

function DeferredSourceNotice({
  sourceChoice,
}: {
  sourceChoice: SourceChoiceTitle;
}) {
  const description =
    sourceChoice === "企业 AI 结果"
      ? "企业 AI 结果在 AI 出题或组卷完成后复制到企业训练草稿，不额外消耗 AI 额度。"
      : "手动题组先在草稿中维护企业私有题目，再按四步流程预览发布。";

  return (
    <div className="bg-muted text-text-secondary rounded-md p-3 text-sm leading-6">
      {description}
    </div>
  );
}

function DraftForm({
  isSubmitting,
  values,
  onChange,
  onSubmit,
}: {
  isSubmitting: boolean;
  values: DraftFormValues;
  onChange: (values: DraftFormValues) => void;
  onSubmit: (values: DraftFormValues) => void;
}) {
  return (
    <form
      aria-label="企业训练配置表单"
      className="bg-surface border-border grid gap-4 rounded-md border p-4 shadow-sm"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit(values);
      }}
    >
      <PanelHeader
        icon={<FilePlus2 aria-hidden="true" className="size-4" />}
        title="训练配置"
      />
      <TextField
        label="组织节点"
        value={values.organizationPublicId}
        onChange={(value) =>
          onChange({ ...values, organizationPublicId: value })
        }
      />
      <TextField
        label="企业授权"
        value={values.authorizationPublicId}
        onChange={(value) =>
          onChange({ ...values, authorizationPublicId: value })
        }
      />
      <TextField
        label="训练标题"
        value={values.title}
        onChange={(value) => onChange({ ...values, title: value })}
      />
      <TextField
        label="训练说明"
        value={values.description}
        onChange={(value) => onChange({ ...values, description: value })}
      />
      <ScopeFields values={values} onChange={onChange} />
      <Button disabled={isSubmitting} type="submit">
        {isSubmitting ? "创建中" : "创建企业训练草稿"}
      </Button>
    </form>
  );
}

function SourceContextForm({
  disabled,
  isSubmitting,
  values,
  onChange,
  onSubmit,
}: {
  disabled: boolean;
  isSubmitting: boolean;
  values: SourceContextFormValues;
  onChange: (values: SourceContextFormValues) => void;
  onSubmit: (values: SourceContextFormValues) => void;
}) {
  return (
    <form
      aria-label="企业训练来源表单"
      className="bg-surface border-border grid gap-4 rounded-md border p-4 shadow-sm"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit(values);
      }}
    >
      <PanelHeader
        icon={<Link2 aria-hidden="true" className="size-4" />}
        title="试卷快照"
      />
      {disabled ? (
        <p className="text-text-secondary text-sm leading-6">
          创建草稿后再选择平台试卷快照；发布前需要预览题目、答案和解析。
        </p>
      ) : null}
      <TextField
        label="试卷快照"
        value={values.sourcePublicId}
        onChange={(value) => onChange({ ...values, sourcePublicId: value })}
      />
      <TextField
        label="来源标题"
        value={values.title}
        onChange={(value) => onChange({ ...values, title: value })}
      />
      <NumberField
        label="来源题数"
        value={values.questionCount}
        onChange={(value) => onChange({ ...values, questionCount: value })}
      />
      <NumberField
        label="来源总分"
        value={values.totalScore}
        onChange={(value) => onChange({ ...values, totalScore: value })}
      />
      <Button disabled={disabled || isSubmitting} type="submit">
        {isSubmitting ? "绑定中" : "绑定试卷快照"}
      </Button>
    </form>
  );
}

function CopyToDraftForm({
  isSubmitting,
  values,
  onChange,
  onSubmit,
}: {
  isSubmitting: boolean;
  values: CopyFormValues;
  onChange: (values: CopyFormValues) => void;
  onSubmit: (values: CopyFormValues) => void;
}) {
  return (
    <form
      aria-label="企业训练复制表单"
      className="bg-surface border-border grid gap-4 rounded-md border p-4 shadow-sm"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit(values);
      }}
    >
      <PanelHeader
        icon={<Copy aria-hidden="true" className="size-4" />}
        title="复制为草稿"
      />
      <TextField
        label="已发布版本"
        value={values.sourceVersionPublicId}
        onChange={(value) =>
          onChange({ ...values, sourceVersionPublicId: value })
        }
      />
      <TextField
        label="新草稿名称"
        value={values.newDraftTitle}
        onChange={(value) => onChange({ ...values, newDraftTitle: value })}
      />
      <Button disabled={isSubmitting} type="submit">
        {isSubmitting ? "复制中" : "复制为草稿"}
      </Button>
    </form>
  );
}

function ScopeFields({
  values,
  onChange,
}: {
  values: DraftFormValues;
  onChange: (values: DraftFormValues) => void;
}) {
  return (
    <div className="grid gap-3 md:grid-cols-3 xl:grid-cols-1">
      <label className="grid gap-2 text-sm font-medium">
        <span className="text-text-secondary">专业</span>
        <select
          aria-label="专业"
          className="border-input focus-visible:border-ring focus-visible:ring-ring/50 bg-surface h-9 rounded-lg border px-2.5 text-sm outline-none focus-visible:ring-3"
          value={values.profession}
          onChange={(event) =>
            onChange({
              ...values,
              profession: event.target.value as Profession,
            })
          }
        >
          {Object.entries(professionLabels).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </label>
      <NumberField
        label="等级"
        value={values.level}
        onChange={(value) => onChange({ ...values, level: value })}
      />
      <label className="grid gap-2 text-sm font-medium">
        <span className="text-text-secondary">科目</span>
        <select
          aria-label="科目"
          className="border-input focus-visible:border-ring focus-visible:ring-ring/50 bg-surface h-9 rounded-lg border px-2.5 text-sm outline-none focus-visible:ring-3"
          value={values.subject}
          onChange={(event) =>
            onChange({
              ...values,
              subject: event.target.value as Subject,
            })
          }
        >
          {Object.entries(subjectLabels).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}

function PanelHeader({
  icon,
  title,
}: {
  icon: React.ReactNode;
  title: string;
}) {
  return (
    <div className="text-text-primary flex items-center gap-2 text-base font-semibold">
      {icon}
      <h2>{title}</h2>
    </div>
  );
}

function TextField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="grid gap-2 text-sm font-medium">
      <span className="text-text-secondary">{label}</span>
      <Input
        aria-label={label}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}

function NumberField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="grid gap-2 text-sm font-medium">
      <span className="text-text-secondary">{label}</span>
      <Input
        aria-label={label}
        min={0}
        type="number"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}
