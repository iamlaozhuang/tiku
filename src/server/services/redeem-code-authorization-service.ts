import {
  createErrorResponse,
  createSuccessResponse,
  type ApiResponse,
} from "../contracts/api-response";
import type {
  PersonalAuthListDto,
  RedeemCodeRedemptionDto,
} from "../contracts/authorization-contract";
import {
  mapPersonalAuthListToApi,
  mapRedeemCodeRedemptionToApi,
} from "../mappers/authorization-mapper";
import type { RedeemCodeAuthorizationRepository } from "../repositories/redeem-code-authorization-repository";
import { normalizeRedeemCodeInput } from "../validators/redeem-code";

export type AuthorizationUserContext = {
  userPublicId: string;
};

export type RedeemCodeAuthorizationClock = {
  now(): Date;
};

export type RedeemCodeAuthorizationService = {
  redeemCode(
    input: unknown,
    userContext: AuthorizationUserContext,
  ): Promise<ApiResponse<RedeemCodeRedemptionDto | null>>;
  listPersonalAuths(
    userContext: AuthorizationUserContext,
  ): Promise<ApiResponse<PersonalAuthListDto | null>>;
};

const INVALID_REDEEM_CODE_INPUT_CODE = 400003;
const REDEEM_CODE_NOT_FOUND_CODE = 404001;
const REDEEM_CODE_ALREADY_USED_CODE = 409002;
const REDEEM_CODE_EXPIRED_CODE = 410001;

const systemClock: RedeemCodeAuthorizationClock = {
  now() {
    return new Date();
  },
};

export function createRedeemCodeAuthorizationService(
  redeemCodeAuthorizationRepository: RedeemCodeAuthorizationRepository,
  clock: RedeemCodeAuthorizationClock = systemClock,
): RedeemCodeAuthorizationService {
  return {
    async redeemCode(input, userContext) {
      const redeemCodeInput = normalizeRedeemCodeInput(input);

      if (!redeemCodeInput.success) {
        return createErrorResponse(
          INVALID_REDEEM_CODE_INPUT_CODE,
          redeemCodeInput.message,
        );
      }

      const redeemCode =
        await redeemCodeAuthorizationRepository.findRedeemCodeByCode(
          redeemCodeInput.value.code,
        );

      if (redeemCode === null) {
        return createErrorResponse(
          REDEEM_CODE_NOT_FOUND_CODE,
          "Redeem code does not exist.",
        );
      }

      if (
        redeemCode.status === "used" ||
        redeemCode.used_by_user_id !== null ||
        redeemCode.used_at !== null
      ) {
        return createErrorResponse(
          REDEEM_CODE_ALREADY_USED_CODE,
          "Redeem code already used.",
        );
      }

      const redeemedAt = clock.now();

      if (
        redeemCode.status === "expired" ||
        redeemCode.redeem_deadline_at < redeemedAt
      ) {
        return createErrorResponse(
          REDEEM_CODE_EXPIRED_CODE,
          "Redeem code redeem deadline has passed.",
        );
      }

      const personalAuth =
        await redeemCodeAuthorizationRepository.redeemCodeForUser({
          code: redeemCodeInput.value.code,
          redeemCodeId: redeemCode.id,
          userPublicId: userContext.userPublicId,
          redeemedAt,
          redeemCodeType: redeemCode.redeem_code_type,
          profession: redeemCode.profession,
          level: redeemCode.level,
          durationDay: redeemCode.duration_day,
        });

      if (personalAuth === null) {
        return createErrorResponse(
          REDEEM_CODE_ALREADY_USED_CODE,
          "Redeem code already used.",
        );
      }

      return createSuccessResponse(
        mapRedeemCodeRedemptionToApi(redeemCode, personalAuth),
      );
    },

    async listPersonalAuths(userContext) {
      const personalAuths =
        await redeemCodeAuthorizationRepository.listPersonalAuthsByUserPublicId(
          userContext.userPublicId,
        );

      return createSuccessResponse(mapPersonalAuthListToApi(personalAuths));
    },
  };
}

export function createUnavailableRedeemCodeAuthorizationService(): RedeemCodeAuthorizationService {
  return {
    async redeemCode() {
      return createErrorResponse(
        503003,
        "Redeem code runtime is not configured.",
      );
    },
    async listPersonalAuths() {
      return createErrorResponse(
        503004,
        "Personal authorization runtime is not configured.",
      );
    },
  };
}
