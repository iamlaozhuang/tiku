import { createPaperDraftRouteHandlers } from "@/server/services/paper-draft-route";
import { createUnavailablePaperDraftService } from "@/server/services/paper-draft-service";

const paperRouteHandlers = createPaperDraftRouteHandlers(
  createUnavailablePaperDraftService(),
);

const responseContract = {
  code: 503203,
  message: "Paper runtime is not configured.",
  data: null,
};

void responseContract;

export const GET = paperRouteHandlers.GET;
export const POST = paperRouteHandlers.POST;
