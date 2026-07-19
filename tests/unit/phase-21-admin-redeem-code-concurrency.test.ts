import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";

import type { SQL } from "drizzle-orm";
import { PgDialect } from "drizzle-orm/pg-core";
import { describe, expect, it } from "vitest";

import {
  createPostgresAdminRedeemCodeRuntimeRepositories,
  RedeemCodeGenerationConflictError,
} from "@/server/repositories/admin-redeem-code-runtime-repository";
import { createAdminRedeemCodeRuntimeRouteHandlers } from "@/server/services/admin-redeem-code-runtime";

function createUniqueConstraintError(): Error & {
  code: string;
  constraint: string;
} {
  return Object.assign(new Error("duplicate key value violates constraint"), {
    code: "23505",
    constraint: "udx_redeem_code_code_hash",
  });
}

function hashRedeemCode(codePlainText: string): string {
  return createHash("sha256").update(codePlainText).digest("hex");
}

function compilePostgresExpression(expression: SQL) {
  const query = new PgDialect().sqlToQuery(expression);

  return {
    sql: query.sql.replace(/\s+/gu, " ").trim(),
    params: query.params,
  };
}

function createCapturingRedeemCodeListDatabase(rows: unknown[]) {
  const whereConditions: Array<SQL | undefined> = [];
  const orderByExpressionGroups: SQL[][] = [];
  const database = {
    select(selection: Record<string, unknown>) {
      const isCountSelection = "value" in selection;

      return {
        from() {
          return {
            where(condition: SQL | undefined) {
              whereConditions.push(condition);

              if (isCountSelection) {
                return Promise.resolve([{ value: rows.length }]);
              }

              return {
                orderBy(...expressions: SQL[]) {
                  orderByExpressionGroups.push(expressions);

                  return {
                    limit() {
                      return {
                        async offset() {
                          return rows;
                        },
                      };
                    },
                  };
                },
              };
            },
          };
        },
      };
    },
  };

  return { database, orderByExpressionGroups, whereConditions };
}

