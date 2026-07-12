import { describe, expect, it } from "vitest";

import { createAiGenerationAvailabilityRouteHandlers } from "@/server/services/ai-generation-availability-route";
import type { SessionService } from "@/server/services/session-service";

function createSessionService(
  isAuthenticated: boolean,
): Pick<SessionService, "getCurrentSession"> {
  return {
    async getCurrentSession() {
      if (!isAuthenticated) {
        return {
          code: 401001,
          message: "Unauthorized.",
          data: null,
        };
      }

      return {
        code: 0,
        message: "ok",
        data: {
          session: {
            expiresAt: "2026-07-12T12:00:00.000Z",
          },
          user: {
            publicId: "availability-user-public",
            phone: "13800000000",
            name: "Availability user",
            userType: "personal" as const,
            status: "active" as const,
            lockedUntilAt: null,
            employeePublicId: null,
            organizationPublicId: null,
            adminPublicId: null,
            adminRoles: [],
          },
        },
      };
    },
  };
}

describe("AI generation availability route", () => {
  it("returns only a sanitized closed availability when no controlled runtime exists", async () => {
    const handlers = createAiGenerationAvailabilityRouteHandlers({
      sessionService: createSessionService(true),
    });

    const response = await handlers.collection.GET(
      new Request("http://localhost/api/v1/ai-generation/availability", {
        headers: { authorization: "Bearer availability-session" },
      }),
    );
    const payload = await response.json();

    expect(payload).toEqual({
      code: 0,
      message: "ok",
      data: {
        generationAvailability: "closed",
      },
    });
    expect(Object.keys(payload.data)).toEqual(["generationAvailability"]);
    expect(JSON.stringify(payload)).not.toMatch(
      /provider|credential|secret|environment|payload|prompt|output/iu,
    );
  });

  it("maps an explicitly controlled runtime to the available enum without executing it", async () => {
    const handlers = createAiGenerationAvailabilityRouteHandlers({
      runtimeBridgeControl: {
        bridgeMode: "controlled_runner",
        explicitLocalSwitchPresent: true,
      },
      sessionService: createSessionService(true),
    });

    const response = await handlers.collection.GET(
      new Request("http://localhost/api/v1/ai-generation/availability", {
        headers: { authorization: "Bearer availability-session" },
      }),
    );

    await expect(response.json()).resolves.toEqual({
      code: 0,
      message: "ok",
      data: {
        generationAvailability: "available",
      },
    });
  });

  it("rejects unauthenticated availability reads", async () => {
    const handlers = createAiGenerationAvailabilityRouteHandlers({
      sessionService: createSessionService(false),
    });

    const response = await handlers.collection.GET(
      new Request("http://localhost/api/v1/ai-generation/availability"),
    );

    await expect(response.json()).resolves.toEqual({
      code: 401001,
      message: "Session is required.",
      data: null,
    });
  });
});
