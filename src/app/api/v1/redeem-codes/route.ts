import { createAdminUserOrgAuthOpsRouteHandlers } from "@/server/services/admin-user-org-auth-ops-route";
import { createUnavailableAdminUserOrgAuthOpsService } from "@/server/services/admin-user-org-auth-ops-service";

const adminUserOrgAuthOpsRouteHandlers = createAdminUserOrgAuthOpsRouteHandlers(
  createUnavailableAdminUserOrgAuthOpsService(),
);

const responseContract = {
  code: 503601,
  message: "Admin user organization authorization runtime is not configured.",
  data: null,
  pagination: null,
};

void responseContract;

export const GET = adminUserOrgAuthOpsRouteHandlers.redeemCodes.GET;
