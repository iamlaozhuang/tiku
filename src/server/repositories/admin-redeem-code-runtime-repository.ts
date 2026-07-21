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
  isNotNull,
  isNull,
  lt,
  or,
  sql,
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
import type {
  Profession,
  RedeemCodeStatus,
  RedeemCodeType,
} from "../models/auth";
import { createRuntimeDatabaseForSchema } from "./runtime-database";

type AdminRedeemCodeRuntimeDatabase = PostgresJsDatabase<typeof databaseSchema>;

type PersistedRedeemCodeGenerationItem = RedeemCodeGenerationItemDto & {
  durationDay: number;
};

export type AdminRedeemCodeRuntimeRepositoryOptions = {
  createDatabase?: () => AdminRedeemCodeRuntimeDatabase;
  createGenerationGroupId?: (input: {
    actorPublicId: string;
    requestPublicId: string;
  }) => string;
  createRedeemCodePlainText?: () => string;
  createRedeemCodePublicId?: () => string;
  now?: () => Date;
};

export type AdminRedeemCodePage<TData> = TData & {
  pagination: ApiPagination;
};

export type AdminRedeemCodeRuntimeRepositories = {
  createRedeemCodeBatchAtomically(
    input: CreateRedeemCodeBatchInput,
  ): Promise<RedeemCodeGenerationDto>;
  listRedeemCodes(
    query: AdminAuthOperationListQuery,
  ): Promise<AdminRedeemCodePage<RedeemCodeListDto>>;
  findRedeemCodeDetailByPublicId?(
    publicId: string,
  ): Promise<RedeemCodeDetailDto | null>;
  findRedeemCodePlainTextByPublicIds?(
    publicIds: string[],
  ): Promise<RedeemCodePlainTextAccessRow[]>;
  auditLogRepository?: {
    appendAuditLog(input: AppendRedeemCodeAuditLogInput): Promise<void>;
  };
};

export type RedeemCodePlainTextAccessRow = {
  publicId: string;
  codePlainText: string;
  generationGroupId: string;
};

