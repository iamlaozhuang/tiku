import { createPaperAssetRouteHandlers } from "@/server/services/paper-asset-route";
import { createUnavailablePaperAssetService } from "@/server/services/paper-asset-service";

const paperAssetRouteHandlers = createPaperAssetRouteHandlers(
  createUnavailablePaperAssetService(),
);

const responseContract = {
  code: 503204,
  message: "Paper asset runtime is not configured.",
  data: null,
};

void responseContract;

export const GET = paperAssetRouteHandlers.detail.GET;
export const DELETE = paperAssetRouteHandlers.detail.DELETE;
