import type {
  OrganizationTrainingPublishedVersionDto,
  OrganizationTrainingScopeSnapshotDto,
} from "../contracts/organization-training-contract";
import type { Profession } from "../models/auth";
import type {
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
