import type {
  OrganizationTrainingAnswerItemSnapshotValue,
  OrganizationTrainingAnswerOrganizationSnapshotValue,
  OrganizationTrainingQuestionResultSnapshotValue,
  OrganizationTrainingQuestionSnapshotValue,
} from "@/db/schema";

import type {
  EmployeeOrganizationTrainingAnswerDto,
  EmployeeOrganizationTrainingAnswerItemDto,
  EmployeeOrganizationTrainingQuestionResultDto,
  OrganizationTrainingDraftDto,
  OrganizationTrainingPublishedVersionDto,
  OrganizationTrainingQuestionSnapshotDto,
  OrganizationTrainingScopeSnapshotDto,
  OrganizationTrainingSourceContextDto,
} from "../contracts/organization-training-contract";
import { professionValues, type Profession } from "../models/auth";
import {
  organizationTrainingVersionStatusValues,
  type OrganizationTrainingAnswerStatus,
  type OrganizationTrainingDraftStatus,
  type OrganizationTrainingPublishQuestionInput,
  type OrganizationTrainingQuestionTypeSummary,
  type OrganizationTrainingRetentionStatus,
  type OrganizationTrainingSourceContextType,
  type OrganizationTrainingValidationStatus,
  type OrganizationTrainingVersionStatus,
} from "../models/organization-training";
import { subjectValues, type Subject } from "../models/paper";

export type OrganizationTrainingVersionRow = {
  id?: number;
  public_id: string;
  organization_training_draft_id?: number | null;
  draft_public_id: string;
  publish_operation_id?: string | null;
  publish_payload_digest?: string | null;
  version_number: number;
  organization_id: number;
  organization_public_id: string;
  org_auth_id: number;
  authorization_source: "org_auth";
  authorization_public_id: string;
  owner_type: "organization";
  owner_public_id: string;
  quota_owner_type: "organization";
  quota_owner_public_id: string;
  publish_scope_snapshot: OrganizationTrainingScopeSnapshotDto;
  profession: Profession;
  level: number;
  subject: Subject;
  title: string;
  description: string | null;
  question_count: number;
  total_score: number | string;
  question_type_summary: OrganizationTrainingQuestionTypeSummary;
  question_snapshot: OrganizationTrainingQuestionSnapshotValue[];
  version_status: OrganizationTrainingVersionStatus;
  published_at: Date;
  answer_deadline_at: Date | null;
  taken_down_at: Date | null;
  takedown_reason: string | null;
  created_at: Date;
  updated_at: Date;
};

export type OrganizationTrainingAnswerRow = {
  id?: number;
  public_id: string;
  organization_training_version_id: number;
  organization_training_version_public_id: string;
  employee_id: number;
  employee_public_id: string;
  organization_id: number;
  organization_public_id: string;
  organization_training_answer_status: OrganizationTrainingAnswerStatus;
  revision?: number;
  last_operation_id?: string | null;
  last_payload_digest?: string | null;
  submit_operation_id?: string | null;
  submit_payload_digest?: string | null;
  score: number | string | null;
  total_score: number | string;
  submitted_at: Date | null;
  answer_organization_snapshot: OrganizationTrainingAnswerOrganizationSnapshotValue;
  answer_item_snapshot: OrganizationTrainingAnswerItemSnapshotValue[];
  question_result_snapshot: OrganizationTrainingQuestionResultSnapshotValue[];
  created_at: Date;
  updated_at: Date;
};

export type OrganizationTrainingDraftRow = {
  id?: number;
  public_id: string;
  draft_status?: OrganizationTrainingDraftStatus;
  revision?: number;
  source_task_public_id: string | null;
  source_version_public_id: string | null;
  organization_id: number;
  organization_public_id: string;
  org_auth_id: number;
  authorization_source: "org_auth";
  authorization_public_id: string;
  owner_type: "organization";
  owner_public_id: string;
  quota_owner_type: "organization";
  quota_owner_public_id: string;
  profession: Profession;
  level: number;
  subject: Subject;
  title: string;
  description: string | null;
  question_count: number;
  total_score: number | string;
  question_type_summary: OrganizationTrainingQuestionTypeSummary;
  question_snapshot?: OrganizationTrainingQuestionSnapshotValue[];
  last_operation_id?: string | null;
  last_payload_digest?: string | null;
  evidence_status: "sufficient" | "weak" | "none";
  validation_status: OrganizationTrainingValidationStatus;
  retention_status: OrganizationTrainingRetentionStatus;
  created_at: Date;
  updated_at: Date;
  expires_at: Date | null;
  consumed_at?: Date | null;
  discarded_at?: Date | null;
};

