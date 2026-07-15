import { describe, expect, it } from "vitest";

import {
  createOrgAuthRouteHandlers,
  createOrganizationRouteHandlers,
} from "./organization-auth-route";
import type { OrganizationAuthService } from "./organization-auth-service";

function createService(): OrganizationAuthService {
  return {
    async createOrganization() {
      return {
        code: 0,
        message: "ok",
        data: {
          organization: {
            publicId: "org_public_123",
            name: "杭州烟草",
            orgTier: "city",
            parentOrganizationPublicId: null,
            status: "active",
            contactName: null,
            contactPhone: null,
            remark: null,
            revision: 1,
            createdAt: "2026-05-18T04:00:00.000Z",
            updatedAt: "2026-05-18T04:00:00.000Z",
          },
        },
      };
    },
    async updateOrganization(publicId) {
      return {
        code: 0,
        message: "ok",
        data: {
          organization: {
            publicId,
            name: "杭州烟草",
            orgTier: "city",
            parentOrganizationPublicId: null,
            status: "active",
            contactName: null,
            contactPhone: null,
            remark: null,
            revision: 2,
            createdAt: "2026-05-18T04:00:00.000Z",
            updatedAt: "2026-05-18T04:00:00.000Z",
          },
        },
      };
    },
    async disableOrganization(publicId) {
      return {
        code: 0,
        message: "ok",
        data: {
          organization: {
            publicId,
            name: "杭州烟草",
            orgTier: "city",
            parentOrganizationPublicId: null,
            status: "disabled",
            contactName: null,
            contactPhone: null,
            remark: null,
            revision: 2,
            createdAt: "2026-05-18T04:00:00.000Z",
            updatedAt: "2026-05-18T04:00:00.000Z",
          },
          affectedOrganizationPublicIds: [publicId],
        },
      };
    },
    async createOrgAuth() {
      const orgAuth = {
        publicId: "org_auth_public_123",
        name: "2026 杭州授权",
        purchaserOrganizationPublicId: "org_purchaser_123",
        authScopeType: "specified_nodes" as const,
        profession: "monopoly" as const,
        level: 3,
        accountQuota: 100,
        usedQuota: 0,
        startsAt: "2026-05-18T04:00:00.000Z",
        expiresAt: "2027-05-18T04:00:00.000Z",
        status: "active" as const,
        cancelledAt: null,
        organizationPublicIds: ["org_city_123"],
        createdAt: "2026-05-18T04:00:00.000Z",
        updatedAt: "2026-05-18T04:00:00.000Z",
      };

      return {
        code: 0,
        message: "ok",
        data: {
          orgAuth,
          orgAuths: [orgAuth],
        },
      };
    },
    async cancelOrgAuth(publicId) {
      const orgAuth = {
        publicId,
        name: "2026 杭州授权",
        purchaserOrganizationPublicId: "org_purchaser_123",
        authScopeType: "specified_nodes" as const,
        profession: "monopoly" as const,
        level: 3,
        accountQuota: 100,
        usedQuota: 0,
        startsAt: "2026-05-18T04:00:00.000Z",
        expiresAt: "2027-05-18T04:00:00.000Z",
        status: "cancelled" as const,
        cancelledAt: "2026-05-18T04:00:00.000Z",
        organizationPublicIds: ["org_city_123"],
        createdAt: "2026-05-18T04:00:00.000Z",
        updatedAt: "2026-05-18T04:00:00.000Z",
      };

      return {
        code: 0,
        message: "ok",
        data: {
          orgAuth,
          orgAuths: [orgAuth],
        },
      };
    },
  };
}

describe("organization route handlers", () => {
  it("returns standard organization responses", async () => {
    const handlers = createOrganizationRouteHandlers(createService());

    await expect(
      handlers
        .POST(
          new Request("http://localhost/api/v1/organizations", {
            method: "POST",
            body: JSON.stringify({
              name: "杭州烟草",
              orgTier: "city",
            }),
          }),
        )
        .then((response) => response.json()),
    ).resolves.toMatchObject({
      code: 0,
      data: {
        organization: {
          publicId: "org_public_123",
        },
      },
    });

    await expect(
      handlers
        .PATCH(
          new Request("http://localhost/api/v1/organizations/org_public_123", {
            method: "PATCH",
            body: JSON.stringify({
              name: "杭州烟草",
              orgTier: "city",
              status: "active",
            }),
          }),
          {
            params: Promise.resolve({
              publicId: "org_public_123",
            }),
          },
        )
        .then((response) => response.json()),
    ).resolves.toMatchObject({
      code: 0,
      data: {
        organization: {
          publicId: "org_public_123",
        },
      },
    });

    await expect(
      handlers.disable
        .POST(
          new Request(
            "http://localhost/api/v1/organizations/org_public_123/disable",
            {
              method: "POST",
              body: JSON.stringify({
                isCascade: true,
              }),
            },
          ),
          {
            params: Promise.resolve({
              publicId: "org_public_123",
            }),
          },
        )
        .then((response) => response.json()),
    ).resolves.toMatchObject({
      code: 0,
      data: {
        affectedOrganizationPublicIds: ["org_public_123"],
      },
    });
  });
});

describe("org auth route handlers", () => {
  it("returns standard org auth create and cancel responses", async () => {
    const handlers = createOrgAuthRouteHandlers(createService());

    await expect(
      handlers
        .POST(
          new Request("http://localhost/api/v1/org-auths", {
            method: "POST",
            body: JSON.stringify({
              name: "2026 杭州授权",
              purchaserOrganizationPublicId: "org_purchaser_123",
              authScopeType: "specified_nodes",
              profession: "monopoly",
              level: 3,
              accountQuota: 100,
              startsAt: "2026-05-18T04:00:00.000Z",
              expiresAt: "2027-05-18T04:00:00.000Z",
              organizationPublicIds: ["org_city_123"],
            }),
          }),
        )
        .then((response) => response.json()),
    ).resolves.toMatchObject({
      code: 0,
      data: {
        orgAuth: {
          publicId: "org_auth_public_123",
        },
      },
    });

    await expect(
      handlers.cancel
        .POST(
          new Request(
            "http://localhost/api/v1/org-auths/org_auth_public_123/cancel",
            {
              method: "POST",
            },
          ),
          {
            params: Promise.resolve({
              publicId: "org_auth_public_123",
            }),
          },
        )
        .then((response) => response.json()),
    ).resolves.toMatchObject({
      code: 0,
      data: {
        orgAuth: {
          publicId: "org_auth_public_123",
          status: "cancelled",
        },
      },
    });
  });
});
