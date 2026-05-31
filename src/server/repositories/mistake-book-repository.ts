import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

import { and, asc, count, desc, eq, gt, lte, sql, type SQL } from "drizzle-orm";
import { drizzle, type PostgresJsDatabase } from "drizzle-orm/postgres-js";

import * as databaseSchema from "@/db/schema";
import type { AuthorizationType } from "../contracts/effective-authorization-contract";
import type { SortOrder } from "../contracts/api-response";
import type { MistakeBookAnswerSnapshotDto } from "../contracts/mistake-book-contract";
import type { Profession, QuestionType, Subject } from "../models/paper";
import type {
  MistakeBookSource,
  MistakeBookStatus,
} from "../models/student-experience";
import { getSharedRuntimePostgresClient } from "./runtime-database";

export type MistakeBookAuthorizationScopeRow = {
  profession: Profession;
  level: number;
  authorization_types: AuthorizationType[];
  expires_at: Date;
};

export type MistakeBookRow = {
  id: number;
  public_id: string;
  question_public_id: string;
  paper_question_public_id: string;
  profession: Profession;
  level: number;
  subject: Subject;
  question_snapshot: Record<string, unknown>;
  latest_answer_snapshot: MistakeBookAnswerSnapshotDto;
  mistake_book_source: MistakeBookSource;
  mistake_book_status: MistakeBookStatus;
  wrong_count: number;
  is_favorite: boolean;
  is_removed: boolean;
  mastered_at: Date | null;
  latest_wrong_at: Date | null;
  created_at: Date;
  updated_at: Date;
};

export type MistakeBookListQuery = {
  userPublicId: string;
  page: number;
  pageSize: number;
  questionType: QuestionType | null;
  source: MistakeBookSource | null;
  status: MistakeBookStatus | null;
  isFavorite: boolean | null;
  sortBy: "latestWrongAt";
  sortOrder: SortOrder;
};

export type UpdateMistakeBookStateInput = {
  userPublicId: string;
  publicId: string;
  mistakeBookStatus: MistakeBookStatus;
  isFavorite: boolean;
  isRemoved: boolean;
  masteredAt: Date | null;
  updatedAt: Date;
};

export type MistakeBookRepository = {
  listEffectiveAuthorizationScopes(query: {
    userPublicId: string;
  }): Promise<MistakeBookAuthorizationScopeRow[]>;
  listMistakeBooks(query: MistakeBookListQuery): Promise<{
    rows: MistakeBookRow[];
    total: number;
  }>;
  findMistakeBookByPublicId(query: {
    userPublicId: string;
    publicId: string;
  }): Promise<MistakeBookRow | null>;
  updateMistakeBookState(
    input: UpdateMistakeBookStateInput,
  ): Promise<MistakeBookRow | null>;
};

type MistakeBookRuntimeDatabase = PostgresJsDatabase<typeof databaseSchema>;

export type MistakeBookRuntimeRepositoryOptions = {
  createDatabase?: () => MistakeBookRuntimeDatabase;
  now?: () => Date;
};

const {
  employee,
  mistakeBook,
  organization,
  orgAuth,
  orgAuthOrganization,
  personalAuth,
  user,
} = databaseSchema;

export function createMistakeBookQuestionTypeCondition(
  questionType: QuestionType | null,
): SQL | null {
  return questionType === null
    ? null
    : sql`${mistakeBook.question_snapshot}->>'questionType' = ${questionType}`;
}

function createLazyDatabaseGetter(
  createDatabase: () => MistakeBookRuntimeDatabase,
): () => MistakeBookRuntimeDatabase {
  let cachedDatabase: MistakeBookRuntimeDatabase | undefined;

  return () => {
    cachedDatabase ??= createDatabase();

    return cachedDatabase;
  };
}

function getNow(options: MistakeBookRuntimeRepositoryOptions): Date {
  return options.now?.() ?? new Date();
}

export function createPostgresMistakeBookRepository(
  options: MistakeBookRuntimeRepositoryOptions = {},
): MistakeBookRepository {
  const getDatabase = createLazyDatabaseGetter(
    options.createDatabase ?? createLocalRuntimeDatabase,
  );

  return {
    async listEffectiveAuthorizationScopes(query) {
      return listEffectiveAuthorizationScopes(
        getDatabase(),
        query.userPublicId,
        getNow(options),
      );
    },
    async listMistakeBooks(query) {
      const database = getDatabase();
      const userId = await findActiveUserIdByPublicId(
        database,
        query.userPublicId,
      );

      if (userId === null) {
        return {
          rows: [],
          total: 0,
        };
      }

      const conditions: SQL[] = [eq(mistakeBook.user_id, userId)];
      const questionTypeCondition = createMistakeBookQuestionTypeCondition(
        query.questionType,
      );

      if (questionTypeCondition !== null) {
        conditions.push(questionTypeCondition);
      }

      if (query.source !== null) {
        conditions.push(eq(mistakeBook.mistake_book_source, query.source));
      }

      if (query.status !== null) {
        conditions.push(eq(mistakeBook.mistake_book_status, query.status));
      }

      if (query.isFavorite !== null) {
        conditions.push(eq(mistakeBook.is_favorite, query.isFavorite));
      }

      const orderBy =
        query.sortOrder === "asc"
          ? asc(mistakeBook.latest_wrong_at)
          : desc(mistakeBook.latest_wrong_at);
      const rows = await database
        .select()
        .from(mistakeBook)
        .where(and(...conditions))
        .orderBy(orderBy)
        .limit(query.pageSize)
        .offset((query.page - 1) * query.pageSize);
      const [totalRow] = await database
        .select({ value: count() })
        .from(mistakeBook)
        .where(and(...conditions));

      return {
        rows: rows.map(mapMistakeBookRow),
        total: totalRow?.value ?? 0,
      };
    },
    async findMistakeBookByPublicId(query) {
      const database = getDatabase();
      const userId = await findActiveUserIdByPublicId(
        database,
        query.userPublicId,
      );

      if (userId === null) {
        return null;
      }

      const [row] = await database
        .select()
        .from(mistakeBook)
        .where(
          and(
            eq(mistakeBook.user_id, userId),
            eq(mistakeBook.public_id, query.publicId),
          ),
        )
        .limit(1);

      return row === undefined ? null : mapMistakeBookRow(row);
    },
    async updateMistakeBookState(input) {
      const database = getDatabase();
      const userId = await findActiveUserIdByPublicId(
        database,
        input.userPublicId,
      );

      if (userId === null) {
        return null;
      }

      const [row] = await database
        .update(mistakeBook)
        .set({
          is_favorite: input.isFavorite,
          is_removed: input.isRemoved,
          mastered_at: input.masteredAt,
          mistake_book_status: input.mistakeBookStatus,
          updated_at: input.updatedAt,
        })
        .where(
          and(
            eq(mistakeBook.user_id, userId),
            eq(mistakeBook.public_id, input.publicId),
          ),
        )
        .returning();

      return row === undefined ? null : mapMistakeBookRow(row);
    },
  };
}

