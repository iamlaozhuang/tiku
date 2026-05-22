import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

import { drizzle, type PostgresJsDatabase } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import * as databaseSchema from "@/db/schema";

export type RuntimeDatabase = PostgresJsDatabase<typeof databaseSchema>;

export type RuntimeDatabaseOptions = {
  createDatabase?: () => RuntimeDatabase;
};

export function createLazyRuntimeDatabaseGetter(
  options: RuntimeDatabaseOptions,
  missingDatabaseUrlMessage: string,
): () => RuntimeDatabase {
  let cachedDatabase: RuntimeDatabase | undefined;

  return () => {
    cachedDatabase ??=
      options.createDatabase?.() ??
      createLocalRuntimeDatabase(missingDatabaseUrlMessage);

    return cachedDatabase;
  };
}

function createLocalRuntimeDatabase(
  missingDatabaseUrlMessage: string,
): RuntimeDatabase {
  loadLocalEnv();

  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error(missingDatabaseUrlMessage);
  }

  return drizzle(postgres(databaseUrl, { max: 5 }), {
    schema: databaseSchema,
  });
}

function loadLocalEnv(): void {
  const localEnvPath = resolve(process.cwd(), ".env.local");

  if (!existsSync(localEnvPath)) {
    return;
  }

  const localEnvContent = readFileSync(localEnvPath, "utf8");

  for (const line of localEnvContent.split(/\r?\n/u)) {
    const trimmedLine = line.trim();

    if (trimmedLine.length === 0 || trimmedLine.startsWith("#")) {
      continue;
    }

    const separatorIndex = trimmedLine.indexOf("=");

    if (separatorIndex <= 0) {
      continue;
    }

    const key = trimmedLine.slice(0, separatorIndex).trim();
    const value = trimmedLine
      .slice(separatorIndex + 1)
      .trim()
      .replace(/^["']|["']$/gu, "");

    if (process.env[key] === undefined) {
      process.env[key] = value;
    }
  }
}
