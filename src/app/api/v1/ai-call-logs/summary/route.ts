import { createAiCallLogRouteHandlers } from "@/server/services/ai-call-log/route-handlers";

const aiCallLogRouteHandlers = createAiCallLogRouteHandlers();

export const GET = aiCallLogRouteHandlers.aiCallLogSummary.GET;
