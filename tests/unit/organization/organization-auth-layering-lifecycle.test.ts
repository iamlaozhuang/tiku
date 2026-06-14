import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  ORGANIZATION_LIFECYCLE_GOVERNANCE,
  createBlockedOrganizationAuthGovernanceHandoff,
} from "@/server/contracts/organization/organization-lifecycle-contract";
import { createInMemoryOrganizationRepository } from "@/server/repositories/organization/in-memory-organization-repository";
import { createOrganizationLifecycleService } from "@/server/services/organization/organization-lifecycle-service";
import { createOrganizationRouteHandlers } from "@/server/services/organization/route-handlers";
import { normalizeOrganizationListQuery } from "@/server/validators/organization/list-query";

const createdAt = "2026-06-14T08:00:00.000Z";
const updatedAt = "2026-06-14T08:30:00.000Z";
const privateMarker = "RAW_PRIVATE_ORGANIZATION_AUTH_MARKER";

function createRepository() {
  return createInMemoryOrganizationRepository({
    employees: [
      {
        internalNumericId: 5001,
        organizationPublicId: "org-station-001",
        personalAuthPublicId: "personal-auth-public-001",
        publicId: "employee-public-001",
        status: "active",
        userPublicId: "user-public-001",
        internalNote: privateMarker,
      },
    ],
    orgAuths: [
      {
        accountQuota: 20,
        authScopeType: "specified_nodes",
        cancelledAt: null,
        createdAt,
        expiresAt: "2026-12-31T23:59:59.000Z",
        internalNumericId: 4001,
        level: 3,
        name: "2026 station coverage",
        organizationPublicIds: ["org-station-001"],
        profession: "monopoly",
        publicId: "org-auth-public-001",
        purchaserOrganizationPublicId: "org-province-001",
        startsAt: "2026-01-01T00:00:00.000Z",
        status: "active",
        updatedAt,
        usedQuota: 1,
        internalNote: privateMarker,
      },
    ],
    organizations: [
      {
        contactName: null,
        contactPhone: null,
        createdAt,
        depth: 1,
        employeeCount: 0,
        internalNumericId: 1001,
        name: "Province Org",
        orgTier: "province",
        parentOrganizationPublicId: null,
        publicId: "org-province-001",
        remark: null,
        status: "active",
        updatedAt,
        internalNote: privateMarker,
      },
      {
        contactName: null,
        contactPhone: null,
        createdAt,
        depth: 2,
        employeeCount: 0,
        internalNumericId: 1002,
        name: "City Org",
        orgTier: "city",
        parentOrganizationPublicId: "org-province-001",
        publicId: "org-city-001",
        remark: null,
        status: "active",
        updatedAt,
      },
      {
        contactName: null,
        contactPhone: null,
        createdAt,
        depth: 3,
        employeeCount: 0,
        internalNumericId: 1003,
        name: "District Org",
        orgTier: "district",
        parentOrganizationPublicId: "org-city-001",
        publicId: "org-district-001",
        remark: null,
        status: "active",
        updatedAt,
      },
      {
        contactName: null,
        contactPhone: null,
        createdAt,
        depth: 4,
        employeeCount: 1,
        internalNumericId: 1004,
        name: "Station Org",
        orgTier: "station",
        parentOrganizationPublicId: "org-district-001",
        publicId: "org-station-001",
        remark: null,
        status: "active",
        updatedAt,
      },
    ],
  });
}

