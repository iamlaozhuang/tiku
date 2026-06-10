import type { AuthStatus, Profession } from "./auth";
import type { AuthorizationContextSourceType } from "./authorization-context";

export type AuthorizationSourceTypeSummaryRuntimeStatus = "local_contract_only";

export type AuthorizationSourceTypeSummaryStatus = "source_summary_only";

export type AuthorizationSourceTypeSummarySource = {
  authorizationType: AuthorizationContextSourceType;
  publicId: string;
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
