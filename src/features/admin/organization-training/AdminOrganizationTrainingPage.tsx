"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  CheckCircle2,
  ClipboardList,
  Copy,
  FilePlus2,
  FileText,
  ShieldCheck,
} from "lucide-react";

import { AdminDetailDrawer } from "@/components/admin/AdminDetailDrawer";
import { AdminPagination } from "@/components/admin/AdminList";
import {
  AdminToast,
  type AdminFeedback,
} from "@/components/admin/AdminToast/AdminToast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type {
  ApiPagination,
  ApiResponse,
} from "@/server/contracts/api-response";
import type { AuthContextDto } from "@/server/contracts/auth-contract";
import type { AdminWorkspaceCapabilitySummary } from "@/server/contracts/admin-workspace-role-guard-contract";
import type {
  OrganizationTrainingAdminLifecycleContentKind,
  OrganizationTrainingAdminLifecycleFlowDto,
  OrganizationTrainingAdminLifecycleItemDto,
  OrganizationTrainingAdminLifecycleSourceKind,
  OrganizationTrainingAdminDetailDto,
  OrganizationTrainingAdminQuestionDetailDto,
  OrganizationTrainingDraftDto,
  OrganizationTrainingPublishedVersionDto,
} from "@/server/contracts/organization-training-contract";
import type { OrganizationTrainingPublishInput } from "@/server/models/organization-training";
import type { Profession, Subject } from "@/server/models/paper";

import {
  createOrganizationTrainingListSearch,
  parseOrganizationTrainingListSearch,
  type OrganizationTrainingLifecycleContentKindFilter,
  type OrganizationTrainingLifecycleSourceKindFilter,
  type OrganizationTrainingLifecycleStatusFilter,
} from "./organization-training-list-url";

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

type OrganizationTrainingListState = "loading" | "ready" | "partial" | "error";

type OrganizationTrainingDetailState = "idle" | "loading" | "ready" | "error";

type TrainingContentShape = "question_set" | "paper_like";

type DraftFormValues = {
  authorizationPublicId: string;
  description: string;
  level: string;
  organizationPublicId: string;
  profession: Profession;
  subject: Subject;
  title: string;
};

type CopyFormValues = {
  newDraftTitle: string;
  sourceVersionPublicId: string;
};

type PublishQuestionFormValue = {
  sequenceNumber: number;
  questionType: OrganizationTrainingPublishInput["questions"][number]["questionType"];
  paperSectionKey: string | null;
  paperSectionTitle: string | null;
  paperSectionSortOrder: number | null;
  questionSortOrder: number | null;
  materialTitle: string;
  materialContent: string;
  stem: string;
  options: {
    label: string;
    content: string;
  }[];
  score: string;
  standardAnswer: string;
  analysisSummary: string;
  evidenceStatus: OrganizationTrainingPublishInput["questions"][number]["evidenceStatus"];
  citationCount: string;
};

