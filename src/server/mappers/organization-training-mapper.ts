import type { OrganizationTrainingAnswerOrganizationSnapshotValue } from "@/db/schema";

import type {
  EmployeeOrganizationTrainingAnswerDto,
  OrganizationTrainingPublishedVersionDto,
  OrganizationTrainingScopeSnapshotDto,
} from "../contracts/organization-training-contract";
import type { Profession } from "../models/auth";
import type {
  OrganizationTrainingAnswerStatus,
  OrganizationTrainingQuestionTypeSummary,
  OrganizationTrainingVersionStatus,
} from "../models/organization-training";
import type { Subject } from "../models/paper";

export type OrganizationTrainingVersionRow = {
  id?: number;
  public_id: string;
  draft_public_id: string;
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
  version_status: OrganizationTrainingVersionStatus;
  published_at: Date;
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
  score: number | string | null;
  total_score: number | string;
  submitted_at: Date | null;
  answer_organization_snapshot: OrganizationTrainingAnswerOrganizationSnapshotValue;
  created_at: Date;
  updated_at: Date;
};

export function mapOrganizationTrainingVersionRowToDto(
  row: OrganizationTrainingVersionRow,
): OrganizationTrainingPublishedVersionDto {
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
    takenDownAt: row.taken_down_at?.toISOString() ?? null,
    takedownReason: row.takedown_reason,
  };
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
  };
}

function copyScopeSnapshot(
  snapshot: OrganizationTrainingScopeSnapshotDto,
): OrganizationTrainingScopeSnapshotDto {
  return {
    organizationPublicIds: [...snapshot.organizationPublicIds],
    capturedAt: snapshot.capturedAt,
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
