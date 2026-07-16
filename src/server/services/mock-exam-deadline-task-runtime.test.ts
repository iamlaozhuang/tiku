import { describe, expect, it, vi } from "vitest";

import type {
  MockExamDeadlineTaskRecord,
  MockExamDeadlineTaskRepository,
} from "../repositories/mock-exam-deadline-task-repository";
import { createMockExamDeadlineTaskRuntime } from "./mock-exam-deadline-task-runtime";

const now = new Date("2026-07-15T15:30:00.000Z");

function createTask(): MockExamDeadlineTaskRecord {
  return {
    publicId: "mock_exam_deadline_task_public_1",
    mockExamPublicId: "mock_exam_public_1",
    userPublicId: "user_public_1",
    taskStatus: "running",
    scheduledAt: new Date("2026-07-15T15:00:00.000Z"),
    attemptCount: 1,
    maxAttemptCount: 5,
    claimedAt: now,
    leaseExpiresAt: new Date("2026-07-15T15:31:00.000Z"),
    workerPublicId: "worker_public_1",
    completedAt: null,
  };
}

function createRepository(
  task: MockExamDeadlineTaskRecord | null,
): MockExamDeadlineTaskRepository & {
  completedTaskPublicIds: string[];
  failedTaskInputs: unknown[];
} {
  let availableTask = task;
  const completedTaskPublicIds: string[] = [];
  const failedTaskInputs: unknown[] = [];

  return {
    completedTaskPublicIds,
    failedTaskInputs,
    async recoverExpiredTasks() {
      return 0;
    },
    async claimNextDueTask() {
      const claimedTask = availableTask;
      availableTask = null;
      return claimedTask;
    },
    async completeTask(input) {
      completedTaskPublicIds.push(input.taskPublicId);
    },
    async failTaskAttempt(input) {
      failedTaskInputs.push(input);
    },
  };
}

describe("mock exam deadline task runtime", () => {
  it("claims a due task once and completes it after authoritative idempotent submission", async () => {
    const repository = createRepository(createTask());
    const submitMockExam = vi.fn().mockResolvedValue({
      code: 0,
      message: "ok",
      data: {
        mockExam: { examStatus: "completed" },
        unansweredCount: 0,
      },
    });
    const runtime = createMockExamDeadlineTaskRuntime({
      repository,
      mockExamService: { submitMockExam },
      clock: { now: () => now },
      workerPublicId: "worker_public_1",
    });

    const results = await Promise.all([runtime.runNext(), runtime.runNext()]);

    expect(results).toEqual([
      {
        status: "completed",
        taskPublicId: "mock_exam_deadline_task_public_1",
      },
      { status: "idle" },
    ]);
    expect(submitMockExam).toHaveBeenCalledTimes(1);
    expect(submitMockExam).toHaveBeenCalledWith(
      { userPublicId: "user_public_1" },
      "mock_exam_public_1",
      {},
    );
    expect(repository.completedTaskPublicIds).toEqual([
      "mock_exam_deadline_task_public_1",
    ]);
  });

  it("records only a digest and releases the task for bounded retry when submission fails", async () => {
    const repository = createRepository(createTask());
    const runtime = createMockExamDeadlineTaskRuntime({
      repository,
      mockExamService: {
        async submitMockExam() {
          throw new Error("private database detail must not persist");
        },
      },
      clock: { now: () => now },
      workerPublicId: "worker_public_1",
    });

    await expect(runtime.runNext()).resolves.toEqual({
      status: "failed",
      taskPublicId: "mock_exam_deadline_task_public_1",
    });
    expect(repository.failedTaskInputs).toEqual([
      expect.objectContaining({
        taskPublicId: "mock_exam_deadline_task_public_1",
        workerPublicId: "worker_public_1",
        failedAt: now,
        retryAfterAt: new Date("2026-07-15T15:31:00.000Z"),
        failureMessageDigest: expect.stringMatching(/^[a-f0-9]{64}$/u),
      }),
    ]);
    expect(JSON.stringify(repository.failedTaskInputs)).not.toContain(
      "private database detail",
    );
  });

  it("closes the task when authorization termination already cancelled the mock", async () => {
    const repository = createRepository(createTask());
    const runtime = createMockExamDeadlineTaskRuntime({
      repository,
      mockExamService: {
        async submitMockExam() {
          return {
            code: 403313,
            message: "Mock exam authorization is invalid; session terminated.",
            data: null,
          };
        },
      },
      clock: { now: () => now },
      workerPublicId: "worker_public_1",
    });

    await expect(runtime.runNext()).resolves.toEqual({
      status: "completed",
      taskPublicId: "mock_exam_deadline_task_public_1",
    });
    expect(repository.completedTaskPublicIds).toEqual([
      "mock_exam_deadline_task_public_1",
    ]);
    expect(repository.failedTaskInputs).toEqual([]);
  });
});
