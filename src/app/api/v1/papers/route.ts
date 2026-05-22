import { createAdminFlowRuntimeRouteHandlers } from "@/server/services/admin-flow-runtime";
import { createPaperCompositionLifecycleRuntimeRouteHandlers } from "@/server/services/paper-composition-lifecycle-runtime";

const adminFlowRuntimeRouteHandlers = createAdminFlowRuntimeRouteHandlers();
const paperRuntimeRouteHandlers =
  createPaperCompositionLifecycleRuntimeRouteHandlers();

export const GET = adminFlowRuntimeRouteHandlers.papers.collection.GET;
export const POST = paperRuntimeRouteHandlers.papers.collection.POST;
