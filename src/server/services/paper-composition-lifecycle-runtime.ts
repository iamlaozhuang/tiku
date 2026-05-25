import { createLocalSessionRuntime } from "../auth/local-session-runtime";
import {
  createErrorResponse,
  type ApiResponse,
} from "../contracts/api-response";
import {
  createPostgresAdminFlowRuntimeRepositories,
  type AppendAuditLogInput,
} from "../repositories/admin-flow-runtime-repository";
import {
  createPostgresPaperAssetRepository,
  type PaperAssetRepository,
} from "../repositories/paper-asset-repository";
import {
  createPostgresPaperDraftRepository,
  type PaperDraftRepository,
} from "../repositories/paper-draft-repository";
import {
  paperAttachmentUsageValues,
  professionValues,
  type PaperAttachmentUsage,
  type Profession,
} from "../models/paper";
import { storeLocalPaperAssetFile } from "./local-paper-asset-storage";
import { createPaperAssetService } from "./paper-asset-service";
import { createPaperDraftService } from "./paper-draft-service";
import type { SessionService } from "./session-service";

type RouteContext = {
  params: Promise<{
    publicId: string;
  }>;
};

type PaperQuestionRouteContext = {
  params: Promise<{
    publicId: string;
    paperQuestionPublicId: string;
  }>;
};

type ContentAdminRole = "super_admin" | "ops_admin" | "content_admin";

type ContentAdminActor = {
  publicId: string;
  roles: [ContentAdminRole, ...ContentAdminRole[]];
};

export type PaperLifecycleAuditLogRepository = {
  appendAuditLog(input: AppendAuditLogInput): Promise<void>;
};

export type PaperCompositionLifecycleRuntimeRepositories = {
  paperRepository: PaperDraftRepository;
  paperAssetRepository: PaperAssetRepository;
  auditLogRepository: PaperLifecycleAuditLogRepository;
};

export type PaperCompositionLifecycleRuntimeOptions = {
  localPaperAssetStorageRoot?: string;
  repositories?: PaperCompositionLifecycleRuntimeRepositories;
  sessionService?: Pick<SessionService, "getCurrentSession">;
};

const adminSessionRequiredResponse = createErrorResponse(
  401001,
  "Admin session is required.",
);
const adminPermissionDeniedResponse = createErrorResponse(
  403621,
  "Admin permission denied.",
);

function createJsonResponse<TData>(response: ApiResponse<TData>): Response {
  return Response.json(response);
}

function isContentAdminRole(role: string): role is ContentAdminRole {
  return (
    role === "super_admin" || role === "ops_admin" || role === "content_admin"
  );
}

function canManagePaper(actor: ContentAdminActor): boolean {
  return (
    actor.roles.includes("super_admin") || actor.roles.includes("content_admin")
  );
}

async function resolveAdminActor(
  request: Request,
  sessionService: Pick<SessionService, "getCurrentSession">,
): Promise<ContentAdminActor | null> {
  const sessionResponse = await sessionService.getCurrentSession({
    authorization: request.headers.get("authorization"),
  });

  if (sessionResponse.code !== 0 || sessionResponse.data === null) {
    return null;
  }

  const adminPublicId = sessionResponse.data.user.adminPublicId ?? null;
  const adminRoles = (sessionResponse.data.user.adminRoles ?? []).filter(
    isContentAdminRole,
  );

  if (adminPublicId === null || adminRoles.length === 0) {
    return null;
  }

  return {
    publicId: adminPublicId,
    roles: adminRoles as [ContentAdminRole, ...ContentAdminRole[]],
  };
}

function createDefaultRepositories(): PaperCompositionLifecycleRuntimeRepositories {
  const adminFlowRepositories = createPostgresAdminFlowRuntimeRepositories();

  return {
    paperRepository: createPostgresPaperDraftRepository(),
    paperAssetRepository: createPostgresPaperAssetRepository(),
    auditLogRepository: adminFlowRepositories.auditLogRepository,
  };
}

async function readRequestJson(request: Request): Promise<unknown> {
  try {
    return await request.json();
  } catch {
    return null;
  }
}

