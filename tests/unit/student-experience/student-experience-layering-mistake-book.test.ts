import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

import { describe, expect, it } from "vitest";

const workspaceRoot = process.cwd();
const STUDENT_EXPERIENCE_LAYERING_TEST_TIMEOUT_MS = 15000;

function resolveAllowedSource(sourcePath: string) {
  return join(workspaceRoot, sourcePath);
}

function readAllowedSource(sourcePath: string) {
  return readFileSync(resolveAllowedSource(sourcePath), "utf8");
}

function expectAllowedSourceExists(sourcePath: string) {
  const absoluteSourcePath = resolveAllowedSource(sourcePath);

  expect(existsSync(absoluteSourcePath)).toBe(true);

  return absoluteSourcePath;
}

function createRouteContext(publicId: string) {
  return {
    params: Promise.resolve({ publicId }),
  };
}

async function resolveRouteResponse(routeCall: () => Promise<Response>) {
  try {
    return await routeCall();
  } catch {
    return undefined;
  }
}

describe("unified repair student experience layering and mistake book scope", () => {
  it(
    "routes student APIs through the scoped student-experience layer",
    async () => {
      const practiceRouteSource = readAllowedSource(
        "src/app/api/v1/practices/route.ts",
      );
      const mockExamRouteSource = readAllowedSource(
        "src/app/api/v1/mock-exams/route.ts",
      );
      const examReportRouteSource = readAllowedSource(
        "src/app/api/v1/exam-reports/route.ts",
      );
      const mistakeBookRouteSource = readAllowedSource(
        "src/app/api/v1/mistake-books/route.ts",
      );
      const routeHandlersSourcePath = expectAllowedSourceExists(
        "src/server/services/student-experience/route-handlers.ts",
      );

      expect(practiceRouteSource).toContain(
        "createStudentExperienceRouteHandlers",
      );
      expect(practiceRouteSource).toContain(
        "studentExperienceRouteHandlers.practices.collection.POST",
      );
      expect(mockExamRouteSource).toContain(
        "studentExperienceRouteHandlers.mockExams.collection.POST",
      );
      expect(examReportRouteSource).toContain(
        "studentExperienceRouteHandlers.examReports.collection.GET",
      );
      expect(mistakeBookRouteSource).toContain(
        "studentExperienceRouteHandlers.mistakeBooks.collection.GET",
      );

      const { createStudentExperienceRouteHandlers } = await import(
        pathToFileURL(routeHandlersSourcePath).href
      );
      const handlers = createStudentExperienceRouteHandlers({
        repository: {
          async listMistakeBooks() {
            return {
              mistakeBooks: [
                {
                  isFavorite: false,
                  isQuestionDisabled: true,
                  isRemoved: false,
                  latestWrongAt: "2026-06-14T18:10:00.000Z",
                  masteredAt: null,
                  mistakeBookSource: "wrong_answer",
                  mistakeBookStatus: "unmastered",
                  publicId: "mistake-book-public-001",
                  questionPublicId: "question-public-001",
                  questionType: "single_choice",
                  wrongCount: 2,
                },
              ],
              pagination: {
                page: 1,
                pageSize: 10,
                sortBy: "latestWrongAt",
                sortOrder: "desc",
                total: 1,
              },
            };
          },
        },
        resolveUserContext: async () => ({
          userPublicId: "user-public-001",
        }),
      });

      const response = await handlers.mistakeBooks.collection.GET(
        new Request("http://localhost/api/v1/mistake-books?page=1&pageSize=10"),
      );
      const responseBody = await response.json();

      expect(responseBody).toEqual({
        code: 0,
        data: {
          mistakeBooks: [
            {
              isFavorite: false,
              isQuestionDisabled: true,
              isRemoved: false,
              latestWrongAt: "2026-06-14T18:10:00.000Z",
              masteredAt: null,
              mistakeBookScope: "objective_question",
              mistakeBookSource: "wrong_answer",
              mistakeBookStatus: "unmastered",
              publicId: "mistake-book-public-001",
              questionPublicId: "question-public-001",
              questionType: "single_choice",
              wrongCount: 2,
            },
          ],
        },
        message: "ok",
        pagination: {
          page: 1,
          pageSize: 10,
          sortBy: "latestWrongAt",
          sortOrder: "desc",
          total: 1,
        },
      });
      expect(JSON.stringify(responseBody)).not.toContain('"id"');
      expect(JSON.stringify(responseBody)).not.toContain("rawAnswerText");
      expect(JSON.stringify(responseBody)).not.toContain("answerRecordId");
    },
    STUDENT_EXPERIENCE_LAYERING_TEST_TIMEOUT_MS,
  );

  it("returns generic 500 envelope when student experience repository throws", async () => {
    const routeHandlersSourcePath = expectAllowedSourceExists(
      "src/server/services/student-experience/route-handlers.ts",
    );
    const { createStudentExperienceRouteHandlers } = await import(
      pathToFileURL(routeHandlersSourcePath).href
    );
    const thrownDetail = "synthetic student experience route failure detail";
    const handlers = createStudentExperienceRouteHandlers({
      repository: {
        async listMistakeBooks() {
          throw new Error(thrownDetail);
        },
      },
      resolveUserContext: async () => ({
        userPublicId: "user-public-001",
      }),
    });

    const response = await resolveRouteResponse(() =>
      handlers.mistakeBooks.collection.GET(
        new Request("http://localhost/api/v1/mistake-books?page=1&pageSize=10"),
      ),
    );

    expect(response).toBeInstanceOf(Response);

    if (response === undefined) {
      return;
    }

    expect(response.status).toBe(500);

    const responseText = await response.text();

    expect(responseText).not.toContain(thrownDetail);
    expect(JSON.parse(responseText)).toEqual({
      code: 500001,
      data: null,
      message: "Unexpected runtime error.",
    });
  });

  it("keeps mistake_book entries objective-question scoped", async () => {
    const validatorSourcePath = expectAllowedSourceExists(
      "src/server/validators/student-experience/mistake-book-scope.ts",
    );
    const { createMistakeBookObjectiveScopeDecision } = await import(
      pathToFileURL(validatorSourcePath).href
    );

    expect(
      createMistakeBookObjectiveScopeDecision({
        questionType: "fill_blank",
      }),
    ).toEqual({
      mistakeBookScope: "objective_question",
      ok: true,
      questionType: "fill_blank",
    });

    expect(
      createMistakeBookObjectiveScopeDecision({
        questionType: "short_answer",
      }),
    ).toEqual({
      blockedGate: "subjective_mistake_book",
      code: 422031,
      message: "Subjective questions are outside standard mistake_book scope.",
      ok: false,
    });
  });

  it("blocks provider-gated student operations without calling provider runtime", async () => {
    const routeHandlersSourcePath = expectAllowedSourceExists(
      "src/server/services/student-experience/route-handlers.ts",
    );
    const { createStudentExperienceRouteHandlers } = await import(
      pathToFileURL(routeHandlersSourcePath).href
    );
    let retryScoringCalled = false;
    const handlers = createStudentExperienceRouteHandlers({
      repository: {
        async retryMockExamScoring() {
          retryScoringCalled = true;

          return null;
        },
      },
      resolveUserContext: async () => ({
        userPublicId: "user-public-001",
      }),
    });

    const response = await handlers.mockExams.retryScoring.POST(
      new Request(
        "http://localhost/api/v1/mock-exams/mock-exam-public-001/retry-scoring",
        { method: "POST" },
      ),
      createRouteContext("mock-exam-public-001"),
    );

    await expect(response.json()).resolves.toEqual({
      code: 423101,
      data: {
        blockedGate: "provider_model_request_quota",
        operation: "mock_exam.retry_scoring",
        status: "blocked",
      },
      message: "Provider-gated mock_exam scoring requires separate approval.",
    });
    expect(retryScoringCalled).toBe(false);
  });

  it(
    "delegates local exam report and mistake-book AI explanation handlers to legacy runtime",
    async () => {
      const routeHandlersSourcePath = expectAllowedSourceExists(
        "src/server/services/student-experience/route-handlers.ts",
      );
      const { createStudentExperienceRouteHandlers } = await import(
        pathToFileURL(routeHandlersSourcePath).href
      );
      const calls: string[] = [];
      const handlers = createStudentExperienceRouteHandlers({
        legacyFlowRouteHandlers: {
          examReports: {
            generation: {
              async POST() {
                calls.push("exam_report.generation");

                return Response.json({
                  code: 0,
                  message: "ok",
                  data: {
                    examReport: {
                      publicId: "exam-report-public-001",
                    },
                  },
                });
              },
            },
            retryLearningSuggestion: {
              async POST() {
                calls.push("exam_report.retry_learning_suggestion");

                return Response.json({
                  code: 0,
                  message: "ok",
                  data: null,
                });
              },
            },
          },
        },
        legacyMistakeBookRouteHandlers: {
          aiExplanation: {
            async POST() {
              calls.push("mistake_book.ai_explanation");

              return Response.json({
                code: 0,
                message: "ok",
                data: {
                  aiExplanation: {
                    explanationStatus: "explained",
                    explanationText: "local explanation",
                    keyPoints: [],
                    learningSuggestion: null,
                    insufficientEvidenceMessage: null,
                    evidenceStatus: "none",
                    citations: [],
                    promptTemplateKey: "ai_explanation_v1",
                    promptTemplateVersion: 1,
                  },
                },
              });
            },
          },
        },
      });

      await expect(
        (
          await handlers.examReports.generation.POST(
            new Request("http://localhost/api/v1/exam-reports", {
              method: "POST",
              body: JSON.stringify({
                mockExamPublicId: "mock-exam-public-001",
              }),
            }),
          )
        ).json(),
      ).resolves.toEqual({
        code: 0,
        message: "ok",
        data: {
          examReport: {
            publicId: "exam-report-public-001",
          },
        },
      });

      await expect(
        (
          await handlers.examReports.retryLearningSuggestion.POST(
            new Request(
              "http://localhost/api/v1/exam-reports/exam-report-public-001/retry-learning-suggestion",
              { method: "POST" },
            ),
            createRouteContext("exam-report-public-001"),
          )
        ).json(),
      ).resolves.toEqual({
        code: 0,
        message: "ok",
        data: null,
      });

      await expect(
        (
          await handlers.mistakeBooks.aiExplanation.POST(
            new Request(
              "http://localhost/api/v1/mistake-books/mistake-book-public-001/ai-explanation",
              { method: "POST" },
            ),
            createRouteContext("mistake-book-public-001"),
          )
        ).json(),
      ).resolves.toMatchObject({
        code: 0,
        data: {
          aiExplanation: {
            explanationStatus: "explained",
          },
        },
      });
      expect(calls).toEqual([
        "exam_report.generation",
        "exam_report.retry_learning_suggestion",
        "mistake_book.ai_explanation",
      ]);
    },
    STUDENT_EXPERIENCE_LAYERING_TEST_TIMEOUT_MS,
  );

  it("marks standard student route pages with scoped UI coverage", () => {
    const pageBoundarySource = expectAllowedSourceExists(
      "src/app/(student)/student-experience-page-boundary.ts",
    );
    const pageBoundary = readFileSync(pageBoundarySource, "utf8");

    expect(pageBoundary).toContain("CAP-STD-PRACTICE");
    expect(pageBoundary).toContain("CAP-STD-MOCK-EXAM");
    expect(pageBoundary).toContain("CAP-STD-EXAM-REPORT-MISTAKE-BOOK");
    expect(pageBoundary).toContain("objective_question_only");
    expect(readAllowedSource("src/app/(student)/practice/page.tsx")).toContain(
      "studentExperiencePageBoundary.practice",
    );
    expect(readAllowedSource("src/app/(student)/mock-exam/page.tsx")).toContain(
      "studentExperiencePageBoundary.mockExam",
    );
    expect(
      readAllowedSource("src/app/(student)/exam-report/page.tsx"),
    ).toContain("studentExperiencePageBoundary.examReport");
    expect(
      readAllowedSource("src/app/(student)/mistake-book/page.tsx"),
    ).toContain("studentExperiencePageBoundary.mistakeBook");
  });
});
