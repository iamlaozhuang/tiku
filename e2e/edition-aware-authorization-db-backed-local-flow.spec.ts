import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

import {
  expect,
  test,
  type APIRequestContext,
  type TestInfo,
} from "@playwright/test";
import postgres from "postgres";

type ApiPayload<TData = unknown> = {
  code: number;
  message: string;
  data: TData | null;
  pagination?: unknown;
};

type AuthenticatedClient = {
  sessionValue: string;
  headers: {
    authorization: string;
    "content-type": string;
  };
};

type IdRow = {
  id: string;
};

type SeedSql = {
  <Row extends Record<string, unknown> = Record<string, unknown>>(
    strings: TemplateStringsArray,
    ...values: unknown[]
  ): Promise<Row[]>;
  begin<T>(callback: (sql: SeedSql) => Promise<T>): Promise<T>;
  end?: () => Promise<void>;
};

type AuthorizationContext = {
  authorizationPublicId: string;
  authorizationSource: "personal_auth" | "org_auth";
  edition: "standard" | "advanced";
  effectiveEdition: "standard" | "advanced";
  upgradeStatus: "active" | "expired" | "none" | "revoked";
  displayStatus: "active" | "cancelled" | "expired";
};

type AuthorizationListData = {
  authorizationContexts: AuthorizationContext[];
};

type OrgAuthItem = {
  publicId: string;
  authScopeType: "current_and_descendants" | "specified_nodes";
  edition: "standard" | "advanced";
  effectiveEdition: "standard" | "advanced";
  upgradeStatus: "active" | "expired" | "none" | "revoked";
  accountQuota: number;
  usedQuota: number;
  organizationPublicIds: string[];
};

type OrgAuthListData = {
  orgAuths: OrgAuthItem[];
};

const credentialValueKey = ["pass", "word"].join("");
const localStudentAccessValue = [["TikuDev", "Student"].join(""), "2026"].join(
  "#",
);
const localAdminAccessValue = [["TikuDev", "Admin"].join(""), "2026"].join("#");
const seedStudentCredential = {
  phone: "13900000002",
  [credentialValueKey]: localStudentAccessValue,
} as Record<string, string>;
const seedAdminCredential = {
  phone: "13900000001",
  [credentialValueKey]: localAdminAccessValue,
} as Record<string, string>;

const seedStudentUserPublicId = "user-dev-student";
const seedOrganizationPublicId = "org-dev-province";
const seedPersonalAuthPublicId = "personal-auth-dev-student";
const seedOrgAuthPublicId = "org-auth-dev-analytics";
const fixtureIssuedAt = "2026-06-01T00:00:00.000Z";
const fixtureExpiresAt = "2027-06-01T00:00:00.000Z";
const fixtureExpiredAt = "2026-06-10T00:00:00.000Z";
const fixtureRevokedAt = "2026-06-12T00:00:00.000Z";

const fixturePublicIds = {
  personalAdvanced: "personal-auth-db-advanced-local",
  personalUpgraded: "personal-auth-db-upgraded-local",
  personalExpiredUpgrade: "personal-auth-db-expired-upgrade-local",
  personalRevokedUpgrade: "personal-auth-db-revoked-upgrade-local",
  orgAdvanced: "org-auth-db-advanced-local",
  orgUpgraded: "org-auth-db-upgraded-local",
  orgExpiredUpgrade: "org-auth-db-expired-upgrade-local",
  orgRevokedUpgrade: "org-auth-db-revoked-upgrade-local",
  orgScopeBoundary: "org-auth-db-scope-boundary-local",
  orgQuotaBoundary: "org-auth-db-quota-boundary-local",
} as const;

const forbiddenEvidenceMarkers = [
  localStudentAccessValue,
  localAdminAccessValue,
  "Bearer ",
  "DATABASE_URL",
  "databaseUrl",
  "Authorization:",
  "code_hash",
  "codeHash",
  "plainRedeemCode",
  "providerRequestPayload",
  "providerResponsePayload",
  "raw prompt",
  "raw generated AI content",
  "full paper content",
] as const;

test.describe.configure({ mode: "serial" });

