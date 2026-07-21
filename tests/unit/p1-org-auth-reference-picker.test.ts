import { createElement } from "react";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { AdminOrganizationReferencePicker } from "@/features/admin/AdminOrganizationReferencePicker/AdminOrganizationReferencePicker";
import { createAdminOrganizationOrgAuthRuntimeRouteHandlers } from "@/server/services/admin-organization-org-auth-runtime";
import { evaluateEmployeeOrgAuthQuotaPreview } from "@/server/repositories/employee-org-auth-quota-repository";
import type { SessionService } from "@/server/services/session-service";

const sessionToken = "f0110-session-token";

function jsonResponse(payload: unknown) {
  return {
    json: async () => payload,
    ok: true,
    status: 200,
  } as Response;
}

function createOrganization(publicId: string, name: string) {
  return {
    authSummary: null,
    employeeCount: 0,
    name,
    orgTier: "city" as const,
    parentOrganizationPublicId: null,
    publicId,
    revision: 1,
    status: "active" as const,
  };
}

const sessionService = {
  async login() {
    throw new Error("login should not be called");
  },
  async getCurrentSession() {
    return {
      code: 0,
      message: "ok",
      data: {
        session: { expiresAt: "2027-07-21T00:00:00.000Z" },
        user: {
          publicId: "admin-user-f0110",
          phone: "13800000001",
          name: "F0110 Admin",
          userType: null,
          status: "active" as const,
          lockedUntilAt: null,
          employeePublicId: null,
          organizationPublicId: null,
          adminPublicId: "admin-f0110",
          adminRoles: ["ops_admin" as const],
        },
      },
    };
  },
} satisfies SessionService;

function createRequiredListRepositories() {
  const pagination = {
    page: 1,
    pageSize: 20 as const,
    sortBy: "updatedAt",
    sortOrder: "desc" as const,
    total: 0,
  };

  return {
    async listEmployees() {
      return { employees: [], pagination };
    },
    async listOrgAuths() {
      return { orgAuths: [], pagination };
    },
    async listOrganizations() {
      return { organizations: [], pagination };
    },
  };
}

afterEach(() => {
  cleanup();
  localStorage.clear();
  vi.unstubAllGlobals();
  vi.clearAllMocks();
});

