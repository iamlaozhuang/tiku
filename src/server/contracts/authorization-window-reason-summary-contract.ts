import type {
  AuthorizationWindowReasonCode,
  AuthorizationWindowReasonSummaryStatus,
} from "../models/authorization-window-reason-summary";

export type AuthorizationWindowReasonSummaryDto = {
  userPublicId: string;
  authorizationPublicId: string;
  reasonStatus: AuthorizationWindowReasonSummaryStatus;
  startsAt: string;
  expiresAt: string | null;
  currentAt: string;
  windowReasonCode: AuthorizationWindowReasonCode;
};
