import { createUnavailableMistakeBookService } from "@/server/services/mistake-book-service";
import {
  createMistakeBookRouteHandlers,
  createUnavailableMistakeBookUserResolver,
} from "@/server/services/mistake-book-route";

const mistakeBookRouteHandlers = createMistakeBookRouteHandlers(
  createUnavailableMistakeBookService(),
  createUnavailableMistakeBookUserResolver(),
);

const responseContract = {
  code: 401001,
  message: "User session is required.",
  data: null,
};

void responseContract;

export const POST = mistakeBookRouteHandlers.remove.POST;