export type CreateRedeemCodeBatchInput = {
  count: number;
  redeemCodeType: RedeemCodeType;
  profession: Profession;
  level: number;
  durationDay: number;
  redeemDeadlineAt: Date | null;
  actorPublicId: string;
  actorRole: string;
  requestIp: string | null;
  requestPublicId: string;
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
const REDEEM_CODE_GENERATION_LOCK_NAMESPACE = 200114;

export class RedeemCodeGenerationConflictError extends Error {
  constructor() {
    super("Redeem code generation conflicted with another operation.");
    this.name = "RedeemCodeGenerationConflictError";
  }
}

export class RedeemCodeGenerationIdempotencyConflictError extends Error {
  constructor() {
    super("Redeem code generation request conflicts with its prior payload.");
    this.name = "RedeemCodeGenerationIdempotencyConflictError";
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

function serializeRedeemDeadlineAt(value: Date | null): string | null {
  return value?.toISOString() ?? null;
}

export function createPostgresAdminRedeemCodeRuntimeRepositories(
  options: AdminRedeemCodeRuntimeRepositoryOptions = {},
): AdminRedeemCodeRuntimeRepositories {
  const getDatabase = createLazyDatabaseGetter(
    options.createDatabase ?? createLocalRuntimeDatabase,
  );
  const clock = options.now ?? (() => new Date());
  const createGenerationGroupId =
    options.createGenerationGroupId ?? createDefaultGenerationGroupId;
  const createRedeemCodePlainText =
    options.createRedeemCodePlainText ?? createLocalRedeemCodePlainText;
  const createRedeemCodePublicId =
    options.createRedeemCodePublicId ?? (() => `redeem-code-${randomUUID()}`);

  return {
    async createRedeemCodeBatchAtomically(input) {
      const database = getDatabase();
      const generationGroupId = createGenerationGroupId({
        actorPublicId: input.actorPublicId,
        requestPublicId: input.requestPublicId,
      });

      return database.transaction(async (transactionDatabase) => {
        const generationDatabase =
          transactionDatabase as AdminRedeemCodeRuntimeDatabase;

        await lockRedeemCodeGenerationRequest(
          generationDatabase,
          generationGroupId,
        );
        const existingRedeemCodes = await listRedeemCodeGenerationItems(
          generationDatabase,
          generationGroupId,
        );

        if (existingRedeemCodes.length > 0) {
          assertRedeemCodeGenerationMatches(input, existingRedeemCodes);
          await appendRedeemCodeAuditLog(generationDatabase, {
            actorPublicId: input.actorPublicId,
            actorRole: input.actorRole,
            actionType: "redeem_code.plaintext_view",
            targetResourceType: "redeem_code",
            targetPublicId: generationGroupId,
            resultStatus: "success",
            metadataSummary: `redacted redeem_code plaintext view metadata; source=generation_replay count=${existingRedeemCodes.length}`,
            requestIp: input.requestIp,
          });

          return createRedeemCodeGenerationResult(
            input,
            generationGroupId,
            existingRedeemCodes,
          );
        }

        const createdRedeemCodes = await createRedeemCodeItems(
          generationDatabase,
          { ...input, generationGroupId },
          { createRedeemCodePlainText, createRedeemCodePublicId },
        );
        const deadlineSummary =
          serializeRedeemDeadlineAt(input.redeemDeadlineAt) ?? "long_term";

        await appendRedeemCodeAuditLog(generationDatabase, {
          actorPublicId: input.actorPublicId,
          actorRole: input.actorRole,
          actionType: "redeem_code.batch_create",
          targetResourceType: "redeem_code",
          targetPublicId: generationGroupId,
          resultStatus: "success",
          metadataSummary: `redacted redeem_code batch metadata; count=${createdRedeemCodes.length} type=${input.redeemCodeType} profession=${input.profession} level=${input.level} deadline=${deadlineSummary}`,
          requestIp: input.requestIp,
        });
        await appendRedeemCodeAuditLog(generationDatabase, {
          actorPublicId: input.actorPublicId,
          actorRole: input.actorRole,
          actionType: "redeem_code.plaintext_view",
          targetResourceType: "redeem_code",
          targetPublicId: generationGroupId,
          resultStatus: "success",
          metadataSummary: `redacted redeem_code plaintext view metadata; source=generation count=${createdRedeemCodes.length}`,
          requestIp: input.requestIp,
        });

        return createRedeemCodeGenerationResult(
          input,
          generationGroupId,
          createdRedeemCodes,
        );
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
          redeem_code_type: redeemCode.redeem_code_type,
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
        .orderBy(...createRedeemCodeOrderBy(query))
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
          codePlainText: null,
          redeemCodeType: row.redeem_code_type,
          canViewPlainText: true,
          profession: row.profession,
          level: row.level,
          status: getEffectiveRedeemCodeStatus(row, now),
          redeemedUserPublicId:
            row.used_by_user_id === null
              ? null
              : (redeemedUserPublicIds.get(row.used_by_user_id) ?? null),
          redeemDeadlineAt: serializeRedeemDeadlineAt(row.redeem_deadline_at),
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
          redeem_code_type: redeemCode.redeem_code_type,
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
        codePlainText: null,
        redeemCodeType: row.redeem_code_type,
        canViewPlainText: true,
        profession: row.profession,
        level: row.level,
        status: getEffectiveRedeemCodeStatus(row, now),
        redeemedUserPublicId:
          row.used_by_user_id === null
            ? null
            : (redeemedUserPublicIds.get(row.used_by_user_id) ?? null),
        redeemedAt: row.used_at?.toISOString() ?? null,
        durationDay: row.duration_day,
        redeemDeadlineAt: serializeRedeemDeadlineAt(row.redeem_deadline_at),
        generationGroupId: row.generation_group_id,
        createdAt: row.created_at.toISOString(),
        updatedAt: row.updated_at.toISOString(),
        redactionStatus: "redacted",
        redactionReason: "plaintext_redeem_code_and_hash_hidden",
      };
    },
    async findRedeemCodePlainTextByPublicIds(publicIds) {
      if (publicIds.length === 0) {
        return [];
      }

      const rows = await getDatabase()
        .select({
          public_id: redeemCode.public_id,
          code_display: redeemCode.code_display,
          generation_group_id: redeemCode.generation_group_id,
        })
        .from(redeemCode)
        .where(inArray(redeemCode.public_id, publicIds));
      const rowsByPublicId = new Map(
        rows.map((row) => [row.public_id, row] as const),
      );

      return publicIds.flatMap((publicId) => {
        const row = rowsByPublicId.get(publicId);

        return row === undefined
          ? []
          : [
              {
                publicId: row.public_id,
                codePlainText: row.code_display,
                generationGroupId: row.generation_group_id,
              },
            ];
      });
    },
    auditLogRepository: {
      async appendAuditLog(input) {
        await appendRedeemCodeAuditLog(getDatabase(), input);
      },
    },
  };
}

function createDefaultGenerationGroupId(input: {
  actorPublicId: string;
  requestPublicId: string;
}): string {
  const requestScopeHash = createHash("sha256")
    .update(`${input.actorPublicId}\u0000${input.requestPublicId}`)
    .digest("hex");

  return `redeem-code-batch-${requestScopeHash}`;
}

async function lockRedeemCodeGenerationRequest(
  database: AdminRedeemCodeRuntimeDatabase,
  generationGroupId: string,
): Promise<void> {
  await database.execute(
    sql`select pg_advisory_xact_lock(${REDEEM_CODE_GENERATION_LOCK_NAMESPACE}, hashtext(${generationGroupId})) as redeem_code_generation_lock`,
  );
}

async function listRedeemCodeGenerationItems(
  database: AdminRedeemCodeRuntimeDatabase,
  generationGroupId: string,
): Promise<PersistedRedeemCodeGenerationItem[]> {
  const rows = await database
    .select({
      public_id: redeemCode.public_id,
      code_display: redeemCode.code_display,
      redeem_code_type: redeemCode.redeem_code_type,
      profession: redeemCode.profession,
      level: redeemCode.level,
      duration_day: redeemCode.duration_day,
      redeem_deadline_at: redeemCode.redeem_deadline_at,
      status: redeemCode.status,
      created_at: redeemCode.created_at,
    })
    .from(redeemCode)
    .where(eq(redeemCode.generation_group_id, generationGroupId))
    .orderBy(asc(redeemCode.id));

  return rows.map((row) => ({
    publicId: row.public_id,
    codePlainText: row.code_display,
    codeDisplay: row.code_display,
    redeemCodeType: row.redeem_code_type,
    profession: row.profession,
    level: row.level,
    durationDay: row.duration_day,
    status: row.status,
    redeemDeadlineAt: serializeRedeemDeadlineAt(row.redeem_deadline_at),
    createdAt: row.created_at.toISOString(),
  }));
}

function assertRedeemCodeGenerationMatches(
  input: CreateRedeemCodeBatchInput,
  redeemCodes: PersistedRedeemCodeGenerationItem[],
): void {
  const expectedDeadline = serializeRedeemDeadlineAt(input.redeemDeadlineAt);
  const hasMatchingPayload =
    redeemCodes.length === input.count &&
    redeemCodes.every(
      (redeemCodeItem) =>
        redeemCodeItem.redeemCodeType === input.redeemCodeType &&
        redeemCodeItem.profession === input.profession &&
        redeemCodeItem.level === input.level &&
        redeemCodeItem.durationDay === input.durationDay &&
        redeemCodeItem.redeemDeadlineAt === expectedDeadline,
    );

  if (!hasMatchingPayload) {
    throw new RedeemCodeGenerationIdempotencyConflictError();
  }
}

function createRedeemCodeGenerationResult(
  input: CreateRedeemCodeBatchInput,
  generationGroupId: string,
  redeemCodes: RedeemCodeGenerationItemDto[],
): RedeemCodeGenerationDto {
  return {
    generation: {
      generationGroupId,
      count: redeemCodes.length,
      redeemCodeType: input.redeemCodeType,
      profession: input.profession,
      level: input.level,
      durationDay: input.durationDay,
      redeemDeadlineAt: serializeRedeemDeadlineAt(input.redeemDeadlineAt),
    },
    redeemCodes: redeemCodes.map(toRedeemCodeGenerationItemDto),
  };
}

function toRedeemCodeGenerationItemDto(
  input: RedeemCodeGenerationItemDto,
): RedeemCodeGenerationItemDto {
  return {
    publicId: input.publicId,
    codePlainText: input.codePlainText,
    codeDisplay: input.codeDisplay,
    redeemCodeType: input.redeemCodeType,
    profession: input.profession,
    level: input.level,
    status: input.status,
    redeemDeadlineAt: input.redeemDeadlineAt,
    createdAt: input.createdAt,
  };
}

async function createRedeemCodeItems(
  database: AdminRedeemCodeRuntimeDatabase,
  input: CreateRedeemCodeBatchInput & { generationGroupId: string },
  helpers: {
    createRedeemCodePlainText: () => string;
    createRedeemCodePublicId: () => string;
  },
  createdRedeemCodes: RedeemCodeGenerationItemDto[] = [],
): Promise<RedeemCodeGenerationItemDto[]> {
  if (createdRedeemCodes.length >= input.count) {
    return createdRedeemCodes;
  }

  const createdRedeemCode = await createRedeemCodeWithRetry(
    database,
    input,
    helpers,
  );

  return createRedeemCodeItems(database, input, helpers, [
    ...createdRedeemCodes,
    createdRedeemCode,
  ]);
}

async function appendRedeemCodeAuditLog(
  database: AdminRedeemCodeRuntimeDatabase,
  input: AppendRedeemCodeAuditLogInput,
): Promise<void> {
  await database.insert(auditLog).values({
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
          redeem_code_type: input.redeemCodeType,
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
          redeem_code_type: redeemCode.redeem_code_type,
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
        redeemCodeType: createdRedeemCode.redeem_code_type,
        profession: createdRedeemCode.profession,
        level: createdRedeemCode.level,
        status: createdRedeemCode.status,
        redeemDeadlineAt: serializeRedeemDeadlineAt(
          createdRedeemCode.redeem_deadline_at,
        ),
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
          isNotNull(redeemCode.redeem_deadline_at),
          lt(redeemCode.redeem_deadline_at, now),
        ),
      )!,
    );
  } else if (query.status === "unused") {
    conditions.push(
      and(
        eq(redeemCode.status, "unused"),
        or(
          isNull(redeemCode.redeem_deadline_at),
          gte(redeemCode.redeem_deadline_at, now),
        ),
      )!,
    );
  } else if (query.status === "used") {
    conditions.push(eq(redeemCode.status, query.status));
  }

  return conditions;
}

function createRedeemCodeOrderBy(query: AdminAuthOperationListQuery): SQL[] {
  if (query.sortBy === "expiresAt") {
    return [
      asc(isNull(redeemCode.redeem_deadline_at)),
      query.sortOrder === "asc"
        ? asc(redeemCode.redeem_deadline_at)
        : desc(redeemCode.redeem_deadline_at),
    ];
  }

  const column =
    query.sortBy === "createdAt"
      ? redeemCode.created_at
      : redeemCode.updated_at;

  return [query.sortOrder === "asc" ? asc(column) : desc(column)];
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
  row: { status: RedeemCodeStatus; redeem_deadline_at: Date | null },
  now: Date,
): RedeemCodeStatus {
  return row.status === "unused" &&
    row.redeem_deadline_at !== null &&
    row.redeem_deadline_at < now
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
