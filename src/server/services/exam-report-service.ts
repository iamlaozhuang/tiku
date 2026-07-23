import {
  createErrorResponse,
  createPaginatedResponse,
  createSuccessResponse,
  type ApiResponse,
} from "../contracts/api-response";
import type {
  ExamReportListResultDto,
  ExamReportResultDto,
} from "../contracts/exam-report-contract";
import {
  EXAM_REPORT_LEARNING_SUGGESTION_PENDING_RECOVERY_MS,
  EXAM_REPORT_LEARNING_SUGGESTION_STALE_MS,
  EXAM_REPORT_LEARNING_SUGGESTION_TIMEOUT_MS,
  mapExamReportDetailToApi,
  mapExamReportSummaryToApi,
  projectExamReportLearningSuggestionLifecycle,
} from "../mappers/exam-report-mapper";
import { buildExamReportSnapshot } from "../repositories/exam-report-repository";
import {
  calculateDurationSecond,
  getPaperName,
} from "../repositories/exam-report-repository";
import type {
  ExamReportAuthorizationScopeRow,
  ExamReportMockExamRow,
  ExamReportRepository,
  ExamReportRow,
} from "../repositories/exam-report-repository";
import type {
  AiMockProviderPromptTemplateSnapshot,
  LearningSuggestionMockContext,
} from "./ai-mock-provider-runtime";
import { LearningSuggestionRuntimeTimeoutError } from "./ai-mock-provider-runtime";
import type { ModelConfigSnapshot } from "../models/ai-rag";
import {
  buildLearningSuggestionInput,
  LearningSuggestionInputIntegrityError,
  type LearningSuggestionInput,
  validatePersistedLearningSuggestionSnapshot,
} from "./learning-suggestion-input";
import {
  normalizeExamReportListQuery,
  normalizeGenerateExamReportInput,
  normalizeRetryLearningSuggestionInput,
} from "../validators/exam-report";

export { buildExamReportSnapshot } from "../repositories/exam-report-repository";

export type ExamReportUserContext = {
  userPublicId: string;
  organizationPublicId?: string | null;
};

export type ExamReportClock = {
  now(): Date;
};

export type ExamReportPublicIdFactory = {
  createPublicId(prefix: "exam_report"): string;
};

export type ExamReportLearningSuggestionRuntime = {
  generateLearningSuggestion(context: LearningSuggestionMockContext): Promise<{
    learningSuggestion: string;
    aiCallLog: unknown;
  }>;
};

export type ExamReportLearningSuggestionOptions = {
  learningSuggestionRuntime: ExamReportLearningSuggestionRuntime;
  modelConfigSnapshot: ModelConfigSnapshot;
  promptTemplate: AiMockProviderPromptTemplateSnapshot;
};

export type ExamReportService = {
  listExamReports(
    userContext: ExamReportUserContext,
    query: unknown,
  ): Promise<ApiResponse<ExamReportListResultDto>>;
  getExamReport(
    userContext: ExamReportUserContext,
    publicId: string,
  ): Promise<ApiResponse<ExamReportResultDto | null>>;
  generateExamReport(
    userContext: ExamReportUserContext,
    input: unknown,
  ): Promise<ApiResponse<ExamReportResultDto | null>>;
  retryLearningSuggestion(
    userContext: ExamReportUserContext,
    publicId: string,
    input: unknown,
  ): Promise<ApiResponse<null>>;
};

const examReportContractTerm = "exam_report";
const snapshotContractTerm = "snapshot";
const scoringContractTerm = "scoring";

void [examReportContractTerm, snapshotContractTerm, scoringContractTerm];

const systemClock: ExamReportClock = {
  now() {
    return new Date();
  },
};

const systemPublicIdFactory: ExamReportPublicIdFactory = {
  createPublicId(prefix) {
    return `${prefix}_${crypto.randomUUID()}`;
  },
};

function hasEffectiveAuthorization(
  scopes: ExamReportAuthorizationScopeRow[],
  reportScope: { profession: ExamReportRow["profession"]; level: number },
): boolean {
  return scopes.some(
    (scope) =>
      scope.profession === reportScope.profession &&
      scope.level === reportScope.level,
  );
}

function createExamReportNotFoundResponse(): ApiResponse<null> {
  return createErrorResponse(404321, "Exam report does not exist.");
}

function createMockExamNotFoundResponse(): ApiResponse<null> {
  return createErrorResponse(404322, "Mock exam does not exist.");
}

