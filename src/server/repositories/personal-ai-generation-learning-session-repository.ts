import {
  aiGenerationTask,
  personalAiGenerationResult,
  personalAiLearningAnswerFeedback,
  personalAiLearningSession,
} from "@/db/schema";
import { and, count, desc, eq, sql } from "drizzle-orm";

import type { EvidenceStatus } from "../models/ai-rag";
import type {
  PersonalAiGenerationLearningAnswerBlockReason,
  PersonalAiGenerationLearningAnswerFeedbackStatus,
  PersonalAiGenerationLearningContentDomain,
  PersonalAiGenerationLearningSessionCompleteBlockReason,
  PersonalAiGenerationLearningSessionOwnerType,
} from "../models/personal-ai-generation-learning-session";
import type {
  PersonalAiGenerationLearningFormalWriteBoundaryDto,
  PersonalAiGenerationLearningSessionAnswerFeedbackDto,
  PersonalAiGenerationLearningSessionAggregateStatisticsDto,
  PersonalAiGenerationLearningSessionCompleteInputDto,
  PersonalAiGenerationLearningSessionCompleteResultDto,
  PersonalAiGenerationLearningSessionDto,
  PersonalAiGenerationLearningSessionHistoryDto,
  PersonalAiGenerationLearningSessionHistoryQueryDto,
  PersonalAiGenerationLearningSessionQuestionDto,
  PersonalAiGenerationLearningSessionRepository,
} from "../contracts/personal-ai-generation-learning-session-contract";
import {
  createLazyRuntimeDatabaseGetter,
  type RuntimeDatabase,
  type RuntimeDatabaseOptions,
} from "./runtime-database";
import {
  createPersonalAiLearningAnswerCommandCanonicalFacts,
  createPersonalAiLearningAnswerCommandDigest,
  createPersonalAiLearningCompletionSummary,
  parsePersonalAiLearningSessionLifecycle,
} from "../validators/personal-ai-generation-learning-session";
import { createHash } from "node:crypto";

type PersonalAiLearningSessionInsertValue =
  typeof personalAiLearningSession.$inferInsert;

type PersonalAiLearningAnswerFeedbackInsertValue =
  typeof personalAiLearningAnswerFeedback.$inferInsert;

export type PersonalAiGenerationLearningSessionSourceResultRow = {
  id: number;
  public_id: string;
  owner_public_id: string;
  result_task_public_id: string;
  result_task_type: string;
  result_status: string;
  actor_public_id: string;
  source_task_public_id: string;
  authorization_public_id: string;
  task_type: string;
  task_status: string;
  task_result_public_id: string | null;
  owner_type: string;
  task_owner_public_id: string;
};

export type PersonalAiGenerationLearningSessionRow = {
  id: number;
  public_id: string;
  personal_ai_generation_result_id: number;
  source_result_public_id: string;
  source_task_public_id: string;
  content_domain: string;
  owner_type: string;
  owner_public_id: string;
  actor_public_id: string;
  evidence_status: string;
  citation_count: number;
  question_count: number;
  question_snapshot: unknown;
  formal_write_boundary: unknown;
  lifecycle_schema_version: number | null;
  authorization_source: string | null;
  authorization_public_id: string | null;
  session_status: string | null;
  session_revision: number | null;
  completed_at: Date | null;
  completion_summary_snapshot: unknown;
  completion_summary_digest: string | null;
  created_at: Date;
  updated_at: Date;
};

export type PersonalAiLearningAnswerFeedbackRow = {
  id: number;
  public_id: string;
  personal_ai_learning_session_id: number;
  learning_session_public_id: string;
  session_question_public_id: string;
  actor_public_id: string;
  answer_revision: number | null;
  answer_command_digest: string | null;
  feedback_status: string;
  selected_option_labels: unknown;
  text_answer: string | null;
  is_correct: boolean | null;
  score: string | null;
  max_score: string | null;
  answer_feedback_snapshot: unknown;
  formal_write_boundary: unknown;
  submitted_at: Date;
  created_at: Date;
  updated_at: Date;
};

export type PersonalAiGenerationLearningSessionGateway = {
  findSourceResultRowByPublicId(query: {
    sourceResultPublicId: string;
    ownerPublicId: string;
    actorPublicId: string;
    sourceTaskPublicId: string;
    authorizationPublicId: string;
    ownerType: "personal" | "organization";
  }): Promise<PersonalAiGenerationLearningSessionSourceResultRow | null>;
  insertOrReuseSessionRow(input: {
    sourceResultId: number;
    session: PersonalAiGenerationLearningSessionDto;
  }): Promise<PersonalAiGenerationLearningSessionRow>;
  findSessionRowByPublicId(
    sessionPublicId: string,
  ): Promise<PersonalAiGenerationLearningSessionRow | null>;
  trySaveAnswerFeedbackRows(input: {
    sessionId: number;
    expectedAnswerRevision: number;
    expectedCurrentAnswerCommandDigest: string | null;
    answerCommandDigest: string;
    authorizationSource: "personal_auth" | "org_auth";
    authorizationPublicId: string;
    answerFeedback: PersonalAiGenerationLearningSessionAnswerFeedbackDto;
  }): Promise<PersonalAiLearningAnswerFeedbackRow[]>;
  findAnswerFeedbackRowsBySessionQuestion(query: {
    sessionPublicId: string;
    sessionQuestionPublicId: string;
  }): Promise<PersonalAiLearningAnswerFeedbackRow[]>;
  listAnswerFeedbackRowsBySessionPublicId(
    sessionPublicId: string,
  ): Promise<PersonalAiLearningAnswerFeedbackRow[]>;
  completeSession(
    input: PersonalAiGenerationLearningSessionCompleteInputDto,
  ): Promise<PersonalAiGenerationLearningSessionCompleteResultDto>;
  listSessionHistory(
    input: PersonalAiGenerationLearningSessionHistoryQueryDto,
  ): Promise<PersonalAiGenerationLearningSessionHistoryDto | null>;
  getSessionStatistics(input: {
    actorPublicId: string;
    ownerType: "personal" | "organization";
    ownerPublicId: string;
    authorizationSource: "personal_auth" | "org_auth";
    authorizationPublicId: string;
  }): Promise<PersonalAiGenerationLearningSessionAggregateStatisticsDto | null>;
};

const personalAiLearningSessionSelection = {
  id: personalAiLearningSession.id,
  public_id: personalAiLearningSession.public_id,
  personal_ai_generation_result_id:
    personalAiLearningSession.personal_ai_generation_result_id,
  source_result_public_id: personalAiLearningSession.source_result_public_id,
  source_task_public_id: personalAiLearningSession.source_task_public_id,
  content_domain: personalAiLearningSession.content_domain,
  owner_type: personalAiLearningSession.owner_type,
  owner_public_id: personalAiLearningSession.owner_public_id,
  actor_public_id: personalAiLearningSession.actor_public_id,
  evidence_status: personalAiLearningSession.evidence_status,
  citation_count: personalAiLearningSession.citation_count,
  question_count: personalAiLearningSession.question_count,
  question_snapshot: personalAiLearningSession.question_snapshot,
  formal_write_boundary: personalAiLearningSession.formal_write_boundary,
  lifecycle_schema_version: personalAiLearningSession.lifecycle_schema_version,
  authorization_source: personalAiLearningSession.authorization_source,
  authorization_public_id: personalAiLearningSession.authorization_public_id,
  session_status: personalAiLearningSession.session_status,
  session_revision: personalAiLearningSession.session_revision,
  completed_at: personalAiLearningSession.completed_at,
  completion_summary_snapshot:
    personalAiLearningSession.completion_summary_snapshot,
  completion_summary_digest:
    personalAiLearningSession.completion_summary_digest,
  created_at: personalAiLearningSession.created_at,
  updated_at: personalAiLearningSession.updated_at,
};

const personalAiLearningAnswerFeedbackSelection = {
  id: personalAiLearningAnswerFeedback.id,
  public_id: personalAiLearningAnswerFeedback.public_id,
  personal_ai_learning_session_id:
    personalAiLearningAnswerFeedback.personal_ai_learning_session_id,
  learning_session_public_id:
    personalAiLearningAnswerFeedback.learning_session_public_id,
  session_question_public_id:
    personalAiLearningAnswerFeedback.session_question_public_id,
  actor_public_id: personalAiLearningAnswerFeedback.actor_public_id,
  answer_revision: personalAiLearningAnswerFeedback.answer_revision,
  answer_command_digest: personalAiLearningAnswerFeedback.answer_command_digest,
  feedback_status: personalAiLearningAnswerFeedback.feedback_status,
  selected_option_labels:
    personalAiLearningAnswerFeedback.selected_option_labels,
  text_answer: personalAiLearningAnswerFeedback.text_answer,
  is_correct: personalAiLearningAnswerFeedback.is_correct,
  score: personalAiLearningAnswerFeedback.score,
  max_score: personalAiLearningAnswerFeedback.max_score,
  answer_feedback_snapshot:
    personalAiLearningAnswerFeedback.answer_feedback_snapshot,
  formal_write_boundary: personalAiLearningAnswerFeedback.formal_write_boundary,
  submitted_at: personalAiLearningAnswerFeedback.submitted_at,
  created_at: personalAiLearningAnswerFeedback.created_at,
  updated_at: personalAiLearningAnswerFeedback.updated_at,
};