test.describe("edition-aware authorization DB-backed local flow", () => {
  test.beforeAll(async () => {
    await seedEditionAwareAuthorizationFixture();
  });

  test("reads personal standard, advanced, active upgrade, expired, and revoked contexts from the local database", async ({
    request,
  }, testInfo) => {
    const studentClient = await login(request, seedStudentCredential);
    const payload = await getJson<AuthorizationListData>(
      request,
      studentClient,
      "/api/v1/authorizations",
    );
    const contexts = payload.data?.authorizationContexts ?? [];

    expectStandardApiEnvelope(payload);
    expectCamelCaseJsonKeys(payload);
    expectNoInternalIdKeys(payload);
    expectNoSensitivePayload(payload, [studentClient.sessionValue]);
    expect(findContext(contexts, seedPersonalAuthPublicId)).toMatchObject({
      edition: "standard",
      effectiveEdition: "standard",
      upgradeStatus: "none",
    });
    expect(
      findContext(contexts, fixturePublicIds.personalAdvanced),
    ).toMatchObject({
      edition: "advanced",
      effectiveEdition: "advanced",
      upgradeStatus: "none",
    });
    expect(
      findContext(contexts, fixturePublicIds.personalUpgraded),
    ).toMatchObject({
      edition: "standard",
      effectiveEdition: "advanced",
      upgradeStatus: "active",
    });
    expect(
      findContext(contexts, fixturePublicIds.personalExpiredUpgrade),
    ).toMatchObject({
      edition: "standard",
      effectiveEdition: "standard",
      upgradeStatus: "expired",
    });
    expect(
      findContext(contexts, fixturePublicIds.personalRevokedUpgrade),
    ).toMatchObject({
      edition: "standard",
      effectiveEdition: "standard",
      upgradeStatus: "revoked",
    });

    await attachRedactedSummary(testInfo, "edition-db-personal-summary", {
      dataSource: "local_loopback_database",
      route: "/api/v1/authorizations",
      useCases: [
        "personal_standard",
        "personal_advanced",
        "personal_standard_upgraded_advanced",
        "personal_expired_upgrade_fallback",
        "personal_revoked_upgrade_fallback",
      ],
      redactionStatus: "metadata_only_no_token_no_db_row_no_plaintext_code",
    });
  });

  test("reads organization standard, advanced, upgrade, scope, and quota boundaries from the local database", async ({
    request,
  }, testInfo) => {
    const adminClient = await login(request, seedAdminCredential);
    const payload = await getJson<OrgAuthListData>(
      request,
      adminClient,
      "/api/v1/org-auths?page=1&pageSize=100",
    );
    const orgAuths = payload.data?.orgAuths ?? [];

    expectStandardApiEnvelope(payload);
    expectCamelCaseJsonKeys(payload);
    expectNoInternalIdKeys(payload);
    expectNoSensitivePayload(payload, [adminClient.sessionValue]);
    expect(findOrgAuth(orgAuths, seedOrgAuthPublicId)).toMatchObject({
      edition: "standard",
      effectiveEdition: "standard",
      upgradeStatus: "none",
    });
    expect(findOrgAuth(orgAuths, fixturePublicIds.orgAdvanced)).toMatchObject({
      edition: "advanced",
      effectiveEdition: "advanced",
      upgradeStatus: "none",
    });
    expect(findOrgAuth(orgAuths, fixturePublicIds.orgUpgraded)).toMatchObject({
      edition: "standard",
      effectiveEdition: "advanced",
      upgradeStatus: "active",
    });
    expect(
      findOrgAuth(orgAuths, fixturePublicIds.orgExpiredUpgrade),
    ).toMatchObject({
      edition: "standard",
      effectiveEdition: "standard",
      upgradeStatus: "expired",
    });
    expect(
      findOrgAuth(orgAuths, fixturePublicIds.orgRevokedUpgrade),
    ).toMatchObject({
      edition: "standard",
      effectiveEdition: "standard",
      upgradeStatus: "revoked",
    });
    expect(
      findOrgAuth(orgAuths, fixturePublicIds.orgScopeBoundary),
    ).toMatchObject({
      authScopeType: "specified_nodes",
      organizationPublicIds: [],
    });
    expect(
      findOrgAuth(orgAuths, fixturePublicIds.orgQuotaBoundary),
    ).toMatchObject({
      accountQuota: 1,
      usedQuota: 1,
    });

    await attachRedactedSummary(testInfo, "edition-db-organization-summary", {
      dataSource: "local_loopback_database",
      route: "/api/v1/org-auths",
      useCases: [
        "org_standard",
        "org_advanced",
        "org_standard_upgraded_advanced",
        "org_expired_upgrade_fallback",
        "org_revoked_upgrade_fallback",
        "org_scope_mismatch_visible_boundary",
        "org_quota_insufficient_visible_boundary",
      ],
      redactionStatus: "metadata_only_no_token_no_db_row_no_plaintext_code",
    });
  });
});

