"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { AlertCircle, LoaderCircle } from "lucide-react";

import type { ApiResponse } from "@/server/contracts/api-response";
import type { AuthContextDto } from "@/server/contracts/auth-contract";
import {
  createPostLoginSessionBoundary,
  resolveSessionRouteAccess,
} from "@/server/contracts/user-auth/session-boundary";

type ProtectedRouteGuardStatus =
  | "checking"
  | "authorized"
  | "unauthorized"
  | "forbidden"
  | "error";
type ProtectedRouteGuardRole = "admin" | "student";

type ProtectedRouteGuardProps = {
  children: ReactNode;
  requiredRole: ProtectedRouteGuardRole;
};

async function fetchAuthContext(): Promise<ApiResponse<AuthContextDto | null>> {
  const response = await fetch("/api/v1/sessions", {
    credentials: "same-origin",
  });

  return (await response.json()) as ApiResponse<AuthContextDto | null>;
}

function ProtectedRouteStatus({
  authContext,
  onRetry,
  requiredRole,
  status,
}: {
  authContext: AuthContextDto | null;
  onRetry: () => void;
  requiredRole: ProtectedRouteGuardRole;
  status: Exclude<ProtectedRouteGuardStatus, "authorized">;
}) {
  const isChecking = status === "checking";
  const forbiddenReturnPath =
    status === "forbidden" && authContext !== null
      ? createPostLoginSessionBoundary(authContext.user).redirectPath
      : null;
  const forbiddenReturnLabel =
    forbiddenReturnPath === "/home"
      ? "返回学员首页"
      : forbiddenReturnPath === "/content/overview"
        ? "返回内容后台"
        : forbiddenReturnPath === "/organization/portal"
          ? "返回组织后台"
          : forbiddenReturnPath === "/admin/overview"
            ? "返回平台总览"
            : "返回运营后台";
  const title = isChecking
    ? "正在校验登录状态"
    : status === "unauthorized"
      ? "请先登录"
      : status === "forbidden"
        ? requiredRole === "student"
          ? "无权访问学员页面"
          : "无权访问后台页面"
        : "会话状态暂不可用";
  const description = isChecking
    ? "系统正在确认当前会话权限。"
    : status === "unauthorized"
      ? "当前页面需要有效会话，正在前往登录页。"
      : status === "forbidden"
        ? "当前会话已登录，但账号角色不属于此工作区。请返回已授权入口。"
        : "暂时无法确认当前会话，请重试。系统不会把运行时错误误报为退出登录。";

  return (
    <main className="bg-background flex min-h-screen items-center justify-center px-6">
      <section
        aria-live="polite"
        className="mx-auto flex max-w-sm flex-col items-center gap-3 text-center"
        role={isChecking ? "status" : "alert"}
      >
        <div className="bg-secondary text-secondary-foreground flex size-11 items-center justify-center rounded-full">
          {isChecking ? (
            <LoaderCircle aria-hidden="true" className="size-5 animate-spin" />
          ) : (
            <AlertCircle aria-hidden="true" className="size-5" />
          )}
        </div>
        <h1 className="font-heading text-text-primary text-lg font-semibold">
          {title}
        </h1>
        <p className="text-text-secondary text-sm leading-6">{description}</p>
        {status === "forbidden" && forbiddenReturnPath !== null ? (
          <Link
            className="bg-primary text-primary-foreground inline-flex h-9 items-center justify-center rounded-lg px-4 text-sm font-medium transition-transform active:scale-[0.98]"
            href={forbiddenReturnPath}
          >
            {forbiddenReturnLabel}
          </Link>
        ) : null}
        {status === "error" ? (
          <button
            className="bg-primary text-primary-foreground inline-flex h-9 items-center justify-center rounded-lg px-4 text-sm font-medium transition-transform active:scale-[0.98]"
            onClick={onRetry}
            type="button"
          >
            重试
          </button>
        ) : null}
      </section>
    </main>
  );
}

export function ProtectedRouteGuard({
  children,
  requiredRole,
}: ProtectedRouteGuardProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [retrySerial, setRetrySerial] = useState(0);
  const [accessState, setAccessState] = useState<{
    authContext: AuthContextDto | null;
    status: ProtectedRouteGuardStatus;
  }>({ authContext: null, status: "checking" });

  useEffect(() => {
    let isCurrentCheck = true;

    fetchAuthContext()
      .then((sessionResponse) => {
        if (!isCurrentCheck) {
          return;
        }

        const accessDecision = resolveSessionRouteAccess(
          sessionResponse,
          requiredRole,
        );

        setAccessState(accessDecision);
        if (accessDecision.status === "unauthorized") {
          router.replace("/login");
        }
      })
      .catch(() => {
        if (!isCurrentCheck) {
          return;
        }

        setAccessState({ authContext: null, status: "error" });
      });

    return () => {
      isCurrentCheck = false;
    };
  }, [pathname, requiredRole, retrySerial, router]);

  function handleRetry() {
    setAccessState({ authContext: null, status: "checking" });
    setRetrySerial((currentSerial) => currentSerial + 1);
  }

  if (accessState.status !== "authorized") {
    return (
      <ProtectedRouteStatus
        authContext={accessState.authContext}
        onRetry={handleRetry}
        requiredRole={requiredRole}
        status={accessState.status}
      />
    );
  }

  return children;
}
