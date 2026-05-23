"use client";

import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { AlertCircle, LoaderCircle } from "lucide-react";

import type { ApiResponse } from "@/server/contracts/api-response";
import type { AuthContextDto } from "@/server/contracts/auth-contract";

type ProtectedRouteGuardStatus = "checking" | "authorized" | "unauthorized";
type ProtectedRouteGuardRole = "admin" | "student";

type ProtectedRouteGuardProps = {
  children: ReactNode;
  requiredRole: ProtectedRouteGuardRole;
};

const localSessionTokenKey = "tiku.localSessionToken";

function getInitialGuardStatus(): ProtectedRouteGuardStatus {
  if (typeof window === "undefined") {
    return "checking";
  }

  return readLocalSessionToken() === null ? "unauthorized" : "checking";
}

function readLocalSessionToken(): string | null {
  const sessionToken = localStorage.getItem(localSessionTokenKey)?.trim();

  return sessionToken === "" ? null : (sessionToken ?? null);
}

function isAuthorizedForRole(
  authContext: AuthContextDto,
  requiredRole: ProtectedRouteGuardRole,
): boolean {
  if (requiredRole === "admin") {
    return (
      authContext.user.adminPublicId !== null &&
      (authContext.user.adminRoles?.length ?? 0) > 0
    );
  }

  return authContext.user.userType !== null;
}

async function fetchAuthContext(
  sessionToken: string,
): Promise<ApiResponse<AuthContextDto | null>> {
  const response = await fetch("/api/v1/sessions", {
    headers: {
      authorization: `Bearer ${sessionToken}`,
    },
  });

  return (await response.json()) as ApiResponse<AuthContextDto | null>;
}

function ProtectedRouteStatus({
  status,
}: {
  status: Exclude<ProtectedRouteGuardStatus, "authorized">;
}) {
  const isChecking = status === "checking";

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
          {isChecking ? "正在校验登录状态" : "请先登录"}
        </h1>
        <p className="text-text-secondary text-sm leading-6">
          {isChecking
            ? "系统正在确认当前会话权限。"
            : "当前页面需要有效会话，正在前往登录页。"}
        </p>
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
  const [status, setStatus] = useState<ProtectedRouteGuardStatus>(
    getInitialGuardStatus,
  );

  useEffect(() => {
    let isCurrentCheck = true;
    const sessionToken = readLocalSessionToken();

    if (sessionToken === null) {
      router.replace("/login");
      return () => {
        isCurrentCheck = false;
      };
    }

    fetchAuthContext(sessionToken)
      .then((sessionResponse) => {
        if (!isCurrentCheck) {
          return;
        }

        if (
          sessionResponse.code === 0 &&
          sessionResponse.data !== null &&
          isAuthorizedForRole(sessionResponse.data, requiredRole)
        ) {
          setStatus("authorized");
          return;
        }

        setStatus("unauthorized");
        router.replace("/login");
      })
      .catch(() => {
        if (!isCurrentCheck) {
          return;
        }

        setStatus("unauthorized");
        router.replace("/login");
      });

    return () => {
      isCurrentCheck = false;
    };
  }, [pathname, requiredRole, router]);

  if (status !== "authorized") {
    return <ProtectedRouteStatus status={status} />;
  }

  return children;
}
