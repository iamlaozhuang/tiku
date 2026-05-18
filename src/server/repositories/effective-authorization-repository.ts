import type { AuthStatus, Profession } from "../models/auth";
import type { OrgStatus } from "../validators/organization";

export type EffectivePersonalAuthRow = {
  id: number;
  public_id: string;
  profession: Profession;
  level: number;
  starts_at: Date;
  expires_at: Date;
  status: AuthStatus;
};

export type EffectiveOrgAuthRow = {
  id: number;
  public_id: string;
  organization_public_id: string;
  organization_name: string;
  organization_status: OrgStatus;
  profession: Profession;
  level: number;
  starts_at: Date;
  expires_at: Date;
  status: AuthStatus;
};

export type EffectiveAuthorizationRepository = {
  listPersonalAuthsByUserPublicId(
    userPublicId: string,
  ): Promise<EffectivePersonalAuthRow[]>;
  listOrgAuthsByUserPublicId(
    userPublicId: string,
  ): Promise<EffectiveOrgAuthRow[]>;
};
