import { createAdminContentKnowledgeOpsRouteHandlers } from "@/server/services/admin-content-knowledge-ops-route";
import { createUnavailableAdminContentKnowledgeOpsService } from "@/server/services/admin-content-knowledge-ops-service";

const adminContentKnowledgeOpsRouteHandlers =
  createAdminContentKnowledgeOpsRouteHandlers(
    createUnavailableAdminContentKnowledgeOpsService(),
  );

const responseContract = {
  code: 503621,
  message: "Admin content and knowledge runtime is not configured.",
  data: null,
};

void responseContract;

export const POST =
  adminContentKnowledgeOpsRouteHandlers.rebuildResourceVector.POST;
