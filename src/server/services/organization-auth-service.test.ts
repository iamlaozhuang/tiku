import { describe, expect, it } from "vitest";

import { createOrganizationAuthService } from "./organization-auth-service";
import type {
  OrgAuthAccessRow,
  OrganizationAccessRow,
  OrganizationAuthRepository,
} from "../repositories/organization-auth-repository";

const createdAt = new Date("2026-05-18T04:00:00.000Z");
const startsAt = new Date("2026-05-18T04:00:00.000Z");
const expiresAt = new Date("2027-05-18T04:00:00.000Z");

function createOrganization(
  overrides: Partial<OrganizationAccessRow> = {},
): OrganizationAccessRow {
  return {
    id: 101,
    public_id: "org_public_123",
    name: "杭州烟草",
    org_tier: "city",
    parent_organization_public_id: "org_parent_123",
    status: "active",
    contact_name: null,
    contact_phone: "13800000000",
    remark: null,
    depth: 2,
    created_at: createdAt,
    updated_at: createdAt,
    ...overrides,
  };
}

function createOrgAuth(
  overrides: Partial<OrgAuthAccessRow> = {},
): OrgAuthAccessRow {
  return {
    id: 201,
    public_id: "org_auth_public_123",
    name: "2026 杭州授权",
    purchaser_organization_public_id: "org_purchaser_123",
    auth_scope_type: "specified_nodes",
    profession: "monopoly",
    level: 3,
    account_quota: 100,
    used_quota: 0,
    starts_at: startsAt,
    expires_at: expiresAt,
    status: "active",
    cancelled_at: null,
    organization_public_ids: ["org_city_123"],
    created_at: createdAt,
    updated_at: createdAt,
    ...overrides,
  };
}

function createRepository(
  overrides: Partial<OrganizationAuthRepository> = {},
): OrganizationAuthRepository {
  return {
    async findOrganizationByPublicId(publicId) {
      return createOrganization({
        public_id: publicId,
      });
    },
    async getOrganizationDepth() {
      return 1;
    },
    async isOrganizationDescendant() {
      return false;
    },
    async createOrganization(input) {
      return createOrganization({
        name: input.name,
        org_tier: input.orgTier,
        parent_organization_public_id: input.parentOrganizationPublicId,
        contact_name: input.contactName,
        contact_phone: input.contactPhone,
        remark: input.remark,
      });
    },
    async updateOrganization(input) {
      return createOrganization({
        public_id: input.publicId,
        name: input.name,
        org_tier: input.orgTier,
        parent_organization_public_id: input.parentOrganizationPublicId,
        status: input.status,
        contact_name: input.contactName,
        contact_phone: input.contactPhone,
        remark: input.remark,
      });
    },
    async disableOrganization(input) {
      return {
        organization: createOrganization({
          public_id: input.publicId,
          status: "disabled",
        }),
        affectedOrganizationPublicIds: input.isCascade
          ? [input.publicId, "org_child_456"]
          : [input.publicId],
      };
    },
    async hasOverlappingOrgAuth() {
      return false;
    },
    async createOrgAuth(input) {
      return createOrgAuth({
        name: input.name,
        purchaser_organization_public_id: input.purchaserOrganizationPublicId,
        auth_scope_type: input.authScopeType,
        profession: input.profession,
        level: input.level,
        account_quota: input.accountQuota,
        starts_at: input.startsAt,
        expires_at: input.expiresAt,
        organization_public_ids: input.organizationPublicIds,
      });
    },
    async cancelOrgAuth(publicId) {
      return createOrgAuth({
        public_id: publicId,
        status: "cancelled",
        cancelled_at: createdAt,
      });
    },
    ...overrides,
  };
}

