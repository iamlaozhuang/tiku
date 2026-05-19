import {
  StudentExamReportPage,
  studentExamReportFixture,
} from "@/features/student/mock-exam/StudentMockExamReportPage";

type StudentExamReportRoutePageProps = {
  searchParams?: Promise<{
    examReportPublicId?: string | string[];
  }>;
};

function normalizeExamReportPublicId(
  examReportPublicId: string | string[] | undefined,
): string | undefined {
  return Array.isArray(examReportPublicId)
    ? examReportPublicId[0]
    : examReportPublicId;
}

export default async function StudentExamReportRoutePage({
  searchParams,
}: StudentExamReportRoutePageProps) {
  const resolvedSearchParams =
    searchParams === undefined ? {} : await searchParams;
  const examReportPublicId = normalizeExamReportPublicId(
    resolvedSearchParams.examReportPublicId,
  );

  return (
    <StudentExamReportPage
      examReportPublicId={examReportPublicId}
      examReports={studentExamReportFixture.examReports}
    />
  );
}
