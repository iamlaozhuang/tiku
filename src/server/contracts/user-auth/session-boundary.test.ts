import { describe, expect, it } from "vitest";

import type { AuthContextDto } from "../auth-contract";
import {
  createPostLoginSessionBoundary,
  resolveAdminWorkspaceLandingPath,
  resolveSessionRouteAccess,
} from "./session-boundary";

const studentAuthContext: AuthContextDto = {
  user: {
    publicId: "user-student-redacted",
    phone: "redacted",
    name: "Redacted Student",
    userType: "personal",
    status: "active",
    lockedUntilAt: null,
    employeePublicId: null,
    organizationPublicId: null,
    adminPublicId: null,
    adminRoles: [],
  },
  session: {
    expiresAt: "2026-07-12T12:00:00.000Z",
  },
};

const adminAuthContext: AuthContextDto = {
  user: {
    ...studentAuthContext.user,
    userType: null,
    adminPublicId: "admin-redacted",
    adminRoles: ["ops_admin"],
  },
  session: studentAuthContext.session,
};

describe("post-login session boundary", () => {
  it("routes pure organization admin roles to the organization workspace", () => {
    expect(
      resolveAdminWorkspaceLandingPath({
        adminPublicId: "admin-org-standard",
        adminRoles: ["org_standard_admin"],
        userType: null,
      }),
    ).toBe("/organization/portal");
    expect(
      createPostLoginSessionBoundary({
        adminPublicId: "admin-org-advanced",
        adminRoles: ["org_advanced_admin"],
        userType: null,
      }),
    ).toMatchObject({
      exposeBearerTokenToClient: false,
      redirectPath: "/organization/portal",
      sessionPersistenceMode: "server_session",
    });
  });

  it("does not route contaminated organization admin roles to the global operations workspace", () => {
    expect(
      createPostLoginSessionBoundary({
        adminPublicId: "admin-org-standard",
        adminRoles: ["org_standard_admin", "ops_admin"],
        userType: null,
      }).redirectPath,
    ).toBe("/organization/portal");
  });

  it("separates unauthenticated, forbidden, authorized, and runtime-error route access", () => {
    expect(
      resolveSessionRouteAccess({ code: 401001, data: null }, "student"),
    ).toEqual({ authContext: null, status: "unauthorized" });

    expect(
      resolveSessionRouteAccess(
        { code: 0, data: studentAuthContext },
        "student",
      ),
    ).toEqual({ authContext: studentAuthContext, status: "authorized" });

    expect(
      resolveSessionRouteAccess({ code: 0, data: adminAuthContext }, "student"),
    ).toEqual({ authContext: adminAuthContext, status: "forbidden" });

    expect(
      resolveSessionRouteAccess({ code: 503001, data: null }, "admin"),
    ).toEqual({ authContext: null, status: "error" });
  });
});
