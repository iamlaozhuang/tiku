import { createQuestionRouteHandlers } from "@/server/services/question-route";
import { createUnavailableQuestionService } from "@/server/services/question-service";

const questionRouteHandlers = createQuestionRouteHandlers(
  createUnavailableQuestionService(),
);

const responseContract = {
  code: 503202,
  message: "Question runtime is not configured.",
  data: null,
};

void responseContract;

export const GET = questionRouteHandlers.detail.GET;
export const PATCH = questionRouteHandlers.detail.PATCH;
