import { readFileSync } from "node:fs";
import { join } from "node:path";
import { createElement } from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import type { OrgAuthDto } from "@/server/contracts/organization-auth-contract";
import * as orgAuthPageModule from "@/features/admin/org-auth-redeem/AdminOrgAuthRedeemPage";
import {
  createAdminOrganizationOrgAuthRuntimeRouteHandlers,
  type AdminOrganizationOrgAuthRuntimeRepositories,
} from "@/server/services/admin-organization-org-auth-runtime";
import type { SessionService } from "@/server/services/session-service";
import { normalizeOrgAuthClosureMetadataInput } from "@/server/validators/org-auth";

type ClosureActionHandler = {
  POST(request: Request, context: RouteContext): Promise<Response>;
};

type ClosureActionRouteHandlers = {
  expandQuota?: ClosureActionHandler;
  renew?: ClosureActionHandler;
  replace?: ClosureActionHandler;
  upgrade?: ClosureActionHandler;
};

type ClosureActionRepositories = AdminOrganizationOrgAuthRuntimeRepositories & {
  expandOrgAuthQuota(input: unknown): Promise<unknown>;
  renewOrgAuth(input: unknown): Promise<unknown>;
  replaceOrgAuth(input: unknown): Promise<unknown>;
  upgradeOrgAuth(input: unknown): Promise<unknown>;
};

type RouteContext = {
  params: Promise<{ publicId: string }>;
};

const activeStandardOrgAuth: OrgAuthDto = {
  publicId: "org-auth-public-001",
  name: "杭州烟草标准授权",
  purchaserOrganizationPublicId: "organization-public-001",
  authScopeType: "current_and_descendants",
  profession: "monopoly",
  level: 3,
  edition: "standard",
  effectiveEdition: "standard",
  upgradeStatus: "none",
  accountQuota: 100,
  usedQuota: 40,
  startsAt: "2026-01-01T00:00:00.000Z",
  expiresAt: "2027-01-01T00:00:00.000Z",
  status: "active",
  cancelledAt: null,
  organizationPublicIds: [],
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
};

function createAdminSessionService(
  roles:
    | ("content_admin" | "ops_admin" | "super_admin")[]
    | "content_admin"
    | "ops_admin"
    | "super_admin" = "ops_admin",
): Pick<SessionService, "getCurrentSession"> {
  return {
    async getCurrentSession(input) {
      if (input.authorization !== "Bearer admin-session-value") {
        return { code: 401001, message: "Unauthorized.", data: null };
      }

      return {
        code: 0,
        message: "ok",
        data: {
          session: { expiresAt: "2026-07-21T00:00:00.000Z" },
          user: {
            publicId: "admin-user-public-001",
            phone: "13900000001",
            name: "Ops Admin",
            userType: null,
            status: "active",
            lockedUntilAt: null,
            employeePublicId: null,
            organizationPublicId: null,
            adminPublicId: "admin-public-001",
            adminRoles: Array.isArray(roles) ? roles : [roles],
          },
        },
      };
    },
  };
}

