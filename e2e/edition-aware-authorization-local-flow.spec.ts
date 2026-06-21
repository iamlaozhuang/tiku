import { expect, test, type Page, type Route } from "@playwright/test";

type ApiPayload<TData = unknown> = {
  code: number;
  message: string;
  data: TData | null;
  pagination?: unknown;
};

type AuthorizationBoundaryPayload = {
  authorizationContexts: EditionAwareAuthorizationContext[];
  authorizations: AuthorizationListItem[];
  effectiveAuthorizations: EffectiveAuthorizationListItem[];
};

type AuthorizationListItem = {
  publicId: string;
  authorizationType: "personal_auth" | "org_auth";
  profession: "monopoly" | "marketing" | "logistics";
  level: number;
  startsAt: string;
  expiresAt: string;
  status: "active" | "cancelled" | "expired";
  organizationPublicId: string | null;
  organizationName: string | null;
};

type EffectiveAuthorizationListItem = {
  profession: "monopoly" | "marketing" | "logistics";
  level: number;
  authorizationTypes: ("personal_auth" | "org_auth")[];
  expiresAt: string;
  status: "active";
};

type EditionAwareAuthorizationContext = {
  authorizationSource: "personal_auth" | "org_auth";
  authorizationPublicId: string;
  edition: "standard" | "advanced";
  effectiveEdition: "standard" | "advanced";
  upgradeStatus: "active" | "expired" | "none" | "revoked";
  profession: "monopoly" | "marketing" | "logistics";
  level: number;
  ownerType: "personal" | "organization";
  ownerPublicId: string;
  organizationPublicId: string | null;
  quotaOwnerType: "personal" | "organization";
  quotaOwnerPublicId: string;
  expiresAt: string;
  displayStatus: "active" | "cancelled" | "expired" | "revoked";
};

type OrgAuthListItem = {
  publicId: string;
  name: string;
  purchaserOrganizationPublicId: string;
  authScopeType: "current_and_descendants" | "specified_nodes";
  profession: "monopoly" | "marketing" | "logistics";
  level: number;
  accountQuota: number;
  usedQuota: number;
  edition: "standard" | "advanced";
  effectiveEdition: "standard" | "advanced";
  upgradeStatus: "active" | "expired" | "none" | "revoked";
  startsAt: string;
  expiresAt: string;
  status: "active" | "cancelled" | "expired";
  cancelledAt: string | null;
  organizationPublicIds: string[];
  createdAt: string;
  updatedAt: string;
};

const localSessionStorageKey = "tiku.localSessionToken";
const localStudentSessionValue = ["edition", "student", "session"].join("-");
const localAdminSessionValue = ["edition", "admin", "session"].join("-");

const forbiddenVisibleMarkers = [
  "Bearer ",
  "apiKey",
  "databaseUrl",
  "secretValue",
  "providerRequestPayload",
  "providerResponsePayload",
  "raw prompt",
  "raw answer",
  "raw generated AI content",
  "full paper content",
  "internalDbRow",
  "code_hash",
  "plainRedeemCode",
] as const;

const studentSessionPayload = createSuccessPayload({
  user: {
    publicId: "user-edition-student",
    phone: "13900000002",
    name: "Edition Student",
    userType: "personal",
    status: "active",
    lockedUntilAt: null,
    employeePublicId: null,
    organizationPublicId: null,
    adminPublicId: null,
    adminRoles: [],
  },
  session: {
    expiresAt: "2026-08-01T00:00:00.000Z",
  },
});

const adminSessionPayload = createSuccessPayload({
  user: {
    publicId: "user-edition-admin",
    phone: "13900000001",
    name: "Edition Admin",
    userType: null,
    status: "active",
    lockedUntilAt: null,
    employeePublicId: null,
    organizationPublicId: null,
    adminPublicId: "admin-edition-ops",
    adminRoles: ["super_admin"],
  },
  session: {
    expiresAt: "2026-08-01T00:00:00.000Z",
  },
});

