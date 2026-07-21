import { createElement } from "react";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { AdminOpsManagement } from "@/features/admin/admin-ops-management/AdminOpsManagement";

type OrganizationStub = {
  authSummary: null;
  employeeCount: number;
  name: string;
  orgTier: "city";
  parentOrganizationPublicId: null;
  publicId: string;
  revision: number;
  status: "active" | "disabled";
};

function createOrganization(
  publicId: string,
  name: string,
  status: OrganizationStub["status"] = "active",
): OrganizationStub {
  return {
    authSummary: null,
    employeeCount: 0,
    name,
    orgTier: "city",
    parentOrganizationPublicId: null,
    publicId,
    revision: 1,
    status,
  };
}

function jsonResponse(payload: unknown) {
  return {
    json: async () => payload,
    ok: true,
    status: 200,
  } as Response;
}

function createDeferredResponse() {
  let resolveResponse: (response: Response) => void = () => undefined;
  const promise = new Promise<Response>((resolve) => {
    resolveResponse = resolve;
  });

  return { promise, resolveResponse };
}

const adminSessionPayload = {
  code: 0,
  message: "ok",
  data: {
    user: {
      publicId: "user-admin-picker",
      phone: "13900000001",
      name: "Ops Admin",
      userType: null,
      status: "active",
      lockedUntilAt: null,
      employeePublicId: null,
      organizationPublicId: null,
      adminPublicId: "admin-picker-public-001",
      adminRoles: ["ops_admin"],
    },
    session: { expiresAt: "2026-07-22T04:00:00.000Z" },
  },
};

function createOrganizationResponse(
  organizations: OrganizationStub[],
  page = 1,
  total = organizations.length,
) {
  return jsonResponse({
    code: 0,
    message: "ok",
    data: { organizations },
    pagination: {
      page,
      pageSize: 20,
      sortBy: "name",
      sortOrder: "asc",
      total,
    },
  });
}

