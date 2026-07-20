import type {
  AuthStatus,
  AuthUpgradeStatus,
  AuthorizationEdition,
  AuthScopeType,
  OrgTier,
  Profession,
  UserStatus,
} from "../models/auth";
import type { Subject } from "../models/paper";
import type { OrgStatus } from "../validators/organization";

export type OrganizationPortalOverviewOrganizationDto = {
  displayName: string;
  orgTier: OrgTier;
  status: OrgStatus;
};

export type OrganizationPortalEmployeeSummaryDto = {
  total: number;
  active: number;
  disabled: number;
  locked: number;
};

export type OrganizationPortalEmployeeDto = {
  employeeDisplayName: string;
  phoneMasked: string;
  status: UserStatus;
};

export type OrganizationPortalAuthorizationScopeDto = {
  profession: Profession;
  level: number;
  subject: Subject | null;
  organizationCount: number;
};

export type OrganizationPortalAuthorizationDto = {
  packageName: string;
  sourceEdition: AuthorizationEdition;
  effectiveEdition: AuthorizationEdition;
  status: AuthStatus | "not_started";
  startsAt: string;
  expiresAt: string;
  accountQuota: number;
  usedQuota: number;
  availableQuota: number;
  authScopeType: AuthScopeType;
  scopes: OrganizationPortalAuthorizationScopeDto[];
  upgradeStatus: AuthUpgradeStatus | "none";
};

export type OrganizationPortalBoundaryDto = {
  isReadonly: true;
  mutationOwnerLabel: "平台运营";
  redactionStatus: "summary_only";
};

export type OrganizationPortalOverviewDto = {
  organization: OrganizationPortalOverviewOrganizationDto;
  employeeSummary: OrganizationPortalEmployeeSummaryDto;
  employees: OrganizationPortalEmployeeDto[];
  authorizations: OrganizationPortalAuthorizationDto[];
  boundary: OrganizationPortalBoundaryDto;
  updatedAt: string;
};