const studentAuthorizationPayload =
  createSuccessPayload<AuthorizationBoundaryPayload>({
    authorizations: [
      createAuthorizationListItem({
        publicId: "personal-auth-visible-summary",
        authorizationType: "personal_auth",
      }),
    ],
    effectiveAuthorizations: [
      {
        profession: "monopoly",
        level: 3,
        authorizationTypes: ["personal_auth"],
        expiresAt: "2027-06-01T00:00:00.000Z",
        status: "active",
      },
    ],
    authorizationContexts: [
      createPersonalContext({
        authorizationPublicId: "personal-auth-standard-context",
        edition: "standard",
        effectiveEdition: "standard",
        upgradeStatus: "none",
      }),
      createPersonalContext({
        authorizationPublicId: "personal-auth-advanced-context",
        edition: "advanced",
        effectiveEdition: "advanced",
        upgradeStatus: "none",
      }),
      createPersonalContext({
        authorizationPublicId: "personal-auth-upgraded-context",
        edition: "standard",
        effectiveEdition: "advanced",
        upgradeStatus: "active",
      }),
      createPersonalContext({
        authorizationPublicId: "personal-auth-expired-upgrade-context",
        edition: "standard",
        effectiveEdition: "standard",
        upgradeStatus: "expired",
      }),
      createPersonalContext({
        authorizationPublicId: "personal-auth-revoked-upgrade-context",
        edition: "standard",
        effectiveEdition: "standard",
        upgradeStatus: "revoked",
        displayStatus: "revoked",
      }),
    ],
  });

const personalAuthPayload = createSuccessPayload({
  personalAuths: [
    {
      publicId: "personal-auth-visible-record",
      redeemCodePublicId: "redeem-code-redacted-public",
      profession: "monopoly",
      level: 3,
      startsAt: "2026-06-01T00:00:00.000Z",
      expiresAt: "2027-06-01T00:00:00.000Z",
      status: "active",
    },
  ],
});

const organizationPayload = createSuccessPayload({
  organizations: [
    {
      publicId: "org-edition-province",
      name: "版本授权省公司",
      orgTier: "province",
      parentOrganizationPublicId: null,
      status: "active",
      employeeCount: 8,
      authSummary: "专卖 3级 / 8 / 100",
    },
  ],
});

const employeePayload = createSuccessPayload({
  employees: [
    {
      publicId: "employee-edition-visible",
      userPublicId: "user-edition-employee",
      phone: "13800000000",
      name: "版本员工",
      organizationPublicId: "org-edition-province",
      status: "active",
    },
  ],
});

const orgAuthPayload = createPaginatedPayload({
  orgAuths: [
    createOrgAuth({
      publicId: "org-auth-standard-context",
      name: "企业标准版授权",
      edition: "standard",
      effectiveEdition: "standard",
      upgradeStatus: "none",
      usedQuota: 12,
      accountQuota: 100,
    }),
    createOrgAuth({
      publicId: "org-auth-advanced-context",
      name: "企业高级版授权",
      edition: "advanced",
      effectiveEdition: "advanced",
      upgradeStatus: "none",
      usedQuota: 42,
      accountQuota: 100,
    }),
    createOrgAuth({
      publicId: "org-auth-upgraded-context",
      name: "企业标准升级高级",
      edition: "standard",
      effectiveEdition: "advanced",
      upgradeStatus: "active",
      usedQuota: 48,
      accountQuota: 100,
    }),
    createOrgAuth({
      publicId: "org-auth-expired-upgrade-context",
      name: "企业升级过期回落",
      edition: "standard",
      effectiveEdition: "standard",
      upgradeStatus: "expired",
      usedQuota: 18,
      accountQuota: 100,
    }),
    createOrgAuth({
      publicId: "org-auth-revoked-upgrade-context",
      name: "企业升级撤销回落",
      edition: "standard",
      effectiveEdition: "standard",
      upgradeStatus: "revoked",
      usedQuota: 20,
      accountQuota: 100,
    }),
    createOrgAuth({
      publicId: "org-auth-scope-boundary-context",
      name: "授权范围不匹配边界",
      authScopeType: "specified_nodes",
      organizationPublicIds: [],
      edition: "advanced",
      effectiveEdition: "advanced",
      upgradeStatus: "none",
      usedQuota: 8,
      accountQuota: 100,
    }),
    createOrgAuth({
      publicId: "org-auth-quota-boundary-context",
      name: "额度不足边界",
      edition: "advanced",
      effectiveEdition: "advanced",
      upgradeStatus: "none",
      usedQuota: 100,
      accountQuota: 100,
    }),
  ],
});

