import { sql } from "drizzle-orm";
import { PgDialect } from "drizzle-orm/pg-core";
import { describe, expect, it, vi } from "vitest";

import * as organizationAnalyticsRepositoryModule from "@/server/repositories/organization-analytics-repository";
import { buildOrganizationAnalyticsEmployeeStatisticsSummaryFromRepository } from "@/server/services/organization-analytics-service";

function createThenableQuery<T>(rows: T[]) {
  const query = {
    from: vi.fn(),
    groupBy: vi.fn(),
    innerJoin: vi.fn(),
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
  query.groupBy.mockReturnValue(query);
  query.innerJoin.mockReturnValue(query);
  query.limit.mockReturnValue(query);
  query.offset.mockReturnValue(query);
  query.orderBy.mockReturnValue(query);
  query.where.mockReturnValue(query);

  return query;
}

const scopeInput = {
  organizationPublicId: "organization_root_public",
  scopeOrganizationPublicIds: [
    "organization_root_public",
    "organization_child_public",
  ],
  dateRange: {
    startAt: "2026-06-01T00:00:00.000Z",
    endAt: "2026-06-30T23:59:59.999Z",
  },
};

const pageEmployeeInput = {
  employeePublicId: "employee_public_021",
  employeeDisplayName: "同名员工",
  organizationPublicId: "organization_child_public",
  organizationName: "下级组织",
  visibleTrainingVersionPublicIds: ["training_version_public_021"],
  officialSubmissions: [
    {
      employeePublicId: "employee_public_021",
      trainingVersionPublicId: "training_version_public_021",
      score: 88,
      totalScore: 100,
      submittedAt: "2026-06-20T08:00:00.000Z",
      answerOrganizationSnapshot: {
        organizationPublicId: "organization_child_public",
        organizationName: "下级组织",
        capturedAt: "2026-06-20T08:00:00.000Z",
      },
    },
  ],
};

describe("P1 F-0128 organization analytics database pagination", () => {
  it("exposes a PostgreSQL page reader instead of requiring a full answer-row source read", () => {
    expect(
      typeof (organizationAnalyticsRepositoryModule as Record<string, unknown>)
        .createOrganizationAnalyticsEmployeeTrainingSummaryPageReader,
    ).toBe("function");
  });

  it("uses one predicate for distinct employee rows and count, then narrows answer rows to the selected page", async () => {
    const createPageReader = (
      organizationAnalyticsRepositoryModule as Record<string, unknown>
    ).createOrganizationAnalyticsEmployeeTrainingSummaryPageReader as
      | ((database: unknown) => (input: unknown) => Promise<unknown>)
      | undefined;

    expect(createPageReader).toBeTypeOf("function");

    const employeePageQuery = createThenableQuery([
      {
        employeeDisplayName: "同名员工",
        employeePublicId: "employee_public_021",
      },
    ]);
    const employeeCountQuery = createThenableQuery([{ value: 101 }]);
    const pageAnswerRowsQuery = createThenableQuery([
      {
        employeePublicId: "employee_public_021",
        employeeDisplayName: "同名员工",
        organizationPublicId: "organization_child_public",
        organizationTrainingVersionPublicId: "training_version_public_021",
        score: 88,
        totalScore: 100,
        submittedAt: new Date("2026-06-20T08:00:00.000Z"),
        answerOrganizationSnapshot: {
          organizationPublicId: "organization_child_public",
          organizationName: "下级组织",
          capturedAt: "2026-06-20T08:00:00.000Z",
        },
      },
    ]);
    const select = vi
      .fn()
      .mockReturnValueOnce(employeePageQuery)
      .mockReturnValueOnce(employeeCountQuery)
      .mockReturnValueOnce(pageAnswerRowsQuery);
    const readPage = createPageReader?.({ select });
    const result = await readPage?.({
      ...scopeInput,
      pagination: { page: 2, pageSize: 20 },
    });
    const rowPredicate = employeePageQuery.where.mock.calls[0]?.[0];
    const countPredicate = employeeCountQuery.where.mock.calls[0]?.[0];
    const answerPredicate = pageAnswerRowsQuery.where.mock.calls[0]?.[0];
    const renderedAnswerPredicate = new PgDialect().sqlToQuery(
      answerPredicate ?? sql`false`,
    );

    expect(rowPredicate).toBe(countPredicate);
    expect(employeePageQuery.groupBy).toHaveBeenCalledTimes(1);
    expect(employeePageQuery.orderBy).toHaveBeenCalledTimes(1);
    expect(employeePageQuery.limit).toHaveBeenCalledWith(20);
    expect(employeePageQuery.offset).toHaveBeenCalledWith(20);
    expect(renderedAnswerPredicate.params).toContain("employee_public_021");
    expect(result).toEqual({
      employeeTrainingSummaryInputs: [pageEmployeeInput],
      total: 101,
    });
  });

  it("passes repository pagination through without slicing the returned page again", async () => {
    const readEmployeeTrainingSummaryPage = vi.fn(async () => ({
      employeeTrainingSummaryInputs: [pageEmployeeInput],
      total: 101,
    }));
    const repository = {
      lookupVisibleOrganizationScope: vi.fn(async () =>
        scopeInput.scopeOrganizationPublicIds.slice(),
      ),
      readEmployeeTrainingSummaryPage,
    };
    const response =
      await buildOrganizationAnalyticsEmployeeStatisticsSummaryFromRepository({
        adminContext: {
          effectiveEdition: "advanced",
          authorizationSource: "org_auth",
          canViewOrganizationTrainingSummary: true,
          organizationPublicId: scopeInput.organizationPublicId,
        },
        adminPublicId: "admin_public_001",
        organizationPublicId: scopeInput.organizationPublicId,
        dateRange: scopeInput.dateRange,
        pagination: { page: 2, pageSize: 20 },
        repository: repository as never,
        updatedAt: "2026-07-21T13:40:00.000Z",
      });

    expect(readEmployeeTrainingSummaryPage).toHaveBeenCalledWith({
      ...scopeInput,
      pagination: { page: 2, pageSize: 20 },
    });
    expect(response.data?.employees).toHaveLength(1);
    expect(response.pagination).toEqual({
      page: 2,
      pageSize: 20,
      sortBy: "employeeDisplayName",
      sortOrder: "asc",
      total: 101,
    });
  });
});
