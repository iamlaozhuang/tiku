import { createLocalSessionRuntime } from "../auth/local-session-runtime";
import type { ApiResponse } from "../contracts/api-response";
import {
  createPostgresStudentAuthorizationRedeemRuntimeRepositories,
  type StudentAuthorizationRedeemRuntimeRepositories,
  type StudentAuthorizationRedeemRuntimeRepositoryOptions,
} from "../repositories/student-authorization-redeem-runtime-repository";
import {
  createEffectiveAuthorizationRouteHandlers,
  type EffectiveAuthorizationUserResolver,
} from "./effective-authorization-route";
import { createEffectiveAuthorizationService } from "./effective-authorization-service";
import {
  createPersonalAuthRouteHandlers,
  createRedeemCodeRouteHandlers,
  type AuthorizationUserResolver,
} from "./redeem-code-route";
import { createRedeemCodeAuthorizationService } from "./redeem-code-authorization-service";
import type { SessionService } from "./session-service";
import { createRouteHandlersWithErrorEnvelope } from "./route-error-response";

export type StudentAuthorizationRedeemRuntimeOptions =
  StudentAuthorizationRedeemRuntimeRepositoryOptions &
    Partial<StudentAuthorizationRedeemRuntimeRepositories> & {
      repositories?: StudentAuthorizationRedeemRuntimeRepositories;
      sessionService?: Pick<SessionService, "getCurrentSession">;
      now?: () => Date;
    };

type StudentAuthorizationRedeemUserResolver =
  EffectiveAuthorizationUserResolver & AuthorizationUserResolver;

function isSuccessfulSessionResponse(
  response: Awaited<ReturnType<SessionService["getCurrentSession"]>>,
): response is ApiResponse<NonNullable<typeof response.data>> & {
  data: NonNullable<typeof response.data>;
} {
  return response.code === 0 && response.data !== null;
}

export function createStudentAuthorizationRedeemUserResolver(
  sessionService: Pick<SessionService, "getCurrentSession">,
): StudentAuthorizationRedeemUserResolver {
  return async (request) => {
    const sessionResponse = await sessionService.getCurrentSession({
      authorization: request.headers.get("authorization"),
    });

    if (!isSuccessfulSessionResponse(sessionResponse)) {
      return null;
    }

    if (sessionResponse.data.user.userType === null) {
      return null;
    }

    return {
      userPublicId: sessionResponse.data.user.publicId,
    };
  };
}

export function createStudentAuthorizationRedeemRuntimeRouteHandlers(
  options: StudentAuthorizationRedeemRuntimeOptions = {},
) {
  const repositories =
    options.repositories ??
    (options.effectiveAuthorizationRepository !== undefined &&
    options.redeemCodeAuthorizationRepository !== undefined
      ? {
          effectiveAuthorizationRepository:
            options.effectiveAuthorizationRepository,
          redeemCodeAuthorizationRepository:
            options.redeemCodeAuthorizationRepository,
        }
      : createPostgresStudentAuthorizationRedeemRuntimeRepositories(options));
  const sessionService = options.sessionService ?? createLocalSessionRuntime();
  const resolveUserContext =
    createStudentAuthorizationRedeemUserResolver(sessionService);
  const clock = options.now === undefined ? undefined : { now: options.now };

  return createRouteHandlersWithErrorEnvelope({
    authorizations: createEffectiveAuthorizationRouteHandlers(
      createEffectiveAuthorizationService(
        repositories.effectiveAuthorizationRepository,
        clock,
      ),
      resolveUserContext,
    ),
    personalAuths: createPersonalAuthRouteHandlers(
      createRedeemCodeAuthorizationService(
        repositories.redeemCodeAuthorizationRepository,
        clock,
      ),
      resolveUserContext,
    ),
    redeemCodes: {
      redeem: createRedeemCodeRouteHandlers(
        createRedeemCodeAuthorizationService(
          repositories.redeemCodeAuthorizationRepository,
          clock,
        ),
        resolveUserContext,
      ),
    },
  });
}
