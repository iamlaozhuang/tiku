import type { AuthStatus, Profession } from "./auth";
import type { AuthorizationContextSourceType } from "./authorization-context";

export type AuthorizationSourceSummaryRuntimeStatus = "local_contract_only";

export type AuthorizationSourceSummarySource = {
  authorizationType: AuthorizationContextSourceType;
  publicId: string;
  profession: Profession;
  level: number;
  startsAt: Date;
  expiresAt: Date;
  status: AuthStatus;
  organizationPublicId: string | null;
  redeemCodePublicId: string | null;
};

export type AuthorizationSourceSummaryInput = {
  userPublicId: string;
  authorizationSources: AuthorizationSourceSummarySource[];
};
