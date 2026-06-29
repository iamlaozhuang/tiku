import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";

import * as authSchema from "@/db/schema/auth";
import type { ApiResponse } from "../contracts/api-response";
import { createPostgresSessionLogoutRepository } from "../repositories/session-logout-repository";
import { createRuntimeDatabaseForSchema } from "../repositories/runtime-database";
import { createSessionLogoutService } from "../services/session-logout-service";
import {
  createExpiredSessionCookieHeader,
  getRequestAuthorization,
} from "./session-cookie";

type LocalSessionLogoutDatabase = PostgresJsDatabase<typeof authSchema>;

function createJsonResponse<TData>(
  response: ApiResponse<TData>,
  init?: ResponseInit,
): Response {
  return Response.json(response, init);
}

function createLocalSessionLogoutDatabase(): LocalSessionLogoutDatabase {
  return createRuntimeDatabaseForSchema(
    authSchema,
    "DATABASE_URL is required for session logout.",
  );
}

export function createLocalSessionLogoutRouteHandler() {
  const getDatabase = () => createLocalSessionLogoutDatabase();
  const sessionLogoutService = createSessionLogoutService(
    createPostgresSessionLogoutRepository(getDatabase),
  );

  return async function DELETE(request: Request): Promise<Response> {
    let logoutResponse: ApiResponse<null> = {
      code: 0,
      message: "ok",
      data: null,
    };

    try {
      logoutResponse = await sessionLogoutService.logout({
        authorization: getRequestAuthorization(request),
      });
    } catch (error) {
      if (
        !(error instanceof Error) ||
        error.message !== "DATABASE_URL is required for session logout."
      ) {
        throw error;
      }
    }

    return createJsonResponse(logoutResponse, {
      headers: {
        "Set-Cookie": createExpiredSessionCookieHeader(request),
      },
    });
  };
}
