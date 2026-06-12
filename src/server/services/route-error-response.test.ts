import { describe, expect, it } from "vitest";

import {
  UNEXPECTED_RUNTIME_ERROR_CODE,
  UNEXPECTED_RUNTIME_ERROR_MESSAGE,
  createRouteHandlerWithErrorEnvelope,
  createRouteHandlersWithErrorEnvelope,
} from "./route-error-response";

describe("route error response", () => {
  it("wraps a single route handler with the standard error envelope", async () => {
    const handler = createRouteHandlerWithErrorEnvelope(async () => {
      throw new Error("database unavailable");
    });

    const response = await handler();

    expect(response.status).toBe(500);
    await expect(response.json()).resolves.toEqual({
      code: UNEXPECTED_RUNTIME_ERROR_CODE,
      message: UNEXPECTED_RUNTIME_ERROR_MESSAGE,
      data: null,
    });
  });

  it("wraps nested route handler trees without changing explicit success responses", async () => {
    const handlers = createRouteHandlersWithErrorEnvelope({
      collection: {
        async GET() {
          return Response.json({
            code: 0,
            message: "ok",
            data: { questions: [] },
          });
        },
        async POST() {
          throw new Error("unexpected service failure");
        },
      },
    });

    await expect(
      handlers.collection.GET().then((response) => response.json()),
    ).resolves.toEqual({
      code: 0,
      message: "ok",
      data: { questions: [] },
    });

    const response = await handlers.collection.POST();

    expect(response.status).toBe(500);
    await expect(response.json()).resolves.toEqual({
      code: UNEXPECTED_RUNTIME_ERROR_CODE,
      message: UNEXPECTED_RUNTIME_ERROR_MESSAGE,
      data: null,
    });
  });
});
