import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

import {
  and,
  asc,
  count,
  desc,
  eq,
  ilike,
  inArray,
  or,
  type SQL,
} from "drizzle-orm";
import { drizzle, type PostgresJsDatabase } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import * as databaseSchema from "@/db/schema";
import type { ApiPagination } from "../contracts/api-response";
import type {
  AdminAuthOperationListQuery,
  RedeemCodeListDto,
} from "../contracts/admin-user-org-auth-ops-contract";

type AdminRedeemCodeRuntimeDatabase = PostgresJsDatabase<typeof databaseSchema>;

export type AdminRedeemCodeRuntimeRepositoryOptions = {
  createDatabase?: () => AdminRedeemCodeRuntimeDatabase;
};

export type AdminRedeemCodePage<TData> = TData & {
  pagination: ApiPagination;
};

export type AdminRedeemCodeRuntimeRepositories = {
  listRedeemCodes(
    query: AdminAuthOperationListQuery,
  ): Promise<AdminRedeemCodePage<RedeemCodeListDto>>;
};

const { redeemCode, user } = databaseSchema;

function createLazyDatabaseGetter(
  createDatabase: () => AdminRedeemCodeRuntimeDatabase,
): () => AdminRedeemCodeRuntimeDatabase {
  let cachedDatabase: AdminRedeemCodeRuntimeDatabase | undefined;

  return () => {
    cachedDatabase ??= createDatabase();

    return cachedDatabase;
  };
}

function createPagination(
  query: Pick<
    AdminAuthOperationListQuery,
    "page" | "pageSize" | "sortBy" | "sortOrder"
  >,
  total: number,
): ApiPagination {
  return {
    page: query.page,
    pageSize: query.pageSize,
    sortBy: query.sortBy,
    sortOrder: query.sortOrder,
    total,
  };
}

export function createPostgresAdminRedeemCodeRuntimeRepositories(
  options: AdminRedeemCodeRuntimeRepositoryOptions = {},
): AdminRedeemCodeRuntimeRepositories {
  const getDatabase = createLazyDatabaseGetter(
    options.createDatabase ?? createLocalRuntimeDatabase,
  );

  return {
    async listRedeemCodes(query) {
      const database = getDatabase();
      const conditions = createRedeemCodeConditions(query);
      const rows = await database
        .select({
          id: redeemCode.id,
          public_id: redeemCode.public_id,
          code_display: redeemCode.code_display,
          profession: redeemCode.profession,
          level: redeemCode.level,
          status: redeemCode.status,
          used_by_user_id: redeemCode.used_by_user_id,
          created_at: redeemCode.created_at,
          updated_at: redeemCode.updated_at,
        })
        .from(redeemCode)
        .where(and(...conditions))
        .orderBy(createRedeemCodeOrderBy(query))
        .limit(query.pageSize)
        .offset((query.page - 1) * query.pageSize);
      const [totalRow] = await database
        .select({ value: count() })
        .from(redeemCode)
        .where(and(...conditions));
      const redeemedUserPublicIds = await listRedeemedUserPublicIds(
        database,
        rows
          .map((row) => row.used_by_user_id)
          .filter((id): id is number => id !== null),
      );

      return {
        redeemCodes: rows.map((row) => ({
          publicId: row.public_id,
          codeDisplay: maskRedeemCodeDisplay(row.code_display),
          canViewPlainText: false,
          profession: row.profession,
          level: row.level,
          status: row.status,
          redeemedUserPublicId:
            row.used_by_user_id === null
              ? null
              : (redeemedUserPublicIds.get(row.used_by_user_id) ?? null),
          createdAt: row.created_at.toISOString(),
        })),
        pagination: createPagination(query, totalRow?.value ?? 0),
      };
    },
  };
}

function createRedeemCodeConditions(query: AdminAuthOperationListQuery): SQL[] {
  const conditions: SQL[] = [];

  if (query.keyword !== null) {
    conditions.push(
      or(
        ilike(redeemCode.public_id, `%${query.keyword}%`),
        ilike(redeemCode.code_display, `%${query.keyword}%`),
        ilike(redeemCode.generation_group_id, `%${query.keyword}%`),
      )!,
    );
  }

  if (
    query.status === "unused" ||
    query.status === "used" ||
    query.status === "expired"
  ) {
    conditions.push(eq(redeemCode.status, query.status));
  }

  return conditions;
}

function createRedeemCodeOrderBy(query: AdminAuthOperationListQuery): SQL {
  if (query.sortBy === "createdAt") {
    return query.sortOrder === "asc"
      ? asc(redeemCode.created_at)
      : desc(redeemCode.created_at);
  }

  return query.sortOrder === "asc"
    ? asc(redeemCode.updated_at)
    : desc(redeemCode.updated_at);
}

async function listRedeemedUserPublicIds(
  database: AdminRedeemCodeRuntimeDatabase,
  userIds: number[],
): Promise<Map<number, string>> {
  if (userIds.length === 0) {
    return new Map();
  }

  const rows = await database
    .select({
      id: user.id,
      public_id: user.public_id,
    })
    .from(user)
    .where(inArray(user.id, userIds));

  return new Map(rows.map((row) => [row.id, row.public_id]));
}

function maskRedeemCodeDisplay(codeDisplay: string): string {
  const normalizedCodeDisplay = codeDisplay.trim();

  if (normalizedCodeDisplay.length === 0) {
    return "****";
  }

  const codeDisplaySegments = normalizedCodeDisplay.split("-");

  if (codeDisplaySegments.length >= 3) {
    return `${codeDisplaySegments.slice(0, 2).join("-")}-****`;
  }

  return `${normalizedCodeDisplay.slice(0, 4)}****`;
}

function createLocalRuntimeDatabase(): AdminRedeemCodeRuntimeDatabase {
  loadLocalEnv();

  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error("DATABASE_URL is required for admin redeem code runtime.");
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
