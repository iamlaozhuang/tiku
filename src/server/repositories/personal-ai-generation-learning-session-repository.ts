import {
  aiGenerationTask,
  personalAiGenerationResult,
  personalAiLearningAnswerFeedback,
  personalAiLearningSession,
} from "@/db/schema";
import { and, eq, sql } from "drizzle-orm";

import type { EvidenceStatus } from "../models/ai-rag";
import type {
  PersonalAiGenerationLearningAnswerBlockReason,
  PersonalAiGenerationLearningAnswerFeedbackStatus,
  PersonalAiGenerationLearningContentDomain,
  PersonalAiGenerationLearningSessionOwnerType,
} from "../models/personal-ai-generation-learning-session";
import type {
  PersonalAiGenerationLearningFormalWriteBoundaryDto,
  PersonalAiGenerationLearningSessionAnswerFeedbackDto,
  PersonalAiGenerationLearningSessionDto,
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
} from "../validators/personal-ai-generation-learning-session";

type PersonalAiLearningSessionInsertValue =
  typeof personalAiLearningSession.$inferInsert;

type PersonalAiLearningAnswerFeedbackInsertValue =
  typeof personalAiLearningAnswerFeedback.$inferInsert;

export type PersonalAiGenerationLearningSessionSourceResultRow = {
  id: number;
  public_id: string;
  owner_public_id: string;
  actor_public_id: string;
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
    answerFeedback: PersonalAiGenerationLearningSessionAnswerFeedbackDto;
  }): Promise<PersonalAiLearningAnswerFeedbackRow[]>;
  findAnswerFeedbackRowsBySessionQuestion(query: {
    sessionPublicId: string;
    sessionQuestionPublicId: string;
  }): Promise<PersonalAiLearningAnswerFeedbackRow[]>;
  listAnswerFeedbackRowsBySessionPublicId(
    sessionPublicId: string,
  ): Promise<PersonalAiLearningAnswerFeedbackRow[]>;
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
  actor_public_id: aiGenerationTask.actor_public_id,
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
      });

      if (sourceResult === null) {
        return {
          status: "blocked",
          blockReason: "source_result_not_found",
        };
      }

      await gateway.insertOrReuseSessionRow({
        sourceResultId: sourceResult.id,
        session,
      });

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
        sessionRow.actor_public_id !== input.answerFeedback.actorPublicId
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
      const [row] = await getDatabase()
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
          ),
        )
        .limit(1);

      return row ?? null;
    },
    async insertOrReuseSessionRow(input) {
      const database = getDatabase();
      const [insertedRow] = await database
        .insert(personalAiLearningSession)
        .values(createLearningSessionInsertValue(input))
        .onConflictDoNothing({
          target: personalAiLearningSession.public_id,
        })
        .returning(personalAiLearningSessionSelection);

      if (insertedRow !== undefined) {
        return normalizeLearningSessionRow(insertedRow);
      }

      const existingRow = await findLearningSessionRowByPublicId(
        database,
        input.session.sessionPublicId,
      );

      if (existingRow === null) {
        throw new Error("personal AI learning session persistence failed.");
      }

      return existingRow;
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

      const rows =
        input.expectedAnswerRevision === 0
          ? await database
              .insert(personalAiLearningAnswerFeedback)
              .values(createLearningAnswerFeedbackInsertValue(input))
              .onConflictDoNothing({
                target: [
                  personalAiLearningAnswerFeedback.learning_session_public_id,
                  personalAiLearningAnswerFeedback.session_question_public_id,
                ],
              })
              .returning(personalAiLearningAnswerFeedbackSelection)
          : await database
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

      return rows.map(normalizeLearningAnswerFeedbackRow);
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
  return {
    sessionPublicId: row.public_id,
    contentDomain: toContentDomain(row.content_domain),
    sourceResultPublicId: row.source_result_public_id,
    sourceTaskPublicId: row.source_task_public_id,
    ownerType: toOwnerType(row.owner_type),
    ownerPublicId: row.owner_public_id,
    actorPublicId: row.actor_public_id,
    evidenceStatus: toEvidenceStatus(row.evidence_status),
    citationCount: row.citation_count,
    questionCount: row.question_count,
    questions: toQuestionSnapshot(row.question_snapshot),
    formalWriteBoundary: toFormalWriteBoundary(row.formal_write_boundary),
    createdAt: row.created_at.toISOString(),
  };
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
