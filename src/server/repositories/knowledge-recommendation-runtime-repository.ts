import { randomUUID } from "node:crypto";

import { and, eq, inArray, isNull, ne, or, sql } from "drizzle-orm";

import {
  knRecommendationCandidate,
  knRecommendationTask,
  knowledgeNode,
  knowledgeNodeResource,
  modelConfig,
  promptTemplate,
  question,
  questionKnowledgeNode,
  resource,
  resourceChunk,
  resourceIndexGeneration,
} from "@/db/schema";
import type { EvidenceStatus } from "../models/ai-rag";
import {
  createLazyRuntimeDatabaseGetter,
  type RuntimeDatabase,
  type RuntimeDatabaseOptions,
} from "./runtime-database";

export type KnowledgeRecommendationTaskStatus =
  | "pending"
  | "running"
  | "succeeded"
  | "failed"
  | "superseded";

export function shouldRestartKnowledgeRecommendationTask(
  taskStatus: KnowledgeRecommendationTaskStatus,
): boolean {
  return taskStatus === "failed";
}

export type KnowledgeRecommendationCandidateView = {
  candidatePublicId: string;
  knowledgeNodePublicId: string;
  name: string;
  pathName: string;
  rank: number;
  confidenceBasisPoint: number;
  reasonSummary: string;
  citationCount: number;
  reviewStatus: "pending" | "confirmed" | "ignored";
};

export type KnowledgeRecommendationTaskView = {
  taskPublicId: string;
  questionPublicId: string;
  questionUpdatedAt: string;
  currentQuestionUpdatedAt: string;
  taskStatus: KnowledgeRecommendationTaskStatus;
  evidenceStatus: EvidenceStatus | null;
  modelConfigPublicId: string | null;
  promptTemplatePublicId: string | null;
  failureCode: string | null;
  candidates: KnowledgeRecommendationCandidateView[];
};

export type CompleteKnowledgeRecommendationCandidateInput = {
  knowledgeNodePublicId: string;
  confidenceBasisPoint: number;
  reasonSummary: string;
  citationChunkPublicIds: string[];
};

export type CompleteKnowledgeRecommendationTaskInput =
  | {
      taskPublicId: string;
      status: "succeeded";
      modelConfigPublicId: string;
      promptTemplatePublicId: string;
      evidenceStatus: Exclude<EvidenceStatus, "none">;
      candidates: CompleteKnowledgeRecommendationCandidateInput[];
    }
  | {
      taskPublicId: string;
      status: "failed";
      failureCode: string;
    };

export type ReviewKnowledgeRecommendationTaskInput = {
  taskPublicId: string;
  questionPublicId: string;
  expectedQuestionUpdatedAt: Date;
  action: "confirm" | "ignore";
  candidatePublicIds: string[];
  reviewedByUserPublicId: string;
};

export type KnowledgeRecommendationRuntimeRepository = {
  requestKnowledgeRecommendation(
    questionPublicId: string,
    requestedByUserPublicId: string,
  ): Promise<KnowledgeRecommendationTaskView | null>;
  completeKnowledgeRecommendationTask(
    input: CompleteKnowledgeRecommendationTaskInput,
  ): Promise<KnowledgeRecommendationTaskView | null>;
  reviewKnowledgeRecommendationTask(
    input: ReviewKnowledgeRecommendationTaskInput,
  ): Promise<KnowledgeRecommendationTaskView | null>;
};

