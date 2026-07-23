import {
  admin,
  adminOrganization,
  employee,
  organization,
  organizationTrainingAnswer,
  organizationTrainingVersion,
  organizationTrainingVersionRecipient,
  user,
} from "@/db/schema";
import {
  and,
  asc,
  countDistinct,
  eq,
  gte,
  inArray,
  isNotNull,
  or,
  lte,
  sql,
} from "drizzle-orm";

import type {
  OrganizationAnalyticsDateRangeDto,
  OrganizationAnalyticsEmployeeStatisticsPaginationInput,
} from "../contracts/organization-analytics-contract";
import type {
  OrganizationAnalyticsEmployeeTrainingSummaryInput,
  OrganizationAnalyticsExportReadinessRow,
  OrganizationAnalyticsWeakPointSummaryInput,
  OrganizationTrainingAggregateMetricsInput,
  OrganizationTrainingOfficialSubmission,
} from "../models/organization-analytics";
import type { RuntimeDatabase } from "./runtime-database";
import {
  createOrganizationTrainingVisibleOrganizationPublicIdArraySql,
  validateOrganizationTrainingRecipientSnapshot,
  type OrganizationTrainingRecipientSnapshotEntry,
} from "./organization-training-repository";

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

export type OrganizationAnalyticsEmployeeTrainingSummaryPageInput =
  OrganizationAnalyticsScopeReadInput & {
    pagination: OrganizationAnalyticsEmployeeStatisticsPaginationInput;
  };

export type OrganizationAnalyticsEmployeeTrainingSummaryPage = {
  availability: "available" | "unavailable";
  employeeTrainingSummaryInputs: readonly OrganizationAnalyticsEmployeeTrainingSummaryRepositoryInput[];
  total: number;
};

export type OrganizationAnalyticsTrainingEligibilitySource = {
  availability: "available" | "unavailable";
  eligibleEmployeePublicIds: readonly string[];
  officialSubmissions: readonly OrganizationTrainingOfficialSubmission[];
  employeeTrainingSummaryInputs: readonly OrganizationAnalyticsEmployeeTrainingSummaryRepositoryInput[];
  relevantVersionPublicIds: readonly string[];
};

export type OrganizationAnalyticsTrainingVersionSourceRow = {
  id: number;
  publicId: string;
  organizationPublicId: string;
  publishScopeSnapshot: unknown;
  publishedAt: Date | string | null;
  answerDeadlineAt: Date | string | null;
  takenDownAt: Date | string | null;
  recipientSnapshotSchemaVersion: number | null;
  recipientSnapshotCapturedAt: Date | string | null;
  recipientSnapshotCount: number | null;
  recipientSnapshotDigest: string | null;
};

export type OrganizationAnalyticsTrainingRecipientSourceRow =
  OrganizationTrainingRecipientSnapshotEntry & {
    versionId: number;
    employeeDisplayName: string | null;
    organizationName: string | null;
  };

export type OrganizationAnalyticsTrainingSubmissionSourceRow = {
  versionId: number;
  versionPublicId: string;
  employeePublicId: string;
  organizationPublicId: string;
  authorizationPublicId: string | null;
  score: number | string | null;
  totalScore: number | string | null;
  submittedAt: Date | string | null;
  answerOrganizationSnapshot: OrganizationAnalyticsAnswerOrganizationSnapshot | null;
};

export type OrganizationAnalyticsTrainingEligibilitySourceReader = (
  input: OrganizationAnalyticsScopeReadInput,
) => Promise<OrganizationAnalyticsTrainingEligibilitySource>;

