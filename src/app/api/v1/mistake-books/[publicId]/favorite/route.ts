import { createStudentMistakeBookRuntimeRouteHandlers } from "@/server/services/student-mistake-book-runtime";

const mistakeBookRouteHandlers = createStudentMistakeBookRuntimeRouteHandlers();

const responseContract = {
  code: 401001,
  message: "User session is required.",
  data: null,
};

void responseContract;

export const POST = mistakeBookRouteHandlers.favorite.POST;
