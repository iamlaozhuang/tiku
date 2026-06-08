import type {
  AuthorizationAudienceDisplayStatus,
  AuthorizationAudienceType,
} from "../models/authorization-audience-summary";
import type { AuthorizationContextSourceType } from "../models/authorization-context";

export type AuthorizationAudienceSummaryCountDto = {
  totalCount: number;
  personalAuthCount: number;
  orgAuthCount: number;
  organizationReferenceCount: number;
};

export type AuthorizationAudienceDto = {
  authorizationPublicId: string;
  authorizationType: AuthorizationContextSourceType;
  audienceType: AuthorizationAudienceType;
  organizationPublicId: string | null;
};

export type AuthorizationAudienceSummaryDto = {
  userPublicId: string;
  displayStatus: AuthorizationAudienceDisplayStatus;
  audienceSummary: AuthorizationAudienceSummaryCountDto;
  audiences: AuthorizationAudienceDto[];
};
