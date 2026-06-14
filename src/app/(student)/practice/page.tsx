import { StudentPracticePage } from "@/features/student/practice/StudentPracticePage";
import { studentExperiencePageBoundary } from "../student-experience-page-boundary";

const pageBoundary = studentExperiencePageBoundary.practice;

void pageBoundary;

type StudentPracticeRoutePageProps = {
  searchParams?: Promise<{
    paperPublicId?: string | string[];
  }>;
};

function normalizePaperPublicId(
  paperPublicId: string | string[] | undefined,
): string | undefined {
  return Array.isArray(paperPublicId) ? paperPublicId[0] : paperPublicId;
}

export default async function StudentPracticeRoutePage({
  searchParams,
}: StudentPracticeRoutePageProps) {
  const resolvedSearchParams =
    searchParams === undefined ? {} : await searchParams;
  const paperPublicId = normalizePaperPublicId(
    resolvedSearchParams.paperPublicId,
  );

  return <StudentPracticePage paperPublicId={paperPublicId} />;
}
