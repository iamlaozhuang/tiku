import {
  admin,
  adminOrganization,
  employee,
  organization,
  organizationTrainingAnswer,
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
  lte,
  type SQL,
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
  employeeTrainingSummaryInputs: readonly OrganizationAnalyticsEmployeeTrainingSummaryRepositoryInput[];
  total: number;
};

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

export type OrganizationAnalyticsTrainingAnswerSourceRow = {
  employeePublicId: string;
  employeeDisplayName?: string | null;
  organizationPublicId: string;
  organizationTrainingVersionPublicId: string;
  score: number | string | null;
  totalScore: number | string | null;
  submittedAt: Date | string | null;
  answerOrganizationSnapshot?: OrganizationAnalyticsAnswerOrganizationSnapshot | null;
};

export type OrganizationAnalyticsAnswerOrganizationSnapshot = {
  organizationPublicId: string;
  organizationName: string;
  capturedAt: string;
};

export type OrganizationAnalyticsTrainingAnswerSourceReader = (
  input: OrganizationAnalyticsScopeReadInput,
) => Promise<readonly OrganizationAnalyticsTrainingAnswerSourceRow[]>;

export type OrganizationAnalyticsVisibleOrganizationScopeReader = (
  input: OrganizationAnalyticsVisibleOrganizationScopeLookupInput,
) => Promise<readonly string[] | null>;

export type OrganizationAnalyticsTrainingAnswerSourceGatewayOptions = {
  readTrainingAnswerSourceRows: OrganizationAnalyticsTrainingAnswerSourceReader;
};