export function createOrganizationAnalyticsTrainingEligibilitySource(input: {
  scopeInput: OrganizationAnalyticsScopeReadInput;
  versionRows: readonly OrganizationAnalyticsTrainingVersionSourceRow[];
  recipientRows: readonly OrganizationAnalyticsTrainingRecipientSourceRow[];
  submissionRows: readonly OrganizationAnalyticsTrainingSubmissionSourceRow[];
}): OrganizationAnalyticsTrainingEligibilitySource {
  const unavailable = createUnavailableTrainingEligibilitySource();
  const dateRange = normalizeDateRange(input.scopeInput.dateRange);

  if (dateRange === null) {
    return unavailable;
  }

  const relevantVersions: Array<
    OrganizationAnalyticsTrainingVersionSourceRow & {
      publishedAtIso: string;
      effectiveEndAtIso: string | null;
      publishScopeOrganizationPublicIds: string[];
    }
  > = [];
  const versionIds = new Set<number>();
  const versionPublicIds = new Map<string, string>();

  for (const version of input.versionRows) {
    const publicId = normalizeExactPublicId(version.publicId);
    const organizationPublicId = normalizeExactPublicId(
      version.organizationPublicId,
    );
    const publishedAtIso = normalizeSourceTimestamp(version.publishedAt);
    const answerDeadlineAtIso = normalizeNullableSourceTimestamp(
      version.answerDeadlineAt,
    );
    const takenDownAtIso = normalizeNullableSourceTimestamp(
      version.takenDownAt,
    );
    const publishScope = normalizePublishScopeSnapshot(
      version.publishScopeSnapshot,
    );

    if (
      !Number.isSafeInteger(version.id) ||
      version.id < 1 ||
      publicId === null ||
      organizationPublicId === null ||
      publishedAtIso === null ||
      answerDeadlineAtIso === undefined ||
      takenDownAtIso === undefined ||
      publishScope === null ||
      publishScope.capturedAt !== publishedAtIso ||
      !publishScope.organizationPublicIds.includes(organizationPublicId) ||
      versionIds.has(version.id) ||
      !registerExactPublicId(versionPublicIds, publicId)
    ) {
      return unavailable;
    }

    versionIds.add(version.id);
    const effectiveEndAtIso = selectEarliestTimestamp(
      answerDeadlineAtIso,
      takenDownAtIso,
    );

    if (
      effectiveEndAtIso !== null &&
      Date.parse(effectiveEndAtIso) < Date.parse(publishedAtIso)
    ) {
      return unavailable;
    }

    if (
      Date.parse(publishedAtIso) > dateRange.endAt.getTime() ||
      (effectiveEndAtIso !== null &&
        Date.parse(effectiveEndAtIso) < dateRange.startAt.getTime()) ||
      !publishScope.organizationPublicIds.some((scopePublicId) =>
        input.scopeInput.scopeOrganizationPublicIds.includes(scopePublicId),
      )
    ) {
      continue;
    }

    relevantVersions.push({
      ...version,
      publicId,
      organizationPublicId,
      publishedAtIso,
      effectiveEndAtIso,
      publishScopeOrganizationPublicIds: publishScope.organizationPublicIds,
    });
  }

  if (relevantVersions.length === 0) {
    return createAvailableTrainingEligibilitySource([], [], []);
  }

  const canonicalRecipientRows: Array<
    OrganizationTrainingRecipientSnapshotEntry & {
      versionId: number;
      employeeDisplayName: string;
      organizationName: string;
    }
  > = [];

  for (const version of relevantVersions) {
    if (
      normalizeSourceTimestamp(version.recipientSnapshotCapturedAt) !==
      version.publishedAtIso
    ) {
      return unavailable;
    }

    const versionRecipients = input.recipientRows.filter(
      (recipient) => recipient.versionId === version.id,
    );
    const snapshot = validateOrganizationTrainingRecipientSnapshot({
      schemaVersion: version.recipientSnapshotSchemaVersion,
      capturedAt: version.recipientSnapshotCapturedAt,
      count: version.recipientSnapshotCount,
      digest: version.recipientSnapshotDigest,
      recipients: versionRecipients,
    });

    if (snapshot === null) {
      return unavailable;
    }

    for (const recipient of versionRecipients) {
      const employeeDisplayName = normalizeRequiredText(
        recipient.employeeDisplayName ?? "",
      );
      const organizationName = normalizeRequiredText(
        recipient.organizationName ?? "",
      );

      if (
        employeeDisplayName === null ||
        organizationName === null ||
        !version.publishScopeOrganizationPublicIds.includes(
          recipient.organizationPublicId,
        )
      ) {
        return unavailable;
      }

      canonicalRecipientRows.push({
        versionId: version.id,
        employeePublicId: recipient.employeePublicId,
        employeeDisplayName,
        organizationPublicId: recipient.organizationPublicId,
        organizationName,
        authorizationPublicId: recipient.authorizationPublicId,
      });
    }
  }

  const visibleRecipients = canonicalRecipientRows.filter((recipient) =>
    input.scopeInput.scopeOrganizationPublicIds.includes(
      recipient.organizationPublicId,
    ),
  );
  const recipientByKey = new Map<
    string,
    (typeof canonicalRecipientRows)[number]
  >();

  for (const recipient of canonicalRecipientRows) {
    const key = createRecipientKey(
      recipient.versionId,
      recipient.employeePublicId,
      recipient.organizationPublicId,
    );

    if (recipientByKey.has(key)) {
      return unavailable;
    }

    recipientByKey.set(key, recipient);
  }

  const normalizedSubmissions: Array<{
    versionId: number;
    versionPublicId: string;
    employeePublicId: string;
    organizationPublicId: string;
    authorizationPublicId: string;
    score: number;
    totalScore: number;
    submittedAtIso: string;
    answerOrganizationSnapshot: OrganizationAnalyticsAnswerOrganizationSnapshot;
  }> = [];
  const submissionKeys = new Set<string>();

  for (const submission of input.submissionRows) {
    const employeePublicId = normalizeExactPublicId(
      submission.employeePublicId,
    );
    const organizationPublicId = normalizeExactPublicId(
      submission.organizationPublicId,
    );
    const versionPublicId = normalizeExactPublicId(submission.versionPublicId);
    const authorizationPublicId = normalizeExactPublicId(
      submission.authorizationPublicId,
    );
    const submittedAtIso = normalizeSourceTimestamp(submission.submittedAt);
    const answerOrganizationSnapshot = normalizeAnswerOrganizationSnapshot(
      submission.answerOrganizationSnapshot,
    );
    const version = relevantVersions.find(
      (candidate) => candidate.id === submission.versionId,
    );

    if (version === undefined && versionIds.has(submission.versionId)) {
      continue;
    }

    if (
      version === undefined ||
      employeePublicId === null ||
      organizationPublicId === null ||
      versionPublicId !== version.publicId ||
      authorizationPublicId === null ||
      submittedAtIso === null ||
      answerOrganizationSnapshot === null ||
      answerOrganizationSnapshot.organizationPublicId !== organizationPublicId
    ) {
      return unavailable;
    }

    const recipient = recipientByKey.get(
      createRecipientKey(
        submission.versionId,
        employeePublicId,
        organizationPublicId,
      ),
    );
    const score = normalizeScoreValue(submission.score);
    const totalScore = normalizeScoreValue(submission.totalScore);
    const submissionKey = `${submission.versionId}\u0000${employeePublicId}`;

    if (
      recipient === undefined ||
      recipient.authorizationPublicId !== authorizationPublicId ||
      score === null ||
      totalScore === null ||
      totalScore <= 0 ||
      submissionKeys.has(submissionKey)
    ) {
      return unavailable;
    }

    submissionKeys.add(submissionKey);

    if (
      Date.parse(submittedAtIso) < Date.parse(version.publishedAtIso) ||
      (version.effectiveEndAtIso !== null &&
        Date.parse(submittedAtIso) > Date.parse(version.effectiveEndAtIso)) ||
      !isSubmittedAtWithinDateRange(submittedAtIso, input.scopeInput.dateRange)
    ) {
      continue;
    }

    normalizedSubmissions.push({
      versionId: submission.versionId,
      employeePublicId,
      organizationPublicId,
      versionPublicId,
      authorizationPublicId,
      score,
      totalScore,
      submittedAtIso,
      answerOrganizationSnapshot,
    });
  }

  const eligibleEmployeePublicIds = normalizeExactPublicIdSet(
    visibleRecipients.map((recipient) => recipient.employeePublicId),
  );

  if (eligibleEmployeePublicIds === null) {
    return unavailable;
  }

  const officialSubmissions = normalizedSubmissions
    .filter((submission) =>
      input.scopeInput.scopeOrganizationPublicIds.includes(
        submission.organizationPublicId,
      ),
    )
    .map((submission) => ({
      employeePublicId: submission.employeePublicId,
      score: submission.score,
      totalScore: submission.totalScore,
      submittedAt: submission.submittedAtIso,
    }));
  const relevantVersionPublicIdById = new Map(
    relevantVersions.map((version) => [version.id, version.publicId]),
  );
  const employeeTrainingSummaryInputs: OrganizationAnalyticsEmployeeTrainingSummaryRepositoryInput[] =
    [];

  for (const employeePublicId of eligibleEmployeePublicIds) {
    const employeeRecipients = visibleRecipients.filter(
      (recipient) => recipient.employeePublicId === employeePublicId,
    );
    const identity = employeeRecipients[0];

    if (
      identity === undefined ||
      employeeRecipients.some(
        (recipient) =>
          recipient.employeeDisplayName !== identity.employeeDisplayName ||
          recipient.organizationPublicId !== identity.organizationPublicId ||
          recipient.organizationName !== identity.organizationName,
      )
    ) {
      return unavailable;
    }

    const visibleTrainingVersionPublicIds: string[] = [];

    for (const recipient of employeeRecipients) {
      const versionPublicId = relevantVersionPublicIdById.get(
        recipient.versionId,
      );

      if (versionPublicId === undefined) {
        return unavailable;
      }

      visibleTrainingVersionPublicIds.push(versionPublicId);
    }

    const employeeSubmissions = normalizedSubmissions.filter(
      (submission) =>
        submission.employeePublicId === employeePublicId &&
        input.scopeInput.scopeOrganizationPublicIds.includes(
          submission.organizationPublicId,
        ),
    );

    employeeTrainingSummaryInputs.push({
      employeePublicId,
      employeeDisplayName: identity.employeeDisplayName,
      organizationPublicId: identity.organizationPublicId,
      organizationName: identity.organizationName,
      visibleTrainingVersionPublicIds: sortOrdinal(
        visibleTrainingVersionPublicIds,
      ),
      officialSubmissions: employeeSubmissions.map((submission) => ({
        employeePublicId: submission.employeePublicId,
        trainingVersionPublicId: submission.versionPublicId,
        score: submission.score,
        totalScore: submission.totalScore,
        submittedAt: submission.submittedAtIso,
        answerOrganizationSnapshot: {
          organizationPublicId:
            submission.answerOrganizationSnapshot.organizationPublicId,
          organizationName:
            submission.answerOrganizationSnapshot.organizationName,
          capturedAt: submission.answerOrganizationSnapshot.capturedAt,
        },
      })),
    });
  }

  return createAvailableTrainingEligibilitySource(
    eligibleEmployeePublicIds,
    officialSubmissions,
    employeeTrainingSummaryInputs,
    sortOrdinal(relevantVersions.map((version) => version.publicId)),
  );
}

