import { readdirSync, readFileSync, statSync, type Stats } from "node:fs";
import { join, relative, sep } from "node:path";

import { describe, expect, it } from "vitest";

import { createAdminAiAuditLogRuntimeRouteHandlers } from "@/server/services/admin-ai-audit-log-runtime";
import type { AdminAiAuditLogRuntimeRepositories } from "@/server/services/admin-ai-audit-log-runtime";
import { createAdminFlowRuntimeRouteHandlers } from "@/server/services/admin-flow-runtime";
import type { AdminFlowRuntimeRepositories } from "@/server/services/admin-flow-runtime";
import type { SessionService } from "@/server/services/session-service";

type RestRouteContract = {
  routePath: string;
  exportedMethods: string[];
  sourceText: string;
};

type StandardEnvelope = {
  code: number;
  message: string;
  data: unknown;
  pagination?: unknown;
};

const now = "2026-05-23T08:00:00.000Z";
const routeRoot = join(process.cwd(), "src", "app", "api", "v1");
const httpMethods = ["GET", "POST", "PUT", "PATCH", "DELETE"] as const;
const sensitiveTerms = [
  "admin-session-token",
  "student-session-token",
  "password",
  "secret",
  "apiKey",
  "codeHash",
  "code_hash",
  "rawPrompt",
  "raw prompt",
  "rawAnswer",
  "raw answer",
  "RAW_PROMPT",
  "RAW_ANSWER",
  "providerRequestPayload",
  "providerResponsePayload",
  "sk-real-secret",
];

function readRestRouteContractInventory(): RestRouteContract[] {
  return collectRouteFiles(routeRoot)
    .map((routeFilePath) => {
      const sourceText = readFileSync(routeFilePath, "utf8");

      return {
        routePath: toApiRoutePath(routeFilePath),
        exportedMethods: httpMethods.filter((method) =>
          new RegExp(
            `export\\s+(?:const|async\\s+function)\\s+${method}\\b`,
          ).test(sourceText),
        ),
        sourceText,
      };
    })
    .sort((firstRoute, secondRoute) =>
      firstRoute.routePath.localeCompare(secondRoute.routePath),
    );
}

function collectRouteFiles(directoryPath: string): string[] {
  return readdirSync(directoryPath).flatMap((entryName) => {
    const entryPath = join(directoryPath, entryName);
    const entryStats: Stats = statSync(entryPath);

    if (entryStats.isDirectory()) {
      return collectRouteFiles(entryPath);
    }

    return entryName === "route.ts" ? [entryPath] : [];
  });
}

function toApiRoutePath(routeFilePath: string): string {
  const routeSegments = relative(routeRoot, routeFilePath)
    .split(sep)
    .filter((segment) => segment !== "route.ts")
    .map((segment) =>
      segment.startsWith("[") && segment.endsWith("]")
        ? `{${segment.slice(1, -1)}}`
        : segment,
    );

  return `/api/v1/${routeSegments.join("/")}`;
}

function expectStaticRoutePathContract(routePath: string) {
  const routeSegments = routePath.split("/").filter(Boolean).slice(2);

  for (const routeSegment of routeSegments) {
    if (routeSegment.startsWith("{") && routeSegment.endsWith("}")) {
      const paramName = routeSegment.slice(1, -1);

      expect(paramName).not.toBe("id");
      expect(paramName).toMatch(/(?:^publicId$|PublicId$)/u);
      continue;
    }

    expect(routeSegment).toMatch(/^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/u);
  }
}

function createPagination(sortBy = "createdAt") {
  return {
    page: 1,
    pageSize: 20,
    sortBy,
    sortOrder: "desc" as const,
    total: 1,
  };
}

function createAdminSessionService(
  role: "super_admin" | "ops_admin" | "content_admin",
): Pick<SessionService, "getCurrentSession"> {
  return {
    async getCurrentSession(input) {
      if (input.authorization !== "Bearer admin-session-token") {
        return {
          code: 401001,
          message: "Unauthorized.",
          data: null,
        };
      }

      return {
        code: 0,
        message: "ok",
        data: {
          session: {
            expiresAt: "2026-05-23T16:00:00.000Z",
          },
          user: {
            publicId: "admin-user-public-001",
            phone: "13900000001",
            name: "运营管理员",
            userType: null,
            status: "active",
            lockedUntilAt: null,
            employeePublicId: null,
            organizationPublicId: null,
            adminPublicId: "admin-public-001",
            adminRoles: [role],
          },
        },
      };
    },
  };
}