export type OrganizationTrainingSourceContextRow = {
  id?: number;
  public_id: string;
  organization_training_draft_id: number;
  organization_training_draft_public_id: string;
  organization_id: number;
  organization_public_id: string;
  org_auth_id: number;
  authorization_source: "org_auth";
  authorization_public_id: string;
  source_type: OrganizationTrainingSourceContextType;
  source_public_id: string;
  title: string;
  profession: Profession;
  level: number;
  subject: Subject;
  question_count: number;
  total_score: number | string;
  source_status: string;
  redaction_status: "metadata_only";
  formal_usage_policy: {
    createFormalPaper: false;
    createMockExam: false;
    exposeQuestionBody: false;
    exposeStandardAnswer: false;
    exposeAnalysis: false;
    exposeProviderPayload: false;
  };
  created_at: Date;
  updated_at: Date;
};

export function mapOrganizationTrainingDraftRowToDto(
  row: OrganizationTrainingDraftRow,
): OrganizationTrainingDraftDto {
  return {
    publicId: row.public_id,
    draftStatus: row.draft_status ?? "draft",
    revision: row.revision ?? 1,
    sourceTaskPublicId: row.source_task_public_id,
    organizationPublicId: row.organization_public_id,
    authorizationSource: row.authorization_source,
    authorizationPublicId: row.authorization_public_id,
    profession: row.profession,
    level: row.level,
    subject: row.subject,
    title: row.title,
    description: row.description,
    questionCount: row.question_count,
    totalScore: normalizeTotalScore(row.total_score),
    questionTypeSummary: copyQuestionTypeSummary(row.question_type_summary),
    questions: copyCanonicalQuestionSnapshots(row.question_snapshot),
    evidenceStatus: row.evidence_status,
    validationStatus: row.validation_status,
    retentionStatus: row.retention_status,
    createdAt: row.created_at.toISOString(),
    expiresAt: row.expires_at?.toISOString() ?? null,
  };
}

export function mapOrganizationTrainingSourceContextRowToDto(
  row: OrganizationTrainingSourceContextRow,
): OrganizationTrainingSourceContextDto {
  return {
    sourceType: row.source_type,
    sourcePublicId: row.source_public_id,
    title: row.title,
    profession: row.profession,
    level: row.level,
    subject: row.subject,
    questionCount: row.question_count,
    totalScore: normalizeTotalScore(row.total_score),
    sourceStatus: row.source_status,
    redactionStatus: row.redaction_status,
  };
}

export function mapOrganizationTrainingVersionRowToDto(
  row: OrganizationTrainingVersionRow,
): OrganizationTrainingPublishedVersionDto {
  const questions = mapQuestionSnapshots(row.question_snapshot);

  return {
    publicId: row.public_id,
    draftPublicId: row.draft_public_id,
    versionNumber: row.version_number,
    organizationPublicId: row.organization_public_id,
    publishScopeSnapshot: copyScopeSnapshot(row.publish_scope_snapshot),
    profession: row.profession,
    level: row.level,
    subject: row.subject,
    title: row.title,
    description: row.description,
    questionCount: row.question_count,
    totalScore: normalizeTotalScore(row.total_score),
    status: row.version_status,
    publishedAt: row.published_at.toISOString(),
    answerDeadlineAt: row.answer_deadline_at?.toISOString() ?? null,
    takenDownAt: row.taken_down_at?.toISOString() ?? null,
    takedownReason: row.takedown_reason,
    ...(questions.length > 0 ? { questions } : {}),
  };
}

function copyCanonicalQuestionSnapshots(
  snapshots: OrganizationTrainingQuestionSnapshotValue[] | null | undefined,
): OrganizationTrainingPublishQuestionInput[] {
  if (!Array.isArray(snapshots)) {
    return [];
  }

  return snapshots.map((snapshot) => ({
    publicId: snapshot.publicId,
    sequenceNumber: snapshot.sequenceNumber,
    questionType: snapshot.questionType,
    ...(snapshot.paperSectionKey !== undefined &&
    snapshot.paperSectionTitle !== undefined &&
    snapshot.paperSectionSortOrder !== undefined &&
    snapshot.questionSortOrder !== undefined
      ? {
          paperSectionKey: snapshot.paperSectionKey,
          paperSectionTitle: snapshot.paperSectionTitle,
          paperSectionSortOrder: snapshot.paperSectionSortOrder,
          questionSortOrder: snapshot.questionSortOrder,
        }
      : {}),
    materialTitle: snapshot.materialTitle,
    materialContent: snapshot.materialContent,
    stem: snapshot.stem,
    options: Array.isArray(snapshot.options)
      ? snapshot.options.map((option) => ({ ...option }))
      : [],
    score: snapshot.score,
    standardAnswer: snapshot.standardAnswer,
    analysisSummary: snapshot.analysisSummary,
    evidenceStatus: snapshot.evidenceStatus,
    citationCount: snapshot.citationCount,
  }));
}

