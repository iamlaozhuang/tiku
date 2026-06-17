import type { OrganizationAnalyticsDateRangeDto } from "../contracts/organization-analytics-contract";
import type {
  OrganizationAnalyticsEmployeeTrainingSummaryInput,
  OrganizationAnalyticsExportReadinessRow,
  OrganizationTrainingAggregateMetricsInput,
  OrganizationTrainingOfficialSubmission,
} from "../models/organization-analytics";

export type OrganizationAnalyticsVisibleOrganizationScopeLookupInput = {
  adminPublicId: string;
};

export type OrganizationAnalyticsScopeReadInput = {
  organizationPublicId: string;
  scopeOrganizationPublicIds: readonly string[];
  dateRange: OrganizationAnalyticsDateRangeDto;
};

export type OrganizationAnalyticsTrainingAggregateMetricsRepositoryInput = Omit<
  OrganizationTrainingAggregateMetricsInput,
  "dateRange"
>;

export type OrganizationAnalyticsEmployeeTrainingSummaryRepositoryInput = Omit<
  OrganizationAnalyticsEmployeeTrainingSummaryInput,
  "dateRange"
>;

export type OrganizationAnalyticsFormalLearningSummary = {
  formalPracticeCount: number;
  formalMockExamCount: number;
  formalExamReportCount: number;
  formalMistakeBookCount: number;
  redactionStatus: "summary_only";
};

export type OrganizationAnalyticsQuotaSummary = {
  employeeAiTaskCount: number;
  employeeAiSucceededTaskCount: number;
  employeeAiFailedTaskCount: number;
  employeeAiQuotaConsumedPoint: number;
  organizationTrainingGenerationConsumedPoint: number;
  quotaRemainingPoint: number | null;
  redactionStatus: "summary_only";
};

export type OrganizationAnalyticsRepositoryExportReadinessRow = {
  rowPublicId: string;
  redactionStatus: Extract<
    OrganizationAnalyticsExportReadinessRow["redactionStatus"],
    "aggregate_only" | "summary_only"
  >;
};

export type OrganizationAnalyticsRepositoryGateway = {
  findVisibleOrganizationScopeByAdminPublicId(
    adminPublicId: string,
  ): Promise<readonly string[] | null>;
  readTrainingAggregateMetricsInput(
    input: OrganizationAnalyticsScopeReadInput,
  ): Promise<OrganizationAnalyticsTrainingAggregateMetricsRepositoryInput | null>;
  readEmployeeTrainingSummaryInputs(
    input: OrganizationAnalyticsScopeReadInput,
  ): Promise<
    readonly OrganizationAnalyticsEmployeeTrainingSummaryRepositoryInput[]
  >;
  readFormalLearningSummary(
    input: OrganizationAnalyticsScopeReadInput,
  ): Promise<Omit<
    OrganizationAnalyticsFormalLearningSummary,
    "redactionStatus"
  > | null>;
  readQuotaSummary(
    input: OrganizationAnalyticsScopeReadInput,
  ): Promise<Omit<OrganizationAnalyticsQuotaSummary, "redactionStatus"> | null>;
  readExportReadinessRows(
    input: OrganizationAnalyticsScopeReadInput,
  ): Promise<readonly OrganizationAnalyticsExportReadinessRow[]>;
};

export type OrganizationAnalyticsRepository = {
  lookupVisibleOrganizationScope(
    input: OrganizationAnalyticsVisibleOrganizationScopeLookupInput,
  ): Promise<readonly string[] | null>;
  readTrainingAggregateMetricsInput(
    input: OrganizationAnalyticsScopeReadInput,
  ): Promise<OrganizationAnalyticsTrainingAggregateMetricsRepositoryInput | null>;
  readEmployeeTrainingSummaryInputs(
    input: OrganizationAnalyticsScopeReadInput,
  ): Promise<
    readonly OrganizationAnalyticsEmployeeTrainingSummaryRepositoryInput[]
  >;
  readFormalLearningSummary(
    input: OrganizationAnalyticsScopeReadInput,
  ): Promise<OrganizationAnalyticsFormalLearningSummary | null>;
  readQuotaSummary(
    input: OrganizationAnalyticsScopeReadInput,
  ): Promise<OrganizationAnalyticsQuotaSummary | null>;
  readExportReadinessRows(
    input: OrganizationAnalyticsScopeReadInput,
  ): Promise<readonly OrganizationAnalyticsRepositoryExportReadinessRow[]>;
};

