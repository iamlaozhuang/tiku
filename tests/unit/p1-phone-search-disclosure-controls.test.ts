import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

import * as adminContract from "@/server/contracts/admin-user-org-auth-ops-contract";
import type { ApiResponse } from "@/server/contracts/api-response";
import type { AuthContextDto } from "@/server/contracts/auth-contract";
import { auditLog, user } from "@/db/schema";
import {
  createPostgresAdminFlowRuntimeRepositories,
  type AdminFlowRuntimeRepositories,
} from "@/server/repositories/admin-flow-runtime-repository";
import { createAdminFlowRuntimeRouteHandlers } from "@/server/services/admin-flow-runtime";

type DisclosureResult =
  | { status: "disclosed"; phone: string }
  | { status: "not_found" }
  | { status: "rate_limited"; retryAfterSecond: number };

type DisclosureInput = {
  actionType: "user.phone_reveal" | "user.phone_copy";
  actor: {
    publicId: string;
    requestIp: string | null;
    role: "ops_admin" | "super_admin";
  };
  publicId: string;
  reasonCode: string;
  reasonNoteProvided: boolean;
};

function createSessionService(
  roles: AuthContextDto["user"]["adminRoles"] = ["ops_admin"],
) {
  return {
    async getCurrentSession(): Promise<ApiResponse<AuthContextDto | null>> {
      return {
        code: 0,
        message: "ok",
        data: {
          user: {
            publicId: "actor-user-public-001",
            phone: "已绑定手机号",
            name: "Operations Admin",
            userType: null,
            status: "active",
            lockedUntilAt: null,
            employeePublicId: null,
            organizationPublicId: null,
            adminPublicId: "actor-admin-public-001",
            adminRoles: roles,
          },
          session: { expiresAt: "2026-07-21T23:00:00.000Z" },
        },
      };
    },
  };
}

function createRepositories(
  disclose: (input: DisclosureInput) => Promise<DisclosureResult>,
): AdminFlowRuntimeRepositories {
  return {
    userOrgAuthRepository: {
      async listUsers() {
        return {
          users: [],
          pagination: {
            page: 1,
            pageSize: 20,
            total: 0,
            sortBy: "updatedAt",
            sortOrder: "desc",
          },
        };
      },
      discloseUserPhoneAtomically: disclose,
    } as AdminFlowRuntimeRepositories["userOrgAuthRepository"],
    contentKnowledgeRepository: {
      async listQuestions() {
        throw new Error("not used");
      },
      async listPapers() {
        throw new Error("not used");
      },
    },
    auditLogRepository: {
      async appendAuditLog() {
        return undefined;
      },
      async listAuditLogs() {
        throw new Error("not used");
      },
    },
  };
}

function createAwaitableSelectBuilder(
  rows: unknown[],
  onFrom: (table: unknown) => void,
) {
  const builder = {
    from(table: unknown) {
      onFrom(table);
      return builder;
    },
    limit() {
      return builder;
    },
    then<TResult1 = unknown[], TResult2 = never>(
      onFulfilled?:
        | ((value: unknown[]) => TResult1 | PromiseLike<TResult1>)
        | null,
      onRejected?:
        | ((reason: unknown) => TResult2 | PromiseLike<TResult2>)
        | null,
    ) {
      return Promise.resolve(rows).then(onFulfilled, onRejected);
    },
    where() {
      return builder;
    },
  };

  return builder;
}

function createDisclosureDatabase(input: {
  auditFailure?: boolean;
  phone?: string | null;
  recentAttemptCount?: number;
}) {
  const audits: Array<Record<string, unknown>> = [];
  const events: string[] = [];
  const selectRows = [
    [{ value: input.recentAttemptCount ?? 0 }],
    input.phone === null ? [] : [{ phone: input.phone ?? "13800000000" }],
  ];
  let selectIndex = 0;

  const transaction = {
    async execute() {
      events.push("lock_actor_budget");
      return [];
    },
    insert(table: unknown) {
      expect(table).toBe(auditLog);
      return {
        async values(values: Record<string, unknown>) {
          events.push("insert_audit");
          audits.push(values);

          if (input.auditFailure === true) {
            throw new Error("simulated audit failure");
          }
        },
      };
    },
    select() {
      const rows = selectRows[selectIndex];

      if (rows === undefined) {
        throw new Error(`unexpected select ${selectIndex + 1}`);
      }

      selectIndex += 1;
      return createAwaitableSelectBuilder(rows, (table) => {
        events.push(table === user ? "select_phone" : "count_budget");
      });
    },
  };

  return {
    audits,
    database: {
      async transaction<T>(
        callback: (value: typeof transaction) => Promise<T>,
      ): Promise<T> {
        return callback(transaction);
      },
    },
    events,
  };
}

