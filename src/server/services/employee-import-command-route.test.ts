import { describe, expect, it } from "vitest";

import type {
  EmployeeCredentialManifestDto,
  EmployeeImportCommandDto,
  EmployeeImportCommandServiceResult,
} from "../contracts/employee-import-command-contract";
import type { EmployeeImportCommandService } from "./employee-import-command-service";
import type { SessionService } from "./session-service";
import { createEmployeeImportCommandRouteHandlers } from "./employee-import-command-route";

const IDEMPOTENCY_KEY = "123e4567-e89b-42d3-a456-426614174000";
const COMMAND_PUBLIC_ID = "employee-import-command-public-1";
const COMMAND_DTO: EmployeeImportCommandDto = {
  commandKind: "single_create",
  completedAt: "2026-07-17T12:01:00.000Z",
  counts: { pending: 0, rejected: 0, succeeded: 1 },
  createdAt: "2026-07-17T12:00:00.000Z",
  credentialDistributionStatus: "not_required",
  credentialRevision: 0,
  currentIssuePublicId: null,
  distributionConfirmedAt: null,
  organizationPublicId: "organization-public-1",
  publicId: COMMAND_PUBLIC_ID,
  rowCount: 1,
  rows: [
    {
      credentialMode: "provided",
      employeePublicId: "employee-public-1",
      outcomeKind: "created",
      publicId: "employee-import-row-public-1",
      rejectionReason: null,
      rowNumber: 1,
      status: "succeeded",
      warningReason: null,
    },
  ],
  status: "completed",
  updatedAt: "2026-07-17T12:01:00.000Z",
};

type AdminRole = "content_admin" | "ops_admin" | "super_admin";

function createSessionService(
  input: {
    role?: AdminRole;
    resolutionCount?: { value: number };
  } = {},
): Pick<SessionService, "getCurrentSession"> {
  return {
    async getCurrentSession(requestInput) {
      if (input.resolutionCount !== undefined) {
        input.resolutionCount.value += 1;
      }
      if (
        requestInput.authorization !== "Bearer admin-session-token" ||
        input.role === undefined
      ) {
        return { code: 401001, message: "Unauthorized.", data: null };
      }

      return {
        code: 0,
        message: "ok",
        data: {
          session: { expiresAt: "2026-07-17T20:00:00.000Z" },
          user: {
            adminPublicId: "admin-public-1",
            adminRoles: [input.role],
            employeePublicId: null,
            lockedUntilAt: null,
            name: "Admin",
            organizationPublicId: null,
            phone: "13900000001",
            publicId: "admin-user-public-1",
            status: "active",
            userType: null,
          },
        },
      };
    },
  };
}

function createService(
  input: {
    calls?: unknown[];
    confirmResult?: EmployeeImportCommandServiceResult<EmployeeImportCommandDto>;
    getResult?: EmployeeImportCommandServiceResult<EmployeeImportCommandDto>;
    issueResult?: EmployeeImportCommandServiceResult<EmployeeCredentialManifestDto>;
    submitResult?: EmployeeImportCommandServiceResult<EmployeeImportCommandDto>;
  } = {},
): EmployeeImportCommandService {
  const successResult: EmployeeImportCommandServiceResult<EmployeeImportCommandDto> =
    {
      httpStatus: 200,
      response: { code: 0, message: "ok", data: COMMAND_DTO },
    };

  return {
    async submit(serviceInput) {
      input.calls?.push({ action: "submit", serviceInput });
      return input.submitResult ?? successResult;
    },
    async get(serviceInput) {
      input.calls?.push({ action: "get", serviceInput });
      return input.getResult ?? successResult;
    },
    async issueCredentials(serviceInput) {
      input.calls?.push({ action: "issueCredentials", serviceInput });
      return (
        input.issueResult ?? {
          httpStatus: 200,
          response: {
            code: 0,
            message: "ok",
            data: {
              credentialRevision: 1,
              issuePublicId: "employee-credential-issue-public-1",
              rows: [
                {
                  employeePublicId: "employee-public-1",
                  initialPassword: "ManifestSecret1",
                  name: "Employee One",
                  phone: "139****0001",
                  rowNumber: 1,
                  rowPublicId: "employee-import-row-public-1",
                },
              ],
            },
          },
        }
      );
    },
    async confirmDistribution(serviceInput) {
      input.calls?.push({ action: "confirmDistribution", serviceInput });
      return input.confirmResult ?? successResult;
    },
  };
}

