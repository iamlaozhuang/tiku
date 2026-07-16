import { createElement } from "react";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import RegisterPage from "@/app/(auth)/register/page";

const replaceMock = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    replace: replaceMock,
  }),
}));

function mockRegistrationResponse(payload: unknown, status = 200) {
  const fetchMock = vi.fn().mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    json: async () => payload,
  });

  vi.stubGlobal("fetch", fetchMock);

  return fetchMock;
}

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.clearAllMocks();
});

beforeEach(() => {
  replaceMock.mockReset();
});

describe("RegisterPage", () => {
  it("keeps submit disabled until phone, password, and name are valid", () => {
    render(createElement(RegisterPage));

    const submitButton = screen.getByRole("button", { name: "注册" });

    expect(screen.getByLabelText("手机号")).toBeInTheDocument();
    expect(screen.getByLabelText("密码")).toBeInTheDocument();
    expect(screen.getByLabelText("姓名")).toBeInTheDocument();
    expect(submitButton).toBeDisabled();

    fireEvent.change(screen.getByLabelText("手机号"), {
      target: { value: "13900000003" },
    });
    fireEvent.change(screen.getByLabelText("密码"), {
      target: { value: "abcdefgh" },
    });
    fireEvent.change(screen.getByLabelText("姓名"), {
      target: { value: "新学员" },
    });

    expect(submitButton).toBeDisabled();

    fireEvent.change(screen.getByLabelText("密码"), {
      target: { value: "abc12345" },
    });

    expect(submitButton).toBeEnabled();
  });

  it("registers a personal user and routes to redeem_code without rendering credentials", async () => {
    const fetchMock = mockRegistrationResponse({
      code: 0,
      message: "ok",
      data: {
        user: {
          publicId: "user-registered-student",
          phone: "13900000003",
          name: "新学员",
          userType: "personal",
          status: "active",
          lockedUntilAt: null,
          employeePublicId: null,
          organizationPublicId: null,
          adminPublicId: null,
          adminRoles: [],
        },
        nextAction: "redeem_code",
        session: {
          expiresAt: "2026-05-28T12:00:00.000Z",
        },
      },
    });

    render(createElement(RegisterPage));

    fireEvent.change(screen.getByLabelText("手机号"), {
      target: { value: "13900000003" },
    });
    fireEvent.change(screen.getByLabelText("密码"), {
      target: { value: "abc12345" },
    });
    fireEvent.change(screen.getByLabelText("姓名"), {
      target: { value: "新学员" },
    });
    fireEvent.click(screen.getByRole("button", { name: "注册" }));

    await waitFor(() =>
      expect(replaceMock).toHaveBeenCalledWith("/redeem-code"),
    );
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/v1/users",
      expect.objectContaining({
        method: "POST",
        credentials: "same-origin",
      }),
    );
    expect(document.body.textContent).not.toContain("abc12345");
    expect(document.body.textContent).not.toContain("user-registered-student");
  });

  it("shows duplicate phone feedback without redirecting", async () => {
    mockRegistrationResponse(
      {
        code: 409001,
        message: "Phone already registered.",
        data: null,
      },
      409,
    );

    render(createElement(RegisterPage));

    fireEvent.change(screen.getByLabelText("手机号"), {
      target: { value: "13900000003" },
    });
    fireEvent.change(screen.getByLabelText("密码"), {
      target: { value: "abc12345" },
    });
    fireEvent.change(screen.getByLabelText("姓名"), {
      target: { value: "新学员" },
    });
    fireEvent.click(screen.getByRole("button", { name: "注册" }));

    expect(await screen.findByText("该手机号已注册")).toBeInTheDocument();
    expect(replaceMock).not.toHaveBeenCalled();
  });

  it("reuses the idempotency key for an unchanged retry and rotates it after input changes", async () => {
    const randomUUID = vi
      .fn()
      .mockReturnValueOnce("123e4567-e89b-42d3-a456-426614174000")
      .mockReturnValueOnce("123e4567-e89b-42d3-a456-426614174001");
    vi.stubGlobal("crypto", { randomUUID });
    const fetchMock = vi
      .fn()
      .mockRejectedValueOnce(new Error("response lost"))
      .mockRejectedValueOnce(new Error("response still lost"))
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          code: 0,
          message: "ok",
          data: { nextAction: "redeem_code" },
        }),
      });
    vi.stubGlobal("fetch", fetchMock);

    render(createElement(RegisterPage));

    fireEvent.change(screen.getByLabelText("手机号"), {
      target: { value: "13900000003" },
    });
    fireEvent.change(screen.getByLabelText("密码"), {
      target: { value: "abc12345" },
    });
    fireEvent.change(screen.getByLabelText("姓名"), {
      target: { value: "新学员" },
    });

    fireEvent.click(screen.getByRole("button", { name: "注册" }));
    expect(
      await screen.findByText("注册服务暂不可用，请稍后重试"),
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "注册" }));
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));
    expect(
      await screen.findByText("注册服务暂不可用，请稍后重试"),
    ).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("姓名"), {
      target: { value: "新学员二" },
    });
    fireEvent.click(screen.getByRole("button", { name: "注册" }));
    await waitFor(() =>
      expect(replaceMock).toHaveBeenCalledWith("/redeem-code"),
    );

    const idempotencyKeys = fetchMock.mock.calls.map(
      ([, init]) =>
        (init as RequestInit).headers &&
        ((init as RequestInit).headers as Record<string, string>)[
          "Idempotency-Key"
        ],
    );
    expect(idempotencyKeys).toEqual([
      "123e4567-e89b-42d3-a456-426614174000",
      "123e4567-e89b-42d3-a456-426614174000",
      "123e4567-e89b-42d3-a456-426614174001",
    ]);
    expect(randomUUID).toHaveBeenCalledTimes(2);
  });
});
