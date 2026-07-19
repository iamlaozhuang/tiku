import type {
  AuthStatus,
  AuthorizationEdition,
  Profession,
  RedeemCodeType,
} from "../models/auth";

export type PersonalAuthDto = {
  publicId: string;
  redeemCodePublicId: string;
  profession: Profession;
  level: number;
  startsAt: string;
  expiresAt: string;
  status: AuthStatus;
};

export type RedeemCodeRedemptionDto = {
  personalAuth: PersonalAuthDto;
};

export type RedeemCodeUpgradeTargetDto = {
  personalAuthPublicId: string;
  sourceEdition: "standard";
  startsAt: string;
  expiresAt: string;
};

export type RedeemCodePreviewDto = {
  redeemCodeType: RedeemCodeType;
  profession: Profession;
  level: number;
  resultEdition: AuthorizationEdition;
  durationDay: number;
  redeemDeadlineAt: string | null;
  previewVersion: string;
  upgradeTargets: RedeemCodeUpgradeTargetDto[];
};

export type PersonalAuthListDto = {
  personalAuths: PersonalAuthDto[];
};