describe("F-0106 phone search and disclosure controls", () => {
  it("classifies only a complete normalized phone as an exact phone search", () => {
    const classify = (
      adminContract as unknown as {
        classifyAdminIdentityKeyword?: (value: string) => unknown;
      }
    ).classifyAdminIdentityKeyword;

    expect(classify).toBeTypeOf("function");
    expect(classify?.(" 13800000000 ")).toEqual({
      kind: "exact_phone",
      value: "13800000000",
    });
    expect(classify?.("8000")).toEqual({ kind: "name", value: "8000" });
    expect(classify?.("张三")).toEqual({ kind: "name", value: "张三" });

    expect(
      adminContract.normalizeUserPhoneDisclosureInput({
        reasonCode: "bulk_export",
      }),
    ).toEqual({ success: false });
    expect(
      adminContract.normalizeUserPhoneDisclosureInput({
        reasonCode: "account_support",
        reasonNote: "x".repeat(121),
      }),
    ).toEqual({ success: false });
    expect(
      adminContract.normalizeUserPhoneDisclosureInput({
        reasonCode: "identity_verification",
        reasonNote: "  support ticket verified  ",
      }),
    ).toEqual({
      success: true,
      value: {
        reasonCode: "identity_verification",
        reasonNote: "support ticket verified",
      },
    });
  });

  it("does not build wildcard phone predicates for user or admin lists", () => {
    const source = readFileSync(
      "src/server/repositories/admin-flow-runtime-repository.ts",
      "utf8",
    );

    expect(source).not.toContain("ilike(user.phone");
    expect(source).not.toContain("ilike(admin.phone");
    expect(source).toContain("eq(user.phone");
    expect(source).toContain("eq(admin.phone");
  });

  it("requires an enumerated reason before the repository can disclose", async () => {
    let disclosureCallCount = 0;
    const handlers = createAdminFlowRuntimeRouteHandlers({
      repositories: createRepositories(async () => {
        disclosureCallCount += 1;
        return { status: "disclosed", phone: "13800000000" };
      }),
      sessionService: createSessionService(),
    });

    const response = await handlers.users.revealPhone.POST(
      new Request(
        "http://localhost/api/v1/users/user-public-001/reveal-phone",
        { method: "POST" },
      ),
      { params: Promise.resolve({ publicId: "user-public-001" }) },
    );

    expect(response.headers.get("cache-control")).toBe("no-store");
    await expect(response.json()).resolves.toMatchObject({
      code: 422601,
      data: null,
    });
    expect(disclosureCallCount).toBe(0);
  });

  it("passes only reason facts to one atomic disclosure command", async () => {
    const observed: DisclosureInput[] = [];
    const handlers = createAdminFlowRuntimeRouteHandlers({
      repositories: createRepositories(async (input) => {
        observed.push(input);
        return { status: "disclosed", phone: "13800000000" };
      }),
      sessionService: createSessionService(["content_admin", "ops_admin"]),
    });

    const response = await handlers.users.revealPhone.POST(
      new Request(
        "http://localhost/api/v1/users/user-public-001/reveal-phone",
        {
          body: JSON.stringify({
            reasonCode: "account_support",
            reasonNote: "Caller verified through the support workflow",
          }),
          headers: {
            "content-type": "application/json",
            "x-forwarded-for": "192.0.2.10, 192.0.2.11",
          },
          method: "POST",
        },
      ),
      { params: Promise.resolve({ publicId: "user-public-001" }) },
    );

    await expect(response.json()).resolves.toEqual({
      code: 0,
      message: "ok",
      data: { phone: "13800000000" },
    });
    expect(observed).toEqual([
      {
        actionType: "user.phone_reveal",
        actor: {
          publicId: "actor-admin-public-001",
          requestIp: "192.0.2.10",
          role: "ops_admin",
        },
        publicId: "user-public-001",
        reasonCode: "account_support",
        reasonNoteProvided: true,
      },
    ]);
  });

  it("returns a no-store rate limit without a phone", async () => {
    const handlers = createAdminFlowRuntimeRouteHandlers({
      repositories: createRepositories(async () => ({
        status: "rate_limited",
        retryAfterSecond: 60,
      })),
      sessionService: createSessionService(),
    });

    const response = await handlers.users.copyPhone.POST(
      new Request("http://localhost/api/v1/users/user-public-001/copy-phone", {
        body: JSON.stringify({ reasonCode: "security_investigation" }),
        headers: { "content-type": "application/json" },
        method: "POST",
      }),
      { params: Promise.resolve({ publicId: "user-public-001" }) },
    );

    expect(response.status).toBe(429);
    expect(response.headers.get("cache-control")).toBe("no-store");
    expect(response.headers.get("retry-after")).toBe("60");
    await expect(response.json()).resolves.toMatchObject({
      code: 429601,
      data: null,
    });
  });

  it("keeps repository and audit failures no-store and fail closed", async () => {
    const handlers = createAdminFlowRuntimeRouteHandlers({
      repositories: createRepositories(async () => {
        throw new Error("simulated atomic disclosure failure");
      }),
      sessionService: createSessionService(),
    });

    const response = await handlers.users.revealPhone.POST(
      new Request(
        "http://localhost/api/v1/users/user-public-001/reveal-phone",
        {
          body: JSON.stringify({ reasonCode: "account_support" }),
          headers: { "content-type": "application/json" },
          method: "POST",
        },
      ),
      { params: Promise.resolve({ publicId: "user-public-001" }) },
    );

    expect(response.status).toBe(503);
    expect(response.headers.get("cache-control")).toBe("no-store");
    await expect(response.json()).resolves.toEqual({
      code: 503606,
      message: "User phone disclosure runtime is not configured.",
      data: null,
    });
  });

  it("locks, counts, reads and audits a disclosure inside one transaction", async () => {
    const fixture = createDisclosureDatabase({ recentAttemptCount: 2 });
    const repositories = createPostgresAdminFlowRuntimeRepositories({
      createDatabase: () => fixture.database as never,
    });
    const disclose = (
      repositories.userOrgAuthRepository as unknown as {
        discloseUserPhoneAtomically?: (
          input: DisclosureInput,
        ) => Promise<DisclosureResult>;
      }
    ).discloseUserPhoneAtomically;

    expect(disclose).toBeTypeOf("function");
    const result = await disclose?.({
      actionType: "user.phone_reveal",
      actor: {
        publicId: "actor-user-public-001",
        requestIp: "192.0.2.10",
        role: "ops_admin",
      },
      publicId: "user-public-001",
      reasonCode: "identity_verification",
      reasonNoteProvided: false,
    });

    expect(result).toEqual({ status: "disclosed", phone: "13800000000" });
    expect(fixture.events).toEqual([
      "lock_actor_budget",
      "count_budget",
      "select_phone",
      "insert_audit",
    ]);
    expect(fixture.audits).toEqual([
      expect.objectContaining({
        action_type: "user.phone_reveal",
        result_status: "success",
        target_public_id: "user-public-001",
      }),
    ]);
    expect(JSON.stringify(fixture.audits)).toContain("identity_verification");
    expect(JSON.stringify(fixture.audits)).not.toContain("13800000000");
  });

  it("fails closed at the shared budget and never reads the phone", async () => {
    const fixture = createDisclosureDatabase({ recentAttemptCount: 10 });
    const repositories = createPostgresAdminFlowRuntimeRepositories({
      createDatabase: () => fixture.database as never,
    });
    const disclose = (
      repositories.userOrgAuthRepository as unknown as {
        discloseUserPhoneAtomically?: (
          input: DisclosureInput,
        ) => Promise<DisclosureResult>;
      }
    ).discloseUserPhoneAtomically;

    const result = await disclose?.({
      actionType: "user.phone_copy",
      actor: {
        publicId: "actor-user-public-001",
        requestIp: null,
        role: "super_admin",
      },
      publicId: "user-public-001",
      reasonCode: "security_investigation",
      reasonNoteProvided: false,
    });

    expect(result).toEqual({ status: "rate_limited", retryAfterSecond: 60 });
    expect(fixture.events).toEqual([
      "lock_actor_budget",
      "count_budget",
      "insert_audit",
    ]);
    expect(fixture.audits).toEqual([
      expect.objectContaining({ result_status: "failed" }),
    ]);
  });

  it("does not release a phone when the atomic audit insert fails", async () => {
    const fixture = createDisclosureDatabase({ auditFailure: true });
    const repositories = createPostgresAdminFlowRuntimeRepositories({
      createDatabase: () => fixture.database as never,
    });
    const disclose = (
      repositories.userOrgAuthRepository as unknown as {
        discloseUserPhoneAtomically?: (
          input: DisclosureInput,
        ) => Promise<DisclosureResult>;
      }
    ).discloseUserPhoneAtomically;

    await expect(
      disclose?.({
        actionType: "user.phone_reveal",
        actor: {
          publicId: "actor-user-public-001",
          requestIp: null,
          role: "ops_admin",
        },
        publicId: "user-public-001",
        reasonCode: "account_support",
        reasonNoteProvided: true,
      }),
    ).rejects.toThrow("simulated audit failure");
  });
});
