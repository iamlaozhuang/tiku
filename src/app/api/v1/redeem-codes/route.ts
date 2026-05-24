import { createAdminRedeemCodeRuntimeRouteHandlers } from "@/server/services/admin-redeem-code-runtime";

const adminRedeemCodeRouteHandlers =
  createAdminRedeemCodeRuntimeRouteHandlers();

export const GET = adminRedeemCodeRouteHandlers.redeemCodes.GET;
export const POST = adminRedeemCodeRouteHandlers.redeemCodes.POST;
