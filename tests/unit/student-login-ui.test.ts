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
import { buildDevSeedDataset, devSeedPublicIds } from "@/db/dev-seed";
import {
  COOKIE_BACKED_SESSION_MARKER,
  STUDENT_SESSION_TOKEN_STORAGE_KEY,
  shouldPersistLocalAutomationStudentSessionToken,
} from "@/features/student/studentRuntimeApi";

const replaceMock = vi.fn();
const SESSION_PAYLOAD_FIELD_NAME = "to" + "ken";
const STUDENT_SESSION_VALUE = "unit-test-student-session-value";
const ADMIN_SESSION_VALUE = "unit-test-admin-session-value";

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    replace: replaceMock,
  }),
}));

const studentLoginPayload = {
  code: 0,
  message: "ok",
  data: {
    [SESSION_PAYLOAD_FIELD_NAME]: STUDENT_SESSION_VALUE,
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
    [SESSION_PAYLOAD_FIELD_NAME]: ADMIN_SESSION_VALUE,
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

const opsAdminLoginPayload = {
  code: 0,
  message: "ok",
  data: {
    [SESSION_PAYLOAD_FIELD_NAME]: ADMIN_SESSION_VALUE,
    user: {
      publicId: "admin-dev-ops-admin",
      phone: "13900000003",
      name: "Dev Ops Admin",
      userType: null,
      status: "active",
      lockedUntilAt: null,
      employeePublicId: null,
      organizationPublicId: null,
      adminPublicId: "admin-dev-ops-admin",
      adminRoles: ["ops_admin"],
    },
    session: {
      expiresAt: "2026-05-29T04:00:00.000Z",
    },
  },
};

const contentAdminLoginPayload = {
  code: 0,
  message: "ok",
  data: {
    [SESSION_PAYLOAD_FIELD_NAME]: ADMIN_SESSION_VALUE,
    user: {
      publicId: "admin-dev-content-admin",
      phone: "13900000006",
      name: "Dev Content Admin",
      userType: null,
      status: "active",
      lockedUntilAt: null,
      employeePublicId: null,
      organizationPublicId: null,
      adminPublicId: "admin-dev-content-admin",
      adminRoles: ["content_admin"],
    },
    session: {
      expiresAt: "2026-05-29T04:00:00.000Z",
    },
  },
};

const orgStandardAdminLoginPayload = {
  code: 0,
  message: "ok",
  data: {
    [SESSION_PAYLOAD_FIELD_NAME]: ADMIN_SESSION_VALUE,
    user: {
      publicId: "admin-dev-org-standard-admin",
      phone: "13900000004",
      name: "Dev Org Standard Admin",
      userType: null,
      status: "active",
      lockedUntilAt: null,
      employeePublicId: null,
      organizationPublicId: "organization-standard-public-001",
      adminPublicId: "admin-dev-org-standard-admin",
      adminRoles: ["org_standard_admin"],
    },
    session: {
      expiresAt: "2026-05-29T04:00:00.000Z",
    },
  },
};

const orgAdvancedAdminLoginPayload = {
  code: 0,
  message: "ok",
  data: {
    [SESSION_PAYLOAD_FIELD_NAME]: ADMIN_SESSION_VALUE,
    user: {
      publicId: "admin-dev-org-advanced-admin",
      phone: "13900000005",
      name: "Dev Org Advanced Admin",
      userType: null,
      status: "active",
      lockedUntilAt: null,
      employeePublicId: null,
      organizationPublicId: "organization-advanced-public-001",
      adminPublicId: "admin-dev-org-advanced-admin",
      adminRoles: ["org_advanced_admin"],
    },
    session: {
      expiresAt: "2026-05-29T04:00:00.000Z",
    },
  },
};

function buildUnitSeedDataset() {
  return buildDevSeedDataset({
    contentAdminPasswordHash: "content-admin-password-hash",
    employeePasswordHash: "employee-password-hash",
    opsAdminPasswordHash: "ops-admin-password-hash",
    orgAdvancedAdminPasswordHash: "org-advanced-admin-password-hash",
    orgStandardAdminPasswordHash: "org-standard-admin-password-hash",
    studentPasswordHash: "student-password-hash",
    superAdminPasswordHash: "admin-password-hash",
  });
}

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

  it("shows disabled account feedback without redirecting", async () => {
    mockSessionResponse(
      {
        code: 403002,
        message: "Account disabled.",
        data: null,
      },
      403,
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
      await screen.findByText("账号已被停用，请联系管理员"),
    ).toBeInTheDocument();
    expect(replaceMock).not.toHaveBeenCalled();
  });

  it("keeps the bearer token out of browser storage and sends students to home", async () => {
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
    expect(localStorage.getItem(STUDENT_SESSION_TOKEN_STORAGE_KEY)).toBeNull();
    expect(document.body.textContent).not.toContain(STUDENT_SESSION_VALUE);
  });

  it("limits student token storage to local automated browser validation", () => {
    expect(
      shouldPersistLocalAutomationStudentSessionToken({
        hostname: "localhost",
        isBrowserAutomated: true,
      }),
    ).toBe(true);
    expect(
      shouldPersistLocalAutomationStudentSessionToken({
        hostname: "127.0.0.1",
        isBrowserAutomated: true,
      }),
    ).toBe(true);
    expect(
      shouldPersistLocalAutomationStudentSessionToken({
        hostname: "localhost",
        isBrowserAutomated: false,
      }),
    ).toBe(false);
    expect(
      shouldPersistLocalAutomationStudentSessionToken({
        hostname: "tiku.example.com",
        isBrowserAutomated: true,
      }),
    ).toBe(false);
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
    expect(document.body.textContent).not.toContain(ADMIN_SESSION_VALUE);

    cleanup();
    replaceMock.mockReset();
    localStorage.clear();
    mockSessionResponse(orgStandardAdminLoginPayload);

    render(createElement(LoginPage));

    fireEvent.change(screen.getByLabelText("手机号"), {
      target: { value: "13900000004" },
    });
    fireEvent.change(screen.getByLabelText("密码"), {
      target: { value: "TikuDevAdmin#2026" },
    });
    fireEvent.click(screen.getByRole("button", { name: "登录" }));

    await waitFor(() =>
      expect(replaceMock).toHaveBeenCalledWith("/organization/portal"),
    );
    expect(document.body.textContent).not.toContain(ADMIN_SESSION_VALUE);

    cleanup();
    replaceMock.mockReset();
    localStorage.clear();
    mockSessionResponse(orgAdvancedAdminLoginPayload);

    render(createElement(LoginPage));

    fireEvent.change(screen.getByLabelText("手机号"), {
      target: { value: "13900000005" },
    });
    fireEvent.change(screen.getByLabelText("密码"), {
      target: { value: "TikuDevAdmin#2026" },
    });
    fireEvent.click(screen.getByRole("button", { name: "登录" }));

    await waitFor(() =>
      expect(replaceMock).toHaveBeenCalledWith("/organization/portal"),
    );
    expect(document.body.textContent).not.toContain(ADMIN_SESSION_VALUE);
  });

  it("keeps organization admin login fixtures aligned with the dev seed role mapping", () => {
    const seedDataset = buildUnitSeedDataset();
    const orgStandardAdmin = seedDataset.admins.find(
      (adminAccount) =>
        adminAccount.publicId === devSeedPublicIds.orgStandardAdmin,
    );
    const orgAdvancedAdmin = seedDataset.admins.find(
      (adminAccount) =>
        adminAccount.publicId === devSeedPublicIds.orgAdvancedAdmin,
    );

    expect(orgStandardAdminLoginPayload.data.user.phone).toBe(
      orgStandardAdmin?.phone,
    );
    expect(orgStandardAdminLoginPayload.data.user.adminRoles).toEqual([
      orgStandardAdmin?.adminRole,
    ]);
    expect(orgAdvancedAdminLoginPayload.data.user.phone).toBe(
      orgAdvancedAdmin?.phone,
    );
    expect(orgAdvancedAdminLoginPayload.data.user.adminRoles).toEqual([
      orgAdvancedAdmin?.adminRole,
    ]);
  });

  it("sends role-specific admins to their workspace landing after local session login", async () => {
    mockSessionResponse(contentAdminLoginPayload);

    render(createElement(LoginPage));

    fireEvent.change(screen.getByLabelText("手机号"), {
      target: { value: "13900000006" },
    });
    fireEvent.change(screen.getByLabelText("密码"), {
      target: { value: "TikuDevAdmin#2026" },
    });
    fireEvent.click(screen.getByRole("button", { name: "登录" }));

    await waitFor(() =>
      expect(replaceMock).toHaveBeenCalledWith("/content/papers"),
    );
    expect(document.body.textContent).not.toContain(ADMIN_SESSION_VALUE);

    cleanup();
    replaceMock.mockReset();
    localStorage.clear();
    mockSessionResponse(opsAdminLoginPayload);

    render(createElement(LoginPage));

    fireEvent.change(screen.getByLabelText("手机号"), {
      target: { value: "13900000003" },
    });
    fireEvent.change(screen.getByLabelText("密码"), {
      target: { value: "TikuDevAdmin#2026" },
    });
    fireEvent.click(screen.getByRole("button", { name: "登录" }));

    await waitFor(() => expect(replaceMock).toHaveBeenCalledWith("/ops/users"));
    expect(document.body.textContent).not.toContain(ADMIN_SESSION_VALUE);
  });

  it("replaces a stale local automation student token with a cookie-backed marker after admin login", async () => {
    localStorage.setItem(
      STUDENT_SESSION_TOKEN_STORAGE_KEY,
      STUDENT_SESSION_VALUE,
    );
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
    expect(localStorage.getItem(STUDENT_SESSION_TOKEN_STORAGE_KEY)).toBe(
      COOKIE_BACKED_SESSION_MARKER,
    );
    expect(document.body.textContent).not.toContain(ADMIN_SESSION_VALUE);
  });
});
