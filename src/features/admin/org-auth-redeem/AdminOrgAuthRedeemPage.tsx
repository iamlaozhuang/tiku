"use client";

import Link from "next/link";
import {
  AlertCircle,
  Ban,
  Building2,
  CheckCircle2,
  Clock3,
  Eye,
  KeyRound,
  LoaderCircle,
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
  expiresAt: string;
  level: number;
  name: string;
  organizationPublicIds: string[];
  profession: Profession;
  purchaserOrganizationPublicId: string;
  startsAt: string;
};

type OrgAuthFormState = {
  accountQuota: string;
  authScopeType: AuthScopeType;
  expiresAt: string;
  level: string;
  name: string;
  organizationPublicIds: string[];
  profession: Profession;
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
  formatLabel: string;
  isReady: boolean;
  message: string;
  rowCount: number;
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
  | null;

type RedeemCodeConfirmationState = {
  kind: "generateRedeemCode";
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

type GeneratedRedeemCode = RedeemCodeGenerationDto["redeemCodes"][number];

const SESSION_TOKEN_STORAGE_KEY = "tiku.localSessionToken";
const DEFAULT_LIST_QUERY = "page=1&pageSize=20";

const professionLabels = {
  logistics: "物流",
  marketing: "营销",
  monopoly: "专卖",
} satisfies Record<Profession, string>;

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
  duplicate_phone: "手机号重复",
  duplicate_user: "用户重复",
  employee_create_failed: "员工创建失败",
  invalid_row: "行格式无效",
  organization_not_found: "企业组织不存在",
  user_not_found: "用户不存在",
} satisfies Record<
  EmployeeImportResultDto["rejectedRows"][number]["reason"],
  string
>;

const defaultOrgAuthFormState: OrgAuthFormState = {
  accountQuota: "100",
  authScopeType: "current_and_descendants",
  expiresAt: "2027-05-25",
  level: "3",
  name: "本地验证企业授权",
  organizationPublicIds: [],
  profession: "monopoly",
  purchaserOrganizationPublicId: "",
  startsAt: "2026-05-25",
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

function buildOrgAuthInput(
  formState: OrgAuthFormState,
  organizations: AdminOrgAuthData["organizations"],
): { input: CreateOrgAuthInput | null; message: string | null } {
  const purchaserOrganizationPublicId =
    formState.purchaserOrganizationPublicId ||
    findFirstOrganizationPublicId(organizations);
  const name = formState.name.trim();
  const accountQuota = Number(formState.accountQuota);
  const level = Number(formState.level);
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

  if (!Number.isInteger(level) || level <= 0) {
    return { input: null, message: "等级必须为正整数。" };
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
      expiresAt: toStartOfDayIso(formState.expiresAt),
      level,
      name,
      organizationPublicIds,
      profession: formState.profession,
      purchaserOrganizationPublicId,
      startsAt: toStartOfDayIso(formState.startsAt),
    },
    message: null,
  };
}

function normalizeOptionalOrganizationText(value: string): string | null {
  const text = value.trim();

  return text.length === 0 ? null : text;
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

function buildEmployeeImportInput(value: string): {
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
  const firstLine = lines[0]?.toLowerCase().replace(/\s+/gu, "") ?? "";
  const hasEmployeeAccountHeader =
    firstLine.includes("phone") &&
    firstLine.includes("name") &&
    firstLine.includes("initialpassword") &&
    firstLine.includes("organizationpublicid");
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

  return {
    input: {
      content: trimmedValue,
      sourceFormat: lines.some((line) => line.includes("\t")) ? "tsv" : "csv",
    },
    message: null,
  };
}

function buildEmployeeImportPreview(value: string): EmployeeImportPreview {
  const trimmedValue = value.trim();

  if (trimmedValue.length === 0) {
    return {
      formatLabel: "待输入",
      isReady: false,
      message: "请粘贴员工导入内容。",
      rowCount: 0,
    };
  }

  const lines = trimmedValue
    .split(/\r?\n/u)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
  const firstLine = lines[0]?.toLowerCase().replace(/\s+/gu, "") ?? "";
  const hasEmployeeAccountHeader =
    firstLine.includes("phone") &&
    firstLine.includes("name") &&
    firstLine.includes("initialpassword") &&
    firstLine.includes("organizationpublicid");
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
      formatLabel: "userPublicId 绑定导入",
      isReady: lines.length > 0,
      message: `将按 publicId 绑定格式解析 ${lines.length} 行员工。`,
      rowCount: lines.length,
    };
  }

  const sourceFormat = lines.some((line) => line.includes("\t"))
    ? "TSV"
    : "CSV";
  const rowCount = hasEmployeeAccountHeader
    ? Math.max(lines.length - 1, 0)
    : lines.length;

  return {
    formatLabel: `员工账号 ${sourceFormat}`,
    isReady: rowCount > 0,
    message:
      rowCount > 0
        ? `将按员工账号 ${sourceFormat} 解析 ${rowCount} 行员工。`
        : "请至少提供一行员工数据。",
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
    ? "所选专业/等级、有效期和企业范围已存在生效企业授权，请调整覆盖范围或取消旧授权。"
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

function createDefaultRedeemCodeInput() {
  return {
    count: 3,
    durationDay: 365,
    level: 3,
    profession: "monopoly",
    redeemDeadlineDate: "2026-06-24",
  };
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
  return (
    <AdminPanel title="企业组织">
      {organizations.map((organization) => (
        <AdminDataRow
          key={organization.publicId}
          publicId={organization.publicId}
          testId={`admin-organization-${organization.publicId}`}
        >
          <div className="min-w-0 space-y-1">
            <p className="text-text-primary text-sm font-medium">
              {organization.name}
            </p>
            <p className="text-text-secondary text-xs">
              {orgTierLabels[organization.orgTier]} /{" "}
              {organization.employeeCount} 名员工
            </p>
            <p className="text-text-muted text-xs">
              父级 {organization.parentOrganizationPublicId ?? "无"} /{" "}
              {organization.authSummary ?? "暂无授权摘要"}
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
      ))}
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
            基于当前后台列表数据聚合组织、授权和员工摘要；写操作继续通过既有二次确认提交。
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
              organization.parentOrganizationPublicId ??
              "无"}
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
          <p className="text-brand-primary text-xs font-medium">org_auth</p>
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

function EmployeeList({
  employees,
  onUnbindEmployee,
}: {
  employees: AdminOrgAuthData["employees"];
  onUnbindEmployee: (publicId: string) => void;
}) {
  return (
    <AdminPanel title="员工账号">
      {employees.map((employee) => (
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
      ))}
    </AdminPanel>
  );
}

function EmployeeImportActionPanel({
  importText,
  importPreview,
  onImportTextChange,
  onSubmit,
}: {
  importText: string;
  importPreview: EmployeeImportPreview;
  onImportTextChange: (value: string) => void;
  onSubmit: () => void;
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
            支持 userPublicId,organizationPublicId，或粘贴
            phone,name,initialPassword,organizationPublicId CSV/TSV。
          </p>
        </div>
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
            仅展示聚合数量、行号和拒绝原因；原始导入内容与 publicId
            不在结果反馈中回显。
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
            {isImport ? "确认导入员工？" : "确认解绑员工？"}
          </h2>
        </div>
        <p className="text-text-muted text-sm leading-6">
          员工操作只提交用户和企业 publicId；后端继续执行角色校验和脱敏审计。
        </p>
        <div className="flex gap-2">
          <button
            type="button"
            className={
              isImport
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
  onViewDetail,
  redeemCodes,
}: {
  onViewDetail: (publicId: string) => void;
  redeemCodes: AdminRedeemCodeData["redeemCodes"];
}) {
  return (
    <AdminPanel title="卡密列表">
      {redeemCodes.map((redeemCode) => (
        <AdminDataRow
          key={redeemCode.publicId}
          publicId={redeemCode.publicId}
          testId={`admin-redeem-code-${redeemCode.publicId}`}
        >
          <div className="min-w-0 space-y-1">
            <p className="text-text-primary font-mono text-sm font-semibold">
              {redeemCode.codeDisplay}
            </p>
            <p className="text-text-secondary text-xs">
              {formatProfessionLevel(redeemCode)} / 创建于{" "}
              {formatDate(redeemCode.createdAt)}
            </p>
            <p className="text-text-muted flex flex-wrap gap-1 text-xs">
              <span>兑换用户 {redeemCode.redeemedUserPublicId ?? "无"}</span>
              <span>/</span>
              <span>
                {redeemCode.canViewPlainText ? "可查看明文" : "不可查看明文"}
              </span>
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="bg-secondary text-secondary-foreground w-fit rounded-lg px-2 py-1 text-xs font-medium">
              {redeemCodeStatusLabels[redeemCode.status]}
            </span>
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
      ))}
    </AdminPanel>
  );
}

function RedeemCodeDetailPanel({
  onClose,
  redeemCode,
}: {
  onClose: () => void;
  redeemCode: RedeemCodeDetailDto;
}) {
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
            {redeemCode.codeDisplay}
          </h2>
          <p className="text-text-secondary text-sm leading-6">
            详情视图只展示脱敏字段和公开标识，不展示明文卡密或哈希。
          </p>
        </div>
        <button
          type="button"
          className="border-border bg-background hover:bg-muted hover:text-foreground inline-flex h-8 items-center justify-center rounded-lg border px-3 text-sm font-medium transition-transform active:scale-[0.98]"
          onClick={onClose}
        >
          关闭
        </button>
      </div>
      <dl className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        <div className="bg-background rounded-md p-3">
          <dt className="text-text-muted text-xs">公开标识</dt>
          <dd className="text-text-primary mt-1 text-sm font-medium break-all">
            {redeemCode.publicId}
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
            {redeemCode.redactionReason}
          </dd>
        </div>
      </dl>
      <p className="text-text-muted mt-3 text-xs">
        明文状态：
        {redeemCode.canViewPlainText
          ? "仅本次生成响应允许查看"
          : "历史列表不可查看"}
      </p>
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
            ? "创建会提交企业 publicId、授权范围、专业等级、额度和有效期，由后端执行重叠校验。"
            : "取消会终止该企业授权，并由后端处理受影响的练习和模拟考试会话。"}
        </p>
        <div className="flex gap-2">
          <button
            type="button"
            className={
              isCreate
                ? "bg-primary text-primary-foreground inline-flex h-8 items-center justify-center rounded-lg px-3 text-sm font-medium transition-transform active:scale-[0.98]"
                : "bg-destructive text-destructive-foreground inline-flex h-8 items-center justify-center rounded-lg px-3 text-sm font-medium transition-transform active:scale-[0.98]"
            }
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
          组织树写操作只提交企业 publicId、层级、父级 publicId
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
              维护省公司、地市公司、县区公司及站点层级；层级和父级关系会在提交前校验。
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
  onCancel,
  onConfirm,
}: {
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
          批量生成会调用后端原子创建流程；明文只在本次响应中显示，不能写入
          evidence。
        </p>
        <div className="flex gap-2">
          <button
            type="button"
            className="bg-destructive text-destructive-foreground inline-flex h-8 items-center justify-center rounded-lg px-3 text-sm font-medium transition-transform active:scale-[0.98]"
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

  return (
    <section
      className="bg-surface border-border rounded-md border p-4 shadow-sm"
      id={id}
    >
      <div className="space-y-4">
        <div className="space-y-1">
          <p className="text-brand-primary text-xs font-medium">org_auth</p>
          <h2 className="text-text-primary text-base font-semibold">
            创建企业授权
          </h2>
          <p className="text-text-secondary text-sm leading-6">
            选择购买主体、授权范围、专业等级、额度和有效期；提交后后端会展开企业范围并校验重叠授权。
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

          <label className="flex flex-col gap-2 text-sm font-medium">
            <span className="text-text-secondary">专业</span>
            <select
              className="border-border bg-background h-9 rounded-md border px-3 text-sm"
              value={formState.profession}
              onChange={(event) =>
                updateFormState({
                  profession: event.target.value as Profession,
                })
              }
            >
              <option value="monopoly">专卖</option>
              <option value="marketing">营销</option>
              <option value="logistics">物流</option>
            </select>
          </label>

          <label className="flex flex-col gap-2 text-sm font-medium">
            <span className="text-text-secondary">等级</span>
            <input
              className="border-border bg-background h-9 rounded-md border px-3 text-sm"
              min="1"
              type="number"
              value={formState.level}
              onChange={(event) =>
                updateFormState({ level: event.target.value })
              }
            />
          </label>

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
                      {orgTierLabels[organization.orgTier]} /{" "}
                      {organization.publicId}
                    </span>
                  </span>
                </label>
              );
            })}
          </div>
        </div>

        {formValidation.message === null ? null : (
          <p className="text-destructive text-sm">{formValidation.message}</p>
        )}

        <div className="flex justify-end">
          <button
            type="button"
            className="bg-primary text-primary-foreground inline-flex h-9 items-center justify-center rounded-lg px-4 text-sm font-medium transition-transform active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
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
  id,
  keyword,
  onGenerateRedeemCode,
  onKeywordChange,
  onStatusChange,
  status,
}: {
  id?: string;
  keyword: string;
  onGenerateRedeemCode: () => void;
  onKeywordChange: (value: string) => void;
  onStatusChange: (value: RedeemCodeStatus | "all") => void;
  status: RedeemCodeStatus | "all";
}) {
  return (
    <section
      className="bg-surface border-border flex flex-wrap items-end gap-3 rounded-md border p-4 shadow-sm"
      id={id}
    >
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
      <button
        type="button"
        className="bg-primary text-primary-foreground inline-flex h-9 items-center justify-center rounded-lg px-4 text-sm font-medium transition-transform active:scale-[0.98]"
        onClick={onGenerateRedeemCode}
      >
        生成卡密
      </button>
      <p className="text-text-muted text-sm">
        筛选变化自动刷新；生成操作需要二次确认。
      </p>
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
              contact_config
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
        setLoadState(
          nextData.organizations.length === 0 &&
            nextData.orgAuths.length === 0 &&
            nextData.employees.length === 0
            ? "empty"
            : "ready",
        );
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
  const [lastEmployeeImportResult, setLastEmployeeImportResult] =
    useState<EmployeeImportResultDto | null>(null);
  const [selectedOrganizationPublicId, setSelectedOrganizationPublicId] =
    useState<string | null>(null);
  const [selectedOrgAuthPublicId, setSelectedOrgAuthPublicId] = useState<
    string | null
  >(null);
  const [selectedOrgAuthDetail, setSelectedOrgAuthDetail] =
    useState<OrgAuthDetailDto | null>(null);
  const [toastMessage, setToastMessage] = useState<ToastMessage | null>(null);
  const totalEmployeeCount = useMemo(
    () =>
      data.organizations.reduce(
        (employeeCount, organization) =>
          employeeCount + organization.employeeCount,
        0,
      ),
    [data.organizations],
  );
  const employeeImportPreview = useMemo(
    () => buildEmployeeImportPreview(employeeImportText),
    [employeeImportText],
  );
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

      const createdOrgAuth = createResponse.data.orgAuth;

      setData((currentData) => ({
        ...currentData,
        orgAuths: [
          createdOrgAuth,
          ...currentData.orgAuths.filter(
            (orgAuth) => orgAuth.publicId !== createdOrgAuth.publicId,
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
    const importDraft = buildEmployeeImportInput(employeeImportText);

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
      setEmployeeImportText("");
      setToastMessage({
        message: `员工导入完成：成功 ${importedEmployees.length}，拒绝 ${rejectedRows.length}。`,
        tone: rejectedRows.length === 0 ? "success" : "error",
      });
      return;
    }

    const unbindResponse = await postAdminApi<EmployeeUnbindResultDto>(
      `/api/v1/employees/${employeeConfirmationState.publicId}/unbind`,
      sessionToken,
    );

    setEmployeeConfirmationState(null);

    if (unbindResponse.code !== 0 || unbindResponse.data === null) {
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
    setToastMessage({ message: "员工已解绑。", tone: "success" });
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
        description="查看企业组织、企业授权与员工账号的最小运营切片，所有数据均来自受保护的本地 runtime API。"
        icon={<Building2 className="size-5" aria-hidden="true" />}
      />

      <SystemOpsRequiredRoleEntry
        actionHref="#org-auth-create-panel"
        actionLabel="新增企业授权"
        description="企业授权新增入口在本页下方，点击后定位到内联表单；提交前仍由二次确认保护写操作，并继续只提交 publicId。"
        testId="system-ops-org-auth-create-entry"
        title="新增企业授权入口"
      />

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
        disabled={data.organizations.length === 0}
        formState={organizationFormState}
        organizations={data.organizations}
        onFormChange={setOrganizationFormState}
        onReset={() => setOrganizationFormState(defaultOrganizationFormState)}
        onSubmit={handleSubmitOrganization}
      />

      <EmployeeImportActionPanel
        importText={employeeImportText}
        importPreview={employeeImportPreview}
        onImportTextChange={(nextImportText) => {
          setEmployeeImportText(nextImportText);
          setLastEmployeeImportResult(null);
        }}
        onSubmit={handleSubmitEmployeeImport}
      />

      {lastEmployeeImportResult === null ? null : (
        <EmployeeImportResultPanel result={lastEmployeeImportResult} />
      )}

      <section className="grid gap-4 xl:grid-cols-3" aria-label="企业授权摘要">
        <SummaryTile
          icon={<Building2 className="size-4" aria-hidden="true" />}
          label="企业组织"
          value={`${data.organizations.length}`}
        />
        <SummaryTile
          icon={<ShieldCheck className="size-4" aria-hidden="true" />}
          label="企业授权"
          value={`${data.orgAuths.length}`}
        />
        <SummaryTile
          icon={<UsersRound className="size-4" aria-hidden="true" />}
          label="组织员工"
          value={`${totalEmployeeCount}`}
        />
      </section>

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
          onUnbindEmployee={(publicId) =>
            setEmployeeConfirmationState({
              kind: "unbindEmployee",
              publicId,
            })
          }
        />
      </section>

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
  const [generatedRedeemCode, setGeneratedRedeemCode] =
    useState<GeneratedRedeemCode | null>(null);
  const [selectedRedeemCodePublicId, setSelectedRedeemCodePublicId] = useState<
    string | null
  >(null);
  const [selectedRedeemCodeDetail, setSelectedRedeemCodeDetail] =
    useState<RedeemCodeDetailDto | null>(null);
  const [toastMessage, setToastMessage] = useState<ToastMessage | null>(null);
  const hasUnavailablePlainTextCode = data.redeemCodes.some(
    (redeemCode) =>
      redeemCode.status === "unused" && !redeemCode.canViewPlainText,
  );

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

    if (sessionToken === null || confirmationState === null) {
      setConfirmationState(null);
      setLoadState("unauthorized");
      return;
    }

    const createResponse = await postAdminApi<RedeemCodeGenerationDto>(
      "/api/v1/redeem-codes",
      sessionToken,
      createDefaultRedeemCodeInput(),
    );

    setConfirmationState(null);

    if (createResponse.code !== 0 || createResponse.data === null) {
      setToastMessage({
        message: createResponse.message,
        tone: "error",
      });
      return;
    }

    const firstGeneratedRedeemCode = createResponse.data.redeemCodes[0] ?? null;
    const generatedRedeemCodes = createResponse.data.redeemCodes;

    setGeneratedRedeemCode(firstGeneratedRedeemCode);
    setData((currentData) => ({
      redeemCodes: [
        ...generatedRedeemCodes.map((redeemCode) => ({
          canViewPlainText: true,
          codeDisplay: redeemCode.codeDisplay,
          createdAt: redeemCode.createdAt,
          level: redeemCode.level,
          profession: redeemCode.profession,
          publicId: redeemCode.publicId,
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

  if (loadState === "empty") {
    return (
      <AdminEmptyState
        title="暂无卡密数据"
        description="当前没有可展示的卡密记录。"
      />
    );
  }

  return (
    <main className="space-y-6">
      <AdminPageHeader
        title="卡密管理"
        description="查看卡密使用状态和授权范围。页面只展示 API 提供的脱敏卡密，不展示明文或哈希。"
        icon={<Ticket className="size-5" aria-hidden="true" />}
      />

      <SystemOpsRequiredRoleEntry
        actionHref="#redeem-code-generate-panel"
        actionLabel="生成卡密"
        description="卡密生成入口在本页筛选区旁，点击后定位到内联操作；生成前必须经过二次确认，页面仍不会展示卡密哈希。"
        testId="system-ops-redeem-code-generate-entry"
        title="生成卡密入口"
      />

      <RedeemCodeActionPanel
        id="redeem-code-generate-panel"
        keyword={redeemCodeKeyword}
        status={redeemCodeStatus}
        onGenerateRedeemCode={() =>
          setConfirmationState({ kind: "generateRedeemCode" })
        }
        onKeywordChange={setRedeemCodeKeyword}
        onStatusChange={setRedeemCodeStatus}
      />

      <SystemOpsPurchaseGuidanceContactConfig />

      {generatedRedeemCode === null ? null : (
        <section
          aria-label="本地卡密生成结果"
          className="bg-surface border-success/40 rounded-md border p-4 shadow-sm"
        >
          <div className="space-y-2">
            <p className="text-text-primary text-sm font-semibold">
              卡密已生成，请仅在本地验证时复制给学员
            </p>
            <p className="text-text-secondary text-xs">
              明文仅在本次创建响应中展示；提交 evidence 时只记录脱敏摘要。
            </p>
            <p className="text-text-primary font-mono text-base font-semibold tracking-normal">
              {generatedRedeemCode.codePlainText}
            </p>
          </div>
        </section>
      )}

      {hasUnavailablePlainTextCode ? (
        <RedeemCodePlainTextUnavailableNotice />
      ) : null}

      <section className="grid gap-4 xl:grid-cols-3" aria-label="卡密摘要">
        <SummaryTile
          icon={<KeyRound className="size-4" aria-hidden="true" />}
          label="卡密总数"
          value={`${data.redeemCodes.length}`}
        />
        <SummaryTile
          icon={<CheckCircle2 className="size-4" aria-hidden="true" />}
          label="未使用"
          value={`${
            data.redeemCodes.filter(
              (redeemCode) => redeemCode.status === "unused",
            ).length
          }`}
        />
        <SummaryTile
          icon={<Clock3 className="size-4" aria-hidden="true" />}
          label="已使用或过期"
          value={`${
            data.redeemCodes.filter(
              (redeemCode) => redeemCode.status !== "unused",
            ).length
          }`}
        />
      </section>

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
          onClose={() => {
            setSelectedRedeemCodePublicId(null);
            setSelectedRedeemCodeDetail(null);
          }}
        />
      )}

      <RedeemCodeList
        redeemCodes={data.redeemCodes}
        onViewDetail={(publicId) => {
          void handleViewRedeemCodeDetail(publicId);
        }}
      />

      {confirmationState === null ? null : (
        <RedeemCodeConfirmationDialog
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