test.describe("edition-aware authorization local flow", () => {
  test("renders personal standard, advanced, upgrade, expired, and revoked contexts", async ({
    page,
  }, testInfo) => {
    await setupStudentProfileRoutes(page);

    await page.goto("/profile");

    await expect(page.getByRole("heading", { name: "版本授权" })).toBeVisible();
    await expectPersonalContext(page, {
      publicId: "personal-auth-standard-context",
      effectiveEditionText: "标准版",
      sourceEditionText: "标准版",
      upgradeStatusText: "无升级",
    });
    await expectPersonalContext(page, {
      publicId: "personal-auth-advanced-context",
      effectiveEditionText: "高级版",
      sourceEditionText: "高级版",
      upgradeStatusText: "无升级",
    });
    await expectPersonalContext(page, {
      publicId: "personal-auth-upgraded-context",
      effectiveEditionText: "高级版",
      sourceEditionText: "标准版",
      upgradeStatusText: "升级生效",
    });
    await expectPersonalContext(page, {
      publicId: "personal-auth-expired-upgrade-context",
      effectiveEditionText: "标准版",
      sourceEditionText: "标准版",
      upgradeStatusText: "升级过期",
    });
    await expectPersonalContext(page, {
      publicId: "personal-auth-revoked-upgrade-context",
      effectiveEditionText: "标准版",
      sourceEditionText: "标准版",
      upgradeStatusText: "升级撤销",
    });
    await expectNoSensitiveBrowserText(page, [
      localStudentSessionValue,
      localAdminSessionValue,
    ]);

    await testInfo.attach("edition-aware-personal-summary", {
      body: JSON.stringify(
        {
          routeMode: "route_fulfilled_standard_envelopes",
          useCases: [
            "personal_standard",
            "personal_advanced",
            "personal_upgrade_active",
            "upgrade_expired_fallback",
            "upgrade_revoked_fallback",
          ],
          redactionStatus: "metadata_only_no_session_or_plaintext_code",
        },
        null,
        2,
      ),
      contentType: "application/json",
    });
  });

  test("renders organization edition, upgrade, scope, and quota boundaries", async ({
    page,
  }, testInfo) => {
    await setupAdminOrgAuthRoutes(page);
    await installBrowserSession(page, localAdminSessionValue);

    await page.goto("/ops/organizations");

    await expect(
      page.getByRole("heading", { name: "企业授权运营" }),
    ).toBeVisible();
    await expectOrgAuthContext(page, {
      publicId: "org-auth-standard-context",
      editionText: "标准版",
      quotaText: "12 / 100",
      upgradeStatusText: "无升级",
    });
    await expectOrgAuthContext(page, {
      publicId: "org-auth-advanced-context",
      editionText: "高级版",
      quotaText: "42 / 100",
      upgradeStatusText: "无升级",
    });
    await expectOrgAuthContext(page, {
      publicId: "org-auth-upgraded-context",
      editionText: "高级版",
      quotaText: "48 / 100",
      upgradeStatusText: "升级生效",
    });
    await expectOrgAuthContext(page, {
      publicId: "org-auth-expired-upgrade-context",
      editionText: "标准版",
      quotaText: "18 / 100",
      upgradeStatusText: "升级过期",
    });
    await expectOrgAuthContext(page, {
      publicId: "org-auth-revoked-upgrade-context",
      editionText: "标准版",
      quotaText: "20 / 100",
      upgradeStatusText: "升级撤销",
    });

    const scopeBoundary = page.locator(
      '[data-public-id="org-auth-scope-boundary-context"]',
    );
    await expect(scopeBoundary).toContainText("指定节点");
    await expect(scopeBoundary).toContainText("覆盖企业 无");

    const quotaBoundary = page.locator(
      '[data-public-id="org-auth-quota-boundary-context"]',
    );
    await expect(quotaBoundary).toContainText("额度不足边界");
    await expect(quotaBoundary).toContainText("100 / 100");
    await expectNoSensitiveBrowserText(page, [
      localStudentSessionValue,
      localAdminSessionValue,
    ]);

    await testInfo.attach("edition-aware-organization-summary", {
      body: JSON.stringify(
        {
          routeMode: "route_fulfilled_standard_envelopes",
          useCases: [
            "org_standard",
            "org_advanced",
            "org_manual_upgrade_active",
            "scope_mismatch_visible_boundary",
            "quota_insufficient_visible_boundary",
          ],
          redactionStatus: "metadata_only_no_session_or_plaintext_code",
        },
        null,
        2,
      ),
      contentType: "application/json",
    });
  });

  test("keeps duplicate upgrade, scope mismatch, and quota failure envelopes safe", async ({
    page,
  }, testInfo) => {
    await setupBoundaryProbeRoutes(page);
    await page.goto("/");

    const boundaryResponses = await page.evaluate(async () => {
      const postJson = async (path: string, body: unknown) => {
        const response = await fetch(path, {
          body: JSON.stringify(body),
          headers: {
            "content-type": "application/json",
          },
          method: "POST",
        });

        return response.json();
      };

      return {
        duplicateUpgrade: await postJson("/api/v1/auth-upgrades", {
          boundaryCase: "duplicateUpgrade",
        }),
        quotaInsufficient: await postJson("/api/v1/org-auths", {
          boundaryCase: "quotaInsufficient",
        }),
        scopeMismatch: await postJson("/api/v1/auth-upgrades", {
          boundaryCase: "scopeMismatch",
        }),
      };
    });

    expectStandardEnvelope(boundaryResponses.duplicateUpgrade);
    expectStandardEnvelope(boundaryResponses.quotaInsufficient);
    expectStandardEnvelope(boundaryResponses.scopeMismatch);
    expectCamelCaseJsonKeys(boundaryResponses);
    expectNoInternalIdKeys(boundaryResponses);
    expectNoSensitivePayload(boundaryResponses, [
      localStudentSessionValue,
      localAdminSessionValue,
    ]);
    expect(boundaryResponses).toMatchObject({
      duplicateUpgrade: {
        code: 409007,
        data: null,
      },
      quotaInsufficient: {
        code: 409006,
        data: null,
      },
      scopeMismatch: {
        code: 409008,
        data: null,
      },
    });

    await testInfo.attach("edition-aware-boundary-summary", {
      body: JSON.stringify(
        {
          routeMode: "route_fulfilled_standard_envelopes",
          useCases: [
            "personal_duplicate_upgrade_safe_failure",
            "scope_mismatch_safe_failure",
            "quota_insufficient_safe_failure",
          ],
          redactionStatus: "metadata_only_no_session_or_plaintext_code",
        },
        null,
        2,
      ),
      contentType: "application/json",
    });
  });
});