describe("F-0110 organization action references", () => {
  it("evaluates every covering authorization and accounts for the employee seat released by transfer", () => {
    const now = new Date("2026-07-21T12:00:00.000Z");

    expect(
      evaluateEmployeeOrgAuthQuotaPreview(
        [
          {
            accountQuota: 2,
            existingReservation: true,
            reservationCount: 2,
            startsAt: new Date("2026-07-20T00:00:00.000Z"),
          },
          {
            accountQuota: 3,
            existingReservation: false,
            reservationCount: 2,
            startsAt: new Date("2026-07-20T00:00:00.000Z"),
          },
        ],
        now,
      ),
    ).toEqual({
      activeAuthorizationCount: 2,
      availableSeatCount: 1,
      status: "available",
    });
    expect(
      evaluateEmployeeOrgAuthQuotaPreview(
        [
          {
            accountQuota: 1,
            existingReservation: false,
            reservationCount: 1,
            startsAt: new Date("2026-07-20T00:00:00.000Z"),
          },
        ],
        now,
      ).status,
    ).toBe("quota_insufficient");
  });

  it("searches and pages active organizations without treating the first page as a directory", async () => {
    localStorage.setItem("tiku.localSessionToken", sessionToken);
    const onChange = vi.fn();
    const oldTarget = createOrganization(
      "organization-public-101",
      "第 101 个合法目标",
    );
    const fetchMock = vi.fn(async (request: RequestInfo | URL) => {
      const url = new URL(String(request), "http://localhost");
      const keyword = url.searchParams.get("keyword");
      const page = Number(url.searchParams.get("page"));
      const organizations =
        keyword === oldTarget.name
          ? [oldTarget]
          : [
              createOrganization(
                `organization-public-page-${page}`,
                `第 ${page} 页组织`,
              ),
            ];

      return jsonResponse({
        code: 0,
        message: "ok",
        data: { organizations },
        pagination: {
          page,
          pageSize: 20,
          sortBy: "updatedAt",
          sortOrder: "desc",
          total: keyword === null ? 101 : 1,
        },
      });
    });
    vi.stubGlobal("fetch", fetchMock);

    render(
      createElement(AdminOrganizationReferencePicker, {
        onChange,
        searchLabel: "搜索目标组织",
        selectLabel: "目标组织",
        value: "",
      }),
    );

    expect(
      await screen.findByRole("option", { name: "第 1 页组织" }),
    ).toBeVisible();
    fireEvent.click(screen.getByRole("button", { name: "下一页" }));
    expect(
      await screen.findByRole("option", { name: "第 2 页组织" }),
    ).toBeVisible();
    fireEvent.change(screen.getByLabelText("搜索目标组织"), {
      target: { value: oldTarget.name },
    });
    expect(
      await screen.findByRole("option", { name: oldTarget.name }),
    ).toBeVisible();
    fireEvent.change(screen.getByLabelText("目标组织"), {
      target: { value: oldTarget.publicId },
    });

    expect(onChange).toHaveBeenCalledWith(oldTarget.publicId, oldTarget);
    await waitFor(() => {
      expect(
        fetchMock.mock.calls.some(([request]) => {
          const url = new URL(String(request), "http://localhost");
          return (
            url.searchParams.get("status") === "active" &&
            url.searchParams.get("page") === "1" &&
            url.searchParams.get("pageSize") === "20" &&
            url.searchParams.get("keyword") === oldTarget.name
          );
        }),
      ).toBe(true);
    });
  });

  it("returns a no-store repository-authoritative transfer preview", async () => {
    const previewEmployeeTransfer = vi.fn(async () => ({
      activeAuthorizationCount: 2,
      availableSeatCount: 3,
      employeePublicId: "employee-public-001",
      previousOrganizationPublicId: "organization-public-old",
      quotaRequired: true,
      revalidationRequired: true as const,
      status: "available" as const,
      targetOrganizationName: "目标组织",
      targetOrganizationPublicId: "organization-public-target",
    }));
    const handlers = createAdminOrganizationOrgAuthRuntimeRouteHandlers({
      repositories: {
        ...createRequiredListRepositories(),
        previewEmployeeTransfer,
      },
      sessionService,
    });
    const response = await handlers.employees.transfer.GET(
      new Request(
        "http://localhost/api/v1/employees/employee-public-001/transfer?targetOrganizationPublicId=organization-public-target",
        { headers: { authorization: `Bearer ${sessionToken}` } },
      ),
      { params: Promise.resolve({ publicId: "employee-public-001" }) },
    );

    await expect(response.json()).resolves.toMatchObject({
      code: 0,
      data: {
        activeAuthorizationCount: 2,
        availableSeatCount: 3,
        revalidationRequired: true,
        status: "available",
      },
    });
    expect(response.headers.get("cache-control")).toBe("no-store");
    expect(previewEmployeeTransfer).toHaveBeenCalledWith({
      employeePublicId: "employee-public-001",
      targetOrganizationPublicId: "organization-public-target",
    });
  });

  it("keeps POST authoritative when quota changes after an available preview", async () => {
    const handlers = createAdminOrganizationOrgAuthRuntimeRouteHandlers({
      repositories: {
        ...createRequiredListRepositories(),
        async previewEmployeeTransfer() {
          return {
            activeAuthorizationCount: 1,
            availableSeatCount: 1,
            employeePublicId: "employee-public-001",
            previousOrganizationPublicId: "organization-public-old",
            quotaRequired: true,
            revalidationRequired: true,
            status: "available",
            targetOrganizationName: "目标组织",
            targetOrganizationPublicId: "organization-public-target",
          };
        },
        async transferEmployee() {
          return {
            employeePublicId: "employee-public-001",
            targetOrganizationPublicId: "organization-public-target",
            status: "quota_insufficient",
          };
        },
      },
      sessionService,
    });
    const headers = {
      authorization: `Bearer ${sessionToken}`,
      "content-type": "application/json",
    };
    const context = {
      params: Promise.resolve({ publicId: "employee-public-001" }),
    };
    const previewResponse = await handlers.employees.transfer.GET(
      new Request(
        "http://localhost/api/v1/employees/employee-public-001/transfer?targetOrganizationPublicId=organization-public-target",
        { headers },
      ),
      context,
    );
    const transferResponse = await handlers.employees.transfer.POST(
      new Request(
        "http://localhost/api/v1/employees/employee-public-001/transfer",
        {
          body: JSON.stringify({
            targetOrganizationPublicId: "organization-public-target",
          }),
          headers,
          method: "POST",
        },
      ),
      context,
    );

    await expect(previewResponse.json()).resolves.toMatchObject({
      data: { status: "available" },
    });
    await expect(transferResponse.json()).resolves.toMatchObject({
      code: 409006,
      data: null,
    });
  });
});