describe("phase 21 admin redeem_code generation concurrency proof", () => {
  it("keeps the nullable deadline formatter and status guard explicit", () => {
    const source = readFileSync(
      "src/server/repositories/admin-redeem-code-runtime-repository.ts",
      "utf8",
    );

    expect(source).toContain("row.redeem_deadline_at !== null &&");
    expect(source).toContain("value?.toISOString() ?? null");
    expect(source).not.toContain("row.redeem_deadline_at.toISOString()");
  });

  it("retries unique redeem_code collisions inside one transaction", async () => {
    const insertedRows: Array<{
      public_id: string;
      code_hash: string;
      code_display: string;
      redeem_code_type: string;
      generation_group_id: string;
      redeem_deadline_at: Date | null;
    }> = [];
    let transactionCount = 0;

    const transactionDatabase = {
      insert() {
        return {
          values(row: (typeof insertedRows)[number]) {
            insertedRows.push(row);

            return {
              async returning() {
                if (row.code_display === "AAAAAAA2") {
                  throw createUniqueConstraintError();
                }

                return [
                  {
                    public_id: row.public_id,
                    code_display: row.code_display,
                    redeem_code_type: row.redeem_code_type,
                    profession: "monopoly" as const,
                    level: 3,
                    status: "unused" as const,
                    redeem_deadline_at: null,
                    created_at: new Date("2026-05-31T17:00:00.000Z"),
                  },
                ];
              },
            };
          },
        };
      },
    };
    const database = {
      async transaction<T>(callback: (tx: typeof transactionDatabase) => T) {
        transactionCount += 1;

        return callback(transactionDatabase);
      },
    };
    const generatedCodePlainTexts = ["AAAAAAA2", "BBBBBBB2"];
    const generatedPublicIds = [
      "redeem-code-public-collision",
      "redeem-code-public-unique",
    ];
    const repositories = createPostgresAdminRedeemCodeRuntimeRepositories({
      createDatabase: () => database as never,
      createGenerationGroupId: () => "redeem-code-batch-fixed",
      createRedeemCodePlainText: () => generatedCodePlainTexts.shift()!,
      createRedeemCodePublicId: () => generatedPublicIds.shift()!,
    } as never);

    const result = await repositories.createRedeemCodeBatch({
      count: 1,
      redeemCodeType: "personal_standard_activation",
      profession: "monopoly",
      level: 3,
      durationDay: 365,
      redeemDeadlineAt: null,
      actorPublicId: "admin-public-001",
    });

    expect(transactionCount).toBe(1);
    expect(insertedRows).toMatchObject([
      {
        public_id: "redeem-code-public-collision",
        code_hash: hashRedeemCode("AAAAAAA2"),
        code_display: "AAAAAAA2",
        redeem_code_type: "personal_standard_activation",
        generation_group_id: "redeem-code-batch-fixed",
        redeem_deadline_at: null,
      },
      {
        public_id: "redeem-code-public-unique",
        code_hash: hashRedeemCode("BBBBBBB2"),
        code_display: "BBBBBBB2",
        redeem_code_type: "personal_standard_activation",
        generation_group_id: "redeem-code-batch-fixed",
        redeem_deadline_at: null,
      },
    ]);
    expect(result).toEqual({
      generation: {
        generationGroupId: "redeem-code-batch-fixed",
        count: 1,
        redeemCodeType: "personal_standard_activation",
        profession: "monopoly",
        level: 3,
        durationDay: 365,
        redeemDeadlineAt: null,
      },
      redeemCodes: [
        {
          publicId: "redeem-code-public-unique",
          codePlainText: "BBBBBBB2",
          codeDisplay: "BBBBBBB2",
          redeemCodeType: "personal_standard_activation",
          profession: "monopoly",
          level: 3,
          status: "unused",
          redeemDeadlineAt: null,
          createdAt: "2026-05-31T17:00:00.000Z",
        },
      ],
    });
  });

  it("returns a standard conflict envelope when redeem_code generation retries are exhausted", async () => {
    const auditInputs: unknown[] = [];
    const handlers = createAdminRedeemCodeRuntimeRouteHandlers({
      now: () => new Date("2026-05-31T17:00:00.000Z"),
      repositories: {
        async createRedeemCodeBatch() {
          throw new RedeemCodeGenerationConflictError();
        },
        async listRedeemCodes() {
          throw new Error("listRedeemCodes should not be called");
        },
        auditLogRepository: {
          async appendAuditLog(input) {
            auditInputs.push(input);
          },
        },
      },
      sessionService: {
        async getCurrentSession() {
          return {
            code: 0,
            message: "ok",
            data: {
              session: {
                expiresAt: "2026-06-01T17:00:00.000Z",
              },
              user: {
                publicId: "admin-user-public-001",
                phone: "13900000001",
                name: "System Ops",
                userType: null,
                status: "active",
                lockedUntilAt: null,
                employeePublicId: null,
                organizationPublicId: null,
                adminPublicId: "admin-public-001",
                adminRoles: ["ops_admin"],
              },
            },
          };
        },
      },
    });

    const response = await handlers.redeemCodes.POST(
      new Request("http://localhost/api/v1/redeem-codes", {
        method: "POST",
        headers: {
          authorization: "Bearer admin-session-token",
        },
        body: JSON.stringify({
          count: 1,
          redeemCodeType: "personal_standard_activation",
          profession: "monopoly",
          level: 3,
          durationDay: 365,
          redeemDeadlineDate: "2026-06-24",
        }),
      }),
    );

    await expect(response.json()).resolves.toEqual({
      code: 409601,
      message:
        "Redeem code generation conflicted with another operation. Refresh and try again.",
      data: null,
    });
    expect(auditInputs).toEqual([]);
  });

  it.each([
    {
      status: "expired" as const,
      expectedSql:
        '("redeem_code"."status" = $1 or ("redeem_code"."status" = $2 and "redeem_code"."redeem_deadline_at" is not null and "redeem_code"."redeem_deadline_at" < $3))',
      expectedParams: ["expired", "unused", "2026-06-01T00:00:00.000Z"],
      wrongGroupedSql:
        '(("redeem_code"."status" = $1 or "redeem_code"."status" = $2) and "redeem_code"."redeem_deadline_at" is not null and "redeem_code"."redeem_deadline_at" < $3)',
    },
    {
      status: "unused" as const,
      expectedSql:
        '("redeem_code"."status" = $1 and ("redeem_code"."redeem_deadline_at" is null or "redeem_code"."redeem_deadline_at" >= $2))',
      expectedParams: ["unused", "2026-06-01T00:00:00.000Z"],
      wrongGroupedSql:
        '(("redeem_code"."status" = $1 and "redeem_code"."redeem_deadline_at" is null) or "redeem_code"."redeem_deadline_at" >= $2)',
    },
  ])(
    "compiles the complete $status deadline filter grouping and boundary parameters",
    async ({ expectedParams, expectedSql, status, wrongGroupedSql }) => {
      const { database, whereConditions } =
        createCapturingRedeemCodeListDatabase([]);
      const repositories = createPostgresAdminRedeemCodeRuntimeRepositories({
        createDatabase: () => database as never,
        now: () => new Date("2026-06-01T00:00:00.000Z"),
      });

      await repositories.listRedeemCodes({
        page: 1,
        pageSize: 20,
        keyword: null,
        status,
        sortBy: "updatedAt",
        sortOrder: "desc",
        userType: "all",
        userCategory: "all",
        authFilter: "all",
      });

      expect(whereConditions).toHaveLength(2);
      expect(whereConditions[0]).toBeDefined();
      expect(whereConditions[1]).toBeDefined();
      const listCondition = compilePostgresExpression(whereConditions[0]!);
      const countCondition = compilePostgresExpression(whereConditions[1]!);

      expect(listCondition).toEqual({
        sql: expectedSql,
        params: expectedParams,
      });
      expect(countCondition).toEqual({
        sql: expectedSql,
        params: expectedParams,
      });
      expect(listCondition).not.toEqual({
        sql: wrongGroupedSql,
        params: expectedParams,
      });
    },
  );

  it.each(["asc", "desc"] as const)(
    "uses nulls-last expressions for %s deadline sorting and preserves nullable row status",
    async (sortOrder) => {
      const rows = [
        {
          id: 1,
          public_id: "redeem-code-public-long-term-unused",
          code_display: "ABCDEFG2",
          redeem_code_type: "personal_standard_activation" as const,
          profession: "monopoly" as const,
          level: 3,
          status: "unused" as const,
          used_by_user_id: null,
          redeem_deadline_at: null,
          created_at: new Date("2026-05-31T17:00:00.000Z"),
          updated_at: new Date("2026-05-31T17:00:00.000Z"),
        },
        {
          id: 2,
          public_id: "redeem-code-public-explicit-expired",
          code_display: "BCDEFGH2",
          redeem_code_type: "personal_standard_activation" as const,
          profession: "monopoly" as const,
          level: 3,
          status: "expired" as const,
          used_by_user_id: null,
          redeem_deadline_at: null,
          created_at: new Date("2026-05-30T17:00:00.000Z"),
          updated_at: new Date("2026-05-30T17:00:00.000Z"),
        },
        {
          id: 3,
          public_id: "redeem-code-public-time-expired",
          code_display: "CDEFGHJ2",
          redeem_code_type: "personal_standard_activation" as const,
          profession: "monopoly" as const,
          level: 3,
          status: "unused" as const,
          used_by_user_id: null,
          redeem_deadline_at: new Date("2026-05-31T00:00:00.000Z"),
          created_at: new Date("2026-05-29T17:00:00.000Z"),
          updated_at: new Date("2026-05-29T17:00:00.000Z"),
        },
      ];
      const { database, orderByExpressionGroups } =
        createCapturingRedeemCodeListDatabase(rows);
      const repositories = createPostgresAdminRedeemCodeRuntimeRepositories({
        createDatabase: () => database as never,
        now: () => new Date("2026-06-01T00:00:00.000Z"),
      });

      const result = await repositories.listRedeemCodes({
        page: 1,
        pageSize: 20,
        keyword: null,
        status: "all",
        sortBy: "expiresAt",
        sortOrder,
        userType: "all",
        userCategory: "all",
        authFilter: "all",
      });

      expect(orderByExpressionGroups).toHaveLength(1);
      expect(orderByExpressionGroups[0]).toHaveLength(2);
      expect(
        orderByExpressionGroups[0]!.map(compilePostgresExpression),
      ).toEqual([
        {
          sql: '"redeem_code"."redeem_deadline_at" is null asc',
          params: [],
        },
        {
          sql: `"redeem_code"."redeem_deadline_at" ${
            sortOrder === "asc" ? "asc" : "desc"
          }`,
          params: [],
        },
      ]);
      expect(
        compilePostgresExpression(orderByExpressionGroups[0]![1]!),
      ).not.toEqual({
        sql: `"redeem_code"."redeem_deadline_at" ${
          sortOrder === "asc" ? "desc" : "asc"
        }`,
        params: [],
      });
      expect(result.redeemCodes).toMatchObject([
        {
          publicId: "redeem-code-public-long-term-unused",
          status: "unused",
          redeemDeadlineAt: null,
        },
        {
          publicId: "redeem-code-public-explicit-expired",
          status: "expired",
          redeemDeadlineAt: null,
        },
        {
          publicId: "redeem-code-public-time-expired",
          status: "expired",
          redeemDeadlineAt: "2026-05-31T00:00:00.000Z",
        },
      ]);
    },
  );

  it("serializes a null deadline in redeem_code detail", async () => {
    const row = {
      public_id: "redeem-code-public-long-term",
      code_display: "ABCDEFG2",
      redeem_code_type: "personal_standard_activation" as const,
      profession: "monopoly" as const,
      level: 3,
      status: "unused" as const,
      used_by_user_id: null,
      used_at: null,
      duration_day: 365,
      redeem_deadline_at: null,
      generation_group_id: "redeem-code-batch-fixed",
      created_at: new Date("2026-05-31T17:00:00.000Z"),
      updated_at: new Date("2026-05-31T17:00:00.000Z"),
    };
    const database = {
      select() {
        return {
          from() {
            return {
              where() {
                return {
                  async limit() {
                    return [row];
                  },
                };
              },
            };
          },
        };
      },
    };
    const repositories = createPostgresAdminRedeemCodeRuntimeRepositories({
      createDatabase: () => database as never,
      now: () => new Date("2026-06-01T00:00:00.000Z"),
    });

    await expect(
      repositories.findRedeemCodeDetailByPublicId?.(
        "redeem-code-public-long-term",
      ),
    ).resolves.toMatchObject({
      publicId: "redeem-code-public-long-term",
      status: "unused",
      redeemDeadlineAt: null,
    });
  });
});

