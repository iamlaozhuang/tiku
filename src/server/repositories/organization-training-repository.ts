import { randomUUID } from "node:crypto";

import {
  admin,
  adminOrganization,
  employee,
  type OrganizationTrainingAnswerOrganizationSnapshotValue,
  orgAuth,
  orgAuthOrganization,
  organization,
  organizationTrainingAnswer,
  organizationTrainingVersion,
} from "@/db/schema";
import { and, desc, eq } from "drizzle-orm";

import type {
  EmployeeOrganizationTrainingAnswerDto,
  OrganizationTrainingPublishedVersionDto,
  OrganizationTrainingScopeSnapshotDto,
} from "../contracts/organization-training-contract";
import type {
  OrganizationTrainingEmployeeAnswerDraftWrite,
  OrganizationTrainingEmployeeAnswerSubmissionWrite,
  OrganizationTrainingPublishedVersionPersistenceWrite,
  OrganizationTrainingVersionTakedownWrite,
} from "../services/organization-training-service";
import {
  mapOrganizationTrainingAnswerRowToDto,
  mapOrganizationTrainingVersionRowToDto,
  type OrganizationTrainingAnswerRow,
  type OrganizationTrainingVersionRow,
} from "../mappers/organization-training-mapper";
import {
  createLazyRuntimeDatabaseGetter,
  type RuntimeDatabase,
  type RuntimeDatabaseOptions,
} from "./runtime-database";

export type { OrganizationTrainingAnswerRow, OrganizationTrainingVersionRow };

export type OrganizationTrainingPublishedVersionPersistenceInput =
  OrganizationTrainingPublishedVersionPersistenceWrite;

export type OrganizationTrainingEmployeeAnswerDraftPersistenceInput =
  OrganizationTrainingEmployeeAnswerDraftWrite;

export type OrganizationTrainingEmployeeAnswerSubmissionPersistenceInput =
  OrganizationTrainingEmployeeAnswerSubmissionWrite;

export type OrganizationTrainingVersionOrganizationLookupInput = {
  versionPublicId: string;
};

export type OrganizationTrainingVersionTakedownPersistenceInput =
  OrganizationTrainingVersionTakedownWrite;

export type OrganizationTrainingVersionTakedownInput = Omit<
  OrganizationTrainingVersionTakedownPersistenceInput,
  "accessPolicy"
>;

export type OrganizationTrainingVersionInsertInput =
  OrganizationTrainingPublishedVersionPersistenceInput & {
    publicId: string;
    versionNumber: number;
  };

export type OrganizationTrainingTrustedPersistenceLineage = {
  organizationId: number;
  orgAuthId: number;
};

export type OrganizationTrainingTrustedPersistenceLineageLookupInput = {
  organizationPublicId: string;
  authorizationPublicId: string;
};

export type OrganizationTrainingVisibleOrganizationScopeLookupInput = {
  adminPublicId: string;
};

export type OrganizationTrainingVisibleOrganizationScopeRow = {
  organizationId: number;
  organizationPublicId: string;
  parentOrganizationId: number | null;
};

export type OrganizationTrainingVisibleOrganizationScopeSource = {
  assignedRootOrganizationIds: readonly number[];
  activeOrganizationRows: readonly OrganizationTrainingVisibleOrganizationScopeRow[];
};

export type OrganizationTrainingEmployeeAnswerPersistenceLineageLookupInput = {
  trainingVersionPublicId: string;
  employeePublicId: string;
  organizationPublicId: string;
};

export type OrganizationTrainingEmployeeAnswerPersistenceLineage = {
  organizationTrainingVersionId: number;
  employeeId: number;
  organizationId: number;
  organizationName: string;
  totalScore: number;
};

export type OrganizationTrainingEmployeeAnswerDraftUpsertInput = {
  publicId: string;
  organizationTrainingVersionId: number;
  trainingVersionPublicId: string;
  employeeId: number;
  employeePublicId: string;
  organizationId: number;
  organizationPublicId: string;
  answerOrganizationSnapshot: OrganizationTrainingAnswerOrganizationSnapshotValue;
  answerStatus: "in_progress";
  score: null;
  totalScore: number;
  submittedAt: null;
  savedAt: string;
};

export type OrganizationTrainingEmployeeAnswerSubmissionUpsertInput = {
  publicId: string;
  organizationTrainingVersionId: number;
  trainingVersionPublicId: string;
  employeeId: number;
  employeePublicId: string;
  organizationId: number;
  organizationPublicId: string;
  answerOrganizationSnapshot: OrganizationTrainingAnswerOrganizationSnapshotValue;
  answerStatus: "submitted";
  score: number;
  totalScore: number;
  submittedAt: string;
};

