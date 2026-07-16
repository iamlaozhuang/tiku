import { describe, expect, it } from "vitest";

import { createUserRegistrationRouteHandlers } from "./user-registration-route";
import type { UserRegistrationService } from "../services/user-registration-service";

const CREDENTIAL_FIELD_NAME = "password";
const SESSION_TOKEN_FIELD = "token";

describe("user registration route handlers", () => {
  it("passes registration request JSON to the user service and returns the standard response", async () => {
    const receivedIdempotencyKeys: unknown[] = [];
    const userRegistrationService = {
      async registerPersonalUser(input, idempotencyKey) {
        receivedIdempotencyKeys.push(idempotencyKey);
        const registrationInput = input as { phone: string; name: string };

        return {
          code: 0,
          message: "ok",
          data: {
            user: {
              publicId: "user_public_123",
              phone: registrationInput.phone,
              name: registrationInput.name,
              userType: "personal",
              status: "active",
              lockedUntilAt: null,
              employeePublicId: null,
              organizationPublicId: null,
            },
            nextAction: "redeem_code" as const,
            session: {
              expiresAt: "2026-05-28T12:00:00.000Z",
            },
            [SESSION_TOKEN_FIELD]: "opaque-registration-session-value",
          },
        };
      },
    } satisfies UserRegistrationService;
    const { POST } = createUserRegistrationRouteHandlers(
      userRegistrationService,
    );

    const response = await POST(
      new Request("http://localhost/api/v1/users", {
        method: "POST",
        headers: {
          "Idempotency-Key": "123e4567-e89b-42d3-a456-426614174000",
        },
        body: JSON.stringify({
          phone: "13800000000",
          [CREDENTIAL_FIELD_NAME]: "abc12345",
          name: "张三",
        }),
      }),
    );

    expect(response.headers.get("set-cookie")).toContain("tiku_session=");
    expect(response.headers.get("set-cookie")).toContain("HttpOnly");
    expect(receivedIdempotencyKeys).toEqual([
      "123e4567-e89b-42d3-a456-426614174000",
    ]);
    await expect(response.json()).resolves.toEqual({
      code: 0,
      message: "ok",
      data: {
        user: {
          publicId: "user_public_123",
          phone: "13800000000",
          name: "张三",
          userType: "personal",
          status: "active",
          lockedUntilAt: null,
          employeePublicId: null,
          organizationPublicId: null,
        },
        nextAction: "redeem_code",
        session: {
          expiresAt: "2026-05-28T12:00:00.000Z",
        },
      },
    });
  });
});