function buildLearningSuggestionSnapshot(
  input: LearningSuggestionInput,
  result: Awaited<
    ReturnType<
      ExamReportLearningSuggestionRuntime["generateLearningSuggestion"]
    >
  >,
  options: ExamReportLearningSuggestionOptions,
  generatedAt: Date,
) {
  return {
    status: "generated",
    learningSuggestion: result.learningSuggestion,
    evidenceStatus: "none",
    generatedAt: generatedAt.toISOString(),
    inputSchemaVersion: input.schemaVersion,
    inputDigest: input.inputDigest,
    reportRevision: input.reportRevision,
    modelConfigSnapshot: {
      modelConfigPublicId: options.modelConfigSnapshot.modelConfigPublicId,
      aiFuncType: options.modelConfigSnapshot.aiFuncType,
      modelName: options.modelConfigSnapshot.modelName,
      providerDisplayName: options.modelConfigSnapshot.providerDisplayName,
      configVersion: options.modelConfigSnapshot.configVersion,
    },
    promptTemplate: {
      promptTemplateKey: options.promptTemplate.promptTemplateKey,
      version: options.promptTemplate.version,
      templateHash: options.promptTemplate.templateHash,
    },
  };
}

function canGenerateReport(mockExam: ExamReportMockExamRow): boolean {
  return ["completed", "scoring_partial_failed"].includes(mockExam.exam_status);
}

async function listScopes(
  repository: ExamReportRepository,
  userContext: ExamReportUserContext,
): Promise<ExamReportAuthorizationScopeRow[]> {
  return repository.listEffectiveAuthorizationScopes({
    userPublicId: userContext.userPublicId,
  });
}

async function getAuthorizedReport(
  repository: ExamReportRepository,
  userContext: ExamReportUserContext,
  publicId: string,
): Promise<ExamReportRow | ApiResponse<null>> {
  const scopes = await listScopes(repository, userContext);
  const report = await repository.findExamReportByPublicId({
    userPublicId: userContext.userPublicId,
    publicId,
  });

  if (report === null) {
    return createExamReportNotFoundResponse();
  }

  if (!hasEffectiveAuthorization(scopes, report)) {
    return createExamReportNotFoundResponse();
  }

  return report;
}

function isExamReportRow(
  value: ExamReportRow | ApiResponse<null>,
): value is ExamReportRow {
  return "public_id" in value;
}

function createLearningSuggestionInput(report: ExamReportRow) {
  if (report.report_revision === null || report.report_revision <= 0) {
    throw new LearningSuggestionInputIntegrityError();
  }
  return buildLearningSuggestionInput({
    report: {
      publicId: report.public_id,
      reportRevision: report.report_revision,
      mockExamPublicId: report.mock_exam_public_id,
      paperPublicId: report.paper_public_id,
      profession: report.profession,
      level: report.level,
      subject: report.subject,
      examStatus: report.exam_status,
      objectiveScore: report.objective_score,
      subjectiveScore: report.subjective_score,
      totalScore: report.total_score,
      durationSecond: report.duration_second,
      reportSnapshot: report.report_snapshot,
    },
  });
}

type LearningSuggestionAttemptDisposition =
  | "succeeded"
  | "failed"
  | "not_claimed"
  | "stale"
  | "input_unavailable";

