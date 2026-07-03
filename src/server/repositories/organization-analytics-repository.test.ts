import { describe, expect, it, vi } from "vitest";

import {
  createOrganizationAnalyticsTrainingAnswerSourceReader,
  createOrganizationAnalyticsPostgresGateway,
  createOrganizationAnalyticsVisibleOrganizationScopeReader,
  createOrganizationAnalyticsTrainingAnswerSourceGateway,
  createOrganizationAnalyticsRepository,
  createPostgresOrganizationAnalyticsRepository,
  type OrganizationAnalyticsScopeReadInput,
  type OrganizationAnalyticsRepositoryGateway,
} from "./organization-analytics-repository";
import type { RuntimeDatabase } from "./runtime-database";

function createGateway(
  overrides: Partial<OrganizationAnalyticsRepositoryGateway> = {},
) {
  const findVisibleOrganizationScopeByAdminPublicId = vi.fn(async () => [
    "organization_root_public",
    "organization_child_public",
  ]);
  const readTrainingAggregateMetricsInput = vi.fn(async () => ({
    eligibleEmployeePublicIds: [
      "employee_public_001",
      "employee_public_002",
      "employee_public_001",
    ],
    officialSubmissions: [
      {
        employeePublicId: "employee_public_001",
        score: 86,
        totalScore: 100,
        submittedAt: "2026-06-16T02:00:00.000Z",
        detailFieldA: "hidden detail A",
        detailFieldB: "hidden detail B",
        detailFieldC: "hidden detail C",
        detailFieldD: "hidden detail D",
        hiddenFieldA: "hidden marker A",
        hiddenFieldB: "hidden marker B",
        hiddenFieldC: "hidden marker C",
        hiddenFieldD: "hidden marker D",
        hiddenFieldE: "hidden marker E",
        hiddenFieldF: "hidden marker F",
        hiddenFieldG: "hidden marker G",
        internalRowNumber: 901,
      },
    ],
  }));
  const readEmployeeTrainingSummaryInputs = vi.fn(async () => [
    {
      employeePublicId: "employee_public_001",
      employeeDisplayName: "Employee One",
      organizationPublicId: "organization_child_public",
      organizationName: "Child Organization",
      visibleTrainingVersionPublicIds: [
        "training_version_public_001",
        "training_version_public_002",
      ],
      weakPointLabels: [" 客户异议处理 ", "案例分析"],
      officialSubmissions: [
        {
          employeePublicId: "employee_public_001",
          trainingVersionPublicId: "training_version_public_001",
          score: 86,
          totalScore: 100,
          submittedAt: "2026-06-16T02:00:00.000Z",
          answerOrganizationSnapshot: {
            organizationPublicId: "organization_child_public",
            organizationName: "Child Organization",
            capturedAt: "2026-06-16T01:59:00.000Z",
            detailFieldA: "hidden nested detail",
          },
          hiddenFieldA: "hidden marker A",
          hiddenFieldB: "hidden marker B",
          internalRowNumber: 902,
        },
      ],
      sourceRowNumber: 903,
    },
  ]);
  const readFormalLearningSummary = vi.fn(async () => ({
    formalPracticeCount: 3,
    formalMockExamCount: 2,
    formalExamReportCount: 1,
    formalMistakeBookCount: 4,
    detailFieldA: "hidden formal detail",
    detailFieldB: "hidden formal question",
    internalRowNumber: 904,
  }));
  const readKnowledgeWeakPointSummary = vi.fn(async () => ({
    sampleSize: 6,
    trainingWeakPoints: [
      {
        sourceDomain: "organization_training" as const,
        knowledgeNodeLabel: "客户异议处理",
        affectedEmployeeCount: 3,
        affectedEmployeePercent: 0.5,
        hiddenFieldA: "hidden weak marker A",
      },
    ],
    formalLearningWeakPoints: [
      {
        sourceDomain: "formal_learning" as const,
        knowledgeNodeLabel: "案例分析",
        affectedEmployeeCount: 2,
        affectedEmployeePercent: 0.33,
        hiddenFieldB: "hidden weak marker B",
      },
    ],
    internalRowNumber: 905,
  }));
  const readExportReadinessRows = vi.fn(async () => [
    {
      rowPublicId: "organization_analytics_summary_row_public_001",
      redactionStatus: "summary_only" as const,
      sourceRowNumber: 906,
      downloadArtifact: "hidden download artifact",
      generatedArtifact: "hidden generated artifact",
    },
  ]);
  const gateway: OrganizationAnalyticsRepositoryGateway = {
    findVisibleOrganizationScopeByAdminPublicId,
    readTrainingAggregateMetricsInput,
    readEmployeeTrainingSummaryInputs,
    readFormalLearningSummary,
    readKnowledgeWeakPointSummary,
    readExportReadinessRows,
    ...overrides,
  };

  return {
    gateway,
    findVisibleOrganizationScopeByAdminPublicId,
    readTrainingAggregateMetricsInput,
    readEmployeeTrainingSummaryInputs,
    readFormalLearningSummary,
    readKnowledgeWeakPointSummary,
    readExportReadinessRows,
  };
}