describe("organization auth layering and lifecycle repair", () => {
  it("keeps organization route adapters behind the scoped service boundary", () => {
    expect(createOrganizationRouteHandlers).toBeTypeOf("function");
    expect(ORGANIZATION_LIFECYCLE_GOVERNANCE).toMatchObject({
      advancedOrganizationPortalStatus: "blocked",
      advancedTrainingStatus: "blocked",
      maxOrganizationDepth: 4,
      publicIdentifierPolicy: "public_id_only",
      standardEditionBoundary: "platform_managed_org_auth",
    });
    expect(
      createBlockedOrganizationAuthGovernanceHandoff().blockedGates,
    ).toEqual(
      expect.arrayContaining([
        "schema_migration",
        "advanced_organization_portal_training",
        "env_provider_config",
        "cost_calibration",
      ]),
    );

    const routeFiles = [
      "src/app/api/v1/organizations/route.ts",
      "src/app/api/v1/organizations/[publicId]/route.ts",
      "src/app/api/v1/organizations/[publicId]/enable/route.ts",
      "src/app/api/v1/organizations/[publicId]/disable/route.ts",
      "src/app/api/v1/organizations/[publicId]/employees/[employeePublicId]/unbind/route.ts",
    ];

    for (const routeFile of routeFiles) {
      const source = readFileSync(join(process.cwd(), routeFile), "utf8");

      expect(source).toContain("@/server/services/organization/route-handlers");
      expect(source).not.toContain(
        "@/server/services/admin-organization-org-auth-runtime",
      );
    }
  });

  it("lists organizations through public DTOs, pagination, and redacted lifecycle governance", async () => {
    expect(
      normalizeOrganizationListQuery(
        new URLSearchParams(
          "page=1&pageSize=10&sortBy=createdAt&sortOrder=desc&orgTier=station&status=active&keyword=station",
        ),
      ),
    ).toEqual({
      success: true,
      value: {
        keyword: "station",
        orgTier: "station",
        page: 1,
        pageSize: 10,
        sortBy: "createdAt",
        sortOrder: "desc",
        status: "active",
      },
    });

    const service = createOrganizationLifecycleService(createRepository());
    const response = await service.listOrganizations(
      new URLSearchParams(
        "page=1&pageSize=10&sortBy=createdAt&sortOrder=desc&orgTier=station&status=active&keyword=station",
      ),
    );

    expect(response).toMatchObject({
      code: 0,
      data: {
        governance: createBlockedOrganizationAuthGovernanceHandoff(),
        organizations: [
          {
            activeOrgAuthCount: 1,
            depth: 4,
            employeeCount: 1,
            name: "Station Org",
            orgTier: "station",
            parentOrganizationPublicId: "org-district-001",
            publicId: "org-station-001",
            status: "active",
          },
        ],
      },
      message: "ok",
      pagination: {
        page: 1,
        pageSize: 10,
        sortBy: "createdAt",
        sortOrder: "desc",
        total: 1,
      },
    });

    const serializedResponse = JSON.stringify(response);

    expect(serializedResponse).not.toContain(privateMarker);
    expect(serializedResponse).not.toContain("internalNumericId");
    expect(serializedResponse).not.toContain('"id"');
    expect(serializedResponse).not.toContain("internalNote");
  });

  it("guards organization hierarchy depth, parent tier, and org_auth overlap", async () => {
    const service = createOrganizationLifecycleService(createRepository());

    await expect(
      service.createOrganization({
        contactName: null,
        contactPhone: null,
        name: "New Station",
        orgTier: "station",
        parentOrganizationPublicId: "org-district-001",
        remark: null,
      }),
    ).resolves.toMatchObject({
      code: 0,
      data: {
        organization: {
          depth: 4,
          orgTier: "station",
          parentOrganizationPublicId: "org-district-001",
          status: "active",
        },
      },
    });

    await expect(
      service.createOrganization({
        name: "Invalid Province",
        orgTier: "province",
        parentOrganizationPublicId: "org-city-001",
      }),
    ).resolves.toEqual({
      code: 400004,
      data: null,
      message: "Province organization cannot have a parent organization.",
    });

    await expect(
      service.createOrganization({
        name: "Fifth Level",
        orgTier: "station",
        parentOrganizationPublicId: "org-station-001",
      }),
    ).resolves.toEqual({
      code: 409003,
      data: null,
      message: "Organization tree depth cannot exceed 4 levels.",
    });

    await expect(
      service.createOrgAuth({
        accountQuota: 10,
        authScopeType: "specified_nodes",
        expiresAt: "2026-11-01T00:00:00.000Z",
        level: 3,
        name: "Overlap Coverage",
        organizationPublicIds: ["org-station-001"],
        profession: "monopoly",
        purchaserOrganizationPublicId: "org-province-001",
        startsAt: "2026-06-01T00:00:00.000Z",
      }),
    ).resolves.toEqual({
      code: 409005,
      data: null,
      message: "Org auth scope overlaps an existing active authorization.",
    });
  });

  it("unbinds employees with enterprise access revoked and personal authorization preserved", async () => {
    const service = createOrganizationLifecycleService(createRepository());
    const response = await service.unbindEmployee({
      employeePublicId: "employee-public-001",
      organizationPublicId: "org-station-001",
      reason: "role changed",
    });

    expect(response).toMatchObject({
      code: 0,
      data: {
        governance: createBlockedOrganizationAuthGovernanceHandoff(),
        lifecycleEvent: {
          affectedOrgAuthPublicIds: ["org-auth-public-001"],
          employeeLifecycleStatus: "unbound",
          employeePublicId: "employee-public-001",
          enterpriseAccessStatus: "revoked",
          organizationPublicId: "org-station-001",
          personalAuthFallback: "preserved",
          userPublicId: "user-public-001",
        },
      },
      message: "ok",
    });

    const serializedResponse = JSON.stringify(response);

    expect(serializedResponse).not.toContain(privateMarker);
    expect(serializedResponse).not.toContain("internalNumericId");
    expect(serializedResponse).not.toContain("internalNote");
  });
});