export function tryMapOrganizationTrainingVersionRowToDto(
  candidate: unknown,
): OrganizationTrainingPublishedVersionDto | null {
  if (!isOrganizationTrainingVersionRow(candidate)) {
    return null;
  }

  try {
    return mapOrganizationTrainingVersionRowToDto(candidate);
  } catch {
    return null;
  }
}

export function mapOrganizationTrainingAnswerRowToDto(
  row: OrganizationTrainingAnswerRow,
): EmployeeOrganizationTrainingAnswerDto {
  const score = normalizeNullableScore(row.score);
  const totalScore = normalizeTotalScore(row.total_score);
  const scoreSummary =
    score === null
      ? null
      : {
          score,
          totalScore,
        };

  return {
    publicId: row.public_id,
    revision: row.revision ?? 1,
    trainingVersionPublicId: row.organization_training_version_public_id,
    employeePublicId: row.employee_public_id,
    organizationPublicId: row.organization_public_id,
    answerOrganizationSnapshot: {
      organizationPublicIds: [
        row.answer_organization_snapshot.organizationPublicId,
      ],
      capturedAt: row.answer_organization_snapshot.capturedAt,
    },
    answerStatus: row.organization_training_answer_status,
    scoreSummary,
    submittedAt: row.submitted_at?.toISOString() ?? null,
    resultSummaryVisible:
      row.organization_training_answer_status !== "in_progress" &&
      row.submitted_at !== null &&
      scoreSummary !== null,
    answerItems: mapAnswerItemSnapshots(row.answer_item_snapshot),
    questionResults: mapQuestionResultSnapshots(row.question_result_snapshot),
  };
}

function mapQuestionSnapshots(
  snapshots: OrganizationTrainingQuestionSnapshotValue[] | null | undefined,
): OrganizationTrainingQuestionSnapshotDto[] {
  if (!Array.isArray(snapshots)) {
    return [];
  }

  return snapshots
    .map((snapshot) => ({
      publicId: snapshot.publicId,
      sequenceNumber: snapshot.sequenceNumber,
      questionType: snapshot.questionType,
      materialTitle: snapshot.materialTitle,
      materialContent: snapshot.materialContent,
      stem: snapshot.stem,
      options: Array.isArray(snapshot.options)
        ? snapshot.options.map((option) => ({
            publicId: option.publicId,
            label: option.label,
            content: option.content,
          }))
        : [],
      score: snapshot.score,
    }))
    .filter(
      (question): question is OrganizationTrainingQuestionSnapshotDto =>
        typeof question.publicId === "string" &&
        Number.isInteger(question.sequenceNumber) &&
        typeof question.stem === "string",
    );
}

function mapAnswerItemSnapshots(
  snapshots: OrganizationTrainingAnswerItemSnapshotValue[] | null | undefined,
): EmployeeOrganizationTrainingAnswerItemDto[] {
  if (!Array.isArray(snapshots)) {
    return [];
  }

  return snapshots.map((snapshot) => ({
    questionPublicId: snapshot.questionPublicId,
    selectedOptionPublicIds: Array.isArray(snapshot.selectedOptionPublicIds)
      ? [...snapshot.selectedOptionPublicIds]
      : [],
    textAnswer: snapshot.textAnswer,
  }));
}

function mapQuestionResultSnapshots(
  snapshots:
    | OrganizationTrainingQuestionResultSnapshotValue[]
    | null
    | undefined,
): EmployeeOrganizationTrainingQuestionResultDto[] {
  if (!Array.isArray(snapshots)) {
    return [];
  }

  return snapshots.map((snapshot) => ({
    questionPublicId: snapshot.questionPublicId,
    score: snapshot.score,
    maxScore: snapshot.maxScore,
    standardAnswer: snapshot.standardAnswer,
    analysis: snapshot.analysis,
    scoringPointResults: Array.isArray(snapshot.scoringPointResults)
      ? snapshot.scoringPointResults.map((scoringPointResult) => ({
          label: scoringPointResult.label,
          score: scoringPointResult.score,
          maxScore: scoringPointResult.maxScore,
          reason: scoringPointResult.reason,
        }))
      : [],
  }));
}

function copyScopeSnapshot(
  snapshot: OrganizationTrainingScopeSnapshotDto,
): OrganizationTrainingScopeSnapshotDto {
  return {
    organizationPublicIds: [...snapshot.organizationPublicIds],
    capturedAt: snapshot.capturedAt,
  };
}

