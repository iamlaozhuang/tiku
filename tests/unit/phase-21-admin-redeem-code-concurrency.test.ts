import { createHash } from "node:crypto";

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

describe("phase 21 admin redeem_code generation concurrency proof", () => {
  it("retries unique redeem_code collisions inside one transaction", async () => {
    const insertedRows: Array<{
      public_id: string;
      code_hash: string;
      code_display: string;
      generation_group_id: string;
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
                    profession: "monopoly" as const,
                    level: 3,
                    status: "unused" as const,
                    redeem_deadline_at: new Date("2026-06-24T15:59:59.999Z"),
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
      profession: "monopoly",
      level: 3,
      durationDay: 365,
      redeemDeadlineAt: new Date("2026-06-24T15:59:59.999Z"),
      actorPublicId: "admin-public-001",
    });

    expect(transactionCount).toBe(1);
    expect(insertedRows).toMatchObject([
      {
        public_id: "redeem-code-public-collision",
        code_hash: hashRedeemCode("AAAAAAA2"),
        code_display: "AAAAAAA2",
        generation_group_id: "redeem-code-batch-fixed",
      },
      {
        public_id: "redeem-code-public-unique",
        code_hash: hashRedeemCode("BBBBBBB2"),
        code_display: "BBBBBBB2",
        generation_group_id: "redeem-code-batch-fixed",
      },
    ]);
    expect(result).toEqual({
      generation: {
        generationGroupId: "redeem-code-batch-fixed",
        count: 1,
        profession: "monopoly",
        level: 3,
        durationDay: 365,
        redeemDeadlineAt: "2026-06-24T15:59:59.999Z",
      },
      redeemCodes: [
        {
          publicId: "redeem-code-public-unique",
          codePlainText: "BBBBBBB2",
          codeDisplay: "BBBBBBB2",
          profession: "monopoly",
          level: 3,
          status: "unused",
          redeemDeadlineAt: "2026-06-24T15:59:59.999Z",
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
});
