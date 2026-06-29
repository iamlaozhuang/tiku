import { randomUUID } from "node:crypto";

import { sql, type SQL } from "drizzle-orm";
import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";

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
  ModelConfigSnapshotPolicy,
  ModelConfigStatus,
  ModelConfigSummaryDto,
  ModelProviderListDto,
  ModelProviderSecretStatus,
  ModelProviderSummaryDto,
  PromptTemplateListDto,
  PromptTemplateStatus,
  PromptTemplateSummaryDto,
  RedactedMetadata,
} from "../contracts/admin-ai-audit-log-ops-contract";
import type {
  AiCallStatus,
  ModelConfigSnapshot,
  RedactedJsonObject,
} from "../models/ai-rag";
import { createRuntimeDatabaseForSchema } from "./runtime-database";
import type {
  NormalizedModelConfigFallbackOrderInput,
  NormalizedModelConfigInput,
  NormalizedModelProviderInput,
  NormalizedPromptTemplateInput,
} from "../validators/ai-rag";

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
  listModelProviders?(
    query: AdminAiAuditLogListQuery,
  ): Promise<AdminAiAuditLogRuntimePage<ModelProviderListDto>>;
  createModelProvider?(
    input: NormalizedModelProviderInput,
  ): Promise<ModelProviderSummaryDto>;
  updateModelProvider?(
    publicId: string,
    input: NormalizedModelProviderInput,
  ): Promise<ModelProviderSummaryDto | null>;
  setModelProviderEnabled?(
    publicId: string,
    isEnabled: boolean,
  ): Promise<boolean>;
  listModelConfigs(
    query: AdminAiAuditLogListQuery,
  ): Promise<AdminAiAuditLogRuntimePage<ModelConfigListDto>>;
  createModelConfig?(
    input: NormalizedModelConfigInput,
  ): Promise<ModelConfigSummaryDto>;
  updateModelConfig?(
    publicId: string,
    input: NormalizedModelConfigInput,
  ): Promise<ModelConfigSummaryDto | null>;
  reorderModelConfigFallback?(
    input: NormalizedModelConfigFallbackOrderInput,
  ): Promise<boolean>;
  listPromptTemplates?(
    query: AdminAiAuditLogListQuery,
  ): Promise<AdminAiAuditLogRuntimePage<PromptTemplateListDto>>;
  createPromptTemplate?(
    input: NormalizedPromptTemplateInput,
  ): Promise<PromptTemplateSummaryDto>;
  updatePromptTemplate?(
    publicId: string,
    input: NormalizedPromptTemplateInput,
  ): Promise<PromptTemplateSummaryDto | null>;
  setPromptTemplateEnabled?(
    publicId: string,
    isActive: boolean,
  ): Promise<boolean>;
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
  secret_status: string | null;
  model_name: string;
  model_alias: string | null;
  display_name: string;
  ai_func_type: string;
  config_version: number;
  is_enabled: boolean;
  status: string | null;
  fallback_priority: number | null;
  snapshot_policy: string | null;
  timeout_second: number;
  max_retry_count: number;
  fallback_model_config_public_id: string | null;
  updated_at: Date | string;
};

type ModelProviderDatabaseRow = {
  public_id: string;
  provider_key: string;
  display_name: string;
  api_key_last_four: string | null;
  base_url: string | null;
  secret_status: string | null;
  provider_metadata: unknown;
  is_enabled: boolean;
  updated_at: Date | string;
};

