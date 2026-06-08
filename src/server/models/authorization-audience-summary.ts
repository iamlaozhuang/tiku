import type { AuthorizationContextSourceType } from "./authorization-context";

export type AuthorizationAudienceDisplayStatus = "display_only";

export type AuthorizationAudienceType = "personal_auth" | "org_auth";

export type AuthorizationAudienceSourceInput = {
  publicId: string;
  authorizationType: AuthorizationContextSourceType;
  organizationPublicId: string | null;
};

export type AuthorizationAudienceSummaryInput = {
  userPublicId: string;
  authorizationSources: AuthorizationAudienceSourceInput[];
};