const personalAiLearningSourceResultSelection = {
  id: personalAiGenerationResult.id,
  public_id: personalAiGenerationResult.public_id,
  owner_public_id: personalAiGenerationResult.owner_public_id,
  result_task_public_id: personalAiGenerationResult.task_public_id,
  result_task_type: personalAiGenerationResult.task_type,
  result_status: personalAiGenerationResult.result_status,
  actor_public_id: aiGenerationTask.actor_public_id,
  source_task_public_id: aiGenerationTask.public_id,
  authorization_public_id: aiGenerationTask.authorization_public_id,
  task_type: aiGenerationTask.task_type,
  task_status: aiGenerationTask.task_status,
  task_result_public_id: aiGenerationTask.result_public_id,
  owner_type: aiGenerationTask.owner_type,
  task_owner_public_id: aiGenerationTask.owner_public_id,
};

export type PersonalAiLearningHistoryCandidateRow =
  PersonalAiGenerationLearningSessionRow & {
    authoritative_result_public_id: string;
    authoritative_result_owner_public_id: string;
    authoritative_result_task_public_id: string;
    authoritative_result_task_type: string;
    authoritative_task_public_id: string;
    authoritative_task_type: string;
    authoritative_task_status: string;
    authoritative_task_result_public_id: string | null;
    authoritative_task_actor_public_id: string;
    authoritative_task_owner_type: string;
    authoritative_task_owner_public_id: string;
    authoritative_task_authorization_public_id: string;
  };

const personalAiLearningHistoryCandidateSelection = {
  ...personalAiLearningSessionSelection,
  authoritative_result_public_id: personalAiGenerationResult.public_id,
  authoritative_result_owner_public_id:
    personalAiGenerationResult.owner_public_id,
  authoritative_result_task_public_id:
    personalAiGenerationResult.task_public_id,
  authoritative_result_task_type: personalAiGenerationResult.task_type,
  authoritative_task_public_id: aiGenerationTask.public_id,
  authoritative_task_type: aiGenerationTask.task_type,
  authoritative_task_status: aiGenerationTask.task_status,
  authoritative_task_result_public_id: aiGenerationTask.result_public_id,
  authoritative_task_actor_public_id: aiGenerationTask.actor_public_id,
  authoritative_task_owner_type: aiGenerationTask.owner_type,
  authoritative_task_owner_public_id: aiGenerationTask.owner_public_id,
  authoritative_task_authorization_public_id:
    aiGenerationTask.authorization_public_id,
};

export function createPersonalAiGenerationLearningSessionRepository(
  gateway: PersonalAiGenerationLearningSessionGateway,
): PersonalAiGenerationLearningSessionRepository {
  return {
    async saveSession(session) {
      if (session.sourceResultPublicId === null) {
        return {
          status: "blocked",
          blockReason: "source_result_not_found",
        };
      }

      const sourceResult = await gateway.findSourceResultRowByPublicId({
        sourceResultPublicId: session.sourceResultPublicId,
        ownerPublicId: session.ownerPublicId,
        actorPublicId: session.actorPublicId,
        sourceTaskPublicId: session.sourceTaskPublicId,
        authorizationPublicId: session.authorizationPublicId ?? "",
        ownerType: session.ownerType,
      });

      if (
        sourceResult === null ||
        !isExactPersonalAiLearningSessionSourceBinding({
          sourceResult,
          session,
          expectedSourceResultId: sourceResult.id,
        })
      ) {
        return {
          status: "blocked",
          blockReason: "source_result_not_found",
        };
      }

      const persistedRow = await gateway.insertOrReuseSessionRow({
        sourceResultId: sourceResult.id,
        session,
      });

      let persistedSession: PersonalAiGenerationLearningSessionDto;
      try {
        persistedSession = mapLearningSessionRowToDto(persistedRow);
      } catch {
        return {
          status: "blocked",
          blockReason: "session_context_mismatch",
        };
      }

      if (
        persistedSession.sourceResultPublicId !==
          session.sourceResultPublicId ||
        persistedSession.sourceTaskPublicId !== session.sourceTaskPublicId ||
        persistedSession.ownerType !== session.ownerType ||
        persistedSession.ownerPublicId !== session.ownerPublicId ||
        persistedSession.actorPublicId !== session.actorPublicId ||
        persistedSession.authorizationSource !== session.authorizationSource ||
        persistedSession.authorizationPublicId !==
          session.authorizationPublicId ||
        persistedSession.sessionStatus !== "in_progress" ||
        persistedSession.sessionRevision !== 1 ||
        createCanonicalJsonDigest(persistedSession.questions) !==
          createCanonicalJsonDigest(session.questions)
      ) {
        return {
          status: "blocked",
          blockReason: "session_context_mismatch",
        };
      }

      return {
        status: "saved",
        blockReason: null,
      };
    },
    async findSessionByPublicId(sessionPublicId) {
      const row = await gateway.findSessionRowByPublicId(sessionPublicId);

      return row === null ? null : mapLearningSessionRowToDto(row);
    },
    async saveAnswerFeedback(input) {
      const sessionRow = await gateway.findSessionRowByPublicId(
        input.answerFeedback.sessionPublicId,
      );

      if (
        sessionRow === null ||
        sessionRow.actor_public_id !== input.answerFeedback.actorPublicId ||
        !matchesSessionAuthorization(
          sessionRow,
          input.authorizationSource,
          input.authorizationPublicId,
        )
      ) {
        return {
          status: "blocked",
          blockReason: "answer_history_unavailable",
          answerFeedback: null,
        };
      }

      const answerCommandDigest =
        createPersonalAiLearningAnswerCommandDigest(input);

      if (answerCommandDigest === null) {
        return {
          status: "blocked",
          blockReason: "answer_history_unavailable",
          answerFeedback: null,
        };
      }

      let expectedCurrentAnswerCommandDigest: string | null = null;
      let answerFeedbackForPersistence = input.answerFeedback;

      if (input.expectedAnswerRevision > 0) {
        const currentRows =
          await gateway.findAnswerFeedbackRowsBySessionQuestion({
            sessionPublicId: input.answerFeedback.sessionPublicId,
            sessionQuestionPublicId:
              input.answerFeedback.sessionQuestionPublicId,
          });

        if (currentRows.length !== 1) {
          return {
            status: "blocked",
            blockReason:
              currentRows.length === 0
                ? "answer_revision_conflict"
                : "answer_history_unavailable",
            answerFeedback: null,
          };
        }

        const currentAnswerFeedback = tryMapLearningAnswerFeedbackRowToDto(
          currentRows[0]!,
        );

        if (
          currentAnswerFeedback === null ||
          currentAnswerFeedback.answerRevision === null ||
          currentRows[0]!.answer_command_digest === null
        ) {
          return {
            status: "blocked",
            blockReason: "answer_history_unavailable",
            answerFeedback: null,
          };
        }

        if (
          currentAnswerFeedback.answerRevision !== input.expectedAnswerRevision
        ) {
          if (
            currentAnswerFeedback.answerRevision ===
              input.expectedAnswerRevision + 1 &&
            currentRows[0]!.answer_command_digest === answerCommandDigest &&
            hasSameAnswerCommandFacts(
              currentAnswerFeedback,
              input.answerFeedback,
            )
          ) {
            return {
              status: "replayed",
              blockReason: null,
              answerFeedback: currentAnswerFeedback,
            };
          }

          return {
            status: "blocked",
            blockReason: "answer_revision_conflict",
            answerFeedback: null,
          };
        }

        expectedCurrentAnswerCommandDigest =
          currentRows[0]!.answer_command_digest;
        if (
          Date.parse(currentAnswerFeedback.submittedAt) >
          Date.parse(input.answerFeedback.submittedAt)
        ) {
          answerFeedbackForPersistence = {
            ...input.answerFeedback,
            submittedAt: currentAnswerFeedback.submittedAt,
          };
        }
      }

      const savedRows = await gateway.trySaveAnswerFeedbackRows({
        sessionId: sessionRow.id,
        expectedAnswerRevision: input.expectedAnswerRevision,
        expectedCurrentAnswerCommandDigest,
        answerCommandDigest,
        authorizationSource: input.authorizationSource,
        authorizationPublicId: input.authorizationPublicId,
        answerFeedback: answerFeedbackForPersistence,
      });

      if (savedRows.length === 1) {
        const persistedAnswerFeedback = tryMapLearningAnswerFeedbackRowToDto(
          savedRows[0]!,
        );

        if (
          persistedAnswerFeedback === null ||
          persistedAnswerFeedback.answerRevision !==
            input.expectedAnswerRevision + 1 ||
          !hasSameAnswerCommandFacts(
            persistedAnswerFeedback,
            input.answerFeedback,
          )
        ) {
          return {
            status: "blocked",
            blockReason: "answer_history_unavailable",
            answerFeedback: null,
          };
        }

        return {
          status: "saved",
          blockReason: null,
          answerFeedback: persistedAnswerFeedback,
        };
      }

      if (savedRows.length !== 0) {
        return {
          status: "blocked",
          blockReason: "answer_history_unavailable",
          answerFeedback: null,
        };
      }

      const currentRows = await gateway.findAnswerFeedbackRowsBySessionQuestion(
        {
          sessionPublicId: input.answerFeedback.sessionPublicId,
          sessionQuestionPublicId: input.answerFeedback.sessionQuestionPublicId,
        },
      );

      if (currentRows.length !== 1) {
        return {
          status: "blocked",
          blockReason:
            currentRows.length === 0
              ? "answer_revision_conflict"
              : "answer_history_unavailable",
          answerFeedback: null,
        };
      }

      const currentAnswerFeedback = tryMapLearningAnswerFeedbackRowToDto(
        currentRows[0]!,
      );

      if (
        currentAnswerFeedback === null ||
        currentAnswerFeedback.answerRevision === null
      ) {
        return {
          status: "blocked",
          blockReason: "answer_history_unavailable",
          answerFeedback: null,
        };
      }

      if (
        currentAnswerFeedback !== null &&
        currentAnswerFeedback.answerRevision ===
          input.expectedAnswerRevision + 1 &&
        currentRows[0]!.answer_command_digest === answerCommandDigest &&
        hasSameAnswerCommandFacts(currentAnswerFeedback, input.answerFeedback)
      ) {
        return {
          status: "replayed",
          blockReason: null,
          answerFeedback: currentAnswerFeedback,
        };
      }

      return {
        status: "blocked",
        blockReason: "answer_revision_conflict",
        answerFeedback: null,
      };
    },
    async listAnswerFeedbackBySessionPublicId(sessionPublicId) {
      const rows =
        await gateway.listAnswerFeedbackRowsBySessionPublicId(sessionPublicId);

      return rows.map(mapLearningAnswerFeedbackRowToDto);
    },
    async validateCompletedSessionSummary(input) {
      const [sessionRow, answerRows] = await Promise.all([
        gateway.findSessionRowByPublicId(input.session.sessionPublicId),
        gateway.listAnswerFeedbackRowsBySessionPublicId(
          input.session.sessionPublicId,
        ),
      ]);

      if (sessionRow === null) {
        return false;
      }

      let persistedSession: PersonalAiGenerationLearningSessionDto;
      let persistedAnswerFeedbacks: PersonalAiGenerationLearningSessionAnswerFeedbackDto[];
      try {
        persistedSession = mapLearningSessionRowToDto(sessionRow);
        persistedAnswerFeedbacks = answerRows.map(
          mapLearningAnswerFeedbackRowToDto,
        );
      } catch {
        return false;
      }

      const canonicalPersistedAnswerFeedbacks =
        canonicalizeLearningAnswerFeedbackSet(persistedAnswerFeedbacks);
      const canonicalExpectedAnswerFeedbacks =
        canonicalizeLearningAnswerFeedbackSet(input.answerFeedbacks);

      if (
        canonicalPersistedAnswerFeedbacks === null ||
        canonicalExpectedAnswerFeedbacks === null
      ) {
        return false;
      }

      return (
        createCanonicalJsonDigest(persistedSession) ===
          createCanonicalJsonDigest(input.session) &&
        createCanonicalJsonDigest(canonicalPersistedAnswerFeedbacks) ===
          createCanonicalJsonDigest(canonicalExpectedAnswerFeedbacks) &&
        matchesPersistedLearningCompletionSummary({
          session: persistedSession,
          answerRows,
          completionSummaryDigest: sessionRow.completion_summary_digest,
        })
      );
    },
    completeSession(input) {
      return gateway.completeSession(input);
    },
    listSessionHistory(input) {
      return gateway.listSessionHistory(input);
    },
    getSessionStatistics(input) {
      return gateway.getSessionStatistics(input);
    },
  };
}

