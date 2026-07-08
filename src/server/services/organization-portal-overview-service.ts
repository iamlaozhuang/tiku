import {
  createErrorResponse,
  createSuccessResponse,
  type ApiResponse,
} from "../contracts/api-response";
import type { OrganizationPortalOverviewDto } from "../contracts/organization-portal-overview-contract";
import type { AdminRole, AuthorizationEdition } from "../models/auth";

export const ORGANIZATION_PORTAL_OVERVIEW_NOT_FOUND_CODE = 404189;
export const ORGANIZATION_PORTAL_OVERVIEW_NOT_FOUND_MESSAGE =
  "Organization portal overview is unavailable.";

export type OrganizationPortalOverviewAdminContext = {
  adminPublicId: string;
  adminRoles: readonly AdminRole[];
  authorizationPublicId: string | null;
  authorizationSource: "org_auth";
  effectiveEdition: AuthorizationEdition;
  organizationPublicId: string;
};

export type OrganizationPortalOverviewRepositoryInput = {
  authorizationPublicId: string | null;
  now: Date;
  organizationPublicId: string;
  updatedAt: string;
};

export type OrganizationPortalOverviewRepository = {
  readOverview(
    input: OrganizationPortalOverviewRepositoryInput,
  ): Promise<OrganizationPortalOverviewDto | null>;
};

export type BuildOrganizationPortalOverviewInput = {
  adminContext: OrganizationPortalOverviewAdminContext;
  now: Date;
  repository: OrganizationPortalOverviewRepository;
  updatedAt: string;
};

export async function buildOrganizationPortalOverviewFromRepository({
  adminContext,
  now,
  repository,
  updatedAt,
}: BuildOrganizationPortalOverviewInput): Promise<
  ApiResponse<OrganizationPortalOverviewDto | null>
> {
  const overview = await repository.readOverview({
    authorizationPublicId: adminContext.authorizationPublicId,
    now,
    organizationPublicId: adminContext.organizationPublicId,
    updatedAt,
  });

  if (overview === null) {
    return createErrorResponse(
      ORGANIZATION_PORTAL_OVERVIEW_NOT_FOUND_CODE,
      ORGANIZATION_PORTAL_OVERVIEW_NOT_FOUND_MESSAGE,
    );
  }

  return createSuccessResponse(overview);
}
