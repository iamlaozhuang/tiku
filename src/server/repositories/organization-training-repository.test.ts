import { describe, expect, it, vi } from "vitest";
import { sql } from "drizzle-orm";
import { PgDialect } from "drizzle-orm/pg-core";

import type {
  OrganizationTrainingEmployeeAnswerDraftWrite,
  OrganizationTrainingEmployeeAnswerSubmissionWrite,
  OrganizationTrainingManualDraftWrite,
  OrganizationTrainingPublishedVersionWrite,
  OrganizationTrainingSourceContextWrite,
  OrganizationTrainingVersionCopyToNewDraftWrite,
  OrganizationTrainingVersionTakedownWrite,
} from "../services/organization-training-service";
import type {
  EmployeeOrganizationTrainingAnswerDto,
  OrganizationTrainingDraftDto,
  OrganizationTrainingSourceContextAttachmentDto,
} from "../contracts/organization-training-contract";
import {
  createOrganizationTrainingRepository,
  createOrganizationTrainingAdminLifecyclePageSql,
  createOrganizationTrainingVisibleOrganizationPublicIdArraySql,
  createPostgresOrganizationTrainingRepository,
  type OrganizationTrainingEmployeeAnswerLookupInput,
  type OrganizationTrainingEmployeeVisibleVersionListInput,
  type OrganizationTrainingTrustedPersistenceLineage,
  type OrganizationTrainingVersionTakedownInput,
  type OrganizationTrainingVersionLookupInput,
  type OrganizationTrainingVersionGateway,
  type OrganizationTrainingVersionInsertInput,
  type OrganizationTrainingVersionRow,
  type OrganizationTrainingVisibleOrganizationScopeSource,
} from "./organization-training-repository";

describe("organization training visible organization SQL", () => {
  it("binds visible organization public ids as a postgres text array", () => {
    const dialect = new PgDialect();

    const query = dialect.sqlToQuery(sql`
      publish_scope_snapshot->'organizationPublicIds' ?| ${createOrganizationTrainingVisibleOrganizationPublicIdArraySql(
        ["organization_public_123", "organization_branch_public_456"],
      )}
    `);

    expect(query.sql).toContain(
      "publish_scope_snapshot->'organizationPublicIds' ?| ARRAY[$1, $2]::text[]",
    );
    expect(query.params).toEqual([
      "organization_public_123",
      "organization_branch_public_456",
    ]);
    expect(query.params).not.toEqual([
      ["organization_public_123", "organization_branch_public_456"],
    ]);
  });

  it("preserves a large filtered total while returning only the bounded requested page", async () => {
    const execute = vi.fn(async () => [
      {
        public_id: "training_version_page_101",
        resource_type: "organization_training_version",
        organization_public_id: "organization_public_123",
        authorization_public_id: null,
        profession: "monopoly",
        level: 3,
        subject: "theory",
        title: "Newest published training",
        description: null,
        revision: null,
        question_count: 2,
        total_score: "5",
        question_type_summary: null,
        activity_at: new Date("2026-07-21T10:00:00.000Z"),
        status: "published",
        source_kind: "ai_paper",
        content_kind: "paper_training",
        total: 10_000,
        invalid_version_total: 1,
      },
    ]);
    const repository = createPostgresOrganizationTrainingRepository({
      createDatabase: () => ({ execute }) as never,
    });

    const result = await repository.readAdminLifecyclePage({
      visibleOrganizationPublicIds: ["organization_public_123"],
      page: 6,
      pageSize: 20,
      status: "all",
      sourceKind: "all",
      contentKind: "all",
    });

    expect(execute).toHaveBeenCalledTimes(1);
    expect(result).toEqual({
      items: [
        expect.objectContaining({
          publicId: "training_version_page_101",
          activityAt: "2026-07-21T10:00:00.000Z",
          availableActions: ["take_down", "copy_to_new_draft"],
        }),
      ],
      total: 10_000,
      integrityStatus: "partial",
      warningCode: "historical_version_unavailable",
    });
  });

  it("returns an empty out-of-range page without losing the real filtered total", async () => {
    const repository = createPostgresOrganizationTrainingRepository({
      createDatabase: () =>
        ({
          execute: vi.fn(async () => [
            {
              public_id: null,
              resource_type: null,
              organization_public_id: null,
              authorization_public_id: null,
              profession: null,
              level: null,
              subject: null,
              title: null,
              description: null,
              revision: null,
              question_count: null,
              total_score: null,
              question_type_summary: null,
              activity_at: null,
              status: null,
              source_kind: null,
              content_kind: null,
              total: 10_000,
              invalid_version_total: 0,
            },
          ]),
        }) as never,
    });

    await expect(
      repository.readAdminLifecyclePage({
        visibleOrganizationPublicIds: ["organization_public_123"],
        page: 501,
        pageSize: 20,
        status: "all",
        sourceKind: "all",
        contentKind: "all",
      }),
    ).resolves.toEqual({
      items: [],
      total: 10_000,
      integrityStatus: "complete",
      warningCode: null,
    });
  });

  it("builds one bounded homogeneous admin lifecycle projection with a real count and stable tie-breakers", () => {
    const query = new PgDialect().sqlToQuery(
      createOrganizationTrainingAdminLifecyclePageSql({
        visibleOrganizationPublicIds: ["organization_public_123"],
        page: 3,
        pageSize: 50,
        status: "published",
        sourceKind: "ai_paper",
        contentKind: "paper_training",
      }),
    );

    expect(query.sql).toMatch(/union all/u);
    expect(query.sql).toMatch(/count\(\*\)/u);
    expect(query.sql).toMatch(
      /order by activity_at desc, resource_type asc, public_id asc/u,
    );
    expect(query.sql).toMatch(/limit \$\d+ offset \$\d+/u);
    expect(query.params).toEqual(
      expect.arrayContaining([
        "organization_public_123",
        "published",
        "ai_paper",
        "paper_training",
        50,
        100,
      ]),
    );
  });
});

type EmployeeAnswerRepositoryContract = {
  saveEmployeeAnswerDraft(
    answerDraftWrite: OrganizationTrainingEmployeeAnswerDraftWrite,
  ): Promise<EmployeeOrganizationTrainingAnswerDto>;
  submitEmployeeAnswer(
    answerSubmissionWrite: OrganizationTrainingEmployeeAnswerSubmissionWrite,
  ): Promise<EmployeeOrganizationTrainingAnswerDto>;
};

type EmployeeAnswerPersistenceLineage = {
  organizationTrainingVersionId: number;
  employeeId: number;
  employeeOrgAuthId: number;
  organizationId: number;
  organizationName: string;
  totalScore: number;
  questionSnapshot: OrganizationTrainingVersionInsertInput["questionSnapshot"];
};

type PaperQuestionSnapshotLookupInput = {
  draftPublicIds: readonly string[];
};

type PaperQuestionSnapshotRow = {
  trainingDraftPublicId: string;
  paperQuestionPublicId: string;
  questionSnapshot: Record<string, unknown>;
  materialSnapshot: Record<string, unknown> | null;
  score: number | string | null;
  sortOrder: number;
};

function createRevokedMembershipPersistenceDatabase() {
  const events: string[] = [];
  const mutations: string[] = [];
  const createSelectBuilder = (rows: unknown[]) => {
    const builder = {
      from() {
        return builder;
      },
      innerJoin() {
        return builder;
      },
      limit() {
        return builder;
      },
      then<TResult1 = unknown[], TResult2 = never>(
        onFulfilled?:
          | ((value: unknown[]) => TResult1 | PromiseLike<TResult1>)
          | null,
        onRejected?:
          | ((reason: unknown) => TResult2 | PromiseLike<TResult2>)
          | null,
      ) {
        return Promise.resolve(rows).then(onFulfilled, onRejected);
      },
      where() {
        return builder;
      },
    };

    return builder;
  };
  const transaction = {
    async execute() {
      events.push("employee_identity_lock");
      return [];
    },
    insert() {
      mutations.push("insert");
      throw new Error("membership conflict must not insert");
    },
    select() {
      events.push("membership_recheck");
      return createSelectBuilder([]);
    },
    update() {
      mutations.push("update");
      throw new Error("membership conflict must not update");
    },
  };
  const database = {
    select() {
      events.push("lineage_lookup");
      return createSelectBuilder([
        {
          employee_id: 701,
          employee_org_auth_id: 601,
          organization_id: 501,
          organization_name: "Test Organization",
          organization_training_version_id: 801,
          question_snapshot: createVersionWrite().questionSnapshot,
          total_score: "5",
        },
      ]);
    },
    async transaction<T>(
      callback: (transactionValue: typeof transaction) => Promise<T>,
    ) {
      return callback(transaction);
    },
  };

  return { database, events, mutations };
}

type EmployeeAnswerDraftUpsertInput = {
  publicId: string;
  organizationTrainingVersionId: number;
  trainingVersionPublicId: string;
  employeeId: number;
  employeePublicId: string;
  organizationId: number;
  organizationPublicId: string;
  answerOrganizationSnapshot: {
    organizationPublicId: string;
    organizationName: string;
    capturedAt: string;
  };
  answerStatus: "in_progress";
  score: null;
  totalScore: number;
  answerItemSnapshot: {
    questionPublicId: string;
    selectedOptionPublicIds: string[];
    textAnswer: string | null;
  }[];
  questionResultSnapshot: {
    questionPublicId: string;
    score: number;
    maxScore: number;
    standardAnswer: string | null;
    analysis: string | null;
    scoringPointResults: {
      label: string;
      score: number;
      maxScore: number;
      reason: string;
    }[];
  }[];
  submittedAt: null;
  savedAt: string;
};

type EmployeeAnswerSubmissionUpsertInput = {
  publicId: string;
  organizationTrainingVersionId: number;
  trainingVersionPublicId: string;
  employeeId: number;
  employeePublicId: string;
  organizationId: number;
  organizationPublicId: string;
  answerOrganizationSnapshot: {
    organizationPublicId: string;
    organizationName: string;
    capturedAt: string;
  };
  answerStatus: "submitted";
  score: number;
  totalScore: number;
  answerItemSnapshot: {
    questionPublicId: string;
    selectedOptionPublicIds: string[];
    textAnswer: string | null;
  }[];
  questionResultSnapshot: {
    questionPublicId: string;
    score: number;
    maxScore: number;
    standardAnswer: string | null;
    analysis: string | null;
    scoringPointResults: {
      label: string;
      score: number;
      maxScore: number;
      reason: string;
    }[];
  }[];
  submittedAt: string;
};

type DraftSourceContextRepositoryContract = {
  createManualDraft(
    draftWrite: OrganizationTrainingManualDraftWrite,
  ): Promise<OrganizationTrainingDraftDto>;
  copyVersionToNewDraft(
    copyWrite: OrganizationTrainingVersionCopyToNewDraftWrite,
  ): Promise<OrganizationTrainingDraftDto>;
  attachSourceContext(
    sourceContextWrite: OrganizationTrainingSourceContextWrite,
  ): Promise<OrganizationTrainingSourceContextAttachmentDto>;
};

type DraftPersistenceLineage = {
  organizationTrainingDraftId: number;
  organizationId: number;
  orgAuthId: number;
};

type ManualDraftInsertInput = {
  publicId: string;
  sourceTaskPublicId: string | null;
  sourceVersionPublicId: string | null;
  organizationId: number;
  organizationPublicId: string;
  orgAuthId: number;
  authorizationSource: "org_auth";
  authorizationPublicId: string;
  ownerType: "organization";
  ownerPublicId: string;
  quotaOwnerType: "organization";
  quotaOwnerPublicId: string;
  profession: "monopoly" | "marketing" | "logistics";
  level: number;
  subject: "theory" | "skill";
  title: string;
  description: string | null;
  questionCount: number;
  totalScore: number;
  questionTypeSummary: {
    singleChoice: number;
    multiChoice: number;
    trueFalse: number;
    shortAnswer: number;
  };
  evidenceStatus: "sufficient" | "weak" | "none";
  validationStatus: "valid" | "invalid" | "needs_review";
  retentionStatus: "active" | "expired_hidden";
  createdAt: string;
  expiresAt: string | null;
};

