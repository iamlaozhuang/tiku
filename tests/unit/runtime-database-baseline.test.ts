import { afterEach, describe, expect, it, vi } from "vitest";

import {
  getSharedRuntimePostgresClient,
  resetSharedRuntimePostgresClientsForTest,
  type RuntimePostgresClient,
} from "@/server/repositories/runtime-database";
import { createRouteHandlerWithErrorEnvelope } from "@/server/services/route-error-response";

describe("runtime database baseline", () => {
  afterEach(() => {
    resetSharedRuntimePostgresClientsForTest();
  });

  it("reuses one postgres client per database url across runtime modules", () => {
    const createClient = vi.fn(
      (databaseUrl: string) =>
        ({
          databaseUrl,
          sequence: createClient.mock.calls.length,
        }) as unknown as RuntimePostgresClient,
    );

    const firstClient = getSharedRuntimePostgresClient("postgres://local", {
      createClient,
    });
    const secondClient = getSharedRuntimePostgresClient("postgres://local", {
      createClient,
    });
    const thirdClient = getSharedRuntimePostgresClient("postgres://other", {
      createClient,
    });

    expect(secondClient).toBe(firstClient);
    expect(thirdClient).not.toBe(firstClient);
    expect(createClient).toHaveBeenCalledTimes(2);
  });

  it("returns a standard json envelope when a route handler throws", async () => {
    const handler = createRouteHandlerWithErrorEnvelope(
      async (_request: Request) => {
        void _request;
        throw new Error("database unavailable");
      },
    );

    const response = await handler(
      new Request("http://localhost/api/v1/papers"),
    );

    await expect(response.json()).resolves.toEqual({
      code: 500001,
      data: null,
      message: "Unexpected runtime error.",
    });
    expect(response.status).toBe(500);
  });
});
