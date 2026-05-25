import { randomUUID } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

import { sql, type SQL } from "drizzle-orm";
import { drizzle, type PostgresJsDatabase } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import * as databaseSchema from "@/db/schema";
import type { ApiPagination } from "../contracts/api-response";
import type {
  AdminAiAuditLogListQuery,
  AdminAiFunctionType,
  AuditLogSummaryDto,
  AiCallLogCostSummaryDto,
  AiCallLogListDto,
  AiCallLogSummaryDto,
  AiCallLogSummaryListDto,
  ModelConfigListDto,
  ModelConfigSummaryDto,
} from "../contracts/admin-ai-audit-log-ops-contract";
import type {
  AiCallStatus,
  ModelConfigSnapshot,
  RedactedJsonObject,
} from "../models/ai-rag";

type AdminAiAuditLogRuntimeDatabase = PostgresJsDatabase<typeof databaseSchema>;

export type AdminAiAuditLogRuntimeRepositoryOptions = {
  createDatabase?: () => AdminAiAuditLogRuntimeDatabase;
};

export type AdminAiAuditLogRuntimePage<TData> = TData & {
  pagination: ApiPagination;
};

export type AppendAiCallLogInput = {
  userPublicId: string | null;
  answerRecordPublicId: string | null;
  mockExamPublicId: string | null;
  questionPublicId: string | null;
  aiFuncType: AdminAiFunctionType;
  callStatus: AiCallStatus;
  modelConfigSnapshot: ModelConfigSnapshot;
  promptTemplateKey: string;
  promptTemplateVersion: number;
  requestRedactedSnapshot: RedactedJsonObject;
  responseRedactedSnapshot: RedactedJsonObject | null;
  errorRedactedSnapshot: RedactedJsonObject | null;
  citationRedactedSnapshot: RedactedJsonObject | null;
  promptTokenCount: number | null;
  completionTokenCount: number | null;
  totalTokenCount: number | null;
  latencyMs: number | null;
  startedAt: Date;
  completedAt: Date | null;
};

export type AppendModelConfigAuditLogInput = Omit<
  AuditLogSummaryDto,
  "publicId" | "createdAt"
>;

export type AdminAiAuditLogRuntimeRepositories = {
  listModelConfigs(
    query: AdminAiAuditLogListQuery,
  ): Promise<AdminAiAuditLogRuntimePage<ModelConfigListDto>>;
  appendAiCallLog(input: AppendAiCallLogInput): Promise<AiCallLogSummaryDto>;
  enableModelConfig?(publicId: string): Promise<boolean>;
  disableModelConfig?(publicId: string): Promise<boolean>;
  appendAuditLog?(input: AppendModelConfigAuditLogInput): Promise<void>;
  listAiCallLogs(
    query: AdminAiAuditLogListQuery,
  ): Promise<AdminAiAuditLogRuntimePage<AiCallLogListDto>>;
  summarizeAiCallLogs(
    query: AdminAiAuditLogListQuery,
  ): Promise<AdminAiAuditLogRuntimePage<AiCallLogSummaryListDto>>;
};

type ModelConfigDatabaseRow = {
  public_id: string;
  provider_public_id: string;
  provider_display_name: string;
  provider_key: string;
  api_key_last_four: string | null;
  model_name: string;
  display_name: string;
  ai_func_type: string;
  config_version: number;
  is_enabled: boolean;
  timeout_second: number;
  max_retry_count: number;
  fallback_model_config_public_id: string | null;
  updated_at: Date | string;
};

type AiCallLogDatabaseRow = {
  public_id: string;
  user_public_id: string | null;
  answer_record_public_id: string | null;
  mock_exam_public_id: string | null;
  question_public_id: string | null;
  ai_func_type: string;
  call_status: AiCallStatus;
  model_config_snapshot: ModelConfigSnapshot;
  request_redacted_snapshot: RedactedJsonObject;
  response_redacted_snapshot: RedactedJsonObject | null;
  error_redacted_snapshot: RedactedJsonObject | null;
  citation_redacted_snapshot: RedactedJsonObject | null;
  prompt_token_count: number | null;
  completion_token_count: number | null;
  total_token_count: number | null;
  latency_ms: number | null;
  started_at: Date | string;
  completed_at: Date | string | null;
};

