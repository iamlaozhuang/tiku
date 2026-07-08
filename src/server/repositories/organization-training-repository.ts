import { randomUUID } from "node:crypto";

import {
  admin,
  adminAiGenerationTaskMetadata,
  adminOrganization,
  employee,
  type OrganizationTrainingAnswerItemSnapshotValue,
  type OrganizationTrainingAnswerOrganizationSnapshotValue,
  type OrganizationTrainingQuestionResultSnapshotValue,
  type OrganizationTrainingQuestionSnapshotValue,
  orgAuth,
  orgAuthOrganization,
  organization,
  organizationTrainingAnswer,
  organizationTrainingDraft,
  organizationTrainingSourceContext,
  organizationTrainingVersion,
  paper,
  paperQuestion,
} from "@/db/schema";
import { and, asc, desc, eq, inArray, sql, type SQL } from "drizzle-orm";

import type {
  EmployeeOrganizationTrainingAnswerDto,
  OrganizationTrainingAdminLifecycleSourceMetadataDto,
  OrganizationTrainingAdminPublishedVersionDetailDto,
  OrganizationTrainingAdminQuestionDetailDto,
  OrganizationTrainingDraftDto,
  OrganizationTrainingPublishedVersionDto,
  OrganizationTrainingQuestionOptionSnapshotDto,
  OrganizationTrainingQuestionSnapshotDto,
  OrganizationTrainingScopeSnapshotDto,
  OrganizationTrainingSourceContextAttachmentDto,
} from "../contracts/organization-training-contract";
import { organizationTrainingQuestionTypeValues } from "../models/organization-training";
import type {
  OrganizationTrainingEmployeeAnswerDraftWrite,
  OrganizationTrainingEmployeeAnswerSubmissionWrite,
  OrganizationTrainingManualDraftWrite,
  OrganizationTrainingPublishedVersionPersistenceWrite,
  OrganizationTrainingSourceContextWrite,
  OrganizationTrainingVersionCopyToNewDraftWrite,
  OrganizationTrainingVersionTakedownWrite,
} from "../services/organization-training-service";
import { evidenceStatusValues } from "../models/ai-rag";
import {
  mapOrganizationTrainingAnswerRowToDto,
  mapOrganizationTrainingDraftRowToDto,
  mapOrganizationTrainingSourceContextRowToDto,
  mapOrganizationTrainingVersionRowToDto,
  type OrganizationTrainingAnswerRow,
  type OrganizationTrainingDraftRow,
  type OrganizationTrainingSourceContextRow,
  type OrganizationTrainingVersionRow,
} from "../mappers/organization-training-mapper";
import {
  createLazyRuntimeDatabaseGetter,
  type RuntimeDatabase,
  type RuntimeDatabaseOptions,
} from "./runtime-database";

export type {
  OrganizationTrainingAnswerRow,
  OrganizationTrainingDraftRow,
  OrganizationTrainingSourceContextRow,
  OrganizationTrainingVersionRow,
};

export type OrganizationTrainingPublishedVersionPersistenceInput =
  OrganizationTrainingPublishedVersionPersistenceWrite;

export type OrganizationTrainingManualDraftPersistenceInput =
  OrganizationTrainingManualDraftWrite;

export type OrganizationTrainingVersionCopyToNewDraftPersistenceInput =
  OrganizationTrainingVersionCopyToNewDraftWrite;

export type OrganizationTrainingSourceContextPersistenceInput =
  OrganizationTrainingSourceContextWrite;

export type OrganizationTrainingEmployeeAnswerDraftPersistenceInput =
  OrganizationTrainingEmployeeAnswerDraftWrite;

export type OrganizationTrainingEmployeeAnswerSubmissionPersistenceInput =
  OrganizationTrainingEmployeeAnswerSubmissionWrite;

export type OrganizationTrainingVersionOrganizationLookupInput = {
  versionPublicId: string;
};

export type OrganizationTrainingAdminLifecycleListInput = {
  visibleOrganizationPublicIds: readonly string[];
};

