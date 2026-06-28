"use client";

import { useEffect, useState } from "react";
import { AlertCircle, Copy, FilePlus2, Link2, ShieldCheck } from "lucide-react";

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
  AdminSurfaceStatus,
  AdminUnauthorizedState,
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
    return <AdminLoadingState label="正在加载组织培训" />;
  }

  if (loadState === "unauthorized") {
    return <AdminUnauthorizedState />;
  }

  if (loadState === "standard-unavailable") {
    return (
      <AdminSurfaceStatus
        description="标准版组织后台暂不开放企业训练，请在组织概览查看员工管理和授权状态。升级需由运营管理员维护高级版 org_auth。"
        icon={<AlertCircle aria-hidden="true" className="size-5" />}
        state="permission-denied"
        title="标准版暂不可用"
      />
    );
  }

  if (loadState === "error") {
    return (
      <AdminErrorState
        title="组织培训加载失败"
        description="请刷新页面，或重新登录后再进入组织培训。"
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
        setErrorMessage("组织培训权限上下文缺失");
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
        setErrorMessage("组织培训草稿创建失败");
        return;
      }

      setLastDraft(response.data.draft);
      setMessage(`草稿 ${response.data.draft.publicId} 已创建`);
    } catch {
      setErrorMessage("组织培训草稿创建失败");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleAttachSourceContext(values: SourceContextFormValues) {
    const sessionToken = getStoredSessionToken();

    if (lastDraft === null) {
      setErrorMessage("请先创建组织培训草稿");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);
    setMessage(null);

    try {
      if (capabilitySummary === null) {
        setErrorMessage("组织培训权限上下文缺失");
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
        setErrorMessage("组织培训来源绑定失败");
        return;
      }

      const sourcePublicId =
        response.data.context.sourceContexts[0]?.sourcePublicId ??
        values.sourcePublicId;
      setMessage(`来源 ${sourcePublicId} 已绑定`);
    } catch {
      setErrorMessage("组织培训来源绑定失败");
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
        setErrorMessage("组织培训复制失败");
        return;
      }

      setLastDraft(response.data.draft);
      setMessage(`草稿 ${response.data.draft.publicId} 已创建`);
    } catch {
      setErrorMessage("组织培训复制失败");
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
            组织培训
          </h1>
          <p className="text-text-secondary max-w-2xl text-sm leading-6">
            创建组织培训草稿，绑定来源元数据，并从已发布版本复制为新草稿。
          </p>
          <p className="text-text-secondary text-sm">
            本页仅创建和复制训练草稿
          </p>
        </div>
        <div className="bg-secondary text-secondary-foreground flex size-11 items-center justify-center rounded-md">
          <ShieldCheck aria-hidden="true" className="size-5" />
        </div>
      </header>

      {message === null ? null : (
        <div className="bg-success/10 text-success rounded-md px-4 py-3 text-sm">
          {message}
        </div>
      )}
      {errorMessage === null ? null : (
        <div className="bg-destructive/10 text-destructive rounded-md px-4 py-3 text-sm">
          {errorMessage}
        </div>
      )}

      <div className="grid gap-4 xl:grid-cols-3">
        <DraftForm
          isSubmitting={isSubmitting}
          values={draftFormValues}
          onChange={setDraftFormValues}
          onSubmit={handleCreateDraft}
        />
        <SourceContextForm
          disabled={lastDraft === null}
          isSubmitting={isSubmitting}
          values={sourceContextFormValues}
          onChange={setSourceContextFormValues}
          onSubmit={handleAttachSourceContext}
        />
        <CopyToDraftForm
          isSubmitting={isSubmitting}
          values={copyFormValues}
          onChange={setCopyFormValues}
          onSubmit={handleCopyToNewDraft}
        />
      </div>

      {lastDraft === null ? null : (
        <article
          className="bg-surface border-border rounded-md border p-4 shadow-sm"
          data-public-id={lastDraft.publicId}
          data-testid={`organization-training-draft-${lastDraft.publicId}`}
        >
          <h2 className="text-text-primary text-base font-semibold">
            {lastDraft.title}
          </h2>
          <p className="text-text-secondary mt-2 text-sm">
            {lastDraft.publicId}
          </p>
        </article>
      )}
    </section>
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
      aria-label="组织培训草稿表单"
      className="bg-surface border-border grid gap-4 rounded-md border p-4 shadow-sm"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit(values);
      }}
    >
      <PanelHeader
        icon={<FilePlus2 aria-hidden="true" className="size-4" />}
        title="创建草稿"
      />
      <TextField
        label="组织业务标识"
        value={values.organizationPublicId}
        onChange={(value) =>
          onChange({ ...values, organizationPublicId: value })
        }
      />
      <TextField
        label="企业授权业务标识"
        value={values.authorizationPublicId}
        onChange={(value) =>
          onChange({ ...values, authorizationPublicId: value })
        }
      />
      <TextField
        label="培训标题"
        value={values.title}
        onChange={(value) => onChange({ ...values, title: value })}
      />
      <TextField
        label="培训说明"
        value={values.description}
        onChange={(value) => onChange({ ...values, description: value })}
      />
      <ScopeFields values={values} onChange={onChange} />
      <Button disabled={isSubmitting} type="submit">
        创建草稿
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
      aria-label="组织培训来源表单"
      className="bg-surface border-border grid gap-4 rounded-md border p-4 shadow-sm"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit(values);
      }}
    >
      <PanelHeader
        icon={<Link2 aria-hidden="true" className="size-4" />}
        title="绑定来源"
      />
      {disabled ? (
        <p className="text-text-secondary text-sm">绑定来源需先创建草稿</p>
      ) : null}
      <TextField
        label="来源业务标识"
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
        绑定来源
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
      aria-label="组织培训复制表单"
      className="bg-surface border-border grid gap-4 rounded-md border p-4 shadow-sm"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit(values);
      }}
    >
      <PanelHeader
        icon={<Copy aria-hidden="true" className="size-4" />}
        title="复制版本"
      />
      <TextField
        label="版本业务标识"
        value={values.sourceVersionPublicId}
        onChange={(value) =>
          onChange({ ...values, sourceVersionPublicId: value })
        }
      />
      <TextField
        label="新草稿标题"
        value={values.newDraftTitle}
        onChange={(value) => onChange({ ...values, newDraftTitle: value })}
      />
      <Button disabled={isSubmitting} type="submit">
        复制为草稿
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
