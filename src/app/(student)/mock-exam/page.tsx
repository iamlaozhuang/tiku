import { StudentMockExamPage } from "@/features/student/mock-exam/StudentMockExamReportPage";
import { studentExperiencePageBoundary } from "../student-experience-page-boundary";

const pageBoundary = studentExperiencePageBoundary.mockExam;

void pageBoundary;

type StudentMockExamRoutePageProps = {
  searchParams?: Promise<{
    paperPublicId?: string | string[];
    mockExamPublicId?: string | string[];
    authorizationSource?: string | string[];
    authorizationPublicId?: string | string[];
  }>;
};

function normalizePaperPublicId(
  paperPublicId: string | string[] | undefined,
): string | undefined {
  return Array.isArray(paperPublicId) ? undefined : paperPublicId;
}

function normalizeMockExamPublicId(
  mockExamPublicId: string | string[] | undefined,
): string | undefined {
  return Array.isArray(mockExamPublicId) ? undefined : mockExamPublicId;
}

export default async function StudentMockExamRoutePage({
  searchParams,
}: StudentMockExamRoutePageProps) {
  const resolvedSearchParams =
    searchParams === undefined ? {} : await searchParams;
  const paperPublicId = normalizePaperPublicId(
    resolvedSearchParams.paperPublicId,
  );
  const mockExamPublicId = normalizeMockExamPublicId(
    resolvedSearchParams.mockExamPublicId,
  );
  const authorizationSource = normalizePaperPublicId(
    resolvedSearchParams.authorizationSource,
  );
  const authorizationPublicId = normalizePaperPublicId(
    resolvedSearchParams.authorizationPublicId,
  );

  return (
    <StudentMockExamPage
      paperPublicId={paperPublicId}
      mockExamPublicId={mockExamPublicId}
      authorizationSource={authorizationSource}
      authorizationPublicId={authorizationPublicId}
    />
  );
}
