import { createUnavailableUserRegistrationRouteHandlers } from "@/server/auth/user-registration-route";

const userRegistrationRouteHandlers =
  createUnavailableUserRegistrationRouteHandlers();

const responseContract = {
  code: 503002,
  message: "User registration runtime is not configured.",
  data: null,
};

void responseContract;

export const POST = userRegistrationRouteHandlers.POST;
