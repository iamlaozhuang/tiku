import { describe, expect, it, vi } from "vitest";

import { createSuccessResponse } from "../contracts/api-response";
import type { ApiResponse } from "../contracts/api-response";
import type { OrganizationPortalOverviewDto } from "../contracts/organization-portal-overview-contract";
import type { AdminRole } from "../models/auth";
import { createPostgresOrganizationPortalOverviewRepository } from "../repositories/organization-portal-overview-repository";
import type { SessionService } from "./session-service";
import {
  createOrganizationPortalOverviewRuntimeRouteHandlers,
  type OrganizationPortalOverviewReaderInput,
} from "./organization-portal-overview-route";

type CurrentSessionRequest = Parameters<SessionService["getCurrentSession"]>[0];
type CurrentSessionResult = Awaited<
  ReturnType<SessionService["getCurrentSession"]>
>;

function createOverviewRequest(query = ""): Request {
  return new Request(
    `http://localhost/api/v1/organization-portal-overviews${query}`,
    {
      method: "GET",
    },
  );
}

function createOrganizationAdminAuthContext(
  overrides: Partial<NonNullable<CurrentSessionResult["data"]>["user"]> = {},
): NonNullable<CurrentSessionResult["data"]> {
  const adminRoles: AdminRole[] = ["org_standard_admin"];

  return {
    user: {
      publicId: "organization_portal_route_user_public_001",
      phone: "13800000000",
      name: "Organization Portal Admin",
      userType: null,
      status: "active",
      lockedUntilAt: null,
      employeePublicId: null,
      organizationPublicId: "organization_scope_public_001",
      adminPublicId: "organization_portal_admin_public_001",
      adminRoles,
      adminWorkspaceCapability: {
        adminRoles,
        organizationAuthorizationPublicId: "org_auth_scope_public_001",
        organizationPublicId: "organization_scope_public_001",
        organizationEffectiveEdition: "standard",
        organizationAuthorizationSource: "org_auth",
        capabilitySource: "service_computed",
        canUseOrganizationAdvancedWorkspace: false,
      },
      ...overrides,
    },
    session: {
      expiresAt: "2026-07-08T12:00:00.000Z",
    },
  };
}

function createCurrentSessionService(result: CurrentSessionResult): Pick<
  SessionService,
  "getCurrentSession"
> & {
  requests: CurrentSessionRequest[];
} {
  const requests: CurrentSessionRequest[] = [];

  return {
    requests,
    async getCurrentSession(input) {
      requests.push(input);

      return result;
    },
  };
}

function createOverviewResponse(): ApiResponse<OrganizationPortalOverviewDto> {
  return createSuccessResponse({
    organization: {
      displayName: "华东营销中心",
      orgTier: "city" as const,
      status: "active" as const,
    },
    employeeSummary: {
      total: 2,
      active: 1,
      disabled: 1,
      locked: 0,
    },
    employees: [
      {
        employeeDisplayName: "员工甲",
        phoneMasked: "139****0001",
        status: "active" as const,
      },
    ],
    authorization: {
      packageName: "营销专套组织授权",
      sourceEdition: "standard" as const,
      effectiveEdition: "standard" as const,
      status: "active" as const,
      startsAt: "2026-07-01T00:00:00.000Z",
      expiresAt: "2027-07-01T00:00:00.000Z",
      accountQuota: 20,
      usedQuota: 4,
      availableQuota: 16,
      authScopeType: "specified_nodes",
      scopes: [
        {
          profession: "marketing" as const,
          level: 3,
          subject: null,
          organizationCount: 1,
        },
      ],
      upgradeStatus: "none" as const,
    },
    boundary: {
      isReadonly: true as const,
      mutationOwnerLabel: "平台运营",
      redactionStatus: "summary_only" as const,
    },
    updatedAt: "2026-07-08T10:00:00.000Z",
  });
}

function collectSqlChunkValues(value: unknown): unknown[] {
  if (value === null || value === undefined) {
    return [];
  }

  if (value instanceof Date) {
    return [value];
  }

  if (Array.isArray(value)) {
    return value.flatMap((item) => collectSqlChunkValues(item));
  }

  if (typeof value !== "object") {
    return [value];
  }

  if ("queryChunks" in value) {
    return collectSqlChunkValues(
      (value as { queryChunks: readonly unknown[] }).queryChunks,
    );
  }

  return [];
}

