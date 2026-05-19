import { createUnavailablePracticeService } from "@/server/services/practice-service";
import {
  createPracticeRouteHandlers,
  createUnavailablePracticeUserResolver,
} from "@/server/services/practice-route";

const practiceRouteHandlers = createPracticeRouteHandlers(
  createUnavailablePracticeService(),
  createUnavailablePracticeUserResolver(),
);

const responseContract = {
  code: 401001,
  message: "User session is required.",
  data: null,
};

void responseContract;

export const POST = practiceRouteHandlers.answers.POST;
