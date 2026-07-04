import { expect, test } from "@playwright/test";
import fs from "node:fs";

const primaryRoles = [
  "personal_standard_student",
  "personal_advanced_student",
  "org_standard_employee",
  "org_advanced_employee",
  "org_standard_admin",
  "org_advanced_admin",
  "content_admin",
  "ops_admin",
] as const;

const defaultFixturePath =
  "D:\\tiku-local-private\\acceptance\\role-separated-local-accounts-2026-06-23.md";

type PrimaryRole = (typeof primaryRoles)[number];

type RoleCredential = {
  role: PrimaryRole;
  phone: string;
  loginSecret: string;
};

type ApiEnvelope = {
  code?: unknown;
  message?: unknown;
  data?: unknown;
};

test("loads all eight primary role credentials from the private acceptance fixture", () => {
  const roleCredentials = loadCredentialBackedRoleCredentials();

  expect(roleCredentials.map((credential) => credential.role)).toEqual([
    ...primaryRoles,
  ]);
});

test("logs in all eight primary roles through credential-backed local sessions", async ({
  request,
}) => {
  const roleCredentials = loadCredentialBackedRoleCredentials();

  for (const credential of roleCredentials) {
    const response = await request.post("/api/v1/sessions", {
      data: buildLoginPayload(credential),
      headers: {
        "content-type": "application/json",
      },
    });

    if (!response.ok()) {
      throw new Error(
        `Session login failed for ${credential.role} with status ${response.status()}.`,
      );
    }

    const payload = (await response.json()) as ApiEnvelope;
    assertSessionEnvelope(credential.role, payload);
    assertSessionCookieIssued(
      credential.role,
      response.headers()["set-cookie"],
    );
  }
});

function loadCredentialBackedRoleCredentials(): RoleCredential[] {
  const fixturePath =
    process.env["TIKU_ROLE_ACCOUNT_FIXTURE_PATH"] ?? defaultFixturePath;

  if (!fs.existsSync(fixturePath)) {
    throw new Error("Private acceptance account fixture is missing.");
  }

  const fixtureText = fs.readFileSync(fixturePath, "utf8");
  const roleCredentialMap = new Map<PrimaryRole, Partial<RoleCredential>>();
  let currentRole: PrimaryRole | null = null;

  for (const line of fixtureText.split(/\r?\n/u)) {
    const role = readRoleRow(line);

    if (role !== null) {
      currentRole = role;
      roleCredentialMap.set(role, { role });
      continue;
    }

    if (currentRole === null) {
      continue;
    }

    const credential = roleCredentialMap.get(currentRole) ?? {
      role: currentRole,
    };
    const loginPhone = readScalarField(line, "login phone");
    const loginSecret = readScalarField(line, "password");

    if (loginPhone !== null) {
      credential.phone = loginPhone;
    }

    if (loginSecret !== null) {
      credential.loginSecret = loginSecret;
    }

    roleCredentialMap.set(currentRole, credential);
  }

  return primaryRoles.map((role) => {
    const credential = roleCredentialMap.get(role);

    if (credential?.phone === undefined) {
      throw new Error(`Missing login phone for ${role}.`);
    }

    if (credential.loginSecret === undefined) {
      throw new Error(`Missing password for ${role}.`);
    }

    return {
      role,
      phone: credential.phone,
      loginSecret: credential.loginSecret,
    };
  });
}

function buildLoginPayload(credential: RoleCredential): Record<string, string> {
  const payload: Record<string, string> = {
    phone: credential.phone,
  };

  payload["password"] = credential.loginSecret;

  return payload;
}

function readRoleRow(line: string): PrimaryRole | null {
  const match = line.match(/^\s*[-*]?\s*role row\s*[:：]\s*`?([a-z_]+)`?/iu);
  const role = match?.[1];

  if (primaryRoles.includes(role as PrimaryRole)) {
    return role as PrimaryRole;
  }

  return null;
}

function readScalarField(line: string, key: string): string | null {
  const match = line.match(
    new RegExp(`^\\s*[-*]?\\s*${key}\\s*[:：]\\s*(.+?)\\s*$`, "iu"),
  );

  if (match?.[1] === undefined) {
    return null;
  }

  return stripMarkdownValue(match[1]);
}

function stripMarkdownValue(value: string): string {
  return value.trim().replace(/^`/u, "").replace(/`$/u, "").trim();
}

function assertSessionEnvelope(role: PrimaryRole, payload: ApiEnvelope) {
  if (payload.code !== 0 || payload.message !== "ok") {
    throw new Error(`Session envelope failed for ${role}.`);
  }

  if (!isRecord(payload.data)) {
    throw new Error(`Session data missing for ${role}.`);
  }

  if (typeof payload.data["token"] === "string") {
    throw new Error(`Client-visible session token leaked for ${role}.`);
  }

  const user = payload.data["user"];

  if (!isRecord(user)) {
    throw new Error(`Session user missing for ${role}.`);
  }

  assertRoleSpecificSession(role, user);
}

function assertRoleSpecificSession(
  role: PrimaryRole,
  user: Record<string, unknown>,
) {
  if (
    role === "personal_standard_student" ||
    role === "personal_advanced_student"
  ) {
    expect(user["userType"]).toBe("personal");
    return;
  }

  if (role === "org_standard_employee" || role === "org_advanced_employee") {
    expect(user["userType"]).toBe("employee");
    expect(typeof user["employeePublicId"]).toBe("string");
    return;
  }

  const adminRoles = Array.isArray(user["adminRoles"])
    ? user["adminRoles"]
    : [];

  expect(adminRoles).toContain(role);
}

function assertSessionCookieIssued(
  role: PrimaryRole,
  sessionCookieHeader: string | undefined,
) {
  const cookieHeader = sessionCookieHeader ?? "";

  if (!cookieHeader.includes("tiku_session=")) {
    throw new Error(`Session cookie missing for ${role}.`);
  }

  if (!cookieHeader.includes("HttpOnly")) {
    throw new Error(`HttpOnly session cookie flag missing for ${role}.`);
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
