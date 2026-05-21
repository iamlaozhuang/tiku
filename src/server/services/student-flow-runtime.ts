import { createLocalSessionRuntime } from "../auth/local-session-runtime";
import type { ApiResponse } from "../contracts/api-response";
import type { StudentPaperRepository } from "../repositories/student-paper-repository";
import type { PracticeRepository } from "../repositories/practice-repository";
import type { MockExamRepository } from "../repositories/mock-exam-repository";
import type { ExamReportRepository } from "../repositories/exam-report-repository";
import {
  createPostgresStudentFlowRepositories,
  type StudentFlowRuntimeRepositoryOptions,
} from "../repositories/student-flow-runtime-repository";
import {
  createExamReportRouteHandlers,
  type ExamReportUserResolver,
} from "./exam-report-route";
import {
  createExamReportService,
  type ExamReportPublicIdFactory,
} from "./exam-report-service";
import {
  createMockExamRouteHandlers,
  type MockExamUserResolver,
} from "./mock-exam-route";
import {
  createMockExamService,
  type MockExamPublicIdFactory,
} from "./mock-exam-service";
import {
  createPracticeRouteHandlers,
  type PracticeUserResolver,
} from "./practice-route";
import {
  createPracticeService,
  type PracticePublicIdFactory,
} from "./practice-service";
import type { SessionService } from "./session-service";
import {
  createStudentPaperRouteHandlers,
  type StudentPaperUserResolver,
} from "./student-paper-route";
import { createStudentPaperService } from "./student-paper-service";

type StudentFlowPublicIdPrefix =
  | Parameters<PracticePublicIdFactory["createPublicId"]>[0]
  | Parameters<MockExamPublicIdFactory["createPublicId"]>[0]
  | Parameters<ExamReportPublicIdFactory["createPublicId"]>[0];

export type StudentFlowRuntimeOptions = StudentFlowRuntimeRepositoryOptions & {
  sessionService?: Pick<SessionService, "getCurrentSession">;
  studentPaperRepository?: StudentPaperRepository;
  practiceRepository?: PracticeRepository;
  mockExamRepository?: MockExamRepository;
  examReportRepository?: ExamReportRepository;
  createPublicId?: (prefix: StudentFlowPublicIdPrefix) => string;
};

type StudentFlowUserResolver = StudentPaperUserResolver &
  PracticeUserResolver &
  MockExamUserResolver &
  ExamReportUserResolver;

function createDefaultPublicId(prefix: StudentFlowPublicIdPrefix): string {
  return `${prefix}_${crypto.randomUUID()}`;
}

function isSuccessfulSessionResponse(
  response: Awaited<ReturnType<SessionService["getCurrentSession"]>>,
): response is ApiResponse<NonNullable<typeof response.data>> & {
  data: NonNullable<typeof response.data>;
} {
  return response.code === 0 && response.data !== null;
}

export function createStudentFlowUserResolver(
  sessionService: Pick<SessionService, "getCurrentSession">,
): StudentFlowUserResolver {
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

export function createStudentFlowRuntimeRouteHandlers(
  options: StudentFlowRuntimeOptions = {},
) {
  const repositories =
    options.studentPaperRepository !== undefined &&
    options.practiceRepository !== undefined &&
    options.mockExamRepository !== undefined &&
    options.examReportRepository !== undefined
      ? {
          studentPaperRepository: options.studentPaperRepository,
          practiceRepository: options.practiceRepository,
          mockExamRepository: options.mockExamRepository,
          examReportRepository: options.examReportRepository,
        }
      : createPostgresStudentFlowRepositories(options);
  const sessionService = options.sessionService ?? createLocalSessionRuntime();
  const resolveUserContext = createStudentFlowUserResolver(sessionService);
  const createPublicId = options.createPublicId ?? createDefaultPublicId;
  const clock = options.now === undefined ? undefined : { now: options.now };

  return {
    studentPapers: createStudentPaperRouteHandlers(
      createStudentPaperService(repositories.studentPaperRepository),
      resolveUserContext,
    ),
    practices: createPracticeRouteHandlers(
      createPracticeService(repositories.practiceRepository, clock, {
        createPublicId: (prefix) => createPublicId(prefix),
      }),
      resolveUserContext,
    ),
    mockExams: createMockExamRouteHandlers(
      createMockExamService(repositories.mockExamRepository, clock, {
        createPublicId: (prefix) => createPublicId(prefix),
      }),
      resolveUserContext,
    ),
    examReports: createExamReportRouteHandlers(
      createExamReportService(repositories.examReportRepository, clock, {
        createPublicId: (prefix) => createPublicId(prefix),
      }),
      resolveUserContext,
    ),
  };
}