export function createPostgresPersonalAiGenerationLearningSessionRepository(
  options: RuntimeDatabaseOptions = {},
): PersonalAiGenerationLearningSessionRepository {
  const getDatabase = createLazyRuntimeDatabaseGetter(
    options,
    "DATABASE_URL is required for personal AI learning session persistence.",
  );

  return createPersonalAiGenerationLearningSessionRepository({
    async findSourceResultRowByPublicId(query) {
      const rows = await getDatabase()
        .select(personalAiLearningSourceResultSelection)
        .from(personalAiGenerationResult)
        .innerJoin(
          aiGenerationTask,
          eq(
            personalAiGenerationResult.ai_generation_task_id,
            aiGenerationTask.id,
          ),
        )
        .where(
          and(
            eq(
              personalAiGenerationResult.public_id,
              query.sourceResultPublicId,
            ),
            eq(personalAiGenerationResult.owner_public_id, query.ownerPublicId),
            eq(aiGenerationTask.actor_public_id, query.actorPublicId),
            eq(aiGenerationTask.public_id, query.sourceTaskPublicId),
            eq(
              aiGenerationTask.authorization_public_id,
              query.authorizationPublicId,
            ),
            eq(aiGenerationTask.owner_type, query.ownerType),
          ),
        )
        .limit(2);

      return rows.length === 1 ? rows[0]! : null;
    },
    async insertOrReuseSessionRow(input) {
      const database = getDatabase();
      const sourceResultPublicId = input.session.sourceResultPublicId;
      const authorizationPublicId = input.session.authorizationPublicId;

      if (sourceResultPublicId === null || authorizationPublicId === null) {
        throw new Error(
          "personal AI learning session source binding required.",
        );
      }

      return database.transaction(async (transaction) => {
        const sourceRows = await transaction
          .select(personalAiLearningSourceResultSelection)
          .from(personalAiGenerationResult)
          .innerJoin(
            aiGenerationTask,
            eq(
              personalAiGenerationResult.ai_generation_task_id,
              aiGenerationTask.id,
            ),
          )
          .where(
            and(
              eq(personalAiGenerationResult.public_id, sourceResultPublicId),
              eq(
                personalAiGenerationResult.owner_public_id,
                input.session.ownerPublicId,
              ),
              eq(aiGenerationTask.actor_public_id, input.session.actorPublicId),
              eq(aiGenerationTask.public_id, input.session.sourceTaskPublicId),
              eq(
                aiGenerationTask.authorization_public_id,
                authorizationPublicId,
              ),
              eq(aiGenerationTask.owner_type, input.session.ownerType),
            ),
          )
          .limit(2);

        if (
          sourceRows.length !== 1 ||
          !isExactPersonalAiLearningSessionSourceBinding({
            sourceResult: sourceRows[0]!,
            session: input.session,
            expectedSourceResultId: input.sourceResultId,
          })
        ) {
          throw new Error(
            "personal AI learning session source binding changed.",
          );
        }

        const [insertedRow] = await transaction
          .insert(personalAiLearningSession)
          .values(createLearningSessionInsertValue(input))
          .onConflictDoNothing({
            target: personalAiLearningSession.public_id,
          })
          .returning(personalAiLearningSessionSelection);

        if (insertedRow !== undefined) {
          return normalizeLearningSessionRow(insertedRow);
        }

        const existingRows = await transaction
          .select(personalAiLearningSessionSelection)
          .from(personalAiLearningSession)
          .where(
            eq(
              personalAiLearningSession.public_id,
              input.session.sessionPublicId,
            ),
          )
          .limit(2);

        if (existingRows.length !== 1) {
          throw new Error("personal AI learning session persistence failed.");
        }

        return normalizeLearningSessionRow(existingRows[0]!);
      });
    },
    async findSessionRowByPublicId(sessionPublicId) {
      return findLearningSessionRowByPublicId(getDatabase(), sessionPublicId);
    },
    async trySaveAnswerFeedbackRows(input) {
      const database = getDatabase();

      if (
        (input.expectedAnswerRevision === 0 &&
          input.expectedCurrentAnswerCommandDigest !== null) ||
        (input.expectedAnswerRevision > 0 &&
          input.expectedCurrentAnswerCommandDigest === null)
      ) {
        throw new Error("invalid personal AI learning answer CAS boundary.");
      }

      return database.transaction(async (transaction) => {
        const sessionRows = await transaction
          .select(personalAiLearningSessionSelection)
          .from(personalAiLearningSession)
          .where(
            and(
              eq(personalAiLearningSession.id, input.sessionId),
              eq(
                personalAiLearningSession.public_id,
                input.answerFeedback.sessionPublicId,
              ),
              eq(
                personalAiLearningSession.actor_public_id,
                input.answerFeedback.actorPublicId,
              ),
            ),
          )
          .limit(2)
          .for("update");

        if (sessionRows.length !== 1) {
          return [];
        }

        const sessionRow = normalizeLearningSessionRow(sessionRows[0]!);
        const lifecycle = parsePersonalAiLearningSessionLifecycle(sessionRow);

        if (
          lifecycle.kind !== "current" ||
          lifecycle.sessionStatus !== "in_progress" ||
          lifecycle.authorizationSource !== input.authorizationSource ||
          lifecycle.authorizationPublicId !== input.authorizationPublicId
        ) {
          return [];
        }

        const rows =
          input.expectedAnswerRevision === 0
            ? await transaction
                .insert(personalAiLearningAnswerFeedback)
                .values(createLearningAnswerFeedbackInsertValue(input))
                .onConflictDoNothing({
                  target: [
                    personalAiLearningAnswerFeedback.learning_session_public_id,
                    personalAiLearningAnswerFeedback.session_question_public_id,
                  ],
                })
                .returning(personalAiLearningAnswerFeedbackSelection)
            : await transaction
                .update(personalAiLearningAnswerFeedback)
                .set(
                  createLearningAnswerFeedbackUpdateValue(
                    input.answerFeedback,
                    input.answerCommandDigest,
                  ),
                )
                .where(
                  and(
                    eq(
                      personalAiLearningAnswerFeedback.personal_ai_learning_session_id,
                      input.sessionId,
                    ),
                    eq(
                      personalAiLearningAnswerFeedback.learning_session_public_id,
                      input.answerFeedback.sessionPublicId,
                    ),
                    eq(
                      personalAiLearningAnswerFeedback.session_question_public_id,
                      input.answerFeedback.sessionQuestionPublicId,
                    ),
                    eq(
                      personalAiLearningAnswerFeedback.actor_public_id,
                      input.answerFeedback.actorPublicId,
                    ),
                    eq(
                      personalAiLearningAnswerFeedback.answer_revision,
                      input.expectedAnswerRevision,
                    ),
                    eq(
                      personalAiLearningAnswerFeedback.answer_command_digest,
                      input.expectedCurrentAnswerCommandDigest!,
                    ),
                  ),
                )
                .returning(personalAiLearningAnswerFeedbackSelection);

        if (rows.length !== 1) {
          return rows.map(normalizeLearningAnswerFeedbackRow);
        }

        const submittedAt = new Date(input.answerFeedback.submittedAt);
        const updatedSessions = await transaction
          .update(personalAiLearningSession)
          .set({
            updated_at: sql`greatest(${personalAiLearningSession.updated_at}, ${submittedAt})`,
          })
          .where(
            and(
              eq(personalAiLearningSession.id, input.sessionId),
              eq(
                personalAiLearningSession.public_id,
                input.answerFeedback.sessionPublicId,
              ),
            ),
          )
          .returning({ id: personalAiLearningSession.id });

        if (updatedSessions.length !== 1) {
          throw new Error("personal AI learning session update failed.");
        }

        return rows.map(normalizeLearningAnswerFeedbackRow);
      });
    },
    async findAnswerFeedbackRowsBySessionQuestion(query) {
      const rows = await getDatabase()
        .select(personalAiLearningAnswerFeedbackSelection)
        .from(personalAiLearningAnswerFeedback)
        .where(
          and(
            eq(
              personalAiLearningAnswerFeedback.learning_session_public_id,
              query.sessionPublicId,
            ),
            eq(
              personalAiLearningAnswerFeedback.session_question_public_id,
              query.sessionQuestionPublicId,
            ),
          ),
        );

      return rows.map(normalizeLearningAnswerFeedbackRow);
    },
    async listAnswerFeedbackRowsBySessionPublicId(sessionPublicId) {
      const rows = await getDatabase()
        .select(personalAiLearningAnswerFeedbackSelection)
        .from(personalAiLearningAnswerFeedback)
        .where(
          eq(
            personalAiLearningAnswerFeedback.learning_session_public_id,
            sessionPublicId,
          ),
        );

      return rows.map(normalizeLearningAnswerFeedbackRow);
    },
    completeSession(input) {
      return completePersonalAiLearningSession(getDatabase(), input);
    },
    listSessionHistory(input) {
      return listPersonalAiLearningSessionHistory(getDatabase(), input);
    },
    getSessionStatistics(input) {
      return getPersonalAiLearningSessionStatistics(getDatabase(), input);
    },
  });
}

