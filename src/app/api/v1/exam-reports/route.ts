import { createStudentExperienceRouteHandlers } from "@/server/services/student-experience/route-handlers";

const studentExperienceRouteHandlers = createStudentExperienceRouteHandlers();

const responseContract = {
  code: 401001,
  message: "User session is required.",
  data: null,
};

void responseContract;

export const GET = studentExperienceRouteHandlers.examReports.collection.GET;
export const POST = studentExperienceRouteHandlers.examReports.generation.POST;
