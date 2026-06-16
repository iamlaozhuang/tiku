import {
  createErrorResponse,
  createSuccessResponse,
  type ApiResponse,
} from "../contracts/api-response";
import { createLocalSessionRuntime } from "../auth/local-session-runtime";
import { getRequestAuthorization } from "../auth/session-cookie";
import type { OrganizationTrainingPublishInput } from "../models/organization-training";
import {
  createPostgresOrganizationTrainingRepository,
  type OrganizationTrainingRepository,
} from "../repositories/organization-training-repository";
import {
  invalidOrganizationTrainingPublishInputMessage,
  normalizeOrganizationTrainingPublishInput,
} from "../validators/organization-training";
import {
  createOrganizationTrainingService,
  organizationTrainingPublishBlockedMessage,
  type OrganizationTrainingAdminContext,
  type OrganizationTrainingPersistenceLineage,
  type OrganizationTrainingService,
  type OrganizationTrainingStore,
} from "./organization-training-service";
import { createRouteHandlersWithErrorEnvelope } from "./route-error-response";
import type { SessionService } from "./session-service";

export type OrganizationTrainingPublishRouteContext = {
  params: Promise<{
    publicId: string;
  }>;
};

export type OrganizationTrainingPersistenceLineageResolverInput = {
  request: Request;
  pathPublicId: string;
  publishInput: OrganizationTrainingPublishInput;
  adminContext: OrganizationTrainingAdminContext;
};

export type OrganizationTrainingPersistenceLineageResolver = (
  input: OrganizationTrainingPersistenceLineageResolverInput,
) => Promise<OrganizationTrainingPersistenceLineage | null>;

export type OrganizationTrainingTrustedPersistenceLineageLookupInput = {
  adminContext: OrganizationTrainingAdminContext;
  organizationPublicId: string;
  authorizationPublicId: string;
};

export type OrganizationTrainingTrustedPersistenceLineageLookup = (
  input: OrganizationTrainingTrustedPersistenceLineageLookupInput,
) => Promise<OrganizationTrainingPersistenceLineage | null>;

export type OrganizationTrainingAdminContextResolverInput = {
  request: Request;
  pathPublicId: string;
  publishInput: OrganizationTrainingPublishInput;
};

export type OrganizationTrainingAdminContextResolver = (
  input: OrganizationTrainingAdminContextResolverInput,
) => Promise<OrganizationTrainingAdminContext | null>;

export type OrganizationTrainingVisibleOrganizationScopeResolverInput = {
  request: Request;
  pathPublicId: string;
  publishInput: OrganizationTrainingPublishInput;
  adminPublicId: string;
};

export type OrganizationTrainingVisibleOrganizationScopeResolver = (
  input: OrganizationTrainingVisibleOrganizationScopeResolverInput,
) => Promise<readonly string[] | null>;

export type OrganizationTrainingRouteOptions = {
  lookupTrustedPersistenceLineage?: OrganizationTrainingTrustedPersistenceLineageLookup;
  resolveOrganizationAdminContext?: OrganizationTrainingAdminContextResolver;
  resolvePersistenceLineage?: OrganizationTrainingPersistenceLineageResolver;
};

export type OrganizationTrainingRuntimeRouteOptions = Pick<
  OrganizationTrainingRouteOptions,
  "resolveOrganizationAdminContext"
> & {
  resolveVisibleOrganizationScope?: OrganizationTrainingVisibleOrganizationScopeResolver;
  sessionService?: Pick<SessionService, "getCurrentSession">;
};

type OrganizationTrainingRuntimeAdminRole =
  | "super_admin"
  | "ops_admin"
  | "content_admin";

const invalidPublishInputCode = 400061;
const draftPublicIdMismatchCode = 400062;
const publishAdminContextUnavailableCode = 403063;
const publishLineageUnavailableCode = 403064;
const publishBlockedCode = 409065;

const draftPublicIdMismatchMessage =
  "Organization training publish path public id must match request body.";

const publishAdminContextUnavailableMessage =
  "Organization training publish organization-admin actor context is unavailable.";

const publishLineageUnavailableMessage =
  "Organization training publish lineage is unavailable.";

async function readRequestJson(request: Request): Promise<unknown> {
  try {
    return await request.json();
  } catch {
    return null;
  }
}

function createJsonResponse<TData>(response: ApiResponse<TData>): Response {
  return Response.json(response);
}

function normalizeRequiredText(value: string): string | null {
  const trimmedValue = value.trim();

  return trimmedValue.length > 0 ? trimmedValue : null;
}

async function resolvePathPublicId(
  context: OrganizationTrainingPublishRouteContext,
): Promise<string> {
  const { publicId } = await context.params;

  return publicId;
}

async function defaultResolvePersistenceLineage(): Promise<null> {
  return null;
}

