import { createQuestionPaperRouteHandlers } from "@/server/services/question-paper/route-handlers";

const questionPaperRouteHandlers = createQuestionPaperRouteHandlers();

export const POST = questionPaperRouteHandlers.examPapers.unpublish.POST;