export function createLearningSessionInsertValue(input: {
  sourceResultId: number;
  session: PersonalAiGenerationLearningSessionDto;
}): PersonalAiLearningSessionInsertValue {
  if (input.session.sourceResultPublicId === null) {
    throw new Error("personal AI learning session source result is required.");
  }

  const createdAt = new Date(input.session.createdAt);

  return {
    public_id: input.session.sessionPublicId,
    personal_ai_generation_result_id: input.sourceResultId,
    source_result_public_id: input.session.sourceResultPublicId,
    source_task_public_id: input.session.sourceTaskPublicId,
    content_domain: input.session.contentDomain,
    owner_type: input.session.ownerType,
    owner_public_id: input.session.ownerPublicId,
    actor_public_id: input.session.actorPublicId,
    evidence_status: input.session.evidenceStatus,
    citation_count: input.session.citationCount,
    question_count: input.session.questionCount,
    question_snapshot: input.session.questions,
    formal_write_boundary: input.session.formalWriteBoundary,
    lifecycle_schema_version: 1,
    authorization_source: input.session.authorizationSource,
    authorization_public_id: input.session.authorizationPublicId,
    session_status: "in_progress",
    session_revision: 1,
    completed_at: null,
    completion_summary_snapshot: null,
    completion_summary_digest: null,
    created_at: createdAt,
    updated_at: createdAt,
  };
}

export function createLearningAnswerFeedbackInsertValue(input: {
  sessionId: number;
  answerFeedback: PersonalAiGenerationLearningSessionAnswerFeedbackDto;
}): PersonalAiLearningAnswerFeedbackInsertValue {
  const submittedAt = new Date(input.answerFeedback.submittedAt);
  const answerRevision = input.answerFeedback.answerRevision;
  const answerCommandDigest = createPersonalAiLearningAnswerCommandDigest({
    expectedAnswerRevision:
      answerRevision === null ? Number.NaN : answerRevision - 1,
    answerFeedback: input.answerFeedback,
  });

  if (answerRevision === null || answerCommandDigest === null) {
    throw new Error("invalid personal AI learning answer command.");
  }

  return {
    public_id: createLearningAnswerFeedbackPublicId(input.answerFeedback),
    personal_ai_learning_session_id: input.sessionId,
    learning_session_public_id: input.answerFeedback.sessionPublicId,
    session_question_public_id: input.answerFeedback.sessionQuestionPublicId,
    actor_public_id: input.answerFeedback.actorPublicId,
    answer_revision: answerRevision,
    answer_command_digest: answerCommandDigest,
    feedback_status: input.answerFeedback.status,
    selected_option_labels: input.answerFeedback.selectedOptionLabels,
    text_answer: input.answerFeedback.textAnswer,
    is_correct: input.answerFeedback.isCorrect,
    score: input.answerFeedback.score,
    max_score: input.answerFeedback.maxScore,
    answer_feedback_snapshot: input.answerFeedback,
    formal_write_boundary: input.answerFeedback.formalWriteBoundary,
    submitted_at: submittedAt,
    created_at: submittedAt,
    updated_at: submittedAt,
  };
}

function createLearningAnswerFeedbackUpdateValue(
  answerFeedback: PersonalAiGenerationLearningSessionAnswerFeedbackDto,
  answerCommandDigest: string,
) {
  const submittedAt = new Date(answerFeedback.submittedAt);

  return {
    actor_public_id: answerFeedback.actorPublicId,
    answer_revision: sql`${personalAiLearningAnswerFeedback.answer_revision} + 1`,
    answer_command_digest: answerCommandDigest,
    feedback_status: answerFeedback.status,
    selected_option_labels: answerFeedback.selectedOptionLabels,
    text_answer: answerFeedback.textAnswer,
    is_correct: answerFeedback.isCorrect,
    score: answerFeedback.score,
    max_score: answerFeedback.maxScore,
    answer_feedback_snapshot: answerFeedback,
    formal_write_boundary: answerFeedback.formalWriteBoundary,
    submitted_at: sql`greatest(${personalAiLearningAnswerFeedback.submitted_at}, ${submittedAt})`,
    updated_at: sql`greatest(${personalAiLearningAnswerFeedback.updated_at}, ${submittedAt})`,
  };
}

function createLearningAnswerFeedbackPublicId(
  answerFeedback: PersonalAiGenerationLearningSessionAnswerFeedbackDto,
): string {
  return `${answerFeedback.sessionPublicId}_${answerFeedback.sessionQuestionPublicId}_feedback`;
}

