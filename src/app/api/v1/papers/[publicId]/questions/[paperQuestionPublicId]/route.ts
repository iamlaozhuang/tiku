import { createPaperCompositionLifecycleRuntimeRouteHandlers } from "@/server/services/paper-composition-lifecycle-runtime";

const paperRuntimeRouteHandlers =
  createPaperCompositionLifecycleRuntimeRouteHandlers();

export const PATCH = paperRuntimeRouteHandlers.papers.questions.PATCH;
export const DELETE = paperRuntimeRouteHandlers.papers.questions.DELETE;
