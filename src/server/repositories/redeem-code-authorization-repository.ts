import type { AuthStatus, Profession, RedeemCodeStatus } from "../models/auth";

export type RedeemCodeAuthorizationRow = {
  id: number;
  public_id: string;
  code_display: string;
  profession: Profession;
  level: number;
  duration_day: number;
  redeem_deadline_at: Date;
  status: RedeemCodeStatus;
  used_by_user_id: number | null;
  used_at: Date | null;
};

export type PersonalAuthAccessRow = {
  id: number;
  public_id: string;
  redeem_code_public_id: string;
  profession: Profession;
  level: number;
  starts_at: Date;
  expires_at: Date;
  status: AuthStatus;
};

export type RedeemCodeForUserInput = {
  code: string;
  redeemCodeId: number;
  userPublicId: string;
  redeemedAt: Date;
  durationDay: number;
};

export type RedeemCodeAuthorizationRepository = {
  findRedeemCodeByCode(
    code: string,
  ): Promise<RedeemCodeAuthorizationRow | null>;
  redeemCodeForUser(
    input: RedeemCodeForUserInput,
  ): Promise<PersonalAuthAccessRow | null>;
  listPersonalAuthsByUserPublicId(
    userPublicId: string,
  ): Promise<PersonalAuthAccessRow[]>;
};
