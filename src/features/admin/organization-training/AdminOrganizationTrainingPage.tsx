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
  OrganizationTrainingAdminLifecycleItemDto,
  OrganizationTrainingDraftDto,
  OrganizationTrainingPublishedVersionDto,
  OrganizationTrainingSourceContextAttachmentDto,
} from "@/server/contracts/organization-training-contract";
import type { OrganizationTrainingPublishInput } from "@/server/models/organization-training";
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

type OrganizationTrainingListState = "loading" | "ready" | "error";

type OrganizationTrainingLifecycleStatusFilter =
  | "all"
  | "draft"
  | "published"
  | "taken_down";

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

type PublishFormValues = {
  publishScopeOrganizationPublicIds: string;
  questionSnapshotJson: string;
  weakEvidenceConfirmed: boolean;
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

const defaultPublishFormValues: PublishFormValues = {
  publishScopeOrganizationPublicIds: "",
  questionSnapshotJson: "[]",
  weakEvidenceConfirmed: false,
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

const lifecycleStatusFilters: {
  label: string;
  value: OrganizationTrainingLifecycleStatusFilter;
}[] = [
  { label: "全部", value: "all" },
  { label: "草稿", value: "draft" },
  { label: "已发布", value: "published" },
  { label: "已下架", value: "taken_down" },
];

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

async function fetchAdminOrganizationTrainingApi<TData>(
  path: string,
  sessionToken: string | null,
): Promise<ApiResponse<TData | null>> {
  const response = await fetch(path, {
    method: "GET",
    credentials: "same-origin",
    headers: createAdminAuthHeaders(sessionToken),
  });

  return (await response.json()) as ApiResponse<TData | null>;
}

function createApiErrorMessage(
  fallbackMessage: string,
  response: ApiResponse<unknown> | null,
) {
  return response === null
    ? fallbackMessage
    : `${fallbackMessage}（code: ${response.code}）`;
}

function createLifecycleItemFromDraft(
  draft: OrganizationTrainingDraftDto,
): OrganizationTrainingAdminLifecycleItemDto {
  return {
    publicId: draft.publicId,
    resourceType: "organization_training_draft",
    organizationPublicId: draft.organizationPublicId,
    authorizationPublicId: draft.authorizationPublicId,
    profession: draft.profession,
    level: draft.level,
    subject: draft.subject,
    title: draft.title,
    description: draft.description,
    questionCount: draft.questionCount,
    totalScore: draft.totalScore,
    questionTypeSummary: draft.questionTypeSummary,
    status: "draft",
    availableActions: ["publish"],
  };
}

function createLifecycleItemFromVersion(
  version: OrganizationTrainingPublishedVersionDto,
): OrganizationTrainingAdminLifecycleItemDto {
  return {
    publicId: version.publicId,
    resourceType: "organization_training_version",
    organizationPublicId: version.organizationPublicId,
    profession: version.profession,
    level: version.level,
    subject: version.subject,
    title: version.title,
    description: version.description,
    questionCount: version.questionCount,
    totalScore: version.totalScore,
    status: version.status,
    availableActions:
      version.status === "published"
        ? ["take_down", "copy_to_new_draft"]
        : ["copy_to_new_draft"],
  };
}

function resolveLifecycleStatusLabel(
  item: OrganizationTrainingAdminLifecycleItemDto,
) {
  if (item.resourceType === "organization_training_draft") {
    return "草稿";
  }

  return item.status === "published" ? "已发布" : "已下架";
}

function matchesLifecycleStatusFilter(
  item: OrganizationTrainingAdminLifecycleItemDto,
  filter: OrganizationTrainingLifecycleStatusFilter,
) {
  if (filter === "all") {
    return true;
  }

  if (filter === "draft") {
    return item.resourceType === "organization_training_draft";
  }

  return item.resourceType === "organization_training_version"
    ? item.status === filter
    : false;
}

function createDefaultCopyDraftTitle(title: string) {
  const normalizedTitle = title.trim();

  return normalizedTitle.length === 0
    ? "复训草稿"
    : `${normalizedTitle} 复训草稿`;
}

function upsertLifecycleItem(
  items: OrganizationTrainingAdminLifecycleItemDto[],
  item: OrganizationTrainingAdminLifecycleItemDto,
) {
  const itemExists = items.some(
    (currentItem) => currentItem.publicId === item.publicId,
  );

  return itemExists
    ? items.map((currentItem) =>
        currentItem.publicId === item.publicId ? item : currentItem,
      )
    : [item, ...items];
}

function replaceLifecycleItem(
  items: OrganizationTrainingAdminLifecycleItemDto[],
  sourcePublicId: string,
  item: OrganizationTrainingAdminLifecycleItemDto,
) {
  return items.map((currentItem) =>
    currentItem.publicId === sourcePublicId ? item : currentItem,
  );
}

function parseQuestionSnapshotJson(
  value: string,
): OrganizationTrainingPublishInput["questions"] | null {
  try {
    const parsedValue = JSON.parse(value) as unknown;

    return Array.isArray(parsedValue)
      ? (parsedValue as OrganizationTrainingPublishInput["questions"])
      : null;
  } catch {
    return null;
  }
}

function normalizePublishScope(rawValue: string, organizationPublicId: string) {
  const normalizedValues = rawValue
    .split(",")
    .map((value) => value.trim())
    .filter((value) => value.length > 0);

  return normalizedValues.length === 0
    ? [organizationPublicId]
    : [...new Set(normalizedValues)];
}

function createManualDraftInput(
  values: DraftFormValues,
  capabilitySummary: AdminWorkspaceCapabilitySummary,
) {
  const organizationPublicId =
    capabilitySummary.organizationPublicId ?? values.organizationPublicId;
  const authorizationPublicId =
    capabilitySummary.organizationAuthorizationPublicId ??
    values.authorizationPublicId;

  return {
    organizationPublicId,
    authorizationPublicId,
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

function createPublishTrainingInput({
  capabilitySummary,
  draft,
  values,
}: {
  capabilitySummary: AdminWorkspaceCapabilitySummary;
  draft: OrganizationTrainingAdminLifecycleItemDto;
  values: PublishFormValues;
}): OrganizationTrainingPublishInput | null {
  const questions = parseQuestionSnapshotJson(values.questionSnapshotJson);

  if (
    draft.authorizationPublicId === undefined ||
    draft.profession === undefined ||
    draft.level === undefined ||
    draft.subject === undefined ||
    draft.questionCount === undefined ||
    draft.totalScore === undefined ||
    draft.questionTypeSummary === undefined ||
    questions === null ||
    questions.length === 0
  ) {
    return null;
  }

  return {
    draftPublicId: draft.publicId,
    organizationPublicId: draft.organizationPublicId,
    authorizationPublicId: draft.authorizationPublicId,
    profession: draft.profession,
    level: draft.level,
    subject: draft.subject,
    title: draft.title,
    description: draft.description ?? null,
    questions,
    publishScopeOrganizationPublicIds: normalizePublishScope(
      values.publishScopeOrganizationPublicIds,
      draft.organizationPublicId,
    ),
    capabilityContext:
      createOrganizationTrainingCapabilityContext(capabilitySummary),
    questionCount: draft.questionCount,
    totalScore: draft.totalScore,
    questionTypeSummary: draft.questionTypeSummary,
    weakEvidenceConfirmed: values.weakEvidenceConfirmed,
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
  const [publishFormValues, setPublishFormValues] = useState(
    defaultPublishFormValues,
  );
  const [selectedSourceChoice, setSelectedSourceChoice] =
    useState<SourceChoiceTitle>("平台试卷快照");
  const [capabilitySummary, setCapabilitySummary] =
    useState<AdminWorkspaceCapabilitySummary | null>(null);
  const [lastDraft, setLastDraft] =
    useState<OrganizationTrainingDraftDto | null>(null);
  const [trainingListState, setTrainingListState] =
    useState<OrganizationTrainingListState>("loading");
  const [trainingListMessage, setTrainingListMessage] = useState<string | null>(
    null,
  );
  const [trainingItems, setTrainingItems] = useState<
    OrganizationTrainingAdminLifecycleItemDto[]
  >([]);
  const [selectedPublishDraft, setSelectedPublishDraft] =
    useState<OrganizationTrainingAdminLifecycleItemDto | null>(null);
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
        if (accessState.loadState === "ready") {
          setDraftFormValues((currentValues) => ({
            ...currentValues,
            authorizationPublicId:
              accessState.capabilitySummary.organizationAuthorizationPublicId ??
              currentValues.authorizationPublicId,
            organizationPublicId:
              accessState.capabilitySummary.organizationPublicId ??
              currentValues.organizationPublicId,
          }));
        }
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

  useEffect(() => {
    if (loadState !== "ready") {
      return;
    }

    let isActive = true;

    async function loadTrainingLifecycle() {
      const sessionToken = getStoredSessionToken();

      setTrainingListState("loading");
      setTrainingListMessage(null);

      try {
        const response = await fetchAdminOrganizationTrainingApi<{
          items: OrganizationTrainingAdminLifecycleItemDto[];
          redactionStatus: "metadata_only";
        }>("/api/v1/organization-trainings", sessionToken);

        if (!isActive) {
          return;
        }

        if (response.code !== 0 || response.data === null) {
          setTrainingItems([]);
          setTrainingListMessage(
            createApiErrorMessage("企业训练列表加载失败", response),
          );
          setTrainingListState("error");
          return;
        }

        setTrainingItems(response.data.items);
        setTrainingListState("ready");
      } catch {
        if (isActive) {
          setTrainingItems([]);
          setTrainingListMessage("企业训练列表加载失败");
          setTrainingListState("error");
        }
      }
    }

    void loadTrainingLifecycle();

    return () => {
      isActive = false;
    };
  }, [loadState]);

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
        setErrorMessage(
          createApiErrorMessage("企业训练草稿创建失败", response),
        );
        return;
      }

      const createdDraft = response.data.draft;

      setLastDraft(createdDraft);
      setTrainingItems((currentItems) =>
        upsertLifecycleItem(
          currentItems,
          createLifecycleItemFromDraft(createdDraft),
        ),
      );
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
        setErrorMessage(
          createApiErrorMessage("企业训练来源绑定失败", response),
        );
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
      lastDraft?.authorizationPublicId ??
      capabilitySummary?.organizationAuthorizationPublicId ??
      draftFormValues.authorizationPublicId;

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
        setErrorMessage(createApiErrorMessage("企业训练复制失败", response));
        return;
      }

      const copiedDraft = response.data.draft;

      setLastDraft(copiedDraft);
      setTrainingItems((currentItems) =>
        upsertLifecycleItem(
          currentItems,
          createLifecycleItemFromDraft(copiedDraft),
        ),
      );
      setMessage("已复制为新的企业训练草稿");
    } catch {
      setErrorMessage("企业训练复制失败");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleCopyVersionToNewDraft(
    item: OrganizationTrainingAdminLifecycleItemDto,
  ) {
    await handleCopyToNewDraft({
      sourceVersionPublicId: item.publicId,
      newDraftTitle: createDefaultCopyDraftTitle(item.title),
    });
  }

  async function handleTakeDownVersion(
    item: OrganizationTrainingAdminLifecycleItemDto,
  ) {
    setErrorMessage(null);
    setMessage(null);

    const isConfirmed = window.confirm(
      "确认下架该企业训练？下架后员工端不再展示该训练。",
    );

    if (!isConfirmed) {
      return;
    }

    const rawReason = window.prompt("请输入下架原因", "内容已过期");
    const takedownReason = rawReason?.trim() ?? "";

    if (takedownReason.length === 0) {
      setErrorMessage("请输入下架原因");
      return;
    }

    const sessionToken = getStoredSessionToken();

    setIsSubmitting(true);

    try {
      const response = await mutateAdminOrganizationTrainingApi<{
        version: OrganizationTrainingPublishedVersionDto;
      }>(
        `/api/v1/organization-trainings/${item.publicId}/take-down`,
        sessionToken,
        {
          versionPublicId: item.publicId,
          takedownReason,
        },
      );

      if (response.code !== 0 || response.data === null) {
        setErrorMessage(createApiErrorMessage("企业训练下架失败", response));
        return;
      }

      const takenDownVersion = response.data.version;

      setTrainingItems((currentItems) =>
        replaceLifecycleItem(
          currentItems,
          item.publicId,
          createLifecycleItemFromVersion(takenDownVersion),
        ),
      );
      setMessage("企业训练已下架");
    } catch {
      setErrorMessage("企业训练下架失败");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handlePublishTraining(values: PublishFormValues) {
    const sessionToken = getStoredSessionToken();

    setIsSubmitting(true);
    setErrorMessage(null);
    setMessage(null);

    try {
      if (capabilitySummary === null || selectedPublishDraft === null) {
        setErrorMessage("企业训练发布上下文缺失");
        return;
      }

      const publishInput = createPublishTrainingInput({
        capabilitySummary,
        draft: selectedPublishDraft,
        values,
      });

      if (publishInput === null) {
        setErrorMessage("企业训练发布内容不完整");
        return;
      }

      const response = await mutateAdminOrganizationTrainingApi<{
        version: OrganizationTrainingPublishedVersionDto;
      }>(
        `/api/v1/organization-trainings/${selectedPublishDraft.publicId}/publish`,
        sessionToken,
        publishInput,
      );

      if (response.code !== 0 || response.data === null) {
        setErrorMessage(createApiErrorMessage("企业训练发布失败", response));
        return;
      }

      const publishedVersion = response.data.version;

      setTrainingItems((currentItems) =>
        replaceLifecycleItem(
          currentItems,
          selectedPublishDraft.publicId,
          createLifecycleItemFromVersion(publishedVersion),
        ),
      );
      setSelectedPublishDraft(null);
      setMessage("企业训练已发布");
    } catch {
      setErrorMessage("企业训练发布失败");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="space-y-6">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-2">
          <p className="text-brand-primary text-sm font-medium">组织后台</p>
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

      <TrainingListPanel
        items={trainingItems}
        lastDraft={lastDraft}
        listMessage={trainingListMessage}
        listState={trainingListState}
        isSubmitting={isSubmitting}
        onCopyVersionToDraft={handleCopyVersionToNewDraft}
        onPublishDraft={(draft) => {
          setSelectedPublishDraft(draft);
          setPublishFormValues({
            ...defaultPublishFormValues,
            publishScopeOrganizationPublicIds: draft.organizationPublicId,
          });
        }}
        onTakeDownVersion={handleTakeDownVersion}
      />

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
            {selectedPublishDraft === null ? null : (
              <PublishTrainingForm
                draft={selectedPublishDraft}
                isSubmitting={isSubmitting}
                values={publishFormValues}
                onChange={setPublishFormValues}
                onSubmit={handlePublishTraining}
              />
            )}
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
  items,
  isSubmitting,
  lastDraft,
  listMessage,
  listState,
  onCopyVersionToDraft,
  onPublishDraft,
  onTakeDownVersion,
}: {
  items: OrganizationTrainingAdminLifecycleItemDto[];
  isSubmitting: boolean;
  lastDraft: OrganizationTrainingDraftDto | null;
  listMessage: string | null;
  listState: OrganizationTrainingListState;
  onCopyVersionToDraft: (
    item: OrganizationTrainingAdminLifecycleItemDto,
  ) => void;
  onPublishDraft: (draft: OrganizationTrainingAdminLifecycleItemDto) => void;
  onTakeDownVersion: (item: OrganizationTrainingAdminLifecycleItemDto) => void;
}) {
  const [selectedStatusFilter, setSelectedStatusFilter] =
    useState<OrganizationTrainingLifecycleStatusFilter>("all");
  const [selectedDetailPublicId, setSelectedDetailPublicId] = useState<
    string | null
  >(null);
  const visibleItems =
    lastDraft === null
      ? items
      : upsertLifecycleItem(items, createLifecycleItemFromDraft(lastDraft));
  const filteredItems = visibleItems.filter((item) =>
    matchesLifecycleStatusFilter(item, selectedStatusFilter),
  );
  const selectedDetailItem =
    selectedDetailPublicId === null
      ? null
      : (visibleItems.find(
          (item) => item.publicId === selectedDetailPublicId,
        ) ?? null);

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
      {visibleItems.length === 0 ? null : (
        <div
          aria-label="企业训练状态筛选"
          className="mt-4 flex flex-wrap gap-2"
          role="group"
        >
          {lifecycleStatusFilters.map((filter) => (
            <button
              aria-pressed={selectedStatusFilter === filter.value}
              className={`border-border h-8 rounded-md border px-3 text-sm transition-colors ${
                selectedStatusFilter === filter.value
                  ? "bg-primary text-primary-foreground"
                  : "bg-surface text-text-secondary hover:bg-muted hover:text-text-primary"
              }`}
              key={filter.value}
              onClick={() => {
                setSelectedStatusFilter(filter.value);
                setSelectedDetailPublicId(null);
              }}
              type="button"
            >
              {filter.label}
            </button>
          ))}
        </div>
      )}
      <div className="border-border mt-4 rounded-md border">
        {listState === "loading" ? (
          <div className="grid min-h-28 place-items-center px-4 py-6 text-center">
            <p className="text-text-secondary text-sm">正在加载企业训练</p>
          </div>
        ) : listState === "error" ? (
          <div className="grid min-h-28 place-items-center px-4 py-6 text-center">
            <p className="text-destructive text-sm">
              {listMessage ?? "企业训练列表加载失败"}
            </p>
          </div>
        ) : visibleItems.length === 0 ? (
          <div className="grid min-h-28 place-items-center px-4 py-6 text-center">
            <p className="text-text-secondary text-sm">暂无可展示的企业训练</p>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="grid min-h-28 place-items-center px-4 py-6 text-center">
            <p className="text-text-secondary text-sm">
              当前筛选下暂无企业训练
            </p>
          </div>
        ) : (
          <div className="divide-border divide-y">
            {filteredItems.map((item) => (
              <TrainingLifecycleItemCard
                isSubmitting={isSubmitting}
                item={item}
                key={item.publicId}
                onCopyVersionToDraft={onCopyVersionToDraft}
                onPublishDraft={onPublishDraft}
                onTakeDownVersion={onTakeDownVersion}
                onViewItem={setSelectedDetailPublicId}
              />
            ))}
          </div>
        )}
      </div>
      {selectedDetailItem === null ? null : (
        <TrainingLifecycleDetailPanel item={selectedDetailItem} />
      )}
    </section>
  );
}

function TrainingLifecycleItemCard({
  isSubmitting,
  item,
  onCopyVersionToDraft,
  onPublishDraft,
  onTakeDownVersion,
  onViewItem,
}: {
  isSubmitting: boolean;
  item: OrganizationTrainingAdminLifecycleItemDto;
  onCopyVersionToDraft: (
    item: OrganizationTrainingAdminLifecycleItemDto,
  ) => void;
  onPublishDraft: (draft: OrganizationTrainingAdminLifecycleItemDto) => void;
  onTakeDownVersion: (item: OrganizationTrainingAdminLifecycleItemDto) => void;
  onViewItem: (publicId: string) => void;
}) {
  const isDraft = item.resourceType === "organization_training_draft";
  const statusLabel = resolveLifecycleStatusLabel(item);
  const actionLabel = isDraft ? "待发布" : "可复训";
  const canPublish = item.availableActions.includes("publish");
  const canCopyToDraft = item.availableActions.includes("copy_to_new_draft");
  const canTakeDown = item.availableActions.includes("take_down");

  return (
    <article
      className="grid gap-3 p-4 md:grid-cols-[1fr_auto]"
      data-testid={`organization-training-lifecycle-${item.publicId}`}
    >
      <div className="space-y-1">
        <h3 className="text-text-primary text-sm font-semibold">
          {item.title}
        </h3>
        <p className="text-text-secondary text-sm">
          {item.profession === undefined
            ? "企业训练"
            : professionLabels[item.profession]}{" "}
          / {item.level ?? "-"} 级 /{" "}
          {item.subject === undefined ? "科目" : subjectLabels[item.subject]}
        </p>
        <p className="text-text-secondary text-xs">
          {actionLabel} · 题量 {item.questionCount ?? 0} · 总分{" "}
          {item.totalScore ?? 0}
        </p>
      </div>
      <div className="flex items-center gap-2 md:justify-end">
        <span className="bg-warning/10 text-warning inline-flex h-7 items-center rounded-md px-2 text-xs font-medium">
          {statusLabel}
        </span>
        <Button
          disabled={isSubmitting}
          onClick={() => onViewItem(item.publicId)}
          type="button"
          variant="outline"
        >
          查看
        </Button>
        {canPublish ? (
          <Button
            disabled={isSubmitting}
            type="button"
            onClick={() => onPublishDraft(item)}
          >
            发布
          </Button>
        ) : null}
        {canCopyToDraft ? (
          <Button
            disabled={isSubmitting}
            onClick={() => onCopyVersionToDraft(item)}
            type="button"
            variant="secondary"
          >
            复制为新草稿
          </Button>
        ) : null}
        {canTakeDown ? (
          <Button
            disabled={isSubmitting}
            onClick={() => onTakeDownVersion(item)}
            type="button"
            variant="destructive"
          >
            下架
          </Button>
        ) : null}
      </div>
    </article>
  );
}

function TrainingLifecycleDetailPanel({
  item,
}: {
  item: OrganizationTrainingAdminLifecycleItemDto;
}) {
  const isDraft = item.resourceType === "organization_training_draft";
  const canCopyToDraft = item.availableActions.includes("copy_to_new_draft");

  return (
    <aside
      aria-label="训练详情"
      className="border-border bg-muted/30 mt-4 rounded-md border p-4"
    >
      <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
        <div className="space-y-1">
          <h3 className="text-text-primary text-sm font-semibold">训练详情</h3>
          <p className="text-text-secondary text-sm">{item.title}</p>
        </div>
        <span className="bg-surface text-text-secondary border-border inline-flex h-7 items-center rounded-md border px-2 text-xs font-medium">
          {resolveLifecycleStatusLabel(item)}
        </span>
      </div>
      <p className="text-text-secondary mt-3 text-sm">
        {isDraft
          ? "草稿可继续配置，确认题目快照后再发布给员工。"
          : "已发布版本为只读；如需调整内容，请复制为新草稿后再发布。"}
      </p>
      <dl className="mt-3 grid gap-2 text-sm sm:grid-cols-3">
        <div className="bg-surface rounded-md p-3">
          <dt className="text-text-secondary">题量</dt>
          <dd className="text-text-primary font-medium">
            {item.questionCount ?? 0}
          </dd>
        </div>
        <div className="bg-surface rounded-md p-3">
          <dt className="text-text-secondary">总分</dt>
          <dd className="text-text-primary font-medium">
            {item.totalScore ?? 0}
          </dd>
        </div>
        <div className="bg-surface rounded-md p-3">
          <dt className="text-text-secondary">操作建议</dt>
          <dd className="text-text-primary font-medium">
            {canCopyToDraft ? "复制为新草稿" : "继续发布流程"}
          </dd>
        </div>
      </dl>
    </aside>
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
  const hasRequiredAuthorizationContext =
    values.organizationPublicId.trim().length > 0 &&
    values.authorizationPublicId.trim().length > 0;

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
      <div className="bg-muted text-text-secondary grid gap-2 rounded-md p-3 text-sm leading-6">
        <p className="text-text-primary font-medium">会话授权上下文</p>
        <p>组织范围由当前会话授权带入</p>
        <p>企业授权由服务端校验</p>
        {hasRequiredAuthorizationContext ? null : (
          <p className="text-destructive" role="status">
            当前会话缺少组织授权上下文，暂不能创建企业训练草稿。
          </p>
        )}
      </div>
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
      <Button
        disabled={isSubmitting || !hasRequiredAuthorizationContext}
        type="submit"
      >
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

function PublishTrainingForm({
  draft,
  isSubmitting,
  values,
  onChange,
  onSubmit,
}: {
  draft: OrganizationTrainingAdminLifecycleItemDto;
  isSubmitting: boolean;
  values: PublishFormValues;
  onChange: (values: PublishFormValues) => void;
  onSubmit: (values: PublishFormValues) => void;
}) {
  return (
    <form
      aria-label="企业训练发布表单"
      className="bg-surface border-border grid gap-4 rounded-md border p-4 shadow-sm"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit(values);
      }}
    >
      <PanelHeader
        icon={<ShieldCheck aria-hidden="true" className="size-4" />}
        title="发布训练"
      />
      <div className="bg-muted text-text-secondary rounded-md p-3 text-sm leading-6">
        {draft.title}
      </div>
      <TextField
        label="发布组织"
        value={values.publishScopeOrganizationPublicIds}
        onChange={(value) =>
          onChange({ ...values, publishScopeOrganizationPublicIds: value })
        }
      />
      <TextAreaField
        label="题目快照"
        value={values.questionSnapshotJson}
        onChange={(value) =>
          onChange({ ...values, questionSnapshotJson: value })
        }
      />
      <label className="text-text-secondary flex items-center gap-2 text-sm">
        <input
          aria-label="确认弱佐证"
          checked={values.weakEvidenceConfirmed}
          className="border-input size-4 rounded"
          type="checkbox"
          onChange={(event) =>
            onChange({
              ...values,
              weakEvidenceConfirmed: event.target.checked,
            })
          }
        />
        确认弱佐证
      </label>
      <Button disabled={isSubmitting} type="submit">
        {isSubmitting ? "发布中" : "发布训练"}
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

function TextAreaField({
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
      <textarea
        aria-label={label}
        className="border-input focus-visible:border-ring focus-visible:ring-ring/50 bg-surface min-h-32 rounded-lg border px-3 py-2 text-sm outline-none focus-visible:ring-3"
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
