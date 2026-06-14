import { createQuestionPaperRouteHandlers } from "@/server/services/question-paper/route-handlers";

const questionPaperRouteHandlers = createQuestionPaperRouteHandlers();

export const GET = questionPaperRouteHandlers.examPapers.collection.GET;
export const POST = questionPaperRouteHandlers.examPapers.collection.POST;