function createScopeInput() {
  return {
    organizationPublicId: " organization_root_public ",
    scopeOrganizationPublicIds: [
      " organization_root_public ",
      "organization_child_public",
      "organization_root_public",
    ],
    dateRange: {
      startAt: "2026-06-16T00:00:00.000Z",
      endAt: "2026-06-16T23:59:59.000Z",
    },
  };
}

type FakeSelectCall = {
  selectionKeys: string[];
  from: ReturnType<typeof vi.fn>;
  innerJoin: ReturnType<typeof vi.fn>;
  where: ReturnType<typeof vi.fn>;
};

function createFakeRuntimeDatabase(selectRowsByCall: readonly unknown[][]) {
  const selectCalls: FakeSelectCall[] = [];
  const select = vi.fn((selection: Record<string, unknown>) => {
    const rows = selectRowsByCall[selectCalls.length] ?? [];
    const queryBuilder = {
      from: vi.fn(() => queryBuilder),
      innerJoin: vi.fn(() => queryBuilder),
      where: vi.fn(async () => rows),
    };

    selectCalls.push({
      selectionKeys: Object.keys(selection),
      from: queryBuilder.from,
      innerJoin: queryBuilder.innerJoin,
      where: queryBuilder.where,
    });

    return queryBuilder;
  });

  return {
    database: { select } as unknown as RuntimeDatabase,
    select,
    selectCalls,
  };
}

