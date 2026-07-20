import { createElement } from "react";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  StudentProfilePage,
  StudentRedeemCodePage,
} from "@/features/student/profile/StudentProfileRedeemPage";

const sessionPayload = {
  code: 0,
  message: "ok",
  data: {
    user: {
      publicId: "user-dev-student",
      phone: "139****0002",
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

const authorizationPayload = {
  code: 0,
  message: "ok",
  data: {
    authorizations: [
      {
        publicId: "personal-auth-public-001",
        authorizationType: "personal_auth",
        profession: "monopoly",
        level: 3,
        startsAt: "2026-05-22T00:00:00.000Z",
        expiresAt: "2026-08-22T00:00:00.000Z",
        status: "active",
        organizationPublicId: null,
        organizationName: null,
      },
    ],
    effectiveAuthorizations: [
      {
        profession: "monopoly",
        level: 3,
        authorizationTypes: ["personal_auth"],
        expiresAt: "2026-08-22T00:00:00.000Z",
        status: "active",
      },
    ],
    authorizationContexts: [
      {
        authorizationSource: "personal_auth",
        authorizationPublicId: "personal-auth-public-001",
        edition: "standard",
        effectiveEdition: "advanced",
        upgradeStatus: "active",
        profession: "monopoly",
        level: 3,
        ownerType: "personal",
        ownerPublicId: "user-dev-student",
        organizationPublicId: null,
        quotaOwnerType: "personal",
        quotaOwnerPublicId: "user-dev-student",
        expiresAt: "2026-08-22T00:00:00.000Z",
        displayStatus: "active",
      },
    ],
  },
};

const personalAuthPayload = {
  code: 0,
  message: "ok",
  data: {
    personalAuths: [
      {
        publicId: "personal-auth-public-001",
        redeemCodePublicId: "redeem-code-public-001",
        profession: "monopoly",
        level: 3,
        startsAt: "2026-05-22T00:00:00.000Z",
        expiresAt: "2026-08-22T00:00:00.000Z",
        status: "active",
      },
    ],
  },
};

const redeemCodePreviewPayload = {
  code: 0,
  message: "ok",
  data: {
    redeemCodeType: "personal_advanced_activation",
    profession: "monopoly",
    level: 3,
    resultEdition: "advanced",
    durationDay: 365,
    redeemDeadlineAt: "2026-08-22T00:00:00.000Z",
    previewVersion:
      "sha256:1111111111111111111111111111111111111111111111111111111111111111",
    upgradeTargets: [],
  },
};

const longTermPreviewPayload = {
  ...redeemCodePreviewPayload,
  data: {
    ...redeemCodePreviewPayload.data,
    redeemDeadlineAt: null,
  },
};

type TestSessionUser = {
  adminPublicId: string | null;
  adminRoles: string[];
  employeePublicId: string | null;
  lockedUntilAt: string | null;
  name: string;
  organizationPublicId: string | null;
  phone: string;
  publicId: string;
  status: "active";
  userType: "employee" | "personal" | null;
};

function createSessionPayload(overrides: Partial<TestSessionUser> = {}) {
  return {
    ...sessionPayload,
    data: {
      ...sessionPayload.data,
      user: {
        ...sessionPayload.data.user,
        ...overrides,
      },
    },
  };
}

function createAuthorizationPayload(input: {
  authorizationSource: "org_auth" | "personal_auth";
  edition: "advanced" | "standard";
  expiresAt?: string;
  effectiveEdition: "advanced" | "standard";
  organizationName?: string | null;
  quotaOwnerType: "organization" | "personal";
}) {
  const authorizationType = input.authorizationSource;
  const publicId =
    authorizationType === "org_auth"
      ? "org-auth-public-ui-001"
      : "personal-auth-public-001";
  const ownerType =
    authorizationType === "org_auth" ? "organization" : "personal";
  const ownerPublicId =
    authorizationType === "org_auth"
      ? "organization-public-ui-001"
      : "user-dev-student";
  const expiresAt = input.expiresAt ?? "2026-08-22T00:00:00.000Z";

  return {
    ...authorizationPayload,
    data: {
      authorizations: [
        {
          publicId,
          authorizationType,
          profession: "monopoly",
          level: 3,
          startsAt: "2026-05-22T00:00:00.000Z",
          expiresAt,
          status: "active",
          organizationPublicId:
            authorizationType === "org_auth"
              ? "organization-public-ui-001"
              : null,
          organizationName: input.organizationName ?? null,
        },
      ],
      effectiveAuthorizations: [
        {
          profession: "monopoly",
          level: 3,
          authorizationTypes: [authorizationType],
          expiresAt,
          status: "active",
        },
      ],
      authorizationContexts: [
        {
          authorizationSource: input.authorizationSource,
          authorizationPublicId: publicId,
          edition: input.edition,
          effectiveEdition: input.effectiveEdition,
          upgradeStatus:
            input.edition === input.effectiveEdition ? "none" : "active",
          profession: "monopoly",
          level: 3,
          ownerType,
          ownerPublicId,
          organizationPublicId:
            authorizationType === "org_auth"
              ? "organization-public-ui-001"
              : null,
          quotaOwnerType: input.quotaOwnerType,
          quotaOwnerPublicId: ownerPublicId,
          expiresAt,
          displayStatus: "active",
        },
      ],
    },
  };
}

function createPersonalAuthPayload(
  personalAuths = personalAuthPayload.data.personalAuths,
) {
  return {
    ...personalAuthPayload,
    data: {
      personalAuths,
    },
  };
}

function mockProfileFetchWithPayloads(
  input: {
    authorization?: unknown;
    logout?: unknown;
    logoutStatus?: number;
    personalAuth?: unknown;
    session?: unknown;
  } = {},
) {
  const nextSessionPayload = input.session ?? sessionPayload;
  const nextAuthorizationPayload = input.authorization ?? authorizationPayload;
  const nextPersonalAuthPayload = input.personalAuth ?? personalAuthPayload;
  const nextLogoutPayload = input.logout ?? {
    code: 0,
    message: "ok",
    data: null,
  };
  const fetchMock = vi.fn(
    async (url: RequestInfo | URL, init?: RequestInit) => {
      const path = String(url);

      if (path === "/api/v1/sessions" && init?.method === "DELETE") {
        return createJsonResponse(nextLogoutPayload, input.logoutStatus);
      }

      if (path === "/api/v1/sessions") {
        return createJsonResponse(nextSessionPayload);
      }

      if (path === "/api/v1/authorizations") {
        return createJsonResponse(nextAuthorizationPayload);
      }

      if (path === "/api/v1/personal-auths") {
        return createJsonResponse(nextPersonalAuthPayload);
      }

      return createJsonResponse({
        code: 404001,
        message: "missing",
        data: null,
      });
    },
  );

  vi.stubGlobal("fetch", fetchMock);

  return fetchMock;
}

function mockProfileFetch() {
  return mockProfileFetchWithPayloads();
}

function createJsonResponse(payload: unknown, status = 200) {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => payload,
  };
}

function getFirstFetchInit(fetchMock: ReturnType<typeof vi.fn>): RequestInit {
  const [, init] = fetchMock.mock.calls[0] as [RequestInfo | URL, RequestInit];

  return init;
}

afterEach(() => {
  cleanup();
  localStorage.clear();
  vi.unstubAllGlobals();
  vi.clearAllMocks();
});

beforeEach(() => {
  window.history.replaceState({}, "", "/profile");
});

describe("StudentProfilePage", () => {
  it("does not label the first row as current when multiple authorization contexts lack an exact selection", async () => {
    const firstContext = authorizationPayload.data.authorizationContexts[0];
    mockProfileFetchWithPayloads({
      authorization: {
        ...authorizationPayload,
        data: {
          ...authorizationPayload.data,
          authorizationContexts: [
            {
              ...firstContext,
              authorizationPublicId: "personal-auth-profile-standard-001",
              edition: "standard",
              effectiveEdition: "standard",
              upgradeStatus: "none",
            },
            {
              ...firstContext,
              authorizationPublicId: "personal-auth-profile-advanced-002",
              edition: "advanced",
              effectiveEdition: "advanced",
              upgradeStatus: "none",
            },
          ],
        },
      },
    });

    render(createElement(StudentProfilePage));

    expect(
      await screen.findByTestId("student-profile-current-authorization"),
    ).toHaveTextContent("请选择当前授权");
  });

  it("shows the exact authorization context carried from the learner home", async () => {
    const firstContext = authorizationPayload.data.authorizationContexts[0];
    window.history.replaceState(
      {},
      "",
      "/profile?authorizationPublicId=personal-auth-profile-advanced-002",
    );
    mockProfileFetchWithPayloads({
      authorization: {
        ...authorizationPayload,
        data: {
          ...authorizationPayload.data,
          authorizationContexts: [
            {
              ...firstContext,
              authorizationPublicId: "personal-auth-profile-standard-001",
              edition: "standard",
              effectiveEdition: "standard",
              upgradeStatus: "none",
            },
            {
              ...firstContext,
              authorizationPublicId: "personal-auth-profile-advanced-002",
              edition: "advanced",
              effectiveEdition: "advanced",
              upgradeStatus: "none",
              expiresAt: null,
            },
          ],
        },
      },
    });

    render(createElement(StudentProfilePage));

    const currentAuthorization = await screen.findByTestId(
      "student-profile-current-authorization",
    );
    expect(currentAuthorization).toHaveTextContent("当前权益");
    expect(currentAuthorization).toHaveTextContent("高级版");
    expect(currentAuthorization).toHaveTextContent("到期未设置");
    expect(currentAuthorization).not.toHaveTextContent("2026-08-22");
    expect(currentAuthorization).not.toHaveTextContent("请选择当前授权");
  });

  it("renders an unauthorized state after the server session check fails", async () => {
    const fetchMock = vi.fn(async () =>
      createJsonResponse({
        code: 401001,
        message: "Unauthorized.",
        data: null,
      }),
    );
    vi.stubGlobal("fetch", fetchMock);

    render(createElement(StudentProfilePage));

    expect(await screen.findByText("请先登录")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "前往登录" })).toHaveAttribute(
      "href",
      "/login",
    );
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/v1/sessions",
      expect.objectContaining({ credentials: "same-origin" }),
    );
    expect(getFirstFetchInit(fetchMock)).not.toHaveProperty("headers");
  });

  it("loads profile and authorization data through the cookie-backed session runtime", async () => {
    const fetchMock = mockProfileFetch();

    render(createElement(StudentProfilePage));

    expect(screen.getByText("正在加载个人中心")).toBeInTheDocument();
    expect(await screen.findByText("Dev Student")).toBeInTheDocument();
    expect(screen.getByText("139****0002")).toBeInTheDocument();
    expect(screen.queryByText("13900000002")).toBeNull();
    expect(screen.getAllByText("专卖 3级").length).toBeGreaterThan(0);
    expect(screen.getAllByText("个人授权").length).toBeGreaterThan(0);
    expect(screen.getByText("高级版")).toBeInTheDocument();
    expect(
      screen.getByTestId("student-profile-current-authorization"),
    ).toHaveTextContent("当前权益");
    expect(screen.queryByText("会话有效期至 2026-05-29")).toBeNull();
    expect(screen.queryByText("账号与密码帮助")).toBeNull();
    expect(screen.queryByRole("heading", { name: "版本授权" })).toBeNull();
    expect(screen.queryByRole("heading", { name: "授权明细" })).toBeNull();
    expect(screen.queryByRole("heading", { name: "个人授权记录" })).toBeNull();
    expect(screen.queryByText("升级生效")).toBeNull();
    expect(screen.queryByText("额度归属：个人")).toBeNull();
    expect(document.body.textContent).not.toContain("code_hash");
    expect(screen.queryByText("1")).toBeNull();
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/v1/sessions",
      expect.objectContaining({ credentials: "same-origin" }),
    );
    expect(getFirstFetchInit(fetchMock)).not.toHaveProperty("headers");
  });

  it.each([
    {
      label: "personal standard learner",
      session: createSessionPayload({
        name: "个人标准版验收用户",
        userType: "personal",
      }),
      authorization: createAuthorizationPayload({
        authorizationSource: "personal_auth",
        edition: "standard",
        effectiveEdition: "standard",
        quotaOwnerType: "personal",
      }),
      personalAuth: createPersonalAuthPayload(),
      shouldShowPrimaryRedeem: true,
      summaryText: "标准版",
    },
    {
      label: "personal advanced learner",
      session: createSessionPayload({
        name: "个人高级版验收用户",
        userType: "personal",
      }),
      authorization: createAuthorizationPayload({
        authorizationSource: "personal_auth",
        edition: "advanced",
        effectiveEdition: "advanced",
        quotaOwnerType: "personal",
      }),
      personalAuth: createPersonalAuthPayload(),
      shouldShowPrimaryRedeem: true,
      summaryText: "高级版",
    },
    {
      label: "organization standard employee",
      session: createSessionPayload({
        employeePublicId: "employee-public-ui-001",
        name: "企业标准版员工",
        organizationPublicId: "organization-public-ui-001",
        userType: "employee",
      }),
      authorization: createAuthorizationPayload({
        authorizationSource: "org_auth",
        edition: "standard",
        effectiveEdition: "standard",
        organizationName: "脱敏企业",
        quotaOwnerType: "organization",
      }),
      personalAuth: createPersonalAuthPayload([]),
      shouldShowPrimaryRedeem: false,
      summaryText: "企业授权",
    },
    {
      label: "organization advanced employee",
      session: createSessionPayload({
        employeePublicId: "employee-public-ui-002",
        name: "企业高级版员工",
        organizationPublicId: "organization-public-ui-001",
        userType: "employee",
      }),
      authorization: createAuthorizationPayload({
        authorizationSource: "org_auth",
        edition: "advanced",
        effectiveEdition: "advanced",
        organizationName: "脱敏企业",
        quotaOwnerType: "organization",
      }),
      personalAuth: createPersonalAuthPayload([]),
      shouldShowPrimaryRedeem: false,
      summaryText: "高级版",
    },
  ])(
    "keeps the $label profile default summary compact and hides low-frequency details",
    async ({
      authorization,
      personalAuth,
      session,
      shouldShowPrimaryRedeem,
      summaryText,
    }) => {
      mockProfileFetchWithPayloads({
        authorization,
        personalAuth,
        session,
      });

      render(createElement(StudentProfilePage));

      expect(
        await screen.findByText(session.data.user.name),
      ).toBeInTheDocument();
      const currentAuthorization = screen.getByTestId(
        "student-profile-current-authorization",
      );

      expect(currentAuthorization).toHaveTextContent("当前权益");
      expect(currentAuthorization).toHaveTextContent(summaryText);
      expect(screen.queryByText("会话有效期至 2026-05-29")).toBeNull();
      expect(screen.queryByText("账号与密码帮助")).toBeNull();
      expect(screen.queryByRole("heading", { name: "版本授权" })).toBeNull();
      expect(screen.queryByRole("heading", { name: "授权明细" })).toBeNull();
      expect(
        screen.queryByRole("heading", { name: "个人授权记录" }),
      ).toBeNull();
      expect(screen.queryByText("等待卡密")).toBeNull();
      expect(
        screen.queryByTestId("student-purchase-guidance-contact-config"),
      ).toBeNull();

      if (shouldShowPrimaryRedeem) {
        expect(screen.getByRole("link", { name: "兑换卡密" })).toHaveAttribute(
          "href",
          "/redeem-code",
        );
      } else {
        expect(screen.queryByRole("link", { name: "兑换卡密" })).toBeNull();
      }
    },
  );

  it("reveals account help and authorization details only after explicit expansion", async () => {
    mockProfileFetch();

    render(createElement(StudentProfilePage));

    expect(await screen.findByText("Dev Student")).toBeInTheDocument();
    expect(screen.queryByText("账号与密码帮助")).toBeNull();
    expect(screen.queryByRole("heading", { name: "版本授权" })).toBeNull();
    expect(screen.queryByRole("heading", { name: "授权明细" })).toBeNull();

    fireEvent.click(screen.getByRole("button", { name: "账号帮助" }));

    expect(screen.getByText("账号与密码帮助")).toBeInTheDocument();
    expect(screen.getByText("会话有效期至 2026-05-29")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "查看授权详情" }));

    expect(
      screen.getByRole("heading", { name: "版本授权" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "授权明细" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "个人授权记录" }),
    ).toBeInTheDocument();
    expect(screen.getByText("升级生效")).toBeInTheDocument();
    expect(screen.getByText("额度归属：个人")).toBeInTheDocument();
  });

  it("revokes the server session before moving the profile view to the unauthorized state", async () => {
    localStorage.setItem("tiku.localSessionToken", "__cookie_backed_session__");
    const fetchMock = mockProfileFetch();

    render(createElement(StudentProfilePage));

    expect(await screen.findByText("Dev Student")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "退出登录" }));

    await waitFor(() =>
      expect(screen.getByRole("link", { name: "前往登录" })).toHaveAttribute(
        "href",
        "/login",
      ),
    );
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/v1/sessions",
      expect.objectContaining({
        credentials: "same-origin",
        method: "DELETE",
      }),
    );
    expect(localStorage.getItem("tiku.localSessionToken")).toBeNull();
  });

  it("keeps the learner visibly signed in when server logout is rejected", async () => {
    localStorage.setItem("tiku.localSessionToken", "__cookie_backed_session__");
    mockProfileFetchWithPayloads({
      logout: {
        code: 503001,
        message: "Session logout unavailable.",
        data: null,
      },
    });

    render(createElement(StudentProfilePage));

    expect(await screen.findByText("Dev Student")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "退出登录" }));

    expect(
      await screen.findByRole("alert", {
        name: "退出失败，当前会话仍保持登录，请重试。",
      }),
    ).toBeInTheDocument();
    expect(screen.getByText("Dev Student")).toBeInTheDocument();
    expect(localStorage.getItem("tiku.localSessionToken")).toBe(
      "__cookie_backed_session__",
    );
    expect(screen.queryByRole("link", { name: "前往登录" })).toBeNull();
    expect(screen.getByRole("button", { name: "退出登录" })).toBeEnabled();
  });

  it("does not treat a non-success HTTP logout response as a completed logout", async () => {
    localStorage.setItem("tiku.localSessionToken", "__cookie_backed_session__");
    mockProfileFetchWithPayloads({
      logoutStatus: 503,
    });

    render(createElement(StudentProfilePage));

    expect(await screen.findByText("Dev Student")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "退出登录" }));

    expect(
      await screen.findByRole("alert", {
        name: "退出失败，当前会话仍保持登录，请重试。",
      }),
    ).toBeInTheDocument();
    expect(localStorage.getItem("tiku.localSessionToken")).toBe(
      "__cookie_backed_session__",
    );
  });

  it("rejects a malformed successful logout envelope", async () => {
    localStorage.setItem("tiku.localSessionToken", "__cookie_backed_session__");
    mockProfileFetchWithPayloads({
      logout: {
        code: 0,
        message: 42,
        data: null,
      },
    });

    render(createElement(StudentProfilePage));

    expect(await screen.findByText("Dev Student")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "退出登录" }));

    expect(
      await screen.findByRole("alert", {
        name: "退出失败，当前会话仍保持登录，请重试。",
      }),
    ).toBeInTheDocument();
    expect(localStorage.getItem("tiku.localSessionToken")).toBe(
      "__cookie_backed_session__",
    );
  });
});

