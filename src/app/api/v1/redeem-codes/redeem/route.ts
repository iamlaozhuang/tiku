import { createStudentAuthorizationRedeemRuntimeRouteHandlers } from "@/server/services/student-authorization-redeem-runtime";

const authorizationRedeemRuntimeRouteHandlers =
  createStudentAuthorizationRedeemRuntimeRouteHandlers();

const responseContract = {
  code: 401001,
  message: "User session is required.",
  data: null,
};

void responseContract;

export const POST =
  authorizationRedeemRuntimeRouteHandlers.redeemCodes.redeem.POST;