type NormalizedOrganizationTrainingEmployeeAnswerDraftInput = {
  trainingVersionPublicId: string;
  employeePublicId: string;
  organizationPublicId: string;
  answerOrganizationSnapshot: OrganizationTrainingScopeSnapshotDto;
  answerStatus: "in_progress";
  score: null;
  submittedAt: null;
  savedAt: string;
};

type NormalizedOrganizationTrainingEmployeeAnswerSubmissionInput = {
  trainingVersionPublicId: string;
  employeePublicId: string;
  organizationPublicId: string;
  answerOrganizationSnapshot: OrganizationTrainingScopeSnapshotDto;
  answerStatus: "submitted";
  score: number;
  totalScore: number;
  submittedAt: string;
};

export type OrganizationTrainingVersionGateway = {
  findLatestVersionNumberByDraftPublicId(
    draftPublicId: string,
  ): Promise<number | null>;
  findTrustedPersistenceLineageByPublicIds(
    input: OrganizationTrainingTrustedPersistenceLineageLookupInput,
  ): Promise<OrganizationTrainingTrustedPersistenceLineage | null>;
  findVisibleOrganizationScopeSourceByAdminPublicId(
    adminPublicId: string,
  ): Promise<OrganizationTrainingVisibleOrganizationScopeSource | null>;
  findVersionOrganizationPublicIdByVersionPublicId(
    versionPublicId: string,
  ): Promise<string | null>;
  findEmployeeAnswerPersistenceLineageByPublicIds(
    input: OrganizationTrainingEmployeeAnswerPersistenceLineageLookupInput,
  ): Promise<OrganizationTrainingEmployeeAnswerPersistenceLineage | null>;
  insertPublishedVersion(
    input: OrganizationTrainingVersionInsertInput,
  ): Promise<OrganizationTrainingVersionRow | null>;
  upsertEmployeeAnswerDraft(
    input: OrganizationTrainingEmployeeAnswerDraftUpsertInput,
  ): Promise<OrganizationTrainingAnswerRow | null>;
  upsertEmployeeAnswerSubmission(
    input: OrganizationTrainingEmployeeAnswerSubmissionUpsertInput,
  ): Promise<OrganizationTrainingAnswerRow | null>;
  updateVersionTakedown(
    input: OrganizationTrainingVersionTakedownInput,
  ): Promise<OrganizationTrainingVersionRow | null>;
};

export type OrganizationTrainingRepository = {
  lookupVisibleOrganizationScope(
    input: OrganizationTrainingVisibleOrganizationScopeLookupInput,
  ): Promise<readonly string[] | null>;
  lookupTrustedPersistenceLineage(
    input: OrganizationTrainingTrustedPersistenceLineageLookupInput,
  ): Promise<OrganizationTrainingTrustedPersistenceLineage | null>;
  lookupVersionOrganizationPublicId(
    input: OrganizationTrainingVersionOrganizationLookupInput,
  ): Promise<string | null>;
  publishVersion(
    input: OrganizationTrainingPublishedVersionPersistenceInput,
  ): Promise<OrganizationTrainingPublishedVersionDto>;
  saveEmployeeAnswerDraft(
    input: OrganizationTrainingEmployeeAnswerDraftPersistenceInput,
  ): Promise<EmployeeOrganizationTrainingAnswerDto>;
  submitEmployeeAnswer(
    input: OrganizationTrainingEmployeeAnswerSubmissionPersistenceInput,
  ): Promise<EmployeeOrganizationTrainingAnswerDto>;
  takeDownVersion(
    input: OrganizationTrainingVersionTakedownPersistenceInput,
  ): Promise<OrganizationTrainingPublishedVersionDto>;
};

export type OrganizationTrainingRepositoryOptions = {
  createVersionPublicId?: () => string;
  createAnswerPublicId?: () => string;
};

const organizationTrainingVersionSelection = {
  id: organizationTrainingVersion.id,
  public_id: organizationTrainingVersion.public_id,
  draft_public_id: organizationTrainingVersion.draft_public_id,
  version_number: organizationTrainingVersion.version_number,
  organization_id: organizationTrainingVersion.organization_id,
  organization_public_id: organizationTrainingVersion.organization_public_id,
  org_auth_id: organizationTrainingVersion.org_auth_id,
  authorization_source: organizationTrainingVersion.authorization_source,
  authorization_public_id: organizationTrainingVersion.authorization_public_id,
  owner_type: organizationTrainingVersion.owner_type,
  owner_public_id: organizationTrainingVersion.owner_public_id,
  quota_owner_type: organizationTrainingVersion.quota_owner_type,
  quota_owner_public_id: organizationTrainingVersion.quota_owner_public_id,
  publish_scope_snapshot: organizationTrainingVersion.publish_scope_snapshot,
  profession: organizationTrainingVersion.profession,
  level: organizationTrainingVersion.level,
  subject: organizationTrainingVersion.subject,
  title: organizationTrainingVersion.title,
  description: organizationTrainingVersion.description,
  question_count: organizationTrainingVersion.question_count,
  total_score: organizationTrainingVersion.total_score,
  question_type_summary: organizationTrainingVersion.question_type_summary,
  version_status: organizationTrainingVersion.version_status,
  published_at: organizationTrainingVersion.published_at,
  taken_down_at: organizationTrainingVersion.taken_down_at,
  takedown_reason: organizationTrainingVersion.takedown_reason,
  created_at: organizationTrainingVersion.created_at,
  updated_at: organizationTrainingVersion.updated_at,
};

