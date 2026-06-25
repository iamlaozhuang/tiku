import { describe, expect, it } from "vitest";

import {
  createPostLoginSessionBoundary,
  resolveAdminWorkspaceLandingPath,
} from "./session-boundary";

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

  it.fails(
    "red: organization admin role contamination must not route to the global operations workspace",
    () => {
      expect(
        createPostLoginSessionBoundary({
          adminPublicId: "admin-org-standard",
          adminRoles: ["org_standard_admin", "ops_admin"],
          userType: null,
        }).redirectPath,
      ).not.toBe("/ops/users");
    },
  );
});