export function createPostgresKnowledgeRecommendationRuntimeRepository(
  options: RuntimeDatabaseOptions = {},
): KnowledgeRecommendationRuntimeRepository {
  const getDatabase = createLazyRuntimeDatabaseGetter(
    options,
    "DATABASE_URL is required for knowledge recommendation runtime.",
  );

  return {
    async requestKnowledgeRecommendation(
      questionPublicId,
      requestedByUserPublicId,
    ) {
      const database = getDatabase();
      const taskId = await database.transaction(async (transaction) => {
        const scopedDatabase = transaction as RuntimeDatabase;
        const questionQuery = scopedDatabase
          .select({
            id: question.id,
            status: question.status,
            updated_at: question.updated_at,
          })
          .from(question)
          .where(eq(question.public_id, questionPublicId))
          .limit(1);
        const [questionRow] = await questionQuery.for("update");

        if (questionRow === undefined || questionRow.status !== "available") {
          return null;
        }

        return enqueueKnowledgeRecommendationTask(scopedDatabase, {
          questionId: questionRow.id,
          questionUpdatedAt: questionRow.updated_at,
          requestedByUserPublicId,
        });
      });

      return taskId === null
        ? null
        : loadKnowledgeRecommendationTask(database, taskId);
    },
    async completeKnowledgeRecommendationTask(input) {
      const database = getDatabase();
      const taskId = await completeKnowledgeRecommendationTask(database, input);

      return taskId === null
        ? null
        : loadKnowledgeRecommendationTask(database, taskId);
    },
    async reviewKnowledgeRecommendationTask(input) {
      const database = getDatabase();
      const taskId = await reviewKnowledgeRecommendationTask(database, input);

      return taskId === null
        ? null
        : loadKnowledgeRecommendationTask(database, taskId);
    },
  };
}

export async function enqueueKnowledgeRecommendationTask(
  database: RuntimeDatabase,
  input: {
    questionId: number;
    questionUpdatedAt: Date;
    requestedByUserPublicId: string | null;
  },
): Promise<number | null> {
  await database
    .update(knRecommendationTask)
    .set({
      task_status: "superseded",
      completed_at: new Date(),
      updated_at: new Date(),
    })
    .where(
      and(
        eq(knRecommendationTask.question_id, input.questionId),
        ne(knRecommendationTask.question_revision_at, input.questionUpdatedAt),
        inArray(knRecommendationTask.task_status, ["pending", "running"]),
      ),
    );

  const existingTaskQuery = database
    .select({
      id: knRecommendationTask.id,
      task_status: knRecommendationTask.task_status,
    })
    .from(knRecommendationTask)
    .where(
      and(
        eq(knRecommendationTask.question_id, input.questionId),
        eq(knRecommendationTask.question_revision_at, input.questionUpdatedAt),
      ),
    )
    .limit(1);
  const [existingTask] = await existingTaskQuery.for("update");

  if (existingTask !== undefined) {
    if (shouldRestartKnowledgeRecommendationTask(existingTask.task_status)) {
      await database
        .update(knRecommendationTask)
        .set({
          request_public_id: `kn-recommendation-request-${randomUUID()}`,
          task_status: "pending",
          evidence_status: null,
          model_config_id: null,
          prompt_template_id: null,
          requested_by_user_public_id: input.requestedByUserPublicId,
          failure_code: null,
          started_at: null,
          completed_at: null,
          updated_at: new Date(),
        })
        .where(eq(knRecommendationTask.id, existingTask.id));
    }

    return existingTask.id;
  }

  await database
    .insert(knRecommendationTask)
    .values({
      public_id: `kn-recommendation-task-${randomUUID()}`,
      request_public_id: `kn-recommendation-request-${randomUUID()}`,
      question_id: input.questionId,
      question_revision_at: input.questionUpdatedAt,
      task_status: "pending",
      requested_by_user_public_id: input.requestedByUserPublicId,
    })
    .onConflictDoNothing({
      target: [
        knRecommendationTask.question_id,
        knRecommendationTask.question_revision_at,
      ],
    });
  const [taskRow] = await database
    .select({ id: knRecommendationTask.id })
    .from(knRecommendationTask)
    .where(
      and(
        eq(knRecommendationTask.question_id, input.questionId),
        eq(knRecommendationTask.question_revision_at, input.questionUpdatedAt),
      ),
    )
    .limit(1);

  return taskRow?.id ?? null;
}

