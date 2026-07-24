import { describe, expect, it } from "vitest";

import { createInMemoryAiCallLogRepository } from "@/server/repositories/ai-call-log/in-memory-ai-call-log-repository";
import type { AiCallLogRecord } from "@/server/contracts/ai-call-log/log-governance-contract";
import { summarizeAiCallLogRecords } from "@/server/mappers/ai-call-log/ai-call-log-mapper";
import { createInMemoryAuditLogRepository } from "@/server/repositories/audit-log/in-memory-audit-log-repository";
import {
  createAiCallLogRouteHandlers,
  createBlockedAiCallLogGovernanceHandoff,
} from "@/server/services/ai-call-log/route-handlers";
import {
  createAuditLogRouteHandlers,
  createBlockedAuditLogGovernanceHandoff,
} from "@/server/services/audit-log/route-handlers";
import type { SessionService } from "@/server/services/session-service";
import { parseAiCallLogListQuery } from "@/server/validators/ai-call-log/list-query";
import { parseAuditLogListQuery } from "@/server/validators/audit-log/list-query";

type AdminRole = "super_admin" | "ops_admin" | "content_admin";

const rawSensitiveMarker =
  "RAW_PROMPT_PROVIDER_RESPONSE_TOKEN_SECRET_DATABASE_URL";
const testAdminSessionCredential = "synthetic-admin-session";
const expectedAdminAuthorization = `Bearer ${testAdminSessionCredential}`;

function createAdminSessionService(
  role: AdminRole | null,
): Pick<SessionService, "getCurrentSession"> {
  return {
    async getCurrentSession(input) {
      if (input.authorization !== expectedAdminAuthorization || role === null) {
        return {
          code: 401001,
          data: null,
          message: "Unauthorized.",
        };
      }

      return {
        code: 0,
        data: {
          session: {
            expiresAt: "2026-06-14T20:00:00.000Z",
          },
          user: {
            adminPublicId: `admin-public-${role}`,
            adminRoles: [role],
            employeePublicId: null,
            lockedUntilAt: null,
            name: "Admin",
            organizationPublicId: null,
            phone: "13900000001",
            publicId: `user-public-${role}`,
            status: "active",
            userType: null,
          },
        },
        message: "ok",
      };
    },
  };
}

function createCookieBackedAdminRequest(url: string) {
  return new Request(url, {
    headers: {
      authorization: "Bearer __cookie_backed_session__",
      cookie: `tiku_session=${encodeURIComponent(testAdminSessionCredential)}`,
    },
  });
}