type SourceContextInsertInput = {
  publicId: string;
  organizationTrainingDraftId: number;
  draftPublicId: string;
  organizationId: number;
  organizationPublicId: string;
  orgAuthId: number;
  authorizationSource: "org_auth";
  authorizationPublicId: string;
  sourceType: "paper" | "mock_exam" | "organization_ai_result";
  sourcePublicId: string;
  title: string;
  profession: "monopoly" | "marketing" | "logistics";
  level: number;
  subject: "theory" | "skill";
  questionCount: number;
  totalScore: number;
  sourceStatus: string;
  redactionStatus: "metadata_only";
  formalUsagePolicy: {
    createFormalPaper: false;
    createMockExam: false;
    exposeQuestionBody: false;
    exposeStandardAnswer: false;
    exposeAnalysis: false;
    exposeProviderPayload: false;
  };
};

function createVersionWrite(
  overrides: Partial<OrganizationTrainingPublishedVersionWrite> = {},
): OrganizationTrainingPublishedVersionWrite {
  return {
    contentType: "organization_training_version",
    ownerType: "organization",
    ownerPublicId: "organization_public_123",
    quotaOwnerType: "organization",
    quotaOwnerPublicId: "organization_public_123",
    authorizationSource: "org_auth",
    authorizationPublicId: "org_auth_public_123",
    draftPublicId: "training_draft_public_123",
    organizationPublicId: "organization_public_123",
    publishScopeSnapshot: {
      organizationPublicIds: [
        "organization_public_123",
        "organization_branch_public_456",
      ],
      capturedAt: "2026-06-15T19:20:13.000Z",
    },
    profession: "monopoly",
    level: 3,
    subject: "theory",
    title: "Safety training",
    description: null,
    questionCount: 2,
    totalScore: 5,
    questionTypeSummary: {
      singleChoice: 1,
      multiChoice: 0,
      trueFalse: 0,
      shortAnswer: 1,
    },
    questionSnapshot: [
      {
        publicId: "training_question_public_123",
        sequenceNumber: 1,
        questionType: "single_choice",
        materialTitle: "Safety material",
        materialContent: "Safety material body",
        stem: "Which option is compliant?",
        options: [
          {
            publicId: "training_question_option_a",
            label: "A",
            content: "compliant option",
          },
          {
            publicId: "training_question_option_b",
            label: "B",
            content: "distractor option",
          },
        ],
        score: 2,
        standardAnswer: "A",
        analysisSummary: "choice rationale",
        evidenceStatus: "sufficient",
        citationCount: 1,
      },
      {
        publicId: "training_question_public_456",
        sequenceNumber: 2,
        questionType: "short_answer",
        materialTitle: null,
        materialContent: null,
        stem: "Describe the handling rule.",
        options: [],
        score: 3,
        standardAnswer: "expected answer",
        analysisSummary: "scoring rationale",
        evidenceStatus: "weak",
        citationCount: 0,
      },
    ],
    status: "published",
    publishedAt: "2026-06-15T19:20:13.000Z",
    answerDeadlineAt: null,
    expectedDraftRevision: 1,
    publishOperationId: "publish_operation_123",
    publishPayloadDigest: "publish_digest_123",
    takenDownAt: null,
    takedownReason: null,
    ...overrides,
  };
}

function createManualDraftWrite(
  overrides: Partial<OrganizationTrainingManualDraftWrite> = {},
): OrganizationTrainingManualDraftWrite {
  return {
    contentType: "organization_training_draft",
    draftStatus: "draft",
    revision: 1,
    questions: [],
    ownerType: "organization",
    ownerPublicId: "organization_public_123",
    quotaOwnerType: "organization",
    quotaOwnerPublicId: "organization_public_123",
    sourceTaskPublicId: null,
    organizationPublicId: "organization_public_123",
    authorizationSource: "org_auth",
    authorizationPublicId: "org_auth_public_123",
    profession: "monopoly",
    level: 3,
    subject: "theory",
    title: "Safety training draft",
    description: null,
    questionCount: 0,
    totalScore: 0,
    questionTypeSummary: {
      singleChoice: 0,
      multiChoice: 0,
      trueFalse: 0,
      shortAnswer: 0,
    },
    evidenceStatus: "none",
    validationStatus: "needs_review",
    retentionStatus: "active",
    createdAt: "2026-06-15T19:20:13.000Z",
    expiresAt: null,
    ...overrides,
  };
}

function createCopyVersionToNewDraftWrite(
  overrides: Partial<OrganizationTrainingVersionCopyToNewDraftWrite> = {},
): OrganizationTrainingVersionCopyToNewDraftWrite {
  return {
    sourceVersionPublicId: "training_version_public_123",
    organizationPublicId: "organization_public_123",
    authorizationPublicId: "org_auth_public_123",
    sourceVersion: {
      publicId: "training_version_public_123",
      draftPublicId: "training_draft_public_123",
      versionNumber: 1,
      organizationPublicId: "organization_public_123",
      publishScopeSnapshot: {
        organizationPublicIds: ["organization_public_123"],
        capturedAt: "2026-06-15T19:20:13.000Z",
      },
      profession: "monopoly",
      level: 3,
      subject: "theory",
      title: "Safety training",
      description: null,
      questionCount: 2,
      totalScore: 5,
      status: "published",
      publishedAt: "2026-06-15T19:20:13.000Z",
      answerDeadlineAt: null,
      takenDownAt: null,
      takedownReason: null,
    },
    sourceQuestionTypeSummary: {
      singleChoice: 1,
      multiChoice: 0,
      trueFalse: 0,
      shortAnswer: 1,
    },
    newDraftTitle: "Refreshed training",
    contentType: "organization_training_draft",
    ownerType: "organization",
    ownerPublicId: "organization_public_123",
    quotaOwnerType: "organization",
    quotaOwnerPublicId: "organization_public_123",
    createdAt: "2026-06-16T09:00:00.000Z",
    copyPolicy: {
      preserveSourceVersion: true,
      preservePublishScopeSnapshot: true,
      createFreshDraftPublicId: true,
    },
    ...overrides,
  };
}

function createSourceContextWrite(
  overrides: Partial<OrganizationTrainingSourceContextWrite> = {},
): OrganizationTrainingSourceContextWrite {
  return {
    contentType: "organization_training_source_context",
    draftPublicId: "training_draft_public_123",
    organizationPublicId: "organization_public_123",
    authorizationSource: "org_auth",
    authorizationPublicId: "org_auth_public_123",
    sourceContexts: [
      {
        sourceType: "paper",
        sourcePublicId: "paper_public_123",
        title: "Formal paper reference",
        profession: "monopoly",
        level: 3,
        subject: "theory",
        questionCount: 20,
        totalScore: 100,
        sourceStatus: "published",
        redactionStatus: "metadata_only",
      },
      {
        sourceType: "mock_exam",
        sourcePublicId: "mock_exam_public_456",
        title: "Mock exam reference",
        profession: "monopoly",
        level: 3,
        subject: "theory",
        questionCount: 10,
        totalScore: 50,
        sourceStatus: "published",
        redactionStatus: "metadata_only",
      },
    ],
    formalUsagePolicy: {
      createFormalPaper: false,
      createMockExam: false,
      exposeQuestionBody: false,
      exposeStandardAnswer: false,
      exposeAnalysis: false,
      exposeProviderPayload: false,
    },
    redactionStatus: "metadata_only",
    ...overrides,
  };
}

function createEmployeeAnswerDraftWrite(
  overrides: Partial<OrganizationTrainingEmployeeAnswerDraftWrite> = {},
): OrganizationTrainingEmployeeAnswerDraftWrite {
  return {
    contentType: "organization_training_answer_draft",
    trainingVersionPublicId: "training_version_public_123",
    employeePublicId: "employee_public_123",
    organizationPublicId: "organization_public_123",
    answerOrganizationSnapshot: {
      organizationPublicIds: ["organization_public_123"],
      capturedAt: "2026-06-16T09:00:00.000Z",
    },
    answerStatus: "in_progress",
    expectedRevision: 0,
    operationId: "answer_draft_operation_123",
    payloadDigest: "answer_draft_digest_123",
    answeredQuestionCount: 1,
    answerItems: [
      {
        questionPublicId: "training_question_public_123",
        selectedOptionPublicIds: ["training_question_option_a"],
        textAnswer: null,
      },
    ],
    scoreSummary: null,
    savedAt: "2026-06-16T09:00:00.000Z",
    submittedAt: null,
    formalWritePolicy: {
      createPractice: false,
      createMockExam: false,
      createFormalAnswerRecord: false,
      createExamReport: false,
      createMistakeBook: false,
    },
    ...overrides,
  };
}

function createEmployeeAnswerSubmissionWrite(
  overrides: Partial<OrganizationTrainingEmployeeAnswerSubmissionWrite> = {},
): OrganizationTrainingEmployeeAnswerSubmissionWrite {
  return {
    contentType: "organization_training_answer_record",
    trainingVersionPublicId: "training_version_public_123",
    employeePublicId: "employee_public_123",
    organizationPublicId: "organization_public_123",
    answerOrganizationSnapshot: {
      organizationPublicIds: ["organization_public_123"],
      capturedAt: "2026-06-16T09:05:00.000Z",
    },
    answerStatus: "submitted",
    expectedRevision: 0,
    operationId: "answer_submit_operation_123",
    payloadDigest: "answer_submit_digest_123",
    answeredQuestionCount: 2,
    answerItems: [
      {
        questionPublicId: "training_question_public_123",
        selectedOptionPublicIds: ["training_question_option_a"],
        textAnswer: null,
      },
      {
        questionPublicId: "training_question_public_456",
        selectedOptionPublicIds: [],
        textAnswer: "written response",
      },
    ],
    scoreSummary: {
      score: 4,
      totalScore: 5,
    },
    questionResults: [],
    totalScore: 5,
    scoringTask: null,
    submittedAt: "2026-06-16T09:05:00.000Z",
    formalWritePolicy: {
      createPractice: false,
      createMockExam: false,
      createFormalAnswerRecord: false,
      createExamReport: false,
      createMistakeBook: false,
    },
    ...overrides,
  };
}

function createTakedownWrite(
  overrides: Partial<OrganizationTrainingVersionTakedownWrite> = {},
): OrganizationTrainingVersionTakedownWrite {
  return {
    versionPublicId: "training_version_public_123",
    organizationPublicId: "organization_public_123",
    status: "taken_down",
    takenDownAt: "2026-06-16T08:00:00.000Z",
    takedownReason: "manual owner takedown",
    accessPolicy: {
      allowNewAnswers: false,
      allowDraftSaves: false,
      allowQuestionDetailReentry: false,
      employeeHistoryVisibility: "own_summary_only",
      preserveHistory: true,
    },
    ...overrides,
  };
}