const organizationTrainingAnswerSelection = {
  id: organizationTrainingAnswer.id,
  public_id: organizationTrainingAnswer.public_id,
  organization_training_version_id:
    organizationTrainingAnswer.organization_training_version_id,
  organization_training_version_public_id:
    organizationTrainingAnswer.organization_training_version_public_id,
  employee_id: organizationTrainingAnswer.employee_id,
  employee_public_id: organizationTrainingAnswer.employee_public_id,
  organization_id: organizationTrainingAnswer.organization_id,
  organization_public_id: organizationTrainingAnswer.organization_public_id,
  organization_training_answer_status:
    organizationTrainingAnswer.organization_training_answer_status,
  score: organizationTrainingAnswer.score,
  total_score: organizationTrainingAnswer.total_score,
  submitted_at: organizationTrainingAnswer.submitted_at,
  answer_organization_snapshot:
    organizationTrainingAnswer.answer_organization_snapshot,
  created_at: organizationTrainingAnswer.created_at,
  updated_at: organizationTrainingAnswer.updated_at,
};

export function createOrganizationTrainingRepository(
  gateway: OrganizationTrainingVersionGateway,
  options: OrganizationTrainingRepositoryOptions = {},
): OrganizationTrainingRepository {
  const createVersionPublicId =
    options.createVersionPublicId ?? createDefaultVersionPublicId;
  const createAnswerPublicId =
    options.createAnswerPublicId ?? createDefaultAnswerPublicId;

  return {
    async lookupVisibleOrganizationScope(input) {
      const adminPublicId = normalizeRequiredText(input.adminPublicId);

      if (adminPublicId === null) {
        return null;
      }

      const visibleOrganizationScopeSource =
        await gateway.findVisibleOrganizationScopeSourceByAdminPublicId(
          adminPublicId,
        );

      return visibleOrganizationScopeSource === null
        ? null
        : resolveVisibleOrganizationPublicIds(visibleOrganizationScopeSource);
    },

    async lookupTrustedPersistenceLineage(input) {
      const lookupInput = normalizeTrustedPersistenceLineageLookupInput(input);

      if (lookupInput === null) {
        return null;
      }

      const persistenceLineage =
        await gateway.findTrustedPersistenceLineageByPublicIds(lookupInput);

      return persistenceLineage === null
        ? null
        : normalizeTrustedPersistenceLineage(persistenceLineage);
    },

    async lookupVersionOrganizationPublicId(input) {
      const versionPublicId = normalizeRequiredText(input.versionPublicId);

      if (versionPublicId === null) {
        return null;
      }

      const organizationPublicId =
        await gateway.findVersionOrganizationPublicIdByVersionPublicId(
          versionPublicId,
        );

      return organizationPublicId === null
        ? null
        : normalizeRequiredText(organizationPublicId);
    },

    async publishVersion(input) {
      const latestVersionNumber =
        await gateway.findLatestVersionNumberByDraftPublicId(
          input.draftPublicId,
        );
      const insertInput = createVersionInsertInput(input, {
        publicId: createVersionPublicId(),
        versionNumber: resolveNextVersionNumber(latestVersionNumber),
      });
      const insertedRow = await gateway.insertPublishedVersion(insertInput);

      if (insertedRow === null) {
        throw new Error("organization training version persistence failed.");
      }

      return mapOrganizationTrainingVersionRowToDto(insertedRow);
    },

    async saveEmployeeAnswerDraft(input) {
      const draftUpsertInput = await createEmployeeAnswerDraftUpsertInput(
        input,
        {
          gateway,
          publicId: createAnswerPublicId(),
        },
      );

      if (draftUpsertInput === null) {
        throw new Error(
          "organization training employee answer persistence failed.",
        );
      }

      const row = await gateway.upsertEmployeeAnswerDraft(draftUpsertInput);

      if (row === null) {
        throw new Error(
          "organization training employee answer persistence failed.",
        );
      }

      return mapOrganizationTrainingAnswerRowToDto(row);
    },

    async submitEmployeeAnswer(input) {
      const submissionUpsertInput =
        await createEmployeeAnswerSubmissionUpsertInput(input, {
          gateway,
          publicId: createAnswerPublicId(),
        });

      if (submissionUpsertInput === null) {
        throw new Error(
          "organization training employee answer persistence failed.",
        );
      }

      const row = await gateway.upsertEmployeeAnswerSubmission(
        submissionUpsertInput,
      );

      if (row === null) {
        throw new Error(
          "organization training employee answer persistence failed.",
        );
      }

      return mapOrganizationTrainingAnswerRowToDto(row);
    },

    async takeDownVersion(input) {
      const takedownInput = createVersionTakedownInput(input);

      if (takedownInput === null) {
        throw new Error("organization training version takedown failed.");
      }

      const updatedRow = await gateway.updateVersionTakedown(takedownInput);

      if (updatedRow === null) {
        throw new Error("organization training version takedown failed.");
      }

      return mapOrganizationTrainingVersionRowToDto(updatedRow);
    },
  };
}

