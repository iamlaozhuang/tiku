import { createPaperCompositionLifecycleRuntimeRouteHandlers } from "@/server/services/paper-composition-lifecycle-runtime";

const paperRuntimeRouteHandlers =
  createPaperCompositionLifecycleRuntimeRouteHandlers();

export const GET = paperRuntimeRouteHandlers.paperAssets.collection.GET;
export const POST = paperRuntimeRouteHandlers.paperAssets.collection.POST;