function createRepositories(
  mutationInputs: unknown[],
): ClosureActionRepositories {
  return {
    async listOrganizations(query) {
      return {
        organizations: [],
        pagination: { ...query, total: 0 },
      };
    },
    async listOrgAuths(query) {
      return {
        orgAuths: [],
        pagination: { ...query, total: 0 },
      };
    },
    async listEmployees(query) {
      return {
        employees: [],
        pagination: { ...query, total: 0 },
      };
    },
    auditLogRepository: {
      appendAuditLog: vi.fn(),
    },
    async upgradeOrgAuth(input) {
      mutationInputs.push({ action: "upgradeOrgAuth", input });

      return {
        status: "success",
        data: {
          action: "manual_upgrade",
          orgAuth: {
            ...activeStandardOrgAuth,
            effectiveEdition: "advanced",
            upgradeStatus: "active",
          },
        },
      };
    },
    async replaceOrgAuth(input) {
      mutationInputs.push({ action: "replaceOrgAuth", input });

      return {
        status: "success",
        data: {
          action: "transactional_replacement",
          previousOrgAuth: {
            ...activeStandardOrgAuth,
            status: "cancelled",
            cancelledAt: "2026-07-20T00:00:00.000Z",
          },
          orgAuth: {
            ...activeStandardOrgAuth,
            publicId: "org-auth-public-002",
            name: "杭州烟草高级授权",
            edition: "advanced",
            effectiveEdition: "advanced",
            accountQuota: 120,
            expiresAt: "2028-01-01T00:00:00.000Z",
          },
        },
      };
    },
    async renewOrgAuth(input) {
      mutationInputs.push({ action: "renewOrgAuth", input });

      return {
        status: "success",
        data: {
          action: "renewal_successor",
          previousOrgAuth: activeStandardOrgAuth,
          orgAuth: {
            ...activeStandardOrgAuth,
            publicId: "org-auth-public-renewal-001",
            startsAt: activeStandardOrgAuth.expiresAt,
            expiresAt: "2028-01-01T00:00:00.000Z",
          },
        },
      };
    },
    async expandOrgAuthQuota(input) {
      mutationInputs.push({ action: "expandOrgAuthQuota", input });

      return {
        status: "success",
        data: {
          action: "quota_expansion",
          orgAuth: {
            ...activeStandardOrgAuth,
            accountQuota: 150,
          },
        },
      };
    },
  };
}

function createClosureHandlers() {
  const mutationInputs: unknown[] = [];
  const repositories = createRepositories(mutationInputs);
  const routeHandlers = createAdminOrganizationOrgAuthRuntimeRouteHandlers({
    repositories,
    sessionService: createAdminSessionService(),
  });

  return {
    auditLogRepository: repositories.auditLogRepository!,
    handlers: routeHandlers.orgAuths as typeof routeHandlers.orgAuths &
      ClosureActionRouteHandlers,
    mutationInputs,
  };
}

function createPostRequest(path: string, body: unknown): Request {
  return new Request(`http://localhost${path}`, {
    method: "POST",
    headers: {
      authorization: "Bearer admin-session-value",
      "content-type": "application/json",
      "x-forwarded-for": "203.0.113.9",
    },
    body: JSON.stringify(body),
  });
}

const routeContext: RouteContext = {
  params: Promise.resolve({ publicId: activeStandardOrgAuth.publicId }),
};

afterEach(() => cleanup());

