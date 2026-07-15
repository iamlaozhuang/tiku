import {
  createErrorResponse,
  createSuccessResponse,
  type ApiResponse,
} from "../contracts/api-response";
import type {
  DisableOrganizationResultDto,
  OrgAuthResultDto,
  OrganizationResultDto,
} from "../contracts/organization-auth-contract";
import {
  mapDisableOrganizationResultToApi,
  mapOrgAuthPackageResultToApi,
  mapOrgAuthResultToApi,
  mapOrganizationResultToApi,
} from "../mappers/organization-auth-mapper";
import type { OrganizationAuthRepository } from "../repositories/organization-auth-repository";
import { normalizeCreateOrgAuthPackageInput } from "../validators/org-auth";
import {
  normalizeCreateOrganizationInput,
  normalizeDisableOrganizationInput,
  normalizeUpdateOrganizationInput,
} from "../validators/organization";

export type OrganizationAuthService = {
  createOrganization(
    input: unknown,
  ): Promise<ApiResponse<OrganizationResultDto | null>>;
  updateOrganization(
    publicId: string,
    input: unknown,
  ): Promise<ApiResponse<OrganizationResultDto | null>>;
  disableOrganization(
    publicId: string,
    input: unknown,
  ): Promise<ApiResponse<DisableOrganizationResultDto | null>>;
  createOrgAuth(input: unknown): Promise<ApiResponse<OrgAuthResultDto | null>>;
  cancelOrgAuth(
    publicId: string,
  ): Promise<ApiResponse<OrgAuthResultDto | null>>;
};

const INVALID_ORGANIZATION_INPUT_CODE = 400004;
const INVALID_ORG_AUTH_INPUT_CODE = 400005;
const ORGANIZATION_NOT_FOUND_CODE = 404002;
const ORG_AUTH_NOT_FOUND_CODE = 404003;
const ORGANIZATION_DEPTH_EXCEEDED_CODE = 409003;
const ORG_AUTH_SCOPE_OVERLAP_CODE = 409005;

async function assertParentDepth(
  repository: OrganizationAuthRepository,
  parentOrganizationPublicId: string | null,
): Promise<ApiResponse<null> | null> {
  if (parentOrganizationPublicId === null) {
    return null;
  }

  const parentDepth = await repository.getOrganizationDepth(
    parentOrganizationPublicId,
  );

  if (parentDepth === null) {
    return createErrorResponse(
      ORGANIZATION_NOT_FOUND_CODE,
      "Parent organization does not exist.",
    );
  }

  if (parentDepth >= 4) {
    return createErrorResponse(
      ORGANIZATION_DEPTH_EXCEEDED_CODE,
      "Organization tree depth cannot exceed 4 levels.",
    );
  }

  return null;
}

export function createOrganizationAuthService(
  organizationAuthRepository: OrganizationAuthRepository,
): OrganizationAuthService {
  return {
    async createOrganization(input) {
      const organizationInput = normalizeCreateOrganizationInput(input);

      if (!organizationInput.success) {
        return createErrorResponse(
          INVALID_ORGANIZATION_INPUT_CODE,
          organizationInput.message,
        );
      }

      const depthError = await assertParentDepth(
        organizationAuthRepository,
        organizationInput.value.parentOrganizationPublicId,
      );

      if (depthError !== null) {
        return depthError;
      }

      const organization = await organizationAuthRepository.createOrganization(
        organizationInput.value,
      );

      return createSuccessResponse(mapOrganizationResultToApi(organization));
    },

    async updateOrganization(publicId, input) {
      const organizationInput = normalizeUpdateOrganizationInput(input);

      if (!organizationInput.success) {
        return createErrorResponse(
          INVALID_ORGANIZATION_INPUT_CODE,
          organizationInput.message,
        );
      }

      const organization = await organizationAuthRepository.updateOrganization({
        publicId,
        ...organizationInput.value,
      });

      return createSuccessResponse(mapOrganizationResultToApi(organization));
    },

    async disableOrganization(publicId, input) {
      const disableInput = normalizeDisableOrganizationInput(input);

      if (!disableInput.success) {
        return createErrorResponse(
          INVALID_ORGANIZATION_INPUT_CODE,
          disableInput.message,
        );
      }

      const result = await organizationAuthRepository.disableOrganization({
        expectedRevision: disableInput.value.expectedRevision,
        publicId,
        isCascade: disableInput.value.isCascade,
      });

      return createSuccessResponse(mapDisableOrganizationResultToApi(result));
    },

    async createOrgAuth(input) {
      const orgAuthPackageInput = normalizeCreateOrgAuthPackageInput(input);

      if (!orgAuthPackageInput.success) {
        return createErrorResponse(
          INVALID_ORG_AUTH_INPUT_CODE,
          orgAuthPackageInput.message,
        );
      }

      for (const orgAuthInput of orgAuthPackageInput.value.orgAuthInputs) {
        if (
          await organizationAuthRepository.hasOverlappingOrgAuth(orgAuthInput)
        ) {
          return createErrorResponse(
            ORG_AUTH_SCOPE_OVERLAP_CODE,
            "Org auth scope overlaps an existing active authorization.",
          );
        }
      }

      const orgAuths = [];

      for (const orgAuthInput of orgAuthPackageInput.value.orgAuthInputs) {
        orgAuths.push(
          await organizationAuthRepository.createOrgAuth(orgAuthInput),
        );
      }

      return createSuccessResponse(mapOrgAuthPackageResultToApi(orgAuths));
    },

    async cancelOrgAuth(publicId) {
      const orgAuth = await organizationAuthRepository.cancelOrgAuth(publicId);

      if (orgAuth === null) {
        return createErrorResponse(
          ORG_AUTH_NOT_FOUND_CODE,
          "Org auth does not exist.",
        );
      }

      return createSuccessResponse(mapOrgAuthResultToApi(orgAuth));
    },
  };
}

export function createUnavailableOrganizationAuthService(): OrganizationAuthService {
  return {
    async createOrganization() {
      return createErrorResponse(
        503005,
        "Organization runtime is not configured.",
      );
    },
    async updateOrganization() {
      return createErrorResponse(
        503005,
        "Organization runtime is not configured.",
      );
    },
    async disableOrganization() {
      return createErrorResponse(
        503005,
        "Organization runtime is not configured.",
      );
    },
    async createOrgAuth() {
      return createErrorResponse(503006, "Org auth runtime is not configured.");
    },
    async cancelOrgAuth() {
      return createErrorResponse(503006, "Org auth runtime is not configured.");
    },
  };
}
