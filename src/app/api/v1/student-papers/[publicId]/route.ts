import { createUnavailableStudentPaperService } from "@/server/services/student-paper-service";
import {
  createStudentPaperRouteHandlers,
  createUnavailableStudentPaperUserResolver,
} from "@/server/services/student-paper-route";

const studentPaperRouteHandlers = createStudentPaperRouteHandlers(
  createUnavailableStudentPaperService(),
  createUnavailableStudentPaperUserResolver(),
);

const responseContract = {
  code: 401001,
  message: "User session is required.",
  data: null,
};

void responseContract;

export const GET = studentPaperRouteHandlers.detail.GET;
