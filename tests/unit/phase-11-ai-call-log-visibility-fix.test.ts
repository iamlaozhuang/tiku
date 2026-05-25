import { describe, expect, it } from "vitest";
import type { SQL } from "drizzle-orm";

import { createAdminAiAuditLogListQuery } from "@/server/contracts/admin-ai-audit-log-ops-contract";
import {
  createPostgresAdminAiAuditLogRuntimeRepositories,
  type AdminAiAuditLogRuntimeRepositoryOptions,
} from "@/server/repositories/admin-ai-audit-log-runtime-repository";

type CapturedSql = SQL & {
  queryChunks?: unknown[];
};

function flattenSqlQuery(query: CapturedSql): string {
  return (query.queryChunks ?? [])
    .map((chunk) => {
      if (
        typeof chunk === "object" &&
        chunk !== null &&
        "queryChunks" in chunk &&
        Array.isArray((chunk as { queryChunks?: unknown }).queryChunks)
      ) {
        return flattenSqlQuery(chunk as CapturedSql);
      }

      if (
        typeof chunk === "object" &&
        chunk !== null &&
        "value" in chunk &&
        Array.isArray((chunk as { value?: unknown }).value)
      ) {
        return (chunk as { value: unknown[] }).value.join("");
      }

      if (typeof chunk === "object" && chunk !== null && "value" in chunk) {
        return String((chunk as { value: unknown }).value);
      }

      return String(chunk);
    })
    .join("");
}

describe("phase 11 ai_call_log visibility fix", () => {
  it("pushes aiFuncType and callStatus filters into the ai_call_log SQL before pagination", async () => {
    const capturedQueries: CapturedSql[] = [];
    const createDatabase: NonNullable<
      AdminAiAuditLogRuntimeRepositoryOptions["createDatabase"]
    > = () =>
      ({
        async execute(query: CapturedSql) {
          capturedQueries.push(query);

          if (flattenSqlQuery(query).includes("count(*)")) {
            return [{ value: 0 }];
          }

          return [];
        },
      }) as ReturnType<
        NonNullable<AdminAiAuditLogRuntimeRepositoryOptions["createDatabase"]>
      >;
    const repositories = createPostgresAdminAiAuditLogRuntimeRepositories({
      createDatabase,
    });

    await repositories.listAiCallLogs(
      createAdminAiAuditLogListQuery({
        aiFuncType: "ai_explanation",
        callStatus: "success",
        page: 1,
        pageSize: 20,
      }),
    );

    const listSql = flattenSqlQuery(capturedQueries[0]);

    expect(listSql).toContain("and ai_func_type = explanation::ai_func_type");
    expect(listSql).toContain("and call_status = success::ai_call_status");
    expect(listSql.indexOf("and ai_func_type")).toBeLessThan(
      listSql.indexOf("limit"),
    );
  });
});