function createAdminFlowRepositories(input: {
  auditLogInputs: unknown[];
  listUserCalls: string[];
}): AdminFlowRuntimeRepositories {
  return {
    userOrgAuthRepository: {
      async listUsers(query) {
        input.listUserCalls.push(query.keyword ?? "all");

        return {
          users: [
            {
              publicId: "user-public-001",
              phone: "13900000002",
              name: "学员甲",
              registeredAt: now,
              status: "active",
              userType: "employee",
              organizationPublicId: "organization-public-001",
              organizationName: "杭州烟草",
              authStatus: "active",
            },
          ],
          pagination: createPagination("registeredAt"),
        };
      },
      async resetUserPasswordAtomically() {
        throw new Error(
          "resetUserPasswordAtomically is not used by this contract test",
        );
      },
    },
    contentKnowledgeRepository: {
      async listQuestions() {
        return { questions: [], pagination: createPagination("updatedAt") };
      },
      async listPapers() {
        return { papers: [], pagination: createPagination("updatedAt") };
      },
    },
    auditLogRepository: {
      async appendAuditLog(auditLogInput) {
        input.auditLogInputs.push(auditLogInput);
      },
      async listAuditLogs() {
        return {
          auditLogs: [
            {
              publicId: "audit-log-public-001",
              actorPublicId: "admin-public-001",
              actorRole: "super_admin",
              actionType: "audit_log.list",
              targetResourceType: "audit_log",
              targetPublicId: null,
              resultStatus: "success",
              metadataSummary: "redacted audit_log list operation metadata",
              requestIp: "203.0.113.10",
              createdAt: now,
            },
          ],
          pagination: createPagination("createdAt"),
        };
      },
    },
  };
}

function createAdminAiAuditLogRepositories(): AdminAiAuditLogRuntimeRepositories {
  return {
    async listModelConfigs() {
      return {
        modelConfigs: [
          {
            publicId: "model-config-public-001",
            providerPublicId: "model-provider-public-001",
            providerDisplayName: "Mock AI",
            providerKey: "mock",
            modelName: "mock-scoring",
            modelAlias: "mock-scoring",
            displayName: "本地模拟评分模型",
            aiFuncType: "ai_scoring",
            apiKeyDisplay: null,
            secretStatus: "not_configured",
            maskedSecret: null,
            fallbackModelConfigPublicId: null,
            isEnabled: true,
            status: "enabled",
            fallbackPriority: 0,
            snapshotPolicy: "redacted_metadata",
            configVersion: 1,
            pricingVersion: null,
            inputTokenPriceCnyPerMillion: null,
            outputTokenPriceCnyPerMillion: null,
            timeoutSecond: 5,
            maxRetryCount: 0,
            updatedAt: now,
          },
        ],
        pagination: createPagination("updatedAt"),
      };
    },
    async appendAiCallLog() {
      throw new Error("appendAiCallLog is not used by read contract tests");
    },
    async listAiCallLogs() {
      return {
        aiCallLogs: [
          {
            publicId: "ai-call-log-public-001",
            userPublicId: "user-public-001",
            organizationPublicId: "organization-public-001",
            profession: "monopoly",
            level: 3,
            aiFuncType: "ai_scoring",
            callStatus: "success",
            providerDisplayName: "Mock AI",
            modelAlias: "mock-scoring",
            promptSummary: "redacted prompt and answer snapshot",
            outputSummary: "redacted learning suggestion snapshot",
            promptTokenCount: 40,
            completionTokenCount: 60,
            totalTokenCount: 100,
            estimatedCostCny: "0.00",
            latencyMs: 80,
            startedAt: now,
            completedAt: now,
          },
        ],
        pagination: createPagination("startedAt"),
      };
    },
    async summarizeAiCallLogs() {
      return {
        dailySummaries: [
          {
            bucket: "2026-05-23",
            bucketType: "day",
            aiFuncType: "ai_scoring",
            providerDisplayName: "Mock AI",
            modelAlias: "mock-scoring",
            callCount: 1,
            successCount: 1,
            failedCount: 0,
            totalTokenCount: 100,
            estimatedCostCny: "0.00",
          },
        ],
        pagination: createPagination("startedAt"),
      };
    },
  };
}

