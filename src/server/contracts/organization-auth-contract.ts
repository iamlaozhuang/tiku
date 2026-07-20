import type {
  AuthScopeType,
  AuthStatus,
  AuthUpgradeStatus,
  AuthorizationEdition,
  OrgTier,
  Profession,
} from "../models/auth";
import type { OrgStatus } from "../validators/organization";

export type OrganizationDto = {
  publicId: string;
  name: string;
  orgTier: OrgTier;
  parentOrganizationPublicId: string | null;
  status: OrgStatus;
  contactName: string | null;
  contactPhone: string | null;
  remark: string | null;
  revision: number;
  createdAt: string;
  updatedAt: string;
};

export type OrganizationResultDto = {
  organization: OrganizationDto;
};

export type DisableOrganizationResultDto = OrganizationResultDto & {
  activeFlowTermination?: {
    practiceCount: number;
    mockExamCount: number;
  };
  affectedOrganizationPublicIds: string[];
};

export type OrgAuthDto = {
  publicId: string;
  name: string;
  purchaserOrganizationPublicId: string;
  authScopeType: AuthScopeType;
  profession: Profession;
  level: number;
  edition?: AuthorizationEdition;
  effectiveEdition?: AuthorizationEdition;
  upgradeStatus?: AuthUpgradeStatus | "none";
  accountQuota: number;
  usedQuota: number;
  startsAt: string;
  expiresAt: string;
  status: AuthStatus;
  cancelledAt: string | null;
  organizationPublicIds: string[];
  createdAt: string;
  updatedAt: string;
};

export type OrgAuthDetailOrganizationDto = {
  publicId: string;
  name: string;
  orgTier: OrgTier;
  status?: OrgStatus;
  parentOrganizationPublicId?: string | null;
  employeeCount?: number;
};

export type OrgAuthDetailOccupancyDto = {
  accountQuota: number;
  usedQuota: number;
  availableQuota: number;
};

export type OrgAuthTimelineEventDto = {
  actionType: string;
  actorRole: string;
  createdAt: string;
  metadataSummary: string | null;
  publicId: string;
  resultStatus: string;
};

export type OrgAuthDetailDto = OrgAuthDto & {
  purchaserOrganization: Required<
    Pick<
      OrgAuthDetailOrganizationDto,
      "name" | "orgTier" | "publicId" | "status"
    >
  >;
  coveredOrganizations: Required<
    Pick<
      OrgAuthDetailOrganizationDto,
      | "employeeCount"
      | "name"
      | "orgTier"
      | "parentOrganizationPublicId"
      | "publicId"
    >
  >[];
  occupancy: OrgAuthDetailOccupancyDto;
  timeline?: OrgAuthTimelineEventDto[];
};

export type OrgAuthResultDto = {
  orgAuth: OrgAuthDto;
  orgAuths: OrgAuthDto[];
};

export type OrgAuthManualUpgradeResultDto = {
  action: "manual_upgrade";
  orgAuth: OrgAuthDto;
};

export type OrgAuthReplacementResultDto = {
  action: "transactional_replacement";
  orgAuth: OrgAuthDto;
  previousOrgAuth: OrgAuthDto;
};

export type OrgAuthRenewalResultDto = {
  action: "renewal_successor";
  orgAuth: OrgAuthDto;
  previousOrgAuth: OrgAuthDto;
};

export type OrgAuthQuotaExpansionResultDto = {
  action: "quota_expansion";
  orgAuth: OrgAuthDto;
};

export type OrgAuthClosureActionResultDto =
  | OrgAuthManualUpgradeResultDto
  | OrgAuthQuotaExpansionResultDto
  | OrgAuthReplacementResultDto
  | OrgAuthRenewalResultDto;

export type OrgAuthDetailResultDto = {
  orgAuth: OrgAuthDetailDto;
};

export type OrgAuthListDto = {
  orgAuths: OrgAuthDto[];
};
