import { createStudentAuthorizationRedeemRuntimeRouteHandlers } from "@/server/services/student-authorization-redeem-runtime";

const authorizationRedeemRuntimeRouteHandlers =
  createStudentAuthorizationRedeemRuntimeRouteHandlers();

export const POST =
  authorizationRedeemRuntimeRouteHandlers.redeemCodes.preview.POST;