async function defaultResolveOrganizationAdminContext(): Promise<null> {
  return null;
}

function isOrganizationTrainingRuntimeAdminRole(
  role: string,
): role is OrganizationTrainingRuntimeAdminRole {
  return (
    role === "super_admin" || role === "ops_admin" || role === "content_admin"
  );
}

function normalizeVisibleOrganizationPublicIds(
  visibleOrganizationPublicIds: readonly string[] | null,
): string[] {
  if (visibleOrganizationPublicIds === null) {
    return [];
  }

  return visibleOrganizationPublicIds
    .map((visibleOrganizationPublicId) =>
      normalizeRequiredText(visibleOrganizationPublicId),
    )
    .filter(
      (visibleOrganizationPublicId): visibleOrganizationPublicId is string =>
        visibleOrganizationPublicId !== null,
    );
}

function createSessionBackedOrganizationAdminContextResolver(
  sessionService: Pick<SessionService, "getCurrentSession">,
  resolveVisibleOrganizationScope: OrganizationTrainingVisibleOrganizationScopeResolver,
): OrganizationTrainingAdminContextResolver {
  return async ({ request, pathPublicId, publishInput }) => {
    const sessionResponse = await sessionService.getCurrentSession({
      authorization: getRequestAuthorization(request),
    });

    if (sessionResponse.code !== 0 || sessionResponse.data === null) {
      return null;
    }

    const rawAdminPublicId = sessionResponse.data.user.adminPublicId;
    const adminPublicId =
      typeof rawAdminPublicId === "string"
        ? normalizeRequiredText(rawAdminPublicId)
        : null;
    const hasAdminRole = (sessionResponse.data.user.adminRoles ?? []).some(
      (adminRole) => isOrganizationTrainingRuntimeAdminRole(adminRole),
    );

    if (adminPublicId === null || !hasAdminRole) {
      return null;
    }

    const visibleOrganizationPublicIds = normalizeVisibleOrganizationPublicIds(
      await resolveVisibleOrganizationScope({
        request,
        pathPublicId,
        publishInput,
        adminPublicId,
      }),
    );

    return {
      adminPublicId,
      visibleOrganizationPublicIds,
    };
  };
}

function createDefaultPersistenceLineageResolver(
  lookupTrustedPersistenceLineage:
    | OrganizationTrainingTrustedPersistenceLineageLookup
    | undefined,
): OrganizationTrainingPersistenceLineageResolver {
  if (lookupTrustedPersistenceLineage === undefined) {
    return defaultResolvePersistenceLineage;
  }

  return createOrganizationTrainingPersistenceLineageResolver(
    lookupTrustedPersistenceLineage,
  );
}

function createRuntimeOrganizationTrainingStore(
  repository: Pick<OrganizationTrainingStore, "publishVersion">,
): OrganizationTrainingStore {
  return {
    async createManualDraft() {
      throw new Error("Organization training draft route is not configured.");
    },
    publishVersion: repository.publishVersion,
    async takeDownVersion() {
      throw new Error(
        "Organization training takedown route is not configured.",
      );
    },
    async copyVersionToNewDraft() {
      throw new Error("Organization training copy route is not configured.");
    },
    async attachSourceContext() {
      throw new Error(
        "Organization training source context route is not configured.",
      );
    },
    async saveEmployeeAnswerDraft() {
      throw new Error(
        "Organization training employee answer draft route is not configured.",
      );
    },
    async submitEmployeeAnswer() {
      throw new Error(
        "Organization training employee answer submit route is not configured.",
      );
    },
  };
}

function createRepositoryBackedVisibleOrganizationScopeResolver(
  repository: Pick<
    OrganizationTrainingRepository,
    "lookupVisibleOrganizationScope"
  >,
): OrganizationTrainingVisibleOrganizationScopeResolver {
  return async ({ adminPublicId }) =>
    repository.lookupVisibleOrganizationScope({ adminPublicId });
}

function createInvalidPublishInputResponse(): ApiResponse<null> {
  return createErrorResponse(
    invalidPublishInputCode,
    invalidOrganizationTrainingPublishInputMessage,
  );
}

function createDraftPublicIdMismatchResponse(): ApiResponse<null> {
  return createErrorResponse(
    draftPublicIdMismatchCode,
    draftPublicIdMismatchMessage,
  );
}

function createPublishLineageUnavailableResponse(): ApiResponse<null> {
  return createErrorResponse(
    publishLineageUnavailableCode,
    publishLineageUnavailableMessage,
  );
}

function createPublishAdminContextUnavailableResponse(): ApiResponse<null> {
  return createErrorResponse(
    publishAdminContextUnavailableCode,
    publishAdminContextUnavailableMessage,
  );
}

function createPublishBlockedResponse(): ApiResponse<null> {
  return createErrorResponse(
    publishBlockedCode,
    organizationTrainingPublishBlockedMessage,
  );
}

