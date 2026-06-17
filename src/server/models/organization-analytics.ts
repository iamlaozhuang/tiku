import type {
  OrganizationAnalyticsAnswerOrganizationSnapshotDto,
  OrganizationAnalyticsAuditLogReferenceAction,
  OrganizationAnalyticsAuditLogReferenceDto,
  OrganizationAnalyticsDateRangeDto,
  OrganizationAnalyticsEmployeeTrainingSummaryDto,
  OrganizationAnalyticsExportReadinessAssessmentDto,
  OrganizationAnalyticsExportReadinessBlockedReason,
  OrganizationAnalyticsExportScope,
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

export type OrganizationAnalyticsEmployeeTrainingSubmission =
  OrganizationTrainingOfficialSubmission & {
    trainingVersionPublicId: string;
    answerOrganizationSnapshot: OrganizationAnalyticsAnswerOrganizationSnapshotDto;
  };

export type OrganizationAnalyticsEmployeeTrainingSummaryInput = {
  employeePublicId: string;
  employeeDisplayName: string;
  organizationPublicId: string;
  organizationName: string;
  visibleTrainingVersionPublicIds: readonly string[];
  officialSubmissions: readonly OrganizationAnalyticsEmployeeTrainingSubmission[];
  dateRange: OrganizationAnalyticsDateRangeDto;
};

export type OrganizationAnalyticsExportReadinessRowRedactionStatus =
  | "aggregate_only"
  | "summary_only"
  | "detail_only";

export type OrganizationAnalyticsExportReadinessRow = {
  rowPublicId?: string;
  sourceRowId?: number;
  redactionStatus: OrganizationAnalyticsExportReadinessRowRedactionStatus;
};

export type OrganizationAnalyticsExportReadinessInput = {
  exportScope: OrganizationAnalyticsExportScope;
  summaryRows: readonly OrganizationAnalyticsExportReadinessRow[];
  objectStorageAvailable: boolean;
  externalDeliveryAvailable: boolean;
};

export type OrganizationAnalyticsAuditLogReferenceInput = {
  action: OrganizationAnalyticsAuditLogReferenceAction;
  organizationPublicId: string;
  scopeOrganizationPublicIds: readonly string[];
  dateRange: OrganizationAnalyticsDateRangeDto;
  referencePublicId: string;
  summaryRowCount: number;
  recordedAt: string;
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

function selectLatestEmployeeTrainingSubmission(
  officialSubmissions: readonly OrganizationAnalyticsEmployeeTrainingSubmission[],
) {
  return officialSubmissions.reduce<OrganizationAnalyticsEmployeeTrainingSubmission | null>(
    (latestSubmission, currentSubmission) => {
      if (latestSubmission === null) {
        return currentSubmission;
      }

      return Date.parse(currentSubmission.submittedAt) >
        Date.parse(latestSubmission.submittedAt)
        ? currentSubmission
        : latestSubmission;
    },
    null,
  );
}

function selectLatestEmployeeTrainingSubmissionsByVersion(
  officialSubmissions: readonly OrganizationAnalyticsEmployeeTrainingSubmission[],
) {
  const latestSubmissionByTrainingVersion = officialSubmissions.reduce<
    Record<string, OrganizationAnalyticsEmployeeTrainingSubmission>
  >((latestSubmissions, submission) => {
    const existingSubmission =
      latestSubmissions[submission.trainingVersionPublicId];

    if (
      existingSubmission === undefined ||
      Date.parse(submission.submittedAt) >
        Date.parse(existingSubmission.submittedAt)
    ) {
      return {
        ...latestSubmissions,
        [submission.trainingVersionPublicId]: submission,
      };
    }

    return latestSubmissions;
  }, {});

  return Object.values(latestSubmissionByTrainingVersion);
}

export function createOrganizationTrainingAggregateMetrics(
  input: OrganizationTrainingAggregateMetricsInput,
): OrganizationTrainingAggregateMetricsDto {
  const eligibleEmployeePublicIds = [
    ...new Set(input.eligibleEmployeePublicIds),
  ];
  const eligibleEmployeePublicIdSet = new Set(eligibleEmployeePublicIds);
  const officialSubmissionsInRange = input.officialSubmissions.filter(
    (submission) =>
      eligibleEmployeePublicIdSet.has(submission.employeePublicId) &&
      isWithinDateRange(submission.submittedAt, input.dateRange),
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

export function createOrganizationAnalyticsEmployeeTrainingSummary(
  input: OrganizationAnalyticsEmployeeTrainingSummaryInput,
): OrganizationAnalyticsEmployeeTrainingSummaryDto {
  const visibleTrainingVersionPublicIds = [
    ...new Set(input.visibleTrainingVersionPublicIds),
  ];
  const visibleTrainingVersionPublicIdSet = new Set(
    visibleTrainingVersionPublicIds,
  );
  const officialSubmissionsInRange = input.officialSubmissions.filter(
    (submission) =>
      submission.employeePublicId === input.employeePublicId &&
      visibleTrainingVersionPublicIdSet.has(
        submission.trainingVersionPublicId,
      ) &&
      isWithinDateRange(submission.submittedAt, input.dateRange),
  );
  const latestOfficialSubmissionsInRange =
    selectLatestEmployeeTrainingSubmissionsByVersion(
      officialSubmissionsInRange,
    );
  const latestSubmission = selectLatestEmployeeTrainingSubmission(
    latestOfficialSubmissionsInRange,
  );
  const submittedTrainingCount = new Set(
    latestOfficialSubmissionsInRange.map(
      (submission) => submission.trainingVersionPublicId,
    ),
  ).size;
  const visibleTrainingCount = visibleTrainingVersionPublicIds.length;

  return {
    employeePublicId: input.employeePublicId,
    employeeDisplayName: input.employeeDisplayName,
    organizationPublicId: input.organizationPublicId,
    organizationName: input.organizationName,
    answerOrganizationSnapshot:
      latestSubmission === null
        ? null
        : {
            organizationPublicId:
              latestSubmission.answerOrganizationSnapshot.organizationPublicId,
            organizationName:
              latestSubmission.answerOrganizationSnapshot.organizationName,
            capturedAt: latestSubmission.answerOrganizationSnapshot.capturedAt,
          },
    visibleTrainingCount,
    submittedTrainingCount,
    unfinishedTrainingCount: Math.max(
      visibleTrainingCount - submittedTrainingCount,
      0,
    ),
    trainingCompletionRate:
      visibleTrainingCount === 0
        ? 0
        : submittedTrainingCount / visibleTrainingCount,
    trainingAverageScore: calculateAverageScore(
      latestOfficialSubmissionsInRange,
    ),
    latestTrainingSubmittedAt: latestSubmission?.submittedAt ?? null,
    redactionStatus: "summary_only",
  };
}

function selectOrganizationAnalyticsExportReadinessBlockedReasons(
  input: OrganizationAnalyticsExportReadinessInput,
): OrganizationAnalyticsExportReadinessBlockedReason[] {
  const dependencyBlockedReasons: OrganizationAnalyticsExportReadinessBlockedReason[] =
    [
      ...(input.objectStorageAvailable
        ? []
        : ([
            "object_storage_not_configured",
          ] satisfies OrganizationAnalyticsExportReadinessBlockedReason[])),
      ...(input.externalDeliveryAvailable
        ? []
        : ([
            "external_delivery_not_configured",
          ] satisfies OrganizationAnalyticsExportReadinessBlockedReason[])),
    ];
  const hasDetailRow = input.summaryRows.some(
    (row) => row.redactionStatus === "detail_only",
  );
  const contentBlockedReasons: OrganizationAnalyticsExportReadinessBlockedReason[] =
    [
      ...(input.summaryRows.length === 0
        ? ([
            "no_summary_rows",
          ] satisfies OrganizationAnalyticsExportReadinessBlockedReason[])
        : []),
      ...(hasDetailRow
        ? ([
            "non_summary_detail_detected",
          ] satisfies OrganizationAnalyticsExportReadinessBlockedReason[])
        : []),
    ];

  return [...dependencyBlockedReasons, ...contentBlockedReasons];
}

export function createOrganizationAnalyticsExportReadinessAssessment(
  input: OrganizationAnalyticsExportReadinessInput,
): OrganizationAnalyticsExportReadinessAssessmentDto {
  const blockedReasons =
    selectOrganizationAnalyticsExportReadinessBlockedReasons(input);

  return {
    exportScope: input.exportScope,
    readinessStatus: blockedReasons.length === 0 ? "ready" : "blocked",
    summaryRowCount: input.summaryRows.length,
    blockedReasons,
    objectStorageStatus: input.objectStorageAvailable
      ? "configured"
      : "not_configured",
    externalDeliveryStatus: input.externalDeliveryAvailable
      ? "configured"
      : "not_configured",
    generatedFile: null,
    downloadUrl: null,
    externalDelivery: null,
    redactionStatus: "summary_only",
  };
}

export function createOrganizationAnalyticsAuditLogRedactedReference(
  input: OrganizationAnalyticsAuditLogReferenceInput,
): OrganizationAnalyticsAuditLogReferenceDto {
  return {
    action: input.action,
    organizationPublicId: input.organizationPublicId,
    scopeOrganizationCount: new Set(input.scopeOrganizationPublicIds).size,
    dateRange: {
      startAt: input.dateRange.startAt,
      endAt: input.dateRange.endAt,
    },
    referencePublicId: input.referencePublicId,
    summaryRowCount: input.summaryRowCount,
    redactionStatus: "redacted_reference",
    persistenceStatus: "not_written",
    recordedAt: input.recordedAt,
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
