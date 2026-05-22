import { createLocalSessionRuntime } from "../auth/local-session-runtime";
import type { ApiResponse } from "../contracts/api-response";
import {
  createPostgresMistakeBookRepository,
  type MistakeBookRepository,
  type MistakeBookRuntimeRepositoryOptions,
} from "../repositories/mistake-book-repository";
import {
  createMistakeBookRouteHandlers,
  type MistakeBookUserResolver,
} from "./mistake-book-route";
import { createMistakeBookService } from "./mistake-book-service";
import type { SessionService } from "./session-service";

export type StudentMistakeBookRuntimeOptions =
  MistakeBookRuntimeRepositoryOptions & {
    mistakeBookRepository?: MistakeBookRepository;
    sessionService?: Pick<SessionService, "getCurrentSession">;
  };

function isSuccessfulSessionResponse(
  response: Awaited<ReturnType<SessionService["getCurrentSession"]>>,
): response is ApiResponse<NonNullable<typeof response.data>> & {
  data: NonNullable<typeof response.data>;
} {
  return response.code === 0 && response.data !== null;
}

export function createStudentMistakeBookUserResolver(
  sessionService: Pick<SessionService, "getCurrentSession">,
): MistakeBookUserResolver {
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

export function createStudentMistakeBookRuntimeRouteHandlers(
  options: StudentMistakeBookRuntimeOptions = {},
) {
  const repository =
    options.mistakeBookRepository ??
    createPostgresMistakeBookRepository(options);
  const sessionService = options.sessionService ?? createLocalSessionRuntime();
  const clock = options.now === undefined ? undefined : { now: options.now };

  return createMistakeBookRouteHandlers(
    createMistakeBookService(repository, clock),
    createStudentMistakeBookUserResolver(sessionService),
  );
}