function isMultipartFormData(request: Request): boolean {
  return (
    request.headers.get("content-type")?.includes("multipart/form-data") ??
    false
  );
}

function readRequiredFormText(formData: FormData, key: string): string | null {
  const value = formData.get(key);

  if (typeof value !== "string") {
    return null;
  }

  const trimmedValue = value.trim();

  return trimmedValue.length > 0 ? trimmedValue : null;
}

function readPaperAttachmentUsage(
  value: string | null,
): PaperAttachmentUsage | null {
  if (
    value === null ||
    !paperAttachmentUsageValues.includes(value as PaperAttachmentUsage)
  ) {
    return null;
  }

  return value as PaperAttachmentUsage;
}

function readProfession(value: string | null): Profession | null {
  if (value === null || !professionValues.includes(value as Profession)) {
    return null;
  }

  return value as Profession;
}

function isUploadedFile(value: FormDataEntryValue | null): value is File {
  return (
    typeof value === "object" &&
    value !== null &&
    "name" in value &&
    typeof value.name === "string" &&
    "arrayBuffer" in value &&
    typeof value.arrayBuffer === "function" &&
    "type" in value &&
    typeof value.type === "string"
  );
}

async function readPaperAssetMutationInput(
  request: Request,
  storageRoot: string | undefined,
): Promise<unknown> {
  if (!isMultipartFormData(request)) {
    return readRequestJson(request);
  }

  const formData = await request.formData();
  const paperPublicId = readRequiredFormText(formData, "paperPublicId");
  const paperAttachmentUsage = readPaperAttachmentUsage(
    readRequiredFormText(formData, "paperAttachmentUsage"),
  );
  const profession = readProfession(
    readRequiredFormText(formData, "profession"),
  );
  const fileName = readRequiredFormText(formData, "fileName") ?? undefined;
  const file = formData.get("file");

  if (
    paperPublicId === null ||
    paperAttachmentUsage === null ||
    profession === null ||
    !isUploadedFile(file)
  ) {
    return null;
  }

  return storeLocalPaperAssetFile({
    file,
    fileName,
    paperAttachmentUsage,
    paperPublicId,
    profession,
    storageRoot,
  });
}

function readPaperQuery(request: Request): Record<string, unknown> {
  const searchParams = new URL(request.url).searchParams;

  return {
    page: searchParams.get("page") ?? undefined,
    pageSize: searchParams.get("pageSize") ?? undefined,
    sortBy: searchParams.get("sortBy") ?? undefined,
    sortOrder: searchParams.get("sortOrder") ?? undefined,
    profession: searchParams.get("profession") ?? undefined,
    level: searchParams.get("level") ?? undefined,
    subject: searchParams.get("subject") ?? undefined,
    paperStatus: searchParams.get("paperStatus") ?? undefined,
  };
}

function readPaperAssetQuery(request: Request): Record<string, unknown> {
  const searchParams = new URL(request.url).searchParams;

  return {
    page: searchParams.get("page") ?? undefined,
    pageSize: searchParams.get("pageSize") ?? undefined,
    sortBy: searchParams.get("sortBy") ?? undefined,
    sortOrder: searchParams.get("sortOrder") ?? undefined,
    paperPublicId: searchParams.get("paperPublicId") ?? undefined,
    paperAttachmentUsage: searchParams.get("paperAttachmentUsage") ?? undefined,
  };
}

function readRequestIp(request: Request): string | null {
  const forwardedFor = request.headers.get("x-forwarded-for");

  if (forwardedFor !== null) {
    return forwardedFor.split(",")[0]?.trim() || null;
  }

  return request.headers.get("x-real-ip");
}

async function appendAuditLog(
  repository: PaperLifecycleAuditLogRepository,
  request: Request,
  actor: ContentAdminActor,
  input: Omit<AppendAuditLogInput, "actorPublicId" | "actorRole" | "requestIp">,
): Promise<void> {
  await repository.appendAuditLog({
    actorPublicId: actor.publicId,
    actorRole: actor.roles[0],
    requestIp: readRequestIp(request),
    ...input,
  });
}

