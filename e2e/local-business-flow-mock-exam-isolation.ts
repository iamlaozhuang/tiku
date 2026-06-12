type LocalBusinessFlowApiPayload = {
  code: number;
  message: string;
  data: unknown;
  pagination?: unknown;
};

export type LocalBusinessFlowApiResponse = {
  status: number;
  body: LocalBusinessFlowApiPayload;
};

export type LocalBusinessFlowPostJson = (
  url: string,
  body: unknown,
) => Promise<LocalBusinessFlowApiResponse>;

export type LocalBusinessFlowMockExamIsolationEvent =
  | {
      action: "retry_after_non_writable_start";
      publicId: string | null;
      examStatus: string | null;
    }
  | {
      action: "terminate_near_deadline";
      publicId: string;
      remainingMs: number;
    };

export type LocalBusinessFlowMockExamStartResult = {
  mockExam: LocalBusinessFlowApiResponse;
  mockExamPublicId: string;
  isolationEvents: LocalBusinessFlowMockExamIsolationEvent[];
};

const minimumWritableRemainingMs = 60_000;
const maxStartAttempts = 3;

function asRecord(value: unknown): Record<string, unknown> | null {
  return typeof value === "object" && value !== null
    ? (value as Record<string, unknown>)
    : null;
}

function readMockExamRecord(
  response: LocalBusinessFlowApiResponse,
): Record<string, unknown> | null {
  const payloadData = asRecord(response.body.data);
  if (payloadData === null) {
    return null;
  }

  return asRecord(payloadData.mockExam);
}

function readStringField(
  record: Record<string, unknown> | null,
  fieldName: string,
): string | null {
  const value = record?.[fieldName];

  return typeof value === "string" ? value : null;
}

function readRemainingMs(
  record: Record<string, unknown> | null,
): number | null {
  const serverNow = readStringField(record, "serverNow");
  const serverDeadlineAt = readStringField(record, "serverDeadlineAt");

  if (serverNow === null || serverDeadlineAt === null) {
    return null;
  }

  const remainingMs =
    new Date(serverDeadlineAt).getTime() - new Date(serverNow).getTime();

  return Number.isFinite(remainingMs) ? remainingMs : null;
}

function isWritableMockExam(record: Record<string, unknown> | null): boolean {
  if (readStringField(record, "examStatus") !== "in_progress") {
    return false;
  }

  const remainingMs = readRemainingMs(record);

  return remainingMs === null || remainingMs >= minimumWritableRemainingMs;
}

export async function startWritableMockExamForLocalBusinessFlow(
  postJson: LocalBusinessFlowPostJson,
  paperPublicId: string,
): Promise<LocalBusinessFlowMockExamStartResult> {
  const isolationEvents: LocalBusinessFlowMockExamIsolationEvent[] = [];

  for (
    let attemptIndex = 0;
    attemptIndex < maxStartAttempts;
    attemptIndex += 1
  ) {
    const mockExam = await postJson("/api/v1/mock-exams", { paperPublicId });
    const mockExamRecord = readMockExamRecord(mockExam);
    const mockExamPublicId = readStringField(mockExamRecord, "publicId");
    const examStatus = readStringField(mockExamRecord, "examStatus");

    if (mockExam.body.code !== 0 || mockExamPublicId === null) {
      throw new Error(
        `Unable to start mock_exam for local-business-flow; code=${mockExam.body.code}`,
      );
    }

    if (isWritableMockExam(mockExamRecord)) {
      return {
        mockExam,
        mockExamPublicId,
        isolationEvents,
      };
    }

    const remainingMs = readRemainingMs(mockExamRecord);

    if (
      examStatus === "in_progress" &&
      remainingMs !== null &&
      remainingMs < minimumWritableRemainingMs
    ) {
      isolationEvents.push({
        action: "terminate_near_deadline",
        publicId: mockExamPublicId,
        remainingMs,
      });
      await postJson(`/api/v1/mock-exams/${mockExamPublicId}/terminate`, {});
      continue;
    }

    isolationEvents.push({
      action: "retry_after_non_writable_start",
      publicId: mockExamPublicId,
      examStatus,
    });
  }

  throw new Error(
    `Unable to isolate writable mock_exam after ${maxStartAttempts} attempts.`,
  );
}
