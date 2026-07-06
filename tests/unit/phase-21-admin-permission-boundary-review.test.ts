import { describe, expect, it } from "vitest";

import { createAdminAiAuditLogOpsService } from "@/server/services/admin-ai-audit-log-ops-service";
import { createAdminContentKnowledgeOpsService } from "@/server/services/admin-content-knowledge-ops-service";
import { createAdminUserOrgAuthOpsService } from "@/server/services/admin-user-org-auth-ops-service";

describe("phase 21 admin permission boundary review", () => {
  it("enforces role boundaries for high-risk admin operations", async () => {
    const superAdminUserOps = createAdminUserOrgAuthOpsService({
      actor: {
        publicId: "admin-super-001",
        roles: ["super_admin"],
        canViewRedeemCodePlainText: true,
      },
    });
    const opsAdminUserOps = createAdminUserOrgAuthOpsService({
      actor: {
        publicId: "admin-ops-001",
        roles: ["ops_admin"],
        canViewRedeemCodePlainText: false,
      },
    });
    const contentAdminUserOps = createAdminUserOrgAuthOpsService({
      actor: {
        publicId: "admin-content-001",
        roles: ["content_admin"],
        canViewRedeemCodePlainText: false,
      },
    });
    const contentAdminKnowledgeOps = createAdminContentKnowledgeOpsService({
      actor: {
        publicId: "admin-content-001",
        roles: ["content_admin"],
      },
    });
    const opsAdminKnowledgeOps = createAdminContentKnowledgeOpsService({
      actor: {
        publicId: "admin-ops-001",
        roles: ["ops_admin"],
      },
    });
    const superAdminAiOps = createAdminAiAuditLogOpsService({
      actor: {
        publicId: "admin-super-001",
        roles: ["super_admin"],
      },
    });
    const opsAdminAiOps = createAdminAiAuditLogOpsService({
      actor: {
        publicId: "admin-ops-001",
        roles: ["ops_admin"],
      },
    });

    await expect(
      superAdminUserOps.resetUserPassword("user-public-001"),
    ).resolves.toMatchObject({
      code: 0,
      message: "ok",
      data: {
        userPublicId: "user-public-001",
        oneTimePasswordPlainText: expect.any(String),
        distributionWindow: {
          visibleOnce: true,
          sessionRevocation: "not_executed_in_local_contract",
        },
      },
    });
    await expect(
      opsAdminUserOps.resetUserPassword("user-public-001"),
    ).resolves.toMatchObject({
      code: 0,
      message: "ok",
      data: {
        userPublicId: "user-public-001",
        oneTimePasswordPlainText: expect.any(String),
        distributionWindow: {
          visibleOnce: true,
          sessionRevocation: "not_executed_in_local_contract",
        },
      },
    });
    await expect(
      contentAdminUserOps.resetUserPassword("user-public-001"),
    ).resolves.toEqual({
      code: 403601,
      message: "Admin permission denied.",
      data: null,
    });

    await expect(
      contentAdminKnowledgeOps.triggerResourceVectorRebuild(
        "resource-public-001",
      ),
    ).resolves.toEqual({
      code: 0,
      message: "ok",
      data: null,
    });
    await expect(
      opsAdminKnowledgeOps.triggerResourceVectorRebuild("resource-public-001"),
    ).resolves.toEqual({
      code: 403621,
      message: "Admin permission denied.",
      data: null,
    });

    await expect(
      superAdminAiOps.enableModelConfig("model-config-public-001"),
    ).resolves.toEqual({
      code: 0,
      message: "ok",
      data: null,
    });
    await expect(
      opsAdminAiOps.enableModelConfig("model-config-public-001"),
    ).resolves.toEqual({
      code: 403641,
      message: "Admin permission denied.",
      data: null,
    });
  });

  it("rejects non-admin disabled or permissionless actors before high-risk operations", async () => {
    const noRoleUserOps = createAdminUserOrgAuthOpsService({
      actor: {
        publicId: "user-not-admin-001",
        roles: [],
        canViewRedeemCodePlainText: false,
      },
    });
    const disabledSuperAdminAiOps = createAdminAiAuditLogOpsService({
      actor: {
        publicId: "admin-disabled-001",
        roles: ["super_admin"],
        status: "disabled",
      },
    });

    await expect(
      noRoleUserOps.resetUserPassword("user-public-001"),
    ).resolves.toEqual({
      code: 403601,
      message: "Admin permission denied.",
      data: null,
    });
    await expect(
      disabledSuperAdminAiOps.enableModelConfig("model-config-public-001"),
    ).resolves.toEqual({
      code: 403641,
      message: "Admin permission denied.",
      data: null,
    });
  });

  it("denies publicId tampering without leaking internal identifiers", async () => {
    const opsAdminUserOps = createAdminUserOrgAuthOpsService({
      actor: {
        publicId: "admin-ops-001",
        roles: ["ops_admin"],
        canViewRedeemCodePlainText: false,
      },
    });
    const contentAdminKnowledgeOps = createAdminContentKnowledgeOpsService({
      actor: {
        publicId: "admin-content-001",
        roles: ["content_admin"],
      },
    });
    const superAdminAiOps = createAdminAiAuditLogOpsService({
      actor: {
        publicId: "admin-super-001",
        roles: ["super_admin"],
      },
    });

    await expect(
      opsAdminUserOps.resetUserPassword("user-public-tampered"),
    ).resolves.toEqual({
      code: 404601,
      message: "Admin resource not found.",
      data: null,
    });
    await expect(
      contentAdminKnowledgeOps.triggerResourceVectorRebuild(
        "resource-public-tampered",
      ),
    ).resolves.toEqual({
      code: 404621,
      message: "Admin resource not found.",
      data: null,
    });
    await expect(
      superAdminAiOps.enableModelConfig("model-config-public-tampered"),
    ).resolves.toEqual({
      code: 404641,
      message: "Admin resource not found.",
      data: null,
    });
  });
});
