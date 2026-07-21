import { createPaperCompositionLifecycleRuntimeRouteHandlers } from "@/server/services/paper-composition-lifecycle-runtime";

const handlers = createPaperCompositionLifecycleRuntimeRouteHandlers();

export const POST = handlers.papers.questionGroups.POST;
export const PATCH = handlers.papers.questionGroups.PATCH;
export const DELETE = handlers.papers.questionGroups.DELETE;
