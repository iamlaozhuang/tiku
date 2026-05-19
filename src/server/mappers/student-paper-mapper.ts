import type {
  StudentPaperDetailDto,
  StudentPaperScopeDto,
  StudentPaperSummaryDto,
} from "../contracts/student-paper-contract";
import type {
  StudentPaperAuthorizationScopeRow,
  StudentPublishedPaperRow,
} from "../repositories/student-paper-repository";

function formatNullableTimestamp(value: Date | null): string | null {
  return value === null ? null : value.toISOString();
}

export function mapStudentPaperScopeToApi(
  authorizationScope: StudentPaperAuthorizationScopeRow,
): StudentPaperScopeDto {
  return {
    profession: authorizationScope.profession,
    level: authorizationScope.level,
    authorizationTypes: authorizationScope.authorization_types,
    expiresAt: authorizationScope.expires_at.toISOString(),
    status: "active",
  };
}

export function mapStudentPaperSummaryToApi(
  paper: StudentPublishedPaperRow,
): StudentPaperSummaryDto {
  return {
    publicId: paper.public_id,
    name: paper.name,
    profession: paper.profession,
    level: paper.level,
    subject: paper.subject,
    paperType: paper.paper_type,
    durationMinute: paper.duration_minute,
    totalScore: paper.total_score,
    publishedAt: formatNullableTimestamp(paper.published_at),
    questionCount: paper.question_count,
    canPractice: true,
    canMockExam: true,
  };
}

export function mapStudentPaperListToApi(
  papers: StudentPublishedPaperRow[],
): StudentPaperSummaryDto[] {
  return papers.map((paper) => mapStudentPaperSummaryToApi(paper));
}

export function mapStudentPaperDetailToApi(
  paper: StudentPublishedPaperRow,
): StudentPaperDetailDto {
  return {
    ...mapStudentPaperSummaryToApi(paper),
    paperSnapshot: paper.paper_snapshot,
  };
}
