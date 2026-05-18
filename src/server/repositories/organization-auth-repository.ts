import type {
  AuthScopeType,
  AuthStatus,
  OrgTier,
  Profession,
} from "../models/auth";
import type {
  NormalizedCreateOrganizationInput,
  NormalizedUpdateOrganizationInput,
  OrgStatus,
} from "../validators/organization";
import type { NormalizedCreateOrgAuthInput } from "../validators/org-auth";

export type OrganizationAccessRow = {
  id: number;
  public_id: string;
  name: string;
  org_tier: OrgTier;
  parent_organization_public_id: string | null;
  status: OrgStatus;
  contact_name: string | null;
  contact_phone: string | null;
  remark: string | null;
  depth: number;
  created_at: Date;
  updated_at: Date;
};

export type OrgAuthAccessRow = {
  id: number;
  public_id: string;
  name: string;
  purchaser_organization_public_id: string;
  auth_scope_type: AuthScopeType;
  profession: Profession;
  level: number;
  account_quota: number;
  used_quota: number;
  starts_at: Date;
  expires_at: Date;
  status: AuthStatus;
  cancelled_at: Date | null;
  organization_public_ids: string[];
  created_at: Date;
  updated_at: Date;
};

export type UpdateOrganizationInput = NormalizedUpdateOrganizationInput & {
  publicId: string;
};

export type DisableOrganizationInput = {
  publicId: string;
  isCascade: boolean;
};

export type DisableOrganizationResult = {
  organization: OrganizationAccessRow;
  affectedOrganizationPublicIds: string[];
};

export type OrgAuthOverlapInput = NormalizedCreateOrgAuthInput;

export type OrganizationAuthRepository = {
  findOrganizationByPublicId(
    publicId: string,
  ): Promise<OrganizationAccessRow | null>;
  getOrganizationDepth(publicId: string): Promise<number | null>;
  isOrganizationDescendant(input: {
    organizationPublicId: string;
    candidateParentOrganizationPublicId: string;
  }): Promise<boolean>;
  createOrganization(
    input: NormalizedCreateOrganizationInput,
  ): Promise<OrganizationAccessRow>;
  updateOrganization(
    input: UpdateOrganizationInput,
  ): Promise<OrganizationAccessRow>;
  disableOrganization(
    input: DisableOrganizationInput,
  ): Promise<DisableOrganizationResult>;
  hasOverlappingOrgAuth(input: OrgAuthOverlapInput): Promise<boolean>;
  createOrgAuth(input: NormalizedCreateOrgAuthInput): Promise<OrgAuthAccessRow>;
  cancelOrgAuth(publicId: string): Promise<OrgAuthAccessRow | null>;
};