describe("organization auth service", () => {
  it("creates organization and rejects fifth-level organization depth", async () => {
    const service = createOrganizationAuthService(createRepository());

    await expect(
      service.createOrganization({
        name: "杭州烟草",
        orgTier: "city",
        parentOrganizationPublicId: "org_parent_123",
        contactPhone: "13800000000",
      }),
    ).resolves.toMatchObject({
      code: 0,
      data: {
        organization: {
          publicId: "org_public_123",
          parentOrganizationPublicId: "org_parent_123",
          orgTier: "city",
        },
      },
    });

    const blockedService = createOrganizationAuthService(
      createRepository({
        async getOrganizationDepth() {
          return 4;
        },
      }),
    );

    await expect(
      blockedService.createOrganization({
        name: "基层站",
        orgTier: "station",
        parentOrganizationPublicId: "org_level_4",
      }),
    ).resolves.toEqual({
      code: 409003,
      message: "Organization tree depth cannot exceed 4 levels.",
      data: null,
    });
  });

  it("rejects circular parent update and disables organization with cascade metadata", async () => {
    const circularService = createOrganizationAuthService(
      createRepository({
        async isOrganizationDescendant() {
          return true;
        },
      }),
    );

    await expect(
      circularService.updateOrganization("org_parent_123", {
        name: "父节点",
        orgTier: "city",
        parentOrganizationPublicId: "org_child_456",
        status: "active",
      }),
    ).resolves.toEqual({
      code: 409004,
      message: "Organization parent cannot create a cycle.",
      data: null,
    });

    const service = createOrganizationAuthService(createRepository());

    await expect(
      service.disableOrganization("org_public_123", {
        isCascade: true,
      }),
    ).resolves.toMatchObject({
      code: 0,
      data: {
        affectedOrganizationPublicIds: ["org_public_123", "org_child_456"],
        organization: {
          publicId: "org_public_123",
          status: "disabled",
        },
      },
    });
  });

  it("creates org auth, rejects overlapping scope, and cancels org auth", async () => {
    const service = createOrganizationAuthService(createRepository());

    await expect(
      service.createOrgAuth({
        name: "2026 杭州授权",
        purchaserOrganizationPublicId: "org_purchaser_123",
        authScopeType: "specified_nodes",
        edition: "standard",
        profession: "monopoly",
        level: 3,
        accountQuota: 100,
        startsAt: "2026-05-18T04:00:00.000Z",
        expiresAt: "2027-05-18T04:00:00.000Z",
        organizationPublicIds: ["org_city_123"],
      }),
    ).resolves.toMatchObject({
      code: 0,
      data: {
        orgAuth: {
          publicId: "org_auth_public_123",
          authScopeType: "specified_nodes",
          organizationPublicIds: ["org_city_123"],
        },
      },
    });

    const overlapService = createOrganizationAuthService(
      createRepository({
        async hasOverlappingOrgAuth() {
          return true;
        },
      }),
    );

    await expect(
      overlapService.createOrgAuth({
        name: "2026 杭州授权",
        purchaserOrganizationPublicId: "org_purchaser_123",
        authScopeType: "specified_nodes",
        edition: "standard",
        profession: "monopoly",
        level: 3,
        accountQuota: 100,
        startsAt: "2026-05-18T04:00:00.000Z",
        expiresAt: "2027-05-18T04:00:00.000Z",
        organizationPublicIds: ["org_city_123"],
      }),
    ).resolves.toEqual({
      code: 409005,
      message: "Org auth scope overlaps an existing active authorization.",
      data: null,
    });

    await expect(
      service.cancelOrgAuth("org_auth_public_123"),
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

  it("creates a multi-scope org auth package only after every atom passes overlap checks", async () => {
    const overlapChecks: { profession: string; level: number }[] = [];
    const createInputs: { profession: string; level: number }[] = [];
    const service = createOrganizationAuthService(
      createRepository({
        async hasOverlappingOrgAuth(input) {
          overlapChecks.push({
            profession: input.profession,
            level: input.level,
          });

          return false;
        },
        async createOrgAuth(input) {
          createInputs.push({
            profession: input.profession,
            level: input.level,
          });

          return createOrgAuth({
            public_id: `org_auth_${input.profession}_${input.level}`,
            name: input.name,
            purchaser_organization_public_id:
              input.purchaserOrganizationPublicId,
            auth_scope_type: input.authScopeType,
            profession: input.profession,
            level: input.level,
            account_quota: input.accountQuota,
            starts_at: input.startsAt,
            expires_at: input.expiresAt,
            organization_public_ids: input.organizationPublicIds,
          });
        },
      }),
    );

    await expect(
      service.createOrgAuth({
        name: "2026 多专业等级授权包",
        purchaserOrganizationPublicId: "org_purchaser_123",
        authScopeType: "specified_nodes",
        edition: "advanced",
        accountQuota: 100,
        startsAt: "2026-05-18T04:00:00.000Z",
        expiresAt: "2027-05-18T04:00:00.000Z",
        organizationPublicIds: ["org_city_123"],
        scopeSelections: [
          { profession: "monopoly", level: 3 },
          { profession: "marketing", level: 4 },
        ],
      }),
    ).resolves.toMatchObject({
      code: 0,
      data: {
        orgAuth: {
          publicId: "org_auth_monopoly_3",
        },
        orgAuths: [
          { publicId: "org_auth_monopoly_3", profession: "monopoly", level: 3 },
          {
            publicId: "org_auth_marketing_4",
            profession: "marketing",
            level: 4,
          },
        ],
      },
    });
    expect(overlapChecks).toEqual([
      { profession: "monopoly", level: 3 },
      { profession: "marketing", level: 4 },
    ]);
    expect(createInputs).toEqual([
      { profession: "monopoly", level: 3 },
      { profession: "marketing", level: 4 },
    ]);

    const blockedCreates: { profession: string; level: number }[] = [];
    const overlapService = createOrganizationAuthService(
      createRepository({
        async hasOverlappingOrgAuth(input) {
          return input.profession === "marketing" && input.level === 4;
        },
        async createOrgAuth(input) {
          blockedCreates.push({
            profession: input.profession,
            level: input.level,
          });

          return createOrgAuth();
        },
      }),
    );

    await expect(
      overlapService.createOrgAuth({
        name: "2026 重叠授权包",
        purchaserOrganizationPublicId: "org_purchaser_123",
        authScopeType: "specified_nodes",
        edition: "advanced",
        accountQuota: 100,
        startsAt: "2026-05-18T04:00:00.000Z",
        expiresAt: "2027-05-18T04:00:00.000Z",
        organizationPublicIds: ["org_city_123"],
        scopeSelections: [
          { profession: "monopoly", level: 3 },
          { profession: "marketing", level: 4 },
        ],
      }),
    ).resolves.toEqual({
      code: 409005,
      message: "Org auth scope overlaps an existing active authorization.",
      data: null,
    });
    expect(blockedCreates).toEqual([]);
  });
});