export async function supersedeKnowledgeRecommendationTasks(
  database: RuntimeDatabase,
  questionId: number,
): Promise<void> {
  await database
    .update(knRecommendationTask)
    .set({
      task_status: "superseded",
      completed_at: new Date(),
      updated_at: new Date(),
    })
    .where(
      and(
        eq(knRecommendationTask.question_id, questionId),
        inArray(knRecommendationTask.task_status, ["pending", "running"]),
      ),
    );
}

async function completeKnowledgeRecommendationTask(
  database: RuntimeDatabase,
  input: CompleteKnowledgeRecommendationTaskInput,
): Promise<number | null> {
  return database.transaction(async (transaction) => {
    const scopedDatabase = transaction as RuntimeDatabase;
    const [taskReference] = await scopedDatabase
      .select({ question_id: knRecommendationTask.question_id })
      .from(knRecommendationTask)
      .where(eq(knRecommendationTask.public_id, input.taskPublicId))
      .limit(1);

    if (
      taskReference === undefined ||
      (input.status === "succeeded" &&
        !isValidCandidateInputSet(input.candidates)) ||
      (input.status === "failed" && !isValidFailureCode(input.failureCode))
    ) {
      return null;
    }

    const questionQuery = scopedDatabase
      .select({
        profession: question.profession,
        level: question.level,
        status: question.status,
        updated_at: question.updated_at,
      })
      .from(question)
      .where(eq(question.id, taskReference.question_id))
      .limit(1);
    const [questionRow] = await questionQuery.for("update");
    const taskQuery = scopedDatabase
      .select({
        id: knRecommendationTask.id,
        question_id: knRecommendationTask.question_id,
        question_revision_at: knRecommendationTask.question_revision_at,
        task_status: knRecommendationTask.task_status,
      })
      .from(knRecommendationTask)
      .where(eq(knRecommendationTask.public_id, input.taskPublicId))
      .limit(1);
    const [taskRow] = await taskQuery.for("update");

    if (
      taskRow === undefined ||
      (taskRow.task_status !== "pending" && taskRow.task_status !== "running")
    ) {
      return null;
    }

    if (input.status === "failed") {
      await scopedDatabase
        .update(knRecommendationTask)
        .set({
          task_status: "failed",
          evidence_status: "none",
          failure_code: input.failureCode.trim(),
          completed_at: new Date(),
          updated_at: new Date(),
        })
        .where(eq(knRecommendationTask.id, taskRow.id));
      return taskRow.id;
    }

    if (
      questionRow === undefined ||
      questionRow.status !== "available" ||
      questionRow.updated_at.getTime() !==
        taskRow.question_revision_at.getTime()
    ) {
      await supersedeKnowledgeRecommendationTasks(
        scopedDatabase,
        taskRow.question_id,
      );
      return null;
    }

    const [modelConfigRow] = await scopedDatabase
      .select({ id: modelConfig.id })
      .from(modelConfig)
      .where(
        and(
          eq(modelConfig.public_id, input.modelConfigPublicId),
          eq(modelConfig.ai_func_type, "kn_recommendation"),
          eq(modelConfig.is_enabled, true),
        ),
      )
      .limit(1);
    const [promptTemplateRow] = await scopedDatabase
      .select({ id: promptTemplate.id })
      .from(promptTemplate)
      .where(
        and(
          eq(promptTemplate.public_id, input.promptTemplatePublicId),
          eq(promptTemplate.ai_func_type, "kn_recommendation"),
          eq(promptTemplate.status, "published"),
          eq(promptTemplate.is_active, true),
          isNull(promptTemplate.disabled_at),
        ),
      )
      .limit(1);

    if (modelConfigRow === undefined || promptTemplateRow === undefined) {
      return null;
    }

    const knowledgeNodePublicIds = input.candidates.map(
      (candidate) => candidate.knowledgeNodePublicId,
    );
    const knowledgeNodeRows = await scopedDatabase
      .select({
        id: knowledgeNode.id,
        public_id: knowledgeNode.public_id,
        profession: knowledgeNode.profession,
        level_list: knowledgeNode.level_list,
        kn_status: knowledgeNode.kn_status,
        is_recommendable: knowledgeNode.is_recommendable,
      })
      .from(knowledgeNode)
      .where(inArray(knowledgeNode.public_id, knowledgeNodePublicIds))
      .for("share");
    const knowledgeNodeByPublicId = new Map(
      knowledgeNodeRows.map((row) => [row.public_id, row]),
    );

    if (
      knowledgeNodeByPublicId.size !== knowledgeNodePublicIds.length ||
      input.candidates.some((candidate) => {
        const row = knowledgeNodeByPublicId.get(
          candidate.knowledgeNodePublicId,
        );
        return (
          row === undefined ||
          row.profession !== questionRow.profession ||
          row.kn_status !== "active" ||
          !row.is_recommendable ||
          !isKnowledgeNodeLevelCompatible(row.level_list, questionRow.level)
        );
      })
    ) {
      return null;
    }

    const citationChunkPublicIds = [
      ...new Set(
        input.candidates.flatMap(
          (candidate) => candidate.citationChunkPublicIds,
        ),
      ),
    ];
    const citationRows = await scopedDatabase
      .select({
        chunk_public_id: resourceChunk.public_id,
        knowledge_node_id: knowledgeNodeResource.knowledge_node_id,
        generation_public_id: resourceIndexGeneration.public_id,
        resource_public_id: resource.public_id,
        content_hash: resourceChunk.content_hash,
        chunk_index: resourceChunk.chunk_index,
      })
      .from(resourceChunk)
      .innerJoin(
        resourceIndexGeneration,
        eq(
          resourceIndexGeneration.id,
          resourceChunk.resource_index_generation_id,
        ),
      )
      .innerJoin(resource, eq(resource.id, resourceChunk.resource_id))
      .innerJoin(
        knowledgeNodeResource,
        eq(knowledgeNodeResource.resource_id, resource.id),
      )
      .where(
        and(
          inArray(resourceChunk.public_id, citationChunkPublicIds),
          eq(resourceIndexGeneration.is_active, true),
          eq(resourceIndexGeneration.generation_status, "ready"),
          eq(resource.resource_status, "rag_ready"),
          eq(resource.profession, questionRow.profession),
          or(
            sql`cardinality(${resource.level_list}) = 0`,
            sql`${resource.level_list} @> ARRAY[${questionRow.level}]::integer[]`,
          ),
        ),
      );
    const citationByChunkPublicId = new Map(
      citationRows.map((row) => [
        row.chunk_public_id,
        {
          chunk_public_id: row.chunk_public_id,
          generation_public_id: row.generation_public_id,
          resource_public_id: row.resource_public_id,
          content_hash: row.content_hash,
          chunk_index: row.chunk_index,
        },
      ]),
    );
    const citationScopeKeys = new Set(
      citationRows.map((row) =>
        createKnowledgeRecommendationCitationScopeKey(
          row.chunk_public_id,
          row.knowledge_node_id,
        ),
      ),
    );
    const knowledgeNodeIdByPublicId = new Map(
      [...knowledgeNodeByPublicId].map(([publicId, row]) => [publicId, row.id]),
    );

    if (
      citationByChunkPublicId.size !== citationChunkPublicIds.length ||
      !validateKnowledgeRecommendationCitationScope({
        candidates: input.candidates,
        knowledgeNodeIdByPublicId,
        citationScopeKeys,
      })
    ) {
      return null;
    }

    await scopedDatabase.insert(knRecommendationCandidate).values(
      input.candidates.map((candidate, index) => {
        const knowledgeNodeRow = knowledgeNodeByPublicId.get(
          candidate.knowledgeNodePublicId,
        );

        if (knowledgeNodeRow === undefined) {
          throw new Error("Validated knowledge_node disappeared.");
        }

        return {
          public_id: `kn-recommendation-candidate-${randomUUID()}`,
          kn_recommendation_task_id: taskRow.id,
          knowledge_node_id: knowledgeNodeRow.id,
          rank: index + 1,
          confidence_basis_point: candidate.confidenceBasisPoint,
          reason_summary: candidate.reasonSummary,
          citation_snapshot: candidate.citationChunkPublicIds.map(
            (chunkPublicId) => citationByChunkPublicId.get(chunkPublicId),
          ),
          review_status: "pending" as const,
        };
      }),
    );
    await scopedDatabase
      .update(knRecommendationTask)
      .set({
        task_status: "succeeded",
        evidence_status: input.evidenceStatus,
        model_config_id: modelConfigRow.id,
        prompt_template_id: promptTemplateRow.id,
        failure_code: null,
        completed_at: new Date(),
        updated_at: new Date(),
      })
      .where(eq(knRecommendationTask.id, taskRow.id));

    return taskRow.id;
  });
}

