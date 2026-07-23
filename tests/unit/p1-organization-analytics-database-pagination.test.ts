import { sql } from "drizzle-orm";
import { PgDialect } from "drizzle-orm/pg-core";
import { describe, expect, it, vi } from "vitest";

import * as organizationAnalyticsRepositoryModule from "@/server/repositories/organization-analytics-repository";
import { buildOrganizationAnalyticsEmployeeStatisticsSummaryFromRepository } from "@/server/services/organization-analytics-service";
import { createOrganizationTrainingRecipientSnapshot } from "@/server/repositories/organization-training-repository";

const TASK_ID =
  "p1-remediation-rc-08-organization-analytics-eligible-denominator-2026-07-23";
const BASE_SHA = "33621628a226b593160ce0a8b788f6700d118ce4";
const BRANCH = "fix/organization-analytics-eligible-denominator";
const APPROVAL_ID =
  "guardian-f0126-organization-analytics-eligible-denominator-2026-07-23";
const MIGRATION_TAG =
  "20260723033000_p1_rc_08_organization_analytics_recipient_snapshot";

function readRepositoryFile(path: string): string {
  return readFileSync(resolve(process.cwd(), path), "utf8");
}

function parseRepositoryJson<T>(path: string): T {
  return JSON.parse(readRepositoryFile(path)) as T;
}

function parseRepositoryYaml(path: string): unknown {
  const repositoryRequire = createRequire(import.meta.url);
  const viteRequire = createRequire(
    repositoryRequire.resolve("vite/package.json"),
  );
  const { parseDocument } = viteRequire("yaml") as {
    parseDocument: (
      source: string,
      options: { strict: boolean; uniqueKeys: boolean },
    ) => { errors: unknown[]; toJS: () => unknown };
  };
  const document = parseDocument(readRepositoryFile(path), {
    strict: true,
    uniqueKeys: true,
  });

  expect(document.errors).toEqual([]);
  return document.toJS();
}

function normalizeSql(statement: string): string {
  return statement
    .replace(/--[^\r\n]*/gu, " ")
    .replace(/\s+/gu, " ")
    .trim();
}

