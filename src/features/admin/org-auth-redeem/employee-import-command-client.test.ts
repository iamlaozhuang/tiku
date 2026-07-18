import { describe, expect, it, vi } from "vitest";

import { createEmployeeImportCommandClient } from "./employee-import-command-client";

const preflightInput = {
  commandKind: "batch_import" as const,
  content:
    'phone,name,initialPassword\n13900000001,"Employee\nOne",RequestSecret1',
  organizationPublicId: "organization-public-1",
  sourceFormat: "csv" as const,
};
const input = {
  ...preflightInput,
  expectedPreviewRevision: "a".repeat(64),
};

function response(
  status = 200,
  data: unknown = { publicId: "command-public-1" },
) {
  return Response.json({ code: 0, message: "ok", data }, { status });
}

describe("employee import command client", () => {
  it("previews raw source unchanged without an idempotency key or retry", async () => {
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValue(response(503, null));
    const client = createEmployeeImportCommandClient(fetchMock);

    await client.preview("session-token", preflightInput);

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [path, init] = fetchMock.mock.calls[0] ?? [];
    expect(path).toBe("/api/v1/employee-import-commands/preview");
    expect(init).toMatchObject({
      body: JSON.stringify(preflightInput),
      cache: "no-store",
      credentials: "same-origin",
      method: "POST",
    });
    expect(new Headers(init?.headers).has("idempotency-key")).toBe(false);
  });

  it("submits with no-store, same-origin and an idempotency key", async () => {
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(response());
    const client = createEmployeeImportCommandClient(fetchMock);

    await client.submit("session-token", "idempotency-key-1", input);

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [path, init] = fetchMock.mock.calls[0] ?? [];
    const headers = new Headers(init?.headers);
    expect(path).toBe("/api/v1/employee-import-commands");
    expect(init).toMatchObject({
      body: JSON.stringify(input),
      cache: "no-store",
      credentials: "same-origin",
      method: "POST",
    });
    expect(headers.get("authorization")).toBe("Bearer session-token");
    expect(headers.get("idempotency-key")).toBe("idempotency-key-1");
  });

  it.each(["transport", "503"])(
    "retries submit once with the identical body and key after %s failure",
    async (failureKind) => {
      const fetchMock = vi.fn<typeof fetch>();
      if (failureKind === "transport") {
        fetchMock.mockRejectedValueOnce(new Error("connection lost"));
      } else {
        fetchMock.mockResolvedValueOnce(response(503, null));
      }
      fetchMock.mockResolvedValueOnce(response());
      const client = createEmployeeImportCommandClient(fetchMock);

      await client.submit("session-token", "idempotency-key-1", input);

      expect(fetchMock).toHaveBeenCalledTimes(2);
      expect(fetchMock.mock.calls[1]?.[1]?.body).toBe(
        fetchMock.mock.calls[0]?.[1]?.body,
      );
      expect(
        new Headers(fetchMock.mock.calls[1]?.[1]?.headers).get(
          "idempotency-key",
        ),
      ).toBe("idempotency-key-1");
    },
  );

  it("does not retry issue or confirm and never adds an idempotency header", async () => {
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(response(503, null))
      .mockResolvedValueOnce(response(503, null));
    const client = createEmployeeImportCommandClient(fetchMock);

    await client.issueCredentials("session-token", "command-public-1", {
      expectedCredentialRevision: 0,
    });
    await client.confirmDistribution("session-token", "command-public-1", {
      expectedCredentialRevision: 1,
      issuePublicId: "issue-public-1",
    });

    expect(fetchMock).toHaveBeenCalledTimes(2);
    for (const [, init] of fetchMock.mock.calls) {
      expect(init).toMatchObject({
        cache: "no-store",
        credentials: "same-origin",
        method: "POST",
      });
      expect(new Headers(init?.headers).has("idempotency-key")).toBe(false);
    }
  });

  it("gets command state with no-store and same-origin", async () => {
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(response());
    const client = createEmployeeImportCommandClient(fetchMock);

    await client.get("session-token", "command-public-1");

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/v1/employee-import-commands/command-public-1",
      expect.objectContaining({
        cache: "no-store",
        credentials: "same-origin",
      }),
    );
  });
});