type PublishFormValues = {
  publishScopeOrganizationPublicIds: string;
  answerDeadlineAt: string;
  questions: PublishQuestionFormValue[];
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

const defaultCopyFormValues: CopyFormValues = {
  newDraftTitle: "",
  sourceVersionPublicId: "",
};

const defaultPublishFormValues: PublishFormValues = {
  publishScopeOrganizationPublicIds: "",
  answerDeadlineAt: "",
  questions: [],
  weakEvidenceConfirmed: false,
};

const sourceChoices = [
  {
    title: "AI组卷结果",
    description: "生成企业训练试卷草稿，本地选题后继续预览发布。",
    trainingContentShape: "paper_like",
  },
  {
    title: "平台试卷快照",
    description: "从平台试卷列表选择快照，保留试卷结构进入训练草稿。",
    trainingContentShape: "paper_like",
  },
  {
    title: "AI出题结果",
    description: "生成训练题草稿，审核后进入题目训练草稿。",
    trainingContentShape: "question_set",
  },
  {
    title: "手动题组",
    description: "按题目集合维护企业私有题组后再发布。",
    trainingContentShape: "question_set",
  },
] as const;

type SourceChoiceTitle = (typeof sourceChoices)[number]["title"];

const wizardSteps = ["选择来源", "配置训练", "设置范围", "预览发布"] as const;

const trainingContentShapeOptions: {
  description: string;
  label: string;
  value: TrainingContentShape;
}[] = [
  {
    label: "新建试卷训练",
    value: "paper_like",
    description: "保留试卷结构，适合平台试卷快照或 AI组卷结果。",
  },
  {
    label: "新建题目训练",
    value: "question_set",
    description: "按题目集合发布，适合 AI出题结果或手动题组。",
  },
];

const lifecycleStatusFilters: {
  label: string;
  value: OrganizationTrainingLifecycleStatusFilter;
}[] = [
  { label: "全部", value: "all" },
  { label: "草稿", value: "draft" },
  { label: "已发布", value: "published" },
  { label: "已下架", value: "taken_down" },
];

const lifecycleSourceKindFilters: {
  label: string;
  value: OrganizationTrainingLifecycleSourceKindFilter;
}[] = [
  { label: "全部来源", value: "all" },
  { label: "AI出题", value: "ai_question" },
  { label: "AI组卷", value: "ai_paper" },
  { label: "平台试卷", value: "platform_paper" },
  { label: "手动题组", value: "manual_group" },
  { label: "未知来源", value: "unknown" },
];

const lifecycleContentKindFilters: {
  label: string;
  value: OrganizationTrainingLifecycleContentKindFilter;
}[] = [
  { label: "全部形态", value: "all" },
  { label: "题目训练", value: "question_training" },
  { label: "试卷训练", value: "paper_training" },
  { label: "未知形态", value: "unknown" },
];

const organizationTrainingListPageSize = 10;

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

function createAdminLifecycleListPath({
  contentKind,
  page,
  sourceKind,
  status,
}: {
  contentKind: OrganizationTrainingLifecycleContentKindFilter;
  page: number;
  sourceKind: OrganizationTrainingLifecycleSourceKindFilter;
  status: OrganizationTrainingLifecycleStatusFilter;
}) {
  const searchParams = new URLSearchParams({
    page: String(page),
    pageSize: String(organizationTrainingListPageSize),
    status,
    sourceKind,
    contentKind,
  });

  return `/api/v1/organization-trainings?${searchParams.toString()}`;
}

function createAdminTrainingDetailPath(publicId: string) {
  return `/api/v1/organization-trainings/${encodeURIComponent(publicId)}`;
}

function createLifecycleItemFromDraft(
  draft: OrganizationTrainingDraftDto,
): OrganizationTrainingAdminLifecycleItemDto {
  const isManualDraft = draft.sourceTaskPublicId === null;

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
    sourceKind: isManualDraft ? "manual_group" : "unknown",
    contentKind: isManualDraft ? "question_training" : "unknown",
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
    sourceKind: "unknown",
    contentKind: "unknown",
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

function resolveLifecycleSourceKindLabel(
  sourceKind: OrganizationTrainingAdminLifecycleSourceKind,
) {
  return (
    lifecycleSourceKindFilters.find((filter) => filter.value === sourceKind)
      ?.label ?? "未知来源"
  );
}

function resolveLifecycleContentKindLabel(
  contentKind: OrganizationTrainingAdminLifecycleContentKind,
) {
  return (
    lifecycleContentKindFilters.find((filter) => filter.value === contentKind)
      ?.label ?? "未知形态"
  );
}

function matchesLifecycleSourceKindFilter(
  item: OrganizationTrainingAdminLifecycleItemDto,
  filter: OrganizationTrainingLifecycleSourceKindFilter,
) {
  return filter === "all" || item.sourceKind === filter;
}

function matchesLifecycleContentKindFilter(
  item: OrganizationTrainingAdminLifecycleItemDto,
  filter: OrganizationTrainingLifecycleContentKindFilter,
) {
  return filter === "all" || item.contentKind === filter;
}

function createDefaultCopyDraftTitle(title: string) {
  const normalizedTitle = title.trim();

  return normalizedTitle.length === 0
    ? "复训草稿"
    : `${normalizedTitle} 复训草稿`;
}

function resolveTrainingContentShapeLabel(shape: TrainingContentShape) {
  return shape === "paper_like" ? "试卷训练" : "题目训练";
}

function resolvePublishQuestionTypeLabel(
  questionType:
    | PublishQuestionFormValue["questionType"]
    | OrganizationTrainingAdminQuestionDetailDto["questionType"],
) {
  if (questionType === "single_choice") {
    return "单选题";
  }

  if (questionType === "multi_choice") {
    return "多选题";
  }

  if (questionType === "true_false") {
    return "判断题";
  }

  return "简答题";
}

function resolveEvidenceStatusLabel(
  evidenceStatus: OrganizationTrainingAdminQuestionDetailDto["evidenceSummary"]["evidenceStatus"],
) {
  if (evidenceStatus === "sufficient") {
    return "依据充分";
  }

  if (evidenceStatus === "weak") {
    return "依据较弱";
  }

  return "暂无依据";
}

function resolveSourceChoiceShape(choice: SourceChoiceTitle) {
  return sourceChoices.find((sourceChoice) => sourceChoice.title === choice)
    ?.trainingContentShape;
}

function getDefaultSourceChoiceForShape(
  shape: TrainingContentShape,
): SourceChoiceTitle {
  return shape === "paper_like" ? "平台试卷快照" : "AI出题结果";
}

function isSourceChoiceAllowedForShape(
  choice: SourceChoiceTitle,
  shape: TrainingContentShape,
) {
  return resolveSourceChoiceShape(choice) === shape;
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

function normalizePublishScope(rawValue: string, organizationPublicId: string) {
  const normalizedValues = rawValue
    .split(",")
    .map((value) => value.trim())
    .filter((value) => value.length > 0);

  return normalizedValues.length === 0
    ? [organizationPublicId]
    : [...new Set(normalizedValues)];
}

function createDefaultPublishQuestionFormValue(
  sequenceNumber: number,
  score: number,
): PublishQuestionFormValue {
  return {
    sequenceNumber,
    questionType: "single_choice",
    paperSectionKey: null,
    paperSectionTitle: null,
    paperSectionSortOrder: null,
    questionSortOrder: null,
    materialTitle: "",
    materialContent: "",
    stem: "",
    options: [
      { label: "A", content: "" },
      { label: "B", content: "" },
    ],
    score: String(Math.max(1, score)),
    standardAnswer: "",
    analysisSummary: "",
    evidenceStatus: "none",
    citationCount: "1",
  };
}

function createPublishFormValuesForDraft(
  draft: OrganizationTrainingAdminLifecycleItemDto,
): PublishFormValues {
  const questionCount = Math.max(1, draft.questionCount ?? 1);
  const averageScore =
    draft.totalScore === undefined || questionCount === 0
      ? 5
      : Math.max(1, Math.floor(draft.totalScore / questionCount));

  return {
    publishScopeOrganizationPublicIds: draft.organizationPublicId,
    answerDeadlineAt: "",
    questions: Array.from({ length: questionCount }, (_, index) =>
      createDefaultPublishQuestionFormValue(index + 1, averageScore),
    ),
    weakEvidenceConfirmed: false,
  };
}

function createPublishQuestionFormValueFromDetail(
  question: OrganizationTrainingAdminQuestionDetailDto,
  paperSectionMetadata: Pick<
    PublishQuestionFormValue,
    | "paperSectionKey"
    | "paperSectionTitle"
    | "paperSectionSortOrder"
    | "questionSortOrder"
  > | null = null,
): PublishQuestionFormValue {
  return {
    sequenceNumber: question.sequenceNumber,
    questionType: question.questionType,
    paperSectionKey: paperSectionMetadata?.paperSectionKey ?? null,
    paperSectionTitle: paperSectionMetadata?.paperSectionTitle ?? null,
    paperSectionSortOrder: paperSectionMetadata?.paperSectionSortOrder ?? null,
    questionSortOrder: paperSectionMetadata?.questionSortOrder ?? null,
    materialTitle: question.materialTitle ?? "",
    materialContent: question.materialContent ?? "",
    stem: question.stem,
    options: question.options.map((option) => ({
      label: option.label,
      content: option.content,
    })),
    score: String(question.score),
    standardAnswer: question.answerAndAnalysis.standardAnswer ?? "",
    analysisSummary: question.answerAndAnalysis.analysis ?? "",
    evidenceStatus: question.evidenceSummary.evidenceStatus,
    citationCount: String(question.evidenceSummary.citationCount),
  };
}

function createPublishFormValuesFromAdminDetail(
  detail: OrganizationTrainingAdminDetailDto,
): PublishFormValues | null {
  if (
    detail.detailAvailability !== "available" ||
    detail.resourceType !== "organization_training_draft"
  ) {
    return null;
  }

  const structuredQuestions = detail.paperSections?.flatMap(
    (paperSection, paperSectionIndex) =>
      paperSection.questions.map((question, questionIndex) =>
        createPublishQuestionFormValueFromDetail(question, {
          paperSectionKey: paperSection.sectionKey,
          paperSectionTitle: paperSection.title,
          paperSectionSortOrder: paperSectionIndex + 1,
          questionSortOrder: questionIndex + 1,
        }),
      ),
  );
  const questions =
    structuredQuestions !== undefined && structuredQuestions.length > 0
      ? structuredQuestions.map((question, index) => ({
          ...question,
          sequenceNumber: index + 1,
        }))
      : detail.questions.map((question) =>
          createPublishQuestionFormValueFromDetail(question),
        );

  return {
    publishScopeOrganizationPublicIds: detail.organizationPublicId,
    answerDeadlineAt: "",
    questions,
    weakEvidenceConfirmed: false,
  };
}

function normalizeOptionalPreviewText(value: string): string | null {
  const trimmedValue = value.trim();

  return trimmedValue.length === 0 ? null : trimmedValue;
}

function normalizePositiveIntegerInput(value: string): number | null {
  const numberValue = Number(value);

  return Number.isInteger(numberValue) && numberValue > 0 ? numberValue : null;
}

function normalizeNonNegativeIntegerInput(value: string): number | null {
  const numberValue = Number(value);

  return Number.isInteger(numberValue) && numberValue >= 0 ? numberValue : null;
}

function createQuestionPublicId(sequenceNumber: number) {
  return `organization-training-question-preview-${sequenceNumber}`;
}

function createQuestionOptionPublicId(sequenceNumber: number, label: string) {
  return `${createQuestionPublicId(sequenceNumber)}-option-${label.toLowerCase()}`;
}

function normalizePublishQuestionFormValue(
  question: PublishQuestionFormValue,
): OrganizationTrainingPublishInput["questions"][number] | null {
  const stem = question.stem.trim();
  const score = normalizePositiveIntegerInput(question.score);
  const citationCount = normalizeNonNegativeIntegerInput(
    question.citationCount,
  );
  const standardAnswer = question.standardAnswer.trim();
  const analysisSummary = question.analysisSummary.trim();
  const options =
    question.questionType === "short_answer"
      ? []
      : question.options
          .map((option) => ({
            label: option.label.trim(),
            content: option.content.trim(),
          }))
          .filter(
            (option) => option.label.length > 0 && option.content.length > 0,
          );

  if (
    stem.length === 0 ||
    score === null ||
    citationCount === null ||
    standardAnswer.length === 0 ||
    analysisSummary.length === 0 ||
    (question.questionType !== "short_answer" && options.length === 0)
  ) {
    return null;
  }

  return {
    publicId: createQuestionPublicId(question.sequenceNumber),
    sequenceNumber: question.sequenceNumber,
    questionType: question.questionType,
    ...(question.paperSectionKey !== null &&
    question.paperSectionTitle !== null &&
    question.paperSectionSortOrder !== null &&
    question.questionSortOrder !== null
      ? {
          paperSectionKey: question.paperSectionKey,
          paperSectionTitle: question.paperSectionTitle,
          paperSectionSortOrder: question.paperSectionSortOrder,
          questionSortOrder: question.questionSortOrder,
        }
      : {}),
    materialTitle: normalizeOptionalPreviewText(question.materialTitle),
    materialContent: normalizeOptionalPreviewText(question.materialContent),
    stem,
    options: options.map((option) => ({
      publicId: createQuestionOptionPublicId(
        question.sequenceNumber,
        option.label,
      ),
      label: option.label,
      content: option.content,
    })),
    score,
    standardAnswer,
    analysisSummary,
    evidenceStatus: question.evidenceStatus,
    citationCount,
  };
}

function normalizePublishQuestionFormValues(
  questions: PublishQuestionFormValue[],
): OrganizationTrainingPublishInput["questions"] | null {
  const normalizedQuestions = questions.map(normalizePublishQuestionFormValue);

  if (
    normalizedQuestions.length === 0 ||
    normalizedQuestions.some((question) => question === null)
  ) {
    return null;
  }

  return normalizedQuestions as OrganizationTrainingPublishInput["questions"];
}

function createQuestionTypeSummaryFromQuestions(
  questions: OrganizationTrainingPublishInput["questions"],
): OrganizationTrainingPublishInput["questionTypeSummary"] {
  return questions.reduce<
    OrganizationTrainingPublishInput["questionTypeSummary"]
  >(
    (summary, question) => {
      if (question.questionType === "single_choice") {
        return { ...summary, singleChoice: summary.singleChoice + 1 };
      }

      if (question.questionType === "multi_choice") {
        return { ...summary, multiChoice: summary.multiChoice + 1 };
      }

      if (question.questionType === "true_false") {
        return { ...summary, trueFalse: summary.trueFalse + 1 };
      }

      return { ...summary, shortAnswer: summary.shortAnswer + 1 };
    },
    {
      singleChoice: 0,
      multiChoice: 0,
      trueFalse: 0,
      shortAnswer: 0,
    },
  );
}

function hasNoEvidenceQuestion(questions: PublishQuestionFormValue[]): boolean {
  return questions.some((question) => question.evidenceStatus === "none");
}

function hasWeakEvidenceQuestion(
  questions: PublishQuestionFormValue[],
): boolean {
  return questions.some((question) => question.evidenceStatus === "weak");
}

function resolvePublishBlockMessage(values: PublishFormValues): string | null {
  const questions = normalizePublishQuestionFormValues(values.questions);

  if (questions === null) {
    return "请先补全发布前题目预览。";
  }

  if (hasNoEvidenceQuestion(values.questions)) {
    return "当前草稿缺少必要内容或依据，暂不能发布。";
  }

  if (
    hasWeakEvidenceQuestion(values.questions) &&
    values.weakEvidenceConfirmed !== true
  ) {
    return "资料依据较弱，发布前需要确认适用范围和员工可见内容。";
  }

  return null;
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
  const questions = normalizePublishQuestionFormValues(values.questions);

  if (
    draft.authorizationPublicId === undefined ||
    draft.profession === undefined ||
    draft.level === undefined ||
    draft.subject === undefined ||
    questions === null ||
    questions.length === 0
  ) {
    return null;
  }

  const totalScore = questions.reduce(
    (scoreTotal, question) => scoreTotal + question.score,
    0,
  );

  return {
    draftPublicId: draft.publicId,
    organizationPublicId: draft.organizationPublicId,
    authorizationPublicId: draft.authorizationPublicId,
    profession: draft.profession,
    level: draft.level,
    subject: draft.subject,
    title: draft.title,
    description: draft.description ?? null,
    answerDeadlineAt: values.answerDeadlineAt.trim() || null,
    questions,
    publishScopeOrganizationPublicIds: normalizePublishScope(
      values.publishScopeOrganizationPublicIds,
      draft.organizationPublicId,
    ),
    capabilityContext:
      createOrganizationTrainingCapabilityContext(capabilitySummary),
    questionCount: questions.length,
    totalScore,
    questionTypeSummary: createQuestionTypeSummaryFromQuestions(questions),
    weakEvidenceConfirmed: values.weakEvidenceConfirmed,
  };
}

export function AdminOrganizationTrainingPage() {
  const [initialLifecycleUrlState] = useState(() =>
    parseOrganizationTrainingListSearch(
      typeof window === "undefined" ? "" : window.location.search,
    ),
  );
  const [loadState, setLoadState] =
    useState<AdminOrganizationTrainingLoadState>("loading");
  const [draftFormValues, setDraftFormValues] = useState(
    defaultDraftFormValues,
  );
  const [copyFormValues, setCopyFormValues] = useState(defaultCopyFormValues);
  const [publishFormValues, setPublishFormValues] = useState(
    defaultPublishFormValues,
  );
  const [selectedSourceChoice, setSelectedSourceChoice] =
    useState<SourceChoiceTitle>("平台试卷快照");
  const [trainingContentShape, setTrainingContentShape] =
    useState<TrainingContentShape>("paper_like");
  const [isCreateWizardOpen, setIsCreateWizardOpen] = useState(false);
  const [capabilitySummary, setCapabilitySummary] =
    useState<AdminWorkspaceCapabilitySummary | null>(null);
  const [lastDraft, setLastDraft] =
    useState<OrganizationTrainingDraftDto | null>(null);
  const [trainingListState, setTrainingListState] =
    useState<OrganizationTrainingListState>("loading");
  const [trainingListReloadSerial, setTrainingListReloadSerial] = useState(0);
  const [trainingListMessage, setTrainingListMessage] = useState<string | null>(
    null,
  );
  const [trainingItems, setTrainingItems] = useState<
    OrganizationTrainingAdminLifecycleItemDto[]
  >([]);
  const [trainingPagination, setTrainingPagination] =
    useState<ApiPagination | null>(null);
  const [selectedLifecycleStatusFilter, setSelectedLifecycleStatusFilter] =
    useState<OrganizationTrainingLifecycleStatusFilter>(
      initialLifecycleUrlState.status,
    );
  const [
    selectedLifecycleSourceKindFilter,
    setSelectedLifecycleSourceKindFilter,
  ] = useState<OrganizationTrainingLifecycleSourceKindFilter>(
    initialLifecycleUrlState.sourceKind,
  );
  const [
    selectedLifecycleContentKindFilter,
    setSelectedLifecycleContentKindFilter,
  ] = useState<OrganizationTrainingLifecycleContentKindFilter>(
    initialLifecycleUrlState.contentKind,
  );
  const [selectedLifecyclePage, setSelectedLifecyclePage] = useState(
    initialLifecycleUrlState.page,
  );
  const [selectedPublishDraft, setSelectedPublishDraft] =
    useState<OrganizationTrainingAdminLifecycleItemDto | null>(null);
  const [feedback, setFeedback] = useState<AdminFeedback | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function showTrainingError(message: string) {
    setFeedback({
      message,
      title: "企业训练操作失败",
      tone: "error",
    });
  }

  function showTrainingSuccess(message: string, title = "企业训练操作完成") {
    setFeedback({ message, title, tone: "success" });
  }

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const search = createOrganizationTrainingListSearch({
      contentKind: selectedLifecycleContentKindFilter,
      page: selectedLifecyclePage,
      sourceKind: selectedLifecycleSourceKindFilter,
      status: selectedLifecycleStatusFilter,
    });
    const nextUrl = `${window.location.pathname}${
      search === "" ? "" : `?${search}`
    }${window.location.hash}`;

    window.history.replaceState(window.history.state, "", nextUrl);
  }, [
    selectedLifecycleContentKindFilter,
    selectedLifecyclePage,
    selectedLifecycleSourceKindFilter,
    selectedLifecycleStatusFilter,
  ]);

  useEffect(() => {
    function handlePopState() {
      const restoredState = parseOrganizationTrainingListSearch(
        window.location.search,
      );

      setSelectedLifecycleContentKindFilter(restoredState.contentKind);
      setSelectedLifecyclePage(restoredState.page);
      setSelectedLifecycleSourceKindFilter(restoredState.sourceKind);
      setSelectedLifecycleStatusFilter(restoredState.status);
    }

    window.addEventListener("popstate", handlePopState);

    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

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
        const response =
          await fetchAdminOrganizationTrainingApi<OrganizationTrainingAdminLifecycleFlowDto>(
            createAdminLifecycleListPath({
              contentKind: selectedLifecycleContentKindFilter,
              page: selectedLifecyclePage,
              sourceKind: selectedLifecycleSourceKindFilter,
              status: selectedLifecycleStatusFilter,
            }),
            sessionToken,
          );

        if (!isActive) {
          return;
        }

        if (response.code !== 0 || response.data === null) {
          setIsCreateWizardOpen(false);
          setTrainingItems([]);
          setTrainingPagination(null);
          setTrainingListMessage("企业训练列表加载失败");
          setTrainingListState("error");
          return;
        }

        const hasValidIntegrityContract =
          Array.isArray(response.data.items) &&
          response.data.redactionStatus === "metadata_only" &&
          ((response.data.integrityStatus === "complete" &&
            response.data.warningCode === null) ||
            (response.data.integrityStatus === "partial" &&
              response.data.warningCode === "historical_version_unavailable"));

        if (!hasValidIntegrityContract) {
          setIsCreateWizardOpen(false);
          setTrainingItems([]);
          setTrainingPagination(null);
          setTrainingListMessage("企业训练列表完整性状态不可用");
          setTrainingListState("error");
          return;
        }

        setTrainingItems(response.data.items);
        setTrainingPagination(response.pagination ?? null);
        if (response.data.integrityStatus === "partial") {
          setIsCreateWizardOpen(false);
          setTrainingListMessage(
            "部分历史训练暂不可用，已暂停新建以避免遗漏或重复。",
          );
          setTrainingListState("partial");
          return;
        }

        setTrainingListState("ready");
      } catch {
        if (isActive) {
          setIsCreateWizardOpen(false);
          setTrainingItems([]);
          setTrainingPagination(null);
          setTrainingListMessage("企业训练列表加载失败");
          setTrainingListState("error");
        }
      }
    }

    void loadTrainingLifecycle();

    return () => {
      isActive = false;
    };
  }, [
    loadState,
    trainingListReloadSerial,
    selectedLifecycleContentKindFilter,
    selectedLifecyclePage,
    selectedLifecycleSourceKindFilter,
    selectedLifecycleStatusFilter,
  ]);

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

  function handleSelectSourceChoice(value: SourceChoiceTitle) {
    setSelectedSourceChoice(value);
    setTrainingContentShape(resolveSourceChoiceShape(value) ?? "paper_like");
  }

  function handleSelectTrainingContentShape(value: TrainingContentShape) {
    setTrainingContentShape(value);
    setSelectedSourceChoice((currentValue) =>
      isSourceChoiceAllowedForShape(currentValue, value)
        ? currentValue
        : getDefaultSourceChoiceForShape(value),
    );
  }

  async function handleCreateDraft(values: DraftFormValues) {
    const sessionToken = getStoredSessionToken();

    setIsSubmitting(true);
    setFeedback(null);

    try {
      if (trainingListState !== "ready") {
        showTrainingError("企业训练列表尚未完整加载，暂不能新建训练");
        return;
      }

      if (capabilitySummary === null) {
        showTrainingError("企业训练权限上下文缺失");
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
        showTrainingError("企业训练草稿创建失败");
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
      showTrainingSuccess("企业训练草稿已创建");
    } catch {
      showTrainingError("企业训练草稿创建失败");
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
    setFeedback(null);

    try {
      const response = await mutateAdminOrganizationTrainingApi<{
        draft: OrganizationTrainingDraftDto;
      }>(
        `/api/v1/organization-trainings/${values.sourceVersionPublicId}/copy-to-new-draft`,
        sessionToken,
        createCopyToDraftInput(values, authorizationPublicId),
      );

      if (response.code !== 0 || response.data === null) {
        showTrainingError("企业训练复制失败");
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
      showTrainingSuccess("已复制为新的企业训练草稿", "企业训练复制完成");
    } catch {
      showTrainingError("企业训练复制失败");
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
    setFeedback(null);

    const isConfirmed = window.confirm(
      "确认下架该企业训练？下架后员工端不再展示该训练。",
    );

    if (!isConfirmed) {
      return;
    }

    const rawReason = window.prompt("请输入下架原因", "内容已过期");
    const takedownReason = rawReason?.trim() ?? "";

    if (takedownReason.length === 0) {
      showTrainingError("请输入下架原因");
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
        showTrainingError("企业训练下架失败");
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
      showTrainingSuccess("企业训练已下架");
    } catch {
      showTrainingError("企业训练下架失败");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleConfigureDraft(
    draft: OrganizationTrainingAdminLifecycleItemDto,
  ): Promise<OrganizationTrainingAdminDetailDto | null> {
    setIsCreateWizardOpen(true);
    setSelectedPublishDraft(draft);
    setPublishFormValues(createPublishFormValuesForDraft(draft));

    try {
      const response =
        await fetchAdminOrganizationTrainingApi<OrganizationTrainingAdminDetailDto>(
          createAdminTrainingDetailPath(draft.publicId),
          getStoredSessionToken(),
        );

      if (response.code !== 0 || response.data === null) {
        return null;
      }

      const values = createPublishFormValuesFromAdminDetail(response.data);

      if (values !== null) {
        setPublishFormValues(values);
      }

      return response.data;
    } catch {
      return null;
    }
  }

  async function handlePublishTraining(values: PublishFormValues) {
    const sessionToken = getStoredSessionToken();

    setIsSubmitting(true);
    setFeedback(null);

    try {
      if (capabilitySummary === null || selectedPublishDraft === null) {
        showTrainingError("企业训练发布上下文缺失");
        return;
      }

      const publishBlockMessage = resolvePublishBlockMessage(values);

      if (publishBlockMessage !== null) {
        showTrainingError(publishBlockMessage);
        return;
      }

      const publishInput = createPublishTrainingInput({
        capabilitySummary,
        draft: selectedPublishDraft,
        values,
      });

      if (publishInput === null) {
        showTrainingError("企业训练发布内容不完整");
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
        showTrainingError("企业训练发布失败");
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
      showTrainingSuccess("企业训练已发布");
    } catch {
      showTrainingError("企业训练发布失败");
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
            从
            AI出题结果、AI组卷结果、平台试卷快照或手动题组创建训练，发布给当前组织或下级组织。
          </p>
        </div>
        <div className="bg-secondary text-secondary-foreground flex size-11 items-center justify-center rounded-md">
          <ShieldCheck aria-hidden="true" className="size-5" />
        </div>
      </header>

      {feedback === null ? null : (
        <AdminToast feedback={feedback} onDismiss={() => setFeedback(null)} />
      )}

      <TrainingListPanel
        items={trainingItems}
        lastDraft={lastDraft}
        listMessage={trainingListMessage}
        listState={trainingListState}
        pagination={trainingPagination}
        selectedContentKindFilter={selectedLifecycleContentKindFilter}
        selectedPage={selectedLifecyclePage}
        selectedSourceKindFilter={selectedLifecycleSourceKindFilter}
        selectedStatusFilter={selectedLifecycleStatusFilter}
        isSubmitting={isSubmitting}
        isCreateWizardOpen={isCreateWizardOpen}
        onCreateTraining={() => {
          if (trainingListState === "ready") {
            setIsCreateWizardOpen(true);
          }
        }}
        onRetry={() =>
          setTrainingListReloadSerial((currentSerial) => currentSerial + 1)
        }
        onSelectContentKindFilter={(filter) => {
          setSelectedLifecycleContentKindFilter(filter);
          setSelectedLifecyclePage(1);
        }}
        onSelectPage={setSelectedLifecyclePage}
        onSelectSourceKindFilter={(filter) => {
          setSelectedLifecycleSourceKindFilter(filter);
          setSelectedLifecyclePage(1);
        }}
        onSelectStatusFilter={(filter) => {
          setSelectedLifecycleStatusFilter(filter);
          setSelectedLifecyclePage(1);
        }}
        onCopyVersionToDraft={handleCopyVersionToNewDraft}
        onContinueDraft={handleConfigureDraft}
        onPublishDraft={handleConfigureDraft}
        onTakeDownVersion={handleTakeDownVersion}
      />

      {isCreateWizardOpen ? (
        <section
          aria-label="新建企业训练"
          className="space-y-4"
          id="organization-training-create"
        >
          <WizardHeader />
          <div className="grid gap-4 xl:grid-cols-4">
            <WizardStepCard>
              <h3 className="text-text-primary text-sm font-semibold">
                来源类型
              </h3>
              <TrainingShapeSelector
                selectedTrainingContentShape={trainingContentShape}
                onSelect={handleSelectTrainingContentShape}
              />
              <SourceChoiceList
                selectedSourceChoice={selectedSourceChoice}
                trainingContentShape={trainingContentShape}
                onSelect={handleSelectSourceChoice}
              />
            </WizardStepCard>
            <WizardStepCard>
              <DraftForm
                isSubmitting={isSubmitting}
                trainingContentShape={trainingContentShape}
                values={draftFormValues}
                onChange={setDraftFormValues}
                onSubmit={handleCreateDraft}
              />
            </WizardStepCard>
            <WizardStepCard>
              <PublishScopePreview />
              <SourceHandoffNotice
                hasDraft={lastDraft !== null}
                sourceChoice={selectedSourceChoice}
                trainingContentShape={trainingContentShape}
              />
            </WizardStepCard>
            <WizardStepCard>
              <PublishReadinessPanel
                hasDraft={lastDraft !== null}
                trainingContentShape={trainingContentShape}
              />
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
      ) : null}
    </section>
  );
}

function TrainingListPanel({
  items,
  isSubmitting,
  isCreateWizardOpen,
  lastDraft,
  listMessage,
  listState,
  pagination,
  selectedContentKindFilter,
  selectedPage,
  selectedSourceKindFilter,
  selectedStatusFilter,
  onCreateTraining,
  onRetry,
  onContinueDraft,
  onCopyVersionToDraft,
  onSelectContentKindFilter,
  onSelectPage,
  onSelectSourceKindFilter,
  onSelectStatusFilter,
  onPublishDraft,
  onTakeDownVersion,
}: {
  items: OrganizationTrainingAdminLifecycleItemDto[];
  isSubmitting: boolean;
  isCreateWizardOpen: boolean;
  lastDraft: OrganizationTrainingDraftDto | null;
  listMessage: string | null;
  listState: OrganizationTrainingListState;
  pagination: ApiPagination | null;
  selectedContentKindFilter: OrganizationTrainingLifecycleContentKindFilter;
  selectedPage: number;
  selectedSourceKindFilter: OrganizationTrainingLifecycleSourceKindFilter;
  selectedStatusFilter: OrganizationTrainingLifecycleStatusFilter;
  onCreateTraining: () => void;
  onRetry: () => void;
  onContinueDraft: (
    draft: OrganizationTrainingAdminLifecycleItemDto,
  ) => Promise<OrganizationTrainingAdminDetailDto | null>;
  onCopyVersionToDraft: (
    item: OrganizationTrainingAdminLifecycleItemDto,
  ) => void;
  onSelectContentKindFilter: (
    filter: OrganizationTrainingLifecycleContentKindFilter,
  ) => void;
  onSelectPage: (page: number) => void;
  onSelectSourceKindFilter: (
    filter: OrganizationTrainingLifecycleSourceKindFilter,
  ) => void;
  onSelectStatusFilter: (
    filter: OrganizationTrainingLifecycleStatusFilter,
  ) => void;
  onPublishDraft: (draft: OrganizationTrainingAdminLifecycleItemDto) => void;
  onTakeDownVersion: (item: OrganizationTrainingAdminLifecycleItemDto) => void;
}) {
  const [selectedDetailPublicId, setSelectedDetailPublicId] = useState<
    string | null
  >(null);
  const [selectedDetail, setSelectedDetail] =
    useState<OrganizationTrainingAdminDetailDto | null>(null);
  const [detailState, setDetailState] =
    useState<OrganizationTrainingDetailState>("idle");
  const [detailMessage, setDetailMessage] = useState<string | null>(null);
  const detailRequestSerial = useRef(0);
  const visibleItems =
    lastDraft === null
      ? items
      : upsertLifecycleItem(items, createLifecycleItemFromDraft(lastDraft));
  const filteredItems = visibleItems.filter(
    (item) =>
      matchesLifecycleStatusFilter(item, selectedStatusFilter) &&
      matchesLifecycleSourceKindFilter(item, selectedSourceKindFilter) &&
      matchesLifecycleContentKindFilter(item, selectedContentKindFilter),
  );
  const totalItemCount = pagination?.total ?? filteredItems.length;
  const totalPageCount = Math.max(
    1,
    Math.ceil(totalItemCount / organizationTrainingListPageSize),
  );
  const clampedSelectedPage = Math.min(selectedPage, totalPageCount);
  const firstVisibleItemIndex =
    (clampedSelectedPage - 1) * organizationTrainingListPageSize;
  const paginatedItems =
    pagination === null
      ? filteredItems.slice(
          firstVisibleItemIndex,
          firstVisibleItemIndex + organizationTrainingListPageSize,
        )
      : filteredItems;
  const selectedDetailItem =
    selectedDetailPublicId === null
      ? null
      : (visibleItems.find(
          (item) => item.publicId === selectedDetailPublicId,
        ) ?? null);
  const hasActiveLifecycleFilter =
    selectedStatusFilter !== "all" ||
    selectedSourceKindFilter !== "all" ||
    selectedContentKindFilter !== "all";
  const shouldShowLifecycleControls =
    visibleItems.length > 0 || hasActiveLifecycleFilter;
  const isCreationAllowed = listState === "ready";

  function clearSelectedDetail() {
    detailRequestSerial.current += 1;
    setSelectedDetailPublicId(null);
    setSelectedDetail(null);
    setDetailState("idle");
    setDetailMessage(null);
  }

  async function handleContinueDraft(
    item: OrganizationTrainingAdminLifecycleItemDto,
  ) {
    clearSelectedDetail();
    await onContinueDraft(item);
  }

  async function handleViewItem(
    item: OrganizationTrainingAdminLifecycleItemDto,
  ) {
    const requestSerial = detailRequestSerial.current + 1;
    detailRequestSerial.current = requestSerial;
    setSelectedDetailPublicId(item.publicId);
    setSelectedDetail(null);
    setDetailMessage(null);
    setDetailState("loading");

    try {
      const response =
        await fetchAdminOrganizationTrainingApi<OrganizationTrainingAdminDetailDto>(
          createAdminTrainingDetailPath(item.publicId),
          getStoredSessionToken(),
        );

      if (detailRequestSerial.current !== requestSerial) {
        return;
      }

      if (response.code !== 0 || response.data === null) {
        setDetailState("error");
        setDetailMessage("训练详情加载失败");
        return;
      }

      setSelectedDetail(response.data);
      setDetailState("ready");
    } catch {
      if (detailRequestSerial.current === requestSerial) {
        setDetailState("error");
        setDetailMessage("训练详情加载失败");
      }
    }
  }

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
        <Button
          aria-controls="organization-training-create"
          aria-describedby="organization-training-create-availability"
          aria-expanded={isCreateWizardOpen}
          disabled={!isCreationAllowed}
          onClick={onCreateTraining}
          type="button"
        >
          新建企业训练
        </Button>
      </div>
      <p
        className="text-text-secondary mt-3 text-sm"
        id="organization-training-create-availability"
      >
        {isCreationAllowed
          ? "列表完整性已确认，可以新建企业训练。"
          : listState === "loading"
            ? "列表确认完成后才能新建企业训练。"
            : "列表未完整恢复，暂不能新建企业训练。"}
      </p>
      {listState === "partial" || listState === "error" ? (
        <div
          className="border-border bg-muted mt-4 space-y-3 rounded-md border p-3"
          role="alert"
        >
          <p className="text-text-secondary text-sm leading-6">
            {listMessage ?? "企业训练列表加载失败"}
          </p>
          <div className="flex flex-wrap gap-2">
            <Button
              aria-label="重试企业训练列表"
              onClick={onRetry}
              type="button"
              variant="outline"
            >
              重试
            </Button>
            <Link
              className="border-border bg-surface text-text-primary inline-flex h-8 items-center justify-center rounded-lg border px-3 text-sm font-medium transition-transform active:scale-[0.98]"
              href="/organization/portal"
            >
              返回组织概览
            </Link>
          </div>
        </div>
      ) : null}
      {shouldShowLifecycleControls ? (
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
                onSelectStatusFilter(filter.value);
                clearSelectedDetail();
              }}
              type="button"
            >
              {filter.label}
            </button>
          ))}
        </div>
      ) : null}
      {shouldShowLifecycleControls ? (
        <div
          aria-label="企业训练来源筛选"
          className="mt-3 flex flex-wrap gap-2"
          role="group"
        >
          {lifecycleSourceKindFilters.map((filter) => (
            <button
              aria-pressed={selectedSourceKindFilter === filter.value}
              className={`border-border h-8 rounded-md border px-3 text-sm transition-colors ${
                selectedSourceKindFilter === filter.value
                  ? "bg-primary text-primary-foreground"
                  : "bg-surface text-text-secondary hover:bg-muted hover:text-text-primary"
              }`}
              key={filter.value}
              onClick={() => {
                onSelectSourceKindFilter(filter.value);
                clearSelectedDetail();
              }}
              type="button"
            >
              {filter.label}
            </button>
          ))}
        </div>
      ) : null}
      {shouldShowLifecycleControls ? (
        <div
          aria-label="企业训练形态筛选"
          className="mt-3 flex flex-wrap gap-2"
          role="group"
        >
          {lifecycleContentKindFilters.map((filter) => (
            <button
              aria-pressed={selectedContentKindFilter === filter.value}
              className={`border-border h-8 rounded-md border px-3 text-sm transition-colors ${
                selectedContentKindFilter === filter.value
                  ? "bg-primary text-primary-foreground"
                  : "bg-surface text-text-secondary hover:bg-muted hover:text-text-primary"
              }`}
              key={filter.value}
              onClick={() => {
                onSelectContentKindFilter(filter.value);
                clearSelectedDetail();
              }}
              type="button"
            >
              {filter.label}
            </button>
          ))}
        </div>
      ) : null}
      <div className="border-border mt-4 rounded-md border">
        {listState === "loading" ? (
          <div className="grid min-h-28 place-items-center px-4 py-6 text-center">
            <p className="text-text-secondary text-sm">正在加载企业训练</p>
          </div>
        ) : listState === "error" ? (
          <div className="grid min-h-28 place-items-center px-4 py-6 text-center">
            <p className="text-destructive text-sm">
              列表暂不可用，请使用上方恢复操作。
            </p>
          </div>
        ) : visibleItems.length === 0 && !hasActiveLifecycleFilter ? (
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
            {paginatedItems.map((item) => (
              <TrainingLifecycleItemCard
                isSubmitting={isSubmitting}
                item={item}
                key={item.publicId}
                onCopyVersionToDraft={onCopyVersionToDraft}
                onPublishDraft={onPublishDraft}
                onTakeDownVersion={onTakeDownVersion}
                onContinueDraft={handleContinueDraft}
                onViewItem={handleViewItem}
              />
            ))}
          </div>
        )}
      </div>
      {shouldShowLifecycleControls ? (
        <div className="mt-3">
          <AdminPagination
            itemLabel="条训练"
            page={clampedSelectedPage}
            pageSize={pagination?.pageSize ?? organizationTrainingListPageSize}
            total={totalItemCount}
            onPageChange={(page) => {
              clearSelectedDetail();
              onSelectPage(page);
            }}
          />
        </div>
      ) : null}
      {selectedDetailItem === null ? null : (
        <AdminDetailDrawer
          ariaLabel="训练详情"
          description={selectedDetailItem.title}
          onClose={clearSelectedDetail}
          title="训练详情"
        >
          <TrainingLifecycleDetailPanel
            detail={selectedDetail}
            detailMessage={detailMessage}
            detailState={detailState}
            item={selectedDetailItem}
          />
        </AdminDetailDrawer>
      )}
    </section>
  );
}

function TrainingLifecycleItemCard({
  isSubmitting,
  item,
  onContinueDraft,
  onCopyVersionToDraft,
  onPublishDraft,
  onTakeDownVersion,
  onViewItem,
}: {
  isSubmitting: boolean;
  item: OrganizationTrainingAdminLifecycleItemDto;
  onContinueDraft: (
    draft: OrganizationTrainingAdminLifecycleItemDto,
  ) => Promise<void> | void;
  onCopyVersionToDraft: (
    item: OrganizationTrainingAdminLifecycleItemDto,
  ) => void;
  onPublishDraft: (draft: OrganizationTrainingAdminLifecycleItemDto) => void;
  onTakeDownVersion: (item: OrganizationTrainingAdminLifecycleItemDto) => void;
  onViewItem: (item: OrganizationTrainingAdminLifecycleItemDto) => void;
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
          {actionLabel} · {resolveLifecycleSourceKindLabel(item.sourceKind)} ·{" "}
          {resolveLifecycleContentKindLabel(item.contentKind)} · 题量{" "}
          {item.questionCount ?? 0} · 总分 {item.totalScore ?? 0}
        </p>
      </div>
      <div className="flex items-center gap-2 md:justify-end">
        <span className="bg-warning/10 text-warning inline-flex h-7 items-center rounded-md px-2 text-xs font-medium">
          {statusLabel}
        </span>
        <Button
          disabled={isSubmitting}
          onClick={() => {
            if (isDraft) {
              void onContinueDraft(item);
              return;
            }

            onViewItem(item);
          }}
          type="button"
          variant="outline"
        >
          {isDraft ? "继续配置" : "查看"}
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
  detail,
  detailMessage,
  detailState,
  item,
}: {
  detail: OrganizationTrainingAdminDetailDto | null;
  detailMessage: string | null;
  detailState: OrganizationTrainingDetailState;
  item: OrganizationTrainingAdminLifecycleItemDto;
}) {
  const canCopyToDraft = item.availableActions.includes("copy_to_new_draft");
  const isDetailAvailable =
    detailState === "ready" &&
    detail !== null &&
    detail.detailAvailability === "available";
  const sourceKind = isDetailAvailable ? detail.sourceKind : item.sourceKind;
  const contentKind = isDetailAvailable ? detail.contentKind : item.contentKind;
  const questionCount = isDetailAvailable
    ? detail.structure.questionCount
    : (item.questionCount ?? 0);
  const totalScore = isDetailAvailable
    ? detail.structure.totalScore
    : (item.totalScore ?? 0);

  return (
    <section aria-label="训练详情内容" className="space-y-4">
      <div className="flex justify-end">
        <span className="bg-surface text-text-secondary border-border inline-flex h-7 items-center rounded-md border px-2 text-xs font-medium">
          {resolveLifecycleStatusLabel(item)}
        </span>
      </div>
      <p className="text-text-secondary text-sm">
        已发布版本为只读；如需调整内容，请复制为新草稿后再发布。
      </p>
      <dl className="grid gap-2 text-sm sm:grid-cols-3">
        <div className="bg-surface rounded-md p-3">
          <dt className="text-text-secondary">来源</dt>
          <dd className="text-text-primary font-medium">
            {resolveLifecycleSourceKindLabel(sourceKind)}
          </dd>
        </div>
        <div className="bg-surface rounded-md p-3">
          <dt className="text-text-secondary">形态</dt>
          <dd className="text-text-primary font-medium">
            {resolveLifecycleContentKindLabel(contentKind)}
          </dd>
        </div>
        <div className="bg-surface rounded-md p-3">
          <dt className="text-text-secondary">题量</dt>
          <dd className="text-text-primary font-medium">{questionCount}</dd>
        </div>
        <div className="bg-surface rounded-md p-3">
          <dt className="text-text-secondary">总分</dt>
          <dd className="text-text-primary font-medium">{totalScore}</dd>
        </div>
        <div className="bg-surface rounded-md p-3">
          <dt className="text-text-secondary">操作建议</dt>
          <dd className="text-text-primary font-medium">
            {canCopyToDraft ? "复制为新草稿" : "继续发布流程"}
          </dd>
        </div>
      </dl>
      <TrainingLifecycleDetailBody
        detail={detail}
        detailMessage={detailMessage}
        detailState={detailState}
      />
    </section>
  );
}

function TrainingLifecycleDetailBody({
  detail,
  detailMessage,
  detailState,
}: {
  detail: OrganizationTrainingAdminDetailDto | null;
  detailMessage: string | null;
  detailState: OrganizationTrainingDetailState;
}) {
  if (detailState === "loading") {
    return (
      <div className="bg-surface mt-4 rounded-md p-4 text-sm">
        <p className="text-text-secondary">正在加载训练详情</p>
      </div>
    );
  }

  if (detailState === "error") {
    return (
      <div className="bg-destructive/10 text-destructive mt-4 rounded-md p-4 text-sm">
        {detailMessage ?? "训练详情加载失败"}
      </div>
    );
  }

  if (detailState !== "ready" || detail === null) {
    return null;
  }

  if (detail.detailAvailability === "unavailable") {
    return (
      <div className="bg-surface mt-4 rounded-md p-4 text-sm">
        <p className="text-text-primary font-medium">详情暂不可用</p>
        <p className="text-text-secondary mt-1">
          当前草稿还没有可展示的结构化快照，请继续配置后再预览发布。
        </p>
      </div>
    );
  }

  const questionTypeSummary = detail.structure.questionTypeSummary;
  const paperSections = detail.paperSections ?? [];

  return (
    <div className="mt-4 space-y-4">
      <section className="bg-surface rounded-md p-4">
        <h4 className="text-text-primary text-sm font-semibold">结构摘要</h4>
        <p className="text-text-secondary mt-2 text-sm">
          单选 {questionTypeSummary.singleChoice} · 多选{" "}
          {questionTypeSummary.multiChoice} · 判断{" "}
          {questionTypeSummary.trueFalse} · 简答{" "}
          {questionTypeSummary.shortAnswer}
        </p>
      </section>
      {paperSections.length > 0 ? (
        <div className="space-y-3">
          <h4 className="text-text-primary text-sm font-semibold">试卷详情</h4>
          {paperSections.map((paperSection) => (
            <section
              className="border-border bg-surface rounded-md border p-4"
              key={paperSection.sectionKey}
            >
              <div className="space-y-1">
                <h5 className="text-text-primary text-sm font-semibold">
                  {paperSection.title}
                </h5>
                <p className="text-text-secondary text-sm">
                  {resolvePublishQuestionTypeLabel(paperSection.questionType)} ·
                  题量 {paperSection.selectedQuestionCount}/
                  {paperSection.targetQuestionCount} · 总分{" "}
                  {paperSection.totalScore}
                </p>
              </div>
              <div className="mt-3 space-y-3">
                {paperSection.questions.map((question) => (
                  <TrainingQuestionDetailCard
                    key={`${paperSection.sectionKey}-${question.sequenceNumber}-${question.stem}`}
                    question={question}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>
      ) : detail.questions.length === 0 ? (
        <div className="bg-surface rounded-md p-4 text-sm">
          <p className="text-text-secondary">暂无可展示题目详情</p>
        </div>
      ) : (
        <div className="space-y-3">
          <h4 className="text-text-primary text-sm font-semibold">
            {detail.contentKind === "paper_training" ? "试卷详情" : "题目详情"}
          </h4>
          {detail.questions.map((question) => (
            <TrainingQuestionDetailCard
              key={`${question.sequenceNumber}-${question.stem}`}
              question={question}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function TrainingQuestionDetailCard({
  question,
}: {
  question: OrganizationTrainingAdminQuestionDetailDto;
}) {
  return (
    <article className="border-border bg-surface rounded-md border p-4 text-sm">
      <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
        <div className="space-y-1">
          <h5 className="text-text-primary font-semibold">
            第 {question.sequenceNumber} 题 ·{" "}
            {resolvePublishQuestionTypeLabel(question.questionType)}
          </h5>
          <p className="text-text-secondary">
            分值 {question.score} ·{" "}
            {resolveEvidenceStatusLabel(
              question.evidenceSummary.evidenceStatus,
            )}{" "}
            · 引用 {question.evidenceSummary.citationCount} 条
          </p>
        </div>
        {question.materialTitle === null ? null : (
          <span className="bg-muted text-text-secondary inline-flex min-h-7 items-center rounded-md px-2 text-xs">
            材料：{question.materialTitle}
          </span>
        )}
      </div>
      <p className="text-text-primary mt-3 leading-6">{question.stem}</p>
      {question.options.length === 0 ? null : (
        <ul className="mt-3 grid gap-2">
          {question.options.map((option) => (
            <li
              className="bg-muted/60 text-text-primary rounded-md px-3 py-2"
              key={`${question.sequenceNumber}-${option.label}`}
            >
              {option.label}. {option.content}
            </li>
          ))}
        </ul>
      )}
      <AnswerAnalysisDisclosure question={question} />
    </article>
  );
}

function AnswerAnalysisDisclosure({
  question,
}: {
  question: OrganizationTrainingAdminQuestionDetailDto;
}) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="mt-3">
      <Button
        onClick={() => setIsExpanded((currentValue) => !currentValue)}
        type="button"
        variant="outline"
      >
        {isExpanded ? "收起答案与解析" : "展开答案与解析"}
      </Button>
      {isExpanded ? (
        <dl className="mt-3 grid gap-2 sm:grid-cols-2">
          <div className="bg-muted rounded-md p-3">
            <dt className="text-text-secondary">答案</dt>
            <dd className="text-text-primary mt-1">
              {question.answerAndAnalysis.standardAnswer ?? "未提供"}
            </dd>
          </div>
          <div className="bg-muted rounded-md p-3">
            <dt className="text-text-secondary">解析</dt>
            <dd className="text-text-primary mt-1">
              {question.answerAndAnalysis.analysis ?? "未提供"}
            </dd>
          </div>
        </dl>
      ) : null}
    </div>
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

function WizardStepCard({ children }: { children: React.ReactNode }) {
  return <section className="space-y-3">{children}</section>;
}

function SourceChoiceList({
  selectedSourceChoice,
  trainingContentShape,
  onSelect,
}: {
  selectedSourceChoice: SourceChoiceTitle;
  trainingContentShape: TrainingContentShape;
  onSelect: (value: SourceChoiceTitle) => void;
}) {
  const visibleSourceChoices = sourceChoices.filter(
    (choice) => choice.trainingContentShape === trainingContentShape,
  );

  return (
    <div className="space-y-2" role="radiogroup" aria-label="企业训练来源">
      {visibleSourceChoices.map((choice) => {
        const isSelected = choice.title === selectedSourceChoice;

        return (
          <button
            aria-checked={isSelected}
            aria-label={choice.title}
            className="border-border bg-surface hover:bg-muted grid w-full gap-1 rounded-md border p-3 text-left text-sm active:scale-[0.98]"
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
        模拟考试不是企业训练来源入口。
      </p>
    </div>
  );
}

function TrainingShapeSelector({
  selectedTrainingContentShape,
  onSelect,
}: {
  selectedTrainingContentShape: TrainingContentShape;
  onSelect: (value: TrainingContentShape) => void;
}) {
  return (
    <div className="space-y-2" role="radiogroup" aria-label="业务意图">
      {trainingContentShapeOptions.map((option) => {
        const isSelected = option.value === selectedTrainingContentShape;

        return (
          <button
            aria-checked={isSelected}
            aria-label={option.label}
            className={`border-border grid w-full gap-1 rounded-md border p-3 text-left text-sm active:scale-[0.98] ${
              isSelected
                ? "bg-secondary text-secondary-foreground"
                : "bg-surface text-text-secondary hover:bg-muted hover:text-text-primary"
            }`}
            key={option.value}
            onClick={() => onSelect(option.value)}
            role="radio"
            type="button"
          >
            <span className="font-medium">{option.label}</span>
            <span className="leading-5">{option.description}</span>
          </button>
        );
      })}
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

function PublishReadinessPanel({
  hasDraft,
  trainingContentShape,
}: {
  hasDraft: boolean;
  trainingContentShape: TrainingContentShape;
}) {
  return (
    <div className="bg-muted text-text-secondary space-y-2 rounded-md p-3 text-sm">
      <div className="text-text-primary flex items-center gap-2 font-medium">
        <ShieldCheck aria-hidden="true" className="size-4" />
        发布检查
      </div>
      <p>
        {hasDraft
          ? "草稿已创建，发布前需完成题目预览、答案解析和佐证状态检查。"
          : "创建草稿后再预览题目、答案解析、范围和佐证状态。"}
      </p>
      <p>当前形态：{resolveTrainingContentShapeLabel(trainingContentShape)}</p>
    </div>
  );
}

function SourceHandoffNotice({
  hasDraft,
  sourceChoice,
  trainingContentShape,
}: {
  hasDraft: boolean;
  sourceChoice: SourceChoiceTitle;
  trainingContentShape: TrainingContentShape;
}) {
  if (sourceChoice === "AI出题结果") {
    return (
      <div className="bg-muted text-text-secondary space-y-3 rounded-md p-3 text-sm leading-6">
        <div className="flex flex-wrap gap-2">
          <a
            className="border-border bg-surface text-text-primary hover:bg-muted inline-flex h-8 items-center rounded-md border px-3 text-sm font-medium active:scale-[0.98]"
            href="/organization/ai-question-generation"
          >
            前往 AI出题
          </a>
        </div>
        <p>AI出题结果会进入题目训练草稿；这些题目还未发布，员工暂时看不到。</p>
        <p>
          当前形态：{resolveTrainingContentShapeLabel(trainingContentShape)}
        </p>
      </div>
    );
  }

  if (sourceChoice === "AI组卷结果") {
    return (
      <div className="bg-muted text-text-secondary space-y-3 rounded-md p-3 text-sm leading-6">
        <div className="flex flex-wrap gap-2">
          <a
            className="border-border bg-surface text-text-primary hover:bg-muted inline-flex h-8 items-center rounded-md border px-3 text-sm font-medium active:scale-[0.98]"
            href="/organization/ai-paper-generation"
          >
            前往 AI组卷
          </a>
        </div>
        <p>AI组卷生成组卷计划，系统本地选题后进入企业训练草稿。</p>
        <p>不会直接写入平台正式题库、正式试卷或模拟考试。</p>
        <p>
          当前形态：{resolveTrainingContentShapeLabel(trainingContentShape)}
        </p>
      </div>
    );
  }

  if (sourceChoice === "平台试卷快照") {
    return (
      <div className="bg-muted text-text-secondary rounded-md p-3 text-sm leading-6">
        {hasDraft
          ? "草稿已创建；创建草稿后从试卷列表选择平台试卷快照，不需要手填内部标识。"
          : "创建草稿后从试卷列表选择平台试卷快照，不需要手填内部标识。"}
        <span className="block">
          当前形态：{resolveTrainingContentShapeLabel(trainingContentShape)}。
        </span>
      </div>
    );
  }

  return (
    <div className="bg-muted text-text-secondary rounded-md p-3 text-sm leading-6">
      手动题组先在草稿中维护企业私有题目，再按四步流程预览发布。当前形态：
      {resolveTrainingContentShapeLabel(trainingContentShape)}。
    </div>
  );
}

function DraftForm({
  isSubmitting,
  trainingContentShape,
  values,
  onChange,
  onSubmit,
}: {
  isSubmitting: boolean;
  trainingContentShape: TrainingContentShape;
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
      <div className="bg-muted text-text-secondary rounded-md p-3 text-sm leading-6">
        当前按 {resolveTrainingContentShapeLabel(trainingContentShape)}{" "}
        创建企业训练草稿。
      </div>
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
  const [isEmployeePreviewVisible, setIsEmployeePreviewVisible] =
    useState(false);
  const [isAnswerAnalysisVisible, setIsAnswerAnalysisVisible] = useState(false);
  const hasWeakEvidence = hasWeakEvidenceQuestion(values.questions);

  function updateQuestion(
    index: number,
    updater: (question: PublishQuestionFormValue) => PublishQuestionFormValue,
  ) {
    onChange({
      ...values,
      questions: values.questions.map((question, questionIndex) =>
        questionIndex === index ? updater(question) : question,
      ),
    });
  }

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
      <TextField
        label="作答截止时间"
        value={values.answerDeadlineAt}
        onChange={(value) => onChange({ ...values, answerDeadlineAt: value })}
      />
      <section className="grid gap-3" aria-label="发布前题目预览">
        <div className="space-y-1">
          <h3 className="text-text-primary text-sm font-semibold">
            发布前题目预览
          </h3>
          <p className="text-text-secondary text-sm">
            管理员只确认员工可见内容、答案解析和依据状态，不需要填写
            结构化文本或技术标识。
          </p>
        </div>
        {values.questions.map((question, index) => (
          <PublishQuestionPreviewEditor
            key={question.sequenceNumber}
            question={question}
            questionIndex={index}
            onChange={updateQuestion}
          />
        ))}
      </section>
      <section className="bg-muted text-text-secondary space-y-3 rounded-md p-3 text-sm">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <h3 className="text-text-primary font-semibold">员工视角预览</h3>
            <p>发布前确认员工看到的题干、选项、分值和范围。</p>
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={() => setIsEmployeePreviewVisible((visible) => !visible)}
          >
            预览员工视角
          </Button>
        </div>
        {isEmployeePreviewVisible ? (
          <div className="bg-surface border-border space-y-3 rounded-md border p-3">
            <p className="text-text-primary font-medium">员工可见预览</p>
            {values.questions.map((question) => (
              <EmployeePreviewQuestion
                key={question.sequenceNumber}
                question={question}
              />
            ))}
          </div>
        ) : null}
      </section>
      {hasWeakEvidence ? (
        <label className="border-warning/30 bg-warning/10 text-text-secondary flex items-start gap-2 rounded-md border p-3 text-sm">
          <input
            aria-label="确认弱依据后发布"
            checked={values.weakEvidenceConfirmed}
            className="border-input mt-1 size-4 rounded"
            type="checkbox"
            onChange={(event) =>
              onChange({
                ...values,
                weakEvidenceConfirmed: event.target.checked,
              })
            }
          />
          <span>资料依据较弱，发布前需要确认适用范围和员工可见内容。</span>
        </label>
      ) : null}
      <div className="bg-muted text-text-secondary space-y-2 rounded-md p-3 text-sm">
        <button
          className="text-text-primary font-medium active:scale-[0.98]"
          type="button"
          onClick={() => setIsAnswerAnalysisVisible((isVisible) => !isVisible)}
        >
          查看答案解析
        </button>
        {isAnswerAnalysisVisible ? (
          <div className="space-y-2">
            {values.questions.map((question) => (
              <div
                className="bg-surface rounded-md p-3"
                key={question.sequenceNumber}
              >
                <p className="text-text-primary">
                  第 {question.sequenceNumber} 题标准答案：
                  {question.standardAnswer}
                </p>
                <p className="text-text-primary">
                  解析：{question.analysisSummary}
                </p>
              </div>
            ))}
          </div>
        ) : null}
      </div>
      <Button disabled={isSubmitting} type="submit">
        {isSubmitting ? "发布中" : "发布训练"}
      </Button>
    </form>
  );
}

function PublishQuestionPreviewEditor({
  onChange,
  question,
  questionIndex,
}: {
  onChange: (
    index: number,
    updater: (question: PublishQuestionFormValue) => PublishQuestionFormValue,
  ) => void;
  question: PublishQuestionFormValue;
  questionIndex: number;
}) {
  const questionLabel = `第 ${question.sequenceNumber} 题`;

  return (
    <fieldset className="border-border bg-muted/40 grid gap-3 rounded-md border p-3">
      <legend className="text-text-primary px-1 text-sm font-semibold">
        {questionLabel}
      </legend>
      <TextField
        label={`${questionLabel}题干`}
        value={question.stem}
        onChange={(value) =>
          onChange(questionIndex, (currentQuestion) => ({
            ...currentQuestion,
            stem: value,
          }))
        }
      />
      <div className="grid gap-3 md:grid-cols-3">
        <label className="grid gap-2 text-sm font-medium">
          <span className="text-text-secondary">{questionLabel}题型</span>
          <select
            aria-label={`${questionLabel}题型`}
            className="border-input focus-visible:border-ring focus-visible:ring-ring/50 bg-surface h-9 rounded-lg border px-2.5 text-sm outline-none focus-visible:ring-3"
            value={question.questionType}
            onChange={(event) =>
              onChange(questionIndex, (currentQuestion) => ({
                ...currentQuestion,
                questionType: event.target
                  .value as PublishQuestionFormValue["questionType"],
              }))
            }
          >
            <option value="single_choice">单选题</option>
            <option value="multi_choice">多选题</option>
            <option value="true_false">判断题</option>
            <option value="short_answer">简答题</option>
          </select>
        </label>
        <NumberField
          label={`${questionLabel}分值`}
          value={question.score}
          onChange={(value) =>
            onChange(questionIndex, (currentQuestion) => ({
              ...currentQuestion,
              score: value,
            }))
          }
        />
        <label className="grid gap-2 text-sm font-medium">
          <span className="text-text-secondary">{questionLabel}依据状态</span>
          <select
            aria-label={`${questionLabel}依据状态`}
            className="border-input focus-visible:border-ring focus-visible:ring-ring/50 bg-surface h-9 rounded-lg border px-2.5 text-sm outline-none focus-visible:ring-3"
            value={question.evidenceStatus}
            onChange={(event) =>
              onChange(questionIndex, (currentQuestion) => ({
                ...currentQuestion,
                evidenceStatus: event.target
                  .value as PublishQuestionFormValue["evidenceStatus"],
              }))
            }
          >
            <option value="none">缺少依据</option>
            <option value="weak">依据较弱</option>
            <option value="sufficient">依据充分</option>
          </select>
        </label>
      </div>
      {question.questionType === "short_answer" ? null : (
        <div className="grid gap-3 md:grid-cols-2">
          {question.options.map((option, optionIndex) => (
            <TextField
              key={option.label}
              label={`${questionLabel}选项 ${option.label}`}
              value={option.content}
              onChange={(value) =>
                onChange(questionIndex, (currentQuestion) => ({
                  ...currentQuestion,
                  options: currentQuestion.options.map(
                    (currentOption, currentOptionIndex) =>
                      currentOptionIndex === optionIndex
                        ? { ...currentOption, content: value }
                        : currentOption,
                  ),
                }))
              }
            />
          ))}
        </div>
      )}
      <TextField
        label={`${questionLabel}标准答案`}
        value={question.standardAnswer}
        onChange={(value) =>
          onChange(questionIndex, (currentQuestion) => ({
            ...currentQuestion,
            standardAnswer: value,
          }))
        }
      />
      <TextField
        label={`${questionLabel}解析`}
        value={question.analysisSummary}
        onChange={(value) =>
          onChange(questionIndex, (currentQuestion) => ({
            ...currentQuestion,
            analysisSummary: value,
          }))
        }
      />
    </fieldset>
  );
}

function EmployeePreviewQuestion({
  question,
}: {
  question: PublishQuestionFormValue;
}) {
  return (
    <div className="border-border rounded-md border p-3">
      <p className="text-text-primary text-sm font-medium">
        第 {question.sequenceNumber} 题 ·{" "}
        {resolvePublishQuestionTypeLabel(question.questionType)} ·{" "}
        {question.score} 分
      </p>
      <p className="text-text-primary mt-2 text-sm leading-6">
        {question.stem}
      </p>
      {question.questionType === "short_answer" ? (
        <p className="text-text-secondary mt-2 text-sm">员工填写文字作答。</p>
      ) : (
        <ul className="text-text-secondary mt-2 space-y-1 text-sm">
          {question.options
            .filter((option) => option.content.trim().length > 0)
            .map((option) => (
              <li key={option.label}>
                {option.label}. {option.content}
              </li>
            ))}
        </ul>
      )}
    </div>
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