function createThenableQuery(rows: unknown[]) {
  const query = {
    from: vi.fn(() => query),
    innerJoin: vi.fn(() => query),
    leftJoin: vi.fn(() => query),
    where: vi.fn(() => query),
    orderBy: vi.fn(() => query),
    limit: vi.fn(async () => rows),
    then<TResult1 = unknown[], TResult2 = never>(
      onfulfilled?:
        | ((value: unknown[]) => TResult1 | PromiseLike<TResult1>)
        | null,
      onrejected?:
        | ((reason: unknown) => TResult2 | PromiseLike<TResult2>)
        | null,
    ) {
      return Promise.resolve(rows).then(onfulfilled, onrejected);
    },
  };

  return query;
}

describe("organization portal overview route", () => {
  it("uses the session-derived organization scope for standard organization admins", async () => {
    const observedInputs: OrganizationPortalOverviewReaderInput[] = [];
    const sessionService = createCurrentSessionService(
      createSuccessResponse(createOrganizationAdminAuthContext()),
    );
    const readOverview = vi.fn(
      async (input: OrganizationPortalOverviewReaderInput) => {
        observedInputs.push(input);

        return createOverviewResponse();
      },
    );
    const { overview } = createOrganizationPortalOverviewRuntimeRouteHandlers({
      readOverview,
      sessionService,
    });

    const response = await overview.GET(
      createOverviewRequest("?organizationPublicId=other_scope_public_999"),
    );
    const payload = await response.json();

    expect(payload.code).toBe(0);
    expect(observedInputs).toHaveLength(1);
    expect(observedInputs[0].adminContext).toMatchObject({
      adminPublicId: "organization_portal_admin_public_001",
      authorizationPublicId: "org_auth_scope_public_001",
      effectiveEdition: "standard",
      organizationPublicId: "organization_scope_public_001",
    });
    expect(payload.data.organization.displayName).toBe("华东营销中心");
    expect(JSON.stringify(payload.data)).not.toContain(
      "other_scope_public_999",
    );
    expect(JSON.stringify(payload.data)).not.toContain(
      "organization_scope_public_001",
    );
    expect(JSON.stringify(payload.data)).not.toContain(
      "org_auth_scope_public_001",
    );
    expect(sessionService.requests).toHaveLength(1);
  });

  it("allows advanced organization admins without exposing training or AI data in the overview", async () => {
    const adminRoles: AdminRole[] = ["org_advanced_admin"];
    const sessionService = createCurrentSessionService(
      createSuccessResponse(
        createOrganizationAdminAuthContext({
          adminRoles,
          adminWorkspaceCapability: {
            adminRoles,
            organizationAuthorizationPublicId: "org_auth_scope_public_002",
            organizationPublicId: "organization_scope_public_002",
            organizationEffectiveEdition: "advanced",
            organizationAuthorizationSource: "org_auth",
            capabilitySource: "service_computed",
            canUseOrganizationAdvancedWorkspace: true,
          },
          organizationPublicId: "organization_scope_public_002",
        }),
      ),
    );
    const readOverview = vi.fn(async () => createOverviewResponse());
    const { overview } = createOrganizationPortalOverviewRuntimeRouteHandlers({
      readOverview,
      sessionService,
    });

    const response = await overview.GET(createOverviewRequest());
    const payload = await response.json();

    expect(payload.code).toBe(0);
    expect(readOverview).toHaveBeenCalledTimes(1);
    expect(JSON.stringify(payload.data)).not.toContain("raw");
    expect(JSON.stringify(payload.data)).not.toContain("Provider");
    expect(JSON.stringify(payload.data)).not.toContain("Prompt");
  });

  it("allows readonly overview for organization admins with organization context fallback", async () => {
    const observedInputs: OrganizationPortalOverviewReaderInput[] = [];
    const sessionService = createCurrentSessionService(
      createSuccessResponse(
        createOrganizationAdminAuthContext({
          adminWorkspaceCapability: undefined,
          organizationPublicId: "organization_scope_public_003",
        }),
      ),
    );
    const readOverview = vi.fn(
      async (input: OrganizationPortalOverviewReaderInput) => {
        observedInputs.push(input);

        return createOverviewResponse();
      },
    );
    const { overview } = createOrganizationPortalOverviewRuntimeRouteHandlers({
      readOverview,
      sessionService,
    });

    const response = await overview.GET(createOverviewRequest());
    const payload = await response.json();

    expect(payload.code).toBe(0);
    expect(observedInputs).toHaveLength(1);
    expect(observedInputs[0].adminContext).toMatchObject({
      adminPublicId: "organization_portal_admin_public_001",
      authorizationPublicId: null,
      effectiveEdition: "standard",
      organizationPublicId: "organization_scope_public_003",
    });
    expect(payload.data.authorization.effectiveEdition).toBe("standard");
  });

  it("denies sessions without organization-admin role before reading data", async () => {
    const sessionService = createCurrentSessionService(
      createSuccessResponse(
        createOrganizationAdminAuthContext({
          adminRoles: ["content_admin"],
          adminWorkspaceCapability: undefined,
          organizationPublicId: null,
        }),
      ),
    );
    const readOverview = vi.fn();
    const { overview } = createOrganizationPortalOverviewRuntimeRouteHandlers({
      readOverview,
      sessionService,
    });

    const response = await overview.GET(createOverviewRequest());
    const payload = await response.json();

    expect(payload.code).toBe(403189);
    expect(payload.data).toBeNull();
    expect(readOverview).not.toHaveBeenCalled();
  });

  it("denies organization admins without organization context before reading data", async () => {
    const sessionService = createCurrentSessionService(
      createSuccessResponse(
        createOrganizationAdminAuthContext({
          adminWorkspaceCapability: undefined,
          organizationPublicId: null,
        }),
      ),
    );
    const readOverview = vi.fn();
    const { overview } = createOrganizationPortalOverviewRuntimeRouteHandlers({
      readOverview,
      sessionService,
    });

    const response = await overview.GET(createOverviewRequest());
    const payload = await response.json();

    expect(payload.code).toBe(403189);
    expect(payload.data).toBeNull();
    expect(readOverview).not.toHaveBeenCalled();
  });

  it("passes a driver-safe timestamp string into the employee locked summary query", async () => {
    const observedLockedSqlValues: unknown[] = [];
    const fakeDatabase = {
      select: vi.fn((selection: Record<string, unknown>) => {
        if ("display_name" in selection) {
          return createThenableQuery([
            {
              id: 1,
              display_name: "组织概览",
              org_tier: "city",
              status: "active",
            },
          ]);
        }

        if ("locked" in selection) {
          observedLockedSqlValues.push(
            ...collectSqlChunkValues(selection.locked),
          );

          return createThenableQuery([
            {
              total: 1,
              active: 1,
              disabled: 0,
              locked: 0,
            },
          ]);
        }

        if ("phone" in selection) {
          return createThenableQuery([]);
        }

        if ("auth_scope_type" in selection) {
          return createThenableQuery([
            {
              id: 2,
              name: "组织授权",
              auth_scope_type: "specified_nodes",
              source_edition: "standard",
              effective_edition: "advanced",
              profession: "marketing",
              level: 3,
              account_quota: 10,
              used_quota: 2,
              starts_at: new Date("2026-07-01T00:00:00.000Z"),
              expires_at: new Date("2027-07-01T00:00:00.000Z"),
              status: "active",
              upgrade_status: "active",
            },
          ]);
        }

        return createThenableQuery([{ value: 1 }]);
      }),
    };
    const repository = createPostgresOrganizationPortalOverviewRepository({
      createDatabase: () => fakeDatabase as never,
    });

    const overview = await repository.readOverview({
      authorizationPublicId: null,
      now: new Date("2026-07-08T10:00:00.000Z"),
      organizationPublicId: "organization_scope_public_001",
      updatedAt: "2026-07-08T10:00:00.000Z",
    });

    expect(overview?.employeeSummary.locked).toBe(0);
    expect(observedLockedSqlValues.some((value) => value instanceof Date)).toBe(
      false,
    );
    expect(observedLockedSqlValues).toContain("2026-07-08T10:00:00.000Z");
  });
});
