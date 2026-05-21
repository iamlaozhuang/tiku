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
  AdminAiAuditLogListQuery,
  AuditLogListDto,
} from "../contracts/admin-ai-audit-log-ops-contract";
import type {
  AdminContentKnowledgeListQuery,
  AdminPaperOpsListDto,
  AdminQuestionOpsListDto,
} from "../contracts/admin-content-knowledge-ops-contract";
import type {
  AdminAuthOperationListQuery,
  AdminUserListDto,
} from "../contracts/admin-user-org-auth-ops-contract";

type AdminFlowRuntimeDatabase = PostgresJsDatabase<typeof databaseSchema>;

export type AdminFlowRuntimeRepositoryOptions = {
  createDatabase?: () => AdminFlowRuntimeDatabase;
};

export type AdminFlowPage<TData> = TData & {
  pagination: ApiPagination;
};

export type AdminUserOrgAuthRuntimeRepository = {
  listUsers(
    query: AdminAuthOperationListQuery,
  ): Promise<AdminFlowPage<AdminUserListDto>>;
};

export type AdminContentKnowledgeRuntimeRepository = {
  listQuestions(
    query: AdminContentKnowledgeListQuery,
  ): Promise<AdminFlowPage<AdminQuestionOpsListDto>>;
  listPapers(
    query: AdminContentKnowledgeListQuery,
  ): Promise<AdminFlowPage<AdminPaperOpsListDto>>;
};

export type AdminAuditLogRuntimeRepository = {
  listAuditLogs(
    query: AdminAiAuditLogListQuery,
  ): Promise<AdminFlowPage<AuditLogListDto>>;
};

export type AdminFlowRuntimeRepositories = {
  userOrgAuthRepository: AdminUserOrgAuthRuntimeRepository;
  contentKnowledgeRepository: AdminContentKnowledgeRuntimeRepository;
  auditLogRepository: AdminAuditLogRuntimeRepository;
};

const {
  employee,
  mockExam,
  organization,
  paper,
  paperQuestion,
  personalAuth,
  question,
  user,
} = databaseSchema;

function createLazyDatabaseGetter(
  createDatabase: () => AdminFlowRuntimeDatabase,
): () => AdminFlowRuntimeDatabase {
  let cachedDatabase: AdminFlowRuntimeDatabase | undefined;

  return () => {
    cachedDatabase ??= createDatabase();

    return cachedDatabase;
  };
}

