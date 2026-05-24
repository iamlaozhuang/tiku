import {
  createSuccessResponse,
  type ApiResponse,
} from "../contracts/api-response";
import {
  LOCAL_PURCHASE_GUIDANCE_CONTACT_CONFIG,
  type PurchaseGuidanceContactConfigResultDto,
} from "../contracts/contact-config-contract";

export type ContactConfigService = {
  getPurchaseGuidance(): ApiResponse<PurchaseGuidanceContactConfigResultDto>;
};

export function createContactConfigService(): ContactConfigService {
  return {
    getPurchaseGuidance() {
      return createSuccessResponse<PurchaseGuidanceContactConfigResultDto>({
        contactConfig: LOCAL_PURCHASE_GUIDANCE_CONTACT_CONFIG,
      });
    },
  };
}