function createGateway(
  options: {
    latestVersionNumber?: number | null;
    trustedPersistenceLineage?: OrganizationTrainingTrustedPersistenceLineage | null;
    visibleOrganizationScopeSource?: OrganizationTrainingVisibleOrganizationScopeSource | null;
    versionOrganizationPublicId?: string | null;
    employeeAnswerPersistenceLineage?: EmployeeAnswerPersistenceLineage | null;
    employeeVisibleVersionRows?: OrganizationTrainingVersionRow[];
    adminLifecycleVersionRows?: OrganizationTrainingVersionRow[];
    draftPersistenceLineage?: DraftPersistenceLineage | null;
    manualDraftInsertResult?: "row" | "null";
    sourceContextInsertResult?: "rows" | "empty";
    takedownUpdateResult?: "row" | "null";
    paperQuestionSnapshotRows?: PaperQuestionSnapshotRow[];
    publishedVersionRow?: OrganizationTrainingVersionRow | null;
  } = {},
) {
  let insertInputs: OrganizationTrainingVersionInsertInput[] = [];
  let manualDraftInsertInputs: ManualDraftInsertInput[] = [];
  let sourceContextInsertInputs: SourceContextInsertInput[][] = [];
  let takedownInputs: OrganizationTrainingVersionTakedownInput[] = [];
  let employeeAnswerDraftInputs: EmployeeAnswerDraftUpsertInput[] = [];
  let employeeAnswerSubmissionInputs: EmployeeAnswerSubmissionUpsertInput[] =
    [];
  let employeeVisibleVersionListInputs: OrganizationTrainingEmployeeVisibleVersionListInput[] =
    [];
  let versionLookupInputs: OrganizationTrainingVersionLookupInput[] = [];
  let employeeAnswerLookupInputs: OrganizationTrainingEmployeeAnswerLookupInput[] =
    [];
  let paperQuestionSnapshotLookupInputs: PaperQuestionSnapshotLookupInput[] =
    [];
  const findLatestVersionNumberByDraftPublicId = vi.fn(
    async () => options.latestVersionNumber ?? null,
  );
  const findTrustedPersistenceLineageByPublicIds = vi.fn(
    async () => options.trustedPersistenceLineage ?? null,
  );
  const findVisibleOrganizationScopeSourceByAdminPublicId = vi.fn(
    async () => options.visibleOrganizationScopeSource ?? null,
  );
  const findVersionOrganizationPublicIdByVersionPublicId = vi.fn(
    async () => options.versionOrganizationPublicId ?? null,
  );
  const findEmployeeAnswerPersistenceLineageByPublicIds = vi.fn(
    async () => options.employeeAnswerPersistenceLineage ?? null,
  );
  const findDraftPersistenceLineageByPublicIds = vi.fn(
    async (): Promise<DraftPersistenceLineage | null> =>
      options.draftPersistenceLineage ?? null,
  );
  const listPublishedVersionsForEmployeeOrganization = vi.fn(
    async (input: OrganizationTrainingEmployeeVisibleVersionListInput) => {
      employeeVisibleVersionListInputs = [
        ...employeeVisibleVersionListInputs,
        input,
      ];

      return options.employeeVisibleVersionRows ?? [createVersionRow()];
    },
  );
  const listAdminLifecycleVersions = vi.fn(
    async () => options.adminLifecycleVersionRows ?? [createVersionRow()],
  );
  const findPublishedVersionByPublicId = vi.fn(
    async (
      input: OrganizationTrainingVersionLookupInput,
    ): Promise<OrganizationTrainingVersionRow | null> => {
      versionLookupInputs = [...versionLookupInputs, input];

      return (
        options.publishedVersionRow ??
        createVersionRow({
          public_id: input.trainingVersionPublicId,
        })
      );
    },
  );
  const listPaperQuestionSnapshotsForTrainingDrafts = vi.fn(
    async (input: PaperQuestionSnapshotLookupInput) => {
      paperQuestionSnapshotLookupInputs = [
        ...paperQuestionSnapshotLookupInputs,
        input,
      ];

      return options.paperQuestionSnapshotRows ?? [];
    },
  );
  const findEmployeeAnswerByVersionPublicId = vi.fn(
    async (
      input: OrganizationTrainingEmployeeAnswerLookupInput,
    ): Promise<EmployeeAnswerRow | null> => {
      employeeAnswerLookupInputs = [...employeeAnswerLookupInputs, input];

      return createEmployeeAnswerRow({
        organization_training_version_public_id: input.trainingVersionPublicId,
        employee_public_id: input.employeePublicId,
      });
    },
  );
  const insertPublishedVersion = vi.fn(
    async (input: OrganizationTrainingVersionInsertInput) => {
      insertInputs = [...insertInputs, input];

      return {
        id: 901,
        public_id: input.publicId,
        draft_public_id: input.draftPublicId,
        version_number: input.versionNumber,
        organization_id: input.organizationId,
        organization_public_id: input.organizationPublicId,
        org_auth_id: input.orgAuthId,
        authorization_source: input.authorizationSource,
        authorization_public_id: input.authorizationPublicId,
        owner_type: input.ownerType,
        owner_public_id: input.ownerPublicId,
        quota_owner_type: input.quotaOwnerType,
        quota_owner_public_id: input.quotaOwnerPublicId,
        publish_scope_snapshot: input.publishScopeSnapshot,
        profession: input.profession,
        level: input.level,
        subject: input.subject,
        title: input.title,
        description: input.description,
        question_count: input.questionCount,
        total_score: String(input.totalScore),
        question_type_summary: input.questionTypeSummary,
        question_snapshot: input.questionSnapshot,
        version_status: input.status,
        published_at: new Date(input.publishedAt),
        answer_deadline_at:
          input.answerDeadlineAt == null
            ? null
            : new Date(input.answerDeadlineAt),
        taken_down_at:
          input.takenDownAt === null ? null : new Date(input.takenDownAt),
        takedown_reason: input.takedownReason,
        created_at: new Date(input.publishedAt),
        updated_at: new Date(input.publishedAt),
      };
    },
  );
  const insertManualDraft = vi.fn(async (input: ManualDraftInsertInput) => {
    manualDraftInsertInputs = [...manualDraftInsertInputs, input];

    if (options.manualDraftInsertResult === "null") {
      return null;
    }

    return {
      id: 905,
      public_id: input.publicId,
      source_task_public_id: input.sourceTaskPublicId,
      source_version_public_id: input.sourceVersionPublicId,
      organization_id: input.organizationId,
      organization_public_id: input.organizationPublicId,
      org_auth_id: input.orgAuthId,
      authorization_source: input.authorizationSource,
      authorization_public_id: input.authorizationPublicId,
      owner_type: input.ownerType,
      owner_public_id: input.ownerPublicId,
      quota_owner_type: input.quotaOwnerType,
      quota_owner_public_id: input.quotaOwnerPublicId,
      profession: input.profession,
      level: input.level,
      subject: input.subject,
      title: input.title,
      description: input.description,
      question_count: input.questionCount,
      total_score: String(input.totalScore),
      question_type_summary: input.questionTypeSummary,
      evidence_status: input.evidenceStatus,
      validation_status: input.validationStatus,
      retention_status: input.retentionStatus,
      created_at: new Date(input.createdAt),
      updated_at: new Date(input.createdAt),
      expires_at: input.expiresAt === null ? null : new Date(input.expiresAt),
    };
  });
  const updateVersionTakedown = vi.fn(
    async (
      input: OrganizationTrainingVersionTakedownInput,
    ): Promise<OrganizationTrainingVersionRow | null> => {
      takedownInputs = [...takedownInputs, input];

      if (options.takedownUpdateResult === "null") {
        return null;
      }

      return {
        id: 902,
        public_id: input.versionPublicId,
        draft_public_id: "training_draft_public_123",
        version_number: 1,
        organization_id: 501,
        organization_public_id: input.organizationPublicId,
        org_auth_id: 601,
        authorization_source: "org_auth",
        authorization_public_id: "org_auth_public_123",
        owner_type: "organization",
        owner_public_id: input.organizationPublicId,
        quota_owner_type: "organization",
        quota_owner_public_id: input.organizationPublicId,
        publish_scope_snapshot: {
          organizationPublicIds: ["organization_public_123"],
          capturedAt: "2026-06-15T19:20:13.000Z",
        },
        profession: "monopoly",
        level: 3,
        subject: "theory",
        title: "Safety training",
        description: null,
        question_count: 2,
        total_score: "5",
        question_type_summary: {
          singleChoice: 1,
          multiChoice: 0,
          trueFalse: 0,
          shortAnswer: 1,
        },
        question_snapshot: [],
        version_status: input.status,
        published_at: new Date("2026-06-15T19:20:13.000Z"),
        answer_deadline_at: null,
        taken_down_at: new Date(input.takenDownAt),
        takedown_reason: input.takedownReason,
        created_at: new Date("2026-06-15T19:20:13.000Z"),
        updated_at: new Date(input.takenDownAt),
      };
    },
  );
  const insertSourceContexts = vi.fn(
    async (inputs: SourceContextInsertInput[]) => {
      sourceContextInsertInputs = [...sourceContextInsertInputs, inputs];

      if (options.sourceContextInsertResult === "empty") {
        return [];
      }

      return inputs.map((input, index) => ({
        id: 906 + index,
        public_id: input.publicId,
        organization_training_draft_id: input.organizationTrainingDraftId,
        organization_training_draft_public_id: input.draftPublicId,
        organization_id: input.organizationId,
        organization_public_id: input.organizationPublicId,
        org_auth_id: input.orgAuthId,
        authorization_source: input.authorizationSource,
        authorization_public_id: input.authorizationPublicId,
        source_type: input.sourceType,
        source_public_id: input.sourcePublicId,
        title: input.title,
        profession: input.profession,
        level: input.level,
        subject: input.subject,
        question_count: input.questionCount,
        total_score: String(input.totalScore),
        source_status: input.sourceStatus,
        redaction_status: input.redactionStatus,
        formal_usage_policy: input.formalUsagePolicy,
        created_at: new Date("2026-06-16T09:00:00.000Z"),
        updated_at: new Date("2026-06-16T09:00:00.000Z"),
      }));
    },
  );
  const upsertEmployeeAnswerDraft = vi.fn(
    async (input: EmployeeAnswerDraftUpsertInput) => {
      employeeAnswerDraftInputs = [...employeeAnswerDraftInputs, input];

      return {
        id: 903,
        public_id: input.publicId,
        organization_training_version_id: input.organizationTrainingVersionId,
        organization_training_version_public_id: input.trainingVersionPublicId,
        employee_id: input.employeeId,
        employee_public_id: input.employeePublicId,
        organization_id: input.organizationId,
        organization_public_id: input.organizationPublicId,
        organization_training_answer_status: input.answerStatus,
        score: input.score,
        total_score: String(input.totalScore),
        submitted_at: input.submittedAt,
        answer_organization_snapshot: input.answerOrganizationSnapshot,
        answer_item_snapshot: input.answerItemSnapshot,
        question_result_snapshot: input.questionResultSnapshot,
        created_at: new Date(input.savedAt),
        updated_at: new Date(input.savedAt),
      };
    },
  );
  const upsertEmployeeAnswerSubmission = vi.fn(
    async (input: EmployeeAnswerSubmissionUpsertInput) => {
      employeeAnswerSubmissionInputs = [
        ...employeeAnswerSubmissionInputs,
        input,
      ];

      return {
        id: 904,
        public_id: input.publicId,
        organization_training_version_id: input.organizationTrainingVersionId,
        organization_training_version_public_id: input.trainingVersionPublicId,
        employee_id: input.employeeId,
        employee_public_id: input.employeePublicId,
        organization_id: input.organizationId,
        organization_public_id: input.organizationPublicId,
        organization_training_answer_status: input.answerStatus,
        score: String(input.score),
        total_score: String(input.totalScore),
        submitted_at: new Date(input.submittedAt),
        answer_organization_snapshot: input.answerOrganizationSnapshot,
        answer_item_snapshot: input.answerItemSnapshot,
        question_result_snapshot: input.questionResultSnapshot,
        created_at: new Date(input.submittedAt),
        updated_at: new Date(input.submittedAt),
      };
    },
  );
  const gateway: OrganizationTrainingVersionGateway = {
    findLatestVersionNumberByDraftPublicId,
    findTrustedPersistenceLineageByPublicIds,
    findVisibleOrganizationScopeSourceByAdminPublicId,
    findVersionOrganizationPublicIdByVersionPublicId,
    findEmployeeAnswerPersistenceLineageByPublicIds,
    findDraftPersistenceLineageByPublicIds,
    listPublishedVersionsForEmployeeOrganization,
    listAdminLifecycleVersions,
    findPublishedVersionByPublicId,
    listPaperQuestionSnapshotsForTrainingDrafts,
    findEmployeeAnswerByVersionPublicId,
    insertPublishedVersion,
    publishCanonicalDraftTransaction: insertPublishedVersion,
    insertManualDraft,
    insertSourceContexts,
    upsertEmployeeAnswerDraft,
    saveEmployeeAnswerDraftTransaction: upsertEmployeeAnswerDraft,
    upsertEmployeeAnswerSubmission,
    submitEmployeeAnswerTransaction: upsertEmployeeAnswerSubmission,
    updateVersionTakedown,
  } as unknown as OrganizationTrainingVersionGateway;

  return {
    gateway,
    findLatestVersionNumberByDraftPublicId,
    findTrustedPersistenceLineageByPublicIds,
    findVisibleOrganizationScopeSourceByAdminPublicId,
    findVersionOrganizationPublicIdByVersionPublicId,
    findEmployeeAnswerPersistenceLineageByPublicIds,
    findDraftPersistenceLineageByPublicIds,
    listPublishedVersionsForEmployeeOrganization,
    listAdminLifecycleVersions,
    findPublishedVersionByPublicId,
    listPaperQuestionSnapshotsForTrainingDrafts,
    findEmployeeAnswerByVersionPublicId,
    insertPublishedVersion,
    insertManualDraft,
    insertSourceContexts,
    upsertEmployeeAnswerDraft,
    upsertEmployeeAnswerSubmission,
    updateVersionTakedown,
    getInsertInputs: () => insertInputs,
    getManualDraftInsertInputs: () => manualDraftInsertInputs,
    getSourceContextInsertInputs: () => sourceContextInsertInputs,
    getTakedownInputs: () => takedownInputs,
    getEmployeeAnswerDraftInputs: () => employeeAnswerDraftInputs,
    getEmployeeAnswerSubmissionInputs: () => employeeAnswerSubmissionInputs,
    getEmployeeVisibleVersionListInputs: () => employeeVisibleVersionListInputs,
    getVersionLookupInputs: () => versionLookupInputs,
    getEmployeeAnswerLookupInputs: () => employeeAnswerLookupInputs,
    getPaperQuestionSnapshotLookupInputs: () =>
      paperQuestionSnapshotLookupInputs,
  };
}

