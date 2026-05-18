import type {
  PersonalAuthDto,
  PersonalAuthListDto,
  RedeemCodeDto,
  RedeemCodeRedemptionDto,
} from "../contracts/authorization-contract";
import type {
  PersonalAuthAccessRow,
  RedeemCodeAuthorizationRow,
} from "../repositories/redeem-code-authorization-repository";

export function mapRedeemCodeToApi(
  redeemCode: RedeemCodeAuthorizationRow,
): RedeemCodeDto {
  return {
    publicId: redeemCode.public_id,
    codeDisplay: redeemCode.code_display,
    profession: redeemCode.profession,
    level: redeemCode.level,
    status: redeemCode.status,
  };
}

export function mapPersonalAuthToApi(
  personalAuth: PersonalAuthAccessRow,
): PersonalAuthDto {
  return {
    publicId: personalAuth.public_id,
    redeemCodePublicId: personalAuth.redeem_code_public_id,
    profession: personalAuth.profession,
    level: personalAuth.level,
    startsAt: personalAuth.starts_at.toISOString(),
    expiresAt: personalAuth.expires_at.toISOString(),
    status: personalAuth.status,
  };
}

export function mapRedeemCodeRedemptionToApi(
  redeemCode: RedeemCodeAuthorizationRow,
  personalAuth: PersonalAuthAccessRow,
): RedeemCodeRedemptionDto {
  return {
    redeemCode: mapRedeemCodeToApi({
      ...redeemCode,
      status: "used",
    }),
    personalAuth: mapPersonalAuthToApi(personalAuth),
  };
}

export function mapPersonalAuthListToApi(
  personalAuths: PersonalAuthAccessRow[],
): PersonalAuthListDto {
  return {
    personalAuths: personalAuths.map(mapPersonalAuthToApi),
  };
}