export type OrganizationAnalyticsFormalLearningSummary = {
  formalPracticeCount: number;
  formalMockExamCount: number;
  formalExamReportCount: number;
  formalMistakeBookCount: number;
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
  readEmployeeTrainingSummaryPage(
    input: OrganizationAnalyticsEmployeeTrainingSummaryPageInput,
  ): Promise<OrganizationAnalyticsEmployeeTrainingSummaryPage>;
  readFormalLearningSummary(
    input: OrganizationAnalyticsScopeReadInput,
  ): Promise<Omit<
    OrganizationAnalyticsFormalLearningSummary,
    "redactionStatus"
  > | null>;
  readKnowledgeWeakPointSummary(
    input: OrganizationAnalyticsScopeReadInput,
  ): Promise<OrganizationAnalyticsWeakPointSummaryInput | null>;
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
  readEmployeeTrainingSummaryPage(
    input: OrganizationAnalyticsEmployeeTrainingSummaryPageInput,
  ): Promise<OrganizationAnalyticsEmployeeTrainingSummaryPage>;
  readFormalLearningSummary(
    input: OrganizationAnalyticsScopeReadInput,
  ): Promise<OrganizationAnalyticsFormalLearningSummary | null>;
  readKnowledgeWeakPointSummary(
    input: OrganizationAnalyticsScopeReadInput,
  ): Promise<OrganizationAnalyticsWeakPointSummaryInput | null>;
  readExportReadinessRows(
    input: OrganizationAnalyticsScopeReadInput,
  ): Promise<readonly OrganizationAnalyticsRepositoryExportReadinessRow[]>;
};

