import type {
  AuthScopeType,
  AuthStatus,
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
  createdAt: string;
  updatedAt: string;
};

export type OrganizationResultDto = {
  organization: OrganizationDto;
};

export type DisableOrganizationResultDto = OrganizationResultDto & {
  affectedOrganizationPublicIds: string[];
};

export type OrgAuthDto = {
  publicId: string;
  name: string;
  purchaserOrganizationPublicId: string;
  authScopeType: AuthScopeType;
  profession: Profession;
  level: number;
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

export type OrgAuthResultDto = {
  orgAuth: OrgAuthDto;
};

export type OrgAuthListDto = {
  orgAuths: OrgAuthDto[];
};
