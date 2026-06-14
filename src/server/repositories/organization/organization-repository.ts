import type {
  AuthScopeType,
  AuthStatus,
  OrgTier,
  Profession,
} from "../../models/auth";
import type { NormalizedCreateOrgAuthInput } from "../../validators/org-auth";
import type {
  NormalizedCreateOrganizationInput,
  OrgStatus,
} from "../../validators/organization";
import type { NormalizedOrganizationListQuery } from "../../validators/organization/list-query";

export type OrganizationRecord = {
  contactName: string | null;
  contactPhone: string | null;
  createdAt: string | Date;
  depth: number;
  employeeCount: number;
  internalNote?: string;
  internalNumericId?: number;
  name: string;
  orgTier: OrgTier;
  parentOrganizationPublicId: string | null;
  publicId: string;
  remark: string | null;
  status: OrgStatus;
  updatedAt: string | Date;
};

export type OrgAuthRecord = {
  accountQuota: number;
  authScopeType: AuthScopeType;
  cancelledAt: string | Date | null;
  createdAt: string | Date;
  expiresAt: string | Date;
  internalNote?: string;
  internalNumericId?: number;
  level: number;
  name: string;
  organizationPublicIds: string[];
  profession: Profession;
  publicId: string;
  purchaserOrganizationPublicId: string;
  startsAt: string | Date;
  status: AuthStatus;
  updatedAt: string | Date;
  usedQuota: number;
};

export type EmployeeRecord = {
  internalNote?: string;
  internalNumericId?: number;
  organizationPublicId: string;
  personalAuthPublicId: string | null;
  publicId: string;
  status: "active" | "disabled" | "unbound";
  userPublicId: string;
};

export type CreateOrganizationRecordInput =
  NormalizedCreateOrganizationInput & {
    depth: number;
  };

export type OrganizationListResult = {
  organizations: OrganizationRecord[];
  total: number;
};

export type EmployeeUnbindInput = {
  employeePublicId: string;
  organizationPublicId: string;
  reason: string | null;
};

export type EmployeeUnbindResult = {
  affectedOrgAuthPublicIds: string[];
  employee: EmployeeRecord;
};

export type OrganizationRepository = {
  countActiveOrgAuths(organizationPublicId: string): Promise<number>;
  createOrgAuth(input: NormalizedCreateOrgAuthInput): Promise<OrgAuthRecord>;
  createOrganization(
    input: CreateOrganizationRecordInput,
  ): Promise<OrganizationRecord>;
  findOrganizationByPublicId(
    publicId: string,
  ): Promise<OrganizationRecord | null>;
  hasOverlappingOrgAuth(input: NormalizedCreateOrgAuthInput): Promise<boolean>;
  listOrganizations(
    query: NormalizedOrganizationListQuery,
  ): Promise<OrganizationListResult>;
  unbindEmployee(
    input: EmployeeUnbindInput,
  ): Promise<EmployeeUnbindResult | null>;
};
