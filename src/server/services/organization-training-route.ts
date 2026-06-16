import {
  createErrorResponse,
  createSuccessResponse,
  type ApiResponse,
} from "../contracts/api-response";
import type { OrganizationTrainingPublishInput } from "../models/organization-training";
import { createPostgresOrganizationTrainingRepository } from "../repositories/organization-training-repository";
import {
  invalidOrganizationTrainingPublishInputMessage,
  normalizeOrganizationTrainingPublishInput,
} from "../validators/organization-training";
import {
  createOrganizationTrainingService,
  organizationTrainingPublishBlockedMessage,
  type OrganizationTrainingPersistenceLineage,
  type OrganizationTrainingService,
  type OrganizationTrainingStore,
} from "./organization-training-service";
import { createRouteHandlersWithErrorEnvelope } from "./route-error-response";

export type OrganizationTrainingPublishRouteContext = {
  params: Promise<{
    publicId: string;
  }>;
};

export type OrganizationTrainingPersistenceLineageResolverInput = {
  request: Request;
  pathPublicId: string;
  publishInput: OrganizationTrainingPublishInput;
};

export type OrganizationTrainingPersistenceLineageResolver = (
  input: OrganizationTrainingPersistenceLineageResolverInput,
) => Promise<OrganizationTrainingPersistenceLineage | null>;

export type OrganizationTrainingRouteOptions = {
  resolvePersistenceLineage?: OrganizationTrainingPersistenceLineageResolver;
};

const invalidPublishInputCode = 400061;
const draftPublicIdMismatchCode = 400062;
const publishLineageUnavailableCode = 403064;
const publishBlockedCode = 409065;

const draftPublicIdMismatchMessage =
  "Organization training publish path public id must match request body.";

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

async function resolvePathPublicId(
  context: OrganizationTrainingPublishRouteContext,
): Promise<string> {
  const { publicId } = await context.params;

  return publicId;
}

async function defaultResolvePersistenceLineage(): Promise<null> {
  return null;
}

function createRuntimeOrganizationTrainingStore(): OrganizationTrainingStore {
  const repository = createPostgresOrganizationTrainingRepository();

  return {
    async createManualDraft() {
      throw new Error("Organization training draft route is not configured.");
    },
    publishVersion: repository.publishVersion,
  };
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

function createPublishBlockedResponse(): ApiResponse<null> {
  return createErrorResponse(
    publishBlockedCode,
    organizationTrainingPublishBlockedMessage,
  );
}

export function createOrganizationTrainingRouteHandlers(
  organizationTrainingService: Pick<
    OrganizationTrainingService,
    "publishVersion"
  >,
  options: OrganizationTrainingRouteOptions = {},
) {
  const resolvePersistenceLineage =
    options.resolvePersistenceLineage ?? defaultResolvePersistenceLineage;

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

        const persistenceLineage = await resolvePersistenceLineage({
          request,
          pathPublicId,
          publishInput: input.value,
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

export function createOrganizationTrainingRuntimeRouteHandlers() {
  return createOrganizationTrainingRouteHandlers(
    createOrganizationTrainingService(createRuntimeOrganizationTrainingStore()),
  );
}
