import { describe, expect, it, vi } from "vitest";

import {
  createOrganizationAnalyticsTrainingEligibilitySource,
  createOrganizationAnalyticsPostgresGateway,
  createOrganizationAnalyticsVisibleOrganizationScopeReader,
  createOrganizationAnalyticsRepository,
  createPostgresOrganizationAnalyticsRepository,
  type OrganizationAnalyticsRepositoryGateway,
} from "./organization-analytics-repository";
import { createOrganizationTrainingRecipientSnapshot } from "./organization-training-repository";
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
  const readEmployeeTrainingSummaryPage = vi.fn(async () => ({
    availability: "available" as const,
    employeeTrainingSummaryInputs: await readEmployeeTrainingSummaryInputs(),
    total: 1,
  }));
  const gateway: OrganizationAnalyticsRepositoryGateway = {
    findVisibleOrganizationScopeByAdminPublicId,
    readTrainingAggregateMetricsInput,
    readEmployeeTrainingSummaryInputs,
    readEmployeeTrainingSummaryPage,
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
    readEmployeeTrainingSummaryPage,
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
  it("derives eligible employees from the immutable recipient snapshot before left joining submissions", () => {
    const capturedAt = "2026-06-01T00:00:00.000Z";
    const recipients = [
      {
        versionId: 101,
        employeePublicId: "employee_public_001",
        employeeDisplayName: "Employee One",
        organizationPublicId: "organization_child_public",
        organizationName: "Child Organization",
        authorizationPublicId: "org_auth_recipient_001",
      },
      {
        versionId: 101,
        employeePublicId: "employee_public_002",
        employeeDisplayName: "Employee Two",
        organizationPublicId: "organization_child_public",
        organizationName: "Child Organization",
        authorizationPublicId: "org_auth_recipient_002",
      },
    ];
    const snapshot = createOrganizationTrainingRecipientSnapshot({
      capturedAt,
      recipients,
    })!;
    const result = createOrganizationAnalyticsTrainingEligibilitySource({
      scopeInput: createScopeInput(),
      versionRows: [
        {
          id: 101,
          publicId: "training_version_public_001",
          organizationPublicId: "organization_root_public",
          publishScopeSnapshot: {
            organizationPublicIds: [
              "organization_root_public",
              "organization_child_public",
            ],
            capturedAt,
          },
          publishedAt: capturedAt,
          answerDeadlineAt: null,
          takenDownAt: null,
          recipientSnapshotSchemaVersion: snapshot.schemaVersion,
          recipientSnapshotCapturedAt: snapshot.capturedAt,
          recipientSnapshotCount: snapshot.count,
          recipientSnapshotDigest: snapshot.digest,
        },
      ],
      recipientRows: recipients,
      submissionRows: [
        {
          versionId: 101,
          versionPublicId: "training_version_public_001",
          employeePublicId: "employee_public_001",
          organizationPublicId: "organization_child_public",
          authorizationPublicId: "org_auth_recipient_001",
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
    });

    expect(result.availability).toBe("available");
    expect(result.eligibleEmployeePublicIds).toEqual([
      "employee_public_001",
      "employee_public_002",
    ]);
    expect(result.officialSubmissions).toHaveLength(1);
    expect(result.employeeTrainingSummaryInputs).toEqual([
      expect.objectContaining({
        employeePublicId: "employee_public_001",
        visibleTrainingVersionPublicIds: ["training_version_public_001"],
        officialSubmissions: [expect.any(Object)],
      }),
      expect.objectContaining({
        employeePublicId: "employee_public_002",
        visibleTrainingVersionPublicIds: ["training_version_public_001"],
        officialSubmissions: [],
      }),
    ]);
  });

  it("distinguishes valid zero-recipient snapshots from legacy and corrupt lineage", () => {
    const capturedAt = "2026-06-01T00:00:00.000Z";
    const zero = createOrganizationTrainingRecipientSnapshot({
      capturedAt,
      recipients: [],
    })!;
    const baseVersion = {
      id: 101,
      publicId: "training_version_public_001",
      organizationPublicId: "organization_root_public",
      publishScopeSnapshot: {
        organizationPublicIds: ["organization_root_public"],
        capturedAt,
      },
      publishedAt: capturedAt,
      answerDeadlineAt: null,
      takenDownAt: null,
    };
    const available = createOrganizationAnalyticsTrainingEligibilitySource({
      scopeInput: createScopeInput(),
      versionRows: [
        {
          ...baseVersion,
          recipientSnapshotSchemaVersion: 1,
          recipientSnapshotCapturedAt: capturedAt,
          recipientSnapshotCount: 0,
          recipientSnapshotDigest: zero.digest,
        },
      ],
      recipientRows: [],
      submissionRows: [],
    });
    const legacy = createOrganizationAnalyticsTrainingEligibilitySource({
      scopeInput: createScopeInput(),
      versionRows: [
        {
          ...baseVersion,
          recipientSnapshotSchemaVersion: null,
          recipientSnapshotCapturedAt: null,
          recipientSnapshotCount: null,
          recipientSnapshotDigest: null,
        },
      ],
      recipientRows: [],
      submissionRows: [],
    });

    expect(available).toEqual({
      availability: "available",
      eligibleEmployeePublicIds: [],
      officialSubmissions: [],
      employeeTrainingSummaryInputs: [],
      relevantVersionPublicIds: ["training_version_public_001"],
    });
    expect(legacy.availability).toBe("unavailable");
  });

  it("returns a successful empty source when no relevant version exists", () => {
    expect(
      createOrganizationAnalyticsTrainingEligibilitySource({
        scopeInput: createScopeInput(),
        versionRows: [],
        recipientRows: [],
        submissionRows: [],
      }),
    ).toEqual({
      availability: "available",
      eligibleEmployeePublicIds: [],
      officialSubmissions: [],
      employeeTrainingSummaryInputs: [],
      relevantVersionPublicIds: [],
    });
  });

  it("applies the earliest deadline or takedown inclusively and rejects cross-authorization answer lineage", () => {
    const capturedAt = "2026-06-16T00:00:00.000Z";
    const recipients = [
      "at_publish",
      "at_takedown",
      "before_publish",
      "after_takedown",
    ].map((suffix) => ({
      versionId: 101,
      employeePublicId: `employee_public_${suffix}`,
      employeeDisplayName: `Employee ${suffix}`,
      organizationPublicId: "organization_child_public",
      organizationName: "Child Organization",
      authorizationPublicId: `org_auth_${suffix}`,
    }));
    const snapshot = createOrganizationTrainingRecipientSnapshot({
      capturedAt,
      recipients,
    })!;
    const versionRows = [
      {
        id: 101,
        publicId: "training_version_public_001",
        organizationPublicId: "organization_root_public",
        publishScopeSnapshot: {
          organizationPublicIds: [
            "organization_root_public",
            "organization_child_public",
          ],
          capturedAt,
        },
        publishedAt: capturedAt,
        answerDeadlineAt: "2026-06-16T18:00:00.000Z",
        takenDownAt: "2026-06-16T12:00:00.000Z",
        recipientSnapshotSchemaVersion: snapshot.schemaVersion,
        recipientSnapshotCapturedAt: snapshot.capturedAt,
        recipientSnapshotCount: snapshot.count,
        recipientSnapshotDigest: snapshot.digest,
      },
    ];
    const createSubmission = (
      suffix: string,
      submittedAt: string,
      authorizationPublicId = `org_auth_${suffix}`,
    ) => ({
      versionId: 101,
      versionPublicId: "training_version_public_001",
      employeePublicId: `employee_public_${suffix}`,
      organizationPublicId: "organization_child_public",
      authorizationPublicId,
      score: 80,
      totalScore: 100,
      submittedAt,
      answerOrganizationSnapshot: {
        organizationPublicId: "organization_child_public",
        organizationName: "Child Organization",
        capturedAt: submittedAt,
      },
    });
    const result = createOrganizationAnalyticsTrainingEligibilitySource({
      scopeInput: createScopeInput(),
      versionRows,
      recipientRows: recipients,
      submissionRows: [
        createSubmission("at_publish", capturedAt),
        createSubmission("at_takedown", "2026-06-16T12:00:00.000Z"),
        createSubmission("before_publish", "2026-06-15T23:59:59.999Z"),
        createSubmission("after_takedown", "2026-06-16T12:00:00.001Z"),
      ],
    });

    expect(result.availability).toBe("available");
    expect(
      result.officialSubmissions.map(
        (submission) => submission.employeePublicId,
      ),
    ).toEqual(["employee_public_at_publish", "employee_public_at_takedown"]);
    expect(
      createOrganizationAnalyticsTrainingEligibilitySource({
        scopeInput: createScopeInput(),
        versionRows,
        recipientRows: recipients,
        submissionRows: [
          createSubmission(
            "at_publish",
            capturedAt,
            "org_auth_different_lineage",
          ),
        ],
      }).availability,
    ).toBe("unavailable");
  });

  it("fails closed for partial markers and recipient count or digest drift", () => {
    const capturedAt = "2026-06-01T00:00:00.000Z";
    const recipient = {
      versionId: 101,
      employeePublicId: "employee_public_001",
      employeeDisplayName: "Employee One",
      organizationPublicId: "organization_root_public",
      organizationName: "Root Organization",
      authorizationPublicId: "org_auth_public_001",
    };
    const snapshot = createOrganizationTrainingRecipientSnapshot({
      capturedAt,
      recipients: [recipient],
    })!;
    const baseVersion = {
      id: 101,
      publicId: "training_version_public_001",
      organizationPublicId: "organization_root_public",
      publishScopeSnapshot: {
        organizationPublicIds: ["organization_root_public"],
        capturedAt,
      },
      publishedAt: capturedAt,
      answerDeadlineAt: null,
      takenDownAt: null,
      recipientSnapshotSchemaVersion: snapshot.schemaVersion,
      recipientSnapshotCapturedAt: snapshot.capturedAt,
      recipientSnapshotCount: snapshot.count,
      recipientSnapshotDigest: snapshot.digest,
    };

    for (const version of [
      { ...baseVersion, recipientSnapshotDigest: null },
      { ...baseVersion, recipientSnapshotCount: 2 },
      { ...baseVersion, recipientSnapshotDigest: "0".repeat(64) },
    ]) {
      expect(
        createOrganizationAnalyticsTrainingEligibilitySource({
          scopeInput: createScopeInput(),
          versionRows: [version],
          recipientRows: [recipient],
          submissionRows: [],
        }).availability,
      ).toBe("unavailable");
    }
  });

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
    const readTrainingEligibilitySource = vi.fn(async () => ({
      availability: "available" as const,
      eligibleEmployeePublicIds: ["employee_public_001"],
      officialSubmissions: [
        {
          employeePublicId: "employee_public_001",
          score: 86,
          totalScore: 100,
          submittedAt: "2026-06-16T02:00:00.000Z",
        },
      ],
      employeeTrainingSummaryInputs: [],
      relevantVersionPublicIds: ["training_version_public_001"],
    }));
    const gateway = createOrganizationAnalyticsPostgresGateway({
      findVisibleOrganizationScopeByAdminPublicId,
      readTrainingEligibilitySource,
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
    expect(readTrainingEligibilitySource).toHaveBeenCalledWith({
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
});
