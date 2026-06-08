import {
  createErrorResponse,
  createSuccessResponse,
  type ApiResponse,
} from "../contracts/api-response";
import type { OrgAuthTrainingScopeSummaryDto } from "../contracts/org-auth-training-scope-summary-contract";
import type { OrgAuthTrainingScopeSummaryInput } from "../models/org-auth-training-scope-summary";
import { normalizeOrgAuthTrainingScopeSummaryInput } from "../validators/org-auth-training-scope-summary";

const INVALID_ORG_AUTH_TRAINING_SCOPE_SUMMARY_INPUT_CODE = 400012;

function mapOrgAuthTrainingScopeSummaryToDto(
  input: OrgAuthTrainingScopeSummaryInput,
): OrgAuthTrainingScopeSummaryDto {
  return {
    userPublicId: input.userPublicId,
    employeePublicId: input.employeePublicId,
    runtimeStatus: "local_contract_only",
    orgAuth: {
      publicId: input.orgAuthPublicId,
      authScopeType: input.authScopeType,
      profession: input.profession,
      level: input.level,
      purchaserOrganizationPublicId: input.purchaserOrganizationPublicId,
      coveredOrganizationPublicIds: input.coveredOrganizationPublicIds,
      quota: {
        accountQuota: input.accountQuota,
        usedQuota: input.usedQuota,
        availableQuota: input.accountQuota - input.usedQuota,
      },
    },
    trainingScope: {
      paperPublicId: input.paperPublicId,
      mockExamPublicId: input.mockExamPublicId,
      contentAccessStatus: "scope_only",
    },
    redeemCodeReference: {
      publicId: input.redeemCodePublicId,
      redactionStatus: "redacted",
    },
    evidenceReferences: {
      auditLogPublicId: input.auditLogPublicId,
      aiCallLogPublicId: input.aiCallLogPublicId,
      redactionStatus: "redacted",
    },
  };
}

export function buildOrgAuthTrainingScopeSummaryReadModel(
  input: unknown,
): ApiResponse<OrgAuthTrainingScopeSummaryDto | null> {
  const orgAuthTrainingScopeSummaryInput =
    normalizeOrgAuthTrainingScopeSummaryInput(input);

  if (!orgAuthTrainingScopeSummaryInput.success) {
    return createErrorResponse(
      INVALID_ORG_AUTH_TRAINING_SCOPE_SUMMARY_INPUT_CODE,
      orgAuthTrainingScopeSummaryInput.message,
    );
  }

  return createSuccessResponse(
    mapOrgAuthTrainingScopeSummaryToDto(orgAuthTrainingScopeSummaryInput.value),
  );
}