describe("admin log retention, redaction, and layering repair", () => {
  it("keeps token-derived cost unavailable when any measured row lacks pricing", () => {
    const measuredRecord = {
      aiFuncType: "ai_scoring",
      callStatus: "success",
      completedAt: "2026-06-14T10:00:01.000Z",
      completionTokenCount: 20,
      estimatedCostCny: "0.010000",
      evidenceStatus: "sufficient",
      latencyMs: 10,
      latencySource: "client_observed",
      level: 3,
      modelAlias: "local-model",
      observationSchemaVersion: 1,
      organizationPublicId: null,
      outputSummary: null,
      profession: "marketing",
      promptSummary: null,
      promptTokenCount: 10,
      providerDisplayName: "Local Mock",
      publicId: "ai-call-log-public-cost-001",
      startedAt: "2026-06-14T10:00:00.000Z",
      tokenCountSource: "provider_reported",
      tokenEstimationMethod: null,
      totalTokenCount: 30,
      userPublicId: "user-public-001",
    } satisfies AiCallLogRecord;

    expect(
      summarizeAiCallLogRecords([
        measuredRecord,
        {
          ...measuredRecord,
          publicId: "ai-call-log-public-cost-002",
          estimatedCostCny: null,
        },
      ]),
    ).toEqual([
      expect.objectContaining({
        providerReportedTokenCount: 60,
        providerReportedTokenDerivedCostCny: null,
      }),
    ]);
    expect(() =>
      summarizeAiCallLogRecords([{ ...measuredRecord, totalTokenCount: 31 }]),
    ).toThrow("AI call observation is invalid.");
  });

  it("returns scoped audit_log list responses with retention governance and redacted DTOs", async () => {
    const repository = createInMemoryAuditLogRepository({
      auditLogs: [
        {
          actionType: "model_config.update",
          actorPublicId: "admin-public-super_admin",
          actorRole: "super_admin",
          createdAt: "2026-06-14T10:00:00.000Z",
          databaseUrl: rawSensitiveMarker,
          internalNumericId: 1001,
          metadataSummary: "redacted model_config mutation metadata",
          publicId: "audit-log-public-001",
          rawRequestBody: rawSensitiveMarker,
          requestIp: "203.0.113.10",
          resultStatus: "success",
          targetPublicId: "model-config-public-001",
          targetResourceType: "model_config",
        },
        {
          actionType: "user.disable",
          actorPublicId: "admin-public-ops_admin",
          actorRole: "ops_admin",
          createdAt: "2026-06-14T09:00:00.000Z",
          metadataSummary: "redacted user disable metadata",
          publicId: "audit-log-public-002",
          requestIp: null,
          resultStatus: "failed",
          targetPublicId: "user-public-001",
          targetResourceType: "user",
        },
      ],
    });
    const handlers = createAuditLogRouteHandlers({
      repository,
      sessionService: createAdminSessionService("ops_admin"),
    });

    const response = await handlers.collection.GET(
      new Request(
        "http://localhost/api/v1/audit-logs?page=1&pageSize=50&actionType=model_config.update&actorPublicId=admin-public-super_admin&targetResourceType=model_config&resultStatus=success&keyword=model_config",
        {
          headers: {
            authorization: "Bearer synthetic-admin-session",
          },
        },
      ),
    );
    const payload = await response.json();

    expect(payload).toMatchObject({
      code: 0,
      data: {
        auditLogs: [
          {
            actionType: "model_config.update",
            actorPublicId: "admin-public-super_admin",
            actorRole: "super_admin",
            createdAt: "2026-06-14T10:00:00.000Z",
            metadataSummary: "redacted model_config mutation metadata",
            publicId: "audit-log-public-001",
            redactionStatus: "redacted",
            requestIp: "203.0.113.10",
            resultStatus: "success",
            retention: {
              retentionDay: 1095,
              retentionSource: "advanced_ops_config_contract",
            },
            targetPublicId: "model-config-public-001",
            targetResourceType: "model_config",
            visibility: "summary_only",
          },
        ],
        governance: createBlockedAuditLogGovernanceHandoff(),
      },
      message: "ok",
      pagination: {
        page: 1,
        pageSize: 50,
        sortBy: "createdAt",
        sortOrder: "desc",
        total: 1,
      },
    });
    expect(handlers.collection).not.toHaveProperty("POST");
    expect(handlers.collection).not.toHaveProperty("DELETE");

    const serializedPayload = JSON.stringify(payload);

    expect(serializedPayload).not.toContain(rawSensitiveMarker);
    expect(serializedPayload).not.toContain("internalNumericId");
    expect(serializedPayload).not.toContain("rawRequestBody");
    expect(serializedPayload).not.toContain("databaseUrl");
  });

  it("resolves audit_log and ai_call_log reads from cookie-backed admin sessions", async () => {
    const auditLogHandlers = createAuditLogRouteHandlers({
      repository: createInMemoryAuditLogRepository({ auditLogs: [] }),
      sessionService: createAdminSessionService("ops_admin"),
    });
    const aiCallLogHandlers = createAiCallLogRouteHandlers({
      repository: createInMemoryAiCallLogRepository({ aiCallLogs: [] }),
      sessionService: createAdminSessionService("ops_admin"),
    });

    const auditLogResponse = await auditLogHandlers.collection.GET(
      createCookieBackedAdminRequest(
        "http://localhost/api/v1/audit-logs?page=1&pageSize=20",
      ),
    );
    const aiCallLogResponse = await aiCallLogHandlers.aiCallLogs.GET(
      createCookieBackedAdminRequest(
        "http://localhost/api/v1/ai-call-logs?page=1&pageSize=20",
      ),
    );
    const aiCallLogSummaryResponse =
      await aiCallLogHandlers.aiCallLogSummary.GET(
        createCookieBackedAdminRequest(
          "http://localhost/api/v1/ai-call-logs/summary?page=1&pageSize=20",
        ),
      );

    await expect(auditLogResponse.json()).resolves.toMatchObject({
      code: 0,
      data: { auditLogs: [] },
      message: "ok",
    });
    await expect(aiCallLogResponse.json()).resolves.toMatchObject({
      code: 0,
      data: { aiCallLogs: [] },
      message: "ok",
    });
    await expect(aiCallLogSummaryResponse.json()).resolves.toMatchObject({
      code: 0,
      data: { dailySummaries: [] },
      message: "ok",
    });
  });

  it("returns scoped ai_call_log list and summary responses without raw provider payloads", async () => {
    const repository = createInMemoryAiCallLogRepository({
      aiCallLogs: [
        {
          aiFuncType: "ai_scoring",
          callStatus: "success",
          completedAt: "2026-06-14T10:00:01.000Z",
          completionTokenCount: 20,
          databaseUrl: rawSensitiveMarker,
          estimatedCostCny: "0.01",
          evidenceStatus: "sufficient",
          internalNumericId: 2001,
          latencyMs: 1000,
          latencySource: "client_observed",
          level: 3,
          modelAlias: "local-model",
          organizationPublicId: "organization-public-001",
          outputSummary: "redacted output summary",
          profession: "marketing",
          promptSummary: "redacted prompt summary",
          promptTokenCount: 10,
          observationSchemaVersion: 1,
          tokenCountSource: "provider_reported",
          tokenEstimationMethod: null,
          providerDisplayName: "Local Mock",
          providerResponse: rawSensitiveMarker,
          publicId: "ai-call-log-public-001",
          rawPrompt: rawSensitiveMarker,
          startedAt: "2026-06-14T10:00:00.000Z",
          totalTokenCount: 30,
          userPublicId: "user-public-001",
        },
        {
          aiFuncType: "ai_hint",
          callStatus: "failed",
          completedAt: null,
          completionTokenCount: null,
          estimatedCostCny: null,
          evidenceStatus: "weak",
          latencyMs: null,
          level: 2,
          modelAlias: "local-model",
          organizationPublicId: null,
          outputSummary: "redacted failed output summary",
          profession: "logistics",
          promptSummary: "redacted failed prompt summary",
          promptTokenCount: null,
          providerDisplayName: "Local Mock",
          publicId: "ai-call-log-public-002",
          startedAt: "2026-06-14T09:00:00.000Z",
          totalTokenCount: null,
          userPublicId: null,
        },
      ],
    });
    const handlers = createAiCallLogRouteHandlers({
      repository,
      sessionService: createAdminSessionService("super_admin"),
    });
    const request = new Request(
      "http://localhost/api/v1/ai-call-logs?aiFuncType=ai_scoring&callStatus=success&profession=marketing&level=3&organizationPublicId=organization-public-001&page=1&pageSize=20",
      {
        headers: {
          authorization: "Bearer synthetic-admin-session",
        },
      },
    );

    const listResponse = await handlers.aiCallLogs.GET(request);
    const listPayload = await listResponse.json();
    const summaryResponse = await handlers.aiCallLogSummary.GET(request);
    const summaryPayload = await summaryResponse.json();

    expect(listPayload).toMatchObject({
      code: 0,
      data: {
        aiCallLogs: [
          {
            aiFuncType: "ai_scoring",
            callStatus: "success",
            evidenceStatus: "sufficient",
            modelAlias: "local-model",
            organizationPublicId: "organization-public-001",
            outputSummary: "redacted output summary",
            profession: "marketing",
            promptSummary: "redacted prompt summary",
            publicId: "ai-call-log-public-001",
            redactionStatus: "redacted",
            retention: {
              retentionDay: 180,
              retentionSource: "advanced_ops_config_contract",
            },
            userPublicId: "user-public-001",
            visibility: "summary_only",
          },
        ],
        governance: createBlockedAiCallLogGovernanceHandoff(),
      },
      message: "ok",
    });
    expect(summaryPayload).toMatchObject({
      code: 0,
      data: {
        dailySummaries: [
          {
            aiFuncType: "ai_scoring",
            bucket: "2026-06-14",
            bucketType: "day",
            callCount: 1,
            evidenceStatusCounts: {
              none: 0,
              sufficient: 1,
              weak: 0,
            },
            failedCount: 0,
            modelAlias: "local-model",
            providerDisplayName: "Local Mock",
            successCount: 1,
            providerReportedTokenCount: 30,
            providerReportedTokenDerivedCostCny: "0.010000",
            estimatedTokenCount: 0,
            estimatedTokenDerivedCostCny: null,
            unavailableObservationCount: 0,
            legacyObservationCount: 0,
          },
        ],
        governance: createBlockedAiCallLogGovernanceHandoff(),
      },
    });
    expect(handlers.aiCallLogs).not.toHaveProperty("POST");
    expect(handlers.aiCallLogs).not.toHaveProperty("DELETE");

    const serializedPayload = JSON.stringify({
      listPayload,
      summaryPayload,
    });

    expect(serializedPayload).not.toContain(rawSensitiveMarker);
    expect(serializedPayload).not.toContain("internalNumericId");
    expect(serializedPayload).not.toContain("rawPrompt");
    expect(serializedPayload).not.toContain("providerResponse");
    expect(serializedPayload).not.toContain("databaseUrl");
  });

  it("denies content admins before scoped log reads and keeps blocked gates explicit", async () => {
    const auditLogHandlers = createAuditLogRouteHandlers({
      repository: createInMemoryAuditLogRepository({ auditLogs: [] }),
      sessionService: createAdminSessionService("content_admin"),
    });
    const aiCallLogHandlers = createAiCallLogRouteHandlers({
      repository: createInMemoryAiCallLogRepository({ aiCallLogs: [] }),
      sessionService: createAdminSessionService("content_admin"),
    });
    const request = new Request("http://localhost/api/v1/audit-logs", {
      headers: {
        authorization: "Bearer synthetic-admin-session",
      },
    });

    await expect(
      (await auditLogHandlers.collection.GET(request)).json(),
    ).resolves.toEqual({
      code: 403641,
      data: null,
      message: "Admin permission denied.",
    });
    await expect(
      (await aiCallLogHandlers.aiCallLogs.GET(request)).json(),
    ).resolves.toEqual({
      code: 403641,
      data: null,
      message: "Admin permission denied.",
    });
    expect(createBlockedAuditLogGovernanceHandoff()).toMatchObject({
      exportStatus: "blocked",
      hardDeleteStatus: "blocked",
      rawViewerStatus: "blocked",
      readOnly: true,
    });
    expect(createBlockedAiCallLogGovernanceHandoff()).toMatchObject({
      exportStatus: "blocked",
      providerExecutionStatus: "blocked",
      rawViewerStatus: "blocked",
      readOnly: true,
    });
  });

  it("drops overlong audit_log and ai_call_log list filter text", () => {
    const overlongFilterText = "x".repeat(129);

    const auditLogQuery = parseAuditLogListQuery(
      new Request(
        `http://localhost/api/v1/audit-logs?actionType=${overlongFilterText}&actorPublicId=${overlongFilterText}&keyword=${overlongFilterText}&targetResourceType=${overlongFilterText}`,
      ),
    );
    const aiCallLogQuery = parseAiCallLogListQuery(
      new Request(
        `http://localhost/api/v1/ai-call-logs?organizationPublicId=${overlongFilterText}&userPublicId=${overlongFilterText}`,
      ),
    );

    expect(auditLogQuery).toMatchObject({
      actionType: "all",
      actorPublicId: null,
      keyword: null,
      targetResourceType: "all",
    });
    expect(aiCallLogQuery).toMatchObject({
      organizationPublicId: null,
      userPublicId: null,
    });

    expect(
      parseAuditLogListQuery(
        new Request(
          "http://localhost/api/v1/audit-logs?actionType=model_config.update&keyword=model_config",
        ),
      ),
    ).toMatchObject({
      actionType: "model_config.update",
      keyword: "model_config",
    });
    expect(
      parseAiCallLogListQuery(
        new Request(
          "http://localhost/api/v1/ai-call-logs?organizationPublicId=organization-public-001&userPublicId=user-public-001",
        ),
      ),
    ).toMatchObject({
      organizationPublicId: "organization-public-001",
      userPublicId: "user-public-001",
    });
  });
});
