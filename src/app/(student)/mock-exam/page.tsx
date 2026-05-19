import {
  StudentMockExamPage,
  studentMockExamFixture,
} from "@/features/student/mock-exam/StudentMockExamReportPage";

type StudentMockExamRoutePageProps = {
  searchParams?: Promise<{
    mockExamPublicId?: string | string[];
  }>;
};

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
  const mockExamPublicId = normalizeMockExamPublicId(
    resolvedSearchParams.mockExamPublicId,
  );

  return (
    <StudentMockExamPage
      mockExamPublicId={mockExamPublicId}
      mockExams={studentMockExamFixture.mockExams}
    />
  );
}
