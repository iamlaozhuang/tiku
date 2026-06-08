import type { AuthStatus, Profession } from "../models/auth";
import type {
  AuthorizationSourceSummaryRuntimeStatus,
  AuthorizationSourceSummarySource,
} from "../models/authorization-source-summary";
import type { AuthorizationContextSourceType } from "../models/authorization-context";

export type AuthorizationSourceSummaryRedactionStatus = "redacted";

export type AuthorizationSourceSummaryCountDto = {
  totalCount: number;
  activeCount: number;
  inactiveCount: number;
};

export type AuthorizationSourceSummaryRedeemCodeReferenceDto = {
  publicId: string | null;
  redactionStatus: AuthorizationSourceSummaryRedactionStatus;
};

export type AuthorizationSourceSummarySourceDto = {
  publicId: string;
  authorizationType: AuthorizationContextSourceType;
  profession: Profession;
  level: number;
  startsAt: string;
  expiresAt: string;
  status: AuthStatus;
  organizationPublicId: string | null;
  redeemCodeReference: AuthorizationSourceSummaryRedeemCodeReferenceDto;
};

export type AuthorizationSourceSummaryDto = {
  userPublicId: string;
  runtimeStatus: AuthorizationSourceSummaryRuntimeStatus;
  sourceSummary: AuthorizationSourceSummaryCountDto;
  authorizationSources: AuthorizationSourceSummarySourceDto[];
};

export function mapAuthorizationSourceToDto(
  authorizationSource: AuthorizationSourceSummarySource,
): AuthorizationSourceSummarySourceDto {
  return {
    publicId: authorizationSource.publicId,
    authorizationType: authorizationSource.authorizationType,
    profession: authorizationSource.profession,
    level: authorizationSource.level,
    startsAt: authorizationSource.startsAt.toISOString(),
    expiresAt: authorizationSource.expiresAt.toISOString(),
    status: authorizationSource.status,
    organizationPublicId: authorizationSource.organizationPublicId,
    redeemCodeReference: {
      publicId: authorizationSource.redeemCodePublicId,
      redactionStatus: "redacted",
    },
  };
}
