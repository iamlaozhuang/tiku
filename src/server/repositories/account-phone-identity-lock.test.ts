import { describe, expect, it } from "vitest";
import { PgDialect } from "drizzle-orm/pg-core";
import type { SQL } from "drizzle-orm";

import { admin as adminTable } from "@/db/schema/auth";
import {
  findAccountPhoneIdentityConflict,
  findAccountPhoneIdentityConflictUnderLock,
} from "./account-phone-identity-lock";

function createIdentityDatabase(selectRows: unknown[][]) {
  const events: string[] = [];
  const executedQueries: unknown[] = [];
  let selectIndex = 0;

  const database = {
    async execute(query: unknown) {
      events.push("lock");
      executedQueries.push(query);
      return [];
    },
    select() {
      const rows = selectRows[selectIndex] ?? [];
      selectIndex += 1;
      const builder = {
        from(table: unknown) {
          events.push(table === adminTable ? "admin" : "user");
          return builder;
        },
        where() {
          return builder;
        },
        async limit() {
          return rows;
        },
      };

      return builder;
    },
  };

  return { database, events, executedQueries };
}

describe("account phone identity lock", () => {
  it("locks the shared phone key before checking both account domains", async () => {
    const fixture = createIdentityDatabase([[], []]);

    await expect(
      findAccountPhoneIdentityConflictUnderLock(
        fixture.database as never,
        "13800000000",
      ),
    ).resolves.toBeNull();

    expect(fixture.events).toEqual(["lock", "admin", "user"]);
    const renderedQuery = new PgDialect().sqlToQuery(
      fixture.executedQueries[0] as SQL,
    );
    expect(renderedQuery.sql).toBe(
      "select pg_advisory_xact_lock($1, hashtext($2)) as account_phone_identity_lock",
    );
    expect(renderedQuery.params).toEqual([200113, "13800000000"]);
  });

  it("returns the administrator conflict without consulting the lower-priority domain", async () => {
    const fixture = createIdentityDatabase([[{ id: 1 }]]);

    await expect(
      findAccountPhoneIdentityConflictUnderLock(
        fixture.database as never,
        "13800000000",
      ),
    ).resolves.toBe("admin");
    expect(fixture.events).toEqual(["lock", "admin"]);
  });

  it("detects a learner or employee conflict after the administrator check", async () => {
    const fixture = createIdentityDatabase([[], [{ id: 2 }]]);

    await expect(
      findAccountPhoneIdentityConflictUnderLock(
        fixture.database as never,
        "13800000000",
      ),
    ).resolves.toBe("user");
    expect(fixture.events).toEqual(["lock", "admin", "user"]);
  });

  it("supports a lock-free preflight lookup without treating it as the write boundary", async () => {
    const fixture = createIdentityDatabase([[{ id: 1 }]]);

    await expect(
      findAccountPhoneIdentityConflict(
        fixture.database as never,
        "13800000000",
      ),
    ).resolves.toBe("admin");
    expect(fixture.events).toEqual(["admin"]);
    expect(fixture.executedQueries).toEqual([]);
  });
});