async function executeLearningSuggestionAttempt(
  repository: ExamReportRepository,
  report: ExamReportRow,
  userContext: ExamReportUserContext,
  claimMode: "automatic" | "manual",
  clock: ExamReportClock,
  options: ExamReportLearningSuggestionOptions | undefined,
): Promise<LearningSuggestionAttemptDisposition> {
  const reportRevision = report.report_revision;
  if (reportRevision === null || reportRevision <= 0) {
    return "input_unavailable";
  }
  let learningSuggestionInput: LearningSuggestionInput;
  try {
    learningSuggestionInput = createLearningSuggestionInput(report);
  } catch (error) {
    if (!(error instanceof LearningSuggestionInputIntegrityError)) {
      throw error;
    }
    if (report.learning_suggestion_status === "pending") {
      try {
        await repository.failPendingExamReportLearningSuggestionInput({
          userPublicId: userContext.userPublicId,
          publicId: report.public_id,
          expectedReportRevision: reportRevision,
          completedAt: clock.now(),
        });
      } catch {
        return "stale";
      }
    }
    return "input_unavailable";
  }

  const claimedAt = clock.now();
  const attempt = await repository.claimExamReportLearningSuggestion({
    userPublicId: userContext.userPublicId,
    publicId: report.public_id,
    expectedReportRevision: learningSuggestionInput.reportRevision,
    inputDigest: learningSuggestionInput.inputDigest,
    claimMode,
    claimedAt,
    pendingRecoveryBefore: new Date(
      claimedAt.getTime() - EXAM_REPORT_LEARNING_SUGGESTION_PENDING_RECOVERY_MS,
    ),
    staleRunningBefore: new Date(
      claimedAt.getTime() - EXAM_REPORT_LEARNING_SUGGESTION_STALE_MS,
    ),
  });

  if (attempt === null) {
    return "not_claimed";
  }

  if (options === undefined) {
    try {
      await repository.failExamReportLearningSuggestion({
        ...attempt,
        failureCategory: "configuration_unavailable",
        completedAt: clock.now(),
      });
      return "failed";
    } catch {
      return "stale";
    }
  }

  let providerCompleted = false;
  try {
    const learningSuggestionResult =
      await options.learningSuggestionRuntime.generateLearningSuggestion({
        userPublicId: userContext.userPublicId,
        organizationPublicId: userContext.organizationPublicId ?? null,
        profession: report.profession,
        level: report.level,
        mockExamPublicId: report.mock_exam_public_id,
        learningSuggestionInput,
        modelConfigSnapshot: options.modelConfigSnapshot,
        promptTemplate: options.promptTemplate,
        startedAt: attempt.claimedAt,
        hardTimeoutMs: EXAM_REPORT_LEARNING_SUGGESTION_TIMEOUT_MS,
      });
    providerCompleted = true;
    const completedAt = clock.now();
    await repository.finalizeExamReportLearningSuggestion({
      ...attempt,
      learningSuggestionSnapshot: buildLearningSuggestionSnapshot(
        learningSuggestionInput,
        learningSuggestionResult,
        options,
        completedAt,
      ),
      completedAt,
    });
    return "succeeded";
  } catch (error) {
    if (providerCompleted) {
      return "stale";
    }
    try {
      await repository.failExamReportLearningSuggestion({
        ...attempt,
        failureCategory:
          error instanceof LearningSuggestionRuntimeTimeoutError
            ? "timeout"
            : "provider_failed",
        completedAt: clock.now(),
      });
      return "failed";
    } catch {
      return "stale";
    }
  }
}

