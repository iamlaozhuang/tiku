import { describe, expect, it, vi } from "vitest";

import {
  createContactConfigRuntimeRouteHandlers,
  type ContactConfigRuntimeRepositories,
} from "@/server/services/contact-config-service";
import {
  COOKIE_BACKED_SESSION_AUTHORIZATION,
  SESSION_COOKIE_NAME,
} from "@/server/auth/session-cookie";

const baseContactConfig = {
  publicId: "contact-config-local-purchase-guidance",
  revision: 1,
  title: "Purchase support",
  summary: "Contact Tiku operations for purchase guidance.",
  channels: [
    {
      channelType: "phone" as const,
      isEnabled: true,
      label: "Tiku Ops",
      qrImageUrl: null,
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
  revision: 2,
  title: "Updated purchase support",
  summary: "Use the verified operations channel for local purchases.",
  channels: [
    {
      channelType: "wechat_work" as const,
      isEnabled: true,
      label: "Ops WeCom",
      qrImageUrl: "/api/v1/contact-configs/qr-images/contact-config-qr-001",
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
  sessionValue = "admin-session-marker",
) {
  return {
    getCurrentSession: vi.fn(
      async (input: { authorization: string | null }) => {
        expect(input.authorization).toBe(`Bearer ${sessionValue}`);

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
  let qrImageRecord:
    | {
        bytes: Uint8Array;
        contentType: "image/jpeg" | "image/png" | "image/webp";
        publicId: string;
      }
    | undefined;

  return {
    contactConfigRepository: {
      createQrImage: vi.fn(async (input) => {
        qrImageRecord = {
          bytes: input.bytes,
          contentType: input.contentType,
          publicId: input.publicId,
        };
        return qrImageRecord;
      }),
      getActiveContactConfig: vi.fn(async () => baseContactConfig),
      getQrImage: vi.fn(async () => qrImageRecord ?? null),
      updateContactConfig: vi.fn(async () => ({
        status: "updated" as const,
        contactConfig: updatedContactConfig,
      })),
    },
  };
}

function createRequest(method: "GET" | "PUT", body?: unknown) {
  return new Request("http://localhost/api/v1/contact-configs", {
    body: body === undefined ? undefined : JSON.stringify(body),
    headers: {
      authorization: "Bearer admin-session-marker",
      "content-type": "application/json",
    },
    method,
  });
}

function createQrUploadRequest(fileType = "image/png") {
  const formData = new FormData();

  formData.append(
    "file",
    new Blob(["local qr placeholder"], { type: fileType }),
    "contact-qr.png",
  );

  return new Request("http://localhost/api/v1/contact-configs/qr-images", {
    body: formData,
    headers: {
      authorization: "Bearer admin-session-marker",
    },
    method: "POST",
  });
}

function createCookieBackedRequest(method: "GET" | "PUT", body?: unknown) {
  return new Request("http://localhost/api/v1/contact-configs", {
    body: body === undefined ? undefined : JSON.stringify(body),
    headers: {
      authorization: COOKIE_BACKED_SESSION_AUTHORIZATION,
      cookie: `${SESSION_COOKIE_NAME}=admin-session-marker`,
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
        expectedRevision: 1,
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
    ).toHaveBeenCalledWith(
      expect.objectContaining({
        actor: expect.objectContaining({
          publicId: "admin-public-001",
          role: "ops_admin",
        }),
        contactConfig: {
          channels: [
            expect.objectContaining({
              channelType: "wechat_work",
              isEnabled: true,
              qrImageUrl:
                "/api/v1/contact-configs/qr-images/contact-config-qr-001",
            }),
          ],
          expectedRevision: 1,
          safetyNotice: updatedContactConfig.safetyNotice,
          summary: "Use the verified operations channel for local purchases.",
          title: "Updated purchase support",
        },
      }),
    );
    expect(JSON.stringify(putPayload)).not.toContain("admin-session-marker");
    expect(
      JSON.stringify(
        vi.mocked(repositories.contactConfigRepository.updateContactConfig).mock
          .calls[0],
      ),
    ).not.toContain("admin-session-marker");
  });

  it("denies content_admin contact_config updates before repository mutation", async () => {
    const repositories = createRepositories();
    const handlers = createContactConfigRuntimeRouteHandlers({
      repositories,
      sessionService: createSessionService(["content_admin"]),
    });

    const response = await handlers.contactConfigs.PUT(
      createRequest("PUT", {
        expectedRevision: 1,
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
  });

  it("allows ops_admin QR image upload and denies content_admin before storing", async () => {
    const repositories = createRepositories();
    const handlers = createContactConfigRuntimeRouteHandlers({
      repositories,
      sessionService: createSessionService(["ops_admin"]),
    });

    const uploadResponse = await handlers.contactConfigQrImages.POST(
      createQrUploadRequest(),
    );
    const uploadPayload = await uploadResponse.json();

    expect(uploadPayload).toMatchObject({
      code: 0,
      message: "ok",
      data: {
        qrImage: {
          contentType: "image/png",
          qrImageUrl: expect.stringMatching(
            /^\/api\/v1\/contact-configs\/qr-images\/contact-config-qr-/u,
          ),
        },
      },
    });
    expect(JSON.stringify(uploadPayload)).not.toContain("admin-session-marker");
    expect(
      repositories.contactConfigRepository.createQrImage,
    ).toHaveBeenCalledWith(
      expect.objectContaining({
        actor: expect.objectContaining({ role: "ops_admin" }),
        contentType: "image/png",
      }),
    );

    const qrImagePublicId = String(uploadPayload.data.qrImage.publicId);
    const qrImageResponse = await handlers.contactConfigQrImages.GET(
      new Request(
        `http://localhost/api/v1/contact-configs/qr-images/${qrImagePublicId}`,
      ),
      { params: Promise.resolve({ publicId: qrImagePublicId }) },
    );

    expect(qrImageResponse.headers.get("content-type")).toBe("image/png");
    expect(qrImageResponse.headers.get("cache-control")).toBe("no-store");
    expect((await qrImageResponse.arrayBuffer()).byteLength).toBeGreaterThan(0);

    const deniedHandlers = createContactConfigRuntimeRouteHandlers({
      repositories,
      sessionService: createSessionService(["content_admin"]),
    });
    const deniedResponse = await deniedHandlers.contactConfigQrImages.POST(
      createQrUploadRequest(),
    );

    expect(await deniedResponse.json()).toEqual({
      code: 403601,
      message: "Admin permission denied.",
      data: null,
    });
  });

  it("accepts cookie-backed admin marker for browser runtime reads and updates", async () => {
    const repositories = createRepositories();
    const sessionService = createSessionService(["super_admin"]);
    const handlers = createContactConfigRuntimeRouteHandlers({
      repositories,
      sessionService,
    });

    const getResponse = await handlers.contactConfigs.GET(
      createCookieBackedRequest("GET"),
    );
    const getPayload = await getResponse.json();

    expect(getPayload).toMatchObject({
      code: 0,
      data: {
        contactConfig: {
          publicId: "contact-config-local-purchase-guidance",
        },
      },
    });

    const putResponse = await handlers.contactConfigs.PUT(
      createCookieBackedRequest("PUT", {
        expectedRevision: 1,
        title: "Updated purchase support",
        summary: "Use the verified operations channel for local purchases.",
        channels: updatedContactConfig.channels,
        safetyNotice: updatedContactConfig.safetyNotice,
      }),
    );
    const putPayload = await putResponse.json();

    expect(putPayload).toMatchObject({
      code: 0,
      data: {
        contactConfig: {
          title: "Updated purchase support",
        },
      },
    });
    expect(sessionService.getCurrentSession).toHaveBeenCalledWith({
      authorization: "Bearer admin-session-marker",
    });
  });

  it("serves the same repository-backed purchase guidance without admin auth", async () => {
    const repositories = createRepositories();
    const sessionService = createSessionService(["content_admin"]);
    const handlers = createContactConfigRuntimeRouteHandlers({
      repositories,
      sessionService,
    });

    const response = await handlers.purchaseGuidance.GET();

    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({
      code: 0,
      data: {
        contactConfig: {
          publicId: baseContactConfig.publicId,
          revision: 1,
        },
      },
    });
    expect(sessionService.getCurrentSession).not.toHaveBeenCalled();
  });

  it("fails stale revisions closed without returning a successful update", async () => {
    const repositories = createRepositories();
    repositories.contactConfigRepository.updateContactConfig = vi.fn(
      async () => ({ status: "conflict" as const }),
    );
    const handlers = createContactConfigRuntimeRouteHandlers({
      repositories,
      sessionService: createSessionService(["ops_admin"]),
    });

    const response = await handlers.contactConfigs.PUT(
      createRequest("PUT", {
        channels: updatedContactConfig.channels,
        expectedRevision: 1,
        safetyNotice: updatedContactConfig.safetyNotice,
        summary: updatedContactConfig.summary,
        title: updatedContactConfig.title,
      }),
    );

    expect(response.status).toBe(409);
    expect(await response.json()).toEqual({
      code: 409034,
      message:
        "Contact config was changed by another administrator. Reload and retry.",
      data: null,
    });
  });
});
