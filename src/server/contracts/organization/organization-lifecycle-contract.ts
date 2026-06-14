import type {
  AuthScopeType,
  AuthStatus,
  OrgTier,
  Profession,
} from "../../models/auth";
import type { OrgStatus } from "../../validators/organization";

export type OrganizationLifecycleGovernance = {
  advancedOrganizationPortalStatus: "blocked";
  advancedTrainingStatus: "blocked";
  blockedGates: string[];
  maxOrganizationDepth: 4;
  publicIdentifierPolicy: "public_id_only";
  standardEditionBoundary: "platform_managed_org_auth";
};

export const ORGANIZATION_LIFECYCLE_GOVERNANCE: OrganizationLifecycleGovernance =
  {
    advancedOrganizationPortalStatus: "blocked",
    advancedTrainingStatus: "blocked",
    blockedGates: [
      "schema_migration",
      "advanced_organization_portal_training",
      "env_provider_config",
      "cost_calibration",
    ],
    maxOrganizationDepth: 4,
    publicIdentifierPolicy: "public_id_only",
    standardEditionBoundary: "platform_managed_org_auth",
  };

export function createBlockedOrganizationAuthGovernanceHandoff(): OrganizationLifecycleGovernance {
  return {
    ...ORGANIZATION_LIFECYCLE_GOVERNANCE,
    blockedGates: [...ORGANIZATION_LIFECYCLE_GOVERNANCE.blockedGates],
  };
}

export type OrganizationLifecycleDto = {
  activeOrgAuthCount: number;
  contactName: string | null;
  contactPhone: string | null;
  createdAt: string;
  depth: number;
  employeeCount: number;
  name: string;
  orgTier: OrgTier;
  parentOrganizationPublicId: string | null;
  publicId: string;
  remark: string | null;
  status: OrgStatus;
  updatedAt: string;
};

export type OrganizationLifecycleListDto = {
  governance: OrganizationLifecycleGovernance;
  organizations: OrganizationLifecycleDto[];
};

export type OrganizationLifecycleResultDto = {
  governance: OrganizationLifecycleGovernance;
  organization: OrganizationLifecycleDto;
};

export type OrgAuthLifecycleDto = {
  accountQuota: number;
  authScopeType: AuthScopeType;
  cancelledAt: string | null;
  createdAt: string;
  expiresAt: string;
  level: number;
  name: string;
  organizationPublicIds: string[];
  profession: Profession;
  publicId: string;
  purchaserOrganizationPublicId: string;
  startsAt: string;
  status: AuthStatus;
  updatedAt: string;
  usedQuota: number;
};

export type OrgAuthLifecycleResultDto = {
  governance: OrganizationLifecycleGovernance;
  orgAuth: OrgAuthLifecycleDto;
};

export type EmployeeUnbindLifecycleEventDto = {
  affectedOrgAuthPublicIds: string[];
  employeeLifecycleStatus: "unbound";
  employeePublicId: string;
  enterpriseAccessStatus: "revoked";
  organizationPublicId: string;
  personalAuthFallback: "none" | "preserved";
  userPublicId: string;
};

export type EmployeeUnbindLifecycleResultDto = {
  governance: OrganizationLifecycleGovernance;
  lifecycleEvent: EmployeeUnbindLifecycleEventDto;
};
