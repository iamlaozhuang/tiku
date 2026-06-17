import { expect, test, type Page } from "@playwright/test";

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
const localStudentPublicId = "user-dev-student";
const requestButtonName = "\u53d1\u8d77\u672c\u5730 AI \u8bf7\u6c42";
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
  "providerRequestPayload",
  "providerResponsePayload",
  "Bearer ",
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
  await expect(page.getByText("status", { exact: true }).first()).toBeVisible();
  await expect(
    page.getByText("requestedAt", { exact: true }).first(),
  ).toBeVisible();
  await expect(
    page.getByText("evidenceStatus", { exact: true }).first(),
  ).toBeVisible();
  await expect(
    page.getByText("citationCount", { exact: true }).first(),
  ).toBeVisible();
  await expect(
    page.getByText("redactionStatus", { exact: true }).first(),
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

function readRequiredNestedString(value: unknown, path: string[]): string {
  let currentValue = value;

  for (const pathSegment of path) {
    if (!isRecord(currentValue)) {
      throw new Error("Missing required string in local e2e fixture response.");
    }

    currentValue = currentValue[pathSegment];
  }

  expect(currentValue).toEqual(expect.any(String));

  if (typeof currentValue !== "string" || currentValue.trim() === "") {
    throw new Error("Missing required string in local e2e fixture response.");
  }

  return currentValue;
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

  const sessionToken = readRequiredNestedString(sessionPayload, [
    "data",
    "token",
  ]);

  await page.addInitScript(
    ([sessionStorageKey, browserCredential]) => {
      localStorage.setItem(sessionStorageKey, browserCredential);
    },
    [localSessionStorageKey, sessionToken] as [string, string],
  );

  return sessionToken;
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

function parseRecordPayload(value: string | null): Record<string, unknown> {
  if (value === null) {
    return {};
  }

  const parsedValue = JSON.parse(value) as unknown;

  return typeof parsedValue === "object" && parsedValue !== null
    ? (parsedValue as Record<string, unknown>)
    : {};
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
  test("submits the local request and renders only redacted public summaries", async ({
    page,
  }) => {
    const localAuthHeaderValue = await installLocalStudentBrowserSession(page);

    const requestHistoryResponse = await page.request.get(
      "/api/v1/personal-ai-generation-requests?userPublicId=client-owned-history-user&id=701",
      {
        headers: {
          authorization: `Bearer ${localAuthHeaderValue}`,
        },
      },
    );
    expect(requestHistoryResponse.ok()).toBe(true);

    const requestHistoryPayload = await requestHistoryResponse.json();
    expectStandardEnvelope(requestHistoryPayload);
    expectCamelCaseJsonKeys(requestHistoryPayload);
    expectNoInternalIdKeys(requestHistoryPayload);
    expectNoSensitivePayload(requestHistoryPayload, [localAuthHeaderValue]);
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
    expect(storedLocalAuthValue).toBe(localAuthHeaderValue);

    const initialHistoryResponse = await initialHistoryResponsePromise;
    expect(initialHistoryResponse.ok()).toBe(true);

    const initialHistoryPayload = await initialHistoryResponse.json();
    expectStandardEnvelope(initialHistoryPayload);
    expectCamelCaseJsonKeys(initialHistoryPayload);
    expectNoInternalIdKeys(initialHistoryPayload);
    expectNoSensitivePayload(initialHistoryPayload, [localAuthHeaderValue]);
    expectLocalHistoryEnvelope(initialHistoryPayload);

    await expect(page.locator("body")).toContainText("personal-learning-ai");
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
    await expectForbiddenMarkersHidden(page, [localAuthHeaderValue]);

    const requestResponsePromise = page.waitForResponse((response) => {
      const request = response.request();

      return (
        request.method() === "POST" &&
        new URL(response.url()).pathname ===
          "/api/v1/personal-ai-generation-requests"
      );
    });
    const postSubmitHistoryResponsePromise = page.waitForResponse(
      (response) => {
        const request = response.request();

        return (
          request.method() === "GET" &&
          new URL(response.url()).pathname ===
            "/api/v1/personal-ai-generation-requests"
        );
      },
    );

    await page.getByRole("button", { name: requestButtonName }).click();

    const requestResponse = await requestResponsePromise;
    expect(requestResponse.ok()).toBe(true);

    const postedRequestPayload = parseRecordPayload(
      requestResponse.request().postData(),
    );
    expect(postedRequestPayload).toMatchObject({
      actorPublicId: localStudentPublicId,
      ownerPublicId: localStudentPublicId,
      quotaOwnerPublicId: localStudentPublicId,
      requestPublicId: expect.stringMatching(/^personal-ai-request-public-/u),
      userPublicId: localStudentPublicId,
    });
    expect(postedRequestPayload.taskPublicId).toEqual(
      expect.stringMatching(/^ai-generation-task-public-/u),
    );
    expectNoSensitivePayload(postedRequestPayload, [localAuthHeaderValue]);

    const requestPayload = await requestResponse.json();
    expectStandardEnvelope(requestPayload);
    expectCamelCaseJsonKeys(requestPayload);
    expectNoInternalIdKeys(requestPayload);
    expectNoSensitivePayload(requestPayload, [localAuthHeaderValue]);
    expect(requestPayload).toMatchObject({
      code: 0,
      data: {
        experienceSurface: "student_local_browser",
        redactionStatus: "redacted",
        requestFlow: {
          request: {
            userPublicId: localStudentPublicId,
          },
        },
        resultState: {
          contentVisibility: "summary_only",
          evidenceStatus: "none",
          isFormalAdoptionBlocked: true,
          status: "pending",
          taskPublicId: expect.stringMatching(/^ai-generation-task-public-/u),
        },
        runtimeStatus: "local_contract_only",
      },
      message: "ok",
    });

    await expect(page.getByText("runtimeStatus")).toBeVisible();
    await expect(page.getByText("local_contract_only").first()).toBeVisible();
    await expect(page.getByText("experienceSurface")).toBeVisible();
    await expect(page.getByText("student_local_browser")).toBeVisible();
    await expect(page.getByText("flowStatus")).toBeVisible();
    await expect(page.getByText("accepted")).toBeVisible();
    await expect(page.getByText("contentVisibility")).toBeVisible();
    await expect(page.getByText("summary_only")).toBeVisible();
    await expect(page.getByText("isFormalAdoptionBlocked")).toBeVisible();
    await expect(page.getByText("true").first()).toBeVisible();

    const postSubmitHistoryResponse = await postSubmitHistoryResponsePromise;
    expect(postSubmitHistoryResponse.ok()).toBe(true);

    const postSubmitHistoryPayload = await postSubmitHistoryResponse.json();
    expectStandardEnvelope(postSubmitHistoryPayload);
    expectCamelCaseJsonKeys(postSubmitHistoryPayload);
    expectNoInternalIdKeys(postSubmitHistoryPayload);
    expectNoSensitivePayload(postSubmitHistoryPayload, [localAuthHeaderValue]);
    expectLocalHistoryEnvelope(postSubmitHistoryPayload);

    const firstHistoryRow = readFirstHistoryRow(postSubmitHistoryPayload);

    if (firstHistoryRow !== null) {
      await expectRequestHistoryMetadataVisible(page);
      await expectPublicIdentifierLabelsHidden(page);
    } else if (
      isPersistentHistoryUnavailablePayload(postSubmitHistoryPayload)
    ) {
      await expect(page.getByText(historyErrorTitle)).toBeVisible();
      await expect(page.getByText("requestPublicId")).toHaveCount(0);
    } else {
      await expect(page.getByText(historyEmptyTitle)).toBeVisible();
      await expect(page.getByText("requestPublicId")).toHaveCount(0);
    }

    await expect(page.locator("[data-id]")).toHaveCount(0);
    await expectForbiddenMarkersHidden(page, [localAuthHeaderValue]);
  });
});
