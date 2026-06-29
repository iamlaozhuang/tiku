import { createHash, randomInt, randomUUID } from "node:crypto";

import {
  and,
  asc,
  count,
  desc,
  eq,
  gte,
  ilike,
  inArray,
  lt,
  or,
  type SQL,
} from "drizzle-orm";
import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";

import * as databaseSchema from "@/db/schema";
import type { ApiPagination } from "../contracts/api-response";
import type {
  AdminAuthOperationListQuery,
  RedeemCodeDetailDto,
  RedeemCodeGenerationDto,
  RedeemCodeGenerationItemDto,
  RedeemCodeListDto,
} from "../contracts/admin-user-org-auth-ops-contract";
import type { Profession, RedeemCodeStatus } from "../models/auth";
import { createRuntimeDatabaseForSchema } from "./runtime-database";

type AdminRedeemCodeRuntimeDatabase = PostgresJsDatabase<typeof databaseSchema>;

export type AdminRedeemCodeRuntimeRepositoryOptions = {
  createDatabase?: () => AdminRedeemCodeRuntimeDatabase;
  createGenerationGroupId?: () => string;
  createRedeemCodePlainText?: () => string;
  createRedeemCodePublicId?: () => string;
  now?: () => Date;
};

export type AdminRedeemCodePage<TData> = TData & {
  pagination: ApiPagination;
};

export type AdminRedeemCodeRuntimeRepositories = {
  createRedeemCodeBatch(
    input: CreateRedeemCodeBatchInput,
  ): Promise<RedeemCodeGenerationDto>;
  listRedeemCodes(
    query: AdminAuthOperationListQuery,
  ): Promise<AdminRedeemCodePage<RedeemCodeListDto>>;
  findRedeemCodeDetailByPublicId?(
    publicId: string,
  ): Promise<RedeemCodeDetailDto | null>;
  auditLogRepository?: {
    appendAuditLog(input: AppendRedeemCodeAuditLogInput): Promise<void>;
  };
};

export type CreateRedeemCodeBatchInput = {
  count: number;
  profession: Profession;
  level: number;
  durationDay: number;
  redeemDeadlineAt: Date;
  actorPublicId: string;
};

export type AppendRedeemCodeAuditLogInput = {
  actorPublicId: string;
  actorRole: string;
  actionType: string;
  targetResourceType: string;
  targetPublicId: string | null;
  resultStatus: "success" | "failed";
  metadataSummary: string | null;
  requestIp: string | null;
};

export const REDEEM_CODE_BATCH_CREATE_LIMIT = 100;

const { auditLog, redeemCode, user } = databaseSchema;
const LOCAL_REDEEM_CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const LOCAL_REDEEM_CODE_LENGTH = 8;
const LOCAL_REDEEM_CODE_MAX_CREATE_ATTEMPTS = 5;

