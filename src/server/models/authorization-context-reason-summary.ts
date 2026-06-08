import type { Profession } from "./auth";

export type AuthorizationContextReasonSummaryStatus = "reason_summary_only";

export type AuthorizationContextReasonCode =
  | "context_matches_authorization"
  | "context_mismatch";

export type AuthorizationReasonContextInput = {
  publicId: string;
  profession: Profession;
  level: number;
};

export type AuthorizationContextReasonSummaryInput = {
  userPublicId: string;
  authorizationPublicId: string;
  authorizationProfession: Profession;
  authorizationLevel: number;
  paperContext: AuthorizationReasonContextInput | null;
  mockExamContext: AuthorizationReasonContextInput | null;
};
