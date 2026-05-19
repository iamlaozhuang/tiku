import { createMaterialRouteHandlers } from "@/server/services/material-route";
import { createUnavailableMaterialService } from "@/server/services/material-service";

const materialRouteHandlers = createMaterialRouteHandlers(
  createUnavailableMaterialService(),
);

const responseContract = {
  code: 503201,
  message: "Material runtime is not configured.",
  data: null,
};

void responseContract;

export const GET = materialRouteHandlers.GET;
export const POST = materialRouteHandlers.POST;
