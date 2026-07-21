import { createContentImageRuntimeRouteHandlers } from "@/server/services/content-image-runtime";

const handlers = createContentImageRuntimeRouteHandlers();

export const POST = handlers.collection.POST;
