import type { AuthStatus, Profession } from "./auth";
import type { AuthorizationContextSourceType } from "./authorization-context";
import type { EffectiveAuthorizationEdition } from "../contracts/effective-authorization-contract";

export type AuthorizationSourceTypeSummaryRuntimeStatus = "local_contract_only";

export type AuthorizationSourceTypeSummaryAggregateStatus =
  "personal_org_summary";

export type AuthorizationSourceTypeSummaryStatus = "source_summary_only";

export type AuthorizationSourceTypeSummarySource = {
  authorizationType: AuthorizationContextSourceType;
  publicId: string;
  effectiveEdition: EffectiveAuthorizationEdition;
  profession: Profession;
  level: number;
  startsAt: Date;
  expiresAt: Date;
  status: AuthStatus;
  organizationPublicId: string | null;
};

export type AuthorizationSourceTypeSummaryInput = {
  userPublicId: string;
  authorizationSources: AuthorizationSourceTypeSummarySource[];
};
