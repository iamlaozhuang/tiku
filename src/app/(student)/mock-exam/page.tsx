import { StudentMockExamPage } from "@/features/student/mock-exam/StudentMockExamReportPage";
import { studentExperiencePageBoundary } from "../student-experience-page-boundary";

const pageBoundary = studentExperiencePageBoundary.mockExam;

void pageBoundary;

type StudentMockExamRoutePageProps = {
  searchParams?: Promise<{
    paperPublicId?: string | string[];
    mockExamPublicId?: string | string[];
  }>;
};

function normalizePaperPublicId(
  paperPublicId: string | string[] | undefined,
): string | undefined {
  return Array.isArray(paperPublicId) ? paperPublicId[0] : paperPublicId;
}

function normalizeMockExamPublicId(
  mockExamPublicId: string | string[] | undefined,
): string | undefined {
  return Array.isArray(mockExamPublicId)
    ? mockExamPublicId[0]
    : mockExamPublicId;
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

  return (
    <StudentMockExamPage
      paperPublicId={paperPublicId}
      mockExamPublicId={mockExamPublicId}
    />
  );
}