function createPagination(
  query: Pick<
    | AdminAuthOperationListQuery
    | AdminContentKnowledgeListQuery
    | AdminAiAuditLogListQuery,
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

export function createPostgresAdminFlowRuntimeRepositories(
  options: AdminFlowRuntimeRepositoryOptions = {},
): AdminFlowRuntimeRepositories {
  const getDatabase = createLazyDatabaseGetter(
    options.createDatabase ?? createLocalRuntimeDatabase,
  );

  return {
    userOrgAuthRepository:
      createPostgresAdminUserOrgAuthRuntimeRepository(getDatabase),
    contentKnowledgeRepository:
      createPostgresAdminContentKnowledgeRuntimeRepository(getDatabase),
    auditLogRepository: createPostgresAdminAuditLogRuntimeRepository(),
  };
}

function createPostgresAdminUserOrgAuthRuntimeRepository(
  getDatabase: () => AdminFlowRuntimeDatabase,
): AdminUserOrgAuthRuntimeRepository {
  return {
    async listUsers(query) {
      const database = getDatabase();
      const conditions = createUserConditions(query);
      const rows = await database
        .select({
          auth_status: personalAuth.status,
          created_at: user.created_at,
          name: user.name,
          organization_name: organization.name,
          organization_public_id: organization.public_id,
          phone: user.phone,
          public_id: user.public_id,
          status: user.status,
          user_type: user.user_type,
        })
        .from(user)
        .leftJoin(employee, eq(employee.user_id, user.id))
        .leftJoin(organization, eq(organization.id, employee.organization_id))
        .leftJoin(personalAuth, eq(personalAuth.user_id, user.id))
        .where(and(...conditions))
        .orderBy(
          query.sortOrder === "asc"
            ? asc(user.updated_at)
            : desc(user.updated_at),
        )
        .limit(query.pageSize)
        .offset((query.page - 1) * query.pageSize);
      const [totalRow] = await database
        .select({ value: count() })
        .from(user)
        .where(and(...conditions));

      return {
        users: rows.map((row) => ({
          publicId: row.public_id,
          phone: row.phone,
          name: row.name,
          registeredAt: row.created_at.toISOString(),
          status: row.status,
          userType: row.user_type,
          organizationPublicId: row.organization_public_id,
          organizationName: row.organization_name,
          authStatus: row.auth_status,
        })),
        pagination: createPagination(query, totalRow?.value ?? 0),
      };
    },
  };
}

function createPostgresAdminContentKnowledgeRuntimeRepository(
  getDatabase: () => AdminFlowRuntimeDatabase,
): AdminContentKnowledgeRuntimeRepository {
  return {
    async listQuestions(queryInput) {
      const database = getDatabase();
      const conditions = createQuestionConditions(queryInput);
      const rows = await database
        .select({
          id: question.id,
          public_id: question.public_id,
          question_type: question.question_type,
          profession: question.profession,
          level: question.level,
          subject: question.subject,
          stem_rich_text: question.stem_rich_text,
          status: question.status,
          updated_at: question.updated_at,
        })
        .from(question)
        .where(and(...conditions))
        .orderBy(
          queryInput.sortOrder === "asc"
            ? asc(question.updated_at)
            : desc(question.updated_at),
        )
        .limit(queryInput.pageSize)
        .offset((queryInput.page - 1) * queryInput.pageSize);
      const [totalRow] = await database
        .select({ value: count() })
        .from(question)
        .where(and(...conditions));
      const referencedPaperCounts = await listReferencedPaperCounts(
        database,
        rows.map((row) => row.id),
      );

      return {
        questions: rows.map((row) => ({
          publicId: row.public_id,
          stemSummary: summarizeText(row.stem_rich_text),
          questionType: row.question_type,
          profession: row.profession,
          level: row.level,
          subject: row.subject,
          status: row.status,
          knowledgeNodeNames: [],
          tagNames: [],
          referencedPaperCount: referencedPaperCounts.get(row.id) ?? 0,
          updatedAt: row.updated_at.toISOString(),
        })),
        pagination: createPagination(queryInput, totalRow?.value ?? 0),
      };
    },
    async listPapers(queryInput) {
      const database = getDatabase();
      const conditions = createPaperConditions(queryInput);
      const rows = await database
        .select({
          id: paper.id,
          public_id: paper.public_id,
          name: paper.name,
          profession: paper.profession,
          level: paper.level,
          subject: paper.subject,
          paper_status: paper.paper_status,
          paper_type: paper.paper_type,
          year: paper.year,
          total_score: paper.total_score,
          source: paper.source,
          updated_at: paper.updated_at,
        })
        .from(paper)
        .where(and(...conditions))
        .orderBy(
          queryInput.sortOrder === "asc"
            ? asc(paper.updated_at)
            : desc(paper.updated_at),
        )
        .limit(queryInput.pageSize)
        .offset((queryInput.page - 1) * queryInput.pageSize);
      const [totalRow] = await database
        .select({ value: count() })
        .from(paper)
        .where(and(...conditions));
      const paperIds = rows.map((row) => row.id);
      const questionCounts = await listPaperQuestionCounts(database, paperIds);
      const mockExamCounts = await listMockExamCounts(database, paperIds);

      return {
        papers: rows.map((row) => ({
          publicId: row.public_id,
          name: row.name,
          profession: row.profession,
          level: row.level,
          subject: row.subject,
          paperStatus: row.paper_status,
          paperType: row.paper_type ?? "mock_paper",
          year: row.year,
          totalScore: row.total_score ?? "0.0",
          questionCount: questionCounts.get(row.id) ?? 0,
          mockExamCount: mockExamCounts.get(row.id) ?? 0,
          sourceFileName: row.source,
          publishValidationSummary:
            row.paper_status === "published" ? "published seed paper" : null,
          updatedAt: row.updated_at.toISOString(),
        })),
        pagination: createPagination(queryInput, totalRow?.value ?? 0),
      };
    },
  };
}

function createPostgresAdminAuditLogRuntimeRepository(): AdminAuditLogRuntimeRepository {
  return {
    async listAuditLogs(query) {
      return {
        auditLogs: [],
        pagination: createPagination(query, 0),
      };
    },
  };
}

function createUserConditions(query: AdminAuthOperationListQuery): SQL[] {
  const conditions: SQL[] = [];

  if (query.keyword !== null) {
    conditions.push(
      or(
        ilike(user.name, `%${query.keyword}%`),
        ilike(user.phone, `%${query.keyword}%`),
      )!,
    );
  }

  if (query.userType !== "all") {
    conditions.push(eq(user.user_type, query.userType));
  }

  if (query.status === "active" || query.status === "disabled") {
    conditions.push(eq(user.status, query.status));
  }

  return conditions;
}

function createQuestionConditions(
  queryInput: AdminContentKnowledgeListQuery,
): SQL[] {
  const conditions: SQL[] = [];

  if (queryInput.keyword !== null) {
    conditions.push(ilike(question.stem_rich_text, `%${queryInput.keyword}%`));
  }

  if (queryInput.status === "available" || queryInput.status === "disabled") {
    conditions.push(eq(question.status, queryInput.status));
  }

  if (queryInput.profession !== "all") {
    conditions.push(eq(question.profession, queryInput.profession));
  }

  if (queryInput.level !== null) {
    conditions.push(eq(question.level, queryInput.level));
  }

  return conditions;
}

function createPaperConditions(
  queryInput: AdminContentKnowledgeListQuery,
): SQL[] {
  const conditions: SQL[] = [];

  if (queryInput.keyword !== null) {
    conditions.push(ilike(paper.name, `%${queryInput.keyword}%`));
  }

  if (
    queryInput.status === "draft" ||
    queryInput.status === "published" ||
    queryInput.status === "archived"
  ) {
    conditions.push(eq(paper.paper_status, queryInput.status));
  }

  if (queryInput.profession !== "all") {
    conditions.push(eq(paper.profession, queryInput.profession));
  }

  if (queryInput.level !== null) {
    conditions.push(eq(paper.level, queryInput.level));
  }

  return conditions;
}

async function listReferencedPaperCounts(
  database: AdminFlowRuntimeDatabase,
  questionIds: number[],
): Promise<Map<number, number>> {
  if (questionIds.length === 0) {
    return new Map();
  }

  const rows = await database
    .select({
      question_id: paperQuestion.question_id,
      value: count(),
    })
    .from(paperQuestion)
    .where(inArray(paperQuestion.question_id, questionIds))
    .groupBy(paperQuestion.question_id);

  return new Map(rows.map((row) => [row.question_id, row.value]));
}

async function listPaperQuestionCounts(
  database: AdminFlowRuntimeDatabase,
  paperIds: number[],
): Promise<Map<number, number>> {
  if (paperIds.length === 0) {
    return new Map();
  }

  const rows = await database
    .select({
      paper_id: paperQuestion.paper_id,
      value: count(),
    })
    .from(paperQuestion)
    .where(inArray(paperQuestion.paper_id, paperIds))
    .groupBy(paperQuestion.paper_id);

  return new Map(rows.map((row) => [row.paper_id, row.value]));
}

async function listMockExamCounts(
  database: AdminFlowRuntimeDatabase,
  paperIds: number[],
): Promise<Map<number, number>> {
  if (paperIds.length === 0) {
    return new Map();
  }

  const rows = await database
    .select({
      paper_id: mockExam.paper_id,
      value: count(),
    })
    .from(mockExam)
    .where(inArray(mockExam.paper_id, paperIds))
    .groupBy(mockExam.paper_id);

  return new Map(rows.map((row) => [row.paper_id, row.value]));
}

function summarizeText(value: string): string {
  const plainText = value
    .replace(/<[^>]*>/gu, " ")
    .replace(/\s+/gu, " ")
    .trim();

  return plainText.length > 80 ? `${plainText.slice(0, 77)}...` : plainText;
}

function createLocalRuntimeDatabase(): AdminFlowRuntimeDatabase {
  loadLocalEnv();

  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error("DATABASE_URL is required for admin flow runtime.");
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
