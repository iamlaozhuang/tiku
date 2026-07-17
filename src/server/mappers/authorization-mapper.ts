import type {
  PersonalAuthDto,
  PersonalAuthListDto,
} from "../contracts/authorization-contract";
import type { PersonalAuthAccessRow } from "../repositories/redeem-code-authorization-repository";

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

export function mapPersonalAuthListToApi(
  personalAuths: PersonalAuthAccessRow[],
): PersonalAuthListDto {
  return {
    personalAuths: personalAuths.map(mapPersonalAuthToApi),
  };
}
