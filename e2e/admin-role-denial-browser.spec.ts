import { expect, test, type Page, type Route } from "@playwright/test";

type AdminRole = "content_admin" | "ops_admin";

function createAdminSessionPayload(adminRole: AdminRole) {
  return {
    code: 0,
    message: "ok",
    data: {
      user: {
        publicId: `user-${adminRole}-browser-fixture`,
        phone: "13900009999",
        name: `${adminRole} browser fixture`,
        userType: null,
        status: "active",
        lockedUntilAt: null,
        employeePublicId: null,
        organizationPublicId: null,
        adminPublicId: `admin-${adminRole}-browser-fixture`,
        adminRoles: [adminRole],
      },
      session: {
        expiresAt: "2026-05-29T04:00:00.000Z",
      },
    },
  };
}

function createDeniedPayload(code: number) {
  return {
    code,
    message: "Admin permission denied.",
    data: null,
  };
}

async function fulfillJson(route: Route, status: number, payload: unknown) {
  await route.fulfill({
    body: JSON.stringify(payload),
    contentType: "application/json",
    status,
  });
}

async function installRestrictedAdminFixture(
  page: Page,
  input: {
    adminRole: AdminRole;
    deniedCode: number;
    deniedPaths: string[];
    sessionToken: string;
  },
) {
  await page.addInitScript(
    ({ sessionToken }) => {
      localStorage.setItem("tiku.localSessionToken", sessionToken);
    },
    { sessionToken: input.sessionToken },
  );

  await page.route("**/api/v1/**", async (route) => {
    const requestUrl = new URL(route.request().url());

    if (requestUrl.pathname === "/api/v1/sessions") {
      await fulfillJson(route, 200, createAdminSessionPayload(input.adminRole));
      return;
    }

    if (input.deniedPaths.includes(requestUrl.pathname)) {
      await fulfillJson(route, 403, createDeniedPayload(input.deniedCode));
      return;
    }

    await route.continue();
  });
}

test.describe("admin role denial browser fixtures", () => {
  test("denies content_admin access to system-ops browser data", async ({
    page,
  }) => {
    const sessionToken = "synthetic-content-admin-browser-session";
    await installRestrictedAdminFixture(page, {
      adminRole: "content_admin",
      deniedCode: 403601,
      deniedPaths: [
        "/api/v1/organizations",
        "/api/v1/org-auths",
        "/api/v1/redeem-codes",
        "/api/v1/users",
      ],
      sessionToken,
    });

    const deniedResponsePromise = page.waitForResponse((response) => {
      return new URL(response.url()).pathname === "/api/v1/organizations";
    });
    await page.goto("/ops/organizations");

    const deniedResponse = await deniedResponsePromise;
    const deniedPayload = (await deniedResponse.json()) as {
      code: number;
      data: unknown;
    };

    expect(deniedResponse.status()).toBe(403);
    expect(deniedPayload).toMatchObject({ code: 403601, data: null });
    await expect(page).toHaveURL(/\/ops\/organizations$/);
    await expect(
      page.getByTestId("system-ops-org-auth-create-entry"),
    ).toHaveCount(0);
    await expect(page.locator("body")).not.toContainText(sessionToken);
  });

  test("denies ops_admin access to content authoring browser data", async ({
    page,
  }) => {
    const sessionToken = "synthetic-ops-admin-browser-session";
    await installRestrictedAdminFixture(page, {
      adminRole: "ops_admin",
      deniedCode: 403621,
      deniedPaths: [
        "/api/v1/questions",
        "/api/v1/materials",
        "/api/v1/papers",
        "/api/v1/knowledge-nodes",
        "/api/v1/resources",
      ],
      sessionToken,
    });

    const deniedResponsePromise = page.waitForResponse((response) => {
      return new URL(response.url()).pathname === "/api/v1/questions";
    });
    await page.goto("/content/questions");

    const deniedResponse = await deniedResponsePromise;
    const deniedPayload = (await deniedResponse.json()) as {
      code: number;
      data: unknown;
    };

    expect(deniedResponse.status()).toBe(403);
    expect(deniedPayload).toMatchObject({ code: 403621, data: null });
    await expect(page).toHaveURL(/\/content\/questions$/);
    await expect(page.getByTestId("content-action-runtime-ready")).toHaveCount(
      0,
    );
    await expect(page.locator('[data-testid^="question-edit-"]')).toHaveCount(
      0,
    );
    await expect(page.locator("body")).not.toContainText(sessionToken);
  });
});