export function createPostgresOrganizationTrainingRepository(
  options: RuntimeDatabaseOptions = {},
): OrganizationTrainingRepository {
  const getDatabase = createLazyRuntimeDatabaseGetter(
    options,
    "DATABASE_URL is required for organization training publish-version persistence.",
  );

  return createOrganizationTrainingRepository({
    async findLatestVersionNumberByDraftPublicId(draftPublicId) {
      return findLatestVersionNumberByDraftPublicId(
        getDatabase(),
        draftPublicId,
      );
    },
    async findTrustedPersistenceLineageByPublicIds(input) {
      return findTrustedPersistenceLineageByPublicIds(getDatabase(), input);
    },
    async findVisibleOrganizationScopeSourceByAdminPublicId(adminPublicId) {
      return findVisibleOrganizationScopeSourceByAdminPublicId(
        getDatabase(),
        adminPublicId,
      );
    },
    async findVersionOrganizationPublicIdByVersionPublicId(versionPublicId) {
      return findVersionOrganizationPublicIdByVersionPublicId(
        getDatabase(),
        versionPublicId,
      );
    },
    async findEmployeeAnswerPersistenceLineageByPublicIds(input) {
      return findEmployeeAnswerPersistenceLineageByPublicIds(
        getDatabase(),
        input,
      );
    },
    async insertPublishedVersion(input) {
      const [row] = await getDatabase()
        .insert(organizationTrainingVersion)
        .values({
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
        })
        .returning(organizationTrainingVersionSelection);

      return (row as OrganizationTrainingVersionRow | undefined) ?? null;
    },
    async upsertEmployeeAnswerDraft(input) {
      const savedAt = new Date(input.savedAt);
      const [row] = await getDatabase()
        .insert(organizationTrainingAnswer)
        .values({
          public_id: input.publicId,
          organization_training_version_id: input.organizationTrainingVersionId,
          organization_training_version_public_id:
            input.trainingVersionPublicId,
          employee_id: input.employeeId,
          employee_public_id: input.employeePublicId,
          organization_id: input.organizationId,
          organization_public_id: input.organizationPublicId,
          organization_training_answer_status: input.answerStatus,
          score: input.score,
          total_score: String(input.totalScore),
          submitted_at: input.submittedAt,
          answer_organization_snapshot: input.answerOrganizationSnapshot,
          created_at: savedAt,
          updated_at: savedAt,
        })
        .onConflictDoUpdate({
          target: [
            organizationTrainingAnswer.organization_training_version_id,
            organizationTrainingAnswer.employee_id,
          ],
          set: {
            organization_id: input.organizationId,
            organization_public_id: input.organizationPublicId,
            organization_training_answer_status: input.answerStatus,
            score: input.score,
            total_score: String(input.totalScore),
            submitted_at: input.submittedAt,
            answer_organization_snapshot: input.answerOrganizationSnapshot,
            updated_at: savedAt,
          },
        })
        .returning(organizationTrainingAnswerSelection);

      return (row as OrganizationTrainingAnswerRow | undefined) ?? null;
    },
    async upsertEmployeeAnswerSubmission(input) {
      const submittedAt = new Date(input.submittedAt);
      const [row] = await getDatabase()
        .insert(organizationTrainingAnswer)
        .values({
          public_id: input.publicId,
          organization_training_version_id: input.organizationTrainingVersionId,
          organization_training_version_public_id:
            input.trainingVersionPublicId,
          employee_id: input.employeeId,
          employee_public_id: input.employeePublicId,
          organization_id: input.organizationId,
          organization_public_id: input.organizationPublicId,
          organization_training_answer_status: input.answerStatus,
          score: String(input.score),
          total_score: String(input.totalScore),
          submitted_at: submittedAt,
          answer_organization_snapshot: input.answerOrganizationSnapshot,
          created_at: submittedAt,
          updated_at: submittedAt,
        })
        .onConflictDoUpdate({
          target: [
            organizationTrainingAnswer.organization_training_version_id,
            organizationTrainingAnswer.employee_id,
          ],
          set: {
            organization_id: input.organizationId,
            organization_public_id: input.organizationPublicId,
            organization_training_answer_status: input.answerStatus,
            score: String(input.score),
            total_score: String(input.totalScore),
            submitted_at: submittedAt,
            answer_organization_snapshot: input.answerOrganizationSnapshot,
            updated_at: submittedAt,
          },
        })
        .returning(organizationTrainingAnswerSelection);

      return (row as OrganizationTrainingAnswerRow | undefined) ?? null;
    },
    async updateVersionTakedown(input) {
      const takenDownAt = new Date(input.takenDownAt);
      const [row] = await getDatabase()
        .update(organizationTrainingVersion)
        .set({
          version_status: input.status,
          taken_down_at: takenDownAt,
          takedown_reason: input.takedownReason,
          updated_at: takenDownAt,
        })
        .where(
          and(
            eq(organizationTrainingVersion.public_id, input.versionPublicId),
            eq(
              organizationTrainingVersion.organization_public_id,
              input.organizationPublicId,
            ),
            eq(organizationTrainingVersion.version_status, "published"),
          ),
        )
        .returning(organizationTrainingVersionSelection);

      return (row as OrganizationTrainingVersionRow | undefined) ?? null;
    },
  });
}