function createRequest(
  input: {
    body?: unknown;
    idempotencyKey?: string;
    token?: string;
  } = {},
): Request {
  const headers = new Headers();
  if (input.token !== undefined) {
    headers.set("authorization", input.token);
  }
  if (input.idempotencyKey !== undefined) {
    headers.set("idempotency-key", input.idempotencyKey);
  }
  if (input.body !== undefined) {
    headers.set("content-type", "application/json");
  }

  return new Request("http://localhost/api/v1/employee-import-commands", {
    method: "POST",
    headers,
    body: input.body === undefined ? undefined : JSON.stringify(input.body),
  });
}

describe("employee import command route", () => {
  it.each([undefined, "Bearer invalid-session"])(
    "returns 401 with no-store for missing or invalid session",
    async (token) => {
      const handlers = createEmployeeImportCommandRouteHandlers({
        commandService: createService(),
        sessionService: createSessionService({ role: "ops_admin" }),
      });
      const response = await handlers.collection.POST(createRequest({ token }));

      expect(response.status).toBe(401);
      expect(response.headers.get("cache-control")).toBe("no-store");
      await expect(response.json()).resolves.toEqual({
        code: 401001,
        message: "Admin session is required.",
        data: null,
      });
    },
  );

  it("returns 403 with no-store for content_admin without calling the command service", async () => {
    const calls: unknown[] = [];
    const handlers = createEmployeeImportCommandRouteHandlers({
      commandService: createService({ calls }),
      sessionService: createSessionService({ role: "content_admin" }),
    });

    const response = await handlers.collection.POST(
      createRequest({ token: "Bearer admin-session-token" }),
    );

    expect(response.status).toBe(403);
    expect(response.headers.get("cache-control")).toBe("no-store");
    expect(calls).toEqual([]);
  });

  it.each([undefined, "not-a-uuid"])(
    "returns the service 422 status for a missing or malformed Idempotency-Key",
    async (idempotencyKey) => {
      const calls: unknown[] = [];
      const handlers = createEmployeeImportCommandRouteHandlers({
        commandService: createService({
          calls,
          submitResult: {
            httpStatus: 422,
            response: {
              code: 422601,
              message: "Idempotency-Key must be a UUID v4.",
              data: null,
            },
          },
        }),
        sessionService: createSessionService({ role: "ops_admin" }),
      });
      const response = await handlers.collection.POST(
        createRequest({
          body: {
            commandKind: "single_create",
            organizationPublicId: "organization-public-1",
            rows: [{ phone: "13900000002", name: "Employee One" }],
          },
          idempotencyKey,
          token: "Bearer admin-session-token",
        }),
      );

      expect(response.status).toBe(422);
      expect(response.headers.get("cache-control")).toBe("no-store");
      expect(calls).toEqual([
        {
          action: "submit",
          serviceInput: expect.objectContaining({
            idempotencyKey: idempotencyKey ?? null,
          }),
        },
      ]);
    },
  );

  it.each(["ops_admin", "super_admin"] as const)(
    "submits for %s, resolves one actor, and does not serialize the submitted password",
    async (role) => {
      const calls: unknown[] = [];
      const resolutionCount = { value: 0 };
      const handlers = createEmployeeImportCommandRouteHandlers({
        commandService: createService({ calls }),
        sessionService: createSessionService({ role, resolutionCount }),
      });
      const response = await handlers.collection.POST(
        createRequest({
          body: {
            commandKind: "single_create",
            organizationPublicId: "organization-public-1",
            rows: [
              {
                initialPassword: "RequestSecret1",
                name: "Employee One",
                phone: "13900000002",
              },
            ],
          },
          idempotencyKey: IDEMPOTENCY_KEY,
          token: "Bearer admin-session-token",
        }),
      );
      const serializedResponse = JSON.stringify(await response.json());

      expect(response.status).toBe(200);
      expect(response.headers.get("cache-control")).toBe("no-store");
      expect(resolutionCount.value).toBe(1);
      expect(calls).toEqual([
        {
          action: "submit",
          serviceInput: expect.objectContaining({
            actor: {
              publicId: "admin-public-1",
              requestIp: null,
              role,
            },
            idempotencyKey: IDEMPOTENCY_KEY,
          }),
        },
      ]);
      expect(serializedResponse).not.toContain("RequestSecret1");
    },
  );

  it("applies actor visibility and no-store to GET, issue, and confirm actions", async () => {
    const calls: unknown[] = [];
    const handlers = createEmployeeImportCommandRouteHandlers({
      commandService: createService({ calls }),
      sessionService: createSessionService({ role: "ops_admin" }),
    });
    const context = {
      params: Promise.resolve({ publicId: COMMAND_PUBLIC_ID }),
    };
    const authorizationHeaders = {
      authorization: "Bearer admin-session-token",
      "content-type": "application/json",
    };
    const responses = await Promise.all([
      handlers.item.GET(
        new Request(
          `http://localhost/api/v1/employee-import-commands/${COMMAND_PUBLIC_ID}`,
          {
            headers: authorizationHeaders,
          },
        ),
        context,
      ),
      handlers.issueCredentials.POST(
        new Request(
          `http://localhost/api/v1/employee-import-commands/${COMMAND_PUBLIC_ID}/issue-credentials`,
          {
            method: "POST",
            headers: authorizationHeaders,
            body: JSON.stringify({ expectedCredentialRevision: 0 }),
          },
        ),
        context,
      ),
      handlers.confirmDistribution.POST(
        new Request(
          `http://localhost/api/v1/employee-import-commands/${COMMAND_PUBLIC_ID}/confirm-distribution`,
          {
            method: "POST",
            headers: authorizationHeaders,
            body: JSON.stringify({
              expectedCredentialRevision: 1,
              issuePublicId: "employee-credential-issue-public-1",
            }),
          },
        ),
        context,
      ),
    ]);

    expect(responses.map((response) => response.status)).toEqual([
      200, 200, 200,
    ]);
    expect(
      responses.map((response) => response.headers.get("cache-control")),
    ).toEqual(["no-store", "no-store", "no-store"]);
    expect(calls).toHaveLength(3);
    expect(calls).toEqual([
      {
        action: "get",
        serviceInput: expect.objectContaining({
          commandPublicId: COMMAND_PUBLIC_ID,
        }),
      },
      {
        action: "issueCredentials",
        serviceInput: expect.objectContaining({
          commandPublicId: COMMAND_PUBLIC_ID,
        }),
      },
      {
        action: "confirmDistribution",
        serviceInput: expect.objectContaining({
          commandPublicId: COMMAND_PUBLIC_ID,
        }),
      },
    ]);
    const serializedPayloads = await Promise.all(
      responses.map(async (response) => JSON.stringify(await response.json())),
    );
    expect(serializedPayloads[0]).not.toContain("ManifestSecret1");
    expect(serializedPayloads[1]).toContain("ManifestSecret1");
    expect(serializedPayloads[2]).not.toContain("ManifestSecret1");
  });

  it.each([
    [409, 409601, "Idempotency request mismatch."],
    [503, 503601, "Employee import command is temporarily unavailable."],
  ] as const)(
    "uses matching HTTP %i and envelope status with no-store",
    async (httpStatus, code, message) => {
      const handlers = createEmployeeImportCommandRouteHandlers({
        commandService: createService({
          submitResult: {
            httpStatus,
            response: { code, message, data: null },
          },
        }),
        sessionService: createSessionService({ role: "ops_admin" }),
      });
      const response = await handlers.collection.POST(
        createRequest({
          body: {
            commandKind: "single_create",
            organizationPublicId: "organization-public-1",
            rows: [{ phone: "13900000002", name: "Employee One" }],
          },
          idempotencyKey: IDEMPOTENCY_KEY,
          token: "Bearer admin-session-token",
        }),
      );

      expect(response.status).toBe(httpStatus);
      expect(response.headers.get("cache-control")).toBe("no-store");
      await expect(response.json()).resolves.toEqual({
        code,
        message,
        data: null,
      });
    },
  );
});
