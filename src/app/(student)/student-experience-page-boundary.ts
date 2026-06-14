export const studentExperiencePageBoundary = {
  examReport: {
    capabilityIds: ["CAP-STD-EXAM-REPORT-MISTAKE-BOOK"],
    routeScope: "standard_mvp_student_exam_report",
  },
  home: {
    capabilityIds: ["CAP-STD-PRACTICE", "CAP-STD-MOCK-EXAM"],
    routeScope: "standard_mvp_student_home",
  },
  mistakeBook: {
    capabilityIds: ["CAP-STD-EXAM-REPORT-MISTAKE-BOOK"],
    mistakeBookScope: "objective_question_only",
    routeScope: "standard_mvp_student_mistake_book",
  },
  mockExam: {
    capabilityIds: ["CAP-STD-MOCK-EXAM"],
    routeScope: "standard_mvp_student_mock_exam",
  },
  practice: {
    capabilityIds: ["CAP-STD-PRACTICE"],
    routeScope: "standard_mvp_student_practice",
  },
} as const;
