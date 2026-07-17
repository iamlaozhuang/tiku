import {
  createErrorResponse,
  createSuccessResponse,
  type ApiResponse,
} from "../contracts/api-response";
import type {
  PersonalAuthListDto,
  RedeemCodePreviewDto,
  RedeemCodeRedemptionDto,
} from "../contracts/authorization-contract";
import {
  mapPersonalAuthListToApi,
  mapPersonalAuthToApi,
} from "../mappers/authorization-mapper";
import { evaluateRedeemCodePreview } from "../models/redeem-code-preview";
import type {
  ConfirmRedeemCodeForUserResult,
  RedeemCodeAuthorizationRepository,
} from "../repositories/redeem-code-authorization-repository";
import {
  normalizeRedeemCodeConfirmationInput,
  normalizeRedeemCodeInput,
} from "../validators/redeem-code";
import {
  createRedeemCodePreviewRateLimiter,
  type RedeemCodePreviewRateLimiter,
} from "./redeem-code-preview-rate-limiter";

export type AuthorizationUserContext = {
  userPublicId: string;
};

export type RedeemCodeAuthorizationClock = {
  now(): Date;
};

export type RedeemCodeAuthorizationService = {
  previewRedeemCode(
    input: unknown,
    userContext: AuthorizationUserContext,
  ): Promise<ApiResponse<RedeemCodePreviewDto | null>>;
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
const REDEEM_CODE_PREVIEW_STALE_CODE = 409005;
const REDEEM_CODE_TARGET_INVALID_CODE = 409006;
const REDEEM_CODE_PREVIEW_UNAVAILABLE_CODE = 409007;
const REDEEM_CODE_EXPIRED_CODE = 410001;
const REDEEM_CODE_PREVIEW_RATE_LIMITED_CODE = 429001;

const systemClock: RedeemCodeAuthorizationClock = {
  now() {
    return new Date();
  },
};

export function createRedeemCodeAuthorizationService(
  redeemCodeAuthorizationRepository: RedeemCodeAuthorizationRepository,
  clock: RedeemCodeAuthorizationClock = systemClock,
  previewRateLimiter: RedeemCodePreviewRateLimiter = createRedeemCodePreviewRateLimiter(),
): RedeemCodeAuthorizationService {
  return {
    async previewRedeemCode(input, userContext) {
      const redeemCodeInput = normalizeRedeemCodeInput(input);

      if (!redeemCodeInput.success) {
        return createErrorResponse(
          INVALID_REDEEM_CODE_INPUT_CODE,
          redeemCodeInput.message,
        );
      }

      const rateLimitResult = previewRateLimiter.consume(
        userContext.userPublicId,
      );

      if (!rateLimitResult.allowed) {
        return createErrorResponse(
          REDEEM_CODE_PREVIEW_RATE_LIMITED_CODE,
          "Redeem code preview rate limit exceeded.",
        );
      }

      const previewedAt = clock.now();
      const previewFacts =
        await redeemCodeAuthorizationRepository.previewRedeemCodeForUser({
          code: redeemCodeInput.value.code,
          userPublicId: userContext.userPublicId,
          previewedAt,
        });

      if (previewFacts === null) {
        return createPreviewUnavailableResponse();
      }

      const preview = evaluateRedeemCodePreview({
        ...previewFacts,
        userPublicId: userContext.userPublicId,
        checkedAt: previewedAt,
      });

      if (preview.status === "unavailable") {
        return createPreviewUnavailableResponse();
      }

      return createSuccessResponse(preview.data);
    },

    async redeemCode(input, userContext) {
      const redeemCodeInput = normalizeRedeemCodeConfirmationInput(input);

      if (!redeemCodeInput.success) {
        return createErrorResponse(
          INVALID_REDEEM_CODE_INPUT_CODE,
          redeemCodeInput.message,
        );
      }

      const result =
        await redeemCodeAuthorizationRepository.confirmRedeemCodeForUser({
          code: redeemCodeInput.value.code,
          userPublicId: userContext.userPublicId,
          confirmedAt: clock.now(),
          previewVersion: redeemCodeInput.value.previewVersion,
          targetPersonalAuthPublicId:
            redeemCodeInput.value.targetPersonalAuthPublicId,
        });

      if (result.status === "redeemed" || result.status === "replayed") {
        return createSuccessResponse({
          personalAuth: mapPersonalAuthToApi(result.personalAuth),
        });
      }

      return mapConfirmFailure(result);
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

function createPreviewUnavailableResponse(): ApiResponse<null> {
  return createErrorResponse(
    REDEEM_CODE_PREVIEW_UNAVAILABLE_CODE,
    "Redeem code preview is unavailable.",
  );
}

function mapConfirmFailure(
  result: ConfirmRedeemCodeForUserResult,
): ApiResponse<null> {
  switch (result.status) {
    case "redeemed":
    case "replayed":
      throw new Error("Successful redemption cannot be mapped as a failure.");
    case "not_found":
      return createErrorResponse(
        REDEEM_CODE_NOT_FOUND_CODE,
        "Redeem code does not exist.",
      );
    case "expired":
      return createErrorResponse(
        REDEEM_CODE_EXPIRED_CODE,
        "Redeem code redeem deadline has passed.",
      );
    case "stale":
      return createErrorResponse(
        REDEEM_CODE_PREVIEW_STALE_CODE,
        "Redeem code preview is stale.",
      );
    case "already_advanced":
    case "invalid_target":
    case "no_target":
      return createErrorResponse(
        REDEEM_CODE_TARGET_INVALID_CODE,
        "Redeem code target is not eligible.",
      );
    case "inconsistent":
    case "used":
      return createErrorResponse(
        REDEEM_CODE_ALREADY_USED_CODE,
        "Redeem code already used.",
      );
  }
}

export function createUnavailableRedeemCodeAuthorizationService(): RedeemCodeAuthorizationService {
  return {
    async previewRedeemCode() {
      return createErrorResponse(
        503003,
        "Redeem code runtime is not configured.",
      );
    },
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
