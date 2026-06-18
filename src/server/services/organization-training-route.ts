import {
  createErrorResponse,
  createSuccessResponse,
  type ApiResponse,
} from "../contracts/api-response";
import { createLocalSessionRuntime } from "../auth/local-session-runtime";
import { getRequestAuthorization } from "../auth/session-cookie";
import type {
  OrganizationTrainingPublishInput,
  OrganizationTrainingTakedownInput,
} from "../models/organization-training";
import {
  createPostgresOrganizationTrainingRepository,
  type OrganizationTrainingRepository,
} from "../repositories/organization-training-repository";
import {
  invalidOrganizationTrainingPublishInputMessage,
  invalidOrganizationTrainingTakedownInputMessage,
  normalizeOrganizationTrainingPublishInput,
  normalizeOrganizationTrainingTakedownInput,
} from "../validators/organization-training";
import {
  createOrganizationTrainingService,
  organizationTrainingPublishBlockedMessage,
  organizationTrainingTakedownBlockedMessage,
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
  publishInput?: OrganizationTrainingPublishInput;
  takedownInput?: OrganizationTrainingTakedownInput;
};

export type OrganizationTrainingAdminContextResolver = (
  input: OrganizationTrainingAdminContextResolverInput,
) => Promise<OrganizationTrainingAdminContext | null>;

export type OrganizationTrainingVisibleOrganizationScopeResolverInput = {
  request: Request;
  pathPublicId: string;
  publishInput?: OrganizationTrainingPublishInput;
  takedownInput?: OrganizationTrainingTakedownInput;
  adminPublicId: string;
};

export type OrganizationTrainingVisibleOrganizationScopeResolver = (
  input: OrganizationTrainingVisibleOrganizationScopeResolverInput,
) => Promise<readonly string[] | null>;

export type OrganizationTrainingRouteOptions = {
  lookupTrustedPersistenceLineage?: OrganizationTrainingTrustedPersistenceLineageLookup;
  resolveOrganizationAdminContext?: OrganizationTrainingAdminContextResolver;
  resolvePersistenceLineage?: OrganizationTrainingPersistenceLineageResolver;
  resolveVersionOrganizationPublicId?: OrganizationTrainingVersionOrganizationPublicIdResolver;
};

export type OrganizationTrainingVersionOrganizationPublicIdResolverInput = {
  request: Request;
  pathPublicId: string;
  takedownInput: OrganizationTrainingTakedownInput;
  adminContext: OrganizationTrainingAdminContext;
};

export type OrganizationTrainingVersionOrganizationPublicIdResolver = (
  input: OrganizationTrainingVersionOrganizationPublicIdResolverInput,
) => Promise<string | null>;

export type OrganizationTrainingRuntimeRouteOptions = Pick<
  OrganizationTrainingRouteOptions,
  "resolveOrganizationAdminContext" | "resolveVersionOrganizationPublicId"
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
const invalidTakedownInputCode = 400066;
const versionPublicIdMismatchCode = 400067;
const takedownAdminContextUnavailableCode = 403068;
const takedownVersionOrganizationUnavailableCode = 403069;
const takedownBlockedCode = 409070;

const draftPublicIdMismatchMessage =
  "Organization training publish path public id must match request body.";

const publishAdminContextUnavailableMessage =
  "Organization training publish organization-admin actor context is unavailable.";

const publishLineageUnavailableMessage =
  "Organization training publish lineage is unavailable.";

const versionPublicIdMismatchMessage =
  "Organization training takedown path public id must match request body.";

const takedownAdminContextUnavailableMessage =
  "Organization training takedown organization-admin actor context is unavailable.";

const takedownVersionOrganizationUnavailableMessage =
  "Organization training takedown version organization is unavailable.";

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

