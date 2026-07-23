import { createHash, randomUUID } from "node:crypto";

import {
  admin,
  adminAiGenerationResult,
  adminAiGenerationTaskMetadata,
  aiGenerationTask,
  adminOrganization,
  authUpgrade,
  employee,
  employeeOrgAuth,
  type OrganizationTrainingAnswerItemSnapshotValue,
  type OrganizationTrainingAnswerOrganizationSnapshotValue,
  type OrganizationTrainingQuestionResultSnapshotValue,
  type OrganizationTrainingQuestionSnapshotValue,
  orgAuth,
  organization,
  organizationTrainingAnswer,
  organizationTrainingDraft,
  organizationTrainingScoringTask,
  organizationTrainingSourceContext,
  organizationTrainingVersion,
  organizationTrainingVersionRecipient,
  paper,
  paperQuestion,
  user,
} from "@/db/schema";
import {
  and,
  asc,
  desc,
  eq,
  gt,
  inArray,
  lte,
  or,
  sql,
  type SQL,
} from "drizzle-orm";
import {
  createOrgAuthCoversOrganizationCondition,
  lockOrganizationScopeMutation,
} from "./organization-scope-query";
import { lockEmployeeIdentity } from "./employee-org-auth-quota-repository";

import type {
  EmployeeOrganizationTrainingAnswerDto,
  OrganizationTrainingAdminLifecycleSourceMetadataDto,
  OrganizationTrainingAdminLifecycleItemDto,
  OrganizationTrainingAdminLifecyclePageResult,
  OrganizationTrainingAdminPaperSectionDetailDto,
  OrganizationTrainingAdminPublishedVersionDetailDto,
  OrganizationTrainingAdminQuestionDetailDto,
  OrganizationTrainingDraftDto,
  OrganizationTrainingAiResultCopyDto,
  OrganizationTrainingPublishedVersionDto,
  OrganizationTrainingQuestionOptionSnapshotDto,
  OrganizationTrainingQuestionSnapshotDto,
  OrganizationTrainingScopeSnapshotDto,
  OrganizationTrainingSourceContextAttachmentDto,
  OrganizationTrainingVersionListReadResult,
} from "../contracts/organization-training-contract";
import type { EffectiveAuthorizationContextDto } from "../contracts/effective-authorization-contract";
import { OrganizationTrainingPersistenceConflictError } from "../contracts/organization-training-persistence-contract";
import { organizationTrainingQuestionTypeValues } from "../models/organization-training";
import type {
  OrganizationTrainingEmployeeAnswerDraftWrite,
  OrganizationTrainingEmployeeAnswerSubmissionWrite,
  OrganizationTrainingDraftSaveWrite,
  OrganizationTrainingManualDraftWrite,
  OrganizationTrainingPublishedVersionPersistenceWrite,
  OrganizationTrainingSourceContextWrite,
  OrganizationTrainingAiResultCopyWrite,
  OrganizationTrainingVersionCopyToNewDraftWrite,
  OrganizationTrainingVersionTakedownWrite,
} from "../services/organization-training-service";
import {
  resolveGenerationParametersSnapshot,
  resolveOrganizationTrainingPaperDraftSnapshot,
  resolveOrganizationTrainingQuestionDraftSnapshot,
} from "./admin-ai-generation-result-persistence-repository";
import { evidenceStatusValues } from "../models/ai-rag";
import {
  mapOrganizationTrainingAnswerRowToDto,
  mapOrganizationTrainingDraftRowToDto,
  mapOrganizationTrainingSourceContextRowToDto,
  mapOrganizationTrainingVersionRowToDto,
  tryMapOrganizationTrainingVersionRowToDto,
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

type OrganizationTrainingVersionPersistenceRow =
  OrganizationTrainingVersionRow & {
    id: number;
    recipient_snapshot_schema_version: number | null;
    recipient_snapshot_captured_at: Date | null;
    recipient_snapshot_count: number | null;
    recipient_snapshot_digest: string | null;
  };

export const ORGANIZATION_TRAINING_RECIPIENT_SNAPSHOT_SCHEMA_VERSION = 1;
const ORGANIZATION_TRAINING_RECIPIENT_PUBLIC_ID_MAX_LENGTH = 200;
const UNSAFE_RECIPIENT_PUBLIC_ID_PATTERN = /[\u0000-\u001f\u007f-\u009f]/u;

export type OrganizationTrainingRecipientSnapshotEntry = {
  employeePublicId: string;
  organizationPublicId: string;
  authorizationPublicId: string;
};

export type OrganizationTrainingRecipientSnapshot = {
  schemaVersion: typeof ORGANIZATION_TRAINING_RECIPIENT_SNAPSHOT_SCHEMA_VERSION;
  capturedAt: string;
  count: number;
  digest: string;
  recipients: OrganizationTrainingRecipientSnapshotEntry[];
};

export function createOrganizationTrainingRecipientSnapshot(input: {
  capturedAt: string;
  recipients: readonly OrganizationTrainingRecipientSnapshotEntry[];
}): OrganizationTrainingRecipientSnapshot | null {
  if (
    typeof input.capturedAt !== "string" ||
    normalizeCanonicalIsoTimestamp(input.capturedAt) === null ||
    !Array.isArray(input.recipients)
  ) {
    return null;
  }

  const recipients: OrganizationTrainingRecipientSnapshotEntry[] = [];
  const employeePublicIds = new Set<string>();
  const canonicalPublicIds = new Map<string, string>();

  for (const candidate of input.recipients) {
    const employeePublicId = normalizeRecipientPublicId(
      candidate?.employeePublicId,
    );
    const organizationPublicId = normalizeRecipientPublicId(
      candidate?.organizationPublicId,
    );
    const authorizationPublicId = normalizeRecipientPublicId(
      candidate?.authorizationPublicId,
    );

    if (
      employeePublicId === null ||
      organizationPublicId === null ||
      authorizationPublicId === null ||
      employeePublicIds.has(employeePublicId) ||
      !registerCanonicalPublicId(canonicalPublicIds, employeePublicId) ||
      !registerCanonicalPublicId(canonicalPublicIds, organizationPublicId) ||
      !registerCanonicalPublicId(canonicalPublicIds, authorizationPublicId)
    ) {
      return null;
    }

    employeePublicIds.add(employeePublicId);
    recipients.push({
      employeePublicId,
      organizationPublicId,
      authorizationPublicId,
    });
  }

  recipients.sort((left, right) =>
    compareOrdinal(left.employeePublicId, right.employeePublicId),
  );
  const canonicalBytes = JSON.stringify([
    ORGANIZATION_TRAINING_RECIPIENT_SNAPSHOT_SCHEMA_VERSION,
    recipients.map((recipient) => [
      recipient.employeePublicId,
      recipient.organizationPublicId,
      recipient.authorizationPublicId,
    ]),
  ]);

  return {
    schemaVersion: ORGANIZATION_TRAINING_RECIPIENT_SNAPSHOT_SCHEMA_VERSION,
    capturedAt: input.capturedAt,
    count: recipients.length,
    digest: createHash("sha256").update(canonicalBytes).digest("hex"),
    recipients: recipients.map((recipient) => ({ ...recipient })),
  };
}

export function validateOrganizationTrainingRecipientSnapshot(input: {
  schemaVersion: number | null;
  capturedAt: Date | string | null;
  count: number | null;
  digest: string | null;
  recipients: readonly OrganizationTrainingRecipientSnapshotEntry[];
}): OrganizationTrainingRecipientSnapshot | null {
  const capturedAt = normalizeCanonicalIsoTimestamp(input.capturedAt);

  if (
    input.schemaVersion !==
      ORGANIZATION_TRAINING_RECIPIENT_SNAPSHOT_SCHEMA_VERSION ||
    capturedAt === null ||
    !Number.isSafeInteger(input.count) ||
    input.count === null ||
    input.count < 0 ||
    typeof input.digest !== "string" ||
    !/^[0-9a-f]{64}$/u.test(input.digest)
  ) {
    return null;
  }

  const snapshot = createOrganizationTrainingRecipientSnapshot({
    capturedAt,
    recipients: input.recipients,
  });

  return snapshot !== null &&
    snapshot.count === input.count &&
    snapshot.digest === input.digest
    ? snapshot
    : null;
}

function normalizeRecipientPublicId(value: unknown): string | null {
  return typeof value === "string" &&
    value.length > 0 &&
    value.length <= ORGANIZATION_TRAINING_RECIPIENT_PUBLIC_ID_MAX_LENGTH &&
    value === value.trim() &&
    !UNSAFE_RECIPIENT_PUBLIC_ID_PATTERN.test(value)
    ? value
    : null;
}

function registerCanonicalPublicId(
  registry: Map<string, string>,
  publicId: string,
): boolean {
  const folded = publicId.toLowerCase();
  const existing = registry.get(folded);

  if (existing !== undefined && existing !== publicId) {
    return false;
  }

  registry.set(folded, publicId);
  return true;
}

function normalizeCanonicalIsoTimestamp(value: unknown): string | null {
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

function compareOrdinal(left: string, right: string): number {
  return left < right ? -1 : left > right ? 1 : 0;
}

export type OrganizationTrainingManualDraftPersistenceInput =
  OrganizationTrainingManualDraftWrite;

export type OrganizationTrainingDraftSavePersistenceInput =
  OrganizationTrainingDraftSaveWrite;

export type OrganizationTrainingVersionCopyToNewDraftPersistenceInput =
  OrganizationTrainingVersionCopyToNewDraftWrite;

export type OrganizationTrainingSourceContextPersistenceInput =
  OrganizationTrainingSourceContextWrite;

export type OrganizationTrainingAiResultCopyPersistenceInput =
  OrganizationTrainingAiResultCopyWrite;

export type OrganizationTrainingAiResultCopyPersistenceResult = {
  persistenceStatus: "created" | "reused";
  draftRow: OrganizationTrainingDraftRow;
  sourceContextRows: OrganizationTrainingSourceContextRow[];
};

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

export type OrganizationTrainingAdminLifecyclePageInput =
  OrganizationTrainingAdminLifecycleListInput & {
    page: number;
    pageSize: 20 | 50 | 100;
    status: "all" | "draft" | "published" | "taken_down";
    sourceKind: "all" | OrganizationTrainingAdminLifecycleItemDto["sourceKind"];
    contentKind:
      | "all"
      | OrganizationTrainingAdminLifecycleItemDto["contentKind"];
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

export type OrganizationAuthorizationContextLookupInput =
  OrganizationTrainingTrustedPersistenceLineageLookupInput & {
    now: Date;
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

export type OrganizationTrainingEmployeeVisibleVersionRow =
  OrganizationTrainingVersionRow & {
    organization_name?: string | null;
    employee_answer_status?:
      | EmployeeOrganizationTrainingAnswerDto["answerStatus"]
      | null;
    employee_answer_score?: number | string | null;
    employee_answer_total_score?: number | string | null;
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
  employeeOrgAuthId: number;
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
  employeeOrgAuthId: number;
  organizationId: number;
  organizationPublicId: string;
  answerOrganizationSnapshot: OrganizationTrainingAnswerOrganizationSnapshotValue;
  answerStatus: "in_progress";
  expectedRevision: number;
  operationId: string;
  payloadDigest: string;
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
  employeeOrgAuthId: number;
  organizationId: number;
  organizationPublicId: string;
  answerOrganizationSnapshot: OrganizationTrainingAnswerOrganizationSnapshotValue;
  answerStatus: "scoring" | "submitted";
  expectedRevision: number;
  operationId: string;
  payloadDigest: string;
  score: number | null;
  totalScore: number;
  answerItemSnapshot: OrganizationTrainingAnswerItemSnapshotValue[];
  questionResultSnapshot: OrganizationTrainingQuestionResultSnapshotValue[];
  submittedAt: string;
  scoringTask: OrganizationTrainingEmployeeAnswerSubmissionWrite["scoringTask"];
};

type NormalizedOrganizationTrainingEmployeeAnswerDraftInput = {
  trainingVersionPublicId: string;
  employeePublicId: string;
  organizationPublicId: string;
  answerOrganizationSnapshot: OrganizationTrainingScopeSnapshotDto;
  answerStatus: "in_progress";
  expectedRevision: number;
  operationId: string;
  payloadDigest: string;
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
  answerStatus: "scoring" | "submitted";
  expectedRevision: number;
  operationId: string;
  payloadDigest: string;
  score: number | null;
  totalScore: number;
  answerItemSnapshot: OrganizationTrainingAnswerItemSnapshotValue[];
  questionResultSnapshot: OrganizationTrainingQuestionResultSnapshotValue[];
  submittedAt: string;
  scoringTask: OrganizationTrainingEmployeeAnswerSubmissionWrite["scoringTask"];
};

export type OrganizationTrainingVersionGateway = {
  copyAiResultToTrainingDraftTransaction?(
    input: OrganizationTrainingAiResultCopyPersistenceInput,
  ): Promise<OrganizationTrainingAiResultCopyPersistenceResult | null>;
  findLatestVersionNumberByDraftPublicId(
    draftPublicId: string,
  ): Promise<number | null>;
  findTrustedPersistenceLineageByPublicIds(
    input: OrganizationTrainingTrustedPersistenceLineageLookupInput,
  ): Promise<OrganizationTrainingTrustedPersistenceLineage | null>;
  findOrganizationAuthorizationContextByPublicIds?(
    input: OrganizationAuthorizationContextLookupInput,
  ): Promise<EffectiveAuthorizationContextDto | null>;
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
  ): Promise<OrganizationTrainingEmployeeVisibleVersionRow[]>;
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
  readAdminLifecyclePage?(
    input: OrganizationTrainingAdminLifecyclePageInput,
  ): Promise<OrganizationTrainingAdminLifecyclePageResult>;
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
  saveCanonicalDraftTransaction?(
    input: OrganizationTrainingDraftSavePersistenceInput,
  ): Promise<OrganizationTrainingDraftRow | null>;
  publishCanonicalDraftTransaction?(
    input: OrganizationTrainingVersionInsertInput,
  ): Promise<OrganizationTrainingVersionRow | null>;
  saveEmployeeAnswerDraftTransaction?(
    input: OrganizationTrainingEmployeeAnswerDraftUpsertInput,
  ): Promise<OrganizationTrainingAnswerRow | null>;
  submitEmployeeAnswerTransaction?(
    input: OrganizationTrainingEmployeeAnswerSubmissionUpsertInput,
  ): Promise<OrganizationTrainingAnswerRow | null>;
};

export type OrganizationTrainingRepository = {
  copyAiResultToTrainingDraft(
    input: OrganizationTrainingAiResultCopyPersistenceInput,
  ): Promise<OrganizationTrainingAiResultCopyDto | null>;
  lookupVisibleOrganizationScope(
    input: OrganizationTrainingVisibleOrganizationScopeLookupInput,
  ): Promise<readonly string[] | null>;
  lookupTrustedPersistenceLineage(
    input: OrganizationTrainingTrustedPersistenceLineageLookupInput,
  ): Promise<OrganizationTrainingTrustedPersistenceLineage | null>;
  findOrganizationAuthorizationContext(
    input: OrganizationAuthorizationContextLookupInput,
  ): Promise<EffectiveAuthorizationContextDto | null>;
  lookupVersionOrganizationPublicId(
    input: OrganizationTrainingVersionOrganizationLookupInput,
  ): Promise<string | null>;
  lookupVersionQuestionTypeSummary(
    input: OrganizationTrainingVersionLookupInput,
  ): Promise<OrganizationTrainingVersionRow["question_type_summary"] | null>;
  listEmployeeVisibleVersions(
    input: OrganizationTrainingEmployeeVisibleVersionListInput,
  ): Promise<OrganizationTrainingPublishedVersionDto[]>;
  readEmployeeVisibleVersions(
    input: OrganizationTrainingEmployeeVisibleVersionListInput,
  ): Promise<OrganizationTrainingVersionListReadResult>;
  listEmployeeVisibleQuestionSnapshotsForAiPaperSource(
    input: OrganizationTrainingEmployeeVisibleQuestionSnapshotSourceInput,
  ): Promise<OrganizationTrainingQuestionSnapshotValue[]>;
  listAdminVisibleQuestionSnapshotsForAiPaperSource(
    input: OrganizationTrainingAdminLifecycleListInput,
  ): Promise<OrganizationTrainingQuestionSnapshotValue[]>;
  findPublishedVersionByPublicId(
    input: OrganizationTrainingVersionLookupInput,
  ): Promise<OrganizationTrainingPublishedVersionDto | null>;
  findCanonicalQuestionsByVersion(
    input: OrganizationTrainingVersionLookupInput,
  ): Promise<OrganizationTrainingQuestionSnapshotValue[]>;
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
  readAdminLifecycleVersions(
    input: OrganizationTrainingAdminLifecycleListInput,
  ): Promise<OrganizationTrainingVersionListReadResult>;
  readAdminLifecyclePage(
    input: OrganizationTrainingAdminLifecyclePageInput,
  ): Promise<OrganizationTrainingAdminLifecyclePageResult>;
  listAdminLifecycleSourceMetadata(
    input: OrganizationTrainingAdminLifecycleSourceMetadataListInput,
  ): Promise<OrganizationTrainingAdminLifecycleSourceMetadataDto[]>;
  publishVersion(
    input: OrganizationTrainingPublishedVersionPersistenceInput,
  ): Promise<OrganizationTrainingPublishedVersionDto>;
  createManualDraft(
    input: OrganizationTrainingManualDraftPersistenceInput,
  ): Promise<OrganizationTrainingDraftDto>;
  saveDraft(
    input: OrganizationTrainingDraftSavePersistenceInput,
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
  organization_training_draft_id:
    organizationTrainingVersion.organization_training_draft_id,
  draft_public_id: organizationTrainingVersion.draft_public_id,
  publish_operation_id: organizationTrainingVersion.publish_operation_id,
  publish_payload_digest: organizationTrainingVersion.publish_payload_digest,
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
  recipient_snapshot_schema_version:
    organizationTrainingVersion.recipient_snapshot_schema_version,
  recipient_snapshot_captured_at:
    organizationTrainingVersion.recipient_snapshot_captured_at,
  recipient_snapshot_count:
    organizationTrainingVersion.recipient_snapshot_count,
  recipient_snapshot_digest:
    organizationTrainingVersion.recipient_snapshot_digest,
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
  answer_deadline_at: organizationTrainingVersion.answer_deadline_at,
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
  revision: organizationTrainingAnswer.revision,
  last_operation_id: organizationTrainingAnswer.last_operation_id,
  last_payload_digest: organizationTrainingAnswer.last_payload_digest,
  submit_operation_id: organizationTrainingAnswer.submit_operation_id,
  submit_payload_digest: organizationTrainingAnswer.submit_payload_digest,
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
  draft_status: organizationTrainingDraft.draft_status,
  revision: organizationTrainingDraft.revision,
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
  question_snapshot: organizationTrainingDraft.question_snapshot,
  last_operation_id: organizationTrainingDraft.last_operation_id,
  last_payload_digest: organizationTrainingDraft.last_payload_digest,
  evidence_status: organizationTrainingDraft.evidence_status,
  validation_status: organizationTrainingDraft.validation_status,
  retention_status: organizationTrainingDraft.retention_status,
  created_at: organizationTrainingDraft.created_at,
  updated_at: organizationTrainingDraft.updated_at,
  expires_at: organizationTrainingDraft.expires_at,
  consumed_at: organizationTrainingDraft.consumed_at,
  discarded_at: organizationTrainingDraft.discarded_at,
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

  async function readEmployeeVisibleVersions(
    input: OrganizationTrainingEmployeeVisibleVersionListInput,
  ): Promise<OrganizationTrainingVersionListReadResult> {
    const normalizedInput = normalizeEmployeeVisibleVersionListInput(input);

    if (normalizedInput === null) {
      return createVersionListReadResult([], false);
    }

    const rows =
      await gateway.listPublishedVersionsForEmployeeOrganization(
        normalizedInput,
      );
    const versions = rows
      .map(tryMapEmployeeVisibleOrganizationTrainingVersionRowToDto)
      .filter(
        (version): version is OrganizationTrainingPublishedVersionDto =>
          version !== null,
      );
    const versionsWithQuestions =
      await attachPaperSourceQuestionSnapshotsToVersions(versions, gateway);

    return createVersionListReadResult(
      versionsWithQuestions,
      versions.length !== rows.length,
    );
  }

  async function readAdminLifecycleVersions(
    input: OrganizationTrainingAdminLifecycleListInput,
  ): Promise<OrganizationTrainingVersionListReadResult> {
    const normalizedInput = normalizeAdminLifecycleListInput(
      input.visibleOrganizationPublicIds,
    );

    if (normalizedInput === null) {
      return createVersionListReadResult([], false);
    }

    const rows = await gateway.listAdminLifecycleVersions({
      visibleOrganizationPublicIds: normalizedInput,
    });
    const versions = rows
      .map(tryMapOrganizationTrainingVersionRowToDto)
      .filter(
        (version): version is OrganizationTrainingPublishedVersionDto =>
          version !== null,
      );

    return createVersionListReadResult(
      versions,
      versions.length !== rows.length,
    );
  }

  return {
    async copyAiResultToTrainingDraft(input) {
      if (gateway.copyAiResultToTrainingDraftTransaction === undefined) {
        return null;
      }

      const result =
        await gateway.copyAiResultToTrainingDraftTransaction(input);

      if (result === null || result.sourceContextRows.length !== 1) {
        return null;
      }

      const draft = mapOrganizationTrainingDraftRowToDto(result.draftRow);

      return {
        persistenceStatus: result.persistenceStatus,
        draft,
        context: {
          draftPublicId: draft.publicId,
          organizationPublicId: draft.organizationPublicId,
          sourceContexts: result.sourceContextRows.map(
            mapOrganizationTrainingSourceContextRowToDto,
          ),
          redactionStatus: "metadata_only",
        },
      };
    },
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

    async findOrganizationAuthorizationContext(input) {
      if (
        gateway.findOrganizationAuthorizationContextByPublicIds === undefined
      ) {
        return null;
      }

      const organizationPublicId = normalizeRequiredText(
        input.organizationPublicId,
      );
      const authorizationPublicId = normalizeRequiredText(
        input.authorizationPublicId,
      );

      if (
        organizationPublicId === null ||
        authorizationPublicId === null ||
        !(input.now instanceof Date) ||
        !Number.isFinite(input.now.getTime())
      ) {
        return null;
      }

      return gateway.findOrganizationAuthorizationContextByPublicIds({
        organizationPublicId,
        authorizationPublicId,
        now: input.now,
      });
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
      return (await readEmployeeVisibleVersions(input)).versions;
    },

    readEmployeeVisibleVersions,

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
        if (tryMapOrganizationTrainingVersionRowToDto(row) === null) {
          return [];
        }

        if (row.version_status !== "published" || row.taken_down_at !== null) {
          return [];
        }

        return Array.isArray(row.question_snapshot)
          ? row.question_snapshot
          : [];
      });
    },

    async listAdminVisibleQuestionSnapshotsForAiPaperSource(input) {
      const normalizedInput = normalizeAdminLifecycleListInput(
        input.visibleOrganizationPublicIds,
      );

      if (normalizedInput === null) {
        return [];
      }

      const rows = await gateway.listAdminLifecycleVersions({
        visibleOrganizationPublicIds: normalizedInput,
      });

      return rows.flatMap((row) => {
        if (tryMapOrganizationTrainingVersionRowToDto(row) === null) {
          return [];
        }

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
        [mapAuthorizationScopedOrganizationTrainingVersionRowToDto(row)],
        gateway,
      );

      return version ?? null;
    },

    async findCanonicalQuestionsByVersion(input) {
      const normalizedInput = normalizeVersionLookupInput(input);

      if (normalizedInput === null) {
        return [];
      }

      const row = await gateway.findPublishedVersionByPublicId(normalizedInput);

      return row === null || !Array.isArray(row.question_snapshot)
        ? []
        : row.question_snapshot.map((question) => ({
            ...question,
            options: question.options.map((option) => ({ ...option })),
          }));
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
      return (await readAdminLifecycleVersions(input)).versions;
    },

    readAdminLifecycleVersions,

    async readAdminLifecyclePage(input) {
      const visibleOrganizationPublicIds = normalizeAdminLifecycleListInput(
        input.visibleOrganizationPublicIds,
      );

      if (visibleOrganizationPublicIds === null) {
        return {
          items: [],
          total: 0,
          integrityStatus: "complete",
          warningCode: null,
        };
      }

      if (gateway.readAdminLifecyclePage === undefined) {
        throw new Error(
          "organization training admin lifecycle page reader is unavailable.",
        );
      }

      return gateway.readAdminLifecyclePage({
        ...input,
        visibleOrganizationPublicIds,
      });
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
      if (gateway.publishCanonicalDraftTransaction === undefined) {
        throw new Error(
          "organization training canonical publish transaction unavailable.",
        );
      }

      const insertInput = createVersionInsertInput(input, {
        publicId: createVersionPublicId(),
        versionNumber: 1,
      });
      const insertedRow =
        await gateway.publishCanonicalDraftTransaction(insertInput);

      if (insertedRow === null) {
        throw new OrganizationTrainingPersistenceConflictError(
          "publish_conflict",
        );
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

    async saveDraft(input) {
      if (gateway.saveCanonicalDraftTransaction === undefined) {
        throw new Error(
          "organization training canonical draft transaction unavailable.",
        );
      }

      const row = await gateway.saveCanonicalDraftTransaction(input);

      if (row === null) {
        throw new OrganizationTrainingPersistenceConflictError(
          "draft_save_conflict",
        );
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

      if (gateway.saveEmployeeAnswerDraftTransaction === undefined) {
        throw new Error(
          "organization training answer draft transaction unavailable.",
        );
      }

      const row =
        await gateway.saveEmployeeAnswerDraftTransaction(draftUpsertInput);

      if (row === null) {
        throw new OrganizationTrainingPersistenceConflictError(
          "answer_draft_conflict",
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

      if (gateway.submitEmployeeAnswerTransaction === undefined) {
        throw new Error(
          "organization training answer submit transaction unavailable.",
        );
      }

      const row = await gateway.submitEmployeeAnswerTransaction(
        submissionUpsertInput,
      );

      if (row === null) {
        throw new OrganizationTrainingPersistenceConflictError(
          "answer_submit_conflict",
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

function mapAuthorizationScopedOrganizationTrainingVersionRowToDto(
  row: OrganizationTrainingVersionRow,
): OrganizationTrainingPublishedVersionDto {
  return {
    ...mapOrganizationTrainingVersionRowToDto(row),
    authorizationPublicId: row.authorization_public_id,
  };
}

function tryMapAuthorizationScopedOrganizationTrainingVersionRowToDto(
  row: OrganizationTrainingVersionRow,
): OrganizationTrainingPublishedVersionDto | null {
  const version = tryMapOrganizationTrainingVersionRowToDto(row);

  return version === null
    ? null
    : {
        ...version,
        authorizationPublicId: row.authorization_public_id,
      };
}

function tryMapEmployeeVisibleOrganizationTrainingVersionRowToDto(
  row: OrganizationTrainingEmployeeVisibleVersionRow,
): OrganizationTrainingPublishedVersionDto | null {
  const version =
    tryMapAuthorizationScopedOrganizationTrainingVersionRowToDto(row);

  if (version === null) {
    return null;
  }

  const score = Number(row.employee_answer_score);
  const totalScore = Number(row.employee_answer_total_score);
  const hasSubmittedStatus =
    row.employee_answer_status === "submitted" ||
    row.employee_answer_status === "read_only";
  const hasScoreSummary =
    hasSubmittedStatus &&
    row.employee_answer_score !== null &&
    row.employee_answer_score !== undefined &&
    row.employee_answer_total_score !== null &&
    row.employee_answer_total_score !== undefined &&
    Number.isFinite(score) &&
    score >= 0 &&
    Number.isFinite(totalScore) &&
    totalScore >= 0;

  return {
    ...version,
    organizationName:
      typeof row.organization_name === "string" &&
      row.organization_name.trim().length > 0
        ? row.organization_name.trim()
        : null,
    employeeAnswerStatus: row.employee_answer_status ?? "not_started",
    submittedScoreSummary: hasScoreSummary ? { score, totalScore } : null,
  };
}

function createOrganizationAiCopyHash(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

function createOrganizationAiCopyDraftPublicId(
  sourceResultPublicId: string,
): string {
  return `organization_training_draft_ai_result_${createOrganizationAiCopyHash(sourceResultPublicId).slice(0, 32)}`;
}

function createOrganizationAiCopySourceContextPublicId(
  sourceResultPublicId: string,
): string {
  return `organization_training_source_context_ai_result_${createOrganizationAiCopyHash(sourceResultPublicId).slice(0, 32)}`;
}

function createOrganizationAiCopyPayloadDigest(input: {
  sourceTaskPublicId: string;
  sourceResultPublicId: string;
  organizationPublicId: string;
  contentDigest: string;
}): string {
  return `sha256:${createOrganizationAiCopyHash(
    JSON.stringify({
      contentDigest: input.contentDigest,
      organizationPublicId: input.organizationPublicId,
      sourceResultPublicId: input.sourceResultPublicId,
      sourceTaskPublicId: input.sourceTaskPublicId,
    }),
  )}`;
}

function createOrganizationAiCopyQuestions(row: {
  workspace: string;
  generation_kind: string;
  content_redacted_snapshot: unknown;
}): OrganizationTrainingManualDraftWrite["questions"] | null {
  type CopyQuestion = OrganizationTrainingAdminQuestionDetailDto & {
    paperSectionKey?: string;
    paperSectionTitle?: string;
    paperSectionSortOrder?: number;
    questionSortOrder?: number;
  };
  const questionDraft = resolveOrganizationTrainingQuestionDraftSnapshot(row);
  const paperDraft = resolveOrganizationTrainingPaperDraftSnapshot(row);
  const sourceQuestions: CopyQuestion[] | undefined =
    row.generation_kind === "question"
      ? questionDraft?.questions
      : (paperDraft?.paperSections?.flatMap((section) =>
          section.questions.map((question, questionIndex) => ({
            ...question,
            paperSectionKey: section.sectionKey,
            paperSectionTitle: section.title,
            paperSectionSortOrder:
              (paperDraft.paperSections?.indexOf(section) ?? 0) + 1,
            questionSortOrder: questionIndex + 1,
          })),
        ) ?? paperDraft?.questions);

  if (sourceQuestions === undefined || sourceQuestions.length === 0) {
    return null;
  }

  return sourceQuestions.map((question) => ({
    publicId: question.publicId,
    sequenceNumber: question.sequenceNumber,
    questionType: question.questionType,
    ...(question.questionGroupPublicId === undefined
      ? {}
      : {
          questionGroupPublicId: question.questionGroupPublicId,
          questionGroupTitle: question.questionGroupTitle,
          questionGroupQuestionSortOrder:
            question.questionGroupQuestionSortOrder,
          questionGroupQuestionCount: question.questionGroupQuestionCount,
        }),
    ...(question.paperSectionKey !== undefined &&
    question.paperSectionTitle !== undefined &&
    question.paperSectionSortOrder !== undefined &&
    question.questionSortOrder !== undefined
      ? {
          paperSectionKey: question.paperSectionKey,
          paperSectionTitle: question.paperSectionTitle,
          paperSectionSortOrder: question.paperSectionSortOrder,
          questionSortOrder: question.questionSortOrder,
        }
      : {}),
    materialTitle: question.materialTitle,
    materialContent: question.materialContent,
    stem: question.stem,
    options: question.options,
    score: question.score,
    standardAnswer: question.answerAndAnalysis.standardAnswer ?? "",
    analysisSummary: question.answerAndAnalysis.analysis ?? "",
    evidenceStatus: question.evidenceSummary.evidenceStatus,
    citationCount: question.evidenceSummary.citationCount,
  }));
}

function createOrganizationAiCopyQuestionTypeSummary(
  questions: OrganizationTrainingManualDraftWrite["questions"],
): OrganizationTrainingManualDraftWrite["questionTypeSummary"] {
  return questions.reduce(
    (summary, question) => {
      if (question.questionType === "single_choice") summary.singleChoice += 1;
      if (question.questionType === "multi_choice") summary.multiChoice += 1;
      if (question.questionType === "true_false") summary.trueFalse += 1;
      if (question.questionType === "short_answer") summary.shortAnswer += 1;
      return summary;
    },
    { singleChoice: 0, multiChoice: 0, trueFalse: 0, shortAnswer: 0 },
  );
}

export function createPostgresOrganizationTrainingRepository(
  options: RuntimeDatabaseOptions = {},
): OrganizationTrainingRepository {
  const getDatabase = createLazyRuntimeDatabaseGetter(
    options,
    "DATABASE_URL is required for organization training publish-version persistence.",
  );

  return createOrganizationTrainingRepository({
    async copyAiResultToTrainingDraftTransaction(input) {
      return getDatabase().transaction(async (transaction) => {
        await transaction.execute(
          sql`select pg_advisory_xact_lock(hashtextextended(${`organization_ai_result_copy:${input.sourceResultPublicId}`}, 0))`,
        );

        const [result] = await transaction
          .select({
            id: adminAiGenerationResult.id,
            public_id: adminAiGenerationResult.public_id,
            ai_generation_task_id:
              adminAiGenerationResult.ai_generation_task_id,
            task_public_id: adminAiGenerationResult.task_public_id,
            request_public_id: adminAiGenerationResult.request_public_id,
            workspace: adminAiGenerationResult.workspace,
            generation_kind: adminAiGenerationResult.generation_kind,
            owner_type: adminAiGenerationResult.owner_type,
            owner_public_id: adminAiGenerationResult.owner_public_id,
            organization_public_id:
              adminAiGenerationResult.organization_public_id,
            task_type: adminAiGenerationResult.task_type,
            result_status: adminAiGenerationResult.result_status,
            content_redacted_snapshot:
              adminAiGenerationResult.content_redacted_snapshot,
            content_digest: adminAiGenerationResult.content_digest,
            content_preview_masked:
              adminAiGenerationResult.content_preview_masked,
            citation_redacted_snapshot:
              adminAiGenerationResult.citation_redacted_snapshot,
            evidence_status: adminAiGenerationResult.evidence_status,
            citation_count: adminAiGenerationResult.citation_count,
            ai_call_log_public_id:
              adminAiGenerationResult.ai_call_log_public_id,
            source_question_public_id:
              adminAiGenerationResult.source_question_public_id,
            source_paper_public_id:
              adminAiGenerationResult.source_paper_public_id,
            is_formal_adoption_blocked:
              adminAiGenerationResult.is_formal_adoption_blocked,
            created_at: adminAiGenerationResult.created_at,
            updated_at: adminAiGenerationResult.updated_at,
          })
          .from(adminAiGenerationResult)
          .where(
            eq(adminAiGenerationResult.public_id, input.sourceResultPublicId),
          )
          .limit(1)
          .for("update");

        if (
          result === undefined ||
          result.task_public_id !== input.sourceTaskPublicId ||
          result.workspace !== "organization" ||
          result.owner_type !== "organization" ||
          result.owner_public_id !== input.organizationPublicId ||
          result.organization_public_id !== input.organizationPublicId ||
          result.result_status !== "draft" ||
          result.is_formal_adoption_blocked !== true ||
          (result.generation_kind !== "question" &&
            result.generation_kind !== "paper") ||
          !/^sha256:[0-9a-f]{64}$/u.test(result.content_digest)
        ) {
          return null;
        }

        const [task] = await transaction
          .select({
            id: aiGenerationTask.id,
            public_id: aiGenerationTask.public_id,
            task_type: aiGenerationTask.task_type,
            authorization_public_id: aiGenerationTask.authorization_public_id,
            owner_type: aiGenerationTask.owner_type,
            owner_public_id: aiGenerationTask.owner_public_id,
            organization_public_id: aiGenerationTask.organization_public_id,
            effective_edition: aiGenerationTask.effective_edition,
            task_status: aiGenerationTask.task_status,
            result_public_id: aiGenerationTask.result_public_id,
            is_authorization_active: aiGenerationTask.is_authorization_active,
            is_scope_allowed: aiGenerationTask.is_scope_allowed,
          })
          .from(aiGenerationTask)
          .where(eq(aiGenerationTask.id, result.ai_generation_task_id))
          .limit(1)
          .for("update");
        const [metadata] = await transaction
          .select({
            task_public_id: adminAiGenerationTaskMetadata.task_public_id,
            workspace: adminAiGenerationTaskMetadata.workspace,
            generation_kind: adminAiGenerationTaskMetadata.generation_kind,
            runtime_bridge_status:
              adminAiGenerationTaskMetadata.runtime_bridge_status,
          })
          .from(adminAiGenerationTaskMetadata)
          .where(
            eq(
              adminAiGenerationTaskMetadata.ai_generation_task_id,
              result.ai_generation_task_id,
            ),
          )
          .limit(1);

        if (
          task === undefined ||
          metadata === undefined ||
          task.public_id !== input.sourceTaskPublicId ||
          task.task_type !== result.task_type ||
          task.owner_type !== "organization" ||
          task.owner_public_id !== input.organizationPublicId ||
          task.organization_public_id !== input.organizationPublicId ||
          task.effective_edition !== "advanced" ||
          task.task_status !== "succeeded" ||
          task.result_public_id !== input.sourceResultPublicId ||
          task.is_authorization_active !== true ||
          task.is_scope_allowed !== true ||
          metadata.task_public_id !== input.sourceTaskPublicId ||
          metadata.workspace !== "organization" ||
          metadata.generation_kind !== result.generation_kind ||
          metadata.runtime_bridge_status !== "provider_call_succeeded" ||
          (result.generation_kind === "question" &&
            result.task_type !== "ai_question_generation") ||
          (result.generation_kind === "paper" &&
            result.task_type !== "ai_paper_generation") ||
          result.evidence_status === "none" ||
          (result.evidence_status === "weak" &&
            input.weakEvidenceConfirmed !== true)
        ) {
          return null;
        }

        const snapshotRow = result;
        const generationParameters =
          resolveGenerationParametersSnapshot(snapshotRow);
        const questions = createOrganizationAiCopyQuestions(snapshotRow);

        if (
          generationParameters === null ||
          questions === null ||
          questions.length !== generationParameters.questionCount
        ) {
          return null;
        }

        const authorizationContext =
          await findOrganizationAuthorizationContextByPublicIds(transaction, {
            organizationPublicId: input.organizationPublicId,
            authorizationPublicId: task.authorization_public_id,
            now: new Date(input.copiedAt),
          });
        const lineage = await findTrustedPersistenceLineageByPublicIds(
          transaction,
          {
            organizationPublicId: input.organizationPublicId,
            authorizationPublicId: task.authorization_public_id,
          },
        );

        if (
          authorizationContext === null ||
          lineage === null ||
          authorizationContext.effectiveEdition !== "advanced" ||
          authorizationContext.capabilities.canCreateOrganizationTraining !==
            true ||
          authorizationContext.profession !== generationParameters.profession ||
          authorizationContext.level !== generationParameters.level
        ) {
          return null;
        }

        const draftPublicId = createOrganizationAiCopyDraftPublicId(
          input.sourceResultPublicId,
        );
        const operationId = `organization_ai_result_copy:${input.sourceResultPublicId}`;
        const payloadDigest = createOrganizationAiCopyPayloadDigest({
          sourceTaskPublicId: input.sourceTaskPublicId,
          sourceResultPublicId: input.sourceResultPublicId,
          organizationPublicId: input.organizationPublicId,
          contentDigest: result.content_digest,
        });
        const [existingDraft] = await transaction
          .select(organizationTrainingDraftSelection)
          .from(organizationTrainingDraft)
          .where(eq(organizationTrainingDraft.public_id, draftPublicId))
          .limit(1)
          .for("update");

        if (existingDraft !== undefined) {
          if (
            existingDraft.organization_public_id !==
              input.organizationPublicId ||
            existingDraft.source_task_public_id !== input.sourceTaskPublicId ||
            existingDraft.authorization_public_id !==
              task.authorization_public_id ||
            existingDraft.last_operation_id !== operationId ||
            existingDraft.last_payload_digest !== payloadDigest
          ) {
            return null;
          }

          const sourceContextRows = await transaction
            .select(organizationTrainingSourceContextSelection)
            .from(organizationTrainingSourceContext)
            .where(
              and(
                eq(
                  organizationTrainingSourceContext.organization_training_draft_id,
                  existingDraft.id,
                ),
                eq(
                  organizationTrainingSourceContext.source_public_id,
                  input.sourceResultPublicId,
                ),
                eq(
                  organizationTrainingSourceContext.source_type,
                  "organization_ai_result",
                ),
              ),
            );

          return sourceContextRows.length === 1
            ? {
                persistenceStatus: "reused" as const,
                draftRow: existingDraft as OrganizationTrainingDraftRow,
                sourceContextRows:
                  sourceContextRows as OrganizationTrainingSourceContextRow[],
              }
            : null;
        }

        const copiedAt = new Date(input.copiedAt);
        const paperDraft =
          resolveOrganizationTrainingPaperDraftSnapshot(snapshotRow);
        const title =
          paperDraft?.paperTitle ??
          `AI 生成${result.generation_kind === "question" ? "题目" : "试卷"}训练草稿`;
        const totalScore = questions.reduce(
          (sum, question) => sum + question.score,
          0,
        );
        const [createdDraft] = await transaction
          .insert(organizationTrainingDraft)
          .values({
            public_id: draftPublicId,
            draft_status: "draft",
            revision: 1,
            source_task_public_id: input.sourceTaskPublicId,
            source_version_public_id: null,
            organization_id: lineage.organizationId,
            organization_public_id: input.organizationPublicId,
            org_auth_id: lineage.orgAuthId,
            authorization_source: "org_auth",
            authorization_public_id: task.authorization_public_id,
            owner_type: "organization",
            owner_public_id: input.organizationPublicId,
            quota_owner_type: "organization",
            quota_owner_public_id: input.organizationPublicId,
            profession: generationParameters.profession,
            level: generationParameters.level,
            subject: generationParameters.subject,
            title,
            description:
              "由组织 AI 结果原子复制创建；发布前需编辑、预览和校验。",
            question_count: questions.length,
            total_score: String(totalScore),
            question_type_summary:
              createOrganizationAiCopyQuestionTypeSummary(questions),
            question_snapshot: questions,
            last_operation_id: operationId,
            last_payload_digest: payloadDigest,
            evidence_status: result.evidence_status,
            validation_status: "needs_review",
            retention_status: "active",
            created_at: copiedAt,
            updated_at: copiedAt,
            expires_at: null,
          })
          .returning(organizationTrainingDraftSelection);

        if (createdDraft === undefined) {
          throw new Error("organization AI result draft copy failed.");
        }

        const [createdContext] = await transaction
          .insert(organizationTrainingSourceContext)
          .values({
            public_id: createOrganizationAiCopySourceContextPublicId(
              input.sourceResultPublicId,
            ),
            organization_training_draft_id: createdDraft.id,
            organization_training_draft_public_id: createdDraft.public_id,
            organization_id: lineage.organizationId,
            organization_public_id: input.organizationPublicId,
            org_auth_id: lineage.orgAuthId,
            authorization_source: "org_auth",
            authorization_public_id: task.authorization_public_id,
            source_type: "organization_ai_result",
            source_public_id: input.sourceResultPublicId,
            title,
            profession: generationParameters.profession,
            level: generationParameters.level,
            subject: generationParameters.subject,
            question_count: questions.length,
            total_score: String(totalScore),
            source_status: `ai_generated_${result.evidence_status}_evidence`,
            redaction_status: "metadata_only",
            formal_usage_policy: {
              createFormalPaper: false,
              createMockExam: false,
              exposeQuestionBody: false,
              exposeStandardAnswer: false,
              exposeAnalysis: false,
              exposeProviderPayload: false,
            },
            created_at: copiedAt,
            updated_at: copiedAt,
          })
          .returning(organizationTrainingSourceContextSelection);

        if (createdContext === undefined) {
          throw new Error("organization AI result source context copy failed.");
        }

        return {
          persistenceStatus: "created" as const,
          draftRow: createdDraft as OrganizationTrainingDraftRow,
          sourceContextRows: [
            createdContext as OrganizationTrainingSourceContextRow,
          ],
        };
      });
    },
    async findLatestVersionNumberByDraftPublicId(draftPublicId) {
      return findLatestVersionNumberByDraftPublicId(
        getDatabase(),
        draftPublicId,
      );
    },
    async findTrustedPersistenceLineageByPublicIds(input) {
      return findTrustedPersistenceLineageByPublicIds(getDatabase(), input);
    },
    async findOrganizationAuthorizationContextByPublicIds(input) {
      return findOrganizationAuthorizationContextByPublicIds(
        getDatabase(),
        input,
      );
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
    async readAdminLifecyclePage(input) {
      return readAdminLifecyclePage(getDatabase(), input);
    },
    async listAdminLifecycleSourceMetadata(input) {
      return listAdminLifecycleSourceMetadata(getDatabase(), input);
    },
    async saveCanonicalDraftTransaction(input) {
      return getDatabase().transaction(async (transaction) => {
        // SQL invariant: lock the canonical aggregate for update before revision checks.
        const [draft] = await transaction
          .select(organizationTrainingDraftSelection)
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
            ),
          )
          .limit(1)
          .for("update");

        if (draft === undefined) {
          return null;
        }

        if (
          draft.last_operation_id === input.operationId &&
          draft.last_payload_digest === input.payloadDigest
        ) {
          return draft as OrganizationTrainingDraftRow;
        }

        if (
          draft.draft_status !== "draft" ||
          draft.revision !== input.expectedRevision
        ) {
          return null;
        }

        const [updated] = await transaction
          .update(organizationTrainingDraft)
          .set({
            revision: input.expectedRevision + 1,
            last_operation_id: input.operationId,
            last_payload_digest: input.payloadDigest,
            title: input.title,
            description: input.description,
            question_count: input.questionCount,
            total_score: String(input.totalScore),
            question_type_summary: input.questionTypeSummary,
            question_snapshot: input.questions,
            evidence_status: input.evidenceStatus,
            validation_status: input.validationStatus,
            updated_at: new Date(input.savedAt),
          })
          .where(
            and(
              eq(organizationTrainingDraft.id, draft.id),
              eq(organizationTrainingDraft.draft_status, "draft"),
              eq(organizationTrainingDraft.revision, input.expectedRevision),
            ),
          )
          .returning(organizationTrainingDraftSelection);

        return (updated as OrganizationTrainingDraftRow | undefined) ?? null;
      });
    },
    async publishCanonicalDraftTransaction(input) {
      return getDatabase().transaction(async (transaction) => {
        await lockOrganizationScopeMutation(transaction);

        // SQL invariant: canonical publish owns one draft row for update.
        const [draft] = await transaction
          .select(organizationTrainingDraftSelection)
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
            ),
          )
          .limit(1)
          .for("update");

        if (draft === undefined) {
          return null;
        }

        if (draft.draft_status === "consumed") {
          const [existingVersion] = await transaction
            .select(organizationTrainingVersionSelection)
            .from(organizationTrainingVersion)
            .where(
              and(
                eq(
                  organizationTrainingVersion.organization_training_draft_id,
                  draft.id,
                ),
                eq(
                  organizationTrainingVersion.publish_operation_id,
                  input.publishOperationId,
                ),
                eq(
                  organizationTrainingVersion.publish_payload_digest,
                  input.publishPayloadDigest,
                ),
              ),
            )
            .limit(1);

          if (existingVersion === undefined) {
            return null;
          }

          const replaySnapshot =
            await readAndValidateOrganizationTrainingRecipientSnapshot(
              transaction,
              existingVersion as OrganizationTrainingVersionPersistenceRow,
            );

          if (replaySnapshot === null) {
            throw new OrganizationTrainingPersistenceConflictError(
              "publish_conflict",
            );
          }

          return existingVersion as OrganizationTrainingVersionRow;
        }

        if (
          draft.draft_status !== "draft" ||
          draft.revision !== input.expectedDraftRevision ||
          !Array.isArray(draft.question_snapshot) ||
          draft.question_snapshot.length === 0
        ) {
          return null;
        }

        const publishedAt = new Date(input.publishedAt);
        const publishScopeOrganizationPublicIds =
          normalizeOrganizationTrainingRecipientPublishScope({
            organizationPublicId: draft.organization_public_id,
            publishedAt: input.publishedAt,
            publishScopeSnapshot: input.publishScopeSnapshot,
          });

        if (publishScopeOrganizationPublicIds === null) {
          return null;
        }

        const publisherAuthorizationRows = await transaction
          .select({ id: orgAuth.id })
          .from(orgAuth)
          .where(
            and(
              eq(orgAuth.id, draft.org_auth_id),
              eq(orgAuth.public_id, draft.authorization_public_id),
              eq(orgAuth.status, "active"),
              lte(orgAuth.starts_at, publishedAt),
              gt(orgAuth.expires_at, publishedAt),
              eq(orgAuth.profession, draft.profession),
              eq(orgAuth.level, draft.level),
              or(
                eq(orgAuth.edition, "advanced"),
                createActiveAdvancedOrgAuthUpgradeExistsSql(publishedAt),
              ),
              createOrgAuthCoversOrganizationCondition({
                authScopeType: orgAuth.auth_scope_type,
                orgAuthId: orgAuth.id,
                organizationId: draft.organization_id,
                purchaserOrganizationId: orgAuth.purchaser_organization_id,
              }),
            ),
          );

        if (publisherAuthorizationRows.length !== 1) {
          return null;
        }

        const recipientCandidateRows = await transaction
          .select({
            employeePublicId: employee.public_id,
            organizationPublicId: organization.public_id,
            authorizationPublicId: orgAuth.public_id,
          })
          .from(employeeOrgAuth)
          .innerJoin(employee, eq(employee.id, employeeOrgAuth.employee_id))
          .innerJoin(user, eq(user.id, employee.user_id))
          .innerJoin(
            organization,
            eq(organization.id, employee.organization_id),
          )
          .innerJoin(orgAuth, eq(orgAuth.id, employeeOrgAuth.org_auth_id))
          .where(
            and(
              inArray(
                organization.public_id,
                publishScopeOrganizationPublicIds,
              ),
              eq(organization.status, "active"),
              eq(user.user_type, "employee"),
              eq(user.status, "active"),
              eq(orgAuth.status, "active"),
              lte(orgAuth.starts_at, publishedAt),
              gt(orgAuth.expires_at, publishedAt),
              eq(orgAuth.profession, draft.profession),
              eq(orgAuth.level, draft.level),
              or(
                eq(orgAuth.edition, "advanced"),
                createActiveAdvancedOrgAuthUpgradeExistsSql(publishedAt),
              ),
              createOrgAuthCoversOrganizationCondition({
                authScopeType: orgAuth.auth_scope_type,
                orgAuthId: orgAuth.id,
                organizationId: employee.organization_id,
                purchaserOrganizationId: orgAuth.purchaser_organization_id,
              }),
            ),
          )
          .orderBy(asc(employee.public_id), asc(orgAuth.public_id));
        const recipientSnapshot =
          createOrganizationTrainingRecipientSnapshotFromCandidates({
            capturedAt: input.publishedAt,
            publishScopeOrganizationPublicIds,
            candidates: recipientCandidateRows,
          });

        if (recipientSnapshot === null) {
          return null;
        }

        const [version] = await transaction
          .insert(organizationTrainingVersion)
          .values({
            public_id: input.publicId,
            organization_training_draft_id: draft.id,
            draft_public_id: draft.public_id,
            publish_operation_id: input.publishOperationId,
            publish_payload_digest: input.publishPayloadDigest,
            version_number: 1,
            organization_id: draft.organization_id,
            organization_public_id: draft.organization_public_id,
            org_auth_id: draft.org_auth_id,
            authorization_source: draft.authorization_source,
            authorization_public_id: draft.authorization_public_id,
            owner_type: draft.owner_type,
            owner_public_id: draft.owner_public_id,
            quota_owner_type: draft.quota_owner_type,
            quota_owner_public_id: draft.quota_owner_public_id,
            publish_scope_snapshot: input.publishScopeSnapshot,
            recipient_snapshot_schema_version: recipientSnapshot.schemaVersion,
            recipient_snapshot_captured_at: publishedAt,
            recipient_snapshot_count: recipientSnapshot.count,
            recipient_snapshot_digest: recipientSnapshot.digest,
            profession: draft.profession,
            level: draft.level,
            subject: draft.subject,
            title: draft.title,
            description: draft.description,
            question_count: draft.question_count,
            total_score: String(draft.total_score),
            question_type_summary: draft.question_type_summary,
            question_snapshot: draft.question_snapshot,
            version_status: "published",
            published_at: publishedAt,
            answer_deadline_at:
              input.answerDeadlineAt == null
                ? null
                : new Date(input.answerDeadlineAt),
            taken_down_at: null,
            takedown_reason: null,
            created_at: publishedAt,
            updated_at: publishedAt,
          })
          .returning(organizationTrainingVersionSelection);

        if (version === undefined) {
          return null;
        }

        if (recipientSnapshot.recipients.length > 0) {
          const insertedRecipients = await transaction
            .insert(organizationTrainingVersionRecipient)
            .values(
              recipientSnapshot.recipients.map((recipient) => ({
                organization_training_version_id: version.id,
                employee_public_id: recipient.employeePublicId,
                organization_public_id: recipient.organizationPublicId,
                authorization_public_id: recipient.authorizationPublicId,
                created_at: publishedAt,
              })),
            )
            .returning({ id: organizationTrainingVersionRecipient.id });

          if (insertedRecipients.length !== recipientSnapshot.count) {
            throw new OrganizationTrainingPersistenceConflictError(
              "publish_conflict",
            );
          }
        }

        const [consumedDraft] = await transaction
          .update(organizationTrainingDraft)
          .set({
            draft_status: "consumed",
            consumed_at: publishedAt,
            updated_at: publishedAt,
          })
          .where(
            and(
              eq(organizationTrainingDraft.id, draft.id),
              eq(organizationTrainingDraft.draft_status, "draft"),
              eq(
                organizationTrainingDraft.revision,
                input.expectedDraftRevision,
              ),
            ),
          )
          .returning({ id: organizationTrainingDraft.id });

        if (consumedDraft === undefined) {
          throw new Error("organization training draft consume conflict.");
        }

        return version as OrganizationTrainingVersionRow;
      });
    },
    async saveEmployeeAnswerDraftTransaction(input) {
      return getDatabase().transaction(async (transaction) => {
        await lockEmployeeIdentity(transaction, input.employeePublicId);

        if (!(await hasCurrentEmployeeMembership(transaction, input))) {
          return null;
        }

        await transaction.execute(
          sql`select pg_advisory_xact_lock(hashtextextended(${`${input.organizationTrainingVersionId}:${input.employeeId}`}, 0))`,
        );

        const [existing] = await transaction
          .select(organizationTrainingAnswerSelection)
          .from(organizationTrainingAnswer)
          .where(
            and(
              eq(
                organizationTrainingAnswer.organization_training_version_id,
                input.organizationTrainingVersionId,
              ),
              eq(organizationTrainingAnswer.employee_id, input.employeeId),
            ),
          )
          .limit(1)
          .for("update");

        if (
          existing?.last_operation_id === input.operationId &&
          existing.last_payload_digest === input.payloadDigest
        ) {
          return existing as OrganizationTrainingAnswerRow;
        }

        if (
          (existing === undefined && input.expectedRevision !== 0) ||
          (existing !== undefined &&
            (existing.organization_training_answer_status !== "in_progress" ||
              existing.revision !== input.expectedRevision))
        ) {
          return null;
        }

        if (existing === undefined) {
          const [created] = await transaction
            .insert(organizationTrainingAnswer)
            .values({
              public_id: input.publicId,
              organization_training_version_id:
                input.organizationTrainingVersionId,
              organization_training_version_public_id:
                input.trainingVersionPublicId,
              employee_id: input.employeeId,
              employee_public_id: input.employeePublicId,
              organization_id: input.organizationId,
              organization_public_id: input.organizationPublicId,
              organization_training_answer_status: "in_progress",
              revision: 1,
              last_operation_id: input.operationId,
              last_payload_digest: input.payloadDigest,
              score: null,
              total_score: String(input.totalScore),
              submitted_at: null,
              answer_organization_snapshot: input.answerOrganizationSnapshot,
              answer_item_snapshot: input.answerItemSnapshot,
              question_result_snapshot: input.questionResultSnapshot,
              created_at: new Date(input.savedAt),
              updated_at: new Date(input.savedAt),
            })
            .returning(organizationTrainingAnswerSelection);

          return (created as OrganizationTrainingAnswerRow | undefined) ?? null;
        }

        const [updated] = await transaction
          .update(organizationTrainingAnswer)
          .set({
            revision: input.expectedRevision + 1,
            last_operation_id: input.operationId,
            last_payload_digest: input.payloadDigest,
            answer_organization_snapshot: input.answerOrganizationSnapshot,
            answer_item_snapshot: input.answerItemSnapshot,
            question_result_snapshot: input.questionResultSnapshot,
            updated_at: new Date(input.savedAt),
          })
          .where(
            and(
              eq(organizationTrainingAnswer.id, existing.id),
              eq(
                organizationTrainingAnswer.organization_training_answer_status,
                "in_progress",
              ),
              eq(organizationTrainingAnswer.revision, input.expectedRevision),
            ),
          )
          .returning(organizationTrainingAnswerSelection);

        return (updated as OrganizationTrainingAnswerRow | undefined) ?? null;
      });
    },
    async submitEmployeeAnswerTransaction(input) {
      return getDatabase().transaction(async (transaction) => {
        await lockEmployeeIdentity(transaction, input.employeePublicId);

        if (!(await hasCurrentEmployeeMembership(transaction, input))) {
          return null;
        }

        await transaction.execute(
          sql`select pg_advisory_xact_lock(hashtextextended(${`${input.organizationTrainingVersionId}:${input.employeeId}`}, 0))`,
        );

        const [existing] = await transaction
          .select(organizationTrainingAnswerSelection)
          .from(organizationTrainingAnswer)
          .where(
            and(
              eq(
                organizationTrainingAnswer.organization_training_version_id,
                input.organizationTrainingVersionId,
              ),
              eq(organizationTrainingAnswer.employee_id, input.employeeId),
            ),
          )
          .limit(1)
          .for("update");

        if (
          existing?.submit_operation_id === input.operationId &&
          existing.submit_payload_digest === input.payloadDigest
        ) {
          return existing as OrganizationTrainingAnswerRow;
        }

        if (
          (existing === undefined && input.expectedRevision !== 0) ||
          (existing !== undefined &&
            (existing.organization_training_answer_status !== "in_progress" ||
              existing.revision !== input.expectedRevision))
        ) {
          return null;
        }

        const submittedAt = new Date(input.submittedAt);
        const answerValues = {
          organization_training_answer_status: input.answerStatus,
          revision: input.expectedRevision + 1,
          last_operation_id: input.operationId,
          last_payload_digest: input.payloadDigest,
          submit_operation_id: input.operationId,
          submit_payload_digest: input.payloadDigest,
          score: input.score === null ? null : String(input.score),
          total_score: String(input.totalScore),
          submitted_at: submittedAt,
          answer_organization_snapshot: input.answerOrganizationSnapshot,
          answer_item_snapshot: input.answerItemSnapshot,
          question_result_snapshot: input.questionResultSnapshot,
          updated_at: submittedAt,
        } as const;
        const [answer] =
          existing === undefined
            ? await transaction
                .insert(organizationTrainingAnswer)
                .values({
                  public_id: input.publicId,
                  organization_training_version_id:
                    input.organizationTrainingVersionId,
                  organization_training_version_public_id:
                    input.trainingVersionPublicId,
                  employee_id: input.employeeId,
                  employee_public_id: input.employeePublicId,
                  organization_id: input.organizationId,
                  organization_public_id: input.organizationPublicId,
                  ...answerValues,
                  created_at: submittedAt,
                })
                .returning(organizationTrainingAnswerSelection)
            : await transaction
                .update(organizationTrainingAnswer)
                .set(answerValues)
                .where(
                  and(
                    eq(organizationTrainingAnswer.id, existing.id),
                    eq(
                      organizationTrainingAnswer.organization_training_answer_status,
                      "in_progress",
                    ),
                    eq(
                      organizationTrainingAnswer.revision,
                      input.expectedRevision,
                    ),
                  ),
                )
                .returning(organizationTrainingAnswerSelection);

        if (answer === undefined) {
          return null;
        }

        if (input.answerStatus === "scoring" && input.scoringTask !== null) {
          await transaction.insert(organizationTrainingScoringTask).values({
            public_id: `organization_training_scoring_task_${randomUUID()}`,
            organization_training_answer_id: answer.id,
            idempotency_key_hash: input.scoringTask.idempotencyKeyHash,
            task_status: "pending",
            attempt_count: 0,
            max_attempt_count: input.scoringTask.maxAttemptCount,
            timeout_second: input.scoringTask.timeoutSecond,
            model_config_snapshot: input.scoringTask.modelConfigSnapshot,
            prompt_template_key: input.scoringTask.promptTemplateKey,
            prompt_template_version: input.scoringTask.promptTemplateVersion,
            prompt_template_hash: input.scoringTask.promptTemplateHash,
            input_snapshot: input.scoringTask.inputSnapshot,
            authorization_snapshot: input.scoringTask.authorizationSnapshot,
            rag_snapshot: input.scoringTask.ragSnapshot,
            scheduled_at: new Date(input.scoringTask.scheduledAt),
            created_at: submittedAt,
            updated_at: submittedAt,
          });
        }

        return answer as OrganizationTrainingAnswerRow;
      });
    },
    async insertManualDraft(input) {
      const createdAt = new Date(input.createdAt);
      const [row] = await getDatabase()
        .insert(organizationTrainingDraft)
        .values({
          public_id: input.publicId,
          draft_status: input.draftStatus,
          revision: input.revision,
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
          question_snapshot: input.questions,
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
          answer_deadline_at:
            input.answerDeadlineAt == null
              ? null
              : new Date(input.answerDeadlineAt),
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

function createVersionListReadResult(
  versions: OrganizationTrainingPublishedVersionDto[],
  hasIsolatedRows: boolean,
): OrganizationTrainingVersionListReadResult {
  return {
    versions,
    integrityStatus: hasIsolatedRows ? "partial" : "complete",
    warningCode: hasIsolatedRows ? "historical_version_unavailable" : null,
  };
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
  const persistedPaperSections = mapQuestionSnapshotsToAdminPaperSections(
    Array.isArray(row.question_snapshot) ? row.question_snapshot : [],
  );

  if (persistedQuestions.length > 0) {
    return {
      ...version,
      questions: persistedQuestions,
      ...(persistedPaperSections === undefined
        ? {}
        : { paperSections: persistedPaperSections }),
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
  const questionGroupSnapshotFields = readQuestionGroupSnapshotFields(snapshot);

  if (questionGroupSnapshotFields === null) {
    return null;
  }

  return {
    publicId,
    sequenceNumber,
    questionType,
    ...questionGroupSnapshotFields,
    difficulty: getQuestionDifficulty(snapshot.difficulty),
    knowledgeNodePublicIds: getStringListField(
      snapshot,
      "knowledgeNodePublicIds",
    ),
    parentKnowledgeNodePublicIds: getStringListField(
      snapshot,
      "parentKnowledgeNodePublicIds",
    ),
    ancestorKnowledgeNodePublicIds: getStringListField(
      snapshot,
      "ancestorKnowledgeNodePublicIds",
    ),
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

function readQuestionGroupSnapshotFields(
  snapshot: Record<string, unknown>,
):
  | null
  | Record<string, never>
  | Pick<
      OrganizationTrainingAdminQuestionDetailDto,
      | "questionGroupPublicId"
      | "questionGroupTitle"
      | "questionGroupQuestionSortOrder"
      | "questionGroupQuestionCount"
    > {
  const values = [
    snapshot.questionGroupPublicId,
    snapshot.questionGroupTitle,
    snapshot.questionGroupQuestionSortOrder,
    snapshot.questionGroupQuestionCount,
  ];

  if (values.every((value) => value === null || value === undefined)) {
    return {};
  }

  const questionGroupPublicId = getFirstStringField(snapshot, [
    "questionGroupPublicId",
  ]);
  const questionGroupTitle = getFirstStringField(snapshot, [
    "questionGroupTitle",
  ]);
  const questionGroupQuestionSortOrder = getPositiveInteger(
    snapshot.questionGroupQuestionSortOrder,
  );
  const questionGroupQuestionCount = getPositiveInteger(
    snapshot.questionGroupQuestionCount,
  );

  if (
    questionGroupPublicId === null ||
    questionGroupTitle === null ||
    questionGroupQuestionSortOrder === null ||
    questionGroupQuestionCount === null ||
    questionGroupQuestionSortOrder > questionGroupQuestionCount
  ) {
    return null;
  }

  return {
    questionGroupPublicId,
    questionGroupTitle,
    questionGroupQuestionSortOrder,
    questionGroupQuestionCount,
  };
}

function getQuestionDifficulty(
  value: unknown,
): "easy" | "medium" | "hard" | null {
  return value === "easy" || value === "medium" || value === "hard"
    ? value
    : null;
}

function getStringListField(
  value: Record<string, unknown>,
  key: string,
): string[] {
  const field = value[key];

  if (
    !Array.isArray(field) ||
    field.some((item) => typeof item !== "string" || item.trim().length === 0)
  ) {
    return [];
  }

  return [...new Set(field.map((item) => item.trim()))];
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

function getPositiveInteger(value: unknown): number | null {
  const numberValue = typeof value === "number" ? value : Number(value);

  return Number.isInteger(numberValue) && numberValue > 0 ? numberValue : null;
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
  const questionGroupSnapshotFields = readQuestionGroupSnapshotFields(snapshot);

  if (questionGroupSnapshotFields === null) {
    return null;
  }

  return {
    publicId,
    sequenceNumber,
    questionType,
    ...questionGroupSnapshotFields,
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

function mapQuestionSnapshotsToAdminPaperSections(
  snapshots: readonly unknown[],
): OrganizationTrainingAdminPaperSectionDetailDto[] | undefined {
  const records = snapshots.map(asRecord);
  const metadataKeys = [
    "paperSectionKey",
    "paperSectionTitle",
    "paperSectionSortOrder",
    "questionSortOrder",
  ] as const;
  const hasStructuredSnapshot = records.some((record) =>
    metadataKeys.some(
      (key) => record[key] !== null && record[key] !== undefined,
    ),
  );

  if (!hasStructuredSnapshot) {
    return undefined;
  }

  const sectionByKey = new Map<
    string,
    {
      title: string;
      questionType: OrganizationTrainingAdminQuestionDetailDto["questionType"];
      sortOrder: number;
      questions: {
        sortOrder: number;
        detail: OrganizationTrainingAdminQuestionDetailDto;
      }[];
    }
  >();
  const sectionKeyBySortOrder = new Map<number, string>();
  const questionPublicIds = new Set<string>();

  for (const [index, snapshot] of records.entries()) {
    const detail = mapQuestionSnapshotRecordToAdminDetail(snapshot, index + 1);
    const sectionKey = getFirstStringField(snapshot, ["paperSectionKey"]);
    const sectionTitle = getFirstStringField(snapshot, ["paperSectionTitle"]);
    const sectionSortOrder = getPositiveInteger(snapshot.paperSectionSortOrder);
    const questionSortOrder = getPositiveInteger(snapshot.questionSortOrder);

    if (
      detail === null ||
      sectionKey === null ||
      sectionTitle === null ||
      sectionSortOrder === null ||
      questionSortOrder === null ||
      questionPublicIds.has(detail.publicId)
    ) {
      return undefined;
    }

    questionPublicIds.add(detail.publicId);
    const existingKey = sectionKeyBySortOrder.get(sectionSortOrder);

    if (existingKey !== undefined && existingKey !== sectionKey) {
      return undefined;
    }

    sectionKeyBySortOrder.set(sectionSortOrder, sectionKey);
    const existingSection = sectionByKey.get(sectionKey);

    if (existingSection === undefined) {
      sectionByKey.set(sectionKey, {
        title: sectionTitle,
        questionType: detail.questionType,
        sortOrder: sectionSortOrder,
        questions: [{ sortOrder: questionSortOrder, detail }],
      });
      continue;
    }

    if (
      existingSection.title !== sectionTitle ||
      existingSection.questionType !== detail.questionType ||
      existingSection.sortOrder !== sectionSortOrder ||
      existingSection.questions.some(
        (question) => question.sortOrder === questionSortOrder,
      )
    ) {
      return undefined;
    }

    existingSection.questions.push({ sortOrder: questionSortOrder, detail });
  }

  const sections = [...sectionByKey.entries()].sort(
    ([, left], [, right]) => left.sortOrder - right.sortOrder,
  );

  if (
    sections.some(([, section], index) => section.sortOrder !== index + 1) ||
    sections.some(([, section]) =>
      [...section.questions]
        .sort((left, right) => left.sortOrder - right.sortOrder)
        .some((question, index) => question.sortOrder !== index + 1),
    )
  ) {
    return undefined;
  }

  return sections.map(([sectionKey, section]) => {
    const questions = [...section.questions]
      .sort((left, right) => left.sortOrder - right.sortOrder)
      .map((question) => question.detail);

    return {
      sectionKey,
      title: section.title,
      questionType: section.questionType,
      targetQuestionCount: questions.length,
      selectedQuestionCount: questions.length,
      totalScore: questions.reduce(
        (totalScore, question) => totalScore + question.score,
        0,
      ),
      questions,
    };
  });
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
      draftStatus: "draft",
      revision: 1,
      questions: [],
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
    expectedRevision: normalizedInput.expectedRevision,
    operationId: normalizedInput.operationId,
    payloadDigest: normalizedInput.payloadDigest,
    score: normalizedInput.score,
    answerItemSnapshot: normalizedInput.answerItemSnapshot,
    questionResultSnapshot: normalizedInput.questionResultSnapshot,
    submittedAt: normalizedInput.submittedAt,
    savedAt: normalizedInput.savedAt,
    organizationTrainingVersionId: lineage.organizationTrainingVersionId,
    employeeId: lineage.employeeId,
    employeeOrgAuthId: lineage.employeeOrgAuthId,
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
    expectedRevision: normalizedInput.expectedRevision,
    operationId: normalizedInput.operationId,
    payloadDigest: normalizedInput.payloadDigest,
    score: normalizedInput.score,
    totalScore: normalizedInput.totalScore,
    answerItemSnapshot: normalizedInput.answerItemSnapshot,
    questionResultSnapshot: normalizedInput.questionResultSnapshot,
    submittedAt: normalizedInput.submittedAt,
    organizationTrainingVersionId: lineage.organizationTrainingVersionId,
    employeeId: lineage.employeeId,
    employeeOrgAuthId: lineage.employeeOrgAuthId,
    organizationId: lineage.organizationId,
    scoringTask: normalizedInput.scoringTask,
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
  const operationId = normalizeRequiredText(input.operationId);
  const payloadDigest = normalizeRequiredText(input.payloadDigest);

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
    !isNonNegativeInteger(input.expectedRevision) ||
    operationId === null ||
    payloadDigest === null ||
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
    expectedRevision: input.expectedRevision,
    operationId,
    payloadDigest,
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
  const questionResultSnapshot = normalizeQuestionResultSnapshot(
    input.questionResults,
  );
  const submittedAt = normalizeRequiredText(input.submittedAt);
  const operationId = normalizeRequiredText(input.operationId);
  const payloadDigest = normalizeRequiredText(input.payloadDigest);
  const score =
    input.scoreSummary === null
      ? null
      : normalizeNonNegativeScore(input.scoreSummary.score);
  const totalScore = normalizeNonNegativeScore(input.totalScore);

  if (
    input.contentType !== "organization_training_answer_record" ||
    (input.answerStatus !== "submitted" && input.answerStatus !== "scoring") ||
    isFormalWritePolicyBlocked(input.formalWritePolicy) ||
    trainingVersionPublicId === null ||
    employeePublicId === null ||
    organizationPublicId === null ||
    answerOrganizationSnapshot === null ||
    answerItemSnapshot === null ||
    questionResultSnapshot === null ||
    !isNonNegativeInteger(input.expectedRevision) ||
    operationId === null ||
    payloadDigest === null ||
    submittedAt === null ||
    totalScore === null ||
    (input.answerStatus === "submitted" && score === null) ||
    (input.answerStatus === "scoring" &&
      (input.scoreSummary !== null || input.scoringTask === null)) ||
    (input.answerStatus === "submitted" && input.scoringTask !== null)
  ) {
    return null;
  }

  return {
    trainingVersionPublicId,
    employeePublicId,
    organizationPublicId,
    answerOrganizationSnapshot,
    answerStatus: input.answerStatus,
    expectedRevision: input.expectedRevision,
    operationId,
    payloadDigest,
    score,
    totalScore,
    answerItemSnapshot,
    questionResultSnapshot,
    submittedAt,
    scoringTask: input.scoringTask,
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

function normalizeQuestionResultSnapshot(
  questionResults: OrganizationTrainingEmployeeAnswerSubmissionPersistenceInput["questionResults"],
): OrganizationTrainingQuestionResultSnapshotValue[] | null {
  if (!Array.isArray(questionResults)) {
    return null;
  }

  const normalized = questionResults.map((questionResult) => {
    const questionPublicId = normalizeRequiredText(
      questionResult.questionPublicId,
    );
    const score = normalizeNonNegativeScore(questionResult.score);
    const maxScore = normalizeNonNegativeScore(questionResult.maxScore);

    if (
      questionPublicId === null ||
      score === null ||
      maxScore === null ||
      score > maxScore ||
      !Array.isArray(questionResult.scoringPointResults)
    ) {
      return null;
    }

    return {
      questionPublicId,
      score,
      maxScore,
      standardAnswer: normalizeOptionalText(questionResult.standardAnswer),
      analysis: normalizeOptionalText(questionResult.analysis),
      scoringPointResults: questionResult.scoringPointResults.map(
        (scoringPointResult) => ({ ...scoringPointResult }),
      ),
    };
  });

  return normalized.some((questionResult) => questionResult === null)
    ? null
    : (normalized as OrganizationTrainingQuestionResultSnapshotValue[]);
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
    !Number.isInteger(lineage.employeeOrgAuthId) ||
    lineage.employeeOrgAuthId < 1 ||
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
    employeeOrgAuthId: lineage.employeeOrgAuthId,
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

function isNonNegativeInteger(value: number): boolean {
  return Number.isInteger(value) && value >= 0;
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
  database: Pick<RuntimeDatabase, "select">,
  input: OrganizationTrainingTrustedPersistenceLineageLookupInput,
): Promise<OrganizationTrainingTrustedPersistenceLineage | null> {
  const now = new Date();
  const activeUpgradeExists = createActiveAdvancedOrgAuthUpgradeExistsSql(now);
  const [row] = await database
    .select({
      organization_id: organization.id,
      org_auth_id: orgAuth.id,
    })
    .from(orgAuth)
    .innerJoin(
      organization,
      createOrgAuthCoversOrganizationCondition({
        authScopeType: orgAuth.auth_scope_type,
        orgAuthId: orgAuth.id,
        organizationId: organization.id,
        purchaserOrganizationId: orgAuth.purchaser_organization_id,
      }),
    )
    .where(
      and(
        eq(organization.public_id, input.organizationPublicId),
        eq(organization.status, "active"),
        eq(orgAuth.public_id, input.authorizationPublicId),
        eq(orgAuth.status, "active"),
        lte(orgAuth.starts_at, now),
        gt(orgAuth.expires_at, now),
        or(eq(orgAuth.edition, "advanced"), activeUpgradeExists),
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

async function findOrganizationAuthorizationContextByPublicIds(
  database: Pick<RuntimeDatabase, "select">,
  input: OrganizationAuthorizationContextLookupInput,
): Promise<EffectiveAuthorizationContextDto | null> {
  const activeUpgradeExists = createActiveAdvancedOrgAuthUpgradeExistsSql(
    input.now,
  );
  const [row] = await database
    .select({
      authorization_public_id: orgAuth.public_id,
      edition: orgAuth.edition,
      expires_at: orgAuth.expires_at,
      level: orgAuth.level,
      organization_public_id: organization.public_id,
      profession: orgAuth.profession,
    })
    .from(orgAuth)
    .innerJoin(
      organization,
      createOrgAuthCoversOrganizationCondition({
        authScopeType: orgAuth.auth_scope_type,
        orgAuthId: orgAuth.id,
        organizationId: organization.id,
        purchaserOrganizationId: orgAuth.purchaser_organization_id,
      }),
    )
    .where(
      and(
        eq(organization.public_id, input.organizationPublicId),
        eq(organization.status, "active"),
        eq(orgAuth.public_id, input.authorizationPublicId),
        eq(orgAuth.status, "active"),
        lte(orgAuth.starts_at, input.now),
        gt(orgAuth.expires_at, input.now),
        or(eq(orgAuth.edition, "advanced"), activeUpgradeExists),
      ),
    )
    .limit(1);

  if (row === undefined) {
    return null;
  }

  return {
    profession: row.profession,
    level: row.level,
    contextDisplayStatus: "display_only",
    edition: row.edition,
    effectiveEdition: "advanced",
    upgradeStatus: row.edition === "advanced" ? "none" : "active",
    expiresAt: row.expires_at.toISOString(),
    displayStatus: "active",
    authorizationSource: "org_auth",
    authorizationPublicId: row.authorization_public_id,
    ownerType: "organization",
    ownerPublicId: row.organization_public_id,
    organizationPublicId: row.organization_public_id,
    quotaOwnerType: "organization",
    quotaOwnerPublicId: row.organization_public_id,
    capabilities: {
      canGenerateAiQuestion: true,
      canGenerateAiPaper: true,
      canCreateOrganizationTraining: true,
      canAnswerOrganizationTraining: true,
      canViewOrganizationTrainingSummary: true,
      canManageAuthorizationQuota: false,
    },
    blockedReason: null,
  };
}

function createActiveAdvancedOrgAuthUpgradeExistsSql(now: Date): SQL {
  return sql<boolean>`exists (
    select 1
    from ${authUpgrade}
    where ${authUpgrade.org_auth_id} = ${orgAuth.id}
      and ${authUpgrade.status} = 'active'
      and ${authUpgrade.target_edition} = 'advanced'
      and ${authUpgrade.revoked_at} is null
      and ${authUpgrade.starts_at} <= ${now}
      and ${authUpgrade.expires_at} > ${now}
  )`;
}

function createOrganizationTrainingRecipientOrLegacyAuthorizationCondition(): SQL<boolean> {
  return sql<boolean>`(
    (
      ${organizationTrainingVersion.recipient_snapshot_schema_version} = ${ORGANIZATION_TRAINING_RECIPIENT_SNAPSHOT_SCHEMA_VERSION}
      and ${organizationTrainingVersion.recipient_snapshot_captured_at} is not null
      and ${organizationTrainingVersion.recipient_snapshot_count} is not null
      and ${organizationTrainingVersion.recipient_snapshot_digest} is not null
      and ${organizationTrainingVersionRecipient.employee_public_id} = ${employee.public_id}
      and ${organizationTrainingVersionRecipient.organization_public_id} = ${organization.public_id}
      and ${organizationTrainingVersionRecipient.authorization_public_id} = ${orgAuth.public_id}
    )
    or
    (
      ${organizationTrainingVersion.recipient_snapshot_schema_version} is null
      and ${organizationTrainingVersion.recipient_snapshot_captured_at} is null
      and ${organizationTrainingVersion.recipient_snapshot_count} is null
      and ${organizationTrainingVersion.recipient_snapshot_digest} is null
      and ${employee.organization_id} = ${organizationTrainingVersion.organization_id}
      and ${employeeOrgAuth.org_auth_id} = ${organizationTrainingVersion.org_auth_id}
    )
  )`;
}

export function createOrganizationTrainingRecipientSnapshotFromCandidates(input: {
  capturedAt: string;
  publishScopeOrganizationPublicIds: readonly string[];
  candidates: readonly OrganizationTrainingRecipientSnapshotEntry[];
}): OrganizationTrainingRecipientSnapshot | null {
  const scopePublicIds = new Set(input.publishScopeOrganizationPublicIds);

  if (
    scopePublicIds.size !== input.publishScopeOrganizationPublicIds.length ||
    input.candidates.some(
      (candidate) => !scopePublicIds.has(candidate.organizationPublicId),
    )
  ) {
    return null;
  }

  return createOrganizationTrainingRecipientSnapshot({
    capturedAt: input.capturedAt,
    recipients: input.candidates,
  });
}

function normalizeOrganizationTrainingRecipientPublishScope(input: {
  organizationPublicId: string;
  publishedAt: string;
  publishScopeSnapshot: {
    organizationPublicIds: readonly string[];
    capturedAt: string;
  };
}): string[] | null {
  if (
    normalizeCanonicalIsoTimestamp(input.publishedAt) === null ||
    input.publishScopeSnapshot.capturedAt !== input.publishedAt ||
    !Array.isArray(input.publishScopeSnapshot.organizationPublicIds)
  ) {
    return null;
  }

  const publicIds: string[] = [];
  const canonicalPublicIds = new Map<string, string>();

  for (const candidate of input.publishScopeSnapshot.organizationPublicIds) {
    const publicId = normalizeRecipientPublicId(candidate);

    if (
      publicId === null ||
      publicIds.includes(publicId) ||
      !registerCanonicalPublicId(canonicalPublicIds, publicId)
    ) {
      return null;
    }

    publicIds.push(publicId);
  }

  return publicIds.length > 0 && publicIds.includes(input.organizationPublicId)
    ? publicIds
    : null;
}

async function readAndValidateOrganizationTrainingRecipientSnapshot(
  database: RuntimeDatabase,
  version: OrganizationTrainingVersionPersistenceRow,
): Promise<OrganizationTrainingRecipientSnapshot | null> {
  const recipientRows = await database
    .select({
      employeePublicId: organizationTrainingVersionRecipient.employee_public_id,
      organizationPublicId:
        organizationTrainingVersionRecipient.organization_public_id,
      authorizationPublicId:
        organizationTrainingVersionRecipient.authorization_public_id,
    })
    .from(organizationTrainingVersionRecipient)
    .where(
      eq(
        organizationTrainingVersionRecipient.organization_training_version_id,
        version.id,
      ),
    )
    .orderBy(asc(organizationTrainingVersionRecipient.employee_public_id));

  return validateOrganizationTrainingRecipientSnapshot({
    schemaVersion: version.recipient_snapshot_schema_version,
    capturedAt: version.recipient_snapshot_captured_at,
    count: version.recipient_snapshot_count,
    digest: version.recipient_snapshot_digest,
    recipients: recipientRows,
  });
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
): Promise<OrganizationTrainingEmployeeVisibleVersionRow[]> {
  const now = new Date();
  const activeUpgradeExists = createActiveAdvancedOrgAuthUpgradeExistsSql(now);
  const visibleOrganizationPublicIds =
    input.visibleOrganizationPublicIds?.length === undefined ||
    input.visibleOrganizationPublicIds.length === 0
      ? [input.organizationPublicId]
      : [...input.visibleOrganizationPublicIds];
  const rows = await database
    .select({
      ...organizationTrainingVersionSelection,
      organization_name: organization.name,
      employee_answer_status:
        organizationTrainingAnswer.organization_training_answer_status,
      employee_answer_score: organizationTrainingAnswer.score,
      employee_answer_total_score: organizationTrainingAnswer.total_score,
    })
    .from(organizationTrainingVersion)
    .innerJoin(employee, eq(employee.public_id, input.employeePublicId))
    .innerJoin(user, eq(user.id, employee.user_id))
    .innerJoin(
      employeeOrgAuth,
      and(eq(employeeOrgAuth.employee_id, employee.id)),
    )
    .innerJoin(orgAuth, eq(orgAuth.id, employeeOrgAuth.org_auth_id))
    .innerJoin(organization, eq(employee.organization_id, organization.id))
    .leftJoin(
      organizationTrainingVersionRecipient,
      and(
        eq(
          organizationTrainingVersionRecipient.organization_training_version_id,
          organizationTrainingVersion.id,
        ),
        eq(
          organizationTrainingVersionRecipient.employee_public_id,
          employee.public_id,
        ),
        eq(
          organizationTrainingVersionRecipient.organization_public_id,
          organization.public_id,
        ),
      ),
    )
    .leftJoin(
      organizationTrainingAnswer,
      and(
        eq(
          organizationTrainingAnswer.organization_training_version_id,
          organizationTrainingVersion.id,
        ),
        eq(organizationTrainingAnswer.employee_id, employee.id),
      ),
    )
    .where(
      and(
        eq(employee.public_id, input.employeePublicId),
        eq(user.user_type, "employee"),
        eq(user.status, "active"),
        eq(organization.public_id, input.organizationPublicId),
        eq(organization.status, "active"),
        eq(orgAuth.status, "active"),
        lte(orgAuth.starts_at, now),
        gt(orgAuth.expires_at, now),
        or(eq(orgAuth.edition, "advanced"), activeUpgradeExists),
        createOrganizationTrainingRecipientOrLegacyAuthorizationCondition(),
        eq(organizationTrainingVersion.profession, orgAuth.profession),
        eq(organizationTrainingVersion.level, orgAuth.level),
        eq(organizationTrainingVersion.version_status, "published"),
        sql`${organizationTrainingVersion.publish_scope_snapshot}->'organizationPublicIds' ?| ${createOrganizationTrainingVisibleOrganizationPublicIdArraySql(visibleOrganizationPublicIds)}`,
      ),
    )
    .orderBy(desc(organizationTrainingVersion.published_at));

  return rows as OrganizationTrainingEmployeeVisibleVersionRow[];
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

type OrganizationTrainingAdminLifecyclePageRow = {
  public_id: string | null;
  resource_type:
    | OrganizationTrainingAdminLifecycleItemDto["resourceType"]
    | null;
  organization_public_id: string | null;
  authorization_public_id: string | null;
  profession: OrganizationTrainingAdminLifecycleItemDto["profession"] | null;
  level: number | null;
  subject: OrganizationTrainingAdminLifecycleItemDto["subject"] | null;
  title: string | null;
  description: string | null;
  revision: number | null;
  question_count: number | null;
  total_score: number | string | null;
  question_type_summary:
    | OrganizationTrainingDraftDto["questionTypeSummary"]
    | null;
  activity_at: Date | string | null;
  status: OrganizationTrainingAdminLifecycleItemDto["status"] | null;
  source_kind: OrganizationTrainingAdminLifecycleItemDto["sourceKind"] | null;
  content_kind: OrganizationTrainingAdminLifecycleItemDto["contentKind"] | null;
  total: number | string;
  invalid_version_total: number | string;
};

export function createOrganizationTrainingAdminLifecyclePageSql(
  input: OrganizationTrainingAdminLifecyclePageInput,
): SQL {
  const visibleOrganizationPublicIds =
    createOrganizationTrainingVisibleOrganizationPublicIdArraySql(
      input.visibleOrganizationPublicIds,
    );
  const offset = (input.page - 1) * input.pageSize;

  return sql`
    with source_metadata as (
      select distinct on (draft.id)
        draft.id as draft_id,
        draft.public_id as draft_public_id,
        draft.source_task_public_id,
        draft.source_version_public_id,
        source_context.source_type,
        case
          when task_metadata.workspace = 'organization'
            and task_metadata.generation_kind in ('question', 'paper')
            then task_metadata.generation_kind
          else null
        end as generation_kind
      from organization_training_draft draft
      left join organization_training_source_context source_context
        on source_context.organization_training_draft_id = draft.id
      left join admin_ai_generation_task_metadata task_metadata
        on task_metadata.task_public_id = draft.source_task_public_id
      where draft.organization_public_id = any(${visibleOrganizationPublicIds})
      order by
        draft.id,
        case
          when source_context.source_type = 'organization_ai_result'
            and task_metadata.workspace = 'organization'
            and task_metadata.generation_kind in ('question', 'paper') then 4
          when source_context.source_type = 'paper' then 3
          when source_context.source_type is null
            and draft.source_task_public_id is null
            and draft.source_version_public_id is null then 2
          else 1
        end desc,
        source_context.id desc nulls last
    ), lifecycle as (
      select
        draft.public_id,
        'organization_training_draft'::text as resource_type,
        draft.organization_public_id,
        draft.authorization_public_id,
        draft.profession::text as profession,
        draft.level,
        draft.subject::text as subject,
        draft.title,
        draft.description,
        draft.revision,
        draft.question_count,
        draft.total_score::text as total_score,
        draft.question_type_summary,
        draft.created_at as activity_at,
        'draft'::text as status,
        case
          when metadata.source_type = 'organization_ai_result'
            and metadata.generation_kind = 'question' then 'ai_question'
          when metadata.source_type = 'organization_ai_result'
            and metadata.generation_kind = 'paper' then 'ai_paper'
          when metadata.source_type = 'paper' then 'platform_paper'
          when metadata.source_type is null
            and metadata.source_task_public_id is null
            and metadata.source_version_public_id is null then 'manual_group'
          else 'unknown'
        end::text as source_kind,
        case
          when metadata.source_type = 'organization_ai_result'
            and metadata.generation_kind = 'question' then 'question_training'
          when metadata.source_type = 'organization_ai_result'
            and metadata.generation_kind = 'paper' then 'paper_training'
          when metadata.source_type = 'paper' then 'paper_training'
          when metadata.source_type is null
            and metadata.source_task_public_id is null
            and metadata.source_version_public_id is null then 'question_training'
          else 'unknown'
        end::text as content_kind
      from organization_training_draft draft
      inner join source_metadata metadata on metadata.draft_id = draft.id
      where draft.organization_public_id = any(${visibleOrganizationPublicIds})
        and draft.retention_status = 'active'
        and draft.draft_status = 'draft'

      union all

      select
        version.public_id,
        'organization_training_version'::text as resource_type,
        version.organization_public_id,
        null::text as authorization_public_id,
        version.profession::text as profession,
        version.level,
        version.subject::text as subject,
        version.title,
        version.description,
        null::integer as revision,
        version.question_count,
        version.total_score::text as total_score,
        null::jsonb as question_type_summary,
        version.published_at as activity_at,
        version.version_status::text as status,
        case
          when metadata.source_type = 'organization_ai_result'
            and metadata.generation_kind = 'question' then 'ai_question'
          when metadata.source_type = 'organization_ai_result'
            and metadata.generation_kind = 'paper' then 'ai_paper'
          when metadata.source_type = 'paper' then 'platform_paper'
          else 'unknown'
        end::text as source_kind,
        case
          when metadata.source_type = 'organization_ai_result'
            and metadata.generation_kind = 'question' then 'question_training'
          when metadata.source_type = 'organization_ai_result'
            and metadata.generation_kind = 'paper' then 'paper_training'
          when metadata.source_type = 'paper' then 'paper_training'
          else 'unknown'
        end::text as content_kind
      from organization_training_version version
      left join source_metadata metadata
        on metadata.draft_public_id = version.draft_public_id
      where version.organization_public_id = any(${visibleOrganizationPublicIds})
        and version.publish_scope_snapshot is not null
        and version.published_at is not null
    ), filtered_lifecycle as (
      select *
      from lifecycle
      where (${input.status} = 'all' or status = ${input.status})
        and (${input.sourceKind} = 'all' or source_kind = ${input.sourceKind})
        and (${input.contentKind} = 'all' or content_kind = ${input.contentKind})
    ), invalid_version_summary as (
      select count(*)::integer as invalid_version_total
      from organization_training_version version
      where version.organization_public_id = any(${visibleOrganizationPublicIds})
        and (
          version.publish_scope_snapshot is null
          or version.published_at is null
        )
    ), summary as (
      select
        count(*)::integer as total,
        invalid_version_summary.invalid_version_total
      from filtered_lifecycle
      cross join invalid_version_summary
      group by invalid_version_summary.invalid_version_total
    ), page_rows as (
      select *
      from filtered_lifecycle
      order by activity_at desc, resource_type asc, public_id asc
      limit ${input.pageSize} offset ${offset}
    )
    select
      page_rows.*,
      summary.total,
      summary.invalid_version_total
    from summary
    left join page_rows on true
    order by
      page_rows.activity_at desc nulls last,
      page_rows.resource_type asc nulls last,
      page_rows.public_id asc nulls last
  `;
}

async function readAdminLifecyclePage(
  database: RuntimeDatabase,
  input: OrganizationTrainingAdminLifecyclePageInput,
): Promise<OrganizationTrainingAdminLifecyclePageResult> {
  const rows = await (
    database as unknown as {
      execute<TRow extends Record<string, unknown>>(
        query: SQL,
      ): Promise<TRow[]>;
    }
  ).execute<OrganizationTrainingAdminLifecyclePageRow>(
    createOrganizationTrainingAdminLifecyclePageSql(input),
  );
  const summaryRow = rows[0];
  const invalidVersionTotal = Number(summaryRow?.invalid_version_total ?? 0);
  const items = rows.flatMap((row) => {
    if (
      row.public_id === null ||
      row.resource_type === null ||
      row.organization_public_id === null ||
      row.title === null ||
      row.activity_at === null ||
      row.status === null ||
      row.source_kind === null ||
      row.content_kind === null
    ) {
      return [];
    }

    const availableActions =
      row.resource_type === "organization_training_draft"
        ? (["publish"] as const)
        : row.status === "published"
          ? (["take_down", "copy_to_new_draft"] as const)
          : (["copy_to_new_draft"] as const);
    const item: OrganizationTrainingAdminLifecycleItemDto = {
      publicId: row.public_id,
      resourceType: row.resource_type,
      organizationPublicId: row.organization_public_id,
      ...(row.authorization_public_id === null
        ? {}
        : { authorizationPublicId: row.authorization_public_id }),
      ...(row.profession === null ? {} : { profession: row.profession }),
      ...(row.level === null ? {} : { level: row.level }),
      ...(row.subject === null ? {} : { subject: row.subject }),
      title: row.title,
      description: row.description,
      ...(row.revision === null ? {} : { revision: row.revision }),
      ...(row.question_count === null
        ? {}
        : { questionCount: row.question_count }),
      ...(row.total_score === null
        ? {}
        : { totalScore: Number(row.total_score) }),
      ...(row.question_type_summary === null
        ? {}
        : { questionTypeSummary: row.question_type_summary }),
      activityAt:
        row.activity_at instanceof Date
          ? row.activity_at.toISOString()
          : new Date(row.activity_at).toISOString(),
      status: row.status,
      sourceKind: row.source_kind,
      contentKind: row.content_kind,
      availableActions: [...availableActions],
    };

    return [item];
  });

  return {
    items,
    total: Number(summaryRow?.total ?? 0),
    integrityStatus: invalidVersionTotal > 0 ? "partial" : "complete",
    warningCode:
      invalidVersionTotal > 0 ? "historical_version_unavailable" : null,
  };
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
  const now = new Date();
  const activeUpgradeExists = createActiveAdvancedOrgAuthUpgradeExistsSql(now);
  const [row] = await database
    .select({
      organization_training_version_id: organizationTrainingVersion.id,
      employee_id: employee.id,
      employee_org_auth_id: employeeOrgAuth.id,
      organization_id: organization.id,
      organization_name: organization.name,
      total_score: organizationTrainingVersion.total_score,
      question_snapshot: organizationTrainingVersion.question_snapshot,
    })
    .from(organizationTrainingVersion)
    .innerJoin(employee, eq(employee.public_id, input.employeePublicId))
    .innerJoin(user, eq(user.id, employee.user_id))
    .innerJoin(
      employeeOrgAuth,
      and(eq(employeeOrgAuth.employee_id, employee.id)),
    )
    .innerJoin(orgAuth, eq(orgAuth.id, employeeOrgAuth.org_auth_id))
    .innerJoin(organization, eq(employee.organization_id, organization.id))
    .leftJoin(
      organizationTrainingVersionRecipient,
      and(
        eq(
          organizationTrainingVersionRecipient.organization_training_version_id,
          organizationTrainingVersion.id,
        ),
        eq(
          organizationTrainingVersionRecipient.employee_public_id,
          employee.public_id,
        ),
        eq(
          organizationTrainingVersionRecipient.organization_public_id,
          organization.public_id,
        ),
      ),
    )
    .where(
      and(
        eq(
          organizationTrainingVersion.public_id,
          input.trainingVersionPublicId,
        ),
        eq(organization.public_id, input.organizationPublicId),
        eq(user.user_type, "employee"),
        eq(user.status, "active"),
        eq(organization.status, "active"),
        eq(orgAuth.status, "active"),
        lte(orgAuth.starts_at, now),
        gt(orgAuth.expires_at, now),
        or(eq(orgAuth.edition, "advanced"), activeUpgradeExists),
        createOrganizationTrainingRecipientOrLegacyAuthorizationCondition(),
        eq(organizationTrainingVersion.profession, orgAuth.profession),
        eq(organizationTrainingVersion.level, orgAuth.level),
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
    employeeOrgAuthId: row.employee_org_auth_id,
    organizationId: row.organization_id,
    organizationName: row.organization_name,
    totalScore: Number(row.total_score),
    questionSnapshot: row.question_snapshot,
  };
}

async function hasCurrentEmployeeMembership(
  database: Parameters<typeof lockEmployeeIdentity>[0],
  input:
    | OrganizationTrainingEmployeeAnswerDraftUpsertInput
    | OrganizationTrainingEmployeeAnswerSubmissionUpsertInput,
): Promise<boolean> {
  const [membership] = await database
    .select({ employee_org_auth_id: employeeOrgAuth.id })
    .from(employee)
    .innerJoin(user, eq(user.id, employee.user_id))
    .innerJoin(organization, eq(organization.id, employee.organization_id))
    .innerJoin(
      employeeOrgAuth,
      and(
        eq(employeeOrgAuth.id, input.employeeOrgAuthId),
        eq(employeeOrgAuth.employee_id, employee.id),
      ),
    )
    .innerJoin(
      organizationTrainingVersion,
      eq(organizationTrainingVersion.id, input.organizationTrainingVersionId),
    )
    .innerJoin(orgAuth, eq(orgAuth.id, employeeOrgAuth.org_auth_id))
    .leftJoin(
      organizationTrainingVersionRecipient,
      and(
        eq(
          organizationTrainingVersionRecipient.organization_training_version_id,
          organizationTrainingVersion.id,
        ),
        eq(
          organizationTrainingVersionRecipient.employee_public_id,
          employee.public_id,
        ),
        eq(
          organizationTrainingVersionRecipient.organization_public_id,
          organization.public_id,
        ),
        eq(
          organizationTrainingVersionRecipient.authorization_public_id,
          orgAuth.public_id,
        ),
      ),
    )
    .where(
      and(
        eq(employee.id, input.employeeId),
        eq(employee.public_id, input.employeePublicId),
        eq(employee.organization_id, input.organizationId),
        eq(organization.public_id, input.organizationPublicId),
        eq(organization.status, "active"),
        eq(user.user_type, "employee"),
        eq(user.status, "active"),
        createOrganizationTrainingRecipientOrLegacyAuthorizationCondition(),
      ),
    )
    .limit(1);

  return membership !== undefined;
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