export type OrganizationAnalyticsPostgresRepositoryFactoryOptions = {
  gateway?: OrganizationAnalyticsRepositoryGateway | null;
};

export type OrganizationAnalyticsTrainingAnswerSourceRow = {
  employeePublicId: string;
  organizationPublicId: string;
  organizationTrainingVersionPublicId: string;
  score: number | string | null;
  totalScore: number | string | null;
  submittedAt: Date | string | null;
};

export type OrganizationAnalyticsTrainingAnswerSourceReader = (
  input: OrganizationAnalyticsScopeReadInput,
) => Promise<readonly OrganizationAnalyticsTrainingAnswerSourceRow[]>;

export type OrganizationAnalyticsTrainingAnswerSourceGatewayOptions = {
  readTrainingAnswerSourceRows: OrganizationAnalyticsTrainingAnswerSourceReader;
};

export function createOrganizationAnalyticsRepository(
  gateway: OrganizationAnalyticsRepositoryGateway,
): OrganizationAnalyticsRepository {
  return {
    async lookupVisibleOrganizationScope(input) {
      const adminPublicId = normalizeRequiredText(input.adminPublicId);

      if (adminPublicId === null) {
        return null;
      }

      const scopeOrganizationPublicIds =
        await gateway.findVisibleOrganizationScopeByAdminPublicId(
          adminPublicId,
        );

      return scopeOrganizationPublicIds === null
        ? null
        : normalizePublicIdList(scopeOrganizationPublicIds);
    },

    async readTrainingAggregateMetricsInput(input) {
      const readInput = normalizeScopeReadInput(input);

      if (readInput === null) {
        return null;
      }

      const trainingAggregateMetricsInput =
        await gateway.readTrainingAggregateMetricsInput(readInput);

      return trainingAggregateMetricsInput === null
        ? null
        : copyTrainingAggregateMetricsInput(trainingAggregateMetricsInput);
    },

    async readEmployeeTrainingSummaryInputs(input) {
      const readInput = normalizeScopeReadInput(input);

      if (readInput === null) {
        return [];
      }

      const employeeTrainingSummaryInputs =
        await gateway.readEmployeeTrainingSummaryInputs(readInput);

      return employeeTrainingSummaryInputs.map(
        copyEmployeeTrainingSummaryInput,
      );
    },

    async readFormalLearningSummary(input) {
      const readInput = normalizeScopeReadInput(input);

      if (readInput === null) {
        return null;
      }

      const formalLearningSummary =
        await gateway.readFormalLearningSummary(readInput);

      return formalLearningSummary === null
        ? null
        : {
            formalPracticeCount: formalLearningSummary.formalPracticeCount,
            formalMockExamCount: formalLearningSummary.formalMockExamCount,
            formalExamReportCount: formalLearningSummary.formalExamReportCount,
            formalMistakeBookCount:
              formalLearningSummary.formalMistakeBookCount,
            redactionStatus: "summary_only",
          };
    },

    async readQuotaSummary(input) {
      const readInput = normalizeScopeReadInput(input);

      if (readInput === null) {
        return null;
      }

      const quotaSummary = await gateway.readQuotaSummary(readInput);

      return quotaSummary === null
        ? null
        : {
            employeeAiTaskCount: quotaSummary.employeeAiTaskCount,
            employeeAiSucceededTaskCount:
              quotaSummary.employeeAiSucceededTaskCount,
            employeeAiFailedTaskCount: quotaSummary.employeeAiFailedTaskCount,
            employeeAiQuotaConsumedPoint:
              quotaSummary.employeeAiQuotaConsumedPoint,
            organizationTrainingGenerationConsumedPoint:
              quotaSummary.organizationTrainingGenerationConsumedPoint,
            quotaRemainingPoint: quotaSummary.quotaRemainingPoint,
            redactionStatus: "summary_only",
          };
    },

    async readExportReadinessRows(input) {
      const readInput = normalizeScopeReadInput(input);

      if (readInput === null) {
        return [];
      }

      const exportReadinessRows =
        await gateway.readExportReadinessRows(readInput);

      return exportReadinessRows.flatMap(copyExportReadinessRow);
    },
  };
}