async function reviewKnowledgeRecommendationTask(
  database: RuntimeDatabase,
  input: ReviewKnowledgeRecommendationTaskInput,
): Promise<number | null> {
  return database.transaction(async (transaction) => {
    const scopedDatabase = transaction as RuntimeDatabase;
    const [taskReference] = await scopedDatabase
      .select({
        question_id: knRecommendationTask.question_id,
        question_public_id: question.public_id,
      })
      .from(knRecommendationTask)
      .innerJoin(question, eq(question.id, knRecommendationTask.question_id))
      .where(eq(knRecommendationTask.public_id, input.taskPublicId))
      .limit(1);

    if (
      taskReference === undefined ||
      taskReference.question_public_id !== input.questionPublicId
    ) {
      return null;
    }

    const questionQuery = scopedDatabase
      .select({
        profession: question.profession,
        level: question.level,
        status: question.status,
        updated_at: question.updated_at,
      })
      .from(question)
      .where(eq(question.id, taskReference.question_id))
      .limit(1);
    const [questionRow] = await questionQuery.for("update");
    const taskQuery = scopedDatabase
      .select({
        id: knRecommendationTask.id,
        question_id: knRecommendationTask.question_id,
        question_revision_at: knRecommendationTask.question_revision_at,
        task_status: knRecommendationTask.task_status,
      })
      .from(knRecommendationTask)
      .where(eq(knRecommendationTask.public_id, input.taskPublicId))
      .limit(1);
    const [taskRow] = await taskQuery.for("update");

    if (
      taskRow === undefined ||
      taskRow.task_status !== "succeeded" ||
      taskRow.question_revision_at.getTime() !==
        input.expectedQuestionUpdatedAt.getTime()
    ) {
      return null;
    }

    if (
      questionRow === undefined ||
      questionRow.status !== "available" ||
      questionRow.updated_at.getTime() !==
        taskRow.question_revision_at.getTime()
    ) {
      return null;
    }

    const candidateRows = await scopedDatabase
      .select({
        id: knRecommendationCandidate.id,
        public_id: knRecommendationCandidate.public_id,
        knowledge_node_id: knRecommendationCandidate.knowledge_node_id,
        review_status: knRecommendationCandidate.review_status,
      })
      .from(knRecommendationCandidate)
      .where(
        eq(knRecommendationCandidate.kn_recommendation_task_id, taskRow.id),
      )
      .for("update");
    const selectedCandidatePublicIds = new Set(input.candidatePublicIds);

    if (
      selectedCandidatePublicIds.size !== input.candidatePublicIds.length ||
      selectedCandidatePublicIds.size === 0 ||
      input.candidatePublicIds.some(
        (publicId) =>
          !candidateRows.some((candidate) => candidate.public_id === publicId),
      ) ||
      candidateRows.some(
        (candidate) =>
          selectedCandidatePublicIds.has(candidate.public_id) &&
          candidate.review_status !== "pending",
      )
    ) {
      return null;
    }

    const reviewedAt = new Date();

    if (input.action === "confirm") {
      const selectedCandidates = candidateRows.filter((candidate) =>
        selectedCandidatePublicIds.has(candidate.public_id),
      );
      const selectedKnowledgeNodeRows = await scopedDatabase
        .select({
          id: knowledgeNode.id,
          profession: knowledgeNode.profession,
          level_list: knowledgeNode.level_list,
          kn_status: knowledgeNode.kn_status,
          is_recommendable: knowledgeNode.is_recommendable,
        })
        .from(knowledgeNode)
        .where(
          inArray(
            knowledgeNode.id,
            selectedCandidates.map((candidate) => candidate.knowledge_node_id),
          ),
        )
        .for("share");

      if (
        selectedKnowledgeNodeRows.length !== selectedCandidates.length ||
        selectedKnowledgeNodeRows.some(
          (node) =>
            node.profession !== questionRow.profession ||
            node.kn_status !== "active" ||
            !node.is_recommendable ||
            !isKnowledgeNodeLevelCompatible(node.level_list, questionRow.level),
        )
      ) {
        return null;
      }

      await scopedDatabase
        .delete(questionKnowledgeNode)
        .where(eq(questionKnowledgeNode.question_id, taskRow.question_id));
      await scopedDatabase.insert(questionKnowledgeNode).values(
        selectedCandidates.map((candidate) => ({
          question_id: taskRow.question_id,
          knowledge_node_id: candidate.knowledge_node_id,
        })),
      );
      await scopedDatabase
        .update(question)
        .set({
          updated_at: sql`greatest(
            clock_timestamp(),
            ${question.updated_at} + interval '1 millisecond'
          )`,
        })
        .where(eq(question.id, taskRow.question_id));
    }

    const candidatesToUpdate =
      input.action === "confirm"
        ? candidateRows.filter(
            (candidate) => candidate.review_status === "pending",
          )
        : candidateRows.filter((candidate) =>
            selectedCandidatePublicIds.has(candidate.public_id),
          );

    for (const candidate of candidatesToUpdate) {
      const reviewStatus = selectedCandidatePublicIds.has(candidate.public_id)
        ? input.action === "confirm"
          ? "confirmed"
          : "ignored"
        : "ignored";
      await scopedDatabase
        .update(knRecommendationCandidate)
        .set({
          review_status: reviewStatus,
          reviewed_by_user_public_id: input.reviewedByUserPublicId,
          reviewed_at: reviewedAt,
          updated_at: reviewedAt,
        })
        .where(eq(knRecommendationCandidate.id, candidate.id));
    }

    return taskRow.id;
  });
}

