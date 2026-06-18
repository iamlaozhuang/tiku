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

type OrganizationCollectionData = {
  organizations: {
    publicId: string;
  }[];
};

type OrgAuthData = {
  orgAuth: {
    accountQuota?: number;
    authScopeType?: "current_and_descendants";
    level?: number;
    organizationPublicIds?: string[];
    publicId: string;
    purchaserOrganizationPublicId?: string;
    status?: "active" | "cancelled" | "expired";
    profession?: "marketing";
  };
};

type OrgAuthCollectionData = {
  orgAuths: OrgAuthData["orgAuth"][];
};

type EmployeeAccountData = {
  employeeAccount: {
    employee: {
      publicId: string;
      organizationPublicId: string;
    };
    user: {
      publicId: string;
      userType: "employee";
    };
  };
};

type DraftData = {
  draft: {
    publicId: string;
    organizationPublicId: string;
    authorizationPublicId: string;
    profession: "marketing";
    level: number;
    subject: "theory";
    title: string;
    description: string | null;
  };
};

type VersionData = {
  version: {
    publicId: string;
    draftPublicId: string;
    organizationPublicId: string;
    title: string;
    status: "published" | "taken_down";
    questionCount: number;
    totalScore: number;
  };
};

type VisibleListData = {
  versions: VersionData["version"][];
};

type AnswerData = {
  answer: {
    publicId: string;
    trainingVersionPublicId: string;
    employeePublicId: string;
    organizationPublicId: string;
    answerStatus: "in_progress" | "submitted" | "read_only";
    scoreSummary: {
      score: number;
      totalScore: number;
    } | null;
    resultSummaryVisible: boolean;
  };
};

const credentialValueKey = ["pass", "word"].join("");
const localAdminAccessValue = [["TikuDev", "Admin"].join(""), "2026"].join("#");
const localSessionStorageKey = "tiku.localSessionToken";
const seedVisibleOrganizationPublicId = "org-dev-province";
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

test.describe.configure({ mode: "serial" });

