import { eq } from "drizzle-orm";
import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";

import * as authSchema from "@/db/schema/auth";

type SessionLogoutDatabase = PostgresJsDatabase<typeof authSchema>;

const { authSession } = authSchema;

export type SessionLogoutRepository = {
  deleteSessionByCredential(sessionCredential: string): Promise<void>;
};

export function createPostgresSessionLogoutRepository(
  getDatabase: () => SessionLogoutDatabase,
): SessionLogoutRepository {
  return {
    async deleteSessionByCredential(sessionCredential) {
      await getDatabase()
        .delete(authSession)
        .where(eq(authSession.token, sessionCredential));
    },
  };
}
