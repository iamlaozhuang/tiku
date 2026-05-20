import { createAdminContentKnowledgeOpsRouteHandlers } from "@/server/services/admin-content-knowledge-ops-route";
import { createUnavailableAdminContentKnowledgeOpsService } from "@/server/services/admin-content-knowledge-ops-service";
import { createQuestionRouteHandlers } from "@/server/services/question-route";
import { createUnavailableQuestionService } from "@/server/services/question-service";

const adminContentKnowledgeOpsRouteHandlers =
  createAdminContentKnowledgeOpsRouteHandlers(
    createUnavailableAdminContentKnowledgeOpsService(),
  );

const questionRouteHandlers = createQuestionRouteHandlers(
  createUnavailableQuestionService(),
);

const responseContract = {
  code: 503621,
  message: "Admin content and knowledge runtime is not configured.",
  data: null,
};

void responseContract;

export const GET = adminContentKnowledgeOpsRouteHandlers.questions.GET;
export const POST = questionRouteHandlers.collection.POST;
