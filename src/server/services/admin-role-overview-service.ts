import {
  createErrorResponse,
  createSuccessResponse,
  type ApiResponse,
} from "../contracts/api-response";
import type {
  AdminContentOverviewSummaryDto,
  AdminOperationsOverviewSummaryDto,
  AdminOverviewScope,
  AdminRoleOverviewBoundaryDto,
  AdminRoleOverviewDto,
} from "../contracts/admin-role-overview-contract";
import type { AdminRole } from "../models/auth";

export const ADMIN_ROLE_OVERVIEW_PERMISSION_DENIED_CODE = 403190;
export const ADMIN_ROLE_OVERVIEW_PERMISSION_DENIED_MESSAGE =
  "Admin overview permission denied.";

export type AdminRoleOverviewActor = {
  roles: readonly AdminRole[];
};

export type AdminRoleOverviewRepository = {
  readOperationsSummary(now: Date): Promise<AdminOperationsOverviewSummaryDto>;
  readContentSummary(): Promise<AdminContentOverviewSummaryDto>;
};

const overviewBoundary: AdminRoleOverviewBoundaryDto = {
  dataMode: "aggregate_only",
  highRiskMutationAllowed: false,
  sensitiveDetailIncluded: false,
};

function hasRole(actor: AdminRoleOverviewActor, role: AdminRole): boolean {
  return actor.roles.includes(role);
}

function canReadScope(
  actor: AdminRoleOverviewActor,
  scope: AdminOverviewScope,
): boolean {
  if (scope === "platform") {
    return hasRole(actor, "super_admin");
  }

  if (scope === "operations") {
    return hasRole(actor, "super_admin") || hasRole(actor, "ops_admin");
  }

  return hasRole(actor, "super_admin") || hasRole(actor, "content_admin");
}

function resolveRoleLabel(
  actor: AdminRoleOverviewActor,
  scope: Exclude<AdminOverviewScope, "platform">,
): "超级管理员" | "运营管理员" | "内容管理员" {
  if (hasRole(actor, "super_admin")) {
    return "超级管理员";
  }

  return scope === "operations" ? "运营管理员" : "内容管理员";
}

export async function buildAdminRoleOverview(input: {
  actor: AdminRoleOverviewActor;
  now: Date;
  repository: AdminRoleOverviewRepository;
  scope: AdminOverviewScope;
}): Promise<ApiResponse<AdminRoleOverviewDto | null>> {
  if (!canReadScope(input.actor, input.scope)) {
    return createErrorResponse(
      ADMIN_ROLE_OVERVIEW_PERMISSION_DENIED_CODE,
      ADMIN_ROLE_OVERVIEW_PERMISSION_DENIED_MESSAGE,
    );
  }

  const updatedAt = input.now.toISOString();

  if (input.scope === "platform") {
    const [operations, content] = await Promise.all([
      input.repository.readOperationsSummary(input.now),
      input.repository.readContentSummary(),
    ]);

    return createSuccessResponse({
      scope: "platform",
      roleLabel: "超级管理员",
      operations,
      content,
      boundary: overviewBoundary,
      updatedAt,
    });
  }

  if (input.scope === "operations") {
    return createSuccessResponse({
      scope: "operations",
      roleLabel: resolveRoleLabel(input.actor, input.scope),
      summary: await input.repository.readOperationsSummary(input.now),
      boundary: overviewBoundary,
      updatedAt,
    });
  }

  return createSuccessResponse({
    scope: "content",
    roleLabel: resolveRoleLabel(input.actor, input.scope),
    summary: await input.repository.readContentSummary(),
    boundary: overviewBoundary,
    updatedAt,
  });
}
