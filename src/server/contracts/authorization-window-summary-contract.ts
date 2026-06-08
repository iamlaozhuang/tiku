import type {
  AuthorizationWindowDisplayStatus,
  AuthorizationWindowStatus,
} from "../models/authorization-window-summary";

export type AuthorizationWindowSummaryDto = {
  userPublicId: string;
  authorizationPublicId: string;
  displayStatus: AuthorizationWindowDisplayStatus;
  startsAt: string;
  expiresAt: string | null;
  currentAt: string;
  windowStatus: AuthorizationWindowStatus;
};
