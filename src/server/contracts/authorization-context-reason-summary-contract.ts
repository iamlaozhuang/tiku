import type {
  AuthorizationContextReasonCode,
  AuthorizationContextReasonSummaryStatus,
} from "../models/authorization-context-reason-summary";
import type { Profession } from "../models/auth";

export type AuthorizationReasonContextDto = {
  publicId: string;
  profession: Profession;
  level: number;
  contextReasonCode: AuthorizationContextReasonCode;
};

export type AuthorizationContextReasonSummaryDto = {
  userPublicId: string;
  authorizationPublicId: string;
  reasonStatus: AuthorizationContextReasonSummaryStatus;
  paper: AuthorizationReasonContextDto | null;
  mockExam: AuthorizationReasonContextDto | null;
};