describe("F-0009 organization authorization closure actions", () => {
  it("keeps all four persistence commands transactional and fail-closed", () => {
    const repositorySource = readFileSync(
      join(
        process.cwd(),
        "src/server/repositories/admin-organization-org-auth-runtime-repository.ts",
      ),
      "utf8",
    );
    const readMethod = (methodName: string, nextMethodName: string) =>
      repositorySource.slice(
        repositorySource.indexOf(`    async ${methodName}(`),
        repositorySource.indexOf(`    async ${nextMethodName}(`),
      );
    const upgradeSource = readMethod("upgradeOrgAuth", "renewOrgAuth");
    const renewalSource = readMethod("renewOrgAuth", "replaceOrgAuth");
    const replacementSource = readMethod(
      "replaceOrgAuth",
      "expandOrgAuthQuota",
    );
    const quotaSource = readMethod(
      "expandOrgAuthQuota",
      "terminateOrgAuthActiveFlows",
    );

    for (const commandSource of [
      upgradeSource,
      renewalSource,
      replacementSource,
      quotaSource,
    ]) {
      expect(commandSource).toContain("database.transaction");
      expect(commandSource).toContain("lockOrganizationScopeMutation");
      expect(commandSource).toContain("appendTransactionalOrgAuthAuditLog");
    }
    expect(upgradeSource).toContain('source_type: "ops_manual"');
    expect(upgradeSource).toContain('target_edition: "advanced"');
    expect(renewalSource).toContain("startsAt: previousOrgAuthRow.expires_at");
    expect(renewalSource).toContain("hasOverlappingOrgAuthWithOrganizationIds");
    expect(replacementSource).toContain("previousOrgAuthRow.id");
    expect(replacementSource).toContain("Failed to cancel replaced org auth");
    expect(replacementSource).toMatch(
      /previousOrgAuthRow\.purchaser_organization_id !==\s+purchaserOrganization\.id/u,
    );
    expect(replacementSource).toMatch(
      /previousOrgAuthRow\.auth_scope_type !==\s+input\.replacement\.authScopeType/u,
    );
    expect(replacementSource).toContain(
      "previousOrgAuthRow.profession !== input.replacement.profession",
    );
    expect(replacementSource).toContain(
      "previousOrgAuthRow.level !== input.replacement.level",
    );
    expect(replacementSource).toContain("input.replacement.startsAt > now");
    expect(replacementSource).toContain("haveSameOrganizationIds");
    expect(quotaSource).toContain(
      "lt(orgAuth.account_quota, input.accountQuota)",
    );
    expect(repositorySource).not.toContain(
      "external reference=${input.externalReference}",
    );
    expect(repositorySource).toContain("external reference fingerprint=");
  });

  it("rejects audit-log injection and oversized closure metadata", () => {
    expect(
      normalizeOrgAuthClosureMetadataInput({
        externalReference: "OPS-2026-0013\r\nforged=audit-entry",
        opsNote: "valid note",
      }),
    ).toMatchObject({ success: false });
    expect(
      normalizeOrgAuthClosureMetadataInput({
        externalReference: "R".repeat(129),
        opsNote: "valid note",
      }),
    ).toMatchObject({ success: false });
    expect(
      normalizeOrgAuthClosureMetadataInput({
        externalReference: "OPS-2026-0013",
        opsNote: "N".repeat(1001),
      }),
    ).toMatchObject({ success: false });
  });

  it("audits invalid closure input without invoking the mutation", async () => {
    const { auditLogRepository, handlers, mutationInputs } =
      createClosureHandlers();
    const response = await handlers.upgrade!.POST(
      createPostRequest(
        `/api/v1/org-auths/${activeStandardOrgAuth.publicId}/upgrade`,
        {
          externalReference: "OPS-2026-0014\r\nforged=audit-entry",
          opsNote: "invalid reference must fail closed",
        },
      ),
      routeContext,
    );

    await expect(response.json()).resolves.toMatchObject({ code: 422601 });
    expect(mutationInputs).toEqual([]);
    expect(auditLogRepository.appendAuditLog).toHaveBeenCalledWith(
      expect.objectContaining({
        actionType: "org_auth.manual_upgrade",
        metadataSummary: "redacted org_auth invalid input metadata",
        resultStatus: "failed",
        targetPublicId: activeStandardOrgAuth.publicId,
      }),
    );
  });

  it("audits a fail-closed response when a closure runtime is unavailable", async () => {
    const mutationInputs: unknown[] = [];
    const repositories: AdminOrganizationOrgAuthRuntimeRepositories =
      createRepositories(mutationInputs);
    repositories.upgradeOrgAuth = undefined;
    const handlers = createAdminOrganizationOrgAuthRuntimeRouteHandlers({
      repositories,
      sessionService: createAdminSessionService(),
    }).orgAuths as ClosureActionRouteHandlers;

    const response = await handlers.upgrade!.POST(
      createPostRequest(
        `/api/v1/org-auths/${activeStandardOrgAuth.publicId}/upgrade`,
        {
          externalReference: "OPS-2026-0015",
          opsNote: "runtime must exist",
        },
      ),
      routeContext,
    );

    await expect(response.json()).resolves.toMatchObject({ code: 503006 });
    expect(mutationInputs).toEqual([]);
    expect(
      repositories.auditLogRepository!.appendAuditLog,
    ).toHaveBeenCalledWith(
      expect.objectContaining({
        actionType: "org_auth.manual_upgrade",
        metadataSummary: "redacted org_auth closure unavailable metadata",
        resultStatus: "failed",
        targetPublicId: activeStandardOrgAuth.publicId,
      }),
    );
  });

  it("denies an ineligible admin role and audits the attempted action", async () => {
    const mutationInputs: unknown[] = [];
    const repositories = createRepositories(mutationInputs);
    const handlers = createAdminOrganizationOrgAuthRuntimeRouteHandlers({
      repositories,
      sessionService: createAdminSessionService("content_admin"),
    }).orgAuths as ClosureActionRouteHandlers;

    const response = await handlers.upgrade!.POST(
      createPostRequest(
        `/api/v1/org-auths/${activeStandardOrgAuth.publicId}/upgrade`,
        {
          externalReference: "OPS-2026-0016",
          opsNote: "content admin must not mutate authorization",
        },
      ),
      routeContext,
    );

    await expect(response.json()).resolves.toMatchObject({
      message: "Admin permission denied.",
    });
    expect(mutationInputs).toEqual([]);
    expect(
      repositories.auditLogRepository!.appendAuditLog,
    ).toHaveBeenCalledWith(
      expect.objectContaining({
        actionType: "org_auth.manual_upgrade",
        metadataSummary: "redacted org_auth permission denial metadata",
        resultStatus: "failed",
        targetPublicId: activeStandardOrgAuth.publicId,
      }),
    );
  });

  it("records the eligible manager role when an admin has multiple roles", async () => {
    const mutationInputs: unknown[] = [];
    const repositories = createRepositories(mutationInputs);
    const handlers = createAdminOrganizationOrgAuthRuntimeRouteHandlers({
      repositories,
      sessionService: createAdminSessionService(["content_admin", "ops_admin"]),
    }).orgAuths as ClosureActionRouteHandlers;

    await handlers.upgrade!.POST(
      createPostRequest(
        `/api/v1/org-auths/${activeStandardOrgAuth.publicId}/upgrade`,
        {
          externalReference: "OPS-2026-0018",
          opsNote: "record the role that authorizes this action",
        },
      ),
      routeContext,
    );

    expect(mutationInputs).toEqual([
      expect.objectContaining({
        input: expect.objectContaining({
          operator: expect.objectContaining({ role: "ops_admin" }),
        }),
      }),
    ]);
  });

  it("returns a stable conflict and audits a rejected quota decrease", async () => {
    const mutationInputs: unknown[] = [];
    const repositories = createRepositories(mutationInputs);
    repositories.expandOrgAuthQuota = vi
      .fn()
      .mockResolvedValue({ status: "conflict" });
    const handlers = createAdminOrganizationOrgAuthRuntimeRouteHandlers({
      repositories,
      sessionService: createAdminSessionService(),
    }).orgAuths as ClosureActionRouteHandlers;

    const response = await handlers.expandQuota!.POST(
      createPostRequest(
        `/api/v1/org-auths/${activeStandardOrgAuth.publicId}/expand-quota`,
        {
          accountQuota: 99,
          externalReference: "OPS-2026-0017",
          opsNote: "quota decrease must fail closed",
        },
      ),
      routeContext,
    );

    await expect(response.json()).resolves.toMatchObject({ code: 409007 });
    expect(
      repositories.auditLogRepository!.appendAuditLog,
    ).toHaveBeenCalledWith(
      expect.objectContaining({
        actionType: "org_auth.expand_quota",
        metadataSummary: "redacted org_auth closure conflict metadata",
        resultStatus: "failed",
        targetPublicId: activeStandardOrgAuth.publicId,
      }),
    );
  });

  it("provides actionable renewal, upgrade, replacement, and quota expansion controls", () => {
    const ClosureActionPanel = (
      orgAuthPageModule as typeof orgAuthPageModule & {
        OrgAuthClosureActionPanel?: React.ComponentType<{
          orgAuth: OrgAuthDto;
          onSubmit: (action: string, input: unknown) => void;
        }>;
      }
    ).OrgAuthClosureActionPanel;

    expect(ClosureActionPanel).toBeTypeOf("function");

    const onSubmit = vi.fn();
    render(
      createElement(ClosureActionPanel!, {
        orgAuth: activeStandardOrgAuth,
        onSubmit,
      }),
    );

    expect(screen.getByRole("button", { name: "续费接续" })).toBeVisible();
    expect(screen.getByRole("button", { name: "手动升级" })).toBeVisible();
    expect(screen.getByRole("button", { name: "替换授权" })).toBeVisible();
    expect(screen.getByRole("button", { name: "增量扩容" })).toBeVisible();

    fireEvent.click(screen.getByRole("button", { name: "增量扩容" }));
    fireEvent.change(screen.getByLabelText("新账号额度"), {
      target: { value: "150" },
    });
    fireEvent.change(screen.getByLabelText("外部参考号"), {
      target: { value: "OPS-2026-0011" },
    });
    fireEvent.change(screen.getByLabelText("运营备注"), {
      target: { value: "追加五十个账号额度" },
    });
    fireEvent.click(screen.getByRole("button", { name: "复核增量扩容" }));

    expect(onSubmit).toHaveBeenCalledWith("expandQuota", {
      accountQuota: 150,
      externalReference: "OPS-2026-0011",
      opsNote: "追加五十个账号额度",
    });
  });

  it("renders the redacted authorization action timeline", () => {
    const OrgAuthTimeline = (
      orgAuthPageModule as typeof orgAuthPageModule & {
        OrgAuthTimeline?: React.ComponentType<{
          events: {
            actionType: string;
            actorRole: string;
            createdAt: string;
            metadataSummary: string | null;
            publicId: string;
            resultStatus: string;
          }[];
        }>;
      }
    ).OrgAuthTimeline;

    expect(OrgAuthTimeline).toBeTypeOf("function");

    render(
      createElement(OrgAuthTimeline!, {
        events: [
          {
            actionType: "org_auth.manual_upgrade",
            actorRole: "ops_admin",
            createdAt: "2026-07-20T18:00:00.000Z",
            metadataSummary:
              "redacted org_auth manual upgrade metadata; external reference recorded",
            publicId: "audit-log-public-001",
            resultStatus: "success",
          },
        ],
      }),
    );

    expect(screen.getByText("手动升级")).toBeVisible();
    expect(screen.getByText(/执行成功/)).toBeVisible();
    expect(screen.getByText(/external reference recorded/)).toBeVisible();
  });

  it("exposes an ops_manual upgrade command instead of overwriting source edition", async () => {
    const { handlers, mutationInputs } = createClosureHandlers();
    const handler = handlers.upgrade?.POST;

    expect(handler).toBeTypeOf("function");

    const response = await handler!(
      createPostRequest(
        `/api/v1/org-auths/${activeStandardOrgAuth.publicId}/upgrade`,
        {
          externalReference: "OPS-2026-0009",
          opsNote: "客户已确认标准版升级高级版",
        },
      ),
      routeContext,
    );

    await expect(response.json()).resolves.toMatchObject({
      code: 0,
      data: {
        action: "manual_upgrade",
        orgAuth: {
          publicId: activeStandardOrgAuth.publicId,
          edition: "standard",
          effectiveEdition: "advanced",
          upgradeStatus: "active",
        },
      },
    });
    expect(mutationInputs).toEqual([
      {
        action: "upgradeOrgAuth",
        input: {
          externalReference: "OPS-2026-0009",
          operator: {
            publicId: "admin-public-001",
            requestIp: "203.0.113.9",
            role: "ops_admin",
          },
          opsNote: "客户已确认标准版升级高级版",
          publicId: activeStandardOrgAuth.publicId,
        },
      },
    ]);
  });

  it("exposes one transactional replacement command", async () => {
    const { handlers, mutationInputs } = createClosureHandlers();
    const handler = handlers.replace?.POST;

    expect(handler).toBeTypeOf("function");

    const response = await handler!(
      createPostRequest(
        `/api/v1/org-auths/${activeStandardOrgAuth.publicId}/replace`,
        {
          accountQuota: 120,
          authScopeType: "current_and_descendants",
          edition: "advanced",
          expiresAt: "2028-01-01T00:00:00.000Z",
          externalReference: "OPS-2026-0010",
          level: 3,
          name: "杭州烟草高级授权",
          opsNote: "不中断替换旧授权",
          organizationPublicIds: [],
          profession: "monopoly",
          purchaserOrganizationPublicId: "organization-public-001",
          startsAt: "2026-07-20T00:00:00.000Z",
        },
      ),
      routeContext,
    );

    await expect(response.json()).resolves.toMatchObject({
      code: 0,
      data: {
        action: "transactional_replacement",
        previousOrgAuth: {
          publicId: activeStandardOrgAuth.publicId,
          status: "cancelled",
        },
        orgAuth: {
          edition: "advanced",
          status: "active",
        },
      },
    });
    expect(mutationInputs).toEqual([
      {
        action: "replaceOrgAuth",
        input: expect.objectContaining({
          externalReference: "OPS-2026-0010",
          operator: {
            publicId: "admin-public-001",
            requestIp: "203.0.113.9",
            role: "ops_admin",
          },
          opsNote: "不中断替换旧授权",
          publicId: activeStandardOrgAuth.publicId,
          replacement: expect.objectContaining({
            accountQuota: 120,
            edition: "advanced",
            profession: "monopoly",
          }),
        }),
      },
    ]);
  });

  it("exposes a non-overlapping renewal successor with explicit lineage", async () => {
    const { handlers, mutationInputs } = createClosureHandlers();
    const handler = handlers.renew?.POST;

    expect(handler).toBeTypeOf("function");

    const response = await handler!(
      createPostRequest(
        `/api/v1/org-auths/${activeStandardOrgAuth.publicId}/renew`,
        {
          accountQuota: 120,
          expiresAt: "2028-01-01T00:00:00.000Z",
          externalReference: "OPS-2026-0012",
          opsNote: "原授权到期后无缝接续",
        },
      ),
      routeContext,
    );

    await expect(response.json()).resolves.toMatchObject({
      code: 0,
      data: {
        action: "renewal_successor",
        previousOrgAuth: { publicId: activeStandardOrgAuth.publicId },
        orgAuth: {
          publicId: "org-auth-public-renewal-001",
          startsAt: activeStandardOrgAuth.expiresAt,
          expiresAt: "2028-01-01T00:00:00.000Z",
        },
      },
    });
    expect(mutationInputs).toEqual([
      {
        action: "renewOrgAuth",
        input: {
          accountQuota: 120,
          expiresAt: new Date("2028-01-01T00:00:00.000Z"),
          externalReference: "OPS-2026-0012",
          operator: {
            publicId: "admin-public-001",
            requestIp: "203.0.113.9",
            role: "ops_admin",
          },
          opsNote: "原授权到期后无缝接续",
          publicId: activeStandardOrgAuth.publicId,
        },
      },
    ]);
  });

  it("exposes increase-only quota expansion for the same active authorization", async () => {
    const { handlers, mutationInputs } = createClosureHandlers();
    const handler = handlers.expandQuota?.POST;

    expect(handler).toBeTypeOf("function");

    const response = await handler!(
      createPostRequest(
        `/api/v1/org-auths/${activeStandardOrgAuth.publicId}/expand-quota`,
        {
          accountQuota: 150,
          externalReference: "OPS-2026-0011",
          opsNote: "追加五十个账号额度",
        },
      ),
      routeContext,
    );

    await expect(response.json()).resolves.toMatchObject({
      code: 0,
      data: {
        action: "quota_expansion",
        orgAuth: {
          publicId: activeStandardOrgAuth.publicId,
          accountQuota: 150,
          usedQuota: 40,
        },
      },
    });
    expect(mutationInputs).toEqual([
      {
        action: "expandOrgAuthQuota",
        input: {
          accountQuota: 150,
          externalReference: "OPS-2026-0011",
          operator: {
            publicId: "admin-public-001",
            requestIp: "203.0.113.9",
            role: "ops_admin",
          },
          opsNote: "追加五十个账号额度",
          publicId: activeStandardOrgAuth.publicId,
        },
      },
    ]);
  });
});