export function createPostgresOrganizationAnalyticsRepository(
  options: OrganizationAnalyticsPostgresRepositoryFactoryOptions = {},
): OrganizationAnalyticsRepository {
  return options.gateway === undefined || options.gateway === null
    ? createUnavailableOrganizationAnalyticsRepository()
    : createOrganizationAnalyticsRepository(options.gateway);
}

export function createOrganizationAnalyticsTrainingAnswerSourceGateway(
  options: OrganizationAnalyticsTrainingAnswerSourceGatewayOptions,
): OrganizationAnalyticsRepositoryGateway {
  return {
    async findVisibleOrganizationScopeByAdminPublicId() {
      return null;
    },

    async readTrainingAggregateMetricsInput(input) {
      const readInput = normalizeScopeReadInput(input);

      if (readInput === null) {
        return null;
      }

      const trainingAnswerSourceRows =
        await options.readTrainingAnswerSourceRows(readInput);
      const officialSubmissions = trainingAnswerSourceRows.flatMap(
        (trainingAnswerSourceRow) =>
          copyTrainingAnswerSourceSubmission(
            trainingAnswerSourceRow,
            readInput,
          ),
      );

      if (officialSubmissions.length === 0) {
        return null;
      }

      return {
        eligibleEmployeePublicIds: normalizePublicIdList(
          officialSubmissions.map(
            (officialSubmission) => officialSubmission.employeePublicId,
          ),
        ),
        officialSubmissions,
      };
    },

    async readEmployeeTrainingSummaryInputs() {
      return [];
    },

    async readFormalLearningSummary() {
      return null;
    },

    async readQuotaSummary() {
      return null;
    },

    async readExportReadinessRows() {
      return [];
    },
  };
}

function createUnavailableOrganizationAnalyticsRepository(): OrganizationAnalyticsRepository {
  return {
    async lookupVisibleOrganizationScope() {
      return null;
    },
    async readTrainingAggregateMetricsInput() {
      return null;
    },
    async readEmployeeTrainingSummaryInputs() {
      return [];
    },
    async readFormalLearningSummary() {
      return null;
    },
    async readQuotaSummary() {
      return null;
    },
    async readExportReadinessRows() {
      return [];
    },
  };
}

function copyTrainingAnswerSourceSubmission(
  sourceRow: OrganizationAnalyticsTrainingAnswerSourceRow,
  input: OrganizationAnalyticsScopeReadInput,
): OrganizationTrainingOfficialSubmission[] {
  const employeePublicId = normalizeRequiredText(sourceRow.employeePublicId);
  const organizationPublicId = normalizeRequiredText(
    sourceRow.organizationPublicId,
  );
  const score = normalizeScoreValue(sourceRow.score);
  const totalScore = normalizeScoreValue(sourceRow.totalScore);
  const submittedAt = normalizeSubmittedAt(sourceRow.submittedAt);

  if (
    employeePublicId === null ||
    organizationPublicId === null ||
    score === null ||
    totalScore === null ||
    submittedAt === null ||
    totalScore <= 0 ||
    !input.scopeOrganizationPublicIds.includes(organizationPublicId) ||
    !isSubmittedAtWithinDateRange(submittedAt, input.dateRange)
  ) {
    return [];
  }

  return [
    {
      employeePublicId,
      score,
      totalScore,
      submittedAt,
    },
  ];
}

function normalizeScoreValue(value: number | string | null): number | null {
  const score =
    typeof value === "string" ? Number(value.trim()) : (value ?? Number.NaN);

  return Number.isFinite(score) && score >= 0 ? score : null;
}

