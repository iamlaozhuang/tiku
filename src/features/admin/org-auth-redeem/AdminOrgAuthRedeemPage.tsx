"use client";

import Link from "next/link";
import {
  AlertCircle,
  Ban,
  Building2,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Copy,
  Download,
  Eye,
  LoaderCircle,
  MoveRight,
  Pencil,
  PlusCircle,
  Search,
  ShieldCheck,
  Ticket,
  Upload,
  UserMinus,
  UsersRound,
  X,
} from "lucide-react";
import {
  type ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import type {
  ApiPagination,
  ApiResponse,
} from "@/server/contracts/api-response";
import type {
  AdminEmployeeListDto,
  AdminOrgAuthListDto,
  EmployeeListDto,
  EmployeeTransferResultDto,
  EmployeeUnbindResultDto,
  OrganizationListDto,
  OrganizationTreeNodeListDto,
  OrganizationTreeQueryNodeDto,
  OrgAuthExpiryStatus,
  RedeemCodeDetailDto,
  RedeemCodeDetailResultDto,
  RedeemCodeGenerationDto,
  RedeemCodeListDto,
} from "@/server/contracts/admin-user-org-auth-ops-contract";
import type { AuthContextDto } from "@/server/contracts/auth-contract";
import { useAdminListInteraction } from "@/hooks/useAdminListInteraction";
import {
  adminListControlClassName,
  adminListFilterLabelClassName,
  AdminListToolbar,
  AdminPagination,
  AdminTableEmptyRow,
  AdminTableFrame,
} from "@/components/admin/AdminList";
import { adminDataTableClassName } from "@/components/admin/admin-layout-primitives";
import { AdminDetailDrawer } from "@/components/admin/AdminDetailDrawer";
import { AdminToast } from "@/components/admin/AdminToast";
import {
  ADMIN_PAGE_SIZE_OPTIONS,
  type AdminListQuery,
} from "@/server/contracts/admin-interaction-contract";
import type {
  OrgAuthDetailDto,
  DisableOrganizationResultDto,
  OrgAuthListDto,
  OrgAuthDetailResultDto,
  OrgAuthResultDto,
  OrganizationResultDto,
} from "@/server/contracts/organization-auth-contract";
import type {
  AuthScopeType,
  AuthStatus,
  AuthorizationEdition,
  AuthUpgradeStatus,
  OrgTier,
  Profession,
  RedeemCodeStatus,
  RedeemCodeType,
  UserStatus,
} from "@/server/models/auth";
import { EmployeeImportCommandPanel } from "./EmployeeImportCommandPanel/EmployeeImportCommandPanel";
import type { EmployeeImportCommandSubmitInput } from "./employee-import-command-client";
import { useEmployeeImportCommand } from "./useEmployeeImportCommand";

type LoadState = "loading" | "ready" | "empty" | "unauthorized" | "error";

type AdminOrgAuthData = {
  organizations: OrganizationListDto["organizations"];
  orgAuths: OrgAuthListDto["orgAuths"];
  employees: EmployeeListDto["employees"];
};

type AdminOrgAuthListData = {
  orgAuths: AdminOrgAuthListDto["orgAuths"];
  pagination: ApiPagination | null;
};

type AdminEmployeeListData = {
  employees: AdminEmployeeListDto["employees"];
  pagination: ApiPagination | null;
};

type OrganizationTreeLoadState = "loading" | "ready" | "error";

type OrganizationTreeBranch = {
  page: number;
  pageSize: number;
  publicIds: string[];
  total: number;
};

type OrganizationTreeData = {
  branches: Record<string, OrganizationTreeBranch>;
  nodesByPublicId: Record<string, OrganizationTreeQueryNodeDto>;
};

const opsOrganizationManagementViewIds = [
  "organization-tree",
  "org-auth",
  "employees",
] as const;

type OpsOrganizationManagementView =
  (typeof opsOrganizationManagementViewIds)[number];

const defaultOpsOrganizationManagementView: OpsOrganizationManagementView =
  "organization-tree";

type CreateOrgAuthInput = {
  accountQuota: number;
  authScopeType: AuthScopeType;
  edition: AuthorizationEdition;
  expiresAt: string;
  name: string;
  organizationPublicIds: string[];
  purchaserOrganizationPublicId: string;
  scopeSelections: {
    level: number;
    profession: Profession;
  }[];
  startsAt: string;
};

type OrgAuthFormState = {
  accountQuota: string;
  authScopeType: AuthScopeType;
  edition: AuthorizationEdition | "";
  expiresAt: string;
  levels: string[];
  name: string;
  organizationPublicIds: string[];
  professions: Profession[];
  purchaserOrganizationPublicId: string;
  startsAt: string;
};

type OrganizationFormState = {
  contactName: string;
  contactPhone: string;
  expectedRevision: number;
  mode: "create" | "move" | "update";
  name: string;
  orgTier: OrgTier;
  parentOrganizationPublicId: string;
  publicId: string | null;
  remark: string;
};

type AdminRedeemCodeData = RedeemCodeListDto & {
  pagination: ApiPagination | null;
};

type CreateRedeemCodeInput = {
  count: number;
  durationDay: number;
  level: number;
  profession: Profession;
  redeemCodeType: RedeemCodeType;
  redeemDeadlineDate: string;
};

type RedeemCodeGenerationMode = "batch" | "single";

type RedeemCodeGenerationFormState = {
  count: string;
  durationDay: string;
  generationMode: RedeemCodeGenerationMode;
  level: string;
  profession: Profession | "";
  redeemCodeType: RedeemCodeType | "";
  redeemDeadlineDate: string;
};

type OrgAuthConfirmationState =
  | {
      kind: "createOrgAuth";
      input: CreateOrgAuthInput;
    }
  | {
      kind: "cancelOrgAuth";
      publicId: string;
    }
  | null;

type OrganizationConfirmationState =
  | {
      kind: "createOrganization" | "updateOrganization";
      input: OrganizationMutationInput;
      publicId: string | null;
    }
  | {
      expectedRevision: number;
      isCascade: boolean;
      kind: "disableOrganization" | "enableOrganization";
      publicId: string;
    }
  | {
      input: OrganizationMoveInput;
      kind: "moveOrganization";
      publicId: string;
    }
  | null;

type EmployeeImportInput = EmployeeImportCommandSubmitInput;

type EmployeeImportPreview = {
  activeOrgAuthCount: number;
  availableQuota: number | null;
  formatLabel: string;
  generatedPasswordRowCount: number;
  inheritedAuthorizationCategory:
    | "active_org_auth_available"
    | "no_active_org_auth"
    | "target_not_selected";
  isReady: boolean;
  message: string;
  quotaImpactCategory:
    | "quota_available"
    | "quota_insufficient"
    | "quota_unknown"
    | "target_not_selected";
  rowCount: number;
};

type EmployeeTransferReviewRow = {
  activeScopeCount: number;
  availableQuota: number;
  currentOrganizationName: string;
  employeeName: string;
  employeePublicId: string;
  reason: "quota_available" | "quota_insufficient" | "target_no_active_auth";
  targetOrganizationName: string;
  targetOrganizationPublicId: string;
};

type EmployeeConfirmationState =
  | {
      kind: "importEmployees";
      input: EmployeeImportInput;
    }
  | {
      kind: "unbindEmployee";
      publicId: string;
    }
  | {
      employeePublicId: string;
      kind: "transferEmployee";
      targetOrganizationPublicId: string;
    }
  | null;

type RedeemCodeConfirmationState = {
  kind: "generateRedeemCode";
  input: CreateRedeemCodeInput;
} | null;

type OrganizationMutationInput = {
  contactName: string | null;
  contactPhone: string | null;
  expectedRevision?: number;
  name: string;
  orgTier?: OrgTier;
  parentOrganizationPublicId?: string | null;
  remark: string | null;
};

type OrganizationMoveInput = {
  expectedRevision: number;
  parentOrganizationPublicId: string | null;
};

type ToastMessage = {
  message: string;
  tone: "error" | "success";
};

type GeneratedRedeemCodeSummary = RedeemCodeGenerationDto["generation"];
type GeneratedRedeemCodeDistribution = RedeemCodeGenerationDto["redeemCodes"];

const SESSION_TOKEN_STORAGE_KEY = "tiku.localSessionToken";
const COOKIE_BACKED_SESSION_TOKEN = "__cookie_backed_session__";
const DEFAULT_LIST_QUERY = "page=1&pageSize=20";
const ORGANIZATION_TREE_ROOT_KEY = "__root__";
const ORGANIZATION_TREE_PAGE_SIZE = 50;

const professionLabels = {
  logistics: "物流",
  marketing: "营销",
  monopoly: "专卖",
} satisfies Record<Profession, string>;

const orgAuthProfessionOptions: Profession[] = [
  "monopoly",
  "marketing",
  "logistics",
];

const orgAuthLevelOptions = ["1", "2", "3", "4", "5"] as const;

const orgTierLabels = {
  city: "地市",
  district: "县区",
  province: "省",
  station: "站点",
} satisfies Record<OrgTier, string>;

const childOrgTierByParentTier = {
  city: "district",
  district: "station",
  province: "city",
  station: null,
} satisfies Record<OrgTier, OrgTier | null>;

const authScopeTypeLabels = {
  current_and_descendants: "本级及下级",
  specified_nodes: "指定节点",
} satisfies Record<AuthScopeType, string>;

const authStatusLabels = {
  active: "生效中",
  cancelled: "已取消",
  expired: "已过期",
} satisfies Record<AuthStatus, string>;

const redeemCodeStatusLabels = {
  expired: "已过期",
  unused: "未使用",
  used: "已使用",
} satisfies Record<RedeemCodeStatus, string>;

const redeemCodeTypeLabels = {
  edition_upgrade: "升级卡密",
  personal_advanced_activation: "个人高级版开通",
  personal_standard_activation: "个人标准版开通",
} satisfies Record<RedeemCodeType, string>;

const redeemCodeRedactionReasonLabels = {
  code_hash_hidden_plaintext_role_allowed: "校验值已隐藏，明文已授权显示",
  plaintext_redeem_code_and_hash_hidden: "明文与校验值均已隐藏",
} satisfies Record<RedeemCodeDetailDto["redactionReason"], string>;

const editionLabels = {
  advanced: "高级版",
  standard: "标准版",
} satisfies Record<AuthorizationEdition, string>;

const upgradeStatusLabels = {
  active: "升级生效",
  expired: "升级过期",
  none: "无升级",
  revoked: "升级撤销",
} satisfies Record<AuthUpgradeStatus | "none", string>;

const userStatusLabels = {
  active: "正常",
  disabled: "已禁用",
} satisfies Record<UserStatus, string>;

const employeeImportInheritedAuthorizationLabels = {
  active_org_auth_available: "已发现目标组织有效企业授权",
  no_active_org_auth: "目标组织暂无有效企业授权",
  target_not_selected: "请先选择目标组织",
} satisfies Record<
  EmployeeImportPreview["inheritedAuthorizationCategory"],
  string
>;

const employeeImportQuotaImpactLabels = {
  quota_available: "授权额度足够",
  quota_insufficient: "授权额度不足，导入已阻断",
  quota_unknown: "暂无有效授权，无法计算额度影响",
  target_not_selected: "请先选择目标组织",
} satisfies Record<EmployeeImportPreview["quotaImpactCategory"], string>;

const employeeImportTemplateFileName = "employee-import-template.csv";
const employeeImportTemplateContent = "phone,name,initialPassword\n";

const employeeImportKnownHeaderNames = new Set([
  "phone",
  "name",
  "initialpassword",
]);

const forbiddenEmployeeImportScopeHeaderLabels = [
  { label: "profession", normalizedName: "profession" },
  { label: "level", normalizedName: "level" },
  { label: "subject", normalizedName: "subject" },
  { label: "edition", normalizedName: "edition" },
  {
    label: "orgAuthScopePublicId",
    normalizedName: "orgauthscopepublicid",
  },
  {
    label: "employeeAuthScopePublicId",
    normalizedName: "employeeauthscopepublicid",
  },
  { label: "organizationPublicId", normalizedName: "organizationpublicid" },
  { label: "userPublicId", normalizedName: "userpublicid" },
] as const;

const defaultOrgAuthFormState: OrgAuthFormState = {
  accountQuota: "100",
  authScopeType: "current_and_descendants",
  edition: "",
  expiresAt: "2027-05-25",
  levels: ["3"],
  name: "本地验证企业授权",
  organizationPublicIds: [],
  professions: ["monopoly"],
  purchaserOrganizationPublicId: "",
  startsAt: "2026-05-25",
};

const adminOrganizationTableCellClassName = "px-4 py-3";

const defaultRedeemCodeGenerationFormState: RedeemCodeGenerationFormState = {
  count: "1",
  durationDay: "365",
  generationMode: "single",
  level: "",
  profession: "",
  redeemCodeType: "",
  redeemDeadlineDate: "2026-06-24",
};

const defaultOrganizationFormState: OrganizationFormState = {
  contactName: "",
  contactPhone: "",
  expectedRevision: 1,
  mode: "create",
  name: "",
  orgTier: "province",
  parentOrganizationPublicId: "",
  publicId: null,
  remark: "",
};

const expectedParentTierByOrgTier = {
  city: "province",
  district: "city",
  province: null,
  station: "district",
} satisfies Record<OrgTier, OrgTier | null>;

const organizationDepthPaddingClassNames = [
  "pl-3",
  "pl-6",
  "pl-9",
  "pl-12",
] as const;

function getStoredSessionToken(): string | null {
  const sessionToken = localStorage.getItem(SESSION_TOKEN_STORAGE_KEY)?.trim();

  return sessionToken === "" || sessionToken === undefined
    ? COOKIE_BACKED_SESSION_TOKEN
    : sessionToken;
}

function createAdminAuthHeaders(sessionToken: string) {
  return {
    authorization: `Bearer ${sessionToken}`,
  };
}

async function fetchAdminApi<TData>(
  path: string,
  sessionToken: string,
): Promise<ApiResponse<TData | null>> {
  const response = await fetch(path, {
    credentials: "same-origin",
    headers: createAdminAuthHeaders(sessionToken),
  });

  return (await response.json()) as ApiResponse<TData | null>;
}

async function postAdminApi<TData>(
  path: string,
  sessionToken: string,
  body?: unknown,
): Promise<ApiResponse<TData | null>> {
  const response = await fetch(path, {
    body: body === undefined ? undefined : JSON.stringify(body),
    credentials: "same-origin",
    headers: {
      ...createAdminAuthHeaders(sessionToken),
      "content-type": "application/json",
    },
    method: "POST",
  });

  return (await response.json()) as ApiResponse<TData | null>;
}

async function patchAdminApi<TData>(
  path: string,
  sessionToken: string,
  body: unknown,
): Promise<ApiResponse<TData | null>> {
  const response = await fetch(path, {
    body: JSON.stringify(body),
    credentials: "same-origin",
    headers: {
      ...createAdminAuthHeaders(sessionToken),
      "content-type": "application/json",
    },
    method: "PATCH",
  });

  return (await response.json()) as ApiResponse<TData | null>;
}

function isUnauthorizedResponse(payload: ApiResponse<unknown>): boolean {
  return payload.code === 401001;
}

function isAdminContext(payload: AuthContextDto): boolean {
  return (
    payload.user.adminPublicId !== null &&
    (payload.user.adminRoles?.length ?? 0) > 0
  );
}

function formatDate(value: string | null): string {
  return value === null ? "未设置" : value.slice(0, 10);
}

function formatProfessionLevel(input: {
  profession: Profession;
  level: number;
}): string {
  return `${professionLabels[input.profession]} ${input.level}级`;
}

type EditionAwareOrgAuthView = {
  edition?: AuthorizationEdition;
  effectiveEdition?: AuthorizationEdition;
  upgradeStatus?: AuthUpgradeStatus | "none";
};

function readEditionAwareOrgAuthView(
  orgAuth: AdminOrgAuthData["orgAuths"][number],
): EditionAwareOrgAuthView {
  return orgAuth as AdminOrgAuthData["orgAuths"][number] &
    EditionAwareOrgAuthView;
}

function getOrgAuthEditionLabel(
  orgAuth: AdminOrgAuthData["orgAuths"][number],
): string {
  const editionAwareOrgAuth = readEditionAwareOrgAuthView(orgAuth);

  return editionLabels[
    editionAwareOrgAuth.effectiveEdition ??
      editionAwareOrgAuth.edition ??
      "standard"
  ];
}

function getOrgAuthUpgradeStatusLabel(
  orgAuth: AdminOrgAuthData["orgAuths"][number],
): string {
  return upgradeStatusLabels[
    readEditionAwareOrgAuthView(orgAuth).upgradeStatus ?? "none"
  ];
}

function createRedeemCodeListQuery(input: {
  keyword: string;
  query: Pick<AdminListQuery, "page" | "pageSize" | "sortBy" | "sortOrder">;
  status: RedeemCodeStatus | "all";
}): string {
  const searchParams = new URLSearchParams();
  const keyword = input.keyword.trim();

  searchParams.set("page", String(input.query.page));
  searchParams.set("pageSize", String(input.query.pageSize));
  searchParams.set("sortBy", input.query.sortBy);
  searchParams.set("sortOrder", input.query.sortOrder);

  if (input.status !== "all") {
    searchParams.set("status", input.status);
  }

  if (keyword.length > 0) {
    searchParams.set("keyword", keyword);
  }

  return searchParams.toString();
}

function createOrgAuthListQuery(input: {
  edition: AuthorizationEdition | "all";
  expiryStatus: OrgAuthExpiryStatus;
  keyword: string;
  level: number | "all";
  profession: Profession | "all";
  query: Pick<AdminListQuery, "page" | "pageSize" | "sortBy" | "sortOrder">;
  status: AuthStatus | "all";
}): string {
  const searchParams = new URLSearchParams();
  const keyword = input.keyword.trim();

  searchParams.set("page", `${input.query.page}`);
  searchParams.set("pageSize", `${input.query.pageSize}`);
  searchParams.set("sortBy", input.query.sortBy);
  searchParams.set("sortOrder", input.query.sortOrder);

  if (keyword.length > 0) {
    searchParams.set("keyword", keyword);
  }

  if (input.status !== "all") {
    searchParams.set("status", input.status);
  }

  if (input.edition !== "all") {
    searchParams.set("edition", input.edition);
  }

  if (input.profession !== "all") {
    searchParams.set("profession", input.profession);
  }

  if (input.level !== "all") {
    searchParams.set("level", `${input.level}`);
  }

  if (input.expiryStatus !== "all") {
    searchParams.set("expiryStatus", input.expiryStatus);
  }

  return searchParams.toString();
}

function createEmployeeListQuery(input: {
  keyword: string;
  organizationKeyword: string;
  query: Pick<AdminListQuery, "page" | "pageSize" | "sortBy" | "sortOrder">;
  status: UserStatus | "all";
}): string {
  const searchParams = new URLSearchParams();
  const keyword = input.keyword.trim();
  const organizationKeyword = input.organizationKeyword.trim();

  searchParams.set("page", `${input.query.page}`);
  searchParams.set("pageSize", `${input.query.pageSize}`);
  searchParams.set("sortBy", input.query.sortBy);
  searchParams.set("sortOrder", input.query.sortOrder);

  if (keyword.length > 0) {
    searchParams.set("keyword", keyword);
  }

  if (organizationKeyword.length > 0) {
    searchParams.set("organizationKeyword", organizationKeyword);
  }

  if (input.status !== "all") {
    searchParams.set("status", input.status);
  }

  return searchParams.toString();
}

function createFallbackOrgAuthPagination(
  query: Pick<AdminListQuery, "page" | "pageSize" | "sortBy" | "sortOrder">,
  total: number,
): ApiPagination {
  return {
    page: query.page,
    pageSize: query.pageSize,
    sortBy: query.sortBy,
    sortOrder: query.sortOrder,
    total,
  };
}

function createFallbackEmployeePagination(
  query: Pick<AdminListQuery, "page" | "pageSize" | "sortBy" | "sortOrder">,
  total: number,
): ApiPagination {
  return {
    page: query.page,
    pageSize: query.pageSize,
    sortBy: query.sortBy,
    sortOrder: query.sortOrder,
    total,
  };
}

function createFallbackRedeemCodePagination(
  query: Pick<AdminListQuery, "page" | "pageSize" | "sortBy" | "sortOrder">,
  total: number,
): ApiPagination {
  return {
    page: query.page,
    pageSize: query.pageSize,
    sortBy: query.sortBy,
    sortOrder: query.sortOrder,
    total,
  };
}

function toStartOfDayIso(dateValue: string): string {
  return `${dateValue}T00:00:00.000Z`;
}

function findFirstOrganizationPublicId(
  organizations: AdminOrgAuthData["organizations"],
): string {
  return organizations[0]?.publicId ?? "";
}

function createOrganizationDepthMap(
  organizations: AdminOrgAuthData["organizations"],
): Map<string, number> {
  const organizationByPublicId = new Map(
    organizations.map((organization) => [organization.publicId, organization]),
  );

  function readOrganizationDepth(
    publicId: string,
    visited: Set<string>,
  ): number {
    const organization = organizationByPublicId.get(publicId);

    if (
      organization === undefined ||
      organization.parentOrganizationPublicId === null ||
      visited.has(publicId)
    ) {
      return 0;
    }

    return (
      readOrganizationDepth(
        organization.parentOrganizationPublicId,
        new Set([...visited, publicId]),
      ) + 1
    );
  }

  return new Map(
    organizations.map((organization) => [
      organization.publicId,
      readOrganizationDepth(organization.publicId, new Set()),
    ]),
  );
}

function isOrganizationInCoverage(
  organization: AdminOrgAuthData["organizations"][number],
  purchaserOrganizationPublicId: string,
  organizationByPublicId: Map<
    string,
    AdminOrgAuthData["organizations"][number]
  >,
): boolean {
  if (organization.publicId === purchaserOrganizationPublicId) {
    return true;
  }

  const visitedPublicIds = new Set<string>();
  let parentOrganizationPublicId = organization.parentOrganizationPublicId;

  while (parentOrganizationPublicId !== null) {
    if (parentOrganizationPublicId === purchaserOrganizationPublicId) {
      return true;
    }

    if (visitedPublicIds.has(parentOrganizationPublicId)) {
      return false;
    }

    visitedPublicIds.add(parentOrganizationPublicId);
    parentOrganizationPublicId =
      organizationByPublicId.get(parentOrganizationPublicId)
        ?.parentOrganizationPublicId ?? null;
  }

  return false;
}

function selectOrgAuthCoverageOrganizations(
  formState: OrgAuthFormState,
  organizations: AdminOrgAuthData["organizations"],
  purchaserOrganizationPublicId: string,
): AdminOrgAuthData["organizations"] {
  if (purchaserOrganizationPublicId.length === 0) {
    return [];
  }

  if (formState.authScopeType === "specified_nodes") {
    return organizations.filter((organization) =>
      formState.organizationPublicIds.includes(organization.publicId),
    );
  }

  const organizationByPublicId = new Map(
    organizations.map((organization) => [organization.publicId, organization]),
  );

  return organizations.filter((organization) =>
    isOrganizationInCoverage(
      organization,
      purchaserOrganizationPublicId,
      organizationByPublicId,
    ),
  );
}

function buildOrgAuthInput(
  formState: OrgAuthFormState,
  organizations: AdminOrgAuthData["organizations"],
): { input: CreateOrgAuthInput | null; message: string | null } {
  const purchaserOrganizationPublicId =
    formState.purchaserOrganizationPublicId ||
    findFirstOrganizationPublicId(organizations);
  const name = formState.name.trim();
  const accountQuota = Number(formState.accountQuota);
  const edition = formState.edition;
  const levels = formState.levels
    .map((level) => Number(level))
    .filter((level) => Number.isInteger(level) && level > 0);
  const organizationPublicIds =
    formState.authScopeType === "specified_nodes"
      ? formState.organizationPublicIds
      : purchaserOrganizationPublicId.length === 0
        ? []
        : [purchaserOrganizationPublicId];

  if (name.length === 0) {
    return { input: null, message: "请填写授权名称。" };
  }

  if (purchaserOrganizationPublicId.length === 0) {
    return { input: null, message: "请选择购买主体。" };
  }

  if (!Number.isInteger(accountQuota) || accountQuota <= 0) {
    return { input: null, message: "账号额度必须为正整数。" };
  }

  if (edition === "") {
    return { input: null, message: "请选择授权版本。" };
  }

  if (formState.professions.length === 0) {
    return { input: null, message: "请选择至少一个专业。" };
  }

  if (levels.length === 0) {
    return { input: null, message: "请选择至少一个等级。" };
  }

  if (
    formState.startsAt.length === 0 ||
    formState.expiresAt.length === 0 ||
    formState.expiresAt <= formState.startsAt
  ) {
    return { input: null, message: "到期日期必须晚于开始日期。" };
  }

  if (
    formState.authScopeType === "specified_nodes" &&
    organizationPublicIds.length === 0
  ) {
    return { input: null, message: "请选择至少一个覆盖企业。" };
  }

  return {
    input: {
      accountQuota,
      authScopeType: formState.authScopeType,
      edition,
      expiresAt: toStartOfDayIso(formState.expiresAt),
      name,
      organizationPublicIds,
      purchaserOrganizationPublicId,
      scopeSelections: formState.professions.flatMap((profession) =>
        levels.map((level) => ({
          level,
          profession,
        })),
      ),
      startsAt: toStartOfDayIso(formState.startsAt),
    },
    message: null,
  };
}

function buildRedeemCodeGenerationInput(
  formState: RedeemCodeGenerationFormState,
): { input: CreateRedeemCodeInput | null; message: string | null } {
  const count =
    formState.generationMode === "single" ? 1 : Number(formState.count);
  const durationDay = Number(formState.durationDay);
  const level = Number(formState.level);
  const profession = formState.profession;
  const redeemCodeType = formState.redeemCodeType;
  const redeemDeadlineDate = formState.redeemDeadlineDate.trim();

  if (redeemCodeType === "") {
    return { input: null, message: "请选择卡密类型。" };
  }

  if (profession === "") {
    return { input: null, message: "请选择卡密授权专业。" };
  }

  if (!Number.isInteger(level) || level < 1 || level > 5) {
    return { input: null, message: "卡密授权等级必须为 1 到 5。" };
  }

  if (!Number.isInteger(count) || count < 1 || count > 100) {
    return { input: null, message: "卡密数量必须为 1 到 100。" };
  }

  if (!Number.isInteger(durationDay) || durationDay < 1 || durationDay > 1095) {
    return { input: null, message: "授权天数必须为 1 到 1095。" };
  }

  if (redeemDeadlineDate.length === 0) {
    return { input: null, message: "请选择卡密兑换截止日期。" };
  }

  return {
    input: {
      count,
      durationDay,
      level,
      profession,
      redeemCodeType,
      redeemDeadlineDate,
    },
    message: null,
  };
}

function maskRedeemCodeDisplay(codeDisplay: string): string {
  const normalizedCodeDisplay = codeDisplay.trim();

  if (normalizedCodeDisplay.length <= 4) {
    return "****";
  }

  return `${normalizedCodeDisplay.slice(0, 4)}****`;
}

function copyTextToClipboard(value: string): void {
  if (typeof navigator === "undefined" || navigator.clipboard === undefined) {
    return;
  }

  void navigator.clipboard.writeText(value);
}

function downloadEmployeeImportTemplate(): void {
  if (
    typeof document === "undefined" ||
    typeof URL === "undefined" ||
    typeof URL.createObjectURL !== "function"
  ) {
    return;
  }

  const objectUrl = URL.createObjectURL(
    new Blob([employeeImportTemplateContent], {
      type: "text/csv;charset=utf-8",
    }),
  );
  const anchor = document.createElement("a");

  anchor.href = objectUrl;
  anchor.download = employeeImportTemplateFileName;
  anchor.click();
  URL.revokeObjectURL(objectUrl);
}

function normalizeOptionalOrganizationText(value: string): string | null {
  const text = value.trim();

  return text.length === 0 ? null : text;
}

function normalizeEmployeeImportHeaderCell(value: string): string {
  return value
    .replace(/^\uFEFF/u, "")
    .trim()
    .toLowerCase()
    .replace(/[\s_-]+/gu, "");
}

function parseEmployeeImportDelimitedRows(
  value: string,
  delimiter: "," | "\t",
): string[][] | null {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let isQuoted = false;
  let didCloseQuote = false;

  for (let index = 0; index < value.length; index += 1) {
    const character = value[index];
    const nextCharacter = value[index + 1];

    if (character === '"') {
      if (isQuoted) {
        if (nextCharacter === '"') {
          cell += '"';
          index += 1;
        } else {
          isQuoted = false;
          didCloseQuote = true;
        }
      } else if (cell.length === 0 && !didCloseQuote) {
        isQuoted = true;
      } else {
        return null;
      }
      continue;
    }
    if (character === delimiter && !isQuoted) {
      row.push(cell.trim());
      cell = "";
      didCloseQuote = false;
      continue;
    }
    if ((character === "\n" || character === "\r") && !isQuoted) {
      row.push(cell.trim());
      if (row.some((rowCell) => rowCell.length > 0)) {
        rows.push(row);
      }
      row = [];
      cell = "";
      didCloseQuote = false;
      if (character === "\r" && nextCharacter === "\n") {
        index += 1;
      }
      continue;
    }
    if (didCloseQuote) {
      if (/\s/u.test(character)) {
        continue;
      }
      return null;
    }
    cell += character;
  }

  if (isQuoted) {
    return null;
  }

  row.push(cell.trim());
  if (row.some((rowCell) => rowCell.length > 0)) {
    rows.push(row);
  }

  return rows;
}

function findForbiddenEmployeeImportScopeHeaders(lines: string[]): string[] {
  const firstLine = lines[0] ?? "";
  const delimiter = firstLine.includes("\t") ? "\t" : ",";
  const firstHeaderNames = new Set(
    firstLine
      .split(delimiter)
      .map(normalizeEmployeeImportHeaderCell)
      .filter((name) => name.length > 0),
  );
  const forbiddenLabels = forbiddenEmployeeImportScopeHeaderLabels
    .filter(({ normalizedName }) => firstHeaderNames.has(normalizedName))
    .map(({ label }) => label);
  const looksLikeHeader =
    Array.from(firstHeaderNames).some((name) =>
      employeeImportKnownHeaderNames.has(name),
    ) || forbiddenLabels.length > 1;

  return looksLikeHeader ? forbiddenLabels : [];
}

function buildForbiddenEmployeeImportScopeHeaderMessage(
  forbiddenLabels: string[],
): string {
  return `员工导入模板不得包含 ${forbiddenLabels.join(", ")}；专业、等级、版本与授权范围必须从组织授权继承。`;
}

function summarizeEmployeeImportTargetAuth(input: {
  orgAuths: AdminOrgAuthData["orgAuths"];
  rowCount: number;
  targetOrganizationPublicId: string;
}): Pick<
  EmployeeImportPreview,
  | "activeOrgAuthCount"
  | "availableQuota"
  | "inheritedAuthorizationCategory"
  | "quotaImpactCategory"
> {
  const targetOrganizationPublicId = input.targetOrganizationPublicId.trim();

  if (targetOrganizationPublicId.length === 0) {
    return {
      activeOrgAuthCount: 0,
      availableQuota: null,
      inheritedAuthorizationCategory: "target_not_selected",
      quotaImpactCategory: "target_not_selected",
    };
  }

  const activeTargetOrgAuths = input.orgAuths.filter(
    (orgAuth) =>
      orgAuth.status === "active" &&
      orgAuth.organizationPublicIds.includes(targetOrganizationPublicId),
  );

  if (activeTargetOrgAuths.length === 0) {
    return {
      activeOrgAuthCount: 0,
      availableQuota: null,
      inheritedAuthorizationCategory: "no_active_org_auth",
      quotaImpactCategory: "quota_unknown",
    };
  }

  const availableQuota = Math.min(
    ...activeTargetOrgAuths.map((orgAuth) =>
      Math.max(orgAuth.accountQuota - orgAuth.usedQuota, 0),
    ),
  );

  return {
    activeOrgAuthCount: activeTargetOrgAuths.length,
    availableQuota,
    inheritedAuthorizationCategory: "active_org_auth_available",
    quotaImpactCategory:
      input.rowCount > availableQuota
        ? "quota_insufficient"
        : "quota_available",
  };
}

function buildOrganizationInput(
  formState: OrganizationFormState,
  organizations: AdminOrgAuthData["organizations"],
): {
  input: OrganizationMoveInput | OrganizationMutationInput | null;
  message: string | null;
} {
  const name = formState.name.trim();
  const parentOrganizationPublicId =
    formState.parentOrganizationPublicId.trim() || null;
  const expectedParentTier = expectedParentTierByOrgTier[formState.orgTier];
  const parentOrganization =
    parentOrganizationPublicId === null
      ? null
      : (organizations.find(
          (organization) =>
            organization.publicId === parentOrganizationPublicId,
        ) ?? null);

  if (formState.mode !== "move" && name.length === 0) {
    return { input: null, message: "请填写企业名称。" };
  }

  const profileInput = {
    contactName: normalizeOptionalOrganizationText(formState.contactName),
    contactPhone: normalizeOptionalOrganizationText(formState.contactPhone),
    name,
    remark: normalizeOptionalOrganizationText(formState.remark),
  };

  if (formState.mode === "update") {
    return {
      input: {
        ...profileInput,
        expectedRevision: formState.expectedRevision,
      },
      message: null,
    };
  }

  if (
    formState.publicId !== null &&
    parentOrganizationPublicId === formState.publicId
  ) {
    return { input: null, message: "父级组织不能选择当前企业。" };
  }

  if (expectedParentTier === null && parentOrganizationPublicId !== null) {
    return { input: null, message: "省不能设置父级组织。" };
  }

  if (
    expectedParentTier !== null &&
    parentOrganization?.orgTier !== expectedParentTier
  ) {
    return {
      input: null,
      message: `${orgTierLabels[formState.orgTier]}必须选择${orgTierLabels[expectedParentTier]}作为父级。`,
    };
  }

  if (formState.mode === "move") {
    return {
      input: {
        expectedRevision: formState.expectedRevision,
        parentOrganizationPublicId,
      },
      message: null,
    };
  }

  return {
    input: {
      ...profileInput,
      orgTier: formState.orgTier,
      parentOrganizationPublicId,
    },
    message: null,
  };
}

function buildEmployeeImportInput(
  value: string,
  targetOrganizationPublicId: string,
): {
  input: EmployeeImportInput | null;
  message: string | null;
} {
  const trimmedValue = value.trim();

  if (trimmedValue.length === 0) {
    return { input: null, message: "请填写员工导入内容。" };
  }

  const delimiter = trimmedValue.split(/\r?\n/u, 1)[0]?.includes("\t")
    ? "\t"
    : ",";
  const parsedRows = parseEmployeeImportDelimitedRows(trimmedValue, delimiter);

  if (parsedRows === null) {
    return { input: null, message: "员工导入内容包含无效或未闭合的引号。" };
  }

  const headerCells = parsedRows[0] ?? [];
  const forbiddenScopeHeaders = findForbiddenEmployeeImportScopeHeaders([
    headerCells.join(delimiter),
  ]);

  if (forbiddenScopeHeaders.length > 0) {
    return {
      input: null,
      message: buildForbiddenEmployeeImportScopeHeaderMessage(
        forbiddenScopeHeaders,
      ),
    };
  }

  if (targetOrganizationPublicId.trim().length === 0) {
    return { input: null, message: "请选择员工导入目标组织。" };
  }

  const headerNames = headerCells.map(normalizeEmployeeImportHeaderCell);
  const hasEmployeeAccountHeader =
    headerNames.includes("phone") && headerNames.includes("name");
  if (!hasEmployeeAccountHeader) {
    return {
      input: null,
      message:
        "员工账号导入必须包含 phone,name 表头；initialPassword 可选，并先选择目标组织。",
    };
  }

  const headerIndexByName = new Map(
    headerNames.map((headerName, index) => [headerName, index]),
  );

  return {
    input: {
      commandKind: "batch_import",
      organizationPublicId: targetOrganizationPublicId.trim(),
      rows: parsedRows.slice(1).map((cells) => {
        const valueFor = (name: string) =>
          cells[headerIndexByName.get(name) ?? -1]?.trim() ?? "";

        return {
          initialPassword: valueFor("initialpassword"),
          name: valueFor("name"),
          phone: valueFor("phone"),
        };
      }),
    },
    message: null,
  };
}

function buildEmployeeImportPreview(
  value: string,
  targetOrganizationPublicId: string,
  orgAuths: AdminOrgAuthData["orgAuths"],
): EmployeeImportPreview {
  const trimmedValue = value.trim();
  const emptyTargetAuthSummary = summarizeEmployeeImportTargetAuth({
    orgAuths,
    rowCount: 0,
    targetOrganizationPublicId,
  });

  if (trimmedValue.length === 0) {
    return {
      ...emptyTargetAuthSummary,
      formatLabel: "待输入",
      generatedPasswordRowCount: 0,
      isReady: false,
      message: "请粘贴员工导入内容。",
      rowCount: 0,
    };
  }

  const delimiter = trimmedValue.split(/\r?\n/u, 1)[0]?.includes("\t")
    ? "\t"
    : ",";
  const parsedRows = parseEmployeeImportDelimitedRows(trimmedValue, delimiter);

  if (parsedRows === null) {
    return {
      ...emptyTargetAuthSummary,
      formatLabel: "员工导入格式无效",
      generatedPasswordRowCount: 0,
      isReady: false,
      message: "员工导入内容包含无效或未闭合的引号。",
      rowCount: 0,
    };
  }

  const headerCells = parsedRows[0] ?? [];
  const forbiddenScopeHeaders = findForbiddenEmployeeImportScopeHeaders([
    headerCells.join(delimiter),
  ]);

  if (forbiddenScopeHeaders.length > 0) {
    return {
      ...emptyTargetAuthSummary,
      formatLabel: "员工导入范围字段被阻断",
      generatedPasswordRowCount: 0,
      isReady: false,
      message: buildForbiddenEmployeeImportScopeHeaderMessage(
        forbiddenScopeHeaders,
      ),
      rowCount: 0,
    };
  }

  const headerNames = headerCells.map(normalizeEmployeeImportHeaderCell);
  const hasEmployeeAccountHeader =
    headerNames.includes("phone") && headerNames.includes("name");
  const sourceFormat = delimiter === "\t" ? "TSV" : "CSV";
  const dataRows = hasEmployeeAccountHeader ? parsedRows.slice(1) : [];
  const rowCount = dataRows.length;
  const initialPasswordIndex = headerNames.indexOf("initialpassword");
  const generatedPasswordRowCount = hasEmployeeAccountHeader
    ? dataRows.filter(
        (row) =>
          initialPasswordIndex < 0 ||
          (row[initialPasswordIndex]?.trim() ?? "").length === 0,
      ).length
    : 0;

  const hasTargetOrganization = targetOrganizationPublicId.trim().length > 0;
  const targetAuthSummary = summarizeEmployeeImportTargetAuth({
    orgAuths,
    rowCount,
    targetOrganizationPublicId,
  });
  const message =
    rowCount <= 0
      ? hasEmployeeAccountHeader
        ? "请至少提供一行员工数据。"
        : "员工账号导入必须包含 phone,name 表头；initialPassword 可选。"
      : !hasTargetOrganization
        ? "请选择员工导入目标组织。"
        : targetAuthSummary.inheritedAuthorizationCategory !==
            "active_org_auth_available"
          ? "目标组织暂无有效企业授权，员工能力无法继承，导入已阻断。"
          : targetAuthSummary.quotaImpactCategory === "quota_insufficient"
            ? "目标组织可用授权额度不足，导入已阻断。"
            : `将按员工账号 ${sourceFormat} 解析 ${rowCount} 行员工，并导入到已选择的目标组织。`;

  return {
    ...targetAuthSummary,
    formatLabel: `员工账号 ${sourceFormat}`,
    generatedPasswordRowCount,
    isReady:
      rowCount > 0 &&
      hasTargetOrganization &&
      targetAuthSummary.inheritedAuthorizationCategory ===
        "active_org_auth_available" &&
      targetAuthSummary.quotaImpactCategory === "quota_available",
    message,
    rowCount,
  };
}

function mapOrganizationResultToListItem(
  organization: OrganizationResultDto["organization"],
  currentOrganization?: AdminOrgAuthData["organizations"][number],
): AdminOrgAuthData["organizations"][number] {
  return {
    authSummary: currentOrganization?.authSummary ?? null,
    employeeCount: currentOrganization?.employeeCount ?? 0,
    name: organization.name,
    orgTier: organization.orgTier,
    parentOrganizationPublicId: organization.parentOrganizationPublicId,
    publicId: organization.publicId,
    revision: organization.revision,
    status: organization.status,
  };
}

function formatOrgAuthErrorMessage(message: string): string {
  return message === "Org auth scope overlaps an existing active authorization."
    ? "所选企业范围、专业、等级、版本和有效期已存在生效授权；系统不会自动合并。请先选择续费接续、手动升级、替换或增量扩容等显式处理路径，再重新提交。"
    : message;
}

function getOrganizationDepthPaddingClassName(organizationDepth: number) {
  return (
    organizationDepthPaddingClassNames[
      Math.min(
        Math.max(organizationDepth, 0),
        organizationDepthPaddingClassNames.length - 1,
      )
    ] ?? organizationDepthPaddingClassNames[0]
  );
}

function AdminSurfaceStatus({
  action,
  description,
  icon,
  title,
}: {
  action?: React.ReactNode;
  description: string;
  icon: React.ReactNode;
  title: string;
}) {
  return (
    <main className="mx-auto flex min-h-[calc(100vh-8rem)] w-full max-w-xl flex-col items-center justify-center gap-4 px-6 text-center">
      <div className="bg-secondary text-secondary-foreground flex size-11 items-center justify-center rounded-full">
        {icon}
      </div>
      <div className="space-y-2">
        <h1 className="font-heading text-text-primary text-xl font-semibold">
          {title}
        </h1>
        <p className="text-text-secondary text-sm leading-6">{description}</p>
      </div>
      {action}
    </main>
  );
}

function AdminLoadingState({ label }: { label: string }) {
  return (
    <main className="space-y-4">
      <div className="text-text-secondary flex items-center gap-2 text-sm">
        <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />
        {label}
      </div>
      <div className="grid gap-4 xl:grid-cols-3">
        {[0, 1, 2].map((itemIndex) => (
          <div
            key={itemIndex}
            className="bg-surface ring-border rounded-md p-4 shadow-sm ring-1"
          >
            <div className="bg-border h-4 w-2/3 animate-pulse rounded" />
            <div className="bg-border mt-3 h-3 w-1/2 animate-pulse rounded" />
            <div className="bg-border mt-5 h-14 w-full animate-pulse rounded-md" />
          </div>
        ))}
      </div>
    </main>
  );
}

function AdminUnauthorizedState() {
  return (
    <AdminSurfaceStatus
      title="请先登录后台"
      description="后台数据需要有效的管理员会话，请登录后再查看。"
      icon={<AlertCircle className="size-5" aria-hidden="true" />}
      action={
        <Link
          href="/login"
          className="bg-primary text-primary-foreground flex h-9 items-center justify-center rounded-lg px-4 text-sm font-medium transition-transform active:scale-[0.98]"
        >
          前往登录
        </Link>
      }
    />
  );
}

function AdminErrorState({
  description,
  title,
}: {
  description: string;
  title: string;
}) {
  return (
    <AdminSurfaceStatus
      title={title}
      description={description}
      icon={<AlertCircle className="size-5" aria-hidden="true" />}
    />
  );
}

function AdminEmptyState({
  description,
  title,
}: {
  description: string;
  title: string;
}) {
  return (
    <AdminSurfaceStatus
      title={title}
      description={description}
      icon={<CheckCircle2 className="size-5" aria-hidden="true" />}
    />
  );
}

function AdminPageHeader({
  description,
  icon,
  title,
}: {
  description: string;
  icon: React.ReactNode;
  title: string;
}) {
  return (
    <header className="flex flex-col gap-4">
      <div className="flex items-start gap-3">
        <div className="bg-secondary text-secondary-foreground flex size-11 shrink-0 items-center justify-center rounded-full">
          {icon}
        </div>
        <div className="space-y-1">
          <p className="text-brand-primary text-sm font-medium">运营后台</p>
          <h1 className="font-heading text-text-primary text-2xl font-semibold">
            {title}
          </h1>
          <p className="text-text-secondary max-w-2xl text-sm leading-6">
            {description}
          </p>
        </div>
      </div>
    </header>
  );
}

function SummaryTile({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="bg-surface ring-border rounded-md p-4 shadow-sm ring-1">
      <div className="text-text-secondary flex items-center gap-2 text-sm">
        {icon}
        {label}
      </div>
      <p className="font-heading text-text-primary mt-3 text-2xl font-semibold">
        {value}
      </p>
    </div>
  );
}

function OperationsOrgAuthSummaryFirstBand({
  employees,
  organizations,
  orgAuths,
}: {
  employees: AdminOrgAuthData["employees"];
  organizations: AdminOrgAuthData["organizations"];
  orgAuths: AdminOrgAuthData["orgAuths"];
}) {
  const totalEmployeeCount = employees.length;
  const activeStandardCount = orgAuths.filter((orgAuth) => {
    const editionView = readEditionAwareOrgAuthView(orgAuth);

    return (
      orgAuth.status === "active" &&
      (editionView.effectiveEdition ?? editionView.edition ?? "standard") ===
        "standard"
    );
  }).length;
  const activeAdvancedCount = orgAuths.filter((orgAuth) => {
    const editionView = readEditionAwareOrgAuthView(orgAuth);

    return (
      orgAuth.status === "active" &&
      (editionView.effectiveEdition ?? editionView.edition ?? "standard") ===
        "advanced"
    );
  }).length;
  const disabledOrganizationCount = organizations.filter(
    (organization) => organization.status === "disabled",
  ).length;

  return (
    <section
      aria-label="企业管理摘要"
      className="bg-surface border-border rounded-md border p-4 shadow-sm"
      data-testid="ops-org-auth-summary-first-band"
    >
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-1">
          <p className="text-brand-primary text-xs font-medium">企业管理概览</p>
          <h2 className="text-text-primary text-base font-semibold">
            组织、授权与员工总览
          </h2>
          <p className="text-text-secondary text-sm leading-6">
            先确认组织层级、授权版本、额度和员工规模，再进入对应任务视图；系统不会自动升级、续费、扩容或合并重叠授权。
          </p>
        </div>
        <span className="bg-secondary text-secondary-foreground w-fit rounded-lg px-2 py-1 text-xs font-medium">
          运营管理员
        </span>
      </div>
      <div className="mt-4 grid gap-4 xl:grid-cols-3" aria-label="企业授权摘要">
        <SummaryTile
          icon={<Building2 className="size-4" aria-hidden="true" />}
          label="企业组织"
          value={`${organizations.length}`}
        />
        <SummaryTile
          icon={<ShieldCheck className="size-4" aria-hidden="true" />}
          label="标准版 / 高级版"
          value={`${activeStandardCount} / ${activeAdvancedCount}`}
        />
        <SummaryTile
          icon={<UsersRound className="size-4" aria-hidden="true" />}
          label="组织员工"
          value={`${totalEmployeeCount}`}
        />
      </div>
      <p className="text-text-muted mt-3 text-xs leading-5">
        空态、错误态和禁用态保持可见；当前禁用态组织 {disabledOrganizationCount}{" "}
        个，新增授权按钮只提交公开编号和版本字段。
      </p>
    </section>
  );
}

function OrganizationTreeGuidancePanel() {
  const guidanceItems = [
    {
      label: "平台维护",
      title: "组织树写操作由平台处理",
      description:
        "运营可新增、编辑、停用和启用企业节点；组织管理员首期只能查看自身范围内的组织结构、员工状态和授权状态。",
    },
    {
      label: "继承授权",
      title: "员工范围从节点授权继承",
      description:
        "员工不在导入或资料里单独分配专业、等级或版本；可见内容由所在企业节点及覆盖该节点的有效企业授权计算。",
    },
    {
      label: "移动限制",
      title: "节点移动仅超级管理员",
      description:
        "首期不在普通运营表单提供移动企业组织按钮；需要调整父子关系时由超级管理员走受控流程，避免影响授权、额度和员工可见范围。",
    },
  ];

  return (
    <section
      className="bg-surface border-border rounded-md border p-4 shadow-sm"
      data-testid="organization-tree-guidance"
    >
      <div className="space-y-1">
        <p className="text-brand-primary text-xs font-medium">组织树说明</p>
        <h2 className="text-text-primary text-base font-semibold">
          组织树权限说明
        </h2>
        <p className="text-text-secondary text-sm leading-6">
          组织树用于表达真实企业层级，授权是覆盖这些节点的独立记录；停用节点会影响企业授权内容使用，但不会删除企业、员工或学习记录。
        </p>
      </div>
      <div className="mt-4 grid gap-3 lg:grid-cols-3">
        {guidanceItems.map((item) => (
          <div
            key={item.title}
            className="bg-background border-border rounded-md border p-3"
          >
            <p className="text-brand-primary text-xs font-medium">
              {item.label}
            </p>
            <h3 className="text-text-primary mt-1 text-sm font-semibold">
              {item.title}
            </h3>
            <p className="text-text-secondary mt-2 text-sm leading-6">
              {item.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

function isOpsOrganizationManagementView(
  view: string | null,
): view is OpsOrganizationManagementView {
  return opsOrganizationManagementViewIds.includes(
    view as OpsOrganizationManagementView,
  );
}

function readOpsOrganizationManagementViewFromLocation(): OpsOrganizationManagementView {
  if (typeof window === "undefined") {
    return defaultOpsOrganizationManagementView;
  }

  const view = new URLSearchParams(window.location.search).get("view");

  return isOpsOrganizationManagementView(view)
    ? view
    : defaultOpsOrganizationManagementView;
}

function writeOpsOrganizationManagementViewToLocation(
  view: OpsOrganizationManagementView,
) {
  if (typeof window === "undefined") {
    return;
  }

  const searchParams = new URLSearchParams(window.location.search);

  if (view === defaultOpsOrganizationManagementView) {
    searchParams.delete("view");
  } else {
    searchParams.set("view", view);
  }

  const nextSearch = searchParams.toString();
  window.history.replaceState(
    window.history.state,
    "",
    `${window.location.pathname}${nextSearch.length === 0 ? "" : `?${nextSearch}`}${window.location.hash}`,
  );
}

function OpsOrganizationManagementViewTabs({
  activeView,
  employees,
  onViewChange,
  organizations,
  orgAuths,
}: {
  activeView: OpsOrganizationManagementView;
  employees: AdminOrgAuthData["employees"];
  onViewChange: (view: OpsOrganizationManagementView) => void;
  organizations: AdminOrgAuthData["organizations"];
  orgAuths: AdminOrgAuthData["orgAuths"];
}) {
  const viewItems = [
    {
      description: "维护省、地市、县区、站点四级结构",
      icon: <Building2 className="size-4" aria-hidden="true" />,
      id: "organization-tree",
      metric: `${organizations.length} 个组织`,
      testId: "ops-organization-view-organization-tree",
      title: "组织架构",
    },
    {
      description: "新增、复核、取消企业授权",
      icon: <ShieldCheck className="size-4" aria-hidden="true" />,
      id: "org-auth",
      metric: `${orgAuths.length} 条授权`,
      testId: "ops-organization-view-org-auth",
      title: "企业授权",
    },
    {
      description: "员工导入、转移、解绑影响复核",
      icon: <UsersRound className="size-4" aria-hidden="true" />,
      id: "employees",
      metric: `${employees.length} 名员工`,
      testId: "ops-organization-view-employees",
      title: "员工运营",
    },
  ] satisfies {
    description: string;
    icon: React.ReactNode;
    id: OpsOrganizationManagementView;
    metric: string;
    testId: string;
    title: string;
  }[];

  return (
    <section
      aria-label="企业管理任务视图"
      className="bg-surface border-border rounded-md border p-3 shadow-sm"
      data-testid="ops-organization-management-view-tabs"
    >
      <div className="grid gap-2 lg:grid-cols-3">
        {viewItems.map((item) => {
          const isActive = item.id === activeView;

          return (
            <button
              key={item.id}
              type="button"
              aria-pressed={isActive}
              className={
                isActive
                  ? "border-brand-primary bg-secondary text-text-primary flex min-h-24 items-start gap-3 rounded-md border p-3 text-left shadow-sm"
                  : "border-border bg-background text-text-secondary hover:bg-muted flex min-h-24 items-start gap-3 rounded-md border p-3 text-left transition-transform active:scale-[0.99]"
              }
              data-testid={item.testId}
              onClick={() => onViewChange(item.id)}
            >
              <span
                className={
                  isActive
                    ? "bg-primary text-primary-foreground flex size-8 shrink-0 items-center justify-center rounded-md"
                    : "bg-muted text-text-secondary flex size-8 shrink-0 items-center justify-center rounded-md"
                }
              >
                {item.icon}
              </span>
              <span className="min-w-0 space-y-1">
                <span className="block text-sm font-semibold">
                  {item.title}
                </span>
                <span className="text-text-muted block text-xs">
                  {item.metric}
                </span>
                <span className="block text-xs leading-5">
                  {item.description}
                </span>
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}

function OrgAuthOverlapClosureGuidance() {
  const closureActions = [
    {
      label: "续费接续",
      description: "创建与原授权首尾衔接的新授权，让旧授权自然到期后接续生效。",
    },
    {
      label: "手动升级",
      description: "由运营记录标准版到高级版的受控升级，不覆写原始授权版本。",
    },
    {
      label: "替换授权",
      description: "在受控流程中取消或替换旧授权，再创建新的覆盖范围和有效期。",
    },
    {
      label: "增量扩容",
      description: "仅对同一有效原子范围增加额度，不改变覆盖范围或有效期语义。",
    },
  ];

  return (
    <div
      className="border-border bg-background rounded-md border p-3"
      data-testid="org-auth-overlap-closure-guidance"
    >
      <div className="space-y-1">
        <p className="text-brand-primary text-xs font-medium">重叠处理</p>
        <h3 className="text-text-primary text-sm font-semibold">
          重叠授权必须显式闭环
        </h3>
        <p className="text-text-muted text-xs leading-5">
          同一企业、专业、等级、版本和有效期形成重叠时默认阻断；系统不会自动续费、自动升级、自动替换或自动合并。
        </p>
      </div>
      <div className="mt-3 grid gap-2 md:grid-cols-2 xl:grid-cols-4">
        {closureActions.map((action) => (
          <div
            key={action.label}
            className="border-border bg-surface rounded-md border p-3"
          >
            <p className="text-text-primary text-sm font-medium">
              {action.label}
            </p>
            <p className="text-text-secondary mt-2 text-xs leading-5">
              {action.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

function OrgAuthAtomicScopePreview({
  coverageOrganizations,
  formState,
}: {
  coverageOrganizations: AdminOrgAuthData["organizations"];
  formState: OrgAuthFormState;
}) {
  const editionLabel =
    formState.edition === ""
      ? "请选择授权版本"
      : editionLabels[formState.edition];
  const atomicScopeRows = formState.professions.flatMap((profession) =>
    formState.levels.map((level) => ({
      level,
      profession,
    })),
  );
  const quotaLabel =
    formState.accountQuota.trim().length === 0
      ? "待填写额度"
      : `${formState.accountQuota.trim()}人`;
  const coverageRows =
    coverageOrganizations.length === 0 ? [] : coverageOrganizations;

  return (
    <div
      className="border-border bg-background rounded-md border p-3"
      data-testid="org-auth-atomic-scope-preview"
    >
      <div className="flex flex-col gap-2 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-1">
          <p className="text-brand-primary text-xs font-medium">范围预览</p>
          <h3 className="text-text-primary text-sm font-semibold">
            原子范围预览
          </h3>
          <p className="text-text-muted text-xs leading-5">
            页面可以按授权包展示；保存、冲突校验、额度占用和审计仍按每个企业节点加专业、等级、版本拆分计算。
          </p>
        </div>
        <span className="bg-secondary text-secondary-foreground w-fit rounded-lg px-2 py-1 text-xs font-medium">
          {coverageRows.length} 个企业节点 / {atomicScopeRows.length}{" "}
          个原子专业等级
        </span>
      </div>

      {coverageRows.length === 0 || atomicScopeRows.length === 0 ? (
        <p className="text-text-muted mt-3 text-sm">
          请选择购买主体、覆盖企业、专业和等级后查看原子范围。
        </p>
      ) : (
        <div className="mt-3 grid gap-2 md:grid-cols-2 xl:grid-cols-3">
          {coverageRows.map((organization) => (
            <div
              key={organization.publicId}
              className="border-border bg-surface rounded-md border p-3"
            >
              <p className="text-text-primary text-sm font-medium">
                {organization.name}
              </p>
              <div className="text-text-secondary mt-2 flex flex-wrap gap-1 text-xs">
                {atomicScopeRows.map((atomicScopeRow) => (
                  <span
                    key={`${atomicScopeRow.profession}-${atomicScopeRow.level}`}
                    className="border-border bg-background rounded-md border px-2 py-1"
                  >
                    {professionLabels[atomicScopeRow.profession]}{" "}
                    {atomicScopeRow.level}级
                  </span>
                ))}
              </div>
              <p className="text-text-muted mt-1 text-xs">
                {editionLabel} /{" "}
                {formatDate(toStartOfDayIso(formState.startsAt))} 至{" "}
                {formatDate(toStartOfDayIso(formState.expiresAt))} / 额度{" "}
                {quotaLabel}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function OrganizationTreeBranch({
  data,
  depth,
  expandedPublicIds,
  parentPublicId,
  selectedPublicId,
  onLoadMore,
  onSelect,
  onToggleNode,
}: {
  data: OrganizationTreeData;
  depth: number;
  expandedPublicIds: Set<string>;
  parentPublicId: string | null;
  selectedPublicId: string | null;
  onLoadMore: (publicId: string | null) => void;
  onSelect: (publicId: string) => void;
  onToggleNode: (publicId: string) => void;
}) {
  const branchKey = parentPublicId ?? ORGANIZATION_TREE_ROOT_KEY;
  const branch = data.branches[branchKey];
  const nodes = (branch?.publicIds ?? []).flatMap((publicId) => {
    const node = data.nodesByPublicId[publicId];

    return node === undefined ? [] : [node];
  });

  return (
    <div role={depth === 0 ? undefined : "group"}>
      {nodes.map((node) => {
        const isExpanded = expandedPublicIds.has(node.publicId);
        const isSelected = selectedPublicId === node.publicId;

        return (
          <div key={node.publicId}>
            <div
              aria-expanded={node.childCount > 0 ? isExpanded : undefined}
              aria-selected={isSelected}
              className={`text-left ${getOrganizationDepthPaddingClassName(depth)}`}
              data-public-id={node.publicId}
              data-testid={`admin-organization-${node.publicId}`}
              role="treeitem"
            >
              <div
                className={`border-border flex min-h-12 items-center gap-2 border-b px-2 py-2 ${
                  isSelected ? "bg-secondary" : "hover:bg-muted/60"
                }`}
              >
                {node.childCount > 0 ? (
                  <button
                    aria-label={isExpanded ? "收起" : "展开"}
                    className="text-text-secondary hover:text-text-primary inline-flex size-7 shrink-0 items-center justify-center rounded-md transition-transform active:scale-[0.98]"
                    type="button"
                    onClick={() => onToggleNode(node.publicId)}
                  >
                    {isExpanded ? (
                      <ChevronDown className="size-4" aria-hidden="true" />
                    ) : (
                      <ChevronRight className="size-4" aria-hidden="true" />
                    )}
                  </button>
                ) : (
                  <span className="size-7 shrink-0" aria-hidden="true" />
                )}
                <button
                  aria-label={`选择 ${node.name}`}
                  className="min-w-0 flex-1 text-left transition-transform active:scale-[0.99]"
                  type="button"
                  onClick={() => onSelect(node.publicId)}
                >
                  <span className="text-text-primary block truncate text-sm font-medium">
                    {node.name}
                  </span>
                  <span className="text-text-muted mt-0.5 block text-xs">
                    {orgTierLabels[node.orgTier]} /{" "}
                    {node.status === "active" ? "启用" : "停用"} / 直属员工{" "}
                    {node.employeeCount}
                  </span>
                </button>
                <button
                  aria-label={`查看${node.name}详情`}
                  className="border-border bg-background hover:bg-muted inline-flex size-8 shrink-0 items-center justify-center rounded-md border transition-transform active:scale-[0.98]"
                  type="button"
                  onClick={() => onSelect(node.publicId)}
                >
                  <Eye className="size-4" aria-hidden="true" />
                </button>
              </div>
            </div>
            {isExpanded ? (
              <OrganizationTreeBranch
                data={data}
                depth={depth + 1}
                expandedPublicIds={expandedPublicIds}
                parentPublicId={node.publicId}
                selectedPublicId={selectedPublicId}
                onLoadMore={onLoadMore}
                onSelect={onSelect}
                onToggleNode={onToggleNode}
              />
            ) : null}
          </div>
        );
      })}
      {branch !== undefined && branch.publicIds.length < branch.total ? (
        <button
          className="text-brand-primary hover:text-brand-primary/80 mt-2 ml-9 text-sm font-medium transition-transform active:scale-[0.98]"
          type="button"
          onClick={() => onLoadMore(parentPublicId)}
        >
          加载更多下级组织
        </button>
      ) : null}
    </div>
  );
}

function OrganizationTreeWorkspace({
  canMoveOrganization,
  data,
  expandedPublicIds,
  isFilteredSearch,
  keyword,
  loadState,
  orgTier,
  selectedPublicId,
  status,
  onCreateChild,
  onCreateRoot,
  onDisable,
  onEdit,
  onEnable,
  onKeywordChange,
  onLoadMore,
  onMove,
  onOrgTierChange,
  onResetFilters,
  onSelect,
  onStatusChange,
  onToggleNode,
}: {
  canMoveOrganization: boolean;
  data: OrganizationTreeData;
  expandedPublicIds: Set<string>;
  isFilteredSearch: boolean;
  keyword: string;
  loadState: OrganizationTreeLoadState;
  orgTier: OrgTier | "all";
  selectedPublicId: string | null;
  status: UserStatus | "all";
  onCreateChild: (node: OrganizationTreeQueryNodeDto) => void;
  onCreateRoot: () => void;
  onDisable: (node: OrganizationTreeQueryNodeDto) => void;
  onEdit: (node: OrganizationTreeQueryNodeDto) => void;
  onEnable: (node: OrganizationTreeQueryNodeDto) => void;
  onKeywordChange: (value: string) => void;
  onLoadMore: (publicId: string | null) => void;
  onMove: (node: OrganizationTreeQueryNodeDto) => void;
  onOrgTierChange: (value: OrgTier | "all") => void;
  onResetFilters: () => void;
  onSelect: (publicId: string) => void;
  onStatusChange: (value: UserStatus | "all") => void;
  onToggleNode: (publicId: string) => void;
}) {
  const rootBranch = data.branches[ORGANIZATION_TREE_ROOT_KEY];
  const rootNodes = (rootBranch?.publicIds ?? []).flatMap((publicId) => {
    const node = data.nodesByPublicId[publicId];

    return node === undefined ? [] : [node];
  });
  const selectedNode =
    selectedPublicId === null
      ? null
      : (data.nodesByPublicId[selectedPublicId] ?? null);

  return (
    <section className="space-y-4" aria-label="组织架构工作区">
      <div className="bg-surface border-border rounded-md border p-4 shadow-sm">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-end xl:justify-between">
          <div className="grid flex-1 gap-3 md:grid-cols-2 xl:grid-cols-[minmax(16rem,1fr)_10rem_10rem_auto]">
            <label className="text-text-secondary flex flex-col gap-1.5 text-sm font-medium">
              <span>搜索企业组织</span>
              <div className="relative">
                <Search
                  className="text-text-muted pointer-events-none absolute top-2.5 left-3 size-4"
                  aria-hidden="true"
                />
                <input
                  aria-label="搜索企业组织"
                  className="border-border bg-background h-9 w-full rounded-md border pr-3 pl-9 text-sm"
                  placeholder="输入企业组织名称"
                  value={keyword}
                  onChange={(event) => onKeywordChange(event.target.value)}
                />
              </div>
            </label>
            <label className="text-text-secondary flex flex-col gap-1.5 text-sm font-medium">
              <span>组织层级</span>
              <select
                aria-label="组织层级"
                className="border-border bg-background h-9 rounded-md border px-3 text-sm"
                value={orgTier}
                onChange={(event) =>
                  onOrgTierChange(event.target.value as OrgTier | "all")
                }
              >
                <option value="all">全部层级</option>
                <option value="province">省</option>
                <option value="city">地市</option>
                <option value="district">县区</option>
                <option value="station">站点</option>
              </select>
            </label>
            <label className="text-text-secondary flex flex-col gap-1.5 text-sm font-medium">
              <span>组织状态</span>
              <select
                aria-label="组织状态"
                className="border-border bg-background h-9 rounded-md border px-3 text-sm"
                value={status}
                onChange={(event) =>
                  onStatusChange(event.target.value as UserStatus | "all")
                }
              >
                <option value="all">全部状态</option>
                <option value="active">启用</option>
                <option value="disabled">停用</option>
              </select>
            </label>
            <button
              className="border-border bg-background hover:bg-muted h-9 rounded-md border px-3 text-sm font-medium transition-transform active:scale-[0.98]"
              type="button"
              onClick={onResetFilters}
            >
              重置筛选
            </button>
          </div>
          <button
            className="bg-primary text-primary-foreground inline-flex h-9 items-center justify-center gap-2 rounded-md px-3 text-sm font-medium transition-transform active:scale-[0.98]"
            type="button"
            onClick={onCreateRoot}
          >
            <PlusCircle className="size-4" aria-hidden="true" />
            新增省级组织
          </button>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(22rem,0.9fr)_minmax(28rem,1.1fr)]">
        <section
          className="bg-surface border-border min-h-[24rem] rounded-md border shadow-sm"
          aria-label="企业组织树"
        >
          <header className="border-border border-b p-4">
            <h2 className="text-text-primary text-base font-semibold">
              {isFilteredSearch ? "筛选结果" : "企业组织树"}
            </h2>
            <p className="text-text-muted mt-1 text-sm">
              {isFilteredSearch
                ? `共 ${rootBranch?.total ?? 0} 个匹配组织，路径用于确认所属层级。`
                : "按省、地市、县区、站点逐级展开；不支持拖拽移动。"}
            </p>
          </header>
          {loadState === "loading" ? (
            <p
              className="text-text-muted p-6 text-center text-sm"
              role="status"
            >
              正在加载企业组织树
            </p>
          ) : null}
          {loadState === "error" ? (
            <p
              className="text-destructive p-6 text-center text-sm"
              role="alert"
            >
              企业组织树加载失败，请稍后重试。
            </p>
          ) : null}
          {loadState === "ready" && rootNodes.length === 0 ? (
            <p className="text-text-muted p-6 text-center text-sm">
              {isFilteredSearch
                ? "没有符合筛选条件的企业组织。"
                : "暂无企业组织，可先新增省级组织。"}
            </p>
          ) : null}
          {loadState === "ready" && rootNodes.length > 0 ? (
            <div aria-label="企业组织树" className="pb-3" role="tree">
              {isFilteredSearch ? (
                <div>
                  {rootNodes.map((node) => (
                    <button
                      aria-selected={selectedPublicId === node.publicId}
                      key={node.publicId}
                      className={`border-border hover:bg-muted block w-full border-b px-4 py-3 text-left transition-transform active:scale-[0.99] ${
                        selectedPublicId === node.publicId ? "bg-secondary" : ""
                      }`}
                      role="treeitem"
                      type="button"
                      onClick={() => onSelect(node.publicId)}
                    >
                      <span className="text-text-primary block text-sm font-medium">
                        {[
                          ...node.ancestorPath.map((item) => item.name),
                          node.name,
                        ].join(" / ")}
                      </span>
                      <span className="text-text-muted mt-1 block text-xs">
                        {orgTierLabels[node.orgTier]} /{" "}
                        {node.status === "active" ? "启用" : "停用"} / 直属员工{" "}
                        {node.employeeCount}
                      </span>
                    </button>
                  ))}
                  {rootBranch !== undefined &&
                  rootBranch.publicIds.length < rootBranch.total ? (
                    <button
                      className="text-brand-primary m-3 text-sm font-medium transition-transform active:scale-[0.98]"
                      type="button"
                      onClick={() => onLoadMore(null)}
                    >
                      加载更多筛选结果
                    </button>
                  ) : null}
                </div>
              ) : (
                <OrganizationTreeBranch
                  data={data}
                  depth={0}
                  expandedPublicIds={expandedPublicIds}
                  parentPublicId={null}
                  selectedPublicId={selectedPublicId}
                  onLoadMore={onLoadMore}
                  onSelect={onSelect}
                  onToggleNode={onToggleNode}
                />
              )}
            </div>
          ) : null}
        </section>

        <section
          aria-label="组织节点详情"
          className="bg-surface border-border min-h-[24rem] rounded-md border p-4 shadow-sm"
          data-public-id={selectedNode?.publicId}
          data-testid={
            selectedNode === null
              ? undefined
              : `admin-organization-detail-${selectedNode.publicId}`
          }
        >
          {selectedNode === null ? (
            <div className="flex min-h-[20rem] flex-col items-center justify-center text-center">
              <Building2
                className="text-text-muted size-8"
                aria-hidden="true"
              />
              <h2 className="text-text-primary mt-3 text-base font-semibold">
                选择一个企业组织
              </h2>
              <p className="text-text-muted mt-1 max-w-md text-sm">
                选择左侧节点后查看完整路径、直属规模、授权摘要和可执行操作。
              </p>
            </div>
          ) : (
            <div className="space-y-5">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <p className="text-brand-primary text-xs font-medium">
                    当前组织
                  </p>
                  <h2 className="text-text-primary mt-1 text-lg font-semibold">
                    {selectedNode.name}
                  </h2>
                  <p className="text-text-muted mt-1 text-sm">
                    {[
                      ...selectedNode.ancestorPath.map((item) => item.name),
                      selectedNode.name,
                    ].join(" / ")}
                  </p>
                </div>
                <span className="bg-secondary text-secondary-foreground w-fit rounded-md px-2 py-1 text-xs font-medium">
                  {orgTierLabels[selectedNode.orgTier]} /{" "}
                  {selectedNode.status === "active" ? "启用" : "停用"}
                </span>
              </div>
              <dl className="grid gap-3 sm:grid-cols-2">
                <div className="border-border rounded-md border p-3">
                  <dt className="text-text-muted text-xs">直属员工</dt>
                  <dd className="text-text-primary mt-1 text-base font-semibold">
                    {selectedNode.employeeCount}
                  </dd>
                </div>
                <div className="border-border rounded-md border p-3">
                  <dt className="text-text-muted text-xs">直属下级</dt>
                  <dd className="text-text-primary mt-1 text-base font-semibold">
                    {selectedNode.childCount}
                  </dd>
                </div>
                <div className="border-border rounded-md border p-3 sm:col-span-2">
                  <dt className="text-text-muted text-xs">授权摘要</dt>
                  <dd className="text-text-primary mt-1 text-sm">
                    {selectedNode.authSummary ??
                      "暂无直接授权摘要，请核对上级或指定范围继承。"}
                  </dd>
                </div>
              </dl>
              <div className="border-border flex flex-wrap gap-2 border-t pt-4">
                {childOrgTierByParentTier[selectedNode.orgTier] ===
                null ? null : (
                  <button
                    className="bg-primary text-primary-foreground inline-flex h-9 items-center gap-2 rounded-md px-3 text-sm font-medium transition-transform active:scale-[0.98]"
                    data-testid={`organization-create-child-${selectedNode.publicId}`}
                    type="button"
                    onClick={() => onCreateChild(selectedNode)}
                  >
                    <PlusCircle className="size-4" aria-hidden="true" />
                    新增下级组织
                  </button>
                )}
                <button
                  className="border-border bg-background hover:bg-muted inline-flex h-9 items-center gap-2 rounded-md border px-3 text-sm font-medium transition-transform active:scale-[0.98]"
                  data-testid={`organization-edit-${selectedNode.publicId}`}
                  type="button"
                  onClick={() => onEdit(selectedNode)}
                >
                  <Pencil className="size-4" aria-hidden="true" />
                  编辑组织
                </button>
                {canMoveOrganization ? (
                  <button
                    className="border-border bg-background hover:bg-muted inline-flex h-9 items-center gap-2 rounded-md border px-3 text-sm font-medium transition-transform active:scale-[0.98]"
                    data-testid={`organization-move-${selectedNode.publicId}`}
                    type="button"
                    onClick={() => onMove(selectedNode)}
                  >
                    移动组织
                  </button>
                ) : null}
                {selectedNode.status === "active" ? (
                  <button
                    className="bg-destructive text-destructive-foreground inline-flex h-9 items-center gap-2 rounded-md px-3 text-sm font-medium transition-transform active:scale-[0.98]"
                    data-testid={`organization-disable-${selectedNode.publicId}`}
                    type="button"
                    onClick={() => onDisable(selectedNode)}
                  >
                    <Ban className="size-4" aria-hidden="true" />
                    停用组织
                  </button>
                ) : (
                  <button
                    className="bg-primary text-primary-foreground inline-flex h-9 items-center gap-2 rounded-md px-3 text-sm font-medium transition-transform active:scale-[0.98]"
                    data-testid={`organization-enable-${selectedNode.publicId}`}
                    type="button"
                    onClick={() => onEnable(selectedNode)}
                  >
                    <CheckCircle2 className="size-4" aria-hidden="true" />
                    启用组织
                  </button>
                )}
              </div>
            </div>
          )}
        </section>
      </div>
    </section>
  );
}

function OrgAuthList({
  loadState,
  onCancelOrgAuth,
  onViewOrgAuthDetail,
  orgAuths,
}: {
  loadState: LoadState;
  onCancelOrgAuth: (publicId: string) => void;
  onViewOrgAuthDetail: (publicId: string) => void;
  orgAuths: AdminOrgAuthListData["orgAuths"];
}) {
  return (
    <AdminTableFrame ariaLabel="企业授权列表" minWidthClassName="min-w-[74rem]">
      <table aria-label="企业授权列表" className={adminDataTableClassName}>
        <thead>
          <tr>
            <th className={adminOrganizationTableCellClassName} scope="col">
              企业授权
            </th>
            <th className={adminOrganizationTableCellClassName} scope="col">
              购买主体
            </th>
            <th className={adminOrganizationTableCellClassName} scope="col">
              覆盖企业
            </th>
            <th className={adminOrganizationTableCellClassName} scope="col">
              版本与范围
            </th>
            <th className={adminOrganizationTableCellClassName} scope="col">
              额度
            </th>
            <th className={adminOrganizationTableCellClassName} scope="col">
              有效期
            </th>
            <th className={adminOrganizationTableCellClassName} scope="col">
              状态
            </th>
            <th className={adminOrganizationTableCellClassName} scope="col">
              操作
            </th>
          </tr>
        </thead>
        <tbody>
          {loadState === "loading" ? (
            <tr>
              <td className="text-text-muted px-4 py-8 text-center" colSpan={8}>
                正在加载企业授权列表
              </td>
            </tr>
          ) : null}
          {loadState === "error" ? (
            <tr>
              <td
                className="text-destructive px-4 py-8 text-center"
                colSpan={8}
              >
                企业授权列表加载失败，请稍后重试。
              </td>
            </tr>
          ) : null}
          {loadState === "empty" ||
          (loadState === "ready" && orgAuths.length === 0) ? (
            <tr>
              <td className="text-text-muted px-4 py-8 text-center" colSpan={8}>
                暂无符合条件的企业授权。
              </td>
            </tr>
          ) : null}
          {loadState === "ready"
            ? orgAuths.map((orgAuth) => (
                <tr
                  key={orgAuth.publicId}
                  data-public-id={orgAuth.publicId}
                  data-testid={`admin-org-auth-${orgAuth.publicId}`}
                >
                  <td className={adminOrganizationTableCellClassName}>
                    <p className="text-text-primary font-medium">
                      {orgAuth.name}
                    </p>
                    <p className="text-text-muted mt-1 text-xs">
                      {authScopeTypeLabels[orgAuth.authScopeType]}
                    </p>
                  </td>
                  <td className={adminOrganizationTableCellClassName}>
                    <p className="text-text-primary font-medium">
                      {orgAuth.purchaserOrganizationName}
                    </p>
                  </td>
                  <td
                    className={`${adminOrganizationTableCellClassName} text-left`}
                  >
                    <p className="text-text-primary font-medium">
                      覆盖 {orgAuth.coveredOrganizationCount} 家企业
                    </p>
                    <p className="text-text-muted mt-1 max-w-64 text-xs">
                      {orgAuth.coveredOrganizationNames.join("、") ||
                        "暂无覆盖企业名称"}
                    </p>
                  </td>
                  <td className={adminOrganizationTableCellClassName}>
                    <p className="text-text-primary">
                      {formatProfessionLevel(orgAuth)}
                    </p>
                    <p className="text-text-muted mt-1 text-xs">
                      {getOrgAuthEditionLabel(orgAuth)}
                    </p>
                    <p className="text-text-muted mt-1 text-xs">
                      {getOrgAuthUpgradeStatusLabel(orgAuth)}
                    </p>
                  </td>
                  <td className={adminOrganizationTableCellClassName}>
                    <p className="text-text-primary">
                      {orgAuth.usedQuota} / {orgAuth.accountQuota}
                    </p>
                    <p className="text-text-muted mt-1 text-xs">
                      可用{" "}
                      {Math.max(orgAuth.accountQuota - orgAuth.usedQuota, 0)}
                    </p>
                  </td>
                  <td className={adminOrganizationTableCellClassName}>
                    <p className="text-text-primary">
                      {formatDate(orgAuth.startsAt)}
                    </p>
                    <p className="text-text-muted mt-1 text-xs">
                      至 {formatDate(orgAuth.expiresAt)}
                    </p>
                  </td>
                  <td className={adminOrganizationTableCellClassName}>
                    <span
                      className={
                        orgAuth.status === "active"
                          ? "bg-success/10 text-success inline-flex rounded-md px-2 py-1 text-xs font-medium"
                          : "bg-muted text-text-secondary inline-flex rounded-md px-2 py-1 text-xs font-medium"
                      }
                    >
                      {authStatusLabels[orgAuth.status]}
                    </span>
                  </td>
                  <td className={adminOrganizationTableCellClassName}>
                    <div className="flex flex-wrap gap-2">
                      <button
                        aria-label={`查看企业授权 ${orgAuth.name}`}
                        type="button"
                        className="border-border bg-background hover:bg-muted inline-flex h-8 items-center gap-1 rounded-md border px-2.5 text-sm font-medium"
                        onClick={() => onViewOrgAuthDetail(orgAuth.publicId)}
                      >
                        <Eye className="size-3.5" aria-hidden="true" />
                        查看详情
                      </button>
                      {orgAuth.status === "active" ? (
                        <button
                          aria-label={`取消企业授权 ${orgAuth.name}`}
                          type="button"
                          className="border-destructive text-destructive bg-background inline-flex h-8 items-center rounded-md border px-2.5 text-sm font-medium"
                          onClick={() => onCancelOrgAuth(orgAuth.publicId)}
                        >
                          取消授权
                        </button>
                      ) : null}
                    </div>
                  </td>
                </tr>
              ))
            : null}
        </tbody>
      </table>
    </AdminTableFrame>
  );
}

function OrgAuthDetailPanel({
  onClose,
  orgAuth,
}: {
  onClose: () => void;
  orgAuth: OrgAuthDetailDto;
}) {
  return (
    <AdminDetailDrawer
      ariaLabel="企业授权详情"
      description="只展示公开编号关联的授权摘要、覆盖企业和额度信息。"
      eyebrow="企业授权"
      onClose={onClose}
      title="企业授权详情"
    >
      <div
        className="space-y-4"
        data-public-id={orgAuth.publicId}
        data-testid={`admin-org-auth-detail-${orgAuth.publicId}`}
      >
        <div className="space-y-2">
          <h3 className="text-text-primary text-base font-semibold">
            {orgAuth.name}
          </h3>
          <div className="text-text-secondary grid gap-1 text-sm md:grid-cols-2">
            <p>购买主体 {orgAuth.purchaserOrganization.name}</p>
            <p>授权范围 {authScopeTypeLabels[orgAuth.authScopeType]}</p>
            <p>{formatProfessionLevel(orgAuth)}</p>
            <p>
              额度 {orgAuth.usedQuota} / {orgAuth.accountQuota}
            </p>
            <p>可用额度 {orgAuth.occupancy.availableQuota}</p>
            <p>
              有效期 {formatDate(orgAuth.startsAt)} 至{" "}
              {formatDate(orgAuth.expiresAt)}
            </p>
            <p>状态 {authStatusLabels[orgAuth.status]}</p>
            <p>覆盖企业 {orgAuth.coveredOrganizations.length} 家</p>
          </div>
          <div className="text-text-muted space-y-1 text-xs">
            {orgAuth.coveredOrganizations.map((organization) => (
              <p key={organization.publicId}>
                {organization.name} / 员工 {organization.employeeCount}
              </p>
            ))}
          </div>
        </div>
      </div>
    </AdminDetailDrawer>
  );
}

function AdminTaskDrawer({
  ariaLabel,
  children,
  eyebrow,
  onClose,
  title,
}: {
  ariaLabel: string;
  children: ReactNode;
  eyebrow: string;
  onClose: () => void;
  title: string;
}) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const previouslyFocusedElement =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;

    closeButtonRef.current?.focus();

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      previouslyFocusedElement?.focus();
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50">
      <button
        aria-label={`点击遮罩关闭${ariaLabel}`}
        className="bg-foreground/20 absolute inset-0 cursor-default"
        type="button"
        onClick={onClose}
      />
      <aside
        aria-label={ariaLabel}
        aria-modal="true"
        className="bg-background border-border absolute inset-y-0 right-0 flex w-full max-w-3xl flex-col border-l shadow-lg"
        role="dialog"
      >
        <header className="bg-background border-border sticky top-0 z-10 flex items-center justify-between border-b px-5 py-4">
          <div>
            <p className="text-brand-primary text-xs font-medium">{eyebrow}</p>
            <h2 className="text-text-primary mt-1 text-base font-semibold">
              {title}
            </h2>
          </div>
          <button
            aria-label={`关闭${ariaLabel}`}
            className="border-border bg-background hover:bg-muted inline-flex size-9 items-center justify-center rounded-md border"
            ref={closeButtonRef}
            title="关闭"
            type="button"
            onClick={onClose}
          >
            <X className="size-4" aria-hidden="true" />
          </button>
        </header>
        <div className="flex-1 overflow-y-auto p-5">{children}</div>
      </aside>
    </div>
  );
}

function buildEmployeeTransferReviewRows(input: {
  employees: AdminOrgAuthData["employees"];
  organizations: AdminOrgAuthData["organizations"];
  orgAuths: AdminOrgAuthData["orgAuths"];
}): EmployeeTransferReviewRow[] {
  const activeOrganizations = input.organizations.filter(
    (organization) => organization.status === "active",
  );

  return input.employees.flatMap((employee) => {
    const currentOrganization = input.organizations.find(
      (organization) => organization.publicId === employee.organizationPublicId,
    );
    const targetOrganizations = activeOrganizations.filter(
      (organization) => organization.publicId !== employee.organizationPublicId,
    );

    return targetOrganizations.map((targetOrganization) => {
      const targetActiveOrgAuths = input.orgAuths.filter(
        (orgAuth) =>
          orgAuth.status === "active" &&
          orgAuth.organizationPublicIds.includes(targetOrganization.publicId),
      );
      const availableQuota = targetActiveOrgAuths.reduce(
        (totalAvailableQuota, orgAuth) =>
          totalAvailableQuota +
          Math.max(orgAuth.accountQuota - orgAuth.usedQuota, 0),
        0,
      );
      const reason =
        targetActiveOrgAuths.length === 0
          ? "target_no_active_auth"
          : availableQuota > 0
            ? "quota_available"
            : "quota_insufficient";

      return {
        activeScopeCount: targetActiveOrgAuths.length,
        availableQuota,
        currentOrganizationName:
          currentOrganization?.name ?? employee.organizationPublicId,
        employeeName: employee.name,
        employeePublicId: employee.publicId,
        reason,
        targetOrganizationName: targetOrganization.name,
        targetOrganizationPublicId: targetOrganization.publicId,
      };
    });
  });
}

const employeeTransferReviewReasonLabels: Record<
  EmployeeTransferReviewRow["reason"],
  string
> = {
  quota_available: "可进入事务复核",
  quota_insufficient: "目标授权额度不足",
  target_no_active_auth: "目标组织暂无有效授权",
};

function EmployeeTransferActionPanel({
  employee,
  onTransferEmployee,
  organizations,
  orgAuths,
}: {
  employee: AdminEmployeeListData["employees"][number];
  onTransferEmployee: (input: {
    employeePublicId: string;
    targetOrganizationPublicId: string;
  }) => void;
  organizations: AdminOrgAuthData["organizations"];
  orgAuths: AdminOrgAuthData["orgAuths"];
}) {
  const [targetOrganizationPublicId, setTargetOrganizationPublicId] =
    useState("");
  const reviewRows = buildEmployeeTransferReviewRows({
    employees: [employee],
    organizations,
    orgAuths,
  });
  const selectedReview = reviewRows.find(
    (reviewRow) =>
      reviewRow.targetOrganizationPublicId === targetOrganizationPublicId,
  );

  return (
    <section
      className="space-y-4"
      data-testid="employee-transfer-session-review"
    >
      <div className="space-y-1">
        <p className="text-brand-primary text-xs font-medium">
          员工调动影响复核
        </p>
        <h2 className="text-text-primary text-base font-semibold">
          {employee.name}
        </h2>
        <p className="text-text-secondary text-sm leading-6">
          目标授权额度不足时阻断；成功后撤销员工已有活跃会话，保留已提交作答时企业归属快照，并阻断原组织未提交企业训练。
        </p>
      </div>
      <label className="flex flex-col gap-2 text-sm font-medium">
        <span className="text-text-secondary">目标企业</span>
        <select
          aria-label="目标企业"
          className="border-border bg-background h-9 rounded-md border px-3 text-sm"
          value={targetOrganizationPublicId}
          onChange={(event) =>
            setTargetOrganizationPublicId(event.target.value)
          }
        >
          <option value="">请选择目标企业</option>
          {reviewRows.map((reviewRow) => (
            <option
              key={reviewRow.targetOrganizationPublicId}
              value={reviewRow.targetOrganizationPublicId}
            >
              {reviewRow.targetOrganizationName}
            </option>
          ))}
        </select>
      </label>
      {selectedReview === undefined ? (
        <p className="text-text-muted text-sm">选择目标企业后查看影响。</p>
      ) : (
        <div className="border-border bg-background space-y-2 rounded-md border p-3">
          <p className="text-text-primary text-sm font-medium">
            {selectedReview.currentOrganizationName} 到{" "}
            {selectedReview.targetOrganizationName}
          </p>
          <p className="text-text-secondary text-sm">
            目标有效授权范围 {selectedReview.activeScopeCount}；可用额度{" "}
            {selectedReview.availableQuota}
          </p>
          <p className="text-text-muted text-xs">
            {employeeTransferReviewReasonLabels[selectedReview.reason]}
          </p>
        </div>
      )}
      <button
        className="bg-primary text-primary-foreground inline-flex h-9 items-center gap-2 rounded-md px-3 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-50"
        data-testid={
          selectedReview === undefined
            ? "employee-transfer-submit"
            : `employee-transfer-${selectedReview.employeePublicId}-${selectedReview.targetOrganizationPublicId}`
        }
        disabled={selectedReview?.reason !== "quota_available"}
        type="button"
        onClick={() => {
          if (selectedReview !== undefined) {
            onTransferEmployee({
              employeePublicId: selectedReview.employeePublicId,
              targetOrganizationPublicId:
                selectedReview.targetOrganizationPublicId,
            });
          }
        }}
      >
        <MoveRight className="size-4" aria-hidden="true" />
        继续转移
      </button>
    </section>
  );
}

function EmployeeList({
  employees,
  loadState,
  onTransferEmployee,
  onUnbindEmployee,
}: {
  employees: AdminEmployeeListData["employees"];
  loadState: LoadState;
  onTransferEmployee: (
    employee: AdminEmployeeListData["employees"][number],
  ) => void;
  onUnbindEmployee: (publicId: string) => void;
}) {
  return (
    <AdminTableFrame ariaLabel="员工账号列表" minWidthClassName="min-w-[62rem]">
      <table aria-label="员工账号列表" className={adminDataTableClassName}>
        <thead>
          <tr>
            <th className={adminOrganizationTableCellClassName} scope="col">
              员工
            </th>
            <th className={adminOrganizationTableCellClassName} scope="col">
              所属企业
            </th>
            <th className={adminOrganizationTableCellClassName} scope="col">
              状态
            </th>
            <th className={adminOrganizationTableCellClassName} scope="col">
              授权继承
            </th>
            <th className={adminOrganizationTableCellClassName} scope="col">
              注册时间
            </th>
            <th className={adminOrganizationTableCellClassName} scope="col">
              操作
            </th>
          </tr>
        </thead>
        <tbody>
          {loadState === "loading" ? (
            <tr>
              <td className="text-text-muted px-4 py-8 text-center" colSpan={6}>
                正在加载员工账号列表
              </td>
            </tr>
          ) : null}
          {loadState === "error" ? (
            <tr>
              <td
                className="text-destructive px-4 py-8 text-center"
                colSpan={6}
              >
                员工账号列表加载失败，请稍后重试。
              </td>
            </tr>
          ) : null}
          {loadState === "empty" ||
          (loadState === "ready" && employees.length === 0) ? (
            <tr>
              <td className="text-text-muted px-4 py-8 text-center" colSpan={6}>
                暂无符合条件的员工账号。
              </td>
            </tr>
          ) : null}
          {loadState === "ready"
            ? employees.map((employee) => (
                <tr
                  key={employee.publicId}
                  data-public-id={employee.publicId}
                  data-testid={`admin-employee-${employee.publicId}`}
                >
                  <td className={adminOrganizationTableCellClassName}>
                    <p className="text-text-primary font-medium">
                      {employee.name}
                    </p>
                    <p className="text-text-muted mt-1 text-xs">
                      {employee.phone}
                    </p>
                  </td>
                  <td
                    className={`${adminOrganizationTableCellClassName} text-left`}
                  >
                    {employee.organizationName}
                  </td>
                  <td className={adminOrganizationTableCellClassName}>
                    <span className="bg-secondary text-secondary-foreground inline-flex rounded-md px-2 py-1 text-xs font-medium">
                      {userStatusLabels[employee.status]}
                    </span>
                  </td>
                  <td className={adminOrganizationTableCellClassName}>
                    <p className="text-text-primary">
                      {employee.activeOrgAuthCount > 0
                        ? `有效企业授权 ${employee.activeOrgAuthCount} 项`
                        : "暂无有效企业授权"}
                    </p>
                    <p className="text-text-muted mt-1 text-xs">
                      权限由所属企业授权继承
                    </p>
                  </td>
                  <td className={adminOrganizationTableCellClassName}>
                    {formatDate(employee.registeredAt)}
                  </td>
                  <td className={adminOrganizationTableCellClassName}>
                    <div className="flex flex-wrap gap-2">
                      <button
                        aria-label={`转移员工 ${employee.name}`}
                        className="border-border bg-background hover:bg-muted inline-flex h-8 items-center gap-1 rounded-md border px-2.5 text-sm font-medium"
                        type="button"
                        onClick={() => onTransferEmployee(employee)}
                      >
                        <MoveRight className="size-3.5" aria-hidden="true" />
                        转移
                      </button>
                      <button
                        aria-label={`解绑员工 ${employee.name}`}
                        className="border-destructive text-destructive bg-background inline-flex h-8 items-center gap-1 rounded-md border px-2.5 text-sm font-medium"
                        data-testid={`employee-unbind-${employee.publicId}`}
                        type="button"
                        onClick={() => onUnbindEmployee(employee.publicId)}
                      >
                        <UserMinus className="size-3.5" aria-hidden="true" />
                        解绑
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            : null}
        </tbody>
      </table>
    </AdminTableFrame>
  );
}

function EmployeeUnbindResultPanel({
  organizations,
  result,
}: {
  organizations: AdminOrgAuthData["organizations"];
  result: EmployeeUnbindResultDto;
}) {
  const previousOrganization = organizations.find(
    (organization) =>
      organization.publicId === result.previousOrganizationPublicId,
  );

  return (
    <section
      className="bg-surface border-brand-primary/30 rounded-md border p-4 shadow-sm"
      data-public-id={result.employeePublicId}
      data-testid="employee-unbind-result"
    >
      <div className="space-y-3">
        <div className="space-y-1">
          <p className="text-brand-primary text-xs font-medium">解绑结果</p>
          <h2 className="text-text-primary text-base font-semibold">
            解绑成功
          </h2>
          <p className="text-text-secondary text-sm leading-6">
            员工已从
            {previousOrganization?.name ?? "组织信息不可用"}
            移除，原组织员工数已减少。
          </p>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          <div className="bg-background rounded-md p-3">
            <p className="text-text-muted text-xs">状态</p>
            <p className="text-text-primary mt-1 text-sm font-medium">
              {result.status}
            </p>
          </div>
          <div className="bg-background rounded-md p-3">
            <p className="text-text-muted text-xs">影响组织</p>
            <p className="text-text-primary mt-1 text-sm font-medium break-all">
              {previousOrganization?.name ?? "组织信息不可用"}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function EmployeeTransferResultPanel({
  organizations,
  result,
}: {
  organizations: AdminOrgAuthData["organizations"];
  result: EmployeeTransferResultDto;
}) {
  const previousOrganization = organizations.find(
    (organization) =>
      organization.publicId === result.previousOrganizationPublicId,
  );
  const targetOrganization = organizations.find(
    (organization) =>
      organization.publicId === result.targetOrganizationPublicId,
  );

  return (
    <section
      className="bg-surface border-brand-primary/30 rounded-md border p-4 shadow-sm"
      data-public-id={result.employeePublicId}
      data-testid="employee-transfer-result"
    >
      <div className="space-y-3">
        <div className="space-y-1">
          <p className="text-brand-primary text-xs font-medium">转移结果</p>
          <h2 className="text-text-primary text-base font-semibold">
            员工已转移
          </h2>
          <p className="text-text-secondary text-sm leading-6">
            员工已从
            {previousOrganization?.name ?? "组织信息不可用"}
            转移到
            {targetOrganization?.name ?? "组织信息不可用"}
            ；历史作答归属快照保留，原组织未提交企业训练已阻断。
          </p>
        </div>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <div className="bg-background rounded-md p-3">
            <p className="text-text-muted text-xs">状态</p>
            <p className="text-text-primary mt-1 text-sm font-medium">
              {result.status}
            </p>
          </div>
          <div className="bg-background rounded-md p-3">
            <p className="text-text-muted text-xs">额度</p>
            <p className="text-text-primary mt-1 text-sm font-medium">
              {result.quotaRefreshStatus}
            </p>
          </div>
          <div className="bg-background rounded-md p-3">
            <p className="text-text-muted text-xs">会话</p>
            <p className="text-text-primary mt-1 text-sm font-medium">
              {result.sessionRevocationStatus}
            </p>
          </div>
          <div className="bg-background rounded-md p-3">
            <p className="text-text-muted text-xs">训练</p>
            <p className="text-text-primary mt-1 text-sm font-medium">
              {result.oldOrganizationInProgressTrainingStatus}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function EmployeeImportActionPanel({
  importText,
  importPreview,
  organizations,
  onImportFileChange,
  onImportTextChange,
  onSubmit,
  onTargetOrganizationChange,
  onTemplateDownload,
  targetOrganizationPublicId,
}: {
  importText: string;
  importPreview: EmployeeImportPreview;
  onImportFileChange: (file: File | null) => void;
  onImportTextChange: (value: string) => void;
  onSubmit: () => void;
  onTargetOrganizationChange: (value: string) => void;
  onTemplateDownload: () => void;
  organizations: AdminOrgAuthData["organizations"];
  targetOrganizationPublicId: string;
}) {
  return (
    <section className="bg-surface border-border rounded-md border p-4 shadow-sm">
      <div className="space-y-4">
        <div className="space-y-1">
          <p className="text-brand-primary text-xs font-medium">员工导入</p>
          <h2 className="text-text-primary text-base font-semibold">
            员工批量导入
          </h2>
          <p className="text-text-secondary text-sm leading-6">
            先选择员工所属企业，再上传或粘贴员工名录。初始密码可不填写，系统生成后仅在本次导入结果中展示。
          </p>
        </div>
        <ol
          className="border-border grid gap-2 border-y py-3 text-xs sm:grid-cols-2"
          aria-label="员工导入步骤"
        >
          {[
            "1. 选择企业",
            "2. 上传或粘贴名录",
            "3. 核对解析预览",
            "4. 确认导入",
          ].map((step) => (
            <li key={step} className="text-text-secondary">
              {step}
            </li>
          ))}
        </ol>
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            className="border-border bg-background text-text-primary inline-flex h-9 items-center justify-center gap-2 rounded-md border px-3 text-sm font-medium transition-transform active:scale-[0.98]"
            data-testid="employee-import-template-download"
            onClick={onTemplateDownload}
          >
            <Download className="size-4" aria-hidden="true" />
            下载模板
          </button>
          <label className="border-border bg-background text-text-secondary inline-flex h-9 items-center justify-center gap-2 rounded-md border px-3 text-sm font-medium transition-transform active:scale-[0.98]">
            <Upload className="size-4" aria-hidden="true" />
            上传名录
            <input
              className="sr-only"
              data-testid="employee-import-file-input"
              type="file"
              accept=".csv,.tsv,text/csv,text/tab-separated-values"
              onChange={(event) => {
                onImportFileChange(event.target.files?.[0] ?? null);
                event.currentTarget.value = "";
              }}
            />
          </label>
        </div>
        <label className="flex flex-col gap-2 text-sm font-medium">
          <span className="text-text-secondary">目标企业</span>
          <select
            className="border-border bg-background h-9 rounded-md border px-3 text-sm"
            data-testid="employee-import-organization-select"
            value={targetOrganizationPublicId}
            onChange={(event) => onTargetOrganizationChange(event.target.value)}
          >
            <option value="">请选择目标企业</option>
            {organizations.map((organization) => (
              <option key={organization.publicId} value={organization.publicId}>
                {organization.name}
              </option>
            ))}
          </select>
        </label>
        <textarea
          aria-label="员工名录"
          className="border-border bg-background min-h-24 w-full rounded-md border px-3 py-2 text-sm"
          data-testid="employee-import-textarea"
          value={importText}
          onChange={(event) => onImportTextChange(event.target.value)}
        />
        <div
          className="bg-background border-border rounded-md border p-3"
          data-testid="employee-import-preview"
        >
          <p className="text-text-primary text-sm font-medium">导入预览</p>
          <p className="text-text-secondary mt-1 text-sm">
            {importPreview.message}
          </p>
          <p className="text-text-muted mt-1 text-xs">
            格式 {importPreview.formatLabel} / 数据行 {importPreview.rowCount}
          </p>
          <p
            className="text-text-muted mt-1 text-xs"
            data-testid="employee-import-inherited-auth-category"
          >
            继承授权：
            {
              employeeImportInheritedAuthorizationLabels[
                importPreview.inheritedAuthorizationCategory
              ]
            }
            {importPreview.activeOrgAuthCount > 0
              ? ` / 有效授权 ${importPreview.activeOrgAuthCount}`
              : ""}
          </p>
          <p
            className="text-text-muted mt-1 text-xs"
            data-testid="employee-import-quota-impact-category"
          >
            额度影响：
            {employeeImportQuotaImpactLabels[importPreview.quotaImpactCategory]}
            {importPreview.availableQuota === null
              ? ""
              : ` / 可用 ${importPreview.availableQuota}`}
          </p>
          {importPreview.generatedPasswordRowCount > 0 ? (
            <p className="text-warning mt-2 text-xs leading-5">
              {importPreview.generatedPasswordRowCount}{" "}
              行未填写初始密码；成功新建账号时将在一次性分发窗口展示系统生成密码。
            </p>
          ) : null}
        </div>
        <button
          type="button"
          className="bg-primary text-primary-foreground inline-flex h-9 items-center justify-center gap-2 rounded-lg px-4 text-sm font-medium transition-transform active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
          data-testid="employee-import-submit"
          disabled={!importPreview.isReady}
          onClick={onSubmit}
        >
          <Upload className="size-4" aria-hidden="true" />
          导入员工
        </button>
      </div>
    </section>
  );
}

function EmployeeConfirmationDialog({
  confirmationState,
  onCancel,
  onConfirm,
}: {
  confirmationState: Exclude<EmployeeConfirmationState, null>;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  const isImport = confirmationState.kind === "importEmployees";
  const isTransfer = confirmationState.kind === "transferEmployee";

  return (
    <div
      aria-modal="true"
      className="border-border bg-surface fixed top-20 left-1/2 z-50 w-full max-w-md -translate-x-1/2 rounded-md border p-4 shadow-lg"
      role="alertdialog"
    >
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <AlertCircle
            className="text-brand-primary size-4"
            aria-hidden="true"
          />
          <h2 className="text-text-primary text-base font-semibold">
            {isImport
              ? "确认导入员工？"
              : isTransfer
                ? "确认转移员工？"
                : "确认解绑员工？"}
          </h2>
        </div>
        <p className="text-text-muted text-sm leading-6">
          员工操作按所选员工和目标企业提交；后端继续执行角色校验和脱敏审计。
        </p>
        <div className="flex gap-2">
          <button
            type="button"
            className={
              isImport || isTransfer
                ? "bg-primary text-primary-foreground inline-flex h-8 items-center justify-center rounded-lg px-3 text-sm font-medium transition-transform active:scale-[0.98]"
                : "bg-destructive text-destructive-foreground inline-flex h-8 items-center justify-center rounded-lg px-3 text-sm font-medium transition-transform active:scale-[0.98]"
            }
            data-testid="employee-confirm-action"
            onClick={onConfirm}
          >
            确认
          </button>
          <button
            type="button"
            className="border-border bg-background hover:bg-muted hover:text-foreground inline-flex h-8 items-center justify-center rounded-lg border px-3 text-sm font-medium transition-transform active:scale-[0.98]"
            onClick={onCancel}
          >
            取消
          </button>
        </div>
      </div>
    </div>
  );
}

function RedeemCodeList({
  isFiltered,
  onCopyPlainText,
  onViewDetail,
  redeemCodes,
}: {
  isFiltered: boolean;
  onCopyPlainText: (value: string) => void;
  onViewDetail: (publicId: string) => void;
  redeemCodes: AdminRedeemCodeData["redeemCodes"];
}) {
  return (
    <AdminTableFrame ariaLabel="卡密列表区域" minWidthClassName="min-w-[56rem]">
      <table aria-label="卡密列表" className={adminDataTableClassName}>
        <thead className="bg-muted text-text-secondary">
          <tr>
            <th className="px-4 py-3 font-medium" scope="col">
              卡密
            </th>
            <th className="px-4 py-3 font-medium" scope="col">
              类型与状态
            </th>
            <th className="px-4 py-3 font-medium" scope="col">
              授权范围
            </th>
            <th className="px-4 py-3 font-medium" scope="col">
              兑换与明文
            </th>
            <th className="px-4 py-3 text-right font-medium" scope="col">
              操作
            </th>
          </tr>
        </thead>
        <tbody>
          {redeemCodes.length === 0 ? (
            <AdminTableEmptyRow
              colSpan={5}
              description={
                isFiltered
                  ? "可调整筛选条件或重置筛选后重试。"
                  : "可使用“生成卡密”创建首批卡密。"
              }
              title={
                isFiltered ? "当前筛选条件下没有卡密记录。" : "暂无卡密记录。"
              }
            />
          ) : (
            redeemCodes.map((redeemCode) => {
              const visiblePlainText =
                redeemCode.canViewPlainText && redeemCode.codePlainText !== null
                  ? redeemCode.codePlainText
                  : null;

              return (
                <tr
                  className="border-border border-t text-sm"
                  data-public-id={redeemCode.publicId}
                  data-testid={`admin-redeem-code-${redeemCode.publicId}`}
                  key={redeemCode.publicId}
                >
                  <td className="px-4 py-3 align-middle">
                    <p className="text-text-primary font-mono font-semibold">
                      {visiblePlainText ?? redeemCode.codeDisplay}
                    </p>
                    <p className="text-text-muted mt-1 text-xs">
                      创建于 {formatDate(redeemCode.createdAt)}
                    </p>
                  </td>
                  <td className="px-4 py-3 align-middle">
                    <div className="flex flex-wrap gap-2">
                      <span className="bg-muted text-text-secondary rounded-md px-2 py-1 text-xs font-medium">
                        {redeemCodeTypeLabels[redeemCode.redeemCodeType]}
                      </span>
                      <span className="bg-secondary text-secondary-foreground rounded-md px-2 py-1 text-xs font-medium">
                        {redeemCodeStatusLabels[redeemCode.status]}
                      </span>
                    </div>
                  </td>
                  <td className="text-text-primary px-4 py-3 align-middle">
                    {formatProfessionLevel(redeemCode)}
                  </td>
                  <td className="px-4 py-3 align-middle">
                    <p className="text-text-primary">
                      {redeemCode.redeemedUserPublicId === null
                        ? "未兑换"
                        : "已兑换"}
                    </p>
                    <p className="text-text-muted mt-1 text-xs">
                      兑换截止 {formatDate(redeemCode.redeemDeadlineAt)}
                    </p>
                    <p className="text-text-muted mt-1 text-xs">
                      {visiblePlainText === null ? "明文不可用" : "明文可复制"}
                    </p>
                  </td>
                  <td className="px-4 py-3 align-middle">
                    <div className="flex justify-end gap-2">
                      {visiblePlainText === null ? null : (
                        <button
                          aria-label={`复制卡密 ${redeemCode.codeDisplay}`}
                          type="button"
                          className="border-border bg-background hover:bg-muted hover:text-foreground inline-flex h-8 items-center justify-center gap-1.5 rounded-lg border px-2.5 text-xs font-medium transition-transform active:scale-[0.98]"
                          onClick={() => onCopyPlainText(visiblePlainText)}
                        >
                          <Copy className="size-3.5" aria-hidden="true" />
                          复制
                        </button>
                      )}
                      <button
                        aria-label={`查看卡密 ${redeemCode.codeDisplay} 详情`}
                        type="button"
                        className="border-border bg-background hover:bg-muted hover:text-foreground inline-flex h-8 items-center justify-center gap-1.5 rounded-lg border px-2.5 text-xs font-medium transition-transform active:scale-[0.98]"
                        onClick={() => onViewDetail(redeemCode.publicId)}
                      >
                        <Eye className="size-3.5" aria-hidden="true" />
                        详情
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </AdminTableFrame>
  );
}

function RedeemCodeDetailPanel({
  onCopyPlainText,
  onClose,
  redeemCode,
}: {
  onCopyPlainText: (value: string) => void;
  onClose: () => void;
  redeemCode: RedeemCodeDetailDto;
}) {
  const visiblePlainText =
    redeemCode.canViewPlainText && redeemCode.codePlainText !== null
      ? redeemCode.codePlainText
      : null;

  return (
    <AdminDetailDrawer
      ariaLabel="卡密详情"
      description="详情不展示哈希或内部标识；明文只在接口明确授权时显示。"
      eyebrow="卡密管理"
      onClose={onClose}
      title="卡密详情"
    >
      <div
        className="space-y-4"
        data-public-id={redeemCode.publicId}
        data-testid={`admin-redeem-code-detail-${redeemCode.publicId}`}
      >
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-1">
            <h3 className="text-text-primary font-mono text-base font-semibold">
              {visiblePlainText ?? redeemCode.codeDisplay}
            </h3>
            <p className="text-text-secondary text-sm leading-6">
              详情视图不展示哈希或内部标识；明文只在接口明确授权时显示。
            </p>
          </div>
          {visiblePlainText === null ? null : (
            <button
              aria-label={`复制卡密 ${redeemCode.codeDisplay} 明文`}
              type="button"
              className="border-border bg-background hover:bg-muted hover:text-foreground inline-flex h-8 items-center justify-center gap-1.5 rounded-lg border px-3 text-sm font-medium transition-transform active:scale-[0.98]"
              onClick={() => onCopyPlainText(visiblePlainText)}
            >
              <Copy className="size-3.5" aria-hidden="true" />
              复制明文
            </button>
          )}
        </div>
        <dl className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          <div className="bg-background rounded-md p-3">
            <dt className="text-text-muted text-xs">卡密类型</dt>
            <dd className="text-text-primary mt-1 text-sm font-medium">
              {redeemCodeTypeLabels[redeemCode.redeemCodeType]}
            </dd>
          </div>
          <div className="bg-background rounded-md p-3">
            <dt className="text-text-muted text-xs">状态</dt>
            <dd className="text-text-primary mt-1 text-sm font-medium">
              {redeemCodeStatusLabels[redeemCode.status]}
            </dd>
          </div>
          <div className="bg-background rounded-md p-3">
            <dt className="text-text-muted text-xs">授权范围</dt>
            <dd className="text-text-primary mt-1 text-sm font-medium">
              {formatProfessionLevel(redeemCode)}
            </dd>
          </div>
          <div className="bg-background rounded-md p-3">
            <dt className="text-text-muted text-xs">兑换用户</dt>
            <dd className="text-text-primary mt-1 text-sm font-medium">
              {redeemCode.redeemedUserPublicId === null ? "未兑换" : "已兑换"}
            </dd>
          </div>
          <div className="bg-background rounded-md p-3">
            <dt className="text-text-muted text-xs">兑换截止</dt>
            <dd className="text-text-primary mt-1 text-sm font-medium">
              {formatDate(redeemCode.redeemDeadlineAt)}
            </dd>
          </div>
          <div className="bg-background rounded-md p-3">
            <dt className="text-text-muted text-xs">创建时间</dt>
            <dd className="text-text-primary mt-1 text-sm font-medium">
              {formatDate(redeemCode.createdAt)}
            </dd>
          </div>
          <div className="bg-background rounded-md p-3">
            <dt className="text-text-muted text-xs">生成来源</dt>
            <dd className="text-text-primary mt-1 text-sm font-medium">
              受控批量生成
            </dd>
          </div>
          <div className="bg-background rounded-md p-3">
            <dt className="text-text-muted text-xs">有效天数</dt>
            <dd className="text-text-primary mt-1 text-sm font-medium">
              {redeemCode.durationDay}
            </dd>
          </div>
          <div className="bg-background rounded-md p-3">
            <dt className="text-text-muted text-xs">兑换时间</dt>
            <dd className="text-text-primary mt-1 text-sm font-medium">
              {redeemCode.redeemedAt === null
                ? "未兑换"
                : formatDate(redeemCode.redeemedAt)}
            </dd>
          </div>
          <div className="bg-background rounded-md p-3">
            <dt className="text-text-muted text-xs">更新时间</dt>
            <dd className="text-text-primary mt-1 text-sm font-medium">
              {formatDate(redeemCode.updatedAt)}
            </dd>
          </div>
          <div className="bg-background rounded-md p-3">
            <dt className="text-text-muted text-xs">脱敏状态</dt>
            <dd className="text-text-primary mt-1 text-sm font-medium">
              已脱敏
            </dd>
          </div>
          <div className="bg-background rounded-md p-3">
            <dt className="text-text-muted text-xs">脱敏原因</dt>
            <dd className="text-text-primary mt-1 text-sm font-medium break-all">
              {redeemCodeRedactionReasonLabels[redeemCode.redactionReason]}
            </dd>
          </div>
        </dl>
        <p className="text-text-muted mt-3 text-xs">
          明文状态：
          {visiblePlainText === null
            ? "当前接口未返回明文"
            : "可由运营复制分发"}
        </p>
      </div>
    </AdminDetailDrawer>
  );
}

function RedeemCodeDistributionWindow({
  generation,
  onCopyAll,
  onCopyOne,
  redeemCodes,
}: {
  generation: GeneratedRedeemCodeSummary;
  onCopyAll: () => void;
  onCopyOne: (value: string) => void;
  redeemCodes: GeneratedRedeemCodeDistribution;
}) {
  return (
    <section
      aria-label="卡密分发窗口"
      className="bg-surface border-success/40 rounded-md border p-4 shadow-sm"
      data-testid="redeem-code-distribution-window"
    >
      <div className="space-y-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-1">
            <p className="text-brand-primary text-xs font-medium">分发窗口</p>
            <h2 className="text-text-primary text-base font-semibold">
              本次生成的卡密明文
            </h2>
            <p className="text-text-secondary text-sm leading-6">
              本窗口用于运营分发本批次卡密；验证证据与审计日志只记录批次、数量、类型、专业等级和截止日期摘要。
            </p>
          </div>
          <button
            type="button"
            className="bg-primary text-primary-foreground inline-flex h-9 items-center justify-center gap-2 rounded-lg px-4 text-sm font-medium transition-transform active:scale-[0.98]"
            data-testid="redeem-code-distribution-copy-all"
            onClick={onCopyAll}
          >
            <Copy className="size-4" aria-hidden="true" />
            复制全部
          </button>
        </div>

        <div
          className="bg-background border-border rounded-md border p-3"
          data-testid="redeem-code-generation-redacted-summary"
        >
          <p className="text-text-primary text-sm font-medium">批次摘要</p>
          <p className="text-text-secondary mt-1 text-xs">
            共 {generation.count} 个 /{" "}
            {redeemCodeTypeLabels[generation.redeemCodeType]} /{" "}
            {professionLabels[generation.profession]} {generation.level}级 /
            兑换截止 {formatDate(generation.redeemDeadlineAt)}
          </p>
        </div>

        <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-3">
          {redeemCodes.map((redeemCode) => (
            <div
              key={redeemCode.publicId}
              className="bg-background border-border rounded-md border p-3"
              data-public-id={redeemCode.publicId}
              data-testid={`redeem-code-distribution-item-${redeemCode.publicId}`}
            >
              <p className="text-text-primary font-mono text-sm font-semibold break-all">
                {redeemCode.codePlainText}
              </p>
              <p className="text-text-muted mt-1 text-xs">
                {redeemCodeTypeLabels[redeemCode.redeemCodeType]} /{" "}
                {formatProfessionLevel(redeemCode)}
              </p>
              <button
                aria-label={`复制卡密 ${redeemCode.codeDisplay}`}
                type="button"
                className="border-border bg-surface hover:bg-muted hover:text-foreground mt-3 inline-flex h-8 items-center justify-center gap-1.5 rounded-lg border px-2.5 text-xs font-medium transition-transform active:scale-[0.98]"
                onClick={() => onCopyOne(redeemCode.codePlainText)}
              >
                <Copy className="size-3.5" aria-hidden="true" />
                复制
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function RedeemCodePlainTextUnavailableNotice() {
  return (
    <section className="border-border bg-surface rounded-md border border-dashed p-4 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="bg-secondary text-secondary-foreground flex size-9 shrink-0 items-center justify-center rounded-full">
          <AlertCircle className="size-4" aria-hidden="true" />
        </div>
        <div className="space-y-1">
          <h2 className="text-text-primary text-base font-semibold">
            卡密明文不可用
          </h2>
          <p className="text-text-secondary text-sm leading-6">
            当前列表仅返回脱敏卡密，不能直接交给学员兑换。需要通过受控生成流程提供一次性卡密后再验证学生兑换。
          </p>
        </div>
      </div>
    </section>
  );
}

function OrgAuthConfirmationDialog({
  confirmationState,
  onCancel,
  onConfirm,
}: {
  confirmationState: Exclude<OrgAuthConfirmationState, null>;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  const isCreate = confirmationState.kind === "createOrgAuth";
  const createOrgAuthInput =
    confirmationState.kind === "createOrgAuth" ? confirmationState.input : null;

  return (
    <div
      aria-modal="true"
      className="border-border bg-surface fixed top-20 left-1/2 z-50 w-full max-w-md -translate-x-1/2 rounded-md border p-4 shadow-lg"
      role="alertdialog"
    >
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <AlertCircle
            className="text-brand-primary size-4"
            aria-hidden="true"
          />
          <h2 className="text-text-primary text-base font-semibold">
            {isCreate ? "确认创建企业授权？" : "确认取消企业授权？"}
          </h2>
        </div>
        <p className="text-text-muted text-sm">
          {isCreate
            ? "创建会提交企业公开编号、授权范围、专业等级、额度和有效期，由后端执行重叠校验。"
            : "取消会终止该企业授权，并由后端处理受影响的练习和模拟考试会话。"}
        </p>
        {createOrgAuthInput === null ? null : (
          <p className="text-text-secondary text-xs">
            edition: {createOrgAuthInput.edition}
          </p>
        )}
        <div className="flex gap-2">
          <button
            type="button"
            className={
              isCreate
                ? "bg-primary text-primary-foreground inline-flex h-8 items-center justify-center rounded-lg px-3 text-sm font-medium transition-transform active:scale-[0.98]"
                : "bg-destructive text-destructive-foreground inline-flex h-8 items-center justify-center rounded-lg px-3 text-sm font-medium transition-transform active:scale-[0.98]"
            }
            data-testid={isCreate ? "org-auth-confirm-action" : undefined}
            onClick={onConfirm}
          >
            {isCreate ? "确认创建" : "确认取消"}
          </button>
          <button
            type="button"
            className="border-border bg-background hover:bg-muted hover:text-foreground inline-flex h-8 items-center justify-center rounded-lg border px-3 text-sm font-medium transition-transform active:scale-[0.98]"
            onClick={onCancel}
          >
            取消
          </button>
        </div>
      </div>
    </div>
  );
}

function OrganizationConfirmationDialog({
  confirmationState,
  onCancel,
  onCascadeChange,
  onConfirm,
}: {
  confirmationState: Exclude<OrganizationConfirmationState, null>;
  onCancel: () => void;
  onCascadeChange: (isCascade: boolean) => void;
  onConfirm: () => void;
}) {
  const titleByKind = {
    createOrganization: "确认新增企业组织？",
    disableOrganization: "确认停用企业组织？",
    enableOrganization: "确认启用企业组织？",
    moveOrganization: "确认移动企业组织？",
    updateOrganization: "确认更新企业组织？",
  } satisfies Record<
    Exclude<OrganizationConfirmationState, null>["kind"],
    string
  >;
  const isDestructive = confirmationState.kind === "disableOrganization";

  return (
    <div
      aria-modal="true"
      className="border-border bg-surface fixed top-20 left-1/2 z-50 w-full max-w-md -translate-x-1/2 rounded-md border p-4 shadow-lg"
      role="alertdialog"
    >
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <AlertCircle
            className="text-brand-primary size-4"
            aria-hidden="true"
          />
          <h2 className="text-text-primary text-base font-semibold">
            {titleByKind[confirmationState.kind]}
          </h2>
        </div>
        <p className="text-text-muted text-sm leading-6">
          {confirmationState.kind === "moveOrganization"
            ? "移动将按当前组织树重新计算本节点及全部下级的企业授权覆盖和额度；出现重叠、超额或 revision 冲突时整体回滚。"
            : "资料编辑、组织移动和状态切换分别提交；后端按 revision 校验并记录脱敏审计日志。"}
        </p>
        {confirmationState.kind === "disableOrganization" ||
        confirmationState.kind === "enableOrganization" ? (
          <label className="text-text-secondary flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={confirmationState.isCascade}
              onChange={(event) => onCascadeChange(event.target.checked)}
            />
            同时处理全部下级组织
          </label>
        ) : null}
        <div className="flex gap-2">
          <button
            type="button"
            className={
              isDestructive
                ? "bg-destructive text-destructive-foreground inline-flex h-8 items-center justify-center rounded-lg px-3 text-sm font-medium transition-transform active:scale-[0.98]"
                : "bg-primary text-primary-foreground inline-flex h-8 items-center justify-center rounded-lg px-3 text-sm font-medium transition-transform active:scale-[0.98]"
            }
            data-testid="organization-confirm-action"
            onClick={onConfirm}
          >
            确认
          </button>
          <button
            type="button"
            className="border-border bg-background hover:bg-muted hover:text-foreground inline-flex h-8 items-center justify-center rounded-lg border px-3 text-sm font-medium transition-transform active:scale-[0.98]"
            onClick={onCancel}
          >
            取消
          </button>
        </div>
      </div>
    </div>
  );
}

function OrganizationTreeActionPanel({
  disabled,
  formState,
  organizations,
  onFormChange,
  onReset,
  onSubmit,
}: {
  disabled: boolean;
  formState: OrganizationFormState;
  onFormChange: (formState: OrganizationFormState) => void;
  onReset: () => void;
  onSubmit: () => void;
  organizations: AdminOrgAuthData["organizations"];
}) {
  const formValidation = buildOrganizationInput(formState, organizations);
  const isSubmitDisabled = disabled || formValidation.input === null;

  function updateFormState(nextFields: Partial<OrganizationFormState>) {
    onFormChange({
      ...formState,
      ...nextFields,
    });
  }

  return (
    <section
      className="bg-surface border-border rounded-md border p-4 shadow-sm"
      data-testid="organization-tree-management-form"
      id="organization-tree-management-panel"
    >
      <div className="space-y-4">
        <div className="flex flex-col gap-2 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-1">
            <p className="text-brand-primary text-xs font-medium">
              organization
            </p>
            <h2 className="text-text-primary text-base font-semibold">
              企业组织树维护
            </h2>
            <p className="text-text-secondary text-sm leading-6">
              维护省、地市、县区及站点层级；层级和父级关系会在提交前校验。节点移动首期仅超级管理员
              通过受控流程处理。
            </p>
          </div>
          <button
            type="button"
            className="border-border bg-background hover:bg-muted hover:text-foreground inline-flex h-8 items-center justify-center gap-1 rounded-lg border px-2.5 text-sm font-medium transition-transform active:scale-[0.98]"
            title="关闭组织维护表单"
            onClick={onReset}
          >
            <X className="size-3.5" aria-hidden="true" />
            关闭
          </button>
        </div>

        <div className="grid gap-3 lg:grid-cols-4">
          {formState.mode === "move" ? null : (
            <label className="flex flex-col gap-2 text-sm font-medium lg:col-span-2">
              <span className="text-text-secondary">企业名称</span>
              <input
                className="border-border bg-background h-9 rounded-md border px-3 text-sm"
                data-testid="organization-name-input"
                value={formState.name}
                onChange={(event) =>
                  updateFormState({ name: event.target.value })
                }
              />
            </label>
          )}

          {formState.mode === "create" ? (
            <label className="flex flex-col gap-2 text-sm font-medium">
              <span className="text-text-secondary">企业层级</span>
              <select
                className="border-border bg-background h-9 rounded-md border px-3 text-sm"
                data-testid="organization-tier-select"
                value={formState.orgTier}
                onChange={(event) =>
                  updateFormState({
                    orgTier: event.target.value as OrgTier,
                    parentOrganizationPublicId:
                      event.target.value === "province"
                        ? ""
                        : formState.parentOrganizationPublicId,
                  })
                }
              >
                <option value="province">省</option>
                <option value="city">地市</option>
                <option value="district">县区</option>
                <option value="station">站点</option>
              </select>
            </label>
          ) : null}

          {formState.mode === "update" ? null : (
            <label className="flex flex-col gap-2 text-sm font-medium">
              <span className="text-text-secondary">父级组织</span>
              <select
                className="border-border bg-background h-9 rounded-md border px-3 text-sm"
                data-testid="organization-parent-select"
                disabled={formState.orgTier === "province"}
                value={formState.parentOrganizationPublicId}
                onChange={(event) =>
                  updateFormState({
                    parentOrganizationPublicId: event.target.value,
                  })
                }
              >
                <option value="">无</option>
                {organizations
                  .filter(
                    (organization) =>
                      organization.publicId !== formState.publicId,
                  )
                  .map((organization) => (
                    <option
                      key={organization.publicId}
                      value={organization.publicId}
                    >
                      {organization.name} /{" "}
                      {orgTierLabels[organization.orgTier]}
                    </option>
                  ))}
              </select>
            </label>
          )}

          {formState.mode === "move" ? null : (
            <label className="flex flex-col gap-2 text-sm font-medium">
              <span className="text-text-secondary">联系人</span>
              <input
                className="border-border bg-background h-9 rounded-md border px-3 text-sm"
                value={formState.contactName}
                onChange={(event) =>
                  updateFormState({ contactName: event.target.value })
                }
              />
            </label>
          )}

          {formState.mode === "move" ? null : (
            <label className="flex flex-col gap-2 text-sm font-medium">
              <span className="text-text-secondary">联系电话</span>
              <input
                className="border-border bg-background h-9 rounded-md border px-3 text-sm"
                value={formState.contactPhone}
                onChange={(event) =>
                  updateFormState({ contactPhone: event.target.value })
                }
              />
            </label>
          )}

          {formState.mode === "move" ? null : (
            <label className="flex flex-col gap-2 text-sm font-medium lg:col-span-4">
              <span className="text-text-secondary">备注</span>
              <input
                className="border-border bg-background h-9 rounded-md border px-3 text-sm"
                value={formState.remark}
                onChange={(event) =>
                  updateFormState({ remark: event.target.value })
                }
              />
            </label>
          )}
        </div>

        {formValidation.message === null ? null : (
          <p
            className="text-destructive text-sm"
            data-testid="organization-form-error"
          >
            {formValidation.message}
          </p>
        )}

        <div className="flex justify-end">
          <button
            type="button"
            className="bg-primary text-primary-foreground inline-flex h-9 items-center justify-center rounded-lg px-4 text-sm font-medium transition-transform active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
            data-testid="organization-submit-button"
            disabled={isSubmitDisabled}
            onClick={onSubmit}
          >
            {formState.mode === "create" ? "新增企业组织" : "更新企业组织"}
          </button>
        </div>
      </div>
    </section>
  );
}

function RedeemCodeConfirmationDialog({
  input,
  onCancel,
  onConfirm,
}: {
  input: CreateRedeemCodeInput;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <div
      aria-modal="true"
      className="border-border bg-surface fixed top-20 left-1/2 z-50 w-full max-w-md -translate-x-1/2 rounded-md border p-4 shadow-lg"
      role="alertdialog"
    >
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <AlertCircle
            className="text-brand-primary size-4"
            aria-hidden="true"
          />
          <h2 className="text-text-primary text-base font-semibold">
            确认生成卡密？
          </h2>
        </div>
        <p className="text-text-muted text-sm">
          将生成 {input.count} 个{redeemCodeTypeLabels[input.redeemCodeType]}
          ，授权范围为 {professionLabels[input.profession]} {input.level}{" "}
          级，有效期 {input.durationDay} 天，兑换截止日期{" "}
          {input.redeemDeadlineDate}
          。审计日志只记录操作摘要，不记录卡密明文。
        </p>
        <div className="flex gap-2">
          <button
            type="button"
            className="bg-primary text-primary-foreground inline-flex h-8 items-center justify-center rounded-lg px-3 text-sm font-medium transition-transform active:scale-[0.98]"
            data-testid="redeem-code-generation-confirm-action"
            onClick={onConfirm}
          >
            确认生成
          </button>
          <button
            type="button"
            className="border-border bg-background hover:bg-muted hover:text-foreground inline-flex h-8 items-center justify-center rounded-lg border px-3 text-sm font-medium transition-transform active:scale-[0.98]"
            onClick={onCancel}
          >
            取消
          </button>
        </div>
      </div>
    </div>
  );
}

function OrgAuthActionPanel({
  disabled,
  formState,
  id,
  organizations,
  onCreateOrgAuth,
  onFormChange,
}: {
  disabled: boolean;
  formState: OrgAuthFormState;
  id?: string;
  onCreateOrgAuth: () => void;
  onFormChange: (formState: OrgAuthFormState) => void;
  organizations: AdminOrgAuthData["organizations"];
}) {
  const selectedPurchaserPublicId =
    formState.purchaserOrganizationPublicId ||
    findFirstOrganizationPublicId(organizations);
  const organizationDepthByPublicId = createOrganizationDepthMap(organizations);
  const formValidation = buildOrgAuthInput(formState, organizations);
  const coverageOrganizations = selectOrgAuthCoverageOrganizations(
    formState,
    organizations,
    selectedPurchaserPublicId,
  );
  const isCreateDisabled = disabled || formValidation.input === null;

  function updateFormState(nextFields: Partial<OrgAuthFormState>) {
    onFormChange({
      ...formState,
      ...nextFields,
    });
  }

  function toggleOrganizationPublicId(organizationPublicId: string) {
    updateFormState({
      organizationPublicIds: formState.organizationPublicIds.includes(
        organizationPublicId,
      )
        ? formState.organizationPublicIds.filter(
            (selectedOrganizationPublicId) =>
              selectedOrganizationPublicId !== organizationPublicId,
          )
        : [...formState.organizationPublicIds, organizationPublicId],
    });
  }

  function toggleProfession(profession: Profession) {
    updateFormState({
      professions: formState.professions.includes(profession)
        ? formState.professions.filter(
            (selectedProfession) => selectedProfession !== profession,
          )
        : [...formState.professions, profession],
    });
  }

  function toggleLevel(level: string) {
    updateFormState({
      levels: formState.levels.includes(level)
        ? formState.levels.filter((selectedLevel) => selectedLevel !== level)
        : [...formState.levels, level],
    });
  }

  return (
    <section
      className="bg-surface border-border rounded-md border p-4 shadow-sm"
      id={id}
    >
      <div className="space-y-4">
        <div className="space-y-1">
          <p className="text-brand-primary text-xs font-medium">企业授权</p>
          <h2 className="text-text-primary text-base font-semibold">
            创建企业授权
          </h2>
          <p className="text-text-secondary text-sm leading-6">
            选择购买主体、授权范围、专业等级、额度和有效期；提交后后端会展开企业范围并校验重叠授权。
          </p>
        </div>

        <div className="bg-background border-border grid gap-3 rounded-md border p-3 md:grid-cols-4">
          {[
            "选择购买主体",
            "确认范围",
            "填写专业等级和版本",
            "提交后处理重叠提示",
          ].map((step, index) => (
            <div key={step} className="min-w-0">
              <p className="text-brand-primary text-xs font-medium">
                {index + 1}
              </p>
              <p className="text-text-primary mt-1 text-sm font-medium">
                {step}
              </p>
            </div>
          ))}
          <p className="text-text-muted text-xs leading-5 md:col-span-4">
            同一原子范围已有生效授权时默认阻断；运营需通过续期、手动升级、替换或增量扩容等显式动作形成闭环后再完成授权。
          </p>
        </div>

        <div
          className="grid gap-3 lg:grid-cols-4"
          data-testid="org-auth-create-form"
        >
          <label className="flex flex-col gap-2 text-sm font-medium lg:col-span-2">
            <span className="text-text-secondary">授权名称</span>
            <input
              className="border-border bg-background h-9 rounded-md border px-3 text-sm"
              value={formState.name}
              onChange={(event) =>
                updateFormState({ name: event.target.value })
              }
            />
          </label>

          <label className="flex flex-col gap-2 text-sm font-medium lg:col-span-2">
            <span className="text-text-secondary">购买主体</span>
            <select
              className="border-border bg-background h-9 rounded-md border px-3 text-sm"
              value={selectedPurchaserPublicId}
              onChange={(event) =>
                updateFormState({
                  purchaserOrganizationPublicId: event.target.value,
                })
              }
            >
              {organizations.map((organization) => (
                <option
                  key={organization.publicId}
                  value={organization.publicId}
                >
                  {organization.name}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-2 text-sm font-medium">
            <span className="text-text-secondary">授权范围类型</span>
            <select
              className="border-border bg-background h-9 rounded-md border px-3 text-sm"
              value={formState.authScopeType}
              onChange={(event) =>
                updateFormState({
                  authScopeType: event.target.value as AuthScopeType,
                })
              }
            >
              <option value="current_and_descendants">本企业及下级</option>
              <option value="specified_nodes">指定企业列表</option>
            </select>
          </label>

          <fieldset className="flex flex-col gap-2 text-sm font-medium lg:col-span-2">
            <legend className="text-text-secondary">专业</legend>
            <div className="grid gap-2 sm:grid-cols-3">
              {orgAuthProfessionOptions.map((profession) => (
                <label
                  key={profession}
                  className="border-border bg-background flex h-9 items-center gap-2 rounded-md border px-3 text-sm"
                >
                  <input
                    checked={formState.professions.includes(profession)}
                    data-testid={`org-auth-profession-${profession}`}
                    type="checkbox"
                    onChange={() => toggleProfession(profession)}
                  />
                  <span>{professionLabels[profession]}</span>
                </label>
              ))}
            </div>
          </fieldset>

          <label className="flex flex-col gap-2 text-sm font-medium">
            <span className="text-text-secondary">授权版本</span>
            <select
              className="border-border bg-background h-9 rounded-md border px-3 text-sm"
              data-testid="org-auth-edition-select"
              value={formState.edition}
              onChange={(event) =>
                updateFormState({
                  edition: event.target.value as AuthorizationEdition | "",
                })
              }
            >
              <option value="">请选择</option>
              <option value="standard">标准版</option>
              <option value="advanced">高级版</option>
            </select>
          </label>

          <fieldset className="flex flex-col gap-2 text-sm font-medium lg:col-span-2">
            <legend className="text-text-secondary">等级</legend>
            <div className="grid grid-cols-5 gap-2">
              {orgAuthLevelOptions.map((level) => (
                <label
                  key={level}
                  className="border-border bg-background flex h-9 items-center justify-center gap-2 rounded-md border px-2 text-sm"
                >
                  <input
                    checked={formState.levels.includes(level)}
                    data-testid={`org-auth-level-${level}`}
                    type="checkbox"
                    onChange={() => toggleLevel(level)}
                  />
                  <span>{level}级</span>
                </label>
              ))}
            </div>
          </fieldset>

          <label className="flex flex-col gap-2 text-sm font-medium">
            <span className="text-text-secondary">账号额度</span>
            <input
              className="border-border bg-background h-9 rounded-md border px-3 text-sm"
              min="1"
              type="number"
              value={formState.accountQuota}
              onChange={(event) =>
                updateFormState({ accountQuota: event.target.value })
              }
            />
          </label>

          <label className="flex flex-col gap-2 text-sm font-medium">
            <span className="text-text-secondary">开始日期</span>
            <input
              className="border-border bg-background h-9 rounded-md border px-3 text-sm"
              type="date"
              value={formState.startsAt}
              onChange={(event) =>
                updateFormState({ startsAt: event.target.value })
              }
            />
          </label>

          <label className="flex flex-col gap-2 text-sm font-medium">
            <span className="text-text-secondary">到期日期</span>
            <input
              className="border-border bg-background h-9 rounded-md border px-3 text-sm"
              type="date"
              value={formState.expiresAt}
              onChange={(event) =>
                updateFormState({ expiresAt: event.target.value })
              }
            />
          </label>
        </div>

        <div className="border-border bg-background rounded-md border p-3">
          <div className="flex flex-col gap-1">
            <p className="text-text-primary text-sm font-medium">覆盖企业</p>
            <p className="text-text-muted text-xs leading-5">
              选择“本企业及下级”时，后端按购买主体自动展开下级；选择“指定企业列表”时，只覆盖勾选的企业节点。
            </p>
          </div>
          <div className="mt-3 grid gap-2 md:grid-cols-2 xl:grid-cols-3">
            {organizations.map((organization) => {
              const organizationDepth =
                organizationDepthByPublicId.get(organization.publicId) ?? 0;
              const isChecked =
                formState.authScopeType === "specified_nodes"
                  ? formState.organizationPublicIds.includes(
                      organization.publicId,
                    )
                  : organization.publicId === selectedPurchaserPublicId;

              return (
                <label
                  key={organization.publicId}
                  className={`border-border bg-surface flex items-start gap-2 rounded-md border py-2 pr-3 text-sm ${getOrganizationDepthPaddingClassName(organizationDepth)}`}
                >
                  <input
                    aria-label={organization.name}
                    checked={isChecked}
                    className="mt-1"
                    disabled={formState.authScopeType !== "specified_nodes"}
                    type="checkbox"
                    onChange={() =>
                      toggleOrganizationPublicId(organization.publicId)
                    }
                  />
                  <span className="min-w-0">
                    <span className="text-text-primary block font-medium">
                      {organization.name}
                    </span>
                    <span className="text-text-muted block text-xs">
                      {orgTierLabels[organization.orgTier]}
                    </span>
                  </span>
                </label>
              );
            })}
          </div>
        </div>

        <OrgAuthAtomicScopePreview
          coverageOrganizations={coverageOrganizations}
          formState={formState}
        />

        <OrgAuthOverlapClosureGuidance />

        {formValidation.message === null ? null : (
          <p className="text-destructive text-sm">{formValidation.message}</p>
        )}

        <div className="flex justify-end">
          <button
            type="button"
            className="bg-primary text-primary-foreground inline-flex h-9 items-center justify-center rounded-lg px-4 text-sm font-medium transition-transform active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
            data-testid="org-auth-create-button"
            disabled={isCreateDisabled}
            onClick={onCreateOrgAuth}
          >
            创建企业授权
          </button>
        </div>
      </div>
    </section>
  );
}

function RedeemCodeFilterToolbar({
  keyword,
  onGenerate,
  onKeywordChange,
  onPageSizeChange,
  onReset,
  onSortChange,
  onStatusChange,
  pageSize,
  resultLabel,
  sortOrder,
  status,
}: {
  keyword: string;
  onGenerate: () => void;
  onKeywordChange: (value: string) => void;
  onPageSizeChange: (value: string) => void;
  onReset: () => void;
  onSortChange: (sortBy: string) => void;
  onStatusChange: (value: RedeemCodeStatus | "all") => void;
  pageSize: number;
  resultLabel: string;
  sortOrder: "asc" | "desc";
  status: RedeemCodeStatus | "all";
}) {
  return (
    <AdminListToolbar
      description="按卡密状态或关键词缩小分发记录；筛选变化自动回到第一页。"
      primaryAction={
        <button
          type="button"
          className="bg-primary text-primary-foreground inline-flex h-9 items-center gap-2 rounded-md px-3 text-sm font-medium transition-transform active:scale-[0.98]"
          onClick={onGenerate}
        >
          <PlusCircle className="size-4" aria-hidden="true" />
          生成卡密
        </button>
      }
      resultLabel={resultLabel}
      title="卡密筛选"
    >
      <label className={adminListFilterLabelClassName}>
        <span>关键词</span>
        <input
          aria-label="卡密搜索"
          className={`border-border bg-background rounded-md border px-3 text-sm ${adminListControlClassName}`}
          placeholder="卡密号或批次关键词"
          value={keyword}
          onChange={(event) => onKeywordChange(event.target.value)}
        />
      </label>
      <label className={adminListFilterLabelClassName}>
        <span>卡密状态</span>
        <select
          aria-label="卡密状态"
          className={`border-border bg-background rounded-md border px-3 text-sm ${adminListControlClassName}`}
          value={status}
          onChange={(event) =>
            onStatusChange(event.target.value as RedeemCodeStatus | "all")
          }
        >
          <option value="all">全部状态</option>
          <option value="unused">未使用</option>
          <option value="used">已使用</option>
          <option value="expired">已过期</option>
        </select>
      </label>
      <button
        type="button"
        className={`border-border bg-background hover:bg-muted rounded-md border px-3 text-sm font-medium ${adminListControlClassName}`}
        onClick={() => onSortChange("createdAt")}
      >
        创建时间{sortOrder === "desc" ? "倒序" : "正序"}
      </button>
      <label className={adminListFilterLabelClassName}>
        <span>每页条数</span>
        <select
          aria-label="卡密每页条数"
          className={`border-border bg-background rounded-md border px-3 text-sm ${adminListControlClassName}`}
          value={`${pageSize}`}
          onChange={(event) => onPageSizeChange(event.target.value)}
        >
          {ADMIN_PAGE_SIZE_OPTIONS.map((optionPageSize) => (
            <option key={optionPageSize} value={optionPageSize}>
              {optionPageSize}
            </option>
          ))}
        </select>
      </label>
      <button
        type="button"
        className={`border-border bg-background hover:bg-muted rounded-md border px-3 text-sm font-medium ${adminListControlClassName}`}
        onClick={onReset}
      >
        重置筛选
      </button>
    </AdminListToolbar>
  );
}

function RedeemCodeGenerationPanel({
  disabled,
  formState,
  id,
  onGenerateRedeemCode,
  onFormChange,
}: {
  disabled: boolean;
  formState: RedeemCodeGenerationFormState;
  id?: string;
  onFormChange: (formState: RedeemCodeGenerationFormState) => void;
  onGenerateRedeemCode: (input: CreateRedeemCodeInput) => void;
}) {
  const formValidation = buildRedeemCodeGenerationInput(formState);
  const isGenerateDisabled = disabled || formValidation.input === null;

  function updateFormState(nextFields: Partial<RedeemCodeGenerationFormState>) {
    onFormChange({
      ...formState,
      ...nextFields,
    });
  }

  function handleGenerateRedeemCode() {
    if (formValidation.input === null) {
      return;
    }

    onGenerateRedeemCode(formValidation.input);
  }

  return (
    <section className="space-y-5" id={id}>
      <div className="space-y-1">
        <h2 className="text-text-primary text-base font-semibold">生成参数</h2>
        <p className="text-text-muted text-sm leading-5">
          明确选择卡密类型和授权范围，核对数量与有效期后再提交二次确认。
        </p>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        <div className="flex flex-col gap-2 text-sm font-medium md:col-span-2">
          <span className="text-text-secondary">生成模式</span>
          <div className="flex gap-2">
            <button
              aria-pressed={formState.generationMode === "single"}
              type="button"
              className={`inline-flex h-9 items-center justify-center rounded-lg px-3 text-sm font-medium transition-transform active:scale-[0.98] ${
                formState.generationMode === "single"
                  ? "bg-primary text-primary-foreground"
                  : "border-border bg-background hover:bg-muted hover:text-foreground border"
              }`}
              data-testid="redeem-code-generation-mode-single"
              onClick={() =>
                updateFormState({
                  count: "1",
                  generationMode: "single",
                })
              }
            >
              单个
            </button>
            <button
              aria-pressed={formState.generationMode === "batch"}
              type="button"
              className={`inline-flex h-9 items-center justify-center rounded-lg px-3 text-sm font-medium transition-transform active:scale-[0.98] ${
                formState.generationMode === "batch"
                  ? "bg-primary text-primary-foreground"
                  : "border-border bg-background hover:bg-muted hover:text-foreground border"
              }`}
              data-testid="redeem-code-generation-mode-batch"
              onClick={() =>
                updateFormState({
                  generationMode: "batch",
                })
              }
            >
              批量
            </button>
          </div>
        </div>

        <label className="flex flex-col gap-2 text-sm font-medium">
          <span className="text-text-secondary">卡密类型</span>
          <select
            className="border-border bg-background h-9 rounded-md border px-3 text-sm"
            data-testid="redeem-code-generation-type-select"
            value={formState.redeemCodeType}
            onChange={(event) =>
              updateFormState({
                redeemCodeType: event.target.value as RedeemCodeType | "",
              })
            }
          >
            <option value="">请选择</option>
            <option value="personal_standard_activation">个人标准版开通</option>
            <option value="personal_advanced_activation">个人高级版开通</option>
            <option value="edition_upgrade">升级卡密</option>
          </select>
        </label>

        {formState.generationMode === "batch" ? (
          <label className="flex flex-col gap-2 text-sm font-medium">
            <span className="text-text-secondary">生成数量</span>
            <input
              className="border-border bg-background h-9 rounded-md border px-3 text-sm"
              data-testid="redeem-code-generation-count-input"
              max={100}
              min={1}
              type="number"
              value={formState.count}
              onChange={(event) =>
                updateFormState({ count: event.target.value })
              }
            />
          </label>
        ) : null}

        <div className="border-border border-t pt-4 md:col-span-2">
          <h3 className="text-text-primary text-sm font-semibold">授权范围</h3>
          <p className="text-text-muted mt-1 text-xs">
            卡密只作用于明确选择的专业和等级。
          </p>
        </div>

        <label className="flex flex-col gap-2 text-sm font-medium">
          <span className="text-text-secondary">专业</span>
          <select
            className="border-border bg-background h-9 rounded-md border px-3 text-sm"
            data-testid="redeem-code-generation-profession-select"
            value={formState.profession}
            onChange={(event) =>
              updateFormState({
                profession: event.target.value as Profession | "",
              })
            }
          >
            <option value="">请选择</option>
            <option value="monopoly">{professionLabels.monopoly}</option>
            <option value="marketing">{professionLabels.marketing}</option>
            <option value="logistics">{professionLabels.logistics}</option>
          </select>
        </label>

        <label className="flex flex-col gap-2 text-sm font-medium">
          <span className="text-text-secondary">等级</span>
          <input
            className="border-border bg-background h-9 rounded-md border px-3 text-sm"
            data-testid="redeem-code-generation-level-input"
            max={5}
            min={1}
            type="number"
            value={formState.level}
            onChange={(event) => updateFormState({ level: event.target.value })}
          />
        </label>

        <div className="border-border border-t pt-4 md:col-span-2">
          <h3 className="text-text-primary text-sm font-semibold">有效期</h3>
          <p className="text-text-muted mt-1 text-xs">
            授权时长和最晚兑换日期均沿用现有校验规则。
          </p>
        </div>

        <label className="flex flex-col gap-2 text-sm font-medium">
          <span className="text-text-secondary">授权天数</span>
          <input
            className="border-border bg-background h-9 rounded-md border px-3 text-sm"
            data-testid="redeem-code-generation-duration-input"
            max={1095}
            min={1}
            type="number"
            value={formState.durationDay}
            onChange={(event) =>
              updateFormState({ durationDay: event.target.value })
            }
          />
        </label>

        <label className="flex flex-col gap-2 text-sm font-medium">
          <span className="text-text-secondary">兑换截止</span>
          <input
            className="border-border bg-background h-9 rounded-md border px-3 text-sm"
            data-testid="redeem-code-generation-deadline-input"
            type="date"
            value={formState.redeemDeadlineDate}
            onChange={(event) =>
              updateFormState({ redeemDeadlineDate: event.target.value })
            }
          />
        </label>
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
        <p className="text-text-muted text-sm">
          {formValidation.message ??
            "参数完整。提交后还需核对最终数量、类型、授权范围和有效期。"}
        </p>
        <button
          type="button"
          className="bg-primary text-primary-foreground inline-flex h-9 items-center justify-center rounded-lg px-4 text-sm font-medium transition-transform active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
          data-testid="redeem-code-generate-button"
          disabled={isGenerateDisabled}
          onClick={handleGenerateRedeemCode}
        >
          生成卡密
        </button>
      </div>
    </section>
  );
}

function createOrganizationTreeSearchParams(input: {
  keyword: string;
  orgTier: OrgTier | "all";
  page: number;
  parentOrganizationPublicId: string | null;
  status: UserStatus | "all";
}) {
  const searchParams = new URLSearchParams({
    page: String(input.page),
    pageSize: String(ORGANIZATION_TREE_PAGE_SIZE),
    sortOrder: "asc",
  });
  const keyword = input.keyword.trim();

  if (keyword.length > 0) {
    searchParams.set("keyword", keyword);
  }

  if (input.orgTier !== "all") {
    searchParams.set("orgTier", input.orgTier);
  }

  if (input.status !== "all") {
    searchParams.set("status", input.status);
  }

  if (input.parentOrganizationPublicId !== null) {
    searchParams.set(
      "parentOrganizationPublicId",
      input.parentOrganizationPublicId,
    );
  }

  return searchParams.toString();
}

function useOrganizationTreeData(input: {
  keyword: string;
  orgTier: OrgTier | "all";
  refreshVersion: number;
  status: UserStatus | "all";
}) {
  const [data, setData] = useState<OrganizationTreeData>({
    branches: {},
    nodesByPublicId: {},
  });
  const [loadState, setLoadState] =
    useState<OrganizationTreeLoadState>("loading");
  const [expandedPublicIds, setExpandedPublicIds] = useState<Set<string>>(
    () => new Set(),
  );
  const requestGenerationRef = useRef(0);
  const isFilteredSearch =
    input.keyword.trim().length > 0 ||
    input.orgTier !== "all" ||
    input.status !== "all";

  const loadBranch = useCallback(
    async (parentOrganizationPublicId: string | null, page = 1) => {
      const requestGeneration = requestGenerationRef.current;
      const sessionToken = getStoredSessionToken();

      if (sessionToken === null) {
        setLoadState("error");
        return;
      }

      const branchKey =
        parentOrganizationPublicId ?? ORGANIZATION_TREE_ROOT_KEY;

      try {
        const response = await fetchAdminApi<OrganizationTreeNodeListDto>(
          `/api/v1/organization-tree-nodes?${createOrganizationTreeSearchParams(
            {
              keyword: input.keyword,
              orgTier: input.orgTier,
              page,
              parentOrganizationPublicId,
              status: input.status,
            },
          )}`,
          sessionToken,
        );

        if (requestGeneration !== requestGenerationRef.current) {
          return;
        }

        if (response.code !== 0 || response.data === null) {
          setLoadState("error");
          return;
        }

        const responseData = response.data;

        const pagination = response.pagination ?? {
          page,
          pageSize: ORGANIZATION_TREE_PAGE_SIZE,
          sortBy: "name",
          sortOrder: "asc",
          total: responseData.nodes.length,
        };

        setData((currentData) => {
          const previousPublicIds =
            page === 1
              ? []
              : (currentData.branches[branchKey]?.publicIds ?? []);
          const nextPublicIds = [
            ...new Set([
              ...previousPublicIds,
              ...responseData.nodes.map((node) => node.publicId),
            ]),
          ];

          return {
            branches: {
              ...currentData.branches,
              [branchKey]: {
                page: pagination.page,
                pageSize: pagination.pageSize,
                publicIds: nextPublicIds,
                total: pagination.total,
              },
            },
            nodesByPublicId: {
              ...currentData.nodesByPublicId,
              ...Object.fromEntries(
                responseData.nodes.map((node) => [node.publicId, node]),
              ),
            },
          };
        });
        setLoadState("ready");
      } catch {
        if (requestGeneration !== requestGenerationRef.current) {
          return;
        }

        setLoadState("error");
      }
    },
    [input.keyword, input.orgTier, input.status],
  );

  useEffect(() => {
    let isActive = true;
    requestGenerationRef.current += 1;
    const loadTimer = window.setTimeout(() => {
      if (!isActive) {
        return;
      }

      setData({ branches: {}, nodesByPublicId: {} });
      setExpandedPublicIds(new Set());
      setLoadState("loading");
      void loadBranch(null);
    }, 80);

    return () => {
      isActive = false;
      window.clearTimeout(loadTimer);
    };
  }, [input.refreshVersion, loadBranch]);

  async function handleToggleNode(publicId: string) {
    if (expandedPublicIds.has(publicId)) {
      setExpandedPublicIds((currentIds) => {
        const nextIds = new Set(currentIds);

        nextIds.delete(publicId);
        return nextIds;
      });
      return;
    }

    if (data.branches[publicId] === undefined) {
      await loadBranch(publicId);
    }

    setExpandedPublicIds((currentIds) => new Set([...currentIds, publicId]));
  }

  async function handleLoadMore(publicId: string | null) {
    const branchKey = publicId ?? ORGANIZATION_TREE_ROOT_KEY;
    const branch = data.branches[branchKey];

    if (branch === undefined || branch.publicIds.length >= branch.total) {
      return;
    }

    await loadBranch(publicId, branch.page + 1);
  }

  return {
    data,
    expandedPublicIds,
    isFilteredSearch,
    loadState,
    onLoadMore: handleLoadMore,
    onToggleNode: handleToggleNode,
  };
}

function useAdminOrgAuthData() {
  const [canMoveOrganization, setCanMoveOrganization] = useState(false);
  const [loadState, setLoadState] = useState<LoadState>("loading");
  const [data, setData] = useState<AdminOrgAuthData>({
    employees: [],
    orgAuths: [],
    organizations: [],
  });

  useEffect(() => {
    let isActive = true;

    async function loadAdminOrgAuthData() {
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

        setCanMoveOrganization(
          sessionResponse.data.user.adminRoles?.includes("super_admin") ===
            true,
        );

        const [organizationResponse, orgAuthResponse, employeeResponse] =
          await Promise.all([
            fetchAdminApi<OrganizationListDto>(
              `/api/v1/organizations?${DEFAULT_LIST_QUERY}`,
              sessionToken,
            ),
            fetchAdminApi<OrgAuthListDto>(
              `/api/v1/org-auths?${DEFAULT_LIST_QUERY}`,
              sessionToken,
            ),
            fetchAdminApi<EmployeeListDto>(
              `/api/v1/employees?${DEFAULT_LIST_QUERY}`,
              sessionToken,
            ),
          ]);

        if (!isActive) {
          return;
        }

        if (
          organizationResponse.code !== 0 ||
          organizationResponse.data === null ||
          orgAuthResponse.code !== 0 ||
          orgAuthResponse.data === null ||
          employeeResponse.code !== 0 ||
          employeeResponse.data === null
        ) {
          setLoadState("error");
          return;
        }

        const nextData = {
          employees: employeeResponse.data.employees,
          orgAuths: orgAuthResponse.data.orgAuths,
          organizations: organizationResponse.data.organizations,
        };

        setData(nextData);
        setLoadState("ready");
      } catch {
        if (isActive) {
          setLoadState("error");
        }
      }
    }

    void loadAdminOrgAuthData();

    return () => {
      isActive = false;
    };
  }, []);

  return {
    canMoveOrganization,
    data,
    loadState,
    setData,
    setLoadState,
  };
}

function useAdminOrgAuthListData(
  enabled: boolean,
  listQuery: string,
  refreshVersion: number,
) {
  const [loadState, setLoadState] = useState<LoadState>("loading");
  const [data, setData] = useState<AdminOrgAuthListData>({
    orgAuths: [],
    pagination: null,
  });

  useEffect(() => {
    let isActive = true;

    if (!enabled) {
      return () => {
        isActive = false;
      };
    }

    async function loadOrgAuthList() {
      const sessionToken = getStoredSessionToken();

      if (sessionToken === null) {
        setLoadState("unauthorized");
        return;
      }

      setLoadState("loading");

      try {
        const response = await fetchAdminApi<AdminOrgAuthListDto>(
          `/api/v1/org-auths?${listQuery}`,
          sessionToken,
        );

        if (!isActive) {
          return;
        }

        if (response.code !== 0 || response.data === null) {
          setLoadState("error");
          return;
        }

        setData({
          orgAuths: response.data.orgAuths,
          pagination: response.pagination ?? null,
        });
        setLoadState(response.data.orgAuths.length === 0 ? "empty" : "ready");
      } catch {
        if (isActive) {
          setLoadState("error");
        }
      }
    }

    void loadOrgAuthList();

    return () => {
      isActive = false;
    };
  }, [enabled, listQuery, refreshVersion]);

  return { data, loadState };
}

function useAdminEmployeeListData(
  enabled: boolean,
  listQuery: string,
  refreshVersion: number,
) {
  const [loadState, setLoadState] = useState<LoadState>("loading");
  const [data, setData] = useState<AdminEmployeeListData>({
    employees: [],
    pagination: null,
  });

  useEffect(() => {
    let isActive = true;

    if (!enabled) {
      return () => {
        isActive = false;
      };
    }

    async function loadEmployeeList() {
      const sessionToken = getStoredSessionToken();

      if (sessionToken === null) {
        setLoadState("unauthorized");
        return;
      }

      setLoadState("loading");

      try {
        const response = await fetchAdminApi<AdminEmployeeListDto>(
          `/api/v1/employees?${listQuery}`,
          sessionToken,
        );

        if (!isActive) {
          return;
        }

        if (response.code !== 0 || response.data === null) {
          setLoadState("error");
          return;
        }

        setData({
          employees: response.data.employees,
          pagination: response.pagination ?? null,
        });
        setLoadState(response.data.employees.length === 0 ? "empty" : "ready");
      } catch {
        if (isActive) {
          setLoadState("error");
        }
      }
    }

    void loadEmployeeList();

    return () => {
      isActive = false;
    };
  }, [enabled, listQuery, refreshVersion]);

  return { data, loadState };
}

function useAdminRedeemCodeData(listQuery: string) {
  const [loadState, setLoadState] = useState<LoadState>("loading");
  const [data, setData] = useState<AdminRedeemCodeData>({
    pagination: null,
    redeemCodes: [],
  });

  useEffect(() => {
    let isActive = true;

    async function loadAdminRedeemCodeData() {
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

        const redeemCodeResponse = await fetchAdminApi<RedeemCodeListDto>(
          `/api/v1/redeem-codes?${listQuery}`,
          sessionToken,
        );

        if (!isActive) {
          return;
        }

        if (redeemCodeResponse.code !== 0 || redeemCodeResponse.data === null) {
          setLoadState("error");
          return;
        }

        setData({
          pagination: redeemCodeResponse.pagination ?? null,
          redeemCodes: redeemCodeResponse.data.redeemCodes,
        });
        setLoadState(
          redeemCodeResponse.data.redeemCodes.length === 0 ? "empty" : "ready",
        );
      } catch {
        if (isActive) {
          setLoadState("error");
        }
      }
    }

    void loadAdminRedeemCodeData();

    return () => {
      isActive = false;
    };
  }, [listQuery]);

  return { data, loadState, setData, setLoadState };
}

export function AdminOrgAuthPage() {
  const { canMoveOrganization, data, loadState, setData, setLoadState } =
    useAdminOrgAuthData();
  const [employeeImportSessionToken, setEmployeeImportSessionToken] = useState<
    string | null
  >(() => (typeof window === "undefined" ? null : getStoredSessionToken()));
  const employeeImportCommand = useEmployeeImportCommand({
    sessionToken: employeeImportSessionToken,
  });
  const [orgAuthKeyword, setOrgAuthKeyword] = useState("");
  const [orgAuthStatus, setOrgAuthStatus] = useState<AuthStatus | "all">("all");
  const [orgAuthEdition, setOrgAuthEdition] = useState<
    AuthorizationEdition | "all"
  >("all");
  const [orgAuthProfession, setOrgAuthProfession] = useState<
    Profession | "all"
  >("all");
  const [orgAuthLevel, setOrgAuthLevel] = useState<number | "all">("all");
  const [orgAuthExpiryStatus, setOrgAuthExpiryStatus] =
    useState<OrgAuthExpiryStatus>("all");
  const [orgAuthListRefreshVersion, setOrgAuthListRefreshVersion] = useState(0);
  const [isOrgAuthCreateDrawerOpen, setIsOrgAuthCreateDrawerOpen] =
    useState(false);
  const {
    handleFilterChange: handleOrgAuthFilterChange,
    handlePageChange: handleOrgAuthPageChange,
    handlePageSizeChange: handleOrgAuthPageSizeChange,
    handleReset: handleOrgAuthListReset,
    handleSortChange: handleOrgAuthSortChange,
    query: orgAuthListInteractionQuery,
  } = useAdminListInteraction({
    initialQuery: {
      sortBy: "expiresAt",
      sortOrder: "asc",
    },
  });
  const orgAuthListQuery = useMemo(
    () =>
      createOrgAuthListQuery({
        edition: orgAuthEdition,
        expiryStatus: orgAuthExpiryStatus,
        keyword: orgAuthKeyword,
        level: orgAuthLevel,
        profession: orgAuthProfession,
        query: orgAuthListInteractionQuery,
        status: orgAuthStatus,
      }),
    [
      orgAuthEdition,
      orgAuthExpiryStatus,
      orgAuthKeyword,
      orgAuthLevel,
      orgAuthListInteractionQuery,
      orgAuthProfession,
      orgAuthStatus,
    ],
  );
  const { data: orgAuthListData, loadState: orgAuthListLoadState } =
    useAdminOrgAuthListData(
      loadState === "ready" || loadState === "empty",
      orgAuthListQuery,
      orgAuthListRefreshVersion,
    );
  const orgAuthListPagination =
    orgAuthListData.pagination ??
    createFallbackOrgAuthPagination(
      orgAuthListInteractionQuery,
      orgAuthListData.orgAuths.length,
    );
  const [employeeKeyword, setEmployeeKeyword] = useState("");
  const [employeeOrganizationKeyword, setEmployeeOrganizationKeyword] =
    useState("");
  const [employeeStatus, setEmployeeStatus] = useState<UserStatus | "all">(
    "all",
  );
  const [employeeListRefreshVersion, setEmployeeListRefreshVersion] =
    useState(0);
  const [isEmployeeImportDrawerOpen, setIsEmployeeImportDrawerOpen] = useState(
    () =>
      typeof window !== "undefined" &&
      new URLSearchParams(window.location.search).has("employeeImportCommand"),
  );
  const [selectedTransferEmployee, setSelectedTransferEmployee] = useState<
    AdminEmployeeListDto["employees"][number] | null
  >(null);
  const {
    handleFilterChange: handleEmployeeFilterChange,
    handlePageChange: handleEmployeePageChange,
    handlePageSizeChange: handleEmployeePageSizeChange,
    handleReset: handleEmployeeListReset,
    handleSortChange: handleEmployeeSortChange,
    query: employeeListInteractionQuery,
  } = useAdminListInteraction({
    initialQuery: {
      sortBy: "registeredAt",
      sortOrder: "desc",
    },
  });
  const employeeListQuery = useMemo(
    () =>
      createEmployeeListQuery({
        keyword: employeeKeyword,
        organizationKeyword: employeeOrganizationKeyword,
        query: employeeListInteractionQuery,
        status: employeeStatus,
      }),
    [
      employeeKeyword,
      employeeListInteractionQuery,
      employeeOrganizationKeyword,
      employeeStatus,
    ],
  );
  const { data: employeeListData, loadState: employeeListLoadState } =
    useAdminEmployeeListData(
      loadState === "ready" || loadState === "empty",
      employeeListQuery,
      employeeListRefreshVersion,
    );
  const employeeListPagination =
    employeeListData.pagination ??
    createFallbackEmployeePagination(
      employeeListInteractionQuery,
      employeeListData.employees.length,
    );
  const [activeView, setActiveView] = useState<OpsOrganizationManagementView>(
    readOpsOrganizationManagementViewFromLocation,
  );
  const [organizationTreeKeyword, setOrganizationTreeKeyword] = useState("");
  const [organizationTreeStatus, setOrganizationTreeStatus] = useState<
    UserStatus | "all"
  >("all");
  const [organizationTreeTier, setOrganizationTreeTier] = useState<
    OrgTier | "all"
  >("all");
  const [organizationTreeRefreshVersion, setOrganizationTreeRefreshVersion] =
    useState(0);
  const [isOrganizationFormOpen, setIsOrganizationFormOpen] = useState(false);
  const organizationTree = useOrganizationTreeData({
    keyword: organizationTreeKeyword,
    orgTier: organizationTreeTier,
    refreshVersion: organizationTreeRefreshVersion,
    status: organizationTreeStatus,
  });
  const [confirmationState, setConfirmationState] =
    useState<OrgAuthConfirmationState>(null);
  const [organizationConfirmationState, setOrganizationConfirmationState] =
    useState<OrganizationConfirmationState>(null);
  const [employeeConfirmationState, setEmployeeConfirmationState] =
    useState<EmployeeConfirmationState>(null);
  const [orgAuthFormState, setOrgAuthFormState] = useState<OrgAuthFormState>(
    defaultOrgAuthFormState,
  );
  const [organizationFormState, setOrganizationFormState] =
    useState<OrganizationFormState>(defaultOrganizationFormState);
  const [employeeImportText, setEmployeeImportText] = useState("");
  const [
    employeeImportOrganizationPublicId,
    setEmployeeImportOrganizationPublicId,
  ] = useState("");
  const [lastEmployeeTransferResult, setLastEmployeeTransferResult] =
    useState<EmployeeTransferResultDto | null>(null);
  const [lastEmployeeUnbindResult, setLastEmployeeUnbindResult] =
    useState<EmployeeUnbindResultDto | null>(null);
  const [selectedOrganizationPublicId, setSelectedOrganizationPublicId] =
    useState<string | null>(null);
  const [selectedOrgAuthPublicId, setSelectedOrgAuthPublicId] = useState<
    string | null
  >(null);
  const [selectedOrgAuthDetail, setSelectedOrgAuthDetail] =
    useState<OrgAuthDetailDto | null>(null);
  const [toastMessage, setToastMessage] = useState<ToastMessage | null>(null);
  const employeeImportPreview = useMemo(
    () =>
      buildEmployeeImportPreview(
        employeeImportText,
        employeeImportOrganizationPublicId,
        data.orgAuths,
      ),
    [data.orgAuths, employeeImportOrganizationPublicId, employeeImportText],
  );
  const selectedEmployeeImportOrganizationPublicId =
    employeeImportOrganizationPublicId;
  const organizationFormOptions = useMemo(() => {
    const organizationsByPublicId = new Map(
      data.organizations.map((organization) => [
        organization.publicId,
        organization,
      ]),
    );

    for (const organization of Object.values(
      organizationTree.data.nodesByPublicId,
    )) {
      organizationsByPublicId.set(organization.publicId, organization);
    }

    return [...organizationsByPublicId.values()];
  }, [data.organizations, organizationTree.data.nodesByPublicId]);
  const effectiveSelectedOrganizationPublicId =
    selectedOrganizationPublicId !== null &&
    organizationTree.data.nodesByPublicId[selectedOrganizationPublicId] !==
      undefined
      ? selectedOrganizationPublicId
      : (organizationTree.data.branches[ORGANIZATION_TREE_ROOT_KEY]
          ?.publicIds[0] ?? null);

  useEffect(() => {
    function handleSessionStorageChange(event: StorageEvent) {
      if (event.key === SESSION_TOKEN_STORAGE_KEY) {
        setEmployeeImportSessionToken(getStoredSessionToken());
      }
    }

    window.addEventListener("storage", handleSessionStorageChange);

    return () => {
      window.removeEventListener("storage", handleSessionStorageChange);
    };
  }, []);

  useEffect(() => {
    function handlePopState() {
      setActiveView(readOpsOrganizationManagementViewFromLocation());
    }

    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);

  function handleOrgManagementViewChange(
    nextView: OpsOrganizationManagementView,
  ) {
    setActiveView(nextView);
    if (nextView !== "org-auth") {
      setIsOrgAuthCreateDrawerOpen(false);
    }
    if (nextView !== "employees") {
      employeeImportCommand.clearPlaintext();
      setEmployeeImportText("");
      setIsEmployeeImportDrawerOpen(false);
      setSelectedTransferEmployee(null);
    }
    writeOpsOrganizationManagementViewToLocation(nextView);
  }

  function handleResetOrgAuthFilters() {
    setOrgAuthKeyword("");
    setOrgAuthStatus("all");
    setOrgAuthEdition("all");
    setOrgAuthProfession("all");
    setOrgAuthLevel("all");
    setOrgAuthExpiryStatus("all");
    handleOrgAuthListReset();
  }

  function handleResetEmployeeFilters() {
    setEmployeeKeyword("");
    setEmployeeOrganizationKeyword("");
    setEmployeeStatus("all");
    handleEmployeeListReset();
  }

  async function handleViewOrgAuthDetail(publicId: string) {
    const sessionToken = getStoredSessionToken();

    if (sessionToken === null) {
      setLoadState("unauthorized");
      return;
    }

    setSelectedOrgAuthPublicId(publicId);
    setSelectedOrgAuthDetail(null);

    const detailResponse = await fetchAdminApi<OrgAuthDetailResultDto>(
      `/api/v1/org-auths/${publicId}`,
      sessionToken,
    );

    if (detailResponse.code !== 0 || detailResponse.data === null) {
      setSelectedOrgAuthPublicId(null);
      setToastMessage({ message: detailResponse.message, tone: "error" });
      return;
    }

    setSelectedOrgAuthDetail(detailResponse.data.orgAuth);
  }

  async function handleConfirmOrgAuthAction() {
    const sessionToken = getStoredSessionToken();

    if (sessionToken === null || confirmationState === null) {
      setConfirmationState(null);
      setLoadState("unauthorized");
      return;
    }

    if (confirmationState.kind === "createOrgAuth") {
      const createResponse = await postAdminApi<OrgAuthResultDto>(
        "/api/v1/org-auths",
        sessionToken,
        confirmationState.input,
      );

      setConfirmationState(null);

      if (createResponse.code !== 0 || createResponse.data === null) {
        setToastMessage({
          message: formatOrgAuthErrorMessage(createResponse.message),
          tone: "error",
        });
        return;
      }

      const createdOrgAuths =
        createResponse.data.orgAuths.length > 0
          ? createResponse.data.orgAuths
          : [createResponse.data.orgAuth];

      setData((currentData) => ({
        ...currentData,
        orgAuths: [
          ...createdOrgAuths,
          ...currentData.orgAuths.filter(
            (orgAuth) =>
              !createdOrgAuths.some(
                (createdOrgAuth) =>
                  createdOrgAuth.publicId === orgAuth.publicId,
              ),
          ),
        ],
      }));
      setIsOrgAuthCreateDrawerOpen(false);
      setOrgAuthListRefreshVersion((version) => version + 1);
      setToastMessage({ message: "企业授权已创建", tone: "success" });
      return;
    }

    const cancelResponse = await postAdminApi<OrgAuthResultDto>(
      `/api/v1/org-auths/${confirmationState.publicId}/cancel`,
      sessionToken,
    );

    setConfirmationState(null);

    if (cancelResponse.code !== 0 || cancelResponse.data === null) {
      setToastMessage({
        message: cancelResponse.message,
        tone: "error",
      });
      return;
    }

    const cancelledOrgAuth = cancelResponse.data.orgAuth;

    setData((currentData) => ({
      ...currentData,
      orgAuths: currentData.orgAuths.map((orgAuth) =>
        orgAuth.publicId === cancelledOrgAuth.publicId
          ? cancelledOrgAuth
          : orgAuth,
      ),
    }));
    setOrgAuthListRefreshVersion((version) => version + 1);
    setToastMessage({ message: "企业授权已取消", tone: "success" });
  }

  function handleEditOrganization(
    organization: AdminOrgAuthData["organizations"][number],
  ) {
    setOrganizationFormState({
      contactName: "",
      contactPhone: "",
      expectedRevision: organization.revision,
      mode: "update",
      name: organization.name,
      orgTier: organization.orgTier,
      parentOrganizationPublicId: organization.parentOrganizationPublicId ?? "",
      publicId: organization.publicId,
      remark: "",
    });
    setIsOrganizationFormOpen(true);
  }

  function handleMoveOrganization(organization: OrganizationTreeQueryNodeDto) {
    setOrganizationFormState({
      ...defaultOrganizationFormState,
      expectedRevision: organization.revision,
      mode: "move",
      name: organization.name,
      orgTier: organization.orgTier,
      parentOrganizationPublicId: organization.parentOrganizationPublicId ?? "",
      publicId: organization.publicId,
    });
    setIsOrganizationFormOpen(true);
  }

  function handleCreateRootOrganization() {
    setOrganizationFormState(defaultOrganizationFormState);
    setIsOrganizationFormOpen(true);
  }

  function handleCreateChildOrganization(
    organization: OrganizationTreeQueryNodeDto,
  ) {
    const childOrgTier = childOrgTierByParentTier[organization.orgTier];

    if (childOrgTier === null) {
      return;
    }

    setOrganizationFormState({
      ...defaultOrganizationFormState,
      orgTier: childOrgTier,
      parentOrganizationPublicId: organization.publicId,
    });
    setIsOrganizationFormOpen(true);
  }

  function handleSubmitOrganization() {
    const organizationDraft = buildOrganizationInput(
      organizationFormState,
      organizationFormOptions,
    );

    if (organizationDraft.input === null) {
      setToastMessage({
        message: organizationDraft.message ?? "企业组织输入无效。",
        tone: "error",
      });
      return;
    }

    if (
      organizationFormState.mode === "move" &&
      organizationFormState.publicId !== null
    ) {
      setOrganizationConfirmationState({
        input: organizationDraft.input as OrganizationMoveInput,
        kind: "moveOrganization",
        publicId: organizationFormState.publicId,
      });
      return;
    }

    setOrganizationConfirmationState({
      kind:
        organizationFormState.mode === "create"
          ? "createOrganization"
          : "updateOrganization",
      input: organizationDraft.input as OrganizationMutationInput,
      publicId: organizationFormState.publicId,
    });
  }

  async function handleConfirmOrganizationAction() {
    const sessionToken = getStoredSessionToken();

    if (sessionToken === null || organizationConfirmationState === null) {
      setOrganizationConfirmationState(null);
      setLoadState("unauthorized");
      return;
    }

    if (organizationConfirmationState.kind === "disableOrganization") {
      const disableResponse = await postAdminApi<DisableOrganizationResultDto>(
        `/api/v1/organizations/${organizationConfirmationState.publicId}/disable`,
        sessionToken,
        {
          expectedRevision: organizationConfirmationState.expectedRevision,
          isCascade: organizationConfirmationState.isCascade,
        },
      );

      setOrganizationConfirmationState(null);

      if (disableResponse.code !== 0 || disableResponse.data === null) {
        setToastMessage({
          message: disableResponse.message,
          tone: "error",
        });
        return;
      }

      const disabledOrganization = disableResponse.data.organization;

      setData((currentData) => ({
        ...currentData,
        organizations: currentData.organizations.map((organization) =>
          organization.publicId === disabledOrganization.publicId
            ? mapOrganizationResultToListItem(
                disabledOrganization,
                organization,
              )
            : organization,
        ),
      }));
      setOrganizationTreeRefreshVersion((version) => version + 1);
      setToastMessage({ message: "企业组织已停用。", tone: "success" });
      return;
    }

    if (organizationConfirmationState.kind === "enableOrganization") {
      const enableResponse = await postAdminApi<OrganizationResultDto>(
        `/api/v1/organizations/${organizationConfirmationState.publicId}/enable`,
        sessionToken,
        {
          expectedRevision: organizationConfirmationState.expectedRevision,
          isCascade: organizationConfirmationState.isCascade,
        },
      );

      setOrganizationConfirmationState(null);

      if (enableResponse.code !== 0 || enableResponse.data === null) {
        setToastMessage({
          message: enableResponse.message,
          tone: "error",
        });
        return;
      }

      const enabledOrganization = enableResponse.data.organization;

      setData((currentData) => ({
        ...currentData,
        organizations: currentData.organizations.map((organization) =>
          organization.publicId === enabledOrganization.publicId
            ? mapOrganizationResultToListItem(enabledOrganization, organization)
            : organization,
        ),
      }));
      setOrganizationTreeRefreshVersion((version) => version + 1);
      setToastMessage({ message: "企业组织已启用。", tone: "success" });
      return;
    }

    if (organizationConfirmationState.kind === "moveOrganization") {
      const moveResponse = await postAdminApi<OrganizationResultDto>(
        `/api/v1/organizations/${organizationConfirmationState.publicId}/move`,
        sessionToken,
        organizationConfirmationState.input,
      );

      setOrganizationConfirmationState(null);

      if (moveResponse.code !== 0 || moveResponse.data === null) {
        setToastMessage({ message: moveResponse.message, tone: "error" });
        return;
      }

      const movedOrganization = moveResponse.data.organization;

      setData((currentData) => ({
        ...currentData,
        organizations: currentData.organizations.map((organization) =>
          organization.publicId === movedOrganization.publicId
            ? mapOrganizationResultToListItem(movedOrganization, organization)
            : organization,
        ),
      }));
      setOrganizationFormState(defaultOrganizationFormState);
      setIsOrganizationFormOpen(false);
      setOrganizationTreeRefreshVersion((version) => version + 1);
      setToastMessage({ message: "企业组织已移动。", tone: "success" });
      return;
    }

    if (
      organizationConfirmationState.kind !== "createOrganization" &&
      organizationConfirmationState.kind !== "updateOrganization"
    ) {
      return;
    }

    const mutationInput = organizationConfirmationState.input;
    const mutationResponse =
      organizationConfirmationState.kind === "createOrganization"
        ? await postAdminApi<OrganizationResultDto>(
            "/api/v1/organizations",
            sessionToken,
            mutationInput,
          )
        : organizationConfirmationState.publicId === null
          ? null
          : await patchAdminApi<OrganizationResultDto>(
              `/api/v1/organizations/${organizationConfirmationState.publicId}`,
              sessionToken,
              mutationInput,
            );

    setOrganizationConfirmationState(null);

    if (
      mutationResponse === null ||
      mutationResponse.code !== 0 ||
      mutationResponse.data === null
    ) {
      setToastMessage({
        message: mutationResponse?.message ?? "企业组织输入无效。",
        tone: "error",
      });
      return;
    }

    const updatedOrganization = mutationResponse.data.organization;

    setData((currentData) => {
      const currentOrganization = currentData.organizations.find(
        (organization) =>
          organization.publicId === updatedOrganization.publicId,
      );
      const nextOrganization = mapOrganizationResultToListItem(
        updatedOrganization,
        currentOrganization,
      );

      return {
        ...currentData,
        organizations:
          currentOrganization === undefined
            ? [nextOrganization, ...currentData.organizations]
            : currentData.organizations.map((organization) =>
                organization.publicId === updatedOrganization.publicId
                  ? nextOrganization
                  : organization,
              ),
      };
    });
    setOrganizationFormState(defaultOrganizationFormState);
    setIsOrganizationFormOpen(false);
    setSelectedOrganizationPublicId(updatedOrganization.publicId);
    setOrganizationTreeRefreshVersion((version) => version + 1);
    setToastMessage({
      message:
        organizationConfirmationState.kind === "createOrganization"
          ? "企业组织已新增。"
          : "企业组织已更新。",
      tone: "success",
    });
  }

  function handleSubmitEmployeeImport() {
    if (!employeeImportPreview.isReady) {
      setToastMessage({
        message: employeeImportPreview.message,
        tone: "error",
      });
      return;
    }

    const importDraft = buildEmployeeImportInput(
      employeeImportText,
      selectedEmployeeImportOrganizationPublicId,
    );

    if (importDraft.input === null) {
      setToastMessage({
        message: importDraft.message ?? "员工导入输入无效。",
        tone: "error",
      });
      return;
    }

    setEmployeeConfirmationState({
      kind: "importEmployees",
      input: importDraft.input,
    });
  }

  async function handleConfirmEmployeeAction() {
    const sessionToken = getStoredSessionToken();

    if (sessionToken === null || employeeConfirmationState === null) {
      setEmployeeConfirmationState(null);
      setLoadState("unauthorized");
      return;
    }

    if (employeeConfirmationState.kind === "importEmployees") {
      const submittedCommand = await employeeImportCommand.submit(
        employeeConfirmationState.input,
      );
      setEmployeeConfirmationState(null);

      if (submittedCommand === null) {
        setToastMessage({
          message: "员工导入命令提交失败，请按当前状态恢复。",
          tone: "error",
        });
        return;
      }
      setLastEmployeeTransferResult(null);
      if (submittedCommand.status === "completed") {
        setEmployeeImportText("");
      }
      setEmployeeListRefreshVersion((version) => version + 1);
      setToastMessage({
        message:
          submittedCommand.status === "completed"
            ? `员工导入完成：成功 ${submittedCommand.counts.succeeded}，拒绝 ${submittedCommand.counts.rejected}。`
            : "员工导入命令处理中，可使用相同文件恢复。",
        tone:
          submittedCommand.status === "completed" &&
          submittedCommand.counts.rejected === 0
            ? "success"
            : "error",
      });
      return;
    }

    if (employeeConfirmationState.kind === "transferEmployee") {
      const transferResponse = await postAdminApi<EmployeeTransferResultDto>(
        `/api/v1/employees/${employeeConfirmationState.employeePublicId}/transfer`,
        sessionToken,
        {
          targetOrganizationPublicId:
            employeeConfirmationState.targetOrganizationPublicId,
        },
      );

      setEmployeeConfirmationState(null);

      if (transferResponse.code !== 0 || transferResponse.data === null) {
        setLastEmployeeTransferResult(null);
        setToastMessage({ message: transferResponse.message, tone: "error" });
        return;
      }

      const transferredEmployee = transferResponse.data;

      setData((currentData) => ({
        ...currentData,
        employees: currentData.employees.map((employee) =>
          employee.publicId === transferredEmployee.employeePublicId
            ? {
                ...employee,
                organizationPublicId:
                  transferredEmployee.targetOrganizationPublicId,
              }
            : employee,
        ),
        orgAuths: currentData.orgAuths.map((orgAuth) => {
          const coversPrevious = orgAuth.organizationPublicIds.includes(
            transferredEmployee.previousOrganizationPublicId,
          );
          const coversTarget = orgAuth.organizationPublicIds.includes(
            transferredEmployee.targetOrganizationPublicId,
          );
          const nextUsedQuota =
            orgAuth.usedQuota +
            (coversTarget ? 1 : 0) -
            (coversPrevious ? 1 : 0);

          return {
            ...orgAuth,
            usedQuota: Math.max(
              0,
              Math.min(orgAuth.accountQuota, nextUsedQuota),
            ),
          };
        }),
        organizations: currentData.organizations.map((organization) => {
          if (
            organization.publicId ===
            transferredEmployee.previousOrganizationPublicId
          ) {
            return {
              ...organization,
              employeeCount: Math.max(organization.employeeCount - 1, 0),
            };
          }

          if (
            organization.publicId ===
            transferredEmployee.targetOrganizationPublicId
          ) {
            return {
              ...organization,
              employeeCount: organization.employeeCount + 1,
            };
          }

          return organization;
        }),
      }));
      setLastEmployeeTransferResult(transferredEmployee);
      setLastEmployeeUnbindResult(null);
      setSelectedTransferEmployee(null);
      setEmployeeListRefreshVersion((version) => version + 1);
      setToastMessage({ message: "员工已转移。", tone: "success" });
      return;
    }

    const unbindResponse = await postAdminApi<EmployeeUnbindResultDto>(
      `/api/v1/employees/${employeeConfirmationState.publicId}/unbind`,
      sessionToken,
    );

    setEmployeeConfirmationState(null);

    if (unbindResponse.code !== 0 || unbindResponse.data === null) {
      setLastEmployeeUnbindResult(null);
      setToastMessage({ message: unbindResponse.message, tone: "error" });
      return;
    }

    const unboundEmployee = unbindResponse.data;

    setData((currentData) => ({
      ...currentData,
      employees: currentData.employees.filter(
        (employee) => employee.publicId !== unboundEmployee.employeePublicId,
      ),
      organizations: currentData.organizations.map((organization) =>
        organization.publicId === unboundEmployee.previousOrganizationPublicId
          ? {
              ...organization,
              employeeCount: Math.max(organization.employeeCount - 1, 0),
            }
          : organization,
      ),
    }));
    setLastEmployeeUnbindResult(unboundEmployee);
    setLastEmployeeTransferResult(null);
    setEmployeeListRefreshVersion((version) => version + 1);
    setToastMessage({ message: "员工已解绑。", tone: "success" });
  }

  async function handleEmployeeImportFileChange(file: File | null) {
    if (file === null) {
      return;
    }

    try {
      const fileContent = await file.text();

      setEmployeeImportText(fileContent);
      setLastEmployeeTransferResult(null);
      setToastMessage({ message: "员工名录文件已读取。", tone: "success" });
    } catch {
      setToastMessage({
        message: "员工名录文件读取失败，请重新选择 CSV/TSV 文件。",
        tone: "error",
      });
    }
  }

  if (loadState === "loading") {
    return <AdminLoadingState label="正在加载企业管理数据" />;
  }

  if (loadState === "unauthorized") {
    return <AdminUnauthorizedState />;
  }

  if (loadState === "error") {
    return (
      <AdminErrorState
        title="企业管理数据加载失败"
        description="请稍后刷新页面，或重新登录后再查看企业组织、企业授权和员工运营数据。"
      />
    );
  }

  if (loadState === "empty") {
    return (
      <AdminEmptyState
        title="暂无企业管理数据"
        description="当前没有可展示的企业、企业授权或员工账号记录。"
      />
    );
  }

  return (
    <main className="space-y-6">
      <AdminPageHeader
        title="企业管理"
        description="按组织架构、企业授权和员工运营三个任务域维护企业相关数据；现有授权、导入和组织写入规则保持不变。"
        icon={<Building2 className="size-5" aria-hidden="true" />}
      />

      <OperationsOrgAuthSummaryFirstBand
        employees={data.employees}
        organizations={data.organizations}
        orgAuths={data.orgAuths}
      />

      <OpsOrganizationManagementViewTabs
        activeView={activeView}
        employees={data.employees}
        organizations={data.organizations}
        orgAuths={data.orgAuths}
        onViewChange={handleOrgManagementViewChange}
      />

      <section
        className={activeView === "organization-tree" ? "space-y-6" : "hidden"}
        data-testid="ops-organization-tree-view"
        hidden={activeView !== "organization-tree"}
      >
        <OrganizationTreeGuidancePanel />
        <OrganizationTreeWorkspace
          canMoveOrganization={canMoveOrganization}
          data={organizationTree.data}
          expandedPublicIds={organizationTree.expandedPublicIds}
          isFilteredSearch={organizationTree.isFilteredSearch}
          keyword={organizationTreeKeyword}
          loadState={organizationTree.loadState}
          orgTier={organizationTreeTier}
          selectedPublicId={effectiveSelectedOrganizationPublicId}
          status={organizationTreeStatus}
          onCreateChild={handleCreateChildOrganization}
          onCreateRoot={handleCreateRootOrganization}
          onDisable={(organization) =>
            setOrganizationConfirmationState({
              expectedRevision: organization.revision,
              isCascade: false,
              kind: "disableOrganization",
              publicId: organization.publicId,
            })
          }
          onEdit={handleEditOrganization}
          onEnable={(organization) =>
            setOrganizationConfirmationState({
              expectedRevision: organization.revision,
              isCascade: false,
              kind: "enableOrganization",
              publicId: organization.publicId,
            })
          }
          onKeywordChange={setOrganizationTreeKeyword}
          onLoadMore={(publicId) => {
            void organizationTree.onLoadMore(publicId);
          }}
          onMove={handleMoveOrganization}
          onOrgTierChange={setOrganizationTreeTier}
          onResetFilters={() => {
            setOrganizationTreeKeyword("");
            setOrganizationTreeStatus("all");
            setOrganizationTreeTier("all");
          }}
          onSelect={setSelectedOrganizationPublicId}
          onStatusChange={setOrganizationTreeStatus}
          onToggleNode={(publicId) => {
            void organizationTree.onToggleNode(publicId);
          }}
        />
        {isOrganizationFormOpen ? (
          <OrganizationTreeActionPanel
            disabled={false}
            formState={organizationFormState}
            organizations={organizationFormOptions}
            onFormChange={setOrganizationFormState}
            onReset={() => {
              setOrganizationFormState(defaultOrganizationFormState);
              setIsOrganizationFormOpen(false);
            }}
            onSubmit={handleSubmitOrganization}
          />
        ) : null}
      </section>

      <section
        className={activeView === "org-auth" ? "space-y-4" : "hidden"}
        data-testid="ops-org-auth-view"
        hidden={activeView !== "org-auth"}
      >
        <AdminListToolbar
          description="按购买主体、授权范围和到期风险缩小结果；筛选变化自动回到第一页。"
          primaryAction={
            <button
              className="bg-primary text-primary-foreground inline-flex h-9 items-center gap-2 rounded-md px-3 text-sm font-medium"
              type="button"
              onClick={() => setIsOrgAuthCreateDrawerOpen(true)}
            >
              <PlusCircle className="size-4" aria-hidden="true" />
              新增企业授权
            </button>
          }
          resultLabel={`共 ${orgAuthListPagination.total} 条企业授权`}
          title="企业授权筛选"
        >
          <label className={adminListFilterLabelClassName}>
            <span>关键词</span>
            <input
              aria-label="授权关键词"
              className={`border-border bg-background rounded-md border px-3 text-sm ${adminListControlClassName}`}
              placeholder="授权名称或购买主体"
              value={orgAuthKeyword}
              onChange={(event) => {
                setOrgAuthKeyword(event.target.value);
                handleOrgAuthFilterChange("keyword");
              }}
            />
          </label>
          <label className={adminListFilterLabelClassName}>
            <span>状态</span>
            <select
              aria-label="授权状态"
              className={`border-border bg-background rounded-md border px-3 text-sm ${adminListControlClassName}`}
              value={orgAuthStatus}
              onChange={(event) => {
                setOrgAuthStatus(event.target.value as AuthStatus | "all");
                handleOrgAuthFilterChange("status");
              }}
            >
              <option value="all">全部状态</option>
              <option value="active">生效中</option>
              <option value="expired">已过期</option>
              <option value="cancelled">已取消</option>
            </select>
          </label>
          <label className={adminListFilterLabelClassName}>
            <span>版本</span>
            <select
              aria-label="授权版本"
              className={`border-border bg-background rounded-md border px-3 text-sm ${adminListControlClassName}`}
              value={orgAuthEdition}
              onChange={(event) => {
                setOrgAuthEdition(
                  event.target.value as AuthorizationEdition | "all",
                );
                handleOrgAuthFilterChange("edition");
              }}
            >
              <option value="all">全部版本</option>
              <option value="standard">标准版</option>
              <option value="advanced">高级版</option>
            </select>
          </label>
          <label className={adminListFilterLabelClassName}>
            <span>专业</span>
            <select
              aria-label="授权专业"
              className={`border-border bg-background rounded-md border px-3 text-sm ${adminListControlClassName}`}
              value={orgAuthProfession}
              onChange={(event) => {
                setOrgAuthProfession(event.target.value as Profession | "all");
                handleOrgAuthFilterChange("profession");
              }}
            >
              <option value="all">全部专业</option>
              {orgAuthProfessionOptions.map((profession) => (
                <option key={profession} value={profession}>
                  {professionLabels[profession]}
                </option>
              ))}
            </select>
          </label>
          <label className={adminListFilterLabelClassName}>
            <span>等级</span>
            <select
              aria-label="授权等级"
              className={`border-border bg-background rounded-md border px-3 text-sm ${adminListControlClassName}`}
              value={orgAuthLevel}
              onChange={(event) => {
                setOrgAuthLevel(
                  event.target.value === "all"
                    ? "all"
                    : Number(event.target.value),
                );
                handleOrgAuthFilterChange("level");
              }}
            >
              <option value="all">全部等级</option>
              {orgAuthLevelOptions.map((level) => (
                <option key={level} value={level}>
                  {level}级
                </option>
              ))}
            </select>
          </label>
          <label className={adminListFilterLabelClassName}>
            <span>到期状态</span>
            <select
              aria-label="到期状态"
              className={`border-border bg-background rounded-md border px-3 text-sm ${adminListControlClassName}`}
              value={orgAuthExpiryStatus}
              onChange={(event) => {
                setOrgAuthExpiryStatus(
                  event.target.value as OrgAuthExpiryStatus,
                );
                handleOrgAuthFilterChange("expiryStatus");
              }}
            >
              <option value="all">全部到期状态</option>
              <option value="expiring_soon">45 天内到期</option>
              <option value="not_expiring_soon">45 天后到期</option>
            </select>
          </label>
          <button
            className={`border-border bg-background hover:bg-muted rounded-md border px-3 text-sm font-medium ${adminListControlClassName}`}
            type="button"
            onClick={() => handleOrgAuthSortChange("expiresAt")}
          >
            到期时间排序
          </button>
          <label className={adminListFilterLabelClassName}>
            <span>每页条数</span>
            <select
              aria-label="授权每页条数"
              className={`border-border bg-background rounded-md border px-3 text-sm ${adminListControlClassName}`}
              value={orgAuthListInteractionQuery.pageSize}
              onChange={(event) =>
                handleOrgAuthPageSizeChange(event.target.value)
              }
            >
              {ADMIN_PAGE_SIZE_OPTIONS.map((pageSize) => (
                <option key={pageSize} value={pageSize}>
                  {pageSize}
                </option>
              ))}
            </select>
          </label>
          <button
            className={`border-border bg-background hover:bg-muted rounded-md border px-3 text-sm font-medium ${adminListControlClassName}`}
            type="button"
            onClick={handleResetOrgAuthFilters}
          >
            重置筛选
          </button>
        </AdminListToolbar>

        <OrgAuthList
          loadState={orgAuthListLoadState}
          orgAuths={orgAuthListData.orgAuths}
          onCancelOrgAuth={(publicId) =>
            setConfirmationState({ kind: "cancelOrgAuth", publicId })
          }
          onViewOrgAuthDetail={(publicId) => {
            void handleViewOrgAuthDetail(publicId);
          }}
        />
        <AdminPagination
          itemLabel="条企业授权"
          page={orgAuthListPagination.page}
          pageSize={orgAuthListPagination.pageSize}
          total={orgAuthListPagination.total}
          onPageChange={handleOrgAuthPageChange}
        />

        {isOrgAuthCreateDrawerOpen ? (
          <AdminTaskDrawer
            ariaLabel="新增企业授权"
            eyebrow="企业授权"
            onClose={() => setIsOrgAuthCreateDrawerOpen(false)}
            title="新增企业授权"
          >
            <OrgAuthActionPanel
              disabled={data.organizations.length === 0}
              formState={orgAuthFormState}
              id="org-auth-create-panel"
              organizations={data.organizations}
              onCreateOrgAuth={() => {
                const orgAuthDraft = buildOrgAuthInput(
                  orgAuthFormState,
                  data.organizations,
                );

                if (orgAuthDraft.input === null) {
                  setToastMessage({
                    message: orgAuthDraft.message ?? "企业授权输入无效。",
                    tone: "error",
                  });
                  return;
                }

                setConfirmationState({
                  kind: "createOrgAuth",
                  input: orgAuthDraft.input,
                });
              }}
              onFormChange={setOrgAuthFormState}
            />
          </AdminTaskDrawer>
        ) : null}
      </section>

      <section
        className={activeView === "employees" ? "space-y-4" : "hidden"}
        data-testid="ops-employees-view"
        hidden={activeView !== "employees"}
      >
        <AdminListToolbar
          description="按员工姓名、手机号、所属企业和账号状态缩小结果；筛选变化自动回到第一页。"
          primaryAction={
            <button
              className="bg-primary text-primary-foreground inline-flex h-9 items-center gap-2 rounded-md px-3 text-sm font-medium"
              type="button"
              onClick={() => setIsEmployeeImportDrawerOpen(true)}
            >
              <Upload className="size-4" aria-hidden="true" />
              批量导入员工
            </button>
          }
          resultLabel={`共 ${employeeListPagination.total} 名员工`}
          title="员工筛选"
        >
          <label className={adminListFilterLabelClassName}>
            <span>关键词</span>
            <input
              aria-label="员工关键词"
              className={`border-border bg-background rounded-md border px-3 text-sm ${adminListControlClassName}`}
              placeholder="姓名或手机号"
              value={employeeKeyword}
              onChange={(event) => {
                setEmployeeKeyword(event.target.value);
                handleEmployeeFilterChange("keyword");
              }}
            />
          </label>
          <label className={adminListFilterLabelClassName}>
            <span>所属企业</span>
            <input
              aria-label="所属企业名称"
              className={`border-border bg-background rounded-md border px-3 text-sm ${adminListControlClassName}`}
              placeholder="企业名称"
              value={employeeOrganizationKeyword}
              onChange={(event) => {
                setEmployeeOrganizationKeyword(event.target.value);
                handleEmployeeFilterChange("organizationKeyword");
              }}
            />
          </label>
          <label className={adminListFilterLabelClassName}>
            <span>状态</span>
            <select
              aria-label="员工状态"
              className={`border-border bg-background rounded-md border px-3 text-sm ${adminListControlClassName}`}
              value={employeeStatus}
              onChange={(event) => {
                setEmployeeStatus(event.target.value as UserStatus | "all");
                handleEmployeeFilterChange("status");
              }}
            >
              <option value="all">全部状态</option>
              <option value="active">正常</option>
              <option value="disabled">已停用</option>
            </select>
          </label>
          <button
            className={`border-border bg-background hover:bg-muted rounded-md border px-3 text-sm font-medium ${adminListControlClassName}`}
            type="button"
            onClick={() => handleEmployeeSortChange("registeredAt")}
          >
            注册时间排序
          </button>
          <label className={adminListFilterLabelClassName}>
            <span>每页条数</span>
            <select
              aria-label="员工每页条数"
              className={`border-border bg-background rounded-md border px-3 text-sm ${adminListControlClassName}`}
              value={employeeListInteractionQuery.pageSize}
              onChange={(event) =>
                handleEmployeePageSizeChange(event.target.value)
              }
            >
              {ADMIN_PAGE_SIZE_OPTIONS.map((pageSize) => (
                <option key={pageSize} value={pageSize}>
                  {pageSize}
                </option>
              ))}
            </select>
          </label>
          <button
            className={`border-border bg-background hover:bg-muted rounded-md border px-3 text-sm font-medium ${adminListControlClassName}`}
            type="button"
            onClick={handleResetEmployeeFilters}
          >
            重置筛选
          </button>
        </AdminListToolbar>

        <EmployeeList
          employees={employeeListData.employees}
          loadState={employeeListLoadState}
          onTransferEmployee={setSelectedTransferEmployee}
          onUnbindEmployee={(publicId) => {
            setLastEmployeeTransferResult(null);
            setLastEmployeeUnbindResult(null);
            setEmployeeConfirmationState({
              kind: "unbindEmployee",
              publicId,
            });
          }}
        />
        <AdminPagination
          itemLabel="名员工"
          page={employeeListPagination.page}
          pageSize={employeeListPagination.pageSize}
          total={employeeListPagination.total}
          onPageChange={handleEmployeePageChange}
        />

        {isEmployeeImportDrawerOpen ? (
          <AdminTaskDrawer
            ariaLabel="批量导入员工"
            eyebrow="员工运营"
            title="批量导入员工"
            onClose={() => {
              employeeImportCommand.clearPlaintext();
              setEmployeeImportText("");
              setIsEmployeeImportDrawerOpen(false);
            }}
          >
            <EmployeeImportActionPanel
              importText={employeeImportText}
              importPreview={employeeImportPreview}
              organizations={data.organizations}
              targetOrganizationPublicId={
                selectedEmployeeImportOrganizationPublicId
              }
              onImportFileChange={(file) => {
                void handleEmployeeImportFileChange(file);
              }}
              onImportTextChange={(nextImportText) => {
                setEmployeeImportText(nextImportText);
                setLastEmployeeTransferResult(null);
              }}
              onSubmit={handleSubmitEmployeeImport}
              onTemplateDownload={downloadEmployeeImportTemplate}
              onTargetOrganizationChange={(nextOrganizationPublicId) => {
                setEmployeeImportOrganizationPublicId(nextOrganizationPublicId);
                setLastEmployeeTransferResult(null);
              }}
            />
            {employeeImportCommand.state.status === "idle" ? null : (
              <div className="mt-4">
                <EmployeeImportCommandPanel
                  canConfirm={employeeImportCommand.canConfirm}
                  canIssue={employeeImportCommand.canIssue}
                  state={employeeImportCommand.state}
                  onClearPlaintext={() => {
                    employeeImportCommand.clearPlaintext();
                    setEmployeeImportText("");
                  }}
                  onConfirmDistribution={() => {
                    void employeeImportCommand.confirmDistribution();
                  }}
                  onIssueCredentials={() => {
                    void employeeImportCommand.issueCredentials();
                  }}
                />
              </div>
            )}
          </AdminTaskDrawer>
        ) : null}

        {selectedTransferEmployee === null ? null : (
          <AdminTaskDrawer
            ariaLabel="转移员工"
            eyebrow="员工运营"
            title="转移员工"
            onClose={() => setSelectedTransferEmployee(null)}
          >
            <EmployeeTransferActionPanel
              employee={selectedTransferEmployee}
              organizations={data.organizations}
              orgAuths={data.orgAuths}
              onTransferEmployee={(input) => {
                setLastEmployeeTransferResult(null);
                setLastEmployeeUnbindResult(null);
                setEmployeeConfirmationState({
                  employeePublicId: input.employeePublicId,
                  kind: "transferEmployee",
                  targetOrganizationPublicId: input.targetOrganizationPublicId,
                });
              }}
            />
          </AdminTaskDrawer>
        )}
      </section>

      {lastEmployeeUnbindResult === null ? null : (
        <EmployeeUnbindResultPanel
          organizations={data.organizations}
          result={lastEmployeeUnbindResult}
        />
      )}

      {lastEmployeeTransferResult === null ? null : (
        <EmployeeTransferResultPanel
          organizations={data.organizations}
          result={lastEmployeeTransferResult}
        />
      )}

      {selectedOrgAuthPublicId !== null && selectedOrgAuthDetail === null ? (
        <section
          className="bg-surface border-brand-primary/30 rounded-md border p-4 shadow-sm"
          data-testid={`admin-org-auth-detail-loading-${selectedOrgAuthPublicId}`}
        >
          <div className="text-text-secondary flex items-center gap-2 text-sm">
            <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />
            正在加载企业授权详情
          </div>
        </section>
      ) : null}

      {selectedOrgAuthDetail === null ? null : (
        <OrgAuthDetailPanel
          orgAuth={selectedOrgAuthDetail}
          onClose={() => {
            setSelectedOrgAuthPublicId(null);
            setSelectedOrgAuthDetail(null);
          }}
        />
      )}

      {confirmationState === null ? null : (
        <OrgAuthConfirmationDialog
          confirmationState={confirmationState}
          onCancel={() => setConfirmationState(null)}
          onConfirm={() => void handleConfirmOrgAuthAction()}
        />
      )}

      {organizationConfirmationState === null ? null : (
        <OrganizationConfirmationDialog
          confirmationState={organizationConfirmationState}
          onCancel={() => setOrganizationConfirmationState(null)}
          onCascadeChange={(isCascade) =>
            setOrganizationConfirmationState((currentState) =>
              currentState !== null &&
              (currentState.kind === "disableOrganization" ||
                currentState.kind === "enableOrganization")
                ? { ...currentState, isCascade }
                : currentState,
            )
          }
          onConfirm={() => void handleConfirmOrganizationAction()}
        />
      )}

      {employeeConfirmationState === null ? null : (
        <EmployeeConfirmationDialog
          confirmationState={employeeConfirmationState}
          onCancel={() => setEmployeeConfirmationState(null)}
          onConfirm={() => void handleConfirmEmployeeAction()}
        />
      )}

      {toastMessage === null ? null : (
        <AdminToast
          feedback={{
            message: toastMessage.message,
            title:
              toastMessage.tone === "success"
                ? "企业管理操作成功"
                : "企业管理操作失败",
            tone: toastMessage.tone,
          }}
          onDismiss={() => setToastMessage(null)}
        />
      )}
    </main>
  );
}

export function AdminRedeemCodePage() {
  const [redeemCodeStatus, setRedeemCodeStatus] = useState<
    RedeemCodeStatus | "all"
  >("all");
  const [redeemCodeKeyword, setRedeemCodeKeyword] = useState("");
  const {
    handleFilterChange,
    handlePageChange,
    handlePageSizeChange,
    handleReset,
    handleSortChange,
    query,
  } = useAdminListInteraction({
    initialQuery: {
      sortBy: "createdAt",
      sortOrder: "desc",
    },
  });
  const redeemCodeListQuery = useMemo(
    () =>
      createRedeemCodeListQuery({
        keyword: redeemCodeKeyword,
        query,
        status: redeemCodeStatus,
      }),
    [query, redeemCodeKeyword, redeemCodeStatus],
  );
  const { data, loadState, setData, setLoadState } =
    useAdminRedeemCodeData(redeemCodeListQuery);
  const [confirmationState, setConfirmationState] =
    useState<RedeemCodeConfirmationState>(null);
  const [
    isRedeemCodeGenerationDrawerOpen,
    setIsRedeemCodeGenerationDrawerOpen,
  ] = useState(false);
  const [redeemCodeGenerationFormState, setRedeemCodeGenerationFormState] =
    useState<RedeemCodeGenerationFormState>(
      defaultRedeemCodeGenerationFormState,
    );
  const [generatedRedeemCodeSummary, setGeneratedRedeemCodeSummary] =
    useState<GeneratedRedeemCodeSummary | null>(null);
  const [generatedRedeemCodes, setGeneratedRedeemCodes] =
    useState<GeneratedRedeemCodeDistribution>([]);
  const [selectedRedeemCodePublicId, setSelectedRedeemCodePublicId] = useState<
    string | null
  >(null);
  const [selectedRedeemCodeDetail, setSelectedRedeemCodeDetail] =
    useState<RedeemCodeDetailDto | null>(null);
  const [toastMessage, setToastMessage] = useState<ToastMessage | null>(null);
  const hasUnavailablePlainTextCode = data.redeemCodes.some(
    (redeemCode) =>
      redeemCode.status === "unused" &&
      (!redeemCode.canViewPlainText || redeemCode.codePlainText === null),
  );
  const redeemCodePagination =
    data.pagination ??
    createFallbackRedeemCodePagination(query, data.redeemCodes.length);

  function handleRedeemCodeStatusChange(value: RedeemCodeStatus | "all") {
    setRedeemCodeStatus(value);
    handleFilterChange("redeemCodeStatus");
  }

  function handleRedeemCodeKeywordChange(value: string) {
    setRedeemCodeKeyword(value);
    handleFilterChange("redeemCodeKeyword");
  }

  function handleResetRedeemCodeFilters() {
    setRedeemCodeKeyword("");
    setRedeemCodeStatus("all");
    handleReset();
  }

  function handleCopyRedeemCodePlainText(value: string) {
    copyTextToClipboard(value);
    setToastMessage({ message: "卡密明文已复制", tone: "success" });
  }

  function handleCopyGeneratedRedeemCodes() {
    copyTextToClipboard(
      generatedRedeemCodes
        .map((redeemCode) => redeemCode.codePlainText)
        .join("\n"),
    );
    setToastMessage({ message: "本批次卡密已复制", tone: "success" });
  }

  async function handleViewRedeemCodeDetail(publicId: string) {
    const sessionToken = getStoredSessionToken();

    if (sessionToken === null) {
      setLoadState("unauthorized");
      return;
    }

    setSelectedRedeemCodePublicId(publicId);
    setSelectedRedeemCodeDetail(null);

    const detailResponse = await fetchAdminApi<RedeemCodeDetailResultDto>(
      `/api/v1/redeem-codes/${encodeURIComponent(publicId)}`,
      sessionToken,
    );

    if (detailResponse.code !== 0 || detailResponse.data === null) {
      setSelectedRedeemCodePublicId(null);
      setToastMessage({
        message: detailResponse.message,
        tone: "error",
      });
      return;
    }

    setSelectedRedeemCodeDetail(detailResponse.data.redeemCode);
  }

  async function handleConfirmRedeemCodeAction() {
    const sessionToken = getStoredSessionToken();

    if (confirmationState === null) {
      return;
    }

    if (sessionToken === null) {
      setConfirmationState(null);
      setLoadState("unauthorized");
      return;
    }

    const createResponse = await postAdminApi<RedeemCodeGenerationDto>(
      "/api/v1/redeem-codes",
      sessionToken,
      confirmationState.input,
    );

    setConfirmationState(null);

    if (createResponse.code !== 0 || createResponse.data === null) {
      setToastMessage({
        message: createResponse.message,
        tone: "error",
      });
      return;
    }

    const generatedRedeemCodes = createResponse.data.redeemCodes;

    setGeneratedRedeemCodeSummary(createResponse.data.generation);
    setGeneratedRedeemCodes(generatedRedeemCodes);
    setData((currentData) => ({
      pagination:
        currentData.pagination === null
          ? null
          : {
              ...currentData.pagination,
              total: currentData.pagination.total + generatedRedeemCodes.length,
            },
      redeemCodes: [
        ...generatedRedeemCodes.map((redeemCode) => ({
          canViewPlainText: true,
          codeDisplay: maskRedeemCodeDisplay(redeemCode.codeDisplay),
          codePlainText: redeemCode.codePlainText,
          createdAt: redeemCode.createdAt,
          level: redeemCode.level,
          profession: redeemCode.profession,
          publicId: redeemCode.publicId,
          redeemCodeType: redeemCode.redeemCodeType,
          redeemDeadlineAt: redeemCode.redeemDeadlineAt,
          redeemedUserPublicId: null,
          status: redeemCode.status,
        })),
        ...currentData.redeemCodes,
      ],
    }));
    setToastMessage({
      message: "卡密已生成，请在受控分发窗口核对并复制",
      tone: "success",
    });
  }

  if (loadState === "loading") {
    return <AdminLoadingState label="正在加载卡密数据" />;
  }

  if (loadState === "unauthorized") {
    return <AdminUnauthorizedState />;
  }

  if (loadState === "error") {
    return (
      <AdminErrorState
        title="卡密数据加载失败"
        description="请稍后刷新页面，或重新登录后再查看卡密列表。"
      />
    );
  }

  return (
    <main className="space-y-6">
      <AdminPageHeader
        title="卡密管理"
        description="查看卡密使用状态、类型和授权范围；有权限的运营人员可按分发需要复制明文。"
        icon={<Ticket className="size-5" aria-hidden="true" />}
      />

      <RedeemCodeFilterToolbar
        keyword={redeemCodeKeyword}
        resultLabel={`共 ${redeemCodePagination.total} 个卡密`}
        pageSize={query.pageSize}
        sortOrder={query.sortOrder}
        status={redeemCodeStatus}
        onGenerate={() => setIsRedeemCodeGenerationDrawerOpen(true)}
        onKeywordChange={handleRedeemCodeKeywordChange}
        onPageSizeChange={handlePageSizeChange}
        onReset={handleResetRedeemCodeFilters}
        onSortChange={handleSortChange}
        onStatusChange={handleRedeemCodeStatusChange}
      />

      {hasUnavailablePlainTextCode ? (
        <RedeemCodePlainTextUnavailableNotice />
      ) : null}

      <RedeemCodeList
        isFiltered={
          redeemCodeKeyword.trim().length > 0 || redeemCodeStatus !== "all"
        }
        redeemCodes={data.redeemCodes}
        onCopyPlainText={handleCopyRedeemCodePlainText}
        onViewDetail={(publicId) => {
          void handleViewRedeemCodeDetail(publicId);
        }}
      />
      <AdminPagination
        itemLabel="个卡密"
        page={redeemCodePagination.page}
        pageSize={redeemCodePagination.pageSize}
        total={redeemCodePagination.total}
        onPageChange={handlePageChange}
      />

      {selectedRedeemCodePublicId !== null &&
      selectedRedeemCodeDetail === null ? (
        <section
          className="bg-surface border-brand-primary/30 rounded-md border p-4 shadow-sm"
          data-testid={`admin-redeem-code-detail-loading-${selectedRedeemCodePublicId}`}
        >
          <div className="text-text-secondary flex items-center gap-2 text-sm">
            <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />
            正在加载卡密详情
          </div>
        </section>
      ) : null}

      {selectedRedeemCodeDetail === null ? null : (
        <RedeemCodeDetailPanel
          redeemCode={selectedRedeemCodeDetail}
          onCopyPlainText={handleCopyRedeemCodePlainText}
          onClose={() => {
            setSelectedRedeemCodePublicId(null);
            setSelectedRedeemCodeDetail(null);
          }}
        />
      )}

      {isRedeemCodeGenerationDrawerOpen ? (
        <AdminTaskDrawer
          ariaLabel="生成卡密"
          eyebrow="卡密管理"
          title="生成卡密"
          onClose={() => setIsRedeemCodeGenerationDrawerOpen(false)}
        >
          <RedeemCodeGenerationPanel
            disabled={false}
            formState={redeemCodeGenerationFormState}
            id="redeem-code-generate-panel"
            onFormChange={setRedeemCodeGenerationFormState}
            onGenerateRedeemCode={(input) =>
              setConfirmationState({ kind: "generateRedeemCode", input })
            }
          />
          {generatedRedeemCodeSummary === null ? null : (
            <div className="mt-5">
              <RedeemCodeDistributionWindow
                generation={generatedRedeemCodeSummary}
                redeemCodes={generatedRedeemCodes}
                onCopyAll={handleCopyGeneratedRedeemCodes}
                onCopyOne={handleCopyRedeemCodePlainText}
              />
            </div>
          )}
        </AdminTaskDrawer>
      ) : null}

      {confirmationState === null ? null : (
        <RedeemCodeConfirmationDialog
          input={confirmationState.input}
          onCancel={() => setConfirmationState(null)}
          onConfirm={() => void handleConfirmRedeemCodeAction()}
        />
      )}

      {toastMessage === null ? null : (
        <AdminToast
          feedback={{
            message: toastMessage.message,
            title:
              toastMessage.tone === "success" ? "卡密操作成功" : "卡密操作失败",
            tone: toastMessage.tone,
          }}
          onDismiss={() => setToastMessage(null)}
        />
      )}
    </main>
  );
}
