import { sql } from "drizzle-orm";
import { PgDialect } from "drizzle-orm/pg-core";
import { describe, expect, it, vi } from "vitest";

import {
  createOrganizationPortalOverviewRouteHandlers,
  type OrganizationPortalEmployeeRosterReaderInput,
} from "@/server/services/organization-portal-overview-route";
import {
  normalizeOrganizationPortalEmployeeRosterQuery,
  resolveOrganizationPortalEmployeeAccountStatus,
} from "@/server/services/organization-portal-overview-service";
import { createOrganizationIsSelfOrDescendantCondition } from "@/server/repositories/organization-scope-query";
import { createPostgresOrganizationPortalOverviewRepository } from "@/server/repositories/organization-portal-overview-repository";

const adminContext = {
  adminPublicId: "admin_public_org_001",
  adminRoles: ["org_standard_admin" as const],
  authorizationPublicId: "org_auth_public_001",
  authorizationSource: "org_auth" as const,
  effectiveEdition: "standard" as const,
  organizationPublicId: "organization_public_bound_001",
};

function createThenableQuery<T>(rows: T[]) {
  const query = {
    from: vi.fn(),
    innerJoin: vi.fn(),
    leftJoin: vi.fn(),
    limit: vi.fn(),
    offset: vi.fn(),
    orderBy: vi.fn(),
    then: (
      resolve: (value: T[]) => unknown,
      reject?: (reason: unknown) => unknown,
    ) => Promise.resolve(rows).then(resolve, reject),
    where: vi.fn(),
  };

  query.from.mockReturnValue(query);
  query.innerJoin.mockReturnValue(query);
  query.leftJoin.mockReturnValue(query);
  query.limit.mockReturnValue(query);
  query.offset.mockReturnValue(query);
  query.orderBy.mockReturnValue(query);
  query.where.mockReturnValue(query);

  return query;
}

