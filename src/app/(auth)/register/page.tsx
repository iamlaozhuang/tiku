"use client";

import { type FormEvent, useState } from "react";
import Link from "next/link";
import { UserPlus } from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type UserRegistrationPayload = {
  code: number;
  message: string;
  data: {
    nextAction: "redeem_code";
  } | null;
};

type RegisterState = "idle" | "submitting" | "error";

const PHONE_PATTERN = /^1[3-9]\d{9}$/;
const PASSWORD_PATTERN = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/;

function getRegistrationErrorMessage(
  payload: UserRegistrationPayload,
  status: number,
) {
  if (payload.code === 409001 || status === 409) {
    return "该手机号已注册";
  }

  if (payload.code === 400002 || status === 400) {
    return "请输入有效手机号、姓名和至少 8 位字母数字组合密码";
  }

  if (payload.code === 503001 || status === 503) {
    return "注册服务暂不可用，请稍后重试";
  }

  return "注册失败，请稍后重试";
}

export default function RegisterPage() {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [registerState, setRegisterState] = useState<RegisterState>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const canSubmit =
    PHONE_PATTERN.test(phone.trim()) &&
    PASSWORD_PATTERN.test(password.trim()) &&
    name.trim().length > 0 &&
    registerState !== "submitting";

  async function handleSubmitRegistration(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!canSubmit) {
      setRegisterState("error");
      setErrorMessage("请输入有效手机号、姓名和至少 8 位字母数字组合密码");
      return;
    }

    setRegisterState("submitting");
    setErrorMessage(null);

    try {
      const response = await fetch("/api/v1/users", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          phone: phone.trim(),
          password: password.trim(),
          name: name.trim(),
        }),
      });
      const payload = (await response.json()) as UserRegistrationPayload;

      if (!response.ok || payload.code !== 0 || payload.data === null) {
        setRegisterState("error");
        setErrorMessage(getRegistrationErrorMessage(payload, response.status));
        return;
      }

      router.replace("/redeem-code");
    } catch {
      setRegisterState("error");
      setErrorMessage("注册服务暂不可用，请稍后重试");
    }
  }

  const isSubmitting = registerState === "submitting";

  return (
    <main className="bg-background flex min-h-screen w-full items-center justify-center px-4 py-8">
      <section className="border-border bg-surface rounded-radius-md flex w-full max-w-sm flex-col gap-6 border p-5 shadow-sm">
        <div className="flex flex-col gap-2">
          <p className="text-text-secondary text-sm">题库系统</p>
          <h1 className="font-heading text-text-primary text-2xl font-semibold">
            注册账号
          </h1>
        </div>

        <form
          className="flex flex-col gap-4"
          onSubmit={handleSubmitRegistration}
        >
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
            <span className="text-text-primary">姓名</span>
            <Input
              aria-invalid={errorMessage !== null}
              autoComplete="name"
              name="name"
              placeholder="请输入姓名"
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
          </label>

          <label className="flex flex-col gap-1.5 text-sm font-medium">
            <span className="text-text-primary">密码</span>
            <Input
              aria-invalid={errorMessage !== null}
              autoComplete="new-password"
              name="password"
              placeholder="至少 8 位，包含字母和数字"
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
            <UserPlus aria-hidden="true" />
            {isSubmitting ? "注册中" : "注册"}
          </Button>
        </form>

        <Link
          className="text-primary text-center text-sm underline-offset-4 transition-colors hover:underline"
          href="/login"
        >
          已有账号，去登录
        </Link>
      </section>
    </main>
  );
}
