import { createStudentFlowRuntimeRouteHandlers } from "@/server/services/student-flow-runtime";

const studentFlowRouteHandlers = createStudentFlowRuntimeRouteHandlers();

const responseContract = {
  code: 401001,
  message: "User session is required.",
  data: null,
};

void responseContract;

export const POST = studentFlowRouteHandlers.practices.favoriteQuestion.POST;