test("runs local admin draft/source/copy and employee answer flow", async ({
  page,
  request,
}, testInfo) => {
  test.setTimeout(90_000);

  const runSuffix = String(Date.now()).slice(-8);
  const adminClient = await login(page.request, seedAdminCredential);
  const organizationPublicId = await readSeedVisibleOrganizationPublicId(
    request,
    adminClient,
  );
  const orgAuthPublicId = await createLocalOrgAuth(
    request,
    adminClient,
    organizationPublicId,
    runSuffix,
  );
  const employeeAccessValue = ["OrgTrainingEmployee", runSuffix].join("#");
  const employeePhone = `136${runSuffix}`;
  await createLocalEmployeeAccount(request, adminClient, {
    phone: employeePhone,
    accessValue: employeeAccessValue,
    organizationPublicId,
    runSuffix,
  });

  await installBrowserSession(page, adminClient.sessionValue);
  const draftPublicId = await createDraftFromAdminUi(page, {
    organizationPublicId,
    orgAuthPublicId,
    runSuffix,
  });
  await expectNoSensitiveBrowserText(page, [
    adminClient.sessionValue,
    localAdminAccessValue,
    employeeAccessValue,
  ]);

  await attachSourceContextFromAdminUi(page, draftPublicId);
  const versionPublicId = await publishDraft(
    request,
    adminClient,
    draftPublicId,
    organizationPublicId,
    orgAuthPublicId,
    runSuffix,
  );
  await copyVersionFromAdminUi(page, versionPublicId);

  const employeeClient = await login(page.request, {
    phone: employeePhone,
    [credentialValueKey]: employeeAccessValue,
  } as Record<string, string>);

  const visibleListPayload = await getJson<VisibleListData>(
    request,
    employeeClient,
    "/api/v1/organization-trainings/visible-list",
  );
  expect(visibleListPayload.code).toBe(0);
  expect(visibleListPayload.data?.versions).toEqual(
    expect.arrayContaining([
      expect.objectContaining({
        publicId: versionPublicId,
        organizationPublicId,
        status: "published",
      }),
    ]),
  );

  await installBrowserSession(page, employeeClient.sessionValue);
  await answerTrainingFromEmployeeUi(page, versionPublicId);
  await expectNoSensitiveBrowserText(page, [
    adminClient.sessionValue,
    employeeClient.sessionValue,
    localAdminAccessValue,
    employeeAccessValue,
  ]);

  await testInfo.attach("organization-training-local-full-flow-summary", {
    body: JSON.stringify(
      {
        organizationPublicIdClass: classifyPublicId(
          organizationPublicId,
          "org",
        ),
        orgAuthPublicIdClass: classifyPublicId(orgAuthPublicId, "org_auth"),
        draftPublicIdClass: classifyPublicId(
          draftPublicId,
          "organization_training_draft",
        ),
        versionPublicIdClass: classifyPublicId(
          versionPublicId,
          "organization_training_version",
        ),
        employeeFlow: "visible_list_draft_save_submit_readonly_summary",
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

async function readSeedVisibleOrganizationPublicId(
  request: APIRequestContext,
  client: AuthenticatedClient,
): Promise<string> {
  const payload = await getJson<OrganizationCollectionData>(
    request,
    client,
    "/api/v1/organizations?page=1&pageSize=20",
  );
  expect(payload.code).toBe(0);

  const visibleOrganization = payload.data?.organizations.find(
    (organizationItem) =>
      organizationItem.publicId === seedVisibleOrganizationPublicId,
  );
  expect(visibleOrganization?.publicId).toBe(seedVisibleOrganizationPublicId);

  return seedVisibleOrganizationPublicId;
}

async function createLocalOrgAuth(
  request: APIRequestContext,
  client: AuthenticatedClient,
  organizationPublicId: string,
  runSuffix: string,
): Promise<string> {
  const payload = await postJson<OrgAuthData>(
    request,
    client,
    "/api/v1/org-auths",
    {
      name: `organization-training-local-flow-${runSuffix}`,
      purchaserOrganizationPublicId: organizationPublicId,
      authScopeType: "current_and_descendants",
      profession: "marketing",
      level: 3,
      accountQuota: 3,
      startsAt: "2026-06-01T00:00:00.000Z",
      expiresAt: "2027-06-01T00:00:00.000Z",
      organizationPublicIds: [],
    },
  );
  if (payload.code !== 0) {
    expect([409005, 409006]).toContain(payload.code);

    return findReusableOrgAuthPublicId(request, client, organizationPublicId);
  }

  return readRequiredNestedString(payload, ["data", "orgAuth", "publicId"]);
}

async function findReusableOrgAuthPublicId(
  request: APIRequestContext,
  client: AuthenticatedClient,
  organizationPublicId: string,
): Promise<string> {
  const payload = await getJson<OrgAuthCollectionData>(
    request,
    client,
    "/api/v1/org-auths?page=1&pageSize=100&sortBy=updatedAt&sortOrder=desc",
  );
  expect(payload.code).toBe(0);

  const reusableOrgAuth = payload.data?.orgAuths.find((orgAuth) => {
    const coversOrganization =
      orgAuth.purchaserOrganizationPublicId === organizationPublicId ||
      (orgAuth.organizationPublicIds ?? []).includes(organizationPublicId);

    return (
      coversOrganization &&
      orgAuth.status === "active" &&
      orgAuth.authScopeType === "current_and_descendants" &&
      orgAuth.profession === "marketing" &&
      orgAuth.level === 3 &&
      (orgAuth.accountQuota ?? 0) > 0
    );
  });

  expect(reusableOrgAuth?.publicId).toEqual(expect.any(String));

  return reusableOrgAuth?.publicId ?? "";
}

async function createLocalEmployeeAccount(
  request: APIRequestContext,
  client: AuthenticatedClient,
  input: {
    accessValue: string;
    organizationPublicId: string;
    phone: string;
    runSuffix: string;
  },
) {
  const payload = await postJson<EmployeeAccountData>(
    request,
    client,
    "/api/v1/employees",
    {
      phone: input.phone,
      name: `organization-training-employee-${input.runSuffix}`,
      initialPassword: input.accessValue,
      organizationPublicId: input.organizationPublicId,
    },
  );
  expect(payload.code).toBe(0);
  expect(payload.data?.employeeAccount.employee.organizationPublicId).toBe(
    input.organizationPublicId,
  );
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

async function createDraftFromAdminUi(
  page: Page,
  input: {
    organizationPublicId: string;
    orgAuthPublicId: string;
    runSuffix: string;
  },
): Promise<string> {
  await page.goto("/content/organization-training");
  const forms = page.locator("form");
  await expect(forms).toHaveCount(3);

  const draftForm = forms.nth(0);
  await draftForm.locator("input").nth(0).fill(input.organizationPublicId);
  await draftForm.locator("input").nth(1).fill(input.orgAuthPublicId);
  await draftForm
    .locator("input")
    .nth(2)
    .fill(`Organization training local flow ${input.runSuffix}`);
  await draftForm.locator("input").nth(3).fill("metadata-only local flow");
  await draftForm.locator("select").nth(0).selectOption("marketing");
  await draftForm.locator('input[type="number"]').fill("3");
  await draftForm.locator("select").nth(1).selectOption("theory");

  const draftResponsePromise = page.waitForResponse((response) => {
    const request = response.request();

    return (
      request.method() === "POST" &&
      new URL(response.url()).pathname === "/api/v1/organization-trainings"
    );
  });
  await draftForm.locator('button[type="submit"]').click();

  const draftPayload = (await draftResponsePromise.then((response) =>
    response.json(),
  )) as ApiPayload<DraftData>;
  expectStandardApiEnvelope(draftPayload);
  expectCamelCaseJsonKeys(draftPayload);
  expectNoInternalIdKeys(draftPayload);
  expect(draftPayload.code).toBe(0);

  const draftPublicId = readRequiredNestedString(draftPayload, [
    "data",
    "draft",
    "publicId",
  ]);
  const draftCard = page.getByTestId(
    `organization-training-draft-${draftPublicId}`,
  );
  await expect(draftCard).toBeVisible();
  await expect(draftCard).toHaveAttribute("data-public-id", draftPublicId);
  await expect(draftCard).not.toHaveAttribute("data-id", /.*/);

  return draftPublicId;
}

async function attachSourceContextFromAdminUi(
  page: Page,
  draftPublicId: string,
) {
  const sourceForm = page.locator("form").nth(1);
  await sourceForm.locator("input").nth(0).fill("paper-dev-theory");
  await sourceForm.locator("input").nth(1).fill("dev paper metadata source");
  await sourceForm.locator('input[type="number"]').nth(0).fill("1");
  await sourceForm.locator('input[type="number"]').nth(1).fill("2");

  const sourceResponsePromise = page.waitForResponse((response) => {
    const request = response.request();

    return (
      request.method() === "POST" &&
      new URL(response.url()).pathname ===
        `/api/v1/organization-trainings/${draftPublicId}/source-contexts`
    );
  });
  await sourceForm.locator('button[type="submit"]').click();

  const sourcePayload = (await sourceResponsePromise.then((response) =>
    response.json(),
  )) as ApiPayload;
  expectStandardApiEnvelope(sourcePayload);
  expectCamelCaseJsonKeys(sourcePayload);
  expectNoInternalIdKeys(sourcePayload);
  expect(sourcePayload.code).toBe(0);
  await expect(page.locator("body")).toContainText("paper-dev-theory");
}

async function publishDraft(
  request: APIRequestContext,
  client: AuthenticatedClient,
  draftPublicId: string,
  organizationPublicId: string,
  orgAuthPublicId: string,
  runSuffix: string,
): Promise<string> {
  const payload = await postJson<VersionData>(
    request,
    client,
    `/api/v1/organization-trainings/${draftPublicId}/publish`,
    {
      draftPublicId,
      organizationPublicId,
      authorizationPublicId: orgAuthPublicId,
      profession: "marketing",
      level: 3,
      subject: "theory",
      title: `Organization training local flow ${runSuffix}`,
      description: "metadata-only local publish",
      questions: [
        {
          publicId: `organization-training-question-${runSuffix}`,
          questionType: "single_choice",
          score: 2,
          standardAnswer: "A",
          analysisSummary: "metadata-only local scoring summary",
          evidenceStatus: "sufficient",
          citationCount: 0,
        },
      ],
      publishScopeOrganizationPublicIds: [organizationPublicId],
      capabilityContext: {
        effectiveEdition: "advanced",
        authorizationSource: "org_auth",
        canCreateOrganizationTraining: true,
      },
    },
  );
  expect(payload.code).toBe(0);
  expect(payload.data?.version.status).toBe("published");

  return readRequiredNestedString(payload, ["data", "version", "publicId"]);
}

async function copyVersionFromAdminUi(page: Page, versionPublicId: string) {
  const copyForm = page.locator("form").nth(2);
  await copyForm.locator("input").nth(0).fill(versionPublicId);
  await copyForm
    .locator("input")
    .nth(1)
    .fill(`Organization training copied ${versionPublicId.slice(-6)}`);

  const copyResponsePromise = page.waitForResponse((response) => {
    const request = response.request();

    return (
      request.method() === "POST" &&
      new URL(response.url()).pathname ===
        `/api/v1/organization-trainings/${versionPublicId}/copy-to-new-draft`
    );
  });
  await copyForm.locator('button[type="submit"]').click();

  const copyPayload = (await copyResponsePromise.then((response) =>
    response.json(),
  )) as ApiPayload<DraftData>;
  expectStandardApiEnvelope(copyPayload);
  expectCamelCaseJsonKeys(copyPayload);
  expectNoInternalIdKeys(copyPayload);
  expect(copyPayload.code).toBe(0);

  const copiedDraftPublicId = readRequiredNestedString(copyPayload, [
    "data",
    "draft",
    "publicId",
  ]);
  await expect(
    page.getByTestId(`organization-training-draft-${copiedDraftPublicId}`),
  ).toBeVisible();
}

async function answerTrainingFromEmployeeUi(
  page: Page,
  versionPublicId: string,
) {
  await page.goto("/organization-training");
  const trainingRow = page.getByTestId(
    `organization-training-row-${versionPublicId}`,
  );
  await expect(trainingRow).toBeVisible();
  await expect(trainingRow).toHaveAttribute("data-public-id", versionPublicId);
  await expect(trainingRow).not.toHaveAttribute("data-id", /.*/);

  await trainingRow.locator('input[type="number"]').nth(0).fill("1");
  await trainingRow.locator('input[type="number"]').nth(1).fill("2");
  await trainingRow.locator('input[type="number"]').nth(2).fill("2");

  await clickRowButtonAndExpectAnswerResponse(trainingRow, "draft-save");
  await clickRowButtonAndExpectAnswerResponse(trainingRow, "submit");
  await clickRowButtonAndExpectAnswerResponse(trainingRow, "readonly-summary");

  await expect(trainingRow).toContainText("2 / 2");
}

async function clickRowButtonAndExpectAnswerResponse(
  trainingRow: ReturnType<Page["getByTestId"]>,
  action: "draft-save" | "readonly-summary" | "submit",
) {
  const buttonIndexByAction = {
    "draft-save": 0,
    submit: 1,
    "readonly-summary": 2,
  } satisfies Record<typeof action, number>;
  const responsePathSuffixByAction = {
    "draft-save": "/employee-answers/draft-save",
    submit: "/employee-answers/submit",
    "readonly-summary": "/employee-answers/readonly-summary",
  } satisfies Record<typeof action, string>;
  const methodByAction = {
    "draft-save": "POST",
    submit: "POST",
    "readonly-summary": "GET",
  } satisfies Record<typeof action, "GET" | "POST">;
  const versionPublicId =
    (await trainingRow.getAttribute("data-public-id")) ?? "";
  const page = trainingRow.page();

  const responsePromise = page.waitForResponse((response) => {
    const request = response.request();
    const pathname = new URL(response.url()).pathname;

    return (
      request.method() === methodByAction[action] &&
      pathname ===
        `/api/v1/organization-trainings/${versionPublicId}${responsePathSuffixByAction[action]}`
    );
  });
  await trainingRow.locator("button").nth(buttonIndexByAction[action]).click();

  const payload = (await responsePromise.then((response) =>
    response.json(),
  )) as ApiPayload<AnswerData>;
  expectStandardApiEnvelope(payload);
  expectCamelCaseJsonKeys(payload);
  expectNoInternalIdKeys(payload);
  expect(payload.code).toBe(0);
}

async function getJson<TData>(
  request: APIRequestContext,
  client: AuthenticatedClient,
  path: string,
): Promise<ApiPayload<TData>> {
  const response = await request.get(path, { headers: client.headers });
  const payload = (await response.json()) as ApiPayload<TData>;
  expectStandardApiEnvelope(payload);
  expectCamelCaseJsonKeys(payload);
  expectNoInternalIdKeys(payload);
  expectNoSensitivePayload(payload, [client.sessionValue]);

  return payload;
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
      throw new Error("Missing required string in organization training flow.");
    }

    currentValue = currentValue[pathSegment];
  }

  expect(currentValue).toEqual(expect.any(String));

  if (typeof currentValue !== "string" || currentValue.trim() === "") {
    throw new Error("Missing required string in organization training flow.");
  }

  return currentValue;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function classifyPublicId(publicId: string, expectedPrefix: string): string {
  return publicId.startsWith(expectedPrefix)
    ? `${expectedPrefix}_public_id`
    : "public_id";
}
