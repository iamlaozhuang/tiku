import { StudentMistakeBookPage } from "@/features/student/mistake-book/StudentMistakeBookPage";
import { studentExperiencePageBoundary } from "../student-experience-page-boundary";

const pageBoundary = studentExperiencePageBoundary.mistakeBook;

void pageBoundary;

export default function MistakeBookPage() {
  return <StudentMistakeBookPage />;
}