type CountDatabaseRow = {
  value: number;
};

type DrizzleSqlExecutor = {
  execute<TRow extends Record<string, unknown>>(query: SQL): Promise<TRow[]>;
};

function createLazyDatabaseGetter(
  createDatabase: () => AdminAiAuditLogRuntimeDatabase,
): () => AdminAiAuditLogRuntimeDatabase {
  let cachedDatabase: AdminAiAuditLogRuntimeDatabase | undefined;

  return () => {
    cachedDatabase ??= createDatabase();

    return cachedDatabase;
  };
}

function createPagination(
  query: Pick<
    AdminAiAuditLogListQuery,
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

export function createPostgresAdminAiAuditLogRuntimeRepositories(
  options: AdminAiAuditLogRuntimeRepositoryOptions = {},
): AdminAiAuditLogRuntimeRepositories {
  const getDatabase = createLazyDatabaseGetter(
    options.createDatabase ?? createLocalRuntimeDatabase,
  );

  return {
    async listModelConfigs(query) {
      const database = getDatabase();
      const keywordCondition =
        query.keyword === null
          ? sql`true`
          : sql`(
              mc.public_id ilike ${`%${query.keyword}%`}
              or mc.model_name ilike ${`%${query.keyword}%`}
              or mc.display_name ilike ${`%${query.keyword}%`}
              or mp.display_name ilike ${`%${query.keyword}%`}
              or mp.provider_key ilike ${`%${query.keyword}%`}
            )`;

      try {
        const rows = await executeSql<ModelConfigDatabaseRow>(
          database,
          sql`
            select
              mc.public_id,
              mp.public_id as provider_public_id,
              mp.display_name as provider_display_name,
              mp.provider_key,
              mp.api_key_last_four,
              mc.model_name,
              mc.display_name,
              mc.ai_func_type,
              mc.config_version,
              mc.is_enabled,
              mc.timeout_second,
              mc.max_retry_count,
              fallback.public_id as fallback_model_config_public_id,
              mc.updated_at
            from model_config mc
            inner join model_provider mp on mp.id = mc.model_provider_id
            left join model_config fallback on fallback.id = mc.fallback_model_config_id
            where ${keywordCondition}
            order by mc.updated_at desc
            limit ${query.pageSize}
            offset ${(query.page - 1) * query.pageSize}
          `,
        );
        const [totalRow] = await executeSql<CountDatabaseRow>(
          database,
          sql`
            select count(*)::int as value
            from model_config mc
            inner join model_provider mp on mp.id = mc.model_provider_id
            where ${keywordCondition}
          `,
        );

        return {
          modelConfigs: rows.map(mapModelConfigRow),
          pagination: createPagination(query, totalRow?.value ?? 0),
        };
      } catch (error) {
        if (!isUndefinedTableError(error)) {
          throw error;
        }

        return {
          modelConfigs: [],
          pagination: createPagination(query, 0),
        };
      }
    },

    async appendAiCallLog(input) {
      const database = getDatabase();
      const publicId = `ai-call-log-${randomUUID()}`;

      try {
        await executeSql(
          database,
          sql`
            insert into ai_call_log (
              public_id,
              user_public_id,
              answer_record_public_id,
              mock_exam_public_id,
              question_public_id,
              ai_func_type,
              call_status,
              model_config_id,
              prompt_template_id,
              model_config_snapshot,
              prompt_template_key,
              prompt_template_version,
              request_redacted_snapshot,
              response_redacted_snapshot,
              error_redacted_snapshot,
              citation_redacted_snapshot,
              prompt_token_count,
              completion_token_count,
              total_token_count,
              latency_ms,
              started_at,
              completed_at,
              created_at
            )
            select
              ${publicId},
              ${input.userPublicId},
              ${input.answerRecordPublicId},
              ${input.mockExamPublicId},
              ${input.questionPublicId},
              ${toDatabaseAiFuncType(input.aiFuncType)}::ai_func_type,
              ${input.callStatus}::ai_call_status,
              mc.id,
              pt.id,
              ${JSON.stringify(input.modelConfigSnapshot)}::jsonb,
              ${input.promptTemplateKey},
              ${input.promptTemplateVersion},
              ${JSON.stringify(input.requestRedactedSnapshot)}::jsonb,
              ${JSON.stringify(input.responseRedactedSnapshot)}::jsonb,
              ${JSON.stringify(input.errorRedactedSnapshot)}::jsonb,
              ${JSON.stringify(input.citationRedactedSnapshot)}::jsonb,
              ${input.promptTokenCount},
              ${input.completionTokenCount},
              ${input.totalTokenCount},
              ${input.latencyMs},
              ${input.startedAt.toISOString()},
              ${input.completedAt?.toISOString() ?? null},
              now()
            from model_config mc
            inner join prompt_template pt
              on pt.prompt_template_key = ${input.promptTemplateKey}
              and pt.version = ${input.promptTemplateVersion}
            where mc.public_id = ${input.modelConfigSnapshot.modelConfigPublicId}
          `,
        );
      } catch (error) {
        if (!isUndefinedTableError(error)) {
          throw error;
        }
      }

      return mapAppendInputToSummary(publicId, input);
    },

    async enableModelConfig(publicId) {
      return updateModelConfigEnabled(getDatabase(), publicId, true);
    },

    async disableModelConfig(publicId) {
      return updateModelConfigEnabled(getDatabase(), publicId, false);
    },

    async appendAuditLog(input) {
      const database = getDatabase();
      const publicId = `audit-log-${randomUUID()}`;

      try {
        await executeSql(
          database,
          sql`
            insert into audit_log (
              public_id,
              actor_public_id,
              actor_role,
              action_type,
              target_resource_type,
              target_public_id,
              result_status,
              metadata_summary,
              request_ip,
              created_at
            )
            values (
              ${publicId},
              ${input.actorPublicId},
              ${input.actorRole},
              ${input.actionType},
              ${input.targetResourceType},
              ${input.targetPublicId},
              ${input.resultStatus},
              ${input.metadataSummary},
              ${input.requestIp},
              now()
            )
          `,
        );
      } catch (error) {
        if (!isUndefinedTableError(error)) {
          throw error;
        }
      }
    },

    async listAiCallLogs(query) {
      const database = getDatabase();
      const keywordCondition =
        query.keyword === null
          ? sql`true`
          : sql`(
              public_id ilike ${`%${query.keyword}%`}
              or user_public_id ilike ${`%${query.keyword}%`}
              or answer_record_public_id ilike ${`%${query.keyword}%`}
              or mock_exam_public_id ilike ${`%${query.keyword}%`}
              or question_public_id ilike ${`%${query.keyword}%`}
              or prompt_template_key ilike ${`%${query.keyword}%`}
            )`;
      const aiFuncTypeCondition =
        query.aiFuncType === "all"
          ? sql`true`
          : sql`ai_func_type = ${toDatabaseAiFuncType(query.aiFuncType)}::ai_func_type`;
      const callStatusCondition =
        query.callStatus === "all"
          ? sql`true`
          : sql`call_status = ${query.callStatus}::ai_call_status`;
      const orderBy =
        query.sortOrder === "asc" ? sql`started_at asc` : sql`started_at desc`;

      try {
        const rows = await executeSql<AiCallLogDatabaseRow>(
          database,
          sql`
            select
              public_id,
              user_public_id,
              answer_record_public_id,
              mock_exam_public_id,
              question_public_id,
              ai_func_type,
              call_status,
              model_config_snapshot,
              request_redacted_snapshot,
              response_redacted_snapshot,
              error_redacted_snapshot,
              citation_redacted_snapshot,
              prompt_token_count,
              completion_token_count,
              total_token_count,
              latency_ms,
              started_at,
              completed_at
            from ai_call_log
            where ${keywordCondition}
              and ${aiFuncTypeCondition}
              and ${callStatusCondition}
            order by ${orderBy}
            limit ${query.pageSize}
            offset ${(query.page - 1) * query.pageSize}
          `,
        );
        const [totalRow] = await executeSql<CountDatabaseRow>(
          database,
          sql`
            select count(*)::int as value
            from ai_call_log
            where ${keywordCondition}
              and ${aiFuncTypeCondition}
              and ${callStatusCondition}
          `,
        );

        return {
          aiCallLogs: rows.map(mapAiCallLogRow),
          pagination: createPagination(query, totalRow?.value ?? 0),
        };
      } catch (error) {
        if (!isUndefinedTableError(error)) {
          throw error;
        }

        return {
          aiCallLogs: [],
          pagination: createPagination(query, 0),
        };
      }
    },

    async summarizeAiCallLogs(query) {
      const listResult = await this.listAiCallLogs({
        ...query,
        page: 1,
        pageSize: 100,
      });
      const summaries = summarizeAiCallLogDtos(listResult.aiCallLogs);

      return {
        dailySummaries: summaries.slice(
          (query.page - 1) * query.pageSize,
          query.page * query.pageSize,
        ),
        pagination: createPagination(query, summaries.length),
      };
    },
  };
}

async function executeSql<TRow extends Record<string, unknown>>(
  database: AdminAiAuditLogRuntimeDatabase,
  query: SQL,
): Promise<TRow[]> {
  return (database as unknown as DrizzleSqlExecutor).execute<TRow>(query);
}

async function updateModelConfigEnabled(
  database: AdminAiAuditLogRuntimeDatabase,
  publicId: string,
  isEnabled: boolean,
): Promise<boolean> {
  try {
    const rows = await executeSql<{ public_id: string }>(
      database,
      sql`
        update model_config
        set
          is_enabled = ${isEnabled},
          updated_at = now()
        where public_id = ${publicId}
        returning public_id
      `,
    );

    return rows.length > 0;
  } catch (error) {
    if (!isUndefinedTableError(error)) {
      throw error;
    }

    return false;
  }
}

function mapModelConfigRow(row: ModelConfigDatabaseRow): ModelConfigSummaryDto {
  return {
    publicId: row.public_id,
    providerPublicId: row.provider_public_id,
    providerDisplayName: row.provider_display_name,
    providerKey: row.provider_key,
    modelName: row.model_name,
    modelAlias: row.model_name,
    displayName: row.display_name,
    aiFuncType: toAdminAiFuncType(row.ai_func_type),
    apiKeyDisplay:
      row.api_key_last_four === null ? null : `****${row.api_key_last_four}`,
    fallbackModelConfigPublicId: row.fallback_model_config_public_id,
    isEnabled: row.is_enabled,
    configVersion: row.config_version,
    timeoutSecond: row.timeout_second,
    maxRetryCount: row.max_retry_count,
    updatedAt: toIsoString(row.updated_at),
  };
}

function mapAppendInputToSummary(
  publicId: string,
  input: AppendAiCallLogInput,
): AiCallLogSummaryDto {
  return {
    publicId,
    userPublicId: input.userPublicId,
    organizationPublicId: null,
    profession: null,
    level: null,
    aiFuncType: input.aiFuncType,
    callStatus: input.callStatus,
    providerDisplayName: input.modelConfigSnapshot.providerDisplayName,
    modelAlias: input.modelConfigSnapshot.modelName,
    promptSummary: "redacted prompt and answer snapshot",
    outputSummary:
      input.callStatus === "success"
        ? "redacted learning suggestion snapshot"
        : "redacted provider error snapshot",
    promptTokenCount: input.promptTokenCount,
    completionTokenCount: input.completionTokenCount,
    totalTokenCount: input.totalTokenCount,
    estimatedCostCny: "0.00",
    latencyMs: input.latencyMs,
    startedAt: input.startedAt.toISOString(),
    completedAt: input.completedAt?.toISOString() ?? null,
  };
}

function mapAiCallLogRow(row: AiCallLogDatabaseRow): AiCallLogSummaryDto {
  const modelConfigSnapshot = row.model_config_snapshot;

  return {
    publicId: row.public_id,
    userPublicId: row.user_public_id,
    organizationPublicId: null,
    profession: null,
    level: null,
    aiFuncType: toAdminAiFuncType(row.ai_func_type),
    callStatus: row.call_status,
    providerDisplayName: modelConfigSnapshot.providerDisplayName,
    modelAlias: modelConfigSnapshot.modelName,
    promptSummary: "redacted prompt and answer snapshot",
    outputSummary:
      row.call_status === "success"
        ? "redacted learning suggestion snapshot"
        : "redacted provider error snapshot",
    promptTokenCount: row.prompt_token_count,
    completionTokenCount: row.completion_token_count,
    totalTokenCount: row.total_token_count,
    estimatedCostCny: "0.00",
    latencyMs: row.latency_ms,
    startedAt: toIsoString(row.started_at),
    completedAt:
      row.completed_at === null ? null : toIsoString(row.completed_at),
  };
}

function summarizeAiCallLogDtos(
  aiCallLogs: AiCallLogSummaryDto[],
): AiCallLogCostSummaryDto[] {
  const summaryByKey = new Map<string, AiCallLogCostSummaryDto>();

  for (const aiCallLog of aiCallLogs) {
    const bucket = aiCallLog.startedAt.slice(0, 10);
    const key = [
      bucket,
      aiCallLog.aiFuncType,
      aiCallLog.providerDisplayName,
      aiCallLog.modelAlias,
    ].join("|");
    const summary =
      summaryByKey.get(key) ??
      ({
        bucket,
        bucketType: "day",
        aiFuncType: aiCallLog.aiFuncType,
        providerDisplayName: aiCallLog.providerDisplayName,
        modelAlias: aiCallLog.modelAlias,
        callCount: 0,
        successCount: 0,
        failedCount: 0,
        totalTokenCount: 0,
        estimatedCostCny: "0.00",
      } satisfies AiCallLogCostSummaryDto);

    summary.callCount += 1;
    summary.successCount += aiCallLog.callStatus === "success" ? 1 : 0;
    summary.failedCount += aiCallLog.callStatus === "failed" ? 1 : 0;
    summary.totalTokenCount += aiCallLog.totalTokenCount ?? 0;
    summaryByKey.set(key, summary);
  }

  return [...summaryByKey.values()];
}

function toAdminAiFuncType(value: string): AdminAiFunctionType {
  if (value === "scoring") {
    return "ai_scoring";
  }

  if (value === "explanation") {
    return "ai_explanation";
  }

  if (value === "hint") {
    return "ai_hint";
  }

  if (
    value === "kn_recommendation" ||
    value === "learning_suggestion" ||
    value === "ai_scoring" ||
    value === "ai_explanation" ||
    value === "ai_hint"
  ) {
    return value;
  }

  return "learning_suggestion";
}

function toDatabaseAiFuncType(value: AdminAiFunctionType): string {
  if (value === "ai_scoring") {
    return "scoring";
  }

  if (value === "ai_explanation") {
    return "explanation";
  }

  if (value === "ai_hint") {
    return "hint";
  }

  return value;
}

function toIsoString(value: Date | string): string {
  return value instanceof Date
    ? value.toISOString()
    : new Date(value).toISOString();
}

function isUndefinedTableError(error: unknown): boolean {
  if (typeof error !== "object" || error === null) {
    return false;
  }

  const errorCode = (error as { code?: unknown }).code;

  if (errorCode === "42P01") {
    return true;
  }

  return isUndefinedTableError((error as { cause?: unknown }).cause);
}

function createLocalRuntimeDatabase(): AdminAiAuditLogRuntimeDatabase {
  loadLocalEnv();

  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error("DATABASE_URL is required for AI audit log runtime.");
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