export type OrganizationAnalyticsPostgresRepositoryFactoryOptions = {
  gateway?: OrganizationAnalyticsRepositoryGateway | null;
};

export type OrganizationAnalyticsAnswerOrganizationSnapshot = {
  organizationPublicId: string;
  organizationName: string;
  capturedAt: string;
};

export type OrganizationAnalyticsVisibleOrganizationScopeReader = (
  input: OrganizationAnalyticsVisibleOrganizationScopeLookupInput,
) => Promise<readonly string[] | null>;

export type OrganizationAnalyticsTrainingEligibilitySourceGatewayOptions = {
  readTrainingEligibilitySource: OrganizationAnalyticsTrainingEligibilitySourceReader;
};

export type OrganizationAnalyticsPostgresGatewayOptions =
  OrganizationAnalyticsTrainingEligibilitySourceGatewayOptions & {
    findVisibleOrganizationScopeByAdminPublicId: OrganizationAnalyticsVisibleOrganizationScopeReader;
    readEmployeeTrainingSummaryPage?: OrganizationAnalyticsEmployeeTrainingSummaryPageReader;
  };

export type OrganizationAnalyticsEmployeeTrainingSummaryPageReader = (
  input: OrganizationAnalyticsEmployeeTrainingSummaryPageInput,
) => Promise<OrganizationAnalyticsEmployeeTrainingSummaryPage>;