describe("StudentRedeemCodePage", () => {
  it("explains that employee redemption adds personal authorization without changing organization benefits", async () => {
    const employeeSessionPayload = createSessionPayload({
      employeePublicId: "employee-public-redeem-ui-001",
      organizationPublicId: "organization-public-redeem-ui-001",
      userType: "employee",
    });

    vi.stubGlobal(
      "fetch",
      vi.fn(async (url: RequestInfo | URL, init?: RequestInit) => {
        const path = String(url);

        if (path === "/api/v1/sessions") {
          return createJsonResponse(employeeSessionPayload);
        }

        if (path === "/api/v1/personal-auths") {
          return createJsonResponse(personalAuthPayload);
        }

        if (path === "/api/v1/redeem-codes/preview") {
          expect(init?.body).toBe(JSON.stringify({ code: "ABCD2345" }));
          return createJsonResponse(redeemCodePreviewPayload);
        }

        return createJsonResponse({
          code: 404001,
          message: "missing",
          data: null,
        });
      }),
    );

    render(createElement(StudentRedeemCodePage));

    expect(
      await screen.findByText(
        "兑换成功后会新增或升级你的个人授权，不会改变企业授权、企业版本或企业额度。",
      ),
    ).toBeInTheDocument();

    const redeemForm = screen
      .getByRole("button", { name: "预览权益" })
      .closest("form");

    expect(redeemForm).not.toBeNull();
    expect(redeemForm).toHaveTextContent("不会改变企业授权");

    fireEvent.change(screen.getByLabelText("兑换码"), {
      target: { value: "ABCD2345" },
    });
    fireEvent.click(screen.getByRole("button", { name: "预览权益" }));
    expect(
      await screen.findByRole("heading", { name: "高级版个人授权" }),
    ).toBeInTheDocument();
  });

  it("loads a server entitlement preview before enabling irreversible confirmation", async () => {
    const fetchMock = vi.fn(
      async (url: RequestInfo | URL, init?: RequestInit) => {
        const path = String(url);

        if (path === "/api/v1/sessions") {
          return createJsonResponse(sessionPayload);
        }

        if (path === "/api/v1/personal-auths") {
          return createJsonResponse({
            code: 0,
            message: "ok",
            data: { personalAuths: [] },
          });
        }

        if (path === "/api/v1/redeem-codes/preview") {
          expect(init).toMatchObject({
            method: "POST",
            headers: {
              "content-type": "application/json",
            },
            body: JSON.stringify({ code: "ABCD2345" }),
          });

          return createJsonResponse(redeemCodePreviewPayload);
        }

        return createJsonResponse({
          code: 404001,
          message: "missing",
          data: null,
        });
      },
    );

    vi.stubGlobal("fetch", fetchMock);

    render(createElement(StudentRedeemCodePage));

    expect(await screen.findByText("暂无个人授权记录")).toBeInTheDocument();
    expect(screen.getByText("等待卡密")).toBeInTheDocument();
    expect(screen.getByText("卡密来源：系统运营")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "预览权益" })).toBeDisabled();

    fireEvent.change(screen.getByLabelText("兑换码"), {
      target: { value: "ABCD2345" },
    });

    expect(screen.getByRole("button", { name: "预览权益" })).toBeEnabled();

    fireEvent.click(screen.getByRole("button", { name: "预览权益" }));

    expect(
      await screen.findByRole("heading", { name: "高级版个人授权" }),
    ).toBeInTheDocument();
    expect(screen.getByTestId("redeem-code-confirmation")).toHaveTextContent(
      "高级版激活卡",
    );
    expect(screen.getByTestId("redeem-code-confirmation")).toHaveTextContent(
      "专卖 · 三级",
    );
    expect(screen.getByTestId("redeem-code-confirmation")).toHaveTextContent(
      "365 天",
    );
    expect(screen.getByTestId("redeem-code-confirmation")).toHaveTextContent(
      "兑换截止：2026年8月22日",
    );
    expect(
      screen.getByTestId("redeem-code-confirmation"),
    ).not.toHaveTextContent("ABCD2345");
    expect(
      screen.getByRole("button", { name: "确认兑换" }),
    ).toBeInTheDocument();
    expect(fetchMock).not.toHaveBeenCalledWith(
      "/api/v1/redeem-codes/redeem",
      expect.anything(),
    );
  });

  it("shows a long-term redeem deadline in the server entitlement preview", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async (url: RequestInfo | URL) => {
        const path = String(url);

        if (path === "/api/v1/sessions") {
          return createJsonResponse(sessionPayload);
        }

        if (path === "/api/v1/personal-auths") {
          return createJsonResponse({
            code: 0,
            message: "ok",
            data: { personalAuths: [] },
          });
        }

        if (path === "/api/v1/redeem-codes/preview") {
          return createJsonResponse(longTermPreviewPayload);
        }

        return createJsonResponse({
          code: 404001,
          message: "missing",
          data: null,
        });
      }),
    );

    render(createElement(StudentRedeemCodePage));
    await screen.findByRole("heading", { name: "个人授权" });

    fireEvent.change(screen.getByLabelText("兑换码"), {
      target: { value: "ABCD2345" },
    });
    fireEvent.click(screen.getByRole("button", { name: "预览权益" }));

    expect(
      await screen.findByTestId("redeem-code-confirmation"),
    ).toHaveTextContent("兑换截止：长期可兑换");
  });

  it("ignores a late preview after the input has changed", async () => {
    let resolveFirstPreview!: (
      response: ReturnType<typeof createJsonResponse>,
    ) => void;
    const firstPreview = new Promise<ReturnType<typeof createJsonResponse>>(
      (resolve) => {
        resolveFirstPreview = resolve;
      },
    );
    const fetchMock = vi.fn(
      async (url: RequestInfo | URL, init?: RequestInit) => {
        const path = String(url);

        if (path === "/api/v1/sessions") {
          return createJsonResponse(sessionPayload);
        }

        if (path === "/api/v1/personal-auths") {
          return createJsonResponse({
            code: 0,
            message: "ok",
            data: { personalAuths: [] },
          });
        }

        if (path === "/api/v1/redeem-codes/preview") {
          const requestBody = JSON.parse(String(init?.body)) as {
            code: string;
          };

          if (requestBody.code === "ABCD2345") {
            return firstPreview;
          }

          return createJsonResponse({
            ...redeemCodePreviewPayload,
            data: {
              ...redeemCodePreviewPayload.data,
              redeemCodeType: "personal_standard_activation",
              resultEdition: "standard",
            },
          });
        }

        return createJsonResponse({
          code: 404001,
          message: "missing",
          data: null,
        });
      },
    );
    vi.stubGlobal("fetch", fetchMock);

    render(createElement(StudentRedeemCodePage));
    await screen.findByRole("heading", { name: "个人授权" });

    fireEvent.change(screen.getByLabelText("兑换码"), {
      target: { value: "ABCD2345" },
    });
    fireEvent.click(screen.getByRole("button", { name: "预览权益" }));
    fireEvent.change(screen.getByLabelText("兑换码"), {
      target: { value: "BCDE3456" },
    });
    fireEvent.click(screen.getByRole("button", { name: "预览权益" }));

    expect(
      await screen.findByRole("heading", { name: "标准版个人授权" }),
    ).toBeInTheDocument();
    expect(screen.getByTestId("redeem-code-confirmation")).toHaveTextContent(
      "标准版激活卡",
    );

    resolveFirstPreview(createJsonResponse(redeemCodePreviewPayload));

    await waitFor(() =>
      expect(
        screen.getByRole("heading", { name: "标准版个人授权" }),
      ).toBeInTheDocument(),
    );
    expect(
      screen.queryByRole("heading", { name: "高级版个人授权" }),
    ).toBeNull();
  });

  it("requires an explicit upgrade target when the server preview returns multiple candidates", async () => {
    const selectedTargetPublicId = "personal-auth-public-002";
    let resolveRedeem!: (
      response: ReturnType<typeof createJsonResponse>,
    ) => void;
    const pendingRedeem = new Promise<ReturnType<typeof createJsonResponse>>(
      (resolve) => {
        resolveRedeem = resolve;
      },
    );
    const fetchMock = vi.fn(
      async (url: RequestInfo | URL, init?: RequestInit) => {
        const path = String(url);

        if (path === "/api/v1/sessions") {
          return createJsonResponse(sessionPayload);
        }

        if (path === "/api/v1/personal-auths") {
          return createJsonResponse(personalAuthPayload);
        }

        if (path === "/api/v1/redeem-codes/preview") {
          return createJsonResponse({
            ...redeemCodePreviewPayload,
            data: {
              ...redeemCodePreviewPayload.data,
              redeemCodeType: "edition_upgrade",
              upgradeTargets: [
                {
                  personalAuthPublicId: "personal-auth-public-001",
                  sourceEdition: "standard",
                  startsAt: "2026-05-22T00:00:00.000Z",
                  expiresAt: "2026-08-22T00:00:00.000Z",
                },
                {
                  personalAuthPublicId: selectedTargetPublicId,
                  sourceEdition: "standard",
                  startsAt: "2026-06-22T00:00:00.000Z",
                  expiresAt: "2026-09-22T00:00:00.000Z",
                },
              ],
            },
          });
        }

        if (path === "/api/v1/redeem-codes/redeem") {
          expect(init?.body).toBe(
            JSON.stringify({
              code: "ABCD2345",
              previewVersion: redeemCodePreviewPayload.data.previewVersion,
              targetPersonalAuthPublicId: selectedTargetPublicId,
            }),
          );

          return pendingRedeem;
        }

        return createJsonResponse({
          code: 404001,
          message: "missing",
          data: null,
        });
      },
    );
    vi.stubGlobal("fetch", fetchMock);

    render(createElement(StudentRedeemCodePage));
    await screen.findByRole("heading", { name: "个人授权" });

    fireEvent.change(screen.getByLabelText("兑换码"), {
      target: { value: "ABCD2345" },
    });
    fireEvent.click(screen.getByRole("button", { name: "预览权益" }));

    expect(
      await screen.findByRole("group", { name: "选择要升级的标准版授权" }),
    ).toBeInTheDocument();
    expect(screen.getByTestId("redeem-code-confirmation")).toHaveTextContent(
      "升级后沿用所选授权有效期",
    );
    expect(screen.getByTestId("redeem-code-confirmation")).toHaveTextContent(
      "版本升级卡",
    );
    expect(
      screen.getByTestId("redeem-code-confirmation"),
    ).not.toHaveTextContent("365 天");
    expect(screen.getByRole("button", { name: "确认兑换" })).toBeDisabled();

    fireEvent.click(
      screen.getByRole("radio", {
        name: /2026年9月22日/u,
      }),
    );
    expect(screen.getByRole("button", { name: "确认兑换" })).toBeEnabled();

    fireEvent.click(screen.getByRole("button", { name: "确认兑换" }));
    expect(screen.getByLabelText("兑换码")).toBeDisabled();
    for (const radio of screen.getAllByRole("radio")) {
      expect(radio).toBeDisabled();
    }
    resolveRedeem(
      createJsonResponse({
        code: 409005,
        message: "Redeem code preview is stale.",
        data: null,
      }),
    );
    expect(await screen.findByText("权益预览已变化，请重新预览")).toBeVisible();
    expect(screen.queryByTestId("redeem-code-confirmation")).toBeNull();
    expect(screen.getByRole("button", { name: "预览权益" })).toBeEnabled();
  });

  it("submits redeem code with the cookie-backed session and shows contract-safe failure feedback", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async (url: RequestInfo | URL, init?: RequestInit) => {
        const path = String(url);

        if (path === "/api/v1/sessions") {
          return createJsonResponse(sessionPayload);
        }

        if (path === "/api/v1/personal-auths") {
          return createJsonResponse(personalAuthPayload);
        }

        if (path === "/api/v1/redeem-codes/preview") {
          return createJsonResponse({
            ...redeemCodePreviewPayload,
            data: {
              ...redeemCodePreviewPayload.data,
              redeemCodeType: "personal_standard_activation",
              resultEdition: "standard",
            },
          });
        }

        if (path === "/api/v1/redeem-codes/redeem") {
          expect(init).toMatchObject({
            method: "POST",
            headers: {
              "content-type": "application/json",
            },
            body: JSON.stringify({
              code: "ABCD2345",
              previewVersion: redeemCodePreviewPayload.data.previewVersion,
              targetPersonalAuthPublicId: null,
            }),
          });

          return createJsonResponse(
            {
              code: 409002,
              message: "Redeem code already used.",
              data: null,
            },
            409,
          );
        }

        return createJsonResponse({
          code: 404001,
          message: "missing",
          data: null,
        });
      }),
    );

    render(createElement(StudentRedeemCodePage));
    await screen.findByRole("heading", { name: "个人授权" });

    fireEvent.change(screen.getByLabelText("兑换码"), {
      target: { value: "abcd-2345" },
    });
    fireEvent.click(screen.getByRole("button", { name: "预览权益" }));
    await screen.findByRole("button", { name: "确认兑换" });
    fireEvent.click(screen.getByRole("button", { name: "确认兑换" }));
    expect(screen.getByLabelText("兑换码")).toBeDisabled();

    await waitFor(() =>
      expect(screen.getByText("该兑换码已被使用")).toBeInTheDocument(),
    );
    expect(screen.queryByTestId("redeem-code-confirmation")).toBeNull();
    expect(screen.getByRole("button", { name: "预览权益" })).toBeEnabled();
    expect(screen.queryByText("兑换成功")).toBeNull();
    expect(document.body.textContent).not.toContain("code_hash");
  });
});
