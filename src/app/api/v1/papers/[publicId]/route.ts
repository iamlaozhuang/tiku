import { createPaperCompositionLifecycleRuntimeRouteHandlers } from "@/server/services/paper-composition-lifecycle-runtime";

const paperRuntimeRouteHandlers =
  createPaperCompositionLifecycleRuntimeRouteHandlers();

export const GET = paperRuntimeRouteHandlers.papers.detail.GET;
export const PATCH = paperRuntimeRouteHandlers.papers.detail.PATCH;
export const DELETE = paperRuntimeRouteHandlers.papers.detail.DELETE;