describe("P1 F-0118 organization portal employee roster", () => {
  it("normalizes only server-supported roster query values", () => {
    expect(
      normalizeOrganizationPortalEmployeeRosterQuery(
        new URLSearchParams({
          accountStatus: "locked",
          authFilter: "advanced",
          employeePublicId: " employee_public_101 ",
          keyword: "  张 三  ",
          page: "2",
          pageSize: "50",
          rootOrganizationPublicId: "organization_public_attacker",
        }),
      ),
    ).toEqual({
      accountStatus: "locked",
      authFilter: "advanced",
      employeePublicId: "employee_public_101",
      keyword: "张 三",
      page: 2,
      pageSize: 50,
    });

    expect(
      normalizeOrganizationPortalEmployeeRosterQuery(
        new URLSearchParams({
          accountStatus: "unknown",
          authFilter: "cancelled",
          employeePublicId: " ",
          keyword: " ",
          page: "0",
          pageSize: "5",
        }),
      ),
    ).toEqual({
      accountStatus: "all",
      authFilter: "all",
      employeePublicId: null,
      keyword: null,
      page: 1,
      pageSize: 20,
    });
  });

  it("gives disabled account state precedence over a current lock", () => {
    const now = new Date("2026-07-21T12:00:00.000Z");

    expect(
      resolveOrganizationPortalEmployeeAccountStatus({
        lockedUntilAt: new Date("2026-07-22T12:00:00.000Z"),
        now,
        status: "disabled",
      }),
    ).toBe("disabled");
    expect(
      resolveOrganizationPortalEmployeeAccountStatus({
        lockedUntilAt: new Date("2026-07-22T12:00:00.000Z"),
        now,
        status: "active",
      }),
    ).toBe("locked");
    expect(
      resolveOrganizationPortalEmployeeAccountStatus({
        lockedUntilAt: new Date("2026-07-21T11:59:59.999Z"),
        now,
        status: "active",
      }),
    ).toBe("active");
  });

  it("uses the verified session organization and returns no-store for success", async () => {
    let observedInput: OrganizationPortalEmployeeRosterReaderInput | null =
      null;
    const handlers = createOrganizationPortalOverviewRouteHandlers({
      readEmployeeRoster: vi.fn(async (input) => {
        observedInput = input;
        return {
          code: 0,
          message: "ok",
          data: [
            {
              accountStatus: "active" as const,
              authEditionLabel: "advanced" as const,
              authStatus: "active" as const,
              employeeDisplayName: "张三",
              employeePublicId: "employee_public_101",
              organizationDisplayName: "下级组织",
              phoneMasked: "138****8000",
            },
          ],
          pagination: {
            page: 2,
            pageSize: 50,
            sortBy: "employeeDisplayName",
            sortOrder: "asc" as const,
            total: 101,
          },
        };
      }),
      resolveAdminContext: vi.fn(async () => adminContext),
    });

    const response = await handlers.employees.GET(
      new Request(
        "http://localhost/api/v1/organization-portal-employees?page=2&pageSize=50&rootOrganizationPublicId=organization_public_attacker",
      ),
    );

    expect(response.headers.get("cache-control")).toBe("no-store");
    expect(observedInput).toEqual({
      adminContext,
      query: {
        accountStatus: "all",
        authFilter: "all",
        employeePublicId: null,
        keyword: null,
        page: 2,
        pageSize: 50,
      },
    });
    expect(await response.json()).toMatchObject({
      code: 0,
      pagination: { page: 2, pageSize: 50, total: 101 },
    });
  });

  it("returns a no-store fail-closed envelope without calling the roster reader", async () => {
    const readEmployeeRoster = vi.fn();
    const handlers = createOrganizationPortalOverviewRouteHandlers({
      readEmployeeRoster,
      resolveAdminContext: vi.fn(async () => null),
    });

    const response = await handlers.employees.GET(
      new Request("http://localhost/api/v1/organization-portal-employees"),
    );

    expect(response.headers.get("cache-control")).toBe("no-store");
    expect(readEmployeeRoster).not.toHaveBeenCalled();
    expect(await response.json()).toMatchObject({ code: 403189, data: null });
  });

  it("keeps unexpected roster errors no-store and fail closed", async () => {
    const handlers = createOrganizationPortalOverviewRouteHandlers({
      readEmployeeRoster: vi.fn(async () => {
        throw new Error("repository failure");
      }),
      resolveAdminContext: vi.fn(async () => adminContext),
    });

    const response = await handlers.employees.GET(
      new Request("http://localhost/api/v1/organization-portal-employees"),
    );

    expect(response.headers.get("cache-control")).toBe("no-store");
    expect(await response.json()).toEqual({
      code: 500001,
      data: null,
      message: "Unexpected runtime error.",
    });
  });

  it("builds a bounded cycle-safe current-node-and-descendant predicate", () => {
    const condition = createOrganizationIsSelfOrDescendantCondition({
      ancestorOrganizationId: sql.placeholder("bound_organization_id"),
      organizationId: sql.placeholder("employee_organization_id"),
    });
    const query = new PgDialect().sqlToQuery(condition);

    expect(query.sql).toContain("with recursive organization_ancestor");
    expect(query.sql).toContain("ancestor_depth <");
    expect(query.sql).toContain("visited_organization_ids");
    expect(query.sql).toContain("parent_organization_id is null");
    expect(query.params).toContain(4 - 1);
  });

  it("uses one scoped predicate for rows and count with stable database pagination", async () => {
    const boundOrganizationQuery = createThenableQuery([{ id: 7 }]);
    const effectiveAuthorization = {
      auth_edition_label: sql`effective_auth_edition_label`,
      auth_status: sql`effective_auth_status`,
      user_id: sql`effective_user_id`,
      getSQL: () => sql`effective_authorization`,
    };
    const effectiveAuthorizationQuery = {
      as: vi.fn(() => effectiveAuthorization),
      from: vi.fn(),
      leftJoin: vi.fn(),
    };
    effectiveAuthorizationQuery.from.mockReturnValue(
      effectiveAuthorizationQuery,
    );
    effectiveAuthorizationQuery.leftJoin.mockReturnValue(
      effectiveAuthorizationQuery,
    );
    const employeeRowsQuery = createThenableQuery([
      {
        auth_edition_label: "advanced" as const,
        auth_status: "active" as const,
        employee_public_id: "employee_public_101",
        locked_until_at: new Date("2026-07-22T12:00:00.000Z"),
        name: "张三",
        organization_name: "下级组织",
        phone: "13800008000",
        status: "active" as const,
      },
    ]);
    const countQuery = createThenableQuery([{ value: 101 }]);
    const select = vi
      .fn()
      .mockReturnValueOnce(boundOrganizationQuery)
      .mockReturnValueOnce(effectiveAuthorizationQuery)
      .mockReturnValueOnce(employeeRowsQuery)
      .mockReturnValueOnce(countQuery);
    const repository = createPostgresOrganizationPortalOverviewRepository({
      createDatabase: () => ({ select }) as never,
    });

    const result = await repository.readEmployeeRoster({
      now: new Date("2026-07-21T12:00:00.000Z"),
      organizationPublicId: "organization_public_bound_001",
      query: {
        accountStatus: "locked",
        authFilter: "advanced",
        employeePublicId: "employee_public_101",
        keyword: "张",
        page: 2,
        pageSize: 50,
      },
    });

    const rowPredicate = employeeRowsQuery.where.mock.calls[0]?.[0];
    const countPredicate = countQuery.where.mock.calls[0]?.[0];
    const renderedPredicate = new PgDialect().sqlToQuery(rowPredicate);

    expect(rowPredicate).toBe(countPredicate);
    expect(renderedPredicate.sql).toContain(
      "with recursive organization_ancestor",
    );
    expect(renderedPredicate.params).toEqual(
      expect.arrayContaining([
        7,
        "%张%",
        "employee_public_101",
        "active",
        "advanced",
      ]),
    );
    expect(employeeRowsQuery.orderBy).toHaveBeenCalledTimes(1);
    expect(employeeRowsQuery.limit).toHaveBeenCalledWith(50);
    expect(employeeRowsQuery.offset).toHaveBeenCalledWith(50);
    expect(result).toEqual({
      employees: [
        {
          accountStatus: "locked",
          authEditionLabel: "advanced",
          authStatus: "active",
          employeeDisplayName: "张三",
          employeePublicId: "employee_public_101",
          organizationDisplayName: "下级组织",
          phoneMasked: "138****8000",
        },
      ],
      total: 101,
    });
    expect(JSON.stringify(result)).not.toContain("13800008000");
  });
});
