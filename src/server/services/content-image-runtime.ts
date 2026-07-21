import { createLocalSessionRuntime } from "../auth/local-session-runtime";
import { getRequestAuthorization } from "../auth/session-cookie";
import type { AuthContextDto } from "../contracts/auth-contract";
import type { ApiResponse } from "../contracts/api-response";
import { createPostgresContentImageRepository } from "../repositories/content-image-repository";
import { normalizeContentImageUploadInput } from "../validators/content-image";
import {
  createContentImageService,
  type ContentImageService,
} from "./content-image-service";
import { prepareLocalContentImageFile } from "./local-content-image-storage";
import type { SessionService } from "./session-service";

type RouteContext = { params: Promise<{ publicId: string }> };
type SessionReader = Pick<SessionService, "getCurrentSession">;

export type ContentImageRuntimeOptions = {
  sessionService?: SessionReader;
  contentImageService?: ContentImageService;
};

function jsonError(status: number, code: number, message: string): Response {
  return Response.json({ code, message, data: null }, { status });
}

async function readSession(
  request: Request,
  sessionService: SessionReader,
): Promise<ApiResponse<AuthContextDto | null>> {
  return sessionService.getCurrentSession({
    authorization: getRequestAuthorization(request),
  });
}

function hasContentAdminRole(session: AuthContextDto): boolean {
  const roles = session.user.adminRoles ?? [];
  return roles.includes("super_admin") || roles.includes("content_admin");
}

function readRequestIp(request: Request): string | null {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip")
  );
}

export function createContentImageRuntimeRouteHandlers(
  options: ContentImageRuntimeOptions = {},
) {
  const sessionService = options.sessionService ?? createLocalSessionRuntime();

  return {
    collection: {
      async POST(request: Request): Promise<Response> {
        const session = await readSession(request, sessionService);
        if (session.code !== 0 || session.data === null) {
          return jsonError(401, 401009, "User session is required.");
        }
        if (
          !hasContentAdminRole(session.data) ||
          typeof session.data.user.adminPublicId !== "string"
        ) {
          return jsonError(
            403,
            403209,
            "Content image upload permission denied.",
          );
        }

        let formData: FormData;
        try {
          formData = await request.formData();
        } catch {
          return jsonError(422, 422209, "Invalid content_image input.");
        }
        const normalized = normalizeContentImageUploadInput({
          commandPublicId: formData.get("commandPublicId"),
          profession: formData.get("profession"),
          file: formData.get("file"),
        });
        if (!normalized.success) {
          return jsonError(422, 422209, normalized.message);
        }
        let preparedFile;
        try {
          preparedFile = await prepareLocalContentImageFile({
            file: normalized.value.file,
            profession: normalized.value.profession,
          });
        } catch {
          return jsonError(422, 422209, "Invalid content_image input.");
        }
        const adminPublicId = session.data.user.adminPublicId;
        const service =
          options.contentImageService ??
          createContentImageService(createPostgresContentImageRepository(), {
            mutationContext: {
              actorPublicId: adminPublicId,
              auditLog: {
                actorRole:
                  (session.data.user.adminRoles ?? [])[0] ?? "content_admin",
                actionType: "content_image.create",
                metadataSummary: "redacted content_image upload metadata",
                requestIp: readRequestIp(request),
              },
            },
          });
        const response = await service.uploadContentImage({
          commandPublicId: normalized.value.commandPublicId,
          preparedFile,
        });
        const status =
          response.code === 0
            ? 200
            : response.code === 422209
              ? 422
              : response.code === 409209
                ? 409
                : 500;
        return Response.json(response, { status });
      },
    },
    detail: {
      async GET(request: Request, context: RouteContext): Promise<Response> {
        const session = await readSession(request, sessionService);
        if (session.code !== 0 || session.data === null) {
          return jsonError(401, 401009, "User session is required.");
        }
        const { publicId } = await context.params;
        const service =
          options.contentImageService ??
          createContentImageService(createPostgresContentImageRepository());
        const result = await service.readContentImage(publicId);
        if (result.status === "not_found") {
          return jsonError(404, 404209, "Content image does not exist.");
        }
        if (result.status === "unavailable") {
          return jsonError(503, 503209, "Content image bytes are unavailable.");
        }
        return new Response(new Uint8Array(result.bytes), {
          status: 200,
          headers: {
            "content-type": result.contentType,
            "cache-control": "private, no-store",
            "x-content-type-options": "nosniff",
          },
        });
      },
    },
  };
}
