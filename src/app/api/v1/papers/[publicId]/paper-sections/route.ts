import { createPaperCompositionLifecycleRuntimeRouteHandlers } from "@/server/services/paper-composition-lifecycle-runtime";

const handlers = createPaperCompositionLifecycleRuntimeRouteHandlers();

export const POST = handlers.papers.paperSections.POST;
export const PATCH = handlers.papers.paperSections.PATCH;
export const DELETE = handlers.papers.paperSections.DELETE;
