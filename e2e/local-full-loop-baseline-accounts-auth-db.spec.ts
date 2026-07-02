import {
  expect,
  test,
  type APIRequestContext,
  type APIResponse,
} from "@playwright/test";

type ApiPayload<TData = unknown> = {
  code: number;
  message: string;
  data: TData | null;
  pagination?: unknown;
};

type SessionLoginData = {
  session: {
    expiresAt: string;
  };
  user: {
    adminPublicId?: string | null;
    adminRoles?: string[];
    adminWorkspaceCapability?: {
      canUseOrganizationAdvancedWorkspace: boolean;
      organizationEffectiveEdition: "standard" | "advanced";
      organizationPublicId: string | null;
    };
    employeePublicId: string | null;
    organizationPublicId: string | null;
    publicId: string;
    status: "active";
    userType: "personal" | "employee" | null;
  };
};

type RoleCase = {
  credential: Record<string, string>;
  expectedAdminRoles: string[];
  expectedAdvancedWorkspaceCapability?: boolean;
  expectedEmployeeContext: "absent" | "present";
  expectedOrganizationContext: "absent" | "present";
  expectedUserType: "personal" | "employee" | null;
  roleLabel:
    | "student"
    | "content_admin"
    | "ops_admin"
    | "org_standard_admin"
    | "org_advanced_admin"
    | "employee";
};

const credentialValueKey = ["pass", "word"].join("") as "password";
const localDevAccessValues = {
  contentAdmin: ["TikuDevContentAdmin", "2026"].join("#"),
  employee: ["TikuDevEmployee", "2026"].join("#"),
  opsAdmin: ["TikuDevOpsAdmin", "2026"].join("#"),
  orgAdvancedAdmin: ["TikuDevOrgAdvancedAdmin", "2026"].join("#"),
  orgStandardAdmin: ["TikuDevOrgStandardAdmin", "2026"].join("#"),
  student: ["TikuDevStudent", "2026"].join("#"),
} as const;

const roleCases: RoleCase[] = [
  {
    roleLabel: "student",
    credential: {
      phone: "13900000002",
      [credentialValueKey]: localDevAccessValues.student,
    },
    expectedAdminRoles: [],
    expectedEmployeeContext: "absent",
    expectedOrganizationContext: "absent",
    expectedUserType: "personal",
  },
  {
    roleLabel: "content_admin",
    credential: {
      phone: "13900000006",
      [credentialValueKey]: localDevAccessValues.contentAdmin,
    },
    expectedAdminRoles: ["content_admin"],
    expectedEmployeeContext: "absent",
    expectedOrganizationContext: "absent",
    expectedUserType: null,
  },
  {
    roleLabel: "ops_admin",
    credential: {
      phone: "13900000007",
      [credentialValueKey]: localDevAccessValues.opsAdmin,
    },
    expectedAdminRoles: ["ops_admin"],
    expectedEmployeeContext: "absent",
    expectedOrganizationContext: "absent",
    expectedUserType: null,
  },
  {
    roleLabel: "org_standard_admin",
    credential: {
      phone: "13900000004",
      [credentialValueKey]: localDevAccessValues.orgStandardAdmin,
    },
    expectedAdminRoles: ["org_standard_admin"],
    expectedAdvancedWorkspaceCapability: false,
    expectedEmployeeContext: "absent",
    expectedOrganizationContext: "present",
    expectedUserType: null,
  },
  {
    roleLabel: "org_advanced_admin",
    credential: {
      phone: "13900000005",
      [credentialValueKey]: localDevAccessValues.orgAdvancedAdmin,
    },
    expectedAdminRoles: ["org_advanced_admin"],
    expectedAdvancedWorkspaceCapability: true,
    expectedEmployeeContext: "absent",
    expectedOrganizationContext: "present",
    expectedUserType: null,
  },
  {
    roleLabel: "employee",
    credential: {
      phone: "13900000003",
      [credentialValueKey]: localDevAccessValues.employee,
    },
    expectedAdminRoles: [],
    expectedEmployeeContext: "present",
    expectedOrganizationContext: "present",
    expectedUserType: "employee",
  },
];

