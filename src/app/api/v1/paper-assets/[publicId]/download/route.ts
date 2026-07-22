import { createPaperCompositionLifecycleRuntimeRouteHandlers } from "@/server/services/paper-composition-lifecycle-runtime";

const handlers = createPaperCompositionLifecycleRuntimeRouteHandlers();

export const GET = handlers.paperAssets.download.GET;
