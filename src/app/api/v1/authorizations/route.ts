import { createUnavailableEffectiveAuthorizationService } from "@/server/services/effective-authorization-service";
import {
  createEffectiveAuthorizationRouteHandlers,
  createUnavailableEffectiveAuthorizationUserResolver,
} from "@/server/services/effective-authorization-route";

const effectiveAuthorizationRouteHandlers =
  createEffectiveAuthorizationRouteHandlers(
    createUnavailableEffectiveAuthorizationService(),
    createUnavailableEffectiveAuthorizationUserResolver(),
  );

const responseContract = {
  code: 401001,
  message: "User session is required.",
  data: null,
};

void responseContract;

export const GET = effectiveAuthorizationRouteHandlers.GET;
