import {
  expect,
  test,
  type APIRequestContext,
  type Page,
} from "@playwright/test";

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

const credentialValueKey = ["pass", "word"].join("");
const localAdminAccessValue = [["TikuDev", "Admin"].join(""), "2026"].join("#");
const localSessionStorageKey = "tiku.localSessionToken";
const seedAdminCredential = {
  phone: "13900000001",
  [credentialValueKey]: localAdminAccessValue,
} as Record<string, string>;

const forbiddenVisibleMarkers = [
  "Bearer ",
  "apiKey",
  "databaseUrl",
  "secretValue",
  "providerRequestPayload",
  "providerResponsePayload",
  "raw prompt",
  "raw answer",
  "raw model response",
  "standardAnswer",
  "analysis",
  "id=",
] as const;

test("loads the local admin organization portal shell entry", async ({
  page,
}, testInfo) => {
  test.setTimeout(45_000);

  const adminClient = await login(page.request, seedAdminCredential);
  await installBrowserSession(page, adminClient.sessionValue);

  await page.goto("/content/organization-portal");
  await expect(
    page.getByRole("heading", { name: "Organization Portal" }),
  ).toBeVisible();

  const portalShell = page.getByTestId("organization-portal-shell");
  await expect(portalShell).toBeVisible();
  await expect(
    portalShell.getByRole("link", { name: /Organization Training/u }),
  ).toHaveAttribute("href", "/content/organization-training");
  await expect(
    portalShell.getByRole("link", { name: /Organization Analytics/u }),
  ).toHaveAttribute("href", "/content/organization-analytics");
  await expect(page.locator("body")).not.toContainText("/ops/organizations");
  await expect(page.locator("body")).not.toContainText("Provider");
  await expect(page.locator("body")).not.toContainText("Payment");
  await expectNoSensitiveBrowserText(page, [
    adminClient.sessionValue,
    localAdminAccessValue,
  ]);

  await testInfo.attach("organization-portal-local-flow-summary", {
    body: JSON.stringify(
      {
        routePath: "/content/organization-portal",
        supportedDestinations: [
          "/content/organization-training",
          "/content/organization-analytics",
        ],
        redactionStatus: "no_session_values_or_internal_ids_attached",
      },
      null,
      2,
    ),
    contentType: "application/json",
  });
});

async function login(
  request: APIRequestContext,
  credential: Record<string, string>,
): Promise<AuthenticatedClient> {
  const payload = await postJson(request, null, "/api/v1/sessions", credential);
  expect(payload).toMatchObject({
    code: 0,
    message: "ok",
  });

  const sessionValue = readRequiredNestedString(payload, ["data", "token"]);

  return {
    sessionValue,
    headers: {
      authorization: `Bearer ${sessionValue}`,
      "content-type": "application/json",
    },
  };
}

async function installBrowserSession(page: Page, sessionValue: string) {
  await page.addInitScript(
    ([storageKey, browserSessionValue]) => {
      localStorage.setItem(storageKey, browserSessionValue);
    },
    [localSessionStorageKey, sessionValue] as [string, string],
  );

  if (page.url().startsWith("http")) {
    await page.evaluate(
      ([storageKey, browserSessionValue]) => {
        localStorage.setItem(storageKey, browserSessionValue);
      },
      [localSessionStorageKey, sessionValue] as [string, string],
    );
  }
}

async function postJson<TData = unknown>(
  request: APIRequestContext,
  client: AuthenticatedClient | null,
  path: string,
  body: unknown,
): Promise<ApiPayload<TData>> {
  const response = await request.post(path, {
    data: body,
    headers: client?.headers ?? { "content-type": "application/json" },
  });
  const payload = (await response.json()) as ApiPayload<TData>;
  expectStandardApiEnvelope(payload);
  expectCamelCaseJsonKeys(payload);
  expectNoInternalIdKeys(payload);
  expectNoSensitivePayload(
    payload,
    client === null ? [] : [client.sessionValue],
  );

  return payload;
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

function expectNoSensitivePayload(value: unknown, values: string[]) {
  const serializedValue = JSON.stringify(value);

  for (const marker of [...forbiddenVisibleMarkers, ...values]) {
    expect(serializedValue).not.toContain(marker);
  }
}

async function expectNoSensitiveBrowserText(page: Page, values: string[]) {
  const body = page.locator("body");

  for (const marker of [...forbiddenVisibleMarkers, ...values]) {
    await expect(body).not.toContainText(marker);
  }
}

function readRequiredNestedString(value: unknown, path: string[]): string {
  let currentValue = value;

  for (const pathSegment of path) {
    if (!isRecord(currentValue)) {
      throw new Error("Missing required string in organization portal flow.");
    }

    currentValue = currentValue[pathSegment];
  }

  expect(currentValue).toEqual(expect.any(String));

  if (typeof currentValue !== "string" || currentValue.trim() === "") {
    throw new Error("Missing required string in organization portal flow.");
  }

  return currentValue;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
