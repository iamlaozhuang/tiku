import { createElement } from "react";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { AdminRedeemCodePage } from "@/features/admin/org-auth-redeem/AdminOrgAuthRedeemPage";
import { StudentRedeemCodePage } from "@/features/student/profile/StudentProfileRedeemPage";
import { createContactConfigService } from "@/server/services/contact-config-service";

const studentSessionPayload = {
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

const adminSessionPayload = {
  code: 0,
  message: "ok",
  data: {
    user: {
      publicId: "user-dev-admin",
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

const redeemCodePayload = {
  code: 0,
  message: "ok",
  data: {
    redeemCodes: [
      {
        publicId: "redeem-code-public-001",
        codeDisplay: "RC-2026-****",
        canViewPlainText: false,
        profession: "monopoly",
        level: 3,
        status: "unused",
        redeemedUserPublicId: null,
        redeemDeadlineAt: "2026-06-24T15:59:59.999Z",
        createdAt: "2026-05-22T00:00:00.000Z",
      },
    ],
  },
  pagination: {
    page: 1,
    pageSize: 20,
    total: 1,
    sortBy: "createdAt",
    sortOrder: "desc",
  },
};

function createJsonResponse(payload: unknown, status = 200) {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => payload,
  };
}

afterEach(() => {
  cleanup();
  localStorage.clear();
  vi.unstubAllGlobals();
  vi.clearAllMocks();
});

describe("phase 11 contact_config purchase guidance loop", () => {
  it("returns standard-envelope durable purchase guidance without secret or private fields", async () => {
    const contactConfig = {
      publicId: "contact-config-purchase-guidance",
      revision: 1,
      title: "购买支持",
      summary: "请联系 Tiku 运营支持获取购买方式与开通流程。",
      channels: [
        {
          channelType: "phone" as const,
          isEnabled: true,
          label: "Tiku 运营支持",
          qrImageUrl: null,
          value: "400-000-2026",
          serviceHours: "工作日 09:00-18:00",
          usage: "购买咨询",
          href: "tel:4000002026",
        },
      ],
      safetyNotice: "请勿提供密码、验证码或卡密明文。",
      updatedAt: "2026-05-24T00:00:00.000Z",
    };
    const response = await createContactConfigService({
      createQrImage: vi.fn(),
      getActiveContactConfig: vi.fn(async () => contactConfig),
      getQrImage: vi.fn(),
      updateContactConfig: vi.fn(),
    }).getPurchaseGuidance();

    expect(response).toMatchObject({
      code: 0,
      message: "ok",
      data: {
        contactConfig: {
          publicId: "contact-config-purchase-guidance",
          title: "购买支持",
          channels: [
            expect.objectContaining({
              channelType: "phone",
              isEnabled: true,
              label: "Tiku 运营支持",
              qrImageUrl: null,
              value: "400-000-2026",
            }),
          ],
        },
      },
    });
    expect(JSON.stringify(response)).not.toContain("secret");
    expect(JSON.stringify(response)).not.toContain("Authorization");
    expect(JSON.stringify(response)).not.toContain("raw");
  });

  it("shows students purchase guidance when no personal authorization is available", async () => {
    localStorage.setItem("tiku.localSessionToken", "unit-test-student-token");
    vi.stubGlobal(
      "fetch",
      vi.fn(async (url: RequestInfo | URL) => {
        const path = String(url);

        if (path === "/api/v1/sessions") {
          return createJsonResponse(studentSessionPayload);
        }

        if (path === "/api/v1/personal-auths") {
          return createJsonResponse({
            code: 0,
            message: "ok",
            data: { personalAuths: [] },
          });
        }

        if (path === "/api/v1/contact-configs/purchase-guidance") {
          return createJsonResponse({
            code: 0,
            message: "ok",
            data: {
              contactConfig: {
                publicId: "contact-config-purchase-guidance",
                revision: 1,
                title: "购买支持",
                summary: "请联系 Tiku 运营支持获取购买方式与开通流程。",
                channels: [
                  {
                    channelType: "phone",
                    isEnabled: true,
                    label: "Tiku 运营支持",
                    qrImageUrl: null,
                    value: "400-000-2026",
                    serviceHours: "工作日 09:00-18:00",
                    usage: "购买咨询",
                    href: "tel:4000002026",
                  },
                ],
                safetyNotice: "请勿提供密码、验证码或卡密明文。",
                updatedAt: "2026-05-24T00:00:00.000Z",
              },
            },
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

    const guidance = await screen.findByTestId(
      "student-purchase-guidance-contact-config",
    );
    await screen.findByText("Tiku 运营支持");

    expect(guidance).toHaveTextContent("购买支持");
    expect(guidance).toHaveTextContent("Tiku 运营支持");
    expect(guidance).toHaveTextContent("400-000-2026");
    expect(document.body.textContent).not.toContain("unit-test-student-token");
  });

  it("keeps purchase guidance out of the redeem code management surface", async () => {
    localStorage.setItem("tiku.localSessionToken", "unit-test-admin-token");
    vi.stubGlobal(
      "fetch",
      vi.fn(async (url: RequestInfo | URL) => {
        const path = String(url);

        if (path === "/api/v1/sessions") {
          return createJsonResponse(adminSessionPayload);
        }

        if (path.startsWith("/api/v1/redeem-codes?")) {
          return createJsonResponse(redeemCodePayload);
        }

        return createJsonResponse({
          code: 404001,
          message: "missing",
          data: null,
        });
      }),
    );

    render(createElement(AdminRedeemCodePage));

    await screen.findByRole("heading", { name: "卡密管理" });
    expect(
      screen.queryByTestId("system-ops-purchase-guidance-contact-config"),
    ).not.toBeInTheDocument();
    expect(screen.queryByText("购买支持")).not.toBeInTheDocument();
    expect(document.body.textContent).not.toContain("unit-test-admin-token");
  });
});
