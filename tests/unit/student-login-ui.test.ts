import { createElement } from "react";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import LoginPage from "@/app/(auth)/login/page";

const replaceMock = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    replace: replaceMock,
  }),
}));

const studentLoginPayload = {
  code: 0,
  message: "ok",
  data: {
    token: "unit-test-student-session-token",
    user: {
      publicId: "user-dev-student",
      phone: "13900000002",
      name: "Dev Student",
      userType: "personal",
      status: "active",
      lockedUntilAt: null,
      employeePublicId: null,
      organizationPublicId: null,
      adminPublicId: null,
      adminRoles: [],
    },
    session: {
      expiresAt: "2026-05-29T04:00:00.000Z",
    },
  },
};

const adminLoginPayload = {
  code: 0,
  message: "ok",
  data: {
    token: "unit-test-admin-session-token",
    user: {
      publicId: "admin-dev-super-admin",
      phone: "13900000001",
      name: "Dev Admin",
      userType: null,
      status: "active",
      lockedUntilAt: null,
      employeePublicId: null,
      organizationPublicId: null,
      adminPublicId: "admin-dev-super-admin",
      adminRoles: ["super_admin"],
    },
    session: {
      expiresAt: "2026-05-29T04:00:00.000Z",
    },
  },
};

function mockSessionResponse(payload: unknown, status = 200) {
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
  localStorage.clear();
  vi.unstubAllGlobals();
  vi.clearAllMocks();
});

beforeEach(() => {
  replaceMock.mockReset();
});

describe("LoginPage", () => {
  it("keeps submit disabled until local credentials are valid", () => {
    render(createElement(LoginPage));

    const submitButton = screen.getByRole("button", { name: "登录" });

    expect(screen.getByLabelText("手机号")).toBeInTheDocument();
    expect(screen.getByLabelText("密码")).toBeInTheDocument();
    expect(submitButton).toBeDisabled();

    fireEvent.change(screen.getByLabelText("手机号"), {
      target: { value: "13900000002" },
    });
    fireEvent.change(screen.getByLabelText("密码"), {
      target: { value: "short" },
    });

    expect(submitButton).toBeDisabled();

    fireEvent.change(screen.getByLabelText("密码"), {
      target: { value: "TikuDevStudent#2026" },
    });

    expect(submitButton).toBeEnabled();
  });

  it("shows invalid credential feedback without rendering the session token", async () => {
    mockSessionResponse(
      {
        code: 401002,
        message: "Invalid phone or password.",
        data: null,
      },
      401,
    );

    render(createElement(LoginPage));

    fireEvent.change(screen.getByLabelText("手机号"), {
      target: { value: "13900000002" },
    });
    fireEvent.change(screen.getByLabelText("密码"), {
      target: { value: "TikuDevStudent#2026" },
    });
    fireEvent.click(screen.getByRole("button", { name: "登录" }));

    expect(await screen.findByText("手机号或密码不正确")).toBeInTheDocument();
    expect(screen.queryByText("unit-test-student-session-token")).toBeNull();
    expect(replaceMock).not.toHaveBeenCalled();
  });

  it("keeps the submit action disabled while login is loading", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(
        () =>
          new Promise(() => {
            // Keep the request pending so the loading state remains observable.
          }),
      ),
    );

    render(createElement(LoginPage));

    fireEvent.change(screen.getByLabelText("手机号"), {
      target: { value: "13900000002" },
    });
    fireEvent.change(screen.getByLabelText("密码"), {
      target: { value: "TikuDevStudent#2026" },
    });
    fireEvent.click(screen.getByRole("button", { name: "登录" }));

    expect(
      await screen.findByRole("button", { name: "登录中" }),
    ).toBeDisabled();
    expect(replaceMock).not.toHaveBeenCalled();
  });

  it("shows runtime unavailable feedback without redirecting", async () => {
    mockSessionResponse(
      {
        code: 503001,
        message: "Session runtime is not configured.",
        data: null,
      },
      503,
    );

    render(createElement(LoginPage));

    fireEvent.change(screen.getByLabelText("手机号"), {
      target: { value: "13900000002" },
    });
    fireEvent.change(screen.getByLabelText("密码"), {
      target: { value: "TikuDevStudent#2026" },
    });
    fireEvent.click(screen.getByRole("button", { name: "登录" }));

    expect(
      await screen.findByText("登录服务暂不可用，请稍后重试"),
    ).toBeInTheDocument();
    expect(replaceMock).not.toHaveBeenCalled();
  });

  it("stores the local session token privately and sends students to home", async () => {
    const fetchMock = mockSessionResponse(studentLoginPayload);

    render(createElement(LoginPage));

    fireEvent.change(screen.getByLabelText("手机号"), {
      target: { value: "13900000002" },
    });
    fireEvent.change(screen.getByLabelText("密码"), {
      target: { value: "TikuDevStudent#2026" },
    });
    fireEvent.click(screen.getByRole("button", { name: "登录" }));

    await waitFor(() => expect(replaceMock).toHaveBeenCalledWith("/home"));
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/v1/sessions",
      expect.objectContaining({
        method: "POST",
      }),
    );
    expect(localStorage.getItem("tiku.localSessionToken")).toBe(
      "unit-test-student-session-token",
    );
    expect(document.body.textContent).not.toContain(
      "unit-test-student-session-token",
    );
  });

  it("sends super admins to the admin entry after local session login", async () => {
    mockSessionResponse(adminLoginPayload);

    render(createElement(LoginPage));

    fireEvent.change(screen.getByLabelText("手机号"), {
      target: { value: "13900000001" },
    });
    fireEvent.change(screen.getByLabelText("密码"), {
      target: { value: "TikuDevAdmin#2026" },
    });
    fireEvent.click(screen.getByRole("button", { name: "登录" }));

    await waitFor(() => expect(replaceMock).toHaveBeenCalledWith("/ops/users"));
    expect(document.body.textContent).not.toContain(
      "unit-test-admin-session-token",
    );
  });
});
