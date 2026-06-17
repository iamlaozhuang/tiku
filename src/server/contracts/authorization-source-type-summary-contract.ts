import type { AuthStatus, Profession } from "../models/auth";
import type { AuthorizationContextSourceType } from "../models/authorization-context";
import type {
  EffectiveAuthorizationEdition,
  EffectiveAuthorizationOwnerType,
} from "./effective-authorization-contract";
import type {
  AuthorizationSourceTypeSummaryAggregateStatus,
  AuthorizationSourceTypeSummaryRuntimeStatus,
  AuthorizationSourceTypeSummaryStatus,
} from "../models/authorization-source-type-summary";

export type AuthorizationSourceTypeSummaryCountDto = {
  totalCount: number;
  personalAuthCount: number;
  orgAuthCount: number;
  activePersonalAuthCount: number;
  activeOrgAuthCount: number;
  organizationReferenceCount: number;
};

export type AuthorizationSourceTypeEffectiveWindowDto = {
  earliestStartsAt: string;
  latestExpiresAt: string;
};

export type AuthorizationSourceTypeDto = {
  authorizationPublicId: string;
  authorizationSource: AuthorizationContextSourceType;
  effectiveEdition: EffectiveAuthorizationEdition;
  ownerType: EffectiveAuthorizationOwnerType;
  ownerPublicId: string;
  quotaOwnerType: EffectiveAuthorizationOwnerType;
  quotaOwnerPublicId: string;
  profession: Profession;
  level: number;
  startsAt: string;
  expiresAt: string;
  status: AuthStatus;
  organizationPublicId: string | null;
  summaryStatus: AuthorizationSourceTypeSummaryStatus;
};

export type AuthorizationSourceTypeSummaryDto = {
  userPublicId: string;
  runtimeStatus: AuthorizationSourceTypeSummaryRuntimeStatus;
  sourceSummaryStatus: AuthorizationSourceTypeSummaryAggregateStatus;
  sourceTypeSummary: AuthorizationSourceTypeSummaryCountDto;
  effectiveWindow: AuthorizationSourceTypeEffectiveWindowDto;
  sourceTypes: AuthorizationSourceTypeDto[];
};