export type OrganizationTrainingAdminLifecycleSourceMetadataListInput = {
  draftPublicIds: readonly string[];
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

export type OrganizationTrainingDraftInsertInput =
  OrganizationTrainingManualDraftPersistenceInput &
    OrganizationTrainingTrustedPersistenceLineage & {
      publicId: string;
      sourceVersionPublicId: string | null;
    };

export type OrganizationTrainingTrustedPersistenceLineage = {
  organizationId: number;
  orgAuthId: number;
};

export type OrganizationTrainingTrustedPersistenceLineageLookupInput = {
  organizationPublicId: string;
  authorizationPublicId: string;
};

export type OrganizationTrainingDraftPersistenceLineageLookupInput = {
  draftPublicId: string;
  organizationPublicId: string;
  authorizationPublicId: string;
};

export type OrganizationTrainingDraftPersistenceLineage =
  OrganizationTrainingTrustedPersistenceLineage & {
    organizationTrainingDraftId: number;
  };

export type OrganizationTrainingSourceContextInsertInput = {
  publicId: string;
  organizationTrainingDraftId: number;
  draftPublicId: string;
  organizationId: number;
  organizationPublicId: string;
  orgAuthId: number;
  authorizationSource: "org_auth";
  authorizationPublicId: string;
  sourceType: OrganizationTrainingSourceContextRow["source_type"];
  sourcePublicId: string;
  title: string;
  profession: OrganizationTrainingSourceContextRow["profession"];
  level: number;
  subject: OrganizationTrainingSourceContextRow["subject"];
  questionCount: number;
  totalScore: number;
  sourceStatus: string;
  redactionStatus: "metadata_only";
  formalUsagePolicy: OrganizationTrainingSourceContextRow["formal_usage_policy"];
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

export type OrganizationTrainingEmployeeVisibleVersionListInput = {
  employeePublicId: string;
  organizationPublicId: string;
  visibleOrganizationPublicIds?: readonly string[];
};

export type OrganizationTrainingEmployeeVisibleQuestionSnapshotSourceInput =
  OrganizationTrainingEmployeeVisibleVersionListInput;

export type OrganizationTrainingPaperQuestionSnapshotLookupInput = {
  draftPublicIds: readonly string[];
};

export type OrganizationTrainingPaperQuestionSnapshotRow = {
  trainingDraftPublicId: string;
  paperQuestionPublicId: string;
  questionSnapshot: Record<string, unknown>;
  materialSnapshot: Record<string, unknown> | null;
  score: number | string | null;
  sortOrder: number;
};

export type OrganizationTrainingVersionLookupInput = {
  trainingVersionPublicId: string;
};

export type OrganizationTrainingEmployeeAnswerLookupInput =
  OrganizationTrainingVersionLookupInput & {
    employeePublicId: string;
  };

export type OrganizationTrainingEmployeeAnswerPersistenceLineage = {
  organizationTrainingVersionId: number;
  employeeId: number;
  organizationId: number;
  organizationName: string;
  totalScore: number;
  questionSnapshot: OrganizationTrainingQuestionSnapshotValue[];
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
  answerItemSnapshot: OrganizationTrainingAnswerItemSnapshotValue[];
  questionResultSnapshot: OrganizationTrainingQuestionResultSnapshotValue[];
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
  answerItemSnapshot: OrganizationTrainingAnswerItemSnapshotValue[];
  questionResultSnapshot: OrganizationTrainingQuestionResultSnapshotValue[];
  submittedAt: string;
};

type NormalizedOrganizationTrainingEmployeeAnswerDraftInput = {
  trainingVersionPublicId: string;
  employeePublicId: string;
  organizationPublicId: string;
  answerOrganizationSnapshot: OrganizationTrainingScopeSnapshotDto;
  answerStatus: "in_progress";
  score: null;
  answerItemSnapshot: OrganizationTrainingAnswerItemSnapshotValue[];
  questionResultSnapshot: OrganizationTrainingQuestionResultSnapshotValue[];
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
  answerItemSnapshot: OrganizationTrainingAnswerItemSnapshotValue[];
  questionResultSnapshot: OrganizationTrainingQuestionResultSnapshotValue[];
  submittedAt: string;
};

export type OrganizationTrainingVersionGateway = {
  findLatestVersionNumberByDraftPublicId(
    draftPublicId: string,
  ): Promise<number | null>;
  findTrustedPersistenceLineageByPublicIds(
    input: OrganizationTrainingTrustedPersistenceLineageLookupInput,
  ): Promise<OrganizationTrainingTrustedPersistenceLineage | null>;
  findDraftPersistenceLineageByPublicIds(
    input: OrganizationTrainingDraftPersistenceLineageLookupInput,
  ): Promise<OrganizationTrainingDraftPersistenceLineage | null>;
  findVisibleOrganizationScopeSourceByAdminPublicId(
    adminPublicId: string,
  ): Promise<OrganizationTrainingVisibleOrganizationScopeSource | null>;
  findVersionOrganizationPublicIdByVersionPublicId(
    versionPublicId: string,
  ): Promise<string | null>;
  findEmployeeAnswerPersistenceLineageByPublicIds(
    input: OrganizationTrainingEmployeeAnswerPersistenceLineageLookupInput,
  ): Promise<OrganizationTrainingEmployeeAnswerPersistenceLineage | null>;
  listPublishedVersionsForEmployeeOrganization(
    input: OrganizationTrainingEmployeeVisibleVersionListInput,
  ): Promise<OrganizationTrainingVersionRow[]>;
  findPublishedVersionByPublicId(
    input: OrganizationTrainingVersionLookupInput,
  ): Promise<OrganizationTrainingVersionRow | null>;
  listPaperQuestionSnapshotsForTrainingDrafts(
    input: OrganizationTrainingPaperQuestionSnapshotLookupInput,
  ): Promise<OrganizationTrainingPaperQuestionSnapshotRow[]>;
  findVersionQuestionTypeSummaryByPublicId(
    input: OrganizationTrainingVersionLookupInput,
  ): Promise<OrganizationTrainingVersionRow["question_type_summary"] | null>;
  findEmployeeAnswerByVersionPublicId(
    input: OrganizationTrainingEmployeeAnswerLookupInput,
  ): Promise<OrganizationTrainingAnswerRow | null>;
  listAdminLifecycleDrafts(
    input: OrganizationTrainingAdminLifecycleListInput,
  ): Promise<OrganizationTrainingDraftRow[]>;
  listAdminLifecycleVersions(
    input: OrganizationTrainingAdminLifecycleListInput,
  ): Promise<OrganizationTrainingVersionRow[]>;
  listAdminLifecycleSourceMetadata(
    input: OrganizationTrainingAdminLifecycleSourceMetadataListInput,
  ): Promise<OrganizationTrainingAdminLifecycleSourceMetadataDto[]>;
  insertManualDraft(
    input: OrganizationTrainingDraftInsertInput,
  ): Promise<OrganizationTrainingDraftRow | null>;
  insertSourceContexts(
    input: OrganizationTrainingSourceContextInsertInput[],
  ): Promise<OrganizationTrainingSourceContextRow[]>;
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
  lookupVersionQuestionTypeSummary(
    input: OrganizationTrainingVersionLookupInput,
  ): Promise<OrganizationTrainingVersionRow["question_type_summary"] | null>;
  listEmployeeVisibleVersions(
    input: OrganizationTrainingEmployeeVisibleVersionListInput,
  ): Promise<OrganizationTrainingPublishedVersionDto[]>;
  listEmployeeVisibleQuestionSnapshotsForAiPaperSource(
    input: OrganizationTrainingEmployeeVisibleQuestionSnapshotSourceInput,
  ): Promise<OrganizationTrainingQuestionSnapshotValue[]>;
  findPublishedVersionByPublicId(
    input: OrganizationTrainingVersionLookupInput,
  ): Promise<OrganizationTrainingPublishedVersionDto | null>;
  findAdminPublishedVersionDetailByPublicId(
    input: OrganizationTrainingVersionLookupInput,
  ): Promise<OrganizationTrainingAdminPublishedVersionDetailDto | null>;
  findEmployeeAnswerByVersion(
    input: OrganizationTrainingEmployeeAnswerLookupInput,
  ): Promise<EmployeeOrganizationTrainingAnswerDto | null>;
  listAdminLifecycleDrafts(
    input: OrganizationTrainingAdminLifecycleListInput,
  ): Promise<OrganizationTrainingDraftDto[]>;
  listAdminLifecycleVersions(
    input: OrganizationTrainingAdminLifecycleListInput,
  ): Promise<OrganizationTrainingPublishedVersionDto[]>;
  listAdminLifecycleSourceMetadata(
    input: OrganizationTrainingAdminLifecycleSourceMetadataListInput,
  ): Promise<OrganizationTrainingAdminLifecycleSourceMetadataDto[]>;
  publishVersion(
    input: OrganizationTrainingPublishedVersionPersistenceInput,
  ): Promise<OrganizationTrainingPublishedVersionDto>;
  createManualDraft(
    input: OrganizationTrainingManualDraftPersistenceInput,
  ): Promise<OrganizationTrainingDraftDto>;
  copyVersionToNewDraft(
    input: OrganizationTrainingVersionCopyToNewDraftPersistenceInput,
  ): Promise<OrganizationTrainingDraftDto>;
  attachSourceContext(
    input: OrganizationTrainingSourceContextPersistenceInput,
  ): Promise<OrganizationTrainingSourceContextAttachmentDto>;
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
  createDraftPublicId?: () => string;
  createSourceContextPublicId?: () => string;
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
  question_snapshot: organizationTrainingVersion.question_snapshot,
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
  answer_item_snapshot: organizationTrainingAnswer.answer_item_snapshot,
  question_result_snapshot: organizationTrainingAnswer.question_result_snapshot,
  created_at: organizationTrainingAnswer.created_at,
  updated_at: organizationTrainingAnswer.updated_at,
};

const organizationTrainingDraftSelection = {
  id: organizationTrainingDraft.id,
  public_id: organizationTrainingDraft.public_id,
  source_task_public_id: organizationTrainingDraft.source_task_public_id,
  source_version_public_id: organizationTrainingDraft.source_version_public_id,
  organization_id: organizationTrainingDraft.organization_id,
  organization_public_id: organizationTrainingDraft.organization_public_id,
  org_auth_id: organizationTrainingDraft.org_auth_id,
  authorization_source: organizationTrainingDraft.authorization_source,
  authorization_public_id: organizationTrainingDraft.authorization_public_id,
  owner_type: organizationTrainingDraft.owner_type,
  owner_public_id: organizationTrainingDraft.owner_public_id,
  quota_owner_type: organizationTrainingDraft.quota_owner_type,
  quota_owner_public_id: organizationTrainingDraft.quota_owner_public_id,
  profession: organizationTrainingDraft.profession,
  level: organizationTrainingDraft.level,
  subject: organizationTrainingDraft.subject,
  title: organizationTrainingDraft.title,
  description: organizationTrainingDraft.description,
  question_count: organizationTrainingDraft.question_count,
  total_score: organizationTrainingDraft.total_score,
  question_type_summary: organizationTrainingDraft.question_type_summary,
  evidence_status: organizationTrainingDraft.evidence_status,
  validation_status: organizationTrainingDraft.validation_status,
  retention_status: organizationTrainingDraft.retention_status,
  created_at: organizationTrainingDraft.created_at,
  updated_at: organizationTrainingDraft.updated_at,
  expires_at: organizationTrainingDraft.expires_at,
};

const organizationTrainingSourceContextSelection = {
  id: organizationTrainingSourceContext.id,
  public_id: organizationTrainingSourceContext.public_id,
  organization_training_draft_id:
    organizationTrainingSourceContext.organization_training_draft_id,
  organization_training_draft_public_id:
    organizationTrainingSourceContext.organization_training_draft_public_id,
  organization_id: organizationTrainingSourceContext.organization_id,
  organization_public_id:
    organizationTrainingSourceContext.organization_public_id,
  org_auth_id: organizationTrainingSourceContext.org_auth_id,
  authorization_source: organizationTrainingSourceContext.authorization_source,
  authorization_public_id:
    organizationTrainingSourceContext.authorization_public_id,
  source_type: organizationTrainingSourceContext.source_type,
  source_public_id: organizationTrainingSourceContext.source_public_id,
  title: organizationTrainingSourceContext.title,
  profession: organizationTrainingSourceContext.profession,
  level: organizationTrainingSourceContext.level,
  subject: organizationTrainingSourceContext.subject,
  question_count: organizationTrainingSourceContext.question_count,
  total_score: organizationTrainingSourceContext.total_score,
  source_status: organizationTrainingSourceContext.source_status,
  redaction_status: organizationTrainingSourceContext.redaction_status,
  formal_usage_policy: organizationTrainingSourceContext.formal_usage_policy,
  created_at: organizationTrainingSourceContext.created_at,
  updated_at: organizationTrainingSourceContext.updated_at,
};

export function createOrganizationTrainingRepository(
  gateway: OrganizationTrainingVersionGateway,
  options: OrganizationTrainingRepositoryOptions = {},
): OrganizationTrainingRepository {
  const createDraftPublicId =
    options.createDraftPublicId ?? createDefaultDraftPublicId;
  const createSourceContextPublicId =
    options.createSourceContextPublicId ?? createDefaultSourceContextPublicId;
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

    async lookupVersionQuestionTypeSummary(input) {
      const normalizedInput = normalizeVersionLookupInput(input);

      if (normalizedInput === null) {
        return null;
      }

      return gateway.findVersionQuestionTypeSummaryByPublicId(normalizedInput);
    },

    async listEmployeeVisibleVersions(input) {
      const normalizedInput = normalizeEmployeeVisibleVersionListInput(input);

      if (normalizedInput === null) {
        return [];
      }

      const rows =
        await gateway.listPublishedVersionsForEmployeeOrganization(
          normalizedInput,
        );
      const versions = rows.map(mapOrganizationTrainingVersionRowToDto);

      return attachPaperSourceQuestionSnapshotsToVersions(versions, gateway);
    },

    async listEmployeeVisibleQuestionSnapshotsForAiPaperSource(input) {
      const normalizedInput = normalizeEmployeeVisibleVersionListInput(input);

      if (normalizedInput === null) {
        return [];
      }

      const rows =
        await gateway.listPublishedVersionsForEmployeeOrganization(
          normalizedInput,
        );

      return rows.flatMap((row) => {
        if (row.version_status !== "published" || row.taken_down_at !== null) {
          return [];
        }

        return Array.isArray(row.question_snapshot)
          ? row.question_snapshot
          : [];
      });
    },

    async findPublishedVersionByPublicId(input) {
      const normalizedInput = normalizeVersionLookupInput(input);

      if (normalizedInput === null) {
        return null;
      }

      const row = await gateway.findPublishedVersionByPublicId(normalizedInput);

      if (row === null) {
        return null;
      }

      const [version] = await attachPaperSourceQuestionSnapshotsToVersions(
        [mapOrganizationTrainingVersionRowToDto(row)],
        gateway,
      );

      return version ?? null;
    },

    async findAdminPublishedVersionDetailByPublicId(input) {
      const normalizedInput = normalizeVersionLookupInput(input);

      if (normalizedInput === null) {
        return null;
      }

      const row = await gateway.findPublishedVersionByPublicId(normalizedInput);

      return row === null
        ? null
        : mapOrganizationTrainingVersionRowToAdminDetailDto(row, gateway);
    },

    async findEmployeeAnswerByVersion(input) {
      const normalizedInput = normalizeEmployeeAnswerLookupInput(input);

      if (normalizedInput === null) {
        return null;
      }

      const row =
        await gateway.findEmployeeAnswerByVersionPublicId(normalizedInput);

      return row === null ? null : mapOrganizationTrainingAnswerRowToDto(row);
    },

    async listAdminLifecycleDrafts(input) {
      const normalizedInput = normalizeAdminLifecycleListInput(
        input.visibleOrganizationPublicIds,
      );

      if (normalizedInput === null) {
        return [];
      }

      const rows = await gateway.listAdminLifecycleDrafts({
        visibleOrganizationPublicIds: normalizedInput,
      });

      return rows.map(mapOrganizationTrainingDraftRowToDto);
    },

    async listAdminLifecycleVersions(input) {
      const normalizedInput = normalizeAdminLifecycleListInput(
        input.visibleOrganizationPublicIds,
      );

      if (normalizedInput === null) {
        return [];
      }

      const rows = await gateway.listAdminLifecycleVersions({
        visibleOrganizationPublicIds: normalizedInput,
      });

      return rows.map(mapOrganizationTrainingVersionRowToDto);
    },

    async listAdminLifecycleSourceMetadata(input) {
      const normalizedDraftPublicIds = normalizePublicIdList(
        input.draftPublicIds,
      );

      if (normalizedDraftPublicIds.length === 0) {
        return [];
      }

      return gateway.listAdminLifecycleSourceMetadata({
        draftPublicIds: normalizedDraftPublicIds,
      });
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

    async createManualDraft(input) {
      const draftInsertInput = await createManualDraftInsertInput(input, {
        gateway,
        publicId: createDraftPublicId(),
      });

      if (draftInsertInput === null) {
        throw new Error("organization training draft persistence failed.");
      }

      const row = await gateway.insertManualDraft(draftInsertInput);

      if (row === null) {
        throw new Error("organization training draft persistence failed.");
      }

      return mapOrganizationTrainingDraftRowToDto(row);
    },

    async copyVersionToNewDraft(input) {
      const draftInsertInput = await createCopyDraftInsertInput(input, {
        gateway,
        publicId: createDraftPublicId(),
      });

      if (draftInsertInput === null) {
        throw new Error("organization training draft copy persistence failed.");
      }

      const row = await gateway.insertManualDraft(draftInsertInput);

      if (row === null) {
        throw new Error("organization training draft copy persistence failed.");
      }

      return mapOrganizationTrainingDraftRowToDto(row);
    },

    async attachSourceContext(input) {
      const sourceContextInsertInputs = await createSourceContextInsertInputs(
        input,
        {
          gateway,
          createSourceContextPublicId,
        },
      );

      if (sourceContextInsertInputs === null) {
        throw new Error(
          "organization training source context persistence failed.",
        );
      }

      const rows = await gateway.insertSourceContexts(
        sourceContextInsertInputs,
      );

      if (rows.length !== sourceContextInsertInputs.length) {
        throw new Error(
          "organization training source context persistence failed.",
        );
      }

      return {
        draftPublicId: input.draftPublicId,
        organizationPublicId: input.organizationPublicId,
        sourceContexts: rows.map(mapOrganizationTrainingSourceContextRowToDto),
        redactionStatus: "metadata_only",
      };
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
    async findDraftPersistenceLineageByPublicIds(input) {
      return findDraftPersistenceLineageByPublicIds(getDatabase(), input);
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
    async listPublishedVersionsForEmployeeOrganization(input) {
      return listPublishedVersionsForEmployeeOrganization(getDatabase(), input);
    },
    async findPublishedVersionByPublicId(input) {
      return findPublishedVersionByPublicId(getDatabase(), input);
    },
    async listPaperQuestionSnapshotsForTrainingDrafts(input) {
      return listPaperQuestionSnapshotsForTrainingDrafts(getDatabase(), input);
    },
    async findVersionQuestionTypeSummaryByPublicId(input) {
      return findVersionQuestionTypeSummaryByPublicId(getDatabase(), input);
    },
    async findEmployeeAnswerByVersionPublicId(input) {
      return findEmployeeAnswerByVersionPublicId(getDatabase(), input);
    },
    async listAdminLifecycleDrafts(input) {
      return listAdminLifecycleDrafts(getDatabase(), input);
    },
    async listAdminLifecycleVersions(input) {
      return listAdminLifecycleVersions(getDatabase(), input);
    },
    async listAdminLifecycleSourceMetadata(input) {
      return listAdminLifecycleSourceMetadata(getDatabase(), input);
    },
    async insertManualDraft(input) {
      const createdAt = new Date(input.createdAt);
      const [row] = await getDatabase()
        .insert(organizationTrainingDraft)
        .values({
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
          created_at: createdAt,
          updated_at: createdAt,
          expires_at:
            input.expiresAt === null ? null : new Date(input.expiresAt),
        })
        .returning(organizationTrainingDraftSelection);

      return (row as OrganizationTrainingDraftRow | undefined) ?? null;
    },
    async insertSourceContexts(input) {
      if (input.length === 0) {
        return [];
      }

      const createdAt = new Date();
      const rows = await getDatabase()
        .insert(organizationTrainingSourceContext)
        .values(
          input.map((sourceContextInput) => ({
            public_id: sourceContextInput.publicId,
            organization_training_draft_id:
              sourceContextInput.organizationTrainingDraftId,
            organization_training_draft_public_id:
              sourceContextInput.draftPublicId,
            organization_id: sourceContextInput.organizationId,
            organization_public_id: sourceContextInput.organizationPublicId,
            org_auth_id: sourceContextInput.orgAuthId,
            authorization_source: sourceContextInput.authorizationSource,
            authorization_public_id: sourceContextInput.authorizationPublicId,
            source_type: sourceContextInput.sourceType,
            source_public_id: sourceContextInput.sourcePublicId,
            title: sourceContextInput.title,
            profession: sourceContextInput.profession,
            level: sourceContextInput.level,
            subject: sourceContextInput.subject,
            question_count: sourceContextInput.questionCount,
            total_score: String(sourceContextInput.totalScore),
            source_status: sourceContextInput.sourceStatus,
            redaction_status: sourceContextInput.redactionStatus,
            formal_usage_policy: sourceContextInput.formalUsagePolicy,
            created_at: createdAt,
            updated_at: createdAt,
          })),
        )
        .returning(organizationTrainingSourceContextSelection);

      return rows as OrganizationTrainingSourceContextRow[];
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
          question_snapshot: input.questionSnapshot,
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
          answer_item_snapshot: input.answerItemSnapshot,
          question_result_snapshot: input.questionResultSnapshot,
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
            answer_item_snapshot: input.answerItemSnapshot,
            question_result_snapshot: input.questionResultSnapshot,
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
          answer_item_snapshot: input.answerItemSnapshot,
          question_result_snapshot: input.questionResultSnapshot,
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
            answer_item_snapshot: input.answerItemSnapshot,
            question_result_snapshot: input.questionResultSnapshot,
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

function normalizeOptionalText(value: string | null): string | null {
  if (value === null) {
    return null;
  }

  const trimmedValue = value.trim();

  return trimmedValue.length > 0 ? trimmedValue : null;
}

function normalizeTextList(values: readonly string[]): string[] {
  return values
    .map((value) => normalizeRequiredText(value))
    .filter((value): value is string => value !== null);
}

async function attachPaperSourceQuestionSnapshotsToVersions(
  versions: readonly OrganizationTrainingPublishedVersionDto[],
  gateway: Pick<
    OrganizationTrainingVersionGateway,
    "listPaperQuestionSnapshotsForTrainingDrafts"
  >,
): Promise<OrganizationTrainingPublishedVersionDto[]> {
  const draftPublicIds = [
    ...new Set(
      versions
        .map((version) => normalizeRequiredText(version.draftPublicId))
        .filter((draftPublicId): draftPublicId is string => {
          return draftPublicId !== null;
        }),
    ),
  ];

  if (draftPublicIds.length === 0) {
    return [...versions];
  }

  const snapshotRows =
    await gateway.listPaperQuestionSnapshotsForTrainingDrafts({
      draftPublicIds,
    });
  const snapshotRowsByDraftPublicId = snapshotRows.reduce(
    (rowsByDraftPublicId, row) => {
      const draftPublicId = normalizeRequiredText(row.trainingDraftPublicId);

      if (draftPublicId === null) {
        return rowsByDraftPublicId;
      }

      rowsByDraftPublicId.set(draftPublicId, [
        ...(rowsByDraftPublicId.get(draftPublicId) ?? []),
        row,
      ]);

      return rowsByDraftPublicId;
    },
    new Map<string, OrganizationTrainingPaperQuestionSnapshotRow[]>(),
  );

  return versions.map((version) => {
    const rows = snapshotRowsByDraftPublicId.get(version.draftPublicId) ?? [];
    const questions = mapPaperQuestionSnapshotRowsToDto(
      rows,
      version.questionCount,
    );

    return questions.length === 0
      ? version
      : {
          ...version,
          questions,
        };
  });
}

async function mapOrganizationTrainingVersionRowToAdminDetailDto(
  row: OrganizationTrainingVersionRow,
  gateway: Pick<
    OrganizationTrainingVersionGateway,
    "listPaperQuestionSnapshotsForTrainingDrafts"
  >,
): Promise<OrganizationTrainingAdminPublishedVersionDetailDto> {
  const version = mapOrganizationTrainingVersionRowToDto(row);
  const persistedQuestions = mapQuestionSnapshotsToAdminDetail(
    Array.isArray(row.question_snapshot) ? row.question_snapshot : [],
  );

  if (persistedQuestions.length > 0) {
    return {
      ...version,
      questions: persistedQuestions,
    };
  }

  const sourceRows = await gateway.listPaperQuestionSnapshotsForTrainingDrafts({
    draftPublicIds: [version.draftPublicId],
  });

  return {
    ...version,
    questions: mapPaperQuestionSnapshotRowsToAdminDetail(
      sourceRows,
      version.questionCount,
    ),
  };
}

function mapPaperQuestionSnapshotRowsToDto(
  rows: readonly OrganizationTrainingPaperQuestionSnapshotRow[],
  maxQuestionCount: number,
): OrganizationTrainingQuestionSnapshotDto[] {
  if (!Number.isInteger(maxQuestionCount) || maxQuestionCount < 1) {
    return [];
  }

  return [...rows]
    .sort((left, right) => {
      if (left.sortOrder !== right.sortOrder) {
        return left.sortOrder - right.sortOrder;
      }

      return left.paperQuestionPublicId.localeCompare(
        right.paperQuestionPublicId,
      );
    })
    .map((row, index) => mapPaperQuestionSnapshotRowToDto(row, index + 1))
    .filter(
      (question): question is OrganizationTrainingQuestionSnapshotDto =>
        question !== null,
    )
    .slice(0, maxQuestionCount);
}

function mapPaperQuestionSnapshotRowToDto(
  row: OrganizationTrainingPaperQuestionSnapshotRow,
  sequenceNumber: number,
): OrganizationTrainingQuestionSnapshotDto | null {
  const snapshot = asRecord(row.questionSnapshot);
  const publicId =
    normalizeRequiredText(row.paperQuestionPublicId) ??
    getFirstStringField(snapshot, [
      "paperQuestionPublicId",
      "questionPublicId",
    ]);
  const questionType = getOrganizationTrainingQuestionType(
    snapshot.questionType,
  );
  const stem = getFirstStringField(snapshot, [
    "stemRichText",
    "stem",
    "questionStem",
  ]);

  if (publicId === null || questionType === null || stem === null) {
    return null;
  }

  const materialSnapshot =
    row.materialSnapshot === null ? null : asRecord(row.materialSnapshot);

  return {
    publicId,
    sequenceNumber,
    questionType,
    materialTitle:
      materialSnapshot === null
        ? null
        : getFirstStringField(materialSnapshot, ["title", "name"]),
    materialContent:
      materialSnapshot === null
        ? null
        : getFirstStringField(materialSnapshot, [
            "contentRichText",
            "content",
            "bodyRichText",
          ]),
    stem,
    options: mapQuestionOptionSnapshots(snapshot, publicId),
    score: getNonNegativeNumber(row.score ?? snapshot.score),
  };
}

function mapPaperQuestionSnapshotRowToAdminDetail(
  row: OrganizationTrainingPaperQuestionSnapshotRow,
  sequenceNumber: number,
): OrganizationTrainingAdminQuestionDetailDto | null {
  const snapshot = asRecord(row.questionSnapshot);
  const materialSnapshot =
    row.materialSnapshot === null ? null : asRecord(row.materialSnapshot);
  const detailSnapshot = {
    ...snapshot,
    publicId:
      normalizeRequiredText(row.paperQuestionPublicId) ??
      getFirstStringField(snapshot, [
        "paperQuestionPublicId",
        "questionPublicId",
      ]),
    sequenceNumber,
    materialTitle:
      materialSnapshot === null
        ? snapshot.materialTitle
        : (getFirstStringField(materialSnapshot, ["title", "name"]) ??
          snapshot.materialTitle),
    materialContent:
      materialSnapshot === null
        ? snapshot.materialContent
        : (getFirstStringField(materialSnapshot, [
            "contentRichText",
            "content",
            "bodyRichText",
          ]) ?? snapshot.materialContent),
    score: row.score ?? snapshot.score,
  };

  return mapQuestionSnapshotRecordToAdminDetail(detailSnapshot, sequenceNumber);
}

function mapPaperQuestionSnapshotRowsToAdminDetail(
  rows: readonly OrganizationTrainingPaperQuestionSnapshotRow[],
  maxQuestionCount: number,
): OrganizationTrainingAdminQuestionDetailDto[] {
  if (!Number.isInteger(maxQuestionCount) || maxQuestionCount < 1) {
    return [];
  }

  return [...rows]
    .sort((left, right) => {
      if (left.sortOrder !== right.sortOrder) {
        return left.sortOrder - right.sortOrder;
      }

      return left.paperQuestionPublicId.localeCompare(
        right.paperQuestionPublicId,
      );
    })
    .map((row, index) =>
      mapPaperQuestionSnapshotRowToAdminDetail(row, index + 1),
    )
    .filter(
      (question): question is OrganizationTrainingAdminQuestionDetailDto =>
        question !== null,
    )
    .slice(0, maxQuestionCount);
}

function mapQuestionOptionSnapshots(
  snapshot: Record<string, unknown>,
  questionPublicId: string,
): OrganizationTrainingQuestionOptionSnapshotDto[] {
  const rawOptions = Array.isArray(snapshot.questionOptions)
    ? snapshot.questionOptions
    : Array.isArray(snapshot.options)
      ? snapshot.options
      : [];

  return rawOptions
    .filter((option): option is Record<string, unknown> => isRecord(option))
    .map((option, index) => {
      const label =
        getFirstStringField(option, ["label"]) ??
        String.fromCharCode("A".charCodeAt(0) + index);
      const content =
        getFirstStringField(option, ["contentRichText", "content", "text"]) ??
        label;
      const publicId =
        getFirstStringField(option, ["publicId"]) ??
        `${questionPublicId}_option_${label}`;

      return {
        publicId,
        label,
        content,
      };
    });
}

function asRecord(value: unknown): Record<string, unknown> {
  return isRecord(value) ? value : {};
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function getFirstStringField(
  value: Record<string, unknown>,
  keys: readonly string[],
): string | null {
  for (const key of keys) {
    const field = value[key];

    if (typeof field === "string" && field.trim().length > 0) {
      return field;
    }
  }

  return null;
}

function getOrganizationTrainingQuestionType(
  value: unknown,
): OrganizationTrainingQuestionSnapshotDto["questionType"] | null {
  return typeof value === "string" &&
    (organizationTrainingQuestionTypeValues as readonly string[]).includes(
      value,
    )
    ? (value as OrganizationTrainingQuestionSnapshotDto["questionType"])
    : null;
}

function getNonNegativeNumber(value: unknown): number {
  const numberValue =
    typeof value === "number"
      ? value
      : typeof value === "string"
        ? Number(value)
        : 0;

  return Number.isFinite(numberValue) && numberValue >= 0 ? numberValue : 0;
}

function getEvidenceStatus(
  value: unknown,
): OrganizationTrainingAdminQuestionDetailDto["evidenceSummary"]["evidenceStatus"] {
  return typeof value === "string" &&
    (evidenceStatusValues as readonly string[]).includes(value)
    ? (value as OrganizationTrainingAdminQuestionDetailDto["evidenceSummary"]["evidenceStatus"])
    : "none";
}

function getNullableStringField(
  value: Record<string, unknown>,
  keys: readonly string[],
): string | null {
  return getFirstStringField(value, keys);
}

function mapQuestionSnapshotRecordToAdminDetail(
  snapshot: Record<string, unknown>,
  fallbackSequenceNumber: number,
): OrganizationTrainingAdminQuestionDetailDto | null {
  const publicId = getFirstStringField(snapshot, [
    "publicId",
    "questionPublicId",
    "paperQuestionPublicId",
  ]);
  const questionType = getOrganizationTrainingQuestionType(
    snapshot.questionType,
  );
  const stem = getFirstStringField(snapshot, [
    "stem",
    "stemRichText",
    "questionStem",
  ]);

  if (publicId === null || questionType === null || stem === null) {
    return null;
  }

  const sequenceNumber = Number.isInteger(snapshot.sequenceNumber)
    ? Number(snapshot.sequenceNumber)
    : fallbackSequenceNumber;

  return {
    publicId,
    sequenceNumber,
    questionType,
    materialTitle: getNullableStringField(snapshot, ["materialTitle"]),
    materialContent: getNullableStringField(snapshot, ["materialContent"]),
    stem,
    options: mapQuestionOptionSnapshots(snapshot, publicId),
    score: getNonNegativeNumber(snapshot.score),
    evidenceSummary: {
      evidenceStatus: getEvidenceStatus(snapshot.evidenceStatus),
      citationCount: getNonNegativeNumber(snapshot.citationCount),
    },
    answerAndAnalysis: {
      visibility: "collapsed_by_default",
      standardAnswer: getNullableStringField(snapshot, [
        "standardAnswer",
        "standard_answer",
      ]),
      analysis: getNullableStringField(snapshot, [
        "analysisSummary",
        "analysis",
      ]),
    },
  };
}

function mapQuestionSnapshotsToAdminDetail(
  snapshots: readonly unknown[],
): OrganizationTrainingAdminQuestionDetailDto[] {
  return snapshots
    .map((snapshot, index) =>
      mapQuestionSnapshotRecordToAdminDetail(asRecord(snapshot), index + 1),
    )
    .filter(
      (question): question is OrganizationTrainingAdminQuestionDetailDto =>
        question !== null,
    );
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
  persistenceLineage: OrganizationTrainingTrustedPersistenceLineage | null,
): OrganizationTrainingTrustedPersistenceLineage | null {
  if (
    persistenceLineage === null ||
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

function normalizeDraftPersistenceLineage(
  persistenceLineage: OrganizationTrainingDraftPersistenceLineage | null,
): OrganizationTrainingDraftPersistenceLineage | null {
  if (
    persistenceLineage === null ||
    !Number.isInteger(persistenceLineage.organizationTrainingDraftId) ||
    persistenceLineage.organizationTrainingDraftId < 1
  ) {
    return null;
  }

  const trustedLineage = normalizeTrustedPersistenceLineage(persistenceLineage);

  return trustedLineage === null
    ? null
    : {
        ...trustedLineage,
        organizationTrainingDraftId:
          persistenceLineage.organizationTrainingDraftId,
      };
}

function copyQuestionTypeSummary(
  summary: OrganizationTrainingVersionRow["question_type_summary"],
): OrganizationTrainingVersionRow["question_type_summary"] {
  return {
    singleChoice: summary.singleChoice,
    multiChoice: summary.multiChoice,
    trueFalse: summary.trueFalse,
    shortAnswer: summary.shortAnswer,
  };
}

function createDraftInsertInput(
  input: OrganizationTrainingManualDraftPersistenceInput,
  generated: {
    publicId: string;
    sourceVersionPublicId: string | null;
    lineage: OrganizationTrainingTrustedPersistenceLineage;
  },
): OrganizationTrainingDraftInsertInput | null {
  const publicId = normalizeRequiredText(generated.publicId);
  const sourceTaskPublicId =
    input.sourceTaskPublicId === null
      ? null
      : normalizeRequiredText(input.sourceTaskPublicId);
  const sourceVersionPublicId =
    generated.sourceVersionPublicId === null
      ? null
      : normalizeRequiredText(generated.sourceVersionPublicId);
  const organizationPublicId = normalizeRequiredText(
    input.organizationPublicId,
  );
  const authorizationPublicId = normalizeRequiredText(
    input.authorizationPublicId,
  );
  const ownerPublicId = normalizeRequiredText(input.ownerPublicId);
  const quotaOwnerPublicId = normalizeRequiredText(input.quotaOwnerPublicId);
  const title = normalizeRequiredText(input.title);
  const createdAt = normalizeRequiredText(input.createdAt);
  const description =
    input.description === null
      ? null
      : normalizeRequiredText(input.description);
  const expiresAt =
    input.expiresAt === null ? null : normalizeRequiredText(input.expiresAt);

  if (
    publicId === null ||
    organizationPublicId === null ||
    authorizationPublicId === null ||
    ownerPublicId === null ||
    quotaOwnerPublicId === null ||
    title === null ||
    createdAt === null ||
    input.contentType !== "organization_training_draft" ||
    input.ownerType !== "organization" ||
    input.quotaOwnerType !== "organization" ||
    input.authorizationSource !== "org_auth" ||
    input.questionCount < 0 ||
    input.totalScore < 0
  ) {
    return null;
  }

  return {
    ...input,
    publicId,
    sourceTaskPublicId,
    sourceVersionPublicId,
    organizationId: generated.lineage.organizationId,
    organizationPublicId,
    orgAuthId: generated.lineage.orgAuthId,
    authorizationPublicId,
    ownerPublicId,
    quotaOwnerPublicId,
    title,
    description,
    questionTypeSummary: copyQuestionTypeSummary(input.questionTypeSummary),
    createdAt,
    expiresAt,
  };
}

async function createManualDraftInsertInput(
  input: OrganizationTrainingManualDraftPersistenceInput,
  generated: {
    gateway: OrganizationTrainingVersionGateway;
    publicId: string;
  },
): Promise<OrganizationTrainingDraftInsertInput | null> {
  const lookupInput = normalizeTrustedPersistenceLineageLookupInput({
    organizationPublicId: input.organizationPublicId,
    authorizationPublicId: input.authorizationPublicId,
  });

  if (lookupInput === null) {
    return null;
  }

  const lineage = normalizeTrustedPersistenceLineage(
    await generated.gateway.findTrustedPersistenceLineageByPublicIds(
      lookupInput,
    ),
  );

  if (lineage === null) {
    return null;
  }

  return createDraftInsertInput(input, {
    publicId: generated.publicId,
    sourceVersionPublicId: null,
    lineage,
  });
}

async function createCopyDraftInsertInput(
  input: OrganizationTrainingVersionCopyToNewDraftPersistenceInput,
  generated: {
    gateway: OrganizationTrainingVersionGateway;
    publicId: string;
  },
): Promise<OrganizationTrainingDraftInsertInput | null> {
  const sourceVersionPublicId = normalizeRequiredText(
    input.sourceVersionPublicId,
  );
  const organizationPublicId = normalizeRequiredText(
    input.organizationPublicId,
  );
  const authorizationPublicId = normalizeRequiredText(
    input.authorizationPublicId,
  );
  const newDraftTitle = normalizeRequiredText(input.newDraftTitle);

  if (
    sourceVersionPublicId === null ||
    organizationPublicId === null ||
    authorizationPublicId === null ||
    newDraftTitle === null ||
    input.contentType !== "organization_training_draft" ||
    input.copyPolicy.preserveSourceVersion !== true ||
    input.copyPolicy.preservePublishScopeSnapshot !== true ||
    input.copyPolicy.createFreshDraftPublicId !== true ||
    input.sourceVersion.publicId !== sourceVersionPublicId ||
    input.sourceVersion.organizationPublicId !== organizationPublicId
  ) {
    return null;
  }

  const lookupInput = normalizeTrustedPersistenceLineageLookupInput({
    organizationPublicId,
    authorizationPublicId,
  });

  if (lookupInput === null) {
    return null;
  }

  const lineage = normalizeTrustedPersistenceLineage(
    await generated.gateway.findTrustedPersistenceLineageByPublicIds(
      lookupInput,
    ),
  );

  if (lineage === null) {
    return null;
  }

  return createDraftInsertInput(
    {
      contentType: input.contentType,
      ownerType: input.ownerType,
      ownerPublicId: input.ownerPublicId,
      quotaOwnerType: input.quotaOwnerType,
      quotaOwnerPublicId: input.quotaOwnerPublicId,
      sourceTaskPublicId: null,
      organizationPublicId,
      authorizationSource: "org_auth",
      authorizationPublicId,
      profession: input.sourceVersion.profession,
      level: input.sourceVersion.level,
      subject: input.sourceVersion.subject,
      title: newDraftTitle,
      description: input.sourceVersion.description,
      questionCount: input.sourceVersion.questionCount,
      totalScore: input.sourceVersion.totalScore,
      questionTypeSummary: copyQuestionTypeSummary(
        input.sourceQuestionTypeSummary,
      ),
      evidenceStatus: "none",
      validationStatus: "needs_review",
      retentionStatus: "active",
      createdAt: input.createdAt,
      expiresAt: null,
    },
    {
      publicId: generated.publicId,
      sourceVersionPublicId,
      lineage,
    },
  );
}

function normalizeEmployeeVisibleVersionListInput(
  input: OrganizationTrainingEmployeeVisibleVersionListInput,
): OrganizationTrainingEmployeeVisibleVersionListInput | null {
  const employeePublicId = normalizeRequiredText(input.employeePublicId);
  const organizationPublicId = normalizeRequiredText(
    input.organizationPublicId,
  );
  const visibleOrganizationPublicIds = [
    ...new Set([
      organizationPublicId,
      ...normalizeTextList(input.visibleOrganizationPublicIds ?? []),
    ]),
  ].filter((value): value is string => value !== null);

  if (
    employeePublicId === null ||
    organizationPublicId === null ||
    visibleOrganizationPublicIds.length === 0
  ) {
    return null;
  }

  return {
    employeePublicId,
    organizationPublicId,
    visibleOrganizationPublicIds,
  };
}

function normalizeAdminLifecycleListInput(
  visibleOrganizationPublicIds: readonly string[],
): string[] | null {
  const normalizedVisibleOrganizationPublicIds = [
    ...new Set(normalizeTextList(visibleOrganizationPublicIds)),
  ].filter((value): value is string => value !== null);

  return normalizedVisibleOrganizationPublicIds.length === 0
    ? null
    : normalizedVisibleOrganizationPublicIds;
}

function normalizePublicIdList(values: readonly string[]): string[] {
  return [...new Set(normalizeTextList(values))].filter(
    (value): value is string => value !== null,
  );
}

function normalizeVersionLookupInput(
  input: OrganizationTrainingVersionLookupInput,
): OrganizationTrainingVersionLookupInput | null {
  const trainingVersionPublicId = normalizeRequiredText(
    input.trainingVersionPublicId,
  );

  return trainingVersionPublicId === null
    ? null
    : {
        trainingVersionPublicId,
      };
}

function normalizeEmployeeAnswerLookupInput(
  input: OrganizationTrainingEmployeeAnswerLookupInput,
): OrganizationTrainingEmployeeAnswerLookupInput | null {
  const versionInput = normalizeVersionLookupInput(input);
  const employeePublicId = normalizeRequiredText(input.employeePublicId);

  if (versionInput === null || employeePublicId === null) {
    return null;
  }

  return {
    ...versionInput,
    employeePublicId,
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
    questionSnapshot: input.questionSnapshot.map((question) => ({
      ...question,
      options: question.options.map((option) => ({ ...option })),
    })),
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
    answerItemSnapshot: normalizedInput.answerItemSnapshot,
    questionResultSnapshot: normalizedInput.questionResultSnapshot,
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
    answerItemSnapshot: normalizedInput.answerItemSnapshot,
    questionResultSnapshot: createQuestionResultSnapshot(
      normalizedInput.answerItemSnapshot,
      lineage.questionSnapshot,
    ),
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
  const answerItemSnapshot = normalizeAnswerItemSnapshot(input.answerItems);
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
    answerItemSnapshot === null ||
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
    answerItemSnapshot,
    questionResultSnapshot: [],
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
  const answerItemSnapshot = normalizeAnswerItemSnapshot(input.answerItems);
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
    answerItemSnapshot === null ||
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
    answerItemSnapshot,
    questionResultSnapshot: [],
    submittedAt,
  };
}

function normalizeAnswerItemSnapshot(
  answerItems: OrganizationTrainingEmployeeAnswerDraftPersistenceInput["answerItems"],
): OrganizationTrainingAnswerItemSnapshotValue[] | null {
  if (!Array.isArray(answerItems)) {
    return null;
  }

  const normalizedAnswerItems = answerItems.map((answerItem) => {
    const questionPublicId = normalizeRequiredText(answerItem.questionPublicId);
    const selectedOptionPublicIds = Array.isArray(
      answerItem.selectedOptionPublicIds,
    )
      ? [
          ...new Set(
            answerItem.selectedOptionPublicIds
              .map(normalizeRequiredText)
              .filter((publicId): publicId is string => publicId !== null),
          ),
        ]
      : null;

    if (questionPublicId === null || selectedOptionPublicIds === null) {
      return null;
    }

    return {
      questionPublicId,
      selectedOptionPublicIds,
      textAnswer: normalizeOptionalText(answerItem.textAnswer),
    };
  });

  if (normalizedAnswerItems.some((answerItem) => answerItem === null)) {
    return null;
  }

  return normalizedAnswerItems as OrganizationTrainingAnswerItemSnapshotValue[];
}

function createQuestionResultSnapshot(
  answerItems: readonly OrganizationTrainingAnswerItemSnapshotValue[],
  questionSnapshot: readonly OrganizationTrainingQuestionSnapshotValue[],
): OrganizationTrainingQuestionResultSnapshotValue[] {
  const answeredQuestionPublicIds = new Set(
    answerItems.map((answerItem) => answerItem.questionPublicId),
  );

  return questionSnapshot
    .filter((question) => answeredQuestionPublicIds.has(question.publicId))
    .map((question) => ({
      questionPublicId: question.publicId,
      score: 0,
      maxScore: question.score,
      standardAnswer: question.standardAnswer,
      analysis: question.analysisSummary,
      scoringPointResults: [],
    }));
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
    questionSnapshot: Array.isArray(lineage.questionSnapshot)
      ? lineage.questionSnapshot
      : [],
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

function isSourceContextFormalUsagePolicyBlocked(
  formalUsagePolicy: OrganizationTrainingSourceContextPersistenceInput["formalUsagePolicy"],
): boolean {
  return (
    formalUsagePolicy.createFormalPaper ||
    formalUsagePolicy.createMockExam ||
    formalUsagePolicy.exposeQuestionBody ||
    formalUsagePolicy.exposeStandardAnswer ||
    formalUsagePolicy.exposeAnalysis ||
    formalUsagePolicy.exposeProviderPayload
  );
}

async function createSourceContextInsertInputs(
  input: OrganizationTrainingSourceContextPersistenceInput,
  generated: {
    gateway: OrganizationTrainingVersionGateway;
    createSourceContextPublicId: () => string;
  },
): Promise<OrganizationTrainingSourceContextInsertInput[] | null> {
  const draftPublicId = normalizeRequiredText(input.draftPublicId);
  const organizationPublicId = normalizeRequiredText(
    input.organizationPublicId,
  );
  const authorizationPublicId = normalizeRequiredText(
    input.authorizationPublicId,
  );

  if (
    draftPublicId === null ||
    organizationPublicId === null ||
    authorizationPublicId === null ||
    input.contentType !== "organization_training_source_context" ||
    input.authorizationSource !== "org_auth" ||
    input.redactionStatus !== "metadata_only" ||
    isSourceContextFormalUsagePolicyBlocked(input.formalUsagePolicy) ||
    input.sourceContexts.length === 0
  ) {
    return null;
  }

  const lineage = normalizeDraftPersistenceLineage(
    await generated.gateway.findDraftPersistenceLineageByPublicIds({
      draftPublicId,
      organizationPublicId,
      authorizationPublicId,
    }),
  );

  if (lineage === null) {
    return null;
  }

  return input.sourceContexts.map((sourceContext) => ({
    publicId: generated.createSourceContextPublicId(),
    organizationTrainingDraftId: lineage.organizationTrainingDraftId,
    draftPublicId,
    organizationId: lineage.organizationId,
    organizationPublicId,
    orgAuthId: lineage.orgAuthId,
    authorizationSource: "org_auth",
    authorizationPublicId,
    sourceType: sourceContext.sourceType,
    sourcePublicId: sourceContext.sourcePublicId,
    title: sourceContext.title,
    profession: sourceContext.profession,
    level: sourceContext.level,
    subject: sourceContext.subject,
    questionCount: sourceContext.questionCount,
    totalScore: sourceContext.totalScore,
    sourceStatus: sourceContext.sourceStatus,
    redactionStatus: "metadata_only",
    formalUsagePolicy: {
      createFormalPaper: false,
      createMockExam: false,
      exposeQuestionBody: false,
      exposeStandardAnswer: false,
      exposeAnalysis: false,
      exposeProviderPayload: false,
    },
  }));
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

async function findDraftPersistenceLineageByPublicIds(
  database: RuntimeDatabase,
  input: OrganizationTrainingDraftPersistenceLineageLookupInput,
): Promise<OrganizationTrainingDraftPersistenceLineage | null> {
  const [row] = await database
    .select({
      organization_training_draft_id: organizationTrainingDraft.id,
      organization_id: organizationTrainingDraft.organization_id,
      org_auth_id: organizationTrainingDraft.org_auth_id,
    })
    .from(organizationTrainingDraft)
    .where(
      and(
        eq(organizationTrainingDraft.public_id, input.draftPublicId),
        eq(
          organizationTrainingDraft.organization_public_id,
          input.organizationPublicId,
        ),
        eq(
          organizationTrainingDraft.authorization_public_id,
          input.authorizationPublicId,
        ),
        eq(organizationTrainingDraft.retention_status, "active"),
      ),
    )
    .limit(1);

  if (row === undefined) {
    return null;
  }

  return {
    organizationTrainingDraftId: row.organization_training_draft_id,
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

async function listPublishedVersionsForEmployeeOrganization(
  database: RuntimeDatabase,
  input: OrganizationTrainingEmployeeVisibleVersionListInput,
): Promise<OrganizationTrainingVersionRow[]> {
  const visibleOrganizationPublicIds =
    input.visibleOrganizationPublicIds?.length === undefined ||
    input.visibleOrganizationPublicIds.length === 0
      ? [input.organizationPublicId]
      : [...input.visibleOrganizationPublicIds];
  const rows = await database
    .select(organizationTrainingVersionSelection)
    .from(organizationTrainingVersion)
    .innerJoin(
      employee,
      eq(employee.organization_id, organizationTrainingVersion.organization_id),
    )
    .innerJoin(organization, eq(employee.organization_id, organization.id))
    .where(
      and(
        eq(employee.public_id, input.employeePublicId),
        eq(organization.public_id, input.organizationPublicId),
        eq(organizationTrainingVersion.version_status, "published"),
        sql`${organizationTrainingVersion.publish_scope_snapshot}->'organizationPublicIds' ?| ${createOrganizationTrainingVisibleOrganizationPublicIdArraySql(visibleOrganizationPublicIds)}`,
      ),
    )
    .orderBy(desc(organizationTrainingVersion.published_at));

  return rows as OrganizationTrainingVersionRow[];
}

export function createOrganizationTrainingVisibleOrganizationPublicIdArraySql(
  visibleOrganizationPublicIds: readonly string[],
): SQL {
  return sql`ARRAY[${sql.join(
    visibleOrganizationPublicIds.map(
      (visibleOrganizationPublicId) => sql`${visibleOrganizationPublicId}`,
    ),
    sql`, `,
  )}]::text[]`;
}

async function findPublishedVersionByPublicId(
  database: RuntimeDatabase,
  input: OrganizationTrainingVersionLookupInput,
): Promise<OrganizationTrainingVersionRow | null> {
  const [row] = await database
    .select(organizationTrainingVersionSelection)
    .from(organizationTrainingVersion)
    .where(
      eq(organizationTrainingVersion.public_id, input.trainingVersionPublicId),
    )
    .limit(1);

  return (row as OrganizationTrainingVersionRow | undefined) ?? null;
}

async function listPaperQuestionSnapshotsForTrainingDrafts(
  database: RuntimeDatabase,
  input: OrganizationTrainingPaperQuestionSnapshotLookupInput,
): Promise<OrganizationTrainingPaperQuestionSnapshotRow[]> {
  const draftPublicIds = [...new Set(normalizeTextList(input.draftPublicIds))];

  if (draftPublicIds.length === 0) {
    return [];
  }

  const rows = await database
    .select({
      training_draft_public_id:
        organizationTrainingSourceContext.organization_training_draft_public_id,
      paper_question_public_id: paperQuestion.public_id,
      question_snapshot: paperQuestion.question_snapshot,
      material_snapshot: paperQuestion.material_snapshot,
      score: paperQuestion.score,
      sort_order: paperQuestion.sort_order,
    })
    .from(organizationTrainingSourceContext)
    .innerJoin(
      paper,
      eq(organizationTrainingSourceContext.source_public_id, paper.public_id),
    )
    .innerJoin(paperQuestion, eq(paperQuestion.paper_id, paper.id))
    .where(
      and(
        inArray(
          organizationTrainingSourceContext.organization_training_draft_public_id,
          draftPublicIds,
        ),
        eq(organizationTrainingSourceContext.source_type, "paper"),
        eq(paper.paper_status, "published"),
      ),
    )
    .orderBy(
      asc(
        organizationTrainingSourceContext.organization_training_draft_public_id,
      ),
      asc(paperQuestion.sort_order),
      asc(paperQuestion.public_id),
    );

  return rows.map((row) => ({
    trainingDraftPublicId: row.training_draft_public_id,
    paperQuestionPublicId: row.paper_question_public_id,
    questionSnapshot: asRecord(row.question_snapshot),
    materialSnapshot:
      row.material_snapshot === null ? null : asRecord(row.material_snapshot),
    score: row.score,
    sortOrder: row.sort_order,
  }));
}

async function findVersionQuestionTypeSummaryByPublicId(
  database: RuntimeDatabase,
  input: OrganizationTrainingVersionLookupInput,
): Promise<OrganizationTrainingVersionRow["question_type_summary"] | null> {
  const [row] = await database
    .select({
      question_type_summary: organizationTrainingVersion.question_type_summary,
    })
    .from(organizationTrainingVersion)
    .where(
      eq(organizationTrainingVersion.public_id, input.trainingVersionPublicId),
    )
    .limit(1);

  return row?.question_type_summary ?? null;
}

async function findEmployeeAnswerByVersionPublicId(
  database: RuntimeDatabase,
  input: OrganizationTrainingEmployeeAnswerLookupInput,
): Promise<OrganizationTrainingAnswerRow | null> {
  const [row] = await database
    .select(organizationTrainingAnswerSelection)
    .from(organizationTrainingAnswer)
    .where(
      and(
        eq(
          organizationTrainingAnswer.organization_training_version_public_id,
          input.trainingVersionPublicId,
        ),
        eq(
          organizationTrainingAnswer.employee_public_id,
          input.employeePublicId,
        ),
      ),
    )
    .orderBy(desc(organizationTrainingAnswer.updated_at))
    .limit(1);

  return (row as OrganizationTrainingAnswerRow | undefined) ?? null;
}

async function listAdminLifecycleDrafts(
  database: RuntimeDatabase,
  input: OrganizationTrainingAdminLifecycleListInput,
): Promise<OrganizationTrainingDraftRow[]> {
  if (input.visibleOrganizationPublicIds.length === 0) {
    return [];
  }

  const rows = await database
    .select(organizationTrainingDraftSelection)
    .from(organizationTrainingDraft)
    .where(
      and(
        inArray(organizationTrainingDraft.organization_public_id, [
          ...input.visibleOrganizationPublicIds,
        ]),
        eq(organizationTrainingDraft.retention_status, "active"),
      ),
    )
    .orderBy(desc(organizationTrainingDraft.created_at));

  return rows as OrganizationTrainingDraftRow[];
}

async function listAdminLifecycleVersions(
  database: RuntimeDatabase,
  input: OrganizationTrainingAdminLifecycleListInput,
): Promise<OrganizationTrainingVersionRow[]> {
  if (input.visibleOrganizationPublicIds.length === 0) {
    return [];
  }

  const rows = await database
    .select(organizationTrainingVersionSelection)
    .from(organizationTrainingVersion)
    .where(
      inArray(organizationTrainingVersion.organization_public_id, [
        ...input.visibleOrganizationPublicIds,
      ]),
    )
    .orderBy(desc(organizationTrainingVersion.published_at));

  return rows as OrganizationTrainingVersionRow[];
}

async function listAdminLifecycleSourceMetadata(
  database: RuntimeDatabase,
  input: OrganizationTrainingAdminLifecycleSourceMetadataListInput,
): Promise<OrganizationTrainingAdminLifecycleSourceMetadataDto[]> {
  const draftPublicIds = normalizePublicIdList(input.draftPublicIds);

  if (draftPublicIds.length === 0) {
    return [];
  }

  const rows = await database
    .select({
      draft_public_id: organizationTrainingDraft.public_id,
      source_task_public_id: organizationTrainingDraft.source_task_public_id,
      source_version_public_id:
        organizationTrainingDraft.source_version_public_id,
      source_type: organizationTrainingSourceContext.source_type,
      generation_kind: adminAiGenerationTaskMetadata.generation_kind,
      workspace: adminAiGenerationTaskMetadata.workspace,
    })
    .from(organizationTrainingDraft)
    .leftJoin(
      organizationTrainingSourceContext,
      eq(
        organizationTrainingSourceContext.organization_training_draft_public_id,
        organizationTrainingDraft.public_id,
      ),
    )
    .leftJoin(
      adminAiGenerationTaskMetadata,
      eq(
        adminAiGenerationTaskMetadata.task_public_id,
        organizationTrainingDraft.source_task_public_id,
      ),
    )
    .where(inArray(organizationTrainingDraft.public_id, draftPublicIds));
  const metadataByDraftPublicId = new Map<
    string,
    OrganizationTrainingAdminLifecycleSourceMetadataDto
  >();

  for (const row of rows) {
    const metadata: OrganizationTrainingAdminLifecycleSourceMetadataDto = {
      draftPublicId: row.draft_public_id,
      sourceTaskPublicId: row.source_task_public_id,
      sourceVersionPublicId: row.source_version_public_id,
      sourceType: row.source_type ?? null,
      generationKind:
        row.workspace === "organization" &&
        (row.generation_kind === "question" || row.generation_kind === "paper")
          ? row.generation_kind
          : null,
      redactionStatus: "metadata_only",
    };
    const existingMetadata = metadataByDraftPublicId.get(
      metadata.draftPublicId,
    );

    if (
      existingMetadata === undefined ||
      getLifecycleSourceMetadataPriority(metadata) >
        getLifecycleSourceMetadataPriority(existingMetadata)
    ) {
      metadataByDraftPublicId.set(metadata.draftPublicId, metadata);
    }
  }

  return [...metadataByDraftPublicId.values()];
}

function getLifecycleSourceMetadataPriority(
  metadata: OrganizationTrainingAdminLifecycleSourceMetadataDto,
): number {
  if (
    metadata.sourceType === "organization_ai_result" &&
    metadata.generationKind !== null
  ) {
    return 4;
  }

  if (metadata.sourceType === "paper") {
    return 3;
  }

  if (
    metadata.sourceType === null &&
    metadata.sourceTaskPublicId === null &&
    metadata.sourceVersionPublicId === null
  ) {
    return 2;
  }

  return 1;
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
      question_snapshot: organizationTrainingVersion.question_snapshot,
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
    questionSnapshot: row.question_snapshot,
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

function createDefaultDraftPublicId(): string {
  return `organization_training_draft_${randomUUID()}`;
}

function createDefaultSourceContextPublicId(): string {
  return `organization_training_source_context_${randomUUID()}`;
}

function createDefaultAnswerPublicId(): string {
  return `organization_training_answer_${randomUUID()}`;
}