async function loadKnowledgeRecommendationTask(
  database: RuntimeDatabase,
  taskId: number,
): Promise<KnowledgeRecommendationTaskView | null> {
  const [taskRow] = await database
    .select({
      public_id: knRecommendationTask.public_id,
      task_status: knRecommendationTask.task_status,
      question_revision_at: knRecommendationTask.question_revision_at,
      evidence_status: knRecommendationTask.evidence_status,
      failure_code: knRecommendationTask.failure_code,
      question_public_id: question.public_id,
      question_updated_at: question.updated_at,
      model_config_public_id: modelConfig.public_id,
      prompt_template_public_id: promptTemplate.public_id,
    })
    .from(knRecommendationTask)
    .innerJoin(question, eq(question.id, knRecommendationTask.question_id))
    .leftJoin(
      modelConfig,
      eq(modelConfig.id, knRecommendationTask.model_config_id),
    )
    .leftJoin(
      promptTemplate,
      eq(promptTemplate.id, knRecommendationTask.prompt_template_id),
    )
    .where(eq(knRecommendationTask.id, taskId))
    .limit(1);

  if (taskRow === undefined) {
    return null;
  }

  const candidateRows = await database
    .select({
      public_id: knRecommendationCandidate.public_id,
      rank: knRecommendationCandidate.rank,
      confidence_basis_point: knRecommendationCandidate.confidence_basis_point,
      reason_summary: knRecommendationCandidate.reason_summary,
      citation_snapshot: knRecommendationCandidate.citation_snapshot,
      review_status: knRecommendationCandidate.review_status,
      knowledge_node_public_id: knowledgeNode.public_id,
      knowledge_node_name: knowledgeNode.name,
      knowledge_node_path_name: knowledgeNode.path_name,
    })
    .from(knRecommendationCandidate)
    .innerJoin(
      knowledgeNode,
      eq(knowledgeNode.id, knRecommendationCandidate.knowledge_node_id),
    )
    .where(eq(knRecommendationCandidate.kn_recommendation_task_id, taskId));

  return {
    taskPublicId: taskRow.public_id,
    questionPublicId: taskRow.question_public_id,
    questionUpdatedAt: taskRow.question_revision_at.toISOString(),
    currentQuestionUpdatedAt: taskRow.question_updated_at.toISOString(),
    taskStatus: taskRow.task_status,
    evidenceStatus: taskRow.evidence_status,
    modelConfigPublicId: taskRow.model_config_public_id,
    promptTemplatePublicId: taskRow.prompt_template_public_id,
    failureCode: taskRow.failure_code,
    candidates: candidateRows
      .sort((left, right) => left.rank - right.rank)
      .map((candidate) => ({
        candidatePublicId: candidate.public_id,
        knowledgeNodePublicId: candidate.knowledge_node_public_id,
        name: candidate.knowledge_node_name,
        pathName: candidate.knowledge_node_path_name,
        rank: candidate.rank,
        confidenceBasisPoint: candidate.confidence_basis_point,
        reasonSummary: candidate.reason_summary,
        citationCount: Array.isArray(candidate.citation_snapshot)
          ? candidate.citation_snapshot.length
          : 0,
        reviewStatus: candidate.review_status,
      })),
  };
}