function createThenableQuery<T>(rows: T[]) {
  const query = {
    from: vi.fn(),
    groupBy: vi.fn(),
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
  query.groupBy.mockReturnValue(query);
  query.innerJoin.mockReturnValue(query);
  query.leftJoin.mockReturnValue(query);
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
  it("validates the F-0126 task state and additive recipient snapshot migration source", () => {
    const taskSafety = parseRepositoryJson<{
      taskId: string;
      baseSha: string;
      branch: string;
      status: string;
      approvalId: string;
      approvalSources: { database: string; permission: string };
      conditionalCloseout: boolean;
      allowedFiles: string[];
    }>("docs/04-agent-system/state/task-safety.json");
    const projectState = parseRepositoryYaml(
      "docs/04-agent-system/state/project-state.yaml",
    ) as {
      currentTask: {
        id: string;
        status: string;
        branch: string;
        riskBoundary: { approvalId: string; approvedBaseSha: string };
      };
    };
    const queue = parseRepositoryYaml(
      "docs/04-agent-system/state/task-queue.yaml",
    ) as {
      activeTasks: Array<{
        id: string;
        status: string;
        branch: string;
        riskBoundary?: { approvalId: string; approvedBaseSha: string };
      }>;
    };

    expect(taskSafety).toMatchObject({
      taskId: TASK_ID,
      baseSha: BASE_SHA,
      branch: BRANCH,
      status: "ready_for_closeout",
      approvalId: APPROVAL_ID,
      approvalSources: {
        database: APPROVAL_ID,
        permission: APPROVAL_ID,
      },
      conditionalCloseout: true,
    });
    expect(new Set(taskSafety.allowedFiles).size).toBe(24);
    expect(projectState.currentTask).toMatchObject({
      id: TASK_ID,
      status: "in_progress",
      branch: BRANCH,
      riskBoundary: {
        approvalId: APPROVAL_ID,
        approvedBaseSha: BASE_SHA,
      },
    });
    expect(
      queue.activeTasks.filter((task) => task.status === "in_progress"),
    ).toEqual([
      expect.objectContaining({
        id: TASK_ID,
        branch: BRANCH,
        riskBoundary: expect.objectContaining({
          approvalId: APPROVAL_ID,
          approvedBaseSha: BASE_SHA,
        }),
      }),
    ]);

    const migration = readRepositoryFile(`drizzle/${MIGRATION_TAG}.sql`);
    const statements = migration
      .split("--> statement-breakpoint")
      .map(normalizeSql)
      .filter(Boolean);
    const allowedStatements = new Set([
      'CREATE TABLE "organization_training_version_recipient" ( "id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "organization_training_version_recipient_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1), "organization_training_version_id" bigint NOT NULL, "employee_public_id" text NOT NULL, "organization_public_id" text NOT NULL, "authorization_public_id" text NOT NULL, "created_at" timestamp with time zone DEFAULT now() NOT NULL );',
      'ALTER TABLE "organization_training_version" ADD COLUMN "recipient_snapshot_schema_version" integer;',
      'ALTER TABLE "organization_training_version" ADD COLUMN "recipient_snapshot_captured_at" timestamp with time zone;',
      'ALTER TABLE "organization_training_version" ADD COLUMN "recipient_snapshot_count" integer;',
      'ALTER TABLE "organization_training_version" ADD COLUMN "recipient_snapshot_digest" text;',
      'ALTER TABLE "organization_training_version_recipient" ADD CONSTRAINT "fk_organization_training_version_recipient_version" FOREIGN KEY ("organization_training_version_id") REFERENCES "public"."organization_training_version"("id") ON DELETE restrict ON UPDATE no action;',
      'CREATE UNIQUE INDEX "udx_organization_training_version_recipient_version_employee" ON "organization_training_version_recipient" USING btree ("organization_training_version_id","employee_public_id");',
      'CREATE INDEX "idx_organization_training_version_recipient_version_id" ON "organization_training_version_recipient" USING btree ("organization_training_version_id");',
      'CREATE INDEX "idx_organization_training_version_recipient_org_employee" ON "organization_training_version_recipient" USING btree ("organization_public_id","employee_public_id");',
      'ALTER TABLE "organization_training_version" ADD CONSTRAINT "chk_organization_training_version_recipient_snapshot" CHECK (( "organization_training_version"."recipient_snapshot_schema_version" is null and "organization_training_version"."recipient_snapshot_captured_at" is null and "organization_training_version"."recipient_snapshot_count" is null and "organization_training_version"."recipient_snapshot_digest" is null ) or ( "organization_training_version"."recipient_snapshot_schema_version" = 1 and "organization_training_version"."recipient_snapshot_captured_at" is not null and "organization_training_version"."recipient_snapshot_count" is not null and "organization_training_version"."recipient_snapshot_count" >= 0 and "organization_training_version"."recipient_snapshot_digest" ~ \'^[0-9a-f]{64}$\' ));',
    ]);

    expect(new Set(statements)).toEqual(allowedStatements);
    expect(statements).not.toContainEqual(
      expect.stringMatching(
        /^(?:UPDATE|DELETE|DROP|TRUNCATE|INSERT|BACKFILL|APPLY)\b|ALTER\s+COLUMN/iu,
      ),
    );

    const journal = parseRepositoryJson<{
      version: string;
      entries: Array<{
        idx: number;
        version: string;
        when: number;
        tag: string;
        breakpoints: boolean;
      }>;
    }>("drizzle/meta/_journal.json");
    const currentEntry = journal.entries.find(
      (entry) => entry.tag === MIGRATION_TAG,
    );
    const previousEntry = journal.entries.find(
      (entry) => entry.idx === currentEntry!.idx - 1,
    );
    const currentSnapshot = parseRepositoryJson<{
      id: string;
      prevId: string;
      version: string;
      dialect: string;
      tables: Record<
        string,
        {
          columns: Record<string, unknown>;
          indexes: Record<string, { isUnique: boolean }>;
          foreignKeys: Record<string, { onDelete: string }>;
          checkConstraints: Record<string, { value: string }>;
        }
      >;
    }>("drizzle/meta/20260723033000_snapshot.json");
    const previousSnapshot = parseRepositoryJson<{ id: string }>(
      "drizzle/meta/20260723023000_snapshot.json",
    );
    const versionTable =
      currentSnapshot.tables["public.organization_training_version"]!;
    const recipientTable =
      currentSnapshot.tables["public.organization_training_version_recipient"]!;

    expect(currentEntry).toEqual({
      idx: previousEntry!.idx + 1,
      version: journal.version,
      when: expect.any(Number),
      tag: MIGRATION_TAG,
      breakpoints: true,
    });
    expect(currentEntry!.when).toBeGreaterThan(previousEntry!.when);
    expect(currentSnapshot.prevId).toBe(previousSnapshot.id);
    expect(currentSnapshot.version).toBe(journal.version);
    expect(currentSnapshot.dialect).toBe("postgresql");
    expect(
      Object.keys(versionTable.columns).filter((column) =>
        column.startsWith("recipient_snapshot_"),
      ),
    ).toEqual([
      "recipient_snapshot_schema_version",
      "recipient_snapshot_captured_at",
      "recipient_snapshot_count",
      "recipient_snapshot_digest",
    ]);
    expect(recipientTable.indexes).toMatchObject({
      udx_organization_training_version_recipient_version_employee: {
        isUnique: true,
      },
      idx_organization_training_version_recipient_version_id: {
        isUnique: false,
      },
      idx_organization_training_version_recipient_org_employee: {
        isUnique: false,
      },
    });
    expect(
      recipientTable.foreignKeys
        .fk_organization_training_version_recipient_version,
    ).toMatchObject({ onDelete: "restrict" });
    expect(
      versionTable.checkConstraints
        .chk_organization_training_version_recipient_snapshot?.value,
    ).toMatch(/recipient_snapshot_schema_version" = 1[\s\S]+\{64\}/u);
  });

  it("exposes a PostgreSQL page reader instead of requiring a full answer-row source read", () => {
    expect(
      typeof (organizationAnalyticsRepositoryModule as Record<string, unknown>)
        .createOrganizationAnalyticsEmployeeTrainingSummaryPageReader,
    ).toBe("function");
  });

  it("keeps the production denominator on the immutable recipient source without an answer-derived fallback", () => {
    const repositorySource = readRepositoryFile(
      "src/server/repositories/organization-analytics-repository.ts",
    );
    const routeSource = readRepositoryFile(
      "src/server/services/organization-analytics-route.ts",
    );

    expect(repositorySource).toContain(
      "createOrganizationAnalyticsTrainingEligibilitySourceReader",
    );
    expect(routeSource).toContain(
      "createOrganizationAnalyticsTrainingEligibilitySourceReader",
    );
    expect(repositorySource).not.toMatch(
      /createOrganizationAnalyticsTrainingAnswerSource(?:Reader|Gateway)|readTrainingAnswerSourceRows/u,
    );
    expect(routeSource).not.toMatch(/TrainingAnswerSource/u);
  });

  it("uses one recipient predicate for distinct employee rows and count while retaining unanswered recipients", async () => {
    const createPageReader = (
      organizationAnalyticsRepositoryModule as Record<string, unknown>
    ).createOrganizationAnalyticsEmployeeTrainingSummaryPageReader as
      | ((database: unknown) => (input: unknown) => Promise<unknown>)
      | undefined;

    expect(createPageReader).toBeTypeOf("function");

    const capturedAt = "2026-06-01T00:00:00.000Z";
    const recipients = [
      {
        versionId: 201,
        employeePublicId: "employee_public_021",
        employeeDisplayName: "同名员工",
        organizationPublicId: "organization_child_public",
        organizationName: "下级组织",
        authorizationPublicId: "org_auth_public_021",
      },
    ];
    const snapshot = createOrganizationTrainingRecipientSnapshot({
      capturedAt,
      recipients,
    })!;
    const versionQuery = createThenableQuery([
      {
        id: 201,
        publicId: "training_version_public_021",
        organizationPublicId: "organization_child_public",
        publishScopeSnapshot: {
          organizationPublicIds: ["organization_child_public"],
          capturedAt,
        },
        publishedAt: new Date(capturedAt),
        answerDeadlineAt: null,
        takenDownAt: null,
        recipientSnapshotSchemaVersion: snapshot.schemaVersion,
        recipientSnapshotCapturedAt: new Date(capturedAt),
        recipientSnapshotCount: snapshot.count,
        recipientSnapshotDigest: snapshot.digest,
      },
    ]);
    const recipientQuery = createThenableQuery(recipients);
    const submissionQuery = createThenableQuery([
      {
        versionId: 201,
        versionPublicId: "training_version_public_021",
        employeePublicId: "employee_public_021",
        organizationPublicId: "organization_child_public",
        authorizationPublicId: "org_auth_public_021",
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
    const employeePageQuery = createThenableQuery([
      {
        employeeDisplayName: "同名员工",
        employeePublicId: "employee_public_021",
      },
    ]);
    const employeeCountQuery = createThenableQuery([{ value: 101 }]);
    const select = vi
      .fn()
      .mockReturnValueOnce(versionQuery)
      .mockReturnValueOnce(recipientQuery)
      .mockReturnValueOnce(submissionQuery)
      .mockReturnValueOnce(employeePageQuery)
      .mockReturnValueOnce(employeeCountQuery);
    const readPage = createPageReader?.({ select });
    const result = await readPage?.({
      ...scopeInput,
      pagination: { page: 2, pageSize: 20 },
    });
    const rowPredicate = employeePageQuery.where.mock.calls[0]?.[0];
    const countPredicate = employeeCountQuery.where.mock.calls[0]?.[0];
    const renderedRecipientPredicate = new PgDialect().sqlToQuery(
      rowPredicate ?? sql`false`,
    );

    expect(rowPredicate).toBe(countPredicate);
    expect(employeePageQuery.groupBy).toHaveBeenCalledTimes(1);
    expect(employeePageQuery.orderBy).toHaveBeenCalledTimes(1);
    expect(employeePageQuery.limit).toHaveBeenCalledWith(20);
    expect(employeePageQuery.offset).toHaveBeenCalledWith(20);
    expect(renderedRecipientPredicate.params).toContain(
      "training_version_public_021",
    );
    expect(renderedRecipientPredicate.params).toContain(
      "organization_child_public",
    );
    expect(result).toEqual({
      availability: "available",
      employeeTrainingSummaryInputs: [pageEmployeeInput],
      total: 101,
    });
  });

  it("passes repository pagination through without slicing the returned page again", async () => {
    const readEmployeeTrainingSummaryPage = vi.fn(async () => ({
      availability: "available" as const,
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
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { resolve } from "node:path";
