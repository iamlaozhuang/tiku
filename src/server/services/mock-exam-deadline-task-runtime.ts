import { createHash } from "node:crypto";

import type { MockExamDeadlineTaskRepository } from "../repositories/mock-exam-deadline-task-repository";
import {
  MOCK_EXAM_AUTHORIZATION_TERMINATED_CODE,
  type MockExamService,
} from "./mock-exam-service";

type MockExamDeadlineTaskRunResult =
  | { status: "idle" }
  | { status: "completed" | "failed"; taskPublicId: string };

const defaultLeaseDurationMillisecond = 60_000;

function addMillisecond(value: Date, millisecond: number): Date {
  return new Date(value.getTime() + millisecond);
}

function digestFailure(error: unknown): string {
  const failureMessage =
    error instanceof Error ? error.message : "unknown deadline task failure";

  return createHash("sha256").update(failureMessage).digest("hex");
}

export function createMockExamDeadlineTaskRuntime(input: {
  repository: MockExamDeadlineTaskRepository;
  mockExamService: Pick<MockExamService, "submitMockExam">;
  clock: { now(): Date };
  workerPublicId: string;
  leaseDurationMillisecond?: number;
}) {
  return {
    async runNext(): Promise<MockExamDeadlineTaskRunResult> {
      const claimedAt = input.clock.now();
      const leaseDurationMillisecond =
        input.leaseDurationMillisecond ?? defaultLeaseDurationMillisecond;

      await input.repository.recoverExpiredTasks({ recoveredAt: claimedAt });
      const task = await input.repository.claimNextDueTask({
        workerPublicId: input.workerPublicId,
        claimedAt,
        leaseExpiresAt: addMillisecond(claimedAt, leaseDurationMillisecond),
      });

      if (task === null) {
        return { status: "idle" };
      }

      try {
        const response = await input.mockExamService.submitMockExam(
          { userPublicId: task.userPublicId },
          task.mockExamPublicId,
          {},
        );
        const examStatus = response.data?.mockExam.examStatus;

        if (response.code === MOCK_EXAM_AUTHORIZATION_TERMINATED_CODE) {
          await input.repository.completeTask({
            taskPublicId: task.publicId,
            workerPublicId: input.workerPublicId,
            completedAt: input.clock.now(),
          });

          return { status: "completed", taskPublicId: task.publicId };
        }

        if (
          response.code !== 0 ||
          examStatus === undefined ||
          examStatus === "in_progress"
        ) {
          throw new Error(`deadline_submission_rejected:${response.code}`);
        }

        await input.repository.completeTask({
          taskPublicId: task.publicId,
          workerPublicId: input.workerPublicId,
          completedAt: input.clock.now(),
        });

        return { status: "completed", taskPublicId: task.publicId };
      } catch (error) {
        const failedAt = input.clock.now();

        await input.repository.failTaskAttempt({
          taskPublicId: task.publicId,
          workerPublicId: input.workerPublicId,
          failureMessageDigest: digestFailure(error),
          failedAt,
          retryAfterAt: addMillisecond(failedAt, leaseDurationMillisecond),
        });

        return { status: "failed", taskPublicId: task.publicId };
      }
    },
  };
}