describe("student redeem_code confirmation transaction guard", () => {
  it("locks user before code and validates preview before consuming", () => {
    const source = readFileSync(
      "src/server/repositories/student-authorization-redeem-runtime-repository.ts",
      "utf8",
    );
    const confirmationStart = source.indexOf(
      "async function confirmRedeemCodeForUser",
    );
    const confirmationSource = source.slice(confirmationStart);
    const userLock = confirmationSource.indexOf(
      "findActiveUserIdByPublicIdForUpdate",
    );
    const codeLock = confirmationSource.indexOf(
      "findRedeemCodeByHashForUpdate",
    );
    const previewEvaluation = confirmationSource.indexOf(
      "evaluateRedeemCodePreview",
    );
    const versionComparison = confirmationSource.indexOf(
      "preview.data.previewVersion !== input.previewVersion",
    );
    const consume = confirmationSource.indexOf(
      "consumeUnusedRedeemCodeForUser",
    );

    expect(confirmationStart).toBeGreaterThan(-1);
    expect(userLock).toBeGreaterThan(-1);
    expect(codeLock).toBeGreaterThan(userLock);
    expect(previewEvaluation).toBeGreaterThan(codeLock);
    expect(versionComparison).toBeGreaterThan(previewEvaluation);
    expect(consume).toBeGreaterThan(versionComparison);
    expect(confirmationSource).toContain("recoverCommittedRedeemCodeOutcome");
    expect(confirmationSource).toContain('.for("update")');
  });

  it("keeps transaction facts authoritative outside the service", () => {
    const serviceSource = readFileSync(
      "src/server/services/redeem-code-authorization-service.ts",
      "utf8",
    );

    expect(serviceSource).not.toContain("findRedeemCodeByCode");
    expect(serviceSource).not.toContain("redeemCodeId:");
    expect(serviceSource).toContain("confirmRedeemCodeForUser");
  });
});
