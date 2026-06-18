"use client";

import { type FormEvent, useState } from "react";
import Link from "next/link";
import { LogIn } from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  createPostLoginSessionBoundary,
  type PostLoginSessionUser,
} from "@/server/contracts/user-auth/session-boundary";
import {
  persistCookieBackedSessionMarker,
  persistLocalAutomationStudentSessionToken,
} from "@/features/student/studentRuntimeApi";

type SessionLoginPayload = {
  code: number;
  message: string;
  data: {
    token: string;
    user: PostLoginSessionUser;
  } | null;
};

type LoginState = "idle" | "submitting" | "error";

const PHONE_PATTERN = /^1[3-9]\d{9}$/;
const CREDENTIAL_FIELD_NAME = "password";
const MIN_PASSWORD_LENGTH = 8;

function getLoginErrorMessage(payload: SessionLoginPayload, status: number) {
  if (payload.code === 401002 || status === 401) {
    return "手机号或密码不正确";
  }

  if (payload.code === 423001 || status === 423) {
    return "账号已锁定，请稍后再试";
  }

  if (payload.code === 403002 || status === 403) {
    return "账号已被停用，请联系管理员";
  }

  if (payload.code === 503001 || status === 503) {
    return "登录服务暂不可用，请稍后重试";
  }

  return "登录失败，请稍后重试";
}

export default function LoginPage() {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loginState, setLoginState] = useState<LoginState>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const canSubmit =
    PHONE_PATTERN.test(phone.trim()) &&
    password.trim().length >= MIN_PASSWORD_LENGTH &&
    loginState !== "submitting";

  async function handleSubmitLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!canSubmit) {
      setLoginState("error");
      setErrorMessage("请输入有效手机号和至少 8 位密码");
      return;
    }

    setLoginState("submitting");
    setErrorMessage(null);

    try {
      const response = await fetch("/api/v1/sessions", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          phone: phone.trim(),
          [CREDENTIAL_FIELD_NAME]: password.trim(),
        }),
      });
      const payload = (await response.json()) as SessionLoginPayload;

      if (!response.ok || payload.code !== 0 || payload.data === null) {
        setLoginState("error");
        setErrorMessage(getLoginErrorMessage(payload, response.status));
        return;
      }

      const sessionBoundary = createPostLoginSessionBoundary(payload.data.user);
      if (payload.data.user.userType === "personal") {
        persistLocalAutomationStudentSessionToken(payload.data.token);
      } else {
        persistCookieBackedSessionMarker();
      }
      router.replace(sessionBoundary.redirectPath);
    } catch {
      setLoginState("error");
      setErrorMessage("登录服务暂不可用，请稍后重试");
    }
  }

  const isSubmitting = loginState === "submitting";

  return (
    <main className="bg-background flex min-h-screen w-full items-center justify-center px-4 py-8">
      <section className="border-border bg-surface rounded-radius-md flex w-full max-w-sm flex-col gap-6 border p-5 shadow-sm">
        <div className="flex flex-col gap-2">
          <p className="text-text-secondary text-sm">题库系统</p>
          <h1 className="font-heading text-text-primary text-2xl font-semibold">
            登录
          </h1>
        </div>

        <form className="flex flex-col gap-4" onSubmit={handleSubmitLogin}>
          <label className="flex flex-col gap-1.5 text-sm font-medium">
            <span className="text-text-primary">手机号</span>
            <Input
              aria-invalid={errorMessage !== null}
              autoComplete="username"
              inputMode="numeric"
              name="phone"
              placeholder="请输入手机号"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
            />
          </label>

          <label className="flex flex-col gap-1.5 text-sm font-medium">
            <span className="text-text-primary">密码</span>
            <Input
              aria-invalid={errorMessage !== null}
              autoComplete="current-password"
              name="password"
              placeholder="请输入密码"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </label>

          <div
            aria-live="polite"
            className="text-error min-h-5 text-sm"
            role={errorMessage === null ? undefined : "alert"}
          >
            {errorMessage}
          </div>

          <Button
            className="h-10 w-full active:scale-[0.98]"
            disabled={!canSubmit}
            size="lg"
            type="submit"
          >
            <LogIn aria-hidden="true" />
            {isSubmitting ? "登录中" : "登录"}
          </Button>
        </form>

        <Link
          className="text-primary text-center text-sm underline-offset-4 transition-colors hover:underline"
          href="/register"
        >
          没有账号，去注册
        </Link>
      </section>
    </main>
  );
}