type PromptTemplateDatabaseRow = {
  public_id: string;
  prompt_template_key: string;
  ai_func_type: string;
  version: number;
  title: string | null;
  description: string | null;
  body_digest: string | null;
  body_preview_masked: string | null;
  template_hash: string;
  status: string | null;
  is_active: boolean;
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
    async listModelProviders(query) {
      const database = getDatabase();
      const keywordCondition =
        query.keyword === null
          ? sql`true`
          : sql`(
              public_id ilike ${`%${query.keyword}%`}
              or provider_key ilike ${`%${query.keyword}%`}
              or display_name ilike ${`%${query.keyword}%`}
            )`;

      try {
        const rows = await executeSql<ModelProviderDatabaseRow>(
          database,
          sql`
            select
              public_id,
              provider_key,
              display_name,
              api_key_last_four,
              base_url,
              secret_status,
              provider_metadata,
              is_enabled,
              updated_at
            from model_provider
            where ${keywordCondition}
            order by updated_at desc
            limit ${query.pageSize}
            offset ${(query.page - 1) * query.pageSize}
          `,
        );
        const [totalRow] = await executeSql<CountDatabaseRow>(
          database,
          sql`
            select count(*)::int as value
            from model_provider
            where ${keywordCondition}
          `,
        );

        return {
          modelProviders: rows.map(mapModelProviderRow),
          pagination: createPagination(query, totalRow?.value ?? 0),
        };
      } catch (error) {
        if (!isUndefinedTableError(error)) {
          throw error;
        }

        return {
          modelProviders: [],
          pagination: createPagination(query, 0),
        };
      }
    },

    async createModelProvider(input) {
      const database = getDatabase();
      const publicId = `model-provider-${randomUUID()}`;

      const rows = await executeSql<ModelProviderDatabaseRow>(
        database,
        sql`
          insert into model_provider (
            public_id,
            provider_key,
            display_name,
            api_key_last_four,
            base_url,
            secret_status,
            provider_metadata,
            is_enabled,
            created_at,
            updated_at
          )
          values (
            ${publicId},
            ${input.providerKey},
            ${input.displayName},
            ${input.apiKeyLastFour},
            ${input.baseUrl},
            ${input.secretStatus},
            ${JSON.stringify({ secretStorage: "external_ref_required" })}::jsonb,
            ${input.isEnabled},
            now(),
            now()
          )
          returning
            public_id,
            provider_key,
            display_name,
            api_key_last_four,
            base_url,
            secret_status,
            provider_metadata,
            is_enabled,
            updated_at
        `,
      );

      return mapModelProviderRow(rows[0] as ModelProviderDatabaseRow);
    },

    async updateModelProvider(publicId, input) {
      const database = getDatabase();
      const rows = await executeSql<ModelProviderDatabaseRow>(
        database,
        sql`
          update model_provider
          set
            provider_key = ${input.providerKey},
            display_name = ${input.displayName},
            api_key_last_four = ${input.apiKeyLastFour},
            base_url = ${input.baseUrl},
            secret_status = ${input.secretStatus},
            is_enabled = ${input.isEnabled},
            updated_at = now()
          where public_id = ${publicId}
          returning
            public_id,
            provider_key,
            display_name,
            api_key_last_four,
            base_url,
            secret_status,
            provider_metadata,
            is_enabled,
            updated_at
        `,
      );

      return rows[0] === undefined ? null : mapModelProviderRow(rows[0]);
    },

    async setModelProviderEnabled(publicId, isEnabled) {
      return updateBooleanStatus(
        getDatabase(),
        "model_provider",
        publicId,
        isEnabled,
      );
    },

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
              mp.secret_status,
              mc.model_name,
              mc.model_alias,
              mc.display_name,
              mc.ai_func_type,
              mc.config_version,
              mc.is_enabled,
              mc.status,
              mc.fallback_priority,
              mc.snapshot_policy,
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
        if (isUndefinedColumnError(error)) {
          return listLegacyModelConfigs(database, query, keywordCondition);
        }

        if (!isUndefinedTableError(error)) {
          throw error;
        }

        return {
          modelConfigs: [],
          pagination: createPagination(query, 0),
        };
      }
    },

    async createModelConfig(input) {
      const database = getDatabase();
      const publicId = `model-config-${randomUUID()}`;
      const rows = await executeSql<ModelConfigDatabaseRow>(
        database,
        sql`
          insert into model_config (
            public_id,
            model_provider_id,
            ai_func_type,
            model_name,
            model_alias,
            display_name,
            config_version,
            status,
            is_enabled,
            timeout_second,
            max_retry_count,
            fallback_priority,
            snapshot_policy,
            fallback_model_config_id,
            created_at,
            updated_at
          )
          select
            ${publicId},
            mp.id,
            ${toDatabaseAiFuncType(input.aiFuncType)}::ai_func_type,
            ${input.modelName},
            ${input.modelAlias},
            ${input.displayName},
            ${input.configVersion},
            ${input.status},
            ${input.isEnabled},
            ${input.timeoutSecond},
            ${input.maxRetryCount},
            ${input.fallbackPriority},
            ${input.snapshotPolicy},
            fallback.id,
            now(),
            now()
          from model_provider mp
          left join model_config fallback
            on fallback.public_id = ${input.fallbackModelConfigPublicId}
          where mp.public_id = ${input.modelProviderPublicId}
          returning
            public_id,
            (select public_id from model_provider where id = model_provider_id) as provider_public_id,
            (select display_name from model_provider where id = model_provider_id) as provider_display_name,
            (select provider_key from model_provider where id = model_provider_id) as provider_key,
            (select api_key_last_four from model_provider where id = model_provider_id) as api_key_last_four,
            (select secret_status from model_provider where id = model_provider_id) as secret_status,
            model_name,
            model_alias,
            display_name,
            ai_func_type,
            config_version,
            is_enabled,
            status,
            fallback_priority,
            snapshot_policy,
            timeout_second,
            max_retry_count,
            (select public_id from model_config where id = fallback_model_config_id) as fallback_model_config_public_id,
            updated_at
        `,
      );

      if (rows[0] === undefined) {
        throw new Error("model_provider public id is required.");
      }

      return mapModelConfigRow(rows[0]);
    },

    async updateModelConfig(publicId, input) {
      const database = getDatabase();
      const rows = await executeSql<ModelConfigDatabaseRow>(
        database,
        sql`
          update model_config
          set
            model_provider_id = mp.id,
            ai_func_type = ${toDatabaseAiFuncType(input.aiFuncType)}::ai_func_type,
            model_name = ${input.modelName},
            model_alias = ${input.modelAlias},
            display_name = ${input.displayName},
            config_version = ${input.configVersion},
            status = ${input.status},
            is_enabled = ${input.isEnabled},
            timeout_second = ${input.timeoutSecond},
            max_retry_count = ${input.maxRetryCount},
            fallback_priority = ${input.fallbackPriority},
            snapshot_policy = ${input.snapshotPolicy},
            fallback_model_config_id = fallback.id,
            updated_at = now()
          from model_provider mp
          left join model_config fallback
            on fallback.public_id = ${input.fallbackModelConfigPublicId}
          where model_config.public_id = ${publicId}
            and mp.public_id = ${input.modelProviderPublicId}
          returning
            model_config.public_id,
            mp.public_id as provider_public_id,
            mp.display_name as provider_display_name,
            mp.provider_key,
            mp.api_key_last_four,
            mp.secret_status,
            model_config.model_name,
            model_config.model_alias,
            model_config.display_name,
            model_config.ai_func_type,
            model_config.config_version,
            model_config.is_enabled,
            model_config.status,
            model_config.fallback_priority,
            model_config.snapshot_policy,
            model_config.timeout_second,
            model_config.max_retry_count,
            fallback.public_id as fallback_model_config_public_id,
            model_config.updated_at
        `,
      );

      return rows[0] === undefined ? null : mapModelConfigRow(rows[0]);
    },

    async reorderModelConfigFallback(input) {
      const database = getDatabase();

      for (const item of input.items) {
        await executeSql(
          database,
          sql`
            update model_config
            set
              fallback_priority = ${item.fallbackPriority},
              updated_at = now()
            where public_id = ${item.publicId}
          `,
        );
      }

      return true;
    },

    async listPromptTemplates(query) {
      const database = getDatabase();
      const keywordCondition =
        query.keyword === null
          ? sql`true`
          : sql`(
              public_id ilike ${`%${query.keyword}%`}
              or prompt_template_key ilike ${`%${query.keyword}%`}
              or title ilike ${`%${query.keyword}%`}
            )`;

      try {
        const rows = await executeSql<PromptTemplateDatabaseRow>(
          database,
          sql`
            select
              public_id,
              prompt_template_key,
              ai_func_type,
              version,
              title,
              description,
              body_digest,
              body_preview_masked,
              template_hash,
              status,
              is_active,
              updated_at
            from prompt_template
            where ${keywordCondition}
            order by updated_at desc
            limit ${query.pageSize}
            offset ${(query.page - 1) * query.pageSize}
          `,
        );
        const [totalRow] = await executeSql<CountDatabaseRow>(
          database,
          sql`
            select count(*)::int as value
            from prompt_template
            where ${keywordCondition}
          `,
        );

        return {
          promptTemplates: rows.map(mapPromptTemplateRow),
          pagination: createPagination(query, totalRow?.value ?? 0),
        };
      } catch (error) {
        if (!isUndefinedTableError(error)) {
          throw error;
        }

        return {
          promptTemplates: [],
          pagination: createPagination(query, 0),
        };
      }
    },

    async createPromptTemplate(input) {
      const database = getDatabase();
      const publicId = `prompt-template-${randomUUID()}`;
      const rows = await executeSql<PromptTemplateDatabaseRow>(
        database,
        sql`
          insert into prompt_template (
            public_id,
            prompt_template_key,
            ai_func_type,
            version,
            title,
            description,
            template_content,
            template_hash,
            body_digest,
            body_preview_masked,
            status,
            is_active,
            created_at,
            updated_at
          )
          values (
            ${publicId},
            ${input.promptTemplateKey},
            ${toDatabaseAiFuncType(input.aiFuncType)}::ai_func_type,
            ${input.version},
            ${input.title},
            ${input.description},
            ${input.bodyPreviewMasked},
            ${input.bodyDigest},
            ${input.bodyDigest},
            ${input.bodyPreviewMasked},
            ${input.status},
            ${input.isActive},
            now(),
            now()
          )
          returning
            public_id,
            prompt_template_key,
            ai_func_type,
            version,
            title,
            description,
            body_digest,
            body_preview_masked,
            template_hash,
            status,
            is_active,
            updated_at
        `,
      );

      return mapPromptTemplateRow(rows[0] as PromptTemplateDatabaseRow);
    },

    async updatePromptTemplate(publicId, input) {
      const database = getDatabase();
      const rows = await executeSql<PromptTemplateDatabaseRow>(
        database,
        sql`
          update prompt_template
          set
            prompt_template_key = ${input.promptTemplateKey},
            ai_func_type = ${toDatabaseAiFuncType(input.aiFuncType)}::ai_func_type,
            version = ${input.version},
            title = ${input.title},
            description = ${input.description},
            template_content = ${input.bodyPreviewMasked},
            template_hash = ${input.bodyDigest},
            body_digest = ${input.bodyDigest},
            body_preview_masked = ${input.bodyPreviewMasked},
            status = ${input.status},
            is_active = ${input.isActive},
            updated_at = now()
          where public_id = ${publicId}
          returning
            public_id,
            prompt_template_key,
            ai_func_type,
            version,
            title,
            description,
            body_digest,
            body_preview_masked,
            template_hash,
            status,
            is_active,
            updated_at
        `,
      );

      return rows[0] === undefined ? null : mapPromptTemplateRow(rows[0]);
    },

    async setPromptTemplateEnabled(publicId, isActive) {
      return updateBooleanStatus(
        getDatabase(),
        "prompt_template",
        publicId,
        isActive,
      );
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

async function listLegacyModelConfigs(
  database: AdminAiAuditLogRuntimeDatabase,
  query: AdminAiAuditLogListQuery,
  keywordCondition: SQL,
): Promise<AdminAiAuditLogRuntimePage<ModelConfigListDto>> {
  const rows = await executeSql<ModelConfigDatabaseRow>(
    database,
    sql`
      select
        mc.public_id,
        mp.public_id as provider_public_id,
        mp.display_name as provider_display_name,
        mp.provider_key,
        mp.api_key_last_four,
        null::text as secret_status,
        mc.model_name,
        null::text as model_alias,
        mc.display_name,
        mc.ai_func_type,
        mc.config_version,
        mc.is_enabled,
        null::text as status,
        null::int as fallback_priority,
        null::text as snapshot_policy,
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
}

async function updateBooleanStatus(
  database: AdminAiAuditLogRuntimeDatabase,
  tableName: "model_provider" | "prompt_template",
  publicId: string,
  value: boolean,
): Promise<boolean> {
  const query =
    tableName === "model_provider"
      ? sql`
          update model_provider
          set
            is_enabled = ${value},
            updated_at = now()
          where public_id = ${publicId}
          returning public_id
        `
      : sql`
          update prompt_template
          set
            is_active = ${value},
            status = ${value ? "active" : "disabled"},
            disabled_at = ${value ? null : new Date().toISOString()},
            updated_at = now()
          where public_id = ${publicId}
          returning public_id
        `;

  try {
    const rows = await executeSql<{ public_id: string }>(database, query);

    return rows.length > 0;
  } catch (error) {
    if (!isUndefinedTableError(error)) {
      throw error;
    }

    return false;
  }
}

function mapModelProviderRow(
  row: ModelProviderDatabaseRow,
): ModelProviderSummaryDto {
  const maskedSecret =
    row.api_key_last_four === null ? null : `****${row.api_key_last_four}`;

  return {
    publicId: row.public_id,
    providerKey: row.provider_key,
    displayName: row.display_name,
    baseUrl: row.base_url,
    isEnabled: row.is_enabled,
    secretStatus: toModelProviderSecretStatus(row.secret_status),
    maskedSecret,
    providerMetadata: toRedactedMetadata(row.provider_metadata),
    updatedAt: toIsoString(row.updated_at),
  };
}

function mapModelConfigRow(row: ModelConfigDatabaseRow): ModelConfigSummaryDto {
  return {
    publicId: row.public_id,
    providerPublicId: row.provider_public_id,
    providerDisplayName: row.provider_display_name,
    providerKey: row.provider_key,
    modelName: row.model_name,
    modelAlias: row.model_alias ?? row.model_name,
    displayName: row.display_name,
    aiFuncType: toAdminAiFuncType(row.ai_func_type),
    apiKeyDisplay:
      row.api_key_last_four === null ? null : `****${row.api_key_last_four}`,
    secretStatus: toModelProviderSecretStatus(row.secret_status),
    maskedSecret:
      row.api_key_last_four === null ? null : `****${row.api_key_last_four}`,
    fallbackModelConfigPublicId: row.fallback_model_config_public_id,
    isEnabled: row.is_enabled,
    status: toModelConfigStatus(row.status, row.is_enabled),
    fallbackPriority: row.fallback_priority ?? 0,
    snapshotPolicy: toModelConfigSnapshotPolicy(row.snapshot_policy),
    configVersion: row.config_version,
    timeoutSecond: row.timeout_second,
    maxRetryCount: row.max_retry_count,
    updatedAt: toIsoString(row.updated_at),
  };
}

function mapPromptTemplateRow(
  row: PromptTemplateDatabaseRow,
): PromptTemplateSummaryDto {
  return {
    publicId: row.public_id,
    promptTemplateKey: row.prompt_template_key,
    aiFuncType: toAdminAiFuncType(row.ai_func_type),
    version: row.version,
    title: row.title,
    description: row.description,
    bodyDigest: row.body_digest ?? row.template_hash,
    bodyPreviewMasked: row.body_preview_masked ?? "[redacted]",
    status: toPromptTemplateStatus(row.status, row.is_active),
    isActive: row.is_active,
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

function toDatabaseAiFuncType(
  value: AdminAiFunctionType | "scoring" | "explanation" | "hint",
): string {
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

function toModelProviderSecretStatus(
  value: string | null,
): ModelProviderSecretStatus {
  if (
    value === "configured" ||
    value === "expired" ||
    value === "rotation_required"
  ) {
    return value;
  }

  return "not_configured";
}

function toModelConfigStatus(
  value: string | null,
  isEnabled: boolean,
): ModelConfigStatus {
  if (value === "enabled" || value === "disabled" || value === "draft") {
    return value;
  }

  return isEnabled ? "enabled" : "disabled";
}

function toModelConfigSnapshotPolicy(
  value: string | null,
): ModelConfigSnapshotPolicy {
  return value === "redacted_metadata" ? value : "redacted_metadata";
}

function toPromptTemplateStatus(
  value: string | null,
  isActive: boolean,
): PromptTemplateStatus {
  if (value === "draft" || value === "active" || value === "disabled") {
    return value;
  }

  return isActive ? "active" : "disabled";
}

function toRedactedMetadata(value: unknown): RedactedMetadata {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return {};
  }

  const metadata: RedactedMetadata = {};

  for (const [key, item] of Object.entries(value)) {
    if (
      typeof item === "string" ||
      typeof item === "number" ||
      typeof item === "boolean" ||
      item === null
    ) {
      metadata[key] = item;
    }
  }

  return metadata;
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

function isUndefinedColumnError(error: unknown): boolean {
  if (typeof error !== "object" || error === null) {
    return false;
  }

  const errorCode = (error as { code?: unknown }).code;

  if (errorCode === "42703") {
    return true;
  }

  return isUndefinedColumnError((error as { cause?: unknown }).cause);
}

function createLocalRuntimeDatabase(): AdminAiAuditLogRuntimeDatabase {
  return createRuntimeDatabaseForSchema(
    databaseSchema,
    "DATABASE_URL is required for AI audit log runtime.",
  );
}