type EmployeeAnswerRow = Awaited<
  ReturnType<
    OrganizationTrainingVersionGateway["findEmployeeAnswerByVersionPublicId"]
  >
>;

function createVersionRow(
  overrides: Partial<OrganizationTrainingVersionRow> = {},
): OrganizationTrainingVersionRow {
  return {
    id: 901,
    public_id: "training_version_public_123",
    draft_public_id: "training_draft_public_123",
    version_number: 1,
    organization_id: 501,
    organization_public_id: "organization_public_123",
    org_auth_id: 601,
    authorization_source: "org_auth",
    authorization_public_id: "org_auth_public_123",
    owner_type: "organization",
    owner_public_id: "organization_public_123",
    quota_owner_type: "organization",
    quota_owner_public_id: "organization_public_123",
    publish_scope_snapshot: {
      organizationPublicIds: ["organization_public_123"],
      capturedAt: "2026-06-15T19:20:13.000Z",
    },
    profession: "monopoly",
    level: 3,
    subject: "theory",
    title: "Safety training",
    description: null,
    question_count: 2,
    total_score: "5",
    question_type_summary: {
      singleChoice: 1,
      multiChoice: 0,
      trueFalse: 0,
      shortAnswer: 1,
    },
    question_snapshot: [],
    version_status: "published",
    published_at: new Date("2026-06-15T19:20:13.000Z"),
    answer_deadline_at: null,
    taken_down_at: null,
    takedown_reason: null,
    created_at: new Date("2026-06-15T19:20:13.000Z"),
    updated_at: new Date("2026-06-15T19:20:13.000Z"),
    ...overrides,
  };
}

function createEmployeeAnswerRow(
  overrides: Partial<NonNullable<EmployeeAnswerRow>> = {},
): NonNullable<EmployeeAnswerRow> {
  return {
    id: 903,
    public_id: "training_answer_public_123",
    organization_training_version_id: 801,
    organization_training_version_public_id: "training_version_public_123",
    employee_id: 701,
    employee_public_id: "employee_public_123",
    organization_id: 501,
    organization_public_id: "organization_public_123",
    organization_training_answer_status: "submitted",
    score: "4",
    total_score: "5",
    submitted_at: new Date("2026-06-16T09:05:00.000Z"),
    answer_organization_snapshot: {
      organizationPublicId: "organization_public_123",
      organizationName: "Test Organization",
      capturedAt: "2026-06-16T09:05:00.000Z",
    },
    answer_item_snapshot: [],
    question_result_snapshot: [],
    created_at: new Date("2026-06-16T09:00:00.000Z"),
    updated_at: new Date("2026-06-16T09:05:00.000Z"),
    ...overrides,
  };
}

function createPaperQuestionSnapshotRow(
  overrides: Partial<PaperQuestionSnapshotRow> = {},
): PaperQuestionSnapshotRow {
  return {
    trainingDraftPublicId: "training_draft_public_123",
    paperQuestionPublicId: "paper_question_public_123",
    questionSnapshot: {
      questionType: "single_choice",
      stemRichText: "<p>Question stem</p>",
      questionOptions: [
        {
          publicId: "question_option_public_A",
          label: "A",
          contentRichText: "<p>Option A</p>",
        },
        {
          publicId: "question_option_public_B",
          label: "B",
          contentRichText: "<p>Option B</p>",
        },
      ],
      standardAnswerLabels: ["A"],
    },
    materialSnapshot: {
      title: "Training material",
      contentRichText: "<p>Training material body</p>",
    },
    score: "2",
    sortOrder: 1,
    ...overrides,
  };
}