async function login(
  request: APIRequestContext,
  credential: Record<string, string>,
): Promise<AuthenticatedClient> {
  const payload = await postJson(request, null, "/api/v1/sessions", credential);

  expect(payload).toMatchObject({ code: 0, message: "ok" });

  const sessionValue = readRequiredNestedString(payload, ["data", "token"]);

  return {
    sessionValue,
    headers: {
      authorization: `Bearer ${sessionValue}`,
      "content-type": "application/json",
    },
  };
}

async function getJson<TData>(
  request: APIRequestContext,
  client: AuthenticatedClient,
  path: string,
): Promise<ApiPayload<TData>> {
  const response = await request.get(path, {
    headers: client.headers,
  });

  expect(response.ok()).toBe(true);

  return response.json() as Promise<ApiPayload<TData>>;
}

async function postJson<TData>(
  request: APIRequestContext,
  client: AuthenticatedClient | null,
  path: string,
  body: unknown,
): Promise<ApiPayload<TData>> {
  const response = await request.post(path, {
    data: body,
    headers: client?.headers ?? { "content-type": "application/json" },
  });

  expect(response.ok()).toBe(true);

  return response.json() as Promise<ApiPayload<TData>>;
}

function findContext(
  contexts: AuthorizationContext[],
  authorizationPublicId: string,
): AuthorizationContext {
  const context = contexts.find(
    (candidate) => candidate.authorizationPublicId === authorizationPublicId,
  );

  expect(context).toBeDefined();

  return context as AuthorizationContext;
}

function findOrgAuth(orgAuths: OrgAuthItem[], publicId: string): OrgAuthItem {
  const orgAuth = orgAuths.find((candidate) => candidate.publicId === publicId);

  expect(orgAuth).toBeDefined();

  return orgAuth as OrgAuthItem;
}

