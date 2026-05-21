import { createAdminFlowRuntimeRouteHandlers } from "@/server/services/admin-flow-runtime";
import { createQuestionRouteHandlers } from "@/server/services/question-route";
import { createUnavailableQuestionService } from "@/server/services/question-service";

const adminFlowRuntimeRouteHandlers = createAdminFlowRuntimeRouteHandlers();

const questionRouteHandlers = createQuestionRouteHandlers(
  createUnavailableQuestionService(),
);

export const GET = adminFlowRuntimeRouteHandlers.questions.collection.GET;
export const POST = questionRouteHandlers.collection.POST;
