import type {
  AuthStatus,
  AuthUpgradeStatus,
  AuthorizationEdition,
  Profession,
} from "../models/auth";
import type { OrgStatus } from "../validators/organization";

export type EffectivePersonalAuthRow = {
  id: number;
  public_id: string;
  edition?: AuthorizationEdition;
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
  edition?: AuthorizationEdition;
  profession: Profession;
  level: number;
  starts_at: Date;
  expires_at: Date;
  status: AuthStatus;
};

export type EffectiveAuthUpgradeRow = {
  personal_auth_public_id: string | null;
  org_auth_public_id: string | null;
  target_edition: AuthorizationEdition;
  starts_at: Date;
  expires_at: Date;
  revoked_at: Date | null;
  status: AuthUpgradeStatus;
};

export type EffectiveAuthorizationRepository = {
  listPersonalAuthsByUserPublicId(
    userPublicId: string,
  ): Promise<EffectivePersonalAuthRow[]>;
  listOrgAuthsByUserPublicId(
    userPublicId: string,
  ): Promise<EffectiveOrgAuthRow[]>;
  listAuthUpgradesByAuthorizationPublicIds?(
    authorizationPublicIds: string[],
  ): Promise<EffectiveAuthUpgradeRow[]>;
};