async function completePersonalAiLearningSession(
  database: RuntimeDatabase,
  input: PersonalAiGenerationLearningSessionCompleteInputDto,
): Promise<PersonalAiGenerationLearningSessionCompleteResultDto> {
  if (
    !Number.isInteger(input.expectedSessionRevision) ||
    input.expectedSessionRevision < 1 ||
    input.expectedSessionRevision >= 2_147_483_647 ||
    !Number.isFinite(input.completedAt.getTime())
  ) {
    return blockSessionCompletion("session_revision_conflict");
  }

  return database.transaction(async (transaction) => {
    const sessionRows = await transaction
      .select(personalAiLearningSessionSelection)
      .from(personalAiLearningSession)
      .where(
        and(
          eq(personalAiLearningSession.public_id, input.sessionPublicId),
          eq(personalAiLearningSession.actor_public_id, input.actorPublicId),
        ),
      )
      .limit(2)
      .for("update");

    if (sessionRows.length !== 1) {
      return blockSessionCompletion("session_not_found");
    }

    const row = normalizeLearningSessionRow(sessionRows[0]!);
    const lifecycle = parsePersonalAiLearningSessionLifecycle(row);

    if (
      lifecycle.kind !== "current" ||
      lifecycle.authorizationSource !== input.authorizationSource ||
      lifecycle.authorizationPublicId !== input.authorizationPublicId
    ) {
      return blockSessionCompletion(
        lifecycle.kind === "legacy"
          ? "session_lifecycle_unavailable"
          : "actor_not_allowed",
      );
    }

    const answerRows = await transaction
      .select(personalAiLearningAnswerFeedbackSelection)
      .from(personalAiLearningAnswerFeedback)
      .where(
        and(
          eq(
            personalAiLearningAnswerFeedback.personal_ai_learning_session_id,
            row.id,
          ),
          eq(
            personalAiLearningAnswerFeedback.learning_session_public_id,
            row.public_id,
          ),
          eq(
            personalAiLearningAnswerFeedback.actor_public_id,
            row.actor_public_id,
          ),
        ),
      );

    let session: PersonalAiGenerationLearningSessionDto;
    try {
      session = mapLearningSessionRowToDto(row);
    } catch {
      return blockSessionCompletion("session_integrity_unavailable");
    }

    const summary = createPersistedLearningCompletionSummary({
      session,
      answerRows: answerRows.map(normalizeLearningAnswerFeedbackRow),
      sessionRevision:
        lifecycle.sessionStatus === "completed"
          ? lifecycle.sessionRevision
          : input.expectedSessionRevision + 1,
    });

    if (summary === null) {
      return blockSessionCompletion("session_answer_set_incomplete");
    }

    if (lifecycle.sessionStatus === "completed") {
      return lifecycle.sessionRevision === input.expectedSessionRevision + 1 &&
        lifecycle.completedAt !== null &&
        lifecycle.completionSummarySnapshot !== null &&
        lifecycle.completionSummaryDigest === summary.digest &&
        createCanonicalJsonDigest(lifecycle.completionSummarySnapshot) ===
          createCanonicalJsonDigest(summary.snapshot)
        ? {
            status: "replayed",
            blockReason: null,
            sessionRevision: lifecycle.sessionRevision,
            completedAt: lifecycle.completedAt.toISOString(),
            completionSummary: { ...lifecycle.completionSummarySnapshot },
          }
        : blockSessionCompletion("session_revision_conflict");
    }

    if (lifecycle.sessionRevision !== input.expectedSessionRevision) {
      return blockSessionCompletion("session_revision_conflict");
    }

    const completedAt = new Date(
      Math.max(
        input.completedAt.getTime(),
        row.created_at.getTime(),
        row.updated_at.getTime(),
      ),
    );
    const updatedRows = await transaction
      .update(personalAiLearningSession)
      .set({
        session_status: "completed",
        session_revision: input.expectedSessionRevision + 1,
        completed_at: completedAt,
        completion_summary_snapshot: summary.snapshot,
        completion_summary_digest: summary.digest,
        updated_at: completedAt,
      })
      .where(
        and(
          eq(personalAiLearningSession.id, row.id),
          eq(personalAiLearningSession.public_id, row.public_id),
          eq(personalAiLearningSession.actor_public_id, input.actorPublicId),
          eq(
            personalAiLearningSession.authorization_source,
            input.authorizationSource,
          ),
          eq(
            personalAiLearningSession.authorization_public_id,
            input.authorizationPublicId,
          ),
          eq(personalAiLearningSession.session_status, "in_progress"),
          eq(
            personalAiLearningSession.session_revision,
            input.expectedSessionRevision,
          ),
        ),
      )
      .returning({
        id: personalAiLearningSession.id,
        session_revision: personalAiLearningSession.session_revision,
        completed_at: personalAiLearningSession.completed_at,
      });

    if (
      updatedRows.length !== 1 ||
      updatedRows[0]!.session_revision !== input.expectedSessionRevision + 1 ||
      updatedRows[0]!.completed_at === null
    ) {
      throw new Error("personal AI learning session completion CAS failed.");
    }

    return {
      status: "completed",
      blockReason: null,
      sessionRevision: updatedRows[0]!.session_revision,
      completedAt: updatedRows[0]!.completed_at.toISOString(),
      completionSummary: { ...summary.snapshot },
    };
  });
}

function blockSessionCompletion(
  blockReason: PersonalAiGenerationLearningSessionCompleteBlockReason,
): PersonalAiGenerationLearningSessionCompleteResultDto {
  return {
    status: "blocked",
    blockReason,
    sessionRevision: null,
    completedAt: null,
    completionSummary: null,
  };
}

function createPersistedLearningCompletionSummary(input: {
  session: PersonalAiGenerationLearningSessionDto;
  answerRows: PersonalAiLearningAnswerFeedbackRow[];
  sessionRevision: number;
}): ReturnType<typeof createPersonalAiLearningCompletionSummary> {
  if (
    input.session.lifecycleAvailability !== "current" ||
    input.session.authorizationSource === null ||
    input.session.authorizationPublicId === null ||
    input.session.sourceResultPublicId === null
  ) {
    return null;
  }

  const answerFeedbacks = mapValidatedCurrentAnswerRows(input);

  if (answerFeedbacks === null) {
    return null;
  }

  const questionSnapshotDigest = createCanonicalJsonDigest(
    input.session.questions,
  );

  if (questionSnapshotDigest === null) {
    return null;
  }

  return createPersonalAiLearningCompletionSummary({
    sessionPublicId: input.session.sessionPublicId,
    sessionRevision: input.sessionRevision,
    actorPublicId: input.session.actorPublicId,
    ownerType: input.session.ownerType,
    ownerPublicId: input.session.ownerPublicId,
    authorizationSource: input.session.authorizationSource,
    authorizationPublicId: input.session.authorizationPublicId,
    sourceResultPublicId: input.session.sourceResultPublicId,
    sourceTaskPublicId: input.session.sourceTaskPublicId,
    questionSnapshotDigest,
    questions: input.session.questions.map((question) => ({
      sessionQuestionPublicId: question.sessionQuestionPublicId,
      maxScore: question.maxScore,
    })),
    answerFeedbacks: answerFeedbacks.map((answerFeedback) => ({
      sessionQuestionPublicId: answerFeedback.sessionQuestionPublicId,
      status:
        answerFeedback.status === "scored"
          ? "scored"
          : "submitted_review_required",
      isCorrect: answerFeedback.isCorrect,
      score: answerFeedback.score,
      maxScore: answerFeedback.maxScore,
    })),
  });
}

function mapValidatedCurrentAnswerRows(input: {
  session: PersonalAiGenerationLearningSessionDto;
  answerRows: PersonalAiLearningAnswerFeedbackRow[];
}): PersonalAiGenerationLearningSessionAnswerFeedbackDto[] | null {
  if (input.session.lifecycleAvailability !== "current") {
    return null;
  }

  let answerFeedbacks: PersonalAiGenerationLearningSessionAnswerFeedbackDto[];
  try {
    answerFeedbacks = input.answerRows.map(mapLearningAnswerFeedbackRowToDto);
  } catch {
    return null;
  }

  const questionByPublicId = new Map(
    input.session.questions.map((question) => [
      question.sessionQuestionPublicId,
      question,
    ]),
  );
  const observedQuestionPublicIds = new Set<string>();

  for (const answerFeedback of answerFeedbacks) {
    const question = questionByPublicId.get(
      answerFeedback.sessionQuestionPublicId,
    );
    if (
      question === undefined ||
      observedQuestionPublicIds.has(answerFeedback.sessionQuestionPublicId) ||
      answerFeedback.sessionPublicId !== input.session.sessionPublicId ||
      answerFeedback.actorPublicId !== input.session.actorPublicId ||
      answerFeedback.answerRevision === null ||
      answerFeedback.status === "blocked" ||
      answerFeedback.maxScore !== question.maxScore ||
      createCanonicalJsonDigest(answerFeedback.standardAnswerLabels) !==
        createCanonicalJsonDigest(question.standardAnswerLabels) ||
      answerFeedback.standardAnswerText !== question.standardAnswerText ||
      answerFeedback.analysis !== question.analysis
    ) {
      return null;
    }

    observedQuestionPublicIds.add(answerFeedback.sessionQuestionPublicId);
  }

  return answerFeedbacks;
}

function matchesPersistedLearningCompletionSummary(input: {
  session: PersonalAiGenerationLearningSessionDto;
  answerRows: PersonalAiLearningAnswerFeedbackRow[];
  completionSummaryDigest: string | null;
}): boolean {
  if (
    input.session.sessionStatus !== "completed" ||
    input.session.sessionRevision === null ||
    input.session.completionSummary === null
  ) {
    return false;
  }

  const summary = createPersistedLearningCompletionSummary({
    ...input,
    sessionRevision: input.session.sessionRevision,
  });

  return (
    summary !== null &&
    input.completionSummaryDigest === summary.digest &&
    createCanonicalJsonDigest(input.session.completionSummary) ===
      createCanonicalJsonDigest(summary.snapshot)
  );
}

function createCanonicalJsonDigest(value: unknown): string | null {
  const canonical = canonicalizeJson(value);
  return canonical === null
    ? null
    : createHash("sha256").update(canonical, "utf8").digest("hex");
}

