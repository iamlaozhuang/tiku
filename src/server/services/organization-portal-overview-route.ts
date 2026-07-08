import {
  createErrorResponse,
  type ApiResponse,
} from "../contracts/api-response";
import type { OrganizationPortalOverviewDto } from "../contracts/organization-portal-overview-contract";
import type { AdminWorkspaceCapabilitySummary } from "../contracts/admin-workspace-role-guard-contract";
import { createLocalSessionRuntime } from "../auth/local-session-runtime";
import { getRequestAuthorization } from "../auth/session-cookie";
import type { AdminRole } from "../models/auth";
import { createPostgresOrganizationPortalOverviewRepository } from "../repositories/organization-portal-overview-repository";
import type { RuntimeDatabaseOptions } from "../repositories/runtime-database";
import { createRouteHandlersWithErrorEnvelope } from "./route-error-response";
import {
  buildOrganizationPortalOverviewFromRepository,
  type OrganizationPortalOverviewAdminContext,
  type OrganizationPortalOverviewRepository,
} from "./organization-portal-overview-service";
import type { SessionService } from "./session-service";

export const ORGANIZATION_PORTAL_OVERVIEW_RUNTIME_NOT_CONFIGURED_CODE = 503189;
export const ORGANIZATION_PORTAL_OVERVIEW_RUNTIME_NOT_CONFIGURED_MESSAGE =
  "Organization portal overview runtime is not configured.";
export const ORGANIZATION_PORTAL_OVERVIEW_ADMIN_CONTEXT_UNAVAILABLE_CODE = 403189;
export const ORGANIZATION_PORTAL_OVERVIEW_ADMIN_CONTEXT_UNAVAILABLE_MESSAGE =
  "Organization portal overview admin context is unavailable.";

export type OrganizationPortalOverviewReaderInput = {
  adminContext: OrganizationPortalOverviewAdminContext;
};

export type OrganizationPortalOverviewReader = (
  input: OrganizationPortalOverviewReaderInput,
) =>
  | ApiResponse<OrganizationPortalOverviewDto | null>
  | Promise<ApiResponse<OrganizationPortalOverviewDto | null>>;

export type OrganizationPortalOverviewAdminContextResolver = (input: {
  request: Request;
}) =>
  | OrganizationPortalOverviewAdminContext
  | null
  | Promise<OrganizationPortalOverviewAdminContext | null>;

export type OrganizationPortalOverviewRouteOptions = {
  readOverview?: OrganizationPortalOverviewReader;
  resolveAdminContext?: OrganizationPortalOverviewAdminContextResolver;
};

export type OrganizationPortalOverviewRuntimeRouteOptions =
  RuntimeDatabaseOptions & {
    now?: () => Date;
    readOverview?: OrganizationPortalOverviewReader;
    readUpdatedAt?: () => string;
    repository?: OrganizationPortalOverviewRepository;
    resolveAdminContext?: OrganizationPortalOverviewAdminContextResolver;
    sessionService?: Pick<SessionService, "getCurrentSession">;
  };

function createJsonResponse<TData>(response: ApiResponse<TData>): Response {
  return Response.json(response);
}

function createRuntimeNotConfiguredResponse(): ApiResponse<null> {
  return createErrorResponse(
    ORGANIZATION_PORTAL_OVERVIEW_RUNTIME_NOT_CONFIGURED_CODE,
    ORGANIZATION_PORTAL_OVERVIEW_RUNTIME_NOT_CONFIGURED_MESSAGE,
  );
}

function createAdminContextUnavailableResponse(): ApiResponse<null> {
  return createErrorResponse(
    ORGANIZATION_PORTAL_OVERVIEW_ADMIN_CONTEXT_UNAVAILABLE_CODE,
    ORGANIZATION_PORTAL_OVERVIEW_ADMIN_CONTEXT_UNAVAILABLE_MESSAGE,
  );
}

function normalizeRequiredText(
  value: string | null | undefined,
): string | null {
  const trimmedValue = value?.trim() ?? "";

  return trimmedValue.length > 0 ? trimmedValue : null;
}

function hasOrganizationPortalAdminRole(
  adminRoles: readonly AdminRole[] | undefined,
): boolean {
  return (
    adminRoles?.includes("org_standard_admin") === true ||
    adminRoles?.includes("org_advanced_admin") === true
  );
}

function isServiceComputedOrganizationPortalCapability(
  capabilitySummary: AdminWorkspaceCapabilitySummary | undefined,
): capabilitySummary is AdminWorkspaceCapabilitySummary & {
  organizationEffectiveEdition: "standard" | "advanced";
  organizationPublicId: string;
  organizationAuthorizationSource: "org_auth";
  capabilitySource: "service_computed";
} {
  return (
    capabilitySummary !== undefined &&
    capabilitySummary.capabilitySource === "service_computed" &&
    capabilitySummary.organizationAuthorizationSource === "org_auth" &&
    capabilitySummary.organizationPublicId !== null &&
    capabilitySummary.organizationEffectiveEdition !== null
  );
}

