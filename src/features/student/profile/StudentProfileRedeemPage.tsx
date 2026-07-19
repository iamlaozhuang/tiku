"use client";

import Link from "next/link";
import {
  AlertCircle,
  CheckCircle2,
  Clock3,
  KeyRound,
  LogOut,
  ShieldCheck,
  Ticket,
  UserRound,
} from "lucide-react";
import { type FormEvent, useEffect, useMemo, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { ApiResponse } from "@/server/contracts/api-response";
import type {
  PersonalAuthDto,
  PersonalAuthListDto,
  RedeemCodePreviewDto,
  RedeemCodeRedemptionDto,
} from "@/server/contracts/authorization-contract";
import type { AuthContextDto } from "@/server/contracts/auth-contract";
import { LOCAL_PURCHASE_GUIDANCE_CONTACT_CONFIG } from "@/lib/local-purchase-guidance-contact-config";
import type {
  AuthorizationListItemDto,
  EffectiveAuthorizationDto,
  EffectiveAuthorizationListDto,
} from "@/server/contracts/effective-authorization-contract";
import type { EditionAwareAuthorizationContextDto } from "@/server/contracts/edition-aware-authorization-contract";
import type { Profession, RedeemCodeType } from "@/server/models/auth";
import {
  clearStoredStudentSessionToken,
  isStudentUnauthorizedResponse,
} from "../studentRuntimeApi";

type LoadState = "loading" | "ready" | "unauthorized" | "error";
type LogoutState = "idle" | "submitting" | "error";
type RedeemSubmitState =
  | "idle"
  | "previewing"
  | "ready"
  | "redeeming"
  | "success"
  | "error";

type RedeemCodeReadyPreview = {
  inputSnapshot: string;
  data: RedeemCodePreviewDto;
};

const REDEEM_CODE_PATTERN = /^[A-HJ-NP-Z2-9]{8}$/u;

const professionLabels: Record<Profession, string> = {
  logistics: "物流",
  marketing: "营销",
  monopoly: "专卖",
};

const authorizationTypeLabels = {
  org_auth: "企业授权",
  personal_auth: "个人授权",
} satisfies Record<string, string>;

const editionLabels = {
  advanced: "高级版",
  standard: "标准版",
} satisfies Record<string, string>;

const redeemCodeTypeLabels = {
  edition_upgrade: "版本升级卡",
  personal_advanced_activation: "高级版激活卡",
  personal_standard_activation: "标准版激活卡",
} satisfies Record<RedeemCodeType, string>;

const upgradeStatusLabels = {
  active: "升级生效",
  expired: "升级过期",
  none: "无升级",
  revoked: "升级撤销",
} satisfies Record<string, string>;

const quotaOwnerTypeLabels = {
  organization: "企业",
  personal: "个人",
} satisfies Record<string, string>;

function normalizeRedeemCodeInput(value: string): string {
  return value
    .toUpperCase()
    .replace(/[^A-Z0-9]/gu, "")
    .slice(0, 8);
}

async function fetchApi<TData>(
  path: string,
  init?: RequestInit,
): Promise<ApiResponse<TData | null>> {
  const request: RequestInit = {
    ...init,
    credentials: init?.credentials ?? "same-origin",
  };
  const response = await fetch(path, request);

  return (await response.json()) as ApiResponse<TData | null>;
}

function isSuccessfulSessionLogoutPayload(payload: unknown): boolean {
  if (payload === null || typeof payload !== "object") {
    return false;
  }

  const responseFields = payload as Record<string, unknown>;

  return (
    responseFields.code === 0 &&
    typeof responseFields.message === "string" &&
    responseFields.data === null
  );
}

async function revokeServerSession(): Promise<boolean> {
  try {
    const response = await fetch("/api/v1/sessions", {
      credentials: "same-origin",
      method: "DELETE",
    });
    const payload: unknown = await response.json();

    return response.ok && isSuccessfulSessionLogoutPayload(payload);
  } catch {
    return false;
  }
}

function formatDate(value: string | null): string {
  return value === null ? "未设置" : value.slice(0, 10);
}

function formatScopeLabel(input: {
  profession: Profession;
  level: number;
}): string {
  return `${professionLabels[input.profession]} ${input.level}级`;
}

function formatPreviewScopeLabel(input: {
  profession: Profession;
  level: number;
}): string {
  const levelLabel =
    (
      { 1: "一级", 2: "二级", 3: "三级", 4: "四级", 5: "五级" } as Record<
        number,
        string
      >
    )[input.level] ?? `${input.level}级`;

  return `${professionLabels[input.profession]} · ${levelLabel}`;
}

function formatChineseDate(value: string): string {
  const date = new Date(value);

  return `${date.getUTCFullYear()}年${date.getUTCMonth() + 1}月${date.getUTCDate()}日`;
}

function formatRedeemDeadline(value: string | null): string {
  return value === null ? "长期可兑换" : formatChineseDate(value);
}

function formatQuotaOwnerLabel(
  quotaOwnerType: EditionAwareAuthorizationContextDto["quotaOwnerType"],
): string {
  return `${quotaOwnerTypeLabels[quotaOwnerType]}额度`;
}

function isEmployeeUser(authContext: AuthContextDto): boolean {
  return authContext.user.userType === "employee";
}

function readEditionAwareAuthorizationContexts(
  input: EffectiveAuthorizationListDto,
): EditionAwareAuthorizationContextDto[] {
  const authorizationContextPayload = input as {
    authorizationContexts?: EditionAwareAuthorizationContextDto[];
  };

  return authorizationContextPayload.authorizationContexts ?? [];
}

function mapRedeemFailureMessage(
  payload: ApiResponse<unknown>,
  statusHint?: number,
): string {
  if (payload.code === 401001 || statusHint === 401) {
    return "请先登录";
  }

  if (payload.code === 400003 || statusHint === 400) {
    return "兑换码格式不正确";
  }

  if (payload.code === 404001 || statusHint === 404) {
    return "兑换码不存在";
  }

  if (payload.code === 409005) {
    return "权益预览已变化，请重新预览";
  }

  if (payload.code === 409006 || payload.code === 409007) {
    return "暂时无法确认该卡密权益，请重新预览";
  }

  if (payload.code === 409002 || statusHint === 409) {
    return "该兑换码已被使用";
  }

  if (payload.code === 410001 || statusHint === 410) {
    return "兑换码已过期";
  }

  if (payload.code === 503003 || statusHint === 503) {
    return "兑换服务暂不可用，请稍后重试";
  }

  if (payload.code === 429001 || statusHint === 429) {
    return "预览请求过于频繁，请稍后重试";
  }

  return "兑换失败，请稍后重试";
}

function shouldInvalidateRedeemPreview(code: number): boolean {
  return [404001, 409002, 409005, 409006, 410001].includes(code);
}

function StudentSurfaceStatus({
  action,
  description,
  title,
}: {
  action?: React.ReactNode;
  description: string;
  title: string;
}) {
  return (
    <main className="bg-background mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-md flex-col items-center justify-center gap-4 px-6 text-center">
      <div className="bg-secondary text-secondary-foreground flex size-11 items-center justify-center rounded-full">
        <AlertCircle className="size-5" aria-hidden="true" />
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

function StudentProfileLoading({ label }: { label: string }) {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-4 px-4 py-5">
      <p className="text-text-secondary text-sm">{label}</p>
      {[0, 1, 2].map((itemIndex) => (
        <div
          key={itemIndex}
          className="bg-surface ring-border rounded-xl p-4 shadow-sm ring-1"
        >
          <div className="bg-border h-4 w-3/4 animate-pulse rounded" />
          <div className="bg-border mt-3 h-3 w-1/2 animate-pulse rounded" />
          <div className="bg-border mt-4 h-8 w-full animate-pulse rounded-lg" />
        </div>
      ))}
    </main>
  );
}

function ProfileHeader({
  authContext,
  logoutState,
  onLogout,
}: {
  authContext: AuthContextDto;
  logoutState: LogoutState;
  onLogout: () => void;
}) {
  return (
    <section className="bg-surface ring-border flex flex-col gap-4 rounded-xl p-4 shadow-sm ring-1">
      <div className="flex items-start justify-between gap-3">
        <div className="bg-secondary text-secondary-foreground flex size-11 shrink-0 items-center justify-center rounded-full">
          <UserRound className="size-5" aria-hidden="true" />
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0 space-y-1">
            <h1 className="font-heading text-text-primary text-2xl font-semibold">
              {authContext.user.name}
            </h1>
            <p className="text-text-secondary text-sm">
              {authContext.user.phone}
            </p>
          </div>
          <div className="flex w-full flex-col items-stretch gap-2 sm:w-auto sm:items-end">
            <Button
              aria-busy={logoutState === "submitting"}
              className="w-full active:scale-[0.98] sm:w-auto"
              disabled={logoutState === "submitting"}
              onClick={onLogout}
              size="sm"
              type="button"
              variant="outline"
            >
              <LogOut aria-hidden="true" />
              {logoutState === "submitting" ? "正在退出" : "退出登录"}
            </Button>
            {logoutState === "error" ? (
              <p
                aria-label="退出失败，当前会话仍保持登录，请重试。"
                className="text-destructive text-sm leading-5"
                role="alert"
              >
                退出失败，当前会话仍保持登录，请重试。
              </p>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}

function ProfileCurrentAuthorization({
  authorizationContexts,
  effectiveAuthorizations,
}: {
  authorizationContexts: EditionAwareAuthorizationContextDto[];
  effectiveAuthorizations: EffectiveAuthorizationDto[];
}) {
  const primaryAuthorizationContext = authorizationContexts[0] ?? null;
  const primaryEffectiveAuthorization = effectiveAuthorizations[0] ?? null;

  if (
    primaryAuthorizationContext === null &&
    primaryEffectiveAuthorization === null
  ) {
    return (
      <section
        className="border-border text-text-secondary rounded-xl border border-dashed p-4 text-sm"
        data-testid="student-profile-current-authorization"
      >
        暂无有效授权
      </section>
    );
  }

  const sourceLabel =
    primaryAuthorizationContext === null
      ? primaryEffectiveAuthorization?.authorizationTypes
          .map(
            (authorizationType) => authorizationTypeLabels[authorizationType],
          )
          .join("、")
      : authorizationTypeLabels[
          primaryAuthorizationContext.authorizationSource
        ];
  const scopeLabel =
    primaryAuthorizationContext === null
      ? formatScopeLabel(primaryEffectiveAuthorization)
      : formatScopeLabel(primaryAuthorizationContext);
  const editionLabel =
    primaryAuthorizationContext === null
      ? "版本待同步"
      : editionLabels[primaryAuthorizationContext.effectiveEdition];
  const quotaOwnerLabel =
    primaryAuthorizationContext === null
      ? "额度待同步"
      : formatQuotaOwnerLabel(primaryAuthorizationContext.quotaOwnerType);
  const expiresAt =
    primaryAuthorizationContext?.expiresAt ??
    primaryEffectiveAuthorization?.expiresAt ??
    null;

  return (
    <section
      className="bg-surface ring-border rounded-xl p-4 shadow-sm ring-1"
      data-testid="student-profile-current-authorization"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 gap-3">
          <div className="bg-success/10 text-success flex size-10 shrink-0 items-center justify-center rounded-full">
            <ShieldCheck className="size-5" aria-hidden="true" />
          </div>
          <div className="min-w-0 space-y-1">
            <p className="text-brand-primary text-sm font-medium">当前权益</p>
            <h2 className="font-heading text-text-primary text-xl font-semibold">
              {scopeLabel}
            </h2>
          </div>
        </div>
        <span className="bg-secondary text-secondary-foreground shrink-0 rounded-lg px-2 py-1 text-xs font-medium">
          {editionLabel}
        </span>
      </div>
      <dl className="mt-4 grid gap-2 text-sm sm:grid-cols-3">
        <div className="bg-background rounded-lg px-3 py-2">
          <dt className="text-text-muted">来源</dt>
          <dd className="text-text-primary font-medium">
            {sourceLabel ?? "授权待同步"}
          </dd>
        </div>
        <div className="bg-background rounded-lg px-3 py-2">
          <dt className="text-text-muted">到期</dt>
          <dd className="text-text-primary font-medium">
            {formatDate(expiresAt)}
          </dd>
        </div>
        <div className="bg-background rounded-lg px-3 py-2">
          <dt className="text-text-muted">额度</dt>
          <dd className="text-text-primary font-medium">{quotaOwnerLabel}</dd>
        </div>
      </dl>
    </section>
  );
}

function AuthorizationCard({
  authorization,
}: {
  authorization: AuthorizationListItemDto;
}) {
  return (
    <article
      data-public-id={authorization.publicId}
      className="bg-surface ring-border rounded-xl p-4 shadow-sm ring-1"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <h3 className="font-heading text-text-primary text-base font-semibold">
            {formatScopeLabel(authorization)}
          </h3>
          <p className="text-text-secondary text-sm">
            {authorizationTypeLabels[authorization.authorizationType]}
          </p>
        </div>
        <span className="bg-success/10 text-success rounded-lg px-2 py-1 text-xs font-medium">
          {authorization.status === "active" ? "生效中" : "不可用"}
        </span>
      </div>
      <dl className="text-text-secondary mt-4 grid grid-cols-2 gap-2 text-sm">
        <div className="bg-background rounded-lg px-3 py-2">
          <dt>开始</dt>
          <dd className="text-text-primary font-medium">
            {formatDate(authorization.startsAt)}
          </dd>
        </div>
        <div className="bg-background rounded-lg px-3 py-2">
          <dt>到期</dt>
          <dd className="text-text-primary font-medium">
            {formatDate(authorization.expiresAt)}
          </dd>
        </div>
      </dl>
    </article>
  );
}

function PersonalAuthList({
  personalAuths,
}: {
  personalAuths: PersonalAuthDto[];
}) {
  if (personalAuths.length === 0) {
    return (
      <div className="border-border text-text-secondary rounded-xl border border-dashed p-4 text-sm">
        暂无个人授权记录
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {personalAuths.map((personalAuth) => (
        <article
          key={personalAuth.publicId}
          data-public-id={personalAuth.publicId}
          className="bg-surface ring-border rounded-xl p-4 shadow-sm ring-1"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1">
              <h3 className="font-heading text-text-primary text-base font-semibold">
                {formatScopeLabel(personalAuth)}
              </h3>
              <p className="text-text-secondary text-sm">个人授权</p>
            </div>
            <span className="bg-secondary text-secondary-foreground rounded-lg px-2 py-1 text-xs font-medium">
              {formatDate(personalAuth.expiresAt)} 到期
            </span>
          </div>
        </article>
      ))}
    </div>
  );
}

function EffectiveAuthorizationList({
  effectiveAuthorizations,
}: {
  effectiveAuthorizations: EffectiveAuthorizationDto[];
}) {
  if (effectiveAuthorizations.length === 0) {
    return (
      <div className="border-border text-text-secondary rounded-xl border border-dashed p-4 text-sm">
        暂无有效授权
      </div>
    );
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {effectiveAuthorizations.map((authorization) => (
        <article
          key={`${authorization.profession}-${authorization.level}`}
          className="bg-surface ring-border rounded-xl p-4 shadow-sm ring-1"
        >
          <div className="flex items-center gap-2">
            <ShieldCheck className="text-success size-5" aria-hidden="true" />
            <h3 className="font-heading text-text-primary text-base font-semibold">
              {formatScopeLabel(authorization)}
            </h3>
          </div>
          <p className="text-text-secondary mt-2 text-sm">
            {authorization.authorizationTypes
              .map((type) => authorizationTypeLabels[type])
              .join("、")}
          </p>
          <p className="text-text-secondary mt-3 text-sm">
            有效期至 {formatDate(authorization.expiresAt)}
          </p>
        </article>
      ))}
    </div>
  );
}

function EditionAwareAuthorizationContextList({
  authorizationContexts,
}: {
  authorizationContexts: EditionAwareAuthorizationContextDto[];
}) {
  if (authorizationContexts.length === 0) {
    return null;
  }

  return (
    <section className="space-y-3">
      <h2 className="font-heading text-text-primary text-lg font-semibold">
        版本授权
      </h2>
      <div className="grid gap-3 sm:grid-cols-2">
        {authorizationContexts.map((authorizationContext) => (
          <article
            key={authorizationContext.authorizationPublicId}
            className="bg-surface ring-border rounded-xl p-4 shadow-sm ring-1"
            data-public-id={authorizationContext.authorizationPublicId}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1">
                <h3 className="font-heading text-text-primary text-base font-semibold">
                  {formatScopeLabel(authorizationContext)}
                </h3>
                <p className="text-text-secondary text-sm">
                  {
                    authorizationTypeLabels[
                      authorizationContext.authorizationSource
                    ]
                  }
                </p>
              </div>
              <span className="bg-secondary text-secondary-foreground rounded-lg px-2 py-1 text-xs font-medium">
                {editionLabels[authorizationContext.effectiveEdition]}
              </span>
            </div>
            <dl className="text-text-secondary mt-4 grid gap-2 text-sm">
              <div className="bg-background rounded-lg px-3 py-2">
                <dt>原始版本</dt>
                <dd className="text-text-primary font-medium">
                  {editionLabels[authorizationContext.edition]}
                </dd>
              </div>
              <div className="bg-background rounded-lg px-3 py-2">
                <dt>升级状态</dt>
                <dd className="text-text-primary font-medium">
                  {upgradeStatusLabels[authorizationContext.upgradeStatus]}
                </dd>
              </div>
              <div className="bg-background rounded-lg px-3 py-2">
                <dt>额度归属</dt>
                <dd className="text-text-primary font-medium">
                  额度归属：
                  {quotaOwnerTypeLabels[authorizationContext.quotaOwnerType]}
                </dd>
              </div>
            </dl>
          </article>
        ))}
      </div>
    </section>
  );
}

function ProfileNavLinks({ showRedeemLink }: { showRedeemLink: boolean }) {
  return (
    <nav
      className={showRedeemLink ? "grid grid-cols-2 gap-2" : "grid gap-2"}
      aria-label="学员个人中心导航"
    >
      <Link
        href="/home"
        className="border-border text-text-primary hover:bg-muted flex h-10 items-center justify-center rounded-lg border bg-transparent text-sm font-medium transition-transform active:scale-[0.98]"
      >
        返回首页
      </Link>
      {showRedeemLink ? (
        <Link
          href="/redeem-code"
          className="bg-primary text-primary-foreground flex h-10 items-center justify-center gap-1.5 rounded-lg text-sm font-medium transition-transform active:scale-[0.98]"
        >
          <Ticket className="size-4" aria-hidden="true" />
          兑换卡密
        </Link>
      ) : null}
    </nav>
  );
}

function RedeemCodePreparationNotice() {
  return (
    <div className="space-y-3">
      <section className="border-border bg-surface rounded-xl border border-dashed p-4">
        <div className="flex items-start gap-3">
          <div className="bg-secondary text-secondary-foreground flex size-9 shrink-0 items-center justify-center rounded-full">
            <AlertCircle className="size-4" aria-hidden="true" />
          </div>
          <div className="space-y-1">
            <p className="text-text-primary text-sm font-semibold">等待卡密</p>
            <p className="text-text-secondary text-sm leading-6">
              <span>卡密来源：系统运营</span>
              。请使用系统运营提供的未使用卡密完成兑换。
            </p>
          </div>
        </div>
      </section>
      <PurchaseGuidanceContactConfigNotice testId="student-purchase-guidance-contact-config" />
    </div>
  );
}

function AccountSupportNotice() {
  return (
    <section className="bg-surface ring-border rounded-xl p-4 shadow-sm ring-1">
      <div className="flex items-start gap-3">
        <div className="bg-secondary text-secondary-foreground flex size-9 shrink-0 items-center justify-center rounded-full">
          <AlertCircle className="size-4" aria-hidden="true" />
        </div>
        <div className="space-y-1">
          <h2 className="text-text-primary text-sm font-semibold">
            账号与密码帮助
          </h2>
          <p className="text-text-secondary text-sm leading-6">
            首期不支持学员自行修改手机号或密码。忘记密码、手机号变更或账号异常时，请联系平台运营处理。
          </p>
        </div>
      </div>
    </section>
  );
}

function AccountSupportDisclosure({
  authContext,
  showRedeemLink,
}: {
  authContext: AuthContextDto;
  showRedeemLink: boolean;
}) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <section className="space-y-3">
      <Button
        aria-expanded={isExpanded}
        className="w-full active:scale-[0.98]"
        onClick={() => setIsExpanded((currentValue) => !currentValue)}
        type="button"
        variant="outline"
      >
        账号帮助
      </Button>
      {isExpanded ? (
        <div className="space-y-3">
          <section className="bg-surface ring-border rounded-xl p-4 shadow-sm ring-1">
            <div className="text-text-secondary flex items-center gap-2 text-sm">
              <Clock3 className="size-4" aria-hidden="true" />
              会话有效期至 {formatDate(authContext.session.expiresAt)}
            </div>
          </section>
          <AccountSupportNotice />
          {showRedeemLink ? (
            <Link
              href="/redeem-code"
              className="border-border text-text-primary hover:bg-muted flex h-10 items-center justify-center gap-1.5 rounded-lg border bg-transparent text-sm font-medium transition-transform active:scale-[0.98]"
            >
              <Ticket className="size-4" aria-hidden="true" />
              个人卡密兑换
            </Link>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}

function ProfileAuthorizationDetails({
  authorizations,
  authorizationContexts,
  effectiveAuthorizations,
  personalAuths,
  showPersonalRedeemPreparation,
}: {
  authorizations: AuthorizationListItemDto[];
  authorizationContexts: EditionAwareAuthorizationContextDto[];
  effectiveAuthorizations: EffectiveAuthorizationDto[];
  personalAuths: PersonalAuthDto[];
  showPersonalRedeemPreparation: boolean;
}) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <section className="space-y-3">
      <Button
        aria-expanded={isExpanded}
        className="w-full active:scale-[0.98]"
        onClick={() => setIsExpanded((currentValue) => !currentValue)}
        type="button"
        variant="outline"
      >
        {isExpanded ? "收起授权详情" : "查看授权详情"}
      </Button>
      {isExpanded ? (
        <div className="space-y-5">
          <section className="space-y-3">
            <div className="flex items-center gap-2">
              <ShieldCheck
                className="text-brand-primary size-5"
                aria-hidden="true"
              />
              <h2 className="font-heading text-text-primary text-lg font-semibold">
                有效授权
              </h2>
            </div>
            <EffectiveAuthorizationList
              effectiveAuthorizations={effectiveAuthorizations}
            />
          </section>

          <EditionAwareAuthorizationContextList
            authorizationContexts={authorizationContexts}
          />

          {showPersonalRedeemPreparation ? (
            <RedeemCodePreparationNotice />
          ) : null}

          <section className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <h2 className="font-heading text-text-primary text-lg font-semibold">
                授权明细
              </h2>
              <span className="text-text-secondary text-sm">
                {authorizations.length} 条
              </span>
            </div>
            {authorizations.length === 0 ? (
              <div className="border-border text-text-secondary rounded-xl border border-dashed p-4 text-sm">
                暂无授权明细
              </div>
            ) : (
              <div className="space-y-3">
                {authorizations.map((authorization) => (
                  <AuthorizationCard
                    key={authorization.publicId}
                    authorization={authorization}
                  />
                ))}
              </div>
            )}
          </section>

          <section className="space-y-3">
            <h2 className="font-heading text-text-primary text-lg font-semibold">
              个人授权记录
            </h2>
            <PersonalAuthList personalAuths={personalAuths} />
          </section>
        </div>
      ) : null}
    </section>
  );
}

function PurchaseGuidanceContactConfigNotice({ testId }: { testId: string }) {
  const contactConfig = LOCAL_PURCHASE_GUIDANCE_CONTACT_CONFIG;
  const enabledChannels = contactConfig.channels.filter(
    (channel) => channel.isEnabled,
  );

  return (
    <section
      className="bg-surface ring-border rounded-xl p-4 shadow-sm ring-1"
      data-testid={testId}
    >
      <div className="flex items-start gap-3">
        <div className="bg-secondary text-secondary-foreground flex size-9 shrink-0 items-center justify-center rounded-full">
          <Ticket className="size-4" aria-hidden="true" />
        </div>
        <div className="min-w-0 space-y-3">
          <div className="space-y-1">
            <h2 className="text-text-primary text-sm font-semibold">
              {contactConfig.title}
            </h2>
            <p className="text-text-secondary text-sm leading-6">
              {contactConfig.summary}
            </p>
          </div>
          <div className="space-y-2">
            {enabledChannels.length === 0 ? (
              <p className="text-text-muted text-sm leading-6">
                购买联系方式暂未启用，请稍后再试。
              </p>
            ) : (
              enabledChannels.map((channel) => (
                <div
                  key={`${channel.channelType}-${channel.value}`}
                  className="text-text-secondary text-sm leading-6"
                >
                  <p className="text-text-primary font-medium">
                    {channel.label}
                  </p>
                  {channel.href === null ? (
                    <p>{channel.value}</p>
                  ) : (
                    <a
                      className="text-brand-primary font-medium transition-transform active:scale-[0.98]"
                      href={channel.href}
                    >
                      {channel.value}
                    </a>
                  )}
                  <p>{channel.serviceHours}</p>
                  <p>{channel.usage}</p>
                  {channel.qrImageUrl === null ? null : (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      alt={`${channel.label}二维码`}
                      className="border-border mt-2 size-28 rounded-lg border object-cover"
                      src={channel.qrImageUrl}
                    />
                  )}
                </div>
              ))
            )}
          </div>
          <p className="text-text-muted text-xs leading-5">
            {contactConfig.safetyNotice}
          </p>
        </div>
      </div>
    </section>
  );
}

export function StudentProfilePage() {
  const [loadState, setLoadState] = useState<LoadState>("loading");
  const [logoutState, setLogoutState] = useState<LogoutState>("idle");
  const [authContext, setAuthContext] = useState<AuthContextDto | null>(null);
  const [authorizations, setAuthorizations] = useState<
    AuthorizationListItemDto[]
  >([]);
  const [effectiveAuthorizations, setEffectiveAuthorizations] = useState<
    EffectiveAuthorizationDto[]
  >([]);
  const [authorizationContexts, setAuthorizationContexts] = useState<
    EditionAwareAuthorizationContextDto[]
  >([]);
  const [personalAuths, setPersonalAuths] = useState<PersonalAuthDto[]>([]);

  useEffect(() => {
    let isActive = true;

    async function loadProfile() {
      try {
        const [sessionResponse, authorizationResponse, personalAuthResponse] =
          await Promise.all([
            fetchApi<AuthContextDto>("/api/v1/sessions"),
            fetchApi<EffectiveAuthorizationListDto>("/api/v1/authorizations"),
            fetchApi<PersonalAuthListDto>("/api/v1/personal-auths"),
          ]);

        if (!isActive) {
          return;
        }

        if (
          isStudentUnauthorizedResponse(sessionResponse) ||
          isStudentUnauthorizedResponse(authorizationResponse) ||
          isStudentUnauthorizedResponse(personalAuthResponse)
        ) {
          setLoadState("unauthorized");
          return;
        }

        if (
          sessionResponse.code !== 0 ||
          sessionResponse.data === null ||
          authorizationResponse.code !== 0 ||
          authorizationResponse.data === null ||
          personalAuthResponse.code !== 0 ||
          personalAuthResponse.data === null
        ) {
          setLoadState("error");
          return;
        }

        setAuthContext(sessionResponse.data);
        setAuthorizations(authorizationResponse.data.authorizations);
        setEffectiveAuthorizations(
          authorizationResponse.data.effectiveAuthorizations,
        );
        setAuthorizationContexts(
          readEditionAwareAuthorizationContexts(authorizationResponse.data),
        );
        setPersonalAuths(personalAuthResponse.data.personalAuths);
        setLoadState("ready");
      } catch {
        if (isActive) {
          setLoadState("error");
        }
      }
    }

    void loadProfile();

    return () => {
      isActive = false;
    };
  }, []);

  async function handleLogout() {
    setLogoutState("submitting");

    if (!(await revokeServerSession())) {
      setLogoutState("error");
      return;
    }

    clearStoredStudentSessionToken();
    setAuthContext(null);
    setAuthorizations([]);
    setEffectiveAuthorizations([]);
    setAuthorizationContexts([]);
    setPersonalAuths([]);
    setLogoutState("idle");
    setLoadState("unauthorized");
  }

  if (loadState === "loading") {
    return <StudentProfileLoading label="正在加载个人中心" />;
  }

  if (loadState === "unauthorized") {
    return (
      <StudentSurfaceStatus
        title="请先登录"
        description="个人中心需要有效的学员会话，请登录后再查看授权与兑换记录。"
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

  if (loadState === "error" || authContext === null) {
    return (
      <StudentSurfaceStatus
        title="个人中心加载失败"
        description="请稍后刷新页面，或重新登录后再查看授权信息。"
      />
    );
  }

  const showPrimaryRedeemLink = !isEmployeeUser(authContext);
  const showPersonalRedeemPreparation =
    showPrimaryRedeemLink && personalAuths.length === 0;

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-5 px-4 py-5 pb-20">
      <ProfileHeader
        authContext={authContext}
        logoutState={logoutState}
        onLogout={handleLogout}
      />
      <ProfileCurrentAuthorization
        authorizationContexts={authorizationContexts}
        effectiveAuthorizations={effectiveAuthorizations}
      />
      <ProfileNavLinks showRedeemLink={showPrimaryRedeemLink} />
      <ProfileAuthorizationDetails
        authorizations={authorizations}
        authorizationContexts={authorizationContexts}
        effectiveAuthorizations={effectiveAuthorizations}
        personalAuths={personalAuths}
        showPersonalRedeemPreparation={showPersonalRedeemPreparation}
      />
      <AccountSupportDisclosure
        authContext={authContext}
        showRedeemLink={!showPrimaryRedeemLink}
      />
    </main>
  );
}

export function StudentRedeemCodePage() {
  const [loadState, setLoadState] = useState<LoadState>("loading");
  const [personalAuths, setPersonalAuths] = useState<PersonalAuthDto[]>([]);
  const [isEmployee, setIsEmployee] = useState(false);
  const [redeemCode, setRedeemCode] = useState("");
  const [readyPreview, setReadyPreview] =
    useState<RedeemCodeReadyPreview | null>(null);
  const [targetPersonalAuthPublicId, setTargetPersonalAuthPublicId] = useState<
    string | null
  >(null);
  const [submitState, setSubmitState] = useState<RedeemSubmitState>("idle");
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const previewRequestSequence = useRef(0);
  const previewAbortController = useRef<AbortController | null>(null);

  const normalizedRedeemCode = useMemo(
    () => normalizeRedeemCodeInput(redeemCode),
    [redeemCode],
  );
  const isConfirmationReady =
    readyPreview !== null &&
    readyPreview.inputSnapshot === normalizedRedeemCode;
  const isBusy = submitState === "previewing" || submitState === "redeeming";
  const hasEligibleUpgradeTarget =
    readyPreview?.data.redeemCodeType !== "edition_upgrade" ||
    readyPreview.data.upgradeTargets.some(
      (target) => target.personalAuthPublicId === targetPersonalAuthPublicId,
    );
  const canSubmit =
    REDEEM_CODE_PATTERN.test(normalizedRedeemCode) &&
    !isBusy &&
    loadState === "ready" &&
    (!isConfirmationReady || hasEligibleUpgradeTarget);

  useEffect(() => {
    let isActive = true;

    async function loadPersonalAuths() {
      try {
        const [sessionResponse, personalAuthResponse] = await Promise.all([
          fetchApi<AuthContextDto>("/api/v1/sessions"),
          fetchApi<PersonalAuthListDto>("/api/v1/personal-auths"),
        ]);

        if (!isActive) {
          return;
        }

        if (
          isStudentUnauthorizedResponse(sessionResponse) ||
          isStudentUnauthorizedResponse(personalAuthResponse)
        ) {
          setLoadState("unauthorized");
          return;
        }

        if (
          sessionResponse.code !== 0 ||
          sessionResponse.data === null ||
          personalAuthResponse.code !== 0 ||
          personalAuthResponse.data === null
        ) {
          setLoadState("error");
          return;
        }

        setPersonalAuths(personalAuthResponse.data.personalAuths);
        setIsEmployee(isEmployeeUser(sessionResponse.data));
        setLoadState("ready");
      } catch {
        if (isActive) {
          setLoadState("error");
        }
      }
    }

    void loadPersonalAuths();

    return () => {
      isActive = false;
      previewAbortController.current?.abort();
    };
  }, []);

  async function handleSubmitRedeemCode(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!canSubmit) {
      setSubmitState("error");
      setFeedbackMessage("兑换码格式不正确");
      return;
    }

    if (!isConfirmationReady) {
      await handlePreviewRedeemCode(normalizedRedeemCode);
      return;
    }

    setSubmitState("redeeming");
    setFeedbackMessage(null);

    try {
      const response = await fetch("/api/v1/redeem-codes/redeem", {
        method: "POST",
        credentials: "same-origin",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          code: readyPreview.inputSnapshot,
          previewVersion: readyPreview.data.previewVersion,
          targetPersonalAuthPublicId:
            readyPreview.data.redeemCodeType === "edition_upgrade"
              ? targetPersonalAuthPublicId
              : null,
        }),
      });
      const payload =
        (await response.json()) as ApiResponse<RedeemCodeRedemptionDto | null>;

      if (!response.ok || payload.code !== 0 || payload.data === null) {
        if (shouldInvalidateRedeemPreview(payload.code)) {
          setReadyPreview(null);
          setTargetPersonalAuthPublicId(null);
        }
        setSubmitState("error");
        setFeedbackMessage(mapRedeemFailureMessage(payload, response.status));
        return;
      }

      const redeemedPersonalAuth = payload.data.personalAuth;

      setPersonalAuths((currentPersonalAuths) => [
        redeemedPersonalAuth,
        ...currentPersonalAuths.filter(
          (personalAuth) =>
            personalAuth.publicId !== redeemedPersonalAuth.publicId,
        ),
      ]);
      setRedeemCode("");
      setReadyPreview(null);
      setTargetPersonalAuthPublicId(null);
      setSubmitState("success");
      setFeedbackMessage("兑换成功");
    } catch {
      setSubmitState("error");
      setFeedbackMessage("兑换服务暂不可用，请稍后重试");
    }
  }

  async function handlePreviewRedeemCode(inputSnapshot: string) {
    previewAbortController.current?.abort();
    const requestSequence = previewRequestSequence.current + 1;
    const abortController = new AbortController();
    previewRequestSequence.current = requestSequence;
    previewAbortController.current = abortController;
    setReadyPreview(null);
    setTargetPersonalAuthPublicId(null);
    setSubmitState("previewing");
    setFeedbackMessage(null);

    try {
      const response = await fetch("/api/v1/redeem-codes/preview", {
        method: "POST",
        credentials: "same-origin",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({ code: inputSnapshot }),
        signal: abortController.signal,
      });
      const payload =
        (await response.json()) as ApiResponse<RedeemCodePreviewDto | null>;

      if (
        abortController.signal.aborted ||
        previewRequestSequence.current !== requestSequence
      ) {
        return;
      }

      if (!response.ok || payload.code !== 0 || payload.data === null) {
        setSubmitState("error");
        setFeedbackMessage(mapRedeemFailureMessage(payload, response.status));
        return;
      }

      setReadyPreview({ inputSnapshot, data: payload.data });
      setSubmitState("ready");
    } catch (error) {
      if (
        abortController.signal.aborted ||
        previewRequestSequence.current !== requestSequence
      ) {
        return;
      }

      setSubmitState("error");
      setFeedbackMessage(
        error instanceof Error && error.name === "AbortError"
          ? null
          : "兑换服务暂不可用，请稍后重试",
      );
    }
  }

  function handleRedeemCodeChange(value: string) {
    previewAbortController.current?.abort();
    previewRequestSequence.current += 1;
    setRedeemCode(normalizeRedeemCodeInput(value));
    setReadyPreview(null);
    setTargetPersonalAuthPublicId(null);
    setSubmitState("idle");
    setFeedbackMessage(null);
  }

  if (loadState === "loading") {
    return <StudentProfileLoading label="正在加载兑换记录" />;
  }

  if (loadState === "unauthorized") {
    return (
      <StudentSurfaceStatus
        title="请先登录"
        description="兑换卡密需要有效的学员会话，请登录后再尝试兑换。"
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

  if (loadState === "error") {
    return (
      <StudentSurfaceStatus
        title="兑换页加载失败"
        description="请稍后刷新页面，或重新登录后再尝试兑换。"
      />
    );
  }

  const isPreviewing = submitState === "previewing";
  const isRedeeming = submitState === "redeeming";

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-5 px-4 py-5 pb-20">
      <section className="bg-surface ring-border flex flex-col gap-4 rounded-xl p-4 shadow-sm ring-1">
        <div className="flex items-start gap-3">
          <div className="bg-secondary text-secondary-foreground flex size-11 shrink-0 items-center justify-center rounded-full">
            <Ticket className="size-5" aria-hidden="true" />
          </div>
          <div className="space-y-1">
            <p className="text-brand-primary text-sm font-medium">卡密兑换</p>
            <h1 className="font-heading text-text-primary text-2xl font-semibold">
              兑换码
            </h1>
            <p className="text-text-secondary text-sm leading-6">
              输入 8 位卡密后开通对应专业与等级的个人授权。
            </p>
          </div>
        </div>

        <form className="flex flex-col gap-3" onSubmit={handleSubmitRedeemCode}>
          {isEmployee ? (
            <p className="border-border bg-background text-text-secondary rounded-lg border px-3 py-2 text-sm leading-6">
              兑换成功后会新增或升级你的个人授权，不会改变企业授权、企业版本或企业额度。
            </p>
          ) : null}
          <label className="flex flex-col gap-1.5 text-sm font-medium">
            <span className="text-text-primary">兑换码</span>
            <Input
              aria-invalid={submitState === "error"}
              autoComplete="off"
              disabled={isRedeeming}
              inputMode="text"
              maxLength={10}
              placeholder="例如 ABCD2345"
              value={redeemCode}
              onChange={(event) => handleRedeemCodeChange(event.target.value)}
            />
          </label>

          {isConfirmationReady && readyPreview !== null ? (
            <section
              className="border-border bg-background space-y-3 rounded-lg border p-3 text-sm"
              data-testid="redeem-code-confirmation"
            >
              <div className="space-y-1">
                <p className="text-brand-primary text-sm font-medium">
                  卡种：{redeemCodeTypeLabels[readyPreview.data.redeemCodeType]}
                </p>
                <h2 className="text-text-primary font-medium">
                  {editionLabels[readyPreview.data.resultEdition]}个人授权
                </h2>
                <p className="text-text-secondary leading-6">
                  {formatPreviewScopeLabel(readyPreview.data)}
                  <span aria-hidden="true"> · </span>
                  {readyPreview.data.redeemCodeType === "edition_upgrade"
                    ? "升级后沿用所选授权有效期"
                    : `${readyPreview.data.durationDay} 天`}
                </p>
                <p className="text-text-secondary leading-6">
                  兑换截止：
                  {formatRedeemDeadline(readyPreview.data.redeemDeadlineAt)}
                </p>
              </div>

              {readyPreview.data.redeemCodeType === "edition_upgrade" ? (
                <fieldset className="space-y-2" disabled={isRedeeming}>
                  <legend className="text-text-primary font-medium">
                    选择要升级的标准版授权
                  </legend>
                  {readyPreview.data.upgradeTargets.map((target) => (
                    <label
                      className="border-border flex cursor-pointer items-start gap-2 rounded-lg border p-3"
                      key={target.personalAuthPublicId}
                    >
                      <input
                        checked={
                          targetPersonalAuthPublicId ===
                          target.personalAuthPublicId
                        }
                        className="mt-1"
                        name="target-personal-auth"
                        onChange={() =>
                          setTargetPersonalAuthPublicId(
                            target.personalAuthPublicId,
                          )
                        }
                        type="radio"
                        value={target.personalAuthPublicId}
                      />
                      <span className="text-text-secondary leading-6">
                        {formatPreviewScopeLabel(readyPreview.data)}，有效期至
                        {formatChineseDate(target.expiresAt)}
                      </span>
                    </label>
                  ))}
                </fieldset>
              ) : null}
            </section>
          ) : null}

          <div
            aria-live="polite"
            className={`min-h-5 text-sm ${
              submitState === "success" ? "text-success" : "text-error"
            }`}
            role={feedbackMessage === null ? undefined : "alert"}
          >
            {feedbackMessage}
          </div>

          <Button
            className="h-10 w-full active:scale-[0.98]"
            disabled={!canSubmit}
            size="lg"
            type="submit"
          >
            <KeyRound aria-hidden="true" />
            {isPreviewing
              ? "预览中"
              : isRedeeming
                ? "兑换中"
                : isConfirmationReady
                  ? "确认兑换"
                  : "预览权益"}
          </Button>
        </form>
      </section>

      {personalAuths.length === 0 ? <RedeemCodePreparationNotice /> : null}

      <section className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <CheckCircle2
              className="text-brand-primary size-5"
              aria-hidden="true"
            />
            <h2 className="font-heading text-text-primary text-lg font-semibold">
              个人授权
            </h2>
          </div>
          <Link
            href="/profile"
            className="text-brand-primary text-sm font-medium transition-transform active:scale-[0.98]"
          >
            个人中心
          </Link>
        </div>
        <PersonalAuthList personalAuths={personalAuths} />
      </section>

      <AccountSupportNotice />
    </main>
  );
}
