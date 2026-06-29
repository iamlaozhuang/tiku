import { afterEach, describe, expect, it, vi } from "vitest";

import {
  createLazyRuntimeDatabaseGetter,
  getSharedRuntimePostgresClient,
  resetSharedRuntimePostgresClientsForTest,
  type RuntimeDatabase,
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

    const firstClient = getSharedRuntimePostgresClient("runtime-key-local", {
      createClient,
    });
    const secondClient = getSharedRuntimePostgresClient("runtime-key-local", {
      createClient,
    });
    const thirdClient = getSharedRuntimePostgresClient("runtime-key-other", {
      createClient,
    });

    expect(secondClient).toBe(firstClient);
    expect(thirdClient).not.toBe(firstClient);
    expect(createClient).toHaveBeenCalledTimes(2);
  });

  it("uses an injected database without resolving runtime database url", () => {
    const database = { marker: "injected" } as unknown as RuntimeDatabase;
    const createDatabase = vi.fn(() => database);
    const getDatabase = createLazyRuntimeDatabaseGetter(
      { createDatabase },
      "DATABASE_URL is required for test runtime.",
    );

    expect(getDatabase()).toBe(database);
    expect(getDatabase()).toBe(database);
    expect(createDatabase).toHaveBeenCalledTimes(1);
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
