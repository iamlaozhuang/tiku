import {
  StudentHomePage,
  studentHomeFixture,
} from "@/features/student/home/StudentHomePage";

export default function StudentHomeRoutePage() {
  return (
    <StudentHomePage
      scopes={studentHomeFixture.scopes}
      papers={studentHomeFixture.papers}
      rememberedScope={{
        profession: "marketing",
        level: 3,
      }}
    />
  );
}