function isValidCandidateInputSet(
  candidates: CompleteKnowledgeRecommendationCandidateInput[],
): boolean {
  const knowledgeNodePublicIds = new Set(
    candidates.map((candidate) => candidate.knowledgeNodePublicId),
  );

  return (
    candidates.length >= 1 &&
    candidates.length <= 5 &&
    knowledgeNodePublicIds.size === candidates.length &&
    candidates.every(
      (candidate) =>
        Number.isInteger(candidate.confidenceBasisPoint) &&
        candidate.confidenceBasisPoint >= 0 &&
        candidate.confidenceBasisPoint <= 10_000 &&
        candidate.reasonSummary.trim().length > 0 &&
        candidate.reasonSummary.length <= 500 &&
        candidate.citationChunkPublicIds.length >= 1 &&
        candidate.citationChunkPublicIds.length <= 3 &&
        new Set(candidate.citationChunkPublicIds).size ===
          candidate.citationChunkPublicIds.length,
    )
  );
}

function isValidFailureCode(failureCode: string): boolean {
  return (
    failureCode.trim().length > 0 &&
    failureCode.length <= 100 &&
    /^[a-z0-9_]+$/u.test(failureCode)
  );
}

function createKnowledgeRecommendationCitationScopeKey(
  chunkPublicId: string,
  knowledgeNodeId: number,
): string {
  return `${chunkPublicId}:${knowledgeNodeId}`;
}

export function validateKnowledgeRecommendationCitationScope(input: {
  candidates: Pick<
    CompleteKnowledgeRecommendationCandidateInput,
    "knowledgeNodePublicId" | "citationChunkPublicIds"
  >[];
  knowledgeNodeIdByPublicId: ReadonlyMap<string, number>;
  citationScopeKeys: ReadonlySet<string>;
}): boolean {
  return input.candidates.every((candidate) => {
    const knowledgeNodeId = input.knowledgeNodeIdByPublicId.get(
      candidate.knowledgeNodePublicId,
    );

    return (
      knowledgeNodeId !== undefined &&
      candidate.citationChunkPublicIds.every((chunkPublicId) =>
        input.citationScopeKeys.has(
          createKnowledgeRecommendationCitationScopeKey(
            chunkPublicId,
            knowledgeNodeId,
          ),
        ),
      )
    );
  });
}

function isKnowledgeNodeLevelCompatible(
  levelList: unknown,
  questionLevel: number,
): boolean {
  return (
    Array.isArray(levelList) &&
    levelList.some(
      (level) => typeof level === "number" && level === questionLevel,
    )
  );
}
