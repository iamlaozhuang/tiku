import { createStudentExperienceRouteHandlers } from "@/server/services/student-experience/route-handlers";

const studentExperienceRouteHandlers = createStudentExperienceRouteHandlers();

const responseContract = {
  code: 401001,
  message: "User session is required.",
  data: null,
};

void responseContract;

export const POST = studentExperienceRouteHandlers.practices.answers.POST;
