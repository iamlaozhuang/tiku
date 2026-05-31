import { expect, test, type Page } from "@playwright/test";

const adminCredential = {
  phone: "13900000001",
  password: "TikuDevAdmin#2026",
};

const forbiddenPayloadMarkers = [
  "rawPrompt",
  "rawAnswer",
  "rawModelResponse",
  "rawModelOutput",
  "raw provider payload",
  "providerPayload",
  "requestBody",
  "Authorization",
  "Bearer ",
  "databaseUrl",
  "secretValue",
  "sk-real-secret",
  "RAW_PROMPT",
  "RAW_ANSWER",
  "RAW_MODEL_RESPONSE",
  "RAW_PROVIDER_PAYLOAD",
];

async function loginAsAdmin(page: Page) {
  await page.goto("/login");
  await page.getByLabel("手机号").fill(adminCredential.phone);
  await page.getByLabel("密码").fill(adminCredential.password);
  await page.getByRole("button", { name: "登录" }).click();
  await expect(page).toHaveURL(/\/ops\/users$/);
}

function expectStandardEnvelope(payload: unknown) {
  expect(payload).toMatchObject({
    code: expect.any(Number),
    data: expect.anything(),
    message: expect.any(String),
  });
}

function expectForbiddenPayloadMarkersHidden(payload: unknown) {
  const serializedPayload = JSON.stringify(payload);

  for (const marker of forbiddenPayloadMarkers) {
    expect(serializedPayload).not.toContain(marker);
  }
}

test.describe("admin audit navigation", () => {
  test("opens the existing AI audit log route from the admin shell", async ({
    page,
  }) => {
    await loginAsAdmin(page);

    await page.getByRole("link", { name: /审计日志/u }).click();

    await expect(page).toHaveURL(/\/ops\/ai-audit-logs$/);
    await expect(page.locator("body")).toContainText("审计日志只读");
    await expect(page).not.toHaveURL(/\/ops\/audit-logs$/);
  });

  test("shows redaction-safe model management and API metadata shape", async ({
    page,
  }) => {
    await loginAsAdmin(page);

    await page.goto("/ops/ai-audit-logs");
    await expect(page).toHaveURL(/\/ops\/ai-audit-logs$/);
    await expect(
      page.getByRole("heading", { name: "Model configuration" }),
    ).toBeVisible();
    await page.getByRole("tab", { name: "Model configs" }).click();
    await expect(
      page.locator('[data-testid^="admin-model-config-"]').first(),
    ).toBeVisible();
    await page.getByRole("tab", { name: "Prompt templates" }).click();
    await expect(page.getByLabel("Template key")).toBeVisible();

    for (const marker of forbiddenPayloadMarkers) {
      await expect(page.locator("body")).not.toContainText(marker);
    }

    const adminReads = await page.evaluate(async () => {
      const sessionToken = localStorage.getItem("tiku.localSessionToken");

      if (sessionToken === null) {
        throw new Error("missing local admin session");
      }

      const headers = { authorization: `Bearer ${sessionToken}` };
      const getJson = async (url: string) => {
        const response = await fetch(url, { headers });

        return { body: await response.json(), status: response.status };
      };

      return {
        aiCallLogSummary: await getJson(
          "/api/v1/ai-call-logs/summary?page=1&pageSize=20",
        ),
        aiCallLogs: await getJson("/api/v1/ai-call-logs?page=1&pageSize=20"),
        auditLogs: await getJson("/api/v1/audit-logs?page=1&pageSize=20"),
        modelConfigs: await getJson("/api/v1/model-configs?page=1&pageSize=20"),
      };
    });

    for (const responseEnvelope of [
      adminReads.auditLogs.body,
      adminReads.aiCallLogs.body,
      adminReads.aiCallLogSummary.body,
      adminReads.modelConfigs.body,
    ]) {
      expectStandardEnvelope(responseEnvelope);
      expectForbiddenPayloadMarkersHidden(responseEnvelope);
      expect(responseEnvelope.code).toBe(0);
    }

    expect(adminReads.auditLogs.body.data.auditLogs.length).toBeGreaterThan(0);
    expect(adminReads.auditLogs.body.data.auditLogs[0]).toMatchObject({
      actionType: expect.any(String),
      metadataSummary: expect.any(String),
      publicId: expect.stringMatching(/^audit-log-/),
      targetResourceType: expect.any(String),
    });
    expect(adminReads.aiCallLogs.body.data.aiCallLogs.length).toBeGreaterThan(
      0,
    );
    expect(adminReads.aiCallLogs.body.data.aiCallLogs[0]).toMatchObject({
      aiFuncType: expect.any(String),
      callStatus: expect.any(String),
      modelAlias: expect.any(String),
      outputSummary: expect.any(String),
      promptSummary: expect.any(String),
      publicId: expect.stringMatching(/^ai-call-log-/),
    });
    expect(
      adminReads.aiCallLogSummary.body.data.dailySummaries.length,
    ).toBeGreaterThan(0);
    expect(
      adminReads.aiCallLogSummary.body.data.dailySummaries[0],
    ).toMatchObject({
      aiFuncType: expect.any(String),
      bucket: expect.any(String),
      callCount: expect.any(Number),
      estimatedCostCny: expect.any(String),
    });
    expect(
      adminReads.modelConfigs.body.data.modelConfigs.length,
    ).toBeGreaterThan(0);
    expect(adminReads.modelConfigs.body.data.modelConfigs[0]).toMatchObject({
      apiKeyDisplay: null,
      publicId: expect.stringMatching(/^model-config-/),
      snapshotPolicy: "redacted_metadata",
    });
  });

  test("manages contact_config runtime from the admin shell", async ({
    page,
  }) => {
    await loginAsAdmin(page);

    await page.getByRole("link", { name: /contact_config/u }).click();

    await expect(page).toHaveURL(/\/ops\/contact-config$/);
    await expect(page.getByTestId("admin-contact-config-page")).toBeVisible();

    const updatedTitle = `Purchase support ${Date.now()}`;

    await page.getByLabel("Contact config title").fill(updatedTitle);
    await page
      .getByLabel("Contact config summary")
      .fill("Use verified local operations channels.");
    await page.getByLabel("Contact config channel value").fill("400-000-2026");
    await page.getByRole("button", { name: /Save contact config/u }).click();
    await expect(page.getByTestId("admin-contact-config-toast")).toContainText(
      "Contact config saved.",
    );

    const contactConfigRuntime = await page.evaluate(async () => {
      const sessionToken = localStorage.getItem("tiku.localSessionToken");

      if (sessionToken === null) {
        throw new Error("missing local admin session");
      }

      const response = await fetch("/api/v1/contact-configs", {
        headers: { authorization: `Bearer ${sessionToken}` },
      });

      return {
        body: await response.json(),
        status: response.status,
      };
    });

    expectStandardEnvelope(contactConfigRuntime.body);
    expectForbiddenPayloadMarkersHidden(contactConfigRuntime.body);
    expect(contactConfigRuntime.body).toMatchObject({
      code: 0,
      data: {
        contactConfig: {
          publicId: "contact-config-local-purchase-guidance",
          title: updatedTitle,
        },
      },
      message: "ok",
    });
  });
});
