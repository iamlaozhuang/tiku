import { createQuestionPaperRouteHandlers } from "@/server/services/question-paper/route-handlers";

const questionPaperRouteHandlers = createQuestionPaperRouteHandlers();

export const GET = questionPaperRouteHandlers.examPapers.detail.GET;
export const PATCH = questionPaperRouteHandlers.examPapers.detail.PATCH;
