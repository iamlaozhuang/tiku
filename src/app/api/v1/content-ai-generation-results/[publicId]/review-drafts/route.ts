import { createAdminAiGenerationReviewDraftRuntimeRouteHandlers } from "@/server/services/admin-ai-generation-review-draft-runtime";

const handlers = createAdminAiGenerationReviewDraftRuntimeRouteHandlers();

export const GET = handlers.reviewDrafts.GET;
export const PUT = handlers.reviewDrafts.PUT;
