import type {
  AuthStatus,
  AuthorizationEdition,
  Profession,
  RedeemCodeStatus,
  RedeemCodeType,
} from "../models/auth";

export type RedeemCodeAuthorizationRow = {
  id: number;
  public_id: string;
  profession: Profession;
  level: number;
  redeem_code_type: RedeemCodeType;
  duration_day: number;
  redeem_deadline_at: Date;
  status: RedeemCodeStatus;
  used_by_user_id: number | null;
  used_at: Date | null;
  updated_at: Date;
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

export type PersonalAuthPreviewRow = PersonalAuthAccessRow & {
  edition: AuthorizationEdition;
  updated_at: Date;
};

export type RedeemCodePreviewFacts = {
  redeemCode: RedeemCodeAuthorizationRow;
  activePersonalAuths: PersonalAuthPreviewRow[];
  activeUpgradedPersonalAuthPublicIds: string[];
};

export type PreviewRedeemCodeForUserInput = {
  code: string;
  userPublicId: string;
  previewedAt: Date;
};

export type ConfirmRedeemCodeForUserInput = {
  code: string;
  userPublicId: string;
  confirmedAt: Date;
  previewVersion: string;
  targetPersonalAuthPublicId: string | null;
};

export type ConfirmRedeemCodeForUserResult =
  | {
      status: "redeemed" | "replayed";
      personalAuth: PersonalAuthAccessRow;
    }
  | {
      status:
        | "already_advanced"
        | "expired"
        | "inconsistent"
        | "invalid_target"
        | "no_target"
        | "not_found"
        | "stale"
        | "used";
    };

export type RedeemCodeAuthorizationRepository = {
  previewRedeemCodeForUser(
    input: PreviewRedeemCodeForUserInput,
  ): Promise<RedeemCodePreviewFacts | null>;
  confirmRedeemCodeForUser(
    input: ConfirmRedeemCodeForUserInput,
  ): Promise<ConfirmRedeemCodeForUserResult>;
  listPersonalAuthsByUserPublicId(
    userPublicId: string,
  ): Promise<PersonalAuthAccessRow[]>;
};