function isOrganizationTrainingVersionRow(
  candidate: unknown,
): candidate is OrganizationTrainingVersionRow {
  if (!isRecord(candidate)) {
    return false;
  }

  const publishScopeSnapshot = candidate.publish_scope_snapshot;
  const questionTypeSummary = candidate.question_type_summary;
  const totalScore = Number(candidate.total_score);

  return (
    isNonEmptyText(candidate.public_id) &&
    isNonEmptyText(candidate.draft_public_id) &&
    isPositiveInteger(candidate.version_number) &&
    isPositiveInteger(candidate.organization_id) &&
    isNonEmptyText(candidate.organization_public_id) &&
    isPositiveInteger(candidate.org_auth_id) &&
    candidate.authorization_source === "org_auth" &&
    isNonEmptyText(candidate.authorization_public_id) &&
    candidate.owner_type === "organization" &&
    candidate.owner_public_id === candidate.organization_public_id &&
    candidate.quota_owner_type === "organization" &&
    candidate.quota_owner_public_id === candidate.organization_public_id &&
    isScopeSnapshot(publishScopeSnapshot) &&
    professionValues.includes(candidate.profession as Profession) &&
    isPositiveInteger(candidate.level) &&
    subjectValues.includes(candidate.subject as Subject) &&
    isNonEmptyText(candidate.title) &&
    (candidate.description === null ||
      typeof candidate.description === "string") &&
    isNonNegativeInteger(candidate.question_count) &&
    Number.isFinite(totalScore) &&
    totalScore >= 0 &&
    isQuestionTypeSummary(questionTypeSummary) &&
    Array.isArray(candidate.question_snapshot) &&
    organizationTrainingVersionStatusValues.includes(
      candidate.version_status as OrganizationTrainingVersionStatus,
    ) &&
    isValidDate(candidate.published_at) &&
    isNullableValidDate(candidate.answer_deadline_at) &&
    isNullableValidDate(candidate.taken_down_at) &&
    (candidate.takedown_reason === null ||
      typeof candidate.takedown_reason === "string") &&
    isValidDate(candidate.created_at) &&
    isValidDate(candidate.updated_at)
  );
}

function isScopeSnapshot(
  candidate: unknown,
): candidate is OrganizationTrainingScopeSnapshotDto {
  if (!isRecord(candidate)) {
    return false;
  }

  return (
    Array.isArray(candidate.organizationPublicIds) &&
    candidate.organizationPublicIds.length > 0 &&
    candidate.organizationPublicIds.every(isNonEmptyText) &&
    typeof candidate.capturedAt === "string" &&
    Number.isFinite(Date.parse(candidate.capturedAt))
  );
}

function isQuestionTypeSummary(
  candidate: unknown,
): candidate is OrganizationTrainingQuestionTypeSummary {
  if (!isRecord(candidate)) {
    return false;
  }

  return [
    candidate.singleChoice,
    candidate.multiChoice,
    candidate.trueFalse,
    candidate.shortAnswer,
  ].every(isNonNegativeInteger);
}

function isRecord(candidate: unknown): candidate is Record<string, unknown> {
  return typeof candidate === "object" && candidate !== null;
}

function isNonEmptyText(candidate: unknown): candidate is string {
  return typeof candidate === "string" && candidate.trim().length > 0;
}

function isPositiveInteger(candidate: unknown): candidate is number {
  return Number.isInteger(candidate) && Number(candidate) > 0;
}

function isNonNegativeInteger(candidate: unknown): candidate is number {
  return Number.isInteger(candidate) && Number(candidate) >= 0;
}

function isValidDate(candidate: unknown): candidate is Date {
  return candidate instanceof Date && Number.isFinite(candidate.getTime());
}

function isNullableValidDate(candidate: unknown): candidate is Date | null {
  return candidate === null || isValidDate(candidate);
}

function copyQuestionTypeSummary(
  summary: OrganizationTrainingQuestionTypeSummary,
): OrganizationTrainingQuestionTypeSummary {
  return {
    singleChoice: summary.singleChoice,
    multiChoice: summary.multiChoice,
    trueFalse: summary.trueFalse,
    shortAnswer: summary.shortAnswer,
  };
}

function normalizeTotalScore(totalScore: number | string): number {
  if (typeof totalScore === "number") {
    return totalScore;
  }

  return Number(totalScore);
}

function normalizeNullableScore(score: number | string | null): number | null {
  if (score === null) {
    return null;
  }

  return normalizeTotalScore(score);
}
