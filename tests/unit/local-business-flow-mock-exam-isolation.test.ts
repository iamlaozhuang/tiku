import { describe, expect, it } from "vitest";

import {
  startWritableMockExamForLocalBusinessFlow,
  type LocalBusinessFlowPostJson,
} from "../../e2e/local-business-flow-mock-exam-isolation";

function createMockExamEnvelope(input: {
  publicId: string;
  examStatus: "in_progress" | "completed" | "terminated";
  serverNow?: string;
  serverDeadlineAt?: string | null;
}) {
  return {
    status: 200,
    body: {
      code: 0,
      message: "ok",
      data: {
        mockExam: {
          publicId: input.publicId,
          examStatus: input.examStatus,
          serverNow: input.serverNow ?? "2026-06-12T15:00:00.000Z",
          serverDeadlineAt:
            input.serverDeadlineAt ?? "2026-06-12T15:30:00.000Z",
        },
      },
    },
  };
}

describe("local-business-flow mock_exam isolation", () => {
  it("retries when the first start returns an already completed mock_exam", async () => {
    const calls: string[] = [];
    const postJson: LocalBusinessFlowPostJson = async (url) => {
      calls.push(url);

      if (calls.length === 1) {
        return createMockExamEnvelope({
          publicId: "mock_exam_stale_completed",
          examStatus: "completed",
        });
      }

      return createMockExamEnvelope({
        publicId: "mock_exam_fresh",
        examStatus: "in_progress",
      });
    };

    await expect(
      startWritableMockExamForLocalBusinessFlow(postJson, "paper-dev-theory"),
    ).resolves.toMatchObject({
      mockExamPublicId: "mock_exam_fresh",
      mockExam: {
        body: {
          code: 0,
          data: {
            mockExam: {
              examStatus: "in_progress",
            },
          },
        },
      },
      isolationEvents: [
        {
          action: "retry_after_non_writable_start",
          publicId: "mock_exam_stale_completed",
          examStatus: "completed",
        },
      ],
    });
    expect(calls).toEqual(["/api/v1/mock-exams", "/api/v1/mock-exams"]);
  });

  it("terminates a near-deadline active mock_exam before retrying", async () => {
    const calls: { url: string; body: unknown }[] = [];
    const postJson: LocalBusinessFlowPostJson = async (url, body) => {
      calls.push({ url, body });

      if (calls.length === 1) {
        return createMockExamEnvelope({
          publicId: "mock_exam_near_deadline",
          examStatus: "in_progress",
          serverNow: "2026-06-12T15:00:00.000Z",
          serverDeadlineAt: "2026-06-12T15:00:10.000Z",
        });
      }

      if (url.endsWith("/terminate")) {
        return createMockExamEnvelope({
          publicId: "mock_exam_near_deadline",
          examStatus: "terminated",
        });
      }

      return createMockExamEnvelope({
        publicId: "mock_exam_fresh_after_terminate",
        examStatus: "in_progress",
      });
    };

    await expect(
      startWritableMockExamForLocalBusinessFlow(postJson, "paper-dev-theory"),
    ).resolves.toMatchObject({
      mockExamPublicId: "mock_exam_fresh_after_terminate",
      isolationEvents: [
        {
          action: "terminate_near_deadline",
          publicId: "mock_exam_near_deadline",
          remainingMs: 10000,
        },
      ],
    });
    expect(calls).toEqual([
      {
        url: "/api/v1/mock-exams",
        body: { paperPublicId: "paper-dev-theory" },
      },
      {
        url: "/api/v1/mock-exams/mock_exam_near_deadline/terminate",
        body: {},
      },
      {
        url: "/api/v1/mock-exams",
        body: { paperPublicId: "paper-dev-theory" },
      },
    ]);
  });
});