function canonicalizeLearningAnswerFeedbackSet(
  answerFeedbacks: PersonalAiGenerationLearningSessionAnswerFeedbackDto[],
): PersonalAiGenerationLearningSessionAnswerFeedbackDto[] | null {
  if (
    !Array.isArray(answerFeedbacks) ||
    answerFeedbacks.some((_, index) => !Object.hasOwn(answerFeedbacks, index))
  ) {
    return null;
  }

  const canonicalAnswerFeedbacks = [...answerFeedbacks].sort((left, right) =>
    left.sessionQuestionPublicId < right.sessionQuestionPublicId
      ? -1
      : left.sessionQuestionPublicId > right.sessionQuestionPublicId
        ? 1
        : 0,
  );

  for (let index = 1; index < canonicalAnswerFeedbacks.length; index += 1) {
    if (
      canonicalAnswerFeedbacks[index - 1]!.sessionQuestionPublicId ===
      canonicalAnswerFeedbacks[index]!.sessionQuestionPublicId
    ) {
      return null;
    }
  }

  return canonicalAnswerFeedbacks;
}

function canonicalizeJson(value: unknown): string | null {
  if (
    value === null ||
    typeof value === "boolean" ||
    typeof value === "string"
  ) {
    return JSON.stringify(value);
  }
  if (typeof value === "number") {
    return Number.isFinite(value) ? JSON.stringify(value) : null;
  }
  if (Array.isArray(value)) {
    const items: string[] = [];
    for (let index = 0; index < value.length; index += 1) {
      if (!Object.hasOwn(value, index)) {
        return null;
      }
      const item = canonicalizeJson(value[index]);
      if (item === null) {
        return null;
      }
      items.push(item);
    }
    return `[${items.join(",")}]`;
  }
  if (typeof value !== "object") {
    return null;
  }
  const object = value as Record<string, unknown>;
  const parts: string[] = [];
  for (const key of Object.keys(object).sort()) {
    const nested = canonicalizeJson(object[key]);
    if (nested === null) {
      return null;
    }
    parts.push(`${JSON.stringify(key)}:${nested}`);
  }
  return `{${parts.join(",")}}`;
}

export function isExactPersonalAiLearningSessionSourceBinding(input: {
  sourceResult: PersonalAiGenerationLearningSessionSourceResultRow;
  session: PersonalAiGenerationLearningSessionDto;
  expectedSourceResultId: number;
}): boolean {
  const { sourceResult, session } = input;
  const expectedAuthorizationSource =
    session.ownerType === "personal" ? "personal_auth" : "org_auth";

  return (
    session.lifecycleAvailability === "current" &&
    session.sourceResultPublicId !== null &&
    session.authorizationSource === expectedAuthorizationSource &&
    session.authorizationPublicId !== null &&
    sourceResult.id === input.expectedSourceResultId &&
    sourceResult.public_id === session.sourceResultPublicId &&
    sourceResult.owner_public_id === session.ownerPublicId &&
    sourceResult.result_task_public_id === session.sourceTaskPublicId &&
    sourceResult.result_task_public_id === sourceResult.source_task_public_id &&
    sourceResult.result_task_type === sourceResult.task_type &&
    sourceResult.result_status === "draft" &&
    sourceResult.actor_public_id === session.actorPublicId &&
    sourceResult.source_task_public_id === session.sourceTaskPublicId &&
    sourceResult.authorization_public_id === session.authorizationPublicId &&
    (sourceResult.task_type === "ai_question_generation" ||
      sourceResult.task_type === "ai_paper_generation") &&
    sourceResult.task_status === "succeeded" &&
    sourceResult.task_result_public_id === session.sourceResultPublicId &&
    sourceResult.owner_type === session.ownerType &&
    sourceResult.task_owner_public_id === session.ownerPublicId
  );
}

function createHistoryAuthoritativePartitionCondition(input: {
  actorPublicId: string;
  ownerType: "personal" | "organization";
  ownerPublicId: string;
  authorizationSource: "personal_auth" | "org_auth";
  authorizationPublicId: string;
}) {
  return and(
    eq(aiGenerationTask.actor_public_id, input.actorPublicId),
    eq(aiGenerationTask.authorization_public_id, input.authorizationPublicId),
  );
}

export function hasExactPersonalAiLearningHistoryCandidateBinding(
  row: PersonalAiLearningHistoryCandidateRow,
  input: {
    actorPublicId: string;
    ownerType: "personal" | "organization";
    ownerPublicId: string;
    authorizationSource: "personal_auth" | "org_auth";
    authorizationPublicId: string;
  },
): boolean {
  const expectedOwnerType =
    input.authorizationSource === "personal_auth" ? "personal" : "organization";
  const lifecycle = parsePersonalAiLearningSessionLifecycle(row);

  if (
    lifecycle.kind === "corrupt" ||
    input.ownerType !== expectedOwnerType ||
    (input.ownerType === "personal" &&
      input.ownerPublicId !== input.actorPublicId) ||
    row.authoritative_task_actor_public_id !== input.actorPublicId ||
    row.authoritative_task_authorization_public_id !==
      input.authorizationPublicId ||
    row.authoritative_task_owner_type !== input.ownerType ||
    row.authoritative_task_owner_public_id !== input.ownerPublicId ||
    row.authoritative_task_owner_public_id !== row.owner_public_id ||
    row.authoritative_result_owner_public_id !== row.owner_public_id ||
    row.authoritative_result_public_id !== row.source_result_public_id ||
    row.authoritative_result_task_public_id !== row.source_task_public_id ||
    row.authoritative_task_public_id !== row.source_task_public_id ||
    row.authoritative_result_task_public_id !==
      row.authoritative_task_public_id ||
    row.authoritative_result_task_type !== row.authoritative_task_type ||
    (row.authoritative_task_type !== "ai_question_generation" &&
      row.authoritative_task_type !== "ai_paper_generation") ||
    row.authoritative_task_status !== "succeeded" ||
    row.authoritative_task_result_public_id !==
      row.authoritative_result_public_id ||
    row.actor_public_id !== row.authoritative_task_actor_public_id ||
    row.owner_type !== row.authoritative_task_owner_type
  ) {
    return false;
  }

  return (
    lifecycle.kind === "legacy" ||
    (lifecycle.authorizationSource === input.authorizationSource &&
      lifecycle.authorizationPublicId === input.authorizationPublicId)
  );
}

