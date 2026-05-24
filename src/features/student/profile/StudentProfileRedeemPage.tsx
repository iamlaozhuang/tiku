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
import { type FormEvent, useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { ApiResponse } from "@/server/contracts/api-response";
import type {
  PersonalAuthDto,
  PersonalAuthListDto,
  RedeemCodeRedemptionDto,
} from "@/server/contracts/authorization-contract";
import type { AuthContextDto } from "@/server/contracts/auth-contract";
import type {
  AuthorizationListItemDto,
  EffectiveAuthorizationDto,
  EffectiveAuthorizationListDto,
} from "@/server/contracts/effective-authorization-contract";
import type { Profession } from "@/server/models/auth";
import {
  clearStoredStudentSessionToken,
  createStudentAuthHeaders,
  getStoredStudentSessionToken,
  isStudentUnauthorizedResponse,
} from "../studentRuntimeApi";

type LoadState = "loading" | "ready" | "unauthorized" | "error";
type RedeemSubmitState = "idle" | "submitting" | "success" | "error";

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

function normalizeRedeemCodeInput(value: string): string {
  return value
    .toUpperCase()
    .replace(/[^A-Z0-9]/gu, "")
    .slice(0, 8);
}

async function fetchApi<TData>(
  path: string,
  token: string,
  init?: RequestInit,
): Promise<ApiResponse<TData | null>> {
  const response = await fetch(path, {
    ...init,
    headers: {
      ...createStudentAuthHeaders(token),
      ...(init?.headers ?? {}),
    },
  });

  return (await response.json()) as ApiResponse<TData | null>;
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

  if (payload.code === 409002 || statusHint === 409) {
    return "该兑换码已被使用";
  }

  if (payload.code === 410001 || statusHint === 410) {
    return "兑换码已过期";
  }

  if (payload.code === 503003 || statusHint === 503) {
    return "兑换服务暂不可用，请稍后重试";
  }

  return "兑换失败，请稍后重试";
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
  onLogout,
}: {
  authContext: AuthContextDto;
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
          <Button
            className="w-full active:scale-[0.98] sm:w-auto"
            onClick={onLogout}
            size="sm"
            type="button"
            variant="outline"
          >
            <LogOut aria-hidden="true" />
            退出登录
          </Button>
        </div>
      </div>
      <div className="text-text-secondary flex items-center gap-2 text-sm">
        <Clock3 className="size-4" aria-hidden="true" />
        会话有效期至 {formatDate(authContext.session.expiresAt)}
      </div>
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

function ProfileNavLinks() {
  return (
    <nav className="grid grid-cols-2 gap-2" aria-label="学员个人中心导航">
      <Link
        href="/home"
        className="border-border text-text-primary hover:bg-muted flex h-10 items-center justify-center rounded-lg border bg-transparent text-sm font-medium transition-transform active:scale-[0.98]"
      >
        返回首页
      </Link>
      <Link
        href="/redeem-code"
        className="bg-primary text-primary-foreground flex h-10 items-center justify-center gap-1.5 rounded-lg text-sm font-medium transition-transform active:scale-[0.98]"
      >
        <Ticket className="size-4" aria-hidden="true" />
        兑换卡密
      </Link>
    </nav>
  );
}

function RedeemCodePreparationNotice() {
  return (
    <section className="border-border bg-surface rounded-xl border border-dashed p-4">
      <div className="flex items-start gap-3">
        <div className="bg-secondary text-secondary-foreground flex size-9 shrink-0 items-center justify-center rounded-full">
          <AlertCircle className="size-4" aria-hidden="true" />
        </div>
        <div className="space-y-1">
          <p className="text-text-primary text-sm font-semibold">等待卡密</p>
          <p className="text-text-secondary text-sm leading-6">
            <span>卡密来源未配置</span>
            。请使用系统运营提供的未使用卡密完成兑换。
          </p>
        </div>
      </div>
    </section>
  );
}

export function StudentProfilePage() {
  const [loadState, setLoadState] = useState<LoadState>("loading");
  const [authContext, setAuthContext] = useState<AuthContextDto | null>(null);
  const [authorizations, setAuthorizations] = useState<
    AuthorizationListItemDto[]
  >([]);
  const [effectiveAuthorizations, setEffectiveAuthorizations] = useState<
    EffectiveAuthorizationDto[]
  >([]);
  const [personalAuths, setPersonalAuths] = useState<PersonalAuthDto[]>([]);

  useEffect(() => {
    let isActive = true;

    async function loadProfile() {
      const token = getStoredStudentSessionToken();

      if (token === null) {
        if (isActive) {
          setLoadState("unauthorized");
        }
        return;
      }

      try {
        const [sessionResponse, authorizationResponse, personalAuthResponse] =
          await Promise.all([
            fetchApi<AuthContextDto>("/api/v1/sessions", token),
            fetchApi<EffectiveAuthorizationListDto>(
              "/api/v1/authorizations",
              token,
            ),
            fetchApi<PersonalAuthListDto>("/api/v1/personal-auths", token),
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

  function handleLogout() {
    clearStoredStudentSessionToken();
    setAuthContext(null);
    setAuthorizations([]);
    setEffectiveAuthorizations([]);
    setPersonalAuths([]);
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

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-5 px-4 py-5 pb-20">
      <ProfileHeader authContext={authContext} onLogout={handleLogout} />
      <ProfileNavLinks />

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

      {personalAuths.length === 0 ? <RedeemCodePreparationNotice /> : null}

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
    </main>
  );
}

export function StudentRedeemCodePage() {
  const [loadState, setLoadState] = useState<LoadState>("loading");
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const [personalAuths, setPersonalAuths] = useState<PersonalAuthDto[]>([]);
  const [redeemCode, setRedeemCode] = useState("");
  const [submitState, setSubmitState] = useState<RedeemSubmitState>("idle");
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  const normalizedRedeemCode = useMemo(
    () => normalizeRedeemCodeInput(redeemCode),
    [redeemCode],
  );
  const canSubmit =
    REDEEM_CODE_PATTERN.test(normalizedRedeemCode) &&
    submitState !== "submitting" &&
    loadState === "ready";

  useEffect(() => {
    let isActive = true;

    async function loadPersonalAuths() {
      const token = getStoredStudentSessionToken();

      if (token === null) {
        if (isActive) {
          setLoadState("unauthorized");
        }
        return;
      }

      try {
        const [sessionResponse, personalAuthResponse] = await Promise.all([
          fetchApi<AuthContextDto>("/api/v1/sessions", token),
          fetchApi<PersonalAuthListDto>("/api/v1/personal-auths", token),
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

        setSessionToken(token);
        setPersonalAuths(personalAuthResponse.data.personalAuths);
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
    };
  }, []);

  async function handleSubmitRedeemCode(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!canSubmit || sessionToken === null) {
      setSubmitState("error");
      setFeedbackMessage("兑换码格式不正确");
      return;
    }

    setSubmitState("submitting");
    setFeedbackMessage(null);

    try {
      const response = await fetch("/api/v1/redeem-codes/redeem", {
        method: "POST",
        headers: {
          ...createStudentAuthHeaders(sessionToken),
          "content-type": "application/json",
        },
        body: JSON.stringify({ code: normalizedRedeemCode }),
      });
      const payload =
        (await response.json()) as ApiResponse<RedeemCodeRedemptionDto | null>;

      if (!response.ok || payload.code !== 0 || payload.data === null) {
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
      setSubmitState("success");
      setFeedbackMessage("兑换成功");
    } catch {
      setSubmitState("error");
      setFeedbackMessage("兑换服务暂不可用，请稍后重试");
    }
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

  const isSubmitting = submitState === "submitting";

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
          <label className="flex flex-col gap-1.5 text-sm font-medium">
            <span className="text-text-primary">兑换码</span>
            <Input
              aria-invalid={submitState === "error"}
              autoComplete="off"
              inputMode="text"
              maxLength={10}
              placeholder="例如 ABCD2345"
              value={redeemCode}
              onChange={(event) =>
                setRedeemCode(normalizeRedeemCodeInput(event.target.value))
              }
            />
          </label>

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
            {isSubmitting ? "兑换中" : "兑换"}
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
    </main>
  );
}