async function parseJsonResponse(
  response: Response,
): Promise<StandardEnvelope> {
  const payload = (await response.json()) as unknown;

  expectStandardEnvelope(payload);

  return payload;
}

function expectStandardEnvelope(
  payload: unknown,
): asserts payload is StandardEnvelope {
  expect(payload).toEqual(expect.any(Object));

  const payloadRecord = payload as Record<string, unknown>;
  const allowedEnvelopeKeys = ["code", "message", "data", "pagination"];

  expect(
    Object.keys(payloadRecord).every((key) =>
      allowedEnvelopeKeys.includes(key),
    ),
  ).toBe(true);
  expect(Object.hasOwn(payloadRecord, "code")).toBe(true);
  expect(Object.hasOwn(payloadRecord, "message")).toBe(true);
  expect(Object.hasOwn(payloadRecord, "data")).toBe(true);
  expect(payloadRecord.code).toEqual(expect.any(Number));
  expect(payloadRecord.message).toEqual(expect.any(String));

  if (Object.hasOwn(payloadRecord, "pagination")) {
    expect(payloadRecord.pagination).toEqual(
      expect.objectContaining({
        page: expect.any(Number),
        pageSize: expect.any(Number),
        total: expect.any(Number),
        sortBy: expect.any(String),
        sortOrder: expect.stringMatching(/^(asc|desc)$/u),
      }),
    );
  }
}

function expectCamelCaseJsonKeys(value: unknown) {
  if (Array.isArray(value)) {
    for (const item of value) {
      expectCamelCaseJsonKeys(item);
    }
    return;
  }

  if (typeof value !== "object" || value === null) {
    return;
  }

  for (const [key, childValue] of Object.entries(value)) {
    expect(key).toMatch(/^[a-z][A-Za-z0-9]*$/u);
    expectCamelCaseJsonKeys(childValue);
  }
}

function expectNoInternalIdKeys(value: unknown) {
  if (Array.isArray(value)) {
    for (const item of value) {
      expectNoInternalIdKeys(item);
    }
    return;
  }

  if (typeof value !== "object" || value === null) {
    return;
  }

  for (const [key, childValue] of Object.entries(value)) {
    expect(key).not.toBe("id");
    expectNoInternalIdKeys(childValue);
  }
}

function expectNoSensitiveFields(payload: unknown) {
  const serializedPayload = JSON.stringify(payload);

  for (const sensitiveTerm of sensitiveTerms) {
    expect(serializedPayload).not.toContain(sensitiveTerm);
  }
}

