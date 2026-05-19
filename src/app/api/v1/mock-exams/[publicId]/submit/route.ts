import { createUnavailableMockExamService } from "@/server/services/mock-exam-service";
import {
  createMockExamRouteHandlers,
  createUnavailableMockExamUserResolver,
} from "@/server/services/mock-exam-route";

const mockExamRouteHandlers = createMockExamRouteHandlers(
  createUnavailableMockExamService(),
  createUnavailableMockExamUserResolver(),
);

const responseContract = {
  code: 401001,
  message: "User session is required.",
  data: null,
};

void responseContract;

export const POST = mockExamRouteHandlers.submit.POST;