type OrganizationAnalyticsVisibleOrganizationScopeRow = {
  organizationId: number;
  organizationPublicId: string;
  parentOrganizationId: number | null;
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

    async readEmployeeTrainingSummaryPage(input) {
      const readInput = normalizeEmployeeTrainingSummaryPageInput(input);

      if (readInput === null) {
        return {
          availability: "unavailable",
          employeeTrainingSummaryInputs: [],
          total: 0,
        };
      }

      const page = await gateway.readEmployeeTrainingSummaryPage(readInput);

      return {
        availability: page.availability,
        employeeTrainingSummaryInputs: page.employeeTrainingSummaryInputs.map(
          copyEmployeeTrainingSummaryInput,
        ),
        total: normalizeTotal(page.total),
      };
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

    async readKnowledgeWeakPointSummary(input) {
      const readInput = normalizeScopeReadInput(input);

      if (readInput === null) {
        return null;
      }

      const weakPointSummary =
        await gateway.readKnowledgeWeakPointSummary(readInput);

      return weakPointSummary === null
        ? null
        : copyWeakPointSummaryInput(weakPointSummary);
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

export function createOrganizationAnalyticsPostgresGateway(
  options: OrganizationAnalyticsPostgresGatewayOptions,
): OrganizationAnalyticsRepositoryGateway {
  const trainingAnswerSourceGateway =
    createOrganizationAnalyticsTrainingEligibilitySourceGateway({
      readTrainingEligibilitySource: options.readTrainingEligibilitySource,
    });

  return {
    ...trainingAnswerSourceGateway,

    async readEmployeeTrainingSummaryPage(input) {
      return options.readEmployeeTrainingSummaryPage === undefined
        ? trainingAnswerSourceGateway.readEmployeeTrainingSummaryPage(input)
        : options.readEmployeeTrainingSummaryPage(input);
    },

    async findVisibleOrganizationScopeByAdminPublicId(adminPublicId) {
      const normalizedAdminPublicId = normalizeRequiredText(adminPublicId);

      if (normalizedAdminPublicId === null) {
        return null;
      }

      const scopeOrganizationPublicIds =
        await options.findVisibleOrganizationScopeByAdminPublicId({
          adminPublicId: normalizedAdminPublicId,
        });

      return scopeOrganizationPublicIds === null
        ? null
        : normalizePublicIdList(scopeOrganizationPublicIds);
    },
  };
}

export function createOrganizationAnalyticsVisibleOrganizationScopeReader(
  database: RuntimeDatabase,
): OrganizationAnalyticsVisibleOrganizationScopeReader {
  return async (input) => {
    const adminPublicId = normalizeRequiredText(input.adminPublicId);

    if (adminPublicId === null) {
      return null;
    }

    const assignedRootRows = await database
      .select({
        organizationId: adminOrganization.organization_id,
      })
      .from(adminOrganization)
      .innerJoin(admin, eq(adminOrganization.admin_id, admin.id))
      .innerJoin(
        organization,
        eq(adminOrganization.organization_id, organization.id),
      )
      .where(
        and(
          eq(admin.public_id, adminPublicId),
          eq(admin.status, "active"),
          eq(organization.status, "active"),
        ),
      );
    const assignedRootOrganizationIds = assignedRootRows.map(
      (assignedRootRow) => assignedRootRow.organizationId,
    );

    if (assignedRootOrganizationIds.length === 0) {
      return null;
    }

    const activeOrganizationRows = await database
      .select({
        organizationId: organization.id,
        organizationPublicId: organization.public_id,
        parentOrganizationId: organization.parent_organization_id,
      })
      .from(organization)
      .where(eq(organization.status, "active"));

    return resolveVisibleOrganizationPublicIds({
      assignedRootOrganizationIds,
      activeOrganizationRows,
    });
  };
}

export function createOrganizationAnalyticsTrainingEligibilitySourceReader(
  database: RuntimeDatabase,
): OrganizationAnalyticsTrainingEligibilitySourceReader {
  return async (input) => {
    const readInput = normalizeScopeReadInput(input);
    const dateRange = normalizeDateRange(input.dateRange);

    if (readInput === null || dateRange === null) {
      return createUnavailableTrainingEligibilitySource();
    }

    const versionRows = await database
      .select({
        id: organizationTrainingVersion.id,
        publicId: organizationTrainingVersion.public_id,
        organizationPublicId:
          organizationTrainingVersion.organization_public_id,
        publishScopeSnapshot:
          organizationTrainingVersion.publish_scope_snapshot,
        publishedAt: organizationTrainingVersion.published_at,
        answerDeadlineAt: organizationTrainingVersion.answer_deadline_at,
        takenDownAt: organizationTrainingVersion.taken_down_at,
        recipientSnapshotSchemaVersion:
          organizationTrainingVersion.recipient_snapshot_schema_version,
        recipientSnapshotCapturedAt:
          organizationTrainingVersion.recipient_snapshot_captured_at,
        recipientSnapshotCount:
          organizationTrainingVersion.recipient_snapshot_count,
        recipientSnapshotDigest:
          organizationTrainingVersion.recipient_snapshot_digest,
      })
      .from(organizationTrainingVersion)
      .where(
        and(
          or(
            eq(organizationTrainingVersion.version_status, "published"),
            eq(organizationTrainingVersion.version_status, "taken_down"),
          ),
          isNotNull(organizationTrainingVersion.published_at),
          lte(organizationTrainingVersion.published_at, dateRange.endAt),
          sql`${organizationTrainingVersion.publish_scope_snapshot}->'organizationPublicIds' ?| ${createOrganizationTrainingVisibleOrganizationPublicIdArraySql(readInput.scopeOrganizationPublicIds)}`,
        ),
      )
      .orderBy(asc(organizationTrainingVersion.public_id));

    if (versionRows.length === 0) {
      return createAvailableTrainingEligibilitySource([], [], []);
    }

    const versionIds = versionRows.map((version) => version.id);
    const recipientRows = await database
      .select({
        versionId:
          organizationTrainingVersionRecipient.organization_training_version_id,
        employeePublicId:
          organizationTrainingVersionRecipient.employee_public_id,
        employeeDisplayName: user.name,
        organizationPublicId:
          organizationTrainingVersionRecipient.organization_public_id,
        organizationName: organization.name,
        authorizationPublicId:
          organizationTrainingVersionRecipient.authorization_public_id,
      })
      .from(organizationTrainingVersionRecipient)
      .leftJoin(
        employee,
        eq(
          employee.public_id,
          organizationTrainingVersionRecipient.employee_public_id,
        ),
      )
      .leftJoin(user, eq(user.id, employee.user_id))
      .leftJoin(
        organization,
        eq(
          organization.public_id,
          organizationTrainingVersionRecipient.organization_public_id,
        ),
      )
      .where(
        inArray(
          organizationTrainingVersionRecipient.organization_training_version_id,
          versionIds,
        ),
      )
      .orderBy(
        asc(
          organizationTrainingVersionRecipient.organization_training_version_id,
        ),
        asc(organizationTrainingVersionRecipient.employee_public_id),
      );
    const submissionRows = await database
      .select({
        versionId: organizationTrainingAnswer.organization_training_version_id,
        versionPublicId:
          organizationTrainingAnswer.organization_training_version_public_id,
        employeePublicId: organizationTrainingAnswer.employee_public_id,
        organizationPublicId: organizationTrainingAnswer.organization_public_id,
        authorizationPublicId:
          organizationTrainingVersionRecipient.authorization_public_id,
        score: organizationTrainingAnswer.score,
        totalScore: organizationTrainingAnswer.total_score,
        submittedAt: organizationTrainingAnswer.submitted_at,
        answerOrganizationSnapshot:
          organizationTrainingAnswer.answer_organization_snapshot,
      })
      .from(organizationTrainingAnswer)
      .leftJoin(
        organizationTrainingVersionRecipient,
        and(
          eq(
            organizationTrainingVersionRecipient.organization_training_version_id,
            organizationTrainingAnswer.organization_training_version_id,
          ),
          eq(
            organizationTrainingVersionRecipient.employee_public_id,
            organizationTrainingAnswer.employee_public_id,
          ),
          eq(
            organizationTrainingVersionRecipient.organization_public_id,
            organizationTrainingAnswer.organization_public_id,
          ),
        ),
      )
      .where(
        and(
          inArray(
            organizationTrainingAnswer.organization_training_version_id,
            versionIds,
          ),
          eq(
            organizationTrainingAnswer.organization_training_answer_status,
            "submitted",
          ),
          isNotNull(organizationTrainingAnswer.submitted_at),
          gte(organizationTrainingAnswer.submitted_at, dateRange.startAt),
          lte(organizationTrainingAnswer.submitted_at, dateRange.endAt),
        ),
      )
      .orderBy(
        asc(organizationTrainingAnswer.organization_training_version_id),
        asc(organizationTrainingAnswer.employee_public_id),
      );

    return createOrganizationAnalyticsTrainingEligibilitySource({
      scopeInput: readInput,
      versionRows,
      recipientRows,
      submissionRows,
    });
  };
}

export function createOrganizationAnalyticsEmployeeTrainingSummaryPageReader(
  database: RuntimeDatabase,
): OrganizationAnalyticsEmployeeTrainingSummaryPageReader {
  return async (input) => {
    const readInput = normalizeEmployeeTrainingSummaryPageInput(input);

    if (readInput === null) {
      return {
        availability: "unavailable",
        employeeTrainingSummaryInputs: [],
        total: 0,
      };
    }

    const source =
      await createOrganizationAnalyticsTrainingEligibilitySourceReader(
        database,
      )(readInput);

    if (source.availability === "unavailable") {
      return {
        availability: "unavailable",
        employeeTrainingSummaryInputs: [],
        total: 0,
      };
    }

    if (source.eligibleEmployeePublicIds.length === 0) {
      return {
        availability: "available",
        employeeTrainingSummaryInputs: [],
        total: 0,
      };
    }

    const recipientPredicate = and(
      inArray(organizationTrainingVersion.public_id, [
        ...source.relevantVersionPublicIds,
      ]),
      inArray(organizationTrainingVersionRecipient.organization_public_id, [
        ...readInput.scopeOrganizationPublicIds,
      ]),
    )!;

    const offset =
      (readInput.pagination.page - 1) * readInput.pagination.pageSize;
    const employeePageRows = await database
      .select({
        employeeDisplayName: user.name,
        employeePublicId: employee.public_id,
      })
      .from(organizationTrainingVersionRecipient)
      .innerJoin(
        organizationTrainingVersion,
        eq(
          organizationTrainingVersion.id,
          organizationTrainingVersionRecipient.organization_training_version_id,
        ),
      )
      .innerJoin(
        employee,
        eq(
          organizationTrainingVersionRecipient.employee_public_id,
          employee.public_id,
        ),
      )
      .innerJoin(user, eq(employee.user_id, user.id))
      .where(recipientPredicate)
      .groupBy(user.name, employee.public_id)
      .orderBy(asc(user.name), asc(employee.public_id))
      .limit(readInput.pagination.pageSize)
      .offset(offset);
    const [totalRow] = await database
      .select({ value: countDistinct(employee.public_id) })
      .from(organizationTrainingVersionRecipient)
      .innerJoin(
        organizationTrainingVersion,
        eq(
          organizationTrainingVersion.id,
          organizationTrainingVersionRecipient.organization_training_version_id,
        ),
      )
      .innerJoin(
        employee,
        eq(
          organizationTrainingVersionRecipient.employee_public_id,
          employee.public_id,
        ),
      )
      .innerJoin(user, eq(employee.user_id, user.id))
      .where(recipientPredicate);
    const employeePublicIds = employeePageRows.map(
      (employeePageRow) => employeePageRow.employeePublicId,
    );

    if (employeePublicIds.length === 0) {
      return {
        availability: "available",
        employeeTrainingSummaryInputs: [],
        total: normalizeTotal(totalRow?.value),
      };
    }

    if (new Set(employeePublicIds).size !== employeePublicIds.length) {
      return {
        availability: "unavailable",
        employeeTrainingSummaryInputs: [],
        total: 0,
      };
    }

    const employeeTrainingSummaryInputs: OrganizationAnalyticsEmployeeTrainingSummaryRepositoryInput[] =
      [];

    for (const employeePageRow of employeePageRows) {
      const summary = source.employeeTrainingSummaryInputs.find(
        (candidate) =>
          candidate.employeePublicId === employeePageRow.employeePublicId &&
          candidate.employeeDisplayName === employeePageRow.employeeDisplayName,
      );

      if (summary === undefined) {
        return {
          availability: "unavailable",
          employeeTrainingSummaryInputs: [],
          total: 0,
        };
      }

      employeeTrainingSummaryInputs.push(
        copyEmployeeTrainingSummaryInput(summary),
      );
    }

    return {
      availability: "available",
      employeeTrainingSummaryInputs,
      total: normalizeTotal(totalRow?.value),
    };
  };
}

export function createOrganizationAnalyticsTrainingEligibilitySourceGateway(
  options: OrganizationAnalyticsTrainingEligibilitySourceGatewayOptions,
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

      const source = await options.readTrainingEligibilitySource(readInput);

      if (source.availability === "unavailable") {
        return null;
      }

      return {
        eligibleEmployeePublicIds: [...source.eligibleEmployeePublicIds],
        officialSubmissions: source.officialSubmissions.map((submission) => ({
          ...submission,
        })),
      };
    },

    async readEmployeeTrainingSummaryInputs(input) {
      const readInput = normalizeScopeReadInput(input);

      if (readInput === null) {
        return [];
      }

      const source = await options.readTrainingEligibilitySource(readInput);

      return source.availability === "available"
        ? source.employeeTrainingSummaryInputs.map(
            copyEmployeeTrainingSummaryInput,
          )
        : [];
    },

    async readEmployeeTrainingSummaryPage(input) {
      const readInput = normalizeEmployeeTrainingSummaryPageInput(input);

      if (readInput === null) {
        return {
          availability: "unavailable",
          employeeTrainingSummaryInputs: [],
          total: 0,
        };
      }

      return {
        availability: "unavailable",
        employeeTrainingSummaryInputs: [],
        total: 0,
      };
    },

    async readFormalLearningSummary() {
      return null;
    },

    async readKnowledgeWeakPointSummary() {
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
    async readEmployeeTrainingSummaryPage() {
      return {
        availability: "unavailable",
        employeeTrainingSummaryInputs: [],
        total: 0,
      };
    },
    async readFormalLearningSummary() {
      return null;
    },
    async readKnowledgeWeakPointSummary() {
      return null;
    },
    async readExportReadinessRows() {
      return [];
    },
  };
}

function resolveVisibleOrganizationPublicIds(input: {
  assignedRootOrganizationIds: readonly number[];
  activeOrganizationRows: readonly OrganizationAnalyticsVisibleOrganizationScopeRow[];
}): string[] {
  const activeOrganizationRows = input.activeOrganizationRows
    .map(normalizeVisibleOrganizationScopeRow)
    .filter(
      (
        scopeRow,
      ): scopeRow is OrganizationAnalyticsVisibleOrganizationScopeRow =>
        scopeRow !== null,
    );
  const activeOrganizationIds = new Set(
    activeOrganizationRows.map((scopeRow) => scopeRow.organizationId),
  );
  const assignedRootOrganizationIds = [
    ...new Set(
      input.assignedRootOrganizationIds.filter(
        (organizationId) =>
          Number.isInteger(organizationId) &&
          organizationId > 0 &&
          activeOrganizationIds.has(organizationId),
      ),
    ),
  ];

  if (assignedRootOrganizationIds.length === 0) {
    return [];
  }

  const childOrganizationIdsByParentId = activeOrganizationRows.reduce(
    (childIdsByParentId, scopeRow) => {
      if (scopeRow.parentOrganizationId === null) {
        return childIdsByParentId;
      }

      const currentChildIds =
        childIdsByParentId.get(scopeRow.parentOrganizationId) ?? [];
      childIdsByParentId.set(scopeRow.parentOrganizationId, [
        ...currentChildIds,
        scopeRow.organizationId,
      ]);

      return childIdsByParentId;
    },
    new Map<number, number[]>(),
  );
  const visibleOrganizationIds = new Set<number>();
  let pendingOrganizationIds = assignedRootOrganizationIds;

  while (pendingOrganizationIds.length > 0) {
    const [nextOrganizationId, ...remainingOrganizationIds] =
      pendingOrganizationIds;

    if (
      nextOrganizationId === undefined ||
      visibleOrganizationIds.has(nextOrganizationId)
    ) {
      pendingOrganizationIds = remainingOrganizationIds;
      continue;
    }

    visibleOrganizationIds.add(nextOrganizationId);
    pendingOrganizationIds = [
      ...remainingOrganizationIds,
      ...(childOrganizationIdsByParentId.get(nextOrganizationId) ?? []),
    ];
  }

  return activeOrganizationRows
    .filter((scopeRow) => visibleOrganizationIds.has(scopeRow.organizationId))
    .map((scopeRow) => scopeRow.organizationPublicId);
}

function normalizeVisibleOrganizationScopeRow(
  scopeRow: OrganizationAnalyticsVisibleOrganizationScopeRow,
): OrganizationAnalyticsVisibleOrganizationScopeRow | null {
  const organizationPublicId = normalizeRequiredText(
    scopeRow.organizationPublicId,
  );

  if (
    !Number.isInteger(scopeRow.organizationId) ||
    scopeRow.organizationId <= 0 ||
    organizationPublicId === null ||
    (scopeRow.parentOrganizationId !== null &&
      (!Number.isInteger(scopeRow.parentOrganizationId) ||
        scopeRow.parentOrganizationId <= 0))
  ) {
    return null;
  }

  return {
    organizationId: scopeRow.organizationId,
    organizationPublicId,
    parentOrganizationId: scopeRow.parentOrganizationId,
  };
}

function normalizeDateRange(dateRange: OrganizationAnalyticsDateRangeDto): {
  startAt: Date;
  endAt: Date;
} | null {
  const startAt = new Date(dateRange.startAt);
  const endAt = new Date(dateRange.endAt);

  if (
    !Number.isFinite(startAt.getTime()) ||
    !Number.isFinite(endAt.getTime()) ||
    startAt.getTime() > endAt.getTime()
  ) {
    return null;
  }

  return { startAt, endAt };
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

function normalizeAnswerOrganizationSnapshot(
  value: OrganizationAnalyticsAnswerOrganizationSnapshot | null | undefined,
): OrganizationAnalyticsAnswerOrganizationSnapshot | null {
  if (value === null || value === undefined) {
    return null;
  }

  const organizationPublicId = normalizeRequiredText(
    value.organizationPublicId,
  );
  const organizationName = normalizeRequiredText(value.organizationName);
  const capturedAt = normalizeSubmittedAt(value.capturedAt);

  if (
    organizationPublicId === null ||
    organizationName === null ||
    capturedAt === null
  ) {
    return null;
  }

  return {
    organizationPublicId,
    organizationName,
    capturedAt,
  };
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

function normalizeExactPublicId(value: unknown): string | null {
  return typeof value === "string" &&
    value.length > 0 &&
    value.length <= 200 &&
    value === value.trim() &&
    !/[\u0000-\u001f\u007f-\u009f]/u.test(value)
    ? value
    : null;
}

function registerExactPublicId(
  registry: Map<string, string>,
  value: string,
): boolean {
  const key = value.toLowerCase();
  const existing = registry.get(key);

  if (existing !== undefined) {
    return false;
  }

  registry.set(key, value);
  return true;
}

function normalizeExactPublicIdSet(values: readonly string[]): string[] | null {
  const registry = new Map<string, string>();

  for (const value of values) {
    const normalized = normalizeExactPublicId(value);

    if (normalized === null) {
      return null;
    }

    const folded = normalized.toLowerCase();
    const existing = registry.get(folded);

    if (existing !== undefined && existing !== normalized) {
      return null;
    }

    registry.set(folded, normalized);
  }

  return sortOrdinal([...registry.values()]);
}

function normalizeSourceTimestamp(value: unknown): string | null {
  if (typeof value !== "string" && !(value instanceof Date)) {
    return null;
  }

  const date = value instanceof Date ? value : new Date(value);

  if (!Number.isFinite(date.getTime())) {
    return null;
  }

  const isoTimestamp = date.toISOString();

  return value instanceof Date || value === isoTimestamp ? isoTimestamp : null;
}

function normalizeNullableSourceTimestamp(
  value: unknown,
): string | null | undefined {
  return value === null ? null : (normalizeSourceTimestamp(value) ?? undefined);
}

function selectEarliestTimestamp(
  left: string | null,
  right: string | null,
): string | null {
  if (left === null) return right;
  if (right === null) return left;
  return Date.parse(left) <= Date.parse(right) ? left : right;
}

function normalizePublishScopeSnapshot(value: unknown): {
  organizationPublicIds: string[];
  capturedAt: string;
} | null {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return null;
  }

  const record = value as Record<string, unknown>;

  if (
    Object.keys(record).length !== 2 ||
    !("organizationPublicIds" in record) ||
    !("capturedAt" in record) ||
    !Array.isArray(record.organizationPublicIds)
  ) {
    return null;
  }

  const organizationPublicIds = normalizeExactPublicIdSet(
    record.organizationPublicIds.filter(
      (publicId): publicId is string => typeof publicId === "string",
    ),
  );
  const capturedAt = normalizeSourceTimestamp(record.capturedAt);

  return organizationPublicIds !== null &&
    organizationPublicIds.length === record.organizationPublicIds.length &&
    organizationPublicIds.length > 0 &&
    capturedAt !== null
    ? { organizationPublicIds, capturedAt }
    : null;
}

function createRecipientKey(
  versionId: number,
  employeePublicId: string,
  organizationPublicId: string,
): string {
  return JSON.stringify([versionId, employeePublicId, organizationPublicId]);
}

function sortOrdinal(values: readonly string[]): string[] {
  return [...new Set(values)].sort((left, right) =>
    left < right ? -1 : left > right ? 1 : 0,
  );
}

function createUnavailableTrainingEligibilitySource(): OrganizationAnalyticsTrainingEligibilitySource {
  return {
    availability: "unavailable",
    eligibleEmployeePublicIds: [],
    officialSubmissions: [],
    employeeTrainingSummaryInputs: [],
    relevantVersionPublicIds: [],
  };
}

function createAvailableTrainingEligibilitySource(
  eligibleEmployeePublicIds: readonly string[],
  officialSubmissions: readonly OrganizationTrainingOfficialSubmission[],
  employeeTrainingSummaryInputs: readonly OrganizationAnalyticsEmployeeTrainingSummaryRepositoryInput[],
  relevantVersionPublicIds: readonly string[] = [],
): OrganizationAnalyticsTrainingEligibilitySource {
  return {
    availability: "available",
    eligibleEmployeePublicIds: [...eligibleEmployeePublicIds],
    officialSubmissions: officialSubmissions.map((submission) => ({
      ...submission,
    })),
    employeeTrainingSummaryInputs: employeeTrainingSummaryInputs.map(
      copyEmployeeTrainingSummaryInput,
    ),
    relevantVersionPublicIds: [...relevantVersionPublicIds],
  };
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

function normalizeEmployeeTrainingSummaryPageInput(
  input: OrganizationAnalyticsEmployeeTrainingSummaryPageInput,
): OrganizationAnalyticsEmployeeTrainingSummaryPageInput | null {
  const scopeInput = normalizeScopeReadInput(input);
  const page = Math.floor(input.pagination.page);
  const pageSize = input.pagination.pageSize;

  if (
    scopeInput === null ||
    !Number.isSafeInteger(page) ||
    page <= 0 ||
    (pageSize !== 20 && pageSize !== 50 && pageSize !== 100)
  ) {
    return null;
  }

  return {
    ...scopeInput,
    pagination: { page, pageSize },
  };
}

function normalizeTotal(value: number | string | null | undefined): number {
  const total = Number(value ?? 0);

  return Number.isSafeInteger(total) && total > 0 ? total : 0;
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

function copyWeakPointSummaryInput(
  input: OrganizationAnalyticsWeakPointSummaryInput,
): OrganizationAnalyticsWeakPointSummaryInput {
  return {
    sampleSize: input.sampleSize,
    trainingWeakPoints: input.trainingWeakPoints.map((weakPoint) => ({
      sourceDomain: weakPoint.sourceDomain,
      knowledgeNodeLabel: weakPoint.knowledgeNodeLabel,
      affectedEmployeeCount: weakPoint.affectedEmployeeCount,
      affectedEmployeePercent: weakPoint.affectedEmployeePercent,
    })),
    formalLearningWeakPoints: input.formalLearningWeakPoints.map(
      (weakPoint) => ({
        sourceDomain: weakPoint.sourceDomain,
        knowledgeNodeLabel: weakPoint.knowledgeNodeLabel,
        affectedEmployeeCount: weakPoint.affectedEmployeeCount,
        affectedEmployeePercent: weakPoint.affectedEmployeePercent,
      }),
    ),
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
    weakPointLabels:
      input.weakPointLabels === undefined
        ? undefined
        : [...input.weakPointLabels],
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
