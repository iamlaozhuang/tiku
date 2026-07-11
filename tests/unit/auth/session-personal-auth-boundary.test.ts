import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { createPostLoginSessionBoundary } from "@/server/contracts/user-auth/session-boundary";

const workspaceRoot = process.cwd();

function readAllowedSource(sourcePath: string) {
  return readFileSync(join(workspaceRoot, sourcePath), "utf8");
}

function readOptionalAllowedSource(sourcePath: string) {
  const absoluteSourcePath = join(workspaceRoot, sourcePath);

  return existsSync(absoluteSourcePath)
    ? readFileSync(absoluteSourcePath, "utf8")
    : "";
}

describe("unified repair auth session personal auth boundary", () => {
  it("routes modeled admin roles to role-specific backend workspaces", () => {
    expect(
      createPostLoginSessionBoundary({
        userType: null,
        adminPublicId: "admin-ops-public-001",
        adminRoles: ["ops_admin"],
      }).redirectPath,
    ).toBe("/ops/overview");
    expect(
      createPostLoginSessionBoundary({
        userType: null,
        adminPublicId: "admin-content-public-001",
        adminRoles: ["content_admin"],
      }).redirectPath,
    ).toBe("/content/overview");
    expect(
      createPostLoginSessionBoundary({
        userType: null,
        adminPublicId: "admin-super-public-001",
        adminRoles: ["super_admin"],
      }).redirectPath,
    ).toBe("/admin/overview");
    expect(
      createPostLoginSessionBoundary({
        userType: null,
        adminPublicId: "admin-org-standard-public-001",
        adminRoles: ["org_standard_admin"],
      }).redirectPath,
    ).toBe("/organization/portal");
    expect(
      createPostLoginSessionBoundary({
        userType: null,
        adminPublicId: "admin-org-advanced-public-001",
        adminRoles: ["org_advanced_admin"],
      }).redirectPath,
    ).toBe("/organization/portal");
  });

  it("keeps login out of browser localStorage bearer-token persistence", async () => {
    const loginPageSource = readAllowedSource("src/app/(auth)/login/page.tsx");
    const sessionBoundarySource = readOptionalAllowedSource(
      "src/server/contracts/user-auth/session-boundary.ts",
    );

    expect(loginPageSource).not.toContain("localStorage");
    expect(loginPageSource).not.toContain("SESSION_TOKEN_STORAGE_KEY");
    expect(loginPageSource).toContain("createPostLoginSessionBoundary");
    expect(sessionBoundarySource).toContain(
      'sessionPersistenceMode: "server_session"',
    );
    expect(sessionBoundarySource).toContain("exposeBearerTokenToClient: false");
  });

  it("uses an authorization continuation contract after registration", async () => {
    const registerPageSource = readAllowedSource(
      "src/app/(auth)/register/page.tsx",
    );
    const redeemContinuitySource = readOptionalAllowedSource(
      "src/server/contracts/authorization/redeem-continuity.ts",
    );

    expect(registerPageSource).toContain(
      "createRegistrationAuthorizationContinuation",
    );
    expect(registerPageSource).not.toContain('router.replace("/redeem-code")');
    expect(redeemContinuitySource).toContain('authScopeType: "personal_auth"');
    expect(redeemContinuitySource).toContain(
      "requiresAuthenticatedSession: true",
    );
  });

  it("records password reset as an explicit admin-mediated boundary", async () => {
    const resetPasswordRouteSource = readAllowedSource(
      "src/app/api/v1/users/[publicId]/reset-password/route.ts",
    );
    const passwordResetCoverageSource = readOptionalAllowedSource(
      "src/server/contracts/user-auth/password-reset-coverage.ts",
    );

    expect(resetPasswordRouteSource).toContain("resetPassword");
    expect(passwordResetCoverageSource).toContain(
      'adminMediatedReset: "implemented"',
    );
    expect(passwordResetCoverageSource).toContain(
      'selfServiceReset: "future_product_decision_required"',
    );
  });
});