async function listPersonalAiLearningSessionHistory(
  database: RuntimeDatabase,
  input: PersonalAiGenerationLearningSessionHistoryQueryDto,
): Promise<PersonalAiGenerationLearningSessionHistoryDto | null> {
  if (
    !Number.isInteger(input.page) ||
    input.page < 1 ||
    !Number.isInteger(input.pageSize) ||
    input.pageSize < 1 ||
    input.pageSize > 100
  ) {
    return null;
  }

  const where = createHistoryAuthoritativePartitionCondition(input);

  return database.transaction(
    async (transaction) => {
      const validationRows = await transaction
        .select(personalAiLearningHistoryCandidateSelection)
        .from(personalAiLearningSession)
        .innerJoin(
          personalAiGenerationResult,
          eq(
            personalAiLearningSession.personal_ai_generation_result_id,
            personalAiGenerationResult.id,
          ),
        )
        .innerJoin(
          aiGenerationTask,
          eq(
            personalAiGenerationResult.ai_generation_task_id,
            aiGenerationTask.id,
          ),
        )
        .where(where);

      if (
        validationRows.some(
          (row) =>
            !hasExactPersonalAiLearningHistoryCandidateBinding(row, input),
        )
      ) {
        return null;
      }

      const totalRows = await transaction
        .select({ total: count() })
        .from(personalAiLearningSession)
        .innerJoin(
          personalAiGenerationResult,
          eq(
            personalAiLearningSession.personal_ai_generation_result_id,
            personalAiGenerationResult.id,
          ),
        )
        .innerJoin(
          aiGenerationTask,
          eq(
            personalAiGenerationResult.ai_generation_task_id,
            aiGenerationTask.id,
          ),
        )
        .where(where);
      const total = Number(totalRows[0]?.total ?? 0);
      const rows = await transaction
        .select(personalAiLearningHistoryCandidateSelection)
        .from(personalAiLearningSession)
        .innerJoin(
          personalAiGenerationResult,
          eq(
            personalAiLearningSession.personal_ai_generation_result_id,
            personalAiGenerationResult.id,
          ),
        )
        .innerJoin(
          aiGenerationTask,
          eq(
            personalAiGenerationResult.ai_generation_task_id,
            aiGenerationTask.id,
          ),
        )
        .where(where)
        .orderBy(
          desc(personalAiLearningSession.created_at),
          desc(personalAiLearningSession.id),
        )
        .limit(input.pageSize)
        .offset((input.page - 1) * input.pageSize);
      const sessions: PersonalAiGenerationLearningSessionHistoryDto["sessions"] =
        [];

      for (const rawRow of rows) {
        let session: PersonalAiGenerationLearningSessionDto;
        try {
          if (
            !hasExactPersonalAiLearningHistoryCandidateBinding(rawRow, input)
          ) {
            return null;
          }
          session = mapLearningSessionRowToDto(
            normalizeLearningSessionRow(rawRow),
          );
        } catch {
          return null;
        }

        const answerRows =
          session.lifecycleAvailability === "current"
            ? await transaction
                .select(personalAiLearningAnswerFeedbackSelection)
                .from(personalAiLearningAnswerFeedback)
                .where(
                  and(
                    eq(
                      personalAiLearningAnswerFeedback.personal_ai_learning_session_id,
                      rawRow.id,
                    ),
                    eq(
                      personalAiLearningAnswerFeedback.learning_session_public_id,
                      session.sessionPublicId,
                    ),
                    eq(
                      personalAiLearningAnswerFeedback.actor_public_id,
                      input.actorPublicId,
                    ),
                  ),
                )
            : [];

        const normalizedAnswerRows = answerRows.map(
          normalizeLearningAnswerFeedbackRow,
        );
        const currentAnswerFeedbacks =
          session.lifecycleAvailability === "current"
            ? mapValidatedCurrentAnswerRows({
                session,
                answerRows: normalizedAnswerRows,
              })
            : [];

        if (
          currentAnswerFeedbacks === null ||
          (session.sessionStatus === "completed" &&
            !matchesPersistedLearningCompletionSummary({
              session,
              answerRows: normalizedAnswerRows,
              completionSummaryDigest: rawRow.completion_summary_digest,
            }))
        ) {
          return null;
        }

        let submittedCount: number | null = null;
        if (
          session.lifecycleAvailability === "current" &&
          session.sessionStatus === "in_progress"
        ) {
          submittedCount = currentAnswerFeedbacks.length;
        } else if (session.completionSummary !== null) {
          submittedCount = session.completionSummary.submittedCount;
        }

        sessions.push({
          sessionPublicId: session.sessionPublicId,
          sourceResultPublicId: session.sourceResultPublicId,
          sourceTaskPublicId: session.sourceTaskPublicId,
          lifecycleAvailability: session.lifecycleAvailability,
          sessionStatus: session.sessionStatus,
          sessionRevision: session.sessionRevision,
          questionCount: session.questionCount,
          submittedCount,
          completionRate:
            session.completionSummary?.completionRate ??
            (submittedCount === null || session.questionCount === 0
              ? null
              : Number((submittedCount / session.questionCount).toFixed(4))),
          score: session.completionSummary?.score ?? null,
          maxScore: session.completionSummary?.maxScore ?? null,
          canResume: session.sessionStatus === "in_progress",
          canReview: session.sessionStatus === "completed",
          canComplete:
            session.sessionStatus === "in_progress" &&
            submittedCount === session.questionCount,
          createdAt: session.createdAt,
          updatedAt: session.updatedAt,
          completedAt: session.completedAt,
        });
      }

      return {
        sessions,
        page: input.page,
        pageSize: input.pageSize,
        total,
        totalPages: total === 0 ? 0 : Math.ceil(total / input.pageSize),
      };
    },
    {
      isolationLevel: "repeatable read",
      accessMode: "read only",
    },
  );
}

async function getPersonalAiLearningSessionStatistics(
  database: RuntimeDatabase,
  input: {
    actorPublicId: string;
    ownerType: "personal" | "organization";
    ownerPublicId: string;
    authorizationSource: "personal_auth" | "org_auth";
    authorizationPublicId: string;
  },
): Promise<PersonalAiGenerationLearningSessionAggregateStatisticsDto | null> {
  const where = createHistoryAuthoritativePartitionCondition(input);
  return database.transaction(
    async (transaction) => {
      const validationRows = await transaction
        .select(personalAiLearningHistoryCandidateSelection)
        .from(personalAiLearningSession)
        .innerJoin(
          personalAiGenerationResult,
          eq(
            personalAiLearningSession.personal_ai_generation_result_id,
            personalAiGenerationResult.id,
          ),
        )
        .innerJoin(
          aiGenerationTask,
          eq(
            personalAiGenerationResult.ai_generation_task_id,
            aiGenerationTask.id,
          ),
        )
        .where(where);

      for (const rawRow of validationRows) {
        let session: PersonalAiGenerationLearningSessionDto;
        try {
          if (
            !hasExactPersonalAiLearningHistoryCandidateBinding(rawRow, input)
          ) {
            return null;
          }
          session = mapLearningSessionRowToDto(
            normalizeLearningSessionRow(rawRow),
          );
        } catch {
          return null;
        }

        if (session.lifecycleAvailability !== "current") {
          return null;
        }

        if (session.sessionStatus === "completed") {
          const answerRows = await transaction
            .select(personalAiLearningAnswerFeedbackSelection)
            .from(personalAiLearningAnswerFeedback)
            .where(
              and(
                eq(
                  personalAiLearningAnswerFeedback.personal_ai_learning_session_id,
                  rawRow.id,
                ),
                eq(
                  personalAiLearningAnswerFeedback.learning_session_public_id,
                  session.sessionPublicId,
                ),
                eq(
                  personalAiLearningAnswerFeedback.actor_public_id,
                  input.actorPublicId,
                ),
              ),
            );

          if (
            !matchesPersistedLearningCompletionSummary({
              session,
              answerRows: answerRows.map(normalizeLearningAnswerFeedbackRow),
              completionSummaryDigest: rawRow.completion_summary_digest,
            })
          ) {
            return null;
          }
        }
      }

      const rows = await transaction
        .select({
          attemptCount: count(),
          unavailableCount:
            sql<number>`count(*) filter (where ${personalAiLearningSession.lifecycle_schema_version} is null)`.mapWith(
              Number,
            ),
          inProgressCount:
            sql<number>`count(*) filter (where ${personalAiLearningSession.session_status} = 'in_progress')`.mapWith(
              Number,
            ),
          completedCount:
            sql<number>`count(*) filter (where ${personalAiLearningSession.session_status} = 'completed')`.mapWith(
              Number,
            ),
          completedQuestionCount:
            sql<number>`coalesce(sum((${personalAiLearningSession.completion_summary_snapshot}->>'questionCount')::int) filter (where ${personalAiLearningSession.session_status} = 'completed'), 0)`.mapWith(
              Number,
            ),
          submittedCount:
            sql<number>`coalesce(sum((${personalAiLearningSession.completion_summary_snapshot}->>'submittedCount')::int) filter (where ${personalAiLearningSession.session_status} = 'completed'), 0)`.mapWith(
              Number,
            ),
          correctCount:
            sql<number>`coalesce(sum((${personalAiLearningSession.completion_summary_snapshot}->>'correctCount')::int) filter (where ${personalAiLearningSession.session_status} = 'completed'), 0)`.mapWith(
              Number,
            ),
          incorrectCount:
            sql<number>`coalesce(sum((${personalAiLearningSession.completion_summary_snapshot}->>'incorrectCount')::int) filter (where ${personalAiLearningSession.session_status} = 'completed'), 0)`.mapWith(
              Number,
            ),
          reviewRequiredCount:
            sql<number>`coalesce(sum((${personalAiLearningSession.completion_summary_snapshot}->>'reviewRequiredCount')::int) filter (where ${personalAiLearningSession.session_status} = 'completed'), 0)`.mapWith(
              Number,
            ),
          score:
            sql<number>`coalesce(sum((${personalAiLearningSession.completion_summary_snapshot}->>'score')::numeric) filter (where ${personalAiLearningSession.session_status} = 'completed'), 0)`.mapWith(
              Number,
            ),
          maxScore:
            sql<number>`coalesce(sum((${personalAiLearningSession.completion_summary_snapshot}->>'maxScore')::numeric) filter (where ${personalAiLearningSession.session_status} = 'completed'), 0)`.mapWith(
              Number,
            ),
        })
        .from(personalAiLearningSession)
        .innerJoin(
          personalAiGenerationResult,
          eq(
            personalAiLearningSession.personal_ai_generation_result_id,
            personalAiGenerationResult.id,
          ),
        )
        .innerJoin(
          aiGenerationTask,
          eq(
            personalAiGenerationResult.ai_generation_task_id,
            aiGenerationTask.id,
          ),
        )
        .where(where);
      const row = rows[0];

      if (row === undefined || row.unavailableCount > 0) {
        return null;
      }

      const objectiveCount = row.correctCount + row.incorrectCount;
      return {
        attemptCount: Number(row.attemptCount),
        inProgressCount: row.inProgressCount,
        completedCount: row.completedCount,
        completedQuestionCount: row.completedQuestionCount,
        submittedCount: row.submittedCount,
        correctCount: row.correctCount,
        incorrectCount: row.incorrectCount,
        reviewRequiredCount: row.reviewRequiredCount,
        completionRate:
          row.completedQuestionCount === 0
            ? null
            : Number(
                (row.submittedCount / row.completedQuestionCount).toFixed(4),
              ),
        accuracyRate:
          objectiveCount === 0
            ? null
            : Number((row.correctCount / objectiveCount).toFixed(4)),
        score: Number(row.score).toFixed(1),
        maxScore: Number(row.maxScore).toFixed(1),
      };
    },
    {
      isolationLevel: "repeatable read",
      accessMode: "read only",
    },
  );
}

