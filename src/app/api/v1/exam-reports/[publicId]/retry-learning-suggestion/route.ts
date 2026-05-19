import { createUnavailableExamReportService } from "@/server/services/exam-report-service";
import {
  createExamReportRouteHandlers,
  createUnavailableExamReportUserResolver,
} from "@/server/services/exam-report-route";

const examReportRouteHandlers = createExamReportRouteHandlers(
  createUnavailableExamReportService(),
  createUnavailableExamReportUserResolver(),
);

const responseContract = {
  code: 401001,
  message: "User session is required.",
  data: null,
};

void responseContract;

export const POST = examReportRouteHandlers.retryLearningSuggestion.POST;