async function listEffectiveAuthorizationScopes(
  database: MistakeBookRuntimeDatabase,
  userPublicId: string,
  now: Date,
): Promise<MistakeBookAuthorizationScopeRow[]> {
  const personalAuthRows = await database
    .select({
      profession: personalAuth.profession,
      level: personalAuth.level,
      expires_at: personalAuth.expires_at,
    })
    .from(personalAuth)
    .innerJoin(user, eq(user.id, personalAuth.user_id))
    .where(
      and(
        eq(user.public_id, userPublicId),
        eq(user.status, "active"),
        eq(personalAuth.status, "active"),
        lte(personalAuth.starts_at, now),
        gt(personalAuth.expires_at, now),
      ),
    )
    .orderBy(asc(personalAuth.expires_at));
  const orgAuthRows = await database
    .select({
      profession: orgAuth.profession,
      level: orgAuth.level,
      expires_at: orgAuth.expires_at,
    })
    .from(orgAuth)
    .innerJoin(
      orgAuthOrganization,
      eq(orgAuthOrganization.org_auth_id, orgAuth.id),
    )
    .innerJoin(
      organization,
      eq(organization.id, orgAuthOrganization.organization_id),
    )
    .innerJoin(employee, eq(employee.organization_id, organization.id))
    .innerJoin(user, eq(user.id, employee.user_id))
    .where(
      and(
        eq(user.public_id, userPublicId),
        eq(user.user_type, "employee"),
        eq(user.status, "active"),
        eq(organization.status, "active"),
        eq(orgAuth.status, "active"),
        lte(orgAuth.starts_at, now),
        gt(orgAuth.expires_at, now),
      ),
    )
    .orderBy(asc(orgAuth.expires_at));

  return [
    ...personalAuthRows.map((row) => ({
      ...row,
      authorization_types: ["personal_auth"] satisfies AuthorizationType[],
    })),
    ...orgAuthRows.map((row) => ({
      ...row,
      authorization_types: ["org_auth"] satisfies AuthorizationType[],
    })),
  ];
}

async function findActiveUserIdByPublicId(
  database: MistakeBookRuntimeDatabase,
  publicId: string,
): Promise<number | null> {
  const [row] = await database
    .select({ id: user.id })
    .from(user)
    .where(and(eq(user.public_id, publicId), eq(user.status, "active")))
    .limit(1);

  return row?.id ?? null;
}

function mapMistakeBookRow(
  row: typeof mistakeBook.$inferSelect,
): MistakeBookRow {
  return {
    id: row.id,
    public_id: row.public_id,
    question_public_id: row.question_public_id,
    paper_question_public_id: row.paper_question_public_id,
    profession: row.profession,
    level: row.level,
    subject: row.subject,
    question_snapshot: asRecord(row.question_snapshot),
    latest_answer_snapshot: asAnswerSnapshot(row.latest_answer_snapshot),
    mistake_book_source: row.mistake_book_source,
    mistake_book_status: row.mistake_book_status,
    wrong_count: row.wrong_count,
    is_favorite: row.is_favorite,
    is_removed: row.is_removed,
    mastered_at: row.mastered_at,
    latest_wrong_at: row.latest_wrong_at,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

function asAnswerSnapshot(value: unknown): MistakeBookAnswerSnapshotDto {
  const record = asRecord(value);

  return {
    selectedLabels: getStringArray(record.selectedLabels),
    textAnswer: getNullableString(record.textAnswer),
    savedFromClientAt: getNullableString(record.savedFromClientAt),
  };
}

function asRecord(value: unknown): Record<string, unknown> {
  return typeof value === "object" && value !== null
    ? (value as Record<string, unknown>)
    : {};
}

function getNullableString(value: unknown): string | null {
  return typeof value === "string" ? value : null;
}

function getStringArray(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : [];
}

function createLocalRuntimeDatabase(): MistakeBookRuntimeDatabase {
  loadLocalEnv();

  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error("DATABASE_URL is required for mistake book runtime.");
  }

  return drizzle(getSharedRuntimePostgresClient(databaseUrl), {
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
