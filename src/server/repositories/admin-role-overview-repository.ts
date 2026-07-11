import { count, sql } from "drizzle-orm";
import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";

import * as databaseSchema from "@/db/schema";
import type {
  AdminContentOverviewSummaryDto,
  AdminOperationsOverviewSummaryDto,
} from "../contracts/admin-role-overview-contract";
import type { AdminRoleOverviewRepository } from "../services/admin-role-overview-service";
import { createRuntimeDatabaseForSchema } from "./runtime-database";

type AdminRoleOverviewRuntimeDatabase = PostgresJsDatabase<
  typeof databaseSchema
>;

export type AdminRoleOverviewRepositoryOptions = {
  createDatabase?: () => AdminRoleOverviewRuntimeDatabase;
};

const {
  adminAiGenerationResult,
  aiCallLog,
  orgAuth,
  organization,
  paper,
  question,
  redeemCode,
  user,
} = databaseSchema;

function createLazyDatabaseGetter(
  createDatabase: () => AdminRoleOverviewRuntimeDatabase,
): () => AdminRoleOverviewRuntimeDatabase {
  let cachedDatabase: AdminRoleOverviewRuntimeDatabase | undefined;

  return () => {
    cachedDatabase ??= createDatabase();
    return cachedDatabase;
  };
}

function toCount(value: number | null | undefined): number {
  return Number(value ?? 0);
}

async function readOperationsSummary(
  database: AdminRoleOverviewRuntimeDatabase,
  now: Date,
): Promise<AdminOperationsOverviewSummaryDto> {
  const attentionThreshold = new Date(now);
  attentionThreshold.setUTCDate(attentionThreshold.getUTCDate() + 30);
  const attentionThresholdIso = attentionThreshold.toISOString();

  const [
    userRows,
    organizationRows,
    authorizationRows,
    redeemCodeRows,
    aiRows,
  ] = await Promise.all([
    database
      .select({
        user_total: count(),
        disabled_user_total: sql<number>`
            count(*) filter (where ${user.status} = 'disabled')::int
          `,
      })
      .from(user),
    database.select({ organization_total: count() }).from(organization),
    database
      .select({
        authorization_attention_total: sql<number>`
            count(*) filter (
              where ${orgAuth.status} <> 'active'
                or ${orgAuth.expires_at} <= ${attentionThresholdIso}::timestamptz
            )::int
          `,
      })
      .from(orgAuth),
    database
      .select({
        unused_redeem_code_total: sql<number>`
            count(*) filter (where ${redeemCode.status} = 'unused')::int
          `,
      })
      .from(redeemCode),
    database
      .select({
        failed_ai_call_total: sql<number>`
            count(*) filter (where ${aiCallLog.call_status} = 'failed')::int
          `,
      })
      .from(aiCallLog),
  ]);

  return {
    userTotal: toCount(userRows[0]?.user_total),
    disabledUserTotal: toCount(userRows[0]?.disabled_user_total),
    organizationTotal: toCount(organizationRows[0]?.organization_total),
    authorizationAttentionTotal: toCount(
      authorizationRows[0]?.authorization_attention_total,
    ),
    unusedRedeemCodeTotal: toCount(redeemCodeRows[0]?.unused_redeem_code_total),
    failedAiCallTotal: toCount(aiRows[0]?.failed_ai_call_total),
  };
}

async function readContentSummary(
  database: AdminRoleOverviewRuntimeDatabase,
): Promise<AdminContentOverviewSummaryDto> {
  const [questionRows, paperRows, aiDraftRows] = await Promise.all([
    database
      .select({
        available_question_total: sql<number>`
          count(*) filter (where ${question.status} = 'available')::int
        `,
        disabled_question_total: sql<number>`
          count(*) filter (where ${question.status} = 'disabled')::int
        `,
      })
      .from(question),
    database
      .select({
        draft_paper_total: sql<number>`
          count(*) filter (where ${paper.paper_status} = 'draft')::int
        `,
        published_paper_total: sql<number>`
          count(*) filter (where ${paper.paper_status} = 'published')::int
        `,
        archived_paper_total: sql<number>`
          count(*) filter (where ${paper.paper_status} = 'archived')::int
        `,
      })
      .from(paper),
    database
      .select({
        ai_draft_review_total: sql<number>`
          count(*) filter (
            where ${adminAiGenerationResult.workspace} = 'content'
              and ${adminAiGenerationResult.result_status} = 'draft'
          )::int
        `,
      })
      .from(adminAiGenerationResult),
  ]);

  return {
    availableQuestionTotal: toCount(questionRows[0]?.available_question_total),
    disabledQuestionTotal: toCount(questionRows[0]?.disabled_question_total),
    draftPaperTotal: toCount(paperRows[0]?.draft_paper_total),
    publishedPaperTotal: toCount(paperRows[0]?.published_paper_total),
    archivedPaperTotal: toCount(paperRows[0]?.archived_paper_total),
    aiDraftReviewTotal: toCount(aiDraftRows[0]?.ai_draft_review_total),
  };
}

export function createPostgresAdminRoleOverviewRepository(
  options: AdminRoleOverviewRepositoryOptions = {},
): AdminRoleOverviewRepository {
  const getDatabase = createLazyDatabaseGetter(
    options.createDatabase ?? createLocalRuntimeDatabase,
  );

  return {
    readOperationsSummary(now) {
      return readOperationsSummary(getDatabase(), now);
    },
    readContentSummary() {
      return readContentSummary(getDatabase());
    },
  };
}

function createLocalRuntimeDatabase(): AdminRoleOverviewRuntimeDatabase {
  return createRuntimeDatabaseForSchema(
    databaseSchema,
    "DATABASE_URL is required for admin role overview runtime.",
  );
}
