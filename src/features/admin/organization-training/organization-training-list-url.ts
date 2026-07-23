import type {
  OrganizationTrainingAdminLifecycleContentKind,
  OrganizationTrainingAdminLifecycleSourceKind,
} from "@/server/contracts/organization-training-contract";

export type OrganizationTrainingLifecycleStatusFilter =
  | "all"
  | "draft"
  | "published"
  | "taken_down";

export type OrganizationTrainingLifecycleSourceKindFilter =
  | "all"
  | OrganizationTrainingAdminLifecycleSourceKind;

export type OrganizationTrainingLifecycleContentKindFilter =
  | "all"
  | OrganizationTrainingAdminLifecycleContentKind;

export type OrganizationTrainingLifecyclePageSize = 20 | 50 | 100;

export type OrganizationTrainingDraftGenerationKind = "question" | "paper";

export type OrganizationTrainingDraftSelectorStatus =
  | "absent"
  | "valid"
  | "invalid";

export type OrganizationTrainingListUrlState = {
  contentKind: OrganizationTrainingLifecycleContentKindFilter;
  draftGenerationKind: OrganizationTrainingDraftGenerationKind | null;
  draftPublicId: string | null;
  draftSelectorStatus: OrganizationTrainingDraftSelectorStatus;
  page: number;
  pageSize: OrganizationTrainingLifecyclePageSize;
  sourceKind: OrganizationTrainingLifecycleSourceKindFilter;
  status: OrganizationTrainingLifecycleStatusFilter;
};

const allowedStatuses = ["all", "draft", "published", "taken_down"] as const;
const allowedSourceKinds = [
  "all",
  "ai_question",
  "ai_paper",
  "platform_paper",
  "manual_group",
  "unknown",
] as const;
const allowedContentKinds = [
  "all",
  "question_training",
  "paper_training",
  "unknown",
] as const;
const allowedPageSizes = [20, 50, 100] as const;
const allowedDraftGenerationKinds = ["question", "paper"] as const;
const canonicalDraftPublicIdPattern =
  /^organization-training-draft-[a-z0-9](?:[a-z0-9_-]{0,95})$/u;

export function isCanonicalOrganizationTrainingDraftPublicId(value: string) {
  return canonicalDraftPublicIdPattern.test(value);
}

function parsePageSize(
  value: string | null,
): OrganizationTrainingLifecyclePageSize {
  const parsedValue = Number(value);

  return allowedPageSizes.includes(
    parsedValue as OrganizationTrainingLifecyclePageSize,
  )
    ? (parsedValue as OrganizationTrainingLifecyclePageSize)
    : 20;
}

function parseAllowedValue<TValue extends string>(
  value: string | null,
  allowedValues: readonly TValue[],
  fallback: TValue,
): TValue {
  return allowedValues.includes(value as TValue) ? (value as TValue) : fallback;
}

export function parseOrganizationTrainingListSearch(
  search: string,
): OrganizationTrainingListUrlState {
  const searchParams = new URLSearchParams(search);
  const parsedPage = Number(searchParams.get("page"));
  const draftPublicIds = searchParams.getAll("draftPublicId");
  const draftGenerationKinds = searchParams.getAll("generationKind");
  const hasDraftSelector =
    draftPublicIds.length > 0 || draftGenerationKinds.length > 0;
  const hasValidDraftSelector =
    draftPublicIds.length === 1 &&
    draftGenerationKinds.length === 1 &&
    isCanonicalOrganizationTrainingDraftPublicId(draftPublicIds[0] ?? "") &&
    allowedDraftGenerationKinds.includes(
      draftGenerationKinds[0] as OrganizationTrainingDraftGenerationKind,
    );

  return {
    contentKind: parseAllowedValue(
      searchParams.get("contentKind"),
      allowedContentKinds,
      "all",
    ),
    draftGenerationKind: hasValidDraftSelector
      ? (draftGenerationKinds[0] as OrganizationTrainingDraftGenerationKind)
      : null,
    draftPublicId: hasValidDraftSelector ? (draftPublicIds[0] ?? null) : null,
    draftSelectorStatus: !hasDraftSelector
      ? "absent"
      : hasValidDraftSelector
        ? "valid"
        : "invalid",
    page: Number.isInteger(parsedPage) && parsedPage > 0 ? parsedPage : 1,
    pageSize: parsePageSize(searchParams.get("pageSize")),
    sourceKind: parseAllowedValue(
      searchParams.get("sourceKind"),
      allowedSourceKinds,
      "all",
    ),
    status: parseAllowedValue(
      searchParams.get("status"),
      allowedStatuses,
      "all",
    ),
  };
}

export function createOrganizationTrainingListSearch({
  contentKind,
  draftGenerationKind,
  draftPublicId,
  draftSelectorStatus,
  page,
  pageSize,
  sourceKind,
  status,
}: OrganizationTrainingListUrlState): string {
  const searchParams = new URLSearchParams();

  if (status !== "all") searchParams.set("status", status);
  if (sourceKind !== "all") searchParams.set("sourceKind", sourceKind);
  if (contentKind !== "all") searchParams.set("contentKind", contentKind);
  if (pageSize !== 20) searchParams.set("pageSize", String(pageSize));
  if (page > 1) searchParams.set("page", String(page));
  if (
    draftSelectorStatus === "valid" &&
    draftPublicId !== null &&
    draftGenerationKind !== null
  ) {
    searchParams.set("draftPublicId", draftPublicId);
    searchParams.set("generationKind", draftGenerationKind);
  }

  return searchParams.toString();
}