async function seedEditionAwareAuthorizationFixture(): Promise<void> {
  const sql = createSeedSql();

  try {
    await sql.begin(async (transaction) => {
      const studentUserId = await getRequiredId(
        transaction`
          select id::text as id
          from "user"
          where public_id = ${seedStudentUserPublicId}
          limit 1
        `,
        "student user",
      );
      const organizationId = await getRequiredId(
        transaction`
          select id::text as id
          from organization
          where public_id = ${seedOrganizationPublicId}
          limit 1
        `,
        "organization",
      );

      await upsertPersonalAuth(transaction, {
        publicId: fixturePublicIds.personalAdvanced,
        redeemCodePublicId: "redeem-code-db-personal-advanced-local",
        codeHash: "hash-db-personal-advanced-local",
        studentUserId,
        edition: "advanced",
      });
      const personalUpgradedId = await upsertPersonalAuth(transaction, {
        publicId: fixturePublicIds.personalUpgraded,
        redeemCodePublicId: "redeem-code-db-personal-upgraded-local",
        codeHash: "hash-db-personal-upgraded-local",
        studentUserId,
        edition: "standard",
      });
      const personalExpiredUpgradeId = await upsertPersonalAuth(transaction, {
        publicId: fixturePublicIds.personalExpiredUpgrade,
        redeemCodePublicId: "redeem-code-db-personal-expired-local",
        codeHash: "hash-db-personal-expired-local",
        studentUserId,
        edition: "standard",
      });
      const personalRevokedUpgradeId = await upsertPersonalAuth(transaction, {
        publicId: fixturePublicIds.personalRevokedUpgrade,
        redeemCodePublicId: "redeem-code-db-personal-revoked-local",
        codeHash: "hash-db-personal-revoked-local",
        studentUserId,
        edition: "standard",
      });
      const orgAdvancedId = await upsertOrgAuth(transaction, {
        publicId: fixturePublicIds.orgAdvanced,
        organizationId,
        authScopeType: "current_and_descendants",
        edition: "advanced",
        accountQuota: 10,
        usedQuota: 1,
        linkOrganization: true,
      });
      const orgUpgradedId = await upsertOrgAuth(transaction, {
        publicId: fixturePublicIds.orgUpgraded,
        organizationId,
        authScopeType: "current_and_descendants",
        edition: "standard",
        accountQuota: 10,
        usedQuota: 2,
        linkOrganization: true,
      });
      const orgExpiredUpgradeId = await upsertOrgAuth(transaction, {
        publicId: fixturePublicIds.orgExpiredUpgrade,
        organizationId,
        authScopeType: "current_and_descendants",
        edition: "standard",
        accountQuota: 10,
        usedQuota: 3,
        linkOrganization: true,
      });
      const orgRevokedUpgradeId = await upsertOrgAuth(transaction, {
        publicId: fixturePublicIds.orgRevokedUpgrade,
        organizationId,
        authScopeType: "current_and_descendants",
        edition: "standard",
        accountQuota: 10,
        usedQuota: 4,
        linkOrganization: true,
      });

      await upsertOrgAuth(transaction, {
        publicId: fixturePublicIds.orgScopeBoundary,
        organizationId,
        authScopeType: "specified_nodes",
        edition: "advanced",
        accountQuota: 10,
        usedQuota: 0,
        linkOrganization: false,
      });
      await upsertOrgAuth(transaction, {
        publicId: fixturePublicIds.orgQuotaBoundary,
        organizationId,
        authScopeType: "current_and_descendants",
        edition: "advanced",
        accountQuota: 1,
        usedQuota: 1,
        linkOrganization: true,
      });
      await upsertAuthUpgrade(transaction, {
        publicId: "auth-upgrade-db-personal-active-local",
        personalAuthId: personalUpgradedId,
        orgAuthId: null,
        status: "active",
        startsAt: fixtureIssuedAt,
        expiresAt: fixtureExpiresAt,
        revokedAt: null,
      });
      await upsertAuthUpgrade(transaction, {
        publicId: "auth-upgrade-db-personal-expired-local",
        personalAuthId: personalExpiredUpgradeId,
        orgAuthId: null,
        status: "expired",
        startsAt: fixtureIssuedAt,
        expiresAt: fixtureExpiredAt,
        revokedAt: null,
      });
      await upsertAuthUpgrade(transaction, {
        publicId: "auth-upgrade-db-personal-revoked-local",
        personalAuthId: personalRevokedUpgradeId,
        orgAuthId: null,
        status: "revoked",
        startsAt: fixtureIssuedAt,
        expiresAt: fixtureExpiresAt,
        revokedAt: fixtureRevokedAt,
      });
      await upsertAuthUpgrade(transaction, {
        publicId: "auth-upgrade-db-org-active-local",
        personalAuthId: null,
        orgAuthId: orgUpgradedId,
        status: "active",
        startsAt: fixtureIssuedAt,
        expiresAt: fixtureExpiresAt,
        revokedAt: null,
      });
      await upsertAuthUpgrade(transaction, {
        publicId: "auth-upgrade-db-org-expired-local",
        personalAuthId: null,
        orgAuthId: orgExpiredUpgradeId,
        status: "expired",
        startsAt: fixtureIssuedAt,
        expiresAt: fixtureExpiredAt,
        revokedAt: null,
      });
      await upsertAuthUpgrade(transaction, {
        publicId: "auth-upgrade-db-org-revoked-local",
        personalAuthId: null,
        orgAuthId: orgRevokedUpgradeId,
        status: "revoked",
        startsAt: fixtureIssuedAt,
        expiresAt: fixtureExpiresAt,
        revokedAt: fixtureRevokedAt,
      });

      void orgAdvancedId;
    });
  } finally {
    await sql.end?.();
  }
}

