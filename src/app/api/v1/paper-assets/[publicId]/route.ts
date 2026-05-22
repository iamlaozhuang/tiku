import { createPaperCompositionLifecycleRuntimeRouteHandlers } from "@/server/services/paper-composition-lifecycle-runtime";

const paperRuntimeRouteHandlers =
  createPaperCompositionLifecycleRuntimeRouteHandlers();

export const GET = paperRuntimeRouteHandlers.paperAssets.detail.GET;
export const DELETE = paperRuntimeRouteHandlers.paperAssets.detail.DELETE;
