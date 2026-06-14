export type RegistrationAuthorizationNextAction = "redeem_code";

export type RegistrationAuthorizationPayload = {
  nextAction: RegistrationAuthorizationNextAction;
};

export type RegistrationAuthorizationContinuation = {
  authScopeType: "personal_auth";
  nextAction: RegistrationAuthorizationNextAction;
  redirectPath: "/redeem-code";
  requiresAuthenticatedSession: true;
};

export function createRegistrationAuthorizationContinuation(
  registrationPayload: RegistrationAuthorizationPayload,
): RegistrationAuthorizationContinuation {
  return {
    authScopeType: "personal_auth",
    nextAction: registrationPayload.nextAction,
    redirectPath: "/redeem-code",
    requiresAuthenticatedSession: true,
  };
}
