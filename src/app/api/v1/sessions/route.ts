import { createUnavailableSessionRouteHandlers } from "@/server/auth/session-route";

const sessionRouteHandlers = createUnavailableSessionRouteHandlers();

const responseContract = {
  code: 503001,
  message: "Session runtime is not configured.",
  data: null,
};

void responseContract;

export const GET = sessionRouteHandlers.GET;
export const POST = sessionRouteHandlers.POST;
