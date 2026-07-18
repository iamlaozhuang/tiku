import { act, renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type {
  EmployeeCredentialManifestDto,
  EmployeeImportCommandDto,
} from "@/server/contracts/employee-import-command-contract";

import type { EmployeeImportCommandClient } from "./employee-import-command-client";
import { useEmployeeImportCommand } from "./useEmployeeImportCommand";

const submitInput = {
  commandKind: "batch_import" as const,
  organizationPublicId: "organization-public-1",
  rows: [
    {
      initialPassword: "RequestSecret1",
      name: "Employee One",
      phone: "13900000001",
    },
  ],
};

function command(
  overrides: Partial<EmployeeImportCommandDto> = {},
): EmployeeImportCommandDto {
  return {
    commandKind: "batch_import",
    completedAt: "2026-07-17T12:01:00.000Z",
    counts: { pending: 0, rejected: 0, succeeded: 1 },
    createdAt: "2026-07-17T12:00:00.000Z",
    credentialDistributionStatus: "open",
    credentialRevision: 0,
    currentIssuePublicId: null,
    distributionConfirmedAt: null,
    organizationPublicId: "organization-public-1",
    publicId: "command-public-1",
    rowCount: 1,
    rows: [
      {
        credentialMode: "generated",
        employeePublicId: "employee-public-1",
        outcomeKind: "created",
        publicId: "row-public-1",
        rejectionReason: null,
        rowNumber: 1,
        status: "succeeded",
        warningReason: null,
      },
    ],
    status: "completed",
    updatedAt: "2026-07-17T12:01:00.000Z",
    ...overrides,
  };
}

function manifest(revision: number): EmployeeCredentialManifestDto {
  return {
    credentialRevision: revision,
    issuePublicId: `issue-public-${revision}`,
    rows: [
      {
        employeePublicId: "employee-public-1",
        initialPassword: `ManifestSecret${revision}`,
        name: "Employee One",
        phone: "139****0001",
        rowNumber: 1,
        rowPublicId: "row-public-1",
      },
    ],
  };
}

function ok<TData>(data: TData) {
  return Promise.resolve({
    httpStatus: 200,
    response: { code: 0, message: "ok", data },
  });
}

function deferred<TValue>() {
  let resolve!: (value: TValue) => void;
  let reject!: (reason?: unknown) => void;
  const promise = new Promise<TValue>((resolvePromise, rejectPromise) => {
    resolve = resolvePromise;
    reject = rejectPromise;
  });

  return { promise, reject, resolve };
}

function createClient(
  overrides: Partial<EmployeeImportCommandClient> = {},
): EmployeeImportCommandClient {
  return {
    confirmDistribution: vi.fn(() =>
      ok(command({ credentialDistributionStatus: "confirmed" })),
    ),
    get: vi.fn(() => ok(command())),
    issueCredentials: vi.fn(() => ok(manifest(1))),
    submit: vi.fn(() => ok(command())),
    ...overrides,
  };
}

describe("useEmployeeImportCommand", () => {
  beforeEach(() => {
    window.history.replaceState(null, "", "/admin/org-auth-redeem");
    vi.spyOn(crypto, "randomUUID").mockReturnValue(
      "123e4567-e89b-42d3-a456-426614174000",
    );
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("generates a UUID, stores only recovery identifiers, and clears input when complete", async () => {
    const client = createClient();
    const { result } = renderHook(() =>
      useEmployeeImportCommand({ client, sessionToken: "session-token" }),
    );

    await act(() => result.current.submit(submitInput));

    expect(client.submit).toHaveBeenCalledWith(
      "session-token",
      "123e4567-e89b-42d3-a456-426614174000",
      submitInput,
    );
    expect(result.current.state.command?.publicId).toBe("command-public-1");
    expect(result.current.state.idempotencyKey).toBeNull();
    expect(result.current.state.submittedInput).toBeNull();
    expect(window.location.search).toBe(
      "?employeeImportCommand=command-public-1",
    );
    expect(window.history.state).toBeNull();
    expect(window.location.href).not.toContain("RequestSecret1");
  });

  it("keeps only the idempotency key for a processing command recovery", async () => {
    const client = createClient({
      submit: vi.fn(() =>
        ok(
          command({
            completedAt: null,
            counts: { pending: 1, rejected: 0, succeeded: 0 },
            status: "processing",
          }),
        ),
      ),
    });
    const { result } = renderHook(() =>
      useEmployeeImportCommand({ client, sessionToken: "session-token" }),
    );

    await act(() => result.current.submit(submitInput));

    expect(result.current.state.status).toBe("processing");
    expect(result.current.state.submittedInput).toEqual(submitInput);
    expect(window.history.state).toEqual({
      employeeImportCommandIdempotencyKey:
        "123e4567-e89b-42d3-a456-426614174000",
    });
    expect(JSON.stringify(window.history.state)).not.toContain(
      "RequestSecret1",
    );
  });

  it("preserves router history state while adding and clearing the recovery key", async () => {
    const routerState = { __NA: true, tree: ["admin", "org-auth-redeem"] };
    window.history.replaceState(routerState, "", "/admin/org-auth-redeem");
    const client = createClient({
      submit: vi.fn(() =>
        ok(
          command({
            completedAt: null,
            counts: { pending: 1, rejected: 0, succeeded: 0 },
            status: "processing",
          }),
        ),
      ),
    });
    const { result } = renderHook(() =>
      useEmployeeImportCommand({ client, sessionToken: "session-token" }),
    );

    await act(() => result.current.submit(submitInput));

    expect(window.history.state).toEqual({
      ...routerState,
      employeeImportCommandIdempotencyKey:
        "123e4567-e89b-42d3-a456-426614174000",
    });

    act(() => result.current.clearPlaintext());

    expect(window.history.state).toEqual(routerState);
  });

  it("writes a new key before submit settles, clears a stale command query, and blocks duplicate submit", async () => {
    window.history.replaceState(
      null,
      "",
      "/admin/org-auth-redeem?employeeImportCommand=old-command-public-1",
    );
    const pendingSubmit =
      deferred<Awaited<ReturnType<EmployeeImportCommandClient["submit"]>>>();
    const submit = vi.fn(() => pendingSubmit.promise);
    const client = createClient({ submit });
    const first = renderHook(() =>
      useEmployeeImportCommand({ client, sessionToken: "session-token" }),
    );

    let firstRequest: Promise<EmployeeImportCommandDto | null> | undefined;
    act(() => {
      firstRequest = first.result.current.submit(submitInput);
    });
    await act(() => first.result.current.submit(submitInput));

    expect(submit).toHaveBeenCalledTimes(1);
    expect(window.location.search).toBe("");
    expect(window.history.state).toEqual({
      employeeImportCommandIdempotencyKey:
        "123e4567-e89b-42d3-a456-426614174000",
    });
    pendingSubmit.reject(new Error("unknown result"));
    await act(() => firstRequest);
    first.unmount();

    const resumedSubmit = vi.fn(() => ok(command()));
    const resumedClient = createClient({ submit: resumedSubmit });
    const resumed = renderHook(() =>
      useEmployeeImportCommand({
        client: resumedClient,
        sessionToken: "session-token",
      }),
    );
    await act(() => resumed.result.current.submit(submitInput));
    expect(resumedSubmit).toHaveBeenCalledWith(
      "session-token",
      "123e4567-e89b-42d3-a456-426614174000",
      submitInput,
    );
  });

  it("preserves the recovery key when close cancels an unresolved first submit", async () => {
    const pendingSubmit =
      deferred<Awaited<ReturnType<EmployeeImportCommandClient["submit"]>>>();
    const firstSubmit = vi.fn(() => pendingSubmit.promise);
    const firstClient = createClient({ submit: firstSubmit });
    const first = renderHook(() =>
      useEmployeeImportCommand({
        client: firstClient,
        sessionToken: "session-token",
      }),
    );

    let firstRequest: Promise<EmployeeImportCommandDto | null> | undefined;
    act(() => {
      firstRequest = first.result.current.submit(submitInput);
    });
    act(() => first.result.current.clearPlaintext());

    expect(first.result.current.state.submittedInput).toBeNull();
    expect(first.result.current.state.idempotencyKey).toBe(
      "123e4567-e89b-42d3-a456-426614174000",
    );
    expect(window.history.state).toEqual({
      employeeImportCommandIdempotencyKey:
        "123e4567-e89b-42d3-a456-426614174000",
    });
    expect(first.result.current.state.message).toContain("重新上传相同文件");

    pendingSubmit.resolve(await ok(command()));
    await act(() => firstRequest);
    expect(first.result.current.state.command).toBeNull();
    first.unmount();

    const resumedSubmit = vi.fn(() => ok(command()));
    const resumedClient = createClient({ submit: resumedSubmit });
    const resumed = renderHook(() =>
      useEmployeeImportCommand({
        client: resumedClient,
        sessionToken: "session-token",
      }),
    );
    await act(() => resumed.result.current.submit(submitInput));

    expect(resumedSubmit).toHaveBeenCalledWith(
      "session-token",
      "123e4567-e89b-42d3-a456-426614174000",
      submitInput,
    );
  });

  it("recovers a command from the URL through GET without restoring plaintext", async () => {
    window.history.replaceState(
      null,
      "",
      "/admin/org-auth-redeem?employeeImportCommand=command-public-1",
    );
    const client = createClient();
    const { result } = renderHook(() =>
      useEmployeeImportCommand({ client, sessionToken: "session-token" }),
    );

    await waitFor(() => expect(result.current.state.command).not.toBeNull());

    expect(client.get).toHaveBeenCalledWith(
      "session-token",
      "command-public-1",
    );
    expect(result.current.state.manifest).toBeNull();
    expect(result.current.state.submittedInput).toBeNull();
  });

  it("ignores a late GET from an older command after a new submit wins", async () => {
    window.history.replaceState(
      null,
      "",
      "/admin/org-auth-redeem?employeeImportCommand=old-command-public-1",
    );
    const pendingGet =
      deferred<Awaited<ReturnType<EmployeeImportCommandClient["get"]>>>();
    const client = createClient({
      get: vi.fn(() => pendingGet.promise),
      submit: vi.fn(() => ok(command({ publicId: "new-command-public-1" }))),
    });
    const { result } = renderHook(() =>
      useEmployeeImportCommand({ client, sessionToken: "session-token" }),
    );
    await waitFor(() => expect(result.current.state.status).toBe("submitting"));

    await act(() => result.current.submit(submitInput));
    pendingGet.resolve(await ok(command({ publicId: "old-command-public-1" })));
    await act(async () => pendingGet.promise);

    expect(result.current.state.command?.publicId).toBe("new-command-public-1");
    expect(window.location.search).toBe(
      "?employeeImportCommand=new-command-public-1",
    );
  });

  it("reuses the history key after re-upload and surfaces a changed payload as conflict", async () => {
    window.history.replaceState(
      {
        employeeImportCommandIdempotencyKey:
          "123e4567-e89b-42d3-a456-426614174000",
      },
      "",
      "/admin/org-auth-redeem?employeeImportCommand=command-public-1",
    );
    const submit = vi.fn(() =>
      Promise.resolve({
        httpStatus: 409,
        response: {
          code: 409601,
          data: null,
          message: "Idempotency request mismatch.",
        },
      }),
    );
    const client = createClient({
      get: vi.fn(() =>
        ok(
          command({
            completedAt: null,
            counts: { pending: 1, rejected: 0, succeeded: 0 },
            status: "processing",
          }),
        ),
      ),
      submit,
    });
    const { result } = renderHook(() =>
      useEmployeeImportCommand({ client, sessionToken: "session-token" }),
    );
    await waitFor(() => expect(result.current.state.command).not.toBeNull());
    const changedInput = {
      ...submitInput,
      rows: [{ ...submitInput.rows[0]!, name: "Changed Employee" }],
    };

    await act(() => result.current.submit(changedInput));

    expect(submit).toHaveBeenCalledWith(
      "session-token",
      "123e4567-e89b-42d3-a456-426614174000",
      changedInput,
    );
    expect(result.current.state.status).toBe("conflict");
  });

  it.each([
    [0, "可重新发起换新。"],
    [1, "上一版响应丢失，需显式换新分发。"],
  ] as const)(
    "queries after issue response loss and explains revision %i",
    async (credentialRevision, message) => {
      const client = createClient({
        get: vi.fn(() => ok(command({ credentialRevision }))),
        issueCredentials: vi.fn(() => Promise.reject(new Error("lost"))),
      });
      const { result } = renderHook(() =>
        useEmployeeImportCommand({ client, sessionToken: "session-token" }),
      );
      await act(() => result.current.submit(submitInput));

      await act(() => result.current.issueCredentials());

      expect(client.issueCredentials).toHaveBeenCalledTimes(1);
      expect(client.get).toHaveBeenCalledWith(
        "session-token",
        "command-public-1",
      );
      expect(result.current.state.manifest).toBeNull();
      expect(result.current.state.message).toBe(message);
    },
  );

  it("blocks another issue when the response-loss follow-up GET also fails", async () => {
    const client = createClient({
      get: vi.fn(() => Promise.reject(new Error("still unavailable"))),
      issueCredentials: vi.fn(() => Promise.reject(new Error("lost"))),
    });
    const { result } = renderHook(() =>
      useEmployeeImportCommand({ client, sessionToken: "session-token" }),
    );
    await act(() => result.current.submit(submitInput));

    await act(() => result.current.issueCredentials());

    expect(result.current.state.status).toBe("conflict");
    expect(result.current.canIssue).toBe(false);
    expect(result.current.state.message).toContain("已阻止继续换新");
  });

  it("does not offer issue when the completed command needs no distribution", async () => {
    const client = createClient({
      submit: vi.fn(() =>
        ok(command({ credentialDistributionStatus: "not_required" })),
      ),
    });
    const { result } = renderHook(() =>
      useEmployeeImportCommand({ client, sessionToken: "session-token" }),
    );

    await act(() => result.current.submit(submitInput));

    expect(result.current.canIssue).toBe(false);
  });

  it.each([
    "Active session blocks credential issue.",
    "Credential baseline changed.",
  ])("turns issue 409 into a disabled conflict: %s", async (message) => {
    const client = createClient({
      issueCredentials: vi.fn(() =>
        Promise.resolve({
          httpStatus: 409,
          response: { code: 409605, data: null, message },
        }),
      ),
    });
    const { result } = renderHook(() =>
      useEmployeeImportCommand({ client, sessionToken: "session-token" }),
    );
    await act(() => result.current.submit(submitInput));

    await act(() => result.current.issueCredentials());

    expect(result.current.state.status).toBe("conflict");
    expect(result.current.canIssue).toBe(false);
    expect(result.current.state.manifest).toBeNull();
  });

  it("ignores a late manifest after close and a newer command wins", async () => {
    const firstIssue =
      deferred<
        Awaited<ReturnType<EmployeeImportCommandClient["issueCredentials"]>>
      >();
    const client = createClient({
      issueCredentials: vi
        .fn()
        .mockReturnValueOnce(firstIssue.promise)
        .mockReturnValueOnce(ok(manifest(1))),
      submit: vi
        .fn()
        .mockReturnValueOnce(ok(command({ publicId: "command-public-a" })))
        .mockReturnValueOnce(ok(command({ publicId: "command-public-b" }))),
    });
    const { result } = renderHook(() =>
      useEmployeeImportCommand({ client, sessionToken: "session-token" }),
    );
    await act(() => result.current.submit(submitInput));

    let firstRequest: Promise<void> | undefined;
    act(() => {
      firstRequest = result.current.issueCredentials();
    });
    act(() => result.current.clearPlaintext());
    await act(() => result.current.submit(submitInput));
    await act(() => result.current.issueCredentials());
    expect(result.current.state.command?.publicId).toBe("command-public-b");
    expect(result.current.state.manifest?.credentialRevision).toBe(1);

    firstIssue.resolve(await ok(manifest(5)));
    await act(() => firstRequest);
    expect(result.current.state.command?.publicId).toBe("command-public-b");
    expect(result.current.state.manifest?.credentialRevision).toBe(1);
  });

  it("resets the highest revision when a new command replaces an older command", async () => {
    const client = createClient({
      issueCredentials: vi
        .fn()
        .mockReturnValueOnce(ok(manifest(2)))
        .mockReturnValueOnce(ok(manifest(1))),
      submit: vi
        .fn()
        .mockReturnValueOnce(ok(command({ publicId: "command-public-a" })))
        .mockReturnValueOnce(ok(command({ publicId: "command-public-b" }))),
    });
    const { result } = renderHook(() =>
      useEmployeeImportCommand({ client, sessionToken: "session-token" }),
    );
    await act(() => result.current.submit(submitInput));
    await act(() => result.current.issueCredentials());
    expect(result.current.state.highestCredentialRevision).toBe(2);

    act(() => result.current.clearPlaintext());
    await act(() => result.current.submit(submitInput));
    await act(() => result.current.issueCredentials());

    expect(result.current.state.command?.publicId).toBe("command-public-b");
    expect(result.current.state.manifest?.credentialRevision).toBe(1);
  });

  it("uses the accepted manifest revision for the next explicit reissue", async () => {
    const issueCredentials = vi
      .fn()
      .mockReturnValueOnce(ok(manifest(1)))
      .mockReturnValueOnce(ok(manifest(2)));
    const client = createClient({ issueCredentials });
    const { result } = renderHook(() =>
      useEmployeeImportCommand({ client, sessionToken: "session-token" }),
    );
    await act(() => result.current.submit(submitInput));

    await act(() => result.current.issueCredentials());
    await act(() => result.current.issueCredentials());

    expect(issueCredentials).toHaveBeenNthCalledWith(
      1,
      "session-token",
      "command-public-1",
      { expectedCredentialRevision: 0 },
    );
    expect(issueCredentials).toHaveBeenNthCalledWith(
      2,
      "session-token",
      "command-public-1",
      { expectedCredentialRevision: 1 },
    );
    expect(result.current.state.manifest?.credentialRevision).toBe(2);
  });

  it("clears a manifest when authoritative command revision advances", async () => {
    const client = createClient({
      get: vi.fn(() =>
        ok(
          command({
            credentialRevision: 2,
            currentIssuePublicId: "issue-public-2",
          }),
        ),
      ),
    });
    const { result } = renderHook(() =>
      useEmployeeImportCommand({ client, sessionToken: "session-token" }),
    );
    await act(() => result.current.submit(submitInput));
    await act(() => result.current.issueCredentials());
    expect(result.current.state.manifest?.credentialRevision).toBe(1);

    await act(() => result.current.refresh());

    expect(result.current.state.command?.credentialRevision).toBe(2);
    expect(result.current.state.manifest).toBeNull();
    expect(result.current.canConfirm).toBe(false);
  });

  it("clears plaintext on close and before confirming distribution", async () => {
    const client = createClient();
    const { result, unmount } = renderHook(() =>
      useEmployeeImportCommand({ client, sessionToken: "session-token" }),
    );
    await act(() => result.current.submit(submitInput));
    await act(() => result.current.issueCredentials());
    expect(result.current.state.manifest).not.toBeNull();

    await act(() => result.current.confirmDistribution());
    expect(result.current.state.manifest).toBeNull();
    expect(result.current.state.status).toBe("confirmed");

    act(() => result.current.clearPlaintext());
    expect(result.current.state.idempotencyKey).toBeNull();
    expect(result.current.state.submittedInput).toBeNull();
    unmount();
  });

  it("disables actions during confirm and ignores its late result after close", async () => {
    const pendingConfirm =
      deferred<
        Awaited<ReturnType<EmployeeImportCommandClient["confirmDistribution"]>>
      >();
    const client = createClient({
      confirmDistribution: vi.fn(() => pendingConfirm.promise),
    });
    const { result } = renderHook(() =>
      useEmployeeImportCommand({ client, sessionToken: "session-token" }),
    );
    await act(() => result.current.submit(submitInput));
    await act(() => result.current.issueCredentials());

    let confirmRequest: Promise<void> | undefined;
    act(() => {
      confirmRequest = result.current.confirmDistribution();
    });
    expect(result.current.state.manifest).toBeNull();
    expect(result.current.state.status).toBe("submitting");
    expect(result.current.canIssue).toBe(false);
    expect(result.current.canConfirm).toBe(false);

    act(() => result.current.clearPlaintext());
    expect(result.current.state.status).toBe("conflict");
    pendingConfirm.resolve(
      await ok(command({ credentialDistributionStatus: "confirmed" })),
    );
    await act(() => confirmRequest);
    expect(result.current.state.status).toBe("conflict");
  });

  it("clears the previous actor state and recovery location when the session changes", async () => {
    const get = vi.fn(() => ok(command()));
    const client = createClient({ get });
    const { result, rerender } = renderHook(
      ({ sessionToken }) => useEmployeeImportCommand({ client, sessionToken }),
      { initialProps: { sessionToken: "session-token-1" } },
    );
    await act(() => result.current.submit(submitInput));
    await act(() => result.current.issueCredentials());
    expect(result.current.state.manifest).not.toBeNull();

    rerender({ sessionToken: "session-token-2" });

    expect(result.current.state.command).toBeNull();
    expect(result.current.state.highestCredentialRevision).toBe(0);
    expect(result.current.state.manifest).toBeNull();
    expect(result.current.state.submittedInput).toBeNull();
    expect(window.history.state).toBeNull();
    expect(window.location.search).toBe("");
    expect(get).not.toHaveBeenCalled();
  });

  it.each([401, 403, 404])(
    "clears a stale recovery location after a %s query response",
    async (httpStatus) => {
      window.history.replaceState(
        {
          __NA: true,
          employeeImportCommandIdempotencyKey:
            "123e4567-e89b-42d3-a456-426614174000",
        },
        "",
        "/admin/org-auth-redeem?employeeImportCommand=stale-command-public-1",
      );
      const client = createClient({
        get: vi.fn(() =>
          Promise.resolve({
            httpStatus,
            response: {
              code: httpStatus * 1000 + 1,
              data: null,
              message: "Command is unavailable.",
            },
          }),
        ),
      });

      const { result } = renderHook(() =>
        useEmployeeImportCommand({ client, sessionToken: "session-token" }),
      );

      await waitFor(() => expect(result.current.state.status).toBe("error"));

      expect(result.current.state.command).toBeNull();
      expect(result.current.state.idempotencyKey).toBeNull();
      expect(window.location.search).toBe("");
      expect(window.history.state).toEqual({ __NA: true });
    },
  );

  it("clears the recovery key and submitted plaintext after authorization failure", async () => {
    const client = createClient({
      submit: vi.fn(() =>
        Promise.resolve({
          httpStatus: 401,
          response: { code: 401001, data: null, message: "Unauthorized." },
        }),
      ),
    });
    const { result } = renderHook(() =>
      useEmployeeImportCommand({ client, sessionToken: "session-token" }),
    );

    await act(() => result.current.submit(submitInput));

    expect(result.current.state.idempotencyKey).toBeNull();
    expect(result.current.state.submittedInput).toBeNull();
    expect(result.current.state.manifest).toBeNull();
    expect(window.history.state).toBeNull();
  });
});
