import { createAdminRedeemCodeRuntimeRouteHandlers } from "@/server/services/admin-redeem-code-runtime";

const handlers = createAdminRedeemCodeRuntimeRouteHandlers();

export const GET = handlers.redeemCodes.detail.GET;