describe("organization training repository", () => {
  it("creates a metadata-only manual draft with trusted organization authorization lineage", async () => {
    const {
      gateway,
      findTrustedPersistenceLineageByPublicIds,
      insertManualDraft,
      getManualDraftInsertInputs,
    } = createGateway({
      trustedPersistenceLineage: {
        organizationId: 501,
        orgAuthId: 601,
      },
    });
    const repository = createOrganizationTrainingRepository(gateway, {
      createDraftPublicId: () => "training_draft_public_999",
    } as Parameters<typeof createOrganizationTrainingRepository>[1] & {
      createDraftPublicId: () => string;
    }) as DraftSourceContextRepositoryContract;

    const result = await repository.createManualDraft(createManualDraftWrite());

    expect(findTrustedPersistenceLineageByPublicIds).toHaveBeenCalledWith({
      organizationPublicId: "organization_public_123",
      authorizationPublicId: "org_auth_public_123",
    });
    expect(insertManualDraft).toHaveBeenCalledWith({
      contentType: "organization_training_draft",
      draftStatus: "draft",
      revision: 1,
      questions: [],
      publicId: "training_draft_public_999",
      sourceTaskPublicId: null,
      sourceVersionPublicId: null,
      organizationId: 501,
      organizationPublicId: "organization_public_123",
      orgAuthId: 601,
      authorizationSource: "org_auth",
      authorizationPublicId: "org_auth_public_123",
      ownerType: "organization",
      ownerPublicId: "organization_public_123",
      quotaOwnerType: "organization",
      quotaOwnerPublicId: "organization_public_123",
      profession: "monopoly",
      level: 3,
      subject: "theory",
      title: "Safety training draft",
      description: null,
      questionCount: 0,
      totalScore: 0,
      questionTypeSummary: {
        singleChoice: 0,
        multiChoice: 0,
        trueFalse: 0,
        shortAnswer: 0,
      },
      evidenceStatus: "none",
      validationStatus: "needs_review",
      retentionStatus: "active",
      createdAt: "2026-06-15T19:20:13.000Z",
      expiresAt: null,
    });
    expect(result).toEqual({
      publicId: "training_draft_public_999",
      draftStatus: "draft",
      revision: 1,
      sourceTaskPublicId: null,
      organizationPublicId: "organization_public_123",
      authorizationSource: "org_auth",
      authorizationPublicId: "org_auth_public_123",
      profession: "monopoly",
      level: 3,
      subject: "theory",
      title: "Safety training draft",
      description: null,
      questionCount: 0,
      totalScore: 0,
      questionTypeSummary: {
        singleChoice: 0,
        multiChoice: 0,
        trueFalse: 0,
        shortAnswer: 0,
      },
      questions: [],
      evidenceStatus: "none",
      validationStatus: "needs_review",
      retentionStatus: "active",
      createdAt: "2026-06-15T19:20:13.000Z",
      expiresAt: null,
    });

    const serializedInsert = JSON.stringify(getManualDraftInsertInputs());

    expect(serializedInsert).not.toContain("formalPaperPublicId");
    expect(serializedInsert).not.toContain("mockExamPublicId");
    expect(serializedInsert).not.toContain("answerRecordPublicId");
    expect(serializedInsert).not.toContain("providerPayload");
    expect(serializedInsert).not.toContain("rawPrompt");
    expect(serializedInsert).not.toContain("rawAnswer");
  });

  it("maps one atomic AI-result copy gateway outcome and rejects incomplete source-context outcomes", async () => {
    const { gateway } = createGateway();
    const draftWrite = createManualDraftWrite({
      sourceTaskPublicId: "admin_ai_generation_task_123",
      evidenceStatus: "sufficient",
    });
    const draftRow = await gateway.insertManualDraft({
      ...draftWrite,
      publicId: "organization_training_draft_ai_copy_123",
      sourceVersionPublicId: null,
      organizationId: 501,
      orgAuthId: 601,
    });
    expect(draftRow).not.toBeNull();
    const sourceContextRows = await gateway.insertSourceContexts([
      {
        publicId: "organization_training_source_context_ai_copy_123",
        organizationTrainingDraftId: draftRow?.id ?? 0,
        draftPublicId: draftRow?.public_id ?? "",
        organizationId: 501,
        organizationPublicId: "organization_public_123",
        orgAuthId: 601,
        authorizationSource: "org_auth",
        authorizationPublicId: "org_auth_public_123",
        sourceType: "organization_ai_result",
        sourcePublicId: "admin_ai_generation_result_123",
        title: "AI training draft",
        profession: "monopoly",
        level: 3,
        subject: "theory",
        questionCount: 1,
        totalScore: 1,
        sourceStatus: "ai_generated_sufficient_evidence",
        redactionStatus: "metadata_only",
        formalUsagePolicy: {
          createFormalPaper: false,
          createMockExam: false,
          exposeQuestionBody: false,
          exposeStandardAnswer: false,
          exposeAnalysis: false,
          exposeProviderPayload: false,
        },
      },
    ]);
    gateway.copyAiResultToTrainingDraftTransaction = vi.fn(async () => ({
      persistenceStatus: "reused" as const,
      draftRow: draftRow!,
      sourceContextRows,
    }));
    const repository = createOrganizationTrainingRepository(gateway);

    await expect(
      repository.copyAiResultToTrainingDraft({
        organizationPublicId: "organization_public_123",
        sourceTaskPublicId: "admin_ai_generation_task_123",
        sourceResultPublicId: "admin_ai_generation_result_123",
        weakEvidenceConfirmed: false,
        copiedAt: "2026-07-21T23:00:00.000Z",
      }),
    ).resolves.toMatchObject({
      persistenceStatus: "reused",
      draft: {
        publicId: "organization_training_draft_ai_copy_123",
        sourceTaskPublicId: "admin_ai_generation_task_123",
      },
      context: {
        sourceContexts: [
          {
            sourceType: "organization_ai_result",
            sourcePublicId: "admin_ai_generation_result_123",
          },
        ],
      },
    });

    gateway.copyAiResultToTrainingDraftTransaction = vi.fn(async () => ({
      persistenceStatus: "created" as const,
      draftRow: draftRow!,
      sourceContextRows: [],
    }));
    await expect(
      createOrganizationTrainingRepository(gateway).copyAiResultToTrainingDraft(
        {
          organizationPublicId: "organization_public_123",
          sourceTaskPublicId: "admin_ai_generation_task_123",
          sourceResultPublicId: "admin_ai_generation_result_123",
          weakEvidenceConfirmed: false,
          copiedAt: "2026-07-21T23:00:00.000Z",
        },
      ),
    ).resolves.toBeNull();
  });

  it("copies a published version snapshot into a fresh draft without mutating the source version", async () => {
    const { gateway, insertManualDraft, getManualDraftInsertInputs } =
      createGateway({
        trustedPersistenceLineage: {
          organizationId: 501,
          orgAuthId: 601,
        },
      });
    const repository = createOrganizationTrainingRepository(gateway, {
      createDraftPublicId: () => "training_draft_copy_public_999",
    } as Parameters<typeof createOrganizationTrainingRepository>[1] & {
      createDraftPublicId: () => string;
    }) as DraftSourceContextRepositoryContract;
    const copyWrite = createCopyVersionToNewDraftWrite();
    const sourceVersionBeforeCopy = structuredClone(copyWrite.sourceVersion);

    const result = await repository.copyVersionToNewDraft(copyWrite);

    expect(insertManualDraft).toHaveBeenCalledWith(
      expect.objectContaining({
        publicId: "training_draft_copy_public_999",
        sourceVersionPublicId: "training_version_public_123",
        organizationId: 501,
        orgAuthId: 601,
        organizationPublicId: "organization_public_123",
        authorizationPublicId: "org_auth_public_123",
        title: "Refreshed training",
        questionCount: 2,
        totalScore: 5,
        questionTypeSummary: {
          singleChoice: 1,
          multiChoice: 0,
          trueFalse: 0,
          shortAnswer: 1,
        },
      }),
    );
    expect(result).toEqual(
      expect.objectContaining({
        publicId: "training_draft_copy_public_999",
        organizationPublicId: "organization_public_123",
        title: "Refreshed training",
        questionCount: 2,
        totalScore: 5,
      }),
    );
    expect(copyWrite.sourceVersion).toEqual(sourceVersionBeforeCopy);
    expect(JSON.stringify(getManualDraftInsertInputs())).not.toContain(
      "createFormalPaper",
    );
  });

  it("attaches source context rows as metadata-only references for an existing draft", async () => {
    const {
      gateway,
      findDraftPersistenceLineageByPublicIds,
      insertSourceContexts,
      getSourceContextInsertInputs,
    } = createGateway({
      draftPersistenceLineage: {
        organizationTrainingDraftId: 801,
        organizationId: 501,
        orgAuthId: 601,
      },
    });
    let sourceContextPublicIdIndex = 0;
    const sourceContextPublicIds = [
      "training_source_context_public_999",
      "training_source_context_public_1000",
    ];
    const repository = createOrganizationTrainingRepository(gateway, {
      createSourceContextPublicId: () =>
        sourceContextPublicIds[sourceContextPublicIdIndex++] ??
        "training_source_context_public_extra",
    } as Parameters<typeof createOrganizationTrainingRepository>[1] & {
      createSourceContextPublicId: () => string;
    }) as DraftSourceContextRepositoryContract;

    const result = await repository.attachSourceContext(
      createSourceContextWrite(),
    );

    expect(findDraftPersistenceLineageByPublicIds).toHaveBeenCalledWith({
      draftPublicId: "training_draft_public_123",
      organizationPublicId: "organization_public_123",
      authorizationPublicId: "org_auth_public_123",
    });
    expect(insertSourceContexts).toHaveBeenCalledWith([
      {
        publicId: "training_source_context_public_999",
        organizationTrainingDraftId: 801,
        draftPublicId: "training_draft_public_123",
        organizationId: 501,
        organizationPublicId: "organization_public_123",
        orgAuthId: 601,
        authorizationSource: "org_auth",
        authorizationPublicId: "org_auth_public_123",
        sourceType: "paper",
        sourcePublicId: "paper_public_123",
        title: "Formal paper reference",
        profession: "monopoly",
        level: 3,
        subject: "theory",
        questionCount: 20,
        totalScore: 100,
        sourceStatus: "published",
        redactionStatus: "metadata_only",
        formalUsagePolicy: {
          createFormalPaper: false,
          createMockExam: false,
          exposeQuestionBody: false,
          exposeStandardAnswer: false,
          exposeAnalysis: false,
          exposeProviderPayload: false,
        },
      },
      {
        publicId: "training_source_context_public_1000",
        organizationTrainingDraftId: 801,
        draftPublicId: "training_draft_public_123",
        organizationId: 501,
        organizationPublicId: "organization_public_123",
        orgAuthId: 601,
        authorizationSource: "org_auth",
        authorizationPublicId: "org_auth_public_123",
        sourceType: "mock_exam",
        sourcePublicId: "mock_exam_public_456",
        title: "Mock exam reference",
        profession: "monopoly",
        level: 3,
        subject: "theory",
        questionCount: 10,
        totalScore: 50,
        sourceStatus: "published",
        redactionStatus: "metadata_only",
        formalUsagePolicy: {
          createFormalPaper: false,
          createMockExam: false,
          exposeQuestionBody: false,
          exposeStandardAnswer: false,
          exposeAnalysis: false,
          exposeProviderPayload: false,
        },
      },
    ]);
    expect(result).toEqual({
      draftPublicId: "training_draft_public_123",
      organizationPublicId: "organization_public_123",
      sourceContexts: [
        {
          sourceType: "paper",
          sourcePublicId: "paper_public_123",
          title: "Formal paper reference",
          profession: "monopoly",
          level: 3,
          subject: "theory",
          questionCount: 20,
          totalScore: 100,
          sourceStatus: "published",
          redactionStatus: "metadata_only",
        },
        {
          sourceType: "mock_exam",
          sourcePublicId: "mock_exam_public_456",
          title: "Mock exam reference",
          profession: "monopoly",
          level: 3,
          subject: "theory",
          questionCount: 10,
          totalScore: 50,
          sourceStatus: "published",
          redactionStatus: "metadata_only",
        },
      ],
      redactionStatus: "metadata_only",
    });

    const serializedInsert = JSON.stringify(getSourceContextInsertInputs());

    expect(serializedInsert).not.toContain("standardAnswer");
    expect(serializedInsert).not.toContain("analysis");
    expect(serializedInsert).not.toContain("providerPayload");
    expect(serializedInsert).not.toContain("fullQuestionBody");
  });

  it("creates a published version with next version number and internal lineage storage", async () => {
    const {
      gateway,
      findLatestVersionNumberByDraftPublicId,
      insertPublishedVersion,
    } = createGateway({ latestVersionNumber: 2 });
    const repository = createOrganizationTrainingRepository(gateway, {
      createVersionPublicId: () => "training_version_public_999",
    });

    const result = await repository.publishVersion({
      ...createVersionWrite(),
      organizationId: 501,
      orgAuthId: 601,
    });

    expect(findLatestVersionNumberByDraftPublicId).not.toHaveBeenCalled();
    expect(insertPublishedVersion).toHaveBeenCalledWith(
      expect.objectContaining({
        publicId: "training_version_public_999",
        draftPublicId: "training_draft_public_123",
        versionNumber: 1,
        organizationId: 501,
        orgAuthId: 601,
        authorizationSource: "org_auth",
        authorizationPublicId: "org_auth_public_123",
        ownerType: "organization",
        ownerPublicId: "organization_public_123",
        quotaOwnerType: "organization",
        quotaOwnerPublicId: "organization_public_123",
      }),
    );
    expect(result).toMatchObject({
      publicId: "training_version_public_999",
      draftPublicId: "training_draft_public_123",
      versionNumber: 1,
      organizationPublicId: "organization_public_123",
      status: "published",
    });
    expect("authorizationSource" in result).toBe(false);
    expect("authorizationPublicId" in result).toBe(false);
    expect("organizationId" in result).toBe(false);
    expect("orgAuthId" in result).toBe(false);
  });

  it("persists and maps nullable answer deadline for published versions", async () => {
    const { gateway, insertPublishedVersion } = createGateway();
    const repository = createOrganizationTrainingRepository(gateway, {
      createVersionPublicId: () => "training_version_public_deadline",
    });
    const answerDeadlineAt = "2026-06-20T12:00:00.000Z";

    const result = await repository.publishVersion({
      ...createVersionWrite({
        answerDeadlineAt,
      } as Partial<OrganizationTrainingPublishedVersionWrite>),
      organizationId: 501,
      orgAuthId: 601,
    });

    expect(insertPublishedVersion).toHaveBeenCalledWith(
      expect.objectContaining({
        answerDeadlineAt,
      }),
    );
    expect(result).toMatchObject({
      publicId: "training_version_public_deadline",
      answerDeadlineAt,
    });
  });

  it("assigns version number one when the draft has no previous published version", async () => {
    const { gateway } = createGateway({ latestVersionNumber: null });
    const repository = createOrganizationTrainingRepository(gateway, {
      createVersionPublicId: () => "training_version_public_first",
    });

    const result = await repository.publishVersion({
      ...createVersionWrite(),
      organizationId: 501,
      orgAuthId: 601,
    });

    expect(result.versionNumber).toBe(1);
  });

  it("preserves publish scope snapshots and lifecycle takedown metadata", async () => {
    const { gateway, getInsertInputs } = createGateway();
    const repository = createOrganizationTrainingRepository(gateway, {
      createVersionPublicId: () => "training_version_public_taken_down",
    });
    const versionWrite = createVersionWrite({
      status: "taken_down",
      takenDownAt: "2026-06-16T08:00:00.000Z",
      takedownReason: "manual owner takedown",
    });

    const result = await repository.publishVersion({
      ...versionWrite,
      organizationId: 501,
      orgAuthId: 601,
    });

    versionWrite.publishScopeSnapshot.organizationPublicIds.push(
      "organization_other_public_999",
    );

    expect(getInsertInputs()[0]?.publishScopeSnapshot).toEqual({
      organizationPublicIds: [
        "organization_public_123",
        "organization_branch_public_456",
      ],
      capturedAt: "2026-06-15T19:20:13.000Z",
    });
    expect(result).toMatchObject({
      status: "taken_down",
      takenDownAt: "2026-06-16T08:00:00.000Z",
      takedownReason: "manual owner takedown",
    });
    expect(result.publishScopeSnapshot.organizationPublicIds).not.toContain(
      "organization_other_public_999",
    );
  });

  it("keeps insert values away from formal targets and provider raw fields", async () => {
    const { gateway, getInsertInputs } = createGateway();
    const repository = createOrganizationTrainingRepository(gateway, {
      createVersionPublicId: () => "training_version_public_clean",
    });

    await repository.publishVersion({
      ...createVersionWrite(),
      organizationId: 501,
      orgAuthId: 601,
    });

    const serializedInsert = JSON.stringify(getInsertInputs());

    expect(serializedInsert).toContain("organization_training_version");
    expect(serializedInsert).not.toContain("formalQuestionPublicId");
    expect(serializedInsert).not.toContain("formalPaperPublicId");
    expect(serializedInsert).not.toContain("practicePublicId");
    expect(serializedInsert).not.toContain("mockExamPublicId");
    expect(serializedInsert).not.toContain("answerRecordPublicId");
    expect(serializedInsert).not.toContain("examReportPublicId");
    expect(serializedInsert).not.toContain("mistakeBookPublicId");
    expect(serializedInsert).not.toContain("providerPayload");
    expect(serializedInsert).not.toContain("rawPrompt");
    expect(serializedInsert).not.toContain("rawAnswer");
    expect(serializedInsert).not.toContain("employeeAnswer");
  });

  it("looks up trusted internal lineage from public organization and authorization identifiers", async () => {
    const { gateway, findTrustedPersistenceLineageByPublicIds } = createGateway(
      {
        trustedPersistenceLineage: {
          organizationId: 501,
          orgAuthId: 601,
        },
      },
    );
    const repository = createOrganizationTrainingRepository(gateway);

    const result = await repository.lookupTrustedPersistenceLineage({
      organizationPublicId: "organization_public_123",
      authorizationPublicId: "org_auth_public_123",
    });

    expect(findTrustedPersistenceLineageByPublicIds).toHaveBeenCalledWith({
      organizationPublicId: "organization_public_123",
      authorizationPublicId: "org_auth_public_123",
    });
    expect(result).toEqual({
      organizationId: 501,
      orgAuthId: 601,
    });
  });

  it("does not query trusted lineage when public identifiers are blank", async () => {
    const { gateway, findTrustedPersistenceLineageByPublicIds } = createGateway(
      {
        trustedPersistenceLineage: {
          organizationId: 501,
          orgAuthId: 601,
        },
      },
    );
    const repository = createOrganizationTrainingRepository(gateway);

    const result = await repository.lookupTrustedPersistenceLineage({
      organizationPublicId: " ",
      authorizationPublicId: "org_auth_public_123",
    });

    expect(result).toBeNull();
    expect(findTrustedPersistenceLineageByPublicIds).not.toHaveBeenCalled();
  });

  it("looks up a version organization public id from a trimmed version public id", async () => {
    const { gateway, findVersionOrganizationPublicIdByVersionPublicId } =
      createGateway({
        versionOrganizationPublicId: "organization_public_123",
      });
    const repository = createOrganizationTrainingRepository(gateway);

    const result = await repository.lookupVersionOrganizationPublicId({
      versionPublicId: " training_version_public_123 ",
    });

    expect(
      findVersionOrganizationPublicIdByVersionPublicId,
    ).toHaveBeenCalledWith("training_version_public_123");
    expect(result).toBe("organization_public_123");
  });

  it("does not query version organization when the version public id is blank", async () => {
    const { gateway, findVersionOrganizationPublicIdByVersionPublicId } =
      createGateway({
        versionOrganizationPublicId: "organization_public_123",
      });
    const repository = createOrganizationTrainingRepository(gateway);

    const result = await repository.lookupVersionOrganizationPublicId({
      versionPublicId: " ",
    });

    expect(result).toBeNull();
    expect(
      findVersionOrganizationPublicIdByVersionPublicId,
    ).not.toHaveBeenCalled();
  });

  it("takes down a version with lifecycle metadata without persisting runtime access policy", async () => {
    const { gateway, updateVersionTakedown, getTakedownInputs } =
      createGateway();
    const repository = createOrganizationTrainingRepository(gateway);

    const result = await repository.takeDownVersion(createTakedownWrite());

    expect(updateVersionTakedown).toHaveBeenCalledWith({
      versionPublicId: "training_version_public_123",
      organizationPublicId: "organization_public_123",
      status: "taken_down",
      takenDownAt: "2026-06-16T08:00:00.000Z",
      takedownReason: "manual owner takedown",
    });
    expect(result).toMatchObject({
      publicId: "training_version_public_123",
      organizationPublicId: "organization_public_123",
      status: "taken_down",
      takenDownAt: "2026-06-16T08:00:00.000Z",
      takedownReason: "manual owner takedown",
    });
    expect(JSON.stringify(getTakedownInputs())).not.toContain(
      "allowNewAnswers",
    );
  });

  it("fails closed when takedown persistence cannot update a matching version", async () => {
    const { gateway } = createGateway({ takedownUpdateResult: "null" });
    const repository = createOrganizationTrainingRepository(gateway);

    await expect(
      repository.takeDownVersion(createTakedownWrite()),
    ).rejects.toThrow("organization training version takedown failed.");
  });

  it("fails a stale draft lineage before answer locking or mutation when membership was replaced", async () => {
    const fixture = createRevokedMembershipPersistenceDatabase();
    const repository = createPostgresOrganizationTrainingRepository({
      createDatabase: () => fixture.database as never,
    });

    await expect(
      repository.saveEmployeeAnswerDraft(createEmployeeAnswerDraftWrite()),
    ).rejects.toMatchObject({ kind: "answer_draft_conflict" });
    expect(fixture.events).toEqual([
      "lineage_lookup",
      "employee_identity_lock",
      "membership_recheck",
    ]);
    expect(fixture.mutations).toEqual([]);
  });

  it("fails a stale submission lineage before answer locking or mutation when membership was replaced", async () => {
    const fixture = createRevokedMembershipPersistenceDatabase();
    const repository = createPostgresOrganizationTrainingRepository({
      createDatabase: () => fixture.database as never,
    });

    await expect(
      repository.submitEmployeeAnswer(createEmployeeAnswerSubmissionWrite()),
    ).rejects.toMatchObject({ kind: "answer_submit_conflict" });
    expect(fixture.events).toEqual([
      "lineage_lookup",
      "employee_identity_lock",
      "membership_recheck",
    ]);
    expect(fixture.mutations).toEqual([]);
  });

  it("saves employee answer draft as metadata-only repository state", async () => {
    const {
      gateway,
      findEmployeeAnswerPersistenceLineageByPublicIds,
      upsertEmployeeAnswerDraft,
      getEmployeeAnswerDraftInputs,
    } = createGateway({
      employeeAnswerPersistenceLineage: {
        organizationTrainingVersionId: 801,
        employeeId: 701,
        employeeOrgAuthId: 601,
        organizationId: 501,
        organizationName: "Test Organization",
        totalScore: 5,
        questionSnapshot: [],
      },
    });
    const repository = createOrganizationTrainingRepository(gateway, {
      createAnswerPublicId: () => "training_answer_public_999",
    } as Parameters<typeof createOrganizationTrainingRepository>[1] & {
      createAnswerPublicId: () => string;
    }) as EmployeeAnswerRepositoryContract;

    const result = await repository.saveEmployeeAnswerDraft(
      createEmployeeAnswerDraftWrite(),
    );

    expect(
      findEmployeeAnswerPersistenceLineageByPublicIds,
    ).toHaveBeenCalledWith({
      trainingVersionPublicId: "training_version_public_123",
      employeePublicId: "employee_public_123",
      organizationPublicId: "organization_public_123",
    });
    expect(upsertEmployeeAnswerDraft).toHaveBeenCalledWith({
      publicId: "training_answer_public_999",
      organizationTrainingVersionId: 801,
      trainingVersionPublicId: "training_version_public_123",
      employeeId: 701,
      employeePublicId: "employee_public_123",
      employeeOrgAuthId: 601,
      expectedRevision: 0,
      operationId: "answer_draft_operation_123",
      payloadDigest: "answer_draft_digest_123",
      organizationId: 501,
      organizationPublicId: "organization_public_123",
      answerOrganizationSnapshot: {
        organizationPublicId: "organization_public_123",
        organizationName: "Test Organization",
        capturedAt: "2026-06-16T09:00:00.000Z",
      },
      answerStatus: "in_progress",
      score: null,
      totalScore: 5,
      answerItemSnapshot: [
        {
          questionPublicId: "training_question_public_123",
          selectedOptionPublicIds: ["training_question_option_a"],
          textAnswer: null,
        },
      ],
      questionResultSnapshot: [],
      submittedAt: null,
      savedAt: "2026-06-16T09:00:00.000Z",
    });
    expect(result).toEqual({
      publicId: "training_answer_public_999",
      revision: 1,
      trainingVersionPublicId: "training_version_public_123",
      employeePublicId: "employee_public_123",
      organizationPublicId: "organization_public_123",
      answerOrganizationSnapshot: {
        organizationPublicIds: ["organization_public_123"],
        capturedAt: "2026-06-16T09:00:00.000Z",
      },
      answerStatus: "in_progress",
      scoreSummary: null,
      submittedAt: null,
      resultSummaryVisible: false,
      answerItems: [
        {
          questionPublicId: "training_question_public_123",
          selectedOptionPublicIds: ["training_question_option_a"],
          textAnswer: null,
        },
      ],
      questionResults: [],
    });

    const serializedDraftInput = JSON.stringify(getEmployeeAnswerDraftInputs());

    expect(serializedDraftInput).not.toContain("answeredQuestionCount");
    expect(serializedDraftInput).not.toContain("formalWritePolicy");
    expect(serializedDraftInput).not.toContain("answerRecordPublicId");
    expect(serializedDraftInput).not.toContain("practicePublicId");
    expect(serializedDraftInput).not.toContain("mockExamPublicId");
    expect(serializedDraftInput).not.toContain("providerPayload");
    expect(serializedDraftInput).not.toContain("rawPrompt");
    expect(serializedDraftInput).not.toContain("rawAnswer");
  });

  it("submits employee answer metadata with score summary only", async () => {
    const {
      gateway,
      findEmployeeAnswerPersistenceLineageByPublicIds,
      upsertEmployeeAnswerSubmission,
      getEmployeeAnswerSubmissionInputs,
    } = createGateway({
      employeeAnswerPersistenceLineage: {
        organizationTrainingVersionId: 801,
        employeeId: 701,
        employeeOrgAuthId: 601,
        organizationId: 501,
        organizationName: "Test Organization",
        totalScore: 5,
        questionSnapshot: createVersionWrite().questionSnapshot,
      },
    });
    const repository = createOrganizationTrainingRepository(gateway, {
      createAnswerPublicId: () => "training_answer_public_999",
    } as Parameters<typeof createOrganizationTrainingRepository>[1] & {
      createAnswerPublicId: () => string;
    }) as EmployeeAnswerRepositoryContract;

    const result = await repository.submitEmployeeAnswer(
      createEmployeeAnswerSubmissionWrite(),
    );

    expect(
      findEmployeeAnswerPersistenceLineageByPublicIds,
    ).toHaveBeenCalledWith({
      trainingVersionPublicId: "training_version_public_123",
      employeePublicId: "employee_public_123",
      organizationPublicId: "organization_public_123",
    });
    expect(upsertEmployeeAnswerSubmission).toHaveBeenCalledWith({
      publicId: "training_answer_public_999",
      organizationTrainingVersionId: 801,
      trainingVersionPublicId: "training_version_public_123",
      employeeId: 701,
      employeePublicId: "employee_public_123",
      employeeOrgAuthId: 601,
      expectedRevision: 0,
      operationId: "answer_submit_operation_123",
      payloadDigest: "answer_submit_digest_123",
      organizationId: 501,
      organizationPublicId: "organization_public_123",
      answerOrganizationSnapshot: {
        organizationPublicId: "organization_public_123",
        organizationName: "Test Organization",
        capturedAt: "2026-06-16T09:05:00.000Z",
      },
      answerStatus: "submitted",
      score: 4,
      totalScore: 5,
      answerItemSnapshot: [
        {
          questionPublicId: "training_question_public_123",
          selectedOptionPublicIds: ["training_question_option_a"],
          textAnswer: null,
        },
        {
          questionPublicId: "training_question_public_456",
          selectedOptionPublicIds: [],
          textAnswer: "written response",
        },
      ],
      questionResultSnapshot: [],
      scoringTask: null,
      submittedAt: "2026-06-16T09:05:00.000Z",
    });
    expect(result).toEqual({
      publicId: "training_answer_public_999",
      revision: 1,
      trainingVersionPublicId: "training_version_public_123",
      employeePublicId: "employee_public_123",
      organizationPublicId: "organization_public_123",
      answerOrganizationSnapshot: {
        organizationPublicIds: ["organization_public_123"],
        capturedAt: "2026-06-16T09:05:00.000Z",
      },
      answerStatus: "submitted",
      scoreSummary: {
        score: 4,
        totalScore: 5,
      },
      submittedAt: "2026-06-16T09:05:00.000Z",
      resultSummaryVisible: true,
      answerItems: [
        {
          questionPublicId: "training_question_public_123",
          selectedOptionPublicIds: ["training_question_option_a"],
          textAnswer: null,
        },
        {
          questionPublicId: "training_question_public_456",
          selectedOptionPublicIds: [],
          textAnswer: "written response",
        },
      ],
      questionResults: [],
    });

    const serializedSubmissionInput = JSON.stringify(
      getEmployeeAnswerSubmissionInputs(),
    );

    expect(serializedSubmissionInput).not.toContain("answeredQuestionCount");
    expect(serializedSubmissionInput).not.toContain("formalWritePolicy");
    expect(serializedSubmissionInput).not.toContain("answerRecordPublicId");
    expect(serializedSubmissionInput).not.toContain("practicePublicId");
    expect(serializedSubmissionInput).not.toContain("mockExamPublicId");
    expect(serializedSubmissionInput).not.toContain("providerPayload");
    expect(serializedSubmissionInput).not.toContain("rawPrompt");
    expect(serializedSubmissionInput).not.toContain("rawAnswer");
  });

  it("lists employee visible versions and finds readonly answer summaries by public identifiers", async () => {
    const {
      gateway,
      listPublishedVersionsForEmployeeOrganization,
      findPublishedVersionByPublicId,
      findEmployeeAnswerByVersionPublicId,
      getEmployeeVisibleVersionListInputs,
      getVersionLookupInputs,
      getEmployeeAnswerLookupInputs,
    } = createGateway();
    const repository = createOrganizationTrainingRepository(gateway);

    const versions = await repository.listEmployeeVisibleVersions({
      employeePublicId: " employee_public_123 ",
      organizationPublicId: " organization_public_123 ",
    });
    const version = await repository.findPublishedVersionByPublicId({
      trainingVersionPublicId: " training_version_public_123 ",
    });
    const answer = await repository.findEmployeeAnswerByVersion({
      trainingVersionPublicId: " training_version_public_123 ",
      employeePublicId: " employee_public_123 ",
    });

    expect(listPublishedVersionsForEmployeeOrganization).toHaveBeenCalledWith({
      employeePublicId: "employee_public_123",
      organizationPublicId: "organization_public_123",
      visibleOrganizationPublicIds: ["organization_public_123"],
    });
    expect(findPublishedVersionByPublicId).toHaveBeenCalledWith({
      trainingVersionPublicId: "training_version_public_123",
    });
    expect(findEmployeeAnswerByVersionPublicId).toHaveBeenCalledWith({
      trainingVersionPublicId: "training_version_public_123",
      employeePublicId: "employee_public_123",
    });
    expect(getEmployeeVisibleVersionListInputs()).toEqual([
      {
        employeePublicId: "employee_public_123",
        organizationPublicId: "organization_public_123",
        visibleOrganizationPublicIds: ["organization_public_123"],
      },
    ]);
    expect(getVersionLookupInputs()).toEqual([
      {
        trainingVersionPublicId: "training_version_public_123",
      },
    ]);
    expect(getEmployeeAnswerLookupInputs()).toEqual([
      {
        trainingVersionPublicId: "training_version_public_123",
        employeePublicId: "employee_public_123",
      },
    ]);
    expect(versions).toEqual([
      expect.objectContaining({
        publicId: "training_version_public_123",
        status: "published",
      }),
    ]);
    expect(version).toEqual(
      expect.objectContaining({
        publicId: "training_version_public_123",
      }),
    );
    expect(answer).toEqual({
      publicId: "training_answer_public_123",
      revision: 1,
      trainingVersionPublicId: "training_version_public_123",
      employeePublicId: "employee_public_123",
      organizationPublicId: "organization_public_123",
      answerOrganizationSnapshot: {
        organizationPublicIds: ["organization_public_123"],
        capturedAt: "2026-06-16T09:05:00.000Z",
      },
      answerStatus: "submitted",
      scoreSummary: {
        score: 4,
        totalScore: 5,
      },
      submittedAt: "2026-06-16T09:05:00.000Z",
      resultSummaryVisible: true,
      answerItems: [],
      questionResults: [],
    });
  });

  it("composes each visible version with only the requested employee answer lifecycle", async () => {
    const inProgressVersionRow = {
      ...createVersionRow({
        public_id: "training_version_public_in_progress",
      }),
      organization_name: "Test Organization",
      employee_answer_status: "in_progress",
      employee_answer_score: "4",
      employee_answer_total_score: "5",
    } as unknown as OrganizationTrainingVersionRow;
    const notStartedVersionRow = {
      ...createVersionRow({
        public_id: "training_version_public_not_started",
      }),
      organization_name: "Test Organization",
      employee_answer_status: null,
      employee_answer_score: null,
      employee_answer_total_score: null,
    } as unknown as OrganizationTrainingVersionRow;
    const submittedVersionRow = {
      ...createVersionRow({
        public_id: "training_version_public_submitted",
      }),
      organization_name: "Test Organization",
      employee_answer_status: "submitted",
      employee_answer_score: "4",
      employee_answer_total_score: "5",
    } as unknown as OrganizationTrainingVersionRow;
    const scoringVersionRow = {
      ...createVersionRow({
        public_id: "training_version_public_scoring",
      }),
      organization_name: "Test Organization",
      employee_answer_status: "scoring",
      employee_answer_score: "4",
      employee_answer_total_score: "5",
    } as unknown as OrganizationTrainingVersionRow;
    const { gateway } = createGateway({
      employeeVisibleVersionRows: [
        inProgressVersionRow,
        notStartedVersionRow,
        submittedVersionRow,
        scoringVersionRow,
      ],
    });
    const repository = createOrganizationTrainingRepository(gateway);

    const versions = await repository.listEmployeeVisibleVersions({
      employeePublicId: "employee_public_123",
      organizationPublicId: "organization_public_123",
    });

    expect(versions).toEqual([
      expect.objectContaining({
        publicId: "training_version_public_in_progress",
        organizationName: "Test Organization",
        employeeAnswerStatus: "in_progress",
        submittedScoreSummary: null,
      }),
      expect.objectContaining({
        publicId: "training_version_public_not_started",
        organizationName: "Test Organization",
        employeeAnswerStatus: "not_started",
        submittedScoreSummary: null,
      }),
      expect.objectContaining({
        publicId: "training_version_public_submitted",
        organizationName: "Test Organization",
        employeeAnswerStatus: "submitted",
        submittedScoreSummary: { score: 4, totalScore: 5 },
      }),
      expect.objectContaining({
        publicId: "training_version_public_scoring",
        organizationName: "Test Organization",
        employeeAnswerStatus: "scoring",
        submittedScoreSummary: null,
      }),
    ]);
    expect(JSON.stringify(versions)).not.toContain("answerItemSnapshot");
    expect(JSON.stringify(versions)).not.toContain("answer_item_snapshot");
  });

  it("isolates incomplete historical versions from admin and employee list reads without inferring scope", async () => {
    const validVersion = createVersionRow({
      public_id: "training_version_public_valid",
    });
    const missingScopeVersion = {
      ...createVersionRow({
        public_id: "training_version_public_missing_scope",
      }),
      publish_scope_snapshot: null,
    } as unknown as OrganizationTrainingVersionRow;
    const missingPublishedAtVersion = {
      ...createVersionRow({
        public_id: "training_version_public_missing_published_at",
      }),
      published_at: null,
    } as unknown as OrganizationTrainingVersionRow;
    const { gateway } = createGateway({
      adminLifecycleVersionRows: [
        validVersion,
        missingScopeVersion,
        missingPublishedAtVersion,
      ],
      employeeVisibleVersionRows: [
        validVersion,
        missingScopeVersion,
        missingPublishedAtVersion,
      ],
    });
    const repository = createOrganizationTrainingRepository(gateway);

    const adminResult = await repository.listAdminLifecycleVersions({
      visibleOrganizationPublicIds: ["organization_public_123"],
    });
    const employeeResult = await repository.listEmployeeVisibleVersions({
      employeePublicId: "employee_public_123",
      organizationPublicId: "organization_public_123",
    });
    const adminReadResult = await repository.readAdminLifecycleVersions({
      visibleOrganizationPublicIds: ["organization_public_123"],
    });
    const employeeReadResult = await repository.readEmployeeVisibleVersions({
      employeePublicId: "employee_public_123",
      organizationPublicId: "organization_public_123",
    });

    expect(adminResult).toEqual([
      expect.objectContaining({ publicId: "training_version_public_valid" }),
    ]);
    expect(employeeResult).toEqual([
      expect.objectContaining({ publicId: "training_version_public_valid" }),
    ]);
    expect(adminReadResult).toEqual({
      versions: [
        expect.objectContaining({ publicId: "training_version_public_valid" }),
      ],
      integrityStatus: "partial",
      warningCode: "historical_version_unavailable",
    });
    expect(employeeReadResult).toEqual({
      versions: [
        expect.objectContaining({ publicId: "training_version_public_valid" }),
      ],
      integrityStatus: "partial",
      warningCode: "historical_version_unavailable",
    });
    expect(JSON.stringify({ adminResult, employeeResult })).not.toContain(
      "missing_scope",
    );
    expect(JSON.stringify({ adminResult, employeeResult })).not.toContain(
      "missing_published_at",
    );
  });

  it("attaches paper-source question snapshots to employee visible versions by draft public id", async () => {
    const {
      gateway,
      listPaperQuestionSnapshotsForTrainingDrafts,
      getPaperQuestionSnapshotLookupInputs,
    } = createGateway({
      paperQuestionSnapshotRows: [createPaperQuestionSnapshotRow()],
    });
    const repository = createOrganizationTrainingRepository(gateway);

    const versions = await repository.listEmployeeVisibleVersions({
      employeePublicId: "employee_public_123",
      organizationPublicId: "organization_public_123",
    });
    const version = await repository.findPublishedVersionByPublicId({
      trainingVersionPublicId: "training_version_public_123",
    });

    const expectedQuestions = [
      {
        publicId: "paper_question_public_123",
        sequenceNumber: 1,
        questionType: "single_choice",
        materialTitle: "Training material",
        materialContent: "<p>Training material body</p>",
        stem: "<p>Question stem</p>",
        options: [
          {
            publicId: "question_option_public_A",
            label: "A",
            content: "<p>Option A</p>",
          },
          {
            publicId: "question_option_public_B",
            label: "B",
            content: "<p>Option B</p>",
          },
        ],
        score: 2,
      },
    ];

    expect(versions[0]?.questions).toEqual(expectedQuestions);
    expect(version?.questions).toEqual(expectedQuestions);
    expect(listPaperQuestionSnapshotsForTrainingDrafts).toHaveBeenCalledTimes(
      2,
    );
    expect(getPaperQuestionSnapshotLookupInputs()).toEqual([
      { draftPublicIds: ["training_draft_public_123"] },
      { draftPublicIds: ["training_draft_public_123"] },
    ]);
    expect(JSON.stringify(versions)).not.toContain('"id"');
    expect(JSON.stringify(version)).not.toContain('"id"');
  });

  it("returns admin-safe published version detail without changing employee-visible version redaction", async () => {
    const questionSnapshot = createVersionWrite().questionSnapshot;
    const { gateway } = createGateway({
      publishedVersionRow: createVersionRow({
        question_snapshot: questionSnapshot,
      }),
    });
    const repository = createOrganizationTrainingRepository(gateway);

    const employeeVersion = await repository.findPublishedVersionByPublicId({
      trainingVersionPublicId: "training_version_public_123",
    });
    const adminDetail =
      await repository.findAdminPublishedVersionDetailByPublicId({
        trainingVersionPublicId: "training_version_public_123",
      });

    expect(employeeVersion?.questions?.[0]).toEqual({
      publicId: "training_question_public_123",
      sequenceNumber: 1,
      questionType: "single_choice",
      materialTitle: "Safety material",
      materialContent: "Safety material body",
      stem: "Which option is compliant?",
      options: [
        {
          publicId: "training_question_option_a",
          label: "A",
          content: "compliant option",
        },
        {
          publicId: "training_question_option_b",
          label: "B",
          content: "distractor option",
        },
      ],
      score: 2,
    });
    expect(adminDetail?.questions[0]).toEqual({
      publicId: "training_question_public_123",
      sequenceNumber: 1,
      questionType: "single_choice",
      materialTitle: "Safety material",
      materialContent: "Safety material body",
      stem: "Which option is compliant?",
      options: [
        {
          publicId: "training_question_option_a",
          label: "A",
          content: "compliant option",
        },
        {
          publicId: "training_question_option_b",
          label: "B",
          content: "distractor option",
        },
      ],
      score: 2,
      evidenceSummary: {
        evidenceStatus: "sufficient",
        citationCount: 1,
      },
      answerAndAnalysis: {
        visibility: "collapsed_by_default",
        standardAnswer: "A",
        analysis: "choice rationale",
      },
    });
    expect(JSON.stringify(employeeVersion)).not.toContain("standardAnswer");
    expect(JSON.stringify(employeeVersion)).not.toContain("analysisSummary");
    expect(JSON.stringify(adminDetail)).not.toMatch(/"id":|"orgAuthId":/u);
  });

  it("rebuilds AI paper sections from structured version snapshots while leaving legacy flat snapshots ungrouped", async () => {
    const structuredQuestionSnapshot =
      createVersionWrite().questionSnapshot.map((question, index) => ({
        ...question,
        paperSectionKey:
          question.questionType === "short_answer"
            ? "short_answer"
            : "single_choice",
        paperSectionTitle:
          question.questionType === "short_answer"
            ? "简答题部分"
            : "单选题部分",
        paperSectionSortOrder: index + 1,
        questionSortOrder: 1,
      }));
    const { gateway: structuredGateway } = createGateway({
      publishedVersionRow: createVersionRow({
        question_snapshot: structuredQuestionSnapshot,
      }),
    });
    const { gateway: legacyGateway } = createGateway({
      publishedVersionRow: createVersionRow({
        question_snapshot: createVersionWrite().questionSnapshot,
      }),
    });
    const { gateway: malformedGateway } = createGateway({
      publishedVersionRow: createVersionRow({
        question_snapshot: structuredQuestionSnapshot.map((question, index) =>
          index === 1
            ? { ...question, questionSortOrder: undefined }
            : question,
        ),
      }),
    });

    const structuredDetail = await createOrganizationTrainingRepository(
      structuredGateway,
    ).findAdminPublishedVersionDetailByPublicId({
      trainingVersionPublicId: "training_version_public_123",
    });
    const legacyDetail = await createOrganizationTrainingRepository(
      legacyGateway,
    ).findAdminPublishedVersionDetailByPublicId({
      trainingVersionPublicId: "training_version_public_123",
    });
    const malformedDetail = await createOrganizationTrainingRepository(
      malformedGateway,
    ).findAdminPublishedVersionDetailByPublicId({
      trainingVersionPublicId: "training_version_public_123",
    });

    expect(structuredDetail?.paperSections).toEqual([
      expect.objectContaining({
        sectionKey: "single_choice",
        title: "单选题部分",
        questionType: "single_choice",
        targetQuestionCount: 1,
        selectedQuestionCount: 1,
        totalScore: 2,
        questions: [
          expect.objectContaining({ publicId: "training_question_public_123" }),
        ],
      }),
      expect.objectContaining({
        sectionKey: "short_answer",
        title: "简答题部分",
        questionType: "short_answer",
        targetQuestionCount: 1,
        selectedQuestionCount: 1,
        totalScore: 3,
        questions: [
          expect.objectContaining({ publicId: "training_question_public_456" }),
        ],
      }),
    ]);
    expect(legacyDetail?.paperSections).toBeUndefined();
    expect(malformedDetail?.questions).toHaveLength(2);
    expect(malformedDetail?.paperSections).toBeUndefined();
  });

  it("lists server-only employee visible question snapshots for AI paper source", async () => {
    const questionSnapshot = createVersionWrite().questionSnapshot;
    const {
      gateway,
      listPublishedVersionsForEmployeeOrganization,
      getEmployeeVisibleVersionListInputs,
    } = createGateway({
      employeeVisibleVersionRows: [
        createVersionRow({
          question_snapshot: questionSnapshot,
        }),
        createVersionRow({
          public_id: "training_version_taken_down",
          question_snapshot: [
            {
              ...questionSnapshot[0],
              publicId: "training_question_public_taken_down",
            },
          ],
          taken_down_at: new Date("2026-06-16T08:00:00.000Z"),
        }),
        {
          ...createVersionRow({
            public_id: "training_version_incomplete",
            question_snapshot: [
              {
                ...questionSnapshot[0],
                publicId: "training_question_public_incomplete",
              },
            ],
          }),
          publish_scope_snapshot: null,
        } as unknown as OrganizationTrainingVersionRow,
      ],
    });
    const repository = createOrganizationTrainingRepository(gateway);

    const snapshots =
      await repository.listEmployeeVisibleQuestionSnapshotsForAiPaperSource({
        employeePublicId: " employee_public_123 ",
        organizationPublicId: " organization_public_123 ",
      });

    expect(listPublishedVersionsForEmployeeOrganization).toHaveBeenCalledWith({
      employeePublicId: "employee_public_123",
      organizationPublicId: "organization_public_123",
      visibleOrganizationPublicIds: ["organization_public_123"],
    });
    expect(getEmployeeVisibleVersionListInputs()).toEqual([
      {
        employeePublicId: "employee_public_123",
        organizationPublicId: "organization_public_123",
        visibleOrganizationPublicIds: ["organization_public_123"],
      },
    ]);
    expect(snapshots).toEqual(questionSnapshot);
    expect(JSON.stringify(snapshots)).toContain("standardAnswer");
    expect(JSON.stringify(snapshots)).toContain("analysisSummary");
    expect(JSON.stringify(snapshots)).not.toContain(
      "training_question_public_taken_down",
    );
    expect(JSON.stringify(snapshots)).not.toContain(
      "training_question_public_incomplete",
    );
  });

  it("excludes incomplete admin training versions from AI paper source snapshots", async () => {
    const questionSnapshot = createVersionWrite().questionSnapshot;
    const { gateway } = createGateway({
      adminLifecycleVersionRows: [
        createVersionRow({ question_snapshot: questionSnapshot }),
        {
          ...createVersionRow({
            public_id: "training_version_admin_incomplete",
            question_snapshot: [
              {
                ...questionSnapshot[0],
                publicId: "training_question_public_admin_incomplete",
              },
            ],
          }),
          published_at: null,
        } as unknown as OrganizationTrainingVersionRow,
      ],
    });
    const repository = createOrganizationTrainingRepository(gateway);

    const snapshots =
      await repository.listAdminVisibleQuestionSnapshotsForAiPaperSource({
        visibleOrganizationPublicIds: ["organization_public_123"],
      });

    expect(snapshots).toEqual(questionSnapshot);
    expect(JSON.stringify(snapshots)).not.toContain(
      "training_question_public_admin_incomplete",
    );
  });

  it("caps paper-source question snapshots by the published training question count", async () => {
    const { gateway } = createGateway({
      paperQuestionSnapshotRows: [
        createPaperQuestionSnapshotRow({
          paperQuestionPublicId: "paper_question_public_001",
          sortOrder: 1,
        }),
        createPaperQuestionSnapshotRow({
          paperQuestionPublicId: "paper_question_public_002",
          sortOrder: 2,
        }),
        createPaperQuestionSnapshotRow({
          paperQuestionPublicId: "paper_question_public_003",
          sortOrder: 3,
        }),
      ],
    });
    const repository = createOrganizationTrainingRepository(gateway);

    const versions = await repository.listEmployeeVisibleVersions({
      employeePublicId: "employee_public_123",
      organizationPublicId: "organization_public_123",
    });

    expect(versions[0]?.questionCount).toBe(2);
    expect(versions[0]?.questions).toHaveLength(2);
    expect(
      versions[0]?.questions?.map((question) => question.publicId),
    ).toEqual(["paper_question_public_001", "paper_question_public_002"]);
  });

  it("passes employee visible organization scope to the visible version gateway", async () => {
    const {
      getEmployeeVisibleVersionListInputs,
      listPublishedVersionsForEmployeeOrganization,
      gateway,
    } = createGateway();
    const repository = createOrganizationTrainingRepository(gateway);
    const input = {
      employeePublicId: " employee_public_123 ",
      organizationPublicId: " organization_branch_public_456 ",
      visibleOrganizationPublicIds: [
        " organization_branch_public_456 ",
        "organization_public_123",
        "organization_public_123",
      ],
    } as Parameters<typeof repository.listEmployeeVisibleVersions>[0] & {
      visibleOrganizationPublicIds: string[];
    };

    await repository.listEmployeeVisibleVersions(input);

    expect(listPublishedVersionsForEmployeeOrganization).toHaveBeenCalledWith({
      employeePublicId: "employee_public_123",
      organizationPublicId: "organization_branch_public_456",
      visibleOrganizationPublicIds: [
        "organization_branch_public_456",
        "organization_public_123",
      ],
    });
    expect(getEmployeeVisibleVersionListInputs()).toEqual([
      {
        employeePublicId: "employee_public_123",
        organizationPublicId: "organization_branch_public_456",
        visibleOrganizationPublicIds: [
          "organization_branch_public_456",
          "organization_public_123",
        ],
      },
    ]);
  });

  it("rejects invalid trusted internal lineage returned by the gateway", async () => {
    const { gateway } = createGateway({
      trustedPersistenceLineage: {
        organizationId: 0,
        orgAuthId: 601,
      },
    });
    const repository = createOrganizationTrainingRepository(gateway);

    const result = await repository.lookupTrustedPersistenceLineage({
      organizationPublicId: "organization_public_123",
      authorizationPublicId: "org_auth_public_123",
    });

    expect(result).toBeNull();
  });

  it("expands assigned root organizations to active descendant public ids for admin visible scope", async () => {
    const { gateway, findVisibleOrganizationScopeSourceByAdminPublicId } =
      createGateway({
        visibleOrganizationScopeSource: {
          assignedRootOrganizationIds: [101],
          activeOrganizationRows: [
            {
              organizationId: 101,
              organizationPublicId: "organization_scope_root_public",
              parentOrganizationId: null,
            },
            {
              organizationId: 102,
              organizationPublicId: "organization_scope_child_public",
              parentOrganizationId: 101,
            },
            {
              organizationId: 103,
              organizationPublicId: "organization_scope_grandchild_public",
              parentOrganizationId: 102,
            },
            {
              organizationId: 104,
              organizationPublicId: "organization_scope_unassigned_public",
              parentOrganizationId: null,
            },
          ],
        },
      });
    const repository = createOrganizationTrainingRepository(gateway);

    const result = await repository.lookupVisibleOrganizationScope({
      adminPublicId: " organization_admin_public_123 ",
    });

    expect(
      findVisibleOrganizationScopeSourceByAdminPublicId,
    ).toHaveBeenCalledWith("organization_admin_public_123");
    expect(result).toEqual([
      "organization_scope_root_public",
      "organization_scope_child_public",
      "organization_scope_grandchild_public",
    ]);
  });

  it("does not query visible organization scope when admin public id is blank", async () => {
    const { gateway, findVisibleOrganizationScopeSourceByAdminPublicId } =
      createGateway({
        visibleOrganizationScopeSource: {
          assignedRootOrganizationIds: [101],
          activeOrganizationRows: [
            {
              organizationId: 101,
              organizationPublicId: "organization_scope_root_public",
              parentOrganizationId: null,
            },
          ],
        },
      });
    const repository = createOrganizationTrainingRepository(gateway);

    const result = await repository.lookupVisibleOrganizationScope({
      adminPublicId: " ",
    });

    expect(result).toBeNull();
    expect(
      findVisibleOrganizationScopeSourceByAdminPublicId,
    ).not.toHaveBeenCalled();
  });
});
