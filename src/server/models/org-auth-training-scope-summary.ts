import type { AuthScopeType, Profession } from "./auth";

export type OrgAuthTrainingScopeRuntimeStatus = "local_contract_only";

export type OrgAuthTrainingContentAccessStatus = "scope_only";

export type OrgAuthTrainingScopeSummaryInput = {
  userPublicId: string;
  employeePublicId: string | null;
  orgAuthPublicId: string;
  purchaserOrganizationPublicId: string;
  coveredOrganizationPublicIds: string[];
  authScopeType: AuthScopeType;
  profession: Profession;
  level: number;
  accountQuota: number;
  usedQuota: number;
  paperPublicId: string | null;
  mockExamPublicId: string | null;
  redeemCodePublicId: string | null;
  auditLogPublicId: string | null;
  aiCallLogPublicId: string | null;
};