function normalizeSubmittedAt(value: Date | string | null): string | null {
  if (value instanceof Date) {
    return Number.isFinite(value.getTime()) ? value.toISOString() : null;
  }

  const submittedAt = normalizeRequiredText(value ?? "");

  if (submittedAt === null) {
    return null;
  }

  const submittedTime = Date.parse(submittedAt);

  return Number.isFinite(submittedTime)
    ? new Date(submittedTime).toISOString()
    : null;
}

function isSubmittedAtWithinDateRange(
  submittedAt: string,
  dateRange: OrganizationAnalyticsDateRangeDto,
): boolean {
  const submittedTime = Date.parse(submittedAt);
  const startTime = Date.parse(dateRange.startAt);
  const endTime = Date.parse(dateRange.endAt);

  return (
    Number.isFinite(submittedTime) &&
    Number.isFinite(startTime) &&
    Number.isFinite(endTime) &&
    submittedTime >= startTime &&
    submittedTime <= endTime
  );
}

function normalizeRequiredText(value: string): string | null {
  const trimmedValue = value.trim();

  return trimmedValue.length > 0 ? trimmedValue : null;
}

function normalizePublicIdList(values: readonly string[]): string[] {
  return [
    ...new Set(
      values
        .map((value) => normalizeRequiredText(value))
        .filter((value): value is string => value !== null),
    ),
  ];
}

function normalizeScopeReadInput(
  input: OrganizationAnalyticsScopeReadInput,
): OrganizationAnalyticsScopeReadInput | null {
  const organizationPublicId = normalizeRequiredText(
    input.organizationPublicId,
  );
  const scopeOrganizationPublicIds = normalizePublicIdList(
    input.scopeOrganizationPublicIds,
  );

  if (
    organizationPublicId === null ||
    scopeOrganizationPublicIds.length === 0
  ) {
    return null;
  }

  return {
    organizationPublicId,
    scopeOrganizationPublicIds,
    dateRange: {
      startAt: input.dateRange.startAt,
      endAt: input.dateRange.endAt,
    },
  };
}

function copyTrainingAggregateMetricsInput(
  input: OrganizationAnalyticsTrainingAggregateMetricsRepositoryInput,
): OrganizationAnalyticsTrainingAggregateMetricsRepositoryInput {
  return {
    eligibleEmployeePublicIds: [...input.eligibleEmployeePublicIds],
    officialSubmissions: input.officialSubmissions.map((submission) => ({
      employeePublicId: submission.employeePublicId,
      score: submission.score,
      totalScore: submission.totalScore,
      submittedAt: submission.submittedAt,
    })),
  };
}

function copyEmployeeTrainingSummaryInput(
  input: OrganizationAnalyticsEmployeeTrainingSummaryRepositoryInput,
): OrganizationAnalyticsEmployeeTrainingSummaryRepositoryInput {
  return {
    employeePublicId: input.employeePublicId,
    employeeDisplayName: input.employeeDisplayName,
    organizationPublicId: input.organizationPublicId,
    organizationName: input.organizationName,
    visibleTrainingVersionPublicIds: [...input.visibleTrainingVersionPublicIds],
    officialSubmissions: input.officialSubmissions.map((submission) => ({
      employeePublicId: submission.employeePublicId,
      trainingVersionPublicId: submission.trainingVersionPublicId,
      score: submission.score,
      totalScore: submission.totalScore,
      submittedAt: submission.submittedAt,
      answerOrganizationSnapshot: {
        organizationPublicId:
          submission.answerOrganizationSnapshot.organizationPublicId,
        organizationName:
          submission.answerOrganizationSnapshot.organizationName,
        capturedAt: submission.answerOrganizationSnapshot.capturedAt,
      },
    })),
  };
}

function copyExportReadinessRow(
  row: OrganizationAnalyticsExportReadinessRow,
): OrganizationAnalyticsRepositoryExportReadinessRow[] {
  const rowPublicId = normalizeRequiredText(row.rowPublicId ?? "");

  if (rowPublicId === null || row.redactionStatus === "detail_only") {
    return [];
  }

  return [
    {
      rowPublicId,
      redactionStatus: row.redactionStatus,
    },
  ];
}