async function setupStudentProfileRoutes(page: Page) {
  await page.route("**/api/v1/sessions", (route) =>
    fulfillJson(route, studentSessionPayload),
  );
  await page.route("**/api/v1/authorizations", (route) =>
    fulfillJson(route, studentAuthorizationPayload),
  );
  await page.route("**/api/v1/personal-auths", (route) =>
    fulfillJson(route, personalAuthPayload),
  );
}

async function setupAdminOrgAuthRoutes(page: Page) {
  await page.route("**/api/v1/sessions", (route) =>
    fulfillJson(route, adminSessionPayload),
  );
  await page.route("**/api/v1/organizations?**", (route) =>
    fulfillJson(route, organizationPayload),
  );
  await page.route("**/api/v1/employees?**", (route) =>
    fulfillJson(route, employeePayload),
  );
  await page.route("**/api/v1/org-auths?**", (route) =>
    fulfillJson(route, orgAuthPayload),
  );
}

async function setupBoundaryProbeRoutes(page: Page) {
  await page.route("**/api/v1/auth-upgrades", async (route) => {
    const boundaryCase = readRequestBoundaryCase(route);

    if (boundaryCase === "duplicateUpgrade") {
      await fulfillJson(
        route,
        createErrorPayload(
          409007,
          "Duplicate edition upgrade is rejected safely.",
        ),
        409,
      );
      return;
    }

    await fulfillJson(
      route,
      createErrorPayload(409008, "Authorization scope mismatch is blocked."),
      409,
    );
  });
  await page.route("**/api/v1/org-auths", (route) =>
    fulfillJson(
      route,
      createErrorPayload(409006, "Authorization quota is insufficient."),
      409,
    ),
  );
}