export class RedeemCodeGenerationConflictError extends Error {
  constructor() {
    super("Redeem code generation conflicted with another operation.");
    this.name = "RedeemCodeGenerationConflictError";
  }
}

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
  const clock = options.now ?? (() => new Date());
  const createGenerationGroupId =
    options.createGenerationGroupId ??
    (() => `redeem-code-batch-${randomUUID()}`);
  const createRedeemCodePlainText =
    options.createRedeemCodePlainText ?? createLocalRedeemCodePlainText;
  const createRedeemCodePublicId =
    options.createRedeemCodePublicId ?? (() => `redeem-code-${randomUUID()}`);

  return {
    async createRedeemCodeBatch(input) {
      const database = getDatabase();
      const generationGroupId = createGenerationGroupId();

      return database.transaction(async (transactionDatabase) => {
        const redeemCodes: RedeemCodeGenerationItemDto[] = [];

        for (let codeIndex = 0; codeIndex < input.count; codeIndex += 1) {
          redeemCodes.push(
            await createRedeemCodeWithRetry(
              transactionDatabase as AdminRedeemCodeRuntimeDatabase,
              {
                ...input,
                generationGroupId,
              },
              {
                createRedeemCodePlainText,
                createRedeemCodePublicId,
              },
            ),
          );
        }

        return {
          generation: {
            generationGroupId,
            count: redeemCodes.length,
            profession: input.profession,
            level: input.level,
            durationDay: input.durationDay,
            redeemDeadlineAt: input.redeemDeadlineAt.toISOString(),
          },
          redeemCodes,
        };
      });
    },
    async listRedeemCodes(query) {
      const database = getDatabase();
      const now = clock();
      const conditions = createRedeemCodeConditions(query, now);
      const rows = await database
        .select({
          id: redeemCode.id,
          public_id: redeemCode.public_id,
          code_display: redeemCode.code_display,
          profession: redeemCode.profession,
          level: redeemCode.level,
          status: redeemCode.status,
          used_by_user_id: redeemCode.used_by_user_id,
          redeem_deadline_at: redeemCode.redeem_deadline_at,
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
          status: getEffectiveRedeemCodeStatus(row, now),
          redeemedUserPublicId:
            row.used_by_user_id === null
              ? null
              : (redeemedUserPublicIds.get(row.used_by_user_id) ?? null),
          redeemDeadlineAt: row.redeem_deadline_at.toISOString(),
          createdAt: row.created_at.toISOString(),
        })),
        pagination: createPagination(query, totalRow?.value ?? 0),
      };
    },
    async findRedeemCodeDetailByPublicId(publicId) {
      const database = getDatabase();
      const now = clock();
      const [row] = await database
        .select({
          public_id: redeemCode.public_id,
          code_display: redeemCode.code_display,
          profession: redeemCode.profession,
          level: redeemCode.level,
          status: redeemCode.status,
          used_by_user_id: redeemCode.used_by_user_id,
          used_at: redeemCode.used_at,
          duration_day: redeemCode.duration_day,
          redeem_deadline_at: redeemCode.redeem_deadline_at,
          generation_group_id: redeemCode.generation_group_id,
          created_at: redeemCode.created_at,
          updated_at: redeemCode.updated_at,
        })
        .from(redeemCode)
        .where(eq(redeemCode.public_id, publicId))
        .limit(1);

      if (row === undefined) {
        return null;
      }

      const redeemedUserPublicIds = await listRedeemedUserPublicIds(
        database,
        row.used_by_user_id === null ? [] : [row.used_by_user_id],
      );

      return {
        publicId: row.public_id,
        codeDisplay: maskRedeemCodeDisplay(row.code_display),
        canViewPlainText: false,
        profession: row.profession,
        level: row.level,
        status: getEffectiveRedeemCodeStatus(row, now),
        redeemedUserPublicId:
          row.used_by_user_id === null
            ? null
            : (redeemedUserPublicIds.get(row.used_by_user_id) ?? null),
        redeemedAt: row.used_at?.toISOString() ?? null,
        durationDay: row.duration_day,
        redeemDeadlineAt: row.redeem_deadline_at.toISOString(),
        generationGroupId: row.generation_group_id,
        createdAt: row.created_at.toISOString(),
        updatedAt: row.updated_at.toISOString(),
        redactionStatus: "redacted",
        redactionReason: "plaintext_redeem_code_and_hash_hidden",
      };
    },
    auditLogRepository: {
      async appendAuditLog(input) {
        await getDatabase()
          .insert(auditLog)
          .values({
            public_id: `audit-log-${randomUUID()}`,
            actor_public_id: input.actorPublicId,
            actor_role: input.actorRole,
            action_type: input.actionType,
            target_resource_type: input.targetResourceType,
            target_public_id: input.targetPublicId,
            result_status: input.resultStatus,
            metadata_summary: input.metadataSummary,
            request_ip: input.requestIp,
          });
      },
    },
  };
}

