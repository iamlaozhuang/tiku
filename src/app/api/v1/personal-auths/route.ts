import { createUnavailableRedeemCodeAuthorizationService } from "@/server/services/redeem-code-authorization-service";
import {
  createPersonalAuthRouteHandlers,
  createUnavailableAuthorizationUserResolver,
} from "@/server/services/redeem-code-route";

const personalAuthRouteHandlers = createPersonalAuthRouteHandlers(
  createUnavailableRedeemCodeAuthorizationService(),
  createUnavailableAuthorizationUserResolver(),
);

const responseContract = {
  code: 401001,
  message: "User session is required.",
  data: null,
};

void responseContract;

export const GET = personalAuthRouteHandlers.GET;