function resolveServiceComputedOrganizationPortalAdminContext(input: {
  adminPublicId: string;
  adminRoles: readonly AdminRole[];
  capabilitySummary: AdminWorkspaceCapabilitySummary | undefined;
}): OrganizationPortalOverviewAdminContext | null {
  const { adminPublicId, adminRoles, capabilitySummary } = input;

  if (!isServiceComputedOrganizationPortalCapability(capabilitySummary)) {
    return null;
  }

  const organizationPublicId = normalizeRequiredText(
    capabilitySummary.organizationPublicId,
  );

  if (organizationPublicId === null) {
    return null;
  }

  return {
    adminPublicId,
    adminRoles,
    authorizationPublicId:
      capabilitySummary.organizationAuthorizationPublicId ?? null,
    authorizationSource: "org_auth",
    effectiveEdition: capabilitySummary.organizationEffectiveEdition,
    organizationPublicId,
  };
}

function createRepositoryBackedOverviewReader(
  repository: OrganizationPortalOverviewRepository,
  readNow: () => Date,
  readUpdatedAt: () => string,
): OrganizationPortalOverviewReader {
  return (input) =>
    buildOrganizationPortalOverviewFromRepository({
      adminContext: input.adminContext,
      now: readNow(),
      repository,
      updatedAt: readUpdatedAt(),
    });
}

function createSessionBackedOrganizationPortalAdminContextResolver(
  sessionService: Pick<SessionService, "getCurrentSession">,
): OrganizationPortalOverviewAdminContextResolver {
  return async ({ request }) => {
    const sessionResponse = await sessionService.getCurrentSession({
      authorization: getRequestAuthorization(request),
    });

    if (sessionResponse.code !== 0 || sessionResponse.data === null) {
      return null;
    }

    const adminPublicId = normalizeRequiredText(
      sessionResponse.data.user.adminPublicId,
    );
    const adminRoles = sessionResponse.data.user.adminRoles ?? [];
    const capabilitySummary =
      sessionResponse.data.user.adminWorkspaceCapability;

    if (adminPublicId === null || !hasOrganizationPortalAdminRole(adminRoles)) {
      return null;
    }

    const serviceComputedAdminContext =
      resolveServiceComputedOrganizationPortalAdminContext({
        adminPublicId,
        adminRoles,
        capabilitySummary,
      });

    if (serviceComputedAdminContext !== null) {
      return serviceComputedAdminContext;
    }

    const organizationPublicId = normalizeRequiredText(
      sessionResponse.data.user.organizationPublicId,
    );

    if (organizationPublicId === null) {
      return null;
    }

    return {
      adminPublicId,
      adminRoles,
      authorizationPublicId: null,
      authorizationSource: "org_auth",
      effectiveEdition: "standard",
      organizationPublicId,
    };
  };
}

export function createOrganizationPortalOverviewRouteHandlers(
  options: OrganizationPortalOverviewRouteOptions = {},
) {
  const readOverview =
    options.readOverview ?? (() => createRuntimeNotConfiguredResponse());
  const resolveAdminContext = options.resolveAdminContext;

  return createRouteHandlersWithErrorEnvelope({
    overview: {
      async GET(request: Request): Promise<Response> {
        if (resolveAdminContext === undefined) {
          return createJsonResponse(createRuntimeNotConfiguredResponse());
        }

        const adminContext = await resolveAdminContext({ request });

        if (adminContext === null) {
          return createJsonResponse(createAdminContextUnavailableResponse());
        }

        return createJsonResponse(await readOverview({ adminContext }));
      },
    },
  });
}

export function createOrganizationPortalOverviewRuntimeRouteHandlers(
  options: OrganizationPortalOverviewRuntimeRouteOptions = {},
) {
  const repository =
    options.repository ??
    createPostgresOrganizationPortalOverviewRepository({
      createDatabase: options.createDatabase,
    });
  const readNow = options.now ?? (() => new Date());
  const readUpdatedAt =
    options.readUpdatedAt ?? (() => new Date().toISOString());
  const sessionService = options.sessionService ?? createLocalSessionRuntime();
  const resolveAdminContext =
    options.resolveAdminContext ??
    createSessionBackedOrganizationPortalAdminContextResolver(sessionService);
  const readOverview =
    options.readOverview ??
    createRepositoryBackedOverviewReader(repository, readNow, readUpdatedAt);

  return createOrganizationPortalOverviewRouteHandlers({
    readOverview,
    resolveAdminContext,
  });
}