async function installBrowserSession(page: Page, sessionValue: string) {
  await page.addInitScript(
    ([storageKey, browserSessionValue]) => {
      localStorage.setItem(storageKey, browserSessionValue);
    },
    [localSessionStorageKey, sessionValue] as [string, string],
  );
}

async function expectPersonalContext(
  page: Page,
  input: {
    effectiveEditionText: string;
    publicId: string;
    sourceEditionText: string;
    upgradeStatusText: string;
  },
) {
  const contextCard = page.locator(`[data-public-id="${input.publicId}"]`);

  await expect(contextCard).toBeVisible();
  await expect(contextCard).toContainText("专卖 3级");
  await expect(contextCard).toContainText("个人授权");
  await expect(contextCard).toContainText(input.effectiveEditionText);
  await expect(contextCard).toContainText(input.sourceEditionText);
  await expect(contextCard).toContainText(input.upgradeStatusText);
  await expect(contextCard).toContainText("额度归属：个人");
}

async function expectOrgAuthContext(
  page: Page,
  input: {
    editionText: string;
    publicId: string;
    quotaText: string;
    upgradeStatusText: string;
  },
) {
  const contextCard = page.locator(`[data-public-id="${input.publicId}"]`);

  await expect(contextCard).toBeVisible();
  await expect(contextCard).toContainText("专卖 3级");
  await expect(contextCard).toContainText(input.editionText);
  await expect(contextCard).toContainText(input.quotaText);
  await expect(contextCard).toContainText(input.upgradeStatusText);
}

async function expectNoSensitiveBrowserText(page: Page, values: string[]) {
  const body = page.locator("body");

  for (const marker of [...forbiddenVisibleMarkers, ...values]) {
    await expect(body).not.toContainText(marker);
  }
}

async function fulfillJson<TData>(
  route: Route,
  payload: ApiPayload<TData>,
  status = 200,
) {
  expectStandardEnvelope(payload);
  expectCamelCaseJsonKeys(payload);
  expectNoInternalIdKeys(payload);
  expectNoSensitivePayload(payload, [
    localStudentSessionValue,
    localAdminSessionValue,
  ]);
  await route.fulfill({
    body: JSON.stringify(payload),
    contentType: "application/json",
    status,
  });
}

function createSuccessPayload<TData>(data: TData): ApiPayload<TData> {
  return {
    code: 0,
    message: "ok",
    data,
  };
}