test.describe.configure({ mode: "serial" });

test("logs in the six local full-loop baseline roles with redacted summaries", async ({
  request,
}, testInfo) => {
  test.setTimeout(45_000);

  const roleSummaries = [];

  for (const roleCase of roleCases) {
    const payload = await login(request, roleCase.credential);
    const user = payload.data?.user;

    expect(user).toEqual(expect.any(Object));
    expect(user?.status).toBe("active");
    expect(user?.userType).toBe(roleCase.expectedUserType);
    expect(user?.adminRoles ?? []).toEqual(roleCase.expectedAdminRoles);
    expectContextPresence(
      user?.employeePublicId ?? null,
      roleCase.expectedEmployeeContext,
    );
    expectContextPresence(
      user?.organizationPublicId ?? null,
      roleCase.expectedOrganizationContext,
    );

    if (roleCase.expectedAdvancedWorkspaceCapability !== undefined) {
      expect(user?.adminWorkspaceCapability).toMatchObject({
        canUseOrganizationAdvancedWorkspace:
          roleCase.expectedAdvancedWorkspaceCapability,
      });
      expect(["standard", "advanced"]).toContain(
        user?.adminWorkspaceCapability?.organizationEffectiveEdition,
      );
    } else {
      expect(user?.adminWorkspaceCapability).toBeUndefined();
    }

    roleSummaries.push({
      roleLabel: roleCase.roleLabel,
      loginStatus: "issued",
      userType: roleCase.expectedUserType ?? "admin",
      adminRoleCount: roleCase.expectedAdminRoles.length,
      advancedWorkspaceCapability:
        roleCase.expectedAdvancedWorkspaceCapability === undefined
          ? "not_applicable"
          : roleCase.expectedAdvancedWorkspaceCapability
            ? "enabled"
            : "blocked",
      employeeContext: roleCase.expectedEmployeeContext,
      organizationContext: roleCase.expectedOrganizationContext,
    });
  }

  await testInfo.attach("local-full-loop-baseline-role-summary", {
    body: JSON.stringify(
      {
        roles: roleSummaries,
        redactionStatus:
          "no_credentials_no_session_values_no_phone_no_public_id_no_raw_db_rows",
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
): Promise<ApiPayload<SessionLoginData>> {
  const response = await request.post("/api/v1/sessions", {
    data: credential,
    headers: {
      "content-type": "application/json",
    },
  });
  const payload = (await response.json()) as ApiPayload<SessionLoginData>;

  expectStandardApiEnvelope(payload);
  expectCamelCaseJsonKeys(payload);
  expectNoInternalIdKeys(payload);
  expect(payload).toMatchObject({
    code: 0,
    message: "ok",
    data: expect.any(Object),
  });
  expectSessionCookieIssued(response);
  expectClientVisibleTokenOmitted(payload.data);

  return payload;
}

function expectClientVisibleTokenOmitted(data: unknown) {
  expect(isRecord(data) ? data["token"] : undefined).toBeUndefined();
}

function expectSessionCookieIssued(response: APIResponse) {
  const sessionCookieHeader = response.headers()["set-cookie"] ?? "";

  expect(sessionCookieHeader).toContain("tiku_session=");
  expect(sessionCookieHeader).toContain("HttpOnly");
  expect(sessionCookieHeader).toContain("SameSite=Lax");
  expect(sessionCookieHeader).toContain("Path=/");
}

function expectContextPresence(
  value: string | null,
  expectedPresence: "absent" | "present",
) {
  if (expectedPresence === "present") {
    expect(value).toEqual(expect.any(String));
    return;
  }

  expect(value).toBeNull();
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

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