export type OrganizationAnalyticsPostgresGatewayOptions =
  OrganizationAnalyticsTrainingAnswerSourceGatewayOptions & {
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
        return { employeeTrainingSummaryInputs: [], total: 0 };
      }

      const page = await gateway.readEmployeeTrainingSummaryPage(readInput);

      return {
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
    createOrganizationAnalyticsTrainingAnswerSourceGateway({
      readTrainingAnswerSourceRows: options.readTrainingAnswerSourceRows,
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

export function createOrganizationAnalyticsTrainingAnswerSourceReader(
  database: RuntimeDatabase,
): OrganizationAnalyticsTrainingAnswerSourceReader {
  return async (input) => {
    const readInput = normalizeScopeReadInput(input);
    const submittedAtRange = normalizeDateRange(input.dateRange);

    if (readInput === null || submittedAtRange === null) {
      return [];
    }

    const trainingAnswerSourceRows = await database
      .select({
        employeePublicId: organizationTrainingAnswer.employee_public_id,
        employeeDisplayName: user.name,
        organizationPublicId: organizationTrainingAnswer.organization_public_id,
        organizationTrainingVersionPublicId:
          organizationTrainingAnswer.organization_training_version_public_id,
        score: organizationTrainingAnswer.score,
        totalScore: organizationTrainingAnswer.total_score,
        submittedAt: organizationTrainingAnswer.submitted_at,
        answerOrganizationSnapshot:
          organizationTrainingAnswer.answer_organization_snapshot,
      })
      .from(organizationTrainingAnswer)
      .innerJoin(
        employee,
        eq(organizationTrainingAnswer.employee_id, employee.id),
      )
      .innerJoin(user, eq(employee.user_id, user.id))
      .where(
        and(
          eq(
            organizationTrainingAnswer.organization_training_answer_status,
            "submitted",
          ),
          inArray(organizationTrainingAnswer.organization_public_id, [
            ...readInput.scopeOrganizationPublicIds,
          ]),
          isNotNull(organizationTrainingAnswer.submitted_at),
          gte(
            organizationTrainingAnswer.submitted_at,
            submittedAtRange.startAt,
          ),
          lte(organizationTrainingAnswer.submitted_at, submittedAtRange.endAt),
        ),
      );

    return trainingAnswerSourceRows.flatMap(copyTrainingAnswerSourceRow);
  };
}

function createSubmittedTrainingAnswerCondition(
  input: OrganizationAnalyticsScopeReadInput,
): SQL | null {
  const submittedAtRange = normalizeDateRange(input.dateRange);

  if (submittedAtRange === null) {
    return null;
  }

  return and(
    eq(
      organizationTrainingAnswer.organization_training_answer_status,
      "submitted",
    ),
    inArray(organizationTrainingAnswer.organization_public_id, [
      ...input.scopeOrganizationPublicIds,
    ]),
    isNotNull(organizationTrainingAnswer.submitted_at),
    gte(organizationTrainingAnswer.submitted_at, submittedAtRange.startAt),
    lte(organizationTrainingAnswer.submitted_at, submittedAtRange.endAt),
  )!;
}

export function createOrganizationAnalyticsEmployeeTrainingSummaryPageReader(
  database: RuntimeDatabase,
): OrganizationAnalyticsEmployeeTrainingSummaryPageReader {
  return async (input) => {
    const readInput = normalizeEmployeeTrainingSummaryPageInput(input);

    if (readInput === null) {
      return { employeeTrainingSummaryInputs: [], total: 0 };
    }

    const whereCondition = createSubmittedTrainingAnswerCondition(readInput);

    if (whereCondition === null) {
      return { employeeTrainingSummaryInputs: [], total: 0 };
    }

    const offset =
      (readInput.pagination.page - 1) * readInput.pagination.pageSize;
    const employeePageRows = await database
      .select({
        employeeDisplayName: user.name,
        employeePublicId: employee.public_id,
      })
      .from(organizationTrainingAnswer)
      .innerJoin(
        employee,
        eq(organizationTrainingAnswer.employee_id, employee.id),
      )
      .innerJoin(user, eq(employee.user_id, user.id))
      .where(whereCondition)
      .groupBy(user.name, employee.public_id)
      .orderBy(asc(user.name), asc(employee.public_id))
      .limit(readInput.pagination.pageSize)
      .offset(offset);
    const [totalRow] = await database
      .select({ value: countDistinct(employee.public_id) })
      .from(organizationTrainingAnswer)
      .innerJoin(
        employee,
        eq(organizationTrainingAnswer.employee_id, employee.id),
      )
      .innerJoin(user, eq(employee.user_id, user.id))
      .where(whereCondition);
    const employeePublicIds = employeePageRows.map(
      (employeePageRow) => employeePageRow.employeePublicId,
    );

    if (employeePublicIds.length === 0) {
      return {
        employeeTrainingSummaryInputs: [],
        total: normalizeTotal(totalRow?.value),
      };
    }

    const trainingAnswerSourceRows = await database
      .select({
        employeePublicId: organizationTrainingAnswer.employee_public_id,
        employeeDisplayName: user.name,
        organizationPublicId: organizationTrainingAnswer.organization_public_id,
        organizationTrainingVersionPublicId:
          organizationTrainingAnswer.organization_training_version_public_id,
        score: organizationTrainingAnswer.score,
        totalScore: organizationTrainingAnswer.total_score,
        submittedAt: organizationTrainingAnswer.submitted_at,
        answerOrganizationSnapshot:
          organizationTrainingAnswer.answer_organization_snapshot,
      })
      .from(organizationTrainingAnswer)
      .innerJoin(
        employee,
        eq(organizationTrainingAnswer.employee_id, employee.id),
      )
      .innerJoin(user, eq(employee.user_id, user.id))
      .where(
        and(
          whereCondition,
          inArray(
            organizationTrainingAnswer.employee_public_id,
            employeePublicIds,
          ),
        ),
      )
      .orderBy(
        asc(user.name),
        asc(employee.public_id),
        asc(organizationTrainingAnswer.submitted_at),
        asc(organizationTrainingAnswer.public_id),
      );

    return {
      employeeTrainingSummaryInputs:
        createEmployeeTrainingSummaryInputsFromSourceRows(
          trainingAnswerSourceRows.flatMap(copyTrainingAnswerSourceRow),
          readInput,
        ).sort(compareEmployeeTrainingSummaryInputs),
      total: normalizeTotal(totalRow?.value),
    };
  };
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

    async readEmployeeTrainingSummaryInputs(input) {
      const readInput = normalizeScopeReadInput(input);

      if (readInput === null) {
        return [];
      }

      const trainingAnswerSourceRows =
        await options.readTrainingAnswerSourceRows(readInput);

      return createEmployeeTrainingSummaryInputsFromSourceRows(
        trainingAnswerSourceRows,
        readInput,
      );
    },

    async readEmployeeTrainingSummaryPage(input) {
      const readInput = normalizeEmployeeTrainingSummaryPageInput(input);

      if (readInput === null) {
        return { employeeTrainingSummaryInputs: [], total: 0 };
      }

      const trainingAnswerSourceRows =
        await options.readTrainingAnswerSourceRows(readInput);
      const employeeTrainingSummaryInputs =
        createEmployeeTrainingSummaryInputsFromSourceRows(
          trainingAnswerSourceRows,
          readInput,
        ).sort(compareEmployeeTrainingSummaryInputs);
      const offset =
        (readInput.pagination.page - 1) * readInput.pagination.pageSize;

      return {
        employeeTrainingSummaryInputs: employeeTrainingSummaryInputs.slice(
          offset,
          offset + readInput.pagination.pageSize,
        ),
        total: employeeTrainingSummaryInputs.length,
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
      return { employeeTrainingSummaryInputs: [], total: 0 };
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

function copyTrainingAnswerSourceRow(
  sourceRow: OrganizationAnalyticsTrainingAnswerSourceRow,
): OrganizationAnalyticsTrainingAnswerSourceRow[] {
  const employeePublicId = normalizeRequiredText(sourceRow.employeePublicId);
  const employeeDisplayName = normalizeRequiredText(
    sourceRow.employeeDisplayName ?? "",
  );
  const organizationPublicId = normalizeRequiredText(
    sourceRow.organizationPublicId,
  );
  const organizationTrainingVersionPublicId = normalizeRequiredText(
    sourceRow.organizationTrainingVersionPublicId,
  );
  const submittedAt = normalizeSubmittedAt(sourceRow.submittedAt);
  const answerOrganizationSnapshot = normalizeAnswerOrganizationSnapshot(
    sourceRow.answerOrganizationSnapshot,
  );

  if (
    employeePublicId === null ||
    employeeDisplayName === null ||
    organizationPublicId === null ||
    organizationTrainingVersionPublicId === null ||
    submittedAt === null ||
    answerOrganizationSnapshot === null
  ) {
    return [];
  }

  return [
    {
      employeePublicId,
      employeeDisplayName,
      organizationPublicId,
      organizationTrainingVersionPublicId,
      score: sourceRow.score,
      totalScore: sourceRow.totalScore,
      submittedAt,
      answerOrganizationSnapshot,
    },
  ];
}

type OrganizationAnalyticsEmployeeSummarySourceSubmission =
  OrganizationAnalyticsEmployeeTrainingSummaryRepositoryInput["officialSubmissions"][number] & {
    employeeDisplayName: string;
    organizationPublicId: string;
    organizationName: string;
  };

function createEmployeeTrainingSummaryInputsFromSourceRows(
  sourceRows: readonly OrganizationAnalyticsTrainingAnswerSourceRow[],
  input: OrganizationAnalyticsScopeReadInput,
): OrganizationAnalyticsEmployeeTrainingSummaryRepositoryInput[] {
  const sourceSubmissions = sourceRows.flatMap((sourceRow) =>
    copyTrainingAnswerSourceEmployeeSummarySubmission(sourceRow, input),
  );

  return normalizePublicIdList(
    sourceSubmissions.map((submission) => submission.employeePublicId),
  ).flatMap((employeePublicId) => {
    const employeeSubmissions = sourceSubmissions.filter(
      (submission) => submission.employeePublicId === employeePublicId,
    );
    const latestSubmission =
      selectLatestEmployeeSummarySourceSubmission(employeeSubmissions);

    if (latestSubmission === null) {
      return [];
    }

    return [
      {
        employeePublicId,
        employeeDisplayName: latestSubmission.employeeDisplayName,
        organizationPublicId: latestSubmission.organizationPublicId,
        organizationName: latestSubmission.organizationName,
        visibleTrainingVersionPublicIds: normalizePublicIdList(
          employeeSubmissions.map(
            (submission) => submission.trainingVersionPublicId,
          ),
        ),
        officialSubmissions: employeeSubmissions.map((submission) => ({
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
      },
    ];
  });
}

function copyTrainingAnswerSourceEmployeeSummarySubmission(
  sourceRow: OrganizationAnalyticsTrainingAnswerSourceRow,
  input: OrganizationAnalyticsScopeReadInput,
): OrganizationAnalyticsEmployeeSummarySourceSubmission[] {
  const employeePublicId = normalizeRequiredText(sourceRow.employeePublicId);
  const employeeDisplayName = normalizeRequiredText(
    sourceRow.employeeDisplayName ?? "",
  );
  const organizationPublicId = normalizeRequiredText(
    sourceRow.organizationPublicId,
  );
  const trainingVersionPublicId = normalizeRequiredText(
    sourceRow.organizationTrainingVersionPublicId,
  );
  const score = normalizeScoreValue(sourceRow.score);
  const totalScore = normalizeScoreValue(sourceRow.totalScore);
  const submittedAt = normalizeSubmittedAt(sourceRow.submittedAt);
  const answerOrganizationSnapshot = normalizeAnswerOrganizationSnapshot(
    sourceRow.answerOrganizationSnapshot,
  );

  if (
    employeePublicId === null ||
    employeeDisplayName === null ||
    organizationPublicId === null ||
    trainingVersionPublicId === null ||
    score === null ||
    totalScore === null ||
    submittedAt === null ||
    answerOrganizationSnapshot === null ||
    totalScore <= 0 ||
    !input.scopeOrganizationPublicIds.includes(organizationPublicId) ||
    !isSubmittedAtWithinDateRange(submittedAt, input.dateRange)
  ) {
    return [];
  }

  return [
    {
      employeePublicId,
      employeeDisplayName,
      organizationPublicId,
      organizationName: answerOrganizationSnapshot.organizationName,
      trainingVersionPublicId,
      score,
      totalScore,
      submittedAt,
      answerOrganizationSnapshot,
    },
  ];
}

function selectLatestEmployeeSummarySourceSubmission(
  submissions: readonly OrganizationAnalyticsEmployeeSummarySourceSubmission[],
): OrganizationAnalyticsEmployeeSummarySourceSubmission | null {
  return (
    [...submissions].sort(
      (leftSubmission, rightSubmission) =>
        Date.parse(rightSubmission.submittedAt) -
        Date.parse(leftSubmission.submittedAt),
    )[0] ?? null
  );
}

function compareEmployeeTrainingSummaryInputs(
  leftInput: OrganizationAnalyticsEmployeeTrainingSummaryRepositoryInput,
  rightInput: OrganizationAnalyticsEmployeeTrainingSummaryRepositoryInput,
): number {
  return (
    leftInput.employeeDisplayName.localeCompare(
      rightInput.employeeDisplayName,
    ) || leftInput.employeePublicId.localeCompare(rightInput.employeePublicId)
  );
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
