import { createPaperCompositionLifecycleRuntimeRouteHandlers } from "@/server/services/paper-composition-lifecycle-runtime";

const paperRuntimeRouteHandlers =
  createPaperCompositionLifecycleRuntimeRouteHandlers();

export const POST = paperRuntimeRouteHandlers.papers.publish.POST;
