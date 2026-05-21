import { createLocalSessionRouteHandlers } from "@/server/auth/local-session-runtime";

const sessionRouteHandlers = createLocalSessionRouteHandlers();

export const GET = sessionRouteHandlers.GET;
export const POST = sessionRouteHandlers.POST;
