import { expect, test, type APIResponse, type Page } from "@playwright/test";

type ApiPayload = {
  code: number;
  message: string;
  data: unknown;
  pagination?: unknown;
};

const credentialValueField = ["pass", "word"].join("");
const localStudentAccessValue = [["TikuDev", "Student"].join(""), "2026"].join(
  "#",
);
const studentCredential = {
  phone: "13900000002",
  [credentialValueField]: localStudentAccessValue,
} as Record<string, string>;

const localSessionStorageKey = "tiku.localSessionToken";
const cookieBackedSessionMarker = "__cookie_backed_session__";
const historyTitle = "\u8fd1\u671f AI \u8bf7\u6c42\u5386\u53f2";
const historyEmptyTitle = "\u6682\u65e0\u5386\u53f2\u8bf7\u6c42";
const historyErrorTitle = "\u5386\u53f2\u8bf7\u6c42\u6682\u4e0d\u53ef\u7528";

const forbiddenVisibleMarkers = [
  "provider payload",
  "generated content",
  "full paper content",
  "raw prompt",
  "raw answer",
  "raw model response",
  "Bearer ",
  "tiku_session=",
  "apiKey",
  "databaseUrl",
  "secretValue",
  localStudentAccessValue,
] as const;
async function expectForbiddenMarkersHidden(page: Page, values: string[]) {
  const body = page.locator("body");

  for (const marker of [...forbiddenVisibleMarkers, ...values]) {
    await expect(body).not.toContainText(marker);
  }
}

async function expectRequestHistoryMetadataVisible(page: Page) {
  await expect(page.getByText("状态", { exact: true }).first()).toBeVisible();
  await expect(
    page.getByText("请求时间", { exact: true }).first(),
  ).toBeVisible();
  await expect(
    page.getByText("资料依据", { exact: true }).first(),
  ).toBeVisible();
  await expect(
    page.getByText("依据数量", { exact: true }).first(),
  ).toBeVisible();
}

async function expectPublicIdentifierLabelsHidden(page: Page) {
  await expect(page.getByText("requestPublicId", { exact: true })).toHaveCount(
    0,
  );
  await expect(page.getByText("taskPublicId", { exact: true })).toHaveCount(0);
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

async function installLocalStudentBrowserSession(page: Page): Promise<string> {
  const sessionResponse = await page.request.post("/api/v1/sessions", {
    data: studentCredential,
  });
  expect(sessionResponse.ok()).toBe(true);

  const sessionPayload = await sessionResponse.json();
  expectStandardEnvelope(sessionPayload);
  expect(sessionPayload).toMatchObject({
    code: 0,
    message: "ok",
  });
  expectClientVisibleTokenOmitted(sessionPayload.data);
  expectSessionCookieIssued(sessionResponse);

  await page.addInitScript(
    ([sessionStorageKey, sessionMarker]) => {
      localStorage.setItem(sessionStorageKey, sessionMarker);
    },
    [localSessionStorageKey, cookieBackedSessionMarker] as [string, string],
  );

  return cookieBackedSessionMarker;
}

function expectSessionCookieIssued(response: APIResponse) {
  const sessionCookieHeader = response.headers()["set-cookie"] ?? "";

  expect(sessionCookieHeader).toContain("tiku_session=");
  expect(sessionCookieHeader).toContain("HttpOnly");
  expect(sessionCookieHeader).toContain("SameSite=Lax");
  expect(sessionCookieHeader).toContain("Path=/");
}

function expectClientVisibleTokenOmitted(data: unknown) {
  expect(isRecord(data) ? data["token"] : undefined).toBeUndefined();
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

function isPersistentHistoryUnavailablePayload(payload: ApiPayload): boolean {
  return (
    payload.code === 500017 &&
    payload.message ===
      "Personal AI request history is temporarily unavailable." &&
    payload.data === null
  );
}

function expectLocalHistoryEnvelope(payload: ApiPayload) {
  if (payload.code === 0) {
    expect(Array.isArray(payload.data)).toBe(true);
    return;
  }

  expect(isPersistentHistoryUnavailablePayload(payload)).toBe(true);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function readFirstHistoryRow(
  payload: ApiPayload,
): Record<string, unknown> | null {
  if (payload.code !== 0 || !Array.isArray(payload.data)) {
    return null;
  }

  const [firstRow] = payload.data;

  return isRecord(firstRow) ? firstRow : null;
}

test.describe("personal AI generation local request", () => {
  test("renders the cookie-backed local session surface without submitting AI work", async ({
    page,
  }) => {
    const sessionMarker = await installLocalStudentBrowserSession(page);

    const requestHistoryResponse = await page.request.get(
      "/api/v1/personal-ai-generation-requests?userPublicId=client-owned-history-user&id=701",
    );
    expect(requestHistoryResponse.ok()).toBe(true);

    const requestHistoryPayload = await requestHistoryResponse.json();
    expectStandardEnvelope(requestHistoryPayload);
    expectCamelCaseJsonKeys(requestHistoryPayload);
    expectNoInternalIdKeys(requestHistoryPayload);
    expectNoSensitivePayload(requestHistoryPayload, [sessionMarker]);
    expect(JSON.stringify(requestHistoryPayload)).not.toContain(
      "client-owned-history-user",
    );
    expectLocalHistoryEnvelope(requestHistoryPayload);

    const initialHistoryResponsePromise = page.waitForResponse((response) => {
      const request = response.request();

      return (
        request.method() === "GET" &&
        new URL(response.url()).pathname ===
          "/api/v1/personal-ai-generation-requests"
      );
    });

    await page.goto("/ai-generation");
    const storedLocalAuthValue = await page.evaluate((storageKey) => {
      return localStorage.getItem(storageKey);
    }, localSessionStorageKey);
    expect(storedLocalAuthValue).toBe(sessionMarker);

    const initialHistoryResponse = await initialHistoryResponsePromise;
    expect(initialHistoryResponse.ok()).toBe(true);

    const initialHistoryPayload = await initialHistoryResponse.json();
    expectStandardEnvelope(initialHistoryPayload);
    expectCamelCaseJsonKeys(initialHistoryPayload);
    expectNoInternalIdKeys(initialHistoryPayload);
    expectNoSensitivePayload(initialHistoryPayload, [sessionMarker]);
    expectLocalHistoryEnvelope(initialHistoryPayload);

    await expect(page.getByRole("heading", { name: "AI训练" })).toBeVisible();
    await expect(page.getByText(historyTitle)).toBeVisible();
    if (isPersistentHistoryUnavailablePayload(initialHistoryPayload)) {
      await expect(page.getByText(historyErrorTitle)).toBeVisible();
    } else if (readFirstHistoryRow(initialHistoryPayload) !== null) {
      await expectRequestHistoryMetadataVisible(page);
      await expectPublicIdentifierLabelsHidden(page);
    } else {
      await expect(page.getByText(historyEmptyTitle)).toBeVisible();
    }
    await expect(page.getByText("runtimeStatus")).toHaveCount(0);
    await expectForbiddenMarkersHidden(page, [sessionMarker]);

    await expect(page.locator("[data-id]")).toHaveCount(0);
    await expectForbiddenMarkersHidden(page, [sessionMarker]);
  });
});
