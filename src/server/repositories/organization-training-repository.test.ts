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
  createOrganizationTrainingVisibleOrganizationPublicIdArraySql,
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
  organizationId: number;
  organizationName: string;
  totalScore: number;
};

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
  sourceType: "paper" | "mock_exam";
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
    status: "published",
    publishedAt: "2026-06-15T19:20:13.000Z",
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
    answeredQuestionCount: 1,
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
    answeredQuestionCount: 2,
    scoreSummary: {
      score: 4,
      totalScore: 5,
    },
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
    draftPersistenceLineage?: DraftPersistenceLineage | null;
    manualDraftInsertResult?: "row" | "null";
    sourceContextInsertResult?: "rows" | "empty";
    takedownUpdateResult?: "row" | "null";
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

      return [createVersionRow()];
    },
  );
  const findPublishedVersionByPublicId = vi.fn(
    async (
      input: OrganizationTrainingVersionLookupInput,
    ): Promise<OrganizationTrainingVersionRow | null> => {
      versionLookupInputs = [...versionLookupInputs, input];

      return createVersionRow({
        public_id: input.trainingVersionPublicId,
      });
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
        version_status: input.status,
        published_at: new Date(input.publishedAt),
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
        version_status: input.status,
        published_at: new Date("2026-06-15T19:20:13.000Z"),
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
    findPublishedVersionByPublicId,
    findEmployeeAnswerByVersionPublicId,
    insertPublishedVersion,
    insertManualDraft,
    insertSourceContexts,
    upsertEmployeeAnswerDraft,
    upsertEmployeeAnswerSubmission,
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
    findPublishedVersionByPublicId,
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
    version_status: "published",
    published_at: new Date("2026-06-15T19:20:13.000Z"),
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
    created_at: new Date("2026-06-16T09:00:00.000Z"),
    updated_at: new Date("2026-06-16T09:05:00.000Z"),
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
    });

    const serializedInsert = JSON.stringify(getManualDraftInsertInputs());

    expect(serializedInsert).not.toContain("formalPaperPublicId");
    expect(serializedInsert).not.toContain("mockExamPublicId");
    expect(serializedInsert).not.toContain("answerRecordPublicId");
    expect(serializedInsert).not.toContain("providerPayload");
    expect(serializedInsert).not.toContain("rawPrompt");
    expect(serializedInsert).not.toContain("rawAnswer");
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

    expect(findLatestVersionNumberByDraftPublicId).toHaveBeenCalledWith(
      "training_draft_public_123",
    );
    expect(insertPublishedVersion).toHaveBeenCalledWith(
      expect.objectContaining({
        publicId: "training_version_public_999",
        draftPublicId: "training_draft_public_123",
        versionNumber: 3,
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
      versionNumber: 3,
      organizationPublicId: "organization_public_123",
      status: "published",
    });
    expect("authorizationSource" in result).toBe(false);
    expect("authorizationPublicId" in result).toBe(false);
    expect("organizationId" in result).toBe(false);
    expect("orgAuthId" in result).toBe(false);
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
        organizationId: 501,
        organizationName: "Test Organization",
        totalScore: 5,
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
      submittedAt: null,
      savedAt: "2026-06-16T09:00:00.000Z",
    });
    expect(result).toEqual({
      publicId: "training_answer_public_999",
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
        organizationId: 501,
        organizationName: "Test Organization",
        totalScore: 5,
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
      submittedAt: "2026-06-16T09:05:00.000Z",
    });
    expect(result).toEqual({
      publicId: "training_answer_public_999",
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
    });
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