async function createRedeemCodeWithRetry(
  database: AdminRedeemCodeRuntimeDatabase,
  input: CreateRedeemCodeBatchInput & { generationGroupId: string },
  helpers: {
    createRedeemCodePlainText: () => string;
    createRedeemCodePublicId: () => string;
  },
): Promise<RedeemCodeGenerationItemDto> {
  for (
    let attemptIndex = 0;
    attemptIndex < LOCAL_REDEEM_CODE_MAX_CREATE_ATTEMPTS;
    attemptIndex += 1
  ) {
    const codePlainText = helpers.createRedeemCodePlainText();

    try {
      const [createdRedeemCode] = await database
        .insert(redeemCode)
        .values({
          public_id: helpers.createRedeemCodePublicId(),
          code_hash: createRedeemCodeHash(codePlainText),
          code_display: codePlainText,
          profession: input.profession,
          level: input.level,
          duration_day: input.durationDay,
          redeem_deadline_at: input.redeemDeadlineAt,
          status: "unused",
          generation_group_id: input.generationGroupId,
        })
        .returning({
          public_id: redeemCode.public_id,
          code_display: redeemCode.code_display,
          profession: redeemCode.profession,
          level: redeemCode.level,
          status: redeemCode.status,
          redeem_deadline_at: redeemCode.redeem_deadline_at,
          created_at: redeemCode.created_at,
        });

      if (createdRedeemCode === undefined) {
        throw new Error("Redeem code creation returned no row.");
      }

      return {
        publicId: createdRedeemCode.public_id,
        codePlainText,
        codeDisplay: createdRedeemCode.code_display,
        profession: createdRedeemCode.profession,
        level: createdRedeemCode.level,
        status: createdRedeemCode.status,
        redeemDeadlineAt: createdRedeemCode.redeem_deadline_at.toISOString(),
        createdAt: createdRedeemCode.created_at.toISOString(),
      };
    } catch (error) {
      if (!isUniqueConstraintError(error)) {
        throw error;
      }

      if (attemptIndex === LOCAL_REDEEM_CODE_MAX_CREATE_ATTEMPTS - 1) {
        throw new RedeemCodeGenerationConflictError();
      }
    }
  }

  throw new RedeemCodeGenerationConflictError();
}

function isUniqueConstraintError(error: unknown): boolean {
  if (typeof error !== "object" || error === null) {
    return false;
  }

  const errorRecord = error as { code?: unknown; constraint?: unknown };

  return (
    errorRecord.code === "23505" &&
    (errorRecord.constraint === undefined ||
      errorRecord.constraint === "udx_redeem_code_code_hash" ||
      errorRecord.constraint === "udx_redeem_code_public_id")
  );
}

function createRedeemCodeConditions(
  query: AdminAuthOperationListQuery,
  now: Date,
): SQL[] {
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

  if (query.status === "expired") {
    conditions.push(
      or(
        eq(redeemCode.status, "expired"),
        and(
          eq(redeemCode.status, "unused"),
          lt(redeemCode.redeem_deadline_at, now),
        ),
      )!,
    );
  } else if (query.status === "unused") {
    conditions.push(
      and(
        eq(redeemCode.status, "unused"),
        gte(redeemCode.redeem_deadline_at, now),
      )!,
    );
  } else if (query.status === "used") {
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

  if (query.sortBy === "expiresAt") {
    return query.sortOrder === "asc"
      ? asc(redeemCode.redeem_deadline_at)
      : desc(redeemCode.redeem_deadline_at);
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

function getEffectiveRedeemCodeStatus(
  row: { status: RedeemCodeStatus; redeem_deadline_at: Date },
  now: Date,
): RedeemCodeStatus {
  return row.status === "unused" && row.redeem_deadline_at < now
    ? "expired"
    : row.status;
}

function createLocalRedeemCodePlainText(): string {
  let codePlainText = "";

  for (let index = 0; index < LOCAL_REDEEM_CODE_LENGTH; index += 1) {
    codePlainText +=
      LOCAL_REDEEM_CODE_ALPHABET[randomInt(LOCAL_REDEEM_CODE_ALPHABET.length)];
  }

  return codePlainText;
}

function createRedeemCodeHash(codePlainText: string): string {
  return createHash("sha256").update(codePlainText).digest("hex");
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
  return createRuntimeDatabaseForSchema(
    databaseSchema,
    "DATABASE_URL is required for admin redeem code runtime.",
  );
}