async function findLearningSessionRowByPublicId(
  database: RuntimeDatabase,
  sessionPublicId: string,
): Promise<PersonalAiGenerationLearningSessionRow | null> {
  const [row] = await database
    .select(personalAiLearningSessionSelection)
    .from(personalAiLearningSession)
    .where(eq(personalAiLearningSession.public_id, sessionPublicId))
    .limit(1);

  return row === undefined ? null : normalizeLearningSessionRow(row);
}

function mapLearningSessionRowToDto(
  row: PersonalAiGenerationLearningSessionRow,
): PersonalAiGenerationLearningSessionDto {
  const lifecycle = parsePersonalAiLearningSessionLifecycle(row);

  if (lifecycle.kind === "corrupt") {
    throw new Error("invalid personal AI learning session lifecycle.");
  }

  return {
    sessionPublicId: row.public_id,
    contentDomain: toContentDomain(row.content_domain),
    sourceResultPublicId: row.source_result_public_id,
    sourceTaskPublicId: row.source_task_public_id,
    ownerType: toOwnerType(row.owner_type),
    ownerPublicId: row.owner_public_id,
    actorPublicId: row.actor_public_id,
    lifecycleAvailability:
      lifecycle.kind === "legacy" ? "legacy_unavailable" : "current",
    authorizationSource:
      lifecycle.kind === "current" ? lifecycle.authorizationSource : null,
    authorizationPublicId:
      lifecycle.kind === "current" ? lifecycle.authorizationPublicId : null,
    sessionStatus:
      lifecycle.kind === "current" ? lifecycle.sessionStatus : null,
    sessionRevision:
      lifecycle.kind === "current" ? lifecycle.sessionRevision : null,
    completedAt:
      lifecycle.kind === "current" && lifecycle.completedAt !== null
        ? lifecycle.completedAt.toISOString()
        : null,
    completionSummary:
      lifecycle.kind === "current" &&
      lifecycle.completionSummarySnapshot !== null
        ? { ...lifecycle.completionSummarySnapshot }
        : null,
    evidenceStatus: toEvidenceStatus(row.evidence_status),
    citationCount: row.citation_count,
    questionCount: row.question_count,
    questions: toQuestionSnapshot(row.question_snapshot),
    formalWriteBoundary: toFormalWriteBoundary(row.formal_write_boundary),
    createdAt: row.created_at.toISOString(),
    updatedAt: row.updated_at.toISOString(),
  };
}

function matchesSessionAuthorization(
  row: PersonalAiGenerationLearningSessionRow,
  authorizationSource: "personal_auth" | "org_auth",
  authorizationPublicId: string,
): boolean {
  const lifecycle = parsePersonalAiLearningSessionLifecycle(row);

  return (
    lifecycle.kind === "current" &&
    lifecycle.authorizationSource === authorizationSource &&
    lifecycle.authorizationPublicId === authorizationPublicId
  );
}

function mapLearningAnswerFeedbackRowToDto(
  row: PersonalAiLearningAnswerFeedbackRow,
): PersonalAiGenerationLearningSessionAnswerFeedbackDto {
  const snapshot = toAnswerFeedbackSnapshot(row.answer_feedback_snapshot);
  const answerRevision = readAnswerRevision(row);

  const answerFeedback: PersonalAiGenerationLearningSessionAnswerFeedbackDto = {
    ...snapshot,
    status: toFeedbackStatus(row.feedback_status),
    blockReason: toAnswerBlockReason(snapshot.blockReason),
    sessionPublicId: row.learning_session_public_id,
    sessionQuestionPublicId: row.session_question_public_id,
    actorPublicId: row.actor_public_id,
    answerRevision,
    selectedOptionLabels: toStringArray(row.selected_option_labels),
    textAnswer: row.text_answer,
    isCorrect: row.is_correct,
    score: row.score,
    maxScore: row.max_score,
    formalWriteBoundary: toFormalWriteBoundary(row.formal_write_boundary),
    submittedAt: row.submitted_at.toISOString(),
  };

  if (
    answerRevision !== null &&
    createPersonalAiLearningAnswerCommandDigest({
      expectedAnswerRevision: answerRevision - 1,
      answerFeedback,
    }) !== row.answer_command_digest
  ) {
    throw new Error("invalid personal AI learning answer command digest.");
  }

  return answerFeedback;
}

function tryMapLearningAnswerFeedbackRowToDto(
  row: PersonalAiLearningAnswerFeedbackRow,
): PersonalAiGenerationLearningSessionAnswerFeedbackDto | null {
  try {
    return mapLearningAnswerFeedbackRowToDto(row);
  } catch {
    return null;
  }
}

function readAnswerRevision(
  row: PersonalAiLearningAnswerFeedbackRow,
): number | null {
  if (row.answer_revision === null && row.answer_command_digest === null) {
    return null;
  }

  if (
    Number.isInteger(row.answer_revision) &&
    row.answer_revision !== null &&
    row.answer_revision >= 1 &&
    row.answer_revision <= 2_147_483_647 &&
    typeof row.answer_command_digest === "string" &&
    /^[a-f0-9]{64}$/u.test(row.answer_command_digest)
  ) {
    return row.answer_revision;
  }

  throw new Error("invalid personal AI learning answer revision facts.");
}

function hasSameAnswerCommandFacts(
  left: PersonalAiGenerationLearningSessionAnswerFeedbackDto,
  right: PersonalAiGenerationLearningSessionAnswerFeedbackDto,
): boolean {
  if (left.answerRevision === null || right.answerRevision === null) {
    return false;
  }

  const leftFacts = createPersonalAiLearningAnswerCommandCanonicalFacts({
    expectedAnswerRevision: left.answerRevision - 1,
    answerFeedback: left,
  });
  const rightFacts = createPersonalAiLearningAnswerCommandCanonicalFacts({
    expectedAnswerRevision: right.answerRevision - 1,
    answerFeedback: right,
  });

  return (
    leftFacts !== null &&
    rightFacts !== null &&
    JSON.stringify(leftFacts) === JSON.stringify(rightFacts)
  );
}

function normalizeLearningSessionRow(
  row: unknown,
): PersonalAiGenerationLearningSessionRow {
  return row as PersonalAiGenerationLearningSessionRow;
}

function normalizeLearningAnswerFeedbackRow(
  row: unknown,
): PersonalAiLearningAnswerFeedbackRow {
  return row as PersonalAiLearningAnswerFeedbackRow;
}

function toContentDomain(
  value: string,
): PersonalAiGenerationLearningContentDomain {
  if (value === "personal_ai_learning") {
    return value;
  }

  throw new Error("invalid personal AI learning content domain.");
}

function toOwnerType(
  value: string,
): PersonalAiGenerationLearningSessionOwnerType {
  if (value === "personal" || value === "organization") {
    return value;
  }

  throw new Error("invalid personal AI learning owner type.");
}

function toEvidenceStatus(value: string): EvidenceStatus {
  if (value === "sufficient" || value === "weak" || value === "none") {
    return value;
  }

  throw new Error("invalid personal AI learning evidence status.");
}

function toFeedbackStatus(
  value: string,
): PersonalAiGenerationLearningAnswerFeedbackStatus {
  if (
    value === "scored" ||
    value === "submitted_review_required" ||
    value === "blocked"
  ) {
    return value;
  }

  throw new Error("invalid personal AI learning feedback status.");
}

function toAnswerBlockReason(
  value: PersonalAiGenerationLearningSessionAnswerFeedbackDto["blockReason"],
): PersonalAiGenerationLearningAnswerBlockReason | null {
  if (
    value === null ||
    value === "session_not_found" ||
    value === "actor_not_allowed" ||
    value === "question_not_found"
  ) {
    return value;
  }

  throw new Error("invalid personal AI learning answer block reason.");
}

function toQuestionSnapshot(
  value: unknown,
): PersonalAiGenerationLearningSessionQuestionDto[] {
  if (Array.isArray(value)) {
    return value as PersonalAiGenerationLearningSessionQuestionDto[];
  }

  throw new Error("invalid personal AI learning question snapshot.");
}

function toAnswerFeedbackSnapshot(
  value: unknown,
): PersonalAiGenerationLearningSessionAnswerFeedbackDto {
  if (typeof value === "object" && value !== null && !Array.isArray(value)) {
    return value as PersonalAiGenerationLearningSessionAnswerFeedbackDto;
  }

  throw new Error("invalid personal AI learning answer feedback snapshot.");
}

function toStringArray(value: unknown): string[] {
  if (Array.isArray(value) && value.every((item) => typeof item === "string")) {
    return value;
  }

  throw new Error("invalid personal AI learning selected option labels.");
}

function toFormalWriteBoundary(
  value: unknown,
): PersonalAiGenerationLearningFormalWriteBoundaryDto {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    throw new Error("invalid personal AI learning formal write boundary.");
  }

  const boundary = value as PersonalAiGenerationLearningFormalWriteBoundaryDto;

  if (
    boundary.questionWriteStatus === "blocked" &&
    boundary.paperWriteStatus === "blocked" &&
    boundary.practiceWriteStatus === "blocked" &&
    boundary.answerRecordWriteStatus === "blocked" &&
    boundary.examReportWriteStatus === "blocked" &&
    boundary.mistakeBookWriteStatus === "blocked"
  ) {
    return boundary;
  }

  throw new Error("unsafe personal AI learning formal write boundary.");
}
