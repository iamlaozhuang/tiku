"use client";

import Link from "next/link";
import {
  AlertCircle,
  Ban,
  Building2,
  CheckCircle2,
  Clock3,
  Copy,
  Download,
  Eye,
  KeyRound,
  LoaderCircle,
  MoveRight,
  Pencil,
  PlusCircle,
  ShieldCheck,
  Ticket,
  Upload,
  UserMinus,
  UsersRound,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import type { ApiResponse } from "@/server/contracts/api-response";
import type {
  EmployeeListDto,
  EmployeeImportResultDto,
  EmployeeTransferResultDto,
  EmployeeUnbindResultDto,
  OrganizationListDto,
  RedeemCodeDetailDto,
  RedeemCodeDetailResultDto,
  RedeemCodeGenerationDto,
  RedeemCodeListDto,
} from "@/server/contracts/admin-user-org-auth-ops-contract";
import type { AuthContextDto } from "@/server/contracts/auth-contract";
import { LOCAL_PURCHASE_GUIDANCE_CONTACT_CONFIG } from "@/lib/local-purchase-guidance-contact-config";
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

type LoadState = "loading" | "ready" | "empty" | "unauthorized" | "error";

type AdminOrgAuthData = {
  organizations: OrganizationListDto["organizations"];
  orgAuths: OrgAuthListDto["orgAuths"];
  employees: EmployeeListDto["employees"];
};

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
  mode: "create" | "update";
  name: string;
  orgTier: OrgTier;
  parentOrganizationPublicId: string;
  publicId: string | null;
  remark: string;
  status: "active" | "disabled";
};

type AdminRedeemCodeData = RedeemCodeListDto;

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
      kind: "disableOrganization" | "enableOrganization";
      publicId: string;
    }
  | null;

type EmployeeImportInput =
  | {
      employees: {
        userPublicId: string;
        organizationPublicId: string;
      }[];
    }
  | {
      content: string;
      sourceFormat: "csv" | "tsv";
    };

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
  name: string;
  orgTier: OrgTier;
  parentOrganizationPublicId: string | null;
  remark: string | null;
  status: "active" | "disabled";
};

type ToastMessage = {
  message: string;
  tone: "error" | "success";
};

type GeneratedRedeemCodeSummary = RedeemCodeGenerationDto["generation"];
type GeneratedRedeemCodeDistribution = RedeemCodeGenerationDto["redeemCodes"];

const SESSION_TOKEN_STORAGE_KEY = "tiku.localSessionToken";
const DEFAULT_LIST_QUERY = "page=1&pageSize=20";

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
  city: "市级",
  district: "区县级",
  province: "省级",
  station: "站点",
} satisfies Record<OrgTier, string>;

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

const employeeImportRejectedReasonLabels = {
  cross_domain_conflict: "账号域冲突",
  cross_organization_conflict: "已绑定其他组织",
  disabled_account: "账号已禁用",
  duplicate_phone: "手机号重复",
  duplicate_user: "用户重复",
  employee_create_failed: "员工创建失败",
  invalid_row: "行格式无效",
  organization_not_found: "企业组织不存在",
  quota_insufficient: "授权额度不足",
  user_not_found: "用户不存在",
} satisfies Record<
  EmployeeImportResultDto["rejectedRows"][number]["reason"],
  string