describe("phase 9 multi-client REST contract verification", () => {
  it("inventories the /api/v1 route handlers for multi-client contract checks", () => {
    const routes = readRestRouteContractInventory();

    expect(routes.length).toBeGreaterThan(40);
    expect(
      routes.every((route) => route.routePath.startsWith("/api/v1/")),
    ).toBe(true);

    for (const route of routes) {
      expectStaticRoutePathContract(route.routePath);
      expect(route.routePath).not.toContain("{id}");
      expect(route.exportedMethods.length).toBeGreaterThan(0);
    }
  });

  it("keeps audit_log and ai_call_log REST surfaces read-only", () => {
    const logRoutes = readRestRouteContractInventory().filter(
      (route) =>
        route.routePath.startsWith("/api/v1/audit-logs") ||
        route.routePath.startsWith("/api/v1/ai-call-logs"),
    );

    expect(logRoutes.map((route) => route.routePath).sort()).toEqual([
      "/api/v1/ai-call-logs",
      "/api/v1/ai-call-logs/summary",
      "/api/v1/audit-logs",
    ]);

    for (const route of logRoutes) {
      expect(route.exportedMethods).toEqual(["GET"]);
      expect(route.sourceText).not.toMatch(
        /export\s+(?:const|async\s+function)\s+(?:POST|PUT|PATCH|DELETE)\b/u,
      );
    }
  });

  it("rejects unauthenticated admin REST reads before repository access", async () => {
    const auditLogInputs: unknown[] = [];
    const listUserCalls: string[] = [];
    const handlers = createAdminFlowRuntimeRouteHandlers({
      repositories: createAdminFlowRepositories({
        auditLogInputs,
        listUserCalls,
      }),
      sessionService: createAdminSessionService("ops_admin"),
    });

    const payload = await parseJsonResponse(
      await handlers.users.collection.GET(
        new Request("http://localhost/api/v1/users?page=1&pageSize=20"),
      ),
    );

    expect(payload).toEqual({
      code: 401001,
      message: "Admin session is required.",
      data: null,
    });
    expect(listUserCalls).toEqual([]);
    expect(auditLogInputs).toEqual([]);
  });

  it("returns standard camelCase publicId-only envelopes for representative admin reads", async () => {
    const auditLogInputs: unknown[] = [];
    const listUserCalls: string[] = [];
    const adminFlowHandlers = createAdminFlowRuntimeRouteHandlers({
      repositories: createAdminFlowRepositories({
        auditLogInputs,
        listUserCalls,
      }),
      sessionService: createAdminSessionService("ops_admin"),
    });
    const aiAuditLogHandlers = createAdminAiAuditLogRuntimeRouteHandlers({
      repositories: createAdminAiAuditLogRepositories(),
      sessionService: createAdminSessionService("ops_admin"),
    });
    const authorizedRequest = new Request(
      "http://localhost/api/v1/users?page=1&pageSize=20",
      {
        headers: { authorization: "Bearer admin-session-token" },
      },
    );

    const payloads = [
      await parseJsonResponse(
        await adminFlowHandlers.users.collection.GET(authorizedRequest),
      ),
      await parseJsonResponse(
        await adminFlowHandlers.auditLogs.collection.GET(
          new Request("http://localhost/api/v1/audit-logs?page=1&pageSize=20", {
            headers: {
              authorization: "Bearer admin-session-token",
              "x-forwarded-for": "203.0.113.10",
            },
          }),
        ),
      ),
      await parseJsonResponse(
        await aiAuditLogHandlers.aiCallLogs.GET(
          new Request(
            "http://localhost/api/v1/ai-call-logs?page=1&pageSize=20",
            {
              headers: { authorization: "Bearer admin-session-token" },
            },
          ),
        ),
      ),
      await parseJsonResponse(
        await aiAuditLogHandlers.aiCallLogSummary.GET(
          new Request(
            "http://localhost/api/v1/ai-call-logs/summary?page=1&pageSize=20",
            {
              headers: { authorization: "Bearer admin-session-token" },
            },
          ),
        ),
      ),
    ];

    for (const payload of payloads) {
      expect(payload.code).toBe(0);
      expectCamelCaseJsonKeys(payload);
      expectNoInternalIdKeys(payload);
      expectNoSensitiveFields(payload);
    }

    expect(payloads[0].data).toEqual({
      users: [
        expect.objectContaining({
          publicId: "user-public-001",
          organizationPublicId: "organization-public-001",
        }),
      ],
    });
    expect(payloads[1].data).toEqual({
      auditLogs: [
        expect.objectContaining({
          publicId: "audit-log-public-001",
          targetPublicId: null,
          metadataSummary: "redacted audit_log list operation metadata",
        }),
      ],
    });
    expect(payloads[2].data).toEqual({
      aiCallLogs: [
        expect.objectContaining({
          publicId: "ai-call-log-public-001",
          promptSummary: "redacted prompt and answer snapshot",
          outputSummary: "redacted learning suggestion snapshot",
        }),
      ],
    });
    expect(payloads[3].data).toEqual({
      dailySummaries: [
        expect.objectContaining({
          bucket: "2026-05-23",
          estimatedCostCny: "0.00",
        }),
      ],
    });
    expect(auditLogInputs).toEqual([
      expect.objectContaining({
        actionType: "audit_log.list",
        targetResourceType: "audit_log",
        resultStatus: "success",
        metadataSummary: "redacted audit_log list operation metadata",
      }),
    ]);
  });
});
