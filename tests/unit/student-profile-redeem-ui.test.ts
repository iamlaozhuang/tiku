import { createElement } from "react";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

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

function mockProfileFetch() {
  const fetchMock = vi.fn(async (url: RequestInfo | URL) => {
    const path = String(url);

    if (path === "/api/v1/sessions") {
      return createJsonResponse(sessionPayload);
    }

    if (path === "/api/v1/authorizations") {
      return createJsonResponse(authorizationPayload);
    }

    if (path === "/api/v1/personal-auths") {
      return createJsonResponse(personalAuthPayload);
    }

    return createJsonResponse({ code: 404001, message: "missing", data: null });
  });

  vi.stubGlobal("fetch", fetchMock);

  return fetchMock;
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

describe("StudentProfilePage", () => {
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
    expect(screen.getByText("13900000002")).toBeInTheDocument();
    expect(screen.getAllByText("专卖 3级").length).toBeGreaterThan(0);
    expect(screen.getAllByText("个人授权").length).toBeGreaterThan(0);
    expect(screen.getByText("高级版")).toBeInTheDocument();
    expect(screen.getByText("升级生效")).toBeInTheDocument();
    expect(screen.getByText("额度归属：个人")).toBeInTheDocument();
    expect(document.body.textContent).not.toContain("code_hash");
    expect(screen.queryByText("1")).toBeNull();
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/v1/sessions",
      expect.objectContaining({ credentials: "same-origin" }),
    );
    expect(getFirstFetchInit(fetchMock)).not.toHaveProperty("headers");
  });

  it("moves the profile view to the unauthorized state when logout is used", async () => {
    mockProfileFetch();

    render(createElement(StudentProfilePage));

    expect(await screen.findByText("Dev Student")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "退出登录" }));

    await waitFor(() =>
      expect(screen.getByRole("link", { name: "前往登录" })).toHaveAttribute(
        "href",
        "/login",
      ),
    );
  });
});

describe("StudentRedeemCodePage", () => {
  it("shows empty authorization state and keeps the submit button disabled until the code shape is valid", async () => {
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

        return createJsonResponse({
          code: 404001,
          message: "missing",
          data: null,
        });
      }),
    );

    render(createElement(StudentRedeemCodePage));

    expect(await screen.findByText("暂无个人授权记录")).toBeInTheDocument();
    expect(screen.getByText("等待卡密")).toBeInTheDocument();
    expect(screen.getByText("卡密来源：系统运营")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "兑换" })).toBeDisabled();

    fireEvent.change(screen.getByLabelText("兑换码"), {
      target: { value: "ABCD2345" },
    });

    expect(screen.getByRole("button", { name: "兑换" })).toBeEnabled();
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

        if (path === "/api/v1/redeem-codes/redeem") {
          expect(init).toMatchObject({
            method: "POST",
            headers: {
              "content-type": "application/json",
            },
            body: JSON.stringify({ code: "ABCD2345" }),
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
    fireEvent.click(screen.getByRole("button", { name: "兑换" }));

    await waitFor(() =>
      expect(screen.getByText("该兑换码已被使用")).toBeInTheDocument(),
    );
    expect(screen.queryByText("兑换成功")).toBeNull();
    expect(document.body.textContent).not.toContain("code_hash");
  });
});