function normalizeRequiredText(value: string): string | null {
  const trimmedValue = value.trim();

  return trimmedValue.length > 0 ? trimmedValue : null;
}

function normalizeTrustedPersistenceLineageLookupInput(
  input: OrganizationTrainingTrustedPersistenceLineageLookupInput,
): OrganizationTrainingTrustedPersistenceLineageLookupInput | null {
  const organizationPublicId = normalizeRequiredText(
    input.organizationPublicId,
  );
  const authorizationPublicId = normalizeRequiredText(
    input.authorizationPublicId,
  );

  if (organizationPublicId === null || authorizationPublicId === null) {
    return null;
  }

  return {
    organizationPublicId,
    authorizationPublicId,
  };
}

function normalizeTrustedPersistenceLineage(
  persistenceLineage: OrganizationTrainingTrustedPersistenceLineage,
): OrganizationTrainingTrustedPersistenceLineage | null {
  if (
    !Number.isInteger(persistenceLineage.organizationId) ||
    persistenceLineage.organizationId < 1 ||
    !Number.isInteger(persistenceLineage.orgAuthId) ||
    persistenceLineage.orgAuthId < 1
  ) {
    return null;
  }

  return {
    organizationId: persistenceLineage.organizationId,
    orgAuthId: persistenceLineage.orgAuthId,
  };
}

function normalizeVisibleOrganizationScopeRow(
  scopeRow: OrganizationTrainingVisibleOrganizationScopeRow,
): OrganizationTrainingVisibleOrganizationScopeRow | null {
  const organizationPublicId = normalizeRequiredText(
    scopeRow.organizationPublicId,
  );

  if (
    organizationPublicId === null ||
    !Number.isInteger(scopeRow.organizationId) ||
    scopeRow.organizationId < 1 ||
    (scopeRow.parentOrganizationId !== null &&
      (!Number.isInteger(scopeRow.parentOrganizationId) ||
        scopeRow.parentOrganizationId < 1))
  ) {
    return null;
  }

  return {
    organizationId: scopeRow.organizationId,
    organizationPublicId,
    parentOrganizationId: scopeRow.parentOrganizationId,
  };
}

