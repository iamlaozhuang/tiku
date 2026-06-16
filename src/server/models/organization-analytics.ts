import type {
  OrganizationAnalyticsDateRangeDto,
  OrganizationAnalyticsSubmittedTrendPointDto,
  OrganizationTrainingAggregateMetricsDto,
} from "../contracts/organization-analytics-contract";

export const organizationAnalyticsTrainingVersionStatusValues = [
  "published",
  "taken_down",
] as const;

export type OrganizationAnalyticsTrainingVersionStatus =
  (typeof organizationAnalyticsTrainingVersionStatusValues)[number];

export type OrganizationTrainingOfficialSubmission = {
  employeePublicId: string;
  score: number;
  totalScore: number;
  submittedAt: string;
};

export type OrganizationTrainingAggregateMetricsInput = {
  eligibleEmployeePublicIds: readonly string[];
  officialSubmissions: readonly OrganizationTrainingOfficialSubmission[];
  dateRange: OrganizationAnalyticsDateRangeDto;
};

export type OrganizationAnalyticsHistoricalTrainingVersion = {
  trainingVersionPublicId: string;
  status: OrganizationAnalyticsTrainingVersionStatus;
};

export type OrganizationTrainingEmployeeRankingSummary = {
  employeePublicId: string;
  trainingAverageScore: number | null;
  trainingCompletionRate: number;
  latestTrainingSubmittedAt: string | null;
};

function isWithinDateRange(
  submittedAt: string,
  dateRange: OrganizationAnalyticsDateRangeDto,
) {
  const submittedTime = Date.parse(submittedAt);
  const startTime = Date.parse(dateRange.startAt);
  const endTime = Date.parse(dateRange.endAt);

  return submittedTime >= startTime && submittedTime <= endTime;
}

function createSubmittedTrend(
  officialSubmissions: readonly OrganizationTrainingOfficialSubmission[],
): OrganizationAnalyticsSubmittedTrendPointDto[] {
  const submittedCountsByDate = officialSubmissions.reduce<
    Record<string, number>
  >((submittedCounts, submission) => {
    const submittedDate = submission.submittedAt.slice(0, 10);

    return {
      ...submittedCounts,
      [submittedDate]: (submittedCounts[submittedDate] ?? 0) + 1,
    };
  }, {});

  return Object.entries(submittedCountsByDate)
    .sort(([leftDate], [rightDate]) => leftDate.localeCompare(rightDate))
    .map(([date, submittedCount]) => ({
      date,
      submittedCount,
    }));
}

function calculateAverageScore(
  officialSubmissions: readonly OrganizationTrainingOfficialSubmission[],
) {
  if (officialSubmissions.length === 0) {
    return null;
  }

  const totalScore = officialSubmissions.reduce(
    (scoreSum, submission) => scoreSum + submission.score,
    0,
  );

  return totalScore / officialSubmissions.length;
}

export function createOrganizationTrainingAggregateMetrics(
  input: OrganizationTrainingAggregateMetricsInput,
): OrganizationTrainingAggregateMetricsDto {
  const eligibleEmployeePublicIds = [
    ...new Set(input.eligibleEmployeePublicIds),
  ];
  const officialSubmissionsInRange = input.officialSubmissions.filter(
    (submission) => isWithinDateRange(submission.submittedAt, input.dateRange),
  );
  const submittedEmployeeCount = new Set(
    officialSubmissionsInRange.map((submission) => submission.employeePublicId),
  ).size;
  const eligibleEmployeeCount = eligibleEmployeePublicIds.length;
  const scores = officialSubmissionsInRange.map(
    (submission) => submission.score,
  );

  return {
    eligibleEmployeeCount,
    submittedEmployeeCount,
    unfinishedEmployeeCount: Math.max(
      eligibleEmployeeCount - submittedEmployeeCount,
      0,
    ),
    completionRate:
      eligibleEmployeeCount === 0
        ? 0
        : submittedEmployeeCount / eligibleEmployeeCount,
    averageScore: calculateAverageScore(officialSubmissionsInRange),
    maxScore: scores.length === 0 ? null : Math.max(...scores),
    minScore: scores.length === 0 ? null : Math.min(...scores),
    submittedTrend: createSubmittedTrend(officialSubmissionsInRange),
  };
}

export function selectHistoricalOrganizationTrainingVersionPublicIds(
  versions: readonly OrganizationAnalyticsHistoricalTrainingVersion[],
): string[] {
  return versions.map((version) => version.trainingVersionPublicId);
}

export function rankOrganizationTrainingEmployeeSummaries(
  employeeSummaries: readonly OrganizationTrainingEmployeeRankingSummary[],
): OrganizationTrainingEmployeeRankingSummary[] {
  return [...employeeSummaries].sort((leftSummary, rightSummary) => {
    if (leftSummary.trainingAverageScore === null) {
      return rightSummary.trainingAverageScore === null ? 0 : 1;
    }

    if (rightSummary.trainingAverageScore === null) {
      return -1;
    }

    if (
      leftSummary.trainingAverageScore !== rightSummary.trainingAverageScore
    ) {
      return (
        rightSummary.trainingAverageScore - leftSummary.trainingAverageScore
      );
    }

    if (
      leftSummary.trainingCompletionRate !== rightSummary.trainingCompletionRate
    ) {
      return (
        rightSummary.trainingCompletionRate - leftSummary.trainingCompletionRate
      );
    }

    if (leftSummary.latestTrainingSubmittedAt === null) {
      return rightSummary.latestTrainingSubmittedAt === null ? 0 : 1;
    }

    if (rightSummary.latestTrainingSubmittedAt === null) {
      return -1;
    }

    return leftSummary.latestTrainingSubmittedAt.localeCompare(
      rightSummary.latestTrainingSubmittedAt,
    );
  });
}