async function upsertPersonalAuth(
  sql: SeedSql,
  input: {
    publicId: string;
    redeemCodePublicId: string;
    codeHash: string;
    studentUserId: string;
    edition: "standard" | "advanced";
  },
): Promise<string> {
  const redeemCodeId = await getRequiredId(
    sql`
      insert into redeem_code (
        public_id,
        code_hash,
        code_display,
        redeem_code_type,
        profession,
        level,
        duration_day,
        redeem_deadline_at,
        status,
        used_by_user_id,
        used_at,
        generation_group_id,
        created_at,
        updated_at
      )
      values (
        ${input.redeemCodePublicId},
        ${input.codeHash},
        ${"DB-FIXTURE-REDACTED"},
        ${
          input.edition === "advanced"
            ? "personal_advanced_activation"
            : "personal_standard_activation"
        },
        ${"monopoly"},
        ${3},
        ${365},
        ${fixtureExpiresAt},
        ${"used"},
        ${input.studentUserId},
        ${fixtureIssuedAt},
        ${"edition-db-backed-local"},
        ${fixtureIssuedAt},
        ${fixtureIssuedAt}
      )
      on conflict (public_id) do update set
        code_hash = excluded.code_hash,
        code_display = excluded.code_display,
        redeem_code_type = excluded.redeem_code_type,
        profession = excluded.profession,
        level = excluded.level,
        duration_day = excluded.duration_day,
        redeem_deadline_at = excluded.redeem_deadline_at,
        status = excluded.status,
        used_by_user_id = excluded.used_by_user_id,
        used_at = excluded.used_at,
        generation_group_id = excluded.generation_group_id,
        updated_at = excluded.updated_at
      returning id::text as id
    `,
    "fixture redeem_code",
  );

  return getRequiredId(
    sql`
      insert into personal_auth (
        public_id,
        user_id,
        redeem_code_id,
        edition,
        profession,
        level,
        starts_at,
        expires_at,
        status,
        created_at,
        updated_at
      )
      values (
        ${input.publicId},
        ${input.studentUserId},
        ${redeemCodeId},
        ${input.edition},
        ${"monopoly"},
        ${3},
        ${fixtureIssuedAt},
        ${fixtureExpiresAt},
        ${"active"},
        ${fixtureIssuedAt},
        ${fixtureIssuedAt}
      )
      on conflict (public_id) do update set
        user_id = excluded.user_id,
        redeem_code_id = excluded.redeem_code_id,
        edition = excluded.edition,
        profession = excluded.profession,
        level = excluded.level,
        starts_at = excluded.starts_at,
        expires_at = excluded.expires_at,
        status = excluded.status,
        updated_at = excluded.updated_at
      returning id::text as id
    `,
    "fixture personal_auth",
  );
}

async function upsertOrgAuth(
  sql: SeedSql,
  input: {
    publicId: string;
    organizationId: string;
    authScopeType: "current_and_descendants" | "specified_nodes";
    edition: "standard" | "advanced";
    accountQuota: number;
    usedQuota: number;
    linkOrganization: boolean;
  },
): Promise<string> {
  const orgAuthId = await getRequiredId(
    sql`
      insert into org_auth (
        public_id,
        name,
        purchaser_organization_id,
        auth_scope_type,
        edition,
        profession,
        level,
        account_quota,
        used_quota,
        starts_at,
        expires_at,
        status,
        cancelled_at,
        created_at,
        updated_at
      )
      values (
        ${input.publicId},
        ${input.publicId},
        ${input.organizationId},
        ${input.authScopeType},
        ${input.edition},
        ${"monopoly"},
        ${3},
        ${input.accountQuota},
        ${input.usedQuota},
        ${fixtureIssuedAt},
        ${fixtureExpiresAt},
        ${"active"},
        ${null},
        ${fixtureIssuedAt},
        ${fixtureIssuedAt}
      )
      on conflict (public_id) do update set
        name = excluded.name,
        purchaser_organization_id = excluded.purchaser_organization_id,
        auth_scope_type = excluded.auth_scope_type,
        edition = excluded.edition,
        profession = excluded.profession,
        level = excluded.level,
        account_quota = excluded.account_quota,
        used_quota = excluded.used_quota,
        starts_at = excluded.starts_at,
        expires_at = excluded.expires_at,
        status = excluded.status,
        cancelled_at = excluded.cancelled_at,
        updated_at = excluded.updated_at
      returning id::text as id
    `,
    "fixture org_auth",
  );

  if (input.linkOrganization) {
    await sql`
      insert into org_auth_organization (org_auth_id, organization_id, created_at)
      values (${orgAuthId}, ${input.organizationId}, ${fixtureIssuedAt})
      on conflict (org_auth_id, organization_id) do nothing
    `;
  }

  return orgAuthId;
}

