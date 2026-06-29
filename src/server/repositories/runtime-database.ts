import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

import { drizzle, type PostgresJsDatabase } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import * as databaseSchema from "@/db/schema";

export type RuntimeDatabase = PostgresJsDatabase<typeof databaseSchema>;
export type RuntimeDatabaseSchema = Record<string, unknown>;
export type RuntimePostgresClient = ReturnType<typeof postgres>;
export type RuntimePostgresClientFactory = (
  databaseUrl: string,
) => RuntimePostgresClient;

export type RuntimeDatabaseOptions = {
  createDatabase?: () => RuntimeDatabase;
};

type SharedRuntimePostgresState = {
  clients: Map<string, RuntimePostgresClient>;
};

const sharedRuntimePostgresStateKey = Symbol.for("tiku.runtimePostgresState");

export function createRuntimeDatabaseForSchema<
  TSchema extends RuntimeDatabaseSchema,
>(
  schema: TSchema,
  missingDatabaseUrlMessage: string,
): PostgresJsDatabase<TSchema> {
  const databaseUrl = resolveRuntimeDatabaseUrl(missingDatabaseUrlMessage);

  return drizzle(getSharedRuntimePostgresClient(databaseUrl), {
    schema,
  });
}

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

export function getSharedRuntimePostgresClient(
  databaseUrl: string,
  options: {
    cacheKey?: string;
    createClient?: RuntimePostgresClientFactory;
  } = {},
): RuntimePostgresClient {
  const state = getSharedRuntimePostgresState();
  const cacheKey = options.cacheKey ?? databaseUrl;
  let client = state.clients.get(cacheKey);

  if (client === undefined) {
    client = (options.createClient ?? createRuntimePostgresClient)(databaseUrl);
    state.clients.set(cacheKey, client);
  }

  return client;
}

export function resetSharedRuntimePostgresClientsForTest(): void {
  getSharedRuntimePostgresState().clients.clear();
}

function resolveRuntimeDatabaseUrl(missingDatabaseUrlMessage: string): string {
  loadLocalEnv();

  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error(missingDatabaseUrlMessage);
  }

  return databaseUrl;
}

function createLocalRuntimeDatabase(
  missingDatabaseUrlMessage: string,
): RuntimeDatabase {
  return createRuntimeDatabaseForSchema(
    databaseSchema,
    missingDatabaseUrlMessage,
  );
}

function createRuntimePostgresClient(
  databaseUrl: string,
): RuntimePostgresClient {
  return postgres(databaseUrl, { max: 5 });
}

function getSharedRuntimePostgresState(): SharedRuntimePostgresState {
  const runtimeGlobal = globalThis as typeof globalThis & {
    [sharedRuntimePostgresStateKey]?: SharedRuntimePostgresState;
  };

  runtimeGlobal[sharedRuntimePostgresStateKey] ??= {
    clients: new Map(),
  };

  return runtimeGlobal[sharedRuntimePostgresStateKey];
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
