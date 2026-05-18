import { createUnavailableRedeemCodeAuthorizationService } from "@/server/services/redeem-code-authorization-service";
import {
  createRedeemCodeRouteHandlers,
  createUnavailableAuthorizationUserResolver,
} from "@/server/services/redeem-code-route";

const redeemCodeRouteHandlers = createRedeemCodeRouteHandlers(
  createUnavailableRedeemCodeAuthorizationService(),
  createUnavailableAuthorizationUserResolver(),
);

const responseContract = {
  code: 401001,
  message: "User session is required.",
  data: null,
};

void responseContract;

export const POST = redeemCodeRouteHandlers.POST;