>;

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
  "organizationpublicid",
  "userpublicid",
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
  mode: "create",
  name: "",
  orgTier: "province",
  parentOrganizationPublicId: "",
  publicId: null,
  remark: "",
  status: "active",
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

  return sessionToken === "" ? null : (sessionToken ?? null);
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
  status: RedeemCodeStatus | "all";
}): string {
  const searchParams = new URLSearchParams(DEFAULT_LIST_QUERY);
  const keyword = input.keyword.trim();

  if (input.status !== "all") {
    searchParams.set("status", input.status);
  }

  if (keyword.length > 0) {
    searchParams.set("keyword", keyword);
  }

  return searchParams.toString();
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

function findOrganizationDisplayName(
  organizations: AdminOrgAuthData["organizations"],
  publicId: string | null,
): string {
  if (publicId === null) {
    return "无";
  }

  return (
    organizations.find((organization) => organization.publicId === publicId)
      ?.name ?? "父级未同步"
  );
}

function countChildOrganizations(
  organizations: AdminOrgAuthData["organizations"],
  publicId: string,
): number {
  return organizations.filter(
    (organization) => organization.parentOrganizationPublicId === publicId,
  ).length;
}

function countExpiringOrgAuths(orgAuths: AdminOrgAuthData["orgAuths"]): number {
  const now = Date.now();
  const fortyFiveDaysInMilliseconds = 45 * 24 * 60 * 60 * 1000;

  return orgAuths.filter((orgAuth) => {
    if (orgAuth.status !== "active") {
      return false;
    }

    const millisecondsUntilExpiry = new Date(orgAuth.expiresAt).getTime() - now;

    return (
      millisecondsUntilExpiry >= 0 &&
      millisecondsUntilExpiry <= fortyFiveDaysInMilliseconds
    );
  }).length;
}

function countQuotaRiskOrgAuths(
  orgAuths: AdminOrgAuthData["orgAuths"],
): number {
  return orgAuths.filter(
    (orgAuth) =>
      orgAuth.status === "active" &&
      orgAuth.accountQuota > 0 &&
      orgAuth.usedQuota / orgAuth.accountQuota >= 0.8,
  ).length;
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

function createTargetedEmployeeAccountImportContent(input: {
  lines: string[];
  targetOrganizationPublicId: string;
}): string {
  const delimiter = input.lines.some((line) => line.includes("\t"))
    ? "\t"
    : ",";
  const headerCells = input.lines[0]?.split(delimiter) ?? [];
  const headerIndexByName = new Map(
    headerCells.map((cell, index) => [
      normalizeEmployeeImportHeaderCell(cell),
      index,
    ]),
  );
  const phoneIndex = headerIndexByName.get("phone") ?? 0;
  const nameIndex = headerIndexByName.get("name") ?? 1;
  const initialPasswordIndex = headerIndexByName.get("initialpassword");
  const dataLines = input.lines.slice(1);
  const nextLines = dataLines.map((line) => {
    const cells = line.split(delimiter).map((cell) => cell.trim());

    return [
      cells[phoneIndex] ?? "",
      cells[nameIndex] ?? "",
      initialPasswordIndex === undefined
        ? ""
        : (cells[initialPasswordIndex] ?? ""),
      input.targetOrganizationPublicId,
    ].join(delimiter);
  });

  return [
    ["phone", "name", "initialPassword", "organizationPublicId"].join(
      delimiter,
    ),
    ...nextLines,
  ].join("\n");
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
    .trim()
    .toLowerCase()
    .replace(/[\s_-]+/gu, "");
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

function countRowsMissingEmployeeInitialPassword(lines: string[]): number {
  const firstLine = lines[0] ?? "";
  const delimiter = firstLine.includes("\t") ? "\t" : ",";
  const headerCells = firstLine.split(delimiter);
  const headerIndexByName = new Map(
    headerCells.map((cell, index) => [
      normalizeEmployeeImportHeaderCell(cell),
      index,
    ]),
  );
  const initialPasswordIndex = headerIndexByName.get("initialpassword");

  if (initialPasswordIndex === undefined) {
    return Math.max(lines.length - 1, 0);
  }

  return lines
    .slice(1)
    .filter(
      (line) =>
        (line.split(delimiter)[initialPasswordIndex] ?? "").trim().length === 0,
    ).length;
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

  const availableQuota = activeTargetOrgAuths.reduce(
    (total, orgAuth) =>
      total + Math.max(orgAuth.accountQuota - orgAuth.usedQuota, 0),
    0,
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
): { input: OrganizationMutationInput | null; message: string | null } {
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

  if (name.length === 0) {
    return { input: null, message: "请填写企业名称。" };
  }

  if (
    formState.publicId !== null &&
    parentOrganizationPublicId === formState.publicId
  ) {
    return { input: null, message: "父级组织不能选择当前企业。" };
  }

  if (expectedParentTier === null && parentOrganizationPublicId !== null) {
    return { input: null, message: "省公司不能设置父级组织。" };
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

  return {
    input: {
      contactName: normalizeOptionalOrganizationText(formState.contactName),
      contactPhone: normalizeOptionalOrganizationText(formState.contactPhone),
      name,
      orgTier: formState.orgTier,
      parentOrganizationPublicId,
      remark: normalizeOptionalOrganizationText(formState.remark),
      status: formState.status,
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

  const lines = trimmedValue
    .split(/\r?\n/u)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
  const forbiddenScopeHeaders = findForbiddenEmployeeImportScopeHeaders(lines);

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

  const firstLine = lines[0]?.toLowerCase().replace(/\s+/gu, "") ?? "";
  const hasEmployeeAccountHeader =
    firstLine.includes("phone") && firstLine.includes("name");
  const legacyRows = lines.map((line) =>
    line.split(",").map((item) => item.trim()),
  );
  const isLegacyPublicIdImport =
    !hasEmployeeAccountHeader &&
    legacyRows.every(
      (row) => row.length === 2 && row.every((item) => item.length > 0),
    );

  if (isLegacyPublicIdImport) {
    return {
      input: {
        employees: legacyRows.map(([userPublicId, organizationPublicId]) => ({
          userPublicId: userPublicId ?? "",
          organizationPublicId: organizationPublicId ?? "",
        })),
      },
      message: null,
    };
  }

  if (!hasEmployeeAccountHeader) {
    return {
      input: null,
      message:
        "员工账号导入必须包含 phone,name 表头；initialPassword 可选，并先选择目标组织。",
    };
  }

  return {
    input: {
      content: createTargetedEmployeeAccountImportContent({
        lines,
        targetOrganizationPublicId: targetOrganizationPublicId.trim(),
      }),
      sourceFormat: lines.some((line) => line.includes("\t")) ? "tsv" : "csv",
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

  const lines = trimmedValue
    .split(/\r?\n/u)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
  const forbiddenScopeHeaders = findForbiddenEmployeeImportScopeHeaders(lines);

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

  const firstLine = lines[0]?.toLowerCase().replace(/\s+/gu, "") ?? "";
  const hasEmployeeAccountHeader =
    firstLine.includes("phone") && firstLine.includes("name");
  const legacyRows = lines.map((line) =>
    line.split(",").map((item) => item.trim()),
  );
  const isLegacyPublicIdImport =
    !hasEmployeeAccountHeader &&
    legacyRows.every(
      (row) => row.length === 2 && row.every((item) => item.length > 0),
    );

  if (isLegacyPublicIdImport) {
    const legacyTargetAuthSummary = summarizeEmployeeImportTargetAuth({
      orgAuths,
      rowCount: lines.length,
      targetOrganizationPublicId,
    });

    return {
      ...legacyTargetAuthSummary,
      formatLabel: "userPublicId 绑定导入",
      generatedPasswordRowCount: 0,
      isReady:
        lines.length > 0 &&
        legacyTargetAuthSummary.inheritedAuthorizationCategory ===
          "active_org_auth_available" &&
        legacyTargetAuthSummary.quotaImpactCategory === "quota_available",
      message: `将按公开编号绑定格式解析 ${lines.length} 行员工。`,
      rowCount: lines.length,
    };
  }

  const sourceFormat = lines.some((line) => line.includes("\t"))
    ? "TSV"
    : "CSV";
  const rowCount = hasEmployeeAccountHeader ? Math.max(lines.length - 1, 0) : 0;
  const generatedPasswordRowCount = hasEmployeeAccountHeader
    ? countRowsMissingEmployeeInitialPassword(lines)
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
    <header className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
      <div className="flex items-start gap-3">
        <div className="bg-secondary text-secondary-foreground flex size-11 shrink-0 items-center justify-center rounded-full">
          {icon}
        </div>
        <div className="space-y-1">
          <p className="text-brand-primary text-sm font-medium">Admin Ops</p>
          <h1 className="font-heading text-text-primary text-2xl font-semibold">
            {title}
          </h1>
          <p className="text-text-secondary max-w-2xl text-sm leading-6">
            {description}
          </p>
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        <Link
          href="/ops/organizations"
          className="border-border bg-background hover:bg-muted hover:text-foreground inline-flex h-8 items-center justify-center rounded-lg border px-2.5 text-sm font-medium transition-transform active:scale-[0.98]"
        >
          企业授权
        </Link>
        <Link
          href="/ops/redeem-codes"
          className="border-border bg-background hover:bg-muted hover:text-foreground inline-flex h-8 items-center justify-center rounded-lg border px-2.5 text-sm font-medium transition-transform active:scale-[0.98]"
        >
          卡密管理
        </Link>
      </div>
    </header>
  );
}

function SystemOpsRequiredRoleEntry({
  actionHref,
  actionLabel,
  description,
  testId,
  title,
}: {
  actionHref: string;
  actionLabel: string;
  description: string;
  testId: string;
  title: string;
}) {
  return (
    <section
      className="bg-surface border-brand-primary/30 rounded-md border p-4 shadow-sm"
      data-testid={testId}
    >
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-1">
          <p className="text-brand-primary text-xs font-medium">
            系统运营本地验收
          </p>
          <h2 className="text-text-primary text-base font-semibold">{title}</h2>
          <p className="text-text-secondary text-sm leading-6">{description}</p>
        </div>
        <Link
          className="bg-primary text-primary-foreground inline-flex h-8 items-center justify-center rounded-lg px-3 text-sm font-medium transition-transform active:scale-[0.98]"
          href={actionHref}
        >
          {actionLabel}
        </Link>
      </div>
    </section>
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
      aria-label="企业授权摘要优先"
      className="bg-surface border-border rounded-md border p-4 shadow-sm"
      data-testid="ops-org-auth-summary-first-band"
    >
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-1">
          <p className="text-brand-primary text-xs font-medium">
            企业授权 summary-first
          </p>
          <h2 className="text-text-primary text-base font-semibold">
            企业授权总览
          </h2>
          <p className="text-text-secondary text-sm leading-6">
            先查看组织、授权、员工和标准版/高级版分布，再进入新增、导入、解绑或停用操作；系统不会自动升级、续费、扩容或合并重叠授权。
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

function OperationsRedeemCodeSummaryFirstBand({
  hasUnavailablePlainTextCode,
  redeemCodes,
}: {
  hasUnavailablePlainTextCode: boolean;
  redeemCodes: AdminRedeemCodeData["redeemCodes"];
}) {
  const unusedCount = redeemCodes.filter(
    (redeemCode) => redeemCode.status === "unused",
  ).length;
  const consumedOrExpiredCount = redeemCodes.length - unusedCount;

  return (
    <section
      aria-label="卡密摘要优先"
      className="bg-surface border-border rounded-md border p-4 shadow-sm"
      data-testid="ops-redeem-code-summary-first-band"
    >
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-1">
          <p className="text-brand-primary text-xs font-medium">
            卡密 summary-first
          </p>
          <h2 className="text-text-primary text-base font-semibold">
            卡密分发总览
          </h2>
          <p className="text-text-secondary text-sm leading-6">
            明文仅限有权运营界面复制；证据和审计只记录脱敏命令状态、数量和路径，不记录卡密明文、哈希或内部标识。
          </p>
        </div>
        <span className="bg-secondary text-secondary-foreground w-fit rounded-lg px-2 py-1 text-xs font-medium">
          二次确认
        </span>
      </div>
      <div className="mt-4 grid gap-4 xl:grid-cols-3" aria-label="卡密摘要">
        <SummaryTile
          icon={<KeyRound className="size-4" aria-hidden="true" />}
          label="卡密总数"
          value={`${redeemCodes.length}`}
        />
        <SummaryTile
          icon={<CheckCircle2 className="size-4" aria-hidden="true" />}
          label="未使用"
          value={`${unusedCount}`}
        />
        <SummaryTile
          icon={<Clock3 className="size-4" aria-hidden="true" />}
          label="已使用或过期"
          value={`${consumedOrExpiredCount}`}
        />
      </div>
      <p className="text-text-muted mt-3 text-xs leading-5">
        空态、错误态和禁用态保持可见；明文不可见记录{" "}
        {hasUnavailablePlainTextCode ? "需要提示" : "当前无"}。
      </p>
    </section>
  );
}

function AdminPanel({
  children,
  title,
}: {
  children: React.ReactNode;
  title: string;
}) {
  return (
    <section className="bg-surface ring-border rounded-md p-4 shadow-sm ring-1">
      <h2 className="text-text-primary text-base font-semibold">{title}</h2>
      <div className="mt-3 space-y-3">{children}</div>
    </section>
  );
}

function AdminDataRow({
  children,
  publicId,
  testId,
}: {
  children: React.ReactNode;
  publicId: string;
  testId: string;
}) {
  return (
    <article
      className="border-border flex flex-col gap-3 border-t pt-3 first:border-t-0 first:pt-0 lg:flex-row lg:items-center lg:justify-between"
      data-public-id={publicId}
      data-testid={testId}
    >
      {children}
    </article>
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

function OperationsPendingWorkbench({
  organizations,
  orgAuths,
}: {
  organizations: AdminOrgAuthData["organizations"];
  orgAuths: AdminOrgAuthData["orgAuths"];
}) {
  const expiringOrgAuthCount = countExpiringOrgAuths(orgAuths);
  const quotaRiskOrgAuthCount = countQuotaRiskOrgAuths(orgAuths);
  const disabledOrganizationCount = organizations.filter(
    (organization) => organization.status === "disabled",
  ).length;
  const noDirectAuthSummaryCount = organizations.filter(
    (organization) => organization.authSummary === null,
  ).length;
  const pendingItems = [
    {
      count: expiringOrgAuthCount,
      description:
        "到期授权需要进入授权详情或创建向导处理续费接续，不自动续费。",
      href: "#org-auth-create-panel",
      title: "授权到期复核",
    },
    {
      count: quotaRiskOrgAuthCount,
      description: "额度接近用尽时由运营选择增量扩容或替换授权，不自动扩容。",
      href: "#org-auth-create-panel",
      title: "额度风险复核",
    },
    {
      count: 0,
      description:
        "同一原子范围重叠默认阻断；只能通过续费、手动升级、替换或增量扩容显式闭环。",
      href: "#org-auth-create-panel",
      title: "重叠阻断处理",
    },
    {
      count: disabledOrganizationCount + noDirectAuthSummaryCount,
      description: "停用节点和暂无直接授权摘要的节点需要运营核对继承授权影响。",
      href: "#organization-tree-management-panel",
      title: "组织树待确认",
    },
  ];

  return (
    <section
      className="bg-surface border-border rounded-md border p-4 shadow-sm"
      data-testid="operations-pending-workbench"
    >
      <div className="flex flex-col gap-2 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-1">
          <p className="text-brand-primary text-xs font-medium">运营待办</p>
          <h2 className="text-text-primary text-base font-semibold">
            运营待办工作台
          </h2>
          <p className="text-text-secondary text-sm leading-6">
            待办只帮助定位需要人工处理的授权、额度、重叠和组织树事项；系统不会自动续费、自动升级、自动合并或自动解决冲突。
          </p>
        </div>
        <span className="bg-secondary text-secondary-foreground w-fit rounded-lg px-2 py-1 text-xs font-medium">
          人工闭环
        </span>
      </div>
      <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {pendingItems.map((item) => (
          <a
            key={item.title}
            className="border-border bg-background hover:bg-muted block rounded-md border p-3 transition-transform active:scale-[0.98]"
            href={item.href}
          >
            <p className="text-text-muted text-xs">待办数量</p>
            <p className="text-text-primary mt-1 text-2xl font-semibold">
              {item.count}
            </p>
            <h3 className="text-text-primary mt-2 text-sm font-semibold">
              {item.title}
            </h3>
            <p className="text-text-secondary mt-2 text-xs leading-5">
              {item.description}
            </p>
          </a>
        ))}
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

function OrganizationList({
  onDisableOrganization,
  onEditOrganization,
  onEnableOrganization,
  onViewOrganizationDetail,
  organizations,
}: {
  onDisableOrganization: (publicId: string) => void;
  onEditOrganization: (
    organization: AdminOrgAuthData["organizations"][number],
  ) => void;
  onEnableOrganization: (publicId: string) => void;
  onViewOrganizationDetail: (publicId: string) => void;
  organizations: AdminOrgAuthData["organizations"];
}) {
  const organizationDepthByPublicId = createOrganizationDepthMap(organizations);

  return (
    <AdminPanel title="企业组织">
      {organizations.map((organization) => {
        const organizationDepth =
          organizationDepthByPublicId.get(organization.publicId) ?? 0;
        const childOrganizationCount = countChildOrganizations(
          organizations,
          organization.publicId,
        );
        const parentOrganizationName = findOrganizationDisplayName(
          organizations,
          organization.parentOrganizationPublicId,
        );

        return (
          <AdminDataRow
            key={organization.publicId}
            publicId={organization.publicId}
            testId={`admin-organization-${organization.publicId}`}
          >
            <div
              className={`min-w-0 space-y-1 ${getOrganizationDepthPaddingClassName(organizationDepth)}`}
            >
              <p className="text-text-primary text-sm font-medium">
                {organization.name}
              </p>
              <p className="text-text-secondary text-xs">
                {orgTierLabels[organization.orgTier]} /{" "}
                {organization.employeeCount} 名员工 / 下级{" "}
                {childOrganizationCount}
              </p>
              <p className="text-text-muted text-xs">
                父级 {parentOrganizationName} /{" "}
                {organization.authSummary ??
                  "暂无直接授权摘要，需核对上级或指定范围继承"}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="bg-secondary text-secondary-foreground w-fit rounded-lg px-2 py-1 text-xs font-medium">
                {organization.status === "active" ? "启用" : "停用"}
              </span>
              <button
                type="button"
                className="border-border bg-background hover:bg-muted hover:text-foreground inline-flex h-8 items-center justify-center gap-1 rounded-lg border px-2.5 text-sm font-medium transition-transform active:scale-[0.98]"
                data-testid={`organization-detail-${organization.publicId}`}
                onClick={() => onViewOrganizationDetail(organization.publicId)}
              >
                <Eye className="size-3.5" aria-hidden="true" />
                详情
              </button>
              <button
                type="button"
                className="border-border bg-background hover:bg-muted hover:text-foreground inline-flex h-8 items-center justify-center gap-1 rounded-lg border px-2.5 text-sm font-medium transition-transform active:scale-[0.98]"
                data-testid={`organization-edit-${organization.publicId}`}
                onClick={() => onEditOrganization(organization)}
              >
                <Pencil className="size-3.5" aria-hidden="true" />
                编辑
              </button>
              {organization.status === "active" ? (
                <button
                  type="button"
                  className="bg-destructive text-destructive-foreground inline-flex h-8 items-center justify-center gap-1 rounded-lg px-2.5 text-sm font-medium transition-transform active:scale-[0.98]"
                  data-testid={`organization-disable-${organization.publicId}`}
                  onClick={() => onDisableOrganization(organization.publicId)}
                >
                  <Ban className="size-3.5" aria-hidden="true" />
                  停用
                </button>
              ) : (
                <button
                  type="button"
                  className="bg-primary text-primary-foreground inline-flex h-8 items-center justify-center gap-1 rounded-lg px-2.5 text-sm font-medium transition-transform active:scale-[0.98]"
                  data-testid={`organization-enable-${organization.publicId}`}
                  onClick={() => onEnableOrganization(organization.publicId)}
                >
                  <CheckCircle2 className="size-3.5" aria-hidden="true" />
                  启用
                </button>
              )}
            </div>
          </AdminDataRow>
        );
      })}
    </AdminPanel>
  );
}

function OrganizationDetailPanel({
  employees,
  onClose,
  onDisableOrganization,
  onEditOrganization,
  onEnableOrganization,
  organization,
  organizations,
  orgAuths,
}: {
  employees: AdminOrgAuthData["employees"];
  onClose: () => void;
  onDisableOrganization: (publicId: string) => void;
  onEditOrganization: (
    organization: AdminOrgAuthData["organizations"][number],
  ) => void;
  onEnableOrganization: (publicId: string) => void;
  organization: AdminOrgAuthData["organizations"][number];
  organizations: AdminOrgAuthData["organizations"];
  orgAuths: AdminOrgAuthData["orgAuths"];
}) {
  const parentOrganization = organizations.find(
    (candidateOrganization) =>
      candidateOrganization.publicId ===
      organization.parentOrganizationPublicId,
  );
  const childOrganizations = organizations.filter(
    (candidateOrganization) =>
      candidateOrganization.parentOrganizationPublicId ===
      organization.publicId,
  );
  const relatedOrgAuths = orgAuths.filter(
    (orgAuth) =>
      orgAuth.purchaserOrganizationPublicId === organization.publicId ||
      orgAuth.organizationPublicIds.includes(organization.publicId),
  );
  const relatedEmployees = employees.filter(
    (employee) => employee.organizationPublicId === organization.publicId,
  );
  const inheritedAccessSummary =
    relatedOrgAuths.length === 0
      ? "暂无直接或指定覆盖授权；员工仅在上级范围覆盖时继承企业授权。"
      : `关联 ${relatedOrgAuths.length} 条授权；员工可见专业、等级和版本由这些有效企业授权计算。`;

  return (
    <section
      aria-label="组织详情"
      className="bg-surface ring-border rounded-md p-4 shadow-sm ring-1"
      data-public-id={organization.publicId}
      data-testid={`admin-organization-detail-${organization.publicId}`}
    >
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-1">
          <p className="text-brand-primary text-xs font-medium">组织详情</p>
          <h2 className="text-text-primary text-base font-semibold">
            {organization.name}
          </h2>
          <p className="text-text-secondary text-sm leading-6">
            基于当前后台列表数据聚合组织、授权和员工摘要；组织树写操作继续由平台运营处理，组织管理员只读查看范围内结构和授权影响。
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className="border-border bg-background hover:bg-muted hover:text-foreground inline-flex h-8 items-center justify-center gap-1 rounded-lg border px-2.5 text-sm font-medium transition-transform active:scale-[0.98]"
            onClick={() => onEditOrganization(organization)}
          >
            <Pencil className="size-3.5" aria-hidden="true" />
            编辑组织
          </button>
          {organization.status === "active" ? (
            <button
              type="button"
              className="bg-destructive text-destructive-foreground inline-flex h-8 items-center justify-center gap-1 rounded-lg px-2.5 text-sm font-medium transition-transform active:scale-[0.98]"
              onClick={() => onDisableOrganization(organization.publicId)}
            >
              <Ban className="size-3.5" aria-hidden="true" />
              停用组织
            </button>
          ) : (
            <button
              type="button"
              className="bg-primary text-primary-foreground inline-flex h-8 items-center justify-center gap-1 rounded-lg px-2.5 text-sm font-medium transition-transform active:scale-[0.98]"
              onClick={() => onEnableOrganization(organization.publicId)}
            >
              <CheckCircle2 className="size-3.5" aria-hidden="true" />
              启用组织
            </button>
          )}
          <button
            type="button"
            className="border-border bg-background hover:bg-muted hover:text-foreground inline-flex h-8 items-center justify-center rounded-lg border px-3 text-sm font-medium transition-transform active:scale-[0.98]"
            onClick={onClose}
          >
            关闭
          </button>
        </div>
      </div>

      <div className="border-border bg-background mt-4 grid gap-3 rounded-md border p-3 md:grid-cols-3">
        <div>
          <p className="text-brand-primary text-xs font-medium">继承授权</p>
          <p className="text-text-secondary mt-1 text-sm leading-6">
            {inheritedAccessSummary}
          </p>
        </div>
        <div>
          <p className="text-brand-primary text-xs font-medium">停用影响</p>
          <p className="text-text-secondary mt-1 text-sm leading-6">
            停用企业节点不删除企业、员工或学习记录；重新启用后，如授权仍有效，可恢复企业授权内容使用。
          </p>
        </div>
        <div>
          <p className="text-brand-primary text-xs font-medium">移动限制</p>
          <p className="text-text-secondary mt-1 text-sm leading-6">
            节点移动仅超级管理员通过受控流程处理，当前页面不提供移动企业组织动作。
          </p>
        </div>
      </div>

      <dl className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <div className="bg-background rounded-md p-3">
          <dt className="text-text-muted text-xs">企业层级</dt>
          <dd className="text-text-primary mt-1 text-sm font-medium">
            {orgTierLabels[organization.orgTier]}
          </dd>
        </div>
        <div className="bg-background rounded-md p-3">
          <dt className="text-text-muted text-xs">组织状态</dt>
          <dd className="text-text-primary mt-1 text-sm font-medium">
            {organization.status === "active" ? "启用" : "停用"}
          </dd>
        </div>
        <div className="bg-background rounded-md p-3">
          <dt className="text-text-muted text-xs">组织员工</dt>
          <dd className="text-text-primary mt-1 text-sm font-medium">
            员工 {organization.employeeCount}
          </dd>
        </div>
        <div className="bg-background rounded-md p-3">
          <dt className="text-text-muted text-xs">关联授权</dt>
          <dd className="text-text-primary mt-1 text-sm font-medium">
            关联授权 {relatedOrgAuths.length}
          </dd>
        </div>
        <div className="bg-background rounded-md p-3">
          <dt className="text-text-muted text-xs">父级组织</dt>
          <dd className="text-text-primary mt-1 text-sm font-medium break-all">
            {parentOrganization?.name ??
              findOrganizationDisplayName(
                organizations,
                organization.parentOrganizationPublicId,
              )}
          </dd>
        </div>
        <div className="bg-background rounded-md p-3">
          <dt className="text-text-muted text-xs">下级组织</dt>
          <dd className="text-text-primary mt-1 text-sm font-medium">
            {childOrganizations.length === 0
              ? "无下级组织"
              : childOrganizations.map((child) => child.name).join("、")}
          </dd>
        </div>
        <div className="bg-background rounded-md p-3">
          <dt className="text-text-muted text-xs">授权摘要</dt>
          <dd className="text-text-primary mt-1 text-sm font-medium">
            {organization.authSummary ?? "暂无授权摘要"}
          </dd>
        </div>
        <div className="bg-background rounded-md p-3">
          <dt className="text-text-muted text-xs">员工记录</dt>
          <dd className="text-text-primary mt-1 text-sm font-medium">
            {relatedEmployees.length === 0
              ? "暂无员工记录"
              : relatedEmployees.map((employee) => employee.name).join("、")}
          </dd>
        </div>
      </dl>

      <div className="mt-4 space-y-2">
        <h3 className="text-text-primary text-sm font-semibold">
          关联企业授权
        </h3>
        {relatedOrgAuths.length === 0 ? (
          <p className="text-text-muted text-sm">暂无关联企业授权。</p>
        ) : (
          <div className="space-y-2">
            {relatedOrgAuths.map((orgAuth) => (
              <div
                key={orgAuth.publicId}
                className="border-border flex flex-col gap-1 rounded-md border p-3"
              >
                <p className="text-text-primary text-sm font-medium">
                  {orgAuth.name}
                </p>
                <p className="text-text-secondary flex flex-wrap gap-1 text-xs">
                  <span>{formatProfessionLevel(orgAuth)}</span>
                  <span>/</span>
                  <span>{getOrgAuthEditionLabel(orgAuth)}</span>
                  <span>/</span>
                  <span>{authStatusLabels[orgAuth.status]}</span>
                  <span>/</span>
                  <span>
                    {orgAuth.usedQuota} / {orgAuth.accountQuota}
                  </span>
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function OrgAuthList({
  onCancelOrgAuth,
  onViewOrgAuthDetail,
  orgAuths,
}: {
  onCancelOrgAuth: (publicId: string) => void;
  onViewOrgAuthDetail: (publicId: string) => void;
  orgAuths: AdminOrgAuthData["orgAuths"];
}) {
  return (
    <AdminPanel title="企业授权">
      {orgAuths.map((orgAuth) => (
        <AdminDataRow
          key={orgAuth.publicId}
          publicId={orgAuth.publicId}
          testId={`admin-org-auth-${orgAuth.publicId}`}
        >
          <div className="min-w-0 space-y-1">
            <p className="text-text-primary text-sm font-medium">
              {orgAuth.name}
            </p>
            <p className="text-text-secondary flex flex-wrap gap-1 text-xs">
              <span>{formatProfessionLevel(orgAuth)}</span>
              <span>/</span>
              <span>{getOrgAuthEditionLabel(orgAuth)}</span>
              <span>/</span>
              <span>
                {orgAuth.usedQuota} / {orgAuth.accountQuota}
              </span>
            </p>
            <p className="text-text-muted text-xs">
              {getOrgAuthUpgradeStatusLabel(orgAuth)}
            </p>
            <p className="text-text-muted text-xs">
              {authScopeTypeLabels[orgAuth.authScopeType]} /{" "}
              {formatDate(orgAuth.startsAt)} 至 {formatDate(orgAuth.expiresAt)}
            </p>
            <p className="text-text-muted text-xs">
              覆盖企业 {orgAuth.organizationPublicIds.join("、") || "无"}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="bg-success/10 text-success w-fit rounded-lg px-2 py-1 text-xs font-medium">
              {authStatusLabels[orgAuth.status]}
            </span>
            <button
              type="button"
              className="border-border bg-background hover:bg-muted hover:text-foreground inline-flex h-8 items-center justify-center gap-1 rounded-lg border px-2.5 text-sm font-medium transition-transform active:scale-[0.98]"
              onClick={() => onViewOrgAuthDetail(orgAuth.publicId)}
            >
              <Eye className="size-3.5" aria-hidden="true" />
              查看详情
            </button>
            {orgAuth.status === "active" ? (
              <button
                type="button"
                className="bg-destructive text-destructive-foreground inline-flex h-8 items-center justify-center rounded-lg px-3 text-sm font-medium transition-transform active:scale-[0.98]"
                onClick={() => onCancelOrgAuth(orgAuth.publicId)}
              >
                取消授权
              </button>
            ) : null}
          </div>
        </AdminDataRow>
      ))}
    </AdminPanel>
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
    <section
      className="bg-surface border-brand-primary/30 rounded-md border p-4 shadow-sm"
      data-public-id={orgAuth.publicId}
      data-testid={`admin-org-auth-detail-${orgAuth.publicId}`}
    >
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-2">
          <p className="text-brand-primary text-xs font-medium">企业授权</p>
          <h2 className="text-text-primary text-base font-semibold">
            {orgAuth.name}
          </h2>
          <div className="text-text-secondary grid gap-1 text-sm md:grid-cols-2">
            <p>购买主体 {orgAuth.purchaserOrganizationPublicId}</p>
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
            <p>购买主体名称 {orgAuth.purchaserOrganization.name}</p>
          </div>
          <p className="text-text-muted text-xs">
            覆盖企业 {orgAuth.organizationPublicIds.join("、") || "无"}
          </p>
          <div className="text-text-muted space-y-1 text-xs">
            {orgAuth.coveredOrganizations.map((organization) => (
              <p key={organization.publicId}>
                {organization.name} / 员工 {organization.employeeCount}
              </p>
            ))}
          </div>
        </div>
        <button
          type="button"
          className="border-border bg-background hover:bg-muted hover:text-foreground inline-flex h-8 items-center justify-center rounded-lg border px-3 text-sm font-medium transition-transform active:scale-[0.98]"
          onClick={onClose}
        >
          关闭
        </button>
      </div>
    </section>
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

function EmployeeTransferSessionReviewPanel({
  employees,
  onTransferEmployee,
  organizations,
  orgAuths,
}: {
  employees: AdminOrgAuthData["employees"];
  onTransferEmployee: (input: {
    employeePublicId: string;
    targetOrganizationPublicId: string;
  }) => void;
  organizations: AdminOrgAuthData["organizations"];
  orgAuths: AdminOrgAuthData["orgAuths"];
}) {
  const transferReviewRows = buildEmployeeTransferReviewRows({
    employees,
    organizations,
    orgAuths,
  });
  const blockedReviewCount = transferReviewRows.filter(
    (reviewRow) => reviewRow.reason !== "quota_available",
  ).length;
  const visibleReviewRows = transferReviewRows.slice(0, 4);

  return (
    <section
      className="bg-surface border-border rounded-md border border-dashed p-4 shadow-sm"
      data-testid="employee-transfer-session-review"
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex items-start gap-3">
          <div className="bg-secondary text-secondary-foreground flex size-9 shrink-0 items-center justify-center rounded-full">
            <AlertCircle className="size-4" aria-hidden="true" />
          </div>
          <div className="space-y-1">
            <p className="text-brand-primary text-xs font-medium">
              员工调动影响复核
            </p>
            <h2 className="text-text-primary text-base font-semibold">
              转移前先复核额度、会话和历史归属
            </h2>
            <p className="text-text-secondary text-sm leading-6">
              员工转移必须先确认目标组织有可用企业授权额度；额度不足时阻断，不形成已调入但无清晰授权的状态。
            </p>
            <p className="text-text-muted text-xs">
              调动成功后撤销员工已有活跃会话并要求重新登录；已提交企业训练保留作答时企业归属快照，尚未提交的原组织企业训练不得继续作答。
            </p>
          </div>
        </div>
        <span className="bg-secondary text-secondary-foreground w-fit rounded-lg px-2 py-1 text-xs font-medium">
          阻断 {blockedReviewCount}
        </span>
      </div>

      {visibleReviewRows.length === 0 ? (
        <div className="border-border bg-background mt-4 rounded-md border p-3">
          <p className="text-text-secondary text-sm">
            暂无可选目标组织。后续执行转移时仍必须在事务中释放原组织额度、占用目标组织额度并撤销员工会话。
          </p>
        </div>
      ) : (
        <div className="mt-4 space-y-3">
          {visibleReviewRows.map((reviewRow) => (
            <AdminDataRow
              key={`${reviewRow.employeePublicId}-${reviewRow.targetOrganizationPublicId}`}
              publicId={reviewRow.employeePublicId}
              testId={`employee-transfer-review-${reviewRow.employeePublicId}-${reviewRow.targetOrganizationPublicId}`}
            >
              <div className="min-w-0 space-y-1">
                <p className="text-text-primary text-sm font-medium">
                  {reviewRow.employeeName}：{reviewRow.currentOrganizationName}
                  {" -> "}
                  {reviewRow.targetOrganizationName}
                </p>
                <p className="text-text-secondary text-xs">
                  目标有效授权范围 {reviewRow.activeScopeCount}；可用额度{" "}
                  {reviewRow.availableQuota}
                </p>
                <p className="text-text-muted text-xs">
                  提交前需再次复核授权范围、训练快照、会话撤销和未提交训练阻断。
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="bg-secondary text-secondary-foreground w-fit rounded-lg px-2 py-1 text-xs font-medium">
                  {employeeTransferReviewReasonLabels[reviewRow.reason]}
                </span>
                {reviewRow.reason === "quota_available" ? (
                  <button
                    type="button"
                    className="bg-primary text-primary-foreground inline-flex h-8 items-center justify-center gap-1 rounded-lg px-2.5 text-sm font-medium transition-transform active:scale-[0.98]"
                    data-testid={`employee-transfer-${reviewRow.employeePublicId}-${reviewRow.targetOrganizationPublicId}`}
                    onClick={() =>
                      onTransferEmployee({
                        employeePublicId: reviewRow.employeePublicId,
                        targetOrganizationPublicId:
                          reviewRow.targetOrganizationPublicId,
                      })
                    }
                  >
                    <MoveRight className="size-3.5" aria-hidden="true" />
                    转移
                  </button>
                ) : null}
              </div>
            </AdminDataRow>
          ))}
        </div>
      )}

      <div className="text-text-muted mt-4 grid gap-2 text-xs md:grid-cols-4">
        <p>可管理员工 {employees.length}</p>
        <p>可选企业组织 {organizations.length}</p>
        <p>目标授权额度不足时阻断</p>
        <p>不提供员工级授权白名单</p>
      </div>
    </section>
  );
}

function EmployeeList({
  employees,
  onUnbindEmployee,
  organizations,
}: {
  employees: AdminOrgAuthData["employees"];
  onUnbindEmployee: (publicId: string) => void;
  organizations: AdminOrgAuthData["organizations"];
}) {
  return (
    <AdminPanel title="员工账号">
      {employees.map((employee) => {
        const employeeOrganization = organizations.find(
          (organization) =>
            organization.publicId === employee.organizationPublicId,
        );

        return (
          <AdminDataRow
            key={employee.publicId}
            publicId={employee.publicId}
            testId={`admin-employee-${employee.publicId}`}
          >
            <div className="min-w-0 space-y-1">
              <p className="text-text-primary text-sm font-medium">
                {employee.name}
              </p>
              <p className="text-text-secondary text-xs">{employee.phone}</p>
              <p className="text-text-muted text-xs">
                用户 {employee.userPublicId} / 企业{" "}
                {employee.organizationPublicId}
              </p>
              <p className="text-text-muted text-xs">
                解绑影响：从{" "}
                {employeeOrganization?.name ?? employee.organizationPublicId}
                移除，原组织员工数 -1。
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="bg-secondary text-secondary-foreground w-fit rounded-lg px-2 py-1 text-xs font-medium">
                {userStatusLabels[employee.status]}
              </span>
              <button
                type="button"
                className="border-border bg-background hover:bg-muted hover:text-foreground inline-flex h-8 items-center justify-center gap-1 rounded-lg border px-2.5 text-sm font-medium transition-transform active:scale-[0.98]"
                data-testid={`employee-unbind-${employee.publicId}`}
                onClick={() => onUnbindEmployee(employee.publicId)}
              >
                <UserMinus className="size-3.5" aria-hidden="true" />
                解绑
              </button>
            </div>
          </AdminDataRow>
        );
      })}
    </AdminPanel>
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
            {previousOrganization?.name ?? result.previousOrganizationPublicId}
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
              {previousOrganization?.name ??
                result.previousOrganizationPublicId}
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
            {previousOrganization?.name ?? result.previousOrganizationPublicId}
            转移到
            {targetOrganization?.name ?? result.targetOrganizationPublicId}
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
          <p className="text-brand-primary text-xs font-medium">employee</p>
          <h2 className="text-text-primary text-base font-semibold">
            员工批量导入
          </h2>
          <p className="text-text-secondary text-sm leading-6">
            先选择目标组织，再上传或粘贴 phone,name CSV/TSV；initialPassword
            可选，留空时系统生成初始密码并仅在本次结果窗口展示。模板只绑定
            organization 员工身份，不得包含
            profession,level,edition,orgAuthScopePublicId。历史
            userPublicId,organizationPublicId 绑定格式仍可受控导入。
          </p>
        </div>
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
          <span className="text-text-secondary">目标组织</span>
          <select
            className="border-border bg-background h-9 rounded-md border px-3 text-sm"
            data-testid="employee-import-organization-select"
            value={targetOrganizationPublicId}
            onChange={(event) => onTargetOrganizationChange(event.target.value)}
          >
            <option value="">请选择目标组织</option>
            {organizations.map((organization) => (
              <option key={organization.publicId} value={organization.publicId}>
                {organization.name}
              </option>
            ))}
          </select>
        </label>
        <textarea
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
              {importPreview.generatedPasswordRowCount} 行未提供
              initialPassword；成功新建账号时将在一次性分发窗口展示系统生成密码。
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

function EmployeeImportResultPanel({
  result,
}: {
  result: EmployeeImportResultDto;
}) {
  const generatedInitialPasswords = result.generatedInitialPasswords ?? [];

  return (
    <section
      className="bg-surface border-brand-primary/30 rounded-md border p-4 shadow-sm"
      data-testid="employee-import-result"
    >
      <div className="space-y-3">
        <div className="space-y-1">
          <p className="text-brand-primary text-xs font-medium">导入结果</p>
          <h2 className="text-text-primary text-base font-semibold">
            员工导入反馈
          </h2>
          <p className="text-text-secondary text-sm leading-6">
            仅展示聚合数量、行号和拒绝原因；系统生成的初始密码只在本次窗口展示，普通员工列表和详情页不显示密码明文。
          </p>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          <div className="bg-background rounded-md p-3">
            <p className="text-text-muted text-xs">成功</p>
            <p className="text-text-primary mt-1 text-sm font-medium">
              成功 {result.importedEmployees.length}
            </p>
          </div>
          <div className="bg-background rounded-md p-3">
            <p className="text-text-muted text-xs">拒绝</p>
            <p className="text-text-primary mt-1 text-sm font-medium">
              拒绝 {result.rejectedRows.length}
            </p>
          </div>
        </div>
        {result.rejectedRows.length === 0 ? (
          <p className="text-text-muted text-sm">所有行均已通过导入。</p>
        ) : (
          <ul className="text-text-secondary space-y-1 text-sm">
            {result.rejectedRows.map((rejectedRow) => (
              <li key={`${rejectedRow.rowNumber}-${rejectedRow.reason}`}>
                第 {rejectedRow.rowNumber} 行：
                {employeeImportRejectedReasonLabels[rejectedRow.reason]}
              </li>
            ))}
          </ul>
        )}
        {generatedInitialPasswords.length === 0 ? null : (
          <div
            className="border-warning bg-warning/10 rounded-md border p-3"
            data-testid="employee-generated-password-distribution"
          >
            <div className="flex flex-col gap-2 lg:flex-row lg:items-start lg:justify-between">
              <div className="space-y-1">
                <p className="text-warning text-xs font-medium">一次性分发</p>
                <h3 className="text-text-primary text-sm font-semibold">
                  初始密码一次性分发窗口
                </h3>
                <p className="text-text-secondary text-xs leading-5">
                  请在离开本结果前复制并线下交付；导入记录、普通列表和详情页不会保留密码明文。
                </p>
              </div>
              <span className="bg-warning/10 text-warning w-fit rounded-lg px-2 py-1 text-xs font-medium">
                {generatedInitialPasswords.length} 条
              </span>
            </div>
            <div className="mt-3 grid gap-2 md:grid-cols-2 xl:grid-cols-3">
              {generatedInitialPasswords.map((distributionRow) => (
                <div
                  key={`${distributionRow.rowNumber}-${distributionRow.phone}`}
                  className="border-border bg-surface rounded-md border p-3"
                >
                  <p className="text-text-primary text-sm font-medium">
                    第 {distributionRow.rowNumber} 行 / {distributionRow.name}
                  </p>
                  <p className="text-text-secondary mt-1 text-xs">
                    {distributionRow.phone} /{" "}
                    {distributionRow.organizationPublicId}
                  </p>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <code className="bg-background text-text-primary rounded px-2 py-1 text-xs">
                      {distributionRow.initialPassword}
                    </code>
                    <button
                      type="button"
                      className="border-border bg-background hover:bg-muted inline-flex h-7 items-center justify-center rounded-lg border px-2 text-xs font-medium transition-transform active:scale-[0.98]"
                      onClick={() =>
                        copyTextToClipboard(distributionRow.initialPassword)
                      }
                    >
                      复制
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
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
          员工操作只提交用户和企业公开编号；后端继续执行角色校验和脱敏审计。
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
  onCopyPlainText,
  onViewDetail,
  redeemCodes,
}: {
  onCopyPlainText: (value: string) => void;
  onViewDetail: (publicId: string) => void;
  redeemCodes: AdminRedeemCodeData["redeemCodes"];
}) {
  return (
    <AdminPanel title="卡密列表">
      {redeemCodes.map((redeemCode) => {
        const visiblePlainText =
          redeemCode.canViewPlainText && redeemCode.codePlainText !== null
            ? redeemCode.codePlainText
            : null;

        return (
          <AdminDataRow
            key={redeemCode.publicId}
            publicId={redeemCode.publicId}
            testId={`admin-redeem-code-${redeemCode.publicId}`}
          >
            <div className="min-w-0 space-y-1">
              <p className="text-text-primary font-mono text-sm font-semibold">
                {visiblePlainText ?? redeemCode.codeDisplay}
              </p>
              <p className="text-text-secondary text-xs">
                {redeemCodeTypeLabels[redeemCode.redeemCodeType]} /{" "}
                {formatProfessionLevel(redeemCode)} / 创建于{" "}
                {formatDate(redeemCode.createdAt)}
              </p>
              <p className="text-text-muted flex flex-wrap gap-1 text-xs">
                <span>兑换用户 {redeemCode.redeemedUserPublicId ?? "无"}</span>
                <span>/</span>
                <span>
                  {visiblePlainText === null ? "明文不可用" : "明文可复制"}
                </span>
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="bg-secondary text-secondary-foreground w-fit rounded-lg px-2 py-1 text-xs font-medium">
                {redeemCodeStatusLabels[redeemCode.status]}
              </span>
              {visiblePlainText === null ? null : (
                <button
                  type="button"
                  className="border-border bg-background hover:bg-muted hover:text-foreground inline-flex h-8 items-center justify-center gap-1.5 rounded-lg border px-2.5 text-xs font-medium transition-transform active:scale-[0.98]"
                  onClick={() => onCopyPlainText(visiblePlainText)}
                >
                  <Copy className="size-3.5" aria-hidden="true" />
                  复制
                </button>
              )}
              <button
                type="button"
                className="border-border bg-background hover:bg-muted hover:text-foreground inline-flex h-8 items-center justify-center gap-1.5 rounded-lg border px-2.5 text-xs font-medium transition-transform active:scale-[0.98]"
                onClick={() => onViewDetail(redeemCode.publicId)}
              >
                <Eye className="size-3.5" aria-hidden="true" />
                详情
              </button>
            </div>
          </AdminDataRow>
        );
      })}
    </AdminPanel>
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
    <section
      aria-label="卡密详情"
      className="bg-surface ring-border rounded-md p-4 shadow-sm ring-1"
      data-public-id={redeemCode.publicId}
      data-testid={`admin-redeem-code-detail-${redeemCode.publicId}`}
    >
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-1">
          <p className="text-brand-primary text-xs font-medium">卡密详情</p>
          <h2 className="text-text-primary font-mono text-base font-semibold">
            {visiblePlainText ?? redeemCode.codeDisplay}
          </h2>
          <p className="text-text-secondary text-sm leading-6">
            详情视图不展示哈希或内部标识；明文只在接口明确授权时显示。
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {visiblePlainText === null ? null : (
            <button
              type="button"
              className="border-border bg-background hover:bg-muted hover:text-foreground inline-flex h-8 items-center justify-center gap-1.5 rounded-lg border px-3 text-sm font-medium transition-transform active:scale-[0.98]"
              onClick={() => onCopyPlainText(visiblePlainText)}
            >
              <Copy className="size-3.5" aria-hidden="true" />
              复制明文
            </button>
          )}
          <button
            type="button"
            className="border-border bg-background hover:bg-muted hover:text-foreground inline-flex h-8 items-center justify-center rounded-lg border px-3 text-sm font-medium transition-transform active:scale-[0.98]"
            onClick={onClose}
          >
            关闭
          </button>
        </div>
      </div>
      <dl className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        <div className="bg-background rounded-md p-3">
          <dt className="text-text-muted text-xs">公开标识</dt>
          <dd className="text-text-primary mt-1 text-sm font-medium break-all">
            {redeemCode.publicId}
          </dd>
        </div>
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
          <dd className="text-text-primary mt-1 text-sm font-medium break-all">
            {redeemCode.redeemedUserPublicId ?? "未兑换"}
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
          <dt className="text-text-muted text-xs">生成批次</dt>
          <dd className="text-text-primary mt-1 text-sm font-medium break-all">
            {redeemCode.generationGroupId}
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
            {redeemCode.redactionStatus}
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
        {visiblePlainText === null ? "当前接口未返回明文" : "可由运营复制分发"}
      </p>
    </section>
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
            generationGroupId:{generation.generationGroupId}; count:
            {generation.count}; type:
            {generation.redeemCodeType}; profession:{generation.profession};
            level:{generation.level}; deadline:{generation.redeemDeadlineAt}
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

function AdminToast({ toastMessage }: { toastMessage: ToastMessage }) {
  return (
    <div
      className={
        toastMessage.tone === "success"
          ? "bg-secondary text-secondary-foreground fixed right-6 bottom-6 rounded-md px-4 py-3 text-sm shadow-lg"
          : "bg-destructive/10 text-destructive fixed right-6 bottom-6 rounded-md px-4 py-3 text-sm shadow-lg"
      }
      role={toastMessage.tone === "success" ? "status" : "alert"}
    >
      {toastMessage.message}
    </div>
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
  onConfirm,
}: {
  confirmationState: Exclude<OrganizationConfirmationState, null>;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  const titleByKind = {
    createOrganization: "确认新增企业组织？",
    disableOrganization: "确认停用企业组织？",
    enableOrganization: "确认启用企业组织？",
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
          组织树写操作只提交企业公开编号、层级、父级公开编号
          和必要维护字段；后端继续记录脱敏审计日志。
        </p>
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
              维护省公司、地市公司、县区公司及站点层级；层级和父级关系会在提交前校验。节点移动首期仅超级管理员
              通过受控流程处理。
            </p>
          </div>
          <button
            type="button"
            className="border-border bg-background hover:bg-muted hover:text-foreground inline-flex h-8 items-center justify-center gap-1 rounded-lg border px-2.5 text-sm font-medium transition-transform active:scale-[0.98]"
            onClick={onReset}
          >
            <PlusCircle className="size-3.5" aria-hidden="true" />
            新增模式
          </button>
        </div>

        <div className="grid gap-3 lg:grid-cols-4">
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
              <option value="province">省公司</option>
              <option value="city">地市公司</option>
              <option value="district">县区公司</option>
              <option value="station">站点</option>
            </select>
          </label>

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
                    {organization.name} / {orgTierLabels[organization.orgTier]}
                  </option>
                ))}
            </select>
          </label>

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

          <label className="flex flex-col gap-2 text-sm font-medium">
            <span className="text-text-secondary">状态</span>
            <select
              className="border-border bg-background h-9 rounded-md border px-3 text-sm"
              value={formState.status}
              onChange={(event) =>
                updateFormState({
                  status: event.target.value as OrganizationFormState["status"],
                })
              }
            >
              <option value="active">启用</option>
              <option value="disabled">停用</option>
            </select>
          </label>

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
          将生成 {input.count} 个 {input.profession} {input.level} 级卡密，
          类型为 {redeemCodeTypeLabels[input.redeemCodeType]}， 有效期{" "}
          {input.durationDay} 天，兑换截止日期 {input.redeemDeadlineDate}
          。审计日志和 evidence 只记录脱敏摘要。
        </p>
        <div className="flex gap-2">
          <button
            type="button"
            className="bg-destructive text-destructive-foreground inline-flex h-8 items-center justify-center rounded-lg px-3 text-sm font-medium transition-transform active:scale-[0.98]"
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

function RedeemCodeActionPanel({
  disabled,
  formState,
  id,
  keyword,
  onGenerateRedeemCode,
  onFormChange,
  onKeywordChange,
  onStatusChange,
  status,
}: {
  disabled: boolean;
  formState: RedeemCodeGenerationFormState;
  id?: string;
  keyword: string;
  onFormChange: (formState: RedeemCodeGenerationFormState) => void;
  onGenerateRedeemCode: (input: CreateRedeemCodeInput) => void;
  onKeywordChange: (value: string) => void;
  onStatusChange: (value: RedeemCodeStatus | "all") => void;
  status: RedeemCodeStatus | "all";
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
    <section
      className="bg-surface border-border rounded-md border p-4 shadow-sm"
      id={id}
    >
      <div className="flex flex-wrap items-end gap-3">
        <label className="flex min-w-44 flex-col gap-2 text-sm font-medium">
          <span className="text-text-secondary">卡密状态</span>
          <select
            className="border-border bg-background h-9 rounded-md border px-3 text-sm"
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
        <label className="flex min-w-56 flex-col gap-2 text-sm font-medium">
          <span className="text-text-secondary">卡密搜索</span>
          <input
            className="border-border bg-background h-9 rounded-md border px-3 text-sm"
            placeholder="卡密号或批次关键词"
            value={keyword}
            onChange={(event) => onKeywordChange(event.target.value)}
          />
        </label>
      </div>

      <div className="mt-4 grid gap-3 lg:grid-cols-12">
        <div className="flex flex-col gap-2 text-sm font-medium lg:col-span-3">
          <span className="text-text-secondary">生成模式</span>
          <div className="flex gap-2">
            <button
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

        <label className="flex flex-col gap-2 text-sm font-medium lg:col-span-3">
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

        <label className="flex flex-col gap-2 text-sm font-medium lg:col-span-2">
          <span className="text-text-secondary">数量</span>
          <input
            className="border-border bg-background h-9 rounded-md border px-3 text-sm disabled:cursor-not-allowed disabled:opacity-60"
            data-testid="redeem-code-generation-count-input"
            disabled={formState.generationMode === "single"}
            max={100}
            min={1}
            type="number"
            value={formState.count}
            onChange={(event) => updateFormState({ count: event.target.value })}
          />
        </label>

        <label className="flex flex-col gap-2 text-sm font-medium lg:col-span-2">
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

        <label className="flex flex-col gap-2 text-sm font-medium lg:col-span-1">
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

        <label className="flex flex-col gap-2 text-sm font-medium lg:col-span-2">
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

        <label className="flex flex-col gap-2 text-sm font-medium lg:col-span-2">
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
            "筛选变化自动刷新；生成操作需要二次确认，类型、专业、等级必须显式选择。"}
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

function SystemOpsPurchaseGuidanceContactConfig() {
  const contactConfig = LOCAL_PURCHASE_GUIDANCE_CONTACT_CONFIG;

  return (
    <section
      className="border-border bg-surface rounded-md border p-4 shadow-sm"
      data-testid="system-ops-purchase-guidance-contact-config"
    >
      <div className="flex items-start gap-3">
        <div className="bg-secondary text-secondary-foreground flex size-9 shrink-0 items-center justify-center rounded-full">
          <Ticket className="size-4" aria-hidden="true" />
        </div>
        <div className="min-w-0 space-y-3">
          <div className="space-y-1">
            <p className="text-brand-primary text-xs font-medium">
              购买联系配置
            </p>
            <h2 className="text-text-primary text-base font-semibold">
              {contactConfig.title}
            </h2>
            <p className="text-text-secondary text-sm leading-6">
              {contactConfig.summary}
            </p>
          </div>
          <div className="grid gap-2 md:grid-cols-2">
            {contactConfig.channels.map((channel) => (
              <div
                key={`${channel.channelType}-${channel.value}`}
                className="bg-background ring-border rounded-md p-3 text-sm ring-1"
              >
                <p className="text-text-primary font-medium">{channel.label}</p>
                <p className="text-brand-primary font-medium">
                  {channel.value}
                </p>
                <p className="text-text-secondary mt-1">
                  {channel.serviceHours}
                </p>
                <p className="text-text-muted mt-1">{channel.usage}</p>
              </div>
            ))}
          </div>
          <p className="text-text-muted text-xs leading-5">
            {contactConfig.safetyNotice}
          </p>
        </div>
      </div>
    </section>
  );
}

function useAdminOrgAuthData() {
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

  return { data, loadState, setData, setLoadState };
}

function useAdminRedeemCodeData(listQuery: string) {
  const [loadState, setLoadState] = useState<LoadState>("loading");
  const [data, setData] = useState<AdminRedeemCodeData>({
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

        setData(redeemCodeResponse.data);
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
  const { data, loadState, setData, setLoadState } = useAdminOrgAuthData();
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
  const [lastEmployeeImportResult, setLastEmployeeImportResult] =
    useState<EmployeeImportResultDto | null>(null);
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
  const selectedOrganizationDetail = useMemo(
    () =>
      selectedOrganizationPublicId === null
        ? null
        : (data.organizations.find(
            (organization) =>
              organization.publicId === selectedOrganizationPublicId,
          ) ?? null),
    [data.organizations, selectedOrganizationPublicId],
  );
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
    setToastMessage({ message: "企业授权已取消", tone: "success" });
  }

  function handleEditOrganization(
    organization: AdminOrgAuthData["organizations"][number],
  ) {
    setOrganizationFormState({
      contactName: "",
      contactPhone: "",
      mode: "update",
      name: organization.name,
      orgTier: organization.orgTier,
      parentOrganizationPublicId: organization.parentOrganizationPublicId ?? "",
      publicId: organization.publicId,
      remark: "",
      status: organization.status,
    });
  }

  function handleSubmitOrganization() {
    const organizationDraft = buildOrganizationInput(
      organizationFormState,
      data.organizations,
    );

    if (organizationDraft.input === null) {
      setToastMessage({
        message: organizationDraft.message ?? "企业组织输入无效。",
        tone: "error",
      });
      return;
    }

    setOrganizationConfirmationState({
      kind:
        organizationFormState.mode === "create"
          ? "createOrganization"
          : "updateOrganization",
      input: organizationDraft.input,
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
        { isCascade: false },
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
      setToastMessage({ message: "企业组织已停用。", tone: "success" });
      return;
    }

    if (organizationConfirmationState.kind === "enableOrganization") {
      const enableResponse = await postAdminApi<OrganizationResultDto>(
        `/api/v1/organizations/${organizationConfirmationState.publicId}/enable`,
        sessionToken,
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
      setToastMessage({ message: "企业组织已启用。", tone: "success" });
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
      setLastEmployeeImportResult(null);
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
      setLastEmployeeImportResult(null);
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
      const importResponse = await postAdminApi<EmployeeImportResultDto>(
        "/api/v1/employees/import",
        sessionToken,
        employeeConfirmationState.input,
      );

      setEmployeeConfirmationState(null);

      if (importResponse.code !== 0 || importResponse.data === null) {
        setLastEmployeeImportResult(null);
        setToastMessage({ message: importResponse.message, tone: "error" });
        return;
      }

      const { importedEmployees, rejectedRows } = importResponse.data;

      setData((currentData) => ({
        ...currentData,
        employees: [
          ...importedEmployees,
          ...currentData.employees.filter(
            (employee) =>
              !importedEmployees.some(
                (importedEmployee) =>
                  importedEmployee.publicId === employee.publicId,
              ),
          ),
        ],
        organizations: currentData.organizations.map((organization) => ({
          ...organization,
          employeeCount:
            organization.employeeCount +
            importedEmployees.filter(
              (employee) =>
                employee.organizationPublicId === organization.publicId,
            ).length,
        })),
      }));
      setLastEmployeeImportResult(importResponse.data);
      setLastEmployeeTransferResult(null);
      setEmployeeImportText("");
      setToastMessage({
        message: `员工导入完成：成功 ${importedEmployees.length}，拒绝 ${rejectedRows.length}。`,
        tone: rejectedRows.length === 0 ? "success" : "error",
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
      setLastEmployeeImportResult(null);
      setLastEmployeeTransferResult(transferredEmployee);
      setLastEmployeeUnbindResult(null);
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
    setToastMessage({ message: "员工已解绑。", tone: "success" });
  }

  async function handleEmployeeImportFileChange(file: File | null) {
    if (file === null) {
      return;
    }

    try {
      const fileContent = await file.text();

      setEmployeeImportText(fileContent);
      setLastEmployeeImportResult(null);
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
    return <AdminLoadingState label="正在加载企业授权运营数据" />;
  }

  if (loadState === "unauthorized") {
    return <AdminUnauthorizedState />;
  }

  if (loadState === "error") {
    return (
      <AdminErrorState
        title="企业授权运营数据加载失败"
        description="请稍后刷新页面，或重新登录后再查看企业授权运营数据。"
      />
    );
  }

  if (loadState === "empty") {
    return (
      <AdminEmptyState
        title="暂无企业授权运营数据"
        description="当前没有可展示的企业、企业授权或员工账号记录。"
      />
    );
  }

  return (
    <main className="space-y-6">
      <AdminPageHeader
        title="企业授权运营"
        description="查看企业组织、企业授权与员工账号的最小运营切片，所有数据均来自受保护的本地运行接口。"
        icon={<Building2 className="size-5" aria-hidden="true" />}
      />

      <OperationsOrgAuthSummaryFirstBand
        employees={data.employees}
        organizations={data.organizations}
        orgAuths={data.orgAuths}
      />

      <SystemOpsRequiredRoleEntry
        actionHref="#org-auth-create-panel"
        actionLabel="新增企业授权"
        description="企业授权新增入口在本页下方，点击后定位到内联表单；提交前仍由二次确认保护写操作，并继续只提交公开编号。"
        testId="system-ops-org-auth-create-entry"
        title="新增企业授权入口"
      />

      <OperationsPendingWorkbench
        organizations={data.organizations}
        orgAuths={data.orgAuths}
      />

      <OrganizationTreeGuidancePanel />

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

      <OrganizationTreeActionPanel
        disabled={false}
        formState={organizationFormState}
        organizations={data.organizations}
        onFormChange={setOrganizationFormState}
        onReset={() => setOrganizationFormState(defaultOrganizationFormState)}
        onSubmit={handleSubmitOrganization}
      />

      <EmployeeImportActionPanel
        importText={employeeImportText}
        importPreview={employeeImportPreview}
        organizations={data.organizations}
        targetOrganizationPublicId={selectedEmployeeImportOrganizationPublicId}
        onImportFileChange={(file) => {
          void handleEmployeeImportFileChange(file);
        }}
        onImportTextChange={(nextImportText) => {
          setEmployeeImportText(nextImportText);
          setLastEmployeeImportResult(null);
          setLastEmployeeTransferResult(null);
        }}
        onSubmit={handleSubmitEmployeeImport}
        onTemplateDownload={downloadEmployeeImportTemplate}
        onTargetOrganizationChange={(nextOrganizationPublicId) => {
          setEmployeeImportOrganizationPublicId(nextOrganizationPublicId);
          setLastEmployeeImportResult(null);
          setLastEmployeeTransferResult(null);
        }}
      />

      {lastEmployeeImportResult === null ? null : (
        <EmployeeImportResultPanel result={lastEmployeeImportResult} />
      )}

      <EmployeeTransferSessionReviewPanel
        employees={data.employees}
        onTransferEmployee={(input) => {
          setLastEmployeeTransferResult(null);
          setLastEmployeeUnbindResult(null);
          setEmployeeConfirmationState({
            employeePublicId: input.employeePublicId,
            kind: "transferEmployee",
            targetOrganizationPublicId: input.targetOrganizationPublicId,
          });
        }}
        organizations={data.organizations}
        orgAuths={data.orgAuths}
      />

      <section className="grid gap-4 xl:grid-cols-3">
        <OrganizationList
          organizations={data.organizations}
          onDisableOrganization={(publicId) =>
            setOrganizationConfirmationState({
              kind: "disableOrganization",
              publicId,
            })
          }
          onEditOrganization={handleEditOrganization}
          onEnableOrganization={(publicId) =>
            setOrganizationConfirmationState({
              kind: "enableOrganization",
              publicId,
            })
          }
          onViewOrganizationDetail={setSelectedOrganizationPublicId}
        />
        <OrgAuthList
          orgAuths={data.orgAuths}
          onCancelOrgAuth={(publicId) =>
            setConfirmationState({ kind: "cancelOrgAuth", publicId })
          }
          onViewOrgAuthDetail={(publicId) => {
            void handleViewOrgAuthDetail(publicId);
          }}
        />
        <EmployeeList
          employees={data.employees}
          organizations={data.organizations}
          onUnbindEmployee={(publicId) => {
            setLastEmployeeTransferResult(null);
            setLastEmployeeUnbindResult(null);
            setEmployeeConfirmationState({
              kind: "unbindEmployee",
              publicId,
            });
          }}
        />
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

      {selectedOrganizationDetail === null ? null : (
        <OrganizationDetailPanel
          employees={data.employees}
          organization={selectedOrganizationDetail}
          organizations={data.organizations}
          orgAuths={data.orgAuths}
          onClose={() => setSelectedOrganizationPublicId(null)}
          onDisableOrganization={(publicId) =>
            setOrganizationConfirmationState({
              kind: "disableOrganization",
              publicId,
            })
          }
          onEditOrganization={handleEditOrganization}
          onEnableOrganization={(publicId) =>
            setOrganizationConfirmationState({
              kind: "enableOrganization",
              publicId,
            })
          }
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
        <AdminToast toastMessage={toastMessage} />
      )}
    </main>
  );
}

export function AdminRedeemCodePage() {
  const [redeemCodeStatus, setRedeemCodeStatus] = useState<
    RedeemCodeStatus | "all"
  >("all");
  const [redeemCodeKeyword, setRedeemCodeKeyword] = useState("");
  const redeemCodeListQuery = useMemo(
    () =>
      createRedeemCodeListQuery({
        keyword: redeemCodeKeyword,
        status: redeemCodeStatus,
      }),
    [redeemCodeKeyword, redeemCodeStatus],
  );
  const { data, loadState, setData, setLoadState } =
    useAdminRedeemCodeData(redeemCodeListQuery);
  const [confirmationState, setConfirmationState] =
    useState<RedeemCodeConfirmationState>(null);
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
  const isRedeemCodeListEmpty = loadState === "empty";

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
      message: "卡密已生成，请仅在本地验证时复制给学员",
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
        description="查看卡密使用状态、类型和授权范围；符合权限的运营人员可复制明文，页面不展示哈希或内部标识。"
        icon={<Ticket className="size-5" aria-hidden="true" />}
      />

      <OperationsRedeemCodeSummaryFirstBand
        hasUnavailablePlainTextCode={hasUnavailablePlainTextCode}
        redeemCodes={data.redeemCodes}
      />

      <SystemOpsRequiredRoleEntry
        actionHref="#redeem-code-generate-panel"
        actionLabel="生成卡密"
        description="卡密生成入口在本页筛选区旁，点击后定位到内联操作；生成前必须显式选择类型并经过二次确认。"
        testId="system-ops-redeem-code-generate-entry"
        title="生成卡密入口"
      />

      <RedeemCodeActionPanel
        disabled={false}
        formState={redeemCodeGenerationFormState}
        id="redeem-code-generate-panel"
        keyword={redeemCodeKeyword}
        status={redeemCodeStatus}
        onFormChange={setRedeemCodeGenerationFormState}
        onGenerateRedeemCode={(input) =>
          setConfirmationState({ kind: "generateRedeemCode", input })
        }
        onKeywordChange={setRedeemCodeKeyword}
        onStatusChange={setRedeemCodeStatus}
      />

      <SystemOpsPurchaseGuidanceContactConfig />

      {generatedRedeemCodeSummary === null ? null : (
        <RedeemCodeDistributionWindow
          generation={generatedRedeemCodeSummary}
          redeemCodes={generatedRedeemCodes}
          onCopyAll={handleCopyGeneratedRedeemCodes}
          onCopyOne={handleCopyRedeemCodePlainText}
        />
      )}

      {hasUnavailablePlainTextCode ? (
        <RedeemCodePlainTextUnavailableNotice />
      ) : null}

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

      {isRedeemCodeListEmpty ? (
        <AdminEmptyState
          title="暂无卡密数据"
          description="当前没有可展示的卡密记录。"
        />
      ) : (
        <RedeemCodeList
          redeemCodes={data.redeemCodes}
          onCopyPlainText={handleCopyRedeemCodePlainText}
          onViewDetail={(publicId) => {
            void handleViewRedeemCodeDetail(publicId);
          }}
        />
      )}

      {confirmationState === null ? null : (
        <RedeemCodeConfirmationDialog
          input={confirmationState.input}
          onCancel={() => setConfirmationState(null)}
          onConfirm={() => void handleConfirmRedeemCodeAction()}
        />
      )}

      {toastMessage === null ? null : (
        <AdminToast toastMessage={toastMessage} />
      )}
    </main>
  );
}
