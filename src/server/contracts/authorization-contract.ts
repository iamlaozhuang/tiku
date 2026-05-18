import type { AuthStatus, Profession, RedeemCodeStatus } from "../models/auth";

export type RedeemCodeDto = {
  publicId: string;
  codeDisplay: string;
  profession: Profession;
  level: number;
  status: RedeemCodeStatus;
};

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
  redeemCode: RedeemCodeDto;
  personalAuth: PersonalAuthDto;
};

export type PersonalAuthListDto = {
  personalAuths: PersonalAuthDto[];
};