function normalizeRequiredText(value: string | null): string | null {
  if (value === null) {
    return null;
  }

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

async function defaultResolveVersionOrganizationPublicId(): Promise<null> {
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
  return async ({ request, pathPublicId, publishInput, takedownInput }) => {
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
        takedownInput,
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
  repository: Pick<
    OrganizationTrainingStore,
    "publishVersion" | "takeDownVersion"
  >,
): OrganizationTrainingStore {
  return {
    async createManualDraft() {
      throw new Error("Organization training draft route is not configured.");
    },
    publishVersion: repository.publishVersion,
    takeDownVersion: repository.takeDownVersion,
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

function createRepositoryBackedVersionOrganizationPublicIdResolver(
  repository: Pick<
    OrganizationTrainingRepository,
    "lookupVersionOrganizationPublicId"
  >,
): OrganizationTrainingVersionOrganizationPublicIdResolver {
  return async ({ takedownInput }) =>
    repository.lookupVersionOrganizationPublicId({
      versionPublicId: takedownInput.versionPublicId,
    });
}

function createInvalidPublishInputResponse(): ApiResponse<null> {
  return createErrorResponse(
    invalidPublishInputCode,
    invalidOrganizationTrainingPublishInputMessage,
  );
}

function createInvalidTakedownInputResponse(): ApiResponse<null> {
  return createErrorResponse(
    invalidTakedownInputCode,
    invalidOrganizationTrainingTakedownInputMessage,
  );
}

function createDraftPublicIdMismatchResponse(): ApiResponse<null> {
  return createErrorResponse(
    draftPublicIdMismatchCode,
    draftPublicIdMismatchMessage,
  );
}

function createVersionPublicIdMismatchResponse(): ApiResponse<null> {
  return createErrorResponse(
    versionPublicIdMismatchCode,
    versionPublicIdMismatchMessage,
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

function createTakedownAdminContextUnavailableResponse(): ApiResponse<null> {
  return createErrorResponse(
    takedownAdminContextUnavailableCode,
    takedownAdminContextUnavailableMessage,
  );
}

function createTakedownVersionOrganizationUnavailableResponse(): ApiResponse<null> {
  return createErrorResponse(
    takedownVersionOrganizationUnavailableCode,
    takedownVersionOrganizationUnavailableMessage,
  );
}

function createPublishBlockedResponse(): ApiResponse<null> {
  return createErrorResponse(
    publishBlockedCode,
    organizationTrainingPublishBlockedMessage,
  );
}

function createTakedownBlockedResponse(): ApiResponse<null> {
  return createErrorResponse(
    takedownBlockedCode,
    organizationTrainingTakedownBlockedMessage,
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
    "publishVersion" | "takeDownVersion"
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
  const resolveVersionOrganizationPublicId =
    options.resolveVersionOrganizationPublicId ??
    defaultResolveVersionOrganizationPublicId;

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
    takeDown: {
      async POST(
        request: Request,
        context: OrganizationTrainingPublishRouteContext,
      ): Promise<Response> {
        const input = normalizeOrganizationTrainingTakedownInput(
          await readRequestJson(request),
        );

        if (!input.success) {
          return createJsonResponse(createInvalidTakedownInputResponse());
        }

        const pathPublicId = await resolvePathPublicId(context);

        if (input.value.versionPublicId !== pathPublicId) {
          return createJsonResponse(createVersionPublicIdMismatchResponse());
        }

        const adminContext = await resolveOrganizationAdminContext({
          request,
          pathPublicId,
          takedownInput: input.value,
        });

        if (adminContext === null) {
          return createJsonResponse(
            createTakedownAdminContextUnavailableResponse(),
          );
        }

        const versionOrganizationPublicId = normalizeRequiredText(
          await resolveVersionOrganizationPublicId({
            request,
            pathPublicId,
            takedownInput: input.value,
            adminContext,
          }),
        );

        if (versionOrganizationPublicId === null) {
          return createJsonResponse(
            createTakedownVersionOrganizationUnavailableResponse(),
          );
        }

        const result = await organizationTrainingService.takeDownVersion({
          adminContext,
          versionOrganizationPublicId,
          takedownInput: input.value,
        });

        if (!result.success) {
          return createJsonResponse(createTakedownBlockedResponse());
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
  const resolveVersionOrganizationPublicId =
    options.resolveVersionOrganizationPublicId ??
    createRepositoryBackedVersionOrganizationPublicIdResolver(repository);

  return createOrganizationTrainingRouteHandlers(
    createOrganizationTrainingService(
      createRuntimeOrganizationTrainingStore(repository),
    ),
    {
      resolveOrganizationAdminContext,
      resolveVersionOrganizationPublicId,
      lookupTrustedPersistenceLineage:
        repository.lookupTrustedPersistenceLineage,
    },
  );
}
