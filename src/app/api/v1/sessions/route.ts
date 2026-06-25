import { createLocalSessionRouteHandlers } from "@/server/auth/local-session-runtime";
import { createLocalSessionLogoutRouteHandler } from "@/server/auth/local-session-logout-route";

const sessionRouteHandlers = createLocalSessionRouteHandlers();

export const DELETE = createLocalSessionLogoutRouteHandler();
export const GET = sessionRouteHandlers.GET;
export const POST = sessionRouteHandlers.POST;
