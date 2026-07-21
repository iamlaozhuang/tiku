import { createAdminRedeemCodeRuntimeRouteHandlers } from "@/server/services/admin-redeem-code-runtime";

const handlers = createAdminRedeemCodeRuntimeRouteHandlers();

export const POST = handlers.redeemCodes.revealPlainText.POST;