describe("organization analytics repository", () => {
  it("looks up visible organization scope only for a nonblank admin public id", async () => {
    const { gateway, findVisibleOrganizationScopeByAdminPublicId } =
      createGateway();
    const repository = createOrganizationAnalyticsRepository(gateway);

    const result = await repository.lookupVisibleOrganizationScope({
      adminPublicId: " organization_admin_public_001 ",
    });
    const blankResult = await repository.lookupVisibleOrganizationScope({
      adminPublicId: " ",
    });

    expect(findVisibleOrganizationScopeByAdminPublicId).toHaveBeenCalledTimes(
      1,
    );
    expect(findVisibleOrganizationScopeByAdminPublicId).toHaveBeenCalledWith(
      "organization_admin_public_001",
    );
    expect(result).toEqual([
      "organization_root_public",
      "organization_child_public",
    ]);
    expect(blankResult).toBeNull();
  });

  it("returns cloned training aggregate inputs without gateway sensitive fields", async () => {
    const { gateway, readTrainingAggregateMetricsInput } = createGateway();
    const repository = createOrganizationAnalyticsRepository(gateway);

    const result =
      await repository.readTrainingAggregateMetricsInput(createScopeInput());

    expect(readTrainingAggregateMetricsInput).toHaveBeenCalledWith({
      organizationPublicId: "organization_root_public",
      scopeOrganizationPublicIds: [
        "organization_root_public",
        "organization_child_public",
      ],
      dateRange: {
        startAt: "2026-06-16T00:00:00.000Z",
        endAt: "2026-06-16T23:59:59.000Z",
      },
    });
    expect(result).toEqual({
      eligibleEmployeePublicIds: [
        "employee_public_001",
        "employee_public_002",
        "employee_public_001",
      ],
      officialSubmissions: [
        {
          employeePublicId: "employee_public_001",
          score: 86,
          totalScore: 100,
          submittedAt: "2026-06-16T02:00:00.000Z",
        },
      ],
    });
    expect(JSON.stringify(result)).not.toMatch(
      /hidden|detailField|hiddenField|internalRowNumber/u,
    );
  });

  it("returns employee summary inputs with answer organization snapshots only", async () => {
    const { gateway } = createGateway();
    const repository = createOrganizationAnalyticsRepository(gateway);

    const result =
      await repository.readEmployeeTrainingSummaryInputs(createScopeInput());

    expect(result).toEqual([
      {
        employeePublicId: "employee_public_001",
        employeeDisplayName: "Employee One",
        organizationPublicId: "organization_child_public",
        organizationName: "Child Organization",
        visibleTrainingVersionPublicIds: [
          "training_version_public_001",
          "training_version_public_002",
        ],
        weakPointLabels: [" 客户异议处理 ", "案例分析"],
        officialSubmissions: [
          {
            employeePublicId: "employee_public_001",
            trainingVersionPublicId: "training_version_public_001",
            score: 86,
            totalScore: 100,
            submittedAt: "2026-06-16T02:00:00.000Z",
            answerOrganizationSnapshot: {
              organizationPublicId: "organization_child_public",
              organizationName: "Child Organization",
              capturedAt: "2026-06-16T01:59:00.000Z",
            },
          },
        ],
      },
    ]);
    expect(JSON.stringify(result)).not.toMatch(
      /hidden|detailField|hiddenField|internalRowNumber|sourceRowNumber/u,
    );
  });

  it("returns formal learning, weak points, and export readiness summaries without detail payloads", async () => {
    const { gateway } = createGateway();
    const repository = createOrganizationAnalyticsRepository(gateway);

    const formalLearningSummary =
      await repository.readFormalLearningSummary(createScopeInput());
    const weakPointSummary =
      await repository.readKnowledgeWeakPointSummary(createScopeInput());
    const exportRows =
      await repository.readExportReadinessRows(createScopeInput());

    expect(formalLearningSummary).toEqual({
      formalPracticeCount: 3,
      formalMockExamCount: 2,
      formalExamReportCount: 1,
      formalMistakeBookCount: 4,
      redactionStatus: "summary_only",
    });
    expect(weakPointSummary).toEqual({
      sampleSize: 6,
      trainingWeakPoints: [
        {
          sourceDomain: "organization_training",
          knowledgeNodeLabel: "客户异议处理",
          affectedEmployeeCount: 3,
          affectedEmployeePercent: 0.5,
        },
      ],
      formalLearningWeakPoints: [
        {
          sourceDomain: "formal_learning",
          knowledgeNodeLabel: "案例分析",
          affectedEmployeeCount: 2,
          affectedEmployeePercent: 0.33,
        },
      ],
    });
    expect(exportRows).toEqual([
      {
        rowPublicId: "organization_analytics_summary_row_public_001",
        redactionStatus: "summary_only",
      },
    ]);
    expect(
      JSON.stringify({ formalLearningSummary, weakPointSummary, exportRows }),
    ).not.toMatch(
      /hidden|detailField|hiddenField|internalRowNumber|sourceRowNumber|downloadArtifact|generatedArtifact/u,
    );
  });

  it("does not query the gateway when scope input is blank", async () => {
    const {
      gateway,
      readTrainingAggregateMetricsInput,
      readEmployeeTrainingSummaryInputs,
      readFormalLearningSummary,
      readKnowledgeWeakPointSummary,
      readExportReadinessRows,
    } = createGateway();
    const repository = createOrganizationAnalyticsRepository(gateway);
    const blankScopeInput = {
      ...createScopeInput(),
      organizationPublicId: " ",
    };

    await expect(
      repository.readTrainingAggregateMetricsInput(blankScopeInput),
    ).resolves.toBeNull();
    await expect(
      repository.readEmployeeTrainingSummaryInputs(blankScopeInput),
    ).resolves.toEqual([]);
    await expect(
      repository.readFormalLearningSummary(blankScopeInput),
    ).resolves.toBeNull();
    await expect(
      repository.readKnowledgeWeakPointSummary(blankScopeInput),
    ).resolves.toBeNull();
    await expect(
      repository.readExportReadinessRows(blankScopeInput),
    ).resolves.toEqual([]);

    expect(readTrainingAggregateMetricsInput).not.toHaveBeenCalled();
    expect(readEmployeeTrainingSummaryInputs).not.toHaveBeenCalled();
    expect(readFormalLearningSummary).not.toHaveBeenCalled();
    expect(readKnowledgeWeakPointSummary).not.toHaveBeenCalled();
    expect(readExportReadinessRows).not.toHaveBeenCalled();
  });

  it("keeps the Postgres repository factory fail-closed without an injected gateway", async () => {
    const repository = createPostgresOrganizationAnalyticsRepository();

    await expect(
      repository.lookupVisibleOrganizationScope({
        adminPublicId: "organization_admin_public_001",
      }),
    ).resolves.toBeNull();
    await expect(
      repository.readTrainingAggregateMetricsInput(createScopeInput()),
    ).resolves.toBeNull();
    await expect(
      repository.readEmployeeTrainingSummaryInputs(createScopeInput()),
    ).resolves.toEqual([]);
    await expect(
      repository.readFormalLearningSummary(createScopeInput()),
    ).resolves.toBeNull();
    await expect(
      repository.readKnowledgeWeakPointSummary(createScopeInput()),
    ).resolves.toBeNull();
    await expect(
      repository.readExportReadinessRows(createScopeInput()),
    ).resolves.toEqual([]);
  });

  it("delegates the Postgres repository factory through an injected aggregate-only gateway", async () => {
    const { gateway, readTrainingAggregateMetricsInput } = createGateway();
    const repository = createPostgresOrganizationAnalyticsRepository({
      gateway,
    });

    const trainingAggregateMetricsInput =
      await repository.readTrainingAggregateMetricsInput(createScopeInput());

    expect(readTrainingAggregateMetricsInput).toHaveBeenCalledTimes(1);
    expect(trainingAggregateMetricsInput).toEqual({
      eligibleEmployeePublicIds: [
        "employee_public_001",
        "employee_public_002",
        "employee_public_001",
      ],
      officialSubmissions: [
        {
          employeePublicId: "employee_public_001",
          score: 86,
          totalScore: 100,
          submittedAt: "2026-06-16T02:00:00.000Z",
        },
      ],
    });
    expect(JSON.stringify(trainingAggregateMetricsInput)).not.toMatch(
      /hidden|detailField|hiddenField|internalRowNumber/u,
    );
  });

  it("composes visible organization scope and answer source readers for the Postgres repository factory", async () => {
    const findVisibleOrganizationScopeByAdminPublicId = vi.fn(async () => [
      " organization_root_public ",
      "organization_child_public",
      "organization_child_public",
      " ",
    ]);
    const readTrainingAnswerSourceRows = vi.fn(async () => [
      {
        employeePublicId: "employee_public_001",
        organizationPublicId: "organization_child_public",
        organizationTrainingVersionPublicId: "training_version_public_001",
        score: 86,
        totalScore: 100,
        submittedAt: "2026-06-16T02:00:00.000Z",
      },
    ]);
    const gateway = createOrganizationAnalyticsPostgresGateway({
      findVisibleOrganizationScopeByAdminPublicId,
      readTrainingAnswerSourceRows,
    });
    const repository = createPostgresOrganizationAnalyticsRepository({
      gateway,
    });

    const visibleOrganizationScope =
      await repository.lookupVisibleOrganizationScope({
        adminPublicId: " organization_admin_public_001 ",
      });
    const trainingAggregateMetricsInput =
      await repository.readTrainingAggregateMetricsInput({
        organizationPublicId: " organization_root_public ",
        scopeOrganizationPublicIds: visibleOrganizationScope ?? [],
        dateRange: {
          startAt: "2026-06-16T00:00:00.000Z",
          endAt: "2026-06-16T23:59:59.000Z",
        },
      });

    expect(findVisibleOrganizationScopeByAdminPublicId).toHaveBeenCalledWith({
      adminPublicId: "organization_admin_public_001",
    });
    expect(visibleOrganizationScope).toEqual([
      "organization_root_public",
      "organization_child_public",
    ]);
    expect(readTrainingAnswerSourceRows).toHaveBeenCalledWith({
      organizationPublicId: "organization_root_public",
      scopeOrganizationPublicIds: [
        "organization_root_public",
        "organization_child_public",
      ],
      dateRange: {
        startAt: "2026-06-16T00:00:00.000Z",
        endAt: "2026-06-16T23:59:59.000Z",
      },
    });
    expect(trainingAggregateMetricsInput).toEqual({
      eligibleEmployeePublicIds: ["employee_public_001"],
      officialSubmissions: [
        {
          employeePublicId: "employee_public_001",
          score: 86,
          totalScore: 100,
          submittedAt: "2026-06-16T02:00:00.000Z",
        },
      ],
    });
  });

  it("maps organization training answer source rows into aggregate metrics input", async () => {
    const readTrainingAnswerSourceRows = vi.fn(async () => [
      {
        employeePublicId: " employee_public_001 ",
        employeeDisplayName: " Employee One ",
        organizationPublicId: "organization_child_public",
        organizationTrainingVersionPublicId: "training_version_public_001",
        score: "86.0",
        totalScore: "100.0",
        submittedAt: new Date("2026-06-16T02:00:00.000Z"),
        answerPublicId: "answer_public_hidden_001",
        detailFieldA: "hidden detail",
        sourceRowId: 901,
      },
      {
        employeePublicId: "employee_public_002",
        organizationPublicId: "organization_root_public",
        organizationTrainingVersionPublicId: "training_version_public_002",
        score: 73,
        totalScore: 100,
        submittedAt: "2026-06-16T03:00:00.000Z",
        hiddenFieldA: "hidden marker",
      },
      {
        employeePublicId: "employee_public_outside_scope",
        organizationPublicId: "organization_other_public",
        organizationTrainingVersionPublicId: "training_version_public_003",
        score: 99,
        totalScore: 100,
        submittedAt: "2026-06-16T04:00:00.000Z",
      },
      {
        employeePublicId: "employee_public_outside_range",
        organizationPublicId: "organization_child_public",
        organizationTrainingVersionPublicId: "training_version_public_004",
        score: 92,
        totalScore: 100,
        submittedAt: "2026-06-17T04:00:00.000Z",
      },
      {
        employeePublicId: " ",
        organizationPublicId: "organization_child_public",
        organizationTrainingVersionPublicId: "training_version_public_005",
        score: 88,
        totalScore: 100,
        submittedAt: "2026-06-16T05:00:00.000Z",
      },
      {
        employeePublicId: "employee_public_invalid_score",
        organizationPublicId: "organization_child_public",
        organizationTrainingVersionPublicId: "training_version_public_006",
        score: null,
        totalScore: 100,
        submittedAt: "2026-06-16T06:00:00.000Z",
      },
    ]);
    const gateway = createOrganizationAnalyticsTrainingAnswerSourceGateway({
      readTrainingAnswerSourceRows,
    });

    const result =
      await gateway.readTrainingAggregateMetricsInput(createScopeInput());

    expect(readTrainingAnswerSourceRows).toHaveBeenCalledWith({
      organizationPublicId: "organization_root_public",
      scopeOrganizationPublicIds: [
        "organization_root_public",
        "organization_child_public",
      ],
      dateRange: {
        startAt: "2026-06-16T00:00:00.000Z",
        endAt: "2026-06-16T23:59:59.000Z",
      },
    });
    expect(result).toEqual({
      eligibleEmployeePublicIds: ["employee_public_001", "employee_public_002"],
      officialSubmissions: [
        {
          employeePublicId: "employee_public_001",
          score: 86,
          totalScore: 100,
          submittedAt: "2026-06-16T02:00:00.000Z",
        },
        {
          employeePublicId: "employee_public_002",
          score: 73,
          totalScore: 100,
          submittedAt: "2026-06-16T03:00:00.000Z",
        },
      ],
    });
    expect(JSON.stringify(result)).not.toMatch(
      /answer_public_hidden|training_version_public|hidden|detailField|sourceRowId/u,
    );
    await expect(
      gateway.readEmployeeTrainingSummaryInputs(createScopeInput()),
    ).resolves.toEqual([]);
  });

  it("maps organization training answer source rows into employee summary inputs", async () => {
    const readTrainingAnswerSourceRows = vi.fn(async () => [
      {
        employeePublicId: " employee_public_001 ",
        employeeDisplayName: " Employee One ",
        organizationPublicId: "organization_child_public",
        organizationTrainingVersionPublicId: "training_version_public_001",
        score: "86.0",
        totalScore: "100.0",
        submittedAt: new Date("2026-06-16T02:00:00.000Z"),
        answerOrganizationSnapshot: {
          organizationPublicId: "organization_child_public",
          organizationName: "Child Organization",
          capturedAt: "2026-06-16T01:59:00.000Z",
          hiddenSnapshotField: "hidden snapshot detail",
        },
        hiddenAnswerPublicId: "answer_public_hidden_001",
      },
      {
        employeePublicId: "employee_public_001",
        employeeDisplayName: "Employee One",
        organizationPublicId: "organization_root_public",
        organizationTrainingVersionPublicId: "training_version_public_002",
        score: 91,
        totalScore: 100,
        submittedAt: "2026-06-16T05:00:00.000Z",
        answerOrganizationSnapshot: {
          organizationPublicId: "organization_root_public",
          organizationName: "Root Organization",
          capturedAt: "2026-06-16T04:59:00.000Z",
        },
      },
      {
        employeePublicId: "employee_public_002",
        employeeDisplayName: "Employee Two",
        organizationPublicId: "organization_child_public",
        organizationTrainingVersionPublicId: "training_version_public_003",
        score: "77.5",
        totalScore: "100.0",
        submittedAt: "2026-06-16T06:00:00.000Z",
        answerOrganizationSnapshot: {
          organizationPublicId: "organization_child_public",
          organizationName: "Child Organization",
          capturedAt: "2026-06-16T05:59:00.000Z",
        },
      },
      {
        employeePublicId: "employee_public_outside_scope",
        employeeDisplayName: "Employee Outside Scope",
        organizationPublicId: "organization_other_public",
        organizationTrainingVersionPublicId: "training_version_public_004",
        score: 99,
        totalScore: 100,
        submittedAt: "2026-06-16T07:00:00.000Z",
        answerOrganizationSnapshot: {
          organizationPublicId: "organization_other_public",
          organizationName: "Other Organization",
          capturedAt: "2026-06-16T06:59:00.000Z",
        },
      },
      {
        employeePublicId: "employee_public_invalid_score",
        employeeDisplayName: "Employee Invalid Score",
        organizationPublicId: "organization_child_public",
        organizationTrainingVersionPublicId: "training_version_public_005",
        score: null,
        totalScore: 100,
        submittedAt: "2026-06-16T08:00:00.000Z",
        answerOrganizationSnapshot: {
          organizationPublicId: "organization_child_public",
          organizationName: "Child Organization",
          capturedAt: "2026-06-16T07:59:00.000Z",
        },
      },
      {
        employeePublicId: "employee_public_invalid_snapshot",
        employeeDisplayName: "Employee Invalid Snapshot",
        organizationPublicId: "organization_child_public",
        organizationTrainingVersionPublicId: "training_version_public_006",
        score: 81,
        totalScore: 100,
        submittedAt: "2026-06-16T09:00:00.000Z",
        answerOrganizationSnapshot: {
          organizationPublicId: " ",
          organizationName: "Child Organization",
          capturedAt: "2026-06-16T08:59:00.000Z",
        },
      },
    ]);
    const gateway = createOrganizationAnalyticsTrainingAnswerSourceGateway({
      readTrainingAnswerSourceRows,
    });

    const result =
      await gateway.readEmployeeTrainingSummaryInputs(createScopeInput());

    expect(readTrainingAnswerSourceRows).toHaveBeenCalledWith({
      organizationPublicId: "organization_root_public",
      scopeOrganizationPublicIds: [
        "organization_root_public",
        "organization_child_public",
      ],
      dateRange: {
        startAt: "2026-06-16T00:00:00.000Z",
        endAt: "2026-06-16T23:59:59.000Z",
      },
    });
    expect(result).toEqual([
      {
        employeePublicId: "employee_public_001",
        employeeDisplayName: "Employee One",
        organizationPublicId: "organization_root_public",
        organizationName: "Root Organization",
        visibleTrainingVersionPublicIds: [
          "training_version_public_001",
          "training_version_public_002",
        ],
        officialSubmissions: [
          {
            employeePublicId: "employee_public_001",
            trainingVersionPublicId: "training_version_public_001",
            score: 86,
            totalScore: 100,
            submittedAt: "2026-06-16T02:00:00.000Z",
            answerOrganizationSnapshot: {
              organizationPublicId: "organization_child_public",
              organizationName: "Child Organization",
              capturedAt: "2026-06-16T01:59:00.000Z",
            },
          },
          {
            employeePublicId: "employee_public_001",
            trainingVersionPublicId: "training_version_public_002",
            score: 91,
            totalScore: 100,
            submittedAt: "2026-06-16T05:00:00.000Z",
            answerOrganizationSnapshot: {
              organizationPublicId: "organization_root_public",
              organizationName: "Root Organization",
              capturedAt: "2026-06-16T04:59:00.000Z",
            },
          },
        ],
      },
      {
        employeePublicId: "employee_public_002",
        employeeDisplayName: "Employee Two",
        organizationPublicId: "organization_child_public",
        organizationName: "Child Organization",
        visibleTrainingVersionPublicIds: ["training_version_public_003"],
        officialSubmissions: [
          {
            employeePublicId: "employee_public_002",
            trainingVersionPublicId: "training_version_public_003",
            score: 77.5,
            totalScore: 100,
            submittedAt: "2026-06-16T06:00:00.000Z",
            answerOrganizationSnapshot: {
              organizationPublicId: "organization_child_public",
              organizationName: "Child Organization",
              capturedAt: "2026-06-16T05:59:00.000Z",
            },
          },
        ],
      },
    ]);
    expect(JSON.stringify(result)).not.toMatch(
      /answer_public_hidden|hidden|detailField|sourceRowId/u,
    );
  });

  it("creates a RuntimeDatabase visible organization scope reader from active admin organization assignments", async () => {
    const { database, select, selectCalls } = createFakeRuntimeDatabase([
      [{ organizationId: 101 }],
      [
        {
          organizationId: 101,
          organizationPublicId: "organization_root_public",
          parentOrganizationId: null,
          hiddenField: "hidden root detail",
        },
        {
          organizationId: 102,
          organizationPublicId: "organization_child_public",
          parentOrganizationId: 101,
          hiddenField: "hidden child detail",
        },
        {
          organizationId: 103,
          organizationPublicId: "organization_grandchild_public",
          parentOrganizationId: 102,
          hiddenField: "hidden grandchild detail",
        },
        {
          organizationId: 104,
          organizationPublicId: "organization_other_public",
          parentOrganizationId: null,
          hiddenField: "hidden other detail",
        },
      ],
    ]);
    const readVisibleOrganizationScope =
      createOrganizationAnalyticsVisibleOrganizationScopeReader(database);

    const result = await readVisibleOrganizationScope({
      adminPublicId: " organization_admin_public_001 ",
    });
    const blankResult = await readVisibleOrganizationScope({
      adminPublicId: " ",
    });

    expect(select).toHaveBeenCalledTimes(2);
    expect(selectCalls.map((selectCall) => selectCall.selectionKeys)).toEqual([
      ["organizationId"],
      ["organizationId", "organizationPublicId", "parentOrganizationId"],
    ]);
    expect(selectCalls[0]?.innerJoin).toHaveBeenCalledTimes(2);
    expect(result).toEqual([
      "organization_root_public",
      "organization_child_public",
      "organization_grandchild_public",
    ]);
    expect(blankResult).toBeNull();
    expect(JSON.stringify(result)).not.toMatch(/hidden|organizationId/u);
  });

  it("creates a RuntimeDatabase training answer reader with aggregate-only source rows", async () => {
    const { database, select, selectCalls } = createFakeRuntimeDatabase([
      [
        {
          employeePublicId: " employee_public_001 ",
          employeeDisplayName: " Employee One ",
          organizationPublicId: "organization_child_public",
          organizationTrainingVersionPublicId: "training_version_public_001",
          score: "86.0",
          totalScore: "100.0",
          submittedAt: new Date("2026-06-16T02:00:00.000Z"),
          answerOrganizationSnapshot: {
            organizationPublicId: "organization_child_public",
            organizationName: "Child Organization",
            capturedAt: "2026-06-16T01:59:00.000Z",
          },
          answerPublicId: "answer_public_hidden_001",
          detailField: "hidden answer detail",
          sourceRowId: 901,
        },
      ],
    ]);
    const readTrainingAnswerSourceRows =
      createOrganizationAnalyticsTrainingAnswerSourceReader(database);

    const result = await readTrainingAnswerSourceRows(
      createScopeInput() as OrganizationAnalyticsScopeReadInput,
    );
    const blankScopeResult = await readTrainingAnswerSourceRows({
      ...(createScopeInput() as OrganizationAnalyticsScopeReadInput),
      organizationPublicId: " ",
    });

    expect(select).toHaveBeenCalledTimes(1);
    expect(selectCalls[0]?.selectionKeys).toEqual([
      "employeePublicId",
      "employeeDisplayName",
      "organizationPublicId",
      "organizationTrainingVersionPublicId",
      "score",
      "totalScore",
      "submittedAt",
      "answerOrganizationSnapshot",
    ]);
    expect(result).toEqual([
      {
        employeePublicId: "employee_public_001",
        employeeDisplayName: "Employee One",
        organizationPublicId: "organization_child_public",
        organizationTrainingVersionPublicId: "training_version_public_001",
        score: "86.0",
        totalScore: "100.0",
        submittedAt: "2026-06-16T02:00:00.000Z",
        answerOrganizationSnapshot: {
          organizationPublicId: "organization_child_public",
          organizationName: "Child Organization",
          capturedAt: "2026-06-16T01:59:00.000Z",
        },
      },
    ]);
    expect(blankScopeResult).toEqual([]);
    expect(JSON.stringify(result)).not.toMatch(
      /answer_public_hidden|hidden|detailField|sourceRowId/u,
    );
  });
});