function createBaseFetch(
  handleActiveOrganizationRequest: (url: URL) => Response | Promise<Response>,
) {
  const fetchMock = vi.fn(
    async (...[request]: [RequestInfo | URL, RequestInit?]) => {
      const path = String(request);

      if (path === "/api/v1/sessions") {
        return jsonResponse(adminSessionPayload);
      }

      if (path.startsWith("/api/v1/users")) {
        return jsonResponse({
          code: 0,
          message: "ok",
          data: { users: [] },
          pagination: {
            page: 1,
            pageSize: 20,
            sortBy: "updatedAt",
            sortOrder: "desc",
            total: 0,
          },
        });
      }

      if (path.startsWith("/api/v1/admin-accounts")) {
        return jsonResponse({
          code: 0,
          message: "ok",
          data: { adminAccounts: [] },
          pagination: {
            page: 1,
            pageSize: 20,
            sortBy: "registeredAt",
            sortOrder: "desc",
            total: 0,
          },
        });
      }

      if (path.startsWith("/api/v1/organizations")) {
        const url = new URL(path, "http://localhost");

        if (url.searchParams.get("status") === "active") {
          return handleActiveOrganizationRequest(url);
        }

        return createOrganizationResponse([
          createOrganization(
            "organization-disabled-001",
            "停用组织",
            "disabled",
          ),
        ]);
      }

      throw new Error(`Unexpected request: ${path}`);
    },
  );

  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

async function openOrganizationAdminCreator(sessionToken: string) {
  localStorage.setItem("tiku.localSessionToken", sessionToken);
  render(createElement(AdminOpsManagement));
  await screen.findByRole("heading", { level: 1, name: "用户管理" });
  fireEvent.click(screen.getByRole("tab", { name: "后台账号" }));
  fireEvent.click(screen.getByRole("button", { name: "创建后台账号" }));
  return screen.getByRole("region", { name: "后台账号创建" });
}

afterEach(() => {
  cleanup();
  localStorage.clear();
  window.history.replaceState(null, "", "/");
  vi.unstubAllGlobals();
  vi.clearAllMocks();
});

describe("F-0046 admin organization picker", () => {
  it("finds an active organization beyond the old first-100 snapshot and requires explicit selection", async () => {
    const olderTarget = createOrganization(
      "organization-older-target",
      "第 101 个合法组织",
    );
    const fetchMock = createBaseFetch((url) => {
      const keyword = url.searchParams.get("keyword");

      return createOrganizationResponse(
        keyword === "第 101 个合法组织"
          ? [olderTarget]
          : [createOrganization("organization-active-001", "当前活跃组织")],
        Number(url.searchParams.get("page") ?? "1"),
        keyword === null ? 101 : 1,
      );
    });

    const creator = await openOrganizationAdminCreator(
      "unit-test-admin-organization-picker-search",
    );
    const organizationSelect =
      await within(creator).findByLabelText("后台账号绑定组织");

    expect(organizationSelect).toHaveValue("");
    expect(within(organizationSelect).queryByText("停用组织")).toBeNull();
    expect(
      within(creator).getByRole("button", { name: "创建账号" }),
    ).toBeDisabled();

    fireEvent.click(within(creator).getByRole("button", { name: "下一页" }));
    await waitFor(() => {
      expect(
        fetchMock.mock.calls.some(([request]) => {
          const url = new URL(String(request), "http://localhost");

          return (
            url.pathname === "/api/v1/organizations" &&
            url.searchParams.get("status") === "active" &&
            url.searchParams.get("page") === "2"
          );
        }),
      ).toBe(true);
    });

    fireEvent.change(within(creator).getByLabelText("搜索可绑定组织"), {
      target: { value: "第 101 个合法组织" },
    });

    await within(organizationSelect).findByText("第 101 个合法组织");
    expect(
      fetchMock.mock.calls.some(([request]) => {
        const url = new URL(String(request), "http://localhost");

        return (
          url.pathname === "/api/v1/organizations" &&
          url.searchParams.get("status") === "active" &&
          url.searchParams.get("keyword") === "第 101 个合法组织" &&
          url.searchParams.get("page") === "1" &&
          url.searchParams.get("pageSize") === "20"
        );
      }),
    ).toBe(true);

    fireEvent.change(organizationSelect, {
      target: { value: olderTarget.publicId },
    });
    fireEvent.change(within(creator).getByLabelText("手机号"), {
      target: { value: "13900000002" },
    });
    fireEvent.change(within(creator).getByLabelText("姓名"), {
      target: { value: "目标管理员" },
    });
    fireEvent.change(within(creator).getByLabelText("初始密码"), {
      target: { value: "SecureA123" },
    });
    expect(
      within(creator).getByRole("button", { name: "创建账号" }),
    ).toBeEnabled();
  });

  it("keeps the newest rapid-search result when an older request resolves last", async () => {
    const slowResponse = createDeferredResponse();
    const fastResponse = createDeferredResponse();
    const fetchMock = createBaseFetch((url) => {
      const keyword = url.searchParams.get("keyword");

      if (keyword === "慢查询") {
        return slowResponse.promise;
      }

      if (keyword === "快查询") {
        return fastResponse.promise;
      }

      return createOrganizationResponse([]);
    });

    const creator = await openOrganizationAdminCreator(
      "unit-test-admin-organization-picker-race",
    );
    const searchInput = within(creator).getByLabelText("搜索可绑定组织");

    fireEvent.change(searchInput, { target: { value: "慢查询" } });
    await waitFor(() => {
      expect(
        fetchMock.mock.calls.some(([request]) =>
          String(request).includes("keyword=%E6%85%A2%E6%9F%A5%E8%AF%A2"),
        ),
      ).toBe(true);
    });
    fireEvent.change(searchInput, { target: { value: "快查询" } });
    await waitFor(() => {
      expect(
        fetchMock.mock.calls.some(([request]) =>
          String(request).includes("keyword=%E5%BF%AB%E6%9F%A5%E8%AF%A2"),
        ),
      ).toBe(true);
    });

    fastResponse.resolveResponse(
      createOrganizationResponse([
        createOrganization("organization-fast", "快查询组织"),
      ]),
    );
    await screen.findByRole("option", { name: "快查询组织" });

    slowResponse.resolveResponse(
      createOrganizationResponse([
        createOrganization("organization-slow", "过期慢查询组织"),
      ]),
    );
    await waitFor(() => {
      expect(
        screen.getByRole("option", { name: "快查询组织" }),
      ).toBeInTheDocument();
      expect(
        screen.queryByRole("option", { name: "过期慢查询组织" }),
      ).toBeNull();
    });
  });

  it("shows explicit empty and recoverable error states", async () => {
    let errorAttempts = 0;
    createBaseFetch((url) => {
      const keyword = url.searchParams.get("keyword");

      if (keyword === "无结果") {
        return createOrganizationResponse([]);
      }

      if (keyword === "临时失败") {
        errorAttempts += 1;
        return errorAttempts === 1
          ? jsonResponse({ code: 503604, message: "unavailable", data: null })
          : createOrganizationResponse([
              createOrganization("organization-recovered", "恢复后的组织"),
            ]);
      }

      return createOrganizationResponse([]);
    });

    const creator = await openOrganizationAdminCreator(
      "unit-test-admin-organization-picker-states",
    );
    const searchInput = within(creator).getByLabelText("搜索可绑定组织");

    fireEvent.change(searchInput, { target: { value: "无结果" } });
    expect(
      await within(creator).findByText("没有匹配的可绑定组织"),
    ).toBeInTheDocument();

    fireEvent.change(searchInput, { target: { value: "临时失败" } });
    expect(
      await within(creator).findByText("可绑定组织加载失败"),
    ).toBeInTheDocument();
    fireEvent.click(
      within(creator).getByRole("button", { name: "重试加载组织" }),
    );
    expect(
      await within(creator).findByRole("option", { name: "恢复后的组织" }),
    ).toBeInTheDocument();
  });
});
