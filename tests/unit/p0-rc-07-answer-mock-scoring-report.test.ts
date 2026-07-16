import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { afterEach, describe, expect, it } from "vitest";

import {
  COOKIE_BACKED_SESSION_MARKER,
  STUDENT_MOCK_EXAM_ANSWER_QUEUE_STORAGE_KEY_PREFIX,
  STUDENT_MOCK_EXAM_CACHE_STORAGE_KEY_PREFIX,
  STUDENT_SESSION_STORAGE_SCOPE_KEY,
  STUDENT_SESSION_TOKEN_STORAGE_KEY,
  clearStoredStudentSessionToken,
  createStudentUserScopedStorageKey,
  getStudentSessionStorageScope,
  persistCookieBackedSessionMarker,
} from "@/features/student/studentRuntimeApi";

afterEach(() => {
  localStorage.clear();
});

describe("RC-07 student runtime storage boundary", () => {
  it("rotates to the authenticated user scope and removes previous-user caches", () => {
    localStorage.setItem(
      `${STUDENT_MOCK_EXAM_CACHE_STORAGE_KEY_PREFIX}old-user.paper_public_1`,
      "old cache",
    );

    persistCookieBackedSessionMarker("user_public_2");

    expect(localStorage.getItem(STUDENT_SESSION_TOKEN_STORAGE_KEY)).toBe(
      COOKIE_BACKED_SESSION_MARKER,
    );
    expect(localStorage.getItem(STUDENT_SESSION_STORAGE_SCOPE_KEY)).toBe(
      "user_public_2",
    );
    expect(getStudentSessionStorageScope()).toBe("user_public_2");
    expect(
      createStudentUserScopedStorageKey(
        STUDENT_MOCK_EXAM_CACHE_STORAGE_KEY_PREFIX,
        "paper_public_2",
      ),
    ).toBe("tiku.mockExam.cache.user_public_2.paper_public_2");
    expect(
      localStorage.getItem("tiku.mockExam.cache.old-user.paper_public_1"),
    ).toBeNull();
  });

  it("clears the session scope, cache and pending answers on logout", () => {
    persistCookieBackedSessionMarker("user_public_3");
    const cacheKey = createStudentUserScopedStorageKey(
      STUDENT_MOCK_EXAM_CACHE_STORAGE_KEY_PREFIX,
      "paper_public_3",
    );
    const queueKey = createStudentUserScopedStorageKey(
      STUDENT_MOCK_EXAM_ANSWER_QUEUE_STORAGE_KEY_PREFIX,
      "mock_exam_public_3",
    );

    localStorage.setItem(cacheKey, "cache");
    localStorage.setItem(queueKey, "queue");

    clearStoredStudentSessionToken();

    expect(localStorage.getItem(STUDENT_SESSION_TOKEN_STORAGE_KEY)).toBeNull();
    expect(localStorage.getItem(STUDENT_SESSION_STORAGE_SCOPE_KEY)).toBeNull();
    expect(localStorage.getItem(cacheKey)).toBeNull();
    expect(localStorage.getItem(queueKey)).toBeNull();
  });
});

describe("RC-07 terminal supplement persistence boundary", () => {
  it("locks the owned in-progress mock before accepting an answer revision", () => {
    const source = readFileSync(
      resolve(
        process.cwd(),
        "src/server/repositories/student-flow-runtime-repository.ts",
      ),
      "utf8",
    );
    const saveSource = source.slice(
      source.indexOf("async saveMockExamAnswerRecord"),
      source.indexOf("async listMockExamAnswerRecords"),
    );

    expect(saveSource).toContain("findWritableMockExamLink");
    expect(saveSource).toContain("operationOwner");
    expect(saveSource).toContain("isAnswerOperationIdConflict");
    expect(saveSource).toContain('status: "not_writable"');
    expect(saveSource).toContain('status: "operation_conflict"');
    expect(saveSource).not.toContain(
      'throw new Error("Concurrent mock exam answer insert was lost.")',
    );
  });

  it("uses one missing-only transaction for answer, scoring task and report revision", () => {
    const source = readFileSync(
      resolve(
        process.cwd(),
        "src/server/repositories/student-flow-runtime-repository.ts",
      ),
      "utf8",
    );
    const supplementSource = source.slice(
      source.indexOf("async supplementMissingMockExamAnswers"),
      source.indexOf("async submitMockExam"),
    );

    expect(supplementSource).toContain("database.transaction");
    expect(supplementSource).toContain("eq(mockExam.user_id, userId)");
    expect(supplementSource).toContain("inArray(mockExam.exam_status");
    expect(supplementSource).toContain(".onConflictDoNothing()");
    expect(supplementSource).toContain("insert(aiScoringTask)");
    expect(supplementSource).toContain("listMockExamAnswerRecords(");
    expect(supplementSource).not.toContain(".update(answerRecord)");
  });

  it("does not erase stored scoring evidence while rebuilding a supplemented report", () => {
    const source = readFileSync(
      resolve(process.cwd(), "src/server/services/mock-exam-service.ts"),
      "utf8",
    );
    const supplementSource = source.slice(
      source.indexOf("async supplementMockExamAnswers"),
      source.indexOf("async submitMockExam"),
    );

    expect(supplementSource).not.toContain("ai_scoring_evidence: null");
  });

  it("keeps replayed report revisions stable and cancels the deadline owner on termination", () => {
    const source = readFileSync(
      resolve(
        process.cwd(),
        "src/server/repositories/student-flow-runtime-repository.ts",
      ),
      "utf8",
    );
    const rebuildSource = source.slice(
      source.indexOf("async rebuildExistingExamReport"),
      source.indexOf("async submitMockExam"),
    );
    const terminateSource = source.slice(
      source.indexOf("async terminateMockExam"),
      source.indexOf("function createPostgresExamReportRepository"),
    );

    expect(rebuildSource).toContain("if (!input.hasChanges)");
    expect(terminateSource).toContain("database.transaction");
    expect(terminateSource).toContain("update(mockExamDeadlineTask)");
    expect(terminateSource).toContain('task_status: "cancelled"');
  });

  it("treats a concurrently completed or cancelled deadline task as an idempotent failure replay", () => {
    const source = readFileSync(
      resolve(
        process.cwd(),
        "src/server/repositories/mock-exam-deadline-task-repository.ts",
      ),
      "utf8",
    );
    const completionSource = source.slice(
      source.indexOf("async completeTask"),
      source.indexOf("async failTaskAttempt"),
    );
    const failureSource = source.slice(source.indexOf("async failTaskAttempt"));

    expect(completionSource).toContain("then completed_at");
    expect(completionSource).toContain("then updated_at");
    expect(failureSource).toContain("const terminalRows");
    expect(failureSource).toContain("task_status in (");
    expect(failureSource).toContain(
      "'cancelled'::mock_exam_deadline_task_status",
    );
  });
});

