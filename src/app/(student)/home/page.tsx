import { StudentHomePage } from "@/features/student/home/StudentHomePage";
import { studentExperiencePageBoundary } from "../student-experience-page-boundary";

const pageBoundary = studentExperiencePageBoundary.home;

void pageBoundary;

export default function StudentHomeRoutePage() {
  return <StudentHomePage />;
}
