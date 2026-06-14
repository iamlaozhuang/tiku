import {
  createErrorResponse,
  createPaginatedResponse,
  createSuccessResponse,
  type ApiResponse,
} from "../../contracts/api-response";
import {
  createBlockedOrganizationAuthGovernanceHandoff,
  type EmployeeUnbindLifecycleResultDto,
  type OrgAuthLifecycleResultDto,
  type OrganizationLifecycleListDto,
  type OrganizationLifecycleResultDto,
} from "../../contracts/organization/organization-lifecycle-contract";
import {
  mapEmployeeUnbindResultToDto,
  mapOrgAuthRecordToDto,
  mapOrganizationRecordToDto,
} from "../../mappers/organization/organization-lifecycle-mapper";
import type { OrganizationRepository } from "../../repositories/organization/organization-repository";
import { normalizeCreateOrgAuthInput } from "../../validators/org-auth";
import {
  normalizeCreateOrganizationInput,
  validateOrganizationTierParent,
} from "../../validators/organization";
import { normalizeOrganizationListQuery } from "../../validators/organization/list-query";

export type OrganizationLifecycleService = {
  createOrgAuth(
    input: unknown,
  ): Promise<ApiResponse<OrgAuthLifecycleResultDto | null>>;
  createOrganization(
    input: unknown,
  ): Promise<ApiResponse<OrganizationLifecycleResultDto | null>>;
  listOrganizations(
    query: unknown,
  ): Promise<ApiResponse<OrganizationLifecycleListDto | null>>;
  unbindEmployee(
    input: unknown,
  ): Promise<ApiResponse<EmployeeUnbindLifecycleResultDto | null>>;
};

const INVALID_ORGANIZATION_INPUT_CODE = 400004;
const INVALID_ORG_AUTH_INPUT_CODE = 400005;
const ORGANIZATION_NOT_FOUND_CODE = 404002;
const EMPLOYEE_NOT_FOUND_CODE = 404004;
const ORGANIZATION_DEPTH_EXCEEDED_CODE = 409003;
const ORG_AUTH_SCOPE_OVERLAP_CODE = 409005;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function normalizeRequiredText(value: unknown): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const text = value.trim();

  return text.length === 0 ? null : text;
}

async function mapOrganizationResult(
  repository: OrganizationRepository,
  organizationPublicId: string,
): Promise<OrganizationLifecycleResultDto | null> {
  const organization =
    await repository.findOrganizationByPublicId(organizationPublicId);

  if (organization === null) {
    return null;
  }

  return {
    governance: createBlockedOrganizationAuthGovernanceHandoff(),
    organization: await mapOrganizationRecordToDto(organization, repository),
  };
}

export function createOrganizationLifecycleService(
  repository: OrganizationRepository,
): OrganizationLifecycleService {
  return {
    async createOrgAuth(input) {
      const orgAuthInput = normalizeCreateOrgAuthInput(input);

      if (!orgAuthInput.success) {
        return createErrorResponse(
          INVALID_ORG_AUTH_INPUT_CODE,
          orgAuthInput.message,
        );
      }

      if (await repository.hasOverlappingOrgAuth(orgAuthInput.value)) {
        return createErrorResponse(
          ORG_AUTH_SCOPE_OVERLAP_CODE,
          "Org auth scope overlaps an existing active authorization.",
        );
      }

      const orgAuth = await repository.createOrgAuth(orgAuthInput.value);

      return createSuccessResponse({
        governance: createBlockedOrganizationAuthGovernanceHandoff(),
        orgAuth: mapOrgAuthRecordToDto(orgAuth),
      });
    },

    async createOrganization(input) {
      const organizationInput = normalizeCreateOrganizationInput(input);

      if (!organizationInput.success) {
        return createErrorResponse(
          INVALID_ORGANIZATION_INPUT_CODE,
          organizationInput.message,
        );
      }

      const parentOrganization =
        organizationInput.value.parentOrganizationPublicId === null
          ? null
          : await repository.findOrganizationByPublicId(
              organizationInput.value.parentOrganizationPublicId,
            );

      if (
        organizationInput.value.parentOrganizationPublicId !== null &&
        parentOrganization === null
      ) {
        return createErrorResponse(
          ORGANIZATION_NOT_FOUND_CODE,
          "Parent organization does not exist.",
        );
      }

      if (parentOrganization !== null && parentOrganization.depth >= 4) {
        return createErrorResponse(
          ORGANIZATION_DEPTH_EXCEEDED_CODE,
          "Organization tree depth cannot exceed 4 levels.",
        );
      }

      const tierValidation = validateOrganizationTierParent({
        orgTier: organizationInput.value.orgTier,
        parentOrganization:
          parentOrganization === null
            ? null
            : {
                orgTier: parentOrganization.orgTier,
              },
      });

      if (!tierValidation.success) {
        return createErrorResponse(
          INVALID_ORGANIZATION_INPUT_CODE,
          tierValidation.message,
        );
      }

      const organization = await repository.createOrganization({
        ...organizationInput.value,
        depth: parentOrganization === null ? 1 : parentOrganization.depth + 1,
      });
      const result = await mapOrganizationResult(
        repository,
        organization.publicId,
      );

      return createSuccessResponse(
        result ?? {
          governance: createBlockedOrganizationAuthGovernanceHandoff(),
          organization: await mapOrganizationRecordToDto(
            organization,
            repository,
          ),
        },
      );
    },

    async listOrganizations(query) {
      const listQuery = normalizeOrganizationListQuery(query);

      if (!listQuery.success) {
        return createErrorResponse(
          INVALID_ORGANIZATION_INPUT_CODE,
          listQuery.message,
        );
      }

      const result = await repository.listOrganizations(listQuery.value);
      const organizations = await Promise.all(
        result.organizations.map((organization) =>
          mapOrganizationRecordToDto(organization, repository),
        ),
      );

      return createPaginatedResponse(
        {
          governance: createBlockedOrganizationAuthGovernanceHandoff(),
          organizations,
        },
        {
          page: listQuery.value.page,
          pageSize: listQuery.value.pageSize,
          sortBy: listQuery.value.sortBy,
          sortOrder: listQuery.value.sortOrder,
          total: result.total,
        },
      );
    },

    async unbindEmployee(input) {
      if (!isRecord(input)) {
        return createErrorResponse(
          INVALID_ORGANIZATION_INPUT_CODE,
          "Invalid employee unbind input.",
        );
      }

      const employeePublicId = normalizeRequiredText(input.employeePublicId);
      const organizationPublicId = normalizeRequiredText(
        input.organizationPublicId,
      );

      if (employeePublicId === null || organizationPublicId === null) {
        return createErrorResponse(
          INVALID_ORGANIZATION_INPUT_CODE,
          "Invalid employee unbind input.",
        );
      }

      const result = await repository.unbindEmployee({
        employeePublicId,
        organizationPublicId,
        reason: normalizeRequiredText(input.reason),
      });

      if (result === null) {
        return createErrorResponse(
          EMPLOYEE_NOT_FOUND_CODE,
          "Employee not found.",
        );
      }

      return createSuccessResponse({
        governance: createBlockedOrganizationAuthGovernanceHandoff(),
        lifecycleEvent: mapEmployeeUnbindResultToDto(result),
      });
    },
  };
}