describe("RC-07 durable scoring state convergence", () => {
  it("keeps retryable failures pending and derives the mock terminal status atomically", () => {
    const source = readFileSync(
      resolve(
        process.cwd(),
        "src/server/repositories/ai-scoring-task-repository.ts",
      ),
      "utf8",
    );
    const completionSource = source.slice(
      source.indexOf("async completeAiScoringTask"),
      source.indexOf("async failAiScoringTaskAttempt"),
    );
    const failureSource = source.slice(
      source.indexOf("async failAiScoringTaskAttempt"),
      source.indexOf("function requireTaskRow"),
    );

    expect(completionSource).toContain("mock_exam_update as");
    expect(completionSource).toContain("database.transaction");
    expect(completionSource).toContain("lockAiScoringTaskMockExam");
    expect(completionSource).toContain("'completed'::exam_status");
    expect(completionSource).toContain("'scoring'::exam_status");
    expect(failureSource).toContain("'pending'::ai_scoring_task_status");
    expect(failureSource).toContain("terminal_answer_record_update as");
    expect(failureSource).toContain("'scoring_partial_failed'::exam_status");
    expect(failureSource).toContain("mock_exam_update as");
    expect(failureSource).toContain("database.transaction");
    expect(failureSource).toContain("lockAiScoringTaskMockExam");
  });

  it("keeps report creation concurrent-safe and rebuilds only changed owned snapshots", () => {
    const source = readFileSync(
      resolve(
        process.cwd(),
        "src/server/repositories/student-flow-runtime-repository.ts",
      ),
      "utf8",
    );
    const createSource = source.slice(
      source.indexOf("async createExamReport"),
      source.indexOf("async rebuildExamReport"),
    );
    const rebuildSource = source.slice(
      source.indexOf("async rebuildExamReport"),
      source.indexOf("async updateExamReportLearningSuggestionSnapshot"),
    );

    expect(createSource).toContain("findOwnedMockExamTableRow");
    expect(createSource).toContain(".onConflictDoNothing");
    expect(rebuildSource).toContain("findOwnedMockExamTableRow");
    expect(rebuildSource).toContain("changedReportCondition");
    expect(rebuildSource).toContain("report_revision");
    expect(rebuildSource).toContain("learning_suggestion_snapshot: null");
  });
});

describe("RC-07 skill practice question_group boundary", () => {
  it("preserves group identity and shared material in the published snapshot and grouped UI", () => {
    const repositorySource = readFileSync(
      resolve(
        process.cwd(),
        "src/server/repositories/student-flow-runtime-repository.ts",
      ),
      "utf8",
    );
    const practiceSource = readFileSync(
      resolve(
        process.cwd(),
        "src/features/student/practice/StudentPracticePage.tsx",
      ),
      "utf8",
    );

    expect(repositorySource).toContain("questionGroupPublicId");
    expect(repositorySource).toContain("questionGroupTitle");
    expect(repositorySource).toContain("requireQuestionGroupSnapshot");
    expect(repositorySource).toContain("materialSnapshot");
    expect(practiceSource).toContain("extractPracticeQuestionPages");
    expect(practiceSource).toContain("下一组");
    expect(practiceSource).toContain("完成练习");
  });
});