function extractNestedPublicId(
  response: ApiResponse<unknown>,
  objectKey: "paper" | "paperQuestion" | "paperAsset",
): string | null {
  if (
    response.code !== 0 ||
    typeof response.data !== "object" ||
    response.data === null ||
    !(objectKey in response.data)
  ) {
    return null;
  }

  const nestedValue = (response.data as Record<string, unknown>)[objectKey];

  if (
    typeof nestedValue !== "object" ||
    nestedValue === null ||
    !("publicId" in nestedValue)
  ) {
    return null;
  }

  const publicId = (nestedValue as { publicId?: unknown }).publicId;

  return typeof publicId === "string" ? publicId : null;
}

export function createPaperCompositionLifecycleRuntimeRouteHandlers(
  options: PaperCompositionLifecycleRuntimeOptions = {},
) {
  const repositories = options.repositories ?? createDefaultRepositories();
  const sessionService = options.sessionService ?? createLocalSessionRuntime();

  async function requireContentAdminActor(
    request: Request,
    auditInput?: Pick<
      AppendAuditLogInput,
      "actionType" | "targetResourceType" | "targetPublicId"
    >,
  ): Promise<ContentAdminActor | ApiResponse<null>> {
    const actor = await resolveAdminActor(request, sessionService);

    if (actor === null) {
      return adminSessionRequiredResponse;
    }

    if (!canManagePaper(actor)) {
      if (auditInput !== undefined) {
        await appendAuditLog(repositories.auditLogRepository, request, actor, {
          ...auditInput,
          resultStatus: "failed",
          metadataSummary: "redacted paper permission denial metadata",
        });
      }

      return adminPermissionDeniedResponse;
    }

    return actor;
  }

  function createPaperServiceForActor(actor: ContentAdminActor) {
    return createPaperDraftService(repositories.paperRepository, {
      mutationContext: { actorPublicId: actor.publicId },
    });
  }

  function createPaperAssetServiceForActor(actor: ContentAdminActor) {
    return createPaperAssetService(repositories.paperAssetRepository, {
      mutationContext: { actorPublicId: actor.publicId },
    });
  }

  async function auditPaperMutation(
    request: Request,
    actor: ContentAdminActor,
    actionType: string,
    targetResourceType: string,
    targetPublicId: string | null,
    response: ApiResponse<unknown>,
    objectKey: "paper" | "paperQuestion" | "paperAsset" = "paper",
  ): Promise<void> {
    await appendAuditLog(repositories.auditLogRepository, request, actor, {
      actionType,
      targetResourceType,
      targetPublicId:
        targetPublicId ?? extractNestedPublicId(response, objectKey),
      resultStatus: response.code === 0 ? "success" : "failed",
      metadataSummary: `redacted ${targetResourceType} mutation metadata`,
    });
  }

  return {
    papers: {
      collection: {
        async GET(request: Request): Promise<Response> {
          const actorOrError = await requireContentAdminActor(request);

          if ("code" in actorOrError) {
            return createJsonResponse(actorOrError);
          }

          const service = createPaperServiceForActor(actorOrError);

          return createJsonResponse(
            await service.listPapers(readPaperQuery(request)),
          );
        },
        async POST(request: Request): Promise<Response> {
          const actorOrError = await requireContentAdminActor(request, {
            actionType: "paper.create",
            targetResourceType: "paper",
            targetPublicId: null,
          });

          if ("code" in actorOrError) {
            return createJsonResponse(actorOrError);
          }

          const service = createPaperServiceForActor(actorOrError);
          const response = await service.createPaper(
            await readRequestJson(request),
          );

          await auditPaperMutation(
            request,
            actorOrError,
            "paper.create",
            "paper",
            null,
            response,
          );

          return createJsonResponse(response);
        },
      },
      detail: {
        async GET(request: Request, context: RouteContext): Promise<Response> {
          const actorOrError = await requireContentAdminActor(request);

          if ("code" in actorOrError) {
            return createJsonResponse(actorOrError);
          }

          const { publicId } = await context.params;
          const service = createPaperServiceForActor(actorOrError);

          return createJsonResponse(await service.getPaper(publicId));
        },
        async PATCH(
          request: Request,
          context: RouteContext,
        ): Promise<Response> {
          const { publicId } = await context.params;
          const actorOrError = await requireContentAdminActor(request, {
            actionType: "paper.update",
            targetResourceType: "paper",
            targetPublicId: publicId,
          });

          if ("code" in actorOrError) {
            return createJsonResponse(actorOrError);
          }

          const service = createPaperServiceForActor(actorOrError);
          const response = await service.updatePaper(
            publicId,
            await readRequestJson(request),
          );

          await auditPaperMutation(
            request,
            actorOrError,
            "paper.update",
            "paper",
            publicId,
            response,
          );

          return createJsonResponse(response);
        },
        async DELETE(
          request: Request,
          context: RouteContext,
        ): Promise<Response> {
          const { publicId } = await context.params;
          const actorOrError = await requireContentAdminActor(request, {
            actionType: "paper.delete",
            targetResourceType: "paper",
            targetPublicId: publicId,
          });

          if ("code" in actorOrError) {
            return createJsonResponse(actorOrError);
          }

          const service = createPaperServiceForActor(actorOrError);
          const response = await service.deletePaper(publicId);

          await auditPaperMutation(
            request,
            actorOrError,
            "paper.delete",
            "paper",
            publicId,
            response,
          );

          return createJsonResponse(response);
        },
      },
      questions: {
        async POST(request: Request, context: RouteContext): Promise<Response> {
          const { publicId } = await context.params;
          const actorOrError = await requireContentAdminActor(request, {
            actionType: "paper_question.add",
            targetResourceType: "paper_question",
            targetPublicId: publicId,
          });

          if ("code" in actorOrError) {
            return createJsonResponse(actorOrError);
          }

          const service = createPaperServiceForActor(actorOrError);
          const response = await service.addQuestionToDraftPaper(
            publicId,
            await readRequestJson(request),
          );

          await auditPaperMutation(
            request,
            actorOrError,
            "paper_question.add",
            "paper_question",
            null,
            response,
            "paperQuestion",
          );

          return createJsonResponse(response);
        },
        async PATCH(
          request: Request,
          context: PaperQuestionRouteContext,
        ): Promise<Response> {
          const { publicId, paperQuestionPublicId } = await context.params;
          const actorOrError = await requireContentAdminActor(request, {
            actionType: "paper_question.update",
            targetResourceType: "paper_question",
            targetPublicId: paperQuestionPublicId,
          });

          if ("code" in actorOrError) {
            return createJsonResponse(actorOrError);
          }

          const service = createPaperServiceForActor(actorOrError);
          const response = await service.updatePaperQuestion(
            publicId,
            paperQuestionPublicId,
            await readRequestJson(request),
          );

          await auditPaperMutation(
            request,
            actorOrError,
            "paper_question.update",
            "paper_question",
            paperQuestionPublicId,
            response,
            "paperQuestion",
          );

          return createJsonResponse(response);
        },
        async DELETE(
          request: Request,
          context: PaperQuestionRouteContext,
        ): Promise<Response> {
          const { publicId, paperQuestionPublicId } = await context.params;
          const actorOrError = await requireContentAdminActor(request, {
            actionType: "paper_question.remove",
            targetResourceType: "paper_question",
            targetPublicId: paperQuestionPublicId,
          });

          if ("code" in actorOrError) {
            return createJsonResponse(actorOrError);
          }

          const service = createPaperServiceForActor(actorOrError);
          const response = await service.removePaperQuestion(
            publicId,
            paperQuestionPublicId,
          );

          await auditPaperMutation(
            request,
            actorOrError,
            "paper_question.remove",
            "paper_question",
            paperQuestionPublicId,
            response,
          );

          return createJsonResponse(response);
        },
      },
      publish: {
        async POST(request: Request, context: RouteContext): Promise<Response> {
          const { publicId } = await context.params;
          const actorOrError = await requireContentAdminActor(request, {
            actionType: "paper.publish",
            targetResourceType: "paper",
            targetPublicId: publicId,
          });

          if ("code" in actorOrError) {
            return createJsonResponse(actorOrError);
          }

          const service = createPaperServiceForActor(actorOrError);
          const response = await service.publishPaper(publicId);

          await auditPaperMutation(
            request,
            actorOrError,
            "paper.publish",
            "paper",
            publicId,
            response,
          );

          return createJsonResponse(response);
        },
      },
      archive: {
        async POST(request: Request, context: RouteContext): Promise<Response> {
          const { publicId } = await context.params;
          const actorOrError = await requireContentAdminActor(request, {
            actionType: "paper.archive",
            targetResourceType: "paper",
            targetPublicId: publicId,
          });

          if ("code" in actorOrError) {
            return createJsonResponse(actorOrError);
          }

          const service = createPaperServiceForActor(actorOrError);
          const response = await service.archivePaper(publicId);

          await auditPaperMutation(
            request,
            actorOrError,
            "paper.archive",
            "paper",
            publicId,
            response,
          );

          return createJsonResponse(response);
        },
      },
      copy: {
        async POST(request: Request, context: RouteContext): Promise<Response> {
          const { publicId } = await context.params;
          const actorOrError = await requireContentAdminActor(request, {
            actionType: "paper.copy",
            targetResourceType: "paper",
            targetPublicId: publicId,
          });

          if ("code" in actorOrError) {
            return createJsonResponse(actorOrError);
          }

          const service = createPaperServiceForActor(actorOrError);
          const response = await service.copyPaper(publicId);

          await auditPaperMutation(
            request,
            actorOrError,
            "paper.copy",
            "paper",
            publicId,
            response,
          );

          return createJsonResponse(response);
        },
      },
    },
    paperAssets: {
      collection: {
        async GET(request: Request): Promise<Response> {
          const actorOrError = await requireContentAdminActor(request);

          if ("code" in actorOrError) {
            return createJsonResponse(actorOrError);
          }

          const service = createPaperAssetServiceForActor(actorOrError);

          return createJsonResponse(
            await service.listPaperAssets(readPaperAssetQuery(request)),
          );
        },
        async POST(request: Request): Promise<Response> {
          const actorOrError = await requireContentAdminActor(request, {
            actionType: "paper_asset.create",
            targetResourceType: "paper_asset",
            targetPublicId: null,
          });

          if ("code" in actorOrError) {
            return createJsonResponse(actorOrError);
          }

          const service = createPaperAssetServiceForActor(actorOrError);
          const response = await service.createPaperAsset(
            await readPaperAssetMutationInput(
              request,
              options.localPaperAssetStorageRoot,
            ),
          );

          await auditPaperMutation(
            request,
            actorOrError,
            "paper_asset.create",
            "paper_asset",
            null,
            response,
            "paperAsset",
          );

          return createJsonResponse(response);
        },
      },
      detail: {
        async GET(request: Request, context: RouteContext): Promise<Response> {
          const actorOrError = await requireContentAdminActor(request);

          if ("code" in actorOrError) {
            return createJsonResponse(actorOrError);
          }

          const { publicId } = await context.params;
          const service = createPaperAssetServiceForActor(actorOrError);

          return createJsonResponse(await service.getPaperAsset(publicId));
        },
        async DELETE(
          request: Request,
          context: RouteContext,
        ): Promise<Response> {
          const { publicId } = await context.params;
          const actorOrError = await requireContentAdminActor(request, {
            actionType: "paper_asset.delete",
            targetResourceType: "paper_asset",
            targetPublicId: publicId,
          });

          if ("code" in actorOrError) {
            return createJsonResponse(actorOrError);
          }

          const service = createPaperAssetServiceForActor(actorOrError);
          const response = await service.deletePaperAsset(publicId);

          await auditPaperMutation(
            request,
            actorOrError,
            "paper_asset.delete",
            "paper_asset",
            publicId,
            response,
            "paperAsset",
          );

          return createJsonResponse(response);
        },
      },
    },
  };
}