export function createExamReportService(
  repository: ExamReportRepository,
  clock: ExamReportClock = systemClock,
  publicIdFactory: ExamReportPublicIdFactory = systemPublicIdFactory,
  learningSuggestionOptions?: ExamReportLearningSuggestionOptions,
): ExamReportService {
  return {
    async listExamReports(userContext, query) {
      const normalizedQuery = normalizeExamReportListQuery(query);
      const reportPage = await repository.listExamReports({
        userPublicId: userContext.userPublicId,
        ...normalizedQuery,
      });

      return createPaginatedResponse(
        {
          examReports: reportPage.rows.map(mapExamReportSummaryToApi),
        },
        {
          page: normalizedQuery.page,
          pageSize: normalizedQuery.pageSize,
          total: reportPage.total,
          sortBy: normalizedQuery.sortBy,
          sortOrder: normalizedQuery.sortOrder,
        },
      );
    },

    async getExamReport(userContext, publicId) {
      const report = await getAuthorizedReport(
        repository,
        userContext,
        publicId,
      );

      if (!isExamReportRow(report)) {
        return report;
      }

      return createSuccessResponse({
        examReport: mapExamReportDetailToApi(report, clock.now()),
      });
    },

    async generateExamReport(userContext, input) {
      const normalizedInput = normalizeGenerateExamReportInput(input);

      if (normalizedInput === null) {
        return createErrorResponse(422322, "Exam report input is invalid.");
      }

      const existingReport = await repository.findExamReportByMockExamPublicId({
        userPublicId: userContext.userPublicId,
        mockExamPublicId: normalizedInput.mockExamPublicId,
      });

      const mockExam = await repository.findSubmittedMockExamByPublicId({
        userPublicId: userContext.userPublicId,
        mockExamPublicId: normalizedInput.mockExamPublicId,
      });

      if (mockExam === null) {
        return createMockExamNotFoundResponse();
      }

      if (mockExam.exam_status === "terminated") {
        return createErrorResponse(
          409321,
          "Terminated mock exam cannot generate exam report.",
        );
      }

      if (!canGenerateReport(mockExam)) {
        return createErrorResponse(
          409322,
          "Mock exam scoring is not ready for exam report.",
        );
      }

      const scopes = await listScopes(repository, userContext);

      if (!hasEffectiveAuthorization(scopes, mockExam)) {
        return createMockExamNotFoundResponse();
      }

      const answerRecords = await repository.listMockExamAnswerRecords({
        userPublicId: userContext.userPublicId,
        mockExamPublicId: normalizedInput.mockExamPublicId,
      });
      const generatedAt = clock.now();
      const reportInput = {
        publicId:
          existingReport?.public_id ??
          publicIdFactory.createPublicId("exam_report"),
        userPublicId: userContext.userPublicId,
        mockExamPublicId: mockExam.public_id,
        paperPublicId: mockExam.paper_public_id,
        paperName: getPaperName(mockExam.paper_snapshot),
        profession: mockExam.profession,
        level: mockExam.level,
        subject: mockExam.subject,
        examStatus: mockExam.exam_status,
        objectiveScore: mockExam.objective_score,
        subjectiveScore: mockExam.subjective_score,
        totalScore: mockExam.total_score,
        durationSecond: calculateDurationSecond(mockExam),
        reportSnapshot: buildExamReportSnapshot(mockExam, answerRecords),
        learningSuggestionSnapshot: null,
        generatedAt,
      } as const;
      const report =
        existingReport === null
          ? await repository.createExamReport(reportInput)
          : await repository.rebuildExamReport(reportInput);

      let currentReport = report;
      if (report.learning_suggestion_status === "pending") {
        await executeLearningSuggestionAttempt(
          repository,
          report,
          userContext,
          "automatic",
          clock,
          learningSuggestionOptions,
        );
        currentReport =
          (await repository.findExamReportByPublicId({
            userPublicId: userContext.userPublicId,
            publicId: report.public_id,
          })) ?? report;
      }
      return createSuccessResponse({
        examReport: mapExamReportDetailToApi(currentReport, clock.now()),
      });
    },

    async retryLearningSuggestion(userContext, publicId, input) {
      normalizeRetryLearningSuggestionInput(input);

      const report = await getAuthorizedReport(
        repository,
        userContext,
        publicId,
      );

      if (!isExamReportRow(report)) {
        return report;
      }

      if (report.learning_suggestion_status === null) {
        return createErrorResponse(
          409323,
          "Learning suggestion input is unavailable.",
        );
      }

      if (report.learning_suggestion_status === "succeeded") {
        try {
          const learningSuggestionInput = createLearningSuggestionInput(report);
          if (report.learning_suggestion_snapshot === null) {
            throw new LearningSuggestionInputIntegrityError();
          }
          validatePersistedLearningSuggestionSnapshot(
            report.learning_suggestion_snapshot,
            learningSuggestionInput,
            learningSuggestionOptions === undefined
              ? undefined
              : {
                  modelConfigSnapshot: {
                    modelConfigPublicId:
                      learningSuggestionOptions.modelConfigSnapshot
                        .modelConfigPublicId,
                    aiFuncType:
                      learningSuggestionOptions.modelConfigSnapshot.aiFuncType,
                    modelName:
                      learningSuggestionOptions.modelConfigSnapshot.modelName,
                    providerDisplayName:
                      learningSuggestionOptions.modelConfigSnapshot
                        .providerDisplayName,
                    configVersion:
                      learningSuggestionOptions.modelConfigSnapshot
                        .configVersion,
                  },
                  promptTemplate: {
                    promptTemplateKey:
                      learningSuggestionOptions.promptTemplate
                        .promptTemplateKey,
                    version: learningSuggestionOptions.promptTemplate.version,
                    templateHash:
                      learningSuggestionOptions.promptTemplate.templateHash,
                  },
                },
          );
          return createSuccessResponse(null);
        } catch (error) {
          if (error instanceof LearningSuggestionInputIntegrityError) {
            return createErrorResponse(
              409323,
              "Learning suggestion input is unavailable.",
            );
          }
          throw error;
        }
      }
      const lifecycle = projectExamReportLearningSuggestionLifecycle(
        report,
        clock.now(),
      );
      if (!lifecycle.canRetry) {
        return createErrorResponse(
          409324,
          "Learning suggestion is not retryable.",
        );
      }
      const disposition = await executeLearningSuggestionAttempt(
        repository,
        report,
        userContext,
        "manual",
        clock,
        learningSuggestionOptions,
      );
      return disposition === "input_unavailable"
        ? createErrorResponse(
            409323,
            "Learning suggestion input is unavailable.",
          )
        : disposition === "stale"
          ? createErrorResponse(409325, "Learning suggestion attempt is stale.")
          : createSuccessResponse(null);
    },
  };
}

export function createUnavailableExamReportService(): ExamReportService {
  return {
    async listExamReports() {
      return createPaginatedResponse(
        {
          examReports: [],
        },
        {
          page: 1,
          pageSize: 20,
          total: 0,
          sortBy: "startedAt",
          sortOrder: "desc",
        },
        "Exam report runtime is not configured.",
      );
    },
    async getExamReport() {
      return createErrorResponse(
        503321,
        "Exam report runtime is not configured.",
      );
    },
    async generateExamReport() {
      return createErrorResponse(
        503321,
        "Exam report runtime is not configured.",
      );
    },
    async retryLearningSuggestion() {
      return createErrorResponse(
        503321,
        "Exam report runtime is not configured.",
      );
    },
  };
}