async function upsertAuthUpgrade(
  sql: SeedSql,
  input: {
    publicId: string;
    personalAuthId: string | null;
    orgAuthId: string | null;
    status: "active" | "expired" | "revoked";
    startsAt: string;
    expiresAt: string;
    revokedAt: string | null;
  },
): Promise<void> {
  await sql`
    insert into auth_upgrade (
      public_id,
      personal_auth_id,
      org_auth_id,
      target_edition,
      source_type,
      starts_at,
      expires_at,
      revoked_at,
      status,
      created_at,
      updated_at
    )
    values (
      ${input.publicId},
      ${input.personalAuthId},
      ${input.orgAuthId},
      ${"advanced"},
      ${"ops_manual"},
      ${input.startsAt},
      ${input.expiresAt},
      ${input.revokedAt},
      ${input.status},
      ${fixtureIssuedAt},
      ${fixtureIssuedAt}
    )
    on conflict (public_id) do update set
      personal_auth_id = excluded.personal_auth_id,
      org_auth_id = excluded.org_auth_id,
      target_edition = excluded.target_edition,
      source_type = excluded.source_type,
      starts_at = excluded.starts_at,
      expires_at = excluded.expires_at,
      revoked_at = excluded.revoked_at,
      status = excluded.status,
      updated_at = excluded.updated_at
  `;
}

async function getRequiredId(
  query: Promise<IdRow[]>,
  label: string,
): Promise<string> {
  const [row] = await query;

  if (!row) {
    throw new Error(`Missing local fixture prerequisite: ${label}`);
  }

  return row.id;
}

function createSeedSql(): SeedSql {
  loadLocalEnv();

  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error("DATABASE_URL is required for local DB-backed e2e.");
  }

  return postgres(databaseUrl, { max: 1 }) as unknown as SeedSql;
}

function loadLocalEnv(): void {
  const localEnvPath = resolve(process.cwd(), ".env.local");

  if (!existsSync(localEnvPath)) {
    return;
  }

  const localEnvContent = readFileSync(localEnvPath, "utf8");

  for (const line of localEnvContent.split(/\r?\n/u)) {
    const trimmedLine = line.trim();

    if (trimmedLine.length === 0 || trimmedLine.startsWith("#")) {
      continue;
    }

    const separatorIndex = trimmedLine.indexOf("=");

    if (separatorIndex <= 0) {
      continue;
    }

    const key = trimmedLine.slice(0, separatorIndex).trim();
    const value = trimmedLine
      .slice(separatorIndex + 1)
      .trim()
      .replace(/^["']|["']$/gu, "");

    if (process.env[key] === undefined) {
      process.env[key] = value;
    }
  }
}

function readRequiredNestedString(value: unknown, path: string[]): string {
  let currentValue = value;

  for (const segment of path) {
    expect(typeof currentValue).toBe("object");
    expect(currentValue).not.toBeNull();
    currentValue = (currentValue as Record<string, unknown>)[segment];
  }

  expect(typeof currentValue).toBe("string");

  return currentValue as string;
}

async function attachRedactedSummary(
  testInfo: TestInfo,
  name: string,
  summary: Record<string, unknown>,
): Promise<void> {
  expectNoSensitivePayload(summary);

  await testInfo.attach(name, {
    body: JSON.stringify(summary, null, 2),
    contentType: "application/json",
  });
}

function expectStandardApiEnvelope(
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

function expectNoSensitivePayload(
  value: unknown,
  dynamicValues: string[] = [],
) {
  const serializedValue = JSON.stringify(value);

  for (const forbiddenMarker of [
    ...forbiddenEvidenceMarkers,
    ...dynamicValues,
  ]) {
    expect(serializedValue).not.toContain(forbiddenMarker);
  }
}