function createPaginatedPayload<TData>(data: TData): ApiPayload<TData> {
  return {
    ...createSuccessPayload(data),
    pagination: {
      page: 1,
      pageSize: 20,
      total: Array.isArray(Object.values(data as Record<string, unknown>)[0])
        ? (Object.values(data as Record<string, unknown>)[0] as unknown[])
            .length
        : 0,
      sortBy: "updatedAt",
      sortOrder: "desc",
    },
  };
}

function createErrorPayload(code: number, message: string): ApiPayload<null> {
  return {
    code,
    message,
    data: null,
  };
}

function createAuthorizationListItem(
  overrides: Partial<AuthorizationListItem> = {},
): AuthorizationListItem {
  return {
    publicId: "personal-auth-default-visible",
    authorizationType: "personal_auth",
    profession: "monopoly",
    level: 3,
    startsAt: "2026-06-01T00:00:00.000Z",
    expiresAt: "2027-06-01T00:00:00.000Z",
    status: "active",
    organizationPublicId: null,
    organizationName: null,
    ...overrides,
  };
}

function createPersonalContext(
  overrides: Partial<EditionAwareAuthorizationContext>,
): EditionAwareAuthorizationContext {
  return {
    authorizationSource: "personal_auth",
    authorizationPublicId: "personal-auth-context-default",
    edition: "standard",
    effectiveEdition: "standard",
    upgradeStatus: "none",
    profession: "monopoly",
    level: 3,
    ownerType: "personal",
    ownerPublicId: "user-edition-student",
    organizationPublicId: null,
    quotaOwnerType: "personal",
    quotaOwnerPublicId: "user-edition-student",
    expiresAt: "2027-06-01T00:00:00.000Z",
    displayStatus: "active",
    ...overrides,
  };
}

function createOrgAuth(overrides: Partial<OrgAuthListItem>): OrgAuthListItem {
  return {
    publicId: "org-auth-context-default",
    name: "企业授权默认项",
    purchaserOrganizationPublicId: "org-edition-province",
    authScopeType: "current_and_descendants",
    profession: "monopoly",
    level: 3,
    accountQuota: 100,
    usedQuota: 0,
    edition: "standard",
    effectiveEdition: "standard",
    upgradeStatus: "none",
    startsAt: "2026-06-01T00:00:00.000Z",
    expiresAt: "2027-06-01T00:00:00.000Z",
    status: "active",
    cancelledAt: null,
    organizationPublicIds: ["org-edition-province"],
    createdAt: "2026-06-01T00:00:00.000Z",
    updatedAt: "2026-06-01T00:00:00.000Z",
    ...overrides,
  };
}

function readRequestBoundaryCase(route: Route): string {
  const postData = route.request().postData();

  if (postData === null) {
    return "";
  }

  const parsedValue = JSON.parse(postData) as unknown;

  if (
    typeof parsedValue === "object" &&
    parsedValue !== null &&
    "boundaryCase" in parsedValue
  ) {
    const boundaryCase = parsedValue.boundaryCase;

    return typeof boundaryCase === "string" ? boundaryCase : "";
  }

  return "";
}

function expectStandardEnvelope(
  payload: unknown,
): asserts payload is ApiPayload {
  expect(payload).toEqual(expect.any(Object));

  const payloadRecord = payload as Record<string, unknown>;
  const allowedKeys = ["code", "message", "data", "pagination"];

  expect(
    Object.keys(payloadRecord).every((key) => allowedKeys.includes(key)),
  ).toBe(true);
  expect(payloadRecord.code).toEqual(expect.any(Number));
  expect(payloadRecord.message).toEqual(expect.any(String));
  expect(Object.hasOwn(payloadRecord, "data")).toBe(true);
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

function expectNoSensitivePayload(value: unknown, values: string[]) {
  const serializedValue = JSON.stringify(value);

  for (const marker of [...forbiddenVisibleMarkers, ...values]) {
    expect(serializedValue).not.toContain(marker);
  }
}