function isOrganizationVisibleToAdmin(
  organizationPublicId: string,
  adminContext: OrganizationTrainingAdminContext,
): boolean {
  return adminContext.visibleOrganizationPublicIds
    .map((visibleOrganizationPublicId) =>
      normalizeRequiredText(visibleOrganizationPublicId),
    )
    .includes(organizationPublicId);
}

function normalizePersistenceLineage(
  persistenceLineage: OrganizationTrainingPersistenceLineage,
): OrganizationTrainingPersistenceLineage | null {
  if (
    !Number.isInteger(persistenceLineage.organizationId) ||
    persistenceLineage.organizationId < 1 ||
    !Number.isInteger(persistenceLineage.orgAuthId) ||
    persistenceLineage.orgAuthId < 1
  ) {
    return null;
  }

  return {
    organizationId: persistenceLineage.organizationId,
    orgAuthId: persistenceLineage.orgAuthId,
  };
}

export function createOrganizationTrainingPersistenceLineageResolver(
  lookupTrustedPersistenceLineage: OrganizationTrainingTrustedPersistenceLineageLookup,
): OrganizationTrainingPersistenceLineageResolver {
  return async ({ adminContext, publishInput }) => {
    const organizationPublicId = normalizeRequiredText(
      publishInput.organizationPublicId,
    );
    const authorizationPublicId = normalizeRequiredText(
      publishInput.authorizationPublicId,
    );

    if (organizationPublicId === null || authorizationPublicId === null) {
      return null;
    }

    if (!isOrganizationVisibleToAdmin(organizationPublicId, adminContext)) {
      return null;
    }

    const persistenceLineage = await lookupTrustedPersistenceLineage({
      adminContext,
      organizationPublicId,
      authorizationPublicId,
    });

    return persistenceLineage === null
      ? null
      : normalizePersistenceLineage(persistenceLineage);
  };
}

export function createOrganizationTrainingRouteHandlers(
  organizationTrainingService: Pick<
    OrganizationTrainingService,
    "publishVersion"
  >,
  options: OrganizationTrainingRouteOptions = {},
) {
  const resolveOrganizationAdminContext =
    options.resolveOrganizationAdminContext ??
    defaultResolveOrganizationAdminContext;
  const resolvePersistenceLineage =
    options.resolvePersistenceLineage ??
    createDefaultPersistenceLineageResolver(
      options.lookupTrustedPersistenceLineage,
    );

  return createRouteHandlersWithErrorEnvelope({
    publish: {
      async POST(
        request: Request,
        context: OrganizationTrainingPublishRouteContext,
      ): Promise<Response> {
        const input = normalizeOrganizationTrainingPublishInput(
          await readRequestJson(request),
        );

        if (!input.success) {
          return createJsonResponse(createInvalidPublishInputResponse());
        }

        const pathPublicId = await resolvePathPublicId(context);

        if (input.value.draftPublicId !== pathPublicId) {
          return createJsonResponse(createDraftPublicIdMismatchResponse());
        }

        const adminContext = await resolveOrganizationAdminContext({
          request,
          pathPublicId,
          publishInput: input.value,
        });

        if (adminContext === null) {
          return createJsonResponse(
            createPublishAdminContextUnavailableResponse(),
          );
        }

        const persistenceLineage = await resolvePersistenceLineage({
          request,
          pathPublicId,
          publishInput: input.value,
          adminContext,
        });

        if (persistenceLineage === null) {
          return createJsonResponse(createPublishLineageUnavailableResponse());
        }

        const result = await organizationTrainingService.publishVersion({
          publishInput: input.value,
          persistenceLineage,
        });

        if (!result.success) {
          return createJsonResponse(createPublishBlockedResponse());
        }

        return createJsonResponse(
          createSuccessResponse({
            version: result.version,
          }),
        );
      },
    },
  });
}

export function createOrganizationTrainingRuntimeRouteHandlers(
  options: OrganizationTrainingRuntimeRouteOptions = {},
) {
  const repository = createPostgresOrganizationTrainingRepository();
  const sessionService = options.sessionService ?? createLocalSessionRuntime();
  const resolveVisibleOrganizationScope =
    options.resolveVisibleOrganizationScope ??
    createRepositoryBackedVisibleOrganizationScopeResolver(repository);
  const resolveOrganizationAdminContext =
    options.resolveOrganizationAdminContext ??
    createSessionBackedOrganizationAdminContextResolver(
      sessionService,
      resolveVisibleOrganizationScope,
    );

  return createOrganizationTrainingRouteHandlers(
    createOrganizationTrainingService(
      createRuntimeOrganizationTrainingStore(repository),
    ),
    {
      resolveOrganizationAdminContext,
      lookupTrustedPersistenceLineage:
        repository.lookupTrustedPersistenceLineage,
    },
  );
}
