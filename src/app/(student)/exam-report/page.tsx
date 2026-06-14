import {
  StudentExamReportListPage,
  StudentExamReportPage,
} from "@/features/student/mock-exam/StudentMockExamReportPage";
import { studentExperiencePageBoundary } from "../student-experience-page-boundary";

const pageBoundary = studentExperiencePageBoundary.examReport;

void pageBoundary;

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

  if (examReportPublicId === undefined) {
    return <StudentExamReportListPage />;
  }

  return <StudentExamReportPage examReportPublicId={examReportPublicId} />;
}