function resolveVisibleOrganizationPublicIds(
  visibleOrganizationScopeSource: OrganizationTrainingVisibleOrganizationScopeSource,
): string[] {
  const activeOrganizationRows =
    visibleOrganizationScopeSource.activeOrganizationRows
      .map(normalizeVisibleOrganizationScopeRow)
      .filter(
        (
          scopeRow,
        ): scopeRow is OrganizationTrainingVisibleOrganizationScopeRow =>
          scopeRow !== null,
      );
  const activeOrganizationIds = new Set(
    activeOrganizationRows.map((scopeRow) => scopeRow.organizationId),
  );
  const assignedRootOrganizationIds = [
    ...new Set(
      visibleOrganizationScopeSource.assignedRootOrganizationIds.filter(
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

function createVersionInsertInput(
  input: OrganizationTrainingPublishedVersionPersistenceInput,
  generated: {
    publicId: string;
    versionNumber: number;
  },
): OrganizationTrainingVersionInsertInput {
  return {
    ...input,
    publicId: generated.publicId,
    versionNumber: generated.versionNumber,
    publishScopeSnapshot: {
      organizationPublicIds: [
        ...input.publishScopeSnapshot.organizationPublicIds,
      ],
      capturedAt: input.publishScopeSnapshot.capturedAt,
    },
    questionTypeSummary: {
      singleChoice: input.questionTypeSummary.singleChoice,
      multiChoice: input.questionTypeSummary.multiChoice,
      trueFalse: input.questionTypeSummary.trueFalse,
      shortAnswer: input.questionTypeSummary.shortAnswer,
    },
  };
}

function createVersionTakedownInput(
  input: OrganizationTrainingVersionTakedownPersistenceInput,
): OrganizationTrainingVersionTakedownInput | null {
  const versionPublicId = normalizeRequiredText(input.versionPublicId);
  const organizationPublicId = normalizeRequiredText(
    input.organizationPublicId,
  );
  const takedownReason = normalizeRequiredText(input.takedownReason);

  if (
    versionPublicId === null ||
    organizationPublicId === null ||
    takedownReason === null ||
    input.status !== "taken_down"
  ) {
    return null;
  }

  return {
    versionPublicId,
    organizationPublicId,
    status: input.status,
    takenDownAt: input.takenDownAt,
    takedownReason,
  };
}

async function createEmployeeAnswerDraftUpsertInput(
  input: OrganizationTrainingEmployeeAnswerDraftPersistenceInput,
  generated: {
    gateway: OrganizationTrainingVersionGateway;
    publicId: string;
  },
): Promise<OrganizationTrainingEmployeeAnswerDraftUpsertInput | null> {
  const normalizedInput = normalizeEmployeeAnswerDraftPersistenceInput(input);

  if (normalizedInput === null) {
    return null;
  }

  const lineage = normalizeEmployeeAnswerPersistenceLineage(
    await generated.gateway.findEmployeeAnswerPersistenceLineageByPublicIds({
      trainingVersionPublicId: normalizedInput.trainingVersionPublicId,
      employeePublicId: normalizedInput.employeePublicId,
      organizationPublicId: normalizedInput.organizationPublicId,
    }),
  );

  if (lineage === null) {
    return null;
  }

  return {
    publicId: generated.publicId,
    trainingVersionPublicId: normalizedInput.trainingVersionPublicId,
    employeePublicId: normalizedInput.employeePublicId,
    organizationPublicId: normalizedInput.organizationPublicId,
    answerOrganizationSnapshot: createAnswerOrganizationSnapshot(
      normalizedInput,
      lineage,
    ),
    answerStatus: normalizedInput.answerStatus,
    score: normalizedInput.score,
    submittedAt: normalizedInput.submittedAt,
    savedAt: normalizedInput.savedAt,
    organizationTrainingVersionId: lineage.organizationTrainingVersionId,
    employeeId: lineage.employeeId,
    organizationId: lineage.organizationId,
    totalScore: lineage.totalScore,
  };
}

async function createEmployeeAnswerSubmissionUpsertInput(
  input: OrganizationTrainingEmployeeAnswerSubmissionPersistenceInput,
  generated: {
    gateway: OrganizationTrainingVersionGateway;
    publicId: string;
  },
): Promise<OrganizationTrainingEmployeeAnswerSubmissionUpsertInput | null> {
  const normalizedInput =
    normalizeEmployeeAnswerSubmissionPersistenceInput(input);

  if (normalizedInput === null) {
    return null;
  }

  const lineage = normalizeEmployeeAnswerPersistenceLineage(
    await generated.gateway.findEmployeeAnswerPersistenceLineageByPublicIds({
      trainingVersionPublicId: normalizedInput.trainingVersionPublicId,
      employeePublicId: normalizedInput.employeePublicId,
      organizationPublicId: normalizedInput.organizationPublicId,
    }),
  );

  if (lineage === null) {
    return null;
  }

  return {
    publicId: generated.publicId,
    trainingVersionPublicId: normalizedInput.trainingVersionPublicId,
    employeePublicId: normalizedInput.employeePublicId,
    organizationPublicId: normalizedInput.organizationPublicId,
    answerOrganizationSnapshot: createAnswerOrganizationSnapshot(
      normalizedInput,
      lineage,
    ),
    answerStatus: normalizedInput.answerStatus,
    score: normalizedInput.score,
    totalScore: normalizedInput.totalScore,
    submittedAt: normalizedInput.submittedAt,
    organizationTrainingVersionId: lineage.organizationTrainingVersionId,
    employeeId: lineage.employeeId,
    organizationId: lineage.organizationId,
  };
}

function normalizeEmployeeAnswerDraftPersistenceInput(
  input: OrganizationTrainingEmployeeAnswerDraftPersistenceInput,
): NormalizedOrganizationTrainingEmployeeAnswerDraftInput | null {
  const trainingVersionPublicId = normalizeRequiredText(
    input.trainingVersionPublicId,
  );
  const employeePublicId = normalizeRequiredText(input.employeePublicId);
  const organizationPublicId = normalizeRequiredText(
    input.organizationPublicId,
  );
  const answerOrganizationSnapshot = normalizeOrganizationTrainingScopeSnapshot(
    input.answerOrganizationSnapshot,
  );
  const savedAt = normalizeRequiredText(input.savedAt);

  if (
    input.contentType !== "organization_training_answer_draft" ||
    input.answerStatus !== "in_progress" ||
    input.scoreSummary !== null ||
    input.submittedAt !== null ||
    isFormalWritePolicyBlocked(input.formalWritePolicy) ||
    trainingVersionPublicId === null ||
    employeePublicId === null ||
    organizationPublicId === null ||
    answerOrganizationSnapshot === null ||
    savedAt === null
  ) {
    return null;
  }

  return {
    trainingVersionPublicId,
    employeePublicId,
    organizationPublicId,
    answerOrganizationSnapshot,
    answerStatus: input.answerStatus,
    score: null,
    submittedAt: null,
    savedAt,
  };
}

function normalizeEmployeeAnswerSubmissionPersistenceInput(
  input: OrganizationTrainingEmployeeAnswerSubmissionPersistenceInput,
): NormalizedOrganizationTrainingEmployeeAnswerSubmissionInput | null {
  const trainingVersionPublicId = normalizeRequiredText(
    input.trainingVersionPublicId,
  );
  const employeePublicId = normalizeRequiredText(input.employeePublicId);
  const organizationPublicId = normalizeRequiredText(
    input.organizationPublicId,
  );
  const answerOrganizationSnapshot = normalizeOrganizationTrainingScopeSnapshot(
    input.answerOrganizationSnapshot,
  );
  const submittedAt = normalizeRequiredText(input.submittedAt);
  const score = normalizeNonNegativeScore(input.scoreSummary.score);
  const totalScore = normalizeNonNegativeScore(input.scoreSummary.totalScore);

  if (
    input.contentType !== "organization_training_answer_record" ||
    input.answerStatus !== "submitted" ||
    isFormalWritePolicyBlocked(input.formalWritePolicy) ||
    trainingVersionPublicId === null ||
    employeePublicId === null ||
    organizationPublicId === null ||
    answerOrganizationSnapshot === null ||
    submittedAt === null ||
    score === null ||
    totalScore === null
  ) {
    return null;
  }

  return {
    trainingVersionPublicId,
    employeePublicId,
    organizationPublicId,
    answerOrganizationSnapshot,
    answerStatus: input.answerStatus,
    score,
    totalScore,
    submittedAt,
  };
}

function normalizeEmployeeAnswerPersistenceLineage(
  lineage: OrganizationTrainingEmployeeAnswerPersistenceLineage | null,
): OrganizationTrainingEmployeeAnswerPersistenceLineage | null {
  if (
    lineage === null ||
    !Number.isInteger(lineage.organizationTrainingVersionId) ||
    lineage.organizationTrainingVersionId < 1 ||
    !Number.isInteger(lineage.employeeId) ||
    lineage.employeeId < 1 ||
    !Number.isInteger(lineage.organizationId) ||
    lineage.organizationId < 1
  ) {
    return null;
  }

  const organizationName = normalizeRequiredText(lineage.organizationName);
  const totalScore = normalizeNonNegativeScore(lineage.totalScore);

  if (organizationName === null || totalScore === null) {
    return null;
  }

  return {
    organizationTrainingVersionId: lineage.organizationTrainingVersionId,
    employeeId: lineage.employeeId,
    organizationId: lineage.organizationId,
    organizationName,
    totalScore,
  };
}

function normalizeOrganizationTrainingScopeSnapshot(
  snapshot: OrganizationTrainingScopeSnapshotDto,
): OrganizationTrainingScopeSnapshotDto | null {
  const capturedAt = normalizeRequiredText(snapshot.capturedAt);
  const organizationPublicIds = [
    ...new Set(
      snapshot.organizationPublicIds
        .map(normalizeRequiredText)
        .filter((publicId): publicId is string => publicId !== null),
    ),
  ];

  if (capturedAt === null || organizationPublicIds.length === 0) {
    return null;
  }

  return {
    organizationPublicIds,
    capturedAt,
  };
}

function normalizeNonNegativeScore(score: number): number | null {
  return Number.isFinite(score) && score >= 0 ? score : null;
}

function createAnswerOrganizationSnapshot(
  input: {
    organizationPublicId: string;
    answerOrganizationSnapshot: OrganizationTrainingScopeSnapshotDto;
  },
  lineage: OrganizationTrainingEmployeeAnswerPersistenceLineage,
): OrganizationTrainingAnswerOrganizationSnapshotValue {
  return {
    organizationPublicId: input.organizationPublicId,
    organizationName: lineage.organizationName,
    capturedAt: input.answerOrganizationSnapshot.capturedAt,
  };
}

function isFormalWritePolicyBlocked(
  formalWritePolicy:
    | OrganizationTrainingEmployeeAnswerDraftPersistenceInput["formalWritePolicy"]
    | OrganizationTrainingEmployeeAnswerSubmissionPersistenceInput["formalWritePolicy"],
): boolean {
  return (
    formalWritePolicy.createPractice ||
    formalWritePolicy.createMockExam ||
    formalWritePolicy.createFormalAnswerRecord ||
    formalWritePolicy.createExamReport ||
    formalWritePolicy.createMistakeBook
  );
}

async function findLatestVersionNumberByDraftPublicId(
  database: RuntimeDatabase,
  draftPublicId: string,
): Promise<number | null> {
  const [row] = await database
    .select({
      version_number: organizationTrainingVersion.version_number,
    })
    .from(organizationTrainingVersion)
    .where(eq(organizationTrainingVersion.draft_public_id, draftPublicId))
    .orderBy(desc(organizationTrainingVersion.version_number))
    .limit(1);

  return row?.version_number ?? null;
}

async function findTrustedPersistenceLineageByPublicIds(
  database: RuntimeDatabase,
  input: OrganizationTrainingTrustedPersistenceLineageLookupInput,
): Promise<OrganizationTrainingTrustedPersistenceLineage | null> {
  const [row] = await database
    .select({
      organization_id: organization.id,
      org_auth_id: orgAuth.id,
    })
    .from(orgAuthOrganization)
    .innerJoin(
      organization,
      eq(orgAuthOrganization.organization_id, organization.id),
    )
    .innerJoin(orgAuth, eq(orgAuthOrganization.org_auth_id, orgAuth.id))
    .where(
      and(
        eq(organization.public_id, input.organizationPublicId),
        eq(orgAuth.public_id, input.authorizationPublicId),
      ),
    )
    .limit(1);

  if (row === undefined) {
    return null;
  }

  return {
    organizationId: row.organization_id,
    orgAuthId: row.org_auth_id,
  };
}

async function findVisibleOrganizationScopeSourceByAdminPublicId(
  database: RuntimeDatabase,
  adminPublicId: string,
): Promise<OrganizationTrainingVisibleOrganizationScopeSource> {
  const assignedRootRows = await database
    .select({
      organization_id: adminOrganization.organization_id,
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
    (assignedRootRow) => assignedRootRow.organization_id,
  );

  if (assignedRootOrganizationIds.length === 0) {
    return {
      assignedRootOrganizationIds,
      activeOrganizationRows: [],
    };
  }

  const activeOrganizationRows = await database
    .select({
      organization_id: organization.id,
      organization_public_id: organization.public_id,
      parent_organization_id: organization.parent_organization_id,
    })
    .from(organization)
    .where(eq(organization.status, "active"));

  return {
    assignedRootOrganizationIds,
    activeOrganizationRows: activeOrganizationRows.map(
      (activeOrganizationRow) => ({
        organizationId: activeOrganizationRow.organization_id,
        organizationPublicId: activeOrganizationRow.organization_public_id,
        parentOrganizationId: activeOrganizationRow.parent_organization_id,
      }),
    ),
  };
}

async function findVersionOrganizationPublicIdByVersionPublicId(
  database: RuntimeDatabase,
  versionPublicId: string,
): Promise<string | null> {
  const [row] = await database
    .select({
      organization_public_id:
        organizationTrainingVersion.organization_public_id,
    })
    .from(organizationTrainingVersion)
    .where(eq(organizationTrainingVersion.public_id, versionPublicId))
    .limit(1);

  return row?.organization_public_id ?? null;
}

async function findEmployeeAnswerPersistenceLineageByPublicIds(
  database: RuntimeDatabase,
  input: OrganizationTrainingEmployeeAnswerPersistenceLineageLookupInput,
): Promise<OrganizationTrainingEmployeeAnswerPersistenceLineage | null> {
  const [row] = await database
    .select({
      organization_training_version_id: organizationTrainingVersion.id,
      employee_id: employee.id,
      organization_id: organization.id,
      organization_name: organization.name,
      total_score: organizationTrainingVersion.total_score,
    })
    .from(organizationTrainingVersion)
    .innerJoin(employee, eq(employee.public_id, input.employeePublicId))
    .innerJoin(organization, eq(employee.organization_id, organization.id))
    .where(
      and(
        eq(
          organizationTrainingVersion.public_id,
          input.trainingVersionPublicId,
        ),
        eq(organization.public_id, input.organizationPublicId),
        eq(organizationTrainingVersion.version_status, "published"),
      ),
    )
    .limit(1);

  if (row === undefined) {
    return null;
  }

  return {
    organizationTrainingVersionId: row.organization_training_version_id,
    employeeId: row.employee_id,
    organizationId: row.organization_id,
    organizationName: row.organization_name,
    totalScore: Number(row.total_score),
  };
}

function resolveNextVersionNumber(latestVersionNumber: number | null): number {
  if (
    latestVersionNumber === null ||
    !Number.isInteger(latestVersionNumber) ||
    latestVersionNumber < 1
  ) {
    return 1;
  }

  return latestVersionNumber + 1;
}

function createDefaultVersionPublicId(): string {
  return `organization_training_version_${randomUUID()}`;
}

function createDefaultAnswerPublicId(): string {
  return `organization_training_answer_${randomUUID()}`;
}
