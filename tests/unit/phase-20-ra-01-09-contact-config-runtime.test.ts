import { describe, expect, it, vi } from "vitest";

import {
  createContactConfigRuntimeRouteHandlers,
  type ContactConfigRuntimeRepositories,
} from "@/server/services/contact-config-service";

const baseContactConfig = {
  publicId: "contact-config-local-purchase-guidance",
  title: "Purchase support",
  summary: "Contact Tiku operations for purchase guidance.",
  channels: [
    {
      channelType: "phone" as const,
      label: "Tiku Ops",
      value: "400-000-2026",
      serviceHours: "Workdays 09:00-18:00",
      usage: "Purchase and authorization support",
      href: "tel:4000002026",
    },
  ],
  safetyNotice: "Do not share passwords, verification codes, or raw codes.",
  updatedAt: "2026-05-24T00:00:00.000Z",
};

const updatedContactConfig = {
  ...baseContactConfig,
  title: "Updated purchase support",
  summary: "Use the verified operations channel for local purchases.",
  channels: [
    {
      channelType: "wechat_work" as const,
      label: "Ops WeCom",
      value: "tiku-ops",
      serviceHours: "Workdays 10:00-18:00",
      usage: "Purchase handoff",
      href: null,
    },
  ],
  updatedAt: "2026-05-31T09:30:00.000Z",
};

function createSessionService(
  roles: ("super_admin" | "ops_admin" | "content_admin")[],
  token = "admin-session-token",
) {
  return {
    getCurrentSession: vi.fn(
      async (input: { authorization: string | null }) => {
        expect(input.authorization).toBe(`Bearer ${token}`);

        return {
          code: 0,
          message: "ok",
          data: {
            session: {
              expiresAt: "2026-05-31T12:00:00.000Z",
            },
            user: {
              adminPublicId: "admin-public-001",
              adminRoles: roles,
              employeePublicId: null,
              lockedUntilAt: null,
              name: "Ops Admin",
              organizationPublicId: null,
              phone: "13900000001",
              publicId: "user-admin-public-001",
              status: "active" as const,
              userType: null,
            },
          },
        };
      },
    ),
  };
}

function createRepositories(): ContactConfigRuntimeRepositories {
  return {
    auditLogRepository: {
      appendAuditLog: vi.fn(async () => undefined),
    },
    contactConfigRepository: {
      getActiveContactConfig: vi.fn(async () => baseContactConfig),
      updateContactConfig: vi.fn(async () => updatedContactConfig),
    },
  };
}

function createRequest(method: "GET" | "PUT", body?: unknown) {
  return new Request("http://localhost/api/v1/contact-configs", {
    body: body === undefined ? undefined : JSON.stringify(body),
    headers: {
      authorization: "Bearer admin-session-token",
      "content-type": "application/json",
    },
    method,
  });
}

describe("phase 20 RA-01-09 contact_config runtime", () => {
  it("allows ops_admin to read and update contact_config through standard envelopes", async () => {
    const repositories = createRepositories();
    const handlers = createContactConfigRuntimeRouteHandlers({
      repositories,
      sessionService: createSessionService(["ops_admin"]),
    });

    const getResponse = await handlers.contactConfigs.GET(createRequest("GET"));
    const getPayload = await getResponse.json();

    expect(getPayload).toMatchObject({
      code: 0,
      message: "ok",
      data: {
        contactConfig: {
          publicId: "contact-config-local-purchase-guidance",
          title: "Purchase support",
        },
      },
    });

    const putResponse = await handlers.contactConfigs.PUT(
      createRequest("PUT", {
        title: "Updated purchase support",
        summary: "Use the verified operations channel for local purchases.",
        channels: updatedContactConfig.channels,
        safetyNotice: updatedContactConfig.safetyNotice,
      }),
    );
    const putPayload = await putResponse.json();

    expect(putPayload).toMatchObject({
      code: 0,
      message: "ok",
      data: {
        contactConfig: {
          publicId: "contact-config-local-purchase-guidance",
          title: "Updated purchase support",
          channels: [
            expect.objectContaining({
              channelType: "wechat_work",
              value: "tiku-ops",
            }),
          ],
        },
      },
    });
    expect(
      repositories.contactConfigRepository.updateContactConfig,
    ).toHaveBeenCalledWith({
      channels: updatedContactConfig.channels,
      safetyNotice: updatedContactConfig.safetyNotice,
      summary: "Use the verified operations channel for local purchases.",
      title: "Updated purchase support",
    });
    expect(
      repositories.auditLogRepository?.appendAuditLog,
    ).toHaveBeenCalledWith(
      expect.objectContaining({
        actionType: "contact_config.update",
        actorPublicId: "admin-public-001",
        actorRole: "ops_admin",
        metadataSummary: expect.stringContaining("redacted contact_config"),
        targetPublicId: "contact-config-local-purchase-guidance",
        targetResourceType: "contact_config",
      }),
    );
    expect(JSON.stringify(putPayload)).not.toContain("admin-session-token");
    expect(
      JSON.stringify(
        vi.mocked(repositories.auditLogRepository!.appendAuditLog).mock
          .calls[0],
      ),
    ).not.toContain("admin-session-token");
  });

  it("denies content_admin contact_config updates before repository mutation", async () => {
    const repositories = createRepositories();
    const handlers = createContactConfigRuntimeRouteHandlers({
      repositories,
      sessionService: createSessionService(["content_admin"]),
    });

    const response = await handlers.contactConfigs.PUT(
      createRequest("PUT", {
        title: "Blocked",
        summary: "Blocked",
        channels: updatedContactConfig.channels,
        safetyNotice: "Blocked",
      }),
    );
    const payload = await response.json();

    expect(payload).toEqual({
      code: 403601,
      message: "Admin permission denied.",
      data: null,
    });
    expect(
      repositories.contactConfigRepository.updateContactConfig,
    ).not.toHaveBeenCalled();
    expect(
      repositories.auditLogRepository?.appendAuditLog,
    ).not.toHaveBeenCalled();
  });
});
