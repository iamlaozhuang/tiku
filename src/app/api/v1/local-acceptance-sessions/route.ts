import { createLocalAcceptanceSessionRouteHandlers } from "@/server/services/local-acceptance-session-service";

const localAcceptanceSessionRouteHandlers =
  createLocalAcceptanceSessionRouteHandlers();

export const POST = localAcceptanceSessionRouteHandlers.POST;
