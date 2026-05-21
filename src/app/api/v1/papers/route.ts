import { createAdminFlowRuntimeRouteHandlers } from "@/server/services/admin-flow-runtime";
import { createPaperDraftRouteHandlers } from "@/server/services/paper-draft-route";
import { createUnavailablePaperDraftService } from "@/server/services/paper-draft-service";

const adminFlowRuntimeRouteHandlers = createAdminFlowRuntimeRouteHandlers();

const paperRouteHandlers = createPaperDraftRouteHandlers(
  createUnavailablePaperDraftService(),
);

export const GET = adminFlowRuntimeRouteHandlers.papers.collection.GET;
export const POST = paperRouteHandlers.collection.POST;
